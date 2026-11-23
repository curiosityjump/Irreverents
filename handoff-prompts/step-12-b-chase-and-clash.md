# Step 12, slice B: the chase follows you in, and guards fight the camp

Brief for one cold builder. Written 2026-11-23 16:05 UTC by the Step 12
lead (`session_017WiGzJTXQVCWQYDDmC2UiY`). The step is
`docs/plan/step-12.md` ("What's decided", and slice A's handoff note at
its end). Read `docs/mechanisms/outposts.md` (slice A, live) and
`docs/mechanisms/npc-response.md` ("Calling for help…", "Following
through a door", "Cooling") before code. This slice edits none of Step
4's files.

**Hard stop 17:15 UTC with whatever is green; nothing half-working on
`main`** (a push is the deploy). Pushes in this order, each standing
alone; after each, `send_message` the lead with the commit.

## The task

A guard chasing a hero follows them through the courtyard doorway into
the Bandit Camp. There guards and the camp's fighters go for each other;
neither's mood changes. Only a few guards cross. A hero who gets out of
everyone's sight and waits sees the street's alert fall; a hero who keeps
hitting people in a guard's sight does not. The owner asked for enemies;
this is what makes the camp and the town one world (D-069). Moves no
M-row.

## Measured for you (by the lead: `npm run check` green at c889a47, `npm run e2e` green at a0debfa; tip when written 365a40d)

- **Following through a door exists**: `src/sim/systems/alert-follow.ts`
  (605) sets `c.respond.door = ev.fromDoor` on a `changed-room` for a
  responder who had that hero in sight on that tick; `alert-respond.ts`
  walks them through (`askForDoor()` for an `enter` doorway, which the
  courtyard's `to-outpost` is). **No cap on how many cross.** Responders
  are role `guard`, side of the caller; the street's guard is
  `street-guard` (`content/placements/castle-street.json`, column 40).
  The courtyard has no guard; the chase reaches the camp street →
  courtyard → camp, two doors.
- **Guards cannot swing:** `content/characters/guard.json` verbs are
  `["move"]` only. **Decided 16:16 UTC by the orchestrator (Step 18 wants
  it):** add the real `attack` verb to `guard.json` (additive, `DRAFT:`,
  logged); no clash-only blow. If a `step4-*` scenario goes red only
  because a guard now really hits, don't weaken or re-time it and don't
  push it red: message the lead the scenario names and why (Step 18
  re-times them), and carry on with the rest.
- **Camp people fight heroes only**: `src/sim/systems/outpost-fight.ts`
  (58) targets player characters. Note from slice A: Step 2's attack
  swings on a fresh press, so it pulses `attack` every other tick; copy
  that.
- **Cooling counts only odd deeds**: `alert-cool` (620) restarts the wait
  when a player's deed is *odd* to a witness of the area. A hero hitting a
  bad-side person is *expected* to everyone
  (`content/rules/expectations.json:11`, D-060), so today a wanted hero
  brawling with bandits in a guard's view cools normally. The step wants
  the opposite (D-074; doc 27: "do not attack anyone even in
  self-defense"). Do it from your own system after 620 (e.g.
  `clash-cool`, ~621) that zeroes that area's `c.alert.quiet` when a
  player's `hit` lands while a conscious person of the area sees them —
  never by editing `alert-cool.ts` or the expect table, and never raising
  the level (only `raiseAlert()` raises; `npc-response.md` rule 2).
- Scenario harness, facts, controls: as slice A (`docs/mechanisms/scenarios.md`;
  facts `alert`, `mood`, `event-where`, `in-room`, `people-count`).

## Build (all `DRAFT:` unless marked; log each choice in `docs/decisions-log.md`)

1. **Push 1 — two gaps from slice A** (small, first):
   - `scenarios/step12-fighter-fights-anywhere.json`: an `outpost-fighter`
     placed in a plain test room with no `content/outposts/` file swings
     at a hero in sight (a `hit` event). Control: the widening switched
     off (a tuning switch, or the fighter's body without `attack`),
     watched to fail. Step 16 places these kinds in ordinary rooms.
   - The camp's art: a `ROOM_THEME` entry for `outpost` in
     `tools/art/tiles/make.py` plus its atlas and backdrop data
     (`tools/art/tiles/README.md`). Additive; Step 11 edits that file
     too: `git pull --rebase` right before pushing.
2. **Push 2 — the chase crosses, a few at a time:** a cap on responders
   crossing one door for one chase (`DRAFT:` 2), in your own
   `chase-*` system reading `c.respond.door` after 605 and clearing it for
   the extras (they search where they are). Scenarios:
   `step12-guard-follows-into-camp` (a guard who saw the hero go in by
   the doorway follows; the street's alert is not lower in the camp) and
   `step12-chase-cap` (three responders, two cross; control: cap off,
   three cross). Plus the existing control: a hero who left unseen is not
   followed (copy `step4-leaves-unseen-guard-stays` into the camp route).
3. **Push 3 — sides that meet fight:** `content/hostility.json` (+ its
   kind file), pairs of sides or NPC kinds that fight: tonight the
   guard and the camp's two kinds, **not** Step 4's street villain. A
   `clash-*` system: a person who sees a person of a hostile pair goes for
   the nearest one it sees and swings; moods unchanged; each signaler
   brings only its own side. Then `clash-cool` above. Scenarios:
   `step12-guards-and-camp-clash` (a guard and a fighter hit each other,
   neither's mood changes, the alert rises only by a finished call) and
   `step12-hit-in-view-keeps-alert` (out of sight and waiting, the alert
   falls; control: hitting a fighter in a guard's view restarts the wait).
4. If time remains: `scripts/e2e/outpost.ts` (yours from slice A),
   by touch: stop a caller mid-call; walk out during a wave.

## Traps

- **Determinism**: no `Math.random`, no clock.
- **A responder's home alert** is the area they were placed in
  (`c.npc.home`), wherever the chase leads; don't add a second alert.
- **Walking through a door never changes an alert** (npc-response.md).
- **The camp's people never ask for a door** (`INTENT:` at the
  doorway, D-061): the clash must not walk them out.
- **Step 4's scenarios pin the street's routines by tick**: placing
  nothing new in `castle-street` keeps them green.
- Shared files (`src/sim/types.ts`, `src/sim/systems/physics.ts`,
  `src/client/render.ts`, `content/tuning.json`): additive only, `git
  pull --rebase` before each push, `npm run check` after.

## Out of scope

Step 4's files and scenarios; Step 7's machine (G-09); saving anything;
the look of people (Step 8); the street villain in the clash; Step 16's
quarry.

## Open — the owner's by playing (list in the handoff note, don't ask)

Whether guards and bandits brawling is funny; whether "only two cross"
feels right; how long a hero must hide.

## Verified when

Each scenario with its control watched to fail; `npm run build`,
`npm run check`, `npm run e2e` before each code push; read
`/debug/errors` on the live address first; `npm run check:deployed`
exits 0 after. Commit messages say what you ran and did not verify.

## Done, and where things go

Pushes 1–3 on `main` and live, or the last green push and where you
stopped. Update `docs/mechanisms/outposts.md` (a "Chase and clash"
section) and `docs/architecture.md`'s "I need to add…" row for a hostile
pair; decisions in `docs/decisions-log.md`; a handoff note at the end of
`docs/plan/step-12.md`; delete this brief when done. Blocking question:
`send_message` the lead at once. Flags: `docs/for-the-lead.md`. Final
message: done or blocked, the commit, nothing else.
