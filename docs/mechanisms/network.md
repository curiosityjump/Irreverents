# The network layer: two people in one world

**Reference.** Open before touching `src/net/`, `src/server/game.ts`,
`content/net.json`, the frame loop or debug object in
`src/client/main.ts`, `scripts/e2e.ts` or `scripts/checks/together.ts`.
Written by Step 1 Gate 2 (2026-11-23).

## Why it is shaped this way

The owner's standard is "superb movement", and a round trip to the live
server measured about 110 ms. So **each player's own character is
simulated on their own device** and only reported; the server holds each
world, simulates everything that is not a player's own character, and
sends every page the whole world (`docs/plan/step-1.md`, "What's
decided"). It is for friends: the server does not distrust a page.

**The one rule later steps rely on: the layer replicates the simulation's
state generically.** Nothing in `src/net/` or `src/server/game.ts` names a
kind of entity, a verb or a component. A page reports its whole `Entity`;
the server sends the whole `World`. Adding an NPC, an object or a
component needs no network code (`scripts/checks/together.ts` proves it
with a throwaway entity kind on every `npm run check`).

## The pieces

- **`src/net/`** is a pure layer (no DOM, no Node, no clock of its own;
  `npm run check` enforces it) so the browser and the headless check run
  the same code. `protocol.ts`: the messages.
  `client.ts`: one player's end. `smooth.ts`: how remote characters are
  drawn.
- **`src/server/game.ts`**: `attachGame(httpServer, …)`: worlds, players,
  the tick, snapshots. **`makeWorld`** there is the one place a world is
  created (`createWorld` + `populateRoom`), and **`onEvents`** the one
  place the server receives each tick's events from `step()`: add to
  those two for anything a new world must start with or the server must
  do about an event (Step 7's stored records).
- **`content/net.json`** (`src/content/kinds/net.ts`): every rate and
  timeout, and the graybox player colours. All `DRAFT:`.
- **Messages** (JSON text over one WebSocket at `/ws`; `DRAFT:`):
  page → server `join`, `me` (own entity, held input, own tick count, 30 a
  second), `ping`, `bye`; server → page `welcome`, `snap` (the world, 20 a
  second, with the simulation's events since the last one), `fx` (an
  effect), `pong`; and page → server `ack`. Measured with two players and
  the start room's placed bodies: a page sends about 10 kB/s and receives
  a few tens of kB/s (the e2e `rate` fact prints it). A page is sent every
  player, and everything else **in the content room its own character is
  in**, whole in every snapshot even when it has not moved: the first
  thing to trim.
- **Worlds.** Everyone who opens the address is in the world `main`;
  `?room=<name>` is another, separate one. A private world is forgotten
  when its last player is gone; **`main` never is** while the server runs
  (what was done to its rooms stays done, D-077).
- **The whole `World` is replicated, not only `entities`.** Every other
  top-level field (`rooms`: a gate open, a wall broken; whatever a step
  adds next) is the server's, sent in every snapshot and copied by key
  into each page's own world, so the page's local step and its drawing
  use the server's room state. No list of names anywhere.
- **How a player's own actions reach what the server simulates:** every
  report carries the body's whole state *and the input being held*. The
  server runs every system and the player's own verbs over its copy of
  that body with that input, so a plate is pressed, a dummy hit, a gate
  opened there; it just never lets that step move the player's copy
  (unless by an effect). ("Room" in the address means a *world*; a content
  room is `entity.room` inside one.)
- **Who you are** is a random id kept on the device (`localStorage`,
  falling back to memory), so a reload is still you. The same id joining
  again **takes its character over** (no second one; two tabs on one
  device are one player). A
  character whose socket closed waits `staleSeconds` (15) for its page; a
  page that says `bye` (closed tab, a scripted client) is removed at once.
- **The seat.** A page that has not played yet is seated by the server:
  `spawnPlayer` with no character, so the simulation picks a party member
  nobody is playing (`docs/mechanisms/party-and-switching.md`), on a spawn
  tile by join order. Leaving is `removeEntity`. A page that is coming
  back keeps its own character, member and place, even after a server
  restart. `entity.kind` travels like any other field, so a switch of
  member needs nothing here.
- **Placed bodies.** A new world gets `populateRoom` for every content
  room. A page's local world does not (it would draw them twice); alone
  with no server there are no crates.

## Effects: the world moving a player's character

The contract for Steps 2 and 3 is `docs/architecture.md`, "Effects on a
player" (`src/sim/effects.ts`: `emitEffect`, kinds `push`, `hold`,
`release`, `move`). How the layer delivers one:

- A character a page owns is a **puppet** on the server: its state there
  is the page's latest report, put back after every tick. The server
  still steps the whole world with that character in it and its player's
  reported input, so anything simulated there can see it and act on it.
- When the server's step emits an `effect` on a player's character, the
  server sends that page `fx` (a growing id, the effect, and the server's
  copy of the character just after it) and keeps it as *pending*, resent
  every 300 ms (`DRAFT:`) until the page answers `ack`. The page applies
  an id once and acknowledges every copy.
- **While a character is held, or has a pending effect, the server's word
  wins:** the page's reports of it are set aside and it is simulated on
  the server (with the player's input, so "press jump to break free"
  works there). A held page stops simulating its character and follows
  the server's copy from the snapshots. Once free and acknowledged, the
  page's own simulation is the truth again.
- A `push` is applied to the character where the page has it (no visible
  jump); any other effect makes the page take the server's copy.

Proven on every `npm run check` (`scripts/checks/together.ts`): a
throwaway system pushes player b with `emitEffect`; the first copy is
dropped on the way; b is still pushed exactly once, the server hears the
acknowledgement, and b's own device is in charge again afterwards.

Known limits (`DRAFT:`), for whoever builds combat and doors:

- **Only `push` has been run across two devices.** `hold`, `release` and
  `move` share the same delivery but nothing emits them yet; the held
  page following the server is written and untried.
- A page's local world holds **only its own character**. A verb that must
  see others *on the page* does not: `switch` there cannot know which
  members other players hold, and a hit cannot be shown before the server
  says so. The server's copy of each verb does see everyone. The place to
  widen is the local world in `src/net/client.ts`.
- A verb's one-tick edge (a press) can fall between two reports (30 a
  second) and never be seen by the server's copy of the verb. Keep what
  matters in the entity's state (`entity.c`), which is reported whole.
- A change made to a player's entity **without** `emitEffect` is undone
  by the puppet rule on the next tick.
- The server's events for puppets (`landed` and such) are the server's
  view, forwarded in `snap.ev`; nothing reads them yet.

## Smoothing

Remote entities are drawn `interpDelayMs` (100) in the past, between two
states that have arrived, **each on its own simulator's clock**: a
player's character is stamped with its page's tick count, anything else
with the server's tick. A late packet never teleports a character: it is
held at its newest state and then travels at most `remoteMaxSpeed`.
Changing content room is the one jump allowed.

## Coming back (`INTENT:` in `src/net/client.ts` and `src/client/main.ts`)

"There is always a way out; waiting may be a cost, being stuck may not."
Whatever ends the socket, the page retries by itself for ever (250 ms,
doubling to 4 s), through the minute or so of errors a deploy causes; the
player keeps moving locally and the screen says "Reconnecting…". A socket silent for `silenceMs` counts as dead. A tab
shown again after being hidden that long, the `online` event and a
restore from the back/forward cache all drop the socket and retry at
once.

**A deploy restarts the server.** The server writes its commit into the
page it serves (`<meta name="build">`, replaced in `src/server/main.ts`);
every `welcome` carries the server's commit. When they differ the page
reloads **once**, remembering the commit it reloaded for, so it can never
loop, and only after fetching itself successfully, so it never reloads
into an error page.

## The page shell (`src/client/shell.ts`, `index.html`)

- The canvas is 320×180, sized in **device** pixels to a whole multiple.
- **Sideways on a touch screen** the controls sit in the bars beside the
  view; the view gives up one step of scale when that is what makes them
  fit (5× to 4× on an iPhone 14). On a 16:9 phone there are no bars and
  the controls overlap the bottom corners (`DRAFT:`, Step 5).
- **Upright** (`INTENT:` there is always a way out: rotation lock) the
  view is across the top, the controls below, with one dismissible line.
- The touch layer builds one button per file in `content/actions/`
  (`data-action`), and the stick (`data-stick`).

## The debug object, and the checks that read it

`window.irreverents` (read-only by convention): `content`, `world` (the
local world), `player`, `worldName`, `builtFrom`, `net` (counters:
`connects`, `rttMs`, messages and bytes, `effects`) and **`drawn`**,
which the frame loop fills each frame with what it just put on screen:
`entities` (`id`, `player`, `kind`, `x`,`y` as read, `px`,`py` the pixel
drawn, `color`, `mine`), `me`, `room`, `camera`, `scale`, `status`,
`statusText`, `touchControls`, `upright`, `hint`. Nothing in the game reads
it back. **Checks assert on `drawn`, never on server state.**

- **`npm run e2e`** (`scripts/e2e.ts`, about 100 s, 75 of them the
  server kept down for fact (h); `E2E_DOWN_MS=3000` shortens that while
  working on other facts): builds, starts the
  built server on a free port, drives a desktop page by keys and
  Playwright's `iPhone 14 landscape` by touch. Facts (a)–(h) of the Gate 2
  brief plus the message rate. The desktop page's socket is routed through
  the script (`page.routeWebSocket`), which is how 150 ms is added each
  way (and measured from the page's own round trip) and how the socket is
  cut. Screenshots in `e2e-out/`.
- **`npm run check:live`**: the same file with `--live`: first `npm run
  check:deployed`, then facts (a)–(c), (e) and the rate against the live
  address. **`INTENT:` scripted players never join the world people play
  in**: every run uses a private world (`check-<random>`), forgotten when
  the pages close.
- **`scripts/checks/together.ts`**: gate F with no browser, inside `npm
  run check` (about 4 s): a server in the same process on a free port,
  two `createNetClient`s over `ws`.
- **`scripts/checks/built-server.ts`**: starts `dist/server.cjs` as its
  own process (building first if `dist/` is missing or older than the
  sources), sees `/healthz` answer and two players join. `INTENT:` a
  build that cannot start would leave nothing serving the game.

Controls watched to fail, 2026-11-23 (each named the broken fact):
snapshots not sent (`together`, `built-server`; e2e a, b, e, f, h1, rate
on the first version); effects never resent (the push facts); the page
never acknowledging (the acknowledgement fact); reconnect disabled (e,
h1, h2); the built server throwing at start (`built-server`); upright
treated as sideways and the view never shrinking for the bars (c2, g);
and on the first version: own input made to wait a round trip (d:
331 ms) and the server ignoring the world name (f).

## Traps

- Chromium's network throttling does not delay WebSocket frames; use the
  routed socket in `scripts/e2e.ts`.
- Playwright is preinstalled globally and is not a dependency; the npm
  scripts set `NODE_PATH`. Never run `playwright install`.
- Nobody has run this on a real iPhone or in Safari.
