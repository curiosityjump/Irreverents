# Ranged enemies: a bad guy who throws things

**Reference.** Open before touching `src/sim/ranged.ts`,
`src/sim/systems/ranged-throw.ts`, `src/client/draw/ranged.ts`, the `ranged`
field of `content/npcs/`, `content/weapons/thrown-shot.json`,
`content/placements/hall-gallery.json`, the `test-ranged*` rooms,
`scenarios/step24-*` or `scripts/e2e/ranged.ts`. Written by Step 24's slice 1
builder, 2026-11-24 (`docs/plan/step-24.md`; every number `DRAFT:`,
decisions-log "Step 24").

## Why it exists

`docs/vision-gaps.md` row 1: "no ranged kind". The owner: "readable enemies"
(`docs/vision.md:74`); D-020 (impact, never numbers), D-021 (heroes outpower
him: he is light), D-055 and D-062 (fixed behaviour: never aimed).

## A thrower is data

An NPC kind with a `ranged` block (`src/content/kinds/npcs.ts`):

```json
"ranged": { "weapon": "thrown-shot", "range": 176, "aim": 0.6, "every": 2, "speed": 200, "lift": 0.6, "out": 3 }
```

`weapon` is a weapon whose `use` is `throw`; every body placed with the kind
must list `attack` (hands). The check refuses either. **To add a thrower:**
one `content/npcs/<id>.json` on any body that lists `attack`, placed in
`content/placements/<room>.json` (`content/npcs/bomb-thrower.json` is the
proof: a camp fighter's body throwing the bomb; no code names it).
**To add a thing to throw:** one `content/weapons/<id>.json` with
`use: "throw"` (no `sources` needed) and name it in `ranged.weapon`. A weapon
with a `burst` is lit by his throw.

## What he does (`ranged-throw`, order 64; server and scenario worlds only)

- **Holds his post:** after outpost-fight (58) and clash-fight (59) write his
  input, any walking is replaced by standing; a turn or a swing in reach is
  kept. While his shot is in hand, Hit is stripped (else weapon-toss, 95,
  would throw it with no telegraph).
- **Aims:** `every` s after his last throw, a hero he sees this tick
  (`canSee`, his own `sight`), nearest, within `range` across and farther
  than `npcChargeReach`: he is handed his shot (the weapon effect,
  `src: ~ranged:<his id>`), `c.rangedAim = { at, dir }`, event `ranged-aim`.
- **Throws** after `aim` s, the way he aimed, even if the hero moved (that is
  the dodge): `makeLoose` in front of his hand at chest height
  (`shotStart`), at (dir × speed, −speed × lift), `flying` with `met: [him]`;
  events `weapon-dropped` (`how: thrown`) and `ranged-threw`. From there it is
  Step 23's flying weapon (`weapon-move`): it strikes the first body, lies
  where it lands, and anyone can pick it up (Use) and throw it back (Hit).
- **Loses the throw** when knocked off his feet mid-aim, or when the shot
  leaves his hand (a hard hit knocks it loose: `weapon-loose`): `ranged-lost`.
  A soft hit leaves it in hand for the next aim; he is never handed a second.
- **Cap:** more than `out` of his shots (by tag) loose in his room, in the air
  too, the oldest goes (`ranged-shot-gone`, with where). One in a hand never.
- Hearts, defeat and beaten-for-good need nothing new: his shot's `by` is him.

`INTENT:` no shot leaves without being drawn held up, with its arc, for his
whole `aim` (at the system and the draw).

## What a player sees (`src/client/draw/ranged.ts`)

While `c.rangedAim` is on him: a dotted arc from his hand, stepped by the
sim's own fall (`shotArc`: `moveLoose` on a scratch entity) to its first
landing, filling in over the aim, and a cross where it comes down. The held
shot is draw/weapons.ts's, on his `content/grips.json` row.
`window.irreverents.drawn.ranged.aims` for the checks (each with `top`, the arc's highest room y, added for Step 5's camera fact). Sideways, the camera leans up to show him and his arc (`rendering-world.md`, "The camera leans up"). On the page a body is
drawn `interpDelayMs` in the past but a new loose shot at its first sample, so
the drawn lead is about `aim` − 100 ms.

## Where one stands

`gallery-thrower-1` on the Hall gallery's balcony, [9, 2], facing east over
the steps (the gallery's way out when the courtyard gate is shut). His arc
passes over the near floor, comes down on the middle step near column 17 and
bounces onto the floor east of it; the top step and column 14 of the middle
step are under it. A kept game gets him on load.

## How it is checked

Scenarios `step24-*`, each with its control: `-throws-from-range`,
`-aim-before-shot`, `-jump-dodges`, `-hit-during-aim`, `-throw-it-back`,
`-costs-a-heart`, `-holds-his-post`, `-beaten-for-good`, `-shots-capped`,
`-one-file`, `-gallery-seen-on-the-floor`, `-gallery-way-out-<hero>` (each
hero out over the roofs within 800 ticks) and `-gallery-way-out-control`.
Test rooms `test-ranged` (ledge), `-floor` (80 wide), `-bomb`, `-camp`.
`npm run e2e`, fact `ranged-telegraph` (`scripts/e2e/ranged.ts`; control
`E2E_RANGED_BEHIND=1`). Shots: `docs/plan/step-24-shots/`.
