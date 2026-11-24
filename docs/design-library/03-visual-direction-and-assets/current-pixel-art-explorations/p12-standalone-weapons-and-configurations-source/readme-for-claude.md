# P12 — Standalone Weapon Families and Configurations

**Actual art included:** 3 original RGBA source sheets + 12 separately browsable weapon-family row crops, grouped by `P12-A/B/C`, plus JSON and searchable CSV. All weapon art is **character-agnostic**: NO playable hero or enemy is baked into these objects.

## Direct categories / filenames
- **P12-A — melee/defense:** sword, hammer, spear, shield (`kirby_style_weapon_atlas_sprite_sheet.png`).
- **P12-B — thrown/ranged/utility:** bomb, boomerang, hook/grappler, cannon (`colorful_pixel_weapon_sprite_sheet.png`).
- **P12-C — magic/utility:** star wand, torch, parasol, arcane wand (`arcane_weapon_sprite_atlas.png`).

Use `tag_index.csv` (one row per weapon) for discovery by type; `manifest.json` for provenance and the character-agnostic state/attachment contract. The per-weapon `family_rows/*.png` files are *source row crops*, **not** gameplay-ready sprite frames.

## Engine rule — must survive every later conversion
1. Each weapon is its own rendering and gameplay object. No hero, hands, or NPC is drawn into these asset files.
2. Produce world/dropped state, orientation/readied state, activation/attack state, impact/spent variants and icon as appropriate for its behavior. Do NOT require a bogus projectile state for an immovable shield or a 'broken' state for an indestructible wand.
3. Native asset names should look like `WPN_sword_ground.png`, `WPN_sword_ready_r.png`, `WPN_sword_swing_00.png`, `WPN_sword_inventory.png`.
4. In JSON, provide weapon-specific `grip_anchor`, `pivot`, `native_dimensions`, projectile rotation pivot, `collision_hitbox`, and whether the sprite can flip. The actual character rig provides only `hand_anchor` and separate body/arms poses; match H01/H02/H03 without redesigning them.
5. Test actual native objects with EACH of the three canon heroes (and NPCs) at the game viewport of 320×180 on iPhone.
6. Ground art shouldn't include baked HUD rings, impact flares or cast shadow unless deliberately required. Layer VFX independently so assets can be reused.

## Visual QA / technical status
The source sheets are 1448×1086 image-generated illustrations with real alpha but substantial partial-alpha fringe contamination and uncertain row/column alignments. They are NOT 16×16 tile atlases, NOT genuine fixed-cell runtime animation strips, and NOT guaranteed to be fully game-ready. The row crops preserve the originals without repairing them. Native extraction and QA is a separate production task; do not mark WPN-001 delivered solely from this upload.

## Canon and priority
The owner specifically rejected weapon art baked into a particular bearer. The present pack supersedes carrier-embedded examples as the **preferred standalone weapon source**. Character designs remain locked in the H01/H02/H03 Canon Hero folders.

## Integration and handoff
Check **IRREVERENTS Master Asset Production Board**: WPN-001 and the related INT-015, HRO-006, PWR-001/002/003 references. Upload *finished extracted* weapon state files to a dedicated `Weapons / Native Runtime` folder, retain source provenance in the manifest, verify code import and update the Board + Asset Library + root changelog. GitHub/Railway integration must be reported only when Claude verifies it.
