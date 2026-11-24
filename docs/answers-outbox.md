# Answers outbox

**Standing.** Owner answers waiting to be acted on. Keep it lean. Vision
Partner (`docs/vision-partner-role.md`) appends an entry the moment it
records an answer or makes a vision edit. The orchestrator reads this
file on every doorbell and check-in, acts on each entry (opens or reopens
a plan step, routes it to the lead that owns it, makes the process edit),
then **deletes** the entry; the commit message names what was done (git
log is the record: receipts in `docs/answers-archive.md` are retired from
2026-11-23).
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

### Vision · World structure, secrets and completion (one-way platforms)
- **Answer:** the owner's words on getting stuck in the quarry ("Not a bad thing l, just needs accounted for"), quoted with Vision Partner's reading: keep jump-up-through platforms, no dead ends. Relayed by the orchestrator, so the reading is labelled unconfirmed; Q-017 and Q-018 (which hero and where; what the menu did) filed for when he talks to Vision Partner.
- **Recorded in:** `docs/vision.md` "World structure, secrets and completion", this commit
- **Action for:** orchestrator (vision-level): the plan can carry "every one-way platform has a way back" as a check
