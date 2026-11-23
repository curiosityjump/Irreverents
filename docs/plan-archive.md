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
