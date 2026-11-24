// Step 22 (docs/mechanisms/stages.md): the shared rules of a stage, a level
// played as a run with a start, a loss, an end and a result. A helper, not a
// registry file, like defeat.ts: the systems are src/sim/systems/stage-*.ts.
import type { Content } from '../content/types.ts';
import type { Stage } from '../content/kinds/stages.ts';
import { alertId } from './npc/alert.ts';
import { THING_KIND } from './npc/state.ts';
import type { Entity, World } from './types.ts';
import { addEntity, createWorld, removeEntity, spawnBody } from './world.ts';

/** One run of a stage, as the world keeps it (`world.stages[id]`). */
export interface StageRun {
  /** `idle`: nobody has started it (or it was cleared and nobody is back in); `running`: under way. */
  state: 'idle' | 'running';
  /** The tick the run (or its latest try) started. */
  started: number;
  /** How many times the run was started over (a player thrown out inside the stage). */
  tries: number;
  /** Players thrown out since the last start-over, waiting for the stage to empty of everyone else. */
  pending: string[];
}

declare module './types.ts' {
  interface World {
    /**
     * Step 22: each stage's run, by stage id (content/stages/). Absent until
     * the first. Small, and sent to the pages like every top-level field (the
     * victory screen and the sign read it). Kept with a kept game.
     */
    stages?: Record<string, StageRun>;
    /**
     * Step 22: each stage's people and bodies as they were first placed, by
     * stage id: what a start-over puts back (`restoreStage`). Taken once, the
     * first tick a stage is seen, from the placements as a fresh world places
     * them, and then never re-read from files (a kept game restores the same
     * way whatever a later build moves). Kept with a kept game; never sent to
     * a page (src/server/game.ts leaves it out of each snapshot: a page never
     * restores anything).
     */
    stageHome?: Record<string, Entity[]>;
  }
  interface EventMap {
    /** Step 22: a run of a stage began: a player someone plays is inside it with no run under way. */
    'stage-started': { stage: string; player: string | null };
    /** Step 22: the stage was put back as it began, the run's clock and counts at zero; `tries` counts this one. */
    'stage-restarted': { stage: string; tries: number };
  }
}

/** The stage (on) whose level holds `room`, if any. */
export function stageOfRoom(content: Content, room: string): Stage | undefined {
  for (const id of Object.keys(content.stages ?? {}).sort()) {
    const s = content.stages[id]!;
    if (s.on && content.levels?.[s.level]?.rooms.includes(room)) return s;
  }
  return undefined;
}

/** The rooms of a stage: its level's. */
export function stageRooms(content: Content, s: Stage): string[] {
  return content.levels?.[s.level]?.rooms ?? [];
}

/** The stage's people and bodies as a fresh world places them (src/sim/world.ts populateRoom's bodies; no recruit, no cantina). */
export function homeOf(content: Content, s: Stage): Entity[] {
  const scratch = createWorld();
  for (const room of stageRooms(content, s)) {
    for (const p of content.placements?.[room]?.place ?? []) {
      spawnBody(scratch, content, { id: p.id, character: p.character, room, tile: p.tile });
    }
  }
  return scratch.entities;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * Puts a stage back as it began. Every placed body of it is put back as first
 * placed (whole, at its post, not flattened, not seized, not angry: its `c`
 * is empty, and npc-setup makes it a person again next tick); a wave's body
 * of an outpost in it is gone; its alerts are gone; its things are taken
 * away so npc-setup puts them back untaken (a prize already banked stays
 * banked); a prize in a hero's hands is let go; each room's state
 * (`world.rooms`: a gate, a broken wall) is as it was before anything
 * changed. Bodies a player holds or carries are left alone, and so is every
 * body a player plays.
 *
 * INTENT (docs/plan/step-22.md, "This is the owner's own exception";
 * docs/deliberate-designs.md): the stage is the owner's one exception to
 * D-077 ("never reset when a room empties"): his "pushes you back to the
 * entrance to start over". Only a stage's rooms, only when a stage starts
 * over; everywhere else nothing is put back.
 * Kept for good, never touched here: the level's found pieces
 * (`world.levels`, completion), discovered power sources, the roster.
 */
export function restoreStage(world: World, content: Content, s: Stage): void {
  const rooms = new Set(stageRooms(content, s));
  const home = world.stageHome?.[s.id] ?? homeOf(content, s);
  const homeIds = new Set(home.map((e) => e.id));
  const waves = Object.values(content.outposts ?? {}).filter((o) => rooms.has(o.room)).map((o) => `${o.id}:w`);
  const things = new Set<string>();
  for (const r of rooms) for (const t of content.placements?.[r]?.things ?? []) things.add(t.id);
  const alerts = new Set([...rooms].map(alertId));
  const banked = new Set(world.banked ?? []);
  const kept = new Set<string>();
  for (const e of world.entities) {
    if (e.player === null) continue;
    if (e.c.carrying) kept.add(e.c.carrying.id);
    const holder = e.c.effect?.heldBy;
    if (holder) kept.add(holder);
  }
  for (const e of world.entities) {
    const by = e.c.effect?.heldBy;
    if (by && world.entities.some((p) => p.id === by && p.player !== null)) kept.add(e.id);
  }

  for (const e of [...world.entities]) {
    if (e.player !== null || kept.has(e.id)) continue;
    const gone =
      homeIds.has(e.id) ||
      alerts.has(e.id) ||
      (things.has(e.id) && e.kind === THING_KIND && !banked.has(e.id)) ||
      (rooms.has(e.room) && waves.some((w) => e.id.startsWith(w)));
    if (gone) removeEntity(world, e.id);
  }
  for (const e of home) if (!kept.has(e.id)) addEntity(world, clone(e));
  if (world.cargo) {
    for (const [hero, thing] of Object.entries(world.cargo)) if (things.has(thing)) delete world.cargo[hero];
  }
  if (world.rooms) for (const r of rooms) delete world.rooms[r];
}
