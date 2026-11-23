import type { Content } from '../content/types.ts';
import type { Input } from '../sim/types.ts';

/**
 * The touch controls: produces the same Input the keyboard does.
 *
 * DRAFT: the layout (a left/right pad bottom-left, one round button per
 * action bottom-right) and its looks are a first pass; Step 5 owns the real
 * layout and the delivered button art.
 * INTENT: the buttons are built from the action list (content/actions/), one
 * element with `data-action="<id>"` each, so "every action has a touch
 * control" can be checked by script and a new action needs no change here.
 * The stick is `data-stick`.
 */
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
