// Step 17 (docs/mechanisms/saves.md, "The start screen"): what a page shows
// before it joins a world, and the small in-play menu that leads back to it.
// The owner: "a start screen where players can start a new game, continue,
// join the same game, etc."
//
// INTENT: `?room=<name>` never sees any of this (src/client/main.ts decides
// before calling here): every scripted check joins `?room=check-…` and
// must go straight into play.
import type { Content } from '../content/types.ts';
import { cleanGameCode, codeFromText, GAME_CODE_LENGTH, GAME_PREFIX, gameCode, isGameCode, makeGameCode } from '../net/game-code.ts';
import { DEFAULT_WORLD } from '../net/protocol.ts';
import { lookTable } from '../content/kinds/looks.ts';
import { look } from './draw/looks.ts';
import { stageClock } from '../sim/stage.ts';

/** A key-value store that never throws (main.ts's `storage`: phone storage, else memory). */
export interface Kept {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

/** What the start screen tells the page's debug object (`irreverents.start`), for the checks. */
export interface StartRecord {
  /** Which screen is up: the start screen, a shared link's one tap, or none (in play). */
  shown: 'start' | 'link' | 'none';
  /** The last thing it said (an unknown code, no connection), or ''. */
  message: string;
  /** The codes Continue lists, newest first. */
  continues: string[];
}

/** DRAFT: phone storage keys. `games`: the games this phone played, newest first (localStorage). `playing`: the world this tab is in (sessionStorage), so a reload after a deploy goes straight back in. */
const GAMES_KEY = 'irreverents.games';
const PLAYING_KEY = 'irreverents.playing';
/** DRAFT: how many games Continue remembers, and how many it shows. */
const GAMES_KEPT = 12;
const GAMES_SHOWN = 3;

/** The games this phone has played, newest first. A private tab may have none. */
export function playedGames(device: Kept): string[] {
  try {
    const raw = JSON.parse(device.get(GAMES_KEY) ?? '[]') as unknown;
    return Array.isArray(raw) ? raw.filter((c): c is string => typeof c === 'string' && isGameCode(c)) : [];
  } catch {
    return [];
  }
}

function forgetGame(device: Kept, code: string): void {
  device.set(GAMES_KEY, JSON.stringify(playedGames(device).filter((c) => c !== code)));
}

function rememberGame(device: Kept, code: string): void {
  device.set(GAMES_KEY, JSON.stringify([code, ...playedGames(device).filter((c) => c !== code)].slice(0, GAMES_KEPT)));
}

/** The address that opens a game's one-tap join. */
export function gameLink(code: string): string {
  return `${location.origin}${location.pathname}?game=${code}`;
}

// ---- Pixel words ---------------------------------------------------------

/**
 * Words in the game's own font (content/looks/font.json, `font-light`:
 * ASCII 32–126 in one strip), drawn on a small canvas at a whole number of
 * device pixels per font pixel. Until the font has loaded the words are
 * plain text, so a missing picture never leaves a blank button.
 */
function words(content: Content, text: string, cssPerPixel: number): HTMLElement {
  const span = document.createElement('span');
  span.className = 'st-words';
  span.textContent = text;
  const draw = (): boolean => {
    const f = look(content, 'font-light');
    if (!f) return false;
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.round(cssPerPixel * dpr));
    const c = document.createElement('canvas');
    c.width = Math.max(1, text.length * f.w - 1) * k;
    c.height = f.h * k;
    c.style.width = `${c.width / dpr}px`;
    c.style.height = `${c.height / dpr}px`;
    const g = c.getContext('2d');
    if (!g) return false;
    g.imageSmoothingEnabled = false;
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i) - 32;
      if (code === 0) continue;
      if (code < 0 || code >= f.frames) code = 63 - 32;
      g.drawImage(f.img, f.x + code * f.w, f.y, f.w, f.h, i * f.w * k, 0, f.w * k, f.h * k);
    }
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', text);
    span.textContent = '';
    span.append(c);
    return true;
  };
  if (!draw()) {
    const t = setInterval(() => draw() && clearInterval(t), 100);
    setTimeout(() => clearInterval(t), 20000);
  }
  return span;
}

/** A level's completion pie (the look `level-pie-<n>`), `cssPerPixel` CSS pixels a game pixel; a plain ring until it loads. */
function pieImage(content: Content, quarters: number, cssPerPixel: number): HTMLElement {
  const span = document.createElement('span');
  span.className = 'st-pie';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', ['not yet', 'a quarter', 'half', 'three quarters', 'all'][quarters] ?? '');
  const draw = (): boolean => {
    const p = look(content, `level-pie-${quarters}`);
    if (!p) return false;
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.round(cssPerPixel * dpr));
    const c = document.createElement('canvas');
    c.width = p.w * k;
    c.height = p.h * k;
    c.style.width = `${c.width / dpr}px`;
    c.style.height = `${c.height / dpr}px`;
    const g = c.getContext('2d');
    if (!g) return false;
    g.imageSmoothingEnabled = false;
    g.drawImage(p.img, p.x, p.y, p.w, p.h, 0, 0, p.w * k, p.h * k);
    span.replaceChildren(c);
    return true;
  };
  if (!draw()) {
    const t = setInterval(() => draw() && clearInterval(t), 100);
    setTimeout(() => clearInterval(t), 20000);
  }
  return span;
}

/**
 * Step 14 slice B: a level's pieces in a row, grey with the found ones gold
 * (the `piece-grey` / `piece-gold` looks), for a menu row. INTENT: pieces,
 * never a digit; the label says only how many are found, for a screen reader.
 */
function piecesImage(content: Content, pieces: boolean[], cssPerPixel: number): HTMLElement {
  const span = document.createElement('span');
  span.className = 'st-pieces';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', pieces.every(Boolean) ? 'every piece found' : pieces.some(Boolean) ? 'some pieces found' : 'no pieces found');
  span.dataset.pieces = pieces.map((p) => (p ? 'gold' : 'grey')).join(' ');
  const draw = (): boolean => {
    const grey = look(content, 'piece-grey');
    const gold = look(content, 'piece-gold');
    if (!grey || !gold) return false;
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.round(cssPerPixel * dpr));
    const c = document.createElement('canvas');
    const step = grey.w + 1;
    c.width = (pieces.length * step - 1) * k;
    c.height = grey.h * k;
    c.style.width = `${c.width / dpr}px`;
    c.style.height = `${c.height / dpr}px`;
    const g = c.getContext('2d');
    if (!g) return false;
    g.imageSmoothingEnabled = false;
    pieces.forEach((on, i) => {
      const p = on ? gold : grey;
      g.drawImage(p.img, p.x, p.y, p.w, p.h, i * step * k, 0, p.w * k, p.h * k);
    });
    span.replaceChildren(c);
    return true;
  };
  if (!draw()) {
    const t = setInterval(() => draw() && clearInterval(t), 100);
    setTimeout(() => clearInterval(t), 20000);
  }
  return span;
}

/**
 * Step 22 push 3 (docs/mechanisms/stages.md): a stage's best clear for a menu
 * row, three stars (the `hall-frame-star` look, P04's Hall atlas), the earned
 * ones lit and the rest dim. DRAFT: dim is the same star at a third opacity.
 */
function starsImage(content: Content, stars: number, cssPerPixel: number): HTMLElement {
  const span = document.createElement('span');
  span.className = 'st-stars';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', `best: ${stars} of 3 stars`);
  span.dataset.stars = String(stars);
  const draw = (): boolean => {
    const st = look(content, 'hall-frame-star');
    if (!st) return false;
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.round(cssPerPixel * dpr));
    const step = st.w + 1;
    const c = document.createElement('canvas');
    c.width = (3 * step - 1) * k;
    c.height = st.h * k;
    c.style.width = `${c.width / dpr}px`;
    c.style.height = `${c.height / dpr}px`;
    const g = c.getContext('2d');
    if (!g) return false;
    g.imageSmoothingEnabled = false;
    for (let i = 0; i < 3; i++) {
      g.globalAlpha = i < stars ? 1 : 0.3;
      g.drawImage(st.img, st.x, st.y, st.w, st.h, i * step * k, 0, st.w * k, st.h * k);
    }
    span.replaceChildren(c);
    return true;
  };
  if (!draw()) {
    const t = setInterval(() => draw() && clearInterval(t), 100);
    setTimeout(() => clearInterval(t), 20000);
  }
  return span;
}

/**
 * Step 9 (D-082: knowing where a source is stays valuable;
 * docs/mechanisms/powers.md): one lit mark per power source found in this
 * level, the power's own icon (look ids, from `world.sources`), for a menu row.
 * INTENT: icons, never a digit; nothing about a source not yet found.
 */
function sourcesImage(content: Content, icons: string[], cssPerPixel: number): HTMLElement {
  const span = document.createElement('span');
  span.className = 'st-sources';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', 'a power source found here');
  span.dataset.sources = icons.join(' ');
  const draw = (): boolean => {
    const ls = icons.map((id) => look(content, id));
    if (ls.some((l) => !l)) return false;
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.round(cssPerPixel * dpr));
    const size = 10;
    const c = document.createElement('canvas');
    c.width = (icons.length * (size + 2) - 2) * k;
    c.height = size * k;
    c.style.width = `${c.width / dpr}px`;
    c.style.height = `${c.height / dpr}px`;
    const g = c.getContext('2d');
    if (!g) return false;
    g.imageSmoothingEnabled = false;
    ls.forEach((l, i) => g.drawImage(l!.img, l!.x, l!.y, l!.w, l!.h, i * (size + 2) * k, 0, size * k, size * k));
    span.replaceChildren(c);
    return true;
  };
  if (!draw()) {
    const t = setInterval(() => draw() && clearInterval(t), 100);
    setTimeout(() => clearInterval(t), 20000);
  }
  return span;
}

// ---- The title picture ---------------------------------------------------

/** DRAFT: the owner's title screen (content/looks/title.json); the whole picture, and the wordmark's box inside it. */
const TITLE_LOOK = 'start-title-screen';
const WORDMARK_LOOK = 'start-title-wordmark';

/**
 * The owner's title screen behind the start screen (docs/plan/step-17.md,
 * "Title screen"). The whole picture is fitted inside the safe area,
 * nearest-neighbour at device pixels, centred and against the top: sideways
 * it fills the height, upright it spans the width with the night ground
 * below. A spacer keeps every choice below the wordmark's box, so no button
 * covers the title. Null when content has no title picture: the caller
 * draws the old pixel-font title instead (art is data).
 */
function titlePicture(content: Content): { back: HTMLElement; spacer: HTMLElement; stop(): void } | null {
  const table = lookTable(content);
  const whole = table.get(TITLE_LOOK);
  const mark = table.get(WORDMARK_LOOK);
  if (!whole) return null;
  const back = el('div', { class: 'st-back' });
  const c = el('canvas', { role: 'img', 'aria-label': 'Irreverents' });
  back.append(c);
  const spacer = el('div', { class: 'st-spacer' });
  // The wordmark's bottom edge on the picture (the whole picture when the file names no box).
  const clearTo = mark ? mark.src[1] + mark.src[3] - whole.src[1] : whole.src[3];
  const layout = (): boolean => {
    const r = back.getBoundingClientRect();
    const [, , w, h] = whole.src;
    const tall = r.height > r.width * 1.2;
    const l = look(content, TITLE_LOOK);
    if (!l) return false;
    const dpr = window.devicePixelRatio || 1;
    spacer.style.height = '0px';
    const parent = spacer.parentElement;
    const scrolled = parent ? parent.scrollTop : 0;
    const startsAt = spacer.getBoundingClientRect().top + scrolled;
    if (tall && mark && r.width > 0 && r.height > 0) {
      // DRAFT (brief phone-hud-legibility, third pass: upright the picture spanned the width and left the
      // bottom third bare, and the sound button sat over its corner): upright, the wordmark (its box on the
      // picture) sits at the top between margins the sound and menu buttons keep; the choices follow on the
      // night ground; under the last of them the picture's scene below the wordmark fills the screen's
      // foot, its middle scaled to that space and its sides cropped. Sideways is unchanged (the whole picture).
      // INTENT (Step 17, e2e start-shown): the choices still start just under the wordmark, so the code
      // field stays in the upper half (the keyboard covers the lower).
      const [mx, my, mw, mh] = mark.src;
      const margin = 48;
      const sw = Math.max(0.5, Math.min((r.width - 2 * margin) / mw, (r.height * 0.2) / mh));
      const top = 6;
      const band = top + mh * sw + 6;
      spacer.style.height = `${Math.max(0, Math.ceil(r.top + band + 4 - startsAt))}px`;
      // Where the last choice ends, now the spacer is set (screen px, from the picture's top).
      let last = band;
      for (const k of Array.from(parent?.children ?? [])) if (k !== back && k !== spacer) last = Math.max(last, k.getBoundingClientRect().bottom - r.top);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.style.width = `${c.width / dpr}px`;
      c.style.height = `${c.height / dpr}px`;
      const g = c.getContext('2d');
      if (!g) return false;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, c.width, c.height);
      const sceneTop = Math.round(last + 10);
      const room = r.height - sceneTop;
      if (room > 40) {
        const below = clearTo; // the picture's rows under the wordmark
        const sc = Math.max(r.width / w, room / (h - below));
        const srcW = Math.min(w, r.width / sc);
        const srcH = Math.min(h - below, room / sc);
        // Bottom-aligned: the path and flowers at the screen's foot.
        g.drawImage(l.img, l.x + Math.round((w - srcW) / 2), l.y + h - srcH, srcW, srcH, 0, Math.round(sceneTop * dpr), c.width, c.height - Math.round(sceneTop * dpr));
        // Its top edge fades into the night ground.
        const fade = Math.round(18 * dpr);
        const grad = g.createLinearGradient(0, sceneTop * dpr, 0, sceneTop * dpr + fade);
        grad.addColorStop(0, 'rgba(20, 18, 40, 1)');
        grad.addColorStop(1, 'rgba(20, 18, 40, 0)');
        g.fillStyle = grad;
        g.fillRect(0, Math.round(sceneTop * dpr), c.width, fade);
      }
      const wx = Math.round(((r.width - mw * sw) / 2) * dpr);
      g.drawImage(l.img, l.x + mx - whole.src[0], l.y + my - whole.src[1], mw, mh, wx, Math.round(top * dpr), Math.round(mw * sw * dpr), Math.round(mh * sw * dpr));
      return true;
    }
    // Sideways (and a squarish screen): the whole picture fitted inside the safe area, the choices below the wordmark.
    const s = Math.min(r.width / w, r.height / h, tall ? Math.max(0, window.innerHeight * 0.32 - 8 - r.top) / h : Infinity);
    if (!(s > 0)) return false;
    const under = (to: number): number => r.top + to * s + 4;
    const end = tall ? Math.max(under(clearTo), Math.min(under(h), window.innerHeight * 0.32)) : under(clearTo);
    spacer.style.height = `${Math.max(0, Math.ceil(end - startsAt))}px`;
    const cw = Math.round(w * s * dpr);
    const ch = Math.round(h * s * dpr);
    c.width = cw;
    c.height = ch;
    c.style.width = `${cw / dpr}px`;
    c.style.height = `${ch / dpr}px`;
    const g = c.getContext('2d');
    if (!g) return false;
    g.imageSmoothingEnabled = false;
    g.drawImage(l.img, l.x, l.y, l.w, l.h, 0, 0, cw, ch);
    return true;
  };
  let t = 0;
  const retry = (): void => {
    clearInterval(t);
    if (layout()) return;
    t = window.setInterval(() => layout() && clearInterval(t), 100);
    setTimeout(() => clearInterval(t), 20000);
  };
  window.addEventListener('resize', retry);
  window.addEventListener('orientationchange', retry);
  requestAnimationFrame(retry);
  return {
    back,
    spacer,
    stop: () => {
      clearInterval(t);
      window.removeEventListener('resize', retry);
      window.removeEventListener('orientationchange', retry);
    },
  };
}

/** The top of the start screen: the owner's title picture when content has it, else the pixel-font title. */
function titleTop(content: Content, root: HTMLElement): (() => void) | null {
  const pic = titlePicture(content);
  if (!pic) {
    root.append(el('div', { class: 'st-title' }, words(content, 'Irreverents', 4)));
    return null;
  }
  root.classList.add('pictured');
  // INTENT: the picture's own lettering is the title; the old text title is not also drawn (the brief).
  root.append(pic.back, pic.spacer);
  return pic.stop;
}

// ---- Look ----------------------------------------------------------------

const CSS = `
/* DRAFT (Step 17): the start screen and the in-play menu, in the surround's night ramp (index.html). Big tap targets: every choice is at least 52 px tall. */
#start, #game-menu, #gone { position: fixed; inset: 0; z-index: 20; overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch;
  padding: max(12px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  box-sizing: border-box; background: rgba(20, 18, 40, .96); display: flex; flex-direction: column; align-items: center; }
#start[hidden], #game-menu[hidden], #menu-btn[hidden] { display: none; }
#start .st-title { margin: 6px 0 14px; filter: drop-shadow(0 3px 0 #0b0a18); }
/* Two columns side by side from 568 px wide (an iPhone SE sideways): each at least 250 px, at most 330. */
#start .st-cols { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 10px 20px; width: 100%; }
#start .st-col { display: flex; flex-direction: column; gap: 10px; flex: 1 1 250px; min-width: 0; max-width: 330px; }
.st-btn { -webkit-appearance: none; appearance: none; margin: 0; width: 100%; min-height: 52px; padding: 8px 14px; border: 0; border-radius: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px; touch-action: manipulation;
  background: radial-gradient(circle at 50% 30%, var(--night2), var(--night1) 80%); box-shadow: inset 0 0 0 2px rgba(210, 207, 224, .55), inset 0 -4px 0 2px rgba(20, 18, 40, .6);
  color: var(--cream); font: 700 15px/1.1 ui-rounded, "SF Pro Rounded", system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; }
.st-btn:active, .st-btn.on { background: radial-gradient(circle at 50% 45%, var(--night3), var(--night2) 80%); }
.st-btn.big { min-height: 96px; }
.st-btn.quiet { min-height: 44px; background: transparent; box-shadow: inset 0 0 0 1px rgba(210, 207, 224, .35); }
.st-label { color: rgba(210, 207, 224, .7); margin: 8px 2px 0; }
.st-join { display: flex; gap: 10px; }
.st-join input { flex: 1; min-width: 0; height: 52px; box-sizing: border-box; border-radius: 12px; border: 2px solid rgba(210, 207, 224, .55); background: var(--night0); color: var(--cream);
  /* INTENT: 16 px or more, or iPhone Safari zooms the page when the field is focused. */
  font: 700 24px/1 ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .35em; text-align: center; text-transform: uppercase; padding: 0 0 0 .35em;
  /* The page is unselectable everywhere else; a field that inherits it cannot be typed in on iPhone. */
  -webkit-user-select: text; user-select: text; touch-action: manipulation; }
.st-join .st-btn { width: 108px; flex: none; }
.st-say { min-height: 22px; color: var(--cream); text-align: center; }
.st-say:empty { display: none; }
#menu-btn { position: fixed; z-index: 15; left: max(6px, env(safe-area-inset-left)); top: max(6px, env(safe-area-inset-top)); width: 44px; height: 44px; margin: 0; padding: 0; border: 0;
  border-radius: 10px; background: radial-gradient(circle, rgba(15, 15, 28, .5) 15.5px, transparent 16.5px); touch-action: manipulation; -webkit-appearance: none; appearance: none; }
/* Quiet over the view (docs/plan/step-5.md, "Controls never hide the game"): three faint bars in a 44 px touch area, on a dark disc like the sound button's (DRAFT, brief phone-hud-legibility: with no backing it blended into the scene). */
#menu-btn i { position: absolute; left: 13px; width: 18px; height: 2px; background: rgba(244, 241, 222, .7); box-shadow: 0 0 0 1px rgba(15, 15, 28, .55); }
#menu-btn i:nth-child(1) { top: 15px; } #menu-btn i:nth-child(2) { top: 21px; } #menu-btn i:nth-child(3) { top: 27px; }
#menu-btn:active { background: rgba(244, 241, 222, .2); }
/* DRAFT (title screen): the owner's picture behind the choices, inside the safe area (clear of the notch and the home bar), on the night ground. */
#start .st-back { position: fixed; z-index: -1; pointer-events: none; display: flex; justify-content: center; align-items: flex-start;
  top: env(safe-area-inset-top); right: env(safe-area-inset-right); bottom: env(safe-area-inset-bottom); left: env(safe-area-inset-left); }
#start .st-back canvas { display: block; }
/* DRAFT (brief phone-hud-legibility, second pass): upright the ground under the choices is the game's dotted night, as under the controls in play, not a flat void. */
#start.pictured { background-image: radial-gradient(rgba(76, 72, 144, .22) 1px, transparent 1.5px); background-size: 8px 8px; }
#start .st-spacer { flex: none; width: 100%; }
/* No games to continue: the empty column takes no room, so the choices sit centred under the title. */
#start .st-col:empty { display: none; }
/* Words with no button of their own sit on a dark plate, so they read over the picture. */
#start.pictured .st-label, #start.pictured .st-say:not(:empty) { align-self: flex-start; padding: 3px 8px; border-radius: 6px; background: rgba(20, 18, 40, .82); }
#start.pictured .st-say:not(:empty) { align-self: stretch; }
#start.pictured .st-btn.quiet { background: rgba(20, 18, 40, .82); }
/* Short screens (a phone sideways): every choice still 44 px, packed closer, so all fit below the wordmark. */
@media (max-height: 420px) {
  #start.pictured .st-col { gap: 8px; }
  #start.pictured .st-btn { min-height: 44px; }
  #start.pictured .st-btn.big { min-height: 64px; }
  #start.pictured .st-join input { height: 44px; }
  #start.pictured .st-label { margin-top: 0; }
}
#game-menu, #gone { justify-content: center; }
#gone .st-col { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 330px; }
#gone .st-say { font-size: 16px; line-height: 1.4; }
.st-link { font: 500 13px/1.35 ui-monospace, "SF Mono", Menlo, monospace; color: var(--pale); word-break: break-all; text-align: center; -webkit-user-select: text; user-select: text; }
#game-menu .st-levels { display: flex; flex-direction: column; gap: 6px; }
#game-menu .st-level { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 10px; min-height: 32px; border-radius: 6px; background: rgba(34, 31, 68, .85); }
#game-menu .st-level .st-pieces { flex-basis: 100%; display: flex; padding-bottom: 2px; }
#game-menu .st-level .st-sources { display: inline-flex; align-items: center; margin-left: 4px; }
#game-menu .st-pie { display: inline-flex; width: 24px; height: 24px; border-radius: 50%; }
#game-menu .st-col { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 330px; align-items: stretch; }
#game-menu .st-code { align-self: center; margin: 4px 0 8px; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}

function styleOnce(): void {
  if (document.getElementById('start-style')) return;
  const s = el('style', { id: 'start-style' });
  s.textContent = CSS;
  document.head.append(s);
}

/** What the server says about a code: true, false, or null when it could not be asked. */
async function exists(code: string): Promise<boolean | null> {
  try {
    const res = await fetch(`game/${code}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return ((await res.json()) as { exists?: unknown }).exists === true;
  } catch {
    return null;
  }
}

// ---- The start screen ----------------------------------------------------

export interface StartOptions {
  content: Content;
  params: URLSearchParams;
  /** This phone's storage (localStorage, else memory). */
  device: Kept;
  /** This tab's storage (sessionStorage, else memory). */
  tab: Kept;
  /** Called once, with the world to join. */
  play(world: string): void;
}

/**
 * Decides what a page opened without `?room=` does: straight back into the
 * world this tab was playing (a reload, the reload after a deploy), a
 * shared `?game=CODE` link's one tap, or the start screen.
 */
export function showStart(opts: StartOptions): StartRecord {
  const { content, device, tab } = opts;
  const record: StartRecord = { shown: 'none', message: '', continues: [] };
  const linked = cleanGameCode(opts.params.get('game') ?? '');
  const linkCode = linked.length === GAME_CODE_LENGTH && isGameCode(linked) ? linked : null;
  const playing = tab.get(PLAYING_KEY) ?? '';

  // Step 17 hardening (item 10): the owner's `?tune` link must survive the
  // start screen. INTENT: every address this screen writes keeps `tune`.
  const tune = opts.params.has('tune');
  const address = (code: string | null): string => {
    const parts = [...(code ? [`game=${code}`] : []), ...(tune ? ['tune'] : [])];
    return parts.length > 0 ? `?${parts.join('&')}` : location.pathname;
  };
  let done = false;
  let stopTitle: (() => void) | null = null;
  const go = (world: string): void => {
    if (done) return;
    done = true;
    tab.set(PLAYING_KEY, world);
    const code = gameCode(world);
    if (code) rememberGame(device, code);
    // The address says where this tab is: a game's is its share link.
    try {
      history.replaceState(null, '', address(code));
    } catch {
      // an address that cannot be changed changes nothing else
    }
    root.remove();
    stopTitle?.();
    record.shown = 'none';
    opts.play(world);
  };

  // A reload of a tab that was playing goes straight back in (no tap, as before Step 17).
  if (linkCode && playing === GAME_PREFIX + linkCode) {
    opts.play(playing);
    return record;
  }
  if (!linkCode && playing === DEFAULT_WORLD && !opts.params.has('game')) {
    opts.play(DEFAULT_WORLD);
    return record;
  }

  styleOnce();
  const root = el('div', { id: 'start' });
  const say = el('div', { class: 'st-say', 'aria-live': 'polite' });
  const tell = (text: string): void => {
    record.message = text;
    say.replaceChildren(...(text ? [words(content, text, 2)] : []));
  };
  const button = (label: string, name: string, cls = '', scale = 2): HTMLButtonElement => {
    const b = el('button', { type: 'button', class: `st-btn ${cls}`.trim(), 'data-start': name, 'aria-label': label });
    b.append(words(content, label, scale));
    return b;
  };

  if (linkCode) {
    // A friend's link: one big tap (it is also the tap that starts sound),
    // INTENT: with the way back to the start screen beside it.
    record.shown = 'link';
    const join = button(`Join ${linkCode}`, 'join-link', 'big', 3);
    join.addEventListener('click', () => go(GAME_PREFIX + linkCode));
    const back = button('Start screen', 'to-start', 'quiet');
    back.addEventListener('click', () => {
      // INTENT: forget the world this tab last played, or the start screen
      // would go straight back into it (the review's item 13).
      tab.set(PLAYING_KEY, '');
      location.href = location.pathname + (tune ? '?tune' : '');
    });
    const col = el('div', { class: 'st-col' }, join, back);
    stopTitle = titleTop(content, root);
    root.append(col);
    document.body.append(root);
    return record;
  }

  record.shown = 'start';
  const newGame = button('New game', 'new');
  newGame.addEventListener('click', async () => {
    if (newGame.disabled) return;
    newGame.disabled = true;
    // DRAFT: the page makes the code; a code already in use is passed over (a few tries; if the server cannot be asked, the first is used).
    let code = makeGameCode(Math.random);
    for (let i = 0; i < 5 && (await exists(code)) === true; i++) code = makeGameCode(Math.random);
    go(GAME_PREFIX + code);
  });

  const field = el('input', {
    type: 'text',
    id: 'join-code',
    'aria-label': 'Game code',
    placeholder: '-'.repeat(GAME_CODE_LENGTH),
    autocapitalize: 'characters',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    enterkeyhint: 'go',
    inputmode: 'text',
  });
  // Upper-cased as typed; only the code's letters stay. No maxlength: a
  // pasted link or message is read whole first (codeFromText), then cut.
  field.addEventListener('input', () => {
    const clean = codeFromText(field.value);
    if (field.value !== clean) field.value = clean;
    if (record.message) tell('');
  });
  const join = button('Join', 'join');
  const tryJoin = async (): Promise<void> => {
    const code = codeFromText(field.value);
    if (code.length !== GAME_CODE_LENGTH) return tell(`A code is ${GAME_CODE_LENGTH} letters`);
    join.disabled = true;
    const there = await exists(code);
    join.disabled = false;
    // INTENT: an unknown code says so and stays on this screen.
    if (there === false) return tell(`No game ${code}`);
    if (there === null) return tell('No connection. Try again');
    field.blur();
    go(GAME_PREFIX + code);
  };
  join.addEventListener('click', () => void tryJoin());
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void tryJoin();
  });

  const kingdom = button("Everyone's kingdom", 'kingdom');
  kingdom.addEventListener('click', () => go(DEFAULT_WORLD));
  // Every fixed choice in one column, so sideways (340 px high) the Continue column beside it never pushes one off screen.
  const left = el('div', { class: 'st-col' }, newGame, el('div', { class: 'st-label' }, words(content, 'Join a friend', 2)), el('div', { class: 'st-join' }, field, join), say, kingdom);
  const right = el('div', { class: 'st-col' });
  record.continues = playedGames(device).slice(0, GAMES_SHOWN);
  if (record.continues.length > 0) {
    right.append(el('div', { class: 'st-label' }, words(content, 'Continue', 2)));
    for (const code of record.continues) {
      const b = button(`Continue ${code}`, `continue-${code}`);
      b.addEventListener('click', async () => {
        if (b.disabled) return;
        b.disabled = true;
        const there = await exists(code);
        b.disabled = false;
        // A game whose save is gone would start empty under its old code: say so, and forget it here.
        if (there === false) {
          forgetGame(device, code);
          record.continues = record.continues.filter((c) => c !== code);
          b.remove();
          return tell('That game is gone');
        }
        if (there === null) return tell('No connection. Try again');
        go(GAME_PREFIX + code);
      });
      right.append(b);
    }
  }

  stopTitle = titleTop(content, root);
  root.append(el('div', { class: 'st-cols' }, left, right));
  document.body.append(root);
  return record;
}

// ---- In play: the menu ---------------------------------------------------

export interface MenuOptions {
  content: Content;
  worldName: string;
  tab: Kept;
  /** Leaving on purpose, before the page goes to the start screen. */
  leave(): void;
  /** Step 14 slice A (additive): the levels discovered in this world, read each time the panel opens. */
  levels?(): { id: string; name: string; quarters: number; pieces?: boolean[]; sources?: string[]; best?: { stars: number; ticks: number } }[];
}

/**
 * A small button in the top-left corner (the sound button has the
 * top-right), opening a panel: the game's code and Share (a kept game
 * only), and Back to the start screen. INTENT: the way out of any world to
 * the start screen; never remove it, `?room=` worlds included.
 */
export function setUpMenu(opts: MenuOptions): void {
  const { content } = opts;
  styleOnce();
  const code = gameCode(opts.worldName);
  const btn = el('button', { type: 'button', id: 'menu-btn', 'aria-label': 'Menu' }, el('i'), el('i'), el('i'));
  const panel = el('div', { id: 'game-menu', hidden: '' });
  const col = el('div', { class: 'st-col' });
  const say = el('div', { class: 'st-say', 'aria-live': 'polite' });
  const tell = (text: string): void => void say.replaceChildren(...(text ? [words(content, text, 2)] : []));
  const button = (label: string, name: string, cls = ''): HTMLButtonElement => {
    const b = el('button', { type: 'button', class: `st-btn ${cls}`.trim(), 'data-menu': name, 'aria-label': label });
    b.append(words(content, label, 2));
    return b;
  };
  if (code) {
    col.append(el('div', { class: 'st-label' }, words(content, 'This game', 2)), el('div', { class: 'st-code', 'data-code': code }, words(content, code, 6)));
    const share = button('Share', 'share');
    share.addEventListener('click', () => {
      const url = gameLink(code);
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (typeof nav.share === 'function') {
        nav.share({ title: 'Irreverents', text: `Join my game: ${code}`, url }).catch(() => {});
        return;
      }
      // Neither share nor copy: the code is already large above; the link goes under it, small and wrapped.
      const showLink = (): void => {
        tell('');
        const line = el('div', { class: 'st-link' });
        line.textContent = url.replace(/^https?:\/\//, '');
        say.replaceChildren(line);
      };
      const copy = navigator.clipboard?.writeText(url);
      if (copy) copy.then(() => tell('Link copied'), showLink);
      else showLink();
    });
    col.append(share);
  } else if (opts.worldName === DEFAULT_WORLD) {
    col.append(el('div', { class: 'st-label' }, words(content, "Everyone's kingdom", 2)));
  }
  const back = button('Back to the start screen', 'back');
  back.addEventListener('click', () => {
    opts.leave();
    opts.tab.set(PLAYING_KEY, '');
    location.href = location.pathname + (new URLSearchParams(location.search).has('tune') ? '?tune' : '');
  });
  // INTENT: there is always a way out of the panel too: Close, or a tap outside it.
  const close = button('Close', 'close', 'quiet');
  const shut = (): void => {
    panel.hidden = true;
    tell('');
  };
  close.addEventListener('click', shut);
  panel.addEventListener('click', (e) => {
    if (e.target === panel) shut();
  });
  // Step 14 slice A (D-078, D-079): a row per discovered level, its name and its completion pie.
  // INTENT: a pie, never a digit, and nothing about a level not yet found or which place is missing.
  const places = el('div', { class: 'st-levels' });
  const fillLevels = (): void => {
    const found = opts.levels?.() ?? [];
    places.replaceChildren(
      ...(found.length ? [el('div', { class: 'st-label' }, words(content, 'Places found', 2))] : []),
      ...found.map((l) => el('div', { class: 'st-level', 'data-level': l.id, 'data-quarters': String(l.quarters) }, words(content, l.name, 2), pieImage(content, l.quarters, 2), ...(l.pieces ? [piecesImage(content, l.pieces, 2)] : []), ...(l.sources?.length ? [sourcesImage(content, l.sources, 2)] : []), ...(l.best ? [starsImage(content, l.best.stars, 2), words(content, stageClock(l.best.ticks), 2)] : []))),
    );
  };
  col.append(places, say, back, close);
  panel.append(col);
  btn.addEventListener('click', () => {
    fillLevels();
    panel.hidden = false;
  });
  document.body.append(btn, panel);
  // INTENT (the review's item 11): the menu holds the way out, so nothing may
  // sit on it. On a `?tune` page the Tune button (tune.ts) places itself at
  // the view's top-left; when the two overlap, the menu moves just right of it.
  const clear = (): void => {
    const other = document.getElementById('tune-open');
    btn.style.left = '';
    if (!other) return;
    const a = btn.getBoundingClientRect();
    const b = other.getBoundingClientRect();
    if (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom) btn.style.left = `${Math.ceil(b.right + 6)}px`;
  };
  clear();
  window.addEventListener('resize', () => requestAnimationFrame(clear));
  setInterval(clear, 1000);
}

// ---- A world the server set aside ----------------------------------------

/**
 * The server set this page's world aside (it threw; src/server/game.ts,
 * setAside) and the page has stopped reconnecting to it. INTENT: there is
 * always a way out: the reason, and the way back to the start screen.
 */
export function showGone(opts: { content: Content; why: string; tab: Kept }): void {
  styleOnce();
  if (document.getElementById('gone')) return;
  // A reload must not go straight back into the world that was set aside.
  opts.tab.set(PLAYING_KEY, '');
  const panel = el('div', { id: 'gone' });
  const col = el('div', { class: 'st-col' });
  const back = el('button', { type: 'button', class: 'st-btn', 'data-gone': 'back', 'aria-label': 'Back to the start screen' }, words(opts.content, 'Back to the start screen', 2));
  back.addEventListener('click', () => {
    location.href = location.pathname;
  });
  const lines = el('div', { class: 'st-say' });
  // Plain text as well as pixels: the reason can be long, and it must be readable whole.
  lines.textContent = opts.why || 'This world is not available right now.';
  col.append(lines, back);
  panel.append(col);
  document.body.append(panel);
}
