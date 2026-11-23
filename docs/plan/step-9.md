# Step 9 — Powers you pick up, and can lose

**Reference.** Plan step; its status line is in docs/plan.md.

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
