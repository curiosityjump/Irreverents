import { describe, known } from '../reader.ts';
import type { Content, ContentKind } from '../types.ts';

/**
 * content/hall/<id>.json (today one, legends.json): what the Hall of Legends recognises (Step 7,
 * D-024 to D-026) and how it words it: the kinds of feat with their
 * thresholds and title templates, the stats' shown labels, the gallery room
 * and where pedestals stand in it. The detector is
 * src/sim/systems/hall-detect.ts; the drawing reads `kinds[id].name` and
 * `stats[id].label` (src/client/draw/hall.ts).
 * Writeup: docs/mechanisms/hall-of-legends.md.
 *
 * INTENT (doc 00): a memory of actual events, never a preset achievements
 * checklist. A kind is recognised from what happened; nothing here names a
 * room or a scripted moment.
 */
export interface HallKind {
  /** Shown name ("A last stand"). */
  name: string;
  /** Title templates; `{place}` is the room's shown name. The record's number picks one. No digits (they show on the banner). */
  titles: string[];
  /** DRAFT: waves that must have walked in during the episode. */
  minWaves: number;
  /** DRAFT: different bodies a credited player must have knocked flat during the episode. */
  minFelled: number;
}

export interface Hall {
  id: string;
  /** The gallery room pedestals stand in. */
  room: string;
  /** [column, row] tiles (feet on that row's floor) for pedestals, in order; past the last they go round again. */
  spots: [number, number][];
  /** Kind id -> kind. The ids a record may carry: `last-stand`, `narrow-escape`, `clean-theft`. */
  kinds: Record<string, HallKind>;
  /** Stat id -> its shown label. */
  stats: Record<string, { label: string }>;
}

/** The kinds the detector knows how to recognise. A kind in the file with another id is refused: nothing could trigger it. */
export const HALL_KINDS = ['last-stand', 'narrow-escape', 'clean-theft'] as const;

declare module '../types.ts' {
  interface Content {
    /** By file id. DRAFT: the detector and the page use the first by id (hallOf); a folder, so a map without the gallery (a room control) simply has none. */
    halls: Record<string, Hall>;
  }
}

/** The Hall in use: the first file by id, or undefined when the content has none. */
export function hallOf(content: { halls?: Record<string, Hall> }): Hall | undefined {
  const ids = Object.keys(content.halls ?? {}).sort();
  return ids.length ? content.halls![ids[0]!] : undefined;
}

const kind: ContentKind = {
  id: 'halls',
  source: { dir: 'hall' },
  parse(raw, read) {
    const o = read.object(raw, '') ?? {};
    read.only(o, ['id', 'room', 'spots', 'kinds', 'stats'], '');
    const out: Hall = { id: read.string(o, 'id', ''), room: read.string(o, 'room', ''), spots: [], kinds: {}, stats: {} };
    if (!Array.isArray(o.spots) || o.spots.length === 0) read.fail('spots', `must be a list of at least one [column, row], but is ${describe(o.spots)}`);
    else
      o.spots.forEach((t: unknown, i: number) => {
        if (Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n) && (n as number) >= 0)) out.spots.push([t[0] as number, t[1] as number]);
        else read.fail(`spots[${i}]`, `must be [column, row], but is ${describe(t)}`);
      });
    const kinds = read.object(o.kinds, 'kinds') ?? {};
    for (const [id, v] of Object.entries(kinds)) {
      if (id === '//') continue;
      const w = `kinds.${id}`;
      if (!(HALL_KINDS as readonly string[]).includes(id)) read.fail(w, `is not a kind the detector recognises (${HALL_KINDS.join(', ')}): nothing could hang it`);
      const k = read.object(v, w);
      if (!k) continue;
      read.only(k, ['name', 'titles', 'minWaves', 'minFelled'], w);
      const titles = read.stringList(k, 'titles', w);
      if (titles.length === 0) read.fail(`${w}.titles`, 'must list at least one title');
      titles.forEach((t, i) => {
        if (/[0-9]/.test(t)) read.fail(`${w}.titles[${i}]`, 'must have no digits: titles show on the banner');
      });
      out.kinds[id] = {
        name: read.string(k, 'name', w),
        titles,
        minWaves: read.number(k, 'minWaves', w, { min: 0, max: 1000, integer: true }),
        minFelled: read.number(k, 'minFelled', w, { min: 0, max: 1000, integer: true }),
      };
    }
    const stats = read.object(o.stats, 'stats') ?? {};
    for (const [id, v] of Object.entries(stats)) {
      if (id === '//') continue;
      const s = read.object(v, `stats.${id}`);
      if (!s) continue;
      read.only(s, ['label'], `stats.${id}`);
      out.stats[id] = { label: read.string(s, 'label', `stats.${id}`) };
    }
    return out;
  },
  check(content, fail) {
    for (const [id, h] of Object.entries(content.halls)) checkHall(content, `content/hall/${id}.json`, h, fail);
  },
};
export default kind;

function checkHall(content: Content, file: string, h: Hall, fail: (file: string, where: string, message: string) => void): void {
  {
    const room = content.rooms[h.room];
    if (!room) {
      fail(file, 'room', `no room "${h.room}" (rooms: ${known(content.rooms)})`);
      return;
    }
    h.spots.forEach(([tx, ty], i) => {
      if (tx >= room.w || ty >= room.h) fail(file, `spots[${i}]`, `[${tx}, ${ty}] is outside room "${room.id}"`);
    });
    if (!('pedestal' in content.characters)) fail(file, 'room', 'needs the character kind "pedestal" (content/characters/pedestal.json): a record hangs on one');
  }
}
