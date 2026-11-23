import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/** content/game.json: DRAFT: where a player starts, and as whom. */
export interface Game {
  startRoom: string;
  playerCharacter: string;
}

declare module '../types.ts' {
  interface Content {
    game: Game;
  }
}

const kind: ContentKind = {
  id: 'game',
  source: { file: 'game.json' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return { startRoom: '', playerCharacter: '' } satisfies Game;
    read.only(o, ['startRoom', 'playerCharacter'], '');
    const out: Game = {
      startRoom: read.string(o, 'startRoom', ''),
      playerCharacter: read.string(o, 'playerCharacter', ''),
    };
    return out;
  },
  check(content, fail) {
    const g = content.game;
    if (!(g.startRoom in content.rooms)) {
      fail('content/game.json', 'startRoom', `no room "${g.startRoom}" (rooms: ${known(content.rooms)})`);
    } else if (content.rooms[g.startRoom]!.spawns.length === 0) {
      fail('content/game.json', 'startRoom', `room "${g.startRoom}" has no spawn tile for a player to start on`);
    }
    if (!(g.playerCharacter in content.characters)) {
      fail('content/game.json', 'playerCharacter', `no character "${g.playerCharacter}" (characters: ${known(content.characters)})`);
    }
  },
};
export default kind;
