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
- **Actions are entries in the abstract action list** Step 1 created; the
  touch layout (Step 5) and the keyboard read that list. Keep the count
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
and `npm run gates` reporting gate A as passing:
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
6. Nothing in the screenshots of a fight shows a damage number.

## Stopping condition

The six signals pass on `main` and live (`/healthz` at your commit, `npm
run check:live` still green), the three characters and the tuning file are
described in `docs/architecture.md`'s "I need to add…" table, and the
taste list below is in your closing report. **Budget:** closed by about
08:45 UTC, 2026-11-23; report what is in the way if it will slip.

## Owns

The player's movement and actions, combat and impact, the characters'
data, the tuning data and throwable objects; exact paths as
`docs/architecture.md` assigns them ("Which paths each plan step owns"). Not the touch layout (Step 5), not rooms (Step 3), not NPC moods
(Step 4): an enemy here is a body to hit and throw.


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

## Open with the owner

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
