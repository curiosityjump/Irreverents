import { describe } from './reader.ts';
import type { Reader } from './types.ts';

// Field readers the art content kinds share (sprites, atlases, backdrops,
// decor, looks; docs/mechanisms/art-pipeline.md). Lives outside kinds/
// because every file there is registered as a kind.
// Notes: docs/mechanisms/art-foundation.md.

/** A [column, row] cell; `allowNone` also accepts [-1, -1] ("nothing here", only in an autotile's top and under). */
export type Cell = [number, number];

export function readCell(read: Reader, v: unknown, where: string, allowNone = false): Cell {
  if (Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n))) {
    const [c, r] = v as [number, number];
    if (c >= 0 && r >= 0) return [c, r];
    if (allowNone && c === -1 && r === -1) return [-1, -1];
  }
  read.fail(where, `must be [column, row] with whole numbers 0 or more${allowNone ? ', or [-1, -1] for "nothing here"' : ''}, but is ${describe(v)}`);
  return [0, 0];
}

export function readCellList(read: Reader, v: unknown, where: string, opts: { min?: number; allowNone?: boolean } = {}): Cell[] {
  if (!Array.isArray(v)) {
    read.fail(where, `must be a list of [column, row], but is ${describe(v)}`);
    return [];
  }
  if (v.length < (opts.min ?? 1)) read.fail(where, `must list at least ${opts.min ?? 1} cell(s), but lists ${v.length}`);
  return v.map((c, i) => readCell(read, c, `${where}[${i}]`, opts.allowNone));
}

/** An [x, y, w, h] rectangle in pixels of an image. */
export type Rect = [number, number, number, number];

export function readRect(read: Reader, v: unknown, where: string): Rect {
  if (Array.isArray(v) && v.length === 4 && v.every((n) => Number.isInteger(n) && n >= 0) && (v[2] as number) > 0 && (v[3] as number) > 0) {
    return v as Rect;
  }
  read.fail(where, `must be [x, y, w, h] in whole pixels (w and h at least 1), but is ${describe(v)}`);
  return [0, 0, 1, 1];
}

/** An image path under assets/: relative, forward slashes, ending .png. */
export function readImage(read: Reader, o: Record<string, unknown>, field: string, where: string): string {
  const w = where ? `${where}.${field}` : field;
  const v = o[field];
  if (typeof v === 'string' && /^[a-z0-9][a-z0-9._/-]*\.png$/i.test(v) && !v.split('/').includes('..')) return v;
  read.fail(w, `must be a path under assets/ ending .png (e.g. "tiles/castle.png"), but is ${describe(v)}`);
  return '';
}

export function readBool(read: Reader, o: Record<string, unknown>, field: string, where: string, fallback: boolean): boolean {
  const v = o[field];
  if (v === undefined) return fallback;
  if (typeof v === 'boolean') return v;
  read.fail(where ? `${where}.${field}` : field, `must be true or false, but is ${describe(v)}`);
  return fallback;
}

/**
 * INTENT (the contract, "Ground rules" and "Checks"): every picture is a
 * stand-in until the asset desk delivers, so every art file's "//" starts
 * DRAFT: and says where its picture came from.
 * DRAFT: "says where" is read as naming the program (tools/art/...) or a
 * delivery; loosen the pattern if a real source reads otherwise.
 */
export function requireDraftNote(read: Reader, o: Record<string, unknown>): void {
  const note = o['//'];
  if (typeof note !== 'string' || !note.startsWith('DRAFT:')) {
    read.fail('//', `an art file's note must start "DRAFT:" and say where its picture came from (e.g. "DRAFT: stand-in drawn by tools/art/tiles/make.py."), but is ${describe(note)}`);
    return;
  }
  if (!/tools\/art\/|deliver/i.test(note)) {
    read.fail('//', 'must say where the picture came from: name the program (tools/art/<lane>/make.py) or the delivery it is');
  }
}
