# Cut-outs from the approved sheets for the core loops (vehicles, powers, treasure, Hall)

Brief for one cold builder (art, props lane). Written 2026-11-23 18:40 UTC by
the orchestrator (`session_017WiGzHhke4tkAThPgw6EXs`). Read
`docs/mechanisms/art-pipeline.md` ("Approved Drive assets first", the looks
kind) and `tools/art/props/README.md` ("Drive-first", "No approved source
found") first. The plan these serve is `docs/plan/core-loops.md` (the owner's
verdict after playing: the core loops are missing).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit and which
sheet each piece came from. Notes: `tools/art/props/README.md`, a "Core loops"
section.

## The task

Looks with clear ids, one small push per group, each visible in a mock scene at
320×180 before pushing. Cut from the approved sheets only; never hand-draw a
final look (list what no sheet covers; it goes on the Drive's missing-assets
list).

1. **Vehicles and mounts** (P04 `chibi-vehicle-and-mount-sprite-sheet`): each
   machine and mount, idle / moving / wrecked where the sheet shows them.
2. **Rare powers and pickups** (P05 `p05-rare-powers-pickups-source`): each
   pickup, its glow, the "lost" pop.
3. **Treasure** (P04/P07 interactables, P05 `p05-secrets-doors-breakables-source`):
   chests closed/open, gold, gems, the vault cave, locked and barred doors.
4. **Hall of Legends pieces** (P04 `hall-of-legends-tile-atlas`).
5. Whatever a core-loop builder asks you for by message: agree the look ids
   with them.

## From the last props builder (it stopped at its context limit)

- The cutter is `tools/art/props/srcimport.py`: `grab(sheet, box, scale or
  size=, ramps, key=pale ground, grid=True)`. Every Drive cut so far is in
  `tools/art/props/drive.py`, one function per piece with its sheet box.
  `make.py` adds a group by appending a `Sheet` in `looks_sheets()`.
- Plate names registered in `srcimport.SHEETS`: interact, vehicle, vfx, ruins,
  hud, brawl, ui, vibrant, fantasy, biome, platformer, secrets, tavern,
  villain. **P05 rare-powers and P04 hall-of-legends still need entries.**
- Traps: P03 grassy ruins and the P05 plates sit on an opaque pale ground (use
  `key=`). Thin strokes want `edge=None`. Shrinking below about 16 px loses
  faces and glyphs. `check:deployed` returns at once: poll `/healthz`'s
  `commit` instead. If live is healthy on an older commit, wait, don't revert.
- Level-entrance looks already exist in `content/looks/levels.json` (344cbce).

## Done

Each push: `npm run build`, `npm run check` green (e2e if a look the game
already draws changed); pushed; live. The mock scenes committed under
`docs/plan/step-8-shots/round3/props/`.
