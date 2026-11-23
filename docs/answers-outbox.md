# Answers outbox

**Standing.** Owner answers waiting to be acted on. Keep it lean. Vision
Partner (`docs/vision-partner-role.md`) appends an entry the moment it
records an answer or makes a vision edit. The orchestrator reads this
file on every doorbell and check-in, acts on each entry (opens or reopens
a plan step, routes it to the lead that owns it, makes the process edit),
then **cuts** the entry and appends a receipt to `docs/answers-archive.md`.
A lead reads entries naming its step every round; only the orchestrator
removes them.

These are the owner's own words, recorded first-hand by Vision Partner and
quoted in the governing file: act on them as a lead acts on a plan step,
with no second confirmation.

## Format

```markdown
### Q-NNN · <title>
- **Answer:** <the owner's words, short, or "yes" = the recommendation, restated>
- **Recorded in:** <file> "<section>", <commit>
- **Action for:** <Step N / its lead `<session id>` / orchestrator (process) / orchestrator (vision-level) / none>
```

A vision edit with no question behind it uses `### Vision · <section
changed>` as its heading. The first one in a new project is the genesis
entry: "first vision written; no plan exists yet", naming the sections.

## Entries

### Vision · The long-term direction (deploy target)
- **Answer:** "This is the url railway will deploy everything to, where the game will be playable: irreverents-production.up.railway.app … Make sure you can access it so the claude dev team can test things better from the player perspective"
- **Recorded in:** `docs/vision.md` "The long-term direction"
- **Action for:** orchestrator (process): fill `CLAUDE.md`'s `{{DEPLOY_TARGET}}` with Railway at that URL, and find out from the owner whether a push to `main` is the deploy. As of 2026-11-23 the URL answers Railway's 404 "Application not found" (nothing deployed yet); the "Curiosity Cloud" environment allows the host, so `curl` and the pre-installed Playwright Chromium can both load it for player-view testing.
