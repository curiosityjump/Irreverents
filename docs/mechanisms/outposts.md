# Hostile outposts: a horn, waves, and every way to stop them

**Reference.** Open before touching `content/outposts/`,
`src/content/kinds/outposts.ts`, `src/sim/outpost/`, the `outpost-*`
systems (Step 7 added `outpost-leave`), `src/client/draw/outpost.ts`, or the outpost room
(`content/rooms/outpost.json` and its placements). Built by Step 12, slice
A, 2026-11-23 (`docs/plan-archive.md`, "Step 12").

## Why it exists

The owner (doc 11, D-061): *"Hostile outposts contain visible
CALL-REINFORCEMENTS SIGNALERS. An enemy that DETECTS a player, RECOGNIZES
them as a threat, and REACHES/ACTIVATES a signaler can call a
reinforcement wave. Players can preemptively destroy/disable the
signaler, interrupt the caller, clear the enemies without allowing further
signaling, or ESCAPE THE ZONE."* Doc 24: *"the system must never impose an
arbitrary maximum wave count"*, and crowds are bounded. It is Step 4's
NPC response logic (people, three moods, sight) with one more fixed
machine beside it; nothing here is AI (D-055), and none of Step 4's files
is edited.

## The pieces

| Piece | Where | What it is |
|---|---|---|
| An outpost | `content/outposts/<id>.json` | `room`, `signaler` (the placed id of the horn post), `callers` (placed people who may sound it), `entry` ([column, row] where waves walk in; not a door), `bound` (most people in the room at once), `callTime`, `callAgain` (seconds), `breakHits`, `breakSpeed` (px/s), `waves` (rows of `{ character, npc }`, and optionally `rides`, a machine id: Step 20, that person walks in at the reins of one, `docs/mechanisms/machines.md`); optional (Step 7, left out = as before): `tryAgain` (true/false), `leaveCold`, `leaveIdle` (seconds; 0 = never). The validator names file and field; the cross-check refuses a room, post, caller or kind that does not exist. |
| The horn post | a placed body, e.g. `signal-post` | Verbs `["body"]`, weight 1000 (the most a body may be: a hit barely moves it), toughness 0 (never knocked out). A body, not a `things` entry, because only bodies can be hit or have things thrown into them. |
| The camp's people | `content/characters/outpost-*.json`, `content/npcs/outpost-*.json` | Step 4's people: side `bad`, three moods. The fighter's body lists `attack`; the lookout's lists `body` with toughness 30, so one good blow stops a call. |
| The numbers | `content/tuning.json` `world` | `outpostCallReach` (12 px), and three switches for the scenarios' controls, `outpostZoneEndOn`, `outpostBoundOn`, `outpostSendOn` (all 1). |

## State: all on entities

Declared in `src/sim/outpost/state.ts` (declaration merging):

- `c.signaler` on the post: `hits`, `broken`, `sounding` / `of` (ticks
  of the call being sounded, for the page), `queued` (finished calls
  whose wave has not walked in), `sent` (waves so far: the next row and
  the next ids).
- `c.outpostCall` on a caller: `phase` (`idle`, `going`, `sounding`),
  `progress`, `wait` (after a finished call), `done` (stopped by a
  knock-out or a grab: never calls again, unless the outpost has
  `tryAgain`), `stall`, `seen` (Step 7: where they saw a hero during this
  call).
- `c.signaler` also has (Step 7) `seen` (the last finished call's
  sighting, which the next wave is told) and `rest` (ticks before any
  caller may go, with `tryAgain`). New fields are read with a default.
- `c.outpostFight` on a person of the outpost: where a hero was last
  seen, or null. A wave's people start with it set to their caller's
  sighting (Step 7).
- `c.outpostWave` (Step 7) on a wave's person of an outpost with
  `leaveCold`/`leaveIdle`: `cold` (ticks out cold so far), `idle` (ticks
  in a row with nobody to fight; while leaving, ticks with no headway),
  `going`.

A wave's people are spawned bodies (`spawnBody`) with ids
`<outpost id>:w<wave>:<i>`, deterministic, and given `c.npc` with `home` =
the outpost room (there is no placement entry; with none, mood 1's
routine is standing still). The network copies them with no network code.

## The systems, in order

| Order | System | Does |
|---|---|---|
| 57 | `outpost-call` | A caller not out, not held, who `canSee`s a hero, walks to the post (within `outpostCallReach`), then sounds it for `callTime`, holding still. Overlays `c.input`. |
| 58 | `outpost-fight` | Any person of the `bad` side whose body lists `attack`, in any room (`DRAFT:`, widened for Step 16's rooms), who sees a hero walks at where they saw them and swings in `npcChargeReach` (a fresh press every other tick; the attack's own cooldown sets the pace); losing sight, goes to the last place seen and stands. **The chase (2026-11-24, `DRAFT:`):** a kind with `search` in `content/npcs/` (the fighter, the heavy, the brute) instead goes on `c.outpostChase` `{ phase, dir, ticks, from, stall }`: `chasing` (walking at the last place seen; a step or wall that stops him 45 ticks counts as arrived), `searching` (on `search.on` px the way the hero was seen going, never into a walk door, then turning every `search.turn` s until `search.time` is up), `returning` (to his placement's column; a wave's person, with no placement, just stops). Seeing a hero at any step starts `chasing` again. Proven by `chase-jump-over-turns` and `chase-lost-goes-back` in `test-chase`; e2e `chase-comes`, `chase-goes-back`. Callers going to call are left alone. Mood stays 1 (D-060: business as usual). **Who they fight** is the NPC kind's `fights` (Step 18): `on-sight` (left out) is any hero seen; `when-struck` (the villain) keeps only heroes in the person's `c.struck`, written by `fight-struck` (101), and still only one it sees. **A new fighting kind keeps the way out** (`INTENT:`, `docs/deliberate-designs.md`): no `jump` in its body, and a `runSpeed` below the slowest hero's 76. |
| 59 | `outpost-wave` | Walks queued waves in at `entry` while the room's people plus the wave fit under `bound`; otherwise the wave waits. Each of a wave's people starts walking to where the caller of the last finished call saw a hero (Step 7; `outpostSendOn`). |
| 61 | `outpost-leave` | Step 7, only for outposts with `leaveCold`/`leaveIdle`: a wave's person who has lain out cold `leaveCold` seconds in all, or stood `leaveIdle` seconds in a row with nobody to fight, walks back to the entry once up and is removed there (`outpost-left { outpost, entity }`); one who makes no headway for 1.5 s is removed where they stand. Placed people never leave. |
| 540 | `outpost-signaler` | After physics and `impact-bodies` (520): each `hit` on the post counts one; `breakHits` of them, or one `impact` naming the post as `other` at `breakSpeed` or more, breaks it. |

Events: `outpost-call-started { by, outpost }`, then
`outpost-call-completed { by, outpost }` or `outpost-call-stopped { by,
outpost, why }` (`knocked-out`, `grabbed`, `signaler-broken`, `no-hero`,
`left-the-signaler`: knocked away from the post while not out, or a post
they could not walk to); `outpost-wave { outpost, wave, row, people }`;
`signaler-broken { outpost, signaler, by }`; `outpost-left { outpost,
entity }` (Step 7).

## The owner's rules, at their sites (`INTENT:`)

1. **Seeing is not calling** (D-063, D-070): only a finished call brings
   a wave; the caller has to walk there and stand there, and can be
   stopped on the way or while sounding.
2. **One player can stop it every way D-061 lists:** unseen (the ledge;
   sight is Step 4's), knock out or grab the caller (`DRAFT:` they never
   call again; with `tryAgain`, as at the camp since Step 7, it buys
   time: they try again once up), break the post (a hit or a throw, **no
   new button**, D-093; the real stop), or walk out.
2a. **A wave is told only its caller's sighting** (D-065, Step 7): the
   caller keeps where they saw a hero, under `canSee`, during the call;
   the wave walks there; from there `outpost-fight` reads heroes only
   under `canSee`.
3. **No cap on waves, a cap on bodies** (doc 24): the last row repeats for
   ever; `bound` counts people (bodies with `c.npc`, out cold or not), never
   the post or a hero.
4. **Escape the zone** (D-061): with no player's character in the room, a
   call being sounded stops (`no-hero`), queued waves are dropped and
   nothing new starts; the people there stay. The room's only way out is
   an **enter** doorway, which a body goes through only by asking, and
   nothing of the camp ever asks: no fight can shut it, and the camp stays
   in its room.
5. **The outpost's call is not Step 4's alert.** It never calls
   `raiseAlert()`; Step 4's `npc-call` stays good-side only (`DRAFT:`,
   docs/decisions-log.md).

## On screen (`src/client/draw/outpost.ts`, `DRAFT:`)

After the bodies: a horn hung on the post (working); raised and shaking
with a bar filling over it (sounding: the time left to stop it); a
splintered top with the horn on the ground (broken). The looks
`signaler`, `signaler-sounding`, `signaler-broken` replace the shapes when
present (`docs/mechanisms/art-pipeline.md`). The page's debug record has
`drawn.signalers: { id, state }[]`, from what was drawn.

## The rooms

- **`outpost`** (the "Bandit Camp", 88 columns since Step 20 (its run east, the section below), reached by the `to-outpost` enter
  doorway in the courtyard, ground row 7, column 23): the doorway at
  column 2, a step three tiles high (columns 5-7) every way in crosses (with a one-way tile at column 4, row 9 since Step 20, a half-height stair for the brawler, whose jump does not clear it: `step20-camp-every-hero-gets-in`; and its mirror at column 8, row 9 since 2026-11-24, so every hero walks back out, `INTENT:`: `camp-entries-every-hero-walks-out`),
  and a hop from it to a one-way ledge at row 6, columns 9-38, the high way
  across (five tiles up: out of the lookout's 40 px of sight). Under it
  the lookout at column 18 (watching west, glancing back), the post at 20,
  fighters at 25 and 28; waves at column 41.
- **`quarry-depot`** (Step 16 slice 3, `DRAFT:`; the room is slice 1's, `docs/mechanisms/rooms-and-doors.md`): the lookout (column 11, looking east 3 s then west 4 s) and the horn post just behind it (12), five tiles in from the walk door from the tower, the only caller; patrol 1 walks 11-13; a hiding place `depot-door-hide` just inside the door (columns 1-2), and nobody sees a hero standing inside the door (`step16-door-unseen`); a heavy guard at the strongroom's front (34) walks in to 40 now and then; patrol 2 walks the far yard (54-61); the hoard is a `things` take at column 45. Waves walk in at column 61. **Unlike the camp, this room has two walk doors** (`to-tower`, `to-pit`) on its west edge; nobody's walk uses columns 0-2, and measured: a fighter chasing a hero it knocked out through `to-tower` stops at column 1 and does not follow, but a body punched or thrown into the door's tiles is carried through it (a patrol punched by the grappler lands in the tower). `step16-zero-alarm-roof` (the flyer, over the roof) and `step16-zero-alarm-ledge` (the grappler on foot: the high ledge over the west stretch, then a shelf inside the strongroom over the guard's inner stand while it walks back under) are the quiet ways; `step16-caught-fight` (a held patrol thrown at the lookout mid-call breaks the horn too) `step16-caught-escape` (the grappler, out by the tower door) and `step16-caught-escape-cave` (the flyer with the hoard, down the one-tile hole at column 23 into the cellar, out by the pit into the cave) are getting caught. Since Step 22 push 5 the hole also leads up: a one-tile step under it (row 17, column 23, the hole's foot widened at row 15) lets a small hero climb from the cellar into the middle stretch, and from there one-way steps (columns 25-28) and a plank (row 8, 29-35) reach the roof, and a gantry (row 9, 48-60) runs over the far yard into the stage's end: the stage's quiet way (`step22-unseen-clear`). A body under 16 px wide that walks east into the step at columns 24-25 falls into that hole (onto that step, then off it): no routine walks there (patrol 1 turns at column 13, the guard at 34), but a fighter chasing a hero there can.
- A camp fighter seated at a machine's reins (`c.seat.driver`) is skipped by `outpost-fight` altogether (vehicles B's ask, 2026-11-24): he neither swings nor searches from the seat; pulled out, he fights like anyone.
- **`test-chase`** (2026-11-24): a doorless check room, one camp fighter at column 16 watching west, the spawn six tiles in front, a step and a high ledge at the west end (out of his sight).
- **`test-outpost`**: the doorless check room (no player reaches it):
  floor, a low platform in the lookout's sight but out of reach, a spawn
  behind the lookout's back. Its outpost has two one-fighter rows and a
  `breakSpeed` above any launch, so its scenarios keep the ways apart.

## Checking it

`scenarios/step12-*.json`, no gate tag, each with a control watched to
fail (named in its `proves`). The `people-count` fact counts a room's
people on every tick of a range. Traps: a recorded tick shows the world
before that tick's step (a wave spawned at tick N is in history from
N+1); at tick 0 nobody has `c.npc` yet (`npc-setup` runs on the first
step); the lookout is placed facing right and turns on its first tick, so
a hero east of it within sight at tick 0 is seen.

## Adding one

See `docs/architecture.md`, "How to add an outpost".

## Chase and clash (slice B)

**The chase crosses, a few at a time (`chase-cap`, 606, `DRAFT:`).** Step
4's `alert-follow` (605) gives every responder who had a hero in sight on
the tick they left `c.respond.door`. `chase-cap` keeps that door for the
nearest `chaseCrossCap` (tuning `world`, 2) of them, by distance to the
door, ties by id, and sends the rest to search where they stand (D-065:
they learn nothing more). Per hero, per door: going back out and in again
is a new chase. The street's guard follows a hero seen all the way from
the castle street through the courtyard and up into the camp, and the
street's alert is unchanged there (`step12-guard-follows-into-camp`,
control `chaseCrossCap` 0); a hero who got out of sight first is not
followed and the alert cools (`step12-unseen-not-followed-to-camp`).
Not checked by a scenario: three responders with two crossing. Rooms
joined by doors must be reachable from the start (`check-rooms.ts`,
`INTENT:`), so a test room cannot hold a door, and the real route has one
guard.

**Sides that meet fight (`clash-fight`, 59, `DRAFT:`; D-069).**
`content/hostility.json` (kind `src/content/kinds/hostility.ts`) lists
pairs of sets of people by `content/npcs/` `role` and/or `side`, with
`notRoles` to leave some out; tonight guards against every bad-side person
but Step 4's street villain. A person whose body lists `attack`, who is not
calling and sees no hero (a hero comes first), walks at the nearest hostile
person it sees and presses attack the first tick in reach and every other
tick after (whoever closes first swings first). Moods never change: a hit
between two people has no row in the rules, so no witness is troubled and
nobody calls; the alert rises only by a finished call. Nothing here asks
for a door, so the camp stays in its room. A guard's body does not list
`attack` yet (Step 18: three `step4-*` scenarios are pinned to guards
that cannot hit), so tonight a guard who meets a fighter stands and is hit
(`step12-guards-and-camp-clash`, control: no pairs).

**Hitting in a guard's view keeps a hero wanted** with no code of this
step: `alert-cool` holds the wait at 0 while any conscious person of the
area sees any hero, so a hero hitting anyone in a guard's sight is seen.
The brief's `clash-cool` would have changed nothing and was not added.

## Step 7: waves that really come (`DRAFT:`, docs/decisions-log.md "Step 7: waves")

Measured before (brief `loop-waves.md`): in the real camp, waves after the
second never came (everyone who ever walked in stays, so the room sat at
its bound), the ones who came stood at the entry, and one hit on the only
caller ended the calls for that game. Now, at the camp only
(`content/outposts/outpost.json`; the depot and `test-outpost` leave the
new fields out):

- `callers` are the lookout and fighter 1 (not fighter 2: Step 19's camp job, `step19-camp-clean-control` and the `step19-heist` check, counts on fighter 2 seeing the thief without calling; the brief asked for both); `tryAgain`: one goes
  for the horn at a time, nobody goes for `callAgain` after any call ends,
  and a caller stopped mid-call tries again once up.
- `leaveCold` 5, `leaveIdle` 10: beaten waves walk off, so the waves keep
  coming under the bound of 8.
- Rows: 1 fighter; 2; a fighter and the `heavy-fighter` (the new toy),
  the last row for ever (3 placed + 1 + 2 + 2 = 8, so three waves always
  fit even before anyone leaves).
- `breakSpeed` 450 (was 300): a grappler's punch flings the lookout at
  about 350, and an ordinary grappler fight broke the post by accident
  within 15 s; a thrown body (520) still breaks it at once.

Measured at the camp with these numbers (scripts in the scratchpad, 90 s,
the hero striking east every 0.4 s from column 13-14, not walking up to
the post): the infiltrator reached the third wave at 52 s, the flyer at
23 s, the grappler at 59 s; none of the three was knocked down once while
striking like that, and they felled 15 to 24 of the camp. A hero who never
strikes is knocked flat in about 20 s. Where a wave comes to rest is
wherever the hero was seen (and, after 10 s with nobody to fight, the
entry, where it is gone), never a fixed spot.

**The depot (`quarry-depot`).** Step 22 push 1 gave it the camp's
`leaveCold` 5 and `leaveIdle` 10, so a wave with nobody to fight walks off
and the next fit under the bound. Since the Step 22 depot push (`DRAFT:`,
docs/decisions-log.md "Step 22: the depot's waves come in from the sides")
it has `entries` on every stretch of the yard, `[[13,13], [20,13], [33,13],
[40,13], [49,13], [55,13], [61,13]]`, `entryAway` 6 and an `announce` row:
the yard is cut by the stack (14-17), the shaft (42-44) and the dip (51-52),
and no person jumps, so a wave walks in on the hero's own stretch and never
has to cross a gap (before, every wave walked in at column 61 and dropped
into the pocket under the dip). There is no entry by the west door: at
[2, 13] a wave fighter walked out through the tower door, and at [4, 13] one
landed on a hero seen at column 5. The kerb at [53, 13] (Step 7's third fix)
is not needed with these entries and is not placed. Proven by
`step22-wave-reaches-hero` (control: no `entries`, no wave body comes near
the flyer); `step16-caught-fight` was re-routed for it (the grappler waits
out the wave on the high ledge at columns 5-6, every claim kept).

Scenarios: `step7-waves-reach-the-hero`, `step7-waves-reach-the-hero-depot`,
`step7-caller-tries-again`, `step7-post-ends-it`; the `people-at` fact
counts a room's people by id prefix and span of feet. Re-timed:
`step12-waves-never-pass-bound` (a one-tile block on the floor keeps the
waves off the hero's platform) and `step12-walk-out-ends-it` (the walk
out is during the second call).

## Step 20: the camp's run (`DRAFT:`, docs/decisions-log.md "Step 20: the camp's run")

Since push 2 the ram wagon `camp-wagon` stands empty on the entry step (columns 5-7), facing east (`docs/mechanisms/machines.md`, "In the Bandit Camp"). It is a body nobody plays and not a person: it counts toward no `bound`, and every camp scenario ran unchanged with it there.

`content/rooms/outpost.json` is 88 columns now (was 44); nothing west of the
old east wall (column 43) moved, and every `step12-*`, `step13-*`,
`step19-*` and `step7-*` scenario passed with no re-time. East of it, on the
floor: the light barrier `camp-light-barrier` (column 47, 2 tall,
`breakSpeed` 200, look `fence`), the crate `camp-crate-1` (51), stalls
`camp-stall-1` (55-56) and `camp-stall-2` (64-65) (2 tall, 150, `stall`),
the timber barricade `camp-barricade` (75, 4 tall: no hero jumps it; 300,
`barricade`), the cache `camp-cache` (79, a second prize of
`content/heists/camp.json`), and a 3-tall step at 84-86 against the east
wall. A second one-way ledge on row 6, columns 41-82, starts two tiles past
the first one's end (39-40 is a hop): the quiet way runs along it and off
its east end onto the step, down into the cache, and back out up the step
and a hop onto the ledge (the entrance's shape mirrored). The camp's
fighters cannot jump, so the 2-tall pieces stop a chase that a hero hops.
Waves still walk in at column 41, now mid-room (flagged in the step's notes).
Scenarios: `step20-camp-run-breaks-through` (a wagon at speed through it
all; control: the barricade's `breakSpeed` 400, it holds) and
`step20-camp-quiet-way` (infiltrator), `-grappler`, `-flyer` (no call, no
barrier broken, the cache taken unseen, out by the doorway, a clean
getaway; control: the floor way, a call starts).

## From the sides, stronger each time (2026-11-24, `DRAFT:`)

The owner, playing: *"Alarms should spawn more enemies of increasing
strength that come in from the sides."* Optional fields in
`content/outposts/<id>.json` (left out, an outpost behaves as before):

- `entries`: `[[column, row], ...]`, the tiles a wave may walk in at (left
  out: `[entry]`). `outpost-wave`'s `entryFor()` splits each wave between the
  left and the right of the place reported (the caller's sighting, D-065):
  on each side the nearest entry at least `entryAway` tiles off, else the
  farthest there; people alternate sides, each wave starting on the other
  side; with entries on one side only, all come from there. With entries on
  both sides a wave's person faces the place reported. A wave's person keeps
  the entry it came in at (`c.outpostWave.from`) and `outpost-leave` walks
  him back off there.
- `entryAway`: tiles (default 0). 12 is about half a phone screen: they walk
  in at the screen's edges.
- `announce`: the banner per row (`src/client/draw/alarm-banner.ts`), the
  last repeating; no digits. Every wave also plays the alarm sound.
- `doorClear` (2026-11-24, `INTENT:`): the column of the room's way out. While
  any hero in the room stands within `entryAway` tiles of it, `doorSafe()`
  leaves out the entries that close to it, so that half of the row walks in
  from the other side, never between a hero and the door ("There is always a
  way out"; with every entry that close, all are kept). It reads where the
  heroes are, as the bound reads who is in the room; where a wave walks to is
  still the caller's sighting (D-065). Left out: no rule. The camp's is 2.

Proven in `test-sides` by `sides-wave-both-sides` (control: no `entries`). The door rule by `camp-entries-door-kept-clear` (the infiltrator at column 12.7 when the second call completes: both of its people walk in east of it, then it walks out; control: no `doorClear`, one walks in at column 6).
**Switched on in the quarry's depot** ("The depot", above) **and in the Bandit Camp** (2026-11-24): entries
`[[6,7],[24,10],[30,10],[36,10],[41,10]]`, `entryAway` 12, five rows (1
fighter; 2; fighter and heavy; 2 fighters and a heavy, the first of them at
the reins of a ram wagon since Step 20 push 3, "Here comes a wagon!"; a heavy
and the brute, repeating), a banner per row. No entries east of column 41 yet (the camp's
Step 20 run): a hero there gets every row from the west; adding `[58,10]` and
`[70,10]` was measured to turn `step23-thrown-out-leaves-it` red, so it waits
for the weapons builder. The quarry's other rooms are Step 22's to place.
With `doorClear` (2026-11-24) `step7-last-stand-camp` was re-timed again (east only, out at 2700; waves 4, felled 5). Scenarios re-timed for it: `step7-caller-tries-again`,
`step7-last-stand-camp` (the hero now strikes west and east by turns),
`step7-same-again-hangs-nothing`, `step12-walk-out-ends-it`, and the six
`step21-*` camp ones (`docs/plan/step-4.md`, "Alarms and the chase, as
played", push 4).

## Not built yet

A guard's own swing (Step 18). Saving a broken horn (Step 7's store).
