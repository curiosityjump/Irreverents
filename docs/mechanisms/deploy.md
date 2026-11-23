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

- **`railway.json`** (Railway's config-as-code file).
  `build.watchPatterns` is `**` minus `docs/**`, `handoff-prompts/**`,
  `tools/**` and any `*.md`: a push that changes only those is not
  deployed. `deploy.healthcheckPath` is `/healthz`, so a build that does
  not start never replaces the running one.
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

## Traps

- **A wrong watch pattern can stop every deploy silently.** After any
  change to `railway.json`, push a code change and confirm `/healthz`
  reports it within five minutes; if not, remove the file, push, confirm
  deploys work again.
- **A new top-level path is watched by default** (the patterns exclude,
  they do not list). That is deliberate: forgetting to list a path must
  never mean code silently not going live.
- **`*.md` anywhere is ignored**, so the running game must never read a
  Markdown file.
- **Railway's own documentation could not be opened from a session**
  (its hosts are outside the sandbox's network; 2026-11-23). The key
  names come from a web search's summary of that documentation, which
  also said config-as-code files are deprecated in favour of a newer
  "infrastructure as code" format and stop working for older services on
  2026-12-01. So the proof below is the evidence, not the documentation,
  and it needs re-running if deploy behaviour ever looks different.

## Proof

*(Filled in by the session that last proved it; see the end of this file.)*
