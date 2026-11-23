# Core loop 1, hidden places: glints you can see before you can reach them (Step 14, slice B)

Brief for one cold builder. Written 2026-11-23 19:40 UTC by the core-loops
re-plan (`docs/plan/core-loops.md`, section 1; read it and its "Names the
slices share" table first). The step is `docs/plan/step-14.md`: read its top
section, "What's decided" and slice A's notes. Read
`docs/mechanisms/levels.md`, `docs/mechanisms/rooms-and-doors.md`,
`docs/mechanisms/saves.md`, `docs/mechanisms/network.md` ("Traps") and
`docs/mechanisms/art-pipeline.md` ("Approved Drive assets first") before
writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-14.md`, "Builder notes", a "Slice B" heading.

**Small pushes, most visible first, each standing alone and fully checked.**
A push to `main` is the deploy.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"): **"I want to play it as I described it.
There are no heists or stealth yet, no puzzles, no hidden places to explore
... Virtually everything described in the vision docs that would make the game
genuinely fun to play is yet to be seen at all"**

The hidden places exist and are empty. This slice puts something to find in
them, shows it before it can be reached, and makes finding a place or a piece
a moment. It moves no row of `docs/plan.md`'s table (no build gate covers it);
it is read by the owner playing.

The library decides the rest (doc 11): **D-078** hidden components that
assemble into a final object whose identity is unknown while collecting;
**D-079** it says there is more, never which or where, and hidden rooms count;
**D-082** component completion is kept; **D-089** the complete set lets a
chased hero into the cantina, "NOT a wanted-level reset or shelter"; **D-090**
the chasers follow inside. Doc 29 (n/m display, pickup pop, one shared
collectible system) and doc 30 part D (a found piece is never lost) are
PROPOSED: used as `DRAFT:`.

## Measured for you (main at a0f402c; nothing was run in the repository)

- **Slice A is on `main`, done and reviewed** (2b316ce, 4022fd6; reviewed at
  a0f402c, its brief deleted): levels as data, `world.levels` and
  `levelProgress` (`src/sim/systems/level-explore.ts`, `src/sim/levels.ts`);
  each entrance drawn with its sign, name and pie, and a level-name banner
  (`src/client/draw/levels.ts`, the banner at lines 177-183; `drawnLevels()`
  is what the e2e reads); the menu's rows (`src/client/start.ts:387-388`).
  `castle-town` has no entry (`content/levels/castle-town.json`,
  `entries: []`), so the town never has a sign: its pieces show in the menu
  row only.
- **A first entry is silent:** `level-explore.ts:53-57` pushes to `seen` and
  emits nothing.
- **The first street screen** (`content/rooms/castle-street.json`): the awning
  is one-way tiles at row 8, columns 7-9; under it the cellar doorway (column
  7, rows 9-10) and the hide part `awning-curtain` (columns 8-9). The shop
  (`content/placements/castle-street.json`): counter at column 12, goods at
  13, 14, 15, the villain walks to 17, the bell is at 24, the keeper faces
  right 5 s and left 1.5 s. **`INTENT:` in that room: "the roofs are a way
  nothing points at ... Do not mark it. Nothing here points at anything: no
  arrows, no glow, no text."** So no piece goes on any roof or ledge of the
  street.
- **Reach:** this plan's check sampled the three heroes' jumps: each clears
  the 48 px from the floor to the awning with 3 to 5 px to spare, on a
  full-hold jump only. Step 16's builder measured the grappler's rise at about
  37 px in its own scenario. Measure yours with `node scripts/trace.ts`
  before placing anything.
- **Taking a thing:** `src/sim/systems/npc-interact.ts:58` sets
  `thing.takenBy` once and `:59` emits `did { deed, by, target, thing }`.
  Nothing in `src/` ever clears `takenBy`, and a kept game keeps it.
  Things are drawn by look in `src/client/draw/npcs.ts:147-149`; the looks
  allowed are `THING_LOOKS` (`src/content/kinds/placements.ts:59`: counter,
  goods, bell).
- **The undercroft has nothing to throw:** there is no
  `content/placements/undercroft.json`. A carried body is let go when its
  carrier changes room (`src/sim/systems/carry-hold.ts:27`); the check
  measured a crate carried into the street's cellar doorway staying in the
  street. `vault-wall` (column 4, rows 11-12) breaks only to a body arriving
  sideways at 200 px/s or more (`src/sim/systems/room-breakable.ts`, an
  `INTENT:`, the wall has no health). Measured with a placed crate: the
  infiltrator and the flyer break it point-blank; the grappler's point-blank
  throw hits the solid tile above the crack and breaks nothing, and breaks it
  from about eight tiles back. 8 of the 25 `step3-*` scenarios name the
  undercroft.
- **Where pieces can go** (area ids are permanent): undercroft `vault`
  (columns 1-3, rows 10-12) and `secret-chamber` (columns 5-10, rows 2-4);
  courtyard, behind the gate (columns 26-28, floor row 7); hall-gallery
  `balcony` (row 2; the floor is kept clear for pedestals: place nothing
  there); quarry-road `flyer-ledge`, quarry-ridge `crawl-pocket` and
  `ridge-shelf`, quarry-pit `out-of-reach` (the ledge at row 8, columns 4-8,
  eleven tiles up: nobody reaches it until the wings of
  `handoff-prompts/loop-powers.md`), quarry-cave.
- **The cantina's lock:** the refusal is one test, `src/sim/systems/room-doors.ts:133`;
  `world.chased` is written by `cantina-chase.ts:51` and will be read by
  others. Leave `world.chased` alone.
- **Looks cut for this** (51c8cdb, 316e0a0; `tools/art/props/README.md`,
  "Core loops"): loose items `item-gear`, `item-lens`, `item-pipe`,
  `item-crystal`, `item-spring`, `item-book`, `item-hook`, `item-ring`,
  `item-feather` (18 by 16), `fx-pickup-glow` (loops under a lying pickup),
  `fx-pickup-get` (`content/looks/powers.json`); `gem`, `gem-pedestal`,
  `hoard`, `hoard-taken`, `vault-cave` (`content/looks/treasure.json`).
  **Not cut:** grey and gold puzzle pieces for the found row (the P05 HUD
  sheet's bottom row). No secret chime is wired (`content/sounds/` has
  `pickup`); the owner's A01-01 sound pack holds a `secret_found_chime`.

## What to build (`DRAFT:` throughout; decisions-log entry "Step 14 slice B")

1. **Pieces are data.** A content kind `content/completion/<level id>.json`
   (`src/content/kinds/completion.ts`): `pieces`, each `{ id, room, tile }`,
   or `{ id, from: { "thing": id } }` (found whenever that thing's `takenBy`
   is set, read as state, so an old kept game is not locked out), or
   `{ id, from: { "prize": id } }` (found when `world.banked` lists it: the
   heist slice writes that field; read it with a default of empty); and
   `builds` (the finished thing: its look, room, tile, what it does). Ids
   never say what anything is. The check refuses a piece in a solid tile or a
   room outside the level.
2. **Finding.** `world.found` (top-level, by level id, piece ids; additive;
   only ever grows). System `completion-find`: a played body whose box
   overlaps a piece's tile finds it for everyone; emits `piece-found`. A
   thrown crate finds nothing. The last one emits `set-complete`.
3. **A hidden place found is a moment too.** The first time a played hero is
   in a room or area marked `hidden`, emit `place-found`; the page flashes the
   level's pie at the top with the chime. Nothing is drawn in the room.
4. **Seen before reached.** `src/client/draw/completion.ts`: a small glint at
   every unfound placed piece in the viewer's room, a pop when found, and a
   short row of grey pieces with the found ones gold. Use
   `src/client/draw/banner.ts` if the heist slice has landed it; until then
   draw your own and move it over later.
5. **The first batch (push 1):**
   - a piece **just over the awning** (first guess tile [8, 7]: a plain hop
     from the street floor should touch it; measure all three heroes);
   - **a visibly special good** on the shop's shelf (first guess column 16; a
     new once-only take thing with a new look name added to `THING_LOOKS`),
     and a town piece `from` it: taking it, seen or unseen, is the piece;
   - **two light crates on the street** (east of the doorway at column 28,
     west of the guard's beat at 37; never beside a plate): the Hall's gate
     needs a solo weight nearby.
6. **The rest (push 2).** Town: behind the gate's bars; the vault, with **one
   light crate in a new `content/placements/undercroft.json`** near `cellar-up`
   (column 27), well away from the wall; the secret chamber; the gallery
   balcony. Quarry: the flyer's ledge, the crawl pocket, the pit's
   out-of-reach ledge, the ridge shelf or the cave, and the hoard as
   `from: { "prize": "depot-hoard" }`. Bandit Camp: one row for the heist
   slice's strongbox when it lands. Counts are yours to set and log.
7. **What the pieces build (push 3).** A real object per level cut from the
   approved sheets (doc 29's candidates: a comic contraption, a statue for the
   Hall, an odd tool), with a short snap-together moment, and it does one
   thing through behaviour the game already has. Ask the core-loop art
   cut-outs builder (its session is on the Sessions line of
   `docs/current-directive.md`) what it can cut. **Never a stand-in or a grey
   box; if no sheet covers one, tell the orchestrator (it goes on the Drive's
   missing-assets list) and leave that level's set unassembled. Never name the
   object in an id, a log, a note or a report: the owner finds out by
   playing.**
8. **The piece row** beside the pie on each entrance sign and menu row
   (`src/client/draw/levels.ts`, `src/client/start.ts`): additive edits to
   slice A's two files, which are done and reviewed; keep what `drawnLevels()`
   reports.
9. **D-089 with D-090.** With every set complete, the exception goes in the
   door's refuse test (`room-doors.ts:133`). Ship it only if the chasing guard
   who saw the hero go in arrives in the cantina and the alert has not
   dropped; if guards cannot act sensibly inside the brawl, hold it back, log
   it and tell the orchestrator.

**How it reaches a phone:** `world.found` is a top-level world field (copied
by key in every snapshot, kept with a kept game); `piece-found`,
`place-found` and `set-complete` are world events (`snap.ev`), so a friend in
another room sees the flash.

## Signal

- Scenarios, real rooms, each with a control watched to fail:
  `step14-find-awning` (a hop takes it, found for both players; control: a
  thrown crate touching it finds nothing); `step14-find-special-good` (Use at
  the shelf, found; control: an ordinary good, not found);
  `step14-find-vault` (`placements: true`: a real grab and throw of the
  undercroft's own crate, the grappler's from a distance; control: wall
  unbroken, not found); `step14-place-found-once` (first entry to the vault
  area emits `place-found`, a second entry does not);
  `step14-all-found-opens-cantina` (all found and chased: the door lets the
  hero in, the guard who saw them arrives in the cantina, the alert has not
  dropped; control: one short, refused).
- `scripts/checks/step14-found.ts`, a real server and **two connections**: one
  finds a piece, the other connection's own world has it; a kept game keeps it
  across everyone leaving and a rebuilt server (control: saving off).
- `npm run e2e`, phone page by touch, one deterministic touch: from the start
  walk east and hold Jump for the full rise under the awning; the page's drawn
  record (`window.irreverents.drawn`, an additive field) shows one gold piece
  in the town's row (control: read before the jump, none).
- Screenshots at 844×390 and 390×664 of the glint, the pop and the row,
  under `docs/plan/step-14-shots/`.

## Traps

- **Approved Drive assets first** (4ed30c3): use the cut `item-*` looks for
  the pieces in the world (doc 29's own candidates: gear, lens). Pieces grey
  and gold for the row are on the P05 HUD sheet's bottom row: ask the
  core-loop art cut-outs builder (its session is on the Sessions line of
  `docs/current-directive.md`) and agree their ids. No hand-drawn final look.
- **Every `step3-*`, `step4-*` and `step11-*` scenario stays green** with the
  new crates and the new thing present. If one breaks, move the placement,
  not the scenario.
- **Draw no digits** (`t-no-numbers`): the row is pieces, never "2/5".
- **Nothing at a false wall, a hidden door or a roof.** The glint marks a
  piece, never a way.
- **Other builders nearby:** the heist slice will move the level-name banner
  in `src/client/draw/levels.ts` into its shared queue; it also edits
  `content/placements/castle-street.json` after your push 1 (restock fields)
  and owns `src/client/draw/banner.ts`; hit prediction and others are in
  `src/client/main.ts`. Yours: new files, one line in `src/client/render.ts`,
  the agreed edits named above. `git pull --rebase` before each push.
- **Read new fields with a default** (`world.found ?? {}`, `world.banked ??
  []`): old kept games have neither.
- A page's own world runs systems too: `completion-find` must only add what
  the server adds (as `level-explore` does), or do nothing there.
- Stop test servers by PID. If live is healthy on an older commit after a
  push, wait, don't revert.

## Out of scope

A map; any room's tiles (`content/rooms/**`); the depot's and the camp's files
(the hoard and the strongbox become pieces through your own data); the stone
plate and portcullis (core loop 8); what a power or a prize is.

## Decided, and open

Decided by the owner: D-078, D-079, D-082, D-089, D-090. Everything else here
is a `DRAFT:` you log (how many pieces and where, the object and what it does,
the flash, the special good). Nothing waits on the owner. For the owner to
judge by playing, not asked: whether a glint makes you want to reach it, and
whether what the pieces build was worth it.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed;
`check:deployed`, `check:live`; `/debug/errors` read. A "Pieces" section in
`docs/mechanisms/levels.md`; the architecture's "I need to add…" table gains
"a piece" and "a set"; decisions-log entries, one of them the reading that a
glint over the awning does not point at the roofs (and that doubt filed in
`docs/for-the-orchestrator.md` for the owner's list); `docs/plan/core-loops.md`
section 1 updated to what landed. Final message: done or blocked, the commit.
