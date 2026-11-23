# Core loop 7, risk: beaten means thrown out, and what you carry is at stake (Step 21)

**From the orchestrator (`session_017WiGzJzo6aZqH4kYxxJsiV`, 2026-11-23 23:12 UTC):** start now; only the power parts wait for `loop-powers.md` push 3. Where this brief says to ask a number's owner: the waves builder is `session_017WiGzHvGxLQnLUErw7teAo`, the town-tiers builder `session_017WiGzFxZZnM2VcdqhXnrNu`; Step 16's lead is archived, so questions about the depot or `heavy-fighter` come to me (the session on the Orchestrator line). An owner who does not answer within about ten minutes: decide, mark `DRAFT:`, log it, tell them what you changed.

Brief for one cold builder. Written 2026-11-23 by the orchestrator's drafting
agent, read at bd0edd0 (`docs/plan/core-loops.md`, section "7 · Risk",
lines 522-562; read it, "The principle" and the "Names the slices share"
table first). The step is `docs/plan/step-21.md`: read all of it. Read
`docs/mechanisms/combat-and-impact.md`, `docs/mechanisms/network.md`
("Effects: the world moving a player's character", "Traps"),
`docs/mechanisms/heists.md`, `docs/mechanisms/powers.md`,
`docs/mechanisms/outposts.md`, `docs/mechanisms/npc-response.md`,
`docs/mechanisms/cantina.md`, `docs/mechanisms/rendering-world.md`
("Banners", "The party plate"), `docs/mechanisms/saves.md`,
`docs/mechanisms/scenarios.md` and `docs/deliberate-designs.md` before
writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-21.md`, "Builder notes" (its last heading, empty today).

**Small pushes, each standing alone, green and live. Push 1 is a measurement
written into the notes, before any rule.** If you pass about 300k tokens
after push 3, report and stop: the orchestrator re-briefs push 4.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"; `docs/plan/core-loops.md:12-18`):

> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**What a player gets.** *You see:* your face at the top-left changes as you
take blows: fine, then hurt, and at the edge your hero staggers under dizzy
stars. Go down in the Bandit Camp while a bandit can reach you and he stands
over you for a beat (a friend hitting him stops it); then you are thrown
bodily out of the camp's doorway into the courtyard. You land flat, and
within seconds you are up and free. The strongbox you were carrying is back
on its stand; the power you held lies where you fell and fades. The horn you
broke stays broken, pieces and freed heroes stay yours, a friend still inside
keeps fighting: walk straight back in. In the castle street, beaten by guards
under an alert, you are thrown into the open courtyard with the alert
unchanged and the chasers walking out after you. *Found by:* nobody is told.
The face is on screen from the first second and changes on the first blow;
the first throw-out happens to anyone who stands among the camp's fighters.
*Pay-off:* nothing is gained; it makes what is kept feel earned. *At stake:*
your place, the prize in your hands, your power. Never a reload, never a
game-over screen, never held.

**It moves no row of `docs/plan.md`'s table** (M1, M2, M3 unchanged); it is
read by the owner playing.

The library (doc 11): **D-019** "Failure of stealth opens satisfying battles,
last stands and narrow escapes, NOT an automatic-reload punishment loop"
(:63); **D-020** "Spectacular IMPACT is a top priority" (:65); **D-021**
"crowds and escalating resistance can become overwhelming" (:67); **D-081**
"taking DAMAGE can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also
lose carried items ... exact loss thresholds, timing, item categories and how
player can reclaim it remain OPEN" (:331); **D-082**, **D-085**, **D-086**
(the cantina's brawl is outside the ordinary rules; doc 31:37 "Do not apply
ordinary permanent death/knockout, equipment loss or mission-failure rules
here by default"), **D-088**. Direction, not decision: **S-007** "avoid hard
game-over for ordinary experimentation" (:113); doc 07:45 "additional combat,
confiscation, reputation change, temporary exclusion, intensified defenses or
an invitation to escape; specific punishment models are open"; G-16 "neither
meaningless instant reset nor permanent broken save" (doc 12:141). PROPOSED
only: doc 18:87 "punishing recovery time should not become the main source of
difficulty"; doc 30 part D "proposed default ... not yet owner-confirmed"
(found pieces are not lost on hits). **OPEN: O-006** (defeat and recovery,
:143). So the throw-out itself, its beat, where you land and every number are
`DRAFT:`.

## Measured and read for you (at bd0edd0)

- **Being beaten today:** `wear()` adds to `c.worn.amount` and at the body's
  `toughness` emits the `flatten` effect for `flattenTime` and the event
  `flattened` (`src/sim/body-state.ts:170-181`); `flattenTime` is 3
  (`content/tuning.json:41`); getting up deletes `c.worn` and emits
  `recovered` (`src/sim/systems/combat-clock.ts:37-44`). **Wear is never
  shed any other way** (the only other delete is `cantina-out.ts:57`), so a
  hero hurt once stays hurt until flattened.
- **Toughness** (`content/tuning.json`): grappler 160 (:154), infiltrator 80
  (:182), flyer 90 (:212), brawler 200 (:296), skirmisher 70 (:326). **Blows:**
  `outpost-fighter` wear 20, wind-up 0.25 s (:255-256); `guard` 20, 0.4 s
  (:103-104); `heavy-fighter` 24, 0.35 s (:348-349).
- **A swing never lands on a flattened body** (`src/sim/verbs/attack.ts:134`),
  and `wear()` returns at once on one (`body-state.ts:171`).
- **The waves builder's measurement** (`docs/plan/step-7.md:363-367`, push 1
  at 91b83a5): "none of the three heroes, pressing attack every 0.4 s facing
  the waves, was knocked down once in 90 s (each blow launches the fighter
  before its 0.25 s wind-up lands). A hero who never strikes is flattened in
  about 20 s." All three reach the third wave. **So risk is absent today even
  inside real waves.**
- **The camp** (`content/outposts/outpost.json`): bound 8, waves of 1, 2,
  then a fighter and the heavy for ever, entry [41, 10]. Its one door is
  `to-courtyard`, an enter doorway nobody of the camp ever asks for
  (`content/rooms/outpost.json`, its `INTENT:`), landing at the courtyard's
  `to-outpost`.
- **The town** (`content/dispatch/castle-street.json`, e4eb3c9): rows of 0, 2,
  3 guards by `to-throne-room` and `to-courtyard`, cap 8. "The probe ... done
  at cap 8 for all five roster heroes, solo ... None stuck"
  (`docs/plan/step-4.md:520-522`). An area is a room and its alert is the
  entity `~alert:<room>` (`src/sim/npc/alert.ts:95-103`). The street's
  `to-courtyard` is a walk door.
- **Cargo** (`docs/mechanisms/heists.md`, "The rules"): `world.cargo` is hero
  entity id to thing id; `returnPrize(world, thing)` at `src/sim/heist.ts:75`
  clears the cargo and `takenBy` and **emits nothing**: "the caller emits
  `prize-returned`" (the event is declared at `heist.ts:40`). `heist-cargo`
  (order 607) banks a prize when its carrier is out of the room and
  `onOwnFeet` (`heist-cargo.ts:81`).
- **Powers on `main`** (64bd1fe, b2216dc): `c.power`, the `power` effect
  (`src/sim/effects.ts:29, 74-76`), `popOrb()` (`src/sim/power-orbs.ts:18`,
  emits `power-dropped`), called only for carriers
  (`systems/power-carriers.ts:30`). **A hero's power is never knocked loose
  yet:** that is `handoff-prompts/loop-powers.md` push 3 (:119-122), not on
  `main`.
- **A player is moved only by an effect** (`cantina-out.ts:16-18`, an
  `INTENT:`). `move` (`effects.ts:25, 62-67`) is emitted today only inside
  one room (`cantina-out.ts:61`, `body-state.ts:214`); `network.md` says it
  has run across two headless connections, "not yet in a browser". **Yours is
  the first `move` to another room.** While an effect is pending the server's
  word wins and the page's reports are set aside (`network.md`, "Effects").
- **The page never gets the server's `c` for its own character.** The
  snapshot's copy passes `src/net/client.ts:186` and is dropped unless held;
  the object returned there offers `world`, `me`, `latest`, `others`
  (:262-320) and no accessor for it. `flatten` is an effect, so
  `me.c.flattened` is true on the page; `c.worn` is not there.
- **Drawing:** `fillHudSlot('condition', filler)` (`src/client/draw/hud.ts:21,
  33`; one filler per slot, yours is the first for `condition`);
  `queueBanner({ key, text })` (`src/client/draw/banner.ts:39`; no digits;
  it "takes no input and stops nothing", its `INTENT:`). Looks that exist:
  `hud-face-<kind>` for the five heroes (`content/looks/ui.json:8-12`) and
  `fx-dizzy` (`content/looks/fx.json:12`, drawn at
  `src/client/draw/entities.ts:280`). **No hurt or down face is cut.**
- **Scenarios on `main` by prefix:** step4 32, step7 4, step9 5, step11 21,
  step12 11, step13 7, step16 66, step18 4, step19 7, step20 4, step21 0.

## What to build (`DRAFT:` throughout; decisions-log entries "Step 21")

1. **Push 1, measure (documents only; no redeploy).** In a scratch copy,
   throwaway scenarios through `node scripts/trace.ts`; nothing of them is
   committed. For each of the five heroes in `content/roster.json`, solo, in
   the real camp at waves 1, 2 and 3 and in the real street at alert 1, 2 and
   3, played three ways (never striking; striking every 0.4 s facing them;
   badly: a strike every 2 s, facing the wrong way half the time): seconds to
   the first `flattened`, how many in 90 s, the longest stretch with no
   control, and whether the hero can still leave by the door. Write the table
   into the notes. Then **choose what makes a beating possible without making
   escape impossible**, as tuning in content, and write the choice and its
   reason under it. Never invent a number: each is measured, `DRAFT:`, logged
   in `docs/decisions-log.md`. The numbers you may want are other owners'
   (see "Must not touch"): for each, measure in the scratch copy how many
   scenarios it turns red, pick the lever that re-times fewest, and ask its
   owner by message with that count. A hero who keeps striking well may stay
   safe; a hero who stands, or fights badly in a third wave, must go down.
2. **Push 2, the rule (sim).** `content/defeat/<place>.json` and
   `src/content/kinds/defeat.ts`: the rooms of a place, on or off, where a
   beaten hero lands (a room and a door or tile, one room away at most), the
   beat before it, whether pursuers follow. Files for the camp (lands at the
   courtyard's `to-outpost`) and the castle street under an alert above 0
   (lands in the courtyard by `to-street`). `src/sim/systems/defeat-*.ts`:
   - **Seize:** a played hero is flattened in a place that is on, and a
     standing body of the place's side can reach them: he stands over them
     for the beat. A played body's hit on him cancels it (a bandit's stray
     hit does not: "bandits flatten each other", `step-7.md:359-362`). With
     nobody able to reach, nothing happens: the hero gets up where they lie,
     as today.
   - **Throw-out:** anything the hero carries or is held by is let go (copy
     `cantina-out.ts:52-59`); a carried prize goes back (`returnPrize`, then
     emit `prize-returned`) **before** the hero leaves the room; then one
     `move` effect to the landing spot and a new world event (suggested
     `thrown-out`: entity, player, from, to; add it to `core-loops.md`'s
     events row in the same push). The hero lands flat and is free when the
     flatten runs out. `// INTENT:` at the code site: there is always a way
     out, the throw is itself the exit, and a place with no landing spot
     throws nobody.
   - **The place keeps its state.** Nothing resets: the post, the waves, the
     alert, found pieces, the roster. A friend inside is untouched. In town,
     guards who saw the hero go follow by the same door under the existing
     chase rules (`chase-cap`, `alert-respond`): add no new pursuit.
   - **Not in the cantina** (D-086): no defeat file for it.
   - **The power** is the powers slice's rule (flattened is a hard hit).
     **Do not write a second drop.** What you add once its push 3 is on
     `main`: two scenarios (below). Until then the power pushes wait and
     everything else here goes ahead.
3. **Push 3, on the page.** `src/client/draw/condition.ts`: fills the
   `condition` slot (fine: empty; hurt; down), the stagger and stars on the
   hero at the edge, and one banner on `thrown-out` and one on
   `prize-returned` through `queueBanner` (keys `risk:<...>`, no digits, words
   as data in the defeat file). The viewer's wear comes from the snapshot's
   copy: one additive accessor in `src/net/client.ts` beside `:186`, passed
   into `render` at `src/client/main.ts:271`, one line in
   `src/client/render.ts`; `drawn.condition` for the checks. Ask the core-loop
   art cut-outs builder (the Sessions section of `docs/current-directive.md`)
   for hurt and down marks at the start of push 2; if none is cut by push 3,
   ship `fx-dizzy` in the slot, logged. Thresholds for "hurt" and "the edge"
   are shares of toughness, in content, measured.
4. **Push 4, the phone.** `scripts/e2e/defeat.ts` and its one call line in
   `scripts/e2e.ts`; the same fact in `check:live` in a private world.

**How it reaches a phone:** the throw is a `move` **effect** (the page takes
the server's copy, acknowledged); `thrown-out` and `prize-returned` are world
**events**; `world.cargo` is already a top-level field; the face reads the
snapshot's copy of the viewer. Nothing new lives only on the player's own
entity.

## Signal

- Scenarios `scenarios/step21-*.json`, real rooms (`placements: true`), each
  with a control watched to fail. `-camp-thrown-out` (beaten mid-wave: in the
  courtyard, the broken post still broken; control: the place off, still
  inside); `-friend-stops-it` (control: no friend; a bandit's hit does not);
  `-prize-goes-back` (carrying the strongbox: on its stand, `prize-returned`,
  never banked; control: `returnPrize` not called, banked on getting up);
  `-friend-keeps-playing` (two heroes, one thrown out: the other still in the
  camp, waves still coming); `-town-thrown-out` (alert above 0: in the
  courtyard, chasers through the same door, after 20 s the alert still up
  while a guard sees the hero; control: alert 0, no throw);
  `-cantina-no-throw`. After powers push 3: `-power-stays-where-you-fell`
  and `-cantina-keeps-power`.
- **`step21-nobody-is-held-*`, the way-out proof, one per case:** beaten
  while carrying, while holding a power (after push 3 of powers), with a
  friend, solo, mid-wave. Each ends with the beaten player's stick moving the
  hero and a verb acting within a bound in ticks that you measure and name
  (the beat plus `flattenTime`, no more). Control: the bound halved fails.
  Also once per roster hero, solo: thrown out of the camp at wave 3 and out
  of the street at alert 3, the hero then gets clear (no blow lands after a
  tick you name).
- `scripts/checks/step21-defeat.ts`, a real server and **two connections**:
  the beaten player's own world is in the landing room and its own reports
  are accepted again after the acknowledgement; the other connection, still
  inside, never moved; cargo gone from both (control: the place off).
- `npm run e2e`, phone page by touch, no fight to win: walk to the camp's
  fighters (past column 20; "a hero at column 15 is never touched",
  `step-21.md:51-52`) and stand; `drawn.condition` goes fine, hurt, down;
  then `drawn.room` is the courtyard and the stick moves the hero (control:
  read before the first blow).
- Screenshots at 844×390 and 390×664: the hurt face, the stagger, the landing,
  a banner; under `docs/plan/step-21-shots/`.

## Traps

- **A prize is banked the moment its carrier is out of the room on their own
  feet** (`heist-cargo.ts:81`). A thrown-out hero gets up in the courtyard:
  put the prize back first, in a system ordered before 607, or defeat becomes
  the best way out of a heist (`core-loops.md:552-554`).
- **Defeat must never end a chase** (`step-21.md:73-74`): land in the open
  courtyard, never a hidden room; the alert is not lowered.
- **Stun-lock.** Step 18's slice B (`docs/plan/step-18.md:352-365`) is not
  built and is not yours: its three rules live in `fight-*`. You need none of
  it to start: no blow lands on a flattened hero already, and the throw takes
  the hero out of the crowd. But harder fighters make a corner worse. Push
  1's "longest stretch with no control" is the test: if any tuning you choose
  leaves a hero unable to get away, choose weaker tuning, and report the
  measurement (slice B is briefed "on a measurement of a hero who cannot get
  away"). If a thrown-out hero is hit again before they can move, move the
  landing spot (data), do not add a grace rule.
- **A page runs the sim too.** Its world holds only its own hero: a rule that
  needs a bandit's reach runs on the server's world only; write no top-level
  field from a page (`cantina-chase.ts:19-21`, its `INTENT:`).
- **Read new fields with a default;** a kept game holds worlds saved before
  them, perhaps mid-seize (`docs/mechanisms/saves.md`).
- **No digits, no bar, no hearts** in anything drawn (`t-no-numbers`; D-020).
  Stop test servers by PID. If live is healthy on an older commit after a
  push, wait, don't revert. `git pull --rebase` before each push.
- **e2e facts `h1`/`h2`, `cantina-row` and the friend-throw facts fail some of
  the time on `main` today** (`handoff-prompts/step-5-e2e-flakes.md`, a98c7f6:
  4 of 10 runs). Re-run and report which failed; never loosen a check.

## Yours, and not yours

**Yours** (`step-21.md`, "Owns"): new `content/defeat/**`,
`src/content/kinds/defeat.ts`, `src/sim/systems/defeat-*.ts`,
`src/client/draw/condition.ts`, `scenarios/step21-*.json`,
`scripts/checks/step21-*.ts`, `scripts/e2e/defeat.ts`, new facts in
`src/scenarios/facts/`; additive lines in `src/sim/types.ts`,
`src/net/client.ts`, `src/client/main.ts`, `src/client/render.ts`,
`scripts/e2e.ts`, `scripts/lib/registries.ts` (one directory).

**Must not touch; ask the owner by message, with your measurement.** The
waves slice (`loop-waves.md`): `content/outposts/outpost.json`, `outpost-*`,
`hall-*`, `step7-*`, `step12-*`, and the `outpost-fighter` numbers. The town's
tiers (`loop-town-tiers.md`): `content/dispatch/**`, `alert-*`, `npc-*`,
`src/client/draw/alert.ts`, `step4-*`, the `guard` numbers. Powers
(`loop-powers.md`): `power-*`, `src/sim/powers.ts`, `power-orbs.ts`,
`content/powers/**`. Heists: `heist-*`, `src/sim/heist.ts` (call
`returnPrize`), `draw/banner.ts`, `draw/hud.ts` (call their exports). Step
18: `fight-*`. Step 16: the depot, `heavy-fighter`, `step16-*`. Step 20:
`machine-*`. Puzzles: the undercroft and courtyard room files. The hero
sections of `content/tuning.json` (Step 2). If any other step's scenario goes
red, stop and report.

**Out of scope:** the depot's defeat file (ask the Step 16 lead after push
2); wear that heals over time; hearts; a seize by guards in rooms other than
the street; riders of the wagon; losing found pieces or recruits; anything of
slice B.

## Decided, and open

Decided by the owner: the D-numbers above; getting caught opens play; there
is always a way out; impact over numbers; solo is never locked out; NPCs are
scripted. `DRAFT:`, yours to log: that you are thrown out at all, the beat,
who can seize and what cancels it, each landing spot, the three faces and
their thresholds, the words, the tuning that makes a beating possible, no
loss in the cantina, a found piece never lost. Nothing waits on the owner.
For the owner to judge by playing, not asked: does being thrown out sting
enough, or too much; do you see it coming; is a face the right sign.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed to
`main`; `npm run check:deployed`, `npm run check:live`; `/debug/errors` read.
A new `docs/mechanisms/defeat.md` and its index line; an entry and table row
in `docs/deliberate-designs.md` (the throw is the way out); a Step 21 row in
`docs/architecture.md`, "Which paths each plan step owns"; decisions-log
entries; `docs/plan/core-loops.md` section 7 and its table updated to what
landed. A blocking question goes to the orchestrator by message and to
`docs/questions-inbox.md`; a flag to `docs/for-the-orchestrator.md`. Final
message: done or blocked, the commit.
