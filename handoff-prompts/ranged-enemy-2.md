# The thrower reads as an enemy and his shot as a threat; then bad guys in the castle's empty rooms (Step 24, slices 1b and 2)

Brief for one builder, three pushes. Written 2026-11-24 13:40 UTC by the
orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`). Read first:
`docs/plan/step-24.md` (all of it: "Builder notes" of slice 1, "Looked at,
2026-11-24 12:25 UTC", "Slices"), `docs/mechanisms/ranged.md`,
`docs/mechanisms/weapons.md`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with shot paths.
**Notes:** `docs/plan/step-24.md`, "Builder notes", newest last.

## The task, and the measure

`docs/vision-gaps.md` row 1 (enemy variety). Slice 1 is live (27490b6:
the thrower on the Hall gallery's balcony) and green in the orchestrator's
full re-runs. A look at its 8 shots found it "poor" by eye. The owner's
words: "readable enemies" (`docs/vision.md:74`). Moves M3 by nothing; it
makes a live thing readable on a phone, then widens it.

## Measured (a subagent's look, 12:25 UTC; not re-measured)

- He does not read as an enemy: a purple-hooded figure drawn like the
  heroes (the toll-keeper's sheet, a `DRAFT:` stand-in).
- His shot in the air is the same boomerang sprite as the one lying on the
  floor to pick up (`docs/plan/step-24-shots/shot-in-the-air-sideways`,
  `hero-struck-sideways`): an incoming throw cannot be told from loot.
- No shot shows his sight band (`src/client/draw/sight.ts` draws every
  person's; nobody checked his); upright he is clipped at the left edge.
- Right: the arc's dots and the landing cross read; his raised arm is
  drawn (`src/client/draw/weapons.ts`, his grips row). The camera now
  leans to show him sideways (ad51322; a follow-up builder,
  `session_017WiGzG1qWbjnes8nG1FuzM`, is changing the camera tonight).

## Do

**Push 1, slice 1b: readable.** (a) A shot in flight looks like something
coming at you: as data on the weapon (a spin, a trail, a tint or a
separate in-flight look; additive fields, so the bomb and any thrown
weapon can use them), unmistakably unlike the same thing lying still.
(b) He reads as hostile at phone size with no new art: use what the other
bad guys already carry (the outposts' people are told from townsfolk
somehow: find out how, say it, and give him the same mark: a palette, an
outline, a banner colour), `DRAFT:`; and put a real enemy sprite for a
thrower on Vision Partner's missing list (`docs/mechanisms/asset-requests.md`).
(c) His sight band drawn and shot; not clipped upright. Shots at 844x390,
750x340 and 390x664 into `docs/plan/step-24-shots/1b/`: at rest, winding
up, the shot in the air, a hero struck.

**Push 2, slice 2, the undercroft:** as `docs/plan/step-24.md`, "Slice 2"
says: measure first what loads the undercroft's placements (its four
scenarios and `scripts/e2e/plates.ts`, whose pages stand on its stone
plate), then a thrower above the stone plate so the weight puzzle becomes
a fight, placed so every existing scenario and the e2e's plate walk keep
their claims (count reds before re-timing any; another builder's fact goes
to its owner). Solo is never locked out: one player must still be able to
open the grate with him there.

**Push 3, the courtyard:** bad guys west of the gate, on the far side from
the street, clear of columns 1-13 (`content/rooms/courtyard.json:2`) and of
the new forest doorway (Step 15's lead, `session_017WiGzHD8gtSGTegd3n8W4G`:
message before placing). The throne room waits (Step 6 unclaimed).

## Paths, traps, scope

Yours: `content/npcs/ranged-*.json`, `content/weapons/thrown-shot.json`,
`content/sprites/ranged-fighter.json`, the additive in-flight look in the
weapon kind and its drawing (`src/client/draw/weapons.ts`,
`src/client/draw/ranged.ts`), `content/placements/undercroft.json` and
`courtyard.json` for your placements only, `scenarios/step24-*`,
`scripts/e2e/ranged.ts`, your shots and notes. Not yours: the camera, the
HUD, `src/sim/` beyond what `docs/mechanisms/ranged.md` gives slice 1,
any room's tiles, Steps 15 and 22's places. Every e2e run rewrites shots
under `docs/plan/` until `handoff-prompts/e2e-shots-only-when-asked.md`
lands: `git checkout -- docs/plan/step-2*-shots` before you commit, and
run the builder card's skip-worktree check. Stop at about 300k tokens with
notes.

## Decided vs. open

Decided: a thing flying at you looks unlike loot; he carries the bad guys'
mark. Open, yours, `DRAFT:` with a `docs/decisions-log.md` entry: which
mark, which in-flight look. For the owner, already in the step file: should
a well-timed Hit bat a shot back.

## Verify

Build, check, full `npm run e2e`, pushed to `main`,
`npm run check:deployed` and `npm run check:live`; the shots in the repo.
A subagent of the orchestrator will look at them: say what you would point
at.
