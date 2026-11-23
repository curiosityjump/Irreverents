import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/** content/game.json: DRAFT: where a player starts, and as whom. */
export interface Game {
  startRoom: string;
  /**
   * DRAFT: the room the kingdom is entered from, for the map checks
   * (src/sim/check-rooms.ts), while the game still starts in a standalone
   * test room. Left out, it is startRoom. Drop it from game.json when
   * startRoom becomes a room with doors.
   */
  mapStart?: string;
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
    read.only(o, ['startRoom', 'playerCharacter', 'mapStart'], '');
    const out: Game = {
      startRoom: read.string(o, 'startRoom', ''),
      playerCharacter: read.string(o, 'playerCharacter', ''),
      ...(o.mapStart === undefined ? {} : { mapStart: read.string(o, 'mapStart', '') }),
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
    if (g.mapStart !== undefined) {
      if (!(g.mapStart in content.rooms)) fail('content/game.json', 'mapStart', `no room "${g.mapStart}" (rooms: ${known(content.rooms)})`);
      else if (content.rooms[g.mapStart]!.spawns.length === 0) fail('content/game.json', 'mapStart', `room "${g.mapStart}" has no spawn tile for a player to start on`);
    }
    if (!(g.playerCharacter in content.characters)) {
      fail('content/game.json', 'playerCharacter', `no character "${g.playerCharacter}" (characters: ${known(content.characters)})`);
    }
  },
};
export default kind;
