# Step 25 — The suplex

**Reference.** Plan step; its status line is in docs/plan.md.

Drafted 2026-11-24 for the orchestrator (`session_017WiGzHY5UZsWTLCH8cLm8M`)
against `5d8d147` (`origin/main`). Nothing in it was run except greps and
`node -e` reads of the content files; every number below is a file line
or that read's output, cited where it is used.

## Why

The gap: `docs/vision-gaps.md:11`, row 6, "The feel: 'OHHHHH' impact,
suplexes, launches, bodies slammed into walls and each other in chains":
"Still missing: a suplex (only `slam.json` and a comment in `beaten.ts`
mention one)", with "**none**" covering the suplex. Fourth in the order to
work them (`docs/vision-gaps.md:19`, "6 (no suplex; the owner's feel)").

**The owner, first-hand.**

- D-020, Drive, doc 11 (`docs/vision.md:271`; the register,
  `docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md:65`):
  > Spectacular IMPACT is a top priority: suplexes, launches, heavy collision, knockback into walls/other enemies, and roadblock crashes.
- 2026-11-22, Drive, doc 00 (`docs/vision.md:68`):
  > The emotional standard is the "OHHHHH" moment of spectacular physical IMPACT, balanced by the profound satisfaction of an impossible zero-alarm infiltration.
- 2026-11-22, Drive, doc 01 (`docs/vision.md:71`):
  > The game should continually invite: "What if I tried THAT?" ... Combat rewards force and collision.
- "What it is not", Drive, doc 00 (`docs/vision.md:103`):
  > Do not simplify combat down to damage numbers; collision force and consequence are essential.

**The library, by its own labels.** Literal: only the register's
D-numbers are decisions.

- CONFIRMED: D-020 (:65) above; D-021 (:67) "heroes outpower most common
  enemies"; D-055 (:241) "NO NPCS WILL HAVE AI"; D-062 (:265) "enemy
  reactions ... are scripted event triggers"; D-019 (:63) failure "opens
  satisfying battles ... NOT an automatic-reload punishment loop"; D-093
  (:371) iPhone browser first; D-096 (:381) use by default.
- Not decisions (feel goals, proposals, examples):
  - doc 08 (`docs/design-library/02-gameplay-systems/08-combat-impact-destruction-and-vehicles.md`),
    status (:7) "High-priority feel and simulation goals": "User
    references: Kirby Suplex ..." (:13); "a sufficiently powerful suplex,
    vehicle crash or chained explosion can topple them [heavy enemies]"
    (:33).
  - doc 19, *PROPOSED* by its own title
    (`docs/design-library/05-world-and-game-expansion-proposals/19-character-ecology-recruitment-and-ability-interactions-proposed.md`):
    the grappler "can seize, carry and throw opponents ...; specific
    member could perform exceptional suplexes" (:35); "GRAPPLE / SUPLEX
    — wrestler enemy, special gauntlet or character move" (:101).
  - doc 05 (`docs/design-library/02-gameplay-systems/05-characters-roster-parties-and-acquired-powers.md:19`):
    "A particular enemy might yield grappling, fire, suplex ... These
    examples are exploratory; the final ability catalog is open." So the
    suplex as an acquired power is OPEN; this step makes it a hero's move,
    and a power can lend the verb later (a power's `lends`,
    `docs/architecture.md:253`) with no change here.
  - "suplex king through stained glass" is EXAMPLE E-002 (register :119)
    and story proposals (docs 03, 17, 20, 21): not this step.
  - The art plan's "C02-05: Final-candidate strong/grappler: carry, grab,
    pivot, suplex wind-up, slam, recoil" (`docs/design-library/03-visual-direction-and-assets/00-asset-production-plan-and-style-lock/13-art-asset-production-plan-ordered-generation-backlog.md:109`)
    is a backlog line; no suplex frames exist (`content/sprites/grappler.json`
    frames: idle run air jump fall attack grab carry carryRun throw hurt
    down held hide talk flap tumble).
  - The sound exists and is approved: `content/sounds/slam.json:4` plays
    `audio/suplex_slam.wav`, "the biggest sound in the game" in its request
    (`docs/design-library/06-asset-collaboration-claude-chatgpt/02-delivered-chatgpt-to-claude/req-a01-01-first-sound-effects-pack-chiptune-phone-friendly.md:17`).

Nothing in the library argues against the move below. What bounds it:
D-055/D-062 (a witness reacts by its authored rows), D-093 (touch, the
few buttons there are), D-020 and "What it is not" (a slam, never a number).

## Goal (what a player sees and does)

Carrying a guard, a camp fighter, a townsperson, a training dummy or a
friend, the hero's Use button says **SUPLEX**. A tap: the hero heaves the
body up and over their head and drives it head-first into the floor behind
them. The screen shakes, the picture holds still for a beat, the biggest
sound in the game plays, dust flies; whatever stood near the landing
(bodies, crates) is knocked away, and what that hits is hit in turn. A bad
guy suplexed by the grappler does not get up. A townsperson stays down a
long while, and anyone who saw it reacts as to any blow. A friend suplexed
is slammed but not hurt, and can wriggle free with Jump while being heaved.
Throwing (Hit), the spike (stick down + Hit), the lob (stick up + Hit) and
setting down (Grab) all still do exactly what they did. One player alone
can do all of it; a crate cannot be suplexed (the button says nothing new).
Whether it lands as "OHHHHH" is the owner's to say by playing, never a
script's.

## What's decided

- The owner's words and the CONFIRMED entries above.
- **No new button** (D-093, `CLAUDE.md` "iPhone first"). The suplex is a
  context word on a button that exists.
- **Throwing stays** (the orchestrator's decision for this step). Measured,
  what a carrier's buttons do today: Hit throws at once, forward by default,
  stick up a near-vertical lob, stick down a spike in front, stick sideways
  turns and throws that way (`src/sim/verbs/attack.ts:74-77`,
  `src/sim/body-state.ts:221-258`); Grab sets the body down in front,
  whatever the stick (`src/sim/verbs/grab.ts:44-52`); with a weapon in hand
  Grab throws the weapon and lifts nobody (`grab.ts:41`). None of these
  changes.
- **Scripted, never AI** (D-055, D-062). The suplex is a hero's move;
  NPCs do not suplex in this step. A suplexed person's reaction, and every
  witness's, goes through the existing event-to-deed rows
  (`content/rules/expectations.json`, today `hit`, `grabbed`, `thrown`):
  a suplex is an attack, the deed `hit`.
- **Impact over numbers.** All numbers are tuning JSON
  (`content/tuning.json`); none is drawn.
- **Solo is never locked out.** One player does it all; the grappler is
  the party's first member (`content/party.json`, `members`).

## `DRAFT:` choices, made so the other answer is small

Each is the orchestrator's reading, reversible, owed one
`docs/decisions-log.md` entry, "Step 25: the suplex" (the orchestrator adds
it with this file's commit; the builder appends what it changes).

1. **The input: Use while carrying a body, its button reading SUPLEX.**
   Why Use and not a stick-plus-button: every stick-plus-Hit is already a
   throw (above), so Down+Hit would take the spike away; Grab with the
   stick already means "set down" for bodies and weapons alike; and on a
   phone the stick's up and down are a thumb slid off the pad's top or
   bottom edge (`src/client/touch.ts`, `aim`, "slide the thumb up off the
   pad (or down off it)"), which nobody discovers, while Use already
   names what it will do (`docs/mechanisms/heists.md`, Step 19's arbiter,
   `src/sim/use.ts`). A Use entry is one new file in a registry
   (`src/sim/use/`) plus one row of words (`content/prompts.json`).
   **Order 300, after every entry there is** (measured: door 0, weapon 90,
   thing 100, get-in 120, free 150, bell 200; `grep -n "order:" src/sim/use/*.ts`),
   so Use keeps doing everything it did: in an enter doorway it goes in, at
   a counter it buys, by a captive it frees. Carrying a body anywhere else,
   it suplexes. The other answer (suplex wins wherever you carry a body) is
   one number.
2. **What can be suplexed: a body that can be knocked out** (its toughness
   above 0, `bodyNumbers`, `src/sim/body-state.ts:106-111`). Measured over
   the 29 files in `content/characters/`: 19 qualify (every person and hero,
   the two dummies, the king); the 10 at toughness 0 do not (`crate`,
   `crate-heavy`, the three `set-*`, `pedestal`, `signal-post`, `throne`,
   `forest-boulder`, `ram-wagon`). The other answer (a per-kind flag) is an
   additive field.
3. **Who can: every hero who can carry, the grappler best** (doc 19:35's
   "exceptional suplexes", PROPOSED, read as a tuning difference, not a
   lock). A new verb `suplex`, listed in the five roster heroes' `verbs`
   (`grappler`, `infiltrator`, `flyer`, `brawler`, `skirmisher`; all five
   list `grab` today), with its numbers per character. Why not the grappler
   alone: a light hero who grabs a guard and gets nothing from the Use
   button meets a dead end at "What if I tried THAT?" (`docs/vision.md:71`),
   while the heroes already differ by lift: 150 for the grappler and
   brawler, 60 for the other three (`content/tuning.json:172, 319, 200,
   230, 349`). The other answer is deleting `suplex` from three `verbs`
   lists.
4. **Its numbers, the builder's starting points** (to trace, then set):

   | | grappler | brawler | infiltrator, flyer, skirmisher |
   |---|---|---|---|
   | `suplexTime` (s, the heave) | 0.3 | 0.35 | 0.25 |
   | `suplexSpeed` (the slam's impact, px/s) | 500 | 460 | 300 |
   | `suplexWear` | 100 | 100 | 40 |
   | `suplexSplashReach` (px from the landing) | 28 | 24 | 12 |
   | `suplexSplashStrength` (÷ weight = launch, capped) | 16000 | 14000 | each one's `attackStrength` |

   Why these: 500 and 460 are over the slam sound's 420
   (`content/sounds/slam.json:10`), over `beatenSlam` 400
   (`content/tuning.json:43`, so a bad guy is defeated at once by the
   existing rule, `src/sim/systems/beaten-mark.ts:53-62`) and at or past
   the draw's full shake at 450 (`src/client/draw/impact.ts:13`); 300 is
   over `heavy-hit`'s 260 (`content/sounds/heavy-hit.json:10`) and under
   400, so a light hero's suplex floors a bad guy without finishing him.
   Wear 100 is a guard's, a shopkeeper's and a dummy's whole toughness
   (`defaultToughness`, `content/tuning.json:49`; `dummy` 100): one
   suplex from a big hero knocks them out. The splash strengths sit at
   and above the two big heroes' own blows (14000 and 16000,
   `content/tuning.json:168, 315`), the grappler on top, against the cap
   of 520 (`content/tuning.json:25`): a crate (weight 20) flies at the
   cap, a guard (40) at 400 from the grappler.
5. **A friend** is slammed with the beat, the shake and the sound, and
   worn by the friend share, which is 0 (`friendThrowWear`,
   `content/tuning.json:55`; `friendly()`, `src/sim/systems/impact-walls.ts:7`);
   in a cantina brawl by `c.brawl`'s share, as every other impact.
6. **The event**: a new `suplexed` event (additive), mapped by one new row
   in `content/rules/expectations.json` to the deed `hit`. Not the `hit`
   event: 7 systems read `hit` (`grep "=== 'hit'"`: `weapon-loose`,
   `power-drop`, `defeat-seize`, `heart-lose`, `cantina-brawl`,
   `outpost-signaler`, `fight-struck`), and what the suplex does to a body
   reaches them by `flattened`, `impact` and `defeated`, as a throw's does.

## Open (for the owner, by playing; nothing waits on him)

- Should only the two big heroes be able to suplex, or should the small
  ones do their little one too?
- Is "carry someone, then tap Use (it says SUPLEX)" the right way in, or
  would you rather it be something else?
- Should a suplex finish a bad guy for good in one go (today: yes from the
  big two, no from the small three)?
- Should suplexing your friend hurt them?

## The signal (re-runnable)

Scenarios `scenarios/step25-*.json`, each tagged gate A, each with a
control watched to fail (`docs/mechanisms/scenarios.md:131`). Players are
`p:a` (and `p:b`); facts from `src/scenarios/facts/`.

1. `-defeats` (`test-fight`, grappler, `tf-fighter`): grab, then Use:
   one `suplexed`; one `impact` on `tf-fighter` with `other` null and speed
   at least 420 within `suplexTime` + 2 ticks of the press; `defeated`, how
   `slam`, player `a`; he lies on the side of the grappler away from the
   way they face. Control, watched once: `suplex` removed from the
   grappler's `verbs`, and no `suplexed`, no `defeated`.
2. `-light` (`test-fight`, infiltrator, `tf-fighter`): `suplexed`; the
   impact under 400; `flattened` once and no `defeated` that tick. Control:
   scenario 1 (the grappler finishes him).
3. `-throw-stays` (`graybox-hall`, grappler, `dummy-1`): carrying, Hit:
   `thrown`; again, stick down + Hit: `thrown` and the dummy moves down;
   again, Grab: `released` how `set-down`; `suplexed` count 0 throughout.
   Control `-throw-stays-control`: the same with Use for the first Hit:
   `suplexed` 1, `thrown` one fewer.
4. `-not-a-crate` (`graybox-hall`, `crate-1`): carrying, Use: no
   `suplexed`, the crate still carried. Control `-not-a-crate-control`:
   the same walk with `dummy-1`: `suplexed`.
5. `-splash` (`graybox-hall`): the grappler suplexes `dummy-1` so it lands
   within `suplexSplashReach` of a crate and the other dummy (placed by the
   scenario's own `entities` if the room's tiles do not give that): each
   gets an `impact` and a `velocity` away from the landing. Control,
   watched once: `suplexSplashReach` 0, and neither moves.
6. `-witness` (`test-shop`, grappler, `shopkeeper-1`, with `guard-1` and
   `villain-1`, as `scenarios/step4-hero-hits-shopkeeper.json`): a `deed`
   event `hit`, by `p:a`, target `shopkeeper-1`, with witnesses, on the
   slam's tick. Control, watched once: the new `suplexed` row out of
   `content/rules/expectations.json`, and that `deed` is gone.
7. `-friend` (two players): `p:a` carries `p:b` and suplexes: `impact` on
   `p:b`, never `flattened`. `-friend-breaks-free`: `p:b` presses Jump
   during the heave: `released` how `broke-free`, no `suplexed`. Each is
   the other's control.

`npm run e2e`, one fact by touch (`scripts/e2e/suplex.ts`): a phone-sized
page (iPhone 14 landscape) with 150 ms added each way (as
`scripts/e2e/hit-lands.ts`), touch only, in a private world (`?room=e2e-suplex-<random>`),
seated as the grappler: walks to a body it can lift in the first rooms it
reaches (the start room is `throne-room`, `content/game.json`; its king,
weight 110, at tile 5, `content/placements/throne-room.json`; measure,
then choose), taps Grab, **the Use button carries `data-state` `suplex`**,
taps Use, and **the page draws an impact on that body on the far side of
the hero** (`drawn.impacts`). Press-to-drawn is printed, not limited.
Control `E2E_SUPLEX_SKIP=1`: Grab again in place of Use, and the fact
fails. Screenshots at 844x390 and 390x664 under `docs/plan/step-25-shots/`:
carrying with SUPLEX on the button, mid-heave, the slam, the splash.

## Stopping condition

The signal passes on `main` and live (`npm run check:deployed`,
`npm run check:live`), `npm run check` green, and the owner has a suplex
to try in the throne room and the castle street. Then
`docs/vision-gaps.md` row 6 loses "Still missing: a suplex".

## Owns

New files: `src/sim/verbs/suplex.ts`, `src/sim/use/suplex.ts`,
`src/sim/systems/suplex-*.ts`, `src/client/draw/suplex.ts` (if drawing
needs its own file), `scenarios/step25-*.json`, `scripts/e2e/suplex.ts`,
`docs/plan/step-25-shots/**`. Agreed small additive edits: `"suplex"`
appended to `verbs` in the five roster heroes' files in
`content/characters/`; the suplex numbers in those five sets in
`content/tuning.json`; one row in `content/prompts.json`; one row in
`content/rules/expectations.json`; one call line in `scripts/e2e.ts`; one
line in `src/client/render.ts` if drawing needs it; the draw memory in
`src/client/draw/sprites.ts` (`remember`) for a heave seen from the press;
a section "The suplex" in `docs/mechanisms/combat-and-impact.md` and its
index line in `docs/mechanisms/README.md`. No room, placement, `src/net/`,
camera or HUD file.

## Briefs

- `handoff-prompts/suplex.md`: one builder, three pushes (drafted for the
  orchestrator 2026-11-24 against `5d8d147`; nothing in it was run).

## Builder notes

(newest last; each names the session and date)

- **2026-11-24, the suplex builder (brief `handoff-prompts/suplex.md`), push 1.**
  Final numbers: the table in `docs/mechanisms/combat-and-impact.md`, "The
  suplex"; the step file's, except `suplexWear` 100 for the light three (at
  40 the infiltrator's suplex did not floor the camp fighter, toughness
  100). Traced: the grappler's slam lands 18 ticks after the press, impact
  500, the fighter flattened and defeated (`slam`) on that tick, lying at
  feet x 52 behind a grappler at 72; the infiltrator's 15 ticks, 300,
  flattened, not defeated. The slammed body bounces after the beat
  (`floorBounce` 0.45: up at 225 px/s, a second floor impact at 225 about
  40 ticks later). A splash from the grappler sends a crate at 520 and a
  dummy at 400; both carry on into walls and each other through the
  existing impact systems (push 3's chain is already there: in the shop the
  splashed villain flew on into the guard at 393).
  **Found and fixed while building:** asked from the verb (order 100), one
  Use press beside the shop's goods took the goods (npc-interact, 60) and
  then suplexed, because the arbiter's answer had changed by then. A
  system, `suplex-press` (58), now asks first. **Flag, not mine:** carrying
  the shopkeeper beside her counter, Use buys from her (the counter's
  keeper "attends" it from over the hero's head): existing `thing` entry
  behaviour, left as it is.
  **Not verified in push 1:** anything on a phone (push 2).

- **2026-11-24, the suplex builder, pushes 2 and 3.** The heave drawn by
  `src/client/draw/suplex.ts`, hooked in `draw/entities.ts` (four lines
  around the carried body's draw: a file the "Owns" list did not name; the
  carried body is drawn there, not in `render.ts`, so that is where a turn
  can go). It stays fully turned past `suplexTime` while the body is still
  held (up to 45 ticks), because the presser's page waits about a round
  trip for the server's slam; without that the body snapped back overhead.
  **By touch** (e2e `suplex-*`, full `npm run e2e` green): the grappler in
  the throne room hops onto the dais, grabs the king, the Use button reads
  `suplex`, and the page draws the impact on the king behind the hero
  **about 900-950 ms after the press** (150 ms added each way; round trip
  about 306 ms; the heave 300 ms; the rest is the snapshot and the beat).
  Mid-heave the page drew the king turned 54 degrees, 40 ms after the
  tap's 130 ms. Control `E2E_SUPLEX_SKIP=1` (Grab for Use): `suplex-slam`
  FAIL, watched. The sound: not checked by script; the slam's impact is
  500, over `slam`'s 420, through the same path every impact takes.
  **Shots** (`docs/plan/step-25-shots/`): what I would point at is
  `heave-sideways.png` (the king going over head first) and
  `after-upright.png` (the king laid out behind, the star). Weak: the king
  bounces back up off the floor (`floorBounce`) before he lies down; the
  hero has no suplex pose (frames asked for in `docs/questions-inbox.md`).
  Not looked at: a friend's page watching the heave (drawn from
  `c.suplex.at` in snapshots; not measured across two phones).
  **Push 3, the chain** (`scenarios/step25-suplex-chain.json`): one slam,
  the splashed fighter into a crate (434), the crate into the wall (475);
  no tuning change needed. Control: splash reach 0, watched to fail.

## Look at the suplex's shots (orchestrator session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~19:05 UTC)

By a subagent reading the six shots in `docs/plan/step-25-shots/` at phone size, against 706849a; not by playing.

- **The button:** a gold-outlined pill reading SUPLEX under the hand button, legible at both sizes, nothing over it.
- **The heave does not read as a suplex.** In `heave-sideways` the king is turned 90 to 120 degrees but sits at the hero's chest height just beside him, not overhead, and nothing draws an arc: "the king is falling over beside the hero". The direction is right (behind the hero).
- **The slam shows a star but no weight.** In `slam-sideways` the king is drawn upright and sitting, not head-down; the hero and king overlap. `splash-sideways` looks like a hop; two crates move 50 and 70 px with a star; no dust, no visible shake.
- **After:** the king is a small heap at the dais's edge, partly over the drop; the hero is free.
- **In the shots' way:** the party plate covers the king's speech box's second line; speech boxes hide a hooded figure.
- Verdict: "the king fell down next to me with a sparkle". Briefed as a fourth push at the top of `handoff-prompts/suplex.md`.

**Briefs:** `handoff-prompts/suplex.md`, fourth push, to a fresh builder (named in `docs/current-directive.md`, "Sessions").

- **2026-11-24, the push-4 builder (`handoff-prompts/suplex.md`, fourth push).**
  Drawn only (`src/client/draw/suplex.ts`, new `draw/slam-dust.ts`, three
  hooks in `draw/entities.ts`); no sim number changed. The heave goes over
  the head on an arc about the carrier's feet and turns head-down; the slam
  is drawn head-down at the floor 18 px further behind than the sim puts it,
  held for the beat, flops flat and stays flat through the bounce; the hero
  leans back 0.15 rad; a floor dust burst wider than the body. Measured by
  touch at 150 ms each way (round trip ~310 ms), two runs alike: presser
  first movement ~15 ms, head-down ~965 ms, server impact drawn ~915 ms;
  friend first movement ~615 ms, head-down ~965 ms, impact ~915 ms. The
  e2e now carries the king off the dais and sends the friend's hero to the
  far right before shooting. New facts `suplex-over`, `suplex-felt`,
  `suplex-again`; control `E2E_SUPLEX_SKIP=1`. Shots `*-2-*` in
  `docs/plan/step-25-shots/`; the push-2 shots stay as the before.
  **Weak:** head-down shows ~50 ms after the star (the `CATCH` finish of the
  arc), the star half covers the head on the slam frame; the hero keeps the
  carry arms-up frame through the slam (frames C02-05 will fix); the lag is
  learned per page load, so the very first suplex on a fresh page is timed
  from the round trip alone (within ~60 ms here). Not run on a real phone.

- **Look at push 4's shots (the orchestrator, by a blind subagent shown the
  ten `*-2-*` shots, recorded here by the push-4 builder, 2026-11-24 ~20:30
  UTC).** Its sentence: "The goggled hero grabs the king, hoists him up
  overhead, flings him over and smashes him into the floor behind him in a
  burst of stars." Passes as a throw over the head, with weight. **Does not
  come through: head-first.** In `slam-2-*` the body is a jumble under the
  stars, merged with the hero's back; in `after-2-*` it lies upright or
  slumped. Asked for, not done (the builder stopped at its token budget;
  `handoff-prompts/suplex.md`, "Landed so far, push 4"): head-down 180
  degrees from the star's tick and held for the beat; a smaller star at the
  head with the dust behind; the body a few px further clear of the hero.

- **2026-11-24, the push-5 builder (`handoff-prompts/suplex.md`, "Landed so far, push 4").**
  Drawn only, no sim number. (1) Head-down from the slam's first frame:
  `CATCH` gone, the rest of the arc is skipped. (2) The slam's star is its
  own, 0.75 of `fx-hit`, at the head on the floor; `draw/impact.ts` got one
  additive hook (`drawnElsewhere`, by body id and tick within 4: an exact
  tick-and-pixel key missed) that stands down its star and puffs for the
  slammed body and, same tick, the bodies the splash knocks (the throne
  room's crates start at the head: their 1.25 stars and puffs were what hid
  it), keeping the shake. The slam's floor dust is now drawn before the
  bodies, so the turned king's crown shows. (3) `GAP` 18 to 24. Shots
  `*-3-*` (both orientations): the king upside down, crown on the floor
  under the small star, feet up, clear of the hero. By touch at 150 ms each
  way, suplex facts all ok: presser moves at ~15 ms, head-down and the
  impact drawn on the same frame (~916-933 ms); friend moves ~614 ms,
  head-down ~934 ms. **Flag, not fixed (not in the brief, `sprites.ts` not
  mine):** `after-*` still stands the king on end: during the bounce the
  body is drawn with its tumble frames, which are already turned, and the
  flop's turn adds to it. Fix by having the flop pick a lying frame (or no
  extra turn when the state is `tumble`), in `sprites.ts`. **Not done:** no
  scripted fact for "head-down on the star's tick" beyond `suplex-felt`'s
  120 ms; judged from the shots.

## Look at push 5's shots (orchestrator session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~23:15 UTC)

By a subagent, blind, the `*-3-*` shots at phone size, against de887b9. Its sentence: "The hero suplexed the smaller crowned character, slamming him upside down onto the floor, and then he bounces up on end beside the hero." Head-first: **nearly.** The slam frame has the crown and a small star at the floor and a boot up, clear of the hero by 40-50 px, plainly better than `slam-2-*`; but at phone size the king's flipped face still reads as a face the right way up, the body is drawn bigger and fuzzier than overhead, and the dust is a few flecks. In `after-3-*` he stands on his head pressed into the hero (they merge at the cape) with two stray stars (a crate, the right wall). **Stopping here without art:** the grappler's four frames (C02-05, requested) are what is left; when they arrive, also: the flop after the bounce clear of the hero, the splashed crates' first star and puff back (`draw/impact.ts`, `drawnElsewhere`), a wider dust burst. Step 25 stays open on those.
