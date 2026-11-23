# The party, switching and the three bodies

**Reference.** Open before touching `content/party.json`,
`src/sim/party.ts`, `src/sim/verbs/switch.ts`, `src/sim/verbs/flap.ts`,
the three member characters, or how a new player is given a character.

## Why it exists

The library's confirmed rules (doc 05, D-012, D-013): one shared party;
"A character cannot be controlled by two humans at once. Unoccupied
members are candidates for switching"; no "involuntary takeovers" (doc
06). Everything else here is `DRAFT:` and decided in
`docs/plan-archive.md` ("Step 2"), "Decided by the lead": three placeholder members
(`grappler`, `infiltrator`, `flyer`; the id is the function so names and
art can change), switching in place, and what only each can do.

## The pieces

- **`content/party.json`**: `members`, character kind ids in party
  order. That order is the order new players are seated and the order
  `switch` cycles. Checked against `content.characters`; an empty list or
  a repeated id is refused.
- **`src/sim/party.ts`** (a helper, outside the self-registering
  directories): `memberTaken(world, member, exceptEntity?)`,
  `firstFreeMember(world, content)`, `boxInSolid(room, x, y, w, h)`.
  "Taken" means some player entity anywhere in the world has that kind.
- **Seating a new player:** `spawnPlayer` with no `character` uses
  `firstFreeMember`: the first member in party order nobody is playing;
  when all are taken, the first member again (a fourth friend gets a
  second copy, never a refusal). This is the one chooser: Step 1's join
  calls it and must not write another. A caller that names a character
  still gets exactly that one (`hero` and the scenarios do).
- **`switch`** (`content/actions/switch.json`, `verbs/switch.ts`, order
  5): on a fresh press the entity's `kind` becomes the next member in
  party order that (a) no other player is playing and (b) fits where the
  entity stands. The entity id never changes; facts and other systems
  find a player by `entity.player`. Unplayed members are not in the
  world.
- **`flap`** (`verbs/flap.ts`, order 15, listed only by the flyer): a
  fresh press of `jump` in the air sets an upward speed (`flapSpeed`), at
  most `flaps` times per time off the ground.
- **The infiltrator's move is its box** (10×12): it passes a 16 px gap
  the others (20 and 30 px tall) are stopped by. Keep it at most 14 px
  tall. Step 3's rooms rely on this.

## Rules that are deliberate

- **A switch that would put the body inside solid tiles is refused**
  (`INTENT:` in `switch.ts`; `docs/deliberate-designs.md`). The next
  member is tried; if none fits, `switch-refused` with reason `no-fit`
  and nothing changes. This is "there is always a way out": the
  infiltrator inside a crawlspace stays the infiltrator.
- **A switch never lands on a member another player is playing and never
  changes another player's entity.** With every other member taken it is
  refused with reason `none-free`.
- **Feet and middle stay put across a switch**: `x += (oldW - newW) / 2`,
  `y += oldH - newH`, because physics measures from the top-left.
  `DRAFT:` a wider body next to a wall is slid sideways, nearest fit
  first, by at most its extra half-width, so standing against a wall
  does not block a switch.
- **One press is a take-off or a flap, never both.** `flap` runs before
  `jump` and stands aside when the body is on the ground or `jump`'s
  coyote time has two or more ticks left (that is exactly when `jump`,
  later in the same tick, takes the press). It keeps its own "was held"
  because `jump` overwrites its own at the end of its update. If you
  reorder either verb or change how coyote time counts, re-run
  `step2-body-flyer-reaches-ledge` and `step2-body-flyer-coyote-jump-not-flap`.
- **Becoming the flyer in mid-air gives no flaps until landing**
  (`DRAFT:`). `flap` notices it did not run for this entity last tick
  (`c.flap.tick`) and starts it spent. Without this, cycling `switch` in
  the air refills the flaps and is endless flight.
- **A switch drops the old body's half-finished jump** (`c.jump.buffer`
  to 0, `cut` to true): no buffered press or jump-cut carries over.

## Events

| Event | Fields | Means |
|---|---|---|
| `switched` | `entity`, `player`, `from`, `to` | the player's entity changed kind from `from` to `to` |
| `switch-refused` | `entity`, `player`, `reason` (`no-fit` or `none-free`) | switch pressed, nothing changed |
| `flapped` | `entity`, `player`, `left` | a flap; `left` flaps remain before landing |

## What is not built, and known gaps

- Swapping with a member a friend is playing; unplayed members standing
  in the world or following; a party screen (library: open or
  unapproved).
- `DRAFT:` a held or carried player may not switch or flap: both verbs
  ignore the press while `heldBy(entity)` (`src/sim/effects.ts`, Step
  1's effects) names a holder. They do not yet ask whether the player
  is flattened: the hit's "may this player act" helper did not exist
  when this landed; when it does, use it in place of `heldBy` here.
- Carrying something while switching to a member too weak to lift it is
  not handled here.
- With every member taken (three players), nobody can switch; and a
  player who crawled somewhere as the infiltrator, switched, and then
  had the infiltrator taken by a friend can only leave once it is free
  again. Flagged to the lead for Step 3's rooms.

## Checks

`scenarios/step2-body-*.json`, all tagged gate A, in room `test-body` (a
crawlspace at columns 5-7 of row 9, a ledge 5 tiles up at columns
15-18). Each names its control in the commit that added it (792b0aa,
75da7ee). Against the feedback signals of `docs/plan-archive.md` ("Step 2"):

**Signal 3** (one thing each character can do that the other two cannot):

- The infiltrator: `step2-body-infiltrator-fits-gap` passes;
  `step2-body-grappler-stopped-by-gap` and
  `step2-body-flyer-stopped-by-gap` show the other two stopped by the
  same inputs.
- The flyer: `step2-body-flyer-reaches-ledge` passes;
  `step2-body-grappler-misses-ledge` and
  `step2-body-infiltrator-misses-ledge` show the other two on the floor
  after the same inputs. `step2-body-flyer-coyote-jump-not-flap` and
  `step2-body-switch-midair-no-flaps` cover the flap's two rules.
- The grappler (lifting heavy bodies): the hit's scenarios, not these.

**Signal 4** (a player switches and the other player sees it), the
headless half: `step2-body-switch-two-players` (A becomes the member
neither was playing, B is unchanged, and the `switched` event is in the
one event list every player's screen is fed from). Supporting:
`step2-body-switch-solo` (cycles all three, feet kept),
`step2-body-switch-refused-in-gap` (never left inside a wall),
`step2-body-spawn-different-members` (two joiners are different
members). The two-screens half needs `npm run e2e` and is not done.

A player only switches: `switch` returns at once for an entity with
`player: null`, since bodies nobody plays also run verbs.
