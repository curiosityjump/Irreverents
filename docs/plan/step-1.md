# Step 1 — A live room two people can play in together

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23, to Vision Partner, first-hand** (`docs/vision.md`, "The measure"):
> I want this game to be playable by the time I wake up in the morning. …
>
> It's setup to deploy automatically from main yes. … Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning.

**Owner (Drive, doc 11, D-093; doc 33 is the full platform spec):**
> D-093 IRREVERENTS IS PRIMARILY AN IPHONE BROWSER / WEBAPP GAME. Desktop COMPUTER BROWSER play is a secondary possible target. … Mobile touch ergonomics, legible pixels and actual phone performance are top-level requirements.

Two people, each in a browser (most likely iPhones), in the game
together, by the owner's morning. The repository holds no game yet (only a
deploy probe, `server.js`), so nothing else in the plan can be built or
checked until this step lands. **Every other step is queued behind it; it
is the critical path of the night.**

## Goal

At https://irreverents-production.up.railway.app two people on separate
devices open the page and, with no setup, are in the same graybox room,
each running and jumping with their own controls (**touch on an iPhone
first**; keyboard on a computer too) and each seeing the other move
smoothly. And the
repository has the commands and the written layout every later session
builds and verifies with.

## Two gates, in this order

**Gate 1 — the contract (target: within the first hour).** Pushed to
`main` and live:
- the project skeleton (the commands below exist and pass);
- the simulation core's shape, with one room and one controllable
  character running in it headlessly;
- `docs/architecture.md`: the layout, the "I need to add…" table (a room, a
  character, an NPC, an object, a verb, a rule), which paths each plan
  step owns, and the rules for changing a shared contract;
- a real build on Railway proven: `/healthz` on the live URL reports the
  commit you pushed.

The moment Gate 1 is on `main`, **tell the orchestrator** (the session
named in `docs/questions-for-the-owner.md`'s header): Steps 2, 3 and 4 open
on that signal, while you carry on to Gate 2.

**Gate 2 — together, live.** The goal above, proven by script against the
live URL.

## What's decided

Mechanics calls made by the orchestrator (2026-11-23) so nobody dithers.
They are `DRAFT:` in the sense that the owner has never seen them; the lead
may overrule one with a measurement, recording why here.

- **One Node + TypeScript package at the repository root, one process.**
  It serves the built client and one WebSocket endpoint. Railway builds and
  runs it from `main`.
- **One simulation core, shared by everything.** Plain TypeScript, a fixed
  timestep, deterministic, no DOM and no Node APIs, world state as plain
  serialisable data, one `step` that takes the players' inputs and returns
  what happened (events). The same code runs on the server, in the
  browser, and in Node tests. This is what makes the game checkable by
  script, which is the whole team's feedback signal, and what lets two
  players share a world.
- **Content is data, the engine is code** (`CLAUDE.md`, design
  principles): rooms, characters, NPCs, objects and tuning numbers are data
  files loaded and validated at start; adding one needs no engine change.
  Ids in content are contracts once deployed.
- **Netcode default: each player's own character is simulated on their own
  device; the server simulates everything else** and relays. Reason: the
  owner's standard is "superb movement", and a platformer that waits on a
  round trip for every jump is not that; the players are friends, so the
  server need not distrust a client. Whatever is chosen must keep one rule:
  **the network layer replicates the simulation's state generically**, so a
  later step that adds a kind of NPC or object writes no network code.
- **Built for several leads at once.** Steps 2, 3 and 4 will build in
  parallel on top of Gate 1, and every push deploys. So a new verb, a new
  kind of NPC behaviour, a new room or object must be added by **adding
  files that register themselves** (code) or by adding data, not by
  editing one shared list or switch that three sessions would all touch.
  Room geometry and who or what is placed in a room are separate data
  files (Step 3 owns the first, Step 4 the people). The player's actions
  are one abstract list (move, jump, attack, grab, …) that the touch
  layout and the keyboard both read, so adding an action is one entry.
- **The netcode must let the world move a player** (added 2026-11-23
  04:25 UTC, from the plan review). Each player's own character runs on
  their own device, but an enemy's hit, a friend's hold or throw, or a
  door all move a player from outside it. So the protocol carries, from
  the server to the one player concerned, a small set of *effects*
  (pushed with this velocity, held by this body, released, moved to this
  room and place) that the player's own device applies and acknowledges,
  resent until acknowledged. In the simulation these are ordinary events
  on the player's entity, so Step 2 (throws, knockback) and Step 3
  (doors) write **no network code**: they emit the effect and the layer
  delivers it. While a character is held or flying from a hit, the
  server's word wins; its own device takes over again when it is free.
- **Solo works with the same build.** One person opening the URL can play;
  nothing waits for a second player (owner's rule, D-015).
- **Joining needs nothing, and seats you in the one shared party.**
  Everyone who opens the URL is in the same shared world by default; a
  `?room=<name>` in the address makes a private one. No accounts (it is
  for friends). A joiner takes a member of that world's party nobody is
  playing (D-013; doc 05: "A character cannot be controlled by two humans
  at once"); leaving or timing out frees the member and changes nothing
  else (doc 06: "When a player joins or leaves, the same underlying party
  architecture continues"). Step 2 owns the party list and the switch;
  Step 1 owns the seat on join, leave and rejoin, through one call the
  simulation offers. When every member is taken (the party's size is
  `DRAFT:`, O-003 is open) the next visitor is told so and offered a
  private world: never a duplicate, never a blank page.
- **A reload is still you.** The page keeps a random player id on the
  device (not only in the tab) and sends it on joining, so after a
  pull-to-refresh, Safari dropping the tab, or the page's own reload
  after a deploy, the same player comes back: the name, the party member
  if it is still free, and later the credit on Hall records. A different
  device is a different player until there are accounts. `DRAFT:`.
- **`/healthz` says how many players are in the default world**, so a
  session can look before it pushes code while someone is playing
  (`docs/current-directive.md`, "Stopping condition").
- **The built server is started once before every code push.** With the
  owner's storage volume attached, Railway stops the old server before
  the new one starts, so the health check no longer protects a running
  game: a build that fails to *start* would leave nothing serving until a
  revert is live. So `npm run check` (or a step it runs) boots the built
  server on a free port, sees `/healthz` answer and one client join, and
  fails otherwise.
- **Rendering is a plain canvas at 320×180 internal resolution on a 16 px
  tile grid, scaled up crisp; characters fit 32×32 cells (about 24–28 px
  tall).** These are the numbers the art already on order assumes
  (`docs/mechanisms/asset-requests.md`, "Requests in flight"; library
  doc 14, option B). `DRAFT:` the library calls these "Candidate
  technical pixel benchmarks (NOT LOCKED)"; they are tonight's working
  numbers because the first gate and the ordered art already use them.
  Keep each in one place in code, and tell Vision Partner before changing
  one. Start with graybox shapes and **build so sprite
  sheets and tile atlases drop in as data when they arrive** (below).
- **Touch first, landscape.** Design the controls for two thumbs on an
  iPhone held sideways: a few context-sensitive controls, "not a dozen
  tiny virtual buttons" (doc 33). Orientation and the exact layout are
  open in the library (landscape is "a promising test"), so they are
  `DRAFT:`. **An upright phone can still play** (`INTENT:` there is
  always a way out): an iPhone with rotation lock on stays upright
  however it is held, and a page cannot override that, so a screen that
  only says "turn your phone" is a place a player can be stuck in for
  good, and could be the owner's whole first minute. Held upright, the
  page shows the same 320×180 view across the top with the controls
  below it, and one dismissible line: "Better sideways. If turning does
  nothing, switch off rotation lock."
- **A phone that sleeps or changes network comes back.** A suspended tab,
  a lock screen or a Wi-Fi to cellular switch must end in the player back
  in the world on their own, not a dead page (doc 33, "browser state
  resilience").
- **The commands, by these exact names** (other docs cite them):
  `npm run build`, `npm run check` (types, content validation, and the
  headless simulation scenarios; fast, no browser), `npm run e2e` (the real
  page in headless browsers against a local server, two players, one of
  them phone-sized with touch), `npm run check:live` (the same two-player
  check against the live URL), `npm run gates` (prints which of the design
  library's build gates A–F have a passing scenario; see
  `docs/measures.md`, M3), `npm start`, `npm run dev`.
- **A live check never lands in the players' world.** `npm run
  check:live` joins a private world of its own (a `?room=` name kept for
  checks, removed when empty), so it can run while the owner is playing
  without a scripted stranger appearing beside them.
- **Red on live means revert first, diagnose after.** If a push leaves the
  live game broken, the next push is the revert; nobody debugs on the
  owner's game.
- **`/healthz` keeps reporting the deployed commit**, as the probe does,
  **and says whether the server has lasting storage** (added 2026-11-23
  04:16 UTC: the owner asked how to add a Railway volume and was told to
  mount it at `/data`; Railway then sets `RAILWAY_VOLUME_MOUNT_PATH` and
  `RAILWAY_VOLUME_NAME` for the running server by itself). Report
  whether that variable is set and the path is writable, **and whether it
  is a real mounted volume** (`RAILWAY_VOLUME_NAME` is set too, and the
  path sits on a different device than `/`): at 04:19 UTC the owner
  wrote "I added variable volume mount path with name /data", which may
  be a hand-typed variable rather than an attached volume, and a typed
  variable must not read as storage. Nothing more than that;
  no session should have to ask the owner whether they did it. Using the
  storage is not this step's job (Step 7's Hall records are the first
  customer). Known from Railway's docs: the volume is mounted when the
  server starts, not during the build.
- **A push that only changes documents must not restart the game**
  (added by the orchestrator, 2026-11-23 04:10 UTC). Measured: every push
  to `main` redeploys and restarts the server (`/healthz`'s `startedAt`
  moves with each push), which drops whoever is playing and resets the
  world; leads and Vision Partner push documents every few minutes, and
  will still be doing so while the owner plays. So: add Railway's own
  config file with watch patterns that leave out `docs/**`,
  `handoff-prompts/**`, `tools/**` and top-level `*.md`, and a health
  check on `/healthz` so a build that fails to start never replaces the
  running game. **Prove both:** a docs-only push leaves `startedAt`
  unchanged; a code push changes it and reports the new commit.
- **A restart must be survivable anyway.** After a deploy the page
  rejoins by itself, and if the server reports a different commit than
  the page was built from, the page reloads itself once to pick up the
  new build (Step 5 polishes this; the bare mechanism is Step 1's).
- **`/healthz` then reports the commit that is *running*, which after a
  docs-only push is older than the tip of `main`.** Make M1 honest about
  that: also report, or let a script compute, whether everything since
  the running commit touched only watched-out paths
  (`docs/measures.md`, M1).
- **A push to `main` is the deploy**, so the gate before every push is
  `npm run build && npm run check`, plus `npm run e2e` when the client or
  the network changed. Write that gate into `docs/verifying-and-finishing.md`.

## What's open (the lead's to measure and decide)

- Library choices and versions, the file layout inside the constraints
  above, tick and send rates, how remote characters are smoothed.
- How the scenario scripts are written (prefer scenarios as data: a room,
  a list of timed inputs, the facts expected).

## Traps already known

- **Nobody can read Railway's build or runtime logs.** The only evidence is
  the live URL. So make the deploy boring: `npm run build` must produce
  everything `npm start` needs; `npm start` must not need development-only
  packages; listen on `process.env.PORT` on `0.0.0.0`. Push the skeleton
  early and confirm `/healthz` shows your commit before building on it. If
  a push does not go live within about ten minutes, the previous deploy
  keeps serving: say so to the orchestrator at once, don't stack more
  pushes on it.
- **The deploy itself works, measured** (see Measure below): a push with
  no build step went live in 37 seconds. A push whose *build* fails has
  never been tried; expect Railway to keep serving the previous deploy.
- **A check that passes on a broken build proves nothing.** Each scenario
  needs a control watched to fail once (`docs/verifying-and-finishing.md`,
  rung 3).
- **iPhone Safari is the real target and nobody here can run it.** Only
  headless Chromium is installed (never run `playwright install`), so the
  phone-sized e2e client is Chromium pretending: touch events and an
  iPhone-sized landscape viewport. That proves the touch path, not
  Safari. So stay on boring, long-supported web features, and handle what
  Safari is known for: no hover, the notch and home-indicator safe areas,
  browser chrome that eats height, double-tap zoom and pull-to-refresh
  inside the game surface, multi-touch (move and jump at once), and sound
  that stays silent until the first tap. Say in the closing report that a
  real iPhone has not been tried; that is the owner's first minute.
- **Art arrives during the night.** The owner has ChatGPT making assets on
  request; Vision Partner files the requests and syncs deliveries into
  `docs/design-library/` (`docs/mechanisms/asset-requests.md`; read it
  before asking for anything). Two hero sprite sheets, some NPCs and tile
  atlases are already on order. The game keeps its own copy of what it
  uses, in its own assets folder; the mirror is reference, not runtime.

## Feedback signal

1. `npm run build && npm run check` exit 0 from a fresh clone
   (`npm ci` first), and `npm run check` runs at least one simulation
   scenario whose control you watched fail.
2. `npm run e2e` passes: two headless browsers (at least one iPhone-sized,
   landscape, driven by touch) join a local server; when A moves, B sees A at the new place within half
   a second; with 150 ms of delay injected each way, A's own character
   still starts moving within 50 ms of the key press.
3. `npm run check:live` passes against the live URL, `npm run
   check:deployed` exits 0 (what is running has every code change on
   `main`), and `npm run gates` reports gate F as passing (the headless
   two-player scenario). `check:live` uses `check:deployed`'s test as its
   own first step, never "the running commit equals the tip of `main`":
   after a documents-only push that is false on a healthy game.

## Stopping condition

Signal 3 passes, and:
- `docs/architecture.md` exists and `CLAUDE.md`'s "Architecture at a
  glance" and "Working locally" sections are filled from it (short);
- `docs/verifying-and-finishing.md`, "This project's setup", says what is
  true, with each command run end to end and the date;
- `docs/plan.md`, "What is already right", names the patterns later steps
  should copy;
- `docs/measures.md` M1–M3 have been run and their numbers updated here and
  in `docs/plan.md`'s table.

**Budget:** Gate 1 by about 05:15 UTC, Gate 2 by about 06:30 UTC on
2026-11-23. If either slips by more than thirty minutes, tell the
orchestrator what is in the way rather than pushing on quietly.

## Taste, for the owner in the morning

How the movement feels in the hand is theirs to judge. Put the tuning
numbers (speeds, jump height, gravity) in one data file so they can be
changed without touching code; don't grade the feel yourself.

## Measure

- **Railway deploys `main` automatically, in well under a minute for a
  no-build app** (orchestrator, 2026-11-23). The probe commit 7b8dc09 was
  pushed at 03:55:37 UTC; `curl -s https://irreverents-production.up.railway.app/healthz`
  first answered at 03:56:14 UTC with
  `{"ok":true,"commit":"7b8dc0950ae30516600138852bc20cccf46d4582",...}`.
  Before the push the URL answered Railway's own 404 "Application not
  found". So: Railway runs `npm start` from `package.json`, sets `PORT`,
  and sets `RAILWAY_GIT_COMMIT_SHA` to the deployed commit. Not measured:
  a push with a build step and dependencies, how long that takes, what a
  failed build does to the live site, whether WebSockets pass through.

- **Railway runs `npm run build`, keeps dev packages, and deploys a
  build in 25 s** (lead, 2026-11-23). Probe commit f4c5ea3 pushed
  04:02:23 UTC; `curl -s …/healthz` at 04:02:48 returned
  `"probe":{"built":{…,"node":"v22.23.4","devDepAtBuild":true},"devDepAtRuntime":true}`.
  Railway accepted a committed `package-lock.json`. Still not measured:
  what a *failed* build does to the live site.
- **WebSockets pass through Railway and through the sandbox's proxy**
  (lead, 04:05 UTC). Headless Chromium as Playwright's `iPhone 14
  landscape` (viewport 750×340, touch on): page in 437 ms, `wss://…/ws`
  open in 450 ms, ten echo round trips 106–136 ms. So `check:live` can
  run from a session's container.
- **Node 22.23.5 here runs `.ts` directly** (`node t.ts`, no flag);
  registry today: typescript 7.0.2, esbuild 0.28.2, ws 8.23.0; Playwright
  1.63.0 preinstalled at `/opt/node-tools/node_modules`.
- **For the two-player browser check** (lead, 04:07 UTC, headless
  Chromium via a CDP session): two fingers at once can be scripted
  (`Input.dispatchTouchEvent` with two `touchPoints` gave `touches.length`
  1 then 2 on two elements); Chromium's network throttling does **not**
  delay WebSocket frames (latency 150 set, echo round trips stayed
  104–108 ms against a 105–108 baseline), so the 150 ms delay in
  feedback signal 2 must be injected by a delaying relay in the script;
  `iPhone 14 landscape` is 750×340 CSS px at ratio 3, so 320×180 fits 5×
  in device pixels.
- **Gate 1 skeleton deploys and runs** (Gate 1 worker, 2026-11-23).
  Bare skeleton f001057 pushed 04:07:21 UTC; `/healthz` reported it at
  04:08:01 (40 s), `startedAt` 04:07:57. The first deploy built with
  esbuild on Railway, serving from a bundled `dist/server.cjs`.
- **From a fresh clone, 04:17 UTC:** `npm ci`, `npm run build`,
  `npm run check` each exit 0, each under a second; `npm run gates`
  prints six `no scenario yet` lines and `gates passing: 0 of 6`;
  `npm run e2e` and `npm run check:live` exit 1 with their one line. The
  built server ran with `node_modules` deleted.
- **Scenarios: 3, each with a watched failing control** (run speed 0;
  jump speed 0, platform removed, one-way made solid; every player given
  player a's input, wall collision off; `Math.random` in physics for the
  run-twice determinism check). Validator controls watched: tuning
  reference typo, verb typo, tuning number typo, ragged room row, start
  room typo, unknown action in a scenario, a Node import in `src/sim`.
- **The canvas page, looked at** in headless Chromium at 1280×720 and as
  Playwright's `iPhone 14 landscape`: holding right then space moved the
  character from the spawn onto the first platform; no page errors.
  Keyboard only; touch is Gate 2. Not tried: Safari, a real phone.
- **Documents-only pushes no longer restart the game** (Gate 1 worker,
  04:29 to 04:33 UTC): with `railway.json` listing only the code paths,
  four documents-only pushes left `startedAt` at 04:29:08; a code push
  restarted it at 04:33:03. `/healthz` reports the volume: mounted and
  writable at `/data`. `npm run check:deployed` is M1's command. Record
  and traps: `docs/mechanisms/deploy.md`. Not proven: the health check.

## Briefs

- `handoff-prompts/step-1-gate-1-skeleton.md` — Gate 1: skeleton, sim
  core, scenarios, architecture doc. Worker `session_017WiGzHGmyESjXPtM3zXt19`, launched 04:04 UTC.
- `handoff-prompts/step-1-gate-2-together.md` — Gate 2: browser client,
  touch, netcode, rejoin after a restart, `e2e`, `check:live`, gate F.
  Worker `session_017WiGzGmZK2vRuZTfKA24QD`, launched 04:20 UTC after the Gate 1 review below.

## Open with the owner

*(None.)*

## Handoff notes

*(Newest last.)*

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 04:12 UTC.** Claimed; measured
  the deploy (above); Gate 1 briefed and its worker running. Next: review
  Gate 1 by re-running it from a fresh clone with a failing control, tell
  the orchestrator (`session_017WiGzFWfLir1ATiSP7c5E5`) the moment it is
  on `main`, launch Gate 2. A backstop wake is armed for 04:41 UTC.

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 04:20 UTC: Gate 1 reviewed at
  234d1b4 (deliverables 1–8).** Re-run by the lead from a fresh clone:
  `npm ci`, `npm run build`, `npm run check` exit 0 (three scenarios);
  `npm run gates` prints six "no scenario yet"; `e2e` and `check:live`
  exit 1 as stubs. Lead's own control: gravity set to 1 in
  `content/tuning.json` → `check: FAILED` naming the facts (a character
  in the air at tick 180), restored → passes. Built server started with
  `npm start`: `/healthz` reported the commit it was given; the page in a
  phone-sized headless browser drew the room and character, ran and
  jumped on keys with no page errors (screenshot read). Live `/healthz`
  reported 234d1b4. **Not verified by the lead:** `npm run dev`; the
  worker's listed controls beyond the one above; anything on a real
  iPhone. **Still to land from the Gate 1 worker** (added to its brief
  mid-flight): `railway.json` watch patterns and health check, `npm run
  check:deployed`, the storage field in `/healthz`. Kept the worker's
  self-registering files and declaration merging: they are what lets
  Steps 2–4 add verbs, systems and content kinds without editing a
  common file. The live page is keyboard-only until Gate 2.
