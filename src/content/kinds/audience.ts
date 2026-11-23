import { ID_PATTERN } from '../assemble.ts';
import { describe, isRecord } from '../reader.ts';
import { SLOT, SPEECH_MAX, SPEECH_ROWS, SPEECH_WRAP, speechLine, tailRound, wrapSpeech } from '../speech.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/audience/<id>.json: a speech that belongs to one placed body and
 * never ends (the owner's design library, doc 03, "A speech with genuine
 * endurance"). Step 6 owns this kind. Writeup: docs/mechanisms/royal-audience.md.
 * DRAFT: the shape is a first pass; the words in the file are the owner's taste.
 */
export interface Audience {
  id: string;
  /** The placed body that speaks: an entry's id in a content/placements/ file. */
  speaker: string;
  /** The line he is on when the world starts, so the first player walks in mid-speech. */
  startLine: number;
  /** The authored lines, said once, in order. */
  opening: string[];
  /** Named lists the tail steps through. */
  lists: Record<string, string[]>;
  /** What follows the opening, for ever: digressions said in order, round after round. */
  tail: {
    /** How many times in a row this digression's lines are said (each time one step further through its lists) before the next begins. */
    run: number;
    /** Lines with slots: {list}, {list+1}, {n}, {n+40}, {nth} (src/content/speech.ts). */
    lines: string[];
  }[];
}

/** INTENT: the owner's three-hour figure (doc 03): nobody who waits that long may catch the king repeating himself. */
export const SPEECH_CHECKED_SECONDS = 3 * 60 * 60;
/** Used when content/tuning.json has no world.speechLineTime yet (the sim's own check then says so). */
const FALLBACK_LINE_TIME = 6;
const RESERVED = ['n', 'nth'];

declare module '../types.ts' {
  interface Content {
    audience: Record<string, Audience>;
  }
}

const kind: ContentKind = {
  id: 'audience',
  source: { dir: 'audience' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'speaker', 'startLine', 'opening', 'lists', 'tail'], '');
    const out: Audience = {
      id: read.string(o, 'id', ''),
      speaker: read.string(o, 'speaker', ''),
      startLine: read.number(o, 'startLine', '', { min: 0, integer: true }),
      opening: read.stringList(o, 'opening', ''),
      lists: {},
      tail: [],
    };
    if (out.speaker !== '' && !ID_PATTERN.test(out.speaker)) read.fail('speaker', `"${out.speaker}" is not a valid id`);
    if (out.opening.length === 0) read.fail('opening', 'must hold at least one line');
    else if (out.startLine >= out.opening.length) read.fail('startLine', `is ${out.startLine}, but the opening has only ${out.opening.length} lines`);
    const lists = read.object(o.lists ?? {}, 'lists');
    for (const name of Object.keys(lists ?? {})) {
      if (name === '//') continue;
      if (!/^[a-z][a-z-]*$/.test(name) || RESERVED.includes(name)) read.fail(`lists.${name}`, 'a list name is lower-case letters and dashes, and not "n" or "nth" (those are the numbers)');
      const items = read.stringList(lists!, name, 'lists');
      if (items.length === 0) read.fail(`lists.${name}`, 'must hold at least one entry');
      out.lists[name] = items;
    }
    if (!Array.isArray(o.tail) || o.tail.length === 0) {
      read.fail('tail', `must be a list of at least one digression ({ "run": times, "lines": [...] }), but is ${describe(o.tail)}: without it the speech would run out`);
      return out;
    }
    o.tail.forEach((item: unknown, i: number) => {
      const w = `tail[${i}]`;
      if (!isRecord(item)) return read.fail(w, `must be { "run": times, "lines": [...] }, but is ${describe(item)}`);
      read.only(item, ['run', 'lines'], w);
      const d = { run: read.number(item, 'run', w, { min: 1, max: 1000, integer: true }), lines: read.stringList(item, 'lines', w) };
      if (d.lines.length === 0) read.fail(`${w}.lines`, 'must hold at least one line');
      d.lines.forEach((text, k) => {
        for (const m of text.matchAll(SLOT)) {
          const name = m[1]!;
          if (!RESERVED.includes(name) && !(name in out.lists)) read.fail(`${w}.lines[${k}]`, `uses {${name}}, but "lists" has no "${name}" (lists: ${Object.keys(out.lists).join(', ') || 'none'})`);
        }
      });
      out.tail.push(d);
    });
    return out;
  },
  check(content, fail) {
    const speakers: Record<string, string> = {};
    for (const a of Object.values(content.audience)) {
      const file = `content/audience/${a.id}.json`;
      const placed = Object.values(content.placements).some((pl) => pl.place.some((p) => p.id === a.speaker));
      // INTENT: only when there are placements at all. Step 3's room controls
      // (scripts/lib/room-controls.ts) check a map with every room and
      // placements file taken out; the speech must not fail their content.
      if (!placed && Object.keys(content.placements).length > 0) fail(file, 'speaker', `"${a.speaker}" is not a body any content/placements/ file places`);
      if (speakers[a.speaker]) fail(file, 'speaker', `"${a.speaker}" already speaks ${speakers[a.speaker]}; one body gives one speech`);
      else speakers[a.speaker] = file;

      // INTENT: the speech never visibly loops (doc 03). A scenario cannot
      // run for hours, so the text itself is checked: every line of the
      // first three hours, at the pace in content/tuning.json, is different.
      const lineTime = content.tuning.world.speechLineTime ?? FALLBACK_LINE_TIME;
      const count = Math.ceil(SPEECH_CHECKED_SECONDS / Math.max(1 / 60, lineTime));
      const hours = SPEECH_CHECKED_SECONDS / 3600;
      const round = tailRound(a);
      const name = (n: number): string => {
        if (n < a.opening.length) return `opening[${n}]`;
        return `line ${n} (the tail, ${n - a.opening.length} lines after the opening${round > 0 ? `, round ${Math.floor((n - a.opening.length) / round) + 1}` : ''})`;
      };
      const seen = new Map<string, number>();
      let reported = 0;
      for (let n = 0; n < count && reported < 10; n++) {
        const text = speechLine(a, n);
        const rows = wrapSpeech(text);
        if (text.length > SPEECH_MAX || rows.length > SPEECH_ROWS || rows.some((r) => r.length > SPEECH_WRAP)) {
          fail(file, name(n), `"${text}" does not fit the ribbon: ${text.length} letters wrapping to ${rows.length} rows (at most ${SPEECH_MAX} letters, in ${SPEECH_ROWS} rows of ${SPEECH_WRAP})`);
          reported++;
        }
        const first = seen.get(text);
        if (first !== undefined) {
          fail(file, name(n), `"${text}" repeats ${name(first)}: no line may repeat in the first ${hours} hours (${count} lines at ${lineTime} seconds a line)`);
          reported++;
        } else seen.set(text, n);
      }
    }
  },
};
export default kind;
