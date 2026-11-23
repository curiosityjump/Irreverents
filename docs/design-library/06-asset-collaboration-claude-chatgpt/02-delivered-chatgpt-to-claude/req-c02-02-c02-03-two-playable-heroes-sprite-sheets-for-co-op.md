**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/02 DELIVERED — ChatGPT to Claude/REQ — C02-02/C02-03 — Two playable heroes, sprite sheets for co-op* (https://docs.google.com/document/d/1bxtTcbU6dvD0j5KrSs12ozIIg35gh7xcXwQ663vQbPA/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

VISUAL REJECTION NOTICE (22 NOV 2026)

STATUS: VISUALLY REJECTED — FORMAT REFERENCE / ENGINE PLACEHOLDER ONLY. The owner found both v1 hero artworks unacceptable and unlike the earlier high-quality GBA art. Minimal / repeated poses are not real animation. The earlier “DELIVERED — PROTOTYPE” reflects historical file delivery ONLY, not artwork acceptance or task completion. Do not present these as finished characters; do not use them as style reference. The active REWORK request is https://docs.google.com/document/d/1velYJklnMai16cH12kYu-BIlyhx_p-6NlSpO41vfuKw/edit ; controlling quality gate: https://docs.google.com/document/d/17OlSfBfTnUEUTmbo-zcsl4VrSn1mPny-zAP6kZaiodU/edit

STATUS: DELIVERED — PROTOTYPE

TITLE: C02-02 / C02-03 — Two contrasting original playable heroes (one per co-op player)

REQUESTED BY: Claude (Vision Partner, coordinating assets for the overnight build), 2026-11-23 ~04:00 UTC

PRIORITY: BLOCKING — the owner wants to play this in the morning with a second player; until this lands the game uses placeholder rectangles.

IN GAME: The two characters the owner and a friend control in online co-op (one shared party). Side-view 2D platformer, played in an iPhone browser in landscape. Movement, jump, attack, grab/throw are the first verbs.

DELIVERABLE (per hero):

- One transparent PNG sprite sheet, NATIVE pixel size (no upscaling), frames on a fixed grid, e.g. 32×32 cells with the character ~24–28 px tall standing on the cell's bottom edge, facing RIGHT (the game mirrors for left).

- Animations, frame counts flexible: idle (2–4), run (4–6), jump-up (1–2), fall (1–2), attack (3–4), grab/hold (2), throw (2–3), hurt/knockback (1–2).

- A small JSON manifest: cell size, and for each animation its row/first frame/frame count/suggested fps, plus the foot pivot point.

- Hero A: sturdy grappler type (grabs, suplexes, throws). Hero B: small quick type (fast run, higher jump). Clearly different silhouettes and main colors, readable at phone size.

STYLE: Bright, restrained GBA-era side-view pixel art (doc 14 style lock; doc 32 checklist A–E). ORIGINAL designs: no Kirby-shaped round pink hero, no Meta Knight/Waddle Dee lookalikes, no anime humans, no text in frames, clean dark outline, consistent palette and pixel density between the two.

REFERENCE:

- Scale and look: S00-01 gameplay references folder (S00-01B grassy ruins, 320×180 phone preview), under 03 Visual Direction and Assets / Current Pixel-Art Explorations.

- E01 16px tile grid (the hero must sit naturally on 16×16 tiles).

SUCCESS: Claude can load each sheet + manifest, play idle/run/jump/attack/throw on a 16px tile floor at 320×180 internal resolution, and the two heroes are instantly distinguishable on an iPhone screen.

NOTES: Choose practical defaults; we'll iterate after playtesting. Deliver hero A first if both don't fit in one run.

CHATGPT DELIVERY — 2026-11-22 11:16 PM EST

STATUS: DELIVERED — PROTOTYPE / ITERATE AFTER PLAYTEST

Two original transparent native-size hero sprite sheets have been uploaded, with corresponding JSON manifests, 3x nearest-neighbor previews, README and ZIP. Each sheet is 192x256 pixels, arranged as 6 columns x 8 rows of 32x32 cells; foot pivot (16,31); face right, mirror in engine for left. Animation rows are idle (3), run (6), jump_up (2), fall (2), attack (4), grab_hold (2), throw (3), hurt (2), with FPS and loop flags in each manifest. Hero A is a broad brown-orange grappler; Hero B is a smaller teal adventurer. Both fit on 16px tiles and have distinct colors/silhouettes.

DELIVERY FOLDER: https://drive.google.com/drive/folders/1D34ZytHeo2RUD2un9ox20sB4TD3bajpn

ZIP: https://drive.google.com/file/d/1OjxxRTvbDK0fqmpilySx-tkvFWTD3EmO/view

HERO A SHEET: https://drive.google.com/file/d/1_ISaUe2uS16woABXMBIsVzQM-d5Mq-nu/view

HERO B SHEET: https://drive.google.com/file/d/1kP_w4leYbxoNZLOtN65ZrivkEUVj2vyA/view

HERO A MANIFEST: https://drive.google.com/file/d/1_wcNKKk07A5RD6clVclIRtdsNVqkp1QZ/view

HERO B MANIFEST: https://drive.google.com/file/d/1EPUsl98AaEwyOJlv82i8u0sDovep2i6J/view

LIMITATIONS: These are BASIC PROGRAMMATIC PIXEL ART PROTOTYPES, not polished, hand-animated production character art. Idle and some jump/fall/hurt frames are very similar; running has minimal leg movement; no true dynamic suplex/grapple or convincing throwing physics is depicted. They can replace placeholder rectangles for a first engine integration, but SHOULD be substantially refined before final use. No GitHub integration or actual iPhone gameplay test performed by ChatGPT. Claude should import/test and create a revision request if the silhouettes or animations are insufficient. Default permission to use applies.
