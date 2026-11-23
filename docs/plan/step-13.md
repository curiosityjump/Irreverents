# Step 13 — Heroes you find and keep

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**Owner (Drive, doc 11, D-007, D-082, D-083):**
> D-007 Unlockable and permanently expanding roster of characters discovered in the world.
>
> D-083 The connected BETWEEN-LEVEL WORLD contains a CANTINA in which ALL UNLOCKED playable characters hang out and WANDER physically. It is where the limited active team can be reset/reconfigured.

D-082 makes unlocked heroes permanent, unlike powers. The number was reserved
for this at 04:58 UTC; its drafter was stopped by the usage limit. This file
is its first draft, from `docs/plan/core-loops.md`, section 4.

## Goal

A hero is held in a cage in the Bandit Camp, two rooms from the start, in
plain view from the camp's ledge and calling out. A player frees them, quietly
inside a watcher's look away or in the middle of the fight, and from then on
that hero is theirs: on the party plate, swappable on the spot, wandering the
cantina, kept in a kept game. Their reach (a second jump in the air) opens
places the player has already walked past.

## The signal (re-runnable)

- Scenarios `step13-*` in the real camp: freed unseen and out by the ledge
  (controls: the hold begun while watched starts a call; without the second
  jump the ledge is not reached); freed while caught; a hold let go does
  nothing; a world seeded with the start list has no such wanderer in the
  cantina and has one after the rescue.
- `scripts/checks/step13-roster.ts`, a real server and two connections in a
  kept game: a friend in another room gets the event and the roster; it
  survives everyone leaving and a rebuilt server (control: saving off).
- `npm run e2e`, a phone-sized page by touch: on entering the camp the page
  draws the cage and the captive's call, and the party plate's faces.

## Stopping condition

The signal passes on `main` and live. Then the step stays open for the next
hero to find; what the owner says after playing reorders it.

## What's decided

- The owner's D-numbers above, and D-011 (local characters may be swapped in
  mid-region), D-084 (swap by tap in the cantina).
- Doc 05: "Players begin with a subset"; doc 36: the canon three are the
  start. Every roster name in the library is EXAMPLE (E-006): a name is data.
- NPCs and captives are scripted, never AI. A captive is a thing until freed.
- iPhone first: freeing is the Use button, held; nothing needs a keyboard.
- There is always a way out: the hold can be let go; a failed rescue leaves
  the captive there to try again; never a reload.

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 13")

- **Who:** the skirmisher is the camp's captive; a new game starts with the
  canon three and the brawler (so the cantina's brawl never empties). One line
  of `content/roster.json` either way.
- **`world.roster` absent means every roster character**, so old kept games,
  existing scenarios and `?room=` check worlds are unchanged.
- **Hold to free**, a little less than the nearest watcher's look away.
- **Reach by a second jump** (the `flap` verb, one flap), not a bigger jump.
- **Party size stays three** (O-003 is open).

## Open (for the owner, by playing; nothing waits on them)

- Who should be found next, and where? (A second find needs a sixth hero from
  the approved P04 cantina sheet.)
- Should a new game start with fewer heroes than today?

## Owns

New files: `content/recruits/**`, `src/content/kinds/recruits.ts`,
`src/sim/roster.ts`, `src/sim/systems/recruit-*.ts`, `src/sim/use/free.ts`,
`src/client/draw/recruits.ts`, a `content/rules/` file for the `free` deed,
`scenarios/step13-*.json`, `scripts/checks/step13-*.ts`,
`scripts/e2e/recruit.ts`. Agreed small edits (Step 11 is closed):
`content/roster.json` (`start`), the two roster reads in
`src/sim/systems/cantina-regulars.ts`, the skirmisher's verbs and numbers, an
additive scenario field that seeds world fields (`src/scenarios/run.ts`), one
line where the server makes a world (`src/server/game.ts`), one row in
`content/prompts.json`, one line in `src/client/render.ts`. It edits none of
the camp's three files.

## Briefs

- `handoff-prompts/loop-rescue.md` (written 2026-11-23 19:40 UTC by the
  core-loops re-plan). **Spawn its builder when the Use arbiter
  (`handoff-prompts/loop-heist.md`, push 1) is on `main`.** Never run it
  beside the vehicles slice (Step 20): the same camp, each other's
  tick-pinned scenarios.

## Builder notes
