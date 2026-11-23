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

Irreverents is a 2D side-scrolling action-adventure played in a browser,
**primarily on iPhones with touch** (computers second), **for the owner
and their friends** (a known group, not strangers). A shared party of gleefully curious heroes ignores
the world-saving quest; the world, which has made a religion of the
Hero's Journey, reacts when they do. The owner has designed it in depth:
`docs/vision.md` is the short version in their words, `docs/design-library/`
the full library (start at its `README.md`; its PROPOSED / EXAMPLE / OPEN
labels are literal). **Read `docs/vision.md` early.**

What decides real questions here: gameplay before joke; NPCs are scripted,
never AI; getting caught opens play; impact over numbers; solo never
locked out; iPhone first; use by default and revise later; built for
friends, not strangers (`CLAUDE.md` has each in a line). And one that is about us, not the game:
**how it feels is the owner's to judge by playing**, so the job is to get
playable things in front of them, not to grade our own work.

## 2 · Where it is going

The owner's first deadline, in their words (2026-11-23): *"I want as much
of the vision in playable form as possible by the time i wake up tomorrow.
I want to be playing the game having fun with it with my brother in law
tomorrow morning."* The destination beyond that is the whole of
`docs/vision.md`.

**The measurable question:** is the live address serving `main` (M1), can
two people on separate devices play together there (M2), and how many of
the library's six build gates have a scripted check passing (M3).
`docs/plan.md`'s table is the scoreboard; `docs/measures.md` says how each
row is taken. Re-measure before quoting.

**The limit:** a passing script is not fun. Don't optimise the gate count
by building things nobody would enjoy, and don't promote the library's
proposals into decisions to get there (`docs/vision.md`, "What it is
not").

## 3 · Where it has been

**Step 1 closed 2026-11-23 08:55 UTC**: the game is live, two people
play together on phones, and every step builds on one simulation, data
for content and checks, and a network layer that copies the whole world
(`docs/plan.md` has the summary). Before the plan: the owner installed this
operating system (2026-11-23), Vision Partner mirrored their Drive design
library and wrote the vision, and the first orchestrator measured the
deploy (a push to `main` is live on Railway in under a minute) and wrote
the first plan.

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

4. **A brief changed under a running worker is not read until its next
   rebase, and messages queue behind its work** (Step 1: a worker built
   a whole first version against superseded text). Batch changes, mark
   them at the top of the brief, and expect delivery to be late.
5. **Push small and often when the allowance is shared**: a usage limit
   stopped every session mid-task for three hours with a finished,
   tested change sitting unpushed in one container.

Add this project's own as they happen; drop one when it stops changing
decisions.

## 4 · How it has been getting there

**One lead session, many cold ones.** The lead measures, briefs, reviews
by re-running, records decisions where they belong. Executing sessions
run `docs/sop.md` and see one brief — method in `docs/lead-session.md`.

**Above the lead, the orchestrator** (`docs/orchestrator-role.md`) — the
one session the owner talks to about the build; leads report to it. Since
2026-11-23 it briefs builders directly and opens a lead only for a large,
many-slice step (`docs/roles/orchestrator-card.md`); builders start from
`docs/roles/builder-card.md`. `docs/roles/README.md` lists every role.

**Vision → Plan → Briefs.** `docs/vision.md` — the owner's own words on
where this is going — is upstream of `docs/plan.md`. The owner and the
Vision Partner maintain it; a lead references it, suggesting (never making)
an update when something sounds vision-level. Cold sessions never open it —
a brief is self-contained; needing it means the brief is the gap.

**Every rule here was bought with a mistake** —
`docs/working-on-the-project.md` is the receipt.

**What "verified" means here.** A push to `main` is the deploy, with no
staging and no CI; the scripted scenarios Step 1 lands are the only test
suite. A change is
verified when it was *run*, with a control watched to fail — "the code looks
right" was true every time something shipped broken. Ladder:
`docs/verifying-and-finishing.md`.

**The lead also builds too much when a fix looks small** — in the
originating project, one grew into a forty-file change that should have
been briefed. Line: a one-file fix directly; a new field, a core change, or
content at volume, briefed.

## 5 · Where it stands now

Night one (2026-11-23). The owner's current goal is in
`docs/current-directive.md`. Step 1 is done and live; the other steps build on it in
parallel. The account's usage limit stopped every session from 04:57 to
08:20 UTC, so the night is short: finished work only from 10:00 UTC
(`docs/current-directive.md`). Untried by anyone: a real iPhone (the page now
reports its own errors: read `/debug/errors` on the live address
before any code push, which empties it). Open steps, their status lines and what each
waits on are in `docs/plan.md`; recount there, not here.

Nothing has been stopped by the owner.

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
