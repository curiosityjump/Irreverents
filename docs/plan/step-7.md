# Step 7 — A Hall that remembers, and a machine to steal

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-024, D-026), via `docs/vision.md`:**
> Epic stealth successes, last stands and escapes are commemorated in a Hall of Legends …
> Every participating player's history includes the event, even if played in somebody else's game.

**Owner (Drive, doc 00), "Invariants for designers":**
> Do not confine mayhem to designated levels or protect the Hall of Legends from gameplay. …
> Do not turn the Hall into a preset achievements checklist instead of a memory of actual events.

The library's fifth build gate (doc 24, gate E): "simple Hall captures a
real highlight, without scripting the event itself." And golden scenario
G-08 (doc 12), the roadblock: "player says 'OHH!' without relying on
giant text damage numbers or cinematic override."

## Goal

Two things, the Hall first.

**The Hall.** When the players pull off something of the three confirmed
kinds (a theft nobody noticed, a last stand, a narrow escape), the game
notices by itself, freezes the moment into a picture, and hangs it on a
pedestal in the Hall gallery with who was there and a few true numbers
from the event. Both players are
credited. They can walk up to it. They can also start a fight in the
Hall.

**The machine.** In the courtyard, a heavy patrol machine that can be
knocked open, climbed into and driven through a roadblock that breaks.

## How to cut it (a suggestion, not a rule)

Opened early (04:45 UTC, 2026-11-23), before the rooms and the people it
will finally read exist, because three of its parts wait on nobody:
**the store** on the owner's volume; **the detector**, built against
made-up events that use exactly the event names in
`docs/architecture.md` (Step 2's hits and knock-outs are there now; ask
Step 4's lead for the names of its calls and alert changes before
inventing any); and **the record itself** (the picture, who was there,
the numbers). Placing pedestals in the gallery waits for Step 3's room;
the real zero-alarm scenario waits for Step 4. The server's own files are
Step 1's until its second gate lands (about 06:30 UTC): the store is a
new file of your own beside them, and the one line that starts it is
agreed with Step 1's lead. The machine comes last; if the night runs
short it is the part to leave.

## What's decided

- **Detected from what happened, not from a list of achievements.** The
  detector reads the simulation's own events (Step 4's alert and calls,
  Step 2's impacts): doc 24's first version is "three categories …
  thresholds plus an event stats buffer, one runtime screenshot captured
  at a memorable moment, a generated title from safe authored templates,
  a simple in-world framed image." (The library's own proposal, used by
  default: D-096; in use, not canon; `DRAFT:`.)
- **Everyone who took part is credited** (D-026), whoever started or
  finished it.
- **A record carries stats** (D-025: "a frame of the spectacular moment
  presented on a pedestal, with relevant stats and history-relative
  prestige"): the numbers the detector already holds (kind, place, how
  long, how many came, highest alert). Prestige against earlier records:
  a simple rank among the records so far, `DRAFT:`.
- **Greatness is relative to what was done before** (S-001, a strong
  direction, not a decision: "events of unusual greatness relative to
  past exploits rather than predetermined quest completions"). The same
  feat repeated straight away does not hang a second pedestal unless it
  beats the first on a measured number. `DRAFT:`.
- **Rare:** not after every scuffle (doc 09: "they should feel rare and
  earned").
- **The Hall is a room like any other:** Step 3's gallery, people placed
  by Step 4's data. Nothing in it is protected from play, and a record
  survives the Hall being wrecked (doc 09).
- **Records are kept on the volume the owner added.** The owner asked the
  orchestrator how to add Railway storage and attached it the same night:
  the live `/healthz` reported `storage: {mounted: true, writable: true,
  path: "/data", name: "irreverents-volume"}` at 04:24 UTC, 2026-11-23.
  So Hall records are written to a small file under the path Railway
  gives the server (`RAILWAY_VOLUME_MOUNT_PATH`; never a hard-coded
  `/data`), read back at start, and survive restarts and deploys. Where
  no volume is mounted (a session's own machine, tests) records live in
  memory and the Hall says so. The file's shape is a contract once
  written: additive only, with a version number. No database. `DRAFT:`.
  **Build the store as one small general thing** (named collections of
  records, read at start, written safely, versioned), because the Hall is
  only its first customer: unlocked heroes (Step 13) and what has been
  found and explored (Step 14) will keep theirs in it too. Say how to use
  it in `docs/architecture.md`.
- **The machine is one vehicle with one move** (drive, ram); the
  roadblock breaks in stages with debris (doc 24, "Combat that feels huge
  with scripted opponents" and "1 hijackable machine with a simple
  side-view movement/ram ability": the library's own proposal, used by
  default, `DRAFT:`). **The ram hits people as well as the roadblock**,
  by Step 2's rules: turning the machine on whoever is chasing you is the
  point (D-023: "Hijacking the enemy machine sent to stop the party and
  turning it on the pursuers is a signature desired situation").

## What's open (the lead's to measure and decide)

- Thresholds for "legendary", and which moment's picture to keep: read
  `docs/design-library/02-gameplay-systems/09-hall-of-legends-records-and-living-history.md`
  and `08-combat-impact-destruction-and-vehicles.md` in the same folder.
- Whether the machine fits tonight at all. The Hall is the build gate; if
  time is short, ship the Hall and leave the machine as its own step.

## Feedback signal

1. Gate D's zero-alarm scenario (Step 4), run to its end, produces one
   Hall record of the stealth kind naming both players; an ordinary
   scuffle produces none (control); the same theft repeated straight away
   hangs no second pedestal unless it beats the first (control).
2. The record appears on a pedestal in the gallery for both players, with
   its picture, its kind, the players' names and at least two stats taken
   from the event's own data, and is still there after the Hall is fought
   in.
3. `npm run gates` reports gate E as passing.
4. The machine: a scripted player gets in, drives at the roadblock, the
   roadblock breaks, a defender standing at it is launched, debris is
   thrown, and the player gets out again (always a way out).

## Stopping condition

Signals 1–3 pass on `main` and live (4 if the machine was built).
**Budget:** two hours from claiming.

## Owns

The legend detector, Hall records and their display, the machine and the
roadblock; exact paths as `docs/architecture.md` assigns them. Scenarios
are named `step7-*.json`, tagged `"gate": "E"` where they are evidence
for it; gate E counts only when `npm run gates` lists a scenario for each
of signals 1 and 2.

## Taste, for the owner in the morning

Whether the game noticed the right moment; the generated titles; whether
ramming the roadblock earns the "OHH!".

## Decided by the lead (2026-11-23, all `DRAFT:`, each in `docs/decisions-log.md`)

- **All Hall state lives on entities**, because the network replicates
  entities and nothing else: a record is a pedestal entity `hall:<n>`
  (kind `pedestal`, a real heavy body, so it can be hit and thrown);
  the detector's notes are on one bodiless entity `hall:watch`. Budget:
  500 and 800 bytes, since every entity goes to every phone about 20
  times a second.
- **The picture is a redrawn scene** (who stood where, at most ten
  bodies), not pixels.
- **Three episodes:** escape (alert rose, returned to 0, someone still
  standing), last stand (alert rose, every credited player flat), quiet
  theft (goods taken, no call for 8 seconds). Credited: every player in
  the area during the episode. A floor per kind; a repeat hangs nothing
  unless it beats the best of its kind in that place.
- **Read by walking up** (no button); a new legend shows a three-second
  banner that stops nothing.
- **Slice 1's scenarios script the events by hand** (Step 4's systems
  are not on `main`), so none is tagged for gate E. Gate E's scenarios
  are slice 2's, on Step 4's real zero-alarm run.

## Measure

Taken 04:46 UTC at 73e73d2: build and check pass; gates 1 of 6 (A). A
system cannot read the tick's events (no reader on `StepContext`); a
scenario cannot script an event or place a bodiless entity; physics,
the verbs system and `draw/entities.ts` skip an entity whose kind is
not a character kind; `src/server/main.ts` reports the volume and
stores nothing; no Step 4 code is on `main`.

## Briefs

- `handoff-prompts/step-7-b-detector.md`: the detector, the record, the
  two entities, `content/hall/`, scripted scenarios.
- `handoff-prompts/step-7-a-store-and-pedestal.md`: `src/server/store.ts`
  with its own check, then the pedestal's picture, card and banner.
- **Slice 2, not yet written** (waits on Step 1's Gate 2, Step 4's
  slice 2 and Step 3's gallery): wire the store into the server (open
  at start, `restoreHall`, save on `hall-legend`, a `/healthz` field);
  point `content/hall` at the gallery; the real scenarios tagged gate
  E for signals 1 and 2. Then the machine.
  **From Step 1's lead, 04:45 UTC, for that slice:** worlds are per
  room name (the shared one plus `?room=<name>` private ones, made on
  demand and forgotten when empty), so `restoreHall` hooks where a
  room's world is created (where `populateRoom` is called), and the
  save hook goes where the server collects `step()`'s events. Private
  worlds read the same store (the lead's call, `DRAFT:`). My worker
  makes the edit to `src/server/main.ts` itself once Gate 2 is on
  `main`; Step 1's lead messages the commit. `/healthz` may gain one
  additive field. **From Step 4's lead:** `ctx.events` comes from its
  slice 1 worker (about 05:20 UTC); `alert-changed` and the calls with
  slice 2 (about 06:45 to 07:15 UTC); the witness field of `deed` is in
  `docs/mechanisms/npc-response.md` when that lands.

## Reviews

- **The store, 7d101dd, reviewed 04:55 UTC: sound.** Full depth, because
  it holds the owner's lasting records. I re-ran `node
  scripts/check-store.ts` (13 pass), build and check; watched a control
  of my own fail (a write in place instead of by rename: 4 checks named
  it); and ran three cases its script does not have (a file naming the
  wrong collection is set aside; no directory and an unusable path both
  give an in-memory store). **Not verified:** the real Railway volume,
  since nothing opens the store there until slice 2. Owed, for slice 2:
  hook `check-store` into `scripts/check.ts` (one line, Step 1's file);
  `CLAUDE.md`'s "Nothing is persisted" becomes false at wiring (flagged
  to the orchestrator); **two worlds share one store, so two worlds can
  each number a new record the same `n`**: the server, not the world,
  must give a record its lasting number when it saves, and `restoreHall`
  must not throw on a duplicate.

- **The pedestal's picture, card and banner, 4820c43, reviewed 05:00
  UTC: light pass only.** It is one self-contained drawing file and
  one line in `render.ts`, and draws nothing while no pedestal exists,
  so I read the diff and re-ran build and check. **Not verified by me:**
  how it looks. The worker saw it only on hand-made records with a
  stand-in pedestal; I look at it myself (phone-sized screenshots) once
  slice B's real records and words are on `main`. Owed, for slice 2:
  `Components.hall` gains `lasting?: boolean` and the server sets it
  false on every pedestal when the store is in memory (the card's "Not
  saved" line reads it); `render()` is not given the local player, so
  anyone at a pedestal opens the card on every screen in that room
  (ask Step 1's lead what Gate 2 gives `render()`); check the banner
  does not announce old records when the network delivers the world
  late or again after a reconnect; check `content.hall`'s field names
  match what `draw/hall.ts` reads (`kinds[id].name`,
  `stats[id].label`).

## Open with the owner

- Q-011 (lasting storage): answered by the owner's own action,
  2026-11-23; see "Records are kept on the volume the owner added" above.

## Handoff notes

### 2026-11-23 08:35 UTC, Step 7 lead (session_017WiGzF4QGboHBQtunwprhk): held by the orchestrator

**Step 7 is held** (orchestrator, 08:30 UTC): every session was stopped
by the account's shared usage limit from about 04:58 to 08:20 UTC, and
the allowance until 13:20 UTC goes to what makes the game playable on a
phone. Do not relaunch workers until the orchestrator releases the step.

**On `main` and reviewed** (see "Reviews"): the store
(`src/server/store.ts`, `node scripts/check-store.ts`), the pedestal's
picture, card and banner (`src/client/draw/hall.ts`), the record shape
(`src/sim/hall/record.ts`, a5c98c3). None of it changes what a player
sees yet: nothing makes a record and nothing opens the store.

**Not on `main`:** the detector (slice B,
`handoff-prompts/step-7-b-detector.md`, worker
session_017WiGzJNvq96pjtVZnaRP9N, stopped by the limit nine minutes in;
asked at 08:35 to push anything green and stop). Its brief is current:
it carries Step 4's confirmed event names. Two things told to that
worker by message only, to fold into the brief before relaunching:
`restoreHall` must never throw on duplicate or missing numbers and
should return what it skipped; the content fields must be
`content.hall.kinds[id].name` and `content.hall.stats[id].label`
(what `draw/hall.ts` reads), and `Components.hall` gains `lasting?:
boolean`; a quiet theft counts only when the `deed`'s `witnesses` is
empty.

**The detector's unfinished work is saved, not lost** (the worker's
own report at f2a80cd; **I have not re-run any of it**):
`handoff-prompts/step-7-b-working-copy.patch`, 25 files against
a5c98c3, `git apply` then re-fit to what has landed since. It reports 7
of 9 `step7-*` scenarios passing (escape, scuffle, same feat twice,
solo, quiet theft, theft noticed, restored). Failing: `step7-last-stand-lost`
(the picture is empty: the capture when the alert rises does not happen
on the tick trouble opens; `rose`/`shot` in `detect.ts`) and
`step7-hall-is-full` (the scenario's own numbers: 29 against a stored
30). Not done: the three message-only items above; every failing
control; the byte measurements; `docs/architecture.md`,
`docs/mechanisms/scenarios.md`, `docs/deliberate-designs.md`, the
decisions-log entries (floors, weights, titles, which pedestal leaves a
full floor); the mechanism doc (add to the existing
`docs/mechanisms/hall-of-legends.md`). Its flag, unverified:
`scripts/trace.ts` calls `feet()` on every entity and may throw on the
bodiless `hall:watch`; `scripts/` is Step 1's, so settle it with that
lead. Add "start from the patch" and these to the brief before
relaunching.

**To resume:** relaunch slice B from its brief (fresh session, canonical
spawn call), review it, then write slice 2 from "Briefs" and "Reviews"
above (wiring, the owed items, real gate E scenarios; when the wiring
edit touches `store.ts`, its paste comment should also say worlds are
made per room name on demand and all read the one store). Slice A's
brief can be deleted: both parts shipped and were reviewed. The machine
is untouched.
