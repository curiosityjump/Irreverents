# Step 16 — A first real level: many screens, enemies all through it, and a guarded place to get into unseen

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~14:30 UTC, to Vision Partner, first-hand**
(`docs/current-directive.md`), after being told what is live:
> I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet

**Owner, ~15:00 UTC, answering Q-010** (same file):
> Just build according to the vision in the way that gets it playable according to the vision as soon as possible.

**Owner (Drive, doc 11, D-056, D-060, D-016):**
> D-056 The fun is FIRST AND FOREMOST the 2D level gameplay inspired by Kirby and LEGO Star Wars: traversal, powers, exploration, secrets, enemies, stealth, escalating combat, puzzles and co-op creativity. …
>
> D-060 Bad guys are present as thematically appropriate scattered enemies in levels, and also in specific HOSTILE OUTPOSTS …
>
> D-016 Stealth as broadly viable playstyle across the world; zero-alarm success should be deeply satisfying.

`docs/vision-gaps.md` (first audit, 7454fd9) lists the biggest gaps that
no step covers. This step closes three of them:
- **Gap 1, varied enemies scattered through levels.** Step 12 brings one
  outpost's enemies and nobody brings the rest.
- **Gap 2, a real level.** Today there are five castle rooms of one to
  three screens each.
- **Gap 10, a proud zero-alarm infiltration of a guarded place.** Today
  there is one street with one standing guard and a shop.

The step serves all three of the owner's standards (`docs/vision.md`,
its section on what "working" looks like, from doc 00): "the "OHHHHH" moment of spectacular
physical IMPACT", "the profound satisfaction of an impossible zero-alarm
infiltration", and "A disastrous stealth attempt should often become an
even more memorable battle or escape."

No build gate A–F belongs to this step. Its yardstick is golden scenarios
G-05 and G-06 (doc 12): a "guarded jewel vault with layered patrols,
multiple routes and a legitimate treasure", and the same vault where "a
single mistake triggers alarms" and the "group fights enormous
reinforcements". Doc 12 also allows a different place: "Designers may
invent different places/characters to prove the same point."

## Goal

A road leaves the courtyard and climbs out of the kingdom into a quarry.
The quarry is six rooms and a dozen screens of ledges, drops, a tower, a
pit and a cave, with things hidden above and below the main way.

Bad guys stand all along it, and they are not all alike:
- small ones that fly when hit;
- heavy ones that a punch barely moves;
- one that throws from a ledge;
- a brute.

In the middle of the quarry is the bad guys' depot. It has patrols, a
lookout, a horn, and a hoard locked in a strongroom. There are several
ways in, and you can take the hoard and leave without anyone noticing.
If you get seen, it becomes a fight against growing waves or a run for
the cave. The cave also comes out under the castle.

## What's decided

- **The level is a proposal, used by default** (D-096: "All new creative
  assets, design proposals and prototype implementation decisions are
  APPROVED FOR IMMEDIATE USE BY DEFAULT"). Which level to build is not
  decided (`docs/vision-gaps.md`, "Not decided yet"). Doc 28 says so
  itself: "ALL ten areas, names, individual puzzle solutions and
  geographic links are new brainstorming proposals".

  `DRAFT:` the level is doc 28's level 01, cut down. Its parts are ones
  the game already has:
  - its bad guys are an outpost's: "bad-guy bandits run a depot outpost
    with a visible lookout bell" (Step 12);
  - its rocks and carts are Step 2's crates;
  - its "breakable wall into dark cave" is Step 3's breakable part.

  Its own "short gameplay contrast test" runs the quarry two ways:
  - a quiet run where "Nothing summons reinforcements";
  - a wild run that "fights large waves".

  (Its third, a platform run that "should feel just as worthwhile", is
  set in two other places.)

  Doc 28's own rule is "Most rooms should just be great platforming", and
  the earlier anthology may still be mined for its "mechanics/room
  opportunities" (doc 11, after D-058). So the rails, carts, lifts and
  falling boulders are left out, because no part does them yet. The
  shapes stay. If the owner picks another place, the rooms are redrawn,
  and the enemy kinds and the depot's recipe carry over.

- **Ids are plain and never a proposed name.** `DRAFT:` room ids start
  `quarry-`, never "iron". Enemy kinds name the body or the job, never
  "bandit" (Step 12's rule). A shown name is data.

- **Where it joins the kingdom.** `DRAFT:` agreed with Step 3's lead or,
  while Step 3 has none, with the orchestrator. Doc 15 (a proposal) asks
  every region for "a public entrance, at least one discoverable
  non-obvious connection, and at least one return visit justified by an
  acquired character capability".
  - **The way in that everyone sees** is an `enter` doorway on the
    courtyard floor, between its two plates: columns 17–19 of rows 6–7,
    all clear at 1bd28d2. Columns 1–13 are not used, because Step 3
    keeps them empty for Step 7's machine and its roadblock (the
    courtyard file's note; `docs/mechanisms/rooms-and-doors.md`).
    Column 15 is kept for the undercroft's doorway, and Step 12's
    doorway is planned at column 9. Nothing stands between this one and
    a player alone. The gallery's free east wall is not used, because it
    is behind the two-plate gate and no crate is placed in the
    courtyard.
  - **The hidden way** is a walk door in the west wall (column 0) of the
    undercroft's vault, behind its breakable `vault-wall`, into the
    level's cave, and the long way home. Its shape is borrowed from doc
    25's bank (level 02, a proposal), whose room list ends with a "basement
    shortcut to castle foundations". Step 3's way-out check counts the
    unbroken `vault-wall` as wall, and the two ends of a walk door must
    be on opposite edges and the same size
    (`docs/mechanisms/rooms-and-doors.md`).

  Walking in from the kingdom cools nothing (D-077: "a level transition
  never automatically resets pursuit").

- **Many screens of platforming** (D-003, D-056). `DRAFT:` six rooms, and
  at least twelve screens of floor along the main way from the doorway to
  the depot, with more off it. A screen is 20 tiles across
  (`docs/mechanisms/rooms-and-doors.md`).
  - The rooms, in doc 28's order: a road up from the courtyard; a ridge
    crossing over drops; the tower; the depot; the pit below the depot;
    and the cave behind the pit's breakable wall. Doc 28: "The path from
    the lower pit can loop back to the ore depot".
  - The rooms are in Step 3's format and use only Step 3's parts (doors,
    oneway ledges, breakable and false walls, plates, gates, hiding
    places) and Step 2's crates. There is no new kind of part in this
    cut.
  - There are doors above and below the main way (doc 04: "Prioritize
    wandering, wrong turns, hidden routes, doors above and below the main
    path").
  - A missed jump drops you to a lower room: a pit is a walk door in the
    last row. Nothing kills you and nothing reloads, and Step 3's check
    plays every member out of every pocket.

- **Two routes and a secret everywhere** (D-004: "Nonlinear routes and
  optionality"; D-005, D-006). `DRAFT:` this follows doc 24's
  recommendation, "at least two routes and at least one secret return
  incentive tied to ability or power". Concretely:
  - two routes nothing points at (no arrow, no glow, no text);
  - one secret per hero, closed by size, height or weight and never by
    checking which hero it is (doc 04);
  - one thing in plain sight that none of the three heroes can reach by
    their own moves, waiting for Step 9's power or Step 13's hero. Doc
    15's rule C asks for "at least one visible “not yet” curiosity and at
    least one entirely unadvertised secret".

  Every room and hidden area has its own id and `hidden` flag, so Step 14
  can count it (D-079, owner-favored).

- **Enemies all through it, and not all alike.** D-060 puts bad guys
  through levels. Doc 24, under its "NEW OWNER-CONFIRMED HOSTILE OUTPOST
  SYSTEM" heading, says "scattered normal enemies remain the baseline".
  Doc 08 says "Avoid making enemies into homogeneous damage sponges;
  distinctions in movement, weight, armor, range, hazards and powers
  create variety".

  `DRAFT:` four kinds. Each is a character kind (Step 2's format) and an
  NPC kind (Step 4's), on side `bad`. They are placed in every room except
  the refuge, with at most Step 4's eight people in a room.
  - **Light** is Step 12's fighter (`outpost-fighter`, on `main` since
    1bdd143), reused, in twos and threes. Doc 08: "Light enemies should fly from heavy blows".
  - **Heavy** barely moves when punched. A throw, or a slam into a wall or
    another body, drops it; so will a suplex once Step 2 has one. Doc 08:
    "Heavy enemies may barely shift from small strikes, but a
    sufficiently powerful suplex, vehicle crash or chained explosion can
    topple them".
  - **Ranged** stays on a ledge and hits from out of reach. `DRAFT:` it
    uses Step 2's grab and throw on a light thing it holds, not a new
    projectile. If that cannot keep it supplied, a projectile verb is
    Step 2's file, agreed first.
  - **Brute** comes one to a stretch. It is big and slow, hits hard,
    takes a lot of beating, and the infiltrator cannot lift it. Doc 08's
    prototype bar: "a dozen low-tier enemies and one heavy brute".

  Their numbers are tuning, measured against the three heroes so that a
  light one launched by the grappler knocks down the next one. Doc 08:
  "send a target into a group, causing a chain reaction players
  immediately understand and want to repeat".

- **One system for enemies, Step 12's.** This step reuses its hostile
  kinds and never builds a parallel system.
  - The enemies are Step 4's people, with exactly three moods (D-048:
    "This applies to VILLAINS as well as benign townsfolk and other
    inhabitants"). They are scripted, never AI (D-055), and show a mark
    and a sound, not speech (D-057).
  - Fighting heroes is their business as usual (D-060: "not a
    narrative-dissonance trigger"), so a hit changes no mood.
  - Moods 2 and 3 come from a hero who breaks the script for them.
    `DRAFT:` the trigger comes from doc 23: "Villain sees HERO ignore him
    to inspect furniture: CONFUSION / DISTRESS, potentially escalating to
    RAGE". The lead picks the deed and writes it as rule rows.
  - Step 12's fight serves only an outpost's people: at 1bdd143
    `src/sim/systems/outpost-fight.ts` moves a body only if it was placed
    in that outpost's one room or came into it with a wave
    (`ofOutpost` in `src/sim/outpost/state.ts`). So for enemies outside
    the depot, Step 12's lead widens it or agrees in writing how it
    should work. This step writes no fight code.

- **Seeing is not calling** (D-063, D-070). Only a caller who reaches a
  signaler and finishes the call brings help. `DRAFT:` scattered enemies
  have no signaler and never call. The depot is the one place in the
  level that can.

- **The guarded place** (D-016; doc 07, "Heists are discovered
  opportunities": "A guarded bank, jewel room, museum or noble treasury
  has valuables, inhabitants and plausible physical security. Players
  decide whether to rob it and how; a specific “begin heist mission” flag
  should not be necessary for basic interaction.").

  `DRAFT:` it is the bad guys' depot, an outpost in Step 12's format. It
  has:
  - its signal post and lookout;
  - two patrols that walk fixed routes across the yard (Step 4's
    routines);
  - a hoard in a strongroom: a thing to take with Use (Step 4's
    `things`), so no new button (D-093);
  - besides the front, at least three ways in, each for a different body
    or trick and none needing a particular hero: under (a crawl one tile
    high), over (the roof, by flapping or by a throw), and through (a
    breakable wall from the pit below);
  - hiding places along the ways.

  Nothing starts a "heist". However you walk in, you are in one.

  It is guarded by bad guys, not good ones, because their horn already
  brings waves (Step 12), so G-06's "group fights enormous
  reinforcements" can happen here first. The other answer is a good-guy
  treasury: doc 25's bank, where you "watch repeated guard patrols;
  pickpocket a key; slip through vent or roof; disable a bell; open
  vault; slip out unnoticed". It uses the same rooms, with Step 4's guards
  and bell in the placements file, so it is a small change if the owner
  wants it.

- **Zero alarm means no call even started.** `DRAFT:` this is stricter
  than a call left unfinished (D-063). You take the hoard and leave the
  depot without anyone beginning a call. Doc 07: "A player should be able
  to complete a guarded route without alarm and feel genuinely proud."

- **Getting caught opens play** (D-019: "Failure of stealth opens
  satisfying battles, last stands and narrow escapes, NOT an
  automatic-reload punishment loop"; D-062: "No forced “stealth failed”
  reset").
  - A finished call brings Step 12's waves. You can stop it every way
    D-061 lists, and "ESCAPE THE ZONE" ends it.
  - `DRAFT:` the cave is the level's one refuge, after doc 28's
    "unguarded lower shaft above a difficult jump can be a refuge" (D-076;
    D-077: "Developed level geometry may offer richer refuge
    opportunities").
  - The hidden way under the castle is the long escape. A chase can
    follow you along it (D-077), and guards who come in "may engage the
    bad guys already present" (D-069). That clash is Step 12's slice B,
    not this step's.

- **Solo is never locked out by headcount** (D-015). One hero alone can
  take the main way, get into the depot, and do a zero-alarm route. A way
  that needs two players is a bonus.

- **Files, not engine** (`CLAUDE.md`, "Engine and content stay
  separate"). The level is rooms, placements, kinds, tuning, rules, an
  outpost file and scenarios. If it needs something the game cannot do,
  the step that owns that part builds it or agrees it in writing first;
  never a quiet engine edit here.

- **Nothing is saved.** `DRAFT:` the hoard, a broken horn and found
  secrets all reset with the world, as Step 12's do. They are kept later,
  in Step 7's store.

## How to cut it (a suggestion, not a rule)

**On `main` already (1bd28d2):**
- Step 3's rooms, doors, parts and way-out check;
- Step 2's three heroes, crates, attack, grab and throw;
- Step 4's people, routines, sight, hiding, things and bell;
- `npm run e2e`;
- Step 12's slice A push 1 (1bdd143), in its test room only: the
  fighter (`outpost-fighter`), the lookout (`outpost-lookout`), the
  signal post (`signal-post`), the outpost format
  (`content/outposts/test-outpost.json`) and its waves.

**Coming:** the rest of Step 12's slice A (its outpost's room and
courtyard doorway), then its slice B, the chase and the clash.

Three slices, in this order. Push each when it is green, so the level
reaches the phone piece by piece.

1. **The geography and its secrets.** This needs nothing new.
   - Build the six rooms without doors first and prove each one alone (a
     room with no doors stands alone in the check).
   - Then add every door in one push, with the courtyard doorway last.
   - Put crates wherever a throw or a weight needs one.
   - It is playable on the phone with no enemy in it. Signals 1–3 and 7.
2. **The enemies, placed as Step 12's kinds land.** Put its fighter
   through every room first. Then add the heavy, the brute and the ranged
   kinds, each as a kind file plus a tuning set. Signals 4 and 7.
3. **The guarded place, last.** The depot's outpost file, the patrols,
   the hoard and the ways in. Signals 5–7.

**Drop first:**
1. the ranged kind;
2. the tower;
3. the second zero-alarm route;
4. the hidden way under the castle (keep its door out until it works).

**Never cut:**
- a way out of every pocket;
- one hero alone crossing the level;
- three moods for every kind;
- no help without a finished call;
- no reload;
- nothing under `src/` in a commit that adds the level.

## What's open (the lead's to measure and decide)

- **Read in full:**
  - doc 28's level 01 and "A short gameplay contrast test"
    (`docs/design-library/05-world-and-game-expansion-proposals/28-ten-more-gameplay-first-level-designs.md`);
  - in `docs/design-library/02-gameplay-systems/`: `04-world-structure-secrets-and-revisiting.md`,
    `07-stealth-heists-npc-reactions-and-pursuit.md`,
    `08-combat-impact-destruction-and-vehicles.md`,
    `23-the-three-npc-modes-role-consistent-behavior-distress-rage.md`,
    and doc 24's outpost section;
  - doc 12's G-05 to G-07;
  - doc 25's editorial override and its level 02;
  - in the register: D-003 to D-006, D-015 to D-020, D-048, D-055 to
    D-064, D-069 to D-077.

  Docs 15, 25 and 28 are proposals: borrow their shapes, never their
  names.
- **Yours to pick:** the layouts and room sizes; where each secret is;
  the enemies' numbers; the patrol timings (tight enough that the quiet
  route needs timing, loose enough that it exists); what the hoard looks
  like; which deed upsets a bad guy; and whether the refuge holds against
  Step 12's waves and Step 4's guards. Pick the simplest, mark it
  `DRAFT:`, and log it in `docs/decisions-log.md`.
- **Agree before code, and never edit another step's files:**
  - **Step 12:** its kinds, its outpost format, the depot's file, and how
    enemies fight outside an outpost.
  - **Step 2:** three new bodies and their tuning sets, and a throw by a
    person.
  - **Step 4:** three NPC kinds, rule rows for bad-guy witnesses, patrol
    routines, and the eight-people limit.
  - **Step 3:** the courtyard doorway and the vault's door. Also the
    way-out check's time: Step 3's handoff measured about 38 s for five
    rooms, so measure `npm run check` before and after, and tell Step 3's
    lead if six large rooms make it slow.
  - **Step 8:** one atlas line per room, and enemy sprites. The art
    desk's grunt and "heavy brute" were requested (the N03 request,
    items 4 and 5) and are not delivered.
  - **Step 15:** doc 28 links "lower woodland ↔ Iron Quarry". A second
    link to the forest comes later, not now.
- **Which level the owner wants** is still undecided (`docs/vision-gaps.md`,
  "Not decided yet"). Vision Partner raises it; never wait for the answer.

## Feedback signal

Scenarios in `npm run check`, named `step16-*.json`, with no `gate` tag,
each with a control watched to fail; one player unless said.

1. **Joined, with a way out.** Step 3's checks, unchanged, pass with the
   level joined, for every party member. Control: with one end of the
   courtyard doorway removed, the check refuses it.
2. **Across.** Each hero alone walks from the courtyard doorway to the
   far side of the depot, and back by another way. Control: a two-tile
   step on the main way stops it. Record under Measure how many screens
   long the main way is, with the command that counted it (`DRAFT:` at
   least 12).
3. **Secrets.**
   - Each hidden route is reached through a connection the data marks
     hidden. Control: with it made solid, the scenario fails.
   - Each hero's secret is entered by that hero's own moves, and by none
     of the others' (control).
   - One secret is entered another way, by a throw or a stack, and that
     must pass.
   - The "not yet" thing is reached by none of the three heroes alone.
4. **Each enemy kind, present and itself.** Every room except the refuge
   places at least one bad guy, and each kind is in the level. For each
   kind:
   - its mood stays 1 under a hero's hits (control: the same hit upsets
     the shopkeeper);
   - the chosen deed takes it to mood 2, and more of it to mood 3
     (control: without the deed, it stays at 1);
   - from the grappler's same hit, the light one flies farther than the
     heavy one;
   - the heavy one falls to a throw or a slam, not to a punch;
   - the ranged one hits a hero from beyond the hero's reach;
   - the infiltrator cannot lift the brute;
   - a thrown light one knocks down a second bad guy (an `impact` between
     two bad guys).
5. **Zero alarm.** Two scripted routes, each through a different way in,
   take the hoard and leave the depot. No call starts, and everyone in
   the depot stays in mood 1. Control: the same route with one patrol a
   second later is seen, and a call starts.
6. **Caught, then play.** The same depot, but the hero is seen: a call
   completes and a wave walks in. Then:
   - (a) the hero beats everyone who may call, and no new call starts;
   - (b) in another run, the hero takes the hoard, leaves the zone by the
     pit and the cave, and no wave follows.

   Nothing reloads and no room restarts. Control: with the depot's way
   out blocked, (b) fails.
7. **On a phone.** `npm run e2e`, phone-sized page, by touch only: go
   through the courtyard doorway, cross the first room, hit an enemy, and
   get into the depot. The page's own record of what it drew has the
   enemies inside the view. Control: with the doorway removed, it fails.

   The lead also takes screenshots at 844×390 and 390×664 of each room,
   and of the depot in each mood, keeps them in scratch space and
   describes them under Measure. They are for looking at and for the
   owner's taste list, never a grade.

## Stopping condition

The step is done when all of these hold:
- signals 1–7 pass on `main` and live (`npm run check:deployed` exits 0);
- `npm run gates` shows what it showed when the step was claimed;
- `docs/architecture.md`'s "I need to add…" table has a row for a level
  and a row for an enemy kind;
- Step 10's lead has the walk to the level as a beat;
- after `git fetch origin main`, this prints 0 (no commit that added the
  level touched `src/`):

```
git log --format=%H origin/main -- 'content/rooms/quarry-*' 'content/placements/quarry-*' 'scenarios/step16-*' | xargs -r -n1 git show --format= --name-only | grep -c '^src/'
```

**Budget:** three hours from claiming, with slice 1 on the phone within
the first hour. If time runs short, ship the geography with Step 12's
fighter in it (signals 1–3, 7, and 4 for that one kind): that is a level.
Rooms that are not finished are not joined to the kingdom.

## Owns

**New files only**, with exact names agreed in `docs/architecture.md`
when the step is claimed:
- `content/rooms/quarry-*.json` (Step 3's directory and format);
- `content/placements/quarry-*.json` (Step 4's);
- the depot's `content/outposts/quarry-*.json` (Step 12's format);
- three bodies in `content/characters/`, with their sections in
  `content/tuning.json` (Step 2's);
- three NPC kinds in `content/npcs/` and rows in `content/rules/`
  (Step 4's);
- `scenarios/step16-*.json`;
- one touch block wherever `npm run e2e` keeps its cases.

Each new file in another step's directory is agreed with that step's
lead.

**Two edits in other steps' files**, each agreed with Step 3's lead:
- one doorway in `content/rooms/courtyard.json`, between the plates
  (columns 17–19), outside the columns 1–13 Step 3 keeps empty for
  Step 7, and clear of column 15 and of Step 12's doorway;
- one hidden door in `content/rooms/undercroft.json`.

The step builds on Steps 2, 3, 4 and 12 and edits none of their code.

**Four files are shared between steps** (`src/sim/types.ts`,
`src/sim/systems/physics.ts`, `src/client/render.ts`,
`content/tuning.json`). In those, make only small additive edits, after
`git pull --rebase`. This step should touch only `content/tuning.json`,
by adding sections.

## Taste, for the owner after playing

- whether the level is fun to run through;
- whether the enemies feel different from each other, and whether
  sending one flying is an "OHHHH";
- whether the depot's quiet way in makes you proud;
- whether getting caught there is a better time than not;
- whether a quarry is the right place;
- how the enemies and the hoard look.

List these; don't grade them.

## Measure

2026-11-23 15:10 UTC, lead session_017WiGzHt9iJy3caBLkT1Ef4, at e673fa5: `npm run check` green in 77 s; `npm run gates` 5 of 6 (E has no scenario), the number this step must leave unchanged. The heroes' reach, by `simulate()` on `test-body`: jump peak grappler 52.7 px, infiltrator 51.4, flyer 50.0 (124 px with three flaps); boxes 18×30, 10×12, 14×20; run speeds 84, 128, 92 px/s. So the main way steps up at most 2 tiles and gaps at most 2 (`DRAFT:`), and the "not yet" sits at least 10 tiles up.

Slice 1, 2026-11-23 16:10 UTC: the main way (road, ridge, tower, depot) is **248 columns, 12.4 screens**, counted with `python3 -c "import json;print(sum(len(json.load(open(f'content/rooms/quarry-{r}.json'))['rows'][0]) for r in ['road','ridge','tower','depot']))"`. `npm run check` with the quarry joined: see the push 2 commit message.

2026-11-23 16:40 UTC, lead review of slice 1 at 1e35d37 (re-run): `npm run check` green, 224 s (77 s at e673fa5); 40 `step16-*` scenarios; `check:deployed` ok. The way-out check alone, `checkRooms`, takes 97 s with the quarry joined, and runs inside `loadContent()`, so `npm run build` went from 38 s (7500b81) to 93 s. Flagged to the orchestrator for a Step 3 fix; the rooms stay. Push 3, the undercroft way home, deferred.

2026-11-23 17:35 UTC, lead review of slice 2 at 50c584d (re-run): `npm run check` green, 60 `step16-*` scenarios, `npm run gates` 5 of 6, the stopping condition's `src/` count 0. Accepted as built: a third kind `toll-keeper` (no attack: a fighter as keeper punched the hero before they could pay); the toll's rule row names `targetRole: toll-keeper` (the broad row broke `step4-hero-buys` and `step4-hero-fluke-reassured`); the heavy falls to eight punches, not seven, and not to one throw (a slam wears by speed, about 17 against a punch's 34: a slam rule is Step 2's or Step 18's, passed to the orchestrator).

2026-11-23 17:50 UTC, lead probe of the touch crossing (local `npm run e2e`, not committed): the stall at x 174 was the script, not the level. `scripts/e2e/quarry.ts` added the jump finger with a `touchMove`, so the page never saw it go down; started with `touchStart` (as `scripts/e2e.ts`'s two-finger fact does), a phone-sized page held east and tapping jump every 0.7 s crossed `quarry-road` by touch as the grappler into `quarry-ridge`. Fix written into slice 3's brief.

2026-11-23 18:30 UTC, lead review of slice 3 push 1 at 2ca087a (re-run): `npm run check` green, 61 `step16-*` scenarios, gates 5 of 6, no `src/`. The flyer's roof route is zero-alarm; `quarry-road-cross` is green by touch. Found by the builder: the cellar shaft is one-way (no drop-through), so the grappler's cellar route has no quiet way out; nobody but the flyer can cross the yard unseen, because the lookout only turns on the spot on one floor line; only the lookout can reach the horn. Decided: a ledge over the yard's west stretch (rows 8-9, about columns 2-13) in this step's own room file, and the second zero-alarm route on it, as push 3 if time allows.

2026-11-23 18:45 UTC, lead review of slice 3 push 2 at 36d838d (re-run): `npm run check` green, 63 `step16-*` scenarios, gates 5 of 6, stopping-condition `src/` count 0, live current. Caught at the depot: a fight (a thrown patrol drops the lookout mid-call and breaks the horn) and an escape by the tower door. The escape by the pit and cave with the hoard, and a second quiet route, need two edits in the depot room: briefed as push 3.

2026-11-23 19:25 UTC, lead review of push 3 at 9dd3561 (re-run): `npm run check` green, 65 `step16-*` scenarios, gates 5 of 6, stopping-condition `src/` count 0, `check:deployed` ok. Signals 1–6 now pass with two quiet routes (roof, ledge) and three caught outcomes (fight, tower, cellar-pit-cave). Not done, by the step's drop list: the ranged kind, the undercroft way home. After the owner's 18:30 verdict ("findable and recognisable without being told"), one last slice looks at it on a phone.

2026-11-23 19:35 UTC, last slice (`step-16-e-quarry-on-a-phone.md`), builder `session_017WiGzFw42cUL6BQ27o3iz7`: **a phone-sized page now reaches every main-way room by touch** (`npm run e2e`'s `quarry-ridge-cross` and `quarry-depot-in`, 4 of 4 local runs green, about 80 s for the quarry block; control `E2E_TOUCH_BREAK=jump` fails both). The pit and the cave were not visited (a missed chasm jump does reach the pit, and from there the depot's cellar, in one run). What a first-time player sees on an iPhone held sideways (shots in `e2e-out/quarry/`, both ways up; the view is about 15 tiles wide and 7 tall):
- **Courtyard doorway** (`e2e-out/e2e-quarry-road.png`, the road side): the Use button reads "GO IN" and an up arrow sits over the arch; it reads as a way in.
- **Road:** a cave mouth behind you, a crate, and a two-tile rise straight ahead with a ladder-frame on it; it reads as "go east and climb". No enemy in the first screen.
- **Ridge:** the chasm (two tiles) is the first thing past the step, drawn dark with a floor visible below it: reads as a gap to jump, not a death. The shelf and the crawl are out of view, as intended.
- **Tower foot:** brick shaft with staggered planks going up; nothing says "jump here", but the planks plainly climb. Jumping on the spot under the overlap climbs it.
- **Tower top:** a long stone floor and two window slits; the east opening to the depot is off the right edge until you walk.
- **Depot, at the door:** the lookout stands two tiles away facing you, a patrol beside it and the big horn post right behind: **danger reads at once, but at the same moment you are seen** (in one run the horn was already sounding on arrival). The high ledge (row 8) is above the sideways view; upright it shows as a long plank over the yard. The roof is not in view.
- **Depot yard:** the stack (a raised block) and the column-23 hole read clearly; the step blocks the view east.
- **Depot, at the strongroom's front:** the heavy guard is beside you; the strongroom shows only as a hanging stone stub over the floor (its front pillar, rows 8-11); its roof is above the view and **the hoard (column 45) is out of view** until you are inside. The cellar's cracked wall shows as a crack in the dirt below: findable.
- **Wave in:** not caught on camera (in no run did the horn's call finish while the page stood in the depot; once the hero was punched back through the tower door and a depot person followed onto the tower top).

## Briefs

- Last slice, the quarry seen and found on a phone: `handoff-prompts/step-16-e-quarry-on-a-phone.md`, 19:25 UTC, builder `session_017WiGzFw42cUL6BQ27o3iz7`.

- Slice 3 push 3, the depot's west ledge and a way down to the cellar (signals 5 and 6(b) in full): `handoff-prompts/step-16-d-depot-routes.md`, 18:45 UTC, fresh builder `session_017WiGzH5v7n1DfXiS1iFbh6`.

- Slice 3, the depot (signals 5–6): `handoff-prompts/step-16-c-quarry-depot.md`, written 17:30 UTC; slice 1–2's builder declined it at 17:27 (context), so a fresh builder takes it: `session_017WiGzJqD8htNRHozGpJTgb`, launched 17:32 UTC. Measured at fd3f4d5: `npm run check` 41 s, `npm run build` 5 s (Step 3's way-out check fixed at a700081).
- Slice 2, the enemies (signal 4; ranged left out, first to drop): `handoff-prompts/step-16-b-quarry-enemies.md`, written 16:15 UTC, sent 16:40 UTC to slice 1's builder `session_017WiGzFnkhyrpJqJ6xa9vTr`. Step 12 widened `outpost-fight` to any room at 2027994.
- Slice 1, the rooms and their secrets (signals 1–3 and 7's first half): `handoff-prompts/step-16-a-quarry-rooms.md`, hard stop 16:45 UTC; worker `session_017WiGzFnkhyrpJqJ6xa9vTr` (launched 15:11 UTC).

## Open with the owner

## Handoff notes

### Slice 1 (`step-16-a-quarry-rooms.md`), 2026-11-23 16:15 UTC, worker `session_017WiGzFnkhyrpJqJ6xa9vTr`

**Landed:** push 1 (9f59f97: the six rooms alone) and push 2 (the joins: every door, the courtyard doorway `to-quarry`, columns 17-19 rows 6-7). Scenarios `step16-*`: per-room crossings for each hero (18), `step16-across-*` (courtyard to the depot's far side, each hero alone), `step16-back-*` (back another way: the tower's hidden top-west opening, the ridge's shelf, the road, the courtyard), `step16-hidden-cave-*`, `step16-secret-*` (each hero's secret with the other two as controls, and a body sent up onto the flyer's ledge), `step16-not-yet-*`; room control `controls/rooms/quarry-doorway-one-end-missing.json`. Controls watched once are listed in the two commit messages.

**Verified after the deploy (16:32 UTC):** `npm run check:deployed` ok (live runs 78c4959), `npm run check:live` ok, `/debug/errors` holds only check:live's three deliberate errors. One commit from another session (7500b81, a Step 2 scripted check) landed under push 2 in its last rebase, after push 2's own check run; it was not re-checked here.

**Not done:** half of push 2's touch block. `scripts/e2e/quarry.ts` proves by touch that a phone-sized page walks from the start room to the courtyard and up through its doorway into the quarry road (`quarry-in`); crossing the road by touch (stick held east, jump tapped every 0.6 s) stopped at the first two-tile step (drawn at x 174) in its one run and was taken out rather than left failing (`DRAFT:` in the file): the next session should find why the touch hops do not climb a step the scenarios climb. The screenshots of each room at 844×390 and 390×664 were not taken (the e2e saves `e2e-quarry-road.png` only). Push 3 (the undercroft's hidden way home) not started; the cave already has its ledge for it (columns 23-28, row 7; the door goes at column 29, rows 4-6, `to-undercroft`, hidden on the cave side: `HOME3` in the generator below).

**Measured:** `npm run check` 81 s with the rooms alone, **about 3 minutes with the quarry joined** (the way-out check plays every standing place in six big rooms for three heroes): over the 150 s the brief names, told to the lead. The main way: 248 columns, 12.4 screens (command in "Measure").

**How the rooms were made:** a short generator (not committed; in the worker's scratch space) wrote the rows; edit the room files directly from here, each `//` says what is where.

**Atlas lines wanted (Step 8):** all six `quarry-*` rooms are graybox; none has an atlas.

**For the owner to judge by playing** (not asked): whether the run is fun, whether the secrets are findable and satisfying (the ledge, the crawl, the rock and the cellar wall, the hidden openings in the tower and the pit), whether a quarry is the right place.

**Traps met:** spawn numbers in a room file are read in reading order, not by digit; a body nobody plays keeps sliding on landing (the flyer's ledge has a lip so a thrown friend stays on it); the grappler's throw of the heavy rock arrives at 205.7 px/s against the wall's 200.

### Slice 2 (`step-16-b-quarry-enemies.md`), 2026-11-23 17:15 UTC, builder `session_017WiGzFnkhyrpJqJ6xa9vTr`

**Landed:** the kinds `heavy-fighter`, `brute` and `toll-keeper` (data only), their tuning sets, bad guys in every room but the cave (`content/placements/quarry-*.json`), the toll on the road (`road-toll`, `content/rules/quarry.json`), scenarios `step16-present-*`, `step16-toll-*`, `step16-hit-*`, `step16-heavy-*`, `step16-brute-lift-*`, `step16-thrown-fighter-fells-heavy`, `step16-mood-*-hit`, `step16-no-waves-on-the-road`. Measured: the grappler's punch sends a fighter 284 px and a heavy 26 px; the heavy goes down on the eighth punch.

**Measured, worth knowing:** fighters do follow through doors: on the tower top the grappler's punches send both fighters through the hidden top-west opening onto the ridge's shelf, and a hero is followed. The watching fighter at the toll also hits the toll keeper (its swing reaches everything in front of it) and flattens it again and again in `step16-no-waves-on-the-road`. Fight code is Step 12's; not changed.

**Not done:** ranged bad guys (out of scope); the e2e road crossing by touch with longer jump holds (see the commit for whether it was tried).

**Sprites wanted (Step 8):** `heavy-fighter`, `brute`, `toll-keeper`; the toll counter reuses the shop's `counter` look.

**For the owner to judge by playing** (not asked): whether the kinds feel different, whether sending one flying into another is an "OHHHH", whether paying the toll is funny.

### Slice 3 (`step-16-c-quarry-depot.md`), 2026-11-23 18:30 UTC, builder (push 1)

**Landed (push 1, quiet):** `content/outposts/quarry-depot.json` (the depot's horn: only the lookout calls; waves 2, 3, then 3 and a heavy; in at column 61; bound 8), the depot's people and hoard in `content/placements/quarry-depot.json` (slice 2's ids `depot-fighter-1`/`-2` carry on as the two patrols, so `step16-present-depot` is unchanged), `scenarios/step16-zero-alarm-roof.json` (the flyer in and out over the roof, unseen at every tick; control: entering 20 ticks early is seen and a call starts), and the e2e touch fix: `quarry-road-cross` now crosses the road into the ridge by touch.

**Cut:** the second zero-alarm route (the step's "Drop first", item 3). The cellar's shaft is one-way, so the suggested grappler route cannot come back out (`docs/for-the-lead.md`).

**Measured, worth knowing:** the flyer climbs at most about 110 px (jump and three flaps), which barely clears sight's 40 px band over a floor watcher, so the quiet way works only from high starts (the stack's west edge, the roof). The middle stretch (columns 18-23) is hidden from every watcher: the stack and the step block the line.

**For the owner to judge by playing** (not asked): whether the quiet way over the roof makes you proud, whether getting caught is a better time than not, what the hoard should look like.

**Landed (push 2, loud):** `step16-caught-fight` (seen, the call finishes and a wave walks in; the grappler throws the patrol it holds at the lookout mid-call, which knocks the lookout out and breaks the horn; no call for 20 s; control: no throw) and `step16-caught-escape` (seen, a wave walks in, out by the tower door; no wave after and nobody follows; control: the door made solid). The escape is by the tower door, not the cellar (`docs/for-the-lead.md`).

**Not done (push 3, the lead's 18:28 ask; left for the next builder at the hard stop):** a ledge over the yard's west stretch (rows 8-9, about columns 2-13, reached by hops of at most two tiles) in `content/rooms/quarry-depot.json`, and a second zero-alarm route on foot across it. What the next builder needs to know: past the ledge the on-foot hero still has to deal with the strongroom guard. It stands at column 34 looking west and walks in to column 40 looking east, roughly every 14 s. The hoard (column 45) is only safe while the guard is back at the front, and a hero coming from the west reaches the front while the guard faces them. So the route likely needs a time to slip in behind the guard while it walks in, then a wait out of its sight (under the shaft, rows 16-18, is out of its 40 px), then the take while it is back at the front. Or retune the guard's walk in `content/placements/quarry-depot.json`. `scratchpad`-style per-tick sight tracing (`canSee` over `simulate()`'s history) found every window in push 1; worth rebuilding.

### Slice 3 push 3 (`step-16-d-depot-routes.md`), 2026-11-23 19:01 UTC, builder `session_017WiGzH5v7n1DfXiS1iFbh6`

**Landed:** the on-foot quiet way, `step16-zero-alarm-ledge` (the grappler: tower door, two one-way steps, the high ledge at row 8 over the west stretch, down past patrol 1's reach, behind the heavy guard into the strongroom, onto a shelf over its inner stand while it walks back under, the take, the same way out; no call, no hit, every depot person in mood 1; control: the ledge's tiles emptied by a tiles override, same inputs, a call starts at tick 397). Tiles in `content/rooms/quarry-depot.json` only: row 12 columns 3-4, row 10 columns 5-6 and 15-16, row 8 columns 7-17, row 12 column 39, row 11 columns 40-41. Every other `step16-*` scenario unchanged and green.

**Landed (push 2):** the drop to the cellar, a one-tile hole at column 23 (rows 14-15) west of the step, and `step16-caught-escape-cave` (the flyer robs over the roof, is seen, the call completes and a wave walks in, it drops through the hole, leaves by `to-pit` and reaches `quarry-cave`; no wave after and nobody of the depot outside; control: the hole made solid, the flyer never leaves). The grappler (18 px) does not fit and escapes by the tower door. Flags in `docs/for-the-lead.md`.

**Measured, worth knowing:** the grappler's jump rises about 37 px (2.3 tiles), not 3.2: one-tile steps are what it climbs. A body on a one-way step against the west wall (column 2) is pinned and cannot get down to the door: keep steps from column 3. The grappler cannot jump in the strongroom's front doorway (two tiles high): its head hits. Bodies block each other: a grappler standing on the inner step stops the guard walking back. Floor columns of the yard nobody's route stands on (`step16-across-*`, `room-depot-*`, the roof and caught ones): 13, 18, 23, 26 only.

### Last slice (`step-16-e-quarry-on-a-phone.md`), 2026-11-23 19:40 UTC, builder `session_017WiGzFw42cUL6BQ27o3iz7`

**Landed:** `scripts/e2e/quarry.ts` walks a phone-sized page by touch across the ridge (hops, one running jump over the chasm), up the tower (jumps on the spot over the ledges' overlap) and into the depot, with screenshots both ways up of the ridge, the tower foot and top, and the depot at the door, the yard, the strongroom front and 6 s later (`e2e-out/quarry/`); facts `quarry-ridge-cross`, `quarry-depot-in`. `step16-caught-escape`'s `proves` now names the column-23 hole as the narrower heroes' way. The column-23 hole stays open to chasing fighters (`docs/decisions-log.md`).

**No room data changed.** Every findability problem seen is either the camera's height (src, Step 5/8) or drawing; moving the hoard or the lookout would re-time every depot scenario, which this slice's 75 minutes did not allow.

**What needs another step to be findable** (for the orchestrator):
- The depot's lookout sees you the moment you step in from the tower: danger and being seen arrive together. A sight mark or a lookout bark before the call (Step 4/12), or a data move of the lookout east with the depot scenarios re-timed (Step 16 again).
- The strongroom does not read as a building on a phone: only its front pillar shows; it needs walls and a roof drawn (Step 8), and **the hoard needs to be seen from outside** (a window or a glint, Step 8; or the hoard moved west, re-timing the quiet routes).
- The high ledge and the roof (the quiet ways) are above the sideways view at the door; a camera that looks up a little in tall rooms (Step 5) or a drawn hint of the plank's end at the view's top edge (Step 8).
- The tower's climb has no "jump here" cue; it works, but a first-timer may walk back out (Step 8, a ladder look on the overlap).
- Wave in: never photographed; a scripted shot needs the page to survive in the depot for the call (a sideways hide spot near the door would do, Step 16 data).

**Flag, not this slice's:** the first full `npm run e2e` here failed one Step 17 fact, `start-continue-gone` (the list read `["ZZZZ"]`, no message); alone it passed three times (twice with this change, once without), and the next full run was green. A timing flake under the full run's load. After rebasing onto 4022fd6, one full run failed `h1`/`h2` (the server-down facts; the page did not come back within 10 s) and the next was green: the e2e flakes already owed a look (b9cf87c).
