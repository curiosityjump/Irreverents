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

### Vision · Music and sound (new frontier)
- **Answer:** "Something that was not in any of the google drive stuff was music. I think you can figure out what the music and sound effects should be like from what's in there though. Do it."
- **Recorded in:** `docs/audio-design.md` "Where this comes from"; linked from `docs/vision.md` "Frontiers"
- **Action for:** orchestrator (vision-level): audio is in scope tonight. `docs/audio-design.md` is the direction (Vision Partner's reading of the library, owner-delegated). Requests A01-01 (SFX) and A02-01 (layered music) are filed with ChatGPT; build with Web Audio synthesised placeholders, unlock audio on first tap (iPhone), and swap files in when they land.

