// Step 13's facts inside `npm run e2e` (one call line in scripts/e2e.ts): a
// phone-sized page, by touch only, walks from the start room through the
// courtyard into the Bandit Camp; on entering, the page's own record of
// what it drew (`drawn.recruits`) lists the captive's cage, shut, and the
// captive's call (over the cage or at the screen's edge), and the party
// plate (`drawn.hud`) lists the party's faces. The timed hold is left to the
// scenarios and scripts/checks/step13-roster.ts (deterministic touches only).
// docs/mechanisms/recruits.md.
import path from 'node:path';
import { phone, standAt } from '../lib/e2e-touch.ts';
import type { Kit } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function rescueFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-rescue-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'rescue');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const door = await ph.page.evaluate(() => {
      const c = (window as any).irreverents.content;
      const d = c.rooms.courtyard.doors.find((x: any) => x.id === 'to-outpost');
      const w = c.characters[(window as any).irreverents.drawn.me.kind].box.w;
      return { x: d.tx * c.rooms.courtyard.tile + (c.rooms.courtyard.tile - w) / 2 - 4, rec: c.recruits['camp-captive'] };
    });
    if (toCourtyard) await standAt(ph, door.x, 1);
    await pushUp(ph);
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    // The call comes every callEvery seconds; wait one round and a bit for it, recording every frame.
    let seen: { cage: any; call: any; faces: any } = { cage: null, call: null, faces: null };
    if (inside) {
      try {
        const h = await ph.page.waitForFunction(
          () => {
            const d = (window as any).irreverents.drawn;
            const cage = (d.recruits?.cages ?? []).find((c: any) => c.id === 'camp-captive');
            const call = (d.recruits?.calls ?? []).find((c: any) => c.id === 'camp-captive');
            return cage && call ? { cage, call, faces: d.hud?.faces ?? null } : false;
          },
          null,
          { polling: 'raf', timeout: (door.rec?.callEvery ?? 6) * 1000 + 3000 },
        );
        seen = (await h.jsonValue()) as typeof seen;
      } catch {
        seen.cage = await ph.page.evaluate(() => ((window as any).irreverents.drawn.recruits?.cages ?? [])[0] ?? null);
      }
    }
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-rescue-camp.png') });
    fact(
      'rescue-cage',
      inside && seen.cage?.open === false && seen.cage?.character === door.rec?.character && !!seen.call,
      `by touch, a phone walked into the camp (${inside}); its page drew the cage ${seen.cage ? `with the ${seen.cage.character}, ${seen.cage.open ? 'OPEN' : 'shut'}` : 'NOT AT ALL'} and the captive's call ${seen.call ? `(${seen.call.at === 'edge' ? "at the screen's edge" : 'over the cage'})` : 'NOT within one round'}`,
    );
    const faces = (seen.faces ?? []) as { kind: string }[];
    fact('rescue-plate', faces.length === 3, `the party plate lists ${faces.length} faces (${faces.map((f) => f.kind).join(', ') || 'none'}): the party, the viewer's own first`);
  } finally {
    await ph.ctx.close();
  }
}
