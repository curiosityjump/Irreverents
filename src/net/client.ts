// One player's end of the network layer: simulates their own character,
// reports it, receives the world, and comes back by itself when the
// connection drops. Pure (no DOM, no Node): the browser page and the
// headless gate F check both run exactly this (docs/mechanisms/network.md).
import type { Content } from '../content/types.ts';
import { step } from '../sim/step.ts';
import { DT } from '../sim/types.ts';
import type { Entity, Input, SimEvent, World } from '../sim/types.ts';
import { createWorld, spawnPlayer } from '../sim/world.ts';
import { applyEffect, heldBy } from '../sim/effects.ts';
import { applyChange, applyTuningDiff } from '../sim/tuning-rules.ts';
import type { TuningChange } from '../sim/tuning-rules.ts';
import { clone, looksLikeEntity, playerEntityId } from './protocol.ts';
import type { ClientMessage, ServerMessage } from './protocol.ts';

/**
 * How long a socket that has not opened yet is given before the page gives
 * it up and tries again; once open, `silenceMs` applies (content/net.json).
 * INTENT (Step 5, the reconnect flake, docs/mechanisms/network.md "Coming
 * back"): after many failed tries (a server down through a deploy) Chromium
 * holds each new WebSocket back before even dialling, by a growing delay
 * that reaches about 1-5 s. Giving a try only `silenceMs` (3 s) killed it
 * while the browser was still holding it, so a page whose server was back
 * could stay "Reconnecting…" try after try. A try must outlast the
 * browser's hold. DRAFT: 10 s is a first guess, above that hold with room;
 * it belongs in content/net.json (`connectMs`) when that file is next
 * touched. A dead network is not waited out here: the `online` event and a
 * tab shown again retry at once (kick).
 */
const CONNECT_MS = 10000;
import { createPredictor } from './predict.ts';
import { createSmoother } from './smooth.ts';

/** A socket, as little of one as this needs; the host supplies it (a browser WebSocket, or `ws` in Node). */
export interface Transport {
  send(text: string): void;
  close(): void;
}
export interface TransportHandlers {
  open(): void;
  message(text: string): void;
  close(): void;
}

export interface NetClientOptions {
  content: Content;
  /** A random id this page keeps; the same id coming back takes its character over. */
  player: string;
  /** Which world to join (`?room=`). */
  world: string;
  /** Milliseconds from any steady clock. */
  now(): number;
  connect(handlers: TransportHandlers): Transport;
  /** Called on every (re)join with the commit the server runs. */
  onWelcome?(commit: string): void;
  /** Step 17: the server set this world aside (`why` is for the player). The client has stopped reconnecting. */
  onGone?(why: string): void;
}

/** `gone` (Step 17, additive): the server set this world aside; nothing reconnects. */
export type NetStatus = 'connecting' | 'online' | 'reconnecting' | 'gone';

export function createNetClient(opts: NetClientOptions) {
  const { content, player, now } = opts;
  const net = content.net;
  const myId = playerEntityId(player);

  // INTENT: the page's own character lives in a world of its own and is
  // stepped here, on this device, the moment the input arrives; the network
  // only reports it. That is what keeps movement instant on a slow
  // connection, and what lets one person play with no server at all
  // (docs/plan/step-1.md: "Solo works with the same build").
  // DRAFT: this local world holds only the player's own character. Which
  // party members the others play reaches it as `world.taken` (from each
  // snapshot, below); a verb that must see the others' bodies (to aim) does
  // not yet; see docs/mechanisms/network.md.
  const world: World = createWorld();
  // No character passed: the simulation seats the player in the party
  // (src/sim/world.ts). The server's seat replaces this one on first joining.
  spawnPlayer(world, content, { player, room: content.game.startRoom });
  const me = (): Entity => world.entities.find((e) => e.id === myId)!;

  const smoother = createSmoother(net);
  // Step 5: this page's own hits drawn at once on what they strike (src/net/predict.ts).
  const predictor = createPredictor(content, myId);
  let transport: Transport | null = null;
  let token = 0;
  let open = false;
  let status: NetStatus = 'connecting';
  let everWelcomed = false;
  let played = false;
  let sentFresh = false;
  let nextAttemptAt = now();
  let backoff = net.reconnectFirstMs;
  let lastHeard = now();
  let lastReport = 0;
  let lastPing = 0;
  let pingN = 0;
  const pingSent = new Map<number, number>();
  let last = now();
  let owed = 0;
  let left = false;
  /** Step 17: the server said this world is gone; no reconnecting to it, not even on kick(). */
  let gone = false;
  let latest: { tick: number; events: SimEvent[] } = { tick: 0, events: [] };
  let serverMe: Entity | null = null;
  let heardRooms: World['rooms'] = undefined;
  /** The newest effect applied; effect ids only ever grow, so a resent copy is recognised. */
  let lastFx = 0;
  /** What was held on each local tick since the last report. */
  let ticked: Input[] = [];
  const stats = { /** Step 5: hits this page predicted, then seen from the server, or eased back unseen (src/net/predict.ts). */ hits: predictor.counts, connects: 0, rttMs: null as number | null, msgsIn: 0, bytesIn: 0, msgsOut: 0, bytesOut: 0, effects: 0, tunesOut: 0, tuningsIn: 0 };
  // INTENT (Step 2, ?tune): the world's tuning numbers are the server's, and
  // this page plays by them: `tuning` messages are laid over the shipped
  // numbers IN PLACE in `content.tuning`, the very object this page's step
  // and drawing read, so a dial turned by anyone in the world moves this
  // page's own running and jumping too. The shipped numbers are kept here
  // to lay each one over. (docs/mechanisms/tuning-panel.md)
  const shipped = clone(content.tuning);
  const adopt = (e: Entity): void => {
    const mine = me();
    for (const key of Object.keys(mine)) delete (mine as unknown as Record<string, unknown>)[key];
    Object.assign(mine, clone(e), { id: myId, player });
  };

  const send = (m: ClientMessage): void => {
    if (!transport || !open) return;
    const text = JSON.stringify(m);
    stats.msgsOut++;
    stats.bytesOut += text.length;
    transport.send(text);
  };

  const drop = (): void => {
    // INTENT (the reconnect path): there is always a way out; waiting may be
    // a cost, being stuck may not (CLAUDE.md). Whatever ended the socket, the
    // page goes back to trying by itself, with a growing wait, for ever; the
    // player keeps moving locally meanwhile and nothing asks for a reload.
    if (transport) {
      const t = transport;
      transport = null;
      token++;
      try {
        t.close();
      } catch {
        // already gone
      }
    }
    open = false;
    if (left) return;
    status = everWelcomed ? 'reconnecting' : 'connecting';
    nextAttemptAt = now() + backoff;
    backoff = Math.min(backoff * 2, net.reconnectMaxMs);
  };

  const onMessage = (text: string): void => {
    let m: ServerMessage;
    try {
      m = JSON.parse(text) as ServerMessage;
    } catch {
      return;
    }
    lastHeard = now();
    stats.msgsIn++;
    stats.bytesIn += text.length;
    if (m.t === 'gone') {
      // INTENT: the server set this world aside. Retrying would only meet the
      // same refusal, so the page stops here and shows the way out (onGone).
      gone = true;
      left = true;
      drop();
      status = 'gone';
      opts.onGone?.(typeof m.why === 'string' ? m.why : '');
      return;
    }
    if (m.t === 'welcome') {
      if (looksLikeEntity(m.e)) {
        const mine = me();
        // A page that has not played yet stands where the server put it; one
        // that has keeps its own place (it is coming back, not arriving).
        // Either way, a character the server is moving just now (held, or an
        // effect not yet acknowledged) is the server's to place.
        if (sentFresh || heldBy(m.e)) adopt(m.e);
        else if (m.e.c.net) mine.c.net = clone(m.e.c.net);
      }
      // One clock for what is drawn: the page's tick count starts from the
      // server's, so "how many ticks ago" in an entity's state (a swing, an
      // impact) reads about right on every screen. DRAFT: about, not exactly.
      if (typeof m.tick === 'number' && Math.abs(world.tick - m.tick) > 20) world.tick = m.tick;
      smoother.clear();
      predictor.clear();
      // A server that restarted has forgotten every dial; if this world is
      // still tuned, its `tuning` follows this message.
      applyTuningDiff(content.tuning, shipped, {});
      status = 'online';
      everWelcomed = true;
      backoff = net.reconnectFirstMs;
      stats.connects++;
      opts.onWelcome?.(m.commit);
    } else if (m.t === 'snap') {
      const ids = new Set<string>();
      const t = now();
      for (const e of m.w.entities) {
        if (e.id === myId) {
          serverMe = e; // Step 21: the server's copy of this character, for what only it knows (wear, falls).
          // While held, whoever holds this character moves it, and that
          // is simulated on the server: follow the server's copy.
          if (heldBy(me())) adopt(e);
          continue;
        }
        ids.add(e.id);
        smoother.feed(t, e.id, m.stamps[e.id] ?? m.w.tick, e);
      }
      smoother.keep(ids);
      // INTENT: everything in the World that is not an entity (room state: a
      // gate open, a wall broken; whatever a later step adds at the top
      // level) is the server's, and this page's own world takes it as sent,
      // so the local step and the drawing use the same room the server has.
      // By key, never a list of names: a new field needs no change here.
      const mine = world as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(m.w)) if (key !== 'entities' && key !== 'tick') mine[key] = value;
      // The switch gap: which party members the other players hold, so this
      // page's switch and cantina swap never pick one (World.taken; the
      // server refuses whatever slips through, src/server/game.ts adopt).
      // Their bodies stay out of this world: only the server simulates them.
      world.taken = m.w.entities.filter((e) => e.player !== null && e.id !== myId).map((e) => e.kind);
      if (Math.abs(world.tick - m.w.tick) > 60) world.tick = m.w.tick;
      latest = { tick: m.w.tick, events: m.ev };
      // Step 3 (the stone plate): the room state as the server sent it, kept apart from the
      // local step, which sees only this page's own body (a plate a friend stands on reads up
      // there every tick). The drawing reads plates from both (src/client/draw/room-parts.ts).
      heardRooms = m.w.rooms ? (clone(m.w.rooms) as World['rooms']) : undefined;
    } else if (m.t === 'fx') {
      // INTENT: the door for "the world did this to your character" (a hit,
      // a hold, a throw, a door: docs/architecture.md, "Effects on a
      // player"). The page owns its character, but not absolutely: it
      // applies what the world did and says so; the server resends until it
      // hears. A copy already applied is acknowledged again, never applied twice.
      if (m.id > lastFx) {
        lastFx = m.id;
        // A push lands on the character where this device has it (no visible
        // jump); for anything else the server's copy is the truth.
        if (m.effect.kind === 'push' && !heldBy(me())) applyEffect(me(), m.effect);
        else if (looksLikeEntity(m.e)) adopt(m.e);
        stats.effects++;
      }
      send({ t: 'ack', id: m.id });
    } else if (m.t === 'tuning') {
      if (m.diff && typeof m.diff === 'object') applyTuningDiff(content.tuning, shipped, m.diff);
      stats.tuningsIn++;
    } else if (m.t === 'pong') {
      const at = pingSent.get(m.n);
      if (at !== undefined) stats.rttMs = now() - at;
      pingSent.delete(m.n);
    }
  };

  const connect = (): void => {
    const mine = ++token;
    open = false;
    lastHeard = now();
    try {
      transport = opts.connect({
        open() {
          if (mine !== token) return;
          open = true;
          lastHeard = now();
          sentFresh = !everWelcomed && !played;
          send({ t: 'join', player, world: opts.world, e: me(), fresh: sentFresh });
        },
        message(text) {
          if (mine === token) onMessage(text);
        },
        close() {
          if (mine === token) drop();
        },
      });
    } catch {
      drop();
    }
  };

  return {
    player,
    /** The local world: this player's own character only. */
    world,
    me,
    stats,
    status: (): NetStatus => status,
    /** The newest server tick heard, and the simulation events that came with it. */
    latest: () => latest,
    /** Step 21: the server's copy of this player's character from the newest snapshot (its `c` is the server's: wear, falls), or null before one. Read only. */
    serverMe: (): Entity | null => serverMe,
    /** Step 3: the room state (`World.rooms`) of the newest snapshot, as sent, untouched by this page's own step; undefined before one. */
    heardRooms: (): World['rooms'] => heardRooms,
    /**
     * Call once per frame with what the player is holding. Steps the local
     * character in whole ticks, and does the network's housekeeping.
     */
    update(input: Input): SimEvent[] {
      const t = now();
      const events: SimEvent[] = [];
      // INTENT: after a pause (a hidden tab, a locked phone) catch up a few
      // ticks at most, never the whole gap, so the game cannot freeze replaying it.
      owed += Math.min((t - last) / 1000, net.maxCatchUpTicks * DT);
      last = t;
      while (owed >= DT) {
        if (input.x !== 0 || input.y !== 0 || input.held.length) played = true;
        // A held character is not simulated here (see 'snap' above); offline, nothing can be holding it.
        if (heldBy(me()) && status !== 'online') applyEffect(me(), { kind: 'release' });
        if (!heldBy(me())) {
          events.push(...step(world, { [player]: input }, content));
          predictor.afterStep(world, me(), input, () => smoother.view(t), t, (times) =>
            // Where the server should have each body when this swing reaches it (a round trip, a report's wait
            // and, DRAFT, a snapshot's wait: measured short of that), `times` over.
            smoother.ahead(t, times * ((stats.rttMs ?? 100) + 1000 / net.reportRate + 1000 / net.snapshotRate)),
          );
        } else world.tick++;
        ticked.push(input);
        if (ticked.length > 12) ticked.shift();
        owed -= DT;
      }
      if (left) return events;
      if (!transport) {
        if (t >= nextAttemptAt) connect();
      } else if (t - lastHeard > (open ? net.silenceMs : CONNECT_MS)) {
        drop();
      } else if (open && status === 'online') {
        if (t - lastReport >= 1000 / net.reportRate - 1) {
          lastReport = t;
          send({ t: 'me', e: me(), i: input, is: ticked, ct: world.tick });
          ticked = [];
        }
        if (t - lastPing >= net.pingMs) {
          lastPing = t;
          pingSent.set(++pingN, t);
          if (pingSent.size > 20) pingSent.clear();
          send({ t: 'ping', n: pingN });
        }
      }
      return events;
    },
    /** Everything in the world that is not this player's character, as it should be drawn now. */
    others(): Entity[] {
      const t = now();
      return predictor.view(smoother.view(t), t);
    },
    /** Step 5 (for checks): how many bodies this page is drawing from its own prediction right now. */
    lent: (): number => predictor.lent(),
    /** Drop the socket (if any) and try again at once: the page became visible, the network changed. */
    kick(): void {
      if (gone) return;
      left = false;
      backoff = net.reconnectFirstMs;
      drop();
      nextAttemptAt = now();
    },
    /** The shipped tuning numbers (content/tuning.json as built), never changed. */
    shippedTuning: shipped,
    /**
     * Step 2 (?tune): change tuning numbers for this whole world. Applied
     * here at once, so play follows the thumb; the server checks them and
     * answers every page with the world's numbers (this one's included,
     * which puts back anything it refused). Offline, only this page changes.
     */
    tune(changes: TuningChange[], reset = false): void {
      if (reset) applyTuningDiff(content.tuning, shipped, {});
      for (const c of changes) applyChange(content.tuning, shipped, c);
      stats.tunesOut++;
      send({ t: 'tune', changes, reset });
    },
    /** Step 17: whether the server set this world aside (and the client stopped reconnecting). */
    isGone(): boolean {
      return gone;
    },
    /** Leave on purpose: the character is removed from the world at once. */
    leave(): void {
      send({ t: 'bye' });
      left = true;
      drop();
    },
  };
}
export type NetClient = ReturnType<typeof createNetClient>;
