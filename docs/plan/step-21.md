# Step 21 — What being beaten costs

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**Owner (Drive, doc 11, D-019, D-081):**
> D-019 Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.
>
> D-081 Like Kirby, taking DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried items. …

Today a beaten hero lies flat for three seconds and gets up where they fell,
having lost nothing, because there was nothing to lose. It also answers Step
18's open question (what happens when enemies win) by default. From
`docs/plan/core-loops.md`, section 7.

## Goal

A player can see they are in trouble, and losing costs something real that
opens play. The party's faces sit at the top-left; yours changes as you take
blows, and at the edge your hero staggers. Go down in a bad guys' place while
one of them can reach you and he stands over you for a beat (a friend hitting
him stops it), then you are thrown out of the place's doorway: flat for three
seconds, then free. The power you carried is back where you fell; a prize in
your hands is back on its stand. What you broke stays broken and what you
found stays found: walk straight back in. In town, beaten by guards under an
alert, you are thrown into the open courtyard with the alert unchanged and the
chasers walking out after you.

## The signal (re-runnable)

- Scenarios `step21-*` in real rooms: beaten in the camp, thrown out to the
  courtyard, up and able to act, the camp's broken post still broken (control:
  the place switched off, the hero is still inside); a friend's hit stops it
  (control: no friend; a bandit's stray hit does not stop it); the power is
  left behind and the prize is back on its stand, not banked; knocked out in
  the cantina's brawl with a power: still held; in town under an alert, thrown
  to the courtyard, the chasers follow by the same door and after 20 s the
  alert is still up while a guard has the hero in sight (control: alert 0, no
  throw).
- A real-server check with two connections: the beaten player's own page is
  in the landing room and in charge of its body again after the
  acknowledgement (control: the place switched off). It is the `move`
  effect's first run through a browser page (`docs/mechanisms/network.md`).
- `npm run e2e`, a phone-sized page by touch: walk to the camp's fighters
  (past column 20: a hero at column 15 is never touched, by the check's
  measure), then stand; the drawn condition goes fine, hurt, down; then the
  page's room is the courtyard and the stick moves the hero.

## Stopping condition

The signal passes on `main` and live.

## What's decided

- The owner's D-numbers above; D-021 (crowds can overwhelm), D-080, D-082,
  D-088. S-007: no hard game-over. Doc 07, "Consequences that create
  gameplay": "additional combat, confiscation, reputation change, temporary
  exclusion, intensified defenses or an invitation to escape ... consequences
  must be legible and real". G-16: "neither meaningless instant reset nor
  permanent broken save". Doc 18: recovery time must not become the
  difficulty.
- O-006 (defeat and recovery) is OPEN: everything specific below is a logged
  `DRAFT:`, listed under "Decisions made on the owner's behalf".
- Never a reload, never held: free the moment they land; a place with no named
  landing spot throws nobody; one switch per place turns it off, which is
  today's behaviour. No digits.
- D-067, D-068, D-076, D-077: a transition never resets pursuit. Being beaten
  must never be the quickest way to end a chase or leave a heist.

## `DRAFT:` choices, made so the other answer is small (decisions-log, "Step 21")

- Thrown out, and where: a content kind `content/defeat/<place>.json` (which
  rooms, where a beaten hero lands, the beat before it, on or off, whether
  pursuers follow). Every landing spot is one room away at most.
- A face in three states, not hearts (the approved HUD sheets also draw
  hearts; Step 2's hidden toughness was a `DRAFT:`, not an `INTENT:`).
- The seize is cancelled only by a played body's hit: bandits flatten each
  other constantly (seven times in a measured minute).
- A power is not lost in the cantina's brawl (D-086's own open list includes
  rare gear in a brawl); a found piece is never lost (doc 30 part D with
  D-082, a proposal): each one data switch from the other answer.

## To settle before its brief

- It needs, on `main`: the powers slice's knock-loose push
  (`handoff-prompts/loop-powers.md`, push 3), the heist slice's cargo and its
  put-it-back function (`handoff-prompts/loop-heist.md`, push 4), and the HUD
  plate (`loop-heist.md`, push 2).
- The face reads the hero's wear, which is in the server's `c`; a page does
  not get the server's `c` for its own character. It must come from the
  snapshot's copy, passed into `render` from `src/client/main.ts`: name that
  edit in the brief, behind the hit-prediction builder's work there.

## Open (for the owner, by playing; nothing waits on them)

- Is being thrown out the right cost, or should it sting more?
- Faces, hearts, or nothing on screen at all?

## Owns

New files: `content/defeat/**`, `src/content/kinds/defeat.ts`,
`src/sim/systems/defeat-*.ts`, `src/client/draw/condition.ts`,
`scenarios/step21-*.json`, `scripts/checks/step21-*.ts`,
`scripts/e2e/defeat.ts`; an entry and table row in
`docs/deliberate-designs.md`. Agreed small edits: the snapshot's copy of the
viewer's hero passed to `render` (`src/client/main.ts`), one line in
`src/client/render.ts`. It edits nothing of the powers, heist or rescue
slices and nothing of Step 18's.

## Briefs

None yet. **Waits** for the three pushes named above. The orchestrator writes
its brief from this file and `docs/plan/core-loops.md`, section 7.

## Builder notes
