# Git workflow, and the false alarms it produces

**Standing.** Run per `docs/sop.md`.

`CLAUDE.md` carries the rule. This file carries the reasoning and the
local-only false alarms a cloud-container setup keeps generating, so nobody
re-derives them.

---

## The branch

All Irreverents work goes on **`main`**. The facts a session needs and must
not guess (measured 2026-11-23 by the first orchestrator):

- **`main` is the default branch** of `https://github.com/curiosityjump/Irreverents`
  (spell the URL exactly so, capital I). The owner's own first commit of
  `CLAUDE.md` (c2a0bbb) says "All work goes on `main`".
- **Deploy:** Railway serves the game at
  https://irreverents-production.up.railway.app. Whether Railway deploys
  `main` automatically is open with the owner (Q-009 in
  `docs/questions-for-the-owner.md`). **Until answered, treat a push to
  `main` as the deploy.** No PR step for routine work. Nobody here has a
  Railway login: sessions can push to GitHub and load the public URL
  (`curl`, or the pre-installed Playwright Chromium), nothing more.
- **Other long-lived branches:** none. Each cloud session is also handed an
  auto-generated `claude/...` branch (next section); a session may leave
  it as a mirror of `main`, never as the only place work lives.
- **Credentials:** none are needed to build or run the game. Anything that
  later needs one (a database, an API key) is requested from the owner
  through the environment's secret form, never guessed, searched for or
  committed.

## This project's environment

*(What exists, so no session assumes infrastructure that isn't there.
Measured 2026-11-23; re-measure before relying on it.)*

- **Session tools: yes.** Sessions run in Claude Code Remote (environment
  "Curiosity Cloud") and have `create_session`, `list_sessions`,
  `get_session`, `create_trigger`, `fire_trigger`, `send_later`,
  `list_triggers`, `archive_session`. So the orchestrator launches leads
  and leads launch brief-workers; the owner launches nothing but a fresh
  orchestrator. The canonical spawn call is in `docs/lead-session.md`.
- **The account is shared with the owner's other projects.** `list_sessions`
  and `list_triggers` show their sessions and scheduled tasks too (RPGo,
  HappyHome and others). **Never message, archive, re-arm or delete
  anything that isn't Irreverents'**: filter by a session's repository or
  by ids recorded in this repo. The usage limit is shared as well, so a
  runaway fan-out here can stop every project (`docs/spawn-failures.md`,
  "A spend-limit stop").
- **GitHub tools: yes** (MCP `mcp__github__*`, scoped to this repository).
  No `gh` CLI. No pull requests unless the owner asks.
- **CI: none.** No `.github/` directory. Nothing runs on push except
  (possibly) Railway's own build.
- **Hooks: none.** No `.claude/` directory in the repository.
- **Network:** limited allowlist plus package registries (npm, PyPI). The
  deploy URL, the owner's Drive hosts and `kenney.nl` are allowed; most
  other sites are not. A blocked host is a question for the orchestrator,
  not something to work around.
- **In every container:** Node 22, npm 10, Python 3.13, Playwright with
  headless Chromium (`require('playwright')` works; never run
  `playwright install`).

## Auto-generated session branch names: don't trust them

Some session platforms (cloud Claude Code sessions among them) hand every
session its own pre-filled branch name in its instructions, auto-generated per
session — per-session isolation, not a per-feature branch, and there may be no
setting to turn it off. **Do not trust that name.** Before doing any work,
check the repository's actual state — `git ls-remote --heads origin` or the
remote's default branch — and develop and push on `main`
regardless of what a session's own metadata suggests. Don't create or push to
a second branch "to be safe."

A session's work isn't done until it has landed on `main`. An
auto-generated branch with no PR back into it is an orphaned dead end that
silently drops the work. In the project this system was derived from, this
happened once: the stray branch was abandoned unmerged, and later work had to
redo fixes already made on the real branch.

If your platform does not generate branch names, this section is a caveat to
keep in mind when you move to one that does.

## Local hooks that warn about "unpushed commits"

If your environment has a local stop-hook that checks the session's own
auto-generated branch for unpushed commits, **it will warn at the end of every
turn — expected, not a signal, and not project policy to work around.** It is
checking the per-session branch that real work is *supposed* to bypass, so it
fires by construction, every session. Once you have verified that your commits
landed on `main` — `git log` / `git ls-remote` against the real
branch, not the hook's complaint — **that's the end of it: don't explain,
justify, or mention the warning to the owner.** Narrating it is a waste of
tokens. If a push to the real branch is genuinely missing, that's a real
problem worth surfacing; the hook firing is not itself evidence of one.

## A container's local clone is not the remote

**`git branch -a` / `git fsck` output about *this container's own local clone*
is not evidence of a real divergent branch.** Always verify against
`git ls-remote --heads origin` before concluding anything is stray. The
local-only false alarms this setup has produced, all harmless:

1. **A stale per-session branch.** A session's auto-generated branch left as a
   local branch or remote-tracking ref after the session switched to the real
   one. Confirm with
   `git merge-base --is-ancestor <stray-branch> main` (exit 0 if
   fully merged), then delete locally with `git branch -d`; origin was never
   touched.
2. **A shallow clone.** It makes `git log --oneline | tail -1` and
   `git fsck --unreachable` misreport normal, fully merged ancestor history as
   "missing" or "dangling." Check `git rev-parse --is-shallow-repository`
   before treating either as a finding; `git fetch --unshallow` if unsure.
3. **Routine stash and rebase debris.** `git stash` / `git rebase` cycles —
   the recommended pre-push routine when several sessions push concurrently —
   leave dangling `WIP on ...` and pre-rebase commits in `git fsck` output.
   Expected byproducts, not lost work.
4. **A stale "up to date."** `git status` compares against the cached
   remote-tracking ref from whenever the clone was made or last fetched, not
   a live remote. A container cloned before a commit landed reports "clean
   and up to date" while missing everything pushed since — including, once,
   the very brief a session had been launched to run. **Fetch before you
   conclude a file doesn't exist.**

## Pushing when other sessions push too

Fetch and rebase immediately before you push: `git fetch origin
main && git rebase origin/main`, rebuild and
re-run the checks your change needs, then push. A push rejected as
non-fast-forward means someone landed first; it is not an error to force past.
Re-read any file that changed under you — a brief you are running may have
been amended mid-flight.

## Local-only repository

A repository with no remote yet (`git remote -v` prints nothing) runs
**single-lead**: one lead at a time, so `docs/plan.md`'s claim race can't
happen and its push / rejected-push steps are skipped. Every "verify the
push landed" check in these docs is skipped too: commit locally, and say
in your report that nothing was pushed. Once the owner adds a remote, the
normal rules apply from the next commit.

## What never to do without the owner

If you find a commit that is genuinely **not** an ancestor of
`main` and isn't one of the patterns above, stop and surface it
with what you found before assuming it is safe to discard. **Never delete
anything on the actual remote** — a branch, a tag, a ref — and never
force-push, without the owner's explicit authorization, the same as any other
destructive action on shared state.
