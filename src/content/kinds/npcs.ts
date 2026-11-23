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
}

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
    read.only(o, ['id', 'role', 'side', 'moods', 'barks'], '');
    const out: NpcKind = {
      id: read.string(o, 'id', ''),
      role: read.string(o, 'role', ''),
      side: 'good',
      moods: { 1: 'routine', 2: 'plead', 3: 'charge' },
      barks: {},
    };
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
