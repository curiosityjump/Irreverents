// node scripts/stage-bot.ts <hero> <fights|sneaks|walks> [maxTicks] [out.json]
// A measuring tool (Step 22, 3b), not a check: a simple scripted player who
// runs the Iron Quarry stage from its entrance to its end, one tick at a time,
// deciding each tick's stick and buttons from the world, and records what it
// pressed as a scenario's `inputs`. The scenario that file becomes is the
// check (the sim is deterministic, so the recorded inputs replay the run).
// DRAFT: every rule below is a first pass, tuned by watching it fail.
import fs from 'node:fs';
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent } = await import('./lib/content-files.ts');
const { TILE } = await import('../src/content/kinds/rooms.ts');
const { tileAt } = await import('../src/sim/room-state.ts');
const { step } = await import('../src/sim/step.ts');
const { createWorld, populateRoom, spawnPlayer } = await import('../src/sim/world.ts');

/* eslint-disable @typescript-eslint/no-explicit-any */
const [hero = 'grappler', mode = 'walks', maxArg, outPath] = process.argv.slice(2);
const MAX = Number(maxArg) || 9000;
const onTheMove = process.env.FIGHT_ON_THE_MOVE === '1';
const { content } = loadContent();
const ROOMS = ['quarry-road', 'quarry-ridge', 'quarry-tower', 'quarry-depot', 'quarry-pit', 'quarry-cave'];
const START = { room: 'quarry-road', spawn: 2 };
const world: any = createWorld();
const me = spawnPlayer(world, content, { player: 'a', character: hero, room: START.room, spawn: START.spawn });
for (const r of ROOMS) populateRoom(world, content, r);

type Press = { x: number; jump: boolean; attack: boolean };
const pressed: Press[] = [];
const events: any[] = [];
let jumpLeft = 0;
let jumpRest = 0;
let attackAt = -999;
let lastX = me.x;
let lastRoom = me.room;
let stuckSince = 0;

const solidAt = (room: any, tx: number, ty: number): boolean => tileAt(world, room, tx, ty) === TILE.solid;
const standable = (room: any, tx: number, ty: number): boolean => {
  const t = tileAt(world, room, tx, ty);
  return t === TILE.solid || t === TILE.oneway;
};

function bad(e: any): boolean {
  const npc = content.npcs?.[e.kind];
  return !!npc && npc.side === 'bad' && e.room === me.room && !e.c?.flattened && !e.c?.gone && !e.c?.defeated;
}

function decide(t: number): Press {
  const room = content.rooms[me.room]!;
  const T = room.tile;
  const box = content.characters[me.kind]!.box;
  const feetY = me.y + box.h;
  const feetRow = Math.floor((feetY - 1) / T);
  let x = 1;
  if (me.room === 'quarry-tower') {
    // Climb: stand under the stack of one-way floors and jump on the spot; at the top floor, walk east.
    if (feetY > 5 * T + 1) {
      const mid = me.x + box.w / 2;
      const want = 9.5 * T;
      x = Math.abs(mid - want) > 3 ? Math.sign(want - mid) : 0;
    }
  }
  let attack = false;
  if (mode === 'fights') {
    const foe = world.entities.find((e: any) => {
      if (!bad(e)) return false;
      const fb = content.characters[e.kind]!.box;
      const gap = e.x - (me.x + box.w);
      const vert = e.y < feetY && e.y + fb.h > me.y;
      return vert && gap > -fb.w && gap < 22;
    });
    if (foe) {
      // DRAFT: a hero with few hearts (FIGHT_ON_THE_MOVE) punches without stopping; the others stand and fight.
      if (!onTheMove) x = 0;
      if (t - attackAt >= 24) attackAt = t;
      attack = t - attackAt < 4;
    }
  }
  // Jumps: a wall or a gap ahead, or not getting anywhere.
  const dir = x > 0 ? 1 : x < 0 ? -1 : 0;
  let jump = false;
  if (jumpLeft > 0) {
    jumpLeft--;
    jump = true;
  } else if (jumpRest > 0) jumpRest--;
  else if (me.onGround) {
    let want = false;
    if (me.room === 'quarry-tower' && x === 0 && feetY > 5 * T + 1) want = true;
    if (dir !== 0) {
      const ahead = Math.floor((me.x + (dir > 0 ? box.w : 0) + dir * 6) / T);
      for (let ty = Math.floor(me.y / T); ty <= feetRow; ty++) if (solidAt(room, ahead, ty)) want = true;
      const next = Math.floor((me.x + (dir > 0 ? box.w : 0) + dir * 8) / T);
      // Off the end of a one-way ledge it walks off (the drop is the way down); over a gap in a floor it jumps.
      const under = tileAt(world, room, Math.floor((me.x + box.w / 2) / T), feetRow + 1);
      let depth = 1;
      while (depth <= 4 && !standable(room, next, feetRow + depth)) depth++;
      // A step down of up to three tiles is walked off; a deeper drop, or a hole, is jumped.
      if (depth > 3 && under !== TILE.oneway) want = true;
    }
    if (dir !== 0 && t - stuckSince > 40) want = true;
    // DRAFT (HOP=1): jump over a bad guy just ahead rather than walk into him.
    if (process.env.HOP === '1' && dir !== 0) {
      const hop = world.entities.some((e: any) => {
        if (!bad(e)) return false;
        const fb = content.characters[e.kind]!.box;
        const gap = dir > 0 ? e.x - (me.x + box.w) : me.x - (e.x + fb.w);
        return gap > 0 && gap < Number(process.env.HOP_AT ?? 30) && e.y < feetY && e.y + fb.h > me.y;
      });
      if (hop) want = true;
    }
    if (want) {
      jumpLeft = 17;
      jumpRest = 4;
      jump = true;
      stuckSince = t;
    }
  }
  if (me.room !== lastRoom || Math.abs(me.x - lastX) > 8) {
    lastX = me.x;
    lastRoom = me.room;
    stuckSince = t;
  }
  return { x, jump, attack };
}

let cleared: any = null;
for (let t = 0; t < MAX; t++) {
  const p = decide(t);
  pressed.push(p);
  const held = [...(p.jump ? ['jump'] : []), ...(p.attack ? ['attack'] : [])];
  const ev = step(world, { a: { x: p.x, y: 0, held } }, content);
  for (const e of ev) {
    if (['stage-cleared', 'game-over', 'heart-lost', 'hero-out', 'changed-room', 'defeated', 'outpost-call-completed', 'stage-restarted', 'signaler-broken'].includes(e.type)) events.push(e);
  }
  const c = ev.find((e: any) => e.type === 'stage-cleared' && e.player === 'a' && e.tick > 0);
  if (c) {
    cleared = c;
    break;
  }
  if (process.env.WATCH && me.room === process.env.WATCH && me.x > Number(process.env.WX0) && me.x < Number(process.env.WX1)) console.error(`t ${t} x ${me.x.toFixed(1)} y ${me.y.toFixed(1)} vx ${me.vx.toFixed(0)} vy ${me.vy.toFixed(0)} ${me.onGround ? 'G' : 'A'} p ${JSON.stringify(p)} ${JSON.stringify(Object.keys(me.c))}`);
  if (t % 500 === 0) console.error(`tick ${t} ${me.room} x ${Math.round(me.x)} y ${Math.round(me.y)} kind ${me.kind}`);
}

// Run-length spans: the stick, then each held button.
const spans: any[] = [];
const n = pressed.length;
for (let i = 0; i < n; ) {
  let j = i;
  while (j < n && pressed[j]!.x === pressed[i]!.x) j++;
  if (pressed[i]!.x !== 0) spans.push({ player: 'a', from: i, to: j, x: pressed[i]!.x });
  i = j;
}
for (const b of ['jump', 'attack'] as const) {
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
console.log(JSON.stringify({ hero, mode, ticks: n, cleared, room: me.room, kind: me.kind, events: events.filter((e) => e.type !== 'changed-room' || e.player === 'a').map((e) => `${e.tick} ${e.type} ${e.room ?? e.to ?? e.target ?? ''} ${e.left ?? ''}`) }, null, 1));
if (outPath) fs.writeFileSync(outPath, JSON.stringify(spans));
