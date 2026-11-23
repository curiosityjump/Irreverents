# Builder card

**Standing.** The start-up read for any session handed a brief (`work
handoff-prompts/<x>.md`), in place of `docs/sop.md`. The SOP and the
documents this card points to stay as reference: open the section a
pointer names when you need that detail, not before. Your brief wins on
scope, paths and what to build; the pre-push gate (section 6), pushing to
`main`, never weakening a check, and section 2 are not a brief's to
change. `DRAFT:` set by the orchestrator,
2026-11-23, on the owner's "Implement the structural changes you
recommended for efficiency".

## 1 · Read your brief, first and in full

It is the task, the measure row it moves, what is already measured and
decided, what is open, the traps, what is out of scope, and **the paths
you own** (listed, or the table it names). Touch only those paths; on a
rebase conflict outside them, take theirs and re-apply yours. Don't
re-measure what it measured, or read the vision or the design library
unless it sends you there, you write words a player reads (`docs/vision.md`
is the voice doc for now), or section 3 needs the owner's words. Where it
is wrong, thin or silent, ask (section 4) rather than guess
(`docs/briefs.md`, the opening section).

**Then see what has already landed**, since a push is a live deploy:
`git fetch origin main && git log --oneline origin/main --grep '<lane or
brief name>'`, the brief's "Landed so far" line, and its notes file.
Skip pushes already on `main`. If the step file's "Briefs" line names
another session holding this brief, ask your report-to before building.

Before changing a file, `grep -rl "<its basename>" docs/mechanisms/` and
write one line per hit on what it says about that file (a shared basename,
like `sprites.ts` in `src/client/draw/` and `src/content/kinds/`, also hits
the other file's docs: that line says so; grepping the longer path would
miss docs that write the bare name); touching a
named mechanism, read its writeup first (`docs/mechanisms/README.md`
indexes them). Keep that list: section 6 fixes what your change made
false (`docs/sop.md`, "1 · Orient").

## 2 · Before calling anything a bug

Read `docs/deliberate-designs.md`, look for an `INTENT:` at the site,
and write the one sentence that would make it deliberate. If you cannot
rule that reading out, it is not a bug: leave it as it is and log the
doubt in your notes file (section 7). Absences count too: an empty folder or an
unused rule may be the design. Never patch someone else's shipped work;
say what you found (`docs/sop.md`, "3 · Doubt";
`docs/team-collaboration-protocol.md`, "Core principle").

## 3 · Decide and log; never stall on the owner

Mechanics are yours: decide, no entry. A question of the owner's intent:
find their words (`docs/vision.md`, the design library,
`docs/deliberate-designs.md`, earlier `docs/decisions-log.md` entries),
decide, build it so the other answer is a small change, mark the site
`DRAFT:`, and add one entry to `docs/decisions-log.md` in the owner's
terms (its "Format"), or wherever your brief says decisions go. A
decision made for the owner adds or chooses; it never deletes working
behaviour. What only the owner can supply (a fact, an action on a
service, their taste after playing) goes to `docs/questions-inbox.md`
(its header says how), and nothing waits on it (`docs/sop.md`, "4 · Ask").

## 4 · Who you report to

Your **report-to** is the lead your brief names. Otherwise, and whenever
your brief names the orchestrator (by role or by id), it is the session on
the `**Orchestrator:**` line in the header of
`docs/questions-for-the-owner.md`, read after a `git pull` at the moment
you send: orchestrators hand off. **Never just `@parent`**: a
stopped parent strands the report. Send with `send_message`; with no such
tool, your final message carries it.

- **Blocking question** (you cannot finish without the answer): message
  your report-to at once, and carry on with everything else.
- **Changing a shape someone else depends on** (a field, a message, a
  data format): message first, build after, additively only.

## 5 · Build and verify

- Before writing new code, check `docs/plan.md`, "What is already
  right", for a subsystem that already does it (`docs/sop.md`, "5 · Build").
- Work in your brief's pushes: small, each green and standing alone,
  **nothing half-working on `main`**. Keep a hard stop the brief names:
  drop the unfinished push and say where you stopped. Never push code
  "to see".
- **Run it, don't read it**: at least one rung above "it compiles". Drive
  the real thing with a **failing control** (watch the check fail on the
  pre-change code); two sessions at once for shared state; anything a
  player sees is screenshotted at iPhone size (390×664 upright, 844×390
  sideways) and looked at, which an API walk is not
  (`docs/verifying-and-finishing.md`, "The verification ladder").
- Never weaken, skip or edit a scripted check or its control.
- The traps that cost most: `content/` is baked in at build, so run
  `npm run build` after restoring a control that edited it; a new
  top-level folder deploys only once it is in `railway.json` and
  `scripts/lib/deploy-paths.ts`; stop a server by its pid, never
  `pkill -f` (same file, "Traps that will fool you").

## 6 · The pre-push gate: a push to `main` is the live deploy

1. `npm run build && npm run check`, plus `npm run e2e` when the client
   or the network changed. Judge by exit code, not scrollback.
2. Before a code push: `curl -s
   https://irreverents-production.up.railway.app/debug/errors` (a deploy
   empties it; anything there goes in your report), and look at
   `/healthz`'s `players`: a code push takes the game down for about a
   minute and resets the world.
3. `git fetch origin main && git rebase origin/main`; re-run step 1 if
   anything but documents came in. Re-read your brief if it changed.
4. `git branch --show-current` prints `main`; `git push origin main`;
   then `git ls-remote --heads origin main` shows your
   `git rev-parse HEAD`. Never push to the auto-generated `claude/...`
   branch your harness names: work there is silently dropped, and the
   owner's permission to push to `main` is `CLAUDE.md`, "Git: one branch"
   (`docs/git-workflow.md`, "Auto-generated session branch names").
5. `npm run check:deployed` (it waits up to three minutes), and
   `npm run check:live` when your brief asks. If it fails: **revert
   first** (`git revert <sha> && git push origin main`), tell your
   report-to, diagnose after.

A documents-only push does not deploy: steps 3 and 4 only
(`docs/verifying-and-finishing.md`, "This project's setup", its pre-push
gate paragraph; `docs/mechanisms/deploy.md`).

**Before the commit**, fix each doc on section 1's list that your change
made false: edit the writeup, never append a second account. Fill the
`docs/sop.md` "6 · Record" rows your change triggered: a new mechanism
gets its index line and writeup; an exceptional process cost, a few lines
in `docs/process-observations.md`; a spawn failure, `docs/spawn-failures.md`. **The commit message** says why, what you
ran and how, what you did not verify, the measure row moved (or none),
and code where data would have done, if you chose it. You can say in one
sentence how it is undone; if that is not "revert the commit", you have
found the risky part (`docs/verifying-and-finishing.md`, "Reversing it",
"Definition of done").

## 7 · Report, then wait

One message to your report-to: **"<lane> done at <commit>"**, plus at
most three lines on what is weakest. Blocked instead: what blocks it and
the last green commit. Your final message says no more than that.

**Flags, doubts and anything you did not verify** (a skipped rung-5
check) go in a file, never only in a message: the notes file your brief
names, else `docs/for-the-lead.md` if a lead briefed you, else
`docs/for-the-orchestrator.md`. The report names the file. Beyond that,
paperwork is the commit, the `DRAFT:` markers, decision entries and
section 6's rows: no status paragraphs, no handoff note the brief did not
ask for. Leave the brief: your reviewer deletes it after review.

Then end your turn. The next brief may come by message from your
report-to: `git pull`, re-read the brief file it names in full (the file
on `main` is the task; the message only points at it, `docs/spawn-failures.md`,
"A message is not a task"), and start again at section 1, while your context is under
about 400k tokens (`get_session` with no id:
`external_metadata.context_usage.used_tokens`).
Over that, reply that you are over it, so a fresh builder takes the
brief, and stop.
