**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — C02-02/C02-03 REVISION — More expressive heroes with real animation* (https://docs.google.com/document/d/1velYJklnMai16cH12kYu-BIlyhx_p-6NlSpO41vfuKw/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

2026-11-23 08:18 AM EST — RECOVERED-SOURCE CONVERSION QA (NOT DELIVERED)

Opened the actual recovered expressive hero pose PNG and the approved roster/style images. Tested cropping both seven-pose rows, nearest-neighbor reduction into 32×32 cells, and a 320×180 two-hero gameplay mock locally. The 32px contact test retains distinct red-heavy versus blue-scarf silhouettes and more real key-pose variation than rejected v1. However, 7 source poses per hero do NOT supply a six-phase run cycle, proper grab/throw subframes, crouch/victory variants, consistent pivot and full 6×8 sheet; scaling also loses details and effects protrude in some crops. This is a local conversion QA experiment only, NOT an uploaded or production-ready atlas. Do not claim files are in Drive. Next: redraw/extend missing source poses at native scale, alpha-clean and inspect each cell, validate full animation/manifest, then upload and catalog. STATUS: IN PROGRESS — QUALITY REWORK.

Source: https://drive.google.com/file/d/13qA3OL9rGa9oRdg1QIjR6JFXxtzFBMIX/view

QUALITY ACCEPTANCE OVERRIDE — READ FIRST

Owner rejected the v1 artwork (rectangular bodies, virtually no real animation); rebuilding only the same boxy art with a scarf/hat is NOT a fix. Use the actual earlier approved original GBA sprite/art references and the new visual QUALITY GATE: https://docs.google.com/document/d/17OlSfBfTnUEUTmbo-zcsl4VrSn1mPny-zAP6kZaiodU/edit . Produce original polished designs with distinct personality, convincing expressive keyframes and verified native pixel grid at 320×180. Generate art-directed poses FIRST, then package; do not create code-only stickman drawings. Keep request in inbox until visual and technical tests pass. No owner pre-approval needed.

STATUS: IN PROGRESS — QUALITY REWORK

TITLE: C02-02 / C02-03 REVISION — heroes v2

REQUESTED BY: Claude (Vision Partner, asset coordinator), 2026-11-23 ~04:25 UTC

PRIORITY: BLOCKING — OWNER HAS VISUALLY REJECTED v1. This is the immediate quality-repair task, not optional polish. Temporary box prototypes may remain only as engine placeholders until replacement.

REVISES: REQ — C02-02/C02-03 — Two playable heroes (in 02 DELIVERED).

WHAT TO IMPROVE (keep the same sheet layout, 32×32 cells, manifest format, so the game can swap files without code changes):

1. SILHOUETTES: v1 heroes are the same boxy body with different hats. Make them instantly different: Hero A the GRAPPLER = wide, heavy, big arms/hands, low stance; Hero B the QUICK one = small, light, big head, long scarf or ears that trail when running.

2. ANIMATION: v1 run/attack frames barely change. Give real motion: run with clear leg cycle and body bob (6 frames), squash on land, stretch on jump, wind-up and follow-through on attack, a big two-handed lift for grab, a full overhead heave for throw, a recoil for hurt.

3. CHARM: expressive eyes, a bit more roundness and personality in the face, the GBA "Amazing Mirror-era" liveliness (but original — not round pink Kirby-like blobs). Readable at native size on an iPhone.

4. Add: crouch/hide (2) and a happy victory pose (2) for each.

STYLE: restrained GBA pixel language as S00-01B; consistent outline and palette between the two; no text.

SUCCESS: side by side on a 16px tile floor, a player can tell grappler from quick hero at a glance, and running/attacking/throwing looks lively at phone size.

2026-11-22 11:31 PM EST — QUALITY REWORK STATUS

STATUS: IN PROGRESS — QUALITY REWORK (NOT DELIVERED)

Owner rejected C02 v1 and a later overly detailed humanoid fighter concept. The v1 remains a temporary engine placeholder only, not approved art. This request stays in 01 REQUESTS. The quality gate now explicitly requires comparing MULTIPLE existing visual boards and landscapes, not just one approved reference. Reviewed the source collection (original approved pixel direction, roster exploration, gameplay showcase, world/ability study, cooperative adventure study, grassy ruins candidate). Next production step: create genuinely original tiny playable hero design(s) that belong to the same whimsical, compact game world; validate at 320×180 against actual grassy ruins, then build and test all requested native 32×32 animation cells. Do not mark delivered until visual AND technical QA pass. No new finished hero assets delivered in this run.

2026-11-23 01:16 AM EST — ART DIRECTION TEST / NOT DELIVERED

Reviewed the actual approved pixel-art board, character roster exploration, gameplay showcase and quiet grassy-ruins scene as a group. Produced an original two-character action-pose concept with a bulky goggle-wearing animal-like grappler and a tiny long-eared scarf-wearing quick character. Visual direction is closer to the compact, playful game-world aesthetic than rejected humanoid fighters, but the generated image is a flattened illustrated scene: characters are much larger than native 32×32, scenery is baked into frames, no alpha-separated character pixels, only four poses each, and no six-frame run cycles. It fails the requested engine-ready sprite and animation criteria. Do not promote to DELIVERED or pass to Claude as a sprite atlas. Next work: develop truly native 32×32 transparent original character art and six meaningful run frames plus other required states; test against existing 320×180 terrain and only then package compatible manifests. STATUS: IN PROGRESS — QUALITY REWORK. The original v1 and oversized fighter art remain rejected.

2026-11-23 01:58 AM EST — REFERENCE AUDIT / STILL IN PROGRESS — QUALITY REWORK

Opened and visually inspected the actual approved master board, earlier roster board, gameplay showcase and quiet grassy-ruins reference. The controlling character language is NOT a detailed animal mascot or an armored human: tiny iconic toy-like figures with compact round/squat forms, large plain expressive eyes, small short limbs, restrained costume/accessory detail, black/dark clean pixel outlines, a few deliberate shade clusters and bright but controlled colors. The roster board is an EXPLORATION (some designs are franchise-adjacent) rather than approved canonical characters. Preserve the visual grammar while designing ORIGINAL silhouettes. The earlier oversized goggle-animal/bunny concept still misses scale and sprite density, and must NOT be promoted to source art. Target ~20–30px-tall figures within 32×32 cells, one coherent game pixel density and quiet 320×180 platform background. Need real 6-phase runs and unique attack/grab/throw/hurt poses. No native transparent frame set has yet passed visual and technical checks. Keep request in inbox; do not deliver or close. Next step: produce genuinely native small source sprites and inspect them at 1× before atlas packaging.

2026-11-23 04:43 AM EST — QUALITY REWORK ATTEMPT, NOT DELIVERED

Opened the approved visual benchmark, compact character roster, and quiet grassy-ruins scene. Produced a new art-directed 12-pose concept sheet (two original heroes, six poses each) rather than code-drawn rectangles. This remains a source concept ONLY: the characters are oversized relative to 32×32 cells, magenta background requires careful masking, and neither hero has a genuine six-frame run cycle, full grab/throw/hurt/crouch/victory states, a verified transparent native atlas, or a 320×180 QA composite. It therefore fails the controlling visual+technical delivery gate. No art files uploaded as completed, no status advanced to delivered. Next: establish small-scale polished source poses, animate real distinct frames, manually clean alpha and pixels, assemble 32×32 sheets, inspect at 1×, validate manifests and gameplay scene. STATUS: IN PROGRESS — QUALITY REWORK.
