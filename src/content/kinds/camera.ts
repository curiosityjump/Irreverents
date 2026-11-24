import type { ContentKind } from '../types.ts';

/**
 * content/camera.json: how each page's own camera leans upward
 * (src/client/camera.ts; docs/mechanisms/rendering-world.md, "The camera
 * leans up"). Drawing only: the simulation never reads it.
 * DRAFT: every number (docs/decisions-log.md, 2026-11-24, "Sideways, the
 * camera looks up at what is aimed at you").
 */
export interface Camera {
  /** How far above an aiming thrower's head the picture keeps (his shot held up), px. */
  aimAbove: number;
  /** How long the camera keeps leaning toward an aim after it ends (his shot in the air, his next aim), s. */
  aimHold: number;
  /** Room above the highest point of his arc, px. */
  aimMargin: number;
  /** While something is aimed, the floor kept under the hero's feet above the touch controls (the band and every button's top, across the picture), px. */
  aimGround: number;
  /** Looking up: the ground kept under the feet above the touch controls' band, px. */
  lookGround: number;
  /** How long the stick is held up while standing before the camera looks up, s. */
  lookStickAfter: number;
  /** How long the camera keeps looking up after the stick is let go or the hero stops rising, s. */
  lookHold: number;
  /** Leaning sideways to clear a thrower from the plate, the hero is kept at least this far inside the picture's sides, px. */
  heroSide: number;
  /** Read only by the jump fact's control (leanControl.jumpOld): the first push leant on every rise faster than this, px/s. */
  riseSpeed: number;
  /** How quickly the camera eases toward where it wants to be: the share of the way covered is 1 − e^(−rate·seconds). */
  easeRate: number;
  /** The fastest it eases, px/s. */
  maxSpeed: number;
  /** A held Up (or a climb) lifts the picture by this share of its height, as far as the hero stays whole on it. */
  lookLift: number;
  /** A landing at least this much higher than the last counts as a climb, px. */
  climbStep: number;
  /** How long the picture stays lifted after a climb's landing, s. */
  climbHold: number;
  /** In a jump, the camera follows only once the hero's head comes within this of the picture's top, px. */
  airTop: number;
}

declare module '../types.ts' {
  interface Content {
    camera: Camera;
  }
}

const FIELDS = ['aimAbove', 'aimMargin', 'aimHold', 'aimGround', 'lookGround', 'lookStickAfter', 'lookHold', 'heroSide', 'riseSpeed', 'easeRate', 'maxSpeed', 'lookLift', 'climbStep', 'climbHold', 'airTop'] as const;

const kind: ContentKind = {
  id: 'camera',
  source: { file: 'camera.json' },
  parse(raw, read) {
    const o = read.object(raw, '') ?? {};
    read.only(o, [...FIELDS], '');
    return {
      aimAbove: read.number(o, 'aimAbove', '', { min: 0, max: 100 }),
      aimMargin: read.number(o, 'aimMargin', '', { min: 0, max: 100 }),
      aimHold: read.number(o, 'aimHold', '', { min: 0, max: 10 }),
      aimGround: read.number(o, 'aimGround', '', { min: 0, max: 100 }),
      lookGround: read.number(o, 'lookGround', '', { min: 0, max: 100 }),
      lookStickAfter: read.number(o, 'lookStickAfter', '', { min: 0, max: 5 }),
      lookHold: read.number(o, 'lookHold', '', { min: 0, max: 10 }),
      heroSide: read.number(o, 'heroSide', '', { min: 0, max: 200 }),
      riseSpeed: read.number(o, 'riseSpeed', '', { min: 0, max: 2000 }),
      easeRate: read.number(o, 'easeRate', '', { min: 0.1, max: 100 }),
      maxSpeed: read.number(o, 'maxSpeed', '', { min: 1, max: 10000 }),
      lookLift: read.number(o, 'lookLift', '', { min: 0, max: 1 }),
      climbStep: read.number(o, 'climbStep', '', { min: 1, max: 200 }),
      climbHold: read.number(o, 'climbHold', '', { min: 0, max: 10 }),
      airTop: read.number(o, 'airTop', '', { min: 0, max: 100 }),
    } satisfies Camera;
  },
};
export default kind;
