**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *04 Decisions and Prototyping/11 — Decision Register, Boundaries and Open Questions* (https://docs.google.com/document/d/1vlwf5VZgwT0E0cKqYF4o0EI5LhuR4iiZxCyVUUreytU/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

Decision Register, Boundaries and Open Questions

Status: Baseline extracted from the conversation \| 22 November 2026

# Governance

CONFIRMED = explicitly requested, endorsed or unambiguously selected by project owner.

STRONG DIRECTION = repeated favorable intent, but specifics not finalized.

EXAMPLE = a scenario, invented name or sample power meant to clarify experience; do not treat as a required asset.

OPEN = must be decided or tested. Technical teams should not silently convert open matters into canonical design decisions.

When decisions change, preserve the old entry, date and reason; update the impacted system docs and asset labels.

# CONFIRMED — identity and world

D-001 Title: “Irreverents.” Applies as game title / player shorthand only; heroes do NOT use this as their in-world name.

D-002 Side-scrolling primarily 2D adventure; current art reference strongly prefers Amazing Mirror-esque GBA pixel imagery.

D-003 World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub.

D-004 Nonlinear routes and optionality; a very hard boss should not be the single chokepoint to general progression.

D-005 Deep secrets, side areas and discoveries available long after first visitation; re-visitability is core.

D-006 Ability-driven environmental puzzle solving should reward creative, consistent applications rather than rigid prescribed tricks.

# CONFIRMED — heroes and party

D-007 Unlockable and permanently expanding roster of characters discovered in the world.

D-008 Functional character types share core mechanical differences; individuals may have special traits, many differences stylistic, LEGO Star Wars-style.

D-009 Abilities and/or weapons can be acquired from enemies or the map, Kirby-style.

D-010 Only a LIMITED selection of roster members is carried/switchable during an expedition.

D-011 Opportunities to swap in local characters mid-level/region may occur.

D-012 Online co-op is a required mode.

D-013 A SINGLE SHARED PARTY is used for cooperative play.

D-014 Simultaneous multi-ability challenges may create naturally co-op-favored discoveries.

D-015 Do not impose a hard no-solo rule for such challenges; neither must every challenge have an explicitly designed solo solution.

# CONFIRMED — stealth, chaos and combat

D-016 Stealth as broadly viable playstyle across the world; zero-alarm success should be deeply satisfying.

D-017 Players can initiate fights with normal inhabitants, steal or hijack vehicles, provoke guards and escalate attention.

D-018 NPC/faction resistance grows and varies; hiding and escaping can cool attention.

D-019 Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.

D-020 Spectacular IMPACT is a top priority: suplexes, launches, heavy collision, knockback into walls/other enemies, and roadblock crashes.

D-021 Generally asymmetric combat: heroes outpower most common enemies, but crowds and escalating resistance can become overwhelming.

D-022 Reckless, over-the-top, self-endangering destructive action is a major toybox pleasure.

D-023 Hijacking the enemy machine sent to stop the party and turning it on the pursuers is a signature desired situation.

# CONFIRMED — records and story

D-024 Epic stealth successes, last stands and escapes are commemorated in a Hall of Legends/Valhalla-like memorial.

D-025 Commemorations include a frame of the spectacular moment presented on a pedestal, with relevant stats and history-relative prestige.

D-026 Every participating player's history includes the event, even if played in somebody else's game.

D-027 Hall of Legends is itself playable and can host a legendary incident, including its own attack/destruction.

D-028 The world prizes stories, destinies and grand quests, while the heroes are intensely indifferent and fixate on more interesting nearby opportunities.

D-029 A momentously important overarching quest exists, but its story is mostly ignored in favor of side discoveries; importance does not imply interest.

D-030 The heroes' informal compass is epicness and curiosity, whether rescue, stealth, heist, battle or chaos; their attitude is irreverent / somewhat nihilistic.

D-031 Inhabitants' attitude oscillates between adoration and rage in response to the heroes' rescuing and betraying them.

D-032 Opening throne-room royal briefing is continuously playable and the king does not naturally stop talking if players wait.

D-033 Approximately three hours of uninterrupted listening triggers a secret, seamless actual end-credits alternate ending.

D-034 Opening room supports real interactivity: attack king/champion, release captive dragon, steal wizard's pills, investigate secret architecture, etc.

D-035 A serious world's attempt to direct protagonists is the comedic tension; the main crisis should not be made meaningless to excuse the joke.

# STRONG DIRECTIONS, NOT FULL SPECIFICATIONS

S-001 Hall chooses events of unusual greatness relative to past exploits rather than predetermined quest completions.

S-002 Impacts share intuitive ideas of momentum, mass, force and chain reaction; scope of general simulation undecided.

S-003 Different regions and inhabitants have distinct response personalities, not one generic police system.

S-004 World/cast uses humor grounded in sincerity rather than nonstop self-aware quips.

S-005 Large contingent of optional secret characters and non-story discoveries.

S-006 Players can separate geographically online where practical.

S-007 World consequences create ongoing content; avoid hard game-over for ordinary experimentation.

# EXAMPLES — not final canon

E-001 “Rescue town from dragon, receive invisibility cloak, steal jewels, lead pursuit to arena, battle undead gladiators.”

E-002 King's champion armor, caged dragon, advisor's pills, king suplexed through stained glass, secret behind throne.

E-003 Fire/ice/spark/hammer/shrink/ghost/animal speech and sample character types.

E-004 Four-character expedition party and four human players shown in concept images.

E-005 Optional legendary hall wings or titles, all sample statistics and event names.

E-006 Particular towns, castles, villains, colorful roster names and machines shown in generated art.

E-007 Five-level wanted bar, portrait/title names, specific number of regions and layout.

# OPEN — high-priority decisions

O-001 Exact game camera: screen rooms, smooth side scroll, world loading, ability to backtrack under multiplayer separation.

O-002 Final fidelity: pixel sprite resolution, modern HD-pixel production, whether 3D rendering in side-view is useful anywhere.

O-003 Number of party slots, max online players, initial roster count, total roster ambition.

O-004 Player control arbitration, shared progression/save ownership, disconnected players and session drop-in/out.

O-005 Acquired powers: slots, persistence, dropping, transferring, combining, character constraints.

O-006 World-state persistence and recovery following destruction, arrests, defeat or killed quest-critical characters.

O-007 Exact stealth detection rules, cooldown and response intensity ceiling.

O-008 Physics/destruction scope, chain reactions, simulation budgets and impact accessibility.

O-009 How/when vehicle hijacking is possible, which vehicles, steering and collision model in side view.

O-010 Event recognition scoring, replay buffer, image capture, participation attribution and Hall data preservation.

O-011 Relationship between deliberate story timelines and no forced urgency; multiple endings.

O-012 Tone, violence depiction, player age rating, behavior toward neutral NPCs.

O-013 Production constraints: team, engine, platforms, funding, runtime, scope, monetization.

O-014 Licensed inspiration versus original art: ensure original player/enemy design and world assets.

O-015 How much main quest can be derailed without exhaustive bespoke dialogue branching.

# Change-management procedure

Every new proposal should state the player-facing experience, relevant decisions, tradeoffs, dependencies and open tests. Promote from EXAMPLE or STRONG DIRECTION to CONFIRMED only with project-owner agreement. A new image is a visual experiment unless specifically approved. Never infer exact mechanics or story canon from mockup labels, generated names or example screen numbers.

WORLD EXPANSION PROPOSALS — NOT DECISIONS (22 Nov 2026)

The following are candidate material only: provisional names and 10-region world atlas (Crownward, Lanternmarket, Bramblewake Woods, Siltglass Waterworks, Cinderworks, Old Arena, Skyrail Heights, Whisperways, Hall, Seal Sites); candidate central crisis “Great Unbinding”; proposed faction names, NPC memory dimensions, character types, ability catalog, 15 encounter scenarios and a first vertical slice. No prior CONFIRMED entries are changed. Source folder: https://drive.google.com/drive/folders/1dbl7vEcPb6nNokyH15SmluB4r87YK23L

Important: “Irreverents” remains outside the game world's own term for the party; copied powers and roster slot count remain open; co-op is one shared party; no mandatory boss bottlenecks; no mandatory imposed central-quest path; no hard coded rule preventing emergent solo solves.

NEW OWNER-CONFIRMED NARRATIVE DIRECTION — 22 NOV 2026

D-036 The world has basically made a RELIGION OF THE HERO'S JOURNEY. The Grand Narrative/Main Quest is treated as the source of ultimate meaning for everything that happens.

D-037 Everybody insists that EVERYTHING fit the EXPECTED GLORIOUS NARRATIVE EXACTLY. Inhabitants are exceptionally TYPECAST, conventional, sincere and predictable; each role has an expected function in the sacred story.

D-038 Things have one culturally obvious and sanctioned purpose: legendary sword for legendary foe, sacred key for sacred lock, throne for royal ceremony, etc. Crucial distinction: this is cultural expectation and visual clarity, not a mechanical restriction. The heroes can creatively use the same items for surprising alternative ends.

D-039 Irreverent disruption is not automatically reclassified by everyone as a compliant story beat. The default is confusion, anger, shock or resistance because someone used the wrong thing for the wrong purpose. A few dedicated chroniclers may later attempt strained reinterpretation, but universal narrative flexibility contradicts the owner's latest clarification.

UNDECIDED: literal church versus culture with religious intensity; named orders, theology, supernatural prophecy, whether non-player characters ever meaningfully question roles. The broad narrative doctrine above is CONFIRMED; specific institution names and examples in document 21 are proposals.

Canonical elaboration: https://docs.google.com/document/d/16hzOOStE4Nt-uOcD6ApTDbWPT10fgizTC3eOcDB8Vmw/edit

CONFIRMED ADDITION TO NARRATIVE PREMISE — 22 NOV 2026

D-040 The WORLD'S INHABITANTS ARE THRILLED TO PLAY THEIR EXPECTED ROLES. The storekeeper is immensely proud and delighted to be a storekeeper, just as mentors, champions, guards, princes/princesses, villains and other archetypes are radiantly pleased to enact their grand purposes. This is a joyful, sincerely fulfilled society of narrative archetypes, NOT primarily a dystopia of coercion or secretly miserable people waiting to be liberated. The players are shocking because they repurpose things in a world where everyone joyfully believes everything has one proper glorious function. The role-pride is a confirmed tonal feature; specific NPC dialogue/examples remain proposals. Full detail: https://docs.google.com/document/d/16hzOOStE4Nt-uOcD6ApTDbWPT10fgizTC3eOcDB8Vmw/edit

NEW OWNER-CONFIRMED MECHANIC — 22 NOV 2026

D-041 NPCs are ABSOLUTELY HORRIFIED by player actions that deviate from obvious scripted roles and purposes. This is the primary cultural explanation for intense mobilization and resistance; it is not exclusively about crime or conventional morality.

D-042 NPCs also PACIFY REMARKABLY QUICKLY when the heroes resume familiar role-appropriate behavior. They instantly feel reassured — “Yup! Just as expected!” The speed and delighted certainty of this calming are core to the game's comedy and strategy.

D-043 This generates social stealth, exploitation of predictable expectations, context-sensitive provocation and a potentially new path for escaping pursuit: behave as the world expects. A theft or spectacular act need not create a permanently high active alert while an observer is sincerely convinced order is restored.

OPEN: Exact observation thresholds, persistent consequence balance, how severe crimes affect calming, NPC memory, limits of script-compliant disguises, and numerical implementation. “Narrative Dissonance” is working mechanic terminology, not an approved final in-world name. Full mechanics bible: https://docs.google.com/document/d/1jQssgW8w1oXo_14lLhbGHVwWTPef7y2TEU_aCD_nMvQ/edit

OWNER-CONFIRMED ADDENDUM — 22 NOV 2026

D-044 When heroes first deviate, the world assumes a temporary FLUKE. Do not escalate instantly on every harmless unusual action. People are convinced the proper narrative will naturally resume.

D-045 PERSISTENT DEVIATION creates increasing COGNITIVE DISSONANCE, emotional distress, and desperate attempts to restore the sacred, predictable Hero's Journey. Escalation is driven by sustained mismatch with role expectations, not merely crime severity.

D-046 At sufficiently extreme ongoing deviation, even ordinary noncombatant inhabitants (SHOPKEEPERS, bystanders) and PET CATS / similar harmless creatures may join the overwhelming physical resistance in an effort to stop the heroes. The convergence of the whole community is a distinctive last-stand/spectacle mechanic; these characters need not become powerful fighters.

D-047 Apparent return to script can pacify even intensely distressed locals remarkably fast, consistent with D-042: the world confidently interprets deviation as an ended fluke.

OPEN: exact stages, NPC triggers and ranges, whether pets share beliefs versus respond to mob panic, relationship of physical danger to immediate calm, persistent restitution and practical crowd simulation. Detailed doc: https://docs.google.com/document/d/1jQssgW8w1oXo_14lLhbGHVwWTPef7y2TEU_aCD_nMvQ/edit

OWNER CONFIRMED — THREE UNIVERSAL NPC MODES (22 NOV 2026)

D-048 NPCs GENERALLY have exactly THREE high-level psychological modes: (1) BUSINESS AS USUAL, (2) CONFUSION / DISTRESS, (3) ABSOLUTE BLINDING VIOLENT RAGE. This applies to VILLAINS as well as benign townsfolk and other inhabitants. Earlier multi-stage conceptual escalation is subordinate implementation detail, NOT the canonical main state model.

D-049 Mode 1 is ROLE CONFORMITY, not friendliness or pacifism. SHOPKEEPERS FEEL COMFORTABLE OPPOSING A VILLAIN WHO ACTS LIKE A VILLAIN; the shopkeeper outwardly resists yet inwardly feels that the proper story is proceeding as expected. Villains likewise delight in properly villainous conduct, threats and dramatic hero confrontations.

D-050 A VILLAIN WHO ENTERS A SHOP POLITELY BUYING A POTION is horrifying to the shopkeeper, more so than a conventional villainous robbery. The world evaluates WHO is acting and WHAT their expected role dictates, not whether an action is conventionally nice, legal, peaceful or violent.

D-051 Repeated script deviation creates escalating cognitive dissonance and can move ANY role-holder, including villains and ordinary civilians, into absolute blinding rage; conspicuous return to the correct narrative pattern can then reassure them rapidly, even when the correct pattern includes fighting.

OPEN: exact transition thresholds, witness propagation, role recognition, rage behaviors, persistent property consequences, and how mode transitions work for pets. Detailed canonical elaboration: https://docs.google.com/document/d/1wuGuCu1RhXXhdWuU55ZcJJ8rZAbCx98mZfdqsyrgMv8/edit

OWNER-CONFIRMED D&D IDENTITY — 22 NOV 2026

D-052 Irreverents pays homage to Dungeons & Dragons' CHAOTIC NEUTRAL character ethos. The protagonists are uncommitted to rigid conventional moral or social roles and chase what is most epic/interesting. They may rescue, steal, explore, fight, hide or improvise; Chaotic Neutral is NOT an order to behave randomly or cruelly.

D-053 Irreverents is also an homage to the tabletop RULE OF COOL. Imaginative actions that honor the fiction's intelligible rules should be possible and celebrated, including surprisingly clever and outrageous uses of abilities, objects, physics and social expectations. Cool attempts need not succeed automatically; spectacular failure, collateral reactions and desperate recovery are legitimate payoffs.

D-054 The expected-script society is an intentional contrast: heroes, villains, storekeepers and guards delightedly adhere to their archetypal narrative roles even across moral opposition, whereas the player band sees uses beyond prescribed purposes. D&D alignment terms are design inspiration, NOT a request for a literal alignment meter or D&D license.

Open: precise way to teach Rule of Cool through systems without making rules inconsistent, balancing surprise/agency/technical scope, and whether any D&D references are overt in public-facing text.

PRACTICAL SCOPE PROPOSAL — NOT OWNER-CONFIRMED (22 NOV 2026)

A new document proposes finite interaction tags and object properties, three universal NPC modes with role-dependent expectation checks, authored 2D rooms, small-crowd tricks, simplified impact/vehicles, event-based Hall captures and a solo-first, online-later engineering sequence. Working first-slice scope might be 5–6 rooms, 3 characters, 2 powers, 4 archetypes, 1 hijackable machine and 1 Hall pedestal. These counts, engine approach, network phasing and object taxonomy are recommendations; all remain OPEN. Do not conflate “replayable systemic feel” with unlimited world simulation. https://docs.google.com/document/d/1WdIyj6OrTzMhXD842nIJ4iIlQYlFuQQiwxNj2ygIyYM/edit

OWNER-CONFIRMED SCOPE CONSTRAINT — 22 NOV 2026

D-055 NO NPCS WILL HAVE AI. This includes shopkeepers, villains, guards, champions, pets and crowds. Their three emotional modes and role-appropriate reactions are implemented through ordinary scripted game states, explicit event/role mappings, triggered animations and fixed response behaviors. No autonomous reasoning, generative dialogue, learning agents or NPC intelligence simulation is part of the design. Earlier suggestions of AI agents, 'NPC AI', intelligent crowds and psychological simulation are superseded. Exact deterministic implementation remains a developer choice. Implementation clarification: https://docs.google.com/document/d/1WdIyj6OrTzMhXD842nIJ4iIlQYlFuQQiwxNj2ygIyYM/edit

LEVEL ANTHOLOGY — DESIGN PROPOSALS, NOT DECISIONS (22 NOV 2026)

Twelve proposed replayable region concepts now exist, with distinct platforming, secrets, co-op puzzles, stealth, escalation and alternative routes. None of their names, special puzzles or bosses are confirmed. They preserve owner-confirmed: interconnected exploration, 3 NPC modes, ZERO NPC AI (scripted state/event logic), no arbitrary solo prohibition, shared party online co-op, Rule of Cool, nonlinear secrets and Hall history. The finite reusable puzzle toolkit and level loop are production recommendations only. See: https://docs.google.com/document/d/1NtE6Be9LX5uOd6ditYwN0UPeSbhEefEW4SJ75NVFGf0/edit

OWNER-CONFIRMED LEVEL-DESIGN/TONE CORRECTION (22 NOV 2026)

D-056 The fun is FIRST AND FOREMOST the 2D level gameplay inspired by Kirby and LEGO Star Wars: traversal, powers, exploration, secrets, enemies, stealth, escalating combat, puzzles and co-op creativity. The world premise should NOT be forcibly threaded into every area or interaction.

D-057 Dialogue is VERY LIMITED, similar to the game inspirations. NPCs' typecast joyful certainty and three modes should be conveyed primarily with animation, behavior, sound, simple icons and occasional brief lines, not speeches or constant jokes.

D-058 Comedic role-obsession is the WORLD'S UNDERLYING LOGIC, NOT a punchline to hammer every level. Many areas may be simply fun fantasy levels with no overt lore gimmick. The ongoing joke is strongest when encountered organically or in rare memorable moments.

Previously generated twelve-level anthology has excessive thematic names, exposition and scripted skits; treat these as overdeveloped brainstorming examples, NOT a tonal production reference. Its mechanics/room opportunities may still be mined after stripping away unnecessary story dressing.

OWNER-CONFIRMED COMBAT STRUCTURE — 22 NOV 2026

D-059 Attacking “good guys” (guards, townspeople and other expected friendly roles) produces the previously confirmed escalating SOCIAL COUNTEROFFENSE: narrative deviation → confusion/distress → rage and expanding participation, up to civilians and pets. Visible return to expected conduct can pacify quickly.

D-060 Bad guys are present as thematically appropriate scattered enemies in levels, and also in specific HOSTILE OUTPOSTS, inspired by Far Cry 5's outpost/alarm dynamic. Fighting villains in the expected hero-versus-villain manner is Business As Usual for them, not a narrative-dissonance trigger.

D-061 Hostile outposts contain visible CALL-REINFORCEMENTS SIGNALERS. An enemy that DETECTS a player, RECOGNIZES them as a threat, and REACHES/ACTIVATES a signaler can call a reinforcement wave. Players can preemptively destroy/disable the signaler, interrupt the caller, clear the enemies without allowing further signaling, or ESCAPE THE ZONE. Successful signaling can generate escalating waves ENDLESSLY if the players continually allow the system to operate. Prevented signaling, elimination of potential callers, or zone escape stops that local progression.

D-062 This system has NO NPC AI; enemy reactions and signaler use are scripted event triggers and fixed routes, with authored wave arrivals. No forced “stealth failed” reset.

OPEN: after first signal, continuous dispatch versus repeated calls, threat identification rules, signaler repair/persistence, wave escalation curves, per-zone reset boundaries and active character performance caps. Tactical specifics are proposed implementations, not yet locked. Relevant spec: https://docs.google.com/document/d/11sUrQ0eFfjXi_inoYBFnYGJ6FA_IAc5fJeKfru5KDIQ/edit

OWNER-CONFIRMED REPORTING PREREQUISITE — 22 NOV 2026

D-063 BOTH good-guy social counteroffense and bad-guy outpost reinforcements require an ACTUAL COMPLETED CALL FOR HELP or signaling action to generate SCALING REINFORCEMENTS. Distress, rage, a witnessed attack, a body discovery and personal fighting do not themselves silently increase area wanted level or create distant backup. Earlier statements that emotional mode alone summons guards/mobs are SUPERSEDED.

D-064 GOOD-GUY NPCs call for backup ONLY from mode 2 confusion/distress or mode 3 blinding rage. If an isolated shopkeeper is knocked out without reporting and nobody witnesses/reports, the player may rob and leave with NO guards/police summoned. If someone later finds the knocked-out good-guy NPC, they may enter distress/alert and be more likely to attempt a report.

D-065 INDIVIDUAL MODE and SHARED AREA WANTED/HEAT are different state variables. Successful reports or subsequent completed calls escalate an area response in a GTA/NFS-inspired manner. Escalation is not omniscient: witnesses have to identify the attacker or scene to report those details; investigating an unidentified crime doesn't mean the world knows a player's location.

D-066 Calls/signalers are INTERCEPTABLE. Potential actions: interrupt or knock out caller, disable alarm, avoid witnesses, clear enemies without further calls, or escape zone. A completed report can bring responders even if the caller later feels reassured; calm mood and sent reports are distinct.

OPEN: numerical wanted/heat tier count, how different signals advance tiers, whether villain outpost callers must also reach emotional mode 2/3 versus ordinary threat recognition (user mentioned 2/3 explicitly for GOOD-GUY witnesses), detection/identity, who can call, reporting range, exact wanted decay/cross-zone effects. New authoritative spec: https://docs.google.com/document/d/1wbSNfKLfrUsg9YX5qsRhYX9KwiMX8clXRZZBiuuz8PA/edit

OWNER CONFIRMATION / AMBIGUITY RESOLVED (22 NOV 2026)

D-070 VILLAINS MAY USE SIGNALERS FROM MODE 1 BUSINESS AS USUAL whenever they recognize a player hero as a threat. They do NOT need narrative dissonance, confusion, distress or rage to make a tactically normal villainous reinforcement call. This is inspired by Zelda BOTW/TOTK lookout monsters and Far Cry 5 outpost alarms. A completed physical or otherwise visibly communicated signal still precedes any reinforcements; recognition alone isn't a successful call.

D-071 GOOD-GUY reports remain limited to modes 2/3. The earlier open question asking if villains share that emotional-mode gate is RESOLVED in the negative. Their tactical call eligibility and role expectation modes are independent. Game enemies remain entirely scripted, with no NPC AI. See: https://docs.google.com/document/d/1wbSNfKLfrUsg9YX5qsRhYX9KwiMX8clXRZZBiuuz8PA/edit

PREVIOUSLY CONFIRMED BUT NOW INDEXED — PERSISTENT PURSUIT AND CROSS-FACTION CLASHES (22 NOV 2026)

D-067 Reported good-guy pursuit becomes progressively difficult to reverse. Defensive attacks during active pursuit prolong or intensify heat; simply behaving politely in front of known pursuers cannot erase the alarm.

D-068 Escaping pursuit requires full disengagement / loss of contact and enough hidden time for wanted heat to decay. Repeated sightings or attacks can reset the cooldown. Exact mechanics open.

D-069 Guards can chase into physically interconnected other game levels, where they may engage the bad guys already present. Resulting three-sided battles arise through scripted faction-hostility and shared collision/combat rules, not bespoke story scripts. The signal-before-new-reinforcements rule remains active. Dedicated spec: https://docs.google.com/document/d/1RMdB5x9k3wfVKolnYhZLtuwLYrm3lmrO1w6fpjCy7po/edit

OWNER-CONFIRMED DE-ESCALATION REFINEMENT (22 NOV 2026)

D-072 GOOD-GUY MODE 2 (confusion/distress) is QUICKLY REVERSIBLE by visible normal/expected hero behavior. This is the only immediate “just as expected!” reset when dealing with distressed good-guy NPCs.

D-073 GOOD-GUY MODE 3 (absolute blinding violent rage) is NOT instantly reversible by performing a normal action, buying something, or resuming a heroic pose. The player must completely DISENGAGE, avoid those opponents, and maintain a period of no incidents so that GENERAL ALARM/HEAT subsides BELOW THE VIOLENT LEVEL.

D-074 Fighting back even defensively, breaking/destroying anything, and doing anything unexpected keeps/re-escalates the alarm during attempted cooldown. Hiding or otherwise remaining out of contact without such incidents is required for long enough. Once heat drops below the violent threshold, regular role-conforming reassurance may apply.

D-075 The reporting requirement still stands: an isolated good-guy NPC can reach mode 3 and fight locally, but scaling reinforcements from guards or town require an ACTUAL successful call/report; rage alone is not a broadcast.

OPEN: duration/decay of no-incident cooldown, how locally violent but unreported NPCs cool, exact relation of 3-mode labels to the general wanted-level meter. Authoritative details: https://docs.google.com/document/d/1wbSNfKLfrUsg9YX5qsRhYX9KwiMX8clXRZZBiuuz8PA/edit

OWNER-CONFIRMED PURSUIT REFUGES (22 NOV 2026)

D-076 The most SUREFIRE way to escape high good-guy wanted pressure is to find a spot pursuing NPCs CANNOT EASILY REACH, remain out of contact, do nothing unexpected/violent/destructive, and wait long enough for general wanted pressure to fall below its dangerous threshold. This is a waiting-out-pursuit mechanic, not a mere switch to a good-guy pose.

D-077 These hard-to-access hiding refuges are RARE in playable BETWEEN-LEVEL world areas. Connected overworld traversal should therefore involve exposure and meaningful risk during active pursuits. Developed level geometry may offer richer refuge opportunities; a level transition never automatically resets pursuit, and guards may follow between regions.

OPEN: exact refuge design, pursuit access/door limits, timer, whether guards camp outside, and minimum hiding options for unpowered characters. Detail in docs 27 and 04.

DESIGN EXAMPLES ONLY — TEN MORE GAMEPLAY-FIRST LEVELS (22 NOV 2026)

Document 28 proposes ten distinct side-view playable regions, each with a room graph, movement challenges, cooperative puzzle affordances and plausible solo workarounds, optional stealth/combat, secret revisits, and development-reuse notes. None are owner-approved named levels, settled map links, character types or specific future assets. They honor confirmed low-dialogue, authored NPCs with NO AI, good-guy wanted escape rules, signal-required reinforcements for BOTH sides, villain mode 1 threat-triggered signalers, cross-level pursuit, and rare safe refuge in inter-level connectors. Do not canonize these examples. https://docs.google.com/document/d/1tvbPY5po9I6XitnlNzVrE8UH7ihgU8rIjSr_CBuHyko/edit

LEVEL COMPLETION AND MYSTERY COMPONENTS — OWNER-FAVORED DIRECTION (22 NOV 2026)

D-078 In the spirit of LEGO Star Wars, each substantial playable level/region should have clear measures of completion to make discoveries and revisits meaningful. The project owner specifically likes finding HIDDEN COMPONENTS that assemble into a final object whose identity is UNKNOWN to the player while collecting pieces.

D-079 An EXPLORED % is an explicitly welcomed idea: player knows there's more to discover without the game revealing WHICH route, room or secret is missing. Hidden rooms should contribute to the percentage; the exploration progress is distinct from collectible/component progress. Exact technical method and presentation are open.

STRONG DIRECTION / OPEN: a minimal region record showing exploration percentage and collected components n/m, with a possible overall 100% mark. Fixed region-based construction rewards, assembly point, component number per level, reward categories, character gating, multiplayer ownership and whether between-level zones have their own completion records remain undecided. Examples MUST NOT be converted into confirmed exact assets or counts. Dedicated concept: https://docs.google.com/document/d/13cnvLDsV6ILLs_yc202HENUSVKYMiMcHpmZpMXvpeoc/edit

OWNER-FAVORED RARE ITEMS AND DAMAGE LOSS (22 NOV 2026)

D-080 Certain powers/abilities or items are intentionally VERY RARE and available only in one/few authored spots in the connected world. Once found, players can deliberately return to KNOWN SOURCES and obtain another copy after losing the one they carried away. Rare items/powers can be transported into unrelated levels; shortcut discovery may ease repeat trips.

D-081 Like Kirby, taking DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried items. Recovery of an ejected power before it disappears is a plausible proposal, but exact loss thresholds, timing, item categories and how player can reclaim it remain OPEN.

D-082 This is a different progression mode from PERMANENTLY UNLOCKED PLAYABLE CHARACTERS and saved geography/build-component completion. The possibility of a source being discovered stays valuable when possession ends.

STRONG PROPOSAL, NOT CANON: ejected bouncy short-lived pickups, reacquisition from fixed respawning sources, rare ability deployment across multiple game systems, permanent construction-component credit, source markers after discovery, and bounded co-op retrieval. Detailed design: https://docs.google.com/document/d/1puHJwUoNnBkNZyTLCh01VRQiqzUzjnb7plYfni9e2Gw/edit

OWNER-CONFIRMED CANTINA — 22 NOV 2026

D-083 The connected BETWEEN-LEVEL WORLD contains a CANTINA in which ALL UNLOCKED playable characters hang out and WANDER physically. It is where the limited active team can be reset/reconfigured.

D-084 Exact roster-swap interaction: TAP the desired roaming cantina character; the CURRENT ACTIVE PARTY is shown ACROSS THE SCREEN; TAP the currently active member to REPLACE; the selected wandering character joins that slot. These interactions should be quick and direct rather than text menus or speeches.

D-085 Players may ATTACK those unlocked characters to launch a huge Super Smash Bros.-like BAR FIGHT, including blasting fighters OFFSCREEN, KOs and endless RESPAWNS for game-controlled roster fighters AND human players. NO finite death/game over loop.

D-086 A RUNNING K/D COUNTER gives players scores/high-score opportunities during cantina fights. The entire cantina brawl is EXPLICITLY OUTSIDE ORDINARY NPC SYSTEMS: no ordinary three-mode narrative distress/rage, reporting, wanted-level escalation, allied reinforcement calls or normal death penalty. Cantina fighters still have NO NPC AI, using authored action/movement rules.

OPEN: exact venue geometry, brawl start/stop rules, K/D counting conventions and high-score persistence, party-slot count and co-op player-control protection, rare gear behavior in brawl, and scalable actor budget. Canonical design: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit

OWNER-CONFIRMED CANTINA SHORTCUTS AND MYSTERY-COMPLETION UNLOCK (22 NOV 2026)

D-087 The cantina has one MAIN ENTRANCE, plus SHORTCUT ENTRANCES distributed widely across the playable world BETWEEN LEVELS. They connect back to the same physical cantina and make roster resetting convenient when not chased.

D-088 If the player is CURRENTLY BEING CHASED BY GOOD GUYS, ALL CANTINA ENTRANCES are LOCKED. The cantina cannot ordinarily be used as an escape, sanctuary or unwanted instant wanted-level reset. Being merely under suspicion without active pursuit is not explicitly decided.

D-089 One of the special UNLOCKS from having FOUND ALL THE MYSTERY COMPONENTS permits the player to enter cantina even while chased by good guys. This is an exception to the door lockout, NOT a wanted-level reset or shelter.

D-090 Under the completion unlock, CHASING GOOD GUYS CAN FOLLOW INTO THE CANTINA. Their intrusion can collide with the cantina's Smash-like ENDLESS RESPAWNING CHARACTER BRAWL, creating giant crossover combats. The normal cantina roster brawlers still use their special brawl rules; external good-guy pursuers carry in their existing pursuit state. Precise guard KO/respawn behavior, scoring, and reinforcement logic inside are not finalized. Everything scripted, NO NPC AI.

OPEN: Mystery components' OVERALL purpose and other rewards are still unknown; 'all' may mean all globally / a master collection rather than every per-level set, exact unlocking ceremony and how multiplayer access works. No specific combined construction is owner-approved. Detailed rules: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit

OWNER-SELECTED SHARED DRIVE CHANGELOG PROCESS — 22 NOV 2026

D-092 The Irreverents root contains a document titled 'changelog'. From now on, whenever an editor (ChatGPT, Claude, or human) materially changes content in the project Drive, they should AFTER SAVING include a concise changelog entry with actual Eastern date/time, short description, approval/status where relevant, and direct URLs routing collaborators to the files/folders changed. Group related same-session edits; no entry needed for cosmetic typo fixes. Entries must report confirmed writes, not intention. The changelog is the shared source of recent changes and a routing index, not proof that all edits by other tools will automatically be logged. Owner also requires careful asset curation: rejected/unreviewed/generated concepts must not be bulk-promoted to approved production art.

Changelog: https://docs.google.com/document/d/17R7aKkqDxQwRk-cmywQbvQ_CcEzz4UqHz37YYYRnADs/edit

Audit & asset curation: https://docs.google.com/document/d/1W09Tzw4sRLsy9zCQJGj9vPoiI8F01sjSCLyVpF54Xzs/edit

OWNER-CONFIRMED PLATFORM AND DELIVERY WORKFLOW — 22 NOV 2026

D-093 IRREVERENTS IS PRIMARILY AN IPHONE BROWSER / WEBAPP GAME. Desktop COMPUTER BROWSER play is a secondary possible target. This overrides any console-only or native iOS app-only assumption. Mobile touch ergonomics, legible pixels and actual phone performance are top-level requirements.

D-094 CLAUDE WRITES THE GAME CODE IN GITHUB. The project owner will configure a GITHUB→RAILWAY connection so committed/pushed code on the selected deployment branch automatically deploys on Railway to a playable WEB URL. This is the explicitly chosen INTENDED DELIVERY PIPELINE, not proof an active GitHub repository, Railway deployment or public URL already exists.

D-095 Exact engine, rendering API, repo URL, branch, Railway app/domain, networking, save backend, orientation, touch controls and desktop key mappings are OPEN until owner/implementation tests decide them. Railway itself is not a substitute for engine/network code. Any team member editing material Drive design files should add a dated routed entry to the shared 'changelog'; GitHub/Railway history is a separate technical change log.

Canonical platform/deployment document: https://docs.google.com/document/d/1uAu-ziYoHi9n7K3_YyxMgEiw23HuvOvDv1zRlhTRlp8/edit

OWNER-CONFIRMED DEFAULT USE AND CROSS-ASSISTANT ASSET ROUTING — 22 NOV 2026

D-096 All new creative assets, design proposals and prototype implementation decisions are APPROVED FOR IMMEDIATE USE BY DEFAULT. Claude and other builders should implement first and refine/replace later. Explicit owner sign-off is not required between asset-plan gates; previous wait-for-owner review instructions are SUPERSEDED. 'Ready to try' does not certify a file as a production-grade tile, sprite, code asset or final lore. Do not revive previously rejected/superseded images by bulk copying.

D-097 A Drive-native asset request handoff connects Claude with ChatGPT. Claude writes a new Google Doc titled REQ per requested asset into https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp. ChatGPT checks requests, completes feasible assets using available tools, uploads files to the Irreverents art area, updates request status, moves delivered docs, and adds an Eastern timestamp + direct links to root changelog. Requests needing input move to NEEDS CLARIFICATION. Avoid duplicate requests and inventing deliverables.

D-098 An HOURLY AUTOMATION has been ACTIVATED to check the Drive inbox, attempt feasible delivery, and log actual results. It is not instant; tools available during each automated run determine which requests can actually be fulfilled. If no requests, it takes no action. The queue may also be checked at the start of normal Irreverents sessions.

Collaboration hub: https://drive.google.com/drive/folders/1W_H99UY0Xne85PWK8Lb4QcKK2q2tSncu

Protocol: https://docs.google.com/document/d/1oBpJKI2P7v7rwoMku-TbcFuVQe2iajddK6v2i5Ro0G0/edit

Existing S00-01 use-now references: https://drive.google.com/drive/folders/1BCT_Sao2sZNCygUCv0qSQcECtIlsmc2j

D-096 OWNER OVERRIDE — HIGH-QUALITY ART, NOT GEOMETRIC PLACEHOLDERS (22 NOV 2026)

The owner explicitly REJECTED the recent C02 character sprite output as crude, lacking genuine animation and failing to resemble the earlier expressive pixel visual target. Future Claude-to-ChatGPT asset deliveries MUST include visual-art-direction first, real source-image/pose QA, distinct character shapes/personality, and accurate frame motion plus technical alpha/grid/manifest tests. No programmatically drawn rectangle-man output is acceptable as a polished art delivery even if the PNG is mechanically valid. Use the actual visual references in Doc 14 and the following controlling QUALITY GATE: https://docs.google.com/document/d/17OlSfBfTnUEUTmbo-zcsl4VrSn1mPny-zAP6kZaiodU/edit

D-097 The owner previously approved USE/ITERATION BY DEFAULT without personal pre-approval; that policy REMAINS. Default permission does not waive internal QA or acceptance. Poor or visually unvalidated output is marked IN PROGRESS — QUALITY REWORK and left in the inbox; temporary placeholders may be used only explicitly labeled NOT FULFILLED. Do not falsely deliver or move the request to Completed. Current C02 revision is priority; do not resurrect visually rejected v1.

OWNER CONFIRMED — CENTRAL ASSET DISCOVERY AND ROUTING 23 NOV 2026

D-096 The ROOT asset library index provides functional routing to ALL CURRENT significant game art, not merely newly delivered items. Before an assistant creates, requests or integrates an asset, it must inspect relevant earlier assets (especially rich original pixel character/scene references) and prefer reuse or conversion to inferior replacements. The user explicitly reported valuable prior assets being lost/overlooked. INDEX each new deliverable with exact Drive file/folder links, name, asset ID/category, status (visual reference vs importable prototype vs rejected), version, source request and integration usage BEFORE closing the request. Update current preferred version and changelog when superseded; no owner approval gate is added. A rejected asset stays rejected. This is discovery/routing governance, not a new canonical game mechanic.

ASSET INDEX: https://docs.google.com/document/d/1bnr7GUgrYBVVY0BMkwx4qRPvW45Nk4grn-Tk6THcoY8/edit
