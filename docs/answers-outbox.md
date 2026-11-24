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

### Q-016 · Should raw music stems and unused source packs stay out of the game's repository?
- **Answer:** already answered by the owner's standing words, not asked again: "Do whatever gets us the game I want as soon and efficiently as possible. That's all i care about" (2026-11-23 ~14:45 UTC) and "if things can be done more efficiently to get much more resukts for less tokens, the team has full license to do that". Nothing is deleted from Drive; list the big files by name instead of mirroring them.
- **Recorded in:** `docs/vision.md` "Principles that decide most questions" (the build-first principle and its confirmation)
- **Action for:** orchestrator (process): go ahead; update `tools/drive_sync.py`'s skip list and `docs/mechanisms/asset-requests.md`.

