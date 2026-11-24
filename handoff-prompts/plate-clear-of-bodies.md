# Nobody is hidden under the party plate: a hero or a bad guy at the top of a room stays visible on a phone

**Landed so far:** nothing yet. (A builder stopping at its budget writes
its commits here, one line, before it stops.)

Brief for one builder, one or two small pushes. Written 2026-11-24
18:20 UTC by the orchestrator (`session_017WiGzHY5UZsWTLCH8cLm8M`). Read
first: `docs/mechanisms/rendering-world.md` (all: "The party plate",
line 160 on; the banner that already moves when it would overlap the
plate, line 153; the thrower's aim drawn below the plate, line 99),
`docs/plan/step-5.md`, "Camera" ("Second push": what the camera now does
and what it could not), `docs/plan/step-8.md` ("Fourth look" and the
phone HUD's three passes: what was decided about the plate's size and
place; do not undo it), `docs/deliberate-designs.md` (grep plate, HUD).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with shot paths.
**Notes:** `docs/plan/step-8.md`, a section "The plate clear of bodies".

## The task, and the measure

iPhone first, legible pixels (`CLAUDE.md`). Three looks today found the
same thing, and the camera cannot fix it because it cannot go above a
room's top (`docs/plan/step-5.md`, "Camera", "What's left"):

- **Upright (390x664), a hero on the forest's canopy** (`forest-trail`,
  rows 1-2) sits under the party plate, only legs showing
  (`docs/plan/step-15-shots/canopy-390x664.png`; Step 15's lead: "any
  tall room with a ledge at the very top").
- **Sideways (844x390 and 750x340), the Hall gallery's balcony thrower**
  is half or more behind the plate or off the top edge
  (`docs/plan/step-24.md`, "Look at slice 1b's shots"); after the
  camera's second push 9 of his 26 px show.
- **The undercroft's stair thrower** is cropped by the top or right edge
  in `docs/plan/step-24-shots/2/pocket-sideways.png` and
  `pocket-upright.png`.

Moves no row of the plan's table; a player who cannot see who is hitting
them, or their own hero, reads it as broken.

## Decided (`DRAFT:`; one `docs/decisions-log.md` entry)

The plate gets out of the way; the room does not change and the camera
is not touched (it landed today at 778ab9d). In this order, smallest
first, stopping when the three cases pass:

1. **While any body (a hero, a friend, a bad guy, a townsperson) is
   drawn under the plate's rectangle, the plate fades** to a faint
   state (the hearts and faces still readable, your call on how faint)
   and comes back when nobody is under it. Never while GAME OVER or a
   full-screen card is up. A tap target under it, if the plate has one,
   keeps working.
2. If fading is not enough for the sideways thrower (he is partly off
   the top edge, not only behind the plate): **a small mark at the
   screen's edge pointing at an enemy who is aiming at you from outside
   the picture** (the camera's builder suggested it), drawn with what the
   aim's arc and cross already use. Only for a body that is aiming at
   you; not a general off-screen radar.

Not this brief: moving or shrinking the plate, changing the camera,
moving the balcony, the canopy or the stair.

## Do

Measure first: for each of the three cases, on a phone-sized page, how
many of the body's pixels are under the plate or off-screen now (a page
`evaluate`, as the camera's facts do). Then build 1, re-measure; build 2
only if a case still fails. Scenarios do not see the HUD: this is e2e
facts, each with a control watched failing (an env switch that turns the
fade off), and shots before and after at 390x664, 844x390 and 750x340 in
`docs/plan/step-8-shots/plate/` (run the e2e with `E2E_SHOTS=1` only for
your own shots; a plain run writes nothing under `docs/`).

## Yours and not yours

Yours: `src/client/draw/hud.ts` and the smallest thing beside it in
`src/client/draw/**`; a new file under `scripts/e2e/` and its one call
line in `scripts/e2e.ts` (the e2e-reds brief owns fixes there: add only
your line, pull and rebase before you push). Not yours:
`src/client/camera.ts`, `content/camera.json`, `src/sim/**`,
`content/rooms/**`, `content/placements/**`, and what the running briefs
own (`suplex.md`, `guard-vehicle-courtyard.md`, `ranged-enemy-2.md`,
`camp-entries.md`, `biome-backgrounds.md`, `e2e-intermittent-reds.md`).

## Done

Build and check green; your facts green twice and their controls red;
one full `npm run e2e` (the suite has an intermittent red in about half
of today's full runs: `hearts-game-over`, `start-link-back`,
`plates-friend-held`, `door-use`, `outpost-break`,
`start-continue-gone`, `quarry-depot-in` have each gone red once and
pass alone; one of those red once is not yours, re-run it alone and say
so); pushed to `main`, live (`npm run check:deployed`, `npm run
check:live`; read `/debug/errors` and `/healthz` first). A deploy that
seems stuck with `/healthz` healthy on an older commit: never revert,
wait up to fifteen minutes pushing nothing
(`docs/verifying-and-finishing.md`, "The pre-push gate"). Rebase once
before the push; do not re-run the full e2e after every rebase. Stop at
about 300k tokens with "Landed so far" filled in. Nobody has tried this
on a real iPhone: say so.
