# Saved games: a world that is kept, and a friend who joins it

**Reference.** Open before touching `src/server/saves.ts`, `src/net/game-code.ts`,
`makeWorld` or the last-player leave in `src/server/game.ts`, the store
lines and `/game/<CODE>` in `src/server/main.ts`, `src/client/start.ts`,
how `src/client/main.ts` picks its world, `scripts/checks/step17-saves.ts`
or `scripts/e2e/start-screen.ts`.
Written by the Step 17 builder (2026-11-23). The step and its `DRAFT:`
choices: `docs/plan/step-17.md`.

## Why it is shaped this way

The owner: *"If I have a saved game, I should be able to load it and have a
friend join me in my saved game."* There are no accounts (friends, not
strangers), so a game is found by a short **code** anyone holding it can
use. A game is a world like any other on the server (`docs/mechanisms/network.md`,
"Worlds"); only its name says it is kept.

## The pieces

- **A game is the world `game-<CODE>`**, CODE four letters from
  `ABCDEFGHJKMNPQRSTUVWXYZ` (no I, L, O; `GAME_LETTERS` in
  `src/net/game-code.ts`, shared by the page and the server). `INTENT:`
  the letters and the length are an id contract: every save is filed
  under its code and every shared link carries one; add, never take away. Any other world name (`main`, `?room=…`, `game-abc`) is not a
  game and behaves exactly as before. An unknown code is a new game.
- **The record.** One store collection per game, `save-<code in lower
  case>`, holding exactly one record (written with `replaceAll`):
  `{ version: 1, code, savedAt, commit, rooms, world, shapes, removed }`.
  `world` is the `World` with every player's character taken out; `rooms`
  lists the content rooms the writing build had; `shapes` (added by the
  hardening) each content room's width, height, fingerprint and its parts'
  own tiles; `removed` the placement ids not in the world when saved.
  `INTENT:` a contract once on the volume: add fields, never rename.
- **When it is saved:** every `SAVE_EVERY_MS` (30 s, `DRAFT:`) while anyone
  is in it (the server's tick loop), when its last player is removed (a
  `bye`, or `staleSeconds` after the socket went), and for every game being
  played when the process gets SIGTERM or SIGINT (a deploy stops the old
  server: `src/server/main.ts`). After the last-player save the world is
  forgotten in memory like any private world.
- **Loading** is in `makeWorld`, the one place a world is created: a game
  with a save is built from it (`load` in `saves.ts`; "Later builds"
  below). **What no longer fits is dropped, never refused** (`INTENT:`): a
  body whose room is gone, or whose kind is neither a character nor a
  bodiless `~` thing, and the state of a room that is gone. The drop is
  said once per load, as a `server` line in `GET /debug/errors` (no code
  in it: no personal data). A player character in an old record is never
  loaded.
- **Does it exist?** `GET /game/<CODE>` answers `{ code, valid, exists, savedAt }`
  (the code upper-cased): `exists` is true while it is being played or when
  it has a save. For the start screen's "Join a friend".
- **`/healthz` `store`** is `{ lasting, dir, problems, saves }`: whether
  records last, where, any problem, and how many games have a save.
  `INTENT:` a count, never the codes (a code is how anyone joins a game).
  Asking about a code with no save (`has`, `savedAt`, `load`, so
  `GET /game/<CODE>`) opens nothing in the store, so it leaves nothing
  behind. Proof: `scripts/checks/step17-contracts.ts` (control watched to
  fail on push B's code: three asked-about codes opened three collections,
  and /healthz listed both codes asked about).
- **The store itself** (`src/server/store.ts`, `docs/architecture.md`
  "Lasting records: the store"): on the Railway volume when
  `storage.mounted`, else in memory (a local `npm run dev` keeps games until
  it stops).

## Later builds (`load` and `save` in `src/server/saves.ts`)

Every deploy loads saves the previous build wrote. The hardening (push B)
made four things survive that:

- **Placements** (`INTENT:`): loading places every room's placements again.
  `populateRoom` skips an id already in the world, so a body a later build
  places appears in old games, and a body that was moved stays where it
  was. A placed body that left the world for good is in the record's
  `removed` and is taken out again, never brought back. (Nothing removes a
  placed body today; only cantina regulars, which a system makes, leave.)
  A record from before `removed` is loaded the same way, which is right
  for the same reason.
- **Tiles in an edited room.** Tile overrides are by cell index, so after
  a room was widened they stood in the wrong cells: invisible walls, gates
  that did not block (the review's courtyard, +2 columns: solid at (17,4),
  (15,5), (13,6), (11,7)). Every override is laid by a part
  (`setPartSolid`), so for a room whose fingerprint (`shapes`) changed,
  each part whose own kind and tiles are unchanged keeps its state and its
  overrides, moved to the same (x, y) in the new grid; the rest of that
  room's state goes, and its parts start again (a broken wall whose part
  moved is whole again). Said once in `/debug/errors`. `DRAFT:` a part
  that moved could be followed by its id; not done. A record from before
  `shapes` keeps its rooms' state as is.
- **Every top-level `World` field** is kept (no list of names, as the
  network layer does): only `entities` and `rooms` are looked into.
- **A newer record** (`version` above `SAVE_VERSION`) is never loaded and
  never written over, as `store.ts` treats its own files. Joining it is
  refused with `gone` ("made by a newer version") and said once.

Proof: `scripts/checks/step17-later-builds.ts` (under 1 s; no server): a
world set up and stepped three ticks, one placement removed, a top-level
field added, saved; loaded by a "later build" with every room that has
overrides widened by two columns on the right and one new placement. Then
a version-2 record is loaded and saved over. The server's refusal of a
newer record is in `step17-set-aside.ts`. Control watched to fail
(2026-11-23), push A's `saves.ts`: the new body missing; stray overrides in
every widened room, the courtyard's at exactly the review's cells; the
field lost; the newer record loaded and written over.

## A world that throws (`setAside`, `src/server/game.ts`)

A save from an older build can lack a field a later system reads (the
review's case: an NPC's `c.npc` with no `offenders`, which `npc-setup`
never fills in because `c.npc` is there). That threw in `npc-mood` on the
first tick and, with nothing to catch it in the server's timer, ended the
process, `main` included, again at every reconnect. Now (`INTENT:`):

- Each world's beat (forget stale players, save, step, send) and each
  message's handling are wrapped. A throw sets **that world** aside: one
  `server` line in `/debug/errors` (what kind of world, what threw and
  where; no code or name), its players are sent `gone` and their sockets
  closed, and it leaves the live worlds.
- A **kept game** set aside is never saved again (`saveGame` and `saveAll`
  skip it) and joining it is refused with `gone` until the server restarts,
  when a new build may run it. A game whose save throws while being *made*
  is treated the same way.
- **`main` or a `?room=` world** set aside starts fresh at the next join.
- The page (`src/net/client.ts`, `onGone`): status `gone`, no more
  reconnecting (not even on a wake or a network change), and
  `showGone` in `src/client/start.ts` shows the reason with **Back to the
  start screen** (`INTENT:` the way out). The tab forgets it was playing
  that world, so a reload shows the start screen.
- This contains the crash; it does not make an old save run (an NPC
  missing a field still throws). "Later builds" covers what a save can
  carry across builds; a component field a later build adds still needs
  that system to default it, or the game is set aside.

Proof: `scripts/checks/step17-set-aside.ts` (about 2 s; harness in
`scripts/lib/save-harness.ts`). A real game is saved, made "old" by
deleting one NPC's `offenders`, and joined on a new server while someone is
in `main`: the player is told and stops reconnecting; one report, without
the code; the save is unchanged byte for byte, also after a second join and
after `saveAll`; `main` keeps ticking and takes a new player. Control
watched to fail (2026-11-23): the timer's try/catch removed, the check
process died with the review's `TypeError: n.offenders is not iterable`.

## At a deploy (SIGTERM)

Railway stops the old server with SIGTERM and starts `npm start`. npm runs
a script through `sh -c`, and the shell (dash) does not pass the signal
on, so with `"start": "node dist/server.cjs"` node never heard it and no
game was saved. The start script is now `exec node dist/server.cjs`
(`INTENT:`): npm → node, and npm forwards SIGTERM. The server prints
`irreverents stopping on SIGTERM: saved N kept game(s)`.
`GET /game/<CODE>` also answers `savedAt`, which is how to see on live that
the stop-save ran (it falls just before the new server's `startedAt`).

Proof: `scripts/checks/step17-stop-save.ts` (under 1 s): `npm start` in its
own process group, one player in a kept game, SIGTERM to npm, and the line
must say 1 game saved. Control watched to fail (2026-11-23): without `exec`
the line never came, npm exited and node was left running.

Railway's time between SIGTERM and SIGKILL defaults to 0 s, so
`railway.json` sets `deploy.drainingSeconds: 10` (`DRAFT:`; the key as the
orchestrator found it in Railway's docs by search, 2026-11-23; nobody here
can open docs.railway.com). The save is synchronous and takes milliseconds;
10 s is room for many games. **`railway.json` stops being read on
2026-12-01** (`docs/mechanisms/deploy.md`, Traps): the migration must carry
the draining seconds over, or set `RAILWAY_DEPLOYMENT_DRAINING_SECONDS`.
Measured on live after a deploy: `GET /game/<CODE>` `savedAt` for a game
being played falls just before the new server's `startedAt`.

## What a save does not keep (`DRAFT:`, the owner decides by playing)

Where each player stood and what they carried (they come back in at the
start, as on any join); a world's `?tune` numbers; `main` (it is never
forgotten while the server runs, D-077, and is not saved). Old saves are
never deleted.

## Proof

`scripts/checks/step17-saves.ts`, in `npm run check` (about 2 s): a store
in a temporary directory; a game gets a room part's state and a moved body;
its player leaves; the save on disk has one record and no player; a new
server on the same directory: joining the game again has both, and only the
new player. Control in the same check: a second, new code has neither. A
record from an "older build" naming a gone room and a gone kind (and a
player) loads without them, said exactly once. Control watched to fail
(2026-11-23): `save` made to do nothing, the check named four failures (no
file, no "exists", the part state and the body's place gone).

## Traps

- **A deploy is a restart.** The new build loads what the old one wrote:
  test any change to the record or to content ids against an old record.
- The tick loop keeps simulating a game while it has players, even all
  away; it is saved and forgotten only once the last is removed.

## The start screen (`src/client/start.ts`, push 2)

`src/client/main.ts` decides before anything joins a world:

- **`?room=<name>`** joins that world at once, as before Step 17 (`INTENT:`
  at the code: every scripted check depends on it).
- **Otherwise** `showStart()`: a tab that was already playing (its world in
  sessionStorage, `irreverents.playing`) goes straight back in, so a
  reload, and the reload after a deploy, need no tap; a `?game=CODE` link
  shows one big **Join CODE** tap with **Start screen** beside it; else the
  start screen: **New game** (the page makes the code and passes over one
  `GET /game/<CODE>` says exists), **Join a friend** (a field upper-cased
  as typed, letters of the code only; an unknown code says "No game CODE"
  and stays), **Continue** (the newest three of the games this phone
  played, `irreverents.games` in localStorage; hidden when none) and
  **Everyone's kingdom** (`main`). Every fixed choice is in one column and
  Continue in another, side by side when the screen is wide: sideways
  (390 px high) the Continue list never pushes a fixed choice off screen.
- Choosing replaces the address with the game's share link (`?game=CODE`,
  or the bare address for `main`) and calls `play(world)`, which is the
  page as it always was.
- **In play**, a three-bar button in the top-left corner (the sound
  button has the top-right) opens a panel: a kept game's code and
  **Share** (`navigator.share` with the link, else copied), then **Back to
  the start screen** (`INTENT:` the way out; it says `bye` and loads the
  bare address) and **Close**. A `?room=` world has only Back and Close.
- Words are the game's pixel font (`content/looks/font.json`,
  `font-light`), drawn on small canvases at whole device pixels per font
  pixel; plain text until the font loads. The code field is 24 px (under
  16 px iPhone zooms the page) and sits in the upper half, above the
  keyboard. Sound starts on the first tap, as before: `createAudio` now
  runs before the start screen, so that tap is any of its buttons.

Hardening push D (the review of 884bb80, five bugs), each with an e2e fact
watched to fail on push C's client:

- **`?tune` survives the start screen** (`INTENT:` in `start.ts`): every
  address it writes keeps `tune` (`?game=ABCD&tune`), the link page's Start
  screen and the menu's Back keep it, and `main.ts` reads the flag once at
  load (`start-tune`; control: no Tune button after New game).
- **Nothing covers the menu button**: on a `?tune` page the Tune button
  sits at the view's top-left, so the menu moves just right of it when they
  overlap (`INTENT:`; `start-tune` taps the centre of each; control: the
  menu could not be tapped).
- **Two columns from 568 px wide** (each 250 to 330 px): `start-sideways`
  measures 750×340 (Playwright's iPhone 14 sideways) and 667×330 (an iPhone
  SE sideways at Safari's real height); control: Continue off screen at
  667×330.
- **The link page's Start screen forgets the world this tab played**
  (`start-link-back`; control: it dropped into `main`).
- **Pasting**: no `maxlength`; `codeFromText` (`src/net/game-code.ts`;
  `scripts/checks/step17-codes.ts`) takes `game=XXXX` from a link, the last
  whole code from a message, else the letters (`start-paste`; control: HTTP,
  JN, ABC).
- **Continue asks first**: a game whose save is gone says "That game is
  gone" and leaves the list (`start-continue-gone`). When neither share nor
  copy works, the menu shows the link small and wrapped under the code.

e2e facts `start-*` (`scripts/e2e/start-screen.ts`, local runs only: a run
leaves a save on the server's volume): `start-shown` (the bare address
shows it, every choice on screen and 44 px or more, the field 16 px or more
and in the upper half), `start-unknown`, `start-new`, `start-sideways`
(at 750×340 and 667×330 with four games remembered: all seven choices on
screen), `start-join` (the
menu's code, Close, the link's one tap, sound unlocked by it, each page
draws the other), `start-back` (back, Continue lists the game first, the
friend's page stops drawing them), `start-room` (`?room=` never shows it,
its menu has only Back and Close). Screenshot:
`docs/plan/step-17-shots/start-screen-390x664.png`.
