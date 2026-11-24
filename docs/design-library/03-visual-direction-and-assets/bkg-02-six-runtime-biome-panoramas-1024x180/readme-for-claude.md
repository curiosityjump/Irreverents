# BKG-02 — Six Ready-to-Import Biome Backdrops

**Use directly:** `backgrounds/*_1024x180.png` or the matching lossless WebP. Each is exactly **1024×180**, fits the fixed **320×180** gameplay camera vertically and offers **704px horizontal scroll range** (at a 1:1 pixel unit). Do not horizontally wrap/repeat these—left/right edges do not tile seamlessly. Original 2172×724 images and uncropped ratio-preserving 1024×341 reductions are also included.

**Biomes and tags:** Search `tag_index.csv` or `manifest.json`: forest ruins/day, market town/day, ice cavern, volcanic forge/sunset, moonlit stronghold, and sky islands. The exact full-source provenance, pixel dimensions, framing crop and three 320×180 snapshots are listed per item in the manifest.

**Engine example:** For each parallax-free static background, draw the preframed 1024×180 image behind separately collision-mapped foreground game platforms. Clamp camera-x offset between 0 and 704. If camera moves farther, design/extend a new scene or transition instead of repeating a visible seam. Mobile canvas: render a 320×180 logical camera and scale to screen without changing ratio. For wider/shorter viewports, adapt the camera bounds deliberately.

**Artwork caveats:** Image-generated scenes are rich pixel-style illustrations that have been correctly resized and cropped. These are **independently importable static background images** but **not** collision geometry, native 16×16 tile maps, true parallax layers, animation, or visually seamless repeating textures. Some foreground-like architecture/grass is baked into each picture and must remain non-collidable; avoid placing actual walkable gameplay geometry directly on a misleading painted platform without aligning proper collision. Nothing has been committed to GitHub or play-tested on a real iPhone by this producer.

The `previews/` folder has left/center/right 320×180 viewport checks and a 6-biome contact. Preserve the original sources. Update Master Board BKG-02 tracking and link actual game repo paths after Claude imports.
