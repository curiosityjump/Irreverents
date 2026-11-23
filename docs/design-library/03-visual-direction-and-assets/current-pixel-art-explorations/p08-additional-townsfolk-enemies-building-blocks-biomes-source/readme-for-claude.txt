IRREVERENTS — P08 ASSET DROP
Additional Townspeople, Enemies, Town/Castle Blocks and Region Biomes
Produced 2026-11-23

STATUS: VISUAL SOURCE SHEETS — not verified native-size seamless tiles or production frame atlases

FILES
- vibrant_chibi_townsfolk_sprite_atlas.png: Additional civilians and professions: baker, smith, merchant, scholar, farmers, musicians, royal, healer and traveler poses (1448x1086, RGBA)
- chibi_enemy_animation_sprite_atlas.png: Additional foes: signaler, ranged, armored, bomber, beasts, skeleton and caster poses (1448x1086, RGBA)
- colorful_retro_fantasy_tileset_atlas.png: Town, castle interior and exterior, wooden/tavern props and architecture (1448x1086, RGBA)
- chibi_pixel_biome_tileset_atlas.png: Ice, lava, ancient ruins, purple dungeon modular-looking scene pieces (1448x1086, RGBA)

HANDOFF RULES FOR CLAUDE
- These are original PNG source images in the correct compact 2D style. Use them immediately as REFERENCES for implementation and source extraction.
- Do not treat the artwork as automatically game-ready because the name says "atlas". A true importable sprite/tileset requires individual frames, tested alpha, pivots and manifest entries, and 16px tile seam verification where needed.
- Keep the previously owner-locked top goggled red-scarf, middle green-hooded and bottom pink-aviator playable heroes unchanged. These are supporting NPC/creature/environment/UI assets, not replacements.
- Each batch has a JSON manifest with precise filenames. Locate exact Drive file URLs in the project's Asset Library and P07/P08 delivery folders.
- Integrate the best image crops/sprite extractions into the browser game, not the entire 1448x1086 board as one sprite texture unless using it transiently for QA. Test at 320x180 iPhone gameplay scale.
- Mark the board status as SOURCE REFERENCE AVAILABLE (not final) until conversion/testing is complete, and update the source request and changelog with exact integration paths when it is truly done.
