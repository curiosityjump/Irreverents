import type { Content } from '../../content/types.ts';
import { prizeOf } from '../../sim/heist.ts';
import type { SimEvent, World } from '../../sim/types.ts';
import { queueBanner } from './banner.ts';
import { fillHudSlot } from './hud.ts';
import { drawLook } from './looks.ts';

// Step 19 push 4 (docs/mechanisms/heists.md, "A prize in your hands"): what a
// page shows of a job. The prize a hero carries is in the cargo slot beside
// their face on the party plate (world.cargo, taken by key from the server);
// a taken prize's stand shows its `taken` look; a clean getaway, anyone's, is
// a banner (and a chime, src/client/audio/moments.ts).
// DRAFT: the words, which looks, that a friend's clean job is announced to
// everyone (it is the world's, like a found level).

/** The cargo slot: the carried prize's `carried` look (content/heists/). */
fillHudSlot('cargo', (world, content, me) => {
  const thing = world.cargo?.[me.id];
  return thing === undefined ? undefined : prizeOf(content, thing)?.prize.carried;
});

/** DRAFT: the words of the clean-getaway banner. No digits. */
const CLEAN = 'Nobody noticed';
/** DRAFT: three seconds of this page's frames. */
const CLEAN_FRAMES = 180;

let lastLatest: unknown = null;
let cleanShown: string[] = [];

/** The getaways this page has announced (for the page's drawn record). */
export function drawnHeist(): { clean: string[] } {
  return { clean: cleanShown };
}

/** Fed every frame from main.ts with the server's newest events: a clean getaway queues its banner. */
export function watchHeistEvents(latest: { tick: number; events: readonly SimEvent[] }): void {
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) {
    if (ev.type !== 'clean-getaway') continue;
    queueBanner({ key: `heist:${ev.heist}:${ev.thing}:${ev.tick}`, text: CLEAN, frames: CLEAN_FRAMES, color: '#b8f2c0' });
    cleanShown = [...cleanShown, ev.thing].slice(-8);
  }
}

/** With the room's things: a taken prize's stand, still in its place, shows its `taken` look. */
export function drawPrizeStands(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const room = content.rooms[roomId];
  if (!room || !content.heists) return;
  for (const e of world.entities) {
    if (e.room !== roomId || !e.c.thing || e.c.thing.takenBy === null) continue;
    const taken = prizeOf(content, e.id)?.prize.taken;
    if (!taken) continue;
    drawLook(g, content, taken, ox + Math.round(e.x + room.tile / 2), oy + Math.round(e.y + room.tile), { anchor: 'bottom-centre' });
  }
}
