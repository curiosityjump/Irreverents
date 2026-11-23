# A hit lands when you swing: predict your own hits on your own screen

Brief for one cold builder. Written 2026-11-23 18:15 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`). Read `docs/mechanisms/network.md` in
full, `docs/mechanisms/combat-and-impact.md` ("the beat", the stamps), and
`docs/mechanisms/rendering-actors.md` before writing code.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit and the
measured milliseconds. Notes: `docs/plan/step-5.md`, a new last handoff entry.

**Small pushes, each standing alone and fully checked. The owner is playing
now and named this first.** A push to `main` is the deploy.

## The task, and why

The owner, 2026-11-23 ~18:10 UTC, first-hand, playing on a phone:
**"Big delay between swing and actual impact."** The owner's first standard is
"the 'OHHHHH' of spectacular physical impact" (`CLAUDE.md`).

Where the delay is (measured and read at 224f542):
- Round 3's capture, frame by frame on live: the grappler's swing burst plays
  155–320 ms after the press, **nothing happens until 520 ms, the hit star
  appears at about 555 ms** and the body moves after that.
- The chain: the hero's wind-up (`attackWindup`: grappler 0.1 s, infiltrator
  0.033, flyer 0.05, `content/tuning.json`), then the page's report to the
  server (`reportRate` 30/s, `content/net.json`), the server's step (the page
  simulates **only its own character**; every other body is the server's), the
  hit's own held beat of 2–8 ticks, the next snapshot (`snapshotRate` 20/s),
  and `interpDelayMs` 100 before the page draws it. On a phone's connection
  that is 300–450 ms on top of the wind-up.
- So the swing is immediate (it is the page's own character) and everything
  it hits answers a third to half a second late.

**The goal:** on the hitter's own screen, the hit star, the held beat and the
struck body's first movement start on the tick the swing lands, whatever the
connection. Nobody else's screen changes.

It moves M2's meaning (two people play it on phones and it feels right).

## What to build (`DRAFT:`; the shape is yours, the signal below is not)

1. **Predict your own hit.** The page knows where every body in its room is
   (the snapshots it draws). When the page's own character's strike lands on
   one (same reach test the sim uses: reuse the verb's own code, never a copy
   of its numbers), the page at once:
   - starts the star and the beat on that body (the stamps the renderer reads:
     `c.lastHit`, `c.beat`), and
   - after the beat, moves the drawn body by the launch the sim would give it
     (same function: weight, strength, direction), stepping it locally with the
     same physics until the server's snapshots for that body catch up.
2. **Hand back to the server without a jerk.** The server's word wins: blend
   the predicted body into the server's path over a few frames; if the server
   says no hit happened (the body moved, a friend took it), ease back.
   `INTENT:` the page never becomes the owner of another body; this is a short
   loan for drawing.
3. **The same for a throw and a grab's lift**, if the first push leaves time:
   a thrown crate or friend leaves the hands on the press (round 3 measured
   0.44 s with the body still drawn overhead). The actors lane's a59a302
   already made "a throw while carrying a throw from the press" in the
   drawing: build on it, don't redo it.
4. **Then measure the remaining wait and trim what is safe:** `interpDelayMs`
   for other bodies (try 66), and say what each change costs in smoothness.
   Don't change any hero's `attackWindup`: it is the owner's to tune by feel
   (`?tune`), and it is the telegraph Step 18 needs for enemies.

## Signal

- **A new e2e fact, by touch, on a phone-sized page, with the e2e's injected
  delay on (its `d-delay` facts show how):** from the Hit press to the first
  frame the struck crate is drawn ≥ 4 px from where it was, and to the first
  frame the hit star is drawn. **Target:** star within the hero's wind-up +
  50 ms; movement within wind-up + the beat + 50 ms. Print the measured
  numbers in the fact's text, before and after. **Control watched to fail:**
  with prediction switched off (an env switch), the same fact fails.
- The other page (the watcher) draws the same hit within the old timing, and
  the two pages agree on where the body ends up (within 2 px) a second later.
- `npm run check` unchanged; `t-no-numbers`, `t-hit`, `t-throw*` stay green
  (run e2e twice; `t-throw-friend` is a known 1-in-4 flake: if you see why,
  say so: "no throw happened server-side" is the newest clue).

## Traps

- **Don't simulate other players or NPC behaviour on the page.** Only the
  struck body's flight, for a moment, for drawing. A page that steps NPCs
  would fight the server.
- The switch-gap builder (`session_017WiGzJujVWWDboh12zWhNR`) is in
  `src/client/main.ts` `play()` and `src/server/game.ts` (`adopt`); the actors
  lane (`session_017WiGzFsVDWWZc7nVHbv82A`) is in `src/client/draw/*` with a
  cosmetic predicted star in push 2: message it first, agree who draws the
  star from which stamp, and build so its drawing reads your predicted stamps.
  `git pull --rebase` before each push.
- A hit in a brawl hits friends (Step 11's `c.brawl`); a friend's page owns
  its own body: predict the star on them, not their movement.
- Read new component fields with a default (older kept games). Stop any test
  server by its PID, never `pkill` by name. If live is healthy on an older
  commit after your push, wait, don't revert
  (`docs/verifying-and-finishing.md`).

## Out of scope

Enemy hits on the hero (Step 18); the look of the star (Step 8); wind-up
numbers.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` (twice) green;
pushed; `check:deployed`, `check:live`. The before/after milliseconds in the
commit message. `docs/mechanisms/network.md` gains "Predicted hits".
