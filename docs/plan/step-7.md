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
- **Records must outlive the session at least on the server while it
  runs.** Lasting storage (across deploys, per player) is open in the
  library and needs a decision about a database: don't add one tonight;
  say plainly in the Hall what is and is not kept, mark it `DRAFT:`, and
  file the question.
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
roadblock; exact paths as `docs/architecture.md` assigns them. Queued
behind Steps 3 and 4.

## Taste, for the owner in the morning

Whether the game noticed the right moment; the generated titles; whether
ramming the roadblock earns the "OHH!".

## Measure

## Briefs

## Open with the owner

## Handoff notes
