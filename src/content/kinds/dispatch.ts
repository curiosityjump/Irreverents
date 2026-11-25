import { describe, known } from '../reader.ts';
import { TILE } from './rooms.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/dispatch/<area>.json: who the town sends when an area's alert goes
 * up (Step 4, the town's tiers). Which walk doors help comes in by, the most
 * people the area's room holds at once, and one row of people per alert
 * level reached. Writeup: docs/mechanisms/npc-response.md, "The town's tiers".
 *
 * INTENT (D-055): scripted, never AI. A row is data; the fixed systems
 * src/sim/systems/alert-whistle.ts and alert-dispatch.ts do the rest.
 * INTENT: an area with no dispatch file has no whistle and no rows: it
 * behaves as Step 4's slice 2 built it (test-street, test-shop, the camp).
 * DRAFT: doc 26's ladder is "finite illustrative design"; every row, the cap
 * and the doors are first guesses (docs/decisions-log.md, "Step 4: dispatch").
 */
export interface Dispatch {
  /** The area (tonight a room id); the file is named after it. */
  id: string;
  /** Walk doors of the area's room the rows come in by, split between them in turn. */
  doors: string[];
  /** The most people (bodies with an NPC kind) in the room at once; a row waits while it would not fit. */
  cap: number;
  /**
   * rows[k] walks in when the alert reaches level k + 1 (an empty row sends
   * nobody: the people already placed answer). A completed call with the
   * alert already at its most sends the last row again, under the cap.
   */
  rows: { character: string; npc: string; rides?: string }[][];
  /** Words of the banner when the alert reaches level k + 1 (push 2's page; "" for none). No digits. */
  banners: string[];
  /**
   * DRAFT (the owner, 2026-11-24: "Alarms should spawn more enemies of
   * increasing strength that come in from the sides"): floor tiles
   * `[column, row]` a row may walk in at, instead of beside the doors. Each
   * row is split between the left and the right of the place reported: on
   * each side the nearest entry at least `entryAway` tiles off, else the
   * farthest there (the outposts' rule, `docs/mechanisms/outposts.md`, "From
   * the sides"). Empty (left out): beside the doors, as before.
   */
  entries: [number, number][];
  /** Tiles an entry must be from the place reported (default 0). 12 is about half a phone screen. */
  entryAway: number;
  /** Words shown as each row walks in (row k's, the last repeating); empty: the room's default words. No digits. */
  announce: string[];
  /**
   * DRAFT (the escalating guard response, 2026-11-25; the brief's "all-out":
   * "the last row keeps coming on each completed call AND on a timer while
   * any responder still sees a hero, under the cap"): seconds. With the alert
   * at its most, while any responder of the area sees a hero, the last row is
   * queued again every this many seconds (one waiting at a time, as a call's).
   * It never raises the alert (D-063): the level is already at its most, by
   * completed calls. 0 (left out): only calls bring rows.
   */
  keepComing: number;
  /**
   * DRAFT (the orchestrator's ruling, 2026-11-25, "the stronger relieve the weaker": a row that arrives a
   * minute after its banner is no escalation a player feels, and the cap is there for a phone's legibility
   * and frame time): characters of an earlier row who may be stood down to make room when a higher row is
   * due and the area is at its cap. They walk out by their door, and are gone once they reach it or are
   * more than `entryAway` tiles from every hero (off a phone's screen). Empty (left out): rows wait.
   */
  relieve: string[];
  /**
   * DRAFT (the escalating guard response, push 2, 2026-11-25; the brief's "One town-wide level"): the areas whose
   * tables name the same town share one level for raising. A completed call in any of them raises its own area to one
   * above the town's highest (src/sim/npc/alert.ts, raiseAlert), so the level a player reads is the town's and that
   * level's row comes to the room the report names. A follower of one of them who blows his whistle in another of
   * them reports the room he is in (alert-whistle). Each area still cools on its own clock; the pips show the highest.
   * "" (left out): the area is a town of its own, as before.
   */
  town: string;
  /**
   * DRAFT (the escalating guard response, push 2; "rows never arrive on top of a hero", there is always a way out):
   * tiles. A row's door (or entry) where a hero stands within this many tiles of the spot someone would walk in at
   * is not used; with none left, the row waits. 0 (left out): as before.
   */
  clearOf: number;
  /**
   * DRAFT (the escalating guard response, push 3, "a player can tell it is ending"; doc 26's ways the response ends):
   * words of the banner when the alert drops TO level k (calm[0]: the alert is over; one per level below the most).
   * No digits. Empty (left out): a drop shows no banner, as before.
   */
  calm: string[];
}

declare module '../types.ts' {
  interface Content {
    dispatch: Record<string, Dispatch>;
  }
}

const kind: ContentKind = {
  id: 'dispatch',
  source: { dir: 'dispatch' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'doors', 'cap', 'rows', 'banners', 'entries', 'entryAway', 'announce', 'keepComing', 'relieve', 'town', 'clearOf', 'calm'], '');
    const out: Dispatch = {
      id: read.string(o, 'id', ''),
      doors: read.stringList(o, 'doors', ''),
      cap: read.number(o, 'cap', '', { min: 1, max: 64, integer: true }),
      rows: [],
      banners: o.banners === undefined ? [] : read.stringList(o, 'banners', ''),
      entries: [],
      entryAway: o.entryAway === undefined ? 0 : read.number(o, 'entryAway', '', { min: 0, max: 200, integer: true }),
      announce: o.announce === undefined ? [] : read.stringList(o, 'announce', ''),
      keepComing: o.keepComing === undefined ? 0 : read.number(o, 'keepComing', '', { min: 0, max: 600 }),
      relieve: o.relieve === undefined ? [] : read.stringList(o, 'relieve', ''),
      town: o.town === undefined ? '' : read.string(o, 'town', ''),
      clearOf: o.clearOf === undefined ? 0 : read.number(o, 'clearOf', '', { min: 0, max: 200, integer: true }),
      calm: o.calm === undefined ? [] : read.stringList(o, 'calm', ''),
    };
    if (o.entries !== undefined) {
      if (!Array.isArray(o.entries)) read.fail('entries', `must be a list of [column, row] tiles, but is ${describe(o.entries)}`);
      else
        o.entries.forEach((t: unknown, i: number) => {
          if (!Array.isArray(t) || t.length !== 2 || !t.every((n) => Number.isInteger(n) && n >= 0)) read.fail(`entries[${i}]`, `must be [column, row] (whole numbers), but is ${describe(t)}`);
          else out.entries.push([t[0] as number, t[1] as number]);
        });
    }
    out.announce.forEach((b, i) => {
      if (/[0-9]/.test(b)) read.fail(`announce[${i}]`, `"${b}" has a digit; nothing drawn shows numbers`);
    });
    if (out.doors.length === 0) read.fail('doors', 'must name at least one walk door of the room');
    if (!Array.isArray(o.rows) || o.rows.length === 0) {
      read.fail('rows', `must be a list of at least one row (each a list of { "character", "npc" }, empty for nobody), but is ${describe(o.rows)}`);
      return out;
    }
    o.rows.forEach((row: unknown, i: number) => {
      const w = `rows[${i}]`;
      if (!Array.isArray(row)) {
        read.fail(w, `must be a list of { "character", "npc" } (empty for nobody), but is ${describe(row)}`);
        return;
      }
      const people: Dispatch['rows'][number] = [];
      row.forEach((item: unknown, k: number) => {
        const p = read.object(item, `${w}[${k}]`);
        if (!p) return;
        read.only(p, ['character', 'npc', 'rides'], `${w}[${k}]`);
        const person: Dispatch['rows'][number][number] = { character: read.string(p, 'character', `${w}[${k}]`), npc: read.string(p, 'npc', `${w}[${k}]`) };
        // DRAFT (the escalating guard response; the outposts' `rides`, content/outposts/): a machine he walks in at the reins of.
        if (p.rides !== undefined) person.rides = read.string(p, 'rides', `${w}[${k}]`);
        people.push(person);
      });
      out.rows.push(people);
    });
    out.banners.forEach((b, i) => {
      if (/[0-9]/.test(b)) read.fail(`banners[${i}]`, `"${b}" has a digit; nothing drawn shows numbers`);
    });
    out.calm.forEach((b, i) => {
      if (/[0-9]/.test(b)) read.fail(`calm[${i}]`, `"${b}" has a digit; nothing drawn shows numbers`);
    });
    if (out.calm.length > out.rows.length) read.fail('calm', `has ${out.calm.length} words, but the alert can only drop to ${out.rows.length} levels (0 to ${out.rows.length - 1})`);
    return out;
  },
  check(content, fail) {
    // A town's areas share one level, so they must agree on how many levels there are (one row each).
    for (const d of Object.values(content.dispatch)) {
      if (!d.town) continue;
      const other = Object.values(content.dispatch).find((x) => x.town === d.town && x.rows.length !== d.rows.length);
      if (other) fail(`content/dispatch/${d.id}.json`, 'rows', `${d.rows.length} rows, but "${other.id}" of the same town ("${d.town}") has ${other.rows.length}: a town's areas share one level, so they need one row per level each`);
    }
    for (const d of Object.values(content.dispatch)) {
      const file = `content/dispatch/${d.id}.json`;
      const room = content.rooms[d.id];
      if (!room) {
        fail(file, 'id', `no room "${d.id}" (an area is a room tonight; rooms: ${known(content.rooms)})`);
        continue;
      }
      d.doors.forEach((id, i) => {
        const door = room.doors.find((x) => x.id === id);
        if (!door) fail(file, `doors[${i}]`, `room "${room.id}" has no door "${id}"`);
        else if (door.use !== 'walk' || (door.side !== 'west' && door.side !== 'east')) fail(file, `doors[${i}]`, `"${id}" must be a walk door on the west or east edge (people walk in beside it)`);
      });
      d.entries.forEach(([col, row], i) => {
        if (col >= room.w || row >= room.h) fail(file, `entries[${i}]`, `[${col}, ${row}] is outside the room (${room.w} by ${room.h})`);
        else if (room.cells[row * room.w + col] !== TILE.empty || room.cells[(row + 1) * room.w + col] === TILE.empty) fail(file, `entries[${i}]`, `[${col}, ${row}] must be an open tile standing on solid floor`);
        else if (room.doors.some((x) => x.use === 'walk' && col >= x.tx && col < x.tx + x.w && row >= x.ty && row < x.ty + x.h)) fail(file, `entries[${i}]`, `[${col}, ${row}] is in a walk door: whoever stands there is carried out`);
      });
      d.relieve.forEach((c, i) => {
        if (!(c in content.characters)) fail(file, `relieve[${i}]`, `no character "${c}" (characters: ${known(content.characters)})`);
      });
      const placed = (content.placements[d.id]?.place ?? []).filter((p) => p.npc !== undefined).length;
      d.rows.forEach((row, i) => {
        if (placed + row.length > d.cap) fail(file, `rows[${i}]`, `${row.length} people and the ${placed} placed are more than the cap (${d.cap}): this row could never walk in`);
        row.forEach((p, k) => {
          if (!(p.character in content.characters)) fail(file, `rows[${i}][${k}].character`, `no character "${p.character}" (characters: ${known(content.characters)})`);
          if (!(p.npc in content.npcs)) fail(file, `rows[${i}][${k}].npc`, `no NPC kind "${p.npc}" (kinds: ${known(content.npcs)})`);
          if (p.rides !== undefined && !(p.rides in (content.machines ?? {}))) fail(file, `rows[${i}][${k}].rides`, `no machine "${p.rides}" (machines: ${known(content.machines ?? {})})`);
        });
      });
    }
  },
};
export default kind;
