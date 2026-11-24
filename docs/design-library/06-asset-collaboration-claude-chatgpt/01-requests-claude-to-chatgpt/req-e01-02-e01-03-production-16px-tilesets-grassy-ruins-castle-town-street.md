**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — E01-02/E01-03 — Production 16px tilesets: grassy ruins, castle, town street* (https://docs.google.com/document/d/1KlKA9opw3zNbzDKwTOuOfM0BfJMjLDzxSQH4k2cV-GU/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

2026-11-23 1:31 PM EST — P10 TRN-01 SOURCE CONVERSION, PARTIAL PROTOTYPE

13 distinct source-faithful grass/dirt prefabs extracted from owner P10 TRN-01 row, with alpha-repaired individual PNGs on 16px-aligned canvases, manifest, contact sheet and 320×180 preview. ZIP https://drive.google.com/file/d/1dBDuUkQnYfX55mv7FZYRQui0y2yLt-la/view ; folder https://drive.google.com/drive/folders/1xAQaIl2x5XhpSeoj6bB_4_i5UOtktZ2t ; contact https://drive.google.com/file/d/15j_AtGdfTNsKIhPEA6nmDYcmXAt7tvMd/view. QA: 13 distinct source crops inspected; not seamless 16×16 tiles, no collision flags, alpha matte repair approximate, parallax not delivered. Status PARTIAL PROTOTYPE — REQUEST REMAINS OPEN. Original P10 immutable; do not substitute this for requested tile atlas.

2026-11-23 12:59 PM EST — P10 OWNER SOURCE ROUTING VERIFIED; REQUEST STILL OPEN

Use OWNER P10 tagged source before generating any replacement terrain: https://drive.google.com/drive/folders/12lQHr2RzLIP_uAAONlo1xekOYvUT3dcq . Exact tag CSV https://drive.google.com/file/d/1Nd2DL2bhzRWEsSaJ6vXHTelbF0Z_qbnZ/view . Relevant rows: TRN-01 grass/dirt platforms, TRN-02 stone/steps, TRN-03 arches/ruins, TRN-04 wood bridges/ladder, TRN-05 castle walls/battlements, TRN-07 town roofs/storefronts; INT-02 door/gate/lever/pressure plates; INT-03 breakable crates/barrels; INT-04 ladders. For existing 1024×180 opaque static scene backgrounds use BKG-01 runtime files https://drive.google.com/drive/folders/1pw3aCojPx3vvDGWHRt2f_ons-Rammisv ; these are NOT independent parallax layers. Verified that P10 original ZIP, CSV and manifest exist in Drive and source row status is SOURCE_ONLY. No native 16×16 tile atlases, seamless edge QA, separate parallax layers or collision manifest have been produced in this pass; request remains REQUESTED. Preserve originals, convert per-object, test seams at 1× and preview 320×180 before marking delivered.

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
