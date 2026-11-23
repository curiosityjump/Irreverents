# Briefing a session

**Standing.** Read when writing work for another session to pick up.

A brief exists so that **`CLAUDE.md` + the brief is enough.** A session that has
never seen the conversation that produced the work should be able to execute it
and land in the same place. That is the whole point of this system: *fresh
sessions should not have to redo the research.*

One test decides whether a brief is finished:

> **Every question the executing session still has to ask should be one only
> the owner can answer: a question of intent. Never one the brief writer could
> have measured.**

If the brief leaves a *measurable* question open, it isn't ready. Go measure it.

**This is a bar for the brief writer, never a ceiling on the executing
session.** It does not mean a good brief leaves you with no questions, and it
does not mean asking is a sign the brief failed. **The owner wants to be
asked.** A brief is written by someone who could not see everything; where it
turns out to be wrong, thin, or silent, *ask*. The only questions worth
suppressing are the ones you could answer yourself by measuring.

Its "Decided vs. open" section is likewise a starting position, not a closed
list. If a brief says "nothing open" and you find something, the brief was
wrong: say so.

---

## What a brief must contain

0. **The file's location gets into the launch prompt; nothing else needs to.**
   A rule once claimed a brief's prompt must open with *"Run `docs/sop.md`"* or
   the session would simply start working. Nothing supported that claim. The
   measured answer: the launch prompt was only ever `work <handoff-prompts/file.md>`,
   two words and a path, and every session ran the SOP anyway, because
   `CLAUDE.md` (loaded automatically) routes a session handed a brief to
   `docs/sop.md`. **What this item protects:** a brief supplies the *material*
   for SOP phase 2, and the session needs the *file's location* to find it.

1. **The task, and which row of the measure table it moves.** `docs/plan.md`'s
   table (definitions in `docs/measures.md`) is the project's measure. State
   the row and the direction, because the executing session has to state it
   again at SOP phase 5. A task that moves nothing is fine: say so, and say
   what it is for instead.

2. **The derivation, already done.** Every measurement you had to take, with
   the number. Not "the parser drops fields sometimes," but *"the object
   literal at `src/parser.ts:102` enumerates 22 fields by hand; the type has
   25."*
   This is the section that makes the brief worth writing.

   **No hedges and no absolutes.** Both are the same failure, a count you
   didn't take:

   - *"~13 shared implementations,"* written twice and never listed. The
     brief's own verification step then said "exercise each of the ~13":
     **uncheckable**, and a session will exercise some, feel finished, and
     miss one. If you write `~` in front of a number, either count it or list
     it.
   - *"**Every** write to the cache is immediately followed by a write to the
     database."* Measured: **53 of 73.** The conclusion happened to survive,
     because it rested on something else, but an absolute is a claim a session
     will build on without re-checking.

   **A brief's job is to spend the measuring once so nobody repeats it.** A
   hedged number spends nothing and reads as though it did.

3. **The traps.** What would a competent session plausibly get wrong here, and
   what happens if it does? A trap you found by measuring saves the next
   session an hour and a bad deploy.

4. **What is explicitly out of scope.** The most expensive pattern in the
   source project was a session deciding something nearby looked wrong and
   improving it. Name the adjacent things it will notice and must leave alone.

5. **Decided vs. open.** What the owner has already settled (don't relitigate)
   and what is genuinely still open (ask, don't assume). If nothing is open,
   say so. **Phrase every open question the way the owner would have to answer
   it**: in terms of what they would see or be able to do, never in field
   names. A brief that hands a session a jargon-shaped question gets a
   jargon-shaped question relayed to the owner, who has to decode it before
   answering.

6. **How it gets verified**: which rung of `docs/verifying-and-finishing.md`'s
   ladder, concretely, with the command or the scenario. "Test it" is not a
   verification plan.

   **If verifying calls a paid service (a model API, a metered third-party
   API) through a shared production key, give a call budget**, a number of
   calls ("at most 400 model calls in all"). The worker counts against it,
   stops at it and reports. In the source project an uncapped evaluation run
   once emptied the shared account.

7. **Definition of done**, including which rows of SOP phase 6 this will
   trigger.

8. **A line telling the executing session where its questions go**, which
   depends on the kind. A **blocking** question (one the session cannot finish
   without an answer to) goes to the owner (or whoever launched it) directly,
   in the moment. A session reading a document can default to writing its
   answers and its blocking questions back into documents where nobody sees
   them in time; that has happened. A blocking question also goes to
   `docs/questions-inbox.md`, so a missed message is not a lost
   question. **Everything else (a non-blocking question, a flag, a "worth
   noting")** goes the other way: **not** into the final message. An
   executing session's chat may be deleted once its brief ships, and anything
   that exists only there goes with it. A non-blocking question for the owner
   goes to `docs/questions-inbox.md` (its header says how; only Vision
   Partner writes `docs/questions-for-the-owner.md`); a flag or
   finding that is not a question goes to `docs/for-the-lead.md`, which the
   lead reads every round. See `docs/sop.md` phase 4 for the full split and
   `docs/for-the-lead.md` for the format.

   **The final message itself should say almost nothing**: a short
   confirmation (done or blocked, the commit, and a pointer to
   `docs/for-the-lead.md` if it wrote there), not a narrated summary. Nobody
   reads it, and a session carrying more of its own narration in context is
   more prone to drifting from the process. The honest report belongs in the
   commit message; that is what the lead reads.

It does **not** restate `CLAUDE.md`, the SOP, or a mechanism doc. Point at
them. A brief that re-explains the project is a brief nobody finishes reading.

---

## The launch prompt is the file's location, and nothing else

The launch prompt is `work handoff-prompts/<file>.md`. Whoever launches it (a
lead calling a session-creation tool, per `docs/lead-session.md`'s
"Instantiating other sessions directly," or a human typing it), the prompt
is that line, unchanged. Not a restatement of the task, not a mention of the
SOP (`CLAUDE.md` already carries that). Two reasons, and the second is the
load-bearing one:

1. Anything the prompt says that the brief also says is a **second copy that
   can drift**, and the session has no way to know which one is current.
2. This is, deliberately, a test of **whether briefs work cold**. A prompt
   that re-explains the task quietly answers the question for you: the run
   succeeds, and nobody learns whether the file alone was sufficient.

If you want to add context to the prompt, that context belongs in the brief.
The one thing that genuinely can't wait for the file is a decision that arrived
after the brief was written, and the fix for that is to edit the brief, not to
patch it in the prompt.

**Infrastructure caveat.** If your environment gives you a tool to create
sessions (the source project used Claude Code Remote's `create_session`),
launch the brief-worker yourself. **If it doesn't, fall back to reporting the
exact launch line** for whoever you answer to, literal, one line per brief
(`docs/lead-session.md`, "Ending a message"), each followed by *"When it
reports done, come back here and tell me 'worker done at <commit>'."* Treat
that as a degraded path, not the target state.

## Look at one before writing one

`docs/example-brief.md` is a complete example brief. It exists because this
protocol deletes each brief when its slice ships, so without it, a session
writing its first brief has the rules above and no example of them in use.
Read it for shape, not content. Replace it with a real brief from your own
project once a good one ships.

## Where briefs live

`handoff-prompts/*.md`: scratch, not documentation. **Delete the file once its
slice ships** and the durable parts have landed per SOP phase 6. The directory
being empty between rounds is the healthy steady state.

For a round split across several sessions at once, the coordination rules
(non-overlapping domains, the shared design doc, the append-only decision log)
are in `docs/team-collaboration-protocol.md`. The contents of each brief are
still this page.

**This page governs a brief's contents regardless of who launches it.** A
brief is the right *shape* for a bounded slice with a clear finish line. When a
job instead needs to keep acting on its own (self-scheduled wake cycles,
reacting to real users in real time, nobody watching between builds), that is
not a bigger brief; it is `docs/lead-session.md`'s "Instantiating other
sessions directly." Same discipline either way: a role from
`docs/roles/README.md` if one fits, minimal priming, no giant hand-written
prompt.

---

## Why this is a document and not a habit

In the source project, the first brief written after this page existed
surfaced a trap the plan itself did not mention and that the obvious
implementation walks straight into: an authoring-only convenience field
existed in the input schema but deliberately not in the runtime type, so the
natural fix would have leaked authoring sugar into the core and broken the
very primitive held up as the model for the data-over-code direction.

Nobody would have found that from the plan. It took two minutes of measuring,
**by the brief writer, once, instead of by every session that picks the task
up.** That asymmetry is the argument for briefs.
