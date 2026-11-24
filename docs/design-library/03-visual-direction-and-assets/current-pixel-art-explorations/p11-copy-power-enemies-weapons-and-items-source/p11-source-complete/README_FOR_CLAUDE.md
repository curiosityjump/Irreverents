# P11 — New enemy powers + weapons + item uses (SOURCE ONLY)

Four art sources the owner specifically asked to upload and route. **Do not use these as already-validated runtime sprite atlases.** The 1448×1086 PNGs are source grids; outline/alpha artifacts and nonuniform frame layout require technical extraction. `manifest.json` and `tag_index.csv` describe what is shown and suggested use.

- `P11-01 chibi_elemental_enemy_sprite_atlas.png`: six elemental/stealable power families (fire, ice, spark, water, leaf, wind). Actions, impact/KO, power badge.
- `P11-02 chibi_enemy_sprite_atlas_sheet.png`: bomb, cutter, stone, beam, wheel, shadow power enemies.
- `P11-03 flame_knight_weapon_sprite_atlas.png`: weapon appearances for unheld pickup, held by character, activated/attack, projectile/effect, and inventory tile; examples shown for blade, hammer, spear, boomerang, bomb, wand, cannon, shield, hook, torch, parasol. The flame enemy in demo images is NOT a replacement playable hero.
- `P11-04 twelve_row_pixel_art_item_sprite_sheet.png`: cloak, whistle, key, orb, crystal, potion, bomb, spring, battery, magnet, portal device and feather; pickups/active state/dropped & icon views.

## Claude implementation
1. Search the root ASSET LIBRARY index or the named folder, use this tag index to locate a category.
2. Extract 1 native RGBA sprite per true animation frame / item state; repair alpha fringe; choose actual engine grid; align feet/item grip / projectile muzzle separately.
3. Define per-asset `idle`, `attack_windup`, `attack_active`, `attack_recovery`, `hurt`, `ko`, `power_id` and `dropped_ability` where applicable. All different power behaviors remain gameplay design decisions; art itself does not grant abilities.
4. For items create named states `ground_pickup`, `held_*` (where character overlay fits exact canonical H01/H02/H03), `thrown_flying`, `impact`/`used`, `inventory_icon` only where the sheet actually supports them; add missing frames as production work.
5. Test 320×180 on iPhone, update production board and asset status; log exact GitHub path only when actually imported. No claim of deployment or finished animation made by P11 upload.
