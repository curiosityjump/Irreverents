import { known } from '../../content/reader.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * Step 3 (the stone plate): at a tick, or on every tick of a span (both
 * ends included), a working part's run-time state (`World.rooms[room].parts[part]`,
 * docs/mechanisms/rooms-and-doors.md) has every field in `is` at exactly
 * that value (a field never written reads as false for `true`/`false`, and
 * as missing otherwise), and/or its `load` is within `load: [min, max]`:
 *   { "fact": "part", "room": "test-weight", "part": "stone-plate", "between": [60, 120], "is": { "down": false }, "load": [60, 60] }
 */
const fact: Fact = {
  id: 'part',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['room', 'part', 'at', 'between', 'is', 'load'], out);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    const room = typeof spec.room === 'string' ? content.rooms[spec.room] : undefined;
    if (!room) out.push(`room: no room ${JSON.stringify(spec.room)} (content/rooms/: ${known(content.rooms)})`);
    else if (!room.parts.some((p) => p.id === spec.part)) out.push(`part: room ${room.id} has no part ${JSON.stringify(spec.part)} (${room.parts.map((p) => p.id).join(', ')})`);
    if (spec.is !== undefined && (typeof spec.is !== 'object' || spec.is === null || Array.isArray(spec.is) || !Object.values(spec.is).every((v) => ['number', 'boolean', 'string'].includes(typeof v)))) out.push('is: an object of state fields to values (numbers, true/false or text)');
    if (spec.load !== undefined && !isRange(spec.load)) out.push('load: must be [min, max]');
    if (spec.is === undefined && spec.load === undefined) out.push('give is and/or load');
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    const want = (spec.is ?? {}) as Record<string, number | boolean | string>;
    for (let t = from; t <= to; t++) {
      const s = rec.history[t]!.rooms?.[spec.room as string]?.parts?.[spec.part as string] ?? {};
      for (const [k, v] of Object.entries(want)) {
        const have = s[k] ?? (typeof v === 'boolean' ? false : undefined);
        if (have !== v) return `at tick ${t} ${spec.room}/${spec.part} has ${k} ${JSON.stringify(have)}, expected ${JSON.stringify(v)}`;
      }
      if (spec.load !== undefined) {
        const [lo, hi] = spec.load as [number, number];
        const load = typeof s.load === 'number' ? s.load : 0;
        if (load < lo || load > hi) return `at tick ${t} ${spec.room}/${spec.part} has load ${load}, expected ${lo} to ${hi}`;
      }
    }
    return null;
  },
};
export default fact;
