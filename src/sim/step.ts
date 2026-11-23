import type { Content } from '../content/types.ts';
import { systems } from './registry.ts';
import type { Input, SimEvent, StepContext, World } from './types.ts';

/**
 * Advances the world by one tick.
 *
 * INTENT: step() changes `world` in place and returns the events of this
 * tick. In place because it runs 60 times a second on a phone; a caller
 * that needs a copy takes one (the world is plain JSON data). Given the
 * same world, inputs and content it always produces the same result:
 * nothing here may read a clock, a random number or anything outside its
 * arguments (docs/architecture.md, "The simulation core").
 */
export function step(world: World, inputs: Record<string, Input>, content: Content): SimEvent[] {
  const events: SimEvent[] = [];
  const ctx: StepContext = {
    world,
    inputs,
    content,
    events,
    emit(type, data) {
      events.push({ type, tick: world.tick, ...data } as SimEvent);
    },
  };
  for (const system of systems) system.run(ctx);
  world.tick++;
  return events;
}
