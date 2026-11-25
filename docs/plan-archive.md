# Plan archive

**Archive.** History — read for context, never act on it. Full, verbatim
text of `docs/plan.md` steps once they are fully closed (every item done,
no unresolved owner question left anywhere inside them; see
`docs/plan.md`'s own "Keeping this plan honest" for the rule and its
exception for long owner-blocked steps). `docs/plan.md` keeps a short
closing summary and a link back here; this file keeps the actual
narrative, unedited, so the reasoning behind a shipped decision stays
findable without carrying its full weight in the document every session
reads to find out what's next.

Nothing here is current. If something below reads as still open, that is
this file lagging reality, not reality lagging this file: check
`docs/plan.md`, `docs/mechanisms/README.md` or `docs/deliberate-designs.md`
for the live answer, and fix whichever doc is wrong.

## Entry format

```markdown
## Step N — <title, as it was in docs/plan.md>

<the full text of docs/plan/step-N.md, verbatim, from its first line
after the kind line>
```

Steps appear in the order they were archived, newest at the bottom. This
file only grows; that is expected of an archive and is why nothing reads
it by default.

---

## Step 1 — A live room two people can play in together

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
  `DRAFT:`, O-003 is open), Step 2's lead has decided what happens and it
  stands: the next visitor plays a second copy of a member, with a body
  of their own, rather than being turned away (`docs/plan/step-2.md`,
  "Decided by the lead"; `docs/decisions-log.md`). Never a blank page.
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

- **Gate 2, local** (Gate 2 worker, 2026-11-23, headless Chromium,
  server on localhost; numbers from the run before the push, see the
  commit). `npm run e2e`, all facts pass: (a) each page draws both
  players, each in their own colour, seated as different party members;
  (b) the phone page drew the desktop player at their new place 104 ms
  after they stopped; (c) two fingers at once ran and jumped in the same
  frame; a control for every action, none over the play field, game
  pixels 4 device pixels on `iPhone 14 landscape` (5 would leave no room
  beside the view); rate, two players and six placed bodies: a page sends
  31 messages/s (10 kB/s) and receives 22 (31 kB/s); (d) with 150 ms
  added each way (round trip measured from the page: 4 ms → 305 ms) the
  player's own character started moving 14 ms after the key press; (e)
  865 ms from a cut socket to the other page drawing the player at a new
  place, no reload, no duplicate; (f) passes; (g) an upright `iPhone 14`
  ran and jumped by touch with every control below the view; (h) the
  server down for 75 s, the page still trying and the player still
  moving, back in the world 1.4 s after its return; restarted as
  another commit, exactly one reload. `npm run check` about 6 s with the
  gate F check (an effect delivered, its first copy lost, resent, applied
  once, acknowledged) and the built server started as its own process;
  `npm run gates`: F passing (4 of 6 with the other steps' scenarios). One snapshot of the check's world is 1.4 kB, 2.1 kB with an unknown-kind entity carrying 500 bytes. Controls watched to fail are listed in
  `docs/mechanisms/network.md`. A throwaway sprite sheet and tile atlas
  added as data only were drawn by the page (screenshot read), then
  removed. **Not tried: Safari, a real iPhone, a real cellular network;
  the `hold`, `release` and `move` effects across two devices.**

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

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 04:38 UTC: Gate 1 items 9–11
  reviewed, Gate 1 brief closed and deleted.** The worker's proof is in
  `docs/mechanisms/deploy.md`. Lead's own check: `npm run check:deployed`
  exited 1 at 04:36 while Step 2's code push 99fb6f9 was still deploying
  (it named the eight undeployed files), and exited 0 at 04:37 with
  "main is 2 commit(s) ahead, all documents-only … which do not
  redeploy": the running server (started 04:36:32) had not restarted for
  those two pushes. Live `/healthz` shows the storage volume mounted,
  writable, on its own device. Not verified: that Railway honours the
  health check (deliberately untested; `deploy.md` says why it no longer
  matters). Gate 2 brief extended from the plan review (upright play,
  built server boots inside `npm run check`, player count in `/healthz`,
  party seat on join, id kept on the device); anything that does not fit
  06:30 UTC is to be written into `docs/plan/step-5.md` as owed.

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 04:53 UTC: open risk for Gate
  2, asked of the worker, not yet answered.** Each player's body runs on
  their own device; gates, dummies, crates and NPCs run on the server.
  Nothing written so far says how a player's *action* on a server-run
  thing (open a gate, hit a dummy, lift a crate) reaches the server. If
  the layer sends only the body's state, Steps 2–4's work is visible to
  the player who did it and to nobody else. The worker's brief now asks
  for the answer in the network writeup and a message to the lead. Also
  folded into the brief since 04:38, each from another lead: the party
  seat call agreed with Step 2 (`spawnPlayer` with no character,
  `removeEntity` on leave; on `main` at 792b0aa); Step 7's two server
  hooks; Step 3's needs (the report carries `room`; the whole `World`
  including `World.rooms` is replicated; the default world is never
  forgotten while the server runs). Effect names are published
  (`docs/architecture.md`, "Effects on a player", cbe516f); delivery
  between devices is not on `main` yet. Worker reported its e2e facts
  (a)–(h) and gate F passing locally at 04:33 against the original
  brief; unverified by the lead.

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 08:33 UTC: Gate 2 did not
  land; restarting it.** The account's usage limit stopped every session
  at about 04:57 UTC until 08:20. The Gate 2 worker
  (`session_017WiGzGmZK2vRuZTfKA24QD`) had nothing of the network layer
  on `main` (only the effect names, cbe516f); its working tree may still
  hold the rest. It has been asked to say whether that work survived and
  to land it in four small pushes (the brief's new section 0). If it does
  not answer by 08:37 or the work is gone: archive it and launch a fresh
  worker on the same brief. Live is still the keyboard-only page
  (4a13056). The 06:30 budget is void; the orchestrator's stopping
  condition (finished work only from 10:00 UTC) still stands.

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 08:50 UTC: Gate 2's main push
  reviewed at 4678680; live.** Re-run by the lead. `npm run check:live`
  from the lead's checkout: exit 0 against the live address (each page
  draws the other; a move shows 183 ms later; two-finger run and jump on
  the phone-sized page; touch controls for all five actions, none over
  the play field; a cut socket back in 1.5 s, no reload, no duplicate).
  Fresh clone at cdede03: `npm ci`, build, `npm run check` (61 lines ok,
  includes booting the built server and the two-client check), `npm run
  gates` 4 of 6 with F passing, `npm run e2e` exit 0 for facts (a)–(h)
  including upright play, 150 ms injected delay (own character moves 15
  ms after the key), `?room=` isolation, 75 s server outage, one reload
  on a new commit. Lead's control: server snapshots switched off
  (`src/server/game.ts`, `const snap = false`) → `check: FAILED` with six
  named facts; restored → passes. Screenshots read: sideways, the room
  is centred with the pad left and five round buttons right, nothing over
  the room; upright, the room across the top, the rotation-lock line with
  its dismiss button, controls at the bottom. **Not verified:** a real
  iPhone or Safari; a hit, grab or throw between two devices (no scripted
  fact yet); `hold`, `release`, `move` across devices (nothing emits them
  yet). **Not in yet (worker's next push):** inputs for every tick, so a
  tap between two reports reaches the server exactly once; server-written
  state on a player's entity surviving reports. Known limits are in
  `docs/mechanisms/network.md`. Step 1 stays open until that push is
  reviewed; the delivered touch-button art is not wired in (owed to
  Step 5).

- **Lead `session_017WiGzEwLs3ng2ZPpRZgctn`, 08:55 UTC: Gate 2's second
  push reviewed at 2a7fd98; Step 1 closed.** Light pass (narrow change in
  the network layer, with its own watched controls in the commit): fresh
  clone at cb297c0, build and `npm run check` exit 0, the two-client
  check now naming "a tap between two reports is seen once by the
  server"; `npm run check:live` exit 0 against the live address at
  cb297c0 after Step 3 had moved the start room (the relative facts
  held). Not re-run by the lead: the worker's two controls for this
  push. Feedback signals 1–3 pass; stopping condition met (architecture
  doc, `CLAUDE.md` sections, setup section, "What is already right",
  M1–M3 re-run at 08:45). Owed items are in `docs/plan/step-5.md`,
  "Owed by Step 1". Untried by anyone: a real iPhone; a hit, grab, throw
  or "Use" between two devices; `hold`, `release`, `move` across devices.

## Step 2 — Moving, hitting, grabbing and throwing

*(Archived 2026-11-23 17:30 UTC by orchestrator session_017WiGzHhke4tkAThPgw6EXs. Code comments that cite `docs/plan/step-2.md` mean this section; they were left as they are so as not to collide with builders working in those files.)*

# Step 2 — Moving, hitting, grabbing and throwing

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-020), via `docs/vision.md`:**
> Spectacular IMPACT is a top priority: suplexes, launches, heavy collision, knockback into walls/other enemies, and roadblock crashes.

**Owner (Drive, doc 01):**
> Irreverents should feel like a Kirby or LEGO Star Wars-style 2D action-adventure: superb movement, readable enemies, secrets, powers, co-op puzzles, stealth, explosive fights and interesting geography.

The library's first build gate (doc 24, gate A): "movement + jump + attack +
grab/throw are joyful in a graybox test; 3 character abilities are
distinct." This is the part of the game the owner and their brother-in-law
will have in their hands every second of the morning.

## Goal

In the graybox room, by touch on an iPhone and by keys on a computer, a
player can run, jump, attack, grab, carry and throw: objects, enemies and
the other player. What is hit or thrown flies, slams into walls and into
other things, and the screen shows it (a held beat on impact, shake,
dust), with no damage numbers. Three kinds of character play differently,
and a player can switch between them.

## What's decided

- **Owner, 2026-11-23 ~15:00 UTC, to Vision Partner, first-hand, answering Q-013 [when a friend takes the hero you need to get back out of a tiny gap]:**
  > If you are in a small tunnel, you can't switch to a big character that doesn't fit there.

  *(Vision Partner's reading:)* this confirms the existing refusal
  (`step2-body-switch-refused-in-gap`). The friend-occupies-your-hero case
  was not ruled on; the owner's standing answer is to build what gets the
  vision playable soonest, so it's the lead's call (`DRAFT:`).
- **Impact is physical, never a number on screen** (`docs/vision.md`,
  "What it is not": "Do not simplify combat down to damage numbers;
  collision force and consequence are essential").
- **Three character functions, as placeholders:** a grappler, a tiny
  infiltrator and a flyer (doc 24's "illustrative" list: "names/art not
  committed"). In use, not canon (D-096): `DRAFT:`, ids chosen so the art
  and names can change without renaming an id.
- **One shared party** (D-012, D-013). The party is a short list of
  member characters (tonight three, one of each function; the count is
  `DRAFT:`, O-003 is open). Each player controls one member. The
  library's confirmed rules (doc 05): "A character cannot be controlled
  by two humans at once. Unoccupied members are candidates for
  switching." So a switch goes only to a member nobody is playing, a solo
  player switches among all of them, and nobody is ever moved off their
  character by someone else (doc 06: "without involuntary takeovers").
  Swapping with a member a friend is playing is "a sensible proposal but
  not approved" (doc 05): don't build it. What happens to members nobody
  is playing (they vanish, stand where left, or follow) is open: tonight
  the switch happens in place and unplayed members are not in the world;
  `DRAFT:`, log it.
- **Players can grab and throw each other** (`DRAFT:`; our choice, in
  use under D-096, not the owner's decision: the library says nothing on
  players handling or hitting each other outside the cantina. Offered in
  the spirit of the Rule of Cool, D-053; it is in `docs/decisions-log.md`
  and on the taste list). Tonight's rule, each a line in the tuning file
  so the other answer is a small change: a friend's grab or throw moves
  you and does not hurt you; a friend's attack neither hurts nor launches
  you. **There is always a way out** (`INTENT:`): a held player can break
  free at once, and is let go by itself after a moment.
- **A player can be moved by something that is not their own device:** an
  enemy's hit, a friend's hold or throw. Step 1's netcode carries that
  for you as *effects* on the player (`docs/plan/step-1.md`, "The netcode
  must let the world move a player"): in the simulation you emit the
  effect, and you write no network code. If what you need is not there
  when you reach it, tell Step 1's lead rather than adding it yourself.
- **Being beaten never ends the game** (`DRAFT:`). The library leaves
  what defeat costs open (O-006) and gives one direction (S-007): "avoid
  hard game-over for ordinary experimentation". Tonight: a flattened
  character is out for a few seconds, then back in play close by; no
  "game over" screen, no restart of the room. The wait and the come-back
  place are numbers in the tuning file. This is not the cantina's endless
  instant respawn (its own exception, D-085, D-086), and it must stay
  possible to make a last stand losable later.
- **Tuning is data:** every speed, height, force and timing in one data
  file a non-programmer could edit.
- **An action is not finished until a phone can press it** (D-093).
  Actions are entries in the abstract action list Step 1 created
  (`content/actions/`); the keyboard and the touch layer both read that
  list, and Step 1's touch layer (its second gate, about 06:30 UTC) shows
  a control for every action there without being told. Once it has
  landed, add to `npm run e2e`, on the phone-sized page, one touch per
  action you added and see the character do it (control: an action the
  layer does not show fails). If the layer does not show yours unaided,
  tell Step 1's lead the same hour; do not leave it for Step 5. Keep the count
  small: "a small reusable set of context-sensitive controls, not a dozen
  tiny virtual buttons" (doc 33). The controls themselves are open in the
  library (D-095), so the mapping is `DRAFT:`: for example one action
  button that attacks on a tap, grabs on a hold, and throws when holding
  something. Whatever the mapping, a player standing next to a grabbable
  enemy or a friend can still choose to hit rather than grab, and a
  scenario proves it.

## How to cut it (a suggestion, not a rule)

Two slices that touch different parts and can run at once under one
lead: **the body** (running and jumping with the usual platformer
forgiveness, the three character functions, switching, getting unstuck)
and **the hit** (attack, grab, carry, throw, knockback, slamming into
walls and each other, the held beat). The hit can be built against
plain dummies; it does not need Step 4's people. If the night runs
short: never cut attack and grab/throw; the flyer is the first thing to
leave for later.

## What's open (the lead's to measure and decide)

- Exactly which moves each character has, within the library's rules:
  read `docs/design-library/02-gameplay-systems/05-characters-roster-parties-and-acquired-powers.md`,
  `06-online-co-op-and-creative-combination-rules.md` and
  `08-combat-impact-destruction-and-vehicles.md` (same folder), and the
  register (`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`).
- Acquired powers: in scope here only if the three characters and
  grab/throw are solid first; otherwise say so and it becomes its own
  step. If built: a power is taken from an enemy or picked up from the
  map (D-009) and sits on top of the character's own moves; a hit can
  knock it loose (D-081) as something lying in the room to grab back,
  never silently deleted (library doc 30,
  `docs/design-library/05-world-and-game-expansion-proposals/30-rare-powers-recoverable-drops-and-return-expeditions.md`).
  Everything else is open (O-005): how many at once, dropping on purpose,
  passing to a friend, keeping it through a switch or a defeat. Pick one
  power at a time and the simplest of the rest, `DRAFT:`.

## Feedback signal

Scenario scripts in `npm run check`, each with a control watched to fail,
named `step2-*.json` and tagged `"gate": "A"`. **One tagged scenario
passing is not gate A:** `npm run gates` calls a gate passing as soon as
any tagged scenario exists and none fails, so gate A counts for this step
only when its line lists a scenario for each of signals 1–5. Write that
list under Measure.
1. A thrown object that hits an enemy sends both flying (speeds over a
   stated threshold) and records an impact.
2. An enemy knocked into a wall records a wall impact and the held beat.
   And an enemy thrown or knocked into a second enemy sends the second
   flying too, with an impact recorded for each (D-020 names "knockback
   into walls/other enemies"; control: with body-to-body impact switched
   off, it fails).
3. For each of the three characters, one thing it can do that the other
   two cannot (three scenarios, each failing with the wrong character).
4. A player switches character and the other player sees the switch.
5. Two players: A picks up B and throws B; B flies; B can break free
   while held. Prove it headless first (two players in one simulation,
   `npm run check`); the both-screens version needs `npm run e2e`, which
   lands with Step 1's second gate (about 06:30 UTC), so add it then.
6. What the page drew during a scripted fight contains no number over a
   hit (read from the page's own record of what it drew; control: a test
   build that draws one fails). Looking at the screenshot as well is your
   rung 5, not this signal.

## Stopping condition

The six signals pass on `main` and live (`/healthz` at your commit, `npm
run check:deployed` exits 0 with your code in what is running), the three characters and the tuning file are
described in `docs/architecture.md`'s "I need to add…" table, and the
taste list below is in your closing report. **Budget:** closed by about
08:45 UTC, 2026-11-23; report what is in the way if it will slip.

## Owns

The player's movement and actions, combat and impact, the characters'
data, the tuning data and throwable objects; exact paths as
`docs/architecture.md` assigns them ("Which paths each plan step owns"). Not the touch layout (Step 5), not rooms (Step 3), not NPC moods
(Step 4): an enemy here is a body to hit and throw.


**Every body is Step 2's, player or not** (added 2026-11-23 04:35 UTC,
from the plan review): how it runs, is hit, held, thrown and knocked
out, and the events that say so. Step 4 never moves a body itself: its
systems decide what a person wants and hand that body the same input a
player's device would (walk left, attack), and its rules read Step 2's
events. The two leads write the event names into `docs/architecture.md`
(hit, grabbed, thrown, impact, knocked out, recovered; each says who did
it to whom) before the code that depends on them. Step 4's made-up test
events use exactly those names, so swapping in the real ones is a
deletion.

**Four files are shared between steps** (`docs/architecture.md`, "Files
two steps must both touch"): `src/sim/types.ts`,
`src/sim/systems/physics.ts`, `src/client/render.ts` (Step 1 is in it
until its Gate 2 lands) and `content/tuning.json`. In those: additive
edits only, keep each one small, `git pull --rebase` right before
pushing, and re-run `npm run check` after the rebase. That table of
owned paths was written by Step 1 before any other lead existed; if it
is wrong for your step, fix it there and tell the orchestrator.

## Taste, for the owner in the morning

Whether running and jumping feel superb; whether a throw makes them say
"OHH!"; whether the three characters feel different enough; the placeholder
character functions themselves. Don't grade these; list them.

Worth building once the signals are green, because it turns the owner's
taste into numbers without a session in between: a tuning panel on the
phone (behind `?tune` in the address) with sliders for the feel numbers
and a "copy these values" button.

**Built (2026-11-23):** open the game with `?tune` in the address (e.g.
`https://irreverents-production.up.railway.app/?tune`), tap **Tune** at
the top left, and change any number; everyone in your world feels it at
once, until the next restart. To send the numbers back, tap **Copy** and
paste what it gives into any session with "make these the defaults"
(`docs/mechanisms/tuning-panel.md`).

**Worth asking the owner after they play (from the feel worker):** how long
the freeze should be at the top end (8–9 frames for a full-speed impact);
whether the floor bounce is too lively (45%); whether the flyer's slow fall
(170 px/s) is floaty-good or floaty-annoying; whether the grappler's 0.1 s
wind-up feels heavy or laggy on a phone. Each is a dial on the panel.

**What to try, and which number changes it (feel, 2026-11-23).** Each
is per hero on the panel unless it says world.
- *A jump feels floaty or heavy:* `apexGravity` (under 1 = more hang at
  the top) and `apexSpeed` (how wide the top is); `fallGravity` (over 1
  = drops faster than it rose); `fallSpeed` (fastest fall).
- *A short hop is too short or too tall:* `jumpCutMultiplier`.
- *Running feels icy or sticky:* `runAccel` (start), `runDecel` (stop),
  `airAccel` / `airDecel` (steering in the air).
- *Missed a jump off an edge, or a jump pressed early was lost:*
  `coyoteTime`, `jumpBufferTime`.
- *A punch feels slow or limp:* `attackWindup` (draw-back), then
  `attackStrikeTime`, `attackRecovery`; `attackStrength` (how far it
  sends).
- *Impacts don't land / freeze too long (world):* `hitBeatTime` to
  `hitBeatMaxTime` for punches, `beatTime` to `beatMaxTime` for walls,
  floors and bodies.
- *Thrown things bounce too much or too little (world):* `floorBounce`,
  `floorBounceSpeed`; `wallBounce` for walls.
- *The three don't feel different enough:* `weight` (how far each flies
  when hit), and the numbers above side by side.

## Measure

Lead `session_017WiGzGRnRoAeW5Ep5iSycV`, 2026-11-23 04:30 UTC, on `main`
at 679e4d3. Each line is from the file named.

- **Only players act; only character kinds have bodies.**
  `src/sim/systems/verbs.ts` skips every entity with `player: null`;
  `src/sim/systems/physics.ts` skips every entity whose `kind` is not in
  `content.characters`. So a crate or a dummy is a character kind with no
  acting verbs, and anything that happens *to* a body is a system.
- **Nothing slows a body that is not a player.** Physics has gravity and
  tile collision and no friction; only `src/sim/verbs/move.ts` changes
  `vx`, and it pulls a player's `vx` to the stick's target at `runDecel`
  1200 px/s² every tick, which would erase a knockback in a few ticks.
- **Physics stops a body at a wall silently**: `vx = 0`, no event
  (`physics.ts`, the sideways block). `landed` is its only event.
- **The speed limit is 960 px/s** (16 px tile × 60 ticks): physics looks
  one tile ahead. `src/sim/check-content.ts` enforces it for `runSpeed`,
  `jumpSpeed` and `maxFallSpeed` only, so every new speed needs its own
  declared range under it. Falling is capped at `maxFallSpeed` 360;
  rising is not capped.
- **A per-character number must be declared by one of that character's
  verbs** (`check-content.ts`: any other name in a tuning set fails as
  "no verb reads this number"). A system cannot declare one.
- **A scenario can only spawn players** (`src/scenarios/run.ts`,
  `simulate`), and facts find bodies by player id
  (`src/scenarios/fact-helpers.ts`, `playerAt`).
- **Nothing puts a non-player into the live world**: `src/client/main.ts`
  calls `createWorld` and `spawnPlayer` and nothing else (the server is
  being written by Step 1's Gate 2 worker).
- **The first jump is 56.9 px high, 3.56 tiles** (`jumpSpeed` 320,
  `gravity` 900: 320² / 1800), so a ledge 5 tiles up is out of reach of a
  plain jump.
- **The library gives the three functions no move list** (docs 05, 08,
  11, 24, 33 read in full by a subagent): "not stated" for flight
  limits, the squeeze rule, carry rules, movement forgiveness, whether
  players' bodies block each other, and defeat outside the cantina. Its
  own examples: "strong-grab can slam an enemy or move a heavy object";
  a team that "would reach high ledges, small crawlspaces, heavy
  objects" (doc 05, illustrative).

## Decided by the lead (all `DRAFT:`, each in `docs/decisions-log.md`)

Shared by both briefs; a brief points here rather than repeating it.

- **Buttons:** `jump` (exists), `attack`, `grab`, `switch`. Attack hits;
  while carrying, attack throws (the stick aims: forward, up, down).
  Grab picks up what is in reach; while carrying, grab sets it down.
  Separate buttons, so hitting instead of grabbing is always possible.
  Held by someone: `jump` breaks free at once.
- **Ids:** character kinds `grappler`, `infiltrator`, `flyer` (the
  function, so names and art can change); `hero` stays, unchanged and
  unused by the party (Step 1's scenarios read it). Bodies: `crate`,
  `crate-heavy`, `dummy`, `dummy-heavy`.
- **What only each can do:** the grappler lifts and throws heavy bodies
  (`crate-heavy`, `dummy-heavy`); the infiltrator's body fits a
  one-tile-high gap; the flyer flaps in the air (a limited number of
  weaker air jumps) and reaches a ledge 5 tiles up.
- **The party** is `content/party.json`, a list of three member ids. A
  new player gets the first member nobody is playing; `switch` cycles to
  the next unplayed member, in place, feet kept, refused when the new
  body would not fit. A fourth player gets a second copy of a member
  rather than being turned away.
- **Bodies pass through each other** unless one is flying from a hit or
  a throw; then it shoves what it meets, by weight.
- **The held beat** is the two bodies of an impact holding still for a
  few ticks before they fly, inside the simulation (so every screen
  sees it and scenarios can read it); shake and dust are drawn from the
  same recorded impact.
- **No damage numbers, but a hidden toughness:** hits and impacts wear a
  body down by how hard they were; at zero it is flattened, out for a
  few seconds, then back near where it fell. Dummies too.
- **Non-player bodies in scenarios and rooms:** scenario field
  `entities`, `content/placements/<room id>.json`, and
  `populateRoom(world, content, roomId)` in `src/sim/world.ts`. Step 2
  lands the minimal shape first (told to the Step 1, 3 and 4 leads,
  04:30 UTC); Step 4 extends placements.
- **Acquired powers are not in this step.** Three characters and
  grab/throw first; powers become their own step (flagged to the
  orchestrator).

## Briefs

- `handoff-prompts/step-2-hit.md`: attack, grab, carry, throw, impact,
  bodies that are not players, the grappler's strength. Worker
  `session_017WiGzHbbov1AymyWrXuvge`, launched 04:32 UTC; due 07:15.
- `handoff-prompts/step-2-body.md`: the three characters, the party,
  switching, the infiltrator's and flyer's own moves. Worker
  `session_017WiGzEqGVmbgjJyorj73iV`, launched 04:32 UTC; due 06:45.

- **Feel round (lead `session_017WiGzGN9egot3JUvSMBBA9`, 2026-11-23 11:44 UTC):**
  `handoff-prompts/step-2-feel-sim.md` (movement shaping, attack phases,
  hit weight, floor bounce, states the renderer needs) and
  `handoff-prompts/step-2-feel-dials.md` (the `?tune` panel, reaching the
  server), two workers at once. Measured at d2459f0: coyote time, jump
  buffer and variable height exist with no scenario proving them;
  gravity is world-only; the attack lands on the press tick; the held
  beat is fixed; floors do not bounce; the page runs its own movement
  and the server runs hits, so a dial has to reach the server.
  Workers: sim `session_017WiGzEuk7zACZWPXaqAcBQ`, dials
  `session_017WiGzFne2AqHYRKtZMwgRq`, launched 11:44 UTC.

- `handoff-prompts/step-2-touch-and-two-screens.md`: the touch check
  and the both-screens throw, released by the orchestrator at 08:42
  UTC after Step 1's Gate 2 went live at 4678680. One worker; due
  10:15 UTC.

## Open with the owner

## Feel, from 2026-11-23 (what this step is reopened for)

**Owner, 2026-11-23 ~10:05 UTC, to Vision Partner, first-hand, after
playing the first morning build** (`docs/vision.md`, "The measure"):
> The game looks awful. Make sure it stays on track. I want to be playing something that looks, sounds, and feels as good as kirby and the amazing mirror, but with all the decisions in the vision, by tomorrow. LONG way to go currently.

The look and the sound are Step 8's, running now. **How it feels in the
hands is this step's**, and it comes before any new system
(`docs/current-directive.md`). The scripted signals above are met; what
they cannot say is whether running, jumping, hitting and throwing feel
good. That is the owner's to judge, so the job here is two things: make
the feel as good as a careful platformer's by the known craft, and put
the dials in the owner's hands.

**Goal.** By the owner's morning of 2026-11-24, on an iPhone held either
way: movement answers the thumb at once and lands where the player
meant; a jump can be short or long; hits and throws carry weight (the
library's "OHHHHH" of physical impact, D-020: impact, not numbers); the
three party members feel different to move, not only different in what
they can do; and the owner can change any of it from the phone while
playing.

**What that means, as things to build (all numbers are data in
`content/tuning.json`, declared by their reader):**
- *Moving:* quick acceleration and a short stop rather than instant or
  icy; air control; a jump whose height follows how long the button is
  held; a few ticks of grace after walking off a ledge and a few ticks of
  memory for a jump pressed just before landing; a little hang at the top
  and a faster fall; no stick on landing. The flyer floats and flaps; the
  infiltrator is the quickest and lightest; the grappler is heavy and
  hits hardest.
- *Hitting and throwing:* an attack with a short wind-up, a strike and a
  recovery; the held beat on impact scaled to how hard the hit was;
  knockback in an arc, a bounce off walls and floors, bodies that tumble
  into each other; a throw that follows the stick and feels heavy for
  heavy things.
- *Telling the picture:* Step 8's renderer draws from what the
  simulation says. Its actors lane lists, in
  `docs/mechanisms/rendering-actors.md` under "Flags for the lead", every
  state it could not tell from the world (an attack's phase, the tick of
  a landing or a hit, being stunned). Expose those, additively.
- *The dials:* the `?tune` panel this step already owes: every feel
  number adjustable on the phone while playing, per character, with a way
  to copy the changed numbers out so they can be made the default. A
  question about feel that comes back unanswerable is answered by
  handing over the dial.

**Feedback signal** (each a scenario in `npm run check` with a control
watched to fail, named `step2-feel-*`): ticks from a press to most of top
speed, and from release to a stop, inside stated bounds; a tap jump
measurably lower than a held one; a jump still granted a few ticks after
leaving a ledge, and refused after the grace; a jump pressed just before
landing still happens; the held beat longer for a harder hit; a thrown
body bounces rather than stops dead; each party member's top speed, jump
height and weight differ by stated margins. `npm run e2e` proves the
panel changes a number on a phone-sized page and that play follows it.
None of this says it feels good: that is the owner's, with the panel.

**Stopping condition.** Those scenarios pass on `main` and live, the
panel works by touch on both holds, and a short list of what to try and
which dial changes it is in the closing report. Budget: the owner's
morning of 2026-11-24 (about 11:00 UTC). Report what is in the way if it
will slip.

**Decided.** Feel before new systems (the owner, above). Numbers are data
and `DRAFT:`. Nothing copied from another game: its feel is the bar, the
numbers are ours to find. **Not this step's:** the camera
(`src/client/draw/room.ts`, Step 8's world lane, until its round 1 has
landed; then ask the orchestrator), anything in `src/client/draw/`, the
touch layout (Step 8's shell lane today).

**While Step 8's lanes are landing** (nine of them push to `main` through
the day; `docs/plan/step-8.md`, "The look"): pull before every push and
run `npm run e2e` after every pull; a change of movement numbers can move
what the scripted touch play does, and that is yours to keep green.

**Also still owed here, after feel:** the switch gap (two players can
become the same hero; the fix is in the network layer), the no-number
check from the page's own record (signal 6), and `docs/architecture.md`'s
rows re-read. See the handoff notes below.

## Handoff notes

*(Newest last.)*

- **Lead `session_017WiGzGRnRoAeW5Ep5iSycV`, 04:33 UTC.** Claimed,
  measured, decided (above), two workers running at once. The Step 1, 3
  and 4 leads were told the shared shapes by message. Next: when each
  worker's first push lands, re-run it; ask the Step 1 lead to call
  `populateRoom` and to stop passing a character to `spawnPlayer`;
  review each slice by re-running with a control of my own; then a
  third brief (the `?tune` panel, both-screens checks once `npm run
  e2e` exists). Not yet asked of anyone: the exact effect events Step
  1's netcode delivers (asked of its lead, no answer yet).

- **Lead, 04:47 UTC: the body slice reviewed at 75da7ee and closed;
  worker archived, brief deleted by it.** Re-run by the lead: build,
  check (all scenarios), and three controls each failing the right
  scenario (flyer `flaps` 0; infiltrator box 26 px tall; the "nobody
  else is playing it" test removed from `switch.ts`). Twelve
  scenarios, renamed by the lead to `step2-body-*`. For signal 3:
  `step2-body-infiltrator-fits-gap` (+ `-grappler-stopped-by-gap`,
  `-flyer-stopped-by-gap`), `step2-body-flyer-reaches-ledge` (+
  `-grappler-misses-ledge`, `-infiltrator-misses-ledge`); the
  grappler's third is the hit worker's. For signal 4:
  `step2-body-switch-two-players`, `-switch-solo`,
  `-switch-refused-in-gap`, `-spawn-different-members`. **Not verified
  by the lead:** the worker's screenshot of the three side by side; a
  held player's refused switch (no scenario can hold a player yet;
  handed to the hit brief); anything on the live page, where a player
  is still `hero` until Step 1's page stops naming a character (its
  lead has the call). **Gate A is not passing yet** whatever `npm run
  gates` prints: signals 1, 2 and 5 have no scenario. Record: mechanism
  `docs/mechanisms/party-and-switching.md`. One question filed in
  `docs/questions-inbox.md` (a friend taking the hero you need).

- **Lead, 08:45 UTC: the hit slice reviewed at b79ad96; worker's brief
  deleted by it.** (Every session was stopped by the account's usage
  limit from about 04:58 to 08:20 UTC; nothing of Step 2 was lost, both
  workers had pushed.) Re-run by the lead: build, check, gates. Five
  controls of the lead's own: `wallImpactSpeed` 900 and `maxLaunchSpeed`
  30 each failed the impact scenarios; `c.input` ignored failed the
  non-player ones (and Step 4's); `holdPlayerTime` 0.05 was refused by
  the validator; **removing the "cannot act while flying, held or
  flattened" rule from `verbs.ts` failed nothing**, so the lead added
  `step2-hit-thrown-cannot-steer` (fails with the rule removed: a thrown
  player steering back drops from 500 to 207 px/s). Looked at on the
  built page at phone size: the grappler lifts a crate, throws it into a
  dummy, the dummy shoves the next, dust at the contact, no number or
  bar, no page errors.
  **Signals, by scenario** (21 `step2-hit-*`, 12 `step2-body-*`):
  1 `step2-hit-throw-crate-at-dummy`; 2 `step2-hit-dummy-into-wall`,
  `step2-hit-dummy-into-dummy`; 3 `step2-body-infiltrator-fits-gap`,
  `step2-body-flyer-reaches-ledge`, `step2-hit-grappler-lifts-heavy`
  (each with its two "the others cannot"); 4 `step2-body-switch-two-players`;
  5 `step2-hit-throw-friend`, `step2-hit-break-free`,
  `step2-hit-held-let-go` (headless); also `step2-hit-not-grab`. So
  **gate A's scripted side is met for signals 1 to 5, headless.**
  **Not verified:** an independent break-it review was cut off by the
  usage limit and reported nothing (chains of holds, a body under a low
  ceiling, repeated impacts and summed speeds are checked only by the
  worker's own scenarios); anything across two devices; touch; signal 6
  as a script. **Not live for a player yet:** the page still seats
  everyone as `hero`, who cannot hit, grab or switch
  (`src/client/main.ts` passes a character; Step 1's, asked 04:52 and
  again 08:45).
  **Still open in this step** (held until Step 1's Gate 2 is live, by
  the orchestrator's 08:30 instruction): one touch per new action in
  `npm run e2e`; the no-number check from the page's own record; the
  both-screens throw; the `?tune` panel; `docs/architecture.md`'s
  "I need to add…" rows re-read against what landed. Records:
  `docs/mechanisms/combat-and-impact.md`,
  `docs/mechanisms/party-and-switching.md`. Taste list for the owner is
  in the first and in "Taste, for the owner in the morning" above.

- **Lead, 09:20 UTC: the touch and both-screens checks reviewed at
  306ed82; worker archived, brief deleted by it.** Re-run by the lead:
  build, check, and the whole `npm run e2e` (13 new facts `t-*` / `s-*`
  in `scripts/lib/e2e-touch.ts`, all ok); control: `E2E_TOUCH_BREAK=grab`
  failed six of them. **Proven on two phone-sized pages by touch, read
  from what each page drew:** grab a crate, carry, throw, hit a body
  away, switch; grab a friend, the friend breaks free with Jump, grab
  again and throw them; the second page sees each, and a thrown player
  flies on their own page and walks again after. **Known gaps:**
  (1) `switch` can land on a hero a friend is playing (printed `todo
  (t-switch-free)` on every e2e run): the page decides the switch and
  holds only its own character (`docs/mechanisms/network.md`, "Who owns
  which part"); the fix is in the network layer, Step 5's now. (2) A
  friend thrown out through a doorway vanishes from the thrower's
  screen at once (they change room); a drawing question, not chased.
  (3) "Hits a dummy" is proven as "hits a crate": the start room is the
  throne room and has no dummy. **Not verified:** a real iPhone or
  Safari; the live address (`check:live` does not run these facts);
  feel. At the brief's commit nothing of the hit worked on the real
  page; Step 1's 2a7fd98 fixed it, no Step 2 file changed.
  **Left in this step:** the switch gap above; signal 6 as a script;
  the `?tune` panel; `docs/architecture.md`'s "I need to add…" rows
  re-read. All held by the orchestrator's lean rule.


- **Lead `session_017WiGzGN9egot3JUvSMBBA9`, 12:25 UTC: the dials slice
  reviewed at dd4f83c; worker archived, brief deleted by it.** Re-run by
  the lead after pulling 98431b0: build, check (incl. new
  `tune-server`), and the whole `npm run e2e` (36 ok, 1 todo: the
  known `t-switch-free`). Control of the lead's own: the server's range
  test removed (`refuseChange`, `src/sim/tuning-rules.ts`) → `tune-server`
  failed with 7 problems; restored. The worker's `scripts/lib/e2e-touch.ts`
  change only exports helpers; no fact weakened. Looked at the panel at
  iPhone size both holds: opens, scrolls, covers no control. **For a
  later pass (`DRAFT:`, not blocking):** numbers are listed
  alphabetically, so the most-felt ones (top speed, jump) are not first;
  sliders across ranges like 0–100000 are coarse. **Not verified by the
  lead:** a real iPhone; the live address (worker's `check:live` and a
  live private-world change only).

- **Lead `session_017WiGzGN9egot3JUvSMBBA9`, 14:20 UTC: the feel-sim
  slice reviewed at 252e5ce (+06a07f4); worker archived, brief deleted
  by it. The feel round is closed** (its stopping condition: scenarios
  green on `main` and live, the panel works by touch both holds, the
  "what to try" list is above). Re-run by the lead: build, check (108
  ok), `npm run e2e` (36 ok, 1 known todo `t-switch-free`),
  `check:deployed` (live at 06a07f4; the 3 live errors are `check:live`'s
  deliberate ones). Control of the lead's own: the floor-bounce line
  removed from `impact-walls.ts` → `step2-feel-thrown-bounces` failed
  (4 problems); restored. Read the re-timed `step2-hit-*` diffs: ticks
  moved, tolerances kept (one x window 2 px wider); `check-content.ts`
  now also caps `fallSpeed` (stricter). **Flags routed:** (1) the
  renderer plays a swing from `c.attack.swung`, now the strike's tick,
  so **the wind-up draws as standing still** until `src/client/draw/`
  reads `c.attack.phase` (Step 8's; sent to the orchestrator). (2) A
  player's own page has no `c.carrying` (grab runs on the server), so
  a throw press predicts a swing, now with a wind-up, on the thrower's
  screen (network layer; sent to the orchestrator). (3) The friend-throw
  e2e now clears the throne room's crates first; a check room with an
  empty floor would be cleaner (Step 3's or 8's to give). (4) **Jump
  heights and the grappler's ground start/stop are unchanged on
  purpose:** Step 3's and Step 4's scenarios are timed on them to the
  tick; the grappler's weight is carried by fall, wind-up, weight and
  slide. A slower ground start needs those scenarios re-timed by their
  owners. **Not verified:** a real iPhone; how any of it feels; nothing
  reads `c.stunned`, `c.landing`, `c.lastHit` etc. in a scenario (they
  are for drawing).

- **Lead `session_017WiGzGN9egot3JUvSMBBA9`, 14:20 UTC: owed, held by the
  orchestrator until Step 8's round 2 lanes land** (usage allowance; it
  will message the lead to brief). In order: **(a)** panel polish: the
  most-felt numbers first (top speed, jump, wind-up, fall), finer steps
  for sliders across huge ranges (0–100000); **(b)** signal 6 as a script:
  no number on screen, from the page's own record; **(c)**
  `docs/architecture.md`'s "I need to add…" rows re-read against what
  landed. (a)+(b) are one worker's brief. Routed elsewhere: the wind-up
  drawn as standing still is Step 8 round 2's renderer lane
  (orchestrator); the thrower's predicted swing and the switch gap are in
  `docs/plan/step-5.md`'s handoff notes. Claim kept.

- **Lead, 14:28 UTC: granted Step 11's lead (`session_017WiGzFy3MD6ecvM7QMvQGd`)**
  an additive edit in Step 2's files for the brawl (D-085): a `c.brawl`
  component set by Step 11's system, read at the friend-share sites in
  `attack.ts`, `impact-walls.ts`, `impact-bodies.ts`. Conditions: the
  existing friend scenarios stay green unchanged; the player-on-player
  `friend` test is kept and only its share is replaced; a non-player hit
  never reads `c.brawl`; new roster characters joining `party.json` means
  re-running the switch scenarios and telling the Step 2 lead first.

- **15:55 UTC, flag from Step 11's worker (via its lead), not acted on:**
  on a page, a player's own copy of the world wears its own character on
  landing from a friend's throw with the full share, because the thrower
  is not in that page's world, so `friendly()` (`impact-walls.ts`) says
  no. The server's wear is the truth and the page takes it with a
  flatten or move, so it is only brief, but a page can believe for a
  moment that its character is worn. Step 11's `c.brawl` reads landed at
  fb619f5 as agreed; the friend scenarios pass unchanged.

- **Builder `session_017WiGzEW8KSWarusEnTDSEg`, ~16:50 UTC: the brief
  `step-2-panel-and-no-numbers.md`, both pushes.** (b) at 7500b81:
  `drawn.words` records every string drawn into the game picture; e2e
  `t-no-numbers` holds across the touch fight; control
  `E2E_TOUCH_BREAK=number-over-hit` failed it alone. (a) next commit: the
  felt numbers first, steps ≤ 2% of shipped where the range is huge (five
  widest rows measured in `docs/mechanisms/tuning-panel.md`); shots in
  `step-2-shots/panel-order-*.png` (the upright one is 390×844, the e2e's
  size, not 390×664). **Found and fixed in passing:** with runSpeed first,
  the e2e's scroll swipe on its one-line description was taken by the
  slider below (Chromium's touch lands on the nearest control) and changed
  the grappler's runSpeed 84 → 56; no fact failed. 8 px between words and
  slider stops it (repro and `INTENT:` in `tune.ts`). **Doubts, not
  acted on:** the record misses text drawn into an offscreen canvas and
  copied in (none today); the fight hits a crate, not a dummy (the start
  room has none); a real iPhone's Safari moves a range only from its thumb,
  as far as I know, so the bump may be Chromium-only. **Not verified:** a
  real iPhone; how the finer steps feel.

## Step 11 — The cantina: an endless brawl and the place you change your party

*(Archived 2026-11-23 18:05 UTC by orchestrator session_017WiGzHhke4tkAThPgw6EXs, after its lead closed it at a69ecf6. Code comments that cite `docs/plan/step-11.md` mean this section.)*

# Step 11 — The cantina: an endless brawl and the place you change your party

## Step 12 — The outpost and the chase


**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-083 to D-086):**
> D-083 The connected BETWEEN-LEVEL WORLD contains a CANTINA in which ALL UNLOCKED playable characters hang out and WANDER physically. …
>
> D-084 Exact roster-swap interaction: TAP the desired roaming cantina character; the CURRENT ACTIVE PARTY is shown ACROSS THE SCREEN; TAP the currently active member to REPLACE …
>
> D-085 Players may ATTACK those unlocked characters to launch a huge Super Smash Bros.-like BAR FIGHT, including blasting fighters OFFSCREEN, KOs and endless RESPAWNS for game-controlled roster fighters AND human players. …
>
> D-086 A RUNNING K/D COUNTER gives players scores/high-score opportunities during cantina fights. The entire cantina brawl is EXPLICITLY OUTSIDE ORDINARY NPC SYSTEMS …

No build gate or golden scenario covers the cantina; doc 31's own
acceptance tests are the yardstick.

## Goal

Off the castle street is a tavern where the heroes nobody is playing
wander about. Hit one and a bar fight breaks out: anyone, friends
included, can be launched out of the room, everyone is back at once, and
a small counter keeps score. Stop fighting or walk out and it settles.
When it is calm, tap a wandering hero, then the party member to replace.

## What's decided

- **A real room, not a menu** (D-083; doc 31). `DRAFT:` one room off the
  castle street in doc 31's cheap layout, entered by pushing up in a
  doorway, so no thrown body leaves by accident. Shortcut doors (D-087)
  come later.
- **Every unlocked character nobody is playing wanders there**, party
  members included (D-083). `DRAFT:` the whole roster starts unlocked:
  nothing in the world unlocks anyone yet.
- **Regulars are scripted, and outside every ordinary rule** (D-055,
  D-086; doc 31): a walking loop and a fight pattern, authored as data,
  played through the input any body takes. No moods, witnesses, calls or
  alert; nothing carried is lost.
- **Attack starts the brawl; a tap never does** (D-085; doc 33: "Normal
  ATTACK action is distinct from tap/recruit"). No new button.
- **Knocked flat or launched past the edge, you are back at once**,
  players and regulars alike, without end (D-085). `DRAFT:` the edge is
  an authored line, never a door.
- **In the brawl friends hurt and launch each other, and everyone in the
  room is in it.** `DRAFT:` our reading of "free-for-all" (doc 05); the
  library never says it outright. Elsewhere Step 2's rule stands.
- **A running counter** (D-086): each player's knock-outs and falls,
  readable on a phone; still no number over a hit. `DRAFT:` your best
  brawl is kept in Step 7's store, in a collection of its own.
- **There is always a way out** (`INTENT:`). `DRAFT:` Q-008's
  recommendation, logged in `docs/decisions-log.md`: the brawl ends when
  nobody has attacked for a few seconds, and when the last player walks
  out. Regulars never follow; leaving is never locked.
- **Chased by good guys, you cannot get in** (D-088). `DRAFT:` only an
  active chase locks the door (a raised alert alone is open in D-088).
  Guards following you in (D-089, D-090) is not this step.
- **The swap is two taps** (D-084): a regular, then the member to
  replace, in a row across the screen. The row closes on a tap elsewhere,
  on moving, or by itself, and no tap takes a friend's character (both
  `INTENT:`; doc 06: "avoid silently stealing a teammate's avatar").
  `DRAFT:` you may replace a member nobody is playing, or your own; not
  during a brawl.
- **Tonight all three heroes are in the party: with two players one
  hero is left to wander, and nobody is outside the party to swap in.**
  `DRAFT:` add two roster characters as data, using moves that exist
  (D-008). They are the brawl's regulars too, so land them with it.
  Without them the hub shows the wandering, the tap and the row but no
  real swap: say so.

## How to cut it (a suggestion, not a rule)

**The brawl first.** To start it needs only Step 2's hit on `main`
(attack, grab, throw, flying bodies, their events): build it in a room
with no door, two players in one simulation. Then, side by side: **the
door** (Step 3's doors; signal 6 needs Step 4's alert and chase) and
**the hub**. Two real phones, and signal 8, wait for Step 1's second
gate. Drop first: the best score, then the hub. Never cut: both ways
out, coming back at once, a brawl that raises no alert.

## What's open (the lead's to measure and decide)

Read in full, in `docs/design-library/02-gameplay-systems/`:
`31-cantina-party-roster-hub-and-endless-brawl.md`,
`05-characters-roster-parties-and-acquired-powers.md`,
`06-online-co-op-and-creative-combination-rules.md`,
`33-iphone-browser-platform-and-github-to-railway-delivery.md`,
`08-combat-impact-destruction-and-vehicles.md`; then D-007 to D-015 and
D-083 to D-090 in
`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`.
Where the library leaves something open (the room's size and edge, who
is credited with a knock-out, how many regulars fight at once), pick the
simplest, `DRAFT:`, log it in `docs/decisions-log.md`.

Agree each of these with its lead before code; never edit their files:

- Step 2: a party the world can change (today a fixed file), a
  knocked-flat body up at once, its three friend numbers set per brawl,
  the two character files.
- Step 3: the cantina's room file, the street's door to it, a door that
  can refuse.
- Step 4: "is being chased", read only; time inside is not hiding.
- Step 5 (Step 1 until it closes): a touch on the game view, sent like a
  button press. Until then the scripted checks supply the tap.
- Step 7: its way of getting a record from the game into the store.
- Step 9, if on `main`: no power is knocked loose in a brawl.
- Step 13 (heroes you find and keep), once claimed: one roster list
  between you, never two.

A doorway takes any body that pushes up in it, and up with attack is the
launcher: keep the doorway off the fighting floor, and regulars from
pushing up in it.

## Feedback signal

Scenarios in `npm run check`, named `step11-*.json`, each with a control
watched to fail.

1. Each unlocked character has one body in the cantina while nobody is
   playing it, walking its loop, never leaving (control: one marked
   locked is absent).
2. An attack on a regular starts the brawl and a regular hits back
   (control: a tap starts none).
3. Launched past the edge: a knock-out for whoever did it, a fall for
   the body, back within a second; a player, three times running
   (control: edge off, none).
4. In the brawl A's attack launches B (control: before it, B does not
   move).
5. No attack for the calm time ends it; so does the last player leaving,
   unhurt and unfollowed (control: one attack keeps it going).
6. After a brawl: no call, no mood changed, the alert as it was
   (control: the same hit on a person in the street upsets them).
   Chased, the door refuses; the chase over, it opens.
7. Tap a regular, then a member nobody is playing: the party holds the
   newcomer, `switch` reaches them, and the one replaced still wanders.
   Your own: you become the newcomer. A friend's: refused (control).
   Move with the row open: closed, nothing changed.
8. `npm run e2e`, phone-sized, by touch: a regular, a member, elsewhere;
   attack starts a brawl; each page's record of what it drew has the row
   and the same counter inside the view, and no number over a hit.

## Stopping condition

The eight signals pass on `main` and live (`npm run check:deployed` exits
0), and "how to add a roster character or a fight pattern" is in
`docs/architecture.md`. **Budget:** two hours from claiming, the brawl
inside the first. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer than that, land the brawl and its
door (signals 1 to 5, and 6 if Step 4 is on `main`), leave the hub out,
and say so.

## Owns

New paths only, agreed in `docs/architecture.md` when claimed:
`content/cantina/**` (edge, pads, patterns) and `content/roster.json`,
each with its kind file; systems named `cantina-*`; a new
`src/client/draw/cantina.ts` (counter and row). It builds on Step 2's
bodies, hit, party and switch, Step 3's rooms and doors, Step 4's alert,
the page's input and Step 7's store, and edits none of them. In the four
shared files (`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`): additive edits only,
`git pull --rebase` right before pushing, then `npm run check` again.

## Taste, for the owner in the morning

Whether the bar fight makes two people laugh; whether being launched by a
friend is fun or annoying; the regulars' patterns; how quickly it calms;
the counter's look and wording; the two extra characters; whether two
taps feel direct on a real iPhone.

## Measure

Taken 2026-11-23 by the lead at 17d8c1b (`npm run check` green): friends hit but do not launch or wear each other (three tuning numbers at 0, read at `attack.ts:139-146` and `friendly()` in impact-walls/bodies); nothing removes or respawns a body; nothing can leave a room's bounds (outside reads solid); unplayed party members are not in the world; no roster exists; no tap on the game view; the `move` effect exists but has never run across two pages. Step 12's door goes in the courtyard (column 9), so there is no clash.

## Briefs

- **Slice B, the hub** (`handoff-prompts/step-11-b-hub.md`, briefed ~16:15 UTC to the same worker): the cantina's tiles and backdrop; tap a regular → party row → tap the member to replace (new `Input.tap`, `World.party`, effect `become`); the street door refusing a player a good guard is chasing (`World.chased`, door `refuse`); the phone e2e (signal 8). Edits agreed or announced in Steps 2, 3, 5 and 8's files, additive.
- **Slice A, the brawl** (`handoff-prompts/step-11-a-brawl.md`, briefed 2026-11-23 by lead `session_017WiGzFy3MD6ecvM7QMvQGd`): roster, two new characters, the cantina room and its street door (castle street column 20), regulars, the brawl, out-and-back with a counter. Signals 1-5, half of 6, plus a real-server check that `move` brings a player back. Slice B (the tap, the row, the swap, the chase lock, signal 8, and the cantina's look: a `ROOM_THEME` entry in `tools/art/tiles/make.py` with its atlas and backdrop data, per `tools/art/tiles/README.md`, flagged by Step 8's ground lane at ec49eb5) waits for it.

**Owner (Drive, doc 11;
`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`):**
> D-061 Hostile outposts contain visible CALL-REINFORCEMENTS SIGNALERS. An enemy that DETECTS a player, RECOGNIZES them as a threat, and REACHES/ACTIVATES a signaler can call a reinforcement wave. Players can preemptively destroy/disable the signaler, interrupt the caller, clear the enemies without allowing further signaling, or ESCAPE THE ZONE. …
>
> D-069 Guards can chase into physically interconnected other game levels, where they may engage the bad guys already present. …

Step 4 builds the good guys' half and left the villain's signaler and
waves for later; this is that half. No build gate A–F is this step's;
golden scenario G-09 (doc 12) applies only if Step 7's machine exists.

## Goal

At the edge of the small kingdom is a bandit outpost. Its bandits are
glad to fight heroes; but if one spots you, runs to the signaler (a horn
on a post) and finishes sounding it, more arrive, and again after every
finished call. You can sneak past, stop the runner, break the signaler,
beat everyone, or leave. Guards chasing you now follow you through
doors, and where they meet bandits the two fight each other.

## What's decided

- **Bandits are Step 4's people:** three moods exactly (D-048), and
  fighting heroes is their business as usual (D-060). Scripted, never AI
  (D-055); a mark and a sound, not speech (D-057). Being spotted never
  reloads anything (D-062).
- **Seeing is not calling** (D-063, D-070). A bandit who sees a hero, in
  any mood, and whom the data lets call, walks a fixed route to the
  signaler and uses it; that takes time and shows. Only a finished call
  brings a wave. `DRAFT:` one wave per call (doc 07's "suggested
  default"); only a hero is worth a call, a guard is just fought.
- **One player can stop it every way D-061 lists** (D-015, D-066): stay
  unseen, knock out or grab the caller, break the signaler, beat
  everyone who may call, leave.
- **No new button** (D-093): the signaler breaks when hit or when
  something is thrown into it; bandits already called stay (doc 24).
  `DRAFT:` how much it takes, its look, and that it stays broken until
  the world restarts.
- **No cap on waves, a cap on bodies** (doc 24: "the system must never
  impose an arbitrary maximum wave count"). Waves are rows of a table in
  the outpost's data, harder row by row (D-061), and walk in at a spot
  the data marks. `DRAFT:` the last row repeats; a wave waits while the
  room is at its bound on people (Step 4 has one: measure it).
- **When no hero is left in it, it ends, and no fight shuts a door**
  (D-061; `INTENT:` at the door). `DRAFT:` the zone is the outpost's
  room; bandits stay in it.
- **A chase crosses doors** (D-077), by the door the pursuer saw a hero
  use, never another (D-065). `DRAFT:` only a few cross. The alert they
  left is no lower for it.
- **Sides that meet fight** (D-069), by a table of pairs in data:
  tonight guards and the outpost's bandits, not Step 4's street villain.
  `DRAFT:` each goes for the nearest enemy it sees; nobody's mood
  changes; each signaler brings only its own side. A wanted hero who
  joins in is not cooling off (D-074; doc 27: "do not attack anyone even
  in self-defense").
- **Nothing is saved tonight** (`DRAFT:`). Later, in Step 7's store: per
  outpost, signaler broken or not, and the most waves held off.

## How to cut it (a suggestion, not a rule)

**On `main` before claiming:** Step 2's attack, grab and throw; Step 4's
first slice (people, moods, sight). The chase also needs Step 3's doors
and Step 4's second slice (calls, the alert, responders); the touch
check needs Step 1's `npm run e2e`.

Two slices at once. **The outpost:** build it in a doorless test room of
your own, as Step 4 did, landing "no finished call, no wave" first.
**The chase:** who follows, and sides that meet. The real room and its
door go in last, once the scenarios pass. Drop first: G-09, then varied
waves, then the three-sided fight. Never cut: a finished call before any
wave, a way to stop it, the open door, the bound on bodies, three moods.

## What's open (the lead's to measure and decide)

- Read in full, in `docs/design-library/02-gameplay-systems/`:
  `27-persistent-wanted-pursuits-and-three-sided-battles.md`,
  `26-witnesses-reporting-and-wanted-levels.md`,
  `07-stealth-heists-npc-reactions-and-pursuit.md`,
  `24-feasible-game-architecture-making-irreverents-playable.md`; then
  the register's D-059–D-077 (path above).
- **Seams, written into `docs/architecture.md` before the code.** Step
  4: how a person's routine yields to a task of yours; whether its third
  slice already sends a guard through a door (then build on it); how a
  follower seeing a hero in another room, or a wanted hero hitting a
  bandit, restarts the alert's wait without your editing its files. Step
  3: the room's id and where it joins; its lead adds the door on the
  existing room's side. Step 2: how long a beaten bandit stays down, so
  "beat everyone" is real.
- Open in the library: whether pursuers wait outside a refuge, how a
  follower gets home, whether a stopped caller tries again, the wave
  rows. Pick the simplest, `DRAFT:`, log it in `docs/decisions-log.md`.

## Feedback signal

Scenarios in `npm run check`, named `step12-*.json`, no `gate` tag, each
with a control watched to fail; 1–4 with one player.
1. A bandit runs for the signaler and is knocked out mid-call: no wave.
   Control: left alone, one wave walks in after the call finishes, not
   before.
2. The signaler broken unseen: no call, no wave. Broken after a wave:
   those bandits stay, and no more come.
3. More finished calls than the table has rows: a wave each time, and
   the room never passes its bound (control: bound off).
4. A scripted route crosses the outpost and no call starts. The hero
   walks out after a wave and no new call starts (control: a door shut
   during a fight).
5. A guard follows through the door the hero used, and the alert is no
   lower; no more guards cross than the bound allows. Control: a hero
   who left unseen another way is not followed.
6. A chased hero runs into the outpost: a guard and a bandit hit each
   other, neither's mood changes, the alert rises only by a finished
   call. Out of reach, the hero waits and the alert falls (control:
   hitting a bandit restarts the wait).
7. `npm run e2e`, phone-sized page, by touch: break the signaler, stop a
   caller mid-call, walk out during a wave; the page's own record of
   what it drew shows the signaler working, in use and broken.
8. G-09, only if Step 7's machine and roadblock are on `main`: a late
   wave row sends the machine; a scripted player takes it and rams the
   wave. Build no machine here.

## Stopping condition

Signals 1–7 pass on `main` and live (`npm run check:deployed` exits 0),
and "how to add an outpost" is in `docs/architecture.md`. **Budget:**
120 minutes from claiming. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer, land the outpost alone (signals
1–4 and 7), its door added last, and say the chase was left out: an
outpost nobody can reach beats one half-working.

## Owns

New paths only, exact names agreed in `docs/architecture.md` when
claimed: `content/outposts/**` and its kind file (room, signalers, who
may call, routes, wave table, bound); `content/hostility.json` and its
kind file (which pairs fight); systems named `outpost-*`, `chase-*`,
`clash-*`; `src/client/draw/outpost.ts`. As data, new files in other
steps' directories, each agreed with its lead: the outpost's room (Step
3's format; this step adds the room file itself), its people (Step 4's),
their bodies (Step 2's). Ids name the job, never "bandit". It builds on
Steps 2, 3, 4 and 7 and edits none of their files. Four files are shared
between steps (`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`): additive edits only,
small, `git pull --rebase` before pushing, `npm run check` again after.

## Taste, for the owner in the morning

Whether a fight that will not stop is a thrill or a chore; whether the
run for the signaler makes you lunge; whether guards and bandits
brawling is funny; how fast waves grow; the signaler's look and sound.
List these; don't grade them.

## Measure

2026-11-23 14:40 UTC, lead session_017WiGzJTXQVCWQYDDmC2UiY, at 5fb514f (`npm run check` green, 64 s): the seams are measured into the slice A brief's "Measured for you". The ones that shape the step: calls are good-side only (`npc-call.ts:77`), so the horn is this step's own system and never raises Step 4's alert (`DRAFT:`); a bell can't be hit, so the horn is a heavy body like the throne; the people cap is parse-time only (`MAX_NPCS_PER_ROOM` 8), so the bound is new data; no cap exists on guards crossing doors (`alert-follow.ts`), slice B's. The outpost joins by an `enter` doorway at courtyard column 23, row 7 (moved 15:05 UTC from column 9: columns 1-13 are kept empty for Step 7's machine, 15 for the undercroft's doorway, 17-19 of rows 6-7 are Step 16's) (agreed with Step 11's lead, whose cantina goes off `castle-street`); `enter` doorways only, so nobody of the camp is carried out and no fight shuts a door.

## Briefs

- 16:05 UTC: slice A reviewed by the lead (check, the walk-out control, and `npm run e2e`'s `outpost-in`/`outpost-break` re-run green). Slice B: `handoff-prompts/step-12-b-chase-and-clash.md` (slice A's two gaps first: the fight-anywhere scenario and the camp's art; then the chase cap, the clash and hiding while wanted), hard stop 17:15 UTC.

- Slice A, the outpost (signals 1–4 and 7, the room and its door): `handoff-prompts/step-12-a-outpost.md`, hard stop 16:05 UTC. Added to slice A by message 15:05 UTC: `outpost-fight` widened so a hostile person fights wherever it is placed (Step 16 places these kinds in ordinary rooms; tell its lead when it lands). Slice B, the chase and the clash (signals 5–6), is briefed after A's review.

## Open with the owner

## Handoff notes

**Closed 18:05 UTC by the lead.** Slice B push 5 (f230c2b) reviewed: lead's control (`"refuse"` on the cantina's own door) now fails `npm run check` by name; `step11-chase-blink` covers the guard's sight flicker with a 1 s `chaseHold`. `npm run check` re-run green. All eight signals pass; the stopping condition's docs are in `docs/architecture.md` and `docs/mechanisms/cantina.md`. **Owed, for whoever reopens it:** a real iPhone (two phones in one brawl); a self-swap where the newcomer would not fit (no such spot in the cantina today); the best brawl kept in Step 7's store (dropped tonight); shortcut doors (D-087) and guards following in (D-089, D-090); the owner's taste list above. Not Step 11's: the switch gap (`handoff-prompts/step-5-switch-gap.md`), the cantina's own tiles, props and sprites (Step 8 round 3).

**Slice B push 4 (the phone check, 09d98a1) reviewed ~17:58 UTC by the lead:** `npm run e2e` re-run in full by the lead, green: by touch alone two phones walk into the cantina, a tap opens the row, a tap elsewhere closes it, a swap shows on both pages, switch reaches the newcomer, a brawl draws the same counter on both (signal 8). The builder's flag that a page's switch can land on a friend's member (the page's world has no friends in it) is the known switch gap, passed to the orchestrator as Step 2's holder. Owed in push 5: the way-out check and the sight-flicker hold.

**Slice B push 3 (the chase lock, 433275e) reviewed ~17:40 UTC by the lead:** the `room-doors.ts` edit is additive and refuses only a door carrying `"refuse": "chased"` (only `to-cantina` does); `cantina-chase` runs only in a world with `~cantina` and reads saved state with `?.`; good-side `c.respond` chasers only. Lead's control: `"refuse"` on the cantina's own `to-street` door makes nothing fail, so the way out was protected by a comment alone. A content check for it, and a short hold over the guard's two-tick sight flicker, were sent to the builder for push 4.

**The cantina's art is Step 8's from 17:07 UTC** (orchestrator): round 3's lanes draw its own tiles and backdrop (replacing slice B's borrowed `town` theme), tavern props, and the brawler's and skirmisher's sprites. Step 11 draws no cantina art; `content/rooms/cantina.json` stays Step 11's.

**Slice B pushes 1-2 reviewed ~17:00 UTC by the lead** (365a40d the look: only `content/atlases|backdrops/cantina.json` and the art tool's lists changed, no existing image; 49a5e53 the swap): read the shared edits (`cleanInput` carries `tap` with numbers checked; `World.party` read at exactly `firstFreeMember` and `switch`; effect `become` sent only to the tapping player's own entity); `npm run check` re-run green (18 step11 scenarios and the extended real-server check). Lead's control: a tap counted on every tick instead of once by its `n` fails `step11-row-closes`, `-row-not-in-brawl` and `-swap-unplayed`. Not verified: a real iPhone; the no-fit refusal (no spot in the cantina where a body would not fit).

**Slice A reviewed 2026-11-23 ~16:05 UTC by the lead** (fb619f5, 0043f36; live): `npm run check` re-run green (12 step11 scenarios and checks, Step 2's friend scenarios unchanged); a page-like world in the cantina grows no regulars (lead's probe); lead's control: making the respawn write a player's position instead of sending `move` fails `step11-cantina` (4 problems) while `step11-ring-out` still passes, so the real-server check is what guards it. Signals 1-5 and 6's first half pass; the bell (owner's answer to Q-008) ends a brawl. Not verified: a real iPhone, two real phones in one brawl. Worker's flag on a page briefly wearing its own body on landing passed to Step 2's lead.

### Slice A handoff (2026-11-23, slice A worker)

Done on `main` in three pushes (1bdd143, c889a47, and the e2e push after it): the outpost kind and four `outpost-*` systems, the test room and five scenarios, the Bandit Camp behind the courtyard's doorway (column 23), `step12-sneak-past-no-call` and `step12-walk-out-ends-it`, the horn drawn (`drawn.signalers`), `outpost-fight` widened to any bad-side person with `attack` (for Step 16), and `npm run e2e` facts `outpost-in` / `outpost-break` (a phone by touch walks from the start room into the camp; the page drew the post working, sounding, then broken; control `E2E_TOUCH_BREAK=attack` watched to fail). Writeup `docs/mechanisms/outposts.md`. Not done: the e2e "stop a caller mid-call" and "walk out during a wave" by touch (the scenarios cover both in the simulation); `check:live` does not run the outpost facts (local only). Open for the owner by playing: whether an endless fight is a thrill or a chore, how fast waves grow (1, 2, 3 fighters, 6 s between calls), the horn's look and sound (graybox now; no sound cue added). Flags: `docs/for-the-lead.md`.

### Slice B handoff (2026-11-23, slice B builder session_017WiGzFLgKMowRCLNbRRYiE)

Three pushes on `main`: ab0b34b, the camp's art (`outpost` borrows the courtyard's grass-ruins blocks and backdrop); 1d53683, the chase (`chase-cap` 606, `chaseCrossCap` 2: the nearest two who saw a hero leave follow, the rest search where they stand; `step12-guard-follows-into-camp`, street → courtyard → camp, the street's alert unchanged in the camp, control cap 0; `step12-unseen-not-followed-to-camp`); and the clash (`content/hostility.json` by role and side, `clash-fight` 59; `step12-guards-and-camp-clash`, control: no pairs). A guard's own swing is left to Step 18 (three step4 scenarios go red with it); `clash-cool` was not needed (alert-cool already holds the wait while a hero is seen). Flags: `docs/for-the-lead.md`. Open for the owner by playing: whether guards and bandits brawling is funny (tonight only the camp swings); whether only two crossing feels right (with one guard on the route it never shows); how long a hero must hide (20 s, Step 4's `npcAlertCoolTime`).

### Lead, closing, 2026-11-23 18:05 UTC

Closed. Live: the Bandit Camp behind the courtyard doorway (column 23): a lookout who sees a hero sounds a horn; each finished call brings a wave (1, 2, 3 fighters, the last row for ever, at most 8 people); stopped by staying unseen on the ledge, knocking out or grabbing the caller mid-call, breaking the horn (hits or a throw) or walking out. Camp fighters fight heroes in any room (Step 16 uses them). Guards who saw a hero go in follow through both doors, at most 2 per door (`chaseCrossCap`). Guards and bad-side people fight each other on sight (`content/hostility.json`, `clash-fight`), moods unchanged. Re-run by the lead: check green at beda613; controls watched to fail: the bound (`outpostBoundOn` 0), walking out (`outpostZoneEndOn` 0), the clash (pairs emptied); `npm run e2e`'s `outpost-in`/`outpost-break` green at a0debfa.

Left, each with its owner: guards' `attack` verb and the re-timing of `step4-guard-follows-seen`, `step4-standing-in-view-is-seen`, `step4-street-call` and `step12-guard-follows-into-camp` (Step 18; until it lands only the camp swings in a clash); the camp's sprites and props (Step 8 round 3); a three-guard check of the crossing cap (needs two more guards placed on the street-courtyard route; only the cap's control checks it now); stopping a caller and walking out by touch in e2e (scenarios cover both); G-09 (Step 7's machine). Not verified: a real iPhone; a clash on a phone. For the owner by playing: whether an endless fight is a thrill or a chore, how fast waves grow, the horn's look and sound, whether guards and bandits brawling is funny, whether two guards crossing feels right.

## Step 16 — A first real level: many screens, enemies all through it, and a guarded place to get into unseen

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~14:30 UTC, to Vision Partner, first-hand**
(`docs/current-directive.md`), after being told what is live:
> I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet

**Owner, ~15:00 UTC, answering Q-010** (same file):
> Just build according to the vision in the way that gets it playable according to the vision as soon as possible.

**Owner (Drive, doc 11, D-056, D-060, D-016):**
> D-056 The fun is FIRST AND FOREMOST the 2D level gameplay inspired by Kirby and LEGO Star Wars: traversal, powers, exploration, secrets, enemies, stealth, escalating combat, puzzles and co-op creativity. …
>
> D-060 Bad guys are present as thematically appropriate scattered enemies in levels, and also in specific HOSTILE OUTPOSTS …
>
> D-016 Stealth as broadly viable playstyle across the world; zero-alarm success should be deeply satisfying.

`docs/vision-gaps.md` (first audit, 7454fd9) lists the biggest gaps that
no step covers. This step closes three of them:
- **Gap 1, varied enemies scattered through levels.** Step 12 brings one
  outpost's enemies and nobody brings the rest.
- **Gap 2, a real level.** Today there are five castle rooms of one to
  three screens each.
- **Gap 10, a proud zero-alarm infiltration of a guarded place.** Today
  there is one street with one standing guard and a shop.

The step serves all three of the owner's standards (`docs/vision.md`,
its section on what "working" looks like, from doc 00): "the "OHHHHH" moment of spectacular
physical IMPACT", "the profound satisfaction of an impossible zero-alarm
infiltration", and "A disastrous stealth attempt should often become an
even more memorable battle or escape."

No build gate A–F belongs to this step. Its yardstick is golden scenarios
G-05 and G-06 (doc 12): a "guarded jewel vault with layered patrols,
multiple routes and a legitimate treasure", and the same vault where "a
single mistake triggers alarms" and the "group fights enormous
reinforcements". Doc 12 also allows a different place: "Designers may
invent different places/characters to prove the same point."

## Goal

A road leaves the courtyard and climbs out of the kingdom into a quarry.
The quarry is six rooms and a dozen screens of ledges, drops, a tower, a
pit and a cave, with things hidden above and below the main way.

Bad guys stand all along it, and they are not all alike:
- small ones that fly when hit;
- heavy ones that a punch barely moves;
- one that throws from a ledge;
- a brute.

In the middle of the quarry is the bad guys' depot. It has patrols, a
lookout, a horn, and a hoard locked in a strongroom. There are several
ways in, and you can take the hoard and leave without anyone noticing.
If you get seen, it becomes a fight against growing waves or a run for
the cave. The cave also comes out under the castle.

## What's decided

- **The level is a proposal, used by default** (D-096: "All new creative
  assets, design proposals and prototype implementation decisions are
  APPROVED FOR IMMEDIATE USE BY DEFAULT"). Which level to build is not
  decided (`docs/vision-gaps.md`, "Not decided yet"). Doc 28 says so
  itself: "ALL ten areas, names, individual puzzle solutions and
  geographic links are new brainstorming proposals".

  `DRAFT:` the level is doc 28's level 01, cut down. Its parts are ones
  the game already has:
  - its bad guys are an outpost's: "bad-guy bandits run a depot outpost
    with a visible lookout bell" (Step 12);
  - its rocks and carts are Step 2's crates;
  - its "breakable wall into dark cave" is Step 3's breakable part.

  Its own "short gameplay contrast test" runs the quarry two ways:
  - a quiet run where "Nothing summons reinforcements";
  - a wild run that "fights large waves".

  (Its third, a platform run that "should feel just as worthwhile", is
  set in two other places.)

  Doc 28's own rule is "Most rooms should just be great platforming", and
  the earlier anthology may still be mined for its "mechanics/room
  opportunities" (doc 11, after D-058). So the rails, carts, lifts and
  falling boulders are left out, because no part does them yet. The
  shapes stay. If the owner picks another place, the rooms are redrawn,
  and the enemy kinds and the depot's recipe carry over.

- **Ids are plain and never a proposed name.** `DRAFT:` room ids start
  `quarry-`, never "iron". Enemy kinds name the body or the job, never
  "bandit" (Step 12's rule). A shown name is data.

- **Where it joins the kingdom.** `DRAFT:` agreed with Step 3's lead or,
  while Step 3 has none, with the orchestrator. Doc 15 (a proposal) asks
  every region for "a public entrance, at least one discoverable
  non-obvious connection, and at least one return visit justified by an
  acquired character capability".
  - **The way in that everyone sees** is an `enter` doorway on the
    courtyard floor, between its two plates: columns 17–19 of rows 6–7,
    all clear at 1bd28d2. Columns 1–13 are not used, because Step 3
    keeps them empty for Step 7's machine and its roadblock (the
    courtyard file's note; `docs/mechanisms/rooms-and-doors.md`).
    Column 15 is kept for the undercroft's doorway, and Step 12's
    doorway is planned at column 9. Nothing stands between this one and
    a player alone. The gallery's free east wall is not used, because it
    is behind the two-plate gate and no crate is placed in the
    courtyard.
  - **The hidden way** is a walk door in the west wall (column 0) of the
    undercroft's vault, behind its breakable `vault-wall`, into the
    level's cave, and the long way home. Its shape is borrowed from doc
    25's bank (level 02, a proposal), whose room list ends with a "basement
    shortcut to castle foundations". Step 3's way-out check counts the
    unbroken `vault-wall` as wall, and the two ends of a walk door must
    be on opposite edges and the same size
    (`docs/mechanisms/rooms-and-doors.md`).

  Walking in from the kingdom cools nothing (D-077: "a level transition
  never automatically resets pursuit").

- **Many screens of platforming** (D-003, D-056). `DRAFT:` six rooms, and
  at least twelve screens of floor along the main way from the doorway to
  the depot, with more off it. A screen is 20 tiles across
  (`docs/mechanisms/rooms-and-doors.md`).
  - The rooms, in doc 28's order: a road up from the courtyard; a ridge
    crossing over drops; the tower; the depot; the pit below the depot;
    and the cave behind the pit's breakable wall. Doc 28: "The path from
    the lower pit can loop back to the ore depot".
  - The rooms are in Step 3's format and use only Step 3's parts (doors,
    oneway ledges, breakable and false walls, plates, gates, hiding
    places) and Step 2's crates. There is no new kind of part in this
    cut.
  - There are doors above and below the main way (doc 04: "Prioritize
    wandering, wrong turns, hidden routes, doors above and below the main
    path").
  - A missed jump drops you to a lower room: a pit is a walk door in the
    last row. Nothing kills you and nothing reloads, and Step 3's check
    plays every member out of every pocket.

- **Two routes and a secret everywhere** (D-004: "Nonlinear routes and
  optionality"; D-005, D-006). `DRAFT:` this follows doc 24's
  recommendation, "at least two routes and at least one secret return
  incentive tied to ability or power". Concretely:
  - two routes nothing points at (no arrow, no glow, no text);
  - one secret per hero, closed by size, height or weight and never by
    checking which hero it is (doc 04);
  - one thing in plain sight that none of the three heroes can reach by
    their own moves, waiting for Step 9's power or Step 13's hero. Doc
    15's rule C asks for "at least one visible “not yet” curiosity and at
    least one entirely unadvertised secret".

  Every room and hidden area has its own id and `hidden` flag, so Step 14
  can count it (D-079, owner-favored).

- **Enemies all through it, and not all alike.** D-060 puts bad guys
  through levels. Doc 24, under its "NEW OWNER-CONFIRMED HOSTILE OUTPOST
  SYSTEM" heading, says "scattered normal enemies remain the baseline".
  Doc 08 says "Avoid making enemies into homogeneous damage sponges;
  distinctions in movement, weight, armor, range, hazards and powers
  create variety".

  `DRAFT:` four kinds. Each is a character kind (Step 2's format) and an
  NPC kind (Step 4's), on side `bad`. They are placed in every room except
  the refuge, with at most Step 4's eight people in a room.
  - **Light** is Step 12's fighter (`outpost-fighter`, on `main` since
    1bdd143), reused, in twos and threes. Doc 08: "Light enemies should fly from heavy blows".
  - **Heavy** barely moves when punched. A throw, or a slam into a wall or
    another body, drops it; so will a suplex once Step 2 has one. Doc 08:
    "Heavy enemies may barely shift from small strikes, but a
    sufficiently powerful suplex, vehicle crash or chained explosion can
    topple them".
  - **Ranged** stays on a ledge and hits from out of reach. `DRAFT:` it
    uses Step 2's grab and throw on a light thing it holds, not a new
    projectile. If that cannot keep it supplied, a projectile verb is
    Step 2's file, agreed first.
  - **Brute** comes one to a stretch. It is big and slow, hits hard,
    takes a lot of beating, and the infiltrator cannot lift it. Doc 08's
    prototype bar: "a dozen low-tier enemies and one heavy brute".

  Their numbers are tuning, measured against the three heroes so that a
  light one launched by the grappler knocks down the next one. Doc 08:
  "send a target into a group, causing a chain reaction players
  immediately understand and want to repeat".

- **One system for enemies, Step 12's.** This step reuses its hostile
  kinds and never builds a parallel system.
  - The enemies are Step 4's people, with exactly three moods (D-048:
    "This applies to VILLAINS as well as benign townsfolk and other
    inhabitants"). They are scripted, never AI (D-055), and show a mark
    and a sound, not speech (D-057).
  - Fighting heroes is their business as usual (D-060: "not a
    narrative-dissonance trigger"), so a hit changes no mood.
  - Moods 2 and 3 come from a hero who breaks the script for them.
    `DRAFT:` the trigger comes from doc 23: "Villain sees HERO ignore him
    to inspect furniture: CONFUSION / DISTRESS, potentially escalating to
    RAGE". The lead picks the deed and writes it as rule rows.
  - Step 12's fight serves only an outpost's people: at 1bdd143
    `src/sim/systems/outpost-fight.ts` moves a body only if it was placed
    in that outpost's one room or came into it with a wave
    (`ofOutpost` in `src/sim/outpost/state.ts`). So for enemies outside
    the depot, Step 12's lead widens it or agrees in writing how it
    should work. This step writes no fight code.

- **Seeing is not calling** (D-063, D-070). Only a caller who reaches a
  signaler and finishes the call brings help. `DRAFT:` scattered enemies
  have no signaler and never call. The depot is the one place in the
  level that can.

- **The guarded place** (D-016; doc 07, "Heists are discovered
  opportunities": "A guarded bank, jewel room, museum or noble treasury
  has valuables, inhabitants and plausible physical security. Players
  decide whether to rob it and how; a specific “begin heist mission” flag
  should not be necessary for basic interaction.").

  `DRAFT:` it is the bad guys' depot, an outpost in Step 12's format. It
  has:
  - its signal post and lookout;
  - two patrols that walk fixed routes across the yard (Step 4's
    routines);
  - a hoard in a strongroom: a thing to take with Use (Step 4's
    `things`), so no new button (D-093);
  - besides the front, at least three ways in, each for a different body
    or trick and none needing a particular hero: under (a crawl one tile
    high), over (the roof, by flapping or by a throw), and through (a
    breakable wall from the pit below);
  - hiding places along the ways.

  Nothing starts a "heist". However you walk in, you are in one.

  It is guarded by bad guys, not good ones, because their horn already
  brings waves (Step 12), so G-06's "group fights enormous
  reinforcements" can happen here first. The other answer is a good-guy
  treasury: doc 25's bank, where you "watch repeated guard patrols;
  pickpocket a key; slip through vent or roof; disable a bell; open
  vault; slip out unnoticed". It uses the same rooms, with Step 4's guards
  and bell in the placements file, so it is a small change if the owner
  wants it.

- **Zero alarm means no call even started.** `DRAFT:` this is stricter
  than a call left unfinished (D-063). You take the hoard and leave the
  depot without anyone beginning a call. Doc 07: "A player should be able
  to complete a guarded route without alarm and feel genuinely proud."

- **Getting caught opens play** (D-019: "Failure of stealth opens
  satisfying battles, last stands and narrow escapes, NOT an
  automatic-reload punishment loop"; D-062: "No forced “stealth failed”
  reset").
  - A finished call brings Step 12's waves. You can stop it every way
    D-061 lists, and "ESCAPE THE ZONE" ends it.
  - `DRAFT:` the cave is the level's one refuge, after doc 28's
    "unguarded lower shaft above a difficult jump can be a refuge" (D-076;
    D-077: "Developed level geometry may offer richer refuge
    opportunities").
  - The hidden way under the castle is the long escape. A chase can
    follow you along it (D-077), and guards who come in "may engage the
    bad guys already present" (D-069). That clash is Step 12's slice B,
    not this step's.

- **Solo is never locked out by headcount** (D-015). One hero alone can
  take the main way, get into the depot, and do a zero-alarm route. A way
  that needs two players is a bonus.

- **Files, not engine** (`CLAUDE.md`, "Engine and content stay
  separate"). The level is rooms, placements, kinds, tuning, rules, an
  outpost file and scenarios. If it needs something the game cannot do,
  the step that owns that part builds it or agrees it in writing first;
  never a quiet engine edit here.

- **Nothing is saved.** `DRAFT:` the hoard, a broken horn and found
  secrets all reset with the world, as Step 12's do. They are kept later,
  in Step 7's store.

## How to cut it (a suggestion, not a rule)

**On `main` already (1bd28d2):**
- Step 3's rooms, doors, parts and way-out check;
- Step 2's three heroes, crates, attack, grab and throw;
- Step 4's people, routines, sight, hiding, things and bell;
- `npm run e2e`;
- Step 12's slice A push 1 (1bdd143), in its test room only: the
  fighter (`outpost-fighter`), the lookout (`outpost-lookout`), the
  signal post (`signal-post`), the outpost format
  (`content/outposts/test-outpost.json`) and its waves.

**Coming:** the rest of Step 12's slice A (its outpost's room and
courtyard doorway), then its slice B, the chase and the clash.

Three slices, in this order. Push each when it is green, so the level
reaches the phone piece by piece.

1. **The geography and its secrets.** This needs nothing new.
   - Build the six rooms without doors first and prove each one alone (a
     room with no doors stands alone in the check).
   - Then add every door in one push, with the courtyard doorway last.
   - Put crates wherever a throw or a weight needs one.
   - It is playable on the phone with no enemy in it. Signals 1–3 and 7.
2. **The enemies, placed as Step 12's kinds land.** Put its fighter
   through every room first. Then add the heavy, the brute and the ranged
   kinds, each as a kind file plus a tuning set. Signals 4 and 7.
3. **The guarded place, last.** The depot's outpost file, the patrols,
   the hoard and the ways in. Signals 5–7.

**Drop first:**
1. the ranged kind;
2. the tower;
3. the second zero-alarm route;
4. the hidden way under the castle (keep its door out until it works).

**Never cut:**
- a way out of every pocket;
- one hero alone crossing the level;
- three moods for every kind;
- no help without a finished call;
- no reload;
- nothing under `src/` in a commit that adds the level.

## What's open (the lead's to measure and decide)

- **Read in full:**
  - doc 28's level 01 and "A short gameplay contrast test"
    (`docs/design-library/05-world-and-game-expansion-proposals/28-ten-more-gameplay-first-level-designs.md`);
  - in `docs/design-library/02-gameplay-systems/`: `04-world-structure-secrets-and-revisiting.md`,
    `07-stealth-heists-npc-reactions-and-pursuit.md`,
    `08-combat-impact-destruction-and-vehicles.md`,
    `23-the-three-npc-modes-role-consistent-behavior-distress-rage.md`,
    and doc 24's outpost section;
  - doc 12's G-05 to G-07;
  - doc 25's editorial override and its level 02;
  - in the register: D-003 to D-006, D-015 to D-020, D-048, D-055 to
    D-064, D-069 to D-077.

  Docs 15, 25 and 28 are proposals: borrow their shapes, never their
  names.
- **Yours to pick:** the layouts and room sizes; where each secret is;
  the enemies' numbers; the patrol timings (tight enough that the quiet
  route needs timing, loose enough that it exists); what the hoard looks
  like; which deed upsets a bad guy; and whether the refuge holds against
  Step 12's waves and Step 4's guards. Pick the simplest, mark it
  `DRAFT:`, and log it in `docs/decisions-log.md`.
- **Agree before code, and never edit another step's files:**
  - **Step 12:** its kinds, its outpost format, the depot's file, and how
    enemies fight outside an outpost.
  - **Step 2:** three new bodies and their tuning sets, and a throw by a
    person.
  - **Step 4:** three NPC kinds, rule rows for bad-guy witnesses, patrol
    routines, and the eight-people limit.
  - **Step 3:** the courtyard doorway and the vault's door. Also the
    way-out check's time: Step 3's handoff measured about 38 s for five
    rooms, so measure `npm run check` before and after, and tell Step 3's
    lead if six large rooms make it slow.
  - **Step 8:** one atlas line per room, and enemy sprites. The art
    desk's grunt and "heavy brute" were requested (the N03 request,
    items 4 and 5) and are not delivered.
  - **Step 15:** doc 28 links "lower woodland ↔ Iron Quarry". A second
    link to the forest comes later, not now.
- **Which level the owner wants** is still undecided (`docs/vision-gaps.md`,
  "Not decided yet"). Vision Partner raises it; never wait for the answer.

## Feedback signal

Scenarios in `npm run check`, named `step16-*.json`, with no `gate` tag,
each with a control watched to fail; one player unless said.

1. **Joined, with a way out.** Step 3's checks, unchanged, pass with the
   level joined, for every party member. Control: with one end of the
   courtyard doorway removed, the check refuses it.
2. **Across.** Each hero alone walks from the courtyard doorway to the
   far side of the depot, and back by another way. Control: a two-tile
   step on the main way stops it. Record under Measure how many screens
   long the main way is, with the command that counted it (`DRAFT:` at
   least 12).
3. **Secrets.**
   - Each hidden route is reached through a connection the data marks
     hidden. Control: with it made solid, the scenario fails.
   - Each hero's secret is entered by that hero's own moves, and by none
     of the others' (control).
   - One secret is entered another way, by a throw or a stack, and that
     must pass.
   - The "not yet" thing is reached by none of the three heroes alone.
4. **Each enemy kind, present and itself.** Every room except the refuge
   places at least one bad guy, and each kind is in the level. For each
   kind:
   - its mood stays 1 under a hero's hits (control: the same hit upsets
     the shopkeeper);
   - the chosen deed takes it to mood 2, and more of it to mood 3
     (control: without the deed, it stays at 1);
   - from the grappler's same hit, the light one flies farther than the
     heavy one;
   - the heavy one falls to a throw or a slam, not to a punch;
   - the ranged one hits a hero from beyond the hero's reach;
   - the infiltrator cannot lift the brute;
   - a thrown light one knocks down a second bad guy (an `impact` between
     two bad guys).
5. **Zero alarm.** Two scripted routes, each through a different way in,
   take the hoard and leave the depot. No call starts, and everyone in
   the depot stays in mood 1. Control: the same route with one patrol a
   second later is seen, and a call starts.
6. **Caught, then play.** The same depot, but the hero is seen: a call
   completes and a wave walks in. Then:
   - (a) the hero beats everyone who may call, and no new call starts;
   - (b) in another run, the hero takes the hoard, leaves the zone by the
     pit and the cave, and no wave follows.

   Nothing reloads and no room restarts. Control: with the depot's way
   out blocked, (b) fails.
7. **On a phone.** `npm run e2e`, phone-sized page, by touch only: go
   through the courtyard doorway, cross the first room, hit an enemy, and
   get into the depot. The page's own record of what it drew has the
   enemies inside the view. Control: with the doorway removed, it fails.

   The lead also takes screenshots at 844×390 and 390×664 of each room,
   and of the depot in each mood, keeps them in scratch space and
   describes them under Measure. They are for looking at and for the
   owner's taste list, never a grade.

## Stopping condition

The step is done when all of these hold:
- signals 1–7 pass on `main` and live (`npm run check:deployed` exits 0);
- `npm run gates` shows what it showed when the step was claimed;
- `docs/architecture.md`'s "I need to add…" table has a row for a level
  and a row for an enemy kind;
- Step 10's lead has the walk to the level as a beat;
- after `git fetch origin main`, this prints 0 (no commit that added the
  level touched `src/`):

```
git log --format=%H origin/main -- 'content/rooms/quarry-*' 'content/placements/quarry-*' 'scenarios/step16-*' | xargs -r -n1 git show --format= --name-only | grep -c '^src/'
```

**Budget:** three hours from claiming, with slice 1 on the phone within
the first hour. If time runs short, ship the geography with Step 12's
fighter in it (signals 1–3, 7, and 4 for that one kind): that is a level.
Rooms that are not finished are not joined to the kingdom.

## Owns

**New files only**, with exact names agreed in `docs/architecture.md`
when the step is claimed:
- `content/rooms/quarry-*.json` (Step 3's directory and format);
- `content/placements/quarry-*.json` (Step 4's);
- the depot's `content/outposts/quarry-*.json` (Step 12's format);
- three bodies in `content/characters/`, with their sections in
  `content/tuning.json` (Step 2's);
- three NPC kinds in `content/npcs/` and rows in `content/rules/`
  (Step 4's);
- `scenarios/step16-*.json`;
- one touch block wherever `npm run e2e` keeps its cases.

Each new file in another step's directory is agreed with that step's
lead.

**Two edits in other steps' files**, each agreed with Step 3's lead:
- one doorway in `content/rooms/courtyard.json`, between the plates
  (columns 17–19), outside the columns 1–13 Step 3 keeps empty for
  Step 7, and clear of column 15 and of Step 12's doorway;
- one hidden door in `content/rooms/undercroft.json`.

The step builds on Steps 2, 3, 4 and 12 and edits none of their code.

**Four files are shared between steps** (`src/sim/types.ts`,
`src/sim/systems/physics.ts`, `src/client/render.ts`,
`content/tuning.json`). In those, make only small additive edits, after
`git pull --rebase`. This step should touch only `content/tuning.json`,
by adding sections.

## Taste, for the owner after playing

- whether the level is fun to run through;
- whether the enemies feel different from each other, and whether
  sending one flying is an "OHHHH";
- whether the depot's quiet way in makes you proud;
- whether getting caught there is a better time than not;
- whether a quarry is the right place;
- how the enemies and the hoard look.

List these; don't grade them.

## Measure

2026-11-23 15:10 UTC, lead session_017WiGzHt9iJy3caBLkT1Ef4, at e673fa5: `npm run check` green in 77 s; `npm run gates` 5 of 6 (E has no scenario), the number this step must leave unchanged. The heroes' reach, by `simulate()` on `test-body`: jump peak grappler 52.7 px, infiltrator 51.4, flyer 50.0 (124 px with three flaps); boxes 18×30, 10×12, 14×20; run speeds 84, 128, 92 px/s. So the main way steps up at most 2 tiles and gaps at most 2 (`DRAFT:`), and the "not yet" sits at least 10 tiles up.

Slice 1, 2026-11-23 16:10 UTC: the main way (road, ridge, tower, depot) is **248 columns, 12.4 screens**, counted with `python3 -c "import json;print(sum(len(json.load(open(f'content/rooms/quarry-{r}.json'))['rows'][0]) for r in ['road','ridge','tower','depot']))"`. `npm run check` with the quarry joined: see the push 2 commit message.

2026-11-23 16:40 UTC, lead review of slice 1 at 1e35d37 (re-run): `npm run check` green, 224 s (77 s at e673fa5); 40 `step16-*` scenarios; `check:deployed` ok. The way-out check alone, `checkRooms`, takes 97 s with the quarry joined, and runs inside `loadContent()`, so `npm run build` went from 38 s (7500b81) to 93 s. Flagged to the orchestrator for a Step 3 fix; the rooms stay. Push 3, the undercroft way home, deferred.

2026-11-23 17:35 UTC, lead review of slice 2 at 50c584d (re-run): `npm run check` green, 60 `step16-*` scenarios, `npm run gates` 5 of 6, the stopping condition's `src/` count 0. Accepted as built: a third kind `toll-keeper` (no attack: a fighter as keeper punched the hero before they could pay); the toll's rule row names `targetRole: toll-keeper` (the broad row broke `step4-hero-buys` and `step4-hero-fluke-reassured`); the heavy falls to eight punches, not seven, and not to one throw (a slam wears by speed, about 17 against a punch's 34: a slam rule is Step 2's or Step 18's, passed to the orchestrator).

2026-11-23 17:50 UTC, lead probe of the touch crossing (local `npm run e2e`, not committed): the stall at x 174 was the script, not the level. `scripts/e2e/quarry.ts` added the jump finger with a `touchMove`, so the page never saw it go down; started with `touchStart` (as `scripts/e2e.ts`'s two-finger fact does), a phone-sized page held east and tapping jump every 0.7 s crossed `quarry-road` by touch as the grappler into `quarry-ridge`. Fix written into slice 3's brief.

2026-11-23 18:30 UTC, lead review of slice 3 push 1 at 2ca087a (re-run): `npm run check` green, 61 `step16-*` scenarios, gates 5 of 6, no `src/`. The flyer's roof route is zero-alarm; `quarry-road-cross` is green by touch. Found by the builder: the cellar shaft is one-way (no drop-through), so the grappler's cellar route has no quiet way out; nobody but the flyer can cross the yard unseen, because the lookout only turns on the spot on one floor line; only the lookout can reach the horn. Decided: a ledge over the yard's west stretch (rows 8-9, about columns 2-13) in this step's own room file, and the second zero-alarm route on it, as push 3 if time allows.

2026-11-23 18:45 UTC, lead review of slice 3 push 2 at 36d838d (re-run): `npm run check` green, 63 `step16-*` scenarios, gates 5 of 6, stopping-condition `src/` count 0, live current. Caught at the depot: a fight (a thrown patrol drops the lookout mid-call and breaks the horn) and an escape by the tower door. The escape by the pit and cave with the hoard, and a second quiet route, need two edits in the depot room: briefed as push 3.

2026-11-23 19:25 UTC, lead review of push 3 at 9dd3561 (re-run): `npm run check` green, 65 `step16-*` scenarios, gates 5 of 6, stopping-condition `src/` count 0, `check:deployed` ok. Signals 1–6 now pass with two quiet routes (roof, ledge) and three caught outcomes (fight, tower, cellar-pit-cave). Not done, by the step's drop list: the ranged kind, the undercroft way home. After the owner's 18:30 verdict ("findable and recognisable without being told"), one last slice looks at it on a phone.

2026-11-23 19:35 UTC, last slice (`step-16-e-quarry-on-a-phone.md`), builder `session_017WiGzFw42cUL6BQ27o3iz7`: **a phone-sized page now reaches every main-way room by touch** (`npm run e2e`'s `quarry-ridge-cross` and `quarry-depot-in`, 4 of 4 local runs green, about 80 s for the quarry block; control `E2E_TOUCH_BREAK=jump` fails both). The pit and the cave were not visited (a missed chasm jump does reach the pit, and from there the depot's cellar, in one run). What a first-time player sees on an iPhone held sideways (shots in `e2e-out/quarry/`, both ways up; the view is about 15 tiles wide and 7 tall):
- **Courtyard doorway** (`e2e-out/e2e-quarry-road.png`, the road side): the Use button reads "GO IN" and an up arrow sits over the arch; it reads as a way in.
- **Road:** a cave mouth behind you, a crate, and a two-tile rise straight ahead with a ladder-frame on it; it reads as "go east and climb". No enemy in the first screen.
- **Ridge:** the chasm (two tiles) is the first thing past the step, drawn dark with a floor visible below it: reads as a gap to jump, not a death. The shelf and the crawl are out of view, as intended.
- **Tower foot:** brick shaft with staggered planks going up; nothing says "jump here", but the planks plainly climb. Jumping on the spot under the overlap climbs it.
- **Tower top:** a long stone floor and two window slits; the east opening to the depot is off the right edge until you walk.
- **Depot, at the door:** the lookout stands two tiles away facing you, a patrol beside it and the big horn post right behind: **danger reads at once, but at the same moment you are seen** (in one run the horn was already sounding on arrival). The high ledge (row 8) is above the sideways view; upright it shows as a long plank over the yard. The roof is not in view.
- **Depot yard:** the stack (a raised block) and the column-23 hole read clearly; the step blocks the view east.
- **Depot, at the strongroom's front:** the heavy guard is beside you; the strongroom shows only as a hanging stone stub over the floor (its front pillar, rows 8-11); its roof is above the view and **the hoard (column 45) is out of view** until you are inside. The cellar's cracked wall shows as a crack in the dirt below: findable.
- **Wave in:** not caught on camera (in no run did the horn's call finish while the page stood in the depot; once the hero was punched back through the tower door and a depot person followed onto the tower top).

2026-11-23 20:20 UTC, the depot made findable (`step-16-f-depot-findable.md`), builder `session_017WiGzFw42cUL6BQ27o3iz7`, shots from `npm run e2e`'s quarry block (`e2e-out/quarry/`, 844×390):
- **Door view** (`depot-door-side.png`): the hero stands unseen just inside the door; the lookout and its big horn are mid-screen five tiles ahead, the stack behind them. **Danger visible: yes. A way over visible: yes**, the first two ledge steps sit over the hero's head (the high ledge itself is at the view's top edge). **Hoard visible: no** (column 45, about 30 tiles east).
- **Strongroom front**: not reached in this run. The page, seen while walking in, was chased up onto the stack by the lookout and patrol 1 (`depot-strongroom-side.png` shows it there, with both of them and the horn below). **Hoard visible: no**: the hoard did not move (see the handoff note).

## Briefs

- The depot findable (arrive unseen with the danger in view, a hide by the door, the hoard visible): `handoff-prompts/step-16-f-depot-findable.md`, 20:10 UTC, to the phone slice's builder `session_017WiGzFw42cUL6BQ27o3iz7`. Lead's reason: at b0a7d5e a first-time player is seen the moment they enter, so the zero-alarm infiltration is reachable only by script; that is Step 16's own data.
- Last slice, the quarry seen and found on a phone: `handoff-prompts/step-16-e-quarry-on-a-phone.md`, 19:25 UTC, builder `session_017WiGzFw42cUL6BQ27o3iz7`.

- Slice 3 push 3, the depot's west ledge and a way down to the cellar (signals 5 and 6(b) in full): `handoff-prompts/step-16-d-depot-routes.md`, 18:45 UTC, fresh builder `session_017WiGzH5v7n1DfXiS1iFbh6`.

- Slice 3, the depot (signals 5–6): `handoff-prompts/step-16-c-quarry-depot.md`, written 17:30 UTC; slice 1–2's builder declined it at 17:27 (context), so a fresh builder takes it: `session_017WiGzJqD8htNRHozGpJTgb`, launched 17:32 UTC. Measured at fd3f4d5: `npm run check` 41 s, `npm run build` 5 s (Step 3's way-out check fixed at a700081).
- Slice 2, the enemies (signal 4; ranged left out, first to drop): `handoff-prompts/step-16-b-quarry-enemies.md`, written 16:15 UTC, sent 16:40 UTC to slice 1's builder `session_017WiGzFnkhyrpJqJ6xa9vTr`. Step 12 widened `outpost-fight` to any room at 2027994.
- Slice 1, the rooms and their secrets (signals 1–3 and 7's first half): `handoff-prompts/step-16-a-quarry-rooms.md`, hard stop 16:45 UTC; worker `session_017WiGzFnkhyrpJqJ6xa9vTr` (launched 15:11 UTC).

## Open with the owner

## Handoff notes

### Slice 1 (`step-16-a-quarry-rooms.md`), 2026-11-23 16:15 UTC, worker `session_017WiGzFnkhyrpJqJ6xa9vTr`

**Landed:** push 1 (9f59f97: the six rooms alone) and push 2 (the joins: every door, the courtyard doorway `to-quarry`, columns 17-19 rows 6-7). Scenarios `step16-*`: per-room crossings for each hero (18), `step16-across-*` (courtyard to the depot's far side, each hero alone), `step16-back-*` (back another way: the tower's hidden top-west opening, the ridge's shelf, the road, the courtyard), `step16-hidden-cave-*`, `step16-secret-*` (each hero's secret with the other two as controls, and a body sent up onto the flyer's ledge), `step16-not-yet-*`; room control `controls/rooms/quarry-doorway-one-end-missing.json`. Controls watched once are listed in the two commit messages.

**Verified after the deploy (16:32 UTC):** `npm run check:deployed` ok (live runs 78c4959), `npm run check:live` ok, `/debug/errors` holds only check:live's three deliberate errors. One commit from another session (7500b81, a Step 2 scripted check) landed under push 2 in its last rebase, after push 2's own check run; it was not re-checked here.

**Not done:** half of push 2's touch block. `scripts/e2e/quarry.ts` proves by touch that a phone-sized page walks from the start room to the courtyard and up through its doorway into the quarry road (`quarry-in`); crossing the road by touch (stick held east, jump tapped every 0.6 s) stopped at the first two-tile step (drawn at x 174) in its one run and was taken out rather than left failing (`DRAFT:` in the file): the next session should find why the touch hops do not climb a step the scenarios climb. The screenshots of each room at 844×390 and 390×664 were not taken (the e2e saves `e2e-quarry-road.png` only). Push 3 (the undercroft's hidden way home) not started; the cave already has its ledge for it (columns 23-28, row 7; the door goes at column 29, rows 4-6, `to-undercroft`, hidden on the cave side: `HOME3` in the generator below).

**Measured:** `npm run check` 81 s with the rooms alone, **about 3 minutes with the quarry joined** (the way-out check plays every standing place in six big rooms for three heroes): over the 150 s the brief names, told to the lead. The main way: 248 columns, 12.4 screens (command in "Measure").

**How the rooms were made:** a short generator (not committed; in the worker's scratch space) wrote the rows; edit the room files directly from here, each `//` says what is where.

**Atlas lines wanted (Step 8):** all six `quarry-*` rooms are graybox; none has an atlas.

**For the owner to judge by playing** (not asked): whether the run is fun, whether the secrets are findable and satisfying (the ledge, the crawl, the rock and the cellar wall, the hidden openings in the tower and the pit), whether a quarry is the right place.

**Traps met:** spawn numbers in a room file are read in reading order, not by digit; a body nobody plays keeps sliding on landing (the flyer's ledge has a lip so a thrown friend stays on it); the grappler's throw of the heavy rock arrives at 205.7 px/s against the wall's 200.

### Slice 2 (`step-16-b-quarry-enemies.md`), 2026-11-23 17:15 UTC, builder `session_017WiGzFnkhyrpJqJ6xa9vTr`

**Landed:** the kinds `heavy-fighter`, `brute` and `toll-keeper` (data only), their tuning sets, bad guys in every room but the cave (`content/placements/quarry-*.json`), the toll on the road (`road-toll`, `content/rules/quarry.json`), scenarios `step16-present-*`, `step16-toll-*`, `step16-hit-*`, `step16-heavy-*`, `step16-brute-lift-*`, `step16-thrown-fighter-fells-heavy`, `step16-mood-*-hit`, `step16-no-waves-on-the-road`. Measured: the grappler's punch sends a fighter 284 px and a heavy 26 px; the heavy goes down on the eighth punch.

**Measured, worth knowing:** fighters do follow through doors: on the tower top the grappler's punches send both fighters through the hidden top-west opening onto the ridge's shelf, and a hero is followed. The watching fighter at the toll also hits the toll keeper (its swing reaches everything in front of it) and flattens it again and again in `step16-no-waves-on-the-road`. Fight code is Step 12's; not changed.

**Not done:** ranged bad guys (out of scope); the e2e road crossing by touch with longer jump holds (see the commit for whether it was tried).

**Sprites wanted (Step 8):** `heavy-fighter`, `brute`, `toll-keeper`; the toll counter reuses the shop's `counter` look.

**For the owner to judge by playing** (not asked): whether the kinds feel different, whether sending one flying into another is an "OHHHH", whether paying the toll is funny.

### Slice 3 (`step-16-c-quarry-depot.md`), 2026-11-23 18:30 UTC, builder (push 1)

**Landed (push 1, quiet):** `content/outposts/quarry-depot.json` (the depot's horn: only the lookout calls; waves 2, 3, then 3 and a heavy; in at column 61; bound 8), the depot's people and hoard in `content/placements/quarry-depot.json` (slice 2's ids `depot-fighter-1`/`-2` carry on as the two patrols, so `step16-present-depot` is unchanged), `scenarios/step16-zero-alarm-roof.json` (the flyer in and out over the roof, unseen at every tick; control: entering 20 ticks early is seen and a call starts), and the e2e touch fix: `quarry-road-cross` now crosses the road into the ridge by touch.

**Cut:** the second zero-alarm route (the step's "Drop first", item 3). The cellar's shaft is one-way, so the suggested grappler route cannot come back out (`docs/for-the-lead.md`).

**Measured, worth knowing:** the flyer climbs at most about 110 px (jump and three flaps), which barely clears sight's 40 px band over a floor watcher, so the quiet way works only from high starts (the stack's west edge, the roof). The middle stretch (columns 18-23) is hidden from every watcher: the stack and the step block the line.

**For the owner to judge by playing** (not asked): whether the quiet way over the roof makes you proud, whether getting caught is a better time than not, what the hoard should look like.

**Landed (push 2, loud):** `step16-caught-fight` (seen, the call finishes and a wave walks in; the grappler throws the patrol it holds at the lookout mid-call, which knocks the lookout out and breaks the horn; no call for 20 s; control: no throw) and `step16-caught-escape` (seen, a wave walks in, out by the tower door; no wave after and nobody follows; control: the door made solid). The escape is by the tower door, not the cellar (`docs/for-the-lead.md`).

**Not done (push 3, the lead's 18:28 ask; left for the next builder at the hard stop):** a ledge over the yard's west stretch (rows 8-9, about columns 2-13, reached by hops of at most two tiles) in `content/rooms/quarry-depot.json`, and a second zero-alarm route on foot across it. What the next builder needs to know: past the ledge the on-foot hero still has to deal with the strongroom guard. It stands at column 34 looking west and walks in to column 40 looking east, roughly every 14 s. The hoard (column 45) is only safe while the guard is back at the front, and a hero coming from the west reaches the front while the guard faces them. So the route likely needs a time to slip in behind the guard while it walks in, then a wait out of its sight (under the shaft, rows 16-18, is out of its 40 px), then the take while it is back at the front. Or retune the guard's walk in `content/placements/quarry-depot.json`. `scratchpad`-style per-tick sight tracing (`canSee` over `simulate()`'s history) found every window in push 1; worth rebuilding.

### Slice 3 push 3 (`step-16-d-depot-routes.md`), 2026-11-23 19:01 UTC, builder `session_017WiGzH5v7n1DfXiS1iFbh6`

**Landed:** the on-foot quiet way, `step16-zero-alarm-ledge` (the grappler: tower door, two one-way steps, the high ledge at row 8 over the west stretch, down past patrol 1's reach, behind the heavy guard into the strongroom, onto a shelf over its inner stand while it walks back under, the take, the same way out; no call, no hit, every depot person in mood 1; control: the ledge's tiles emptied by a tiles override, same inputs, a call starts at tick 397). Tiles in `content/rooms/quarry-depot.json` only: row 12 columns 3-4, row 10 columns 5-6 and 15-16, row 8 columns 7-17, row 12 column 39, row 11 columns 40-41. Every other `step16-*` scenario unchanged and green.

**Landed (push 2):** the drop to the cellar, a one-tile hole at column 23 (rows 14-15) west of the step, and `step16-caught-escape-cave` (the flyer robs over the roof, is seen, the call completes and a wave walks in, it drops through the hole, leaves by `to-pit` and reaches `quarry-cave`; no wave after and nobody of the depot outside; control: the hole made solid, the flyer never leaves). The grappler (18 px) does not fit and escapes by the tower door. Flags in `docs/for-the-lead.md`.

**Measured, worth knowing:** the grappler's jump rises about 37 px (2.3 tiles), not 3.2: one-tile steps are what it climbs. A body on a one-way step against the west wall (column 2) is pinned and cannot get down to the door: keep steps from column 3. The grappler cannot jump in the strongroom's front doorway (two tiles high): its head hits. Bodies block each other: a grappler standing on the inner step stops the guard walking back. Floor columns of the yard nobody's route stands on (`step16-across-*`, `room-depot-*`, the roof and caught ones): 13, 18, 23, 26 only.

### Last slice (`step-16-e-quarry-on-a-phone.md`), 2026-11-23 19:40 UTC, builder `session_017WiGzFw42cUL6BQ27o3iz7`

**Landed:** `scripts/e2e/quarry.ts` walks a phone-sized page by touch across the ridge (hops, one running jump over the chasm), up the tower (jumps on the spot over the ledges' overlap) and into the depot, with screenshots both ways up of the ridge, the tower foot and top, and the depot at the door, the yard, the strongroom front and 6 s later (`e2e-out/quarry/`); facts `quarry-ridge-cross`, `quarry-depot-in`. `step16-caught-escape`'s `proves` now names the column-23 hole as the narrower heroes' way. The column-23 hole stays open to chasing fighters (`docs/decisions-log.md`).

**No room data changed.** Every findability problem seen is either the camera's height (src, Step 5/8) or drawing; moving the hoard or the lookout would re-time every depot scenario, which this slice's 75 minutes did not allow.

**What needs another step to be findable** (for the orchestrator):
- The depot's lookout sees you the moment you step in from the tower: danger and being seen arrive together. A sight mark or a lookout bark before the call (Step 4/12), or a data move of the lookout east with the depot scenarios re-timed (Step 16 again).
- The strongroom does not read as a building on a phone: only its front pillar shows; it needs walls and a roof drawn (Step 8), and **the hoard needs to be seen from outside** (a window or a glint, Step 8; or the hoard moved west, re-timing the quiet routes).
- The high ledge and the roof (the quiet ways) are above the sideways view at the door; a camera that looks up a little in tall rooms (Step 5) or a drawn hint of the plank's end at the view's top edge (Step 8).
- The tower's climb has no "jump here" cue; it works, but a first-timer may walk back out (Step 8, a ladder look on the overlap).
- Wave in: never photographed; a scripted shot needs the page to survive in the depot for the call (a sideways hide spot near the door would do, Step 16 data).

**Flag, not this slice's:** the first full `npm run e2e` here failed one Step 17 fact, `start-continue-gone` (the list read `["ZZZZ"]`, no message); alone it passed three times (twice with this change, once without), and the next full run was green. A timing flake under the full run's load. After rebasing onto 4022fd6, one full run failed `h1`/`h2` (the server-down facts; the page did not come back within 10 s) and the next was green: the e2e flakes already owed a look (b9cf87c).

### The depot made findable (`step-16-f-depot-findable.md`), 2026-11-23 20:20 UTC, builder `session_017WiGzFw42cUL6BQ27o3iz7`

**Landed:** the lookout moved from column 6 to 11 and now looks east first (3 s), then west (4 s). The horn is just behind it (12), and patrol 1 walks 11-13. A hide `depot-door-hide` sits just inside the door (row 13, columns 1-2). New `step16-door-unseen`: the grappler walks in and stands at column 4 for 7 s, a whole look each way, unseen. Its control, the lookout back at 6, starts a call at tick 274. Re-timed:
- `step16-caught-escape` and `step16-caught-fight`: walk in to column 5 when the lookout turns west; the call completes at 383, not 222.
- `step16-caught-escape-cave`: 160 ticks later from tick 1440, and the flyer turns back as soon as it is seen.
- `step16-zero-alarm-roof`: new control. The old one (walk in 20 ticks early) no longer fails, by design. The new one is the lookout's old look order, which sees the flyer on the stack at tick 390.

Every control was watched to fail: the tower door made solid, no throw, the hole made solid, the ledge emptied, the lookout's turn, the lookout back at 6. All `step16-*` scenarios are green.

**Not done: the hoard stays at column 45.** Every route that takes it (roof, ledge, cave escape) does so from the shaft's foot (columns 42-44). Each column from 38 to 43 broke all three, so moving it means re-scripting those routes' takes and their way out. That is a slice of its own, or a Step 8 window/glint.

**Measured, worth knowing:**
- Sight is centre to centre (`src/sim/npc/sight.ts`).
- The door being out of the lookout's sight and the stack's top being out of its east sight cannot both hold. So the roof route now depends on the lookout looking west while the flyer launches from the stack.
- With the horn west of the lookout, a held patrol thrown east hits the horn first, and the call stops as `signaler-broken`, not `knocked-out`. So the horn sits east of the lookout.
- Patrol 1's swings at a hero near the stack also hit the horn, and three hits break it.

## Step 22 — One stage to clear: an outpost you get through without dying, and a victory screen

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-24 ~00:30 UTC, first-hand to the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`), after an evening playing the live game
on a phone:**

> Let's get one level where there is a whole outpost you need to navigate though without dying. Lots of enemies, alarms, and real way to lose/die, which pushes you back to the entrance to start over. Needs a satisfying victory screen at the end. Stage cleared, with a star rating and some stats (time to clear, enemies defeated, etc)

The same evening, playing (`docs/current-directive.md`, "Status"): *"i seem to
be invincible as hero... and enemies collapse but never die"*. Everything the
core loops built is a system in a place; nothing yet is a run with a start, a
way to lose, an end and a result. This is that, once, in one level.

**The owner, ~00:50 UTC, playing the live game (relayed by the orchestrator):**

> Alarms don't seem to do anything yet. Enemies can't be fully defeated, neither can heros, and enemies don't give chase if you are not right in front of them.

The quarry has no defeat file today (Step 21's rule is live only in the castle
street and the Bandit Camp), the depot's waves drop through the floor gap, and
nobody chases. The chase rule is being fixed engine-wide by
`handoff-prompts/owner-enemies-chase-alarms.md` (it sends this step its quarry
rows, and does not edit the quarry); enemies staying beaten is Part 2 of
`owner-knocked-out-flies-off.md`. **So the first push makes "you can lose here"
true in the quarry.**

**The owner, ~01:05 UTC, playing (relayed by the orchestrator):**

> Alarms should spawn more enemies of increasing strength that come in from the sides

In the stage, each finished alarm brings a row in at both sides of the player.
Each row is stronger than the last (more bodies, then tougher kinds), is
announced, stays under the cap, and the last row repeats. The rule and its data
shape are built engine-wide by `session_017WiGzF31gfYgeWNMA7rnEL`
(`handoff-prompts/owner-enemies-chase-alarms.md`). This step places the entry
points and rows in the quarry's rooms, and fixes the depot's floor-gap fall.
The data shape is agreed by message before either side writes it.

**The owner, ~01:20 UTC, playing (relayed by the orchestrator):**

> Heros should have hearts which can be lost. Once all heros in the party are out of hearts, that's a game over (back to cantina)

This is decided in `docs/plan/step-21.md`, "Hearts" (Step 21's builder builds
it). For this stage, dying means the party running out of hearts. Until the
owner answers the orchestrator's question, the stage sets its own game-over
place (`DRAFT:`): its entrance, hearts full, the stage started over. "Tries" on
the victory screen become game overs, and hearts left is a statistic and a star
condition. Push 1's defeat file (thrown to the road's entrance) still lands
tonight, so the quarry can be lost at all before hearts arrive.

## Goal

A player walks into one outpost level and knows it is a stage: where it
starts, that they can lose, and where it ends. Inside are a lot of enemies and
more than one way to raise an alarm; raise it and more come. Get beaten and
you are back at the entrance and the stage starts over. Reach the end and the
game stops to say so: STAGE CLEARED, a star rating, and what you did (time to
clear, enemies defeated, and more). Then you are back in the world with the
result kept and shown on the level's sign. Two friends can run it together;
one player can clear it alone; every button is a touch on a phone.

## What's decided (by the orchestrator, from the owner's words; each `DRAFT:` is logged in `docs/decisions-log.md` by whoever builds it)

- **The level is the quarry** (`content/levels/iron-quarry.json`: the road,
  the ridge, the tower, the pit, the cave and the depot, off the courtyard's
  doorway; Step 16, closed, `docs/plan-archive.md`): it is the one place that
  is already a whole level to get through (a main way of about 12 screens,
  bad guys in five rooms, a toll, a depot with a lookout, a horn, patrols and
  a hoard, quiet routes and escapes), and nobody is building in it tonight
  (the camp has three builders in it). `DRAFT:` the other answer is the
  Bandit Camp once the vehicles slice has lengthened it.
- **A stage is data** (a new content kind, e.g. `content/stages/<id>.json`):
  its level, its entrance (the room and door a beaten player returns to), its
  end (a place in the last room), what counts for each statistic, and the
  star thresholds. Adding a second stage later is one file. The engine knows
  stages, not the quarry.
- **Losing.** The owner asked for "real way to lose/die, which pushes you back
  to the entrance to start over". Step 21's rule (N knock-downs in a window
  with a bad guy in reach, then seized and thrown out; `content/defeat/`,
  `docs/plan/step-21.md`, its builder `session_017WiGzJWYyVWtYnjFXHko1S`) is
  the way to die: give the stage's rooms a defeat file, do not write a second
  rule. In a stage the throw lands at the stage's entrance, and **the stage
  starts over**: its people back at their posts and whole, its alarms down,
  its doors, breakables and prizes as they were, the run's clock and counts at
  zero, the count of tries one higher. `DRAFT:` with friends, a beaten player
  is back at the entrance at once, and the stage starts over only when no
  player is left inside it (solo: at once). What a player found for good (the
  level's pieces, a power source discovered, a recruit) stays found.
- **This is the owner's own exception to D-019** ("NOT an automatic-reload
  punishment loop") and to `CLAUDE.md`'s "getting caught opens play", for a
  stage he asked for by name: an alarm in the stage still opens a fight or an
  escape, and only being beaten restarts it. Outside a stage nothing changes.
  Vision Partner has his words; do not widen it to the rest of the world.
- **Lots of enemies, and alarms that matter.** More bad guys than Step 16
  placed, of every kind that has a sheet, placed so each of the level's rooms
  asks something different; more than one caller and more than one signal; a
  finished call brings a wave that reaches the player (today the depot's
  waves walk west and drop through the floor gap at columns 51-52 and stay
  there, `docs/plan/step-7.md` builder notes: fix it here). The on-screen cap
  on bodies stays. The quiet routes stay: clearing it unseen is a way to
  play, and worth more.
- **Enemies can be beaten for good within a run** ("enemies defeated" is one of
  the owner's statistics): that rule is being built now as Part 2 of
  `handoff-prompts/owner-knocked-out-flies-off.md` (builder
  `session_017WiGzJC6UCvT2PtVr2dn8v`). Use it; do not write another. Until it
  lands, count knock-outs by a credited player, as the Hall's detector does.
- **The end is a place you reach** at the far end of the depot, seen from a
  distance as the goal (`DRAFT:`; carrying the hoard out is a statistic and a
  star's worth, not the condition, so a player who fights through and one who
  sneaks through both finish).
- **The victory screen.** STAGE CLEARED, large; one to three stars, shown one
  at a time with a sound each; then the statistics, each counting up: time to
  clear, enemies defeated, alarms raised, tries, and whether nobody noticed;
  the hoard carried out if it was. A Continue button under the thumb (`INTENT:`
  there is always a way out: the screen never holds a player; with a friend
  each player dismisses their own). It is a screen for a result: combat keeps
  no numbers over anyone's head (D-020). Art from the approved sheets (P07's
  UI atlas, P05's HUD boards, P04's Hall atlas; `docs/mechanisms/asset-coverage.md`);
  a star with no source is a `DRAFT:` stand-in and a missing-list item (tell
  Vision Partner). The letters: the game has no pixel font yet (MA-02): use
  what the banner queue draws today.
- **Stars are data:** three thresholds per stage, measured from real runs of
  the level by script (a slow clear, a good one, a best one), never guessed.
  `DRAFT:` one star for finishing; two for under a time or with few tries;
  three for that and unseen or with no alarm finished.
- **The result is kept** with a kept game and shown on the level's entrance
  sign and menu row (Step 14 slice A drew those): best stars and best time.
- **Found without being told:** the entrance sign says it is a stage; the
  first room shows the first bad guy and the first signal before either sees
  you; the end is visible before it is reachable.
- **Solo is never locked out; every roster hero can finish.** Measure each of
  the five (the brawler cannot get past the camp's entry step today,
  `docs/plan/step-21.md` "Push 1": check the quarry for the same). A hero who
  cannot get through gets a way, not a notice.

## Open (the lead decides, `DRAFT:`, logged; nothing waits on the owner)

- How many bad guys per room, the wave rows, where the callers stand.
- The star thresholds and which statistics show.
- Whether the run's clock stops while the party plate or the menu is open.
- What a second player joining mid-run does to the counts.

## The signal (re-runnable)

- Scenarios `step22-*` in the real rooms, each with a control: beaten in the
  stage, the player is at its entrance and the stage is as it began (control:
  the stage file switched off, they are thrown out by Step 21's rule and the
  stage is as they left it); with a friend inside, the stage does not start
  over; the end reached raises one `stage-cleared` event whose statistics
  equal what the scenario did (time in ticks, enemies defeated, alarms,
  tries); the stars follow the thresholds at each edge; a wave called in the
  depot reaches the hero; each roster hero gets from the entrance to the end
  alone, by a script that fights and by one that sneaks.
- A real-server check with two connections: both pages get the event and
  their own screen; one dismissing it does not dismiss the other's; a kept
  game keeps the result across a server rebuilt on the same store.
- `npm run e2e`, a phone-sized page by touch: walk in, be beaten, be at the
  entrance with the stick moving the hero; a scripted clear shows STAGE
  CLEARED with its stars and statistics drawn inside the phone's safe area,
  and Continue returns the stick. Screenshots at the e2e's three phone sizes
  committed under `docs/plan/step-22-shots/`.
- `npm run gates` unchanged or better; `npm run check:live` holds the same
  phone fact in a private world.

## Stopping condition

The signal passes on `main` and live, and the lead has looked at the phone
screenshots of the whole run and the victory screen. Whether it is fun, hard
enough and satisfying is the owner's, by playing.

## Owns

`content/stages/**` and its kind; `src/sim/systems/stage-*.ts`;
`src/client/draw/stage*.ts`; `content/rooms/quarry-*.json`,
`content/levels/iron-quarry.json`, the quarry's outposts, decor and
scenarios (`step16-*` are this step's to re-time when its placements move:
count them first); `content/defeat/` files for the quarry's rooms (the kind
and the `defeat-*` systems are Step 21's: ask its builder for a change);
`scenarios/step22-*`; `scripts/e2e/stage.ts`. Shared files (`src/client/main.ts`,
the entrance sign and menu rows of Step 14, the store) by additive edits,
telling the owner named in `docs/architecture.md`. Must not touch: the Bandit
Camp, the castle street, the undercroft (builders are in each tonight).

## Briefs

- `handoff-prompts/step-22-stage.md` (lead, 2026-11-24): five pushes for one builder: lose in the quarry and the waves reach you; a stage and starting over; the end, the result and stars; the victory screen; more enemies and found-without-being-told.
  Holders: builders 1-6 archived at their limits; the seventh from 12:05 UTC (see the brief's top block).

## Builder notes

### 2026-11-24, Step 22 builder (`session_017WiGzHD6TvY2XxEG4B3rJU`), push 1: you can lose in the quarry

- **The depot's waves: measured, not shipped.** A wave walking west from
  column 61 drops through the dip (row 14, columns 51-52) and stands in the
  pocket for ever (traced, tick 600 on); a hero punched west on the far yard
  lands there too. Of Step 7's three fixes: filling or narrowing the gap takes
  away the strongroom's crawl (and a fighter is 14 px wide: a one-tile gap
  still drops it); moving the entry west drops waves into the shaft (columns
  42-44). A one-tile kerb at row 13, column 53 worked (every `step16-*` and
  `step7-*` unchanged; scenario and control kept in my scratch as
  `step22-wave-reaches-hero`), but Step 9's `step9-fades-then-source`
  (landed during this push) has its grappler walk west over the dip, and the
  hop over a kerb puts it past its 80-130 tick window; no earlier jump fixes
  it. So push 1 ships only `leaveCold` 5 / `leaveIdle` 10 (idle waves walk
  off and the bound frees), and the wave reaches the hero in push 5 with the
  chase builder's entries on both sides of the player. Asked of the Step 9
  builder whether it minds a re-timed jump if the kerb is still wanted then.
- **Being beaten in the quarry is uneven:** the road's heavy, the ridge's
  brute and the depot's far yard each knock a still hero off a ledge or into
  a dip out of reach after one fall, so the throw-out comes mostly where the
  floor is flat (the depot's yard sections, the tower). Push 5's placements
  should put seizers where the floor holds the fight.
- **No banner for `thrown-out` on the page yet:** Step 21's
  (`session_017WiGzJWYyVWtYnjFXHko1S`, asked by message). The throw itself
  is seen: the hero lands at the road's doorway.

### Lead review, push 1 (973968f), re-run at 082380b

`npm run build` ok; `npm run check` ok, with `step22-beaten-to-entrance` passing.
Its control, run by me (`content/defeat/quarry.json` set to `"on": false`),
fails with 6 problems. `npm run gates` is 6 of 6, and `npm run check:deployed`
says live is running it. I didn't run e2e (the builder's run had every quarry
fact ok; h1/h2 failed on reconnect, a flake it already knew of). Still open:
the depot's waves still never reach a hero, now owed in the next depot push,
together with the wings' move to [38, 18]. And no banner yet for being thrown
out; that is Step 21's.

### Push 2: a stage, and starting over

- `content/stages/iron-quarry.json`, kind `src/content/kinds/stages.ts`,
  `src/sim/stage.ts` (`restoreStage`), `src/sim/systems/stage-run.ts`; the
  home copy is left out of snapshots by one line in `src/server/game.ts`.
  `docs/mechanisms/stages.md`.
- **People are restored by my own home copy, not `beaten.ts`'s
  `restorePeople`:** it was not on `main` when push 2 was built (checked
  `origin/main` at push 1's landing). Switch when it lands; the brief's
  "don't write a second restore for people" is owed then.
- **Old kept games:** the home copy is built from the placements as a fresh
  world places them, the first tick a stage is seen, so a saved game made
  before push 2 also restores to the files' first state, not to whatever it
  held when push 2 arrived.
- **Not checked by a scenario:** a friend who walks out after the other was
  beaten (the start-over then happens as they leave); the network trap (a
  restore runs only with nobody but the beaten inside, so no page draws
  those bodies at that moment; push 4's e2e looks at it on the phone page).

### Handoff from the first builder (`session_017WiGzHD6TvY2XxEG4B3rJU`), for a cold successor

- **Push 2 landed (d6acfdb) before the lead's 01:34 UTC "don't start push 2"
  reached me** (messages arrived ~20 min late). It restores people with its
  own home copy (`src/sim/stage.ts`), which the brief says belongs to
  `beaten.ts`'s `restorePeople`. The lead decides whether to keep it until
  `restorePeople`/`holdReturns` land or to `git revert d6acfdb`; reverting is
  clean (new files, plus one line each in `src/server/game.ts` and
  `scripts/lib/room-controls.ts`).
- **Traps hit:** `docs/decisions-log.md` (and some screenshots) are
  skip-worktree in a `blob_limit_kb` checkout: not on disk at all
  (`docs/spawn-failures.md` has the command). It conflicts on every rebase
  because everyone appends to its end; keep both sides. Never write files into
  `src/` or `content/` while `npm run check` runs: its script checks rebuild
  from the working tree and fail on half-written work. `main` moves every few
  minutes: rebase right before pushing.
- **The kerb is approved:** Step 9's builder agreed (01:23 UTC) that
  `step9-fades-then-source` may be re-timed for the kerb at [53, 13]
  (grappler started further west), every claim kept; the wings' move to
  [38, 18] goes in the same depot push. The kerb's scenario is described in
  push 1's notes above (the grappler at column 55 striking west, the flyer
  seen at the door; control: kerb removed).
- **Tools:** `node scripts/run-some.ts <regex>` runs only matching scenarios
  (seconds, against `npm run check`'s ten minutes); `node scripts/trace.ts`
  traces one.

### Lead review, push 2 (d6acfdb), re-run at fba6980

`npm run build` and `npm run check` are ok: all three `step22-*` scenarios
pass. The control (`content/stages/iron-quarry.json` set to `"on": false`)
fails `step22-restart-restores` with 4 problems, as it should. `npm run gates`
is 6 of 6. **Kept, although it puts people back with its own copy of where
they started, `stageHome`**, which the brief ruled out. The push is live and
green, and it is the start-over the owner asked for. Reverting it would take
that away while `restorePeople` isn't on `main`. `DRAFT:` it is owed a switch
to `beaten.ts`'s `restorePeople` and `holdReturns` once they land, keeping
`stageHome` only for what `restorePeople` doesn't cover. A cold builder does
this, in the next push after they land. Not checked: a friend walking out
after the other is beaten, and how a restore looks on the page (push 4's e2e).

### Push 3a: the end, the result, the stars (builder `session_017WiGzJb4az7buiHeYEH77B`)

- **Split in two.** 3a (this): `stage-cleared` with its statistics, the
  stars, the best kept and shown. 3b (next): the ten hero runs
  (`step22-each-hero-{fights,sneaks}-{hero}`) and the three threshold runs;
  the star times stay at the push-2 placeholders (good 600 s, best 300 s)
  until 3b measures them, and `step22-stars-edges-*` move with them (their
  seeded `started`).
- **Statistics' sources, as logged:** defeated = distinct people of the
  stage flattened with `by` a played body (the Hall's rule); alarms =
  `outpost-call-completed` of its outposts + town `call-completed` in its
  rooms; unseen = no npc of `side: "bad"` in its rooms ever `canSee` a
  played hero (heist-cargo's test). **Doubt for 3b:** the road's toll-keeper
  is `side: "bad"` and stands on the main way; if every route is seen by
  him, unseen never happens in the quarry. Then either a route past him
  or leaving tolls out of "unseen" (a `DRAFT:` either way).
- **Not on the sign: the time.** `levels.md`'s `INTENT:` "no digit
  anywhere (`t-no-numbers`)" covers the game picture; the sign shows the
  best stars only and the menu row (HTML) the stars and m:ss. Logged.
- **Shots** (a seeded best, page-side, for the picture only):
  `step-22-shots/push3-sign-best-sideways.png`,
  `push3-menu-best-upright.png`. Upright, the courtyard's camera cuts the
  quarry's sign at the left edge: as before this push (the sign is as wide
  as its name).
- **Owed still:** (a) `restorePeople`/`holdReturns` and (b) the
  `game-over` event are not on `main` at 85cbd35; (c) the kerb and the
  wings' move are not done.
- **(a) done in the next push:** `defeated` (beaten for good) now counts,
  not knock-downs (cleared-stats re-scripted: three knock-outs at 208,
  568, 928, clear at 1259; star edges moved with it); `restoreStage` calls
  `restorePeople` first and keeps `stageHome` for the rest. **Not
  scenario-checked:** a gone bandit put back by a start-over (no script
  gets a hero beaten after a defeat for good yet; 3b's fight runs will).
  **The hold is held back:** `holdReturns` on the stage's rooms while a run
  is on breaks `step5-beaten-come-back` (the beaten builder's: its depot
  bandits come back 90 s after the hero walks into the tower, also a stage
  room). Settled the same hour: the beaten builder moved it to the camp
  (400d8ca) and the lead ruled "hold all the stage's rooms"; the hold and
  `step22-beaten-stay-beaten-in-a-run` (control watched failing: stage off,
  `defeated-back` at 6532) land in the same push.

### Lead review, push 3a (d529a1b), re-run at e5f6383+

- `npm run build` and `npm run check` are ok: all nine `step22-*` scenarios pass, including the cleared-stats run and five star edges.
- Control, run by me with the stage set to `"on": false`: `step22-cleared-stats` fails, as it should. No `stage-cleared` event, and the state is null.
- `npm run gates` is 6 of 6.
- Looked at both screenshots:
  - the sign shows the quarry's best stars, 2 of 3 lit, inside the sign board;
  - the menu row shows the stars and 1:15 on the upright phone.
- Open, and now the builder's to settle:
  - The star times are placeholders until push 3b's hero runs.
  - "Unseen" counts the toll-keeper. If no sneaking route can pass him unseen, leave him out (`DRAFT:`). An unseen clear has to be possible: it is the owner's "zero-alarm infiltration".

### The depot push (d): measured, not shipped (builder `session_017WiGzJb4az7buiHeYEH77B`, stopped at ~320k tokens)

For the next builder, all measured on `main` at 6edd8be:
- **Entries that work.** In `content/outposts/quarry-depot.json`, after
  `"entry"`: `"entries": [[13, 13], [20, 13], [33, 13], [40, 13], [49, 13], [55, 13], [61, 13]], "entryAway": 6`
  and an `announce` row. Each stretch of the yard has entries, cut by the
  stack (14-17), the shaft (42-44) and the dip (51-52), so no wave has to
  cross a gap. **No entry on the west stretch's door side:** at [2, 13] a
  wave fighter walked out through the tower door; at [4, 13] one landed on
  top of a hero seen at column 5 (`entryFor` falls back to the farthest
  entry when none is `entryAway` off).
- **Scenario `step22-wave-reaches-hero` (draft).** `step7-waves-reach-the-hero-depot`'s
  flyer and its walk-in (inputs 0-3 and 181-201, x 1). Then she attacks
  every 24 ticks from 205 to 900, standing her ground against patrol 1.
  Result: wave 0 at tick 381 from column 13; both wave fighters near her by
  about 530 (x 105 and 123: widen the `people-at` x to about [54, 130]);
  her hits land on both at 520.
  Control watched failing: with `entries` removed there is no wave body
  near her and no hit.
- **The blocker: `step16-caught-fight`.** The first wave now reaches the
  grappler at about 551 and knocks patrol 1 out of her grip. The second
  call starts around 743, so the 761 throw into the mid-call lookout no
  longer happens. Every other `step7-`, `step16-`, `step22-`, `step9-`,
  `step14-`, `step5-` and `step19-` scenario passed with the entries. Tried
  and failed: throwing patrol 1 at the wave (520-540) and grabbing again
  (690-730) before the 761 throw. The claims need a real re-route, for
  example knocking the wave down first or another body to throw. Never
  weaken them: the scenario's premise (waves never reach you) is what the
  owner asked to change.
- **Not started:** the wings' move to [38, 18], with
  `step9-fades-then-source` re-routed (Step 9's notes). The kerb at
  [53, 13] looks unneeded with these entries, since no wave walks west
  across the dip unless the hero is seen in the far yard.
- **Item (b), unblocked (lead, 04:06 UTC):** Step 21's game over is on
  `main` (`gameOver` in `content/defeat/quarry.json`,
  `step21-heart-game-over-quarry`). `stage-run.ts` still listens only for
  `thrown-out`: also start the stage over on the quarry's `game-over` event
  (hearts back full), with a `step22-*` scenario and control; then tell the
  hearts builder (`session_017WiGzG7mhviEaxroo5GvBv`) so it can switch the
  quarry's throw off.
- **Then 3b:** the ten hero runs and the measured star times.
### The depot push (d), shipped (builder `session_017WiGzEsUx1mHyijtCDT1gt`)

- The previous builder's entries, as measured: `entries` on every stretch,
  `entryAway` 6, and an `announce` row (`DRAFT:` words). The kerb at
  [53, 13] is not placed.
- `step22-wave-reaches-hero` (the flyer at column 5, swinging every 24
  ticks): wave 0 at 381 from column 13, a wave body within x 40-150 at 560,
  her swing lands on `quarry-depot:w0:0`. Control watched failing (no
  `entries`: nobody near her, no hit).
- **`step16-caught-fight` re-routed, every claim and window kept:** holding
  patrol 1, the grappler hops onto the low ledge (columns 3-4, row 12) and
  up to the high one (columns 5-6, row 10). The wave can't reach her there
  (it mills about below and punches itself), and the lookout can't see her.
  At 715-750 she walks off the ledge's east end into its view; its second
  call starts at 756, and the throw at 761 knocks it out at 764 and breaks
  the post at 773. Walk-off ends from 746 to 755 all pass. The low ledge
  alone doesn't work: a wave fighter knocked into her there dropped the
  patrol into the tower door. Control re-run: without the throw the call is
  stopped only at 920, by the scuffle, and the post stands.
- `npm run check` green, gates 6 of 6.

### Item (b), the stage starts over on the game over (builder `session_017WiGzEsUx1mHyijtCDT1gt`)

- `stage-run.ts` also counts a `game-over` whose `room` is a stage room:
  every player it moved goes in `pending`, so the stage starts over on that
  tick. The thrown-out path is kept, so whichever of Step 21's two rules is
  on, the stage starts over.
- `step22-restart-on-game-over` uses `step21-heart-game-over-quarry`'s set-up,
  with the grappler at column 55. At spawn 2 (column 60) the hero stands
  inside the end box and clears the stage at tick 0. Game over at 567, then
  `stage-restarted` tries 1 on the same tick. Both controls were watched
  failing: the pre-change code, and the stage `on: false`.
- Flag, not edited: `step16-caught-escape`'s `proves` still says the first
  wave "walks in at the far east end". Since the depot push it comes in at
  column 13, but its claims all pass.

### Push 4: the victory screen (builder `session_017WiGzEsUx1mHyijtCDT1gt`)

- `src/client/draw/stage.ts`, plus additive edits to `main.ts`, `render.ts`,
  `index.html` (`#stage-continue`) and `audio/index.ts` (`cue`). The writeup
  is in `docs/mechanisms/stages.md`, "The victory screen".
- **Lead, please look at:** `step-22-shots/push4-stage-cleared-{upright-390x664,sideways-667x375,sideways-844x340}.png`
  and `push4-stage-mid-count-upright.png`.
- **Not verified, owed:**
  - The e2e shows the screen page-side (`irreverents.stage.show`, the same
    function the server's event reaches). Nothing walks the whole quarry to
    a real clear on a page. "Both pages get the event" rests on `game.ts`
    sending every event in every snapshot; it is not observed.
  - The e2e's step 1 ("walk in and be beaten: at the entrance, the stick
    moves you") is not written. No beaten-moment shot.
  - Playwright's phones report safe-area insets of 0, so "inside the safe
    area" is checked against the CSS env() rule, not against a real notch.
  - The star is `hall-frame-star` (a framed diamond, not a star): a real
    star is a missing-list item for Vision Partner.
  - Hearts left is not a statistic yet: `stage-cleared` has no such field.

### Handoff from the third builder (`session_017WiGzEsUx1mHyijtCDT1gt`), after push 4

- **Live:** the depot push (f1d1155), (b) (1b8b8d1) and push 4 (e530fa6).
  check:live is ok at e530fa6.
- **Next, by the brief's order:** (c), the wings to depot [38, 18] with
  `step9-fades-then-source` re-timed (no kerb needed now: no wave crosses
  the dip unless a hero is seen in the far yard). Then 3b, then push 5.
- **The lead's additions to 3b (06:04 UTC, after accepting push 4):**
  (1) the owed e2e step: walk into the quarry on the phone page, be
  beaten, end at the entrance with the stick moving the hero; (2) one
  walked clear on a page, so STAGE CLEARED comes from the real
  `stage-cleared` event, not `irreverents.stage.show`. Also, Step 23's
  weapons builder (`session_017WiGzGmHC7ngNDZecPb15v`) is adding a spear at
  quarry-road [8,16] and a bomb at [34,12], put back on a start-over:
  measure the star times after those land.
- **Tools that saved time:** `node scripts/run-some.ts <regex>` takes about
  1 min a run (it loads everything). To try inputs for an existing
  scenario, copy it to `scenarios/zz-try.json` with new inputs, then
  `node scripts/trace.ts zz-try 10` and grep the `event` lines. Delete it
  before `npm run check`. A Playwright script outside the repo needs
  `createRequire(import.meta.url)('playwright')`. The page's
  `irreverents.stage.show(ev)` puts the victory screen up for a look.
- **Trap:** `docs/decisions-log.md` is skip-worktree in this checkout, so
  `git add -A` silently skips it. Run
  `git update-index --no-skip-worktree docs/decisions-log.md` before you
  commit it.

### (c) The wings move (fourth builder, `session_017WiGzEWjmrpsPDvpwxZXir`)

- The source `depot-strongroom` is now at [38, 18], the floor of the hidden
  area under the strongroom. The id is kept. No kerb.
- **Measured: the shaft is no way in from above.** Walking west into it from
  the strongroom floor, the grappler lands on the shaft's one-way platform
  (row 15, columns 42-44) and is walled in at column 41. Physics has no
  drop-through, and the crawl (row 15) is one tile high, which no hero fits.
  So the only way in is the cellar's cracked wall.
- **Re-routed, every claim kept, windows moved:**
  - `step9-fades-then-source`: the walk is `step16-secret-cellar-wall-grappler`'s,
    from cellar spawn 3: grab the rock, throw it at the wall at 330 (it breaks
    at 340), walk east. Flight is taken at 447. A heavy standing on the
    pedestal (bodies pass through each other) hits her east at 471, and the
    orb comes to rest on the low ledge west of her. It fades at 770, and the
    pedestal is lit at 900.
  - Struck west, she was thrown back onto the orb by the rock and took it
    again.
  - `step9-second-power-replaces` (and its control) also walked to [46, 13],
    and both would have passed or failed for the wrong reason. They now take
    the same route. Flight is taken at 447 and the boost pops out. She walks
    on a step and is still flight at 530, then walks back west over the
    boost's orb at 575.
  - The control holds flight over the same walk: no take and no drop in
    0-600.
- **Sweep:** I ran every scenario, looking for `power-*` events of flight or
  `depot-strongroom`. Only those two take it.

### (e) The quarry's throw is off (fourth builder)

- `content/defeat/quarry.json` is `on: false`, as the camp's is. Its
  `gameOver` (the road doorway) is read anyway.
- **Re-routed onto hearts:** each scenario now seeds `world.heartsLost` (the
  grappler 3 left, the infiltrator and the flyer none), so three falls end
  the party.
  - `step22-beaten-to-entrance`: falls, seized and thrown-out become 3
    hearts lost, `game-over-coming` and `game-over` to the road (1299), plus
    no `thrown-out`. The end place and state are the same. Control: the
    quarry's `gameOver` taken out, and the hero is in the cantina.
  - `step22-restart-restores`: game over at 1621, restarted the same tick.
    The 1600/1622 claims are unchanged. Control: the stage `on: false`.
- **`step22-friend-inside-no-restart` could not keep "a in the road at
  1990".** A game over moves every player, so one player is never sent back
  alone. What it proves now: a's grappler loses its last heart (1561) while
  b's flyer still has hearts. There is no game over; a plays on as the next
  member in the depot (the flyer: the "first one again" rule, since b plays
  it). Nothing restarts. Control: b's flyer out too, and the game over moves
  both to the road and restarts the stage.
- **Doubt, logged and not acted on:** a plays the same hero as b there
  (heart-out's "first with hearts again"). That is Step 21's rule
  (`heart-out.ts`), not a bug of this step.

### 3b, part 1: the five heroes, each alone, and the star times (fourth builder)

- **`scripts/stage-bot.ts`**, a measuring tool, not a check. It is a simple
  scripted player that decides each tick from the world and writes its
  presses as a scenario's `inputs`. Usage:
  `node scripts/stage-bot.ts <hero> <fights|walks> [maxTicks] [out.json]`.
  Env `FIGHT_ON_THE_MOVE=1` makes it punch without stopping; `HOP=1 HOP_AT=<px>`
  makes it jump over a bad guy just ahead. A run takes about 20 s. The ten
  `step22-each-hero-*` say in their `//` which command made them.
- **The ten runs** (every placed bad guy, the stage's entrance, spawn 2 on
  the road; all clear on the first try as that hero, with no game over and
  no horn call completed; unseen false in all):

| hero | fights: clear s, knocked flat, defeated, hearts lost | sneaks: clear s, hearts lost |
|---|---|---|
| grappler | 54.0, 12, 3, 0 | 62.0, 2 |
| infiltrator | 38.6, 2, 0, 1 | 41.2, 2 |
| flyer | 51.6, 5, 1, 1 | 52.6, 1 |
| brawler | 58.0, 7, 5, 0 | 60.8, 1 |
| skirmisher | 40.5, 2, 0, 1 | 39.3, 0 |

- **Nobody needed a way made.** The bot's first failures were its own: it
  jumped off ledges into the depot's one-tile cellar hole at column 23, and
  walked into bad guys it could have hopped. Every hero fits the main way.
  The brawler's camp block does not apply here.
- **The star times:** best 45 s, good 60 s (were 600 and 300 placeholders).
  The three threshold runs: best = infiltrator fights 38.6 s, good = flyer
  fights 51.6 s, slow = grappler sneaks 62.0 s (2317, 3094 and 3723 ticks).
  The `step22-stars-edges-*` moved with them (started -1441/-1442 and
  -2341/-2342).
- **Measured after Step 23's spear and bomb landed** (5871f46): they lie on
  the road. The bot never presses grab, so no run uses them.
- **3b part 2, the two e2e steps** (`scripts/e2e/stage.ts`):
  - `stage-beaten-entrance`: by touch from the start room into the quarry
    road and up to column 39, standing there through three heroes' hearts
    (about two minutes). Then GAME OVER, the page at x 49 on the road, and
    the stick moved the hero 64 px. The shot is
    `step-22-shots/push4-beaten-moment-844x390.png`; I looked at it and the
    card is legible. **Not watched failing** (a control would take minutes;
    the scenario `step22-beaten-to-entrance` has one).
    **Not in the suite yet:** inside the full `npm run e2e` it failed. Only
    one hero ran out in its 4-minute wait and there was no card: the bad
    guys are slower to land falls when the machine is loaded. It runs only
    with `E2E_STAGE_BEATEN=1`. **Owed:** make it reliable. Two ways: wait
    on the card rather than a fixed loop, or seed the party's hearts
    low, which a page cannot do today.
  - `stage-cleared-walked`: the page's own hero is set in the depot six
    tiles west of the end, then walks east by the stick, and STAGE CLEARED
    comes from the server's event. Control watched failing: the stick held
    west, and no screen. **DRAFT:** only the depot's last stretch is
    walked on the page. The whole quarry is walked in the scenarios.

### Handoff from the fourth builder (`session_017WiGzEWjmrpsPDvpwxZXir`), after 3b

- **Live:** (c) at 9066ffe, (e) at d1ce641, 3b part 1 at cae9717. 3b
  part 2 (the two e2e steps) is in the push after cae9717.
- **Next, by the brief: push 5** (more enemies, a second caller on the
  ridge, the first screen showing a bad guy and a post, the entrance sign
  saying it is a stage).
  - Then re-record the ten `step22-each-hero-*` with
    `scripts/stage-bot.ts` (the command is in each scenario's `//`). A
    placement change will break them. That is expected: re-record, and keep
    the claims.
  - Then re-set the star times if the clears moved.
  - A hero the bot can't get through is first a bot rule to fix (see "3b,
    part 1"). Only if the hero truly can't get through, a way: a placement,
    a ledge or a crate.
- **Tools:**
  - `node scripts/stage-bot.ts <hero> fights|walks 9000 out.json` (about 20 s).
    To turn its output into a scenario, see the shape of any `step22-each-hero-*`.
  - The bot has a debug watch: `WATCH=<room> WX0=<px> WX1=<px>` prints every
    tick inside that x range.
  - To run one e2e fact module alone: a throwaway script that starts
    `dist/server.cjs` on a port, launches Playwright, and calls the exported
    function (`beatenAtTheEntrance`, `walkedClear`) with a kit
    `{browser, devices, base, fact, errors, out}`.
- **Traps:**
  - `docs/decisions-log.md` conflicts on every rebase (everyone appends):
    keep both sides.
  - `npm run e2e` rewrites shots of other steps; `git checkout` them before
    committing.

### Lead review, owed item (a) (6edd8be), re-run at 002607b

`npm run build` and `npm run check` are ok: all ten `step22-*` scenarios
pass, including `step22-beaten-stay-beaten-in-a-run` (its control was watched
failing by the builder). `npm run gates` is 6 of 6. **Now owed (b):** Step 21's
game over is on `main` (`step21-heart-game-over-quarry` passes, and
`gameOver` is set in `content/defeat/quarry.json`), but `stage-run.ts:101`
still restarts only on `thrown-out`. The stage must also start over on the
quarry's `game-over`; tell the hearts builder once it does.

### Lead review, depot push (d) (f1d1155)

- `npm run build` and `npm run check` are ok, including `step22-wave-reaches-hero` and the re-routed `step16-caught-fight`.
- Control, run by me with `entries`/`entryAway` taken out of `content/outposts/quarry-depot.json`: `step22-wave-reaches-hero` fails, as it should.
- `npm run gates` is 6 of 6.
- Left open:
  - `step16-caught-escape`'s description still says the first wave walks in at the far east end. Its checks pass; the wording is a fix for later.
  - No kerb.
  - The wings have not moved yet.

### Lead handoff (session_017WiGzFrf7N7ZgaqUyjs4Sz → its successor), 2026-11-24 ~05:05 UTC

Written for a cold successor lead. Everything below is on `main`; re-measure
before you quote it.

- **Live and reviewed by re-running:**
  - push 1, losing in the quarry (973968f)
  - push 2, the stage starts over (d6acfdb)
  - push 3a, the end, stats, stars and the result on the sign and menu (d529a1b)
  - owed item (a), beaten bad guys stay gone through a run (6edd8be)
  - the depot push, waves walk in on your stretch (f1d1155)

  Each review is above, with its control.
- **Builder now:** `session_017WiGzEsUx1mHyijtCDT1gt`, the third. The first two
  were archived at their token limits. Its order is at the top of
  `handoff-prompts/step-22-stage.md`:
  1. (b): restart on Step 21's `game-over`, which is on `main`. `stage-run.ts`
     still listens only for `thrown-out`.
  2. Push 4, the STAGE CLEARED screen. **Look at its phone screenshots
     yourself before calling it done.**
  3. (c): the wings move to depot [38, 18], and `step9-fades-then-source` may
     be re-timed.
  4. 3b: the five heroes, fighting and sneaking, and the real star times. If
     no route passes the toll-keeper unseen, leave him out of "unseen"
     (`DRAFT:`, my ruling).
  5. Push 5: more enemies, and found without being told.
- **Other builders this step touches:**
  - hearts and game over: `session_017WiGzG7mhviEaxroo5GvBv`. It keeps
    `content/defeat/quarry.json`'s throw on until Step 22 says it has moved to
    `game-over`.
  - beaten for good: `session_017WiGzEhbdYJQcUhtD2bSLL`.
  - chase and alarms: `session_017WiGzF31gfYgeWNMA7rnEL`.
- **Decisions made here** (logged in `docs/decisions-log.md` or above):
  - Push 2's own restore of people was kept; it later switched to
    `restorePeople`.
  - A run holds **all** of the stage's rooms, so nobody comes back mid-run;
    the beaten builder's scenario moved to the camp.
  - Push 4 was moved ahead of the wings and 3b.
- **Account:** the weekly limit reads `allowed_warning`. The orchestrator
  (`session_017WiGzHhT2apmWHT61rQ65G`) said the owner's priorities go ahead,
  one builder at a time.
- **Messages between sessions arrive up to ~20 min late.** Change direction by
  editing the brief's top block (the builder re-reads it), not by
  mid-push messages.

### Lead review, owed item (b) (1b8b8d1), re-run by the successor lead (session_017WiGzF7NsB3KTwXkWUXE63)

- `npm run build` and `npm run check` are ok, including `step22-restart-on-game-over` and every `step21-heart-*`.
- Control, run by me (`stage-run.ts` as it was before 1b8b8d1, scenario kept): `step22-restart-on-game-over` fails, as it should, with no `stage-restarted` event and tries 0.
- `npm run gates` is 6 of 6.
- Open: both the throw and the game over now start the stage over. The throw goes when the hearts builder switches it off by data, and three `step22-*` scenarios rely on it then.

### Lead review, push 4 (e530fa6), re-run by the successor lead

- `npm run build`, `npm run check` ok; `npm run gates` 6 of 6.
- `npm run e2e`: every `stage-*` fact ok. At all three phone sizes the panel and Continue are inside the view and reachable. `stage-held` is the control: with the screen up, the stick moves the hero 0 px; after Continue, 49.9 px. In `stage-two`, A dismissing does not dismiss B.
- Looked at all four shots myself:
  - STAGE CLEARED is large and legible, the statistics are aligned and Continue sits under the right thumb.
  - Sideways, the panel covers the middle of the screen and leaves the hearts plate visible.
  - **Doubt:** `hall-frame-star` reads as a framed tile, not a star (a `DRAFT:`, and a missing-list item for Vision Partner).
- **Still owed by this step's signal:** the e2e's "walk in, be beaten, be at the entrance with the stick moving the hero". Fold it into 3b, which walks the quarry anyway, together with one walked clear that raises the screen from the real event.

### Lead review, (c) the wings (9066ffe)

- `npm run build` is ok, and every `step9-*`, `step16-*` and `step22-*` scenario passes.
- Control, run by me: the wings' source put back at [46, 13]. `step9-fades-then-source` and `step9-second-power-replaces` both fail, so the re-routed walks really reach the new tile under the strongroom.
- Not seen: the pedestal on a phone at its new place. Push 5's found-without-being-told shots should include it.

### Lead review, (e) the quarry's throw off (d1ce641)

- `npm run build` is ok, and all 86 `step16-*`, `step21-*` and `step22-*` scenarios pass.
- Controls, run by me:
  - The stage set to `on: false`: `step22-restart-restores` and `step22-restart-on-game-over` fail.
  - The quarry's `gameOver` taken out: `step22-beaten-to-entrance` fails.
- **Accepted change of meaning:** `step22-friend-inside-no-restart` now proves that one player's hero running out, while a friend still has hearts, starts nothing over. Under the owner's hearts rule a game over moves the whole party, so the brief's old "a friend still inside" case no longer arises. The signal's line is read that way from now on.

### Lead review, 3b part 1 (cae9717)

- `npm run build` is ok, and all 22 `step22-*` scenarios pass.
- Control, run by me: the end box moved up out of reach (rows 1-2). All ten `step22-each-hero-*` fail.
- All five heroes clear alone, fighting and sneaking, and nobody needed a way made.
- **Ruling, for push 5: an unseen clear must exist.** No run is unseen today: the road's toll-keeper and fighters see the main way. The owner's standard is "the satisfaction of a zero-alarm infiltration", and the step says quiet routes are worth more.
  - Push 5's placements give at least one route that passes the whole quarry with no bad guy seeing a hero.
  - Leave the toll-keeper out of "unseen" if that is the only way (`DRAFT:`).
  - Prove it with a `step22-unseen-clear` scenario, whose `stage-cleared` has unseen true, plus a control.
  - Re-record the ten hero runs with `scripts/stage-bot.ts` if the placements move them.
- **Doubt, for the owner by playing:** the star times (best 45 s, good 60 s) come from a script, and a person on a phone will be slower. They stay `DRAFT:`, and they're one number each in the stage file.

### Lead review, 3b part 2 (2c52391)

- The full `npm run e2e`, re-run by me with `E2E_STAGE_BEATEN=1`: every `stage-*` fact ok, and no other fact failed.
  - `stage-cleared-walked`: STAGE CLEARED came from the server's event, with the page's show called 0 times.
  - `stage-beaten-entrance` passed **inside the full suite** this time. Two heroes ran out, the GAME OVER card was drawn, and the page was in quarry-road at x 4. So it is intermittent, not broken. Making it reliable and putting it back in the suite is in the fifth builder's order.
- Looked at `push4-beaten-moment-844x390.png`: GAME OVER is legible, and so are "Back to the start of Iron Quarry" and "Every heart back". The controls stay visible.

### Lead look, the phone HUD's stars (d2cb96c, the HUD builder's, agreed by message)

- Looked at the fresh `push4-stage-cleared-sideways-667x375.png`. The stars are now pixel stars: gold and filled when earned, empty with a pale edge when not.
- That settles push 4's doubt (the frame tile read as a chest). A real star sprite is still asked of Vision Partner, as a `DRAFT:` stand-in.

### Push 5, part 1: the quiet way, and an unseen clear (fifth builder, `session_017WiGzGTsScxtYSPbqs97N3`)

- **`step22-unseen-clear`:** the infiltrator clears in 2011 ticks (33.5 s) with `unseen` true, 3 stars, no punch, no heart lost, no call even started. Control, watched failing: the scaffold's row 8 emptied by a tiles override, and no clear (the toll's watcher beats it, five hearts lost).
- **The way** (`docs/decisions-log.md`, "The quarry has a quiet way"):
  - road: a one-way scaffold over the toll (rows 11, 9, 8; columns 31-62). The road heavy now looks up the road 2 s in every 7, and the hero waits on the scaffold (6 s) for that turn.
  - ridge: walk to the chasm and drop. The ridge's fighters (36, 40) don't reach column 28.
  - pit: `pit-fighter` moved from column 26 to 16, facing the heavy, both west of the landing.
  - depot: a one-tile step under the hole (row 17, column 23, hole foot widened), steps at columns 25-28, a plank to the roof (row 8, 29-35), and a gantry over the far yard (row 9, 48-60) that drops into the end.
- **Tool:** `scripts/stage-quiet.ts` plays `scripts/stage-routes/quiet-infiltrator.json` and finds the waits itself (about 30 s).
- **Kept:** every `step16-*`, `step7-*`, `step9-*`, `step14-*`, `step21-*` and `step22-*` passes. The first plank (row 8 from column 20) broke `step16-caught-escape-cave`, because the flyer's glide off the roof landed on it, and so did a two-wide cellar step (the flyer's head was in the cellar ceiling). The shapes above are the ones that keep it.
- **Re-recorded:** only `step22-each-hero-fights-skirmisher`, which stopped clearing (2445 ticks now). The other nine still clear with their old inputs.
- **Not yet:** more enemies, the second caller, the first screen, the entrance sign (push 5, part 2). Not looked at on a phone yet.

### Lead review, push 5 part 1, the quiet way (b749ec7)

- `npm run build` is ok, and all 132 `step7/9/14/16/21/22-*` scenarios pass.
- Control, run by me: `content/rooms/quarry-road.json` as it was before b749ec7, with no scaffold. `step22-unseen-clear` fails, with no unseen `stage-cleared`.
- The owner's zero-alarm infiltration now exists in the quarry: the infiltrator, unseen, 3 stars, the toll-keeper included in "unseen".
- No phone shot yet of the scaffold or the gantry. Part 2's shots should include them, with the first screen, the sign and the wings.

### Push 5, part 2a, and a handoff from the fifth builder (`session_017WiGzGTsScxtYSPbqs97N3`)

- **Live:** part 1, the quiet way (b749ec7). Part 2a is in the push after it: the quarry's sign shows three empty stars as soon as the level is named, so it says it is a stage before anyone clears it. Shots: `step-22-shots/push5-sign-stage-*.png` (I looked at both; legible).
- **Part 2 was built in a scratch tree and run, not shipped.** These are the measurements, so a fresh builder doesn't re-derive them:
  - **The road's caller** (the first screen's bad guy and signal). A lookout at [18,14] on the first ledge (looks east 3 s, west 4 s) with a post at [19,14] is in view from the doorway and too far to see the spawn. Outpost `quarry-road`: entries [[14,14],[26,14],[33,12],[41,12],[46,12]], entryAway 6, bound 6, waves F, FF, FH.
    - A high walk takes the quiet way over him: one-way row 13 at columns 13-14, then row 11 at columns 15-30, joining the scaffold's row-11 step. On it every hero is out of his band (dy 57 or more). Climb onto it while he looks east.
    - With him placed, all five `sneaks` runs complete his call at ticks 290-355: `stage-bot` walks the floor in his view. It needs a walks-mode rule: wait at column 10 or less until `road-lookout` faces east, then go up the ledge, the step and onto the high walk.
    - `step16-no-waves-on-the-road` starts at spawn 1 (column 48), so he never sees that hero.
  - **The ridge's caller:** a lookout at [52,7] (looks west 4 s, east 3 s), post [53,7]. Outpost `quarry-ridge`: entries [[49,7],[56,8],[64,9],[70,9],[77,9]], bound 9, waves FH, FFH, BF. **The blocker:** he sees the ridge's main way (columns 46-59), and nobody can pass a turning lookout on his own level: crossing his column is always in front of him. The ten `sneaks` claims ("no horn completed") then fail for every hero on the main way. Two ways out:
    - a way over him, like the road's high walk;
    - the lead changes what `sneaks` means.
    The quiet way is not affected: he can't see the chasm at 28.
  - **The depot:** any bad guy in the far yard moves four checks. I tried a brute at 58 facing west and a heavy at 49 facing east.
    - `step21-heart-game-over-quarry` (Step 21's): the first fall comes at 225, not 463.
    - `step22-restart-on-game-over`: 270, not 567.
    - `step22-cleared-stats`.
    - `step16-caught-escape`: 8 people where it expects 6, and the depot's bound of 8 then leaves room for only two wave bodies.
    West of the strongroom, every spot is on a Step 16 quiet way. Choose one: leave the depot at 4 placed and grow its waves (a brute row), or re-time those four and tell Step 21's owner about theirs.
  - **The pit:** a brute at [5,18] facing east hits the grappler in `step16-mood-heavy-hit`. Facing west at [6,18], toward the hidden cave's wall, it would be behind that walk. Not measured.
  - **The tower** (a heavy at [14,12] facing west, a fighter at [5,18] turning): nothing else broke. It wasn't measured on its own, since the ten runs failed on the road first.
- **Then:** re-record the ten runs (`stage-bot`, the commands in each scenario's `//`). Re-record `step22-unseen-clear` with `scripts/stage-quiet.ts`, adding the road's high-walk segments before "step row 11". Re-measure the star times (the unseen clear is now the fastest run, at 33.5 s). Commit phone shots of the first screen and of the wings' pedestal at depot [38,18].
- **Still owed:** the e2e `stage-beaten-entrance` made reliable inside the full suite (the brief's top block, item 2). Not started.
- **`check:live` after part 1 (b749ec7):** 20 ok and 1 FAIL, `tiers` (the castle street's whistle gauge under live delay). That is the town lane's known flaky fact, being fixed now (59fa3b0). Part 1 touches nothing of the street, so I did not revert.

### Lead review, push 5 part 2a, the sign's empty stars (ffc4585)

- `npm run check` ok, `npm run gates` 6 of 6, re-run by me.
- Looked at `push5-sign-stage-upright-390x664.png`: "Iron Quarry" with three empty stars under its pieces row, legible on the sign board.
- No control: a drawing with no check of its own. It is accepted on the shot.

### Push 5, part 2: the callers, more bad guys, the runs re-recorded (sixth builder, `session_017WiGzFCTDPbq1AGbnZ5Gqx`)

- **Placed** (`docs/decisions-log.md`, "The road and the ridge have callers"):
  - **road:** `road-lookout` [18,14] (east 3 s, west 4 s) and `road-horn-post` [19,14]; outpost `quarry-road` as the fifth builder measured. The high walk: one-way row 13 (13-14) and row 11 (15-30).
  - **ridge:** `ridge-lookout` [52,7] (west 4 s, east 3 s) and `ridge-horn-post` [53,7]; outpost `quarry-ridge` (waves FH, FFH, BF from the tower side, bound 9). **The way over him:** a one-way step at row 5 (41-43) and a walk at row 3 (44-62) to the shelf and the tower-top opening. Row 4 was tried first; a jump from the flat (row 7) lands on it and sent `step16-room-ridge-*` out through the shelf. The walk stops a tile short of the shelf. Even so, `step16-back-grappler`'s jump off the shelf lands on it and it reaches the road door about 40 ticks early. **Re-timed:** its walk west now ends at 1994 (was 2011); it passes at 1990-1998, and every claim is unchanged.
  - **tower:** `tower-heavy` [14,12] facing west and `tower-fighter-3` [5,18] turning every 3 s.
  - **depot:** 4 placed, as before; its second wave is now two fighters and a brute.
  - **pit:** the brute at [6,18] facing west broke `step16-mood-heavy-hit` (it fights the grappler), so I left it out, as ruled.
  - Bad guys now: road 4, ridge 4, tower 4, depot 4 + waves, pit 2.
- **The ten runs, re-recorded** (clear in ticks; all first try, no hero out, no game over):

| hero | fights | sneaks |
|---|---|---|
| grappler | 3248 | 3050 (main way, up the depot's ledge) |
| infiltrator | 2332 (now `HOP=1 HOP_AT=30`) | 2011, the quiet way, unseen |
| flyer | 3186 | 2262, the quiet way, unseen |
| brawler | 3518 (one call completed; fights may) | 3469 (main way) |
| skirmisher | 3049 | 1735, the quiet way, unseen |

- **What the bot learned** (`scripts/stage-bot.ts`, `STAIRS`):
  - Wait by the road door for its lookout to turn east, then climb the high walk (both modes).
  - Walking only: over the ridge's lookout; hop the tower top's two fighters; wait inside the depot door for its lookout to turn east, then climb the door steps onto the high ledge (`step16-zero-alarm-ledge`'s way).
  - The old sneak runs crossed the depot lookout's floor by luck of timing.
- **Small heroes sneak by the quiet way:** on the main way the tower top's fighters punch them through the depot door in front of its lookout, and a hero runs out of hearts.
  - They now run `scripts/stage-quiet.ts scripts/stage-routes/quiet-{infiltrator,skirmisher,flyer}.json`, and every claim is kept.
  - The flyer's route drops straight down the chasm (it floats into the ridge fighters' view otherwise) and flaps up the hole (the new `flap` segment option).
- **`step22-unseen-clear`** re-recorded: 2011 ticks, unseen, 3 stars. **Doubt, for the owner by playing:** the infiltrator's pass over the road heavy is a window of under 6 ticks (`waitStep` 1 found it). He sees the scaffold at exactly his 40 px band edge, whichever way he faces. A wider window would need the scaffold a pixel higher, or the heavy's sight shorter.
- **Star times:** best 45 s (kept), good 56 s (was 60). The `step22-stars-edges-{good,good-over,tries}` moved with them (started -2101/-2102).
  - The threshold runs: fastest 1735 ticks (skirmisher sneaks, 28.9 s), good 3186 (flyer fights, 53.1 s), slow 3518 (brawler fights, 58.6 s).
- **Shots** (`step-22-shots/push5-*`, all looked at, legible): the first screen sideways (the lookout, his horn and his sight band, the hero out of it), the road's and the ridge's high walks, and the wings' pedestal at depot [38,18] sideways and upright.
  - **Doubt:** upright (about 12 tiles wide) the road's lookout is not on the first screen, even three tiles in (`push5-first-steps-caller-upright-390x664.png`). To be, he would stand where his sight reaches the door. Sideways he is.
- **Controls, watched failing:**
  - The end box moved out of reach: all ten runs and the unseen clear fail.
  - The scaffold's row 8 emptied by a tiles override: no unseen clear.
  - The road's high walk (row 11) emptied: no unseen clear, because the road's lookout calls.
  - The ridge's way over (rows 3 and 5) emptied: the grappler's and the brawler's sneaks fail, with the ridge's calls completed.
- **Tool:** `scripts/scenario-trace.ts <id> [every]` prints where a scenario's body goes, tick by tick.
- **Live:** part 2 at 614f9ee (check:deployed ok; check:live 21 ok).
- **Item 2, `stage-beaten-entrance` made reliable: not done. Measured, for the next builder:**
  - The old stand hops to the road's toll flat (column 39), where only the watcher swings: too few falls for the party's 11 hearts. It also only walks back when knocked west of column 36. Knocked east, or up onto the scaffold, the hero waits for ever (defeat.ts's camp stand had the same stall and fixed it with a band and walk-backs).
  - **New risk since part 2:** its hop east (a jump every 0.7 s) can land on the road's high walk (rows 13 and 11) and carry the hero over the toll on the scaffold. That has not been run since part 2; the step is opt-in.
  - **Tried and reverted:** after walking into the road by touch, the page stood its own hero on the depot's west stretch (column 6, in the lookout's sight), with walk-backs. Run alone: 270 s, only one hero out, no card. A blow carried the hero over the stack to column 21, outside the walk-back rule.
  - **What would make it reliable:** seed the party's hearts low (`world.heartsLost`; a page cannot today, so it needs a server hook for check worlds, asked of Step 21's owner), or a stand with a band and walk-backs both ways, as in defeat.ts, among more swingers.

### Lead review, push 5 part 2, the callers and more enemies (614f9ee)

- `npm run build` is ok, and all 171 `step5/7/9/14/16/21/22/23-*` scenarios pass.
- Control, run by me: `content/rooms/quarry-ridge.json` as it was before 614f9ee, with no way over the ridge's caller.
  - `step22-each-hero-sneaks-brawler` and `-grappler` fail; they sneak the main way.
  - The flyer, the infiltrator and the skirmisher pass; they now take the quiet way, as the builder notes.
- Looked at the shots:
  - The first screen sideways shows the road's lookout with his horn on the ledge, the spear and the high walk, all seen from the doorway.
  - The wings' pedestal is in the hidden place under the strongroom, with a heavy patrolling above.
  - Upright, the first screen shows the spear but not the lookout (the builder's weak point 1). It is accepted: the lookout is a few steps on, and sideways is how the game is mostly played.
- **Owed, after the e2e item:** the infiltrator's unseen pass over the road heavy is a window of a few ticks. A person on a phone won't hit that. Widen it (the heavy's glance rhythm or the walk's height) until the window is at least about half a second, and re-record `step22-unseen-clear`.

### Item 1: the pass over the road heavy widened (seventh builder, `session_017WiGzJudo6Zjh95Uh99rkH`)

- **Measured first:** on row 8 the heavy (centre 936,162) sees the infiltrator at dy exactly -40, the edge of his band, for every dx from -112 to +112, whichever way he faces. The old pass crossed dx 0 on the tick he turned.
- **The ruling as written (all of row 8 up to row 7) breaks two heroes.** Row 7 under the flyer's ledge (row 5, columns 50-55) leaves 16 px of headroom. Run against every quarry scenario, only `step22-each-hero-sneaks-{skirmisher,flyer}` failed; the infiltrator, every `step16-*` (zero-alarm and caught-escape-cave included) and the joins at rows 9 and 11 were fine. A re-recorded skirmisher only got through by hopping onto the hidden flyer-ledge and over its pillar.
- **Built instead** (`DRAFT:`, told to the lead; decisions-log "The scaffold has a top plank over the road heavy"): row 8 stays, and a one-way top plank at row 7 (columns 56-62) sits east of the ledge, over the heavy. Up there every hero is out of his band (dy -56). The infiltrator waits at column 51, out of his reach, goes when he turns to look up the road, and hops onto the plank at 56.4 (`hopAt`, new in `scripts/stage-quiet.ts`).
- **The window, by a sweep** (`QSWEEP=8 node scripts/stage-quiet.ts scripts/stage-routes/quiet-infiltrator.json`): every wait from 312 to 395 passes, 84 ticks (1.4 s); before, under 6.
- **`step22-unseen-clear` re-recorded:** 1943 ticks (was 2011), unseen, 3 stars, no call started; its window is now 2004 ticks.
- **Controls, watched failing:** rows 8 and 7 emptied, and no clear (two hearts lost to the toll's watcher, the road's call started). Only the top plank emptied: it clears, but with `unseen` false.
- **Every other scenario passes on its old inputs**, the skirmisher's and the flyer's quiet sneaks too (they stay on row 8, out of his band at dy 43 and 44). Star times unchanged: the fastest run is still the skirmisher's 1735.
- **Shots:** `step-22-shots/push5-road-top-plank-{sideways-844x390,upright-390x664}.png`, looked at: the plank reads as a second timber plank above the walk, over the heavy and his band.
- **Doubt, not changed:** by arithmetic, not run: the flyer's ledge looks reachable today from the west end of row 8 by a skirmisher's jump (48 px up; it rose 56 in the traced run). Its room note says only flapping reaches it. That was already true before this change; logged, not fixed.

### Lead review, item 1, the road's top plank (f6a6ee8)

- `npm run build` is ok, and all 130 `step16/21/22/23-*` scenarios pass.
- Control, run by me (`quarry-road.json` without the top plank): `step22-unseen-clear` fails, with no unseen clear.
- The window, swept by me (`QSWEEP=8 node scripts/stage-quiet.ts scripts/stage-routes/quiet-infiltrator.json`): 84 of the waits pass, 312 to 395 in a row, about 1.4 s. The pass over the heavy is now one a person can make.
- Looked at `push5-road-top-plank-sideways-844x390.png`: the hero is on the top plank, over the heavy, under the flyer's ledge.
- The builder's change to my ruling, a plank at row 7 instead of moving all of row 8, is accepted. It is measured, and it keeps the small heroes' sneaks.

### Item 2: `stage-beaten-entrance` in the full e2e (seventh builder)

- **The hearts seed, test-only** (the lead's preferred way): `GameOptions.checkHooks` in `src/server/game.ts` (additive; set by `src/server/main.ts` from `IRREVERENTS_CHECK_HOOKS=1`, which only `scripts/e2e.ts`'s own server passes). A world named `e2e-hearts-low-…` then starts with the party's first member on one heart and the others out. On Railway the variable is never set, so the name is an ordinary private world, and `check:live` doesn't run the stage facts.
- **Measured first:** stood on the toll flat (column 41) with one heart, the hero was never hit in 4 minutes. The toll's watcher and keeper don't swing without a call; the old walk got its falls because it passed the road's lookout, who called. So the page now walks in by touch and stands its own hero in the lookout's sight (first ledge, column 23), and again whenever a blow carries it off. His waves do the beating. No more hop east, so it can't land on the high walk.
- **Runs:** alone, 4 of 4 green (35-63 s). The full `npm run e2e`: `e2e: ok`, this fact included. Out of opt-in (`E2E_STAGE_BEATEN` is gone).
- **Control, watched failing:** the same step against a server without the hook (11 hearts): one hero out in 4 minutes, no card.
- **Shot:** `push4-beaten-moment-844x390.png` re-taken by the run, looked at: the GAME OVER card, legible.
- **Measuring trap:** a page's `irreverents.world` holds only its own simulation's bodies, not the bad guys it draws (the snapshot had all seven road bodies; the page's world showed only `road-toll`). Look at the snapshot or a screenshot, not that list.

### Lead review, item 2, the beaten e2e in the suite (b592022), and the step closed

- Re-run by me on `main` at the push's tip:
  - `npm run build` ok, `npm run check` ok, `npm run gates` 6 of 6.
  - **`npm run e2e`: 140 ok, none failed**, `stage-beaten-entrance` included (no opt-in): GAME OVER drawn, the page at the entrance.
  - `npm run check:deployed`: live runs the tip of main.
  - `npm run check:live`: ok.
- The test-only hook was read: `IRREVERENTS_CHECK_HOOKS` is set only by `scripts/e2e.ts`'s own server. Without it, the `e2e-hearts-low-` world name is an ordinary private world, so no real player can reach the hook. The control, a server without the hook giving no card in 4 minutes, was the builder's; I did not repeat it.
- **Logged gap (`DRAFT:`, decisions-log "Step 22 closes"):** `check:live` holds no stage fact. The signal's "check:live holds the same phone fact" is met by the full e2e on the same commit live runs, not by a run against the live address.
- **Noted for the owner by playing:** standing still on the road's toll flat, nobody swings. The toll-keeper is a toll, not a fight. Being beaten needs a fighter or a called wave.

**Stopping condition:** the signal passes on `main` and live (above, with the one logged gap). The lead has looked at the phone shots of the whole run: the first screen and its caller, being beaten, the top plank, the wings, the sign and STAGE CLEARED. Whether it is fun, hard enough and satisfying is the owner's, by playing. **Step 22 is closed, 2026-11-24 ~15:55 UTC.**

## Step 15 — A second place, worth coming back to

**Reference.** Plan step; its status line is in docs/plan.md.

## 2026-11-23 19:40 UTC, the owner's verdict after playing: nothing here is briefed

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

The re-plan from these words is `docs/plan/core-loops.md`. It puts the eight
loops the owner names into the three places that exist (the castle town, the
Bandit Camp, the quarry's depot) before any new room, so **this step is not
briefed and waits** behind the eight first playables. When it opens, its
"one thing out of everyone's reach" should be reached by a power of Step 9 or
a hero of Step 13, as the quarry pit's ledge is.

## Why

**Owner (Drive, doc 11, D-003, D-005):**
> D-003 World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub.
>
> D-005 Deep secrets, side areas and discoveries available long after first visitation; re-visitability is core.

**Owner (Drive, doc 04, "Progression by increasing capability"):**
> Certain characters arrive well after a player has passed features where they'd have helped. This is desired rather than a progression flaw.

The library's golden scenario G-03 (doc 12): "early forest area with high
canopy, narrow route and stone barrier … revisiting feels like
rediscovery, not backtracking for an icon collectible."

## Goal

A road leads out of the castle town to a forest, a second place a few
rooms big. You walk there, and whoever is chasing you can follow. On the
first walk you see a gap too low, a canopy too high and a stone gate you
cannot keep open; each gives way to a different hero. One more thing
stays out of everyone's reach, waiting for a power or a hero you do not
have yet. Reaching the deepest spot opens a short way back.

## What's decided

- **Files only: the measure is "engine and content stay separate"**
  (`CLAUDE.md`). Rooms in Step 3's format, things through Step 4's
  placements, checks as scenarios; no commit of this step touches
  `src/`. If a room needs something the game cannot do, build without it
  and tell the lead who owns that part: a finding, never a quiet engine
  edit.
- **The place is a forest** (`DRAFT:` placeholder, D-096): doc 25's
  level 04, a proposal, cut down to a trail, "root tunnels", an "ancient
  stone door" and a "canopy". It is doc 04's own illustration and G-03's
  setup, and needs only tonight's moves and Step 3's parts. Its mentor,
  sage and creatures are left out (D-056, D-058): no new kind of person,
  no sign, arrow or text (D-057). Three to five rooms.
- **You walk there** (D-003): one road room joins a door in the kingdom
  to the forest. A chase can follow, and arriving cools nothing (D-077).
  Hiding places a pursuer cannot get to are rare between levels (D-077):
  `DRAFT:` at most one on the road, as its secret.
- **Three things are seen on the first walk, each closed by the world,
  never by a name check** (D-006): a gap one tile high; a canopy ledge
  above any plain jump; a stone gate open only while its plate is held,
  with only a heavy crate nearby to hold it. A way round by a throw, a
  stack or a friend is the game working (doc 04, "Puzzle design ethos").
  `DRAFT:` the trail itself is open to any one hero alone (D-015).
- **One more thing is beyond all three heroes' own moves** (`DRAFT:`),
  for G-03's "long after first arrival". All three are in the party
  from the first minute, so the three above open by switching hero;
  this one waits for a power (Step 9) or a found hero (Step 13), shut
  and in plain sight.
- **Every pocket has a way out any body can take** (always a way out,
  `CLAUDE.md`; `INTENT:` in the room file's note): a friend can be
  thrown in, and a player can switch hero inside. `DRAFT:` the deepest
  pocket's way out leads to the trail and stays open: G-03's
  "shortcut".
- **Ready for what comes next.** Ids are plain, start `forest-`, and
  never use a proposed name. Each room and hidden area has its own id
  and says whether it is hidden (D-079), for Step 14 to count and keep
  in Step 7's store; this step saves nothing. Rooms use only the kinds
  of tile the format has, so the grassy-ruins atlas on order is one
  `"atlas"` line per room, added by Step 8 (`docs/architecture.md`,
  "Where art plugs in"; S00-01 is a look reference, not an atlas:
  doc 14).

## How to cut it (a suggestion, not a rule)

Two slices at once, in separate files: **the trail** (road and forest
floor, all four things in view), which lands first, and **the insides**
(tunnels, canopy, deepest pocket).

**On `main` first** (all there at 04:55 UTC, 2026-11-23): Step 3's
rooms with doors and a room to take the door (`castle-street`); Step 2's
three heroes, crates and throw. **Still to come, not needed to start:**
Step 3's plates and gates (the gate, the short way) and its way-out
check (signal 1); `npm run e2e` (signal 6); Step 9 or Step 13 (half of
signal 4). Until then build geometry: the gap and the canopy need no
parts. A room with no doors stands alone in the check
(`docs/mechanisms/rooms-and-doors.md`): prove each room doorless, then
add every door in one push.

Drop first: what opens the later thing, then the short way, then the
insides as rooms of their own. Never cut: the road you walk, a way out
of every pocket, no name check, nothing under `src/`.

## What's open (the lead's to measure and decide)

- Read in full: `docs/design-library/02-gameplay-systems/04-world-structure-secrets-and-revisiting.md`;
  `docs/design-library/04-decisions-and-prototyping/25-playable-level-anthology-twelve-irreverent-adventures.md`;
  and, in `docs/design-library/05-world-and-game-expansion-proposals/`,
  `28-ten-more-gameplay-first-level-designs.md` and
  `15-world-atlas-the-kingdom-and-its-hidden-routes-proposed.md`. Docs
  25, 28 and 15 are proposals: borrow shapes, never names. The room
  format is `docs/mechanisms/rooms-and-doors.md`.
- Layouts and room count; which wall of which room takes the door (agree
  it with Step 3's lead, who may prefer to make that edit); what closes
  the later thing (see what Step 9's power or Step 13's hero can do in a
  room; if neither is on `main`, use height or distance); how many
  hiding places on the road a pursuer cannot get to, counted by Step 4's
  rules for moving and seeing. For each: pick the simplest, mark it
  `DRAFT:`, log it in `docs/decisions-log.md`.
- Whether Step 3's check accepts a room only one hero can enter. If it
  does not, make the insides hidden areas of the forest floor and tell
  Step 3's lead.

## Feedback signal

Scenarios in `npm run check`, named `step15-*.json`, each with a control
watched to fail; no gate tag.

1. Step 3's checks, unchanged, pass with the forest joined to the
   kingdom, for every party member once its way-out check is on `main`
   (control: with one end of the kingdom's door removed, it is
   refused).
2. Each hero, alone, walks from the kingdom's door to the trail's far
   end and back; a body that only walks crosses the road (control: a
   one-tile step stops it).
3. The gap, the canopy, the gate: the hero that fits gets in by its own
   moves; each of the others walks up to it and does not. One more
   scenario gets another hero in by a throw or a stack, and must pass.
4. The later thing: each hero, alone, fails to reach it. With Step 9 or
   13 on `main`, the power or the found hero reaches it; without, say so
   under Measure.
5. The biggest hero, started inside each pocket, gets out (control: the
   way out made solid). Once the deepest way out is used, a walking hero
   gets in from the trail; before, it cannot.
6. `npm run e2e`, phone-sized page, touch only: through the new door,
   along the road, into the forest; switch hero; enter the gap (control:
   the door removed).

## Stopping condition

Signals 1–6 pass on `main` and live (`npm run check:deployed` exits 0),
`npm run gates` shows gate B as it was, `docs/architecture.md` has an "I
need to add… a region" row, Step 10's lead has the walk to the forest as
a beat, and after `git fetch origin main` this prints 0 (no commit that
added the forest touched `src/`):

```
git log --format=%H origin/main -- 'content/rooms/forest-*' 'content/placements/forest-*' 'scenarios/step15-*' | xargs -r -n1 git show --format= --name-only | grep -c '^src/'
```

**Budget:** 100 minutes from claiming. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer, land the road and forest floor
with signals 1–3 and list the rest in your handoff note. Unfinished
rooms are not joined to the kingdom.

## Owns

New files only; no new directory, kind file, system or draw file:
`content/rooms/forest-*.json` (Step 3's directory and format),
`content/placements/forest-*.json` (Step 4's), `scenarios/step15-*.json`
and one touch case where `npm run e2e` keeps its cases. It builds on
Step 2's heroes, crates and throw, Step 3's rooms, doors and parts and
Step 4's placements, and edits none of them, except one door in one
existing room file, agreed with Step 3's lead. The four shared files
(`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`) take only small additive
edits after `git pull --rebase`; this step should need none.

## Taste, for the owner in the morning

Whether the trail is fun to run; whether what you cannot reach makes you
want to come back; whether the road feels like a place; whether the deep
spot felt found, not pointed at; the forest as the choice. List these;
don't grade them.

## Measure

*(Lead `session_017WiGzHD8gtSGTegd3n8W4G`, 2026-11-24 ~09:15 UTC, at 1ae9c19; two read-only reads of the library and of the quarry's files.)*

**The draft against the library.** Every D-number it cites exists in doc 11 (`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`) and the D-003, D-005 and doc 04 quotes are verbatim. Corrections, read these in place of the text above:
- D-006 (l.33) is about creative, consistent ability use. "Never a name check" is doc 04's "Puzzle design ethos" (`02-gameplay-systems/04-world-structure-secrets-and-revisiting.md:39`: "Avoid doors which only work because the game checks for a rigid icon match").
- D-015 (l.53) is about co-op challenges and does not say the trail is open to one hero alone; that stays `DRAFT:`, ours.
- D-057 (l.251) is about dialogue and allows "simple icons"; "no sign, arrow or text" is doc 04 "Player awareness and map" (l.51).
- The doc 04 quote is library prose, not an owner decision; doc 04:73 calls its forest "an illustration of revisitation value, not locked content".
- G-03 (doc 12 l.33-37) is quoted as Setup "…" Pass; its Experience line, dropped above, is "long after first arrival, newly recruited character unlocks a deep secret and a shortcut". It names a recruit, not a power; doc 04:19 allows either.
- D-079 is OWNER-FAVORED / STRONG DIRECTION, not CONFIRMED. The register uses the id D-096 three times (l.381, 393, 401); here it means l.381, default use.
- No CONFIRMED decision is contradicted.

**The place: a forest** (`DRAFT:`, `docs/decisions-log.md`, "Step 15: the second place is a forest"). The owner has named no place; the forest has unused owner art (BKG-01 `forest_waterfall`, P10 TRN-01 and TRN-10) and is doc 04's and G-03's own shape.

**A stage is data** (`docs/mechanisms/stages.md`): stage, level, defeat and completion files, no `src/` edit; quarry ids are hard-coded only in `scripts/stage-bot.ts` and `scripts/checks/step14-levels.ts`. The courtyard (30×9) has free floor at columns 6-13 of rows 6-7 for a three-wide enter door, the quarry's `qqq` beside it at 17-19. The later thing defaults to a boulder only the boost lifts (grappler 150, boost 420), pending a measure that a boost survives the walk. Full derivation: the brief.

## Briefs

- `handoff-prompts/step-15-forest.md` (09:20 UTC; builder `session_017WiGzJeF58oqWdt3WEH722`): four pushes, road and trail as a stage → the insides → the guarded spot and the clear → on the phone.

## Open with the owner

## Handoff notes

## Builder notes

*(Builder `session_017WiGzJeF58oqWdt3WEH722`, brief `handoff-prompts/step-15-forest.md`.)*

**Push 1 (road and trail joined, as a stage).** Rooms `forest-road` (48x12,
flat: `step15-road-walks-only`) and `forest-trail` (100x21: the start at the
bottom west, a climb of one-way boughs, the upper trail on row 9, the deep
level rows 15-18 back west to the deepest pocket). The insides are built in
this push too (they are pockets of the one room, not rooms of their own), so
the way-out check plays them now: the root tunnel, the canopy, the gate
chamber, the stone hollow and the deep pocket each get out by a body's own
moves. Level, stage (`end` the deepest pocket; star times are guesses until
push 3), defeat (`gameOver` at the road's doorway), atlas and backdrop files;
the trail's people (two light fighters, a heavy, the brute) and two crates.
Scenarios: `step15-joined`, `step15-each-hero-crosses-{grappler,infiltrator,flyer}`
(recorded by a scratch waypoint walker: courtyard → deepest pocket → courtyard),
`step15-road-walks-only`, `step15-stage-game-over`; controls in each `proves`.

Flags:
- **The lead's decisions-log entry "Step 15: the second place is a forest" is
  not in `docs/decisions-log.md`** (grep at 551684c and after): the brief
  cites it. Mine are the three entries of 2026-11-24 headed "The Bramble
  Forest…", "…short way back…", "…stand-in pictures…".
- **P10's TRN-01 / TRN-10 images are not in the mirror** (only
  `tag-index.csv`, `manifest.json`, the readme): no `tiles/forest.png` can be
  cut. The atlases reuse `tiles/quarry.png`, `DRAFT:`. The backdrop is BKG-01's
  `forest_waterfall` start preview (320x180), screen-pinned, not repeated;
  on a view wider than 320 the sky colour shows to its right.
- **The courtyard's note says columns 1-13 stay clear for Step 7's machine**;
  the brief puts the door at 8-10. A doorway is empty floor to collision, so I
  followed the brief and said so in the room's note; the camp builder and
  Step 22's lead were messaged the diff.
- The infiltrator walking east on the trail walks straight into the crawl (its
  box fits under the mound): the secret finds the small hero. The crossing
  scenario hops onto the mound.
- Full run of a crossing with the grappler is about 90 s of game time: the
  walker waits at each two-tile wall before jumping. A person is faster.

**Push 2 (the insides).** Spawns added inside the three under-floor
pockets and by the hatch (spawn order: 0 the trail by the mound, 1 by the
hatch, 2 tunnel, 3 chamber, 4 hollow, 5 the start, 6 the deep pocket). The
boulder (`content/characters/forest-boulder.json`, weight 300 in
`content/tuning.json`, placed `slab-boulder` at column 74). Pieces
`forest-1`..`forest-5` (`content/completion/bramble-forest.json`).
Scenarios, recorded with the scratch walker: `step15-gap-*`,
`step15-canopy-*`, `step15-hatch-*` and `step15-hatch-friend` (the other way
in), `step15-later-*` and `step15-later-boost`,
`step15-way-out-{tunnel,chamber,hollow}-grappler`, `step15-shortcut-shut`,
`step15-shortcut-opened`, `step15-boost-survives-the-walk` (the measure: a
held power does not fade; only a dropped orb does). Controls named in each
`proves`, watched to fail in one batch. The canopy has no way-out scenario:
it is a bough you walk off. The deep pocket's way out is the crossing
scenarios' climb back up the shaft.

Flags:
- The boulder is a grey box (`color`), no sprite: no new art tonight.
- `step14-all-found-opens-cantina` seeds every level's set complete; the forest's five pieces were added to its seed (as town-7 was), or it went red.
- "One by a throw or a stack": the one proven is a friend on the plate
  (`step15-hatch-friend`); a throw onto the canopy is not scripted.

**Push 2b (the forest's own tiles).** `assets/tiles/forest.png` drawn by
`tools/art/tiles/forest.py` (deterministic; same 128x256 layout as
`quarry.png`, so the atlases' cells are unchanged): grass cap and cobbled
earth cut from P10 TRN-01 (the prefab conversion's `ground_wide.png`), the
one-way ledges are TRN-10's long mushroom cap. Kept from `quarry.png`: inner
corners, tops, unders, the cave/cut-stone regions. TRN-10's crop is in the
repository but skip-worktree in a blob-limited clone: `forest.py` reads it
with `git show`. Measured density about 2.6 source px per art pixel, not
5.6. Shots: `docs/plan/step-15-shots/`.

### Handoff (builder `session_017WiGzJeF58oqWdt3WEH722`, stopped at its budget)

Live: push 1 (518e220), push 2 (841d4a8), and the forest tile sheet (this
commit). **Not built: push 3 and push 4.** What the next builder needs:
- **The walker:** `tools/scenario-bots/` (README there) records a scenario's
  inputs from waypoints in half a second; every `step15-*` was made with it.
  `scripts/stage-bot.ts` is untouched (no stage argument yet).
- **Push 3 plan, measured layout:** the upper trail (row 9 floor) has free
  floor at columns 86-93 (between the hollow's way-out patch 88-89 and the
  shaft 94-98: 90-93 solid floor) for the guarded spot: a lookout facing west
  at about column 91 with its horn at 92, `entries` on both sides (row 8:
  e.g. 44, 62, 80 west; 93 east; the deep level row 18 is another side).
  The thrower (`ranged-fighter`) on the root mound's top (tile [31, 6]) is a
  high spot in view of the trail. The spear's `sources` gets one forest entry
  (`content/weapons/spear.json`, e.g. trail start floor [6, 18]).
  `step15-cleared`: the stage end is the deep pocket box (15-24, 15-18):
  the crossing scenarios already reach [20, 19], so a stage-cleared fact on
  them is close to free. Star times (`good` 120, `best` 80) are guesses: the
  scripted crossings reach the end at 31.9 s (infiltrator), 43.5 s (flyer),
  46.1 s (grappler) from the courtyard, walking only, no enemies.
- **Push 4:** `scripts/e2e/forest.ts` not written. Shots wanted (brief,
  10:10): sideways 844x390 and 750x340, and upright, of the road, the trail
  and each of the three things; three are in `docs/plan/step-15-shots/`.
  `docs/architecture.md` "I need to add… a region" row and the Step 10 beat
  line in `docs/for-the-orchestrator.md` not written.
- `npm run e2e` was run at push 1 (ok, 126); not since (pushes 2 and 2b are
  content and art only).

Taste for the owner (not graded): whether the climb of mushroom boughs at
the start is fun or a chore; whether the visible deep pocket behind the
cracked wall pulls you in; whether the grey boulder says "come back with
something"; whether the trail is too long for a walker (about 45 s).

### Push 3 (second builder `session_017WiGzG4nNVPXPAo2ztGmx3`): the guarded spot and the clear

The guarded spot is the upper trail's east end (`content/outposts/forest-trail.json`): `trail-lookout` at column 91 (west 4 s, east 3 s), `trail-horn` at 92, entries 44, 60, 80 west and 95 east (`entryAway` 8, `bound` 10: six people are placed on the trail; `leaveCold` 5, `leaveIdle` 10 as the depot), rows 1, 2, then a fighter and a heavy. The thrower `trail-thrower` (a `ranged-fighter`) on the root mound's east end, [32, 6], looking west over the climb onto it; measured, he does not block the way over (the grappler walks over him). The spear's forest source `forest-trail-spear` at [6, 18], the trail's floor by the way in. `scripts/stage-bot.ts` is untouched: the clears were recorded with `tools/scenario-bots/walkbot.ts`, which gained `placedRooms`, `world` and `fight` (punch whoever is just ahead; standing, turn to one behind), and `tools/scenario-bots/run-some.ts` runs a few scenarios by id (a minute, against the check's seven).

Scenarios: `step15-cleared` (the grappler fighting: 47.0 s, 4 defeated, 0 alarms, 3 stars, kept as best), `step15-clear-best` (the infiltrator fighting, 29.5 s, one alarm, 3 stars by time), `step15-clear-slow` (the grappler walking, 56.1 s, one alarm, 2 stars), `step15-caught-fight` (seen climbing out of the hollow; the grappler punches the lookout into his horn and breaks it, then beats the wave's fighter), `step15-caught-both-sides` (the flyer seen and not fighting: wave 1's two people walk in one each side). Star times from those runs: good 52 s, best 40 s (decisions-log "The forest's star times"). Controls watched to fail: the end box moved to rows 1-2 (`step15-cleared`); best 25 s (`-clear-best`); good 60 / best 58 (`-clear-slow`); `entries` removed (both `caught` scenarios). `step15-stage-game-over` was re-recorded (same claims, later ticks): the thrower's lobs knocked the first recording's walk back before the fighters.

Flags:
- The flyer, walking or fighting by script, is knocked out on the trail (hero-out at about 42 s) and the grappler takes over: the trail's fighters are a lot for the lightest hero. Measured, not tuned.
- Every scripted clear is `unseen: false`: the lookout faces the only way on. The quiet ways (the flyer over the lookout's 40 px of sight; slipping past while he looks east) are not scripted.
- Stars: two stars is earned by any first-try clear (`stars.tries` 1, Step 22's rule), so "good" only splits two from one after a start-over.

Landed: 4323a15 (the first push of it, 13499e1, never went live: see `docs/process-observations.md`, 2026-11-24 12:45; reverted at b2f3e99, re-pushed unchanged, live at 12:44:54, `check:deployed` ok, `/debug/errors` empty).

### Handoff (second builder `session_017WiGzG4nNVPXPAo2ztGmx3`, stopped near its budget): push 4 not built

- **The e2e case is written, never run:** `tools/scenario-bots/forest-e2e-draft.ts` (its first lines say how to put it in place: move to `scripts/e2e/forest.ts`, one call line after `quarryFacts` in `scripts/e2e.ts`). Facts `forest-in` (control `E2E_FOREST_BREAK=door`: push up at column 14, no door there), `forest-road-cross`, `forest-switch` (Switch tapped until the infiltrator), `forest-climb` (jumps on the spot at column 11.5 to the trail's row 9), `forest-gap` (stick east, no jump, into the root tunnel). Not yet tried against push 3's people: the thrower on the mound at column 32 now lobs at the climb and at the walk to the crawl (it knocks a hero west; the stick keeps pushing east, so it should still get in, unmeasured). Its shots go to `e2e-out/forest/` at the page's size, 750x340 and 390x664.
- **Shots to commit** (`docs/plan/step-15-shots/`): `tools/scenario-bots/shots.mjs` stands the page's own hero at named spots; its "844x390" were 750x340 captures (`devices['iPhone 14 landscape']` is 750x340): give it a true `viewport: { width: 844, height: 390 }` size as well. Wanted: road, trail start, gap, canopy, hatch, the boulder, the guarded spot (column 86), each at 844x390, 750x340, 390x664; and the courtyard's two doors with the quarry's sign beside the forest's, and the start menu's two stage rows.
- **The lead's look defects (12:20 UTC brief block), untouched:** the earth under the grass is still the quarry's orange cobble (`tools/art/tiles/forest.py`: tint and vary it, `DRAFT:`); the backdrop's hard seam (the two 320-wide preview views side by side, `content/backdrops/forest-*.json`); the rectangular "hole" in the dirt is the pockets (crawl, tunnel, chamber, hollow, deep level) showing the sky backdrop through empty tiles. Measured options: backdrops' `wall` is whole-room (it would also cover the open-air trail), so the data way is a `content/decor/forest-trail.json` with `"layer": "far"` items cut from a dark earth cell over each pocket's rectangle (areas in the room's `areas`, plus the crawl row 8 columns 24-29, the shaft 96-98 rows 9-14, the deep level rows 15-18); if decor cannot be that large, that is a finding for the lead, not an engine edit.
- **Docs owed by push 4:** `docs/architecture.md` "I need to add… a region" row; a line for Step 10's lead (the walk to the forest as a beat) in `docs/for-the-orchestrator.md`.
- **The boulder's sprite:** not looked at (no mossy-stone cut chosen); still a grey box.
- `scripts/stage-bot.ts` untouched; nothing to tell Step 22.

### Handoff (third builder `session_017WiGzGVGmfNTRtDB8nX3Np`): push 4a live, push 4b below, push 5 not built (a finding)

- **Push 4a (5779ebc, live):** the forest's own earth (P10's cobbles two tones down to a loam with moss flecks, `tools/art/tiles/forest.py` `forest_earth`), the backdrop without its seam (`assets/backdrops/forest-glade.png`: the preview's first view beside its own mirror), and dark earth behind every pocket underground (`content/decor/forest-trail.json`, 489 `far` items written by `tools/art/tiles/forest_decor.py`; no engine edit). Decor could cover the pockets: no finding there.
- **Push 4b:** `scripts/e2e/forest.ts` in place, called after `quarryFacts` in `scripts/e2e.ts`. Its five facts (`forest-in`, `forest-road-cross`, `forest-switch`, `forest-climb`, `forest-gap`) passed on their own and twice inside the full `npm run e2e` (the second run 139 ok, 0 failed; the first had `cantina-in` red once, green twice alone and in the second full run: a flake, not the forest). Control `E2E_FOREST_BREAK=door` watched failing (`forest-in` false, the page stays in the courtyard). Shots at true 844x390, 750x340 and 390x664 in `docs/plan/step-15-shots/` (courtyard-doors, road, trail-start, trail-gap, root-tunnel, canopy, hatch, boulder, guarded-spot, deep-pocket); `tools/scenario-bots/shots.mjs` now takes true sizes. Not shot: the start menu's two stage rows (the menu lists only places a world has found; a fresh shot world has found neither by walking).
- **Push 5 not built, measured why (for the lead):** an unseen clear needs more than a way past the lookout. Every bad guy on the upper trail faces west for good (`content/placements/forest-trail.json`: fighters at 41 and 43, the heavy at 49, the brute at 62, each `face left, wait 5`; sight 112 px across, 40 px up or down, `content/tuning.json`), and the stage's only way to its end is east along that trail to the shaft (94-98). A guard on your own level who never turns cannot be passed unseen without something solid between you or more than 40 px of height (`src/sim/npc/sight.ts`). The quiet stretch that exists: the crawl and the root tunnel are out of every sight (the mound blocks the thrower); the tunnel's hatch up (36-37) comes out 5 tiles in front of the fighter at 41. Options, each a change to push 3's trail, for the lead to choose: (a) a line of one-way boughs at row 5 from the hatch east over the fighters, the heavy, the brute and the lookout to the shaft (16 px under the canopy's slab at 46-52, so only the infiltrator fits under it: the small one's high way), plus a 2-tile root stump at column 39 so the climb out of the hatch is hidden; this changes the trail's main walk, so the recorded crossings and clears (`mk_cross.py`, `step15-cleared`, the star times) need re-recording; (b) give the trail's guards a turn in their routine and add one bough or stump per guard; (c) accept that the forest is the fight stage and the quarry the stealth one. My lean: (a), recorded with a copy of `scripts/stage-quiet.ts` set to the forest's rooms (it is the quarry's, hard-coded).
- **Still owed:** the boulder is a grey box (no mossy-stone cut chosen); the cave back is night-blue loam, a first guess (taste); `docs/mechanisms/stages.md` already notes two stages.

- **Push 4c (the orchestrator's look at the shots, the lead's 14:40 UTC message):** the loam one step darker and cooler (`LOAM` in `tools/art/tiles/forest.py`); the boulder drawn as a mossy stone cut from P10 TRN-02's large round rock (`tools/art/tiles/forest_boulder.py`, `content/sprites/forest-boulder.json`); every shot retaken with the new earth. `deep-pocket` is now shot at column 27, outside the stage's end box (the old ones stood inside it and showed STAGE CLEARED). `canopy-390x664` is taken from the trail under the canopy (column 47): upright, the camera stops at the room's top and the party plate covers rows 0-2, so a hero on the canopy (rows 1-2) is always under the plate. That is the camera's and the HUD's question, not the forest's. The thin orange vertical lines (`trail-gap-750`, `root-tunnel-390`, `boulder-844`) are sight-band edges: the thrower's band ends 208 px west of him and the lookout's 112 px west of him, and those edges fall where the lines are.
- **Stopped after push 4c at about 250k tokens:** push 5 (the quiet way) is for the next builder, once the lead has picked an option from the push 5 finding above.

### Push 5 (fourth builder `session_017WiGzHUtUjXLziDxPA9ST8`): the quiet way

The lead's option (a), changed where it measured wrong (`docs/decisions-log.md`, "the quiet way's boughs run under a long limb"):
- **Measured first:** a hero's jump rises about 55 px, so a bough line at row 5 under open sky lets anyone jump from it onto the canopy two tiles up, and the 2-tile stump's top (row 7) puts every hero within a jump of the line. Left so, the grappler walks onto the flyer's secret.
- **Built** (`content/rooms/forest-trail.json`): the canopy's slab is now the middle of one long limb (row 3, columns 32-98), one tile over a high line of one-way boughs (row 5, columns 33-95); its west end comes down a tile (row 4, column 32). Only a body at most a tile tall stands on the line (the infiltrator, 12 px), and nobody can jump off it upward. A perch (row 7, column 33) beside the mound climbs onto it; the 2-tile root stump (rows 7-8, column 39) hides the floor between the hatch and the perch from the light fighters.
- **Why the climb is at column 33, not out of the hatch:** climbing beside the stump, the second fighter (43) sees the infiltrator mid-jump (measured); a 3-tile stump under the limb shuts the grappler out of the east trail (the way-out check refused it). Column 33 is 128 px from the nearest fighter, past his 112 px.
- **The canopy's way up** is now the open sky over the root mound (column 31 and west) and a flight east along the limb's top: `step15-canopy-*` re-recorded (`mk_insides.py`, which now writes canopy-flyer's `found` fact itself).
- **Scenarios:** `step15-unseen-clear` (new: the infiltrator, every bad guy placed, stage-cleared at 32.0 s with `unseen` true, no call ever started; control watched failing: the bough at row 5 column 60 removed, seen and a call at tick 1275). Re-recorded: the three crossings (`mk_cross.py`), `step15-cleared` (46.9 s, now 2 defeated: the thrower is knocked into the first fighter), `-clear-best` (30.1 s), `-clear-slow` (49.2 s) (`mk_clears.py`, new), `step15-stage-game-over` (heart lost at 675, game over at 735). Good star time 52 to 48 s. Recorder: `scripts/stage-quiet-forest.ts` (a copy of the quarry's) with `scripts/stage-routes/forest-quiet-infiltrator.json`.
- **Not re-watched:** the clears' old controls (end box moved, best 25, good 60 / best 58); the claims were rewritten from the new runs' own events.
- **Shots** (`docs/plan/step-15-shots/quiet/`, 844x390, 750x340, 390x664; looked at 844 climb and 390 limb): the boughs read as the forest's mushroom caps over the guards; the limb is drawn by the atlas as grass-topped earth, so it reads as an earth shelf more than a branch (a look question, not fixed). e2e: 139 ok, 0 failed (the five forest facts green).
- **Taste for the owner:** whether the long limb over the trail reads as a canopy or as a ceiling; whether waiting at the line's end for the lookout to turn is readable on a phone; the quiet way skips the hatch, the slab and the boulder entirely (the shortest clear).

## Released to a lead, 2026-11-24 08:40 UTC (orchestrator `session_017WiGzHhT2apmWHT61rQ65G`)

Why now: `docs/vision-gaps.md` (refreshed at 9dbd705) ranks row 2 first: "one level is not a world: a second region". The eight core loops of the owner's ~18:30 verdict are all built and live, and the last two full re-runs with nothing red were at 6400b44 and f434f2e. So the heading above ("nothing here is briefed") no longer holds the step back.

For the lead, before any brief:
- **Check this file's D-numbers and its "What's decided" against the library** (the draft's independent review never ran). The library's labels are literal: the atlas regions and the ten level designs are proposals (docs 15, 25, 28); which place to build is yours to choose by default (D-096, `DRAFT:`, a `docs/decisions-log.md` entry in the owner's terms), from what the owner has named or drawn art for. Say in your first report which place and why.
- **Build it out of what exists**, not beside it: hearts and game over (Step 21), a stage that can be lost, cleared and rated (Step 22: the Iron Quarry is the model, and a second place should be a second stage on the menu), alarms whose rows come in from both sides (`content/outposts/` `entries`), bad guys beaten for good, the chase, weapons lying about (Step 23), a machine to hijack (Step 20; guard-vehicle sprites are cut as group `guard-vehicles`, df67f5d, and nothing draws them yet: a second region is where they belong), the thrower of Step 24 once its slice 1 lands, hidden pieces and an explored share (Step 14). A new region that needs engine changes is a sign a primitive is missing: say which.
- **Art:** nothing new is available tonight; use what is cut from the owner's approved plates (`docs/plan/step-8.md`), mark stand-ins `DRAFT:`, and send real needs to Vision Partner (`docs/mechanisms/asset-requests.md`). The look pass of 07:45 UTC (`docs/plan/step-8.md`, "Look pass") counts a grey-box room against you.
- **Who else is in the tree tonight:** the camp (`session_017WiGzGkuNQcsBDa2oWh23s`), the town and the page's drawing under delay (`session_017WiGzHqA8GMgCCLsfWzdzm`), the phone's HUD (`session_017WiGzHxAKbURW5YnQt6bDN`), the Hall gallery's thrower (`session_017WiGzEb3ESHBHGr3vhpB3k`), Step 22's lead (`session_017WiGzF7NsB3KTwXkWUXE63`). A new region's own rooms collide with none of them; its doorway into the kingdom is one shared edit: agree it by message.
- Spawns: model `claude-opus-5-5`, `blob_limit_kb: 150`, one builder at a time unless paths cannot overlap; a builder stops at about 300k tokens. Report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`.

## Lead reviews by re-running

- **Push 1 (518e220), reviewed at 52812dd, 10:10 UTC, by the lead in a detached worktree (diffs not read beyond the courtyard and stage files):** `npm run build` 0, `npm run check` ok (6 `step15-*` scenarios ok, every other scenario ok), `npm run gates` 6 of 6 (B unchanged, 15 scenarios). Control re-watched: `content/defeat/forest.json` without `gameOver` makes `step15-stage-game-over` fail 4 of its claims (the game over lands in the cantina, nothing starts over); restored, it passes. The stopping-condition grep prints 0. e2e not re-run (the builder's run was green; the orchestrator's next full re-run covers it). Open from the builder's flags: the atlas reuses `tiles/quarry.png` because P10's forest rows are not in the mirror: a real ask for Vision Partner (`docs/mechanisms/asset-requests.md`), owed by push 4.
- **Push 2 (841d4a8), reviewed at 155913d, 11:25 UTC, by the lead in a detached worktree:** build 0, `npm run check` ok (all 26 `step15-*` files on disk ok, every other scenario ok, including the edited `step14-all-found-opens-cantina`), gates 6 of 6. Control re-watched: the boulder's weight set to 140 (under the grappler's 150) makes `step15-later-grappler` fail (he grabs it at tick 222); restored, all four `step15-later-*` pass. Noted, not a fault: push 2 edits another step's scenario (`step14-all-found-opens-cantina` gains the forest's five pieces in its seed, as town-7 was added), which is additive and keeps its claim. Still owed: the forest's own tiles (P10 pack, push 3), a throw or stack onto the canopy (only the friend way is scripted), and the boulder is a grey box (push 4 shots will show it).
- **Push 3 (4323a15; first pushed as 13499e1, reverted at b2f3e99 when live did not move for 8 minutes, re-pushed as the same tree), reviewed at c2a3172, 13:05 UTC, by the lead in a detached worktree:** build 0, `npm run check` ok (all 31 `step15-*` files on disk ok, every other scenario ok), gates 6 of 6. Control re-watched: `callers` emptied in `content/outposts/forest-trail.json` makes `step15-caught-both-sides` fail (no wave, nobody in the room); restored, both `step15-caught-*` pass. Live at 4323a15 per `/healthz`. Open, given to the third builder (`session_017WiGzGVGmfNTRtDB8nX3Np`): push 4 (the look defects, the phone case, the shots, the docs) and a quiet way past the lookout (no scripted clear is unseen today).
- **Push 4a (5779ebc, live 13:30 UTC), re-run by the lead at 7d1d395:** build 0, check ok (31 `step15-*` ok), gates 6 of 6. Art and decor data only (`assets/tiles/forest.png`, `assets/backdrops/forest-glade.png`, `content/decor/forest-trail.json`); no control applies. Its look is judged from push 4b's shots.

## Look at the forest's shots, from the orchestrator (session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~14:45 UTC)

By a subagent reading 13 of the 30 shots in `docs/plan/step-15-shots/` at phone size; not by playing. For the lead to weigh, not re-measured:

- **Holds:** no seam behind; dark earth behind every pocket; the road, the trail's start and the courtyard's doors are clean at all three sizes; the banner reads.
- **"Dark loam": partly.** The ground still reads as a warm mid-brown cobble with a bright grass top, not dark.
- **`deep-pocket-844x390` and `-750x340` show only the STAGE CLEARED screen**, so that secret is not shown at either sideways size: retake them.
- **`canopy-390x664`: the hero on the canopy is behind the party plate**, only legs showing.
- **The boulder is a plain grey rectangle** (`boulder-390x664`).
- Seen and left alone, likely the watchers' sight bands (deliberate, Step 19): translucent orange boxes in `canopy-844` and `guarded-spot-844`; thin orange vertical lines in `trail-gap-750` and `root-tunnel-390`. Say in one line if they are something else.
- `trail-gap-750`: a hooded enemy sits under the star and sound buttons, top right.
- **Push 4b (d02ba1d), re-run by the lead at c4872c3, 14:55 UTC:** build 0, check ok (31 `step15-*` ok), gates 6 of 6. e2e not re-run by the lead (the builder's full run: 139 ok, 0 failed, with the `forest-in` door control watched failing; the orchestrator's next full re-run covers it). Shots looked at by the lead (trail-start-844x390, root-tunnel-844x390, guarded-spot-390x664): no quarry cobble, no seam, dark earth behind the pockets. The orchestrator's look (above) found four more: two deep-pocket shots, one canopy shot, an earth tone and the grey boulder, all briefed as push 4c. Push 5 is option (a) (`docs/decisions-log.md`, 14:50 UTC).
- **Push 4c (90d1887), looked at by the lead at 15:00 UTC (boulder-844x390):** the boulder reads as a mossy stone, and the earth is darker and cooler. Art and content only; not re-run (the next push's review covers it). The canopy-upright limit is a camera matter: a hero on rows 1-2 sits under the party plate because the camera stops at the room's top. Reported to the orchestrator; not Step 15's to fix.

## Step 21 — What being beaten costs

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**Owner (Drive, doc 11, D-019, D-081):**
> D-019 Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.
>
> D-081 Like Kirby, taking DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried items. …

Today a beaten hero lies flat for three seconds and gets up where they fell,
having lost nothing, because there was nothing to lose. It also answers Step
18's open question (what happens when enemies win) by default. From
`docs/plan/core-loops.md`, section 7.

**Owner, 2026-11-23 ~23:52 UTC, playing the live game, first-hand (relayed by the orchestrator):**
> Also, i seem to be invincible as hero...

## Goal

A player can see they are in trouble, and losing costs something real that
opens play. The party's faces sit at the top-left; yours changes as you take
blows, and at the edge your hero staggers. Go down in a bad guys' place while
one of them can reach you and he stands over you for a beat (a friend hitting
him stops it), then you are thrown out of the place's doorway: flat for three
seconds, then free. The power you carried is back where you fell; a prize in
your hands is back on its stand. What you broke stays broken and what you
found stays found: walk straight back in. In town, beaten by guards under an
alert, you are thrown into the open courtyard with the alert unchanged and the
chasers walking out after you.

## The signal (re-runnable)

- Scenarios `step21-*` in real rooms: beaten in the camp, thrown out to the
  courtyard, up and able to act, the camp's broken post still broken (control:
  the place switched off, the hero is still inside); a friend's hit stops it
  (control: no friend; a bandit's stray hit does not stop it); the power is
  left behind and the prize is back on its stand, not banked; knocked out in
  the cantina's brawl with a power: still held; in town under an alert, thrown
  to the courtyard, the chasers follow by the same door and after 20 s the
  alert is still up while a guard has the hero in sight (control: alert 0, no
  throw).
- A real-server check with two connections: the beaten player's own page is
  in the landing room and in charge of its body again after the
  acknowledgement (control: the place switched off). It is the `move`
  effect's first run through a browser page (`docs/mechanisms/network.md`).
- `npm run e2e`, a phone-sized page by touch: walk to the camp's fighters
  (past column 20: a hero at column 15 is never touched, by the check's
  measure), then stand; the drawn condition goes fine, hurt, down; then the
  page's room is the courtyard and the stick moves the hero.

## Stopping condition

The signal passes on `main` and live.

## What's decided

- The owner's D-numbers above; D-021 (crowds can overwhelm), D-080, D-082,
  D-088. S-007: no hard game-over. Doc 07, "Consequences that create
  gameplay": "additional combat, confiscation, reputation change, temporary
  exclusion, intensified defenses or an invitation to escape ... consequences
  must be legible and real". G-16: "neither meaningless instant reset nor
  permanent broken save". Doc 18: recovery time must not become the
  difficulty.
- O-006 (defeat and recovery) is OPEN: everything specific below is a logged
  `DRAFT:`, listed under "Decisions made on the owner's behalf".
- Never a reload, never held: free the moment they land; a place with no named
  landing spot throws nobody; one switch per place turns it off, which is
  today's behaviour. No digits.
- D-067, D-068, D-076, D-077: a transition never resets pursuit. Being beaten
  must never be the quickest way to end a chase or leave a heist.

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 21")

- Thrown out, and where: a content kind `content/defeat/<place>.json` (which
  rooms, where a beaten hero lands, the beat before it, on or off, whether
  pursuers follow). Every landing spot is one room away at most.
- A face in three states, not hearts (the approved HUD sheets also draw
  hearts; Step 2's hidden toughness was a `DRAFT:`, not an `INTENT:`).
- The seize is cancelled only by a played body's hit: bandits flatten each
  other constantly (seven times in a measured minute).
- A power is not lost in the cantina's brawl (D-086's own open list includes
  rare gear in a brawl); a found piece is never lost (doc 30 part D with
  D-082, a proposal): each one data switch from the other answer.

## To settle before its brief

- It needs, on `main`: the powers slice's knock-loose push
  (`handoff-prompts/loop-powers.md`, push 3), the heist slice's cargo and its
  put-it-back function (`handoff-prompts/loop-heist.md`, push 4), and the HUD
  plate (`loop-heist.md`, push 2).
- The face reads the hero's wear, which is in the server's `c`; a page does
  not get the server's `c` for its own character. It must come from the
  snapshot's copy, passed into `render` from `src/client/main.ts`: name that
  edit in the brief, behind the hit-prediction builder's work there.

## Open (for the owner, by playing; nothing waits on them)

- Is being thrown out the right cost, or should it sting more?
- Faces, hearts, or nothing on screen at all?

## Owns

New files: `content/defeat/**`, `src/content/kinds/defeat.ts`,
`src/sim/systems/defeat-*.ts`, `src/client/draw/condition.ts`,
`scenarios/step21-*.json`, `scripts/checks/step21-*.ts`,
`scripts/e2e/defeat.ts`; an entry and table row in
`docs/deliberate-designs.md`. Agreed small edits: the snapshot's copy of the
viewer's hero passed to `render` (`src/client/main.ts`), one line in
`src/client/render.ts`. It edits nothing of the powers, heist or rescue
slices and nothing of Step 18's.

## Briefs

None yet. **Waits** for the three pushes named above. The orchestrator writes
its brief from this file and `docs/plan/core-loops.md`, section 7.

## Builder notes

### Push 1 (measure, at 35ee868): how often a hero is beaten today

A throwaway driver in a scratch copy (never committed) ran the real sim on
the real rooms with their placements, solo, one hero at a time. The hero
walks in (camp: to column 23, among the fighters; street: to column 32) and
walks back there whenever knocked more than three tiles away, so it stays
in the fight. Camp: the 90 s window starts at the wave's `outpost-wave`
event (wave 1, 2 or 3 of a natural run: the lookout's calls). Street: the
alert is raised to 1, 2 or 3 by `completeCall` (as the street guard) at the
hero's feet when it arrives, and the window starts there. Three ways of
playing: never strikes; strikes every 0.4 s facing the nearest foe; strikes
every 2 s, facing the wrong way every other strike. After the window the
hero runs (jumping) for the place's door (camp `to-courtyard` by Use; street
west by `to-throne-room`) for at most 40 s.

Each cell: seconds from the window's start to the first `flattened` (— for
never) / how many `flattened` in the 90 s / the longest stretch with no
control (`canAct` false, ticks in a row) / seconds to leave by the door
("out already": a blow had carried the hero out of the street by its east
door during the window; "no": never left in 40 s; "not reached": that wave
never came, because the hero was flattened over and over and the callers
were busy fighting).

| place | level | hero | never strikes | strikes every 0.4 s | strikes every 2 s, half wrong way |
|---|---|---|---|---|---|
| camp | wave 1 | grappler | 8.4 s / 10 / 3.4 s / 6.5 s | — / 0 / 0.8 s / 4.5 s | 18.6 s / 6 / 3.4 s / 4.5 s |
| camp | wave 1 | infiltrator | 2.9 s / 14 / 4.1 s / 2.8 s | 11.3 s / 3 / 3 s / 3.1 s | 2.9 s / 15 / 4 s / 3.1 s |
| camp | wave 1 | flyer | 2.9 s / 11 / 4.2 s / 4 s | — / 0 / 0 s / 4.7 s | 2.9 s / 13 / 3.6 s / 5.7 s |
| camp | wave 1 | brawler | 4.7 s / 9 / 3.1 s / no | 12.7 s / 2 / 3 s / no | 15.5 s / 5 / 3.1 s / no |
| camp | wave 1 | skirmisher | 2.9 s / 18 / 3.8 s / 5.1 s | — / 0 / 0 s / 3.1 s | 2.9 s / 14 / 7.6 s / 4.1 s |
| camp | wave 2 | grappler | not reached | — / 0 / 0.8 s / 4.9 s | 8.2 s / 6 / 3.4 s / 4 s |
| camp | wave 2 | infiltrator | 5.5 s / 13 / 4.1 s / 2.3 s | 1.4 s / 3 / 3 s / 3.1 s | 8.7 s / 15 / 4 s / 2.3 s |
| camp | wave 2 | flyer | 0.9 s / 17 / 3.9 s / 11.2 s | — / 0 / 0 s / 4.9 s | 1.6 s / 13 / 3.6 s / 7.7 s |
| camp | wave 2 | brawler | 4.4 s / 9 / 3.8 s / no | 13.4 s / 3 / 3.2 s / no | 2 s / 2 / 3 s / no |
| camp | wave 2 | skirmisher | 1.1 s / 3 / 3 s / 3.2 s | — / 0 / 0 s / 4.2 s | 7 s / 15 / 7.6 s / 7.9 s |
| camp | wave 3 | grappler | not reached | — / 0 / 0.7 s / 4.9 s | 21.9 s / 7 / 3.5 s / 5.8 s |
| camp | wave 3 | infiltrator | 4.6 s / 11 / 4.5 s / 10 s | 8.6 s / 2 / 3 s / 2.9 s | 6.3 s / 16 / 4 s / 3.3 s |
| camp | wave 3 | flyer | 2.1 s / 16 / 4.5 s / 8.9 s | — / 0 / 0.1 s / 4.9 s | 2.2 s / 13 / 3.6 s / 4.5 s |
| camp | wave 3 | brawler | 1.4 s / 10 / 3.8 s / no | 37.5 s / 1 / 3 s / no | 13.3 s / 1 / 3 s / no |
| camp | wave 3 | skirmisher | 5.6 s / 15 / 3.7 s / 5 s | — / 0 / 0 s / 4.2 s | 3.5 s / 15 / 7.6 s / 2.9 s |
| street | alert 1 | grappler | — / 0 / 0 s / 6.4 s | — / 0 / 0 s / 6.5 s | — / 0 / 0 s / 6.4 s |
| street | alert 1 | infiltrator | — / 0 / 0 s / 3.9 s | — / 0 / 0 s / 4.3 s | — / 0 / 0 s / 3.9 s |
| street | alert 1 | flyer | — / 0 / 0 s / 5.8 s | — / 0 / 0 s / 5.9 s | — / 0 / 0 s / 5.8 s |
| street | alert 1 | brawler | — / 0 / 0 s / 7.7 s | — / 0 / 0 s / 7.7 s | — / 0 / 0 s / 7.7 s |
| street | alert 1 | skirmisher | — / 0 / 0 s / 4.2 s | — / 0 / 0 s / 5 s | — / 0 / 0 s / 4.2 s |
| street | alert 2 | grappler | 12.8 s / 5 / 3.5 s / 7.3 s | — / 0 / 0 s / 6.3 s | 26.4 s / 6 / 3.1 s / 7.3 s |
| street | alert 2 | infiltrator | 10.8 s / 2 / 3 s / out already | — / 0 / 0.3 s / 4.3 s | 11.2 s / 3 / 3.5 s / out already |
| street | alert 2 | flyer | 7.3 s / 7 / 3.8 s / out already | — / 0 / 0 s / 5.8 s | 10.8 s / 12 / 3.5 s / 7.7 s |
| street | alert 2 | brawler | 13.9 s / 5 / 3 s / 8.7 s | — / 0 / 0 s / 6.6 s | 35 s / 3 / 3 s / 10.7 s |
| street | alert 2 | skirmisher | 6.8 s / 2 / 4 s / out already | 72.6 s / 1 / 3.4 s / 5 s | 10.4 s / 11 / 3.8 s / 5.2 s |
| street | alert 3 | grappler | 13.1 s / 6 / 3.4 s / 7.3 s | — / 0 / 0 s / 6.3 s | 22.3 s / 5 / 3.6 s / 6.4 s |
| street | alert 3 | infiltrator | 10.8 s / 4 / 3.8 s / out already | — / 0 / 0 s / 4 s | 11.2 s / 4 / 3.5 s / out already |
| street | alert 3 | flyer | 7.3 s / 8 / 3.8 s / 5 s | — / 0 / 0 s / 5.8 s | 10.8 s / 8 / 3.5 s / 5 s |
| street | alert 3 | brawler | 12.7 s / 6 / 3.4 s / 7.7 s | — / 0 / 0 s / 6.8 s | 23.9 s / 5 / 3.4 s / 7.7 s |
| street | alert 3 | skirmisher | 6.8 s / 11 / 4.2 s / out already | — / 0 / 0 s / 5 s | 10.4 s / 10 / 3.9 s / 5.1 s |

**What it says.**
- **A beating is already possible, and it is not one.** Every hero who
  stands among the camp's fighters, or fights badly, is flattened within
  about 1 to 20 s of a wave and many times a minute (1 to 18); at alert 2
  and 3 in the street, within 7 to 35 s. A hero striking every 0.4 s stays
  up: the grappler, flyer and skirmisher are never flattened in the camp,
  and nobody is in the street; the infiltrator (toughness 80) and the
  brawler (200 but slow, wind-up 0.15 s) still go down one to three times a
  wave in the camp. This differs from the waves builder's measurement
  (`docs/plan/step-7.md:363-367`, nobody knocked down while striking):
  there the hero did not walk back into the fight, here it does, and wear
  carries from the camp's own three fighters before the wave.
- **Alert 1 beats nobody** in the street: its row is empty and the placed
  guard who answers does not fight a hero who has not struck. That is the
  town tiers' design, kept.
- **Escape stays possible.** Every hero that was in the fight left by the
  door within 2 to 11 s of running for it, with at most two blows landing
  on the way, except the brawler in the camp (below).
- **Longest stretch with no control: 3 to 4.5 s mostly, 7.6 s for the
  skirmisher** in the camp (waves 1 to 3, never striking or fighting badly):
  flattened 3 s, up, and launched again before it acts. That is Step 18
  slice B's corner (`docs/plan/step-18.md:352-365`), reported here, not
  fixed; the throw-out takes a beaten hero out of the crowd, so after push 2
  it is bounded by the beat plus `flattenTime`.

**The choice: no tuning change.** The brief's bar ("a hero who keeps
striking well may stay safe; a hero who stands, or fights badly in a third
wave, must go down") is met by today's numbers for all five heroes in camp
wave 3 and street alert 2 and 3, and every hero can still get away. So no
other owner's number is touched and no scenario is re-timed (zero red).
Logged in `docs/decisions-log.md` ("Step 21: no tuning change").

**Flag (not a fix): the brawler cannot get into the Bandit Camp.** From the
spawn and the courtyard door (column 2), the brawler's jump does not clear
the three-tile block at columns 5 to 7 (`content/rooms/outpost.json`, rows
8 to 10): the furthest it reaches is column 3.9 under 200 tries of run-up
and jump timing; the grappler reaches column 19.9 the same way. The brawler
rows above were measured by putting it at column 9. It may be deliberate
(a place only some heroes enter); nobody owns that room file until the
vehicles slice. Sent to the orchestrator; left as it is.

### Push 2 (the rule): stopped before pushing; five other steps' scenarios turn red

Built locally and not pushed (the brief: "If any other step's scenario goes
red, stop and report"): `content/defeat/{outpost,castle-street}.json`,
`src/content/kinds/defeat.ts`, `src/sim/defeat.ts`,
`src/sim/systems/defeat-{seize,throw}.ts` (585, 590), facts `signaler` and
`prize`, scenario `step21-camp-thrown-out` (green: flattened 1009, seized,
thrown at 1068 into the courtyard's camp doorway, up at 1248; the post still
broken; the wave's fighter still inside), and `defeat` added to the room
controls' left-out list (`scripts/lib/room-controls.ts:56`, as each slice
before did).

With it, `npm run check` fails exactly five scenarios of other steps. In
each the hero is knocked flat in the camp or the alerted street while a
fighter or guard stands within reach, which until now was an incidental
three-second nap, and is now a throw-out to the courtyard:

| Scenario | Owner | Thrown out at | What then fails |
|---|---|---|---|
| `step11-chase-blink` | Step 11 (cantina) | 2991, by `street-guard` | `in-room` castle-street at 3000 |
| `step4-tier-away-at-the-most-skirmisher` | town tiers | 3385, by `street-guard` | its run west out by `to-throne-room` at 3605 |
| `step4-tier-cap-holds` | town tiers | 3577, by `castle-street:help1:0` | calls after 3400 (the hero is gone) |
| `step7-caller-tries-again` | waves | 1280, by `camp-fighter-1` | the lookout's later calls and a second wave |
| `step7-waves-reach-the-hero` | waves | 1226, by `outpost:w0:0` | waves 2 and 3 never come (the hero is gone) |

Ways on, for the orchestrator to choose: (a) each owner re-times its
scenario so the hero is not beaten where it does not mean to be (or expects
the throw); (b) a world tuning switch `defeatOn` (default 1, "a control for
the scenarios only" like `outpostSendOn`) does not help, since a scenario
cannot set tuning; (c) the throw only after more than one knock-down in a
row in the place (a data field, `downs`), which keeps a single incidental
nap as it was. My lean is (a): the throw is what Step 21 is for, and these
five were written before it.

Also seen: Step 7's `hall-detect` hangs a "narrow escape" legend on a
throw-out (the hero is gone from the camp with a wave standing, though not
on its own feet). The waves builder's session is inactive; asked through the
orchestrator.

**Landed switched off** (the commit after 7d6cea5): the rule's code and its
two place files are on `main` with `"on": false`, so the game is exactly as
before and `npm run check` is green. The two scenarios that need it on wait
in `docs/plan/step-21-held/` (not run there); move them back to
`scenarios/` and set both files `"on": true` once the five above are settled.

### Push 2, landed on: the orchestrator's (c)

Thrown out only on the `downs`-th fall within `window` (60 s) with a seizer
in reach: the camp 4, the street 2. Measured: the camp's 2 and 3 still turn
`step7-waves-reach-the-hero` red (its hero standing a minute under three
waves falls at 1167, 1801, 2187, 2563...), 4 and 5 keep it and
`step7-caller-tries-again` green; the street's 2 keeps all three town
scenarios green. Both places on; `step21-camp-thrown-out` back in
`scenarios/` (first three falls get up inside; the fourth at 2374, 23 s
after the first, is seized and thrown at 2433). `step21-friend-stops-it`
still waits in `docs/plan/step-21-held/`: with `downs` 4 its timing has to be
found again (next push), as do the other signal scenarios and the Hall's
narrow-escape edit the orchestrator allowed.

## Hearts (the owner, 2026-11-24 ~01:20 UTC): this replaces "N knock-downs, then thrown out"

**The owner, first-hand to the orchestrator, playing:**

> Heros should have hearts which can be lost. Once all heros in the party are out of hearts, that's a game over (back to cantina)

Decided by the orchestrator from those words (`DRAFT:` where marked; each
logged in `docs/decisions-log.md` by the builder who makes it):

- **Every hero in the party has hearts**, drawn on the party plate beside
  that hero's face (the HUD `condition` slot and the plate are where they
  go; the cut `hud-condition-*` marks may serve until a heart is cut from an
  approved sheet: ask the props builders; a heart with no source is a
  `DRAFT:` stand-in and a missing-list item). How many is data per hero
  kind (`DRAFT:` 3).
- **A heart is lost when an enemy puts the hero on the floor** (worn out and
  flattened by a bad guy's or a provoked guard's blows, or by their throw or
  slam): the fall is the unit, so impact still carries combat and nothing
  counts single blows (D-020). `DRAFT:` the other answer is a heart per blow
  landed; keep it one data switch. A friend's hit, a fall, a wall, the
  cantina's brawl (D-086, doc 31: no loss there) cost nothing.
- **A hero with no hearts is out**: they cannot get up as that hero and
  nobody can switch to them; the player is moved to the next party member
  who has hearts (the existing switch, forced), where they stand if that is
  safe, else at the room's way in (`DRAFT:` measure which never traps
  anyone). The plate shows them out.
- **When every hero in the party is out of hearts it is game over**: a GAME
  OVER moment the page draws (the banner queue; a held beat, `INTENT:` it
  never holds a player longer than the beat and one tap skips it), then
  every player of that game is in the cantina with the whole party's hearts
  full. What was found for good stays found (pieces, discovered levels and
  power sources, recruits, the Hall's legends); a carried prize goes back to
  its stand (`returnPrize`), a held power stays where it fell, alerts and
  waves end. The party is shared by everyone playing (D-012, D-013), so
  hearts and game over are the party's, not one player's: with two players
  each playing one hero, a hero out leaves that player on the next member
  with hearts, and game over comes only when none is left.
- **Where a game over sends you is data per place** (`DRAFT:`): the cantina
  by default, as he said. Step 22's stage sets its own (his words for that
  stage, an hour earlier: "pushes you back to the entrance to start over"):
  the orchestrator has asked him which he wants there; until he answers the
  stage restarts at its entrance with hearts full.
- **Hearts come back** in the cantina (walk in: full) and at a game over.
  `DRAFT:` nothing else restores one yet (a pickup is a later data kind).
- **What this does to the rule already live** (`content/defeat/`, ebfd824:
  thrown out after 2 knock-downs in a minute in the street, 4 in the camp):
  the count of falls becomes hearts on the hero, everywhere a bad guy can
  floor you, not per place and not per minute; the seize-and-throw to the
  doorway is no longer what losing is. Keep the code that is right (the
  fall detection, `returnPrize`, the cross-room `move`), retire the place
  files' `downs` and `window` by leaving them read but unused (never remove
  a shipped field), and say in the notes what was kept. The five other
  steps' scenarios that flatten a hero must stay green or be listed to the
  orchestrator before any re-time.
- **Signal:** `step21-heart-*` scenarios, each with a control: a fall to an
  enemy costs one heart and a fall to a friend costs none; the last heart
  moves the player to the next member; the last member's last heart is game
  over, everyone is in the cantina with full hearts, the prize is back on its
  stand; a kept game keeps hearts across a server rebuilt on the same store;
  two connections: both pages draw the same hearts and both get the game
  over. Phone e2e by touch: hearts drawn inside the safe area, one lost, then
  game over and the stick moves the hero in the cantina.

### Push 3: the face shows each fall

Built and landed while the hearts decision above was being written: the
shields are the interim it allows ("the cut `hud-condition-*` marks may
serve"); the hearts builder replaces `conditionOf` with the hero's hearts.

`src/client/draw/condition.ts` fills the plate's condition slot with the
cut shields (fine, hurt, down) from the server's copy of the viewer, and
queues the place's banners. `scripts/e2e/defeat.ts`: by touch the slot went
fine > hurt > down, the page was thrown to the courtyard and its stick moved
the hero. Seen in its screenshots and fixed: the Hall hung "Out of Bandit
Camp by a hair" on the throw, over the throw's own banner (`hall-detect`,
the orchestrator's go; `step21-throw-is-no-escape`). **Left for the next
builder:** the stagger and stars at the edge; `step21-friend-stops-it`
(held), `-prize-goes-back`, `-friend-keeps-playing`, `-town-thrown-out`,
`-cantina-no-throw`, `step21-nobody-is-held-*`; the two-connection
`scripts/checks/step21-defeat.ts`; `check:live` for the e2e facts; the power
scenarios once powers push 3 lands.

## Builder notes: Hearts (`handoff-prompts/hearts.md`)

### Push 1: hearts in the sim, and they are lost

`content/hearts.json` (3 each, `per` "fall"), `World.heartsLost`,
`heart-lose` (580), fact `hearts`, scenarios `step21-heart-lost-to-a-bandit`
and `step21-heart-none-in-the-brawl`, check `step21-hearts` (two
connections, a kept game). No other step's scenario changed colour (nothing
acts on hearts yet). Found while building: the cantina's regulars carry no
`c.npc`, so they are no enemy by the person test alone; the cantina line in
the test is for a guard who follows a hero in. Not yet measured: how long
each hero lasts at wave 3 and alert 3 (the brief's open "brawler and
grappler may take more"); 3 each stands until that measurement.

### Push 2: out, and the next member

`heart-out` (582, server's world only), `switch` and `firstFreeMember`
skip an out member. Counted reds before choosing the numbers: with 3
hearts each, two scenarios turned red, `step7-waves-reach-the-hero` (Step
7's) and `step21-camp-thrown-out` (mine): in both the grappler falls
exactly four times (1167, 1801, 2187, 2531; 1009, 1579, 1994, 2374), so at
three it is out and the rest of the run is someone else. The brief's open
"the brawler and the grappler may take more" answered from push 1's table:
both 5, the rest 3, and every scenario is green with no re-time. Signal:
`step21-heart-out-next-member`, `-two-players`, `-switch-skips-out`, check
`step21-out-spot`, each with a control watched failing.
Re-timed (mine to, a `step21-*` scenario; written by the risk builder after
I started): `step21-throw-is-no-escape`, its thrown-out tick to 2089 (2944 before hearts and the chase change; the chase builder made it 1927).
Its flyer's third fall (1601) is its last heart, so its player goes on as
the grappler, whose fall at 2030 is the camp's fourth. Control re-watched:
hall-detect's thrown-out test removed, the legend hangs at 2089.

### Push 3: game over

`heart-game-over` (588), `World.gameOver`, `gameOver` in hearts.json and
(optional) in a place file (the quarry's: its road), the cantina refill,
the page's card (`src/client/draw/game-over.ts`; screenshots looked at, 390
by 664 and 844 by 390: the subtitle first overflowed the upright view, now
fitted). Signal: `step21-heart-game-over`, `-game-over-quarry`,
`-refill-in-cantina`, checks `step21-game-over-drops` and
`step21-game-over-two`, each with a control watched failing. Not shown by
touch yet (push 4's phone e2e): a page's own GAME OVER after real falls.

### Push 4: seen on a phone

`src/client/draw/hearts.ts` (rows under each face, the pop, the greyed
out face), the cut hearts from the props builder (asked; it had already
cut `hud-heart-full`/`-empty`, 9×8), sounds `heart-lost` and `game-over`.
Screenshots looked at (390×664, 844×390: two of the grappler's five lost,
the infiltrator out). e2e by touch (`scripts/e2e/defeat.ts`):
`hearts-drawn` (every face's row full, the plate inside the view) and
`hearts-one-lost` (the viewer's row goes down and a heart pops). The game
over by touch comes with push 5: until the old throw is off, a hero
standing in the camp is thrown out on its fourth fall before the party is
out (measured: grappler falls at 1184, 1609, 2041, 2473, thrown 2532).

### Push 5: retire the old rule (in parts)

Reds counted before any change (all scenarios, the throw off by data):
the street alone, none; the camp too, three: `step21-camp-thrown-out` and
`step21-throw-is-no-escape` (mine) and `step23-thrown-out-leaves-it`
(Step 23's: its `thrown-out` and courtyard facts). Sent to the
orchestrator. Landed: the street off. Kept: `returnPrize`, the `move`,
`landingSpot` (a place's `gameOver`). Dormant where a place is off:
`defeat-seize`, `defeat-throw`, `c.falls`, `c.seized`, `thrown-out`.
Waiting: the camp (Step 23's scenario), the quarry (Step 22's start-over
on `game-over`).

### Hearts: flags and what was not verified

- `check:live` after push 5a: one failure, Step 23's `weapon-hit-quick`
  (the star drawn 154 ms after the tap, limit 150), a live-latency timing
  fact; not hearts. `check step20-machine` fails about one run in four
  with hearts off too (seen three times here).
- Not watched: a failing control for the e2e facts `hearts-drawn` and
  `hearts-one-lost` (each control is a full e2e run).
- Not yet by touch: a game over on a phone. It needs the camp's throw off
  (waiting on `step23-thrown-out-leaves-it`); then `scripts/e2e/defeat.ts`'s
  `defeat-thrown-out` becomes the game over in the cantina, and the two
  held `step21-*` throw scenarios move to `docs/plan/step-21-held/`.
- Step 23's brief says a carried weapon goes back where it was found at a
  game over; `heart-game-over` lays it loose where its holder stood, so
  Step 23 can return it on `game-over` (told the old Step 23 builder).
- Process: twice `git add -A` after an e2e run swept up other steps'
  regenerated screenshots (`docs/plan/step-23-shots/`); caught on rebase,
  never pushed. Once a local e2e server was stopped with `pkill -f`
  instead of by its pid (no other server was running here).

### Push 5b: the camp's throw off (the orchestrator's go)

The camp off by data; `step23-thrown-out-leaves-it` re-pointed by me with
the orchestrator's go (its claim kept: the weapon stays loose inside the
camp; now the grappler's last heart at 3107 and `hero-out` at 3287 instead
of the throw; control: hearts off, it fails). `step21-camp-thrown-out` and
`step21-throw-is-no-escape` moved to `docs/plan/step-21-held/`. The e2e's
camp walk now ends in the game over: `hearts-game-over` (card, cantina,
stick) replaces `defeat-thrown-out`. Measured in the sim: a hero standing
among the camp's fighters is at game over at tick 4920 (82 s).
`chase-goes-back` (`scripts/e2e/chase.ts`, the chase's; changed by me with
the orchestrator's go): the hero now leaves fighter 1's sight by walking
west over the block by the doorway and out by the camp's door, not by
being thrown out; the fact's claim is kept (he searches, then walks back
to his post). Run alone four times against a local build: four passes.
On top of the alarms builder's camp waves (4154e15): every scenario green;
`hearts-game-over` passed 5 of 6 runs (3 alone, 2 full e2e); the one miss
was in a full run before the fact said where the page ended (it now
does). A game over by standing in the new camp takes about 75 s (sim).

### Push 5c: the quarry (handed over, not landed)

Step 22 moved its start-over to `game-over` (1b8b8d1) and said the quarry's
throw may go off. Reds counted with `content/defeat/quarry.json` `"on":
false` at ef08490: `step22-beaten-to-entrance`, `step22-friend-inside-no-
restart`, `step22-restart-restores` (all expect the throw). Not Step 21's to
re-time; whoever next holds Step 22 flips `on` in the same push as those
re-times (every field stays; its `gameOver` is read either way). Until then
the quarry alone still throws a beaten hero back to its road.

### The flaky game over (`hearts-game-over`), found and fixed in the fact

The orchestrator's red run ended with two heroes out and the flyer at x
856 (column 53) with all three hearts, nobody fighting. Cause, traced in a
sim twin of the camp walk (a script that drives `step()` like the fact):
a run of blows carries the hero east past every fighter's 112 px of sight
(seen to column 68), or up onto the long one-way ledge (row 6, out of
their 40 px of sight height); the chasing fighter searches 4 s and walks
home facing west (the chase, 88a048d, D-065). The fact only walked back
east from west of column 20, so it then waited unbeaten for ever.
**The game is right:** a hero out of sight is not fought, the ledge is
the room's deliberate sneak route, and walking back meets the fight
again. **The fact was wrong:** it now walks back into columns 20-32 from
either side, and off the ledge east by its gap (columns 39-40).
Measured: sim, 10 of 20 stands stalled before, 0 of 30 after (slowest
game over 94 s, the fact allows 200 s). Real page, the camp walk alone
(`node scripts/e2e/defeat-alone.ts 10`, new; the e2e has no single-fact
switch), quiet machine: before 7 of 10 (the three misses ended at columns
72, 82 and 52, nobody fighting); after 10 of 10.
