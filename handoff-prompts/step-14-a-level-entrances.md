# Step 14, slice A: level entrances you can see, that show what you've discovered

Brief for one cold builder. Written 2026-11-23 18:18 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`). The step is `docs/plan/step-14.md`: read
its "Why", "What's decided" and the new "Slice A" section. Read
`docs/mechanisms/rooms-and-doors.md`, `docs/mechanisms/saves.md` and
`docs/mechanisms/art-pipeline.md` ("Approved Drive assets first") before
writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-14.md`, "Builder notes" at its end.

**Small pushes, each standing alone and fully checked. The owner is playing
now.** A push to `main` is the deploy.

## The task, and why

The owner, 2026-11-23 ~18:10 UTC, first-hand, playing on a phone:
**"Not finding clear 'level entries' with discovered indicators etc"**

Today the way into each place is a plain dark doorway like any other
(courtyard → the Bandit Camp at column 23, courtyard → the quarry at columns
17–19, castle street → the cantina at column 20). Nothing says "a level starts
here", what it is called, or whether you have been.

The library decides the rest (doc 11, quoted in the step file): **D-078** "each
substantial playable level/region should have clear measures of completion",
**D-079** "An EXPLORED % is an explicitly welcomed idea: player knows there's
more to discover without the game revealing WHICH route, room or secret is
missing. Hidden rooms should contribute to the percentage".

**The look is already in the owner's Drive** (approved source sheets; re-author
from them, never redraw from words):
- `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-secrets-doors-breakables-source.png`,
  top row: a plain door, a locked door, a glowing open arch, **an ornate door
  with a gem**, a barred gate, **a swirl portal**, **a timbered mine entrance**.
- `…/p05-ui-hero-party-hud-source.png`, bottom row: a compass medallion,
  **completion pies** (empty ring, quarter, three-quarters, full gold with
  sparkles), puzzle pieces (grey to gold: slice B's components).
- P07's interactables and UI atlas (`…/p07-*/`) for more doors and badges.

## What to build (`DRAFT:` throughout; decisions-log entry "Step 14 slice A")

1. **Levels are data.** A new content kind `content/levels/<id>.json`
   (`src/content/kinds/levels.ts`): `id`, `name` (shown; a name is data, never
   in an id), `rooms` (its room ids), `entries` (`{ room, door }` pairs: the
   doorways that lead into it from outside), `look` (which entrance art).
   Tonight: `castle-town` (throne room, castle street, courtyard, undercroft,
   hall gallery; where you start, no entry), `bandit-camp` (outpost; entry
   courtyard `to-outpost`), `iron-quarry` (the six `quarry-*` rooms; entry
   courtyard `to-quarry`; "Iron Quarry" is doc 28's name for it), `cantina`
   (entry castle-street `to-cantina`). Adding a level is one file, no code.
   The check refuses a level whose entry or room does not exist, and a room in
   two levels.
2. **The entrance is drawn as an entrance.** At each entry doorway, a framed
   portal from the sheet (the ornate gem door for the camp, the mine entrance
   for the quarry, the glowing arch for the cantina: your pick, as data), big
   enough to read at 320×180, drawn behind bodies, never over the controls.
3. **Discovered, and how much.** Per game, per level: `discovered` (a hero
   someone plays has been inside) and the places of it seen. State lives at the
   top of the `World` (`world.levels`, additive; Step 17 keeps every top-level
   field in a kept game, baa651b), written only by the server's step.
   - Not discovered: the entrance shows the **empty ring** and no name.
   - Discovered: the entrance shows the level's **name** on a small sign
     (the game's pixel font) and its **completion pie**: the share of the
     level's rooms and `areas` entered, hidden ones included (D-079), in
     quarters rounded down, full gold only at everything. A pie, not a digit.
     It never says which or where.
   - First time through an entrance: the level's name across the top for two
     seconds (it stops nothing: `INTENT:` there is always a way out).
4. **The menu** (Step 17's panel, `src/client/start.ts`): a row per discovered
   level with its name and pie. Additive; if the panel has no room, say so.
5. A page's own world must show it: `world.levels` comes down in snapshots
   like `world.rooms` does (`docs/mechanisms/network.md`: "copied by key").

## Signal

- Scenarios `scenarios/step14-*.json`: (a) before anyone enters, the quarry
  is not discovered; a hero walks through `to-quarry` and it is, with exactly
  the road's share seen; (b) the hidden cave counts in the total from the
  start and is not shown anywhere until entered; (c) a control: a room outside
  every level changes nothing.
- `scripts/checks/step14-*.ts` on a real server: a kept game (`game-XXXX`)
  keeps its discovered levels across everyone leaving and a rebuilt server.
- `npm run e2e`, phone page by touch: standing at the courtyard's quarry
  entrance, the page draws the entrance art and the empty ring; after going in
  and coming back, the name and a part-filled pie (read from
  `window.irreverents.drawn`, an additive field).
- Screenshots at iPhone size, sideways and upright, of both states, committed
  under `docs/plan/step-14-shots/`.

## Traps

- **Approved Drive assets first** (4ed30c3): cut the entrance frames, the sign
  and the pies from the P05/P07 sheets (clean alpha, native pixels, test at
  320×180). The props builder (`session_017WiGzJxBqVvizcghgHk5NG`) owns
  `assets/props/`, `content/looks/`: message it first; either it cuts
  `level-entry-*`, `level-pie-*` and `level-sign` looks for you (name them
  together), or it agrees you add one sheet of your own under a new name.
- `t-no-numbers` (Step 2) reads every string drawn in the picture during a
  fight in the start room: draw no digits anywhere in this slice.
- The doorways' behaviour does not change (Use / GO IN, 095775b); the cantina's
  door still refuses a chased hero (Step 11).
- `?room=` check worlds must not write the owner's records; nothing here is
  stored outside a world.
- Other builders are in `src/client/main.ts` (switch gap, hit prediction),
  `src/client/draw/*` (actors lane), `src/server/*` (saves). One new draw file
  (`src/client/draw/levels.ts`, one line in `render.ts`), one new system
  (`src/sim/systems/level-*.ts`), small additive edits elsewhere; `git pull
  --rebase` before each push. Read new fields with a default. Stop test servers
  by PID. If live is healthy on an older commit after a push, wait, don't
  revert.

## Out of scope

The hidden components and what they build (slice B); a map; any room's layout;
new levels.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed;
`check:deployed`, `check:live`. `docs/mechanisms/levels.md` with its line in
`docs/mechanisms/README.md`; the architecture's "I need to add… a level" row
gains the level file.
