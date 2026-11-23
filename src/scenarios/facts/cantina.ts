import { cantinaId, pastEdge, regularId } from '../../sim/cantina.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * Step 11 (docs/mechanisms/cantina.md). At a tick, or on every tick of a
 * span (both ends included), about the cantina in `room`:
 *   "regulars": ["infiltrator", ...]  exactly these characters have a
 *                regular (`cantina:<kind>`), each in the room and inside its edge
 *   "moved": 16  with "between": each listed regular's feet moved at least
 *                this many pixels sideways over the span (it walks)
 *   "on": true   whether a brawl is on
 *   "score": { "a": { "ko": 1, "falls": 0 } }  by player id: this brawl's
 *                count (a player with no entry has 0 and 0)
 *   "party": ["grappler", ...]  the world's party in order (world.party,
 *                else content's): slice B's swap
 *   "row": "brawler" | null  player `player`'s party row is open to bring
 *                in that character, or (null) no row is open for them
 * The scenario needs "placements": true (that is what puts the cantina in the world).
 */
const fact: Fact = {
  id: 'cantina',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['room', 'at', 'between', 'regulars', 'moved', 'on', 'score', 'party', 'row', 'player'], out);
    if (typeof spec.room !== 'string' || !content.cantina?.[spec.room]) out.push(`room: must be a cantina room (${Object.keys(content.cantina ?? {}).join(', ') || 'none'}), but is ${JSON.stringify(spec.room)}`);
    if (!scenario.placements || scenario.room !== spec.room) out.push('the scenario must be in this room with "placements": true, which is what puts the cantina in the world');
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}, but is ${JSON.stringify(spec.at)}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    if (spec.regulars === undefined && spec.on === undefined && spec.score === undefined && spec.party === undefined && spec.row === undefined) out.push('give at least one of regulars, on, score, party, row');
    if (spec.party !== undefined && (!Array.isArray(spec.party) || !spec.party.every((k) => typeof k === 'string' && k in content.characters))) out.push('party: must be a list of characters');
    if (spec.row !== undefined && spec.row !== null && (typeof spec.row !== 'string' || !(spec.row in content.characters))) out.push('row: a character, or null');
    if ((spec.row !== undefined) !== (spec.player !== undefined) || (spec.player !== undefined && !scenario.players.some((p) => p.id === spec.player))) out.push('row and player go together; player: one of this scenario\'s players');
    if (spec.regulars !== undefined && (!Array.isArray(spec.regulars) || !spec.regulars.every((k) => typeof k === 'string' && content.roster.characters.includes(k)))) {
      out.push(`regulars: must be a list of roster characters (${content.roster.characters.join(', ')})`);
    }
    if (spec.moved !== undefined && (typeof spec.moved !== 'number' || b === undefined || spec.regulars === undefined)) out.push('moved: a number of pixels, with "between" and "regulars"');
    if (spec.on !== undefined && typeof spec.on !== 'boolean') out.push('on: true or false');
    if (spec.score !== undefined) {
      const s = spec.score as Record<string, unknown>;
      const ok = typeof s === 'object' && s !== null && Object.entries(s).every(([p, v]) => scenario.players.some((q) => q.id === p) && typeof v === 'object' && v !== null && Object.values(v).every((n) => Number.isInteger(n)));
      if (!ok) out.push('score: { "<player id>": { "ko": n, "falls": n } }, players of this scenario');
    }
    return out;
  },
  test(spec, rec) {
    const room = spec.room as string;
    const file = rec.content.cantina[room]!;
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    const want = spec.regulars as string[] | undefined;
    for (let t = from; t <= to; t++) {
      const w = rec.history[t]!;
      if (want) {
        const have = w.entities.filter((e) => e.player === null && e.id === regularId(e.kind)).map((e) => e.kind).sort();
        if (have.join() !== [...want].sort().join()) return `at tick ${t} the regulars are [${have.join(', ')}], expected [${[...want].sort().join(', ')}]`;
        for (const k of want) {
          const e = w.entities.find((x) => x.id === regularId(k))!;
          if (e.room !== room) return `at tick ${t} ${e.id} is in ${e.room}, not ${room}`;
          if (pastEdge(rec.content, file, e)) return `at tick ${t} ${e.id} is outside the edge (x ${e.x}, y ${e.y})`;
        }
      }
      const state = w.entities.find((e) => e.id === cantinaId(room))?.c.cantina;
      if (spec.on !== undefined && (state?.on ?? false) !== spec.on) return `at tick ${t} the brawl is ${state?.on ? 'on' : 'off'}, expected ${spec.on ? 'on' : 'off'}`;
      if (spec.party !== undefined) {
        const have = w.party ?? rec.content.party.members;
        if (have.join() !== (spec.party as string[]).join()) return `at tick ${t} the party is [${have.join(', ')}], expected [${(spec.party as string[]).join(', ')}]`;
      }
      if (spec.row !== undefined) {
        const have = state?.pick?.[`p:${spec.player as string}`]?.kind ?? null;
        if (have !== spec.row) return `at tick ${t} player ${String(spec.player)}'s party row is ${have === null ? 'closed' : `open for ${have}`}, expected ${spec.row === null ? 'closed' : `open for ${String(spec.row)}`}`;
      }
      if (spec.score !== undefined) {
        for (const [p, v] of Object.entries(spec.score as Record<string, { ko?: number; falls?: number }>)) {
          const got = state?.score[`p:${p}`] ?? { ko: 0, falls: 0 };
          if ((v.ko ?? got.ko) !== got.ko || (v.falls ?? got.falls) !== got.falls) return `at tick ${t} player ${p} has ${got.ko} knock-outs and ${got.falls} falls, expected ${JSON.stringify(v)}`;
        }
      }
    }
    if (want && spec.moved !== undefined) {
      for (const k of want) {
        const xs = rec.history.slice(from, to + 1).map((w) => w.entities.find((e) => e.id === regularId(k))?.x ?? 0);
        const span = Math.max(...xs) - Math.min(...xs);
        if (span < (spec.moved as number)) return `${regularId(k)} moved ${Math.round(span)} px sideways between ticks ${from} and ${to}, expected at least ${String(spec.moved)}`;
      }
    }
    return null;
  },
};
export default fact;
