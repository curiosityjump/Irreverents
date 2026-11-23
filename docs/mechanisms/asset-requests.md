# Asset requests (Claude → ChatGPT, through Google Drive)

**Reference.** Open it before asking for any art or audio asset.

## What it is

The owner set up ChatGPT as the project's asset maker.

**Owner, 2026-11-23, to Vision Partner, first-hand:**
> Ok, chatgpt is setting up the google drive so you can request assets, it will see those requests and put the requested assets into the drive, and so on. I want yoy to take advantage of this. Make sure the orchestrator knows it can request assets this way.

The protocol itself is the owner's Drive doc, mirrored at
`docs/design-library/06-asset-collaboration-claude-chatgpt/00-start-here-claude-chatgpt-asset-request-protocol.md`.
Read it; the short version:

1. **Request:** create ONE new Google Doc in Drive folder **01 REQUESTS**
   (https://drive.google.com/drive/folders/1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp),
   named `REQ — <asset plan ID> — <short description>`, first line
   `STATUS: REQUESTED`. Say: in-game purpose; asset type; size / pixel
   scale / transparency; states needed; reference links; priority
   (BLOCKING / SOON / BACKLOG); one success test. The protocol has a full
   example. One doc per asset or tight batch; never duplicate a pending one;
   changes to a delivered asset are a new `REVISION` request.
2. **Wait:** ChatGPT checks **hourly** (America/New_York), not instantly.
   Don't block on it: build with placeholder art and swap the asset in when
   it lands.
3. **Collect:** delivered request docs move to **02 DELIVERED** with links;
   the art itself lands under `03 Visual Direction and Assets`. Blocked ones
   move to **03 NEEDS CLARIFICATION** with the reason. Run
   `python3 -I tools/drive_sync.py` (`design-library-sync.md`): the art
   arrives in `docs/design-library/`, and the top of the Drive changelog is
   printed. Copy what the game uses into the game's own asset folder; the
   mirror is reference, not the game's runtime.
4. **Use by default.** The protocol's "OWNER RULE — APPROVED FOR USE BY
   DEFAULT": new asset candidates may be integrated immediately without
   owner sign-off; the owner critiques later. Concept images stay concepts:
   don't treat a flattened scene as a tile atlas.

## The catch: writing to Drive

Sessions in this cloud environment can **read** the shared Drive folder (the
public link) but **cannot create a Google Doc in it**: that needs a signed-in
Google account. The fix is the claude.ai **Google Drive connector**
(https://claude.ai/customize/connectors), which provides `create_file`;
connectors load when a session starts, so only sessions started after it is
connected get it. A session without it has no way to submit a request and
should say so (to its lead / the orchestrator) rather than invent a
workaround; the owner can also paste a request into a ChatGPT chat by hand.
