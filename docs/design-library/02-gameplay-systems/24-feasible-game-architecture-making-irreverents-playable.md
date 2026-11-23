**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/24 — Feasible Game Architecture: Making Irreverents Playable* (https://docs.google.com/document/d/1WdIyj6OrTzMhXD842nIJ4iIlQYlFuQQiwxNj2ygIyYM/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

FEASIBLE GAME ARCHITECTURE — MAKING IRREVERENTS PLAYABLE

Design/production proposal \| 22 November 2026 \| Not a locked technical specification

# Executive premise

The ambition is NOT an unlimited dynamic world. It is a bright, legible GBA-inspired 2D action adventure, grounded in Kirby & the Amazing Mirror-like interconnected exploration, LEGO-style character types, satisfying Smash/Kirby-like impact and D&D's Chaotic Neutral/Rule of Cool, given an original cultural/NPC response system.

Most complexity should be concentrated in a SMALL REUSABLE RULESET that multiplies the possibilities of authored levels. Make a world that invites “I wonder if...” within a finite vocabulary. New content should mainly be additional rooms, interesting combinations of existing objects, unique enemy silhouettes and rare memorable setpieces, not entirely new code for every room.

# Three-tier production truth

Tier A — real reusable game systems: 2D movement and hitboxes, authored room graph, tile collisions, character abilities, tagged interactions, simple stealth, NPC role expectations and three modes, knockback/throws, a few vehicles, category-based event recordings.

Tier B — cheap authored flavor: reusable NPC dialogue templates; hand-authored role-specific barks; scripted reaction poses; predetermined breakable secret walls; short cutscenes; special-case interactions for flagship palace and Hall.

Tier C — expensive fantasies deliberately NOT promised: arbitrary object transformation; infinite procedural dialogue; dynamically generated plotlines; every object physically movable/breakable; crowds of hundreds with full independent AI; seamless high-fidelity synchronized destruction across online clients; every NPC comprehending every improvised plan; each artifact working on arbitrary other artifacts; fully persistent world geometry; AI generating runtime assets; exact rich chain of events from a narrative vignette without bespoke scripting.

Players can still experience surprising combinations of Tier A + B, provided the rules are reliable and honest.

# Core actor model

Each active NPC has:

ROLE — a small archetype tag (merchant, guard, hero, villain, sage, creature, civilian, champion, etc.).

NORMAL BEHAVIOR — patrol, sell, train, threaten, defend, guard, deliver prophecy, fight hero, or other simple role-specific routine.

MODE — three confirmed modes: BUSINESS AS USUAL, CONFUSION/DISTRESS, ABSOLUTE BLINDING VIOLENT RAGE.

DISSONANCE — a small local accumulated value, triggered when observed behavior contradicts the expected roles.

PERCEPTION — coarse line of sight/hearing + recent witnessed events, plus optional locally propagated alert.

COMBAT PROFILE — independently determines how they fight, defend, flee or charge. Business as usual CAN include expected physical combat.

RUMOR/AFTERMATH FLAGS — optional bounded persistent events per important location, distinct from moment-to-moment emotion.

A mob needs no intelligent NPC agents: scripted crowd sprites, simple fixed movement patterns, and a shared scene-level trigger can create the appearance of social convergence.

# Observed actions as game events

Use one event bus with a compact action vocabulary:

BUY, GIVE, THREATEN, ATTACK, RESCUE, STEAL, TRESPASS, USE_SACRED_OBJECT_UNEXPECTEDLY, BREAK, GRAB, THROW, ACCEPT_QUEST, CHALLENGE, FLEE, etc.

Each event stores actor role, target role, place/context, visibility/audibility, severity, location and game-time. NPC archetypes evaluate whether action is EXPECTED, ODD/FLUKE, or DEEPLY INCONGRUOUS for that actor in that situation.

Avoid giant combinatorial data matrices. Use default rules by actor role and action family with a few strong scene overrides. The story's distinctiveness comes from role-sensitive expectation checks, not from huge tables:

- Hero BUY potion from merchant: expected; merchant delighted.

- Villain THREATEN/STEAL from merchant: expected; merchant happily opposes the villain.

- Villain BUY potion politely: unexpected; merchant becomes confused/distressed, potentially raging if villain insists.

- Hero ATTACK foretold dragon: expected, even if that battle is intense.

- Hero suplex king during royal audience: extreme deviation.

- Villain fights hero at lair: expected.

- Hero ignores villain to dismantle throne: unexpected.

Include “probably a fluke” inertia: one odd event causes a startled correction; repeated deviation accumulates distress.

Immediate normalization should be surprisingly fast when a convincing role-conforming action is seen. Exact persistence after serious harm must be playtested; this is not blanket impunity.

# Mode logic, no fake extra canonical modes

BUSINESS AS USUAL: execute archetypal routine (which may include villainous aggression or expected opposition).

CONFUSION/DISTRESS: stop/interrupt, stare, correct, plead, call for help; accumulate dissonance and try to restore script.

ABSOLUTE BLINDING VIOLENT RAGE: aggressively approach and interfere, including normally peaceful NPCs/pets. Ordinary residents have limited fighting skill; guards/champions retain stronger combat toolsets.

Both distress and rage can rapidly reset to business as usual on reliable expected action. Auxiliary alert counters and reaction animations are internal implementation detail, not extra “modes.”

Pets joining the mob can be cheaply implemented with a generic leap/bump/swarm actor or a triggered simple feline attack animation; do not simulate theology for cats.

# Bounded systemic affordances

Start with 5–7 physical object attributes, not a full sandbox physics engine:

MOVABLE/PUSHABLE, GRABBABLE/THROWABLE, BREAKABLE, OPERABLE, IGNITABLE/ENERGIZABLE, HIDING/ACCESSIBLE, VALUABLE/OWNED.

A tagged object gets a small standardized interaction response. Most world geometry is just collision tiles. Important objects advertise one or two affordances via position, animation or familiar shape, not an icon hovering above every prop.

For example: table = GRABBABLE/THROWABLE and COLLISION SURFACE if world rules permit; royal wall = BREAKABLE, reveals authored tunnel; treasure chest = VALUABLE/OPENABLE; suppression machine = RIDEABLE/HIJACKABLE with a driver entrance; throne = HEAVY/PUSHABLE only if specifically authored.

Limit combinations through clear categories and capped behaviors. A fire power should work on a consistent tagged list of flammable objects, not require hand-authored behavior for every tile. A shrink potion that affects every creature would imply an immense animation/physics budget; instead make it a special case for a small, clearly telegraphed subset of creatures if desired.

# Combat that feels huge with scripted opponents

2D hitbox attacks, a readable grab/throw, hit-stop, invulnerability windows, animated recoil, standardized launch trajectories and simple collision response make impacts satisfying.

Only some wall/platform tiles break. Destruction has intact/damaged/broken states, dust, and short-lived rubble. Setpieces like stained glass can have a few authored destruction frames.

Lightweight crowds should be cheap to draw and update. Ordinary members can execute fixed rush, jump and bump patterns and receive throw reactions; elites have authored attack patterns. Trigger response tiers as authored local waves and cap active sprites, attacks and collision checks. Use audible commotion, silhouettes and parallax crowds to imply a larger horde.

Avoid fully physical ragdolls, arbitrary voxel destruction or hundreds of full-navigation agents at first.

# Exploration remains the main foundation

Author a 2D room graph with doors/links, loops and small hidden branches. The space BETWEEN obvious regions is playable. Build every main location with at least two routes and at least one secret return incentive tied to ability or power.

Rooms remain handmade. World mystery doesn't require generated geography. No mandatory single boss choke point for the whole map. Use persistent discovery and limited world-event flags rather than persistent damage everywhere.

# Hall of Legends, phased pragmatism

First version: detector for three categories (stealth without alarm, standout last stand, narrow escape), thresholds plus an event stats buffer, one runtime screenshot captured at a memorable moment, a generated title from safe authored templates, a simple in-world framed image. Record participating players and event context as structured data.

No full replay synthesis, no cutscene generation, no AI ranking and no global social feed are necessary for the first prototype.

Later: improve highlight selection, per-player cross-session records and Hall self-attack detection. The game's permanent co-op history is a major promise, but can be tested after local episode capture works.

# How a ten-minute session becomes actually buildable

Use one interconnected miniature kingdom with four to six authored areas, not dozens of freeform incidents:

A throne room supports king speech, ordinary quest acceptance, one palace secret and one or two spectacular breaches.

An adjacent street supports role-readable merchants, a villain, ordinary purchases, a guarded target and simple pursuit.

A hidden tunnel or rooftop supports surprise shortcuts and character revisits.

A small courtyard supports a heavy patrol enemy that can be hijacked and driven through a designated breakable roadblock.

A Hall gallery supports a recorded event as an actual physical exhibit.

Every object needn't participate in every gag. The scene can be playful because the game presents an irresistible selection of interactables on top of solid general rules.

# Online co-op: avoid the major trap

Permanent vision: one shared limited expedition party, online friends controlling different members, possibly spread across regions. This is confirmed.

For production, prototype SOLO FIRST with the same finite party/character-switch design. Then 2-player online within one bounded cluster of rooms, network-synchronizing only actors, meaningful projectiles, major breakables and event records. Split-region streaming, cross-save Hall history and fully independent cameras are harder later features and should not be falsely claimed easy. Preserve architecture that can evolve toward them, but do not make them gate early proof of game feel.

This is staging, not removing co-op from the target game.

# Prototype scope (illustrative recommendation, NOT owner-approved scope)

A 15–30-minute replayable sandbox slice might use:

- ~5–6 connected 2D rooms with 2–3 hidden connections and one revisit secret.

- 3 playable archetypes: grappler, tiny infiltrator, flyer (names/art not committed).

- 2 acquired powers or collectible tools (e.g., fire and invisibility or limited grab/speed variants).

- 3–4 ordinary NPC archetypes including merchant, guard, villain and one animal.

- 3 high-level modes for ALL NPCs.

- 8–12 reusable interaction/event tags; 8–15 tagged interactable objects.

- 3 combat enemy response tiers, but very few unique attack animations.

- 1 hijackable machine with a simple side-view movement/ram ability.

- 1 Hall pedestal with capture-based event commemoration.

- 1 signature scene (the royal court), including freedom to move, react and choose an exit. The three-hour hidden credits can be added cheaply after speech loop logic is stable.

These are design assumptions for feasibility; counts should be revisited after first playtest.

# Decision gates, in order

GATE A: movement + jump + attack + grab/throw are joyful in a graybox test; 3 character abilities are distinct.

GATE B: hand-built 4–6 room map is explorable, revisitable and supports two unadvertised routes.

GATE C: shopkeeper + villain demonstration supports normal robbery as comfortable conflict, polite villain transaction as distress, persistent violation as rage, and quick reset.

GATE D: same location supports a zero-alarm intrusion AND a catastrophe that becomes enjoyable combat/pursuit with a credible escape.

GATE E: simple Hall captures a real highlight, without scripting the event itself.

GATE F: 2-player same-party online works reliably; only then extend geographic independence and all-player portable history.

Do not mass-produce worlds, hundreds of sprites or dialogue before these gates demonstrate the core experience.

# Feature triage

MUST BE REAL: level navigation, character switching, baseline collisions, stealth basics, tagged objects, 3 NPC modes, physical impact, responsive pursuit, limited meaningful outcomes.

CAN BE A TRICK: scripted destruction of special props, preauthored secret tunnel reveals, canned NPC role barks, staged mob sprites, a special-case shrinking dragon, one alternate credits ending, hand-selected opening room curiosities.

LATER: many factions and continents, sophisticated social history, truly asynchronous multiplayer rooms, networked mutable terrain, scores of highly distinct vehicles, arbitrary transformations, elaborate screenshot ranking, deep NPC learning, huge world-simulation.

DO NOT BUILD: unrestricted player natural-language commands or AI improvising every action at runtime to achieve Rule of Cool. The game should support a rich finite set of player verbs, not promise omnipotence.

# Source and canon guardrails

This is a practical production proposal derived from user-confirmed vision: Amazing Mirror-like exploration; LEGO-style role types; Ultimate Alliance-style unlockable roster/shared party; acquired powers; Smash-like impact; intense stealth and cascading response; a society enthralled by typecast Hero's Journey; three modes across heroes/villains/merchants; rapid pacification; Hall history.

The implementation strategy, counts, event schema and milestones are NEW RECOMMENDATIONS, not existing canon and not commitments by the owner. Preserve scope decisions as OPEN in the register until chosen.

OWNER ARCHITECTURE CORRECTION — NO NPC AI (22 NOV 2026)

Owner has explicitly ruled out AI for all NPCs. This overrides any earlier wording suggesting full NPC agents, sophisticated AI, NPC reasoning, learning, adaptive planning, or autonomous decision making. The shopkeeper, villain, guard, champion, cat and crowd are game actors driven by handcrafted animations, event triggers, fixed action/role mappings and simple deterministic state rules. The three emotional modes can be stored as state flags and changed by explicit observed game events. A scene-level controller can trigger NPC barks, approach/attack animations, scripted movement, spawn/wave schedules and quick return to routine. These are author-defined game rules, not AI. Even ordinary game-development jargon such as 'NPC AI' is misleading for this project; call it NPC scripted behavior or NPC response logic. Specific rule tables and movement/trigger mechanics remain to be selected. Do not assume NPCs evaluate arbitrary actions, understand intention, reason or learn. The finite set of possible reactions and targetable interactions must be practical enough for manual authoring and testing. This is CONFIRMED scope, not a new optional recommendation.

NEW OWNER-CONFIRMED HOSTILE OUTPOST SYSTEM — 22 NOV 2026

Distinguish two escalation contexts. Attacking expected good guys drives scripted narrative-dissonance counteroffense, including guards and eventually ordinary civilians, with fast calm when heroes visibly return to expected conduct. Attacking proper bad guys is ordinary role-conforming conflict; their escalation is TACTICAL. Hostile enemies appear throughout levels and in outposts with visible CALL-REINFORCEMENTS SIGNALERS. To use one, an eligible enemy DETECTS a player, RECOGNIZES the player as a THREAT, GETS TO the device, and calls backup. Players can stealthily avoid this, eliminate/intercept the caller, destroy/disable the signaler, clear the outpost without allowing further signaling, or escape the zone. Subsequent calls may summon repeatable escalating waves indefinitely while the possibility remains; the system must never impose an arbitrary maximum wave count. Existing summoned enemies do not vanish just because the alarm is later destroyed.

NO NPC AI: detection/recognition are simple collider or line-of-sight and flag triggers; enemy movement to the alarm is an authored route or fixed move-to-point routine; signaler use is a timed animation; wave arrivals come from authored spawn tables and doors. Cap simultaneous costly characters, reuse enemy types, add difficulty over repeated calls rather than unbounded spawn counts. Optional outpost-specific alarm interactions are not required for every level; scattered normal enemies remain the baseline. Exact repeat-call versus continuous-running-alarm implementation is OPEN.

Reference gameplay spec: https://docs.google.com/document/d/11sUrQ0eFfjXi_inoYBFnYGJ6FA_IAc5fJeKfru5KDIQ/edit

OWNER IMPLEMENTATION OVERRIDE — NO OMNISCIENT RESPONSE (22 NOV 2026)

All SCALING REINFORCEMENTS (friendly authorities OR villain outpost waves) require a successfully COMPLETED signaling event. No witness = no reinforcement call. A solo merchant in rage can attack locally, be knocked out and be robbed with area alert still 0. A later NPC discovering the unconscious merchant may become distressed and go to an explicit call point; only actual report completion brings investigation or police. Good NPCs call only in emotion modes 2/3.

Store personal NPC mode 1/2/3 SEPARATELY from zone wanted/heat 0..N. NPC mood affects the ability to attempt a signal; signal completion changes area alert state. An NPC's rapid psychological pacification does not automatically retract a completed report. Wanted levels inspired by GTA/NFS can escalate upon further actual reporting by responding NPCs or surviving witnesses. No police psychic knowledge of perpetrator identity.

This is entirely deterministic, with scene events/waypoint paths/report interact timers and authored spawn tables. Villain outpost mode-gating ambiguity stays OPEN because a conventional villain legitimately fights a hero in mode 1 but may still recognize a tactical threat.

Detailed authoritative design: https://docs.google.com/document/d/1wbSNfKLfrUsg9YX5qsRhYX9KwiMX8clXRZZBiuuz8PA/edit

OVERRIDING OWNER DELIVERY CONSTRAINT — IPHONE BROWSER / GITHUB / RAILWAY (22 NOV 2026)

The TARGET GAME runs chiefly as a BROWSER / WEBAPP on iPhones, with desktop browsers possibly supported. Design controls, action pacing, sprite sizes, HUD, audio, connection interruptions, loading and scalable sprite counts FIRST for an actual mobile browser, not a PC/console. Touch gameplay without hardware controller must support movement, jump, attack, grab/throw, special powers, hiding and character switching. Browser orientation, engine, render choice and input layout remain OPEN.

SOURCE OF CODE: GitHub, authored by Claude. OWNER plans to CONNECT that GitHub repo to Railway so code changes auto-deploy to a playable URL. Setup and any actual URL remain UNVERIFIED. Railway hosts deployment but does not automatically provide a game engine, multiplayer server architecture, player save model or tested networking. Test on iPhone Safari after configuring deployment. Authored NO-AI NPC behaviors, bounded simultaneous crowds and room transfers are particularly important to performance. Full current requirements: https://docs.google.com/document/d/1uAu-ziYoHi9n7K3_YyxMgEiw23HuvOvDv1zRlhTRlp8/edit

PREVIOUS VILLAIN-MODE AMBIGUITY CLARIFIED: villains can recognize a threat and operate their outpost signaler in Business As Usual mode (1). A successful signal, not recognition alone, summons new reinforcements. Do not follow the earlier open ambiguity.
