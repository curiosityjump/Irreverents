**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *34 — Art Production SOP — Reproduce the Owner-Endorsed Pixel Look* (https://docs.google.com/document/d/1SinRhkiHFGlbZfsvYziXlSlVxerQG7J2vSgl3KxlWVo/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

TOP PRIORITY UPDATE — EXPRESSION AND CHARACTER ACTING (23 NOV 2026)

The owner explicitly wants characters with more expressive FACES (the wide emotional range of Kirby, without copying Kirby character or sprite designs). Beyond already-endorsed compact sprites, make eyes/mouth/head react visibly to joy, surprise, focus, sneaking, attack effort, hurt, victory, and comedy at actual iPhone game scale. Real variety per playable character and real facial motion across frames; avoid reusing identical blank eyes/mouth in every animation pose. The P01 pack is usable but an expressive face upgrade is due; don't pretend it already exists. Full required spec, example expression table, references and implementation/testing guidance: https://docs.google.com/document/d/1W1rOej7YL6MGcvwZfbpBTBqMyMz9Q_O2zpLNCZ2XNL8/edit

ART PRODUCTION SOP — REPRODUCE THE OWNER-ENDORSED PIXEL LOOK

Irreverents \| Controlling visual creation and delivery recipe \| 23 November 2026, America/New_York

Use this alongside the existing technical visual QA gate. No owner approval needed to proceed, but visual and technical quality are still required.

# 1. THE EXACT REFERENCE CORPUS — OPEN REAL IMAGES, NOT JUST DESCRIPTIONS

The user explicitly said ALL SIX of these are GOOD DIRECTIONALLY, NOT PERFECT FINALS. They are now preserved unchanged in Drive.

A00 folder: https://drive.google.com/drive/folders/1ejWvlQBo85YiC_5dsTxZFZugwFxKS1pB

A00-01 Castle vault stealth gameplay + calm/suspicious/alarm states: https://drive.google.com/file/d/1P21VRQFcVSMoKP0hx3RRVy5C9lzC1iTy/view

A00-02 Acquired power icons, themed enemies, guards, town NPC reactions: https://drive.google.com/file/d/12dykuEr3C7-Wi_73Sa8SZS3WQwDxYy1G/view

A00-03 World map, co-op gameplay scenes, touch-scale HUD, escalation: https://drive.google.com/file/d/1l3v1P34IyDFD\_\_62pfCdQgjJEtFr2NAP/view

A00-04 Small charismatic characters with STRONGLY DISTINCT ACTING POSES: https://drive.google.com/file/d/15hT8ORwyDGnZpJ-tkIEOPyT5eqzazPE2/view

A00-05 Environment diversity, prop vocabulary, roster/UI planning: https://drive.google.com/file/d/14WR_z8jpH8pUbbaOJ14EZqq4z_RZUzFy/view

A00-06 Grassy ground, stone architecture, ramps and modular terrain: https://drive.google.com/file/d/1Tp-1nw25b6h0KhqT5diryEj0uNBta6G9/view

Original earlier approved pixel-art direction: https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view

Open the earlier five quiet environment studies: https://drive.google.com/drive/folders/11Wli0oy1WAtgIHT4ZUPX5Nprs0nM3RBD

P01 actual extracted usable prototype assets: https://drive.google.com/drive/folders/1sXUTCyW2FTt0xuBauWfgSrUpfVw3ET43

P02 four more high-detail source sprite plates: https://drive.google.com/drive/folders/1XQc2TZEkYJA2ZF9KvDOMHRPcEo_Q8msv

The entire Drive's current routing index: https://docs.google.com/document/d/1bnr7GUgrYBVVY0BMkwx4qRPvW45Nk4grn-Tk6THcoY8/edit

Before producing or commissioning, visually inspect at least TWO directly relevant A00 comps, one actual P01 reference, and one rejected anti-example if applicable. Do NOT treat example characters, names or narratives as canonical designs; preserve visual grammar, make original characters.

# 2. THE ART DNA — THIS IS WHAT "LIKE THESE" MEANS

A clean 2D HORIZONTAL SIDE-VIEW platformer. At phone play scale the character is small and lovable, with immediately distinct silhouettes and recognizably different motion. Light cream/orange faces, tiny clear eyes and expressive accessory silhouette. Dark navy outlines, just a few confident highlight/shadow clusters; lively bold color, without painterly 3D lighting or an anime/modern mobile-game look.

The environment is an inviting, vivid fantasy platform world: lime/spring-green grass with cooler deep-green lower fringe; warm amber/orange earthy rock; lavender/periwinkle stone blocks; blue sky/calm mountain or city depth; clear doors, bridge, stairs, ledges, vent, arch and passages. Props use the same outline thickness, saturated trim, highlight direction and camera angle.

Characters/accessories: substantial readable head/body masses, scarves that fly, cap/hood shapes, strong posing, delightful collision/throw impacts. Animation must show REAL changing actions—not same rectangle translated. Keep simple facial shapes at small resolution.

The background is QUIET relative to the foreground. Don't wallpaper with sparkling details, tiny clutter and saturated highlights. Leave empty air around where characters jump. Platform boundaries, guards' vision cones and player position must be obvious at 320×180.

Strong scene composition = logical reachable platforms, simple collision-relevant silhouettes, distinct foreground/background layers and art-driven personality. No giant art-board interface framing in actual game sprites.

# 3. WHAT TO AVOID — VISUAL NEGATIVES

Reject box-figure characters, coarse 2-color rectangles, minor 1-pixel fake animation changes, giant anime-style heads/hair, highly rendered fantasy posters, semi-3D plastic shading, random palettes, excess bloom/noise, tiny unreadable scenery and untraceable board collage parts.

Reject source images showing baked labels/checkerboard/background halos as engine assets. No recognizably Nintendo-copyrighted character art or copied trademark artwork. Story labels and mechanisms depicted on comps are illustrative only, not automatically approved gameplay canon.

Rejected C02 heroic sprites (for grid layout reference ONLY): https://drive.google.com/drive/folders/1D34ZytHeo2RUD2un9ox20sB4TD3bajpn

# 4. WHAT TO GENERATE — SOURCE PLATES AND FINAL FILES ARE DIFFERENT STAGES

For a NEW artistic source, generate ONE narrow cohesive batch (e.g., 1 character with 7 meaningful poses; 8 terrain elements; 8-12 props; 8 effects). Use actual A00/P02 references in the generation request if supported, rather than only a generic style phrase.

For character source, state the same color/material/accessory identity in every frame; show idle, walk A/B with distinct legs and arm swing, dash, attack, jump and crouch (or user's specified states), right-facing with consistent feet baseline. Crisp chunky hand-placed pixels, thick dark outlining, separated poses, no typography or background/cell borders. Source can be high resolution for visual design; final frames must be normalized for the game.

For terrain source, show grass top, side/corner, bridge, stairs, varied rock and platform pieces separated against a plain clean backdrop; specify their purpose as prefabs or true 16×16 seamless tiles. Do NOT claim repeating seams/16px grid unless you tested it.

For props source, show individually separated door, arch, pillar, lantern, crates, barrel, chest, sign, ladder and banner, no cast shadows baked outside intended sprite boundaries, no labels.

For VFX source, show separate impact, crescent slash, fireball, ice eruption, puff and sparkle; readable silhouettes and transparent backdrop.

A source plate may look excellent yet still require alpha cleanup, cropping, resizing, color correction, real animation and atlas assembly. Track as SOURCE-ONLY until those are done.

# 5. CLEAN EXTRACTION / ENGINE-READY PACKAGING

P01 is the existing working example of this output structure, not the ultimate final artwork: https://drive.google.com/drive/folders/1sXUTCyW2FTt0xuBauWfgSrUpfVw3ET43

P01 contents VERIFIED in Drive: 2 heroes × (idle, walk_a, walk_b, dash, attack, jump, crouch) = 14 individual PNG frames; 2 native 7-state strips; 8 terrain prefabs; 12 props; 4 effects; static atlas; manifest JSON; 320×180 game preview; minimal mobile/keyboard browser demo and ZIP.

Current hero state cells are 48×48, not a declaration of final world pixel grid. Technical sizes follow the current game code or REQ; don't scale every new sheet to arbitrary dimensions.

Each engine-ready sprite is an actual separate RGBA file with a transparent background, visually repaired edges, uniform action framing, consistent visual pixel density and stable baseline/pivot. Remove checker remnants and chromatic artifacts, but preserve dark outlines. Validate alpha and filenames. Do not blindly threshold all near-black pixels.

Produce animation as separate purposeful frames; state strips alone are not automatically a fluid 6-frame walk cycle. Test animation motion and body consistency. Provide atlas coords, pixel dimensions, timing if animated, pivot and approximate collision box in machine-readable JSON. Terrain must be seam-tested before calling it an auto-tileset. Otherwise call it prefab art and document distinct collision rules per shape.

Preview actual sprite frames side-by-side on a neutral transparency-check backdrop, plus at least one actual 320×180 calm gameplay scene. Also supply a 4× nearest-neighbor preview and optional GIF showing run/attack as appropriate. Never substitute a hallucinated image-generation review board for inspection of the actual extracted PNGs.

# 6. QUALITY CHECKS — INDEPENDENT PRODUCER QA, NOT AN OWNER GATE

Visual checks: A00 comparison is clearly recognizable, original whimsical identity, strong silhouette, expressive differentiated states, coherent palette/outlines, correct platform collision readability, controlled background clutter. Weak art should be reworked even if technically packaged.

Technical checks: exact files and frame count, valid transparent pixels, no stray halos/checkers, proper native cell alignment, explicit tiles vs prefabs, source and runtime file provenance, complete manifest, browser preview actually loads, no broken resource links and phone-scale readability.

Avoid "game-ready" claims solely on sheet generation. P02 image-generated sheets are currently visual SOURCE-ONLY and contain alpha artifacts; P01 is a separable GAME-USABLE PROTOTYPE with some limitations (only two walk poses; terrain not seamless autotile).

Owner policy: use and iterate by default. Do not demand sign-off before creation or integration. Claude may use P01 immediately; future production may replace it once better assets validate.

# 7. EXACT FILE ROUTING FOR ALL FUTURE SESSIONS

Preferred Google Drive hierarchy:

00 OWNER-ENDORSED STYLE COMPS — A00 = exact six user-designated direction images, unmodified.

P01 — Ruins Starter Kit (Playable Prototype) = actual importable frames/props/terrain/VFX/manifest/demo/ZIP.

P02 — Reviewed Sprite Visual Sources (Extract Before Import) = latest four source-only generated sheets, an alpha/provenance manifest, README.

P03+ = each future distinct production batch of actual sprites/tiles/VFX with its own individual PNGs, atlas, manifest, preview, README and version.

Always create/update a CURRENT preferred entry in the root ASSET LIBRARY INDEX with name/ID/category, direct file URL, source comp(s), version, source request, actual game use and technical status. Don't rely on one folder or obscure ZIP.

For each requested delivery: source check → source-art design → extraction → visual/technical QA → upload → catalog update → request doc with links → status DELIVERED → move to delivered folder → dated Eastern-time changelog entry. If visual/technical validation fails, keep request open and mark in progress, don't silently label source plate final.

# 8. REPRODUCIBLE ART-DIRECTION PROMPT PATTERN — EXAMPLE, NOT ENGINE API

"Create a set of ORIGINAL compact side-view pixel game assets for Irreverents, using these actual images as the shared style refs: \[A00 appropriate direct links\]. Match the small, playful early-2000s handheld fantasy-platformer look: dark navy crisp outlines; lime grass, purple stone and warm golden wood; confident pixel clusters and distinct material shading; tiny expressive faces; bright foreground over a restrained clear background; correct relative scale to a 320×180 iPhone game view. Create exactly \[one named set\], each object separated and consistent in camera, lighting, palette and proportions. For characters provide \[exact named poses\] with genuinely different limb/body acting and feet baseline; for terrain provide \[exact tile/prefab list\]. Do not include labels, a poster border, HUD, extraneous figures, cast-backdrop, or franchise-owned characters. Keep outputs visually elegant and mechanically readable; subsequent steps will crop, alpha-clean and validate files before importing."

When tool can take actual reference images, supply the images rather than only pasting their URLs. Preserve links in the REQ and manifest.

# 9. ROLES

ChatGPT asset production or scheduled request desk: read this recipe + A00 + asset catalog every time, use actual picture references, produce/inspect, route and log. Claude: check catalog before writing code/new requests; integrate latest usable P01 or P03 assets rather than poor placeholders, and update actual GitHub paths after importing. User can critique or replace after use; no preapproval gate.

GitHub→Railway web deployment is separate from Drive art storage. Drive upload alone never proves a live build was updated.
