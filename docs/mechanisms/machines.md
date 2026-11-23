# Machines: driving, ramming, wearing to a wreck

**Reference.** Open before touching `content/machines/**`,
`src/content/kinds/machines.ts`, `src/sim/machines.ts`, `src/sim/verbs/drive.ts`,
`src/sim/systems/` files named `machine-*`, the `ram-wagon` character or its
tuning set, `content/rooms/test-machine.json` or `scenarios/step20-*.json`.

## Why it exists

The owner, 2026-11-23, after playing on a phone: "no vehicle hijacking"
(`docs/plan/core-loops.md`, "The owner's verdict"). Library: D-017 ("steal or
hijack vehicles"), D-020 ("heavy collision ... roadblock crashes"), D-022,
D-023 ("hijacking the enemy machine sent to stop the party"). Doc 08,
"Vehicles": "speed, crunch, collision, debris, knockback, breakable
barricades, chains of crashes". O-008 and O-009 (which vehicles, steering,
collision) are OPEN, so every choice here is a `DRAFT:` with a
`docs/decisions-log.md` entry ("Step 20: the machine", "Step 20: the ram").
The plan step is `docs/plan/step-20.md`.

## What landed (Step 20, builder A, push 1: sim only)

Nothing of it is reachable by a player yet: the machine lives only in the
check room `test-machine` until builder B puts it in the Bandit Camp.

| Piece | What it does |
|---|---|
| `content/machines/<id>.json` (`src/content/kinds/machines.ts`) | which character is the machine; top speed driven by a hero (`speed.rider`) and by a person of the world (`speed.driver`); `accel`, `coast`, `brake`; `ramSpeed`; `crashes` to a wreck. The check refuses a `driver` speed at or above the slowest roster hero's `runSpeed` (`INTENT:` people can be outrun) |
| `content/characters/ram-wagon.json` | the body: box 32 by 26 (inside the 32 by 32 limit, an `INTENT:` in `characters.ts`), verbs `drive` and `body`; weight 200, toughness 0 in its tuning set |
| `src/sim/verbs/drive.ts` | the stick builds speed slowly on the ground and the machine nearly holds it when let go (`coast`); held the other way it brakes; a wreck brakes to a stop and never drives again. A player drives at `speed.rider`, a body with `entity.c.input` at `speed.driver`. Runs wherever the body is simulated (a rider's own page, later) |
| `src/sim/machines.ts` | `machineOf`, `machineState`, `crashMachine`, and **`ram()`, the one ram rule** |
| `src/sim/systems/machine-ram.ts` (order 525) | a machine at `ramSpeed` or faster that overlaps a body rams it, once per pass; a wall that stops it dead at that speed, and a barrier it bursts, are crashes too. Each crash is one wear; at `crashes` it is wrecked |
| `world.machines` | by the machine's entity id, `{ wear, wrecked }`; absent until the first crash (read with `machineState`, which defaults) |
| events | `machine-crash` `{ machine, target, speed, player }` (`target` null for a wall or a barrier), `machine-wrecked` `{ machine, player }` |

## The ram rule (`ram()` in `src/sim/machines.ts`)

The mover keeps going; the target is shoved by weight with the same
momentum formula, springiness (`shoveBounce`) and pop (`shovePop`) as a
flying body's shove (`impact-bodies.ts`), and the same helpers: `strike`
(the held beat on the target), `markImpact` on both (shake and dust),
`impact` events on both (so the horn post's rule, `outpost-signaler.ts`,
answers: `other` is the post and `speed` is the closing speed), and `wear`
on the target by speed (a friend is shoved but not worn). The mover is
given back the share of its speed its weight keeps, `ma / (ma + mb)`: a
fighter (40) barely slows the wagon (200), the horn post (1000) nearly
stops it. The mover takes no held beat (`DRAFT:` it rolls on: G-08,
"controls recover").

**Shared on purpose:** Step 18's queued "heavies topple to a big throw or
crash" (`docs/plan/step-18.md`) should call `ram()` rather than write a
second slam rule. Nothing of that slice is built.

## Rules that are deliberate

- **Only a machine at speed rams** (`INTENT:` in `machine-ram.ts`).
  `impact-bodies`' rule that standing bodies pass through each other is
  untouched; a machine under `ramSpeed` passes through people like anyone.
- **It never moves** a placed thing or a captive (kind `~thing`, no box), a
  carried body, a body lying flattened, or one already in a held beat.
- **A barrier needs no new rule.** A `breakable` part opens to any body
  arriving at its `breakSpeed` (`room-breakable.ts`), and the body carries on
  with its speed; the ram system only counts the burst as a crash.
- **A wreck is for good** (`INTENT:` nothing resets): `wrecked` is never
  cleared.
- **Wear is never shown as a number** (D-020; `t-no-numbers`): the look will
  show it (push 3).

## Interactions worth knowing

- A flying body that meets the wagon still shoves it by
  `impact-bodies.ts`' rule (the wagon is a body of weight 200): a heavy
  launched into a rolling wagon can knock it flying, and while flying it
  does not drive or ram. Seen in traces; left as the impact rules make it.
- A body the wagon launches can land ahead of it and be rammed again when
  the wagon catches up (a plough). Each meeting is a crash.
- The test room's barrier adds its part state to every world (as every
  room's working parts do), about 100 bytes in the `together` check's
  snapshot.

## How it is checked

`scenarios/step20-*.json` in `test-machine` (the horn post is a test outpost,
`content/outposts/test-machine.json`, with no callers, placed by
`content/placements/test-machine.json`). Each control was watched to fail
(push 1's commit lists them): `step20-ram-launches-by-weight` (control:
`ramSpeed` 400), `step20-ram-snaps-the-post` (control: `speed.rider` 290),
`step20-barricade-breaks-and-rolls-on` (control: the barrier's `breakSpeed`
400), `step20-wears-to-a-wreck` (control: `crashes` 100).

## Still to come (builder A pushes 2 and 3, then builder B)

The seat (pull the driver out with Grab, GET IN with Use, Jump out, the hero
kept while riding, a hard hit throws the rider), a bandit driving by script,
the look, and the camp.
