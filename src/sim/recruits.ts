import type { Content } from '../content/types.ts';
import type { Recruit } from '../content/kinds/recruits.ts';
import type { Entity, World } from './types.ts';

declare module './types.ts' {
  interface Components {
    /**
     * Step 13 (docs/mechanisms/recruits.md): on the bodiless entity
     * `recruit:<id>` (kind `~thing`), a captive hero in their cage. Made
     * where a world is made (populateRoom: the server's makeWorld, a kept
     * game's load, a scenario with "placements"), never by a page's own
     * world. INTENT: a thing, never a body: nothing can hit, grab or throw
     * a captive, sight never sees one, and an outpost's bound never counts
     * one (it counts bodies with `c.npc`).
     */
    recruit?: {
      /** The content/recruits/ file. */
      id: string;
      /** The hero inside. */
      character: string;
      /** True once freed: the cage stands open and empty for good. */
      open: boolean;
      /** Step 13 push 3: who is holding Use at the cage, and for how many ticks; null when nobody. */
      hold: { by: string; ticks: number } | null;
    };
  }
}

/** INTENT: a contract once pushed (kept games hold it): one captive entity per recruit file, `recruit:<id>`. */
export const recruitId = (id: string): string => `recruit:${id}`;

/** The cage's bottom-left corner, in room pixels (the entity's x, y). */
export function cageAt(content: Content, r: Recruit): { x: number; y: number; w: number } {
  const T = content.rooms[r.room]!.tile;
  return { x: r.tile[0] * T, y: (r.tile[1] + 1) * T, w: r.w * T };
}

/**
 * Puts each captive of this room in the world, unless their hero is already
 * named in this world's roster (freed here before, or a start hero).
 * DRAFT: a world with no roster of its own (a `?room=` world, a game saved
 * before Step 13) has everyone unlocked and still gets the captive, so the
 * rescue can be played there too; freeing them adds nobody new there
 * (decisions-log "Step 13: the captive").
 */
export function placeRecruits(world: World, content: Content, roomId: string): void {
  for (const id of Object.keys(content.recruits ?? {}).sort()) {
    const r = content.recruits[id]!;
    if (r.room !== roomId || !content.rooms[roomId]) continue;
    if (world.entities.some((e) => e.id === recruitId(r.id))) continue;
    if (Array.isArray(world.roster) && world.roster.includes(r.character)) continue;
    const at = cageAt(content, r);
    const e: Entity = { id: recruitId(r.id), kind: '~thing', player: null, room: roomId, x: at.x, y: at.y, vx: 0, vy: 0, facing: -1, onGround: true, c: { recruit: { id: r.id, character: r.character, open: false, hold: null } } };
    let i = 0;
    while (i < world.entities.length && world.entities[i]!.id < e.id) i++;
    world.entities.splice(i, 0, e);
  }
}

/** Every captive entity in the world, with its file. Empty in a page's own world. */
export function recruitsOf(world: World, content: Content): { r: Recruit; e: Entity; state: NonNullable<Entity['c']['recruit']> }[] {
  const out: { r: Recruit; e: Entity; state: NonNullable<Entity['c']['recruit']> }[] = [];
  for (const e of world.entities) {
    const state = e.c.recruit;
    const r = state ? content.recruits?.[state.id] : undefined;
    if (state && r) out.push({ r, e, state });
  }
  return out;
}
