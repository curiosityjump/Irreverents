# Step 3 — A small kingdom to explore

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-003), via `docs/vision.md`:**
> World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub.

**Owner (Drive, doc 01):**
> The game should continually invite: "What if I tried THAT?" Discoveries reward curiosity.

The library's second build gate (doc 24, gate B): "hand-built 4–6 room map
is explorable, revisitable and supports two unadvertised routes."

## Goal

Five connected rooms to run around in together: a throne room, a castle
street, a hidden undercroft, a courtyard and a Hall gallery. Two routes
between them that nothing points at, and one secret only one kind of
character can reach. Two players can wander into different rooms and find
each other again, each with their own view on their own screen.

## What's decided

- **The five rooms are doc 24's own miniature kingdom** ("How a
  ten-minute session becomes actually buildable"): a proposal, used as the
  placeholder map (D-096). Room ids are contracts once deployed; names and
  layouts are `DRAFT:`.
- **Rooms are data** (tiles, doors, spawn points, secrets), validated at
  load. Adding a sixth room is adding a file.
- **Geometry here, people elsewhere.** Who and what stands in a room is a
  separate data file that Step 4 owns; this step owns the room itself.
- **There is always a way out**, checked by the validator, not by eye:
  every room reachable from every other, every door leads somewhere, no
  pit or pocket a character can enter and not leave.
- **Each player has their own camera.** The party is shared, the screen is
  not: the library confirms friends "possibly spread across regions"
  (doc 24, "Online co-op").
- **"Unadvertised" means no arrow, no glow, no text.** A route is found by
  curiosity (a wall that sounds different, a ledge just in reach).
- **Tiles are drawn from data too:** graybox now, and a 16 px tile atlas
  drops in when the ordered art arrives (`docs/mechanisms/asset-requests.md`).
  The experimental kit in the library (E01) is labelled experimental and
  has known defects (Q-006's note); the S00-01 "grassy ruins" candidates
  are look references, not tile atlases.

## What's open (the lead's to measure and decide)

- The layouts. Read `docs/design-library/02-gameplay-systems/04-world-structure-secrets-and-revisiting.md`
  and doc 24's kingdom section; the level anthologies (docs 25 and 28)
  are proposals to borrow shapes from.
- How a player learns where their friend went (an edge marker, a door
  that shows who is beyond it). Step 5 owns the on-screen part; agree it
  through `docs/architecture.md`.

## Feedback signal

1. `npm run check` validates every room: all reachable, doors resolve,
   spawn points stand on ground, no inescapable pocket (control: a room
   with a sealed pit fails the check).
2. Two scenario scripts each walk one unadvertised route from the throne
   room to somewhere the obvious doors don't lead as directly.
3. The character-only secret: reached by the right character, not by the
   others (control included).
4. Two players (`npm run e2e`): A walks to another room while B stays; each
   sees only their own room; B follows and they see each other again.
5. `npm run gates` reports gate B as passing.

## Stopping condition

The five signals pass on `main` and live, and "how to add a room" is in
`docs/architecture.md`. **Budget:** closed by about 08:45 UTC, 2026-11-23.

## Owns

Room data, the room format, its loader and validator, moving between
rooms, the camera, drawing tiles; exact paths as `docs/architecture.md`
assigns them.

## Taste, for the owner in the morning

Whether the rooms are interesting to move through; whether the hidden
routes feel like discoveries; the room names and shapes themselves.

## Measure

## Briefs

## Open with the owner

## Handoff notes
