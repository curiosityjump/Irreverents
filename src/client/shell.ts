// The page around the game: crisp scaling, where the view and the touch
// controls sit sideways and upright, and switching off what an iPhone
// browser does to a page by default.
import { VIEW_H, VIEW_W } from './render.ts';

export const isTouchDevice = (): boolean => navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

/** DRAFT: the narrowest strip beside the view that still holds the controls, CSS pixels. */
const BAR_NEEDED = 112;

export interface Layout {
  /** Device pixels per game pixel. */
  scale: number;
  upright: boolean;
}

export function setUpShell(canvas: HTMLCanvasElement, touch: HTMLElement, hint: HTMLElement): { layout(): Layout } {
  let current: Layout = { scale: 1, upright: false };
  const safe = document.getElementById('safe');

  const layout = (): void => {
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pad = safe ? getComputedStyle(safe) : null;
    const inset = { top: parseFloat(pad?.paddingTop ?? '0') || 0, right: parseFloat(pad?.paddingRight ?? '0') || 0, bottom: parseFloat(pad?.paddingBottom ?? '0') || 0, left: parseFloat(pad?.paddingLeft ?? '0') || 0 };
    const touchScreen = isTouchDevice();
    // INTENT: an upright phone can still play: there is always a way out.
    // An iPhone with rotation lock on never turns the page, so a screen that
    // only said "turn your phone" would be a place to be stuck in for good
    // (docs/plan/step-1.md, "Touch first, landscape"). Upright, the same
    // view sits across the top with the controls below it.
    const upright = touchScreen && H > W;

    // INTENT: the canvas is sized in DEVICE pixels: each game pixel covers a
    // whole number of them where the screen allows, and the canvas starts on
    // a whole device pixel, so nothing is blurred by fractional scaling.
    const fit = Math.min((W * dpr) / VIEW_W, (H * dpr) / VIEW_H);
    let scale = fit >= 1 ? Math.floor(fit) : fit;
    const barAt = (k: number): number => (W - (VIEW_W * k) / dpr) / 2 - Math.max(inset.left, inset.right);
    if (upright) {
      while (scale > 1 && (VIEW_H * scale) / dpr > H * 0.55) scale--;
    } else if (touchScreen && scale >= 2 && barAt(scale) < BAR_NEEDED && barAt(scale - 1) >= BAR_NEEDED) {
      // INTENT: controls never cover the play field. On a phone wider than
      // 16:9 the view gives up one step of size so the controls fit in the
      // bars beside it (5x to 4x on an iPhone 14). Where even that leaves
      // no room (a 16:9 phone) see `over` below.
      scale--;
    }
    const cw = (VIEW_W * scale) / dpr;
    const ch = (VIEW_H * scale) / dpr;
    const left = Math.max(0, Math.round(((W - cw) / 2) * dpr)) / dpr;
    const top = upright ? Math.round(inset.top * dpr) / dpr : Math.max(0, Math.round(((H - ch) / 2) * dpr)) / dpr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;

    // The two control zones: the pad's and the action buttons'.
    const gap = 8;
    let lz = { left: inset.left + gap, width: left - inset.left - 2 * gap };
    let rz = { left: left + cw + gap, width: W - inset.right - (left + cw) - 2 * gap };
    let button = 0;
    let over = false;
    if (upright) {
      lz = { left: inset.left + 12, width: Math.min(180, W / 2 - inset.left - 20) };
      const width = W / 2 - inset.right - 20;
      rz = { left: W - inset.right - 12 - width, width };
      button = Math.max(44, Math.min(76, Math.floor((width - gap) / 2)));
    } else if (lz.width < BAR_NEEDED - 2 * gap) {
      // DRAFT: a 16:9 phone (iPhone SE, 6/7/8 and Plus) has no bars, and
      // giving up a size step leaves bars too narrow to use, so the
      // controls sit over the view and are made see-through: only a small
      // faint mark is painted, the touch area stays large, and they hug
      // the bottom corners (docs/plan/step-5.md, "Controls never hide the
      // game"; index.html `#touch.over`; e2e facts i-667x375, i-736x414).
      // To reconsider: the camera keeping the player clear of them (Step 3).
      over = true;
      const edge = 4;
      button = 60;
      lz = { left: inset.left + edge, width: 136 };
      const width = 2 * button + edge;
      rz = { left: W - inset.right - edge - width, width };
    } else {
      lz.width = Math.min(lz.width, 180);
      lz.left = Math.max(inset.left + gap, left - gap - lz.width);
      button = Math.max(44, Math.min(84, rz.width >= 180 ? 84 : Math.floor((rz.width - gap) / 2)));
    }
    const set = (name: string, px: number): void => touch.style.setProperty(name, `${px}px`);
    set('--lz-left', lz.left);
    set('--lz-width', lz.width);
    set('--rz-left', rz.left);
    set('--rz-width', rz.width);
    set('--btn', button);
    set('--bottom', over ? Math.max(4, inset.bottom) : Math.max(12, inset.bottom + 6));
    set('--pad-h', over ? 64 : 76);
    set('--gap', over ? 4 : 8);
    touch.classList.toggle('over', over);
    hint.style.setProperty('--hint-top', `${top + ch + 8}px`);
    hint.hidden = !upright || hint.dataset.dismissed === '1';
    current = { scale, upright };
  };
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', () => setTimeout(layout, 100));
  window.visualViewport?.addEventListener('resize', layout);
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
