import { boxInSolid, firstFreeMember } from '../party.ts';
import { emitEffect } from '../effects.ts';
import { isPageWorld, machineOf } from '../machines.ts';
import type { MachineState } from '../machines.ts';
import { isOut } from '../npc/state.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { useHere } from '../use.ts';

/** DRAFT: the speed a blow throws a rider out at (up, and away from the striker), pixels per second. */
const THROWN_UP = 260;
const THROWN_AWAY = 180;

function insertSorted(entities: Entity[], e: Entity): void {
  let i = 0;
  while (i < entities.length && entities[i]!.id < e.id) i++;
  entities.splice(i, 0, e);
}

/** Where a hero of box `hb` stands beside machine body `e` (box `mb`): behind it, else in front, else on top, else where the machine is. */
function besideSpot(ctx: StepContext, e: Entity, mb: { w: number; h: number }, hb: { w: number; h: number }): { x: number; y: number } {
  const room = ctx.content.rooms[e.room];
  const floor = e.y + mb.h - hb.h;
  const behind = e.facing > 0 ? e.x - hb.w : e.x + mb.w;
  const ahead = e.facing > 0 ? e.x + mb.w : e.x - hb.w;
  const tries = [
    { x: behind, y: floor },
    { x: ahead, y: floor },
    { x: e.x + (mb.w - hb.w) / 2, y: e.y - hb.h },
  ];
  return (room && tries.find((s) => !boxInSolid(room, s.x, s.y, hb.w, hb.h, ctx.world))) ?? { x: e.x + (mb.w - hb.w) / 2, y: floor };
}

/** Puts the machine `id` back in the world as a standing body where `from` says, rolling at (vx, vy). `clear`: a body it must not ram until they are apart. */
function standMachine(ctx: StepContext, id: string, kind: string, from: { room: string; x: number; y: number; facing: 1 | -1 }, vx: number, vy: number, onGround: boolean, clear: string[]): void {
  if (ctx.world.entities.some((o) => o.id === id)) return;
  insertSorted(ctx.world.entities, {
    id,
    kind,
    player: null,
    room: from.room,
    x: from.x,
    y: from.y,
    vx,
    vy,
    facing: from.facing,
    onGround,
    c: { seat: { driver: null }, ram: { met: [...clear], pvx: vx } },
  });
}

/**
 * Step 20 push 2, the seat (docs/mechanisms/machines.md):
 * - A standing machine first seen with a person standing on it has that
 *   person at the reins (`c.seat.driver`); machine-driven keeps him there.
 *   He is out of the seat once he is held (a hero's ordinary Grab pulls him
 *   out into their hands), knocked flying or flattened, or gone.
 * - **In:** a fresh press of Use whose answer is `get-in` (src/sim/use/get-in.ts):
 *   the hero's body becomes the machine (a `become` effect, so their own page
 *   drives it with no lag), the standing machine leaves the world while
 *   ridden, and World.machines records the rider and the hero they went in as.
 * - **Out:** a fresh press of Jump at any moment and any speed; a blow at or
 *   above the machine's `throwRider` (thrown, flying); the machine wrecked;
 *   or the rider's body gone from the world or no longer the machine (a
 *   reconnect, a kept game loaded). The rider is the hero they went in as,
 *   beside it; the machine stands again where it was, rolling on with the
 *   speed it had.
 *
 * INTENT: there is always a way out. Jump is never refused while riding,
 * whatever the machine is doing; a wreck puts its rider out; a rider whose
 * body left the world never leaves the machine missing. Do not add a state
 * that holds a rider in the seat.
 * INTENT: the server's alone. In a page's own world it does nothing: the
 * page learns of every change by `become` effects and the snapshot.
 *
 * Order 120: after verbs (100), so this tick's `hit` events are in, and
 * before physics (500), so a machine stood again moves this tick.
 */
const system: System = {
  id: 'machine-seat',
  order: 120,
  run(ctx) {
    const { world, content } = ctx;
    if (isPageWorld(world) || Object.keys(content.machines ?? {}).length === 0) return;

    // The seat of each standing machine.
    for (const m of world.entities) {
      if (m.player !== null || !machineOf(content, m.kind)) continue;
      const box = content.characters[m.kind]!.box;
      if (!m.c.seat) {
        const on = world.entities.find((p) => {
          if (p === m || p.player !== null || p.c.npc === undefined || p.room !== m.room || isOut(p)) return false;
          const pb = content.characters[p.kind]?.box;
          return !!pb && p.x < m.x + box.w && p.x + pb.w > m.x && p.y < m.y + box.h && p.y + pb.h > m.y - 4;
        });
        m.c.seat = { driver: on ? on.id : null };
      }
      const id = m.c.seat.driver;
      if (id !== null) {
        const d = world.entities.find((p) => p.id === id);
        if (!d || d.room !== m.room || isOut(d) || d.c.flying) {
          m.c.seat.driver = null;
          delete m.c.chase;
        }
      }
    }

    // Getting in.
    for (const e of [...world.entities]) {
      if (e.player === null || machineOf(content, e.kind)) continue;
      const keys = (e.c.seatKeys ??= { use: false, jump: false });
      const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
      const fresh = down && !keys.use;
      keys.use = down;
      if (!fresh) continue;
      const answer = useHere(world, content, e);
      if (answer?.entry !== 'get-in' || !answer.target) continue;
      const m = world.entities.find((o) => o.id === answer.target);
      if (!m) continue;
      const hero = e.kind;
      emitEffect(ctx, e, { kind: 'become', to: m.kind, x: m.x, y: m.y });
      e.facing = m.facing;
      if (m.vx !== 0 || m.vy !== 0) emitEffect(ctx, e, { kind: 'push', vx: m.vx, vy: m.vy });
      const all = (world.machines ??= {});
      const s: MachineState = (all[m.id] ??= { wear: 0, wrecked: false });
      s.rider = e.id;
      s.hero = hero;
      s.kind = m.kind;
      s.at = { room: m.room, x: m.x, y: m.y, facing: m.facing };
      world.entities.splice(world.entities.indexOf(m), 1);
      // A press of Jump held from before does not count as a fresh one.
      e.c.seatKeys = { use: true, jump: ctx.inputs[e.player]?.held.includes('jump') ?? false };
      ctx.emit('machine-taken', { machine: m.id, by: e.id, player: e.player, hero });
    }

    // Riding, and getting out.
    for (const [id, s] of Object.entries(world.machines ?? {})) {
      if (s.rider === undefined) continue;
      const e = world.entities.find((o) => o.id === s.rider);
      const def = Object.values(content.machines).find((d) => d.character === e?.kind);
      if (!e || !def) {
        // The rider's body is gone or is no longer the machine: the machine stands where it last was.
        const kind = s.kind && machineOf(content, s.kind) ? s.kind : undefined;
        if (s.at && kind && content.rooms[s.at.room]) standMachine(ctx, id, kind, s.at, 0, 0, true, e ? [e.id] : []);
        ctx.emit('machine-left', { machine: id, by: s.rider, player: e?.player ?? null, how: 'gone' });
        delete s.rider;
        delete s.hero;
        continue;
      }
      s.at = { room: e.room, x: e.x, y: e.y, facing: e.facing };
      const input = e.player !== null ? ctx.inputs[e.player] : undefined;
      const keys = (e.c.seatKeys ??= { use: false, jump: false });
      const jumpDown = input?.held.includes('jump') ?? false;
      const jumped = jumpDown && !keys.jump;
      keys.jump = jumpDown;
      keys.use = input?.held.includes('interact') ?? false;
      let how: 'jumped' | 'thrown' | 'wrecked' | null = jumped ? 'jumped' : s.wrecked ? 'wrecked' : null;
      let by: Entity | undefined;
      if (def.throwRider !== undefined) {
        for (const ev of ctx.events) {
          if (ev.type !== 'hit' || ev.target !== e.id) continue;
          const striker = world.entities.find((o) => o.id === ev.by);
          // A friend's blow never throws a friend out (player on player).
          if (!striker || striker.player !== null) continue;
          const strength = content.tuning.characters[content.characters[striker.kind]?.tuning ?? '']?.attackStrength ?? 0;
          if (strength >= def.throwRider) {
            how = 'thrown';
            by = striker;
          }
        }
      }
      if (!how) continue;
      // The hero they went in as; a record without one (it cannot happen today) falls back to the first free member, so nobody stays a machine.
      const hero = s.hero && content.characters[s.hero] ? s.hero : firstFreeMember(world, content);
      const mb = content.characters[e.kind]!.box;
      const hb = hero ? content.characters[hero]!.box : undefined;
      const [vx, vy, ground] = [e.vx, e.vy, e.onGround];
      const from = { room: e.room, x: e.x, y: e.y, facing: e.facing };
      delete s.rider;
      delete s.hero;
      if (hero && hb) {
        const spot = besideSpot(ctx, e, mb, hb);
        emitEffect(ctx, e, { kind: 'become', to: hero, x: spot.x, y: spot.y });
        if (how === 'thrown' && by) {
          const away = e.x + mb.w / 2 >= by.x ? 1 : -1;
          // The blow's own held beat would hand back the blow's (small) speed on the machine's weight when it ends: the throw replaces it.
          delete e.c.beat;
          emitEffect(ctx, e, { kind: 'push', vx: away * THROWN_AWAY, vy: -THROWN_UP, fly: { by: by.id, met: [by.id] } });
          e.onGround = false;
        }
      }
      // Stood again only once the rider's body is no longer it (become applied above).
      standMachine(ctx, id, def.character, from, vx, vy, ground, [e.id]);
      ctx.emit('machine-left', { machine: id, by: e.id, player: e.player, how });
    }
  },
};
export default system;
