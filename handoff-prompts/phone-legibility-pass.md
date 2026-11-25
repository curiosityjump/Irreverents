# Four things a phone shows badly, found by today's looks: the faded plate's hearts, the arrow at a thrower above you, the forest trail's sky, the quarry road's painted deck

**Landed so far:** push 1 at 711c341 (live). Pushes 2-4 committed locally at 008667b (arrow), 1dee293 (backdrops above), 4aeab19 (quarry deck), held for the owner's play (00:25 UTC pause); pushed once the orchestrator says "pushes are open". (A builder stopping at its budget writes
its commits here, one line, before it stops.)

Brief for one builder, up to four small pushes, each standing alone, in
this order. Written 2026-11-24 23:55 UTC by the orchestrator
(`session_017WiGzHY5UZsWTLCH8cLm8M`). Read first:
`docs/plan/step-8.md`: "Look at the plate's fade, the edge arrow and the
menu button", "The plate clear of bodies" (its builder's notes), "Third
look at the biome backgrounds" and "Third pass on the biome backgrounds"
(how the panoramas are cut, hazed, offset and faded upward:
`tools/art/backgrounds/import_panoramas.py`);
`docs/mechanisms/rendering-world.md` (the party plate, the thrower's
aim, backdrops); `docs/plan/step-5.md`, "Look at the camera's second
push".

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with shot paths.
**Notes:** `docs/plan/step-8.md`, a section "Phone legibility pass".

## The task, and the measure

iPhone first, legible pixels (`CLAUDE.md`; the owner's phone rules in
`docs/vision.md`). Each item is a look's finding on shots already in the
repo, not yet fixed. Moves no row of the plan's table
(`docs/vision-gaps.md` row 7). The orchestrator reviews each push by
having the new shots looked at blind.

## Do (each `DRAFT:`; one `docs/decisions-log.md` entry for the lot)

1. **The faded plate keeps its hearts readable.** The plate fades when a
   body is under it (1ef40fb, `src/client/draw/hud.ts`). Faded, the
   hearts and faces lose contrast exactly when a thrower is overhead,
   and the body it uncovers shows only as a ghost
   (`docs/plan/step-8-shots/plate/after/gallery-aim-844x390.png`). Fade
   the plate's PANEL and frame, not its hearts: hearts (and the played
   hero's face) stay at full strength with a dark outline; the body
   under the panel must read as a body. Shots before and after of
   `gallery-aim` and `canopy` at three sizes.
2. **The arrow at a thrower above the picture reads as a warning.** It
   is a cream triangle about 10-15 px drawn over the thrower's own burst
   and legs (`src/client/draw/aim-edge.ts`), and absent where the
   undercroft's thrower is cut off (`pocket-aim`). Make it a mark a
   player sees at a glance: larger, in the alert's red with a dark rim,
   pulsing with the wind-up, at the screen's edge and clear of the
   thrower's sprite, the plate and the menu button; shown whenever a
   body that is aiming at you is less than half inside the picture.
3. **The forest trail's top is canopy, not a glow.** In
   `forest-trail-1-after3-*` (all sizes) the top 40% is a smeared, blocky
   green-yellow glow where the first generation showed painted canopy; a
   painted mushroom is still cut off at the bottom left beside the real
   caps. Carry the painting's own canopy upward (tile or mirror its top
   rows as leaves, darkening) so nothing reads as unfinished; move or
   crop the painted mushroom off the real caps' rows. Also the blocky sky
   strip in `castle-street-1-after3-390x664` and the blurry tree blob
   top-left of `outpost-1-after3-390x664`, by the same means.
4. **The quarry road's painted deck leaves the play rows.** In
   `quarry-road-1-after3-*` and `planks-quarry-road-3-after3` a painted
   wooden deck and beams sit at chest height on the left (about x 30-185,
   y 90-130 at 844), level with a small real plank. Shifting the whole
   panorama made it worse (the third pass's notes): crop or paint out
   that deck in the room's cut of the panorama (a per-room mask in the
   import script, as data), or flip the panorama for this room so the
   deck is elsewhere.

Shots for 3 and 4 named `*-after4-*` beside the earlier ones.

## Yours and not yours

Yours: `src/client/draw/hud.ts` (the plate's fade only; the menu button
`#menu-btn` and its 8 px gap, restyled today at 9af30c4, are not to
change), `src/client/draw/aim-edge.ts`, `tools/art/backgrounds/**`, the
generated backdrop images and the backdrop fields of
`content/rooms/forest-trail.json`, `quarry-road.json`,
`castle-street.json`, `outpost.json`; a new file under `scripts/e2e/`
plus one call line in `scripts/e2e.ts`. Not yours: any other field of a
room file, `content/placements/**`, `src/sim/**`, `src/net/**`,
`src/client/camera.ts`, `src/client/start.ts`, what the running briefs
own (`guard-vehicle-courtyard.md`, `hidden-recruit.md`,
`e2e-intermittent-reds.md`).

## Done

Each push: build and check green; for 1 and 2 an e2e fact with a
control (the hearts' contrast against what is behind them stays above a
number you pick and justify; the arrow's box does not overlap the
thrower's, the plate's or the button's); your own facts green twice;
rebase once and push without a full e2e wait (the orchestrator's
clean-worktree full run covers the suite; `row-both-sides` and
`suplex-again` are known intermittent reds tonight); read `/debug/errors`
and `/healthz` first; live (`npm run check:deployed`, `npm run
check:live`). A deploy that seems stuck with `/healthz` healthy on an
older commit: never revert, wait up to fifteen minutes pushing nothing
(`docs/verifying-and-finishing.md`, "The pre-push gate"). Stop at about
300k tokens with "Landed so far" filled in. Nobody has tried any of
this on a real iPhone: say so.
