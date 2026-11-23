# Measures

**Reference.** Open when re-measuring, or citing, a number in `docs/plan.md`'s
measure table ("The destination, and the measure"). It holds the commands the
numbers came from, so a count can be re-derived, not believed.

Every number in that table comes from a command below, cited there by its
label (M1, M2, ...). A number with no command here is a claim, not a
measurement — `CLAUDE.md`'s "never answer a coverage question from memory"
applied to the plan itself.

**Last run:** 2026-11-23 08:45 UTC at `4678680` (live) / `cdede03` (main), by the Step 1 lead: M1 `check:deployed` ok (main ahead by documents only), M2 `check:live` exit 0, M3 `npm run gates` 4 of 6 (A, B, C, F). Ideally re-run cold by a
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
npm run check:deployed
```

Exits 0 when the commit the live address is running (`/healthz`) is the
tip of `origin/main`, **or** when every commit since it changed only
files that do not redeploy (anything outside the paths listed in
`railway.json`: `docs/mechanisms/deploy.md`); it prints which. It waits
up to three minutes for the address to answer, because every deploy has
a gap. Non-zero when
`main` holds code that is not live, the address does not answer, or the
running commit is not on `main`. A push takes 25 to 40 s to go live;
allow a few minutes before calling one failed.

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
npm run gates          # real since Step 1 Gate 1; one line per gate: passing, failing, or no scenario yet; exit 1 if any is failing, 2 if content or a scenario file is invalid
```

| Gate | In the owner's library's words | Plan step | Scripted check |
|---|---|---|---|
| A | "movement + jump + attack + grab/throw are joyful in a graybox test; 3 character abilities are distinct" | 2 | none yet |
| B | "hand-built 4–6 room map is explorable, revisitable and supports two unadvertised routes" | 3 | none yet |
| C | "shopkeeper + villain demonstration supports normal robbery as comfortable conflict, polite villain transaction as distress, persistent violation as rage, and quick reset" | 4 | none yet |
| D | "same location supports a zero-alarm intrusion AND a catastrophe that becomes enjoyable combat/pursuit with a credible escape" | 4 | none yet |
| E | "simple Hall captures a real highlight, without scripting the event itself" | 7 | none yet |
| F | "2-player same-party online works reliably" | 1 lands it, 5 hardens it (rejoin) | none yet |

**What this measured and what it didn't.**
- `npm run gates` calls a gate passing as soon as one scenario tagged with
  its letter exists and none tagged fails. So the count is only as good
  as the tags: each step file says which of its signals must have a
  tagged scenario before its gate counts, and anyone quoting M3 (the
  morning report above all) reads the scenario names on each gate's line
  against that list, never the bare "N of 6". Checks that live in `npm
  run e2e` are invisible to it.
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
