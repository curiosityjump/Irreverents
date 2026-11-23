**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/26 — Witnesses, Reporting and Wanted Levels* (https://docs.google.com/document/d/1wbSNfKLfrUsg9YX5qsRhYX9KwiMX8clXRZZBiuuz8PA/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

WITNESSES, REPORTING AND WANTED LEVELS

Irreverents \| Owner-confirmed interaction rules + implementation proposals \| 22 November 2026

# The crucial distinction: no signal, no escalating reinforcements

Confirmed by owner: BOTH encounters with good guys and fights against bad guys need an ACTUAL call for help or signal before scaling reinforcements appear. NPC perception, a disturbance, an unconscious body and NPC emotional distress do NOT automatically summon support. The game can contain all the witnesses, panic, personal violence and consequences it likes, but nobody outside the immediate encounter knows unless an actual signal successfully gets out.

This is a stealth game principle: you can attack a shopkeeper, prevent that shopkeeper from calling, leave no witnesses, steal everything and walk away with NO response from uninformed townspeople or police. A discovered unconscious body later creates suspicion and an opportunity for a witness to report; until a report succeeds, the wider system remains unaware.

Inspiration explicitly named by owner: GTA/Need for Speed-style escalating wanted/heat or pursuit levels, Splinter Cell-style finding an unconscious friendly NPC, Far Cry 5-style enemy outposts with physical signalers. Keep very little dialogue and no NPC AI.

# Two independent layers

Layer 1: PERSONAL NPC MODE

(1) Business as usual; (2) Confusion/distress; (3) Absolute blinding violent rage.

This determines the witnessing NPC's immediate animations and local actions, including whether good guys attempt to CALL for help. For expected friendly NPCs, calling for help is allowed only in mode 2 or 3. Mode 1 does not produce a good-guy request for backup.

Being beaten or panicked can provoke personal counterattacks without bringing in anyone who has not seen or heard a real signal. Personal NPC modes do not equal a shared wanted level. The village can contain three enraged eyewitnesses and still have wanted level zero.

Layer 2: REPORTED AREA ALERT / WANTED LEVEL

The zone starts unaware. Successful signaling/reporting moves it into a reported/investigating/response state. Escalating later reports can bring increasing counteroffense, like wanted/heat systems. It is geographically scoped: a person in another town does not telepathically know the crime. Whether wanted levels persist across connected zones, and the exact number of tiers, are OPEN.

An area signal requires a real initiated and completed action. A report can come from a physical bell, horn, wall alarm, phone-like device, messenger, a person reaching a guard or a deliberately broadcast audible cry where nearby responders can actually hear. An NPC screaming in panic is NOT automatically a successfully transmitted report unless the system's hearing/range conditions make it one. Use consistent visual and sound cues.

# Personal observation pipeline for a good guy

A. Business as usual: merchant sells, patrol guard patrols, cat sleeps, villagers go about their lives.

B. The character witnesses a wrongful action, finds strong evidence of an incident, or discovers an unconscious body: a scripted reaction moves them to mode 2 (confusion/distress), depending on severity. They may stop, inspect, search, look around or become apprehensive.

C. In mode 2, they become ELIGIBLE to signal for help. They may run to a physical alarm, find a guard, or activate another predefined reporting interaction. They still have to COMPLETE it. Players can interrupt or prevent it.

D. Continued severe deviation can turn the same NPC to mode 3, violent rage. They can attack personally and still try to report if a report interaction is available.

E. If knocked unconscious, obstructed, escaped from, distracted or otherwise prevented from reporting, no new area alert occurs. Finding a body alone is not itself a police call.

F. If the attacker escapes, the witness cannot truthfully identify the attacker unless they actually perceived an identifying cue. A completed report may cause a patrol to investigate the crime scene even when no one knows which character did it.

G. A convincing return to expected role behavior can rapidly soothe a GOOD NPC in mode 2 distress, but NOT one in mode 3 violent rage. Mode 3 requires full disengagement and an uninterrupted period without any attacking (even defensive), destruction, or other unexpected incident until general alarm/heat falls below the violent threshold. An already transmitted call is not undone by mood changes. Dispatch may still arrive; the response can then resolve after scene checks/observations or a cancellation signal. The exact reset policy is open, but do not implement psychic global calm on one smiling shopkeeper.

# Good-guy shop heist test

Player enters shop, hits the delighted merchant. Merchant shifts from mode 1 to 2, may rise toward 3, and attempts to reach a door bell or call point.

If player knocks him out BEFORE the call, and no passerby witnesses or hears, area alert remains ZERO.

Player steals treasure and exits through a back door. No guards instantly spawn.

Later another shopkeeper enters and finds the body. Discovery triggers distressed animation and perhaps a search. If this person reaches the street guard and reports, only then does the town spawn or redirect an investigative patrol.

A patrol finding evidence but not the offender may search the shop and nearby route without knowing where the thief escaped. A later confirmed sighting/second report can cause pursuit to intensify.

If the player returns in ordinary hero-selling/buying posture, some direct witnesses may be quickly reassured; a report already made is still an event that responders have to deal with.

# Villain outpost test and interpretation boundary

Bad guys are ordinary enemies scattered in levels and concentrated in defended outposts. A proper hero-villain fight is business as usual for both archetypes; this does NOT necessarily mean distress mode for villains.

A surviving enemy who detects and identifies a player as a threat may RUN TO THE OUTPOST SIGNALER and try to call help, with a visible windup. A successful completed call causes a reinforcement wave; if intercepted, silenced, or if the device is destroyed, no such wave appears. Subsequent successful signals can cause repeated and escalating waves indefinitely until signaling is impossible or the party escapes the zone.

OWNER-RESOLVED: villain outpost callers DO NOT need confusion or rage. A villain who recognizes a player as a threat is allowed to call for reinforcements from Business as Usual mode 1, because tactical opposition to heroes is a perfectly normal villain role. In contrast, good-guy NPCs attempt reports only in mode 2 or 3. BOTH factions must still execute a real signal; recognition alone does not summon waves.

# Alarm/wanted levels — finite illustrative design

A GTA/NFS-inspired display can indicate 0 through 5 levels (count not owner-approved):

0 UNREPORTED: no responders have been summoned, even if a nearby witness is furious.

1 REPORTED SUSPICION: someone completed a call. A local patrol investigates known scene/entrance.

2 IDENTIFIED THREAT: a credible additional report or confirmed encounter triggers active pursuit by ordinary guards.

3 HEAVY PURSUIT: further successfully transmitted alerts dispatch stronger guards, more routes/roadblocks.

4 ELITE RESPONSE: champions, armored patrols, heavier units.

5 ALL-OUT RESPONSE: massive recurring reinforcements, high-pressure siege/escape opportunities.

For villain outposts equivalent pressure comes from their own faction's defenders and machines.

Do not necessarily advance one level per call: severity and report content can set initial tier, and repeat signaling can intensify it. But absolutely no wanted escalation without at least one actual successful report; repeated reports or dispatch communication should be legible. If responders can call higher command, they too need a completed report action, not telepathic automatic rank-up.

This is an IMPLEMENTATION PROPOSAL, not a confirmed five-step canonical level system.

# How the escalating system ends

A) Stop or disable signaling (destroy bell, sever alarm cable, occupy switch, interrupt caller, prevent witness reaching guard).

B) Clear all actors who can signal again; an unreported local fight ends without external reinforcements.

C) Escape the relevant zone and lose credible identification/active pursuit. Local wave generation stops; already dispatched responders may exist/finish their authored patrol, depending on design.

D) For good-guy witnesses still in mode 2 distress, visibly return to appropriate behavior to stop the escalation; this can prevent new calls but cannot retract a report. In mode 3 violent rage, reassurance is not immediate: disengage and remain incident-free and hidden until alarm/heat cools below the violent threshold.

E) For villain outposts, a proper battle remains business as usual, so “pretend to be a hero” shouldn't automatically pacify them. Outpost call mechanics remain tactical.

# Implementation without AI

Each NPC is a scripted actor with fixed animation/movement and event responses:

Local signals: see suspicious player action, hear attack, find unconscious body, see known enemy, spot broken tagged object.

Simple local mode variable: 1/2/3.

Simple area heat variable: 0..N or alert flag + dispatch tier; it is changed only by a successful report or other explicitly communicative event.

Report destination list: an alarm bell, lever, whistle, messenger route, guard contact, phone-like call, or audible help in hearing range.

An NPC eligible to report follows an authored path/waypoint or moves to known marked destination; the interaction plays a readable windup and completion event. If interrupted, nothing is broadcast.

Scene controller receives completed report and schedules waves using authored tables and a bounded active sprite count. The number of waves can be unbounded without unbounded concurrent simulation.

Discovering an unconscious body fires a local suspicious-evidence event and makes a witness more likely to attempt a report when eligible. No NPC reasoning or autonomous learning required.

Important: one global 'crime happened, spawn police' shortcut would violate the intended gameplay. Intervening in reporting needs to be a meaningful player verb.

# Co-op and replayability

Player A quietly disables the town alarm before Player B robs shop. If nobody sees a completed signal, no reinforcements even if the merchant enters rage.

Player A is inside bandit outpost; Player B stations near the signaler to intercept callers. Another takes treasure through a roof hatch. Each new call attempt is a shared moment of tactical urgency.

A single mistake can turn a stealth win into a spectacular escalating chase, but the team can still disable the signaler late, clear current pursuers and escape.

A lone player can have same mechanically valid outcomes using switching, powers, environment objects and timing; don't require two human players.

# Development validation checklist

1. Knock out an isolated merchant before a successful call. Rob shop. Zero outside reinforcements.

2. Return after leaving: NPC discovers body, becomes distressed, but ZERO reinforcement until reporting is completed.

3. Interrupt reporting attempt: no dispatch. Let it finish: investigatory responders arrive at reported scene.

4. Witness attacks you in local rage, but the area alert stays 0 until a completed signal.

5. Already completed report persists even if witness immediately reverts to business as usual; dispatch resolution is local and understandable, not psychic.

6. Stealthy sabotage of villain alarm prevents all new enemy waves; once alarm operates, repeated calls can summon endless waves until countered or the player escapes.

7. A responding guard can report for higher support through an explicit legible signal, if that feature is included, rather than silent automatic escalation.

8. One system serves scattered level enemies and fortified outposts without turning every cave into a tactical mission.

9. NPC behavior and patrols are scripted, NO AI, NO mandatory dialogue.

# Confirmed versus open

CONFIRMED: all reinforcements require actual signaling; good NPCs signal only in modes 2/3; unattended knockouts/robbery need not raise wanted levels; discovered unconscious good guy can create suspicion that may prompt reporting; wanted/heat-style escalation as design reference; players may prevent calls; both friendly counteroffense and hostile outpost reinforcements; no NPC AI; stealth and escalating conflict equally viable.

OPEN: exact wanted tier count/iconography; initial escalation per report; extra signaling after first completed call; body discovery severity/detection radius; reporting method per scene; persistence of reports after witness pacification; authority knowledge of attacker identity; cross-zone wanted carryover; reinforcements already summoned; exact reset rules.

OWNER CLARIFICATION — VILLAINS CALL FROM BUSINESS AS USUAL (22 NOV 2026)

Villains should use signalers whenever they RECOGNIZE the player as a threat, without needing to enter emotional mode 2/3. This resembles Zelda BOTW/TOTK lookout monsters sounding horns to alert allies and Far Cry 5 enemy alarms that call reinforcements. An enemy must perceive and recognize a real threat, then perform a visible call/action (possibly reaching fixed bell/beacon) before anything is communicated. Attack, stun, distract, sabotage or disable the signaling capability before completion to prevent the call. The three NPC modes still govern villain reactions to narrative deviations, but ordinary fighting heroes and raising a tactical alarm is BUSINESS AS USUAL for villains. Good-guy mode 2/3 reporting condition remains unchanged. This RESOLVES the earlier documented ambiguity. Source/reference examples: https://www.zeldadungeon.net/wiki/TextDump%3ATears_of_the_Kingdom/Loading_Tips ; https://primagames.com/eguides/far-cry-5-eguide/training/cult-outposts ; https://zeldadungeon.net/wiki/Monster_Horn

OWNER-CONFIRMED DE-ESCALATION THRESHOLD — DISTRESS REASSURABLE, VIOLENCE REQUIRES COOLDOWN (22 NOV 2026)

This overrides all earlier examples that depict good-guy NPCs instantly resetting from violent rage when a hero buys a potion, bows, or resumes an expected role.

GOOD GUYS MODE 1 — BUSINESS AS USUAL: no corrective action needed.

GOOD GUYS MODE 2 — CONFUSION/DISTRESS: can be reversed quickly by the player convincingly behaving normally according to their heroic role; the observer happily accepts that the oddity was a fluke. As already confirmed, some distressed witnesses might attempt to report; prevent the call to avoid new reinforcements.

GOOD GUYS MODE 3 — ABSOLUTE BLINDING VIOLENT RAGE: returning to normal behavior IN VIEW is insufficient. The player must FULLY DISENGAGE and AVOID the hostile good guys for a sustained period, allowing the GENERAL ALARM / WANTED PRESSURE to fall below the VIOLENT THRESHOLD. During the cooldown, do not attack anyone even in self-defense, destroy anything, or do ANYTHING unexpected; ANY further incident prevents or resets the clean cooldown. Simply refusing to attack while still being chased and visible is not enough.

Once the shared alarm falls below violent level, the lower-level reassurance rule can apply again. The exact timer, alarm scale, individual-versus-general hysteresis, and whether cooling occurs in stepped tiers or continuously remain unselected. Practical proposed implementation: one shared reported heat variable, a no-incident cooldown timer, and per-NPC 3-mode state; a locally violent unreported NPC can also need avoidance/cooldown, but cannot psychically summon distant guards without a completed signal. Separate (i) local violent NPC, (ii) report status and external reinforcements, and (iii) cooldown pressure. Preserve the owner's call-before-reinforcements rule.

This rule applies to GOOD GUYS. Bad-guy outpost threats use their physically signaled reinforcement system; do not automatically require villain enemies to be narratively distressed.

Quick illustrative scenario: hero attacks a shopkeeper. At mode 2, the player returns the item and makes a normal purchase; the merchant beams and stops trying to call. In another run the hero continues until the merchant reaches mode 3; purchasing a potion now will NOT settle the rage. The player must escape into another connected room, hide, avoid all disturbance and remain undiscovered until the alarm decreases sufficiently. If pursued guards clash with bandits, the player may hide while the two groups fight; joining that fight would extend the player's wanted cooldown. No lengthy dialogue or NPC AI needed.

OWNER-CONFIRMED ESCAPE REQUIREMENT (22 NOV 2026)

The MOST SUREFIRE way to lose a serious good-guy pursuit is to reach a place the pursuing NPCs cannot easily access, STAY THERE unseen, and WAIT WITHOUT INCIDENT while general alarm/heat falls. Full disengagement means no attacking, even defensively, no breaking things, and no unexpected actions; merely running through line of sight will not cool the wanted level.

Safe refuges are comparatively RARE in the world areas BETWEEN main levels. The inter-level playable routes are themselves tense and exposed, and chasing guards can follow heroes toward/into real levels. The more detailed level geometry may provide hidden ledges, crawlways or concealed rooms to hold out in, but don't guarantee abundant universal hiding slots.

No NPC AI needed: clear authored geometry, fixed access limitations, simple detection and a heat cooldown timer. Distinguish hard-to-reach refuge from instant 'press hide to erase wanted level.' An earlier successful report remains transmitted; the player is evading an active response, not cancelling history.
