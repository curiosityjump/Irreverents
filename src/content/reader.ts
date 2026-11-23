import type { NumberRule, Problem, Reader } from './types.ts';

export function formatProblem(p: Problem): string {
  return `${p.file}: ${p.where}: ${p.message}`;
}

export function known(record: Record<string, unknown>): string {
  const ids = Object.keys(record).sort();
  return ids.length ? ids.join(', ') : '(none yet)';
}

export function describe(value: unknown): string {
  if (value === undefined) return 'missing';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'a list';
  if (typeof value === 'string') return `the text ${JSON.stringify(value)}`;
  if (typeof value === 'object') return 'an object';
  return `${typeof value} ${String(value)}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function makeReader(file: string, problems: Problem[]): Reader {
  const fail = (where: string, message: string): void => {
    problems.push({ file, where, message });
  };
  const at = (where: string, field: string): string => (where ? `${where}.${field}` : field);
  return {
    file,
    fail,
    object(value, where) {
      if (isRecord(value)) return value;
      fail(where || '(the whole file)', `must be an object, but is ${describe(value)}`);
      return null;
    },
    only(o, fields, where) {
      for (const key of Object.keys(o)) {
        if (key === '//' || fields.includes(key)) continue;
        fail(at(where, key), `unknown field (known fields here: ${fields.join(', ')})`);
      }
    },
    number(o, field, where, rule: NumberRule = {}) {
      const v = o[field];
      const w = at(where, field);
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        fail(w, `must be a number, but is ${describe(v)}`);
        return 0;
      }
      if (rule.integer && !Number.isInteger(v)) fail(w, `must be a whole number, but is ${v}`);
      if (rule.min !== undefined && v < rule.min) fail(w, `must be at least ${rule.min}, but is ${v}`);
      if (rule.max !== undefined && v > rule.max) fail(w, `must be at most ${rule.max}, but is ${v}`);
      return v;
    },
    string(o, field, where) {
      const v = o[field];
      if (typeof v !== 'string' || v === '') {
        fail(at(where, field), `must be non-empty text, but is ${describe(v)}`);
        return '';
      }
      return v;
    },
    stringList(o, field, where) {
      const v = o[field];
      const w = at(where, field);
      if (!Array.isArray(v)) {
        fail(w, `must be a list of text, but is ${describe(v)}`);
        return [];
      }
      const out: string[] = [];
      v.forEach((item, i) => {
        if (typeof item === 'string' && item !== '') out.push(item);
        else fail(`${w}[${i}]`, `must be non-empty text, but is ${describe(item)}`);
      });
      return out;
    },
  };
}
