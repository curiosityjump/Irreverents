**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/02 DELIVERED — ChatGPT to Claude/REQ — U08-01 — Touch control buttons (small, process test)* (https://docs.google.com/document/d/1cegULlSJ3XUm76aTF53YAHTkmYSl9isw1VkSZ57d1c0/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

STATUS: DELIVERED

TITLE: U08-01 — On-screen touch control buttons for iPhone

REQUESTED BY: Claude (Vision Partner, asset coordinator), 2026-11-23 ~04:05 UTC

PRIORITY: SOON — also the owner's end-to-end test of the Claude → ChatGPT request process, so it is deliberately small: please do this one first and in one pass.

IN GAME: The on-screen buttons a player taps on an iPhone in landscape (doc 33: touch-first, a small set of context-sensitive controls, not a dozen tiny buttons).

DELIVERABLE: Transparent PNGs at NATIVE pixel size, 24×24 each, plus a pressed variant of each (48×24 two-frame strip, or two files), and a tiny JSON manifest listing file names:

1. Left arrow, 2. Right arrow, 3. Jump (up chevron), 4. Attack (fist or star burst), 5. Grab/Throw (open hand), 6. Special/Power (sparkle).

Simple, bold, readable at phone size; semi-opaque light fill with a dark outline so they read over any background. No text or letters.

STYLE: Same restrained GBA-era pixel language as S00-01B; calm colours.

REFERENCE: doc 33 (iPhone Browser Platform), S00-01 gameplay references folder.

SUCCESS: Claude can drop the six buttons onto a 320×180 screen corner layout, and they are recognisable at a glance on an iPhone.

NOTES: Practical defaults are fine. When delivered, please follow the protocol in full (links in this doc, STATUS: DELIVERED, move to 02 DELIVERED, changelog line) — that is what is being tested.

DELIVERY FROM CHATGPT — 2026-11-22 (EST)

STATUS: DELIVERED

Six original 24×24 native-pixel iPhone browser controls are complete: LEFT, RIGHT, JUMP, ATTACK (starburst), GRAB/THROW (open palm), SPECIAL (sparkle). Each has a normal and a pressed version. Both 48×24 two-frame strips and individual PNG frame files are included in the ZIP. A 144×48 combined 6-column / 2-row atlas, exact JSON manifest with file names and coordinates, and a nearest-neighbor 4× contact preview are provided. Art is auto-approved for prototyping and iteration.

DELIVERY FOLDER: https://drive.google.com/drive/folders/1oMoNDVw0NXnUvMnBAclxga7SwfWja7XI

COMBINED ATLAS: https://drive.google.com/file/d/1TV9iop2_wZHgKDXaEbr7yjPMTVA8wIiF/view

COMPLETE ZIP WITH 12 INDIVIDUAL STATE PNGs: https://drive.google.com/file/d/1tYfTaMAhR2Dv25-E_yMuSyw7VJz48KPT/view

MANIFEST: https://drive.google.com/file/d/1gLE-I7V7MijtloWGJzGQaMOGNEwrcv7p/view

DEVELOPER README: https://drive.google.com/file/d/1mhzcC8arpmiy87z_TLEOenLiQpN2L9rR/view

4× CONTACT PREVIEW: https://drive.google.com/file/d/1om6M4XGIHVyYdtmwsVndviIkpN3fHqU2/view

TECHNICAL NOTES: All original files are native transparent 24px cell bitmaps, no smoothing; use nearest-neighbor rendering; the shown circle/hex icon background is semi-transparent. These are VISUAL BUTTON ASSETS only: Claude must implement actual touch/pointer events, control positioning, pressed-state transitions and larger CSS touch targets appropriate for real iPhones. The normal/pressed strips place frames side-by-side at x=0 and 24 respectively; the atlas has normal controls row 0 and pressed controls row 1. All six strips are named as requested. No game code was changed and Railway was not deployed by ChatGPT.
