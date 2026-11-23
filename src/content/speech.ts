// The royal audience's words: which line a speaker is on, what it says and
// how it wraps on screen. Pure functions of the data and a line number: no
// clock, nothing random, so every device shows the same line.
// Not in kinds/ on purpose: registry directories take no helpers.
// Writeup: docs/mechanisms/royal-audience.md.
import type { Audience } from './kinds/audience.ts';

/** DRAFT: the ribbon is two rows of this many letters (8 px monospace on a 320 px screen). */
export const SPEECH_WRAP = 28;
export const SPEECH_ROWS = 2;
/** The most letters one line of a speech may have. */
export const SPEECH_MAX = SPEECH_WRAP * SPEECH_ROWS;

/** A slot in a tail line: {names}, {names+1}, {n}, {n+40}, {nth}. */
export const SLOT = /\{([a-z][a-z-]*)(?:\+(\d+))?\}/g;

function ordinal(n: number): string {
  const t = n % 100;
  const end = t >= 11 && t <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${end}`;
}

/** How many lines one round of the tail has: each digression says its lines `run` times, then the next begins. */
export function tailRound(audience: Audience): number {
  return audience.tail.reduce((sum, d) => sum + d.run * d.lines.length, 0);
}

/**
 * Line `n` of the speech (from 0), for ever. The authored opening first;
 * after it the tail: round after round of the digressions in order, each
 * stepping through its lists by how many times it has been said. A slot
 * {list} is that list's entry for this pass (wrapping), {list+2} the entry
 * two further on, {n} the pass number from 1 and {nth} the same as "3rd".
 */
export function speechLine(audience: Audience, n: number): string {
  const line = Math.max(0, Math.floor(n));
  if (line < audience.opening.length) return audience.opening[line]!;
  const round = tailRound(audience);
  if (round === 0) return audience.opening[line % audience.opening.length] ?? '';
  const k = line - audience.opening.length;
  let at = k % round;
  const rounds = Math.floor(k / round);
  for (const d of audience.tail) {
    const size = d.run * d.lines.length;
    if (at >= size) {
      at -= size;
      continue;
    }
    const pass = rounds * d.run + Math.floor(at / d.lines.length);
    return d.lines[at % d.lines.length]!.replace(SLOT, (_all, name: string, plus?: string) => {
      const off = plus === undefined ? 0 : Number(plus);
      if (name === 'n') return String(pass + 1 + off);
      if (name === 'nth') return ordinal(pass + 1 + off);
      const list = audience.lists[name] ?? [];
      return list[(pass + off) % Math.max(1, list.length)] ?? '';
    });
  }
  return '';
}

/**
 * Which line a speaker is on. `ticks` is the count on the speaker's body
 * (entity.c.audience.ticks); before the first step it has none, and the
 * speaker is already at the file's `startLine`: mid-speech.
 */
export function speechLineNumber(audience: Audience, ticks: number | undefined, ticksPerLine: number): number {
  if (ticks === undefined) return audience.startLine;
  return Math.floor(ticks / Math.max(1, ticksPerLine));
}

/** Breaks a line into rows of at most `width` letters, at spaces. A word longer than a row gets a row to itself. */
export function wrapSpeech(text: string, width: number = SPEECH_WRAP): string[] {
  const rows: string[] = [];
  let row = '';
  for (const word of text.split(' ')) {
    if (word === '') continue;
    if (row === '') row = word;
    else if (row.length + 1 + word.length <= width) row += ` ${word}`;
    else {
      rows.push(row);
      row = word;
    }
  }
  if (row !== '') rows.push(row);
  return rows;
}
