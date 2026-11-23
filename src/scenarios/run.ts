import { describe, isRecord, known } from '../content/reader.ts';
import type { Content, Problem } from '../content/types.ts';
import { step } from '../sim/step.ts';
import type { Input, SimEvent, World } from '../sim/types.ts';
import { createWorld, spawnPlayer } from '../sim/world.ts';
import facts from './facts/index.gen.ts';
import type { InputSpan, Recording, Scenario } from './types.ts';

export const GATES = ['A', 'B', 'C', 'D', 'E', 'F'];
const MAX_TICKS = 60 * 60 * 5;

/** Validates one scenario file, naming the exact field wrong. Returns null when it cannot be run. */
export function parseScenario(raw: unknown, file: string, stem: string, content: Content, problems: Problem[]): Scenario | null {
  const before = problems.length;
  const fail = (where: string, message: string): void => {
    problems.push({ file, where, message });
  };
  if (!isRecord(raw)) {
    fail('(the whole file)', `must be an object, but is ${describe(raw)}`);
    return null;
  }
  const fields = ['id', 'gate', 'proves', 'room', 'players', 'inputs', 'ticks', 'expect'];
  for (const key of Object.keys(raw)) {
    if (key !== '//' && !fields.includes(key)) fail(key, `unknown field (known fields: ${fields.join(', ')})`);
  }
  if (raw.id !== stem) fail('id', `must match the file name "${stem}", but is ${JSON.stringify(raw.id)}`);
  const gate = raw.gate ?? null;
  if (gate !== null && !GATES.includes(gate as string)) fail('gate', `must be one of ${GATES.join(', ')} or left out, but is ${JSON.stringify(gate)}`);
  if (typeof raw.proves !== 'string' || raw.proves === '') fail('proves', 'say in a sentence what this scenario proves');
  if (typeof raw.room !== 'string' || !(raw.room in content.rooms)) {
    fail('room', `no room ${JSON.stringify(raw.room)} (rooms: ${known(content.rooms)})`);
  }
  const ticks = raw.ticks;
  const ticksOk = typeof ticks === 'number' && Number.isInteger(ticks) && ticks >= 1 && ticks <= MAX_TICKS;
  if (!ticksOk) fail('ticks', `must be a whole number from 1 to ${MAX_TICKS}, but is ${JSON.stringify(ticks)}`);

  const players: Scenario['players'] = [];
  if (!Array.isArray(raw.players) || raw.players.length === 0) fail('players', 'must list at least one player');
  else {
    raw.players.forEach((p: unknown, i: number) => {
      const w = `players[${i}]`;
      if (!isRecord(p)) return fail(w, `must be an object, but is ${describe(p)}`);
      if (typeof p.id !== 'string' || p.id === '') fail(`${w}.id`, 'must be non-empty text');
      else if (players.some((q) => q.id === p.id)) fail(`${w}.id`, `player "${p.id}" is listed twice`);
      if (typeof p.character !== 'string' || !(p.character in content.characters)) {
        fail(`${w}.character`, `no character ${JSON.stringify(p.character)} (characters: ${known(content.characters)})`);
      }
      const spawn = p.spawn ?? i;
      if (typeof spawn !== 'number' || !Number.isInteger(spawn) || spawn < 0) fail(`${w}.spawn`, `must be a whole number from 0, but is ${JSON.stringify(spawn)}`);
      players.push({ id: String(p.id), character: String(p.character), spawn: Number(spawn) });
    });
  }

  const inputs: InputSpan[] = [];
  if (!Array.isArray(raw.inputs)) fail('inputs', 'must be a list (it may be empty)');
  else {
    raw.inputs.forEach((s: unknown, i: number) => {
      const w = `inputs[${i}]`;
      if (!isRecord(s)) return fail(w, `must be an object, but is ${describe(s)}`);
      for (const key of Object.keys(s)) {
        if (!['player', 'from', 'to', 'x', 'y', 'hold', '//'].includes(key)) fail(`${w}.${key}`, 'unknown field (known fields: player, from, to, x, y, hold)');
      }
      if (!players.some((p) => p.id === s.player)) fail(`${w}.player`, `must be one of this scenario's players, but is ${JSON.stringify(s.player)}`);
      const okTick = (v: unknown): boolean => typeof v === 'number' && Number.isInteger(v) && v >= 0;
      if (!okTick(s.from) || !okTick(s.to) || (s.from as number) >= (s.to as number)) {
        fail(`${w}.from`, `from and to must be whole ticks with from before to, but are ${JSON.stringify(s.from)} and ${JSON.stringify(s.to)}`);
      }
      for (const axis of ['x', 'y']) {
        const v = s[axis];
        if (v !== undefined && (typeof v !== 'number' || v < -1 || v > 1)) fail(`${w}.${axis}`, `must be a number from -1 to 1, but is ${JSON.stringify(v)}`);
      }
      const hold = s.hold ?? [];
      if (!Array.isArray(hold)) fail(`${w}.hold`, 'must be a list of action ids');
      else {
        hold.forEach((a: unknown, k: number) => {
          if (typeof a !== 'string' || !(a in content.actions)) fail(`${w}.hold[${k}]`, `no action ${JSON.stringify(a)} (actions: ${known(content.actions)})`);
        });
      }
      inputs.push({ player: String(s.player), from: Number(s.from), to: Number(s.to), x: s.x as number | undefined, y: s.y as number | undefined, hold: Array.isArray(hold) ? (hold as string[]) : [] });
    });
  }

  const scenario: Scenario = {
    id: stem,
    gate: gate as string | null,
    proves: String(raw.proves ?? ''),
    room: String(raw.room),
    players,
    inputs,
    ticks: ticksOk ? (ticks as number) : 1,
    expect: [],
  };
  if (!Array.isArray(raw.expect) || raw.expect.length === 0) {
    // INTENT: a scenario with nothing expected cannot fail, so it is refused.
    fail('expect', 'must list at least one fact: a scenario that expects nothing cannot fail');
  } else {
    raw.expect.forEach((spec: unknown, i: number) => {
      const w = `expect[${i}]`;
      if (!isRecord(spec)) return fail(w, `must be an object, but is ${describe(spec)}`);
      const fact = facts.find((f) => f.id === spec.fact);
      if (!fact) return fail(`${w}.fact`, `no fact ${JSON.stringify(spec.fact)} (facts are files in src/scenarios/facts/: ${facts.map((f) => f.id).sort().join(', ')})`);
      if (ticksOk && problems.length === before) for (const m of fact.validate(spec, scenario, content)) fail(w, m);
      scenario.expect.push(spec);
    });
  }
  return problems.length === before ? scenario : null;
}

/** The input a scenario gives each player on one tick: every span covering the tick, merged in file order. */
export function inputsAt(scenario: Scenario, tick: number): Record<string, Input> {
  const out: Record<string, Input> = {};
  for (const p of scenario.players) out[p.id] = { x: 0, y: 0, held: [] };
  for (const s of scenario.inputs) {
    if (tick < s.from || tick >= s.to) continue;
    const input = out[s.player]!;
    if (s.x !== undefined) input.x = s.x;
    if (s.y !== undefined) input.y = s.y;
    for (const a of s.hold ?? []) if (!input.held.includes(a)) input.held.push(a);
  }
  return out;
}

export function simulate(scenario: Scenario, content: Content): Recording {
  const world = createWorld();
  for (const p of scenario.players) spawnPlayer(world, content, { player: p.id, character: p.character, room: scenario.room, spawn: p.spawn });
  const snapshot = (): World => JSON.parse(JSON.stringify(world)) as World;
  const history: World[] = [snapshot()];
  const events: SimEvent[] = [];
  for (let t = 0; t < scenario.ticks; t++) {
    events.push(...step(world, inputsAt(scenario, t), content));
    history.push(snapshot());
  }
  return { scenario, content, history, events };
}

export interface ScenarioResult {
  id: string;
  gate: string | null;
  /** Empty when the scenario passed. */
  failures: string[];
}

export function runScenario(scenario: Scenario, content: Content): ScenarioResult {
  const failures: string[] = [];
  const rec = simulate(scenario, content);
  // INTENT: every scenario runs twice and the two runs must match byte for
  // byte. Two devices only stay in the same world if the simulation is
  // deterministic, and this is the check that would catch a Math.random or
  // a clock slipping into src/sim/.
  const again = simulate(scenario, content);
  const a = rec.history.map((w) => JSON.stringify(w));
  const b = again.history.map((w) => JSON.stringify(w));
  const differs = a.findIndex((w, i) => w !== b[i]);
  if (differs >= 0) {
    failures.push(`not deterministic: two runs of the same inputs first differ at tick ${differs}`);
  } else if (JSON.stringify(rec.events) !== JSON.stringify(again.events)) {
    failures.push('not deterministic: two runs of the same inputs produced different events');
  }
  scenario.expect.forEach((spec, i) => {
    const fact = facts.find((f) => f.id === spec.fact)!;
    const failure = fact.test(spec, rec);
    if (failure) failures.push(`expect[${i}] (${fact.id}): ${failure}`);
  });
  return { id: scenario.id, gate: scenario.gate, failures };
}
