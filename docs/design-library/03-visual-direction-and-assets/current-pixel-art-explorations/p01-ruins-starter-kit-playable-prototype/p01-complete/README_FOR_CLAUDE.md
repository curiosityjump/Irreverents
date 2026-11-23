# IRREVERENTS — P01 FIRST PLAYABLE ART PACK (2026-11-23)

## What is this?
A small importable prototype asset pack based on the **directionally good, user-selected early pixel-art reference set**, not the subsequently rejected box-figure hero sprites.
Use it to **prototype immediately** and replace/refine as the game matures. These are real, separate RGBA PNGs with engine-friendly dimensions, a static texture atlas and a JSON manifest; they are not just concept posters.

## Included
- Two original compact adventurer hero pose strips (scout / rogue), **7 × 48×48px cells each**, plus named individual state PNGs. Poses: idle, step A, step B, dash, attack, jump, crouch. The stride frames are NOT yet a fully polished looping run animation; keep this as a usable early playable prototype, not final animation.
- 12 independent props (crate, barrels, chest, arch, pillars, ladder, lantern, banner, sign, wooden bridge), true alpha.
- 8 terrain **prefabs**; individual side-view platform objects, NOT a seamless 16×16 autotile system. Use them in authored rooms as standalone solids/one-way segments, then extend into a real grid-aligned set.
- 4 single image effect sprites. Apply transformation, opacity and/or author true animations as needed.
- `atlas/static_112px_cells.png`, a transparent atlas. `manifest.json` supplies source rectangles, native sizes, pivots and indicative collision box metadata.
- `preview/review_board.png`, `preview/gameplay_320x180.png`, and `demo/index.html` minimal touch/keyboard HTML5 renderer.

## Use in Claude's GitHub game
Copy `sprites/`, `atlas/`, `manifest.json` into public assets (or bundler static assets). JSON keys are stable for this pack.
Render nearest-neighbor. For heroes use 48×48 UV sprite cells; the strips are 336×48 with seven horizontal frames. Set the foot pivot at x=24, y=45 in each cell. For static atlas, sourceRect coordinates are exact, no labels in PNG.
At virtual canvas resolution 320×180, scene composition can be tested; CSS upscale with `image-rendering: pixelated`.
The manifest collision data is a STARTING DEFAULT, not definitive game physics: e.g., arch openings need authored left/right solid shapes, prefab grass corners need terrain shape authoring. More complex geometry should be authored in engine.

## Current quality status, no owner preapproval required
PROTOTYPE-READY: art can be used now; refine later. The individual sprites have been visually compared and are more expressive than rejected C02 v1; however, this pack does not claim final style perfection, complete animated movement, true seam-free terrain, or feature-complete gameplay.
The first generation's soft painted/3D terrain sheet was DISCARDED as off-style. This package only includes revised original 2D pixel-style output that passed inspection for basic style alignment.

## Source / provenance
New original art derived from the user's directionally-endorsed visual references. Most relevant existing Drive references include:
- Pixel aesthetic north star https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view
- Compact character roster https://drive.google.com/file/d/1_Kf9A99HzHi7BH-jt_H_nQz2K5F5OhJ1/view
- World/ability boards https://drive.google.com/file/d/18e3U20DMwbmZHrU8RFOwO1PU1qjfV0w8/view
- Props/vehicles board https://drive.google.com/file/d/1nngd6l6Sargc5dRENSmZjEGF0vagxBGV/view
- Gameplay showcase https://drive.google.com/file/d/1VSAPHeTQ5Uw_5AFP-Y4paoxQHIQhCWck/view
No direct Nintendo sprites were copied.

## Review requested
Rate (1–5) separately: hero look, animation/presentation, prop design, terrain readability, effects, overall reference match. Mark which categories deserve the next refinement cycle. The user has already authorized all new work for prototyping by default—no approval gate.
