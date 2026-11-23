# Step 17: the start screen, and saved games a friend can join

Brief for one cold builder. Written 2026-11-23 16:00 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`). The step is `docs/plan/step-17.md`:
read its "Goal", "What's decided" and "`DRAFT:` choices"; you need neither
`docs/vision.md` nor the design library. Read `docs/mechanisms/network.md`
(worlds, messages) and `docs/architecture.md` "Lasting records: the store"
before writing code.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes
file: `docs/plan/step-17.md`, a "Builder notes" section at its end (flags,
doubts, skipped checks: there, never only in a message).

**Two pushes, each standing alone and fully checked. Nothing half-working on
`main`** (a push to `main` is the deploy).

## The task, and what it moves

The owner: *"The game needs a start screen where players can start a new
game, continue, join the same game, etc. If I hav ea saved game, i should be
able to load it and have a friend join me in my saved game."* It moves no
M-row directly (M1 and M2 must stay passing: `?room=` is untouched); it is a
thing the owner asked for by name, and the first thing every player sees.

### Push 1 — games that are kept (server; no screen yet)

1. **Open the store once** in `src/server/main.ts`, exactly as the comment at
   the top of `src/server/store.ts` says (its `openStore(storage.mounted ?
   storage.path : null)` line and its `INTENT:`; leave out the Hall lines:
   Step 7 adds them later to the same `store`). Add `store: store.status()`
   to `/healthz` beside `storage` (additive). Pass the store into
   `attachGame` through `GameOptions` (additive field).
2. **`src/server/saves.ts`** (new): a game is a world named `game-<CODE>`,
   CODE four letters from `ABCDEFGHJKMNPQRSTUVWXYZ` (no I, L, O; `DRAFT:`).
   One store collection per game, `save-<code>` in lower case (collection
   names are lower-case letters, digits, dashes), holding one record:
   `{ code, savedAt, commit, world }` where `world` is the `World` with every
   player's entity removed. Write it with `replaceAll([record])`.
   - Save every 30 s (`DRAFT:`, a number in `content/net.json` if it fits
     there, else a named const) while the game has players, and when its last
     player leaves.
   - Load: `makeWorld(name)` in `src/server/game.ts` is "THE one place a world
     is created": for a `game-` name with a save, build the world from it
     instead of `populateRoom` for every room. Bodies whose room or kind is no
     longer in `content` are dropped, and the drop is said once in
     `/debug/errors` (`src/server/errors.ts`), never a refusal to load.
   - A `game-` world is **not** forgotten in memory differently from today's
     private worlds: dropping it when the last player leaves is fine, because
     it was just saved. `main` and `?room=` worlds behave exactly as today.
   - A way to ask "does game CODE exist?" for the join screen: either a field
     in the `join`/`welcome` exchange or a small `GET /game/<CODE>` answering
     `{exists}`. Your choice; additive only (`docs/architecture.md`, "Changing
     a shared contract").
3. **`scripts/checks/step17-saves.ts`**, wired into `npm run check` the way
   `scripts/checks/step11-*.ts` are: with a temporary store directory, a game
   world has one room state changed (a part, a tile, or a moved crate), all
   players leave, a new server is built on the same directory, the game is
   joined again: the change is there. **Control watched to fail:** a second,
   fresh code does not have it; and with saving switched off the first
   check fails (run it once that way and say so in the commit message).

### Push 2 — the start screen (page)

4. **`src/client/start.ts`** (new), shown before connecting when the address
   has neither `?room=` nor `?game=`:
   - **New game**: makes a code (the page may make it; the server treats an
     unknown code as new on join), remembers it on this phone, joins it.
   - **Continue**: the games this phone played, newest first (phone storage,
     wrapped in try/catch: a private tab may have none). Hidden when none.
   - **Join a friend**: a text field for the code (the phone's own keyboard,
     upper-cased as typed) and a Join button; an unknown code says so and
     stays on the screen.
   - **Everyone's kingdom**: today's `main` world.
   A `?game=CODE` link shows one big "Join CODE" tap (it also unlocks sound,
   as the first tap does today), with a way back to the start screen.
   `?room=` skips the start screen entirely, as today (`INTENT:` at the code:
   every scripted check depends on it).
5. **In play, a small touch button** (top corner, clear of the controls and
   the camera: `docs/plan/step-5.md` "Controls never hide the game") opening a
   panel with the game's code, **Share** (`navigator.share` with the
   `?game=` link where the phone has it, else copy it), and **Back to the
   start screen** (`INTENT:` the way out). Not shown in `?room=` worlds other
   than its back button.
6. **e2e**, in `scripts/e2e/` the way `phone.ts` is: a phone-sized page, by
   touch only, taps New game and is in play; a second page opens the shared
   `?game=` link, taps Join, and both see each other. Then the first page taps
   Back to the start screen and gets the start screen.
7. Pixel text in the game's own font (Step 8's props lane added it, 992647b);
   big tap targets. Look at it at iPhone size in a screenshot before pushing.

## Measured for you (main at 3733ad6, 15:55 UTC)

- `npm run build` and `npm run check` green here: 158 `ok` lines, 0 failures.
- Live `/healthz` at 15:55: `storage.mounted: true, writable: true, path
  "/data"`; `players 0`, `errors 3` (read `/debug/errors` before your first
  code push, as `docs/current-directive.md` "Rules in force now" says).
- `src/server/store.ts`: `openStore(dir)`, collections capped at 500 records
  (`COLLECTION_CAP`), one file per collection under `<dir>/irreverents/`.
  Nothing imports it yet. `node scripts/check-store.ts` proves it (13 checks,
  not in `npm run check`).
- `World` (`src/sim/types.ts`) is `{ tick, entities, rooms? }`, plain JSON.
- The world name is picked at `src/client/main.ts:65`
  (`?room=` or `DEFAULT_WORLD`, `'main'` in `src/net/protocol.ts:27`).
- There is no in-game menu today: `src/client/shell.ts` has none.

## Traps

- **Don't touch how `?room=` works.** `npm run e2e`, `check:live` and every
  scenario join `?room=check-…` and must never see a start screen.
- **The store's file shape is a contract** once written to the volume
  (`INTENT:` in `store.ts`). Your record shape is too: add fields later, never
  rename. Put `version: 1` in the record.
- **A deploy is a restart.** A save written by the old build is loaded by the
  new one: the "drops what doesn't fit" rule is the thing that keeps the
  owner's game alive across your own pushes. Test it with a record naming a
  room that doesn't exist.
- **Player entities must not be saved** (they are re-added on join; an
  orphaned player body in a loaded world would stand there forever).
- iPhone Safari: a text field under 16 px font zooms the page on focus; the
  keyboard covers the bottom half. Keep the code field high.
- `CLAUDE.md` says "Nothing is persisted": it becomes false with push 1.
  Don't edit `CLAUDE.md`; say so in your report and the orchestrator fixes it.

## Out of scope

- The Hall of Legends records (Step 7) — leave their lines out, don't build them.
- Saving `main`; saving a player's position or carried things; accounts or
  names; deleting old saves.
- Step 5's touch controls and presence; Step 8's look of anything else.

## Done

Both pushes on `main`, `npm run build`, `npm run check` and `npm run e2e`
green before each; after each, `npm run check:deployed` says live is current
and `npm run check:live` passes; one screenshot of the start screen at iPhone
size committed under `docs/plan/step-17-shots/`. A `docs/mechanisms/saves.md`
writeup with its line in `docs/mechanisms/README.md`. A
`docs/decisions-log.md` entry for whatever you chose that the brief left open.
