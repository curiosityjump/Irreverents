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
- **Where:** `docs/plan/step-2.md`.

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
- **Where:** `docs/plan/step-2.md`, "Decided by the lead".

### 2026-11-23 · What only each of the three heroes can do: lift heavy things, fit through a tiny gap, flap up to high ledges
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "What makes the grappler, the tiny infiltrator and the flyer different?" (the library names the types and gives no move list.)
- **Why this way:** your own illustration (doc 05): a team that "would reach high ledges, small crawlspaces, heavy objects", and "strong-grab can slam an enemy or move a heavy object". The flyer gets a few weaker jumps in the air rather than free flight, so ledges still matter.
- **To change it:** numbers and a list of abilities per character in data files.
- **Where:** `docs/plan/step-2.md`, "Decided by the lead".

### 2026-11-23 · Characters and enemies walk through each other; only something flying from a hit or a throw shoves what it meets
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "Do bodies block each other?" (not stated in the library.)
- **Why this way:** friends never get stuck behind each other in a corridor, and every collision you see is one that matters: a thrown crate or enemy sending others flying (D-020).
- **To change it:** real but contained work.
- **Where:** `docs/plan/step-2.md`, "Decided by the lead".

### 2026-11-23 · A fourth friend joining a party of three plays a second copy of a hero rather than being turned away
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "What happens when more people join than there are party members?" (party size is open, O-003.)
- **Why this way:** it is for friends; nobody should open the link and be refused. Your rule that one character is never controlled by two people still holds: each has their own body.
- **To change it:** small (add members to the party list, or show a "party full" screen).
- **Where:** `docs/plan/step-2.md`, "Decided by the lead".

### 2026-11-23 · Enemies and heroes have a hidden toughness, never shown as a number; picking up powers from enemies waits for its own step
- **Decided by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`
- **Instead of asking:** "How does anything get beaten without damage numbers, and are stolen powers in tonight's build?"
- **Why this way:** harder hits and slams wear a body down faster, so impact is what beats things (doc 08: "The target is not damage numbers"). Powers were in scope only once three heroes and grab/throw are solid; those come first tonight.
- **To change it:** toughness is numbers in the tuning file; powers are a new piece of work.
- **Where:** `docs/plan/step-2.md`, "Decided by the lead".

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
