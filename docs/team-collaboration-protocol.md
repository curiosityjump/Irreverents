# Team collaboration protocol

**Standing.** Run per `docs/sop.md`.

How multiple sessions work the same round of Irreverents changes at once
without blocking each other, overwriting each other's work, or needing to be in
lockstep. In the project this system was derived from, this was the de facto
pattern for several multi-session rounds before it was written down; it is
written down so every future round (and every new contributor session) starts
from the same playbook instead of re-inventing it, and so the playbook can
improve over rounds instead of living only in habit.

Every such round has the same shape: one orchestrating session (usually the
lead for that element, `docs/lead-session.md`) opens a **design doc**
(`docs/<round-name>.md`) and one **brief per contributor**
(`handoff-prompts/<name>-<round>-<domain>.md`). The rest of this doc is the
operating rules for both halves.

## Core principle: support each other, don't block each other

Nobody should sit idle waiting on someone else when there is real work they
could be doing instead, and nobody should lose work because two sessions edited
the same thing at the same time. Both halves are designed for explicitly, not
left to luck:

- **Don't block on a dependency you don't actually have.** Every brief should
  separate "blocked on X" from "doesn't need X" as two explicit, named lists,
  not a vague "wait for the others." If 80% of a task is independent of
  another contributor's output, say so, so that work starts immediately.
- **Don't interrupt someone else's in-progress work.** There is no synchronous
  channel between sessions; coordination happens entirely through files,
  asynchronously. That means:
  - **Pull and rebase the shared design doc immediately before every edit to
    it**, not once at the start of your session. Two sessions editing the same
    doc minutes apart is the normal case, not an edge case.
  - **Only append to the Decisions & Discussion Log.** Never edit or delete
    another contributor's entry, even to fix a typo or correct a claim you
    think is wrong. Reply with a new, signed entry instead, referencing them by
    name and date. The log is a transcript of who-decided-what-when; rewriting
    someone else's words in place destroys that history and risks a silent
    merge conflict if they are editing at the same moment.
  - **Sign every entry** (`**Name, date:** ...`) so attribution survives the
    log growing long.
  - **Post a decision to the log before building anything that changes a
    shape another contributor depends on** (a field name, an endpoint response
    shape, a data schema). Building first and announcing after means whoever
    already started against the old shape has to redo work. Posting first
    costs you a few minutes of writing instead of costing someone else a redo.
- **If you find a problem in someone else's already-shipped work**, don't
  unilaterally change it. Post the finding to the log, with enough detail that
  they don't have to re-derive it, and let them respond, unless you jointly
  own that surface and the fix is small and uncontroversial. The model is
  "contributor C finds it, posts it, contributor A fixes it in their own
  domain," not "C finds it and silently patches A's file."

## Writing a brief for a multi-session round

**What goes in one is `docs/briefs.md`.** That page is canonical for every
brief, single-session or not, and is not repeated here. Three things are
specific to a multi-session round:

1. **A pointer to the round's design doc**, to be read in full, first. The
   brief should never duplicate the full diagnosis; summarize just enough to
   orient, then defer.
2. **An explicit split of blocked vs. not**, named by what it is blocked on (a
   teammate's deliverable, infrastructure, a decision pending in the log), and
   what can start immediately regardless. If a task has zero independent work,
   say so plainly rather than implying there is something to do right now.
3. **A bounded domain**: what files or systems this contributor owns for this
   round, ideally non-overlapping with the others', so two sessions are never
   racing to edit the same file.

Briefs are scratch, not permanent documentation; delete each one once its
slice ships (`docs/sop.md` phase 6). **The directory being empty between
rounds is the healthy steady state, not decay**: it is populated only while a
round is live.

## Writing the design doc

The design doc is the one shared surface everyone reads and writes. It plays
three roles at once: motivation and context (so nobody has to re-explain why
the round exists), a live reference for fixed shapes and decisions (so
contributors don't have to guess or re-derive each other's interfaces), and
the discussion log itself. Once a round ships, the doc is not deleted. It stays
as permanent history alongside the other persistent design docs, so a future
round can read why a past decision was made instead of relitigating it. Make
sure a Standing document links to it (`docs/lead-session.md` step 4: reachable
is not routed).

## What this protocol is not

Not a replacement for judgement about scope. An orchestrating session still
has to decide whether a round actually benefits from being split across
several sessions versus being done by one. A single, narrow, already-diagnosed
bug fix doesn't need three briefs and a design doc; a cross-cutting change
touching several layers and needing live multi-user verification usually does.

Not a synchronous standup, a chat channel, or a task tracker. Nothing here
relies on one session pinging another mid-task; everything routes through the
design doc and committed code, checked asynchronously. **Infrastructure
caveat:** if your environment does let sessions message each other (the
source project's Claude Code Remote had `send_message` and scheduled wakes
into named sessions), use that only to say "something changed, go read the
log," never as the place a decision lives. The decision still goes in the
design doc first.
