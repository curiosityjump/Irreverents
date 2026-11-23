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

### Vision · Principles: "looking at the game, looking at the vision, seeing the gaps, and closing them"
- **Answer:** "I put a lot of work into getting all the vision documentation laid out for you guys. I don't want to repeat all that. You are capable of looking at the game, looking at the vision, seeing the gaps, and closing them" (the owner, first-hand, ~14:50 UTC, after noticing levels, enemies and the cantina missing and asking whether anyone audits the game against Kirby and the other inspirations).
- **Recorded in:** `docs/vision.md` "Principles that decide most questions", under the build-first principle
- **Action for:** orchestrator (process, vision-level): make it routine, and cheap per the build-first principle, to compare the live game (screenshots and play, phone size) with `docs/vision.md`, the design library and the named inspirations, rank the biggest gaps, and drive the plan from that list. The owner should not be the one finding omissions. Today's known gaps raised by the owner: levels, enemies, cantina; look; feel.

