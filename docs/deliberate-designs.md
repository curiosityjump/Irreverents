# Deliberate designs that look like bugs

**Standing.** Run per `docs/sop.md`.

**Read this before "fixing" anything that looks wrong.**

Strangeness in a project with an active owner is usually intent. In the
project this operating system was derived from, one review round called a
deliberate design a defect **eleven times**; every one would have been
avoided by reading a page like this first. This page starts empty and earns
its value one entry at a time.

Format: *what it looks like* → **what it actually is.**

**What an entry — and every `INTENT:` comment — is.** A best-effort reading
of something the owner said, true to the vision at the time; never "this
must stay forever" and never "this is the best possible implementation." The
originating owner put it this way, and the rule carries over: an entry may be
just the relevant words of the owner's quote and nothing else; entries will
inevitably contradict one another at some point, as the vision evolves and as
both the owner's phrasing and Claude's reading of it prove imperfect; and
**a contradiction, when it arises, is a signal of an opportunity for greater
clarity, not licence to overwrite one entry in favour of the other.** It is a
question for the owner (filed in `docs/questions-inbox.md`).

---

## The comment convention

Two greppable markers, defined in `CLAUDE.md`:

```
// INTENT: <what was chosen, and why it must stay>
// DRAFT:  <what is provisional here, and what to reconsider>
```

- **`INTENT:`** — a deliberate choice that looks odd. *Do not "fix" this*;
  ask first if you disagree. Every entry on this page should have one at its
  code site, so a session reading the file trips over it without having come
  here first.
- **`DRAFT:`** — a first pass good enough to ship, meant to be revisited.
  *Improving it is welcome.* A `DRAFT:` is not an entry here.
- **Unmarked and it looks odd → ask.** Absence of a marker is not permission.

Every entry needs a marker; not every marker needs an entry — `INTENT:` is
also used for local contracts (e.g. a compare-and-swap rule) that never
looked like a bug to anyone.

---

## Entries

Group entries under `##` headings by area of the system as they accumulate
(one heading per area, not per date). Write each as one bold "looks like"
sentence, an arrow, and what it actually is — with the owner's words quoted
where they exist, the date, and the code site.

### Decisions made on the owner's behalf

Calls a lead or the orchestrator made from recommendations while the owner
was unavailable go in their own section, each marked **"the owner may
overrule"** and reversible. Until the owner does, don't "fix" them back.
Once the owner confirms one, move it into its area's section with their
words.

**Pressing switch in a tight space sometimes does nothing, or skips a member.**
→ Intended. A member whose body would stand inside solid tiles where you are (the grappler or the flyer inside a one-tile-high crawlspace) is never switched to; the next member is tried, and if none fits the switch is refused with a `switch-refused` event and nothing changes. This is the project's "there is always a way out" principle (`CLAUDE.md`): a player is never left inside a wall. Decided by the Step 2 lead, 2026-11-23 (`docs/plan/step-2.md`); the owner may overrule. `INTENT:` at `src/sim/verbs/switch.ts`. Proven by `scenarios/body-switch-refused-in-gap.json`.

---

## Where these live in the code

Each entry above should also carry an `INTENT:` comment at its code site.
Keep this table in step with the entries:

| Entry | Site |
|---|---|
| Switch refused or skips a member in a tight space | `src/sim/verbs/switch.ts` |

**Still unmarked:** list entries that have no `INTENT:` at their site yet.
Add the marker when you next touch one.

`grep -rn "INTENT:" .` (narrowed to the source and content directories)
returns more than this table, by design — see "Every entry needs a marker;
not every marker needs an entry" above.

Corrections to an entry (it said X, the code now does Y) are made in place,
with a one-line italic note saying what changed and when — never a second,
contradicting entry.

## How to use this page

If something here looks wrong to you anyway, that's fine — but it is a
**question for the owner**, not a defect to file and not a fix to ship. The
cost of asking is one sentence. The cost of "fixing" a deliberate design is
removing working behaviour that someone chose on purpose.

**An entry covers exactly what it names.** Don't cite it for a neighbouring
behaviour it doesn't mention — a marker's scope creeps in the reader's
memory, not on the page. If the behaviour in front of you isn't named, it's
still a question.

**When the owner confirms something is intended, add it here and add the
`INTENT:` at the code site — both, same day** (`docs/sop.md` phase 6). That
is what keeps this page worth reading, and it is cheaper than the next
session rediscovering it the expensive way.
