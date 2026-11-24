import type { Content } from '../../content/types.ts';
import { bodyNumbers, ticksOf } from '../../sim/body-state.ts';
import type { Entity, SimEvent } from '../../sim/types.ts';
import { queueBanner } from './banner.ts';
import { fillHudSlot } from './hud.ts';

// Step 21 push 3 (docs/mechanisms/defeat.md, "On screen"): the condition slot
// beside the viewer's face on the party plate, and the two banners of being
// beaten. The owner, playing: "i seem to be invincible as hero" and "neither
// can heros [be fully defeated]": he cannot tell he is losing, so each fall
// shows. A page never gets the server's `c` for its own character
// (docs/mechanisms/network.md): wear and falls are read from the snapshot's
// copy of the viewer (src/net/client.ts `serverMe`), handed in each frame by
// main.ts.
// INTENT: no digits, no bar, no hearts (t-no-numbers; D-020): three shields.
// DRAFT: the three states and their thresholds below; the words are the
// place file's (content/defeat/).

/** DRAFT: a share of toughness worn that reads as hurt, and one that reads as at the edge. */
const HURT_SHARE = 0.01;
const EDGE_SHARE = 0.75;
/** DRAFT: three seconds of this page's frames for each banner. */
const BANNER_FRAMES = 180;

export type Condition = 'fine' | 'hurt' | 'down';
let copy: Entity | null = null;
let now: Condition = 'fine';
let tickNow = 0;

/** Fed every frame from main.ts with the server's copy of the viewer's character (or null before the first snapshot). */
export function setViewerCopy(e: Entity | null, tick: number): void {
  copy = e;
  tickNow = tick;
}

/** What the slot shows now, for `window.irreverents.drawn.condition`. */
export function drawnCondition(): Condition {
  return now;
}

/** The viewer's condition: down when flat or one fall from being thrown out (or nearly worn through); hurt after any wear or fall here. */
export function conditionOf(content: Content, e: Entity | null): Condition {
  if (!e) return 'fine';
  if (e.c.flattened) return 'down';
  const falls = e.c.falls;
  const place = falls ? content.defeat?.[falls.place] : undefined;
  const recent = falls && place ? falls.ticks.filter((t) => t > tickNow - ticksOf(place.window)).length : 0;
  const { toughness } = bodyNumbers(content, e);
  const worn = toughness > 0 ? (e.c.worn?.amount ?? 0) / toughness : 0;
  if ((place && recent >= place.downs - 1 && recent > 0) || worn >= EDGE_SHARE) return 'down';
  if (recent > 0 || worn >= HURT_SHARE) return 'hurt';
  return 'fine';
}

fillHudSlot('condition', (_world, content) => {
  now = conditionOf(content, copy);
  return `hud-condition-${now}`;
});

let lastLatest: unknown = null;
/** Fed every frame from main.ts with the server's newest events: being thrown out, and a prize going back, each queue a banner for the one it happened to. */
export function watchDefeatEvents(content: Content, me: string, latest: { tick: number; events: readonly SimEvent[] }): void {
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) {
    if (ev.type === 'thrown-out' && ev.entity === me) {
      const words = content.defeat?.[ev.place]?.words.thrownOut;
      if (words) queueBanner({ key: `risk:thrown-out:${ev.tick}`, text: words, frames: BANNER_FRAMES, color: '#ffb0a0' });
    } else if (ev.type === 'prize-returned' && ev.by === me) {
      const place = Object.values(content.defeat ?? {}).find((d) => d.on);
      const words = place?.words.prizeReturned;
      if (words) queueBanner({ key: `risk:prize-returned:${ev.tick}`, text: words, frames: BANNER_FRAMES, color: '#ffd890' });
    }
  }
}
