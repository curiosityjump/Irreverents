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

## Who files them: Vision Partner, as asset coordinator

**Owner, 2026-11-23 ~04:00 UTC, to Vision Partner, first-hand:**
> You can help by coordinating this and making the requests and so on.
> Are you prepared to request assets from chat via the drive? Will you do this as needed throughout the night without me?
> You should be able to write too

So the Vision Partner session named in `docs/questions-for-the-owner.md`'s
header files every request and collects every delivery. **Any other session
that needs an asset sends Vision Partner one message** (`send_message`, or
an entry in `docs/questions-inbox.md` headed "Asset need") saying: what it
is for in the game, size / frames / states, which step needs it, priority.
Vision Partner writes the `REQ` doc, and on each hourly check syncs
deliveries into `docs/design-library/` and tells the asker where the files
landed. Don't write to Drive yourself even if you have the connector: one
filer keeps ChatGPT's queue free of duplicates.

**Don't wait for the hourly check to *use* a delivery.** Reading Drive needs
no connector: any session can run `python3 -I tools/drive_sync.py` whenever
it wants the latest art (ChatGPT itself only processes requests hourly, so
that, not Vision Partner's check, is the real pace).

### Handoff state (2026-11-23 ~13:30 UTC; picked up by session_017WiGzGHxdLq71CDUoQZz9Z; its hourly self-check was refused by the permission check at 13:3x UTC, so Drive is checked only when the owner or a session wakes Vision Partner until the owner allows it)

- The genesis Vision Partner's hourly Drive-check task (`trig_01B6h7mKw47J36oxJaxWf2NU`)
  was **disabled** at 09:52 UTC for the usage limit and stays off: it fires
  into that old session. **The next Vision Partner creates its own hourly
  check** (same prompt, `persistent_session_id` = itself) if it keeps the
  asset desk.
- Last sync 13:2x UTC brought in **"P01 — Ruins Starter Kit (Playable
  Prototype)"** under `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`:
  48 px hero state sheets (rogue and others), a static tile atlas, a small
  JS demo and 320×180 previews; and ChatGPT's "02 VISUAL QUALITY GATE"
  doc in `06-asset-collaboration-claude-chatgpt/`. Not yet looked at by
  Vision Partner; the Step 8 lanes should judge it against
  `docs/art-reference/heroes-v2-chatgpt-concept.png`.

- Sync ~13:41 UTC (Vision Partner, the owner asked "Check drive for art"): one new image, **H07-01 Hall of Legends corridor**, `docs/design-library/03-visual-direction-and-assets/h07-hall-of-legends-concept-studies/`. ChatGPT made it unrequested from its own art plan and labels it "CONCEPT REFERENCE ONLY — NOT A TILESET": a 1648×928 flattened scene with three blank monument frames. Useful for Step 7's Hall layout and mood, not for importing. Every request in 01 REQUESTS is still open; none was delivered.

### Requests in flight

| Filed (UTC) | REQ doc | Priority |
|---|---|---|
| 2026-11-23 03:58 | C02-02/C02-03 — two playable heroes — **DELIVERED ~04:15**: `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/c02-playable-heroes-prototype/` (plain; ChatGPT has since moved v1 to `c02-rejected-hero-v1-grid-format-reference-only/`, layout reference only; v2 pending) | BLOCKING |
| 2026-11-23 03:58 | N03-01/02/04 — shopkeeper, guard, cat with 3 modes; grunt + brute enemies; alarm signaler prop | SOON |
| 2026-11-23 03:58 | E01-02/E01-03 — 16×16 tile atlases (grassy ruins, castle, town street) with solid/one-way/decor/breakable flags; parallax layers | SOON |
| 2026-11-23 04:00 | U08-01 — six 24×24 touch buttons (left, right, jump, attack, grab/throw, special) + pressed states; the owner's end-to-end process test — **DELIVERED ~04:10**: `.../current-pixel-art-explorations/u08-01-touch-controls-ready-for-prototype/` | SOON |
| 2026-11-23 04:07 | A01-01 — first sound-effects pack — **DELIVERED** (synced 08:3x): `docs/design-library/03-visual-direction-and-assets/audio/a01-01-first-sfx-pack/` (OGG/WAV + manifest) | SOON |
| 2026-11-23 04:20 | A02-01 (replaced 04:07 version) — music: layered area theme + stumble/snap-back, stealth, NFS/GTA pursuit layers, Far Cry outpost, Smash cantina brawl, GTA radio, Matrix mob, royal march, Hall | SOON |
| 2026-11-23 04:25 | C02-02/03 REVISION — heroes v2: distinct grappler/quick silhouettes, real animation, crouch, victory | BLOCKING (doc says so; ChatGPT: "IN PROGRESS — QUALITY REWORK" at 08:18 EST, not delivered) |
| 2026-11-23 13:32 | C02-04 + N03-05/N03-06 — third hero (the flyer), the king, the villain, each NPC with three moods; also sets one priority order across all pending requests (heroes, then NPCs, then E01 ground and sky layers, then music); answers Step 8's "Asset need" | BLOCKING |

All assume 320×180 internal resolution and a 16 px tile grid (doc 14
option B; S00-01's phone previews). A build that chooses otherwise tells
Vision Partner, who files a REVISION.

## The catch: writing to Drive

Writing needs the claude.ai **Google Drive connector**. The owner connected
it on 2026-11-23; Vision Partner's session has it (write tested 03:57 UTC).
Without it, a session can only read the public folder. The connector
(https://claude.ai/customize/connectors), which provides `create_file`;
connectors load when a session starts, so only sessions started after it is
connected get it. A session without it has no way to submit a request and
should say so (to its lead / the orchestrator) rather than invent a
workaround; the owner can also paste a request into a ChatGPT chat by hand.
