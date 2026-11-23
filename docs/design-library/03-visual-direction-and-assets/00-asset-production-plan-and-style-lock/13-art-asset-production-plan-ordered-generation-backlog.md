**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *03 Visual Direction and Assets/00 Asset Production Plan and Style Lock/13 — Art Asset Production Plan — Ordered Generation Backlog* (https://docs.google.com/document/d/1reKfubHb_S6mSyn89kTSm8T2bSRd67E2MptsL24skL8/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

CURRENT OWNER OVERRIDE — BUILD NOW, REFINE LATER (22 NOV 2026)

Everything creative is approved for use/experimentation BY DEFAULT. The owner explicitly prefers new assets be integrated and changed later rather than blocked awaiting review. All STOP-until-owner-approves gates below are obsolete as a workflow requirement. Continue S00-02, S00-03 and the rest of the backlog whenever useful; prioritize real iPhone-browser usability, original GBA-era readable art and modular technical assets. Internal QA and status labeling are still important, but absence of sign-off is not a blocker.

Claude may request specific assets from ChatGPT through shared Drive inbox: https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp. Request protocol: https://docs.google.com/document/d/1oBpJKI2P7v7rwoMku-TbcFuVQe2iajddK6v2i5Ro0G0/edit. S00-01 images are now USE NOW / REVISE LATER: https://drive.google.com/drive/folders/1BCT_Sao2sZNCygUCv0qSQcECtIlsmc2j.

IRREVERENTS — ART ASSET PRODUCTION PLAN

Ordered generation backlog \| Proposed production plan, not automatic canon \| 22 November 2026

# Purpose and correction of course

Stop producing unrelated spectacle collages. The project owner prefers the EARLIER pixel-art board strongly informed by Kirby & the Amazing Mirror, not the recent anime-like hero lineups, cinematic illustration and glossy/cartoon marketing aesthetic. This plan prioritizes assets a game team needs to reason about environment construction, gameplay readability and implementation.

Produce purposeful, coherent asset batches and integrate them promptly. Use new designs as provisional implementation choices by default, refining them when playtesting or owner feedback warrants it; keep concept and production readiness labels accurate.

# Reference hierarchy

1. CURRENT VISUAL ANCHOR: approved pixel-art aesthetic reference: [https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view](https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view)

2. CURRENT SECONDARY: GBA pixel studies in [https://drive.google.com/drive/folders/1keZSTY0jaKXupkZ8TXZMW11c9e5s\_\_C2](https://drive.google.com/drive/folders/1keZSTY0jaKXupkZ8TXZMW11c9e5s__C2)

3. DESIGN TRUTH: 01 Creative North Star + 11 Decision Register in project root.

4. NOT REFERENCES FOR THE LOOK: later large anime-ish character illustrations, detailed hand-painted 3D concepts, editorial mega-collages, generic modern platformer key art. Their ideas may be mined for systems, but their visual style is REJECTED unless individually reconsidered.

Do not recreate Kirby, named franchise characters, known enemies or copyrighted sprites. Reference the GBA-era visual language, not copied assets.

# Production strategy — build one playable slice first

The first asset target is NOT a world map or a roster of 50 characters. It is a coherent short run of side-scrolling rooms: a normal grassland route → royal castle approach → palace audience chamber → hidden vault/undercroft → guard-pursuit street → a tiny Hall of Legends gallery. Prove these six connected functions within one visual language before adding whole new regions.

The sequence tests platforming scale, character-to-environment proportion, stealth, secrets, impact, vehicles, user-triggered story disruption and Hall record display.

# Gate 0 — Style lock, before bulk generation (2–3 outputs)

S00-01: One UNSCRIBED gameplay-scale grassy room with 2D walkable ground, a raised platform, visible door, hidden alternate route, background layers and a single original tiny playable sprite.

S00-02: Character-to-screen-scale proof: 6 small ORIGINAL silhouettes, standing on the SAME ground at plausible in-game size; show idle, walk and jump tests for 2 leading candidates. No giant full-body portraits.

S00-03: One royal throne room side-view gameplay cross-section at the identical pixel density, with the king, champion, wizard, dragon access and a suspicious passage. No cinematic angle or extravagant foreground occlusion.

Review S00 together at NATIVE PIXEL SIZE and at 2x/4x NEAREST-NEIGHBOR scale; compare directly with selected earlier board. STOP if it looks anime, modern cartoon, illustration, isometric, perspective painting, or too detailed for gameplay. Gate: evaluate internally against style/readability criteria and keep building; owner pre-approval is not required.

# Gate 1 — Foundational construction kit (11 concept deliverables)

E01-01: Ground/stone/grass/brick modular tileset, edges, corners, one-way platforms, slopes, breakable variants; tile grid labeled OUTSIDE the sprite art.

E01-02: Castle interior kit: walls, floors, pillars, arches, stairs, railings, windows, balcony platforms.

E01-03: Town street and interior kit: cobblestone, timber, roof, stall, door, windows, signs, gutters.

E01-04: Hidden undercroft kit: shadow stone, grates, crawlspace, breakable wall, mechanism niches.

E01-05: Mechanical kit: gears, piston platforms, ladders, crates, doors, switches, hazard surfaces.

E01-06: Foreground/near-background separable decoration sheets: vines, curtains, lanterns, pipes.

E01-07: Distant parallax layers: clouds, castle silhouette, mountains, trees; each layer separable.

E01-08: Door families with visible, locked, hidden, open and broken states; clearly distinct.

E01-09: Simple recognizable environmental interaction props: pressure plate, levers, push blocks, ropes, vents, switch, grate.

E01-10: Secret clue grammar reference: 8 micro-scenes contrasting too-obvious, fair subtle and invisible clues.

E01-11: 6-room playable layout mockup with flat silhouettes/collision planes separated from decorative concept art.

Gate: a tilemap artist could plausibly build a small game-space from the proposed materials; foreground and background do not confuse walkability.

# Gate 2 — Starter characters and character functional types (8 deliverables)

C02-01: Original character silhouette grid for 8–12 contrasting types; deliberately avoid Kirby-shaped clones or anime humans.

C02-02: Final-candidate protagonist A: idle front/side, walk phases, jump, grab and reaction poses at in-game scale.

C02-03: Final-candidate protagonist B: same views/poses and scale.

C02-04: Final-candidate stealth/small character: crouch, hide, slip through opening, pickpocket, jump.

C02-05: Final-candidate strong/grappler: carry, grab, pivot, suplex wind-up, slam, recoil.

C02-06: Final-candidate flyer: takeoff, sustained flight, land, knockback and idle.

C02-07: Same-party side-by-side scale lineup with one environment tile underneath, used as proportion control.

C02-08: Function markers and tiny roster icons for at least 6 possible types; no named lore commitment.

Gate: the type is legible in one second as a 24–40ish-pixel-tall sprite (provisional); team can animate without redrawing anatomy between poses.

# Gate 3 — NPCs, guards and reactive factions (8 deliverables)

N03-01: Ordinary town inhabitants at gameplay scale: 6 diverse types, 2–3 emotion states each.

N03-02: Vendors, guards, royal attendants, wizard and king at same pixel density.

N03-03: Guard reaction sequence: relaxed → suspicious → sees player → alert → pursues → searches → cools off.

N03-04: Basic 4-enemy roster with different mass/shape/movement; candidate powers tied to each.

N03-05: Three response tiers: town guards, armored patrol, elite enforcer; clear escalation silhouettes.

N03-06: Creature reactions: calm, curious, provoked, retaliating, fleeing.

N03-07: Crowd readability scene with 12–20 NPCs in a narrow corridor.

N03-08: Defeat, stunned, launched, wall-hit and recovery reaction poses for light/medium/heavy targets.

Gate: reactions remain readable in a crowded, side-view game and align with the same rules as player attacks.

# Gate 4 — Copy powers, objects and environmental affordances (8 deliverables)

P04-01: 12 candidate powers/weapons as small pickup icons; explicitly exploratory.

P04-02: One power's whole affordance family: enemy source, acquire, equip, attack, environment use, drop.

P04-03: Second power's whole affordance family with different gameplay role.

P04-04: Grab/suplex affordance set: grab points, lifting, carry, slam, enemy and block responses.

P04-05: Temperature/element interaction props: freezeable water, heated wall, ignition, melt, aftermath.

P04-06: Tiny character interaction with crawlspace/vent; strong character with weighted gate.

P04-07: Switch-and-power relationship reference: mechanisms behave by effect, not arbitrary ability icon.

P04-08: Puzzle result variations on SAME screen, showing at least two consistent routes to reach hidden treasure.

Gate: images help gameplay designers define reusable rules, not just pretty power art.

# Gate 5 — Impact, destruction and vehicle response (9 deliverables)

I05-01: SINGLE attack in 5 ordered frames: anticipation → contact/hit-stop → launch → collision → debris/recovery.

I05-02: Suplex into wall with cracked wall, knockback and dust trajectory clearly readable.

I05-03: Heavy opponent versus light opponent hit-response comparison.

I05-04: Enemies colliding with enemies; a single high-impact chain reaction.

I05-05: Modular impact VFX sheet: punch burst, slash, slam dust, shockwave, debris, launch streak, explosion.

I05-06: Breakable tiles/properties: intact, damaged, broken, repaired or temporary reset.

V05-01: 3 original hijackable machines (small transport, fast pursuit, heavy enforcer) in side profile, size relative to sprites.

V05-02: Vehicle action/state sheet: idle, accelerate, collide, overturned, damaged, captured, abandoned.

V05-03: Pursuit roadblock shown in 3 sequential gameplay frames, not an illustration from a dynamic camera.

Gate: at normal sprite scale, mass and contact read powerfully without hiding playable entities.

# Gate 6 — Stealth and escalating pursuit (7 deliverables)

T06-01: Guarded street/warehouse infiltration with two routes, shadows, vents and patrol movement.

T06-02: Same room in quiet success, suspicion and full alarm states; art must preserve navigation.

T06-03: Detection indicators: hears, looks, investigates, alerts, loses sight; measured discreet UI.

T06-04: Escape puzzle: hiding, crossing sightlines, changing routes and cooling down.

T06-05: Faction response lineup: immediate patrol → armored squad → flying/vehicle response.

T06-06: Silent heist high point (vault opened, guards unaware) at gameplay scale.

T06-07: Failed heist transforming into last stand and vehicle escape: 4 consistent frames of ONE room chain.

Gate: stealth and chaos are two outcomes of same world, not two incompatible art styles.

# Gate 7 — Hall of Legends (6 deliverables)

H07-01: Hall corridor constructed as normal side-scrolling platform game room.

H07-02: Pedestal/framed-screenshot asset with variable image crop and modular stats plaque.

H07-03: Three small record examples: silent heist, last stand and narrow escape.

H07-04: Ceremony storyboard: frame freeze → framed memory → pedestal placement → resume play.

H07-05: Hall security and breakable props, whole room under alarm.

H07-06: Recursive event: Hall battle commemorated by new pedestal displaying earlier Hall statue.

Gate: team can reason about dynamic image capture and the Hall as an interactable world location; examples are not fixed scripted stories.

# Gate 8 — Interface, map and narrative micro-assets (6 deliverables)

U08-01: Gameplay HUD with party portraits, current power and health; UI legible without covering secrets.

U08-02: Shared-party switch and recruit selection mockup at GBA-like scale.

U08-03: Interconnected area map with visited routes and unknown branches, not automatic secret reveals.

U08-04: On-screen small NPC reactions, alert cues, collectible notifications and optional interaction hints.

U08-05: King speaking while the heroes freely move around the court; speech persists while gameplay occurs.

U08-06: Three-hour secret credits transition storyboard (speech → acknowledgements → actual credits).

Gate: the interface looks like a playable side-scroller, not a modern card-based portfolio slide or fan mockup.

# Gate 9 — Expansion AFTER a coherent vertical slice

Only after gates 0–8: forest, cave, mechanical foundry, flooded ruin, skyway, volcanic region and other biomes; local NPC variants; special characters; new vehicles; deeper power and boss families; additional Hall chambers. Prioritize by player verbs and connections over exotic appearance. Do not generate dozens of unrelated kingdoms first.

# Order and output quantities

Total proposed first-pass planned images/sheets, excluding expansion: 3 style proofs + 11 construction + 8 character + 8 NPC + 8 power + 9 impact/vehicle + 7 stealth + 6 Hall + 6 UI/story = 66 tightly scoped deliverables. These are proposals and may be consolidated after reviews. Generate in small batches (roughly 2–5 closely related outputs) so failures don't multiply.

# What each asset brief must contain

ID and filename; parent scene; purpose for development; associated game mechanic and decision ID; reference image; scale and view; pixel/palette constraints; layers; character/object states; composition; animation or tile adjacency dependencies; what's approved versus illustrative; acceptance criteria; alternate versions needed; revision notes.

# Artifact types and honesty

CONCEPT REFERENCES: Generated images are useful for mood, silhouette, state ideas and spatial direction. They are not automatically usable as source sprite sheets, animation frames, tile atlases or engine objects.

PRODUCTION ASSETS: require validated grid alignment, true transparency and separate layers where needed, coherent frame continuity, deliberate pivots/hitboxes, game-scale testing, licensing review and manual artist cleanup. Do not label a pretty composite “engine ready.”

For floor tiles, walls, animation and UI, implementers may reconstruct from approved visual references in actual layered/pixel editor source. Exact file formats depend on engine and pipeline.

# Stop rules

Do not proceed if: anime face/hair/proportions dominate; side-scrolling turns into isometric landscape; art reads as poster not game screen; hero is giant versus tiles; pixel size varies wildly; excessive glow obscures platforms; text appears baked into sprites; character poses do not match proportions; scene uses Kirby recognizable characters; one giant collage replaces separable assets.

# Next single generation task

Produce/use S00-01 and continue immediately to small-scale character and royal-room proofs as the code needs them; keep improving art iteratively. Do not wait for user approval to proceed.

BATCH STATUS — 22 NOV 2026

Gate 1 has begun. E01-01 terrain modular visual concept completed; 16×16 transparent prototype grass/castle tile atlases (38 + 42 entries), associated manifest, contact previews and assembled low-noise room proof created. Status is EXPERIMENTAL/UNAPPROVED, not production-ready. Bundle and README: https://drive.google.com/drive/folders/1wSx5SxZf0lRaQqKqgPP-fy_SenjAKfYB

Next priority within Gate 1: castle architectural pieces with consistent 16px cell adjacency, town props, undercroft/secret door states, walkable six-room layout and foreground/background layering. Avoid another broad “asset plan” poster.

S00 GATE STATUS UPDATE — 22 NOV 2026

Generated two focused S00-01 grassy-ruins single-room style-test variants and 320x180 iPhone-resolution review thumbnails, with an unapproved asset manifest and clear developer usage notes; uploaded to Drive in candidate-only folder: https://drive.google.com/drive/folders/1BCT_Sao2sZNCygUCv0qSQcECtIlsmc2j

STATUS: AVAILABLE FOR PROTOTYPE USE BY DEFAULT / CONTINUE ITERATING. The best visual candidate for further comparison is S00-01B; S00-01A overemphasizes an X-marked secret wall. Both are flattened concept art with an unproven native pixel grid and no separable art layers, not production-ready sprites, tile atlas or source code. Proceed with S00-02 character experiments and S00-03 palace art as needed; don't require a review pause. Maintain quality checks and rebuild flattened references into actual reusable pixels when needed. Future production pixels should be rebuilt/validated as reusable modular assets. Detailed README: https://drive.google.com/file/d/1iffaXkKFwkkyLigzMKu9xEn8aGonkm4n/view

ASSET REQUESTING FOR IMPLEMENTATION (22 NOV 2026)

Claude may request specific art plan items or implementation-driven assets by copying this REQ template: https://docs.google.com/document/d/1ntJHj5rYYi59_o4-0c5Pf-rFYKcJvX1ZlUP43nCJaUw/edit and placing the new request in https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp. ChatGPT checks hourly when automation runs, attempts feasible fulfillment, links actual output files, and moves successful requests to the Delivered folder. Owner has authorized default use; technical format and legal originality still matter. No approval gate should block production. Process doc: https://docs.google.com/document/d/1oBpJKI2P7v7rwoMku-TbcFuVQe2iajddK6v2i5Ro0G0/edit
