import type { Content } from '../../content/types.ts';
import { ticksOf } from '../../sim/body-state.ts';
import { numbersOf } from '../../sim/powers.ts';
import type { Entity, World } from '../../sim/types.ts';
import { useHere } from '../../sim/use.ts';

/**
 * Step 25 push 2: the heave drawn. While a carrier heaves the body it holds
 * (verbs/suplex.ts), the body is drawn turned about the carrier's shoulders,
 * up and over to behind them, head first, over `suplexTime`. The slam
 * itself (dust, shake, sound) comes from its impact, as every impact's does
 * (draw/impact.ts, audio/moments.ts).
 *
 * INTENT: drawn from the press. A player's own page never learns its hero
 * carries or heaves (the server does both; docs/mechanisms/network.md), so
 * it starts the heave on the frame its own Use press goes down while the
 * Use arbiter, asked of the composed world, says `suplex`. Another
 * player's page takes the carrier's `c.suplex.at`, stamped by the
 * simulation, so it does not wait for six snapshots of positions.
 * DRAFT: the turn's shape (0.8 of a half-turn, eased in so it speeds up
 * into the floor) and the pivot (a third of the way down the carrier).
 */
const TURN = 0.8 * Math.PI;
const PIVOT_DOWN = 0.3;
/** DRAFT: how long past the heave the body may stay turned waiting for the slam (ticks): a slow round trip. */
const HOLD_TICKS = 45;

const seen = new Map<string, { held: boolean; start: number }>();

/** The tick this carrier's heave began, as this page knows it, or null. Call once per frame per carrier. */
function heaveStart(world: World, content: Content, carrier: Entity): number | null {
  const s = carrier.c.suplex;
  let m = seen.get(carrier.id);
  if (!m) {
    m = { held: s?.held ?? false, start: -1e9 };
    seen.set(carrier.id, m);
  }
  const held = s?.held ?? false;
  if (held && !m.held && useHere(world, content, carrier)?.entry === 'suplex') m.start = world.tick;
  m.held = held;
  const at = s?.at;
  if (at !== undefined && at > m.start - 30 && at <= world.tick) m.start = Math.max(m.start, at);
  if (seen.size > 64) for (const [id] of seen) if (!world.entities.some((e) => e.id === id)) seen.delete(id);
  return m.start;
}

/**
 * Turns the canvas for drawing `body`, carried by `carrier`, mid-heave.
 * Returns true when it turned it (the caller restores). `ox`, `oy`: the room's origin on screen.
 */
export function turnForHeave(g: CanvasRenderingContext2D, world: World, content: Content, carrier: Entity, body: Entity, ox: number, oy: number): boolean {
  const start = heaveStart(world, content, carrier);
  if (start === null || body.c.effect?.heldBy !== carrier.id) return false;
  const length = Math.max(1, ticksOf(numbersOf(content, carrier).suplexTime));
  const age = world.tick - start;
  // INTENT: past its length the body stays turned while it is still held: the presser's page waits about a round
  // trip for the server's slam, and a body snapping back overhead in between would read as a cancelled move.
  if (age < 0 || age >= length + HOLD_TICKS) return false;
  const cb = content.characters[carrier.kind]?.box;
  if (!cb) return false;
  const p = Math.min(1, (age + 1) / length);
  const dir = carrier.c.suplex?.dir ?? carrier.facing;
  const px = Math.round(ox + carrier.x + cb.w / 2);
  const py = Math.round(oy + carrier.y + cb.h * PIVOT_DOWN);
  const angle = -dir * TURN * p * p;
  // DRAFT: what a check reads (scripts/e2e/suplex.ts): the last heave drawn, in degrees, on the page's drawn record.
  const drawn = (globalThis as { irreverents?: { drawn?: Record<string, unknown> } }).irreverents?.drawn;
  if (drawn) drawn.heave = Math.abs((angle * 180) / Math.PI);
  g.translate(px, py);
  g.rotate(angle);
  g.translate(-px, -py);
  return true;
}
