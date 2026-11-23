import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/roster.json: every character a player could play, in order
 * (Step 11; D-083). The party (content/party.json) is the members being
 * played from; the roster is everyone unlocked, party included. Every
 * roster character nobody is playing wanders the cantina
 * (docs/mechanisms/cantina.md).
 * Step 13: `start` is who a new game has unlocked; the world's own list
 * is World.roster (src/sim/roster.ts). One roster, never two.
 */
export interface Roster {
  /** Character kind ids, in the order the cantina lists them. */
  characters: string[];
  /**
   * Step 13 (doc 05 "Players begin with a subset", doc 36): who a new
   * shared world or a new kept game starts with unlocked; the rest are
   * found in the world (content/recruits/). Every party member is in it.
   * DRAFT: the canon three and the brawler, so the cantina always has
   * someone to hit and to swap (D-085). Left out: everyone.
   */
  start: string[];
}

declare module '../types.ts' {
  interface Content {
    roster: Roster;
  }
}

const kind: ContentKind = {
  id: 'roster',
  source: { file: 'roster.json' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return { characters: [], start: [] } satisfies Roster;
    read.only(o, ['characters', 'start'], '');
    const characters = read.stringList(o, 'characters', '');
    const out: Roster = { characters, start: o.start === undefined ? [...characters] : read.stringList(o, 'start', '') };
    out.start.forEach((id, i) => {
      if (out.start.indexOf(id) !== i) read.fail(`start[${i}]`, `"${id}" is listed twice`);
      if (!characters.includes(id)) read.fail(`start[${i}]`, `"${id}" is not in the roster's characters (${characters.join(', ')})`);
    });
    out.characters.forEach((id, i) => {
      if (out.characters.indexOf(id) !== i) read.fail(`characters[${i}]`, `"${id}" is listed twice`);
    });
    return out;
  },
  check(content, fail) {
    const file = 'content/roster.json';
    content.roster.characters.forEach((id, i) => {
      if (!(id in content.characters)) fail(file, `characters[${i}]`, `no character "${id}" (characters: ${known(content.characters)})`);
    });
    content.party.members.forEach((id) => {
      if (!content.roster.characters.includes(id)) fail(file, 'characters', `"${id}" is in the party (content/party.json) but not in the roster: every party member is a roster character`);
      else if (!content.roster.start.includes(id)) fail(file, 'start', `"${id}" is in the party (content/party.json) but not in the roster's start: a new game could not play it`);
    });
  },
};
export default kind;
