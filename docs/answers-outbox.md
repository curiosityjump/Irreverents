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

### Vision · The long-term direction (deploy target)
- **Answer:** "This is the url railway will deploy everything to, where the game will be playable: irreverents-production.up.railway.app … Make sure you can access it so the claude dev team can test things better from the player perspective"
- **Recorded in:** `docs/vision.md` "The long-term direction"
- **Action for:** orchestrator (process): fill `CLAUDE.md`'s `{{DEPLOY_TARGET}}` with Railway at that URL, and find out from the owner whether a push to `main` is the deploy. As of 2026-11-23 the URL answers Railway's 404 "Application not found" (nothing deployed yet); the "Curiosity Cloud" environment allows the host, so `curl` and the pre-installed Playwright Chromium can both load it for player-view testing.

### Q-001 · Can the Drive library's "CONFIRMED" lines count as your own words?
- **Answer:** "Everything in the google drive counts as my own words. It's my drive and I'm only allowing what I've agreed to to go in there in the first place."
- **Recorded in:** `docs/vision.md` "Where the detail lives"
- **Action for:** orchestrator (vision-level): `docs/design-library/` is the owner's words; its own PROPOSED / EXAMPLE / OPEN labels still mean exactly that.

### Q-002 · Who is Irreverents for, and what is it for you?
- **Answer:** "This is a game for me and my friends to play on our phones/computers via browser/webapp."
- **Recorded in:** `docs/vision.md` "Who this is for, and why"
- **Action for:** orchestrator (vision-level)

### Q-004 · What does it run on, and how is it played?
- **Answer:** the same sentence as Q-002: "on our phones/computers via browser/webapp."
- **Recorded in:** `docs/vision.md` "Who this is for, and why"
- **Action for:** orchestrator (vision-level): a browser game for phones and computers, so touch and keyboard/controller both count. No engine was named; that choice is the orchestrator's to propose to the owner.

### Vision · first vision written; no plan exists yet
- **Answer:** genesis vision written from the owner's Drive library (now mirrored at `docs/design-library/`) and their chat answers.
- **Recorded in:** `docs/vision.md`: "Where the detail lives", "Who this is for, and why", "What “working” looks like", "The long-term direction", "The measure" (open, Q-003), "Principles that decide most questions", "Frontiers" (7), "Still open".
- **Action for:** orchestrator (vision-level): write `docs/plan.md` from it. Q-003 (the measure) and Q-007 (first slice) are open in the ledger and shape the first step.

### Vision · The measure (first deadline)
- **Answer:** "I want this game to be playable by the time I wake up in the morning. Once you are ready, I will start the orchestrator session and let you all work through the night on this."
- **Recorded in:** `docs/vision.md` "The measure"
- **Action for:** orchestrator (vision-level): the first plan step is a playable build live at irreverents-production.up.railway.app by the owner's morning (2026-11-23 local). The owner is asleep while you work, so anything needing their approval waits; see the ledger for what they pre-answered.

### Q-009 · Is the Railway service connected to this repo, so a push to `main` goes live?
- **Answer:** "It's setup to deploy automatically from main yes."
- **Recorded in:** `docs/vision.md` "The measure"
- **Action for:** orchestrator (process): a push to `main` IS the deploy to irreverents-production.up.railway.app; fill `CLAUDE.md`'s Git section and `{{DEPLOY_TARGET}}` accordingly.

### Q-007 · Which first slice?
- **Answer:** "Orchestrator has free reign."
- **Recorded in:** `docs/vision.md` "The measure"
- **Action for:** orchestrator (vision-level): choose the slice yourself; no owner approval needed tonight.

### Q-003 · How should we measure that the game is moving the right way?
- **Answer:** "Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning."
- **Recorded in:** `docs/vision.md` "The measure"
- **Action for:** orchestrator (vision-level): the morning measure is two people playing together, having fun, at the live URL, in browsers (phone or computer). That puts 2-player online co-op (one shared party) in tonight's scope, not later.

### Vision · Asset requests through Drive (ChatGPT makes assets)
- **Answer:** "Ok, chatgpt is setting up the google drive so you can request assets, it will see those requests and put the requested assets into the drive, and so on. I want yoy to take advantage of this. Make sure the orchestrator knows it can request assets this way."
- **Recorded in:** `docs/mechanisms/asset-requests.md` "What it is"
- **Action for:** orchestrator (process): request art via Drive folder "01 REQUESTS" per that doc; ChatGPT polls hourly, so build with placeholders and swap in. New assets are approved for use by default (Drive protocol's owner rule). Writing the request needs the Google Drive connector, which sessions don't have yet; the owner has been asked to connect it. Also new in the Drive sync: doc 33 (owner-confirmed: iPhone browser is the primary target, touch-first) and S00-01 grassy-ruins style candidates.

