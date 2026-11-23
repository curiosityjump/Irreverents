# Step 17: harden saved games (an independent review found 12 problems)

Brief for the Step 17 builder (`session_017WiGzGw7XaQ6tZNddFaa8s`, who wrote
8a54ea4 and 884bb80). Written 2026-11-23 17:25 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`). **Landed so far:** push 1 8a54ea4 (saves),
push 2 884bb80 (start screen).

An adversarial review of 8a54ea4 (four reviewers, each finding reproduced by two
independent skeptics) confirmed the problems below. The full findings, with
repro scripts, are in the orchestrator's scratchpad. The essentials are here.
A review of push 2 is still running; its findings come as a follow-up message.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push. Notes: `docs/plan/step-17.md`,
"Builder notes".

## Push A: URGENT, nothing a save does may crash the live server

1. **A save from an older build crashes the whole server, `main` included,
   again on every reconnect.** Repro: a save whose NPC `c.npc` lacks
   `offenders` (any record written before a build that adds a component field,
   an additive change the rules allow; `npc-setup.ts` sets `c.npc` only when
   absent). Joining it gave `TypeError: n.offenders is not iterable` at
   `src/sim/systems/npc-mood.ts:29`, and the process exited. `tickWorld`
   (`src/server/game.ts` ~380, in the `setInterval`) has no try/catch. Fix:
   contain a throw from one world's tick. Report it to `/debug/errors` (no
   code, per the existing `INTENT:`), set that world aside (its players get a
   clear message and back to the start screen, never a silent loop), and
   **never write it back over its save**. A thrown tick in `main` or a `?room=`
   world must also never take the process down. Prefer this over teaching every
   reader to default fields. A scenario or check that loads such a record and
   proves the server keeps serving `main`.
2. **The SIGTERM save never runs on Railway.** `npm start` runs node under
   `sh -c` (dash does not exec), so SIGTERM never reaches node, and Railway's
   default draining time is 0 s. Fix: make node receive the signal (`exec` in
   the start script, or a `deploy.startCommand` of `node dist/server.cjs` in
   `railway.json`, additive) and set a draining window of a few seconds
   (`deploy.drainingSeconds` or Railway's current equivalent: check Railway's
   docs for the exact key). Prove locally that `kill -TERM` to the process
   Railway would signal writes the save.

## Push B: saves survive the builds that come after them

3. **New placements never reach a kept game.** `populateRoom` runs only for
   rooms the record doesn't list (`saves.ts` ~127). So Step 16 slice 2's quarry
   enemies (being built now) would never appear in any game saved before they
   ship. Fix: after load, run `populateRoom` for every room. It already skips
   an id that is in the world, so a placement added later appears while one
   that was moved or broken stays as it was. Never re-add something the save
   shows was destroyed: if a placed body can leave the world for good, the
   record must say so (a list of removed placement ids) rather than the body
   coming back.
4. **Tile overrides are restored by cell index**, so a later room edit leaves
   invisible solid walls and gates that don't block. Repro: widening the
   courtyard by 2 columns left solid tiles at (17,4), (15,5), (13,6) and (11,7)
   in the open run. Every save carries these, because gates and breakables lay
   overrides for every content room on tick 1. Fix: save part state by part id
   (open, broken), not raw tiles. Rebuild each room's tiles from the current
   room file and its parts' saved states, or else fingerprint each room (w, h,
   and a hash of its cells and part positions) and drop a room's state when it
   differs, saying so once.
5. **Load keeps only `tick`, `entities` and `rooms`.** Any top-level World
   field a later step adds is saved, then lost on every load (`network.md`:
   "no list of names anywhere"). Fix: copy every top-level key, as the client
   does.
6. **`version` is written but never checked.** A newer record would be read as
   v1 and overwritten. Fix: as `store.ts` does for its own files, a record with
   a newer version is never loaded and never written over; that game starts
   fresh under a new code, or the player is told.

## Push C: small contract items

7. `/healthz` lists every game code (`store.status()` collections), and every
   `GET /game/<code>` adds a permanent entry. Fix: `/healthz` shows counts only
   (`saves: n`). `has()` must not open a collection for a code that has no file.
8. The code alphabet and length are marked `DRAFT:` "improving welcome", but
   every saved game and shared link depends on them. Make them `INTENT:` (ids
   are contracts, `CLAUDE.md`) and say why.
9. Nits from the review: the `server` error kind is missing from the docs;
   the `/healthz` `errors` comment is now wrong; `store.ts`'s paste
   instructions for Step 7 no longer fit `makeWorld`; `?room=game-XXXX` now
   joins a kept game (say so in network.md, or refuse it).

## Push D: the start screen (review of 884bb80; five bugs, each reproduced twice)

Do it after push B, before push C. All in `src/client/start.ts` unless said.

10. **The owner's tuning link is broken.** `/?tune` shows the start screen, and
    any choice runs `go()` (`start.ts:198`), whose `history.replaceState`
    drops every other parameter; `play()` then checks
    `tuneWanted(location.search)` (`src/client/main.ts:165`) and finds
    nothing, so there is no Tune button, and a reload doesn't bring it back.
    `docs/mechanisms/tuning-panel.md:21` gives the owner exactly that link.
    Fix: read the flag once at load, and keep `tune` in the address `go()`
    writes (`?game=CODE&tune`). e2e fact: `/?tune` → New game → the Tune
    button is there, and still there after a reload.
11. **Tune sits on top of the menu button** on every `?tune` page, upright and
    sideways (`#tune-open` at (6,7) z 20 over `#menu-btn` at (6,6) z 15; a
    tap on the menu opens Tune). The menu holds the way out. Move one of
    them so both are whole and tappable, and add both to the e2e's "nothing
    covers a control" fact.
12. **At 667×375 sideways, Continue falls below the screen** (two 330 px
    columns plus a 28 px gap need 688 px; that phone has 635). In Safari's
    real sideways height (about 330) the saved-game button is entirely off
    screen. Make the two columns fit from 568 px wide up (narrower columns),
    and add 667×375 to `start-sideways` (its text says 844×390 but it
    measures 750×340: say what it measures).
13. **"Start screen" on a shared-link page drops you into Everyone's kingdom**
    when that tab last played `main`: its handler (`start.ts:237`) doesn't
    clear `sessionStorage` `irreverents.playing`, as the menu's Back does
    (`start.ts:366`). Clear it. e2e fact for exactly that sequence.
14. **Pasting a code fails**: `maxlength=4` cuts the pasted text before
    `cleanGameCode` runs, so "ab cd" → "ABC", the Share message → "JN", a
    pasted link → "HTTP" ("No game HTTP"). Drop `maxlength`, clean in the
    input handler, and when the pasted text holds `?game=XXXX` take that code.
15. Nits: Continue lists a game whose save is gone, and tapping it silently
    starts an empty world under that code (ask the server first; say "That
    game is gone" and drop it from the list); when neither share nor copy
    works the menu prints the whole link wider than the screen (print the
    code large and the link small, wrapped).

## Done

Each push: `npm run build`, `npm run check` (about 35 s now) and `npm run e2e`
green; pushed; `check:deployed` and `check:live` pass. For each fix, a check
in `scripts/checks/step17-*.ts` that fails without the fix (watched to fail;
say so in the commit). `docs/mechanisms/saves.md` updated.
