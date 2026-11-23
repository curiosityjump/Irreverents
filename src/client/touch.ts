import type { Content } from '../content/types.ts';
import type { Input } from '../sim/types.ts';
import { report } from './report.ts';

/**
 * The touch controls: produces the same Input the keyboard does.
 *
 * DRAFT: the layout (a left/right pad bottom-left, one button per action
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
 * Puts a picture on a control once it has loaded: a 48x24 strip, normal
 * then pressed (index.html `.icon`). Until then, and for good if it never
 * loads, the control keeps what it showed before (a label, or the arrow).
 * The picture is a background on a child that takes no touches: a
 * pointerdown on an <img> starts a drag or a long-press menu on iPhone Safari.
 */
function addIcon(el: HTMLElement, file: string): void {
  const url = `assets/${file}`;
  const icon = document.createElement('span');
  icon.className = 'icon';
  el.append(icon);
  const probe = new Image();
  probe.onload = () => {
    icon.style.backgroundImage = `url("${url}")`;
    el.classList.add('art');
  };
  // Not in the page, so its failure reaches no listener: say so here.
  probe.onerror = () => report('load', `img failed to load: ${url}`);
  probe.src = url;
}

export function watchTouch(content: Content, host: HTMLElement): () => Input {
  let x = 0;
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
    l.classList.toggle('on', x < 0);
    r.classList.toggle('on', x > 0);
  };
  const release = (e: PointerEvent): void => {
    if (e.pointerId !== padPointer) return;
    padPointer = null;
    x = 0;
    l.classList.remove('on');
    r.classList.remove('on');
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
    padPointer = null;
    held.clear();
    for (const el of host.querySelectorAll('.on')) el.classList.remove('on');
  };
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);

  return () => ({ x, y: 0, held: [...held].sort() });
}
