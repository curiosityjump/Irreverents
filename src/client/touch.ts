import type { Content } from '../content/types.ts';
import { pixelWords } from './pixel-words.ts';
import type { Input } from '../sim/types.ts';
import { report } from './report.ts';

/**
 * The touch controls: produces the same Input the keyboard does.
 *
 * DRAFT: the layout (a left/right pad bottom-left that also pushes up when
 * the thumb slides up off it, one button per action in an arc
 * bottom-right; src/client/shell.ts places and sizes them).
 * INTENT: the buttons are built from the action list (content/actions/), one
 * element with `data-action="<id>"` each, so "every action has a touch
 * control" can be checked by script and a new action needs no change here.
 * An action with no `icon`, or whose picture fails to load, still gets its
 * button, showing its label. The stick is `data-stick`.
 */
/** DRAFT: the stick's two pictures; the stick is not an action, so they are named here. */
const STICK_ICONS = { l: 'ui/touch/left.png', r: 'ui/touch/right.png' };

/**
 * DRAFT: the button set drawn first (brief owner-better-buttons, 2026-11-24):
 * the controls re-cut from the approved P07 UI atlas as one family
 * (tools/art/touch/cut.py). For a picture `ui/.../<name>.png` the set's
 * `<SET><name>.png` is tried first; if it is not there, the picture the
 * content names (today's U08 buttons) is used, so removing the folder, or
 * setting this to '', brings today's buttons back with no other change.
 */
const SET = 'ui/touch/p07/';

/**
 * Puts a picture on a control once it has loaded: a 48x24 strip, normal
 * then pressed (index.html `.icon`). Until then, and for good if none
 * loads, the control keeps what it showed before (a label, or the arrow).
 * The picture is a background on a child that takes no touches: a
 * pointerdown on an <img> starts a drag or a long-press menu on iPhone Safari.
 */
function addIcon(el: HTMLElement, file: string): void {
  const icon = document.createElement('span');
  icon.className = 'icon';
  el.append(icon);
  const base = file.slice(file.lastIndexOf('/') + 1);
  const tries = SET ? [`${SET}${base}`, file] : [file];
  const next = (i: number): void => {
    const url = `assets/${tries[i]}`;
    const probe = new Image();
    probe.onload = () => {
      icon.style.backgroundImage = `url("${url}")`;
      el.classList.add('art');
    };
    // Not in the page, so its failure reaches no listener: say so here, once the last one fails.
    probe.onerror = () => (i + 1 < tries.length ? next(i + 1) : report('load', `img failed to load: ${url}`));
    probe.src = url;
  };
  next(0);
}

/**
 * The Use button says what a press will do here (Step 19; the word and the
 * state come from src/client/use-prompt.ts, which asks the Use arbiter,
 * src/sim/use.ts). In an enter doorway (state "go-in") the button wears a
 * door-and-arrow look and the words "Go in" (index.html `.go-in`); for
 * anything else (take, buy, break, ring) its picture dims and the word sits
 * over it (`.says`). It carries `data-state="<state>"` so a check can read
 * it. The button stays the same element with the same `data-action`;
 * nothing else moves (the owner, 2026-11-23: "There is no stick to push
 * up..."). `state` null: the plain button.
 * DRAFT: the looks and the words (decisions-log 2026-11-23 "Doorways by
 * Use"; "Step 19").
 */
export function showUseWord(host: HTMLElement, state: string | null, word: string): void {
  const b = host.querySelector<HTMLElement>('#actions [data-action="interact"]');
  if (!b || (b.dataset.state ?? null) === state) return;
  let go = b.querySelector<HTMLElement>(':scope > .go');
  if (!go) {
    go = document.createElement('span');
    go.className = 'go';
    b.append(go);
  }
  // DRAFT (brief phone-hud-legibility, second pass): the word in the game's pixel font; Go in with a pixel door.
  pixelWords(go, word.toUpperCase(), 10, state === 'go-in');
  b.classList.toggle('go-in', state === 'go-in');
  b.classList.toggle('says', state !== null && state !== 'go-in');
  if (state !== null) b.dataset.state = state;
  else delete b.dataset.state;
  b.setAttribute('aria-label', state !== null ? word : (b.firstChild?.textContent ?? ''));
}

/** Step 5's switch, kept for anything that still calls it: "Go in" or the plain button. */
export function showGoIn(host: HTMLElement, on: boolean): void {
  showUseWord(host, on ? 'go-in' : null, 'Go in');
}

export function watchTouch(content: Content, host: HTMLElement): () => Input {
  let x = 0;
  let y = 0;
  const held = new Set<string>();

  const pad = document.createElement('div');
  pad.id = 'pad';
  pad.dataset.stick = 'x';
  const l = document.createElement('i');
  l.className = 'l';
  const r = document.createElement('i');
  r.className = 'r';
  pad.append(l, r);
  addIcon(l, STICK_ICONS.l);
  addIcon(r, STICK_ICONS.r);
  let padPointer: number | null = null;
  const aim = (e: PointerEvent): void => {
    const box = pad.getBoundingClientRect();
    x = e.clientX < box.left + box.width / 2 ? -1 : 1;
    // INTENT: the stick also pushes up and down: slide the thumb up off the
    // pad (or down off it) and keep holding. Entering a doorway is a fresh
    // push up (docs/mechanisms/rooms-and-doors.md); without this a touch
    // player could never use one (D-093: every action works by touch).
    // DRAFT: the thresholds (the pad's own top and bottom edges).
    y = e.clientY < box.top ? -1 : e.clientY > box.bottom ? 1 : 0;
    l.classList.toggle('on', x < 0);
    r.classList.toggle('on', x > 0);
    pad.classList.toggle('up', y < 0);
  };
  const release = (e: PointerEvent): void => {
    if (e.pointerId !== padPointer) return;
    padPointer = null;
    x = 0;
    y = 0;
    l.classList.remove('on');
    r.classList.remove('on');
    pad.classList.remove('up');
  };
  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    padPointer = e.pointerId;
    // The thumb may slide off the pad and back; it still steers until lifted.
    try {
      pad.setPointerCapture(e.pointerId);
    } catch {
      // not capturable: the move events over the pad still work
    }
    aim(e);
  });
  pad.addEventListener('pointermove', (e) => {
    if (e.pointerId === padPointer) aim(e);
  });
  pad.addEventListener('pointerup', release);
  pad.addEventListener('pointercancel', release);

  const actions = document.createElement('div');
  actions.id = 'actions';
  for (const action of Object.values(content.actions)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.action = action.id;
    b.textContent = action.label;
    if (action.icon) addIcon(b, action.icon);
    const up = (): void => {
      held.delete(action.id);
      b.classList.remove('on');
    };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        b.setPointerCapture(e.pointerId);
      } catch {
        // see above
      }
      held.add(action.id);
      b.classList.add('on');
    });
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    actions.append(b);
  }
  host.append(pad, actions);

  // INTENT: a finger lifted while the page is hidden never reports; let go of
  // everything so a character cannot be left running on its own.
  const clear = (): void => {
    x = 0;
    y = 0;
    padPointer = null;
    held.clear();
    pad.classList.remove('up');
    for (const el of host.querySelectorAll('.on')) el.classList.remove('on');
  };
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);

  return () => ({ x, y, held: [...held].sort() });
}
