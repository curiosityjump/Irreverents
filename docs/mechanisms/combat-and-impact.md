# Combat and impact: hitting, carrying, throwing, the held beat

**Reference.** Open before touching `src/sim/body-state.ts`, the verbs
`attack`, `grab`, `body`, the systems named `combat-*`, `carry-*`,
`impact-*`, `src/client/draw/impact.ts`, or any weight, strength or
toughness number.

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
| | `verbs/attack.ts` | a fresh press: hits what is in front, or throws what is carried |
| | `verbs/grab.ts` | a fresh press: picks up the nearest liftable body, or sets the carried one down |
| 200 | `systems/carry-hold.ts` | drops a carried body whose carrier can no longer hold it; break-free; lets a held player go |
| 450 | `systems/impact-before.ts` | friction and air drag; remembers each flying body's speed |
| 500 | `systems/physics.ts` | skips carried bodies and bodies in a beat (`takesNoPhysics`) |
| 510 | `systems/impact-walls.ts` | wall, floor and ceiling impacts, from what physics took away |
| 520 | `systems/impact-bodies.ts` | a flying body shoves a body it meets, by weight |
| 530 | `systems/combat-rest.ts` | a flight ends on the ground below `restSpeed` (`footingSpeed` for a body that can run) |
| 600 | `systems/carry-ride.ts` | puts every carried body above its carrier's head |

`src/sim/body-state.ts` holds the shared rules (`canAct`, `launch`,
`wear`, `release`, `throwCarried`, `bodyNumbers`) and declares the state
and the events. It is not in a registry directory because it is a helper.

## State (all in `entity.c`, so every device and every scenario sees it)

`flying` (who started it, whom it already met), `held` (by whom, ticks
left for a player), `carrying` (whom), `beat` (ticks left), `worn`
(wear taken so far), `flattened` (ticks left), `impact` (where, how
hard, which tick: the only thing drawing reads for shake and dust),
plus `attack` and `grab` (fresh-press trackers). The fields other steps
may read are listed in `docs/architecture.md`, "Bodies".

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
- **A kind with no `weight` or `toughness`** (an NPC kind with
  `"verbs": []`, or `hero`) gets `defaultWeight` and
  `defaultToughness`, so anything can be hit, grabbed and thrown.

## Choices that are provisional (`DRAFT:` at each site)

- No chains of holds: a carried body runs no verbs, so it cannot grab,
  and a body that is picked up or knocked flying drops what it carried.
- A forward or downward throw leaves from in front of the carrier at
  chest height (so it meets a body standing there); an upward throw
  leaves from overhead. `release()` falls back to overhead, then the
  carrier's feet, when the spot is inside a wall.
- A hit lands on the tick of the press; stick up makes it a launcher.
- A flattened body lies where it fell for `flattenTime` and gets up
  there, fresh. Things with toughness 0 (crates) are never flattened.
- Breaking free hops the body up (`breakFreeHop`); because a held body
  ran no verbs, the same press usually also counts as a jump on the
  next tick. Left in: it reads as jumping out of the hands.
- A carried body wider than its carrier can overlap a wall while it is
  carried (it is not collided); when let go there, physics pushes it
  back out sideways. Not yet handled: letting go under a low ceiling
  with no free spot leaves the body where it is.

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

Sixteen scenarios, `scenarios/step2-hit-*.json`, in room `test-hit`.
Each has a control that was watched to fail, most by changing one
number in `content/tuning.json` (for example `bodyImpactOn` 0,
`beatTime` 0, `breakFreeOn` 0). The screen side (dust, shake, the
flattened pose) is not covered by any script: it was looked at once in a
headless browser, and how it feels is the owner's to judge.
