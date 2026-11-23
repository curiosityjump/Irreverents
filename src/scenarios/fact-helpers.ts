import type { Content } from '../content/types.ts';
import type { Entity } from '../sim/types.ts';
import type { Recording, Scenario } from './types.ts';

export function isTick(v: unknown, scenario: Scenario): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= scenario.ticks;
}

export function isRange(v: unknown): v is [number, number] {
  return Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number' && v[0] <= v[1];
}

export function checkPlayer(spec: Record<string, unknown>, scenario: Scenario, out: string[]): void {
  if (typeof spec.player !== 'string' || !scenario.players.some((p) => p.id === spec.player)) {
    out.push(`player: must be one of this scenario's players (${scenario.players.map((p) => p.id).join(', ')}), but is ${JSON.stringify(spec.player)}`);
  }
}

export function checkAt(spec: Record<string, unknown>, scenario: Scenario, out: string[]): void {
  if (!isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}, but is ${JSON.stringify(spec.at)}`);
}

export function checkOnly(spec: Record<string, unknown>, fields: string[], out: string[]): void {
  for (const key of Object.keys(spec)) {
    if (key !== 'fact' && key !== '//' && !fields.includes(key)) out.push(`${key}: unknown field (known fields: ${fields.join(', ')})`);
  }
}

export function playerAt(rec: Recording, player: string, tick: number): Entity | undefined {
  return rec.history[tick]?.entities.find((e) => e.player === player);
}

/** The point facts measure a character by: the middle of its feet. */
export function feet(rec: Recording, e: Entity): { x: number; y: number; tx: number; ty: number } {
  const box = rec.content.characters[e.kind]!.box;
  const tile = rec.content.rooms[e.room]!.tile;
  const x = e.x + box.w / 2;
  const y = e.y + box.h;
  return { x, y, tx: Math.floor(x / tile), ty: Math.round(y / tile) };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * A fact about a body names it with "player" (a player's id) or "entity"
 * (the id of one of the scenario's `entities`, or of one of the room's
 * placements when the scenario has "placements": true): exactly one of the two.
 */
export function checkBody(spec: Record<string, unknown>, scenario: Scenario, out: string[], content?: Content): void {
  if (spec.entity === undefined) return checkPlayer(spec, scenario, out);
  if (spec.player !== undefined) out.push('player / entity: give one or the other, not both');
  const ids = (scenario.entities ?? []).map((e) => e.id);
  if (scenario.placements && content) for (const p of content.placements?.[scenario.room]?.place ?? []) ids.push(p.id);
  if (typeof spec.entity !== 'string' || !ids.includes(spec.entity)) {
    out.push(`entity: must be one of this scenario's entities (${ids.join(', ') || 'it lists none'}), but is ${JSON.stringify(spec.entity)}`);
  }
}

/** The body a fact names, at a tick. */
export function bodyAt(rec: Recording, spec: Record<string, unknown>, tick: number): Entity | undefined {
  if (spec.entity !== undefined) return rec.history[tick]?.entities.find((e) => e.id === spec.entity);
  return playerAt(rec, spec.player as string, tick);
}

/** How a failure message names the body: "player a" or "entity dummy-1". */
export function bodyName(spec: Record<string, unknown>): string {
  return spec.entity !== undefined ? `entity ${String(spec.entity)}` : `player ${String(spec.player)}`;
}
