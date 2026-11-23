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
