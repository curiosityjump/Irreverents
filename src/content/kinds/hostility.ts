import type { ContentKind } from '../types.ts';
import type { NpcKind } from './npcs.ts';

/**
 * content/hostility.json: pairs of sets of people (by content/npcs/ role and
 * side) who fight each other on sight (Step 12, D-069;
 * docs/mechanisms/outposts.md, "Chase and clash"). DRAFT: the pairs.
 * Keyed by role and side, not kind, so a new bad-side kind is covered with
 * no edit here.
 */
export interface PeopleSet {
  role?: string;
  side?: string;
  notRoles: string[];
}
export interface Hostility {
  pairs: { a: PeopleSet; b: PeopleSet }[];
}

declare module '../types.ts' {
  interface Content {
    hostility: Hostility;
  }
}

function inSet(s: PeopleSet, k: NpcKind): boolean {
  return (s.role === undefined || s.role === k.role) && (s.side === undefined || s.side === k.side) && !s.notRoles.includes(k.role);
}

/** True when people of kinds a and b fight on sight. */
export function hostile(h: Hostility | undefined, a: NpcKind | undefined, b: NpcKind | undefined): boolean {
  if (!h || !a || !b) return false;
  return h.pairs.some((p) => (inSet(p.a, a) && inSet(p.b, b)) || (inSet(p.a, b) && inSet(p.b, a)));
}

const kind: ContentKind = {
  id: 'hostility',
  source: { file: 'hostility.json' },
  parse(raw, read) {
    const o = read.object(raw, '') ?? {};
    read.only(o, ['pairs', '//'], '');
    const pairs: Hostility['pairs'] = [];
    if (!Array.isArray(o.pairs)) {
      read.fail('pairs', 'must be a list of { "a": set, "b": set }');
      return { pairs };
    }
    const set = (v: unknown, where: string): PeopleSet | null => {
      if (!v || typeof v !== 'object' || Array.isArray(v)) {
        read.fail(where, 'must be an object with "role" and/or "side", and optionally "notRoles"');
        return null;
      }
      const s = v as Record<string, unknown>;
      for (const k of Object.keys(s)) if (!['role', 'side', 'notRoles'].includes(k)) read.fail(`${where}.${k}`, 'unknown field (role, side, notRoles)');
      const role = typeof s.role === 'string' ? s.role : undefined;
      const side = typeof s.side === 'string' ? s.side : undefined;
      if (s.role !== undefined && role === undefined) read.fail(`${where}.role`, 'must be a string');
      if (s.side !== undefined && side === undefined) read.fail(`${where}.side`, 'must be a string');
      if (role === undefined && side === undefined) read.fail(where, 'needs a "role" or a "side": a set of everyone would make everyone fight');
      const notRoles = Array.isArray(s.notRoles) && s.notRoles.every((r) => typeof r === 'string') ? (s.notRoles as string[]) : [];
      if (s.notRoles !== undefined && !Array.isArray(s.notRoles)) read.fail(`${where}.notRoles`, 'must be a list of roles');
      return { role, side, notRoles };
    };
    o.pairs.forEach((p: unknown, i: number) => {
      const r = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
      const a = set(r.a, `pairs[${i}].a`);
      const b = set(r.b, `pairs[${i}].b`);
      if (a && b) pairs.push({ a, b });
    });
    return { pairs };
  },
  check(content, fail) {
    const roles = new Set<string>(Object.values(content.npcs).map((k) => k.role));
    const sides = new Set<string>(Object.values(content.npcs).map((k) => k.side));
    content.hostility.pairs.forEach((p, i) => {
      for (const [name, s] of [['a', p.a], ['b', p.b]] as const) {
        if (s.role !== undefined && !roles.has(s.role)) fail('hostility.json', `pairs[${i}].${name}.role`, `no content/npcs/ file has role "${s.role}"`);
        if (s.side !== undefined && !sides.has(s.side)) fail('hostility.json', `pairs[${i}].${name}.side`, `no content/npcs/ file has side "${s.side}"`);
      }
    });
  },
};
export default kind;
