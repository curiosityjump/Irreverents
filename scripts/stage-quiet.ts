// node scripts/stage-quiet.ts <route.json> [out.json]
// A measuring tool (Step 22 push 5), not a check, like scripts/stage-bot.ts:
// it plays the Iron Quarry stage by a list of segments (walk, hop, steer,
// idle), each run until its `until` holds, and before a segment marked
// `wait` it tries standing still for 0, 6, 12... ticks and keeps the first
// wait after which the segment runs to its end with no bad guy of the stage
// seeing the hero (the stage's own `seen`, src/sim/systems/stage-run.ts) and
// no heart lost. It writes the presses as a scenario's `inputs`; the scenario
// is the check (the sim is deterministic, so the inputs replay the run).
// DRAFT: a first pass, written to find and record the quiet way.
import fs from 'node:fs';
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent } = await import('./lib/content-files.ts');
const { TILE } = await import('../src/content/kinds/rooms.ts');
const { tileAt } = await import('../src/sim/room-state.ts');
const { step } = await import('../src/sim/step.ts');
const { createWorld, populateRoom, spawnPlayer } = await import('../src/sim/world.ts');

/* eslint-disable @typescript-eslint/no-explicit-any */
const [routePath, outPath] = process.argv.slice(2);
const route = JSON.parse(fs.readFileSync(routePath!, 'utf8'));
const { content } = loadContent();
const ROOMS = ['quarry-road', 'quarry-ridge', 'quarry-tower', 'quarry-depot', 'quarry-pit', 'quarry-cave'];
let world: any = createWorld();
spawnPlayer(world, content, { player: 'a', character: route.hero, room: 'quarry-road', spawn: 2 });
for (const r of ROOMS) populateRoom(world, content, r);
const hero = (w: any): any => w.entities.find((e: any) => e.id === 'p:a');

type Press = { x: number; jump: boolean; attack: boolean; use: boolean };
type Seg = { do: 'walk' | 'hop' | 'steer' | 'idle'; dir?: number; to?: number; until: any; wait?: number; max?: number; gaps?: boolean; jumpHold?: number; use?: boolean; note?: string; nohop?: boolean };

function untilHolds(w: any, u: any): boolean {
  const me = hero(w);
  const T = 16;
  const box = content.characters[me.kind]!.box;
  const cx = (me.x + box.w / 2) / T;
  const feet = (me.y + box.h) / T;
  if (u.room && me.room !== u.room) return false;
  if (u.xMin !== undefined && cx < u.xMin) return false;
  if (u.xMax !== undefined && cx > u.xMax) return false;
  if (u.feetMax !== undefined && feet > u.feetMax) return false;
  if (u.feetMin !== undefined && feet < u.feetMin) return false;
  if (u.ground && !me.onGround) return false;
  if (u.cleared && !(w.stages?.['iron-quarry']?.state === 'cleared')) return false;
  return true;
}

function makeCtl(seg: Seg) {
  let jumpLeft = 0;
  let rest = 0;
  let lastX = -1;
  let still = 0;
  let t = 0;
  return (w: any): Press => {
    t++;
    const me = hero(w);
    const room = content.rooms[me.room]!;
    const T = room.tile;
    const box = content.characters[me.kind]!.box;
    const dir = seg.dir ?? 1;
    let x = seg.do === 'idle' ? 0 : dir;
    let jump = false;
    const hold = seg.jumpHold ?? 17;
    if (seg.do === 'steer' && seg.to !== undefined) {
      const mid = (me.x + box.w / 2) / T;
      x = Math.abs(mid - seg.to) < 0.15 ? 0 : Math.sign(seg.to - mid);
    }
    if (jumpLeft > 0) {
      jumpLeft--;
      jump = true;
    } else if (rest > 0) rest--;
    else if (me.onGround && seg.do !== 'idle') {
      let want = seg.do === 'hop' || (seg.do === 'steer' && t < 3 && !seg.nohop);
      if (seg.do === 'walk' && x !== 0) {
        const feetRow = Math.floor((me.y + box.h - 1) / T);
        const ahead = Math.floor((me.x + (x > 0 ? box.w : 0) + x * 6) / T);
        for (let ty = Math.floor(me.y / T); ty <= feetRow; ty++) if (tileAt(w, room, ahead, ty) === TILE.solid) want = true;
        if (seg.gaps) {
          const next = Math.floor((me.x + (x > 0 ? box.w : 0) + x * 8) / T);
          let depth = 1;
          while (depth <= 4 && tileAt(w, room, next, feetRow + depth) !== TILE.solid && tileAt(w, room, next, feetRow + depth) !== TILE.oneway) depth++;
          if (depth > 3) want = true;
        }
        if (Math.abs(me.x - lastX) < 0.2) still++;
        else still = 0;
        if (still > 30) want = true;
      }
      if (want) {
        jumpLeft = hold - 1;
        rest = 4;
        jump = true;
        still = 0;
      }
    }
    lastX = me.x;
    return { x, jump, attack: false, use: !!seg.use && t < 4 };
  };
}

const pressed: Press[] = [];
const bad = (w: any): string | undefined => {
  const st = w.stages?.['iron-quarry'];
  if (st?.counts?.seen) return 'seen';
  return undefined;
};
let events: any[] = [];
function run(w: any, seg: Seg, wait: number, rec: Press[] | null): { ok: boolean; why?: string; ticks: number } {
  const ctl = makeCtl(seg);
  const max = seg.max ?? 900;
  let n = 0;
  for (let i = 0; i < wait; i++) {
    const p = { x: 0, jump: false, attack: false, use: false };
    rec?.push(p);
    const ev = step(w, { a: { x: 0, y: 0, held: [] } }, content);
    if (rec) events.push(...ev);
    if (bad(w)) return { ok: false, why: `${bad(w)} while waiting at ${i}`, ticks: i };
    if (ev.some((e: any) => e.type === 'heart-lost' || e.type === 'stage-restarted')) return { ok: false, why: 'hurt', ticks: i };
  }
  while (!untilHolds(w, seg.until)) {
    if (n++ > max) return { ok: false, why: `timeout at ${JSON.stringify(where(w))}`, ticks: n };
    const p = ctl(w);
    rec?.push(p);
    const held = [...(p.jump ? ['jump'] : []), ...(p.attack ? ['attack'] : []), ...(p.use ? ['use'] : [])];
    const ev = step(w, { a: { x: p.x, y: 0, held } }, content);
    if (rec) events.push(...ev);
    if (bad(w)) return { ok: false, why: `${bad(w)} at ${JSON.stringify(where(w))} by ${whoSees(w)}`, ticks: n };
    if (ev.some((e: any) => e.type === 'heart-lost' || e.type === 'stage-restarted')) return { ok: false, why: `hurt at ${JSON.stringify(where(w))}`, ticks: n };
  }
  return { ok: true, ticks: n };
}
function where(w: any) {
  const me = hero(w);
  return { room: me.room, x: +(me.x / 16).toFixed(2), y: +(me.y / 16).toFixed(2), g: me.onGround, t: w.tick };
}
const { canSee } = await import('../src/sim/npc/sight.ts');
function whoSees(w: any): string {
  const me = hero(w);
  return w.entities.filter((e: any) => content.npcs?.[e.kind]?.side === 'bad' && canSee(content, e, me)).map((e: any) => e.id).join(',');
}

for (const [i, seg] of (route.segments as Seg[]).entries()) {
  let found = -1;
  let last: any;
  const maxWait = seg.wait ?? 0;
  for (let wt = 0; wt <= maxWait; wt += 6) {
    const trial = structuredClone(world);
    const r = run(trial, seg, wt, null);
    last = r;
    if (r.ok) {
      found = wt;
      break;
    }
  }
  if (found < 0) {
    console.log(JSON.stringify({ failedAt: i, seg, last, at: where(world) }));
    break;
  }
  run(world, seg, found, pressed);
  console.error(`seg ${i} ${seg.note ?? seg.do} wait ${found} -> ${JSON.stringify(where(world))}`);
}
const cleared = events.find((e: any) => e.type === 'stage-cleared');
console.log(JSON.stringify({ hero: route.hero, ticks: pressed.length, cleared, at: where(world), seen: world.stages?.['iron-quarry']?.counts?.seen }));
const spans: any[] = [];
const n = pressed.length;
for (let i = 0; i < n; ) {
  let j = i;
  while (j < n && pressed[j]!.x === pressed[i]!.x) j++;
  if (pressed[i]!.x !== 0) spans.push({ player: 'a', from: i, to: j, x: pressed[i]!.x });
  i = j;
}
for (const b of ['jump', 'attack', 'use'] as const) {
  for (let i = 0; i < n; ) {
    if (!pressed[i]![b]) {
      i++;
      continue;
    }
    let j = i;
    while (j < n && pressed[j]![b]) j++;
    spans.push({ player: 'a', from: i, to: j, hold: [b] });
    i = j;
  }
}
spans.sort((p, q) => p.from - q.from);
if (outPath) fs.writeFileSync(outPath, JSON.stringify(spans));
