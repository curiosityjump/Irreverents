# Step 11, slice A: the cantina and its endless brawl

**Brief** (scratch; deleted when this slice ships). Written by the Step 11
lead, `session_017WiGzFy3MD6ecvM7QMvQGd`, 2026-11-23, against `main` at
17d8c1b (`npm run check` green there). Run `docs/sop.md`. The plan step is
`docs/plan/step-11.md`; read its "What's decided" and "Feedback signal".
This slice is signals 1 to 5, the first half of 6, the door, and the
counter. **Not** the tap, the row or the swap (slice B), **not** the chase
lock (slice B), **not** the best score (dropped tonight).


**Changed 14:30 UTC (also sent to the worker by message):** Step 2's lead
agreed item 7 on three conditions: its friend scenarios stay green
unchanged; the player-on-player `friend` test stays as it is and only its
share reads `c.brawl` (a non-player hit never does); the two new
characters are roster-only, never in `content/party.json`. Read
`attack.ts` fresh (wind-up/strike/recover since 252e5ce); one line under
the friend rule in `docs/mechanisms/combat-and-impact.md`. **First push:
something the owner can walk into from the street and fight in**; the
counter, the rest of the scenarios and the real-server check follow.

## The task

Off the castle street is a tavern. Inside it, every character in the
roster that nobody is playing wanders a short loop. Hit one and a bar fight
starts: everyone in the room is in it, friends included. Anyone launched
past the arena's edge, or knocked flat, is back on a spawn pad at once,
and a small counter on screen keeps each player's knock-outs and falls.
When nobody has attacked for a few seconds, or the last player walks out,
it settles and the regulars go back to wandering.

**Measure-table row:** none directly (no build gate covers the cantina).
It is what the owner named as missing ("I haven't seen any levels being
built, enemies, the cantina, etc.", ~14:30 UTC), so say at phase 5 that it
moves what they see, not M1–M3.

## The derivation, already done (re-check, don't re-derive)

**Combat today** (`docs/mechanisms/combat-and-impact.md` first):
- A player's attack does reach another player but is scaled to nothing:
  `src/sim/verbs/attack.ts:139-146` multiplies launch by
  `world.friendAttackLaunch` and wear by `world.friendAttackWear`, both
  `0` in `content/tuning.json:44-45`; throw wear on a friend by
  `friendThrowWear: 0` (tuning.json:46) through `friendly()` in
  `src/sim/systems/impact-walls.ts:7-11,73` and `impact-bodies.ts:66-67`.
  Scenarios `step2-hit-friend-attack-harmless` and `step2-hit-throw-friend`
  hold that rule and must keep passing.
- Knocked out = `c.flattened {ticksLeft, by}` when `c.worn.amount` reaches
  toughness (`src/sim/body-state.ts:169-180`), lying for `flattenTime` 3 s.
  Flying is `c.flying {by, …}`, at most `flyMaxTime` 3 s. The last hitter
  is `c.lastHit {tick, by}` (attack.ts:29). **Nothing in `src/sim` removes
  or respawns a body**; there is no ring-out.
- Events (all carry `tick`): `attacked {by, player}`, `hit {by, target,
  player}`, `thrown`, `released`, `impact {entity, player, other, speed}`,
  `flattened {target, by}`, `recovered {target}`, `landed`.

**Rooms** (`docs/mechanisms/rooms-and-doors.md` first): anything outside a
room's rows reads as solid (`src/sim/room-state.ts:19`), so **a body can
never leave the room's bounds**. The ring-out edge therefore has to be an
authored line *inside* the room, with open air between it and the walls.
Doors are `{id, use: "walk"|"enter", to, hidden?}`
(`src/content/kinds/rooms.ts:193`); an enter door fires only on a fresh
stick push to `y <= -0.5` (`room-doors.ts:80-93`) and carries any body.
A thrown body never leaves by an enter door; a regular never pushes up.

**The party** (`docs/mechanisms/party-and-switching.md` first):
`content/party.json` is `grappler, infiltrator, flyer`; content only
(`World` is `tick`, `entities`, `rooms?`). **Unplayed members are not in
the world today.** `switch` cycles party members nobody plays.
`memberTaken` counts players only. There is no roster and nothing in `src`
says "roster".

**People** don't see anything here unless they have `c.npc`: witnesses are
`c.npc` bodies in the same room (`npc-witness.ts:105`); a `deed` with no
witness changes no mood and no alert (`alert-cool.ts:36-43`). So
**regulars must never get `c.npc`** and must not be placed through Step 4's
placements routines (those are NPCs). Then a brawl raises nothing, for
free.

**The network** (`docs/mechanisms/network.md`, read all of it before
writing a system): each page runs `step()` on a world holding **only its
own character**; the server runs everything and sends the whole world.
The page owns its body's top-level fields (`x`, `y`, speeds, `room`,
`kind`); the server owns `c`. The server never moves a player except by
an effect (`src/sim/effects.ts`): `move {room, x, y}` already exists ("a
door, a respawn") and makes the page take the server's copy, `c`
included. **`move` has never been run across two pages** (network.md,
"Known limits").

## What to build

1. **`content/roster.json`** and its kind file: the unlocked characters,
   in order. `DRAFT:` all unlocked; starts as the three party members plus
   two new roster characters. Checked against `content.characters`; party
   members must be in it.
2. **Two new characters** in `content/characters/` with their tuning
   sections in `content/tuning.json` (additive sections at the end), using
   only existing verbs (D-008). Ids are the function, not a name (e.g. a
   heavy brawler and a light quick one: your call, `DRAFT:`, names are
   data). Colours distinct from the three.
3. **The cantina room**, new file `content/rooms/cantina.json`: doc 31's
   cheap layout, one screen or a little more, a main floor, a raised side
   platform, open air past both ends of the floor and above, and an
   enter door (`to: castle-street`). Spawn pads for the brawl are in the
   cantina file below, not in the room.
4. **The door from the street**: in `content/rooms/castle-street.json`, an
   enter doorway at **column 20, rows 9-10** (ground level between the two
   buildings; column 28 is `street-doorway`, the guard patrols 37-42), door
   id `to-cantina`, an unused legend character. That and the cantina's own
   door are the only room edits. Both rooms' checks must pass
   (`controls/rooms/`). The doorway inside the cantina sits on the floor at
   one end, **away from the pads and the fighting floor**: up with attack
   is the launcher, so a player fighting in the doorway would leave.
5. **`content/cantina/<room id>.json`** and its kind file: `room`, `edge`
   (a rectangle in tiles; a body whose middle is outside it is out),
   `pads` (tiles), `calmTime` (s), the three brawl friend numbers, and one
   `pattern` per roster character: a walking loop (columns and waits) and a
   fight pattern (e.g. how near it closes, how often it swings, when it
   jumps). **Deterministic: no random numbers**; vary by tick and by
   character. Data, not code: a new character's pattern is a JSON edit.
6. **Systems named `cantina-*`** (self-registering; pick orders that read
   the events they need, see `src/sim/registry.ts`):
   - **Regulars.** One body per roster character nobody is playing, in the
     cantina, id `cantina:<kind>`, never `c.npc`. A player switching into
     that kind → its regular goes; a player switching away or leaving →
     it comes back on a pad. They walk their loop by writing `c.input`
     (`inputOf`, body-state.ts:96-98; `src/sim/systems/verbs.ts:6-14`).
     **They must exist only in the server's world**: the page runs the
     same systems on a world with only its own character and must not
     grow regulars. The alert's pattern (an `~alert:<room>` entity
     created where the world is made) is the model: put the brawl's
     state on one `~cantina:<room>` entity created by `populateRoom` /
     `makeWorld` (read `src/server/game.ts` `makeWorld` and
     `src/sim/world.ts`), and have every cantina system do nothing in a
     world without it. Check how Step 4 does this before choosing.
   - **The brawl.** A `hit` landing on a regular, by a player, in the
     cantina starts it (an `attacked` swing that misses does not; nothing
     else does). While on: every body in the room carries `c.brawl` with
     the three friend numbers, and regulars run their fight pattern. It
     ends when no `attacked` happened in the room for `calmTime`, or no
     player is in the room. `c.brawl` is removed from a body **the tick it
     leaves the room or the brawl ends**: a friend in the street must
     stay harmless.
   - **Out and back.** In a brawl, a body whose middle leaves `edge`, or
     that is flattened, counts a fall for itself and a knock-out for
     whoever sent it (`c.flying.by`, else `c.flattened.by`, else
     `c.lastHit.by`; none if it was nobody), and is put on the next pad at
     once: flying, flattened, worn, held and carried cleared, standing
     still. A player only via `emitEffect(… {kind: 'move'})`; check that
     `move` really brings `c` across (network.md says the page takes the
     server's copy) or the page will still think it is flying.
     Outside a brawl, a body that somehow leaves the edge is put back too
     (no score). `DRAFT:` all of these choices.
   - **The counter** lives on `~cantina:<room>`: per player entity, knock-
     outs and falls, kept for the brawl, reset when the next one starts.
     Emit `cantina-brawl-start`, `cantina-brawl-end {why}`, `cantina-out
     {entity, player, by}` so scenarios can see it.
7. **Step 2's three read sites** read `c.brawl` first:
   `o.c.brawl?.attackLaunch ?? world.friendAttackLaunch ?? 0` and the same
   for `attackWear`, and `throwWear` in `friendly()`'s wear. Declare
   `c.brawl` in your own system file. **Nothing else in Step 2's files.**
   This shape was sent to Step 2's lead; if `docs/for-the-lead.md` or the
   step file says otherwise when you start, follow that.
8. **The counter on screen**: new `src/client/draw/cantina.ts`, one line in
   `src/client/render.ts`. Each player's knock-outs and falls, at the top of
   the view, readable on a phone-sized view (look at how `draw/hall.ts`
   and `draw/npcs.ts` draw text; use the bigger of them), only while a
   brawl is on, and **no number over any hit** (D-020, "impact over
   numbers"). Players by their colour, not a name.
9. **`docs/architecture.md`**: a short "How to add a roster character or a
   fight pattern" (the files, in order) and Step 11's row in "Which paths
   each plan step owns" (`content/cantina/**`, `content/roster.json`, their
   kind files, `content/rooms/cantina.json`, systems `cantina-*`,
   `src/client/draw/cantina.ts`, `scenarios/step11-*`). A
   `docs/mechanisms/cantina.md` writeup and its one index line.

## Traps

- **The page runs your systems too.** A system that spawns bodies or
  counts events will do it a second time on every page, on a world with
  one character in it. Guard on the `~cantina` entity (above), and prove
  it: the real-server check below sees exactly one regular per character.
- **The player's own device owns where it is.** Writing `x`/`y` on a
  player in a system works in a scenario (one world) and does nothing on
  the live game. Only effects move a player.
- **Leftover `c.brawl`.** If a player walks out mid-brawl and keeps it,
  `step2-hit-friend-attack-harmless`'s rule breaks in the street. One
  scenario must show it.
- **A ring-out that never happens.** With the edge too close to the walls
  a body hits the wall and stops inside it. Size the open air from the
  real launch: `maxLaunchSpeed` 520 px/s and the characters' gravity; use
  `node scripts/trace.ts` to watch one fly.
- **Doorway on the fighting floor** (above). And a regular's pattern must
  never push the stick up.
- **Regular ids.** `cantina:<kind>` is a contract once pushed (CLAUDE.md:
  ids are never renamed).
- **Determinism:** every scenario runs twice and must match byte for byte.
- **`c.npc` on a regular** silently turns them into witnesses. Don't.

## Out of scope (you will notice these; leave them)

- The tap, the row across the screen, swapping, `switch` reaching roster
  characters outside the party: slice B.
- The chase lock on the door, guards following in: slice B / later.
- Keeping a best brawl in Step 7's store.
- `src/client/main.ts`'s `drawn` record and `npm run e2e` (Step 5's);
  signal 8 is slice B.
- Anything about the street's people, the guard, other rooms, the look of
  sprites (Step 8 draws characters by kind; new kinds will be plain shapes
  for now, which is fine).
- `game.json`'s `playerCharacter: "hero"` and other flags in
  `docs/for-the-lead.md` belonging to other steps.

## Decided vs. open

**Decided** (plan step and the owner's words; don't relitigate): a real
room off the castle street; every unlocked character nobody plays wanders
there; regulars are scripted data, outside every ordinary rule, no moods,
witnesses, calls or alert; attack starts it; knocked flat or launched
out, back at once, players too, without end; everyone in the room is in
it, friends included; a running counter, no number over a hit; the brawl
ends after a calm time and when the last player leaves; leaving is never
locked.

**Decided by the lead, `DRAFT:`** (logged in `docs/decisions-log.md`):
the door's place; the roster all unlocked; two new characters; the edge
as an authored rectangle inside the room; a knock-out credited to who
sent the body flying, else who flattened it, else the last hitter.

**Open, yours to pick, `DRAFT:`, logged:** the room's size, the numbers
(calm time, friend numbers in the brawl, pad places), the patterns, the
two characters' function and colours, the counter's look. Pick the
simplest that plays well on a phone.

## Verification (`docs/verifying-and-finishing.md`)

Scenarios `scenarios/step11-*.json`, each with its failing control watched
once (break it, see `npm run check` name the fact, restore):
1. Each roster character nobody plays has exactly one body in the cantina,
   walking, never leaving (control: a player playing `grappler` → no
   `cantina:grappler`).
2. A player's hit on a regular starts the brawl and a regular hits back
   (control: standing beside a regular, and a swing that misses, start
   none).
3. Launched past the edge: `cantina-out` with the right `by`, a fall, back
   on a pad within one second; a player, three times running (control:
   the same launch with no brawl on scores nothing).
4. In the brawl A's attack launches B (control: before the brawl, it does
   not).
5. No attack for `calmTime` ends it; the last player leaving ends it, and
   that player in the street is harmless to a friend again, and no regular
   follows (control: one attack inside the calm time keeps it going).
6. After a brawl: no mood changed, no call, the alert as it was (control:
   the same hit on a person in the street upsets them: Step 4's existing
   scenarios show it; name the one you lean on).
7. In through `to-cantina`, out again by the cantina's door.

**Rung beyond the scenarios, required:** a new real-server check
`scripts/checks/step11-cantina.ts` (self-registering, see
`docs/mechanisms/network.md` and `scripts/checks/together.ts`): two
players on separate connections in the cantina; the server's world has
exactly one regular per unplayed roster character and each page's local
world none; b is launched past the edge and comes back on a pad by the
`move` effect, acknowledged, and b's page then reports b on the pad and
able to act. Control: with the guard on the `~cantina` entity removed,
the page grows regulars and the check fails.

**By eye:** `npm run dev`, a phone-sized page, walk in, start a brawl,
screenshot the counter mid-brawl. Read `/debug/errors` on the live
address before pushing.

## Definition of done

`npm run build` and `npm run check` green, every other step's scenarios
included; the controls watched; pushed to `main` in small green pushes
(the room and door first is a fine first push); `npm run check:deployed`
exits 0 after the last push; architecture and mechanism docs written;
`docs/decisions-log.md` entries for every `DRAFT:` choice the owner would
notice. SOP phase 6 rows: mechanism doc, architecture ownership, decisions
log.

## Where things go

Blocking questions: to the Step 11 lead (`send_message` to
`session_017WiGzFy3MD6ecvM7QMvQGd`) and `docs/questions-inbox.md`.
Flags, findings, what you could not verify: `docs/for-the-lead.md` under
this brief's file name. When you finish or are blocked, tell the lead by
`send_message` at once. Final message: done or blocked, the last commit,
nothing more.
