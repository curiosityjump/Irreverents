// Step 17 (docs/mechanisms/saves.md, "The start screen"): what a page shows
// before it joins a world, and the small in-play menu that leads back to it.
// The owner: "a start screen where players can start a new game, continue,
// join the same game, etc."
//
// INTENT: `?room=<name>` never sees any of this (src/client/main.ts decides
// before calling here): every scripted check joins `?room=check-…` and
// must go straight into play.
import type { Content } from '../content/types.ts';
import { cleanGameCode, GAME_CODE_LENGTH, GAME_PREFIX, gameCode, isGameCode, makeGameCode } from '../net/game-code.ts';
import { DEFAULT_WORLD } from '../net/protocol.ts';
import { look } from './draw/looks.ts';

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

// ---- Look ----------------------------------------------------------------

const CSS = `
/* DRAFT (Step 17): the start screen and the in-play menu, in the surround's night ramp (index.html). Big tap targets: every choice is at least 52 px tall. */
#start, #game-menu, #gone { position: fixed; inset: 0; z-index: 20; overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch;
  padding: max(12px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  box-sizing: border-box; background: rgba(20, 18, 40, .96); display: flex; flex-direction: column; align-items: center; }
#start[hidden], #game-menu[hidden], #menu-btn[hidden] { display: none; }
#start .st-title { margin: 6px 0 14px; filter: drop-shadow(0 3px 0 #0b0a18); }
#start .st-cols { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 10px 28px; width: 100%; }
#start .st-col { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 330px; }
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
  border-radius: 10px; background: transparent; touch-action: manipulation; -webkit-appearance: none; appearance: none; }
/* Quiet over the view (docs/plan/step-5.md, "Controls never hide the game"): three faint bars in a 44 px touch area. */
#menu-btn i { position: absolute; left: 13px; width: 18px; height: 2px; background: rgba(244, 241, 222, .7); box-shadow: 0 0 0 1px rgba(15, 15, 28, .55); }
#menu-btn i:nth-child(1) { top: 15px; } #menu-btn i:nth-child(2) { top: 21px; } #menu-btn i:nth-child(3) { top: 27px; }
#menu-btn:active { background: rgba(244, 241, 222, .2); }
#game-menu, #gone { justify-content: center; }
#gone .st-col { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 330px; }
#gone .st-say { font-size: 16px; line-height: 1.4; }
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

  let done = false;
  const go = (world: string): void => {
    if (done) return;
    done = true;
    tab.set(PLAYING_KEY, world);
    const code = gameCode(world);
    if (code) rememberGame(device, code);
    // The address says where this tab is: a game's is its share link.
    try {
      history.replaceState(null, '', code ? `?game=${code}` : location.pathname);
    } catch {
      // an address that cannot be changed changes nothing else
    }
    root.remove();
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
      location.href = location.pathname;
    });
    const col = el('div', { class: 'st-col' }, join, back);
    root.append(el('div', { class: 'st-title' }, words(content, 'Irreverents', 4)), col);
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
    maxlength: String(GAME_CODE_LENGTH),
    autocapitalize: 'characters',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    enterkeyhint: 'go',
    inputmode: 'text',
  });
  // Upper-cased as typed; only the code's letters stay.
  field.addEventListener('input', () => {
    const clean = cleanGameCode(field.value);
    if (field.value !== clean) field.value = clean;
    if (record.message) tell('');
  });
  const join = button('Join', 'join');
  const tryJoin = async (): Promise<void> => {
    const code = cleanGameCode(field.value);
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
      b.addEventListener('click', () => go(GAME_PREFIX + code));
      right.append(b);
    }
  }

  root.append(el('div', { class: 'st-title' }, words(content, 'Irreverents', 4)), el('div', { class: 'st-cols' }, left, right));
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
      navigator.clipboard?.writeText(url).then(
        () => tell('Link copied'),
        () => tell(url.replace(/^https?:\/\//, '')),
      ) ?? tell(url.replace(/^https?:\/\//, ''));
    });
    col.append(share);
  } else if (opts.worldName === DEFAULT_WORLD) {
    col.append(el('div', { class: 'st-label' }, words(content, "Everyone's kingdom", 2)));
  }
  const back = button('Back to the start screen', 'back');
  back.addEventListener('click', () => {
    opts.leave();
    opts.tab.set(PLAYING_KEY, '');
    location.href = location.pathname;
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
  col.append(say, back, close);
  panel.append(col);
  btn.addEventListener('click', () => (panel.hidden = false));
  document.body.append(btn, panel);
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
