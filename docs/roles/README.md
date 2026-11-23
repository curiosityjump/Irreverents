# Role index

**Standing.** Run per `docs/sop.md`. Read this when deciding whether a job
needs a session spun up for it, and if so, whether a role already fits —
same job `docs/mechanisms/README.md` does for the system's mechanisms,
applied to *who does the work* instead of *how the system works*.

---

## A role is not a session

A **session** is one disposable run of Claude Code. It starts cold, does
work, and disappears — sometimes in minutes, sometimes (the lead) across
many rounds, but never permanently. Nothing about this project should
depend on any one session still existing.

A **role** is what survives: a charter written down in this repository —
purpose, what it reads, what it's allowed to touch, how its work gets
checked, what it must never do — that a *new, unrelated* session can pick
up cold and perform correctly. `docs/lead-session.md` is a role charter.
`docs/orchestrator-role.md` is a role charter. Neither belongs to the
session that first wrote it.

In the project this system was derived from, this split was proven
repeatedly rather than assumed: the lead role was picked up cold by many
unrelated sessions, each producing a working recommendation without the
owner re-explaining anything, and one project-specific role ran as more than
a dozen separate sessions sharing one evolving charter, none of which needed
to survive for the role to keep working. Test it here the same way: a
session that has run nothing else, handed only the role name.

## How a role is born

Don't design roles speculatively. The one role that grew this way in the
originating project did it in this order, and it's the template:

1. **Perform the job once, without a role doc.** The first round ran on a
   design doc alone.
2. **Write down only what turned out to matter**, after doing it, not
   before — the role doc didn't exist until round 1 was over.
3. **Refine against real evidence when it recurs**, not intuition about
   what *might* go wrong. Every rule in that role doc traced to a named
   round: one round rewrote the pacing section because prose read once
   didn't survive real wake cycles; another added "verify a claim live"
   after the role's own rationale log described a mechanism its output
   didn't actually deliver; a later one — the first with real, independent
   users and no coordinator — added a subagent-use floor and a rule that a
   named user with no path of their own is graded as broken, not
   disengaging. Each fix was traceable to one after-action review, not a
   guess about what a future round might need.
4. **Promote a stable, repeated finding past prose when you can.** Some
   lessons stay rules in the role doc because they're judgment calls.
   Others become things a session can't get wrong even by not reading the
   doc carefully enough — a recoverability guarantee made real in data
   instead of a warning to remember; a soft-lock made impossible by a check
   in the action itself. A rule that only lives in prose is a rule a rushed
   session under time pressure can still break.

A job that hasn't recurred doesn't need a role yet — do it directly, once,
and see if it comes back.

## The auditor pattern — flexible, not a standing service

The originating project's owner, offered a standing recurring auditor after
a real drift was caught, refused it: **it "would be prone to the exact
problem it's meant to solve."** A permanent background process is itself a
thing nobody's watching — the same shape of failure as a scheduled wake
that silently dies with nothing noticing. **The idea that needs to exist
everywhere is the system catching its own drift; a specific piece of
standing infrastructure is not how that idea gets instantiated.**

So "auditor" is not a role with a charter file, a trigger phrase, or a
place in the table below — it's a **habit any session reaches for**: spin
up a cheap, disposable subagent (in-process, gone the moment it answers —
never a new standing session or scheduled task, which would make it a
standing thing again) to check a specific claim against reality before
trusting it. Not a taste critic — a fresh, disinterested check on a
narrow, mechanical question: does this session or scheduled task the docs
call "live" still exist and still fire; does this status line match what's
actually true right now; does the build still pass on HEAD. A session with
no stake in the answer catches what a session that's been reasoning toward
that answer for a while won't. See `docs/lead-session.md`'s Review section
for where this actually gets used.

**Use it whenever, for whatever, as often as it's cheap enough to be
worth it** — before reporting something done, before trusting your own
long-context judgment call, before believing a doc that hasn't been
re-checked in a while. It never becomes a role in this table unless the
*way* it's used turns out to recur in some specific, chartered shape —
and even then, per "How a role is born" above, only after that's actually
happened, not because it seems likely to.

## Two shapes a role's work takes — both launched the same way

**Infrastructure caveat.** If your environment gives sessions a tool to
start other sessions (for example Claude Code Remote's `create_session`,
with `create_trigger` / `send_later` for self-scheduled wakes and
`list_sessions` to see which sessions a parent spun up), then **nobody
below the owner launches a session by hand**: whoever assigns the work
starts it directly — a lead for its own brief-workers, the orchestrator for
its own leads. **If not, the fallback** is the assigning session handing the
owner one short line to paste into a fresh session (the brief's path), and
the owner launching it. Either way, what differs is the *shape* of the
work, not the launch mechanism:

- **Brief + handoff** (`docs/briefs.md`) — a self-contained file in
  `handoff-prompts/`, launched once and left to run. Right for one
  bounded slice with a clear finish line: the session does the work,
  reports done or blocked, and stops.
- **Self-scheduling** — the session keeps re-arming its own wake cycle
  with nobody watching between builds. Right when the role's own job
  requires continuing to act — building, watching, reacting to real users
  in real time — across real time that nobody is going to sit and
  supervise. Needs a scheduling tool; without one, this shape isn't
  available and the work becomes a sequence of briefs. See
  `docs/lead-session.md`'s "Instantiating other sessions directly" for the
  fuller trade-off.

---

## The roles that exist today

| Role | For | Charter | How a session is told it occupies this role |
|---|---|---|---|
| **Orchestrator** | The one session the owner talks to about the build, across the whole project — not between rounds of one workstream. Works with the owner on the master plan, decomposes it into elements, briefs builders directly (a lead only for a large, many-slice step; two layers by default since 2026-11-23), propagates lessons into the operating system itself. The root of this project's Claude organization. References `docs/vision.md`; does not edit it — Vision Partner does. | `docs/roles/orchestrator-card.md` (start-up), `docs/orchestrator-role.md` (reference) | "You are the orchestrator. Read CLAUDE.md first." (routed from `CLAUDE.md`), or a fresh session the owner talks to directly with no role and no brief named |
| **Lead** | Owns one element of the plan, assigned by the orchestrator: measures, briefs, reviews what comes back, records decisions, asks. | `docs/lead-session.md` (entered through `docs/understanding-the-project.md`) | "You are the lead. Read CLAUDE.md first." (routed from `CLAUDE.md`) — usually because an orchestrator spun you up for a large step, occasionally because the owner started one directly |
| **Brief-worker** (also called an executing session) | The generic worker role every brief runs under, whatever the domain — orient, locate, doubt, ask, build, record, finish. Long-lived since 2026-11-23: takes its next brief by message while under about 400k tokens. | `docs/roles/builder-card.md` (start-up), `docs/sop.md` (reference) | "You are the brief-worker" (routed from `CLAUDE.md`), or any session whose prompt names a brief file (e.g. `work handoff-prompts/x.md`) with no other role named |
| **Industrial Engineer** | Studies the development factory itself (roles, handoffs, briefs, verification, scheduling, spawn behaviour, process tooling), not the product. Reasons from `docs/process-observations.md`, `docs/spawn-failures.md`, git and session records to find waste, recurring errors and load-bearing mechanisms; proposes experiments with success measures. Recommend-only, on assignment, not a standing service. The first one starts only when the readiness criteria in `docs/process-observations.md` hold and the owner asks; after that, the orchestrator starts later ones on the T1–T8 evidence triggers, telling the owner (the one rule: `docs/orchestrator-role.md`, "Starting an Industrial Engineer"). | `docs/industrial-engineer-role.md` | "You are the Industrial Engineer. Read CLAUDE.md first." (routed from `CLAUDE.md`) plus an assignment file in `handoff-prompts/`, started by the orchestrator |
| **Skunk Works Lead** | Maximally creative idea generation: fans out research subagents across unrelated fields, collides what they find with this project, and writes reports of striking ideas for the owner to pick from (`docs/skunk-works/README.md`). Builds nothing, edits nothing outside `docs/skunk-works/`. Normally runs as **one ongoing session the owner talks to directly** — a named exception to the one-session default, like Vision Partner. It works only when asked and hands off to a fresh successor before its memory ages. | `docs/skunk-works-role.md` | "You are the Skunk Works Lead. Read CLAUDE.md first." (routed from `CLAUDE.md`), started by the orchestrator or the owner |
| **Vision Partner** | Keeps `docs/questions-for-the-owner.md`, the one list of questions waiting on the owner; every session feeds it. Hears the owner's answers first-hand and writes each one, quoted, into the document that governs it, then rings the orchestrator. **Also keeps the vision documents with the owner** (`docs/vision.md` and `docs/vision-archive.md`): longer-term ideas and vision-level answers go there. Decides nothing about the build; never changes the product's behaviour. An ongoing session the owner talks to directly, a named exception to the one-session default. Usually the **first** session a new project starts. | `docs/vision-partner-role.md` → `docs/questions-for-the-owner.md` | "You are Vision Partner. Read CLAUDE.md first." (routed from `CLAUDE.md`); the ongoing session's prime adds "then docs/questions-for-the-owner.md" (the charter) |
| **Round contributor** | Not a standalone role so much as an operating mode several sessions share on one round of parallel work — non-overlapping domains, a shared design doc, an append-only decision log. | `docs/team-collaboration-protocol.md` | Assigned a domain and pointed at the round's design doc by whoever opened the round |

**Why Vision Partner and Orchestrator are two roles, recorded because the
reasoning is the kind of decision this file exists to keep visible.** The
default is that the owner talks directly to **one** session — the
orchestrator — and everything else is spun up beneath it. A second
top-level role contradicts that default, and in the originating project the
two were merged once on exactly that argument. The owner then reversed it,
as a **named exception**, not a repeal: the two conversations are genuinely
different in kind — free riffing that becomes vision-document updates,
versus turning an already-settled vision into an actually-built product.
Their words, paraphrased: *for now it's two — the vision partner where I
riff freely and we update the vision doc together, then the orchestrator
that actually makes the vision reality.* A separate question-keeping role
was later folded into Vision Partner for the same reason: questions,
answers and vision-level ideas all arrive in the same free-form
conversation.

**The one-session principle still stands as the default; each exception is
deliberate, acknowledged, and explicitly provisional ("for now").** The
exceptions today are Vision Partner and the Skunk Works Lead. Don't
re-merge roles on your own initiative if this tension resurfaces, and don't
treat the current count as permanent either — both directions are the
owner's call each time, not a pattern for a session to resolve on its own.

**When none of these fit:** do the job directly, once, without inventing a
role for it. If it recurs, follow "How a role is born" above and add a row
here — plus a trigger phrase in `CLAUDE.md`'s "How to work here" if the
role needs to be reachable by name.

**Jobs performed once so far, waiting to see if they recur:**
- *(none yet — list each one-off job here with its date, who started it,
  and where its record is, e.g. `docs/process-observations.md`. If it
  recurs, decide then whether it becomes a role or something lighter, such
  as a project skill.)*
