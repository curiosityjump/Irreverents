# Weapons: things you pick up, swing, throw, lose and steal (Step 23)

**From the orchestrator (`session_017WiGzJzo6aZqH4kYxxJsiV`, 2026-11-24 01:40 UTC):** start now. The edits this brief lists in other owners' files (`numbersOf`, the `weapon` effect, the guard line in `verbs/grab.ts`, the two `predict.ts` reads, the `prompts.json` row, a HUD slot, the shared orb-move helper, the `room-controls.ts` line) are accepted as additive edits: make each as small as it can be and tell its owner by message the same push (powers `session_017WiGzF16bBpnLmeWErGynR`; the buttons builder `session_017WiGzJ23ionY6B1PB5Nmme` is re-skinning the touch controls and dims Use when a press would do nothing: agree with it how "Pick up" shows). **The owner has since asked for hearts** (`docs/plan/step-21.md`, "Hearts": a fall to an enemy costs a heart, all heroes out is game over in the cantina): a carried weapon at a game over goes back where it was found; do not build a second fall counter. The props builder (`session_017WiGzEN1QbSnHzXNqV4XSt`) is cutting group `weapons` now; the contract calls the pack SOURCE, so the cuts are `DRAFT:` stand-ins: read the real look ids from `content/looks/weapons.json` when it lands, or ask it.

Brief for one cold builder. Written 2026-11-24 by the orchestrator's drafting
agent, read at 8413d16. The step is `docs/plan/step-23.md`: read all of it
first. Then, before writing anything, in `docs/mechanisms/`: `powers.md`
(your model, end to end), `combat-and-impact.md`, `network.md` ("Effects",
"Predicted hits", "Traps"), `heists.md` (the Use arbiter), `defeat.md`,
`rendering-world.md` ("The party plate"), `scenarios.md`, `saves.md`; and
`docs/deliberate-designs.md` and `tools/art/props/README.md`, "Weapons".

**The library files you need, by path. Do not search or sync the mirror, do
not run `tools/drive_sync.py`, and open no other sheet:**
- `docs/design-library/06-asset-collaboration-claude-chatgpt/p12-standalone-weapon-families-direct-file-index-and-integration-contract.md`
- under `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p12-standalone-weapons-and-configurations-source/`:
  `readme-for-claude.md`, `manifest.json`, `tag-index.csv`, and only if a cut
  look puzzles you, the four rows `family-rows/p12-a-01-sword-source-row.png`,
  `p12-a-02-hammer-source-row.png`, `p12-a-03-spear-source-row.png`,
  `p12-b-01-bomb-source-row.png`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-23.md`, "Builder notes" (its last heading, empty today).

**Small pushes, each standing alone, green and live.** If you pass about 300k
tokens after push 3, report and stop: the orchestrator re-briefs the rest.

**Landed so far (2026-11-24 05:55 UTC), second builder `session_017WiGzJahGCHPU26omeZQNq`, stopped at its context line:** a second power replaces the first (acfa789); a returned carrier comes back armed only if his sword is gone from the world (da87910); at a game over a held weapon goes back where it was found (68ce6bb); push 4, the bomb (5ab4681: Hit throws it, it bursts on the first body or 1.2 s after landing, everything in the radius flies, the thrower too, a cracked wall in range breaks; **it lies only in the test room**); `weapon-hit-quick` was the measurement (the clock now starts on touchstart). The numbered list in the next paragraph is done except what follows. **You are the third builder. Read `docs/plan/step-23.md`, "Builder notes" (where the last builder stopped, 7234958), then, each its own push:** (1) **put the bomb and the spear where a player can reach them**: the Bandit Camp or the quarry's road, a place agreed by message with Step 22's lead (`session_017WiGzF7NsB3KTwXkWUXE63`) for anything in the quarry; a phone screenshot of the burst; (2) `uses` (a bomb is spent; no other weapon wears out unless the brief says so); (3) push 5 as written below: bad guys pick a weapon up, the stage-restore function Step 22 asked for; (4) the owed screenshots (three heroes and one bad guy holding the same sword). The alarms builder (`session_017WiGzHgbh9PtsdzXnTDvqz`) and the wagon builder (`session_017WiGzJfeRQoKZSky3npQv6`) are changing the camp tonight: message before placing anything there.

**Landed so far (2026-11-24 03:20 UTC), by `session_017WiGzF7puSFWh2BBeii8WZ`, which stopped at its context line:** push 1, the sword on the castle street (69c12b4); push 2, a hard hit knocks a weapon loose, Grab throws it, `camp-fighter-2` starts with a sword (8b2fee3); push 3, the hammer in the Bandit Camp, the spear as one data file, the weapon on the party plate (fae2b34). **You are a fresh builder: read `docs/plan/step-23.md`, "Builder notes" and "Where this builder stopped", then do, in this order, each its own push:**
1. **A second power replaces the first** (the owner, ~01:50 UTC: "Similar to kirby - cant have multiple powers at once"). Today a hero holding a power walks through a second orb. The old power pops out as an orb where the hero stands, as a knocked-loose one does (`docs/mechanisms/` on powers; Step 9's files are yours for this one fix). One weapon and one power together stays (`DRAFT:`, asked of the owner in `docs/questions-inbox.md`).
2. **Swords must not pile up**: a beaten carrier drops his sword and returns armed. Make a returned carrier come back armed only if his sword is not lying or held somewhere in the world.
3. **A held weapon at game over** goes back where it was found: ask the hearts builder (`session_017WiGzG7mhviEaxroo5GvBv`) by message for its game-over event; if it has not landed, leave this and say so.
4. The brief's pushes 4 (the bomb, `uses`) and 5 (bad guys take a weapon, the quarry's spear and bomb, the stage-restart function Step 22 asked for).
Owed screenshots: three heroes and one bad guy holding the same sword. An open ask to the buttons builder (a Throw look on Grab) stands. `npm run e2e`'s `plates-stone` fails on `main` since about 5e9e6cb and is being traced by the orchestrator: not yours. The check `step20-machine` is being fixed by another builder (`node scripts/lib/run-check.ts` runs one check alone).

## The task, and why

The owner, 2026-11-24 ~00:10 UTC, first-hand: "Weapons assets uploaded". On
2026-11-23 ~18:30 UTC he listed "no power/item stealing" among what is missing
(`docs/plan/core-loops.md:18`). The contract's controlling decision (quoted
in the step file): no bearer in any weapon picture; one library; attached in
the engine at a grip anchor.

**What a player gets:** the step file's "Goal". **Buttons, no new one:** Use
picks up (it reads "Pick up" and the weapon glows), Hit swings, Grab throws
(stick down: sets it down). **It moves no row of `docs/plan.md`'s table**
(M1, M2, M3 unchanged); it is read by the owner playing.

## Measured and read for you (at 8413d16)

- **Nothing is a weapon today.** No `content/weapons/`, no `c.weapon`, no
  `step23-*` scenario, and no look group `weapons` on `main` yet (the props
  builder, `session_017WiGzEN1QbSnHzXNqV4XSt`, is cutting it: per weapon a
  ground, pickup, held, swing (2 frames), impact and broken look, plus the
  bomb's burst). **Read `content/looks/weapons.json` for the real ids; never
  guess one.** If it is not on `main` when you start, ask the props builder
  for the ids; a missing look draws a plain shape, so nothing waits.
- **The contract never lists nine fixed states** (the props builder's
  report does, from looking): the manifest says "per-row variation; inspect
  visually", the readme that the rows are "NOT genuine fixed-cell runtime
  animation strips". So a weapon file names each look it has, and one with no
  broken or swing look is valid. The readme wants ground art without "baked
  HUD rings, impact flares or cast shadow": the pickup glow may be your own
  layer (`fx-pickup-glow`, `content/looks/powers.json`).
- **Numbers over a holder** are laid at one place: `numbersOf`
  (`src/sim/powers.ts:38-47`: `times`, then `atLeast`), read by every verb of
  every body (`src/sim/systems/verbs.ts:37`) and by `bodyNumbers`
  (`src/sim/body-state.ts:106`).
- **The swing** (`src/sim/verbs/attack.ts`): reach is `attackReach` in front
  (:128-132), launch speed `attackStrength` / the target's weight capped at
  `maxLaunchSpeed` (:145; 520, `content/tuning.json:25`), wear `attackWear`
  (:151), the wind-up `attackWindup` (:80); `attacked` is emitted when the
  strike starts (:113); while `c.carrying`, Hit throws at once (:74-78).
  Today's numbers: grappler reach 14, strength 14000, wind-up 0.1 s
  (`tuning.json:158-165`); infiltrator 10, 8000, 0.033; `outpost-fighter` 12,
  9000, 0.25 (:255-259); `brute` 16, 24000, 0.5 (:370-374). A breakable wall
  breaks at 200 px/s (`wallBreakSpeed`, :53).
- **Grab** (`src/sim/verbs/grab.ts`): a fresh press (:38-40); while carrying
  it sets down (:44-52); else it lifts the nearest body in reach (:61-84).
- **Losing a power** (`src/sim/systems/power-drop.ts`): on `flattened` with a
  `by`, or a `hit` whose target's `c.impact` this tick is at
  `powerHardHitSpeed` or over (:38-49; 180, `tuning.json:69`); played targets
  only (:50); not in the cantina (:59). The orb is made in one place
  (`src/sim/power-orbs.ts:18`) and moved by `moveOrb`, private to
  `src/sim/systems/power-take.ts:60`, for a box of `ORB_SIZE`.
- **The Use arbiter**: an entry is `{ id, order, find }` (`src/sim/use.ts:30-41`);
  the door is 0, a thing 100 (`use/thing.ts:16`, within `npcInteractReach` 20,
  `tuning.json:12`), get-in 120, free 150, the bell 200. The acting system
  keeps its own fresh-press memory and acts only when the answer is its own
  (`src/sim/systems/npc-interact.ts:32-37`). Words: `content/prompts.json:4-8`.
  The page shows the word and sets the button's `data-state` to the word key
  (`src/client/use-prompt.ts:24-27`).
- **Server-only rules** test `isPageWorld(world)` (`src/sim/machines.ts:100`).
- **The page's prediction does not read `numbersOf`:** `src/net/predict.ts:116`
  and `:152` read `content.tuning.characters[kind.tuning]` directly, so a
  held power's strength is not predicted today and a weapon's reach would not
  be. **The HUD plate** has three slots (`src/client/draw/hud.ts:21-22`), one
  filler each (:33), its width from `HUD_SLOTS.length` (:92).
- **Bodies with hands** (attack numbers in `content/tuning.json`): the five
  roster heroes and `hero`; `guard`, `villain`, `shopkeeper`,
  `outpost-fighter`, `heavy-fighter`, `brute`. Placed ids: `camp-fighter-1`
  [25,10], `camp-fighter-2` [28,10] (`content/placements/outpost.json`);
  `street-guard` [40,10], `street-villain` [21,10] (he carries the boost
  power) on the street, whose things stand at columns 12 to 16 and crates at
  31 and 34; `road-toll-watcher`, `road-heavy` (the quarry road).
- **A sprite has one `anchor` and no hand point** (`content/sprites/*.json`).
  `src/client/draw/entities.ts` exports `drawnOffset` and `drawnTop`: where a
  body is drawn this frame (`draw/powers.ts` uses them). Scenario room
  controls leave out content that names real rooms
  (`scripts/lib/room-controls.ts:56`, a list each slice has added to).

## What to build (`DRAFT:` throughout; decisions-log entries "Step 23")

**The shape.** `content/weapons/<id>.json` (kind `src/content/kinds/weapons.ts`,
`read.only`, all optional but `id`, `name`, `looks`): `name` (shown; never in
an id); `looks` (ground, pickup, held, swing, impact, broken, icon); `grip`
and `box` (the contract's grip_anchor and hitbox); `hit` (`add`, `times`,
`atLeast` over the holder's numbers, after a power's); `use` (`"swing"` or
`"throw"`); `breaks`; `thrown` (speed, strength, wear); `burst` (fuse,
radius, strength, wear); `uses` (absent: never used up); `sources` (`id`,
`room`, `tile`, `restock`); `carriers` (placed ids or kinds);
`takenByBadGuys`. The check refuses a look that does not exist, a `hit`
number no verb reads, a source outside its room, a carrier that is nothing.
`content/grips.json` (kind `grips`): per character kind, where the hand is
from the box's top-left facing right, with a `default` so a new kind needs no
row. A helper `src/sim/weapons.ts` (not in a registry directory).

1. **Push 1: a sword you find, pick up and swing.**
   - `c.weapon?: { id; uses? }`, set and cleared **only** by a new effect
     `{ kind: 'weapon'; weapon: string | null; uses?: number }`
     (`src/sim/effects.ts`, additive; a row in `docs/architecture.md`,
     "Effects on a player"), so the holder's own page has it.
   - A loose weapon is an entity of kind `~weapon` with `c.loose` (the weapon
     id, its source id if any): **no body**, as the orb is and for the orb's
     reasons (`powers.ts:57-65`; copy that `INTENT:` to your constant).
   - `weapon-sources` (server-only): each source has its weapon lying on its
     tile unless one from it is out in the world; `restock` seconds after
     that one is used up, or carried out of the room, another stands (D-080).
     Read with defaults: a kept game saved before this has none and gets them.
   - `src/sim/use/weapon.ts`, order **90** (before a thing's 100, so a weapon
     dropped beside a counter can still be picked up; the door still wins):
     a played hero who can act, touching a loose weapon (its box widened by a
     world number you pick): `{ entry: 'weapon', word: 'pick-up' | 'swap' }`.
     The row `"weapon": { "pick-up": "Pick up", "swap": "Swap" }` in
     `content/prompts.json`. `weapon-take` (server-only) acts on a fresh
     `interact` press when the answer is its own; a swap drops the old one at
     the hero's feet. Events `weapon-taken`, `weapon-dropped`.
   - The overlay: one additive block in `numbersOf` calling your helper, so
     with no weapon it returns exactly what it returns today.
   - `src/net/predict.ts:116` and `:152` read through `numbersOf(content, me)`
     (an agreed edit; it also makes a held power's hit predicted: say so in
     the commit).
   - `src/client/draw/weapons.ts` and its one line in `render.ts`: loose
     weapons (the `pickup` look or a glow on the one `usePrompt`'s answer
     targets); a held one at the holder's grip, flipped with `facing`, drawn
     where the body is drawn (`drawnOffset`, `drawnTop`), following
     `c.attack.phase` (wind-up: held; strike: the swing frames; then the
     impact look where `c.impact` is). `drawn.weapons` (loose, held) in
     `src/client/main.ts` for the checks.
   - `content/weapons/sword.json` with one source on the castle street, seen
     on the first screen a player has on entering it, more than 20 px from
     every thing there. Scenarios `-pick-up-and-swing`, `-any-hero-holds-it`.
2. **Push 2: lose it, throw it, steal it.**
   - `weapon-loose` (server-only, after the impacts at 510/520): Step 9's two
     triggers, for **any** holder; the weapon leaves the hand (the effect
     with null) and pops out away from the hitter. Read `powerHardHitSpeed`;
     add no second threshold. Move loose weapons with the orb's fall, bounce
     and slide: lift `moveOrb` into a shared helper that takes a size
     (`power-take.ts` calling it, behaviour unchanged, every `step9-*` green
     untouched); if that turns anything red, copy it into your helper with a
     note and report.
   - Grab throws: one guard line in `src/sim/verbs/grab.ts` after :40 (a body
     holding a weapon grabs nothing), and `weapon-throw` (server-only, its
     own fresh-press memory of `grab`): stick down sets it at the feet, else
     it leaves the hand at `thrown.speed`, aimed by the stick as
     `throwCarried` aims (`body-state.ts:221`). In flight it launches the
     first body it overlaps with `launch`, `markImpact`, `wear` and a `hit`
     event (`body-state.ts:164-186`), sparing a friend by
     `friendAttackLaunch` / `friendAttackWear` as the swing does
     (`attack.ts:143-151`), then drops. A hero holding a weapon takes none by
     touch; taking is always Use.
   - `carriers`: a placed bad guy starts holding one. **Measure first** (see
     Traps); first choice `camp-fighter-1` with the sword.
   - `scripts/checks/step23-weapons.ts` (two connections) and
     `scripts/e2e/weapons.ts` with its one line in `scripts/e2e.ts`; the same
     fact in `check:live` in a private world. Scenarios
     `-hard-hit-knocks-it-loose`, `-steal-from-a-carrier`,
     `-thrown-knocks-down`, `-thrown-out-leaves-it`.
3. **Push 3: the hammer and the spear, as data.** `breaks` (a system reading
   `attacked` by a holder: `breakPartAt` on the tiles in reach in front,
   `room-parts.ts:76`) and `uses` (counted on `attacked`; at zero the weapon
   is gone and its `broken` look plays where it was). `hammer.json` (a source
   in the Bandit Camp, **in your file**, not the camp's), `spear.json` written
   last and **without touching code**: note in the builder notes how many
   lines of code it took (the answer must be none). A `weapon` slot on the
   plate (`'weapon'` added to `HudSlot` and `HUD_SLOTS`, your filler in
   `draw/weapons.ts`): if any HUD or phone e2e fact moves, leave the slot out
   and report. Scenarios `-hammer-breaks-the-wall`, `-one-file`,
   `-source-stands-another`.
4. **Push 4: the bomb.** `use: "throw"`: the holder's Hit swing is harmless
   (its `hit` overlay) and on `attacked` the bomb leaves the hand; after its
   fuse or on meeting a body it bursts: every body within the radius is
   launched away from the middle by weight and worn, breakable parts in the
   radius break, the thrower is not spared (doc 08: "recklessly, carelessly
   destructive action including self-destructive stunts"), a friend by the
   friend shares. Its source restocks. `-bomb-bursts`.
5. **Push 5: bad guys and the quarry.** `takenByBadGuys`: a body nobody
   plays, listing `attack`, with empty hands, on its feet, overlapping a
   loose weapon, takes it (a rule by touch; it writes no `c.input` and moves
   nobody: NPC response logic stays scripted). A spear and a bomb in the
   quarry: agree the tiles, and any carrier's placed id, by message with Step
   22's lead (`session_017WiGzFrf7N7ZgaqUyjs4Sz`) before writing them; they
   go in your weapon files, never in a quarry room or placements file. Tell
   that lead `src/sim/weapons.ts` exports a function that puts a list of
   rooms' weapons back as they began, for the stage starting over.
   `docs/mechanisms/weapons.md`. `-bad-guy-takes-it`.

## Traps

- **A weapon in a bad guy's hand makes him hit harder and further**
  (`numbersOf` serves every body), and other steps' scenarios stand heroes in
  the camp and the street for minutes (`step4-*`, `step7-*`, `step12-*`,
  `step21-*`, `step22-*`). Before pushing a carrier, run `npm run check` in a
  scratch copy with it and count the reds. Any red: pick another carrier or a
  gentler `hit`, and report the count. Never re-time another step's scenario.
- **A swing must feel as quick with a sword as without** (`network.md`,
  "Predicted hits"). After the `predict.ts` edit, `scripts/e2e/hit-lands.ts`'
  facts stay green unloosened, and your phone fact measures the same with the
  sword (150 ms added each way; the star by wind-up + 50 ms).
- **The pickup and the throw are not predicted** (as a grab's lift is not):
  measure press-to-drawn for both on the phone page with the added delay and
  write the numbers in the notes; build no prediction for them here.
- **A page runs the sim too**, and its world holds only its own hero: every
  `weapon-*` system returns at once when `isPageWorld(world)`. The page learns
  its own weapon by the effect (so its Grab guard agrees with the server's)
  and everyone else's by the snapshot.
- **Orders.** The door's 0 is an `INTENT:`. Your systems run after `verbs`
  (100) where they read `attacked`, after 520 where they read impacts.
- **No digits anywhere drawn** (`t-no-numbers`; D-020): no durability bar.
  Read every new field with a default (`docs/mechanisms/saves.md`).
- **Looks are the props builder's.** Never cut, re-cut or rename one; ask by
  message, and list what a weapon lacks in your notes.
- Stop test servers by PID. `git pull --rebase` before each push. If live is
  healthy on an older commit after a push, wait, don't revert.
- **e2e facts `h1`/`h2` (reconnect), `cantina-row` and the friend-throw facts
  fail some runs on `main`** (being fixed under
  `handoff-prompts/step-5-e2e-flakes.md`): re-run and report which failed;
  never loosen a check.

## Yours, and not yours

**Yours:** the files under "Owns" in `docs/plan/step-23.md`, and exactly the
agreed additive edits it lists there, plus the `moveOrb` lift in
`src/sim/systems/power-take.ts`.

**Must not touch; ask the owner of each by message, with your measurement:**
`content/defeat/**` and `defeat-*` (Step 21); `alert-*`, `npc-*`,
`src/sim/npc/**`, `content/dispatch/**` (the chase-and-alarms builder,
`session_017WiGzF31gfYgeWNMA7rnEL`); `outpost-*`, `content/outposts/**`;
`machine-*`, `content/machines/**`; every quarry room and placements file and
`content/stages/**` (Step 22); `content/rooms/outpost.json` and
`content/placements/outpost.json` (the camp); the touch controls being
re-skinned by `session_017WiGzJ23ionY6B1PB5Nmme` (`src/client/touch.ts`, its
styles, `assets/ui/touch/**`, `content/actions/**`); `src/sim/verbs/attack.ts`;
`content/looks/**` and `assets/**` (the props builder); the character
sections of `content/tuning.json`; `content/sprites/**`. If any other step's
scenario goes red, stop and report.

**Out of scope:** the other eight weapons (the shield's block, the hook's
rope, the parasol's glide are rules nobody has built); a "Throw" look on the
Grab button (ask the buttons builder once their push is live); a swing arc
that hits above or behind; a weapon and a carried body at once; any cantina
rule (place none there); bad guys seeking a weapon; an inventory.

## Decided, and open

Decided by the owner: the contract's controlling decision; D-009, D-020,
D-053, D-080, D-081, D-093; gameplay before joke; solo never locked out; NPCs
scripted; content is data; ids are never renamed. `DRAFT:`, yours to log: all
of the step file's `DRAFT:` list and every number. Nothing waits on the
owner; what he judges by playing is the step file's "Open".

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green (the flaky
facts above: re-run and report, never loosen); pushed to `main`; live
(`npm run check:deployed`, `npm run check:live`); `/debug/errors` read.
Screenshots at 844×390 and 390×664 under `docs/plan/step-23-shots/`, among
them three heroes and one bad guy holding the same sword (the readme's own
test). By the last push: `docs/mechanisms/weapons.md` and its index line;
`docs/architecture.md` (a "weapon" row under "I need to add…", the `weapon`
effect, a Step 23 row of paths); `docs/mechanisms/asset-coverage.md`; an
entry in `docs/deliberate-designs.md` for each `INTENT:` you write;
decisions-log entries "Step 23". A blocking question goes to the orchestrator
by message and to `docs/questions-inbox.md`; a flag to
`docs/for-the-orchestrator.md`. Final message: done or blocked, the commit.
