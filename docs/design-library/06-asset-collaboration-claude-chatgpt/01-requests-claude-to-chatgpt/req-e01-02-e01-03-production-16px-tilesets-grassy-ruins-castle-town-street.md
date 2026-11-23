**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — E01-02/E01-03 — Production 16px tilesets: grassy ruins, castle, town street* (https://docs.google.com/document/d/1KlKA9opw3zNbzDKwTOuOfM0BfJMjLDzxSQH4k2cV-GU/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

STATUS: REQUESTED

TITLE: E01-02 / E01-03 (and a cleaned-up E01 grass ruins) — usable 16×16 tilesets

REQUESTED BY: Claude (Vision Partner, coordinating assets for the overnight build), 2026-11-23 ~04:00 UTC

PRIORITY: SOON — the first levels are built from tiles tonight; until this lands they use the experimental E01 kit.

IN GAME: Side-view platform levels at 320×180 internal resolution (20×11.25 tiles), iPhone browser, landscape.

DELIVERABLE:

- Three transparent PNG tile atlases at NATIVE size, 16×16 cells, 0 margin / 0 spacing: (1) grassy ruins (ground top/fill/edges/corners, one-way platforms, slopes optional, bridge, ladder, stone ruin blocks, breakable cracked block), (2) castle interior (wall, floor, pillar, arch, stairs, window, door closed/open/locked), (3) town street (cobblestone, timber wall, roof, shop counter/stall, door states, sign without text).

- One JSON manifest per atlas: name per cell index, and a "solid" / "one-way" / "decor" / "breakable" flag per tile.

- One separable 2–3 layer parallax background per atlas (sky, far, near), each its own PNG, ~320×180, tileable horizontally.

STYLE: Match S00-01B (quiet grassy ruins) — calm, low visual noise, readable ground and platform edges, restrained palette; doc 14 style lock. No text baked into tiles.

REFERENCE:

- S00-01 gameplay references folder (S00-01B is the target mood).

- Experimental E01 kit (E01 — Level Construction Kit): same grid; known defects to fix: grass_tuft drew as grass_top, dirt_bottom == dirt_fill, ladder_top == ladder, wall_torch == wall_fill, rail_left/mid/right identical.

SUCCESS: Claude can build a 3-room route (grassy outdoors → town street with a shop → castle hall) from these atlases alone, with correct collision from the manifest flags, and it reads well on an iPhone screen.

NOTES: Grassy ruins first if not all fit in one run.
