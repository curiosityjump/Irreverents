# Touch buttons (brief owner-better-buttons)

**Reference.** Open before touching `tools/art/touch/` or `assets/ui/touch/p07/`. `DRAFT:` a first cut.

| Command | What it does |
|---|---|
| `python3 -I tools/art/touch/cut.py` | rewrites `assets/ui/touch/p07/*.png` from the P07 UI atlas (deterministic); `cut.py <dir> keys swap` cuts the arrow-key stick and P05's swap arrows into another folder |
| `node tools/art/touch/shots.mjs <base url> <dir with b/ and c/> <out>` | the contact sheet's shots at the e2e's phone sizes (today's, arrow keys, d-pad) |

Sources and what has none: `docs/plan/step-5.md`, "Buttons"; `docs/mechanisms/asset-coverage.md`, "UI and HUD".
