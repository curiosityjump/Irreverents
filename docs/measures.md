# Measures

**Reference.** Open when re-measuring, or citing, a number in `docs/plan.md`'s
measure table ("The destination, and the measure"). It holds the commands the
numbers came from, so a count can be re-derived, not believed.

Every number in that table comes from a command below, cited there by its
label (M1, M2, ...). A number with no command here is a claim, not a
measurement — `CLAUDE.md`'s "never answer a coverage question from memory"
applied to the plan itself.

**Last run:** 2026-11-23 at `7b8dc09`, by the first orchestrator (M1 only; M2 and M3 cannot run until Step 1 lands their commands). Ideally re-run cold by a
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

**M1 — Is the live address serving what is on `main`?** 2026-11-23 03:56
UTC: yes, but it is the deploy probe, not the game (commit 7b8dc09).

```bash
git fetch -q origin main && echo "main:  $(git rev-parse origin/main)"
echo "live:  $(curl -s --max-time 15 https://irreverents-production.up.railway.app/healthz)"
```

The two commit ids match when the newest push is live. Railway took 37 s
for a no-build push; allow a few minutes for a real build before calling
a push failed.

**M2 — Can two players on separate devices share one world at the live
address?** 2026-11-23: no (no game yet).

```bash
npm run check:live     # lands with plan Step 1; until then this measure reads "no"
```

Two headless browsers, one phone-sized with touch, join the live address;
each must see the other move.

**M3 — How many of the design library's build gates A–F (doc 24, "Decision
gates, in order") have a scripted player-view check passing?** 2026-11-23:
0 of 6.

```bash
npm run gates          # lands with plan Step 1; prints one line per gate: passing, failing, or no scenario yet
```

| Gate | In the owner's library's words | Plan step | Scripted check |
|---|---|---|---|
| A | "movement + jump + attack + grab/throw are joyful in a graybox test; 3 character abilities are distinct" | 2 | none yet |
| B | "hand-built 4–6 room map is explorable, revisitable and supports two unadvertised routes" | 3 | none yet |
| C | "shopkeeper + villain demonstration supports normal robbery as comfortable conflict, polite villain transaction as distress, persistent violation as rage, and quick reset" | 4 | none yet |
| D | "same location supports a zero-alarm intrusion AND a catastrophe that becomes enjoyable combat/pursuit with a credible escape" | 4 | none yet |
| E | "simple Hall captures a real highlight, without scripting the event itself" | 7 | none yet |
| F | "2-player same-party online works reliably" | 1, 5 | none yet |

**What this measured and what it didn't.**
- A gate "passing" means its scripted scenarios pass: the thing exists and
  behaves as written. It never means the gate's own adjectives ("joyful",
  "enjoyable") are met; those are the owner's to judge by playing.
- The gates are the library's own *recommendation* ("not commitments by
  the owner"), used here as a yardstick because the owner named none.
  Doc 24's later owner corrections (no NPC AI; no reinforcement without a
  completed call) override its older wording; so does D-073 over "quick
  reset" from rage (Q-005).
- M1 says which commit is live, not that the page works; M2 is what checks
  the page.
