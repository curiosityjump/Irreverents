# Step 1 — A live room two people can play in together

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23, to Vision Partner, first-hand** (`docs/vision.md`, "The measure"):
> I want this game to be playable by the time I wake up in the morning.
>
> It's setup to deploy automatically from main yes.
>
> Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning.

Two people, each in a browser on a phone or a computer, in the game
together, by the owner's morning. The repository holds no game yet (only a
deploy probe, `server.js`), so nothing else in the plan can be built or
checked until this step lands. **Every other step is queued behind it; it
is the critical path of the night.**

## Goal

At https://irreverents-production.up.railway.app two people on separate
devices open the page and, with no setup, are in the same graybox room,
each running and jumping with their own controls (touch on a phone,
keyboard on a computer) and each seeing the other move smoothly. And the
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
- **Solo works with the same build.** One person opening the URL can play;
  nothing waits for a second player (owner's rule, D-015).
- **Joining needs nothing.** Everyone who opens the URL is in the same
  shared world by default; a `?room=<name>` in the address makes a private
  one. No accounts (it is for friends).
- **Rendering is a plain canvas at a low internal resolution, scaled up
  crisp, with graybox shapes.** No approved art exists; anything drawn is a
  placeholder.
- **The commands, by these exact names** (other docs cite them):
  `npm run build`, `npm run check` (types, content validation, and the
  headless simulation scenarios; fast, no browser), `npm run e2e` (the real
  page in headless browsers against a local server, two players, one of
  them phone-sized with touch), `npm run check:live` (the same two-player
  check against the live URL), `npm run gates` (prints which of the design
  library's build gates A–F have a passing scenario; see
  `docs/measures.md`, M3), `npm start`, `npm run dev`.
- **`/healthz` keeps reporting the deployed commit**, as the probe does.
- **A push to `main` is the deploy**, so the gate before every push is
  `npm run build && npm run check`, plus `npm run e2e` when the client or
  the network changed. Write that gate into `docs/verifying-and-finishing.md`.

## What's open (the lead's to measure and decide)

- Library choices and versions, the file layout inside the constraints
  above, tick and send rates, how remote characters are smoothed.
- The internal resolution and tile size: the library's style lock (doc 14,
  `docs/design-library/03-visual-direction-and-assets/00-asset-production-plan-and-style-lock/`)
  names the candidates; pick one and mark it `DRAFT:`.
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
- **Phones:** no hover, no keyboard, a notch, a browser bar that eats
  height, and a second finger. The phone-sized e2e client must drive the
  touch controls, not the keyboard.

## Feedback signal

1. `npm run build && npm run check` exit 0 from a fresh clone
   (`npm ci` first), and `npm run check` runs at least one simulation
   scenario whose control you watched fail.
2. `npm run e2e` passes: two headless browsers (one phone-sized, touch)
   join a local server; when A moves, B sees A at the new place within half
   a second; with 150 ms of delay injected each way, A's own character
   still starts moving within 50 ms of the key press.
3. `npm run check:live` passes against the live URL, and `/healthz` there
   reports the commit at the tip of `main`.

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

*(The lead's measurements follow, each with its command.)*

## Briefs

*(One line per brief.)*

## Open with the owner

*(None.)*

## Handoff notes

*(Newest last.)*
