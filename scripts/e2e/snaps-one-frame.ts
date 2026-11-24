// Brief page-misses-what-happened, push 1 (docs/mechanisms/network.md, "Two
// snapshots in one frame"): called from scripts/e2e.ts. A phone-sized page
// whose socket is wrapped in the page (an init script around `onmessage`), so
// two snapshots can be handed to the page in one task, with no frame between
// them: the case measured 1 run in 20 of `hearts-game-over`, where the socket
// heard `game-over-coming` and no frame drew the card.
//
// When armed, the wrapper adds events to the next real snapshot (their tick
// set to that snapshot's), holds it, and hands it over just before the
// snapshot after it, in the same task. So the events always ride the first of
// two snapshots in one frame. Read back from what the page drew: the GAME OVER
// card (`drawn.gameOver`), the clean-getaway banner's record (`drawn.heist`),
// and the sounds the page played (`irreverents.sound.log`).
// Then exactly once: the held snapshot handed over twice (a resent copy) adds
// its events once; and after the socket is cut and the page comes back by
// itself, a new pair is drawn once and nothing before it again.
//
// Control: the pre-change src/net/client.ts (git stash, npm run build): the
// card, the banner and the sounds are never drawn, so `snaps-one-frame` fails.
// DRAFT: the waits are first passes with room to spare.
import type { Kit } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Runs in the page before its own script: wraps every socket's `onmessage`. */
function wrapSockets(): void {
  const proto = WebSocket.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'onmessage')!;
  const ctl: any = { armed: [] as any[], twice: false, held: null as string | null, paired: 0, socks: [] as WebSocket[] };
  (window as any).__pair = ctl;
  Object.defineProperty(proto, 'onmessage', {
    configurable: true,
    get() {
      return desc.get!.call(this);
    },
    set(fn: (e: { data: unknown }) => void) {
      ctl.socks.push(this);
      desc.set!.call(this, (e: MessageEvent) => {
        const text = String(e.data);
        const snap = text.startsWith('{"t":"snap"');
        if (snap && ctl.held !== null) {
          const held = ctl.held;
          ctl.held = null;
          fn({ data: held });
          if (ctl.twice) fn({ data: held });
          fn(e);
          ctl.paired++;
          return;
        }
        if (snap && ctl.armed.length > 0) {
          const m = JSON.parse(text);
          m.ev = [...(m.ev ?? []), ...ctl.armed.map((ev: any) => ({ ...ev, tick: m.w.tick }))];
          ctl.armed = [];
          ctl.held = JSON.stringify(m);
          return;
        }
        fn(e);
      });
    },
  });
}

/** What the page drew of the three: GAME OVER cards shown, clean getaways announced, sounds played by moment. */
const seen = (page: any): Promise<{ card: number; clean: string[]; sounds: string[]; paired: number; connects: number; status: string; soundState: string }> =>
  page.evaluate(() => {
    const irr = (window as any).irreverents;
    return {
      card: irr.drawn.gameOver?.shown ?? irr.e2eCards ?? 0,
      clean: irr.drawn.heist?.clean ?? [],
      sounds: (irr.sound?.log ?? []).map((l: any) => l.moment),
      paired: (window as any).__pair.paired,
      connects: irr.net.connects,
      status: irr.drawn.status,
      soundState: irr.sound?.state ?? '?',
    };
  });

export async function snapsOneFrameFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-snaps-${Math.random().toString(36).slice(2, 10)}`;
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  await ctx.addInitScript(wrapSockets);
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`snaps: ${e.message}`));
  try {
    await page.goto(url);
    await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
    // A touch on the picture starts sound (src/client/audio/index.ts), as a player's first touch does.
    await page.touchscreen.tap(422, 60);
    // The card's count while it is down: the page records it only while one is up, so keep the last seen.
    await page.evaluate(() => {
      const irr = (window as any).irreverents;
      irr.e2eCards = 0;
      const tick = (): void => {
        if (irr.drawn.gameOver) irr.e2eCards = irr.drawn.gameOver.shown;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await sleep(500);
    const arm = (events: any[], twice: boolean): Promise<void> =>
      page.evaluate(([ev, tw]: [any[], boolean]) => {
        const ctl = (window as any).__pair;
        ctl.twice = tw;
        ctl.armed = ev;
      }, [events, twice] as [any[], boolean]);
    const paired = async (n: number): Promise<boolean> =>
      page.waitForFunction((k: number) => (window as any).__pair.paired >= k, n, { timeout: 3000 }).then(() => true, () => false);
    const count = (xs: string[], x: string): number => xs.filter((y) => y === x).length;

    const s0 = await seen(page);
    // 1. Two snapshots in one frame: the first carries GAME OVER and a clean getaway.
    await arm([{ type: 'game-over-coming', room: 'cantina' }, { type: 'clean-getaway', heist: 'e2e', thing: 'e2e-prize-1', player: null }], false);
    const p1 = await paired(s0.paired + 1);
    await sleep(600);
    const s1 = await seen(page);
    const sounds1 = s1.sounds.slice(s0.sounds.length);
    const first = p1 && s1.card === s0.card + 1 && count(s1.clean, 'e2e-prize-1') === 1;
    const heard = count(sounds1, 'game-over') === 1 && count(sounds1, 'clean-getaway') === 1;
    // 2. A resent copy: the held snapshot handed over twice, then the next; its getaway is announced once.
    await arm([{ type: 'clean-getaway', heist: 'e2e', thing: 'e2e-prize-2', player: null }], true);
    const p2 = await paired(s1.paired + 1);
    await sleep(600);
    const s2 = await seen(page);
    // (Banners, not sounds: a sound effect's own gap, content/sounds/, holds back a second jingle this soon.)
    const once = p2 && count(s2.clean, 'e2e-prize-2') === 1;
    // 3. The socket cut; the page comes back by itself; a new pair is drawn once, and nothing before it again.
    await page.evaluate(() => {
      const ctl = (window as any).__pair;
      ctl.twice = false;
      ctl.socks[ctl.socks.length - 1].close();
    });
    const back = await page
      .waitForFunction((n: number) => (window as any).irreverents.net.connects > n && (window as any).irreverents.drawn.status === 'online', s2.connects, { timeout: 10000 })
      .then(() => true, () => false);
    await sleep(300);
    const s3a = await seen(page);
    await arm([{ type: 'clean-getaway', heist: 'e2e', thing: 'e2e-prize-3', player: null }], false);
    const p3 = await paired(s3a.paired + 1);
    await sleep(600);
    const s3 = await seen(page);
    const after = back && p3 && count(s3.clean, 'e2e-prize-3') === 1 && count(s3.clean, 'e2e-prize-1') === 1 && count(s3.clean, 'e2e-prize-2') === 1 && s3.card === s1.card;
    fact(
      'snaps-one-frame',
      first && heard && once && after,
      `a phone page handed two snapshots in one task (no frame between), the first carrying GAME OVER and a clean getaway: cards drawn ${s0.card} -> ${s1.card}, getaway banners ${JSON.stringify(s1.clean)}, sounds played ${JSON.stringify(sounds1)} (sound ${s1.soundState}); a resent copy of the first: banners ${JSON.stringify(s2.clean)}; the socket cut, back by itself (${back}, connects ${s2.connects} -> ${s3.connects}), a new pair: banners ${JSON.stringify(s3.clean)}, cards ${s3.card}; pairs handed over ${s3.paired} (${p1}, ${p2}, ${p3})`,
    );
  } finally {
    await ctx.close();
  }
}
