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

### Vision · "I want to play it as I described it" (the measure, after playing)
- **Answer:** "Remember the original intentions for the game and make sure things align with it. I want to play it as I described it. There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all" (the owner, first-hand, ~18:30 UTC)
- **Recorded in:** `docs/vision.md` "The measure", above "Principles"
- **Action for:** orchestrator (vision-level, top priority): re-plan around the core loops the owner names, each playable start to payoff on a phone and findable without being told: heist/stealth infiltration, puzzles, hidden places, unlockable characters, escalating combat and chases (wanted levels, reinforcements), stealing powers/items, vehicle hijacking, real risk. What exists only as a script doesn't count. Use the library (docs 02, 05–09, 21–31) as the spec, not new invention.

