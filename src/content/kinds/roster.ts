import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/roster.json: every character a player could play, in order
 * (Step 11; D-083). The party (content/party.json) is the members being
 * played from; the roster is everyone unlocked, party included. Every
 * roster character nobody is playing wanders the cantina
 * (docs/mechanisms/cantina.md).
 * DRAFT: the whole roster is unlocked; nothing in the world unlocks anyone
 * yet. One list for Step 13 (heroes you find and keep) too, never two.
 */
export interface Roster {
  /** Character kind ids, in the order the cantina lists them. */
  characters: string[];
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
    if (!o) return { characters: [] } satisfies Roster;
    read.only(o, ['characters'], '');
    const out: Roster = { characters: read.stringList(o, 'characters', '') };
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
    });
  },
};
export default kind;
