**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/05 — Characters, Roster, Parties and Acquired Powers* (https://docs.google.com/document/d/1sE-ZkWFxqP-_UckkA5c7Pf0xbDTfN2kQUDMt6mUDgPk/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

Characters, Roster, Parties and Acquired Powers

Status: Confirmed high-level architecture \| 22 November 2026

# Three-layer ability model

Layer A — Functional character type. LEGO Star Wars-style broad mechanical roles such as flyers, tiny infiltrators, strong movers, animal speakers, robots and magic-capable characters. These are examples of types, not finalized categories.

Layer B — Individual character specialties. Within a shared functional type, some heroes have special moves or interactions and others differ mainly aesthetically. Analogues from LEGO Star Wars: generic Force-user access versus Darth Vader's choke, bounty-hunter tools versus Boba Fett rockets, R2-D2's small jets.

Layer C — Acquired powers and weapons. Kirby-like pickup/copy behavior from enemies or the map, overlaying a character's innate abilities. A particular enemy might yield grappling, fire, suplex, flight, ice, electricity, a weapon or stealth effect. These examples are exploratory; the final ability catalog is open.

# Roster growth

Players begin with a subset of characters. Through exploration, interactions or accomplishments they discover others, permanently adding them to the larger roster. Some characters are optional; some are found much later than obstacles where they would have helped. The expanding roster is itself a powerful progression system and a reason to revisit old territory.

Most roster distinctions need not be unique systems; individual flair and style may distinguish characters who serve the same broad function. Players should be able to form attachments and bring favorites.

# Limited expedition party

Players choose a limited number of their unlocked characters to take into the world. The correct team depends on likely needs: a flyer, a tiny character, an animal talker, perhaps a heavy fighter. A character you did not bring might make an encountered shortcut inaccessible today; that can seed a future visit.

Exact party size is NOT decided; four has appeared only as an illustration. Whether slots expand via progression is an idea, not a decision.

# Shared party across solo and online co-op

One expedition roster is shared, regardless of player count. Solo player switches between party members; co-op players actively control different members of that one expedition team. A character cannot be controlled by two humans at once. Unoccupied members are candidates for switching. A consent-based swap with actively controlled characters is a sensible proposal but not approved; control arbitration, avatars, disconnects and online synchronization are open.

# Mid-expedition changes

There may be local opportunities to swap in a new party member during a level or region: special areas, encounters with resident characters, local recruitment, settlements or stations. The player specifically liked characters who inhabit a special area and can join there. Some characters might only become permanently recruitable after additional discovery; that distinction is exploratory.

# Acquired power behavior

A power or weapon is something found or taken from enemies or the environment, not necessarily a permanent upgrade. Discovering enemy types can therefore be exciting even after roster expansion. Properties should interact with surroundings and NPCs in general ways. For example, ice might freeze water or moving mechanisms, strong-grab can slam an enemy or move a heavy object, wind can redirect projectiles or propel traversal.

OPEN: number of simultaneous powers per hero; can powers be dropped, held, combined, stored, transferred between characters, preserved through switching or death; how copying works; whether every character can wield every power; whether weapon and copied power occupy one slot or separate categories.

# Character roles versus puzzle access

A character type supplies special opportunities, but puzzles should ideally be solved through properties rather than arbitrary labels. Some interactions may genuinely require a character language, size or species. Other challenges permit creative substitutes, particularly via acquired powers or co-op.

# Character personalities

Some heroes are especially drawn to combat, stealth, exploration, machinery, powerful creatures or destructive spectacle. They may comment on or visibly imagine cool possibilities in the scene. Such traits should inspire player ideas without auto-selecting actions or revealing all secrets. Personalities and exact identities are not selected.

# Example party calculus

A four-slot illustrative team could include a flyer, tiny stealth specialist, strong character and nature communicator. This would reach high ledges, small crawlspaces, heavy objects and conversational secrets, but might lack electricity or vehicle expertise. A new recruit could reconfigure the team's possibility space, especially when revisiting old areas.

# Design risks and tests

Risk: constant party swaps trivialize preparation. Counter: limited carrying capacity and meaningful local swap points.

Risk: missing one type creates repetitive dead ends. Counter: alternate routes, shortcuts, reusable environmental systems and discoverable local recruits.

Risk: many characters feel like reskins. Counter: distinctive animation, style, isolated special traits and different acquired power interactions.

Test: after recruiting one new character, the player should remember at least two earlier places that suddenly seem worth revisiting.

OWNER-FAVORED RARE ACQUIRED POWERS / EQUIPMENT LOSS (22 NOV 2026)

Certain abilities or items should be VERY RARE, found at only one or a few sources in the connected world. After discovering a source the player can return to that exact place to replenish a lost power/item and carry it into other levels. This makes memory of world geography and newly found shortcuts practically valuable. Similar to Kirby, getting hit CAN knock a stolen/copied power out of the player; some carried items might also be dropped on damage. A suggested recovery window would make the dropped power a temporary physical pickup that can be reclaimed before it disappears, otherwise the player revisits its source. The power-loss trigger, drop timer, source reset timing, item classes and co-op sharing remain OPEN, not locked. Permanent innate character abilities and roster membership should not be confused with portable temporary acquisitions. Details: https://docs.google.com/document/d/1puHJwUoNnBkNZyTLCh01VRQiqzUzjnb7plYfni9e2Gw/edit

OWNER-CONFIRMED CANTINA PARTY HUB (22 NOV 2026)

The world BETWEEN levels contains a CANTINA where ALL unlocked playable characters gather, hang out and WANDER. This is the owner's selected physical location for RESETTING/RECONFIGURING the limited active party. User taps a WANDERING unlocked character -\> current active team DISPLAYED ACROSS THE SCREEN -\> user taps a current party member to SWAP OUT -\> the chosen cantina character replaces that party member. No dialogue/menu tree required. Tap must be distinguished from attack. Cantina combat is an intentionally separate free-for-all system: attack the regulars to begin Smash-style brawl, ring-out/KO and infinite respawns, with players also respawning and live K/D scoring. No normal NPC modes/alarms/pursuit or permanent deaths in cantina. Cantina characters use simple authored movement/attacks, NO AI. Exact party size, co-op control ownership and score persistence OPEN. Full spec: https://docs.google.com/document/d/1r7D8pXDPNtablfb9r8BOWWrxO6czv0hqHqLjsD8kRKU/edit

MOBILE-BROWSER PLAY CONSTRAINT (22 NOV 2026)

Primary platform is an iPhone web browser, not a PC/console. Every active party action and copied/held power should be operable with touch controls, including movement/jump/attack/grab/throw/character switching and tapping a cantina character then tapping the active team member being replaced. Avoid requiring hover, fine mouse aiming or gamepad-only chords. Exact on-screen controls and orientation OPEN. Browser deployment from Claude GitHub commits via owner-managed Railway connection is the intended workflow; not verified active. Spec: https://docs.google.com/document/d/1uAu-ziYoHi9n7K3_YyxMgEiw23HuvOvDv1zRlhTRlp8/edit
