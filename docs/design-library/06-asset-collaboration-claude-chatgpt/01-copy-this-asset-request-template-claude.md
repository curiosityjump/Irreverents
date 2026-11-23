**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 COPY THIS — Asset Request Template (Claude)* (https://docs.google.com/document/d/1ntJHj5rYYi59_o4-0c5Pf-rFYKcJvX1ZlUP43nCJaUw/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

MANDATORY — CHECK THE ASSET CATALOG BEFORE SUBMITTING A REQUEST

https://docs.google.com/document/d/1bnr7GUgrYBVVY0BMkwx4qRPvW45Nk4grn-Tk6THcoY8/edit

The request should include: EXISTING MATCHES / SOURCE ASSETS: direct links to relevant previously made images, sprite sets, tiles and visual references, and what must be improved/converted. If nothing matches, explicitly say “No useful existing art found after reviewing catalog.” Do not simply ask for generic new pixel art if strong work is already present.

A delivery counts as complete ONLY after the new assets have also been listed in the central ROOT catalog with direct links, asset ID, status and actual intended game use. ADD TO THE CHATGPT FULFILLMENT SECTION: ASSET CATALOG ENTRY LINK / CONFIRMED UPDATED: \_\_\_\_\_\_\_\_\_\_

MANDATORY QUALITY AND VISUAL REFERENCE GATE

Before submission/fulfillment, link the actual LOOK reference image, not just “GBA pixel art.” The producer must inspect it, generate real aesthetically directed source art, and QA final pixels and native gameplay-size motion before counting delivery. Technical files are necessary but not sufficient. A FAILED visual gate leaves the request IN PROGRESS — QUALITY REWORK in the inbox and any placeholders separately labeled NOT FULFILLED. Do not request owner approval; improve autonomously. Details: https://docs.google.com/document/d/17OlSfBfTnUEUTmbo-zcsl4VrSn1mPny-zAP6kZaiodU/edit

ASSET REQUEST — COPY THIS DOCUMENT INTO 01 REQUESTS

This template stays in the COLLABORATION HUB. Claude: copy this Google Doc into the 01 REQUESTS folder, rename it REQ — \<asset ID or short topic\>, and fill in whatever details are known. Do not move this master template into the inbox.

STATUS: REQUESTED

PRIORITY: BLOCKING / SOON / BACKLOG

REQUESTED BY: Claude

DATE REQUESTED: YYYY-MM-DD, HH:MM EST/EDT

ASSET ID / TITLE: E01-03 — short descriptive name

IN-GAME PURPOSE

What screen/level/interaction needs the asset? What problem is currently blocking implementation?

REQUIRED DELIVERABLES

File type (transparent PNG sprite, pixel tile atlas, multi-frame animation, separate layers, source vector, scene reference etc.); count of frames; dimensions (native pixels); character/object scale; anchor or collision shape; necessary state variations. Include filenames if Claude's code expects particular names.

STYLE AND SOURCE REFERENCES

Exact links to existing art/style and any applicable Art Plan ID; direction: original bright, restrained side-on GBA-like pixel art readable on iPhone.

INTEGRATION DESTINATION (IF KNOWN)

Expected GitHub repo path or engine asset folder; technical format/manifest format if required. Never invent unknown links.

ACCEPTANCE TEST

What observable thing can Claude do after importing the delivered files? Example: toggle an open/closed/locked door with stable collision geometry at normal iPhone scale.

OPTIONAL CONTEXT

Related screenshots, code excerpts/issue links, priority note, and constraints. Missing details are OK: ChatGPT should select sensible creative defaults.

CHATGPT FULFILLMENT — FILL AFTER ACTUAL DELIVERY

STATUS: REQUESTED (update to IN PROGRESS, DELIVERED or NEEDS CLARIFICATION)

HANDLED BY:

DATE/TIME:

DELIVERED FILE LINKS:

ASSET STATUS: USABLE PROTOTYPE / TECHNICALLY VALIDATED / CONCEPT REFERENCE / NEEDS REVISION

INTEGRATION NOTES:

KNOWN LIMITATIONS:

CHANGELOG ENTRY:

INSTRUCTIONS

Keep this request in the Requests folder until fulfilled; then ChatGPT links the outputs, changes status to DELIVERED, moves the request document to Completed Requests, and logs material changes. A blocked request moves to Needs Clarification with a concrete blocking question. Claude should read Completed Requests to collect files; no owner pre-approval needed. A concept PNG is not automatically a tiled sprite atlas even though it can be used as temporary prototype art.

REQUEST FOLDER: https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp

DELIVERED FOLDER: https://drive.google.com/drive/folders/15X6uq3YK-NdKbQQt0FqaXY46msSW38Jm

CLARIFICATION FOLDER: https://drive.google.com/drive/folders/1qQW5tJo27wjAwZMHi8mGEJa8HRa7xoLz

PROCESS DOC: https://docs.google.com/document/d/1oBpJKI2P7v7rwoMku-TbcFuVQe2iajddK6v2i5Ro0G0/edit
