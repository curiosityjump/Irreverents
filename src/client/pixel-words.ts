import { look } from './draw/fx.ts';

// DRAFT (brief phone-hud-legibility, second pass, 2026-11-24: the hint and
// the Use button's pill were smooth sans text beside pixel art): a few words
// of page furniture drawn in the game's own pixel font (`font-light`, the
// 6x10 cells draw/fx.ts uses in the picture) on a small canvas, at a whole
// number of device pixels per font pixel, so nothing blurs. The element
// keeps its words in `data-word` and an aria-label; while the font has not
// loaded the plain words show and the drawing is tried again shortly.
// The words never go into the game picture's drawn record (no noteWords):
// they are page text, as before.

/**
 * "Go in"'s mark, 7 by 8 font pixels: a solid amber door ('d') in its frame
 * ('#'), planks ('p'), a cream knob ('k'). DRAFT: a stand-in. Third pass of
 * the brief: the outlined arch read as the letter "n" ("nGO IN"); a filled
 * shape in another colour than the words cannot be read as a letter.
 */
const DOOR = ['..###..', '.#ddd#.', '#ddpdd#', '#ddpdd#', '#ddpdk#', '#ddpdd#', '#ddpdd#', '#######'];
const DOOR_COLOURS: Record<string, string> = { '#': '#7a4a22', d: '#e09a1e', p: '#a8641c', k: '#f4f1de' };
const CREAM = '#f4f1de';

/**
 * Draws `text` into `el` in the pixel font, about `cssH` CSS px tall
 * (the nearest whole scale, at least 1 font px per device px). `door`: a
 * door mark before the words.
 */
export function pixelWords(el: HTMLElement, text: string, cssH: number, door = false): void {
  const key = `${text}|${cssH}|${door}`;
  el.dataset.word = text;
  el.setAttribute('aria-label', text);
  if (el.dataset.drawn === key) return;
  const f = look('font-light');
  if (!f || !f.img.complete) {
    el.textContent = text;
    delete el.dataset.drawn;
    setTimeout(() => {
      if (el.dataset.word === text && el.isConnected) pixelWords(el, text, cssH, door);
    }, 250);
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const k = Math.max(1, Math.round((cssH * dpr) / f.h));
  const lead = door ? DOOR[0]!.length + 3 : 0;
  const w = lead + Math.max(1, text.length * f.w - 1);
  const c = document.createElement('canvas');
  c.width = w * k;
  c.height = f.h * k;
  c.style.width = `${(w * k) / dpr}px`;
  c.style.height = `${(f.h * k) / dpr}px`;
  c.style.imageRendering = 'pixelated';
  c.style.display = 'block';
  const g = c.getContext('2d');
  if (!g) {
    el.textContent = text;
    return;
  }
  g.imageSmoothingEnabled = false;
  if (door) {
    DOOR.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '.') continue;
        g.fillStyle = DOOR_COLOURS[row[i]!] ?? CREAM;
        g.fillRect((1 + i) * k, (1 + r) * k, k, k);
      }
    });
  }
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code <= 0) continue;
    const cell = code < f.frames ? code : 63 - 32;
    g.drawImage(f.img, f.x + cell * f.w, f.y, f.w, f.h, (lead + i * f.w) * k, 0, f.w * k, f.h * k);
  }
  el.textContent = '';
  el.append(c);
  el.dataset.drawn = key;
}
