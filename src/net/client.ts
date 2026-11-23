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
import { clone, looksLikeEntity, playerEntityId } from './protocol.ts';
import type { ClientMessage, ServerMessage } from './protocol.ts';
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
}

export type NetStatus = 'connecting' | 'online' | 'reconnecting';

export function createNetClient(opts: NetClientOptions) {
  const { content, player, now } = opts;
  const net = content.net;
  const myId = playerEntityId(player);

  // INTENT: the page's own character lives in a world of its own and is
  // stepped here, on this device, the moment the input arrives; the network
  // only reports it. That is what keeps movement instant on a slow
  // connection, and what lets one person play with no server at all
  // (docs/plan/step-1.md: "Solo works with the same build").
  // DRAFT: this local world holds only the player's own character. A verb
  // that must see others on this device (to aim, or to know which party
  // member is free) does not yet; see docs/mechanisms/network.md.
  const world: World = createWorld();
  // No character passed: the simulation seats the player in the party
  // (src/sim/world.ts). The server's seat replaces this one on first joining.
  spawnPlayer(world, content, { player, room: content.game.startRoom });
  const me = (): Entity => world.entities.find((e) => e.id === myId)!;

  const smoother = createSmoother(net);
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
  let latest: { tick: number; events: SimEvent[] } = { tick: 0, events: [] };
  /** The newest effect applied; effect ids only ever grow, so a resent copy is recognised. */
  let lastFx = 0;
  /** What was held on each local tick since the last report. */
  let ticked: Input[] = [];
  const stats = { connects: 0, rttMs: null as number | null, msgsIn: 0, bytesIn: 0, msgsOut: 0, bytesOut: 0, effects: 0 };
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
      if (Math.abs(world.tick - m.w.tick) > 60) world.tick = m.w.tick;
      latest = { tick: m.w.tick, events: m.ev };
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
        if (!heldBy(me())) events.push(...step(world, { [player]: input }, content));
        else world.tick++;
        ticked.push(input);
        if (ticked.length > 12) ticked.shift();
        owed -= DT;
      }
      if (left) return events;
      if (!transport) {
        if (t >= nextAttemptAt) connect();
      } else if (t - lastHeard > net.silenceMs) {
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
      return smoother.view(now());
    },
    /** Drop the socket (if any) and try again at once: the page became visible, the network changed. */
    kick(): void {
      left = false;
      backoff = net.reconnectFirstMs;
      drop();
      nextAttemptAt = now();
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
