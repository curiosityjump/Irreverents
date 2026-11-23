# Step 4, slice 2: calling for help, the alert, and getting away (build gate D)

Brief for one cold session. Written 2026-11-23 04:40 UTC by the Step 4
lead (`session_017WiGzG4WzuJfHAu3XWoUhc`). The step is
`docs/plan/step-4.md`. Self-contained: you do not need the design library
or `docs/vision.md`.

**You build on slice 1's foundation, which another worker
(`session_017WiGzFBg5B72dx48zdiZh9`) pushed just before you were started
and is still extending.** Read `docs/mechanisms/npc-response.md` first:
it has the shapes this brief could only name loosely (`c.npc`, the deed
events, the seeing helper, the placements `things`, the hooks left for
you). Where that file and this brief disagree about a *shape*, the file
wins; about a *rule*, this brief wins: tell the lead.

**Since this was written: the foundation is on `main` at `a501061`**
(re-run by the lead at 04:47 UTC: build and check green, and making the
villain's polite purchase "expected" fails `step4-villain-buys-politely`
as it should). What it settled, where this brief was guessing: a hero's
or a routine's act is a `did` event that the witness pass turns into
`deed { …, witnesses }`; things are bodiless entities of kind `~thing`
with `c.thing`, each naming the `deed` using it performs (so a bell is a
thing whose deed is `break`, plus whatever state you add); behaviours
are ids in `BEHAVIOURS` with one function each; the rage hook is
`rageMayCool()`; `charge` already steers by `lastSeen` only. The test
room so far is `test-shop`; the villain's polite visit there is at about
tick 2960.

## 1 · The task, and the measure row it moves

People already have three moods and see what happens. Add what happens
next: an upset witness goes and **calls for help**, a completed call
raises the **area alert**, help **comes to the place that was reported**,
and the players can **sneak it with no alarm at all** or **get caught,
get away, hide and wait it out**.

**Measure row: M3** (`docs/plan.md`): `npm run gates` lists **gate D
passing**, with a scenario for each of signals 3, 4 and 5 below.

When done, message the lead (`send_message` to
`session_017WiGzG4WzuJfHAu3XWoUhc`): "slice 2 at <commit>".

## 2 · The derivation, already done

### The rules (the owner's; mark each code site `INTENT:` with its D-number)

1. **A person's mood and the area's alert are two separate things
   (D-065).** Mood is 1/2/3 per person (slice 1). The alert is one number
   per area, 0 to 3. Three furious witnesses and an alert of 0 is a
   normal state of the world.
2. **Only a completed call raises the alert (D-063, D-075).** Not rage,
   not a hit, not a body on the floor, not a timer. No witness, no call.
   This is the one invariant of the slice: **the alert number has exactly
   one line of code that raises it.**
3. **Who may call (D-064, D-071):** a `good` person in mood 2 or 3, never
   in mood 1.
4. **A call is a real act that can be stopped (D-066).** The caller walks
   to a call point, starts, and has to finish. Knocking the caller out
   (Step 2's `c.flattened`), breaking the bell, or the caller being
   calmed back to mood 1 before finishing (D-072: the reassured merchant
   "stops trying to call") all mean nothing was sent.
5. **A sent call is not unsent (D-066).** Calming the caller afterwards
   changes their mood and nothing else.
6. **Help is not psychic (D-065).** Responders go to the place that was
   reported, search from there, and chase only a hero they see, toward
   where they last saw them. No code path may read a hero's position for
   a responder who does not see that hero on that tick.
7. **Someone who finds a knocked-out good person becomes upset and may
   call (D-064).**
8. **An alert cools only by hiding and waiting (D-068, D-074, D-076).**
   While no conscious person of the area sees any hero and nobody
   perceives a hero doing anything unexpected, a clock runs; when it has
   run long enough the alert drops one level and the clock restarts.
   Being seen, or any perceived incident (hitting back counts, D-067),
   puts the clock back to zero. Acting normal in view of a pursuer does
   nothing (D-067).
9. **Rage ends only below the violent level (D-073).** Slice 1 left a
   hook in the mood machine: a `good` person's mood 3 may cool only while
   their area's alert is 0. Fill it.
10. **Getting caught opens play (D-019).** Nothing in this slice ends,
    reloads or resets anything, and no state holds a player with no way
    out.

### The shapes I decided (all `DRAFT:`; adjust where the code disagrees and say so in the commit)

- **Where the alert lives:** on an entity (Step 1's netcode replicates
  entities and nothing else): one bodiless entity per area, or the
  per-room entity slice 1 made for `things`. An area is the room tonight.
- **Call points** are a `things` type in the placements file: `bell`,
  with a side. A hero's `interact` at a working bell breaks it (a deed,
  `break`: unexpected for a hero if someone sees it, weight 1). A broken
  bell stays broken (DRAFT).
- **When a witness goes to call.** Mood 2: they plead first, for
  `npcPleadTime` (3 s): that is the player's window to make it right;
  then they walk to the nearest working bell of their side in the room.
  Mood 3: they charge while they can see the offender, and go to call
  when they cannot. A person with no working bell to reach does not
  call. The call itself takes `npcCallTime` (2.5 s) standing at the
  bell; emit `call-started`, then `call-completed { by, area, x, y }`
  where `x, y` is where the caller last witnessed something, or
  `call-stopped { by, why }`.
- **Every change of an area's alert emits `alert-changed { area, from,
  to }`** (the area is the room id tonight). Step 7's legend detector
  reads this and `call-started` / `call-completed` / `call-stopped`
  (agreed with its lead, `session_017WiGzF4QGboHBQtunwprhk`, 04:45
  UTC): keep these four names and fields exactly.
- **The scale:** each completed call adds 1, to a most of 3. The violent
  level is 1: any alert above 0 means pursuit. One level cools per
  `npcAlertCoolTime` (20 s) of quiet.
- **Hitting back** restarts the wait and does not raise the number (rule
  2 stays clean).
- **A report names the heroes as a party:** every player is wanted in
  that area together.
- **Responders.** On a completed call, every `guard` of that side in the
  area takes the task `respond`: walk to the reported `x`, then `search`
  (pace `npcSearchRange`, 48 px, either side of it) for as long as the
  alert is above 0. A searching or responding guard who sees a hero
  chases: toward the last place it saw them, holding `attack` in reach
  if its body lists Step 2's `attack` verb. Losing sight, it walks to
  the last place seen and searches there. At alert 0 it walks back to
  its post and its routine. All movement through `c.input`; **your
  systems never set `vx`**. A responder's mood is 2 on arrival and 3
  once it has seen a hero while the alert is above 0.
- **More help at levels 2 and 3** (cut this first if time is short; the
  placed guard responding is enough for the gate): one extra `guard`
  per level walks in from a `things` entry of type `help-arrives`,
  `npcResponseDelay` (2 s) after the call, never taking a room past 8
  people; at alert 0 it walks back there and is removed.
- **A refuge needs no object:** people's bodies do not list `jump`, so a
  ledge a jump reaches is a place pursuers cannot follow, and a solid
  tile or the height limit of sight makes it unseen.
- **Missing goods are not noticed by themselves** tonight; someone has to
  see the taking.
- **A way to say "left":** the test room has no doors (Step 3's are not
  built). "Leaving" in a scenario is reaching the far end of the room.

### The scenarios (`scenarios/step4-*.json`, tagged `"gate": "D"`)

Build a second test room, `content/rooms/test-street.json` (no doors;
never the start room) with its placements: a shopkeeper at a counter
with goods, a bell he can walk to, a guard at a post **out of the shop's
sight**, and a ledge only a jump reaches. Add a fact for the alert level
of an area at a tick.

- **Signal 3.** `step4-call-brings-help`: a hero takes goods in view and
  walks off to the far side; the shopkeeper pleads, walks to the bell,
  completes the call; the alert is 1; the guard ends up within the
  search range of the **reported place**, not of the hero.
  `step4-call-stopped-no-help` (the control): the same, but the bell was
  broken first, unseen: `call-completed` never happens, the alert stays
  0, the guard never leaves his post. **The step's own wording of this
  control is "the witness knocked out before finishing":** add
  `step4-caller-knocked-out` as soon as Step 2's `attack` is on `main`
  (due about 07:15 UTC; `git pull --rebase origin main` and look for
  `src/sim/verbs/attack.ts`). If it is not there when everything else is
  done, say so in the commit and in `docs/for-the-lead.md`.
- **Signal 4.** `step4-zero-alarm`: a scripted route takes the goods
  while the shopkeeper's routine has his back turned, and reaches the
  far end of the room: alert 0 throughout, no `call-started`, the
  shopkeeper in mood 1 at the end.
- **Signal 5.** `step4-catastrophe-and-escape`: the same room and goods,
  taken in view; the call completes; the guard comes and chases; the
  hero reaches the ledge and does nothing; the alert falls to 0 after
  the wait; the guard is back at his post; the hero comes down and buys,
  and the shopkeeper is in mood 1. `step4-incident-restarts-wait` (a
  control): the same, but partway through the wait the hero does
  something unexpected in someone's view: at the tick the first run
  reached 0, the alert is still 1. The step's other control ("walking
  through a door alone does not cool it") needs Step 3's doors and is
  slice 3's.
- `step4-rage-without-a-call`: a hero drives the shopkeeper to mood 3
  with the bell already broken: alert 0 throughout, the guard never
  moves (rule 2).

## 3 · Traps

- **Slice 1's worker is still pushing into the same files** (the `npc-*`
  systems, the placements kind, `src/client/draw/npcs.ts`,
  `content/tuning.json`, `docs/mechanisms/npc-response.md`). Put your
  logic in **new** files (`src/sim/systems/npc-call.ts`, `alert-*.ts`,
  helpers in `src/sim/npc/`); touch slice 1's files only at its marked
  hooks, in small additive edits; `git pull --rebase origin main` before
  every commit that touches a shared file. Never refactor their code: if
  a shape is in your way, message the lead.
- **The single raise.** It is easy to add a second place that bumps the
  alert "just for responders who see a hero". Don't (rule 2). Write a
  control that would catch it: `step4-rage-without-a-call`.
- **Psychic guards by accident:** chasing "the nearest player" is the
  natural code and it is the bug. Store a last-seen position per
  responder and steer only by that.
- **Determinism**, the registry directories take no helper files, world
  numbers must be declared by the system that reads them, unknown content
  fields are errors: as in `docs/architecture.md` and
  `docs/mechanisms/content-validation.md`.
- **Long scenarios are fine but capped** at 18,000 ticks (5 minutes);
  the cool time is a tuning number, so a scenario's length follows from
  it. Find tick numbers with `node scripts/trace.ts <id>`.
- **A push that touches `src/`, `content/` or `scripts/` deploys**, with
  about a minute of downtime and a reset of the live world. Push
  finished parts.

## 4 · Out of scope

- The villain calling from mood 1 at his own horn (D-070); a struck
  guard whistling for more; waves beyond one extra guard per level.
- Following a hero through a door; the real castle street; anything
  placed in a room players start in. Slice 3.
- How hard a guard hits, knockback, being flattened and coming back:
  Step 2's. Moving a player from the server: Step 1's effects.
- Money, an inventory, what stolen goods are for.
- Slice 1's moods, table, routines and scenarios, other than its hooks.
- The final look of marks and the alert display: Step 8 and Step 5 own
  those later; yours are plain and `DRAFT:`.

## 5 · Decided, and open

**Decided:** rules 1–10; the shapes above (already in
`docs/decisions-log.md` by the lead: the 0-to-3 scale, 20 s per level,
hitting back restarts the wait, the party wanted together; do not log
them again).

**Open, yours to decide without asking** (decide, `DRAFT:`, and log in
`docs/decisions-log.md` anything a player would see): the test room's
layout; the numbers; how the bell, a call in progress and the alert
level are drawn; whether a responder who finds nothing says so with a
bark.

## 6 · How it gets verified

- `npm run build && npm run check`, by exit code; `npm run gates` shows
  `D: passing` listing a scenario for each of signals 3, 4, 5.
- **A failing control watched for each scenario**, named in the commit:
  for signal 3, make responders steer at the hero's real position and
  see `step4-call-brings-help` fail on where the guard ends up; for the
  alert, add a raise on a sighting and see `step4-rage-without-a-call`
  fail; for cooling, let the clock run while a hero is seen and see
  `step4-incident-restarts-wait` fail; for signal 4, make the shopkeeper
  see behind him and see `step4-zero-alarm` fail.
- **Rung 5:** the bell (working, ringing with the call's progress,
  broken) and the alert level (up to three plain marks in a corner) in
  `src/client/draw/npcs.ts`. Screenshot the test room locally with
  Playwright (start room changed in your working copy only), look at the
  images, say what you saw in the commit, revert the start room.
- Not verifiable by you: whether being caught is fun. Do not grade it.

## 7 · Definition of done

- The scenarios above pass with their controls watched; gate D listed as
  passing; build and check green after the final rebase; pushed to
  `main`; `npm run check:deployed` exits 0.
- SOP phase 6: `docs/mechanisms/npc-response.md` extended (calling, the
  alert, responders, cooling, the one-raise rule) and its index line
  kept true; `docs/architecture.md` "I need to add… a call point / a
  responder"; `INTENT:` / `DRAFT:` at the sites; `docs/decisions-log.md`
  for player-visible choices of yours.
- Do not delete this brief or edit `docs/plan/step-4.md`.

## 8 · Where your questions go

- **Blocking:** `send_message` to the lead,
  `session_017WiGzG4WzuJfHAu3XWoUhc`, and keep working on what does not
  depend on the answer. If only the owner could answer: decide, `DRAFT:`,
  log, continue.
- **A flag or finding:** `docs/for-the-lead.md`.
- **Something only the owner can supply:** `docs/questions-inbox.md`.
- **Your final message:** done or blocked, the commit, nothing more.
