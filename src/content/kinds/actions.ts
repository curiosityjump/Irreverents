import type { ContentKind } from '../types.ts';

/**
 * content/actions/<id>.json: one thing a player can press. The keyboard and
 * (from Step 1 Gate 2) the touch layout both read this one list, so adding
 * an action is adding one file (docs/plan/step-1.md, "What's decided").
 * Left/right/up/down are not actions: they are the stick (Input.x, Input.y).
 */
export interface Action {
  id: string;
  /** Short name a button can show. */
  label: string;
  /** KeyboardEvent.code values that hold this action down. */
  keys: string[];
}

declare module '../types.ts' {
  interface Content {
    actions: Record<string, Action>;
  }
}

const kind: ContentKind = {
  id: 'actions',
  source: { dir: 'actions' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'label', 'keys'], '');
    const out: Action = {
      id: read.string(o, 'id', ''),
      label: read.string(o, 'label', ''),
      keys: read.stringList(o, 'keys', ''),
    };
    return out;
  },
};
export default kind;
