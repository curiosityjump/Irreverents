**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/04 — World Structure, Secrets and Revisiting* (https://docs.google.com/document/d/1AY19fKuh2SEUZ8dH9f56R8Ci1wZ59Hae-FmzSuBMJWc/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

World Structure, Secrets and Revisiting

Status: Confirmed direction, with implementation open \| 22 November 2026

# Spatial identity

A primarily 2D side-scrolling action-adventure in a highly explorable, interconnected world. The overworld and spaces between destination regions are playable, secret-filled environments; they are not simply menus linking conventional levels. Mirrors, portals, doors, shortcuts, vertical tunnels and physical connections can lead to distinctive world-regions. Preserve a sense of place: locations can be reached, remembered, bypassed, revisited and unexpectedly connected.

# The Amazing Mirror influence

Prioritize wandering, wrong turns, hidden routes, doors above and below the main path, partial maps, seemingly incidental obstacles, and returning with new powers. The player should not know every secret exists. A little detour might disclose a whole region. Modern clarity and responsiveness are welcome but should not erase the playful GBA-like exploration identity.

# Progression by increasing capability

Newly discovered characters join the permanent roster. Returning to places crossed hours earlier with a flyer, tiny character, animal speaker or powerful manipulator can reveal completely new spaces. Certain characters arrive well after a player has passed features where they'd have helped. This is desired rather than a progression flaw.

Temporary enemy/map-acquired powers create short-term opportunities. Combining innate character type, individual traits and acquired abilities allows reinterpreting previously seen obstacles.

# Secret taxonomy

Visible inaccessible curiosities: high window, suspicious cracked wall, tiny tunnel, unusual language.

Concealed interactions: moveable statue, false flooring, optional NPC dialogue, enemy behavior, destructible environmental element.

Deep discoveries: large optional worlds, hidden settlements, exceptional recruitable characters, alternate route networks, unexpected connection between regions.

Temporal or reactive secrets: appear only when NPCs react, alarms escalate, an elite response arrives, a system is disrupted, or a creature changes behavior.

Co-op emergent secrets: simultaneous interactions with no arbitrary denial of clever single-player workarounds.

These are categories of experiences, not promise of a fixed count.

# Puzzle design ethos

Favor constraints expressed as understandable world properties: weight, momentum, power, temperature, access size, timing, sound, concealment, ability to converse, mechanisms that must remain active. Avoid doors which only work because the game checks for a rigid icon match, except where a unique identity or language makes authentic fictional sense.

Reward non-obvious strategies that respect the rules even when they bypass the designer's anticipated path. Do not covertly disable player-discovered solutions just because a puzzle was intended for a specific ability. Consistency matters more than a single correct answer.

# Nonlinear freedom and difficulty

A hard boss can guard an optional valuable route, not routinely block the game's entire future. At an apparent dead end the player should have other enticing spaces, secrets or activities accessible. Combat strength and pressure can vary, but the game should not force a tough fight as the sole route to continued exploration.

# Traversal economy

Party preparation should matter, but repeatedly recrossing long solved corridors only because a single slot is missing should not become drudgery. Potential options under exploration: discovered shortcuts, locally available characters, meaningful transportation, unlocked fast travel, alternate puzzles, reconfigurable hub. None is approved as a specific UX mechanic yet.

Movement should support expressive, quick 2D platform navigation, interesting vertical routes, flying/gliding where abilities allow, and vehicle movement in eligible spaces. Exact scrolling/camera/room loading rules remain open.

# Player awareness and map

Maps should help orientation without exposing every possible secret or framing exploration as a shopping list. An unexplored gap, unusual sound or inaccessible ledge can be a clue. Avoid omniscient markers for every collectible. Accessible information should communicate what has been seen and traveled, not automatically solve the world's mysteries.

Party members may wander into different locations at once during co-op, so the navigation/map design must eventually support distributed players.

# World reactivity and persistence

Places and inhabitants respond to rescues, thefts, destruction, alarms, raids and reputation; these outcomes can make routes newly possible. The extent of persistent terrain damage versus local reset/repair is not determined. The world cannot become permanently unusable after normal experimentation.

# Exemplar: revisiting the forest

Visit one: see inaccessible hollow tree, stone door and canopy.

Visit two: recruited tiny character enters a network of tunnels.

Visit three: new stone-manipulating character opens ancient door.

Visit four: flyer reaches canopy and discovers physical connection to castle.

This sequence is an illustration of revisitation value, not locked content.

# Design questions

How contiguous is the world versus portal-separated biomes? Are there soft narrative boundaries? How much vertical layering? Which secrets depend on triggered events? How much real-time NPC persistence? What are save, respawn and repair rules? What map clues preserve mystery without frustrating players? What is the baseline number and scale of regions?

OWNER DESIGN DISTINCTION — WORLD CONNECTORS ARE NOT EASY SAFE ZONES (22 NOV 2026)

The overworld BETWEEN named levels remains real playable space full of routes, enemies and secrets. However, high-security hiding places that pursuers CANNOT EASILY GET TO are intentionally RARE in these inter-level connectors. The player's reliable response to a serious good-guy wanted pursuit is to get out of reach and quietly wait until heat declines. This makes traversal between levels dangerous and gives strong navigational value to reaching a complex level with high ledges, tiny passages, secluded rooms or back-route opportunities. Pursuing NPCs can cross level entrances, so entering a level alone doesn't erase heat. Avoid overfilling the overworld with convenient instant cooldown nooks or adding a stage-transition wanted reset. Exact frequency and affordances remain open for level design and playtesting.

ADDITIONAL WORLD-GRAPH EXAMPLES (22 NOV 2026)

A new gameplay-first set of ten regions, intended as candidate design material rather than a fixed atlas, explores high/low vertical routes, return loops, secret cross-region doors, the value of level geography as a rare wanted-level refuge, and relatively exposed between-level spaces. Source: https://docs.google.com/document/d/1tvbPY5po9I6XitnlNzVrE8UH7ihgU8rIjSr_CBuHyko/edit

OWNER-FAVORED DISCOVERY FEEDBACK — LEVEL COMPLETION (22 NOV 2026)

The owner likes LEGO Star Wars-like measures of completion for each substantial level. A proposed explored percentage should count hidden geographic rooms/areas, allowing players to KNOW they missed something without showing the missing area. Separate secret components can be recovered across visits and collectively construct an UNKNOWN object. The exact reward design, map-percentage computation and inter-level area boundaries are open. Don't turn this into compulsory checklisting; maintain interconnected free exploration and new-character revisits. Dedicated design: https://docs.google.com/document/d/13cnvLDsV6ILLs_yc202HENUSVKYMiMcHpmZpMXvpeoc/edit

RARE POWERS MAKE GEOGRAPHY VALUABLE (22 NOV 2026)

Owner likes rare, finite-location abilities and items which can be carried across the interconnected world, lost through combat (Kirby-like acquired power ejection; possibly held items), then reacquired by returning to their previously discovered spawn/source locations. A source is known once found, even when possession is temporarily lost. Discovering a shortcut changes the cost of a repeated expedition. This gives further reason to revisit levels beyond completion counters and roster gates. Exact loss probability, recovery opportunity, source respawn and whether map records sources automatically are OPEN. Design: https://docs.google.com/document/d/1puHJwUoNnBkNZyTLCh01VRQiqzUzjnb7plYfni9e2Gw/edit

BETWEEN-LEVEL CANTINA — PHYSICAL SOCIAL/ROSTER HUB (22 NOV 2026)

Owner has placed the playable-character hangout/CANTINA in the real BETWEEN-LEVEL world. All unlocked playable characters wander there, making unlocked roster growth physical. Player approaches and TAPS one to bring up a full-screen current-party selection, then taps one of the active slots to swap them. The cantina doubles as an ENDLESS Smash-style bar-fight room, separate from normal NPC behavior: player and game-controlled characters can be launched offscreen/KO'd and respawn indefinitely, with a running K/D high-score challenge. It should not cause reports, wanted levels or permanent losses. Full spec: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit

CANTINA ENTRANCES AND WANTED-LEVEL ACCESS RULES (22 NOV 2026)

The owner's cantina has its MAIN ENTRANCE plus numerous SHORTCUT ENTRANCES scattered through the actual playable BETWEEN-LEVEL world. They connect to the same cantina party/arena space. Normally, if the party is ACTIVELY BEING CHASED BY GOOD GUYS, ALL of these doors are LOCKED, because the cantina must never be a trivial pursuit escape. As a special reward for finding ALL MYSTERY COMPONENTS, one unlock allows chased players to enter the cantina; the good-guy pursuers can FOLLOW THEM INSIDE and turn its endless-respawning Smash-style brawl into an extraordinarily chaotic cross-system encounter. Door access never erases wanted level. Completion-set structure, multiplayer eligibility and performance budget remain open. Detail: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit
