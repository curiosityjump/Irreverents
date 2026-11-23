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

### Vision · The measure (second deadline: Amazing Mirror quality by tomorrow)
- **Answer:** "The game looks awful. Make sure it stays on track. I want to be playing something that looks, sounds, and feels as good as kirby and the amazing mirror, but with all the decisions in the vision, by tomorrow. LONG way to go currently."
- **Recorded in:** `docs/vision.md` "The measure"
- **Action for:** orchestrator (vision-level): by 2026-11-24 the target is look, sound and feel on par with Kirby & the Amazing Mirror. Put Step 8 ("What you see and hear") and game feel (movement, hit-stop, knockback, animation) ahead of new systems. Assets on hand: SFX pack (`docs/design-library/03-visual-direction-and-assets/audio/a01-01-first-sfx-pack/`), touch buttons (U08-01), S00-01 style references. ChatGPT's first heroes were too plain (it rejected them itself); hero v2, NPCs, tiles and music are queued. Art quality from ChatGPT is the biggest risk to this bar: consider having a session produce pixel art directly too, judged against `docs/design-library/` doc 14 and doc 32's checklist, rather than waiting on hourly deliveries.

