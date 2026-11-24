**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — P12 REVISION — Weapon grip anchors/hitboxes, cannonball, closed parasol, unlit torch; addendum to MISSING-ASSETS master list* (https://docs.google.com/document/d/1aEuNBG8C_6s3tVa8D9cMjEHsSZqqEzMbtCVWXcvhsFs/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

ART DESK → CLAUDE — ACTION REQUESTED — 2026-11-23 evening EST

Please upload the exact currently integrated P12 runtime weapon atlas (or individual PNGs) and its frame manifest to the shared Irreverents Drive, and paste the direct links here. Include weapon/state identifiers, atlas rectangles, native dimensions, trim offsets, facing/flip conventions, existing hand-anchor coordinate convention, and current collision/attack-box schema or relevant code excerpt. Grip anchors and hitboxes must be measured against the actual runtime pixels, not the 1448×1086 source sheets. Please also share the current cannon, parasol and torch frames so the missing states can match their scale and palette. No need to stop implementation; stand-ins may remain. Status: REQUESTED; metadata portion awaiting runtime reference. No assets delivered by this update.

STATUS: REQUESTED

TITLE: P12 REVISION — weapons: missing data and four missing states

REQUESTED BY: Claude (Vision Partner, asset coordinator, session_017WiGzGHxdLq71CDUoQZz9Z), 2026-11-24 ~00:30 UTC

PRIORITY: SOON (stand-ins in use; nothing blocked)

ADDENDUM TO: "REQ — MISSING-ASSETS — Game needs with no approved asset yet (master list)" — please add these lines there too.

CONTEXT: the owner's P12 weapons (sword, hammer, spear, shield, bomb, boomerang, grapple hook, cannon, star wand, torch, parasol, orb wand) are cut into the game with ground, held, swing, impact and broken states. Keeping weapons separate from hero poses (one library on a grip anchor) is by design; no hand-held hero poses are wanted.

NEED:

1. GRIP ANCHOR and HITBOX per weapon, as data (the P12 contract asks for them): for each weapon and each state, the pixel where the hand holds it and the rectangle(s) that hit. A JSON or CSV beside the atlas is ideal.

2. CANNONBALL: a separate projectile sprite (2–4 frames, spinning or trailing smoke) plus a small impact; today the cannon shows only a muzzle flame.

3. CLOSED PARASOL: furled state (ground and held), to pair with the open one.

4. UNLIT TORCH LYING FLAT: the current flat state is lit; the unlit ones (ground and pickup) have a baked shadow and rays. Need a clean unlit flat torch without shadow or rays.

FORMAT: same scale, palette and manifest as P12.

SUCCESS TEST: a hero swings each weapon and the hit lands where the blade or head visibly is; the cannon's ball flies across the screen and lands.

Source: the game's props builder (owner-weapons-art brief).
