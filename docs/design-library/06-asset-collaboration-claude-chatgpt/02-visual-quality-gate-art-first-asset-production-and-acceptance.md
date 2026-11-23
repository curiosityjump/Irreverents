**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/02 VISUAL QUALITY GATE — Art-first asset production and acceptance* (https://docs.google.com/document/d/17OlSfBfTnUEUTmbo-zcsl4VrSn1mPny-zAP6kZaiodU/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

MANDATORY VISUAL SOURCE / ASSET ROUTING (23 NOV 2026)

The up-to-date asset catalog is in the Drive ROOT: https://docs.google.com/document/d/1bnr7GUgrYBVVY0BMkwx4qRPvW45Nk4grn-Tk6THcoY8/edit

It links the polished earlier character concepts, strong playable environments, source tile/prop boards, existing 16px technical prototypes, audio SFX and controls. When building any new sprite/tileset, FIRST open current source art and compare VISUALLY; do not recreate lower-quality generic rectangles and later call them done. In the current C02 revision, the catalog now links a recovered pose study with expressive grappler/quick-hero sprite poses, and the old primitive C02 is labeled REJECTED.

Actual quality-validated deliveries must be given an INDEX ENTRY before moving the request to DELIVERED; the preferred recommended link must point to the best CURRENT version and say what is merely reference vs technically importable. Claude should not be left with a folder of unlabeled PNGs to guess from.

VISUAL QUALITY GATE — ART-FIRST PRODUCTION AND ACCEPTANCE

Irreverents \| Controlling process revision \| 2026-11-22 \| Owner-directed quality correction

THIS DOCUMENT OVERRIDES EARLIER PROCESS LANGUAGE THAT TREATED CODE-DRAWN GEOMETRIC PLACEHOLDERS AS ACCEPTABLE DELIVERED ART, OR ALLOWED VALID PNG FILES TO BE EQUATED WITH GOOD ASSETS.

# Nonnegotiable distinction

OWNER'S RULE: Everything is APPROVED FOR USE/ITERATION BY DEFAULT. Do not wait for owner sign-off, and do not create a review bottleneck.

NEW QUALITY RULE: "Approved by default" means work can advance without asking the owner; it does NOT mean any technically valid PNG can be marked FINISHED or meet the art brief. The producer performs a real quality check and iterates. A low-fidelity placeholder can be voluntarily handed to Claude for engine testing only with status "TEMP PLACEHOLDER — NOT FULFILLED" and the original quality request stays open. Never move the request to DELIVERED based on placeholders.

Existing owner-rejected assets remain rejected. Rejected visuals are not legitimate source references for a new generation.

# The primary visual references (open and LOOK before creating anything)

1. APPROVED PIXEL-ART DIRECTION — the exact actual visual benchmark, not just the words "GBA-like": https://drive.google.com/file/d/1s2xzQtWfZw_KJwf7xkuHA8cu1RqFs5kq/view

2. Earlier compact character roster explorations, for CHARM / SILHOUETTE / SHADING / ENERGY, NOT for copying Kirby-owned shapes or treating generated names as canon: https://drive.google.com/file/d/1_Kf9A99HzHi7BH-jt_H_nQz2K5F5OhJ1/view

3. S00-01B quiet grassy ruins for GAMEPLAY SCALE, BACKGROUND RESTRAINT and TERRAIN READABILITY: https://drive.google.com/file/d/1-nt2daRplwxdd1QuuY8MGCGhaHZdWeGQ/view

4. S00-01B 320×180 phone preview: https://drive.google.com/file/d/1zaOazCAtXxenmiUPhCseD6U1ThGXh5cY/view

5. Art Production Plan 13: https://docs.google.com/document/d/1reKfubHb_S6mSyn89kTSm8T2bSRd67E2MptsL24skL8/edit

6. Visual Style Lock 14: https://docs.google.com/document/d/1TYZcSUJ6pRxWCp76f2mrvwAAz90PRCYVRAWiejmJFFI/edit

The references are of an ORIGINAL project inspired by early-2000s handheld pixel-platformer clarity, not license to copy a recognizably Nintendo-designed character.

# Negative example — do not repeat

The C02 hero v1 assets: https://drive.google.com/drive/folders/1D34ZytHeo2RUD2un9ox20sB4TD3bajpn

Visually inspected: both are essentially straight-sided rectangular torsos plus square heads/eyes and hats; silhouettes and posture are similar; idle/run/jump barely differ; attack/grab/throw actions are largely a straight arm extension; minimal shading and facial expression. Being 32×32, alpha transparent, and JSON-manifested made them machine-parseable but did NOT make them look or move like our earlier reference. Owner explicitly rejected their art quality. REJECTED for active art, retaining only the sprite-grid/manifest format as a compatibility reference until replaced.

Also avoid generic box-figure icons, overly simplistic 1–2-flat-color geometric sprites, faux idle/run sprites cloned with 1-pixel changes, or script-drawn rectangles marketed as polished GBA art.

# Mandatory workflow for character sprites / NPCs / creatures / animation

1. ART DIRECTION FIRST: Read the current REQ and LOOK at actual positive reference image(s). Compose an ORIGINAL design with recognizable character-specific silhouette, facial personality, accessories, readable material/shading, harmonious palette, hands and feet. Never assume "pixel art" as a word is a quality substitute. Prioritize a genuinely polished source sprite/model and distinct key poses.

2. START WITH 1 HERO / 1 ENEMY OR A SHORT KEY-POSE TEST, not a mega-sheet of 48 uniformly bad frames. Design a real IDLE, RUN STRIDE, JUMP, CONTACT HIT and GRAB/THROW key pose (choose what the brief requires). See them together on the same terrain tile and at 320×180, not only huge zoom.

3. IMAGE-FIRST WHEN IMAGE CREATION IS AVAILABLE: Use a high-quality image-creation/editing workflow to design original, convincing pixel sprite poses that match the reference. Consistent character scale/face/costume across frames matters. Python, PIL, SVG and hand-coded pixels are fine for CROPPING, ALIGNMENT, TRANSFORMATIONS, ATLAS ASSEMBLY, manifest generation, masking and validation—not for substituting crude square stick-figure art for the visual-generation/design phase. If visual generation is unavailable in a scheduled run and no good source sprite is present, do not invent primitive artwork and mark it final.

4. BUILD TECHNICAL ARTIFACTS: Convert or refine the designed poses to native transparent frames (e.g. 32×32), consistent baseline and pivot, no stray antialias, with correct frame count, durations/loop semantics and exact requested filenames. Do not claim image output is a real engine-ready sprite sheet until transparency, cell alignments and consistent silhouette/frame edges have been checked.

5. TRUE ANIMATION: A run must visibly cycle legs/body/arms, not move one pixel while keeping the pose static. Attack requires anticipation/contact/follow-through/recovery; grab requires recognizable reaching/holding posture; throw requires winding up, heave, release; hurt requires a clear reactive pose. Key changes must be apparent at full-screen gameplay size, not only by inspecting color differences. A 6-frame animation means six purposeful motion beats, not repeated placeholders.

6. VISUAL QA IS REQUIRED: Open the REAL resulting assets/images (not only file metadata). Examine: approved-reference resemblance in pixel treatment (not copied subject), silhouette contrast and charm, action readability, frame consistency, distinct animation, crisp edges, appropriate alpha, original IP. Show at 1× or 2× plus a nearest-neighbor contact sheet and preferably an animated GIF or compact contact sequence. Composite two heroes into the SAME 320×180 game background to confirm their visual distinction and size relative to terrain. If it reads as box figure, robot-like rectangles, near-static animation, excessive noise, anime illustration, or copied franchise art, REWORK IT.

7. TECHNICAL QA: programmatically test dimensions, alpha, 0-margin cell coordinates, frame count/order, transparent padding, valid manifest links, pivots and requested states. For tiles test boundary adjacency, repeated patterns, collision flags, and a small assembled sample. For controls verify visual contrast and touch-scale presentation. Quantitative checks detect bugs; human-like visual inspection decides art quality.

8. DELIVERY: only after visual + technical QA, upload final real files and visual evidence (contact sheet / small gameplay mock + optional motion proof) to Drive. Include original source/working files if useful, manifest, deviations/limitations and one status: READY FOR GAME USE (quality gate passed), PARTIAL — QUALITY IN PROGRESS, or CONCEPT REFERENCE ONLY. Do not mark requests DELIVERED on a partial item. Default permission allows Claude to integrate QA-passed art at once without asking the owner.

# Workflow for environments, tiles, props and UI

Environment art must match the earlier lively but quiet pixel world: coherent color clusters/shading and depth, walkable geometry legible over background. Avoid flat random rectangles or "pixel-art" imitation without a coherent palette. For a requested tileset, prove real 16×16 adjacency, seamless edges, contact art AND a native 320×180 assembled playable scene. Do not deliver a flat image as tile sprites; separate parallax where requested.

Props/icons need clear symbolic silhouettes and appropriate scale, shading, contrast and distinct states; no unreadable micro-detail. UI must appear correctly above an ACTUAL screen mock with the art, not simply 24×24 isolated blobs. Small-scope test does not justify bad visual quality.

# How to handle tool/time constraints honestly

If an asset looks poor or only rectangles were generated: it FAILS the acceptance gate, even if the manifest passes. Keep request STATUS: IN PROGRESS — QUALITY REWORK, leave it in 01 REQUESTS, and report the precise missing visual-quality criterion or technical blocker in the request; if time is limited, publish only clearly marked interim placeholder art in a separate folder. Never disguise partial / visually unvalidated output as a delivery.

The nightly automation should process as much quality work as it can, not as many tiny green checkmarks as possible. One well-designed hero is better than two weak sheets. An incomplete high-quality work-in-progress is better than a false delivery.

Do not request the owner's approval just to proceed. Iterate autonomously against the benchmark. Claude should be able to implement the improved art as soon as files meet quality requirements.

# Acceptance for the current C02 revision

Existing Claude revision request: https://docs.google.com/document/d/1velYJklnMai16cH12kYu-BIlyhx_p-6NlSpO41vfuKw/edit

Need two distinctly different original hero silhouettes. Grappler = genuinely heavy/strong posture/arms with substantial punch, lift, suplex/throw; Quick hero = compact light nimble body and pronounced scarf/ears/lean, distinct palette. 32×32 native sprites and compatible 6×8 layout / manifest format if possible; keep frame API backward-compatible with current Claude code, or provide adapter notes. Run (6) must be clearly distinct frames; attack, throw, hurt, stealth/crouch and victory readable. Verify each in a common 320×180 test scene. Prioritize this REWORK over creating new low-grade assets.

Owner-approved by default does not permit ignoring the rejection of the v1 character art.

# Operational reliability

1. Always read the shared Drive INBOX and confirm statuses before starting.

2. Prefer explicit revision requests and original current positive images over old automation context.

3. Do not close a request unless both visual and technical acceptance checks genuinely pass.

4. If checked by automation with no suitable visual-generation/editor capability, leave the request pending with truthful progress; NEVER ship programmatic stick-figure art just to clear a queue.

5. Keep Drive changelog short and honest. Log accepted quality work and deliberate rejection/revision with direct links.

# Next steps

Claude can immediately continue with game code using temporary boxes as ENGINE PLACEHOLDERS while this art is properly recreated. Those boxes do not become final visual assets. The current C02 v1 is specifically visually rejected; the C02 revision is first priority. Remaining tile/NPC/audio requests should use this same quality-first standard.

QUALITY GATE ADDENDUM — MULTIPLE VISUAL ANCHORS (2026-11-22, owner correction)

Do NOT reduce the project's established visual language to a single image or to generic "GBA pixel art." Review the actual previously produced visual collection as a coherent corpus, distinguishing explicitly approved direction from explorations, candidates, and rejected work. In addition to the original approved direction and compact character roster, inspect:

- Gameplay showcase: https://drive.google.com/file/d/1VSAPHeTQ5Uw_5AFP-Y4paoxQHIQhCWck/view

- World and ability studies: https://drive.google.com/file/d/18e3U20DMwbmZHrU8RFOwO1PU1qjfV0w8/view

- Cooperative adventure studies: https://drive.google.com/file/d/1nngd6l6Sargc5dRENSmZjEGF0vagxBGV/view

- Grassy ruins A/B: https://drive.google.com/drive/folders/1BCT_Sao2sZNCygUCv0qSQcECtIlsmc2j

- Quiet environment series: https://drive.google.com/drive/folders/11Wli0oy1WAtgIHT4ZUPX5Nprs0nM3RBD

- Current pixel-art exploration collection: https://drive.google.com/drive/folders/1keZSTY0jaKXupkZ8TXZMW11c9e5s\_\_C2

The roster board and other exploratory studies are NOT automatically owner-approved designs. Use the approved reference as primary and derive complementary evidence about character scale, silhouette language, action energy, environmental palette, foreground/background restraint, and shared world identity from the wider collection. In case of conflict prefer explicit owner feedback and the style lock. The owner has rejected BOTH the crude C02 v1 sprites and the subsequent over-detailed humanoid fighter concept. Do not use either as the new target. A successful revision must look like it belongs alongside the existing world and character boards, not merely like a polished standalone pixel-fighter sheet. Do not declare quality pass until side-by-side comparisons to several actual source boards have been made at gameplay scale.
