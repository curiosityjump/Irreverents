# Architecture

**Reference.** Open it before adding code or content: it says where each
kind of thing goes, who owns which paths, and how a shared shape may
change. Written by Step 1 Gate 1 (2026-11-23); the choices are `DRAFT:`
mechanics unless marked `INTENT:` in the code.

## The layout

```
content/            the game's data: what exists and how it feels
  tuning.json         every feel number (speeds, jump, gravity), one file
  net.json            the network layer's rates, timeouts, player colours
  sprites/<character id>.json   a sprite sheet for that character kind
  atlases/<room id>.json        a tile image for that room
  game.json           where a player starts, and as whom; `mapStart`: where
                      the kingdom is entered from, for the map checks
  rooms/<id>.json     one room: rows of characters + a legend, its doors,
                      named areas and placed working parts
  characters/<id>.json  one kind of body: box, colour, verbs, tuning set
  party.json          the shared party: member character ids, in order
  prompts.json        the Use button's words, by Use entry and word key (Step 19)
  heists/<id>.json    a place with a prize: its room and prize things (Step 19)
  actions/<id>.json   one pressable action: label and keyboard keys
  npcs/<id>.json      one kind of person: role, side, a behaviour per mood, barks
  rules/<id>.json     what each role makes of each deed (NPC response logic's tables)
  placements/<room id>.json  who and what stands in a room: bodies, people, things
scenarios/<id>.json  scripted play-throughs with the facts expected
controls/rooms/<name>.json  broken rooms `npm run check` must keep refusing
src/
  content/          pure: content shapes and validators
    kinds/<kind>.ts   one content kind each (self-registering)
  sim/              pure: the simulation core
    types.ts          World, Entity, Input, events, Verb, System
    step.ts           step(world, inputs, content) -> events
    world.ts          createWorld, spawnPlayer, add/remove entity
    verbs/<id>.ts     one thing a character can do (self-registering)
    systems/<id>.ts   one pass over the world per tick (self-registering)
    npc/              NPC response logic's helpers: state, sight, rule lookup, behaviours
    check-content.ts  content checked against the verbs and systems
    check-rooms.ts    the room checks that need the simulation (Step 3)
    room-state.ts     tiles and part memory that change while the game runs
    room-routes.ts    doorToward: which door leads toward another room
  scenarios/        pure: the scenario runner
    facts/<id>.ts     one kind of expectation (self-registering)
  net/              pure: the network layer both ends share (protocol,
                    one player's client, smoothing)
  client/           the browser page: shell, keyboard, touch, render
    draw/<layer>.ts   one drawing layer each (room, entities)
  server/           the one Node process: static files, /healthz;
    game.ts           worlds, players, the tick, snapshots (/ws)
    store.ts          lasting records: named collections on the volume
scripts/            build, check, gates, dev, trace, e2e; lib/ reads the disk
  checks/<id>.ts      checks needing a real server (self-registering)
assets/             art the game uses, copied to dist/public/assets/
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
| `src/net` | itself, `src/sim`, `src/content` | DOM, Node, packages, clocks (time and the socket are passed in) |
| `src/client` | itself, `src/net`, `src/sim`, `src/content` | Node; never `src/server` |
| `src/server` | itself, `src/net`, `src/sim`, `src/content` | DOM; never `src/client` |
| `scripts` | anything | — |

`npm run check` enforces this twice: `tsconfig.pure.json` type-checks the
pure layers (the three above and `src/net`) with no DOM and no Node types, and
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
- **Rooms:** every entity carries its `room`, and one world holds every
  room all the time; nothing is unloaded or reset when a room empties
  (D-077). Everything outside a room's grid is solid: doors are tiles
  *inside* the grid, and `src/sim/systems/room-doors.ts` (order 600,
  after physics) moves whatever stands in one to the room it leads to.
  A tile's collision can change while the game runs
  (`tileAt` / `setTile` in `src/sim/room-state.ts`, state in
  `World.rooms`). Writeup: `docs/mechanisms/rooms-and-doors.md`.

## Where state lives

- **World state** is the `World` object and nothing else: `tick`,
  `entities`, and `rooms` (per-room tile overrides and working parts'
  memory; absent until something changes). Per-entity memory a verb or system needs lives in
  `entity.c.<its id>` (see `src/sim/verbs/jump.ts`).
- **Content** is validated once (`scripts/lib/content-files.ts`) and baked
  into both bundles as `__CONTENT__` at build time. It never changes while
  the game runs, and the deploy reads nothing from `content/` at run time.
- **Lasting records are the store's and nothing else's**
  (`src/server/store.ts`; next section). No database, no accounts. The
  server opens it at start (`src/server/main.ts`). Its first user is
  saved games (Step 17, `docs/mechanisms/saves.md`): a world named
  `game-<CODE>` is saved there and rebuilt from it; `main` and `?room=`
  worlds are not saved, so a restart gives them a fresh world. The Hall's
  records are next (`docs/plan/step-7.md`).
- **No external services.** The server is one process on Railway; `/ws`
  is the network layer (`docs/mechanisms/network.md`): one `World` per
  named world on the server, and on each page a local world holding that
  player's own character.

## Lasting records: the store

`src/server/store.ts` is the one place anything is kept across a restart:
named collections of small JSON records on the owner's Railway volume.
Proof: `node scripts/check-store.ts` (13 checks against a temporary
directory; not yet part of `npm run check`).

**To keep a collection from another step** (server code only; the
simulation never sees the store):

```ts
const things = store.collection<Thing>('found-secrets'); // lower-case letters, digits, dashes
things.all();            // every record, oldest first (a copy)
things.add(record);      // kept, and written at once
things.replaceAll(list); // the only way a record is ever dropped
```

The server opens one store at start
(`openStore(storage.mounted ? storage.path : null)`; the exact lines are
the comment at the top of `store.ts`) and passes collections to whoever
needs them. What goes in a record is plain JSON; give it its own `v`.

The rules, each `INTENT:` in the file:

- **Nothing in it throws, and nothing in it may stop the server
  starting.** A missing file is an empty collection. A file that does not
  parse, or is a newer version than the code knows, is renamed aside
  (`<name>.unreadable-<n>.json`), never deleted or written over. A failed
  write leaves the records in memory. All of it is listed in
  `store.problems` (and `store.status()`, meant for `/healthz`).
- **The file's shape is a contract once on the live volume:**
  `<volume>/irreverents/<name>.json` holding `{ "version": 1,
  "collection": "<name>", "records": [...] }`. Additive only; top-level
  fields the code does not know are kept on rewrite. Code reverts, the
  volume does not.
- **Written safely:** a temporary file beside it, flushed, renamed over.
- **The directory comes from the caller**, Railway's own mount path and
  only when `storageStatus().mounted` is true; never a hard-coded path.
  The store makes its own subdirectory and never lists or cleans the
  mount's root.
- **No volume means in memory**, and it says so: `store.lasting` and
  `collection.lasting` are false. Anything shown to a player about kept
  records should say so too.
- `DRAFT:` a collection past 500 records is reported, not trimmed; the
  whole file is rewritten on every `add`, which is fine at this size and
  not at thousands.

## The action list (what a player can press)

`content/actions/` **is** the list: one file per action, its id the file
name. A player's `Input` for a tick is the stick (`x`, `y`) plus `held`,
the ids of the actions held down. Keyboard, touch and scenario files all
speak those ids, and a script can enumerate them by listing the directory
(or `content.actions` after loading). `jump`, `switch`, `attack` and
`grab` (Step 2) and `interact` (Step 4: use the nearest thing; read by
the `npc-interact` system, not a verb) exist today; `special` is a name
a later step is expected to add (a file each; Step 5 checks every entry
has a touch control). An action file may carry an optional `icon` (Step
5): the picture its touch button shows, a path under `assets/`; with
none, or if the file fails to load, the button shows `label`. `DRAFT:`
`switch` shows the delivered "special" picture until a `special` action
exists.

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
| **room** | `content/rooms/<id>.json`: `rows` of characters and a `legend` mapping each to `solid`, `oneway`, `empty`, `spawn`, `{ "door": "<door id>" }` or `{ "part": "<part id>" }`. Optional: `doors`, `areas`, `parts`, `hidden`. A room with no doors is a standalone room (a test room); a room with doors must be reachable from the start room and back. Full format: `docs/mechanisms/rooms-and-doors.md`. | No |
| **level** (several rooms joined into a run) | Rooms as above, joined by doors, one of them to a room already on the map (both ends written); placements for its loose things. Keep the main way inside what every party member can do alone (measure with `node scripts/trace.ts`) and let `npm run check`'s way-out check play the rest. A scenario per hero that walks it end to end. Then one level file, `content/levels/<id>.json` (its name, its rooms, the doorway in and its entrance art), so its doorway is drawn as an entrance and its discovery and pie are counted (`docs/mechanisms/levels.md`). The quarry is the example (`content/rooms/quarry-*.json`, `content/levels/iron-quarry.json`, `scenarios/step16-*`, `docs/mechanisms/rooms-and-doors.md`). | No |
| **piece** (a thing to find in a level) | One entry in `content/completion/<level id>.json`: placed (`room`, `tile`, `look`: a cut `item-*`) or `from` a once-only thing taken or a prize banked. Ids never say what it is. A scenario that a hero someone plays finds it (`docs/mechanisms/levels.md`, "Pieces"). | No |
| **hero to find** (Step 13) | A roster character outside `content/roster.json`'s `start`, then one file `content/recruits/<id>.json` (character, room, cage tile, hold seconds, call). It is placed caged in every new world, freed by holding Use, and kept (`docs/mechanisms/recruits.md`). | No |
| **set** (a level's pieces) | The file `content/completion/<level id>.json` itself, named after its level (`content/levels/`). What it builds is its `builds`: a character (`content/characters/set-<level>.json`, a sheet in `content/sprites/`), a room and a tile; it appears when the last piece is found (`docs/mechanisms/levels.md`). | No |
| **enemy kind** (a bad guy that fights) | Data only: `content/characters/<id>.json` with the verbs `move`, `attack`, `body`; its tuning set at the end of `characters` in `content/tuning.json` (`weight` decides how far a hit sends it and who can lift it, `toughness` how much wear drops it); `content/npcs/<id>.json` with `side: "bad"` and Step 4's three moods. Step 12's `outpost-fight` system then makes any placed one walk at a hero it sees and swing, in any room, or, with `ranged` in its NPC kind, throws (`docs/mechanisms/ranged.md`); no fight code. Place it in `content/placements/<room>.json`. Examples: `heavy-fighter`, `brute` (Step 16). | No |
| **door** | In *both* rooms: an entry in `doors` (`id`, `use`: `walk` or `enter`, `to`: `{ room, door }`, optional `hidden`), a legend letter `{ "door": "<id>" }`, and that letter in `rows` as one filled rectangle. `walk`: on the room's edge (or a hole in its last row); anything that touches it is carried through, speed kept. `enter`: a doorway inside the room, standing on a floor; a body goes through on a fresh push of the stick up. The check refuses ends that disagree. | No |
| **kind of working part** (a plate, a gate, a breakable wall) | One system file `src/sim/systems/room-<kind>.ts` that declares the kind in its `parts: { "<kind>": { what, blocks?, check? } }` (`blocks: true` if it can stand in the way: the way-out check then treats its tiles as solid) and drives it in `run`: read the placed parts from `content.rooms[id].parts` (`id`, `kind`, `tiles`, `params`), keep their memory with `partState(world, roomId, partId)`, make tiles solid or open with `setTile(world, room, tx, ty, TILE.solid \| null)` (`src/sim/room-state.ts`). A room places one with an entry in `parts` (`id`, `kind`, `params`) and a legend letter `{ "part": "<id>" }`. A kind no system declares is refused, listing the known kinds. | One new file |
| **character kind** | `content/characters/<id>.json` (box up to 32×32, colour, the verbs it can do one per line, a tuning set name) plus that set under `characters` in `content/tuning.json`, holding exactly the numbers its verbs declare. The kinds are the files in `content/characters/` (21 on 2026-11-23: the party `grappler` 18×30, `infiltrator` 10×12, `flyer` 14×20; the roster's `brawler`, `skirmisher`; Step 1's stand-in `hero`; the town's and camp's people; the quarry's enemies; crates, dummies and props). `ls` it rather than trusting a list here. A mark for it on screen is optional, in `src/client/draw/entities.ts` (`MARKS`). | No |
| **party member** | A character kind that lists the `switch` verb, added to `members` in `content/party.json` (its place in the list is its place in the seating and switching order). `docs/mechanisms/party-and-switching.md`. | No |
| **person** (an NPC in a room) | An entry in `content/placements/<room id>.json` `place`: `id`, `character` (the body), `tile`, plus `npc` (an NPC kind id) and a `routine` (`wait`, `face`, `walk-to`, `do` steps). At most 8 people per file. `populateRoom(world, content, roomId)` puts the body in the world as an `Entity` with `player: null`; the `npc-setup` system gives it `c.npc`; it acts by writing an `Input` to `entity.c.input`, never by moving itself. Details: `docs/mechanisms/npc-response.md`. | No |
| **role / kind of person** | `content/npcs/<id>.json`: `role`, `side` (`good` / `bad`), `moods` (exactly `"1"`, `"2"`, `"3"`, each a behaviour id) and `barks` (at most three words each). Its body is a character kind as above. Then rows for the role in `content/rules/`. | No |
| **deed** (a thing a person can witness) | Add its id to `deeds` in a `content/rules/` file and rows to `expect`. It happens through a routine's `do` step, a thing's `deed`, or an `events` row mapping a simulation event to it. | No |
| **thing to use** (a counter, goods) | An entry in the placements file's `things`: `id`, `tile`, `deed`, optional `keeper`, `once`, `look`, and (Step 19) `restock`: seconds until a taken one is back. The Use button's word is its deed's row in `content/prompts.json`. | No |
| **call point** (a bell an upset person rings for help) | A `things` entry with `"look": "bell"`, `"once": true`, `"deed": "break"`, optional `"side"`. `docs/mechanisms/npc-response.md`, "Calling for help". | No |
| **something Use does** (a new thing the phone's one context button can do) | One file `src/sim/use/<id>.ts` default-exporting a `UseEntry` (`id`, `order`: the door is 0, a thing 100, the cantina bell 200; `find` returns `{ entry, word, target?, at }` or nothing), and in the system that does it, act only when `useHere(world, content, e)?.entry === '<id>'` (`src/sim/use.ts`; `docs/mechanisms/heists.md`); the button's word is a row in `content/prompts.json` (`words.<id>.<word key>`). | One new file |
| **a place with a prize** (a heist: a guarded thing to carry out) | A `things` entry in the room's `content/placements/<room>.json` (`once`, deed `take`, no keeper), and one file `content/heists/<id>.json` naming the room and the prize with its `carried` and `taken` looks. The take, the carrying, the banking and the clean getaway then need no code (`docs/mechanisms/heists.md`). | No |
| **responder** (someone who answers a call) | Place a person whose NPC kind has the role `guard`, in the same room as the bell. | No |
| **behaviour** (a new thing a person can be doing in a mood) | Its id in `BEHAVIOURS` (`src/content/kinds/npcs.ts`) and its function in `src/sim/npc/behaviours.ts`. | Two small edits |
| **object** (a thing to pick up and throw) | A character kind listing the verb `body`, with `weight` and `toughness` (0 = cannot be knocked out) in its tuning set: see `crate`, `crate-heavy`. Place it with a line in `content/placements/<room id>.json`. There is no separate objects kind. Step 7's machine is still to come. | No |
| **throwable or hittable body** | The same: any character kind can be hit, grabbed and thrown; one with no `weight` or `toughness` gets the world defaults. To make a character able to hit or lift, list `attack` and/or `grab` in its `verbs` and add their numbers (`docs/mechanisms/combat-and-impact.md`). | No |
| **verb** (an action a character can take) | `src/sim/verbs/<id>.ts` default-exporting a `Verb` (its `order`, the tuning numbers and action ids it reads, `update`). If it needs a button, `content/actions/<id>.json`. List the verb id in each character that can do it and add its numbers to their tuning sets. | One new file, no edits |
| **rule** (a thing the world does every tick, or an "event → reaction" mapping) | A system: `src/sim/systems/<id>.ts` with an `order` (verbs run at 100, physics at 500; leave gaps). Step 4's authored role/deed mappings are data: add a row to `expect` or `reactions` in `content/rules/` (`docs/mechanisms/npc-response.md`), no code. | One new file |
| **roster character** (one more hero the cantina shows and a player could become) | A character kind as above (list the verbs it may use, D-008; give it `attack` to brawl), its tuning section, its id in `content/roster.json`, and its pattern in `content/cantina/cantina.json` `patterns`: a `walk` loop (`{ "walk-to": column }`, `{ "wait": seconds }`, columns inside the edge, at least one wait) and a `fight` (`reach` pixels, `swingEvery` and `jumpEvery` seconds). `npm run check` refuses a roster character with no pattern. It is in the party only if also added to `content/party.json` (tell Step 2's lead first). `docs/mechanisms/cantina.md`. | No |
| **fight pattern** (how a regular wanders or brawls) | Edit its entry in `content/cantina/cantina.json` `patterns`. | No |
| **scenario** | `scenarios/<id>.json` (`docs/mechanisms/scenarios.md`). Find the numbers with `node scripts/trace.ts <id>`. Tag it `"gate": "A"`…`"F"` when it is evidence for a build gate. | No |
| **tuning number** | Declare it in the `tuning` of the verb (per character) or system (world) that reads it, with its range; put the value in `content/tuning.json`. `npm run check` names any number missing, out of range or unread. | Only the reader |
| **asset** | The image under `assets/`, plus `content/sprites/<character id>.json` or `content/atlases/<room id>.json`. See "Where art plugs in". | No |
| **thing that moves a player from outside** (a hit, a hold, a door) | `emitEffect(ctx, entity, effect)`; see "Effects on a player". | No network code |
| **touch control** | Nothing: every file in `content/actions/` gets a button (`data-action="<id>"`). For a picture instead of the label, the optional `icon` on the action file: a path under `assets/` to a 48×24 PNG strip (normal, pressed). The layout is Step 5's. | No |
| **network number** | `content/net.json`. | No |
| **check that needs a real server** | `scripts/checks/<id>.ts` default-exporting a `ScriptCheck`. | One new file |
| **kind of content** | `src/content/kinds/<kind>.ts` default-exporting a `ContentKind` (`source`, `parse`, optional cross-reference `check`) and extending `Content`. | One new file |
| **kind of scenario fact** | `src/scenarios/facts/<id>.ts` default-exporting a `Fact`. | One new file |
| **event** | Extend `EventMap` beside the code that emits it; `ctx.emit('name', {...})`. | In your own file |
| **outpost** (a hostile camp: a horn, waves) | `content/outposts/<id>.json` naming its room, the placed horn post (a body listing `body`, like `signal-post`), the placed people who may call, the wave `entry` tile, the `bound`, the times and the `waves` table; the people and post in `content/placements/<room>.json`. See "How to add an outpost" below and `docs/mechanisms/outposts.md`. | No |
| **hostile pair** (two sets of people who fight on sight) | one entry in `content/hostility.json`'s `pairs`: `{ "a": { "role" and/or "side", "notRoles" }, "b": … }`, by `content/npcs/` role and side, so a new kind of the same side is covered with no edit; only bodies listing `attack` swing (`clash-fight`; `docs/mechanisms/outposts.md`, "Chase and clash"). | No |
| **a power** (something a hero takes and can lose) | `content/powers/<id>.json`: `name`, `icon` (a look), `atLeast` / `times` (numbers laid over the holder's own), `lends` (verbs), `fade`, `regain`. `npm run check` names a number no verb reads, or a lent verb's number left out. A new read site for a character's numbers must use `numbersOf` / `verbsOf` from `src/sim/powers.ts` (`docs/mechanisms/powers.md`). | No |
| **a carrier** (a body that drops a power when laid flat) | Its placed id, or its character kind, in the power's `carriers` (`content/powers/<id>.json`). It drops an orb when flattened and has it again when it gets up (`regain`). | No |
| **a weapon** (something any body with hands picks up, swings, throws and loses) | `content/weapons/<id>.json`: `name`, `looks` (by state), `grip`, `box`, `hit` (numbers laid over the holder's), `sources`, `thrown`, `carriers`. A new character's hand is a row in `content/grips.json` (or its `default`). `npm run check` names a look not cut or a `hit` number no character has (`docs/mechanisms/weapons.md`). | No |
| **a source** (a spot a power can always be taken from again) | An entry `{ id, room, tile }` in the power's `sources`. It is lit while nobody holds the power taken from it; a hero's middle over its tile takes it; a hero who took it adds its id to `world.sources` (`docs/mechanisms/powers.md`, "Sources"). | No |
| **speech / an audience** (a body that talks on and on) | `content/audience/<id>.json`: `speaker` (a placed body's id), `startLine`, `opening` (lines said once), `lists` and `tail` (digressions that go round for ever). The check refuses a line that repeats within three hours or does not fit two rows of 28 letters. Format and slots: `docs/mechanisms/royal-audience.md`. | No |

## How to add an outpost (Step 12)

1. A room (`content/rooms/<id>.json`) whose way out is an **enter**
   doorway (a body goes through one only by asking, and the camp never
   asks, so no fight can shut it: D-061). Leave a clear floor tile for the
   wave `entry`, away from the post and the camp.
2. Its placements: the horn post (a body with `"verbs": ["body"]`, weight
   1000, toughness 0: copy `content/characters/signal-post.json`), a
   caller (a person; copy `outpost-lookout`) facing the way heroes come,
   and fighters (bodies listing `attack`; copy `outpost-fighter`), at most
   8 people.
3. `content/outposts/<id>.json`: `room`, `signaler`, `callers`, `entry`,
   `bound`, `callTime`, `callAgain`, `breakHits`, `breakSpeed`, `waves`
   (rows of `{ "character", "npc" }`, harder row by row; the last repeats
   for ever). `npm run check` names anything that does not exist.

No code. The page draws the horn on the post by itself.

## Rooms and doors: what other steps read (Step 3)

- **The event:** `changed-room: { entity, player, fromRoom, fromDoor,
  toRoom, toDoor }`, once whenever anything goes through a door (`player`
  is null for a body nobody plays). A doorway whose pair is in the same
  room also emits it, with `fromRoom` equal to `toRoom`.
- **Doors carry any body, never only players** (D-077). A *walk* door
  needs nothing: a body that moves into it is carried, with its speed.
- **How a system sends entity X through an *enter* doorway D:** bring X
  to stand in D's tiles (the middle of its box inside the door's
  rectangle: `room.doors`, fields `tx`, `ty`, `w`, `h`), then either push
  its stick up for a tick the way any action is asked for
  (`entity.c.input.y = -1`; it must have been above -0.5 the tick before,
  a *fresh* push), or call `askForDoor(entity)` from
  `src/sim/systems/room-doors.ts`, which asks for exactly one tick and
  needs no fresh push. Either must happen before order 600 in the same
  tick. X arrives standing still in D's pair.
- **Where a friend went.** Every device has the whole `World`, so for
  every other party member it knows their entity's `room`; and
  `doorToward(content, myRoom, theirRoom)` (`src/sim/room-routes.ts`)
  gives the door of my room that starts the shortest way to theirs, or
  null (same room, or no way). Step 5 draws from those two facts; nothing
  is drawn yet. A door's `hidden` flag is there too: a marker should not
  point at a hidden door.
- **Working parts' events** (slice B; each `{ room, part }` names the
  room id and the part's id in that room's file): `plate-down`,
  `plate-up`, `gate-opened`, `gate-closed`, and `part-broken: { room,
  part, by, player, speed, look }` when a breakable wall or window gives
  way (`by`: the entity that went through it, or null; `player`: that
  entity's player or null; `speed`: px/s, 0 when a system broke it;
  `look`: `"wall"` or `"window"`). To break one from another system:
  `breakPartAt(ctx, roomId, tx, ty, by?)` in `src/sim/room-parts.ts`.
- **Hiding: `entity.c.roomHide = { in: "<part id>" }`.** Present exactly
  while a body stands still on the ground inside a `hide` part's tiles
  (the middle of its box), holding no action; gone the tick it moves or
  acts. Step 3 only sets and clears it (`src/sim/systems/room-hide.ts`,
  order 550). What being hidden does to being seen is Step 4's to read.
- **Tiles that change while the game runs** are read with `tileAt(world,
  room, tx, ty)`, never `room.cells` directly, by anything that asks
  "is this solid *now*" (physics does). `room.cells` is the room file.

## Places and pieces: the state and events other steps read (Step 14)

- **`world.levels`** `{ <level>: { seen: [<room> | <room>/<area>] } }` and
  **`world.found`** `{ <level>: [<piece id>] }`: top-level, only grow,
  kept with a kept game; read both with a default (`docs/mechanisms/levels.md`).
- **`place-found: { level, place, by, player }`**: a hero someone plays is
  inside a hidden room or hidden area for the first time in this world.
- **`piece-found: { level, piece, by, player }`** (`by`/`player` null when
  the piece came from a thing taken or a prize banked) and, on the last of
  a set, **`set-complete: { level }`**, and when the set builds something,
  **`set-built: { level, entity, room, x, y }`** (the body `built:<level>`). All three are world events
  (`snap.ev`), so a friend in another room hears and sees them.

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

Built by Step 2's hit slice, with these additions: `released` also has
`how` (`set-down`, `broke-free`, `let-go`, `dropped`); `attacked` (`by`,
`player`) is every swing, landed or not; `grab-refused` (`by`,
`target`, `player`, `reason: "too-heavy"`) is a grab that found only
bodies too heavy. `speed` in `impact` is pixels per second. A hit that
moves nothing (a friend's) still emits `hit`.

State on a body that other steps may read (never write; all optional,
present only while true): `c.flying` (`by`: the entity that started the
flight), `heldBy(entity)` from `src/sim/effects.ts` (the carrier; `c.held` holds
only the hold's timers), `c.carrying` (`id`: the carried
body), `c.beat` (in a held beat), `c.flattened` (`ticksLeft`, `by`),
`c.worn` (`amount`: wear so far, against the kind's `toughness`),
`c.impact` (`x`, `y`, `speed`, `tick` of the last impact or hit, for
drawing). `canAct(entity)` in `src/sim/body-state.ts` says whether a
body may do anything this tick; the verbs system runs no verb for one
that may not.
Added 2026-11-23 for drawing (Step 2 feel; the table with what each
says is in `docs/mechanisms/combat-and-impact.md`, "State"):
`c.attack.phase` / `.left`, `c.lastHit`, `c.landing`, `c.airborne`,
`c.grab.at`, `c.lastThrow`, `c.flap.at`, `c.stunned` (`why`).

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

`src/client/render.ts` draws a rectangle for anything that has no art
file, and the image for anything that has one. Art arrives as data
(Step 1 Gate 2; tried once with throwaway images, 2026-11-23, not yet
with delivered art):

- The game keeps its own copies under `assets/` (the design-library mirror
  is reference, never runtime); the build copies them to `dist/public/assets/`.
- A **tile atlas** is `content/atlases/<room id>.json`, named after the
  room it draws: image path under `assets/`, cell size, and the
  `[column, row]` for `solid`, `solidTop` and `oneway`.
- A **sprite sheet** is `content/sprites/<character id>.json`, named after
  the character kind it draws: image path, cell size, where the collision
  box sits in a cell (`anchor`), `fps`, and frame lists for `idle`, `run`
  and `air`. Sprites face right; the renderer mirrors them.
- `DRAFT:` both are keyed by file name rather than by a field in the room
  or character file, so adding art edits nobody else's file.
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
until it does (`docs/mechanisms/network.md`, "Effects"; only `push` has
been run across two devices so far). **A verb or system that emits an effect writes no network
code. One that changes a player's `x`, `vx`, `room`… directly works in a
scenario and is lost between two devices.**

| `effect.kind` | Fields | Does | Typical emitter |
|---|---|---|---|
| `push` | `vx`, `vy` (pixels per second); optional `fly: { by, met }` | sets the body's velocity: sent flying. With `fly` it also sets `entity.c.flying`, so the body cannot act until it comes to rest | a hit, an impact, a throw (Step 2) |
| `hold` | `by` (entity id of the holder) | marks it held (`entity.c.effect.heldBy`), stops it | a grab (Step 2) |
| `release` | none | clears `heldBy`; free where it is now. Follow with `push` to throw | let go, break free (Step 2) |
| `move` | `room`, `x`, `y` (top-left of its box) | puts it there, standing still | a door (Step 3), a respawn; a body let go where it would not fit (Step 2) |
| `flatten` | `ticks`, `by` | knocks it out: sets `entity.c.flattened`, so it cannot act until it recovers | toughness worn to nothing (Step 2) |
| `become` | `to` (a character kind), `x`, `y` (top-left of the new box) | the body becomes that character there, standing still (the field is `to` because `kind` names the effect) | a cantina swap of your own party member (Step 11) |
| `power` | `power` (a power id, or `null`), optional `src` (the source it came from) | sets or clears `entity.c.power`, the power the body holds; its numbers and lent verbs apply from the next tick (`src/sim/powers.ts`) | taking a power, a hard hit knocking it loose (Step 9, `docs/mechanisms/powers.md`) |
| `weapon` | `weapon` (a weapon id, or `null`), optional `src` (the source it came off), optional `uses` | sets or clears `entity.c.weapon`, the weapon in the body's hand; its `hit` numbers are laid over the holder's from the next tick (`src/sim/weapons.ts`, through `numbersOf`) | picking one up with Use, swapping (Step 23, `docs/mechanisms/weapons.md`) |

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
| 4 | NPC response logic, roles and rule data, who is placed where, seeing and hiding, calling for help, the area alert, the guard's whistle and the dispatch rows | `content/npcs/**`, `content/placements/**`, `content/rules/**`, `content/dispatch/**` (the town's tiers), their kind files in `src/content/kinds/`, `src/sim/systems/` files named `npc-*`, `alert-*`; `src/sim/npc/**`; `src/client/draw/npcs.ts`; `content/actions/interact.json`; `content/rooms/test-shop.json`; the facts `mood`, `event-where` and `people`; `scenarios/step4-*.json`; `scripts/checks/step4-*.ts`; `scripts/e2e/tiers.ts` |
| 5 (opens when Step 1 closes) | touch and keyboard input, on-screen controls, presence, joining and rejoining, the menu, the page shell | `src/client/**` except `draw/`, `src/server/**` |
| 6 | the throne room's people and props, the speech text, the speech clock and credits | `content/audience/**` and its kind file, `src/content/speech.ts`, `src/sim/systems/` files named `audience-*`, a new `src/client/draw/audience.ts` |
| 7 | the legend detector, Hall records and their display, the machine and the roadblock | `content/hall/**`, `content/machines/**` and their kind files, `src/sim/systems/` files named `hall-*`, `machine-*`, a new `src/client/draw/hall.ts` |
| 8 (opens when Step 1 closes) | the game's asset list and assets, how things are drawn beyond plain shapes, mood marks, sound | `assets/**`, `content/atlases/**`, `content/sprites/**` and their kind files, sound files and the code that plays them, a new `src/client/draw/sprites.ts` |
| 11 | the cantina: the roster, the brawl, its counter and bell, the street's door to it | `content/cantina/**`, `content/roster.json`, their kind files `src/content/kinds/cantina.ts` and `roster.ts`, `content/rooms/cantina.json`, `src/sim/cantina.ts`, `src/sim/systems/` files named `cantina-*`, `src/client/draw/cantina.ts`, `scripts/checks/step11-*.ts`, the fact `cantina`; agreed edits: the street's `to-cantina` doorway (column 20, rows 9-10), `populateRoom`'s one line, Step 2's three friend-share reads of `c.brawl`, two lines in `render.ts` (bell behind the bodies, counter on top, which is given `pv.me`); slice B: `ROOM_THEME`'s `cantina` line (`tools/art/tiles/`), `Input.tap` (`types.ts`, `cleanInput`, `main.ts`'s tap and `drawn.cantina`), `World.party` and its two reads (`party.ts`, `verbs/switch.ts`), the `become` effect, the scenario runner's `tap`, `joins` and `placedRooms`, `World.chased`, a door's `refuse` and its test in `room-doors.ts`, the fact `chased`, the street's `to-cantina` `refuse` line, one more line in `render.ts` (the refusal sign), `scripts/e2e/cantina.ts` and its one call line in `scripts/e2e.ts` |
| 13 | heroes found in the world and kept | new `src/sim/roster.ts`, `src/sim/recruits.ts`, `src/sim/use/free.ts`, `src/sim/systems/recruit-free.ts`, `src/content/kinds/recruits.ts`, `content/recruits/**`, `content/rules/rescue.json`, `content/sounds/recruited.json`, `src/client/draw/recruits.ts`, `src/scenarios/facts/recruit.ts`, `scenarios/step13-*.json`, `scripts/checks/step13-roster.ts`, `scripts/e2e/rescue.ts`; agreed additive edits: `content/roster.json` `start` and its kind, `World.roster` read by `cantina-regulars`, `makeWorld`'s start list (`src/server/game.ts`), the scenario runner's `world` seed, `populateRoom`'s one line, `swap` exported from `cantina-swap.ts`, `edgeBark`/`bubble`/`label` exported from `npcs.ts`, one row of `content/prompts.json`, lines in `render.ts`, `main.ts`, `audio/moments.ts`, `kinds/sounds.ts`, `room-controls.ts`, `e2e.ts`, `joinAs`'s optional input (`scripts/lib/save-harness.ts`), the skirmisher's `flap` (character file and tuning) |
| 16 | the quarry level: its rooms, placements, its depot's outpost file, three enemy kinds | new files only: `content/rooms/quarry-*.json`, `content/placements/quarry-*.json`, `content/outposts/quarry-*.json`, `scripts/e2e/quarry.ts`; the bodies and NPC kinds `heavy-fighter`, `brute`, `toll-keeper` in `content/characters/` and `content/npcs/`, and `content/rules/quarry.json` with their `content/tuning.json` sections; two agreed edits: the courtyard's `to-quarry` doorway (columns 17-19, rows 6-7) and the undercroft's `to-quarry-cave` door (column 0, rows 10-12) |
| 17 | the start screen, saved games | new files `src/client/start.ts`, `src/server/saves.ts`, `scripts/checks/step17-*.ts`, `scripts/e2e/start-screen.ts`, `docs/mechanisms/saves.md`; agreed additive edits (Step 5's paths): the world name in `src/client/main.ts`, one menu button in `src/client/shell.ts`, `makeWorld` and the last-player leave in `src/server/game.ts`, opening the store in `src/server/main.ts`, `src/client/index.html` |
| 18 | who fights whom: provoked good guys and enemies hitting heroes | new `src/sim/systems/fight-*.ts`, `scenarios/step18-*.json`, `scripts/e2e/fight.ts`; agreed edits listed in `docs/plan/step-18.md` "Owns" (one expression each in `src/sim/npc/behaviours.ts` and `alert-respond.ts`, `fights` in the NPC kind, `attack` and its numbers for guard, shopkeeper, villain, one filter in `outpost-fight.ts`, re-times of named step4/step12 scenarios) |
| 9 | powers you take and can lose | `content/powers/**` and `src/content/kinds/powers.ts`, `src/sim/powers.ts`, `src/sim/power-orbs.ts`, `src/sim/check-powers.ts`, `src/sim/systems/` files named `power-*`, `src/client/draw/powers.ts`, `scripts/checks/step9-*.ts`, `scripts/e2e/powers.ts`, `docs/mechanisms/powers.md`; one line each in `render.ts`, `main.ts` (`drawn.powers`) and `scripts/e2e.ts`; agreed one-line edits at the four read sites (`systems/verbs.ts`, `body-state.ts` `bodyNumbers`, `systems/physics.ts`), the `power` effect in `src/sim/effects.ts`, the hook in `check-content.ts`, the scenario player's `power` | 
| 19 | stealth you can read and a prize you carry out | new `src/sim/use.ts`, `src/sim/use/*.ts`, `src/sim/heist.ts`, `src/sim/systems/heist-*.ts`, `src/content/kinds/prompts.ts`, `heists.ts`, `content/prompts.json`, `content/heists/**`, `src/client/use-prompt.ts`, `src/client/draw/{banner,hud,use-hint,sight,band-cells,heist}.ts`, `scenarios/step19-*.json`, `scripts/checks/step19-*.ts`, `scripts/e2e/heist.ts`; agreed edits listed in `docs/plan/step-19.md` "Owns" (the Use selection in three systems, `sightBox` in `sight.ts`, `strongbox` and `restock` in `placements.ts`, the strongbox in `content/placements/outpost.json`, lines in `render.ts`, `main.ts`, `touch.ts`, `index.html`, `npcs.ts`, `audio/moments.ts`, `kinds/sounds.ts`, `room-controls.ts`) |
| 23 | weapons you pick up, swing, throw, lose and steal | new `content/weapons/**`, `content/grips.json`, `src/content/kinds/{weapons,grips}.ts`, `src/sim/weapons.ts`, `src/sim/loose-fall.ts`, `src/sim/systems/weapon-*.ts`, `src/sim/use/weapon.ts`, `src/client/draw/weapons.ts`, `src/scenarios/facts/weapon.ts`, `scenarios/step23-*.json`, `scripts/checks/step23-*.ts`, `scripts/e2e/weapons.ts`, `docs/mechanisms/weapons.md`; agreed edits listed in `docs/plan/step-23.md`, "Owns" |
| 20 | the machine (builder A) and the camp run (builder B) | builder A: `content/machines/**`, `src/content/kinds/machines.ts`, `src/sim/machines.ts`, `src/sim/systems/machine-*.ts`, `src/sim/verbs/drive.ts`, `src/sim/use/get-in.ts`, `src/client/draw/machines.ts`, `content/rooms/test-machine.json`, `content/outposts/test-machine.json`, `content/placements/test-machine.json`, the `ram-wagon` character and tuning set, `scenarios/step20-*.json` not named `step20-camp-*`, `scripts/checks/step20-*.ts`; agreed small edits: one row of `content/prompts.json`, one line in `src/client/render.ts`, the read in `src/sim/party.ts`, the face in `src/client/draw/hud.ts`, additive fields in `src/sim/types.ts`. Builder B: `docs/plan/step-20.md` "Owns" (the camp's files `content/rooms/outpost.json`, `content/placements/outpost.json`, `content/outposts/outpost.json`, one added prize in `content/heists/camp.json`, re-times of real-camp scenarios, `scenarios/step20-camp-*.json`, `scripts/checks/step20-camp.ts`, `scripts/e2e/machine.ts` and its call line in `scripts/e2e.ts`; push 3: the optional `rides` on a wave person in `src/content/kinds/outposts.ts`, its lines in `src/sim/systems/outpost-wave.ts` (the alarms builder stopped; brief 6400b44), the check room `content/{rooms,placements,outposts}/test-wave-wagon.json` and `scenarios/step20-wave-wagon-*.json`; the breakable looks in `src/sim/systems/room-breakable.ts` and `src/client/draw/room-parts.ts`, `docs/plan/step-20-shots/`). Step 7's row still lists `content/machines/**` and `machine-*`: Step 20 holds them now |
| 21 | risk: being beaten | `content/defeat/**`, `src/content/kinds/defeat.ts`, `src/sim/defeat.ts`, `src/sim/systems/defeat-*.ts`, `src/client/draw/condition.ts`, `scenarios/step21-*.json`, `scripts/checks/step21-*.ts`, `scripts/e2e/defeat.ts`, the facts `signaler` and `prize`; agreed small edits: the viewer's own copy passed to `render` (`src/client/main.ts`, `src/net/client.ts`, one line in `src/client/render.ts`), `defeat` in `scripts/lib/room-controls.ts`'s left-out list |
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
