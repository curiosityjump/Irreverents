import { ID_PATTERN } from '../assemble.ts';
import { describe } from '../reader.ts';
import type { ContentKind, Reader } from '../types.ts';
import { HERO_ROLE, MOOD_CUES, SIDES } from './npcs.ts';
import type { Side } from './npcs.ts';

/**
 * content/rules/<id>.json: the tables NPC response logic is read from
 * (docs/mechanisms/npc-response.md). Every file in the directory is read
 * and their rows are taken together, in file-name order; a file may hold
 * any of the four lists.
 *
 * INTENT (D-055): "what does this role make of that deed" is an explicit
 * role/deed mapping in data. Nothing here is learned or guessed at run time.
 */
export interface Rules {
  id: string;
  /** The deeds that exist: things a person can witness someone doing. */
  deeds: string[];
  /** What a witness makes of a deed, by who did it (D-050). */
  expect: ExpectRow[];
  /** What a person in business as usual does about an expected deed (D-049). */
  reactions: ReactionRow[];
  /** Which simulation events count as which deed. */
  events: EventRow[];
}

export interface ExpectRow {
  /** The role of whoever did the deed. */
  actor: string;
  deed: string;
  /** Only when the deed was done to someone of this role / side. */
  targetRole?: string;
  targetSide?: Side;
  /** Only in the eyes of a witness of this role / side. */
  witnessRole?: string;
  witnessSide?: Side;
  /** "expected": in keeping with the actor's part. "odd": a break from it. */
  verdict: 'expected' | 'odd';
  /** How much an odd deed adds to a witness's dissonance. 0 for expected. */
  weight: number;
}

export interface ReactionRow {
  /** The role of the person reacting. */
  witness: string;
  actor: string;
  deed: string;
  /** A reaction id; also the bark cue. "oppose" emits the `opposed` event. */
  reaction: string;
}

export interface EventRow {
  /** A simulation event type, e.g. "hit". */
  event: string;
  deed: string;
  /** The event field holding the entity id of who did it. */
  by: string;
  /** The event field holding the entity id of whom it was done to, if any. */
  target?: string;
}

/** Event types the deed pass itself emits or reads directly; mapping them would loop. */
const OWN_EVENTS = ['deed', 'did'];

declare module '../types.ts' {
  interface Content {
    rules: Record<string, Rules>;
  }
}

function rows(o: Record<string, unknown>, field: string, read: Reader, each: (row: Record<string, unknown>, where: string) => void): void {
  const v = o[field];
  if (v === undefined) return;
  if (!Array.isArray(v)) return read.fail(field, `must be a list, but is ${describe(v)}`);
  v.forEach((item: unknown, i: number) => {
    const row = read.object(item, `${field}[${i}]`);
    if (row) each(row, `${field}[${i}]`);
  });
}

function side(row: Record<string, unknown>, field: string, where: string, read: Reader): Side | undefined {
  const v = row[field];
  if (v === undefined) return undefined;
  if (SIDES.includes(v as Side)) return v as Side;
  read.fail(`${where}.${field}`, `must be one of ${SIDES.join(', ')}, but is ${describe(v)}`);
  return undefined;
}

const kind: ContentKind = {
  id: 'rules',
  source: { dir: 'rules' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'deeds', 'expect', 'reactions', 'events'], '');
    const out: Rules = { id: read.string(o, 'id', ''), deeds: [], expect: [], reactions: [], events: [] };
    if (o.deeds !== undefined) {
      out.deeds = read.stringList(o, 'deeds', '');
      out.deeds.forEach((d, i) => {
        if (!ID_PATTERN.test(d)) read.fail(`deeds[${i}]`, `"${d}" is not a valid id: use lower-case letters, digits and dashes, starting with a letter`);
      });
    }
    rows(o, 'expect', read, (row, w) => {
      read.only(row, ['actor', 'deed', 'targetRole', 'targetSide', 'witnessRole', 'witnessSide', 'verdict', 'weight'], w);
      const verdict = row.verdict;
      if (verdict !== 'expected' && verdict !== 'odd') read.fail(`${w}.verdict`, `must be "expected" or "odd", but is ${describe(verdict)}`);
      let weight = 0;
      if (verdict === 'odd') weight = read.number(row, 'weight', w, { min: 1, max: 100, integer: true });
      else if (row.weight !== undefined) read.fail(`${w}.weight`, 'only an "odd" deed has a weight');
      const r: ExpectRow = { actor: read.string(row, 'actor', w), deed: read.string(row, 'deed', w), verdict: verdict === 'odd' ? 'odd' : 'expected', weight };
      if (row.targetRole !== undefined) r.targetRole = read.string(row, 'targetRole', w);
      if (row.witnessRole !== undefined) r.witnessRole = read.string(row, 'witnessRole', w);
      const ts = side(row, 'targetSide', w, read);
      const ws = side(row, 'witnessSide', w, read);
      if (ts) r.targetSide = ts;
      if (ws) r.witnessSide = ws;
      out.expect.push(r);
    });
    rows(o, 'reactions', read, (row, w) => {
      read.only(row, ['witness', 'actor', 'deed', 'reaction'], w);
      const reaction = read.string(row, 'reaction', w);
      if (reaction && !ID_PATTERN.test(reaction)) read.fail(`${w}.reaction`, `"${reaction}" is not a valid id`);
      if (MOOD_CUES.includes(reaction)) read.fail(`${w}.reaction`, `"${reaction}" is a mood's own bark cue; name the reaction something else`);
      out.reactions.push({ witness: read.string(row, 'witness', w), actor: read.string(row, 'actor', w), deed: read.string(row, 'deed', w), reaction });
    });
    rows(o, 'events', read, (row, w) => {
      read.only(row, ['event', 'deed', 'by', 'target'], w);
      const r: EventRow = { event: read.string(row, 'event', w), deed: read.string(row, 'deed', w), by: read.string(row, 'by', w) };
      if (OWN_EVENTS.includes(r.event)) read.fail(`${w}.event`, `"${r.event}" is one of the deed pass's own events and cannot be mapped to a deed`);
      if (row.target !== undefined) r.target = read.string(row, 'target', w);
      out.events.push(r);
    });
    return out;
  },
  check(content, fail) {
    const files = Object.values(content.rules);
    const deeds = new Set(files.flatMap((f) => f.deeds));
    const roles = new Set([HERO_ROLE, ...Object.values(content.npcs).map((n) => n.role)]);
    const list = (s: Set<string>): string => [...s].sort().join(', ') || '(none yet)';
    for (const f of files) {
      const file = `content/rules/${f.id}.json`;
      const deed = (d: string, where: string): void => {
        if (!deeds.has(d)) fail(file, where, `no deed "${d}" (deeds are listed under "deeds" in a content/rules/ file: ${list(deeds)})`);
      };
      const role = (r: string | undefined, where: string): void => {
        if (r !== undefined && !roles.has(r)) fail(file, where, `no role "${r}" (roles: "${HERO_ROLE}" for players, and the "role" of each content/npcs/ file: ${list(roles)})`);
      };
      f.expect.forEach((r, i) => {
        deed(r.deed, `expect[${i}].deed`);
        role(r.actor, `expect[${i}].actor`);
        role(r.targetRole, `expect[${i}].targetRole`);
        role(r.witnessRole, `expect[${i}].witnessRole`);
      });
      f.reactions.forEach((r, i) => {
        deed(r.deed, `reactions[${i}].deed`);
        role(r.actor, `reactions[${i}].actor`);
        role(r.witness, `reactions[${i}].witness`);
      });
      f.events.forEach((r, i) => deed(r.deed, `events[${i}].deed`));
    }
    // A bark nobody can ever say is a typo in its cue.
    const cues = new Set([...MOOD_CUES, ...files.flatMap((f) => f.reactions.map((r) => r.reaction))]);
    for (const n of Object.values(content.npcs)) {
      for (const cue of Object.keys(n.barks)) {
        if (!cues.has(cue)) fail(`content/npcs/${n.id}.json`, `barks.${cue}`, `nothing raises the cue "${cue}" (cues: ${list(cues)})`);
      }
    }
  },
};
export default kind;
