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
  skirmisher at the Bandit Camp's columns 33-34, row 10, inside the second
  fighter's look east, clear of the waves' entry at column 41.
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
