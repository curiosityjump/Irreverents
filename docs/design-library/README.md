# Design library (mirror of the owner's Google Drive)

**Reference.** Open it when work touches game design, story, levels or art.
This folder is a **read-only mirror** of the owner's Google Drive game-design
library (https://drive.google.com/drive/folders/1UEVhtK6SA8-8AkWD4w768ZLzx1UjO8DD).
**Drive is the source of truth.** Never edit these files by hand: the next
sync overwrites them. To change the design, the owner edits Drive and logs it
in the Drive changelog (mirrored as `changelog.md` here); then a session runs
`python3 -I tools/drive_sync.py` (`docs/mechanisms/design-library-sync.md`).

## Where to start

- `00-start-here-irreverents.md`: the library's own entry point and reading order.
- `changelog.md`: the owner's Drive changelog, newest first. **Read this first
  on every re-sync** to see what changed and why.
- `04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`:
  the only document that turns a brainstormed example into a firm requirement
  (per the library's own status rules: CONFIRMED / STRONG DIRECTION / EXAMPLE / OPEN).
- `04-decisions-and-prototyping/32-verified-drive-audit-and-art-curation-gate.md`:
  which images are approved, which are only candidates, and the asset acceptance checklist.

## Layout

Folders and files mirror Drive one to one, with names turned into ASCII slugs
(the exact Drive name of each is in `manifest.json`):

| Folder | Holds |
|---|---|
| `01-vision-and-narrative/` | creative north star, world and heroes, the opening, the Sacred Script |
| `02-gameplay-systems/` | world structure, roster and powers, co-op, stealth, combat, Hall of Legends, NPC modes, wanted levels, architecture, cantina |
| `03-visual-direction-and-assets/` | visual direction and style lock, asset plan, current pixel-art explorations, the experimental E01 16px tilekit (unpacked) |
| `04-decisions-and-prototyping/` | decision register, golden scenarios / acceptance tests, level anthology, the Drive audit |
| `05-world-and-game-expansion-proposals/` | proposals only, not canon |

## What is deliberately not here

- **The four "Superseded Style Explorations" PNGs** (warm toybox, painterly,
  bold platformer, urban fantasy). They are listed in `manifest.json` but not
  downloaded: they show what the art is *no longer* meant to look like, and
  the library itself says never to bulk-import discarded images. Drive keeps them.
- **The E01 tilekit ZIP itself.** Its contents are unpacked into
  `.../e01-grid-aligned-tilekit-source-pngs-manifest/` instead.
- **Images embedded inside Google Docs.** None existed at the first import (2026-11-23);
  the sync converts text only.

Nothing in the image folders is approved production art: see doc 32 for what
each one is (approved *style direction*, candidate, or experimental).
