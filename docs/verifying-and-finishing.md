# Verifying a change, and finishing a session

**Standing — SOP phase 7.** Reached from `docs/roles/builder-card.md`, section 6
(or by running `docs/sop.md`, phases 1-6 first); this file is the reference the
card points into.

Whatever your project's safety net is — a test suite, a staging environment,
a review gate, or nothing at all — this file is where it is written down, and
where the checks a session runs on its own work live. **If nothing stands
between a push and production, then the only thing standing between a change
and its users is whatever you check yourself.** Say which kind of project this
is in the section below, so no session has to guess.

Every command in this file should have been run end to end by someone, and the
section should say when. A command nobody has run is a guess written in a code
block.

---

## This project's setup

**Status, 2026-11-23: every command below is real.** build, check,
gates, start and dev were run end to end from a fresh clone at 04:17 UTC
(Step 1 Gate 1); `e2e` and `check:live` with the Gate 2 push (Step 1 Gate 2), Node v22.23.5.

- **From a fresh container:** `npm ci` (under 1 s here), then
  `npm run build` (under 1 s), then `npm start`; stop it with Ctrl-C, or
  by the pid you recorded when starting it in the background
  (`node dist/server.cjs & echo $! > server.pid`, then
  `kill $(cat server.pid)`). Start `node dist/server.cjs` directly when
  you need the pid: `npm start &` gives you npm's pid, not the server's.
- **Build:** `npm run build` writes `dist/server.cjs` (the server, bundled
  with `ws`) and `dist/public/` (`index.html`, `game.js`). It validates
  `content/` first and exits 1, building nothing, if anything is wrong.
  The built server needs no `node_modules` (run with them deleted).
- **Static checks:** `npm run check` (about 6 seconds): type-checking
  twice (everything, then the pure layers with no DOM or Node types), the
  layer rule, content validation, every scenario in `scenarios/`, each
  run twice for determinism, and the scripted checks in `scripts/checks/`
  (two headless players against a server on a free local port, and
  the built `dist/server.cjs` started as its own process; it builds
  first when `dist/` is stale). No browser, nothing outside the machine. Exit 1 on any
  failure, naming the file and field or the scenario's broken fact.
- **Build gates:** `npm run gates` prints one line per gate A–F and the
  count (`docs/measures.md`, M3). F passes by the scripted check
  `together`.
- **Develop:** `npm run dev` builds, serves on `PORT` (default 3000) and
  rebuilds and restarts when `src/` or `content/` changes. *Started once
  by hand; not otherwise exercised.*
- **The real page, two players:** `npm run e2e` (about 100 s, 75 of them
  a deliberate outage; it builds first): headless Chromium against the built server on a free port, a
  desktop page driven by keys and Playwright's `iPhone 14 landscape`
  driven by touch. One fact per line, exit 1 on any failure, screenshots
  in `e2e-out/` (git-ignored): **open them**, that is rung 5. What each
  fact reads and the controls watched: `docs/mechanisms/network.md`.
- **The live site:** `npm run check:live`: `check:deployed` first, then
  the same two-player walk (facts a–c, e, rate) against the live address
  in a private world of its own. Which commit is live:
  `curl -s https://irreverents-production.up.railway.app/healthz`.
- **What "it started" looks like:** the line `irreverents listening on
  0.0.0.0:<port> commit=<sha or unknown>`; `GET /healthz` returns
  `{"ok":true,"commit":…,"startedAt":…}`; `GET /` returns the page (200);
  a WebSocket to `/ws` answers a `join` message with `{"t":"welcome",…}`
  (`docs/mechanisms/network.md`); `/healthz` also says `players` (connected
  to the world everyone shares: **look before pushing code**), `worlds`
  and `playersEverywhere`.
- **Looking at the page:** Playwright and Chromium are preinstalled
  (`NODE_PATH=/opt/node-tools/node_modules`, `require('playwright')`;
  never run `playwright install`). The page exposes `window.irreverents`
  for scripted reads; its `drawn` is what the page put on screen that
  frame (`docs/mechanisms/network.md`).
- **Where it deploys:** Railway, at
  https://irreverents-production.up.railway.app. **A push to `main` is the
  deploy**, automatically, with no staging (the owner, 2026-11-23: "It's
  setup to deploy automatically from main yes."). Railway runs
  `npm run build` then `npm start`. Measured: 25 to 80 s from push to
  live. Only pushes touching the paths in `railway.json` deploy. Nobody here can see Railway's logs; the live address is the only
  evidence.
- **Is there a test suite?** The scenarios (`docs/mechanisms/scenarios.md`):
  3 today, covering running, jumping onto a one-way platform, walls and
  two players in one room. They check the simulation, not the page; `npm run e2e` checks what
  the page draws.
- **CI:** none, by absence, not by decision. Nothing checks a push before
  or after it deploys.

**The pre-push gate, because a push goes live:** `npm run build && npm run
check`, plus `npm run e2e` when the client or the network changed. Then `git fetch origin main && git
rebase origin/main`, re-run the gate if anything but documents came in,
push, then `npm run check:deployed` (it waits up to three minutes through
the deploy gap and exits 0 once the live address runs what `main` needs).
**A code push takes the live address down for about a minute** (Railway
stops the old server before starting the new one, now that a storage
volume is attached): it answers Railway's own "Application not found"
meanwhile, which is not a failed deploy. The running commit need not be
yours: a later push by someone else reads as fine. If `check:deployed`
fails after its wait, the previous deploy is still serving or the game
is down: revert first, tell your lead, diagnose after. **A push that
changes only documents does not deploy** and does not need this
(`docs/mechanisms/deploy.md`).

---

## The verification ladder

Climb only as far as your change requires — but **at least one rung above
"it compiles."** The rungs are generic; the commands for each belong in the
section above, or next to the rung once your project has them.

### 1. It compiles
```bash
npm run build
```
Catches type and syntax errors. Catches nothing about behaviour. This is the
floor, not a verification.

### 2. The static checks pass
```bash
npm run check
```
The single highest-value check for any change to data, configuration or
content the project loads — it needs no running system and no secrets. A good
validator is stricter than it looks: it should name the exact broken
reference, not just fail. Each check in it should carry a comment saying which
real escape it would have caught.

**If you changed something a static check covers and didn't run it, you
haven't checked your work.**

### 3. It behaves — drive the real thing

Exercise the change through the same interface a user does: the HTTP API with
`curl`, the CLI with real arguments, the library through a real caller. Keep
whatever session state the system uses (a cookie jar, a token, a working
directory) across calls, or you are a new user each time.

**Prove your check can fail.** A check that passes tells you nothing until you
have watched it fail — the cheapest way is a **failing control**: run the same
check against the code from *before* your change.

```bash
git checkout <sha-before-your-change> -- <the file you changed>
npm run build && <re-run your check>     # must FAIL — if it passes, the check is empty
git checkout HEAD -- <the file you changed>
npm run build
```

A check once passed on the shipped code *and* on the pre-change code, because
its assertion was too loose to notice the difference. Nothing about the
passing run said so; the control is what caught it.

**Proving a change is invisible is a different job from proving it works.**
When a change is meant to alter *nothing* a user sees — new plumbing, a
refactor, an addition beside existing code — the check is a **transcript
diff**: run the same walk before and after and confirm the outputs are
byte-identical.

```bash
# ...run the walk, redirecting each response to a file, before and after...
diff before.txt after.txt      # any output at all is a behaviour change
```

Reading the diff of your own code tells you what you *meant* to change. This
tells you what you *did*.

**Assert through the path the real client uses.** A check through a route,
command or function the real client never calls proves nothing about real
use. Before trusting an assertion, confirm the client actually calls what it
reads; if not, assert through what it does call, and say so.

### 4. It behaves for *two* users

Anything touching shared state — a record several users can change, a
counter, a claim, a lock — needs **two independent sessions** at once. Most
real concurrency bugs only appear with two, and one session will never show
them to you.

Once a project has shared state, make this rung repeatable: a script that
drives several sessions at once, each with a failing control built in,
printing one fact per line. It is the only form of this check a fresh session
can re-run without re-deriving your walk.

**A race usually hides behind one round trip, so two parallel requests almost
never hit it.** Make the window deterministic: delay the slow step on purpose
(a temporary sleep in a database trigger, a held lock on a separate
connection, a paused second process), and remove the delay in a `finally`.
Note that a delay holding the very lock the race needs will serialise it
instead of exposing it — hold the write in a separate process for that case.

### 5. If it touches what a user sees, it has to actually be looked at

Every rung above proves the server or the logic returns the right thing,
never that the screen shows it. Two failure shapes have shipped exactly this
way, each with every earlier rung passing:

- **Unstyled.** A new element copied its siblings' naming convention but no
  styling rule was ever added for it, so it rendered as a plain default
  control in a styled page. "Verified live" in that change's commit meant an
  API walk, never a screenshot.
- **Silently dropped.** A new field was correct, sent by the server, and never
  read by the client at all. The mechanic was driven end to end through the
  API and passed; the user simply never saw it, for several changes in a row,
  until the owner used it and asked why it looked wrong. The change's own
  report had named the gap ("nobody has looked at it in a browser yet... not
  urgent"), and because "not urgent" isn't a status any checklist tracked, the
  flag went into a chat report and nowhere else.

**Checks, because any one alone would have missed one of these:**

1. **Mechanical — every new id, class or style hook has a rule, or a reason it
   doesn't need one.** Grep the diff for new identifiers and grep the
   stylesheet for each.
2. **Mechanical — every new field on a response the client consumes has a
   confirmed read site in the client**, or a one-line reason it is not
   consumed yet. A field with no read and no reason is the second bug above.
3. **Visual — render it and put it next to the sibling it's supposed to
   match.** A headless browser and a screenshot, read back as an image. Does
   the new element match the one above and below it, or does it read as an
   unstyled thing dropped into a styled page? That comparison is the actual
   gate, not "does it render at all."
4. **Text existing in a file is not the same as the parser accepting it.** A
   comment closed early, a typo in a selector, can corrupt everything after
   it while the file still looks normal to grep. When a rule is present but
   the screenshot still shows it unapplied, confirm in the live page that the
   rule exists, before suspecting caching or specificity.
5. **A flagged rung-5 gap is a blocking item, not a footnote.** "No browser
   available this round" is not the same status as rung 5 passing. Either run
   it before closing, or carry it forward as a live, named item
   (`docs/for-the-lead.md` / `docs/for-the-orchestrator.md`, or the notes
   file your brief names; not a chat report) until someone does.

Skip this rung only when your diff touches nothing a user sees.

---

## Traps that will fool you

**Every project has its own; write yours here as you find them, one bullet
each, with the shape of the trap and how to see through it.** Generic traps,
and the kinds of project-specific ones worth documenting:

- **Features that fake themselves without their keys.** A feature that calls
  an external service (an AI model, a payment provider, a mail sender) may
  return a plausible fallback with no error and no log line when its key is
  missing. You can "verify" a change that way and have tested **nothing**. If
  your project has one, name it here, name the fallback text, and say: set a
  key or don't claim it works.
- **`npm run check` passing says nothing about the screen.** The
  scenarios drive the simulation headlessly; a broken page or renderer
  passes them. Anything a player sees still needs rung 5.
- **Generated registries.** `index.gen.ts` files are written by build,
  check, gates, trace and dev and are git-ignored. Running `tsc` or a
  script by hand in a fresh clone before any of those fails on a missing
  `index.gen.ts`: run `npm run check` once first.
- **Content is baked in at build time.** Editing `content/` changes
  nothing in a running server until `npm run build` and a restart
  (`npm run dev` does both).
- **Every deploy drops the players for a moment and resets the world.**
  With the storage volume attached the address answers Railway's own 404
  for a few seconds to a minute during a deploy. Batch code pushes; do
  not push code "to see".
- **A push is a deploy.** Pushing code to `main` ships to the owner and
  their friends within about a minute. **There is no "push it to see."** A push
  whose build fails on Railway is invisible from here except that
  `/healthz` keeps reporting the old commit.
- **A new top-level folder does not deploy until it is listed.** Only
  pushes touching the paths in `railway.json` go live (`src/`,
  `content/`, `scripts/`, `assets/` and the package and config files). If
  the game needs a new top-level folder at build or run time, add it to
  `railway.json` **and** `scripts/lib/deploy-paths.ts` in the same push,
  or your change silently never reaches the live game
  (`docs/mechanisms/deploy.md`). A push that only changes `scenarios/` or
  documents does not restart the game, on purpose.
- **Caches survive your edit.** Anything loaded once at boot (configuration,
  data cached in memory, files read on first use) ignores your edit until a
  restart. List what your system caches.
- **A local system hides races.** With no network latency, one request
  finishes before the next starts, so overlapping-request bugs can't show up.
  When the bug might be concurrency, add artificial latency to every request
  before trusting a pass.
- **A failed build can still leave a runnable artifact.** Some compilers emit
  output even when they exit non-zero, and the start command runs the output,
  not your source. Check the exit code (`echo $?`), not the scrollback.
- **Stop servers by pidfile, never by pattern-kill.** A pattern like
  `pkill -f "<server command>"` can match the shell running it and kill your
  own tool call, while the old server keeps its port and every "rerun" tests
  the previous build. Have start/stop scripts that track the pid and confirm a
  fresh boot (a health endpoint reporting its boot time is ideal).
- **State left by an earlier run fails a check on state, not code.** If a
  scenario depends on a clean starting state, reset it between runs and say
  how here.
- **Periodic refreshes hide lost writes.** A client that polls can show a
  write as succeeded and then quietly revert it. Check the store, not the
  screen.
- **A failing control that edits `content/` leaves `dist/` built from
  the broken content.** `npm run check` rebuilds when `dist/` is stale;
  restoring the file does not. Run `npm run build` after restoring a
  control and before looking at any page (Step 4 slice 3 looked at a
  villain whose polite purchase troubled nobody for a minute).
- **"The code looks right" is not a verification.** It is the thing that was
  true every previous time something shipped broken.

---

## Reversing it

Know the shape of getting back before you need it. Fill in this project's
answer: if a push is the deploy, `git revert` is the rollback —

```bash
git revert <sha> && git push origin main
```

— and `Railway` redeploys from the branch. Say whether there is
staging, feature flags, or anything else between a push and users.

**The asymmetry that matters: code reverts, persisted state doesn't.** A
reverted commit that added a database column, a file format or a stored
record leaves it behind. That is harmless *only if* such changes are additive
— which is why an additive-only habit is load-bearing rather than stylistic. A
destructive migration is not recoverable by revert, so don't write one without
a plan for getting back.

**Don't rename or remove persisted identifiers is the reversibility rule in
disguise.** Stored records keyed by an id are orphaned when the id goes, and
no revert brings them back into meaning. Additive changes are reversible;
subtractive ones frequently are not.

**Before shipping anything substantial, be able to say how it gets undone.**
Usually the honest answer is "revert the commit, nothing persists." When it
*isn't*, you have found the risky part of your change — worth knowing before
you push rather than after.

---

## Definition of done

A session is not finished until all of these are true.

**The change**
- [ ] `npm run build` passes — by exit code, not by scrollback.
- [ ] `npm run check` pass. If a check keeps a baseline of known
      exceptions, a **stale baseline entry** is yours too: a known gap got
      fixed and the exception was left behind to hide the next one.
- [ ] Any docs checker passes, if you touched docs. If the project has one
      and it only runs after the push, it belongs on this list, not in your
      memory.
- [ ] The change was actually *exercised* — at least rung 3, rung 4 if it
      touches shared state, rung 5 if it touches what a user sees. **Driving
      the logic through the API is not rung 5.** An acknowledged rung-5 skip
      means this box is unchecked, not checked-with-a-caveat; carry it forward
      as a live item instead.
- [ ] **You can say how this gets reversed** in one sentence — and if the
      answer isn't "revert the commit," you have found the risky part.
- [ ] **The measure:** you can name the row of `docs/plan.md`'s measure table
      this moved, and which way (commands in `docs/measures.md`). Moving
      nothing is a fine answer for a bug fix. Choosing code where data or
      configuration would have done is allowed — but say so in the commit.

**The record**
- [ ] Every row of `docs/sop.md` phase 6 that this change triggered is filled.
      That table is canonical; it is not repeated here.

**The landing**
- [ ] Committed with a message explaining *why*, not what — the diff already
      says what.
- [ ] Pushed to `main`, verified with
      `git ls-remote --heads origin` (`docs/git-workflow.md`). Work that lands
      elsewhere can be silently dropped.
- [ ] **If the push is the deploy, remember it.** If you would not want it
      live in the next two minutes, don't push it yet.

**The honest report — in the commit message, not a chat reply to the owner.**
The owner may delete an executing session's chat once its brief ships, so the
commit is the durable copy the lead actually reads at review — a chat report
duplicates it at best and is the only copy at worst.
- [ ] Say what you verified and how. "It builds and I drove the change
      through the real interface" and "it compiles" are different claims, and
      only one of them is worth anything.
- [ ] Say what you *didn't* verify, and why. An unverified change that says so
      is useful; an unverified change presented as done is a trap for the next
      session.
- [ ] Anything that doesn't fit a commit message: a question for the owner
      goes to `docs/questions-inbox.md`; a flag or a "worth noting"
      goes to `docs/for-the-lead.md` (or your brief's notes file, or with no
      lead `docs/for-the-orchestrator.md`), per `docs/sop.md` phase 4. Not
      only into your final message or report either way.
- [ ] **Your actual final chat message is a short confirmation, nothing
      more** — done or blocked, the commit, a pointer to `docs/for-the-lead.md`
      if you wrote there. Not a narrated version of the bullets above. Nobody
      reads it, and carrying it in your own context is itself a reason
      sessions drift from the SOP (`docs/sop.md` phase 4).
