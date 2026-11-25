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

**M4 — Spend per visible change: how many dollars of sessions does each
change the owner can see in the game cost?** A process measure, not in
`docs/plan.md`'s table (the owner, 2026-11-23 ~15:20 UTC: *"Implement the
structural changes you recommended for efficiency"*; why it matters:
`docs/vision.md`, "Principles", "much more resukts for less tokens").
`DRAFT:` the cut below is a first pass.

**When:** at each orchestrator handoff, by the orchestrator handing off,
for its own tenure (pickup to handoff). One row in the table below, no
prose (`docs/roles/orchestrator-card.md`, "Handing off").

**How:**
- **Spend:** `get_session` on every session of the tenure (the
  orchestrator itself with no id, Vision Partner, every lead and builder
  it or its leads ran) and sum `external_metadata.usage.cost_usd`. For a session that spans two
  tenures, count only its spend since the last row. Read it when the
  session is done, not a figure recorded at its close (those have run
  low; `docs/orchestrator-role.md`).
- **Visible changes:** commits in the tenure that touched the game:

```bash
git fetch origin main
git log origin/main --since=<pickup, UTC> --until=<handoff, UTC> --oneline -- src content assets scripts | wc -l
git log origin/main --since=<pickup, UTC> --until=<handoff, UTC> --oneline | wc -l   # all commits, for the ratio
```

- **The number:** total spend divided by visible changes. Lower is better;
  read it beside what the owner can now do, never instead of it.

**What it measures and what it doesn't.**
- A commit is a proxy for a change: one big feature and a one-line tweak
  count the same, and `scripts/` includes checks a player never sees.
- Spend is only as complete as the sessions summed; a row that misses
  some says so and is a lower bound.
- Coordinators (orchestrators, Vision Partner, leads) and builders are
  kept apart so a row shows where the money went.

| Tenure (UTC) | Commits (all) | Visible changes | Coordinator spend | Builder spend | Per visible change | Notes |
|---|---|---|---|---|---|---|
| 2026-11-23 03:23–15:15 | 288 | 59 | ≥ $263 | ≥ $83 | ≥ $5.9 | Approximate, a lower bound. Counts re-run at 15:23 UTC with the commands above (the orchestrator's 15:20 count, by a slightly different cut, was 285 and 62). Coordinators: first orchestrator ~$140 (Vision Partner's figure), Fable orchestrator $37, backup orchestrator $58, first Vision Partner $28. Builders: only the nine round-1 look workers ($83); about 40 other sessions (leads and their workers) not yet summed. |
| 2026-11-23 15:46–19:15 | 139+ | 52+ | ≥ $405 | ≥ $119 | ≥ $10 | Approximate, a lower bound; counts taken at about 19:05 UTC (`git log --oneline 501c223..origin/main`, all and `-- src content assets scripts`). Coordinators: this orchestrator $363 (it ran on Opus until ~17:45, then Fable by the owner's switch, with Ultracode on: eight workflows, about 19M subagent tokens, are inside that figure), the Step 2, 11 and 12 leads $42. Builders: only the eleven whose cost was read when they were archived or checked; missing the round-3 ground and actors builders, the leads' own builders, the Step 16 lead and its builders, the two builders started at 18:21 and Vision Partner. `DRAFT:` the three independent reviews of Step 17 and the coverage inventory (about 11M subagent tokens together) found real bugs and the owner's list, at a cost the next orchestrator should weigh under the weekly limit's warning. |
| 2026-11-23 19:13–2026-11-24 02:20 | 176+ | 66+ | ≥ $87 | ≥ $188 | ≥ $4.2 | A lower bound, incomplete. Counts by `git log --oneline 46833cb..origin/main` (all, and `-- src content scripts assets`) at 02:20 UTC. Coordinators: this orchestrator $73.49 at 01:55 UTC (Fable; `get_session`), the Step 16 lead $13.34; Vision Partner and Step 22's lead not read. Builders: only the sixteen whose `cost_usd` was read as each was archived (Step 18 $20.13, heists $19.91, the rescue $22.47, hidden places 2 $19.24, doorways and the flake measurement $15.27, vehicles B 1 $13.55, vehicles A 1 $13.31, hit prediction $12.22, puzzles 1 $12.19, risk $10.76, Step 14 slice A $9.86, props 1 $9.49, the Hall's picture $5.57, and three figures that were plainly partial); about as many sessions again were not read (waves 1, town tiers 1 and 2, powers, the fly-off, the title screen, and the eleven still running). |
| 2026-11-24 02:12–14:45 | 196+ | 74+ | ≥ $90 | ≥ $267 | ≥ $4.8 | A lower bound, incomplete. Counts by `git log --oneline 3f408d2..origin/main` (all: 196, and `-- src content public scripts scenarios tools`: 74) at 14:30 UTC. Coordinators: this orchestrator $69.78 at 13:57 UTC (Fable; `get_session`; about ten subagents for looks, drafts and a bisect are inside it), Step 22's first lead $14.46; Vision Partner, Step 22's second lead and Step 15's lead not read. Builders: the twenty whose `cost_usd` was read as each was archived (hearts 1 $28.20, weapons 1 $28.18, the chase $21.10, props $17.93, the HUD 1 $16.13, beaten $15.95, the thrower 1 $14.78, weapons 2 $13.41, the wave's wagon $13.17, vehicles B $11.85, the alarms $11.72, the checks builder $10.31, the town 3 $9.95, weapons 3 $9.92, the camera 1 $9.52, buttons $9.09, the HUD 3 $8.02, the HUD 2 $7.89, the town 4 $6.69, hearts 2 $3.30); not read: the town 2, the camp's rows 1, the six running, the leads' builders (Step 22 had seven, Step 15 three). |
| 2026-11-24 14:32–2026-11-25 02:00 | 121+ | 39+ | ≥ $121 | ≥ $142 | ≥ $6.7 | A lower bound, incomplete. Counts by `git log --oneline 451cc2a..origin/main` (all: 121, and `-- src content scripts`: 39) at 01:55 UTC, with six builders' pushes still held locally by the owner's pause. Coordinators: this orchestrator $84.56 at 01:54 UTC (Fable; `get_session`; about twenty subagents for looks and drafts are inside it), the second Vision Partner $36.24 (most of it before this tenure). Builders and leads: only the fifteen whose `usage.cost_usd` showed when archived: Step 15's lead $20.38, Step 22's lead $12.62, the camp's rows 2 $12.65, the quarry 1 $12.41, a page misses $11.57, the backgrounds 1 $10.53, the trike 1 $9.52, the town 5 $9.46, the suplex 2 $8.48, the e2e's reds 1 $8.09, the plate $7.31, the suplex 3 $5.80, the camp's rows 3 $4.63, the courtyard's bandit $4.63, the quarry 2 $4.07; about fifteen more showed no usage when read (`used_tokens: 0`). `DRAFT:` |
| 2026-11-25 02:00–12:20 | 47+ | 21+ | ≥ $106 | ≥ $71 | ≥ $8.4 | A lower bound, incomplete. Counts by `git log --oneline 5a31b6f..origin/main` (all: 47, and `-- src content scripts scenarios`: 21) at 12:17 UTC. Coordinators: this orchestrator $105.66 at 12:16 UTC (Fable; `get_session`; four subagents for looks and the gaps refresh are inside it; its context reached 741k by 12:16, much of it tool definitions re-sent at each reconnect, not work); Vision Partner not read. Builders: the eight whose `usage.cost_usd` showed when archived: the trike 2 $15.13, escalation 3 $10.01, legibility $9.73, camp/reds 2 $9.03, escalation 1 $8.09, guards-meet-bandits $7.87, the recruit 2 $7.33, reds 3 $3.64 (the first six were spawned by the predecessor and are partly its spend); missing: escalation 2 and reds 4 (no usage shown). One builder at a time from 08:55. |
