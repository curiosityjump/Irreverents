# Brief: Step 1, Gate 2 — two people in the room together, on phones, live

Written by the Step 1 lead (`session_017WiGzEwLs3ng2ZPpRZgctn`), 2026-11-23.
Governing step: `docs/plan/step-1.md` (its "What's decided", "Traps
already known" and "Feedback signal" are binding and not repeated here).
Builds on Gate 1 (commit 234d1b4): **read `docs/architecture.md`
first**; it says where everything below goes and how a shared contract
may change (additively). **Budget: live and proven by about 06:30 UTC.**
Three other leads are building on the same tree right now; section 3 says
how not to collide.

## 1 · The task, and the measure rows

At https://irreverents-production.up.railway.app two people on separate
devices open the page and, with no setup, are in the same graybox room,
each running and jumping with their own controls (touch on an iPhone held
sideways first; keyboard on a computer too), each seeing the other move
smoothly. One person alone can play too.

Measure rows (`docs/plan.md`): **M2** "no" → "yes, proven by script";
**M3** 0 → 1 of 6 if the gate F scenario below passes; **M1** stays true.

Deliver, on `main` and live:

1. **The network layer.** Each player's own character is simulated on
   their own device and reported to the server; the server holds the
   room's world, simulates everything that is not a player's own
   character, and sends every client the world. Everyone who opens the
   address is in one shared world; `?room=<name>` in the address makes a
   separate one. No accounts. The layer **replicates the simulation's
   state generically**: a later step that adds a kind of NPC or object to
   the world state writes no network code (prove it with a test: add a
   throwaway entity kind in a scenario's world, see it arrive at a client,
   remove it).
2. **The browser client.** A canvas at 320×180 internal resolution scaled
   up crisp (whole-number scale of device pixels where it fits,
   `image-rendering: pixelated`, letterboxed, centred), the room and both
   characters as graybox shapes, each player a distinct colour, a camera
   that keeps your own character in view. Remote characters are smoothed
   (interpolate between received states a little in the past; never
   teleport across the room on a late packet). Build the draw step so a
   sprite sheet or a tile atlas can replace a rectangle **as data**
   (`docs/architecture.md`, "I need to add… an asset").
3. **Controls, through the abstract action list** Gate 1 created.
   Keyboard: arrows or A/D, and space / W / up to jump. Touch, landscape,
   two thumbs: move under the left thumb, jump under the right, **both at
   once must work** (run and jump). The layout is `DRAFT:` (Step 5 owns
   the real one and the art for buttons); make the touch layer read the
   action list so Step 5 can check "every action has a touch control" by
   script. Big targets, nothing under the notch or the home indicator
   (`env(safe-area-inset-*)`, `viewport-fit=cover`).
4. **The page shell, for iPhone Safari.** No zoom on double tap, no
   pull-to-refresh or rubber-banding, no text selection or long-press
   call-out, no scrolling (`touch-action: none` on the game surface,
   `overscroll-behavior: none`, a viewport meta that fixes scale). A
   phone held upright gets a plain "turn your phone sideways" screen,
   never a broken layout. No hover anywhere. No sound yet.
5. **It comes back.** If the socket drops, the tab is hidden and shown, or
   the network changes, the page reconnects by itself (with backoff) and
   the player is back in the world as the same player, without a reload.
   While it is reconnecting the screen says so in a few words, and the
   player can still move locally. `// INTENT:` mark the reconnect path:
   "there is always a way out; waiting may be a cost, being stuck may
   not" (`CLAUDE.md`). Step 5 hardens this; you make the basic path real.
   **A deploy restarts the server** (code pushes will keep landing while
   people play): the page must rejoin by itself afterwards, and when the
   server it rejoins reports a different commit than the page was built
   from, the page reloads itself **once** to pick up the new build (never
   a reload loop: remember the commit you reloaded for). Fact (h) in e2e:
   restart the server process under a connected page; the page is back in
   the world within 10 s; restarted with a different commit id, the page
   reloads exactly once.
6. **`npm run e2e`** (replacing the failing stub): starts the built
   server on a free port and drives two headless Chromium pages against
   it, one of them Playwright's `iPhone 14 landscape` device driven by
   touch, the other a desktop page driven by keys. Prints one fact per
   line and exits non-zero on any failure. It must show: (a) both pages
   are in the same world and each draws the other; (b) when A moves, B
   shows A at the new place within 500 ms; (c) two touches at once on the
   phone page make its character run and jump in the same moment; (d)
   with 150 ms of delay injected each way on A's connection, A's own
   character starts moving within 50 ms of the key press; (e) after A's
   socket is cut, A is back and visible to B within 10 s without a
   reload; (f) a page opened with `?room=other` does not see them; (g) a
   portrait phone page shows the turn-your-phone screen. It saves a
   screenshot of each page (`e2e-out/`, git-ignored) for you and the lead
   to look at.
7. **`npm run check:live`** (replacing the stub): the same two-player
   walk, facts (a)–(c) and (e), against the live address, **in a private
   room** (trap below), after first checking that `/healthz` there
   reports the commit at the tip of `origin/main`.
8. **A gate F scenario inside `npm run check`**: no browser. In one Node
   process, start the server on a free port, connect two headless clients
   that use the same network-client code the browser uses, drive them
   with timed actions, and assert each sees the other where it should be.
   Tag it gate `F` so `npm run gates` reports F as passing. Give it a
   failing control like every scenario.
9. **Docs**: the network layer's writeup in `docs/mechanisms/` and its
   line in the index; `docs/architecture.md` updated where you added
   places for things; `docs/verifying-and-finishing.md` "This project's
   setup" lines for `e2e` and `check:live` made true with the time you
   ran them; your measurements under "Measure" in `docs/plan/step-1.md`.

## 2 · What is already measured (do not re-derive)

By the lead, 2026-11-23 04:02–04:10 UTC, in a container like yours.

- **WebSockets pass through Railway and through this sandbox's outbound
  proxy**, from headless Chromium with no proxy configuration: page load
  437 ms, `wss://…/ws` open 450 ms, echo round trips 104–136 ms. So
  `check:live` can run from here, and a real round trip to the live
  server is about 110 ms: design the smoothing for that, not for
  localhost.
- **Playwright 1.63.0 with Chromium is preinstalled globally**; run
  scripts with `NODE_PATH=/opt/node-tools/node_modules` and
  `require('playwright')`. `chromium.launch()` needs no options. **Never
  run `playwright install`; do not add playwright to `package.json`**
  (another version will not find the browser). Put the `NODE_PATH` in the
  npm script itself so `npm run e2e` works bare.
- **`devices['iPhone 14 landscape']` gives a 750×340 CSS-pixel viewport,
  device pixel ratio 3, touch on** (with a proper viewport meta; without
  one the page measured 981×445). 320×180 fits 340 px of height once,
  not twice, in CSS pixels; in device pixels (2250×1020) it fits 5×
  (1600×900). Scale in device pixels.
- **Two fingers at once can be scripted**, through a CDP session:
  `Input.dispatchTouchEvent` with two `touchPoints` produced
  `touchstart` with `touches.length` 1 then 2 on two different elements,
  and matching `pointerdown` events with distinct pointer ids; releasing
  one finger at a time worked too. Playwright's own `page.touchscreen`
  is one finger only.
- **Chromium's network throttling does not delay WebSocket frames.** With
  `Network.emulateNetworkConditions` latency 150, echo round trips stayed
  104–108 ms (baseline 105–108). So fact (d)'s delay has to be injected
  another way: a small delaying WebSocket relay inside the e2e script
  (the page connects to the relay, the relay forwards each frame both
  ways after 150 ms), or an equivalent you can show adds the delay.
  Measure the delay you injected and print it as a fact.
- **A push is live in about 25 seconds**; Railway runs `npm run build`
  then `npm start` on Node v22.23.4.
- **Nobody here can run iPhone Safari.** The phone page in e2e is
  Chromium with touch and a phone-sized viewport. Stay on boring,
  long-supported web features (no `OffscreenCanvas`, no WebTransport, no
  WebRTC, no top-level await in the client bundle, no CSS only the newest
  Safari has). Say in the commit that a real iPhone has not been tried.

## 3 · Traps

- **The Gate 1 worker is still landing three small things in your paths**
  as you start: `railway.json` (watch patterns and a health check), one
  storage field in `/healthz` (`src/server/`), and an `npm run
  check:deployed` script (`scripts/`, `package.json`). Pull before you
  touch the server or `package.json`, keep `/healthz`'s existing fields,
  and rebase rather than overwrite if you meet them.
- **The scenario layer (`src/scenarios/`) is pure: no Node, no sockets**
  (`docs/architecture.md`, "Layers"; `npm run check` enforces it). The
  gate F check in item 8 starts a real server, so it lives with the
  scripts (run by `scripts/check.ts`, reported by `scripts/gates.ts`),
  not as a fact file in the pure layer. Keep the network-client code that
  both the browser and that check use free of DOM and Node so both can
  import it.

- **`check:live` must not put bots in the owner's world.** The default
  world at the live address is where the owner and their friends play.
  Every scripted client joins a private room named for the run
  (`?room=check-<random>`), and the server forgets a room when its last
  client leaves.
- **Three other leads' workers are pushing to `main` in the same hour**
  (Steps 2, 3, 4: movement and combat, rooms, NPCs). Stay in the paths
  `docs/architecture.md` gives Step 1 (network, server, client shell,
  input, e2e). If you need a change in a shared contract file (the
  world-state shape, the input shape, the event list), make it additive
  and say so in the commit. Before every push: `git fetch origin main &&
  git rebase origin/main`, then **re-run `npm run build && npm run
  check`** if anything outside `docs/` came in, because their change and
  yours have never been run together. If `main` is broken by someone
  else's push (check fails on a clean checkout of `origin/main`), do not
  push on top: message the lead at once.
- **Red on live means the next push is the revert.** If, after your
  push is live, the live address is broken (the page does not load, a
  check that passed locally fails there), `git revert` your commit and
  push at once, then find out why locally. Nobody debugs on the owner's
  game (`docs/plan/step-1.md`, "What's decided").
- **A push is the deploy.** Never push a client that shows a broken page.
  If the network layer is not ready, the page must still let one person
  play (solo works with the same build).
- **The server must not trust the wall clock for the simulation** or let
  a slow tick spiral: fixed timestep with an accumulator and a cap on
  catch-up steps; the same in the browser (a backgrounded tab resumes
  with a huge elapsed time).
- **A character owned by a client still has to be pushed around by the
  world later** (Step 2: players are hit, grabbed and thrown, sometimes
  by something the server simulates). Do not build a protocol in which
  the owner's report always wins and nothing else can move that
  character. Leave a generic path for "the server's simulation did this
  to your character" (for example events or impulses addressed to a
  player, applied by the owning client), document it in the mechanism
  writeup, and prove it with one scripted shove in the gate F scenario.
  You are not building combat; you are making sure the door exists.
- **Player identity across a reconnect** is a random id the page keeps
  (for the tab's life at least); a reconnecting page with the same id
  takes over its character, it does not spawn a second one. A stale
  character whose page never comes back is removed after a short
  timeout (`DRAFT:` the number).
- **Assert through what the player sees.** Facts (a)–(g) read what the
  page actually draws: have the client keep one small, documented
  read-only debug object on `window` that the renderer itself fills each
  frame with what it drew (who, where). Do not assert on server state or
  on a value the renderer never reads.
- **Each fact needs a control you watched fail** (drop the relay of
  remote players and see (a) and (b) fail; remove local prediction and
  see (d) fail; disable reconnect and see (e) fail). Say which in the
  commit.
- **Stop servers by pid**, never by pattern; pick free ports (`listen(0)`).
- **Do not send the whole world as fast as you can.** Pick a send rate
  (the lead suggests 60 simulation ticks a second, own-character reports
  30 times a second, world snapshots 20 times a second, remote characters
  drawn about 100 ms in the past; all `DRAFT:`, in the tuning data) and
  print the measured message rate and size per second as a fact in e2e.

## 4 · Out of scope (leave these, even when they look wrong)

- Attack, grab, throw, more character kinds, movement feel and tuning
  values (Step 2). More rooms, doors, the room format (Step 3). NPCs
  (Step 4). If their files change under you, that is them working.
- The real touch layout, button art, presence markers at the screen
  edge, names, the menu, an "I'm stuck" control, a home-screen install
  manifest, sound (Step 5, which opens when this step closes).
- Accounts, saving anything between visits, anti-cheat, cheating
  resistance of any kind: it is for friends.
- `docs/vision.md`, `docs/plan.md`'s status lines, the role documents,
  `docs/design-library/`, `tools/`.

## 5 · Decided vs. open

**Decided:** `docs/plan/step-1.md` "What's decided"; the facts in
section 1 item 6 are the acceptance test. JSON messages over one
WebSocket at `/ws` (no binary format yet; `DRAFT:`).

**Open, yours:** message shapes, smoothing method, the touch layout's
exact form (a left/right pad or a floating stick; pick one, `DRAFT:`),
how the debug object is shaped.

**Nothing is open with the owner.** They are asleep until about 11:00
UTC. For anything that is truly theirs (how it should feel or look),
take your best reading, make either answer a small change, mark it
`DRAFT:` and log it in `docs/decisions-log.md` (its header has the format).

## 6 · How it gets verified

Rungs 3, 4 and 5 of `docs/verifying-and-finishing.md`:

1. `rm -rf node_modules dist && npm ci && npm run build && npm run check
   && npm run e2e`, exit 0, from a fresh clone.
2. The controls in section 3, each watched to fail.
3. Rung 5: open the two screenshots from `e2e-out/` and look at them:
   is the room drawn, are both characters there in different colours,
   are the touch controls on the phone page inside the screen and clear
   of the edges, is the picture crisp (no blur from fractional scaling)?
   Look at the portrait screenshot too.
4. After the push: `/healthz` reports your commit, then `npm run
   check:live` exits 0, then `npm run gates` shows F passing.

The lead re-runs all four from a fresh clone, with its own control, and
reads the screenshots.

## 7 · Definition of done

- Items 1–9 on `main`, live; `npm run check:live` and `npm run e2e`
  pass; `npm run gates` reports F passing.
- SOP phase 6 rows: "a new mechanism" (network layer; the e2e harness),
  "something provisional shipped" (`DRAFT:` at the touch layout, the
  rates, the message format), "an `INTENT:`" at the reconnect path and
  at the private-room rule for scripted clients, "a measured number"
  (`docs/plan/step-1.md` Measure).
- The commit message is the honest report: what ran, which controls
  failed when broken, what was not verified (a real iPhone, at least).
- Do not delete this brief or edit `docs/plan.md`; the lead does both.

## 8 · Where your questions and your report go

- **Done, or blocked for more than ten minutes:** `send_message` to
  `session_017WiGzEwLs3ng2ZPpRZgctn`: "Gate 2 worker: done at <commit>"
  or "blocked: <one line>".
- **A non-blocking question for the owner:** `docs/questions-inbox.md`.
  **A flag:** `docs/for-the-lead.md`. Your final message is one line.
