# Brief: Step 1, Gate 1 — the skeleton, the simulation core and the architecture contract

Written by the Step 1 lead (`session_017WiGzEwLs3ng2ZPpRZgctn`), 2026-11-23
04:10 UTC. Governing step: `docs/plan/step-1.md` (read it; its "What's
decided" is binding and is not repeated here). **Time matters: this slice
should be pushed and live by about 05:00 UTC.** Three other plan steps start
the moment it lands, and a second brief (Gate 2: the browser client, touch
and two-player netcode) builds on it. Prefer the smallest thing that is a
sound contract over a complete thing that is late.

## 1 · The task, and the measure row

Replace the deploy probe (`server.js`, `package.json`) with the real
project skeleton, so that every command name the docs cite exists, one
room with one controllable character runs headlessly in a shared
simulation core, and `docs/architecture.md` tells later sessions where
everything goes.

Measure rows (`docs/plan.md`): **M1** stays "live = tip of `main`", now
through a real build. **M3** stays 0 of 6, but `npm run gates` becomes the
command that reports it. M2 does not move (Gate 2).

Deliver, all on `main`:

1. **Commands**, by these exact names: `npm run build`, `npm run check`,
   `npm run gates`, `npm start`, `npm run dev`. Also define `npm run e2e`
   and `npm run check:live` as stubs that **exit non-zero with one line
   saying "lands with Step 1 Gate 2"** (a stub that exits 0 would read as a
   passing check).
2. **The simulation core** (suggested `src/sim/`): plain TypeScript, fixed
   timestep, deterministic, no DOM and no Node APIs, world state as plain
   JSON-serialisable data, one `step(world, inputsByPlayerId) → events`
   (or returning a new world plus events; your call, say which in the
   architecture doc). One graybox room on a 16 px tile grid with solid
   tiles and at least one one-way platform; one character kind that runs,
   jumps (variable height, coyote time and jump buffering are welcome but
   `DRAFT:`) and collides. **It must already take N players**, each with
   an id and their own input, in one world: Gate 2 puts two in it.
3. **Content as data** (suggested `content/`): the room, the character
   kind and **all tuning numbers (speeds, jump, gravity) in one data
   file**, loaded and validated at start by a validator that names the
   exact broken reference or field. Ids are contracts once deployed.
4. **Scenarios as data** (suggested `scenarios/*.json`): a room id, the
   players, a list of timed inputs, and the facts expected (for example
   "at tick 120 player a is standing on the ledge at tile 12,7"; "event
   `landed` happened for a between ticks 40 and 60"). `npm run check` =
   type-check + content validation + every scenario. Each scenario may
   carry a `gate` letter (A–F); `npm run gates` prints one line per gate:
   `passing` (it has scenarios and all pass), `failing`, or `no scenario
   yet`. Ship at least three scenarios: run-and-stop on the ground, a jump
   onto a platform, and two players in one room moving independently.
   None of them is tagged with a gate yet (gate F needs the network).
5. **The server** (suggested `src/server/`): one process; serves the built
   client from the build output, `GET /healthz` returning at least
   `{ ok, commit, startedAt }` with `commit` from
   `process.env.RAILWAY_GIT_COMMIT_SHA` (keep these three field names:
   `docs/measures.md` M1 reads them); a WebSocket endpoint at `/ws` that
   may stay a minimal echo/hello for now (Gate 2 owns the protocol).
   Listens on `process.env.PORT` (default 3000) on `0.0.0.0`.
6. **The page.** Until Gate 2, the live address must still be a clean
   page, not a broken one: either the current "the build crew is working"
   notice, or (better, if it costs you under fifteen minutes) a canvas
   that runs the simulation core in the browser and draws the room and the
   character as graybox rectangles with keyboard control. No touch
   controls, no networking: Gate 2.
7. **`docs/architecture.md`** (open it with `**Reference.**`): the layout;
   which layer may import which (sim imports nothing but sim and content
   types); where state lives; an **"I need to add…" table** with a row
   each for a room, a character kind, an NPC, an object, a verb (an action
   a character can take), a rule, a scenario, a tuning number, an asset;
   **which paths each plan step owns** (below); and **the rules for
   changing a shared contract** (the world-state shape, the input shape,
   the event list, the content schemas, the scenario format): additive
   only, never rename or remove an id or field once pushed, and say in the
   commit when one grew.
8. **Docs that must become true**, short: `CLAUDE.md` "Architecture at a
   glance" and "Working locally" (replace both placeholders, five or six
   bullets each at most, pointing at `docs/architecture.md`);
   `docs/verifying-and-finishing.md` "This project's setup" (what is real
   now, each command you ran end to end, with the time); one line per
   pattern worth copying under "What is already right" in `docs/plan.md`;
   your measurements appended under "Measure" in `docs/plan/step-1.md`.

9. **Documents-only pushes must not restart the game** (added 04:10 UTC
   from `docs/plan/step-1.md`, "What's decided"; do this right after your
   current push, before the simulation work, because three more leads
   start pushing when Gate 1 lands). Measured by the orchestrator: every
   push to `main`, documents included, redeploys and restarts the server
   (`startedAt` in `/healthz` moves each time), and documents are pushed
   every few minutes all night. Add Railway's own config file
   (`railway.json`, config-as-code; **look up its current schema in
   Railway's documentation rather than writing it from memory**) with
   watch patterns so that changes under `docs/**`, `handoff-prompts/**`,
   `tools/**` and top-level `*.md` do not trigger a deploy, and a health
   check on `/healthz` so a build that fails to start never replaces the
   running one. **Prove both, and say so in the commit:** a push touching
   only a file under `docs/` leaves `startedAt` unchanged (wait two
   minutes); a push touching code changes it and reports the new commit.
   **Trap: a wrong pattern can stop every deploy silently.** If the code
   push after adding the file is not live within five minutes, remove the
   file, push, confirm deploys work again, and message the lead.
10. **Keep M1 honest.** `/healthz` reports the commit that is *running*,
   which after a documents-only push is older than the tip of `main`. Add
   a small script (suggested `npm run check:deployed`) that fetches
   `/healthz` from the live address and exits 0 when the running commit is
   the tip of `origin/main` **or** every commit since it touched only the
   watched-out paths, printing which; non-zero otherwise. Write its
   command into `docs/measures.md` under M1 (replace the two-line command
   there; keep the label).

**The abstract action list is part of the contract** (added 04:12 UTC;
Steps 2 and 5 are written against it). A player's input for a tick is
expressed in named, device-independent actions (for example a horizontal
move axis, `jump`, and reserved names later steps fill in such as
`attack`, `grab`, `special`, `interact`), declared in one list (data or
one small file) that keyboard, touch and scenarios all speak. Step 2
adds actions to that list; Step 5 checks by script that every entry has
a touch control. So: one place that enumerates the actions, readable by
a script, and inputs in scenarios written in those names.

**Path ownership to write into the architecture doc.** Each queued step's
file now has an "Owns" section (`docs/plan/step-2.md` … `step-5.md`;
read those four sections, they are a few lines each) and assigns "exact
paths as `docs/architecture.md` assigns them". The queued steps,
from `docs/current-directive.md`: Step 2 movement feel, attack, grab and
throw, three character kinds; Step 3 a small kingdom of connected rooms
with hidden routes; Step 4 NPC response logic (three moods, witnesses,
calls for help); Step 5 phone comfort, joining and rejoining; Step 6 the
talking king; Step 7 Hall of Legends and a hijackable machine. Lay the
tree out so each of those can add files in its own directory or its own
data files and rarely needs to edit a file another step is editing at the
same hour (for example: one file per verb, per system, per room, per NPC
kind, with a small registry). Where two steps must touch one file (the
world-state type, the system order), say so and make the edit additive.

## 2 · What is already measured (do not re-derive)

All run by the lead on 2026-11-23, 04:02–04:08 UTC.

- **Railway runs `npm run build` before `npm start`**, with
  devDependencies installed, and they are still present at runtime. Probe
  commit f4c5ea3: `/healthz` returned `built.devDepAtBuild: true`,
  `devDepAtRuntime: true`. So a normal `devDependencies` + `npm run build`
  layout deploys. (The step file's "npm start must not need
  development-only packages" stays the rule anyway: bundle, don't rely on
  this.)
- **Railway's Node is v22.23.4**; this container's is v22.23.5, npm
  10.9.9. `package.json` has `"engines": { "node": ">=22" }`; keep it.
- **A push with dependencies and a build step was live in 25 seconds**
  (pushed 04:02:23, `/healthz` reported the commit at 04:02:48). A
  `package-lock.json` is committed and Railway accepted it.
- **WebSockets pass through Railway and through this sandbox's outbound
  proxy.** A headless Chromium page (Playwright's `iPhone 14 landscape`
  device: viewport 750×340, touch on) loaded the live page in 437 ms,
  opened `wss://…/ws` in 450 ms, and ten echo round trips took 106–136 ms
  each. Chromium needed no proxy configuration.
- **Node 22.23.5 runs `.ts` files directly** (type stripping is on by
  default: `node file.ts` printed its output with no flag). So the
  scenario runner and scripts can be plain `node scripts/x.ts` with no
  loader, as long as the code uses only erasable TypeScript syntax (no
  `enum`, no parameter properties, no namespaces) and imports carry
  explicit `.ts` extensions.
- **Registry versions today:** `typescript` 7.0.2 (`npx tsc --version`
  prints 7.0.2 here), `esbuild` 0.28.2, `ws` 8.23.0. The npm registry is
  reachable. Pin exact versions.
- **Playwright 1.63.0 is preinstalled globally** at
  `/opt/node-tools/node_modules/playwright` with Chromium; `require`
  resolves it when `NODE_PATH=/opt/node-tools/node_modules`. Gate 2 uses
  it; you do not need a browser for this slice. **Never run `playwright
  install`** and do not add `playwright` to `package.json`.
- **The numbers the art on order assumes:** 320×180 internal resolution,
  16 px tiles, characters in 32×32 cells about 24–28 px tall
  (`docs/mechanisms/asset-requests.md`, "Requests in flight"). Use them
  for the room and the character's collision box; mark them `DRAFT:`.

## 3 · Traps

- **A push to `main` is the deploy, about 25 seconds later, and nobody
  can read Railway's logs.** If the build or the start fails there, the
  only symptom is `/healthz` still reporting the old commit. So before
  every push: `rm -rf node_modules dist && npm ci && npm run build && npm
  run check`, then start the built server on a spare port and `curl` its
  `/healthz` and `/`. After every push, poll `/healthz` until it reports
  your commit; if it has not within ten minutes, stop pushing and message
  the lead.
- **Push the bare skeleton early** (build + start + `/healthz` + the
  notice page), confirm it is live, then build on it. Do not make the
  first real-build deploy also the first push of everything.
- **`package-lock.json` must match `package.json`**, or `npm ci` fails on
  Railway. Always commit both together.
- **The deploy must not depend on files git ignores.** `dist/` is ignored
  and built on Railway; content and scenario data must be either bundled
  or read from committed paths that exist relative to the running server.
  Test from a fresh clone in another directory, not your working tree.
- **A scenario that cannot fail proves nothing.** For each scenario, watch
  it fail once: break the thing it checks (zero the jump speed, remove the
  platform tile), see `npm run check` exit non-zero naming the broken
  fact, restore. Say in the commit which control you ran for each.
- **Determinism:** no `Math.random`, no `Date.now`, no iteration over
  objects whose key order depends on arrival, inside the sim. The same
  inputs must give byte-identical world state (make one scenario assert
  that by running twice and comparing).
- **Other sessions push to `main` while you work** (docs, mostly). Before
  each push: `git fetch origin main && git rebase origin/main`; re-run the
  gate if anything other than `docs/` came in.
- **`.gitignore` already ignores `.drive_sync_tmp/`** (the design-library
  sync uses it). Keep that line.
- **`tools/drive_sync.py` and `docs/design-library/` are another
  mechanism's** (`docs/mechanisms/design-library-sync.md`). Do not move,
  lint, type-check or bundle them.

## 4 · Out of scope (you will notice these; leave them)

- Touch controls, the "turn your phone" screen, reconnecting, sound, the
  network protocol, remote-player smoothing, `e2e` and `check:live`
  beyond the failing stubs: all Gate 2.
- Attacks, grabbing, throwing, more character kinds (Step 2); more rooms
  and doors (Step 3); NPCs (Step 4). Build the places they will go, not
  the things.
- Sprites and tile art. Graybox rectangles only; but the architecture doc
  says where a sprite sheet and a tile atlas will plug in as data.
- `docs/vision.md`, `docs/questions-for-the-owner.md`,
  `docs/current-directive.md`, the role documents: not yours to edit.
- Accounts, anti-cheat, persistence, analytics.

## 5 · Decided vs. open

**Decided:** everything under "What's decided" in `docs/plan/step-1.md`,
plus, by the lead (mechanics, `DRAFT:`): simulation at 60 ticks per
second; world units are pixels at the 320×180 scale; TypeScript checked
by `tsc --noEmit`, bundled by esbuild (client to `dist/public/`, server
to one file in `dist/`); `ws` is the only runtime dependency unless you
find a need; no framework, no game engine library.

**Open, yours to decide and record in the architecture doc:** exact file
layout; whether `step` mutates or returns; the scenario fact vocabulary;
the room data format (keep it hand-editable: rows of characters with a
legend is fine).

**Nothing here is open with the owner.** The owner is asleep until about
11:00 UTC. If you hit something that is truly theirs (how a thing should
feel, what the world is like), take your best reading, build it so either
answer is a small change, mark it `DRAFT:`, and file it per section 8.

## 6 · How it gets verified

Rungs 1–3 of `docs/verifying-and-finishing.md`, concretely:

1. From a fresh clone in a temporary directory: `npm ci && npm run build
   && npm run check`, exit 0 by `echo $?`.
2. One failing control per scenario, watched (trap above).
3. `npm run gates` prints six lines, A–F, each `no scenario yet`; `npm
   run e2e` and `npm run check:live` exit non-zero with their one line.
4. Start the built server on a spare port (track its pid; stop it by pid,
   never by pattern); `curl` `/healthz` and `/`; open `/ws` once.
5. After the push: `curl -s
   https://irreverents-production.up.railway.app/healthz` reports your
   commit, and `/` returns 200.
6. If you shipped the canvas page: one headless-Chromium screenshot of
   it, looked at, before the push (rung 5).

The lead re-runs 1, 3, 4 and 5 and its own control at review.

## 7 · Definition of done

- Deliverables 1–8 on `main`, live, `/healthz` reporting the commit.
- SOP phase 6 rows this triggers: "where a kind of code belongs"
  (`docs/architecture.md`), "a measured number" (`docs/plan/step-1.md`
  Measure; `docs/verifying-and-finishing.md` setup), "something
  provisional shipped" (`DRAFT:` at each site), "a new mechanism" (one
  line each in `docs/mechanisms/README.md` for the scenario harness and
  the content validator, with a short writeup file), "a principle"
  (`CLAUDE.md`'s two placeholder sections only).
- The commit message is the honest report: what you ran, what you watched
  fail, what you did not verify.
- **Do not delete this brief or touch `docs/plan.md`'s status line**; the
  lead does both at review.

## 8 · Where your questions and your report go

- **When you are done, or blocked for more than ten minutes:** send one
  message to the lead with the session tool `send_message`, to
  `session_017WiGzEwLs3ng2ZPpRZgctn`: "Gate 1 worker: done at <commit>"
  or "blocked: <one line>". That message is how the lead learns you have
  finished; without it three other steps wait.
- **A blocking question:** the same message, and an entry in
  `docs/questions-inbox.md` if it is the owner's.
- **A non-blocking question for the owner:** `docs/questions-inbox.md`
  (its header has the format). **A flag or a "worth noting":**
  `docs/for-the-lead.md`. Neither goes in your final message, which is
  one line.
