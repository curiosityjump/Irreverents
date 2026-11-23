# P02 — Sprite visual sources (not final engine sprites)

Date: 2026-11-23. Owner instruction: retain this specific expressive, bright, small-scale GBA-era pixel-art visual family; do not generate flat rectangles, over-detailed anime characters, or generic mismatched sprites.

## What's here
Four exact recent generated source sheets: two character pose rows (scout and rogue); terrain and platform prefab shapes; expressive VFX and pickups; and ruins/wood props. Their layout, linework, shading, material language and poses are positive directional examples for future sessions, alongside earlier uploaded comps and the already-extracted P01 kit.

## Critically important
These four sheet PNGs are **visual source plates**, not guaranteed engine-ready assets. Some contain transparent-looking checker remnants, dark/colored fringing and imperfect variable alpha; their sizes are **1448x1086**, not a native tile grid, and their contents are not split into aligned collision-ready sprites. Do NOT import the entire sheet as if it were a usable atlas. Do not mark a sprite request completed with one of these boards alone.

## What IS already usable
P01 Ruins Starter Kit, including 14 separate hero state PNGs, 2 strips, 12 props, 8 terrain prefabs and 4 VFX sprites, plus atlas, metadata and a minimal browser demo. Check the central `ASSET LIBRARY — START HERE (Claude)` document for the exact up-to-date links and file statuses.

## Reproducing and converting this look
1. Open ALL relevant visual comps and existing P01 art, not just read this README. Choose one primary category reference, one secondary cross-check. Art should be compact, playful, original, sharply outlined in navy/near-black, with simple expressive faces, saturated accents, well-clustered shading, leafy lime green, cool lavender stone, amber wood and calm less-detailed backdrops.
2. Generate just one small cohesive set per request: e.g. 7 expressive poses of ONE original character, 8 modular terrain elements, 10 separated props or 8 VFX; do not generate another explanatory image or labeled concept poster unless the request specifically wants it. Demand plain transparent background, evenly separated full objects, no board framing/text, consistent camera/lighting and pixel scale. Original character design only; never reproduce Kirby-owned shapes/identities.
3. Inspect the actual output visually and at gameplay display scale. If transparent-style sheets contain checker patterns or edge contamination, remove and repair halos, normalize alpha and manually verify edges after extraction; do not blindly remove every dark pixel (outlines may also be dark).
4. Cut into truly separate RGBA PNGs. Crop without cutting off extremities, normalize baseline and pivot, normalize native size (P01 currently uses 48×48 hero state cells; final engine grid is a separate decision), use nearest-neighbor only when scaling, and preserve named state ordering. For terrain, use a regular tile grid ONLY when seam/adjacency testing proves it. Otherwise keep them as honest prefabs, not seamless auto-tiles.
5. Assemble a gameplay-scale 320×180 composite plus nearest-neighbor 4× contact preview and inspect native assets against approved stylistic comps. Test silhouette consistency, frame-to-frame movement, no stray alpha, reasonable collisions/anchors, and iPhone touch overlays.
6. Include sprites, strips/atlas, exact JSON manifest (frame coords, intended anchor/pivot and collision approximations, status), preview and README. Label `GAME-USABLE PROTOTYPE` only if individual PNGs are clean and valid; `SOURCE-ONLY` for these four plates.
7. Upload to a named functional Drive folder. Update root asset index and the request doc with DIRECT links to every important product and the canonical version; add short date/time + links to project changelog. Do not wait for owner preapproval, but never call source-only art engine-ready.

## Current version policy
P01 is the first playable prototype asset pack and the recommended source for code integration; P02 is visual reference material to guide future sprite/tileset refinement. Retain both links; do not silently replace a stronger prior version with a lower-quality image.
