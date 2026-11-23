**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/06 — Online Co-op and Creative Combination Rules* (https://docs.google.com/document/d/1QPSj4HcnjuEF0r9y2ghg4PgAwUdv_nCvweIgQ_H-M0Q/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

Online Co-op and Creative Combination Rules

Status: Shared party and online co-op confirmed \| 22 November 2026

# Goal

Online cooperation should expand possibility rather than simply multiplying attacks. Friends can investigate separate corners, coordinate simultaneous abilities, rescue one another, trigger emergent chain reactions and participate in a history that commemorates everyone's contribution.

# Shared expedition party

There is one limited party roster, not independent full parties for each human player. In solo play one player switches between selected characters. In co-op several humans control distinct members of the shared party simultaneously. When a player joins or leaves, the same underlying party architecture continues.

Open mechanics include exact human player cap, party-slot cap, who may swap characters, how to prevent stealing control from a teammate, netcode model, shared save permissions, instance ownership, and whether separated players can occupy entirely different regions.

# Geographical independence

The user likes the possibility of online friends investigating different areas, not being constantly tethered to one camera. One player might encounter a locked gate while another locates a mechanism or relevant power elsewhere. Camera, streaming and peer location are engineering decisions, but vision favors genuine independent exploration when practical.

# Simultaneous interactions matter

Some situations should be naturally easier or only practically achievable when multiple abilities operate at the same instant. Example: one hero holds a gate open while another passes underneath; a wind user sustains a current while a flyer rides it; two mechanisms must stay active simultaneously; one hero drives a commandeered machine while another attacks from it.

# No arbitrary solo prohibition

Very important explicit user decision: do not hard-code “requires two human players” gates merely to enforce a multiplayer-only secret, but do not labor to create a designed solo path either. A puzzle may reasonably presume simultaneous humans. A determined solo explorer could discover a physical workaround using frozen switches, movable weights, enemy behaviors, creative timing or power interactions. If the world rules permit it, welcome it. Conversely some challenges may genuinely be inaccessible solo absent an ingenious discovery.

# World-state first

Power interactions should be based on understandable effects: duration, force, temperature, noise, concealment, weight, momentum, physical access, equipment state. A small set of dependable interactions is better than dozens of one-off animations disguised as systems. Avoid fixed “player A activates trigger, player B presses button” contrivances when an emergent affordance will do.

# Cooperative stealth and chaos

Players might coordinate a silent infiltration: one distracts a guard, another moves through a hidden passage, another operates a mechanism. They might also catastrophically derail it: one provokes guards, triggering a giant chase while a partner is hiding in the vault. The alarm and pursuit system should respond to participant actions without demanding everybody share the same alert state or playstyle at all times.

Whether alerted enemies pursue only visible offenders, entire party, or geographic zones is not decided and must be prototyped.

# Shared history

When players participate in an extraordinary event, all participants should be credited, irrespective of final blow or who caused the disaster. Joining a friend's online session and contributing to a legendary event should make that event part of your history as well. Open issues: cross-save replication, privacy/consent for screenshots, perspective selection, ownership of recorded moments, opt-out, and moderation for user-generated names.

# Sample emergent action

A solo player cannot physically hold two far-apart levers. In co-op, two people do so directly and open a vault. A solo player later notices a movable stone block can pin lever A, then operates lever B. Both are legitimate because the world is consistent. This should not become an explicit tutorial requiring one answer.

# Prototype conditions

Try a two-player heist where players separate spatially, change characters without involuntary takeovers, trigger alarms selectively, improvise after discovery, survive or perish in a high-impact battle and return with shared credit for any legendary outcome.

Try a simultaneous puzzle with a designed co-op strategy and at least one plausible but unadvertised solo workaround. The test is not whether every player finds it, but whether the rules remain honest.

CANTINA PARTY-RECONFIGURATION AND CO-OP FIGHTING (22 NOV 2026)

The owner confirmed the CANTINA in between-level world is the party reset location. All unlocked characters wander here; tap a candidate then tap a displayed current party member to swap. In co-op, active member swaps should preserve who controls which character and avoid silently stealing a teammate's avatar; the exact selection rights remain OPEN. The same location has unlimited Smash-style brawling, with human players and scripted playable-character fighters endlessly respawning, and running K/D/high scores. The brawl is EXEMPT from ordinary NPC distress/rage, reporting/wanted, normal death consequences, and no NPC AI restriction remains in force for scripted brawlers. Full spec: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit
