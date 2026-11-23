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

### Vision · Principles: "as much as possible into actually building the game"
- **Answer:** "I want as much as possible to go into actually building the game. The structure is just meant to prevent wasteful work drifting from the vision or stepping on eachothers toes, fixing things that arent broken, etc. if things can be done more efficiently to get much more resukts for less tokens, the team has full license to do that" (the owner, first-hand, ~14:40 UTC, after hearing that most usage went on coordination: about 45 sessions today, the first orchestrator's 683k context and $140, two stops on the account's five-hour limit, and about 545 document changes against about 300 code/content changes).
- **Recorded in:** `docs/vision.md` "Principles that decide most questions" (new principle, above "Frontiers")
- **Action for:** orchestrator (process, vision-level): full licence to cut process overhead for more visible game per token: fewer, longer-lived builders, less paperwork, smaller orchestrator contexts, whatever works. Keep only what prevents drift from the vision, collisions or fixing what isn't broken. The Industrial Engineer role is the natural place to make the cuts if one is running.

