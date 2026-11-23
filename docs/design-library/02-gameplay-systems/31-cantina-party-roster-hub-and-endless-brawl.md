**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/31 — Cantina: Party Roster Hub and Endless Brawl* (https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

THE CANTINA — PARTY ROSTER HUB AND ENDLESS BRAWL

Irreverents \| Owner-confirmed location and interaction loop; secondary details proposed \| 22 November 2026

# The place

A recognizable, freely playable CANTINA located in the BETWEEN-LEVEL world (not isolated in a menu). It is the physical gathering place for ALL currently UNLOCKED playable characters. As the player recruits new characters, they appear in the cantina, moving about / hanging out. This makes the growing permanent roster visible and tangible. They can have short idle movements or simple scripted movement loops; no NPC AI is permitted. The cantina is also where the player can RESET / RECONFIGURE the limited ACTIVE PARTY.

# Owner-defined party-swap interaction

1. In the cantina, the user TAPS an unlocked, wandering character they want to recruit into the CURRENT active team.

2. The ACTIVE TEAM MEMBERS appear ACROSS THE SCREEN as an immediately readable overlay/selection row.

3. The user TAPS the existing party member to replace.

4. The selected roaming character swaps into that party slot.

The interaction is inherently physical and direct: select a character already present in the world, then select whom to replace. Do not replace this with a long inventory interface, NPC dialogue tree, or list-scroll menu. The precise number of active party slots, confirmation effects, what happens if selected hero is already on party, whether active character must be physically at cantina and how multiplayer player-control allocation is managed remain OPEN.

Character roster and actively equipped adventuring party are different. Unlocked members remain available at the cantina even when not currently active in the limited party.

# Owner-defined endless cantina brawl

The player CAN ATTACK the unlocked playable characters hanging around the cantina and start a massive BAR FIGHT.

The fight should feel like SUPER SMASH BROS. with the existing platform combat emphasis: launched bodies, collisions, airborne blows, and knocking characters OFF THE SCREEN.

Characters controlled by the game respawn ENDLESSLY after being killed/knocked offscreen. Playable human-controlled characters ALSO can die/be knocked offscreen and respawn endlessly in the cantina. The brawl has NO final win/lose and no permanent casualty.

A live K/D (kills/deaths, or ring-outs/deaths depending on naming) COUNTER runs during combat, making high scores and friendly competition possible. Preserve scores/high scores as a gameplay opportunity; exact leaderboard dimensions (session best, character best, per-player, party, friends/global), sorting and tie rules are OPEN.

The cantina brawl is EXPLICITLY OUTSIDE ALL NORMAL NPC SYSTEMS. It does NOT involve business-as-usual/confusion-distress/violent-rage modes, reporting/alarms, wanted levels, reinforcements, townspeople joining a rage mob, or normal crime consequences. Do not apply ordinary permanent death/knockout, equipment loss or mission-failure rules here by default. It's a playful opt-in arena with bespoke respawn/scoring behavior.

NO NPC AI. Cantina fighters use manually authored attack patterns, simple scripted movement/targeting, knockback and respawn routines. Keep them simple enough to support lots of characters without simulation complexity.

The players should be able to practice movement, grapple, throws, copied powers where practical, knockback angles, spacing and combos with their unlocked characters against familiar fighters.

# Suggested small spatial layout — NOT LOCKED

A lively main floor with bar counter, tables and chairs; small raised side platform or balcony; one or two doors to surrounding between-level roads; visually readable outer edges where Smash-style launch / KO can count. Some tables could provide short-lived bounce/cover/throw effects if core interaction system supports them, without inventing an expensive destruction engine.

When not brawling, unlocked characters walk short simple paths, sit, idle and move to nearby positions; tap-to-select remains easy. When the brawl begins, standard cantina combat patterns activate for visible fighters. For scale, some unlocked characters may be background crowd until activated, but the user has confirmed that ALL unlocked playable characters should hang out here; do not silently hide them from the player's roster access.

To avoid the absurdity of an actual door collision being an instant death plane in the shared world, the ring-out boundaries can be an authored cantina arena rule. Their precise presentation is OPEN.

Alternative cheap layout: a single large 2D room, a raised balcony, two safe entry doors, four spawn pads, a row of seats and the bartender. No multi-level complex battle map required.

# Interaction and pacing cautions

Owner has not defined how to tell the difference between tapping a roaming character to recruit and attacking one to start a brawl. A clean idea: tap = party selection; attack button / combat action = brawl. Do NOT force two-stage dialogue or long animations to choose a character.

Owner has not specified a stop/exit/reset method. Proposed: brawl state naturally ends when the player leaves the cantina or selects a brief reset interaction; score persists as a record. It should be possible to reconfigure the party afterward without permanently disrupting access to wandering characters.

Does an active brawl temporarily suspend swapping, or can the player still tap and swap during fights? OPEN; make sure a fight never permanently prevents access to a needed character.

Respawn should be nearly instant, energetic, and return players to the game loop. Unlimited deaths do not mean the death/KO statistics stop being meaningful.

Avoid permanent penalties: wearing down a rare carried power or losing equipment every time someone gets KO'd in the optional brawl would discourage play. Equip/ability rules inside the arena are OPEN, but a no-loss exception is a strong recommendation.

K/D is distinct from normal Hall of Legends emergent feats, so the cantina can have its own arcade-style score display. Whether the Hall honors bar-fight feats as well is a creative option, not canon.

Online co-op should permit friends to brawl together and compare numbers. Party slot changes must not involuntarily steal a human player's currently controlled character; exact ownership protections and menus remain OPEN.

# Why this is high leverage

One location serves as a visibly growing roster showcase, party management hub, combat practice arena, repeatable Smash-style minigame, and social/co-op destination.

It makes the world BETWEEN levels an actual lived-in destination without forcing extra lore or exposition.

The game already needs character sprites, attack animations, knockback, death/respawn logic and a limited party roster. The cantina reuses those assets and a small arena-specific scoring/reset rule; no separate NPC cognition, quest system or procedural combat simulation.

Unlike the ordinary pursuit system, the combat here is deliberately consequence-free and endlessly replayable. The contrast itself makes the cantina fun.

# Acceptance tests

1. Unlock a new playable character elsewhere and return: that character is physically present among the cantina's wandering regulars.

2. Tap a nonparty character: the active team appears across the screen; tap one party member: the new character replaces them in the team, with no dialogue or heavy UI.

3. Attack one of the cantina characters: a chaotic Smash-style bar fight begins. Launching them offscreen counts a KO and immediately allows respawn.

4. Human player is KO'd: they respawn in the cantina and can fight again, indefinitely.

5. K/D runs correctly for both human deaths and human KOs, with a route to personal high scores; no victory/game-over lockout.

6. No wanted-level rise, guard summons, narrative distress/rage or normal reporting as a result of cantina combat.

7. Leave and return: cantina reverts to functional party selection, with any retained high score accessible. Exact match lifecycle and score persistence implementation OPEN.

8. Multiple players can fight in the same cantina and swap active roster without the game forcibly taking away someone else's controlled character.

9. Cantina actors remain scripted and simple; all normal game NPCs still have NO AI.

# Authority

OWNER CONFIRMED: Between-level cantina; ALL unlocked playable characters hang out/wander in it; party reset here; tap candidate character then tap currently active member to replace, with active team displayed across the screen; attacking them initiates a massive Super Smash Bros.-like brawl; launched offscreen characters respawn endlessly; humans also die and respawn endlessly; live K/D scoring and high-score potential; cantina combat completely outside the normal NPC systems.

PROPOSED / OPEN: room geometry, idle wander behavior, how the brawl ends, precise K/D attribution and leaderboard format, equipment and temporary-power persistence, co-op swapping concurrency, fighter active-sprite limits and which brawl hazards can be used.

OWNER-CONFIRMED ADDITION — WORLDWIDE SHORTCUT ENTRANCES, CHASE LOCKOUT, AND COMPLETION OVERRIDE (22 NOV 2026)

CANTINA ENTRANCES: There is ONE MAIN ENTRANCE and MULTIPLE SHORTCUT ENTRANCES DISTRIBUTED AROUND THE PLAYABLE BETWEEN-LEVEL WORLD. Players can use these to return to the cantina, reset the active party and visit the endless brawl. These are navigational shortcuts to the actual physical cantina, not automatically separate cantina instances. Exact shortcut locations/quantity and how they're discovered are OPEN.

DEFAULT ANTI-ESCAPE RULE: If a player is CURRENTLY BEING CHASED BY GOOD GUYS, EVERY cantina entrance (main and shortcuts) is LOCKED to them. The hub is NOT a shortcut for breaking line of sight, bypassing wanted-level cooldown or instantly resetting pursuit. Ordinary lockout applies to the whole cantina entrance network, not just the nearest door. Whether an investigation with no current active pursuit locks doors is OPEN; do not inflate “currently being chased” to all low suspicion without owner approval.

SPECIAL COMPLETION UNLOCK — A HYPOTHESIS ABOUT WHAT MYSTERY COMPONENTS DO: The owner has not decided the main purpose of the hidden LEGO-like MYSTERY COMPONENTS. However, after the player has FOUND ALL THE MYSTERY COMPONENTS (exact completion scope/structure remains to be designed), ONE OF THE UNLOCKED REWARDS should permit ENTERING THE CANTINA EVEN WHEN PURSUED BY GOOD GUYS. THIS DOES NOT CANCEL WANTED STATUS: the chasing good guys CAN FOLLOW THROUGH INTO THE CANTINA. They arrive physically, potentially bringing reinforcement pressure and overlapping with the endless Smash-style brawl.

SPECIAL CROSS-SYSTEM EXCEPTION: The original cantina rule that its inhabitants and human fighters have endless respawn/ring-outs/KD and do not run ordinary NPC distress/guard-report/wanted logic STILL applies to CANTINA ROSTER FIGHTERS. However, the now-unlocked exception allows EXTERNAL PURSUING GOOD GUYS to enter with the normal active pursuit/wanted state they had outside. These hostile outsiders need not behave like infinitely respawning roster members. The existing real-calls-before-scaled-reinforcements rule still governs pursuing authorities. Do not reinterpret the owner's desired crossover as a default ordinary cantina crime incident.

PLAY EMERGENCE: a player fleeing a high wanted-level response reaches an unlocked shortcut door, dives into the cantina, and a squad of pursuing good guys storms in after them. The unlocked roster fighters are already participating in a Smash-like melee; large launch attacks, KOs and endlessly respawning heroes can collide with guard squads, making a ridiculous crowded three-sided or many-sided fight. The player can continue fighting, with external wanted pursuit sustained, rather than the cantina being a refuge. The exact loyalties, guard KO/respawn handling, KD attribution for outsiders, death penalties, whether guard signals bring still more authorities inside, and how the event terminates are not yet specified.

IMPLEMENTATION / NO AI: Each entrance checks a compact flag (currentlyChasedByGoodGuys && !completionUnlock = locked). Once unlocked it routes into the ordinary cantina and transfers limited active pursuer sprites / chase state through the same room connection. Cantina locals keep their script-driven battle and unlimited respawn mode; outside guards keep bounded pursuit rules. A faction/targeting flag and collision/hit rules allow fights between the groups, with no NPC AI, no lengthy lore or bespoke cutscene.

IMPORTANT: Do not assign the overall purpose of the components or force them to assemble into a specific item just because this reward is known. This cantina exception is ONE unlock among as-yet-unknown possibilities. Distinguish owner-confirmed gates from open reward architecture. The precise meaning of ALL components (worldwide or a master collection versus many per-level sets), the moment/reveal of reward, and whether an unlock can be used in co-op when only one player meets the condition remain OPEN.

ACCEPTANCE TESTS:

1. Player not in good-guy pursuit can enter via main door and several between-level shortcut doors.

2. Good-guy guards actively pursue player: EVERY entrance denies access, even if the player finds a convenient remote shortcut.

3. Player escapes/hides long enough to end the active chase: doors open again as usual.

4. Once required mystery components are all found and special entrance ability unlocked, chased player can enter via any cantina entrance; the already-pursuing good guys follow, without losing wanted level.

5. The mix of endlessly respawning cantina fighters and pursuing guards creates a hectic brawl while respecting each group's distinct rules.

6. There is no accidental cantina reset that deletes pursuers, voids completed calls, clears wanted level or grants players a safe cooldown.

7. Party-swapping touch interaction still functions when appropriate; treatment during the special mixed brawl remains a design question.

IPHONE-BROWSER CONTROL AND PERFORMANCE REQUIREMENTS (22 NOV 2026)

This entire game is PRIMARY for iPhone web browsers, secondary possible desktop browsers. The cantina's owner-defined TAP a wandering unlocked character → show active party ACROSS SCREEN → TAP the one to replace is the touch UI anchor. ATTACK remains a distinct combat gesture/action. Party list must fit a small phone viewport and avoid obscuring exploration/brawl unnecessarily. Endless offscreen KOs/respawns and huge guard-cantina mixed fights must keep bounded active sprites and legible K/D so they run well on real iPhones. Browser launch, controls and multiplayer load should be tested from a real Railway-deployed URL once owner connects Claude GitHub code to Railway. Full platform spec: https://docs.google.com/document/d/1uAu-ziYoHi9n7K3_YyxMgEiw23HuvOvDv1zRlhTRlp8/edit
