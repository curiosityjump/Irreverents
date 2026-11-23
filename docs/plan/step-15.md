# Step 15 — A second place, worth coming back to

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-003, D-005):**
> D-003 World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub.
>
> D-005 Deep secrets, side areas and discoveries available long after first visitation; re-visitability is core.

**Owner (Drive, doc 04, "Progression by increasing capability"):**
> Certain characters arrive well after a player has passed features where they'd have helped. This is desired rather than a progression flaw.

The library's golden scenario G-03 (doc 12): "early forest area with high
canopy, narrow route and stone barrier … revisiting feels like
rediscovery, not backtracking for an icon collectible."

## Goal

A road leads out of the castle town to a forest, a second place a few
rooms big. You walk there, and whoever is chasing you can follow. On the
first walk you see a gap too low, a canopy too high and a stone gate you
cannot keep open; each gives way to a different hero. One more thing
stays out of everyone's reach, waiting for a power or a hero you do not
have yet. Reaching the deepest spot opens a short way back.

## What's decided

- **Files only: the measure is "engine and content stay separate"**
  (`CLAUDE.md`). Rooms in Step 3's format, things through Step 4's
  placements, checks as scenarios; no commit of this step touches
  `src/`. If a room needs something the game cannot do, build without it
  and tell the lead who owns that part: a finding, never a quiet engine
  edit.
- **The place is a forest** (`DRAFT:` placeholder, D-096): doc 25's
  level 04, a proposal, cut down to a trail, "root tunnels", an "ancient
  stone door" and a "canopy". It is doc 04's own illustration and G-03's
  setup, and needs only tonight's moves and Step 3's parts. Its mentor,
  sage and creatures are left out (D-056, D-058): no new kind of person,
  no sign, arrow or text (D-057). Three to five rooms.
- **You walk there** (D-003): one road room joins a door in the kingdom
  to the forest. A chase can follow, and arriving cools nothing (D-077).
  Hiding places a pursuer cannot get to are rare between levels (D-077):
  `DRAFT:` at most one on the road, as its secret.
- **Three things are seen on the first walk, each closed by the world,
  never by a name check** (D-006): a gap one tile high; a canopy ledge
  above any plain jump; a stone gate open only while its plate is held,
  with only a heavy crate nearby to hold it. A way round by a throw, a
  stack or a friend is the game working (doc 04, "Puzzle design ethos").
  `DRAFT:` the trail itself is open to any one hero alone (D-015).
- **One more thing is beyond all three heroes' own moves** (`DRAFT:`),
  for G-03's "long after first arrival". All three are in the party
  from the first minute, so the three above open by switching hero;
  this one waits for a power (Step 9) or a found hero (Step 13), shut
  and in plain sight.
- **Every pocket has a way out any body can take** (always a way out,
  `CLAUDE.md`; `INTENT:` in the room file's note): a friend can be
  thrown in, and a player can switch hero inside. `DRAFT:` the deepest
  pocket's way out leads to the trail and stays open: G-03's
  "shortcut".
- **Ready for what comes next.** Ids are plain, start `forest-`, and
  never use a proposed name. Each room and hidden area has its own id
  and says whether it is hidden (D-079), for Step 14 to count and keep
  in Step 7's store; this step saves nothing. Rooms use only the kinds
  of tile the format has, so the grassy-ruins atlas on order is one
  `"atlas"` line per room, added by Step 8 (`docs/architecture.md`,
  "Where art plugs in"; S00-01 is a look reference, not an atlas:
  doc 14).

## How to cut it (a suggestion, not a rule)

Two slices at once, in separate files: **the trail** (road and forest
floor, all four things in view), which lands first, and **the insides**
(tunnels, canopy, deepest pocket).

**On `main` first** (all there at 04:55 UTC, 2026-11-23): Step 3's
rooms with doors and a room to take the door (`castle-street`); Step 2's
three heroes, crates and throw. **Still to come, not needed to start:**
Step 3's plates and gates (the gate, the short way) and its way-out
check (signal 1); `npm run e2e` (signal 6); Step 9 or Step 13 (half of
signal 4). Until then build geometry: the gap and the canopy need no
parts. A room with no doors stands alone in the check
(`docs/mechanisms/rooms-and-doors.md`): prove each room doorless, then
add every door in one push.

Drop first: what opens the later thing, then the short way, then the
insides as rooms of their own. Never cut: the road you walk, a way out
of every pocket, no name check, nothing under `src/`.

## What's open (the lead's to measure and decide)

- Read in full: `docs/design-library/02-gameplay-systems/04-world-structure-secrets-and-revisiting.md`;
  `docs/design-library/04-decisions-and-prototyping/25-playable-level-anthology-twelve-irreverent-adventures.md`;
  and, in `docs/design-library/05-world-and-game-expansion-proposals/`,
  `28-ten-more-gameplay-first-level-designs.md` and
  `15-world-atlas-the-kingdom-and-its-hidden-routes-proposed.md`. Docs
  25, 28 and 15 are proposals: borrow shapes, never names. The room
  format is `docs/mechanisms/rooms-and-doors.md`.
- Layouts and room count; which wall of which room takes the door (agree
  it with Step 3's lead, who may prefer to make that edit); what closes
  the later thing (see what Step 9's power or Step 13's hero can do in a
  room; if neither is on `main`, use height or distance); how many
  hiding places on the road a pursuer cannot get to, counted by Step 4's
  rules for moving and seeing. For each: pick the simplest, mark it
  `DRAFT:`, log it in `docs/decisions-log.md`.
- Whether Step 3's check accepts a room only one hero can enter. If it
  does not, make the insides hidden areas of the forest floor and tell
  Step 3's lead.

## Feedback signal

Scenarios in `npm run check`, named `step15-*.json`, each with a control
watched to fail; no gate tag.

1. Step 3's checks, unchanged, pass with the forest joined to the
   kingdom, for every party member once its way-out check is on `main`
   (control: with one end of the kingdom's door removed, it is
   refused).
2. Each hero, alone, walks from the kingdom's door to the trail's far
   end and back; a body that only walks crosses the road (control: a
   one-tile step stops it).
3. The gap, the canopy, the gate: the hero that fits gets in by its own
   moves; each of the others walks up to it and does not. One more
   scenario gets another hero in by a throw or a stack, and must pass.
4. The later thing: each hero, alone, fails to reach it. With Step 9 or
   13 on `main`, the power or the found hero reaches it; without, say so
   under Measure.
5. The biggest hero, started inside each pocket, gets out (control: the
   way out made solid). Once the deepest way out is used, a walking hero
   gets in from the trail; before, it cannot.
6. `npm run e2e`, phone-sized page, touch only: through the new door,
   along the road, into the forest; switch hero; enter the gap (control:
   the door removed).

## Stopping condition

Signals 1–6 pass on `main` and live (`npm run check:deployed` exits 0),
`npm run gates` shows gate B as it was, `docs/architecture.md` has an "I
need to add… a region" row, Step 10's lead has the walk to the forest as
a beat, and after `git fetch origin main` this prints 0 (no commit that
added the forest touched `src/`):

```
git log --format=%H origin/main -- 'content/rooms/forest-*' 'content/placements/forest-*' 'scenarios/step15-*' | xargs -r -n1 git show --format= --name-only | grep -c '^src/'
```

**Budget:** 100 minutes from claiming. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer, land the road and forest floor
with signals 1–3 and list the rest in your handoff note. Unfinished
rooms are not joined to the kingdom.

## Owns

New files only; no new directory, kind file, system or draw file:
`content/rooms/forest-*.json` (Step 3's directory and format),
`content/placements/forest-*.json` (Step 4's), `scenarios/step15-*.json`
and one touch case where `npm run e2e` keeps its cases. It builds on
Step 2's heroes, crates and throw, Step 3's rooms, doors and parts and
Step 4's placements, and edits none of them, except one door in one
existing room file, agreed with Step 3's lead. The four shared files
(`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`) take only small additive
edits after `git pull --rebase`; this step should need none.

## Taste, for the owner in the morning

Whether the trail is fun to run; whether what you cannot reach makes you
want to come back; whether the road feels like a place; whether the deep
spot felt found, not pointed at; the forest as the choice. List these;
don't grade them.

## Measure

## Briefs

## Open with the owner

## Handoff notes
