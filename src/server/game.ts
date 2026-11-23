// The server's half of the network layer: one World per named world, the
// players in it, the tick and the snapshots (docs/mechanisms/network.md).
import type http from 'node:http';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import type { Content } from '../content/types.ts';
import { clone, DEFAULT_WORLD, looksLikeEntity, playerEntityId } from '../net/protocol.ts';
import type { ClientMessage, ServerMessage } from '../net/protocol.ts';
import { heldBy } from '../sim/effects.ts';
import type { Effect } from '../sim/effects.ts';
import { step } from '../sim/step.ts';
import { applyChange, applyTuningDiff, refuseChange, tuningDiff, tuningRules } from '../sim/tuning-rules.ts';
import { DT } from '../sim/types.ts';
import type { Entity, Input, SimEvent, World } from '../sim/types.ts';
import { createWorld, findEntity, NO_INPUT, populateRoom, removeEntity, spawnPlayer } from '../sim/world.ts';
import { createSaves, GAME_PREFIX, gameCode, isGameCode, SAVE_EVERY_MS } from './saves.ts';
import type { Store } from './store.ts';

interface Player {
  id: string;
  sock: WebSocket | null;
  slot: number;
  /** The input last given to step() for this player. */
  input: Input;
  inputAt: number;
  /** Inputs reported and not yet stepped, one per simulation tick, oldest first. */
  queue: Input[];
  /** The page's own tick count at its latest report. */
  ct: number;
  /** When a character whose page went away is removed. */
  staleAt: number | null;
  /** Effects on this player's character that their page has not acknowledged yet, oldest first. */
  pending: { id: number; effect: Effect; sentAt: number }[];
}

/** DRAFT: how long before an unacknowledged effect is sent again. */
const RESEND_MS = 300;

export interface GameWorld {
  name: string;
  world: World;
  players: Map<string, Player>;
  owed: number;
  events: SimEvent[];
  /**
   * Step 2 (?tune): this world's own content, made the first time someone
   * tunes it, with its own copy of the tuning numbers; until then the
   * shared content. INTENT: one world's dials never move another's.
   */
  content?: Content;
  /** Step 17: a kept game's code (the world is `game-<code>`), else absent. */
  game?: string;
  /** Step 17: when this game was last saved (ms). */
  savedAt?: number;
}

export interface GameOptions {
  content: Content;
  commit: string;
  startedAt: string;
  /**
   * Step 17 (additive): where kept games are saved (src/server/saves.ts).
   * Absent: no world is ever saved or loaded (the in-process checks that
   * predate it).
   */
  store?: Store;
  /** Step 17: something about a save that a person should know (src/server/main.ts sends it to /debug/errors). */
  problem?: (message: string) => void;
  /** Step 17: how often a game is saved while anyone is in it (ms); SAVE_EVERY_MS unless a check says otherwise. */
  saveEveryMs?: number;
}

function cleanInput(raw: unknown): Input {
  const i = (raw ?? {}) as Partial<Input>;
  const axis = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0);
  return { x: axis(i.x), y: axis(i.y), held: Array.isArray(i.held) ? i.held.filter((a) => typeof a === 'string').slice(0, 32) : [] };
}

/** DRAFT: how long a page may say nothing before its character is shown as away (ms). A page in view reports many times a second. */
const AWAY_SILENCE_MS = 2500;

export function attachGame(server: http.Server, opts: GameOptions) {
  const { content } = opts;
  const net = content.net;
  const worlds = new Map<string, GameWorld>();
  const rules = tuningRules(content);
  const saves = opts.store ? createSaves(opts.store, { content, commit: opts.commit, problem: opts.problem ?? ((m) => console.error(`saves: ${m}`)) }) : null;
  const saveEveryMs = opts.saveEveryMs ?? SAVE_EVERY_MS;
  const saveGame = (gw: GameWorld): void => {
    if (!saves || !gw.game) return;
    saves.save(gw.game, gw.world);
    gw.savedAt = Date.now();
  };

  const send = (sock: WebSocket | null, m: ServerMessage | string): void => {
    if (sock && sock.readyState === sock.OPEN) sock.send(typeof m === 'string' ? m : JSON.stringify(m));
  };

  /**
   * THE one place a world is created (docs/mechanisms/network.md). Anything
   * a new world should start with goes here.
   */
  const makeWorld = (name: string): GameWorld => {
    const gw: GameWorld = { name, world: createWorld(), players: new Map(), owed: 0, events: [] };
    // Step 17: a kept game (`game-<CODE>`) with a save is built from it; a
    // new code, `main` and every `?room=` world start fresh, as before.
    const code = saves ? gameCode(name) : null;
    const saved = code ? saves!.load(code) : null;
    if (code) {
      gw.game = code;
      gw.savedAt = Date.now();
    }
    if (saved) gw.world = saved.world;
    // Whatever content/placements/ puts in each room (crates, dummies, people);
    // for a loaded game, only in rooms its save never knew.
    for (const roomId of saved ? saved.newRooms : Object.keys(content.rooms)) populateRoom(gw.world, content, roomId);
    return gw;
  };

  /**
   * THE one place the server receives each tick's events from step()
   * (docs/mechanisms/network.md). Anything the server itself does about an
   * event (beyond sending it to the pages) goes here.
   */
  const onEvents = (gw: GameWorld, events: SimEvent[]): void => {
    gw.events.push(...events);
    if (gw.events.length > 500) gw.events.splice(0, gw.events.length - 500);
  };

  const removePlayer = (gw: GameWorld, p: Player): void => {
    removeEntity(gw.world, playerEntityId(p.id));
    gw.players.delete(p.id);
    // INTENT: a PRIVATE world is forgotten when its last player is gone, so
    // one made for a check (`?room=check-...`) leaves nothing behind.
    // INTENT: the world everyone shares is never forgotten while the server
    // runs: what players did to its rooms stays done when the last one
    // leaves (World.rooms is "never reset when a room empties", D-077).
    // DRAFT: it keeps being simulated while empty.
    // Step 17: a kept game is saved first, then forgotten like any private
    // world; joining it again builds it from that save.
    if (gw.players.size === 0 && gw.name !== DEFAULT_WORLD) {
      saveGame(gw);
      worlds.delete(gw.name);
    }
  };

  // INTENT: "while a character is held or flying from a hit, the server's
  // word wins" (docs/plan/step-1.md). Held, or with an effect its page has
  // not acknowledged, a player's character is simulated here and the page's
  // reports of it are set aside; once free and acknowledged, the page's own
  // simulation is the truth again. Without this a report sent just before
  // the effect arrived would undo it (and a door could fire twice).
  const serverMoves = (gw: GameWorld, p: Player): boolean => {
    if (p.pending.length > 0) return true;
    const e = findEntity(gw.world, playerEntityId(p.id));
    return !!e && heldBy(e) !== null;
  };

  /** Puts what a page says about its own character into the world, keeping what is the server's to say. */
  const adopt = (gw: GameWorld, p: Player, raw: unknown): boolean => {
    if (!looksLikeEntity(raw)) return false;
    if (!content.rooms[raw.room] || !content.characters[raw.kind]) return false;
    if (serverMoves(gw, p)) return true;
    const e = clone(raw);
    e.id = playerEntityId(p.id);
    e.player = p.id;
    const i = gw.world.entities.findIndex((x) => x.id === e.id);
    // INTENT: who owns which part of a player's entity. The PAGE owns the
    // body's motion and identity: every top-level field (x, y, speeds,
    // facing, onGround, room, kind). The SERVER owns its copy of `c`, the
    // per-verb and per-system state: it starts from the page's on joining
    // and from then on is advanced only by the server's own step(), fed the
    // player's input tick by tick. So what a server-run system writes there
    // (what was picked up, a press already seen) survives every report, and
    // a press is seen once: on the tick the server's copy first holds it.
    if (i >= 0) e.c = gw.world.entities[i]!.c;
    // Keeps `away` as the tick set it: only the tick decides it.
    e.c.net = i >= 0 && e.c.net?.away ? { slot: p.slot, away: true } : { slot: p.slot };
    if (i >= 0) gw.world.entities[i] = e;
    else {
      // Sorted by id, as World requires.
      let at = 0;
      while (at < gw.world.entities.length && gw.world.entities[at]!.id < e.id) at++;
      gw.world.entities.splice(at, 0, e);
    }
    return true;
  };

  const join = (sock: WebSocket, m: Extract<ClientMessage, { t: 'join' }>): { gw: GameWorld; p: Player } | null => {
    if (typeof m.player !== 'string' || m.player.length < 1 || m.player.length > 64) return null;
    const name = typeof m.world === 'string' && m.world.length > 0 ? m.world.slice(0, 64) : DEFAULT_WORLD;
    let gw = worlds.get(name);
    if (!gw) worlds.set(name, (gw = makeWorld(name)));
    let p = gw.players.get(m.player);
    if (p) {
      // INTENT: the same player id coming back takes its character over; it
      // never spawns a second one. The older socket, if still there, is let go.
      const old = p.sock;
      p.sock = sock;
      if (old && old !== sock) old.close(4001, 'taken over');
    } else {
      let slot = 0;
      const used = new Set([...gw.players.values()].map((q) => q.slot));
      while (used.has(slot)) slot++;
      p = { id: m.player, sock, slot, input: NO_INPUT, inputAt: 0, queue: [], ct: 0, staleAt: null, pending: [] };
      gw.players.set(p.id, p);
    }
    p.staleAt = null;
    const id = playerEntityId(p.id);
    // A page that has played keeps its own place; a new one is placed by the server.
    if (!m.fresh) adopt(gw, p, m.e);
    if (!findEntity(gw.world, id)) {
      // INTENT: joining seats you in the one shared party. No character is
      // passed: the simulation picks a member nobody is playing (and the
      // first again when all are taken; nobody is turned away). Leaving is
      // removeEntity; coming back while the character exists calls nothing.
      const e = spawnPlayer(gw.world, content, { player: p.id, room: content.game.startRoom, spawn: p.slot });
      e.c.net = { slot: p.slot };
    }
    send(sock, { t: 'welcome', commit: opts.commit, startedAt: opts.startedAt, player: p.id, e: findEntity(gw.world, id)!, tick: gw.world.tick });
    // Someone joining a world that was tuned plays by its numbers, not the shipped ones.
    if (gw.content) send(sock, { t: 'tuning', diff: tuningDiff(content.tuning, gw.content.tuning) });
    return { gw, p };
  };

  /**
   * A page's `?tune` change (docs/mechanisms/tuning-panel.md). INTENT: a
   * page is not trusted to send sane numbers (friends, but a bug is not):
   * an unknown set or name, a non-number or a number outside its declared
   * range refuses the whole message, and nothing in it is applied.
   * DRAFT: a change applies to the whole world it was made in, for
   * everyone in it, until the server restarts (every code push restarts
   * it); nothing is kept anywhere (docs/decisions-log.md).
   */
  const tune = (gw: GameWorld, p: Player, m: Extract<ClientMessage, { t: 'tune' }>): void => {
    const changes: unknown[] = Array.isArray(m.changes) ? m.changes : [];
    const ok = Array.isArray(m.changes) && changes.length <= 500 && changes.every((c) => refuseChange(rules, c) === null);
    if (ok) {
      const own = (gw.content ??= { ...content, tuning: clone(content.tuning) });
      if (m.reset === true) applyTuningDiff(own.tuning, content.tuning, {});
      for (const c of changes as Parameters<typeof applyChange>[2][]) applyChange(own.tuning, content.tuning, c);
    }
    const msg: ServerMessage = { t: 'tuning', diff: gw.content ? tuningDiff(content.tuning, gw.content.tuning) : {} };
    // A refused change is answered to its sender alone, so its page puts its own numbers back.
    if (!ok) return send(p.sock, msg);
    const text = JSON.stringify(msg);
    for (const q of gw.players.values()) send(q.sock, text);
  };

  const wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (sock) => {
    let here: { gw: GameWorld; p: Player } | null = null;
    sock.on('message', (data) => {
      let m: ClientMessage;
      try {
        m = JSON.parse(data.toString()) as ClientMessage;
      } catch {
        return;
      }
      if (!m || typeof m !== 'object') return;
      if (m.t === 'ping') return send(sock, { t: 'pong', n: m.n });
      if (m.t === 'join') {
        here = join(sock, m);
        if (!here) sock.close(4000, 'bad join');
        return;
      }
      if (!here || here.p.sock !== sock) return;
      if (m.t === 'me') {
        if (!adopt(here.gw, here.p, m.e)) return;
        const list = Array.isArray(m.is) && m.is.length > 0 ? m.is.slice(-12) : [m.i];
        here.p.queue.push(...list.map(cleanInput));
        // DRAFT: if the page runs ahead of the server, the oldest ticks are dropped.
        if (here.p.queue.length > 12) here.p.queue.splice(0, here.p.queue.length - 12);
        here.p.inputAt = Date.now();
        here.p.ct = typeof m.ct === 'number' ? m.ct : here.p.ct;
      } else if (m.t === 'tune') {
        tune(here.gw, here.p, m);
      } else if (m.t === 'ack') {
        here.p.pending = here.p.pending.filter((f) => f.id !== m.id);
      } else if (m.t === 'bye') {
        removePlayer(here.gw, here.p);
        here = null;
        sock.close(1000, 'bye');
      }
    });
    const gone = (): void => {
      if (!here || here.p.sock !== sock) return;
      here.p.sock = null;
      here.p.input = NO_INPUT;
      here.p.queue = [];
      // DRAFT: how long a character waits for its page to come back
      // (content/net.json staleSeconds). Step 5 owns what the others see meanwhile.
      here.p.staleAt = Date.now() + net.staleSeconds * 1000;
    };
    sock.on('close', gone);
    sock.on('error', gone);
  });

  // Effect ids only ever grow, across restarts too, so a page can tell a resent copy from a new effect.
  let nextFx = Date.now();

  const tickWorld = (gw: GameWorld, now: number): void => {
    // INTENT: a character a page owns is a puppet here: its state is the
    // page's latest report, put back after every tick. The world is still
    // stepped with that character in it and its player's input, so whatever
    // the server simulates can see it and act on it. What the world does TO
    // it is an effect (src/sim/effects.ts): sent to its page, numbered,
    // resent until acknowledged; until then (and while it is held) the
    // character is not a puppet but simulated here.
    const inputs: Record<string, Input> = {};
    const puppets: { id: string; before: Entity }[] = [];
    for (const p of gw.players.values()) {
      const id = playerEntityId(p.id);
      const e = findEntity(gw.world, id);
      if (!e) continue;
      // DRAFT (Step 5): a friend whose page went away looks away, not frozen.
      // While the socket is closed (until staleSeconds removes the
      // character) or nothing has come from the page for AWAY_SILENCE_MS (a
      // locked phone keeps its socket for a while), the character carries
      // `away` on the server's own component, which every snapshot copies.
      const away = !p.sock || (p.inputAt > 0 && now - p.inputAt > AWAY_SILENCE_MS);
      if ((e.c.net?.away === true) !== away) e.c.net = away ? { slot: p.slot, away: true } : { slot: p.slot };
      // One reported tick of input per server tick; between reports the last
      // one is held (for inputHoldMs at most, so a vanished page lets go).
      p.input = p.queue.shift() ?? (p.sock && now - p.inputAt <= net.inputHoldMs ? p.input : NO_INPUT);
      inputs[p.id] = p.input;
      if (!serverMoves(gw, p)) puppets.push({ id, before: clone(e) });
    }
    const events = step(gw.world, inputs, gw.content ?? content);
    onEvents(gw, events);
    const hit = new Set<string>();
    for (const ev of events) {
      if (ev.type !== 'effect' || ev.player === null) continue;
      const p = gw.players.get(ev.player);
      const e = findEntity(gw.world, ev.entity);
      if (!p || !e) continue;
      hit.add(ev.entity);
      const fx = { id: ++nextFx, effect: ev.effect, sentAt: now };
      p.pending.push(fx);
      send(p.sock, { t: 'fx', id: fx.id, effect: fx.effect, e });
    }
    for (const o of puppets) {
      if (hit.has(o.id)) continue;
      const i = gw.world.entities.findIndex((x) => x.id === o.id);
      if (i < 0) continue;
      // The motion goes back to what the page reported; `c` stays as the step left it (see adopt).
      o.before.c = gw.world.entities[i]!.c;
      gw.world.entities[i] = o.before;
    }
    for (const p of gw.players.values()) {
      const e = findEntity(gw.world, playerEntityId(p.id));
      for (const fx of p.pending) {
        if (!e || now - fx.sentAt < RESEND_MS) continue;
        fx.sentAt = now;
        send(p.sock, { t: 'fx', id: fx.id, effect: fx.effect, e });
      }
    }
  };

  // INTENT: a fixed timestep fed by real time with a cap on catching up: a
  // slow moment costs a few dropped ticks, never a spiral, and the
  // simulation itself never reads a clock.
  let last = Date.now();
  let lastSnap = last;
  const timer = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.min((now - last) / 1000, net.maxCatchUpTicks * DT);
    last = now;
    const snap = now - lastSnap >= 1000 / net.snapshotRate - 2;
    if (snap) lastSnap = now;
    for (const gw of [...worlds.values()]) {
      for (const p of [...gw.players.values()]) {
        if (!p.sock && p.staleAt !== null && now >= p.staleAt) removePlayer(gw, p);
      }
      if (!worlds.has(gw.name)) continue;
      // DRAFT (Step 17): a kept game is saved every saveEveryMs while anyone is in it.
      if (gw.game && gw.players.size > 0 && now - (gw.savedAt ?? 0) >= saveEveryMs) saveGame(gw);
      gw.owed += elapsed;
      while (gw.owed >= DT) {
        tickWorld(gw, now);
        gw.owed -= DT;
      }
      if (!snap) continue;
      const stamps: Record<string, number> = {};
      for (const p of gw.players.values()) stamps[playerEntityId(p.id)] = p.ct;
      // DRAFT: a page is sent every player (wherever they are, so friends can
      // be found) and everything else in the content room its own character
      // is in; whole, 20 times a second, moved or not. Still the first thing
      // to trim when a room fills up (send only what changed).
      const byRoom = new Map<string, string>();
      for (const p of gw.players.values()) {
        if (!p.sock) continue;
        const room = findEntity(gw.world, playerEntityId(p.id))?.room ?? '';
        let text = byRoom.get(room);
        if (text === undefined) {
          const w: World = { ...gw.world, entities: gw.world.entities.filter((e) => e.player !== null || e.room === room) };
          byRoom.set(room, (text = JSON.stringify({ t: 'snap', w, stamps, ev: gw.events } satisfies ServerMessage)));
        }
        send(p.sock, text);
      }
      gw.events = [];
    }
  }, 1000 / 120);

  return {
    /** The live worlds by name. For /healthz counts and the in-process check; treat as read-only elsewhere. */
    worlds,
    /** `players`: connected to the world everyone shares (look before pushing code). `playersEverywhere` counts private worlds too. */
    counts: (): { players: number; worlds: number; playersEverywhere: number } => {
      const connected = (gw: GameWorld | undefined): number => (gw ? [...gw.players.values()].filter((p) => p.sock).length : 0);
      return {
        players: connected(worlds.get(DEFAULT_WORLD)),
        worlds: worlds.size,
        playersEverywhere: [...worlds.values()].reduce((n, gw) => n + connected(gw), 0),
      };
    },
    /** Step 17: whether a kept game with this code exists (being played now, or saved). */
    gameExists: (code: string): boolean => isGameCode(code) && (worlds.has(GAME_PREFIX + code) || !!saves?.has(code)),
    /** Step 17: save every kept game being played now (the server is being stopped). */
    saveAll: (): void => {
      for (const gw of worlds.values()) if (gw.game) saveGame(gw);
    },
    close(): void {
      clearInterval(timer);
      for (const c of wss.clients) c.terminate();
      wss.close();
    },
  };
}
export type Game = ReturnType<typeof attachGame>;
