**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/27 — Persistent Wanted Pursuits and Three-Sided Battles* (https://docs.google.com/document/d/1RMdB5x9k3wfVKolnYhZLtuwLYrm3lmrO1w6fpjCy7po/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

PERSISTENT WANTED PURSUITS AND THREE-SIDED BATTLES

Irreverents \| Owner-confirmed direction with implementation proposals \| 22 November 2026

# The new critical distinction

A single NPC's personal emotional mode can change quickly, but a pursuit that has already been reported is a separate, increasingly sticky game state.

Owner-confirmed: when attacking good guys, escalation gets harder and harder to reverse. If the heroes defend themselves at all during an active pursuit, pressure continues to rise. Players must FULLY DISENGAGE AND HIDE (or otherwise genuinely lose pursuit) for long enough for the wanted level to drop. Ordinary role-conforming behavior cannot be used as a trivial magical reset once police/guards are actively chasing.

Owner-confirmed: guards and other pursuers can chase heroes OUT OF THE ORIGINAL AREA INTO OTHER PLAYABLE LEVEL-REGIONS. Those levels may contain hostile bad guys, and pursuers can CLASH WITH THE BAD GUYS, producing emergent three-sided battles.

This new clarification supersedes any earlier suggestion that buying a potion or joining a procession IN FULL VIEW OF PURSUING GUARDS instantly erases an active shared wanted level. Rapid psychological reassurance is most useful BEFORE a report is sent and AFTER a genuine pursuit has been lost; it is not a replacement for hiding under active pursuit.

# Personal modes, wanted state and information propagation

PERSONAL MODE (owner-confirmed): Business as Usual / Confusion-Distress / Absolute Blinding Violent Rage.

LOCAL WITNESS/REPORT (owner-confirmed): NPCs react locally to their observations. Good NPCs only attempt to call for help in modes 2/3. No scaling external reinforcements without a real successfully completed signal.

ACTIVE PURSUIT/HEAT (owner-confirmed): A successful report dispatches an organized response. Continuing to fight/defend against police guards feeds ongoing heat, and the pursuit becomes harder to escape as the pressure rises. Full disengagement plus time spent unseen is needed to reduce heat.

GEOGRAPHY (owner-confirmed): Pursuing guards can move into other connected level spaces rather than being artificially confined to the original town/room. Regional enemies may be hostile to the guards as well as the party.

These are conceptually distinct variables, not an obligation to build complex autonomous AI.

# Important compatibility with the earlier signaling rule

The owner previously confirmed that ALL SCALING REINFORCEMENTS require someone to actually call for help; anger or a punch by itself must not magically summon unseen authorities.

How to implement “defending yourself raises the alarm level” while respecting that rule:

A) If a pursuit is active, combat and witnessed defensive action can increase immediate local heat or interrupt its cooldown, because it proves the target is still actively resisting.

B) Any NEW outside reinforcements or higher-tier dispatch must still have a real signaling path: a responding guard with a whistle, horn, flare, signal device, guard post, or allied NPC who completes a call. That call could be quick and automatic in animation once observed, but must be a genuine visible/audible signal opportunity; the player may be able to interrupt it.

C) Depending on the final design, a successful report might open a continuing dispatch channel, with subsequent reports/status updates escalating the official pursuit; exactly how to maintain this signaling requirement with fluid high-heat gameplay is OPEN.

This is a suggested reconciliation, not a new owner-approved implementation. Do NOT reinterpret “combat immediately raises heat” as permission to materialize police without a completed report.

# Suggested readable chase/wanted cycle

0 — UNREPORTED: an isolated crime can occur without outside backup. Shopkeeper may be enraged, but does not summon guards before calling.

1 — REPORTED/INVESTIGATING: police/guards receive a real report and come to the scene. Their knowledge is bounded by what witnesses actually observed.

2+ — ACTIVE PURSUIT: players are identified or detected; guards attack and try to continue signaling. Higher pressure means more challenging waves, search and units.

HIGH HEAT — STICKY PURSUIT: a player fighting back keeps pressure high, may cause further reports and new waves; simply acting politely doesn't persuade an active pursuer to stand down.

DISENGAGED / SEARCH: break line of sight, move into hidden tunnels, backtrack, hide behind mechanisms or use special character abilities. Search persists for a while. If sighted or if player fights during the search, reset the cooldown and continue pressure.

COOLED / LOST: spend enough time truly hidden; wanted state drops through tiers or ends. Ordinary role performances can again be reassuring to local NPCs if they lack live knowledge of the case.

Exact number of levels, cooldown duration, region search boundaries, which fights reset cooldown, and pursuer memory are all OPEN. This is an illustrative model, not five/six locked levels.

# Example: shop robbery becomes a grand escape

Start in small village shop. Hero attempts robbery. Merchant tries to reach a report point. Player can knock him out before the call and escape with no shared response, if unobserved.

If a second witness manages to signal, a patrol enters from a nearby street door. The hero fights them, drawing attention and giving surviving guards opportunities to signal for more support. The player can defeat a few guards, but continuing to fight means they cannot cool off.

Hero retreats into a forest level, crossing actual neighboring rooms. Pursuers follow via room connectors, continuing to search and fight when they see the player. The forest also contains ordinary bandits and a modest enemy outpost with a bell.

A guard meets a bandit. As scripted antagonistic factions, they engage each other. The hero can sneak past while the two fight, or throw a bandit into a guard, or use the crossfire to escape up a canopy shortcut. If an eligible bandit sees either a threatening player or a threatening guard and successfully reaches the bell (final eligible target rules open), the bandit outpost can summon its own reinforcements.

At this point there are potentially three parties: royal pursuers, bandits/outpost defenders, and the playable expedition. Their competing blows and collision interactions can generate the kind of spectacular multi-sided battle players remember, without bespoke mission dialogue.

The player can exploit the fighting to escape into a root tunnel, hide until pursuit decays, then emerge to explore the forest. If they instead keep fighting everyone, the clash may grow into an enormous last stand. Neither result is a required mission script.

# Level design requirements to make cross-region pursuit work

Real room connections: an exit to forest, a bridge to ruins, and a castle door must be navigable as pursuit transitions wherever appropriately reachable; don't reset heat on a new level title.

Preserve only a reasonable set of pursuing guard actors across a room boundary. For budget, the system can reinstantiate/transfer a bounded pursuing squad through the same doorway and preserve their chase/wanted data instead of simulating guards offscreen. No NPC AI is required.

Faction hostility matrix: TownGuard ↔ Bandit, RoyalGuard ↔ Undead, VillainMinion ↔ Guard, etc., where appropriate. Attacks and collisions should work against all physically present sides, not only the player.

Scripted targeting and movement: fixed rules choose nearest/visible hostile, with authored patrol/attack/approach modes. No agent planning or language model.

Signal devices belong to the local factions. The bandit bell calls bandits; royal whistles or guard stations call royal backup. One faction should not automatically commandeer the other's signal network.

Sightlines and hiding are legible: if the player gains a concealed high branch or maintenance shaft, the squad should search and eventually time out rather than have perfect knowledge.

Intersections are authored intentionally: place some outposts near public roads, castle approaches and caverns so player-caused three-way battles are frequent enough to be discoverable, but not mandatory for every level.

Collision/knockback is the star: guards and bandits throw each other and can be bounced into platforms or traps. Player-created chaos should not depend on dialogue or cutscenes.

# Three-way clashes as combat improvisation, not plot

An enormous group of guards pursues the party into a cave full of skeletons. Skeletons attack everyone. The player uses a strong character to fling a skeleton into a guard, then escapes through a small fissure with the tiny party member. One guard falls into a spike pit; two skeletons continue fighting the rest. No one delivers a speech. It is simply how faction, collision and environmental hazards combine.

Another run: the party tries to quietly pass the same cave and never encounters the guards. The skeletons are just ordinary level enemies. The chase is emergent, not the cave's “special quest.”

Villains can be quite happy to fight expected heroic pursuers in Business as Usual mode; this does not mean they must be distress/rage NPCs to defend their base.

# Development economy and pacing

NO NPC AI: local detection, reporting, chase movement, simple target selection, attack sequences, knockback, faction hostility, heat decay and reinforcements are all deterministic authored game systems.

Start with three connected areas: a town/shop, transition passage and forest bandit outpost. Test an unreported silent heist, a reported shop fight, a cross-boundary chase, guard-versus-bandit conflict, and escaping by hiding. Then extend to other rooms/regions.

To avoid runaway cost, cap simultaneous active pursuer sprites, transfers across doors and wave sizes. Higher wanted levels can mean stronger types, shorter reporting delay, more roadblocks, etc., not literally infinite agents in memory.

Main risk: sustained defense becomes a hopeless endless fight with no way to disengage. Counter by giving each level hiding opportunities, escape routes, small passages, and some ways to split opposing groups, but avoid trivial universal heat-reset buttons.

Main reward: the player who started a small shop robbery may unexpectedly create an epic battle deep inside a ruin they have never visited. This is emergent from a finite set of level and combat rules.

# Confirmed vs unresolved

OWNER-CONFIRMED: reported good-guy pursuit is harder and harder to reverse; defending/fighting at all sustains or escalates wanted heat; full disengagement and adequate hiding/cooling time required; pursuing guards can enter other levels and collide with bad guys; all new scaling reinforcements require actual signaling; no NPC AI; little dialogue; exploration, combat, stealth and co-op are primary fun.

IMPLEMENTATION PROPOSALS: chase cooldown timers and tier mechanics, faction matrix, actor transfers between rooms, guard signals for escalating reinforcements, pursuer cap, target selection priorities, chasing enemies into bandit outposts, cross-faction signals and roadblock sequencing.

OPEN: exact level count, thresholds, whether post-contact defensive action increases numeric tier immediately or only prevents cooldown until additional reports, whether ordinary NPCs re-normalize when the wanted system is still active offscreen, how search patrols communicate across regions, escape/teleport exploits.

SUBSEQUENT OWNER CLARIFICATION — ENEMY SIGNALERS DO NOT NEED EMOTIONAL DISTRESS (22 NOV 2026)

Villains call for tactical help whenever they detect and RECOGNIZE players as a threat, from mode 1 BUSINESS AS USUAL if appropriate. They need not feel violated or enter confusion/rage. A successful call still requires a real, visible action: sound a held horn, reach and operate a bell, hit an alarm station, or another predefined signal. Players can interrupt/silence the caller or disable the signaler; recognition alone triggers NO outside waves. Contrast: good guys may attempt reporting only in modes 2/3. This resolves the uncertainty left in the earlier “confirmed vs unresolved” section above. Inspirations: Zelda BOTW/TOTK monster lookout horns (alert allies) and Far Cry 5 outpost alarm stations (call extra reinforcements). Enemy recognition, calling and pursuit remain pre-scripted/rule-triggered, not NPC AI. Source examples: https://www.zeldadungeon.net/wiki/TextDump%3ATears_of_the_Kingdom/Loading_Tips ; https://primagames.com/eguides/far-cry-5-eguide/training/cult-outposts ; https://zeldadungeon.net/wiki/Monster_Horn

OWNER-CONFIRMED DE-ESCALATION THRESHOLD — DISTRESS REASSURABLE, VIOLENCE REQUIRES COOLDOWN (22 NOV 2026)

This overrides all earlier examples that depict good-guy NPCs instantly resetting from violent rage when a hero buys a potion, bows, or resumes an expected role.

GOOD GUYS MODE 1 — BUSINESS AS USUAL: no corrective action needed.

GOOD GUYS MODE 2 — CONFUSION/DISTRESS: can be reversed quickly by the player convincingly behaving normally according to their heroic role; the observer happily accepts that the oddity was a fluke. As already confirmed, some distressed witnesses might attempt to report; prevent the call to avoid new reinforcements.

GOOD GUYS MODE 3 — ABSOLUTE BLINDING VIOLENT RAGE: returning to normal behavior IN VIEW is insufficient. The player must FULLY DISENGAGE and AVOID the hostile good guys for a sustained period, allowing the GENERAL ALARM / WANTED PRESSURE to fall below the VIOLENT THRESHOLD. During the cooldown, do not attack anyone even in self-defense, destroy anything, or do ANYTHING unexpected; ANY further incident prevents or resets the clean cooldown. Simply refusing to attack while still being chased and visible is not enough.

Once the shared alarm falls below violent level, the lower-level reassurance rule can apply again. The exact timer, alarm scale, individual-versus-general hysteresis, and whether cooling occurs in stepped tiers or continuously remain unselected. Practical proposed implementation: one shared reported heat variable, a no-incident cooldown timer, and per-NPC 3-mode state; a locally violent unreported NPC can also need avoidance/cooldown, but cannot psychically summon distant guards without a completed signal. Separate (i) local violent NPC, (ii) report status and external reinforcements, and (iii) cooldown pressure. Preserve the owner's call-before-reinforcements rule.

This rule applies to GOOD GUYS. Bad-guy outpost threats use their physically signaled reinforcement system; do not automatically require villain enemies to be narratively distressed.

Quick illustrative scenario: hero attacks a shopkeeper. At mode 2, the player returns the item and makes a normal purchase; the merchant beams and stops trying to call. In another run the hero continues until the merchant reaches mode 3; purchasing a potion now will NOT settle the rage. The player must escape into another connected room, hide, avoid all disturbance and remain undiscovered until the alarm decreases sufficiently. If pursued guards clash with bandits, the player may hide while the two groups fight; joining that fight would extend the player's wanted cooldown. No lengthy dialogue or NPC AI needed.

Spec: https://docs.google.com/document/d/1wbSNfKLfrUsg9YX5qsRhYX9KwiMX8clXRZZBiuuz8PA/edit

OWNER-COMMITTED ESCAPE GEOGRAPHY — HARD-TO-REACH REFUGES (22 NOV 2026)

The MOST RELIABLE escape from a high good-guy pursuit is to get somewhere the pursuing NPCs CANNOT EASILY FOLLOW, remain unseen, do nothing disruptive, and WAIT until the general alarm falls beneath its dangerous threshold. This is an intentional gameplay dynamic like hiding out of reach during GTA / Need for Speed-style pursuits.

Critically, such protective geometry is RARE in the playable BETWEEN-LEVEL areas (the connective overworld). These traversals should often leave the hero exposed, with relatively few immediate foolproof refuges. Seeking safety can require reaching the entrance to a more elaborate playable level, taking an unfamiliar shortcut, or spending significant effort evading pursuers.

Inside developed levels, verticality, crawlspaces, concealed chambers, difficult traversals, and alternate routes can offer more potential refuges, depending on abilities and the exact location. Do NOT create a universally convenient hiding niche in every room or introduce teleporting to a safe zone as the default solution. Some routes are dangerous to flee through: the guards may follow across level boundaries, hostile creatures may also attack, and participating in any fight would prolong the cooldown.

Escape should still be mechanically fair and skillful, including without a special character or power; difficulty is about finding and reaching a break in pursuit, not an arbitrary lockout.

No NPC AI. The implementation can use marked pursuer-access limits, authored route links, simple line of sight, a pursuit-contact flag and a timer to cool down after an uninterrupted quiet interval. Whether enemies can enter some refuges or wait outside is a content/implementation question, not a fixed universal rule.

CANTINA DOOR LOCKOUT AND LATE UNLOCK — PURSUIT EXCEPTION (22 NOV 2026)

The cantina has one MAIN and MANY SHORTCUT ENTRANCES positioned in the between-level world. ALL ENTRANCES are LOCKED while a player is ACTIVELY CHASED BY GOOD GUYS; can't use a cantina shortcut to hide, break pursuit or quickly swap while chased. One exceptional completion reward, activated after finding ALL mystery components, allows entry during good-guy pursuit, but crucially the GUARDS CAN FOLLOW INSIDE. The desired outcome is an absurdly large crossover with endless cantina brawlers and real pursuers; wanted status persists. Cantina fighter respawn rules and normal external guard pursuit rules overlap only in this special case; no ordinary civilian distress mode should activate for cantina roster fighters. Exact guard death/respawn, scores, signaling inside and trigger details OPEN. No NPC AI: room link flags and bounded transfer of pursuers. Owner-confirmed cantina design: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit
