// Step 21 (risk; docs/mechanisms/defeat.md): the shared rules of being
// beaten in a bad guys' place. A helper, not a registry file, like
// body-state.ts: the systems are src/sim/systems/defeat-*.ts.
import type { Content } from '../content/types.ts';
import type { Defeat } from '../content/kinds/defeat.ts';
import { canAct } from './body-state.ts';
import { alertLevel } from './npc/alert.ts';
import { isOut } from './npc/state.ts';
import { boxInSolid } from './party.ts';
import type { Entity, World } from './types.ts';

declare module './types.ts' {
  interface Components {
    /**
     * Step 21: on a beaten played hero, while a person of a place stands over
     * them: who (`by`), which place's file (`place`), and ticks left before
     * the throw. Written by the server's world only (a page's world holds no
     * bandit). Read with a default: absent is "not seized" (old saves).
     */
    seized?: { by: string; place: string; ticks: number };
    /**
     * Step 21: on a played hero, the ticks they were knocked flat in a place
     * (`place`), newest last, kept for the place's `window`. Read with a
     * default: absent is none. Cleared by a throw-out. The HUD's condition
     * reads how many there are (push 3).
     */
    falls?: { place: string; ticks: number[] };
  }
  interface EventMap {
    /** Step 21: a person of the place stands over a beaten hero; the throw comes after the place's beat. */
    seized: { entity: string; player: string | null; by: string; place: string };
    /** Step 21: a played hero was knocked flat in a place; `falls` counts this one, `downs` is the place's limit. */
    fall: { entity: string; player: string | null; place: string; falls: number; downs: number };
    /** Step 21: a played body hit the one standing over them: no throw, the hero gets up where they lie. */
    'seize-stopped': { entity: string; player: string | null; by: string; place: string; stoppedBy: string };
    /** Step 21: thrown out of a place: `from` the room they were beaten in, `to` the room they landed in. */
    'thrown-out': { entity: string; player: string | null; place: string; from: string; to: string };
  }
}

/** The place file (on) covering a room now: the first by id whose rooms include it and whose alert condition holds. */
export function placeAt(world: World, content: Content, room: string): Defeat | undefined {
  for (const id of Object.keys(content.defeat ?? {}).sort()) {
    const d = content.defeat[id]!;
    if (!d.on || !d.rooms.includes(room)) continue;
    if (d.alertAbove !== null && alertLevel(world, room) <= d.alertAbove) continue;
    return d;
  }
  return undefined;
}

/** Whether `who` is a person of the place standing on their own feet within reach of `hero`. */
export function canSeize(content: Content, d: Defeat, who: Entity, hero: Entity): boolean {
  if (who.player !== null || who.room !== hero.room || !who.c.npc || !d.seizers.includes(who.c.npc.kind)) return false;
  if (isOut(who) || !canAct(who) || !who.onGround) return false;
  const a = content.characters[who.kind]?.box;
  const b = content.characters[hero.kind]?.box;
  if (!a || !b) return false;
  const gap = Math.max(who.x - (hero.x + b.w), hero.x - (who.x + a.w), 0);
  const rise = Math.max(who.y - (hero.y + b.h), hero.y - (who.y + a.h), 0);
  return gap <= d.reach && rise <= d.reach;
}

/**
 * Where a thrown-out hero of kind `kind` lands (top-left of its box): in a
 * door, centred in it with its feet on the door's floor; on a tile, centred
 * on it with its feet on its floor. Undefined when that spot is inside a
 * wall: then nobody is thrown (there is always a way out).
 */
export function landingSpot(world: World, content: Content, d: Defeat, kind: string): { room: string; x: number; y: number } | undefined {
  const room = content.rooms[d.lands.room];
  const box = content.characters[kind]?.box;
  if (!room || !box) return undefined;
  const T = room.tile;
  let cx: number;
  let floor: number;
  if (d.lands.tile) {
    cx = (d.lands.tile[0] + 0.5) * T;
    floor = (d.lands.tile[1] + 1) * T;
  } else {
    const door = room.doors.find((x) => x.id === d.lands.door);
    if (!door) return undefined;
    // A walk door: just inside it, clear of its tiles, as one coming in by it stands.
    if (door.use === 'walk' && door.side === 'west') cx = (door.tx + door.w) * T + box.w / 2;
    else if (door.use === 'walk' && door.side === 'east') cx = door.tx * T - box.w / 2;
    else cx = (door.tx + door.w / 2) * T;
    floor = (door.ty + door.h) * T;
  }
  const x = cx - box.w / 2;
  const y = floor - box.h;
  if (boxInSolid(room, x, y, box.w, box.h, world)) return undefined;
  return { room: room.id, x, y };
}

/** The door of `from` that leads to `to`, if one does: the way a thrown hero "went", for the chase rules. */
export function doorBetween(content: Content, from: string, to: string): { fromDoor: string; toDoor: string } | undefined {
  const door = content.rooms[from]?.doors.find((x) => x.to.room === to && !x.hidden);
  return door ? { fromDoor: door.id, toDoor: door.to.door } : undefined;
}
