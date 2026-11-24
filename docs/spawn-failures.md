# Session-spawn failures

**Standing.** A durable, append-only record of session-spawn failures — a
rate or spend limit killing a launch, a launch that comes up with no
repository, task or context attached, anything else in that shape. Written by
whoever hits one, the moment they recover from it; read by any orchestrator or
lead as part of normal Record discipline.

**This file only applies if your environment lets sessions start other
sessions** — for example the Claude Code Remote tools (`create_session`,
`create_trigger`, `send_later`, `get_session`, `list_sessions`). If it
doesn't, the owner starts each session by hand, and a failed start is
recorded here the same way.

---

## Why this file exists

Spawn failures are easy to fix ad hoc and forget: whoever notices relaunches,
and nothing tracks whether it was a fluke or a real, worsening pattern — which
matters more as the orchestrator's charter pushes toward more concurrent,
self-scheduled sessions. This file exists so the *next* spawn failure gets
logged where an orchestrator or lead actually checks, so a pattern, if one
exists, has data behind it instead of anecdote.

## What goes here, and what doesn't

**Write here:** a session that failed *to start* — a rate or spend limit, a
launch with no repository/task/context attached, a spawn call that errors
outright, a start in the wrong directory, a spawn chain that ran out of depth,
anything in that shape.

**Don't write here:** a session that started fine and then failed at its task.
That's ordinary work going wrong — it belongs wherever that work's own failure
belongs (a brief's review notes, `docs/for-the-lead.md`,
`docs/for-the-orchestrator.md`, or `docs/process-observations.md`).

---

## Lessons carried over from the project this system was derived from

Each came from one or more real incidents. They are written for the Claude
Code Remote tools; translate them if your spawning mechanism differs, and
check them against your platform's current behaviour rather than trusting
them blindly — platforms change.

- **Pass the repository explicitly on every spawn.** A child spawned with only
  a prompt and a title came up with no repository attached, and could not
  attach one itself. Don't rely on environment inheritance: pass the source
  URL (and the revision, for a non-default branch) every time a child needs to
  work in a specific repository.
- **Spell the repository URL exactly as the remote does.** A lowercase
  spelling of a repository that had been renamed was a suspect in a child
  finding its branch far out of step with the remote. Use the canonical
  spelling the remote reports.
- **Make sure the child starts inside a fresh checkout.** A spawn that reused
  a cached image started outside the repository, with a days-old checkout and
  no auto-loaded `CLAUDE.md` or repository hooks. Passing an explicit clone
  option (a clone depth) forced a fresh clone. Check a new child's working
  directory and `CLAUDE.md` before trusting it.
- **"Brief not found" may be a stale clone, not a missing file.** A child
  reported its brief missing while the file existed on the branch; a later
  attempt found `git status` reporting a stale "up to date" against a cached
  remote-tracking ref. Fetch before concluding a file doesn't exist, and push
  the brief before spawning the session that runs it.
- **Know the "never dispatched" signature.** A session sitting pending well
  past normal start time, with no usage recorded at all and its last update
  seconds after creation, never got a container — distinguishable from one
  that is merely slow. A spend or rate limit at launch was the leading
  suspect, but an already-running parent often stayed allowed while new
  dispatches failed, so record which shape you saw rather than assuming.
- **Arm a short "did it start" backstop on every spawn.** Scheduled check-ins,
  not a live watcher, caught every one of these. A check 10 minutes out
  catches a failed start; a long backstop alone leaves a dead child unnoticed
  for an hour.
- **A backstop on a session that is itself down just queues.** When a limit
  stops parent and child together, the parent's check-in waits until
  something else wakes it. Confirm a scheduled wake actually appears in the
  scheduled-task list before ending the turn.
- **Docs carry state, sessions don't.** Recovery is: confirm with `git log`
  what (if anything) landed, archive the dead session, relaunch fresh against
  the same, already-pushed brief. Never try to "resume" a session that has
  nothing to resume.
- **Re-firing an old scheduled task can start a new session.** A second fire
  of a task aimed at a busy session spawned a fresh, repository-less session
  instead of delivering. Use a fresh scheduled task per message, and check
  that the result's session id matches the target.
- **A message is not a task.** A second brief handed to a running worker by
  `send_message` was correctly refused — a message from another session is
  not the user's instruction. A new brief goes to a new session through its
  spawn prompt; `send_message` carries information, not work.
  **2026-11-23 ~15:40 UTC: no longer the default; this is now the fallback.**
  The owner asked for reused builders ("Implement the structural changes
  you recommended for efficiency"; `docs/decisions-log.md`, "Two layers,
  reused builders…"), so the orchestrator sends a builder its next brief by
  message. What makes that work and not a peer's say-so: the task is the
  brief file on `main`, written by the orchestrator under the owner's
  standing permission (`CLAUDE.md`, "Git: one branch"), and the message
  only names it; the builder pulls and re-reads the file
  (`docs/roles/builder-card.md`, "7 · Report, then wait"). A message that
  asks for work no brief file holds is still information only. A builder
  that refuses gets a fresh spawn on the same brief and an entry here.
  Measured so far: two Step 8 round-2 builders each pushed a second lane
  (`session_017WiGzGaGuR297NUCFSpVDU`: frame 06180df, then actors 646f83d;
  `session_017WiGzHanC1tecHKJbjuyCf`: ground ec49eb5, then props 70299ee),
  but whether the second came by message or in the spawn prompt was not
  recorded, so the step file's "Briefs" line now says which. `DRAFT:`
- **Spawn chains have a depth limit.** When orchestrators each spawn their own
  successor, depth accumulates until leads can no longer spawn workers or
  workers can't wake their leads. An orchestrator started by the owner resets
  the chain; measure depth by parent links when a spawn is refused for depth.
- **Persistence sometimes works, but say so.** A blind retry is a
  low-confidence move, not a fix. After the same slice fails to start the same
  way repeatedly, it's a finding for the orchestrator or owner, not a fourth
  retry.

---

## Entries

One entry per incident, appended, never edited or deleted by whoever wrote it.
Later readers may add a `**Disposition:**` line underneath.

```markdown
### <date>, <who hit it — orchestrator, lead, or element name>

**What happened:** <the failure, plainly — a rate limit, an empty
launch, a spawn call that errored, something else>

**How caught:** <what surfaced it — an error message, a session that
never replied, a manual check>

**Recovery:** <what fixed it this time — a relaunch, a wait, nothing
needed>
```

### 2026-11-24, Step 22 builder (`session_017WiGzHD6TvY2XxEG4B3rJU`)

**What happened:** spawned with `blob_limit_kb: 150`, the checkout left
`docs/decisions-log.md` (174 KB) out as a skip-worktree file: not on disk at
all, so opening it said "No such file", rather than git fetching it on open
as `docs/lead-session.md` says. Every builder must append to that file.

**How caught:** `ls docs/decisions-log.md` failed; `git ls-files -t` shows
`S` for it (and for some screenshots under `docs/plan/`).

**Recovery:** `git update-index --no-skip-worktree docs/decisions-log.md &&
git checkout -- docs/decisions-log.md` (fetches it). A lower-cost fix for
everyone: keep that file under 150 KB (archive old entries) or say this
command in the builder card.

---

## The obligation

**Check this file when deciding whether spawn failures are a rare fluke or a
real pattern** — after every 2-3 new entries, not on a fixed schedule. If a
real, worsening pattern shows up (the same failure shape repeating, frequency
climbing, correlating with something specific like concurrent-session count),
that is a finding for `docs/for-the-orchestrator.md`, not something to keep
quietly working around. When a lesson above is confirmed or contradicted by a
new entry, update the lesson, and say which entry did it.
