// Measures every art content file against its image: the image exists
// under assets/, and every cell, rectangle and frame number it names is
// inside it (docs/mechanisms/art-pipeline.md, "Checks"). The content kinds
// check the shapes; only a script can open the files, because src/content
// stays free of Node. Run by scripts/checks/art-images.ts.
// Notes: docs/mechanisms/art-foundation.md.
import fs from 'node:fs';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { atlasCells } from '../../src/content/kinds/atlases.ts';
import { root } from './registries.ts';

export interface Size {
  w: number;
  h: number;
}

/** The art kinds only: enough of Content for the measure, so a control can be built in memory. */
export type ArtContent = Pick<Content, 'sprites' | 'atlases' | 'backdrops' | 'decor' | 'looks'>;

/** A PNG's size from its header (no decoding, no dependency); null when the file is missing; an error message when it is not a PNG. */
export function pngSize(file: string): Size | null | string {
  if (!fs.existsSync(file)) return null;
  const fd = fs.openSync(file, 'r');
  try {
    const b = Buffer.alloc(24);
    const n = fs.readSync(fd, b, 0, 24, 0);
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (n < 24 || !sig.every((v, i) => b[i] === v) || b.toString('latin1', 12, 16) !== 'IHDR') return 'is not a PNG file';
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

/** Looks an image path up under assets/ on disk. */
export function diskSizes(): (image: string) => Size | null | string {
  const cache = new Map<string, Size | null | string>();
  return (image) => {
    if (!cache.has(image)) cache.set(image, pngSize(path.join(root, 'assets', image)));
    return cache.get(image)!;
  };
}

/** Every way an art file disagrees with its image, as "file: where: message". Empty when all fit. */
export function artImageProblems(content: ArtContent, sizeOf: (image: string) => Size | null | string): string[] {
  const out: string[] = [];
  /** The image's size, or null after reporting why there is none. */
  const open = (file: string, where: string, image: string): Size | null => {
    const s = sizeOf(image);
    if (s === null) out.push(`${file}: ${where}: no image at assets/${image}`);
    else if (typeof s === 'string') out.push(`${file}: ${where}: assets/${image} ${s}`);
    else return s;
    return null;
  };
  const rectFits = (file: string, where: string, image: string, size: Size, x: number, y: number, w: number, h: number): void => {
    if (x + w > size.w || y + h > size.h) out.push(`${file}: ${where}: [${x}, ${y}, ${w}, ${h}] runs past the edge of assets/${image} (${size.w}×${size.h})`);
  };
  const cellFits = (file: string, where: string, image: string, size: Size, tile: number, [c, r]: [number, number]): void => {
    if ((c + 1) * tile > size.w || (r + 1) * tile > size.h) out.push(`${file}: ${where}: cell [${c}, ${r}] of ${tile} px runs past the edge of assets/${image} (${size.w}×${size.h}, ${Math.floor(size.w / tile)}×${Math.floor(size.h / tile)} cells)`);
  };

  for (const s of Object.values(content.sprites ?? {})) {
    const file = `content/sprites/${s.id}.json`;
    const size = open(file, 'image', s.image);
    if (!size) continue;
    const cols = Math.floor(size.w / s.cell.w);
    const rows = Math.floor(size.h / s.cell.h);
    if (cols < 1 || rows < 1) {
      out.push(`${file}: cell: a ${s.cell.w}×${s.cell.h} cell does not fit in assets/${s.image} (${size.w}×${size.h})`);
      continue;
    }
    const count = cols * rows;
    const lists: [string, number[] | undefined][] = Object.entries(s.frames).map(([k, v]) => [`frames.${k}`, v]);
    for (const [mood, states] of Object.entries(s.moods ?? {})) for (const [k, v] of Object.entries(states ?? {})) lists.push([`moods.${mood}.${k}`, v]);
    for (const [where, list] of lists) {
      for (const f of list ?? []) {
        if (f >= count) out.push(`${file}: ${where}: frame ${f} is past the end of the sheet (assets/${s.image} is ${cols}×${rows} cells of ${s.cell.w}×${s.cell.h}: frames 0 to ${count - 1})`);
      }
    }
  }

  for (const a of Object.values(content.atlases ?? {})) {
    const file = `content/atlases/${a.id}.json`;
    const size = open(file, 'image', a.image);
    if (!size) continue;
    for (const { where, cell } of atlasCells(a)) cellFits(file, where, a.image, size, a.tile, cell);
  }

  for (const b of Object.values(content.backdrops ?? {})) {
    const file = `content/backdrops/${b.id}.json`;
    b.layers.forEach((l, i) => {
      const size = open(file, `layers[${i}].image`, l.image);
      // INTENT (the contract): layer images are 320 px wide or a multiple, so they tile sideways without a seam.
      if (size && size.w % 320 !== 0) out.push(`${file}: layers[${i}].image: assets/${l.image} is ${size.w} px wide: a layer is 320 px wide or a multiple`);
    });
    if (b.wall) {
      const size = open(file, 'wall.image', b.wall.image);
      if (size) b.wall.cells.forEach((c, i) => cellFits(file, `wall.cells[${i}]`, b.wall!.image, size, b.wall!.tile, c));
    }
  }

  for (const d of Object.values(content.decor ?? {})) {
    const file = `content/decor/${d.id}.json`;
    d.items.forEach((it, i) => {
      const size = open(file, `items[${i}].image`, it.image);
      if (size) rectFits(file, `items[${i}].src`, it.image, size, ...it.src);
    });
  }

  for (const g of Object.values(content.looks ?? {})) {
    const file = `content/looks/${g.id}.json`;
    const size = open(file, 'image', g.image);
    if (!size) continue;
    for (const [id, cut] of Object.entries(g.looks)) {
      const [x, y, w, h] = cut.src;
      rectFits(file, `looks.${id}.src${cut.frames > 1 ? ` (a strip of ${cut.frames})` : ''}`, g.image, size, x, y, w * cut.frames, h);
    }
  }
  return out;
}
