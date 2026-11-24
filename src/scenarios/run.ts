import { describe, isRecord, known } from '../content/reader.ts';
import type { Content, Problem } from '../content/types.ts';
import { TILE } from '../content/kinds/rooms.ts';
import { setTile } from '../sim/room-state.ts';
import { step } from '../sim/step.ts';
import type { Input, SimEvent, World } from '../sim/types.ts';
import { createWorld, populateRoom, spawnBody, spawnPlayer } from '../sim/world.ts';
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
  const fields = ['id', 'gate', 'proves', 'room', 'players', 'entities', 'placements', 'placedRooms', 'tiles', 'world', 'inputs', 'ticks', 'expect'];
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
      if (p.character !== undefined && (typeof p.character !== 'string' || !(p.character in content.characters))) {
        fail(`${w}.character`, `no character ${JSON.stringify(p.character)} (characters: ${known(content.characters)})`);
      }
      const spawn = p.spawn ?? i;
      if (typeof spawn !== 'number' || !Number.isInteger(spawn) || spawn < 0) fail(`${w}.spawn`, `must be a whole number from 0, but is ${JSON.stringify(spawn)}`);
      // Step 3: a player may start in another room than the scenario's.
      if (p.room !== undefined && (typeof p.room !== 'string' || !(p.room in content.rooms))) fail(`${w}.room`, `no room ${JSON.stringify(p.room)} (rooms: ${known(content.rooms)})`);
      else if (typeof p.room === 'string' && content.rooms[p.room]!.spawns.length === 0) fail(`${w}.room`, `room "${p.room}" has no spawn tile for a player to start on`);
      // Step 11: a player who joins on a later tick (a friend arriving after a swap); left out, before tick 0.
      if (p.joins !== undefined && (typeof p.joins !== 'number' || !Number.isInteger(p.joins) || p.joins < 0)) fail(`${w}.joins`, `must be a whole tick from 0, but is ${JSON.stringify(p.joins)}`);
      // Step 9: a player who starts holding a power (content/powers/), as if they had taken it before tick 0.
      if (p.power !== undefined && (typeof p.power !== 'string' || !(p.power in (content.powers ?? {})))) fail(`${w}.power`, `no power ${JSON.stringify(p.power)} (powers: ${known(content.powers ?? {})})`);
      players.push({ id: String(p.id), character: p.character === undefined ? undefined : String(p.character), spawn: Number(spawn), ...(typeof p.room === 'string' ? { room: p.room } : {}), ...(typeof p.joins === 'number' && p.joins > 0 ? { joins: p.joins } : {}), ...(typeof p.power === 'string' ? { power: p.power } : {}) });
    });
  }

  const entities: NonNullable<Scenario['entities']> = [];
  if (raw.entities !== undefined) {
    if (!Array.isArray(raw.entities)) fail('entities', `must be a list, but is ${describe(raw.entities)}`);
    else {
      const scenarioRoom = typeof raw.room === 'string' ? content.rooms[raw.room] : undefined;
      raw.entities.forEach((e: unknown, i: number) => {
        const w = `entities[${i}]`;
        if (!isRecord(e)) return fail(w, `must be an object, but is ${describe(e)}`);
        // Step 3: a body may be put in another room than the scenario's.
        if (e.room !== undefined && (typeof e.room !== 'string' || !(e.room in content.rooms))) fail(`${w}.room`, `no room ${JSON.stringify(e.room)} (rooms: ${known(content.rooms)})`);
        const room = typeof e.room === 'string' ? content.rooms[e.room] : scenarioRoom;
        for (const key of Object.keys(e)) {
          if (!['id', 'character', 'tile', 'vx', 'vy', 'room', '//'].includes(key)) fail(`${w}.${key}`, 'unknown field (known fields: id, character, tile, vx, vy, room)');
        for (const axis of ['vx', 'vy']) {
          const v = e[axis];
          if (v !== undefined && (typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 900)) fail(`${w}.${axis}`, `must be a speed from -900 to 900 pixels per second, but is ${JSON.stringify(v)}`);
        }
        }
        if (typeof e.id !== 'string' || e.id === '') fail(`${w}.id`, 'must be non-empty text');
        else if (e.id.startsWith('p:')) fail(`${w}.id`, `"${e.id}" starts with "p:", which is how players' entities are named`);
        else if (entities.some((q) => q.id === e.id)) fail(`${w}.id`, `entity "${e.id}" is listed twice`);
        else if (raw.placements === true && room && room === scenarioRoom && content.placements?.[room.id]?.place.some((q) => q.id === e.id)) {
          fail(`${w}.id`, `"${e.id}" is already placed in room "${room.id}" by its placements file, which this scenario asked for`);
        }
        if (typeof e.character !== 'string' || !(e.character in content.characters)) {
          fail(`${w}.character`, `no character ${JSON.stringify(e.character)} (characters: ${known(content.characters)})`);
        }
        const t = e.tile;
        const tileOk = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n));
        if (!tileOk) fail(`${w}.tile`, `must be [column, row], but is ${JSON.stringify(t)}`);
        else if (room && (t[0] < 0 || t[1] < 0 || t[0] >= room.w || t[1] >= room.h)) {
          fail(`${w}.tile`, `[${t[0]}, ${t[1]}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
        }
        entities.push({ id: String(e.id), character: String(e.character), tile: tileOk ? [t[0], t[1]] : [0, 0], vx: e.vx as number | undefined, vy: e.vy as number | undefined, ...(typeof e.room === 'string' ? { room: e.room } : {}) });
      });
    }
  }

  if (raw.placements !== undefined && typeof raw.placements !== 'boolean') fail('placements', `must be true or false, but is ${describe(raw.placements)}`);
  // Step 11: other rooms whose placements are put in too, as the server's world has every room's (the street's door reads the cantina's chase list).
  const placedRooms: string[] = [];
  if (raw.placedRooms !== undefined) {
    if (!Array.isArray(raw.placedRooms)) fail('placedRooms', `must be a list of room ids, but is ${describe(raw.placedRooms)}`);
    else (raw.placedRooms as unknown[]).forEach((r, i) => (typeof r === 'string' && r in content.rooms ? placedRooms.push(r) : fail(`placedRooms[${i}]`, `no room ${JSON.stringify(r)} (rooms: ${known(content.rooms)})`)));
  }

  // Step 13: top-level world fields seeded before the start (world.roster, say).
  let seed: Record<string, unknown> | undefined;
  if (raw.world !== undefined) {
    if (!isRecord(raw.world)) fail('world', `must be an object of top-level world fields, but is ${describe(raw.world)}`);
    else {
      seed = {};
      for (const [key, value] of Object.entries(raw.world)) {
        if (key === '//') continue;
        if (['tick', 'entities', 'rooms'].includes(key)) fail(`world.${key}`, 'is not seeded here (players, entities, tiles and placements set those)');
        else if (key === 'roster' && (!Array.isArray(value) || !value.every((k) => typeof k === 'string' && content.roster.characters.includes(k)))) fail('world.roster', `must be a list of roster characters (${content.roster.characters.join(', ')}), but is ${JSON.stringify(value)}`);
        else seed[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }

  // Step 3: tiles changed before the start, standing in for a working part (a closed gate).
  const tiles: NonNullable<Scenario['tiles']> = [];
  if (raw.tiles !== undefined && !Array.isArray(raw.tiles)) fail('tiles', `must be a list, but is ${describe(raw.tiles)}`);
  else {
    ((raw.tiles as unknown[] | undefined) ?? []).forEach((t: unknown, i: number) => {
      const w = `tiles[${i}]`;
      if (!isRecord(t)) return fail(w, `must be an object, but is ${describe(t)}`);
      for (const key of Object.keys(t)) if (!['room', 'tile', 'is', '//'].includes(key)) fail(`${w}.${key}`, 'unknown field (known fields: room, tile, is)');
      const room = typeof t.room === 'string' ? content.rooms[t.room] : undefined;
      const at = t.tile;
      const tileOk = Array.isArray(at) && at.length === 2 && at.every((n) => Number.isInteger(n));
      if (!room) fail(`${w}.room`, `no room ${JSON.stringify(t.room)} (rooms: ${known(content.rooms)})`);
      else if (!tileOk || at[0] < 0 || at[1] < 0 || at[0] >= room.w || at[1] >= room.h) fail(`${w}.tile`, `must be [column, row] inside room "${room.id}" (${room.w} by ${room.h} tiles), but is ${JSON.stringify(at)}`);
      if (typeof t.is !== 'string' || !Object.hasOwn(TILE, t.is)) fail(`${w}.is`, `must be one of ${Object.keys(TILE).join(', ')}, but is ${JSON.stringify(t.is)}`);
      else if (room && tileOk) tiles.push({ room: room.id, tile: [at[0], at[1]], is: TILE[t.is as keyof typeof TILE] });
    });
  }

  const inputs: InputSpan[] = [];
  if (!Array.isArray(raw.inputs)) fail('inputs', 'must be a list (it may be empty)');
  else {
    raw.inputs.forEach((s: unknown, i: number) => {
      const w = `inputs[${i}]`;
      if (!isRecord(s)) return fail(w, `must be an object, but is ${describe(s)}`);
      for (const key of Object.keys(s)) {
        if (!['player', 'entity', 'from', 'to', 'x', 'y', 'hold', 'tap', '//'].includes(key)) fail(`${w}.${key}`, 'unknown field (known fields: player, entity, from, to, x, y, hold, tap)');
      }
      if (s.entity !== undefined) {
        if (s.player !== undefined) fail(`${w}.player`, 'give player or entity, not both');
        if (!entities.some((e) => e.id === s.entity)) fail(`${w}.entity`, `must be one of this scenario's entities, but is ${JSON.stringify(s.entity)}`);
      } else if (!players.some((p) => p.id === s.player)) fail(`${w}.player`, `must be one of this scenario's players, but is ${JSON.stringify(s.player)}`);
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
      // Step 11: a tap on the game view (Input.tap). `n` as the page counts taps; `at` an entity id stands for
      // that body's middle on each tick of the span (authoring sugar: a page sends room pixels); or `x`,`y`; or `slot`.
      let tap: InputSpan['tap'];
      if (s.tap !== undefined) {
        const t = s.tap;
        const n = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v);
        if (!isRecord(t) || !Number.isInteger(t.n)) fail(`${w}.tap`, `must be { "n": whole number, and "at": entity id, or "x" and "y" room pixels, or "slot" }, but is ${describe(t)}`);
        else {
          for (const key of Object.keys(t)) if (!['n', 'at', 'x', 'y', 'slot', 'id', 'dx', '//'].includes(key)) fail(`${w}.tap.${key}`, 'unknown field (known fields: n, at, x, y, slot, id, dx)');
          // Step 11 (a tap on a walking regular): `id` is the regular the page names as drawn under the finger; `dx` moves an `at` tap sideways, room pixels.
          if (t.id !== undefined && typeof t.id !== 'string') fail(`${w}.tap.id`, 'must be an entity id');
          if (t.dx !== undefined && (!n(t.dx) || t.at === undefined)) fail(`${w}.tap.dx`, 'must be a number, with "at"');
          const ways = [t.at !== undefined, t.x !== undefined || t.y !== undefined, t.slot !== undefined].filter(Boolean).length;
          if (ways !== 1) fail(`${w}.tap`, 'give one of "at", "x" and "y", or "slot"');
          if (t.at !== undefined && typeof t.at !== 'string') fail(`${w}.tap.at`, 'must be an entity id');
          if ((t.x !== undefined || t.y !== undefined) && (!n(t.x) || !n(t.y))) fail(`${w}.tap`, '"x" and "y" must both be numbers');
          if (t.slot !== undefined && (!Number.isInteger(t.slot) || (t.slot as number) < 0)) fail(`${w}.tap.slot`, 'must be a whole number from 0');
          tap = { n: t.n as number, ...(typeof t.at === 'string' ? { at: t.at } : {}), ...(n(t.x) && n(t.y) ? { x: t.x as number, y: t.y as number } : {}), ...(Number.isInteger(t.slot) ? { slot: t.slot as number } : {}), ...(typeof t.id === 'string' ? { id: t.id } : {}), ...(n(t.dx) ? { dx: t.dx as number } : {}) };
        }
      }
      inputs.push({ player: s.entity === undefined ? String(s.player) : '', entity: s.entity as string | undefined, from: Number(s.from), to: Number(s.to), x: s.x as number | undefined, y: s.y as number | undefined, hold: Array.isArray(hold) ? (hold as string[]) : [], ...(tap ? { tap } : {}) });
    });
  }

  const scenario: Scenario = {
    id: stem,
    gate: gate as string | null,
    proves: String(raw.proves ?? ''),
    room: String(raw.room),
    players,
    entities,
    placements: raw.placements === true,
    ...(placedRooms.length ? { placedRooms } : {}),
    ...(tiles.length ? { tiles } : {}),
    ...(seed ? { world: seed } : {}),
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
export function inputsAt(scenario: Scenario, tick: number, world?: World, content?: Content): Record<string, Input> {
  const out: Record<string, Input> = {};
  for (const p of scenario.players) out[p.id] = { x: 0, y: 0, held: [] };
  for (const s of scenario.inputs) {
    if (tick < s.from || tick >= s.to || s.entity !== undefined) continue;
    const input = out[s.player]!;
    if (s.x !== undefined) input.x = s.x;
    if (s.y !== undefined) input.y = s.y;
    for (const a of s.hold ?? []) if (!input.held.includes(a)) input.held.push(a);
    if (s.tap) {
      // Step 11: `at` resolves to that body's middle as it stands now (nowhere it is not in the world).
      const body = s.tap.at !== undefined ? world?.entities.find((e) => e.id === s.tap!.at) : undefined;
      const box = body ? content?.characters[body.kind]?.box : undefined;
      const at = body && box ? { x: body.x + box.w / 2 + (s.tap.dx ?? 0), y: body.y + box.h / 2 } : { x: s.tap.x ?? -9999, y: s.tap.y ?? -9999 };
      input.tap = { ...at, n: s.tap.n, ...(s.tap.slot !== undefined ? { slot: s.tap.slot } : {}), ...(s.tap.id !== undefined ? { id: s.tap.id } : {}) };
    }
  }
  return out;
}

/**
 * The input a scenario gives its non-player entities on one tick, by entity
 * id: only entities that have at least one span anywhere in the scenario.
 */
export function entityInputsAt(scenario: Scenario, tick: number): Record<string, Input> {
  const out: Record<string, Input> = {};
  for (const s of scenario.inputs) {
    if (s.entity === undefined) continue;
    const input = (out[s.entity] ??= { x: 0, y: 0, held: [] });
    if (tick < s.from || tick >= s.to) continue;
    if (s.x !== undefined) input.x = s.x;
    if (s.y !== undefined) input.y = s.y;
    for (const a of s.hold ?? []) if (!input.held.includes(a)) input.held.push(a);
  }
  return out;
}

export function simulate(scenario: Scenario, content: Content): Recording {
  const world = createWorld();
  // Step 13: seeded first, as makeWorld sets them before anyone joins.
  if (scenario.world) Object.assign(world, JSON.parse(JSON.stringify(scenario.world)));
  for (const p of scenario.players) {
    if (p.joins) continue;
    const e = spawnPlayer(world, content, { player: p.id, character: p.character, room: p.room ?? scenario.room, spawn: p.spawn });
    if (p.power) e.c.power = { id: p.power };
  }
  if (scenario.placements) populateRoom(world, content, scenario.room);
  for (const r of scenario.placedRooms ?? []) populateRoom(world, content, r);
  for (const e of scenario.entities ?? []) {
    const body = spawnBody(world, content, { id: e.id, character: e.character, room: e.room ?? scenario.room, tile: e.tile });
    body.vx = e.vx ?? 0;
    body.vy = e.vy ?? 0;
    if (body.vx !== 0 || body.vy !== 0) body.onGround = false;
  }
  for (const t of scenario.tiles ?? []) setTile(world, content.rooms[t.room]!, t.tile[0], t.tile[1], t.is);
  const snapshot = (): World => JSON.parse(JSON.stringify(world)) as World;
  const history: World[] = [snapshot()];
  const events: SimEvent[] = [];
  for (let t = 0; t < scenario.ticks; t++) {
    // A body that is not a player acts through entity.c.input (src/sim/systems/verbs.ts).
    for (const [id, input] of Object.entries(entityInputsAt(scenario, t))) {
      const body = world.entities.find((e) => e.id === id);
      if (body) body.c.input = input;
    }
    // Step 11: a player who joins later is put in the world at the start of that tick, as a server does on joining.
    for (const p of scenario.players) if (p.joins === t) spawnPlayer(world, content, { player: p.id, character: p.character, room: p.room ?? scenario.room, spawn: p.spawn });
    events.push(...step(world, inputsAt(scenario, t, world, content), content));
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
