import { describe } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/npcs/<id>.json: a kind of person: the part they play (role), whose
 * side they are on, what they do in each of their three moods, and the few
 * words they say. Their body is a separate character kind; where one stands
 * is content/placements/ (docs/mechanisms/npc-response.md).
 *
 * INTENT (D-055, "NO NPCS WILL HAVE AI"): everything a person does is this
 * data plus fixed rules. This is NPC response logic, never AI.
 */
export interface NpcKind {
  id: string;
  /** The part this person plays, e.g. "shopkeeper". Rules are written per role. */
  role: string;
  side: Side;
  /** What the person does in each mood: a behaviour id (BEHAVIOURS). */
  moods: Record<Mood, Behaviour>;
  /** What they say, by cue (a mood cue or a reaction id). A cue with no entry says nothing. */
  barks: Record<string, string>;
  /**
   * Step 18: when a `bad` person whose body lists `attack` fights a hero
   * (src/sim/systems/outpost-fight.ts). `on-sight` (left out): any hero they
   * see, as Step 12's camp and Step 16's quarry kinds do. `when-struck`:
   * only a hero who hit, grabbed or threw them in the last
   * `npcStruckMemory` seconds (src/sim/systems/fight-struck.ts).
   * DRAFT (Step 18): the villain is `when-struck`, so gate C's rob and
   * buy-politely loop stays; recognising a threat is OPEN (D-062, D-070).
   */
  fights: Fights;
  /**
   * Owner's report 2026-11-24 ("enemies don't give chase if you are not right
   * in front of them"). Left out: the world's npcSightRange / npcSightHeight.
   * DRAFT: per kind, so a fighter can see farther than a lookout while the
   * quiet routes past lookouts stay as they were (docs/decisions-log.md,
   * "The chase"). canSee and sightBox both read it: the band is drawn as seen.
   */
  sight?: { range: number; height: number };
  /**
   * Same report: what a `bad` fighter does after losing sight of a hero
   * (src/sim/systems/outpost-fight.ts). Left out: as before, he stands at the
   * last place seen. `on`: pixels he walks on past it, the way the hero was
   * seen going; `time`: seconds he searches there, turning every `turn`
   * seconds; then he walks back to his post. DRAFT numbers.
   */
  search?: { on: number; time: number; turn: number };
  /**
   * Step 5 (the owner's report, "enemies collapse but never die"; src/sim/beaten.ts):
   * for a `bad` person, how he is defeated for good: knocked out `after` times by
   * the players, or flung into a wall or a body at `slam` pixels per second or
   * more. Left out, world.beatenAfter and world.beatenSlam. `false`: never
   * defeated, knocked out and up again as before (the villain, for now).
   * Ignored for a `good` person, who is knocked out, never defeated.
   */
  beaten?: { after?: number; slam?: number } | false;
  /**
   * Step 5 (D-064: a shopkeeper knocked out before reporting lets you rob the
   * shop): for a `good` person, seconds he stays down when knocked out. Left
   * out, world.knockedOutTime. Ignored for a `bad` person.
   */
  knockedOut?: number;
}

export const FIGHTS = ['on-sight', 'when-struck'] as const;
export type Fights = (typeof FIGHTS)[number];

/**
 * INTENT (D-048): exactly three moods. 1 business as usual, 2 confusion /
 * distress, 3 absolute blinding violent rage. Counters and timers sit behind
 * them; a fourth value here is a defect, never a feature.
 */
export type Mood = 1 | 2 | 3;
export const MOODS: Mood[] = [1, 2, 3];

export const SIDES = ['good', 'bad'] as const;
export type Side = (typeof SIDES)[number];

/** The fixed things a person can be doing. Each is implemented once, in src/sim/npc/behaviours.ts. */
export const BEHAVIOURS = ['routine', 'plead', 'charge'] as const;
export type Behaviour = (typeof BEHAVIOURS)[number];

/** The role every player's character has, whichever body it is. */
export const HERO_ROLE = 'hero';

/** The cues the mood rules themselves raise; a reaction's id is a cue too. */
export const MOOD_CUES = ['distress', 'rage', 'reassured'];

/** INTENT (D-057): very little dialogue. A bark is a symbol or at most three words. */
export const BARK_MAX_WORDS = 3;

declare module '../types.ts' {
  interface Content {
    npcs: Record<string, NpcKind>;
  }
}

const kind: ContentKind = {
  id: 'npcs',
  source: { dir: 'npcs' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'role', 'side', 'moods', 'barks', 'fights', 'sight', 'search', 'beaten', 'knockedOut'], '');
    const out: NpcKind = {
      id: read.string(o, 'id', ''),
      role: read.string(o, 'role', ''),
      side: 'good',
      moods: { 1: 'routine', 2: 'plead', 3: 'charge' },
      barks: {},
      fights: 'on-sight',
    };
    if (o.fights !== undefined) {
      if (FIGHTS.includes(o.fights as Fights)) out.fights = o.fights as Fights;
      else read.fail('fights', `must be one of ${FIGHTS.join(', ')}, or left out (on-sight), but is ${describe(o.fights)}`);
    }
    if (o.sight !== undefined) {
      const v = read.object(o.sight, 'sight');
      if (v) {
        read.only(v, ['range', 'height'], 'sight');
        out.sight = { range: read.number(v, 'range', 'sight', { min: 0, max: 2000 }), height: read.number(v, 'height', 'sight', { min: 0, max: 2000 }) };
      }
    }
    if (o.search !== undefined) {
      const v = read.object(o.search, 'search');
      if (v) {
        read.only(v, ['on', 'time', 'turn'], 'search');
        out.search = { on: read.number(v, 'on', 'search', { min: 0, max: 2000 }), time: read.number(v, 'time', 'search', { min: 0, max: 60 }), turn: read.number(v, 'turn', 'search', { min: 0.1, max: 60 }) };
      }
    }
    if (o.beaten === false) out.beaten = false;
    else if (o.beaten !== undefined) {
      const b = read.object(o.beaten, 'beaten');
      if (b) {
        read.only(b, ['after', 'slam'], 'beaten');
        const rule: { after?: number; slam?: number } = {};
        if (b.after !== undefined) {
          if (typeof b.after === 'number' && Number.isInteger(b.after) && b.after >= 1 && b.after <= 100) rule.after = b.after;
          else read.fail('beaten.after', `must be a whole number from 1 to 100 (how many knock-outs defeat him), but is ${describe(b.after)}`);
        }
        if (b.slam !== undefined) {
          if (typeof b.slam === 'number' && b.slam > 0 && b.slam <= 2000) rule.slam = b.slam;
          else read.fail('beaten.slam', `must be a speed above 0 and at most 2000 pixels per second, but is ${describe(b.slam)}`);
        }
        out.beaten = rule;
      }
    }
    if (o.knockedOut !== undefined) {
      if (typeof o.knockedOut === 'number' && o.knockedOut >= 0.1 && o.knockedOut <= 600) out.knockedOut = o.knockedOut;
      else read.fail('knockedOut', `must be seconds from 0.1 to 600, but is ${describe(o.knockedOut)}`);
    }
    if (out.role === HERO_ROLE) read.fail('role', `"${HERO_ROLE}" is the role of the players' characters; a person needs another`);
    if (SIDES.includes(o.side as Side)) out.side = o.side as Side;
    else read.fail('side', `must be one of ${SIDES.join(', ')}, but is ${describe(o.side)}`);

    const moods = read.object(o.moods, 'moods');
    if (moods) {
      read.only(moods, MOODS.map(String), 'moods');
      for (const m of MOODS) {
        const b = moods[String(m)];
        if (BEHAVIOURS.includes(b as Behaviour)) out.moods[m] = b as Behaviour;
        else read.fail(`moods.${m}`, `must be one of ${BEHAVIOURS.join(', ')}, but is ${describe(b)} (every person has exactly the three moods 1, 2 and 3)`);
      }
    }
    const barks = read.object(o.barks ?? {}, 'barks');
    if (barks) {
      for (const cue of Object.keys(barks)) {
        if (cue === '//') continue;
        const text = barks[cue];
        if (typeof text !== 'string' || text.trim() === '') read.fail(`barks.${cue}`, `must be non-empty text, but is ${describe(text)}`);
        else if (text.trim().split(/\s+/).length > BARK_MAX_WORDS) {
          read.fail(`barks.${cue}`, `"${text}" is more than ${BARK_MAX_WORDS} words: a bark is a symbol or at most ${BARK_MAX_WORDS} words`);
        } else out.barks[cue] = text;
      }
    }
    return out;
  },
};
export default kind;
