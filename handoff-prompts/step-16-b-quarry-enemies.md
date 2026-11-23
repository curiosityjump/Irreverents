# Step 16, slice 2: bad guys all through the quarry, and not all alike

Brief for a builder. Written 2026-11-23 16:15 UTC by the Step 16 lead
(`session_017WiGzHt9iJy3caBLkT1Ef4`). The step is `docs/plan/step-16.md`:
read its "What's decided", bullets "Enemies all through it" and "One
system for enemies". Read `docs/mechanisms/npc-response.md` and
`docs/mechanisms/combat-and-impact.md` in full, and
`docs/mechanisms/outposts.md` for the fighter, before writing anything.
**Start only once slice 1 (`handoff-prompts/step-16-a-quarry-rooms.md`)
is on `main` and joined** (the courtyard doorway `to-quarry` exists):
you add people to its rooms' placement files.

**Hard stop: 90 minutes after you start, with whatever is green.
Nothing half-working on `main`.** After each push, `send_message` to the
lead with the commit.

## The task, and what it moves

The quarry's six rooms are empty. Put bad guys through every room except
the cave (the refuge), of three kinds that play differently: light ones
that fly when hit, heavy ones a punch barely moves, and a brute. The
owner (14:30 UTC): "I haven't seen any levels being built, enemies". It
moves no M-row; `npm run gates` must still print 5 of 6. Signal 4 of the
step (`docs/plan/step-16.md`, "Feedback signal").

## Measured for you (at 29b6e9b)

- **Fighting is Step 12's and works in any room** (2027994):
  `src/sim/systems/outpost-fight.ts` (order 58) drives every person whose
  NPC kind has `side: "bad"` and whose body lists `attack`: it walks at a
  hero it `canSee`s and swings in reach; losing sight, it walks to the
  last place seen and stands. No `content/outposts/` file is needed for
  that (`scenarios/step12-fighter-any-room.json` proves it). **So a new
  enemy kind is data only**: a character file (verbs `move`, `attack`,
  `body`), a tuning set, an NPC kind with `side: "bad"`. Write no fight
  code; if a kind needs behaviour the fighter lacks, tell the lead.
- **Light** is Step 12's `outpost-fighter` (character, NPC kind and
  tuning set `outpost-fighter` in `content/tuning.json`), reused as is.
- **Bodies today** (`content/tuning.json`, `characters`): grappler weight
  60, toughness 160, attack wear 34, `liftStrength` 150; infiltrator 26 /
  80 / 18 / lift 60; flyer 30 / 90 / 22 / lift 60. A body is flattened
  when its wear reaches its toughness, for `flattenTime` 3 s; impacts add
  wear too (`impactWear` 0.08 in `world`). A heavier body flies less from
  the same hit. `crate-heavy` is what only the grappler lifts.
- **Moods for a bad guy come from rule rows, not code.**
  `content/rules/expectations.json`: a hero's `hit`, `grab`, `throw` on a
  `targetSide: "bad"` body is `expected` (D-060), so fighting changes no
  mood. The witness side is a column in the rows (`witnessSide`), and
  `npc-witness.ts:64` already lets a bad person's mood 2 and 3 calm. The
  deeds that exist: `buy`, `take`, `rob`, `hit`, `grab`, `throw`.
- **The deed that upsets a bad guy** (`DRAFT:`, the lead's pick, after doc
  23's "Villain sees HERO ignore him … CONFUSION / DISTRESS, potentially
  escalating to RAGE" and D-050's polite villain turned round): **a hero
  politely paying the bad guys' toll.** On `quarry-road`, a toll post: a
  Step 4 `things[]` entry with `deed: "buy"`, `look: "counter"` and
  `keeper` a placed fighter standing by it (`npc-interact` works while the
  keeper is within `npcKeeperReach` 40 px). One new row in a **new** rules
  file `content/rules/quarry.json` (rules files are all read, in file-name
  order): `actor hero, deed buy, witnessSide bad, verdict odd, weight 1`
  (more conditions than Step 4's `hero buy expected` row, so it wins;
  measure that it does). Paying again and again reaches mood 3
  (`npcRageAt` 3). If a keeper must be a `shopkeeper` role for `buy` to
  fire, say so to the lead and use `take` on a `once: false` goods thing
  instead.
- **People per room:** at most 8 per placements file
  (`MAX_NPCS_PER_ROOM`, `src/content/kinds/placements.ts`). Crates are
  not people.
- **Room sizes** after slice 1: road 84×20, ridge 80×16, tower 20×30,
  depot 64×20, pit 40×20, cave 30×14. The depot's people (patrols,
  lookout, horn, hoard) are slice 3's: put only one or two plain fighters
  in its yard now, nowhere near where slice 3's patrols will walk, and
  say in its `//` that slice 3 replaces them.

## What to build (all `DRAFT:`; log the picks in `docs/decisions-log.md`)

Owned paths (agreed with the lead; ids name the body, never a library
name): `content/characters/heavy-fighter.json`,
`content/characters/brute.json`; `content/npcs/heavy-fighter.json`,
`content/npcs/brute.json` (`side: "bad"`, moods 1/2/3 in Step 4's
format, copy `content/npcs/outpost-fighter.json`); two new tuning sets
added at the end of `characters` in `content/tuning.json` (add, don't
reorder); `content/rules/quarry.json`; people and the toll post in
`content/placements/quarry-*.json`; `scenarios/step16-*.json`.

1. **Heavy** (`heavy-fighter`): a grappler's punch barely moves it; a
   throw or a slam into a wall or another body drops it. Start from
   weight about 3× a fighter's, toughness high enough that punches alone
   need many hits, and measure. If wear cannot make a throw drop it while
   punches don't, pick the nearest that tuning allows (e.g. it falls to
   two throws or six punches) and log it.
2. **Brute** (`brute`): one to a stretch; bigger box (wider and taller
   than the grappler, clear of every door and crawl it must not pass:
   check the rooms), slow, hits hard, takes a lot; weight above the
   infiltrator's and flyer's `liftStrength` (60) so only the grappler can
   lift it, or none.
3. **Placement.** Every room but `quarry-cave` places at least one bad
   guy; every kind is in the level; fighters in twos and threes; one
   brute in a stretch (the ridge or the tower top). Keep every spawn and
   every person clear of the main way's jumps so the across scenarios from
   slice 1 still pass **unchanged**: the people are hostile, so a crossing
   now meets them. If a slice 1 scenario fails because a bad guy is in
   the way, move the bad guy, not the scenario. If one must change,
   ask the lead first.
4. **The toll post** on `quarry-road` and its rule row.
5. **Ranged: not this slice.** A body that keeps its distance and throws
   needs fight behaviour the fighter does not have (Step 12's file).
   Leave it out; it is the step's first thing to drop.

## Scenarios (`step16-*`, no `gate` tag, each with a control watched to fail)

For each new kind, and the fighter where marked:
- **present:** one scenario (or a check) that every room but the cave
  places a bad guy and each kind appears;
- **mood stays 1 under hits** (each kind; control: the same hit upsets
  the shopkeeper, already proven by `step4-hero-hits-shopkeeper`: cite it,
  don't copy it);
- **the toll** takes the keeper and a fighter who sees it to mood 2, and
  paying more to mood 3 (control: walking past without paying, mood 1);
- **light flies farther than heavy** from the grappler's same hit
  (`position` facts after the flight);
- **heavy falls to a throw or a slam, not a punch** (or the measured
  nearest; control: punches alone in the same time, not flattened);
- **the infiltrator cannot lift the brute** (control: the grappler can,
  or none can and the control is a crate);
- **a thrown fighter knocks down a second bad guy** (an `impact` between
  two bad bodies; control: `bodyImpactOn` 0).

Trace before pinning (`node scripts/trace.ts`).

## Traps

- **Step 12's bound:** a scattered fighter is no outpost's; nothing calls
  waves outside the depot (D-063: no caller, no signaler, no help).
  Prove it once: a hero seen by a road fighter, and no wave person
  exists 20 s later.
- **Fighters follow through doors?** Measure whether a fighter walks
  through a walk door after a hero; if it does, the way-out check still
  holds, but say so in the handoff.
- **Determinism:** no randomness or clock.
- **Shared file `content/tuning.json`:** additive sections only, `git
  pull --rebase` right before each push, `npm run check` after. Steps 2,
  11, 12 and 17 push beside you.
- **Nothing under `src/`** in a commit that adds the level's content.

## Out of scope — leave alone

The depot's outpost, patrols, horn and hoard (slice 3); ranged enemies;
any fight code; Step 4's rules files and Step 12's kinds (reuse, never
edit); the look of the enemies (Step 8: say which sprites are wanted).

## Verified when

Scenarios with watched controls; `npm run build`; `npm run check` (time
it; it was 109 s at 9f59f97, say the new number); `npm run e2e` still
green; after the deploy `npm run check:deployed` exits 0; read
`/debug/errors` live before the push.

## Done, and where things go

Done: kinds, tuning, placements, toll and scenarios on `main` and live.
Phase 6: a row "an enemy kind" in `docs/architecture.md`'s "I need to
add…"; decisions in `docs/decisions-log.md`; a handoff note at the end of
`docs/plan/step-16.md`. Blocking question: message the lead at once.
Flags: `docs/for-the-lead.md`. Owner-only questions:
`docs/questions-inbox.md`. Final message: done or blocked, the commit.
Taste for the owner's list (don't ask): whether the kinds feel different,
whether sending one flying into another is an "OHHHH", whether paying the
toll is funny.
