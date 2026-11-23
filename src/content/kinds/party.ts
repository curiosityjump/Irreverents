import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/party.json: the one shared party (D-012, D-013). Each player
 * controls one member; a member nobody is playing is a candidate for
 * switching (library doc 05). Rules: docs/mechanisms/party-and-switching.md.
 * DRAFT: the count and the order are provisional (O-003 is open).
 */
export interface Party {
  /** Character kind ids, in the order new players get them and `switch` cycles. */
  members: string[];
}

declare module '../types.ts' {
  interface Content {
    party: Party;
  }
}

const kind: ContentKind = {
  id: 'party',
  source: { file: 'party.json' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return { members: [] } satisfies Party;
    read.only(o, ['members'], '');
    const out: Party = { members: read.stringList(o, 'members', '') };
    if (out.members.length === 0) read.fail('members', 'the party needs at least one member');
    out.members.forEach((id, i) => {
      if (out.members.indexOf(id) !== i) read.fail(`members[${i}]`, `"${id}" is listed twice: each member is one character`);
    });
    return out;
  },
  check(content, fail) {
    content.party.members.forEach((id, i) => {
      if (!(id in content.characters)) {
        fail('content/party.json', `members[${i}]`, `no character "${id}" (characters: ${known(content.characters)})`);
      }
    });
  },
};
export default kind;
