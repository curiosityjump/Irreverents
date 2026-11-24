# A bad guy who throws things from a ledge (Step 24, slice 1)

Brief for one builder, three pushes. Drafted 2026-11-24 for the
orchestrator against `9dbd705`; nothing in it was run. Every fact below is
`file:line` at that commit; re-read a line before you build on it. Read
first: `docs/plan/step-24.md` (the step: why, decided, open, the signal),
`docs/mechanisms/weapons.md` (the thrown thing you reuse),
`docs/mechanisms/outposts.md` ("Chase and clash"), `docs/mechanisms/npc-response.md`,
`docs/mechanisms/scenarios.md`. No design-library file is needed: the
step file quotes what bounds you; do not search or sync the mirror.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:** `docs/plan/step-24.md` (a
"Builder notes" section, newest last); flags that are not questions go
there; a non-blocking owner question goes to `docs/questions-inbox.md`.

## 1. The task, and the measure

Make the game's first enemy who fights from range, as data, and stand one
on the Hall gallery's balcony. A player sees him aim (the thing held up, a
dotted arc to where it will land), then throw; standing in the arc they
are knocked flying, jumping or stepping out of it lets it land behind them,
where they can pick it up and throw it back. Punched during his wind-up he
tumbles and drops it. Twice knocked out, he is gone for good.

Moves no row of `docs/plan.md`'s table (M3 is 6 of 6). It closes half of
`docs/vision-gaps.md` row 1 ("no ranged kind"); slice 2 (castle rooms) is
the other half and is not yours.

## 2. Measured (the derivation)

- **No body throws today.** `content/characters/` holds 26 files; the six
  NPC kinds on side `bad` (`brute`, `heavy-fighter`, `outpost-fighter`,
  `outpost-lookout`, `toll-keeper`, `villain`) fight, when they fight,
  through `outpost-fight`.
- **`outpost-fight` (order 58, `src/sim/systems/outpost-fight.ts:66`)**
  drives every person on side `bad` whose body lists `attack` (`:72-75`):
  it walks him at the hero he sees while farther than `npcChargeReach`
  (14 px, `content/tuning.json:15`; `:121-123`) and presses Hit every other
  tick in reach (`:136`). A kind with `search` chases and searches (`:102-113`).
  `clash-fight` (order 59, `src/sim/systems/clash-fight.ts:20`) then
  overlays the input of anyone who sees a hostile person and no hero.
  Orders 63-94 are free; `weapon-toss` is 95, the verbs 100.
- **Seeing** is `canSee` (`src/sim/npc/sight.ts:46-59`): same room, in
  front (`:56`), within `range` across and `height` up or down between the
  two middles (`:57`), no solid tile between (one-ways do not block,
  `:17`). Per kind via `sight` (`src/content/kinds/npcs.ts:39`,
  `sightOf` `src/sim/npc/sight.ts:31-35`); the band drawn is `sightBox`
  (`:71-79`). World default 112 × 40 (`content/tuning.json:7-8`).
- **The flying thing exists** (Step 23). `makeLoose`
  (`src/sim/weapons.ts:161-188`) makes a loose weapon; with
  `flying: { by, met }` `weapon-move` (order 530) launches the first body
  it meets that is not in `met`, by `thrown.strength` over that body's
  weight, capped at 520 (`content/tuning.json:25`), up by `attackLift`
  0.55, wears it by `thrown.wear` with the thrower as `by`, emits `hit` and
  `weapon-struck`, and drops (`src/sim/systems/weapon-move.ts:85-110`). A
  friend is spared only if thrower and target are both players (`:96`).
  `throwWeapon` (`src/sim/weapons.ts:224-247`) shows the pattern: clear the
  hand by effect, `met: [thrower]` (`:245`), `lit` when the weapon has a
  `burst` (`:244`). It uses the weapon's own speed and
  `world.throwLift` 0.3 (`content/tuning.json:27`), so for a thrower's own
  arc call `makeLoose` yourself.
- **The page gets it for free.** A held weapon is drawn at the holder's
  hand by `src/client/draw/weapons.ts` for any body (`weaponOf`,
  `src/sim/weapons.ts:94-99`: give it with `by` = his kind); the whole
  world goes out in each snapshot (`src/net/protocol.ts:54`), so a
  component you set reaches every page.
- **Weapon rules run only in the server's and a scenario's world**
  (`weaponWorld`, `src/sim/weapons.ts:138-140`), never in a page's.
- **Picking up and throwing back need nothing new.** Use takes a loose
  weapon (`src/sim/use/weapon.ts:28`); a `use: "throw"` weapon in hand is
  thrown by Hit (`src/sim/systems/weapon-toss.ts:22-40`).
- **Losing it:** a hard hit (≥ `powerHardHitSpeed` 180) or a fall knocks
  any holder's weapon loose (`src/sim/systems/weapon-loose.ts:1-12`).
- **Hearts:** `content/hearts.json:6` `"per": "fall"`; a `flattened`
  whose `by` is an NPC enemy costs a heart
  (`src/sim/systems/heart-lose.ts:32, 46-48`); `wear` emits `flattened`
  with the `by` it is given (`src/sim/body-state.ts:170-180`). So his shot
  flooring a hero costs a heart with no new code.
- **Beaten for good:** `beaten: { after }` per NPC kind
  (`src/content/kinds/npcs.ts:56`); event `defeated`
  (`src/sim/beaten.ts:32`).
- **The NPC kind's fields** are read in `src/content/kinds/npcs.ts:104`
  (`read.only` list: `id, role, side, moods, barks, fights, sight, search,
  beaten, knockedOut`). The weapon kind's in `src/content/kinds/weapons.ts:110`;
  left out, `sources` is `[]` (`:146`) and `thrown` is
  `{ speed: 320, strength: 12000, wear: 20 }` (`:148`).
- **The stand-in art.** Body: `assets/sprites/cast/toll-keeper.png`, cut by
  `content/sprites/toll-keeper.json` (cell 56×48, anchor 21, 22; box 14×26
  in `content/characters/toll-keeper.json`); the toll keeper is placed only
  in `content/placements/quarry-road.json`. Shot: `weapon-boomerang-ground`,
  `-held`, `-swing`, `-impact` (`content/looks/weapons.json:31-34`). A sprite
  file is named after its character id (`src/content/kinds/sprites.ts:6`).
- **The gallery** (`content/rooms/hall-gallery.json`, 24 × 12): floor row
  10, columns 1-22, `INTENT:` kept clear for pedestals (`:2`; spots
  `content/hall/legends.json:5`: columns 5, 9, 13, 17, 21 on row 10);
  balcony one-way row 3, columns 1-11; steps one-way row 5 cols 11-14, row 7
  cols 14-17, row 9 cols 17-20; `INTENT:` the steps are "the gallery's way
  out when the courtyard gate is shut"; door `to-courtyard` west, rows 9-10;
  `from-the-roofs` west, rows 1-2, arriving on the balcony. Piece `town-6`
  at [7, 2] (`content/completion/castle-town.json:48-54`). No
  `content/placements/hall-gallery.json` exists. Scenarios in the room: 0;
  scenarios loading its placements: 0. `scripts/checks/step7-hall.ts:106`
  puts a player at column 3.
- **His arc, my arithmetic (trace it).** At [9, 2] his middle is about
  35 px down; a grappler on the floor has his about 161 px down: a band
  height of 136 covers it; `range` 176 reaches to about column 20. A shot
  at 200 px/s, lift 0.6, gravity 900 (`content/tuning.json:4`), fall capped
  at `maxFallSpeed` 360 (`src/sim/loose-fall.ts:24`) clears the top step
  and lands on the middle step (row 7) near column 17 about 0.55 s out
  (a loose thing lands on a one-way from above, `src/sim/loose-fall.ts:49`).

## 3. What to build (decided; every number `DRAFT:`)

**Push 1, the sim, in a test room (nothing in a real room yet).**

- `ranged` on the NPC kind (optional, additive): `{ "weapon": id,
  "range": px, "aim": s, "every": s, "speed": px/s, "lift": share,
  "out": n }`. The kind file refuses a weapon that is not a weapon id or
  whose `use` is not `throw`, and a body (any placement using the kind)
  that does not list `attack` (it needs hands, `canHold`,
  `src/sim/weapons.ts:153`).
- `content/characters/ranged-fighter.json`: box 14×26, verbs `move`,
  `attack`, `body`, tuning `ranged-fighter`. Its section at the end of
  `characters` in `content/tuning.json`: walk numbers like
  `outpost-lookout`'s (`:272-281`), a weak swing (`attackStrength` 6000,
  `attackReach` 10, `attackWear` 12, the fighter's timings), `weight` 30,
  `toughness` 50.
- `content/npcs/ranged-fighter.json`: role `ranged-fighter`, side `bad`,
  the three moods, barks of at most three words, `sight` `{ range 176,
  height 136 }`, no `search`, `beaten` `{ after 2 }`, and `ranged`
  `{ weapon "thrown-shot", range 176, aim 0.6, every 2, speed 200,
  lift 0.6, out 3 }`. Shown name: `DRAFT:` "Slinger" (data, never an id).
- `content/weapons/thrown-shot.json`: the boomerang looks, `grip` [14, 16],
  `box` [10, 10], `use` `throw`, `thrown` `{ speed 280, strength 12000,
  wear 30 }`, no `sources`, no `carriers`, `name` "Boomerang".
- `content/sprites/ranged-fighter.json`: a copy of the toll keeper's file
  with `id` changed, its `//` saying it is a stand-in for P08's ranged poses.
- **`src/sim/systems/ranged-throw.ts`** (order 64; a helper
  `src/sim/ranged.ts` if you need one). In weapon worlds only. For each
  person whose NPC kind has `ranged`, on his feet (`canAct`), not seated:
  - He never walks: write a standing input every tick (overlaying
    outpost-fight and clash-fight), except that within `npcChargeReach` of
    a hero he sees you leave outpost-fight's swing as it is.
  - Ready, `every` seconds since his last throw, and a hero he sees
    (`canSee`, nearest, D-065: only this tick's sight) within `range` and
    beyond `npcChargeReach`: turn to face him, start the aim
    (`c.rangedAim = { at, dir }`, event `ranged-aim`), and hand him the
    shot by the `weapon` effect (`by` his kind, `src` `~ranged:<his id>`).
  - After `aim` seconds: clear his hand by effect and `makeLoose` the shot
    in front of his hand, `vx = dir × speed`, `vy = −speed × lift`,
    `flying: { by: him, met: [him] }`, `lit` if the weapon has `burst`;
    emit `weapon-dropped` `how: "thrown"` (the throw's sound and every
    existing reader) and `ranged-threw`. He throws the way he aimed even if
    the hero moved (that is the dodge).
  - Knocked off his feet during the aim: the aim ends, no throw. A hard hit
    already knocks the shot loose (`weapon-loose`); a soft one leaves it in
    his hand for the next aim (never hand a second).
  - More than `out` of his shots (tag `~ranged:<his id>`) lying loose in the
    room: the oldest goes (removeEntity) with an event the page can poof.
    A shot in anyone's hand is never removed.
- `content/rooms/test-ranged.json` (+ placements): a flat doorless room
  with a thrower on a one-way ledge and one on the floor, as `test-fight`
  is for the fighter; a second room for `-one-file` if facts collide.
- Scenarios 1-10 of `docs/plan/step-24.md` "The signal", each with its
  control. For `-one-file`, the second NPC kind file names `bomb` and sits
  on an `outpost-fighter` body; `grep -rn <its id> src` must print nothing.

**Push 2, the telegraph on the page.**

- `src/client/draw/ranged.ts` and its one line in `src/client/render.ts`:
  while a body has `c.rangedAim`, draw a dotted arc of where the shot will
  go, from his hand, stepping the sim's own fall (gravity, the
  `maxFallSpeed` cap, one-way landings: reuse `moveLoose`,
  `src/sim/loose-fall.ts:17`, on a scratch entity, or match it exactly)
  until it meets a tile; the held shot is already drawn at his hand. A
  `ranged-fighter` row in `content/grips.json` that holds it up near the
  head (`DRAFT:` read by eye off the sheet).
- `window.irreverents.drawn.ranged` (one line in `src/client/main.ts`):
  each aiming body's id and the arc's end point, for the e2e.
- `INTENT:` at the system and at the draw: no shot leaves without being
  drawn held up, with its arc, for his whole `aim` (D-093, "legible
  pixels"; the owner's "readable enemies", `docs/vision.md:74`).
- Look at it on a phone-sized page (844×390 and 390×664) before pushing.

**Push 3, the gallery.**

- `content/placements/hall-gallery.json`: one person, `id`
  `gallery-thrower-1` (permanent), `character` and `npc` `ranged-fighter`,
  `tile` [9, 2], routine `face: right`, `wait`. Tune `speed`, `lift`,
  `range` and the sight by tracing until a hero climbing the steps is in
  his arc and some throws reach the floor east of column 17; say what you
  chose and why in the decisions log.
- Scenarios 11-12 (`-gallery-seen-on-the-floor`, the three
  `-gallery-way-out-<hero>` and their control).
- `scripts/e2e/ranged.ts` and its call line in `scripts/e2e.ts`: two
  phone pages open the courtyard gate as `scripts/e2e/plates.ts` does, A
  walks into the gallery and east; fact `ranged-telegraph`; control
  `E2E_RANGED_BEHIND=1`. Screenshots to `docs/plan/step-24-shots/`.
- `docs/mechanisms/ranged.md` (how to add a thrower, how to add a thing to
  throw) and its one index line in `docs/mechanisms/README.md`; the "enemy
  kind" row's sentence in `docs/architecture.md:220` gains "or, with
  `ranged` in its NPC kind, throws".

## 4. Traps

- **He walks off his ledge.** Listing `attack` puts him under
  `outpost-fight`, which walks him at any hero he sees farther than 14 px
  (`outpost-fight.ts:121-123`). Your system must write his standing input
  every tick after 59. If overlaying proves messy, the agreed alternative
  is one filter line in `outpost-fight.ts` beside `:75` skipping kinds
  with `ranged`; nothing else in that file.
- **He throws early.** `weapon-toss` throws a `use: "throw"` weapon on any
  fresh Hit press (`weapon-toss.ts:19, 36`), and outpost-fight and
  clash-fight press Hit in reach. While the shot is in his hand, his input
  must hold no `attack`, or the telegraph is skipped.
- **His shot hits him.** `met` must start with his id (`weapons.ts:245`).
- **A page throws.** Guard the system with `weaponWorld`; a page's world
  never makes a shot (`docs/deliberate-designs.md:95-96`).
- **Do not make the shot a body or let a swing touch it.**
  `docs/deliberate-designs.md:92`, `INTENT:` at `src/sim/weapons.ts:76-85`.
  Batting a shot back is the owner's open question, not this brief.
- **The bomb proof needs `lit`** or it never bursts (`weapons.ts:244`).
- **Shots pile up** on a phone without `out`. Count by tag across loose
  shots only, as `weapon-carriers` counts its carriers' swords
  (`src/sim/systems/weapon-carriers.ts:38-40`).
- **Step 23's push 5 may land while you build**: `takenByBadGuys`, a bad
  guy with empty hands touching a loose weapon takes it
  (`handoff-prompts/weapons-pick-up-and-swing.md:209-216`; `grep -rn
  takenByBadGuys src` prints nothing at `9dbd705`). Then a thrower can pick
  up his own landed shot; your hand-out must not hand a second while he
  holds one, and a shot taken back into a bad guy's hand is not "lying".
- **A tuning section holds exactly the numbers its verbs declare**
  (`docs/architecture.md:223`, "character kind"); `npm run check` names extras and gaps.
- **The gallery's floor is the Hall's.** Place nothing on row 10 or the
  steps; do not edit `content/rooms/hall-gallery.json`. His shots may nudge
  a hung pedestal (weight 110, `content/tuning.json:289`): `DRAFT:`, logged.
- **Kept games get him.** Loading places every room's placements again
  (`docs/mechanisms/saves.md:70-71`): push 3 puts him in every friend's
  saved game. That is wanted; say so in the commit.
- **A shot whose thrower is gone** (defeated, removed) before it lands
  costs no heart (`heart-lose.ts:46-48` finds no enemy). Leave it; log it.

## 5. Out of scope

Batting shots back with a swing; aiming at where a hero will be; throwers
walking or searching; throwing at guards (they fight him hand to hand by
`content/hostility.json`); any sound for the aim (log it as owed to the
sound lane); throwers in outpost waves; the villain's orb; slice 2 (the
courtyard, undercroft and throne room) and every room file; the camp,
street, quarry and road and their files; the Hall's systems; Step 23's
systems and `src/sim/weapons.ts` (import from it; do not edit it); new
art. Anything nearby that looks wrong: `docs/deliberate-designs.md` first,
then a note, not a fix.

## 6. Decided vs open

Decided: `docs/plan/step-24.md` "What's decided" and the `DRAFT:` choices
above; log each choice you make in `docs/decisions-log.md` under
"Step 24". Open for the owner (already in the step file, each with its
`DRAFT:` default; nothing waits on him): whether Hit should bat a thrown
thing back; whether a thrower always lobs the same distance; whether he
should move to a better spot; whether he throws at guards too; whether his
thrown things stay on the floor; whether the Hall is the right place for
one.

## 7. How it is verified

Per push, the pre-push gate (`docs/verifying-and-finishing.md:86-90`):

1. `npm run build` and `npm run check`: every scenario of every step green
   (353 at `9dbd705` plus yours); `npm run gates` still 6 of 6.
2. Each new `step24-*` scenario and its control; watch each control fail
   when you flip its one difference, and say so in the commit.
3. Push 3: `node scripts/lib/run-check.ts step7-hall` (the one check that
   goes into the gallery) green; `npm run e2e` in full, green, plus
   `E2E_RANGED_BEHIND=1` failing `ranged-telegraph`; the screenshots
   looked at, on both shapes.
4. `git fetch origin main && git rebase origin/main`, re-run the gate if
   code came in, push to `main` (`git ls-remote --heads origin` first;
   not a harness branch), `npm run check:deployed`; after push 3,
   `npm run check:live`.

## Paths

**Yours:** `content/characters/ranged-fighter.json`,
`content/npcs/ranged-fighter.json` and the one-file proof's NPC file,
`content/sprites/ranged-fighter.json`, `content/weapons/thrown-shot.json`,
`content/placements/hall-gallery.json`, `content/rooms/test-ranged*.json`
and their placements, `src/sim/ranged.ts`, `src/sim/systems/ranged-*.ts`,
`src/client/draw/ranged.ts`, `scenarios/step24-*.json`,
`scripts/e2e/ranged.ts`, `docs/mechanisms/ranged.md`,
`docs/plan/step-24-shots/**`, your notes in `docs/plan/step-24.md`.
Agreed small additive edits: `ranged` in `src/content/kinds/npcs.ts`; one
section in `content/tuning.json`; one row in `content/grips.json`; one line
each in `src/client/render.ts`, `src/client/main.ts`, `scripts/e2e.ts`,
`docs/mechanisms/README.md`, `docs/architecture.md:220`; if needed, the one
filter line in `src/sim/systems/outpost-fight.ts`.

**Not yours, do not touch:** every `content/rooms/*.json` that is not a
`test-ranged` room; every other placements file; `src/sim/weapons.ts` and
the `weapon-*` systems; `outpost-*`, `clash-*`, `npc-*`, `hall-*`,
`heart-*`, `defeat-*`, `stage-*` systems beyond the one filter line; other
steps' scenarios (a red one is its owner's call: report it with the tick,
do not re-time it).
