# Step 6 — The king who never stops talking

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 01), via `docs/vision.md`** lists it among the
confirmed features: "irreverent anti-story protagonists; royal audience
running gag." **Owner (Drive, doc 03, "strongly endorsed signature
concept"):**
> If the player politely does nothing, the king continues droning on almost indefinitely. He never reaches a normal "now go begin the game" handoff. The game begins when the player chooses to act. … There is no forced quest acceptance, scripted skip prompt or "press X to continue" that resolves the opening as ordinary exposition.
>
> If the player actually allows the speech to continue for approximately THREE HOURS, it finally becomes an unexpected end-credits sequence.

This is the first thing the owner and their brother-in-law will see, and
the fastest way for the game to say what it is (golden scenarios G-01 and
G-02, doc 12).

## Goal

The game opens in the throne room with the king already mid-speech. He
never stops and nothing waits for him: from the first second both players
can run around, poke at things, hit him, or just leave. The court reacts
when they do. And if someone really does stand and listen for about three
hours, the speech turns into the credits.

## What's decided

- **No gate of any kind:** no "press to continue", no locked door, no
  rule against fighting during the speech (doc 03, "Player agency from
  minute one").
- **The reaction yields play, never a game over or a reload** (doc 03's
  acceptance test; D-019).
- **The speech is the one place with a lot of words, and it is still not
  dialogue:** nobody has to read it and it never asks for a reply. It
  shows as a slow ribbon of text or a speech bubble that can be ignored.
  It must not be "an obvious short loop" (doc 03).
- **The speech's words are the owner's taste.** Write a long placeholder
  (solemn, increasingly digressive, in doc 03's spirit), keep it in a
  data file, mark it `DRAFT:`, and list it for the owner. Use by default
  (D-096).
- **The king and his court are ordinary people of Step 4's kind** (roles,
  three modes, a call for help), placed by data in Step 3's throne room.
  No special-case engine code for the king beyond the speech clock.
- **The three-hour ending is real** and reached by actually waiting; the
  script proves it by running the simulation fast, headlessly.
- **Doc 03's props are examples, not a blueprint** (champion, advisor,
  caged beast, the stained-glass window). Pick the two or three cheapest
  that give "at least three compelling distractions within 30 seconds",
  placeholders all.

## What's open (the lead's to measure and decide)

- Which distractions, and how the court reacts to each: read
  `docs/design-library/01-vision-and-narrative/03-opening-the-never-ending-royal-audience.md`
  in full, then Step 4's rule tables as built.
- Whether the three-hour clock survives a player leaving the room, a
  reload, or a second player misbehaving (the library leaves "save/replay
  state" open). Pick the simplest, `DRAFT:`, file the question.

## Feedback signal

1. A fresh player has control within one second of the page being ready,
   and a scripted player walks out of the throne room with no prompt
   answered (control: a build with a gate fails).
2. One nonviolent and one outrageous interruption each change the court's
   mood by Step 4's rules, and play continues.
3. Headless, fast-forwarded: about three hours of simulated listening
   ends in the credits; ten minutes does not.
4. The speech shows no repeated line within its first thirty minutes.

## Stopping condition

The four signals pass on `main` and live. **Budget:** two hours from
claiming; if the owner's morning is nearer than that, land signals 1 and
2 only and say so.

## Owns

The throne room's people and props (data), the speech text (data), the
speech clock and credits; exact paths as `docs/architecture.md` assigns
them. Queued behind Steps 3 and 4.

## Taste, for the owner in the morning

The speech itself; whether ignoring the king is funny; which distractions
tempt them first.

## Measure

## Briefs

## Open with the owner

## Handoff notes
