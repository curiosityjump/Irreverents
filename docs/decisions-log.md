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
