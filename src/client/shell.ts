// The page around the game: crisp scaling, the size of the view and where
// the touch controls sit sideways and upright, and switching off what an
// iPhone browser does to a page by default.
import { VIEW_H, VIEW_W, view } from './render.ts';

export const isTouchDevice = (): boolean => navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

/**
 * DRAFT: the view's size in game pixels on a touch screen. The owner,
 * 2026-11-23: "It should play well in portrait too, not just landscape".
 * Upright the view is narrower and taller (about 14 to 16 tiles wide, at
 * least square, up to the tallest room); sideways about 18 to 25 tiles
 * wide and 180 to 225 tall, so the picture fills the screen at a whole
 * number of device pixels per game pixel instead of sitting in black bars.
 * Off a touch screen it stays 320x180 (VIEW_W x VIEW_H).
 */
const UPRIGHT = { wMax: 264, wMin: 192, hMax: 256 };
const SIDEWAYS = { wMin: 288, wMax: 400, hMin: VIEW_H, hMax: 225 };
/** DRAFT: a sideways bar beside the view that holds two columns of buttons, CSS pixels (not counting a notch). */
const BAR = 128;
/** DRAFT: the smallest button anywhere but over the view, CSS pixels (the brief asks 56; the scripted checks 44). */
const MIN_BUTTON = 56;
/**
 * DRAFT: which action sits where in the right thumb's arc, nearest the
 * thumb first. An action not named here goes at the end, so a new action
 * file still gets a button with no change here.
 */
const ARC_ORDER = ['jump', 'attack', 'grab', 'interact', 'switch'];

export interface Layout {
  /** Device pixels per game pixel. */
  scale: number;
  upright: boolean;
}

type Mode = 'desktop' | 'upright' | 'bars' | 'over';

/**
 * Where the action buttons' centres go, in units of one button plus a gap,
 * measured left and up from the corner the thumb pivots on. `arc`: two
 * rings around that corner (two near, three further out), the way a thumb
 * sweeps. `columns`: two staggered columns for a narrow bar beside the view.
 */
function slots(count: number, kind: 'arc' | 'columns'): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (kind === 'arc') {
    const rings = [
      { r: 1.3, angles: [22, 68] },
      { r: 2.35, angles: [12, 45, 78] },
      { r: 3.4, angles: [10, 30, 50, 70, 88] },
    ];
    for (const ring of rings) {
      for (const a of ring.angles) {
        const t = (a * Math.PI) / 180;
        out.push({ x: ring.r * Math.cos(t), y: ring.r * Math.sin(t) });
      }
    }
  } else {
    for (let i = 0; out.length < Math.max(count, 2); i++) {
      out.push({ x: 0.5, y: 0.5 + i }, { x: 1.5, y: 0.8 + i });
    }
  }
  // INTENT: never fewer slots than buttons: every action keeps a button.
  for (let i = out.length; i < count; i++) out.push({ x: 0.5 + (i % 2), y: 4 + Math.floor(i / 2) });
  return out.slice(0, count);
}

export function setUpShell(canvas: HTMLCanvasElement, touch: HTMLElement, hint: HTMLElement): { layout(): Layout } {
  let current: Layout = { scale: 1, upright: false };
  const safe = document.getElementById('safe');
  const g = canvas.getContext('2d');

  const layout = (): void => {
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pad = safe ? getComputedStyle(safe) : null;
    const inset = { top: parseFloat(pad?.paddingTop ?? '0') || 0, right: parseFloat(pad?.paddingRight ?? '0') || 0, bottom: parseFloat(pad?.paddingBottom ?? '0') || 0, left: parseFloat(pad?.paddingLeft ?? '0') || 0 };
    const touchScreen = isTouchDevice();
    const side = Math.max(inset.left, inset.right);
    // INTENT: an upright phone plays as well as a sideways one (the owner,
    // 2026-11-23: "It should play well in portrait too"), and there is always
    // a way out: an iPhone with rotation lock on never turns the page, so a
    // screen that only said "turn your phone" would be a place to be stuck in
    // for good (docs/plan/step-5.md, "Touch first, landscape").
    const upright = touchScreen && H > W;

    // The right thumb's buttons, in the order they fill the arc.
    const buttons = [...touch.querySelectorAll<HTMLElement>('#actions [data-action]')];
    const rank = (b: HTMLElement): number => {
      const i = ARC_ORDER.indexOf(b.dataset.action ?? '');
      return i < 0 ? ARC_ORDER.length : i;
    };
    buttons.sort((a, b) => rank(a) - rank(b));

    // INTENT: the canvas is sized in DEVICE pixels: each game pixel covers a
    // whole number of them where the screen allows, and the canvas starts on
    // a whole device pixel, so nothing is blurred by fractional scaling.
    let mode: Mode = 'desktop';
    let scale = 1;
    let vw = VIEW_W;
    let vh = VIEW_H;
    let button = 60;
    let gap = 8;
    const unit = (): number => button + gap;
    // The arc's extent from its corner, in CSS pixels, for `button`.
    const arcExtent = (kind: 'arc' | 'columns'): { w: number; h: number } => {
      const s = slots(buttons.length, kind);
      return { w: Math.max(...s.map((p) => p.x)) * unit() + button / 2, h: Math.max(...s.map((p) => p.y)) * unit() + button / 2 };
    };
    const padH = (): number => Math.round(button * 1.1);

    if (upright) {
      mode = 'upright';
      // Edge to edge across the screen, about 15 tiles wide.
      scale = Math.max(1, Math.ceil((W * dpr) / UPRIGHT.wMax));
      while (scale > 1 && (W * dpr) / scale < UPRIGHT.wMin) scale--;
      vw = Math.floor((W * dpr) / scale);
      // The controls take what they need at the bottom; the view the rest.
      button = 64;
      while (button > MIN_BUTTON && arcExtent('arc').w + 2 * button + 3 * 12 > W) button -= 2;
      const below = arcExtent('arc').h + Math.max(12, inset.bottom + 6) + 34;
      const room = (H - inset.top - below) * dpr;
      vh = Math.max(Math.min(vw, UPRIGHT.hMax), Math.min(UPRIGHT.hMax, Math.floor(room / scale)));
      // A short screen: give up height before width, but never below 180.
      if ((vh * scale) / dpr > H - inset.top - below) vh = Math.max(VIEW_H, Math.floor(room / scale));
    } else if (touchScreen) {
      // Sideways: the biggest whole scale at which the view fills the
      // screen's height. Prefer the controls in bars beside the view
      // (nothing covers the play field, docs/plan/step-5.md "Controls never
      // hide the game"); put them over its lower corners only when bars
      // would cost a step of scale.
      const tall = (s: number): number => Math.min(SIDEWAYS.hMax, Math.floor((H * dpr) / s));
      const wide = (cssW: number, s: number): number => Math.min(SIDEWAYS.wMax, Math.floor((cssW * dpr) / s));
      const best = (cssW: number): number => {
        for (let s = Math.max(1, Math.floor((H * dpr) / SIDEWAYS.hMin)); s > 1; s--) {
          if (tall(s) >= SIDEWAYS.hMin && wide(cssW, s) >= SIDEWAYS.wMin) return s;
        }
        return 1;
      };
      const barsW = W - 2 * (BAR + side);
      const sBars = best(barsW);
      const sOver = best(W - inset.left - inset.right);
      if (sBars >= sOver) {
        mode = 'bars';
        scale = sBars;
        vw = wide(barsW, scale);
        button = MIN_BUTTON;
        gap = 6;
      } else {
        // DRAFT: where bars would cost a step of scale (a 16:9 phone, or a
        // notched one with both insets), the view fills the screen and the
        // controls sit over its lower corners, see-through: only a small
        // picture or faint label is painted, the touch area stays large
        // (index.html `#touch.over`; e2e facts i-667x375, i-736x414).
        // To reconsider: the camera keeping the player clear of them.
        mode = 'over';
        scale = sOver;
        vw = wide(W - inset.left - inset.right, scale);
        button = 60;
        gap = 4;
      }
      vh = tall(scale);
    } else {
      // Off a touch screen: 320x180 as large as fits.
      const fit = Math.min((W * dpr) / VIEW_W, (H * dpr) / VIEW_H);
      scale = fit >= 1 ? Math.floor(fit) : fit;
    }

    view.w = vw;
    view.h = vh;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
      // Resizing a canvas resets its drawing state.
      if (g) g.imageSmoothingEnabled = false;
    }
    const cw = (vw * scale) / dpr;
    const ch = (vh * scale) / dpr;
    const snap = (px: number): number => Math.round(px * dpr) / dpr;
    const left = Math.max(0, snap((W - cw) / 2));
    const top = mode === 'upright' ? snap(inset.top) : Math.max(0, snap((H - ch) / 2));
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    document.body.dataset.hold = mode;

    // The controls: the stick under the left thumb, the actions in an arc
    // under the right.
    const bottom = snap(mode === 'over' ? Math.max(4, inset.bottom) : Math.max(12, inset.bottom + 6));
    const edge = mode === 'over' ? 4 : mode === 'bars' ? 6 : 12;
    const kind: 'arc' | 'columns' = mode === 'bars' ? 'columns' : 'arc';
    const right = W - inset.right - edge;
    let lz: { left: number; width: number };
    if (mode === 'bars') {
      lz = { left: inset.left + edge, width: left - inset.left - 2 * edge };
    } else if (mode === 'over') {
      lz = { left: inset.left + edge, width: 136 };
    } else {
      lz = { left: inset.left + edge, width: Math.min(2 * Math.round(button * 1.15), W - arcExtent(kind).w - 3 * edge) };
    }
    lz.width = Math.floor(lz.width / 2) * 2;
    const ph = mode === 'over' ? 64 : padH();
    // Upright the stick sits level with the arc's near ring, where a thumb rests.
    const padBottom = mode === 'upright' ? bottom + Math.max(0, 0.9 * unit() - ph / 2) : bottom;
    const s = slots(buttons.length, kind);
    buttons.forEach((b, i) => {
      const p = s[i]!;
      b.style.left = `${snap(right - p.x * unit() - button / 2)}px`;
      b.style.top = `${snap(H - bottom - p.y * unit() - button / 2)}px`;
    });

    // INTENT: the button pictures are 24x24 pixel art, drawn at a whole
    // number of DEVICE pixels per art pixel and starting on a whole device
    // pixel, for the same reason as the canvas: nothing blurred. DRAFT: the
    // sizes aimed for (about 34 CSS px over the view, 48 in a bar, the
    // whole button upright).
    const aim = mode === 'over' ? 34 : mode === 'upright' ? button : 48;
    let k = Math.max(1, Math.round((aim * dpr) / 24));
    while (k > 1 && (24 * k) / dpr > Math.min(button, ph, lz.width / 2)) k--;
    const icon = (24 * k) / dpr;
    const set = (name: string, px: number): void => touch.style.setProperty(name, `${px}px`);
    set('--icon', icon);
    set('--icon-off', snap((button - icon) / 2));
    set('--pad-icon-x', snap((lz.width / 2 - icon) / 2));
    set('--pad-icon-y', snap((ph - icon) / 2));
    set('--lz-left', snap(lz.left));
    set('--lz-width', lz.width);
    set('--btn', button);
    set('--bottom', snap(padBottom));
    set('--pad-h', ph);
    touch.classList.toggle('over', mode === 'over');
    hint.style.setProperty('--hint-top', `${top + ch + 10}px`);
    hint.hidden = !upright || hint.dataset.dismissed === '1';
    current = { scale, upright };
  };
  layout();
  // The buttons are built after the page loads its content; place them once they exist.
  new MutationObserver(layout).observe(touch, { childList: true });
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', () => setTimeout(layout, 100));
  window.visualViewport?.addEventListener('resize', layout);
  // INTENT: the line under the view can always be dismissed (there is always a way out).
  hint.querySelector('button')?.addEventListener('click', () => {
    hint.dataset.dismissed = '1';
    hint.hidden = true;
  });

  // INTENT: no zoom on double tap or pinch, no pull-to-refresh, no rubber
  // band, no long-press menu, no text selection: on the game surface every
  // touch is a control. CSS does most of it (touch-action, overscroll-behavior
  // in index.html); these catch what iPhone Safari still does.
  const stop = (e: Event): void => e.preventDefault();
  for (const type of ['touchmove', 'gesturestart', 'gesturechange', 'dblclick', 'contextmenu', 'selectstart']) {
    document.addEventListener(type, stop, { passive: false });
  }
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      // A second tap soon after the first would zoom; a tap on a button must still click.
      if (now - lastTouchEnd < 350 && !(e.target instanceof Element && e.target.closest('button'))) e.preventDefault();
      lastTouchEnd = now;
    },
    { passive: false },
  );
  return { layout: () => current };
}
