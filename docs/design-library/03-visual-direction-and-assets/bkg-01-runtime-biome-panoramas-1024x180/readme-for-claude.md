# Irreverents — BKG-01: Eight usable biome panorama backgrounds

**Delivered:** 2026-11-23. 8 independent, tested 1024×180 opaque PNG panoramas and 8 lossless WebP alternatives. Each is wider than the game's logical 320×180 viewport, allowing 704 px of horizontal camera scroll.

### Where things are
- `backgrounds/<biome>_1024x180.png` = **LOAD THIS IN GAME**. 1024×180 RGBA PNG, solid alpha, no old sheet grid/labels.
- `backgrounds/<biome>_1024x180.webp` = same image, lossless WebP for browser bandwidth.
- `previews/<biome>_viewport_start|center|end_320x180.png` = screenshots of REAL crops from the asset, not AI mockups. Use to inspect actual game framing.
- `previews/all_8_center_320x180.png` = visual comparison of all eight 320×180 center previews.
- `source_crops/<biome>_source_crop.png` = cleaned high-res original crop, preserve if source needs re-editing.
- `demo/index.html` = a local browser preview; open through a static HTTP server or copy `backgrounds/` next to the HTML.
- `manifest.json` = exact file names, dimensions, crop source, hashes and camera limits.

### Drawing in the iPhone web game
```js
const LOGICAL_WIDTH = 320, LOGICAL_HEIGHT = 180;
ctx.imageSmoothingEnabled = false;
const cameraX = Math.max(0, Math.min(704, Math.round(worldCameraX * 0.35)));
ctx.drawImage(biomeImage, -cameraX, 0); // image is 1024x180
// draw actual SOLID terrain, player, enemies, props and HUD over the background
```
The canvas itself may be scaled up with CSS for a physical iPhone viewport; preserve 16:9 and `image-rendering: pixelated`. Don't stretch 1024 px directly into 320 px; scroll across it.

### Honest limits
These are **flat scenic panorama backgrounds**, not separate near/mid/far parallax layers, and not traversable terrain. The illustrated floors and platforms are backdrop art only: implement separate collision/tile data for physical interactions. Pan and CLAMP the x offset; left/right artwork isn't seamless and should not repeat. You can use one entire panorama as one camera region immediately; for a longer level, stitch authored transitions or design more panorama panels.

The original 1448×1086 grids contained four wide scenes each. We extracted their inner artwork while discarding the white divider gutters and panel borders, and resampled to the fixed runtime dimensions. No new stylization, character redesign, or generator placeholder art was added.
