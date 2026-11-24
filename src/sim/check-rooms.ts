import { playableCharacters, TILE } from '../content/kinds/rooms.ts';
import type { Room } from '../content/kinds/rooms.ts';
import type { CharacterKind } from '../content/kinds/characters.ts';
import type { Content, Problem } from '../content/types.ts';
import { step } from './step.ts';
import type { Entity, Input, PartRule, System, World } from './types.ts';

/**
 * The room checks that need the simulation as well as the content
 * (docs/mechanisms/rooms-and-doors.md). Called from check-content.ts.
 * `systems` is a parameter so a control can pass its own.
 */
export function checkRooms(content: Content, systems: System[]): Problem[] {
  const problems: Problem[] = [];
  checkParts(content, systems, problems);
  // The way-out check plays the rooms, so it only runs on rooms that are otherwise sound.
  if (problems.length === 0) checkWaysOut(content, systems, problems);
  return problems;
}

/** Every placed part names a kind some system drives, and that system accepts how it was placed. */
function checkParts(content: Content, systems: System[], problems: Problem[]): void {
  const kinds: Record<string, PartRule> = {};
  for (const s of systems) Object.assign(kinds, s.parts);
  const names = Object.keys(kinds).sort();
  for (const room of Object.values(content.rooms)) {
    const file = `content/rooms/${room.id}.json`;
    room.parts.forEach((part, i) => {
      const where = `parts[${i}] ("${part.id}")`;
      const rule = kinds[part.kind];
      if (!rule) {
        problems.push({
          file,
          where: `${where}.kind`,
          message: `no kind of part "${part.kind}" (a kind is declared in the "parts" of the system that drives it, src/sim/systems/; kinds: ${names.join(', ') || '(none yet)'})`,
        });
        return;
      }
      rule.check?.(part, room, (message) => problems.push({ file, where, message }));
    });
  }
}

// ---------------------------------------------------------------------------
// "There is always a way out" (CLAUDE.md, design principles), checked.
//
// DRAFT: the model, and its limits, are written up in
// docs/mechanisms/rooms-and-doors.md ("The way-out check"). In short:
//
// - WHERE A BODY COULD BE is over-estimated: every tile a body could stand
//   on that is joined to a spawn or a door through open tiles, whether or
//   not anyone could walk there. Being thrown somewhere is the game working
//   (docs/plan/step-3.md), so "nobody can reach that pit" is not a defence.
// - WHAT A BODY CAN DO FROM THERE is under-estimated: only a fixed list of
//   simple moves, each *played through the real step()* from standing
//   still, with the character's own verbs and tuning. Nothing about jump
//   heights is assumed or hard-coded: retune a character or add a verb and
//   the answer follows. A way out is therefore never claimed falsely (up to
//   the snapping below); a real way out that needs a cleverer move than
//   the list has is reported as missing, which errs on the safe side.
// - It runs for every character a player can be (the party's members): a
//   pit only the flyer leaves still traps the others.
// ---------------------------------------------------------------------------

const PLAYER = 'way-out-check';
/** Ticks the stick is held sideways in a move. */
const HOLDS = [8, 14, 22, 34, 50, 80];
/** How a move uses the jump action: not at all, held from the start, held after a short run-up, or tapped again and again (a body that can flap). */
const JUMPS = ['none', 'start', 'run-up', 'taps'] as const;
const SETTLE_TICKS = 300;
const TAPS_END = 130;
/** The tick from which a move asks for nothing more, so the body may be judged at rest. */
function inputsEnd(move: Move): number {
  return Math.max(move.hold, move.jump === 'start' ? 40 : move.jump === 'run-up' ? 50 : move.jump === 'taps' ? TAPS_END : 0, 1);
}

interface Move {
  dir: -1 | 0 | 1;
  hold: number;
  jump: (typeof JUMPS)[number];
  up: boolean;
}

const MOVES: Move[] = [
  { dir: 0, hold: 0, jump: 'start', up: false },
  { dir: 0, hold: 0, jump: 'taps', up: false },
  // A fresh push of the stick up: how a doorway is used.
  { dir: 0, hold: 0, jump: 'none', up: true },
];
for (const dir of [-1, 1] as const) for (const hold of HOLDS) for (const jump of JUMPS) MOVES.push({ dir, hold, jump, up: false });

function inputFor(move: Move, t: number): Input {
  const jumping =
    move.jump === 'start' ? t < 40 : move.jump === 'run-up' ? t >= 10 && t < 50 : move.jump === 'taps' ? t < TAPS_END && t % 16 < 10 : false;
  return { x: t < move.hold ? move.dir : 0, y: move.up && t === 0 ? -1 : 0, held: jumping ? ['jump'] : [] };
}

/**
 * A place a body can stand: room, the tile its feet are in, and whether it
 * is centred on that column (half 0) or on the line between it and the
 * next column (half 1; only tried for bodies wider than a tile, which fit
 * a two-tile gap that way and no other).
 */
interface Node {
  room: string;
  tx: number;
  ty: number;
  half: 0 | 1;
  /** Nodes one move away (indexes into the node list). */
  next: Set<number>;
  /** Whether some move from here goes through a door. */
  door: boolean;
}

function cellOf(room: Room, tx: number, ty: number): number {
  return tx < 0 || ty < 0 || tx >= room.w || ty >= room.h ? TILE.solid : room.cells[ty * room.w + tx]!;
}

function standX(room: Room, kind: CharacterKind, tx: number, half: 0 | 1): number {
  return tx * room.tile + (room.tile - kind.box.w) / 2 + (half * room.tile) / 2;
}

function standsAt(room: Room, kind: CharacterKind, tx: number, ty: number, half: 0 | 1): boolean {
  const T = room.tile;
  const x = standX(room, kind, tx, half);
  const y = (ty + 1) * T - kind.box.h;
  const left = Math.floor(x / T);
  const right = Math.floor((x + kind.box.w - 1e-6) / T);
  const top = Math.floor(y / T);
  let floor = false;
  for (let cx = left; cx <= right; cx++) {
    for (let cy = top; cy <= ty; cy++) if (cellOf(room, cx, cy) === TILE.solid) return false;
    if (cellOf(room, cx, ty + 1) !== TILE.empty) floor = true;
  }
  return floor;
}

/** Tiles joined to a spawn or a door through tiles that are not solid. */
function openTiles(room: Room): Set<number> {
  const seen = new Set<number>();
  const queue: number[] = [];
  const add = (tx: number, ty: number): void => {
    if (cellOf(room, tx, ty) === TILE.solid) return;
    const i = ty * room.w + tx;
    if (!seen.has(i)) {
      seen.add(i);
      queue.push(i);
    }
  };
  for (const s of room.spawns) add(s.tx, s.ty);
  for (const d of room.doors) for (let ty = d.ty; ty < d.ty + d.h; ty++) for (let tx = d.tx; tx < d.tx + d.w; tx++) add(tx, ty);
  while (queue.length) {
    const i = queue.pop()!;
    const tx = i % room.w;
    const ty = (i - tx) / room.w;
    add(tx - 1, ty);
    add(tx + 1, ty);
    add(tx, ty - 1);
    add(tx, ty + 1);
  }
  return seen;
}

/**
 * The tiles of every part whose kind says it can block, by room id (cell
 * indexes). INTENT: read pessimistically. They are solid for the whole
 * check, whatever the part's own system would do with one body alone.
 */
function blockedTiles(content: Content, systems: System[]): Map<string, Set<number>> {
  const kinds: Record<string, PartRule> = {};
  for (const s of systems) Object.assign(kinds, s.parts);
  const out = new Map<string, Set<number>>();
  for (const room of Object.values(content.rooms)) {
    const cells = new Set<number>();
    for (const part of room.parts) if (kinds[part.kind]?.blocks) for (const t of part.tiles) cells.add(t.ty * room.w + t.tx);
    out.set(room.id, cells);
  }
  return out;
}

function checkWaysOut(content: Content, systems: System[], problems: Problem[]): void {
  const blocked = blockedTiles(content, systems);
  // The rooms as the check sees them: blocking parts' tiles are walls.
  const walled = (room: Room): Room => {
    const cells = blocked.get(room.id);
    if (!cells || cells.size === 0) return room;
    return { ...room, cells: room.cells.map((c, i) => (cells.has(i) ? TILE.solid : c)) };
  };
  /** Keeps blocking parts solid in the played world too, every tick, over whatever their system wrote. */
  const wall = (world: World): void => {
    for (const [roomId, cells] of blocked) {
      if (cells.size === 0) continue;
      const tiles = ((world.rooms ??= {})[roomId] ??= { tiles: {}, parts: {} }).tiles;
      for (const i of cells) tiles[i] = TILE.solid;
    }
  };
  // INTENT: a room with no doors is a standalone room (a test room such as
  // graybox-hall, or another step's scratch room) and is exempt, never by name.
  const rooms = Object.values(content.rooms).filter((r) => r.doors.length > 0);
  if (rooms.length === 0) return;
  const startId = content.game.mapStart ?? content.game.startRoom;
  const start = content.rooms[startId];
  if (!start || start.doors.length === 0) {
    problems.push({
      file: 'content/game.json',
      where: content.game.mapStart === undefined ? 'startRoom' : 'mapStart',
      message: `room "${startId}" has no doors, so it is a standalone room, but there are rooms joined by doors (${rooms.map((r) => r.id).sort().join(', ')}): say which of them the kingdom is entered from`,
    });
    return;
  }

  for (const kind of wayOutCharacters(content)) {
    // Every place this character could stand, in every joined room.
    const nodes: Node[] = [];
    const index = new Map<string, number>();
    const key = (room: string, tx: number, ty: number, half: 0 | 1 = 0): string => `${room}/${tx}/${ty}/${half}`;
    const halves: (0 | 1)[] = kind.box.w > rooms[0]!.tile ? [0, 1] : [0];
    for (const room of rooms) {
      const seen = walled(room);
      const open = openTiles(seen);
      for (let ty = 0; ty < room.h; ty++) {
        for (let tx = 0; tx < room.w; tx++) {
          for (const half of halves) {
            if (!open.has(ty * room.w + tx) || !standsAt(seen, kind, tx, ty, half)) continue;
            index.set(key(room.id, tx, ty, half), nodes.length);
            nodes.push({ room: room.id, tx, ty, half, next: new Set(), door: false });
          }
        }
      }
    }

    /**
     * The node a body at rest is standing on: the nearest standing place on
     * the same floor, at most a tile away. DRAFT: this snap is the one place
     * the check is not exact; it assumes a body at rest can shuffle up to a
     * tile sideways along the floor it is on.
     */
    const nodeUnder = (e: Entity): number | undefined => {
      const room = content.rooms[e.room];
      if (!room) return undefined;
      const tx = Math.floor((e.x + kind.box.w / 2) / room.tile);
      const ty = Math.round((e.y + kind.box.h) / room.tile) - 1;
      let best: number | undefined;
      let bestFar = room.tile;
      for (const cx of [tx - 1, tx, tx + 1]) {
        for (const half of halves) {
          const n = index.get(key(room.id, cx, ty, half));
          const far = Math.abs(standX(room, kind, cx, half) - e.x);
          if (n !== undefined && far <= bestFar) (best = n), (bestFar = far);
        }
      }
      return best;
    };

    /** Each node's moves already played, so no move is played twice from the same node. */
    const played = nodes.map(() => new Map<Move, { to: number | undefined; door: boolean }>());
    /** Plays one move from a node through the real simulation: the node it comes to rest on, and whether it went through a door. */
    const play = (from: number, move: Move): { to: number | undefined; door: boolean } => {
      const known = played[from]!.get(move);
      if (known) return known;
      const node = nodes[from]!;
      const room = content.rooms[node.room]!;
      const body: Entity = {
        id: `p:${PLAYER}`,
        kind: kind.id,
        player: PLAYER,
        room: room.id,
        x: standX(room, kind, node.tx, node.half),
        y: (node.ty + 1) * room.tile - kind.box.h,
        vx: 0,
        vy: 0,
        facing: 1,
        onGround: true,
        // INTENT (brief owner-stuck-in-the-quarry, push 3): played bare, no power held, so a place reached only with a power
        // that then faded (the wings' ledge in the quarry pit) must have a way out without it (scenario way-out-faded-wings-pit-ledge).
        c: {},
      };
      const world: World = { tick: 0, entities: [body] };
      let still = 0;
      let door = false;
      const end = inputsEnd(move);
      for (let t = 0; t < end + SETTLE_TICKS && still < 3; t++) {
        wall(world);
        const events = step(world, { [PLAYER]: inputFor(move, t) }, content);
        if (events.some((e) => e.type === 'changed-room')) door = true;
        still = t >= end && body.onGround && body.vx === 0 && body.vy === 0 ? still + 1 : 0;
      }
      const result = { to: still < 3 ? undefined : nodeUnder(body), door };
      played[from]!.set(move, result);
      return result;
    };

    // Who can get where, found lazily. `toDoor[i]`: some chain of moves
    // from node i goes through a door; `toStart[i]`: some chain arrives in
    // the start room. INTENT: the answer is exactly the one playing every
    // move from every node would give (docs/mechanisms/rooms-and-doors.md,
    // "How it is fast"): a node stops being played only once both are
    // proved true for it, so a node left false has had every move played,
    // and a false answer is only ever drawn from a node's complete list of
    // moves. Only the order is chosen for speed: nodes nearest a door that
    // leads toward the start room first, and each node's moves toward it first.
    const toDoor = nodes.map(() => false);
    const toStart = nodes.map((n) => n.room === start.id);
    const before: number[][] = nodes.map(() => []);
    const tried = nodes.map(() => 0);
    const mark = (flags: boolean[], i: number): void => {
      if (flags[i]) return;
      flags[i] = true;
      const stack = [i];
      while (stack.length) for (const p of before[stack.pop()!]!) if (!flags[p]) (flags[p] = true), stack.push(p);
    };
    const moveOrder = movesFor(rooms, start.id, walled);
    const orderOf = (i: number): Move[] => moveOrder.moves(nodes[i]!);
    /** Plays node i's next untried move; false when it has none left. */
    const playNext = (i: number): boolean => {
      const list = orderOf(i);
      if (tried[i]! >= list.length) return false;
      const { to, door } = play(i, list[tried[i]!]!);
      tried[i]!++;
      const node = nodes[i]!;
      if (door) (node.door = true), mark(toDoor, i);
      if (to !== undefined && to !== i && !node.next.has(to)) {
        node.next.add(to);
        before[to]!.push(i);
        if (toDoor[to]) mark(toDoor, i);
        if (toStart[to]) mark(toStart, i);
      }
      return true;
    };
    const byPromise = nodes.map((_, i) => i).sort((a, b) => moveOrder.rank(nodes[a]!) - moveOrder.rank(nodes[b]!) || a - b);
    for (const i of byPromise) while (!(toDoor[i] && toStart[i]) && playNext(i)) {
      // keep playing this node's moves
    }

    // Which rooms the start room leads to: a search forward from the start
    // spawns. It plays one move at a time, from the reached node nearest a
    // door into a room not reached yet, and stops once every room has been
    // reached. Exact either way: a room is counted reached only through
    // moves actually played, and it gives up only when every reached node
    // has had every move played.
    const fromStart = nodes.map(() => false);
    const roomsLeft = new Set(rooms.map((r) => r.id));
    const frontier: number[] = [];
    const reach = (i: number): void => {
      if (fromStart[i]) return;
      fromStart[i] = true;
      roomsLeft.delete(nodes[i]!.room);
      frontier.push(i);
    };
    for (const s of start.spawns) {
      const i = index.get(key(start.id, s.tx, s.ty, 0));
      if (i !== undefined) reach(i);
    }
    const forwardTried = nodes.map(() => 0);
    // INTENT: a node's order is fixed the first time it is picked, so that counting `forwardTried` along it plays every move exactly once even after the aim changes.
    const forwardList: (Move[] | undefined)[] = nodes.map(() => undefined);
    // Tile steps to a door into a room not reached yet, per room; worked out again when a room is reached.
    let aim = moveOrder.aimAt(roomsLeft);
    let aimed = roomsLeft.size;
    while (roomsLeft.size > 0 && frontier.length > 0) {
      if (aimed !== roomsLeft.size) (aim = moveOrder.aimAt(roomsLeft)), (aimed = roomsLeft.size);
      let best = 0;
      let bestScore = Infinity;
      for (let k = 0; k < frontier.length; k++) {
        const j = frontier[k]!;
        const score = aim.far(nodes[j]!) * MOVES.length + forwardTried[j]!;
        if (score < bestScore) (best = k), (bestScore = score);
      }
      const i = frontier[best]!;
      const list = (forwardList[i] ??= aim.moves(nodes[i]!));
      if (forwardTried[i]! >= list.length) {
        frontier.splice(best, 1);
        continue;
      }
      const move = list[forwardTried[i]!++]!;
      const { to } = play(i, move);
      if (to !== undefined && to !== i) reach(to);
    }

    const who = `the ${kind.id} (${kind.box.w} by ${kind.box.h} px)`;

    for (const room of rooms) {
      const file = `content/rooms/${room.id}.json`;
      const mine = nodes.flatMap((n, i) => (n.room === room.id ? [i] : []));
      if (room.id !== start.id && !mine.some((i) => fromStart[i])) {
        problems.push({ file, where: '(the whole room)', message: `${who} starting in "${start.id}" can never get here through doors: every room with doors must be reachable from the start room` });
      }
      // One problem per patch of tiles, not one per tile.
      const report = (bad: number[], say: (n: Node, count: number) => string): void => {
        const left = new Set(bad);
        for (const first of bad) {
          if (!left.has(first)) continue;
          const patch = [first];
          left.delete(first);
          for (let k = 0; k < patch.length; k++) {
            const a = nodes[patch[k]!]!;
            for (const j of [...left]) {
              const b = nodes[j]!;
              if (Math.abs(a.tx - b.tx) + Math.abs(a.ty - b.ty) <= 1) (left.delete(j), patch.push(j));
            }
          }
          const n = nodes[first]!;
          problems.push({ file, where: `tile [${n.tx}, ${n.ty}]`, message: say(n, patch.length) });
        }
      };
      const also = (count: number): string => (count > 1 ? ` (and ${count - 1} more tile(s) beside it)` : '');
      report(
        mine.filter((i) => !toDoor[i]),
        (_n, count) => `no way out: ${who} standing here${also(count)} can never reach a door of this room by running, jumping or pushing up`,
      );
      report(
        mine.filter((i) => toDoor[i] && !toStart[i]),
        (_n, count) => `no way back: ${who} standing here${also(count)} can leave this room but can never get back to the start room "${start.id}"`,
      );
    }
  }
}

/**
 * Every character the way-out check plays: the party's members and every
 * roster hero (content/roster.json), in that order, each once.
 * INTENT (brief owner-stuck-in-the-quarry; the owner, 2026-11-24: "i got
 * stuck in the quarry ... platforms you can jump up through, but not back
 * down through, which can close paths"): a player can be any roster hero
 * (the cantina's swap, a recruit, the next hero when one is out of hearts),
 * not only the party's first three. Played for the three alone, the check
 * never saw the brawler (the lowest jump) shut in the Bandit Camp's cache.
 */
export function wayOutCharacters(content: Content): CharacterKind[] {
  const out = playableCharacters(content);
  for (const id of content.roster?.characters ?? []) {
    const c = content.characters[id];
    if (c && !out.some((k) => k.id === id)) out.push(c);
  }
  return out;
}

/**
 * The order the way-out check plays nodes and moves in. Speed only: every
 * order gives the same answer (see "Who can get where" above). A node's
 * promise is how near it is to a door that leads toward the start room
 * (rooms nearer the start first, then tiles nearer such a door), and its
 * moves are played toward that door first, short runs before long ones.
 */
function movesFor(
  rooms: Room[],
  startId: string,
  walled: (room: Room) => Room,
): {
  moves: (n: Node) => Move[];
  rank: (n: Node) => number;
  aimAt: (unreached: Set<string>) => { moves: (n: Node) => Move[]; far: (n: Node) => number };
} {
  // Rooms by how many doors from the start room.
  const roomDist = new Map<string, number>([[startId, 0]]);
  const byId = new Map(rooms.map((r) => [r.id, r]));
  const queue = [startId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const d of byId.get(id)?.doors ?? []) {
      if (!byId.has(d.to.room) || roomDist.has(d.to.room)) continue;
      roomDist.set(d.to.room, roomDist.get(id)! + 1);
      queue.push(d.to.room);
    }
  }
  const FAR = 1e5;
  /** Tile steps through open tiles from the given doors' tiles. */
  const field = (room: Room, doors: Room['doors']): number[] => {
    const out = room.cells.map(() => FAR);
    const q: number[] = [];
    for (const d of doors) {
      for (let ty = d.ty; ty < d.ty + d.h; ty++) {
        for (let tx = d.tx; tx < d.tx + d.w; tx++) {
          const i = ty * room.w + tx;
          if (cellOf(room, tx, ty) !== TILE.solid && out[i] === FAR) (out[i] = 0), q.push(i);
        }
      }
    }
    for (let k = 0; k < q.length; k++) {
      const i = q[k]!;
      const tx = i % room.w;
      const ty = (i - tx) / room.w;
      for (const [x, y] of [[tx - 1, ty], [tx + 1, ty], [tx, ty - 1], [tx, ty + 1]] as const) {
        if (cellOf(room, x, y) === TILE.solid) continue;
        const j = y * room.w + x;
        if (out[j] === FAR) (out[j] = out[i]! + 1), q.push(j);
      }
    }
    return out;
  };
  const toward = new Map<string, number[]>();
  for (const room of rooms) {
    const seen = walled(room);
    const mine = roomDist.get(room.id) ?? FAR;
    const homeward = room.id === startId ? room.doors : room.doors.filter((d) => (roomDist.get(d.to.room) ?? FAR) < mine);
    toward.set(room.id, field(seen, homeward.length ? homeward : room.doors));
  }
  const at = (f: number[] | undefined, room: Room | undefined, tx: number, ty: number): number =>
    !f || !room || tx < 0 || tx >= room.w || ty < 0 || ty >= room.h ? FAR : f[ty * room.w + tx]!;

  // One object per move, shared by both orders, so a move's result can be remembered per node.
  const pool = new Map<string, Move>();
  const m = (move: Move): Move => {
    const k = `${move.dir}/${move.hold}/${move.jump}/${move.up}`;
    if (!pool.has(k)) pool.set(k, move);
    return pool.get(k)!;
  };
  const ordered = (d: -1 | 1): Move[] => {
    const out: Move[] = [m({ dir: 0, hold: 0, jump: 'none', up: true })];
    for (const dir of [d, -d as -1 | 1]) {
      for (const jump of ['none', 'run-up', 'start', 'taps'] as const) for (const hold of HOLDS) out.push(m({ dir, hold, jump, up: false }));
      if (dir === d) out.push(m({ dir: 0, hold: 0, jump: 'start', up: false }), m({ dir: 0, hold: 0, jump: 'taps', up: false }));
    }
    return out;
  };
  const leftFirst = ordered(-1);
  const rightFirst = ordered(1);
  // INTENT: the same moves as MOVES, only reordered; a move missing here would weaken the check.
  const sig = (list: Move[]): string => list.map((m) => `${m.dir}/${m.hold}/${m.jump}/${m.up}`).sort().join(' ');
  if (sig(leftFirst) !== sig(MOVES) || sig(rightFirst) !== sig(MOVES)) throw new Error('way-out check: the move orders must hold exactly the moves in MOVES');
  return {
    moves: (n) => {
      const room = byId.get(n.room);
      const f = toward.get(n.room);
      return at(f, room, n.tx - 1, n.ty) < at(f, room, n.tx + 1, n.ty) ? leftFirst : rightFirst;
    },
    rank: (n) => (roomDist.get(n.room) ?? FAR) * FAR * 10 + at(toward.get(n.room), byId.get(n.room), n.tx, n.ty),
    aimAt: (unreached) => {
      const aims = new Map<string, number[]>();
      for (const room of rooms) {
        const doors = room.doors.filter((d) => unreached.has(d.to.room));
        if (doors.length) aims.set(room.id, field(walled(room), doors));
      }
      return {
        moves: (n) => {
          const room = byId.get(n.room);
          const f = aims.get(n.room) ?? toward.get(n.room);
          return at(f, room, n.tx - 1, n.ty) < at(f, room, n.tx + 1, n.ty) ? leftFirst : rightFirst;
        },
        far: (n) => at(aims.get(n.room), byId.get(n.room), n.tx, n.ty),
      };
    },
  };
}
