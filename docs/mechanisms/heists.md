# Heists, stealth you can read, and the Use arbiter

**Reference.** Open it when touching what Use does, the Use button's word,
a watcher's drawn sight, a prize, cargo or a clean getaway (Step 19,
`docs/plan/step-19.md`). Everything here is `DRAFT:` (decisions-log
"Step 19").

## The Use arbiter (push 1)

`useHere(world, content, e)` in `src/sim/use.ts` says what a fresh press of
Use by this body would do here and now, or `undefined` for nothing. It is
the one answer every system that reads Use acts on, and (from push 2) the
one the page shows on the button.

- **Entries are one file each** in `src/sim/use/`, default-exporting a
  `UseEntry` (`id`, `order`, `find`); the directory is a registry
  (`scripts/lib/registries.ts`). The first entry, by `(order, id)`, with an
  answer takes the press. Tonight:

  | order | entry | answer when | the system that acts |
  |---|---|---|---|
  | 0 | `door` (`use/door.ts`) | the body's middle is in an enter doorway (`enterDoorwayAt`) | `room-doors` (600) takes it through |
  | 90 | `weapon` (`use/weapon.ts`, Step 23) | a played hero with hands, carrying no body, touching a loose weapon (its box widened by `weaponPickupReach`). Word: `pick-up`, or `swap` when the hand is full | `weapon-take` (62) puts it in hand (`docs/mechanisms/weapons.md`) |
  | 100 | `thing` (`use/thing.ts`) | the nearest untaken thing in the room within `npcInteractReach`, its keeper attending it; never while the body is out cold. Word: the thing's deed | `npc-interact` (60) does the deed |
  | 150 | `free` (`use/free.ts`, Step 13) | at a captive's shut cage; at the open cage, the freer, for a few seconds (`swap`) | `recruit-free` (61) holds, frees, swaps (`docs/mechanisms/recruits.md`) |
  | 200 | `bell` (`use/bell.ts`) | the body is by a cantina's bell (`byBell`) | `cantina-brawl` (640) rings it, ending a brawl |
  | 300 | `suplex` (`use/suplex.ts`, Step 25) | a played hero whose verbs include `suplex` holds a body (found by its `heldBy`, so a page sees it) whose toughness is above 0. Word: `suplex` | `suplex-press` (58) notes the press; `verbs/suplex.ts` heaves and slams (`docs/mechanisms/combat-and-impact.md`, "The suplex") |

- **An answer** is `{ entry, word, target?, at }`: `word` keys the button's
  words, `target` is the thing's entity id, `at` the pixel spot a mark
  bobs over.
- `INTENT:` **the door wins** (order 0), as it did before the arbiter
  (decisions-log 2026-11-23 "Doorways by Use").
- `INTENT:` **the nearest thing decides.** An unattended counter answers
  nothing; it does not pass the press to the next thing (Step 4's rule,
  moved unchanged).
- **Each system keeps its own fresh-press memory** (`c.roomDoors.use`,
  `c.interact`, `c.cantinaUse`) and its own effect; only the selection
  moved. They ask the arbiter at the moment they always decided (order
  60, 600, 640), so a press that takes a body through a doorway is still
  the door's when `cantina-brawl` asks after it, standing in the far
  doorway. Behaviour was unchanged: every scenario green with no
  re-timing, and blanking the arbiter fails 32 of them (the control).
- **No thing and bell overlap today**: the cantina's room has no
  placements file, so the order between `thing` and `bell` has never
  decided a press. Before the arbiter a press could have done both.
- **To add something Use does** (rescue's `free`, vehicles' `get-in`): one
  file in `src/sim/use/` with an order between the others, the system that
  acts asks `useHere(...)?.entry === '<id>'`, and (push 2) one row of words.

## The word on the button and the mark (push 2)

- **The words are data**: `content/prompts.json`, `words.<entry>.<word
  key>` (kind `src/content/kinds/prompts.ts`): door `go-in` "Go in",
  thing `take`/`buy`/`break`, bell `ring`. At most eight letters, no
  digits. `npm run check` refuses a placed thing whose deed has no word.
- **The page asks the arbiter** each frame with the composed world (its
  own character plus everyone received: the room's things, keepers and
  doorways): `usePrompt(content, world, me)` in `src/client/use-prompt.ts`,
  then `showUsePrompt` → `showUseWord` (`src/client/touch.ts`). The
  button keeps its element and `data-action`; `data-state` is the word
  key (`go-in`, `take`, `buy`, `break`, `ring`), absent for nothing.
  `go-in` keeps Step 5's door look (`.go-in`); the others dim the hand and
  set the word over it (`.says`, `src/client/index.html`).
- **The mark**: a small bobbing chevron over `answer.at`
  (`src/client/draw/use-hint.ts`); a doorway keeps its own up-arrow
  (`draw/door-hint.ts`).
- **What the page shows is its prediction**: the page's world holds the
  room's things and people as received, so for a frame or two around a
  take by a friend the button can name a good already gone. The server's
  arbiter decides; a press on a stale word does nothing.
- e2e facts `heist-word` (take at the goods, buy at the counter) and
  `heist-plate` (`scripts/e2e/heist.ts`).

## Sight you can see (push 3)

- **The band is the test, drawn.** `sightBox(content, watcher)` in
  `src/sim/npc/sight.ts` is the box `canSee` tests: where a target's
  *middle* must be (forward of the eye's column, the eye's column
  included, within `npcSightRange` across and `npcSightHeight` up or
  down). `bandCells` (`src/client/draw/band-cells.ts`, pure) cuts it on an
  8 px grid of the room and keeps a cell when `lineClear` (canSee's own
  line test, base tiles only) holds from the eye to the cell's middle.
  `canSee` itself is unchanged. `INTENT:` no detection rule is added
  (O-007 is open); if `canSee` changes, `sightBox` changes with it.
- **Held to it**: `scripts/checks/step19-band.ts`, for every placed person
  in every room facing both ways: every lit cell's middle is seen, every
  dark cell's middle in the box is not, a point past the box's edges is
  not. Controls (watched to fail): the box one cell wider; the cells
  without the line test.
- **Drawn** (`src/client/draw/sight.ts`), behind the bodies, for every
  person (`c.npc`) in the viewer's room not out cold: a pale wash and a
  brighter far edge. It flips the frame the person turns. The record:
  `drawn.sight.bands` (`id`, `facing`, `x0`, `x1`, `eyeX`, `cells`). The
  grain is 8 px: between two cell middles `canSee` can answer
  differently at a wall's edge. A hiding hero is not seen inside a band
  (Step 4's rule); the band does not show that.
- **An unseen deed**: a `deed` event by a player with no `witnesses`
  (from the server's events, `net.latest()`, fed by `watchSightEvents`
  in main.ts) draws a closed eye and a tick over where it was done for a
  second and a half (`drawn.sight.unseen`). The look `unseen`, when cut,
  replaces the drawn stand-in. A buy at a counter is never unseen: the one
  it is done to always perceives it.
- Scenarios `step19-unseen-take-street` (the shopkeeper's 1.5 s glance
  away, tick 720: no witnesses, alert 0) and its control
  `step19-unseen-take-street-control` (tick 640, facing the goods:
  witnessed by her); e2e fact `heist-band` (her band flips with her).
- The Use mark (push 2) sits over the hero's head when the hero is taller
  than the thing, as the doorway arrow does.

## A prize in your hands (push 4)

- **A place with a prize** is one file, `content/heists/<id>.json`
  (kind `src/content/kinds/heists.ts`): `room`, and `prizes`, each a
  placed thing of that room (`once`, deed `take`, no keeper) with the look
  shown in the carrier's slot (`carried`) and the look left on its stand
  (`taken`). Tonight: `camp` (`camp-strongbox`, `content/placements/
  outpost.json`) and `depot` (`depot-hoard`, Step 16's thing, named here,
  never edited there). No "begin heist" flag (doc 07): nothing announces
  a job.
- **The rules** (`src/sim/systems/heist-cargo.ts`, order 607; helpers in
  `src/sim/heist.ts`):
  - A take of a prize puts it in `world.cargo` (hero entity id → thing
    id): `prize-taken`.
  - A carrier out of the place's room on their own feet (`onOwnFeet`: not
    out cold, held or flying) banks it: `world.banked`, `prize-banked`.
  - **Clean** when no person placed in that room (wherever they are now)
    ever had a played hero in sight (`canSee`, the band's test) from the
    first played hero coming in to the banking: `clean-getaway`. So a job
    seen once, horn or no horn, is banked but not clean. A job ends when no
    played hero is in the room and nobody carries its prize: the next
    visit starts clean. `DRAFT:`.
  - A prize taken with nobody carrying it (a kept game from before cargo,
    or a carrier who left the game) counts as banked, quietly.
  - `returnPrize(world, thing)` puts a carried prize back on its stand
    (clears the cargo and `takenBy`) and returns who carried it; Step 21's
    throw-out calls it and emits `prize-returned`.
  - `INTENT:` it reads rooms each tick, never `changed-room` (the server
    sees no door event for a player), and acts only on prizes whose thing
    entity is in the world: a page's own world has none, so only the
    server writes `cargo`, `banked` and `jobs`; pages take them by key.
- **Shown**: the carried look in the plate's cargo slot (`fillHudSlot`,
  `src/client/draw/heist.ts`); a taken prize's stand shows its `taken`
  look; a `clean-getaway` (anyone's) queues the banner "Nobody noticed"
  and plays the `clean-getaway` sound (the jingle, heard in every room).
  A shop take is never a getaway: the street has no heist file.
- **The camp's strongbox is at column 34**, not the brief's first guess
  (23): the ledge has no way down but its ends, and every way to 23 on the
  floor passes the lookout or fighter 1 in plain sight. At 34 only fighter
  2 watches it (facing it 7 s of 10); the flyer drops off the ledge's east
  end, takes it while fighter 2 looks away, flaps back up through the
  ledge and walks out over everyone (`step19-camp-clean`).
- Scenarios: `step19-camp-clean` and its control
  `step19-camp-clean-control` (seen once by fighter 2, no call: banked,
  not clean), `step19-cargo-waits-for-the-door` (taken and still inside:
  never banked). Real server, two connections:
  `scripts/checks/step19-heist.ts` (cargo, banked, `clean-getaway` on both
  pages; control seen, none).
- **Not built**: a loud camp job with every watcher knocked flat and the
  horn never sounded (the brief's `step19-camp-loud-no-horn`); the control
  covers "seen, no horn, not clean". See `docs/plan/step-19.md`, Builder
  notes.

## The lure comes back (push 5)

- A placed `once` thing may carry `restock` (seconds, 1 to 3600;
  `src/content/kinds/placements.ts`): `heist-restock` (order 615) puts it
  back, untaken, that long after it was first seen taken (`c.restockFrom`
  holds the clock; event `restocked`). A good taken in an older kept game
  comes back that long after the game is next played.
- Tonight the street's three ordinary goods, 60 s each. `INTENT:` never a
  bell (a broken bell stays broken), the special good (a piece, found
  once) or a prize (only `returnPrize` puts one back): the check refuses
  `restock` on them.
- Scenarios `step19-restock` (taken at 720, back at 4320, taken again) and
  `step19-restock-control` (the test shop's good, no restock: never back).
