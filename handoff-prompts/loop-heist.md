# Core loop 2, heists and stealth: a job you can read (new Step 19)

Brief for one cold builder. Written 2026-11-23 19:40 UTC by the core-loops
re-plan (`docs/plan/core-loops.md`, section 2; read it and its "Names the
slices share" table first: you own most of those names). The step is
`docs/plan/step-19.md`. Read `docs/mechanisms/npc-response.md`,
`docs/mechanisms/outposts.md`, `docs/mechanisms/rooms-and-doors.md`
("Doorways by Use"), `docs/mechanisms/network.md` ("Traps") and
`docs/mechanisms/art-pipeline.md` ("Approved Drive assets first") before
writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-19.md`, "Builder notes".

**Small pushes, each standing alone and fully checked. Pushes 1 and 2 unblock
three other builders: land them first and report at once.** If you pass about
300k tokens after push 3, report and stop: the orchestrator re-briefs the
rest.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"): **"I want to play it as I described it.
There are no heists or stealth yet ... no risk. Virtually everything described
in the vision docs that would make the game genuinely fun to play is yet to be
seen at all"**

The sneaking exists (sight, witnesses, calls, two zero-alarm routes at the
depot) and a phone player cannot see any of it: nothing shows what a watcher
sees, the Use button does not say it can take, a taken thing pays nothing, and
a clean job is not marked. This slice makes the job readable and gives it a
prize you have to carry out. It moves no row of `docs/plan.md`'s table by
itself; it feeds gate E through the waves slice's detector.

The library (doc 11): **D-016** zero-alarm success should be deeply
satisfying; **D-019** failure opens fights and escapes, never a reload;
**D-061 to D-066** seeing is not calling; **D-081** a hit can cost carried
items; **D-093** a few context-sensitive touch controls. Doc 07: heists are
discovered opportunities with no "begin heist" flag; "detection cones or
simple proximity checks"; "confiscation" among the consequences. The owner's
comp A00-01 draws a vision cone and lists it in its legend. O-007 (detection
rules) is OPEN: **add no rule; draw the one that exists.**

## Measured for you (main at a0f402c; nothing was run in the repository)

- **Use is read by three systems, each with its own fresh-press memory and a
  hand-written rule that the door wins:** `src/sim/systems/room-doors.ts:118-121`
  (`c.roomDoors.use`), `src/sim/systems/npc-interact.ts:30-36` (`c.interact`;
  the nearest untaken thing within `npcInteractReach` 20 px, lines 38-52; its
  keeper attended, 53-57) and `src/sim/systems/cantina-brawl.ts:43-49`
  (`c.cantinaUse`, the bell). `scripts/lib/registries.ts:16` lists four
  self-registering directories.
- **The button** says "Go in" only: `showGoIn` (`src/client/touch.ts:52`),
  called at `src/client/main.ts:248` with `inEnterDoorway`; it sets
  `data-state="go-in"`, which `scripts/e2e/doors.ts` reads. A page's own world
  holds only its own character; `render` is given the composed world at
  `main.ts:245`.
- **Sight** is `canSee` (`src/sim/npc/sight.ts:35-48`): same room, in front,
  within `npcSightRange` 112 px across and `npcSightHeight` 40 px up or down
  between the two bodies' middles, no solid tile on the line, the watcher not
  out cold, the target not hiding.
- **An unseen deed is already known:** the `deed` event
  (`src/sim/npc/state.ts:64`) carries `witnesses: string[]`.
- **A take pays nothing and never comes back:** `npc-interact.ts:58` sets
  `takenBy`, nothing in `src/` clears it, and a kept game keeps it. The
  depot's hoard has been live since 18:25 UTC, so some kept games have it
  taken already.
- **The server sees no `changed-room` event for a player** (the page owns
  `room`; `src/sim/systems/level-explore.ts:24-26`, an `INTENT:`). Read rooms
  each tick.
- **The shop:** the keeper faces the goods 5 s, away 1.5 s
  (`content/placements/castle-street.json`).
- **The Bandit Camp** (`content/placements/outpost.json`, no `things` today):
  lookout at column 18 (left 6 s, right 2 s), horn post at 20, fighter 1 at 25
  (left 8 s, right 3 s), fighter 2 at 28 (right 7 s, left 3 s); the ledge is
  row 6, columns 9-38, 64 px over the floor, above everyone's sight.
- **The depot** is Step 16's: hoard `depot-hoard` at [45, 13], 65 `step16-*`
  scenarios, two zero-alarm routes and three caught ones.
- **HUD looks are cut and drawn nowhere:** `hud-plate`, `hud-face-*`,
  `ui-use`, `alert-pip`, `bell-gauge` (`content/looks/ui.json`); `grep
  hud-face src/client` finds nothing. **Two banners exist, each drawn by
  itself:** the legend's (`src/client/draw/hall.ts`) and the level's name
  (`src/client/draw/levels.ts:177-183`, 120 frames, on `main` since 4022fd6).
- **Looks cut for this** (316e0a0, `content/looks/treasure.json`):
  `chest-iron-closed`, `-open`, `-empty`, `chest-closed`, `-open`, `-empty`,
  `gold-sack`, `key`, `hoard` and `hoard-taken` (made for `depot-hoard`).
- A page is sent only the entities of its own room
  (`src/server/game.ts:527`); every world event reaches every page
  (`snap.ev`, line 528).

## What to build (`DRAFT:` throughout; decisions-log entry "Step 19")

1. **Push 1, the Use arbiter, and nothing else.** One exported function in
   `src/sim/use.ts` that says what a fresh press of Use by this body would do
   here, from entries that are one file each in `src/sim/use/` (door, thing,
   cantina bell), in a fixed order (the door wins, as today);
   `REGISTRY_DIRS` gains the directory. The three systems call it instead of
   their own selection and keep their own effects. **Behaviour unchanged:
   every `step3-*`, `step4-*`, `step11-*`, `step12-*` and `step16-*` scenario
   green with no re-timing.** Report the commit: the rescue slice starts on
   it.
2. **Push 2, the word and the shared layer.**
   - The button shows the arbiter's word (TAKE, BUY, BREAK, RING, GO IN):
     words as data in `content/prompts.json` (kind file
     `src/content/kinds/prompts.ts`), `src/client/use-prompt.ts` in place of
     the boolean, called with the composed world. Keep `data-state="go-in"`;
     add `take`, `buy`, `break`, `ring`. A small bobbing mark over the target
     (`src/client/draw/use-hint.ts`).
   - `src/client/draw/banner.ts`: one queue for the short banners at the top;
     one at a time, never over the controls, each goes by itself (`INTENT:`
     it takes no input and stops nothing). Other slices add an entry from
     their own draw file. Move the level's name (`draw/levels.ts:177-183`)
     into it, an agreed edit (slice A is done and reviewed), keeping what
     `drawnLevels()` reports for the e2e.
   - `src/client/draw/hud.ts`: the top-left plate with the party's faces
     (`world.party`, `world.taken`), the viewer's lit, and three small slots
     beside the viewer's face that other slices fill (power, cargo,
     condition). Document both in `docs/mechanisms/rendering-world.md`.
3. **Push 3, sight you can see.** One export in `src/sim/npc/sight.ts` giving
   the box `canSee` tests for a watcher (`canSee`'s answers unchanged);
   `src/client/draw/sight.ts` draws it, faint and behind bodies, for every
   person (`c.npc`) in the viewer's room who is not out cold, cell by cell,
   only where the line from the watcher's middle is clear, flipping with their
   facing. **It must draw exactly what `canSee` tests, or it lies.** An unseen
   take (a `deed` with no witness) draws a soft tick and a closed-eye mark.
4. **Push 4, a prize in your hands.**
   - A content kind `content/heists/<id>.json`
     (`src/content/kinds/heists.ts`): the place's room and its prize things.
     Tonight: the camp (`camp-strongbox`) and the depot (`depot-hoard`, named
     here, never edited there).
   - **The camp's strongbox:** one `things` entry in
     `content/placements/outpost.json`, inside a watcher's beat (first guess
     column 23, between the post and fighter 1), with a new look name in
     `THING_LOOKS` (`src/content/kinds/placements.ts:59`; the glints slice
     adds its own name on the same line: rebase).
   - **Cargo.** TAKE on a prize puts it on the taker: `world.cargo` (hero
     entity id to thing id), an icon in the HUD's cargo slot, event
     `prize-taken`. It is banked when that hero is out of the place's room on
     their own feet (not flat, held or flying): `world.banked` gains the thing
     id, event `prize-banked`. Export one function that puts a carried prize
     back on its stand (clears the cargo and the thing's `takenBy`): Step 21's
     throw-out will call it. A prize already taken in an old kept game, with
     nobody carrying it, counts as banked; so does one whose carrier left the
     game.
   - **"Nobody noticed."** Clean means: from the first hero entering the
     place's room until the prize is banked, no person of that place ever had
     a played hero in sight (`canSee`, the same test the band draws). Then
     `clean-getaway`, a chime and a banner. A loud job with the horn never
     sounded is not clean. A shop take is never a getaway: its reward is the
     piece.
5. **Push 5, the lure comes back.** An optional `restock` (seconds) on a
   thing (`placements.ts:133`, additive); a small system clears `takenBy`
   after it. Set it on the street's three ordinary goods, never on a prize,
   the special good or a bell.

**How it reaches a phone:** `world.cargo` and `world.banked` are top-level
world fields (copied by key, kept with a kept game); `prize-taken`,
`prize-banked` and `clean-getaway` are world events; the bands and the word
are drawn by the page from entities of its own room.

## Signal

- Scenarios, each with a control watched to fail:
  `step19-use-unchanged` is the existing suites staying green (push 1);
  `step19-unseen-take-street` (real street: a good taken in the keeper's
  1.5 s look away: a `deed` with no witness, alert 0; control: a beat earlier,
  witnessed); `step19-camp-clean` (real camp: in, the strongbox, out, never
  seen: `prize-banked` and `clean-getaway` once; control: seen once, banked,
  no clean event); `step19-camp-loud-no-horn` (every watcher knocked flat in
  plain sight, the horn never sounded: banked, no clean event);
  `step19-cargo-waits-for-the-door` (taken and still inside: not banked;
  control: outside, banked); `step19-restock` (a good is back after its time;
  control: no `restock`, never).
- `scripts/checks/step19-heist.ts`, a real server and **two connections**: A
  takes the strongbox and walks out; A's own world and B's own world (in
  another room) each have the cargo, then the banked prize, and both get
  `clean-getaway` in their events (control: A is seen first; no clean event).
- `npm run e2e`, phone page by touch, deterministic touches only: at the shop
  the Use button's `data-state` reads `take` at the goods and `buy` at the
  counter; the page's drawn record (`window.irreverents.drawn`, an additive
  field) lists the keeper's band and it flips with her facing; the party
  plate lists three faces.
- Screenshots at 844×390 and 390×664: the button's words, a band, the plate,
  a banner; under `docs/plan/step-19-shots/`.

## Traps

- **Approved Drive assets first** (4ed30c3): the plate, the faces, the chests
  and the gold sack are cut already; the eye and attention marks are on P07's
  UI atlas: ask the core-loop art cut-outs builder (its session is on the
  Sessions line of `docs/current-directive.md`) for them. No hand-drawn final
  look.
- **Step 16's depot is still being worked on** (a builder is in
  `content/rooms/quarry-*.json` and `content/placements/quarry-*.json` until
  about 20:40 UTC): edit none of its files, copy none of its scenarios'
  inputs. Ask the Step 16 lead (the session claiming Step 16 in
  `docs/plan.md`) to add a `clean-getaway` expectation to its own zero-alarm
  and caught scenarios once push 4 is on `main`.
- **The camp's files have one owner at a time:** `content/placements/outpost.json`
  is yours; `content/outposts/outpost.json` is the waves slice's;
  `content/rooms/outpost.json` is nobody's. Every `step12-*` scenario stays
  green with the strongbox present.
- **`content/placements/castle-street.json`:** the glints slice edits it in
  its push 1 (a special good, two crates); your restock fields come after.
- **Another builder is in `src/client/main.ts`** (hit prediction, reverted at
  7908aa8 and coming back): your edit there is the one call at line 248. The
  glints slice adds a piece row to `src/client/draw/levels.ts`: rebase.
- `t-no-numbers` reads every string drawn in the picture: no digits.
- **Read new fields with a default** (`world.cargo ?? {}`, `world.banked ??
  []`, a thing with no `restock`).
- The band is per person, each frame: keep it cheap on a phone (a box of
  about 7 by 5 tiles per watcher).
- Stop test servers by PID. If live is healthy on an older commit after a
  push, wait, don't revert.

## Out of scope

Any new detection rule; Hall records (the waves slice reads `clean-getaway`);
being thrown out and a prize dropped by a hit (Step 21); money and an
inventory; shop interiors; the depot's own data.

## Decided, and open

Decided by the owner: the D-numbers above. Every specific here is a `DRAFT:`
you log: the band's look, the words, what counts as clean, cargo until the
door, restock, the strongbox's place. Nothing waits on the owner. For the
owner to judge by playing, not asked: whether a band makes sneaking a plan,
and whether walking out with it in your hands feels like getting away with
something.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed;
`check:deployed`, `check:live`; `/debug/errors` read. A
`docs/mechanisms/heists.md` with its line in `docs/mechanisms/README.md`; the
architecture's "I need to add…" table gains "something Use does" and "a place
with a prize", and its path table a Step 19 row; decisions-log entries;
`docs/plan/core-loops.md` section 2 and its names table updated to what
landed. Final message: done or blocked, the commit.
