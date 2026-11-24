# Step 24 — An enemy who fights from range

**Reference.** Plan step; its status line is in docs/plan.md.

Drafted 2026-11-24 for the orchestrator against `9dbd705` (`origin/main`).
Nothing in it was run: every number below was read from the files named,
and every arc is arithmetic for the builder to trace (`node scripts/trace.ts`).

## Why

The gap: `docs/vision-gaps.md` row 1, "Varied enemies to fight and sneak
past, scattered through every level (light, heavy, ranged, a brute ...)",
second in the order to work them. Still missing there: "no ranged kind
(none in `content/characters/`); nobody bad in the courtyard, undercroft,
gallery, throne room, quarry cave or cantina". Measured: the 26 files in
`content/characters/` hold no body that throws, and the 6 NPC kinds on side
`bad` (`brute`, `heavy-fighter`, `outpost-fighter`, `outpost-lookout`,
`toll-keeper`, `villain`) all fight by walking up and swinging
(`src/sim/systems/outpost-fight.ts:121-136`) or do not fight at all.

**The owner, first-hand.**

- 2026-11-23 ~16:05 UTC, to the orchestrator (`docs/vision.md:217`):
  > Enemies or provoked good guys need to be able to fight too.
- 2026-11-24 ~00:50-01:05 UTC, playing (`docs/vision.md:228`):
  > Alarms don't seem to do anything yet. Enemies can't be fully defeated, neither can heros, and enemies don't give chase if you are not right in front of them.
- 2026-11-22, Drive, doc 01 (`docs/vision.md:74`):
  > Irreverents should feel like a Kirby or LEGO Star Wars-style 2D action-adventure: superb movement, readable enemies, secrets, powers, co-op puzzles, stealth, explosive fights and interesting geography.
- 2026-11-22, Drive, doc 00 (`docs/vision.md:68`):
  > The emotional standard is the "OHHHHH" moment of spectacular physical IMPACT, balanced by the profound satisfaction of an impossible zero-alarm infiltration. A disastrous stealth attempt should often become an even more memorable battle or escape.
- "What it is not", 2026-11-22, Drive, doc 00 (`docs/vision.md:103-104`):
  > - Do not simplify combat down to damage numbers; collision force and consequence are essential.
  > - Do not confine mayhem to designated levels or protect the Hall of Legends from gameplay.

**The library, by its own labels.**

- CONFIRMED (doc 11, the decision register,
  `docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`):
  D-020 (:65) "Spectacular IMPACT is a top priority: suplexes, launches,
  heavy collision, knockback into walls/other enemies, and roadblock
  crashes." D-021 (:67) "Generally asymmetric combat: heroes outpower most
  common enemies, but crowds and escalating resistance can become
  overwhelming." D-056 (:249) "... traversal, powers, exploration, secrets,
  enemies, stealth, escalating combat ...". D-060 (:261) "Bad guys are
  present as thematically appropriate scattered enemies in levels ...
  Fighting villains in the expected hero-versus-villain manner is Business
  As Usual for them". D-055 (:241, "OWNER-CONFIRMED SCOPE CONSTRAINT") "NO
  NPCS WILL HAVE AI. ... fixed response behaviors." D-062 (:265) "enemy
  reactions and signaler use are scripted event triggers and fixed routes".
  D-009 (:41) "Abilities and/or weapons can be acquired from enemies or the
  map, Kirby-style." D-093 (:371) iPhone first: "Mobile touch ergonomics,
  legible pixels and actual phone performance".
- Doc 08, *Combat Impact, Destruction and Vehicles*
  (`docs/design-library/02-gameplay-systems/08-combat-impact-destruction-and-vehicles.md`),
  whose status line (:7) is "High-priority feel and simulation goals", not
  a CONFIRMED decision: "Avoid making enemies into homogeneous damage
  sponges; distinctions in movement, weight, armor, range, hazards and
  powers create variety." (:19); "Light enemies should fly from heavy
  blows." (:33); "projectiles, debris and enemies can transmit force"
  (:37).
- **No D-number names a ranged enemy or a projectile.** `grep -c -i -E
  "ranged|projectile|archer|missile|shoot|\barrow"` over doc 11 prints 0. "Ranged" is doc 08's goal word (:19), the gap row's reading of it,
  and a pose on P08's enemy sheet, whose manifest says "SOURCE_ONLY" and
  "Additional foes: signaler, ranged, armored, bomber, beasts, skeleton and
  caster poses"
  (`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p08-additional-townsfolk-enemies-building-blocks-biomes-source/manifest.json`;
  the sheet itself is not in the mirror). Doc 28's mirrors that "redirect
  marked enemy projectiles" (:93) are a PROPOSED level design, not a decision.
- Nothing in the library argues against an enemy who throws. What bounds it:
  D-021 (heroes outpower him, so he is light and fragile), D-055 and D-062
  (a fixed throw on a fixed trigger, never aiming), D-020 and "What it is
  not" (the hit is a launch, never a number).

**Earlier plans.** Step 16 dropped "the ranged kind" first
(`docs/plan-archive.md:1833`), with the `DRAFT:` "it uses Step 2's grab and
throw on a light thing it holds, not a new projectile. If that cannot keep
it supplied, a projectile verb is Step 2's file, agreed first"
(`docs/plan-archive.md:1701-1704`). Step 18 left the villain's orb cast for
"a projectile verb" (`docs/plan/step-18.md:197-198`). Since then Step 23
built the thing both were waiting for: a thrown weapon that flies, launches
the first body it meets and lies where it lands (`src/sim/systems/weapon-move.ts`).
This step uses it; it writes no projectile verb.

## Goal (what a player sees and does)

Coming into a room, a player sees a hooded bad guy standing up high, his
sight band drawn in front of him. If they walk into it, he raises something
over his head and a dotted arc shows where it will come down; a beat later
he throws it and it sails along that arc. Standing in it, the hero is
knocked flying (a launch, never a number), and a few of those floor them
and cost a heart. Stepping out of the arc, or jumping as it comes, lets it
land behind them, where it lies: walk over, the Use button says "Pick up",
take it and Hit throws it back at him, and he flies off his perch. Hit him
while he is winding up and he tumbles, his throw lost, the thing he held
knocked to the floor for anyone. Up close he is weak and light (D-021):
climb to him and one good blow sends him off his ledge. Knocked out twice
he is gone for good, in a poof, like every bad guy. Getting there unseen is
always possible: he looks one way. Two friends see the same arc and the
same throw; one player alone can do all of it; every part is a touch with
the five buttons that are already there.

## What's decided

- The owner's words and the CONFIRMED entries above. In particular: no
  numbers on screen; the hit is knockback, a fall costs a heart
  (`content/hearts.json:6`, `"per": "fall"`); fighting heroes is business
  as usual for him (D-060), so his mood stays 1.
- **Scripted, never aiming** (D-055, D-062). His throw is a fixed arc set
  in his data (speed and lift), thrown the way he faces, when a hero is in
  his sight band and within his range; he never computes where a hero will
  be. Players learn where it lands, as with a Kirby enemy.
- **A telegraph before every throw** (D-093, "legible pixels"; the
  owner's "readable enemies", `docs/vision.md:74`). `INTENT:` no shot
  leaves his hand without first being drawn held up, with its arc, for his
  whole `aim` time.
- **Data, not code** (`CLAUDE.md`, "Prefer data to code"). A thrower is an
  NPC kind with a `ranged` block naming a weapon to throw and the throw's
  numbers. A second kind that throws is one file, `content/npcs/<id>.json`,
  on any body that lists `attack`; a new projectile is one weapon file
  (`docs/architecture.md:254`, "a weapon").
- **It builds on what is there** (read at `9dbd705`):
  - Who fights: `outpost-fight` drives every `bad` person whose body lists
    `attack` (`src/sim/systems/outpost-fight.ts:72-75`), walking him at the
    hero he sees (`:121-123`) and pressing Hit in reach (`:136`,
    `npcChargeReach` 14, `content/tuning.json:15`). Systems that write a
    person's input overlay each other in order: npc-act 50, outpost-fight
    58, clash-fight 59 (`src/sim/systems/clash-fight.ts:20`). Free orders
    between 63 and 94; weapon-toss is 95, the verbs 100.
  - Seeing: `canSee` (`src/sim/npc/sight.ts:46-59`), per kind through
    `sight: { range, height }` (`src/sim/npc/sight.ts:31-35`;
    `src/content/kinds/npcs.ts:39`), drawn as the band by `sightBox`
    (`:71-79`). The world's default is 112 by 40 px
    (`content/tuning.json:7-8`).
  - The flying thing: a loose weapon made by `makeLoose`
    (`src/sim/weapons.ts:161-188`) with `flying: { by, met }` launches the
    first body it meets by its `thrown.strength` over that body's weight,
    capped at `maxLaunchSpeed` 520 (`content/tuning.json:25`), wears it by
    `thrown.wear`, emits `hit` and `weapon-struck` with the thrower as `by`
    (`src/sim/systems/weapon-move.ts:85-110`), and then lies loose. A
    friend is spared only when thrower and target are both players
    (`:96`). Use picks a loose weapon up (`src/sim/use/weapon.ts:28`); a
    `use: "throw"` weapon in hand is thrown by Hit
    (`src/sim/systems/weapon-toss.ts:22-40`).
  - Losing it: a hard hit or a fall knocks a held weapon loose from any
    holder, played or not (`src/sim/systems/weapon-loose.ts:1-12`,
    `powerHardHitSpeed` 180).
  - Hearts: a `flattened` whose `by` is an NPC enemy costs a hero a heart
    (`src/sim/systems/heart-lose.ts:32, 46-48`); the shot's `wear` carries
    the thrower as `by` (`src/sim/body-state.ts:170-180`), so a thrower's
    shot that floors a hero costs a heart with no new code.
  - Beaten for good: `beaten: { after, slam }` per NPC kind
    (`src/content/kinds/npcs.ts:56`), the `defeated` event
    (`src/sim/beaten.ts:32`); back at his place after `beatenReturnTime`
    90 s (`content/tuning.json:45`).
  - A kept game gets a later build's new placements on load
    (`docs/mechanisms/saves.md:70-71`).

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 24")

- **The body.** A new kind `ranged-fighter` (a role word, as
  `heavy-fighter`; the shown name is data: `DRAFT:` "Slinger"): box 14×26,
  verbs `move`, `attack`, `body`; light and fragile: weight 30, toughness
  50 (the grappler's punch wears 34, `content/tuning.json:164-171`, so two
  punches floor him), `beaten: { "after": 2 }`. Up close he swings weakly
  (outpost-fight's own swing, a small `attackStrength`).
- **He holds his post.** He never walks after a hero and never searches
  (no `search` block); he turns to face, aims and throws. So a perch keeps
  him on it, and getting under or behind him is the answer to him.
- **The throw** (a `ranged` block in his NPC kind): `range` 176 px,
  `aim` 0.6 s, `every` 2 s, a fixed arc of `speed` 200 px/s forward and
  `lift` 0.6 (up at 120 px/s), at most `out` 3 of his shots lying in the
  room (the oldest goes in a poof when a fourth would lie). Each number is
  a first guess to trace.
- **The projectile is a weapon file**, `content/weapons/thrown-shot.json`:
  `use: "throw"` (a hero who picks it up throws it back with Hit), box
  10×10, `thrown` strength 12000 and wear 30, no `sources`, no `carriers`.
  Against the heroes' weights (grappler 60, infiltrator 26, flyer 30:
  `content/tuning.json:165, 193, 223`) it launches them at 200, 461 and
  400 px/s; against their toughness (160, 80, 90: `:166, 194, 224`) the
  grappler falls on the sixth shot, the others on the third.
- **Art: no new art tonight, so two stand-ins, both `DRAFT:`.** His body
  is the toll keeper's cut sheet, `assets/sprites/cast/toll-keeper.png`
  (a purple-hooded figure with attack frames; `content/sprites/toll-keeper.json`
  cuts it at 56×48 with anchor 21, 22), in a new
  `content/sprites/ranged-fighter.json` that points at it: the toll keeper
  stands only on the quarry road, so the two rarely share a screen. The
  shot uses the boomerang's cut looks in the `weapons` group,
  `weapon-boomerang-ground`, `-held`, `-swing`, `-impact`
  (`content/looks/weapons.json:31-34`, from `assets/props/weapons.png`):
  orange, distinct from the dark bomb, readable at 28 px. It does not come
  back (yet). When the art desk cuts P08's "ranged" poses, the sprite file
  is edited to point at them; nothing else changes (D-097: placeholders
  labelled).
- **No swing-deflect in slice 1.** `docs/deliberate-designs.md:92` (Step 23,
  `INTENT:` at `WEAPON_KIND`, `src/sim/weapons.ts:76-85`): "A weapon lying
  on the ground is not a body: a swing passes through it". The ways to
  answer a shot are dodging it, taking it after it lands and throwing it
  back, and hitting him during the wind-up. Batting a shot out of the air
  is the open question below; built, it would touch flying shots only.
- **Where slice 1 puts him: the Hall gallery's balcony** (reasons under
  Slice 1).

## Open (for the owner, by playing; nothing waits on him)

- **"When a bad guy throws something at you, should a well-timed Hit bat it
  back at him?"** `DRAFT:` not yet: a swing passes through a thrown thing,
  as through one lying on the floor; you take it after it lands and throw
  it back. Saying yes is one new rule for things in flight.
- **"Should a thrower always lob the same distance, so you learn where it
  lands, or throw shorter when you are close?"** `DRAFT:` always the same
  distance.
- **"Should a thrower walk to a better spot, or stay where he stands?"**
  `DRAFT:` he stays put and only turns.
- **"Should he throw at the town guards too, when they come after you?"**
  `DRAFT:` only at heroes; guards and he fight hand to hand as the camp's
  people do (`content/hostility.json`).
- **"Should his thrown things stay on the floor for you to use, or vanish
  after a while?"** `DRAFT:` they stay, three of his at most; a fourth
  makes the oldest vanish.
- **"Does the hall of your legends feel like the right place for one?"**
  (`docs/vision.md:104`: "Do not ... protect the Hall of Legends from
  gameplay.") `DRAFT:` yes, one, on the balcony.

## The signal (re-runnable)

Scenarios `scenarios/step24-*.json`, each with a control watched to fail
(`docs/mechanisms/scenarios.md`):

1. `-throws-from-range`: a hero standing in his band 7 tiles off is aimed at
   (`ranged-aim`) and struck by his shot (`weapon-struck`, `by` him), and
   flies away from him (velocity sign). Control `-throws-from-range-control`:
   the same hero behind him (he faces away): no `ranged-aim`, no
   `weapon-struck`.
2. `-aim-before-shot`: his shot leaves (`weapon-dropped`, `how` `thrown`, his
   id) exactly `aim` seconds after `ranged-aim`, never before (`event-where`
   with `count [0,0]` over the aim's ticks). Control: a hero seen beyond
   `range`: no aim, no shot.
3. `-jump-dodges`: a hero who jumps when the aim starts is not struck; the
   shot lies behind them (`weapon` fact `loose`, `x`). Control: no jump,
   struck.
4. `-hit-during-aim`: punched during the aim, he tumbles, no shot is thrown,
   and his shot lies loose by him. Control: not punched, the shot is thrown.
5. `-throw-it-back`: a landed shot picked up with Use and thrown with Hit
   strikes him (`weapon-struck`, `target` him) and he flies. Control: thrown
   the other way, he is not struck.
6. `-costs-a-heart`: his shots floor the infiltrator and `heart-lost` names
   him as `by`. Control: the same shot thrown by a friend (player b) costs
   no heart.
7. `-holds-his-post`: a hero seen beyond range for 10 s: his x moves less
   than 2 px. Control: an `outpost-fighter` on the same tile walks at the
   hero (x moves more than 16 px).
8. `-beaten-for-good`: knocked out twice, `defeated` for him. Control: once,
   no `defeated`.
9. `-shots-capped`: after five throws at most three of his shots lie in the
   room. Control: after three throws, three lie.
10. `-one-file`: a second thrower written as one file, `content/npcs/<id>.json`
    with a `ranged` block naming the bomb, on a camp fighter's body: his bomb
    bursts by the hero and the hero flies; `grep -rn <id> src` finds 0 lines.
    Control: the same body with the `outpost-fighter` kind walks up and swings.
11. `-gallery-seen-on-the-floor` (the real room, `"placements": true`): a
    hero walking east on the gallery floor past column 12 is aimed at and a
    shot is thrown; climbing the steps, they are struck. Control: a hero
    who stays west of column 9 (behind him) is not aimed at.
12. `-gallery-way-out-grappler`, `-infiltrator`, `-flyer`: each party
    member alone climbs the steps under fire and leaves over the roofs
    (`in-room` `castle-street`) within a bound the builder measures and
    states. Control `-gallery-way-out-control`: the same hero standing
    still on a step in his arc is struck within that bound (the climbs
    really are under fire).

`npm run e2e`, one fact by touch (`scripts/e2e/ranged.ts`): two
phone-sized pages open the courtyard gate as `scripts/e2e/plates.ts` does,
page A walks into the gallery and east on its floor, and **page A draws the
thrower's aim (`window.irreverents.drawn.ranged`) at least `aim` − 100 ms
before it draws his shot loose (`drawn.weapons.loose`, weapon
`thrown-shot`)** (`ranged-telegraph`). Wanted, not required: page A
reaches the landed shot, the Use button reads "Pick up" (`data-state`
`pick-up`) and a tap puts it in A's hand (`drawn.weapons.held`). Control `E2E_RANGED_BEHIND=1`: page A stays west of
column 9 and no aim is drawn. Screenshots at 844×390 and 390×664 under
`docs/plan/step-24-shots/`: the aim and its arc, a shot in the air, a hero
launched, the shot in a hero's hand.

## Stopping condition

The signal passes on `main` and live, and every castle room the gap names
(courtyard, undercroft, gallery, throne room) has at least one bad guy a
player can fight or sneak past, with `npm run check` green.

## Slices

### Slice 1: one thrower, as data, on the gallery's balcony

Brief: `handoff-prompts/ranged-enemy.md` (drafted with this file).

**The place: `hall-gallery`, standing on the balcony at tile [9, 2],
facing east.** Why there and not elsewhere:

- **Nobody is building there.** Builders are in the Bandit Camp (Step 20 B),
  the castle street (Step 4's town tiers), the Iron Quarry and its road
  (Step 22; Step 23's push 5 places the spear and bomb in the quarry,
  `handoff-prompts/weapons-pick-up-and-swing.md:209-216`). Step 7 owns the
  Hall and is unclaimed (`docs/plan.md:311`, slice B done).
- **Least coupled castle room, measured.** Scenarios whose own room is the
  gallery: 0; scenarios that load its placements: 0. One real-server check
  goes there, `scripts/checks/step7-hall.ts`, which puts player b at column
  3 (`:106`), behind a thrower facing east. Compare the undercroft: 17
  scenarios in the room, 4 loading its placements
  (`step3-weight-heavy-crate-thrown`, `step3-weight-king`,
  `step14-find-vault`, `step14-place-found-once`), and the e2e
  `scripts/e2e/plates.ts` stands two pages on its stone plate
  (`plates-part-sunk`, `plates-pocket`, `:176`, `:196`): a thrower there
  would knock them off. The courtyard is crossed by 17 e2e and check
  scripts; the throne room has 9 scenarios loading its placements and is
  Step 6's.
- **It makes a new problem where one is wanted.** The gallery sits behind
  the courtyard's two-plate gate (`content/rooms/courtyard.json:2`, column
  25); with the gate shut, its way out is the steps up to the balcony and
  over the roofs (`content/rooms/hall-gallery.json:2`, `INTENT:` "they are
  the gallery's way out when the courtyard gate is shut"). He stands at the
  top of that climb, beside the hidden piece `town-6` on the balcony at
  [7, 2] (`content/completion/castle-town.json:48-54`): getting out, or
  getting the piece, now means climbing under his lobs, sneaking up behind
  him from the roofs (you arrive at the balcony's west end, behind him), or
  knocking him off the balcony.
- **It leaves the room's promises alone.** He stands on the balcony
  (row 3's one-way platform, columns 1-11), never on the floor, which is
  kept clear for the pedestals (`content/rooms/hall-gallery.json:2`,
  "columns 1-22 ... place nothing there"; the five spots,
  `content/hall/legends.json:5`, all on row 10). He never walks, so he
  never blocks the steps.
- **The owner's line for it**: "Do not confine mayhem to designated levels
  or protect the Hall of Legends from gameplay." (`docs/vision.md:104`).
  His shots can knock a hung pedestal (weight 110,
  `content/tuning.json:289`) a little: `DRAFT:`, logged.

Arithmetic to trace, not trust: his middle stands about 35 px down
(balcony top at row 3, y 48, minus half of 26); a hero on the floor has
their middle about 161 px down (floor at y 176 under row 10, grappler 30
tall); so his band needs a height of at least 126 px (`DRAFT:` 136) and
his `range` 176 px reaches from column 9 to about column 20. A shot
leaving at 200 px/s with lift 0.6 (gravity 900, `content/tuning.json:4`)
clears the top step (row 5, columns 11-14) and comes down on the middle
step (row 7, columns 14-17) near column 17 about 0.55 s after it leaves: a
loose weapon lands on a one-way platform from above
(`src/sim/loose-fall.ts:49`). So with these first numbers he covers the
climb, not the floor beyond the steps; the builder traces the arc and
tunes `speed` and `lift` until a hero on the steps (rows 5, 7, 9: columns
11-14, 14-17, 17-20) is in it and the floor east of column 17 is reached
by some throws, and says what was chosen.

Pushes: (1) the kind, the weapon file and the throw rule in a test room,
with scenarios 1-10; (2) the telegraph drawn on the page; (3) the gallery
placement, scenarios 11-12, the e2e fact, screenshots.

### Slice 2: bad guys in the castle's empty rooms

Not briefed. One or two of the existing kinds (`outpost-fighter`,
`heavy-fighter`, the thrower) placed by data in the courtyard, the
undercroft and the throne room, so every castle room the gap names has
someone bad in it. Each place is a new or edited `content/placements/`
file and no code. Before briefing it, measure for each room what slice 1
measured for the gallery: the scenarios and e2e facts that load its
placements (the undercroft's four scenarios and `plates.ts`; the throne
room's nine scenarios and Step 6's queue; the courtyard's flat run, columns
1-13, kept clear for Step 7's machine, `content/rooms/courtyard.json:2`),
and say for each where a bad guy stands and why. `DRAFT:` the courtyard's
bad guys stand west of the gate on the far side from the street, so the
town's guards who follow a hero through (Step 4) meet them (D-069's
three-sided fight in a real room, gap 9). The order: the undercroft (a
thrower above the stone plate makes the weight puzzle a fight), then the
courtyard, then the throne room once Step 6 is claimed.

## Owns

New files: `content/characters/ranged-fighter.json`,
`content/npcs/ranged-fighter.json`, `content/sprites/ranged-fighter.json`,
`content/weapons/thrown-shot.json`, `content/placements/hall-gallery.json`,
`content/rooms/test-ranged*.json` and their placements,
`src/sim/ranged.ts`, `src/sim/systems/ranged-*.ts`,
`src/client/draw/ranged.ts`, `scenarios/step24-*.json`,
`scripts/e2e/ranged.ts`, `docs/mechanisms/ranged.md`,
`docs/plan/step-24-shots/**`. Agreed small additive edits: the optional
`ranged` field in `src/content/kinds/npcs.ts` (its `read.only` list, `:104`,
its parse and a cross-check); one `ranged-fighter` section at the end of
`characters` in `content/tuning.json`; one row in `content/grips.json`; one
line each in `src/client/render.ts`, `src/client/main.ts` (`drawn.ranged`)
and `scripts/e2e.ts`; one line in `docs/mechanisms/README.md`. Slice 2 adds
its placements files. It edits no room file and nothing of the weapon,
outpost, hall, defeat, heart or stage systems.

## Briefs

- `handoff-prompts/ranged-enemy.md`: slice 1, three pushes, one builder
  (drafted for the orchestrator 2026-11-24 against `9dbd705`; nothing in it
  was run).

- 2026-11-24 06:41 UTC: `handoff-prompts/ranged-enemy.md` (slice 1) spawned to builder `session_017WiGzEb3ESHBHGr3vhpB3k` by orchestrator `session_017WiGzHhT2apmWHT61rQ65G`.

## Builder notes

Newest last. Slice 1's builder, `session_017WiGzEb3ESHBHGr3vhpB3k`.

- **Push 1 (the sim, test rooms only).** Built as the brief says, with
  these departures, each `DRAFT:` and logged ("Step 24: the thrower sees a
  little farther than he throws"):
  - **Sight 208, range 176**, not 176 and 176: with the two equal no hero
    can be "seen beyond range", which scenarios 2 and 7 need, and the band
    reaching a step past the throw reads as a warning. Push 3 retunes both.
  - **He keeps any input that does not walk** (outpost-fight's swing and
    turn in reach of a hero, clash-fight's in reach of a guard, his
    routine's `face`), not only the hero swing: he still swings weakly at a
    guard against him. Attack is stripped while the shot is in hand.
  - **The cap counts a shot in the air**: a fourth throw makes the oldest go
    on the tick it leaves (`ranged-shot-gone`, for the page's poof in push 2).
  - **Four test rooms**, not one: `test-ranged` (the ledge), `test-ranged-floor`
    (80 tiles wide, so the twice-knocked-out scenario's flights never slam a
    wall and he is defeated by wear, not by slam), `test-ranged-bomb` (the
    one-file kind) and `test-ranged-camp` (a camp fighter on the thrower's
    tile, for the two controls that need a body without `ranged`).
  - **Scenario 6's control** is a friend's throw of one of his shots
    (player b picks it up and throws it at the infiltrator on the floor):
    struck, not floored, no heart. Scenario 7's control stands its hero at
    13 tiles, not 18, because a camp fighter sees only the world's 112 px.
  - `src/content/kinds/npcs.ts`'s check skips the weapon cross-check in a
    content with no weapons at all: the room controls build such a map
    (`scripts/lib/room-controls.ts` drops `weapons/`), and refused every
    control for it otherwise.
- **Not shown by any scenario:** the `met: [him]` trap (his shot leaves in
  front of his box, so with `met: []` it still never meets him: the
  control did not fail) and the attack strip (no scenario has a hero in
  reach while he holds a shot: the control did not fail). Both kept as the
  brief asks; a scenario for the second would put a hero against him
  mid-aim.
- **Owed:** a sound for the aim (the sound lane); the cap's poof drawn
  (push 2). A shot whose thrower is gone before it lands costs no heart
  (`heart-lose.ts` finds no enemy): left as it is.
- **Pushes 2 and 3 (the telegraph; the gallery).** The brief's numbers kept
  (decisions-log "the balcony thrower lobs over the floor"). Departures and
  flags:
  - **`ranged-telegraph`'s bound is `aim` − `interpDelayMs` − one snapshot
    (450 ms), not `aim` − 100 ms.** Measured 480-496 ms on four runs: the
    page draws a body it has `interpDelayMs` (100) in the past, but a new
    loose shot at its first sample (`src/net/smooth.ts`, not mine). The same
    cause means for ~100 ms the shot is drawn both in his hand and in the
    air. Worth a look by whoever owns the smoother; nothing changed there.
  - **Sideways (844×390) the camera keeps the floor in view, so a hero on
    the gallery floor does not see him or most of the arc, only the landing
    cross** (`docs/plan/step-24-shots/aim-and-arc-sideways.png`). Upright
    shows all of it. The camera is not this brief's; flagged, not changed.
  - **Owed:** the cap's poof is not drawn (the event is there for it); the
    aim's sound (the sound lane). The way-out scenarios are timed to his
    throws: a change to `every`, `aim`, `speed` or `lift` re-times them.
  - `hero-struck-*.png` is taken a beat after the blow (the hero back on
    the floor, shots lying), not mid-flight: the e2e waits for the drawn
    hero to move 12 px, then the page and the screenshot lag behind it.
  - The e2e's "wanted" pick-up is printed, not a fact: it worked on two of
    four runs (a shot lying under a bounce or on a step on the others).

## Looked at, 2026-11-24 12:25 UTC (a subagent of the orchestrator; the 8 shots in `docs/plan/step-24-shots/`)

Slice 1 is live (27490b6) and green in the orchestrator's full re-runs. By eye it is poor in three ways, for the next slice's brief:
- **He does not read as an enemy.** A purple-hooded kid drawn the same cute way as the heroes (the stand-in sheet, `DRAFT:`), with nothing that says bad guy.
- **His shot in the air is the same banana-boomerang sprite as the one lying on the floor to pick up** (`shot-in-the-air-sideways`, `hero-struck-sideways`): an incoming throw cannot be told from loot. A thing flying at you must look like one (a trail, a spin, a tint, a different cut).
- **No shot shows his sight band**, and in the upright shots he is clipped at the left edge.
Right: the arc's dots read clearly on the gallery wall; the landing cross is small but readable. The camera's lean (ad51322) now shows him and the whole arc sideways.

Slice 1b and slice 2's builder, `session_017WiGzJR2qgU7SXbKtxZpYP` (`handoff-prompts/ranged-enemy-2.md`).

- **Push 1, slice 1b (readable).** Shots: `docs/plan/step-24-shots/1b/`
  (`at-rest`, `winding-up`, `shot-in-the-air`, `hero-struck`, each
  `-sideways` 844×390, `-small-sideways` 750×340, `-upright` 390×664), taken
  by `scripts/e2e/ranged.ts`, which now catches winding-up and the shot in
  the air at each size on a throw of their own (`shotsWhen`).
  - **How the camp's people are told from townsfolk, measured:** nothing in
    the code (`grep "'bad'" src/client` prints nothing); only their pictures.
    All cast sheets share one palette; what the bad guys share is the
    bandits' red ramp (`#f0596a`, `#c8324a`, `#8a1c3a`: the fighter's hood,
    the lookout's scarf). The mark chosen: that red, swapped for the toll
    keeper's purple ramp in a copy of his sheet
    (`tools/art/cast/ranged-fighter-recolor.py` →
    `assets/sprites/cast/ranged-fighter.png`). No new drawing. The real sheet
    is asked of Vision Partner (asset desk), with a wind-up pose.
  - **In flight:** an additive `flight` on the weapon kind (`spin`, `trail`,
    `tint`, `tintAmount`; and a `flying` look state), drawn by
    `draw/weapons.ts` only. `thrown-shot` spins 3 turns/s, red-hot (#ff3b30
    painted at 0.45), 4 fading copies 2 frames apart. The trail is the
    page's own drawn positions, not the sim's velocity.
  - **His band is drawn** in every shot (the warm wash from his feet east to
    the orange rim past the steps): it was drawn in slice 1's shots too, but
    at 208×136 px it covers most of the screen and reads as lamplight, not
    as his sight. That is Step 19's band look (`draw/sight.ts`, not mine):
    flagged, not changed.
  - **Clipped:** upright he is whole in all three upright shots. Sideways the
    party plate (the HUD) covers him on the balcony at 844×390 and 750×340
    (`shot-in-the-air-sideways`, `winding-up-small-sideways`): the camera's
    and HUD's, not mine; flagged for the camera builder.
  - Not a scripted fact: the flight look is checked by eye in the shots, and
    by `drawn.weapons.loose[].flying`, which only the new code sets (slice 1's
    `shot-in-the-air-sideways.png` is the before).

## Look at slice 1b's shots (orchestrator session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~14:45 UTC)

By a subagent reading 8 of the 12 shots in `docs/plan/step-24-shots/1b/` at phone size (the PNGs are 3x); not by playing, not by the orchestrator's own eye. Against 8a3fafc's claims:

- **Reads as an enemy: partly.** Upright he stands clear in a red hood and cloak. In every sideways shot the balcony is at the top-left under the party plate: half of him or more is behind the HUD or off the top edge (`winding-up-sideways`, `shot-in-the-air-small-sideways`, `hero-struck-small-sideways`: a red sliver). On a phone held sideways the player mostly cannot see who is throwing. A camera and plate matter, not the sprite.
- **The shot reads as a threat: partly.** In flight it is a small orange crescent with a faint trail, low in contrast on the gallery's tan wall; in `shot-in-the-air-small-sideways` it could not be found at all. The dotted arc and landing cross read well. Spent shots on the floor are gold-and-purple crescents that look like pickups. `hero-struck-*` shows no hit effect on the hero.
- `at-rest-sideways.png` is 2250x1020, the 750x340 size, not 844x390 as its name implies.

Sent to the thrower's builder as part of its brief's next push; nothing here is re-measured yet.

- **Push 2, slice 2: the undercroft.** Measured first: with `undercroft-thrower`
  placed (stair's middle step, tile [21, 8], facing west over the plate),
  `npm run check` had 0 reds (every scenario, the 8 that load placements
  touching the undercroft among them) and the full `npm run e2e` 134 ok, 0
  FAIL, `plates.ts`'s seven facts included (A and B on the plate are under his
  arc, not in it; his lobs come down by the grate). Nothing re-timed.
  New: `step24-undercroft-under-fire` (one grappler alone, the heavy crate
  on the plate as if thrown through the window: down the cellar stair,
  aimed at 143, struck at the grate 207, in the pocket by 290) and
  `-control` (stops behind him at column 24: never aimed at). Failing
  control watched: with his placement taken out, the first scenario's three
  ranged facts go red. Shots: `docs/plan/step-24-shots/2/` (from the plates
  walk: `stone-plate-down-sideways.png` has his shot in the air over both
  pages).
  - **Flag, slice 1's, not changed:** a placed body has no starting facing,
    so for the first tick of a fresh world he faces east (default) before his
    routine turns him; a hero standing east of him then is aimed at once
    (seen in a first trace with the hero spawned in the undercroft). Players
    come down the cellar stair later, behind him. A placement `facing`, or
    `ranged-throw` waiting for the routine's first turn, would fix it.
- **Push 3 (the courtyard): measured, not placed.** One `outpost-fighter`
  (`courtyard-fighter-1`) at tile [24, 7], between the east plate and the
  gate, facing west then east: `npm run check` 0 reds, and the new scenario
  `step24-courtyard-guard-meets-bandit` (with `-control`) shows D-069's
  three-sided fight in the real room: the street guard chases a hero into
  the courtyard, the bandit hits the hero (4013) and then the guard (4199).
  **But the full e2e went red on another builder's fact,**
  `plates-friend-held` (`scripts/e2e/plates.ts`: the pages on the two plates
  are knocked off; the plate drawn up on A in 91 of 91 frames), and on
  `door-use`; 138 ok otherwise. `door-use` (with `door-go-in`) then failed
  once more in a full run *without* him and passed alone three times and in
  the next full run (140 of 140), so it is a full-run flake, not his; the
  plates fact passed in both runs without him. So it is not pushed. **But**
  the orchestrator's re-run at c34aec7 saw `plates-friend-held` go red once
  on main with no courtyard bad guy (brief `e2e-intermittent-reds.md`), so
  one red with him is not proof it is his: whoever lands this should run
  the full e2e three times with him (and `plates.ts` alone three times)
  before deciding. Measured reasoning: the courtyard west of the gate is 11 tiles
  (14-24) holding two plates, two doorways and the spawn; any bad guy who
  walks at a hero there meets the pages those facts stand. Kept, ready to
  land: `docs/plan/step-24-courtyard-draft/` (`courtyard.json` for
  `content/placements/`, the two scenarios for `scenarios/`). Ways on, for
  the orchestrator to choose (each a fact owner's say): (a) the two facts'
  owners (Step 3's plates, the doors fact) move their pages' room to a
  private test world or a placement-free run; (b) the bandit stands east of
  the gate (columns 26-28; the plates and ranged e2e walk through there, so
  measure again); (c) a bad guy who does not walk at heroes (a lookout, a
  thrower facing west at column 14 over the street door) and measure again.
- **Also in push 3:** the in-flight look strengthened after the 14:45 look
  ("small orange crescent with a faint trail, low in contrast on the tan
  wall"): `flight` gains `outline` (a 1 px dark rim) and `scale` (1.5×);
  tint 0.6, trail copies brighter. `shots()` in `scripts/e2e/ranged.ts` now
  sets 844×390 before its first shot (the look found `at-rest-sideways` at
  750×340). "Spent shots read as pickups" is slice 1's design (a landed shot
  is picked up with Use and thrown back): not changed.
- **Owed (the orchestrator's 14:35 message, which reached this builder only
  at 17:35, after push 3):** (a) each new thrower clear of the party plate
  and top edge sideways: the undercroft's is
  (`docs/plan/step-24-shots/2/stone-plate-down-sideways.png`, him at the
  right, clear); the balcony's stays as it is (camera and plate). (b) **Not
  done:** a spent shot lying on the floor still reads as a pickup (it is
  one: Use takes it and Hit throws it back). The orchestrator asks it be
  faded or darkened, `DRAFT:`: a `rest` look on the weapon kind (a tint
  while loose and not flying, the pick-up glow unchanged) in
  `draw/weapons.ts` is the small way. (c) **Not checked:** whether a struck
  hero visibly reacts in `hero-struck-*` (the shot is taken a beat after the
  blow; see slice 1's notes).
- **Push 4 (the courtyard's bandit, way (b)),** `session_017WiGzJuWboLaxkDAsBMpaS`.
  `courtyard-fighter-1` (`outpost-fighter`) at tile [27, 7], east of the
  gate, routine `face: right` only (`INTENT:` in the placements file: a
  look west from column 27 reaches column 20, the east plate included, and
  he would walk at the page on it once the gate opened). So heroes who open
  the gate come up behind him; one who comes in from the gallery, or walks
  on past him, meets him face on, and his blows knock them east out into
  the gallery. Decisions-log "the courtyard's bandit stands past the gate".
  - **Measured with him placed:** `npm run check` ok; `plates.ts`, `ranged.ts`
    and `camera.ts` (all three walk past column 26) alone three runs each,
    every fact 3 of 3; the full `npm run e2e` three times, 140 ok and 0 FAIL
    each time.
  - New: `step24-courtyard-bandit-at-the-gate` (a hero walks west out of
    the gallery: in at 57, his first blow at 77) and `-control` (no
    `placedRooms`: no blow). Failing control watched: with
    `content/placements/courtyard.json` moved aside, the scenario's blow
    fact goes red.
  - Shots `docs/plan/step-24-shots/courtyard/`: `gate-open-him-beyond-*`
    (two pages on the plates, the gate open, him in red past it) and
    `hero-meets-him-*` (a page walked through, his swing on it, the alert
    bar up), 844x390 and 390x664. Taken by a scratch script, not the e2e.
  - **Not done:** the draft's guard-chase scenario
    (`docs/plan/step-24-courtyard-draft/`, way (a)): the street guard stops
    west of the shut gate and never meets him east of it. That folder is
    superseded; left for its reviewer to delete. The optional placement
    `facing` field: not built (budget kept for the gate). He faces east
    already (the default), so he needs none.

## Look at slice 1b's retaken shots (orchestrator session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~19:00 UTC)

By a subagent reading all 15 shots in `docs/plan/step-24-shots/1b/` at phone size, against ce0d56c: the shot in flight is now easy to spot and reads as hot in `shot-in-the-air-sideways` and `-upright`; in `shot-in-the-air-small-sideways` it is caught at the release point and merges with the thrower's red hood ("the thrower is on fire"); `hero-struck-*` still shows no reaction on the hero; `at-rest-sideways` is now really 844x390; sideways at rest the thrower is not visible at all (the plate and the top edge: with the plate's builder). These shots predate the camera's second push. Not briefed: a struck hero's visible reaction.
