# A freed recruit shown right: a face, a name without the stand-in word, and no bars over whoever stands in the open cage

**Brief.** Written 2026-11-25 by orchestrator
`session_017WiGzGgiMLCwNj9zptZqBz` for one builder. Step 13
(`docs/plan/step-13.md`); `docs/vision-gaps.md` row 12. Start-up read:
`docs/roles/builder-card.md`. Mechanism: `docs/mechanisms/recruits.md`
(read it before touching anything it covers).

## The task, and what it moves

A blind look at the hidden recruit's shots (`docs/plan/step-8.md`, last
section; `docs/plan/step-13.md`, "Briefs") found three things a player
sees wrong the moment they free her. Fix all three, for both recruits
where the fault is shared. It moves no row of the measure table (M1-M3
stay as they are); it is for the owner's first-hand rule that he should
never be the one to find what is missing, and for legible pixels on a
phone.

## What was measured (2026-11-25, at 7a28072; re-check a line before you lean on it)

1. **The face.** The HUD picks a face in `src/client/draw/hud.ts:375-380`
   (`face()`): the look `hud-face-<kind>`, else a framed square in the
   character's colour. `content/looks/ui.json` lines 8-12 hold five
   faces: grappler, infiltrator, flyer, brawler, skirmisher. There is no
   `hud-face-hauler`; that is the whole cause of her salmon square
   (`content/characters/hauler.json:9`, `#e07a5f`). She has a full sheet
   (`content/sprites/hauler.json`, `assets/sprites/cast/hauler.png`).
   The faces are made by `tools/art/props/make.py:228-229` from
   `FACES` (`tools/art/props/round3.py:553`, five keys) with a head box
   per hero in `HEAD` (`tools/art/props/drive.py:114-115`, five keys).
   The "joins!" flash (`src/client/draw/recruits.ts:171-187`,
   `drawRecruitFlash`) uses the same look at the plate's full height
   with the same fallback: that is the big salmon block with no hearts
   in `docs/plan/step-13-shots/hidden-freed-844x390.png`. Her hearts are
   fine (`content/hearts.json:5`, 5).
2. **The name.** `content/characters/hauler.json:4`, `"name": "Graybox
   Hauler"`. The same stand-in word is in the `name` of the skirmisher,
   brawler, grappler, infiltrator and flyer files. A player reads a name
   in two places only: the banner (`src/client/draw/recruits.ts:157-158`,
   "`<name> joins!`") and the Hall's record (`src/client/draw/hall.ts:240`).
   "Graybox" also appears in `src/content/kinds/net.ts`,
   `src/content/kinds/characters.ts` and `src/client/draw/room.ts`: read
   each before changing any name.
3. **The cage.** Nothing is wrong with the freed state: the captive stops
   drawing when `state.open` is true (`src/client/draw/recruits.ts:62`),
   for both recruits. What the shots show is a living body under the
   open cage's posts and lintel: `src/client/render.ts:125` draws bodies,
   line 127 draws the cages over them (on purpose, so bars cover a
   captive), and the on-the-spot swap leaves the new hero standing in the
   cage's two tiles. `cage-open` is `content/looks/outpost.json:10`.
   The same shows in the camp (`rescue-swapped-844x390.png`).

Coverage today: nine `step13-*` scenarios name the hauler, all in the
simulation; eight e2e facts in `scripts/e2e/hidden-recruit.ts`
(`hidden-recruit-freed` at :350 checks the banner is non-empty, not its
words; `hidden-recruit-plate` at :385 checks which kinds are listed, not
that a cut face was drawn). None would have caught any of the three.

## Decided

- **Her face is cut from her own sheet, the way the other five are**:
  a `HEAD` box, a `FACES` entry, the tool re-run, the `ui.json` line.
  Mark it `DRAFT:` stand-in like the others.
- **`DRAFT:` shown names lose the stand-in word**: "Hauler joins!",
  "Skirmisher joins!", and the same for the other four (orchestrator's
  reading, logged in `docs/decisions-log.md`, 2026-11-25, "Shown
  names"). These are role words, not proposed names; no proposed name
  from the design library goes in. Ids do not change. To undo: the six
  `name` fields.
- **An open cage never draws over a living body.** Once `state.open`,
  the cage's look is drawn behind bodies; a shut cage keeps drawing its
  bars over its captive. How (an earlier pass in `render.ts`, a split of
  `drawRecruits`) is yours.
- **Each fix gets a fact that fails without it**, and shows you watched
  it fail: the banner's words; a cut face drawn for every roster kind
  (so the next recruit without one is caught by the check, not by the
  owner); a body in an open cage's tiles drawn after the cage.

## Open

Nothing for the owner. What she is finally called and looks like is his,
later; build so each is one line of data.

## Traps

- **Re-running the art tool re-lays out `assets/ui/hud.png`.** Every
  rectangle in `content/looks/ui.json` that points into it can move.
  Regenerate them together, never by hand, and compare every existing
  HUD look before and after (faces, hearts, pips, buttons): a shifted
  rectangle shows as the wrong picture, not as an error. The last
  builder skipped the face for exactly this reason
  (`docs/plan/step-13.md:188`).
- **The flash square** is the plate's height: her 16x16 face scaled up
  must still be whole-pixel and legible at 844x390 and 390x664.
- **Do not move the swap** off the cage's spot, and do not change
  `placeRecruits`, the hold time or FREE's order: tick-pinned scenarios
  rest on them (`docs/plan/step-13.md`, "Builder notes").
- **A name change can break a fact or a saved record** that compares
  the string: grep `Graybox` across `scripts/`, `scenarios/`, `src/`
  first and say what you found. The Hall's stored records keep whatever
  name they were written with; leave old records alone.
- Strangeness is usually intent: `docs/deliberate-designs.md` before
  calling anything else here a bug.

## Yours and not yours

Yours: `src/client/draw/recruits.ts`, the cage's lines in
`src/client/render.ts`, the `name` field of the six
`content/characters/*.json`, `scripts/e2e/hidden-recruit.ts`,
`scripts/e2e/rescue.ts`, `scenarios/step13-*.json`, and, for this brief
only, the HUD sheet's lane, which nobody else is in: `tools/art/props/**`,
`assets/ui/hud.png`, `content/looks/ui.json`. `src/client/draw/hud.ts`
only if a fact needs one read-out line. Not yours: `src/sim/**`
(no rule changes), the weapon grip she lacks (`content/grips.json`),
every other look and sheet, and `scripts/e2e/**` beyond the two files
(the reds' builder, `e2e-intermittent-reds.md`, is in there: if it has
pushed code in the last 3 minutes, rebase once, re-check, then push).

## How it is verified

`npm run build`, `npm run check`, `npm run gates`, the full
`npm run e2e` (a player sees all of this), then re-shoot `hidden-freed`,
`hidden-plate` and the camp's swapped shot at 844x390 and 390x664 into
`docs/plan/step-13-shots/` and look at each yourself: her face in the
plate and in the flash, the banner's words, nobody behind posts. Known
intermittent reds that are not yours: `clash-street`, `beaten-gone`,
`suplex-again`; a second e2e at the same commit tells flaky from broken.

## Done

Build, check and e2e green (or each red named, with its count), pushed
to `main`, live (`npm run check:deployed`); before the push read
`/debug/errors` and `/healthz`'s `players`, and push nothing while
anyone plays. `docs/mechanisms/recruits.md` says how a recruit gets a
face and where an open cage is drawn. Notes, doubts and skipped checks
go under "Recruit shown right: builder notes" at the end of
`docs/plan/step-13.md`, never only in a message. Your budget is 280k
tokens: stop there with a "Landed so far" block in this file.

## Where questions and reports go

By `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. Never stall on the owner: decide from
his words, mark `DRAFT:`, log it in `docs/decisions-log.md`, carry on.

## Follow-up (orchestrator, 2026-11-25 15:22 UTC, after the blind look at 7417324)

Landed so far: 7417324 (her face, the six names, an open cage behind
bodies, `hidden-recruit-open-cage`), cf388da (gate record). The look
found the `hidden-*` shots clean. Owed, one small push, same builder
(`session_017WiGzGffLu42yKrbPuQphJ`): the camp's twin fact in
`scripts/e2e/rescue.ts` (a body in the open cage's tiles drawn after the
cage; the banner reads "Skirmisher joins!"; each watched to fail), and
`rescue-freed` and `rescue-swapped` re-shot at 844x390 and 390x664 from
that script (the old `rescue-swapped-844x390.png` still reads "Graybox
Skirmisher joins!" with him under the beam; nothing in the repo writes
it). Say in the notes what the white and gold shape behind her head in
`hidden-plate-*` is.
