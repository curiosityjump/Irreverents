# Plan step files

**Reference.** The convention for `docs/plan/step-N.md`. Open it when
opening, claiming, writing into or closing a plan step.

## Why steps have their own files

`docs/plan.md` is read by every lead looking for work, so it has to stay
scannable: a heading, a status line and a pointer per step. A step's own
history (why it exists, what was decided, measures, briefs, the owner's
answers, handoff notes) grows with every round and is read only by the
lead working on it. In the project this system was derived from, one step
alone once reached a third of the plan's length; splitting each step into
its own file kept the plan readable and made a step's text one file to
read, move or archive.

## The convention

**In `docs/plan.md`, per step, exactly three things:**

```markdown
## Step N — <title in plain terms>

**Status: open, unclaimed.**

Full text: `docs/plan/step-N.md`
```

The status line is the only part of a step that lives in `docs/plan.md`,
and it is read, claimed and released there (`docs/plan.md`, "How a lead
finds its element"). Never put a status line in the step file.

**In `docs/plan/step-N.md`, everything else.** It opens:

```markdown
# Step N — <the same title>

**Reference.** Plan step; its status line is in docs/plan.md.
```

and then, in roughly this order, as the step grows:

- **Why.** The owner's words that started it (quoted, with date), or the
  measurement that showed the gap, and what in `docs/vision.md` it
  serves.
- **What's decided** and **what's explicitly not decided.**
- **Measure.** The lead's measurements, each with the command that
  produced it.
- **Briefs.** One line per brief (its file in handoff-prompts/, the
  worker session, the commit), not the brief text itself.
- **Open with the owner.** Each question with its `Q-NNN`; Vision Partner
  writes the owner's quoted answer under it.
- **Handoff notes**, newest last, each naming the session and date.

**Numbering.** `N` is the next integer after the highest step number
ever used in `docs/plan.md` or `docs/plan-archive.md`. Never reuse a
number, even for a step that closed or was dropped; other files cite
steps by number.

## Closing a step

Per `docs/plan.md`, "Keeping this plan honest": the file's text moves
verbatim into `docs/plan-archive.md` under `## Step N — <title>`, the
file is deleted, and in `docs/plan.md` the status line and pointer are
replaced by `**Closed <date>**` and a short summary with a link to the
archive. A step with an unresolved owner question in it is not closed.

## Checking it

If your project has a docs checker script, it can enforce this (every
`Full text:` pointer resolves; no step text outside its file; no step
file without a heading in `docs/plan.md`). If not, check by eye when
claiming or closing: `ls docs/plan/` should match the open steps in
`docs/plan.md` one for one.
