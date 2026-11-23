# The core loops: what the owner asked to play, and the order it is built in

**Reference.** The map every orchestrator works from after the owner's verdict
of 2026-11-23. Written 2026-11-23 19:40 UTC by a re-plan workflow (plan, two
adversarial checks, this write-up) started by orchestrator
`session_017WiGzHhke4tkAThPgw6EXs`. It ranks eight first playables, one per
loop the owner named, says which are briefed now and which wait, and holds the
names the slices share. The step files hold each step's own text; the briefs
are `handoff-prompts/loop-*.md`. When a playable lands or its plan changes,
edit its section here, never a second copy.

## The owner's verdict

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
the live game on a phone** (`docs/vision.md`, "The measure"):

> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

*(Vision Partner's reading, not the owner's words:)* each core loop must be
**playable start to payoff on a phone** and **findable without being told**.
What exists only as a script does not count. The library (docs 02, 05-09,
21-31) is the spec, not new invention; its labels are literal (PROPOSED,
EXAMPLE and OPEN are not decisions; the D-numbers of doc 11 are).

## The principle

The owner did not say systems are missing; they said they could not play them.
Read together, the eight complaints have one cause on the live game: **nothing
can be gained, shown, kept or lost.** A taken thing vanishes
(`src/sim/systems/npc-interact.ts:58` only sets `takenBy`), every secret is an
empty room, no hero or power exists to find, an alarm brings one slow guard,
and being beaten is a three-second nap (`flattenTime` 3). Three rules order
everything below.

1. **Pay-off before mechanism.** First the small spine of things a player
   gains and sees (a found piece, a held power, a freed hero, a hung legend)
   and things they can lose (the power, the prize in their hands, their
   place), put at the ends of routes that already exist, before any new room.
2. **Lure before secret.** Each loop starts from something a phone player sees
   on the way they already walk, within two rooms of the start: a glint over
   the awning and a special good on the shop's shelf on the first street
   screen, an orb over a carrier, the Use button naming what it will do, a
   caged hero and a strongbox in the Bandit Camp. The quarry's depot is the
   deep version of the same loops.
3. **Places over demos.** Three real places carry all eight loops: the castle
   town (street, undercroft, courtyard gate, the Hall behind it), the Bandit
   Camp and the depot (built on Step 16, never duplicated).

The library is the spec: each playable cites its D-numbers; what the library
leaves OPEN or PROPOSED is a logged `DRAFT:` built so the other answer is a
data change. No `INTENT:` is removed: hidden doors stay drawn as wall, people
can still be outrun and jumped over, nothing resets; lures are added beside
them. Getting caught or beaten always leaves the player moving in a world that
kept its state (D-019), never at a reload.

**What was measured, and what was not.** The plan was read from content and
code (main at ffb21ac, re-read for this write-up at a0f402c). Its second check
ran throwaway scenarios in a scratch copy at ab3ecb1; those numbers are marked
"measured". Every other column, sight line and timing is the builder's to
measure first.

## The ranking

| | Loop | First playable | Step | Status (2026-11-23 19:40 UTC) |
|---|---|---|---|---|
| 1 | Hidden places | Glints: pieces you can see before you can reach them | 14, slice B | **Briefed:** `handoff-prompts/loop-glints.md` |
| 2 | Heists and stealth | A job you can read: the Use button's word, sight you can see, a prize in your hands, "nobody noticed" | 19 (new) | **Briefed:** `handoff-prompts/loop-heist.md` (its push 1 unblocks 4 and 6) |
| 3 | Power and item stealing | Knock it out of him, keep it if you can | 9 | **Briefed:** `handoff-prompts/loop-powers.md` |
| 4 | Characters to unlock | Someone in the cage | 13 (the reserved number) | **Briefed:** `handoff-prompts/loop-rescue.md`. **Spawn it when `loop-heist.md`'s push 1 is on `main`.** |
| 5 | Escalating combat and chases | Waves that really come, and a last stand the Hall remembers | 7, slice B | **Briefed:** `handoff-prompts/loop-waves.md`. The Hall's lasting store and the town's tiers (Step 4) wait. |
| 6 | Vehicle hijacking | The bandits' ram wagon | 20 (new) | **Waits** (two builders, after 2's push 1 and 5's push 1; never beside 4 in the camp's files) |
| 7 | Risk | Beaten means thrown out, and you can see it coming | 21 (new) | **Waits** (needs 2's cargo, 3's knock-loose, the party plate) |
| 8 | Puzzles | The Hall's gate and the counterweight | 3, a new slice | **Waits** (after 1; one builder at a time in the undercroft's room file) |

Why these five first: together they put a gain on the first street screen (a
glint, a special good that pays when taken, the Use button's word, an orb), a
rescue and a prize behind the first level entrance, waves that arrive in an
ordinary fight, and a piece, wings and a hung legend at the depot. That is a
start-to-payoff experience for six of the eight complaints; the visible half
of the puzzles (the gate's piece behind its bars, the vault's behind its
cracked wall) arrives with playable 1. Not in this plan because they close
none of the eight: Step 6 slice B, Step 10, Step 15, shop interiors.

## The order to start them in

1. **The core-loop cut-outs are on `main` and reviewed** (a0f402c): rides
   (68b2e1d), power pickups, loose items, fixtures and their effects
   (51c8cdb), chests, barred doors, gold and the hoard (316e0a0), 38 Hall
   pieces (749fe33); `tools/art/props/README.md`, "Core loops", lists every
   id. Their builder stays open for look requests (the Sessions line of
   `docs/current-directive.md`). Still to ask it for: grey and gold puzzle
   pieces for the found row, and later the barricade and a wagon with no
   rider (the sheet's rider is baked in; a revision is requested, a42b7e6).
2. **Spawn now:** `loop-glints.md`, `loop-heist.md`, `loop-powers.md`,
   `loop-waves.md`. Their first pushes touch no file in common.
3. **`loop-heist.md` push 1 (the Use arbiter) and push 2 (the shared banner
   queue and the HUD plate)** land before anyone else draws a banner or a
   top-left icon. Until they are on `main` the other three do their sim pushes
   and their in-world drawing.
4. **Spawn `loop-rescue.md` when the Use arbiter is on `main`**
   (`git log --oneline -- src/sim/use.ts`). Its FREE is one entry in that
   list.
5. **If the weekly limit is at warning** (`docs/current-directive.md`, "Rules
   in force now"), start 1 to 3 of the ranking and add the others as running
   builders report done. Each new builder replaces a finished one.
6. **First free slot:** vehicles (two builders). Then risk, the town's tiers,
   the Hall's lasting store, puzzles.

**Never together:** the rescue and the vehicles slices (the same camp files
and each other's tick-pinned scenarios).

## Names the slices share (the contract; additive only)

Builders work in parallel, so these names are fixed here. A builder who needs
a different shape messages the other owner and edits this table in the same
push. All are `DRAFT:`.

| Name | What it is | Written by | Read by |
|---|---|---|---|
| `world.found` | top-level world field: by level id, the piece ids found | glints | the entrance sign and menu row, puzzles |
| `world.banked` | top-level: prize thing ids a hero carried out of their place | heist | glints (`from: { "prize": id }`), waves (the stealth legend) |
| `world.cargo` | top-level: hero entity id to the prize thing it carries now | heist | the HUD plate, powers (a hard hit may drop it), risk (a throw-out puts it back) |
| `world.jobs` | top-level: by heist id, `{ from, seen }`, the job in progress (server only) | heist | the waves slice's detector may read `seen` |
| `world.roster` | top-level: the character ids unlocked in this game; absent means every roster character (today's behaviour) | rescue | `cantina-regulars`, the swap row |
| `world.sources` | top-level: power source ids a hero has found | powers | the menu row |
| effect `power` | `{ kind: 'power'; power: string \| null }` in `src/sim/effects.ts`: the holder's own page gains or loses it | powers | the page's own verbs and HUD |
| events | `piece-found`, `place-found`, `set-complete` (glints); `prize-taken`, `prize-banked`, `clean-getaway`, `prize-returned` (heist; Step 21 emits the last, after `returnPrize`; an unseen deed is already the `deed` event with no `witnesses`); `power-taken`, `power-dropped` (powers); `recruited` (rescue); `hall-legend` (waves) | their slice | banners, the detector |
| `src/sim/use.ts`, `src/sim/use/*.ts` | the one place that decides what a press of Use does here and the word the button shows | heist, push 1 | rescue (`free`), vehicles (`get-in`): one new file each |
| `content/prompts.json` | the Use button's words, by entry | heist | one added row per later entry |
| `src/client/draw/banner.ts` | one queue for the two-second banners at the top; one at a time, none over the controls | heist, push 2 | glints, powers, rescue, waves: each adds an entry from its own draw file |
| `src/client/draw/hud.ts` | the top-left plate: the party's faces, with slots beside the viewer's face (power, cargo, condition) | heist, push 2 | powers, rescue, risk |

**How state reaches a phone** (`docs/mechanisms/network.md`, "Traps"): a page
does not get the server's `c` for its own character; a page is sent only the
entities of its own room (`src/server/game.ts:527`); and the server sees no
`changed-room` event for a player (`src/sim/systems/level-explore.ts`, its
`INTENT:`). So anything the holder's own phone must show or use travels as a
**top-level world field** (copied by key in every snapshot), an **effect**
(applied on the holder's page), or a world **event** (`snap.ev`), never as a
component on the player's own entity alone. Each brief says which. Each brief
also carries one `scripts/checks/` real-server check with two connections for
its payoff moment, because a single-world scenario passes where a phone fails.

**Files with one owner at a time.**
- The camp: `content/outposts/outpost.json` is the waves slice's;
  `content/placements/outpost.json` is the heist slice's (the strongbox);
  `content/rooms/outpost.json` is nobody's until the vehicles slice. The
  rescue slice places its captive from its own `content/recruits/` file.
- The street: `content/placements/castle-street.json` is the glints slice's in
  its push 1 (a special good, two crates), then the heist slice's (restock).
- The undercroft: `content/placements/undercroft.json` (new) is the glints
  slice's; `content/rooms/undercroft.json` is nobody's now (puzzles later, or
  Step 16's deferred way home: one of them at a time, the orchestrator says
  which).
- The depot is Step 16's. Nobody here edits its room, placements or outpost
  file: pieces, prizes and the wings' pedestal are placed by each slice's own
  data, and three asks go to the Step 16 lead by message (callers who try
  again, the pedestal's tile, a clean-getaway expectation in its own
  zero-alarm scenarios).

---

## 1 · Hidden places to explore

**The library.** DECIDED: D-078 (hidden components that assemble into a final
object unknown to the player), D-079 (an explored share that says there is
more, never which or where; hidden rooms count), D-003, D-005, D-082 (saved
geography and component completion persist), D-089 and D-090 (the complete set
lets a chased hero into the cantina; the chasers follow; it is not a shelter).
Direction: doc 04 "Secret taxonomy" ("Visible inaccessible curiosities") and
its warning against compulsory checklisting. PROPOSED, used as `DRAFT:` under
D-096: doc 29's shared collectible system, pickup pop and n/m display; doc 30
part D (a found piece is never lost).

**Live on 2026-11-23.** Hidden routes and rooms exist and are empty: the false
wall and stained-glass window behind the throne into the hidden undercroft,
its crawl to a secret chamber and its vault behind a cracked wall; the
street's roofs to the gallery balcony; in the quarry a flyer's ledge, a crawl
pocket, a ridge shelf, a hidden cave, the depot's cellar; hiding spots.
`world.levels` records places entered (2b316ce), silently
(`src/sim/systems/level-explore.ts:53-57`); the entrance art and pie are not
drawn at the owner's play (they landed at 19:45 UTC, 4022fd6). Nothing is in
any secret, and entering one shows and sounds nothing.

**Landed (glints push 1, Step 14 slice B).** Pieces are data (`content/completion/`), found for the world (`world.found`, `piece-found`, `set-complete`); a glint at each unfound placed piece, a pop and a grey-and-gold row at the top. The town's first two: over the shop's awning, and the shop's special good. Two crates on the street. **Push 2:** the town's other four (behind the gate's bars, the vault behind the cracked wall with a crate now in the undercroft's passage, the secret chamber, the gallery balcony) and the quarry's five (flyer ledge, crawl pocket, the pit's out-of-reach ledge, the hidden cave, the depot's hoard once banked); `place-found` (a hidden room or area's first entry flashes the level's pie at the top with the pack's secret chime); the pieces' row on discovered entrance signs and menu rows; the cut `piece-grey`/`piece-gold` and `goods-special` wired. Still to land: what the sets build (push 3), D-089 with D-090. The Bandit Camp's one piece is its strongbox once banked.

**The first playable.** *Experience:* walking east out of the throne room, the
first street screen shows a small glinting piece just over the shop's awning.
A hop takes it: a chime, a burst, and a short row of grey pieces flashes at
the top with one turned gold. Glints are now a known thing. More sit in plain
sight behind something: one beyond the bars of the courtyard gate, one in the
undercroft's vault behind the cracked wall (a crate now lies in the passage to
throw), one up the one-tile crawl in the secret chamber; in the quarry on the
flyer's ledge, in the crawl pocket and on the pit's out-of-reach ledge (seen,
not reachable until the wings of playable 3). One of the town's is a visibly
special good on the shop's shelf: taking it is the piece. The depot's hoard
and the camp's strongbox are pieces once carried out (playable 2). The first
time a hero enters a hidden room or area, the level's pie ticks at the top
with a chime; nothing is drawn in the room. The last piece of a set makes a
real thing nobody named snap together at a spot the data names, and it does
one thing. *Found by:* the glint over the awning on the first screen east of
the start; pieces visible through bars and behind a crack; grey pieces on each
entrance sign saying there are more. *Payoff:* pieces are the world's, kept
with a kept game; the assembled thing; with every set complete, the cantina's
door stops refusing a chased hero, and the chasers follow in. *Risk:* a found
piece is never lost, so the cost is in the reaching: the gate shuts six
seconds after a plate lifts, the chamber's floor hole drops you eight tiles, a
missed crate must be fetched, and prize pieces must be carried out.

**What the checks changed.** The first glint moved off the roofs (the street
room's `INTENT:` is that nothing points at them) to just over the awning,
where a plain hop touches it. A real `DRAFT:` object per level from the
approved sheets, never a stand-in, unnamed in every log and id. A throwable in
the undercroft, because nothing there could break the wall. A flash for a
hidden place found, because the owner's words were "no hidden places to
explore" and pieces alone do not answer that. D-089 is built with D-090 or
held back. A piece from a taken thing counts whenever the thing is taken, so
an old kept game is not locked out.

**Step:** 14, slice B. **Signal:** scenarios in real rooms (a hop takes the
awning piece, control a thrown crate takes nothing; the undercroft's own crate
thrown at the vault wall, control wall unbroken; a first entry to a hidden
area flashes once, the second does not; all found and chased, the door lets
the hero and the guard in and the alert has not dropped); a real-server check
that a kept game keeps what was found and that the second connection's own
world has it; phone e2e: one hop on the first street screen turns one piece
gold in the page's drawn record. **Status: briefed,
`handoff-prompts/loop-glints.md`.**

## 2 · Heists and stealth

**The library.** DECIDED: D-016 (stealth broadly viable; zero-alarm success
deeply satisfying), D-019, D-061 to D-066 (seeing is not calling; a call can
be stopped), D-024 (stealth successes remembered), D-081 (a hit can cost
carried items), D-093. Direction: doc 07 "Heists are discovered opportunities"
(no "begin heist" flag), "The two equally excellent outcomes", its outpost
guidance ("detection cones or simple proximity checks", "warning icon") and
"Consequences that create gameplay" (confiscation); G-05, G-06. The owner's
comp A00-01 draws a vision cone and names it in its legend. OPEN: O-007
(detection rules): no rule is added, the band draws the existing one.

**Live on 2026-11-23.** Three moods, witnesses, a bell and a street guard;
hiding spots; three shop goods taken by Use, which pays nothing; the Bandit
Camp with a lookout, a horn, waves and a high ledge, and no prize; the depot
with a lookout, two patrols, a strongroom guard and a hoard, two zero-alarm
routes and three caught scenarios, about 210 columns of enemy rooms from the
courtyard. The Use button says "Go in" at doorways only
(`src/client/touch.ts:52`). Nothing shows what a watcher sees, a taken prize
is banked on the press, and nothing marks a clean job.

**The first playable.** *Experience:* at the shop on the first street screen
the Use button names what it will do (TAKE, BUY, BREAK), with a small mark
over the nearest thing. Each watcher shows a faint band ahead of them, the
length and height of their sight, that flips when they turn. Take the special
good while the shopkeeper's band points away: a soft tick, a closed-eye mark,
a piece found. Take it inside the band and she walks to the bell, as today.
Two rooms in, the Bandit Camp has a strongbox inside a watcher's beat. TAKE
puts it in your hands (an icon by your face); it is yours when you walk out.
Leave without anyone of the camp ever having had you in sight and a chime and
a banner say nobody noticed. The depot is the same job at full size. *Found
by:* the button's word changing beside the shop's goods on the main path; the
bands on the first people a player meets; the strongbox in view from the
camp's ledge. *Payoff:* the prize is a kept piece; a clean job is a legend
once playable 5's detector reads it. *Risk:* seen with the prize in hand, the
horn brings waves; a hard hit can knock it loose; thrown out (playable 7), it
goes back on its stand.

**What the checks changed.** A prize near the start: the shop's special good
and the camp's strongbox. A prize is cargo until its taker leaves on their own
feet. Clean means never seen, by the same `canSee` the band draws, so a brawl
with no horn earns nothing. Shop takes hang no legend. Push 1 is the Use
arbiter alone (three systems read Use today, each with its own press memory).
Goods restock, so the lure exists in every session. The getaway is read from
rooms each tick, never from `changed-room`.

**Step:** 19 (new). **Signal:** scenarios (an unseen take in the shopkeeper's
1.5-second turn, control a beat earlier; a camp job never seen, control seen
once, no clean event; a loud camp job with the horn never sounded earns no
clean event); a real-server check with two connections that cargo, the banked
prize and the clean event reach each connection's own world; phone e2e: the
button's `data-state` reads take at the goods and buy at the counter, and the
drawn record lists the shopkeeper's band flipping with her facing. **Status:
landed 2026-11-23, pushes 1-5 (03b5935, 588ac88, 60175bb, c881c17, then
restock). What changed from the plan: the camp's strongbox is at column 34,
not 23 (no clean job was possible there); the loud no-horn scenario was not
built (`docs/plan/step-19.md`, Builder notes; `docs/mechanisms/heists.md`).**

## 3 · Power and item stealing

**The library.** DECIDED: D-009 (from enemies or the map), D-080 (very rare
sources you can return to), D-081 (damage knocks it loose), D-082 (possession
ends, knowledge of the source stays), D-093 (no new button). Direction: doc 05
"Acquired power behavior", G-15 (one power, several meanings), doc 30 "Why
limited access is fun". PROPOSED, used as `DRAFT:`: doc 30's bouncing
short-lived pickup and its source table. OPEN: O-005 (which powers, slots,
thresholds).

**Live on 2026-11-23.** Nothing. The quarry pit's out-of-reach ledge was built
to wait for it.

**The first playable.** *Experience:* a carrier on the way a player already
walks has a small glowing orb over him (the street's villain, or a quarry
heavy if the villain's new fight-back makes that beat unreadable: measured
first). Lay him flat and the orb pops out and bounces; walk into it and it is
yours: its icon by your face, your hero glowing. This common one is a boost on
top of whoever holds it, felt on the very next Hit or Grab by all three
heroes: a struck body crosses the screen and goes through a cracked wall, and
Grab lifts what nobody can today (the throne). Take a hard hit and it pops out
of you as a bright bouncing orb that fades in seconds: grab it back, or knock
it out of another carrier. The rare one stands on a pedestal in the depot's
strongroom: wings. Any hero who holds them can flap; carry them to the pit and
fly to the ledge nobody could reach. *Found by:* the orb over a carrier on the
main path; the pedestal glowing through the strongroom's front; the pit's high
ledge in plain sight. *Payoff:* the power is carried, not owned (D-082); a
kept game keeps the sources found and what the power opened. *Risk:* the first
thing a player can lose: any hard hit knocks it loose, and the rare one then
costs a trip back into the depot.

**What the checks changed.** The first power was strength the grappler already
has (player one is given the grappler, `liftStrength` 150, a throw already
capped by `maxLaunchSpeed` 520): now a boost above every hero's own numbers.
Wings could not work on the holder's own phone: gaining and losing a power is
an effect, and the overlay is applied at all four read sites. The pedestal's
tile is agreed with the Step 16 lead and every `step16-*` scenario stays
green. The first carrier is decided by measuring against Step 18's villain.

**Step:** 9. **Signal:** scenarios (the grappler with the orb lifts the
throne, control without; a struck body breaks a cracked wall, control without;
a hard hit knocks it loose and it is grabbed back, control a light hit;
left alone it fades and the source is lit again); a real-server check with two
connections that the holder's own world has the power after the take and not
after a hard hit; phone e2e: a non-flyer page that took wings rises on a
second Jump press, control the same press without. **Status: briefed,
`handoff-prompts/loop-powers.md`.**

## 4 · Characters to unlock

**The library.** DECIDED: D-007 (a permanently expanding roster discovered in
the world), D-010, D-011 (local characters may join mid-region), D-013, D-082
(unlocks are permanent), D-083, D-084. Direction: doc 05 "Roster growth"
("Players begin with a subset") and its test (a new hero makes two earlier
places worth revisiting), doc 31 acceptance test 1, doc 36 (the canon three
are the start). OPEN: O-003 (party size). Every roster name in the library is
EXAMPLE (E-006).

**Live on 2026-11-23.** Five heroes, all unlocked from the first second
(`content/roster.json`); the two beyond the party wander the cantina and swap
in by tap. Nothing in the world unlocks anyone.

**The first playable.** *Experience:* through the Bandit Camp's entrance a
voice calls from off-screen, and from the high ledge you can see a cage on the
camp floor with a hero in it, inside a fighter's beat. Drop beside it while he
looks away: Use reads FREE; hold it under a small gauge, a little less than
his look away lasts. The cage opens, a fanfare, a banner says who joined,
their face flashes onto the party plate, and the party row opens so you can
swap them in on the spot. Their difference is reach: a second jump in the air,
so the way out is straight up onto the ledge. From then on they wander the
cantina, for good. Seen instead: the horn, the waves, and you can still free
them mid-fight. *Found by:* the captive's call at the screen's edge and the
cage in view from the ledge; the party plate showing who you have. *Payoff:*
the roster grows and is kept; the hero swaps in by tap; their reach opens
places already walked past. *Risk:* the hold happens inside a watcher's beat;
caught, the rescue becomes a fight.

**What the checks changed.** The cage moved into a fighter's look and off the
waves' entry tile (column 41), with a control where the hold starts while he
faces it. The captive is a thing until freed, not a body anyone can throw. The
roster becomes world state through a scenario seed field first, with every
`step11-*` scenario green. A new game starts with the canon three and the
brawler in the cantina, so the brawl never empties; the camp's captive is the
skirmisher. A second find waits for a sixth hero from the approved sheets.

**Step:** 13. **Signal:** scenarios in the real camp (freed unseen and out by
the ledge, control the hold begun while watched starts a call; freed while
caught; a fresh world's cantina lacks that wanderer and has it after the
rescue); a real-server check that a kept game keeps the roster and that a
friend in another room gets the event; phone e2e: the gauge at the cage and
the new face on the plate. **Status: briefed,
`handoff-prompts/loop-rescue.md`; spawn after the Use arbiter lands.**

## 5 · Escalating combat and chases

**The library.** DECIDED: D-018, D-019, D-021 (crowds and escalating
resistance can overwhelm), D-061 to D-069 (calls, signalers, waves, pursuit
that is hard to reverse), D-073 to D-077, D-088; the Hall: D-024, D-025,
D-026. Direction: doc 07 "Resistance escalation" ("repeatable calls by
surviving enemies, each with a visible activation window"; "each response wave
should add a new toy"), doc 08 "The escalating last stand", doc 09 (ceremonies
"rare and earned"), G-06, G-07, S-001. PROPOSED: doc 24 gate E (measure M3),
doc 27's guard whistle, doc 26's wanted ladder.

**Live on 2026-11-23.** A finished bell call brings one street guard; the
alert cools after 20 s unseen; two guards at most follow through a door.
At the camp and the depot a finished horn call is meant to bring growing
waves. **Measured, in the real rooms, it does not:** with a hero standing in
the camp lookout's view for 90 s, 10 calls completed, two waves walked in (1
then 2 fighters), every later wave waited for ever (3 placed + 3 arrived + a
row of 3 is 9, over the bound of 8, `src/sim/systems/outpost-wave.ts:37`), the
arrivals stood at the entry and no blow landed; at the depot one wave of two,
ever. A wave is never told where its caller saw the hero
(`outpost-fight.ts:53-55`). And ordinary play switches it off first: the
lookout is the only caller, one grappler hit flattens him (toughness 30
against `attackWear` 34), and a caller stopped mid-call never calls again
(`outpost-call.ts:55-60`). The Hall's store, record shape and pedestal drawing
are on `main`; nothing makes a record; gate E is the one gate not passing.

**The first playable.** *Experience:* in the Bandit Camp anyone who sees you
runs for the horn, and knocking him down only buys time: he, or another of
the camp, tries again. Each finished call walks a wave to where you were
seen: one, then two, then three with a heavy, and it keeps coming while the
horn stands. Throw them into each other; break the post to end it. When it
ends, because you walked out or were beaten, and it was big enough, the game
notices by itself: a banner for a new legend, and in the Hall gallery a
pedestal carries a small framed picture of the moment drawn with the real
sprites: who stood where, how many came, how long. A bigger one hangs a new
pedestal; the same again does not. *Found by:* a caller running to a horn
under a filling bar is the first thing the camp shows; then the banner, then a
pedestal standing in the Hall. *Payoff:* a legend credited to everyone there
(D-026), kept with a kept game; gate E passes with a real, unscripted event,
M3 at 6 of 6. *Risk:* the waves do not stop while the horn stands; a hard hit
knocks a power or a prize loose.

**Part 2, waits: the town.** A guard who sees you fight on blows a whistle for
two seconds under a gauge (interruptible, or it breaks D-063); a finished
whistle lights the next pip and the next row of a dispatch table walks in by
both street doors; the pips follow you from room to room. Step 4, its "rest".
Step 18 slice A is on `main`, so nothing but a free builder holds it.
**Part 1b, waits: the Hall's lasting store** for the world everyone shares
(wire `src/server/store.ts`, give each record its lasting number on the
server, dedupe on load), by a builder given the `src/server` edits by name.

**What the checks changed.** Push 1 is making the waves real, before any
detector: a wave is sent to where its caller saw a hero, more than one person
may call and an interrupted caller tries again, and growth fits under the
bound. The legend is announced by a world event, because a page in the camp is
never sent the gallery's pedestal entity (`src/server/game.ts:527`,
`src/client/draw/hall.ts:233`). The picture is drawn with real sprites in a
frame from the approved P04 Hall atlas, not coloured boxes. Only bodies felled
by a credited player count (bandits flattened each other seven times in a
measured minute). Two crates stand on the street (playable 1's first push) so a solo
player can open the Hall's gate.

**Step:** 7, slice B. **Signal:** real-room scenarios in the camp and the
depot (three waves arrive and reach the hero, control the send-to rule off and
they stand at the entry; a knocked-down caller calls again, control the retry
off); `step7-last-stand-camp` written from measured numbers, tagged gate E;
the same again hangs nothing; a real-server check that a page in the camp gets
the legend's event and a page in the gallery the pedestal; phone e2e: the
gallery's pedestal card. **Status: briefed, `handoff-prompts/loop-waves.md`.**

## 6 · Vehicle hijacking

**The library.** DECIDED: D-017 (steal or hijack vehicles), D-020 (roadblock
crashes), D-022, D-023 (turning the machine sent to stop you on the pursuers).
Direction: doc 08 "Vehicles" ("satisfyingly violent in motion while remaining
readable in 2D"; "bail out at the last moment"), G-08 (its pass line includes
"controls recover"), G-09. OPEN: O-008, O-009 (which vehicles, steering,
collision, when hijacking is possible). PROPOSED: doc 24's one hijackable
machine with a ram.

**Live on 2026-11-23.** Nothing to drive. The wagon's looks are cut with
their rider baked in (`content/looks/rides.json`, 68b2e1d; an empty-vehicle
revision of the sheet is requested, a42b7e6). The courtyard keeps a clear run
(columns 1-13) for a machine.

**The first playable.** *Experience:* in the Bandit Camp a wheeled armoured
wagon stands with its driver in it, facing away. Grab pulls him out; Use reads
GET IN. The stick drives, building speed past a hero's run; everything in the
way flies by its weight, the horn post snaps, and the wagon bursts through a
light barrier, stalls and then a timber barricade into the camp's cache, and
keeps rolling with wear. Jump gets you out at any moment. Later waves bring a
second wagon, slower than any hero while a bandit drives it, to be taken and
turned on the wave. *Found by:* the wagon is the first big thing in view past
the camp's entrance, with a person in it. *Payoff:* the cache the loud way; a
broken barricade stays broken in a kept game. *Risk:* the loudest thing a
player can do; each crash wears the wagon to a wreck; a heavy's blow throws
you from the seat.

**What the checks changed, and what must be settled before its brief.** A run
of 26 tiles in a box is three seconds of driving for nine builder-hours: the
slice extends the camp east by two screens of things to plough through, or
lets a machine through walk doors. A character's box may not exceed 32 by 32
(`src/content/kinds/characters.ts`, an `INTENT:`): stay inside it or raise it
with a physics check. Steering by report would lag 300 to 450 ms on a phone:
the rider's own page becomes the machine kind (the `become` effect) and
simulates it with one new `drive` verb; the ram runs on the server and emits
`impact`. Its ram-by-weight overlaps Step 18's queued "heavies topple" slice:
one shared rule. It rewrites the camp's room, placements and outpost files and
so every tick-pinned real-camp scenario: two builders, never beside the rescue
slice.

**Step:** 20 (new). **Signal:** in `docs/plan/step-20.md`. **Status: waits.**

## 7 · Risk

**The library.** DECIDED: D-019 (no reload loop), D-021, D-080, D-081, D-082,
D-085, D-086 (the cantina's brawl has its own rules), D-088. Direction: S-007
(no hard game-over), doc 07 "Consequences that create gameplay" ("additional
combat, confiscation, reputation change, temporary exclusion, intensified
defenses or an invitation to escape ... consequences must be legible and
real"), G-07, G-16, doc 18 (recovery time must not become the difficulty).
OPEN: O-006 (defeat and recovery); D-086's own open list includes rare gear in
a brawl.

**Live on 2026-11-23.** A beaten hero lies flat for three seconds and gets up
where they fell. Nothing is carried, so nothing can be lost. Toughness is
hidden.

**The first playable.** *Experience:* the party's faces sit at the top-left;
yours changes as you take blows, fine, then hurt, and at the edge the hero
staggers under dizzy stars. Go down in a bad guys' place while one of them can
reach you and he stands over you for a beat (a friend hitting him stops it),
then you are thrown bodily out of the place's doorway. You land flat and are
up in three seconds, free. The power you carried was knocked loose where you
fell; a prize in your hands is back on its stand. The horn you broke stays
broken and pieces and recruits stay yours: walk straight back in. In town,
beaten by guards under an alert, you are thrown into the open courtyard with
the alert unchanged and the chasers walking out after you. *Found by:* the
faces are on screen from the first second; the first throw-out happens to any
player who stands among the camp's fighters. *Payoff:* nothing is gained; it
makes what is kept feel earned. *Risk:* your place, your carried power, your
prize; never a reload, never held.

**What the checks changed.** With the prize banked on the press, defeat was
the best way out of a heist: prizes are cargo (playable 2) and a throw-out
puts them back. In town the throw landed a chased hero in a hidden room nobody
follows into, ending the chase: now the open courtyard, alert unchanged,
chasers following. The seize is cancelled only by a played body's hit. The
face reads the snapshot's copy of the hero (an edit in `src/client/main.ts`).
"No loss in the cantina" for a power and "a piece is never lost" are `DRAFT:`
(doc 30 part D with D-082), each one data switch from the other answer.

**Step:** 21 (new). **Signal:** in `docs/plan/step-21.md`. **Status: waits**
for playable 2's cargo, playable 3's knock-loose push and the HUD plate.

## 8 · Puzzles

**The library.** DECIDED: D-006 (consistent applications, not prescribed
tricks), D-014, D-015 (no hard no-solo rule), D-038, D-053. Direction: doc 04
"Puzzle design ethos" ("weight, momentum ... mechanisms that must remain
active"), doc 06 "No arbitrary solo prohibition" and its prototype condition
(a designed co-op strategy and at least one unadvertised solo workaround),
G-04, G-15. PROPOSED: doc 25's kit ("plate+weight", "exploit an enemy's
mass").

**Live on 2026-11-23.** One: the courtyard's two plates and gate, opened by
any two bodies, with nothing behind it worth opening and the nearest loose
weight about 70 tiles away.

**The first playable.** *Experience:* the gate now has a piece behind its bars
and the Hall where legends hang, and two crates stand on the street (they
arrive with playable 1, because the gate matters from the first batch). Then,
under the castle, a wide stone plate that one hero's weight only half presses,
holding a portcullis over a second find, and showing how far it has sunk. Two
friends open it if one is the grappler; alone it takes the heavy crate, the
king himself thrown down through the stained-glass window, or the boost of
playable 3. *Found by:* the plates, the gate and the piece behind it are on
the main path; the stone plate is a few steps from where the cellar arch
brings you in. *Payoff:* the pieces behind the gate and the portcullis; the
way into the Hall. *Risk:* a wrong try costs only the walk.

**What the checks changed.** The stone plate needs about 80, not 100, so the
grappler and either friend open it together (86 or 90), the two light heroes
(56) and any one hero do not. The plate's params live in
`src/sim/systems/room-plate.ts`'s own parts declaration. The undercroft has
one passage and little solid mass for a pocket: the builder shows the pocket's
tiles and the green `step3-*` and way-out results before adding a part.

**Step:** 3, a new slice. **Signal:** `step3-weight-*` scenarios with the pair
cases, never reading how many are playing; the two-phone gate proof Step 3
still owes. **Status: waits** for playable 1 (it appends one piece).

---

## Housekeeping for the orchestrator

None of this needs the owner; each `DRAFT:` gets a decisions-log entry from
the builder who makes it.

- Claim each step as its builder is spawned (`docs/plan.md`). Step 14 is
  already yours (slice A is done and reviewed, a0f402c): put the slice B
  builder on its line.
- Add path rows for Steps 9, 13, 19, 20 and 21 to `docs/architecture.md`,
  "Which paths each plan step owns", from each step file's "Owns".
- Pass three notes to the Step 16 lead: the depot has one one-hit caller too
  (give it callers who try again once the waves slice lands the switch); the
  wings' pedestal tile; a `clean-getaway` expectation in its own zero-alarm
  and caught scenarios. Its deferred way home from the quarry cave into the
  undercroft's vault would join the depot's long escape to the town's vault
  piece: worth un-deferring after its last slice.
- Tell the owner in plain words what each first playable is and where to find
  it, as each one goes live.
- The two thin jump margins (the camp's way out, `docs/plan/step-3.md`'s last
  note; the awning and roof hops, about 3 to 5 px to spare by the check's
  measure) both break if `jumpSpeed` is tuned down in `?tune`.

## Reviews by re-running (orchestrator)

- 2026-11-23 20:50 UTC, `session_017WiGzJzo6aZqH4kYxxJsiV`, at 64bd1fe: build ok, check ok, e2e ok (one run). Covers glints push 1 (02455d2), heist pushes 1 and 2 (03b5935, 588ac88), powers push 1 (64bd1fe), hit prediction's re-push (d2c6e73), the art asks (8d15d9c, 720401f). Diffs not read. Flakes builders saw once each, not seen here: `cantina-row`, `level-full`/`level-menu` under load, reconnect h1/h2.
- 2026-11-23 21:40 UTC, same reviewer, at f4a3cc9 (holds heist pushes 3 and 4, 60175bb and c881c17; rescue push 1, a1741fa; hit prediction 299a4d6; Step 16's close eb57448): build ok, check ok, e2e 2 of 3 runs green; the third failed `h1` (the page did not come back after the 75 s outage), and one run at eb57448 before it failed `t-grab-friend` and `s-break-free`. Not from these pushes as far as known (`h1` also failed for others at a1741fa and 4022fd6): investigation briefed, `handoff-prompts/step-5-e2e-flakes.md`. Diffs not read.
