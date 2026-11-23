// The switch gap inside `npm run e2e` (one call line in scripts/e2e.ts):
// three phone-sized pages in one world hold all three party members; a tap
// of Switch on one of them changes nothing and says so (`switch-refused`,
// reason none-free, from the page's own step: window.irreverents.switchRefused),
// and the other two pages still draw it as it was. The headless twin is the
// scenario step2-body-switch-two-players; the server's half is
// scripts/checks/switch-taken.ts (docs/mechanisms/party-and-switching.md).
// DRAFT: the waits are first passes with room to spare.
import { me, phone, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const refused = (ph: Phone): Promise<{ count: number; reason: string }> => ph.page.evaluate(() => (window as any).irreverents.switchRefused);
const drawnKind = (ph: Phone, player: string): Promise<string | undefined> => ph.page.evaluate((p: string) => (window as any).irreverents.drawn.entities.find((d: any) => d.player === p)?.kind, player);

export async function switchFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-switch-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, url, 'switch A');
  const B = await phone(kit, url, 'switch B');
  const C = await phone(kit, url, 'switch C');
  try {
    // Every page has heard a snapshot with the other two in it.
    await sleep(800);
    const before = (await me(A)).kind as string;
    const kinds = [before, (await me(B)).kind as string, (await me(C)).kind as string];
    const r0 = await refused(A);
    const tapped = await tap(A, 'switch');
    await sleep(700);
    const after = (await me(A)).kind as string;
    const r1 = await refused(A);
    const onB = await drawnKind(B, A.id);
    const onC = await drawnKind(C, A.id);
    const full = new Set(kinds).size === 3;
    fact('switch-refused', full && tapped && after === before && r1.count > r0.count && r1.reason === 'none-free' && onB === before && onC === before,
      `three pages hold ${kinds.join(', ')} (${full ? 'every member taken' : 'NOT all three'}); A taps Switch (${tapped ? 'tapped' : 'NOT on the page'}): A is ${after === before ? 'still' : 'now'} the ${after}, its page said switch-refused ${r1.count - r0.count} time(s) (reason "${r1.reason}", want none-free), and B's and C's pages draw A as the ${onB} and the ${onC}`);
  } finally {
    await Promise.all([A.ctx.close(), B.ctx.close(), C.ctx.close()]);
  }
}
