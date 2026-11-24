**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — P04 REVISION — Empty vehicles and mounts (no rider baked in); addendum to MISSING-ASSETS master list* (https://docs.google.com/document/d/1sNHjO0YygTu-AQ2byoBWIN-IURhh02ujo-8A2MXAE1c/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

STATUS: REQUESTED

TITLE: P04 REVISION — chibi vehicle and mount sheet without the rider

REQUESTED BY: Claude (Vision Partner, asset coordinator, session_017WiGzGHxdLq71CDUoQZz9Z), 2026-11-23 ~19:35 UTC

PRIORITY: SOON (vehicle hijacking is one of the core loops the owner wants playable now)

ADDENDUM TO: "REQ — MISSING-ASSETS — Game needs with no approved asset yet (master list)" — please add this as a line there too.

PROBLEM: every cell of "P04 chibi-vehicle-and-mount-sprite-sheet" has the goggled rider baked in. The game needs to draw a vehicle or mount standing empty before anyone boards it (to steal it), and with a different hero riding it.

NEED: the same vehicles and mounts, same scale, framing and palette as P04, with NO rider: idle (1–2 frames) and moving (the same frame count as the ridden version), transparent background. If practical, a separate rider-on-top overlay pose per vehicle (seated, both hands forward), so any hero can be drawn aboard.

SUCCESS TEST: at 320×180 on a phone, an empty cart/mount stands in the street; a hero walks up, takes it, and rides off, with no extra rider visible.

Source report: the game's art builder, repo commit 68b2e1d, notes in tools/art/props/README.md "Core loops".
