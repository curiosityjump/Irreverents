# Machines: driving, ramming, wearing to a wreck

**Reference.** Open before touching `content/machines/**`,
`src/content/kinds/machines.ts`, `src/sim/machines.ts`, `src/sim/verbs/drive.ts`,
`src/sim/systems/` files named `machine-*`, the `ram-wagon` character or its
tuning set, `content/rooms/test-machine.json`, `scenarios/step20-*.json` or
`src/client/draw/machines.ts`.

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

## The seat (Step 20, builder A, push 2)

| Piece | What it does |
|---|---|
| `c.seat` on a standing machine | `{ driver }`: a person's entity id, or null for an empty seat. The server's world sets it the first tick it sees the machine: a person (`c.npc`) standing on it is at the reins. He is out of the seat once held, flying, flattened or gone |
| `src/sim/systems/machine-driven.ts` (605) | keeps the driver in the seat (at the rear, sunk 16 px in: `INTENT:` the 12 px tall infiltrator can Grab him from the ground behind), turns a parked machine the way he faces, and drives by two fixed states: **parked**, or **driving** at a hero he sees (the NPC sight rule), on to where he saw them last, at `speed.driver`. A person's machine rams from `driverRamSpeed` |
| `src/sim/use/get-in.ts` (order 120) | Use reads **Get in** beside a standing machine with an empty seat that is not a wreck (`content/prompts.json`, `get-in`) |
| `src/sim/systems/machine-seat.ts` (120) | **in:** the hero's body becomes the machine (a `become` effect, so their own page drives it with no lag); the standing machine leaves the world while ridden. **Out:** a fresh Jump at any moment, a blow at or above `throwRider` from someone nobody plays (thrown, flying), the wreck, or the rider's body gone or no longer the machine (a reconnect, a kept game loaded). Out, they are the hero they went in as, beside it; the machine stands again where it was, rolling on |
| `World.machines[id]` `rider`, `hero`, `kind`, `at` | while ridden: the rider's entity id, the hero they went in as, the machine's kind, where it last was |
| `memberTaken` (`src/sim/party.ts`) | also counts a rider's hero: nobody can switch into it |
| events | `machine-taken` `{ machine, by, player, hero }`, `machine-left` `{ machine, by, player, how }` (`how`: jumped, thrown, wrecked, gone) |

**Getting a person's machine into a room** (for builder B):
- **Placements:** two entries on the same tile, the machine first:
  `{ "id": "camp-wagon", "character": "ram-wagon", "tile": [c, r] }` and
  `{ "id": "camp-wagon-driver", "character": "outpost-fighter", "npc": "outpost-fighter", "tile": [c, r], "routine": [{ "face": "right" }, { "wait": 10 }] }`.
  The driver's routine `face` is the way the parked wagon stands; he sits at
  its rear, so "facing away" from the camp's entrance means facing east.
  `content/placements/test-machine.json` does exactly this twice.
- **A wave row** (`{ character, npc }`, `src/content/kinds/outposts.ts`)
  cannot put a machine down today: the machine is not a person and has no
  NPC kind. Seating needs only the driver standing on the machine on the
  tick the machine is first seen, so the smallest change is an optional
  field on a wave person, e.g. `{ "character": "outpost-fighter", "npc":
  "outpost-fighter", "rides": "ram-wagon" }`, with the waves system adding
  a machine body of that kind under the person at the entry. That file is
  the waves slice's, so it was not changed here.

**Rules that are deliberate (the seat):** there is always a way out
(`INTENT:` in `machine-seat.ts`): Jump is never refused while riding, a
wreck puts its rider out, and a rider whose body left the world never leaves
the machine missing. The seat is the server's alone (`isPageWorld`): getting
in and out reach the rider's page as `become` effects, so getting out waits
one round trip (`DRAFT:`). A friend's blow never throws a friend out.

**Kept games and reconnects.** A standing machine is a body nobody plays and
is saved; a ridden one is the player's body and is not. `World.machines`
is saved with its `rider`, so a loaded game (or a rider removed after they
left) has the machine stand again on the first tick at `at`, still, with
nobody in it. Proven by `scripts/checks/step20-machine.ts`.

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
600, above the top speed), `step20-wears-to-a-wreck` (control: `crashes`
100). Push 3 re-timed these and `step20-jump-out-at-speed` for 560 px/s,
`accel` 300 and 16 crashes, and watched each control fail again. Push 2:
`step20-pull-driver-get-in-grappler` and `-infiltrator` (control: the grab
and throw left out), `step20-jump-out-at-speed` (control: no Jump),
`step20-hit-throws-rider` (control: `throwRider` 13000) with its companion
`step20-light-hit-keeps-rider`, `step20-seat-keeps-hero` (control: the
`World.machines` read out of `memberTaken`), `step20-driven-is-outrun`
(control: `speed.driver` 120 with the content floor lifted), and the
real-server check `step20-machine` (controls: the machine not stood again
for a rider gone; an effect sent to the rider while driving).

## The look (Step 20, builder A, push 3)

| Piece | What it does |
|---|---|
| `look` in `content/machines/<id>.json` | the stem of the machine's cells in `content/looks/` (`ride-wagon`); the check refuses a stem with no `-idle` cell. Left out: the plain box |
| `src/client/draw/machines.ts` | `drawMachineBody`, asked first by `draw/entities.ts` for every body: `-wrecked` once worn through; `-crash` for 15 ticks after any `c.impact` (a ram, a wall, a blow), jolted back a pixel for 4; `-moving` (2 frames) while rolling; `-empty` for a standing machine whose `c.seat.driver` is null, falling back to `-idle` until that cell is cut; else `-idle`. Bottom-centred on the box (the 48 by 44 cell over the 32 by 26 box), mirrored when facing left (the cells face right). `drawnMachines()` is what the last frame drew |
| the seated driver | a person at the reins of a machine drawn from its cells is not drawn, nor his shadow: the cells' baked rider stands for him (`seatedInDrawnMachine`) |
| a rider | their body is the machine's kind, so it is drawn by the same cells, with the player's own mark over it as for any player |
| the plate (`draw/hud.ts`) | a rider's own face is the hero they went in as (`World.machines[..].hero`), and that hero is not listed again among the others |

**Stand-ins, `DRAFT:`** (`docs/decisions-log.md`, "Step 20: the look"): the
baked goggled rider reads as whoever drives, bandit or hero; an empty wagon
shows a rider too until `ride-wagon-empty` (asked of the art builder) is cut;
wear shows only as the wreck, never a number. Shots of each:
`docs/plan/step-20-shots/`.

## In the Bandit Camp (Step 20, builder B, push 2)

`camp-wagon` (`content/placements/outpost.json`) stands **empty on the entry
step** (columns 5-7), facing east: the first thing in view from the doorway;
climbing the stair (4,9) onto the step, Use reads **Get in**. Driven east it
drops off the step and ploughs the camp (`docs/mechanisms/outposts.md`,
"Step 20: the camp's run"). `DRAFT:` (decisions-log "Step 20: the wagon in the
camp stands empty"): no driver, because a seated camp fighter turned seven
camp fights (below). Checked by `step20-camp-hijack-and-crash` (grappler) and
`step20-camp-solo-infiltrator` (control: the barricade at 600 holds),
`scripts/checks/step20-camp.ts` (two connections; a kept game reloads with the
barricade broken; controls: barricade 600, the store emptied before the
restart), and e2e `machine-*` (`scripts/e2e/machine.ts`; control
`E2E_TOUCH_BREAK=interact`).

**Measured with a driver seated in the camp (not shipped):** `outpost-fight`
still runs a person at the reins: he swings from the seat (his blow hits his
own wagon), and turning him to face a hero turns the parked wagon
(`machine-driven`: `if (m.vx === 0) m.facing = d.facing`). One line in
`outpost-fight` (skip a person who is some machine's `c.seat.driver`) mended
two of the scenarios it broke; asked of the orchestrator, since push 3's
driven wave wagon needs it too.

**A run from the step, as measured:** lookout and fighter 1 launched, the
the light barrier (by the wagon or a fighter it flung), both stalls, the
barricade (at about 470 when a flung fighter knocked the wagon off its
wheels; at 560 since weapons push 2 moved the camp's people), rolling on
into the cache. The run is chaotic: every change to the camp's people
re-times `step20-camp-hijack-and-crash` and `-solo-infiltrator`. The horn post only snaps on the way
back west (closing speed 450; met at about 456 after the run, which is also
the sixteenth crash: the wreck puts the rider out on foot). Jump in the
cache, still rolling, puts a hero out standing (`step20-camp-solo-infiltrator`).

## Still to come (builder B)

Push 3, a wave's wagon with a bandit at the reins: `handoff-prompts/loop-vehicles-b.md`.
