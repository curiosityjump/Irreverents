# Orchestrator workflows: the look review and the vision-gap audit

**Reference.** Open before running a look review round (Step 8) or refreshing
`docs/vision-gaps.md`. Both are scripts for Claude Code's Workflow tool. They are
kept here verbatim from their first runs on 2026-11-23, so the next orchestrator
re-runs them instead of re-deriving them. Pass one inline as `script`, after updating
the session ids, commit hashes and screenshot path, which are hard-coded.

- **Look review** (round 2 ran 13:45–14:30 UTC; 5 agents, about 1.2M subagent tokens;
  wrote cac6618): capture iPhone-size screenshots of every map room on live, in private
  worlds (the capture reached rooms by setting `room`/`x`/`y` on the page's own
  character in `window.irreverents.world`; its script was in the scratchpad), then
  three reviewers with distinct lenses (craft, phone, characters), then one synthesizer
  that ranks the gaps and writes at most five non-overlapping lane briefs. Round 3 is
  the same script, run after round 2's five lanes land.
- **Vision-gap audit** (first run 14:32–14:52 UTC; 4 agents, about 0.5M tokens; wrote
  7454fd9): three readers split the vision and the design library, then one ranker
  writes `docs/vision-gaps.md`. A refresh is cheaper: re-check that file's status column
  against main and the live game, by hand or with one agent. Re-run the whole audit only
  when the vision changes.

## Look review (round 2's script)

```js
export const meta = {
  name: 'look-round-2-review',
  description: 'Step 8 look, round 2: capture iPhone-size screenshots of every room, three independent reviews against the bar, synthesize the largest gaps into fix briefs',
  phases: [
    { title: 'Capture', detail: 'screenshots of every map room, upright and sideways, plus hero-set comparison' },
    { title: 'Review', detail: 'three reviewers, distinct lenses, against the owner\'s bar' },
    { title: 'Synthesize', detail: 'rank the largest gaps, decide the hero set, write round-2 briefs' },
  ],
}

const REPO = '/home/user/Irreverents'
const SHOTS = '/tmp/claude-0/-home-user-Irreverents/169f2530-e6a3-5108-adcb-7245604028cc/scratchpad/round2'

const CONTEXT = `
Project: Irreverents, a 2D side-scrolling browser game played mainly on iPhones (repo at ${REPO}, branch main; live at https://irreverents-production.up.railway.app). You are one stage of round 2 of plan Step 8, "the look" (docs/plan/step-8.md, section "The look, from 2026-11-23 11:11 UTC").
The owner's words (first-hand, 11:11 UTC, with an iPhone screenshot where every character was a flat rectangle): "It all looks looks like absolute blocky shit. Compare to kirby and the amazing mirror and don't stop working on it until it looks similar to that. There are assets provided and you have the ability to get more." And ~11:30 UTC: "It should play well in portrait too, not just landscape. Looks awful in both right now".
THE BAR (read these images): docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/pixel-aesthetic-reference-approved-direction.png; the two 320x180 phone previews in docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/s00-01-gameplay-references-use-now-revise-later/; the owner's liked hero concept docs/art-reference/heroes-v2-chatgpt-concept.png; and the new ChatGPT delivery P01 Ruins Starter Kit (docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p01-ruins-starter-kit-playable-prototype/p01-complete/, previews in preview/, manifest.json, README_FOR_CLAUDE.md).
RULE THAT STANDS: similar in craft (palette, outlines, shading, roundness, readable silhouettes, depth, lively animation), never copied: no character, sprite, tile or screen of Kirby's or any other game's is copied or traced; designs stay original.
Round 1 just finished: nine lanes landed on main (foundation 61f7676, heroes 59de45d, world 82fe89b, actors f92a447, shell ac6509b, sound fdcfec9, props a4040f4, tiles ebcf79e, cast cae8f46). The contract and path ownership: docs/mechanisms/art-pipeline.md. Lane notes: docs/mechanisms/art-foundation.md, rendering-world.md, rendering-actors.md, phone-shell-look.md, sound.md; tools/art/heroes/README.md, tools/art/cast/README.md, tools/art/props/README.md, tools/art/tiles/README.md.
Known gaps already reported by the lanes (confirm or refute them with evidence, don't just repeat them): sideways the game picture is small with bars (the shell says its rule "c2" forbids controls overlaying the picture at 750x340, overlay only on notched/16:9 screens; upright the picture is capped at 256 px tall); upright outdoors the far/mid backdrop layers are pinned to the screen and sit below the floor so only sky shows; castle-street cobbles and roofs share one grey slate course; the villain is weak (dark on dark, small face, no taller than the guard); the king's speech ribbon covers his crown sideways; the infiltrator's knocked-down pose reads poorly; the grappler's punch reaches ~12 px past its box; prop cracks vanish on dark walls; many states (moods, held, hide, grab, throw, down) were never seen in the running game.
An alternative complete hero set exists, drawn by the previous orchestrator's agent: git branch origin/claude/gallant-keller-1gpm2y at c7c9555 (touches tools/art/heroes/, assets/sprites/heroes/, content/sprites/{grappler,infiltrator,flyer,hero}.json; preview with python3 -I tools/art/heroes/preview.py in a checkout of it). Never check it out in ${REPO}; use a separate worktree or git show/archive into a scratch dir.
Do not edit, commit or push anything in ${REPO} unless your stage says so.`

phase('Capture')
const capture = await agent(`${CONTEXT}

YOUR STAGE: Capture. Make the screenshots the reviewers will judge from, into ${SHOTS} (create it). Work out how to put a player in each of the six map rooms (read content/rooms, src/client, scripts/e2e and scripts/checks for a room/start/world URL parameter or the private-world mechanism check:live uses). Prefer the live address in a PRIVATE world (never the default world: real friends may be in it). If no URL route reaches a room, run the current main locally (npm ci if needed, npm run build, then serve on a spare port) and use whatever start-room mechanism exists, without changing code; say which you used.
Playwright is preinstalled (require('playwright') works; chromium.launch() needs no options). For each map room capture: iPhone 14 upright (devices['iPhone 14'], deviceScaleFactor 2), iPhone 14 sideways (devices['iPhone 14 landscape'], deviceScaleFactor 2), and one small phone sideways (667x375, deviceScaleFactor 2). Wait for art to load (~3 s). Where you can, also capture 2-3 action moments in one room (a hit, a carry or throw, a person in a non-calm mood) and one shot with two players present.
Also: a contact sheet of main's four heroes and one of the branch c7c9555 heroes (via each tree's tools/art/heroes/preview.py or by compositing the sprite PNGs scaled 4x with nearest-neighbour), saved as heroes-main.png and heroes-branch.png.
Name files <room>-<view>.png. Look at a few yourself to make sure they show the game, not a loading or error screen. Return a manifest.`, {
  label: 'capture-screenshots',
  phase: 'Capture',
  schema: {
    type: 'object',
    properties: {
      method: { type: 'string', description: 'how rooms were reached (live private world or local), and anything that could not be captured' },
      shots: { type: 'array', items: { type: 'object', properties: {
        file: { type: 'string' }, room: { type: 'string' }, view: { type: 'string' }, note: { type: 'string' } }, required: ['file', 'room', 'view'] } },
    },
    required: ['method', 'shots'],
  },
})

if (!capture || !capture.shots || capture.shots.length === 0) {
  log('Capture produced no screenshots; stopping before review.')
  return { stopped: 'no screenshots', capture }
}
log(`${capture.shots.length} screenshots captured (${capture.method.slice(0, 120)})`)

const SHOTLIST = capture.shots.map(s => `- ${s.file} (${s.room}, ${s.view}${s.note ? '; ' + s.note : ''})`).join('\n')

const GAP_SCHEMA = {
  type: 'object',
  properties: {
    gaps: { type: 'array', items: { type: 'object', properties: {
      title: { type: 'string' },
      what: { type: 'string', description: 'what is wrong, in plain words, as a player would see it' },
      evidence: { type: 'string', description: 'which screenshot files / rooms / views show it, and what in the bar shows the better version' },
      size: { type: 'integer', description: '1-5: how large a gap from the bar this is, 5 = the owner would call it blocky/awful' },
      fix: { type: 'string', description: 'the concrete change that closes it' },
      paths: { type: 'string', description: 'files/dirs the fix touches, per the art-pipeline contract lanes' },
    }, required: ['title', 'what', 'evidence', 'size', 'fix', 'paths'] } },
    heroSetVerdict: { type: 'string', description: 'only if your lens covers it: main 59de45d vs branch c7c9555 vs the concept, with reasons' },
    p01Uses: { type: 'string', description: 'which P01 kit pieces beat what is in the game now and should replace it as data, if any' },
  },
  required: ['gaps'],
}

const LENSES = [
  { key: 'craft', text: 'CRAFT against the bar: palette and colour depth, dark outlines, 3-4 tone shading, texture on ground and walls, roundness and appeal, depth from parallax and backdrops, how close each room gets to the approved direction and S00-01 previews, and where a P01 kit piece (terrain prefabs, props, effects) would beat what is drawn now.' },
  { key: 'phone', text: 'THE PHONE: how the game presents on an iPhone upright and sideways: how much of the screen the game picture takes, dead or black space, letterboxing, whether characters, props and text read at real size, the controls (size, look, overlap), and whether the shell\'s c2 rule (no controls over the picture at 750x340) is worth what it costs. The owner: "It should play well in portrait too".' },
  { key: 'cast', text: 'CHARACTERS AND COHERENCE: whether heroes, cast, props and tiles look like one game (scale, outline weight, palette, pixel density; the P01 heroes are 48 px vs our 32 px cells), silhouettes and readability of each character and mood, the villain, the king and his ribbon, animation states seen in the action shots, and a verdict on the hero set: main 59de45d vs the branch c7c9555 contact sheets vs the owner\'s heroes-v2 concept (the owner liked that concept).' },
]

phase('Review')
const reviews = await parallel(LENSES.map(l => () => agent(`${CONTEXT}

YOUR STAGE: Review, lens = ${l.key}. You are an independent reviewer; other reviewers look through other lenses. Your lens: ${l.text}
Screenshots (read them; they are PNGs on disk):
${SHOTLIST}
Capture notes: ${capture.method}
Open the bar images and compare side by side. Report the LARGEST gaps first (at most 10), each with evidence a fresh reader can check by opening the named files. Be blunt: the owner called the last version "absolute blocky shit"; say where it still is. Don't pad with small polish; a gap is large if a player would notice it in the first ten seconds.`, {
  label: `review:${l.key}`,
  phase: 'Review',
  schema: GAP_SCHEMA,
})))

const good = reviews.filter(Boolean)
log(`${good.length} of ${LENSES.length} reviews returned; ${good.reduce((n, r) => n + r.gaps.length, 0)} gaps in total`)

phase('Synthesize')
const synth = await agent(`${CONTEXT}

YOUR STAGE: Synthesize and brief. Three independent reviews of the live game's look follow, as JSON. Screenshots are in ${SHOTS}.
${JSON.stringify(good.map((r, i) => ({ lens: LENSES[i] ? LENSES[i].key : 'unknown', ...r })), null, 1)}

Do this, in ${REPO} on main (git pull first):
1. Merge duplicate gaps across lenses; rank by size and by how many lenses saw it; keep the ones a player notices in the first ten seconds. Spot-check the top ones yourself by opening the cited screenshots; drop any you cannot see.
2. Decide the hero set (main 59de45d, branch c7c9555, or parts of each) from the reviewers' verdicts and the contact sheets, as a DRAFT decision: add an entry to docs/decisions-log.md (what, why, how to undo). Decide which P01 kit pieces replace what as data.
3. Cut the fixes into at most 5 round-2 lanes whose paths do not overlap (use docs/mechanisms/art-pipeline.md's lane/path ownership; an art lane and the code lane that draws it must not both edit one file). Write one brief per lane at handoff-prompts/look2-<lane>.md, in the same shape as round 1's briefs (see one with: git show f7e25c9^:handoff-prompts/look-cast.md) and docs/briefs.md: the task and measure; what is decided (quote the owner's words above, the bar, the similar-not-copied rule, the gaps this lane closes with their evidence files described in words, since the screenshots are not in the repo); what is open; the paths it owns and must not touch; done = build, check and e2e green, pushed to main, live, and its own before/after screenshots at iPhone size upright and sideways; report "look2 lane <lane> done at <commit>" to the orchestrator session named in docs/questions-for-the-owner.md's header, with at most three lines on what is weakest.
4. Add a "Round 2 (2026-11-23)" subsection under "The look" in docs/plan/step-8.md: the ranked gap list (one line each), the hero-set decision, the P01 uses, and the lane list with brief paths. Update the "Briefs" section to name the round-2 briefs.
5. Commit only those docs and briefs (no code, no assets), with message "Step 8 look round 2: review of the live game, ranked gaps, <N> briefs" and the trailer lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017WiGzGp8auJceLEAAh9Aqx
then git pull --rebase origin main and git push origin HEAD:main; confirm with git log origin/main -1.
Return the commit, the lanes, and the top gaps.`, {
  label: 'synthesize-and-brief',
  phase: 'Synthesize',
  schema: {
    type: 'object',
    properties: {
      commit: { type: 'string' },
      heroDecision: { type: 'string' },
      p01Uses: { type: 'string' },
      topGaps: { type: 'array', items: { type: 'string' } },
      lanes: { type: 'array', items: { type: 'object', properties: {
        lane: { type: 'string' }, brief: { type: 'string' }, closes: { type: 'string' }, paths: { type: 'string' } }, required: ['lane', 'brief', 'closes'] } },
      droppedOrUnverified: { type: 'string' },
    },
    required: ['commit', 'topGaps', 'lanes'],
  },
})

return { capture: { method: capture.method, count: capture.shots.length }, synth }

```

## Vision-gap audit (first run's script)

```js
export const meta = {
  name: 'vision-gap-audit',
  description: 'Compare the live game with docs/vision.md and the design library, rank the biggest gaps, and write docs/vision-gaps.md as a standing list the orchestrator refreshes',
  phases: [
    { title: 'Read', detail: 'three readers extract what the vision and library promise, and check each against the repo' },
    { title: 'Rank', detail: 'merge, verify the top gaps, write docs/vision-gaps.md' },
  ],
}

const REPO = '/home/user/Irreverents'
const SHOTS = '/tmp/claude-0/-home-user-Irreverents/169f2530-e6a3-5108-adcb-7245604028cc/scratchpad/round2'

const CONTEXT = `
Project: Irreverents, a 2D side-scrolling action-adventure for iPhones (touch first), for the owner and their friends; repo ${REPO} (branch main, do NOT edit or commit unless your stage says so), live at https://irreverents-production.up.railway.app.
The owner, first-hand today: "I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet", and "I put a lot of work into getting all the vision documentation laid out for you guys. I don't want to repeat all that. You are capable of looking at the game, looking at the vision, seeing the gaps, and closing them." Also: "I want as much as possible to go into actually building the game" (so be efficient: skim, grep, don't re-read what you've seen).
Sources: docs/vision.md (the owner's words, curated); docs/design-library/ (the owner's full design, read-only; its labels are literal: anything marked PROPOSED, EXAMPLE or OPEN is not a decision; D-numbers are decisions in the register, library doc 11). The plan: docs/plan.md (steps and status lines) and docs/plan/step-N.md. What is built: content/ (rooms, characters, actions, tuning as JSON), src/ (sim, client, server), scenarios/ and scripts/ (scripted checks). Recent screenshots of the live game at iPhone size: ${SHOTS} (PNG files; some show the look before round 2's fixes).
A "gap" = something the vision/library CONFIRMS a player should experience that the live game does not deliver (absent) or delivers thinly (partial). Judge by what a player can actually do and see, not by docs claiming it.`

const ITEM = {
  type: 'object',
  properties: {
    promise: { type: 'string', description: 'what a player should experience, in plain words' },
    source: { type: 'string', description: 'vision.md section or library doc + D-number, with a short quote' },
    confirmed: { type: 'boolean', description: 'true if a decision/the owner confirmed it; false if PROPOSED/EXAMPLE/OPEN' },
    status: { type: 'string', enum: ['present', 'partial', 'absent'] },
    evidence: { type: 'string', description: 'what in content/, src/, scenarios or the screenshots shows the status' },
    planStep: { type: 'string', description: 'which plan step covers it (e.g. "Step 11"), or "none"' },
    weight: { type: 'integer', description: '1-5: how much a player would miss it in the first sessions (5 = core of the vision)' },
  },
  required: ['promise', 'source', 'confirmed', 'status', 'evidence', 'planStep', 'weight'],
}
const READ_SCHEMA = { type: 'object', properties: { items: { type: 'array', items: ITEM } }, required: ['items'] }

const SLICES = [
  { key: 'vision+narrative', text: 'docs/vision.md in full, and docs/design-library/00-start-here-irreverents.md, README.md and the folder 01-vision-and-narrative/.' },
  { key: 'gameplay', text: 'docs/design-library/02-gameplay-systems/ (movement, powers, combat, stealth, NPC response, enemies, co-op, secrets, progression and the rest).' },
  { key: 'world+decisions', text: 'docs/design-library/04-decisions-and-prototyping/ (the decision register, D-numbers) and 05-world-and-game-expansion-proposals/ (places, levels, the cantina, the outpost; remember PROPOSED is not a decision), plus 03-visual-direction-and-assets/ only for what it says a player should see (skip image files).' },
]

phase('Read')
const reads = await parallel(SLICES.map(s => () => agent(`${CONTEXT}

YOUR SLICE: ${s.text}
List the experiences your slice promises a player (aim for the 15-30 that matter most; merge fine-grained ones), each with its status in the live game as it stands on main now. Check status cheaply: grep content/ and src/ and scenarios/ for the thing, glance at the screenshots. Prefer confirmed items; include an unconfirmed one only if it is large and clearly intended, marked confirmed=false.`, {
  label: `read:${s.key}`,
  phase: 'Read',
  effort: 'medium',
  schema: READ_SCHEMA,
})))

const items = reads.filter(Boolean).flatMap(r => r.items)
log(`${items.length} promises read; ${items.filter(i => i.status !== 'present').length} not fully present`)

phase('Rank')
const result = await agent(`${CONTEXT}

YOUR STAGE: merge, verify, rank, write. Three readers produced this list (JSON):
${JSON.stringify(items)}

1. Merge duplicates. Keep the gaps (partial/absent). Spot-check the top 10 yourself (grep the repo or open a screenshot); fix any status a reader got wrong.
2. Rank by: weight, confirmed over unconfirmed, and whether the owner named it today (levels, enemies, the cantina, the look, the feel). Note which plan step covers each, and flag gaps no step covers.
3. git pull --rebase --autostash origin main in ${REPO}, then write docs/vision-gaps.md, a NEW file. It must start "**Reference.**" and be short and scannable:
 - one paragraph: what this file is (the standing list of the biggest gaps between the live game and the vision, so the owner never has to find omissions; the owner's words quoted above), and how to refresh it cheaply (re-check the status column of the listed rows against main and the live game, re-rank; add rows only when the vision changes; the orchestrator does it whenever a plan step closes or a round lands);
 - "Biggest gaps", ranked, at most 15 rows: promise | source (D-number or vision section) | status | plan step or "none" | what would close it (one line);
 - "Covered and present" as one compact line listing what is already delivered;
 - "Not decided yet": large unconfirmed items, one line each, for Vision Partner to raise.
4. git add docs/vision-gaps.md ONLY (other files in the working tree belong to other running work; never add them). Commit with message "Vision gaps: the live game against the vision, ranked (first audit)" and these trailer lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017WiGzGp8auJceLEAAh9Aqx
then git pull --rebase --autostash origin main and git push origin HEAD:main; confirm with git log origin/main -1.
Return the commit, the top 8 gaps, and the gaps no plan step covers.`, {
  label: 'rank-and-write',
  phase: 'Rank',
  schema: {
    type: 'object',
    properties: {
      commit: { type: 'string' },
      top: { type: 'array', items: { type: 'object', properties: {
        promise: { type: 'string' }, status: { type: 'string' }, planStep: { type: 'string' }, close: { type: 'string' } }, required: ['promise', 'status', 'planStep'] } },
      uncovered: { type: 'array', items: { type: 'string' } },
    },
    required: ['commit', 'top', 'uncovered'],
  },
})
return result

```
