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

*(empty)*

### Vision · NPC response (escalating guard response now)
- **Answer:** "I want the escalating guard response implemented now" (relayed by the orchestrator, first-hand to it), quoted; tier count and contents left to the owner as Q-019, with the brief's five levels as the recommendation.
- **Recorded in:** `docs/vision.md` "NPC response: three modes, signals, pursuit", this commit
- **Action for:** orchestrator (vision-level): none beyond the brief already running
