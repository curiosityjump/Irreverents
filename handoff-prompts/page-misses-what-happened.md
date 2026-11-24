# A phone sometimes never draws what just happened: a GAME OVER card, a banner, a sound; and a hero who is hit looks untouched on their own phone

**Landed so far:** nothing yet. (A builder stopping at its budget writes
its commits here, one line, before it stops.)

Brief for one builder, two small pushes. Written 2026-11-24 20:35 UTC by
the orchestrator (`session_017WiGzHY5UZsWTLCH8cLm8M`). Read first:
`docs/mechanisms/network.md` (all of it: "A page does not get the
server's `c`", "Predicted hits", "A throw", "A flying own character",
"Traps"), `docs/plan/step-5.md`, "The e2e's intermittent reds" (the
measuring behind fault 1, by the builder of
`handoff-prompts/e2e-intermittent-reds.md`; pull first, it lands
today) and "Thrown friend", `docs/plan/step-8.md`, "The armoured guard's
look", the last bullet (fault 2, with file and line), 
`docs/mechanisms/combat-and-impact.md`, `docs/deliberate-designs.md`
(grep prediction, snapshot, own).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push. **Notes:**
`docs/plan/step-5.md`, a section "A page misses what happened".

## The task, and the measure

Two faults in how a phone learns what the server did, both found by
measurement today, both things a friend sees. Moves no row of the plan's
table; they are behind `hearts-game-over` going red in full e2e runs
(four sightings today) and behind three looks that found a struck hero
showing nothing.

## Measured (by others; re-measure before you change anything)

1. **Two snapshots in one frame drop the first one's events.**
   `src/net/client.ts` replaces `latest` per snapshot and the page's
   watchers read it once a frame, so when two snapshots arrive inside one
   frame the first one's events are never seen: the GAME OVER card,
   STAGE CLEARED, a poof, banners, sounds. Measured: 1 run of 20 of the
   `hearts-game-over` fact alone, the socket heard game-over-coming and 0
   frames drew the card, with no frame gap over 41 ms. The proposed fix
   from that builder: keep unread snapshots' events (queue them until a
   frame has read them), not only the newest snapshot's.
2. **A struck hero shows nothing on their own page.** On the struck
   player's page the beat's closing `push` carries no `fly`, so
   `applyEffect` (`src/sim/effects.ts:51-55`) never sets `c.flying` there
   and the hop is drawn in the jump and fall frames, not `hurt`; the
   white flash (`src/client/draw/sprites.ts:447-450`) needs `c.impact`,
   which the page does not get for its own hero ("A page does not get the
   server's `c`"), and a light hit's speed is under `FLASH_SPEED` 250
   anyway. Other pages draw that hero correctly from the server's copy.
   The owner's rule is impact over numbers (D-020): being hit must show.

## Do

**Push 1, fault 1.** Reproduce it deterministically first: a control
that delivers two snapshots within one frame (stall the frame loop, or
inject at the socket) and shows an event of the first one lost: the
GAME OVER card, a banner, a sound cue. Then fix it in `src/net/` so
every snapshot's events reach every watcher exactly once, in order,
however frames and snapshots interleave (and not twice after a
reconnect or a resent snapshot: say how you know). An e2e fact with that
control red on the old code. Then `hearts-game-over` alone 20 times.

**Push 2, fault 2.** The struck player's own page draws the hit: the
`hurt` frame for the hop and a flash, at once, for any blow that costs
a heart or knocks them, light ones included (`DRAFT:`: a flash for every
landed blow on your own hero, whatever its speed; log it in
`docs/decisions-log.md`). Smallest change that keeps the netcode's
rules: carry what the page needs on the closing push (additive field),
or let the page derive it from what it already gets; do not start
sending the server's whole `c`. An e2e fact on a phone-sized page with
150 ms added each way: from the blow, the struck page draws `hurt`
within one round trip plus a frame; control red on the old code. Shots
at 844x390 and 390x664 of a hero mid-hit, in
`docs/plan/step-5-shots/struck/`.

## Yours and not yours

Yours: `src/net/**`, the smallest additive field in the sim's effect or
snapshot shape (never rename or remove one), `src/client/draw/sprites.ts`
for the hurt frame and flash, a new file under `scripts/e2e/` and its
one call line in `scripts/e2e.ts` (add only your line; rebase before
you push). Not yours: `scripts/e2e/defeat.ts`, `start-screen.ts`,
`doors.ts`, `plates.ts` (the e2e-reds builder's, landing today),
`src/client/start.ts` (`owner-stuck-in-the-quarry.md`),
`src/client/draw/hud.ts`, `src/client/draw/suplex.ts` (`suplex.md`),
content.

## Done

Each push: build and check green; your fact green 5 times alone and its
control red; one full `npm run e2e` (one intermittent red on a fact
that is not yours is known: `plates-friend-held`, `door-use`,
`outpost-break`, `start-continue-gone`, `quarry-depot-in`,
`row-both-sides`, `t-grab-friend`; re-run it alone and say so; rebase
once before the push and do not re-run the full e2e after every
rebase); read `/debug/errors` and `/healthz`; pushed to `main`, live
(`npm run check:deployed`, `npm run check:live`). A deploy that seems
stuck with `/healthz` healthy on an older commit: never revert, wait up
to fifteen minutes pushing nothing
(`docs/verifying-and-finishing.md`, "The pre-push gate"). Stop at about
300k tokens with "Landed so far" filled in. Nobody has tried this on a
real iPhone: say so.
