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
// DRAFT (Step 22 push 5 part 2): the road's caller. The bot waits by the door
// (column 10 or less) until `road-lookout` has just turned east, then climbs
// the first ledge, the step (row 13) and the high walk (row 11) over him.
let roadPhase: 'approach' | 'climb' | 'done' = 'approach';
let lookFacing = 0;
let lookTurnedEast = -999;
let forceJump = false;
let depotPhase: 'wait' | 'go' = 'wait';
let depotFacing = 0;
let depotTurnedEast = -999;
// DRAFT (Step 22 push 5 part 2): one-way stairs the walking bot climbs. Each
// stair: standing on ground with feet at row `feet` (and the middle between
// columns `from` and `to`), steer to column `at`, jump, and steer in the air
// to column `air`, which lands it on the next stair up.
type Stair = { feet: number; from: number; to: number; at: number; air: number };
const STAIRS: Record<string, Stair[]> = {
  'quarry-road': [
    { feet: 15, from: 11, to: 17, at: 13.5, air: 13.8 },
    { feet: 13, from: 12, to: 15.5, at: 14, air: 16.5 },
  ],
  'quarry-ridge': [
    { feet: 7, from: 38, to: 45, at: 42, air: 42 },
    { feet: 5, from: 40, to: 44, at: 42.5, air: 46 },
  ],
  'quarry-depot': [
    { feet: 14, from: 1.5, to: 5, at: 3.6, air: 3.7 },
    { feet: 12, from: 2.5, to: 5, at: 4, air: 5.6 },
    { feet: 10, from: 4.5, to: 7, at: 5.6, air: 8.5 },
  ],
};
let airTo: number | null = null;
function climb(stairs: Stair[], cx: number, feetY: number, x: number): number {
  if (!me.onGround) {
    if (airTo === null) return x;
    return Math.abs(cx - airTo) > 0.15 ? Math.sign(airTo - cx) : 0;
  }
  airTo = null;
  for (const st of stairs) {
    if (Math.abs(feetY - st.feet * 16) >= 1 || cx < st.from || cx > st.to) continue;
    if (Math.abs(cx - st.at) > 0.45) return Math.sign(st.at - cx);
    forceJump = true;
    airTo = st.air;
    return 0;
  }
  return x;
}

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
  // DRAFT (Step 22 push 5 part 2): the road's caller, in both modes: wait by
  // the door until he has just turned east.
  if (me.room === 'quarry-road' && roadPhase !== 'done') {
    const look = world.entities.find((e: any) => e.id === 'road-lookout');
    if (look) {
      if (look.facing > 0 && lookFacing <= 0) lookTurnedEast = t;
      lookFacing = look.facing;
    }
    const cx = (me.x + box.w / 2) / T;
    if (!look || look.c?.flattened || feetY <= 11 * T + 1 || cx > 17) roadPhase = 'done';
    else if (roadPhase === 'approach') {
      if (cx >= 9.5) x = 0;
      if (cx >= 9 && look.facing > 0 && t - lookTurnedEast < 90) roadPhase = 'climb';
    }
    if (roadPhase === 'climb') x = climb(STAIRS['quarry-road']!, cx, feetY, x);
  }
  // DRAFT (Step 22 push 5 part 2): the ridge's caller. Walking, the bot goes
  // over him: from the flat (row 7) up the step (row 5, columns 41-43) onto
  // the high walk (row 3) and the shelf, and through the tower-top opening.
  if (me.room === 'quarry-ridge' && mode !== 'fights') x = climb(STAIRS['quarry-ridge']!, (me.x + box.w / 2) / T, feetY, x);
  // DRAFT (Step 22 push 5 part 2): the depot's lookout. Walking, the bot waits
  // just inside the tower door, where nobody sees it, until he has just
  // turned east, then climbs the steps by the door (rows 12 and 10) onto the
  // high ledge over him (row 8, step16-zero-alarm-ledge's way).
  if (me.room === 'quarry-depot' && mode !== 'fights') {
    const look = world.entities.find((e: any) => e.id === 'depot-lookout');
    const cx = (me.x + box.w / 2) / T;
    if (look) {
      if (look.facing > 0 && depotFacing <= 0) depotTurnedEast = t;
      depotFacing = look.facing;
    }
    if (depotPhase === 'wait') {
      if (!look || look.c?.flattened || cx > 5) depotPhase = 'go';
      else if (cx >= 2) {
        if (look.facing > 0 && t - depotTurnedEast < 20) depotPhase = 'go';
        else x = 0;
      }
    } else x = climb(STAIRS['quarry-depot']!, cx, feetY, x);
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
    let want = forceJump;
    forceJump = false;
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
    // DRAFT (Step 22 push 5 part 2): walking along the tower's top floor (in by the shelf), it hops the two fighters there.
    const towerTop = mode !== 'fights' && me.room === 'quarry-tower' && feetY <= 5 * T + 1;
    if ((process.env.HOP === '1' || towerTop) && dir !== 0) {
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
    if (process.env.TRACE && ['heart-lost', 'outpost-call-started', 'hero-out', 'changed-room', 'stage-restarted'].includes(e.type)) console.error(`trace t ${t} ${e.type} ${JSON.stringify(e).slice(0, 120)} at ${me.room} x ${(me.x / 16).toFixed(1)} y ${(me.y / 16).toFixed(1)}`);
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
