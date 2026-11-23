# Step 19 — Stealth you can read, and a prize you carry out

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**Owner (Drive, doc 11, D-016, D-019):**
> D-016 Stealth as broadly viable playstyle across the world; zero-alarm success should be deeply satisfying.
>
> D-019 Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.

The sneaking is built (Step 4's sight and witnesses, Step 12's camp, Step
16's depot with two zero-alarm routes) and the owner, playing, did not find
it. From `docs/plan/core-loops.md`, section 2.

## Goal

A phone player can see a job before doing it. The Use button names what it
will do here (TAKE, BUY, BREAK, GO IN). Every watcher shows what they can see
as a faint band that flips when they turn. A prize taken from a guarded place
is in your hands until you walk out with it. Leave without anyone of the place
ever having had you in sight and the game says nobody noticed. Seen, the same
job becomes a fight or an escape with the prize at stake. The shop on the
first street screen and the Bandit Camp two rooms in are where it is first
played; the depot is the same job at full size.

## The signal (re-runnable)

- Scenarios `step19-*`: an unseen take in the shopkeeper's look away (control:
  a beat earlier, witnessed); a camp job never seen is banked and clean
  (control: seen once, banked, not clean); a loud job with the horn never
  sounded is not clean; a prize still inside is not banked; a good restocks.
- `scripts/checks/step19-heist.ts`, a real server and two connections: cargo,
  the banked prize and the clean event reach each connection's own world.
- `npm run e2e`, a phone-sized page by touch: the button's state reads take
  at the goods and buy at the counter; the keeper's band flips with her
  facing; the party plate lists its faces.
- Every `step3-*`, `step4-*`, `step11-*`, `step12-*` and `step16-*` scenario
  unchanged through the Use arbiter.

## Stopping condition

The signal passes on `main` and live. What the owner says after playing
reopens or extends it.

## What's decided

- The owner's D-numbers above, D-061 to D-066 (seeing is not calling; a call
  can be stopped), D-081 (a hit can cost carried items), D-093 (a few
  context-sensitive touch controls).
- Doc 07: heists are discovered opportunities, with no "begin heist" flag;
  "detection cones or simple proximity checks"; "confiscation" among the
  consequences. The owner's comp A00-01 draws a vision cone.
- **No detection rule is added** (O-007 is open): the band draws the test
  that exists, exactly.
- Getting caught opens play. There is always a way out: a banner takes no
  input and stops nothing.

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 19")

- One place decides what Use does here and what the button says
  (`src/sim/use.ts`); a new thing Use can do is one file and one row of words.
- The band's look; the words; the closed-eye tick for an unseen deed.
- **A prize is cargo until its taker is out of the place on their own feet**;
  then it is banked. A prize taken in an old kept game counts as banked.
- **Clean means never seen** by anyone of the place, from going in to banking
  the prize. A shop take is never a getaway.
- Ordinary goods restock; a prize, the special good and a bell never do.
- The camp's strongbox and its place.

## Open (for the owner, by playing; nothing waits on them)

- Does seeing what a watcher sees make sneaking a plan, or give it away?
- Should a prize in your hands slow you, or show on your hero?

## Owns

New files: `src/sim/use.ts`, `src/sim/use/*.ts`, `content/prompts.json`,
`src/content/kinds/prompts.ts`, `src/client/use-prompt.ts`,
`src/client/draw/use-hint.ts`, `src/client/draw/sight.ts`,
`src/client/draw/banner.ts`, `src/client/draw/hud.ts`,
`src/client/draw/heist.ts`, `content/heists/**`,
`src/content/kinds/heists.ts`, `src/sim/systems/heist-*.ts`,
`scenarios/step19-*.json`, `scripts/checks/step19-*.ts`,
`scripts/e2e/heist.ts`. Agreed small edits: the Use selection in
`src/sim/systems/room-doors.ts`, `npc-interact.ts` and `cantina-brawl.ts`
(Steps 3, 4 and 11), one directory in `scripts/lib/registries.ts`, `showGoIn`
in `src/client/touch.ts` and its call in `src/client/main.ts`, one export in
`src/sim/npc/sight.ts`, a look name and `restock` in
`src/content/kinds/placements.ts`, the strongbox in
`content/placements/outpost.json`, restock fields in
`content/placements/castle-street.json`, lines in `src/client/render.ts`.
Nothing of Step 16's.

## Briefs

- `handoff-prompts/loop-heist.md` (written 2026-11-23 19:40 UTC by the
  core-loops re-plan). Its pushes 1 and 2 (the Use arbiter; the shared banner
  queue and HUD plate) unblock Steps 9, 13, 7 and 20.

## Builder notes

(Step 19 builder `session_017WiGzJqpMTHyoAaus6JsHG`, brief `loop-heist.md`.)

- **Landed:** push 1 (the Use arbiter) 03b5935; push 2 (the word, banners,
  plate) 588ac88; push 3 (sight bands, the unseen mark) 60175bb; push 4
  (the prize, cargo, clean getaway) c881c17; push 5 (restock): `git log
  --grep 'Step 19 push 5'`. check:live ok after pushes 1, 2 and 4.
- **The strongbox moved to column 34** (decisions-log): measured, no
  clean job was possible at column 23.
- **Not built:** `step19-camp-loud-no-horn` (every watcher knocked flat in
  plain sight, the horn never sounded). The camp's fighters do not come at
  a flyer they see, and a grappler on the floor is called on at once; a
  scenario that flattens all three before a call completes needs tuning
  the budget did not allow. `step19-camp-clean-control` covers the rule it
  was for: seen, no call, banked, no clean getaway. For the next builder or
  the orchestrator.
- **Flaky under load, not ours:** full `npm run e2e` runs while another
  heavy job ran missed `cantina-row`, `level-full`/`level-menu` once each
  and `h1` (reconnect) once; each passed on a quiet re-run or on the
  commit before with nothing of ours in its path.
- **Unseen look:** the art builder cut `unseen` (P07's hood with eyes, no
  closed eye on the atlas) and `seen-mark`; `draw/sight.ts` draws `unseen`;
  `seen-mark` is unused yet.
- **To ask Step 16's lead:** a `clean-getaway` expectation on its
  zero-alarm scenarios and none on its caught ones, now the depot hoard is
  a prize (`content/heists/depot.json`).
- **Not verified:** the chime on a phone (audio is not in the e2e); the
  band's cost on a real iPhone (14 by 10 line tests per person per frame,
  up to 8 people).
