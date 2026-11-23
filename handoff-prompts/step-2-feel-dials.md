# Brief: Step 2 feel, the dials (`?tune` panel)

Lead: `session_017WiGzGN9egot3JUvSMBBA9` (Step 2). Written 2026-11-23 11:43 UTC on `main` at d2459f0.
A sibling brief, `handoff-prompts/step-2-feel-sim.md`, runs at the same time and adds new feel numbers (gravity shaping, attack phases, beat scaling, floor bounce). **Build the panel from the declarations, never from a hand list**, so its numbers appear on their own as they land.

## 1 · The task, and what it moves

The owner wants the game to feel "as good as kirby and the amazing mirror" by 2026-11-24, and whether it feels good is theirs to judge by playing (`docs/plan/step-2.md`, "Feel, from 2026-11-23" — read it first). So: **put every feel number in the owner's hands, on the phone, while playing.** Open the game with `?tune` in the address and a panel lets them change any declared number — per character, and the world's — see play follow at once, and copy the changed numbers out so a session can make them the default.

Measure row: none moves. It is how the owner's taste becomes numbers without a session in between. Say so at SOP phase 5.

## 2 · The derivation (measured at d2459f0)

- **Every number is declared with its range.** Verbs (`src/sim/verbs/*.ts`) and systems (`src/sim/systems/*.ts`) each carry `tuning: { name: { min, max, what } }`; `src/sim/registry.ts` exports `verbs` and `systems`. Which character reads which number: `content/tuning.json` `characters.<kind>` sets are checked against the character's verbs (`src/sim/check-content.ts`). So the panel can list, per character, exactly the numbers its verbs declare, with slider bounds and the `what:` line as its label. World numbers: those the systems declare.
- **The browser has the whole content bundled** (`src/client/main.ts:15`, `const content = __CONTENT__`), and runs `step()` for its own player.
- **But the page simulates only its own player's motion; the server runs hits, throws and impacts** (`docs/mechanisms/network.md`, "Who owns which part"). Measured consequence: a panel that only edits the page's `content.tuning` changes running and jumping, and silently does nothing to attack, throw, beat, bounce, knockback. So **a change must reach the server too**: add a client→server message (`src/net/protocol.ts` is a union of `{ t: ... }` messages; add one, additively) that the server validates against the declared ranges and applies to **that world's** tuning, then tells every page in the world (they apply it to their own copy). The server's `content` is passed in `opts` (`src/server/game.ts:60`) and shared — give each world its own tuning copy before mutating, or one world's dial changes another's.
- **Worlds by address**: `?room=<name>` picks a world (`src/client/main.ts:62`); the default world is where the owner and friends play. A change in a world affects everyone in it — fine for friends tuning together (`DRAFT:`, log it); it lasts until the server restarts (every code push restarts it). Nothing is persisted; don't add persistence.
- **Phone first** (D-093): the panel must work by touch, upright and sideways, at iPhone size, without covering the controls permanently: it opens and closes (an exit, marked `INTENT:`), scrolls, groups by character with the player's current character first, and each number has a slider plus − / + steps. A "reset" puts the shipped numbers back. "Copy" puts the changed numbers only, as JSON shaped like `content/tuning.json`, on the clipboard (with a visible text box fallback: iOS Safari clipboard needs a user gesture).

## 3 · Traps

1. **Not in `src/client/draw/`** — Step 8's lanes own it, and the touch layout (`src/client/touch.ts`, `src/client/shell.ts`) is Step 8's shell lane's today. Put the panel in its own file (e.g. `src/client/tune.ts`), DOM over the canvas, and hook it in `src/client/main.ts` with as few lines as possible. Touches on the panel must not reach the game controls.
2. **Without `?tune` nothing changes**: no panel, no extra bytes in snapshots, no new message sent. Prove it (e2e or a check).
3. **Validate on the server**: an unknown name, a non-number or an out-of-range value is refused, never applied. A friend's page is not trusted to send sane numbers (it is friends, but a bug is not).
4. **Simulation stays deterministic and pure**: no DOM in `src/sim/`, no new dependency of `src/sim` on `src/client` (`npm run check` enforces the layers).
5. **Step 8's lanes and the sibling brief push to `main` all day.** `git pull --rebase` before every push; re-run `npm run check` and `npm run e2e` after the pull. `src/client/main.ts` and `src/net/protocol.ts` are edited by others: small additive edits.
6. **A new player joining after a change** must get the world's current numbers, not the shipped ones.

## 4 · Out of scope

New feel numbers (the sibling brief's). The look of the rest of the page. Saving tunings anywhere. Accounts, permissions, who may tune (friends; anyone with `?tune`).

## 5 · Decided vs. open

Decided: the panel exists behind `?tune` (the step file); every number is data; it is the answer to any "how should it feel" question. Decided by the lead, `DRAFT:` (log each in `docs/decisions-log.md`): a change applies to the whole world you are in, lasts until the server restarts, and is copied out as tuning-file JSON.
Open: nothing only the owner can answer.

## 6 · Verification

Rung: `npm run check`, then `npm run e2e` with a new fact on a phone-sized page by touch: open with `?tune`, change one movement number (e.g. the current character's top speed) and one server-run number (e.g. the world's `wallBounce` or the grappler's `attackStrength`), and show play follows **on both pages** (a second page in the same world moves faster / a hit flies farther). Control: break the server apply (or the broadcast) and watch the fact fail. Also: a page without `?tune` shows no panel. Screenshot the panel at iPhone size upright and sideways for the lead (scratch, not committed), deviceScaleFactor 1.
Before every code push: read `https://irreverents-production.up.railway.app/debug/errors` and `/healthz`. Feel lanes push as they are ready even with players in the world, each fully checked (the orchestrator's rule for Step 8, applied to feel). After: `npm run check:deployed`, `npm run check:live`, and open the live address with `?tune&room=<a private name>` and change a number.

## 7 · Done

Panel live behind `?tune`, both effects proven on two pages, the e2e fact and its control in the commit message. A new mechanism doc `docs/mechanisms/tuning-panel.md` with its one-line index entry in `docs/mechanisms/README.md`. One line in `docs/plan/step-2.md` "Taste, for the owner in the morning" saying how to open it and how to send the numbers back. Delete this brief in your last commit.

## 8 · Questions

Blocking: message the lead, `session_017WiGzGN9egot3JUvSMBBA9` (send_message), and also write it in `docs/questions-inbox.md`. Everything else goes to `docs/for-the-lead.md`, not your final message. When done or blocked, message the lead with the commit; your final message is one line.
