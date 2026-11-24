# Step 23 — Weapons: things you pick up, swing, throw, lose and steal

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-24 ~00:10 UTC, first-hand to the orchestrator:**
> Weapons assets uploaded

**Owner, 2026-11-23 ~18:30 UTC, after playing on a phone**
(`docs/plan/core-loops.md:18`, "The owner's verdict"), listing what is missing:
> ... no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. ...

**The upload's contract** (library doc *P12 — Standalone Weapon Families:
Direct File Index and Integration Contract*,
`docs/design-library/06-asset-collaboration-claude-chatgpt/p12-standalone-weapon-families-direct-file-index-and-integration-contract.md`),
under its heading "THE CONTROLLING OWNER DECISION":
> Weapons must appear in ALL gameplay-relevant configurations without ANY hero, enemy, hand, or other bearer baked into the artwork. A sword must be usable by the grappler, rogue, flyer, NPCs and later recruitable characters from ONE reusable weapon library. All equipment is attached by grip anchors in-engine, using separately animated character hand/body poses. Source drawings showing a weapon held by a sample character are reference only; never an acceptable final all-purpose weapon sprite.

The same doc: "Store grip_anchor, pivot, hitbox and optional projectile anchor
in a JSON manifest. ... weapons attach by hand_anchor and draw order, not by
duplication. Never invent an animation state that the game has no
corresponding mechanic for." Its status line is literal: "STATUS: SOURCE ART
UPLOADED / NATIVE PER-STATE EXTRACTION NOT YET COMPLETE", and "Do not mark
WPN-001 production-ready solely from this upload." The pack's readme
(`.../p12-standalone-weapons-and-configurations-source/readme-for-claude.md`),
"Engine rule — must survive every later conversion": "Each weapon is its own
rendering and gameplay object"; "Do NOT require a bogus projectile state for
an immovable shield or a 'broken' state for an indestructible wand"; "Test
actual native objects with EACH of the three canon heroes (and NPCs) at the
game viewport of 320×180 on iPhone"; "Layer VFX independently so assets can
be reused."

**The library on what a weapon is** (doc 11): **D-009** "Abilities and/or
weapons can be acquired from enemies or the map, Kirby-style" (:41); **D-020**
"Spectacular IMPACT is a top priority: suplexes, launches, heavy collision,
knockback into walls/other enemies" (:65); **D-053** the Rule of Cool:
"surprisingly clever and outrageous uses of abilities, objects, physics"
(:229); **D-080** rare items "available only in one/few authored spots ...
players can deliberately return to KNOWN SOURCES and obtain another copy after
losing the one they carried away" (:329); **D-081** "taking DAMAGE can KNOCK
AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried items ...
exact loss thresholds, timing, item categories and how player can reclaim it
remain OPEN" (:331). Doc 05, "Three-layer ability model": "Layer C — Acquired
powers and weapons. Kirby-like pickup/copy behavior from enemies or the map,
overlaying a character's innate abilities"; and "A power or weapon is
something found or taken from enemies or the environment, not necessarily a
permanent upgrade." Doc 08: "Weapons and copied powers can be an opportunity
to express different kinds of impact: grabs/suplexes, hammer slams, knockback
bat ..."; "Avoid one-dimensional 'combat-only pickups' where richer reuse is
feasible."

Today nothing in the game is a weapon: a hero's Hit is its own fist, and the
only thing taken from an enemy is a power's orb (Step 9).

## Goal

A player walking into the castle street sees a sword lying on the ground.
Standing at it, the Use button says **Pick up** and the sword glows; a press
and it is in the hero's hand, whichever hero it is. Hit now swings it: it
reaches further and sends a guard further. A hammer found in the Bandit Camp
swings slow and sends a fighter across the room and through a cracked wall; a
bomb is thrown and everything near where it bursts flies. The Grab button
throws what is in your hand, and a thrown weapon knocks down what it meets and
lies where it lands. Take a hard hit and the weapon flies out of your hand and
lies there for anyone. Some bad guys come at you with one: knock it loose,
pick it up, and it is yours. Two friends see the same weapon in the same
hand; one player alone can do all of it; every part is a touch on a phone
with the buttons that are already there.

## What's decided

- The owner's contract above: one library; no bearer in any weapon picture;
  a weapon is its own object, attached in the engine at a grip anchor on any
  character's hand. P12 is "the preferred current weapon reference over P11
  carrier-embedded combat illustrations".
- D-009, D-020, D-053, D-080, D-081 as quoted. No numbers on screen (D-020;
  `CLAUDE.md`, "Impact over numbers"): a weapon changes reach, knockback, the
  wind-up and what breaks.
- **iPhone first, no new button** (D-093, doc 11:371; `CLAUDE.md`). The five
  action buttons stay five (`content/actions/`: attack "Hit", grab, interact
  "Use", jump, switch).
- **Content is data.** One more weapon is one file, `content/weapons/<id>.json`,
  and no code (`CLAUDE.md`, "Prefer data to code"; the powers kind is the
  model, `src/content/kinds/powers.ts:17-37`).
- **It builds on what is there** (read at 8413d16):
  - A held thing's numbers are laid over the holder's at one place,
    `numbersOf` (`src/sim/powers.ts:38-47`), read by every verb for every
    body, played or not (`src/sim/systems/verbs.ts:37`). So a weapon's reach,
    strength, wear and wind-up reach the swing (`src/sim/verbs/attack.ts:128,
    145, 151`) with no edit to the attack verb, for a hero and a bad guy alike.
  - Losing it is Step 9's rule, widened: a hard hit is "being laid flat by
    someone, or a blow that sends the hero off at powerHardHitSpeed or faster"
    (`src/sim/systems/power-drop.ts:15-17`; 180 px/s,
    `content/tuning.json:69`). That system acts on played heroes only (`:50`).
  - A thing lying loose that is not a body is the orb's model
    (`src/sim/powers.ts:57-65`, an `INTENT:`: no swing strikes it, no grab
    lifts it, nobody witnesses a blow on it).
  - Picking up is one Use entry and one row of words
    (`src/sim/use.ts:30-41`; `content/prompts.json`; `docs/architecture.md`,
    "something Use does").
  - What reaches a player's own page is an effect (`src/sim/effects.ts:14-29`,
    additive only).
  - A wall broken some other way than by flying into it:
    `breakPartAt(ctx, roomId, tx, ty, by)` (`src/sim/room-parts.ts:76`).
  - Thrown out (Step 21): being laid flat already knocked the weapon loose,
    so it lies where you fell, as a power does. No defeat file changes.
- The art is the props builder's look group `weapons`
  (`handoff-prompts/owner-weapons-art.md`; its notes: `tools/art/props/README.md`,
  "Weapons"). Its cuts are `DRAFT:` stand-ins from an approved source: the
  contract calls the upload source only.

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 23")

The library leaves these open (doc 05: "OPEN: number of simultaneous powers
per hero; can powers be dropped, held, combined, stored, transferred between
characters, preserved through switching or death ... whether every character
can wield every power; whether weapon and copied power occupy one slot or
separate categories"; D-081's own open list).

- **The buttons.** **Use picks it up**: it is the one button that says what a
  press will do, so the game tells the player without a notice (the word "Pick
  up"; "Swap" when a hand is already full), and the weapon the press would
  take glows. **Hit swings it** (Hit already means "strike with what you
  have"). **Grab throws it** (the stick held down: sets it down at your feet):
  Grab is the hands button, and it is how a held thing is thrown in Smash,
  the owner's own reference; with a weapon in hand Grab lifts no body. Hit and
  Grab show their pictures as today. The other answer (Grab picks up, Hit
  throws, as for a crate) is one Use entry removed and one branch.
- **One weapon in hand, beside one power**: a weapon is its own slot
  (`c.weapon`), separate from `c.power`. A weapon in hand means no carrying a
  body; picking up a second swaps.
- **Any body with hands can hold any weapon**: every hero and every bad guy
  that lists `attack`. Per-character hand anchors are data with a default.
- **It stays in your hand** when you switch hero, go through a door, or enter
  the cantina; it leaves your hand by a throw, a hard hit, or being used up.
- **A hard hit knocks it loose from anyone**, played or not, at Step 9's
  threshold. A loose weapon lies there until taken; it does not fade
  (a power's orb does: the other answer is one number).
- **Wearing out is per weapon, as data** (`uses`; the readme: no broken state
  for an indestructible thing). First weapons: the sword, hammer and spear do
  not wear out; the bomb is used up by its one burst. The library is silent on
  durability; this is the simpler answer.
- **Where weapons come from**: `sources` in the weapon's own file (a room and
  a tile; D-080), which stand a new one there a data number of seconds after
  the last was carried off or used up, and `carriers` (placed bad guys who
  start with one in hand).
- **Stealing** is knocking a carrier's weapon loose and picking it up. A bad
  guy with empty hands who walks over a loose weapon takes it (a scripted
  rule by touch, switched per weapon; he does not go looking for one).
- **A thrown weapon** is not a body: it flies by its own small rule, launches
  the first body it meets by the weapon's `thrown` numbers, and lies where it
  stops. A friend is spared by the same shares a friend's swing uses.
- **First weapons** (four that differ in play): the **sword** (reach, quick),
  the **hammer** (slow, far the biggest launch, breaks a cracked wall it is
  swung at), the **spear** (longest reach; thrown flat and far), the **bomb**
  (Hit throws it; it bursts and launches everything near, its thrower
  included). The other eight are data files added after, each when the game
  has a rule for what it does (the contract: "Never invent an animation state
  that the game has no corresponding mechanic for").
- **Where the first ones lie**: the sword on the castle street, the hammer in
  the Bandit Camp, a camp fighter carrying a sword, and a spear and a bomb in
  the quarry (Step 22's stage), each seen on screen before it is reached.
- Every number (reach, strength, wind-up, throw speed, burst radius, restock):
  the builder measures and picks, `DRAFT:`, logged.

## Open (for the owner, by playing; nothing waits on him)

- Should a weapon wear out and break after some swings?
- Should your weapon stay with you when you switch hero, or stay with the
  hero who picked it up?
- Should a weapon knocked out of your hand disappear after a while, like a
  power does?
- Should bad guys go and fetch a weapon lying near them?
- Do Use to pick up and Grab to throw feel right under the thumb?

## The signal (re-runnable)

- Scenarios `step23-*`, each with a control watched to fail:
  `-pick-up-and-swing` (the street's sword: Use takes it; a dummy struck with
  it travels further than struck bare-handed; control: no pickup);
  `-any-hero-holds-it` (each roster hero in turn); `-hard-hit-knocks-it-loose`
  (control: a light hit keeps it); `-steal-from-a-carrier` (a camp fighter's
  sword knocked loose and picked up; control: he is not hit, he keeps it);
  `-thrown-knocks-down` (Grab throws; the body it meets flies; the weapon
  lies where it stopped and can be picked up again; control: thrown the other
  way); `-hammer-breaks-the-wall` (control: the sword does not);
  `-bomb-bursts` (bodies near fly, the thrower too; control: out of the
  radius); `-source-stands-another` (control: before the time);
  `-thrown-out-leaves-it` (beaten in the camp: the weapon lies inside);
  `-bad-guy-takes-it` (control: the switch off); `-one-file` (the spear: a
  scenario that passes with no code naming it).
- A real-server check `scripts/checks/step23-weapons.ts`, two connections:
  one picks up, both see it in that hand; the holder's own page has the
  weapon's reach; knocked loose, both see it lying at one place; the other
  takes it (control: the weapon file's source removed).
- `npm run e2e`, a phone-sized page by touch: walk to the street's sword, the
  Use button reads "Pick up" (`data-state`), tap it, `drawn.weapons` shows it
  held; tap Hit and the crate's star comes within the wind-up plus 50 ms with
  150 ms added each way (the predicted hit, `docs/mechanisms/network.md`);
  tap Grab and it is drawn loose again.
- Screenshots at 844×390 and 390×664 under `docs/plan/step-23-shots/`: the
  glow, three different heroes and one bad guy holding the same sword, a
  swing, a throw, the burst.

## Stopping condition

The signal passes on `main` and live, with four weapons a player can find
without being told.

## Owns

New files: `content/weapons/**`, `content/grips.json`,
`src/content/kinds/{weapons,grips}.ts`, `src/sim/weapons.ts`,
`src/sim/systems/weapon-*.ts`, `src/sim/use/weapon.ts`,
`src/client/draw/weapons.ts`, `src/scenarios/facts/weapon.ts`,
`content/rooms/test-weapons.json` and its placements,
`scenarios/step23-*.json`, `scripts/checks/step23-*.ts`,
`scripts/e2e/weapons.ts`, `docs/mechanisms/weapons.md`,
`docs/plan/step-23-shots/**`. Agreed small additive edits: the weapon laid
over in `numbersOf` (`src/sim/powers.ts`); the `weapon` effect
(`src/sim/effects.ts`); one guard line in `src/sim/verbs/grab.ts`; the two
reads in `src/net/predict.ts` (:116, :152) through `numbersOf`; one row in
`content/prompts.json`; one line each in `src/client/render.ts`,
`src/client/main.ts` (`drawn.weapons`) and `scripts/e2e.ts`; `weapons` in
`scripts/lib/room-controls.ts:56`'s left-out list; a `weapon` slot in
`src/client/draw/hud.ts`; world numbers in `content/tuning.json`. It edits no
room or placements file and nothing of the powers, heist, defeat, alert,
outpost, machine or stage slices beyond those lines.

## Briefs

- `handoff-prompts/weapons-pick-up-and-swing.md`, five pushes, one builder (drafted for the orchestrator 2026-11-24 01:35 UTC against 8413d16; nothing in it was run).

## The owner, 2026-11-24 ~01:50 UTC, first-hand to the orchestrator: no inventory

> No inventory. Only one weapon at a time. Similar to kirby - cant have multiple powers at once

Decided from it (this overrides anything above that says otherwise):

- **A hero holds one weapon, or none.** There is no inventory, no bag, no
  second slot, no list, and no inventory icon (the P12 contract's request for
  one is not used). Picking up a weapon with one in hand swaps: the old one
  drops where you stand. The HUD shows the one weapon you hold, nothing more.
- **Per hero, not per party:** each party member holds their own one weapon
  (`DRAFT:` it stays with that hero through a switch, as the brief had it).
- **Powers the same:** one power at a time per hero, as Kirby (D-009, D-080):
  taking a second replaces the first, which pops out as an orb. Check what
  Step 9 built does exactly that (`src/sim/systems/power-take.ts`) and tell
  its builder if it does not.
- `DRAFT:` a hero may hold one weapon and one power at once (they are
  different things on different buttons). The other reading of his words is
  one thing in all, weapon or power: keep it one data switch and say so in
  the notes; the orchestrator has asked him.

## Builder notes

**Push 1 (the street's sword: pick up, swing; `session_017WiGzF7puSFWh2BBeii8WZ`, 2026-11-24).**

- **A page's world before its first snapshot is not `isPageWorld`.** `world.taken` is written only with a snapshot (`src/net/client.ts:208`), so a page's own world runs some ticks with no `taken`. A first try that skipped only `isPageWorld` stood a sword in the page's own world there and turned `step11-cantina`'s "page's own world holds only its own character" red. The weapon systems instead ask `weaponWorld` (`src/sim/weapons.ts`): no `taken`, and some body nobody plays (the server's and every scenario with a body or placements). Doubt logged, not patched: `isPageWorld`'s other users (machines) may have the same few-tick gap; `world.taken = []` at the page world's creation would close it for all (`src/net/client.ts` is not this step's).
- **Measured:** the sword's swing launches a 40-weight dummy at 490 px/s from a grappler (350 bare-handed); the predicted-hit facts (`hit-*`, `scripts/e2e/hit-lands.ts`) stayed green unloosened after `predict.ts` read through `numbersOf` (star after 118 ms, limit 150). e2e run at push 1: 99 ok, `h1` (reconnect) failed, one of the known flaky facts.
- **Watched to fail:** the `numbersOf` overlay removed: `step23-pick-up-and-swing` (dummy at 346 px/s) and three `-any-hero-holds-it-*` (the bare reach misses the dummy) go red; the control stays green. e2e `weapon-word` and `weapon-held` fail with the sword's `sources` emptied.
- **What the looks lack** (props builder's, not cut here): no `pickup` and no `icon` look for any weapon (the glow is `fx-pickup-glow` under the `ground` look). The sword lying at column 10 is drawn beside the shopkeeper (column 11), so a hero standing at it overlaps him on screen (`step-23-shots/held-*.png`).
- `src/sim/loose-fall.ts` holds the orb's fall, lifted unchanged out of `power-take.ts` in push 1 (not push 2), because a swapped weapon is laid at the hero's feet and must fall like an orb; every `step9-*` stayed green.

**Push 2 (lose it, throw it, steal it; one weapon per hero).**

- **The carrier is `camp-fighter-2`, not the brief's first choice.** Measured across every scenario: with `camp-fighter-1` holding the sword, `step21-throw-is-no-escape` (landed while I built) throws the hero out at tick 2942 instead of the 2944 it pins: red. With `camp-fighter-2`, every scenario of every other step stays green (310 of 310 besides my own three, which name him).
- **Per hero, per the owner's later word** (the orchestrator's reading, above): `c.weapon.by` is the member who picked it up; `weaponOf` ignores another member's weapon (so the page, where the switch is decided, is right at once); `weapon-hands` keeps it in `c.weaponKept` on the server. `weaponStaysWithHero` 0 is the brief's original answer. "One thing in all, weapon or power" is not built: its weapon side is a branch in `weapon-take`; its power side is `power-take`'s (Step 9's), which today does not even swap one power for another (it walks through an orb while holding one; told the orchestrator).
- **Press-to-drawn on a phone page with 150 ms added each way** (neither is predicted; e2e `weapon-held`, `weapon-thrown`): the pick-up drawn in hand after 528 ms; the throw drawn loose after 556 ms. The swing with the sword is predicted: the star on a crate standing past the bare reach and inside the sword's after 135 ms (limit 150).
- **Thrown weapons in flight** run in `weapon-move` at order 530 (not 547): so the `hit` a thrown sword lands is seen by `power-drop` and `weapon-loose` the same tick (a thrown sword can knock a carrier's weapon loose) and by the camp's horn post (540).
- **Fights struck by a thrown weapon** are not counted by `fight-struck` (101, before the throw's hit): a villain struck by a thrown sword does not "hit back once struck". Same as a thrown body today (its own `DRAFT:`).
- `scripts/checks/step23-weapons.ts` watched to fail with the pick-up writing `c.weapon` instead of sending the effect (a's own page never holds it).
- `step20-machine` (not mine) fails 2 of 4 runs alone on `main` without Step 23, as on my tree: logged by Step 5's session at bbb9702.

**Push 3 (the hammer and the spear as data; `breaks`; the plate's weapon slot).**

- **The spear took no code.** `grep -rn spear src scripts --include=*.ts` finds 0 lines; it is `content/weapons/spear.json` and its scenarios. The hammer needed one new rule, `breaks` (`systems/weapon-break.ts`), written before its file.
- **`uses` (wearing out) is not built yet.** None of the sword, hammer or spear wears out (the readme: no broken state for an indestructible thing), so nothing would read it; it arrives with the bomb (push 4), whose one burst uses it up. The `broken` look is drawn by nothing yet.
- **The spear lies only in the test room** (`test-weapons`) until its quarry tile is agreed with Step 22's lead (push 5). A player cannot find it in the game yet.
- **A scenario world needs a body nobody plays** for weapons to stand (`weaponWorld`); the test-room scenarios place a dummy for that.
- **The plate's `weapon` slot** stays: with it e2e ran 113 of 113 (`heist-plate` and every phone fact unchanged).

**Where this builder stopped (after push 3, at the brief's context line), for the next brief:**

- **Push 4 (the bomb) and push 5 (bad guys take one; the quarry's spear and bomb) are not started.** `uses` (push 4) is not built; `use: "throw"` is refused by the kind until it is.
- **Owed screenshots:** three heroes and one bad guy holding the same sword (the P12 readme's own test), and the hammer, the throw and the burst. Taken so far: `step-23-shots/` pick-up, held, thrown (the e2e writes them on every local run). `camp-fighter-2` holds the sword from the first tick in the camp; the hero must jump the entrance block to see him.
- **Asked, no answer yet:** the hearts builder (`session_017WiGzG7mhviEaxroo5GvBv`) for its game-over event, so a held weapon goes back where it was found at a game over (the brief's ask; nothing built; a fall to an enemy already knocks a held weapon loose where you fell). The buttons builder (`session_017WiGzJ23ionY6B1PB5Nmme`) whether Grab should show a "Throw" look with a weapon in hand (its re-skin, 1809a34, dims only Use and Switch: Use stays lit at a weapon because the Use entry answers there; Grab never dims).
- **A beaten carrier comes back armed:** Step 5's "beaten for good" (322232e) returns a placed bad guy fresh when nobody is in his room (`beaten-return`); `weapon-carriers` hands the fresh body its sword again, while the one knocked out of him may still lie there, so swords can pile up in the camp. `DRAFT:`; the other answer is to hand a carrier his weapon once per world (a world field instead of `c.weaponCarrier`).
- **Step 22's quarry is a stage that starts over** (d6acfdb): when spears and bombs go there (push 5), a function in `src/sim/weapons.ts` that puts a list of rooms' weapons back as they began is owed to its lead (`session_017WiGzFrf7N7ZgaqUyjs4Sz`); not written.

**Fix 1 (a second power replaces the first; `session_017WiGzJahGCHPU26omeZQNq`, the second builder).**

- Both places a power is taken swap: an orb (`power-take`) and a lit pedestal (`power-sources`), through one helper, `swapOut` (`src/sim/power-orbs.ts`). The old power's orb keeps its `src`, so a pedestal's power swapped out keeps that pedestal dark until it fades. `step9-second-power-replaces` (pedestal, then orb) and its control; watched to fail on the old code. Every `step9-*` green.
- **Not watched to fail:** the `swappedBy` guard (the hero who swapped a power out does not take it back until stepped off it). In every run tried the popped orb slides out from under the hero before `powerRetakeTime`, so the run is the same without it; it is there for an orb that lands against a wall at the hero's feet.
- "One thing in all, weapon or power" is still not built (the inbox question stands): it would be `swapOut` called from `weapon-take`, and the weapon dropped in `power-take`/`power-sources`.

**Fix 2 (swords do not pile up).**

- A carrier's weapon carries `src: ~carrier:<id>` (`carrierTag`), so it is tracked through every hand and drop the way a source's id is. A carrier back from being beaten for good is armed only if no weapon with his tag is in the world. `step23-returned-carrier-unarmed` (the grappler steals camp-fighter-2's sword, beats him for good with it, leaves for 90 s and comes back: he is back with nothing in his hands), watched to fail on the code before (he was handed a second sword at 6941).
- **Not scripted:** the other half (his sword gone from the world and he comes back armed). A scenario cannot remove a player, and that is the only way the sword leaves the world today (nothing uses a sword up).
- `step20-camp` (vehicles, landed at 3a8a30a) failed once in a full `npm run check` and passed 3 of 3 alone on the same tree, a timing flake under load like `step20-machine`.

**Fix 3 (a held weapon at game over goes back).**

- Built on Step 21's `game-over` event (heart-game-over, 588; landed at ecae3ed) with no edit to its files: `weapon-game-over` (589). Measured: the last fall always knocks the weapon loose (weapon-loose) at the start of the beat, so at the game over nothing is in hand. The rule takes back each loose weapon that left a game-over player within the beat (read from its id's tick). Both halves are scripted (source: the camp's hammer; carrier: camp-fighter-2's sword) and both fail with the system removed.
- `step21-game-over-drops` (the hearts builder's check) stays green: its hero is handed a sword with no `src`, which stays lying. The comment in `heart-game-over.ts` ("a held weapon ... left where their holder stood") is the hearts builder's, and I told them it is now half true.
- A weapon lost earlier in a fight (a hard hit that was not a fall) and left lying stays where it lies at the game over (`DRAFT:`).

**Push 4 (the bomb).**

- `use: "throw"` (Hit throws, `weapon-toss`), `burst` (`weapon-burst`), the `burst` look. `step23-bomb-bursts` (the dummy flies east through the cracked wall, the grappler flies west) and its control (nobody in the radius, nobody moves), both watched to fail with weapon-burst removed. The bomb lies only in `test-weapons` until push 5 agrees its quarry tile.
- **`uses` (wearing out) is still not built.** The bomb is gone after its one burst by its own rule, and no other weapon wears out (the step file's `DRAFT:` and the readme: no broken state for an indestructible thing). A swing counter nothing reads could not be checked by any scenario, so the kind still refuses a `uses` field. It is one system on `attacked` when a weapon that wears out is wanted.
- **A Hit on a bomb is not a swing anywhere**, the page included (the toss marks `c.attack.held`). So the predicted-hit e2e facts are unaffected; a page holding a bomb draws no swing, and the throw shows when the server's snapshot arrives (not predicted, as with Grab's throw).
- **`weapon-hit-quick` went 1 ms over once (151 ms; the orchestrator's clean e2e at 3b864cd). Measured: a fault in the measurement, not the game.** Ten runs of the weapons facts alone, on an idle machine: 136-139 ms (limit 150). On the same full run the bare fist's `hit-star` drew in 105 ms. `timedTap` (`scripts/e2e/weapons.ts`) started its clock before sending the tap over the debug protocol, so the tap's own delivery (about 30 ms) counted as the game's. `hit-lands.ts` starts it on the page's `touchstart`. Changed to the same: ten runs, 120-122 ms, with the limit unchanged (wind-up + 50 ms). The pick-up and throw times in `weapon-held` / `weapon-thrown` are measured the same way now, so they read about 30 ms lower than the numbers above.
- **Owed still:** the burst screenshot. The bomb lies only in the test room, which a page cannot reach; it comes with push 5's quarry spot.

**Where the second builder stopped (after push 4, at 5ab4681, near the brief's context line), for the next brief:**

- **Landed:** fix 1 (a second power replaces the first, acfa789), fix 2 (a returned carrier is armed only if his sword is gone, da87910), fix 3 (a weapon held at game over goes back where it was found, 68ce6bb), push 4 (the bomb, 5ab4681).
- **Push 5 is not started:** `takenByBadGuys` (a bad guy with empty hands takes a weapon by touch); the quarry's spear and bomb (tiles and any carrier to agree first with Step 22's lead; Step 22's claim moved to a successor lead at 3b51c54, read `docs/plan/step-22.md` for who); the function in `src/sim/weapons.ts` that puts a list of rooms' weapons back as they began, for the stage starting over (Step 22 (b) now restarts on the game over, 1b8b8d1); `-bad-guy-takes-it`. A bad guy holding a bomb would throw it when his scripted swing presses Hit (weapon-toss runs for any body).
- **Owed screenshots:** three heroes and one bad guy holding the same sword; the hammer; the burst (once the bomb is somewhere a page can reach).
- **Open asks:** the buttons builder (a Throw look on Grab with a weapon in hand) has not answered.
