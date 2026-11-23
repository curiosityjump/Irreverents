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

### Vision · Deploys while the owner isn't playing
- **Answer:** "Don't worry. I'n not playing that shit right now. Redeploy all you want" (owner to Vision Partner, first-hand, 2026-11-23 ~11:40 UTC)
- **Recorded in:** this entry (process, not vision)
- **Action for:** orchestrator (process): the "hold pushes while the owner is playing" caution does not apply right now; push and redeploy freely until the owner says they are playing again.

