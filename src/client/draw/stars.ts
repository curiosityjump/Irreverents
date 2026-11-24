// A rating star, earned or not, drawn as pixels (brief phone-hud-legibility, 2026-11-24, item 5;
// docs/plan/step-8.md, "Look pass", item 9: STAGE CLEARED's stars were the Hall's frame look,
// which reads as a chest at phone size, and an unearned one was the same look dimmed).
// An earned star is a filled gold star; an unearned one the same shape empty: a dark inside
// and a pale edge, at full strength, so the two read apart at a glance. Integer scale only.
// DRAFT: the shape and colours are a stand-in until a star is cut from the approved sheets
// (asked for in docs/mechanisms/asset-requests.md); STAGE CLEARED (draw/stage.ts) and the
// entrance sign's best row (draw/levels.ts) both draw it.

/** 13 by 13: '#' inside the star. */
const SHAPE = [
  '......#......',
  '.....###.....',
  '.....###.....',
  '....#####....',
  '#############',
  '.###########.',
  '..#########..',
  '...#######...',
  '...#######...',
  '..####.####..',
  '..###...###..',
  '.##.......##.',
  '.#.........#.',
];
export const STAR_ART = SHAPE.length;

const inside = (r: number, c: number): boolean => SHAPE[r]?.[c] === '#';
const edge = (r: number, c: number): boolean => inside(r, c) && (!inside(r - 1, c) || !inside(r + 1, c) || !inside(r, c - 1) || !inside(r, c + 1));

const GOLD = '#ffd23f';
const GOLD_EDGE = '#c8780e';
const FLASH = '#fff6c8';
const HOLLOW = '#2b2140';
const HOLLOW_EDGE = '#8a84b0';

/**
 * Draws one star with its top-left at (x, y), `k` device-free game px per art px (a whole number).
 * `flash`: the moment it lights, drawn pale instead of gold (no scaling, so it never crosses its neighbour).
 */
export function drawRatingStar(g: CanvasRenderingContext2D, x: number, y: number, k: number, earned: boolean, flash = false): void {
  const s = Math.max(1, Math.floor(k));
  for (let r = 0; r < SHAPE.length; r++) {
    for (let c = 0; c < SHAPE[r]!.length; c++) {
      if (!inside(r, c)) continue;
      const rim = edge(r, c);
      g.fillStyle = earned ? (flash ? FLASH : rim ? GOLD_EDGE : GOLD) : rim ? HOLLOW_EDGE : HOLLOW;
      g.fillRect(Math.round(x) + c * s, Math.round(y) + r * s, s, s);
    }
  }
}
