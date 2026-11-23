// The fact that a friend whose page went away looks away, called from
// scripts/e2e.ts (Step 5). Two pages in a private world of their own.
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Page = any;
type Fact = (id: string, ok: boolean, text: string) => void;

const online = (page: Page): Promise<unknown> =>
  page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
/** How the watching page draws `player`: 'away', 'here' or 'gone'. */
const sees = (page: Page, player: string): Promise<string> =>
  page.evaluate((p: string) => {
    const e = (window as any).irreverents.drawn.entities.find((d: any) => d.player === p);
    return !e ? 'gone' : e.away ? 'away' : 'here';
  }, player);
async function until(page: Page, player: string, want: string, ms: number): Promise<number | null> {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if ((await sees(page, player)) === want) return Date.now() - t0;
    await new Promise((r) => setTimeout(r, 50));
  }
  return null;
}

/** `wholeWait`: also wait out staleSeconds and see the character removed (local runs; about 16 s). */
export async function awayFacts(run: { browser: any; base: string; out: string; tag: string; fact: Fact; errors: string[]; wholeWait: boolean }): Promise<void> {
  const { browser, base, out, tag, fact, errors, wholeWait } = run;
  const url = `${base}/?room=${tag}-away-${Math.random().toString(36).slice(2, 10)}`;
  const ctxA = await browser.newContext({ viewport: { width: 640, height: 360 } });
  const ctxB = await browser.newContext({ viewport: { width: 640, height: 360 } });
  try {
    const A = await ctxA.newPage();
    const B = await ctxB.newPage();
    A.on('pageerror', (e: Error) => errors.push(`away A: ${e.message}`));
    B.on('pageerror', (e: Error) => errors.push(`away B: ${e.message}`));
    // B's socket goes through this script, so it can be cut the way a phone
    // that sleeps or loses its network cuts it: no goodbye, and no way back
    // until the script allows it.
    let blocked = false;
    const routes: any[] = [];
    await B.routeWebSocket(/\/ws$/, (ws: any) => {
      if (blocked) return void ws.close();
      const upstream = ws.connectToServer();
      ws.onMessage((m: string) => { try { upstream.send(m); } catch { /* closed */ } });
      upstream.onMessage((m: string) => { try { ws.send(m); } catch { /* closed */ } });
      routes.push({ ws, upstream });
    });
    const cut = (): void => {
      blocked = true;
      for (const r of routes.splice(0)) {
        try { r.upstream.close(); } catch { /* closed */ }
        try { r.ws.close(); } catch { /* closed */ }
      }
    };
    await Promise.all([A.goto(url), B.goto(url)]);
    await Promise.all([online(A), online(B)]);
    const idB = (await B.evaluate(() => (window as any).irreverents.player)) as string;
    const staleSeconds = (await A.evaluate(() => (window as any).irreverents.content.net.staleSeconds)) as number;
    const first = await until(A, idB, 'here', 5000);

    cut();
    const awayAfter = await until(A, idB, 'away', 2000);
    await A.screenshot({ path: path.join(out, `${tag === 'check' ? 'live-' : ''}away.png`) });

    blocked = false;
    const backAfter = await until(A, idB, 'here', 10000);

    let goneAfter: number | null = null;
    if (wholeWait) {
      cut();
      await until(A, idB, 'away', 2000);
      goneAfter = await until(A, idB, 'gone', staleSeconds * 1000 + 4000);
    }
    const ms = (v: number | null): string => (v === null ? 'never' : `after ${v} ms`);
    fact('away', first !== null && awayAfter !== null && backAfter !== null && (!wholeWait || (goneAfter !== null && goneAfter >= staleSeconds * 1000 - 2500)),
      `one player's connection was cut with no goodbye: the other page drew their character as away ${ms(awayAfter)} (limit 2000); let back in, it was drawn as here again ${ms(backAfter)}${wholeWait ? `; cut for good, it was removed ${ms(goneAfter)} (staleSeconds is ${staleSeconds})` : ''}`);
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
}
