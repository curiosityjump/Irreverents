# Step 9 — Powers you pick up, and can lose

**Reference.** Plan step; its status line is in docs/plan.md.

## 2026-11-23 19:40 UTC, the owner's verdict after playing: briefed

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

The re-plan from these words is `docs/plan/core-loops.md`. This step is its
**playable 3, "Knock it out of him, keep it if you can"** (section 3).
**Brief: `handoff-prompts/loop-powers.md`.** What changes in this file's plan:

- Step 2 closed at 17:30 UTC, so this step is no longer queued. Its "Owns"
  said it edits none of Step 2's verbs; the overlay needs the four places a
  character's numbers are read (`src/sim/systems/verbs.ts:34` and `:36`,
  `src/sim/body-state.ts:107`, `src/sim/systems/physics.ts:63`), by agreement.
- **The common power is a boost above every hero's own numbers**, because
  player one is given the grappler, who already lifts and throws everything a
  plain strength power would allow.
- **A power travels to its holder's phone as an effect**, or wings do not work
  there.
- The 90-minute budget and the 10:00 UTC cut-off below are history.

## Why

**Owner (Drive, doc 01), via `docs/vision.md`,** lists it among the
confirmed features: "temporary acquired abilities/weapons". **Owner
(Drive, doc 11, D-009, D-081):**
> D-009 Abilities and/or weapons can be acquired from enemies or the map, Kirby-style.
>
> D-081 Like Kirby, taking DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried items. Recovery of an ejected power before it disappears is a plausible proposal, but exact loss thresholds, timing, item categories and how player can reclaim it remain OPEN.

Step 2's lead flagged at 04:45 UTC that powers do not fit in Step 2
tonight (three characters and grab/throw come first) and need their own
step if they are wanted by the morning. The owner asked for "as much of
the vision in playable form as possible", and this is on the confirmed
list.

## Goal

A hero can take a power from a certain enemy or pick one up from a spot
in the map, use it with the buttons they already have, and lose it when
hit hard: it drops into the room as a thing either player can grab back
before it fades. One or two powers, each useful in more than one way.

## What's decided

- **A power sits on top of the character's own moves;** it does not
  replace who they are (the library keeps powers and characters as
  separate kinds of progress, D-082).
- **Taken from an enemy or picked up from the map** (D-009).
- **A hit can knock it loose** (D-081), as something lying in the room to
  grab back, never silently deleted (library doc 30).
- **No new button.** It rides on the existing actions (doc 33: "not a
  dozen tiny virtual buttons"); every use of it is reachable by touch.
- **One power at a time per hero, tonight** (`DRAFT:`; slots, dropping
  on purpose, passing to a friend, keeping it through a switch or a
  defeat are all open, O-005). Pick the simplest of each and log it.
- **The same power means more than one thing** (golden scenario G-15,
  doc 12: "one ability … appears in combat, traversal, puzzle and stealth
  contexts"): choose powers whose effect is a property of the world
  (heat, wind, weight), so it works on whatever has that property, by
  data, not by a list of special cases (doc 24, "Bounded systemic
  affordances").
- **Which powers** is open in the library (doc 24 offers "fire and
  invisibility or limited grab/speed variants" as examples only). In use,
  not canon (D-096): `DRAFT:`, ids that survive a rename.

## What's open (the lead's to measure and decide)

- Read `docs/design-library/02-gameplay-systems/05-characters-roster-parties-and-acquired-powers.md`
  and `docs/design-library/05-world-and-game-expansion-proposals/30-rare-powers-recoverable-drops-and-return-expeditions.md`
  (rare powers that live in one known spot and can be fetched again:
  D-080; one such spot is enough tonight).
- Which enemy carries a power: Step 4's people and Step 2's dummies are
  the bodies available; agree it with those leads.

## Feedback signal

Scenario scripts in `npm run check`, named `step9-*.json`, each with a
control watched to fail:
1. A hero takes a power from an enemy, and separately picks one up from
   its spot in a room; each changes what an existing button does.
2. One power, two meanings: the same power has an effect in a fight and
   opens or changes something in a room (two scenarios).
3. A hard hit knocks the power loose; it lies in the room; either player
   can grab it back; left alone it fades (control: a light hit does not
   knock it loose).
4. On the phone-sized page (`npm run e2e`), every use of the power is
   done by touch.

## Stopping condition

The four signals pass on `main` and live. **Budget:** ninety minutes from
claiming. If the 10:00 UTC cut-off in `docs/current-directive.md` is
nearer than that when this opens, land signal 1 and 3 with one power and
say so.

## Owns

Powers as a kind of content and the systems that give, use and drop
them; exact paths agreed in `docs/architecture.md` when claimed (a new
`content/powers/**` and its kind file, systems named `power-*`). It
builds on Step 2's verbs and bodies and edits none of them. Queued
behind Step 2.

## Taste, for the owner in the morning

Which powers; whether losing one is fun or annoying; whether getting it
back feels like a scramble worth having.

## Measure

## Briefs

## Open with the owner

## Handoff notes

## Builder notes

*(Step 9 builder, `session_017WiGzF16bBpnLmeWErGynR`, brief `loop-powers.md`.)*

- Push 1 (64bd1fe): e2e facts h1 and h2 (reconnect after the 75 s outage,
  then the reload on a new commit) failed once on the rebased tree and
  passed on the two runs after it, with no change in between. The push
  touches no network code. Railway took about 8 minutes to put it live,
  against the usual minute or two.
- Push 2: h1 (and once h2) failed again, in 3 of about 7 e2e runs here.
  `origin/main` at 4754ec5 without any Step 9 commit, in a separate
  worktree, failed h1 the same way, so it is not this step's. Also seen
  once: `t-throw-friend`, the known flake.
- Push 2: the brief's "decide the first carrier by measuring" came out for
  the street's villain (two grappler hits from the spawn, about 5 s;
  `step9-take-from-carrier`). Two changes made after seeing it on a page:
  nobody can take an orb for 0.6 s, or the hitter had it the frame it
  appeared; and the orb is no body (it was one at first: follow-up swings
  punched it across the street, and after a rebase onto Step 4's town tiers
  a shopkeeper's swing on it raised the alert and one tier scenario failed). The boost's icon became `pickup-bolt`,
  because the star could not be told from the hit star.
- Pushes 3 to 5: a knock-out was the first try at the network check's hard
  hit, and it could not tell the effect from the server's copy (a `flatten`
  makes the page take the whole copy), so the check lands a blow instead.
  Wings are proven by script only (the holder's own page flaps in the
  two-connection check). No phone e2e takes them by touch: the route past
  the depot's guards is long. A fact could reuse `scripts/e2e/quarry.ts`'s
  route to the depot. Screenshots of the pedestal and the menu were taken
  by moving a page's own character there from the page's devtools: looks
  only, never a check.
- **Owed: move the wings pedestal (for a fresh builder).** The Step 16
  lead's answer to the tile question (sent 2026-11-23 19:59 UTC, delivered
  here only at 01:10 UTC, after push 4 landed at [46, 13]): both of my
  guesses conflict. The strongroom floor is on the main way:
  `step16-across-*` walk in at its front (column 36) and out its back
  (column 47), so [46, 13] hands flap to every hero crossing. No scenario
  takes it, but a player walking across would. The shelf (row 11, columns
  37-39) is where `step16-zero-alarm-ledge`'s grappler waits. **The lead's
  tile is [38, 18]**: the floor of the hidden area `under-the-strongroom`
  (columns 36-44, rows 16-18), reached only by the cellar secret or the
  shaft, so wings become the payoff of a hidden place. "If one [step16
  scenario] breaks, move the tile east within 38-43 rather than changing a
  scenario." To do: one tile in `content/powers/flight.json`; re-route
  `step9-fades-then-source` to reach it (today it walks west along the
  strongroom floor from column 55); run every `step16-*` scenario and
  repeat the "no other scenario takes it" sweep (run every scenario, looking
  for `power-*` events); update `docs/mechanisms/powers.md` ("Sources") and
  the decisions-log entry. `scripts/checks/step9-powers.ts` reads the
  tile from content and needs no change.
- Step 22's builder (`session_017WiGzHD6TvY2XxEG4B3rJU`) wants a kerb at
  quarry-depot [53, 13]. It breaks today's `step9-fades-then-source` (the
  walk west from column 55). The re-route above ends that conflict. Until
  then they may re-time the scenario, keeping every one of its claims.
