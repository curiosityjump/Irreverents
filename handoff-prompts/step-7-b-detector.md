# Step 7, slice B: the game notices a legend (the detector and the record)

Brief for one cold session. Written 2026-11-23 04:50 UTC by the Step 7
lead (`session_017WiGzF4QGboHBQtunwprhk`). The step is
`docs/plan/step-7.md`. Self-contained: you do not need the design library
or `docs/vision.md`. A second worker runs slice A
(`handoff-prompts/step-7-a-store-and-pedestal.md`: the lasting store and
how a pedestal is drawn) at the same time; **the record shape in section
2 is the contract between you, and you own its file.**

## 1 · The task, and the measure row it moves

When players pull off one of three kinds of feat (a theft nobody
noticed, a last stand, a narrow escape) the simulation notices **by
itself, from what happened**, freezes the moment into a record, and
hangs it on a pedestal: an entity in the world. You build that inside
`src/sim/`, proven by scenarios.

**Measure row: M3** (`docs/plan.md`), gate E, **but this slice does not
turn it green and must not.** The systems that produce the real events
(Step 4's alert and calls, Step 2's hits) are not on `main` yet, so your
scenarios script those events by hand. Gate E's words are "captures a
real highlight, without scripting the event itself": a scenario with
scripted events is not evidence for it. **Do not tag any scenario
`"gate": "E"`.** The lead adds the real ones when Step 4's land.

**First push, within about fifteen minutes:** `src/sim/hall/record.ts`
(types only, section 2), so slice A can import it. Then message the lead
(`send_message` to `session_017WiGzF4QGboHBQtunwprhk`): "record shape at
<commit>". When all is done: "slice B at <commit>".

## 2 · The derivation, already done

### Measured on `main` at 73e73d2 (04:46 UTC)

- `npm run build`, `npm run check` pass; `npm run gates` says 1 of 6 (A).
- **A system cannot read events yet, and you do not add the way.**
  `StepContext` (`src/sim/types.ts`) has `emit` and nothing that reads.
  Step 4's slice 1 worker adds exactly this, `ctx.events` (read-only:
  the events emitted so far this tick), in `types.ts` + `step.ts`, in
  its first push, due about 05:20 UTC (agreed with the Step 1 and Step
  4 leads, 04:45 UTC). Write against that name. Until it is on `main`
  keep a stopgap in your working copy only and **push no edit of your
  own to those lines**; `git pull --rebase origin main` and drop the
  stopgap when theirs arrives.
- **A scenario cannot script an event or place a bodiless entity.**
  `Scenario.entities` (`src/scenarios/types.ts`) needs a `character` and
  carries no `c`. You add (a) an optional fourth argument to `step()`,
  `incoming?: SimEvent[]` (without their `tick`), put on that tick's list
  before any system runs, and (b) an optional scenario field `events`:
  `[{ "at": 120, "type": "alert-changed", … }]`, validated like the
  other fields in `src/scenarios/run.ts` (unknown fields are errors
  there; add yours to the `fields` list at line 22). Both additive; the
  server never passes the fourth argument. Document both in
  `docs/mechanisms/scenarios.md`, saying plainly that scripted events
  stand in for systems not built yet.
- **An entity whose `kind` is not a character kind is skipped** by
  physics (`systems/physics.ts`: `if (!room || !kind) continue`), by the
  verbs system and by `src/client/draw/entities.ts` (line 8). So a
  bodiless entity is safe today. Step 2's hit systems are not on `main`
  yet: `git pull --rebase origin main` before your last push and re-run
  `npm run check` with your entities present.
- **The network sends every entity in the world to every phone about 20
  times a second** (Step 1's Gate 2 design; it replicates entities and
  nothing else). So Hall state must live on entities, and must be
  small. **Budget: a pedestal entity is at most 500 bytes of JSON, the
  watcher entity at most 800.** Measure with `JSON.stringify(e).length`
  in a scenario fact or the trace and state the numbers in your commit.
- The events you may read are the tables in `docs/architecture.md`
  ("Bodies": `hit`, `grabbed`, `thrown`, `released`, `impact`,
  `flattened`, `recovered`). From Step 4, not on `main` yet, **names
  confirmed by its lead at 04:45 UTC**: `call-started { by }`,
  `call-completed { by, area, x, y }`, `call-stopped { by, why }`,
  `alert-changed { area, from, to }` on every change (the area is the
  room id tonight), and one event for every deed, `deed { deed, by,
  target?, room, x, y, … }` where `deed` is `buy`, `take`, `rob`,
  `hit`, `grab`, `throw` (`by` and `target` are entity ids; note
  `room`, not `area`). **Taking goods is `deed` with `deed: "take"`.**
  The deed also carries who witnessed it, under a field name not fixed
  yet: do not read it until `docs/mechanisms/npc-response.md` is on
  `main` and says what it is. Keep every event name the detector reads
  in data (below), so a rename is a one-line content edit.

### The record (the contract with slice A; `src/sim/hall/record.ts`)

```ts
export interface HallRecord {
  v: 1;                 // the shape's version; additive only from here
  n: number;            // 1, 2, 3… in the order hung
  kind: string;         // a kind id from content/hall/
  title: string;        // made from that kind's templates when recognised
  place: string;        // the room id it happened in
  ticks: number;        // how long the episode lasted
  who: { player: string; character: string; name?: string }[];
  stats: Record<string, number>;   // stat id -> number
  score: number;
  frame: { room: string; bodies: [kind: string, x: number, y: number, facing: 1 | -1, flags: number][] };
  at?: string;          // a date, stamped by the server when it saves; never by the simulation
}
```

`frame` is the picture: who stood where at the chosen moment, whole
pixels, at most 10 bodies (the credited players first, then nearest to
them). `flags`: 1 = a credited player, 2 = knocked out. The page redraws
it small inside a frame (slice A). No pixels are stored.

In the world a record is **a pedestal entity**: id `hall:<n>`, kind
`pedestal`, `player: null`, in the Hall room, `c.hall = { record }`.
The detector's own notes live on **one bodiless entity**, id
`hall:watch`, kind `hall-watch`, `room: ''`, `c.hallWatch` (open
episodes, the next `n`, the best score so far per kind and place).
Export from `src/sim/hall/`: `hangRecord(world, content, record)` and
`restoreHall(world, content, records)` (what the server will call at
boot: puts the watcher and every stored record back).

### The rules (decided; the owner's where a D-number is given)

1. **Detected from what happened, never from a checklist** (doc 00:
   "Do not turn the Hall into a preset achievements checklist"). The
   detector reads events and the world. Nothing in a room, an NPC or a
   scenario may say "this is a legend". `// INTENT:` at the system.
2. **Everyone who took part is credited (D-026)**, whoever started or
   finished it. `DRAFT:` taking part = a player whose entity was in the
   area on any tick of the episode, knocked out or not.
3. **Episodes** (`DRAFT:`, per area):
   - *Trouble* opens when an area's alert rises from 0. It closes as an
     **escape** when the alert is back to 0 and at least one credited
     player is not knocked out; as a **last stand** when every credited
     player still in the area is knocked out at once (losing counts:
     the owner's library, "moments that matter even if everyone
     loses").
   - *Quiet theft* opens when a player takes goods in an area whose
     alert is 0, and closes 8 seconds later as an **infiltration** if
     in that time the alert stayed 0 and no call started there.
     Otherwise it closes as nothing.
4. **Rare** (doc 09: "they should feel rare and earned"). Each kind has
   a floor; an episode under it hangs nothing. A scuffle with no call
   and no alert opens no episode at all.
5. **Greatness is relative to what was done before** (S-001, a
   direction). A record hangs only if there is no record of that kind
   in that place yet, or its score beats the best one. The same feat
   repeated straight away hangs nothing. `DRAFT:`.
6. **The picture is the "OHH" moment, not the end.** While an episode
   is open the detector keeps one candidate frame: for trouble, the
   tick of the fastest `impact` so far (until there is one, the tick
   the alert last rose); for a quiet theft, the tick of the taking.
7. **Getting recognised never holds anyone.** Nothing here pauses,
   freezes or moves a player.

Emit `hall-legend { record }` when one hangs and `hall-passed { kind,
place, score, why }` (`below-floor` or `not-greater`) when an episode
closes without one; scenarios and the trace read both.

### Prefer data (`content/hall/`, a new kind file `src/content/kinds/hall.ts`)

- `kinds`: per kind id (`infiltration`, `last-stand`, `escape`) its
  shown name, its title templates (slots `{place}` and any stat id;
  pick by `n` modulo the count, never at random), its floor, its score
  weights per stat, and the event names that open and close it.
- `stats`: per stat id its label and how it is counted from events
  (count / max / sum of a field, optionally only when a player did it).
  Start with: `seconds`, `highestAlert`, `calls`, `hits` (by players),
  `knockedOut` (non-players flattened), `fell` (players flattened),
  `biggestImpact` (max `impact.speed`), `throws`. **Adding a stat of
  those three forms should need no code.** If that costs more than
  half an hour, hard-code the eight, mark it `DRAFT:` and say so.
- `hall`: the Hall room id and the pedestal tiles in it. Step 3's
  gallery does not exist yet: add `content/rooms/test-hall.json` (never
  the start room) and point at it; the lead swaps the id later.
- All titles, names and labels are shown text: `DRAFT:`, plain, original
  (for example "The Quiet Hand at {place}", "The Stand at {place}", "The
  Vanishing at {place}"). Three or four per kind. No jokes at the
  player's expense; no numbers as the whole title.
- `pedestal` must be a real character kind
  (`content/characters/pedestal.json`, heavy, no verbs) so that Step
  2's hit, grab and throw apply to it like any body: nothing in the
  Hall is protected from play. The record is on the entity, so it
  survives being thrown. That directory is Step 2's: add your one file
  and its tuning set, edit nothing else there.

### The scenarios (`scenarios/step7-*.json`, no gate tag, events scripted)

- `step7-escape-is-remembered`: two players in the room; the alert
  rises, a hit and an impact happen, the alert returns to 0: one
  `hall-legend` of kind escape naming **both** players, a pedestal
  entity `hall:1` in the Hall room, `stats` holding at least two
  numbers from the events, the frame taken at the impact's tick.
- `step7-scuffle-is-not` (control): the same hits and impact with no
  alert change: no `hall-legend`, no `hall-passed`.
- `step7-same-feat-twice` (control): the escape episode twice in a row,
  identical: exactly one `hall-legend`, then a `hall-passed` with
  `not-greater`; a third, longer one with a faster impact hangs
  `hall:2`.
- `step7-last-stand-lost`: both players knocked out under alert: a
  last-stand record naming both.
- `step7-quiet-theft` and `step7-theft-noticed` (control: a call starts
  inside the 8 seconds): once the lead has sent you the event name.
- `step7-solo-counts`: one player alone earns the escape (solo is never
  locked out by headcount).
- `step7-restored`: needs a way to start a scenario with stored
  records; if that is more than a small additive field, prove
  `restoreHall` another way and say how.

Add facts as files in `src/scenarios/facts/` (for example one that
reads a pedestal's record).

## 3 · Traps

- **Determinism.** No clock, no `Math.random`, no module-level state:
  every note the detector keeps is on `hall:watch`. Every scenario runs
  twice and is compared byte for byte. `at` is the server's to stamp.
- **Registries take no helper files.** `src/sim/systems/` gets only
  `hall-detect.ts` (and other `hall-*.ts` systems); helpers and types
  go in `src/sim/hall/`.
- **Run after everything** (order 900 or so; Step 4's lead asks for
  600 or later) so the tick's events are all there; leave gaps.
- **Do not rewrite the watcher's `c` every tick** when nothing changed
  (Step 1's lead: snapshots are JSON 20 times a second). Store start
  ticks and counters, not a running clock.
- **Other steps' systems will meet your entities.** Never give the
  watcher a character kind. If a system of another step chokes on it
  after your rebase, do not edit theirs: message the lead.
- **Never read a field of another step's private state** (`c.npc`,
  the alert entity). Events and the published fields in
  `docs/architecture.md` only; if you need more, message the lead.
- **Unknown content fields are errors**; a new content kind validates
  its own files and names the file and field
  (`docs/mechanisms/content-validation.md`).
- **A push touching `src/`, `content/` or `scripts/` redeploys**: about
  a minute offline and a fresh live world. Push finished parts; check
  `/healthz`'s player count first once it reports one.

## 4 · Out of scope

- The store, the server, the page, drawing: slice A and Step 1.
- Real (unscripted) scenarios, gate E's tag, placing pedestals in Step
  3's gallery: the lead, later.
- The machine and the roadblock.
- A ceremony or cutscene; replays; a journal of smaller episodes; new
  kinds of glory beyond the three.
- Player names: `who[].name` stays unset until a step publishes one.
- `scripts/**`, `src/server/**`, `src/client/**`, other steps' systems.

## 5 · Decided, and open

**Decided:** the rules and shapes above; already in
`docs/decisions-log.md` by the lead (do not log them again).

**Open, yours to decide without asking** (`DRAFT:`; log in
`docs/decisions-log.md` anything a player would see): the floors and
weights; the titles; which pedestal leaves the floor when the tiles are
full (the store keeps every record regardless); the test room.

## 6 · How it gets verified

- `npm run build && npm run check` by exit code; `npm run gates` still
  says E has no scenario.
- **A failing control watched for each scenario**, named in the commit:
  drop the relative-greatness test and see `step7-same-feat-twice`
  fail; open an episode on a `hit` and see `step7-scuffle-is-not` fail;
  credit only the player who was hit and see the first scenario fail.
- The byte sizes of a pedestal and of the watcher, measured, in the
  commit.
- Not verifiable by you: whether the game noticed the right moment.
  That is the owner's, by playing.

## 7 · Definition of done

- The scenarios pass with their controls watched; build and check green
  after the final rebase; pushed to `main` (verify with `git ls-remote
  --heads origin main`); `npm run check:deployed` exits 0.
- SOP phase 6: a new `docs/mechanisms/hall-of-legends.md` (episodes, the
  record, the two entities, how to add a kind or a stat, what is
  scripted in the scenarios) with its index line;
  `docs/architecture.md` gains the two events, the two entity ids and
  "I need to add… a kind of legend / a Hall stat"; `INTENT:` / `DRAFT:`
  at the sites; `docs/deliberate-designs.md` for rule 1.
- Do not delete this brief or edit `docs/plan/step-7.md`.

## 8 · Where your questions go

- **Blocking:** `send_message` to the lead,
  `session_017WiGzF4QGboHBQtunwprhk`, and keep working on what does not
  depend on the answer. If only the owner could answer: decide,
  `DRAFT:`, log, continue.
- **A flag or finding:** `docs/for-the-lead.md`.
- **Something only the owner can supply:** `docs/questions-inbox.md`.
- **Your final message:** done or blocked, the commit, nothing more.
