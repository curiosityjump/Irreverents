IRREVERENTS — P07 ASSET DROP
First-Playable NPCs, Enemies, Interactables, Terrain and HUD
Produced 2026-11-23

STATUS: VISUAL SOURCE SHEETS — individual sprites/true tile grids not independently QA validated

FILES
- colorful_chibi_npc_sprite_sheet.png: Compact townsfolk/guards/king animation concepts; rows of poses (1448x1086, RGBA)
- chibi_enemy_animation_sprite_sheet.png: Enemy and villain pose source rows (1448x1086, RGBA)
- vibrant_platformer_interactables_sprite_sheet.png: Doors, switches, alarms, props, pickups; illustrated state examples (1448x1086, RGBA)
- pixel_art_platformer_tileset_atlas.png: Outdoor/grass, stone, town and castle modular-looking scene pieces (1448x1086, RGBA)
- irreverents_pixel_ui_atlas.png: Party portraits based on canonical three heroes, health, controls, powers, attention indicators (1448x1086, RGBA)

HANDOFF RULES FOR CLAUDE
- These are original PNG source images in the correct compact 2D style. Use them immediately as REFERENCES for implementation and source extraction.
- Do not treat the artwork as automatically game-ready because the name says "atlas". A true importable sprite/tileset requires individual frames, tested alpha, pivots and manifest entries, and 16px tile seam verification where needed.
- Keep the previously owner-locked top goggled red-scarf, middle green-hooded and bottom pink-aviator playable heroes unchanged. These are supporting NPC/creature/environment/UI assets, not replacements.
- Each batch has a JSON manifest with precise filenames. Locate exact Drive file URLs in the project's Asset Library and P07/P08 delivery folders.
- Integrate the best image crops/sprite extractions into the browser game, not the entire 1448x1086 board as one sprite texture unless using it transiently for QA. Test at 320x180 iPhone gameplay scale.
- Mark the board status as SOURCE REFERENCE AVAILABLE (not final) until conversion/testing is complete, and update the source request and changelog with exact integration paths when it is truly done.
