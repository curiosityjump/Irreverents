import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/heists/<id>.json (Step 19; docs/mechanisms/heists.md): a place
 * with a prize. Its room, and the placed things in that room that are
 * prizes: taken, a prize is carried (world.cargo) until its taker is out of
 * the room on their own feet, then banked (world.banked); a job nobody of
 * the place saw from going in to banking is a clean getaway.
 * Doc 07: heists are discovered opportunities, with no "begin heist" flag:
 * nothing here starts or announces a job.
 * DRAFT: every field (decisions-log "Step 19"). Adding a place is one file.
 */
export interface Heist {
  id: string;
  /** The place's room (content/rooms/). Its placed people (content/placements/<room>.json, those with an `npc`) are the ones whose sight spoils a clean job. */
  room: string;
  /** The prizes: placed things of that room (`once`, deed `take`), with the look shown in the carrier's cargo slot and the look left on the stand once taken. */
  prizes: { thing: string; carried: string; taken?: string }[];
}

declare module '../types.ts' {
  interface Content {
    heists: Record<string, Heist>;
  }
}

const kind: ContentKind = {
  id: 'heists',
  source: { dir: 'heists' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'room', 'prizes'], '');
    const out: Heist = { id: read.string(o, 'id', ''), room: read.string(o, 'room', ''), prizes: [] };
    if (!Array.isArray(o.prizes) || o.prizes.length === 0) read.fail('prizes', `must be a list of at least one { "thing", "carried", "taken"? }, but is ${describe(o.prizes)}`);
    else
      o.prizes.forEach((item: unknown, i: number) => {
        const w = `prizes[${i}]`;
        const p = read.object(item, w);
        if (!p) return;
        read.only(p, ['thing', 'carried', 'taken'], w);
        const prize: Heist['prizes'][number] = { thing: read.string(p, 'thing', w), carried: read.string(p, 'carried', w) };
        if (p.taken !== undefined) prize.taken = read.string(p, 'taken', w);
        out.prizes.push(prize);
      });
    return out;
  },
  check(content, fail) {
    const seen = new Map<string, string>();
    for (const h of Object.values(content.heists ?? {}).sort((a, b) => (a.id < b.id ? -1 : 1))) {
      const file = `content/heists/${h.id}.json`;
      if (!(h.room in content.rooms)) fail(file, 'room', `no room "${h.room}" (rooms: ${known(content.rooms)})`);
      h.prizes.forEach((p, i) => {
        const def = content.placements[h.room]?.things?.find((t) => t.id === p.thing);
        if (!def) return fail(file, `prizes[${i}].thing`, `room "${h.room}" places no thing "${p.thing}" (content/placements/${h.room}.json, "things")`);
        if (!def.once || def.deed !== 'take') fail(file, `prizes[${i}].thing`, `"${p.thing}" must be a once thing whose deed is "take" (a prize is taken and carried)`);
        if (def.restock !== undefined) fail(file, `prizes[${i}].thing`, `"${p.thing}" has a restock: a prize never comes back by itself (put back only by returnPrize)`);
        if (def.keeper !== undefined) fail(file, `prizes[${i}].thing`, `"${p.thing}" has a keeper: a prize is stolen, never bought`);
        const other = seen.get(p.thing);
        if (other !== undefined) fail(file, `prizes[${i}].thing`, `"${p.thing}" is already a prize of "${other}"`);
        seen.set(p.thing, h.id);
      });
    }
  },
};
export default kind;
