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
| `flight` | Wings | lends `flap`, at least 6 flaps of 260 | Any hero reaches the quarry pit's out-of-reach ledge from its floor. |

## The overlay, and the four read sites

A held power is `entity.c.power = { id, src? }`. `numbersOf(content, e)` and
`verbsOf(content, e)` (`src/sim/powers.ts`) give a body's numbers and verbs
with it laid over them: first `times`, then `atLeast`. With no power they
return the kind's own tuning set and verb list, the same objects as before
Step 9, so a world with no power in it runs exactly as it did. **Every place
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
  small physics against the room's tiles (`moveOrb` in
  `systems/power-take.ts`, order 545; `powerOrbBounce`, `powerOrbFriction`).
  It is 10 px square (`ORB_SIZE`).
- **An orb** fades after its power's `fade`
  (`power-faded`), and is taken by the first played hero who touches it
  holding no power: the effect `power` and the event `power-taken`. **Nobody
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
- `npm run e2e`, fact `power-carrier-drawn` (`scripts/e2e/powers.ts`): a phone
  walks by touch into the street and its page draws the villain carrying.
