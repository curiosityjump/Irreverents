# Better player buttons on the phone, from the approved UI atlas

Brief for one builder. Written 2026-11-24 00:25 UTC by the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`). **The owner's words, first-hand to the
orchestrator, ~00:20 UTC, after an evening playing on a phone:**

> Can we get better player buttons? Do we need new assets for those or do we have them already somewhere unused?

He has not said what is wrong with them (look, size, place, or how they
answer a press); the orchestrator has asked. Until he says, this brief is the
look and the press feedback, built so size and place stay one data change.

Read `docs/mechanisms/asset-coverage.md` ("UI and HUD": today's six buttons
are the delivered U08-01 process test, byte-identical in `assets/ui/touch/`;
the row `ui:touch-fallback-chrome` names an approved source nobody has used:
`P07/irreverents-pixel-ui-atlas.png`, d-pad key (95,854,185,934) and the
round-button plate with its glyph cleared (275,884,425,1039); MA-01 says the
'Use' glyph is missing), `docs/mechanisms/art-pipeline.md` ("Approved Drive
assets first"), the touch controls' mechanism file (`docs/mechanisms/README.md`),
`docs/plan/step-5.md` (the phone layouts and the e2e facts that hold them:
44 px targets, clear of the notch and home bar, the controls painting under
3% of the view) and library doc 33 (D-093: a few context-sensitive controls).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`: first with a contact sheet (below), then
after each push. Notes: `docs/plan/step-5.md`, "Buttons".

## The task

1. **Answer his question with a list**, in your notes and your first report:
   every button and control the phone shows today, the file each is drawn
   from, and for each whether an approved, unused source exists (open P07's
   UI atlas, P05's HUD boards and the A00 comps yourself and say what you see:
   plates, d-pad, glyphs, pressed states), and which have none (they go on the
   Drive's missing-assets list: tell Vision Partner by message).
2. **A contact sheet before any push:** the phone's controls drawn three ways
   at the e2e's phone sizes (upright 390×664; sideways 667×375 and 844×340),
   over a real room: (a) today's; (b) every control re-cut from the approved
   atlas as one family (plate, glyph, a pressed state; the Use button keeps
   its words from `content/prompts.json`); (c) the same with the stick drawn
   as the atlas's d-pad or pad. Commit it under `docs/plan/step-5-shots/buttons/`
   and send it. Look at each yourself: say which glyphs stay readable at
   those sizes and which do not.
3. **Push (b) or (c)**, whichever is more legible by your own look, as data
   (art is data: with the files gone today's buttons come back): each button
   answers a press at once with its pressed look (on the press, not on the
   server's answer), and shows when it would do nothing (dimmed), `DRAFT:`.
   Do not change what any button does, the number of buttons, or the layout
   numbers unless a glyph cannot be read at 44 px: then say so and propose,
   do not move things on a hunch.

## Decided

- From the approved atlas only; never hand-draw a final glyph. A glyph with
  no source is a `DRAFT:` stand-in and a missing-list item.
- Every existing phone e2e fact stays green unloosened.

## Paths

Owns: the touch controls' client files and styles, `assets/ui/touch/**`,
`content/` looks for the controls. Must not touch: `src/sim/**`,
`src/server/**`, `content/prompts.json` (Step 19's; read it), the HUD plate
and banner (`src/client/draw/hud.ts`, `banner.ts`).

## Done

`npm run build`, `npm run check`, `npm run e2e` green (the reconnect facts
`h1`/`h2`, `cantina-row` and the friend-throw facts fail some runs on `main`
and are being fixed under `handoff-prompts/step-5-e2e-flakes.md`: re-run and
report, never loosen); pushed; live; `docs/mechanisms/asset-coverage.md`
updated; one line for the owner saying what changed on his phone.
