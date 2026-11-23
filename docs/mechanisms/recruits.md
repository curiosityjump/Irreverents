# Recruits: heroes found in the world and kept

**Reference.** Open before touching `content/roster.json`'s `start`,
`src/sim/roster.ts`, `World.roster`, `content/recruits/`, the `recruit-*`
systems, `src/sim/use/free.ts` or `scripts/checks/step13-roster.ts`.
Written by Step 13's builder (brief `handoff-prompts/loop-rescue.md`,
2026-11-23). Plan: `docs/plan/step-13.md`; `docs/plan/core-loops.md`,
section 4.

## Why it is shaped this way

The owner, after playing (2026-11-23): "There are no ... characters to
unlock". The library: D-007 (a permanently expanding roster discovered in
the world), D-082 (unlocks are permanent, unlike powers), D-083 (every
unlocked hero wanders the cantina), D-084 (swap by tap); doc 05 "Players
begin with a subset". Every roster name is EXAMPLE (E-006): names are data,
ids never change.

## The roster is the world's (push 1)

- **`content/roster.json`**: `characters` is everyone a player could ever
  play, in order; **`start`** (`DRAFT:`) is who a new game has unlocked:
  the canon three and the brawler, so the cantina always has someone to hit
  and to swap (D-085). The check refuses a `start` name outside
  `characters` and a party member outside `start`. Left out, `start` is
  everyone.
- **`World.roster`** (top-level, optional; declared in `src/sim/roster.ts`):
  the character ids unlocked in this game. **`INTENT:` absent means every
  roster character**, so every world from before Step 13 (an old kept game),
  every scenario that does not seed it and every `?room=` world keeps
  everyone. Read it through `unlocked` / `isUnlocked`; write it only
  through `unlock` (it only grows, D-082).
- **Who gets the start list:** `makeWorld` (`src/server/game.ts`), for a
  fresh world that is everyone's kingdom (`main`) or a new kept game.
  `DRAFT:` a `?room=` world (made for checks) gets none, so
  `scripts/checks/step11-cantina.ts` still finds two heroes outside the
  party; a kept game saved before Step 13 has none and keeps everyone.
- **Readers:** `cantina-regulars` makes a regular only for an unlocked hero
  nobody plays (so the swap row only offers them). A page takes the field
  by key with each snapshot and a kept game keeps it, as every top-level
  field (`docs/mechanisms/network.md`, `docs/mechanisms/saves.md`).
- **With three players before any rescue**, the cantina has one regular,
  the brawler: enough to start a brawl and to swap.
- **Scenarios** seed it with `"world": { "roster": [...] }`
  (`docs/mechanisms/scenarios.md`).
- **Proven by:** `step13-start-roster` (a start-list world's cantina has the
  brawler and not the skirmisher; control: the `isUnlocked` guard off, the
  skirmisher wanders) and `scripts/checks/step13-roster.ts` (a real server:
  a new kept game and `main` start with the list on the server and on the
  joining page, a `?room=` world has none; control: the `makeWorld` line
  off).

## The captive (push 2)

- **`content/recruits/<id>.json`** (kind `src/content/kinds/recruits.ts`):
  `character` (a roster character outside `start`, one place each),
  `room`, `tile` (the cage's bottom-left, on solid floor), `w` (tiles
  wide, default 2), `look` / `openLook` (optional; left out, plain drawn
  bars), `hold` (seconds of Use, push 3), `call` (the words), `callEvery`,
  `callFor` (seconds). `DRAFT:` tonight one file, `camp-captive`: the
  skirmisher at the Bandit Camp's columns 32-33, row 10, inside the second
  fighter's look east, just west of the camp's strongbox (column 34, Step
  19's prize), clear of the waves' entry at column 41.
- **The entity** `recruit:<id>` (`INTENT:` a contract once pushed; kept
  games hold it), kind `~thing`, `c.recruit = { id, character, open,
  hold }`, at the cage's bottom-left in pixels. **`INTENT:` a thing, never
  a body**: nothing hits, grabs or throws it, sight never sees it, an
  outpost's `bound` never counts it (`step13-captive-caged`; control: made
  a skirmisher body, the swing hits it).
- **Placed by `populateRoom`** (`placeRecruits`, `src/sim/recruits.ts`),
  like the cantina's entity, so only a world that is made (the server's
  `makeWorld`, a kept game's load, a scenario with `placements`) has one,
  never a page's own world. Not placed when the world's roster names the
  hero (`step13-captive-already-found`). **`DRAFT:` a world with no
  roster of its own (a `?room=` world, a game saved before Step 13) still
  gets the captive**, so the rescue is played there too; freeing them adds
  nobody new there.
- **On screen** (`src/client/draw/recruits.ts`): the captive drawn with
  their own sprite in the cage's middle, facing the viewer, the bars over
  them; every `callEvery` seconds for `callFor`, their call in a bubble
  over the cage, or at the screen's edge (`edgeBark`, the `bark-edge` chip
  with their head) when the cage is off screen. `drawn.recruits = { cages,
  calls }`. The cage is `cage-shut` / `cage-open` (P04's barred gate, cut
  by the core-loop art builder, `content/looks/outpost.json`); a recruit
  file without looks gets plain drawn bars (`drawBars`).

## FREE (push 3)

- **The Use entry `free`** (`src/sim/use/free.ts`, order 150: after the
  door and after a placed thing, so within the strongbox's reach Use still
  takes it; before the bell): a played body, not out cold, whose middle
  is within the cage's width (plus `DRAFT:` 22 px across, 20 px up/down)
  of a shut cage's middle answers word `free` (button: "Free",
  `content/prompts.json`); at an open cage, the freer alone, while the
  offer lasts, `swap` ("Swap in").
- **The hold** (`recruit-free`, order 61, server world only): a fresh
  press starts `c.recruit.hold = { by, ticks }` (`recruit-hold`); each tick
  Use stays held and the arbiter still answers `free` adds one; letting go,
  stepping away or being knocked out empties it (`recruit-let-go`).
  `INTENT:` one holder at a time; a friend's press does not reset it. Full
  at the recruit file's `hold` seconds (`DRAFT:` 2.2 s, a little less than
  the fighter's 3 s look west, leaving the slowest hero, waiting just out
  of his sight east of the strongbox, a few tenths to spare): the cage opens for good, `unlock` (the
  roster grows, D-082), event **`recruited { recruit, character, by,
  player, added }`** (`added` false in a world with no roster of its own),
  and the deed `free` (`did`) where any watcher may see it
  (`content/rules/rescue.json`: odd in a bad guy's eyes, weight 2).
- **Swap on the spot:** for `DRAFT:` 5 s (`c.recruit.offer`), a fresh
  press of Use there by the freer swaps the hero in on the freer's own
  slot through the cantina's own `swap` (`systems/cantina-swap.ts`,
  exported): the `become` effect, `cantina-swap`. Ignored, the hero goes
  to the cantina, where `cantina-regulars` now makes them a regular.
- **On a phone:** the gauge is a bar over the cage (`t-no-numbers`), from
  `c.recruit.hold` on the camp's entity; `recruited` is a world event, so
  every page in the world, any room, queues a banner "<name> joins!"
  (`draw/banner.ts`), flashes the new face beside the party plate
  (`drawRecruitFlash`) and plays the fanfare (`content/sounds/recruited.json`,
  the approved pack's `secret_found_chime.wav`); `World.roster` reaches
  every page by key.
- **Caught:** the fighter who sees a hero at the cage comes at them; his
  blows knock the hero off the cage and the hold empties
  (`step13-free-watched`). Measured: seeing alone starts no call in this
  camp (only the lookout calls, at the far west), so the control is the
  blow and the broken hold, not a call (decisions-log "Step 13: FREE").
- **Proven by:** `step13-free-unseen` (freed unseen in fighter 2's look
  west, no witness, no call; swapped in on the spot), `step13-free-watched`
  (its control: begun while he faces it), `step13-hold-let-go` (control:
  the hold kept on let-go, the second press frees), `step13-new-game-roster`
  (the cantina gains the skirmisher's regular on the rescue; control: no
  hold, none), `scripts/checks/step13-roster.ts` (two connections in a kept
  game; control: `unlock` adding nothing), and the e2e facts `rescue-cage`,
  `rescue-plate` (`scripts/e2e/rescue.ts`).

## Their reach (push 4)

- **The skirmisher's second jump**, by data: the verb `flap` in
  `content/characters/skirmisher.json` and `flapSpeed` 300, `flaps` 1 in
  its `content/tuning.json` section (`DRAFT:`). Measured
  (`step13-free-unseen`): from the camp floor, a jump and a flap near its
  top rise to about 97 px (feet at y 79 over the floor's 176), clearing the
  ledge (80 px) by about 17; without the flap the jump tops out about 49 px
  up (control: `flaps` 0, the hero is seen, a call starts, they never
  leave). No `step11-*` scenario changed (a regular's jump in the cantina
  may now flap; all 21 stay green).
- **Places it opens** (read from the rooms' tiles, not driven: a surface
  64-80 px over the floor below it with no step within three columns):
  the castle street's high ledges at columns 25-27 (rows 3 and 7), and the
  quarry tower's shaft at column 4 (ledges every four rows, 7 to 23). Also
  the camp's ledge from the floor, which the rescue's way out uses.
