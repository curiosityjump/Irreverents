# Weapons: picked up, swung, thrown, knocked loose, stolen

**Reference.** Open before touching `content/weapons/`, `content/grips.json`,
`src/content/kinds/{weapons,grips}.ts`, `src/sim/weapons.ts`,
`src/sim/loose-fall.ts`, `src/sim/use/weapon.ts`, the systems named
`weapon-*`, `src/client/draw/weapons.ts`, `scripts/e2e/weapons.ts` or
`scripts/checks/step23-*.ts`. Written by Step 23's builder, 2026-11-24
(`docs/plan/step-23.md`; every choice `DRAFT:`, decisions-log "Step 23").

## Why it exists

The owner, 2026-11-24: *"Weapons assets uploaded"*; 2026-11-23, among what
is missing: *"no power/item stealing"*; and *"No inventory. Only one weapon
at a time. Similar to kirby"*. The P12 contract: no bearer in any weapon
picture; one library; attached in the engine at a grip anchor. D-009,
D-020, D-080, D-081 (`docs/plan/step-23.md`, "Why").

## A weapon is data

`content/weapons/<id>.json` (`src/content/kinds/weapons.ts`): `name` (shown,
never in an id); `looks` by state (`ground` and `held` needed; `pickup`,
`swing`, `impact`, `broken`, `icon` when cut: the contract lists no fixed
states); `grip` (where the hand holds its `held`/`swing` look, facing right);
`box` (its size lying loose or flying); `hit` (`times`, then `add`, then
`atLeast`, over the holder's numbers, after a power's); `use` (`swing`);
`sources` (`id`, `room`, `tile`, `restock` s); `thrown` (`speed`,
`strength`, `wear`); `carriers` (placed ids or kinds). The check refuses a
look that is not cut, a `hit` number no character has, a source outside its
room, a carrier that is nothing or has no hands. `content/grips.json`: each
kind's hand point (pixels from the box's top-left, facing right), and a
`default` share of the box for a kind with no row.

| Id | Does | Why these numbers |
|---|---|---|
| `sword` | +10 reach, x1.4 strength, own wind-up; thrown at 320 px/s, strength 14000 | Quick: a grappler's swing sends a 40-weight dummy at 490 px/s, 350 bare-handed. Lies on the castle street at column 10, seen on the first screen; `camp-fighter-2` carries one. |

## One weapon in hand, one per hero

`c.weapon = { id, src?, uses?, by? }`. Only the effect
`{ kind: 'weapon', weapon, src?, uses?, by? }` sets or clears it, so the
holder's own page has it (`docs/mechanisms/network.md`, "Effects"). `by` is
the party member (character kind) whose it is: **one weapon per hero, not
per party** (the owner). After a switch, `weaponOf` ignores a weapon whose
`by` is another kind, at once on the page as on the server; on the server
`weapon-hands` (24) keeps it for that hero in `c.weaponKept[kind]` and puts
the new member's own back in hand. `weaponStaysWithHero` 0 is the other
answer (it follows the player). A weapon and a power at once: yes
(different things on different buttons).

`numbersOf` (`src/sim/powers.ts`) calls `weaponOver` after the power, so all
four read sites, every body (a bad guy too) and the page's predicted hit
(`src/net/predict.ts`) get it. With no weapon it returns what it is given.

## Lying loose

A loose weapon is the kind `~weapon` with `c.loose = { weapon, src?, until,
from, flying? }`: **no body** (`INTENT:` at `WEAPON_KIND`, the orb's
reasons). It falls, bounces and slides by the orb's physics
(`src/sim/loose-fall.ts`, `powerOrbBounce`, `powerOrbFriction`).

- **Sources** (`weapon-sources`, 546): a source's weapon lies on its tile
  unless the one from it is still out (lying anywhere, in a hand or kept in
  its source's room). Once not, another stands `restock` seconds later
  (D-080). `world.weaponSources` is the bookkeeping; absent stands every one.
- **Use picks it up** (Use entry `weapon`, order 90, before a thing's 100;
  the door's 0 wins): a played hero with hands, carrying no body, touching
  it (box widened by `weaponPickupReach`), not before `until`. "Pick up", or
  "Swap" with a weapon in hand: `weapon-take` (62) lays the old one at the
  hero's feet. The weapon the press would take glows (`fx-pickup-glow`).
- **A hard hit knocks it loose** (`weapon-loose`, 543): Step 9's rule
  (`flattened` by someone, or a `hit` at `powerHardHitSpeed`), for any
  holder, played or not; it pops away from the hitter, untakeable for
  `powerRetakeTime`. Not in the cantina while `powerLostInCantina` is 0.
- **Grab throws it** (`weapon-throw`, 105, after the verbs; the grab verb
  lifts nothing with a weapon in hand): stick down sets it at the feet;
  else it leaves at `thrown.speed`, aimed as `throwCarried` aims.
  In flight (`weapon-move`, 530) it launches the first body it meets by
  `thrown.strength` against its weight, wears it, emits `hit` by the thrower
  and `weapon-struck`, spares a friend by the friend shares, and drops.
- **Carriers** (`weapon-carriers`, 26): a body nobody plays named in a
  weapon's `carriers` is handed it once. Knocked loose, it is there to steal.

`INTENT:` every `weapon-*` system runs only where `weaponWorld` is true
(the server's world or a scenario's: no `world.taken`, and some body nobody
plays). A page's world, even before its first snapshot, holds only its
own character.

## What a player sees (`src/client/draw/weapons.ts`)

One line in `render.ts`, after the powers. Loose: the `ground` look on the
floor, mirrored with its facing; the one this page's Use would take in the
glow. Held: the look's `grip` on the holder's hand point
(`content/grips.json`), mirrored with `facing`, offset by `drawnOffset`
(drawn where the body is drawn); wind-up and ready: `held`; strike: the
`swing` look's first frame; recover: its last; a blow by a weapon in hand
plays its `impact` look where it landed. No digits anywhere.
`window.irreverents.drawn.weapons` = `{ loose, held }` for the checks.

## How it is checked

- Scenarios `step23-*` (each with its control where the step names one):
  `-pick-up-and-swing`, `-any-hero-holds-it-<hero>`,
  `-hard-hit-knocks-it-loose`, `-steal-from-a-carrier`. Fact `weapon`
  (`src/scenarios/facts/weapon.ts`): what a body holds at a tick, or how
  many lie loose in a room.
- `npm run e2e`, `weapon-word` and `weapon-held` (`scripts/e2e/weapons.ts`):
  a phone walks into the street by touch, the Use button's `data-state` is
  `pick-up` and the sword glows; a tap and it is drawn in hand.
  Screenshots: `docs/plan/step-23-shots/`.
