# The Hall of Legends

**Reference.** Open it before touching how a legend is recognised, kept or
shown. The step is `docs/plan/step-7.md`. The record's shape is
`src/sim/hall/record.ts`. (Created by slice A for the "On screen" section;
slice B adds the detector, the record and `content/hall/` above it.)

## On screen: the picture, the card and the banner

`src/client/draw/hall.ts`, two calls in `src/client/render.ts`
(`drawHall` with the world's layers; `drawLegendPicture` right after the
banner queue). `drawHall` reads only the world: every entity of kind
`pedestal` carrying `c.hall.record`. Nothing takes input.
The picture, the frame and the plinth are approved art (Step 7 push 3);
the card's panel and words are still `DRAFT:` stand-ins.

- **The pedestal's body** is the P04 Hall atlas's plain plinth
  (`hall-plinth`, 12×18), drawn as its sprite sheet
  (`content/sprites/pedestal.json` points at `props/hall.png`), so it
  flies and tumbles like any body when hit or thrown. Its box is 12×16
  (the plinth's width; 16×16 before push 3).
- **The picture** (32×24, sitting on the plinth and moving with it): the
  P04 atlas's `hall-frame` nine-sliced (corners kept, edges stretched;
  insets 4 left and top, 2 right and bottom, read off the piece), a wall
  and a floor painted inside, and the record's `frame.bodies` drawn with
  their own sprite sheets: the first frame of `idle`, or the last of
  `down` (else `hurt`) for a body flagged knocked out (`FRAME_OUT`),
  facing as they faced. Sprites are half size on the pedestal and their
  own size at twice the picture (card and banner); places are pulled
  closer together than the sprites so a fight spread over a screen fits.
  The standing are drawn first, the fallen in front of them, credited
  players (`FRAME_CREDITED`) last, with a gold pip over the head. A kind
  with no sheet (or before images load) is its coloured box, lying on its
  side when out; before `hall-frame` loads, a plain gold border.
  No pixels are stored anywhere: new art redraws every old picture.
- **The card** (across the top of the screen, the picture at twice the
  size beside the text): the title (two lines at most), the kind's shown
  name and its standing among records of that kind in the world by score
  ("2nd of 5"), who was there (the record's `name`, else the character
  kind's shown name; "+2" when they do not fit), up to four stats that
  are not zero, and, when records are not being kept, the line "Not
  saved: gone when the game restarts".
  **`INTENT:` there is no button.** The card shows while a player's
  character stands within about a tile and a half of the pedestal
  (24 px across, 28 up or down, middle to middle) and goes when they walk
  away. It never takes input, never holds anyone, and stays in the top
  half of the screen, clear of where touch controls go.
- **The banner (Step 7):** a new legend is announced from the world's
  `hall-legend` event (`watchHallEvents`, fed from `main.ts` like the
  heist's), through the shared banner queue (`draw/banner.ts`): "A new
  legend: <title>", three seconds, on every page in that world, wherever
  its player is. `INTENT:` not from the pedestal arriving: a page is sent
  only its own room's entities (`src/server/game.ts`), so a page in the
  camp never sees the gallery's pedestal. It takes no input and stops
  nothing. **Since push 3 the event carries the record's picture**
  (`frame`, optional, additive): `drawLegendPicture` stands it at twice
  its size centred just under the banner while that banner is up, placed
  by banner.ts's own rule (`DRAFT:` it mirrors that geometry; move it if
  banner.ts moves). The page's record has `drawn.hall.announced` (titles)
  and `drawn.hall.picture` (whether the last frame drew a legend's
  picture). The card stands under the party plate when they would
  overlap (the plate's place is remembered from the last frame).

**What it expects from elsewhere, and where it guesses (`DRAFT:`):**

- **Shown words** come from the Hall content (`hallOf(content)`, Step 7):
  `kinds[<id>].name` and `stats[<id>].label`, each still falling back to
  the id.
- **Which stats:** the first four non-zero ones, in the order
  `content.hall.stats` lists them. A per-kind choice belongs in content.
- **"Not saved"** is shown when the pedestal carries
  `c.hall.lasting === false`. Nothing sets it yet: the server wiring
  should set it on every pedestal when `store.lasting` is false (and
  `Components.hall` in `record.ts` gains the optional field). Absent
  means kept.
- **Whose card:** `render()` is not told which character is this page's
  own, so any player's character at a pedestal in the room on screen
  shows the card. Narrow it when the network layer passes the local
  player.
- **Text** is canvas `fillText`, `bold 8px monospace`, the same as
  `draw/npcs.ts`. It is readable but soft once scaled up on a phone; a
  pixel font for the whole page would sharpen every label at once.

**Checked how:** by eye only. Playwright screenshots at iPhone 14 size,
sideways and upright, of hand-made pedestals pushed into the page's world
(`window.irreverents.world`), 2026-11-23. Nothing scripted checks it;
`npm run check` cannot see the screen.

## Recognising a legend (Step 7 push 2, `DRAFT:` throughout)

`src/sim/systems/hall-detect.ts` (order 970) with helpers in
`src/sim/hall/detect.ts`; the words, thresholds and pedestal spots are
data in `content/hall/legends.json` (kind `halls`, a folder so a map
without the gallery, such as a room control, simply has none; `hallOf`
reads the first by id). docs/decisions-log.md, "Step 7: legends".

- **An episode at an outpost** opens on its first `outpost-wave` and is
  kept on the outpost's post (`c.legend`: start tick, waves, how many
  came, the ids of different people a credited player knocked flat, who
  was there, the picture). Everyone whose character is in the room during
  it is credited (D-026). A `flattened` counts only when its `by` is a
  credited player's character (the camp's people flatten each other often).
  It closes when no player's character is left in the room, or, once it is
  already big enough to be a last stand, when all of them are out cold at
  once (being knocked down earlier is part of the fight: everyone gets up).
- **A last stand:** at least `minWaves` (3) waves and `minFelled` (5)
  different people felled. Score: felled x 100 + waves.
- **A narrow escape:** not a last stand, at least 2 waves, they left the
  room, and someone of a wave was standing. Score: the waves outlasted.
- **A theft nobody noticed:** Step 19's `clean-getaway`; credited, everyone
  in the taker's room then; place, the heist's room. Score 1.
- **Relative (S-001):** a feat hangs only if it scores more than the best
  of its kind in that place (switch `hallRelativeOn`, for the control).
- **The record** (`record.ts`'s shape): a pedestal entity `hall:<n>` (n:
  one more than the highest in the world) of kind `pedestal` (a real body,
  heavy as the heavy dummy, never knocked out) at the next spot on the
  gallery's floor; the picture is the moment of the last knock-down by a
  credited player (else the end), trimmed from the far end until the whole
  entity is at most 500 bytes of JSON (about three bodies with today's
  ids). The world emits `hall-legend { n, kind, title, place, who, stats }`.
- **Only the shared server world hangs one.** A page steps its own
  character in a local world (`world.taken` set): the detector does nothing
  there (`INTENT:`), or the page would hang a private copy.
- **Kept:** a pedestal is a body nobody plays, so a kept game's save holds
  it (`step7-hall` proves it across a rebuilt server). **The world
  everyone shares loses its pedestals at every restart and deploy** until
  the store is wired for it (the next slice: `src/server` edits, a lasting
  number given by the server, dedupe on load).

Checks: `step7-last-stand-camp` (gate E: the flyer fights three waves from
real inputs and walks out; one last stand naming them, 3 waves, 5 came,
5 felled; control: walking out after the first wave hangs nothing),
`step7-same-again-hangs-nothing` (two escapes of two waves; control
`hallRelativeOn` 0), `scripts/checks/step7-hall.ts` (gate E: a real server,
a kept game, two connections; controls watched: a world that is not a kept
game loses it, and without the local-world guard the courtyard page draws
a pedestal of its own).
