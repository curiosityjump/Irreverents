**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *03 Visual Direction and Assets/Current Pixel-Art Explorations/E01 — Level Construction Kit (Experimental 16px)/E01 README — Using the Experimental Construction Kit* (https://docs.google.com/document/d/1CdGdaj-Q1e1JWT2s63no3Pp1CMwxPw9qzhExikZbWKY/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

E01 — LEVEL CONSTRUCTION KIT: README

Irreverents • Generated 22 November 2026 • Status: EARLY PROTOTYPE, NOT APPROVED FINAL ART

# Purpose

This batch supplements the selected Amazing Mirror-era visual references with actual 16×16-aligned prototype tile PNGs and a manifest. It is for evaluating level geometry, consistency and visual calm. It does not claim final production-art quality, final engine support or user-approved character/environment designs.

# Contents

1. E01-01 Terrain Construction Concept Sheet — one larger exploratory visual reference (AI-rendered). It communicates module types; its pieces are NOT grid-aligned production sprite tiles.

2. E01A grass_ruins_tiles_16px.png — code-generated native RGBA atlas, transparent tiles aligned on a 16 × 16 grid (8 columns, 38 defined tile cells).

3. E01B royal_castle_tiles_16px.png — code-generated native RGBA atlas, transparent tiles aligned on a 16 × 16 grid (8 columns, 42 defined tile cells).

4. E01A/E01B contact previews — enlarged nearest-neighbor sheets with indexes and names for human review. Do not import these previews as sprites.

5. Assembled room preview — 4× nearest-neighbor mock screen with a plain original player placeholder, assembled using actual terrain and castle tile PNGs.

6. tile_manifest.json — atlas tile names, numeric indices and exact x/y/w/h in pixels; no inferred names.

7. ZIP package — atlases, contact previews, native and enlarged scene, manifest and Python generation source.

# Links

Folder: [https://drive.google.com/drive/folders/1wSx5SxZf0lRaQqKqgPP-fy_SenjAKfYB](https://drive.google.com/drive/folders/1wSx5SxZf0lRaQqKqgPP-fy_SenjAKfYB)

Concept reference: [https://drive.google.com/file/d/1rIzWfAF3aIoCmeE3ukmuAWYkIdLUZufU/view](https://drive.google.com/file/d/1rIzWfAF3aIoCmeE3ukmuAWYkIdLUZufU/view)

ZIP/source: [https://drive.google.com/file/d/1RFvEYnknErRSsJvSkI-WaFuYE3AzPqdS/view](https://drive.google.com/file/d/1RFvEYnknErRSsJvSkI-WaFuYE3AzPqdS/view)

Grass atlas: [https://drive.google.com/file/d/1Zgf9Ms727VAEcC0ZDIlhBVOfkA8CZlNQ/view](https://drive.google.com/file/d/1Zgf9Ms727VAEcC0ZDIlhBVOfkA8CZlNQ/view)

Castle atlas: [https://drive.google.com/file/d/1DL-NvflklT2sWvtaV809aRnLzbajZPyh/view](https://drive.google.com/file/d/1DL-NvflklT2sWvtaV809aRnLzbajZPyh/view)

Manifest: [https://drive.google.com/file/d/1L9zKq4igj6MyI1-yIRgU1yssRQyKU66Z/view](https://drive.google.com/file/d/1L9zKq4igj6MyI1-yIRgU1yssRQyKU66Z/view)

# Suggested use

For a tilemap editor, extract atlas PNG, set cell size 16×16 with 0 margin and 0 spacing, and use tile_manifest.json to map tile names to coordinates. For review, show nearest-neighbor integer-scaled previews. The example room is a visual layout demonstration, not a full collision or gameplay prototype.

# Quality caveats

The procedural atlas uses a restricted palette and deliberately simple shapes to avoid overstimulation. It is correspondingly basic compared with the user's earlier preferred reference. Some tile edges and transitions may require manual correction for adjacency and collision logic, and the art lacks final polish, layers and animation. A level artist must validate repeated tiles, slopes, edge masks, foreground/background grouping, metadata and animated variations. Generated character placeholder is not final canon.

# Active decisions

Current asset phase: Gate 1 foundational construction; E01-01 AI concept complete; early experimental geometry sample for parts of E01-01/E01-02 complete.

Not yet done: complete modular castle architecture variants, town street kit, undercroft, mechanical objects, parallax separation, multiple functional states for door families, interactable prop state machines, and authored six-room vertical slice map.

The owner wants faithful, playful, lower-noise Amazing Mirror-era pixel art, NOT anime/cinematic fantasy paintings. This is a prototype resource under that art-direction contract, not an approved replacement for original sprite art.
