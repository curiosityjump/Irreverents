# Defeat: being beaten in a bad guys' place (Step 21, risk)

**Reference.** Open before touching `content/defeat/**`,
`src/content/kinds/defeat.ts`, `src/sim/defeat.ts` or
`src/sim/systems/defeat-*.ts`, or any scenario where a hero is knocked flat
in the Bandit Camp or the alerted castle street. Hearts (below): also
`content/hearts.json`, `src/content/kinds/hearts.ts`, `src/sim/hearts.ts`,
`src/sim/systems/heart-*.ts`.

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

## On screen (push 3, `src/client/draw/condition.ts`)

- **The condition slot** beside the viewer's face on the party plate
  (`fillHudSlot('condition')`): `hud-condition-fine` (grey shield),
  `-hurt` (gold: any wear, or any fall here in the window), `-down` (red:
  flat, one fall from being thrown out, or worn past 75% of toughness).
  `drawn.condition` records it. A page never gets the server's `c` for its
  own character, so the slot reads the snapshot's copy: `serverMe()` in
  `src/net/client.ts`, handed in each frame by `src/client/main.ts`
  (`setViewerCopy`). `DRAFT:` the shares and the three states.
- **Banners** (`queueBanner`, keys `risk:*`): the place's `words.thrownOut`
  on your own `thrown-out`, and `words.prizeReturned` on a `prize-returned`
  of yours. No digits.
- **Not done:** the stagger and stars on the hero at the edge.
- **The Hall:** `hall-detect` hangs no "narrow escape" on a tick with a
  `thrown-out` from that room (being thrown is not leaving on your own feet;
  `step21-throw-is-no-escape`).

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

`scenarios/step21-camp-thrown-out.json` (controls: `on` false; `downs` 1); `step21-throw-is-no-escape` (control: the Hall's test removed). `npm run e2e`'s `defeat-*` facts (`scripts/e2e/defeat.ts`): by touch, into the camp past column 20, standing: the slot draws fine, hurt, down; then the page is in the courtyard and its stick moves the hero (the `move` effect's first run across rooms through a browser page). Screenshots: `docs/plan/step-21-shots/`.
`scenarios/step22-beaten-to-entrance.json` (the quarry; control: `on`
false). Measured there: a blow in the quarry often knocks a hero off a ledge
or into a dip out of every seizer's reach (the road's heavy, the ridge's
brute, the depot's far yard), so a hero is thrown out mostly where the floor
is flat around them.
Held, not yet run: `docs/plan/step-21-held/`.

## Hearts (the owner, 2026-11-24: this is what losing becomes)

The owner, playing: "Heros should have hearts which can be lost. Once all
heros in the party are out of hearts, that's a game over (back to cantina)".
The decision is `docs/plan/step-21.md`, "Hearts"; it is built in pushes
(`handoff-prompts/hearts.md`). Landed so far:

- **`content/hearts.json`** (kind `src/content/kinds/hearts.ts`): `on`
  (false: nobody loses one), `default` and `heroes` (hearts by character
  kind; `DRAFT:` 5 for the grappler and the brawler, 3 for the rest), `per`: `fall` (an enemy puts the hero on the
  floor, the unit, D-020) or `blow` (each `hit` an enemy lands: the other
  answer, one switch away).
- **`World.heartsLost`** (`src/sim/hearts.ts`): hearts lost by hero kind,
  the party's, shared by everyone playing (D-012, D-013). Absent or a kind
  left out: none lost. A top-level field, so a kept game keeps it and every
  page takes it with each snapshot. Helpers: `maxHearts`, `heartsLeft`,
  `heartsOut`, `loseHeart`, `refillHearts` (sets `{}`, never deletes).
- **`heart-lose`** (order 580, after every way of being flattened and
  before `defeat-seize`): a played hero `flattened` by an enemy loses one
  (`heart-lost` {entity, player, hero, by, left}). An enemy is a person
  nobody plays who has `c.npc` and is in this world; `by` is the one who
  struck, threw or slammed them (a flight's `by`). Never: a friend (no
  friend can floor you outside the brawl anyway, `friendAttackWear` 0), a
  wall or fall with nobody behind it (`by` null), anything in a cantina room
  (a guard who follows you in; the regulars are not `c.npc`).
  `INTENT:` the enemy is never in a page's world, so a page never writes
  the field.

- **Out** (`heart-out`, order 582, server's world only: it does nothing
  where `World.taken` is set, a page's): a played hero whose kind has no
  hearts, once it could act again (not flattened, held, flying, in a beat or
  seized), becomes the next party member with hearts nobody else plays
  (party order after its own; all taken by friends: the first with hearts,
  the fourth friend's rule), by a `become` effect: where it stands if that
  body fits (the switch's feet-and-middle rule and its slide), else at the
  room's way in (its first spawn, `DRAFT:`), never in a wall (`INTENT:`).
  Events `hero-out` {entity, player, from, to, where: `here`|`way-in`} and
  `switched`. No member with hearts: nothing here (the game over).
- **Never switched to, never given:** `switch` skips a member with no
  hearts; `firstFreeMember` (a new player's seat) skips them too.

Checked by `step21-heart-lost-to-a-bandit` (control: `on` false),
`step21-heart-none-in-the-brawl` (control: the enemy test cut to "anyone
nobody plays") and `scripts/checks/step21-hearts.ts` (two connections and a
kept game; control: no heart taken, it fails); `step21-heart-out-next-member`
(control: heart-out doing nothing), `step21-heart-out-two-players` (control:
the "nobody else plays it" test taken out), `step21-heart-switch-skips-out`
(control: the switch's hearts test taken out) and
`scripts/checks/step21-out-spot.ts` (the way in from a crawlspace; control:
no way in, the player stays the out infiltrator).
