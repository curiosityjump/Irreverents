**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *05 World and Game Expansion — Proposals/29 — Level Completion: Exploration and Mystery Components* (https://docs.google.com/document/d/13cnvLDsV6ILLs_yc202HENUSVKYMiMcHpmZpMXvpeoc/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

LEVEL COMPLETION — EXPLORATION AND MYSTERY COMPONENTS

Irreverents \| Owner-favored direction plus bounded proposals \| 22 November 2026

# Core player fantasy

Like LEGO Star Wars levels, each playable region has visible indicators of how much has been discovered and collected, making revisits rewarding. Unlike a checklist of revealed secrets, the record communicates that SOMETHING remains without revealing WHAT or WHERE. The main fun stays platforming, exploration, power interactions, stealth, co-op puzzles and surprising physical discoveries. Extremely little dialogue, no NPC AI or forced lore.

Owner explicitly likes hidden components that build into an UNKNOWN thing, and proposes a level EXPLORATION PERCENTAGE that can show you missed something without revealing the secret.

# Suggested minimalist region record

Each named level/region displays:

EXPLORATION: e.g., 78% explored. Count unexplored hidden passages and bonus rooms in the denominator, so 100% honestly means everything included in that region's exploration map has been discovered.

MYSTERY COMPONENTS: e.g., 3/5 pieces recovered, shown as small individual parts or unknown silhouettes. The finished creation should not be identified beforehand.

OPTIONAL 100% marker: mark a region fully complete only when the two major measurements are complete, if the owner wants one overall completion badge. Avoid conflating finishing the main path with full discovery.

These are two proposed visible metrics, not a new requirement for 20 separate checklists. The exact UI/label/count and whether there is an overall percent are OPEN.

# Exploration percentage: design to reward curiosity, not expose secrets

Measure discovered geographical sections, not killed monsters, treasure picked up or plot checkpoints. An authored room can have multiple discovery cells/sectors if its hidden balcony or secret shaft is substantial. Crossing into a region or viewing its contents updates a saved explored flag. This can be computed from a finite map table without simulated exploration.

Award weighted chunks based on room/sector size or importance rather than every single pixel stepped on; avoid a cruel 99% caused by a minuscule unseen corner. Hidden rooms count before discovered. A map should show only spaces actually visited; percentage alone indicates there's something not found, not its location or required ability.

Example: player exits the Clocktower thinking it is done, opens region record, sees 67%. Later discovers a roof passage and maintenance tunnel, returns with new flyer/tiny character, and reaches 92%. One remaining undiscovered balcony or alternate room is a satisfying mystery.

Question to test: if a player has reached 99% exploration, will they enjoy finding the last hidden room or feel forced to exhaustively scrape every pixel? Chunk-based, discoverable level geography is important.

# Mystery components: mystery without scripting new mechanics for each

Scatter a modest fixed number of collectible OBJECT PIECES throughout each substantial region. Candidates include a small gear in a tricky platform path, a copper casing behind a breakable panel, a glass lens obtained in a stealth route, and a lever in a secret chamber. The items have satisfying pickup animations/sounds. Display n/m so the player knows more exist; do not reveal exact placements.

When the complete set is found, the pieces assemble into one predefined creation, potentially with a brief LEGO-like snapping-together visual. Keep the result completely unknown until completed, or only provide ambiguous fragments; avoid a puzzle silhouette revealing the payoff.

Different regions could build a quirky vehicle, a statue for the player's home/base or Hall, a harmless comic contraption, an unusual tool, or occasionally an ability-relevant machine. All such examples are proposals. Don't make secret completion mandatory for accessing the main adventure; meaningful surprises can be cosmetic or playful and rare functional rewards can encourage exploration.

Production strategy: collection component sprite pickups share the SAME collectible system; each level's finished object is one authored sprite/animation, not an arbitrary craft-engine or combinatorial construction simulator. Unknown final construction is an authored reveal, not dynamic procedural assembly.

OPEN: one construction per level versus cross-level; piece counts; whether assembly is automatic on collection or at a hub/workshop; use of pieces as physical objects versus abstract tokens; final reward category and balancing.

# Why two measures matter

A player can have 100% explored but only 4/5 components, meaning one is concealed in a room they did visit (behind scenery, puzzle or challenge).

A player can find all five components but only explore 72% of the region, meaning there are substantial spaces and possibly other discoveries beyond component hunting.

The two measures help diagnose the nature of missed possibilities without supplying a route or checklist.

Not everything in the game needs to count toward either: one-off combat chaos, Hall of Legends records, stealth masterpieces and random funny interactions remain intrinsically rewarding rather than mandatory 100% chores.

# Nonlinear region boundaries and world connectors

Level maps are interconnected and revisitable, not discrete menu-only stages. A completion record should identify which authored region owns which rooms/sectors and components. One room usually contributes to one region, with optional overlap policy chosen deliberately for special connections. Entering through a secret back entrance updates that region naturally. Leaving without completing anything is normal.

The playable BETWEEN-LEVEL world remains real and secret-bearing. Whether it gets its own separate completion records or contributes to named neighboring regions is OPEN; do not silently turn the overworld into an empty stage selector.

No mandatory return to a level-end banner to save exploration or pickup flags; the record should update naturally as rooms and items are discovered. Can optionally show a small progress pop-up after discovery or upon leaving the region; keep presentation unobtrusive.

# Co-op and replay

Shared expedition state records discovered sectors and found components; a teammate's collected part is not a lost opportunity for anyone else in the shared active party. Whether permanent account-level save ownership and co-op visitors get their own progression is an earlier OPEN multiplayer question.

A strong mover reveals a panel, a tiny character enters the crawlspace, a flyer reaches the high chest, or a temporarily acquired power opens an optional branch. The collectibles should be spread across different sorts of challenge so revisits and character variety matter.

A clever solo player can use held switches, weights, timed platforms and character switching to reach secrets without an arbitrary "two humans required" check.

A collected component should generally stay collected across replay/return visits. Optional per-session reset only if there's a separate challenge mode, not for the core completion record.

# Proposed visual design

A small panel accessible from map/pause:

IRON QUARRY \| Explored 78% (short horizontal bar) \| Components 3/5 (five little parts, unknowns are question marks).

A 100% badge is optional, earned when all chosen primary categories complete. Do not show a giant list of missing secret names or waypoint arrows.

If there is a level exit/journey milestone, it can briefly celebrate newly discovered geography and components, but levels remain geographically continuous and explorable. Keep sparse, colorful, inviting visual grammar comparable to the original game references.

# Testing and potential failure modes

Test 1: Player reaches the end of a level at 67% explored, understands there are hidden spaces, and WANTS to return—not feels cheated by withheld instructions.

Test 2: The same player later recruits a new functional character and immediately recalls a particular unreachable balcony that might raise progress.

Test 3: Player collects 5/5 parts without being told the final result; a surprising construction animation and reveal is satisfying. The reward is delightful enough for the effort but doesn't make story progression impossible without it.

Test 4: Another player reaches 100% explored while missing a component. The record communicates the difference between geographic discovery and item collection clearly.

Test 5: Co-op pickups and discovery update correctly without duplication or a teammate stealing the achievement.

Test 6: The player can leave and enter via a back connection, and percent/collection state remains consistent and saved.

Risk: percent completion becomes obsessive spreadsheet work. Counter: two clean indicators, geographic chunks, varied secret types, no reveal lists and no compulsory full-completion rewards.

Risk: creating unique reward machines for dozens of levels becomes prohibitively expensive. Counter: tiered reward complexity (most are small decorative/playful, rare reusable functional machines), pooled prefab assembly animation and curated small production scope.

# Status

CONFIRMED DIRECTION: visible measures of level completion; hidden components that collectively make an unknown thing; an explored percentage indicating missing areas without spoiling them; inspiration from LEGO Star Wars; interconnected 2D geography, discoverable character powers, low-dialogue gameplay.

PROPOSED: exactly two headline indicators; level-specific finite collection sets; map-sector weighting; assembly/reward treatment; optional complete badge; specific values in examples; UI appearance.

UNRESOLVED: area boundaries, piece count, assembly location, reward categories, how multiplayer save ownership works, between-level mapping, distinction between progress and optional objective metrics.

DON'T CONFUSE SAVED COMPLETION WITH CURRENTLY CARRIED RARE EQUIPMENT (22 NOV 2026)

Owner now favors rare temporary powers/equipment that can be carried away from their scarce world sources, lost on damage, recovered as a dropped pickup or retrieved by returning to source. These are different from persistent level exploration percentage and hidden build-component collection. Proposed default: discovered geography and recovered construction parts stay permanently recorded even when the currently held rare power or weapon is lost. Whether a rare source gets an explicit completion collectible/icon is OPEN. Design: https://docs.google.com/document/d/1puHJwUoNnBkNZyTLCh01VRQiqzUzjnb7plYfni9e2Gw/edit

PARTIAL OWNER-SELECTED REWARD FOR MYSTERY-COMPONENT COMPLETION (22 NOV 2026)

The owner STILL DOES NOT KNOW THE GENERAL PURPOSE of the hidden mystery-component collection(s). One specific proposed reward has now been owner-selected: ONCE ALL MYSTERY COMPONENTS ARE FOUND, one of the UNLOCKS permits entering the cantina while actively chased by good guys. Normally every cantina entrance (main and worldwide shortcuts) is LOCKED during a good-guy pursuit, preventing use as an escape. With this special completion unlock, entrances work during the chase, BUT THE PURSUING GOOD GUYS FOLLOW THE PARTY INTO THE CANTINA, creating enormous mixed fights with its endlessly respawning playable roster characters. This reward is not permission to clear wanted heat, and it is not necessarily the only reward, the identity of an assembled mystery creation or the whole purpose of completion. Exact interpretation of 'all' (global collection vs series of per-level collections), unlock interface and co-op access are OPEN. Detailed cantina spec: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit
