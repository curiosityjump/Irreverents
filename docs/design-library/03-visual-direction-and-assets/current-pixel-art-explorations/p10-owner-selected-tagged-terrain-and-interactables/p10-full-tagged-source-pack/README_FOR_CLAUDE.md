# Irreverents P10 — Owner-selected, tagged terrain & interactables

**Owner provided these two exact white-background reference sheets on 2026-11-23 and asked to put ALL of them in Drive with relevant tags so Claude can choose and adapt them.**

## What's here
- `source/terrain_platform_building_blocks_FULL_SOURCE.jpg` — EXACT original 1448 × 1086 JPEG: grass, stone, arches, wooden bridges, town roofs, snow, lava, mushroom and sky platforms.
- `source/interactables_mechanisms_pickups_FULL_SOURCE.jpg` — EXACT original 1448 × 1086 JPEG: chests, loot, doors, gates, levers, alarms, breakables, winches, carts, vents, power fixtures, hazards and pickups.
- `row_crops/TRN-*.png` and `row_crops/INT-*.png` — 20 **lossless row crops** preserving original scale, with descriptive filenames and a reliable source-region mapping. These remain on WHITE backgrounds; they are NOT individual game sprites.
- `tag_index.csv` — searchable tags and category list.
- `manifest.json` — source provenance, row-region bounding coordinates, tags, intended uses, and accurate technical status.

## How Claude should choose assets
Search `tag_index.csv` by functional gameplay need, or inspect the matching `row_crops/` image. Use exact image from the source sheet rather than generating an inferior visual substitute. For instance, need a locked gate? Try INT-02. Need a horn signaler, breakable barrel or crate states? INT-03. Need a modular ice world? TRN-08. Mushroom bouncers? TRN-10. Need chests? INT-01. Trap hazards? INT-08.

## Implementation distinction
These are **original white JPEG source sheets**, not separated, alpha-transparent native runtime assets and not 16×16 seamless tiles. Unlike the previously generated P07/P08 semi-transparent black-matte atlas variations, these exact user-supplied sheets are preserved in a clean white-backed form. Their pieces look promising but still need deliberate sprite isolation, JPEG matte removal, alpha/edge cleanup, pivots, state pairing and collision/adjacency tests. Do not programmatically pretend arbitrary crops are 16×16 tiles. In particular, the individual row crops are collections of many pieces on white backgrounds, not game-native atlases.

### Suggested integration pipeline
1. Select asset group by tags. Read its source crop coordinates and locate individual shapes inside its row.
2. Extract single shapes manually or via an inspected segmentation pass. Preserve pixel clusters and transparency carefully, avoiding white fringe or holes in snow/ice/highlights.
3. Give each object stable ID, native dimensions, pivot, collision/interaction states, frame duration if animated, and renderer metadata.
4. For tiled ground, recreate/normalize on a real tile grid and **test seamless joins**. For prefab architecture, use individually sized and anchored objects instead of claiming tileability.
5. In a 320×180 viewport, validate scale/readability, state changes, collision interaction and performance, then mark that derived output PROTOTYPE-USABLE or PRODUCTION-READY as evidence supports.
6. Add direct derived file links to the central Asset Library and Master Production Board; retain P10 as immutable visual source.

This package doesn't redesign the three canonical playable heroes.
