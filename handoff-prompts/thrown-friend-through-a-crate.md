# A friend you throw bounces off a crate on your phone and sails through it on theirs (Step 5 / Step 1)

Brief for one builder. Written 2026-11-24 12:00 UTC by the orchestrator
(`session_017WiGzHhT2apmWHT61rQ65G`). Read first: `docs/mechanisms/network.md`
("Known limits", "Predicted hits", "Traps"); `docs/plan/step-5.md`, "Builder
notes > Flakes", the paragraph "`t-throw-friend` / `s-throw-friend`: two
causes"; `src/net/predict.ts` (how lent bodies enter a page's step).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:** `docs/mechanisms/network.md`,
and a "Thrown friend" section in `docs/plan/step-5.md`.

## The task, and the measure

The owner's standard is "the 'OHHHHH' of spectacular physical impact", and
D-020 names "knockback into walls/other enemies". Throwing your friend is
the co-op heart of that, and today the two phones disagree about what the
friend hit. It also reds the gate: `t-throw-friend` failed in the
orchestrator's full run at 3b864cd and in the town builder's gate at about
11:40 UTC. Moves no row of the plan's table; it makes a confirmed thing true
on both screens and the pre-push gate trustworthy.

## Measured (the checks builder at f0389d8; not re-measured)

The grab-and-throw part run 60 times, three at a time; 5 failed.
- **3 of 60:** B is thrown into a heavy crate 29 px ahead. A's page drew B
  stop and bounce back (18-22 px); B's own page drew B fly through the crate
  to x 41-57. Once the throw's effect is acknowledged, B's page owns B's
  motion and its local world holds only B, so B flies through bodies and the
  server takes B's reports. A's prediction (4754ec5) steps the flight
  against the bodies A draws and bounces it: the one screen that is
  physically right.
- **2 of 60:** the grab never took: A stood 6 px behind B facing it, tapped
  Grab, and no page drew B carried within 1.5 s. Cause not found.
- Related, from the wagon-barrier fix (2ff872f; `docs/plan/step-20.md`,
  "The check that fails some runs"): a narrow body (a thrown friend, about
  18 px) reported past a 16 px wall in one jump still slips through a
  breakable wall on the server.

## Do, in this order, each its own push

1. **Re-measure** on today's `main` with the same runner (60 throws; say how
   you ran them one at a time: three at once was itself a load), and split
   the failures by cause.
2. **The flying friend meets what is in the way, on every screen.** Put the
   drawn bodies near a flying own character into its page's step, as
   `predict.ts` does for lent bodies, so B's page bounces B off the crate
   and reports that; or have the server step a thrown body's flight against
   its own world until it lands and correct B's page once. Choose by which
   keeps "your own character moves instantly on your own phone" (the first
   entry of `docs/decisions-log-archive.md`) and say why. `DRAFT:`, one
   `docs/decisions-log.md` entry. Then 60 throws into a crate: both pages
   draw the same end within a few pixels, the old build as the control.
3. **The grab that never took:** find it (log what the server did with the
   Grab press: range, facing, a stale input in the queue; Step 1's input
   queue adds 150-200 ms, `docs/plan/step-5.md`, "Carried here"). Fix it if
   it is small; else report what it needs.
4. If budget remains: the narrow body past a thin wall.

## Paths, traps, scope

Yours: `src/net/` (prediction, the local world, smoothing), the server's
handling of a thrown player body, the throw and grab e2e facts and their
runner. Shared shapes change additively only. Not yours: `src/sim/` verbs
(the throw itself is right), any room, the HUD, the camera (another builder
is changing `src/client/draw/room.ts` and `render.ts` tonight: message
`session_017WiGzGHrgYYzH2iGQXcGaG` before touching either). Traps: every
network change must be measured under delay too (the town builder's
harness, `docs/plan/step-4-replay-tiers.ts.txt`, shows how to add 300/60/40
ms); never weaken a fact to pass; a fix that makes B's own flight feel
late on B's phone is worse than the fault: measure press-to-drawn before
and after. Stop at about 300k tokens with notes.

## Decided vs. open

Decided: both screens show the same thing hit. Open, yours: where the
flight is stepped (`DRAFT:`). Nothing for the owner.

## Verify

Build, check, full `npm run e2e` twice, the 60-throw runner before and
after, pushed to `main`, `npm run check:deployed` and `npm run check:live`.
