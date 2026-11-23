import type { Content } from '../content/types.ts';
import type { Input } from '../sim/types.ts';

// DRAFT: the stick's keys. Actions get their keys from content/actions/;
// the stick is not an action, so its keys live here.
const LEFT = ['ArrowLeft', 'KeyA'];
const RIGHT = ['ArrowRight', 'KeyD'];
const UP = ['ArrowUp', 'KeyW'];
const DOWN = ['ArrowDown', 'KeyS'];

/**
 * Turns held keys into the simulation's Input. Step 1 Gate 2 adds the touch
 * layout as a sibling of this file producing the same Input.
 */
export function watchKeyboard(content: Content, target: Window): () => Input {
  const down = new Set<string>();
  const used = new Set<string>([...LEFT, ...RIGHT, ...UP, ...DOWN]);
  for (const action of Object.values(content.actions)) for (const key of action.keys) used.add(key);

  target.addEventListener('keydown', (e) => {
    if (!used.has(e.code)) return;
    down.add(e.code);
    e.preventDefault();
  });
  target.addEventListener('keyup', (e) => {
    down.delete(e.code);
  });
  // INTENT: a key released while the tab is hidden never sends keyup; clear
  // everything on blur so a character cannot be left running on its own.
  target.addEventListener('blur', () => down.clear());

  const any = (keys: string[]): boolean => keys.some((k) => down.has(k));
  return () => ({
    x: (any(RIGHT) ? 1 : 0) - (any(LEFT) ? 1 : 0),
    y: (any(DOWN) ? 1 : 0) - (any(UP) ? 1 : 0),
    held: Object.values(content.actions)
      .filter((a) => any(a.keys))
      .map((a) => a.id)
      .sort(),
  });
}
