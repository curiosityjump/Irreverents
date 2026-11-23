# Understanding the project

**Standing.** The first thing a lead session reads. Everything else routes
from here.

---

## If you were just told you are the lead — do this

`CLAUDE.md` sent you here and this file is the whole handoff. **You are not
expected to ask anyone anything before starting.** "You" below is whoever
told you this — the orchestrator in the normal case
(`docs/orchestrator-role.md`), the owner directly otherwise.

1. **Read this file** — it is the current understanding of the project.
2. **Then `docs/lead-session.md`** — the role, its steps, and the reading
   order for everything else. **It ends with a section on ending a message —
   the exact, standing shape for every message the lead sends, first reply
   included.** Use that shape, verbatim, not a paraphrase of it: the
   numbered slots (progress, next steps, questions), each included only when
   it has real content. Don't describe the reply shape here as well: a
   second description drifts from the real spec instead of pointing to it.
   If you're tempted to add one, point at `docs/lead-session.md` instead.
3. **Then reply**, filling those slots from what you've just read: where
   things stand, in plain English (whoever you're reporting to does not
   read the codebase); what you recommend next and why, naming what you
   measured to know it; anything genuinely theirs to decide, in their terms,
   your recommendation attached so "yes" is a complete answer.

**Do not reply "ready", and do not reply with a plan to read things.** One
sentence was enough to start you so that nobody has to prompt again; a
reply that asks what's wanted has spent the turn and given nothing back. If
after reading you genuinely have no recommendation, say what you would need
to measure to have one — and then go measure it.

**If the sections below are still placeholders** — a brand-new project —
your recommendation is what to measure or build first so they can be
written, drawn from `docs/vision.md` and `docs/plan.md`. Filling them is
part of your job (see "It is maintained, not accumulated" just below).

**Everything below is the understanding itself.** Read on.

This is not a history and not a summary of the other documents. It is **the
current understanding** — what this project is, where it has been, where it
is going, how it has been getting there, and what would count as going
wrong. It is written for a session that has never seen this project and is
about to be asked *"what's next?"*

**It is maintained, not accumulated.** Keeping it true and short is part of
the lead session's job (`docs/lead-session.md`). When something here stops
being the best current understanding, replace it — don't append. If it is
growing, something in it has stopped earning its place.

---

## 1 · What this is, and who it is for

> **Placeholder.** A paragraph: what {{PROJECT_NAME}} is, who it is for,
> and the understanding underneath it, from `docs/vision.md`. Whether it is
> a product for strangers or something for a known group changes almost
> every trade-off — say which.

Then the two or three consequences that decide real questions, phrased as
tie-breakers (e.g. *"legibility beats robustness"*, *"there is always a way
out"*). Point at whatever the project names as its clearest statement of
purpose, and tell the reader to read it early.

## 2 · Where it is going

> **Placeholder.** The destination, in the owner's words where possible
> (`docs/vision.md`), and **the one measurable question** progress is read
> by — e.g. *"how much custom code does it take to add one more of X?"*.

Also say what the owner does **not** want — the limit of the destination —
because a session optimizing the measure without it will overshoot.
`docs/plan.md`'s measure table is the scoreboard; `docs/measures.md` says
how each row is taken. Re-measure before quoting.

## 3 · Where it has been

> **Placeholder.** The arc, in order, a line per closed plan step that
> changed the shape of things — because the order explains the state.
> Closed steps' full text lives in `docs/plan-archive.md`; this is the
> one-line version only.

**Findings that each cost a round to learn.** Carry them. Three arrive with
this operating system, from the project it was derived from:

1. **A count or a status line has a shelf life** — recount before
   building; check `git log`.
2. **Reachable is not routed** — a long design doc, linked only from
   Archive files, got re-derived by a session that concluded it didn't
   exist.
3. **Measure a race before fixing it** — under real concurrency, the
   suspected path may lose nothing while a different one loses most of its
   writes. Measure which, then fix that one.

Add this project's own as they happen; drop one when it stops changing
decisions.

## 4 · How it has been getting there

**One lead session, many cold ones.** The lead measures, briefs, reviews
by re-running, records decisions where they belong. Executing sessions
run `docs/sop.md` and see one brief — method in `docs/lead-session.md`.

**Above the lead, the orchestrator** (`docs/orchestrator-role.md`) — the
one session the owner talks to about the build, spinning up a lead per plan
element; leads report to it. `docs/roles/README.md` lists every role.

**Vision → Plan → Briefs.** `docs/vision.md` — the owner's own words on
where this is going — is upstream of `docs/plan.md`. The owner and the
Vision Partner maintain it; a lead references it, suggesting (never making)
an update when something sounds vision-level. Cold sessions never open it —
a brief is self-contained; needing it means the brief is the gap.

**Every rule here was bought with a mistake** —
`docs/working-on-the-project.md` is the receipt.

**What "verified" means here.** Say whether there is a test suite and
whether a push to `main` is a deploy. Either way, a change is
verified when it was *run*, with a control watched to fail — "the code looks
right" was true every time something shipped broken. Ladder:
`docs/verifying-and-finishing.md`.

**The lead also builds too much when a fix looks small** — in the
originating project, one grew into a forty-file change that should have
been briefed. Line: a one-file fix directly; a new field, a core change, or
content at volume, briefed.

## 5 · Where it stands now

> **Placeholder.** Which plan steps are done (one line, pointing at
> `docs/plan-archive.md`), the owner's current goal
> (`docs/current-directive.md`), and the open steps — one line each, saying
> what each is waiting on (a build, a measurement, the owner's answer, the
> owner's own use of it). Detail and recount in `docs/plan.md`.

Anything the owner has explicitly stopped: say so here, in their words, with
**"Don't resume unasked."**

**Parked:** `docs/ideas-for-later.md`.

## 6 · How to tell it is going wrong

- Custom code is written where data would have done, unsaid (if the project
  has adopted "prefer data to code").
- A brief contains a number nobody measured.
- A session's report is believed instead of re-run.
- A decision the owner made lives only in a commit message.
- Something deliberate got "fixed."
- This file got longer without anything coming out.

## 7 · What to read next

`docs/lead-session.md` — the role, and the reading order for everything
else.

**Budget: ~1,500 words for sections 1-7** — the understanding itself, which is
the part that accumulates. The entry block at the top is fixed overhead and
doesn't count. Measure it:

```bash
LC_ALL=C.UTF-8 awk '/^## 1 · What this is/,0' docs/understanding-the-project.md | LC_ALL=C.UTF-8 wc -w
```

Over the number, something has stopped earning its place. **Replace, don't
append.**
