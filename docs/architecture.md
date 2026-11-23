# Architecture

**Reference.** Open it before adding code or content: it says where each
kind of thing goes, who owns which paths, and how a shared shape may
change. Written by Step 1 Gate 1 (2026-11-23); the choices are `DRAFT:`
mechanics unless marked `INTENT:` in the code.

## The layout

```
content/            the game's data: what exists and how it feels
  tuning.json         every feel number (speeds, jump, gravity), one file
  game.json           where a player starts, and as whom
  rooms/<id>.json     one room's geometry, rows of characters + a legend
  characters/<id>.json  one kind of body: box, colour, verbs, tuning set
  party.json          the shared party: member character ids, in order
  actions/<id>.json   one pressable action: label and keyboard keys
scenarios/<id>.json  scripted play-throughs with the facts expected
src/
  content/          pure: content shapes and validators
    kinds/<kind>.ts   one content kind each (self-registering)
  sim/              pure: the simulation core
    types.ts          World, Entity, Input, events, Verb, System
    step.ts           step(world, inputs, content) -> events
    world.ts          createWorld, spawnPlayer, add/remove entity
    verbs/<id>.ts     one thing a character can do (self-registering)
    systems/<id>.ts   one pass over the world per tick (self-registering)
    check-content.ts  content checked against the verbs and systems
  scenarios/        pure: the scenario runner
    facts/<id>.ts     one kind of expectation (self-registering)
  client/           the browser page: canvas, keyboard, render
  server/           the one Node process: static files, /healthz, /ws
scripts/            build, check, gates, dev, trace; lib/ reads the disk
dist/               build output (git-ignored): server.cjs, public/
```

`tools/` and `docs/design-library/` belong to the design-library sync
(`docs/mechanisms/design-library-sync.md`): never bundled, linted or moved.

## Layers: who may import whom

| Layer | May import | Must not use |
|---|---|---|
| `src/content` | `src/content` | DOM, Node, packages |
| `src/sim` | `src/sim`, `src/content` | DOM, Node, packages, clocks, `Math.random` |
| `src/scenarios` | itself, `src/sim`, `src/content` | DOM, Node, packages |
| `src/client` | itself, `src/sim`, `src/content` | Node; never `src/server` |
| `src/server` | itself, `src/sim`, `src/content` | DOM; never `src/client` |
| `scripts` | anything | — |

`npm run check` enforces this twice: `tsconfig.pure.json` type-checks the
three pure layers with no DOM and no Node types, and
`scripts/lib/boundaries.ts` reads every import line. (The sim imports
content *types* and the small pure constants beside them, such as `TILE`.)

## The simulation core

- **One function:** `step(world, inputsByPlayerId, content)` advances the
  world one tick **in place** and returns that tick's events. A caller
  that needs a copy takes one; the world is plain JSON data.
- **Fixed timestep:** 60 ticks a second (`TICK_RATE`). Tuning numbers are
  per second; code multiplies by `DT`. Units are pixels at 320×180.
- **Deterministic:** same world + inputs + content gives the same bytes.
  No clock, no randomness, nothing outside the arguments. Entities stay
  sorted by id; verbs and systems run in `(order, id)` order. Every
  scenario runs twice and compares, which is what catches a slip.
- **N players:** each is an entity with `player` set; `inputs` is keyed by
  player id. A player with no input that tick holds nothing.
- **Rooms:** every entity carries its `room`, so one world can hold
  several rooms. Today everything outside a room's grid is solid.

## Where state lives

- **World state** is the `World` object and nothing else: `tick` and
  `entities`. Per-entity memory a verb or system needs lives in
  `entity.c.<its id>` (see `src/sim/verbs/jump.ts`).
- **Content** is validated once (`scripts/lib/content-files.ts`) and baked
  into both bundles as `__CONTENT__` at build time. It never changes while
  the game runs, and the deploy reads nothing from `content/` at run time.
- **Nothing is persisted.** No database, no files written, no accounts.
- **No external services.** The server is one process on Railway; `/ws`
  is a hello-and-echo until Step 1 Gate 2 owns the protocol.

## The action list (what a player can press)

`content/actions/` **is** the list: one file per action, its id the file
name. A player's `Input` for a tick is the stick (`x`, `y`) plus `held`,
the ids of the actions held down. Keyboard, touch and scenario files all
speak those ids, and a script can enumerate them by listing the directory
(or `content.actions` after loading). Only `jump` exists today; `attack`,
`grab`, `special` and `interact` are the names later steps are expected to
add (Step 2 adds a file each; Step 5 checks every entry has a touch control).

## Deploying

A push to `main` deploys **only when it changes a path listed in
`railway.json`**: `src/**`, `content/**`, `scripts/**`, `assets/**`,
`package.json`, `package-lock.json`, the `tsconfig` files, `railway.json`.
Documents-only pushes leave the running game alone. **A new top-level
path the running game needs must be added to that list** (and to
`scripts/lib/deploy-paths.ts`) or it will not go live. Every deploy has a
short gap in which the address does not answer, and resets the world.
`npm run check:deployed` says whether the live address runs what `main`
needs. Details, traps and the proof: `docs/mechanisms/deploy.md`.

## Self-registering files (the rule that lets steps work in parallel)

Four directories are registries: `src/content/kinds/`, `src/sim/verbs/`,
`src/sim/systems/`, `src/scenarios/facts/`. **Every `.ts` file in one
default-exports one thing and is picked up automatically**:
`scripts/lib/registries.ts` writes a git-ignored `index.gen.ts` beside
them, run first by build, check, gates, trace and dev. There is no list
to edit. Do not put helper files in those four directories.

The shared shapes grow the same way. `Content`, `Components` (per-entity
state) and `EventMap` (event types) are empty interfaces that each file
extends from its own file with `declare module '../types.ts' { … }`
(examples: `kinds/rooms.ts`, `verbs/jump.ts`, `systems/physics.ts`).

## I need to add…

| …a | Do this | Engine change? |
|---|---|---|
| **room** | `content/rooms/<id>.json`: `rows` of characters and a `legend` mapping each to `solid`, `oneway`, `empty` or `spawn`. Point `content/game.json` at it to start there. | No |
| **character kind** | `content/characters/<id>.json` (box up to 32×32, colour, the verbs it can do one per line, a tuning set name) plus that set under `characters` in `content/tuning.json`, holding exactly the numbers its verbs declare. Kinds today: `hero` (Step 1's stand-in, not in the party), the three party members `grappler` (18×30, heavy), `infiltrator` (10×12, quick, fits a one-tile gap), `flyer` (14×20, flaps), and the hit's crates and dummies. A mark for it on screen is optional, in `src/client/draw/entities.ts` (`MARKS`). | No |
| **party member** | A character kind that lists the `switch` verb, added to `members` in `content/party.json` (its place in the list is its place in the seating and switching order). `docs/mechanisms/party-and-switching.md`. | No |
| **NPC** | Not built yet (Step 4). The place: an NPC kind is data in `content/npcs/<id>.json` read by a new `src/content/kinds/npcs.ts`; its body is a character kind; who stands where is `content/placements/<room id>.json` (a new kind), never the room file; its response logic is a system in `src/sim/systems/`. An NPC in the world is an `Entity` with `player: null`. | Step 4 adds the kind files and systems |
| **object** | Not built yet (Step 2 for throwables, Step 7 for the machine). The place: `content/objects/<id>.json` + `src/content/kinds/objects.ts`; placed through the same placements files; in the world it is an `Entity`. | The step adds the kind file |
| **verb** (an action a character can take) | `src/sim/verbs/<id>.ts` default-exporting a `Verb` (its `order`, the tuning numbers and action ids it reads, `update`). If it needs a button, `content/actions/<id>.json`. List the verb id in each character that can do it and add its numbers to their tuning sets. | One new file, no edits |
| **rule** (a thing the world does every tick, or an "event → reaction" mapping) | A system: `src/sim/systems/<id>.ts` with an `order` (verbs run at 100, physics at 500; leave gaps). Step 4's authored event/role mappings should be data in `content/rules/` read by one such system. | One new file |
| **scenario** | `scenarios/<id>.json` (`docs/mechanisms/scenarios.md`). Find the numbers with `node scripts/trace.ts <id>`. Tag it `"gate": "A"`…`"F"` when it is evidence for a build gate. | No |
| **tuning number** | Declare it in the `tuning` of the verb (per character) or system (world) that reads it, with its range; put the value in `content/tuning.json`. `npm run check` names any number missing, out of range or unread. | Only the reader |
| **asset** | See "Where art plugs in". | Not yet built |
| **kind of content** | `src/content/kinds/<kind>.ts` default-exporting a `ContentKind` (`source`, `parse`, optional cross-reference `check`) and extending `Content`. | One new file |
| **kind of scenario fact** | `src/scenarios/facts/<id>.ts` default-exporting a `Fact`. | One new file |
| **event** | Extend `EventMap` beside the code that emits it; `ctx.emit('name', {...})`. | In your own file |

## Bodies: the events and state other steps read (Step 2)

`DRAFT:` names fixed 2026-11-23 04:40 UTC by the Step 2 lead with the
Step 1, 3 and 4 leads, before the code; Step 2's workers fill in any
extra fields here as they land. Every body is Step 2's, player or not.
Ids are entity ids; `by` is who did it, `target` whom it was done to.

| Event | Fields | Means |
|---|---|---|
| `hit` | `by`, `target`, `player` | an attack landed on `target` |
| `grabbed` | `by`, `target`, `player` | `by` picked `target` up |
| `thrown` | `by`, `target`, `player` | `by` threw `target` |
| `released` | `by`, `target`, `player` | `target` was set down, broke free or was let go |
| `impact` | `entity`, `player`, `other`, `speed` | a flying body struck `other` (an entity id), or a wall, floor or ceiling (`other: null`); one event per body involved |
| `flattened` | `target`, `by` | `target` is knocked out (`by` may be null) |
| `recovered` | `target` | `target` is back in play |

In `hit`, `grabbed`, `thrown` and `released`, `player` is the player id
of `by` (null when a non-player did it); in `impact` it is the player id
of `entity`.

The party's events (`docs/mechanisms/party-and-switching.md`):

| Event | Fields | Means |
|---|---|---|
| `switched` | `entity`, `player`, `from`, `to` | a player's entity changed character kind, in place; its id did not change |
| `switch-refused` | `entity`, `player`, `reason` | switch pressed and nothing changed: `no-fit` (no free member's body fits there) or `none-free` (every other member is being played) |
| `flapped` | `entity`, `player`, `left` | the flyer flapped in the air; `left` flaps remain before it must land |

- **Knocked out is `entity.c.flattened`**, present on any entity exactly
  while it is out (at least `{ ticksLeft }`). The body stays in the
  world where it fell.
- **A body that is not a player acts through `entity.c.input`**: an
  `Input` (`x`, `y`, `held`) that the verbs system gives to that body's
  verbs exactly as it gives a player their device's input. Step 4's
  systems write it; they never move a body themselves. A non-player
  body with no `c.input` holds nothing.
- **A kind with no weight or toughness numbers** gets the world
  defaults, so any character kind can be hit, grabbed and thrown.

## Where art plugs in

Nothing is drawn from images yet; `src/client/render.ts` draws rectangles.
The intended shape, so art arriving tonight drops in as data:

- The game keeps its own copies under `assets/` (the design-library mirror
  is reference, never runtime); the build copies them to `dist/public/assets/`.
- A **tile atlas** is named by the room (`"atlas": "<id>"`, additive) and
  described by `content/atlases/<id>.json`: image path, tile size, and
  which atlas cell draws each legend meaning.
- A **sprite sheet** is named by the character kind (`"sprite": "<id>"`,
  additive) and described by `content/sprites/<id>.json`: image path, the
  32×32 cell size, and frame lists per animation state.
- Collision never depends on art: the box in the character file and the
  legend in the room file stay the truth.

## Effects on a player

Each player's own character is simulated on that player's device. Anything
else that moves it (a hit, a hold, a throw, a door, a respawn) does so
through an **effect**: `emitEffect(ctx, entity, effect)` from
`src/sim/effects.ts`. It applies the effect to the body at once and
records an `effect` event. In one world (a scenario; any body the server
simulates) that is all there is. Across devices the network layer sends
each effect on a player's character to that player's page, which applies
it with the same `applyEffect` and acknowledges it; the server resends
until it does. **A verb or system that emits an effect writes no network
code. One that changes a player's `x`, `vx`, `room`… directly works in a
scenario and is lost between two devices.**

| `effect.kind` | Fields | Does | Typical emitter |
|---|---|---|---|
| `push` | `vx`, `vy` (pixels per second) | sets the body's velocity: sent flying | a hit, an impact, a throw (Step 2) |
| `hold` | `by` (entity id of the holder) | marks it held (`entity.c.effect.heldBy`), stops it | a grab (Step 2) |
| `release` | none | clears `heldBy`; free where it is now. Follow with `push` to throw | let go, break free (Step 2) |
| `move` | `room`, `x`, `y` (top-left of its box) | puts it there, standing still | a door (Step 3), a respawn |

- The event: `effect: { entity, player, effect }`. `heldBy(entity)` reads
  who holds a body, or null.
- **Who moves a held body:** whoever holds it, in the simulation (Step 2's
  carry system sets its position each tick). While a player's character is
  held, or has an effect its page has not acknowledged yet, **the server's
  copy of it is the truth** and the page follows; when it is free and
  acknowledged the page's own simulation takes over again.
- A held player's input still reaches the server every report, so "press
  jump to break free" is read where the holding is simulated.
- The list is additive: a new kind is a new member of `Effect` and a
  branch in `applyEffect`.

## Which paths each plan step owns

A step adds files freely in its own paths and avoids editing others'.

| Step | Owns (from its step file's "Owns") | Paths |
|---|---|---|
| 1 (until it closes) | the page, input, network, server, build and deploy | `src/client/**` except `draw/`, `src/server/**`, `scripts/**`, `package.json`, `tsconfig*.json`, `railway.json` |
| 2 | movement and actions, combat and impact, the characters' data, the tuning data | `src/sim/verbs/**`, `src/sim/systems/` files named `combat-*`, `impact-*`, `carry-*`; `content/characters/**`, `content/actions/**`, `content/tuning.json`, `content/objects/**` and its kind file; `src/client/draw/entities.ts` |
| 3 | room data and format, its loader and validator, moving between rooms, the rooms' working parts, the camera, drawing tiles | `content/rooms/**`, `content/game.json`, `src/content/kinds/rooms.ts`, `src/content/kinds/game.ts`, `src/sim/systems/` files named `room-*`, `src/sim/systems/physics.ts`'s tile collision, `src/client/draw/room.ts` (tiles and camera) |
| 4 | NPC response logic, roles and rule data, who is placed where, seeing and hiding, calling for help, the area alert | `content/npcs/**`, `content/placements/**`, `content/rules/**`, their kind files in `src/content/kinds/`, `src/sim/systems/` files named `npc-*`, `alert-*`; a new `src/client/draw/npcs.ts` if NPCs need their own drawing |
| 5 (opens when Step 1 closes) | touch and keyboard input, on-screen controls, presence, joining and rejoining, the menu, the page shell | `src/client/**` except `draw/`, `src/server/**` |
| 6 | the throne room's people and props, the speech text, the speech clock and credits | `content/audience/**` and its kind file, `src/sim/systems/` files named `audience-*`, a new `src/client/draw/audience.ts` |
| 7 | the legend detector, Hall records and their display, the machine and the roadblock | `content/hall/**`, `content/machines/**` and their kind files, `src/sim/systems/` files named `hall-*`, `machine-*`, a new `src/client/draw/hall.ts` |
| 8 (opens when Step 1 closes) | the game's asset list and assets, how things are drawn beyond plain shapes, mood marks, sound | `assets/**`, `content/atlases/**`, `content/sprites/**` and their kind files, sound files and the code that plays them, a new `src/client/draw/sprites.ts` |
| everyone | their own checks | `scenarios/step<N>-*.json` (N is your plan step; Step 1's first three predate the rule), new files in `src/scenarios/facts/` |

Anything that draws is one file in `src/client/draw/`, called from
`src/client/render.ts` in one line: a step adds its file and its line.

**Files two steps must both touch** (keep each edit additive and small,
`git pull --rebase` right before): `src/sim/types.ts` (`Entity`, `Input`,
`World`), `src/sim/systems/physics.ts` (Step 3 owns tile collision;
Step 2 adds knockback and thrown bodies as its own systems where it can),
`src/client/render.ts` (one line per drawing layer),
`content/tuning.json` (one section per character; add sections, don't
reorder).

## Changing a shared contract

The contracts: the **world-state shape** (`World`, `Entity`,
`Components`), the **input shape** (`Input`), the **event list**
(`EventMap`), the **content schemas** (`src/content/kinds/*`), the
**scenario format** and fact vocabulary, the **tile codes** (`TILE`), and
every **id** in `content/` and `scenarios/`.

1. **Additive only.** Add an optional field, a new event, a new id, a new
   tile code. Never rename, remove, renumber or change the meaning of one
   once pushed: other sessions' code and data, and soon other players'
   devices, already depend on it.
2. **New fields are optional with a default**, so existing content,
   scenarios and worlds stay valid.
3. **Retire, don't delete:** stop using an id and say so; leave it readable.
4. **Say it in the commit** when a contract grew: which one, what was added.
5. **Run `npm run check` before the push**; every scenario of every step
   must still pass. A scenario that must change because behaviour changed
   on purpose is its owner's call, not yours: ask.
