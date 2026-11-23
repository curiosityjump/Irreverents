# Art foundation: the art content kinds, their checks and the look helper

**Reference.** Open before touching `src/content/kinds/sprites.ts`,
`atlases.ts`, `backdrops.ts`, `decor.ts`, `looks.ts`,
`src/content/art-fields.ts`, `src/client/draw/looks.ts`,
`scripts/lib/art-images.ts` or `scripts/checks/art-images.ts`.

`DRAFT:` the notes file of Step 8's look lane "foundation"
(`handoff-prompts/look-foundation.md`), written 2026-11-23 by a relaunched
worker after the first foundation agent died with the previous
orchestrator's machine. The contract it implements is
`docs/mechanisms/art-pipeline.md`; the orchestrator moves the items below
to their homes.

## What exists

**Content kinds** (`Content` fields, each a directory of files named after
what they draw). Every art file's `"//"` must start `DRAFT:` and name
where its picture came from (`tools/art/...` or a delivery).

| Kind | File | Type exported | Named after |
|---|---|---|---|
| `sprites` | `src/content/kinds/sprites.ts` | `Sprite`, `SpriteFrames`, `SpriteState`, `SPRITE_STATES`, `SPRITE_MOODS` | a character kind |
| `atlases` | `src/content/kinds/atlases.ts` | `Atlas`, `Autotile`, `atlasCells()` | a room |
| `backdrops` (new) | `src/content/kinds/backdrops.ts` | `Backdrop`, `BackdropLayer` | a room |
| `decor` (new) | `src/content/kinds/decor.ts` | `Decor`, `DecorItem`, `DecorLayer`, `DECOR_LAYERS` | a room |
| `looks` (new) | `src/content/kinds/looks.ts` | `LookGroup`, `LookCut`, `LookEntry`, `lookTable()`, `DEFAULT_LOOK_FPS` | a group (any id) |

- **Sprite:** the old fields plus `frames` keys from the contract's sixteen
  states (`idle`, `run`, `air` required; any other key is an error),
  `fpsBy` (state → 1..60), `moods` (`"2"`, `"3"` → state → frames). Parsed
  `fpsBy` and `moods` are `{}` when absent. Cross-check: the character's
  collision box at `anchor` fits inside one cell (the box is the truth).
- **Atlas:** `cells` stays required (the fallback). `autotile` is `null`
  or `{ origin, innerCorners | null, fill (≥ 4), top [], under [], oneway | null }`.
  `[-1, -1]` is accepted only in `top` and `under`. `atlasCells(a)` lists
  every cell named, for measuring.
- **Backdrop:** `sky` (0–8 `#rrggbb`, `[]` when absent), `layers`
  (`image`, `parallax` 0..2, `y` `top`|`bottom`, `offsetY` default 0,
  `repeatX` default false, `parallaxY` default 0), `wall` or `null`. A
  file drawing nothing is refused.
- **Decor:** `items` of `image`, `src [x,y,w,h]`, `tx`, `ty` (inside the
  room), `dx`/`dy` default 0, `layer` `far`|`back`|`front`, `flip` default false.
- **Looks:** `Content.looks` is **by group** (file id → `{ id, image,
  looks: { <look id>: { src, frames (default 1), fps (default 10) } } }`).
  `lookTable(content)` is the merged map, look id → `{ image, src, frames,
  fps, group }`. The same look id in two groups fails the check. A look id
  is a plain id or `part:<room>:<part>[:broken|:down|:open]`, and for the
  latter the room and part must exist.

**Image measure** (`npm run check`, line "check art-images"):
`scripts/lib/art-images.ts` reads each PNG's size from its header (no
dependency, no decoding) and refuses: a missing image or a non-PNG; a
sprite cell bigger than its sheet or any frame number (normal or mood) past
the last cell (cells counted row by row, `floor(W/w) × floor(H/h)`); an
atlas, autotile (the whole 4×4 block) or wall cell outside its image; a
backdrop layer not 320 px wide or a multiple; a decor `src` or a look's
whole strip (`w × frames`) past the image's edge. Its controls live in
memory in `scripts/checks/art-images.ts` and run every time: a missing
image and a frame past the end must be refused, a sheet that fits accepted.

**The look helper**, `src/client/draw/looks.ts`, exact exports:

- `look(content, id): Look | null`: resolved and cached once the image
  has loaded; `null` when the id is missing or still loading.
- `hasLook(content, id): boolean`: named in content at all.
- `drawLook(g, content, id, x, y, opts?): boolean`: false and nothing
  drawn when missing. `DrawLookOptions`: `frame` (wraps), `flip` (in
  place), `w`/`h` (destination size), `alpha`, `tint` (a colour, multiply),
  `anchor` (`top-left` default, `bottom-left`, `bottom-centre`, `centre`).
  Whole pixels always.
- `drawLookFrame(g, look, x, y, opts?)`: the same for a `Look` in hand.
- `drawNine(g, content, id, x, y, w, h, opts?: { alpha }): boolean`: 3×3
  equal cells, corners kept.
- `tinted(look, color, mode = 'multiply' | 'paint', amount = 1): HTMLCanvasElement`:
  a cached offscreen copy of the whole strip, transparent pixels kept.
- `frameAt(look, ticks, loop = true)` (−1 when a once-strip is over) and
  `lookTicks(look)`.
- Types `Look`, `LookAnchor`, `DrawLookOptions`, `TintMode`.

Proven in a real browser with throwaway art (nine-slice, frames and wrap,
flip, scale, alpha, tint keeping shading, anchors); no art was committed.

## Deviations from the contract

- **`Content.looks` is by group, not one merged map.** The brief asked for
  "one map from look id to image, src, frames, fps, merged across
  groups". Every directory kind in this codebase is one item per file,
  and the actors lane's `src/client/draw/fx.ts` (already on `main`) reads
  `content.looks` as groups; a merged field would have silently emptied
  its looks. The merged map is `lookTable(content)` instead, and
  `looks.ts` uses it.
- **`src/content/art-fields.ts`** is a new file outside the lane's paths:
  shared field readers for the five kinds, which cannot live in
  `src/content/kinds/` (every file there registers as a kind).
- **`scripts/lib/room-controls.ts`, one line:** a room control that brings
  its own map already drops `rooms/` and `placements/`; it now also drops
  `atlases/`, `backdrops/`, `decor/` and `looks/`. Without it, the first art
  file naming a real room made eight room controls fail for the wrong
  reason ("no room courtyard"). Art never changes a room's logic.
- `innerCorners`, `top`, `under` and `oneway` of an autotile are optional
  (the contract's example has all); when present, every key is required.

## Decisions

- **2026-11-23: the art checks accept a missing `innerCorners`, `top`,
  `under` or `oneway`.** What a player sees: nothing; the renderer draws
  the plain variant. Why: a room with no one-way platforms has nothing to
  draw there, and the tiles lane should not have to invent cells. Undo:
  make them required in `atlases.ts`.
- **2026-11-23: a look strip with no `fps` plays at 10 a second**, the
  same default the actors lane's reader had, so both readers agree. Undo:
  require `fps` when `frames` > 1 in `src/content/kinds/looks.ts`.
- **2026-11-23: "says where the picture came from" is read as naming
  `tools/art/` or a delivery** in the `"//"`. Undo: loosen
  `requireDraftNote` in `src/content/art-fields.ts`.
- **2026-11-23: a backdrop's `parallax` may run to 2** (a foreground layer
  moving faster than the room). Undo: cap at 1 in `backdrops.ts`.

## Flags for the lead

- `src/client/draw/fx.ts` (actors) duplicates `look`, `drawNine` and a
  tint; it can now become thin calls to `src/client/draw/looks.ts`
  (`look(content, id)` there takes the content explicitly; fx.ts's
  `useContent` global can pass it). Not done: outside this lane's paths.
- The contract's "Checks" also wants alpha 0 or 255 inside sprites; the
  measure reads only PNG headers, so that is not checked (see below).

## Not verified

- Alpha being 0 or 255, outlines, palette: needs decoding pixels; not
  measured.
- No real art had landed on `main` when this was pushed, so the measure
  has run only on throwaway files (all refusals and acceptances above
  were watched happen) and on today's content (no art: green).
