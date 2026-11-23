# Step 14 — Things to find, and knowing there is more

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-078, D-079):**
> D-078 In the spirit of LEGO Star Wars, each substantial playable level/region should have clear measures of completion to make discoveries and revisits meaningful. The project owner specifically likes finding HIDDEN COMPONENTS that assemble into a final object whose identity is UNKNOWN to the player while collecting pieces.
>
> D-079 An EXPLORED % is an explicitly welcomed idea: player knows there's more to discover without the game revealing WHICH route, room or secret is missing. Hidden rooms should contribute to the percentage; the exploration progress is distinct from collectible/component progress. …

These two are the decisions this step builds. Doc 29 is in the proposals
folder; its own Status block marks the counts, look, reward and place of
assembly as proposed or unresolved. No build gate covers this; golden
scenario G-03 (doc 12) is the bar: "revisiting feels like rediscovery,
not backtracking for an icon collectible."

## Slice A, first (the owner, 2026-11-23 ~18:10 UTC, first-hand, playing on a phone)

> Not finding clear "level entries" with discovered indicators etc

So before the pieces: every way into a level is drawn as an entrance (from
the owner's P05 doors: the ornate gem door, the swirl portal, the mine
entrance), and it shows whether the level is discovered and how much of it
has been explored, as a completion pie from the P05 HUD sheet (D-078, D-079),
never a list and never "which or where". `DRAFT:` four levels tonight
(castle town, the Bandit Camp, the Iron Quarry, the cantina), as data in
`content/levels/`; discovered and explored state is the world's and is kept
with a kept game. This amends "Shown in the menu, never over the play view"
below: the indicator is part of the world at the doorway, and also in the
menu. Brief: `handoff-prompts/step-14-a-level-entrances.md`.

## Goal

A few odd pieces of something are hidden around the kingdom. Find them
all and they snap together into a thing nobody told you about. A number
in the menu says how much of the kingdom you have explored, hidden
corners included: under 100 means there is more, and it never says where.
Tomorrow it is all still found.

## What's decided

- **Two measures, never one** (D-079): a percentage explored, and pieces
  found out of how many (the register's "minimal region record", a strong
  direction). `DRAFT:` no combined score or badge.
- **It says there is more, never which or where** (D-079): no list of
  places, no count of places left, no arrows. `DRAFT:` no map tonight.
- **Hidden places are in the total from the start** (D-079): every room
  and area of the region in Step 3's data, counted when a hero someone is
  playing is first inside it. `DRAFT:` each counts once; tonight's rooms
  are one region with one set of pieces; a second place adds a file.
- **Nobody knows what the pieces build** (D-078). Nothing shown, named or
  outlined hints at it before the last piece; ids never say what it is.
  What it is belongs to the owner (doc 11: "No specific combined
  construction is owner-approved"). `DRAFT:` tonight a stand-in: one
  drawn thing that stands in the world and does nothing. Never name it in
  the decisions log or a report: the owner plays in the morning.
- **A piece is somewhere to get to:** unmarked, where a move, a route or
  a secret from Steps 2 and 3 takes you, never behind a name or a
  headcount (D-006, D-015). `DRAFT:` touching it takes it, with no new
  button; the last one makes the thing snap together by itself at a spot
  the data names. Play never stops for it (`INTENT:` there is always a
  way out).
- **Neither number is a chore or a Hall record.** `DRAFT:` nothing in
  tonight's kingdom is locked behind them (doc 04: "Don't turn this into
  compulsory checklisting"). The one reward the owner has picked, D-089's
  way into the cantina while chased, is not built here; this step only
  says when the set is complete.
- **Progress is the world's, and it is kept** (`DRAFT:`; save ownership
  is open, O-004). A piece one friend finds is found for both; a hit, a
  defeat or a lost power never costs one. Step 7's store keeps the ids of
  places entered and pieces found (doc 33: a refresh "should not
  inadvertently wipe … explored percentages, mystery components"), for
  the default world only, so no check in a private `?room=` world can
  mark the owner's.
- **Shown in the menu (Step 5's), never over the play view** (doc 33: "UI
  should not cover secret entrances or enemies").

## How to cut it (a suggestion, not a rule)

Two slices: **the explored number** (the region file, counting, the
record, saving, the menu panel) and **the pieces** (placing, taking,
assembly). Land the record and its saving first; both write to it. What
it needs to start is on `main` at 30bbfa0: Step 3's rooms with `areas`
and the `changed-room` event, Step 2's heroes, Step 7's store. Until Step
1's second gate, Step 3's remaining rooms and Step 5's menu land, build
headless in a test room of your own; write no second store or menu. If
the menu is still missing when the rest is green, tell the orchestrator;
never draw the record over the view. Drop first: the snap-together
flourish. **Never ship** pieces that cannot assemble, a number that tells
which or where, or the finished thing shown early.

## What's open (the lead's to measure and decide)

- Read in full:
  `docs/design-library/05-world-and-game-expansion-proposals/29-level-completion-exploration-and-mystery-components.md`,
  `docs/design-library/02-gameplay-systems/04-world-structure-secrets-and-revisiting.md`,
  and D-078 to D-082 and D-089 with the OPEN lines under them in
  `docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`.
- Count the rooms and areas on `main` from the data. Where a hidden
  corner has no area, ask Step 3's lead; edit no room.
- The library leaves these open. For each, pick the simplest, `DRAFT:`,
  log it in `docs/decisions-log.md`: how many pieces and where (spread
  over different kinds of reach); what the stand-in is and where it
  stands (log that there is one, not what it is); whether people react to
  a piece being taken (simplest: no); how a record is put back to
  nothing.

## Feedback signal

Scenarios in `npm run check`, named `step14-*.json`, each with a control
watched to fail.
1. The number is the share of the region's rooms and areas a scripted
   player has entered, hidden ones in the total from the first tick, and
   reads 100 only when all are entered (control: hidden areas left out of
   the total).
2. A player touches a piece: it is gone and the count rises by one for
   both players, also when two touch it on the same tick (control: a
   thrown crate takes nothing).
3. With every place entered and one piece missing, the record reads 100
   and one short, and nothing assembles (control: one number worked out
   from the other). On the last piece the thing stands in its place for
   every player and input still moves the hero (control: input frozen).
4. Before the last piece, what the page drew and wrote holds no name or
   picture of the finished thing, no name of a place not yet entered and
   no count of places left, read from the page's own record of what it
   drew (control: a build that lists the missing rooms).
5. In the real rooms, every place and every piece is reached by some
   scripted run; two players are allowed, and nothing checks how many are
   playing (control: a piece moved into a sealed pocket).
6. The built server runs with a temporary directory as its volume; a
   client explores and takes a piece; the server restarts; the record is
   the same and the piece is not back in the world (control: saving off).
   A private world leaves nothing there.
7. On the phone-sized page in `npm run e2e`: one player walks into a
   piece by touch and the other's record shows it; the record opens and
   closes from the menu by touch; none of it is drawn over the play view
   (control: a build that draws the number there).

## Stopping condition

The seven signals pass on `main` and live (`npm run check:deployed` exits
0), and "how to add a piece or a region" is in `docs/architecture.md`. On
live the default world's record reads nothing found, so the owner finds
everything first: read it without joining, because joining explores the
first room, and tell the orchestrator the hour saving goes live.
**Budget:** 120 minutes from claiming. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer than that, land the explored number
alone (signals 1 and 6, the places in 4 and 5, the menu in 7), leave the
pieces out entirely, and say so.

## Owns

`content/completion/**` and its kind file (one file per region: its
rooms, its pieces, the finished thing); systems named `completion-*`; a
new `src/client/draw/completion.ts`; the record panel, a new file of your
own; one collection of your own in the store (`docs/architecture.md`,
"Lasting records: the store"). It builds on Step 3's rooms, Step 2's
bodies, Step 7's store and Step 5's menu and edits none of them: the line
that opens the panel and the lines in the server that keep and restore
the record are agreed with whoever holds them. The server's world decides
what is entered and taken; a page only shows it. Its events (a place
explored, a piece found, the set complete) go into
`docs/architecture.md`. Four files are shared between steps
(`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`): additive edits only, each
small, `git pull --rebase` right before pushing.

## Taste, for the owner in the morning

What the pieces build: tonight's is our stand-in, and the real one is
yours to choose. Whether a number under 100 makes you want to go back or
feels like homework. How many pieces, and whether each hiding place felt
fair. Whether progress should belong to the world or to each player.
Don't grade these; list them.

## Measure

## Briefs

## Open with the owner

## Handoff notes

## Builder notes

Slice A (`session_017WiGzFeeJgj8z2SUAFyu5J`):
- `src/content/kinds/rooms.ts` still says of areas "Nothing reads these yet"; levels now count them. Not my file; the doc is fixed (`rooms-and-doors.md`).
- A page's own world runs `level-explore` for its own hero (it only adds what the server adds a moment later); the brief said "written only by the server's step". Logged as `DRAFT:` at the system; to make it server-only, skip when the world has no `~cantina:` style marker, or have the server set a flag.
