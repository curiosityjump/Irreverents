**Reference.** The map the art lanes follow: for every asset the game draws or plays, the approved Drive source it comes from (or should come from), and which lane switches it. Open it when you touch any art or sound; update a row when you switch an asset.

> **Filed in the Drive, 2026-11-23 19:09 UTC:** the 27 needs with no approved source, plus 8 the art builders reported while cutting from the sheets, are the Google Doc **"REQ — MISSING-ASSETS — Game needs with no approved asset yet (master list)"** in 01 REQUESTS: https://docs.google.com/document/d/1d94gDFA54-xtJJsDMhvo6Y8YJizC_TbDRfMyLkRCtCQ/edit . The Drive changelog entry for it is NOT made (the connected account can only view the changelog; the owner was asked). This map was taken from `main` between about 17:15 and 18:30 UTC on 2026-11-23, while Step 8 round 3 was landing: rows marked "approved-source-not-used" for heroes, town people, the five former rectangles, the bell, plates, gate, counter, HUD faces and effects have since been switched (1b2c1c6, d80a79d, cf38dc4, 0b28225, 224f542, 6153027, ae6147e). Re-check a row against `main` before acting on it.


# Asset coverage: approved sources for every game asset

The owner, 2026-11-23, about 17:10 UTC, first-hand: *"I'd like everything to utilized the approved assets in the drive. If there is anything for which there is no approved asset. Start a list of those in the drive that is properly routed so it can be found and worked on."*

Compiled 2026-11-23 (main at ffb21ac), while Step 8 round 3 was re-authoring art in five lanes, from a two-pass check of every plate in `docs/design-library/` (mirror synced at 0372804). **Approved** means the A00 owner-endorsed comps, P01, the P03/P04/P05/P07/P08 source plates, doc 36's canon heroes (the P03 hero sheet; `p03-canon-hero-extraction-partial/` as QA reference), and whatever the root *ASSET LIBRARY — START HERE (Claude)* lists as current or strong. Never a source: anything marked REJECTED, OFF-STYLE or SUPERSEDED (Superseded Style Explorations, P06 drift, C02 v1 heroes).

Statuses:

- **uses-approved**: the shipped asset is cut from approved material. The lane column lists any defect or owed frames.
- **approved-source-not-used**: an approved source exists (given with its region) but the game still draws its own, or uses only part of it. This is extraction work for the named lane, not a Drive request.
- **no-approved-source**: nothing approved covers it. It is on the Drive master list *REQ — MISSING-ASSETS — Game needs with no approved asset yet (master list)* in `06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS`, under the MA id shown. When ChatGPT marks an MA item DELIVERED there, the lane named here integrates it.

Rows go stale as the look3 lanes push: re-check a row against the current file before cutting, and update it when you switch an asset. Boxes are sheet pixels, (x0,y0)-(x1,y1) or (x0,y0,x1,y1). BKG-01, P10 and TRN-* files are on the Drive only (not in the mirror) and need a design-library sync before use (`docs/mechanisms/design-library-sync.md`).

## Counts

| Category | Total | uses-approved | approved-source-not-used | no-approved-source |
|---|---|---|---|---|
| Heroes and playable cast | 8 | 5 | 3 | 0 |
| NPCs and enemies | 9 | 8 | 1 | 0 |
| Bodies (things you lift, hit or stand by) | 7 | 1 | 4 | 2 |
| Ground tiles (16 px) | 6 | 2 | 4 | 0 |
| Backdrops | 14 | 0 | 14 | 0 |
| Interactive looks (props) | 29 | 20 | 7 | 0 |
| Decor | 43 | 12 | 25 | 6 |
| Effects | 9 | 5 | 4 | 0 |
| UI and HUD | 44 | 9 | 31 | 4 |
| Sound effects | 42 | 29 | 7 | 6 |
| Music | 8 | 0 | 0 | 8 |
| **All** | **229** | **95** | **98** | **30** |

## Path keys

| Key | Path |
|---|---|
| `A00/` | `docs/design-library/03-visual-direction-and-assets/00-owner-endorsed-style-comps-a00/` |
| `CPE/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/` |
| `P01/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p01-ruins-starter-kit-playable-prototype/` |
| `P03/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/` |
| `P04/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p04-cantina-props-vehicles-hall-visual-source-sheets/` |
| `P05/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/` |
| `P07/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/` |
| `P08/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p08-additional-townsfolk-enemies-building-blocks-biomes-source/` |
| `EQ/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/quiet-pixel-art-environment-studies-reduced-visual-noise/` |
| `S00/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/s00-01-gameplay-references-use-now-revise-later/` |
| `U08/` | `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/u08-01-touch-controls-ready-for-prototype/` |
| `H07/` | `docs/design-library/03-visual-direction-and-assets/h07-hall-of-legends-concept-studies/` |
| `A01/` | `docs/design-library/03-visual-direction-and-assets/audio/a01-01-first-sfx-pack/a01-01-complete/` |

## The missing list (Drive)

| MA id | Game id | What | Priority | Board id |
|---|---|---|---|---|
| MA-01 | `look:ui-use` | 'Use' touch button glyph | SOON | UI-001 (as a U08-01 REVISION) |
| MA-02 | `look:font` | Game pixel font (dark and light) | SOON | UI-014 (new row: game pixel font) |
| MA-03 | `decor:camp-tents` | Bandit Camp tents | SOON | INT-016 (new row: Bandit Camp prop kit) |
| MA-04 | `decor:camp-palisade` | Camp palisade (sharpened log stakes) | SOON | INT-016 (new row, camp kit) |
| MA-05 | `decor:camp-weapons-rack` | Camp weapons rack | SOON | INT-016 (new row, camp kit) |
| MA-06 | `music:outdoors` | Outdoors / town area theme (stems + stumble + snap_back) | SOON | AUD-002 |
| MA-07 | `music:castle` | Castle interior area theme | SOON | AUD-002 |
| MA-08 | `music:alert-layers` | Stealth and pursuit layers (per area theme) | SOON | AUD-002 |
| MA-09 | `music:cantina` | Cantina tavern band + Smash-style brawl version | SOON | AUD-004 |
| MA-10 | `sfx:cantina-out` | Brawl KO sting, home-run sting, respawn blip | SOON | AUD-004 (also AUD-001's unmet 'KO') |
| MA-11 | `music:outpost` | Outpost scouting drone + villain anthem | SOON | AUD-002 |
| MA-12 | `music:quarry` | Quarry level area theme (with sneak and pursuit layers) | SOON | AUD-006 |
| MA-13 | `music:king-march` | Royal audience march (2-3 minutes) | SOON | AUD-002 |
| MA-14 | `music:hall` | Hall of Legends ambience + 'legend recorded' fanfare | SOON | AUD-006 |
| MA-15 | `sfx:cantina-brawl` | Brawl start and end stings | BACKLOG | AUD-004 |
| MA-16 | `sfx:grab-refused` | Grab strain (too heavy to lift) | BACKLOG | AUD-007 ('Grab strain') |
| MA-17 | `sfx:plate-down` | Pressure plate down (A01-01 REVISION, with MA-18) | BACKLOG | AUD-001 (its unmet 'lever' deliverable) |
| MA-18 | `sfx:plate-up` | Pressure plate up (with MA-17) | BACKLOG | AUD-001 (its unmet 'lever' deliverable) |
| MA-19 | `sfx:flap` | Flyer wing flap | BACKLOG | AUD-008 (new row: flyer flap/glide sounds) |
| MA-20 | `ui:sound-button` | Sound on/off button | BACKLOG | UI-013 (audio mute) |
| MA-21 | `ui:page-surround` | Page ground tile + thin game frame | BACKLOG | UI-016 (new row: page ground and game frame) |
| MA-22 | `ui:start-title` | 'Irreverents' title wordmark (DRAFT until the owner picks it) | DELIVERED 2026-11-24 (the owner's title screen; in the game) | UI-015 (new row: start-screen title wordmark) |
| MA-23 | `sprite:dummy` | Training dummy (light) | BACKLOG | INT-017 (new row: training dummies, light and heavy) |
| MA-24 | `sprite:dummy-heavy` | Training dummy (heavy) | BACKLOG | INT-017 (new row, with MA-23) |
| MA-25 | `decor:portraits` | Framed portraits (throne room, Hall gallery) | BACKLOG | INT-010 (royal room prop set) |
| MA-26 | `decor:cobweb` | Corner cobwebs (undercroft) | BACKLOG | ENV-006 |
| MA-27 | `decor:cantina-mirror` | Small mirror behind the cantina bar | BACKLOG | HUB-001 (also INT-012) |

## Heroes and playable cast

Canon identity is doc 36 and the P03 hero sheet; A00-04 and P05-RARE show the same three people and are approved pose sources.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `sprite:grappler` | uses-approved | `P03/pixel-heroes-action-sprite-sheet.png` TOP ROW (cut window y 210-415; 13 column centres x 68-1362, +/-75 px; tools/art/heroes p03.py + canon.py). QA reference: `p03-canon-hero-extraction-partial/`. | look3-heroes: done (1b2c1c6, 891894c, bcb1f65). Native-edit frames remain (run phases 3/6, carryRun, throw wind-back/release, held, grab heave, tumble); take the approved poses in the next row. Real launch/prone/recover art is HRO-006/HRO-007 (board Not started, no REQ). |
| `sprite:grappler-unused-approved-poses` | approved-source-not-used | `A00/a00-04-playable-character-expressiveness-and-pose-study.jpeg` row 1: run x3 (x 425-700, y 450-565); crouch/jump/land (x 715-1015, y 400-565; land ~905-1010; drop dust and '!!'); opaque JPEG, key the pale-blue ground. `P05/p05-rare-powers-pickups-source.png` y 220-330: hit/gasp x 55-190 (cut the spark), knocked flat x 200-300, recovered x 490-595, item held up x 605-750 (cut the orb). | look3-heroes, brief amendment or push 4: add both plates to p03.py's sources; use for run phases 3/6, a land frame, hurt/down/tumble, gasp face. SOON. Not usable: A00-04 blaster shot, P05-BRAWL punch (duplicates P03 c7). |
| `sprite:infiltrator` | uses-approved | `P03/pixel-heroes-action-sprite-sheet.png` MIDDLE ROW (cut window y 470-675, same columns; chest cut from c9, slash fx removed from c7). | look3-heroes: done (bcb1f65). Left: own lift/carry/throw pose (cheer stands in), run phases 3/6, held, tumble; see next row. Crawl/vent (HRO-002): only A00-01's PURPLE-hooded player shows it, a motion reference only, so it stays native drawing. |
| `sprite:infiltrator-unused-approved-poses` | approved-source-not-used | `A00/a00-04-playable-character-expressiveness-and-pose-study.jpeg` row 2: run x3 (x 425-700, y 690-805); crouch/jump/land (x 715-1015, y 630-805; land ~905-1010); sneak tiptoe (x 1030-1170, y 700-805; drop the ticks and small sack); sack heave (x 1215-1400, y 680-805). Take the face from P03 (her scarf sits higher here). | look3-heroes, brief amendment: run phases 3/6, land, grab heave, a sneak frame for hide-move; downscale to 23 px with p03.py, clip with canon.fit(). SOON. |
| `sprite:flyer` | uses-approved | `P03/pixel-heroes-action-sprite-sheet.png` BOTTOM ROW (cut window y 730-935; coin cut from c9, gust fx removed from c7). | look3-heroes: done. Fly/glide and wing-beat cycle, run 3/6 and her own carry/throw are owed by REQ C02-04 (HRO-003). Only other approved pose: A00-04 top line-up wings-open stride (x ~750-910, y 130-275), an extra stride/flap key. |
| `sprite:hero` | approved-source-not-used | `P01/p01-complete/sprites/heroes/scout_7states_48px.png` (7 cells 48x48: idle, walk_a, walk_b, dash, attack, jump, crouch; hard alpha). Anchor (18,19). | look3-heroes, brief amendment (its section 4 says 'leave them'): tools/art/heroes/make.py copies the scout strip; hero.json 48x48, idle [0], run [1,2,3], air/jump [5], hide [6], talk [0]. Zero-art alternative: point hero.json at the canon grappler. BACKLOG (fallback players never see). |
| `sprite:brawler` | uses-approved | `P04/cantina-npc-sprite-sheet.png` row 3, the bald strongman: idle (48,593)-(216,790), walks (244,599)-(400,790), (427,597)-(565,790), fists up (583,605)-(777,790), punch (776,606)-(980,790), yell (1022,614)-(1209,790), KO (1206,687)-(1411,790) (cut3.py brawler()). | look3-cast: tumble and the curled held still owed (unblocked: the actors validator a59a302 is on main). |
| `sprite:skirmisher` | uses-approved | `P04/cantina-npc-sprite-sheet.png` row 2, the feathered-hat patron: idle (66,349)-(229,545), cheer (268,360)-(447,545), side-eye (499,359)-(645,545), punch (692,356)-(922,545), knocked flying (932,353)-(1142,520), KO (1161,420)-(1388,545) (cut3.py skirmisher()). | look3-cast: tumble and held owed. Run slides (the plate has no walk); P04 row 4's bard dash (x ~766-991, y ~840-1040) is a stride reference only, re-dressed, never cut as-is. |

## NPCs and enemies

All cut from P03/P07 plates by tools/art/cast/cut3.py. Every cast body still owes tumble (4-frame spin) and the curled, kicking held; both are unblocked (a59a302 on main; the cast README's grep misses it). Motion reference for tumble: `P05/p05-brawl-hit-ko-respawn-source.png` top row.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `sprite:king` | uses-approved | `P03/retro-town-npc-sprite-sheet.png` row 3: idle (35,580)-(189,765) ... worried (1059,599)-(1208,765) mood 2, rage (1237,601)-(1402,765) mood 3. Down: `P07/colorful-chibi-npc-sprite-sheet.png` row 5 (1279,795)-(1412,870). | look3-cast: tumble + held. Unused approved poses: P07 row 5 hurt-with-star (x ~1040-1150), sceptre swing (x ~760-915) for hurt and attack. |
| `sprite:guard` | uses-approved | `P03/retro-town-npc-sprite-sheet.png` row 2: idle (33,353)-(147,512) ... spear thrust (589,368)-(729,512), swing (725,370)-(875,512), flat KO (1278,425)-(1432,512). | look3-cast: tumble + held. Unused: `P07/colorful-chibi-npc-sprite-sheet.png` row 3 hurt with star (x ~1045-1150, y ~403-532). |
| `sprite:shopkeeper` | uses-approved | `P03/retro-town-npc-sprite-sheet.png` row 1: idle (115,98)-(286,280), cheer (349,110)-(525,280), worried (602,107)-(773,280), angry charge (880,107)-(1055,280), KO (1110,172)-(1318,280). | look3-cast: tumble + held. For Step 18 slice D's broom swing: P07 colorful-chibi row 2 broom swing (x ~745-900, y ~236-369) or row 1 pan swing (x ~749-902, y ~58-196), re-dressed in her headscarf and apron. |
| `sprite:villain` | approved-source-not-used | Body is approved: `P03/pixel-villain-sprite-sheet.png` row 1 (horned hood): idle (22,151)-(152,290) ... worried (1131,165)-(1240,290); unused rage with fire aura (x ~1269-1433, y ~95-290) = mood 3. KO: `P07/chibi-enemy-animation-sprite-sheet.png` row 6 (1296,965)-(1429,1040). The drawn top hat and dehorning come from no approved source. | look3-cast follow-up (decisions-log undo): cut3.py villain() returns p, not tophat(dehorn(p)); drop the drawn hat at the KO; mood-3 idle/talk from the plate's rage pose; cell back to 56x48; re-check height vs the guard (scale ~0.3 if short); log it. The orchestrator settles the brief's top-hat silhouette against the owner's 17:10 rule. |
| `sprite:outpost-fighter` | uses-approved | `P07/chibi-enemy-animation-sprite-sheet.png` row 1, red-hood bandit (y ~73-176): idle 34-123 ... slash 819-937, recover/thrust 952-1048, KO 1291-1412 (scale 0.32). | look3-cast DEFECTS: attack frames 25-26 (+89-90, 145-146) are sliced by erase box (880,79,940,176): mask only the crescent's blue/white or use thrust 952-1048. Walk w3 erase (367,150,395,176) takes the boot: mask only the dust. Then tumble + held. |
| `sprite:outpost-lookout` | uses-approved | `P07/chibi-enemy-animation-sprite-sheet.png` row 2, winged-cap signaller (y ~236-352): idle 28-122 ... horn up 679-790, blow 807-907, KO 1290-1413 (scale 0.285). | look3-cast DEFECT: blow frames 26-27 (+90-91, 146-147) lose the horn's bell to erase box (880,230,920,352): reuse horn-up 679-790 or mask only orange ticks beyond x ~905. Then tumble + held. |
| `sprite:heavy-fighter` | uses-approved | `P07/chibi-enemy-animation-sprite-sheet.png` row 3, plumed armoured knight (y ~381-540): idle 24-142 ... swing 823-955, KO 1297-1427 (scale 0.25). Alt: `P08/chibi-enemy-animation-sprite-sheet.png` row 4. | look3-cast DEFECT: swing frames 25-26 (+89-90, 145-146) lose the club to erase box (912,416,960,540): mask only the crescent's yellow/white. Mood 3 has no own pose. Then tumble + held. |
| `sprite:brute` | uses-approved | `P03/pixel-villain-sprite-sheet.png` row 3, horned armoured brute (y ~551-750): idle 25-185 ... slam 804-1022, airborne hurt 1029-1196, KO 1219-1417 (scale 0.235). | look3-cast DEFECT: slam frames 25-26 (+89-90, 145-146) lose the hammer head to erase box (900,700,1030,750): mask only the flash or start the box at y >= 740. Moods 2/3 are edits (plate has none). Then tumble + held. |
| `sprite:toll-keeper` | uses-approved | `P03/pixel-villain-sprite-sheet.png` row 2, purple-hood grunt (y ~361-510): idle 85-200 and 268-380, ready 447-586, slash 622-783, hit 812-964, dash 1056-1163, shout 1224-1355 (scale 0.24). | look3-cast: down borrows P07 row 2's KO (winged cap shows): erase the wings and recolour the brim, or squash his own hit pose. Then tumble + held. |

## Bodies (things you lift, hit or stand by)

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `sprite:crate` | approved-source-not-used | `P07/vibrant-platformer-interactables-sprite-sheet.png` crate (620,480)-(735,590) idle, cracked (750,480)-(860,590) hurt, debris (870,490)-(1000,590). Alt: `P01/sprites/props/wooden-crate.png`. | look3-cast, a 'things' push (its brief names only people): replace things.py crate() with a source.py cut. |
| `sprite:crate-heavy` | approved-source-not-used | `CPE/cooperative-adventure-pixel-asset-studies.png` iron-cornered crate (835,455)-(895,525), ~0.35 to 24x24; hurt = P07 crack lines (750,480)-(860,590) over it. Alt: P07 push block (760,660)-(850,750). | look3-cast, the same things push. |
| `sprite:dummy` | no-approved-source | MA-23 | look3-cast once delivered (graybox-hall only). |
| `sprite:dummy-heavy` | no-approved-source | MA-24 | look3-cast once delivered (graybox-hall only). |
| `sprite:set-castle-town` | uses-approved | `P04/.../hall-of-legends-tile-atlas.png` (210,885)-(325,1062), 24x32 (`tools/art/sets/make.py`, Step 14 slice B push 3). | - |
| `sprite:set-iron-quarry` | uses-approved | `P05/p05-rare-powers-pickups-source.png` (181,8)-(286,134), scale 0.25 (`tools/art/sets/make.py`). | - |
| `sprite:set-bandit-camp` | uses-approved | `P04/.../hall-of-legends-tile-atlas.png` (326,925)-(420,1062), 16x20 (`tools/art/sets/make.py`). | - |
| `sprite:throne` | approved-source-not-used | `EQ/e-q01-quiet-throne-hall-clear-playable-platforms.png` throne (750,290)-(903,483), extract/redraw at 24x32 (~0.16); hurt = a small tilt. | look3-cast, the things push (throne.json is in its file list). |
| `sprite:signal-post` | uses-approved | `P03/pixel-villain-sprite-sheet.png` row 4 horn post (100,812)-(300,1032), horns removed (cut3.py signal_post()). | - |
| `sprite:pedestal` | uses-approved | `P04/hall-of-legends-tile-atlas.png` plain plinth, through the cut look `hall-plinth` (`assets/props/hall.png` (0,0) 12x18, `tools/art/props/loops.py`); content/sprites/pedestal.json, Step 7 push 3. The picture's frame is `hall-frame` from the same atlas. | - |

## Ground tiles (16 px)

Quarry and Cantina are already cut through tools/art/tiles/plates.py (ae6147e); the other four themes are still drawn in themes.py. Extraction for each: re-pixel the plate cells to 16x16, map to the master palette, build missing autotile cases from the plate's frame pieces, seam-test at 320x180.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `tiles:town` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` (14 cols of ~77 px from x 184; rows ~78 px from y 8): cobbles rows 0-1 cols 0-5; curbs rows 0-1 cols 6-10 and rows 2-3 cols 0-8; grate + manhole row 2 cols 9-10; curb over dressed stone row 3 cols 0-8 (top + deep); half-timber row 4; beams/posts row 5 (one-way); roofs row 6. Extras: `P08/colorful-retro-fantasy-tileset-atlas.png` rows 0, 2, 9; `P07/pixel-art-platformer-tileset-atlas.png` row 4 (x 416-1441, y 585-705). | look3-ground: add 'town' to plates.py PLATES/GRID; re-cut Town (block, street, roof, eave, deep, one-way). Keep assets/tiles/town.png ids and content/atlases/castle-street.json layout. |
| `tiles:grass-ruins` | approved-source-not-used | `P03/grassy-ruins-pixel-art-tileset-atlas.png` (grid already in plates.py): block row 4 cols 3-4 (lavender brick; quarry uses cols 0-2); lip row 0 col 0; fill marks row 4 col 9, boulders cols 10-11; one-way row 3 cols 4-8; drips row 6 cols 6-10; canopy bushes row 5 cols 9-11. Alt: `P07/pixel-art-platformer-tileset-atlas.png` row 3 (x 13-1078, y ~445-560), row 7 crowns/bushes/vines. Do NOT reuse the orange earth (it is the quarry's). | look3-ground: re-cut Ruins (block, lip, unders, one-way, deep) and canopy_region with _q()/_qbox() as Quarry does; the outpost inherits via content/atlases/outpost.json. |
| `tiles:castle` | approved-source-not-used | `P03/castle-interior-tileset-atlas.png` (14 cols of ~89 px from x 100; row bands y 15/108/200/302/391/479/569/716/851/960/1065): row 0 brick, cap, frame pieces; row 1 ashlar (floor body, deep); row 8 gold trim + corbel shelves (one-way); row 9 gold corners. Hall-gallery: `P04/hall-of-legends-tile-atlas.png` rows 0-2 and 8. | look3-ground: add 'castle' and 'hall' to plates.py; cut Castle incl. the 4 back-wall cells [0,6]-[3,6] (graybox-hall); give content/atlases/hall-gallery.json its own Hall sheet (HAL-001). |
| `tiles:cellar` | approved-source-not-used | `P08/chibi-pixel-biome-tileset-atlas.png` purple-dungeon kit, first row y ~890-945 (block + capstone x 28-210, narrow 218-292, ends 313-526, floating 550-1337) and second row y ~945-1010 (brick 36-202, panel 218-385, stairs 397-519); remap purple to the night ramp; ground cells only. Extras: P08 colorful-retro row 1 (x 871-1279) and row 9 grates; P03 castle row 0 cols 0-1. | look3-ground, or a round-4 ground brief (the undercroft is not one of its numbered items; the orchestrator adds it): a 'dungeon' entry in plates.py, cut Cellar (assets/tiles/cellar.png, content/atlases/undercroft.json). |
| `tiles:quarry` | uses-approved | `P03/grassy-ruins-pixel-art-tileset-atlas.png`: body row 1 cols 0-1, lip row 0 col 0, rubble row 5 cols 7-10, scaffold one-way row 5 cols 0-1, cutstone row 4 cols 0-2; cave region = the plate's earth toned to night (ae6147e). | look3-ground leftovers: inner corners from rows 0-2 cols 4-7; cave floor cap from P03 row 6 cave mouth (183-363, 632-813) or P07 row 2 (13-225, 300-420); ladders P03 row 5 col 3 or P07 row 2 (x 1302-1356, 1379-1431). |
| `tiles:cantina` | uses-approved | `P04/cantina-tavern-hub-tileset.png` (tavern grid in plates.py): floor boards row 4 col 9, body row 2 cols 0-2, rafters row 0 cols 9 and 13, wainscot row 1 cols 0-1. | look3-ground leftovers: one-way shelves from row 3 cols 0-15 (now drawn by plank_ledge); gold wainscot row 4 cols 0-7 unused. |

## Backdrops

All program-drawn today by tools/art/tiles/backdrops.py. Keep every file name so no content file changes. BKG-01 panoramas (Drive folder BKG-01, not in the mirror) need a design-library sync first; take crops from them, never repeat a panorama sideways (BKG-01's rule).

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `backdrop:sky-clouds` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` last-row cloud (1341,1008)-(1437,1056); `S00/s00-01b-grass-ruins-quiet-route-candidate.png` cloud rows (310-700 x 50-140, 650-830 x 240-290, 1040-1320 x 150-210, 1380-1650 x 30-110); `EQ/e-q05-floating-ruins-restrained-color-study.png` sky clouds (740-900 x 40-80, 1080-1400 x 0-90); BKG-001 clouds only. | look3-ground (last push) or a ground follow-up: rebuild make_clouds as a 320-wide wrapping strip; keep sky-clouds.png. |
| `backdrop:far-castle` | approved-source-not-used | BKG-007 market_town_day (Drive 1FV1mLbP8iNIIBD9s1L4tDshD_URJunjH) towers x 250-630, y 0-65; `EQ/e-q04-castle-gate-and-grass-modular-layout-study.png` (800-1260, 20-420); `EQ/e-q03-night-castle-courtyard-stealth-friendly-lighting.png` (700-1050, 120-300). | look3-ground items 3/4: replace make_far_castle; keep far-castle.png. Needs the BKG-01 sync. |
| `backdrop:town-mid` | approved-source-not-used | BKG-007 town band x 230-780, y 55-140 (leave out the parapet and banners); P10 TRN-07 (Drive 1MaFLMBETcxam9IDr3GCdzfyHDKlW3EY2); `P03/gba-town-street-tileset-atlas.png` half-timber y 325-400, roofs y 487-550, windows y 706-775. | look3-ground item 3: replace make_town_mid, hazed blue-cream with a dark foot; keep town-mid.png. |
| `backdrop:far-hills` | approved-source-not-used | BKG-001 ruins_day (Drive 1vEcoeP_Hv1_fvI0e1pFGwVVFzJoJVvJk) far band y 55-135, clean at x 230-590 and 800-920; `S00/s00-01b-grass-ruins-quiet-route-candidate.png` far band y 280-620, clean at x 300-680 and 940-1260; `CPE/recovered-prior-art-strong-visual-references/e00-grassy-ruins-and-crystal-citadel-gameplay-reference.png` y 220-560. | look3-ground items 3/4: replace make_far_hills; keep far-hills.png. |
| `backdrop:castle-mid` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` castle row (x 12-590, y 750-850), bushes for the hedge foot (237-480, 1003-1058); `EQ/e-q04-castle-gate-and-grass-modular-layout-study.png` wall (0-920, 300-930), tower (1260-1448, 20-930); `P08/colorful-retro-fantasy-tileset-atlas.png` arched walls (430-1430, 520-600); P10 TRN-05 (Drive 1nSjjdsFLAkpe79V8Ib_oG1SWOtthnJTg). | look3-ground item 3: rebuild make_castle_mid with a lit and a shade side per tower; keep castle-mid.png. The P07 row is in the mirror now. |
| `backdrop:front-foliage` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` last row (y ~1003-1058): bushes x 130-228, 237-318, 325-400, 402-480; flower clump 489-545; sprouts 555-684; vines 695-839. Dark value: `S00/s00-01b-...` foreground y 760-941. | look3-ground item 3: rebuild make_front_foliage; keep front-foliage.png. |
| `backdrop:castle-hall` | approved-source-not-used | `EQ/e-q01-quiet-throne-hall-clear-playable-platforms.png` stained glass (700-945, 20-380), arched windows (220-335 and 1310-1410, y 135-380), pillars (390-555, 1100-1265), drapes; `P03/castle-interior-tileset-atlas.png` wall fills y 16-208, arch windows (120-850, 575-700), banners (950-1345); `P04/hall-of-legends-tile-atlas.png` wall fills y 30-275, arches y 290-375. | look3-ground item 3: rebuild make_castle_hall (320x352); optionally a hall-gallery image from the P04 Hall atlas. Do not copy H07-01 (too dense). |
| `backdrop:cellar-vault` | approved-source-not-used | `EQ/e-q01-...` undercroft arcade (100-1255, 665-855); `EQ/e-q03-...` arcade (full width, y 790-941); `P03/castle-interior-tileset-atlas.png` arches y 208-412, lanterns y 725-825; BKG-005 moonlit_castle (Drive 1LTBQgypN2M3U3g_FyDtlb-KbVU9da4BN), wall over its sky openings. | look3-ground item 3: rebuild make_cellar_vault (320x352, cellar ramp, keep the candle niches); keep cellar-vault.png. |
| `backdrop:sky` | approved-source-not-used | `S00/s00-01b-grass-ruins-quiet-route-candidate.png` clear sky (300-1672, 0-280): sample 3-4 gradient stops; `EQ/e-q05-...` sky (600-1448, 0-150). Night if ever shown: `EQ/e-q03-...` (180-1060, 0-380) with moon (390-540, 20-170). | look3-ground item 4: re-derive make_sky_tall's six shades and cloud rows from S00-01B; keep sky-tall.png. |
| `backdrop:quarry-outdoor` | approved-source-not-used | BKG-008 iron_quarry_evening (Drive 1xRgKo3YsFROa3ZioILTr6plW_qyHL-KH): cliffs x 0-290 and 830-1024; scaffold + crane x 0-260; crane x 765-840; carts x 790-950, y 105-170; mountains/aqueducts x 200-1000, y 35-130; smoke x 640-800, y 0-60 (haze). Evening palette: re-tone. | look3-ground item 5: replace make_far_cliffs and make_quarry_mid with BKG-008 crops (or whole, repeatX:false); keep far-cliffs.png and quarry-mid.png. Needs the BKG-01 sync. |
| `backdrop:quarry-cave` | approved-source-not-used | `A00/a00-05-game-art-coverage-and-environment-variety.jpeg` 'Cavern / Dungeon' thumbnail (678-951, 667-782); `P05/p05-secrets-doors-breakables-source.png` crystal cave (528-753, 375-488), mine entrance (644-750, 78-169); `EQ/e-q02-sunset-ruins-and-bridge-simple-depth.png` cave (1435-1672, 410-620); `P08/chibi-pixel-biome-tileset-atlas.png` dungeon stone y 890-1060 for tone. | look3-ground item 5: rebuild make_cave_wall (and cave_strip); keep cave-wall.png and cave-strip.png. |
| `backdrop:quarry-tower` | approved-source-not-used | BKG-006 volcanic_forge (Drive 16E9xMQ6q94QuXUI3x5PTXcoa3lQJ3UBa) arcade y 0-110 (wall over the openings at x 250-470 and 690-760; leave out lava, banners, everything below y 140); `EQ/e-q01-...` warm tunnel (1400-1580, 400-620) and undercroft arches; `P03/castle-interior-tileset-atlas.png` wall fill y 16-208, torches y 725-825. | look3-ground items 1/5: rebuild make_tower_wall (at least 30 tiles tall, parallaxY); keep tower-wall.png. |
| `backdrop:cantina-wall` | approved-source-not-used | Only the wainscot band is cut. `P04/cantina-tavern-hub-tileset.png` plank walls row 1 (x 105-331 and 495-565, y 19-85), I-posts row 2 (x 1120-1344, y 94-160), brackets row 4, panelled wainscot row 5; `P08/colorful-retro-fantasy-tileset-atlas.png` plank wall (15-330, 15-100). | look3-ground item 2: paste the dark, dark2 and post cells make_cantina_wall already loads instead of the drawn rects; keep cantina-wall.png. |
| `backdrop:upright-tops` | approved-source-not-used | Crowns: BKG-002 (Drive 1QBksZpQXXWLveeM5zvnQ2qzTYl5paSNe) x 0-380 and 800-1024, y 0-70; `P07/pixel-art-platformer-tileset-atlas.png` tree (11-130, 945-1058). Street upper: BKG-007 houses (0-190 x 0-75, 930-1024 x 0-110); `P03/gba-town-street-tileset-atlas.png` half-timber and roof rows. Cantina rafters: `P04/cantina-tavern-hub-tileset.png` row 1 beams (573-1344, 19-85), row 2 posts (965-1344, 94-160). Hall vaults: `P04/hall-of-legends-tile-atlas.png` arches y 290-375; `P03/castle-interior-tileset-atlas.png` arches y 208-412; `EQ/e-q01-...` top band y 0-200. | look3-ground item 4: rebuild make_tree_crowns, make_street_upper, make_cantina_roof and make_hall_vault; keep their file names (content/backdrops/{courtyard,castle-street,cantina,hall-gallery}.json already point at them). |

## Interactive looks (props)

Cuts live in tools/art/props/drive.py, round3.py and looks_parts.py.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `look:signaler` | approved-source-not-used | `P03/pixel-villain-sprite-sheet.png` row 4: idle (100,800)-(285,1025), alert (455,800)-(645,1025), sounding (740,792)-(1015,1028), broken with fallen horn and smoke (1090,805)-(1335,1028). Alt: `P07/vibrant-platformer-interactables-sprite-sheet.png` horn idle (318,462)-(445,595), blowing (448,450)-(605,595) (drive.py horn_idle()/horn_blast() already cut them). | look3-props or loop-art-cutouts: replace the rotated/drawn sounding and broken frames in round3.signaler_frames() with the plate's own. |
| `look:door-enter-1x2` | uses-approved | `P07/vibrant-platformer-interactables-sprite-sheet.png` open arched door in ivy (212,242)-(388,412) (drive.door_enter). | - (per-room variety later: P04 hall arch (137,693)-(233,800), P03 castle arch (733,720)-(840,847), P03 town door (309,793)-(387,873), P04 cantina doorway (430,677)-(496,747)). |
| `look:door-enter-1x1` | uses-approved | Same P07 door, squashed to 18x10 (reads as a smear). | look3-props re-cut: `P07/pixel-art-platformer-tileset-atlas.png` small tunnel arch (197,880)-(293,933) or `P05/p05-secrets-doors-breakables-source.png` crawl arch (96,186)-(168,254) (key the pale ground). |
| `look:door-enter-2x2` | uses-approved | Same P07 door, stretched to 34x26. | look3-props re-cut: P05 secrets mine entrance (643,71)-(750,168) (drive.py already cuts it as level-entry-mine) or P07 platformer large tunnel arch (316,860)-(451,947). |
| `look:door-enter-3x2` | uses-approved | Same P07 door, stretched to 50x26. | look3-props re-cut: P07 platformer grassy cave tunnel (20,307)-(213,420) or `P03/grassy-ruins-pixel-art-tileset-atlas.png` cave mouth (182,655)-(400,800). |
| `look:window-1x3` | approved-source-not-used | `P03/castle-interior-tileset-atlas.png` narrow arched window (118,578)-(176,694), jamb rows repeated to 48 tall; alt `EQ/e-q01-...` tall windows (222,140)-(338,398), (1312,140)-(1425,398). Smashed state derived. | look3-props or loop-art-cutouts: cut in drive.py (low priority: no map room uses it). |
| `look:part:throne-room:window` | approved-source-not-used | Shape: `EQ/e-q01-...` tall window (222,140)-(338,398) or P03 castle window (118,578)-(176,694); glass: `P07/pixel-art-platformer-tileset-atlas.png` stained-glass arch (913,736)-(1040,843), `P08/colorful-retro-fantasy-tileset-atlas.png` stained glass (905,288)-(1008,392). Broken derived. INTENT: nothing points at it. | look3-props or loop-art-cutouts: replace looks_parts.stained() with the tall shape glazed from the P07/P08 cuts (srcimport.grab). |
| `look:hide-curtain` | approved-source-not-used | `P04/cantina-tavern-hub-tileset.png` plain curtain (885,600)-(943,670), stage curtain (1067,600)-(1155,670), curtained doorway (517,677)-(595,748); 1x2 = plain panel with its fold rows repeated. Front folds derived. | look3-props or loop-art-cutouts: replace looks_parts.curtain(). |
| `look:hide-1x1` | uses-approved | `P07/vibrant-platformer-interactables-sprite-sheet.png` rubble heap (1222,650)-(1395,760) (drive.hide_1x1). | - |
| `look:bell` | uses-approved | `P04/chibi-pixel-interactables-sprite-sheet.png` bell idle (1090,595)-(1250,780), ringing (1268,585)-(1440,780), broken (98,850)-(240,1015). | - |
| `look:plate` | uses-approved | `P04/chibi-pixel-interactables-sprite-sheet.png` plate up (28,230)-(172,322), down (210,235)-(358,322). | - |
| `look:gate` | uses-approved | `P04/chibi-pixel-interactables-sprite-sheet.png` bar gate closed (1072,172)-(1236,318), open (1265,175)-(1432,318). | - |
| `look:part:undercroft:stone-plate` (+`:down`) | uses-approved | `P05/p05-secrets-doors-breakables-source.png` bottom row, the plain stone slab (0,424)-(56,474); the plate cuts it off at the left, so its right end (22-56) is mirrored and a middle column repeated to 64x7 (drive.stone_plate()). `:down` is the same cut one ramp step darker. | props (second builder). |
| `look:part:undercroft:grate` (+`:open`) | uses-approved | `P07/pixel-art-platformer-tileset-atlas.png` bottom row, small barred grate (100,878)-(175,935) shut; `P04/chibi-pixel-interactables-sprite-sheet.png` row 3 riveted hatch (20,640)-(190,770) open, squashed to 32x16 (drive.floor_grate()). No plate shows the barred grate open. | props, when an open one lands. |
| `look:fence-1x2` (+`-broken-`) | uses-approved | `P08/colorful-retro-fantasy-tileset-atlas.png` row 1 diagonal-braced timber frame (1092,15)-(1178,110) to 16x32; broken: `P07/vibrant-platformer-interactables-sprite-sheet.png` smashed-crate plank pile (865,490)-(1005,600) (drive.fence()). | - |
| `look:stall-2x2` (+`-broken-`) | uses-approved | `P08/colorful-retro-fantasy-tileset-atlas.png` row 5 red-striped market stall (340,405)-(470,515); broken: the P07 plank pile (drive.stall()). | - |
| `look:barricade-1x4` (+`-broken-`) | uses-approved (extended) | `P08/colorful-retro-fantasy-tileset-atlas.png` row 1 plank wall (245,15)-(335,110), planks repeated to 16x64; broken: two P07 plank piles (drive.barricade()). No plate shows a timber barricade as such. | props, if one lands. |
| `look:crack` | approved-source-not-used | `P05/p05-secrets-doors-breakables-source.png` crack lines (454,189)-(536,254); `P07/vibrant-platformer-interactables-sprite-sheet.png` cracked stone (1090,655)-(1195,750); `P04/chibi-pixel-interactables-sprite-sheet.png` cracked block (557,640)-(700,771). Line only, thin, unhighlighted (INTENT). | look3-props, push 3 or round 4 (not in its brief): re-cut in looks_parts.py via srcimport.grab. |
| `look:rubble` | uses-approved | `P07/vibrant-platformer-interactables-sprite-sheet.png` rubble pile (1222,650)-(1395,760). | - |
| `look:shop-counter` | uses-approved | `P04/cantina-tavern-hub-tileset.png` counter panel (98,305)-(178,372). | - |
| `look:shop-goods` | uses-approved | `P04/cantina-tavern-hub-tileset.png` green bottle (1208,535)-(1258,602). | optional: `P03/pixel-art-vfx-and-pickup-atlas.png` corked flask (450,765)-(530,875), recoloured teal, is closer to the 'corked flask'. |
| `look:toll-post` | approved-source-not-used | Composition of approved pieces: `P04/chibi-pixel-interactables-sprite-sheet.png` bar gate (open (1270,175)-(1410,310), closed (1070,175)-(1240,310)) + `P07/pixel-art-platformer-tileset-atlas.png` notice board (920,867)-(1024,944) or signpost (820,867)-(893,944). New look id (DRAFT: toll-post). | look3-props draws the look; the Step 16 slice 2 owner switches road-toll from 'counter'. |
| `look:hoard` | uses-approved | `P07/vibrant-platformer-interactables-sprite-sheet.png` coin sack (787,980)-(867,1067), glowing (893,975)-(990,1067), open chest (380,40)-(500,200), empty chest (553,100)-(667,200) = taken; `P04/cantina-tavern-hub-tileset.png` coin heap (566,1040)-(643,1075); `P05/p05-secrets-doors-breakables-source.png` gold pile (657,429)-(746,471). | Cut (group `treasure`, loopshots `loops-treasure-4x.png`): Step 16 points depot-hoard at `hoard` instead of 'goods'. |
| `look:hall-picture` | uses-approved | Frame: `H07/h07-02-memorial-frames-importable-prototype/` (small_left, grand_center, small_right) or `P04/hall-of-legends-tile-atlas.png` gold-edged panels (367,119)-(424,186), (450,119)-(512,186). Contents stay drawn from data (INTENT: never stored pixels); bodies can use sprite frames. | Cut: `hall-frame`, `hall-frame-star` (group `hall`); look3-actors (src/client/draw/hall.ts) draws it. |
| `look:level-entry` | uses-approved | `P05/p05-secrets-doors-breakables-source.png` top row: arch (203,68)-(308,172), gem door (313,66)-(418,172), portal (528,68)-(632,172), mine (638,72)-(756,172). | - |
| `look:level-sign` | uses-approved | `P07/pixel-art-platformer-tileset-atlas.png` two-arrow signpost (815,860)-(895,958). | - |
| `look:level-pie` | approved-source-not-used | `P05/p05-d-ui-powers-exploration-preferred-sheet.png` rings: empty (138,463)-(205,532), quarter (208,463)-(276,532), three-quarters (276,463)-(344,532), full (342,463)-(410,532) (leave out the rays above). Half = empty + right half of full. | look3-props or loop-art-cutouts: point drive.level_pie() at P05 D (register it in srcimport.SHEETS) and delete the drawn redefinition. |
| `look:ride` | uses-approved | `P04/chibi-vehicle-and-mount-sprite-sheet.png`, the plate's 5x4 cells (cols x 49-257, 299-542, 565-824, 856-1133, 1154-1404; rows plane y 36-234, cart 309-493, wagon 566-744, mount 816-1036): idle, moving x2, crash, wrecked (loops.ride(), group `rides`). | Every cell has the goggled rider baked in: an empty machine and an empty saddle are on no plate (MA, missing list). `ride-wagon-empty` is a DRAFT edit of the idle cell (rider painted out: loops.ride_empty), drawn by src/client/draw/machines.ts for an empty seat; replace it when an empty wagon lands. |
| `look:guard-vehicles` | uses-approved (prototype) | `GV-01/runtime/vehicles/*-right-*.png` (and `patrol-trike-damaged`), 13 states of 4 empty guard vehicles, each shrunk x0.5 on half its canvas (loops.guard_vehicle(), group `guard-vehicles`). The pack calls itself PROTOTYPE-USABLE, candidate vehicles; no animation frames. | Nothing draws them yet. |
| `look:powers` | uses-approved | `P05/p05-rare-powers-pickups-source.png` (opaque pale ground, key (247,245,243)): row 1 fixtures y 8-134, row 2 orbs y 140-219, row 3 lost sequence y 223-326 (spark (146,225)-(192,290), stars (196,224)-(296,262), orb on its swoosh (353,223)-(452,326)), row 4 loose pieces y 338-426, row 5 pickup sequence and cloud poof y 426-512 (x boxes in loops.py). Group `powers`: pickup-*, item-*, power-fixture-*, fx-pickup-glow/-get, fx-power-lost, fx-poof. | The plate's row 5 runs off its bottom edge (the column and burst are cut at y 512). item-spring is mush at 16 px. No game code draws them yet. |
| `look:treasure` | uses-approved | `P07/vibrant-platformer-interactables-sprite-sheet.png` row 1 chests (wood closed (195,95)-(330,215), open (370,70)-(505,215), empty (545,95)-(670,215); iron the same at x 800-1290), row 2 doors (ring door shut (35,240)-(212,415), open (212,240)-(390,415), portcullis down (410,240)-(595,415), raised (600,240)-(785,415)), key (30,980)-(130,1065), coins (1005,985)-(1165,1065), sack (780,960)-(875,1075), gem on post (610,795)-(745,935); `P05/p05-secrets-doors-breakables-source.png` padlocked door (102,68)-(200,172), barred door (424,68)-(524,172), vault cave (526,372)-(758,482); `P04/chibi-pixel-interactables-sprite-sheet.png` crystal (240,380)-(320,470); `P04/cantina-tavern-hub-tileset.png` coin heap (566,1040)-(643,1075). Group `treasure` (loops.py). | `hoard`/`hoard-taken` (32x16: the sack on the heap; a few coins) are ready for depot-hoard, whose placement still says `goods` (Step 16's to repoint). P05's own vault gold pile sits on the cave floor and does not cut clean. |
| `look:hall` | uses-approved | `P04/hall-of-legends-tile-atlas.png` (opaque pale ground with drawn cell lines: key (247,247,247), grid=True), scale 0.2: plinths (38-272, 398-495), niches (610-1095, 395-497), plaques/shield/banners/drape (38-1320, 510-608), lantern/torch/braziers (40-610, 598-684), doors/window/portals (30-1125, 692-808), statues and keepsakes (35-1420, 885-1062), gold-edged frames (362-517, 114-192); per-piece boxes in loops.HALL. Group `hall`. | The wood doors lose their pale stone arch to the ground key (wood and gold rim only). Statues are thin at 0.2. hall-frame/-frame-star are about 14x16: small for a hall picture; scale up if the picture needs it. No game code draws them yet. |
| `look:piece` | uses-approved | `P05/p05-ui-hero-party-hud-source.png` bottom row: grey piece x 436-504, gold x 505-572, y 455-498 (the plate's edge cuts them below the side knobs; mirrored about y 498 to close). `piece-grey`, `piece-gold` 12x12 (group `levels`); `goods-special` is the hall-case-crown cut at 14x16 (group `treasure`). | At 8 px the piece is a blob, so 12. |
| `look:unseen` | uses-approved | `P07/irreverents-pixel-ui-atlas.png` stealth hood (1218,280)-(1306,364), its slot keyed (190,200,248) = `unseen` 14x12; yellow '!' bubble (1252,928)-(1330,1000) = `seen-mark` 12x12 (group `ui`). | No closed eye on any plate checked (P07 UI): the hood stands in for "unseen". |
| `look:hud-condition` | uses-approved | `P05/p05-ui-hero-party-hud-source.png` shield badges: grey (482,370)-(558,442) = fine, gold (568,365)-(648,442) = hurt, red (662,365)-(748,442) = down; key (245,245,244), 11x12, group `ui`. | - |
| `look:cage` | uses-approved | `P04/chibi-pixel-interactables-sprite-sheet.png` row 1 barred gate (1072,172)-(1236,318) = `cage-shut` (the gaps' dark fill cleared so the captive shows), open frame (1265,175)-(1432,318) = `cage-open`; 32x28, group `outpost`. | No plate shows a cage as such: this is the gate standing in. |
| `look:weapons` | uses-approved | `P12/` (`03-visual-direction-and-assets/current-pixel-art-explorations/p12-standalone-weapons-and-configurations-source/originals/`): A sword/hammer/spear/shield, B bomb/boomerang/hook/cannon, C star wand/torch/parasol/orb wand; rows y 40-280, 300-530, 545-785, 785-1030; nine state cells at x 15/170/305/455/610/760/915/1090/1265/1440 (loops.WEAPONS). Group `weapons`: ground, held, swing x2, impact, broken per weapon; bomb explosion, cannon blast. | No hand-held pose (by design: grip anchor), no grip/hitbox data, no separate projectile, no closed parasol. Nothing in the game draws a weapon yet. |

## Decor

DD below means: look3-props, later item (not in its brief yet): replace the decor_draw.py drawing with a srcimport.grab cut; same ids in content/decor and assets/decor/*.png.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `decor:house-fronts` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` half-timber/plaster (187,327)-(707,400), roofs (187,487)-(1260,547); `P08/colorful-retro-fantasy-tileset-atlas.png` walls (13,13)-(1000,100); `P07/pixel-art-platformer-tileset-atlas.png` shopfronts (420,587)-(1440,700). Grey toward far. | DD |
| `decor:interior-wall` | approved-source-not-used | `P04/cantina-tavern-hub-tileset.png` plank wall tiles (100,13)-(1340,160); `P08/colorful-retro-fantasy-tileset-atlas.png` plank wall (13,13)-(330,100). | DD |
| `decor:market-stall` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` striped awnings (193,553)-(1260,627) over counters (193,640)-(1260,700); `P08/colorful-retro-...` stall (349,407)-(477,513); `P07/pixel-art-platformer-...` awning shop (420,587)-(607,700); `CPE/cooperative-adventure-pixel-asset-studies.png` stall (940,620)-(1110,710). | DD |
| `decor:bunting` | approved-source-not-used | `P04/cantina-tavern-hub-tileset.png` bunting (1173,607)-(1340,655). | DD |
| `decor:display-cloth` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` striped stall cloths (1040,640)-(1260,700) (closest); `P04/cantina-tavern-hub-tileset.png` red cloth on a step (519,875)-(608,916). | DD |
| `decor:street-lamp` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` street lamp (740,873)-(787,1020); `CPE/cooperative-adventure-pixel-asset-studies.png` lamps (1160,540)-(1280,630). | DD |
| `decor:barrels` | uses-approved | `P01/sprites/props/big-barrel.png` and `small-barrel.png` (import_p01.py at 0.5, cleaned in 040bc8f). | - (cleaner alternates: P03 castle barrels (1167,987)-(1333,1053), P07 interactables barrel (1040,480)-(1135,590)) |
| `decor:lantern-post` | uses-approved | `P01/sprites/props/lantern-post.png` (import_p01.py at 0.75); the glow is a derived blend. | - |
| `decor:shutter-window` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` shuttered window (360,713)-(467,773); flower-box windows (193,713)-(1000,800). | DD |
| `decor:painted-door` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` closed arched door (200,793)-(273,873) (keep it plainly shut); `P08/colorful-retro-...` shopfront door (13,413)-(147,513). | DD |
| `decor:hanging-signs` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` blank hanging sign (200,873)-(313,940); `P08/colorful-retro-...` sign (607,427)-(673,493). Icons: `P07/vibrant-platformer-interactables-sprite-sheet.png` key (40,985)-(110,1060); `P04/cantina-tavern-hub-tileset.png` mug (1287,547)-(1327,593). | DD |
| `decor:chimney` | approved-source-not-used | `P08/colorful-retro-fantasy-tileset-atlas.png` stone chimney with red cap (644,224)-(693,287). | DD |
| `decor:planters` | approved-source-not-used | `P03/gba-town-street-tileset-atlas.png` planter (807,949)-(880,1013); `P08/colorful-retro-...` planters (1207,1007)-(1287,1053), urn (1300,1007)-(1360,1067). | DD |
| `decor:tree` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` tree (13,944)-(133,1053). | DD |
| `decor:ruin-arch` | uses-approved | `P03/grassy-ruins-pixel-art-tileset-atlas.png` vine arch (585,826)-(905,960) (round3.ruin_arch). | - |
| `decor:broken-column` | approved-source-not-used | column-broken is cut (`P03/grassy-ruins-...` pillar (995,826)-(1090,960)). column-stump is still drawn: cut the P03 pillar foot (1000,820)-(1087,953), or `P04/hall-of-legends-tile-atlas.png` broken column (1233,933)-(1320,1053). | look3-props or loop-art-cutouts: replace decor_draw.broken_column(False). |
| `decor:ivy` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` vines (693,980)-(933,1053); `P08/colorful-retro-...` vines (1120,1000)-(1193,1067); vine drapes on the P03 grassy-ruins arches. | DD |
| `decor:bushes` | approved-source-not-used | `P03/grassy-ruins-pixel-art-tileset-atlas.png` bushes (1000,560)-(1250,625); `P07/pixel-art-platformer-...` bushes (133,990)-(400,1053). | DD |
| `decor:flowers` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` flowers (400,1000)-(553,1053); `P03/gba-town-street-...` ground flowers (193,1027)-(1200,1067). | DD |
| `decor:grass-tuft` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` sprouts (553,1020)-(687,1053). | DD |
| `decor:banners` | approved-source-not-used | Red crown: `EQ/e-q01-...` banner (405,88)-(528,298) (twin ~(1135,88)-(1235,298)); `P08/colorful-retro-...` red banners (267,524)-(400,613) with the emblem swapped; `P01/sprites/props/red-banner.png`. Blue diamond: `CPE/cooperative-adventure-pixel-asset-studies.png` banners (1304,327)-(1433,427), recoloured. (P03 castle banners are purple, not red.) | DD |
| `decor:armour-statue` | approved-source-not-used | `P04/hall-of-legends-tile-atlas.png` knight statue (127,933)-(200,1053); keep far and greyed. | DD |
| `decor:torch` | approved-source-not-used | `P03/castle-interior-tileset-atlas.png` wall torches (320,727)-(480,820), lanterns (120,720)-(290,820); `P04/hall-of-legends-...` torches (213,604)-(347,673); `P07/pixel-art-platformer-...` torch (656,860)-(697,944). Glow stays derived. | DD |
| `decor:portraits` | no-approved-source | MA-25 | DD, once delivered. |
| `decor:castle-column` | approved-source-not-used | `P03/castle-interior-tileset-atlas.png` columns (1013,211)-(1333,387); `P04/hall-of-legends-...` pillars (40,400)-(593,493). | DD |
| `decor:carpet` | approved-source-not-used | `EQ/e-q01-...` red carpet on the throne stairs (720,470)-(930,610), as drop/mid/end pieces; `P04/cantina-tavern-hub-tileset.png` rug pattern (519,875)-(608,916). | DD |
| `decor:cobweb` | no-approved-source | MA-26 | DD, once delivered. |
| `decor:chain` | approved-source-not-used | `P04/cantina-tavern-hub-tileset.png` chain with hook (127,533)-(147,593); `P08/chibi-pixel-biome-tileset-atlas.png` chain (713,1033)-(833,1073); `P05/p05-secrets-doors-breakables-source.png` chains (375,268)-(482,354). | DD |
| `decor:cantina-bar` | uses-approved | `P08/colorful-retro-fantasy-tileset-atlas.png` bar (8,710)-(224,808), shelf counter (238,710)-(412,808); `P04/cantina-tavern-hub-tileset.png` bottle shelf (190,380)-(280,455), plate shelf (475,380)-(565,455). | - (the mirror is its own row) |
| `decor:cantina-mirror` | no-approved-source | MA-27 | look3-props (round3.mirror()), once delivered; dropping the mirror is also fine. |
| `decor:cantina-kegs` | uses-approved | `P08/colorful-retro-...` barrel rack (423,710)-(588,808); `P04/cantina-tavern-hub-tileset.png` keg (730,380)-(810,455), barrel (655,380)-(725,455). | - |
| `decor:cantina-tables` | uses-approved | `P04/cantina-tavern-hub-tileset.png` round table (190,455)-(280,530), table with mug (375,455)-(465,530), stool (1055,455)-(1115,530). | - |
| `decor:cantina-lights` | uses-approved | `P08/colorful-retro-...` chandelier (12,895)-(122,985); `P04/cantina-tavern-hub-tileset.png` lantern (195,530)-(255,605); glows derived. | - |
| `decor:cantina-stage` | uses-approved | `P04/cantina-tavern-hub-tileset.png` swag (460,600)-(585,670), curtain (795,600)-(870,670), banner (280,600)-(355,670), bunting (1160,600)-(1275,670). | - |
| `decor:camp-tents` | no-approved-source | MA-03 | look3-props (replaces round3.tent()), once delivered. |
| `decor:camp-palisade` | no-approved-source | MA-04 | look3-props (replaces round3.palisade()), once delivered. |
| `decor:camp-campfire` | uses-approved | `P08/chibi-pixel-biome-tileset-atlas.png` fire brazier (850,555)-(935,635); glow derived. | - |
| `decor:camp-weapons-rack` | no-approved-source | MA-05 | look3-props (replaces round3.weapon_rack()), once delivered. |
| `decor:camp-crate` | approved-source-not-used | `P07/vibrant-platformer-interactables-sprite-sheet.png` crate (620,480)-(735,590) (the same piece as sprite:crate); `P03/castle-interior-...` crates (918,972)-(1153,1055); `P08/colorful-retro-...` crates (419,822)-(538,890). | look3-props or loop-art-cutouts: replace round3.crate() in the camp sheet. |
| `decor:camp-flag` | uses-approved | `P07/pixel-art-platformer-tileset-atlas.png` red star banner on a pole (722,852)-(798,962). | - |
| `decor:quarry-rock-piles` | uses-approved | `P07/pixel-art-platformer-tileset-atlas.png` boulder heap (875,168)-(1002,265). | - |
| `decor:quarry-timber` | approved-source-not-used | `P07/pixel-art-platformer-tileset-atlas.png` timber trestle (837,333)-(1073,420); `P03/grassy-ruins-...` bridge and post (187,540)-(433,633); `P03/gba-town-street-...` posts and braces (187,400)-(1260,480). A scaffold is these trestles stacked with a plank deck. | look3-props or loop-art-cutouts: replace round3.scaffold(). |
| `decor:quarry-lantern` | uses-approved | `P04/cantina-tavern-hub-tileset.png` hanging lantern (195,530)-(255,605); glow derived. | - |

## Effects

Boxes are (x0,y0,x1,y1) sheet px. Cuts live in tools/art/props/drive.py; make.py picks them.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `look:fx-hit` | uses-approved | `P03/pixel-art-vfx-and-pickup-atlas.png` row 1 star burst (440,50,528,132), (520,42,625,138), (618,42,722,140), sparkle (40,70,100,130) (drive.fx_hit, 6153027). | - (later: the plate's scatter frame (731,60,822,148); the big burst (942,53,1041,150)-(1309,32,1412,168) for hard impacts) |
| `look:fx-slash` | uses-approved | `P01/p01-complete/sprites/vfx/spark_slash.png` (frames 0-3; frame 4 is drawn sparkles). | - (later animated pass: P03 vfx row 3 crescent (65,396,122,448) to (456,375,544,462)) |
| `look:fx-swing-grappler` | approved-source-not-used | `P05/p05-brawl-hit-ko-respawn-source.png` row 1 punch crescent (112,85,176,153) (cut away the fist and the grunt's arm; key P05KEY (247,245,243)); `P03/pixel-heroes-action-sprite-sheet.png` row 1 col 8 burst (838,310,860,377); `P03/pixel-art-vfx-and-pickup-atlas.png` row 1 (121,81,175,131), (208,75,264,132), scatter (299,78,363,132). | look3-props: make.py:121 swaps round2.fx_swing_grappler() for a drive.py cut (grab('brawl', ..., largest=False) + grab('vfx', ...)); keep the id and 32x32 x3. |
| `look:fx-land` | approved-source-not-used | `P03/pixel-art-vfx-and-pickup-atlas.png` row 4 right, low dust: (1063,554,1117,582), (1132,522,1210,590), (1222,522,1318,590), (1325,522,1414,590); bottom half, or make the look 24x16. | look3-props: add drive.fx_land() beside drive.fx_dust() and point make.py:122 at it. |
| `look:fx-dust` | uses-approved | `P03/pixel-art-vfx-and-pickup-atlas.png` row 4 left puffs (28,535,92,590) to (268,508,362,592) (drive.fx_dust). | - |
| `look:shadows` | approved-source-not-used | `P03/pixel-heroes-action-sprite-sheet.png` ground ellipse colour rgb(90,92,145) (nearest master tone night[3] #4c4890); jump-pose shadow (450,375,530,400); P04 interactables use the same ellipse. | look3-props: looks_people.shadow() uses night[3] at the same single alpha (or cuts the ellipse at three sizes); content/looks/people.json unchanged. |
| `look:fx-speed` | uses-approved | `P05/p05-brawl-hit-ko-respawn-source.png` bottom-row swooshes (78,436,155,488), (160,430,250,490), (256,425,350,492) (drive.fx_speed). | - |
| `look:fx-dizzy` | uses-approved | `P05/p05-brawl-hit-ko-respawn-source.png` row 3 stars (8,268,92,340), (112,262,218,340), (222,266,328,342) (drive.fx_dizzy). | - |
| `look:fx-clang` | approved-source-not-used | `P03/pixel-art-vfx-and-pickup-atlas.png` alert fans (60,652,152,702), (192,645,290,702), (334,646,436,702) with largest=False (boxes end at y 702 to drop the ellipse); `P04/chibi-pixel-interactables-sprite-sheet.png` ringing-bell ticks (1349,602,1422,635), (1381,708,1423,750). | look3-props: fix drive.fx_clang(), point make.py:129 at it, remove fx-clang from README's 'No approved source found'. |

## UI and HUD

U08-01 buttons are delivered and byte-identical in assets/ui/touch/. Everything else is a cut from P07's UI atlas, P05's HUD boards, A00-02/03/05 and P04's hall atlas.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `ui:touch-left` | uses-approved | `U08/left-states-48x24.png` (normal 0-24, pressed 24-48). | - |
| `ui:touch-right` | uses-approved | `U08/right-states-48x24.png`. | - |
| `ui:touch-jump` | uses-approved | `U08/jump-states-48x24.png`. | - |
| `ui:touch-attack` | uses-approved | `U08/attack-states-48x24.png`. | - |
| `ui:touch-grab` | uses-approved | `U08/grab-throw-states-48x24.png` (purple open hand). | - |
| `ui:touch-special` | uses-approved | `U08/special-states-48x24.png` (used for Switch hero). | - (optional: `P05/p05-ui-hero-party-hud-source.png` party-swap glyph (584,24,768,145) if Switch should read as a swap) |
| `look:ui-use` | no-approved-source | MA-01 (the plate is U08's; the glyph has no approved source) | look3-props / the touch code's owner, once delivered (assets/ui/use.png). |
| `ui:use-go-in` | approved-source-not-used | `P04/hall-of-legends-tile-atlas.png` lit arch with gold up-arrow (880,696,997,808) or blue twin (1010,696,1125,808), ~16x18 on the U08 plate; alt `P07/irreverents-pixel-ui-atlas.png` up-arrow key (770,919,855,1004). | look3-props draws 'ui-use-go-in' (assets/ui/hud.png, content/looks/ui.json); then the touch code's owner (index.html .go-in, touch.ts showGoIn) shows it. |
| `ui:door-hint` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` up-arrow glyph (770,919,855,1004) to ~7x8 without its plate; or `A00/a00-03-co-op-adventure-world-map-hud-and-gameplay-moments.jpeg` cue arrows (1285,950,1375,992); or the P04 lit-arch arrow (925,730,956,788). | look3-props: add a 'door-hint' look; no code change (door-hint.ts already uses it when present). |
| `ui:door-refused-sign` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` red X (1338,612,1398,668), keyed off its slate pill; alt padlock (295,724,405,834). | look3-props cuts 'door-refused'; Step 11 (cantina.ts drawDoorRefused) draws it. |
| `look:font` | no-approved-source | MA-02 | look3-props (tools/art/props/font.py), once delivered. |
| `look:mood-marks` | approved-source-not-used | `A00/a00-02-acquired-powers-enemies-guards-and-npc-reactions.jpeg` 'NPC Reactions': mood 2 '?' bubble (1077,828,1131,881), sweat bubble (1265,828,1318,881) + drop (1300,890,1322,925); mood 3 anger bubble (1365,825,1421,885). | look3-props push 3: re-cut mood-2/mood-3 in round3.py; keep ids and frame counts (actors' look.ts check must pass). |
| `look:attack-tell` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` yellow '!' bubble (1255,904,1340,1009); alts red '!' (1155,924,1240,1009), A00-02 guard alert (435,849,485,899). | look3-props adds 'attack-tell'; Step 18 slice C draws it during wind-up. |
| `look:bark` | approved-source-not-used | `A00/a00-02-...` '!' bubble with the glyph cleared (981,828,1034,881): nine-slice + 6x4 tail. Same shape: P07 'Zz' bubble (75,413,133,466), A00-05 '...' bubble (1446,198,1496,244). | look3-props (looks_people.bark/bark_tail; same ids and sizes). |
| `look:bark-edge` | approved-source-not-used | Paper: `A00/a00-02-...` bubble (981,828,1034,881); arrow: `P05/p05-ui-hero-party-hud-source.png` gold triangle (728,65,762,120) or P07 right-arrow key (1052,919,1135,1004); head from the speaker's sprite. | look3-props (round3.bark_edge); actors draw it. |
| `look:ribbon` | approved-source-not-used | `P04/hall-of-legends-tile-atlas.png` blank plaque (45,524,119,574) as the 3x3 nine-slice; ends: drape (1184,516,1314,583) or banner (787,513,872,607). | look3-props (looks_people.ribbon); audience.ts tail unchanged. |
| `look:away-dots` | approved-source-not-used | `A00/a00-05-game-art-coverage-and-environment-variety.jpeg` '...' bubble (1446,198,1496,244); A00-02 chip (1030,676,1078,714); alt P07 'Zz' (75,413,133,466). | look3-props (looks_people.away_dots; keep 4 frames). |
| `look:player-mark` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` P1-P4 pins (455,599,550,684) etc., cut blank and white, no digits. | look3-props (looks_people.player_mark; ~8x8, white, tinted by the renderer). |
| `look:alert-pips` | approved-source-not-used | `P05/p05-ui-hero-party-hud-source.png` star-shields grey (484,366,553,438) off, gold (572,366,641,438) or red (666,366,747,438) lit; key the pastel ground. Alt: P07 awareness heads (10,414)-(550,544). | look3-props push 3 (round3.alert_pip; ids alert-pip, alert-pip-off). |
| `look:bell-gauge` | approved-source-not-used | `P05/p05-a-ui-powers-exploration-variant-a.png` meter (80,265,710,340); alt P07 attention meter (570,469,885,514) + marker (735,454,775,479). | look3-props (round3.bell_gauge). |
| `look:hud-face-grappler` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` portrait (27,69,177,216), head ~(40,72,170,180). | look3-props push 3: srcimport.grab('ui', ...) + hand correction; raise hud-face to 16 px if 12 is mush. |
| `look:hud-face-infiltrator` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` portrait (190,69,343,216), head ~(205,72,335,180). | look3-props push 3 (as above). |
| `look:hud-face-flyer` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` portrait (353,69,507,216), head ~(365,72,500,180). | look3-props push 3 (as above). |
| `look:hud-face-brawler` | approved-source-not-used | `P04/cantina-npc-sprite-sheet.png` row 3 arms pose (48,593,216,790), head ~(70,593,200,680). | look3-props push 3. |
| `look:hud-face-skirmisher` | approved-source-not-used | `P04/cantina-npc-sprite-sheet.png` row 2 idle (66,349,229,545), head ~(85,349,215,445). | look3-props push 3. |
| `look:hud-plate` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` health pill (1170,110,1430,190) or party-slot frame (525,89,635,209). | look3-props push 3 (round3.hud_plate); cantina strip moves to it in Step 11. |
| `look:hud-ko` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` KO figure (905,559,1030,674) without the lettered pill; or `P05/p05-d-ui-powers-exploration-preferred-sheet.png` skull tally (10,860,155,935). | look3-props push 3 (round3.hud_ko); Step 11 cantina.ts draws it. |
| `look:hud-fall` | approved-source-not-used | `P05/p05-d-ui-powers-exploration-preferred-sheet.png` ledge-drop pair (1084,900,1259,992) or gold down arrow (1013,887,1047,921); P07 down key (863,919,948,1004). | look3-props push 3 (round3.hud_fall); Step 11 cantina.ts draws it. |
| `ui:cantina-party-row` | approved-source-not-used | Chips: P07 UI portraits (27,69,177,216), (190,69,343,216), (353,69,507,216) and the P04 cantina heads; taken: P07 locked slot (295,724,405,834) or red X; own: P07 selected slot (175,724,285,834); swap: P05 HUD glyph (584,24,768,145); layout: A00-03 party panel (410,470,805,665). | look3-props cuts party-chip looks; Step 11 (cantina.ts drawRow) draws them. |
| `ui:hall-card` | approved-source-not-used | `P04/hall-of-legends-tile-atlas.png` big plaque (380,520,497,585) as the nine-slice; rank: laurel plaque (276,519,356,573), P05 D laurels (340,860,408,935), (508,860,592,935), (604,850,697,945); picture border: P07 selected slot. | look3-props cuts 'hall-card' and rank looks; actors (hall.ts drawPanel) draw them. |
| `ui:hall-banner` | approved-source-not-used | `P04/hall-of-legends-tile-atlas.png` laurel banner (991,516,1061,597) or drape (1184,516,1314,583); P05 D crown ribbon (604,850,697,945). | look3-props cuts 'hall-banner'; actors (hall.ts) draw it. |
| `ui:start-title` | uses-approved | The owner's title screen, Drive `Current Pixel-Art Explorations/Irreverents_Title_Screen_Concept_2026-11-23.png` (a concept), whole, re-authored to 320×180 by `tools/art/title/make.py` (`assets/ui/title-screen.png`, `content/looks/title.json`); it also gives `ui:start-panel` its backdrop. | Step 17 (start.ts, `titlePicture`). MA-22 delivered 2026-11-24. |
| `ui:start-buttons` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` menu row: play (585,729,790,829), list/gear/bag plates (805,729,1250,829), back (1265,729,1410,829), plain slot (60,724,165,834); pressed derived (DRAFT). Layout: A00-05 menu panel (355,835,700,1015). | Step 17 (start.ts .st-btn); look3-props cuts the nine-slices into assets/ui/. |
| `ui:start-code-field` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` plain slot (60,724,165,834); focus = selected slot (175,724,285,834). | Step 17; look3-props cuts the frames. |
| `ui:start-panel` | approved-source-not-used | `A00/a00-03-...` top banner composition (0,0,1160,185); BKG-01 panorama (Drive folder 1pw3aCojPx3vvDGWHRt2f_ons-Rammisv) dimmed under a P07 slot-frame panel; A00-05 menu panel (355,835,700,1015). | Step 17 (start.ts #start, #game-menu); the ground lane's BKG-01 import supplies the panorama. |
| `ui:menu-button` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` list button (805,729,945,829). | Step 17 (#menu-btn); look3-props cuts it. |
| `ui:sound-button` | no-approved-source | MA-20 | Step 17 / audio owner (src/client/audio/index.ts), once delivered. INTENT: a way out, it stays. |
| `ui:page-surround` | no-approved-source | MA-21 | Step 17 (index.html), once delivered. |
| `ui:status-pill` | approved-source-not-used | `P05/p05-ui-hero-party-hud-source.png` progress rings (141,456,397,506) as a 4-frame spinner; pill = P07 KO pill (1026,604,1158,674) with letters cleared, left cap mirrored. | Step 17 (index.html #status, main.ts); look3-props cuts. |
| `ui:orientation-hint` | approved-source-not-used | `P05/p05-ui-hero-party-hud-source.png` swap arrows (353,284,431,344); P07 red X (1338,612,1398,668); P07 KO pill (1026,604,1158,674) cleared. | Step 17 / actors push 3 (shell.ts, #hint); look3-props cuts. |
| `ui:touch-fallback-chrome` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` d-pad up key (95,854,185,934); round-button plate with its glyph cleared (275,884,425,1039). | Step 17 (index.html #pad, #actions). assets/ui/touch/ has no look3 owner: the orchestrator names who cuts it. |
| `ui:tune-panel` | approved-source-not-used | `P07/irreverents-pixel-ui-atlas.png` gear (955,729,1095,829); attention meter (570,469,885,514) + marker (735,454,775,479) as slider; plain slot (60,724,165,834) as panel. | Step 2's owner tool (tune.ts); BACKLOG, no look3 lane. |

## Sound effects

A01-01 is the approved pack (`A01/` below); assets/audio copies differ only by the 10 ms fade added by src/client/audio/prepare-pack.py. 'N' rows here are wiring only: the approved file exists, no moment plays it.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `sfx:jump` | uses-approved | `A01/jump.wav` | - |
| `sfx:flap` | no-approved-source | MA-19 (stand-in: jump.wav at rate 1.3) | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `sfx:land` | uses-approved | `A01/land.wav` | - |
| `sfx:footstep` | uses-approved | `A01/footstep.wav` | - |
| `sfx:swing` | uses-approved | `A01/swing.wav` | - |
| `sfx:hit` | uses-approved | `A01/hit.wav` | - |
| `sfx:hurt` | uses-approved | `A01/hurt.wav` | - |
| `sfx:impact` | uses-approved | `A01/land.wav` at rate 0.85 (a fitting borrow) | - (a dedicated cue would be AUD-007) |
| `sfx:heavy-hit` | uses-approved | `A01/heavy_hit.wav` | - |
| `sfx:slam` | uses-approved | `A01/suplex_slam.wav` | - |
| `sfx:grab` | uses-approved | `A01/grab.wav` | - |
| `sfx:pickup` | uses-approved | `A01/pickup.wav` | - |
| `sfx:grab-refused` | no-approved-source | MA-16 (stand-in: door_locked.wav at rate 1.2, which also carries gate-close) | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `sfx:throw` | uses-approved | `A01/throw.wav` | - |
| `sfx:door` | uses-approved | `A01/door_open.wav` | - |
| `sfx:call-windup` | uses-approved | `A01/call_windup.wav` | - |
| `sfx:bell` | uses-approved | `A01/bell_clang.wav` | - |
| `sfx:alarm-rising` | uses-approved | `A01/horn_blast.wav` | - |
| `sfx:mood-calm` | uses-approved | `A01/mode1_happy_blip.wav` | - |
| `sfx:mood-confused` | uses-approved | `A01/mode2_confused_warble.wav` | - |
| `sfx:mood-rage` | uses-approved | `A01/mode3_rage_buzz.wav` | - |
| `sfx:calmed` | uses-approved | `A01/just_as_expected_jingle.wav` | - |
| `sfx:voice` | uses-approved | `A01/gibberish_voice_blip_1..4.wav` | - |
| `sfx:bark` | uses-approved | `A01/gibberish_voice_blip_1..4.wav` (volume 0.3, wider pitch) | - |
| `sfx:break-wall` | uses-approved | `A01/crumble.wav` | - |
| `sfx:break-window` | uses-approved | `A01/break_crack.wav` at rate 1.15 | - |
| `sfx:plate-down` | no-approved-source | MA-17 (stand-in: menu_close.wav) | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `sfx:plate-up` | no-approved-source | MA-18 (stand-in: menu_open.wav at rate 0.9) | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `sfx:gate-open` | uses-approved | `A01/door_open.wav` at rate 0.75 (a fitting borrow) | - |
| `sfx:gate-close` | uses-approved | `A01/door_locked.wav` at rate 0.75 (a fitting borrow) | - |
| `sfx:switch` | uses-approved | `A01/party_swap.wav` | - |
| `sfx:switch-refused` | uses-approved | `A01/menu_close.wav` at rate 0.8 | - |
| `sfx:ui-tap` | uses-approved | `A01/tap.wav` | - |
| `sfx:outpost-horn` | approved-source-not-used | `A01/call_windup.wav` (wind-up) and `horn_blast.wav` (blast), already in assets/audio. No moment plays them for outpost-call-started/-completed. | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief): add the two cases in src/client/audio/moments.ts (horn located at the post). Wiring only. |
| `sfx:signaler-broken` | approved-source-not-used | `A01/alarm_destroyed.wav` (made for 'alarm destroyed'; not yet copied to assets/audio). | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief): MOMENTS entry in src/content/kinds/sounds.ts, content/sounds/signaler-broken.json, run prepare-pack.py, a moments.ts case. |
| `sfx:reinforcements` | approved-source-not-used | `A01/reinforcements_sting.wav` (made for camp waves; not yet copied). | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief): moment + content/sounds/reinforcements.json + prepare-pack.py + an outpost-wave case; correct docs/mechanisms/sound.md line 29. |
| `sfx:cantina-bell` | approved-source-not-used | `A01/bell_clang.wav` (already in assets/audio), its own moment with otherRooms false (the cantina bell raises no alarm). | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief): a cantina-bell moment and content/sounds/cantina-bell.json; a moments.ts case. |
| `sfx:cantina-brawl` | no-approved-source | MA-15 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `sfx:cantina-out` | no-approved-source | MA-10 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `sfx:cantina-swap` | approved-source-not-used | `A01/party_swap.wav` (swap), `menu_close.wav` at 0.8 (refused), `menu_open.wav` / `menu_close.wav` (party row open/close); all in assets/audio. | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief): four moments and content/sounds entries; cases in moments.ts (tapping player, distance false). |
| `sfx:door-refused` | approved-source-not-used | `A01/door_locked.wav` (made for a locked door; docs/audio-design.md names this moment). | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief): a door-refused moment and content/sounds/door-refused.json at rate 1; a moments.ts case at the doorway. |
| `sfx:menu` | approved-source-not-used | `A01/tap.wav`, `menu_open.wav`, `menu_close.wav` (the REQ's UI group). | Step 17's builder (start.ts, shell menu) or look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief); the first tap also unlocks sound on iPhone. |

## Music

No approved music exists yet: every tune is a DRAFT code-synth file (content/tunes/). A02-01 (STATUS: REQUESTED, nothing delivered) asks for most of it.

| Asset id | Status | Approved source (path + region) or missing-list id | Lane to switch it |
|---|---|---|---|
| `music:outdoors` | no-approved-source | MA-06 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief) (music.ts), once delivered. |
| `music:castle` | no-approved-source | MA-07 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief) (music.ts), once delivered. |
| `music:alert-layers` | no-approved-source | MA-08 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief); music.ts must also learn to mix layers by alert (engine work). |
| `music:cantina` | no-approved-source | MA-09 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief) (cantina-brawl-start/-end hooks exist in src/sim/cantina.ts). |
| `music:outpost` | no-approved-source | MA-11 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief) (switch on outpost-call-completed; the cooldown trigger is DRAFT). |
| `music:quarry` | no-approved-source | MA-12 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief), once delivered. |
| `music:king-march` | no-approved-source | MA-13 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief) (Step 6's royal audience), once delivered. |
| `music:hall` | no-approved-source | MA-14 | look-sound brief (Step 8 sound; no round-3 lane carries sound, so this needs a new brief) (Step 7's Hall), once delivered. |
