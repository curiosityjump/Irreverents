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
`swing`, `impact`, `broken`, `icon`, `burst` when cut: the contract lists no fixed
states); `grip` (where the hand holds its `held`/`swing` look, facing right);
`box` (its size lying loose or flying); `hit` (`times`, then `add`, then
`atLeast`, over the holder's numbers, after a power's); `use` (`swing`, or
`throw`: Hit throws it, `weapon-toss`, 95); `burst` (`fuse`, `radius`,
`strength`, `wear`, `breaks`: a thrown one is lit and bursts, `weapon-burst`);
`sources` (`id`, `room`, `tile`, `restock` s); `thrown` (`speed`,
`strength`, `wear`); `carriers` (placed ids or kinds); `breaks` (what its
swing breaks: `weapon-break`, 106, on `attacked`, every breakable part with
a tile in reach in front whose own breakSpeed, or `wallBreakSpeed`, is at
most this); `uses` (swings before it wears out, `weapon-wear`; absent:
never; a weapon with a `burst` may only say 1); `takenByBadGuys` (a bad guy
standing on it takes it, `weapon-npc-take`; absent: false). The check refuses a
look that is not cut, a `hit` number no character has, a source outside its
room, a carrier that is nothing or has no hands. `content/grips.json`: each
kind's hand point (pixels from the box's top-left, facing right), and a
`default` share of the box for a kind with no row.

| Id | Does | Why these numbers |
|---|---|---|
| `sword` | +10 reach, x1.4 strength, own wind-up; thrown at 320 px/s, strength 14000 | Quick: a grappler's swing sends a 40-weight dummy at 490 px/s, 350 bare-handed. Lies on the castle street at column 10, seen on the first screen; `camp-fighter-2` carries one. |
| `hammer` | +6 reach, +0.35 s wind-up, x2.2 strength; `breaks` 250 | Slow and huge: a grappler's 30800 sends a 70-weight camp fighter off at the cap. Breaks a cracked wall (200), a fence (200) or a stall (150) in reach, not the camp's barricade (300). Lies in the Bandit Camp at column 10, just past the entrance block. |
| `bomb` | `use: throw`; thrown at 240 px/s; burst after 1.2 s or on the first body it meets: radius 40, strength 36000, wear 40, breaks 250 | Hit (or Grab) throws it; the burst launches a 40-weight dummy at the cap and the grappler standing two tiles from it the other way (the thrower is not spared: doc 08). Gone after its burst; its source stands another 20 s later. Lies on the quarry road's ledge at column 34, west of the toll-keeper and his watcher (and in the test room). |
| `test-worn-sword` | the sword's numbers and looks; `uses` 3 | Test only: lies only in the test room, so `uses` has a weapon to be checked on (`step23-wears-out`). No weapon a player finds wears out. |
| `spear` | +18 reach, x1.2 strength, own wind-up; thrown at 420 px/s | The longest reach. Written last, as data only: no code names it (`step23-one-file`). Lies on the quarry road two tiles past where a hero comes in from the courtyard, column 8 (`step23-quarry-spear-found`; and in the test room); and on the Bramble Trail's floor by the way in from the road, column 6 (`forest-trail-spear`, Step 15 push 3, `DRAFT:`). |

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
  The weapon carries `src: carrierTag(id)` (`~carrier:<id>`, never a source
  id: the kind refuses a source id starting with `~`) through every hand and
  drop. A carrier beaten for good comes back a fresh body (Step 5's
  `beaten-return`) and is handed his weapon again only if the one tagged with
  his id is nowhere in the world (loose, in a hand, or kept for a party
  member), so swords do not pile up in his room
  (`step23-returned-carrier-unarmed`).
- **Hit throws a bomb** (`weapon-toss`, 95, before the verbs): a fresh
  `attack` press by a body holding a `use: throw` weapon whose swing is
  ready throws it as Grab does (`throwWeapon`, `src/sim/weapons.ts`, shared
  with `weapon-throw`). `INTENT:` it marks the attack verb's own
  `c.attack.held` as down so no swing starts. That part runs on the page
  too, so the page predicts no swing; the throw itself is the server's.
- **A lit weapon bursts** (`weapon-burst`, 531): a thrown weapon with a
  `burst` is `loose.lit`. After its fuse, or when `weapon-move` finds it
  meeting a body (`lit.now`, instead of the thrown strike), every body
  within the radius (to its box's nearest point), not held, is launched
  away from the middle by weight and worn, with a `hit` by the thrower.
  The thrower is not spared; a friend gets the friend shares. Breakable
  parts with a tile centre in the radius break by `breaks`. Then it is
  `loose.ending` for `weaponBurstShow` s (its `burst` look is drawn, nobody
  picks it up, it does not move) and is gone. Event `weapon-burst`.
- **At a game over** (`weapon-game-over`, 589, after Step 21's
  `heart-game-over`, 588): each loose weapon that left a player of the game
  over within its beat goes back where it was found. That covers the one the
  last fall knocked loose, and anything the game over itself let go. One
  from a source is removed and its source stands it again the next tick,
  with no restock wait. One from a carrier is removed and put back in his
  hand if he is there with empty hands; if he is beaten and gone, he comes
  back armed. A weapon with no `src`, or one lost earlier and lying
  elsewhere, stays where it is (`DRAFT:`; event `weapon-returned`;
  `step23-game-over-hammer-back-to-source`,
  `step23-game-over-sword-back-to-carrier`).

- **Wearing out** (`weapon-wear`, 107, after `weapon-break`): each
  `attacked` by the holder of a `swing` weapon with `uses` spends one (the
  effect sets `c.weapon.uses`, so the holder's page has it; a loose one
  carries `loose.uses`, so it is kept through a knock, throw, swap or theft).
  With none left it breaks once that strike is over: out of the hand, its
  `broken` look plays where the hand was (`loose.ending.broken`, gone after
  `weaponBurstShow`), `weapon-worn-out`; its source restocks. Nothing is
  drawn of the count (D-020).
- **Bad guys take one by touch** (`weapon-npc-take`, 548): a body nobody
  plays, side `bad`, with hands, empty-handed, on its feet and able to act,
  overlapping a loose weapon at rest whose file says `takenByBadGuys`, takes
  it (`weapon-taken` with player null). `INTENT:` touch only: it writes no
  input and moves nobody (NPC response logic stays scripted); he never goes
  looking for one. Only the spear says true (`DRAFT:`, measured: with the
  hammer on, bandits walking into the camp take it and five scenarios of
  Steps 7, 12 and 21 go red; with the sword on, `camp-fighter-2` takes his
  knocked-loose sword back and two of Step 23's own do). The bomb does not.
  `step23-bad-guy-takes-it` (placements in `content/placements/test-weapons.json`).
- **A stage starting over** (`weapon-stage-restart`, 613, after Step 22's
  `stage-run`, 612): on `stage-restarted`, `restoreRoomWeapons(world,
  content, rooms)` (`src/sim/weapons.ts`, exported for a stage to call
  itself) removes every loose weapon in the stage's rooms and clears their
  sources' bookkeeping, so each stands its weapon again at once (unless a
  player holds the one from it in its room). A weapon in a player's hand is
  kept (`DRAFT:`). A carrier the stage puts back fresh is re-armed by
  `weapon-carriers`. `step23-stage-restart-stands-them`.

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
In the air (`loose.flying`), a weapon whose file has a `flight` (`spin` turns
a second, `trail` fading copies, `tint` `#rrggbb` at `tintAmount`; Step 24
slice 1b, draw only, the sim never reads it) is drawn spun about its middle,
tinted, with copies where this page drew it a few frames back, from
`looks.flying` when cut, else `ground`: a throw at you is never drawn like the
same thing lying still. Only `thrown-shot` says one (`DRAFT:`).
`window.irreverents.drawn.weapons` = `{ loose, held }` for the checks (a loose
one drawn in flight carries `flying`).
The party plate has a `weapon` slot (`draw/hud.ts`, between power and
cargo): the viewer's one weapon (its `icon` look when cut, else `held`).
One slot, no inventory (the owner).

`content/rooms/test-weapons.json` is a test room (not on the map): a cracked
wall and the hammer, sword and spear's test sources.

## How it is checked

- Scenarios `step23-*` (each with its control where the step names one):
  `-pick-up-and-swing`, `-any-hero-holds-it-<hero>`,
  `-hard-hit-knocks-it-loose`, `-steal-from-a-carrier`, `-thrown-knocks-down`,
  `-thrown-out-leaves-it`, `-each-hero-keeps-their-own`, `-returned-carrier-unarmed`, `-game-over-hammer-back-to-source`, `-game-over-sword-back-to-carrier`, `-bomb-bursts`,
  `-hammer-breaks-the-wall`, `-one-file`, `-source-stands-another`, `-quarry-spear-found`, `-stage-restart-stands-them`, `-wears-out`, `-bad-guy-takes-it`. Fact `weapon`
  (`src/scenarios/facts/weapon.ts`): what a body holds at a tick, or how
  many lie loose in a room.
- `npm run e2e`, `weapon-word` and `weapon-held` (`scripts/e2e/weapons.ts`):
  a phone walks into the street by touch, the Use button's `data-state` is
  `pick-up` and the sword glows; a tap and it is drawn in hand.
  Screenshots: `docs/plan/step-23-shots/`, rewritten only by `E2E_SHOTS=1 npm run e2e`.
