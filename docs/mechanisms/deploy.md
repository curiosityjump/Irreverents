# Deploying: what restarts the live game, and how to tell what is live

**Reference.** Open before touching `railway.json`,
`scripts/lib/deploy-paths.ts`, `scripts/check-deployed.ts`, or
`/healthz` in `src/server/main.ts`.

## Why it exists

Every push to `main` used to rebuild and restart the server, documents
included, and the team pushes documents every few minutes. A restart drops
whoever is playing and resets the world (`docs/plan/step-1.md`, "What's
decided"). Nobody can read Railway's logs, so the live address is the only
evidence of what happened.

## The pieces

- **`railway.json`** (Railway's config file). `build.watchPatterns`
  lists the paths whose changes deploy: `src/**`, `content/**`,
  `scripts/**`, `assets/**`, `package.json`, `package-lock.json`, the two
  `tsconfig` files and `railway.json` itself. A push that changes nothing
  on the list (documents, briefs, `tools/`, `scenarios/`) is not deployed
  and the game keeps running. `deploy.healthcheckPath` is `/healthz`.
- **`scripts/lib/deploy-paths.ts`** is the same list in code, used by
  `npm run check:deployed` (`docs/measures.md`, M1). **Change both
  together.**
- **`/healthz`** returns `ok`, `commit` (the commit *running*, which
  after a documents-only push is older than the tip of `main`),
  `startedAt` (moves only when the server restarts), and `storage`:
  `mounted` is true only for a real Railway volume (both of Railway's own
  variables set and the path on a different device than `/`);
  `variableSet` true with `mounted` false means a variable typed in by
  hand, which is not storage.
- **`npm run check:deployed`** exits 0 when the running commit is the tip
  of `main` or everything since it is off the list. It retries for up to
  three minutes, to wait through the deploy gap below.

## The deploy gap

A storage volume has been attached since 2026-11-23 04:22 UTC. With a
volume, Railway stops the old server before the new one answers, so
**every deploy has a gap in which the address returns Railway's own 404
"Application not found"** or nothing: about a minute when first seen
(04:22:57 to 04:24:11), a few seconds on later deploys. The world is in
memory, so every deploy also resets it. A check against the live address
must poll through the gap (three minutes) before calling a push red.

## Traps

- **A new top-level code path does not deploy until it is on the list.**
  If the running game ever needs a file outside the listed paths, add the
  path to `railway.json` *and* `scripts/lib/deploy-paths.ts` in the same
  push. The symptom of forgetting: `npm run check:deployed` says ok while
  the new files are not live. (The other form of the list, "everything
  except documents", would not have this trap; it could not be shown to
  work: see Proof.)
- **A wrong pattern can stop every deploy silently.** After any change to
  `railway.json`, push a code change and confirm `/healthz` reports it
  within three minutes; if not, remove the file, push, confirm deploys
  work again.
- **A change to the patterns may take one deploy to apply.** Seen once:
  documents pushed in the first seconds after a new `railway.json` went
  live were still deployed; later ones were not. Test with a documents
  push made a minute after the config's own deploy is live.
- **Whether the health check is honoured is not proven.** No build that
  fails to start has been pushed to find out, deliberately.
- **Railway's own documentation could not be opened from a session**
  (its hosts are outside the sandbox's network; 2026-11-23). The key
  names come from a web search's summary of that documentation, which
  also said config files of this kind are deprecated in favour of a newer
  "infrastructure as code" format and stop working for older services on
  2026-12-01. So the proof below is the evidence, not the documentation.
  **If documents-only pushes start restarting the game again, this is the
  first suspect**; the fallback is the service's "Watch Paths" setting in
  Railway's dashboard, which only the owner can change.

## Proof

Run by the Step 1 Gate 1 worker on 2026-11-23, times UTC, reading
`startedAt` and `commit` from the live `/healthz`.

- **First form, not shown to work.** `["**", "!docs/**",
  "!handoff-prompts/**", "!tools/**", "!*.md"]` went live in 1709e09 at
  04:25:31. Eight documents-only commits followed between 04:25:38 and
  04:26:32 and the server restarted at 04:26:55 reporting the last of
  them. Two more documents-only commits (04:27:01 and after) then did
  *not* restart it in the 90 seconds before the next test began. So
  either this form works after a one-deploy delay, or not at all; it was
  replaced before that could be settled.
- **Second form (the one in the file), documents do not restart.**
  fa825d4 went live at 04:29:08. A commit touching only
  `docs/for-the-lead.md` (b3a419e) was pushed at 04:29:29, and three more
  documents-only commits by other sessions by 04:31:53; at 04:32:03
  `/healthz` still reported `fa825d4` and `startedAt` 04:29:08.
- **Second form, code still deploys:** see the line the same session
  added below once its closing code push was live.
