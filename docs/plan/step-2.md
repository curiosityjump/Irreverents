# Step 2 — Moving, hitting, grabbing and throwing

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-020), via `docs/vision.md`:**
> Spectacular IMPACT is a top priority: suplexes, launches, heavy collision, knockback into walls/other enemies, and roadblock crashes.

**Owner (Drive, doc 01):**
> Irreverents should feel like a Kirby or LEGO Star Wars-style 2D action-adventure: superb movement, readable enemies, secrets, powers, co-op puzzles, stealth, explosive fights and interesting geography.

The library's first build gate (doc 24, gate A): "movement + jump + attack +
grab/throw are joyful in a graybox test; 3 character abilities are
distinct." This is the part of the game the owner and their brother-in-law
will have in their hands every second of the morning.

## Goal

In the graybox room, by touch on an iPhone and by keys on a computer, a
player can run, jump, attack, grab, carry and throw: objects, enemies and
the other player. What is hit or thrown flies, slams into walls and into
other things, and the screen shows it (a held beat on impact, shake,
dust), with no damage numbers. Three kinds of character play differently,
and a player can switch between them.

## What's decided

- **Impact is physical, never a number on screen** (`docs/vision.md`,
  "What it is not": "Do not simplify combat down to damage numbers;
  collision force and consequence are essential").
- **Three character functions, as placeholders:** a grappler, a tiny
  infiltrator and a flyer (doc 24's "illustrative" list: "names/art not
  committed"). In use, not canon (D-096): `DRAFT:`, ids chosen so the art
  and names can change without renaming an id.
- **One shared party** (D-012, D-013). The party is a short list of
  member characters (tonight three, one of each function; the count is
  `DRAFT:`, O-003 is open). Each player controls one member. The
  library's confirmed rules (doc 05): "A character cannot be controlled
  by two humans at once. Unoccupied members are candidates for
  switching." So a switch goes only to a member nobody is playing, a solo
  player switches among all of them, and nobody is ever moved off their
  character by someone else (doc 06: "without involuntary takeovers").
  Swapping with a member a friend is playing is "a sensible proposal but
  not approved" (doc 05): don't build it. What happens to members nobody
  is playing (they vanish, stand where left, or follow) is open: tonight
  the switch happens in place and unplayed members are not in the world;
  `DRAFT:`, log it.
- **Players can grab and throw each other** (`DRAFT:`; our choice, in
  use under D-096, not the owner's decision: the library says nothing on
  players handling or hitting each other outside the cantina. Offered in
  the spirit of the Rule of Cool, D-053; it is in `docs/decisions-log.md`
  and on the taste list). Tonight's rule, each a line in the tuning file
  so the other answer is a small change: a friend's grab or throw moves
  you and does not hurt you; a friend's attack neither hurts nor launches
  you. **There is always a way out** (`INTENT:`): a held player can break
  free at once, and is let go by itself after a moment.
- **A player can be moved by something that is not their own device:** an
  enemy's hit, a friend's hold or throw. Step 1's netcode carries that
  for you as *effects* on the player (`docs/plan/step-1.md`, "The netcode
  must let the world move a player"): in the simulation you emit the
  effect, and you write no network code. If what you need is not there
  when you reach it, tell Step 1's lead rather than adding it yourself.
- **Being beaten never ends the game** (`DRAFT:`). The library leaves
  what defeat costs open (O-006) and gives one direction (S-007): "avoid
  hard game-over for ordinary experimentation". Tonight: a flattened
  character is out for a few seconds, then back in play close by; no
  "game over" screen, no restart of the room. The wait and the come-back
  place are numbers in the tuning file. This is not the cantina's endless
  instant respawn (its own exception, D-085, D-086), and it must stay
  possible to make a last stand losable later.
- **Tuning is data:** every speed, height, force and timing in one data
  file a non-programmer could edit.
- **An action is not finished until a phone can press it** (D-093).
  Actions are entries in the abstract action list Step 1 created
  (`content/actions/`); the keyboard and the touch layer both read that
  list, and Step 1's touch layer (its second gate, about 06:30 UTC) shows
  a control for every action there without being told. Once it has
  landed, add to `npm run e2e`, on the phone-sized page, one touch per
  action you added and see the character do it (control: an action the
  layer does not show fails). If the layer does not show yours unaided,
  tell Step 1's lead the same hour; do not leave it for Step 5. Keep the count
  small: "a small reusable set of context-sensitive controls, not a dozen
  tiny virtual buttons" (doc 33). The controls themselves are open in the
  library (D-095), so the mapping is `DRAFT:`: for example one action
  button that attacks on a tap, grabs on a hold, and throws when holding
  something. Whatever the mapping, a player standing next to a grabbable
  enemy or a friend can still choose to hit rather than grab, and a
  scenario proves it.

## How to cut it (a suggestion, not a rule)

Two slices that touch different parts and can run at once under one
lead: **the body** (running and jumping with the usual platformer
forgiveness, the three character functions, switching, getting unstuck)
and **the hit** (attack, grab, carry, throw, knockback, slamming into
walls and each other, the held beat). The hit can be built against
plain dummies; it does not need Step 4's people. If the night runs
short: never cut attack and grab/throw; the flyer is the first thing to
leave for later.

## What's open (the lead's to measure and decide)

- Exactly which moves each character has, within the library's rules:
  read `docs/design-library/02-gameplay-systems/05-characters-roster-parties-and-acquired-powers.md`,
  `06-online-co-op-and-creative-combination-rules.md` and
  `08-combat-impact-destruction-and-vehicles.md` (same folder), and the
  register (`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`).
- Acquired powers: in scope here only if the three characters and
  grab/throw are solid first; otherwise say so and it becomes its own
  step. If built: a power is taken from an enemy or picked up from the
  map (D-009) and sits on top of the character's own moves; a hit can
  knock it loose (D-081) as something lying in the room to grab back,
  never silently deleted (library doc 30,
  `docs/design-library/05-world-and-game-expansion-proposals/30-rare-powers-recoverable-drops-and-return-expeditions.md`).
  Everything else is open (O-005): how many at once, dropping on purpose,
  passing to a friend, keeping it through a switch or a defeat. Pick one
  power at a time and the simplest of the rest, `DRAFT:`.

## Feedback signal

Scenario scripts in `npm run check`, each with a control watched to fail,
named `step2-*.json` and tagged `"gate": "A"`. **One tagged scenario
passing is not gate A:** `npm run gates` calls a gate passing as soon as
any tagged scenario exists and none fails, so gate A counts for this step
only when its line lists a scenario for each of signals 1–5. Write that
list under Measure.
1. A thrown object that hits an enemy sends both flying (speeds over a
   stated threshold) and records an impact.
2. An enemy knocked into a wall records a wall impact and the held beat.
   And an enemy thrown or knocked into a second enemy sends the second
   flying too, with an impact recorded for each (D-020 names "knockback
   into walls/other enemies"; control: with body-to-body impact switched
   off, it fails).
3. For each of the three characters, one thing it can do that the other
   two cannot (three scenarios, each failing with the wrong character).
4. A player switches character and the other player sees the switch.
5. Two players: A picks up B and throws B; B flies; B can break free
   while held. Prove it headless first (two players in one simulation,
   `npm run check`); the both-screens version needs `npm run e2e`, which
   lands with Step 1's second gate (about 06:30 UTC), so add it then.
6. What the page drew during a scripted fight contains no number over a
   hit (read from the page's own record of what it drew; control: a test
   build that draws one fails). Looking at the screenshot as well is your
   rung 5, not this signal.

## Stopping condition

The six signals pass on `main` and live (`/healthz` at your commit, `npm
run check:deployed` exits 0 with your code in what is running), the three characters and the tuning file are
described in `docs/architecture.md`'s "I need to add…" table, and the
taste list below is in your closing report. **Budget:** closed by about
08:45 UTC, 2026-11-23; report what is in the way if it will slip.

## Owns

The player's movement and actions, combat and impact, the characters'
data, the tuning data and throwable objects; exact paths as
`docs/architecture.md` assigns them ("Which paths each plan step owns"). Not the touch layout (Step 5), not rooms (Step 3), not NPC moods
(Step 4): an enemy here is a body to hit and throw.


**Every body is Step 2's, player or not** (added 2026-11-23 04:35 UTC,
from the plan review): how it runs, is hit, held, thrown and knocked
out, and the events that say so. Step 4 never moves a body itself: its
systems decide what a person wants and hand that body the same input a
player's device would (walk left, attack), and its rules read Step 2's
events. The two leads write the event names into `docs/architecture.md`
(hit, grabbed, thrown, impact, knocked out, recovered; each says who did
it to whom) before the code that depends on them. Step 4's made-up test
events use exactly those names, so swapping in the real ones is a
deletion.

**Four files are shared between steps** (`docs/architecture.md`, "Files
two steps must both touch"): `src/sim/types.ts`,
`src/sim/systems/physics.ts`, `src/client/render.ts` (Step 1 is in it
until its Gate 2 lands) and `content/tuning.json`. In those: additive
edits only, keep each one small, `git pull --rebase` right before
pushing, and re-run `npm run check` after the rebase. That table of
owned paths was written by Step 1 before any other lead existed; if it
is wrong for your step, fix it there and tell the orchestrator.

## Taste, for the owner in the morning

Whether running and jumping feel superb; whether a throw makes them say
"OHH!"; whether the three characters feel different enough; the placeholder
character functions themselves. Don't grade these; list them.

Worth building once the signals are green, because it turns the owner's
taste into numbers without a session in between: a tuning panel on the
phone (behind `?tune` in the address) with sliders for the feel numbers
and a "copy these values" button.

**Built (2026-11-23):** open the game with `?tune` in the address (e.g.
`https://irreverents-production.up.railway.app/?tune`), tap **Tune** at
the top left, and change any number; everyone in your world feels it at
once, until the next restart. To send the numbers back, tap **Copy** and
paste what it gives into any session with "make these the defaults"
(`docs/mechanisms/tuning-panel.md`).

**Worth asking the owner after they play (from the feel worker):** how long
the freeze should be at the top end (8–9 frames for a full-speed impact);
whether the floor bounce is too lively (45%); whether the flyer's slow fall
(170 px/s) is floaty-good or floaty-annoying; whether the grappler's 0.1 s
wind-up feels heavy or laggy on a phone. Each is a dial on the panel.

**What to try, and which number changes it (feel, 2026-11-23).** Each
is per hero on the panel unless it says world.
- *A jump feels floaty or heavy:* `apexGravity` (under 1 = more hang at
  the top) and `apexSpeed` (how wide the top is); `fallGravity` (over 1
  = drops faster than it rose); `fallSpeed` (fastest fall).
- *A short hop is too short or too tall:* `jumpCutMultiplier`.
- *Running feels icy or sticky:* `runAccel` (start), `runDecel` (stop),
  `airAccel` / `airDecel` (steering in the air).
- *Missed a jump off an edge, or a jump pressed early was lost:*
  `coyoteTime`, `jumpBufferTime`.
- *A punch feels slow or limp:* `attackWindup` (draw-back), then
  `attackStrikeTime`, `attackRecovery`; `attackStrength` (how far it
  sends).
- *Impacts don't land / freeze too long (world):* `hitBeatTime` to
  `hitBeatMaxTime` for punches, `beatTime` to `beatMaxTime` for walls,
  floors and bodies.
- *Thrown things bounce too much or too little (world):* `floorBounce`,
  `floorBounceSpeed`; `wallBounce` for walls.
- *The three don't feel different enough:* `weight` (how far each flies
  when hit), and the numbers above side by side.

## Measure

Lead `session_017WiGzGRnRoAeW5Ep5iSycV`, 2026-11-23 04:30 UTC, on `main`
at 679e4d3. Each line is from the file named.

- **Only players act; only character kinds have bodies.**
  `src/sim/systems/verbs.ts` skips every entity with `player: null`;
  `src/sim/systems/physics.ts` skips every entity whose `kind` is not in
  `content.characters`. So a crate or a dummy is a character kind with no
  acting verbs, and anything that happens *to* a body is a system.
- **Nothing slows a body that is not a player.** Physics has gravity and
  tile collision and no friction; only `src/sim/verbs/move.ts` changes
  `vx`, and it pulls a player's `vx` to the stick's target at `runDecel`
  1200 px/s² every tick, which would erase a knockback in a few ticks.
- **Physics stops a body at a wall silently**: `vx = 0`, no event
  (`physics.ts`, the sideways block). `landed` is its only event.
- **The speed limit is 960 px/s** (16 px tile × 60 ticks): physics looks
  one tile ahead. `src/sim/check-content.ts` enforces it for `runSpeed`,
  `jumpSpeed` and `maxFallSpeed` only, so every new speed needs its own
  declared range under it. Falling is capped at `maxFallSpeed` 360;
  rising is not capped.
- **A per-character number must be declared by one of that character's
  verbs** (`check-content.ts`: any other name in a tuning set fails as
  "no verb reads this number"). A system cannot declare one.
- **A scenario can only spawn players** (`src/scenarios/run.ts`,
  `simulate`), and facts find bodies by player id
  (`src/scenarios/fact-helpers.ts`, `playerAt`).
- **Nothing puts a non-player into the live world**: `src/client/main.ts`
  calls `createWorld` and `spawnPlayer` and nothing else (the server is
  being written by Step 1's Gate 2 worker).
- **The first jump is 56.9 px high, 3.56 tiles** (`jumpSpeed` 320,
  `gravity` 900: 320² / 1800), so a ledge 5 tiles up is out of reach of a
  plain jump.
- **The library gives the three functions no move list** (docs 05, 08,
  11, 24, 33 read in full by a subagent): "not stated" for flight
  limits, the squeeze rule, carry rules, movement forgiveness, whether
  players' bodies block each other, and defeat outside the cantina. Its
  own examples: "strong-grab can slam an enemy or move a heavy object";
  a team that "would reach high ledges, small crawlspaces, heavy
  objects" (doc 05, illustrative).

## Decided by the lead (all `DRAFT:`, each in `docs/decisions-log.md`)

Shared by both briefs; a brief points here rather than repeating it.

- **Buttons:** `jump` (exists), `attack`, `grab`, `switch`. Attack hits;
  while carrying, attack throws (the stick aims: forward, up, down).
  Grab picks up what is in reach; while carrying, grab sets it down.
  Separate buttons, so hitting instead of grabbing is always possible.
  Held by someone: `jump` breaks free at once.
- **Ids:** character kinds `grappler`, `infiltrator`, `flyer` (the
  function, so names and art can change); `hero` stays, unchanged and
  unused by the party (Step 1's scenarios read it). Bodies: `crate`,
  `crate-heavy`, `dummy`, `dummy-heavy`.
- **What only each can do:** the grappler lifts and throws heavy bodies
  (`crate-heavy`, `dummy-heavy`); the infiltrator's body fits a
  one-tile-high gap; the flyer flaps in the air (a limited number of
  weaker air jumps) and reaches a ledge 5 tiles up.
- **The party** is `content/party.json`, a list of three member ids. A
  new player gets the first member nobody is playing; `switch` cycles to
  the next unplayed member, in place, feet kept, refused when the new
  body would not fit. A fourth player gets a second copy of a member
  rather than being turned away.
- **Bodies pass through each other** unless one is flying from a hit or
  a throw; then it shoves what it meets, by weight.
- **The held beat** is the two bodies of an impact holding still for a
  few ticks before they fly, inside the simulation (so every screen
  sees it and scenarios can read it); shake and dust are drawn from the
  same recorded impact.
- **No damage numbers, but a hidden toughness:** hits and impacts wear a
  body down by how hard they were; at zero it is flattened, out for a
  few seconds, then back near where it fell. Dummies too.
- **Non-player bodies in scenarios and rooms:** scenario field
  `entities`, `content/placements/<room id>.json`, and
  `populateRoom(world, content, roomId)` in `src/sim/world.ts`. Step 2
  lands the minimal shape first (told to the Step 1, 3 and 4 leads,
  04:30 UTC); Step 4 extends placements.
- **Acquired powers are not in this step.** Three characters and
  grab/throw first; powers become their own step (flagged to the
  orchestrator).

## Briefs

- `handoff-prompts/step-2-hit.md`: attack, grab, carry, throw, impact,
  bodies that are not players, the grappler's strength. Worker
  `session_017WiGzHbbov1AymyWrXuvge`, launched 04:32 UTC; due 07:15.
- `handoff-prompts/step-2-body.md`: the three characters, the party,
  switching, the infiltrator's and flyer's own moves. Worker
  `session_017WiGzEqGVmbgjJyorj73iV`, launched 04:32 UTC; due 06:45.

- **Feel round (lead `session_017WiGzGN9egot3JUvSMBBA9`, 2026-11-23 11:44 UTC):**
  `handoff-prompts/step-2-feel-sim.md` (movement shaping, attack phases,
  hit weight, floor bounce, states the renderer needs) and
  `handoff-prompts/step-2-feel-dials.md` (the `?tune` panel, reaching the
  server), two workers at once. Measured at d2459f0: coyote time, jump
  buffer and variable height exist with no scenario proving them;
  gravity is world-only; the attack lands on the press tick; the held
  beat is fixed; floors do not bounce; the page runs its own movement
  and the server runs hits, so a dial has to reach the server.
  Workers: sim `session_017WiGzEuk7zACZWPXaqAcBQ`, dials
  `session_017WiGzFne2AqHYRKtZMwgRq`, launched 11:44 UTC.

- `handoff-prompts/step-2-touch-and-two-screens.md`: the touch check
  and the both-screens throw, released by the orchestrator at 08:42
  UTC after Step 1's Gate 2 went live at 4678680. One worker; due
  10:15 UTC.

## Open with the owner

## Feel, from 2026-11-23 (what this step is reopened for)

**Owner, 2026-11-23 ~10:05 UTC, to Vision Partner, first-hand, after
playing the first morning build** (`docs/vision.md`, "The measure"):
> The game looks awful. Make sure it stays on track. I want to be playing something that looks, sounds, and feels as good as kirby and the amazing mirror, but with all the decisions in the vision, by tomorrow. LONG way to go currently.

The look and the sound are Step 8's, running now. **How it feels in the
hands is this step's**, and it comes before any new system
(`docs/current-directive.md`). The scripted signals above are met; what
they cannot say is whether running, jumping, hitting and throwing feel
good. That is the owner's to judge, so the job here is two things: make
the feel as good as a careful platformer's by the known craft, and put
the dials in the owner's hands.

**Goal.** By the owner's morning of 2026-11-24, on an iPhone held either
way: movement answers the thumb at once and lands where the player
meant; a jump can be short or long; hits and throws carry weight (the
library's "OHHHHH" of physical impact, D-020: impact, not numbers); the
three party members feel different to move, not only different in what
they can do; and the owner can change any of it from the phone while
playing.

**What that means, as things to build (all numbers are data in
`content/tuning.json`, declared by their reader):**
- *Moving:* quick acceleration and a short stop rather than instant or
  icy; air control; a jump whose height follows how long the button is
  held; a few ticks of grace after walking off a ledge and a few ticks of
  memory for a jump pressed just before landing; a little hang at the top
  and a faster fall; no stick on landing. The flyer floats and flaps; the
  infiltrator is the quickest and lightest; the grappler is heavy and
  hits hardest.
- *Hitting and throwing:* an attack with a short wind-up, a strike and a
  recovery; the held beat on impact scaled to how hard the hit was;
  knockback in an arc, a bounce off walls and floors, bodies that tumble
  into each other; a throw that follows the stick and feels heavy for
  heavy things.
- *Telling the picture:* Step 8's renderer draws from what the
  simulation says. Its actors lane lists, in
  `docs/mechanisms/rendering-actors.md` under "Flags for the lead", every
  state it could not tell from the world (an attack's phase, the tick of
  a landing or a hit, being stunned). Expose those, additively.
- *The dials:* the `?tune` panel this step already owes: every feel
  number adjustable on the phone while playing, per character, with a way
  to copy the changed numbers out so they can be made the default. A
  question about feel that comes back unanswerable is answered by
  handing over the dial.

**Feedback signal** (each a scenario in `npm run check` with a control
watched to fail, named `step2-feel-*`): ticks from a press to most of top
speed, and from release to a stop, inside stated bounds; a tap jump
measurably lower than a held one; a jump still granted a few ticks after
leaving a ledge, and refused after the grace; a jump pressed just before
landing still happens; the held beat longer for a harder hit; a thrown
body bounces rather than stops dead; each party member's top speed, jump
height and weight differ by stated margins. `npm run e2e` proves the
panel changes a number on a phone-sized page and that play follows it.
None of this says it feels good: that is the owner's, with the panel.

**Stopping condition.** Those scenarios pass on `main` and live, the
panel works by touch on both holds, and a short list of what to try and
which dial changes it is in the closing report. Budget: the owner's
morning of 2026-11-24 (about 11:00 UTC). Report what is in the way if it
will slip.

**Decided.** Feel before new systems (the owner, above). Numbers are data
and `DRAFT:`. Nothing copied from another game: its feel is the bar, the
numbers are ours to find. **Not this step's:** the camera
(`src/client/draw/room.ts`, Step 8's world lane, until its round 1 has
landed; then ask the orchestrator), anything in `src/client/draw/`, the
touch layout (Step 8's shell lane today).

**While Step 8's lanes are landing** (nine of them push to `main` through
the day; `docs/plan/step-8.md`, "The look"): pull before every push and
run `npm run e2e` after every pull; a change of movement numbers can move
what the scripted touch play does, and that is yours to keep green.

**Also still owed here, after feel:** the switch gap (two players can
become the same hero; the fix is in the network layer), the no-number
check from the page's own record (signal 6), and `docs/architecture.md`'s
rows re-read. See the handoff notes below.

## Handoff notes

*(Newest last.)*

- **Lead `session_017WiGzGRnRoAeW5Ep5iSycV`, 04:33 UTC.** Claimed,
  measured, decided (above), two workers running at once. The Step 1, 3
  and 4 leads were told the shared shapes by message. Next: when each
  worker's first push lands, re-run it; ask the Step 1 lead to call
  `populateRoom` and to stop passing a character to `spawnPlayer`;
  review each slice by re-running with a control of my own; then a
  third brief (the `?tune` panel, both-screens checks once `npm run
  e2e` exists). Not yet asked of anyone: the exact effect events Step
  1's netcode delivers (asked of its lead, no answer yet).

- **Lead, 04:47 UTC: the body slice reviewed at 75da7ee and closed;
  worker archived, brief deleted by it.** Re-run by the lead: build,
  check (all scenarios), and three controls each failing the right
  scenario (flyer `flaps` 0; infiltrator box 26 px tall; the "nobody
  else is playing it" test removed from `switch.ts`). Twelve
  scenarios, renamed by the lead to `step2-body-*`. For signal 3:
  `step2-body-infiltrator-fits-gap` (+ `-grappler-stopped-by-gap`,
  `-flyer-stopped-by-gap`), `step2-body-flyer-reaches-ledge` (+
  `-grappler-misses-ledge`, `-infiltrator-misses-ledge`); the
  grappler's third is the hit worker's. For signal 4:
  `step2-body-switch-two-players`, `-switch-solo`,
  `-switch-refused-in-gap`, `-spawn-different-members`. **Not verified
  by the lead:** the worker's screenshot of the three side by side; a
  held player's refused switch (no scenario can hold a player yet;
  handed to the hit brief); anything on the live page, where a player
  is still `hero` until Step 1's page stops naming a character (its
  lead has the call). **Gate A is not passing yet** whatever `npm run
  gates` prints: signals 1, 2 and 5 have no scenario. Record: mechanism
  `docs/mechanisms/party-and-switching.md`. One question filed in
  `docs/questions-inbox.md` (a friend taking the hero you need).

- **Lead, 08:45 UTC: the hit slice reviewed at b79ad96; worker's brief
  deleted by it.** (Every session was stopped by the account's usage
  limit from about 04:58 to 08:20 UTC; nothing of Step 2 was lost, both
  workers had pushed.) Re-run by the lead: build, check, gates. Five
  controls of the lead's own: `wallImpactSpeed` 900 and `maxLaunchSpeed`
  30 each failed the impact scenarios; `c.input` ignored failed the
  non-player ones (and Step 4's); `holdPlayerTime` 0.05 was refused by
  the validator; **removing the "cannot act while flying, held or
  flattened" rule from `verbs.ts` failed nothing**, so the lead added
  `step2-hit-thrown-cannot-steer` (fails with the rule removed: a thrown
  player steering back drops from 500 to 207 px/s). Looked at on the
  built page at phone size: the grappler lifts a crate, throws it into a
  dummy, the dummy shoves the next, dust at the contact, no number or
  bar, no page errors.
  **Signals, by scenario** (21 `step2-hit-*`, 12 `step2-body-*`):
  1 `step2-hit-throw-crate-at-dummy`; 2 `step2-hit-dummy-into-wall`,
  `step2-hit-dummy-into-dummy`; 3 `step2-body-infiltrator-fits-gap`,
  `step2-body-flyer-reaches-ledge`, `step2-hit-grappler-lifts-heavy`
  (each with its two "the others cannot"); 4 `step2-body-switch-two-players`;
  5 `step2-hit-throw-friend`, `step2-hit-break-free`,
  `step2-hit-held-let-go` (headless); also `step2-hit-not-grab`. So
  **gate A's scripted side is met for signals 1 to 5, headless.**
  **Not verified:** an independent break-it review was cut off by the
  usage limit and reported nothing (chains of holds, a body under a low
  ceiling, repeated impacts and summed speeds are checked only by the
  worker's own scenarios); anything across two devices; touch; signal 6
  as a script. **Not live for a player yet:** the page still seats
  everyone as `hero`, who cannot hit, grab or switch
  (`src/client/main.ts` passes a character; Step 1's, asked 04:52 and
  again 08:45).
  **Still open in this step** (held until Step 1's Gate 2 is live, by
  the orchestrator's 08:30 instruction): one touch per new action in
  `npm run e2e`; the no-number check from the page's own record; the
  both-screens throw; the `?tune` panel; `docs/architecture.md`'s
  "I need to add…" rows re-read against what landed. Records:
  `docs/mechanisms/combat-and-impact.md`,
  `docs/mechanisms/party-and-switching.md`. Taste list for the owner is
  in the first and in "Taste, for the owner in the morning" above.

- **Lead, 09:20 UTC: the touch and both-screens checks reviewed at
  306ed82; worker archived, brief deleted by it.** Re-run by the lead:
  build, check, and the whole `npm run e2e` (13 new facts `t-*` / `s-*`
  in `scripts/lib/e2e-touch.ts`, all ok); control: `E2E_TOUCH_BREAK=grab`
  failed six of them. **Proven on two phone-sized pages by touch, read
  from what each page drew:** grab a crate, carry, throw, hit a body
  away, switch; grab a friend, the friend breaks free with Jump, grab
  again and throw them; the second page sees each, and a thrown player
  flies on their own page and walks again after. **Known gaps:**
  (1) `switch` can land on a hero a friend is playing (printed `todo
  (t-switch-free)` on every e2e run): the page decides the switch and
  holds only its own character (`docs/mechanisms/network.md`, "Who owns
  which part"); the fix is in the network layer, Step 5's now. (2) A
  friend thrown out through a doorway vanishes from the thrower's
  screen at once (they change room); a drawing question, not chased.
  (3) "Hits a dummy" is proven as "hits a crate": the start room is the
  throne room and has no dummy. **Not verified:** a real iPhone or
  Safari; the live address (`check:live` does not run these facts);
  feel. At the brief's commit nothing of the hit worked on the real
  page; Step 1's 2a7fd98 fixed it, no Step 2 file changed.
  **Left in this step:** the switch gap above; signal 6 as a script;
  the `?tune` panel; `docs/architecture.md`'s "I need to add…" rows
  re-read. All held by the orchestrator's lean rule.


- **Lead `session_017WiGzGN9egot3JUvSMBBA9`, 12:25 UTC: the dials slice
  reviewed at dd4f83c; worker archived, brief deleted by it.** Re-run by
  the lead after pulling 98431b0: build, check (incl. new
  `tune-server`), and the whole `npm run e2e` (36 ok, 1 todo: the
  known `t-switch-free`). Control of the lead's own: the server's range
  test removed (`refuseChange`, `src/sim/tuning-rules.ts`) → `tune-server`
  failed with 7 problems; restored. The worker's `scripts/lib/e2e-touch.ts`
  change only exports helpers; no fact weakened. Looked at the panel at
  iPhone size both holds: opens, scrolls, covers no control. **For a
  later pass (`DRAFT:`, not blocking):** numbers are listed
  alphabetically, so the most-felt ones (top speed, jump) are not first;
  sliders across ranges like 0–100000 are coarse. **Not verified by the
  lead:** a real iPhone; the live address (worker's `check:live` and a
  live private-world change only).

- **Lead `session_017WiGzGN9egot3JUvSMBBA9`, 14:20 UTC: the feel-sim
  slice reviewed at 252e5ce (+06a07f4); worker archived, brief deleted
  by it. The feel round is closed** (its stopping condition: scenarios
  green on `main` and live, the panel works by touch both holds, the
  "what to try" list is above). Re-run by the lead: build, check (108
  ok), `npm run e2e` (36 ok, 1 known todo `t-switch-free`),
  `check:deployed` (live at 06a07f4; the 3 live errors are `check:live`'s
  deliberate ones). Control of the lead's own: the floor-bounce line
  removed from `impact-walls.ts` → `step2-feel-thrown-bounces` failed
  (4 problems); restored. Read the re-timed `step2-hit-*` diffs: ticks
  moved, tolerances kept (one x window 2 px wider); `check-content.ts`
  now also caps `fallSpeed` (stricter). **Flags routed:** (1) the
  renderer plays a swing from `c.attack.swung`, now the strike's tick,
  so **the wind-up draws as standing still** until `src/client/draw/`
  reads `c.attack.phase` (Step 8's; sent to the orchestrator). (2) A
  player's own page has no `c.carrying` (grab runs on the server), so
  a throw press predicts a swing, now with a wind-up, on the thrower's
  screen (network layer; sent to the orchestrator). (3) The friend-throw
  e2e now clears the throne room's crates first; a check room with an
  empty floor would be cleaner (Step 3's or 8's to give). (4) **Jump
  heights and the grappler's ground start/stop are unchanged on
  purpose:** Step 3's and Step 4's scenarios are timed on them to the
  tick; the grappler's weight is carried by fall, wind-up, weight and
  slide. A slower ground start needs those scenarios re-timed by their
  owners. **Not verified:** a real iPhone; how any of it feels; nothing
  reads `c.stunned`, `c.landing`, `c.lastHit` etc. in a scenario (they
  are for drawing).

- **Lead `session_017WiGzGN9egot3JUvSMBBA9`, 14:20 UTC: owed, held by the
  orchestrator until Step 8's round 2 lanes land** (usage allowance; it
  will message the lead to brief). In order: **(a)** panel polish: the
  most-felt numbers first (top speed, jump, wind-up, fall), finer steps
  for sliders across huge ranges (0–100000); **(b)** signal 6 as a script:
  no number on screen, from the page's own record; **(c)**
  `docs/architecture.md`'s "I need to add…" rows re-read against what
  landed. (a)+(b) are one worker's brief. Routed elsewhere: the wind-up
  drawn as standing still is Step 8 round 2's renderer lane
  (orchestrator); the thrower's predicted swing and the switch gap are in
  `docs/plan/step-5.md`'s handoff notes. Claim kept.

- **Lead, 14:28 UTC: granted Step 11's lead (`session_017WiGzFy3MD6ecvM7QMvQGd`)**
  an additive edit in Step 2's files for the brawl (D-085): a `c.brawl`
  component set by Step 11's system, read at the friend-share sites in
  `attack.ts`, `impact-walls.ts`, `impact-bodies.ts`. Conditions: the
  existing friend scenarios stay green unchanged; the player-on-player
  `friend` test is kept and only its share is replaced; a non-player hit
  never reads `c.brawl`; new roster characters joining `party.json` means
  re-running the switch scenarios and telling the Step 2 lead first.
