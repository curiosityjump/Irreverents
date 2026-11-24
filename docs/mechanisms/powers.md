# Powers: taken Kirby-style, carried, knocked loose

**Reference.** Open before touching `content/powers/`, `src/content/kinds/powers.ts`,
`src/sim/powers.ts`, `src/sim/check-powers.ts`, the systems named `power-*`,
`src/client/draw/powers.ts`, or any of the four read sites below. Written by
Step 9's builder, 2026-11-23 (`handoff-prompts/loop-powers.md`,
`docs/plan/core-loops.md` section 3).

## Why it exists

The owner, after playing on a phone, 2026-11-23: *"There are no ...
power/item stealing ... no risk."* The library: D-009 ("Abilities and/or
weapons can be acquired from enemies or the map, Kirby-style"), D-080 (very
rare ones live in one or a few spots you can go back to), D-081 ("taking
DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE"), D-082 (you lose what you
hold, but knowing where the source is stays valuable), D-093 (no new button).
O-005 (which powers, slots, thresholds) is OPEN, so every choice here is
`DRAFT:` and logged in `docs/decisions-log.md` ("Step 9").

## A power is data

`content/powers/<id>.json` (`src/content/kinds/powers.ts`): `name` (shown;
never in an id), `icon` (a look id: its orb and the icon by the holder),
`atLeast` and `times` (the numbers overlay), `lends` (verb ids), `carriers`
(placed ids or character kinds), `sources` (`{ id, room, tile }`), `fade`
(seconds an orb knocked loose lies) and `regain` (a carrier has it again when
it gets up). Adding a power is one file and no code.

| Id | Shown | Does | Why these numbers |
|---|---|---|---|
| `boost` | Brawn | at least 30000 hit, 420 lift, 60000 throw; carried by the street's villain | Above every hero's own numbers, the grappler's included. Player one is given the grappler, who already lifts 150 and throws up to `maxLaunchSpeed`, so a plain strength power would change nothing for them. 420 lifts the throne (400). |
| `flight` | Wings | lends `flap`, at least 6 flaps of 260; one source, the depot's strongroom | Any hero reaches the quarry pit's out-of-reach ledge from its floor. Measured: four flaps are the fewest that reach it from the floor west of the ledge (three fall short), for the grappler and the infiltrator; six leave room for a clumsy thumb. |

## The overlay, and the four read sites

A held power is `entity.c.power = { id, src? }`. `numbersOf(content, e)` and
`verbsOf(content, e)` (`src/sim/powers.ts`) give a body's numbers and verbs
with it laid over them: first `times`, then `atLeast`. With no power they
return the kind's own tuning set and verb list, the same objects as before
Step 9, so a world with no power in it runs exactly as it did. Step 23 lays a
held weapon's `hit` over after the power, in the same function
(`weaponOver`, `src/sim/weapons.ts`; `docs/mechanisms/weapons.md`), so
every read site below gets it too. **Every place
a character's numbers or verbs are read for the simulation asks this file**:

- `src/sim/systems/verbs.ts`: the numbers handed to every verb, and which
  verbs run (a lent verb runs here).
- `src/sim/body-state.ts`, `bodyNumbers`: weight and toughness.
- `src/sim/systems/physics.ts`: the body's own fall numbers.

A fifth read site added later must use the same helper, or a power works in
one place and not in another. Drawing still reads the plain tuning set
(`draw/entities.ts`, `draw/impact.ts`): it shows reach, not power.

`src/sim/check-powers.ts` (from `check-content.ts`): a lent verb exists;
every number a power names is one some verb reads; an `atLeast` is in that
verb's range; and a lent verb has all its numbers in `atLeast`, because a
holder who lacks the verb has none of its own. The room controls leave
`powers/` out with the rest of the art and placements named after real
rooms (`scripts/lib/room-controls.ts`).

## Carriers and orbs (push 2)

- **A carrier** is a body nobody plays that a power names in `carriers`
  (a placed id or a character kind; `carriedPowerOf`). It is drawn with a
  small glowing orb over its head. It is not made stronger by what it
  carries: a boosted villain would re-time Step 18's fight-back.
- **Laid flat** (the `flattened` event), it drops the power
  (`systems/power-carriers.ts`, order 540): `popOrb` (`src/sim/power-orbs.ts`)
  makes an orb, an entity of kind `~power-orb` with `c.orb = { power, left,
  from, until, src? }`, that jumps up out of it and a little away from
  whoever laid it flat. The carrier is `c.powerSpent` until it gets up
  (`recovered`), then carries it again (`regain`).
- **An orb is no body** (`INTENT:` at `ORB_KIND`, `src/sim/powers.ts`): its
  kind is not a character kind, so no swing strikes it, no grab lifts it, no
  flying body meets it and no person witnesses a blow on it. As a body (the
  first version) a shopkeeper's swing struck it, the street's alert rose for
  it, and a struck orb wore down the villain it flew into, which turned a
  Step 4 town-tier scenario red. It falls, bounces and slides by its own
  small physics against the room's tiles (`moveLoose` in
  `src/sim/loose-fall.ts`, called by `systems/power-take.ts`, order 545; lifted
  out of it unchanged by Step 23, whose loose weapons fall the same way;
  `powerOrbBounce`, `powerOrbFriction`).
  It is 10 px square (`ORB_SIZE`).
- **An orb** fades after its power's `fade`
  (`power-faded`), and is taken by the first played hero who touches it
  not holding that same power: the effect `power` and the event `power-taken`.
  **One power per hero, Kirby's way** (the owner, 2026-11-24: "Similar to
  kirby - cant have multiple powers at once"): a hero holding another power
  swaps, and the old one pops out of them as an orb (`swapOut`,
  `src/sim/power-orbs.ts`), marked `swappedBy` them so they do not take it
  back until they have stepped off it (`DRAFT:`; `step9-second-power-replaces`). **Nobody
  can take it for `powerRetakeTime` (0.6 s) after it pops**, so it is seen
  to pop and the hitter steps over the body to grab it. (When the hitter
  could take it at once it was gone the frame it appeared.)
- The first carrier is the street's villain. Measured: from the street's
  first spawn, player one's grappler lays him flat in two hits, about 5 s
  in, before his fight-back matters (`step9-take-from-carrier`).

**Decided where the orb is:** taking, fading and popping run only in a
world that has the orb and the carrier, which is the server's or a
scenario's. A page's own world has neither, so a page never takes or pops
one.

## Losing it (push 3; D-081)

`systems/power-drop.ts` (order 542): a **hard hit** on a hero holding a power
knocks it out of them as an orb (the same `popOrb`, `power-dropped`), and
they hold none (the effect `power` with `null`). It fades after the power's
`fade` (5 s) unless someone takes it: the hero again, a friend, or the hero
who hit them if that one is played. A hard hit is:

- being laid flat by someone (`flattened` with a `by`), or
- a blow (`hit`) whose own launch speed, which the attack records in
  `c.impact` that tick, is `powerHardHitSpeed` (180) or more. A quarry heavy
  sends a grappler off at 200 (hard). A shopkeeper's swat reaches 67 and the
  villain's 150 (light). On the 26-weight infiltrator the villain's blow is
  346 (hard): the light hero loses it more easily.

`DRAFT:` a throw or a fall is no hit; **not lost in the cantina**
(`powerLostInCantina` 0; D-086 leaves rare gear in a brawl OPEN; 1 is the
other answer). `INTENT:` only a blow from someone in this world counts, so a
page, whose own world holds only its own character, never drops a power
itself. The server drops it and sends the effect. **A blow reaches the
holder's page as a `push`**, applied where the page has the character
without taking the server's copy, so without the `power` effect the page
would keep a power the server says is gone. A knock-out is a `flatten`,
after which the page takes the server's whole copy anyway.

## Sources: the rare one's pedestal (push 4; D-080, D-082)

A power's `sources` (`{ id, room, tile }`) each become a bodiless entity
`~source:<id>` (kind `~power-source`, `c.source = { id, power, lit }`),
added by `populateRoom` (`src/sim/world.ts`, one line; `sourcesIn` in
`src/sim/powers.ts`), so a kept game built from a save gets it too.
`systems/power-sources.ts` (order 546):

- **Lit** while no entity holds its power taken from it (`c.power.src`) and no
  orb of it lies loose (`c.orb.src`). Dark while someone holds it, lit again
  once it is gone: knocked loose and faded, or the holder left the game.
- **Taken by touch:** a played hero not holding that power (one holding
  another swaps, as at an orb) whose **middle** is
  over the source's tile (`DRAFT:`: the middle, so a hero at the hoard one
  tile west, whose box reaches a pixel into it, does not take it). It gets
  the effect `power` with `src`, and the event `power-taken` with `src`.
- **`world.sources`** (top-level, additive, read with `?? []`): the source ids
  a hero has taken from, never shrinking. The page has it by key with every
  snapshot. Push 5's menu mark reads it.

The one source today is flight's, `depot-strongroom`, at [38, 18] in
`quarry-depot`: the floor of the hidden area `under-the-strongroom`, reached
through the cellar's cracked wall (the shaft's one-way ledges only lead up
out of it: walked into from the strongroom, a hero lands on the shaft's
platform and goes no lower). That is the Step 16
lead's tile (moved by Step 22 from [46, 13], the strongroom floor on the main
way, where every hero crossing picked it up). The source id stays. Every
scenario was swept for `power-*` events after the move: only
`step9-fades-then-source` and `step9-second-power-replaces` take it, and both
walk the cellar route. Drawn as
`power-fixture-shrine` on its tile, with the power's icon floating over it in
the glow when lit, and dimmed and empty when dark (`drawn.powers.sources`).

## Where to go back (push 5; D-082)

The menu's row for a level (`src/client/start.ts`, Step 14's rows) shows one
lit mark per power source found in that level: the power's own icon,
from `world.sources` (`foundSourceIcons` in `draw/powers.ts`, fed through
`main.ts`'s `levels()`). Never a digit, and nothing about a source not yet
found. The row's element carries `data-sources` (the icons) for checks. The
two-connection check stands a page's character on the depot's pedestal (a
page owns its own motion). The server takes it there, the page holds flight
from it, and both pages' worlds list the source. Watched to fail with
`world.sources` never written. Screenshot: `*-6-menu-source-found.png`.

## What a player sees (`src/client/draw/powers.ts`)

One line in `render.ts`, after the bodies. A carrier's orb over its head
(the power's icon at 12 px in `fx-pickup-glow`, bobbing); a loose orb (the
icon in the glow, flickering in its last 1.5 s); a holder glowing (the glow
over the body, added light); the viewer's own power in the party plate's
power slot (`fillHudSlot('power', …)`, `draw/hud.ts`, Step 19's); a short
banner with the power's shown name when the viewer takes one; `fx-pickup-get`,
`fx-power-lost` and `fx-poof` on a take, a loss and a fade, seen by
comparing frames. `window.irreverents.drawn.powers` records `carriers`,
`orbs` and `holders`. The boost's icon is `pickup-bolt`: the star was the
same yellow as the hit star and could not be told apart from it.
Screenshots, 844×390 and 390×664: `docs/plan/step-9-shots/`.

## How a power reaches the holder's phone

Only the effect `{ kind: 'power', power: id | null, src? }`
(`src/sim/effects.ts`) sets or clears `c.power`. A page does not get the
server's `c` for its own character (`docs/mechanisms/network.md`, "Traps"),
and flap is the hero's own motion on the page, so wings would work in a
scenario and not on the phone if the power were only a component. Like
`become`, the page takes the server's copy when the effect arrives and
acknowledges it.

## How it is checked

- `step9-boost-lifts-the-throne`: a grappler holding the boost lifts a throne
  in the throne room. Its control, `-control`, is the same grappler and the
  same press without it, refused as too heavy.
- `step9-boost-breaks-the-wall`: an infiltrator holding the boost strikes a
  heavy dummy (110) into the undercroft's vault wall at about 270 px/s, and
  the wall breaks. In its control (`-control`) the same blow without the
  boost reaches 73 px/s and the wall stands.
- A scenario player may carry `"power": "<id>"` (held from before tick 0)
  and the fact `power` (`src/scenarios/facts/power.ts`) reads what a body
  holds at a tick.
- Watched to fail: with the verbs read site reverted to the plain tuning set,
  both positive scenarios fail and both controls pass.
- `step9-take-from-carrier`: the street's villain laid flat drops an orb, the
  grappler walks into it and holds the boost, the villain is spent until he
  gets up and then carries it again. Watched to fail with boost's
  `carriers` emptied.
- `scripts/checks/step9-powers.ts` (in `npm run check`): a real server and two
  connections. An orb popped at player a's feet in the server's world is
  taken by a. a's own page then holds the power and its own numbers are the
  boost's, and b's page sees it on a. Control inside the check: the server
  writes the power onto b's copy with no effect, a sees it, b's own page
  never does. Watched to fail: with the take writing `c.power` instead of
  sending the effect, a's own page never holds it.
- `step9-hard-hit-knocks-loose`: a quarry heavy's blow on a grappler holding
  the boost: an orb appears, the grappler holds none, walks back into it and
  holds it again. Its control (`-control`, committed): a shopkeeper's swat on
  the same grappler, and the power stays. Watched to fail with
  `powerHardHitSpeed` 900.
- `step9-fades`: the same blow, left alone. The orb fades at 5 s. Watched to
  fail with the boost's `fade` at 20.
- The two-connection check also lands a hard blow on the server (b's hit at
  300 px/s). a's own page then holds none and b sees none on a. Watched to
  fail with the drop clearing `c.power` instead of sending the effect. A
  knock-out (the first try at the check) passed that control too, because a
  `flatten` makes the page take the server's whole copy.
- `step9-wings-reach-the-ledge` and `-infiltrator`: a grappler or an
  infiltrator holding flight walks west on the pit floor, jumps, flaps six
  times and lands on the out-of-reach ledge. Their committed controls
  (`-control`) are the same hero and presses without flight, still on the
  floor. Watched to fail with `verbsOf` ignoring lent verbs.
- `step9-fades-then-source` (the real depot, its people placed): the grappler
  walks over the pedestal and holds flight (dark, found), a heavy knocks it
  loose, the orb fades, and the pedestal is lit again (still found). Watched
  to fail with flight's `fade` at 20.
- The two-connection check also gives a flight, and **a's own page flaps on
  a second Jump press in the air**; the same presses before it held flight
  flapped none (the control). Watched to fail with `verbsOf` ignoring lent
  verbs. **Wings are proven by script only:** no phone page in `npm run e2e`
  takes wings by touch yet. A phone would have to walk past the depot's
  lookout and patrols to the strongroom.
- `npm run e2e`, fact `power-carrier-drawn` (`scripts/e2e/powers.ts`): a phone
  walks by touch into the street and its page draws the villain carrying.
