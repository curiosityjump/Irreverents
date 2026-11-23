# Step 12, slice A: the outpost — a horn, waves, and every way to stop them

Brief for one cold session. Written 2026-11-23 14:40 UTC by the Step 12
lead (`session_017WiGzJTXQVCWQYDDmC2UiY`). The step is
`docs/plan/step-12.md` (read its "What's decided"; you do not need the
design library or `docs/vision.md`). Read `docs/mechanisms/npc-response.md`
in full before writing code: this slice builds beside Step 4's people and
edits none of Step 4's files.

**Hard stop 16:05 UTC with whatever is green. Nothing half-working on
`main`** (a push to `main` is the deploy; friends may be playing). Work in
the three pushes below, each standing alone; after each, `send_message`
to the lead (`session_017WiGzJTXQVCWQYDDmC2UiY`) with the commit. If the
clock runs out inside a push, drop that push and say where you stopped.

## The task, and what it moves

At the east of the courtyard a doorway leads to a hostile camp. Its
people are glad to fight heroes. If a lookout sees a hero, it runs to a
horn on a post and sounds it; when the sound finishes, a wave of fighters
walks in, and again after every finished call. One player can stop it
every way: stay unseen, knock out or grab the lookout mid-call, break the
horn, or walk out. This is the owner's "enemies" and "levels" (they said,
14:30 UTC: "I haven't seen any levels being built, enemies, the
cantina"). It moves no M-row (no gate A–F is this step's); it is the
first enemy fight a player can walk into.

## Measured for you (at 5fb514f; `npm run check` green, 64 s)

- **Calls today are good-side only.** `src/sim/systems/npc-call.ts:77`:
  `if (kind.side !== 'good' || e.c.respond) continue;` and the comment at
  :76 says the bad side's horn (D-070) "is not built". Only a completed
  good call raises Step 4's area alert (`raiseAlert()`,
  `src/sim/npc/alert.ts:79`). **Do not touch either.** Your horn is your
  own system and never calls `raiseAlert()` (`DRAFT:` the outpost's call
  brings waves, not the good guys' alert; log it).
- **System order** (`docs/mechanisms/npc-response.md`, "The systems, in
  order"): npc-setup 10, npc-act 50 (writes `c.input` from the mood's
  behaviour), npc-call 55, alert-respond 56, npc-interact 60, verbs 100,
  physics 500, room-doors 600, npc-witness 600. Later systems overlay
  `c.input`. Yours slot at 57–59 (input overlays) and after 500 (hits and
  impacts of the tick are in `ctx.events`). A person never sets `vx`,
  `vy`, `facing`: write `c.input` (`drive()`, `src/sim/npc/state.ts:153`).
- **Sight:** `canSee(content, watcher, target)` in `src/sim/npc/sight.ts`
  (same room, in front, 112 px across, 40 px up/down, no solid tile
  between, not out cold, not hiding). The only read of a hero's position
  is under `canSee` on the same tick (D-065). Import it.
- **Knocked out:** `isOut(e)` (`src/sim/npc/state.ts:84`, reads
  `c.flattened`); Step 2 flattens at accumulated wear ≥ toughness
  (default 100) and keeps a body down `flattenTime` = 3 s
  (`content/tuning.json` world). Grabbed: `heldBy !== null`;
  `canAct(e)` at `src/sim/body-state.ts:86` covers flying, held, beat,
  flattened.
- **Hit and throw events** (`src/sim/body-state.ts:63-78`):
  `hit { by, target, player }`, `impact { entity, player, other, speed }`
  (one per body when a flying body strikes another; `other` is an entity
  id). Emitted before 500/at 500, so read them after 500.
- **A body nobody can lift or knock out:** `content/characters/throne.json`
  (verbs `["body"]`) with tuning set `throne` weight 400, toughness 0
  (`content/tuning.json:200`). Copy that shape for the horn post.
- **Bodiless things can't be hit:** a Step 4 bell (`things[]`, kind
  `~thing`) breaks only by a hero's `interact`. That is why the horn is a
  body, not a `things` entry (and Step 4's `look` enum stays untouched).
- **People get `c.npc` only from a placements entry** (`npc-setup.ts`, by
  placed id). A wave person spawned at runtime has no entry: give it
  `c.npc` yourself when you spawn it (copy the literal at
  `npc-setup.ts:23`, `home` = the outpost room). **Measure what
  `routine()` (`src/sim/npc/behaviours.ts:31-74`) does for a person with
  no placement entry** before relying on mood 1's routine for them; if it
  throws or walks off, have your fight overlay cover them every tick.
- **Spawning:** `spawnBody(world, content, {id, character, room, tile})`
  (`src/sim/world.ts:71`). Ids must be deterministic (no `Math.random`,
  no clock): e.g. `<outpost id>:w<call n>:<i>`. The network copies new
  entities with no network code (`docs/mechanisms/network.md`).
- **The room cap today is parse-time only:** `MAX_NPCS_PER_ROOM = 8`
  (`src/content/kinds/placements.ts:66`) counts a placements file;
  nothing bounds people at runtime. Your bound is new, in your data.
- **Walk doors carry a body that walks into them** out of the room
  (Step 4 had to add `clearOfDoors()` for this). **Give the outpost room
  only `enter` doorways** (a body goes through one only by
  `askForDoor()`, `src/sim/systems/room-doors.ts:33`), and no person of
  yours ever asks: then nobody of the camp can leave and no fight can shut
  a door. Mark that `INTENT:` at the doorway (D-061: you can always
  escape the zone).
- **Where it joins:** agreed with Step 11's lead (cantina goes off
  `castle-street`, not here): **one new `enter` doorway in
  `content/rooms/courtyard.json`, ground row 7, column 23 (not 1-13: kept for Step 7; not 15 or 17-19), legend `o`,
  door id `to-outpost`**. Row 7 today is `W..1.2........3.P...4.Q..G...E`
  (column 23 is `.`). That one character, the legend entry and the door
  entry are the only edits to an existing room. `git pull --rebase` right
  before pushing it.
- **Scenarios:** `scenarios/<id>.json` (type `src/scenarios/types.ts:20-42`;
  copy `scenarios/step4-call-stopped-no-help.json`), facts in
  `src/scenarios/facts/` (one file each; existing: alert, body-state,
  character, clear-of-solid, event-where, event, in-room, mood, position,
  speech, standing-on-tile, velocity). A control is a tuning switch set to
  0 by hand and watched to fail (`bodyImpactOn`,
  `src/sim/systems/impact-bodies.ts:16`). Trace before pinning:
  `node scripts/trace.ts` (`docs/mechanisms/scenarios.md`).
- **The page's record:** `window.irreverents.drawn` (`src/client/main.ts:152-173`)
  holds bodies only (`Drawn`: id, kind, x, y…), no state. `scripts/e2e.ts`
  reads only `drawn`.

## What to build (all `DRAFT:` unless marked; log each choice in `docs/decisions-log.md`)

Owned paths (new): `content/outposts/<id>.json` + kind
`src/content/kinds/outposts.ts`; systems `src/sim/systems/outpost-*.ts`;
`src/client/draw/outpost.ts`; new character, NPC kind, room and
placements files named below; `scenarios/step12-*.json`. Ids name the
job, never "bandit" (a shown name is data: the room's `name` may say
"Bandit Camp").

1. **Data, `content/outposts/<id>.json`:** `room`, `signaler` (placed id
   of the post), `callers` (placed ids who may call), `entry` (a tile
   where waves walk in, not a door), `bound` (most people of the room at
   once, `DRAFT:` 8), `callTime` (s, `DRAFT:` 3), `callAgain` (s, a
   caller who finished waits this long before going again, `DRAFT:` 6),
   `breakHits` (`DRAFT:` 3), `breakSpeed` (impact speed that breaks it at
   once, measure a thrown crate's speed and pick below it), `waves`: rows
   of `[{ character, npc }, …]`, harder row by row (`DRAFT:` 1, 2, 3
   fighters). The last row repeats for ever: **no cap on waves** (doc 24:
   "the system must never impose an arbitrary maximum wave count").
   Validator messages name file and field (copy `src/content/reader.ts`).
2. **Bodies and kinds:** `content/characters/outpost-fighter.json` (verbs
   `move` and Step 2's `attack`, so Step 4's charge can swing),
   `outpost-lookout.json` (`move`), `signal-post.json` (`body`, a tuning
   set like `throne`'s); NPC kinds `content/npcs/outpost-fighter.json`
   and `outpost-lookout.json`: `side: "bad"`, moods 1/2/3 as Step 4's
   format wants. Their mood stays 1 while they fight heroes (D-060:
   business as usual); measure that `content/rules/` gives a bad witness
   nothing odd for a hero's hit (every odd row today carries
   `witnessSide: "good"`).
3. **The call (`outpost-call`, ~57):** a caller who is not out, not held,
   and `canSee`s a hero walks to the post (stop within a reach you
   measure), then sounds it for `callTime`, holding still. Emit
   `outpost-call-started { by, outpost }`, then
   `outpost-call-completed { by, outpost }` or
   `outpost-call-stopped { by, outpost, why }` with `why` one of
   `knocked-out`, `grabbed`, `signaler-broken`, `no-hero` (no player's
   character in the room). **A caller stopped by a knock-out or a grab
   never calls again** (`DRAFT:`, the library leaves it open: it makes
   "stop the caller" count); they fight instead. A caller who finished
   goes again after `callAgain` while a hero is in sight. State on the
   entity (`c.outpostCall`), declared by declaration merging in your file.
4. **Waves (`outpost-wave`):** each `outpost-call-completed` queues one
   wave (row n, then the last row again). A queued wave walks in at
   `entry` only while the room's people (entities with `c.npc` in that
   room, out cold or not) plus the wave fit under `bound`; otherwise it
   waits. **When no player's character is in the room, queued waves are
   dropped and nothing new starts**; people already there stay.
5. **Fighting (`outpost-fight`, ~58):** a person of the outpost (placed or
   wave) who `canSee`s a hero walks at where they saw them and holds
   `attack` within reach; losing sight, goes to the last place seen and
   stands. Callers going to call are left to `outpost-call`. Import
   Step 4's helpers (behaviours/state) where they fit; don't edit them.
6. **The horn breaks (`outpost-signaler`, after 500):** `hit` with target
   the post counts one; `breakHits` of them, or one `impact` with
   `other` = the post at `speed >= breakSpeed`, breaks it:
   `c.signaler { hits, broken, sounding }`; emit `signaler-broken`.
   Broken stays broken until the world restarts. Nothing is saved.
   **No new button** (D-093): a hero's hit or throw is the only way.
7. **The room:** `content/rooms/outpost.json` (+ `content/placements/outpost.json`),
   about two screens wide: the camp on the floor with the post and a
   lookout beside it and two fighters; **a high way across** (a ledge
   more than 40 px above the floor's sight line, reachable by a hop from
   the doorway side) so sneaking past is a real choice; the `enter`
   doorway back to the courtyard at the west, the wave `entry` at the
   east. Every other number `DRAFT:`. `npm run check` validates rooms
   (`controls/rooms/` shows what it rejects).
8. **Drawing (`src/client/draw/outpost.ts`, one import and call in
   `src/client/render.ts`):** the post with a horn (working), the horn
   raised with a filling bar while sounding, a broken stump; a plain
   shape now, a `look` id per state so Step 8's art can replace it
   (`docs/mechanisms/art-pipeline.md`). Add one additive field to the
   page's debug record, `drawn.signalers: { id, state: "working" |
   "sounding" | "broken" }[]`, filled from what you drew (one line in
   `src/client/main.ts`; the lead agrees it). The sound cue, if
   `content/sounds/` has a fitting one, is a bonus, not owed.

## The three pushes

1. **The mechanism in a doorless test room** `content/rooms/test-outpost.json`
   with its own outpost file: items 1–6, scenarios 1–3 below, each with
   its control watched to fail. Nothing a player can reach yet.
2. **The real room and its door:** items 7–8, the courtyard doorway,
   scenario 4, and "How to add an outpost" (a short subsection plus a row
   in "I need to add…", `docs/architecture.md:208-243`) and a section in a
   new `docs/mechanisms/outposts.md` with its one index line in
   `docs/mechanisms/README.md`.
3. **By touch:** extend `scripts/e2e.ts` (additively, a new block) so a
   phone-sized page by touch walks into the outpost, breaks the post and
   the record shows `working` then `broken`; if time allows, stops a
   caller mid-call and walks out during a wave. `npm run e2e` locally;
   after the deploy, `npm run check:live` and `npm run check:deployed`.

## Scenarios (one player, `step12-*`, no `gate` tag, each with a control)

1. `step12-caller-stopped-no-wave`: the lookout runs and starts the call;
   the hero knocks them out mid-call: `outpost-call-stopped` with
   `knocked-out`, no wave person exists 10 s later. `step12-call-brings-wave`:
   left alone, the call completes and the wave's first person appears
   after `outpost-call-completed`, never before (`event-where` / an
   entity-count fact if you add one).
2. `step12-signaler-broken-unseen`: the hero breaks the post unseen: no
   call starts, no wave. `step12-broken-after-wave`: broken after one
   wave: those people stay, no more come.
3. `step12-waves-never-pass-bound`: more finished calls than the table has
   rows: a wave each time, the room's people never above `bound`
   (control: `bound` raised past what fits, or the check switched off by
   a tuning switch `outpostBoundOn`, watched to exceed).
4. `step12-sneak-past-no-call` (in the real room): the hero crosses by the
   high way, no call starts. `step12-walk-out-ends-it`: the hero walks
   out through the doorway during a wave, arrives in the courtyard, and
   no new call starts or completes after (control: a tuning switch
   `outpostZoneEndOn` = 0 lets one complete).

## Traps

- **Determinism:** the server, the page and the harness all run `step`;
  any randomness or wall-clock read desyncs them.
- **A recorded tick shows the world before that tick's step**: an event
  at tick N shows in a fact from N+1 (npc-response.md, "Checking it").
- **A post with weight 400 still takes a hit's knockback:** measure that
  it doesn't slide; if it does, say so and pin it with its own tuning.
- **Don't count the post or the hero as people** in the bound.
- **`impact` fires one event per body**: count the post's break once.
- **Wave people stuck at `entry`:** keep `entry` clear of the post and
  the camp so a wave never spawns into a body or a wall
  (`clear-of-solid` fact).
- **Shared files** (`src/sim/types.ts`, `src/sim/systems/physics.ts`,
  `src/client/render.ts`, `content/tuning.json`): additive edits only,
  `git pull --rebase` right before each push, `npm run check` again
  after. Two other leads (Steps 8 and 11) push beside you.

## Out of scope — leave alone

The chase through doors and guards fighting the camp (slice B, after
you); Step 4's bell, alert, responders and their scenarios; Step 2's
combat numbers; Step 7's machine (G-09); saving anything; the look of
anyone (Step 8). If a nearby thing looks wrong, read
`docs/deliberate-designs.md`, then note it in `docs/for-the-lead.md`.

## Decided vs. open

Decided: everything in `docs/plan/step-12.md` "What's decided" and the
`DRAFT:` defaults above. Open, the owner's to judge by playing (do not
ask, list them in your handoff note): whether an endless fight is a
thrill or a chore, how fast waves grow, the horn's look and sound.

## Verified when

Rung: scenarios with watched controls, `npm run build`, `npm run check`,
`npm run e2e` (push 3), and after each code push `npm run check:deployed`
exits 0; read `/debug/errors` on the live address before each code push
(`docs/verifying-and-finishing.md`). Commit messages carry what you ran
and what you did not verify.

## Done, and where things go

Done: pushes 1–3 on `main` and live, or the last green push and a note
of where you stopped. Phase 6 rows this triggers: a new mechanism doc and
index line, `docs/architecture.md`'s "how to add", decisions in
`docs/decisions-log.md`, a handoff note at the end of
`docs/plan/step-12.md` ("Handoff notes"). A blocking question: message
the lead (`session_017WiGzJTXQVCWQYDDmC2UiY`) at once. Anything else (a
flag, a doubt): `docs/for-the-lead.md`; a question only the owner can
answer: `docs/questions-inbox.md`. Your final message: done or blocked,
the commit, and nothing else.
