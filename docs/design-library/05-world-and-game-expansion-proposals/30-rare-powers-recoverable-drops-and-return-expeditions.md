**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *05 World and Game Expansion — Proposals/30 — Rare Powers, Recoverable Drops, and Return Expeditions* (https://docs.google.com/document/d/1puHJwUoNnBkNZyTLCh01VRQiqzUzjnb7plYfni9e2Gw/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

RARE POWERS, RECOVERABLE DROPS, AND RETURN EXPEDITIONS

Irreverents \| Owner-favored design direction + proposed implementation \| 22 November 2026

# Core concept — knowledge persists; possession does not

Owner likes VERY RARE abilities or items located in particular places. Once the player DISCOVERS a source, they know how to return and obtain that power/item again, then CARRY IT through other connected level regions. If they LOSE it, they must either recover the immediate dropped object or go BACK TO THE SOURCE to acquire it anew. Drawing on Kirby: taking damage may knock a STOLEN/COPIED POWER out of the character, and POTENTIALLY may cause certain carried items to drop as well.

The geography and memory of the game world matter: the player who remembers a remote source has access to a special capability, subject to the cost/risk of a return journey. New shortcuts and recruitable characters may shorten that trip. This is an organic reason to revisit old levels without quest dialogue or new NPC AI.

# What remains permanent, what remains at risk

A. PERMANENT ROSTER / INNATE CHARACTER FUNCTION — once a playable character is recruited, that character's natural abilities remain theirs. Do not make simply taking one hit erase the unlock, learned location or a permanent level achievement.

B. ACQUIRED / STOLEN POWERS — Kirby-like temporary abilities taken from enemies or special world sources. A hit can knock the active power loose as a physical pickup, rather than quietly deleting it. Another hit while unpowered does not need to trigger a new power loss.

C. CARRIED ITEMS / WEAPONS — the player likes the possibility of dropping these on damage too, but whether every kind of item drops, only fragile/loosely carried items, or only certain hit types have this risk is OPEN. Keep a distinction between a temporary tool the character is carrying and permanent quest/progression collectibles.

D. MYSTERY CONSTRUCTION COMPONENTS / DISCOVERED REGIONS — proposed default: these are durable saved completion discoveries, NOT part of vulnerable loadout that constantly resets on hits; these belong to region completeness, not portable combat gear. This is a sensible recommendation for player fairness and the previously discussed LEGO-like level completion model, but the exact handling is not yet owner-confirmed.

E. KNOWLEDGE OF SOURCES — finding the rare source is persistent knowledge for the human/player. Optionally a discovered source can be mapped in the game's UI without spoiling undiscovered sources. Whether map locations are automatically recorded is OPEN.

# Simple Kirby-style power-loss proposal

The player gets hit while holding a copied power. The power ejects as a bright, distinct, bouncy pickup and lands on a physically reachable nearby surface. It remains for a short visible window during which the hero can chase and reclaim it. If it disappears or the player leaves it behind, they are now without the power until they find another copy or revisit its specific source.

Don't require a wholly new recovery minigame. The hit/spawn/pickup functions can reuse the game's ordinary knockback and collectible systems. The pickup should have readable behavior on slopes, pits, conveyors, windy areas, underwater spots and moving platforms only to the extent those locations actually support these finite rules.

OPEN: what counts as a power-loss hit, whether every hit always loses power, grace period, pickup lifetime, whether damage interrupts recovery, whether rare powers have different ejection behavior, how switching party members changes ownership.

Suggested caution: if a rare object is immediately lost forever to a trivial offscreen hazard, its exciting rarity may become frustration. A brief rescue window could create drama without eliminating the value of a return trip.

# Example — finding and losing a unique power

A remote chamber in Prism Spires contains a rare prism power pickup, or a distinct special enemy can be copied once defeated. After a difficult exploration route, the party finds it and carries it outward into the Iron Quarry. Its effect can power a known receiver elsewhere in the world, or produce a strong combat interaction. These are EXAMPLES; neither location/power has been approved.

In a fight with bandits, the bearer is hit; the power bursts out as an illuminated pickup and starts bouncing across minecart rails. The party has a few moments to recover it before it vanishes or is left behind. A friend can try to protect the bearer or retrieve the dropped power if the co-op control rules permit; don't assume transferability is a required feature.

If it is lost, there is no permanent shop replacement for free. The player remembers the high chamber. They can take the old mountain path or use a recently unlocked shortcut to return. Their reward for world mastery is that obtaining the power the SECOND time can feel like a deliberate, efficient expedition.

# Rare sources should have varied geography

Not every rare power needs to be behind a boss or secret wall. Candidate sources:

- a high ledge in an early forest, reachable much later via flight or wind;

- an unusual enemy in a deep volcanic cave whose copy power is otherwise unavailable nearby;

- a guarded vault, stealable stealthily or grabbed during a massive battle;

- a tricky train compartment that can only be reached when the train is at a certain stop;

- a hidden underwater alcove that requires a special traversal character.

These all use authored level geometry and existing player verbs, not a procedural loot economy. The source can respawn or reset on region reload, timer, or other simple repeat rule; the exact refresh trigger is OPEN.

The player should not need to repeatedly solve a tedious unskippable introductory cutscene, a cumbersome scripted puzzle, or a long NPC dialogue merely to replenish a known item.

# Why limited access is fun

A common ice ability can be reacquired from many simple enemies, so losing it is a brief setback.

A rare, high-impact ability from one source is a commitment. Choosing to take it into a difficult bank heist or an escalating pursuit changes the stakes; a careful player might sneak in specifically to keep the power. The rare capability also creates new puzzle possibilities wherever its effect is legibly relevant.

A very rare tool can also be used in silly, inventive ways rather than solely in the one room where it is found. The design must give it consistent effects on tagged objects/NPCs; not an expensive bespoke reaction for every conceivable object.

Players can keep permanent roster progression and level exploration percentages despite losing their temporary loadout. Rarity encourages memory and exploration instead of grinding an abstract inventory.

# Co-op and solo design

A co-op team may escort the player with the rare power, keep enemy fire away from the just-dropped pickup, or coordinate access to the source. A teammate's acquired power should not automatically become an unowned duplicate. Exact pick-up permission, whether allies can reclaim each other's dropped powers, and power transfer rules are OPEN.

Solo must get valid opportunities to rescue a pickup: immediate recovery should not depend upon a second human or a companion with AI. Accessible geometry matters. The party can potentially switch character abilities if switching is available at that moment; how lost powers move with character switching is OPEN.

Physical interactions like enemy knockback and falling hazards create tense loss/recovery scenes, especially when the player is also trying to stay unseen and wait out a wanted-level pursuit. Reacquiring a rare power can be a meaningful decision about safety versus risk.

# Region completion and collectibles should not get muddled

Level completion record can show “Explored 83% / Mystery Components 4/5” while rare equipment possession comes and goes. Finding the rare source is a memorable discovery and might optionally count toward geography exploration or a separate hidden discovery flag; do NOT automatically count “currently holding the rare power” as a requirement for 100% permanent region completion.

The player can know the location of a rare power without being able to possess that power permanently. This is a different progression mechanism from unlockable characters and collected build pieces.

Optional UI: once found, a simple small power icon in a discovered-place map or collection journal can help later navigation without disclosing hidden sources. Player choice and exact UI remain open.

# Small, practical implementation

Use a finite table of RareSource {sourceId, regionId, position, itemOrPowerId, respawnRule}. At pickup, add power/item to the current active loadout. On eligible damage, spawn DroppedPower {powerId, position, pickupLifetime, recoverable=true}; optionally analogous item drop depending on item class. If it times out, remove the drop. If reentered/reloaded under the approved respawn rule, the source appears again. In multiplayer, ownership/authority of the pickup needs to be designed to avoid duplication or lost pickups on network sync.

Use a handful of highly reusable power effects (element, traversal, heavy hit, concealment, etc.) across many rooms. Rarity is mostly SOURCE PLACEMENT and recovery risk, not an enormous new systemic feature.

Do not create a procedural crafting system or permanent inventory item duplication merely to support rare-source return trips.

NO NPC AI or lengthy narrative exposition required.

# Questions for eventual playtesting

Does losing a rare ability create an exciting moment to grab it back, rather than feel unfair?

Does knowing the source make revisits satisfying, or does a mandatory retrieval become tedious?

Does an unlocked shortcut make the world feel more mastered?

Does rarity make the power sufficiently different from common pickups that it feels worth protecting?

Does a power's effect create opportunities in multiple levels rather than one designed keyhole?

Can a solo player reasonably attempt recovery while surrounded?

Can a co-op player protect/recover the fallen pickup without causing accidental theft or duplication?

# Design authority

OWNER-FAVORED / CONFIRMED INTENT: rare abilities/items in fixed scarce sources; player can return to known locations to get one again; portable powers/items between regions; losing a power forces either immediate recovery or another source trip; Kirby-like damage potentially knocks stolen powers and possibly items away. This is exploration-driven and should support expressive cross-level play.

PROPOSALS, NOT YET FIXED: distinct drop classes, time-to-recovery, exact probabilities, automatic map notation, source respawn triggers, item slot counts, whether dropped power can be shared, collectible protection, particular power locations and abilities. Do not promote proposals as owner-approved mechanics until accepted.
