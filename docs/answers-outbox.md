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

### Q-008 · How do you leave the endless cantina brawl?
- **Answer:** "There is a bell in the middle of the cantina player can use to stop fights"
- **Recorded in:** `docs/vision.md` "Heroes, roster, powers and co-op"
- **Action for:** Step 11's lead

### Q-013 · A friend takes the hero you need to get back out
- **Answer:** "If you are in a small tunnel, you can't switch to a big character that doesn't fit there." (confirms the existing refusal; the friend case is the lead's call)
- **Recorded in:** `docs/plan/step-2.md` "What's decided"
- **Action for:** Step 2's lead

### Q-012 · Railway "Watch Paths" before 1 December
- **Answer:** "What's the doc in the repo? Can't we just change that rule? All play is just playtesting right now anyway" (read: not setting it by hand; restarts are fine while playtesting)
- **Recorded in:** `docs/mechanisms/deploy.md` "Traps"
- **Action for:** none

### Q-010 · Is this the right build order?
- **Answer:** "Just build according to the vision in the way that gets it playable according to the vision as soon as possible."
- **Recorded in:** `docs/current-directive.md` "Current directive"
- **Action for:** orchestrator: the directive is approved in that form; order is yours

### Q-005 · Stale rules in Drive docs
- **Answer:** "Later decisions trump earlier ones"
- **Recorded in:** `docs/vision.md` "Principles that decide most questions"
- **Action for:** none (whoever builds a rule uses the latest decision)

### Q-006 · "Current" art boards that fail the art gate
- **Answer:** "Many of the visuals are there to establish direction. Chat has been organizing the drive to be usable. Just review it's documentation." (boards stay; use ChatGPT's asset library docs to judge usability)
- **Recorded in:** `docs/vision.md` "Visual direction"
- **Action for:** Step 8
