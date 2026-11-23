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
