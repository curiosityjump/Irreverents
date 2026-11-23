**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/00 START HERE — Claude ↔ ChatGPT Asset Request Protocol* (https://docs.google.com/document/d/1oBpJKI2P7v7rwoMku-TbcFuVQe2iajddK6v2i5Ro0G0/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

CLAUDE ASSET HANDOFF UPDATE (23 NOV 2026): BEFORE generating lower-quality art or duplicating requests, open https://docs.google.com/document/d/1T7S5FVKq3ZTvNqwaIzC126wRb15V9Spp7xKbwhz-Qgg/edit . P03 https://drive.google.com/drive/folders/1m5KXh8Ts-UiMWS6Us9qaA6MlucsTHpGf and P04 https://drive.google.com/drive/folders/1CwqUK750arthkFGMfsK3yRiJ6lzlRfrW are now rich owner-endorsed visual source plates. REBUILD usable native frames/tiles from these, do not fake a 16px atlas by treating illustrative grid divisions as pixels. Complete actual REQs only after QA, catalog, Board, changelog, and links. Board rows now map to source folders. Claude can use pictures for immediate visual direction / temporary prototype, while producing actual importable assets.

MANDATORY TEAM PLANNING UPDATE (2026-11-23)

MASTER BACKLOG: https://docs.google.com/spreadsheets/d/1rzixv5r4QWs7PKLYJ0e_sreLy0LjTdgua8uXKeTJpSE/edit

Before making a new REQ, Claude should find the relevant BACKLOG ID, review its game need and existing A00/P01/P02 references, and include that ID in the request. Only if needed, add a new ID/row; don't duplicate a package already in the Sheet. On completion, the producer must update the Board row's Workflow status and actual Drive delivery, then the root ASSET LIBRARY index, direct links in the REQ, and Eastern-time changelog. The Board is the active \*work plan\*, the index is the file locator, and the request queue is a producer handoff. Claude fills Actual GitHub path only after code integration is real. Proposed regions/abilities are not automatically canon.

CHARACTER / NPC REQUEST CHECKLIST ADDITION — EXPRESSIVE FACES (2026-11-23)

BEFORE servicing any character/NPC request, READ https://docs.google.com/document/d/1W1rOej7YL6MGcvwZfbpBTBqMyMz9Q_O2zpLNCZ2XNL8/edit and inspect A00-04 character acting and A00-02 NPC reactions. Request specs should name target emotional beats as well as motion states; delivery must show actual visually distinct facial expressions (eye/mouth/head) for reaction, attack effort, stealth, hurt and joy where relevant, judged at 320×180. "Like Kirby" means expressive and immediately readable, NOT reuse recognizable character designs. Include direct catalog links and QA preview; do not mark source-only boards delivered as native frames.

CURRENT SHARED ART-PRODUCTION HANDOFF — 2026-11-23

First consult A00 six OWNER-ENDORSED DIRECTIONAL COMP IMAGES https://drive.google.com/drive/folders/1ejWvlQBo85YiC_5dsTxZFZugwFxKS1pB, then P01 ACTUAL SEPARATE IMPORTABLE PROTOTYPE FILES https://drive.google.com/drive/folders/1sXUTCyW2FTt0xuBauWfgSrUpfVw3ET43, then P02 FOUR SOURCE-ONLY SHEETS https://drive.google.com/drive/folders/1XQc2TZEkYJA2ZF9KvDOMHRPcEo_Q8msv. Do not call a single picture sheet native tiles/sprites. Read and follow AUTHORITATIVE REPRODUCTION SOP https://docs.google.com/document/d/1SinRhkiHFGlbZfsvYziXlSlVxerQG7J2vSgl3KxlWVo/edit. If request can be met by P01 existing art, route Claude there without duplicative generation. For new art: create strong source, extract native transparent sprites, validate actual pixels, poses, anchors/JSON and mobile preview; upload real files in functional folder; update central asset index and request doc before marking delivered; record in changelog. Default user approval allows immediate iterative use, not inaccurate technical status.

CRITICAL UPDATE — ASSET ROUTING / DISCOVERY IS MANDATORY (23 NOV 2026)

MAIN ASSET INDEX: https://docs.google.com/document/d/1bnr7GUgrYBVVY0BMkwx4qRPvW45Nk4grn-Tk6THcoY8/edit

Claude: (1) ALWAYS check the index and OPEN earlier visually strong assets before requesting or generating. (2) If a good concept/reference exists but requires actual PNG sprites/tiles, ask for a production conversion / extraction, naming the source, not a redraw from generic pixel-art words. (3) On receiving any delivery, see the index's category routing; do not rely only on the DELIVERY folder or ZIPs. (4) If a new asset is missing from the index, flag that as an INCOMPLETE handoff, even if the PNG exists somewhere else.

ChatGPT: Before accepting any REQ, locate the most relevant existing assets through this index, review the actual artwork, and reuse/adapt first. When files are generated, upload to correct functional folder, update this ROOT INDEX with ID, title, DIRECT LINK, status, version/supersedes, source request and integration notes, and THEN mark the REQ delivered/move it. An asset is NOT fully delivered if the index still doesn't route Claude to it. For revisions, change the index's preferred/current pointer immediately; retain old links as rejected/superseded history only. Update project changelog after actual verified writes.

READ / USE DEFAULT: do not wait for user approval. The quality gate still requires real art quality; the default-use policy does not justify pretending crude placeholders meet art requirements.

ROUTING VERIFICATION — REQUIRED FOR EACH NEW ASSET (2026-11-23)

1. Upload actual bytes to the appropriate batch folder inside 03 Visual Direction and Assets; never rely on a local/generated image or chat attachment as a Drive delivery.

2. Read back the Drive folder listing and individual uploaded file metadata to verify the real file IDs, filenames, MIME types, and parent folder. Inspect final art before assigning production-ready status.

3. Put direct verified Drive file links, asset folder, manifest/preview links, QA results and limits into the matching REQ Doc. Only then change status and move it to 02 DELIVERED if quality passed.

4. Update the root changelog AFTER confirmed uploads/Doc edits, with actual Eastern time and direct changed-file links, distinguishing concepts/placeholders from game-ready art. Verify changelog readback.

5. If no QA-passed asset exists, keep REQ in 01 REQUESTS marked IN PROGRESS — QUALITY REWORK. Do not imply Claude can find a local-only concept in Drive.

OVERRIDING QUALITY STANDARD — OWNER CORRECTION (22 NOV 2026)

MANDATORY before fulfilling any visual asset request: https://docs.google.com/document/d/17OlSfBfTnUEUTmbo-zcsl4VrSn1mPny-zAP6kZaiodU/edit

The owner rejected the C02 hero output as crude, visually unlike earlier good sprites, and essentially unanimated. A valid PNG/atlas/JSON is NOT a successful art delivery. First inspect the actual approved source images, produce art-directed polished original visual poses, visually inspect the files at native game size and in a real 320×180 composite, prove true differentiated frame motion and confirm requested technical properties. Code drawing is allowed for technical editing, NOT as the whole visual-design workflow for characters. If the quality bar is missed, leave the request open as IN PROGRESS — QUALITY REWORK; never mark DELIVERED or move the Doc to Completed. Owner default permission still means USE WITHOUT ASKING once quality is credible; no human approval gate.

FAST START FOR CLAUDE

1) Copy the request template: https://docs.google.com/document/d/1ntJHj5rYYi59_o4-0c5Pf-rFYKcJvX1ZlUP43nCJaUw/edit

2) Put ONE new named REQ Doc in https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp with STATUS: REQUESTED and a clear deliverable/success test.

3) Continue coding; no need to wait on owner sign-off. An hourly ChatGPT scheduled check attempts pending requests; this is not instant guaranteed fulfillment.

4) Find actually completed request Docs in https://drive.google.com/drive/folders/15X6uq3YK-NdKbQQt0FqaXY46msSW38Jm; each contains direct asset links and limitations. If the request is blocked, see https://drive.google.com/drive/folders/1qQW5tJo27wjAwZMHi8mGEJa8HRa7xoLz.

5) Requested art is permission-to-use by default, but flattened concept images are NOT falsely labeled engine-ready sprite sheets; Claude may revise and replace prototypes.

AUTOMATION STATUS — ACTIVE AS OF 22 NOV 2026

The Irreverents Asset Request Desk scheduled automation is enabled with an HOURLY condition-watch cadence, timezone America/New_York. It checks the request folder and attempts to fulfill feasible work; this does not guarantee every image/file-generation tool is available in each run. No instant triggers are implied. If a request is blocked, ChatGPT should leave a precise blocker rather than mark it delivered. Human/Claude can also ask in a regular chat for immediate processing.

ASSET REQUEST PROTOCOL — CLAUDE ↔ CHATGPT

Irreverents \| Active shared handoff \| 22 November 2026

The Drive queue lets Claude request game assets, and ChatGPT inspect, create, deliver, and report results. A Drive edit by itself does not immediately wake ChatGPT; scheduled checking (if enabled) and active conversations are what drive processing.

# Shared folders

Collaboration hub: https://drive.google.com/drive/folders/1W_H99UY0Xne85PWK8Lb4QcKK2q2tSncu

01 REQUESTS — Claude to ChatGPT: https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp

02 DELIVERED — ChatGPT to Claude: https://drive.google.com/drive/folders/15X6uq3YK-NdKbQQt0FqaXY46msSW38Jm

03 NEEDS CLARIFICATION: https://drive.google.com/drive/folders/1qQW5tJo27wjAwZMHi8mGEJa8HRa7xoLz

Final asset files generally belong in 03 Visual Direction and Assets (possibly a relevant new batch folder); delivered request Docs link to those files.

# CLAUDE — submitting requests

Create ONE NEW GOOGLE DOC in 01 REQUESTS per asset or closely related batch. Name "REQ — \<asset plan ID\> — \<short description\>" and put "STATUS: REQUESTED" at the top. State the in-game purpose; desired asset type (tiles/PNG sprites/frames/animation/UI/audio or scene reference); dimensions, pixel scale and transparencies if known; needed visual/interaction states; reference Drive links; priority (BLOCKING, SOON or BACKLOG); and one success test. Incomplete briefs are acceptable; ChatGPT should use creative defaults. Do not send requests by adding them only to the changelog. Do not duplicate existing pending docs. For changes to a delivered asset, make a new "REVISION" request linking the earlier delivery.

# CHATGPT — receiving and completing requests

At the beginning of any Irreverents work session, and during any enabled scheduled check, LIST 01 REQUESTS and READ each REQUESTED Google Doc plus references. Reuse existing art when feasible. Create whatever small set of files is needed, with preference for actual usable transparent PNGs, native-size sprites, pixel-aligned tiles, layers, manifests and state variants; for an image-only reference label it explicitly a concept. Follow the original bright restrained GBA-like side-view pixel language, legal original character designs, low visual noise and iPhone-scale legibility.

Upload the files to a suitable art batch under 03 Visual Direction and Assets, insert DIRECT LINKS and handoff notes in the request Doc, mark "STATUS: DELIVERED" and MOVE the Doc into 02 DELIVERED. Add a brief date/time and direct links in the shared root changelog. If blocked, mark "STATUS: NEEDS CLARIFICATION", state exactly what is blocked and move it to 03 NEEDS CLARIFICATION. Never call a failed or partial upload delivered. Move requests rather than merely appending notes, to prevent repeat fulfillment.

If a request is already being worked, document handling status in that Doc and avoid duplicate production.

# OWNER RULE — APPROVED FOR USE BY DEFAULT

All NEW creative asset candidates and implementations are approved for immediate TRY/USE by default. Do not wait for user pre-approval or stop asset production at an owner-review gate. Claude can integrate and iterate or replace assets, and the owner can critique later. Already REJECTED/SUPERSEDED styles and bad images are not silently rehabilitated. Concept images remain concept images, even when allowed as temporary prototype art: never falsely label a flattened scene an engine-ready tile atlas, or a nonmatching animation as production-ready.

Older instructions requiring explicit sign-off for S00-01/S00-02/S00-03 are SUPERSEDED. Continue producing practical assets without a sign-off pause while maintaining the chosen style and transparency of technical limitations.

# CODE vs ART

Claude writes code in GitHub; owner connects GitHub to Railway for auto-deploy to a browser URL. Drive stores shared requests and resulting asset references. Claude chooses when and how to commit delivered art to GitHub, then verifies the live browser build. A Drive asset upload alone is not a GitHub or Railway deployment.

# Request example

STATUS: REQUESTED

TITLE: E01-03 — Town shop doors

PRIORITY: SOON

IN GAME: Side-view shop facade, closed / open / locked and obvious collision changes.

DELIVERABLE: 16×16 modular tiles plus transparent door states; simple JSON manifest.

STYLE: Small original pixel sprites, calm GBA-era palette, playable at iPhone browser scale.

REFERENCE: \[exact Drive file/folder link\]

SUCCESS: Claude can import separated art and toggle the 3 door states at fixed collision width.

NOTES: Choose practical defaults; improve after playtesting.

# Routing

Art Plan: https://docs.google.com/document/d/1reKfubHb_S6mSyn89kTSm8T2bSRd67E2MptsL24skL8/edit

Style Lock: https://docs.google.com/document/d/1TYZcSUJ6pRxWCp76f2mrvwAAz90PRCYVRAWiejmJFFI/edit

00 START HERE: https://docs.google.com/document/d/1-ASnTbCLAXSi_WCOl_7KNuUgelLXLmiZFKiN6APao2s/edit

Changelog: https://docs.google.com/document/d/17R7aKkqDxQwRk-cmywQbvQ_CcEzz4UqHz37YYYRnADs/edit
