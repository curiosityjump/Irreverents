// Scratch: a waypoint walker that records a scenario's inputs (Step 15).
// node walkbot.ts <plan.json>  ; plan: { hero, room, spawn, power?, legs: [...], max? }
// legs: { room, toCol } walk to a column of a room (jumping walls and gaps);
//       { climb: n, col } stand under column col and jump on the spot n times (waiting to land);
//       { up: true } push up (an enter doorway); { wait: n }; { grab: true }; { attack: true }; { face: -1|1 }
import fs from 'node:fs';
const R = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const { generateRegistries } = await import(R + '/scripts/lib/registries.ts');
generateRegistries();
const { assembleContent } = await import(R + '/src/content/assemble.ts');
function loadContent(): any {
  const files: Record<string, unknown> = {};
  const walk = (d: string, rel: string) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (f.isDirectory()) walk(d + '/' + f.name, rel + f.name + '/'); else if (f.name.endsWith('.json')) files[rel + f.name] = JSON.parse(fs.readFileSync(d + '/' + f.name, 'utf8')); } };
  walk(R + '/content', '');
  const r = assembleContent(files);
  if (r.problems.length) { console.error(r.problems); process.exit(1); }
  return r;
}
const { TILE } = await import(R + '/src/content/kinds/rooms.ts');
const { tileAt } = await import(R + '/src/sim/room-state.ts');
const { step } = await import(R + '/src/sim/step.ts');
const { createWorld, spawnPlayer } = await import(R + '/src/sim/world.ts');
/* eslint-disable @typescript-eslint/no-explicit-any */
const plan = JSON.parse(fs.readFileSync(process.argv[2]!, 'utf8'));
const { content } = loadContent();
const world: any = createWorld();
Object.assign(world, plan.world ?? {});
const me: any = spawnPlayer(world, content, { player: 'a', character: plan.hero, room: plan.room, spawn: plan.spawn });
if (plan.power) me.c.power = { id: plan.power };
const { populateRoom, spawnBody } = await import(R + '/src/sim/world.ts');
if (plan.placements) populateRoom(world, content, plan.room);
for (const r of plan.placedRooms ?? []) populateRoom(world, content, r);
for (const b of plan.entities ?? []) spawnBody(world, content, b);
const box = content.characters[me.kind]!.box;
type P = { x: number; y: number; jump: boolean; grab: boolean; attack: boolean };
const pressed: P[] = [];
let leg = 0;
let sub = 0; // per-leg counter
let attackAt = -999;
let jumpLeft = 0, jumpRest = 0, stuckSince = 0, lastX = me.x, lastRoom = me.room;
const events: any[] = [];
const marks: Record<string, any> = {};
const solid = (room: any, tx: number, ty: number) => tileAt(world, room, tx, ty) === TILE.solid;
const standable = (room: any, tx: number, ty: number) => { const t = tileAt(world, room, tx, ty); return t === TILE.solid || t === TILE.oneway; };
function walkTo(t: number, target: number): P | null {
  const room = content.rooms[me.room]!;
  const T = room.tile;
  const mid = me.x + box.w / 2;
  const want = (target + 0.5) * T;
  if (Math.abs(mid - want) <= 3 && me.onGround) return null;
  const x = Math.abs(mid - want) <= 3 ? 0 : Math.sign(want - mid);
  let jump = false;
  const feetY = me.y + box.h;
  const feetRow = Math.floor((feetY - 1) / T);
  if (jumpLeft > 0) { jumpLeft--; jump = true; }
  else if (jumpRest > 0) jumpRest--;
  else if (me.onGround && x !== 0) {
    let w = false;
    const ahead = Math.floor((me.x + (x > 0 ? box.w : 0) + x * 6) / T);
    for (let ty = Math.floor(me.y / T); ty <= feetRow; ty++) if (solid(room, ahead, ty)) w = true;
    const next = Math.floor((me.x + (x > 0 ? box.w : 0) + x * 8) / T);
    let depth = 1;
    while (depth <= 4 && !standable(room, next, feetRow + depth)) depth++;
    if (depth > 3 && plan.jumpGaps !== false) w = true;
    if (t - stuckSince > 40) w = true;
    if (w) { jumpLeft = 17; jumpRest = 4; jump = true; stuckSince = t; }
  }
  if (me.room !== lastRoom || Math.abs(me.x - lastX) > 8) { lastX = me.x; lastRoom = me.room; stuckSince = t; }
  return { x, y: 0, jump, grab: false, attack: false };
}
const MAX = plan.max ?? 8000;
let t = 0;
for (; t < MAX && leg < plan.legs.length; t++) {
  const L = plan.legs[leg];
  let p: P | null = { x: 0, y: 0, jump: false, grab: false, attack: false };
  if (L.mark) { const T0 = content.rooms[me.room]!.tile; marks[L.mark] = { tick: t, room: me.room, tile: [Math.floor((me.x + box.w / 2) / T0), Math.floor((me.y + box.h) / T0)], ground: me.onGround, power: me.c.power ?? null }; leg++; t--; continue; }
  if (L.toCol !== undefined) {
    if (L.room && me.room !== L.room) p = walkTo(t, L.toCol + (L.dir ?? 1) * 1000);
    else p = walkTo(t, L.toCol);
    if (!p) { leg++; sub = 0; p = { x: 0, y: 0, jump: false, grab: false, attack: false }; }
  } else if (L.climb !== undefined) {
    // jump on the spot: hold jump 18 ticks, then wait until on the ground again
    const k = sub++;
    const phase = L._phase ?? 0;
    if (phase === 0) { p.jump = true; if (k >= 17) { L._phase = 1; } }
    else if (me.onGround && me.vy === 0) { L._n = (L._n ?? 0) + 1; L._phase = 0; sub = 0; if (L._n >= L.climb) { leg++; sub = 0; } }
    if (L.x) p.x = L.x;
  } else if (L.up) { p.y = -1; if (++sub >= 4) { leg++; sub = 0; } }
  else if (L.wait !== undefined) { if (++sub >= L.wait) { leg++; sub = 0; } }
  else if (L.grab) { p.grab = true; if (++sub >= 3) { leg++; sub = 0; } }
  else if (L.attack) { p.attack = true; if (++sub >= 3) { leg++; sub = 0; } }
  else if (L.face !== undefined) { p.x = L.face; if (++sub >= 2) { leg++; sub = 0; } }
  else if (L.hold) { p.x = L.hold; if (L.jump && sub < 18) p.jump = true; if (++sub >= L.n) { leg++; sub = 0; } }
  // plan.fight (push 3): punch a bad guy just ahead every 24 ticks without stopping (stage-bot's FIGHT_ON_THE_MOVE rule);
  // standing (a wait leg), turn to one just behind first.
  if ((L.fight ?? plan.fight) && (L.toCol !== undefined || L.wait !== undefined) && p) {
    const feetY = me.y + box.h;
    const near = (dir: number) => world.entities.find((e: any) => {
      const npc = content.npcs?.[e.kind];
      if (!npc || npc.side !== 'bad' || e.room !== me.room || e.c?.flattened || e.c?.gone || e.c?.defeated) return false;
      const fb = content.characters[e.kind]!.box;
      const gap = dir > 0 ? e.x - (me.x + box.w) : me.x - (e.x + fb.w);
      return e.y < feetY && e.y + fb.h > me.y && gap > -fb.w && gap < 22;
    });
    const ahead = p.x || me.facing || 1;
    let foe = near(ahead);
    if (!foe && L.wait !== undefined && near(-ahead)) { p.x = -ahead; foe = null; }
    if (foe) { if (t - attackAt >= 24) attackAt = t; p.attack = t - attackAt < 4; }
  }
  pressed.push(p);
  const held = [...(p.jump ? ['jump'] : []), ...(p.grab ? ['grab'] : []), ...(p.attack ? ['attack'] : [])];
  const ev = step(world, { a: { x: p.x, y: p.y, held } }, content);
  for (const e of ev) if (!['landed', 'jumped', 'flapped'].includes(e.type)) events.push(`${e.tick} ${e.type} ${JSON.stringify(e).slice(0, 160)}`);
}
const spans: any[] = [];
const n = pressed.length;
for (const axis of ['x', 'y'] as const) for (let i = 0; i < n; ) {
  let j = i; while (j < n && pressed[j]![axis] === pressed[i]![axis]) j++;
  if (pressed[i]![axis] !== 0) spans.push({ player: 'a', from: i, to: j, [axis]: pressed[i]![axis] });
  i = j;
}
for (const b of ['jump', 'grab', 'attack'] as const) for (let i = 0; i < n; ) {
  if (!pressed[i]![b]) { i++; continue; }
  let j = i; while (j < n && pressed[j]![b]) j++;
  spans.push({ player: 'a', from: i, to: j, hold: [b] }); i = j;
}
spans.sort((p, q) => p.from - q.from);
const T = content.rooms[me.room]!.tile;
console.error(`done legs ${leg}/${plan.legs.length} at tick ${t}: ${me.room} feet tile [${Math.floor((me.x + box.w / 2) / T)},${Math.floor((me.y + box.h) / T)}] ground ${me.onGround}`);
if (process.env.EV) console.error(events.join('\n'));
fs.writeFileSync(plan.out ?? '/dev/stdout', JSON.stringify({ ticks: t, inputs: spans, marks, end: { room: me.room, tile: [Math.floor((me.x + box.w / 2) / T), Math.floor((me.y + box.h) / T)], ground: me.onGround } }));
