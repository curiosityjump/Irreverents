**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — C02-04 + N03-05/N03-06 — Third hero (flyer), the king and the villain; plus priority order for everything pending* (https://docs.google.com/document/d/1fNd5TuX7J6ANSNDyUqPXZlo-2wu35OPzvkgFxLhfnA4/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

P09 — P07 NPC STATIC EXTRACTION / 2026-11-23 11:55 AM EST

SOURCE P07 civilian/NPC/guard/king board: https://drive.google.com/file/d/1rnkPeLOL4fwcwNnvHH-C2uwiHblLnlz7/view . Created 12 distinct transparent 48×48 PNGs (2 source idle variants each of green civilian, blue civilian, spear guard, shield guard, king, cat), manifest JSON with pivots/source crops, 320×180 native-size QA preview and 2× contact sheet. ZIP https://drive.google.com/file/d/1-QaHnPNyvYTCmSdcufYbOL5L-vYWsf19/view ; preview https://drive.google.com/file/d/1VDOKogKcjbr3ePHBdfZxFX9PAc8a3FOJ/view ; folder https://drive.google.com/drive/folders/1LUm-MBHQhccNDRQBtTRnrmYRFxmKXQI3. STATUS: IMPORTABLE STATIC IDLE PROTOTYPE ONLY; no complete walk/mood/attack animation, no verified 32px compatibility, native reduction loses fine detail. NOT PRODUCTION READY; do not close NPC REQ or overwrite existing working assets. No canonical heroes altered.

King only partial idle extraction; flyer/villain still pending.

2026-11-23 11:29 AM EST — FLYER CANON SOURCE PARTIAL

Owner-locked pink-winged aviator flyer has six individually extracted 48×48 RGBA source poses in partial package https://drive.google.com/file/d/185sart4aSJmoVq2ZHEhjLV7t8ypa04lK/view ; preview https://drive.google.com/file/d/1RU3plFJKyXEkj1rH0C7gsLvQZgMVUM1W/view . Not a finished 32×32 flyer animation sheet: 6-phase run, 4-frame flap, attack/grab/hurt/KO and native scale QA remain open. STATUS: REQUESTED / IN PROGRESS; do not mark flyer or king/villain delivered. Canon reference https://drive.google.com/file/d/17Ulupi-WbcsqVWqS5m-bz1TmIjzx6VcM/view controls identity.

2026-11-23 8:53 AM EST — REQUEST ACKNOWLEDGED / QUEUED

STATUS: REQUESTED — NOT DELIVERED. Reviewed this newly added blocking request, including flyer, king and villain specifications and the explicit priority ordering. C02-02/03 remains first; flyer second; NPC/king/villain third; E01 tiles fourth; music fifth. H07 work was outside the Claude priority queue and must not displace these. No new sprites or uploads are claimed for this REQ. The source visual references and 32×32/animation/mood acceptance tests remain controlling. Leave this request in 01 REQUESTS until a genuine partial or full quality-assured delivery.

STATUS: REQUESTED

TITLE: C02-04 third playable hero (the flyer) + N03-05 the king + N03-06 the villain

REQUESTED BY: Claude (Vision Partner, asset coordinator, session_017WiGzGHxdLq71CDUoQZz9Z), 2026-11-23 ~13:45 UTC, for Step 8 ("the look comes first now")

PRIORITY: BLOCKING (the owner, 2026-11-23, on seeing the live game on an iPhone: "It all looks like absolute blocky shit ... don't stop working on it until it looks similar to \[Kirby and the Amazing Mirror\]." Original designs only; the quality bar is the GBA restraint and legibility, not its characters.)

WHY A NEW DOC: these are not covered by any pending request. Do not duplicate C02-02/03 REVISION (grappler + quick hero), N03-01/02/04 (shopkeeper, guard, cat, enemies) or E01-02/03 (tiles + parallax); those stay as they are.

PRIORITY ORDER for ALL pending requests, most urgent first (so the hourly run knows what to work on):

1. C02-02/03 REVISION: grappler + tiny quick infiltrator (already in progress, keep going).

2. This doc, part A: the flyer hero.

3. N03-01/02/04 (shopkeeper, guard) and this doc, parts B and C (king, villain), each with the three moods.

4. E01-02/03: 16 px town street, castle interior, grassy courtyard ground that joins at edges and corners (top, sides, inner and outer corners, one-way ledge), plus doors, windows, banners, awnings, crates; and 320×180 sky and far-distance layers for each area, drawn to scroll slower than the ground.

5. Music A02-01.

A. C02-04 THE FLYER (third party hero)

- In-game purpose: the third member of the shared party; flies/glides over gaps the others can't cross.

- Size: 32×32 transparent cells, same sheet layout, manifest format, outline and palette as the C02 heroes, so the game swaps files with no code change. In-game collision box about 14×20 px; figure roughly 16–24 px tall.

- States: idle, run (6), jump, fall, fly/glide (4, wings or cape clearly flapping), attack (wind-up, hit, follow-through), grab, carry, hurt, knocked out, crouch/hide (2), victory (2).

- Silhouette: instantly different from the wide grappler and the tiny big-headed quick one: e.g. tall-and-light with wings, a cape or a propeller hat. Original, not a Kirby-like round pink blob.

- Success test: all three heroes side by side on a 16 px tile floor at 320×180 are told apart at a glance on a phone.

B. N03-05 THE KING (the one who never stops talking)

- In-game purpose: the self-serious king who keeps narrating the sacred quest at the heroes.

- Size: 32×32 cells (may be 32×48 if he needs to be taller; say which in the manifest), transparent.

- States: idle, talk (3–4 mouth/gesture frames), walk (4), plus the three NPC moods: business as usual, distress, rage (2 frames each, readable from body language alone).

- Success test: at phone size you can tell which mood he is in without reading any text.

C. N03-06 THE VILLAIN

- In-game purpose: the villain the world's script expects the heroes to fight; they'd rather steal his machine.

- Size and format as the king. States: idle, walk (4), attack (3), hurt, knocked out, the three moods (2 each), and a "signal" pose (calling for help / raising the alarm).

- Success test: reads as the villain at a glance next to the king and the guard, at 320×180 on a phone.

STYLE (all three): restrained GBA pixel language as S00-01B and your 02 VISUAL QUALITY GATE; clean dark outlines; a few deliberate shade clusters; no text; nothing franchise-derived.

REFERENCES: S00-01B grassy ruins quiet route candidate; Pixel aesthetic reference (approved direction: look only); your C02 REVISION work for outline and palette consistency.

DELIVERY: as usual, move this doc to 02 DELIVERED with links and catalog the files. Partial delivery is welcome: the flyer alone first is fine; note which parts are done.
