# Step 2: the tuning panel's order and steps, and "no number over a hit" as a check

Brief for one builder. Written 2026-11-23 16:05 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`), which holds Step 2 now (its lead
`session_017WiGzGN9egot3JUvSMBBA9` released it under the two-layer rule; its
handoff notes are the end of `docs/plan/step-2.md`, read the last three).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes
file: `docs/plan/step-2.md`, a new last entry under "Handoff notes".

**Two pushes, each standing alone and fully checked. Nothing half-working on
`main`** (a push to `main` is the deploy).

## The task, and what it moves

1. **(a) Panel polish** (`src/client/tune.ts`, the `?tune` panel;
   `docs/mechanisms/tuning-panel.md`). Measured at 3733ad6: every set's names
   are sorted alphabetically (`Object.keys(list).sort()`, `tune.ts:202`), so
   the numbers the owner feels most are buried. Put first, in this order, the
   ones that exist in each set: top run speed, jump, wind-up, fall speed, then
   the rest alphabetically. The order lives in one list (data, `DRAFT:`), not
   spread through the code; a name in the list that a set lacks is skipped. Finer
   slider steps where the range is huge: today `niceStep` gives about a
   hundredth of the slider's span (`tune.ts:48`), and the slider spans up to
   3× the shipped number (`tune.ts:142-147`, `DRAFT:`); measure what step the
   widest five rows get now and make each one movable in steps no larger than
   about 2% of its shipped value, keeping + / − and typing as they are.
2. **(b) Signal 6 as a script** (`docs/plan/step-2.md`, "Feedback signal" 6):
   *"What the page drew during a scripted fight contains no number over a hit
   (read from the page's own record of what it drew; control: a test build that
   draws one fails)."* Measured: the page's record is `window.irreverents.drawn`
   (`src/client/render.ts:33`, read by `scripts/lib/e2e-touch.ts`). In-world
   words now go through the pixel font's `drawText` (ea44201,
   `src/client/draw/sprites.ts`, `fx.ts`): record each string drawn into the
   game picture during a frame in that record (additive field), then add an
   e2e fact that, across a scripted fight by touch (punch a dummy, throw a crate
   into it, throw a friend), no recorded string contains a digit. **Control
   watched to fail:** with an env switch the way `E2E_TOUCH_BREAK` works, draw
   "12" over a hit; the fact must fail; say so in the commit message.

It moves no M-row; it closes Step 2's last owed items, after which the
orchestrator closes Step 2.

## Decided

- Impact is physical, never a number on screen (`docs/vision.md`, "What it is
  not": "Do not simplify combat down to damage numbers").
- The owner, ~15:00 UTC, answering Q-013 (`docs/plan/step-2.md` "What's
  decided"): *"If you are in a small tunnel, you can't switch to a big
  character that doesn't fit there."* That confirms the existing refusal
  (`step2-body-switch-refused-in-gap`); nothing to build. The case of a friend
  taking the hero you need was not ruled on: out of scope here (Step 5's
  switch gap).

## Traps

- Text inside the game picture is not the DOM: the tuning panel, the start
  screen (Step 17, building now) and the page shell are HTML and show numbers
  on purpose. The check covers what is drawn on the canvas only.
- `t-throw-friend` / `s-throw-friend` flaked once in each of two lanes today
  and passed on rerun unchanged: if your fight uses them, run e2e twice and
  report both results; never weaken a fact to get green.
- `t-switch-free` is a known todo, not counted; leave it.
- Don't change any number's shipped value, range or validator.

## Out of scope

The renderer's look (Step 8), the switch gap and the thrower's predicted swing
(Step 5), `docs/architecture.md`'s "I need to add…" re-read (item (c), the
orchestrator's).

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed to
`main`; `npm run check:deployed` current and `npm run check:live` passing; a
phone-size screenshot of the reordered panel (both holds) under
`docs/plan/step-2-shots/`. `docs/mechanisms/tuning-panel.md` updated.
