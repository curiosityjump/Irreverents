// The fact that what goes wrong in a page reaches the server, called from
// scripts/e2e.ts after its "(errors) no page raised an error" fact, because
// this one raises errors on purpose (Step 5).
/* eslint-disable @typescript-eslint/no-explicit-any */
type Fact = (id: string, ok: boolean, text: string) => void;

const ALLOWED = ['at', 'kind', 'message', 'stack', 'build', 'screen', 'upright', 'ua'];

export async function errorFacts(run: { browser: any; base: string; tag: string; fact: Fact }): Promise<void> {
  const { browser, base, tag, fact } = run;
  const mark = `scripted-check-${Math.random().toString(36).slice(2, 10)}`;
  const room = `${tag}-errors-${mark}`;
  const size = { width: 667, height: 375 };
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  try {
    const page = await ctx.newPage();
    await page.goto(`${base}/?room=${room}`);
    await page.waitForFunction(() => (window as any).irreverents?.drawn.me, null, { timeout: 10000 });
    const built = (await page.evaluate(() => (window as any).irreverents.builtFrom)) as string;
    const player = (await page.evaluate(() => (window as any).irreverents.player)) as string;
    // An uncaught error, a promise nobody caught, and an image that is not there.
    await page.evaluate((m: string) => {
      setTimeout(() => {
        throw new Error(`${m} thrown on purpose`);
      }, 0);
      void Promise.reject(new Error(`${m} rejected on purpose`));
      const img = document.createElement('img');
      img.style.display = 'none';
      img.src = `assets/${m}-missing.png`;
      document.body.append(img);
    }, mark);
    let mine: any[] = [];
    let health: any = null;
    for (let i = 0; i < 40 && mine.length < 3; i++) {
      await new Promise((r) => setTimeout(r, 250));
      const got = (await (await fetch(`${base}/debug/errors`)).json()) as any;
      mine = got.errors.filter((e: any) => String(e.message).includes(mark));
    }
    health = await (await fetch(`${base}/healthz`)).json();
    const kinds = mine.map((e) => e.kind).sort().join(', ');
    const thrown = mine.find((e) => e.kind === 'error');
    const extra = [...new Set(mine.flatMap((e) => Object.keys(e)))].filter((k) => !ALLOWED.includes(k));
    const all = JSON.stringify(mine);
    const leaks = [all.includes(player) ? 'the player id' : '', all.includes(room) ? 'the room' : ''].filter(Boolean);
    const ok =
      kinds === 'error, load, rejection' &&
      !!thrown && thrown.build === built && thrown.screen.w === size.width && thrown.screen.h === size.height && thrown.screen.dpr === 2 &&
      thrown.upright === false && String(thrown.ua).length > 10 && String(thrown.stack).includes('Error') && !Number.isNaN(Date.parse(thrown.at)) &&
      extra.length === 0 && leaks.length === 0 && typeof health.errors === 'number' && health.errors >= 3 && health.ok === true;
    fact('errors-reach-us', ok,
      `a page threw an error, dropped a rejection and asked for a missing image on purpose: GET /debug/errors then listed ${mine.length} of the 3 (${kinds || 'none'})${thrown ? `, the thrown one with build "${thrown.build}" (the page's: "${built}"), screen ${thrown.screen.w}x${thrown.screen.h} @${thrown.screen.dpr}x, upright ${thrown.upright}, a user-agent and a stack` : ''}; fields beyond the allowed ones: ${extra.join(', ') || 'none'}; personal data found in them: ${leaks.join(', ') || 'none'}; /healthz counts ${health.errors} report(s)`);
  } finally {
    await ctx.close();
  }
}
