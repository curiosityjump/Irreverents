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
choice in it, is Step 2's (`docs/plan-archive.md` ("Step 2")); the choices are
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
  So a person's blow (Step 18: guards and shopkeepers in a fight,
  `docs/mechanisms/npc-response.md`, "Who fights") lands at full share:
  the friend rule is player on player only (`attack.ts:139`).
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
  there, fresh, except as "Beaten for good" below says (a bad guy can be
  defeated; a good person stays down `knockedOutTime`). Things with
  toughness 0 (crates) are never flattened.
- Breaking free hops the body up (`breakFreeHop`); because a held body
  ran no verbs, the same press usually also counts as a jump on the
  next tick. Left in: it reads as jumping out of the hands.
- A carried body wider than its carrier can overlap a wall while it is
  carried (it is not collided); when let go there, physics pushes it
  back out sideways. Not yet handled: letting go under a low ceiling
  with no free spot leaves the body where it is.

## Beaten for good (Step 5, the owner's report, 2026-11-24)

The owner, playing: "enemies collapse but never die". `src/sim/beaten.ts`
(the shared rules and records) and three systems:

- **`beaten-mark` (530)**: a `bad` person (a body nobody plays with
  `c.npc` whose `content/npcs/` kind is `side: "bad"` and does not say
  `"beaten": false`) is **defeated** when the players have knocked him
  out his kind's `beaten.after` times (else `world.beatenAfter`, 3; the
  count is `c.knocks`, hidden), or at once by an impact (wall, floor or
  body) at his `beaten.slam` speed or more (else `world.beatenSlam`,
  400 px/s: a grappler's throw into a wall or into another body).
  Only a knock-out or a flight credited to a player's character counts
  (`by` is one). A slam on a standing body lays it flat with one
  `flattened`, so the Hall counts it once. Emits `defeated`, credits the
  player on the bodiless `~defeats` record. A `good` person knocked out
  stays down his kind's `knockedOut` seconds, else `world.knockedOutTime`
  (3 s, as `flattenTime`: longer for guards turns
  `step18-jump-over-is-a-way-out` and `step4-tier-cap-holds` red). The
  shopkeeper says 10 (D-064: knocked out before she reports, the shop is
  yours: `step5-shopkeeper-robbed`).
- **`beaten-gone` (535)**: a defeated body (`c.beaten`) never gets up; it
  lies `beatenLieTime` once it has stopped flying, drops what it carries
  and any weapon still in hand (Step 23's `knockLoose`; being laid flat
  usually knocked it loose already),
  is removed, and `defeated-gone` (its middle) is emitted. A placed one
  leaves a bodiless `~beaten:<id>` record (`c.beatenGone`); a wave's or a
  dispatch row's arrival leaves nothing.
- **`beaten-return` (9)**: a record's person is put back at his
  placement, fresh, once no player has been in his room `beatenReturnTime`
  (90 s) in a row. Never while anyone is there. A kept game's load places
  every placement again; the record then just goes. A room a stage holds
  (`holdReturns(world, rooms, on)`, kept on `~defeats`) brings nobody back.
- **For Step 22**: `defeatsBy(world, player)`, `restorePeople(world,
  content, room?)` and `holdReturns(world, rooms, on)`.
- **Drawing** (`src/client/draw/beaten.ts`): the cut `fx-poof` where he
  lay, on `defeated-gone`; `fx-dizzy` over a standing bad guy one
  knock-out from defeat (`oneMoreDefeats`). No number, no bar.
  `drawn.beaten` records poofs, gone ids and dazed ids.
- Who is excluded: the villain (`"beaten": false`: he carries the power
  and loops his robbery), cantina regulars (no `c.npc`), heroes, things.
- Signal: scenarios `step5-fighter-beaten`, `step5-fighter-two-knocks-gets-up`,
  `step5-slam-defeats`, `step5-beaten-come-back`, `step5-shopkeeper-robbed`; e2e `beaten-gone`
  (`scripts/e2e/beaten.ts`).

## The suplex (Step 25, 2026-11-24)

D-020 names suplexes first. `docs/plan/step-25.md` holds the why and the
`DRAFT:` choices; `docs/decisions-log.md`, "Step 25: the suplex", what the
builder chose.

- **The press.** While a played hero whose verbs include `suplex` holds a
  body whose toughness is above 0 (never a crate), the Use arbiter's last
  entry, `src/sim/use/suplex.ts` (order 300), answers `suplex`, and the
  button says SUPLEX (`content/prompts.json`). It finds the body by its
  `heldBy`, never by `c.carrying`: a page never gets its own character's
  `c`, but it sees who holds whom. `systems/suplex-press.ts` (order 58)
  notes a fresh Use press with that answer in `c.suplex.pressed`.
  `INTENT:` it asks before npc-interact (60), recruit-free (61) and
  weapon-take (62) spend the press; asked later, one press beside the
  shop's goods took the goods and suplexed.
- **The heave.** `verbs/suplex.ts` (order 45, inside `verbs` at 100)
  starts it: `c.suplex` keeps `target`, `left` (ticks, from `suplexTime`),
  `dir` (the way the carrier faced) and `at` (the press tick). The body is
  still held the whole time, so carry-ride (600) keeps it overhead and
  carry-hold (200) keeps the way out. `INTENT:` a heave whose body is no
  longer in these hands (broke free with Jump, let go, thrown with Hit, set
  down with Grab) is lost, and so is one whose carrier could not act (a
  verb that did not run last tick), like a cut-off swing. The carrier can
  still walk during it (`DRAFT:`).
- **The slam**, all in the verb so this tick's beaten-mark (530) and
  npc-witness (600) see it: the body is released just behind the carrier
  on the carrier's floor (against a wall: half under, then at the feet),
  launched with a held beat for `suplexSpeed` and a floor bounce after it,
  `markImpact`, then the events `suplexed` and `impact` (`other` null, speed
  `suplexSpeed`), and wear `suplexWear` (a friend's share by `friendly()`,
  `friendThrowWear` 0, or `c.brawl`'s). Recorded here because the floor's
  own test never gets there: a fall is capped at `maxFallSpeed` 360, under
  the slam sound's 420 and `beatenSlam` 400. `c.suplex.slam` is the tick.
- **The splash.** Every other body in the room within `suplexSplashReach`
  pixels of the slammed body's box (not held, not flattened) is launched
  away from the landing by `suplexSplashStrength` over its weight (capped),
  with an `impact` (`other`: the slammed body), a hit's beat and
  `impactWear`. A friend gets `friendAttackLaunch` (0). The splash is judged
  like any impact: a bad guy knocked away at his slam speed is defeated
  (`DRAFT:`). From there impact-bodies and impact-walls carry it on.
- **A person's reaction** is the deed `hit`, by one row in
  `content/rules/expectations.json` (`suplexed`). The `hit` event is not
  emitted: seven systems read it, and the slam reaches them as `flattened`,
  `impact` and `defeated`, as a throw's does.
- **Numbers** (`content/tuning.json`, each hero's set; declared by the verb):

  | | grappler | brawler | infiltrator, flyer, skirmisher |
  |---|---|---|---|
  | `suplexTime` | 0.3 | 0.35 | 0.25 |
  | `suplexSpeed` | 500 | 460 | 300 |
  | `suplexWear` | 100 | 100 | 100 |
  | `suplexSplashReach` | 28 | 24 | 12 |
  | `suplexSplashStrength` | 16000 | 14000 | each one's `attackStrength` |

- **Checked by** `scenarios/step25-suplex-*.json` (gate A): `-defeats`,
  `-light`, `-throw-stays` (+ `-control`), `-not-a-crate` (+ `-control`),
  `-splash`, `-witness`, `-friend` and `-friend-breaks-free`.

## Movement feel (Step 2, 2026-11-23)

Numbers are each character's (with any held power laid over them, Step 9:
`numbersOf`, `docs/mechanisms/powers.md`), declared by `verbs/jump.ts` and read by
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

- **The check:** fourteen facts inside `npm run e2e`, named `t-*` (what
  a touch did on its own page) and `s-*` (what the second screen drew),
  in `scripts/lib/e2e-touch.ts`: two phone-sized pages, touch only, in
  a private world, in whatever room players start in, read from what
  each page drew. `E2E_TOUCH_BREAK=<action>` takes that button off the
  page and is every fact's control (watched: jump, switch, attack,
  grab). They failed until Step 1's 2a7fd98 (the server keeping its own
  `entity.c` for a player); before it no hit, grab or throw worked on
  the real page.
- **No number over a hit** (`t-no-numbers`, Step 2's signal 6): across
  that whole fight, on both pages, no string the page drew into the game
  picture (`drawn.words`, see `docs/mechanisms/rendering-actors.md`,
  "Text") holds a digit. The HTML around the picture (tuning panel,
  start screen, shell) is not read: it shows numbers on purpose. Control:
  `E2E_TOUCH_BREAK=number-over-hit` draws "12" over any knocked body.
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
