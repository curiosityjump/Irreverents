# NPC response logic: people with three moods

**Reference.** Open before touching `src/sim/npc/`, the `npc-*` systems,
`content/npcs/`, `content/rules/`, or the `npc`, `routine` and `things`
fields of `content/placements/`. Built by Step 4, slice 1 (2026-11-23).

## Why it exists

The owner (design library doc 11): people have **exactly three moods**
(D-048), and **"NO NPCS WILL HAVE AI"** (D-055): fixed states, explicit
role/deed mappings, authored reactions. The comedy is that the world
judges **who** is acting as much as **what** they do (D-050). So all of
it is data tables plus a small fixed machine. Call it NPC response logic,
never AI.

The moods: **1** business as usual, **2** confusion / distress, **3**
absolute blinding violent rage. Mood 1 is *role conformity, not
friendliness* (D-049): a shopkeeper being robbed by the villain is in
mood 1 and happily fights back.

## The pieces

| Piece | Where | What it is |
|---|---|---|
| A person's body | `content/characters/<id>.json` | An ordinary character kind (Step 2's): box, colour, verbs (`move`), a tuning set. |
| A kind of person | `content/npcs/<id>.json` | `role`, `side` (`good` / `bad`), `moods` (`"1"`, `"2"`, `"3"` → a behaviour id), `barks` (cue → at most three words, D-057). |
| Where one stands | `content/placements/<room>.json`, `place[]` | Step 2's entry plus optional `npc` (an NPC kind id) and `routine`. |
| Things to use | the same file, `things[]` | Bodiless: `id`, `tile`, `deed`, optional `keeper` (a placed person), `once`, `look` (`counter` / `goods`). |
| The tables | `content/rules/*.json` | `deeds`, `expect`, `reactions`, `events`. Every file is read; rows are taken in file-name order. |
| The numbers | `content/tuning.json`, `world.npc*` | Sight, rage threshold, clocks, reaches. All `DRAFT:`. |

A player's character always has the role **`hero`** (`HERO_ROLE`),
whichever body it is, and no side.

## State: all of it on entities

Step 1's server replicates entities generically, so nothing here lives
in a `World` field or a module variable.

- `entity.c.npc` (on a person): `kind`, `home` (the placements file that
  placed them), `mood` (1 | 2 | 3, changed only by `setMood()`),
  `dissonance`, `offenders` (sorted entity ids), `quiet` and `cool`
  (the two clocks, in ticks), `lastSeen` (`{x, y}` or null), `step`,
  `stepTicks`, `stall` (the routine), `bark` (`{text, ticksLeft}` or
  null).
- `entity.c.thing` (on a thing): `takenBy` (an entity id or null). A
  thing's entity has `kind: "~thing"` (`THING_KIND`), which no character
  kind can be called, so physics and the entity drawer skip it. Its `x`,
  `y` are its tile's top-left.
- `entity.c.interact` (on a player's character): `held`, to see a fresh
  press.
- `entity.c.input` (Step 2's, declared in `systems/verbs.ts`): what a
  person wants this tick. **A person never sets `vx`, `vy` or `facing`**;
  `drive()` writes this and the body's own verbs act on it. Turning on
  the spot is a stick touch of 0.01 (`turn()` in `behaviours.ts`).

## The systems, in order

| Order | System | Does |
|---|---|---|
| 10 | `npc-setup` | Gives `c.npc` to any entity whose placement entry names an `npc`; adds a room's `things` as entities once anybody is in that room. |
| 50 | `npc-act` | Runs the behaviour the person's kind names for their mood and writes `c.input`. A routine's `do` step emits `did`. |
| 60 | `npc-interact` | A player's fresh press of `interact` uses the nearest thing within `npcInteractReach`: emits `did` with the thing's deed; a `once` thing is marked taken. A thing with a `keeper` works only while the keeper stands within `npcKeeperReach` of it. |
| 100 | `verbs` (Step 2) | Bodies act on their input. |
| 500 | `physics` | |
| 600 | `npc-witness` | Collects this tick's deeds, works out who perceived each, emits `deed`, and applies the mood rules. |
| 610 | `npc-mood` | Runs the clocks (bark, distress fading, rage cooling) and updates `lastSeen`. |

Anything that emits an event meant to become a deed must run **before
600**. `ctx.events` (added to `StepContext` for this) is the tick's
events so far.

## Deeds

A deed is a thing a person can witness someone doing: tonight `buy`,
`take`, `rob`, `hit`, `grab`, `throw` (the `deeds` list in
`content/rules/`). Deeds reach the witness pass two ways:

- **`did`**, emitted by Step 4's own code (a routine's `do`, a hero
  using a thing): `{ deed, by, target, thing }`.
- **Any other event**, through the `events` table: `{ "event": "hit",
  "deed": "hit", "by": "by", "target": "target" }` says which event type
  is which deed and which of its fields hold the two entity ids. Rows
  for Step 2's `hit`, `grabbed` and `thrown` are in the file already;
  no code changes when those events start arriving.

For each deed the witness pass emits **`deed`**: `{ deed, by, player,
target, thing, room, x, y, witnesses }`. Something with no role (a
crate) does no deeds.

## Seeing (`src/sim/npc/sight.ts`)

`DRAFT:` the simplest thing that makes sneaking a choice. A person sees
someone when: same room; the someone is in front (the way the person
faces); within `npcSightRange` (112 px, 7 tiles) across and
`npcSightHeight` (40 px) up or down, between the middles of the two
bodies; and no **solid** tile on the straight line between them
(one-way platforms do not block). **The one a deed is done to always
perceives it**, facing or not. Someone out cold (`c.flattened`, Step
2's) sees nothing.

## The tables (`content/rules/`)

- **`expect`**: `{ actor, deed, targetRole?, targetSide?, witnessRole?,
  witnessSide?, verdict: "expected" | "odd", weight }`. Among the rows
  that match, **the one with the most conditions wins**; between equals,
  the first in file-name then row order. **No matching row means the
  deed is nothing to that witness**: neither expected nor odd.
- **`reactions`**: `{ witness, actor, deed, reaction }`: what a person
  in mood 1 does about an *expected* deed. The reaction id is the bark
  cue; `oppose` also emits `opposed`.
- **`events`**: above.

Tonight every odd row carries `witnessSide: "good"`, so nothing drives
the villain out of mood 1 (`DRAFT:`, the lead's call).

## The mood machine (`npc-witness` + `npc-mood`)

Each witness looks the deed up in `expect`:

- **Odd:** `dissonance += weight`, the doer joins `offenders`, both
  clocks restart, `lastSeen` is where it happened. Mood 1 → 2, **always
  2, however heavy the deed** (D-044: the first deviation is a fluke).
  Mood 2 with `dissonance >= npcRageAt` (3) → 3 (D-045).
- **Expected, done by an offender:** mood 2 → 1 **on that same tick**
  (D-042, D-072; the owner calls the speed "core to the game's comedy
  and strategy"), with `reassured` and a bark. Mood 3 → 1 only for a
  `bad` person (D-051). **A good person in mood 3 is not calmed by
  anything in view** (D-073).
- Then, if the witness is in mood 1 and the deed was expected, the
  `reactions` table.

The clocks: mood 2 with nothing odd for `npcDistressFadeTime` (12 s) →
1 (`faded`). Mood 3 with no offender in sight and nothing odd for
`npcRageCoolTime` (15 s) → **2, not 1** (`cooled`; D-074: an expected
act then finishes the job), with `dissonance` left one short of rage.
Seeing an offender or an odd deed restarts the wait. Entering mood 1
clears `dissonance`, `offenders` and `lastSeen` and restarts the routine
from its first step.

Events: `mood-changed { entity, from, to, cause, offender }` (`cause` is
`odd:<deed>`, `expected:<deed>`, `faded` or `cooled`), `reassured
{ entity, by, deed }`, `opposed { entity, target, deed }`.

## What a person does (`src/sim/npc/behaviours.ts`)

One function per behaviour id; an NPC kind picks one per mood.

- **`routine`**: the placement entry's `routine`, looping:
  `{ "wait": seconds }`, `{ "face": "left" | "right" }`,
  `{ "walk-to": column }`, `{ "do": deed, "target": placed id }`. A
  routine needs at least one wait. A walk that makes no headway for 45
  ticks is given up (there is always a way out). A `do` whose target is
  not in the room is skipped.
- **`plead`**: stop and face the first offender in the room.
- **`charge`**: walk to `lastSeen`, the place an offender was last
  **seen**, never where they are (D-065: not omniscient), and stop
  within `npcChargeReach`. If the body lists Step 2's `attack` verb,
  hold `attack` there while an offender is in sight.

## Hooks left for slice 2

- `rageMayCool()` in `src/sim/npc/state.ts`: add "and the area alert is
  0" there.
- `deed`, `mood-changed`, `reassured`, `opposed` are the events to read.
  `deed.witnesses` is who could report it; an empty list is "nobody
  knows".
- A thing taken has `c.thing.takenBy`; what carrying it means is open.
- Knocked-out people: `isOut()` already stops them seeing, acting and
  ticking their clocks.
- More behaviours (walk to a bell, search): add the id to `BEHAVIOURS`
  in `src/content/kinds/npcs.ts` and the function to `behaviours`.

## Adding things

- **A deed:** add its id to `deeds` in a `content/rules/` file, rows to
  `expect`, and either an `events` row (if a simulation event is the
  deed) or a `do` step / a thing that names it. No code.
- **A rule:** a row in `expect` or `reactions`. No code.
- **A role / a kind of person:** `content/npcs/<id>.json` (and a body in
  `content/characters/` with a tuning set, unless it shares one). No code.
- **A person in a room:** an entry in that room's placements file with
  `npc` and a `routine`. At most 8 people per file
  (`MAX_NPCS_PER_ROOM`, `DRAFT:`).
- **A thing to use:** an entry in `things`.

## Checking it

Scenarios `scenarios/step4-*.json`, all in `content/rooms/test-shop.json`
with `"placements": true`. Two facts were added for them
(`docs/mechanisms/scenarios.md`): `mood` and `event-where`. The
villain's polite visit is at about tick 2960; the hero scenarios use the
time before it.

## Traps

- The shopkeeper glances behind every 6.5 s (the routine), so "behind
  the shopkeeper's back" depends on when. Scenarios pin the tick.
- Turning nudges a body by a hundredth of a pixel, so a person's `x`
  drifts by fractions over many turns. Do not assert a person's exact
  position.
- A `once` thing stays in the world after it is taken (with `takenBy`
  set); it is never re-added.
