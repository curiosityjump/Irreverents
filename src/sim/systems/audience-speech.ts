import { TICK_RATE } from '../types.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

declare module '../types.ts' {
  interface Components {
    /** On a body that is giving a speech (content/audience/). */
    audience?: {
      /** Which speech (a content/audience/ id). */
      id: string;
      /** How long he has been talking, in ticks; the line showing is ticks / ticksPerLine (src/content/speech.ts). */
      ticks: number;
    };
  }
}

/** How many ticks one line of a speech stays up. */
export function speechTicksPerLine(speechLineTime: number | undefined): number {
  return Math.max(1, Math.round((speechLineTime ?? 6) * TICK_RATE));
}

/**
 * The clock of a speech: one more tick of talking for each speaker, every
 * tick, wherever he is. Writeup: docs/mechanisms/royal-audience.md.
 *
 * INTENT: this is a system and not a verb, and it never asks whether the
 * speaker may act. A held, flying, flattened or carried-off king is still
 * talking (lead's decision 2026-11-23, DRAFT, docs/decisions-log.md).
 * INTENT: the count lives on his body and never reads world.tick, so it
 * travels with him between rooms and devices.
 * INTENT: it writes this one field and nothing else. Nothing in the game
 * may wait on the speech: the owner's opening has no gate of any kind
 * (design library doc 03).
 */
const system: System = {
  id: 'audience-speech',
  order: 60,
  tuning: {
    speechLineTime: { min: 1, max: 60, what: "seconds one line of a speech stays over the speaker's head" },
  },
  run(ctx) {
    const { world, content } = ctx;
    const per = speechTicksPerLine(content.tuning.world.speechLineTime);
    for (const id of Object.keys(content.audience ?? {}).sort()) {
      const a = content.audience[id]!;
      const e = findEntity(world, a.speaker);
      if (!e) continue;
      // He starts mid-speech: the first player walks in on line `startLine`.
      const s = (e.c.audience ??= { id, ticks: a.startLine * per });
      s.ticks++;
    }
  },
};
export default system;
