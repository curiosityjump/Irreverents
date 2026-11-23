# Decisions made without stopping to ask

**Standing.** Run per `docs/sop.md` phase 4. The one list of decisions any
session made on the owner's behalf instead of stopping to ask them.

## Why this file exists

**Owner, 2026-11-23 ~04:11 UTC, to the orchestrator, first-hand:**
> I don't want anything being bottlenecked by permissions issues or design decisions from me. I'm about to go to bed. Use your own judgment and document the decisions and reasoning whenever you are tempted to stop to ask me. If you need permission for anything, ask now.

So nothing waits for the owner. The price of that is that they must be
able to see, in one place and in plain words, what was decided for them
and why, and undo any of it with a word. This file is that place. Vision
Partner tells the owner how many entries are new and reads them any they
want; "no" to an entry is an answer like any other, and reopens it.

## When to write an entry

Whenever you were tempted to stop and ask the owner, and decided instead:
a design choice the vision and the library leave open, which of two
readings of their words to build, a placeholder that will be seen, a
permission you assumed. **Not** for mechanics that were always yours (how
a function is written), and not instead of the governing document: the
decision is still recorded where it governs (a step file, a mechanism
doc, a `DRAFT:` at the site); the entry here is the short, owner-readable
pointer to it.

Before deciding, look for their answer: `docs/vision.md`, the design
library (labels are literal; D-096 says to use proposals by default),
`docs/deliberate-designs.md`, this file. A decision already made here is
followed, not re-made.

**What a decision may not do:** remove or "fix" something that might be
deliberate (leave it, and log the doubt as an entry); destroy anything
that cannot be brought back (data, history, another project's sessions);
spend the owner's money outside this project's own running.

## Format

One entry per decision, appended, newest last. In the owner's terms: what
they would see or feel, not file names.

```markdown
### <date> · <the decision, in a line a player would understand>
- **Decided by:** <role, step>, `<session id>`
- **Instead of asking:** <the question you would have asked>
- **Why this way:** <the owner's words or library line it rests on; or the plain reason>
- **To change it:** <what it takes: a number in a data file, a different placeholder, real work>
- **Where:** <step file / doc section / code site>
```

The owner's reaction, when one comes, is written under the entry by
Vision Partner, quoted, and the entry then moves into the governing
document as a decision of theirs.

## Entries

### 2026-11-23 · The game is built from scratch in the browser's own tools, with no off-the-shelf game engine
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Which engine?" (your library lists it as open, D-095.)
- **Why this way:** the game's rules have to run in three places at once: on each phone, on the server that keeps two players in one world, and in the scripted tests that are the team's only way to check its own work. An engine that lives inside a web page can do the first only. An independent planning pass reached the same conclusion.
- **To change it:** real work for the rules; the drawing layer could be swapped for an engine later without touching them.
- **Where:** `docs/plan/step-1.md`, "What's decided".

### 2026-11-23 · Your own character moves instantly on your own phone; the server runs everything else
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "How should online play work?" (open in the library.)
- **Why this way:** measured tonight, a message to the live server and back takes about a tenth of a second. If every jump waited for that, movement could not be "superb" (your word, doc 01). You are friends, so the server has no need to distrust a phone.
- **To change it:** real work, but possible later without changing what the game is.
- **Where:** `docs/plan/step-1.md`, "What's decided".

### 2026-11-23 · Everyone who opens the address is in the same world; no accounts, no lobby
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "How do you and your brother-in-law find each other?"
- **Why this way:** zero steps between opening the link and playing together. Adding `?room=anything` to the address makes a separate private world.
- **To change it:** small (a join screen).
- **Where:** `docs/plan/step-1.md`, "What's decided".

### 2026-11-23 · The screen is 320×180 game pixels with 16-pixel tiles, played with the phone held sideways
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Which of the style lock's two sizes, and portrait or landscape?" (both open in the library.)
- **Why this way:** it is the size the art already ordered from ChatGPT assumes (doc 14, option B), and doc 33 calls landscape "a promising test" for a side-scroller. A phone held upright gets a "turn your phone" screen.
- **To change it:** the size is a setting plus re-ordered art; orientation is real layout work.
- **Where:** `docs/plan/step-1.md`; `docs/plan/step-5.md`.

### 2026-11-23 · What gets built first, and in what order
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Which first slice?" (you answered: "Orchestrator has free reign.")
- **Why this way:** two people in one world first, because your morning is two people playing; then comfort on an iPhone; then the feel of moving, hitting and throwing; then a small kingdom of five rooms (your library's own "miniature kingdom", doc 24); then people who react; then the king's speech, the Hall and a machine to steal; the look and sound alongside as art arrives.
- **To change it:** say what you missed most; it moves to the top.
- **Where:** `docs/current-directive.md`; `docs/plan.md`.

### 2026-11-23 · Three kinds of hero to start: a grappler, a tiny infiltrator and a flyer; players can pick up and throw each other
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Which characters, and may players throw each other?"
- **Why this way:** the three are your library's own illustrative trio (doc 24, "names/art not committed"), used as placeholders (D-096). Throwing each other is the cheapest co-op mischief there is (Rule of Cool, D-053); a held player can always break free.
- **To change it:** characters are data (numbers and abilities in a file); throwing each other is a switch.
- **Where:** `docs/plan-archive.md` ("Step 2").

### 2026-11-23 · Where two of your library's documents disagree, the newer rule is the one being built
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** Q-005 (still on your list with Vision Partner).
- **Why this way:** your later corrections say they override older wording (for example D-073: rage is not undone by one normal action, over doc 24's "quick reset").
- **To change it:** per rule, mostly a table entry.
- **Where:** `docs/plan/step-4.md`, "What's decided".

### 2026-11-23 · Nothing is saved on the server yet; the world starts fresh whenever new code goes live
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Do you want lasting saves tonight?"
- **Why this way:** lasting saves need storage on Railway that only you can add; nothing tonight depends on it. The game will say plainly what is and is not kept.
- **To change it:** add a Railway volume and tell us; then small.
- **Where:** `docs/plan/step-7.md`; the question is filed with Vision Partner.
- **Since then (04:24 UTC):** you added the volume, and the game sees it (a real one, named `irreverents-volume`, at `/data`). Hall of Legends records will be the first thing kept on it (plan Step 7). The world itself (who is standing where, what is broken) still starts fresh on a restart. One side effect: with a volume attached, each time new code goes live the game is offline for about a minute.

### 2026-11-23 · A file in the repository now tells Railway not to restart the game for documents-only changes
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "May we add a Railway settings file to your repository?"
- **Why this way:** measured tonight, every push restarted the live game, including the documents the team pushes every few minutes; that would have kicked you out mid-play. The same file adds a health check so a broken build never replaces a working game.
- **To change it:** delete the file.
- **Where:** `docs/plan/step-1.md`, "What's decided".

### 2026-11-23 · From 10:00 UTC (5am Eastern) only finished, checked work goes live
- **Decided by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "When should the team stop changing the live game?"
- **Why this way:** you may open the game at any moment after waking; half-working is worse than missing.
- **To change it:** a line in `docs/current-directive.md`.
- **Where:** `docs/current-directive.md`, "Stopping condition".

### 2026-11-23 · How the first character runs and jumps is a first guess: brisk run, a jump about three and a half tiles high, a shorter hop if you let go early
- **Decided by:** Step 1 Gate 1 worker, `session_017WiGzHGmyESjXPtM3zXt19`
- **Instead of asking:** "How should moving feel?" (yours to judge by playing; doc 01 asks for superb movement.)
- **Why this way:** something had to be there to play. The jump also forgives a press that is a tenth of a second early or late at an edge, which is common in platformers and easy to switch off.
- **To change it:** numbers in one data file (`content/tuning.json`); no code.
- **Where:** `content/tuning.json`; `docs/plan/step-1.md`, "Taste, for the owner in the morning".

### 2026-11-23 · The first kingdom is five rooms: a throne room, a castle street, a courtyard, an undercroft beneath them and a Hall gallery, with a way behind the throne and a way over the roofs that nothing points at
- **Decided by:** lead, Step 3, `session_017WiGzGUAnvQfWco5vTcMX4`
- **Instead of asking:** "What is the first map, what are the rooms called, and where do the hidden routes go?"
- **Why this way:** your doc 24 lists these five for a buildable ten-minute kingdom; your register gives "secret behind throne" as an example (E-002); doc 25 proposes rooftop routes and tunnels under a gate. The undercroft skips the street where the guarded target will be, so sneaking has a real route; the roofs skip the two-plate gate.
- **To change it:** names and layouts are room data files, each replaceable in minutes. Only the rooms' internal ids stay.
- **Where:** `docs/plan/step-3.md`, "Measure" (the map)

### 2026-11-23 · You go between rooms by walking through openings, or by pushing up in a doorway; no button
- **Decided by:** lead, Step 3, `session_017WiGzGUAnvQfWco5vTcMX4`
- **Instead of asking:** "How should a door work on a phone?"
- **Why this way:** iPhone first, "a few context-sensitive controls" (D-093, doc 33): neither kind needs a new button. An opening carries anything that passes through it, so a guard can chase you and a friend can be thrown into the next room (D-077: guards may follow between regions).
- **To change it:** each door says in the room's data which kind it is; adding a button-press kind is a small addition.
- **Where:** `docs/plan/step-3.md`; `docs/mechanisms/rooms-and-doors.md` once slice A lands

### 2026-11-23 · Rooms can be wider than the screen, and each phone's view follows its own character, into another room too
- **Decided by:** lead, Step 3, `session_017WiGzGUAnvQfWco5vTcMX4`
- **Instead of asking:** "Fixed single-screen rooms or scrolling, and one shared camera or one each?" (open in your library, O-001)
- **Why this way:** you wrote that players can "separate geographically online where practical" (S-006) and that you like friends "not being constantly tethered to one camera" (doc 06). A street to chase along needs more than one screen.
- **To change it:** a room one screen in size simply does not scroll; a shared camera would be real work.
- **Where:** `docs/plan/step-3.md`, "What's decided" (each player has their own camera)

### 2026-11-23 · The game will start in the throne room instead of the grey test hall
- **Decided by:** lead, Step 3, `session_017WiGzGUAnvQfWco5vTcMX4`
- **Instead of asking:** "Where should you appear when you open the game?"
- **Why this way:** the king's speech and "ordinary quest acceptance" are in the throne room (doc 24); it is where the story thinks you should be. The test hall stays in the game's data for the scripted checks.
- **To change it:** one line in `content/game.json`.
- **Where:** `content/game.json`, switched only once the new rooms are verified

### 2026-11-23 · Four buttons: jump, attack, grab, switch; attack throws what you are carrying
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "Which buttons?" (your library leaves the controls open, D-095, and asks for "a small reusable set of context-sensitive controls, not a dozen tiny virtual buttons".)
- **Why this way:** a separate grab button means you can always choose to hit the thing beside you rather than pick it up, and a tap never has to wait to find out whether it was a hold. While you carry something, attack throws it (aim with the stick) and grab sets it down.
- **To change it:** the buttons are a short list of data files; folding grab into a held attack is real but small work.
- **Where:** `docs/plan-archive.md` ("Step 2"), "Decided by the lead".

### 2026-11-23 · What only each of the three heroes can do: lift heavy things, fit through a tiny gap, flap up to high ledges
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "What makes the grappler, the tiny infiltrator and the flyer different?" (the library names the types and gives no move list.)
- **Why this way:** your own illustration (doc 05): a team that "would reach high ledges, small crawlspaces, heavy objects", and "strong-grab can slam an enemy or move a heavy object". The flyer gets a few weaker jumps in the air rather than free flight, so ledges still matter.
- **To change it:** numbers and a list of abilities per character in data files.
- **Where:** `docs/plan-archive.md` ("Step 2"), "Decided by the lead".

### 2026-11-23 · Characters and enemies walk through each other; only something flying from a hit or a throw shoves what it meets
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "Do bodies block each other?" (not stated in the library.)
- **Why this way:** friends never get stuck behind each other in a corridor, and every collision you see is one that matters: a thrown crate or enemy sending others flying (D-020).
- **To change it:** real but contained work.
- **Where:** `docs/plan-archive.md` ("Step 2"), "Decided by the lead".

### 2026-11-23 · A fourth friend joining a party of three plays a second copy of a hero rather than being turned away
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "What happens when more people join than there are party members?" (party size is open, O-003.)
- **Why this way:** it is for friends; nobody should open the link and be refused. Your rule that one character is never controlled by two people still holds: each has their own body.
- **To change it:** small (add members to the party list, or show a "party full" screen).
- **Where:** `docs/plan-archive.md` ("Step 2"), "Decided by the lead".

### 2026-11-23 · Enemies and heroes have a hidden toughness, never shown as a number; picking up powers from enemies waits for its own step
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "How does anything get beaten without damage numbers, and are stolen powers in tonight's build?"
- **Why this way:** harder hits and slams wear a body down faster, so impact is what beats things (doc 08: "The target is not damage numbers"). Powers were in scope only once three heroes and grab/throw are solid; those come first tonight.
- **To change it:** toughness is numbers in the tuning file; powers are a new piece of work.
- **Where:** `docs/plan-archive.md` ("Step 2"), "Decided by the lead".

### 2026-11-23 · A person notices you only if you are in front of them, fairly close, with no wall in between
- **Decided by:** lead, Step 4, `session_017WiGzG4WzuJfHAu3XWoUhc`
- **Instead of asking:** "What counts as being seen?" (your library leaves it open: "a simple event/raycast/cone/collider".)
- **Why this way:** it is the simplest rule that makes sneaking a real choice: you can slip behind someone's back or use a wall. Someone you hit or grab always notices, whichever way they face.
- **To change it:** numbers in the data file (how far, how tall); a different shape is small work.
- **Where:** `docs/plan/step-4.md`, "Measure".

### 2026-11-23 · A furious person calms down in two stages: hide long enough and they drop to merely upset; then one normal act puts them right
- **Decided by:** lead, Step 4, `session_017WiGzG4WzuJfHAu3XWoUhc`
- **Instead of asking:** "After the cooldown, are they instantly fine, or still wary?"
- **Why this way:** your D-074: "Once heat drops below the violent threshold, regular role-conforming reassurance may apply." So the "Yup! Just as expected!" moment still gets played after an escape. Left alone, upset fades by itself after a while.
- **To change it:** one line in the rules.
- **Where:** `docs/plan/step-4.md`, "Measure".

### 2026-11-23 · In the street a villain keeps coming by: he robs the shop (the shopkeeper is delighted to resist), later returns to buy a potion politely (the shopkeeper is horrified), then robs properly (relief)
- **Decided by:** lead, Step 4, `session_017WiGzG4WzuJfHAu3XWoUhc`
- **Instead of asking:** "May your shop vignette from the library be on show in the game, on a loop?" (The library labels it "an EXAMPLE of tone and mechanics, not an approved scripted mission".)
- **Why this way:** it shows the three moods and "who is acting matters" without a word of explanation, it is what build gate C asks to see, and it is a placeholder, not canon (D-096).
- **To change it:** his routine is a short list in a data file; delete him from the street's people file to remove it.
- **Where:** `docs/plan/step-4.md`, "Measure".

### 2026-11-23 · The alarm has levels 0 to 3; each finished call for help adds one; hiding unseen and doing nothing takes one off about every 20 seconds
- **Decided by:** lead, Step 4, `session_017WiGzG4WzuJfHAu3XWoUhc`
- **Instead of asking:** "How many wanted levels, and how long to hide?" (both open in your library; its 0-to-5 scale is labelled a proposal.)
- **Why this way:** three is enough to feel it climb with the handful of guards a phone can show, and short waits suit a quick session with a friend. Fighting back while chased restarts the wait but does not add a level by itself: only a finished call adds one, which keeps your rule that nothing escalates without a real signal. Everyone in the party is wanted together.
- **To change it:** numbers in the data file.
- **Where:** `docs/plan/step-4.md`, "Measure".

### 2026-11-23 · The game is also playable with the phone held upright
- **Decided by:** orchestrator, `session_017WiGzFWfLir1ATiSP7c5E5`, from an independent review of the plan
- **Instead of asking:** "If someone holds the phone upright, show a 'turn your phone' screen?" (orientation is open in your library, doc 33.)
- **Why this way:** an iPhone with rotation lock switched on never turns the page, whatever you do with the phone, and a web page cannot override that. A "turn your phone" screen would then be a dead end, possibly your whole first minute. So upright shows the game across the top with the controls underneath, plus a one-line hint that sideways is better.
- **To change it:** layout work; the sideways layout is still the main one.
- **Where:** `docs/plan/step-1.md` and `docs/plan/step-5.md`, "What's decided".

### 2026-11-23 · Joining gives you a party member nobody else is playing
- **Decided by:** orchestrator, `session_017WiGzFWfLir1ATiSP7c5E5`, from an independent review of the plan
- **Instead of asking:** "Who are you when you open the link?"
- **Why this way:** your library says the party is one shared team and "A character cannot be controlled by two humans at once", so each person who joins takes a hero nobody is playing, and leaving frees that hero. What happens when more friends join than there are heroes is the entry above ("A fourth friend…"): they get a second copy rather than being turned away. (This entry first said the extra person would be offered a world of their own; the lead's earlier, kinder rule stands instead.)
- **To change it:** small.
- **Where:** `docs/plan/step-1.md`, "Joining needs nothing, and seats you in the one shared party".

### 2026-11-23 · Once the morning report is out, no new code goes live while anyone is in the game
- **Decided by:** orchestrator, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "May the team keep improving the live game while you play?"
- **Why this way:** since your storage volume was attached, each time new code goes live the game is offline for about a minute and the world starts fresh. The game reports how many people are in it, and the team looks before pushing. A fix for something broken is the exception.
- **To change it:** tell Vision Partner you don't mind interruptions.
- **Where:** `docs/current-directive.md`, "Stopping condition".

### 2026-11-23 · How the three heroes look and feel for now: a big slow orange one, a tiny quick green one, a light blue one with wings
- **Decided by:** brief-worker, Step 2 "the body", `session_017WiGzEqGVmbgjJyorj73iV`
- **Instead of asking:** "How big, how fast and what colour is each of the three, and who does the first person to join get?"
- **Why this way:** they are placeholders until art arrives (D-096), so the aim was only that you can tell them apart at a glance on a phone and feel a difference in your thumbs. The grappler is the biggest (about a tile wide, two tall), slower to start and stop, with shoulders and a belt drawn on. The infiltrator is under a tile tall, runs about a third faster than the others, jumps a little lower and wears a headband. The flyer is in between, jumps weakest from the ground and has two small wings. The first person in is the grappler, the second the infiltrator, the third the flyer; the switch button goes round in that same order.
- **To change it:** numbers in the tuning file, sizes and colours in each hero's file, the order in the party file; the drawn marks are a few lines of drawing code and go away when sprites arrive.
- **Where:** `content/tuning.json`, `content/characters/`, `content/party.json`, `src/client/draw/entities.ts`; `docs/mechanisms/party-and-switching.md`.

### 2026-11-23 · The flyer gets three flaps per time in the air, and switching to the flyer in mid-air gives none until you land
- **Decided by:** brief-worker, Step 2 "the body", `session_017WiGzEqGVmbgjJyorj73iV`
- **Instead of asking:** "How much can the flyer fly?" (your library gives flight no limits: "not stated".)
- **Why this way:** each flap is a weaker push than a jump, and three of them carry the flyer to a ledge five tiles up that the other two cannot reach, which is what makes it the flyer. Without the mid-air rule, tapping switch round and round in the air would refill the flaps for ever and every high place in the game would be reachable by anyone, with nothing left for the rooms to hide.
- **To change it:** two numbers (how many flaps, how strong); the mid-air rule is one line.
- **Where:** `src/sim/verbs/flap.ts`, `content/tuning.json` ("flyer"); `docs/mechanisms/party-and-switching.md`.

### 2026-11-23 · Switching hero happens on the spot; where the new body would be inside a wall it skips to one that fits, or does nothing
- **Decided by:** brief-worker, Step 2 "the body", `session_017WiGzEqGVmbgjJyorj73iV`
- **Instead of asking:** "What should the switch button do when the bigger hero would not fit where you are standing?"
- **Why this way:** nobody should ever end up stuck inside a wall, so in a crawlspace the tiny one stays tiny when you press switch. Standing right against a wall is different: there the wider hero is simply nudged a few pixels clear, so the button does not feel broken beside walls.
- **To change it:** the nudge is one small block of code; the refusal should stay unless something else guarantees a way out.
- **Where:** `src/sim/verbs/switch.ts`; `docs/deliberate-designs.md`.
### 2026-11-23 · The first two rooms are drawn: a tall throne room with a dais and balconies, and a street three screens long with two buildings to climb
- **Decided by:** brief-worker, Step 3 slice A, `session_017WiGzFewfghZxs2P5YqJss`
- **Instead of asking:** "What do the throne room and the street look like?"
- **Why this way:** something had to be there to walk through. The throne room is one screen wide and taller than a screen: a low dais at the west end with clear space for the throne, a long floor for the king's audience (doc 24), and balconies each a full jump above the last. The street is flat from end to end so a chase has room, with an awning you reach from the ground, a roof you reach from the awning, and a building whose upper room you enter through a doorway under it. Nothing points at anything.
- **To change it:** each room is a small text grid in one data file; redraw the grid. Only the rooms' internal ids and their door ids stay.
- **Where:** `content/rooms/throne-room.json`, `content/rooms/castle-street.json` (both marked `DRAFT:`).

### 2026-11-23 · A doorway takes you on a fresh push up, and sets you down standing still; an opening at a room's edge takes you at a run
- **Decided by:** brief-worker, Step 3 slice A, `session_017WiGzFewfghZxs2P5YqJss`
- **Instead of asking:** "If you are still holding up when you come out of a doorway, should it take you straight back? Should you keep running through an opening?"
- **Why this way:** holding up would flick you back and forth between the two doorways; letting go and pushing again is one clear decision each time. An opening at the edge of a room keeps your speed so a chase or a thrown friend carries straight on into the next room (D-077: guards may follow between regions; impact over numbers).
- **To change it:** small, in one file.
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The two kinds of door".

### 2026-11-23 · A Hall picture is the moment rebuilt, not a photograph
- **Decided by:** Step 7 lead, `session_017WiGzF4QGboHBQtunwprhk`
- **Instead of asking:** "Is the picture on a pedestal a screenshot?" (your library leaves it open: "screenshots, render replays or in-engine freeze frames?")
- **Why this way:** the game remembers who stood where at the chosen instant (up to ten bodies, who was knocked flat, who is credited) and redraws that small inside a frame. It costs almost nothing to send to a phone, both players see the same picture, and when real art arrives every old picture is redrawn with it. A stored photograph would be frozen in tonight's coloured boxes for ever.
- **To change it:** small to add a real image beside it later; the record has a version number for that.
- **Where:** `docs/plan/step-7.md`, "Decided by the lead"; `handoff-prompts/step-7-b-detector.md`.

### 2026-11-23 · What counts as a legend tonight, and who is credited
- **Decided by:** Step 7 lead, `session_017WiGzF4QGboHBQtunwprhk`
- **Instead of asking:** "When exactly should the game decide something was legendary?" (your library: "No final score formula is selected.")
- **Why this way:** three happenings, each read from what the world itself did, never from a list. **An escape:** help was called on you, and the alarm died down again with at least one of you still standing. **A last stand:** help was called and every one of you ended up flat (losing counts, as your library says). **A quiet theft:** you took something and for eight seconds afterwards nobody called anyone. Everyone who was in that place at any point is credited, knocked out or not. Each kind has a floor so a small scuffle hangs nothing, and a repeat of something already in the Hall hangs nothing unless it beats it (longer, bigger crash, more who came). A fight where nobody ever called for help is not an event at all.
- **To change it:** the floors, the weights, the eight seconds and the titles are data; the three definitions are a few lines each.
- **Where:** `docs/plan/step-7.md`; `content/hall/` once built.

### 2026-11-23 · You read a pedestal by walking up to it, and you can throw it
- **Decided by:** Step 7 lead, `session_017WiGzF4QGboHBQtunwprhk`
- **Instead of asking:** "How do you look at a record on a phone, and is a pedestal furniture or a thing?"
- **Why this way:** no extra button on a phone: stand at a pedestal and its card appears (title, who was there, a few true numbers, where it ranks among its kind); walk away and it goes. A new legend also shows itself for about three seconds wherever you are, without stopping play. And the pedestal is an ordinary heavy body, so it can be hit, grabbed and thrown like anything else: you said not to protect the Hall from gameplay. The record rides on it and is also kept on your storage, so wrecking the Hall never loses one.
- **To change it:** small either way (a button; a fixed pedestal).
- **Where:** `docs/plan/step-7.md`; `handoff-prompts/step-7-a-store-and-pedestal.md`.

### 2026-11-23 · Hitting is one button and lands the instant you press; holding up while you hit sends the thing upward
- **Decided by:** brief-worker, Step 2 "the hit", `session_017WiGzHbbov1AymyWrXuvge`
- **Instead of asking:** "What shape is the basic attack: a wind-up, a combo, a charge?"
- **Why this way:** your library asks for impact over numbers (D-020) and leaves the move list open. The simplest thing that can feel good is a short hit in front that sends what it lands on flying, further the lighter it is, with a brief freeze at the moment of contact. Up plus hit is a launcher because knocking something into the ceiling is half the fun.
- **To change it:** reach, strength, the pause between hits and the freeze are numbers per hero in the tuning file; a wind-up or a combo is real work.
- **Where:** `src/sim/verbs/attack.ts`, `content/tuning.json`; `docs/mechanisms/combat-and-impact.md`.

### 2026-11-23 · You carry things over your head; a throw goes forward from chest height, or straight up, or down at the floor, by where the stick points
- **Decided by:** brief-worker, Step 2 "the hit", `session_017WiGzHbbov1AymyWrXuvge`
- **Instead of asking:** "How is a throw aimed, and from where does the thing leave your hands?"
- **Why this way:** a forward throw from overhead sailed over the head of an enemy standing right in front, which felt wrong, so it leaves from in front of the chest and hits what is there. Anything you pick up drops what it was itself carrying, and someone being carried cannot pick things up, so there are no stacks of people (simplest; a tower of friends could be allowed later).
- **To change it:** the arcs are a few numbers; allowing stacks is real work.
- **Where:** `src/sim/body-state.ts` (`throwCarried`), `src/sim/verbs/grab.ts`.

### 2026-11-23 · Getting hit or thrown takes your controls away until you land and slow down; a friend can hold you for two and a half seconds at most
- **Decided by:** brief-worker, Step 2 "the hit", `session_017WiGzHbbov1AymyWrXuvge`
- **Instead of asking:** "When a friend throws you, when do you get your character back?"
- **Why this way:** if you could steer straight away a throw would not carry you anywhere, and if you had to wait for the slide to stop you would be a passenger too long. So: no control in the air, control back once you are on the ground and under a certain speed, and never more than three seconds whatever happens. Pressing jump while carried gets you out at once, with a hop. Nothing a friend does to you (their hit, their throw, a crate they threw) wears you down; an enemy's does.
- **To change it:** each of those is one number or switch in the tuning file (`footingSpeed`, `flyMaxTime`, `holdPlayerTime`, `breakFreeOn`, the three `friend…` numbers).
- **Where:** `content/tuning.json` ("world"); `src/sim/systems/carry-hold.ts`, `combat-rest.ts`.

### 2026-11-23 · Enemies (and you) have a hidden toughness: enough hits and slams and they lie flat for three seconds, then get up where they fell; crates never break
- **Decided by:** brief-worker, Step 2 "the hit", `session_017WiGzHbbov1AymyWrXuvge`
- **Instead of asking:** "What happens to a body that has taken enough, and to you?"
- **Why this way:** the lead's rule for tonight is that being beaten never ends the game (S-007: "avoid hard game-over for ordinary experimentation"). Nothing is shown as a bar or a number; a flattened body is drawn lying on its side, dimmed, cannot be hit or picked up, and comes back fresh. A plain dummy goes down after about two good hits and a wall; the big one takes about three times as much. Getting up exactly where it fell is the simplest "close by".
- **To change it:** `flattenTime`, each kind's `toughness`, and how much hits and slams wear (`attackWear`, `impactWear`) are numbers; being able to grab a flattened body, or a come-back place somewhere else, is a small code change.
- **Where:** `src/sim/body-state.ts` (`wear`), `src/sim/systems/combat-clock.ts`, `content/tuning.json`.

### 2026-11-23 · What the hit looks like for now: a white flash where bodies strike, puffs of dust, a short shake of the whole screen for hard hits
- **Decided by:** brief-worker, Step 2 "the hit", `session_017WiGzHbbov1AymyWrXuvge`
- **Instead of asking:** "How should an impact look before there is any art?"
- **Why this way:** placeholders (D-096) that make the moment of contact readable on a phone: everything freezes for a few frames, flashes, shakes and puffs. The crates got a plank line instead of an eye so things and creatures tell apart.
- **To change it:** sizes and lengths are constants at the top of one drawing file; art replaces it.
- **Where:** `src/client/draw/impact.ts`, `src/client/draw/entities.ts`.
### 2026-11-23 · How a person's mood shows: nothing when all is well, a yellow "?" when upset, a red "!" and a red body when furious
- **Decided by:** brief-worker, Step 4 slice 1, `session_017WiGzFBg5B72dx48zdiZh9`
- **Instead of asking:** "How should the three moods read at a glance?" (yours to judge on a phone; the library gives no look.)
- **Why this way:** business as usual is the world at rest, so it shows nothing; the other two have to be told apart in one look, by shape and by colour. When a person speaks, their few words replace the mark for a second and a half. All plain placeholder boxes until the art step draws real ones.
- **To change it:** a few lines of drawing code and one number for how long words stay up.
- **Where:** `src/client/draw/npcs.ts` (marked `DRAFT:`); `content/tuning.json`, `npcBarkTime`.

### 2026-11-23 · What people say: "W-what?!", "ENOUGH!!", "Yup! As expected!", "Thief! Begone!", "Thank you!"
- **Decided by:** brief-worker, Step 4 slice 1, `session_017WiGzFBg5B72dx48zdiZh9`
- **Instead of asking:** "What are the words over their heads?"
- **Why this way:** you asked for very little dialogue (D-057), so the game refuses anything longer than three words. The calming line is your own "Yup! Just as expected!" (D-042) cut to fit. The guard and the villain have their own three lines each. All placeholders.
- **To change it:** the words are text in each person's data file.
- **Where:** `content/npcs/shopkeeper.json`, `guard.json`, `villain.json`.

### 2026-11-23 · One odd thing seen only ever upsets a person; it takes three small ones (or two blows) to enrage them, and left alone an upset person settles in 12 seconds
- **Decided by:** brief-worker, Step 4 slice 1, `session_017WiGzFBg5B72dx48zdiZh9`
- **Instead of asking:** "How much does it take to make someone furious, and how long do they stay upset?" (the library leaves the numbers open.)
- **Why this way:** your rule is that the first deviation is a fluke and persisting is rage (D-044, D-045), so the first odd deed, however bad, stops at upset. Taking goods counts 1 and laying hands on a good person counts 2, against a limit of 3. A furious good person is not calmed by anything you do in front of them (D-073); 15 seconds out of their sight brings them down to upset, still on edge, so one more odd deed is fury again.
- **To change it:** numbers in two data files.
- **Where:** `content/tuning.json` (`npcRageAt`, `npcDistressFadeTime`, `npcRageCoolTime`), `content/rules/expectations.json` (the weights); `docs/mechanisms/npc-response.md`.

### 2026-11-23 · Only good people are troubled by what a hero does; and a deed nobody wrote a rule for means nothing to anyone
- **Decided by:** brief-worker, Step 4 slice 1, `session_017WiGzFBg5B72dx48zdiZh9`
- **Instead of asking:** "Does the villain mind a hero stealing from the shop? What does a guard make of something we never thought of?"
- **Why this way:** nothing in the library says what unsettles a villain yet, so tonight he watches a hero rob the shop and carries on. An unlisted deed is ignored rather than guessed at, because people here are scripted and never improvise (D-055).
- **To change it:** rows in a data file.
- **Where:** `content/rules/expectations.json`.

### 2026-11-23 · Shopping has no money yet, taken goods simply leave the shelf, and the shopkeeper glances behind every five seconds
- **Decided by:** brief-worker, Step 4 slice 1, `session_017WiGzFBg5B72dx48zdiZh9`
- **Instead of asking:** "What does buying cost, what happens to what you take, and how watchful is a shopkeeper?"
- **Why this way:** the mood rules needed the acts of buying and taking, not an economy, so buying is free and what you take is only marked as yours. Buying needs the shopkeeper standing by the counter, and still counts as buying when they are furious with you (it just does not help). The glance behind (a second and a half in every six and a half) makes "behind their back" a matter of timing rather than a free shelf. These are in a test room only; the street gets its own.
- **To change it:** the glance is the shopkeeper's routine in a data file; money and carrying are real work for a later slice.
- **Where:** `content/placements/test-shop.json`; `src/sim/systems/npc-interact.ts` (marked `DRAFT:`).

### 2026-11-23 · What a pedestal, its card and a new legend look like for now
- **Decided by:** brief-worker, Step 7 slice A, `session_017WiGzFwud41UiryQTtHH52`
- **Instead of asking:** "How should the picture, the card and the announcement look, and what should the card say when records are not being kept?"
- **Why this way:** plain stand-ins until real art. The picture is a small gold frame on the pedestal with everyone as a tiny coloured block; whoever was knocked out lies on their side, and the players who earned it have a bright dot over their heads. Stand at it and a card opens across the top of the screen: the title, what kind of feat and where it ranks ("escape · 2nd of 5"), who was there, up to four of its numbers. A new legend shows "A new legend" with its picture and title at the top for three seconds, then goes. If the game has nowhere to keep records, the card says "Not saved: gone when the game restarts". Until the game knows which character is yours, anyone standing at a pedestal opens its card on every screen showing that room.
- **To change it:** small; all of it is one file, and the words are one line each.
- **Where:** `docs/mechanisms/hall-of-legends.md`, "On screen".

### 2026-11-23 · The king keeps talking through everything: carried, thrown, knocked flat, or dragged into the street
- **Decided by:** lead, Step 6, `session_017WiGzH9B4usC2uz4woP8Sa`
- **Instead of asking:** "Does anything ever shut the king up, even for a moment?"
- **Why this way:** your design says he "never reaches a normal handoff" and "the king remains committed" (doc 03, D-032), and that the speech should not be a loop. So the speech is tied to him, not to the room: wherever he ends up he is still going, from the line he had reached. His words appear over his head and only people in the same room see them. Only the big hero can lift him (he weighs what the heavy practice dummy does); anyone can hit him.
- **To change it:** one rule in the speech clock (pause while knocked out) and one number (his weight).
- **Where:** `src/sim/systems/audience-speech.ts`, `content/tuning.json` (the king's weight); `docs/mechanisms/royal-audience.md`.

### 2026-11-23 · The king's speech is a placeholder we wrote: a long opening, then digressions built from lists so it never runs out or repeats
- **Decided by:** lead, Step 6, `session_017WiGzH9B4usC2uz4woP8Sa`
- **Instead of asking:** "What does the king actually say for three hours?"
- **Why this way:** the words are yours to judge, and you said not to wait. Doc 03 gives the route ("from the ancient apocalypse to royal genealogies, forgotten accords, inheritances, farming, etiquette and back to the sacred seals") and forbids an obvious loop. Hand-writing three hours tonight is not possible, so after a hand-written opening the genealogies, accords and harvests are assembled line by line from lists, fixed and scripted, never generated by AI while playing.
- **To change it:** rewrite the text file; any line can be replaced without touching anything else.
- **Where:** `content/audience/royal-audience.json`.

### 2026-11-23 · On a phone you steer with a left/right pad under your left thumb and round buttons (Jump, Switch, …) under your right; sideways they sit beside the picture, upright below it
- **Decided by:** Step 1 Gate 2 worker, `session_017WiGzGmZK2vRuZTfKA24QD`
- **Instead of asking:** "What should the touch controls look like, and may the picture be a little smaller so they never cover it?" (the library asks for a few big controls, not many small ones.)
- **Why this way:** something had to be under the thumbs tonight. Plain shapes, clear of the notch and the home bar; every action the game has gets its own button automatically. On an iPhone 14 held sideways the picture is drawn one step smaller (4 screen pixels per game pixel instead of 5) so the controls fit in the dark strips beside it and never hide the room. On an older 16:9 phone there are no strips, and the controls overlap the bottom corners.
- **To change it:** the layout is one small file and some styling, and is Step 5's to replace with the delivered button art; "bigger picture, controls on top" is one line.
- **Where:** `src/client/shell.ts`, `src/client/touch.ts`, `src/client/index.html`.

### 2026-11-23 · Each player has a dot above their head in their own colour, in the order they joined (orange, green, yellow, blue, …), and when the connection drops the screen says "Reconnecting…" while you can still move
- **Decided by:** Step 1 Gate 2 worker, `session_017WiGzGmZK2vRuZTfKA24QD`
- **Instead of asking:** "How do I tell my friend from me, and what should the screen say when the connection drops?"
- **Why this way:** two friends can be playing the same kind of hero, and there are no sprites yet, so a coloured dot tells them apart; the words are the plainest ones. After new code goes live your page rejoins by itself and refreshes once.
- **To change it:** the colours are a list in a data file (`content/net.json`); the words are one line.
- **Where:** `content/net.json`, `src/client/main.ts`; `docs/mechanisms/network.md`.

### 2026-11-23 · After the team was stopped for three and a half hours in the night, a smaller team finishes the essentials first
- **Decided by:** orchestrator, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Your usage allowance ran out at about 1am Eastern and came back at 3:20am. Spend the new allowance fast on everything, or carefully on what you need to play?"
- **Why this way:** the allowance is shared with your other projects, the extra-usage limit for the month is spent, and the next refill is at 8:20am Eastern, after you are likely up. Running the full team again would empty it in under two hours and leave nobody to fix anything when you wake. So four leads with one worker each, in this order: two phones in one world with touch; starting in the throne room; hitting, grabbing and throwing; the king. The people who react and the Hall of Legends wait their turn; pick-up powers, the cantina and the rest are written down and waiting.
- **To change it:** tell Vision Partner you would rather it all ran at once.
- **Where:** `docs/for-the-orchestrator.md`, the handoff entry of 08:35 UTC; `docs/process-observations.md`.

### 2026-11-23 · The orchestrator started its own replacement
- **Decided by:** orchestrator, `session_017WiGzFWfLir1ATiSP7c5E5`
- **Instead of asking:** "Your kit says only you start a new orchestrator. May this one start its successor while you sleep?" (Asked at about 04:12 UTC as one of four things to confirm; you answered other things and said not to be a bottleneck on permissions.)
- **Why this way:** this session's memory had grown so large that each small action cost as much as a worker's whole turn, which was a real share of why the allowance ran out. A fresh one reads the repository and costs a tenth as much. The old one answers its questions and does nothing else.
- **To change it:** start an orchestrator yourself whenever you like ("You are the orchestrator. Read CLAUDE.md first."); it picks up from the repository.
- **Where:** `docs/for-the-orchestrator.md`, the handoff entry.

### 2026-11-23 · The plate gate stays open six seconds after someone steps off a plate, and never shuts on anyone
- **Decided by:** brief-worker, Step 3 slice B (brief by the Step 3 lead, `session_017WiGzGUAnvQfWco5vTcMX4`)
- **Instead of asking:** "How long should a gate that two plates hold open stay open once a plate is let go?"
- **Why this way:** six seconds is long enough for two friends to step off their plates and walk through together, and for one player whose crate is on the other plate to stroll through. If someone is standing in the gateway when the time runs out, the gate waits for them: your rule that there is always a way out.
- **To change it:** one number, `gateStayOpenTime` in `content/tuning.json` (or `stayOpen` on one gate in its room file).
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The kinds of part"; `src/sim/systems/room-gate.ts`.

### 2026-11-23 · A cracked wall or a window breaks when something hits it at more than twice a hero's running speed
- **Decided by:** brief-worker, Step 3 slice B
- **Instead of asking:** "How hard must something hit a breakable wall to break it?"
- **Why this way:** impact over numbers (D-020): the wall has no health, one hard arrival breaks it. At 200 a hero running into it (96) does nothing, and a thrown crate or a thrown friend goes straight through and keeps flying. It is drawn as a wall with a crack, your library's "suspicious cracked wall".
- **To change it:** one number, `wallBreakSpeed` in `content/tuning.json` (or `breakSpeed` on one wall).
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The kinds of part"; `src/sim/systems/room-breakable.ts`.

### 2026-11-23 · A false wall looks exactly like the wall around it, and you can see your character walk in front of it
- **Decided by:** brief-worker, Step 3 slice B
- **Instead of asking:** "Should a hero inside a false wall be hidden by it or stay visible? Should the false wall look or sound any different?"
- **Why this way:** nothing points at a hidden way, so the wall is identical to its neighbours. The hero stays visible in front of it so nobody loses track of their character on a phone; the surprise is walking into a wall and not stopping.
- **To change it:** move one line in `src/client/render.ts` (draw the parts after the bodies) to make the wall swallow the hero.
- **Where:** `src/client/draw/room-parts.ts`.

### 2026-11-23 · The wall behind the throne is false, the window above it breaks, and both lead to a hidden undercroft
- **Decided by:** brief-worker, Step 3 slice B (map and window decided by the Step 3 lead in the brief; the layout is this session's)
- **Instead of asking:** "Where exactly is the secret behind the throne, how big is the window, and where does someone thrown through it land?"
- **Why this way:** your library gives "secret behind throne" as an example and seats the king "against a stained-glass window; players wonder if they can suplex him through it". So: walk into the wall behind the throne and you pass through it into a hidden undercroft. Nothing marks it; the wall looks like every other wall. The window (three tiles tall, a pale graybox pane) is in the same wall above; anything thrown through it hard enough breaks it, flies on and drops into the same undercroft, so the breach also gives the secret away. A walking hero cannot break it. From the undercroft a plain doorway comes up at the west end of the street for now, so nobody is ever stuck down there; it moves to the courtyard when the courtyard is built. In the undercroft the way back to the throne room shows as an ordinary opening.
- **To change it:** the rooms are data (`content/rooms/throne-room.json`, `undercroft.json`): move the letters. To make the way back hidden from below too, set `hidden` on the undercroft's door.
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The map tonight".

### 2026-11-23 · On an iPhone SE or 8 the buttons are see-through words over the game, not discs
- **Decided by:** brief-worker, Step 5 slice A (brief by the Step 5 lead, `session_017WiGzJfkNbzJfpRVPhWoeK`)
- **Instead of asking:** "On the iPhones whose screen is exactly the game's shape (SE 2/3, 6/7/8, Plus) there is no spare strip for buttons. Shrink the game to make room, or put the buttons on top of it?"
- **Why this way:** your rule that controls never hide the game. Shrinking the game a step leaves strips too thin for a thumb, so the game stays full size and each button is only a small faint word (and two small arrows for moving) in the bottom corners, with a large invisible area to touch; it lights up while your thumb is on it. Before, five discs and a box covered about a seventh of the room, including a crate and a ledge. On wider iPhones (12 and later) nothing changes: the buttons sit beside the game.
- **To change it:** the block marked `DRAFT:` under `over` in `src/client/shell.ts` and the `#touch.over` rules in `src/client/index.html`; delete both to get the discs back.
- **Where:** `docs/mechanisms/network.md`, "The page shell"; `scripts/e2e/phone.ts`.

### 2026-11-23 · The delivered button pictures are on the touch controls; "Switch" wears the "special" picture and "Use" is a word
- **Decided by:** brief-worker, Step 5 slice A (the mapping is the Step 5 lead's, in the brief)
- **Instead of asking:** "Six button pictures were delivered (left, right, jump, attack, grab/throw, special) and the game has five buttons (Hit, Grab, Use, Jump, Switch). Which picture goes on Switch and on Use?"
- **Why this way:** the art was delivered for immediate use (D-096). Left and right are the two halves of the move pad; jump, attack and grab are as delivered. There is no "special" move yet, so its picture stands in on Switch rather than sit unused; Use has no picture, so it stays a quiet word. The pictures are small (a third of the touch area) and the old discs and box are gone on every phone, so beside the game, below it and over it the controls look the same.
- **To change it:** one line per button: `"icon"` in `content/actions/<name>.json` (remove the line to get the word back; point it at another file under `assets/ui/touch/` to change the picture).
- **Where:** `docs/mechanisms/network.md`, "The page shell"; `docs/architecture.md`, "The action list".

### 2026-11-23 · The courtyard gate needs two bodies on two plates; the gallery can also be reached over the roofs
- **Decided by:** brief-worker, Step 3 slice B (the map is the Step 3 lead's, in the brief; the layouts are this session's)
- **Instead of asking:** "How far apart are the plates, what can press them, and what happens to someone alone, or someone left in the gallery when the gate shuts?"
- **Why this way:** the plates are six tiles apart, so one hero cannot press both. Anything with a body presses a plate: a second friend, or a heavy crate, so playing alone is never locked out by headcount (your rule). Nobody is ever shut in: the gallery has steps up to a balcony, and from the balcony a way over the street's roofs; the same way gets you into the gallery without touching the gate, if you find it. Nothing points at it: the opening in the street's east wall at roof height looks like wall.
- **To change it:** the rooms are data (`content/rooms/courtyard.json`, `hall-gallery.json`, `castle-street.json`): move the letters.
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The map tonight".

### 2026-11-23 · Who rings the bell, and what you see when they do
- **Decided by:** brief-worker, Step 4 slice 2 (brief by the Step 4 lead, `session_017WiGzG4WzuJfHAu3XWoUhc`)
- **Instead of asking:** "When a shopkeeper is upset, who do they call the guards on, how often, and how does a player see it coming?"
- **Why this way:** a call is a report about the heroes, so only someone upset by a hero walks to the bell; the villain's polite purchase still horrifies the shopkeeper but sends nobody running. They plead for three seconds first (your window to make it right), walk to the bell and ring it for two and a half; a bar over the swinging bell fills as they ring, which is the time you have left to stop them. Breaking the bell yourself leaves a grey stump and it stays broken. Having called once, a person calls again only if they see something more. The alert shows as up to three red marks in the corner of the screen, and nothing at all when the area is calm.
- **To change it:** the times are `npcPleadTime` and `npcCallTime` in `content/tuning.json`; the looks are one small file, `src/client/draw/alert.ts`; "only when upset by a hero" is one marked line in `src/sim/systems/npc-call.ts`.
- **Where:** `docs/mechanisms/npc-response.md`, "Calling for help, the alert and getting away".

### 2026-11-23 · A guard who answers a call is alarmed at once, furious once they see you, and calm again the moment the alert is over
- **Decided by:** brief-worker, Step 4 slice 2
- **Instead of asking:** "What mood is a guard in while searching, and how do they stand down?"
- **Why this way:** they show the yellow "?" from the moment they are called, turn red and shout when they actually see a hero, and stay that way for as long as the alert lasts. When hiding and waiting has brought the alert to nothing they walk back to their post and are at business as usual on arrival, with no lingering distress: they were on duty, not personally wronged. They only ever walk to where a hero was reported or last seen, never to where one is.
- **To change it:** `src/sim/systems/alert-respond.ts`, the marked `DRAFT:` lines.
- **Where:** `docs/mechanisms/npc-response.md`, "Responders".

### 2026-11-23 · There is a bell in the castle street, between the shop and the guard
- **Decided by:** brief-worker, Step 4 slice 2 (placement asked for by the Step 4 lead)
- **Instead of asking:** "Where does the street's shopkeeper call for help from?"
- **Why this way:** at column 24, thirteen tiles from the shop and from the guard's beat, so the shopkeeper's walk to it takes about five seconds (time to stop them, break it first, or buy something and be forgiven), and the guard is far enough away that they come to where you were reported, not to where you are. Nobody already in the street was moved.
- **To change it:** move or delete `street-bell` in `content/placements/castle-street.json`.
- **Where:** `docs/mechanisms/npc-response.md`, "Where the people are".

### 2026-11-23 · The secret is a crawl only the smallest hero fits, and nobody who gets in is ever stuck
- **Decided by:** brief-worker, Step 3 slice B (the rules are the Step 3 lead's, in the brief; the layout and numbers are this session's)
- **Instead of asking:** "Where is the secret, who can reach it, and what if someone gets in and cannot get out?"
- **Why this way:** it is in the hidden undercroft: a gap one tile high that only a body small enough fits through (tonight the tiny infiltrator), leading to a small chamber. The other two are stopped at its mouth, and the flyer cannot flap up into it from below. But a friend can throw you up into it from underneath, and that is meant to work: getting somewhere you "shouldn't" by play is the game. Anyone inside leaves through a hole in the floor that every body fits, so nobody is ever trapped, even after switching character. There is also a cracked wall at the west end with a small vault behind it, and two curtains to hide behind (by the throne room's door, and under an awning in the street); what hiding does to being seen is not built yet.
- **To change it:** the rooms are data (`content/rooms/undercroft.json`): the crawl's length, the drop's height and the chamber's size are letters in a grid.
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The map tonight".

### 2026-11-23 · A friend whose phone slept or lost its connection is shown dimmed with three dots until they are back
- **Decided by:** brief-worker, Step 5 slice A (brief by the Step 5 lead)
- **Instead of asking:** "When your friend's phone locks or drops off the network, their character just stood there for 15 seconds and vanished. What should you see meanwhile?"
- **Why this way:** so nobody waits on, or throws things at, a friend who is not there without knowing it. The character goes dim and gets three small dots over its head within a moment of the page going quiet (2.5 seconds of silence, or at once when the connection closes), and is itself again the moment they return. It still disappears after 15 seconds as before. No words on screen: dialogue and text stay minimal.
- **To change it:** the look is one small file, `src/client/draw/away.ts`; the 2.5 seconds is `AWAY_SILENCE_MS` in `src/server/game.ts`; the 15 is `staleSeconds` in `content/net.json`.
- **Where:** `docs/mechanisms/network.md`, "A page that went away".

### 2026-11-23 · The game's pictures are being drawn by us, in code, instead of waiting for ChatGPT's asset desk
- **Decided by:** orchestrator, Step 8, `session_017WiGzHX8g2sXimNRnqp2oZ`
- **Instead of asking:** "The asset desk has delivered no characters you accepted and no tiles for the town. Wait for it, or make the art ourselves now?"
- **Why this way:** you said the game looks like blocky shit and not to stop until it looks similar to Kirby & the Amazing Mirror. The desk works hourly and has delivered nothing since about 04:15 UTC, so waiting leaves rectangles on your screen all morning. Small drawing programs in the repository now make original characters, ground, skies and props in the style of your approved direction. Nothing is copied from Kirby or any other game (your own art gate). Every picture is a stand-in.
- **To change it:** each picture is wired in as a data file (`content/sprites/`, `content/atlases/`); when the desk delivers a sheet you like, it replaces ours by changing that file. To stop our art altogether, delete those data files and the rectangles come back.
- **Where:** `docs/plan/step-8.md`, "The look, from 2026-11-23 11:11 UTC".

### 2026-11-23 · New looks are pushed to the live game as they are ready, even if you are in it
- **Decided by:** orchestrator, Step 8, `session_017WiGzHX8g2sXimNRnqp2oZ`
- **Instead of asking:** "Each update restarts the world for about a minute and your page rejoins by itself. Hold the new look until nobody is playing, or push it as it lands?"
- **Why this way:** you asked for the look to be worked on without stopping, and you can only judge it by seeing it. Updates are batched into a few larger ones rather than many small ones, and each is fully checked first.
- **To change it:** say "hold pushes while we play" and the earlier rule returns (no update while anyone is in the world).
- **Where:** `docs/current-directive.md`, "The allowance".

### 2026-11-23 · The look is being run by the orchestrator's own team of agents, not handed to a separate lead
- **Decided by:** orchestrator, Step 8, `session_017WiGzHX8g2sXimNRnqp2oZ`
- **Instead of asking:** "Run this the usual way (a lead, then workers) or directly?"
- **Why this way:** you switched on multi-agent workflow mode in the same message that asked for the look, and a lead would spend its first half hour reading before any pixel changed.
- **To change it:** release Step 8's claim in `docs/plan.md` and start a lead; everything it needs is in the step file.
- **Where:** `docs/plan/step-8.md`, "The look".

### 2026-11-23 · The new look arrives piece by piece over the next hours, each piece restarting the world for about a minute
- **Decided by:** orchestrator, Step 8, `session_017WiGzHX8g2sXimNRnqp2oZ`
- **Instead of asking:** "One big update when everything is ready, or each part (characters, ground, skies, the upright layout, sound) as soon as it is ready?"
- **Why this way:** you said not to stop and you can only judge it by seeing it; one big update would have meant another hour or two of rectangles. Nine parts are being made at once, so expect around ten short restarts; your page rejoins by itself each time. This replaces "a few larger updates" in the entry above.
- **To change it:** say "hold pushes while we play" and the parts are held until the world is empty.
- **Where:** `docs/plan/step-8.md`, "The look"; each lane's brief in `handoff-prompts/`.

### 2026-11-23 · The code half of the look is being built on Opus, the drawing half on the stronger model
- **Decided by:** orchestrator, Step 8, `session_017WiGzHX8g2sXimNRnqp2oZ`
- **Instead of asking:** "Which of the two models should do what while the weekly allowance on the stronger one is nearly spent?"
- **Why this way:** you said "Use opus instead of fable if needed". Drawing is the part most likely to decide whether it looks right, so it keeps the stronger model; the renderer, the upright layout and sound go to Opus so that a tripped limit cannot stop everything at once.
- **To change it:** say which model you want for which; it is one setting per worker.
- **Where:** `docs/plan/step-8.md`, "The look".

### 2026-11-23 · A dial change on the `?tune` panel applies to everyone in that world, until the next restart
- **Decided by:** Step 2 lead, `session_017WiGzGN9egot3JUvSMBBA9`
- **Instead of asking:** "When you change how the game feels from your phone, should it change only for you, or for everyone playing with you; and should it be kept?"
- **Why this way:** hits, throws and bounces are worked out on the server, so a change only on your phone would leave half the dials doing nothing. You tune with your brother-in-law in the same world, so you both feel the same change. Nothing in the game is kept between restarts yet, so the panel copies the numbers out for a session to make them the default.
- **To change it:** say "tune only for me" (the dial stays on your phone; the server-run numbers then cannot be dialled) or "keep my dials" (needs saving, Step 7's store).
- **Where:** `handoff-prompts/step-2-feel-dials.md`; when it lands, `docs/mechanisms/tuning-panel.md`.

### 2026-11-23 · The three heroes now move and fall differently, not only do different things
- **Decided by:** Step 2 feel worker, `session_017WiGzEuk7zACZWPXaqAcBQ`
- **Instead of asking:** "How should each of the three feel to run and jump?"
- **Why this way:** you asked for the feel of a careful platformer and for the three to feel different. The infiltrator now reaches full speed and stops in about a twentieth of a second and is the lightest (it flies furthest when hit); the flyer floats down at under half the others' speed and hangs longest at the top of a jump; the grappler slides a little when it stops, drops out of the air hardest and winds up its punch longest. Every jump has a small hang at the top. How high each jumps, and how fast the grappler starts and stops on the ground, were left as they were, because the rooftop, ledge and secret routes and the door checks are measured on them.
- **To change it:** open the game with `?tune` and move `apexGravity`, `fallGravity`, `fallSpeed`, `runAccel`, `runDecel` or `weight` for that hero; or say "the plain jump back" (all multipliers 1).
- **Where:** `content/tuning.json`; `docs/mechanisms/combat-and-impact.md`, "Movement feel".

### 2026-11-23 · A punch has a short wind-up; a throw is still instant
- **Decided by:** Step 2 feel worker, `session_017WiGzEuk7zACZWPXaqAcBQ`
- **Instead of asking:** "Should a hit land the moment you tap, or after a wind-up? And a throw?"
- **Why this way:** the step asks for a wind-up, a strike and a recovery so hits read as weighty. The grappler draws back for 0.1 s, the flyer 0.05, the infiltrator 0.033 (two frames). A throw stays instant: it reads as letting go, and the brief left that open.
- **To change it:** `attackWindup`, `attackStrikeTime`, `attackRecovery` per hero on the `?tune` panel (0 wind-up is the old instant hit).
- **Where:** `src/sim/verbs/attack.ts`; `docs/mechanisms/combat-and-impact.md`.

### 2026-11-23 · Harder hits freeze longer, and thrown things bounce off the floor
- **Decided by:** Step 2 feel worker, `session_017WiGzEuk7zACZWPXaqAcBQ`
- **Instead of asking:** "How long should the freeze on impact be, and should a thrown body bounce?"
- **Why this way:** your "OHHHHH" is about the size of the impact. The freeze now runs from 2 frames for a soft hit to 8 for one at full launch speed (3 to 9 for slamming into a wall, floor or someone), and a body thrown or knocked into the floor bounces up at 45% of its speed, each bounce lower, instead of stopping dead.
- **To change it:** `hitBeatTime`/`hitBeatMaxTime`, `beatTime`/`beatMaxTime`, `floorBounce`, `floorBounceSpeed` on the `?tune` panel (max equal to min is a fixed freeze; `floorBounce` 0 is no bounce).
- **Where:** `src/sim/body-state.ts` (`beatTicks`), `src/sim/systems/impact-walls.ts`.

### 2026-11-23 · Step 4's "hit the shopkeeper" check waits a moment longer for the blow
- **Decided by:** Step 2 lead, `session_017WiGzGN9egot3JUvSMBBA9` (Step 4 has no lead running), done by the Step 2 feel worker
- **Instead of asking:** "The wind-up delays the blow; may another step's check be loosened to allow it?"
- **Why this way:** the check means "the blow distresses her and the robbery doesn't calm her"; only when the blow lands changed. Its window is widened (hit within a quarter second of the press) rather than pinned, so a later wind-up dial doesn't break it again.
- **To change it:** set the grappler's `attackWindup` to 0 and narrow the window back in `scenarios/step4-hero-hits-shopkeeper.json`.
- **Where:** `scenarios/step4-hero-hits-shopkeeper.json`; `docs/plan/step-4.md`, handoff notes.

### 2026-11-23 · More of the game runs beside the look: the cantina and the outpost now
- **Decided by:** orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`
- **Instead of asking:** "Should levels, enemies and the cantina wait until the look is finished?"
- **Why this way:** you said "I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet". Step 11 (the cantina's brawl) and Step 12 (the outpost: guards who call for help, a chase) bring those, and the game-feel work they lean on is done. The look keeps going at the same time. Only two more leads start, each running one worker at a time, because ten sessions at once hit the account's usage limit at 12:36 UTC.
- **To change it:** release Step 11's or Step 12's claim in `docs/plan.md` (or tell the orchestrator which to stop).
- **Where:** `docs/plan.md` Steps 11 and 12; `docs/current-directive.md`.

### 2026-11-23 · The heroes you liked stay; the grappler and the infiltrator get bigger faces, and the grappler leaves the castle's colours
- **Decided by:** orchestrator, Step 8 look round 2 (synthesis stage), `session_017WiGzGp8auJceLEAAh9Aqx`
- **Instead of asking:** "Two hero sets exist: the one in the game now, which follows the concept you liked (a slate bruiser with an orange crest and scarf, a green leaf-eared imp with goggles), and a second drawn overnight that is rounder with bigger faces but different characters (an orange barrel in a red cone hat, a green blob with a purple headband). Which one?"
- **Why this way:** all three reviewers of the live game said the same thing: the set in the game has your concept's characters but tiny faces, and the second set has better faces but is not your concept. Swapping it in would replace designs you liked with ones you never saw. So the game keeps its set and redraws two of them with the second set's proportions (a head and face nearly half the height, big eyes with a light pixel, brows, a mouth that changes when he shouts). The grappler is painted today in exactly the lilac of the castle walls (his main colour is the castle tile's commonest colour), so in the start room he melts into the wall: he moves to a darker, bluer slate like the concept's, and his crest becomes swept-back orange spikes, because next to the king it read as a second crown. The infiltrator stands up (it is drawn lying flat, a green smear at phone size) and is drawn about twice its current height, over the same small body that collides.
- **To change it:** say "the other heroes": the second set is kept whole on the branch `claude/gallant-keller-1gpm2y` (commit c7c9555); putting it in is replacing four pictures and four data files, no code.
- **Where:** `docs/plan/step-8.md`, "Round 2 (2026-11-23)"; `handoff-prompts/look2-heroes.md`.

### 2026-11-23 · Held sideways, the game fills the phone and the buttons sit over it, see-through, on every iPhone
- **Decided by:** orchestrator, Step 8 look round 2 (synthesis stage), `session_017WiGzGp8auJceLEAAh9Aqx`
- **Instead of asking:** "Held sideways, should the game be a smaller picture with the buttons in dark side panels, or fill the screen with see-through buttons over it?"
- **Why this way:** with the panels, the picture takes about two thirds of the width (measured on the round-2 screenshots: 990 of 1500 pixels) and on a real iPhone 14 in Safari it works out at about 58%, so everyone is drawn small and it looks like an emulator skin, which is not what you asked for ("Looks awful in both right now"). The panels came from our own reading of your library's rule "UI should not cover secret entrances or enemies"; the see-through buttons already used on smaller iPhones paint under 3% of the picture. To keep your rule, the camera now keeps the floor and your character clear of the buttons, and a scripted check proves it. The picture is also framed a little closer (about 11 tiles tall instead of 13 to 14), like the references, so characters are about a fifth bigger on screen.
- **To change it:** say "the side panels back": one comparison in the page layout (a tie goes back to the panels) and the old view size; the scripted check `c2` returns to "no button over the picture".
- **Where:** `src/client/shell.ts`; the check `c2` in `scripts/e2e.ts` and the phone list in `scripts/e2e/phone.ts`; `docs/plan/step-8.md`, "Round 2"; `handoff-prompts/look2-frame.md`. When it lands, `docs/plan/step-5.md`'s "Controls never hide the game" is updated to match.

### 2026-11-23 · From the art desk's ruins kit, the impact star, the slash, barrels, a lantern post and ruined arches go in, re-coloured to the game's palette; the rest is reference
- **Decided by:** orchestrator, Step 8 look round 2 (synthesis stage), `session_017WiGzGp8auJceLEAAh9Aqx`
- **Instead of asking:** "The kit is brighter and rounder than what we drew, but each picture is painted with hundreds to thousands of colours and soft edges. Use it as it is, re-colour it, or only copy its look?"
- **Why this way:** dropped in as they are, its pictures would look like a different game next to ours (one barrel has 1,412 colours; ours have a fixed palette and dark outlines). So one small program re-colours each chosen piece to the game's palette with clean edges and an outline, and the result goes in as data. Used: the impact star (replaces the thin sparkle when something is hit, the single biggest gain), the spark slash, two barrels, the lantern post (with a glow), the ruined arch and broken column (far behind the courtyard only, with sky through the arch so it never looks like a door). Not used: the arrow sign (nothing in the game may point), the ladder (it would look climbable), the banner (ours is as good), the flat-topped pillar (it would look like something to stand on), the chest (it would look like something to open, and could seem to mark a secret), the crate (ours has a body and must stay its size). Its two heroes are not our party; they set the size and face proportions our heroes are redrawn to. Its ground pieces are not on the game's 16-pixel grid, so they are the model our ground is redrawn to, not tiles.
- **To change it:** remove an imported piece's entry from its data file and the drawn stand-in comes back; or ask the desk for palette-locked versions (the ratings sent back say so).
- **Where:** `docs/plan/step-8.md`, "Round 2"; `handoff-prompts/look2-props.md`, `look2-ground.md`.

### 2026-11-23 · Fewer, longer-lived builders: one reused worker per step, less paperwork
- **Decided by:** orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, under the owner's licence: "if things can be done more efficiently to get much more resukts for less tokens, the team has full license to do that" (~14:40 UTC)
- **Instead of asking:** "Which parts of the process can go?"
- **Why this way:** today about 45 sessions ran, and every cold one re-read the same documents before doing anything. Two stops on the account's five-hour limit followed. Reusing one worker per step, by message, removes most of those cold reads. Briefs, review by re-running, and path ownership stay, because they are what stops drift and collisions.
- **To change it:** delete the "Fewer, longer-lived builders" paragraph at the top of `docs/lead-session.md` "What the role is".
- **Where:** `docs/lead-session.md`; the Step 8 round-2 lanes and Steps 11–12 run this way.

### 2026-11-23 · How the cantina brawl ends, and its first shape
- **Decided by:** Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd`
- **Instead of asking:** Q-008, "How does someone leave the endless cantina brawl?", and the open parts of doc 31 (where the door is, who is unlocked, where the edge is, who gets a knock-out).
- **Why this way:** **Updated 14:45 UTC after your answer to Q-008** ("There is a bell in the middle of the cantina player can use to stop fights"): ringing the bell with Use ends the brawl, and the last player walking out still ends it, because there is always a way out. The few-seconds calm timer is switched off (kept as a number, 0), so the fight never stops by itself. The door is on the castle street at ground level between the two buildings (the step's "off the castle street"). Everyone in the roster is unlocked, because nothing in the world unlocks anyone yet, and two extra characters join the three so a bar fight has more than one or two people in it. The arena's edge is a line drawn inside the room, because nothing can leave a room's bounds. A knock-out goes to whoever sent the body flying, else whoever knocked it flat, else the last to hit it.
- **To change it:** the bell's place, the calm time (0 = off), edge, pads and patterns are numbers in `content/cantina/`; the door is one tile in `content/rooms/castle-street.json`; the roster is `content/roster.json`.
- **Where:** `docs/plan-archive.md` ("Step 11"); `handoff-prompts/step-11-a-brawl.md` while it runs, then `docs/mechanisms/cantina.md`.

### 2026-11-23 · The outpost's horn: what it brings, what stops it, and how much it takes
- **Decided by:** Step 12 slice A worker (`handoff-prompts/step-12-a-outpost.md`), for the Step 12 lead `session_017WiGzJTXQVCWQYDDmC2UiY`
- **Instead of asking:** the library leaves open whether a stopped caller tries again, how much it takes to break the horn, and the wave table (doc 24, D-061).
- **Why this way:** you want "stop the caller" to count, so a lookout knocked out or grabbed mid-call never calls again; they fight instead. A lookout who finished a call goes again 6 s later while a hero is in sight, and each finished call (3 s at the post) brings one wave, 1, then 2, then 3 fighters, the last row coming again for ever (doc 24: no cap on waves). A wave waits while the room would pass 8 people (doc 24's bounded crowds; out-cold people count, they are still there). The horn post breaks after 3 hits or when a body is thrown or knocked into it fast; it stays broken until the game restarts and nothing is saved. A lookout goes down to one good blow (toughness 30, everyone else 100), so stopping the call is a real move. The outpost's call never raises the good guys' alert: it brings waves (Step 4's bell and alert are untouched). A caller knocked away from the post (not out) stops their call and may go again (`left-the-signaler`, a fifth reason beside the brief's four). When no hero is left in the room, a call being sounded stops and waiting waves are dropped; the people there stay.
- **To change it:** every number is in `content/outposts/<id>.json` (`callTime`, `callAgain`, `breakHits`, `breakSpeed`, `bound`, `waves`) and `content/tuning.json` (`outpostCallReach`, the lookout's toughness); "a stopped caller calls again" is one line (`st.done = true`) in `src/sim/systems/outpost-call.ts`.
- **Where:** `src/sim/systems/outpost-*.ts`, `src/sim/outpost/state.ts`, `content/outposts/`; `docs/mechanisms/outposts.md` once push 2 lands.

### 2026-11-23 · Two layers, reused builders, short role cards, small orchestrators, less paperwork
- **Decided by:** orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, on the owner's instruction, first-hand, ~15:20 UTC: "Implement the structural changes you recommended for efficiency. Then i'll start the new orch" (under their licence in `docs/vision.md` "Principles": "if things can be done more efficiently to get much more resukts for less tokens, the team has full license to do that")
- **Instead of asking:** "Which of the recommended changes, and how far?" They said implement them.
- **Why this way:** from 03:23 to 15:15 UTC about 285 commits reached the game's branch and only about 60 touched the game itself; process documents grew by about 29k lines (8k deleted) against about 26k lines of game. About 50 sessions ran, and the coordinators cost the most: the first orchestrator about $140, the next two $37 and $58, the first Vision Partner $28, while the nine workers who drew nearly all the art you can see cost about $83 together. Most of the waste was three layers each starting cold and re-explaining, orchestrators whose memory grew to 500–680k tokens and was re-read every turn, and paperwork about paperwork. So: the orchestrator briefs builders itself (a lead only for a big many-slice step; the three running carry on); one builder per area, sent its next brief by message; two short start-up cards replace reading the long charters in full (which stay, as reference); an orchestrator hands off at about 250k tokens; status lines stay one line and answer receipts stop (git log is the record); and one number, spend per change you can see, is taken at every handoff.
- **To change it:** revert the commit "Lean structure: two layers, reused builders, role cards, small orchestrators, less paperwork (owner's instruction)"; nothing was deleted, the long documents were kept, so the old way comes back whole.
- **Where:** `docs/roles/orchestrator-card.md`, `docs/roles/builder-card.md`; `CLAUDE.md` "How to work here"; the notes at the top of `docs/orchestrator-role.md`, `docs/lead-session.md` and `docs/sop.md`; `docs/plan.md` "How a lead finds its element"; `docs/measures.md` M4.

### 2026-11-23 · The camp east of the courtyard: its layout, and the high way across
- **Decided by:** Step 12 slice A worker, for the Step 12 lead `session_017WiGzJTXQVCWQYDDmC2UiY`
- **Instead of asking:** "What does the outpost look like, and how does sneaking past it work?"
- **Why this way:** the courtyard's new doorway (push up, column 23, the lead's column: 1-13 are kept for Step 7's machine) leads into the "Bandit Camp", about two screens wide. Every way in crosses a three-tile step; from it a hop reaches a long ledge five tiles above the floor, where the lookout cannot see you (their sight reaches 40 px up), so you can cross the whole camp unseen, or drop off the ledge into it. Below: a lookout watching the way in (glancing back now and then), the horn post two tiles behind them, two fighters; waves walk in at the far east end. The way back is the same doorway, which nobody of the camp ever uses, so no fight can shut it.
- **To change it:** the room is `content/rooms/outpost.json`, the camp `content/placements/outpost.json`, the numbers `content/outposts/outpost.json`; the door is one character in `content/rooms/courtyard.json`.
- **Where:** `docs/mechanisms/outposts.md`, "The rooms".

### 2026-11-23 · The quarry's six rooms: their shapes, and which hero each secret belongs to
- **Decided by:** Step 16 slice 1 worker (`handoff-prompts/step-16-a-quarry-rooms.md`), for the Step 16 lead `session_017WiGzHt9iJy3caBLkT1Ef4`
- **Instead of asking:** the library gives the quarry's room list (doc 28) but not its shapes, and leaves which secret is whose to the body rules (doc 04, D-006).
- **Why this way:** the main way works for the weakest jumper (steps up and gaps at most two tiles), so every hero alone gets from the road to the far side of the depot, about twelve and a half screens. Each hero has one place only their body opens: the flyer's ledge on the road, six tiles up with nothing to climb (a friend can also throw someone up: there is a lip at its end so a thrown body stays); the infiltrator's crawl on the ridge, one tile high, into a pocket under the main way (its floor has a hole into the pit, so anyone who lands in it can leave); the grappler's heavy rock in the depot's cellar, the only thing there heavy enough, thrown into the cracked wall to open the way up into the strongroom from below. In the pit, a ledge eleven tiles up that nobody reaches yet, in plain sight. The cave is reached by a hidden opening in the pit's west wall rather than through a breakable wall, because the way-out check treats an unbroken wall as solid and would call the cave unreachable; the cracked wall went to the depot's cellar instead ("through"). The strongroom's front and back are open and on the main way tonight; slice 3 decides who guards it. Two routes nothing points at: the tower's top-west opening onto the ridge's shelf (the way back), painted as wall in the tower, and the pit's west opening into the cave, painted as wall in the pit.
- **To change it:** the rooms are `content/rooms/quarry-*.json` (each file's `//` says what is where); the rock is `content/placements/quarry-depot.json`. The throw arrives at about 206 px/s against the wall's 200, so a retune of the grappler's throw or the rock's weight shows first in `step16-secret-cellar-wall-grappler`.
- **Where:** `docs/plan/step-16.md`; `docs/mechanisms/rooms-and-doors.md` ("The map tonight") once the rooms are joined.

### 2026-11-23 · The cantina as built: its room, the bell's place, how hard friends hit, who the two new heroes are
- **Decided by:** Step 11 slice A worker `session_017WiGzJevWWEqkTeNWGQ1WX`, for the Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd`
- **Instead of asking:** the parts of doc 31 and the brief left open: the room's size, the edge, the numbers, the regulars' patterns, the two characters, the counter's look, where the bell stands.
- **Why this way:** the room is a stage a little wider than one screen with a one-tile drop of open air past each end, so being launched or walking off the end reads as "out" and you are back on a pad at once; the doorway home is at the west end of the floor, away from the pads. Being launched **up** never puts you out (you hit the ceiling): the flyer can flap that high on its own, and an edge it could cross by flapping would teleport people who were only playing. Walking off the end with no fight on puts you back too, with no score. In a brawl friends hit each other exactly as hard as anyone else (all three shares 1). The bell stands mid-stage (column 13); Use within about a tile of it rings it. The two new heroes are a heavy **brawler** (pink, slow, the hardest punch, hardest to knock out) and a light **skirmisher** (yellow, fast jabs that barely push, easy to send flying), built only from moves that exist; they are in the roster, not the party. Regulars go for whoever hit them in the last three seconds, else the nearest body, and swing on their own beat. The counter is one strip along the top: each player's colour, then "n KO n FALL", only during a brawl, nothing over a hit.
- **To change it:** the room is `content/rooms/cantina.json`; edge, pads, bell, shares, calm time and patterns are numbers in `content/cantina/cantina.json`; the two heroes are `content/characters/brawler.json`, `skirmisher.json` and their sections in `content/tuning.json`; the counter's words and look are `src/client/draw/cantina.ts`. An upward ring-out is the edge's top row raised above 0 (and the room made taller).
- **Where:** `docs/mechanisms/cantina.md`.

### 2026-11-23 · Step 17: how a saved game is named, kept and joined
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`
- **Instead of asking:** "How does a friend find my saved game, and what does a save keep?"
- **Why this way:** a four-letter code (no I, L, O) is easy to say across a room and type on a phone, and a `?game=CODE` link can be sent from the phone's share sheet. A save keeps what was done to the world (rooms, every body that is not a player), every 30 s and when the last player leaves; players come back in as they join today. Anyone with the code can continue or join (friends, no accounts). `main` and `?room=` are unchanged, so every scripted check and today's shared kingdom keep working.
- **To change it:** the alphabet, interval and record live in `src/server/saves.ts`; the start screen's choices in `src/client/start.ts`. Keeping each player's own position is a field added to the record.
- **Where:** `docs/plan/step-17.md`.

### 2026-11-23 · How the cantina's party swap and door lock work at first
- **Decided by:** Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd`
- **Instead of asking:** the parts doc 31 and D-084/D-088 leave open: what tapping a hero already in the party does, whether you can swap mid-brawl, what replacing your own character does, when the party row closes, and what "being chased" means for the door.
- **Why this way:** tap a wandering hero who is not in the party and your party appears across the screen; tap the one to replace. Replace someone nobody is playing and they swap; replace yourself and you become the newcomer; a friend's character is never taken (doc 06). No swapping while a brawl is on, so a tap mid-fight is never a surprise. The row closes when you move, tap elsewhere, or after a few seconds. The door refuses only while a good-side guard is actively chasing you, not merely because an alarm was raised (D-088 says a raised alert alone is open).
- **To change it:** each is one rule in the cantina's systems (`docs/mechanisms/cantina.md`); the row's timing is a number in `content/cantina/cantina.json`.
- **Where:** `docs/plan-archive.md` ("Step 11"); `handoff-prompts/step-11-b-hub.md` while it runs.

### 2026-11-23 · The cantina looks like a tavern: plaster, timbers and a board floor
- **Decided by:** Step 11 slice B builder `session_017WiGzHXvo5fjfVSeDUTX44`, for the Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd`
- **Instead of asking:** "Should the cantina look like the castle's stone halls or the town's houses?"
- **Why this way:** the town's cream plaster between wooden posts, with a board floor, reads as the inside of a tavern; the castle's lilac blocks read as a throne room. The back wall is the same calm stone wall every indoor room without its own backdrop gets.
- **To change it:** one word (`'cantina': 'town'` → `'castle'`) in `tools/art/tiles/make.py`, then run it; a tavern-specific back wall is a new branch in its `backdrop_json`.
- **Where:** `tools/art/tiles/make.py` `ROOM_THEME`; `docs/mechanisms/art-pipeline.md`.

### 2026-11-23 · Step 17 as built: a game is also saved when the server stops, and the start screen asks the server whether a code exists
- **Decided by:** Step 17 builder `session_017WiGzGw7XaQ6tZNddFaa8s`, for orchestrator `session_017WiGzHhke4tkAThPgw6EXs`
- **Instead of asking:** what the brief left open: how the join screen learns a code exists, what happens to a game being played at a deploy, and what a save does with a room added by a later build.
- **Why this way:** a deploy stops the old server before the 30-second save comes round, so every game being played is also saved when the server is told to stop; nothing done in the last half-minute is lost to a push. "Does game CODE exist?" is a small `GET /game/CODE` rather than a change to the join messages, so the page can ask before connecting and the messages stay as they are. A room that a later build adds is filled as new in a saved game; a room the save already knew keeps what was done to it, even if a later build put more things in it.
- **To change it:** the stop handler is the `SIGTERM` lines at the end of `src/server/main.ts`; `/game/` is one branch in the same file; which rooms are filled is `newRooms` in `src/server/saves.ts`.
- **Where:** `docs/mechanisms/saves.md`.

### 2026-11-23 · The Bandit Camp looks like the courtyard's grass and old stone
- **Decided by:** Step 12 slice B builder, for the Step 12 lead `session_017WiGzJTXQVCWQYDDmC2UiY`
- **Instead of asking:** "What should the camp's ground and sky look like?"
- **Why this way:** the camp is outdoors, through a doorway at the courtyard's east end, so it borrows the courtyard's grass-topped blocks and its far hills, castle wall and front bushes; it reads as the same countryside, one door on. A camp of its own (tents, a palisade) is new drawing, not a choice between what exists.
- **To change it:** one word (`'outpost': 'grass-ruins'` → another theme) in `tools/art/tiles/make.py`, and its `backdrop_json` branch, then run it.
- **Where:** `tools/art/tiles/make.py` `ROOM_THEME`; `docs/mechanisms/art-pipeline.md`.

### 2026-11-23 · Orchestrators run to about 800k tokens and start their own successors
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, on the owner's words (first-hand, ~16:20 UTC, when told the orchestrator would hand off at 316k): "Just keep going i can't be babysitting handoffs all the time"
- **Instead of asking:** "At what size should an orchestrator hand off, and who starts the next one?"
- **Why this way:** the owner had to start every orchestrator by hand, and the 250k threshold meant one every hour or two. 800k stays clear of autocompact (about 900k), which is the real harm CLAUDE.md guards against ("Never run long enough to compact your own memory"). A self-started successor means the owner starts none. The lineage limit (8) is the one thing that still needs them, so the card asks for one line at depth 6.
- **To change it:** `docs/roles/orchestrator-card.md`, "Handing off" (the threshold and the spawn line); `CLAUDE.md`'s "Every session … is disposable" paragraph.
- **Where:** the card; `docs/orchestrator-role.md`, "Handing off to a fresh successor".

### 2026-11-23 · Two guards at most follow a hero through one door
- **Decided by:** Step 12 slice B builder `session_017WiGzFLgKMowRCLNbRRYiE`, for the Step 12 lead `session_017WiGzJTXQVCWQYDDmC2UiY`
- **Instead of asking:** "How many guards follow a hero into the camp?"
- **Why this way:** the owner wants the chase to carry between regions (D-077) and the camp and town to be one world (D-069), but a whole watch pouring through a doorway would empty the town and swamp the camp's bound on people. The nearest two who saw the hero go follow; the rest search where they stand, as a guard who never saw them leave does (D-065).
- **To change it:** `chaseCrossCap` in `content/tuning.json` (`world`); 99 means everyone who saw follows, as before.
- **Where:** `src/sim/systems/chase-cap.ts`; `docs/mechanisms/outposts.md`, "Chase and clash".

### 2026-11-23 · Swapping heroes in the cantina: how it looks and how long the row stays
- **Decided by:** Step 11 slice B builder `session_017WiGzHXvo5fjfVSeDUTX44`, for the Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd`
- **Instead of asking:** "How big is the party row, what does it say, and how forgiving is a tap?"
- **Why this way:** the row is three big squares in each hero's colour across the top of the screen, about a thumb wide on an iPhone, with "TAP ONE TO SWAP" and a swatch of the hero you tapped; your own has a mark under it, and a friend's is dimmed and crossed out so it plainly can't be taken. A tap counts if it lands within half a tile of a hero, and the row closes by itself after six seconds. Tapping a hero who is already in your party does nothing.
- **To change it:** `pick` (`reach`, `seconds`) in `content/cantina/cantina.json`; the row's look and words in `src/client/draw/cantina.ts`.
- **Where:** `docs/mechanisms/cantina.md`, "The party swap".

### 2026-11-23 · The start screen as built: what it shows, and where the way back sits in play
- **Decided by:** Step 17 builder `session_017WiGzGw7XaQ6tZNddFaa8s`, for orchestrator `session_017WiGzHhke4tkAThPgw6EXs`
- **Instead of asking:** "What does the start screen look like, and where is the button that leads back to it?"
- **Why this way:** the title, then New game, Join a friend (a code field near the top, where the phone's keyboard does not cover it) and Everyone's kingdom in one column, and up to three games this phone played under Continue beside it (or below, upright), all in the game's own pixel letters on big night-blue buttons. A tab reloaded while playing (or by a deploy) goes straight back into its game with no tap. In play, a faint three-bar button in the top-left corner (the sound button has the top-right) opens the game's code, Share, Back to the start screen, and Close.
- **To change it:** the words, order and look are all in `src/client/start.ts` (its `CSS`, `showStart`, `setUpMenu`); how many games Continue shows is `GAMES_SHOWN` there.
- **Where:** `docs/mechanisms/saves.md`, "The start screen".

### 2026-11-23 · Doorways by Use: the phone's Use button takes you through a doorway
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, on the owner's words (first-hand, ~17:00 UTC, told that a doorway is used by pushing the stick up): "There is no stick to push up..."
- **Instead of asking:** "Which control should take a phone player through a doorway?"
- **Why this way:** the stick's "up" is a hidden gesture (slide the thumb up off the pad), so on a phone doorways looked broken. Use is the one context-sensitive button the phone already has (D-093: "a few context-sensitive controls"), and no counter or bell stands in a doorway, so the press is never ambiguous. While you stand in a doorway the button says "Go in" and an arrow bobs over the doorway. The stick gesture and the keyboard's Up still work.
- **To change it:** `src/sim/systems/room-doors.ts` (what counts as asking), the Use button's door state in `src/client/touch.ts`/`shell.ts`, the arrow in `src/client/draw/door-hint.ts`. A separate "Go in" button would be a new action file in `content/actions/`.
- **Where:** `docs/mechanisms/rooms-and-doors.md`, "The two kinds of door".

### 2026-11-23 · The quarry's bad guys: three kinds, where they stand, and the toll
- **Decided by:** Step 16 slice 2 builder (`handoff-prompts/step-16-b-quarry-enemies.md`), for the Step 16 lead `session_017WiGzHt9iJy3caBLkT1Ef4`
- **Instead of asking:** how heavy and how tough each kind is, where they stand, and how paying a toll can work when the bad guys fight on sight.
- **Why this way:** three kinds that feel different under the same punch: a light fighter (Step 12's) flies about 18 tiles; a heavy (three times its weight) moves under two tiles and goes down on the eighth punch; a brute is bigger than the grappler, slow, hits very hard, and only the grappler can lift it. A slam wears a body by its speed, and a heavy thrown by the grappler is too slow for a slam to beat a punch, so the heavy is dropped by many punches, not by one throw (the nearest the current wear rules allow). Bad guys stand in every room but the cave, two or three to a place; one brute on the ridge's east stretch. The toll on the road: a toll keeper who cannot swing (otherwise a hostile keeper punches whoever comes to pay) keeps a counter, and a fighter watches; paying once troubles them both, three times enrages them. Only buying from the toll keeper troubles a bad guy: one who sees a hero buy at a shop is untouched.
- **To change it:** weights and toughness are in `content/tuning.json` (`heavy-fighter`, `brute`); people in `content/placements/quarry-*.json`; the toll's rule in `content/rules/quarry.json`.
- **Where:** `docs/plan/step-16.md`, handoff notes.

### 2026-11-23 · The depot's guards: who watches what, and the quiet way over the roof
- **Decided by:** Step 16 slice 3 builder (`handoff-prompts/step-16-c-quarry-depot.md`), for the Step 16 lead `session_017WiGzHt9iJy3caBLkT1Ef4`
- **Instead of asking:** who in the depot may sound the horn, where each guard stands and walks, where the hoard sits, and how big the waves get.
- **Why this way:** nobody in the game jumps, and the yard is cut in three by the stack (columns 14-17) and the step (24-25), so only someone on the same stretch as the horn can reach it. The horn stands with the lookout by the way in from the tower (column 6, post at 9), and **only the lookout calls**, as at Step 12's camp: being seen by the lookout brings waves, being seen by anyone else brings a fight. Patrol 1 walks the lookout's stretch (columns 4-9) and rests facing back into the yard; the middle stretch by the yard stack is hidden from everyone; a heavy guard stands at the strongroom's front facing the yard and now and then walks in to look over the hoard (column 45, east of the shaft); patrol 2 walks the far yard behind the strongroom (54-61), watching its back and the dip to the crawl. Waves of 2, 3, then 3 fighters and a heavy, the last row again for ever, in at the far east end; the camp's horn numbers. The quiet way is the flyer's over the roof, and it needs timing at four places (the door, the stack, the climb at the front, the drop through the hole): about a third of a second early at the door and the lookout sees you.
- **To change it:** people, their walks and the hoard in `content/placements/quarry-depot.json`; who calls, the waves and the horn's numbers in `content/outposts/quarry-depot.json`. Making a patrol a caller is one id in `callers`, but it only works if the horn is on its stretch. Getting caught and running: the way out from inside the depot is the tower door, because the strongroom's shaft only goes up (the brief's way out by the cellar and the pit is not there); building a way down is a room edit.
- **Where:** `docs/plan/step-16.md`, handoff notes; `docs/for-the-lead.md`.

### 2026-11-23 · Chased into the cantina: a red no-entry sign over the door
- **Decided by:** Step 11 slice B builder `session_017WiGzHXvo5fjfVSeDUTX44`, for the Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd`
- **Instead of asking:** "How does a player know the cantina door won't open because the guard is after them?"
- **Why this way:** a small red no-entry sign hops up over the doorway for a second, on that player's screen only, with no words (the owner: very limited dialogue; nothing over a hit). The way out of the cantina is never locked.
- **To change it:** the look and its second in `src/client/draw/cantina.ts` (`drawDoorRefused`).
- **Where:** `docs/mechanisms/cantina.md`, "The chase lock".

### 2026-11-23 · Step 18: who fights, and how a beaten hero carries on
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, from the owner's words ("Enemies or provoked good guys need to be able to fight too", ~16:05 UTC) and the library's decisions (D-046, D-049, D-060, D-075, D-019, D-020), designed and checked by a workflow
- **Instead of asking:** "Who hits heroes, when, and what happens to a beaten hero?"
- **Why this way:** the fight code already existed; people swung once per approach because they held the button, and only some bodies listed attack. So slice A pulses the press, gives the guard, shopkeeper and villain the attack verb (the villain only once a hero strikes him), and keeps a beaten hero's 3 s knockdown with no respawn or reload (D-019). The way out is that people never jump and walk slower than every hero runs. Grabbing or seizing heroes is left out: the library never gives NPCs those verbs.
- **To change it:** `docs/plan/step-18.md`, "`DRAFT:` choices"; data in `content/characters/*.json`, `content/tuning.json`, `content/npcs/villain.json`.
- **Where:** `docs/plan/step-18.md`; `docs/mechanisms/npc-response.md`, "Who fights".

### 2026-11-23 · The three heroes are the owner's canon three, at three different heights
- **Decided by:** Step 8 round 3 heroes builder, for the orchestrator
- **Instead of asking:** "The canon sheet draws all three heroes the same size; should the game?"
- **Why this way:** doc 36 ("We already have the playable characters. Remember these.") fixes who they are; the game's bodies are the simulation's truth, and the infiltrator is tiny on purpose (this log, "fit through a tiny gap"). So each is the canon figure at its own height: the grappler 31 px over his 30 px body, the flyer 26 px with wings, the infiltrator 23 px, the most the small-body overhang allows. Same faces, costumes and proportions, only the size differs. The alternative, one equal height as the canon draws them, would need the infiltrator's body or the overhang rule changed.
- **To change it:** `HEIGHT` in `tools/art/heroes/canon.py`, then `python3 -I tools/art/heroes/make.py`; equal heights also need `content/characters/infiltrator.json`'s box or the overhang rule in `docs/mechanisms/art-pipeline.md` changed.
- **Where:** `tools/art/heroes/README.md`, "Round 3".

### 2026-11-23 · The grappler's cap follows the canon picture: a blue dome under a gold goggle band
- **Decided by:** Step 8 round 3 heroes builder, for the orchestrator
- **Instead of asking:** "Doc 36 calls the cap brown/gold, its picture shows a blue dome; which?"
- **Why this way:** doc 36: "The illustrated image itself is controlling over verbal approximations." The blue is the palette's bright blue, not the castle's navy, and the gold band, goggles, red scarf and face read against the castle and undercroft walls (screenshots in `docs/plan/step-8-shots/round3/heroes/`).
- **To change it:** map the dome to the gold ramp in `tools/art/heroes/p03.py` (`PAL`).
- **Where:** `tools/art/heroes/README.md`, "Flags for the lead".

### 2026-11-23 · The cantina, the Bandit Camp and the quarry are furnished; the quarry's one-tile hiding spots are rubble
- **Decided by:** Step 8 look round 3, props builder `session_017WiGzJxBqVvizcghgHk5NG`, for orchestrator
- **Instead of asking:** "What goes in the cantina, the camp and the quarry, and what does a one-tile hiding spot look like?"
- **Why this way:** the review saw a cantina with one shelf and a camp drawn as the courtyard again. The cantina gets a bar with bottle shelves and a mirror by the doorway, round tables and stools and kegs between the fighting pads (never on them or the bell), red swags and bunting over the stage, and a chandelier and two lanterns with warm light; the camp gets a palisade behind it, two striped tents, a flag, a weapons rack and a campfire with a glow, all clear of the lookout, the horn post and the fighters; the quarry gets scaffolds, rock piles and, in the cave and the pit, hanging lanterns. Most pieces are cut from the art desk's own tavern and furniture plates (the asset desk: "do not re-generate generic inferior art if a strong source here already matches"). Every quarry hiding spot is one tile, in a yard, a cave, a pit and on a roof, so the one picture that fits all of them is a heap of boulders over a dark crevice, not an ore cart.
- **To change it:** where things go is one function per room in `tools/art/props/place.py`; the pictures are in `tools/art/props/round3.py`; then `python3 -I tools/art/props/make.py`.
- **Where:** `tools/art/props/README.md`, "Round 3".

### 2026-11-23 · The courtyard's tree, bush and flowers moved off the new doorways
- **Decided by:** Step 8 look round 3, props builder `session_017WiGzJxBqVvizcghgHk5NG`
- **Instead of asking:** "The quarry and camp doorways and the gate's plates were added where round 2's tree, bush and flowers stood; which goes?"
- **Why this way:** decoration never covers a door or a working part (the art contract). The tree now stands east of the gate, the broken column joins the far-off ruins, the bush is gone and the small things sit in the gaps.
- **To change it:** `courtyard()` in `tools/art/props/place.py`.
- **Where:** `tools/art/props/README.md`, "Round 3".

### 2026-11-23 · The cantina's regulars and the Bandit Camp's people are the art desk's own chibis
- **Decided by:** Step 8 look round 3, lane "cast" (builder), for the orchestrator
- **Instead of asking:** "Which of the source sheets' people should the brawler, the skirmisher, the camp's fighter and lookout, and the horn post be?"
- **Why this way:** the owner: "There are assets provided" and "don't stop working on it until it looks similar to that"; the asset desk: "Do not re-generate generic inferior art if a strong source here already matches the need." The brawler is P04's bald strongman, the skirmisher P04's feathered-hat patron (the brief's two picks). The camp's fighter and lookout are P07's red-hooded bandit with a dagger and purple-hooded signaller with a horn, not P03's hooded grunt the brief named first: P07's rows carry every pose the game shows (walk, strike, hurt, dizzy, knocked out), where the P03 grunt has no knocked-out pose, and a red fighter beside a purple lookout tells the two jobs apart at a glance. The post is P03's horn post with its horns taken off, so the props lane's horn hangs on it.
- **To change it:** the plate rectangles in `brawler()`, `skirmisher()`, `outpost_fighter()`, `outpost_lookout()`, `signal_post()` in `tools/art/cast/cut3.py` (the P03 grunt is row 2 of the `villains` plate, about y 377-502), then `python3 -I tools/art/cast/make.py`. `DRAFT:`
- **Where:** `tools/art/cast/cut3.py`; `tools/art/cast/README.md`, "Round 3".

### 2026-11-23 · An unsettled person sweats and an enraged one goes red in the face, in every pose
- **Decided by:** Step 8 look round 3, lane "cast" (builder), for the orchestrator
- **Instead of asking:** "The source sheets draw a worried and an angry face for standing still only; what do a worried or angry person's other poses look like?"
- **Why this way:** the bar's "NPC Reactions" panel: a red face and an anger mark, the costume unchanged. Where a sheet has the mood's own pose (the brawler's yell, the patron's side-eye) it is used; every other pose gets a sweat drop beside the head (mood 2) or the head's skin turned to the red ramp (mood 3). Nothing tints the costume, so the round-2 rage wash does not come back.
- **To change it:** `sweat()` and `flush()` in `tools/art/cast/cut3.py`, or a person's own `M2`/`M3` poses there. `DRAFT:`
- **Where:** `tools/art/cast/cut3.py`.

### 2026-11-23 · A push that is "not live yet" is not reverted while the game is healthy
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`
- **Instead of asking:** "Should a builder revert when its commit is not live after a few minutes?"
- **Why this way:** three good pushes were reverted in an hour (582db12, 76791bf, 8c2b471) because `check:deployed` timed out, and each went live unchanged when pushed again. The cause was a burst of code pushes replacing each other's builds on Railway, not a broken build: the live address stayed healthy on an older commit, and ab25e7a was live 51 s after its push once the burst ended. A revert adds a push to the queue and deletes work. The rule still reverts at once when the game is down or broken.
- **To change it:** `docs/verifying-and-finishing.md`, "The pre-push gate".
- **Where:** that section.

### 2026-11-23 · Guards and the camp fight on sight, the street villain excepted
- **Decided by:** Step 12 slice B builder `session_017WiGzFLgKMowRCLNbRRYiE`, for the Step 12 lead `session_017WiGzJTXQVCWQYDDmC2UiY` (keyed by role and side at the lead's word)
- **Instead of asking:** "Who fights whom when the town's people and the camp's meet, and does it upset anyone?"
- **Why this way:** the owner wants the camp and the town to be one world (D-069) and enemies who fight. Guards against every bad-side person, so Step 16's new enemy kinds join in with no edit; not the street villain, whose robbing is the street's business as usual (D-049). Nobody's mood changes and nobody calls: a brawl between sides is their business as usual, and only a finished call raises the alert. A hero in sight comes first. In a meeting the one who closes first swings first.
- **To change it:** `content/hostility.json` (a pair per line); the order of priorities is in `src/sim/systems/clash-fight.ts`.
- **Where:** `docs/mechanisms/outposts.md`, "Chase and clash".

### 2026-11-23 · A guard who blinks still has you: one second's grace on the cantina lock
- **Decided by:** Step 11 lead `session_017WiGzFy3MD6ecvM7QMvQGd` (built by the slice B builder `session_017WiGzHXvo5fjfVSeDUTX44`)
- **Instead of asking:** "If the guard loses sight of me for a moment right at the cantina door, can I slip in?"
- **Why this way:** the owner (doc 31): the cantina is "NOT a shortcut for breaking line of sight". You stay barred for one second after a chasing guard last saw you; once the chase is really over, the door opens.
- **To change it:** `chaseHold` (seconds) in `content/cantina/cantina.json`.
- **Where:** `docs/mechanisms/cantina.md`, "The chase lock".

### 2026-11-23 · The villain keeps his top hat on the source sheet's hooded villain
- **Decided by:** Step 8 look round 3, lane "cast" (builder), for the orchestrator
- **Instead of asking:** "The art desk's villain wears a horned hood; ours wore a tall top hat. Which?"
- **Why this way:** the brief keeps him at least as tall as round 2 made him (about 44 px) with the top-hat silhouette that made him the tallest person in a room, and lends him P03's cape, colours and face. So he is P03's purple hooded villain, cut from the plate, with the gold horns taken off and the top hat on. Doc 36 does not lock the villain.
- **To change it:** for the plain horned hood, return `p` instead of `tophat(dehorn(p))` in `vil()` inside `villain()` in `tools/art/cast/cut3.py` (and the cell can go back to 56x48), then `python3 -I tools/art/cast/make.py`. `DRAFT:`
- **Where:** `tools/art/cast/cut3.py`, `villain()`.

### 2026-11-23 · The king is knocked out face down, from the other king sheet
- **Decided by:** Step 8 look round 3, lane "cast" (builder), for the orchestrator
- **Instead of asking:** "P03's king has no knocked-out pose; what does he look like flattened?"
- **Why this way:** the brief rules out a turned standing figure ("never a rotation"). P07's king row has one, lying on his front in his robe with his crown still on; face down, the missing beard does not show.
- **To change it:** the `cut('p07npc', ...)` line in `king()` in `tools/art/cast/cut3.py`. `DRAFT:`
- **Where:** `tools/art/cast/cut3.py`, `king()`.

### 2026-11-23 · Step 14 slice A: level entrances and their discovered indicators
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, on the owner's words (first-hand, ~18:10 UTC, playing): "Not finding clear 'level entries' with discovered indicators etc"
- **Instead of asking:** "What is a level, what does its entrance look like, and what does 'discovered' show?"
- **Why this way:** the owner's P05 sheets already draw it: ornate doors, a portal and a mine entrance for ways in, and completion pies that fill to gold. D-078 and D-079 ask for clear measures of completion that never say which or where, so the entrance shows an empty ring until someone has been in, then the level's name and a pie of how much has been explored (hidden places counted from the start). Four levels tonight as data: castle town, the Bandit Camp, the Iron Quarry, the cantina.
- **To change it:** `content/levels/*.json` (which rooms make a level, its name, its entrance art); the pie's steps and the banner in `src/client/draw/levels.ts`.
- **Where:** `docs/plan/step-14.md`, "Slice A"; `docs/mechanisms/levels.md` once built.

### 2026-11-23 · Your own hits are shown at once on your own screen
- **Decided by:** orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, on the owner's words (first-hand, ~18:10 UTC, playing): "Big delay between swing and actual impact."
- **Instead of asking:** "Should the wind-up be shorter, or the network faster?"
- **Why this way:** measured on live, the star came about 555 ms after the press, and only 100 ms of that is the grappler's wind-up; the rest is the trip to the server and back (reports 30/s, snapshots 20/s, 100 ms of smoothing), because a phone simulates only its own hero. So the page predicts its own hit: star, beat and the struck body's first movement on the tick the swing lands, then hands back to the server. The wind-up numbers stay the owner's to tune.
- **To change it:** `handoff-prompts/step-5-hit-lands-at-once.md` while it is being built; then `docs/mechanisms/network.md`, "Predicted hits".
- **Where:** `docs/plan/step-5.md` handoff notes.


### 2026-11-23 · Step 18: a guard or shopkeeper in a fight swings again and again, about once a second
- **Decided by:** Step 18 slice A builder `session_017WiGzHwmFZe9AdG3KMHsa4`, for the orchestrator `session_017WiGzHhke4tkAThPgw6EXs`
- **Instead of asking:** "Should an angry person keep swinging while you stand in reach, or hit once and stand there?"
- **Why this way:** the owner: "Enemies or provoked good guys need to be able to fight too." People held the attack button, and the game swings only on a fresh press, so they hit once per approach. Now they press it every other moment, as the camp's fighters already do.
- **To change it:** one expression each in `charge()` (`src/sim/npc/behaviours.ts`) and the chase in `src/sim/systems/alert-respond.ts`.
- **Where:** `docs/mechanisms/npc-response.md`, "Who fights".

### 2026-11-23 · Step 18: how hard a guard and a shopkeeper hit, and how long you see it coming
- **Decided by:** Step 18 slice A builder `session_017WiGzHwmFZe9AdG3KMHsa4`
- **Instead of asking:** "How strong is a guard's blow, how weak a shopkeeper's, and how long is the warning before it lands?"
- **Why this way:** a guard hits like a camp fighter (library doc 24: guards keep stronger toolsets); a shopkeeper is an ordinary fighter, a nuisance alone (D-046, doc 23:69: "mechanically ordinary and often hopeless"). Both wind up longer than a camp fighter (0.4 s and 0.5 s against 0.25 s), because on a phone a dodge reaches the server only after about half a second of delays (snapshots, smoothing, the network, your thumb).
- **To change it:** seven numbers each in `content/tuning.json`, `characters.guard` and `characters.shopkeeper`; the wind-up is `attackWindup`.
- **Where:** `docs/plan/step-18.md`, "`DRAFT:` choices".

### 2026-11-23 · Step 18: the toll keeper keeps its own walking numbers
- **Decided by:** Step 18 slice A builder `session_017WiGzHwmFZe9AdG3KMHsa4`
- **Instead of asking:** nothing of the owner's: the toll keeper shared the shopkeeper's numbers, and her new attack numbers would have been numbers it has no use for, which the checks refuse.
- **Why this way:** the toll keeper must not swing (Step 16: a fighter as keeper punched the hero before they could pay), so it walks on its own copy of the same walking numbers. Nothing changes in play.
- **To change it:** `characters.toll-keeper` in `content/tuning.json`, and `"tuning"` in `content/characters/toll-keeper.json`.
- **Where:** `content/tuning.json`.

### 2026-11-23 · Step 18: six scenarios re-timed because people now really hit
- **Decided by:** Step 18 slice A builder `session_017WiGzHwmFZe9AdG3KMHsa4` (the re-times were assigned to Step 18 by the orchestrator, `handoff-prompts/step-12-b-chase-and-clash.md:36-42`)
- **Instead of asking:** nothing: each keeps its claim; only ticks, positions and the hero's moves changed, and "stands over them" became "hits them".
- **Why this way, scenario by scenario** (the blow that moved each, from `node scripts/trace.ts`):
  - `step4-standing-in-view-is-seen`: `{"type":"hit","tick":734,"by":"ts-guard","target":"p:a"}` knocks the hero back and the guard follows, so the guard's place is read at tick 730, when he has just reached them (x 335–360), not 1000.
  - `step4-street-call`: `{"type":"hit","tick":2750,"by":"street-guard","target":"p:a"}`; the guard's place is read at 2745 (x 200–250), not 3600.
  - `step4-hero-persists-rage`: `{"type":"hit","tick":142,"by":"shopkeeper-1","target":"p:a"}` slows the hero's run to the wall: they run 10 ticks longer (to 270), and rage cools 15 ticks later (1165, not 1150), counted from when they were last seen.
  - `step4-guard-follows-seen`: `{"type":"hit","tick":2750,"by":"street-guard","target":"p:a"}` knocks the hero 28 px nearer the cellar doorway: they run 46 ticks, not 64; in the undercroft they run on as the guard comes up (2932, not 3100), before his next swing, so every later tick moves 168 earlier. The guard is now about 35 px behind at the cellar doorway, not 60.
  - `step12-guard-follows-into-camp`: `{"type":"hit","tick":2750,"by":"street-guard","target":"p:a"}` and 14 more with 3 flattenings: walking at 0.3 of a run (29 px/s) the hero stayed in the guard's reach. They now walk at 0.42 (about the guard's 40 px/s), which keeps them in his sight and out of reach; the door ticks move to 3543 and 4080. Sent to the Step 12 lead before the push.
  - `step11-chase-blink` (landed while this was built): `{"type":"hit","tick":2608,"by":"street-guard","target":"p:a"}` and three more knocked the hero off the cantina doorway before the step past the guard at 2950. The step past now starts as the guard arrives (2590), the refused push is at 2602, before his first blow. Sent to the Step 11 lead before the push.
- **To change it:** the scenario files.
- **Where:** `scenarios/step4-*.json`, `scenarios/step12-guard-follows-into-camp.json`, `scenarios/step11-chase-blink.json`.



### 2026-11-23 · The quarry looks like a working quarry: orange cobbled earth under grass, scaffolds, a dark cave, cut stone
- **Decided by:** Step 8 look round 3, ground lane builder (`handoff-prompts/look3-ground.md`), session_017WiGzHwFkUGGSmDqqnoSDY
- **Instead of asking:** "What should the quarry look like, and which approved art does it come from?"
- **Why this way:** the owner's bar (Kirby and the Amazing Mirror; "use the approved assets in the drive"): the quarry's ground is re-authored from the approved P03 grassy-ruins plate (its cobbled earth, grass cap, scaffold bridge, rubble and bushes, cut stone), cut to true 16 px tiles and mapped to the master palette. The cave and the pit use the same earth cooled and darkened under a pale stone floor; the tower and the depot's strongroom are cut stone; the depot's cellar is the cave's look. Behind them: a dithered tall sky, pale cut cliffs, scaffolds and a crane; in the cave a dark rock wall with timber props; in the tower a warm stone wall with slit windows. The plates show no cliffs, cranes or cave walls, so those are drawn stand-ins (`DRAFT:`) until an approved asset exists.
- **To change it:** `tools/art/tiles/themes.py` (`Quarry`, `cave_region`, `cutstone_region`), `backdrops.py`, `make.py` (`ROOM_THEME`, `ROOM_BASE`, `ROOM_REGIONS`, `QUARRY_FAR`); re-run `make.py`.
- **Where:** `tools/art/tiles/README.md`, round 3.

### 2026-11-23 · The cantina is a tavern: long warm floor boards, plank walls with a wainscot, rafters
- **Decided by:** Step 8 look round 3, ground lane builder, session_017WiGzHwFkUGGSmDqqnoSDY
- **Instead of asking:** "The cantina borrowed the town's half-timber plaster (it read as stacked crates); what should it be?"
- **Why this way:** the brief, from the approved P04 cantina tavern plate: the floor is the plate's counter-top boards with an ink cap over its lilac stone one step darker; the back wall is dark planks over a wood wainscot to waist height, with posts; the top row is the plate's beams; upright, the roof's dark underside fills the space above. The door stays where it is.
- **To change it:** `'cantina'` in `ROOM_THEME` (`tools/art/tiles/make.py`; `'town'` brings back the borrowed look), `Cantina` in `themes.py`, `make_cantina_wall`/`make_cantina_roof` in `backdrops.py`.
- **Where:** `tools/art/tiles/README.md`, round 3.

### 2026-11-23 · Held upright, a short room hangs from something: tree crowns, upper storeys, a roof, vaults
- **Decided by:** Step 8 look round 3, ground lane builder, session_017WiGzHwFkUGGSmDqqnoSDY
- **Instead of asking:** "Upright, the courtyard and the street float in flat sky (41% and 22% of the picture one colour); what goes above them?"
- **Why this way:** the owner, ~11:30: "It should play well in portrait too". In data only (the code alternative is Step 17's file): above the courtyard's leaf canopy, the crowns it hangs from; above the street's eave, the houses' upper storeys and roofs; above the cantina's rafters, the roof's underside; above the gallery, stone vaults. The sky is one dithered picture with low clouds, so no flat bands show. Measured upright: courtyard 41% → 1%, street 22% → 2% single-colour rows.
- **To change it:** the layers in `content/backdrops/<room>.json` (written by `make.py`); drop a layer to go back.
- **Where:** `tools/art/tiles/README.md`, round 3.

### 2026-11-23 · Step 14 slice A: four levels, each with a way in you can see, that shows whether you have been and how much of it
- **Decided by:** Step 14 slice A builder, `session_017WiGzFeeJgj8z2SUAFyu5J`
- **Instead of asking:** "Which places are levels, what counts toward 'how much', and how is it shown?"
- **Why this way:** the owner, playing: "Not finding clear 'level entries' with discovered indicators etc"; D-078 (clear measures of completion), D-079 (explored share, never which or where, hidden rooms count). Four levels tonight: Castle Town (where you start), the Bandit Camp, the Iron Quarry (doc 28's name) and the Cantina. A level is discovered when a hero someone plays has been inside. "How much" is the share of its rooms and named areas a hero has been in, hidden ones in the total from the start, shown as a pie in quarters rounded down, full only when everything is seen; so one room of the quarry's thirteen places still shows an empty pie, and the name on the sign is what says you have been. It belongs to the world (a friend's discovery is yours) and is kept with a kept game. Entrances: the timbered mine for the quarry, the ornate gem door for the camp, the glowing arch for the cantina (P05).
- **To change it:** a level is one file in `content/levels/`; its entrance art is its `look`; what counts is `levelPlaces` and the pie's rounding is `levelProgress` (`src/sim/levels.ts`).
- **Where:** `docs/mechanisms/levels.md`; `docs/plan/step-14.md`, Slice A.

### 2026-11-23 · The depot has a second quiet way, on foot: a high ledge past the lookout and a shelf over the strongroom guard
- **Decided by:** Step 16 slice 3 push 3 builder, `session_017WiGzH5v7n1DfXiS1iFbh6` (brief `step-16-d-depot-routes.md`)
- **Instead of asking:** the brief asked only for a ledge over the yard; measured, the ledge gets a hero past the lookout and patrol 1 but the heavy guard at the strongroom's front still sees anyone coming from the yard (it faces you whichever way it walks). Add a hiding spot inside the strongroom, or retime the guard?
- **Why this way:** adding beats changing what someone chose (the guard's walk is slice 3's and the roof route depends on it). Sight is 40 px up and down, so a one-way shelf at row 11 over the guard's inner stand (49 px over its middle) lets a hero wait while the guard walks back under it, then slip behind it. The ledge is at row 8, not lower, because the roof flyer's arcs land on anything lower; the steps start at column 3 because a grappler on a step at column 2 is pinned against the door's wall and cannot get down. `step16-zero-alarm-ledge`; control: the ledge's tiles emptied and the same inputs are seen.
- **To change it:** tiles in `content/rooms/quarry-depot.json` (rows 8, 10, 11, 12); the scenario's inputs are timed to them. The infiltrator on the shelf is exactly 40 px over the guard's middle, which counts as seen: raise the shelf or leave it as the grappler's.
- **Where:** `docs/plan/step-16.md`, slice 3 push 3; the room's `//`.

- **Where:** `scenarios/step4-*.json`, `scenarios/step12-guard-follows-into-camp.json`.

### 2026-11-23 · Step 18: the villain hits you back, but only once you have hit, grabbed or thrown him
- **Decided by:** Step 18 slice A builder `session_017WiGzHwmFZe9AdG3KMHsa4`, on the step's design (`docs/plan/step-18.md`, "`DRAFT:` choices")
- **Instead of asking:** "Should the villain start a fight as soon as he sees a hero?"
- **Why this way:** the library: fighting villains in the expected hero-versus-villain way is business as usual for them (D-060), and the robbery and the polite purchase in the shop (gate C) need a villain who does not attack every hero he sees. So he swings back at a hero who struck him, for 15 seconds after the latest blow, grab or throw, with a guard's blow. A guard thrown into him does not count as that hero striking him. Whether he should fight on sight is left for the owner to say after playing.
- **To change it:** one word, `"fights"` in `content/npcs/villain.json` (`"on-sight"`; that also breaks the shop's rob and buy-politely checks, which would need re-timing); the 15 s is `npcStruckMemory` in `content/tuning.json`.
- **Where:** `docs/mechanisms/npc-response.md`, "Who fights".

### 2026-11-23 · A caught hero can run for the pit with the hoard, down a narrow hole in the depot's yard
- **Decided by:** the Step 16 lead (18:48 UTC), built by the push 3 builder, `session_017WiGzH5v7n1DfXiS1iFbh6`
- **Instead of asking:** every two-tile spot in the yard floor is walked on by the main way, so where can the drop to the cellar go without moving the stack or the step?
- **Why this way:** "getting caught opens play": an escape route from inside matters more than every hero fitting. A one-tile hole at column 23, just west of the step, so walking east into the step drops you in; the flyer and the infiltrator fit, the grappler leaves by the tower door. It lands west of the cracked wall, so the wall stays the only way into the strongroom from below.
- **To change it:** two tiles in `content/rooms/quarry-depot.json` (column 23, rows 14-15); a two-wide hole needs the stack or the step moved and the main way's scenarios re-timed.
- **Where:** `docs/plan/step-16.md`, slice 3 push 3; `step16-caught-escape-cave`.

### 2026-11-23 · Bad guys chasing you across the depot's yard can fall down the hole to the cellar, and stay there
- **Decided by:** Step 16 last-slice builder, `session_017WiGzFw42cUL6BQ27o3iz7`
- **Instead of asking:** should a fighter chasing a hero west of the step be kept out of the one-tile hole at column 23?
- **Why this way:** "a botched stealth attempt that becomes an even better fight or escape": a guard tumbling into the cellar after you is a good accident, and it never traps a hero (the way-out check in `npm run check` covers the cellar and passes). Closing it needs the hole moved or narrowed, which the narrow heroes' escape (`step16-caught-escape-cave`) depends on. Chosen, not deleted: nothing was changed.
- **To change it:** untried here: a chase follows the hero, not a routine, so a placement change may not stop it; a sure fix is a fighter that will not step off a ledge (Step 12's code).
- **Where:** `docs/plan/step-16.md`, last slice handoff; `content/rooms/quarry-depot.json` column 23.


### 2026-11-23 · DRAFT: the quarry's level keeps the id `iron-quarry`, though "Iron Quarry" is only a proposed name
- **Decided by:** orchestrator, `session_017WiGzJzo6aZqH4kYxxJsiV` (flagged by Step 16's lead)
- **Instead of asking:** the level id `iron-quarry` (`content/levels/iron-quarry.json`, 2b316ce) carries doc 28's proposed name, against "keep proposed names out of ids"; rename it?
- **Why this way:** it is deployed and kept games already list discovered levels by id, and "don't rename or remove ids once deployed" protects those saves. The id is never shown: the shown name is the level file's own data and stays free to change. No new id takes a proposed name.
- **To change it:** add a new level id and map the old one to it on load (retire, never delete); the shown name is one string in the level file.
- **Where:** `content/levels/iron-quarry.json`; `docs/plan/step-14.md`.

### 2026-11-23 · Step 14 slice B: pieces to find, seen glinting before you can reach them; the first two in the street
- **Decided by:** glints builder (Step 14 slice B), `session_017WiGzFeeJgj8z2SUAFyu5J`
- **Instead of asking:** "Where do the first pieces go, how does finding one show, and what is the special good?"
- **Why this way:** the owner, after playing: "no hidden places to explore"; D-078 (hidden pieces that build something unnamed), D-079 (more to find, never which or where), D-082 (kept). The first piece lies just over the shop's awning on the first street screen, so every player meets a glint and finds one with a hop within seconds of starting; the second is a visibly special good at the end of the shop's shelf, and taking it, seen or not, is the piece. A piece found pops, and a row of the town's pieces shows at the top for two seconds, grey with the found ones gold; no numbers. Pieces are the world's: a friend's find is yours. Two light crates now lie on the street east of the doorway, a weight to carry for the courtyard's plates.
- **To change it:** a piece's place, look or source is one entry in `content/completion/<level>.json`; the special good is `street-goods-rare` in `content/placements/castle-street.json`; the row's time and look in `src/client/draw/completion.ts`.
- **Where:** `docs/mechanisms/levels.md`, "Pieces"; `handoff-prompts/loop-glints.md`.

### 2026-11-23 · A glint over the shop's awning marks a piece, not the way over the roofs
- **Decided by:** glints builder (Step 14 slice B), `session_017WiGzFeeJgj8z2SUAFyu5J`
- **Instead of asking:** "The street's `INTENT:` says nothing may point at the roofs' route; does a piece on the awning do that?"
- **Why this way:** the awning is a low ledge right above the shop, not part of the route over the roofs (that starts at building 2's doorway and balcony, far east), and the piece sits on it, not on a roof or ledge of the route; the brief named this spot. The glint says "a piece is here", and a hero who takes it stands on an awning that goes nowhere. The doubt is filed for the owner (`docs/for-the-orchestrator.md`).
- **To change it:** move `town-1` in `content/completion/castle-town.json` (for example to the shop's floor beside the curtain).
- **Where:** `content/completion/castle-town.json`.

### 2026-11-23 · Step 19: one place decides what the Use button does where you stand, and the doorway still wins
- **Decided by:** Step 19 builder (brief `loop-heist.md`), `session_017WiGzJqpMTHyoAaus6JsHG`
- **Instead of asking:** "When a doorway, a shop's goods and the cantina's bell are all near, which one does Use do?"
- **Why this way:** D-093 (a few context-sensitive touch controls): the button must name what it will do, so the game needs one answer to what it does. The order is the one that was already played: a doorway first (decisions-log "Doorways by Use"), then the nearest thing, then the cantina's bell. Nothing a player does changes; nothing near the bell can be taken today.
- **To change it:** the `order` number in one file per kind of thing Use does (`src/sim/use/`).
- **Where:** `docs/mechanisms/heists.md`, "The Use arbiter"; `docs/plan/step-19.md`.

### 2026-11-23 · Step 9: two powers to start, a strength boost anyone can use and wings, each one file you can change
- **Decided by:** Step 9 builder, `session_017WiGzF16bBpnLmeWErGynR` (brief `loop-powers.md`)
- **Instead of asking:** "Which powers come first, and what does each one do?" (O-005 is open)
- **Why this way:** the owner, playing: "no power/item stealing". The common power has to be felt by whoever takes it, and player one is the grappler, who already lifts and throws nearly everything. So the boost raises every hero to above the grappler: a hit sends a body across the screen and through a cracked wall, and Grab lifts the throne. The rare one is wings (lends flapping), because the quarry pit has a ledge nobody can reach. Library doc 24 offers "limited grab/speed variants" as examples. A power is laid over the hero's own moves and never replaces them (D-082).
- **To change it:** each power is a file in `content/powers/` (its name, icon, numbers, lent verbs). Add a file to add a power.
- **Where:** `docs/mechanisms/powers.md`.

### 2026-11-23 · Step 13: a new game starts with the three heroes and the brawler; the skirmisher has to be found
- **Decided by:** rescue builder (Step 13, brief `loop-rescue.md`), `session_017WiGzHfRkFts4Z3rb8RMqC`
- **Instead of asking:** "Who is unlocked when a game starts, and do old games and test worlds lose anyone?"
- **Why this way:** the owner, after playing: "There are no ... characters to unlock"; doc 05 "Players begin with a subset"; doc 36 (the canon three are the start); D-085 wants the cantina brawl full, so the brawler starts unlocked and the cantina always has someone to hit and to swap. Who is unlocked now belongs to each game and is kept with it (D-082). A game saved before tonight, and every private test world (`?room=`), keeps all five heroes: nobody loses anyone they had.
- **To change it:** the `start` list in `content/roster.json`; whether test worlds get it is one line in `makeWorld` (`src/server/game.ts`).
- **Where:** `docs/mechanisms/recruits.md`; `docs/plan/step-13.md`.

### 2026-11-23 · At the depot's door you see the lookout and its horn before they see you, and there is a place to hide
- **Decided by:** Step 16 builder `session_017WiGzFw42cUL6BQ27o3iz7`, on the Step 16 lead's brief
- **Instead of asking:** where should the lookout stand so that a first-time player can see the danger and choose a quiet way?
- **Why this way:** the owner: each core loop "must be findable and recognisable without being told where it is", and the zero-alarm infiltration is one of their three standards. At the old place the lookout saw you the instant you came in. Now it stands five tiles further in (column 11) with its horn just behind it: on a phone's screen from the door, out of its sight. Walking straight on along the floor still gets you seen ("getting caught opens play"). It looks east first, so the flyer's way over the roof still works.
- **To change it:** the lookout's `tile`, its `routine` order, the horn's `tile` and patrol 1's walk in `content/placements/quarry-depot.json`; the hide is two `C` tiles in `content/rooms/quarry-depot.json`. Any move re-times the depot's scenarios (`docs/plan/step-16.md`, the handoff note).
- **Where:** `docs/plan/step-16.md`, "The depot made findable"; `step16-door-unseen`.

