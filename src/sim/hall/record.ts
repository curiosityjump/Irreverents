// The Hall of Legends record: the one shape shared by the detector that
// makes a record (src/sim/systems/hall-detect.ts), the pedestal entity that
// carries it in the world, the store that keeps it across restarts and the
// page that shows it (docs/plan/step-7.md; docs/mechanisms/hall-of-legends.md).
// Types and constants only: nothing here runs.

/**
 * One remembered feat.
 * INTENT: additive only from `v: 1`. Stored records outlive every deploy,
 * so a field is never renamed, removed or given a new meaning; a new field
 * is optional. Everything is plain JSON and small: a pedestal entity is
 * sent to every phone many times a second (budget: 500 bytes of JSON for
 * the whole pedestal entity).
 */
export interface HallRecord {
  /** The shape's version. */
  v: 1;
  /** 1, 2, 3… in the order hung. */
  n: number;
  /** A kind id from content/hall/ (`kinds`). */
  kind: string;
  /** Made from that kind's title templates when the feat was recognised. Shown text. */
  title: string;
  /** The room id it happened in. */
  place: string;
  /** How long the episode lasted, in simulation ticks (60 a second). */
  ticks: number;
  /**
   * INTENT (D-026): everyone who took part is credited, whoever started or
   * finished it. `name` stays unset until a step publishes player names.
   */
  who: { player: string; character: string; name?: string }[];
  /** Stat id (content/hall/, `stats`) -> number. */
  stats: Record<string, number>;
  score: number;
  /**
   * The picture: who stood where at the chosen moment, in whole pixels.
   * No pixels are stored; the page redraws it small. At most FRAME_MAX_BODIES
   * bodies: the credited players first, then the nearest to them.
   */
  frame: { room: string; bodies: FrameBody[] };
  /** A date, stamped by the server when it saves. Never by the simulation, which has no clock. */
  at?: string;
}

/** One body in a record's picture. x,y is the top-left of its box in the room, whole pixels. */
export type FrameBody = [kind: string, x: number, y: number, facing: 1 | -1, flags: number];

/** `flags` bit: this body is a credited player's. */
export const FRAME_CREDITED = 1;
/** `flags` bit: this body was knocked out at that moment. */
export const FRAME_OUT = 2;
/** The most bodies a picture holds. */
export const FRAME_MAX_BODIES = 10;

/** The character kind (content/characters/) of the body a record hangs on. Its entity id is `hall:<n>`. */
export const PEDESTAL_KIND = 'pedestal';
/** The entity id of record number `n`'s pedestal. */
export const pedestalId = (n: number): string => `hall:${n}`;

declare module '../types.ts' {
  interface Components {
    /** On a pedestal entity (`hall:<n>`): the record it shows. It rides on the body, so it survives being thrown. */
    hall?: { record: HallRecord };
  }
}
