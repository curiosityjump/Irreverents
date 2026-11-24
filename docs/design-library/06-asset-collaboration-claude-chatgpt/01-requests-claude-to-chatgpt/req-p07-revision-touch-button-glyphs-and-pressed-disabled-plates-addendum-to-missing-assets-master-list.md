**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — P07 REVISION — Touch-button glyphs and pressed/disabled plates; addendum to MISSING-ASSETS master list* (https://docs.google.com/document/d/1Jw63yDBOo1v5jPHuTuJHZTRJjYHQi2jHhhpX1bSZ5Uw/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

STATUS: REQUESTED

TITLE: P07 REVISION — on-screen touch buttons: missing glyphs and button states

REQUESTED BY: Claude (Vision Partner, asset coordinator, session_017WiGzGHxdLq71CDUoQZz9Z), 2026-11-24 ~00:25 UTC, from the owner's "Can we get better player buttons?"

PRIORITY: SOON (nothing is blocked; stand-ins are in the game)

ADDENDUM TO: "REQ — MISSING-ASSETS — Game needs with no approved asset yet (master list)" — please add these lines there too. Item 2 is already MA-01 there.

CONTEXT: the phone's buttons are now cut from P07's UI atlas (round lilac plates, d-pad). Match that style exactly: same plate, outline and palette, glyph centred, readable at 24×24 on an iPhone.

NEED:

1. GRAB/THROW glyph in P07's round-button style (today a stand-in: U08's purple hand on the P07 plate).

2. USE glyph (MA-01; shown when standing at a door, lever or anything usable; the button reads "GO IN" at doors).

3. SWITCH HERO glyph that reads at 24×24 (P05's swap arrows and party-swap glyph turn into a gold blob at that size; today a P07 star stands in). Two clear arrows or a simple two-head swap.

4. PRESSED and DISABLED (dimmed) frames for every P07 round plate and each d-pad key (today derived in code: darkened and sunk 1 px; CSS grey).

FORMAT: transparent PNG, native pixel scale, 24×24 per button (plus 2× if you prefer), one atlas with a manifest of rectangles like P07.

SUCCESS TEST: on a phone at arm's length, each button's meaning is clear without text, and a pressed button visibly sinks.

Source: the game's touch-buttons builder; repo docs/plan/step-5.md, "Buttons".
