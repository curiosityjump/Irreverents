# The royal audience: a speech that belongs to a body

**Reference.** Open it before touching `content/audience/`,
`src/content/speech.ts`, `src/content/kinds/audience.ts`,
`src/sim/systems/audience-speech.ts`, `src/client/draw/audience.ts` or the
`speech` fact. Step 6 owns all of them.

## What it is, and why it is shaped this way

The owner's opening (design library doc 03): the king is already talking
when the first player arrives and never reaches a hand-off. No gate of any
kind, the speech never visibly loops, and it is never dialogue. So:

- **The speech is a count on the speaker's body**, `entity.c.audience =
  { id, ticks }`, advanced by one every tick by the system
  `audience-speech`. It is a system, not a verb, because a body that cannot
  act runs no verb, and he talks while held, flying, flattened or carried
  into another room (`INTENT:` at the site; lead's `DRAFT:` decision in
  `docs/decisions-log.md`). It never reads `world.tick`, so the count
  travels with him.
- **The system writes that one field and nothing else.** Nothing may read
  it to hold a player, a door or an input. That is the "no gate" rule.
- **The words are a pure function**, `speechLine(audience, n)` in
  `src/content/speech.ts`: no clock, nothing random. The line showing is
  `floor(ticks / (world.speechLineTime × 60))`. Before the first step the
  body has no count yet and is on the file's `startLine` (he starts
  mid-speech); `speechLineNumber()` is the one place that says so.

## The data: `content/audience/<id>.json`

| Field | What |
|---|---|
| `speaker` | the id of a placed body (`content/placements/`). One body, one speech. |
| `startLine` | the line he is on when the world starts. |
| `opening` | authored lines, said once, in order. |
| `lists` | named lists the tail steps through. |
| `tail` | digressions, said in order, round after round, for ever. Each is `{ "run": times, "lines": [...] }`: its lines are said `run` times in a row, one step further through the lists each time, then the next digression begins. |

Slots in a tail line: `{names}` is that list's entry for this pass
(wrapping round), `{names+1}` the entry one further on (so a line can hand
on to the next pass: "A begat B", then "B begat C"), `{n}` the pass number
from 1, `{n+40}` that plus 40, `{nth}` the same as "3rd".

## What `npm run check` refuses

- a line that does not fit the ribbon: more than 56 letters, or not
  wrapping into two rows of 28 (`wrapSpeech`, the same function the
  drawing uses);
- **any line that repeats in the first three hours** at the pace in
  `content/tuning.json` (`speechLineTime`; 1,800 lines at 6 s), naming
  both lines. Scenarios are capped at five minutes, so this check on the
  text is the only proof of "never visibly loops". Three hours is the
  owner's figure for the alternate ending. Lines with a number never
  repeat; the others repeat only when their lists come round together, so
  **keep list lengths with no common factor** (23 names, 19 epithets, 17
  deeds) and the check will tell you when a change shortens the cycle;
- a `speaker` no placements file places (skipped when the content has
  no placements at all, which is how Step 3's room controls run); a slot
  naming no list.

## Adding or rewriting lines

Edit the JSON; no code. New opening lines go anywhere in `opening`. A new
digression is one more entry in `tail` and, if it wants them, new `lists`.
Shortening `speechLineTime` makes three hours hold more lines, and the
check then says whether the tail still carries it.

## On screen, and in scenarios

`src/client/draw/audience.ts` draws the current line in a small ribbon
over the speaker's head, only in the room the viewer is in, clamped inside
the view. `DRAFT:` look. The fact `speech` (`src/scenarios/facts/speech.ts`)
reads a body's line number at a tick and can require its words to differ
from an earlier tick. Scenarios `step6-*`; their controls are in the
commit that added them.

## Not built yet

The court's reactions, the guards, the window and the three-hour ending
(the next slice). The king is a plain body, not a person (`npc`).
