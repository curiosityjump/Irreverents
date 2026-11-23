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

### Vision · Start screen and saved games (new frontier)
- **Answer:** "The game needs a start screen where players can start a new game, continue, join the same game, etc. If I hav ea saved game, i should be able to load it and have a friend join me in my saved game." (the owner, first-hand, ~15:10 UTC)
- **Recorded in:** `docs/vision.md` "Frontiers" → "Start screen and saved games"
- **Action for:** orchestrator (vision-level): no plan step covers this yet. It needs a start screen (new game, continue, join) and saves that persist (the Railway volume at `/data`, Step 7's store) and can be loaded with a friend joining. Settles part of library O-004.

