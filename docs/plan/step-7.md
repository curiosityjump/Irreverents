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

## Open with the owner

- Q-011 (lasting storage): answered by the owner's own action,
  2026-11-23; see "Records are kept on the volume the owner added" above.

## Handoff notes
