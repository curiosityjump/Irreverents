// Step 22 (docs/mechanisms/stages.md): the shared rules of a stage, a level
// played as a run with a start, a loss, an end and a result. A helper, not a
// registry file, like defeat.ts: the systems are src/sim/systems/stage-*.ts.
import type { Content } from '../content/types.ts';
import type { Stage } from '../content/kinds/stages.ts';
import { restorePeople } from './beaten.ts';
import { alertId } from './npc/alert.ts';
import { THING_KIND } from './npc/state.ts';
import { TICK_RATE, type Entity, type World } from './types.ts';
import { addEntity, createWorld, removeEntity, spawnBody } from './world.ts';

/** One run of a stage, as the world keeps it (`world.stages[id]`). */
export interface StageRun {
  /**
   * `idle`: nobody has started it (or it was cleared and everyone has left);
   * `running`: under way; `cleared` (Step 22 push 3): its end was reached and
   * somebody is still inside: no new run starts until the stage is empty.
   */
  state: 'idle' | 'running' | 'cleared';
  /** The tick the run (or its latest try) started. */
  started: number;
  /** How many times the run was started over (a player thrown out inside the stage). */
  tries: number;
  /** Players thrown out since the last start-over, waiting for the stage to empty of everyone else. */
  pending: string[];
  /** Step 22 push 3: what this try of the run has done so far (the victory screen's statistics). Zeroed at each start and start-over. */
  counts?: StageCounts;
  /** Step 22 push 3: the best clear yet (most stars, then the fastest): shown on the level's sign and menu row. Kept with a kept game. */
  best?: { stars: number; ticks: number };
}

/** Step 22 push 3: one try's statistics, gathered while it runs. */
export interface StageCounts {
  /** Bad guys of the stage beaten for good (`defeated`, src/sim/beaten.ts) credited to a player this try (distinct ids). */
  defeated: string[];
  /** Calls finished in the stage's rooms (an outpost's horn, a town call). */
  alarms: number;
  /** Whether a bad guy of the stage has had a played hero in sight (npc/sight.ts canSee, the test the band draws). */
  seen: boolean;
  /** Whether a prize of a heist in the stage's rooms was carried out (banked) this try. */
  hoard: boolean;
}

export const freshCounts = (): StageCounts => ({ defeated: [], alarms: 0, seen: false, hoard: false });

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
    /**
     * Step 22 push 3: a played hero reached the stage's end. Once per run.
     * `ticks` from the start of this try; `defeated` bad guys knocked flat by
     * a hero; `alarms` calls finished; `tries` start-overs; `unseen` nobody of
     * the stage had a hero in sight; `hoard` a prize carried out (or in a
     * hero's hands at the end); `stars` 1 to 3 (stageStars); `best` whether it
     * is the stage's new best.
     */
    'stage-cleared': { stage: string; player: string | null; ticks: number; defeated: number; alarms: number; tries: number; unseen: boolean; hoard: boolean; stars: number; best: boolean };
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
  // Beaten for good (src/sim/beaten.ts, docs/mechanisms/combat-and-impact.md): the people
  // defeated and gone come back through its own rule; the home copy below then puts back
  // everyone else (knocked flat, moved, angry), as before.
  const back = new Set<string>();
  for (const r of [...rooms].sort()) for (const id of restorePeople(world, content, r)) back.add(id);
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
      (homeIds.has(e.id) && !back.has(e.id)) ||
      alerts.has(e.id) ||
      (things.has(e.id) && e.kind === THING_KIND && !banked.has(e.id)) ||
      (rooms.has(e.room) && waves.some((w) => e.id.startsWith(w)));
    if (gone) removeEntity(world, e.id);
  }
  for (const e of home) if (!kept.has(e.id) && !back.has(e.id)) addEntity(world, clone(e));
  if (world.cargo) {
    for (const [hero, thing] of Object.entries(world.cargo)) if (things.has(thing)) delete world.cargo[hero];
  }
  if (world.rooms) for (const r of rooms) delete world.rooms[r];
}

/**
 * Step 22 push 3: the stars a clear earns (DRAFT, docs/decisions-log.md,
 * "Step 22 push 3"; the thresholds are the stage file's, measured by scripted
 * runs, docs/plan/step-22.md "Builder notes"). One for finishing; two for a
 * time at or under `good` seconds, or at most `tries` start-overs (default 1);
 * three for two and any of: nobody saw you, no alarm finished, a time at or
 * under `best` seconds.
 */
export function stageStars(s: Stage, r: { ticks: number; tries: number; unseen: boolean; alarms: number }): 1 | 2 | 3 {
  const two = r.ticks <= s.stars.good * TICK_RATE || r.tries <= (s.stars.tries ?? 1);
  if (!two) return 1;
  return r.unseen || r.alarms === 0 || r.ticks <= s.stars.best * TICK_RATE ? 3 : 2;
}

/** Whether `e`'s box overlaps the stage's end box (tiles, inclusive) in its end room. */
export function atStageEnd(content: Content, s: Stage, e: Entity): boolean {
  if (e.room !== s.end.room) return false;
  const room = content.rooms[s.end.room];
  const box = content.characters[e.kind]?.box;
  if (!room || !box) return false;
  const T = room.tile;
  const [x0, y0] = s.end.from;
  const [x1, y1] = s.end.to;
  return e.x < (x1 + 1) * T && e.x + box.w > x0 * T && e.y < (y1 + 1) * T && e.y + box.h > y0 * T;
}

/** Step 22 push 3: the best clear kept for the stage (on) played on level `levelId`, if any: the sign and the menu row show it. */
export function stageBest(world: World, content: Content, levelId: string): { stars: number; ticks: number } | null {
  for (const id of Object.keys(content.stages ?? {}).sort()) {
    const s = content.stages[id]!;
    if (s.on && s.level === levelId) return world.stages?.[s.id]?.best ?? null;
  }
  return null;
}

/** Step 22 push 3: ticks as m:ss (60 ticks a second), the time a sign, a menu row and the victory screen show. */
export function stageClock(ticks: number): string {
  const sec = Math.floor(Math.max(0, ticks) / TICK_RATE);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
