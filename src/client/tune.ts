// The ?tune panel (docs/mechanisms/tuning-panel.md): every declared feel
// number in the owner's hands, on the phone, while playing. Only a page
// opened with `?tune` in its address builds it; without that this file
// does nothing at all (no element, no message).
//
// The numbers listed are exactly the ones the verbs and systems declare
// (src/sim/tuning-rules.ts), never a hand list, so a number added by a
// later change shows up here by itself, with its range and its `what:` line.
//
// DRAFT: the look (plain DOM over the canvas, system font); Step 8 may
// restyle it. The behaviour is what was asked for: per character (the
// one you play first) and the world's, a slider and - / + per number,
// reset, and copy-out of the changed numbers as content/tuning.json JSON.
import type { Content } from '../content/types.ts';
import type { NetClient } from '../net/client.ts';
import { applyChange, tuningDiff, tuningRules, WORLD_SET } from '../sim/tuning-rules.ts';
import type { TuningChange } from '../sim/tuning-rules.ts';
import type { TuningRule } from '../sim/types.ts';

/** Whether this page was opened with `?tune`. */
export function tuneWanted(search: string): boolean {
  return new URLSearchParams(search).has('tune');
}

// INTENT: the 8 px between a number's words and its slider keeps a thumb
// that starts a scroll on the words off the slider. With 2 px, a swipe on
// a one-line description (runSpeed's, first since the panel puts the felt
// numbers first) was taken by the slider below it and set a new value
// (measured 2026-11-23 in Chromium, whose touch lands on the nearest control).
const CSS = `
#tune-open { position: fixed; z-index: 20; width: 44px; height: 30px; padding: 0; border: 1px solid rgba(244,241,222,.5); border-radius: 8px; background: rgba(15,15,28,.75); color: #f4f1de; font: 600 12px/1 system-ui, -apple-system, sans-serif; touch-action: manipulation; }
#tune { position: fixed; z-index: 19; box-sizing: border-box; display: flex; flex-direction: column; background: rgba(15,15,28,.9); color: #f4f1de; border: 1px solid rgba(244,241,222,.35); border-radius: 8px; font: 12px/1.3 system-ui, -apple-system, sans-serif; -webkit-user-select: none; user-select: none; }
#tune[hidden] { display: none; }
#tune header { display: flex; gap: 6px; align-items: center; padding: 4px 4px 4px 56px; border-bottom: 1px solid rgba(244,241,222,.2); flex: none; }
#tune header b { flex: 1; }
#tune button { min-width: 36px; height: 32px; border: 1px solid rgba(244,241,222,.45); border-radius: 6px; background: transparent; color: #f4f1de; font: 600 12px/1 system-ui, -apple-system, sans-serif; padding: 0 6px; touch-action: manipulation; }
#tune .scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior: contain; padding: 0 6px 8px; }
#tune details { border-bottom: 1px solid rgba(244,241,222,.15); }
#tune summary { padding: 10px 2px; font-weight: 600; touch-action: manipulation; }
#tune .row { padding: 4px 0 8px; }
#tune .row.changed .name { color: #ffd166; }
#tune .top { display: flex; align-items: baseline; gap: 6px; }
#tune .name { flex: 1; font-weight: 600; word-break: break-all; }
#tune .what { opacity: .65; font-size: 11px; }
#tune .ctl { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
#tune input[type=range] { flex: 1; min-width: 0; height: 32px; touch-action: pan-y; margin: 0; }
#tune input.val { width: 72px; height: 26px; box-sizing: border-box; background: #1b1b2f; color: #f4f1de; border: 1px solid rgba(244,241,222,.35); border-radius: 4px; font: 12px system-ui, sans-serif; padding: 0 4px; -webkit-user-select: text; user-select: text; }
#tune textarea { flex: none; height: 90px; margin: 4px 6px 6px; background: #1b1b2f; color: #f4f1de; border: 1px solid rgba(244,241,222,.35); font: 11px ui-monospace, monospace; -webkit-user-select: text; user-select: text; touch-action: pan-y; }
#tune textarea[hidden] { display: none; }
#tune .note { padding: 2px 6px; opacity: .75; font-size: 11px; min-height: 14px; }
`;

/**
 * DRAFT (Step 2 panel polish): the numbers the owner feels most, first in
 * every set that has them, in this order; the rest follow alphabetically.
 * A name here that a set lacks is skipped. `fallSpeed` is a character's
 * fastest fall, `maxFallSpeed` the world's.
 */
export const FIRST = ['runSpeed', 'jumpSpeed', 'attackWindup', 'fallSpeed', 'maxFallSpeed'];
/** A set's numbers in the order the panel lists them: FIRST's, then the rest by name. */
export function panelOrder(names: string[]): string[] {
  const rank = (n: string): number => (FIRST.includes(n) ? FIRST.indexOf(n) : FIRST.length);
  return [...names].sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0));
}

/** A step that suits a range: 1, 2 or 5 times a power of ten, about a hundredth of it. */
function niceStep(span: number): number {
  if (!(span > 0)) return 1;
  const raw = span / 100;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
/** The largest of 1, 2 or 5 times a power of ten that is no more than `v`. */
function niceFloor(v: number): number {
  const p = 10 ** Math.floor(Math.log10(v));
  const m = v / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}
/**
 * DRAFT (Step 2 panel polish): the step of a number's slider and of its
 * - / +. About a hundredth of the slider's span, except where the declared
 * range is huge next to the shipped number (20 times it or more, e.g. a
 * strength of 9000 allowed up to 1,000,000, a wind-up of 0.033 s up to 1 s):
 * there no step is larger than 2% of the shipped number, so it can be moved
 * by small amounts. Typing still takes any number in the range.
 */
export const FINE_SHARE = 0.02;
export const HUGE_RANGE = 20;
export function stepFor(rule: TuningRule, shipped: number, sliderMax: number): number {
  const step = niceStep(sliderMax - rule.min);
  if (!(shipped > 0) || rule.max - rule.min < HUGE_RANGE * shipped) return step;
  return Math.min(step, niceFloor(shipped * FINE_SHARE));
}
const roundTo = (v: number, step: number): number => {
  const digits = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number((Math.round(v / step) * step).toFixed(Math.min(digits, 6)));
};
const show = (v: number): string => String(Number(v.toPrecision(6)));

interface Row {
  set: string;
  name: string;
  rule: TuningRule;
  el: HTMLElement;
  range: HTMLInputElement;
  val: HTMLInputElement;
  step: number;
  busyUntil: number;
}

export function setUpTune(opts: { content: Content; net: NetClient; canvas: HTMLCanvasElement; touchHost: HTMLElement }): { open(): boolean } {
  const { content, net, canvas, touchHost } = opts;
  const rules = tuningRules(content);
  const shipped = net.shippedTuning;
  const current = (set: string): Record<string, number> => (set === WORLD_SET ? content.tuning.world : (content.tuning.characters[set] ??= {}));
  const shippedOf = (set: string, name: string): number => (set === WORLD_SET ? shipped.world[name] : shipped.characters[set]?.[name]) ?? 0;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.id = 'tune-open';
  button.type = 'button';
  button.textContent = 'Tune';
  button.setAttribute('aria-label', 'Tune the feel');
  const panel = document.createElement('div');
  panel.id = 'tune';
  panel.hidden = true;
  panel.innerHTML = `<header><b>Feel dials</b><button type="button" data-tune="reset">Reset</button><button type="button" data-tune="copy">Copy</button><button type="button" data-tune="close" aria-label="Close">&times;</button></header><div class="note"></div><textarea hidden readonly></textarea><div class="scroll"></div>`;
  document.body.append(panel, button);
  const scroll = panel.querySelector('.scroll') as HTMLElement;
  const note = panel.querySelector('.note') as HTMLElement;
  const out = panel.querySelector('textarea') as HTMLTextAreaElement;

  // INTENT: a touch, a drag or a key on the panel is the panel's, never the
  // game's: index.html and shell.ts stop every touchmove and a quick second
  // tap on the document (no zoom, no scrolling the game), and the keyboard
  // is read on the window, so each is stopped here before it gets there.
  // That is also what lets the panel scroll on an iPhone.
  for (const el of [panel, button]) {
    for (const type of ['touchstart', 'touchmove', 'touchend', 'pointerdown', 'keydown', 'keyup', 'dblclick', 'selectstart', 'contextmenu']) {
      el.addEventListener(type, (e) => e.stopPropagation());
    }
  }

  // Changes are applied on this page at once (play follows the thumb) and
  // sent to the world at most every 80 ms while a slider moves.
  const pending = new Map<string, TuningChange>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = (): void => {
    timer = null;
    if (pending.size === 0) return;
    const list = [...pending.values()];
    pending.clear();
    net.tune(list);
  };
  const change = (row: Row, v: number | null): void => {
    const c: TuningChange = { set: row.set, name: row.name, v: v === null ? null : Math.max(row.rule.min, Math.min(row.rule.max, v)) };
    applyChange(content.tuning, shipped, c);
    pending.set(`${c.set}.${c.name}`, c);
    row.busyUntil = performance.now() + 600;
    paint(row);
    timer ??= setTimeout(flush, 80);
  };

  const rows: Row[] = [];
  const paint = (row: Row, force = false): void => {
    const v = current(row.set)[row.name] ?? shippedOf(row.set, row.name);
    const hi = Number(row.range.max);
    // The slider's window grows when a number is taken past it (by typing or by +).
    if (v > hi) row.range.max = String(Math.min(row.rule.max, v * 2 || row.rule.max));
    if (force || document.activeElement !== row.range) row.range.value = String(v);
    if (document.activeElement !== row.val) row.val.value = show(v);
    row.el.classList.toggle('changed', v !== shippedOf(row.set, row.name));
  };

  const makeRow = (set: string, name: string, rule: TuningRule): HTMLElement => {
    const base = shippedOf(set, name);
    // DRAFT: the slider spans the declared minimum to three times the
    // shipped number (or the declared range when that is small), because
    // some declared maxima are huge (1,000,000) and a slider over all of it
    // could not be aimed; + and typing still reach the whole declared range.
    const hi = Math.min(rule.max, base > 0 ? Math.max(base * 3, rule.min + 1) : rule.max <= 10 ? rule.max : Math.min(rule.max, rule.min + 100));
    const step = stepFor(rule, base, hi);
    const el = document.createElement('div');
    el.className = 'row';
    el.dataset.set = set;
    el.dataset.name = name;
    el.innerHTML = `<div class="top"><span class="name"></span><input class="val" type="text" inputmode="decimal"></div><div class="what"></div><div class="ctl"><button type="button" data-step="-1" aria-label="Less">&minus;</button><input type="range"><button type="button" data-step="1" aria-label="More">+</button></div>`;
    (el.querySelector('.name') as HTMLElement).textContent = name;
    (el.querySelector('.what') as HTMLElement).textContent = `${rule.what} (shipped ${show(base)}; ${show(rule.min)} to ${show(rule.max)})`;
    const range = el.querySelector('input[type=range]') as HTMLInputElement;
    range.min = String(rule.min);
    range.max = String(hi);
    range.step = String(step);
    const val = el.querySelector('input.val') as HTMLInputElement;
    const row: Row = { set, name, rule, el, range, val, step, busyUntil: 0 };
    rows.push(row);
    range.addEventListener('input', () => change(row, Number(range.value)));
    val.addEventListener('change', () => {
      const v = Number(val.value);
      if (Number.isFinite(v) && val.value.trim() !== '') change(row, v);
      val.blur();
      paint(row, true);
    });
    for (const b of el.querySelectorAll<HTMLButtonElement>('button[data-step]')) {
      b.addEventListener('click', () => {
        const v = current(set)[name] ?? base;
        change(row, roundTo(v + Number(b.dataset.step) * step, step));
        paint(row, true);
      });
    }
    paint(row, true);
    return el;
  };

  /** Who reads a tuning set, by name: "Grappler" or "Guard, Shopkeeper". */
  const namesOf = (set: string): string =>
    set === WORLD_SET
      ? 'World (everyone)'
      : Object.values(content.characters)
          .filter((c) => c.tuning === set)
          .map((c) => c.name || c.id)
          .join(', ') || set;

  const build = (): void => {
    scroll.textContent = '';
    rows.length = 0;
    const mine = content.characters[net.me().kind]?.tuning;
    const party = new Set(content.party.members.map((id) => content.characters[id]?.tuning).filter(Boolean));
    const sets = Object.keys(rules.characters).sort((a, b) => {
      const rank = (s: string): number => (s === mine ? 0 : party.has(s) ? 1 : 3);
      return rank(a) - rank(b) || (a < b ? -1 : 1);
    });
    // The character you play first, then the party, then the world, then everything else.
    const order = [...sets.filter((s) => s === mine || party.has(s)), WORLD_SET, ...sets.filter((s) => s !== mine && !party.has(s))];
    for (const set of order) {
      const list = set === WORLD_SET ? rules.world : rules.characters[set]!;
      const names = panelOrder(Object.keys(list));
      if (names.length === 0) continue;
      const group = document.createElement('details');
      group.dataset.set = set;
      if (set === mine) group.open = true;
      const summary = document.createElement('summary');
      summary.textContent = `${namesOf(set)}${set === mine ? ' (you)' : ''}`;
      group.appendChild(summary);
      // Rows are made when a group is first opened: hundreds of sliders at once are slow on a phone.
      const fill = (): void => {
        if (group.dataset.filled) return;
        group.dataset.filled = '1';
        for (const name of names) group.appendChild(makeRow(set, name, list[name]!));
      };
      if (group.open) fill();
      group.addEventListener('toggle', () => group.open && fill());
      scroll.appendChild(group);
    }
  };

  // Where the panel sits: over the left half of the view, cut short above
  // any control it would cover, so play goes on while dials turn. Upright,
  // in the space between the view and the controls when there is enough.
  const place = (): void => {
    const v = canvas.getBoundingClientRect();
    const controls = [...touchHost.querySelectorAll<HTMLElement>('[data-stick], [data-action]')]
      .filter(() => !touchHost.hidden)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0);
    const controlsTop = Math.min(innerHeight, ...controls.map((r) => r.top));
    const upright = innerHeight > innerWidth;
    let box: { left: number; top: number; width: number; height: number };
    if (upright && controlsTop - v.bottom >= 160) {
      box = { left: 6, top: v.bottom + 4, width: innerWidth - 12, height: controlsTop - v.bottom - 10 };
    } else {
      // Sideways: the whole height of the column the view stands in (the
      // controls sit in the bars beside it), over the view's left half.
      const width = Math.min(innerWidth - 8, Math.max(260, Math.min(v.width / 2, 400)));
      const left = Math.max(4, Math.min(v.left + 2, innerWidth - width - 4));
      let bottom = innerHeight - 4;
      for (const r of controls) if (r.left < left + width && r.right > left && r.top < bottom) bottom = Math.max(124, r.top - 4);
      box = { left, top: 4, width, height: bottom - 4 };
    }
    Object.assign(panel.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${Math.max(120, box.height)}px` });
    Object.assign(button.style, { left: `${box.left + 2}px`, top: `${box.top + 3}px` });
  };
  place();
  addEventListener('resize', () => requestAnimationFrame(place));

  const setOpen = (open: boolean): void => {
    if (open) {
      build();
      place();
    } else {
      flush();
      out.hidden = true;
    }
    panel.hidden = !open;
    button.textContent = open ? 'Done' : 'Tune';
  };
  // INTENT: there is always a way out. The panel opens and closes from the
  // same button, and closes from its own x; closed, it covers nothing but
  // that one small button.
  button.addEventListener('click', () => setOpen(panel.hidden !== false));

  panel.querySelector('[data-tune=close]')!.addEventListener('click', () => setOpen(false));
  panel.querySelector('[data-tune=reset]')!.addEventListener('click', () => {
    pending.clear();
    net.tune([], true);
    for (const r of rows) paint(r, true);
    note.textContent = 'Every number is back to the shipped one, for everyone in this world.';
  });
  panel.querySelector('[data-tune=copy]')!.addEventListener('click', () => {
    flush();
    const diff = tuningDiff(shipped, content.tuning);
    const text = JSON.stringify(diff, null, 2);
    // Always shown as well: the clipboard can refuse (iOS Safari wants a
    // user gesture and a secure page), and the box can be selected by hand.
    out.value = text;
    out.hidden = false;
    out.focus();
    out.select();
    const empty = text === '{}';
    const done = (ok: boolean): void => {
      note.textContent = empty ? 'Nothing changed yet.' : ok ? 'Copied: paste it to a session to make these the defaults.' : 'Select the text below and copy it.';
    };
    try {
      navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
    } catch {
      done(false);
    }
  });

  // Someone else in the world turned a dial: keep what is shown true (a row
  // being worked on keeps its own value for a moment).
  setInterval(() => {
    if (panel.hidden) return;
    const now = performance.now();
    for (const r of rows) if (now > r.busyUntil) paint(r);
  }, 250);

  return { open: () => !panel.hidden };
}
