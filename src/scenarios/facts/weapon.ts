import { bodyAt, bodyName, checkAt, checkBody, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "weapon", "player": "a", "at": 120, "is": "sword" }
 * At that tick the body holds that weapon in hand (content/weapons/), or
 * none when "is" is null (Step 23, docs/mechanisms/weapons.md). With
 * "loose": [min, max] instead of "is": the number of loose weapons in
 * `room` (optionally only `weapon`, only with feet within `x`) is in range.
 */
const fact: Fact = {
  id: 'weapon',
  validate(spec, scenario, content) {
    const out: string[] = [];
    const weapons = Object.keys(content.weapons ?? {});
    if (spec.loose !== undefined) {
      checkOnly(spec, ['at', 'loose', 'room', 'weapon', 'x'], out);
      checkAt(spec, scenario, out);
      const ok = (r: unknown): boolean => Array.isArray(r) && r.length === 2 && r.every((n) => typeof n === 'number');
      if (!ok(spec.loose)) out.push(`loose: must be [min, max], but is ${JSON.stringify(spec.loose)}`);
      if (spec.x !== undefined && !ok(spec.x)) out.push(`x: must be [min, max] pixels, but is ${JSON.stringify(spec.x)}`);
      if (typeof spec.room !== 'string' || !(spec.room in content.rooms)) out.push(`room: must be a room id, but is ${JSON.stringify(spec.room)}`);
      if (spec.weapon !== undefined && (typeof spec.weapon !== 'string' || !weapons.includes(spec.weapon))) out.push(`weapon: must be a weapon id (${weapons.join(', ')}), but is ${JSON.stringify(spec.weapon)}`);
      return out;
    }
    checkOnly(spec, ['player', 'entity', 'at', 'is'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (spec.is !== null && (typeof spec.is !== 'string' || !weapons.includes(spec.is))) {
      out.push(`is: must be a weapon id (${weapons.join(', ')}) or null for none, but is ${JSON.stringify(spec.is)}`);
    }
    return out;
  },
  test(spec, rec) {
    const content = rec.content;
    const at = spec.at as number;
    if (spec.loose !== undefined) {
      const w = rec.history[at];
      if (!w) return `there is no tick ${at}`;
      const x = spec.x as [number, number] | undefined;
      const found = w.entities.filter((e) => {
        const l = e.c.loose;
        if (!l || e.room !== spec.room || (spec.weapon !== undefined && l.weapon !== spec.weapon)) return false;
        const bw = content.weapons?.[l.weapon]?.box[0] ?? 0;
        return !x || (e.x + bw / 2 >= x[0] && e.x + bw / 2 <= x[1]);
      });
      const [lo, hi] = spec.loose as [number, number];
      if (found.length >= lo && found.length <= hi) return null;
      return `at tick ${at} ${found.length} loose weapon(s) lie in ${spec.room}${x ? ` with middles in x ${x[0]}..${x[1]}` : ''}, expected ${lo} to ${hi} (they are: ${w.entities.filter((e) => e.c.loose && e.room === spec.room).map((e) => `${e.c.loose!.weapon} at ${Math.round(e.x)}`).join(', ') || 'none'})`;
    }
    const e = bodyAt(rec, spec, at);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${at}`;
    const has = e.c.weapon?.id ?? null;
    if (has === spec.is) return null;
    const changes: string[] = [];
    let last: string | null | undefined;
    rec.history.forEach((w, t) => {
      const b = spec.entity !== undefined ? w.entities.find((x) => x.id === spec.entity) : w.entities.find((x) => x.player === spec.player);
      const now = b ? (b.c.weapon?.id ?? null) : undefined;
      if (now !== last) changes.push(`${t}: ${now === undefined ? 'not in the world' : (now ?? 'none')}`);
      last = now;
    });
    return `at tick ${at} ${bodyName(spec)} holds ${has ?? 'no weapon'}, expected ${spec.is ?? 'none'} (by tick: ${changes.join('; ')})`;
  },
};
export default fact;
