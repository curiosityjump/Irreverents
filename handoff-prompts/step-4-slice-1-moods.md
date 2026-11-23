# Step 4, slice 1: people with three moods (build gate C)

Brief for one cold session. Written 2026-11-23 04:35 UTC by the Step 4
lead (`session_017WiGzG4WzuJfHAu3XWoUhc`). The step is
`docs/plan/step-4.md`; this brief is self-contained, you do not need the
design library or `docs/vision.md`.

## 1 · The task, and the measure row it moves

Put scripted people in the world: a shopkeeper, a guard and a villain,
each with **exactly three moods**, who see what happens in front of them
and react by fixed rules held in data. No calling for help, no area
alert, no responders: that is slice 2, briefed separately, and it builds
on what you push.

**Measure row: M3** (`docs/plan.md`), from 0 of 6 toward 1: `npm run
gates` reports **gate C passing**. (Another step may land a gate first;
the count you report is whatever `npm run gates` prints.)

**Push in two parts, the first one early.** Slice 2's worker starts the
moment part 1 is on `main`, so part 1 is the foundation and nothing else:

- **Part 1 (aim: within 45 minutes):** the content kinds, `c.input`,
  seeing, the deed list, the mood machine, the first two scenarios green,
  and the shapes written into `docs/mechanisms/npc-response.md`. When it
  is pushed, message the lead: `send_message` to
  `session_017WiGzG4WzuJfHAu3XWoUhc`, "slice 1 part 1 at <commit>".
- **Part 2:** routines, the villain, the remaining scenarios, drawing,
  the docs. Message the lead again when done.

## 2 · The derivation, already done

### What exists (measured at `b3a419e`)

- `npm run check` passes: 3 scenarios, all for players. `npm run gates`:
  0 of 6, every gate "no scenario yet".
- An NPC is an `Entity` with `player: null`. The `verbs` system skips
  those (`src/sim/systems/verbs.ts`, `if (entity.player === null)
  continue`), so today nothing moves an NPC at all (the seam below
  fixes that). Physics (`order: 500`) then moves **every** entity whose `kind`
  is a character kind and whose `room` exists, and **silently skips** any
  entity whose `kind` is not in `content.characters`
  (`physics.ts`: `if (!room || !kind) continue`). `draw/entities.ts` does
  the same.
- **Systems cannot read events today.** `ctx.emit` appends to an array
  inside `step()` that `StepContext` does not expose.
- The `World` is `tick` + `entities` only. Step 1's netcode (landing
  about 06:30 UTC) has the **server simulate everything except each
  player's own character** and replicate the simulation's state
  generically. So: **keep every bit of your state on entities
  (`entity.c.<your id>`)**, never in a new `World` field and never in a
  module variable, and it will reach both phones without network code.
- Scenarios (`docs/mechanisms/scenarios.md`) drive **players only**, and
  need at least one player. The `event` fact can only filter by `player`.
- Players are now `grappler`, `infiltrator` or `flyer` (Step 2, on
  `main` since 701dc26); `hero` still exists for Step 1's scenarios. A
  player's character has the role `hero` whichever body it is. The
  `hero` body: a 12×26 box, runs 96 px/s. Tiles are 16 px; one screen is
  20×11 tiles.

### The seams with the other steps (agreed by message, 04:30–04:35 UTC)

Read `docs/plan/step-4.md`, "Every body is Step 2's, player or not",
and "Names other steps are now building against" in
`handoff-prompts/step-2-hit.md`. In short:

- **A body is Step 2's; what a person wants is yours.** Your systems
  never set `vx` or `vy`. They write `entity.c.input`, an `Input` (`x`,
  `y`, `held`), and the body's own verbs act on it
  (`docs/architecture.md`, "Bodies: the events and state other steps
  read"). **Do not edit `src/sim/systems/verbs.ts` and do not declare
  `Components.input`:** Step 2's hit worker makes that change in its
  first push. If it is not on `main` yet when you need it, your people
  stand still; test the rest and pull again.
- **So your people are ordinary character kinds**: add
  `content/characters/{shopkeeper,guard,villain}.json` listing `move`
  (Step 2's directory; announced), each with its own tuning set in
  `content/tuning.json` holding the numbers `move` declares (a walk:
  `runSpeed` about 40). When Step 2's `attack` verb is on `main`, the
  guard and the enraged shopkeeper may list it.
- **Events** Step 2's worker (`session_017WiGzHbbov1AymyWrXuvge`, due
  07:15 UTC) is emitting, each naming entity ids: `hit { by, target }`,
  `grabbed { by, target }`, `thrown { by, target }`, `released`,
  `flattened { target, by }`, `recovered { target }`. **Out cold is
  `entity.c.flattened`**, present exactly while a body is out. **You do
  not wait for them.** Build the generic path: a data table mapping an
  event type to one of your deeds, plus which fields name the actor and
  the target, with rows for `hit`, `grabbed` and `thrown` already in it.
  `git pull --rebase origin main` often; when their events exist, add a
  scenario that uses a real hit.
- **Where people stand is `content/placements/<room id>.json`**, which
  Step 2's worker is creating right now as its "push 1" (`{ "room",
  "place": [{ "id", "character", "tile" }] }`, a `populateRoom(world,
  content, roomId)` in `src/sim/world.ts`, a scenario field
  `"placements": true` that calls it, and scenario `entities`). Step 2
  hands that kind to this step after its push: **extend it additively**
  with an optional `npc` (an NPC kind id) and `routine` on a `place`
  entry, and an optional second list `things` (bodiless: a shop counter,
  goods). Do **not** make a second placement file or your own spawner.
  A system of yours gives `c.npc` to any entity whose placement entry
  names an `npc`. If push 1 is not on `main` when you start, build the
  NPC kind, the rules kind, seeing and the mood machine first and pull
  again; if it is still missing after 30 minutes, tell the lead.
- **Your test room** is `content/rooms/test-shop.json` (Step 3's
  directory; one additive file; never the start room; **no doors**:
  Step 3's validator treats a doorless room as standalone). Slice 2 will
  add its own.
- **`interact`** does not exist yet and is this step's: add
  `content/actions/interact.json` (label "Use", key `KeyE`). Read it
  from a **system** of yours (`ctx.inputs`), not a verb:
  `src/sim/verbs/**` is Step 2's.
- **Scenario and gate names:** scenarios are `scenarios/step4-*.json`.
  `npm run gates` calls a gate passing as soon as one tagged scenario
  passes, so gate C counts for this step only when its line lists a
  scenario for each of signals 1, 1b and 2 (section "The scenarios").

### The rules to build (the owner's, from their design library)

Mark each rule's code site `INTENT:` with its D-number; mark every number
and every choice labelled DRAFT below `DRAFT:`.

1. **Scripted, never AI (D-055).** Roles, moods and "what does this role
   make of that deed" are data tables and fixed state rules. In code,
   comments and docs call it **NPC response logic**, never "AI".
2. **Exactly three moods (D-048):** 1 business as usual, 2
   confusion/distress, 3 absolute blinding violent rage. Counters and
   timers behind them are yours; a fourth value of `mood` is a defect.
3. **Mood 1 is role conformity, not friendliness (D-049).** The villain
   robbing the shopkeeper is *expected*: the shopkeeper stays in mood 1
   and **happily opposes him** (a broom-swing: an `opposed` event and a
   bark). Fighting inside mood 1 is the design, not a contradiction.
4. **Who is acting matters as much as what (D-050).** The same villain
   politely *buying* a potion horrifies the shopkeeper (mood 2). A hero
   buying is mood 1. A hero taking goods without paying is unexpected.
5. **The first deviation is a fluke (D-044); persisting is rage (D-045).**
   One unexpected deed witnessed: mood 1 → 2. More of them: mood 3.
6. **Distress calms at once on an expected act (D-042, D-072).** A person
   in mood 2 who sees the offender do something expected goes straight
   back to mood 1: "Yup! Just as expected!". The owner calls the speed of
   this "core to the game's comedy and strategy": same tick or the next,
   not a fade.
7. **Good-guy rage does not (D-073).** In mood 3 no expected act in view
   helps. It ends only after the offender has stayed unseen and nobody
   has shown this person anything unexpected for long enough.
8. **Very little dialogue (D-057):** a bark is a symbol or at most three
   words over a head.

### The shapes I decided (yours to adjust where the code disagrees; say so in the commit)

- **Roles and sides.** Every person has a `role` (`shopkeeper`, `guard`,
  `villain`) and a `side` (`good`, `bad`). Every player's character has
  the role `hero`. Rule 7 applies to `side: good`; a `bad` person's rage
  is calmed by an expected act like distress is (D-051). `DRAFT:` nothing
  tonight drives the villain out of mood 1; do not build triggers for it.
- **Deeds** (the things people can witness), tonight: `buy`, `take`,
  `rob`, `hit`, `grab`, `throw`. A deed is `{ deed, by, target?, room,
  x, y }`.
- **The expectation table** (`content/rules/`): for an actor's role and a
  deed (optionally the target's side or role), `expected` or `odd`, with
  a weight for `odd`. Defaults by role and deed with a few overrides, not
  a full matrix. Tonight's entries: hero `buy` → expected; hero `take` →
  odd 1; hero `hit`/`grab`/`throw` on a `good` person → odd 2, on a `bad`
  person → expected (D-060); villain `rob` → expected; villain `buy` →
  odd 1; villain `hit` on a hero → expected. A second small table gives a
  mood-1 **reaction**: shopkeeper seeing villain `rob` → `oppose`.
- **The mood machine**, per person: a `dissonance` number. An odd deed
  witnessed adds its weight and sets mood 2; `dissonance >= npcRageAt`
  (DRAFT 3) sets mood 3. Mood 2 with nothing odd seen for
  `npcDistressFadeTime` (DRAFT 12 s) drifts back to 1. Mood 3 falls to
  mood **2** (not 1; then rule 6 applies again) after
  `npcRageCoolTime` (DRAFT 15 s) without seeing any offender and without
  witnessing anything odd; seeing either restarts the clock. Leave one
  clearly marked hook where slice 2 will add "and the area alert is 0".
- **Seeing** (DRAFT, the simplest thing that makes sneaking a choice):
  same room; the target is in front (the way the person faces); within
  `npcSightRange` (DRAFT 112 px, 7 tiles) across and `npcSightHeight`
  (DRAFT 40 px) up or down; and no solid tile on the straight line
  between the two bodies' centres. The **target of a deed always
  perceives it**, facing or not. A knocked-out person sees nothing (the
  flag is Step 2's `c.flattened`; read it if present).
- **What a person does**, fixed per mood, chosen per NPC kind in data:
  mood 1: its **routine**, a looping list of steps in its placement
  (`wait` seconds, `face` a side, `walk-to` a tile column, `do` a deed at
  a target); mood 2: stop, face the offender, plead (a bark); mood 3:
  walk at the offender while seen (to where they were last seen, never to
  where they are), and, once its body lists Step 2's `attack`, hold
  `attack` when in reach. Until then it only charges. All of it through
  `c.input`. Ordinary people stay ordinary fighters (D-046): that is
  Step 2's numbers on the shopkeeper's body, not a rule of yours.
- **What a hero can do tonight:** a fresh press of `interact` acts on the
  nearest thing within `npcInteractReach` (DRAFT 20 px): at a shop
  counter whose keeper is present, `buy` (an event and a bark; no money
  tonight, DRAFT); at a piece of goods, `take` (it is marked taken and
  held by that hero; DRAFT, slice 2 decides what carrying it means).
  Counters and goods are the placements file's `things`. They have no
  body: keep their state as fields of one bodiless per-room entity, or
  bodiless entities of their own, your call.
- **Bounded crowd:** the validator refuses a placements file with more
  than 8 (DRAFT) entries naming an `npc`.
- **Events** to emit, each naming entity ids: `deed` (every deed, with
  who witnessed it), `mood-changed` (`from`, `to`, `cause`), `reassured`,
  `opposed`. Slice 2 and the scenarios read these.

### The scenarios (signals 1, 1b and 2 of the step), all tagged `"gate": "C"`

1. `step4-villain-robs`: the villain's routine robs the shopkeeper; the
   shopkeeper's mood is 1 throughout and `opposed` happens. (The player
   stands idle out of the way.)
2. `step4-villain-buys-politely`: later in the same routine the villain
   politely buys: mood 2. Then he robs properly: mood 1 within 2 ticks.
3. `step4-hero-buys`: the control for 2. A hero buying the same potion:
   mood 1 throughout.
4. `step4-hero-fluke-reassured`: a hero takes goods in view: mood 2. The
   hero buys: mood 1 within 2 ticks.
5. `step4-hero-persists-rage`: the hero keeps taking: mood 3. The hero buys
   in view: **still 3** (D-073). The hero goes out of sight and does
   nothing for the cool time: mood 2.
6. `step4-rage-needs-unseen`: the control for 5. Same, but the hero stays
   in view for the same time: still 3.
7. `step4-unseen-take`: a hero takes goods behind the shopkeeper's back:
   mood 1, and the `deed` event lists no witness.

Signal 1 is scenario 1; signal 1b is 2 and 3; signal 2 is 4, 5 and 6.
Each uses `"placements": true` in `test-shop`. You will need a new fact
in `src/scenarios/facts/` for a person's mood at a tick; Step 2's push 1
makes the existing facts accept `"entity": "<id>"`. The test room needs a
solid wall to get out of sight behind, and three pieces of goods.

## 3 · Traps

- **Determinism.** Every scenario runs twice and must match byte for
  byte. No `Math.random`, no clock, no `Object.keys` order you did not
  fix, no state outside the world. Iterate entities in `world.entities`
  order.
- **The four registry directories take no helper files**
  (`src/sim/systems/`, `src/sim/verbs/`, `src/content/kinds/`,
  `src/scenarios/facts/`): every `.ts` there is default-exported and
  registered. Shared helpers (line of sight, the table lookup) go in a
  directory of your own, `src/sim/npc/`.
- **System order.** Deeds emitted by other steps' systems must already
  exist when your witness pass runs: give the witness and mood systems an
  `order` of 600 or more; the system that writes `c.input` and the
  `interact` reader under 100 (the `verbs` system runs at 100).
- **Reading events.** Add `events` (this tick's events so far) to
  `StepContext` in `src/sim/types.ts` and fill it in `step.ts`: two
  lines, additive, both shared files. Say so in the commit
  (`docs/architecture.md`, "Changing a shared contract", rule 4).
- **Unknown fields are errors** in content files, and an **unread tuning
  number is an error**: declare each world number in the system that
  reads it.
- **Bodiless entities.** Physics and the entity drawer skip an unknown
  `kind` today; Step 2's new systems may not. After each rebase run
  `npm run check`; if another step's system throws on your bodiless
  entity, do not edit their file: tell the lead.
- **Two workers of Step 2 are pushing into `content/characters/`,
  `content/tuning.json`, `src/sim/world.ts` and the scenario runner
  while you work.** Rebase before you touch any of those, keep your
  edits to them additive and small, and never reformat a shared file.
- **A push that touches `src/`, `content/` or `scripts/` deploys, and
  each deploy is about a minute of downtime** on the live address and
  resets the live world. Push finished parts, not every commit. A
  documents-only push does not deploy.
- **The shared files** (`src/sim/types.ts`, `src/client/render.ts`,
  `content/tuning.json`): additive, small, `git pull --rebase origin
  main` immediately before pushing, then `npm run build && npm run check`
  again.

## 4 · Out of scope (you will notice these; leave them)

- Calling for help, the bell, the area alert, responders, hiding and
  cooling an alert, knocked-out people, finding a body: **slice 2**.
- The villain calling from mood 1 at his own signaler (D-070), waves of
  reinforcements: later.
- Money, an inventory, what stolen goods are worth.
- Step 2's verbs, hits and tuning sets; Step 3's rooms, doors and
  camera; `src/client/**` other than your one drawing file and its one
  line; `src/server/**`; `scripts/**`. If one of them is in your way,
  tell the lead.
- `content/game.json`: do not make a test room the start room. The
  people move into the real street in a later slice.
- The final look of a mood: Step 8 (not yet open) owns the marks. Yours
  are plain and `DRAFT:`.
- Sprites. People are their body's graybox rectangle; art arrives later
  as data.

## 5 · Decided, and open

**Decided (do not reopen):** rules 1–8 above; the three roles; that the
newer library rule wins where two disagree (D-073 over the older "rage
resets quickly"); the seams above.

**Open, and yours to decide without asking** (the owner is asleep and has
said not to wait for them: decide, mark `DRAFT:`, and for anything a
player would see add an entry to `docs/decisions-log.md` in its format):
every number above; what the barks are; the shopkeeper's and villain's
routines; the look of a mood over a head.

**Already logged by the lead** (do not log again): what "seen" means;
rage cooling to distress rather than to calm; the villain's rob-then-buy
loop being on show in the street.

## 6 · How it gets verified

- **Rung 2:** `npm run build && npm run check`, by exit code.
- **Rung 3, with a failing control for each scenario,** watched once and
  named in the commit message. The cheap way: break the one rule the
  scenario is about (for 2: make villain `buy` expected in the table;
  for 5: let an expected act calm mood 3; for 7: make sight ignore
  facing) and see `npm run check` name the broken fact. Scenarios 3 and 6
  are themselves the controls for 2 and 5; they still need to be seen to
  fail when broken.
- **`npm run gates`** prints `C: passing` and lists your scenarios.
- **Rung 5, because people are seen:** add `src/client/draw/npcs.ts`
  (called by one line in `src/client/render.ts`): the mood over each
  person's head (nothing for 1, `?` for 2, `!` and a red tint for 3), and
  barks. Run the built server with the test room as the start room **in
  your working copy only**, screenshot it with Playwright at 320×180
  scaled up, for each mood, **look at the images**, and say in the commit
  what you saw. Revert the start room before committing.
- Not verifiable by you: whether it is funny. Do not grade it.

## 7 · Definition of done

- The seven scenarios pass, each with its control watched; `npm run
  gates` shows C passing; `npm run build && npm run check` green after
  the final rebase; pushed to `main`; `/healthz` on the live address
  reports your commit (`npm run check:deployed`).
- SOP phase 6 rows this triggers: a new mechanism (one line in
  `docs/mechanisms/README.md` + `docs/mechanisms/npc-response.md`: the
  component shapes, the tables, system order, the deed list, how seeing
  works, the hooks left for slice 2); where code belongs
  (`docs/architecture.md`: the NPC row corrected to what you built, and
  "I need to add… a role / a person / a rule / a deed"); `INTENT:` and `DRAFT:` at every
  site named above; `docs/decisions-log.md` for what a player would see.
- **Do not delete this brief or edit `docs/plan/step-4.md`**: the lead
  does both after review.

## 8 · Where your questions go

- **Blocking:** `send_message` to the lead,
  `session_017WiGzG4WzuJfHAu3XWoUhc`, and keep working on whatever does
  not depend on the answer. If only the owner could answer: decide, mark
  `DRAFT:`, log it, keep going.
- **A flag or finding:** `docs/for-the-lead.md`.
- **Something only the owner can supply:** `docs/questions-inbox.md`.
- **Your final message:** done or blocked, the commit, nothing more.
