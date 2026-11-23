# Core loop 3, power stealing: knock it out of him, keep it if you can (Step 9)

Brief for one cold builder. Written 2026-11-23 19:40 UTC by the core-loops
re-plan (`docs/plan/core-loops.md`, section 3; read it and its "Names the
slices share" table first). The step is `docs/plan/step-9.md`: read its top
section and "What's decided". Read `docs/mechanisms/combat-and-impact.md`,
`docs/mechanisms/network.md` ("Traps", and how an effect reaches a page),
`docs/mechanisms/party-and-switching.md` and
`docs/mechanisms/art-pipeline.md` ("Approved Drive assets first") before
writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-9.md`, "Builder notes".

**Small pushes, most visible first, each standing alone and fully checked.**
A push to `main` is the deploy.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"): **"I want to play it as I described it.
There are no ... power/item stealing ... no risk. Virtually everything
described in the vision docs that would make the game genuinely fun to play is
yet to be seen at all"**

No power exists in the game. This slice adds two, taken the Kirby way, and
makes them the first thing a player can lose. It moves no row of
`docs/plan.md`'s table; it is read by the owner playing.

The library (doc 11): **D-009** "Abilities and/or weapons can be acquired from
enemies or the map, Kirby-style"; **D-080** very rare ones live in one or few
spots you can return to; **D-081** "taking DAMAGE can KNOCK AN ACQUIRED/STOLEN
POWER LOOSE"; **D-082** possession ends, knowing the source stays valuable;
**D-093** no new button. G-15: one power, several meanings. Doc 30's bouncing
short-lived pickup and source table are PROPOSED; O-005 (which powers, slots,
thresholds) is OPEN: every such choice is a `DRAFT:` you log.

## Measured for you (main at a0f402c; nothing was run in the repository)

- **The first plan's power did nothing for a new player.** Player one is
  given the grappler (`content/party.json`), whose `liftStrength` is already
  150 (heavy crate 120, king 110, heavy fighter 120, brute 140 all lift today)
  and whose throw (`throwStrength` 26000) is already cut off by
  `maxLaunchSpeed` 520. The infiltrator and the flyer lift 60. The throne
  weighs 400 and nobody lifts it. So the common power must be **a boost above
  every hero's own numbers**, and its checks must compare the same hero with
  and without it.
- **A character's numbers are read in four places:**
  `src/sim/systems/verbs.ts:34` (the set handed to every verb),
  `src/sim/systems/verbs.ts:36` (`kind.verbs.includes(verb.id)`: a lent verb
  must pass here), `src/sim/body-state.ts:107` (`bodyNumbers`: weight,
  toughness) and `src/sim/systems/physics.ts:63` (the body's own fall
  numbers). The lift test is `src/sim/verbs/grab.ts:66`, the throw
  `src/sim/verbs/attack.ts:76`, the flap count `src/sim/verbs/flap.ts:63`.
- **`content/tuning.json` accepts only `world` and `characters`**
  (`src/content/kinds/tuning.ts:33`): there is no "powers section". A power's
  numbers live in its own content file, or as world numbers declared by the
  power systems.
- **Wings cannot work on the holder's own phone unless the power travels as an
  effect.** A page simulates its own character from its own `c` and "does not
  get the server's `c` for its own character"
  (`docs/mechanisms/network.md`, "Traps"); the orb and the pedestal are not in
  a page's own world, so the take is decided on the server. Strength would
  still work (grab, lift and throw are resolved on the server's copy); flap is
  the hero's own motion on the page and would not. The `Effect` union is
  `src/sim/effects.ts:14-27`; Step 11 added `become` the same way.
- **Carriers on the main path:** `street-villain` (column 21 of the first
  street screen; no `toughness` of his own, so the world's default 100: three
  grappler hits at `attackWear` 34, six infiltrator hits at 18). Since Step
  18's push 2 (c1b5b54, 608ccef) he swings back about a second after being
  struck and his swing also moves the guard, so that beat is no longer quiet.
  In the quarry: `heavy-fighter` (weight 120, toughness 240) and `brute` (140,
  480).
- **The depot's strongroom** (`content/rooms/quarry-depot.json`, Step 16's):
  hoard at [45, 13], the roof hole at columns 41-42, a step at [39, 12] and a
  shelf at row 11, columns 40-41. Step 16's two zero-alarm routes are
  tick-pinned and walk columns 39-45. A hero who brushes a touch-to-take
  pedestal there gains flap, and every later Jump press in the air changes its
  arc.
- **The pit's ledge** (`content/rooms/quarry-pit.json`, area `out-of-reach`,
  row 8, columns 4-8) is eleven tiles (176 px) over the floor. Step 16 measured the
  flyer's climb at about 110 px (a jump and three flaps), so wings need more
  flaps than the flyer has: measure how many.
- **A cracked wall** breaks to a body arriving sideways at 200 px/s or more
  (`src/sim/systems/room-breakable.ts`).
- **Looks cut for this** (51c8cdb, `content/looks/powers.json`;
  `tools/art/props/README.md`, "Core loops"): `pickup-fire`, `-ice`, `-bolt`,
  `-moon`, `-wing`, `-gear`, `-bomb`, `-star`, `-swirl` (20 by 20);
  `power-fixture-crystal`, `-orrery`, `-tree`, `-shrine`, `-brazier`,
  `-portal` (32 by 32); `fx-pickup-glow`, `fx-pickup-get`, `fx-power-lost`,
  `fx-poof`. The ids name what the plate paints, not a power.
- Step 14 slice A's menu rows are on `main` (`src/client/start.ts:387-388`,
  4022fd6).

## What to build (`DRAFT:` throughout; decisions-log entry "Step 9")

1. **Push 1, a power is data, and the overlay changes nothing by itself.** A
   content kind `content/powers/<id>.json` (`src/content/kinds/powers.ts`):
   a shown name (data, never in an id), an icon look, a numbers overlay, verbs
   it lends, who carries it (placed ids or character kinds), where its sources
   stand (`{ id, room, tile }`), its fade and refill. One helper for a body's
   numbers and verbs with its power applied, used at **all four** read sites.
   Component `c.power`; one additive effect, `{ kind: 'power'; power: string
   | null }`. With no power in the world every existing scenario passes with
   no re-timing.
2. **Push 2, take it from a carrier (the visible one).** A carrier has a small
   glowing orb over them. Laid flat (`flattened`), the orb pops out as a
   bouncing body; a played hero who touches it holds the power
   (`power-taken`, the effect); the carrier has theirs again when they get up.
   The icon goes in the HUD plate's power slot (`src/client/draw/hud.ts`, the
   heist slice's; until it is on `main`, draw the icon by the hero and move it
   over later) and the hero glows. **The common power is a boost:** felt on
   the next Hit or Grab by all three heroes, with numbers above the grappler's
   own (a struck body crosses the screen and goes through a cracked wall; Grab
   lifts the throne). **Decide the first carrier by measuring** against Step
   18's villain: if knocking him flat on the street is a readable beat, him;
   if not, a quarry heavy on the road. Log which and why.
3. **Push 3, lose it.** A hard hit on a holder (laid flat, or sent flying)
   pops the power out as an orb that fades after a few seconds
   (`power-dropped`, the effect with `null`); a light hit does not; anyone may
   grab it. One power per hero.
4. **Push 4, the rare one.** A source on a pedestal in the depot's strongroom,
   placed by your own data: wings (lends `flap`, with enough flaps that any
   hero reaches the pit's ledge from its floor). The pedestal is dark while
   someone holds them and lit again when nobody does. `world.sources`
   (top-level) records a source a hero has touched. **Agree the pedestal's
   tile with the Step 16 lead (the session claiming Step 16 in
   `docs/plan.md`) before the push** (first guess [46, 13], east of the
   hoard, or up on the shelf), and run every `step16-*` scenario with it
   present.
5. **Push 5, where to go back.** A lit mark for each found source on its
   level's menu row (`src/client/start.ts`, an additive edit; the glints slice
   adds a piece row there too: rebase).

**How it reaches a phone:** the power itself is an **effect** (applied on the
holder's own page, acknowledged like `become`); `world.sources` is a top-level
world field; `power-taken` and `power-dropped` are world events; orbs and
pedestals are entities of their room. Kept through Switch, not through leaving
the game (`DRAFT:`, the save rule today).

## Signal

- Scenarios, real rooms, **each control on the same hero**:
  `step9-take-from-carrier` (the carrier laid flat, the orb drops, the hero
  touches it and holds the power; control: carriers off, no orb);
  `step9-boost-lifts-the-throne` (the grappler with it lifts `throne`;
  control: the grappler without it is refused);
  `step9-boost-breaks-the-wall` (a body struck by a boosted infiltrator goes
  through a cracked wall; control: the same blow without it does not);
  `step9-hard-hit-knocks-loose` (a heavy's blow: an orb body appears, the hero
  has none, grabs it back inside the window; control: a keeper's swat does not
  knock it loose); `step9-fades-then-source` (left alone the orb is gone and
  the pedestal is lit again; control: the fade raised past the scenario's
  end); `step9-wings-reach-the-ledge` (a non-flyer with wings enters the pit's
  `out-of-reach` area from the floor; control: without, not).
- `scripts/checks/step9-powers.ts`, a real server and **two connections**:
  after the take the holder's **own** world has the power and the other
  connection sees it on the holder; after a hard hit the holder's own world
  has none (control: the effect not sent, and the holder's own world never has
  it).
- `npm run e2e`, phone pages by touch, deterministic: a non-flyer page that
  took wings rises on a second Jump press on its own page (control: the same
  press without wings does not); the page's drawn record
  (`window.irreverents.drawn`, an additive field) lists the orb over the
  carrier on the first street screen or the road. Leave winning a fight to the
  scenarios. **Until the wings fact is green, wings are script-only: say so.**
- Screenshots at 844×390 and 390×664: the orb over a carrier, the orb on the
  floor, the icon and the glow, the pedestal; under
  `docs/plan/step-9-shots/`.

## Traps

- **Approved Drive assets first** (4ed30c3): use the cut looks above. For
  anything missing (a small icon for the HUD slot, a glow on the hero) ask
  the core-loop art cut-outs builder (its session is on the Sessions line of
  `docs/current-directive.md`) and agree the ids. No hand-drawn final look.
- **Touching a source must change no existing scenario.** Step 16's builder
  is in `content/rooms/quarry-*.json` and `content/placements/quarry-*.json`
  until about 20:40 UTC: edit none of its files.
- **Every `step2-*` (45), `step11-*` (21), `step16-*` (65) and `step18-*` (4)
  scenario stays green** through the read-site change. `check:live`'s
  `fight-back` fact is fragile: a hit-prediction push was reverted over it
  (7908aa8). If your villain work turns it red, fix it or pick the heavy.
- **`power-take` runs on the server's world only**: a page's own world has no
  orb. Check in `docs/mechanisms/network.md` how a non-push effect is applied
  and acknowledged before relying on it.
- **Not lost in the cantina** (`DRAFT:`; D-086 leaves rare gear in a brawl
  OPEN): one data switch from the other answer.
- **Other builders nearby:** the heist slice owns `src/client/draw/hud.ts` and
  `banner.ts`; hit prediction is in `src/client/main.ts`. Yours: new files,
  one line in `src/client/render.ts`, the four read sites, world numbers added
  at the end of `content/tuning.json` (never reorder), one new character kind
  for the orb's body. `git pull --rebase` before each push.
- `t-no-numbers` reads every string drawn: no digits, no timer text.
- **Read new fields with a default** (`c.power` absent, `world.sources ??
  []`): old kept games have neither, and a body saved without the field must
  not set a game aside (`docs/mechanisms/saves.md`).
- Stop test servers by PID. If live is healthy on an older commit after a
  push, wait, don't revert.

## Out of scope

More than two powers; slots, dropping on purpose, passing to a friend; a prize
knocked loose (Step 21 uses your rule); what being beaten costs; the depot's
own data; a new button.

## Decided, and open

Decided by the owner: D-009, D-080, D-081, D-082, D-093. `DRAFT:`, yours to
log: which two powers and their numbers (neutral ids, names as data), the
first carrier, one per hero, what a hard hit is, the fade, carriers regaining
theirs, the source refilling, kept through Switch. Nothing waits on the owner.
For the owner to judge by playing, not asked: whether losing it is a scramble
worth having, and which powers they want next.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed;
`check:deployed`, `check:live`; `/debug/errors` read. A
`docs/mechanisms/powers.md` with its line in `docs/mechanisms/README.md`; the
architecture's "I need to add…" table gains "a power", "a carrier" and "a
source", its effects table the `power` row and its path table a Step 9 row;
decisions-log entries; `docs/plan/core-loops.md` section 3 updated to what
landed. Final message: done or blocked, the commit.
