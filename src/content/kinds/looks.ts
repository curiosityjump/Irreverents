import { readImage, readRect, requireDraftNote } from '../art-fields.ts';
import type { Rect } from '../art-fields.ts';
import type { Content, ContentKind } from '../types.ts';

/**
 * content/looks/<group>.json: one image and the looks cut from it, for
 * everything the renderer used to draw in code (doors, plates, marks,
 * effects...; docs/mechanisms/art-pipeline.md, "Everything else code used
 * to draw", which lists the ids in use). Look ids are global: the same id
 * in two groups fails the check. The renderer asks by id through
 * src/client/draw/looks.ts and draws its old plain shape when the id is
 * missing, so looks can arrive one at a time.
 * Notes: docs/mechanisms/art-foundation.md.
 */
export interface LookGroup {
  id: string;
  /** Path under assets/. */
  image: string;
  looks: Record<string, LookCut>;
}

export interface LookCut {
  /** [x, y, w, h] of the first frame. */
  src: Rect;
  /** A strip running right from `src` (1 when the file has none). */
  frames: number;
  /** How fast a strip plays. DRAFT: 10 when the file has none, the same default the actor lane's reader used. */
  fps: number;
}

/** One look, merged across groups: what the renderer resolves an id to. */
export interface LookEntry extends LookCut {
  image: string;
  /** The group file it came from. */
  group: string;
}

declare module '../types.ts' {
  interface Content {
    /** By group (file) id. Merge with lookTable(). */
    looks: Record<string, LookGroup>;
  }
}

/** The fps a strip plays at when its file gives none. */
export const DEFAULT_LOOK_FPS = 10;

/** Plain ids like every other id, or one part's own picture: part:<room id>:<part id>[:broken|:down|:open]. */
const LOOK_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const PART_LOOK = /^part:([a-z][a-z0-9-]*):([a-z][a-z0-9-]*)(?::(broken|down|open))?$/;

/**
 * Every look by id, merged across groups. Where an id is in two groups
 * (which the check refuses) the first group in id order wins, so a
 * renderer never depends on file reading order.
 */
export function lookTable(content: Content): Map<string, LookEntry> {
  const out = new Map<string, LookEntry>();
  const groups = content.looks ?? {};
  for (const gid of Object.keys(groups).sort()) {
    const g = groups[gid]!;
    for (const [id, cut] of Object.entries(g.looks)) if (!out.has(id)) out.set(id, { ...cut, image: g.image, group: g.id });
  }
  return out;
}

const kind: ContentKind = {
  id: 'looks',
  source: { dir: 'looks' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'image', 'looks'], '');
    requireDraftNote(read, o);
    const looks: Record<string, LookCut> = {};
    const raws = read.object(o.looks, 'looks');
    if (raws) {
      if (Object.keys(raws).filter((k) => k !== '//').length === 0) read.fail('looks', 'lists no looks');
      for (const [id, rawCut] of Object.entries(raws)) {
        if (id === '//') continue;
        const w = `looks.${id}`;
        if (!LOOK_ID.test(id) && !PART_LOOK.test(id)) {
          read.fail(w, 'is not a valid look id: lower-case words joined by dashes (e.g. "plate-up"), or "part:<room id>:<part id>" with an optional ":broken", ":down" or ":open"');
          continue;
        }
        const c = read.object(rawCut, w);
        if (!c) continue;
        read.only(c, ['src', 'frames', 'fps'], w);
        // DRAFT: raised from 64 to 128 for the 95-frame pixel fonts (font-dark, font-light: one strip,
        // ASCII 32..126, docs/mechanisms/art-pipeline.md "Round 2 additions"); the orchestrator's call.
        const frames = c.frames === undefined ? 1 : read.number(c, 'frames', w, { min: 1, max: 128, integer: true });
        const fps = c.fps === undefined ? DEFAULT_LOOK_FPS : read.number(c, 'fps', w, { min: 1, max: 60 });
        looks[id] = { src: readRect(read, c.src, `${w}.src`), frames, fps };
      }
    }
    const out: LookGroup = { id: read.string(o, 'id', ''), image: readImage(read, o, 'image', ''), looks };
    return out;
  },
  check(content, fail) {
    const seen = new Map<string, string>();
    for (const gid of Object.keys(content.looks).sort()) {
      const g = content.looks[gid]!;
      const file = `content/looks/${g.id}.json`;
      for (const id of Object.keys(g.looks)) {
        const other = seen.get(id);
        if (other) fail(file, `looks.${id}`, `look "${id}" is also in content/looks/${other}.json: look ids are global, so give each to one group`);
        else seen.set(id, g.id);
        const m = PART_LOOK.exec(id);
        if (!m) continue;
        const room = content.rooms[m[1]!];
        if (!room) fail(file, `looks.${id}`, `no room "${m[1]}"`);
        else if (!room.parts.some((p) => p.id === m[2])) fail(file, `looks.${id}`, `room "${room.id}" has no part "${m[2]}" (parts: ${room.parts.map((p) => p.id).sort().join(', ') || '(none)'})`);
      }
    }
  },
};
export default kind;
