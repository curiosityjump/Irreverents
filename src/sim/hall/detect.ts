import { hallOf } from '../../content/kinds/hall.ts';
// Helpers of the Hall of Legends detector (src/sim/systems/hall-detect.ts):
// the picture of a moment, the record and the pedestal it hangs on.
// Writeup: docs/mechanisms/hall-of-legends.md.
import type { Content } from '../../content/types.ts';
import { isOut } from '../npc/state.ts';
import type { Entity, StepContext, World } from '../types.ts';
import { findEntity, spawnBody } from '../world.ts';
import { FRAME_CREDITED, FRAME_MAX_BODIES, FRAME_OUT, PEDESTAL_KIND, pedestalId } from './record.ts';
import type { FrameBody, HallRecord } from './record.ts';

/** INTENT (record.ts): a pedestal entity is at most this many bytes of JSON; it goes to every phone in the gallery about 20 times a second. */
export const PEDESTAL_BYTES = 500;

/**
 * Step 7 (DRAFT): an episode the detector is following at an outpost, kept on
 * the outpost's post (it rides with the world into a kept game's save).
 * Read with defaults: a post saved before this field has none.
 */
export interface Episode {
  /** Tick the first wave of the episode walked in. */
  start: number;
  /** Waves that walked in, and how many people came with them. */
  waves: number;
  came: number;
  /** Ids of the different bodies a credited player knocked flat (at most 64 kept). */
  felled: string[];
  /** Everyone who was in the room during it: [player id, character kind]. */
  who: [string, string][];
  /** The picture of the last moment a credited player knocked someone flat. */
  snap: FrameBody[];
}

declare module '../types.ts' {
  interface Components {
    /** Step 7: on an outpost's post, the episode the Hall's detector is following there, if any. */
    legend?: Episode | null;
  }
  interface EventMap {
    /** Step 7: a new legend was hung: its pedestal is `hall:<n>` in the gallery. A world event, so every page hears it (a page is sent only its own room's entities). */
    'hall-legend': { n: number; kind: string; title: string; place: string; who: string[]; stats: Record<string, number> };
  }
}

/** The picture of the room now: credited players first, then the nearest bodies to them, at most FRAME_MAX_BODIES. */
export function snapshot(world: World, content: Content, room: string, credited: Set<string>): FrameBody[] {
  const bodies = world.entities.filter((e) => e.room === room && e.kind in content.characters && e.kind !== PEDESTAL_KIND);
  const heroes = bodies.filter((e) => e.player !== null && credited.has(e.player));
  const cx = heroes.length ? heroes.reduce((s, e) => s + e.x, 0) / heroes.length : 0;
  const rest = bodies.filter((e) => !heroes.includes(e)).sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx) || (a.id < b.id ? -1 : 1));
  return [...heroes, ...rest].slice(0, FRAME_MAX_BODIES).map((e) => frameBody(e, heroes.includes(e)));
}

function frameBody(e: Entity, credited: boolean): FrameBody {
  return [e.kind, Math.round(e.x), Math.round(e.y), e.facing < 0 ? -1 : 1, (credited ? FRAME_CREDITED : 0) | (isOut(e) ? FRAME_OUT : 0)];
}

/** The pedestals in the world, with their records. */
export function pedestals(world: World): { e: Entity; record: HallRecord }[] {
  const out: { e: Entity; record: HallRecord }[] = [];
  for (const e of world.entities) if (e.kind === PEDESTAL_KIND && e.c.hall?.record) out.push({ e, record: e.c.hall.record });
  return out;
}

/**
 * Hangs a record unless one of its kind in that place already scores as
 * well (S-001: greatness relative to past exploits). Returns the record hung, or null.
 * DRAFT: the record's number is the next after the highest in this world.
 */
export function hang(
  ctx: StepContext,
  feat: { kind: string; place: string; ticks: number; who: [string, string][]; stats: Record<string, number>; score: number; frame: FrameBody[] },
): HallRecord | null {
  const { world, content } = ctx;
  const hall = hallOf(content);
  const kind = hall?.kinds[feat.kind];
  if (!hall || !kind || feat.who.length === 0) return null;
  const all = pedestals(world);
  const best = all.filter((p) => p.record.kind === feat.kind && p.record.place === feat.place).reduce((m, p) => Math.max(m, p.record.score), -Infinity);
  if (feat.score <= best && (content.tuning.world.hallRelativeOn ?? 1) >= 1) return null;
  const n = all.reduce((m, p) => Math.max(m, p.record.n), 0) + 1;
  const place = content.rooms[feat.place]?.name ?? feat.place;
  const title = kind.titles[(n - 1) % kind.titles.length]!.replace('{place}', place);
  const record: HallRecord = {
    v: 1,
    n,
    kind: feat.kind,
    title,
    place: feat.place,
    ticks: feat.ticks,
    who: feat.who.map(([player, character]) => ({ player, character })),
    stats: feat.stats,
    score: feat.score,
    frame: { room: feat.place, bodies: feat.frame },
  };
  const spot = hall.spots[(n - 1) % hall.spots.length]!;
  const id = pedestalId(n);
  if (findEntity(world, id)) return null;
  const e = spawnBody(world, content, { id, character: PEDESTAL_KIND, room: hall.room, tile: spot });
  e.c.hall = { record };
  // INTENT (record.ts): the whole pedestal entity stays within its byte budget; the farthest bodies of the picture go first.
  while (JSON.stringify(e).length > PEDESTAL_BYTES && record.frame.bodies.length > 1) record.frame.bodies.pop();
  ctx.emit('hall-legend', { n, kind: feat.kind, title, place: feat.place, who: feat.who.map(([p]) => p), stats: feat.stats });
  return record;
}
