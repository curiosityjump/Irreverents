# The cantina: an endless brawl

**Reference.** Open before touching `content/cantina/`, `content/roster.json`,
`content/rooms/cantina.json`, `src/sim/cantina.ts`, the `cantina-*` systems,
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
  the bell (`why: "bell"`), no player in the room (`"empty"`), or
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

## Checks

Scenarios `step11-*` (regulars, door, brawl start and not, ring-out,
walk-off, friend launch, last player leaves, bell, bell out of reach,
raises nothing), each with a control watched to fail; the fact
`cantina` (`docs/mechanisms/scenarios.md`); the real-server check
`step11-cantina` (two connections, regulars only on the server, a
launched player brought back by `move`, acknowledged, able to run).

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
`docs/decisions-log.md`. Slice B: the tap, the row, the swap, the chase
lock on the door.
