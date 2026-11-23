# Props lane: looks, effects, decoration and the "Use" button

**Reference.** Open it before touching `tools/art/props/`, `assets/props/`, `assets/fx/`, `assets/decor/`,
`assets/ui/use.png`, `content/looks/` or `content/decor/`. The contract is `docs/mechanisms/art-pipeline.md`.

`DRAFT:` every picture here is a stand-in drawn by a program (round 1 of Step 8's look, 2026-11-23). A delivered
sheet replaces one by editing its content file; nothing in the engine changes.

## What exists

Run from the repository root (Python 3 + Pillow, deterministic: two runs give the same bytes):

| Command | What it does |
|---|---|
| `python3 -I tools/art/props/make.py` | rewrites every PNG and content file listed below |
| `python3 -I tools/art/props/selfcheck.py` | this lane's own check (below); exits 1 on a problem |
| `python3 -I tools/art/props/preview.py` | contact sheets and each room with the decor in place, into `tools/art/props/preview/` (git-ignored) |
| `python3 -I tools/art/props/sizes.py` | lists every door's and part's kind, look and tile rectangle from `content/rooms/` |

| File | Role |
|---|---|
| `px.py` | the drawing kit: the contract's palette, hand-placed pixel art from text, outline and shading passes, a sheet packer |
| `looks_parts.py` | doorway, plates, gate, cracks, rubble, windows, curtains, bell, shop counter and goods |
| `looks_people.py` | mood marks, speech nine-slices, away dots, player mark, shadows, alert pips, the four effects, the Use button |
| `decor_draw.py` | the decoration pictures |
| `place.py` | where decoration goes in each of the six map rooms (rules, not coordinates read from secrets) |
| `sizes.py` | reads the rooms; `make.py` draws a `door-enter-`, `window-` and `hide-` look for every size that exists |

**Looks** (`content/looks/<group>.json`, one image each; 36 ids):

- `parts` → `assets/props/parts.png`: `door-enter-1x2`, `window-1x3`, `window-broken-1x3`,
  `part:throne-room:window` and `part:throne-room:window:broken` (the stained glass), `hide-1x2`, `hide-2x2`,
  `bell`, `bell-ringing` (4 frames), `bell-broken`, `plate-up`, `plate-down`, `gate-closed`, `gate-open`,
  `crack-1`, `crack-2`, `rubble`, `shop-counter`, `shop-goods`.
- `people` → `assets/props/people.png`: `mood-2` (2 frames), `mood-3` (2), `away-dots` (4), `bark`, `bark-tail`,
  `ribbon`, `alert-pip`, `alert-pip-off`, `player-mark`, `shadow-s`, `shadow-m`, `shadow-l`.
- `fx` → `assets/fx/fx.png`: `fx-slash` (5), `fx-hit` (5), `fx-dust` (5), `fx-land` (4).
- `ui` → `assets/ui/use.png`: `ui-use`; also the `icon` of `content/actions/interact.json`.

The sizes in use today (from `sizes.py`): enter doors 1×2; windows 1×3; hiding places 1×2 and 2×2. A new size
in a room file gets its look on the next `make.py`.

**Decoration** (`content/decor/<room>.json` for `castle-street`, `courtyard`, `throne-room`, `hall-gallery`,
`undercroft`, `graybox-hall`; sheets `assets/decor/town.png`, `courtyard.png`, `castle.png`, `undercroft.png`).
Far-layer things are greyed and have no dark outline; back-layer things have the full palette and an ink
outline. The `test-*` rooms get none.

**The self-check** proves: every image exists; every `src` and strip fits; required keys; `"//"` starts
`DRAFT:`; look ids unique; every id of the contract's table exists at the contract's size; alpha is 0 or 255
(shadows and the Use button excepted); back and front decoration overlaps no enter doorway, no part, no spawn
point and no bell; whatever stands has ground under it and whatever hangs has ground over it; nothing reaches
the room's rim.

## Deviations from the contract

- `ui-use`'s `src` is the whole 48×24 picture (normal then pressed), with no `frames`: that is how
  `assets/ui/touch/` strips are used by `touch.ts`, and the table's own size column. A reader wanting one half
  takes 24×24 from either end.
- The Use button keeps the delivered buttons' soft alpha (235, 202, 240, 140, 130) so it matches them exactly;
  the contract's "alpha is 0 or 255" is not met there on purpose.
- `bark-tail` is a look of its own in the `people` group (the table names it inside the `bark` row).
- In-between shades of palette colours are used for far-layer things (mixed towards `far`, `castle` or
  `night`), as the palette section allows. No new hue.

## Decisions

Each is `DRAFT:`, made without asking, and undone by deleting lines in `place.py` (or a function in
`decor_draw.py`) and running `make.py`.

- **The street's slabs are given house fronts.** What a player sees: pale plaster-and-timber walls behind the
  street under each building, a board wall inside the upper room, one shuttered window, one shut green door,
  a key sign by the real doorway, flags between the two buildings. Why: without them the buildings are grey
  slabs floating over a street and the doorway stands in mid-air; the brief asks for "shuttered windows and
  painted doors on building fronts". They are far-layer, so they may sit oddly on the tiles lane's backdrop
  once it lands. Undo: remove the `front-`, `interior-`, `window`, `door-painted`, `sign-key`, `bunting` lines.
- **One shut painted door, clearly not a doorway.** It is green planks with a knob and no dark opening, where
  a real doorway is a dark arch in stone. If players still try to enter it, remove it.
- **The shop gets a stall and a cloth.** A striped awning on posts round the shopkeeper and a striped cloth on
  the ground under the three goods (goods are drawn at floor level by the renderer).
- **The carpet stops at the throne.** It runs from the east door to the throne's left edge and not on to the
  wall behind, so it leads to the throne and nowhere else.
- **A broken window shows a dark opening** inside its frame (the old code-drawn look did the same), with the
  shards left standing.
- **Plates carry a colour as well as a height:** an orange stud when up, lit teal when down.
- **Courtyard columns 1 to 13 and the gallery's ground floor hold nothing standing**, because their room files
  reserve them for Step 7. The courtyard has two pale far-off ruins there, on the far layer only.
- **Armour is a greyed statue on a plinth on the far layer**, so it is not taken for a guard.
- **`shop-goods` is a corked teal flask**; `player-mark` is white with an ink edge (a multiply tint keeps the
  edge dark; a flat fill just gives a slightly larger marker).

## Nothing points: how the placing keeps to it

`INTENT:` (`docs/plan/step-3.md`, "Unadvertised"). `place.py` never reads a `hidden` flag and treats every
door's and every part's tiles alike. Repeating things follow one rule across the whole room (throne room: a
column every fourth column, a banner halfway between; undercroft: a torch every sixth column on two levels,
wherever two open cells fit, which includes the sealed vault). Barrels, cobwebs and chains in the undercroft
are a fixed hash over every cell that fits. The barrel hash's seed was changed once after looking at the
result, because the first seed happened to pile the most barrels in the vault; the seed in use gives it one.
Cracks are a thin dark line with no highlight.

## Flags for the lead

- **Cracks are near-invisible on a very dark wall.** `crack-1/2` are ink on transparent; on the preview's
  night-coloured ground they barely show. Whether that is right depends on the undercroft tiles, which had not
  landed when this was pushed. If the vault wall cannot be found at all, lighten one edge of the crack.
- **Far-layer house fronts and columns were drawn against plain stand-in ground and no backdrop.** They need
  one look beside the tiles lane's work when it lands (colour clash, or a back wall that makes columns vanish).
- **The stall's awning sits just under building 1's overhang; the shopkeeper, counter and goods are drawn in
  front of it.** If the cast lane's shopkeeper is taller than 24 px plus hair, check the sign does not sit on
  their head (it hangs at the stall's right post, columns 14-15).
- **The throne room's back wall is busy** (4 columns, 8 banners, 4 torches, 2 portraits, 1 statue). It is
  orderly but may be more than "quiet"; dropping the upper row of blue banners is one line in `place.py`.
- `content/placements/` has no file for `courtyard`, `hall-gallery` or `undercroft`; if things are placed there
  later, re-run `selfcheck.py` (it reads placements for bells only) and look at the previews.
- This clone's local `main` was 19 commits ahead of and 50 behind `origin/main` when the session began (stale
  history from the container image). The work was done on a local branch cut from `origin/main` and pushed to
  `main`; the stale local `main` was left alone.

## Not verified

- Against real ground tiles, backdrops and the cast's sprites: none had landed. Verified against the world and
  actors lanes' renderers on plain ground: the throne room and the street were opened in the real game at
  844×390 and every look and decor item sat where the code-drawn shape was.
- The courtyard, gallery and undercroft were judged from `preview.py` only, not walked to in the real game.
- `window-1x3` (the plain window) and `hide-2x2` in the test rooms, `gate-open`, `plate-down`, `rubble`,
  `bell-ringing`, `bell-broken`, `mood-*`, `bark`, `away-dots`, the effects and `alert-pip` in motion: seen on
  contact sheets only.
- Upright (portrait) play: not looked at with this lane's art.
- How it looks on a real iPhone, and whether it is near the owner's bar: theirs to judge.
