**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *03 Visual Direction and Assets/00 Asset Production Plan and Style Lock/14 — Visual Style Lock — Amazing Mirror-Era Pixel-Art Contract* (https://docs.google.com/document/d/1TYZcSUJ6pRxWCp76f2mrvwAAz90PRCYVRAWiejmJFFI/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

CURRENT OWNER OVERRIDE — NO OWNER SIGN-OFF GATE (22 NOV 2026)

Art can be USED immediately by Claude/other builders as a provisional choice, and improved/replaced later. Previous 'owner explicitly approves before next stage' instructions are superseded. The 0–20 style review score is an INTERNAL QC tool only, not permission gating. Continue character, environment, animation and UI batches as needed. Technically flattened concept images remain reference/placeholder assets unless rebuilt into layers and aligned tiles. Rejected styles, IP copying and iPhone unreadability remain warnings. Shared Claude→ChatGPT asset request protocol: https://docs.google.com/document/d/1oBpJKI2P7v7rwoMku-TbcFuVQe2iajddK6v2i5Ro0G0/edit.

IRREVERENTS — VISUAL STYLE LOCK

Production-facing visual direction and generation rules \| Proposed until owner signs off on test images \| 22 November 2026

# Why this document exists

The user liked the EARLIER sprite-and-environment reference that looked substantially closer to Kirby & the Amazing Mirror and specifically rejected the more recent anime/cartoon-looking fantasy paintings and hero illustrations. Preserve the accepted visual grammar at normal gameplay size, not as a high-fidelity promo illustration.

The objective is an original side-scrolling game that belongs visually in the early-2000s bright GBA pixel-platformer family while using legally distinct original characters and world assets. The reference is about environment density, limited chunky pixels, readability, silhouette, layout and palette, NOT copying Kirby, Waddle Dee or any existing franchise asset.

# Primary approved art reference

[https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view](https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view)

Do NOT treat the later large character sheet with anime faces, flowing hair and dramatic illustration as a new direction. Conceptual content from recent renders is usable only if reconstructed in the selected pixel grammar.

# Visual north star

A screenshot should immediately read as a SIDE-VIEW PLAYABLE PLATFORM GAME: level-scale characters on platforms, crisp pixel clusters, solid tile-based terrain, readable foreground geometry, whimsical color, and secret-filled background depth.

Characters are small, iconic sprite-sized figures, not anime protagonists, “chibi” illustration portraits, super-deformed comic art or high-detail full-body fantasy character drawings.

Environments can be magical, strange, beautiful and lively—but the player clearly sees what is floor, what is solid, what is a doorway, where to jump, and how to get around.

The appealing simplicity of the older reference is more important than adding detail.

# Positive attributes to insist on

- View: strict, readable 2D horizontal side-on, with occasional layered parallax backdrop. Not isometric, top-down or perspective cinematic framing.

- Pixel language: deliberate hard-edged pixels and visible pixel clusters; repeatable pixel density; no soft airbrush edges, antialiased painting or gradient-heavy smoothing.

- Forms: tiny, expressive, simple silhouettes; accessories must read on sprites no more than a handful of tiles tall; chunky readable animation frames.

- Terrain: clearly modular grassy edge, dirt/stone/brick block faces, platforms, step ups, doors, caves, ladders, signs and props. Clean collision boundaries.

- Palette: bright clear sky blues, greens, turquoise, lavender, amber, deep purples and blues for shadow; pleasant contrast. Avoid neon-glow everywhere and muddy gray/brown dullness.

- Depth: foreground game plane, midground architecture and background distance; never let decor crowd out character and collision reads.

- Effects: pixel stars, dust, directional speed lines, small flashes and carefully timed big impacts; use more power, not more blur.

- World complexity: secrets layered into an inviting world; the art should provoke investigation without displaying every answer explicitly.

- Characters: original, playable, expressive without resembling or directly reproducing recognizable Kirby characters.

# Negative attributes — hard rejection

- Anime faces, huge stylized anime eyes, flowing separated hair strands, glossy human skin, intricate anime costumes, dynamic manga perspective.

- Glossy 3D toy aesthetic, clay figures, plastic dolls, CGI concept art, film-poster lighting.

- Generic modern “cute cartoon” illustration with vector-clean rounded gradients or huge head portraits; not the same as crisp compact pixel-game stylization.

- Overdetailed RPG hero lineups, realistic adult human proportions, gigantic detailed anime character art taking half the screen.

- Modern splash art, key art, cinematic vistas with tiny unreadable gameplay, wide-angle or isometric world dioramas.

- Super-busy illustration collage, multiple unrelated styles on one page, random labels, fake UI, oversaturated flares obscuring walkable geometry.

- Unapproved logos or names baked into the world as canon; no words inside sprite source frames.

- Kirby lookalike as the protagonist, recognizable copied enemies, maps or Nintendo assets. Inspired grammar only.

- Inconsistent pixel grid / pseudo-pixel brush strokes on high-res painting.

# Important word clarification

The user said “I don't want anime or cartoon.” Read this as rejection of the recent anime-inspired character illustrations and generic illustrated cartoon promo aesthetic; it does NOT reject cheerful, iconic and expressive GAME BOY ADVANCE pixel sprites. The approved older Amazing Mirror-like style is the controlling interpretation. Ask before changing the aesthetic into semi-realistic human figures.

# Candidate technical pixel benchmarks (NOT LOCKED)

Reference screen-size option A: 240 × 160 internal GBA-era composition for style target.

Reference production-friendly option B: 320 × 180 16:9 internal view using the same simple tile/sprite design language.

Initial tile test: 16 × 16 pixels; some 8 × 8 detail subtiles where helpful. Main playable sprites roughly 20–40 pixels high in native reference framing. None of these dimensions are fixed; actual engine/game feel and owner-approved proof images determine them.

Inspect at original size and integer nearest-neighbor upscales only. A giant sharp 1536px output is not proof of consistent native pixels; the art must be reconstructible cleanly at intended resolution.

# Art layering requirements

The image must help an artist isolate gameplay layers: collision/ground; walkable platforms; interactive objects; characters; foreground decorations; background depth; lighting/VFX; optional UI. When a generation is used only as a concept screenshot, layers may be painted together. When calling something a tile or sprite sheet, request discrete separable objects, a consistent grid and a neutral or transparent background; validate manually before claiming implementation-ready.

# The preferred test scene — S00-01

Side-view GBA-like grassy ruins route in daylight, with a flat ground platform, one step-up, one bridge gap, a false wall or vent hint, a small arched door, a background ruin, and just one original compact character at normal platformer sprite size. Environment occupies most of the screen; NO title, panel, text, HUD, labels or promotional composition. Three spatial depths. High legibility.

Ideally the player could trace a credible walking/jumping route directly from the image. Avoid grand floating-sky overworld panoramas: those may be pretty but don't test platform assets.

# Suggested production prompt for S00-01

“Create ONE original 2D side-scrolling platform-game gameplay screen as a crisp, deliberately pixelated early-2000s handheld 16-bit fantasy action-platformer. Use compact bright, cheerful GBA-style sprite and tile art, visible chunky pixel clusters, cohesive pixel scale, blue sky, green grass-over-soil platform tiles, simple mossy stone ruins, one bridge gap, one elevated ledge, one small arched doorway, one subtly suspicious cracked tile, a distant parallax backdrop, and one tiny original non-anime playable sprite standing naturally on the ground, about 28 pixels tall in intended native gameplay scale. Strict side view, level geometry readable at handheld size, vivid but controlled palette, simple clean pixels, expressive small shapes, original character design, no recognizable franchise characters. It must look like a real traversable in-game screenshot, not promotional art. No labels, typography, HUD, borders or poster layout. No anime, cinematic lighting, gloss, 3D rendering, painterly gradients, tall detailed humans, large portraits, isometric perspective, tiny unreadable pathways or overdone particles.”

# The paired character proof — S00-02

Use the same established grass/stone world floor, lighting and sprite size. Show six DIFFERENT original small playable silhouettes with clear role hints, each presented first as normal in-level sprite, then with a handful of simple, consistently proportioned idle, walk, jump or action frames. Avoid any giant portrait panel. Two candidate designs get quick 3-frame animation direction; the other four are idle pose explorations.

A character should be distinguishable by silhouette at game scale and should be simple enough for an actual pixel artist to animate economically.

# The paired throne-room proof — S00-03

Take the successful S00-01 pixel grid and room scale into the palace: flat side-on horizontal traverse across throne platform, knight, wizard/props, overhead suspicious architectural feature, stained glass behind throne and visible caged dragon area below or nearby. Include 2–4 tiny playable originals as in-game sprites—not human fantasy illustration figures. Add a clear walkable passage and a hidden-access clue. No words/cutscene captions.

Test whether this iconic opening level could hold stealth, theft, suplex knockback, broken scenery and an escape route without losing visual clarity.

# Review scorecard, 0–2 per category

R1 Looks like a playable GBA-era side-scroller at first glance.

R2 Matches earlier approved pixel reference more closely than rejected anime/cartoon images.

R3 Tiny original sprite shapes remain readable at normal scale.

R4 Terrain is visibly modular / clearly walkable and jumpable.

R5 Pixel cluster size and outlines consistent across characters, props and terrain.

R6 Environment reads across foreground, midground, background without visual clutter.

R7 Color feels cheerful and magical but combat still can read.

R8 Concealed curiosity exists without blatant marker arrows.

R9 Scene is original: not traced or directly copying Kirby-specific character/map assets.

R10 Team can identify what should become layers, tiles, objects and state changes.

Total possible 20; use this as a helpful internal evaluation score, not an owner-approval prerequisite. Claude may use and improve art immediately.

# What to generate first and what NOT to generate

First: S00-01 gameplay screenshot; then style revision; then S00-02 tiny character silhouettes; then S00-03 throne room side-on level proof.

Not first: full cinematic map paintings, poster illustration, narrative montage, giant fight scene, villain portraits, mass character lineup, merch/logo, 20 biomes or marketing art.

Build reusable tiles and interactive objects immediately as needed; iteratively refine the visual direction during implementation.

# Quality and provenance notes

Store prompt, date, style reference, asset ID, approval state and changed requirements alongside each batch. Preserve rejected tests in a separate “Rejected / superseded” subfolder and do not present them as endorsed design. Generated images may have inconsistent grid, impossible sprite animation, fictional labels or misaligned tile seams; those defects must be corrected by artists or production scripts before using them in-game.

VISUAL DENSITY REVISION — 22 NOVEMBER 2026 (USER FEEDBACK)

The owner found the newer restrained pixel-style tests decent but noted that Kirby & the Amazing Mirror is better at NOT overstimulating. Priority: LOWER visual noise, fewer competing details, and more rest space while retaining charm. Build visual hierarchy around floor edges, player sprites, important threats and true interactables; backgrounds should be comparatively quiet and lower contrast. Use large simple shapes, fewer small ornaments, fewer banners and flowers, selective highlights, less sparkle/glow, fewer bright competing hotspots, and a small number of prominent secrets. Keep color differentiation clear but not every object saturated equally. A scene should feel delightful and legible at handheld resolution even when action erupts. Keep the most spectacular impact VFX as an occasional contrast against a calm baseline. These are feedback-driven design constraints, NOT owner approval of any newly generated specific environment.

Five calmer environment exploratory assets: https://drive.google.com/drive/folders/11Wli0oy1WAtgIHT4ZUPX5Nprs0nM3RBD

Next refinement: compare quiet environment against actual Kirby & the Amazing Mirror screenshots at native game resolution for foreground/background contrast, sprite-to-scene ratio, relative empty area, and subtlety of detail. Avoid defaulting to greater detail and luminous ornament whenever another image is generated.

OWNER REVIEW CANDIDATES S00-01 — 22 NOV 2026

Two narrow gameplay-scale grassy-ruins IMAGE PROOFS and phone-sized 320x180 previews are available at https://drive.google.com/drive/folders/1BCT_Sao2sZNCygUCv0qSQcECtIlsmc2j. They are authorized for immediate prototype use, but remain flattened illustrations rather than validated tile-grid atlases or separate sprites. Prefer a review of candidate B for the calmer screen, but the owner remains final authority. The owner has authorized use by default; there is no owner-approval gate. Continue with the next asset stages while recording technical limitations.
