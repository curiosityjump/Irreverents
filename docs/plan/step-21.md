# Step 21 — What being beaten costs

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**Owner (Drive, doc 11, D-019, D-081):**
> D-019 Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.
>
> D-081 Like Kirby, taking DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried items. …

Today a beaten hero lies flat for three seconds and gets up where they fell,
having lost nothing, because there was nothing to lose. It also answers Step
18's open question (what happens when enemies win) by default. From
`docs/plan/core-loops.md`, section 7.

**Owner, 2026-11-23 ~23:52 UTC, playing the live game, first-hand (relayed by the orchestrator):**
> Also, i seem to be invincible as hero...

## Goal

A player can see they are in trouble, and losing costs something real that
opens play. The party's faces sit at the top-left; yours changes as you take
blows, and at the edge your hero staggers. Go down in a bad guys' place while
one of them can reach you and he stands over you for a beat (a friend hitting
him stops it), then you are thrown out of the place's doorway: flat for three
seconds, then free. The power you carried is back where you fell; a prize in
your hands is back on its stand. What you broke stays broken and what you
found stays found: walk straight back in. In town, beaten by guards under an
alert, you are thrown into the open courtyard with the alert unchanged and the
chasers walking out after you.

## The signal (re-runnable)

- Scenarios `step21-*` in real rooms: beaten in the camp, thrown out to the
  courtyard, up and able to act, the camp's broken post still broken (control:
  the place switched off, the hero is still inside); a friend's hit stops it
  (control: no friend; a bandit's stray hit does not stop it); the power is
  left behind and the prize is back on its stand, not banked; knocked out in
  the cantina's brawl with a power: still held; in town under an alert, thrown
  to the courtyard, the chasers follow by the same door and after 20 s the
  alert is still up while a guard has the hero in sight (control: alert 0, no
  throw).
- A real-server check with two connections: the beaten player's own page is
  in the landing room and in charge of its body again after the
  acknowledgement (control: the place switched off). It is the `move`
  effect's first run through a browser page (`docs/mechanisms/network.md`).
- `npm run e2e`, a phone-sized page by touch: walk to the camp's fighters
  (past column 20: a hero at column 15 is never touched, by the check's
  measure), then stand; the drawn condition goes fine, hurt, down; then the
  page's room is the courtyard and the stick moves the hero.

## Stopping condition

The signal passes on `main` and live.

## What's decided

- The owner's D-numbers above; D-021 (crowds can overwhelm), D-080, D-082,
  D-088. S-007: no hard game-over. Doc 07, "Consequences that create
  gameplay": "additional combat, confiscation, reputation change, temporary
  exclusion, intensified defenses or an invitation to escape ... consequences
  must be legible and real". G-16: "neither meaningless instant reset nor
  permanent broken save". Doc 18: recovery time must not become the
  difficulty.
- O-006 (defeat and recovery) is OPEN: everything specific below is a logged
  `DRAFT:`, listed under "Decisions made on the owner's behalf".
- Never a reload, never held: free the moment they land; a place with no named
  landing spot throws nobody; one switch per place turns it off, which is
  today's behaviour. No digits.
- D-067, D-068, D-076, D-077: a transition never resets pursuit. Being beaten
  must never be the quickest way to end a chase or leave a heist.

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 21")

- Thrown out, and where: a content kind `content/defeat/<place>.json` (which
  rooms, where a beaten hero lands, the beat before it, on or off, whether
  pursuers follow). Every landing spot is one room away at most.
- A face in three states, not hearts (the approved HUD sheets also draw
  hearts; Step 2's hidden toughness was a `DRAFT:`, not an `INTENT:`).
- The seize is cancelled only by a played body's hit: bandits flatten each
  other constantly (seven times in a measured minute).
- A power is not lost in the cantina's brawl (D-086's own open list includes
  rare gear in a brawl); a found piece is never lost (doc 30 part D with
  D-082, a proposal): each one data switch from the other answer.

## To settle before its brief

- It needs, on `main`: the powers slice's knock-loose push
  (`handoff-prompts/loop-powers.md`, push 3), the heist slice's cargo and its
  put-it-back function (`handoff-prompts/loop-heist.md`, push 4), and the HUD
  plate (`loop-heist.md`, push 2).
- The face reads the hero's wear, which is in the server's `c`; a page does
  not get the server's `c` for its own character. It must come from the
  snapshot's copy, passed into `render` from `src/client/main.ts`: name that
  edit in the brief, behind the hit-prediction builder's work there.

## Open (for the owner, by playing; nothing waits on them)

- Is being thrown out the right cost, or should it sting more?
- Faces, hearts, or nothing on screen at all?

## Owns

New files: `content/defeat/**`, `src/content/kinds/defeat.ts`,
`src/sim/systems/defeat-*.ts`, `src/client/draw/condition.ts`,
`scenarios/step21-*.json`, `scripts/checks/step21-*.ts`,
`scripts/e2e/defeat.ts`; an entry and table row in
`docs/deliberate-designs.md`. Agreed small edits: the snapshot's copy of the
viewer's hero passed to `render` (`src/client/main.ts`), one line in
`src/client/render.ts`. It edits nothing of the powers, heist or rescue
slices and nothing of Step 18's.

## Briefs

None yet. **Waits** for the three pushes named above. The orchestrator writes
its brief from this file and `docs/plan/core-loops.md`, section 7.

## Builder notes

### Push 1 (measure, at 35ee868): how often a hero is beaten today

A throwaway driver in a scratch copy (never committed) ran the real sim on
the real rooms with their placements, solo, one hero at a time. The hero
walks in (camp: to column 23, among the fighters; street: to column 32) and
walks back there whenever knocked more than three tiles away, so it stays
in the fight. Camp: the 90 s window starts at the wave's `outpost-wave`
event (wave 1, 2 or 3 of a natural run: the lookout's calls). Street: the
alert is raised to 1, 2 or 3 by `completeCall` (as the street guard) at the
hero's feet when it arrives, and the window starts there. Three ways of
playing: never strikes; strikes every 0.4 s facing the nearest foe; strikes
every 2 s, facing the wrong way every other strike. After the window the
hero runs (jumping) for the place's door (camp `to-courtyard` by Use; street
west by `to-throne-room`) for at most 40 s.

Each cell: seconds from the window's start to the first `flattened` (— for
never) / how many `flattened` in the 90 s / the longest stretch with no
control (`canAct` false, ticks in a row) / seconds to leave by the door
("out already": a blow had carried the hero out of the street by its east
door during the window; "no": never left in 40 s; "not reached": that wave
never came, because the hero was flattened over and over and the callers
were busy fighting).

| place | level | hero | never strikes | strikes every 0.4 s | strikes every 2 s, half wrong way |
|---|---|---|---|---|---|
| camp | wave 1 | grappler | 8.4 s / 10 / 3.4 s / 6.5 s | — / 0 / 0.8 s / 4.5 s | 18.6 s / 6 / 3.4 s / 4.5 s |
| camp | wave 1 | infiltrator | 2.9 s / 14 / 4.1 s / 2.8 s | 11.3 s / 3 / 3 s / 3.1 s | 2.9 s / 15 / 4 s / 3.1 s |
| camp | wave 1 | flyer | 2.9 s / 11 / 4.2 s / 4 s | — / 0 / 0 s / 4.7 s | 2.9 s / 13 / 3.6 s / 5.7 s |
| camp | wave 1 | brawler | 4.7 s / 9 / 3.1 s / no | 12.7 s / 2 / 3 s / no | 15.5 s / 5 / 3.1 s / no |
| camp | wave 1 | skirmisher | 2.9 s / 18 / 3.8 s / 5.1 s | — / 0 / 0 s / 3.1 s | 2.9 s / 14 / 7.6 s / 4.1 s |
| camp | wave 2 | grappler | not reached | — / 0 / 0.8 s / 4.9 s | 8.2 s / 6 / 3.4 s / 4 s |
| camp | wave 2 | infiltrator | 5.5 s / 13 / 4.1 s / 2.3 s | 1.4 s / 3 / 3 s / 3.1 s | 8.7 s / 15 / 4 s / 2.3 s |
| camp | wave 2 | flyer | 0.9 s / 17 / 3.9 s / 11.2 s | — / 0 / 0 s / 4.9 s | 1.6 s / 13 / 3.6 s / 7.7 s |
| camp | wave 2 | brawler | 4.4 s / 9 / 3.8 s / no | 13.4 s / 3 / 3.2 s / no | 2 s / 2 / 3 s / no |
| camp | wave 2 | skirmisher | 1.1 s / 3 / 3 s / 3.2 s | — / 0 / 0 s / 4.2 s | 7 s / 15 / 7.6 s / 7.9 s |
| camp | wave 3 | grappler | not reached | — / 0 / 0.7 s / 4.9 s | 21.9 s / 7 / 3.5 s / 5.8 s |
| camp | wave 3 | infiltrator | 4.6 s / 11 / 4.5 s / 10 s | 8.6 s / 2 / 3 s / 2.9 s | 6.3 s / 16 / 4 s / 3.3 s |
| camp | wave 3 | flyer | 2.1 s / 16 / 4.5 s / 8.9 s | — / 0 / 0.1 s / 4.9 s | 2.2 s / 13 / 3.6 s / 4.5 s |
| camp | wave 3 | brawler | 1.4 s / 10 / 3.8 s / no | 37.5 s / 1 / 3 s / no | 13.3 s / 1 / 3 s / no |
| camp | wave 3 | skirmisher | 5.6 s / 15 / 3.7 s / 5 s | — / 0 / 0 s / 4.2 s | 3.5 s / 15 / 7.6 s / 2.9 s |
| street | alert 1 | grappler | — / 0 / 0 s / 6.4 s | — / 0 / 0 s / 6.5 s | — / 0 / 0 s / 6.4 s |
| street | alert 1 | infiltrator | — / 0 / 0 s / 3.9 s | — / 0 / 0 s / 4.3 s | — / 0 / 0 s / 3.9 s |
| street | alert 1 | flyer | — / 0 / 0 s / 5.8 s | — / 0 / 0 s / 5.9 s | — / 0 / 0 s / 5.8 s |
| street | alert 1 | brawler | — / 0 / 0 s / 7.7 s | — / 0 / 0 s / 7.7 s | — / 0 / 0 s / 7.7 s |
| street | alert 1 | skirmisher | — / 0 / 0 s / 4.2 s | — / 0 / 0 s / 5 s | — / 0 / 0 s / 4.2 s |
| street | alert 2 | grappler | 12.8 s / 5 / 3.5 s / 7.3 s | — / 0 / 0 s / 6.3 s | 26.4 s / 6 / 3.1 s / 7.3 s |
| street | alert 2 | infiltrator | 10.8 s / 2 / 3 s / out already | — / 0 / 0.3 s / 4.3 s | 11.2 s / 3 / 3.5 s / out already |
| street | alert 2 | flyer | 7.3 s / 7 / 3.8 s / out already | — / 0 / 0 s / 5.8 s | 10.8 s / 12 / 3.5 s / 7.7 s |
| street | alert 2 | brawler | 13.9 s / 5 / 3 s / 8.7 s | — / 0 / 0 s / 6.6 s | 35 s / 3 / 3 s / 10.7 s |
| street | alert 2 | skirmisher | 6.8 s / 2 / 4 s / out already | 72.6 s / 1 / 3.4 s / 5 s | 10.4 s / 11 / 3.8 s / 5.2 s |
| street | alert 3 | grappler | 13.1 s / 6 / 3.4 s / 7.3 s | — / 0 / 0 s / 6.3 s | 22.3 s / 5 / 3.6 s / 6.4 s |
| street | alert 3 | infiltrator | 10.8 s / 4 / 3.8 s / out already | — / 0 / 0 s / 4 s | 11.2 s / 4 / 3.5 s / out already |
| street | alert 3 | flyer | 7.3 s / 8 / 3.8 s / 5 s | — / 0 / 0 s / 5.8 s | 10.8 s / 8 / 3.5 s / 5 s |
| street | alert 3 | brawler | 12.7 s / 6 / 3.4 s / 7.7 s | — / 0 / 0 s / 6.8 s | 23.9 s / 5 / 3.4 s / 7.7 s |
| street | alert 3 | skirmisher | 6.8 s / 11 / 4.2 s / out already | — / 0 / 0 s / 5 s | 10.4 s / 10 / 3.9 s / 5.1 s |

**What it says.**
- **A beating is already possible, and it is not one.** Every hero who
  stands among the camp's fighters, or fights badly, is flattened within
  about 1 to 20 s of a wave and many times a minute (1 to 18); at alert 2
  and 3 in the street, within 7 to 35 s. A hero striking every 0.4 s stays
  up: the grappler, flyer and skirmisher are never flattened in the camp,
  and nobody is in the street; the infiltrator (toughness 80) and the
  brawler (200 but slow, wind-up 0.15 s) still go down one to three times a
  wave in the camp. This differs from the waves builder's measurement
  (`docs/plan/step-7.md:363-367`, nobody knocked down while striking):
  there the hero did not walk back into the fight, here it does, and wear
  carries from the camp's own three fighters before the wave.
- **Alert 1 beats nobody** in the street: its row is empty and the placed
  guard who answers does not fight a hero who has not struck. That is the
  town tiers' design, kept.
- **Escape stays possible.** Every hero that was in the fight left by the
  door within 2 to 11 s of running for it, with at most two blows landing
  on the way, except the brawler in the camp (below).
- **Longest stretch with no control: 3 to 4.5 s mostly, 7.6 s for the
  skirmisher** in the camp (waves 1 to 3, never striking or fighting badly):
  flattened 3 s, up, and launched again before it acts. That is Step 18
  slice B's corner (`docs/plan/step-18.md:352-365`), reported here, not
  fixed; the throw-out takes a beaten hero out of the crowd, so after push 2
  it is bounded by the beat plus `flattenTime`.

**The choice: no tuning change.** The brief's bar ("a hero who keeps
striking well may stay safe; a hero who stands, or fights badly in a third
wave, must go down") is met by today's numbers for all five heroes in camp
wave 3 and street alert 2 and 3, and every hero can still get away. So no
other owner's number is touched and no scenario is re-timed (zero red).
Logged in `docs/decisions-log.md` ("Step 21: no tuning change").

**Flag (not a fix): the brawler cannot get into the Bandit Camp.** From the
spawn and the courtyard door (column 2), the brawler's jump does not clear
the three-tile block at columns 5 to 7 (`content/rooms/outpost.json`, rows
8 to 10): the furthest it reaches is column 3.9 under 200 tries of run-up
and jump timing; the grappler reaches column 19.9 the same way. The brawler
rows above were measured by putting it at column 9. It may be deliberate
(a place only some heroes enter); nobody owns that room file until the
vehicles slice. Sent to the orchestrator; left as it is.

### Push 2 (the rule): stopped before pushing; five other steps' scenarios turn red

Built locally and not pushed (the brief: "If any other step's scenario goes
red, stop and report"): `content/defeat/{outpost,castle-street}.json`,
`src/content/kinds/defeat.ts`, `src/sim/defeat.ts`,
`src/sim/systems/defeat-{seize,throw}.ts` (585, 590), facts `signaler` and
`prize`, scenario `step21-camp-thrown-out` (green: flattened 1009, seized,
thrown at 1068 into the courtyard's camp doorway, up at 1248; the post still
broken; the wave's fighter still inside), and `defeat` added to the room
controls' left-out list (`scripts/lib/room-controls.ts:56`, as each slice
before did).

With it, `npm run check` fails exactly five scenarios of other steps. In
each the hero is knocked flat in the camp or the alerted street while a
fighter or guard stands within reach, which until now was an incidental
three-second nap, and is now a throw-out to the courtyard:

| Scenario | Owner | Thrown out at | What then fails |
|---|---|---|---|
| `step11-chase-blink` | Step 11 (cantina) | 2991, by `street-guard` | `in-room` castle-street at 3000 |
| `step4-tier-away-at-the-most-skirmisher` | town tiers | 3385, by `street-guard` | its run west out by `to-throne-room` at 3605 |
| `step4-tier-cap-holds` | town tiers | 3577, by `castle-street:help1:0` | calls after 3400 (the hero is gone) |
| `step7-caller-tries-again` | waves | 1280, by `camp-fighter-1` | the lookout's later calls and a second wave |
| `step7-waves-reach-the-hero` | waves | 1226, by `outpost:w0:0` | waves 2 and 3 never come (the hero is gone) |

Ways on, for the orchestrator to choose: (a) each owner re-times its
scenario so the hero is not beaten where it does not mean to be (or expects
the throw); (b) a world tuning switch `defeatOn` (default 1, "a control for
the scenarios only" like `outpostSendOn`) does not help, since a scenario
cannot set tuning; (c) the throw only after more than one knock-down in a
row in the place (a data field, `downs`), which keeps a single incidental
nap as it was. My lean is (a): the throw is what Step 21 is for, and these
five were written before it.

Also seen: Step 7's `hall-detect` hangs a "narrow escape" legend on a
throw-out (the hero is gone from the camp with a wave standing, though not
on its own feet). The waves builder's session is inactive; asked through the
orchestrator.

**Landed switched off** (the commit after 7d6cea5): the rule's code and its
two place files are on `main` with `"on": false`, so the game is exactly as
before and `npm run check` is green. The two scenarios that need it on wait
in `docs/plan/step-21-held/` (not run there); move them back to
`scenarios/` and set both files `"on": true` once the five above are settled.

### Push 2, landed on: the orchestrator's (c)

Thrown out only on the `downs`-th fall within `window` (60 s) with a seizer
in reach: the camp 4, the street 2. Measured: the camp's 2 and 3 still turn
`step7-waves-reach-the-hero` red (its hero standing a minute under three
waves falls at 1167, 1801, 2187, 2563...), 4 and 5 keep it and
`step7-caller-tries-again` green; the street's 2 keeps all three town
scenarios green. Both places on; `step21-camp-thrown-out` back in
`scenarios/` (first three falls get up inside; the fourth at 2374, 23 s
after the first, is seized and thrown at 2433). `step21-friend-stops-it`
still waits in `docs/plan/step-21-held/`: with `downs` 4 its timing has to be
found again (next push), as do the other signal scenarios and the Hall's
narrow-escape edit the orchestrator allowed.
