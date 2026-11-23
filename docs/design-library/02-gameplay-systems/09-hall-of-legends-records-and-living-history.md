**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/09 — Hall of Legends, Records and Living History* (https://docs.google.com/document/d/1YHOq_XWGEU59lMoiVnhJpADMeOMk33h6Vg02fSXEqGo/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

Hall of Legends, Records and Living History

Status: Major committed feature; algorithms open \| 22 November 2026

# Promise

The game notices the most extraordinary player-created experiences, even when they were neither scripted quests nor intentional successes. A brief commemorative cutscene captures a representative image from the epic moment and places it on a pedestal, accompanied by meaningful stats. The Hall is a real explorable location inside the game, not a menu insulated from ordinary rules.

# Three confirmed kinds of glory

Legendary Infiltration: exceptionally skilled stealth, valuable success without detection, clever defenses bypassed, difficult facilities penetrated.

Legendary Last Stand: colossal resistance confronted, improbable duration, remarkable knockback, property destruction, vehicle theft, moments that matter even if everyone loses.

Legendary Escape: survival and successful disengagement from apparently hopeless attention or pursuit, including narrow margins, creative routes and high stakes.

These are explicitly endorsed categories, not necessarily an exhaustive taxonomy. Extraordinary discovery or weirdness could also be memorialized, but new categories should remain exploratory.

# Participants, not final-hit owners

The user explicitly wants legends to include every player who was part of the event. Starting the conflict, quietly aiding, luring guards, providing rescue, being crushed by the machine or delivering the final blow can all constitute participation. A memorable event in somebody else's online game can count as part of every participating player's history.

A single saga may qualify as an infiltration, battle and escape. Do not insist on one winner or a narrow achievement claimant. Participation criteria, privacy and cross-session records need specification.

# Temporal segmentation and the moment of recognition

The system identifies an event as it unfolds, then detects its completion: success without alarm, decisive end of a battle, retreat that breaks a pursuit, wipeout after an extreme last stand. It considers whether this incident is exceptional relative to the player's or party's past recorded history, then presents a brief surprise ceremony.

Record the key event frame or a short highlight clip, event type, location, time, participants, relevant statistics and evidence. The chosen frame should capture the true “OHHHHH” moment; it is not necessarily the instant the event ended.

Do not spam ceremonies after every ordinary encounter; they should feel rare and earned. Smaller episodes might appear in a journal (idea, not confirmed).

# Relative greatness, not single damage total

Evaluate in context, potentially across dimensions:

- Scale of opposition, stakes and physical destruction.

- Apparent improbability and proximity to defeat or detection.

- Duration of intense resistance, number/quality of pursuers.

- Creativity: power combinations, hijacked vehicles, unexpected environmental interactions.

- Mastery: clean stealth, successful undetected acquisition, no-alarm routes.

- Spectacle: throws, chain reactions, crashes and extraordinary momentum.

- Historical rarity: how it compares against the player's own previous adventures and perhaps wider history.

No final score formula is selected. Do not boil every category down to kill count. The Hall needs a sense of relative historical magnitude and surprising recognition.

# Commemorative artifact

Possible record: title (e.g., “The Siege of Bellweather”), category, thumbnail screenshot on a pedestal, participants, location, time, event duration, highest response level, units defeated, vehicles hijacked, health remaining, valuable target secured, detection status, escape margin. All names and numbers are illustrative.

Presentation: after a notable event, the decisive frame freezes or is shown, becomes a framed image, and appears in the Hall. The player can visit the pedestal and view event details or perhaps a replay. Replays are an idea, not a requirement.

# The Hall is gameplay space

It has halls, pedestals, exhibits, powerful defenders, artifacts, visitors, security, hidden passage possibilities and perhaps valuable loot. Players can enter, sneak, steal, fight, hijack security machines or cause demolition. It must be possible for a legendary event to occur inside the Hall itself.

The Hall may even commemorate an attack on the Hall, including a screenshot showing a previous pedestal being destroyed. This recursive absurdity is a core approved appeal, not a joke to hide only in UI text.

The game can repair or reconstruct a damaged Hall so records remain visitable; how remains open. Never let an explosion simply erase the user's event history.

# A physically evolving museum

Over time, galleries or displays can expand or rearrange to accommodate memorable events. Candidate wings: Stealth, Defiance, Escape, perhaps Discovery. Exact scale, layout, categorization and whether ordinary non-legendary records are kept are open.

The Hall's story role is philosophical: a world that reveres history preserves reckless experiences of people who don't care to fit its narratives. The player is not forced to feel proud or morally judged.

# UI and data design questions

How many highlights are buffered? Are they screenshots, render replays or in-engine freeze frames? Who owns an event record? Can a player hide or delete it? Can a Hall host another party's records? What happens if participants play on different saves? How are records migrated across builds? Should there be global/public records, or only personal history? Are event titles generated with templates or constrained language generation? How do we protect multiplayer privacy and prevent offensive user-supplied names appearing in shared galleries?

These are open; the vision is the experience of impartial, surprising commemoration.

# Golden acceptance moment

Four players provoke the Hall's defenders, survive a spectacular rampage, and escape or perish. The game recognizes the event, commemorates it in the same hall, credits all four people, and preserves a screenshot in which another Hall monument is visible. On the next visit, the environment acknowledges the incident while the legend remains accessible.
