# Measures

**Reference.** Open when re-measuring, or citing, a number in `docs/plan.md`'s
measure table ("The destination, and the measure"). It holds the commands the
numbers came from, so a count can be re-derived, not believed.

Every number in that table comes from a command below, cited there by its
label (M1, M2, ...). A number with no command here is a claim, not a
measurement — `CLAUDE.md`'s "never answer a coverage question from memory"
applied to the plan itself.

**Last run:** <date> at `<commit sha>`, by <role>. Ideally re-run cold by a
fresh session (a subagent is enough) with the same answers before the table
relies on it.

**To re-measure:** run them all from the repository root, update the numbers
here and in `docs/plan.md`'s table together, in one commit, and record the
commit sha above. Say what each command needs to run (an interpreter, a
library, a deep enough clone — a spawned session's shallow clone may not reach
the history a per-commit measure walks; deepen it first with
`git fetch --shallow-since=<date> origin main`).

---

## How to write a measure

- **One label, one question, one command.** The label is what the plan cites;
  the question is in plain words; the command answers it and nothing else.
- **State the result next to the command**, with its breakdown, so a reader
  can see the number without running anything and a re-run can be compared
  line by line.
- **Measure the thing, not a proxy for it.** A grep that undercounts because
  of formatting, or a count of definitions when the question was about uses,
  has shipped wrong numbers before. When the obvious one-liner is fragile,
  write a short script and say why.
- **Say what it measured and what it didn't**, under the table, in a few
  bullets. The limits of a measure are part of it.
- **A measure the plan stops citing is retired, not deleted** — strike it
  through with the date, so old citations still resolve.

---

## The measures

*(None yet. The first lands with `docs/plan.md`'s first measured row.)*

An example of the shape (fake; delete when the first real measure lands):

**M1 — <question, in plain words>.** <result>: <breakdown>.

```bash
<the command that produced it>
```

**M2 — <a per-change measure, e.g. "files touched outside the data directory
per new primitive">.** Defined as <what counts>. One row per change.

```bash
for c in <shas>; do git show --name-only --format= $c; done | <filter> | sort -u | wc -l
```

| Change (step) | Commit(s) | Kind | Count |
|---|---|---|---|
| <name> (<step>) | `<sha>` | <kind> | <n> |

**What this measured and what it didn't.**
- <a limit of the measure>
