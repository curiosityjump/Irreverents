# The cantina: an endless brawl

**Reference.** Open before touching `content/cantina/`, `content/roster.json`,
`content/rooms/cantina.json`, `src/sim/cantina.ts`, the `cantina-*` systems
(`cantina-swap` included),
`src/client/draw/cantina.ts` or `scripts/checks/step11-cantina.ts`.
Written by Step 11 slice A (2026-11-23). Plan: `docs/plan/step-11.md`.

## Why it is shaped this way

The owner (D-083 to D-086): every unlocked hero nobody is playing hangs
out and wanders in a cantina; attacking one starts a Smash-like bar fight
with knock-outs, launching offscreen and endless respawns for regulars
and players alike, a running K/D counter, and all of it **outside the
ordinary NPC systems**. On how it stops (Q-008): *"There is a bell in the
middle of the cantina player can use to stop fights."*

## The pieces

- **The room** `cantina` (`content/rooms/cantina.json`, `DRAFT:` layout):
  a stage floor (columns 2-23), a one-way side platform, a gutter one
  tile lower past each end of the floor, and the doorway `to-street`
  at column 3. The street's `to-cantina` doorway is column 20, rows 9-10.
  Push up to go through; nothing else uses them (a regular never pushes
  up, a thrown body never uses an enter door).
- **`content/roster.json`**: every character a player could be, in
  order. `DRAFT:` all unlocked. Must hold the party (`party.json`); the
  two roster-only characters `brawler` and `skirmisher` are not in the
  party (slice B brings them in by the swap).
- **`content/cantina/<room>.json`** (kind `src/content/kinds/cantina.ts`):
  `edge` (tiles; a body whose middle is outside is out), `pads`,
  `calmTime` (seconds; **0 = never**, which it is: the bell ends it),
  `bell` (`tile`, `reach` pixels), `friend` (the brawl's three shares)
  and one `pattern` per roster character (`walk` loop, `fight`). The
  check refuses a roster character with no pattern, a pad or walk column
  outside the edge, and a second cantina (regular ids name no room).
- **`~cantina:<room>`**: one bodiless entity (kind `~thing`) made by
  `populateRoom` (so by the server's `makeWorld` and a scenario with
  `"placements": true`). It holds `c.cantina` = `{ on, quiet, pad, rang,
  score }`. **`INTENT:` every cantina system does nothing in a world
  without it**, which is how a page's own world (only its own character)
  never grows regulars or counts a brawl twice. Proven by
  `scripts/checks/step11-cantina.ts` (control: guard removed, each page
  grows four regulars).
- **Regulars** (`cantina-regulars`, order 20): one body per roster
  character nobody plays, id **`cantina:<kind>`** (a contract; never
  renamed), **never `c.npc`**, so they witness nothing and a brawl raises
  no mood, call or alert (`step11-brawl-raises-nothing`; the same hit on
  a person upsets them: `step4-hero-hits-shopkeeper`). They act through
  `c.input`: the walk loop, or in a brawl the fight pattern (go for
  whoever hit them in the last 3 s, else the nearest body; swing and jump
  on a clock offset by their place in the roster; no random numbers).
  `INTENT:` never the stick up.
- **The brawl** (`cantina-brawl`, order 640): starts on a `hit` by a
  player landing on a regular in the room (a miss, standing by, anything
  else: no). While on, every body in the room carries `c.brawl` (the
  friend shares), removed the tick it leaves the room or the brawl ends.
  Ends: a player's fresh press of Use (`interact`) within `bell.reach` of
  the bell, not standing in an enter doorway (there Use goes through it) (`why: "bell"`), no player in the room (`"empty"`), or
  `calmTime` without a player's swing if it is above 0 (`"calm"`; the
  regulars' swings never count). The bell rings (`cantina-bell`) brawl
  or not.
- **Out and back** (`cantina-out`, order 650): in a brawl, middle past
  the edge or flattened → `cantina-out {entity, player, by}`, a fall for
  a player body, a knock-out for a player sender (flight's `by`, else
  flattened's, else `lastHit`; never itself), then flying, flattened,
  worn, beat, last hit and anything carried are cleared and the body is
  put on the next pad by the **`move` effect** (the only way to move a
  player; the page takes the server's copy, `c` included). Outside a
  brawl, past the edge is put back too, with no score (a walk off the
  stage).
- **Step 2's friend rule** (`attack.ts`, `impact-walls.ts`,
  `impact-bodies.ts`): for player on player only, the struck body's
  `c.brawl` share is read before the world's friend number.
- **On screen** (`src/client/draw/cantina.ts`, two lines in `render.ts`):
  the bell behind the bodies (`bell` / `bell-ringing` looks), and while a
  brawl is on, a strip along the top: each player in the room by their
  colour, "n KO n FALL". `INTENT:` no number over a hit (D-020).

## The party swap (slice B, D-084)

- **The tap.** `Input.tap` (`src/sim/types.ts`, optional): a tap on the
  game view itself, not on the pad or a button (those sit over it and take
  their own touches). `main.ts` turns a `pointerdown` on `#game` into room
  pixels (`(clientX - rect.left) * canvas.width / rect.width + camera.x`),
  or into `slot` when it lands on an open row's chip, and carries it in
  every input for 300 ms (`DRAFT:`) with a count `n`, so the server acts on
  it once (`c.cantinaTap` remembers the last `n`). **The server copies it
  in `cleanInput`** (`src/server/game.ts`); without that line every
  scenario passes and the live game ignores every tap (the real-server
  check's control).
- **The row** (`cantina-swap`, order 660, server world only): a fresh tap
  within `pick.reach` pixels of a regular **outside the party**, with no
  brawl on and the stick and buttons idle, opens that player's row:
  `~cantina`'s `c.cantina.pick[playerEntity] = { kind, until }`
  (`cantina-row-open`). It closes (`cantina-row-close`, `why`) on a tap
  elsewhere (`tap`; a tap on another outsider opens a row for them), the
  stick or any button (`moved`), a brawl (`brawl`), leaving the room
  (`left`), after `pick.seconds` (`time`), or the swap (`swap`).
- **The swap**, a tap on slot `i` with the row open:
  a member nobody plays → `world.party[i]` becomes the newcomer; your own
  member → that too, **and you become the newcomer** by the `become`
  effect (feet and middle kept, slid as a switch slides; `no-fit` refused);
  a friend's → `cantina-swap-refused {why: "taken"}`, nothing changes and
  the row stays open (`INTENT:` doc 06). `cantina-swap {entity, player,
  slot, from, to}`. The regulars follow by themselves: one per roster
  character nobody plays.
- **`World.party`** (optional; absent means `content.party.members`): read
  by `firstFreeMember` (so a friend joining later gets the world's party)
  and the switch verb. Written only in the server's world; a page takes it
  by key with each snapshot (`net/client.ts`), so the page's own switch
  cycles the swapped party.
- **On screen** (`drawCantina`, given `pv.me`): the row only on the picking
  player's screen: a swatch of the newcomer, `DRAFT:` "TAP ONE TO SWAP",
  one chip per member in party order in its colour, a friend's dimmed and
  crossed, your own with a notch under it; chips 34 game pixels (about
  57-68 CSS px on an iPhone). `drawn.cantina = { row, counter }`, the row
  in CSS pixels of the page.
- **Scenarios** may tap: an input span's `tap: { n, at: <entity id> }`
  (that body's middle each tick), `{ n, x, y }` or `{ n, slot }`; a
  player's `joins: <tick>` puts them in later (`docs/mechanisms/scenarios.md`).

## The chase lock (slice B, D-088)

- **`World.chased`** (optional): the player entity ids a good-side person
  is chasing now: `c.respond.phase === 'chase'` with that player in
  `c.respond.sight` (Step 4's responders; only guards respond). Written
  every tick by `cantina-chase` (order 590, before the doors) **in the
  server's world only** (guarded on `~cantina`): a page's world has no
  guards, and writing an empty list there would overwrite the server's
  every tick. Never deleted (a page copies top-level fields by key, so a
  deleted one would linger). `DRAFT:` an active chase, not a raised alert;
  a bad-side chaser (Step 12's camp fighters, `c.outpostFight`) never
  counts.
- **The door:** the street's `to-cantina` carries `"refuse": "chased"`
  (`docs/mechanisms/rooms-and-doors.md`); the page's own step refuses its
  own push up (`door-refused`). The cantina's `to-street` never refuses.
- **The sign:** for a second, a red no-entry sign over the doorway on that
  player's screen only, from their body's `c.doorRefused`
  (`drawDoorRefused`); no words.
- **The hold** (`chaseHold`, seconds, `DRAFT:` 1, in the cantina file;
  the lead, on doc 31: the cantina is "NOT a shortcut for breaking line of
  sight"): a player stays listed that long after a chasing guard last had
  them in sight (`c.cantina.seen`, optional). A guard standing over a hero
  loses sight for two ticks when the hero steps past them; without the
  hold a push on that tick gets in (`step11-chase-blink`, control
  `chaseHold` 0). The alert at 0, the chase is over and it opens.
- **The way out is checked:** the cantina kind's check refuses `refuse` on
  any door of a cantina room (`INTENT:` there is always a way out;
  control `controls/rooms/cantina-door-refuses.json`).

## Checks

Scenarios `step11-*` (regulars, door, brawl start and not, ring-out,
walk-off, friend launch, last player leaves, bell, bell out of reach,
raises nothing; slice B: swap an unplayed member, swap yourself, a
friend's refused, the row's closing, none in a brawl, a friend joining
after a swap; the chase lock: refused while chased and open after,
refused on the two ticks a guard blinks,
the same push with no chase, a bad-side chaser listing nobody), each with
a control watched to fail; the fact `chased`; the fact
`cantina` (`docs/mechanisms/scenarios.md`); the real-server check
`step11-cantina` (two connections, regulars only on the server, a
launched player brought back by `move`, acknowledged, able to run; a
tap through the real connection opens the row, a slot tap changes the
party on the server and both pages, an own-slot tap makes the player the
newcomer by `become`, and a third player joining gets the world's first
free member; the server's `chased` list reaches b's page, whose own push
up at `to-cantina` is refused, and goes in once the list is empty); and in
`npm run e2e` (`scripts/e2e/cantina.ts`, signal 8): two phone-sized pages
walk in by touch, a tap on an outsider opens the row (`drawn.cantina.row`),
a tap elsewhere closes it with nothing changed, a tap on a free member's
chip swaps on both pages and the switch button reaches the newcomer, and a
swing at a regular starts a brawl whose counter (`drawn.cantina.counter`)
both pages draw with the same numbers.

## Traps

- A system that spawns or counts must guard on `~cantina:<room>`: the
  page runs every system on its own world.
- Writing `x`/`y` on a player works in a scenario and does nothing live:
  use the effect.
- Bodies collide in flight: a launch across the stage can stop on a
  regular before the edge (the real-server check launches up and west).
- The doorway is a tile from the west gutter: a player overshooting it
  walks off the stage and is put back on a pad (`DRAFT:`).

## `DRAFT:` and open

Layout, numbers, patterns, the two characters, the counter's look and
words, the bell's place (column 13) and reach, friend shares at 1, no
ring-out upward (the ceiling), the walk-off put-back: all in
`docs/decisions-log.md`. Slice B's sizes, timings (`pick`), the row's
look and the tap's 300 ms likewise. The cantina's tiles borrow the `town`
theme (`tools/art/tiles/make.py`). The sign's look and time are `DRAFT:`.
