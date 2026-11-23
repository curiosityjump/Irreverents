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

### Owner feedback · "a bunch of stuff I haven't seen yet" (levels, enemies, the cantina)
- **Answer:** "I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet" (the owner, first-hand, ~14:30 UTC). Not an answer to Q-010 (still open), and no reorder was asked for.
- **Recorded in:** `docs/current-directive.md` "Current directive", above "Owed next"
- **Action for:** orchestrator (process): decide whether breadth (Steps 3/14/15 more rooms, enemies as in the N03 grunt/brute request, Step 11 cantina) runs beside Step 8's look rather than behind it, and tell the owner through the directive.

