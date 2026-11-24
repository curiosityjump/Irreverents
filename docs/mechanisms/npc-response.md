# NPC response logic: people with three moods

**Reference.** Open before touching `src/sim/npc/`, the `npc-*` systems,
`content/npcs/`, `content/rules/`, the `npc`, `routine` and `things`
fields of `content/placements/`, or `src/sim/npc/alert.ts` and the
`npc-call` / `alert-*` systems, or `content/dispatch/`. Built by Step 4:
slice 1 (the three moods) and slice 2 (calling for help, the area alert,
responders, cooling), both 2026-11-23; the town's tiers (the guard's
whistle and the dispatch rows) the same night.

## Why it exists

The owner (design library doc 11): people have **exactly three moods**
(D-048), and **"NO NPCS WILL HAVE AI"** (D-055): fixed states, explicit
role/deed mappings, authored reactions. The comedy is that the world
judges **who** is acting as much as **what** they do (D-050). So all of
it is data tables plus a small fixed machine. Call it NPC response logic,
never AI.

The moods: **1** business as usual, **2** confusion / distress, **3**
absolute blinding violent rage. Mood 1 is *role conformity, not
friendliness* (D-049): a shopkeeper being robbed by the villain is in
mood 1 and happily fights back.

## The pieces

| Piece | Where | What it is |
|---|---|---|
| A person's body | `content/characters/<id>.json` | An ordinary character kind (Step 2's): box, colour, verbs (`move`), a tuning set. |
| A kind of person | `content/npcs/<id>.json` | `role`, `side` (`good` / `bad`), `moods` (`"1"`, `"2"`, `"3"` → a behaviour id), `barks` (cue → at most three words, D-057). |
| Where one stands | `content/placements/<room>.json`, `place[]` | Step 2's entry plus optional `npc` (an NPC kind id) and `routine`. |
| Things to use | the same file, `things[]` | Bodiless: `id`, `tile`, `deed`, optional `keeper` (a placed person), `once`, `look` (`counter` / `goods` / `bell`), and for a bell `side` (who rings it; `good` if left out). |
| The tables | `content/rules/*.json` | `deeds`, `expect`, `reactions`, `events`. Every file is read; rows are taken in file-name order. |
| The numbers | `content/tuning.json`, `world.npc*` | Sight, rage threshold, clocks, reaches. All `DRAFT:`. |

A player's character always has the role **`hero`** (`HERO_ROLE`),
whichever body it is, and no side.

## State: all of it on entities

Step 1's server replicates entities generically, so nothing here lives
in a `World` field or a module variable.

- `entity.c.npc` (on a person): `kind`, `home` (the placements file that
  placed them), `mood` (1 | 2 | 3, changed only by `setMood()`),
  `dissonance`, `offenders` (sorted entity ids), `quiet` and `cool`
  (the two clocks, in ticks), `lastSeen` (`{x, y}` or null), `step`,
  `stepTicks`, `stall` (the routine), `bark` (`{text, ticksLeft}` or
  null).
- `entity.c.thing` (on a thing): `takenBy` (an entity id or null). A
  thing's entity has `kind: "~thing"` (`THING_KIND`), which no character
  kind can be called, so physics and the entity drawer skip it. Its `x`,
  `y` are its tile's top-left.
- `entity.c.interact` (on a player's character): `held`, to see a fresh
  press.
- `entity.c.input` (Step 2's, declared in `systems/verbs.ts`): what a
  person wants this tick. **A person never sets `vx`, `vy` or `facing`**;
  `drive()` writes this and the body's own verbs act on it. Turning on
  the spot is a stick touch of 0.01 (`turn()` in `behaviours.ts`).

## The systems, in order

| Order | System | Does |
|---|---|---|
| 10 | `npc-setup` | Gives `c.npc` to any entity whose placement entry names an `npc`; adds a room's `things` as entities once anybody is in that room. |
| 50 | `npc-act` | Runs the behaviour the person's kind names for their mood and writes `c.input`. A routine's `do` step emits `did`. |
| 55 | `npc-call` | An upset good person pleads, walks to a bell and rings it; overlays the input `npc-act` wrote. A completed call is the only thing that raises the alert. |
| 56 | `alert-respond` | Guards answer a completed call: go to the reported place, search, chase a hero they see, go back at alert 0. Overlays input too. |
| 57 | `alert-whistle` | A guard on duty who sees a hero do something more blows his whistle; finished, it is a completed call (the town's tiers, below). Overlays input. |
| 58 | `alert-dispatch` | Each time an area's alert goes up, walks that level's row of its dispatch table in by its doors, under its cap; at alert 0 walks them out and removes them. |
| 60 | `npc-interact` | A player's fresh press of `interact` uses the nearest thing within `npcInteractReach`: emits `did` with the thing's deed; a `once` thing is marked taken. A thing with a `keeper` works only while the keeper stands within `npcKeeperReach` of it. Which thing, and whether, is the Use arbiter's (`useHere`, `src/sim/use.ts`; its `thing` entry, `src/sim/use/thing.ts`); this system does the deed. A body standing in an enter doorway gets nothing here: the arbiter's door entry asks first. |
| 100 | `verbs` (Step 2) | Bodies act on their input. |
| 500 | `physics` | |
| 600 | `npc-witness` | Collects this tick's deeds, works out who perceived each, emits `deed`, and applies the mood rules. |
| 605 | `alert-follow` | After `room-doors` (600): tells a responder which door a hero they had in sight just left by. |
| 610 | `npc-mood` | Runs the clocks (bark, distress fading, rage cooling) and updates `lastSeen`. |
| 620 | `alert-cool` | Runs each area's hide-and-wait clock and lowers its alert one level at a time. |

Anything that emits an event meant to become a deed must run **before
600**. `ctx.events` (added to `StepContext` for this) is the tick's
events so far.

## Deeds

A deed is a thing a person can witness someone doing: tonight `buy`,
`take`, `rob`, `hit`, `grab`, `throw` and `break` (breaking a bell,
`content/rules/calls.json`) (the `deeds` lists in `content/rules/`). Deeds reach the witness pass two ways:

- **`did`**, emitted by Step 4's own code (a routine's `do`, a hero
  using a thing): `{ deed, by, target, thing }`.
- **Any other event**, through the `events` table: `{ "event": "hit",
  "deed": "hit", "by": "by", "target": "target" }` says which event type
  is which deed and which of its fields hold the two entity ids. Rows
  for Step 2's `hit`, `grabbed` and `thrown` are in the file already;
  no code changes when those events start arriving.

For each deed the witness pass emits **`deed`**: `{ deed, by, player,
target, thing, room, x, y, witnesses }`. Something with no role (a
crate) does no deeds.

## Seeing (`src/sim/npc/sight.ts`)

`DRAFT:` the simplest thing that makes sneaking a choice. A person sees
someone when: same room; the someone is in front (the way the person
faces); within `npcSightRange` (112 px, 7 tiles) across and
`npcSightHeight` (40 px) up or down, between the middles of the two
bodies; and no **solid** tile on the straight line between them
(one-way platforms do not block). An NPC kind may carry its own
`sight` `{ range, height }` (2026-11-24, `DRAFT:`, set on nobody yet);
`sightOf()` gives canSee and sightBox the same numbers, so the drawn band
follows. **The one a deed is done to always
perceives it**, facing or not. Someone out cold (`c.flattened`, Step
2's) sees nothing. **Nobody sees a body that is hiding**
(`c.roomHide`, Step 3's: standing still, doing nothing, inside a `hide`
part; slice 2 gave it this meaning). Moving or pressing anything ends
the hiding on that tick, before the witness pass.

## The tables (`content/rules/`)

- **`expect`**: `{ actor, deed, targetRole?, targetSide?, witnessRole?,
  witnessSide?, verdict: "expected" | "odd", weight }`. Among the rows
  that match, **the one with the most conditions wins**; between equals,
  the first in file-name then row order. **No matching row means the
  deed is nothing to that witness**: neither expected nor odd.
- **`reactions`**: `{ witness, actor, deed, reaction }`: what a person
  in mood 1 does about an *expected* deed. The reaction id is the bark
  cue; `oppose` also emits `opposed`.
- **`events`**: above.

Tonight every odd row carries `witnessSide: "good"`, so nothing drives
the villain out of mood 1 (`DRAFT:`, the lead's call).

## The mood machine (`npc-witness` + `npc-mood`)

Each witness looks the deed up in `expect`:

- **Odd:** `dissonance += weight`, the doer joins `offenders`, both
  clocks restart, `lastSeen` is where it happened. Mood 1 → 2, **always
  2, however heavy the deed** (D-044: the first deviation is a fluke).
  Mood 2 with `dissonance >= npcRageAt` (3) → 3 (D-045).
- **Expected, done by an offender:** mood 2 → 1 **on that same tick**
  (D-042, D-072; the owner calls the speed "core to the game's comedy
  and strategy"), with `reassured` and a bark. Mood 3 → 1 only for a
  `bad` person (D-051). **A good person in mood 3 is not calmed by
  anything in view** (D-073).
- Then, if the witness is in mood 1 and the deed was expected, the
  `reactions` table.

The clocks: mood 2 with nothing odd for `npcDistressFadeTime` (12 s) →
1 (`faded`). Mood 3 with no offender in sight and nothing odd for
`npcRageCoolTime` (15 s), **and, for a good person, only while their
area's alert is 0** (D-073; `rageMayCool()`), → **2, not 1** (`cooled`; D-074: an expected
act then finishes the job), with `dissonance` left one short of rage.
Seeing an offender or an odd deed restarts the wait. Entering mood 1
clears `dissonance`, `offenders` and `lastSeen` and restarts the routine
from its first step.

Events: `mood-changed { entity, from, to, cause, offender }` (`cause` is
`odd:<deed>`, `expected:<deed>`, `faded`, `cooled`, or for someone
answering a call `called`, `pursuit`, `stood-down`), `reassured
{ entity, by, deed }`, `opposed { entity, target, deed }`.

## What a person does (`src/sim/npc/behaviours.ts`)

One function per behaviour id; an NPC kind picks one per mood.

- **`routine`**: the placement entry's `routine`, looping:
  `{ "wait": seconds }`, `{ "face": "left" | "right" }`,
  `{ "walk-to": column }`, `{ "do": deed, "target": placed id }`. A
  routine needs at least one wait. A walk that makes no headway for 45
  ticks is given up (there is always a way out). A `do` whose target is
  not in the room is skipped.
- **`plead`**: stop and face the first offender in the room.
- **`charge`**: walk to `lastSeen`, the place an offender was last
  **seen**, never where they are (D-065: not omniscient), and stop
  within `npcChargeReach`. If the body lists Step 2's `attack` verb,
  press `attack` there every other tick while an offender is in sight
  (Step 18's pulse: "Who fights" below).

## Who fights (Step 18)

The owner: *"Enemies or provoked good guys need to be able to fight
too."* Built by Step 18 slice A (`docs/plan/step-18.md`).

- **Who, against a hero.** A good person fights a hero only in mood 3,
  and only an offender in sight (`charge`). A guard answering a
  completed call fights the hero it sees (`alert-respond`'s chase).
  Enemies fight heroes as business as usual, in mood 1, through Step 12's
  `outpost-fight` (`docs/mechanisms/outposts.md`). A good person
  fighting a villain who acts like a villain, in mood 1, is the design
  too (D-049; `INTENT:` at `src/sim/systems/npc-witness.ts:72-74`), only
  not built yet (the step's slice D).
- **Rage alone summons no one (D-075).** An isolated raging person
  fights where they are; reinforcements come only from a completed call.
  A raging good person still goes to call once no offender is in sight
  (`npc-call.ts`), which is why a guard hit from behind walks to the bell
  before he comes back to swing.
- **How.** A person swings with Step 2's own `attack` verb, with its
  wind-up, knockback and wear (`docs/mechanisms/combat-and-impact.md`).
  Its body must list `attack` and its tuning set must carry the seven
  attack numbers. Today: `guard` and `shopkeeper` (Step 18), and the
  camp's `outpost-fighter` and Step 16's kinds (Step 12's system), and
  the villain once struck (below). Not the lookout, the king or the toll
  keeper.
- **The villain hits back once struck** (`DRAFT:`). His NPC kind says
  `"fights": "when-struck"` (`src/content/kinds/npcs.ts`; left out, a kind
  is `on-sight`). `fight-struck` (order 101, after the verbs) writes
  `c.struck[hero id] = tick` on a person whenever a player's `hit`,
  `grabbed` or `thrown` names them, and forgets an entry after
  `npcStruckMemory` (15 s; each new deed restarts it) or once that id is
  gone from the world. `outpost-fight` then narrows the heroes he may
  fight to those, and still fights only one he sees (D-065). A body a
  hero throws into him is not a strike (its `impact` names no hero). His
  mood is untouched: fighting is business as usual (D-060). Gate C's rob
  and buy-politely loop needs him not to fight on sight: `"on-sight"`
  turns 14 scenarios red (measured on push 2).
  `scenarios/step18-villain-hits-back.json` is the check.
- **The pulse.** `charge()` and the chase press `attack` on even ticks
  only (`world.tick % 2 === 0`), as `outpost-fight` does: Step 2's verb
  starts a swing only on a fresh press (`attack.ts`), so a held input
  would swing once per approach. Do not "fix" the pulse back to a held
  input, and do not change the verb.
- **The numbers** (`content/tuning.json`, `DRAFT:`): the guard hits like a
  camp fighter with a slower wind-up (strength 9000, reach 12, every
  0.8 s, wear 20, wind-up 0.4 s); the shopkeeper is an ordinary fighter
  (4000, reach 10, every 1.0 s, wear 8, wind-up 0.5 s). The wind-ups are
  long so a blow can be seen coming on a phone over a network (the step's
  DRAFT list). The toll keeper walks on its own copy of the shopkeeper's
  walking numbers (`characters.toll-keeper`), because a number its body
  has no verb for fails the content check.
- **The way out** (`INTENT:`; `docs/deliberate-designs.md`): no person's
  body lists `jump`, and every person walks slower than the slowest hero
  runs (people 40–56 px/s; the brawler runs at 76). A hero who jumps
  over a swinging person and runs gets away:
  `scenarios/step18-jump-over-is-a-way-out.json`, and against two at once
  the probe in the step's builder notes. A person who runs or jumps
  needs another way out first.
- **Friendly fire stays** (`DRAFT:`): a swing hits every body in reach,
  whatever its side, so a guard can flatten the shopkeeper.
- **Checks:** `step18-rage-keeps-swinging`, `step18-guard-swings-again`,
  `step18-jump-over-is-a-way-out`, and `npm run e2e`'s `fight-back`
  (`scripts/e2e/fight.ts`, also in `check:live`).

## On screen (`src/client/draw/npcs.ts`)

`DRAFT:` plain stand-ins until Step 8 draws real ones. Mood 1 shows
nothing; mood 2 a yellow `?` over the head; mood 3 a red `!` and a red
tint over the body. A bark (`c.npc.bark`) replaces the mark while it
lasts (`npcBarkTime`). Things are a brown box (`counter`) or a small
green one (`goods`), gone once taken; a `special` good (Step 14 slice B,
taking it is a piece) is drawn from the cut `gem` look until a
`shop-special` look lands. Called by one line in
`src/client/render.ts`, after the bodies.

## Calling for help, the alert and getting away (slice 2)

The owner's rules, each marked `INTENT:` with its D-number at its site:

1. **Mood and alert are two things (D-065).** Mood is per person; the
   alert is one number per area (a room, tonight), 0 to 3. Three furious
   witnesses and an alert of 0 is a normal state of the world.
2. **Only a completed call raises the alert (D-063, D-075).** The number
   has **exactly one line that raises it**, in `raiseAlert()`
   (`src/sim/npc/alert.ts`, not exported), and exactly one caller,
   `completeCall()` in the same file, which a completed call by bell
   (`npc-call`) or by whistle (`alert-whistle`) goes through. Not rage, a hit, a sighting, a body or a timer.
   **Never add a second raise**; `step4-rage-without-a-call` and the
   chase in `step4-catastrophe-and-escape` are the checks.
3. **Who calls (D-064, D-071):** a `good` person in mood 2 or 3.
4. **A call can be stopped (D-066)**, and **a sent call is not unsent**.
5. **Help is not psychic (D-065).**
6. **The alert cools only by hiding and waiting (D-068, D-074, D-076).**
7. **Getting caught opens play (D-019):** nothing here ends or resets
   anything, and no state holds a player.

**State, all on entities** (declared in `src/sim/npc/alert.ts`):

- `c.alert` `{ level, quiet }` on one bodiless entity per area,
  `~alert:<room>` (kind `~thing`, no `c.thing`), made by the first
  completed call there; its `x`, `y` are the last place reported. No
  entity means alert 0. Read it with `alertLevel(world, area)`.
- `c.call` on a person going to call: `plead`, `progress`, `bell`,
  `stall`, `reported`.
- `c.ringing` `{ ticks, of }` on a bell while it is being rung (for the
  page to draw).
- `c.respond` on a person answering a call: `phase` (`go`, `search`,
  `chase`, `return`), `x` (where they are heading), `dir`, `stall`,
  `sight` (the hero seen on their last turn) and `door` (a door they saw
  a hero leave by).

**A call point** is a thing with `"look": "bell"`, `"once": true` and a
deed (tonight `break`). A hero's `interact` at it breaks it (the deed
`break`: odd for a hero in a good person's view, weight 1; unseen,
nobody knows). Broken is `c.thing.takenBy !== null`, and stays so
(`DRAFT:`).

**Calling (`npc-call`, 55).** A good person who is not answering a call
and whose offenders include a player's character (`DRAFT:` a report
names the heroes, so the villain's polite purchase sends nobody to the
bell): in mood 2 they plead for `npcPleadTime` (3 s), the player's
window to make it right; in mood 3 they charge while an offender is in
sight. Then they walk to the nearest working bell of their side in the
room (none, or one a wall keeps them from for 45 ticks: no call), stand
within `npcCallReach` and ring for `npcCallTime` (2.5 s). Events, **a
contract with Step 7's detector, exactly these**: `call-started { by }`,
then `call-completed { by, area, x, y }` (`x, y` is the caller's
`lastSeen`: where they last saw what upset them) or `call-stopped { by,
why }` (`knocked-out`, `bell-broken`, `calmed`, `left-the-bell`). Having
sent a call, a person calls again only after witnessing something more
(`dissonance` above `c.call.reported`).

**The alert.** Each completed call adds 1, to a most of 3, and restarts
the wait. Every change emits `alert-changed { area, from, to }` (also
Step 7's).

**Responders (`alert-respond`, 56).** On `call-completed`, every person
of role `guard` (`RESPONDER_ROLE`, `DRAFT:`) and the caller's side in
the area gets `c.respond` and, from mood 1, mood 2 (`called`). They walk
to the reported `x`, then pace `npcSearchRange` (48 px) either side of
it. One who **sees** a hero (`canSee`, that tick) goes to mood 3
(`pursuit`) and walks at where it saw them, pressing `attack` every
other tick in `npcChargeReach` if its body lists the verb (the guard's
does since Step 18: "Who fights" below);
losing sight, it walks to the last place seen and searches there. **The
only read of a hero's position is under `canSee` on the same tick.** At
alert 0 they walk back to their placement's column, return to mood 1
(`stood-down`) and their routine restarts. All of it through `c.input`.
While on duty their distress does not fade (`quiet` is held at 0).

**Following through a door (`alert-follow`, 605; D-077).** When a
player's character goes through a door (`changed-room`), a responder in
the room it left who had that hero **in sight on that very tick**
(`c.respond.sight`) takes `c.respond.door`: they walk to that door and
through it (a walk door by walking in, an enter doorway with
`askForDoor()`), then search from where they come out. One who did not
see the hero leave learns nothing and searches where they are (D-065).
Only the nearest `chaseCrossCap` (2) of those who saw follow: Step 12's
`chase-cap` (606) clears the door for the rest (`docs/mechanisms/outposts.md`).
A responder answers to the alert of the area they were **placed** in
(`c.npc.home`), wherever the chase has led; when it reaches 0 they go
home by `doorToward()` and back to their post. With no way home, or a
door a wall keeps them from, they stand down where they are (`DRAFT:`).
**Walking through a door never changes an alert.** A responder goes
through a door only on purpose: every other place they walk to is kept
clear of the room's walk doors (`clearOfDoors()`), or a guard searching
beside one would be carried out of the room and back for ever.

**Cooling (`alert-cool`, 620).** For an area with alert above 0: while
no conscious person of the area (anyone in the room, and anyone placed
in it whom a chase has led elsewhere) sees any player's character, and no
`deed` of this tick by a player was odd to any of its witnesses, `quiet`
counts up; at `npcAlertCoolTime` (20 s) the alert drops one level and
the count restarts. Otherwise `quiet` is 0. Standing in a pursuer's view
acting normal therefore never cools it (D-067), and hitting back
restarts the wait without raising the number.

**A refuge needs no object:** people's bodies do not list `jump`, so a
ledge is out of reach, and `npcSightHeight` or a solid tile makes it
unseen.

**On screen (`src/client/draw/alert.ts`, `DRAFT:`):** a brass bell on a
post, drawn with the working parts behind bodies (`drawBells`); while rung
it swings and a bar over it fills (the time left to stop the call),
drawn with the marks (`drawAlert`); broken, a grey stump. The area's
alert is up to three red marks in the top-left corner; nothing at 0. The
looks `bell`, `bell-ringing`, `bell-broken`, `alert-pip` and
`alert-pip-off` replace the plain shapes when present
(`docs/mechanisms/art-pipeline.md`).

**Not built yet:** the armoured guard (the town's tiers, push 3);
finding a knocked-out person; the villain's horn (D-070).

## The town's tiers: the whistle and the dispatch rows

`DRAFT:` throughout (doc 27's whistle and doc 26's ladder are proposals,
not the owner's; `docs/decisions-log.md`, "Step 4: whistle" and "Step 4:
dispatch"). Brief `loop-town-tiers.md`.

**The switch is data.** Only an area with `content/dispatch/<area>.json`
(`src/content/kinds/dispatch.ts`) has a whistle and rows. Tonight that is
`castle-street`; `test-street`, `test-shop` and the camp behave as slice 2
built them.

**The whistle (`alert-whistle`, 57).** On a good person answering a call
(`c.respond`), or a guard in mood 3 while his home area's alert is above 0
(the guard who rang the bell himself is the caller, not a responder, yet
just as much after you: the usual fight, `-raging-guard-whistles`), whose
home area has a dispatch file:
- He comes on duty with `c.whistle.reported` set to his dissonance then
  (what he had witnessed is already reported by whoever called him).
- Chasing (a responder in the `chase` phase; a raging guard with a hero
  among his offenders in sight), standing, with
  `dissonance > reported` and no wait left, he starts: `call-started`.
  Seeing adds no dissonance, so standing in view never starts one (D-063).
- He blows for `npcWhistleTime` (2.5 s): `c.whistle.progress` counts up
  on his own entity (so every page in the room is sent it), and he stands
  still (`drive` idle, overlaying alert-respond's chase and swing).
- **Put out of his area** (a blow, a throw) while its alert is up, a
  raging guard who sees none of his offenders walks back by the door toward
  home (`doorToward()`), where he can see the hero and call again. Only the
  one who rang the bell himself: a responder stays alert-respond's (D-077,
  he searches where the chase led). Before this, a blow that sent him out
  by the courtyard door left him there until the alert cooled
  (`scripts/checks/step4-out-and-back.ts`).
- Anything that leaves him unable to act stops it (`cannotBlow()`): out
  cold (`knocked-out`), held (`grabbed`), flying or in a hit's beat
  (`knocked-down`); also going off duty (`stood-down`). `call-stopped`
  is emitted, `reported` becomes his dissonance and he waits
  `npcWhistleAgain` (4 s). He starts again only for something new.
- Finished: `completeCall()`, exactly as the bell's (`call-completed`
  with `x, y` his `lastSeen`, one level, the place reported on the alert
  entity), then the same wait.
- **Away from home:** a follower in another room whistles too, if
  `doorToward()` finds a way home; it raises his home area's alert, and
  the place reported is the home room's door toward where he is: help
  learns which way, not where (D-065).
- `alert-respond` (56) reads `call-completed` before the whistle (57)
  runs, so a whistle calls no other placed guard on its own tick; the
  rows it brings get their own heading (`DRAFT:`).

**The dispatch (`alert-dispatch`, 58).** For each area with a file:
- An `alert-changed` up to level k queues `rows[k-1]`; a completed call
  with the alert already at its most queues the last row again, only
  when nothing is queued (`DRAFT:` no banked flood). At alert 0 the queue
  is dropped.
- A queued row walks in while the room's people (bodies with `c.npc`,
  out cold or not) plus the row fit under `cap`
  (`npcDispatchCapOn`, a control switch). An empty row sends nobody.
- Person i comes by `doors[i % doors.length]`, a walk door on the west or
  east edge, on the tile beside it inside the room (a later one by the
  same door one tile further in), facing in. Ids are
  `<area>:help<n>:<i>`, n counting rows walked in (on `c.dispatch.sent`
  of the alert entity; deterministic). Each gets `c.npc` (home the area),
  `c.arrival { area, door }`, `c.respond` heading to the alert entity's
  `x` (the place reported, D-065) and mood 2 (`called`). Event
  `dispatch-arrived { area, row, people }`.
- From then they are ordinary responders: they search, chase, swing,
  follow through doors (two at most per door, `chase-cap`), and whistle.
- At alert 0 `alert-respond` stands them down (they have no placement, so
  where they are); `alert-dispatch` then walks each one out by the door
  he came in by and removes him a few pixels short of it (a walk door
  would carry him to the next room). One not in his area, or stuck for
  45 ticks, is removed where he stands.

**The pips follow you (`world.alerts`).** `raiseAlert` and `lowerAlert`
copy the area's new level into the top-level `world.alerts[area]` (never
deleted; read with a default). A page is sent only its room's entities,
but every snapshot carries top-level fields by key, so a page anywhere
draws the highest level of any area. Written only where an alert changes,
so a page's own world never overwrites the server's with a stale value
(the trap at `cantina-chase.ts`). Only the display travels: nobody in
another room learns anything from it.

**On screen (`src/client/draw/alert.ts`):** over a guard whose
`c.whistle.progress` is above 0, the `bell-gauge` look (else a bar)
fills; the pips sit just under the party plate (`drawnHud()?.box`), at
the top-left only when no plate is drawn, on their own dark strip led by a
brass warning sign (`drawPipStrip`; phone-HUD brief, `DRAFT:`: alone they
read as hearts); a new pip queues one banner
(`alert:<level>`, the dispatch file's `banners[level-1]`, none on the
page's first frame). `drawn.alert` `{ level, whistle }` is the record the
checks read.

**The castle street's table:** doors `to-throne-room` and `to-courtyard`,
cap 8, rows: level 1 nobody, level 2 two guards, level 3 three.

**Checks** (`scenarios/step4-tier-*.json`, all in the real street):
`-whistle-brings-row`, `-whistle-stopped`, `-no-whistle-unprovoked`,
`-both-doors`, `-cap-holds`, `-cools-and-leaves`, `-raging-guard-whistles`,
`-pips-cross-a-door` (the `alert` fact's `"shown": true` reads
`world.alerts`), and
`-away-at-the-most-<hero>` once per roster hero (solo, the street at its
cap: out by the west door, no blow after, cooled to 0, every arrival
gone). The real-server check `scripts/checks/step4-tiers.ts` (two
connections: A in the courtyard still shows the street at 2, B in the
street has the arrivals), `scripts/checks/step4-out-and-back.ts` (a raging
guard put in the courtyard walks back and whistles) and the phone e2e fact
`tiers` (`scripts/e2e/tiers.ts`, also in `check:live`: after fight-back's
moves it meets the guard standing still, turned toward him, west of the
street's middle, because a page swinging at a moving guard misses over
live's latency; its `INTENT:` has the measurements). The `people` fact counts people in a room (optionally within an
`x` range, or only `arrivals`). Their controls, watched to fail, are in
`docs/plan/step-4.md`, "Builder notes".

## Adding things

- **A deed:** add its id to `deeds` in a `content/rules/` file, rows to
  `expect`, and either an `events` row (if a simulation event is the
  deed) or a `do` step / a thing that names it. No code.
- **A rule:** a row in `expect` or `reactions`. No code.
- **A role / a kind of person:** `content/npcs/<id>.json` (and a body in
  `content/characters/` with a tuning set, unless it shares one). No code.
- **A person in a room:** an entry in that room's placements file with
  `npc` and a `routine`. At most 8 people per file
  (`MAX_NPCS_PER_ROOM`, `DRAFT:`).
- **A thing to use:** an entry in `things`.
- **A call point:** a thing with `"look": "bell"`, `"once": true`,
  `"deed": "break"` and optionally `"side"`. Keep it within walking
  reach of who should ring it and more than `npcInteractReach` from
  other things. No code.
- **A responder:** place a person whose NPC kind has role `guard`. No
  code.

## Where the people are (slice 3)

- **`castle-street`** (`content/placements/castle-street.json`, `DRAFT:`
  every column and timing): `street-shopkeeper` at column 11 under
  building 1, `street-counter` at 12, goods at 13, 14 and 15, and
  `street-goods-rare` (look `special`, Step 14 slice B: a piece) at 16;
  `street-villain` resting at column 21 and walking to column 17 (the
  end of the goods, clear of where a player stands to use them), whose
  loop (rob, walk off, buy politely, rob properly, rest) takes about
  53 s, the polite purchase near 19 s in; `street-guard` pacing columns 37–42, more than a sight
  from the shop, and `street-bell` at column 24, between them, is how the shop
  reaches the guard (slice 2). Two light crates (`street-crate-1`, `-2`,
  columns 31 and 34, Step 14 slice B) lie between the doorway at 28 and the
  guard's beat. A player reaches them by walking east out
  of the throne room, where the game starts.
- **`test-shop`** is still the check scene and no player can reach it.
  The street has its own routines; test-shop's are pinned by its
  scenarios.
- **No stand-in in `graybox-hall`.** The brief's fallback (a shopkeeper
  in the grey test hall) was for a start room still in the hall; the
  start room moved to `throne-room` first, so it was skipped.

## Checking it

`step4-street-people` (no gate tag) is the one in a room players reach:
one round of the street villain's loop, then a hero takes in view and
buys. Its ticks are pinned to the street's routines: change a timing in
the placements file and re-trace it. `scripts/trace.ts` prints bodies only (things and alerts have no box).

Slice 2's scenarios (`"gate": "D"`) are in `content/rooms/test-street.json`
with its placements: a ledge at the left (the refuge), the shop at
columns 10-14, a bell at 17, a hiding place at 22, a guard's post at 30. The `alert` fact
reads an area's level. A recorded tick shows the world *before* that
tick's step, so an event at tick 505 shows in the `alert` fact from 506.
`step4-street-call`, `step4-guard-follows-seen`,
`step4-leaves-unseen-guard-stays` and
`step4-door-and-back-alert-unchanged` run in `castle-street` itself and,
like `step4-street-people`, are pinned to the street's routines.


The other scenarios `scenarios/step4-*.json` are all in
`content/rooms/test-shop.json` with `"placements": true`. Two facts were added for them
(`docs/mechanisms/scenarios.md`): `mood` and `event-where`. The
villain's polite visit is at about tick 2960; the hero scenarios use the
time before it. `step4-hero-hits-shopkeeper` is the one that uses a
real event of another step (Step 2's `hit`).

## Traps

- The shopkeeper glances behind every 6.5 s (the routine), so "behind
  the shopkeeper's back" depends on when. Scenarios pin the tick.
- Turning nudges a body by a hundredth of a pixel, so a person's `x`
  drifts by fractions over many turns. Do not assert a person's exact
  position.
- Someone knocked out by a blow does not perceive that blow (out cold
  sees nothing, and Step 2 flattens before the witness pass runs). Slice
  2 owns knocked-out people.
- A `once` thing stays in the world after it is taken (with `takenBy`
  set); it is never re-added.
- **Holding `attack` swings once** (`attack.ts`: `fresh = down &&
  !a.held`). A person who should keep swinging presses it on alternate
  ticks (the pulse, "Who fights"); a held input looks right and swings
  once per approach.
