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
  second; the server copies each input field by field in `cleanInput`
  (`src/server/game.ts`) and drops anything else, so a new `Input` field
  needs a line there: Step 11 added `tap`, a tap on the game view), `ping`, `bye`; server → page `welcome`, `snap` (the world, 20 a
  second, with the simulation's events since the last one), `fx` (an
  effect), `pong`; and page → server `ack`. Step 2 added `tune` (page →
  server, only from a `?tune` page) and `tuning` (server → page: the
  world's tuning numbers); `docs/mechanisms/tuning-panel.md`. Step 17
  added `gone` (server → page: this world was set aside after it threw,
  or is a kept game set aside earlier; the page stops reconnecting, its
  status becomes `gone`, and it shows the reason and the way back to the
  start screen; `docs/mechanisms/saves.md`, "A world that throws").
  Measured with two players and
  the start room's placed bodies: a page sends about 10 kB/s and receives
  a few tens of kB/s (the e2e `rate` fact prints it). A page is sent every
  player, and everything else **in the content room its own character is
  in**, whole in every snapshot even when it has not moved: the first
  thing to trim.
- **Worlds.** Opening the address shows the start screen (Step 17,
  `docs/mechanisms/saves.md`), whose "Everyone's kingdom" is the world
  `main`, shared by everyone; `?room=<name>` skips the start screen and is
  another, separate world (`?room=game-ABCD` names a kept game's world,
  so it joins that game, saved and loaded like any game, without the start
  screen; `DRAFT:` allowed on purpose). A private world is forgotten
  when its last player is gone; **`main` never is** while the server runs
  (what was done to its rooms stays done, D-077). A world named
  `game-<CODE>` is a kept game (Step 17, `docs/mechanisms/saves.md`):
  saved before it is forgotten, and built from that save in `makeWorld`.
- **The whole `World` is replicated, not only `entities`.** Every other
  top-level field (`rooms`: a gate open, a wall broken; whatever a step
  adds next) is the server's, sent in every snapshot and copied by key
  into each page's own world, so the page's local step and its drawing
  use the server's room state. No list of names anywhere.
- **How a player's own actions reach what the server simulates:** every
  report carries the body's whole state *and one input per simulation
  tick since the last report* (`is`). The server gives `step()` one of
  those per server tick, and runs every system and the player's own verbs
  over its copy of that body, so a plate is pressed, a dummy hit, a thing
  picked up there. A tap shorter than a report is seen exactly once.
- **Who owns which part of a player's entity** (`INTENT:` at `adopt` in
  `src/server/game.ts`). The **page** owns the body's motion and
  identity: every top-level field (`x`, `y`, speeds, `facing`,
  `onGround`, `room`, `kind`). The **server** owns its copy of `c` (the
  per-verb and per-system state): taken from the page on joining, then
  advanced only by the server's own `step()`. So what a server-run system
  writes on a player (`c.interact`, a press already seen) survives every
  report, and other pages see the server's `c`. The server's step never
  moves a player's copy except by an effect. **The one exception** is
  `kind` when it names a party member another player of the world
  already plays: `refuseTaken` keeps the member the server had (a page
  rejoining after its character was removed gets the first free one) and
  sends the page `become` back (`docs/mechanisms/party-and-switching.md`,
  "Two players, one member"; `scripts/checks/switch-taken.ts`).

## Effects: the world moving a player's character

The contract for Steps 2 and 3 is `docs/architecture.md`, "Effects on a
player" (`src/sim/effects.ts`: `emitEffect`, kinds `push`, `hold`,
`release`, `move`, and Step 11's `become`: the character changes kind
where it stands, a cantina swap; the page takes the server's copy, kind
included, like any non-push effect). How the layer delivers one:

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

- **`push`, `hold` and `release` have been run across two pages**
  (a grab, a break-free and a throw of a friend: the `t-*` and `s-*`
  facts of `npm run e2e`, `docs/mechanisms/combat-and-impact.md`,
  "Across two phones"). `move` has been run across two connections by
  headless clients (`scripts/checks/step11-cantina.ts`: a player launched
  out of the cantina is put back on a pad, acknowledged, and runs from
  there on their own page); not yet in a browser.
- A page's local world holds **only its own character**. A verb that must
  see others' bodies *on the page* does not. A hit is the one exception, and only for
  drawing (below, "Predicted hits"). The server's copy of each verb does see everyone.
  The place to widen is the local world in `src/net/client.ts`. Which
  party members the others play does reach it, as a list: `world.taken`,
  the kinds of every other player in each snapshot, which `memberTaken`
  counts (so the page's `switch` and cantina swap skip a friend's member).
  It is a list, not bodies: no local system can move or hit a friend.
- **A page does not get the server's `c` for its own character** (it keeps
  simulating with its own), so something only the server's copy knows
  (what this player is carrying, say) is not on the player's own entity
  on their own page; read it from the other entity involved, which does
  arrive. `kind` is the page's: a `switch` is decided on the page.
- A change made to a player's entity **without** `emitEffect` is undone
  by the puppet rule on the next tick.
- The server's events for puppets (`landed` and such) are the server's
  view, forwarded in `snap.ev`; nothing reads them yet.

## Predicted hits (Step 5, `DRAFT:`; `src/net/predict.ts`)

The owner, playing on a phone: "Big delay between swing and actual
impact." The page simulates only its own hero, so what that hero hit used
to answer a round trip late. Measured in `npm run e2e` (fact `hit-*`, a
phone page with 150 ms added each way): **before**, the star after 716 ms
and the crate moving after 833 ms; **after**, the star after 103 to 136 ms
and the crate moving after 251 to 283 ms (grappler: wind-up 100 ms, a beat
of 8 ticks held for 9).

- **When.** After each local tick, if the page's own `c.attack` is in
  `strike` on that tick (the verb tested for hits then), the predictor
  runs **the verb's own `strikeTick`** (`src/sim/verbs/attack.ts`,
  exported for this) in a scratch world. That world holds a copy of the
  hero and copies of the bodies in its room **as this page draws them**
  (smoothed, about 100 ms old). Each swing hits each body once, as in the
  verb. A press while a drawn body is held by the hero is a throw on the
  server, so nothing is predicted then.
- **The loan.** A struck body is lent to the page: a copy carrying the
  verb's own stamps on the page's clock (`c.lastHit`, `c.beat`,
  `c.impact`; `c.stunned`, `c.flying`). Every local tick it is stepped by
  the simulation's own flight systems (`combat-clock`, `impact-before`,
  `physics`, `impact-walls`, `impact-bodies`, `combat-rest`, `body-stun`),
  among copies of the bodies around it so it bounces off them as on the
  server. Never a verb, and never an NPC system. `client.others()`
  returns that copy in place of the smoothed one, marked `c.predicted`
  (page-only). Drawing needs nothing new: the star, flash, hurt frame,
  dust and shake come from the stamps as before. The actors lane's
  cosmetic star (`predictHits` in `draw/impact.ts`) stands down while this
  is on (`draw/entities.ts`).
- **Handing back** (`INTENT:` the page never owns another body). The
  server's hit is seen when the drawn copy's `c.lastHit` is by this player
  and newer than at the loan. Once both the copy and the server's body
  have come to rest, the drawn body eases into the server's position over
  `predictBlendMs`, never faster than `remoteMaxSpeed`. If the server has
  not hit it within `predictHitMs` (a friend took it, it had moved), it
  eases back the same way. Something holding it, or it leaving the room,
  ends the loan at once. A loan never lasts more than 4 s. For about 3 s
  afterwards the server's copy of the same hit is not drawn as a second
  star.
- **A player's body** (a brawl): only the star and the beat are drawn on
  it. Its position stays the server's, because its own page owns it.
- **Switch:** `content/net.json` `predictHitMs` 0 turns it off. The e2e
  control `E2E_NO_PREDICT=1` does that on the hitter's page, and `hit-star`
  and `hit-moves` fail (716 ms and 833 ms).
- **The check** (`scripts/e2e/hit-lands.ts`): the hitter's first frame
  with a new impact on the crate (`drawn.impacts`, which the frame loop
  fills from the bodies it drew) must come by wind-up + 50 ms, and its
  first frame with the crate 4 px away by wind-up + the beat as held +
  50 ms. The watcher (no added delay) draws the server's hit as before
  (about 700 ms). Once still, both pages draw the crate 0.0 px apart.
- **Not done:** throws and a grab's lift are still a round trip on the
  hitter's screen (brief item 3), and `interpDelayMs` is untried at 66
  (item 4). Not verified: the ease back when the server disagrees, and a
  brawl hit on a friend. Both are only reasoned.

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

## A page that went away (`away`, Step 5, `DRAFT:`)

A player's character whose page is not there is drawn **away** on
everyone else's screen: dimmed, three small dots above its head
(`src/client/draw/away.ts`, its own layer in `render.ts`). The server
decides it in one place, every tick (`tickWorld` in `src/server/game.ts`):
away while the socket is closed (until `staleSeconds` removes the
character, as before) or while nothing has come from the page for
`AWAY_SILENCE_MS` (2.5 s; a locked phone keeps its socket open for a
while). It is `away: true` on the server's own `c.net` component beside
`slot` (additive), so every snapshot carries it with no network code; it
goes when the page reports again. A tab closed on purpose still says
`bye` and is removed at once. `drawn.entities[].away` records it for the
checks. e2e fact `away` (`scripts/e2e/away.ts`): a routed socket is cut
with no goodbye and kept from coming back; the other page draws away
within 2 s (measured 162 ms), here again once let back, removed after
`staleSeconds` (that last wait is skipped in `check:live`). Control
watched to fail: the server never marking anyone away.

## The page shell (`src/client/shell.ts`, `index.html`)

- The canvas is 320×180, sized in **device** pixels to a whole multiple.
- **Sideways on a touch screen** the controls sit in the bars beside the
  view; the view gives up one step of scale when that is what makes them
  fit (5× to 4× on an iPhone 14).
- **On a 16:9 phone** (iPhone SE 2/3, 6/7/8 and Plus) there are no bars,
  so the controls sit over the view (`DRAFT:`; `shell.ts` sets
  `#touch.over`): the touch area is 60 px (the stick 136×64) and they
  hug the bottom corners. The camera keeping the player clear of them is
  not built.
- **What a control paints** is small and its touch area large,
  everywhere: its picture, or with no picture a faint label (the stick:
  two arrows); a press lights it under the thumb. The pictures are the
  delivered U08-01 art, copied to `assets/ui/touch/` as 48×24 strips
  (normal, pressed). Which action shows which is data: the optional
  `icon` on the action file; the stick's two are named in `touch.ts`. A
  picture is drawn at a whole number of device pixels per art pixel
  (`INTENT:` in `shell.ts`), as a background on a child that takes no
  touches (an `<img>` under a finger starts a drag on iPhone Safari). It
  is applied only once it has loaded, so a missing file leaves the label.
- **Upright** (`INTENT:` there is always a way out: rotation lock) the
  view is across the top, the controls below, with one dismissible line.
- The touch layer builds one button per file in `content/actions/`
  (`data-action`), and the stick (`data-stick`).

## What goes wrong on a real iPhone (`GET /debug/errors`)

Nobody here can run Safari, so the page tells the server what went wrong
and anyone can read it:

    curl -s https://irreverents-production.up.railway.app/debug/errors

answers `{ commit, startedAt, received, kept, errors: [...] }`, oldest
first. Each report: `at` (server time), `kind`, `message`, `stack`,
`build` (the commit that served the page; compare with `commit`),
`screen` (`w`, `h`, `dpr`), `upright`, `ua`. `/healthz` carries the
count as `errors`.

- **Kinds:** `error` (uncaught), `rejection` (a promise nobody caught),
  `load` (a script, image or stylesheet that did not load, the button
  pictures included), `socket` (no connection for 20 s with the page in
  view; once per outage, `DRAFT:`), and `server` (Step 17: the server's
  own line, `ErrorLog.note`: a saved game loaded without what no longer
  fits, or a world set aside after it threw; `docs/mechanisms/saves.md`).
- **The reporter is the first script in `index.html`**, inline and in old
  syntax (`INTENT:`): it must work when `game.js` fails to load or to
  parse, which on an older iOS is the likeliest way to get a blank
  screen. `src/client/report.ts` is how the bundle sends a line through it.
- **`INTENT:` no personal data** (`src/server/errors.ts`): no player id,
  name, room or address. The page cuts everything after a `?` from every
  string (the room is in the address); the server keeps only the named
  fields and never reads who sent it.
- **Limits** (`DRAFT:`): 20 reports per page load, bodies over 4 kB
  refused, 120 a minute from everyone, the newest 200 kept **in memory**:
  a deploy empties it, so read it before pushing code.
- A report can only arrive if plain requests get through; a phone with
  no network at all reports nothing.
- e2e fact `errors-reach-us` (`scripts/e2e/errors.ts`, also in
  `check:live`, so the live list holds three lines marked
  `scripted-check-…` after each run): a page throws, drops a rejection
  and asks for a missing image; all three are listed with the page's
  build and screen, no other fields, and neither the player id nor the
  room. Control watched to fail: the reporter not installed (0 of 3).

## The debug object, and the checks that read it

`window.irreverents` (read-only by convention): `content`, `world` (the
local world; set once play starts, after the start screen), `player`,
`worldName` (`''` until then), `builtFrom`, `start` (Step 17: what the
start screen shows, `src/client/start.ts`; absent in a `?room=` world),
`net` (counters:
`connects`, `rttMs`, messages and bytes, `effects`, `tunesOut`,
`tuningsIn`) and **`drawn`**,
which the frame loop fills each frame with what it just put on screen:
`entities` (`id`, `player`, `kind`, `x`,`y` as read, `px`,`py` the pixel
drawn, `color`, `mine`), `me`, `room`, `camera`, `scale`, `status`,
`statusText`, `touchControls`, `upright`, `hint`. Nothing in the game reads
it back. **Checks assert on `drawn`, never on server state.**

- **`npm run e2e`** (`scripts/e2e.ts`, about 125 s, 75 of them the
  server kept down for fact (h); `E2E_DOWN_MS=3000` shortens that while
  working on other facts): builds, starts the
  built server on a free port, drives a desktop page by keys and
  Playwright's `iPhone 14 landscape` by touch. Facts (a)–(h) of the Gate 2
  brief plus the message rate, and Step 2's `t-*` and `s-*` facts
  (`scripts/lib/e2e-touch.ts`: two more phone pages, touch only). The desktop page's socket is routed through
  the script (`page.routeWebSocket`), which is how 150 ms is added each
  way (and measured from the page's own round trip) and how the socket is
  cut. Screenshots in `e2e-out/`.
  `scripts/e2e/phone.ts` (called from `e2e.ts`; not in `scripts/checks/`,
  whose files `npm run check` loads without a browser) adds one fact per
  16:9 iPhone size, `i-667x375` and `i-736x414`: every action and the
  stick has a control, on screen, 44 px or more, reachable at its centre,
  clear of a notch and home bar (headless Chromium has no insets, so the
  script sets `#safe`'s padding and re-runs the layout), two fingers run
  and jump, and the controls paint over at most 3% of the view (2.62% and 0.90%
  with the pictures). The
  painted share is measured: the view's box photographed with and without
  `#touch`, the game hidden both times, compared pixel by pixel.
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
never acknowledging (the acknowledgement fact); only the newest input sent, and the report overwriting the server's `c` (the one-tap fact, each: 0 presses seen); reconnect disabled (e,
h1, h2); the built server throwing at start (`built-server`); upright
treated as sideways and the view never shrinking for the bars (c2, g);
the first touch layout, discs over the view (i-667x375: 14.76% painted, i-736x414: 9.71%);
and on the first version: own input made to wait a round trip (d:
331 ms) and the server ignoring the world name (f).

## Traps

- Chromium's network throttling does not delay WebSocket frames; use the
  routed socket in `scripts/e2e.ts`.
- Playwright is preinstalled globally and is not a dependency; the npm
  scripts set `NODE_PATH`. Never run `playwright install`.
- Nobody has run this on a real iPhone or in Safari.
