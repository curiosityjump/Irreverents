# Brief: Step 6, slice A — the king is in the throne room, already talking, and never stops

Lead: `session_017WiGzH9B4usC2uz4woP8Sa` (Step 6). Written 2026-11-23
~05:00 UTC. **Budget: on `main` and verified by about 05:50 UTC.** If it is
not going to make that, land the king, the speech and scenarios 1–3 and
say what is left in `docs/for-the-lead.md`.

## 1 · The task, and the measure

Put the king in the throne room with a speech that belongs to his body:
he is talking when the first player arrives, he keeps talking while he is
hit, carried, thrown, knocked out or carried into another room, nothing
waits for him, and his words show as a small ribbon over his head that
nobody has to read. No court reactions, no guards, no window, no
three-hour ending: those are the next slice.

Measure table: this adds no new gate to M3 by itself. It is the first
thing the owner sees when the game opens (`docs/plan/step-6.md`, signals
1 and 4). Tag no scenario with a gate.

## 2 · What I measured (04:53–05:00 UTC, `main` at 1ab71d9)

- **The room:** `content/rooms/throne-room.json`, 20×16 tiles of 16 px.
  The dais is the solid run in row 14, columns 0–7; its area is `dais`
  (columns 3–7, rows 10–13). A body placed at tile `[5, 13]` stands on
  the dais (`spawnBody` in `src/sim/world.ts`: feet on the bottom of the
  tile, centred). The four spawn tiles are row 14, columns 9, 11, 13, 15.
  The opening to `castle-street` is the east edge, rows 13–14.
- **`content/placements/throne-room.json` does not exist** (the directory
  holds `graybox-hall.json` and `test-shop.json`). A placement with no
  `npc` field is a plain body; Step 4's systems ignore it.
- **`content/game.json` still starts players in `graybox-hall`.** Step 3's
  worker switches it to `throne-room`; that is theirs, do not touch it.
  `src/client/main.ts:19` populates the start room, so your placements
  appear on the page the moment they switch. Test in the browser by
  changing `startRoom` locally and **not committing it**.
- **Any character kind can be hit, grabbed and thrown** with no code:
  a kind listing only the verb `body`, with `weight` and `toughness` in
  its tuning set. `dummy-heavy` is weight 110, toughness 260; the
  grappler lifts it and the other two members cannot
  (`scenarios/step2-hit-grappler-lifts-heavy.json`,
  `step2-hit-flyer-cannot-lift-heavy.json`).
- **A body that may not act runs no verb** (`canAct`,
  `src/sim/body-state.ts`), but **systems run for everybody every tick**.
  So the speech must be a system, never a verb.
- **Scenarios are capped at 18,000 ticks** (five minutes;
  `src/scenarios/run.ts:12`, `MAX_TICKS`) and copy the whole world every
  tick. So "no repeated line in thirty minutes" cannot be a scenario: it
  is a check on the text, in the content kind.
- **Text on screen today** is `label()` in `src/client/draw/npcs.ts`
  (bold 8 px monospace in a box, kept inside the 320×180 view). That file
  is Step 4's: copy the few lines, do not import or edit it.
- **Paths this step owns** (`docs/architecture.md`, the ownership table):
  `content/audience/**` and its kind file, `src/sim/systems/audience-*`,
  `src/client/draw/audience.ts`, `scenarios/step6-*.json`, new facts.

## 3 · What to build

**Data.**
- `content/characters/king.json` and `throne.json`: plain `body` kinds,
  boxes up to 32×32, colours that read apart from the heroes and the
  dummies (king: a purple or gold; throne: darker). Their sections go at
  the **end** of `characters` in `content/tuning.json`. King: weight 110,
  toughness 260 (as `dummy-heavy`: anyone can hit him, only the grappler
  lifts him). Throne: heavier than the grappler can lift is fine. Both
  `DRAFT:`. The Step 2 lead has been told these two files are coming.
- `content/placements/throne-room.json`: `king` at `[5, 13]`, `throne`
  beside him on the dais, and two or three existing `crate` /
  `crate-heavy` bodies on the floor and a balcony (ids `throne-crate-1`…),
  clear of the four spawn tiles and of the east opening. No `npc` field
  on any of them. The Step 4 lead has been told.
- `content/audience/royal-audience.json` + `src/content/kinds/audience.ts`
  (a new self-registering kind; model: `kinds/placements.ts`). It names
  the speaker (the placement id `king`) and holds the speech. **The
  speech is data and it is long:**
  - an **authored opening** of at least 120 lines, original, solemn and
    increasingly digressive: the existential crisis, the prophecy, the
    ancient seals, the duties of the chosen, then royal genealogies,
    forgotten accords, inheritances, farming, etiquette, and back to the
    seals. Each line at most 56 characters (two lines of 28 on screen).
    No jokes that wink at the player: the king is earnest. Nothing from
    any existing game or story.
  - a **tail that never runs out**, also data: digression patterns with
    lists that are stepped through by line number (a genealogy that
    begets on and on, the articles of an accord, the yields of each
    field by year), so line `n` is a pure function of `n` and the data.
    No `Math.random`, no clock (the layer rule forbids both).
  - one pure function, `speechLine(audience, n): string`, in a new file
    `src/content/speech.ts` (not in `kinds/`: registry directories take
    no helpers).
  - **The kind's `check` computes the first 3 hours of lines at the
    file's own pace and refuses the file if any line repeats**, naming
    both line numbers; if 3 hours cannot be reached tonight, check the
    first 30 minutes and say so in the commit. Also refuses a line over
    56 characters.
  - Top comment `DRAFT:` — the words are the owner's taste.

**The clock.** `src/sim/systems/audience-speech.ts`: each tick, for each
audience, find the speaker's entity (wherever it is, any room) and add
one to `entity.c.audience.ticks` (create it at a starting value from the
data, so he is **mid-speech** at world start: begin a few lines in).
Declare `Components.audience` from that file by declaration merging
(model: `src/sim/verbs/jump.ts`). World tuning number, declared by this
system: `speechLineTime`, seconds a line stays up (suggest 6; range 1–60).
The line showing is `speechLine(audience, floor(ticks / (speechLineTime × 60)))`.
Emit nothing every tick. Never read `world.tick` for the speech: the
state is on his body so it travels with him and reaches other devices
with him.

**On screen.** `src/client/draw/audience.ts`, one line added to
`src/client/render.ts` after `drawNpcs`: the current line in a small box
over the speaker's head, wrapped to two lines, kept inside the view, drawn
only when the viewer is in the speaker's room. It follows him when he is
carried or flying. `DRAFT:` look.

**A fact.** `src/scenarios/facts/speech.ts`: at tick `at`, entity's
speech line number is within `line: [min, max]`, and optionally its text
`differs-from-at` an earlier tick.

## 4 · Traps

- **A gate by accident.** Nothing may wait on the speech: no input is
  swallowed, no door is closed, no player state is set. The system
  writes one field on one entity.
- **He must keep talking when he cannot act.** Held, flying, in a beat,
  flattened, in another room: the count still advances. Scenario 3 is
  the proof; its control is the one that matters.
- **`content/tuning.json` is shared** and other workers are editing it
  now: add at the end of each object, `git pull --rebase` right before
  the push, re-run `npm run check` after the rebase.
- **`src/client/render.ts` is shared:** one import, one call.
- **Do not make the king a person** (`npc`) in this slice: Step 4's alarm
  slice is in flight and the court's reaction is the next brief.
- **A push is the deploy.** Other steps' scenarios must all still pass.

## 5 · Out of scope (leave alone, even if it looks wrong)

`content/game.json`; `content/rooms/**`; `src/client/draw/npcs.ts`,
`entities.ts`, `room.ts`; anything under `content/npcs`, `content/rules`;
every verb and every `combat-*`, `carry-*`, `impact-*`, `npc-*`, `room-*`
system; the server and the network. The window, the guards, the court's
moods and the three-hour ending. A mark for the king in
`src/client/draw/entities.ts` (`MARKS`) is Step 2's file: skip it.

## 6 · Decided, and open

Decided (owner, design library doc 03, via `docs/plan/step-6.md`): no
gate of any kind; the speech never visibly loops and is never dialogue;
the words are a placeholder for the owner to rewrite. Decided by the lead
tonight, `DRAFT:`, logged in `docs/decisions-log.md`: he talks through
everything including being knocked out; only the grappler lifts him; the
words sit over his head and are seen only in the room he is in.

Open: nothing that stops you. The speech's wording is the owner's to
judge in the morning; write it, do not ask.

## 7 · How it gets verified

`npm run build && npm run check` green, then, each with its control
**watched to fail once** (`docs/mechanisms/scenarios.md`):

1. `step6-king-mid-speech`: room `throne-room`, `"placements": true`,
   nobody presses anything for 20 s; the king's line number at tick 0 is
   above 0 and has advanced by 3 by the end (at 6 s a line). Control:
   remove the system's increment.
2. `step6-walk-out-during-speech`: a player walks east from a spawn and
   is in `castle-street` within 3 s, holding only the stick; the speech
   advanced meanwhile. Control: a wall tile in the opening via the
   scenario's `tiles`.
3. `step6-king-thrown-still-talking`: a grappler grabs the king off the
   dais and throws him; `grabbed` and `thrown` events with target `king`;
   his line number keeps advancing across held, flying and after landing.
   Control: make the system skip a body that fails `canAct`.
4. The text check: duplicate one line of the opening, see `npm run
   check` refuse it naming both lines, restore it.
5. In a real browser at a phone landscape size (844×390; Chromium is
   installed, `executablePath: '/opt/pw-browsers/chromium'` if needed),
   with `startRoom` changed locally only: the king and his ribbon are on
   screen at the first frame, the ribbon is legible, changes, and follows
   him when thrown. Keep the screenshot out of the repository; say in the
   commit that you looked.

## 8 · Done

On `main`, `npm run check` green after the final rebase; the commit
message says what was run, what was watched to fail, and what was not
verified. SOP phase 6: a new mechanism writeup
`docs/mechanisms/royal-audience.md` (short: the data format, the
function, the system, how to add lines) with its index line; a row for
"a speech / an audience" in `docs/architecture.md`'s "I need to add…"
table and `src/content/speech.ts` added to Step 6's row in the ownership
table. Do not edit `docs/plan.md` or `docs/plan/step-6.md`.

## 9 · Where questions go

Blocking: message the lead, `session_017WiGzH9B4usC2uz4woP8Sa`, and keep
working on what does not depend on it. Anything else: a flag to
`docs/for-the-lead.md` (name Step 6), a question only the owner could
answer to `docs/questions-inbox.md` after deciding it yourself. **When
you have pushed, or hit a real blocker, send one message to the lead's
session id:** `slice A at <commit>` or the blocker. Your final message
says almost nothing.
