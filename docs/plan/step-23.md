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

## Builder notes

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
