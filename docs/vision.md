# Irreverents — the vision

**Standing.** The owner's own words on where this project is going and
why, kept current, read by the orchestrator and leads before writing or
reviewing `docs/plan.md`, never touched by a session executing one brief.

**Vision → Plan → Briefs.** This document is upstream of everything else.
`docs/plan.md` is built *from* it: the concrete sequence of steps that
moves the project toward what is written here. A brief is built from one
step of the plan. If a plan step or a brief ever seems to drift from what
is written here, this document wins; say so and flag it, don't quietly
build the drift.

**Who maintains this, and how.** The owner, working with **Vision
Partner** (`docs/vision-partner-role.md`), the ongoing session that also
keeps their list of questions. **The orchestrator and every lead reference
this file; neither edits it.** When something the owner says in an
orchestrator or lead session sounds vision-level (it contradicts, expands,
evolves, clarifies or reinterprets what is written here, rather than just
deciding one plan-level question), that session's job is to *notice it and
say so*, quoting the owner, and suggest they bring it to Vision Partner
(or put it in `docs/questions-inbox.md`); not to silently rewrite this
file, and not to silently treat the owner's words as plan-level when they
are bigger than that. `docs/orchestrator-role.md` and
`docs/lead-session.md` have the mechanics.

**Sessions executing one brief never need this file.** A brief is
self-contained by design (`docs/briefs.md`). If a brief seems to need this
document to make sense, the brief is incomplete; that is a finding for the
lead, not a reason to open this file cold.

**Empty?** Then the project is at genesis. A Vision Partner fills it from
the owner's first stream of consciousness (`docs/vision-partner-role.md`,
"Genesis: the first conversation"). The headings below are its outline;
add, rename or remove sections as the owner's vision requires.

---

## Where the detail lives

*(Framing.)* The owner's full design lives in their Google Drive library,
mirrored read-only at `docs/design-library/` (start at its `README.md`).
This file is the short version that `docs/plan.md` is built from; where the
two differ, the library's newest owner-labelled rule wins and the gap is a
question (Q-005). Quotes below marked *(Drive, doc NN)* are from that
library, which the owner has said counts as their own words:

**Owner, 2026-11-23, to Vision Partner, first-hand, answering Q-001 [can the Drive library's "CONFIRMED" lines count as your own words?]:**
> Everything in the google drive counts as my own words. It's my drive and I'm only allowing what I've agreed to to go in there in the first place.

*(Framing:)* "everything" includes the library's own status labels, so a
thing the library calls PROPOSED, EXAMPLE or OPEN is the owner saying it is
proposed, an example, or open: not a decision.

## Who this is for, and why

**Owner, 2026-11-23, to Vision Partner, first-hand, answering Q-002 [who is Irreverents for, and what is it for you?] and Q-004 [what does it run on, and how is it played?]:**
> This is a game for me and my friends to play on our phones/computers via browser/webapp.

**Owner, 2026-11-22 (Drive, doc 00):**
> A richly interconnected 2D side-scrolling, Amazing Mirror-inspired action-adventure about a shared party of radically curious, gleefully irreverent heroes whose favorite activity is disrupting a world that takes its stories and prophecies very seriously.

## What "working" looks like

**Owner, 2026-11-22 (Drive, doc 00):**
> The world is important to itself. The heroes are fascinated by everything except the supposedly important quest. Players are free to save a town, rob its jewels, unleash chaos, flee pursuit, help the townspeople survive the consequences, and revisit later with completely new capabilities.
>
> The emotional standard is the "OHHHHH" moment of spectacular physical IMPACT, balanced by the profound satisfaction of an impossible zero-alarm infiltration. A disastrous stealth attempt should often become an even more memorable battle or escape.

**Owner, 2026-11-22 (Drive, doc 01):**
> The game should continually invite: "What if I tried THAT?" Discoveries reward curiosity. Stealth rewards finesse. Combat rewards force and collision. Pursuit rewards desperate improvisation. The world rewards disruption with genuine reactions. A memorable failure can feel better than a routine success.

**Owner, 2026-11-22 (Drive, doc 01), on how it should feel to play:**
> Irreverents should feel like a Kirby or LEGO Star Wars-style 2D action-adventure: superb movement, readable enemies, secrets, powers, co-op puzzles, stealth, explosive fights and interesting geography. NOT every room or level should exist to restate the Hero's Journey joke or deliver lore.

## The long-term direction

**Where it is played.** *(Framing:)* the owner named the game's public
address. A session that wants to see the game the way a player does opens
this URL (the cloud environment allows it since 2026-11-23).

**Owner, 2026-11-23:**
> This is the url railway will deploy everything to, where the game will be playable: irreverents-production.up.railway.app
>
> Make sure you can access it so the claude dev team can test things better from the player perspective

**The full game.** *(Framing:)* the confirmed feature set the library
commits to; everything else in it is proposal.

**Owner, 2026-11-22 (Drive, doc 01):**
> Confirmed: title Irreverents; name is player-facing only, not a name the cast uses for itself in-world; nonlinear secret-rich platform-adventure; temporary acquired abilities/weapons; discoverable permanent roster with LEGO-like types; limited shared expedition party; online co-op; stealth; dynamic mayhem and pursuit; highly satisfying impact; Hall of Legends; irreverent anti-story protagonists; royal audience running gag.
>
> Not fixed: final story ending, cast names, exact party size, co-op player maximum, roster count, power inventory rules, physics implementation, destructibility budgets, AI architecture, rating/violence presentation, release platforms, camera specifics, business scope, monetization, and engine.

*(Framing:)* "release platforms" and "business scope" are now answered
above (browser, for the owner and friends). "AI architecture" is answered
by D-055 below.

**What it is not.** **Owner, 2026-11-22 (Drive, doc 00), "Invariants for designers":**
> - Do not make the central quest more important to the gameplay than the player finds it.
> - Do not remove meaningful stealth as the price of having fun chaos.
> - Do not make triggering an alarm an automatic bad outcome.
> - Do not simplify combat down to damage numbers; collision force and consequence are essential.
> - Do not confine mayhem to designated levels or protect the Hall of Legends from gameplay.
> - Do not force a human-co-op requirement where consistent mechanics permit a clever solo workaround.
> - Do not let one tough boss gate most of the world.
> - Do not turn the Hall into a preset achievements checklist instead of a memory of actual events.
> - Do not treat generated character art or names as approved canon.

## The measure

**The first deadline.** **Owner, 2026-11-23, to Vision Partner, first-hand:**
> I want this game to be playable by the time I wake up in the morning. Once you are ready, I will start the orchestrator session and let you all work through the night on this.

**Owner, 2026-11-23 ~03:50 UTC, to Vision Partner, first-hand, answering Q-009 [is Railway deploying from `main`?], Q-007 [which first slice?] and Q-003 [how to measure progress]:**
> It's setup to deploy automatically from main yes.
> Orchestrator has free reign.
> Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning.

*(Framing:)* so the first measure is the morning itself: the owner and
their brother-in-law, together in the game at the address above, having
fun. Two people playing together means online co-op with one shared party
(D-012, D-013), not only a solo build. "As much of the vision as possible"
is the orchestrator's call ("free reign"); doc 24's gates and doc 12's
golden scenarios remain the owner's own yardsticks for what to add next.

**The second deadline, and the quality bar.** **Owner, 2026-11-23 ~10:05 UTC, to Vision Partner, first-hand, after the first morning build:**
> The game looks awful. Make sure it stays on track. I want to be playing something that looks, sounds, and feels as good as kirby and the amazing mirror, but with all the decisions in the vision, by tomorrow. LONG way to go currently.

*(Framing:)* so by 2026-11-24 the bar is no longer "playable together" but
**Amazing Mirror quality in look, sound and feel**, with the decided
systems intact. Grey-box shapes and unwired sound now count against the
measure, not as acceptable placeholders.

## Principles that decide most questions

**No NPC AI.** **Owner, 2026-11-22 (Drive, doc 11, D-055):**
> NO NPCS WILL HAVE AI. This includes shopkeepers, villains, guards, champions, pets and crowds. Their three emotional modes and role-appropriate reactions are implemented through ordinary scripted game states, explicit event/role mappings, triggered animations and fixed response behaviors.

**Gameplay before joke; very little dialogue.** **Owner, 2026-11-22 (Drive, doc 11, D-056–D-057):**
> D-056 The fun is FIRST AND FOREMOST the 2D level gameplay inspired by Kirby and LEGO Star Wars: traversal, powers, exploration, secrets, enemies, stealth, escalating combat, puzzles and co-op creativity. The world premise should NOT be forcibly threaded into every area or interaction.
>
> D-057 Dialogue is VERY LIMITED, similar to the game inspirations.

**Getting caught opens play, never ends it.** **Owner, 2026-11-22 (Drive, doc 11, D-019):**
> Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.

**Solo is never locked out by headcount.** **Owner, 2026-11-22 (Drive, doc 11, D-015):**
> Do not impose a hard no-solo rule for such challenges; neither must every challenge have an explicitly designed solo solution.

**Rule of Cool.** **Owner, 2026-11-22 (Drive, doc 11, D-053):**
> Imaginative actions that honor the fiction's intelligible rules should be possible and celebrated, including surprisingly clever and outrageous uses of abilities, objects, physics and social expectations. Cool attempts need not succeed automatically; spectacular failure, collateral reactions and desperate recovery are legitimate payoffs.

**Quality over quantity in art.** **Owner, 2026-11-22 (Drive, doc 32):**
> CRITICAL USER REQUIREMENT: DO NOT upload a lot of bad assets simply to make this folder complete. … ONLY promote imagery whose quality, gameplay-scale function and style are actually aligned with the selected direction

**Promotion needs the owner.** **Owner, 2026-11-22 (Drive, doc 00):**
> Only the Decision Register authorizes a brainstorm example as a firm requirement. If a speculative example appears in a doc, it must remain labeled accordingly.

**The effort goes into the game; the process is only a guard rail.** **Owner, 2026-11-23 ~14:40 UTC, to Vision Partner, first-hand, after hearing that most usage had gone on coordinating sessions (and two stops on the account limit) rather than visible game:**
> I want as much as possible to go into actually building the game. The structure is just meant to prevent wasteful work drifting from the vision or stepping on eachothers toes, fixing things that arent broken, etc. if things can be done more efficiently to get much more resukts for less tokens, the team has full license to do that

*(Framing:)* so any procedure, document, role or check that costs more than
the drift, collisions or needless "fixes" it prevents may be trimmed, merged
or dropped by the team without asking. Results visible in the game, per
token, are what the process is judged by.

**Owner, ~14:45 UTC, confirming that framing:**
> Yup. Do whatever gets us the game I want as soon and efficiently as possible. That's all i care about

**The team finds the gaps itself.** **Owner, ~14:50 UTC, to Vision Partner, first-hand:**
> I put a lot of work into getting all the vision documentation laid out for you guys. I don't want to repeat all that. You are capable of looking at the game, looking at the vision, seeing the gaps, and closing them

*(Framing:)* the owner should never have to point out what is missing. The
team compares the live game with this document and the design library
(including the games named as inspiration), lists the biggest gaps, and
closes them in order without waiting to be told. What the owner raises
should be taste, not omissions.

**Later decisions win.** **Owner, 2026-11-23 ~15:00 UTC, to Vision Partner, first-hand, answering Q-005 [several Drive docs still state rules your later decisions replaced; does the newer rule win?]:**
> Later decisions trump earlier ones

## Frontiers

*(Framing: one line each on what the owner wants built, pointing at the
library doc that holds it. The register `docs/design-library/04-decisions-and-prototyping/11-…md`
holds every numbered decision.)*

### The world: a sacred script, delighted to play its part
**Owner, 2026-11-22 (Drive, doc 11, D-036, D-040):**
> The world has basically made a RELIGION OF THE HERO'S JOURNEY. …
> The WORLD'S INHABITANTS ARE THRILLED TO PLAY THEIR EXPECTED ROLES. The storekeeper is immensely proud and delighted to be a storekeeper

Detail: docs 02, 21; the opening (endless royal speech, about three hours
to real credits) is doc 03, D-032–D-034.

### NPC response: three modes, signals, pursuit
**Owner, 2026-11-22 (Drive, doc 11, D-048, D-063, D-073):**
> NPCs GENERALLY have exactly THREE high-level psychological modes: (1) BUSINESS AS USUAL, (2) CONFUSION / DISTRESS, (3) ABSOLUTE BLINDING VIOLENT RAGE. …
> BOTH good-guy social counteroffense and bad-guy outpost reinforcements require an ACTUAL COMPLETED CALL FOR HELP …
> GOOD-GUY MODE 3 … is NOT instantly reversible by performing a normal action

Detail: docs 07, 22, 23, 26, 27 (D-041–D-051, D-059–D-077).

**Owner, 2026-11-23 ~16:05 UTC, to the orchestrator, first-hand (relayed to Vision Partner by session_017WiGzHhke4tkAThPgw6EXs):**
> Enemies or provoked good guys need to be able to fight too.

*(Framing:)* this is not new. The library already decides it: bad guys
are "scattered throughout levels" and fight as normal heroic conflict;
mode 3 rage NPCs "can attack personally"; at active pursuit "guards attack
and try to continue signaling". It was in the design and missing from the
game. **Owner, ~16:20 UTC:** "Of course they need to be able to fight. If
you didn't get that, you need to read the documents again." The
orchestrator made it plan Step 18.

### Heroes, roster, powers and co-op
**Owner, 2026-11-22 (Drive, doc 11, D-007, D-010, D-012–D-013):**
> Unlockable and permanently expanding roster … Only a LIMITED selection of roster members is carried/switchable during an expedition. … Online co-op is a required mode. … A SINGLE SHARED PARTY is used for cooperative play.

Detail: docs 05, 06, 30 (rare, losable powers, D-080–D-082), 31 (the
cantina hub and endless brawl, D-083–D-090).

**Owner, 2026-11-23 ~15:00 UTC, to Vision Partner, first-hand, answering Q-008 [how do you leave the endless cantina brawl?]:**
> There is a bell in the middle of the cantina player can use to stop fights

### World structure, secrets and completion
**Owner, 2026-11-22 (Drive, doc 11, D-003, D-078):**
> World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub. …
> The project owner specifically likes finding HIDDEN COMPONENTS that assemble into a final object whose identity is UNKNOWN to the player while collecting pieces.

Detail: docs 04, 29; level proposals 25, 28 (not canon).

### Combat impact and the Hall of Legends
**Owner, 2026-11-22 (Drive, doc 11, D-020, D-024, D-026):**
> Spectacular IMPACT is a top priority: suplexes, launches, heavy collision, knockback into walls/other enemies, and roadblock crashes. …
> Epic stealth successes, last stands and escapes are commemorated in a Hall of Legends …
> Every participating player's history includes the event, even if played in somebody else's game.

Detail: docs 08, 09.

### Visual direction
**Owner, 2026-11-22 (Drive, doc 00):**
> Visual priority per owner: achieve Kirby & the Amazing Mirror's restraint and legibility, not merely its colorfulness.

**Owner, 2026-11-23 ~11:11 UTC, to the orchestrator, first-hand (recorded in `docs/plan/step-8.md`), on seeing the live castle street on an iPhone:**
> It all looks looks like absolute blocky shit.
> Compare to kirby and the amazing mirror and don't stop working on it until it looks similar to that. There are assets provided and you have the ability to get more.

*(Framing, Vision Partner:)* so the look is now the first thing worked on
(Step 8), and "similar" is measured against the quality and legibility of
that game, with designs that stay original (`CLAUDE.md`: keep it original).
Folded in from the orchestrator's record. Vision Partner hasn't yet
confirmed it with the owner directly.

**Owner, 2026-11-23 ~15:00 UTC, to Vision Partner, first-hand, answering Q-006 [four "current" pixel-art boards fail your own art gate; move them out of "current"?]:**
> Many of the visuals are there to establish direction. Chat has been organizing the drive to be usable. Just review it's documentation.

*(Framing:)* so the boards stay where they are, as direction; which images
are usable is read from ChatGPT's own Drive documentation ("ASSET LIBRARY —
START HERE (Claude)", mirrored at `docs/design-library/asset-library-start-here-claude.md`,
and its visual quality gate), not decided by the team.

**Owner, 2026-11-23 ~17:10 UTC, to the orchestrator, first-hand (relayed to Vision Partner):**
> I'd like everything to utilized the approved assets in the drive. If there is anything for which there is no approved asset. Start a list of those in the drive that is properly routed so it can be found and worked on. At it to the changelog

*(Framing:)* every picture and sound in the game comes from an approved Drive
asset; anything without one goes on one missing-assets list in Drive
(01 REQUESTS), noted in the Drive changelog. Rule and procedure:
`docs/mechanisms/art-pipeline.md`; Vision Partner's asset desk keeps the list
current (`docs/mechanisms/asset-requests.md`).

Detail: docs 10, 13, 14, 32. Only the look of "Pixel aesthetic reference —
approved direction" is approved; no sprite or tile is production art yet.

### Start screen and saved games
**Owner, 2026-11-23 ~15:10 UTC, to Vision Partner, first-hand:**
> The game needs a start screen where players can start a new game, continue, join the same game, etc.
> If I hav ea saved game, i should be able to load it and have a friend join me in my saved game.

*(Framing:)* this settles part of the library's open O-004 ("shared
progression/save ownership … session drop-in/out"): a saved game is loaded
by one player and friends join it. Who else may continue that save, and
what a joining friend keeps afterwards, is still open. "Etc." leaves room
for other start-screen choices. The king's speech still starts the game
once play begins (Step 6); the start screen comes before it.

### Music and sound
**Owner, 2026-11-23, to Vision Partner, first-hand:**
> Something that was not in any of the google drive stuff was music. I think you can figure out what the music and sound effects should be like from what's in there though. Do it.

Detail: `docs/audio-design.md` (Vision Partner's reading of the library, to
be judged by ear).

### Making it buildable
*(Framing:)* the library's own build strategy, explicitly marked by the
owner as a proposal, not a commitment: **Owner, 2026-11-22 (Drive, doc 11):**
> Working first-slice scope might be 5–6 rooms, 3 characters, 2 powers, 4 archetypes, 1 hijackable machine and 1 Hall pedestal. These counts, engine approach, network phasing and object taxonomy are recommendations; all remain OPEN.

Detail: doc 24 (build gates A–F), doc 12 (golden scenarios).

## Still open

- The library's own OPEN list (doc 11, O-001–O-015: camera, party size,
  player cap, save ownership, power rules, persistence, …) stays open
  until the owner settles each.

---

## Reading this document

Quote the owner directly wherever something is stated as decided, because
a conversation is not durable and a document is. Framing prose around the
quotes is fine; a decision that traces to no quote is not one.

This document should stay short enough to read in one sitting. If it is
growing without the project's actual direction changing, something in it
has stopped earning its place, the same discipline `docs/plan.md` holds
itself to.

**Archiving what's completed.** Once a section stops describing what is in
progress or still to come and only describes what already shipped, its
full text moves to `docs/vision-archive.md`, and a condensed summary with a
link stays here. Vision Partner proposes the pass and runs it on the
owner's yes (`docs/vision-partner-role.md`, "The vision documents"). A
section with a step still open against it in `docs/plan.md` is not
complete; "stopped but revivable" is not complete either.
