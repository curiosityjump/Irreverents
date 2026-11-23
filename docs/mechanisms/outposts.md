# Hostile outposts: a horn, waves, and every way to stop them

**Reference.** Open before touching `content/outposts/`,
`src/content/kinds/outposts.ts`, `src/sim/outpost/`, the `outpost-*`
systems, `src/client/draw/outpost.ts`, or the outpost room
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
| An outpost | `content/outposts/<id>.json` | `room`, `signaler` (the placed id of the horn post), `callers` (placed people who may sound it), `entry` ([column, row] where waves walk in; not a door), `bound` (most people in the room at once), `callTime`, `callAgain` (seconds), `breakHits`, `breakSpeed` (px/s), `waves` (rows of `{ character, npc }`). The validator names file and field; the cross-check refuses a room, post, caller or kind that does not exist. |
| The horn post | a placed body, e.g. `signal-post` | Verbs `["body"]`, weight 1000 (the most a body may be: a hit barely moves it), toughness 0 (never knocked out). A body, not a `things` entry, because only bodies can be hit or have things thrown into them. |
| The camp's people | `content/characters/outpost-*.json`, `content/npcs/outpost-*.json` | Step 4's people: side `bad`, three moods. The fighter's body lists `attack`; the lookout's lists `body` with toughness 30, so one good blow stops a call. |
| The numbers | `content/tuning.json` `world` | `outpostCallReach` (12 px), and two switches for the scenarios' controls, `outpostZoneEndOn`, `outpostBoundOn` (both 1). |

## State: all on entities

Declared in `src/sim/outpost/state.ts` (declaration merging):

- `c.signaler` on the post: `hits`, `broken`, `sounding` / `of` (ticks
  of the call being sounded, for the page), `queued` (finished calls
  whose wave has not walked in), `sent` (waves so far: the next row and
  the next ids).
- `c.outpostCall` on a caller: `phase` (`idle`, `going`, `sounding`),
  `progress`, `wait` (after a finished call), `done` (stopped by a
  knock-out or a grab: never calls again), `stall`.
- `c.outpostFight` on a person of the outpost: where a hero was last
  seen, or null.

A wave's people are spawned bodies (`spawnBody`) with ids
`<outpost id>:w<wave>:<i>`, deterministic, and given `c.npc` with `home` =
the outpost room (there is no placement entry; with none, mood 1's
routine is standing still). The network copies them with no network code.

## The systems, in order

| Order | System | Does |
|---|---|---|
| 57 | `outpost-call` | A caller not out, not held, who `canSee`s a hero, walks to the post (within `outpostCallReach`), then sounds it for `callTime`, holding still. Overlays `c.input`. |
| 58 | `outpost-fight` | Any person of the `bad` side whose body lists `attack`, in any room (`DRAFT:`, widened for Step 16's rooms), who sees a hero walks at where they saw them and swings in `npcChargeReach` (a fresh press every other tick; the attack's own cooldown sets the pace); losing sight, goes to the last place seen and stands. Callers going to call are left alone. Mood stays 1 (D-060: business as usual). **Who they fight** is the NPC kind's `fights` (Step 18): `on-sight` (left out) is any hero seen; `when-struck` (the villain) keeps only heroes in the person's `c.struck`, written by `fight-struck` (101), and still only one it sees. **A new fighting kind keeps the way out** (`INTENT:`, `docs/deliberate-designs.md`): no `jump` in its body, and a `runSpeed` below the slowest hero's 76. |
| 59 | `outpost-wave` | Walks queued waves in at `entry` while the room's people plus the wave fit under `bound`; otherwise the wave waits. |
| 540 | `outpost-signaler` | After physics and `impact-bodies` (520): each `hit` on the post counts one; `breakHits` of them, or one `impact` naming the post as `other` at `breakSpeed` or more, breaks it. |

Events: `outpost-call-started { by, outpost }`, then
`outpost-call-completed { by, outpost }` or `outpost-call-stopped { by,
outpost, why }` (`knocked-out`, `grabbed`, `signaler-broken`, `no-hero`,
`left-the-signaler`: knocked away from the post while not out, or a post
they could not walk to); `outpost-wave { outpost, wave, row, people }`;
`signaler-broken { outpost, signaler, by }`.

## The owner's rules, at their sites (`INTENT:`)

1. **Seeing is not calling** (D-063, D-070): only a finished call brings
   a wave; the caller has to walk there and stand there, and can be
   stopped on the way or while sounding.
2. **One player can stop it every way D-061 lists:** unseen (the ledge;
   sight is Step 4's), knock out or grab the caller (`DRAFT:` they never
   call again), break the post (a hit or a throw, **no new button**,
   D-093), or walk out.
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

- **`outpost`** (the "Bandit Camp", reached by the `to-outpost` enter
  doorway in the courtyard, ground row 7, column 23): the doorway at
  column 2, a step three tiles high (columns 5-7) every way in crosses,
  and a hop from it to a one-way ledge at row 6, columns 9-38, the high way
  across (five tiles up: out of the lookout's 40 px of sight). Under it
  the lookout at column 18 (watching west, glancing back), the post at 20,
  fighters at 25 and 28; waves at column 41.
- **`quarry-depot`** (Step 16 slice 3, `DRAFT:`; the room is slice 1's, `docs/mechanisms/rooms-and-doors.md`): the lookout (column 11, looking east 3 s then west 4 s) and the horn post just behind it (12), five tiles in from the walk door from the tower, the only caller; patrol 1 walks 11-13; a hiding place `depot-door-hide` just inside the door (columns 1-2), and nobody sees a hero standing inside the door (`step16-door-unseen`); a heavy guard at the strongroom's front (34) walks in to 40 now and then; patrol 2 walks the far yard (54-61); the hoard is a `things` take at column 45. Waves walk in at column 61. **Unlike the camp, this room has two walk doors** (`to-tower`, `to-pit`) on its west edge; nobody's walk uses columns 0-2, and measured: a fighter chasing a hero it knocked out through `to-tower` stops at column 1 and does not follow, but a body punched or thrown into the door's tiles is carried through it (a patrol punched by the grappler lands in the tower). `step16-zero-alarm-roof` (the flyer, over the roof) and `step16-zero-alarm-ledge` (the grappler on foot: the high ledge over the west stretch, then a shelf inside the strongroom over the guard's inner stand while it walks back under) are the quiet ways; `step16-caught-fight` (a held patrol thrown at the lookout mid-call breaks the horn too) `step16-caught-escape` (the grappler, out by the tower door) and `step16-caught-escape-cave` (the flyer with the hoard, down the one-tile hole at column 23 into the cellar, out by the pit into the cave) are getting caught. A body under 16 px wide that walks east into the step at columns 24-25 falls into that hole: no routine walks there (patrol 1 turns at column 13, the guard at 34), but a fighter chasing a hero there can.
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

## Not built yet

A guard's own swing (Step 18). Saving a broken horn (Step 7's store).
