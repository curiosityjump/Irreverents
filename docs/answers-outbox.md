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

### Vision · Visual direction (the owner's 11:11 UTC "blocky" verdict folded in)
- **Answer:** the owner, to the orchestrator: "Compare to kirby and the amazing mirror and don't stop working on it until it looks similar to that. There are assets provided and you have the ability to get more." Quoted under `docs/vision.md` "Visual direction", with framing that the designs stay original.
- **Recorded in:** `docs/vision.md` "Visual direction" (this commit); the source is `docs/plan/step-8.md`
- **Action for:** orchestrator (vision-level): nothing new beyond Step 8, which already carries it. The asset desk filed the matching Drive request (third hero, king, villain, and a priority order across all pending requests), `docs/mechanisms/asset-requests.md`.
