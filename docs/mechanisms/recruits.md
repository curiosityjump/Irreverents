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
