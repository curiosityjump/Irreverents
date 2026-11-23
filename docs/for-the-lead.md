# For the lead

**Standing.** Run per `docs/sop.md`. Written by executing sessions, read
and cleared by the lead; questions for the owner go to
`docs/questions-inbox.md`, not here. Empty between rounds is the healthy
steady state — same convention as `handoff-prompts/`.

---

## Why this file exists

The rule, as the original owner of the project this system was derived
from put it (paraphrased): reports, flags and things worth noting don't
belong in a chat with the owner. They belong with the lead, in the
codebase, so the lead can update the relevant documentation, processes
and later briefs from what the executing sessions did and flagged. And
questions for the owner that arise during the work, but don't prevent
it, should reach the owner through the lead — not through a chat the
owner deletes the moment a brief completes.

An executing session's chat may be deleted, archived or simply never
read again the moment its brief ships. Anything that exists only in that
chat — a flag, a "worth noting," a question that didn't block the work —
is gone then. This file is where it goes instead, so it survives to the
one session that reads across rounds.

## What goes here, and what doesn't

**Write here:** anything you'd otherwise have put in your final message,
*except* a genuine blocking question (below). A flag ("this looks off,
might be intentional, didn't chase it"), a "worth noting" that doesn't
yet have an obvious home in `docs/sop.md` phase 6's routing table. A
question for the owner, blocking or not, goes to
`docs/questions-inbox.md` instead (its header says how).

**Don't write here:**

- **Routine verification detail** — what you ran, what passed, what you
  didn't verify. That's the commit message's job (`docs/sop.md` phase 7).
- **Anything with an obvious permanent home already** — a new mechanism,
  a confirmed-deliberate design, a decision the owner already made, a new
  working rule. Phase 6's table routes those directly; don't detour
  through here first.
- **A genuinely blocking question** — one where you cannot finish the
  brief without an answer. That still goes to whoever launched you
  directly, in the moment, per `docs/sop.md` phase 4. This file is for
  everything that *doesn't* stop you.

## Entries

*(Empty. Append below.)*

## Format

One entry per item, appended, never edited or deleted by the session that
wrote it:

```markdown
### <brief file name>, <date>

**Flag:** <what you noticed, in plain terms, and why you didn't chase it>

**Note:** <anything else worth the lead's attention before it's triaged>
```

Use whichever of the two fit; skip the rest. Keep it short — this is raw
material for the lead to triage, not the final wording anything ships
with.

---

## The lead's obligation

**Read this file at the start of every round, before writing the next
brief — not only when reviewing the slice that produced an entry.** An
entry left here across rounds is exactly the failure this file exists to
prevent, just moved from a deleted chat to a file nobody re-reads.

For each entry:

- **A flag or note with an obvious permanent home** → move it there
  (`docs/sop.md` phase 6's table), then delete the entry.
- **A non-blocking question** → it belongs in `docs/questions-inbox.md`,
  not here: move it there (its header says how) and delete the entry.
  Check `docs/questions-for-the-owner.md` and `docs/answers-outbox.md`
  for your step every round instead of carrying questions in your own
  report — the bar `docs/sop.md` phase 4 and `docs/lead-session.md`'s Ask
  section already set. Once the owner has answered, record the answer
  where it belongs (phase 6, same as any decision).
- **An entry that is really about the process** — the brief was missing
  something, instructions conflicted, work was redone. Also append it to
  `docs/process-observations.md` before you delete it here. This file
  gets cleared, and that one keeps the evidence.
- **A finding that reaches beyond your element** → one line in
  `docs/for-the-orchestrator.md`, so it can be fixed once for every lead.
- **Anything you're unsure how to route** — the uncertainty itself is
  worth a line in your next report, not a reason to leave the entry
  sitting unread until the next round.

**You are the only one who reports upward about anything beyond a live
blocking question.** The orchestrator (and through it, the owner) reads
your reports, not an executing session's chat. So the bar
`docs/lead-session.md`'s Ask section sets — plain language, a
recommendation attached, nothing the reader has to open a file to act
on — covers everything that used to arrive through a session's own final
message: findings and flags alike, folded into the one report that is
actually read (questions for the owner go through
`docs/questions-inbox.md`).

### step-7-b-detector.md

- **Stopped on the lead's 08:35 UTC hold, not finished and not green.** Only the record shape is on `main` (a5c98c3). Everything else is unpushed and saved whole as `handoff-prompts/step-7-b-working-copy.patch` (25 files, against a5c98c3; `git apply` it, then expect to re-fit it to what has landed since).
- **In the patch, built and passing when last run:** `content/hall/hall.json` + `src/content/kinds/hall.ts` (`content.hall.kinds[id].name`, `.stats[id].label`, signals/event names as data), `content/characters/pedestal.json` + tuning set, `content/rooms/test-hall.json`, `src/sim/hall/{watch,hang,detect,index}.ts`, `src/sim/systems/hall-detect.ts` (order 900), `step()`'s fourth argument `incoming`, scenario fields `events` and `hall`, facts `hall-record` and `entity-bytes`, and 7 of 9 `step7-*` scenarios (escape, scuffle, same-feat-twice, solo, quiet-theft, theft-noticed, restored).
- **Failing in the patch:** `step7-last-stand-lost` (the picture is empty: the alert-rise capture does not happen on the tick trouble opens, look at `rose`/`shot` in `detect.ts`) and `step7-hall-is-full` (my scenario's own numbers: its new escape scores 29, under the stored 30).
- **Not done:** the lead's four 04:50 to 04:58 messages were read only at 08:31, so none is applied: `restoreHall` must never throw and must return what it skipped; a quiet theft must also require `deed.witnesses` to be empty; `Components.hall.lasting?: boolean`; the docs go into the existing `docs/mechanisms/hall-of-legends.md`. Also undone: every failing control, the byte measurements, `docs/architecture.md`, `docs/mechanisms/scenarios.md`, `docs/deliberate-designs.md`, the decisions-log entries (floors, weights, titles, which pedestal leaves a full floor).
- **Flag:** `scripts/trace.ts` calls `feet()` on every entity and will throw on the bodiless `hall:watch` (unknown kind, room `''`); not verified, and `scripts/` is Step 1's.
