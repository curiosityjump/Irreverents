# Combat and impact: hitting, carrying, throwing, the held beat

**Reference.** Open before touching `src/sim/body-state.ts`, the verbs
`attack`, `grab`, `body`, the systems named `combat-*`, `carry-*`,
`impact-*`, `body-stun`, `src/client/draw/impact.ts`, any weight,
strength or toughness number, or the movement feel numbers that
`verbs/jump.ts` declares for physics (`apex*`, `fall*`).

## Why it exists

The owner's standard for the game is the "OHHHHH" of physical impact
(`docs/vision.md`; library D-020: "suplexes, launches, heavy collision,
knockback into walls/other enemies"). So a hit or a throw is never a
number on screen: it is a body that flies, slams into a wall or another
body, holds still for a beat, and moves on. What was built, and every
choice in it, is Step 2's (`docs/plan/step-2.md`); the choices are
`DRAFT:` and each is in `docs/decisions-log.md`.

## The pieces, in the order a tick runs them

| Order | File | What it does |
|---|---|---|
| 50 | `systems/combat-clock.ts` | counts down the held beat and being flattened; ends a flight that has lasted `flyMaxTime` |
| 100 | `systems/verbs.ts` | runs each body's verbs, **unless `canAct` is false** (flying, held, in a beat, flattened) |
| | `verbs/body.ts` | does nothing; declares `weight`, `toughness` per kind |
| | `verbs/attack.ts` | a fresh press: a swing in three phases (wind-up, strike, recovery) that hits what is in reach during the strike, once each; or, while carrying, an immediate throw |
| | `verbs/grab.ts` | a fresh press: picks up the nearest liftable body, or sets the carried one down |
| 200 | `systems/carry-hold.ts` | drops a carried body whose carrier can no longer hold it; break-free; lets a held player go |
| 450 | `systems/impact-before.ts` | friction and air drag; remembers each flying body's speed |
| 500 | `systems/physics.ts` | skips carried bodies and bodies in a beat (`takesNoPhysics`); a body moving itself falls by its own character's arc (below) |
| 510 | `systems/impact-walls.ts` | wall, floor and ceiling impacts, from what physics took away |
| 520 | `systems/impact-bodies.ts` | a flying body shoves a body it meets, by weight |
| 530 | `systems/combat-rest.ts` | a flight ends on the ground below `restSpeed` (`footingSpeed` for a body that can run) |
| 600 | `systems/carry-ride.ts` | puts every carried body above its carrier's head |
| 990 | `systems/body-stun.ts` | last: writes `c.stunned` from the combat state, for drawing |

`src/sim/body-state.ts` holds the shared rules (`canAct`, `launch`,
`wear`, `release`, `throwCarried`, `bodyNumbers`) and declares the state
and the events. It is not in a registry directory because it is a helper.

## Everything that moves a body is an effect

A launch, a hold, a release, a knock-out and the speed a body leaves a
held beat with all go through `emitEffect` (`src/sim/effects.ts`,
`docs/architecture.md`, "Effects on a player"), for every body, player or
not, so a player's own device receives them. This slice added two things
there, both additive: `push` may carry `fly` (the body is now "flying"
and cannot act), and the kind `flatten`. The held beat is a `push` of
zero when the impact happens and a `push` of the real speed when the
beat ends (`strike` in `body-state.ts`, `combat-clock.ts`). Only two
things are still written directly: a carried body's position each tick
(`carry-ride.ts`, as the contract says), and `onGround`.

## State (all in `entity.c`, so every device and every scenario sees it)

`flying` (who started it, whom it already met), `held` (ticks left for a
player; who holds is `heldBy(entity)`, Step 1's single copy), `carrying` (whom), `beat` (ticks left), `worn`
(wear taken so far), `flattened` (ticks left), `impact` (where, how
hard, which tick: the only thing drawing reads for shake and dust),
plus `attack` and `grab` (fresh-press trackers). The fields other steps
may read are listed in `docs/architecture.md`, "Bodies".

**For drawing (Step 2 feel, 2026-11-23; the list Step 8's renderer asked
for in `docs/mechanisms/rendering-actors.md`, "Flags for the lead").**
All additive and read-only for anyone but their writer:

| Field | Written by | Says |
|---|---|---|
| `c.attack.phase`, `c.attack.left` | `verbs/attack.ts` | `ready`, `windup`, `strike` or `recover`, and ticks left in it (this one included). Absent on an old body: read as `ready` |
| `c.attack.swung` | `verbs/attack.ts` | the tick the **strike** began (it used to be the press; with a wind-up it is now `attackWindup` later) |
| `c.lastHit` | `verbs/attack.ts` | `{ tick, by }`: the last hit of an attack this body took |
| `c.landing` | `systems/physics.ts` | `{ tick, speed }`: the last touch-down, and how fast it was falling |
| `c.airborne` | `systems/physics.ts` | `{ since }`: present while off the ground, the tick it left it (jump, fall or launch) |
| `c.grab.at` | `verbs/grab.ts` | the tick of the last pick-up |
| `c.lastThrow` | `body-state.ts` `throwCarried` | `{ tick, target }`: the last throw |
| `c.flap.at` | `verbs/flap.ts` | the tick of the last flap |
| `c.stunned` | `systems/body-stun.ts` | `{ why }`: present exactly while in a held beat, flying or flattened (`why` the first of those); `stunnedWhy(e)` gives the same now |

Not done (network layer, `docs/for-the-lead.md`): a player's own page
has no `c.carrying` for its own character, because the grab runs on
the server.

## Rules that are deliberate

- **A body that cannot act runs no verb at all** (`verbs.ts`), instead
  of each verb testing for it: `move` would otherwise pull a knockback
  back to the stick's speed in a few ticks, and a verb added later
  would forget the test.
- **There is always a way out of a hold and of a flight** (`INTENT:` in
  `carry-hold.ts` and `combat-clock.ts`; `docs/deliberate-designs.md`):
  a held body breaks free with a fresh press of `jump`, a held player
  is let go after `holdPlayerTime`, and no flight keeps a body from
  acting longer than `flyMaxTime`.
- **Grab needs a fresh press** (`INTENT:` in `grab.ts`), so a carrier
  holding the button down does not re-grab a friend who broke free.
- **One impact per stop, one per pair per flight** (`INTENT:` in
  `impact-walls.ts`, `impact-bodies.ts`): physics leaves a speed at
  exactly 0 only on the tick it stopped the body, and `flying.met`
  lists whom a flight has already struck. The thrower is put in `met`,
  so a thrown body never "meets" the one who threw it.
- **The held beat freezes only the bodies of the impact**, inside the
  simulation: two players share the world, and scenarios read it.
- **Every launch speed is capped by `maxLaunchSpeed`** (range tops out
  at 900): physics looks one 16 px tile ahead and does not cap rising
  speed.
- **Friction and air drag touch only a body that was launched or lies
  flattened** (`INTENT:` in `impact-before.ts`). A body nobody launched
  keeps whatever speed it has, as before Step 2: Step 3's scenario
  `step3-guard-follows` gives a body a starting speed and relies on it.
  When a flight ends, a body that cannot run is stopped dead.
- **"Friend" means player on player**, never "is it an NPC kind": a
  body nobody plays that attacks a player launches and wears them.
  **In the cantina's brawl** (Step 11) the struck player's `c.brawl`
  shares are read first at the three friend sites (`attack.ts`,
  `impact-walls.ts`, `impact-bodies.ts`), so friends launch and hurt each
  other there; `c.brawl` exists only in a brawl (`docs/mechanisms/cantina.md`).
- **A kind with no `weight` or `toughness`** (an NPC kind with
  `"verbs": []`, or `hero`) gets `defaultWeight` and
  `defaultToughness`, so anything can be hit, grabbed and thrown.

## Choices that are provisional (`DRAFT:` at each site)

- A switch drops what is carried (the new body may be too weak for it);
  it falls from overhead where the carrier stands.
- No chains of holds: a carried body runs no verbs, so it cannot grab,
  and a body that is picked up or knocked flying drops what it carried.
- A forward or downward throw leaves from in front of the carrier at
  chest height (so it meets a body standing there); an upward throw
  leaves from overhead. `release()` falls back to overhead, then the
  carrier's feet, when the spot is inside a wall.
- A swing has a wind-up (`attackWindup`), a strike (`attackStrikeTime`,
  every body that is in reach on any of its ticks is hit once) and a
  recovery (`attackRecovery`); the next press counts once the swing is
  over and `attackTime` has passed since the last press. Stick up **when
  the strike starts** makes it a launcher. A swing cut off by being
  knocked flying, held or flattened is lost. A throw while carrying has
  no wind-up: it reads as letting go.
- The held beat scales with how hard the impact was: from `hitBeatTime`
  (softest hit) to `hitBeatMaxTime` (a hit launching at
  `maxLaunchSpeed`), and from `beatTime` to `beatMaxTime` for walls,
  floors, ceilings and bodies (`beatTicks` in `body-state.ts`). Max equal
  to min gives the old fixed beat.
- A flying body that hits the floor at `floorBounceSpeed` or faster
  bounces up with `floorBounce` of its falling speed, so each bounce is
  lower until it lands too slowly and the flight ends as before.
- A flattened body lies where it fell for `flattenTime` and gets up
  there, fresh. Things with toughness 0 (crates) are never flattened.
- Breaking free hops the body up (`breakFreeHop`); because a held body
  ran no verbs, the same press usually also counts as a jump on the
  next tick. Left in: it reads as jumping out of the hands.
- A carried body wider than its carrier can overlap a wall while it is
  carried (it is not collided); when let go there, physics pushes it
  back out sideways. Not yet handled: letting go under a low ceiling
  with no free spot leaves the body where it is.

## Movement feel (Step 2, 2026-11-23)

Numbers are each character's, declared by `verbs/jump.ts` and read by
physics (a per-character number must be declared by one of that
character's verbs). They shape only a body moving itself: a body knocked
flying or flattened, and any kind without them, falls by `world.gravity`
and `world.maxFallSpeed`.

- `apexSpeed`, `apexGravity`: while slower than `apexSpeed` up or down in
  the air, gravity is `apexGravity` × the world's (a hang at the top).
- `fallGravity`: gravity while falling past that, × the world's.
- `fallSpeed`: the character's own fall cap (under 960, as every speed).
- All three multipliers 1 and `fallSpeed` = `world.maxFallSpeed` is the
  plain arc of before; the `hero` (Step 1's test body) keeps exactly that,
  because other steps' scenarios time the hero's jumps to the tick.

The three, as set (`DRAFT:` in `content/tuning.json`): the infiltrator
is at full speed 3 ticks after the press and stops in 3, hangs a little
and falls a little faster (weight 26, the lightest); the flyer floats
(fall gravity 0.6, fall cap 170, the longest hang); the grappler slides
for 6 ticks, falls hardest (1.5, cap 420), winds up longest (0.1 s) and
weighs 60. The grappler's ground start and stop were left as they were:
Step 3's and Step 4's scenarios walk it to doors to the tick. Jump
heights were left within 3 px of each other: Step 3's routes depend on
them. The margins are the `proves` of `step2-feel-start-stop`,
`-three-in-the-air` and `-weight-order`.

## Adding to it

- **A throwable or hittable thing:** a character kind
  (`content/characters/<id>.json`) listing the verb `body`, with
  `weight` and `toughness` in its tuning set, then a line in a
  placements file. No code.
- **A character that can hit or lift:** list `attack` and/or `grab`
  (and `body`) in its `verbs`, add their numbers to its tuning set.
  `npm run check` names any number missing.
- **A new reaction to a hit** (Step 4): read the events of
  `docs/architecture.md`, "Bodies"; never move a body yourself.

## How it is checked

Twenty-one scenarios, `scenarios/step2-hit-*.json`, in room `test-hit`
(re-timed 2026-11-23 for the wind-up and the scaled beat), and twelve
`scenarios/step2-feel-*.json` for the feel: start and stop, tap against
held jump, coyote time given and refused, jump buffer kept and
forgotten, apex hang, the three in the air, the wind-up order, a harder
hit's longer beat, the floor bounce, and the three weights. Each was
watched to fail with one number changed (listed in the commit).
Each has a control that was watched to fail, most by changing one
number in `content/tuning.json` (for example `bodyImpactOn` 0,
`beatTime` 0, `breakFreeOn` 0). The screen side (dust, shake, the
flattened pose) is not covered by any script: it was looked at once in a
headless browser, and how it feels is the owner's to judge.

## Across two phones (measured 2026-11-23)

- **The check:** thirteen facts inside `npm run e2e`, named `t-*` (what
  a touch did on its own page) and `s-*` (what the second screen drew),
  in `scripts/lib/e2e-touch.ts`: two phone-sized pages, touch only, in
  a private world, in whatever room players start in, read from what
  each page drew. `E2E_TOUCH_BREAK=<action>` takes that button off the
  page and is every fact's control (watched: jump, switch, attack,
  grab). They failed until Step 1's 2a7fd98 (the server keeping its own
  `entity.c` for a player); before it no hit, grab or throw worked on
  the real page.
- **Proven, by touch and on both screens:** grab a crate, carry it,
  throw it; hit a body away; switch hero; grab a friend, who is drawn
  held on their own screen, breaks free with Jump, is thrown and sees
  their own character fly, then walks again.
- **Not proven:** a real iPhone or Safari; the live address; anything
  about the freeze, dust or shake; hitting a dummy (the start room has
  none, so a crate is hit). **Known gap, printed as `todo` and not
  counted:** a switch can land on a member another player holds
  (`t-switch-free`; `docs/mechanisms/network.md`, "Known limits"). A
  friend thrown at a walk door leaves the room, and the thrower's
  screen stops drawing them at once: the check throws toward a wall.
