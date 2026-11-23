# The Hall of Legends

**Reference.** Open it before touching how a legend is recognised, kept or
shown. The step is `docs/plan/step-7.md`. The record's shape is
`src/sim/hall/record.ts`. (Created by slice A for the "On screen" section;
slice B adds the detector, the record and `content/hall/` above it.)

## On screen: the picture, the card and the banner

`src/client/draw/hall.ts`, one call in `src/client/render.ts`
(`drawHall`). It reads only the world: every entity of kind `pedestal`
carrying `c.hall.record`. It listens to no events and takes no input.
Every look and word in it is `DRAFT:` graybox; Step 8 owns the final art.

- **The picture** (28×20 with its frame, on top of the pedestal's body and
  moving with it): the record's `frame.bodies` redrawn as tiny blocks in
  their character kinds' colours, placed by their positions scaled into
  the frame (never closer than about five tiles across, so two bodies do
  not fill it). A body flagged knocked out (`FRAME_OUT`) lies on its side
  and has no eye; a credited player's (`FRAME_CREDITED`) has a bright
  pixel over the head. A kind the content does not know is a grey block.
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
- **The banner:** when a pedestal appears that was not in the first frame
  this page drew with a world in it, its picture and title show at the
  top for three seconds (wall clock), wherever the player is, in place of
  any card. It takes no input and stops nothing. Several pedestals
  arriving in one frame are taken as old ones loading and are not
  announced.

**What it expects from elsewhere, and where it guesses (`DRAFT:`):**

- **Shown words** come from `content.hall`: `kinds[<id>].name` and
  `stats[<id>].label`. That content kind was not on `main` when this was
  written, so it is read loosely and each word falls back to the id
  ("biggestImpact" shows as "biggest impact"). Tighten the type in
  `hall.ts` once `src/content/kinds/hall.ts` exists; if the field names
  differ, the fallback is what shows, not an error.
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
