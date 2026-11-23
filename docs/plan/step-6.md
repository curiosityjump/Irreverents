# Step 6 — The king who never stops talking

**Reference.** Plan step; its status line is in docs/plan.md.

## 2026-11-23 19:40 UTC, the owner's verdict after playing: nothing here is briefed

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

The re-plan from these words is `docs/plan/core-loops.md`. None of the eight
loops the owner names is this step's, so slice B (the court) is **not briefed
and waits** behind the eight first playables. One thing from that plan touches
it: playable 8's stone plate can be pressed by the king thrown down through
the throne room's stained-glass window, which is the kind of thing the court
should one day see.

## Why

**Owner (Drive, doc 01), via `docs/vision.md`** lists it among the
confirmed features: "irreverent anti-story protagonists; royal audience
running gag." **Owner (Drive, doc 03, "strongly endorsed signature
concept"):**
> If the player politely does nothing, the king continues droning on almost indefinitely. He never reaches a normal "now go begin the game" handoff. The game begins when the player chooses to act. … There is no forced quest acceptance, scripted skip prompt or "press X to continue" that resolves the opening as ordinary exposition.
>
> If the player actually allows the speech to continue for approximately THREE HOURS, it finally becomes an unexpected end-credits sequence.

This is the first thing the owner and their brother-in-law will see, and
the fastest way for the game to say what it is (golden scenarios G-01 and
G-02, doc 12).

## Goal

The game opens in the throne room with the king already mid-speech. He
never stops and nothing waits for him: from the first second both players
can run around, poke at things, hit him, or just leave. The court reacts
when they do. And if someone really does stand and listen for about three
hours, the speech turns into the credits.

## How to cut it (a suggestion, not a rule)

**The first half needs only the throne room and Step 2's bodies, and is
the fastest way for the game to say what it is. Land it first, alone:**
both players appear in the throne room with the king already talking; a
slow ribbon of his words that nobody has to read; no prompt and no locked
door; he is a body like any other, so he can be hit, lifted and thrown,
and the speech belongs to his body, so he keeps talking wherever he ends
up; the stained-glass window behind the throne breaks when something
heavy enough goes through it (doc 03: "players wonder if they can suplex
him through it"). None of that waits for Step 4.

**The second half** is the court's reaction (Step 4's moods, a call for
help, guards) once Step 4's rules are on `main`, and the three-hour
ending. If the night runs short, the first half alone is worth shipping.

## What's decided

- **No gate of any kind:** no "press to continue", no locked door, no
  rule against fighting during the speech (doc 03, "Player agency from
  minute one").
- **The reaction yields play, never a game over or a reload** (doc 03's
  acceptance test; D-019).
- **The speech is the one place with a lot of words, and it is still not
  dialogue:** nobody has to read it and it never asks for a reply. It
  shows as a slow ribbon of text or a speech bubble that can be ignored.
  It must not visibly loop (doc 03: "Avoid an obvious short looping audio
  sample"; doc 12, G-02: "No short obvious loops").
- **The speech's words are the owner's taste.** Write a long placeholder
  (solemn, increasingly digressive, in doc 03's spirit), keep it in a
  data file, mark it `DRAFT:`, and list it for the owner. Use by default
  (D-096).
- **The king and his court are ordinary people of Step 4's kind** (roles,
  three modes, a call for help), placed by data in Step 3's throne room.
  No special-case engine code for the king beyond the speech clock.
- **The three-hour ending is real, secret, and for uninterrupted
  listening** (D-033: "Approximately three hours of uninterrupted
  listening triggers a secret, seamless actual end-credits alternate
  ending"; D-032: "the king does not naturally stop talking if players
  wait"). The count runs only while the audience is undisturbed and
  someone is in the throne room listening; disturbing the court (anything
  that changes its mood) or the last listener leaving starts it again.
  No countdown, bar or hint. The king's own words run on into the
  credits with no cut. It is never a clock since the server started. The
  script proves it by running the simulation fast, headlessly.
- **Doc 03's props are examples, not a blueprint** (champion, advisor,
  caged beast, the stained-glass window). Pick the two or three cheapest
  that give "at least three compelling distractions within 30 seconds",
  placeholders all.

## What's open (the lead's to measure and decide)

- Which distractions, and how the court reacts to each: read
  `docs/design-library/01-vision-and-narrative/03-opening-the-never-ending-royal-audience.md`
  in full, then Step 4's rule tables as built.
- What a reload, a dropped connection or a server restart does to the
  count, and whether one of two players wandering off while the other
  listens interrupts it (the library leaves "save/replay state" open).
  Pick the simplest, `DRAFT:`, log it.

## Feedback signal

1. A fresh player has control within one second of the page being ready,
   and a scripted player walks out of the throne room with no prompt
   answered (control: a build with a gate fails).
2. One nonviolent and one outrageous interruption each change the court's
   mood by Step 4's rules, and play continues.
3. Headless, fast-forwarded: about three hours of undisturbed simulated
   listening ends in the credits; ten minutes does not; and three hours
   with one disturbance in the middle does not (control).
4. The speech shows no repeated line within its first thirty minutes.

## Stopping condition

The four signals pass on `main` and live (`npm run check:deployed` exits
0). **Budget:** the first half within an hour of claiming; two hours in
all. If the 10:00 UTC cut-off is nearer than that, land signal 1 and the
throwable, still-talking king, and say so. Scenarios are named
`step6-*.json`.

## Owns

The throne room's people and props (data), the speech text (data), the
speech clock and credits; exact paths as `docs/architecture.md` assigns
them. The king's body is Step 2's kind of body and his moods are Step
4's: this step hands him his speech and places him, and edits neither.
The window is one of Step 3's breakable walls, asked for from its lead.
Opens as soon as the throne room is on `main`.

## Taste, for the owner in the morning

The speech itself; whether ignoring the king is funny; which distractions
tempt them first.

## Measure

Lead `session_017WiGzH9B4usC2uz4woP8Sa`, 04:53–05:00 UTC, `main` at 1ab71d9:

- The throne room is on `main` (20×16 tiles; dais = row 14, columns 0–7);
  nothing is placed in it (`content/placements/throne-room.json` absent).
- The game still starts in `graybox-hall` (`content/game.json`); Step 3's
  worker switches it. Until then the king is on `main` but not on screen.
- Any character kind is hittable and throwable with no code; a body that
  cannot act runs no verb but systems still run, so the speech is a system.
- Scenarios stop at 18,000 ticks (5 minutes) and copy the world each
  tick: "no repeat in thirty minutes" is a check on the text, and the
  three-hour proof (signal 3) needs its own fast runner in slice B.

## What the lead decided (also in `docs/decisions-log.md`)

- The speech count lives on the king's body, runs from world start, and
  nothing stops it: held, flying, knocked out, another room. `DRAFT:`.
- The speech is an authored opening plus table-built digressions that
  never run out (line n is a pure function of n and the data); the file
  is refused if a line repeats.
- Only the grappler can lift him (weight as `dummy-heavy`); anyone can
  hit him. `DRAFT:`.
- His words show over his head, only to players in the room he is in.

## Briefs

- **Slice A, shipped 1b9a2bc, reviewed 08:45 UTC** (durable record: `docs/mechanisms/royal-audience.md`): the king,
  a throne and a few crates placed by data; the speech as data; the
  speech clock; the ribbon. Signals 1 (its scripted half) and 4.
- **Slice B (not written):** the window (asked of the Step 3 lead,
  04:55 UTC, when `breakable` lands), the court as Step 4's people
  (asked of the Step 4 lead; needs their alarm slice on `main`), the
  listening count and the credits, and a fast headless runner for
  signal 3.

## Open with the owner

Nothing blocking. Taste, in the morning: the speech's words.

## Handoff notes

*(Newest last.)*

- **Lead `session_017WiGzH9B4usC2uz4woP8Sa`, 05:00 UTC.** Claimed,
  measured, slice A briefed and its worker launched. Told the Step 2
  lead (two new character files), the Step 4 lead (a new placements file
  for the throne room, no `npc` fields yet) and asked the Step 3 lead for
  the window. Next: on "slice A at <commit>", re-run build and check,
  watch scenario 3's control fail myself, look at the page with the
  start room set to the throne room; then write slice B from what Steps
  3 and 4 have landed by then.
- **Lead, 08:32 UTC.** The shared usage limit stopped everything at
  04:57:32; the slice A worker (session_017WiGzFDAdFWLNWSBgGNoEU) had
  only read files, nothing written or pushed (its events, read 08:31).
  Resumed the same worker against the same brief, new budget 09:20 UTC.
  Orchestrator's order (08:30): slice A only, then report and HOLD;
  slice B waits until told. The Step 3 lead confirmed the window (a
  `breakable` with `"look": "window"` in the west wall above the dais,
  landing in the hidden passage and the undercroft) is in its slice B.
- **Lead, 08:45 UTC. Slice A reviewed and closed (1b9a2bc).** Re-run by
  me on a fresh pull: build and check green; my own control (the clock
  skipping a held or flying body) fails `step6-king-thrown-still-talking`
  and nothing else; the page at 844×390 with the start room set to the
  throne room locally shows the king, throne and ribbon on the first
  frame and the line changing after six seconds, no page errors. Read:
  the opening and samples of the tail to line 5000. Not verified: two
  devices, a real iPhone, touch, the ribbon while he is carried (the
  worker saw it; I did not repeat it). Worker's notes kept here:
  scenarios pin ticks to `speechLineTime` 6, `startLine` 4 and to
  `throne-crate-2` standing where the thrown king lands, so moving the
  throne room's placements moves them (`node scripts/trace.ts`); the
  genealogy's pairs come round after about four and a half hours, longer
  lists push that out. Flags routed to the Step 3 lead (the view cuts off
  the throne room's floor row; a content kind that points at a placed id
  fails the room controls unless it skips the check when there are no
  placements). **Holding on slice B by the orchestrator's order.** For
  whoever writes it: the window is Step 3's (`breakable`,
  `"look": "window"`), the court is Step 4's people, scenarios stop at
  five minutes so the three-hour proof needs its own fast runner.

- **Lead, 08:50 UTC.** The king is on screen live: the start room is the
  throne room (bc18cb1) and `npm run check:deployed` passed at 08:45. For
  slice B, from the Step 3 lead: `breakable` is on `main` (cb297c0); its
  event is `part-broken: { room, part, by, player, speed, look }` (`by`
  is the entity that went through, or null; `look` is `"wall"` or
  `"window"`), in `docs/architecture.md`, "Rooms and doors: what other
  steps read". The window is not placed in the throne room yet; the part
  id comes when it is. Still holding.
- **Lead, 09:10 UTC. The window, measured with real hands.** The window
  is on `main` (5b7e319: part `window`, throne room column 2, rows 9–11;
  beyond it the hidden passage and the `undercroft`). Traced by me: a
  grappler who lifts the king and throws him west **from a standing
  start hits the throne** (launch 242 px/s; the throne stands between
  him and the wall) and breaks nothing; the same throw **from a jump**
  breaks the window at 230 px/s (it needs 200) and the king lands in the
  undercroft. Pinned as `scenarios/step6-king-through-the-window.json`
  (control watched: without the jump, no break). Left as it is: needing
  the jump reads as a suplex, and moving the throne is the owner's taste.
  `DRAFT:` to make a standing throw work too, move the throne one tile
  east of the king in `content/placements/throne-room.json`, or ask the
  Step 3 lead to lower the window's `breakSpeed`. Not checked: whether
  the king's ribbon is seen in the undercroft (it should be: it follows
  his room), and what a second player sees.
