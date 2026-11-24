import { release, ticksOf } from '../body-state.ts';
import { cantinasOf, padSpot } from '../cantina.ts';
import { landingSpot } from '../defeat.ts';
import { emitEffect, heldBy } from '../effects.ts';
import { heartsOut, refillHearts } from '../hearts.ts';
import { carriedBy, prizeOf, returnPrize } from '../heist.ts';
import { alertLevel, lowerAlert } from '../npc/alert.ts';
import { popOrb } from '../power-orbs.ts';
import { powerOf } from '../powers.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { makeLoose, weaponOf } from '../weapons.ts';
import { findEntity } from '../world.ts';

declare module '../types.ts' {
  interface World {
    /**
     * Step 21, hearts: a game over on its way. `ticks` left of its beat (the
     * fall seen) and the place file (content/defeat/) whose `gameOver` says
     * where everyone goes, or null for content/hearts.json's. null: none.
     * Written only by the server's world; set to null, never deleted.
     */
    gameOver?: { ticks: number; place: string | null } | null;
  }
  interface EventMap {
    /** Step 21, hearts: every party member is out of hearts; after `beat` ticks everyone playing goes to `room`. */
    'game-over-coming': { place: string | null; room: string; beat: number };
    /**
     * Step 21, hearts: the game over. Every player of this world is in `room`,
     * the party's hearts full. The hook for a stage's own start-over (Step
     * 22): a system after this one (order above 588) acts on it.
     */
    'game-over': { place: string | null; room: string; players: string[] };
    /** Step 21, hearts: walking into the cantina gave the party back its hearts (DRAFT). */
    'hearts-refilled': { entity: string; player: string | null; room: string };
  }
}

/**
 * Step 21, hearts (the owner, 2026-11-24: "Once all heros in the party are
 * out of hearts, that's a game over (back to cantina)"; docs/mechanisms/
 * defeat.md, "Hearts"): when no party member has a heart left, a short beat
 * (the last fall is seen), then every player of this world is in the game
 * over's room with the whole party's hearts back. A carried prize goes back
 * on its stand (returnPrize, `prize-returned`), a held power and a held
 * weapon (Step 23) are left where their holder stood, alerts end and waves walk off. What was found for good
 * stays found: pieces, levels, sources, recruits, the Hall. Where a game
 * over sends you is data: the place file of the room the last heart was lost
 * in (`gameOver`), else content/hearts.json's (the cantina).
 *
 * Also (DRAFT, the brief's open question): a played hero in a cantina room
 * gives the party back every heart (`hearts-refilled`).
 *
 * INTENT (CLAUDE.md, "There is always a way out"; "Getting caught opens
 * play": a game over is never a reload): nobody is held. The beat is shorter
 * than the fall itself (world.flattenTime), and on arriving everyone is free
 * at once. The page's GAME OVER card never takes input (draw/game-over.ts).
 * INTENT (cantina-chase.ts): the server's world only (`World.taken` is set
 * only in a page's): a page is told by effects and the snapshot.
 * Runs after heart-lose (580), heart-out (582) and the seize (585), before
 * the throw (590) and the prize banking (607).
 */
const system: System = {
  id: 'heart-game-over',
  order: 588,
  run(ctx) {
    const { world, content } = ctx;
    const h = content.hearts;
    if (!h?.on || world.taken !== undefined) return;
    const players = world.entities.filter((e) => e.player !== null);
    const go = world.gameOver ?? null;
    if (!go) {
      for (const e of players) {
        if (!content.cantina?.[e.room] && !Object.values(content.cantina ?? {}).some((c) => c.room === e.room)) continue;
        if (!world.heartsLost || !Object.values(world.heartsLost).some((n) => n > 0)) break;
        refillHearts(world);
        ctx.emit('hearts-refilled', { entity: e.id, player: e.player, room: e.room });
        break;
      }
      if (players.length === 0 || !allOut(ctx)) return;
      const last = [...ctx.events].reverse().find((ev) => ev.type === 'heart-lost');
      const at = (last && last.type === 'heart-lost' ? findEntity(world, last.entity) : undefined) ?? players[0]!;
      const place = placeOf(ctx, at.room);
      const beat = Math.max(1, ticksOf(h.gameOver.beat));
      world.gameOver = { ticks: beat, place };
      // The game over is what losing is now: nobody is also stood over and thrown out.
      for (const e of players) delete e.c.seized;
      ctx.emit('game-over-coming', { place, room: target(ctx, place).room, beat });
      return;
    }
    for (const e of players) delete e.c.seized;
    go.ticks--;
    if (go.ticks > 0) {
      world.gameOver = { ...go };
      return;
    }
    world.gameOver = null;
    const to = target(ctx, go.place);
    const moved: string[] = [];
    players.forEach((e, i) => {
      dropEverything(ctx, e);
      const spot = spotIn(ctx, to, e, i);
      if (!spot) return;
      emitEffect(ctx, e, { kind: 'move', room: spot.room, x: spot.x, y: spot.y });
      // Free on arriving: a flat hero gets up on the next tick.
      if (e.c.flattened) emitEffect(ctx, e, { kind: 'flatten', ticks: 1, by: null });
      e.onGround = false;
      moved.push(e.player!);
    });
    refillHearts(world);
    endAlarms(ctx);
    ctx.emit('game-over', { place: go.place, room: to.room, players: moved });
  },
};
export default system;

/** Whether every member of the party as it stands has no hearts left. */
function allOut(ctx: StepContext): boolean {
  const members = ctx.world.party ?? ctx.content.party.members;
  return members.length > 0 && members.every((m) => heartsOut(ctx.world, ctx.content, m));
}

/** The place file covering a room whose `gameOver` is set, whether or not its throw is on. */
function placeOf(ctx: StepContext, room: string): string | null {
  const d = Object.keys(ctx.content.defeat ?? {})
    .sort()
    .map((id) => ctx.content.defeat[id]!)
    .find((x) => x.gameOver && x.rooms.includes(room));
  return d?.id ?? null;
}

/** Where a game over from `place` sends everyone. */
function target(ctx: StepContext, place: string | null): { room: string; door: string | null; tile: [number, number] | null } {
  const g = (place ? ctx.content.defeat?.[place]?.gameOver : undefined) ?? ctx.content.hearts.gameOver;
  return { room: g.room, door: g.door ?? null, tile: g.tile ?? null };
}

/** The `i`-th player's spot: a cantina's pads in turn, else the door or tile given (as a thrown-out hero lands), else the room's spawns in turn. */
function spotIn(ctx: StepContext, to: ReturnType<typeof target>, e: Entity, i: number): { room: string; x: number; y: number } | undefined {
  const { content, world } = ctx;
  const room = content.rooms[to.room];
  if (!room) return undefined;
  if (to.door === null && to.tile === null) {
    const cantina = Object.values(content.cantina ?? {}).find((c) => c.room === room.id);
    if (cantina) {
      const first = cantinasOf(world, content).find((c) => c.file.id === cantina.id)?.state.pad ?? 0;
      return { room: room.id, ...padSpot(content, cantina, first + i, e.kind) };
    }
    const s = room.spawns[i % Math.max(1, room.spawns.length)];
    const box = content.characters[e.kind]?.box;
    if (!s || !box) return undefined;
    return { room: room.id, x: s.tx * room.tile + (room.tile - box.w) / 2, y: (s.ty + 1) * room.tile - box.h };
  }
  return landingSpot(world, content, { lands: { room: room.id, door: to.door, tile: to.tile } } as Parameters<typeof landingSpot>[2], e.kind);
}

/** Lets go of everything: what it carries or what holds it, a prize (back on its stand), a power and a weapon (left where it stands). */
function dropEverything(ctx: StepContext, e: Entity): void {
  const { world, content } = ctx;
  const carried = e.c.carrying ? findEntity(world, e.c.carrying.id) : undefined;
  if (carried && heldBy(carried) === e.id) release(ctx, carried, 'dropped');
  delete e.c.carrying;
  if (heldBy(e) !== null) release(ctx, e, 'dropped');
  const thing = carriedBy(world, e.id);
  if (thing !== undefined && returnPrize(world, thing) !== undefined) {
    ctx.emit('prize-returned', { heist: prizeOf(content, thing)?.heist.id ?? '', thing, by: e.id });
  }
  const p = powerOf(content, e);
  if (p) {
    const src = e.c.power?.src;
    emitEffect(ctx, e, { kind: 'power', power: null });
    popOrb(ctx, p, e, null, src);
  }
  const w = weaponOf(content, e);
  if (w) {
    const src = e.c.weapon?.src;
    const box = content.characters[e.kind]?.box;
    emitEffect(ctx, e, { kind: 'weapon', weapon: null });
    makeLoose(ctx, w, e.room, e.x + (box?.w ?? 0) / 2, e.y + (box?.h ?? 0), { from: e.id, ...(src ? { src } : {}) });
  }
  delete e.c.flying;
  delete e.c.beat;
  delete e.c.seized;
  delete e.c.falls;
}

/** Every alert down to none, and every wave walking off (their own rules take them out). */
function endAlarms(ctx: StepContext): void {
  const { world } = ctx;
  for (const a of world.entities.filter((x) => x.id.startsWith('~alert:'))) {
    const area = a.id.slice('~alert:'.length);
    for (let n = alertLevel(world, area); n > 0; n--) lowerAlert(ctx, area);
  }
  for (const e of world.entities) {
    if (e.c.outpostWave) e.c.outpostWave.going = true;
    if (e.c.signaler) e.c.signaler.queued = 0;
    const c = e.c.outpostCall;
    if (c && c.phase !== 'idle') {
      c.phase = 'idle';
      c.progress = 0;
    }
  }
}

