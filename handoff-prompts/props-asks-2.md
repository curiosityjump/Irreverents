# Props lane, second builder: the looks the puzzle and the wagon's camp run are waiting for

Brief for one cold builder (art, props lane). Written 2026-11-24 00:45 UTC by
the orchestrator (`session_017WiGzJzo6aZqH4kYxxJsiV`). The first props builder
(`session_017WiGzEN1QbSnHzXNqV4XSt`) is on the owner's weapons sheets and near
its context limit; these asks came to it and it passed them on. Read
`docs/mechanisms/art-pipeline.md` ("Approved Drive assets first") and
`tools/art/props/README.md` (all of it: "Drive-first", "No approved source
found", "Core loops", and the traps) first. The cutter is
`tools/art/props/srcimport.py`; every Drive cut so far is in
`tools/art/props/drive.py`; `make.py` packs; `selfcheck.py` must pass.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md` and to the asking builder, after each push,
with the commit and which sheet each piece came from. Notes:
`tools/art/props/README.md`, a "Second builder" section.

## The asks, in this order (one small push each)

1. **For the puzzle** (`handoff-prompts/loop-puzzles.md`, builder
   `session_017WiGzJyWTCjY8CTzrkdcpZ`; ask it for exact ids before cutting):
   `part:undercroft:stone-plate` and its pressed `:down` state, 64×16; a floor
   grate `part:undercroft:grate` and `:open`, 32×16. And **decor kept off a
   part's tiles**. Also a doubt the first builder left: about eight undercroft
   decor items around columns 8-20, row 12 dropped when the hidden pocket went
   in (8120d92), and a bare patch there could point at the secret: look at the
   room in a mock scene; if it reads as a hint, fix it by the barrel hash seed
   in `place.py`, not by hand; say what you saw.
2. **For the wagon's camp run** (`handoff-prompts/loop-vehicles-b.md`, builder
   `session_017WiGzEvHsdz7Z8fr6XuECe`; ask it for exact ids): camp parts
   `fence-1x2`, `stall-2x2`, `barricade-1x4` and its broken state, and decor
   for the outpost's columns 44-87 (the room was lengthened tonight).
3. **For the wagon** (`handoff-prompts/loop-vehicles-a.md`, builder
   `session_017WiGzK3BxWQHTRLZHSmnYK`), only if the first props builder has
   not done it (ask it): `ride-wagon-empty`, the rider painted out of
   `ride-wagon-idle` (the sheet has no empty wagon: say plainly in the notes
   that this one is an edit of an approved cell, `DRAFT:`, and that an empty
   wagon is on the Drive's missing list).
4. Whatever a builder asks you for by message after that: agree ids first.

## Rules

From the approved sheets only; never hand-draw a final look (a stand-in is
`DRAFT:` and goes on the missing list: tell Vision Partner by message). Each
piece seen in a mock scene at 320×180 before pushing, the scene committed
under `docs/plan/step-8-shots/round3/props/`. Existing looks stay
pixel-identical unless the ask says otherwise. Two props builders are packing
`parts.png` tonight: pull before every `make.py` run and push at once after.

## Done

Each push: `npm run build`, `npm run check` green (`npm run e2e` if a look the
game already draws changed; the reconnect facts `h1`/`h2`, `cantina-row` and
the friend-throw facts fail some runs on `main` and are being fixed elsewhere:
re-run and report, never loosen); pushed; live.

## Added 2026-11-24 02:00 UTC: the owner's guard vehicles (do the report as soon as the files are there)

**The owner, first-hand to the orchestrator, ~01:55 UTC:**

> Guard vehicle assets being uploaded now

"Being uploaded": they may not all be there yet. After your current push,
run `python3 -I tools/drive_sync.py --check` (it lists what changed on the
Drive and writes nothing; give it several minutes); when new files with
guard vehicles show, mirror them (the sync tool, committing only what is
new, naming them) and **send a report before cutting anything**, to the
orchestrator: each file's Drive path and size, any doc beside it and what it
decides (labels are literal), and a plain list of what each sheet shows
(every vehicle, its states and frames, with or without a rider, wrecked or
not, any projectile or effect). If nothing new shows after two checks ten
minutes apart, say so and carry on with your other asks; check again after
each push. Then cut them as a look group (clear ids by what the thing is,
never a proposed proper name), the way the rides were cut
(`tools/art/props/README.md`, "Core loops"), each seen in a mock scene.
The vehicles builders (`session_017WiGzK3BxWQHTRLZHSmnYK`, the wagon's look;
`session_017WiGzEvHsdz7Z8fr6XuECe`, the camp run) and the town-tiers builder
(`session_017WiGzHTLU6WYfsfoEFK4si`: a guard vehicle is a natural later row
for the town's alarm) get the look ids by message.
