# Git workflow, and the false alarms it produces

**Standing.** Run per `docs/sop.md`.

`CLAUDE.md` carries the rule. This file carries the reasoning and the
local-only false alarms a cloud-container setup keeps generating, so nobody
re-derives them.

---

## The branch

All {{PROJECT_NAME}} work goes on **`main`**. Fill in, here, the
facts a session needs and must not guess:

- Is `main` the repository's default branch?
- Does a push to it deploy (to `{{DEPLOY_TARGET}}`)? If so, **a push is the
  deploy**, and no PR step exists for routine work. If not, say what the
  route to production is (PR and review, a release tag, a manual step).
- Are there any other long-lived branches, and what are they for? The default
  answer this system was built around is: none.
- Where production lives, if a session ever needs to reach it, and how
  credentials for it are obtained — from whoever holds them, never guessed or
  searched for in the filesystem or environment.

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
