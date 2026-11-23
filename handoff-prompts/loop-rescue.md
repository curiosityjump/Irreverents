# Core loop 4, characters to unlock: someone in the cage (Step 13)

Brief for one cold builder. Written 2026-11-23 19:40 UTC by the core-loops
re-plan (`docs/plan/core-loops.md`, section 4; read it and its "Names the
slices share" table first). The step is `docs/plan/step-13.md`. Read
`docs/mechanisms/cantina.md`, `docs/mechanisms/party-and-switching.md`,
`docs/mechanisms/outposts.md`, `docs/mechanisms/saves.md`,
`docs/mechanisms/network.md` ("Traps") and `docs/mechanisms/art-pipeline.md`
("Approved Drive assets first") before writing anything.

**Before you start:** `git log --oneline -- src/sim/use.ts`. If it is empty,
the Use arbiter (`handoff-prompts/loop-heist.md`, push 1) is not on `main`:
do push 1 below, which needs no Use, then wait and tell the orchestrator.
**Write no Use press reader of your own.**

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-13.md`, "Builder notes".

**Small pushes, each standing alone and fully checked.** A push to `main` is
the deploy.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"): **"I want to play it as I described it.
There are no ... characters to unlock ... Virtually everything described in
the vision docs that would make the game genuinely fun to play is yet to be
seen at all"**

Every hero is unlocked from the first second and nothing in the world unlocks
anyone. This slice puts one hero in a cage in the Bandit Camp, two rooms from
the start, to be freed quietly or in a fight and kept for good. It moves no
row of `docs/plan.md`'s table; it is read by the owner playing.

The library (doc 11): **D-007** "Unlockable and permanently expanding roster
of characters discovered in the world"; **D-011** local characters may be
swapped in mid-region; **D-082** unlocks are permanent, unlike powers;
**D-083** every unlocked hero wanders the cantina; **D-084** swap by tap.
Doc 05: "Players begin with a subset", and a new hero should make two earlier
places worth revisiting. Doc 36: the canon three are the start. O-003 (party
size) is OPEN and stays three. Every roster name in the library is EXAMPLE
(E-006): names are data, never ids.

## Measured for you (main at a0f402c; nothing was run in the repository)

- **The roster** is `content/roster.json`: grappler, infiltrator, flyer,
  brawler, skirmisher, "All unlocked". It is read from content, never the
  world, at: `src/sim/systems/cantina-regulars.ts:31` and `:42`;
  `src/scenarios/facts/cantina.ts:36`; `scripts/checks/step11-cantina.ts:118`
  and `:180-181` (it requires **two** roster characters outside the party);
  `scripts/e2e/cantina.ts:101`; the content check
  `src/content/kinds/cantina.ts:197-200`. `src/sim/cantina.ts` has no roster
  read.
- **Nine `step11-*` scenarios name the brawler or the skirmisher:**
  bell-ends-brawl, join-after-swap, last-player-leaves, regulars-wander,
  row-closes, row-not-in-brawl, swap-self, swap-taken, swap-unplayed.
- **A scenario cannot seed a world field** (`src/scenarios/types.ts`, the
  `Scenario` interface: players, entities, tiles, placements, placedRooms).
- **A freed hero walks into the cantina with no cantina code:**
  `cantina-regulars` makes one wanderer per roster hero nobody plays.
- **The camp** (`content/rooms/outpost.json`, `content/placements/outpost.json`,
  `content/outposts/outpost.json`): the floor is row 10; a one-way ledge at
  row 6, columns 9-38, 80 px over the floor and above everyone's sight (40 px
  up or down, 112 px across); lookout at column 18, horn post at 20, fighter 1
  at 25 (left 8 s, right 3 s), **fighter 2 at 28 (right 7 s, seeing to about
  column 35; left 3 s)**. **Waves walk in at [41, 10]** and, as measured by
  this plan's check, arrivals stand there for good until the waves slice
  lands: nothing of yours goes at columns 39-42.
- **The skirmisher** (`content/characters/skirmisher.json`): box 12 by 18,
  verbs move, jump, switch, body, attack, grab; `jumpSpeed` 330, which this
  plan's check puts at about 60 px of rise, short of the ledge's 80. The flyer
  flaps by data: the verb `flap` with `flapSpeed` 220 and `flaps` 3.
- **Faces are cut and drawn nowhere:** `hud-face-skirmisher`,
  `hud-face-brawler`, `hud-plate` (`content/looks/ui.json`). The heist slice
  builds the plate (`src/client/draw/hud.ts`).
- A page is sent only the entities of its own room
  (`src/server/game.ts:527`); world events reach every page (`snap.ev`).

## What to build (`DRAFT:` throughout; decisions-log entry "Step 13")

1. **Push 1, the roster is the world's.** `world.roster` (top-level,
   additive): the character ids unlocked in this game. **Absent means every
   roster character**, so no existing scenario, check or old kept game
   changes. `src/sim/roster.ts` gives the list; `cantina-regulars.ts:31` and
   `:42` read it. An additive scenario field that seeds top-level world fields
   (the runner, `src/scenarios/run.ts`; document it in
   `docs/mechanisms/scenarios.md`). `content/roster.json` gains `start`: the
   canon three and the brawler, so the cantina always has someone to hit and
   to swap. A new world people play in (the shared one, a new kept game) is
   given the start list where the server makes a world (`makeWorld`,
   `src/server/game.ts`, an agreed additive edit). **Every `step11-*`
   scenario, `scripts/checks/step11-cantina.ts` and the cantina e2e green.**
2. **Push 2, the captive.** A content kind `content/recruits/<id>.json`
   (`src/content/kinds/recruits.ts`): the character, the room and tile, what
   holds them (the cage's look), the hold in seconds, their call. System
   `recruit-place` puts the captive in the world as a **thing** with the deed
   `free` (a new `content/rules/` file lists the deed), never as a body:
   nobody can hit, grab or throw them, and they never count toward the camp's
   bound. Drawn in the cage with the hero's own sprite, and their call at the
   screen's edge (`bark-edge`). **Tonight: the skirmisher, in the camp, first
   guess columns 33-34, inside fighter 2's look east.**
3. **Push 3, FREE.** One entry in the Use list (`src/sim/use/free.ts`, the
   word in `content/prompts.json`): holding Use at the cage fills a small
   gauge, a little less than fighter 2's 3 s look away; letting go empties it.
   Done: `world.roster` gains the hero, event `recruited`, the cage opens, a
   fanfare, a banner saying who joined (`src/client/draw/banner.ts`), their
   face flashes onto the party plate. Then, for a few seconds, Use at the open
   cage swaps them in on the spot (the `become` effect and the same party
   change the cantina's self-swap makes: reuse its function); ignoring it
   leaves them to the cantina.
4. **Push 4, their reach.** A second jump in the air, by data: the verb
   `flap` and one flap in the skirmisher's files. Measure that they reach the
   camp's ledge from its floor, and whether any `step11-*` scenario's arc
   changes (the fallback is `jumpSpeed`, with the re-times listed as yours).
   Name in your notes two places already on `main` that this reach opens.

**How it reaches a phone:** `world.roster` is a top-level world field (copied
by key, kept with a kept game); `recruited` is a world event, so a friend in
another room gets the banner; the captive and the cage are entities of the
camp's room.

## Signal

- Scenarios in the real camp (`placements: true`), each with a control
  watched to fail: `step13-free-unseen` (ledge, drop, the hold inside fighter
  2's look away: `recruited`, the roster has the hero, no
  `outpost-call-started`; then as the new hero up to the ledge and out;
  control: the hold begun while he faces the cage, a call starts; second
  control: without the second jump the ledge is not reached);
  `step13-free-while-caught` (seen first: a call completes, a wave walks in,
  the captive is still freed and the hero leaves by the doorway; control: the
  `free` entry off, roster unchanged); `step13-hold-let-go` (released early:
  nothing happens); `step13-new-game-roster` (a world seeded with the start
  list has no such wanderer in the cantina, and has one after the rescue;
  control: the rescue skipped).
- `scripts/checks/step13-roster.ts`, a real server and **two connections** in
  a kept game: it starts with the start list; A frees the captive; B, in
  another room, gets `recruited` in its events and B's own world's roster has
  the hero; the roster survives everyone leaving and a rebuilt server
  (control: saving off).
- `npm run e2e`, phone page by touch, deterministic touches only: on entering
  the camp the page's drawn record (`window.irreverents.drawn`, an additive
  field) lists the cage and the captive's call; the party plate lists the
  faces. Leave the timed hold to the scenarios and the real-server check.
- Screenshots at 844×390 and 390×664: the cage from the ledge, the gauge, the
  banner, the new face; under `docs/plan/step-13-shots/`.

## Traps

- **Approved Drive assets first** (4ed30c3): `door-bars`, `door-barred` and
  `door-barred-raised` are cut (`content/looks/treasure.json`, 316e0a0), and
  the faces. If none reads as a cage with someone in it, ask the core-loop art
  cut-outs builder (its session is on the Sessions line of
  `docs/current-directive.md`). No hand-drawn final look.
- **You edit none of the camp's three files.** `content/placements/outpost.json`
  is the heist slice's (a strongbox near column 23), `content/outposts/outpost.json`
  the waves slice's. If fighter 2's post must move for the beat, ask the heist
  builder to make the edit. The cage's tile becomes a contract: the vehicles
  slice builds around it later.
- **Every `step12-*` (11) scenario stays green with the captive present**, and
  every `step11-*` (21).
- **`?room=` private worlds exist for checks.** Decide whether they get the
  start list; the cheap answer is that they keep every roster character, so
  `step11-cantina.ts:180` still finds its two. Log it.
- **A new game with fewer heroes thins the cantina's brawl** (D-085 wants it
  huge). The brawler stays unlocked for that reason. If you change the start
  list, say what the cantina shows with three players before any rescue.
- **Other builders nearby:** the heist slice owns `src/sim/use.ts`,
  `content/prompts.json` (you add one row), `src/client/draw/banner.ts` and
  `hud.ts`; do not edit `src/sim/party.ts` or `src/sim/verbs/switch.ts`
  without asking the orchestrator; hit prediction is in `src/client/main.ts`.
  `git pull --rebase` before each push.
- A page's own world runs systems too: `recruit-*` must do nothing there
  (as `cantina-regulars` does nothing without a `~cantina:` entity).
- **Read new fields with a default:** `world.roster` is absent in every old
  kept game and every existing scenario.
- `t-no-numbers`: the gauge is a bar, never a count.
- The cantina e2e has a known occasional flake (`docs/current-directive.md`,
  "Owed next" 4): re-run before blaming your change, and say so.
- Stop test servers by PID. If live is healthy on an older commit after a
  push, wait, don't revert.

## Out of scope

A second recruit (it needs a sixth hero from the approved P04 cantina sheet:
note it for the orchestrator); party size; the cantina's rules; the camp's
room; a barricade or a wagon (Step 20).

## Decided, and open

Decided by the owner: D-007, D-011, D-082, D-083, D-084. `DRAFT:`, yours to
log: who the captive is, the start list, hold-to-free and its length, the
second jump, the cage's tile, the swap on the spot, what `?room=` worlds get.
Nothing waits on the owner. For the owner to judge by playing, not asked:
whether the rescue felt like a rescue, and who should be found next.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed;
`check:deployed`, `check:live`; `/debug/errors` read. A "The roster grows"
section in `docs/mechanisms/cantina.md` (or a new `docs/mechanisms/recruits.md`
with its line in `docs/mechanisms/README.md`); the architecture's "I need to
add…" table gains "a hero to find" and its path table a Step 13 row;
decisions-log entries; `docs/plan/core-loops.md` section 4 updated to what
landed. Final message: done or blocked, the commit.
