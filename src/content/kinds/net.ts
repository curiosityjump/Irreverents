import type { ContentKind } from '../types.ts';

/**
 * content/net.json: the network layer's numbers (docs/mechanisms/network.md).
 * DRAFT: all of them; they live in data so they can be tuned on a real phone
 * without touching code.
 */
export interface Net {
  /** Times a second a page reports its own character to the server. */
  reportRate: number;
  /** Times a second the server sends each page the world. */
  snapshotRate: number;
  /** How far in the past other characters are drawn, so there are two states to draw between. */
  interpDelayMs: number;
  /** Fastest a drawn remote character may travel, pixels per second: a late packet becomes a quick glide, never a teleport. */
  remoteMaxSpeed: number;
  /** How long the server keeps using a player's last reported input before treating them as holding nothing. */
  inputHoldMs: number;
  /** How long a character whose page went away is kept for that page to come back to. */
  staleSeconds: number;
  /** Most simulation ticks run in one go after a stall (server and page). */
  maxCatchUpTicks: number;
  /** First wait before reconnecting; doubles up to reconnectMaxMs. */
  reconnectFirstMs: number;
  reconnectMaxMs: number;
  /** An open socket that has said nothing for this long is treated as dead. */
  silenceMs: number;
  /** How often a page measures its round trip. */
  pingMs: number;
  /** Graybox colours for players, by join order. */
  playerColors: string[];
}

declare module '../types.ts' {
  interface Content {
    net: Net;
  }
}

const kind: ContentKind = {
  id: 'net',
  source: { file: 'net.json' },
  parse(raw, read) {
    const o = read.object(raw, '') ?? {};
    read.only(o, ['reportRate', 'snapshotRate', 'interpDelayMs', 'remoteMaxSpeed', 'inputHoldMs', 'staleSeconds', 'maxCatchUpTicks', 'reconnectFirstMs', 'reconnectMaxMs', 'silenceMs', 'pingMs', 'playerColors', '//colors'], '');
    const out: Net = {
      reportRate: read.number(o, 'reportRate', '', { min: 1, max: 60 }),
      snapshotRate: read.number(o, 'snapshotRate', '', { min: 1, max: 60 }),
      interpDelayMs: read.number(o, 'interpDelayMs', '', { min: 0, max: 1000 }),
      remoteMaxSpeed: read.number(o, 'remoteMaxSpeed', '', { min: 1, max: 100000 }),
      inputHoldMs: read.number(o, 'inputHoldMs', '', { min: 0, max: 10000 }),
      staleSeconds: read.number(o, 'staleSeconds', '', { min: 0, max: 3600 }),
      maxCatchUpTicks: read.number(o, 'maxCatchUpTicks', '', { min: 1, max: 600, integer: true }),
      reconnectFirstMs: read.number(o, 'reconnectFirstMs', '', { min: 10, max: 60000 }),
      reconnectMaxMs: read.number(o, 'reconnectMaxMs', '', { min: 10, max: 60000 }),
      silenceMs: read.number(o, 'silenceMs', '', { min: 500, max: 60000 }),
      pingMs: read.number(o, 'pingMs', '', { min: 100, max: 60000 }),
      playerColors: read.stringList(o, 'playerColors', ''),
    };
    if (out.playerColors.length === 0) read.fail('playerColors', 'needs at least one colour');
    return out;
  },
};
export default kind;
