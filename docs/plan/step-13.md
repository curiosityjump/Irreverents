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

Rescue builder (`session_017WiGzHfRkFts4Z3rb8RMqC`, brief `loop-rescue.md`),
2026-11-23. Landed: push 1 a1741fa (`World.roster`, the start list), push 2
0a2e8fa (the caged skirmisher), push 3 (FREE, the banner, the swap on the
spot), push 4 (the second jump). Writeup: `docs/mechanisms/recruits.md`.

- **Not built: `step13-free-while-caught`.** Measured: with a call
  completed (a second player seen by the lookout), the wave's fighter
  stands at the entry (column 41) facing west, seeing x 554-666 on the
  floor; every way down from the ledge (its east end) lands in his sight,
  and his blows break any hold (as `step13-free-watched` shows for fighter
  2). Freeing while caught needs the hero to deal with him first (a grab
  and throw, or a second player drawing him off): a scenario worth
  authoring, not attempted for budget. Nothing in the code prevents it:
  the cage takes any holder, alarm or not.
- **Brief vs measured:** the watched control is "he comes at the hero and
  the hold breaks", not "a call starts": in this camp only the lookout
  (far west) calls, and fighter 2's seeing starts a fight, not a call.
- **The cage moved** from columns 33-34 to 32-33 after Step 19 put the
  camp strongbox on column 34; FREE is ordered after placed things (150)
  so the strongbox keeps Use within its reach. The hold is 2.2 s, not 2.5:
  the slowest hero (the grappler) must wait just out of fighter 2's sight
  east of the strongbox and walk about 40 px to the cage after he turns,
  leaving about a quarter second to spare.
- **`?room=` worlds and old saves** have no roster of their own
  (everyone), and still get the cage; freeing there emits `recruited` with
  `added: false`.
- **The e2e reconnect fact h1** ("the server down 75 s", scripts/e2e.ts)
  failed in 5 of 7 full runs this session, including once on origin/main
  at c881c17 without any of this work: flagged in
  `docs/for-the-orchestrator.md`.
- **Two places the reach opens** (by the rooms' tiles, not driven): the
  castle street's high ledges at columns 25-27 (rows 3 and 7) and the
  quarry tower's shaft at column 4.
- **A second recruit** needs a sixth hero from the approved P04 cantina
  sheet (out of scope).

## A hidden recruit, and a secret only they open (opened 2026-11-24 by orchestrator session_017WiGzHY5UZsWTLCH8cLm8M)

**The owner's words.** 2026-11-23 ~18:30 UTC, first-hand, after playing on a
phone (`docs/current-directive.md:133`, `docs/vision.md:137`): "... no hidden
places to explore, no characters to unlock ...". Library: D-007, D-005,
D-010; `docs/vision-gaps.md` row 12's close: "one recruit hidden in a secret,
and a secret only they open".

**Goal.** A sixth hero, a strong mover who lifts and throws what nobody else
can (`liftStrength` 500, above Brawn's 420), is caged in the Iron Quarry's
hidden cave and found only by walking through the pit's painted wall. Coming
back with her pays twice: the forest's boulder is hers to lift, and a stone
nobody else can lift lies in the castle's undercroft; carried up the hall's
stair onto a plate, it opens a hidden pocket with a new piece (`town-8`).

**The signal.** Scenarios `step13-hauler-freed-in-the-cave`,
`step13-hauler-lifts-the-boulder`, `step13-hauler-cave-put-back`,
`step13-stone-only-she`, `step13-stone-brawn-cannot`,
`step13-stone-throne-near-miss`, `step13-free-while-caught`, each with a
control watched failing; e2e facts `hidden-recruit-not-shown`,
`hidden-recruit-cave`, `hidden-recruit-stone` (`scripts/e2e/hidden-recruit.ts`,
a phone-sized page by touch).

**Stopping condition.** The signal passes on `main` and live
(`check:deployed`, `check:live`). Then gap 12's stated close is met; the step
stays open for the owner's verdict after playing.

**Decided** (the orchestrator, `DRAFT:`): who (id `hauler`, the P04 cantina
sheet's barkeep, row 1; shown name is data); where she is hidden (the cave,
cage at [7,12]: a recruit file only, no quarry file touched); the secret
(`stone-heavy` 480 at the undercroft's [25,12], `heavy-plate` needs 480 on the
stair's top step, `heavy-hatch` in the hall floor at columns 30-31,
`heavy-pocket` rows 14-15, columns 23-31, with a way out any body takes);
"only she" means no other hero alone with Brawn and any one thing; a pile (a
Brawn holder carrying the throne and the king up the stair, 510) also opens
it, by the plate's own rule and doc 05's creative substitutes, logged and
kept. **Open** (for the owner, by playing; nothing waits on them): is a
strong hero the right second find; is the cave the right place; is the pile
an acceptable other way in, or should the stone be hers alone. Measured but
not run: the forest's boulder looks punchable onto its plate (about 5 px a
grappler punch); the builder measures and notes it, and changes nothing there.

**Briefs.** `handoff-prompts/hidden-recruit.md` (written 2026-11-24 by the
orchestrator; three pushes: the hauler in the cave, the stone only she lifts,
`step13-free-while-caught`).
