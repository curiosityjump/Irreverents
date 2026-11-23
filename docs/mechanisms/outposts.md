# Hostile outposts: a horn, waves, and every way to stop them

**Reference.** Open before touching `content/outposts/`,
`src/content/kinds/outposts.ts`, `src/sim/outpost/`, the `outpost-*`
systems, `src/client/draw/outpost.ts`, or the outpost room
(`content/rooms/outpost.json` and its placements). Built by Step 12, slice
A, 2026-11-23 (`docs/plan/step-12.md`).

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
| 58 | `outpost-fight` | Any person of the `bad` side whose body lists `attack`, in any room (`DRAFT:`, widened for Step 16's rooms), who sees a hero walks at where they saw them and swings in `npcChargeReach` (a fresh press every other tick; the attack's own cooldown sets the pace); losing sight, goes to the last place seen and stands. Callers going to call are left alone. Mood stays 1 (D-060: business as usual). |
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

## Not built yet

Slice B: guards chasing through doors into the camp, and sides that meet
fighting (D-069). Saving a broken horn (Step 7's store).
