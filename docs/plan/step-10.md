# Step 10 — The first ten minutes, played end to end

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23, first-hand** (`docs/vision.md`, "The measure"):
> I want to be playing the game having fun with it with my brother in law tomorrow morning.

**Owner, 2026-11-23 ~04:38 UTC, to the orchestrator, first-hand**
(`docs/current-directive.md`):
> Realize as much of the vision as possible. Don't stop until you have realized as much as you can.

Every other step proves itself in rooms and with made-up events of its
own. Nothing yet proves the pieces fit: that two people who open the
address actually land in the throne room together, can leave it, find
people in the street who react, and get away. In the morning that is the
only test there is, and the owner runs it.

## Goal

One scripted play-through, by two players, of what the owner and their
brother-in-law will do first: open the address, appear together, move,
throw something, throw each other, walk out of the throne room, upset
someone in the street, get a call for help made or stop it, get away,
find a way nobody pointed at. It runs on a session's own machine and on
the live game, grows a beat each time a step lands something, and names
the beat that broke. What it finds between steps gets fixed or sent to
the step that owns it. The last version of the game that passed it is
always marked, so the morning can fall back to it.

## What's decided

- **The tour is data:** a list of beats, each with the scripted inputs of
  two players and the facts expected, in the scenario format the steps
  already use. A beat is added when the step that owns it says it is on
  `main`; a beat for something not built is not in the tour.
- **Two forms, one script.** Headless, inside `npm run check`, so every
  session's pre-push gate runs it; and on the real page with two browsers
  (one phone-sized, by touch), locally in `npm run e2e` and against the
  live address.
- **On live it plays in a private world of its own**, never the default
  one (`docs/plan/step-1.md`, "A live check never lands in the players'
  world").
- **Every pass on live is marked:** a git tag `green-<n>` on the commit
  that was running. Tags do not deploy. If the live game is red at the
  10:00 UTC cut-off, the fix is revert commits back to the last green
  tag, never a forced push (`docs/git-workflow.md`).
- **Seams are fixed where they live.** This step owns no part of the
  game. A seam that is one file and needs no design (a start room, a
  missing placement, a door id) is fixed in the owning step's file after
  telling its lead; anything larger goes to that lead with the failing
  beat as the evidence.
- **Phones are slow.** The live tour also runs with the processor slowed
  four times, the way a phone is (doc 33: "Test memory, loading time …
  battery/heat and device throttling"), and must still play.
- **The tour's beat list is the morning's "what to try" list.** Keep it
  in plain words a player would use; the orchestrator's morning report
  quotes it.
- **After the morning report, look before you push** (`/healthz` says how
  many players are in the default world): nothing goes live while
  someone is playing (`docs/current-directive.md`).

## What's open (the lead's to measure and decide)

- The beats and their order: read `docs/current-directive.md` for what
  matters most, each step file's Goal for what exists, and `git log` for
  what has actually landed. Library doc 03 (the royal audience) and doc
  12 (golden scenarios G-01, G-05, G-06) describe the first minutes the
  owner imagined:
  `docs/design-library/01-vision-and-narrative/03-opening-the-never-ending-royal-audience.md`,
  `docs/design-library/04-decisions-and-prototyping/12-golden-scenarios-and-prototype-acceptance-tests.md`.
- What "still plays" means on a slowed processor: pick a number (frames
  a second, input-to-movement delay), `DRAFT:`, log it.

## Feedback signal

1. `npm run check` runs the headless tour; breaking any one beat (for
   example sealing the throne room's door) fails that beat by name
   (control, watched once per beat as it is added).
2. `npm run e2e` runs the same tour on the real page with two browsers,
   one phone-sized and driven by touch.
3. The live tour passes in a private world and a `green-<n>` tag is
   pushed; the Measure section lists each tag, its commit and its beats.
4. With the processor slowed four times, the live tour still passes and
   the page keeps to the number chosen above (control: a deliberate busy
   loop in a test build fails it).
5. Every seam found is listed under Measure with the commit that fixed
   it or the lead it went to.

## Stopping condition

This step has no finish line before the morning. It ends when the
orchestrator's morning report is out, having handed over: the last green
tag, the beat list in plain words, and what is known not to work. Until
then, a red tour on live is the most urgent thing in the project: say so
to the orchestrator at once.

## Owns

The tour (scenarios named `step10-*.json` and one e2e script), the
`green-<n>` tags, and the list of seams. No directory of the game. Opens
when Step 1's second gate lands (two players on the real page exist to
tour with).

## Taste, for the owner in the morning

Nothing here is taste; this step is what makes the owner's taste the
only open question. What it passes on: where the tour felt slow or
confusing to script, which often means it is slow or confusing to play.

## Measure

## Briefs

## Open with the owner

## Handoff notes
