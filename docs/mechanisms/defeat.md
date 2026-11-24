# Defeat: being beaten in a bad guys' place (Step 21, risk)

**Reference.** Open before touching `content/defeat/**`,
`src/content/kinds/defeat.ts`, `src/sim/defeat.ts` or
`src/sim/systems/defeat-*.ts`, or any scenario where a hero is knocked flat
in the Bandit Camp or the alerted castle street.

## Why it exists

The owner, 2026-11-23, after playing: "no risk", and later, playing the live
game: "Also, i seem to be invincible as hero...". Before Step 21 a beaten hero
lay flat for `flattenTime` and got up where they fell, having lost nothing.
D-019: getting caught opens "battles, last stands and narrow escapes, NOT an
automatic-reload punishment loop". O-006 (defeat and recovery) is OPEN: every
choice here is `DRAFT:` (`docs/decisions-log.md`, "Step 21").

## The rule

A place is `content/defeat/<id>.json`: its `rooms`, its side (`seizers`,
NPC kinds), `reach` (px), `downs` and `window` (s), `beat` (s, below
`world.flattenTime`), `alertAbove` (only while the room's alert is above it;
left out: always), `lands` (a room one door away at most, and a `door` or a
`tile` there), `follow`, and `words` (the banners, no digits). `on: false`
is the game before Step 21. Today: the camp (`downs` 4, lands in the
courtyard's `to-outpost` doorway) and the castle street under an alert
(`downs` 2, lands in the open courtyard at [4, 7], `follow`), and (Step 22
push 1, `DRAFT:`) the Iron Quarry's six rooms (`content/defeat/quarry.json`:
`downs` 3, seizers the fighter, the heavy and the brute but not the
toll-keeper, lands on the road just inside its `to-courtyard` doorway, the
start of the quarry, `follow`).

1. **A fall** (`defeat-seize`, order 585): a played hero `flattened` in a
   room of a place that is on is a `fall`; `c.falls` keeps the ticks of the
   last `window` seconds there. Fewer than `downs`: nothing more, they get up
   where they lie, as before.
2. **The seize:** the `downs`-th fall with a standing, acting person of the
   place's side within `reach`: the nearest stands over them, `c.seized` for
   `beat` (event `seized`). A **played** body's `hit` on him stops it
   (`seize-stopped`); a bandit's stray hit does not (bandits flatten each
   other constantly). Nobody in reach: no seize, the hero gets up.
3. **The throw** (`defeat-throw`, 590, before `heist-cargo` 607): whatever
   the hero carries or is held by is let go; a prize in their hands goes back
   (`returnPrize`, then `prize-returned`) **before** they leave the room, so
   it is never banked; then one `move` effect to the landing spot and a fresh
   `flatten` for `flattenTime`; `thrown-out` {entity, player, place, from,
   to}; with `follow`, also a `changed-room` by the door between the rooms,
   so the existing chase rules (`alert-follow`, `chase-cap`) send the guards
   who had the hero in sight out after them. `c.falls` is cleared.

**The place keeps its state.** Nothing resets: the post, the waves, the
alert, found pieces, the roster; a friend inside is untouched.

## Rules that are deliberate

- **The throw is the way out** (`INTENT:` in `defeat-throw.ts`;
  `docs/deliberate-designs.md`): never held longer than `beat` +
  `flattenTime` from the fall; a landing spot missing or in a wall throws
  nobody.
- **Server's world only** (`INTENT:` in `defeat-seize.ts`): a page's world
  holds only its own hero, so no seize starts there; `c.falls` and
  `c.seized` live in the server's `c` (`docs/mechanisms/network.md`, "Who
  owns which part"). No top-level field. Read both with a default (old saves).
- **Never in the cantina** (D-086): the kind's check refuses a cantina room.
- **Never ends a chase** (D-067, D-077): the town lands in the open
  courtyard and the alert is untouched.
- **The power** is the powers slice's rule (a hard hit knocks it loose);
  this writes no second drop.

## Numbers (`DRAFT:`, measured in `docs/plan/step-21.md`, "Push 1")

`downs` 4 in the camp and 2 in the street, `window` 60 s, `beat` 1 s,
`reach` 24 px. The camp's 4 is the lowest that keeps Step 7's scenarios (a
hero standing a minute under three waves) green; a hero who stands still
there is out in about 20 to 35 s.

## How it is checked

`scenarios/step21-camp-thrown-out.json` (controls: `on` false; `downs` 1).
`scenarios/step22-beaten-to-entrance.json` (the quarry; control: `on`
false). Measured there: a blow in the quarry often knocks a hero off a ledge
or into a dip out of every seizer's reach (the road's heavy, the ridge's
brute, the depot's far yard), so a hero is thrown out mostly where the floor
is flat around them.
Held, not yet run: `docs/plan/step-21-held/`.
