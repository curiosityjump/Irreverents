# Decisions made without stopping to ask

**Standing.** Run per `docs/sop.md` phase 4. The one list of decisions any
session made on the owner's behalf instead of stopping to ask them.

## Why this file exists

**Owner, 2026-11-23 ~04:11 UTC, to the orchestrator, first-hand:**
> I don't want anything being bottlenecked by permissions issues or design decisions from me. I'm about to go to bed. Use your own judgment and document the decisions and reasoning whenever you are tempted to stop to ask me. If you need permission for anything, ask now.

So nothing waits for the owner. The price of that is that they must be
able to see, in one place and in plain words, what was decided for them
and why, and undo any of it with a word. This file is that place. Vision
Partner tells the owner how many entries are new and reads them any they
want; "no" to an entry is an answer like any other, and reopens it.

## When to write an entry

Whenever you were tempted to stop and ask the owner, and decided instead:
a design choice the vision and the library leave open, which of two
readings of their words to build, a placeholder that will be seen, a
permission you assumed. **Not** for mechanics that were always yours (how
a function is written), and not instead of the governing document: the
decision is still recorded where it governs (a step file, a mechanism
doc, a `DRAFT:` at the site); the entry here is the short, owner-readable
pointer to it.

Before deciding, look for their answer: `docs/vision.md`, the design
library (labels are literal; D-096 says to use proposals by default),
`docs/deliberate-designs.md`, this file. A decision already made here is
followed, not re-made.

**What a decision may not do:** remove or "fix" something that might be
deliberate (leave it, and log the doubt as an entry); destroy anything
that cannot be brought back (data, history, another project's sessions);
spend the owner's money outside this project's own running.

## Format

One entry per decision, appended, newest last. In the owner's terms: what
they would see or feel, not file names.

```markdown
### <date> · <the decision, in a line a player would understand>
- **Decided by:** <role, step>, `<session id>`
- **Instead of asking:** <the question you would have asked>
- **Why this way:** <the owner's words or library line it rests on; or the plain reason>
- **To change it:** <what it takes: a number in a data file, a different placeholder, real work>
- **Where:** <step file / doc section / code site>
```

The owner's reaction, when one comes, is written under the entry by
Vision Partner, quoted, and the entry then moves into the governing
document as a decision of theirs.

## Entries

*(Entries of 2026-11-23, the first 168 or so, are in `docs/decisions-log-archive.md`; they still stand. This file must stay under 150 KB: a session spawned with `blob_limit_kb: 150` gets a larger file with git's skip-worktree flag, and its edits never reach a commit. When it nears that, move the oldest day out the same way.)*

### 2026-11-24 · The start screen shows the owner's title picture: the whole picture sideways, the full width at the top when upright
- **Decided by:** owner-title-screen builder (Step 17), `session_017WiGzH3PZe5UkjdEEaAN75`
- **Instead of asking:** "How should the title picture sit on a phone held upright, where a 16:9 picture can't fill the screen, and how should the buttons share it?"
- **Why this way:** the owner: "Title screen asset added to the drive"; the brief: the whole picture is seen sideways, and upright choose what keeps the title readable. Cropping upright to fill the height would show only the middle letters ("EVER"), so the whole picture is shown across the width at the top, with the night ground below. In every orientation the buttons sit below the wordmark and never cover it; over the picture, the labels get a dark backing so they stay readable, and sideways the buttons pack to 44 px so all seven still fit. The picture's own lettering is the title, so the old pixel-font title is not drawn. The file is labelled a concept; it is used as it is (D-096).
- **To change it:** the picture and the wordmark's box are `content/looks/title.json` (made by `tools/art/title/make.py`: its colour count and box); the fit and spacing are `titlePicture` and the "title screen" CSS in `src/client/start.ts`. Delete `content/looks/title.json` and the old title returns.
- **Where:** `docs/plan/step-17.md`, "Title screen"; `docs/mechanisms/saves.md`, "The start screen".

### 2026-11-23 · Step 20: the camp's run: the Bandit Camp goes on east for two more screens, things to smash, and a cache at the end
- **Decided by:** vehicles builder B (Step 20, brief `loop-vehicles-b.md`), `session_017WiGzEvHsdz7Z8fr6XuECe`
- **Instead of asking:** "The wagon had three seconds of driving in the old camp: make the camp longer, or let it drive through doorways?" and "What stands in its way, how hard is each, and what's in the cache?"
- **Why this way:** the brief chose the longer room. Past the camp's old east wall a market stretch runs to a timber barricade with a cache behind it: a light fence (anything at 200 px/s or more breaks it: a thrown crate, a body knocked into it), two market stalls (150), one loose crate, the barricade (300), the cache (a second prize of the camp's job, carried as a gold sack). A second high ledge runs over all of it, a hop from the first: walking it and dropping off its end into the cache is the quiet way, and a step in the cache climbs back up (no one is ever shut in). Nothing west of the old wall moved, and no older scenario needed a re-time. **The barricade is not the wagon's alone:** the brief wanted it to break only above what a hero can throw (520) and at or under the wagon's top speed, but the wagon tops out at 340, so a crate or a body thrown hard breaks it too (the brief's own fallback). **The horn post does not snap to the wagon** at today's numbers (the post breaks at 450 since the waves slice; the wagon meets it at about 280): asked builder A whether to raise the wagon's speed. **One crate, not three:** measured, a second crate flung ahead bounces back into the wagon, knocks it off its wheels and it stops short of the barricade.
- **To change it:** numbers and letters in `content/rooms/outpost.json` (the parts' `breakSpeed`, where they stand), `content/placements/outpost.json` (crates, the cache), `content/heists/camp.json` (what the cache is). The other answer (a machine through walk doors) is real work.
- **Where:** `docs/mechanisms/outposts.md`, "Step 20: the camp's run"; `docs/plan/step-20.md`, "Builder notes".

### 2026-11-24 · A knocked-out shopkeeper stays down 10 s, long enough to empty her shelf and walk out
- **Decided by:** Step 5 builder (`session_017WiGzEhbdYJQcUhtD2bSLL`), on the orchestrator's direction (shopkeeper only, guards unchanged)
- **Instead of asking:** "How long should a knocked-out townsperson stay down?"
- **Why this way:** D-064, a shopkeeper knocked out before she reports lets you rob the shop. Measured with the slowest hero (the grappler, 84 px/s): knock her out, take all four goods and walk out the west door takes about 3.9 s. Today she was up at 3 s, before you were out. 10 s gives room to spare. Guards stay at 3 s: both scenarios that go red with longer are about guards getting back up.
- **To change it:** `"knockedOut"` in `content/npcs/shopkeeper.json` (any good kind can have one; left out = world `knockedOutTime`, 3 s).
- **Where:** `docs/mechanisms/combat-and-impact.md`, "Beaten for good"; scenario `step5-shopkeeper-robbed`. `DRAFT:`

### 2026-11-24 · Bad guys can be beaten for good: three knock-outs, or one big slam, and they go in a poof
- **Decided by:** Step 5 builder (brief `owner-knocked-out-flies-off.md`, Part 2), `session_017WiGzEhbdYJQcUhtD2bSLL`, on the orchestrator's decisions in that brief
- **Instead of asking:** "How many knock-outs before a bad guy stays down? Does a hard throw end him at once? Does he come back?"
- **Why this way:** your words, "enemies collapse but never die", and doc 08's "…or is defeated". A camp fighter, a lookout, a wave's arrival or the toll keeper knocked out by the players 3 times does not get up. A heavy takes 4, the brute 5. One slam into a wall or another body at 400 px/s ends him at once (impact over numbers, D-020: a grappler's throw does it). He lies a moment, then goes in a poof. Only what a player does counts, so the camp's people flattening each other do not empty the camp. A placed bad guy is back at his place once nobody has been in his room for 90 s. A wave's arrival never comes back. One knock-out before the end he is drawn dazed: no numbers, no bar. 3 is one more than any existing scenario needs (2 stays green, 1 does not).
- **Not done:** the villain is left as he was (`"beaten": false`). Guards still get up after 3 s: any longer turns two scenarios red. The shopkeeper's longer knock-out is the entry above.
- **To change it:** `content/tuning.json` world `beatenAfter`, `beatenSlam` (0 = no slam), `beatenLieTime`, `beatenReturnTime`, `knockedOutTime`; per kind `"beaten": { "after", "slam" }` or `false` in `content/npcs/`. To undo it, revert the commit.
- **Where:** `docs/mechanisms/combat-and-impact.md`, "Beaten for good"; `docs/plan/step-5.md`. `DRAFT:`

### 2026-11-24 · A knocked-out enemy is drawn flying from the blow and lies down where it lands
- **Decided by:** Step 5 builder (brief `owner-knocked-out-flies-off.md`), `session_017WiGzJC6UCvT2PtVr2dn8v`
- **Instead of asking:** "The blow that knocks someone out also knocks them back about 200 px, like any blow. Should a knocked-out body fly less, or just look like it is flying?"
- **Why this way:** your report ("they collapse, then randomly fly off the screen") was the drawing: the body was shown lying flat from the instant of the blow, so its knockback looked like a collapsed body sliding off for no reason. Knockback is the game (D-020, "impact over numbers"), so the push stays and only the picture changed: hit, fly (hurt, tumbling), land, lie there, get up there.
- **To change it:** to make a knock-out also stop the body where it was hit, that is one rule in the simulation (the launch in `src/sim/verbs/attack.ts` on a blow that flattens); the picture's rule is one line, `lyingOut` in `src/client/draw/sprites.ts`.
- **Where:** `docs/plan/step-5.md`, "Knocked-out enemies fly off". `DRAFT:`

### 2026-11-23 · Step 9: wings stand on a pedestal in the depot's strongroom; stand on it to take them, and it lights again when they are lost
- **Decided by:** Step 9 builder, `session_017WiGzF16bBpnLmeWErGynR`
- **Instead of asking:** "Where does the rare power live, how is it taken, and when can it be taken again?" (the Step 16 lead was asked about the tile and had been archived)
- **Why this way:** D-080: rare powers live in one or a few spots you can return to. D-082: possession ends, but knowing where the source is stays valuable. The pedestal is just east of the hoard, where a quiet route already ends, so wings are a second prize of the infiltration. With them any hero can flap six times and reach the quarry pit's high ledge (four is the measured least). You take them by standing on the pedestal, not by brushing past. It goes dark while someone has them and lights again once they are lost, and the game remembers that you found it.
- **To change it:** the tile is one entry in `content/powers/flight.json` (`sources`); the flaps are its `atLeast`.
- **Where:** `docs/mechanisms/powers.md`, "Sources".
### 2026-11-24 · Step 20: the wagon goes faster and lasts longer, so it can snap the camp's horn and reach the barricade
- **Decided by:** vehicles builder A, push 3 (brief `loop-vehicles-a.md`), on builder B's ask (`session_017WiGzEvHsdz7Z8fr6XuECe`); this session `session_017WiGzK3BxWQHTRLZHSmnYK`
- **Instead of asking:** "How fast should the wagon go, and how many crashes before it is a wreck?" (O-009 is OPEN)
- **Why this way:** D-020, doc 08 ("speed, crunch ... chains of crashes"). The camp's horn post breaks only to a hit at 450, and the wagon cannot stand closer than twelve tiles from it, so at 340 it never snapped it; and from the camp's doorway it wrecked at its eighth crash, before the barricade. Now a hero drives it at 560 px/s (still under one tile a tick), building to full in about two seconds, and it takes sixteen crashes to wreck. A bandit still drives it slower than any hero.
- **To change it:** `speed.rider`, `accel` and `crashes` in `content/machines/ram-wagon.json`; four check-room scenarios are timed to them (`docs/mechanisms/machines.md`, "How it is checked").
- **Where:** `docs/plan/step-20.md`, "Builder notes".

### 2026-11-24 · Step 20: the look: the wagon is drawn from its cut pictures, with their goggled rider standing for whoever drives
- **Decided by:** vehicles builder A, push 3, `session_017WiGzK3BxWQHTRLZHSmnYK`
- **Instead of asking:** "How should the wagon look with a bandit in it, with you in it, and empty, before an empty picture exists?"
- **Why this way:** use what is cut now (D-096). Every wagon picture has the same goggled rider painted in, so with a bandit at the reins the bandit himself is not drawn (the painted rider is him); with you in it, the same picture with your own mark over it; empty, the same picture until a cut with the rider painted out arrives (asked of the art builder), and the GET IN button and the Use mark say it is free. It shows the rolling pictures while it moves, the crash picture for a quarter second after a hit, and the wreck picture once worn through; wear is never a number. Your plate shows your hero's face while you ride, not a blank square.
- **To change it:** which picture shows when is `machineLook` in `src/client/draw/machines.ts`; the pictures are `ride-wagon-*` in `content/looks/rides.json` (adding `ride-wagon-empty` there is the whole change for the empty seat); to draw the bandit over the wagon instead, drop the `seatedInDrawnMachine` filter in `src/client/draw/entities.ts`; to go back to the plain box, remove `look` from `content/machines/ram-wagon.json`.
- **Where:** `docs/mechanisms/machines.md`, "The look".
### 2026-11-24 · The chase: a bandit who saw you comes after you, turns to look for you, then goes back to his post
- **Decided by:** owner-enemies-chase-alarms builder, `session_017WiGzF31gfYgeWNMA7rnEL`
- **Instead of asking:** "How long does a bandit keep after you, where does he look, and what then?"
- **Why this way:** the owner, playing: "enemies don't give chase if you are not right in front of them". Measured: a bandit saw only straight ahead and, once you were past him, stood where he last saw you for ever, facing the old way. Now a camp fighter, a heavy and a brute who lose you walk to where they last saw you, walk on a few steps the way you were going, turn about for four seconds (so a hero who slipped behind him is found again, if still in sight), then walk back to their post. They still only know what they saw (D-065), never jump, and every one still walks slower than the slowest hero runs (fighter 48, lookout 56, heavy 36, brute 28 px/s; the brawler runs 76: 20 px/s spare against the lookout, 28 against a fighter, unchanged), so you can always get away. A bandit walking at a place up a step he cannot climb gives up after under a second and searches there instead of pushing the step for ever. How far they see is unchanged: seeing farther turned fifteen scenarios red, the quiet routes through the camp and the quarry among them, so it waits for the orchestrator.
- **To change it:** `search` (`on` pixels, `time` and `turn` seconds) in `content/npcs/outpost-fighter.json`, `heavy-fighter.json`, `brute.json`; take it out and that kind stands where he lost you, as before. A kind's own `sight` (`range`, `height`) is ready but set on nobody.
- **Where:** `docs/mechanisms/outposts.md`, the `outpost-fight` row; `docs/plan/step-4.md`, "Alarms and the chase, as played". `DRAFT:`
### 2026-11-24 · Step 20: the wagon in the camp stands empty on the entry step, the first thing you see coming in
- **Decided by:** vehicles builder B, push 2 (brief `loop-vehicles-b.md`)
- **Instead of asking:** "Where does the camp's wagon stand, and is someone in it?" (O-008, O-009 are OPEN)
- **Why this way:** the owner: "no vehicle hijacking". The brief asked for the wagon on the floor past the step with a bandit at the reins, facing away. Measured, that rewrote seven of the camp's fights: a bandit at the reins sees every hero who stands where the lookout can see them, turns the wagon on them and swings from the seat (hitting his own wagon), and he is one more person under the camp's cap, so the third wave waits. Even empty, on the floor at column 10 heroes knocked west landed against it. So the wagon stands **empty on top of the entry step** (columns 5-7): it is the first thing in view from the doorway, Use reads GET IN as soon as you climb up, no fight's path crosses it, and driving east it drops off the step and builds speed through the camp. The hijack from a bandit's hands comes with a wave's wagon (push 3). Measured, a run from the step met the barricade at about 470 px/s with the camp's people in the way (560 since weapons push 2 moved them), so a wagon-only number above a hard throw (520) would hang on where the camp's people stand: the barricade keeps its 300 (a hard throw breaks it too).
- **To change it:** `camp-wagon` in `content/placements/outpost.json` (its note gives the one line that seats a driver; doing so needs the camp's fight scenarios re-timed, and the seat line in `outpost-fight.ts` asked of the orchestrator).
- **Where:** `docs/mechanisms/machines.md`, "In the Bandit Camp"; `docs/plan/step-20.md`, "Builder notes". `DRAFT:`

### 2026-11-24 · A horn that finishes is announced: "The horn sounds!", then "Here they come!"
- **Decided by:** owner-enemies-chase-alarms builder, `session_017WiGzF31gfYgeWNMA7rnEL`
- **Instead of asking:** "How should a phone player know a camp's horn worked?"
- **Why this way:** the owner: "Alarms don't seem to do anything yet." Measured: the horn did finish and the wave did come, but nothing said so, there was no sound, and the wave walked in off screen for about seven seconds. Now the horn makes the bell's wind-up sound while it is blown and the alarm sound when it finishes, a banner says "The horn sounds!", and "Here they come!" when the wave walks in; in the street, "The guard is here!" when the help a whistle called walks in. Only players in that room see the banners.
- **To change it:** the words and colour at the top of `src/client/draw/alarm-banner.ts`; the sounds in `src/client/audio/moments.ts` (`outpost-call-*`). Undo: revert the commit.
- **Where:** `docs/plan/step-4.md`, "Alarms and the chase, as played". `DRAFT:`

### 2026-11-24 · Step 22: you can lose in the Iron Quarry: three falls in a minute with a bandit in reach and you are thrown back to the quarry's start
- **Decided by:** Step 22 builder, push 1, `session_017WiGzHD6TvY2XxEG4B3rJU`, on the lead's brief (`handoff-prompts/step-22-stage.md`)
- **Instead of asking:** "How many falls before the quarry throws you out, who throws you, and where do you land?" 
- **Why this way:** the owner, playing: "Enemies can't be fully defeated, neither can heros", and for the stage: "real way to lose/die, which pushes you back to the entrance to start over". Step 21's rule is used as it is, with a new place file. 3 falls sits between the street's 2 and the camp's 4; the fighters, the heavy and the brute throw you, the toll-keeper does not (he is a toll); you land on the road just inside the doorway from the courtyard. Waves that find nobody walk off after 10 s, as at the camp.
- **To change it:** `downs`, `seizers`, `lands` in `content/defeat/quarry.json`, `"on": false` turns it off; `leaveCold`/`leaveIdle` in `content/outposts/quarry-depot.json`.
- **Where:** `docs/mechanisms/defeat.md`, "The rule"; `docs/mechanisms/outposts.md`, "The depot"; `docs/plan/step-22.md`, "Builder notes". `DRAFT:`



### 2026-11-24 · The king (or a crate, or anyone nobody plays) never ends up lying inside the false wall behind the throne
- **Decided by:** Step 5 builder (brief `owner-knocked-out-flies-off.md`, part 3), `session_017WiGzJC6UCvT2PtVr2dn8v`
- **Instead of asking:** "The wall behind the throne is fake: anyone can walk through it to find the hidden way down. Punching the king from the street side knocks him into it, where he sits drawn inside the wall for good. Should the fake wall stop him, or should he be put back out?"
- **Why this way:** your words, "The king keeps getting stuck in the wall". The fake wall stays a secret only heroes find (Step 3's "a way nothing points at"), and the king can still be thrown through the window into the cellar (that flight passes through it). Only a body that comes to rest in it is put back out onto the dais, the same instant, not thrown.
- **To change it:** delete `src/sim/systems/rest-out-of-false-wall.ts` to go back (he will lie in the wall again); `LOOK` at its top is how far it looks for room.
- **Where:** `docs/mechanisms/rooms-and-doors.md`, the parts table. `DRAFT:`


### 2026-11-24 · Step 21: every hero has three hearts; a bandit (or a guard you provoked) putting you on the floor costs one
- **Decided by:** hearts builder, push 1, `session_017WiGzG7mhviEaxroo5GvBv`, on the orchestrator's brief (`handoff-prompts/hearts.md`)
- **Instead of asking:** "How many hearts, and what exactly takes one?"
- **Why this way:** the owner, playing: "Heros should have hearts which can be lost." The fall is the unit, so knockback and throws still carry the fight and nothing counts single blows (D-020); three each to start (the orchestrator's pick). The hearts belong to the party everyone shares, by hero. A friend, a wall, a fall with nobody behind it and anything in the cantina's brawl never cost one. Nothing yet happens at none: being out and the game over are the next pushes; nothing is drawn yet.
- **To change it:** `content/hearts.json`: `heroes` (per hero), `default`, `per` ("blow": every blow an enemy lands costs one instead), `"on": false` turns hearts off.
- **Where:** `docs/mechanisms/defeat.md`, "Hearts"; `docs/plan/step-21.md`, "Builder notes", "Hearts". `DRAFT:`

### 2026-11-24 · The Bandit Camp's way in fits every hero: a half-height stair onto the entrance step
- **Decided by:** vehicles builder B (Step 20), `session_017WiGzEvHsdz7Z8fr6XuECe`, on the orchestrator's ask
- **Instead of asking:** "The brawler, who every new game starts with, can't get past the step just inside the camp's doorway. Was that meant?"
- **Why this way:** nothing recorded it as intended (the room's note calls every column a first pass), and getting into the camp is the start of most of what the camp offers. Measured: the grappler, infiltrator, flyer and skirmisher all get over the three-tile step; the brawler's jump does not (it stopped at column 3.9, never past column 4 over 15 timings). One one-way tile at column 4, row 9 is a half-height stair: the brawler lands on it and jumps on. Everyone else runs and jumps up through it as before. One older scenario's walk-out was re-timed by eight ticks (the flyer now brushes the tile on the way down). Removing a tile of the step instead would have re-timed ten scenarios across four steps.
- **To change it:** one character in `content/rooms/outpost.json` (row 9, column 4), or the brawler's jump in `content/tuning.json`.
- **Where:** `content/rooms/outpost.json`; `scenarios/step20-camp-every-hero-gets-in.json`.

### 2026-11-24 · Step 22: beaten in the Iron Quarry, the whole quarry starts over: its people back at their posts, the horn mended, the waves gone; with a friend still inside, it waits for them
- **Decided by:** Step 22 builder, push 2, `session_017WiGzHD6TvY2XxEG4B3rJU`, on the lead's brief
- **Instead of asking:** "When friends play the stage together and one is beaten, does it start over at once? Does the clock stop while the menu is open? What does a friend who joins halfway do?"
- **Why this way:** the owner: "real way to lose/die, which pushes you back to the entrance to start over"; the step's decided reading: with friends, a beaten player is back at the entrance at once and the stage starts over only when nobody else is left inside (solo: at once). A friend walking out without being beaten does not start it over. The world never pauses, so the clock does not stop for the menu; a friend joining mid-run shares its clock and counts. What you found for good stays found.
- **To change it:** `"on": false` in `content/stages/iron-quarry.json` turns the stage off (the quarry then keeps its state like everywhere else); the rule is `src/sim/systems/stage-run.ts`, what is put back `restoreStage` in `src/sim/stage.ts`.
- **Where:** `docs/mechanisms/stages.md`; `docs/plan/step-22.md`, "Builder notes". `DRAFT:`




### 2026-11-24 · Step 21: a shield beside your face goes grey, gold, then red as you are beaten, and red means one more fall throws you out
- **Decided by:** Step 21 builder (risk), push 3, `session_017WiGzJWYyVWtYnjFXHko1S`
- **Instead of asking:** "How should a player see they are losing: hearts, a bar, a face?"
- **Why this way:** the owner, playing: "i seem to be invincible as hero" and "neither can heros [be fully defeated]"; no digits, no bars (D-020); the HUD sheet's own shield ladder, cut for this. Gold after any blow or fall, red when flat or one fall from being thrown out (or nearly worn through), so the throw is seen coming.
- **To change it:** `HURT_SHARE`, `EDGE_SHARE` and `conditionOf` in `src/client/draw/condition.ts`; the shields in `content/looks/ui.json`.
- **Where:** `docs/mechanisms/defeat.md`, "On screen". `DRAFT:`

### 2026-11-24 · Step 22: the stage's own restore of people is kept for now (lead)

- **What:** push 2 (d6acfdb) puts the quarry's people back from its own copy of where they started (`world.stageHome`, `src/sim/stage.ts`), not from `beaten.ts`'s `restorePeople`, which isn't on `main` yet. It stays.
- **Why:** it is live and green, and it is the start-over the owner asked for ("pushes you back to the entrance to start over"). Reverting it would leave the quarry with no restart until `restorePeople` lands.
- **Undo / follow-up (`DRAFT:`):** once `restorePeople` and `holdReturns` are on `main`, the next Step 22 push calls them and keeps `stageHome` only for what they don't cover (wave bodies, things, room state). Or revert d6acfdb, which comes out cleanly.
### 2026-11-24 · Step 23: a sword lies on the castle street; Use picks it up, Hit swings it further and harder, any hero can hold it
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzF7puSFWh2BBeii8WZ`
- **Instead of asking:** which button picks a weapon up, what a sword changes, where the first one lies, who can hold it.
- **Why this way:** the step file's `DRAFT:` list (`docs/plan/step-23.md`): Use is the one button that says what a press will do ("Pick up", "Swap" when your hand is full) and the weapon it would take glows; D-009 (weapons from the map), D-080 (a known source gives another), the P12 contract (one library, any hand, attached at a grip in the engine). The sword adds 10 px of reach and swings 1.4 times as hard, with the holder's own wind-up, so it feels as quick: a grappler's swing sends a dummy off at 490 px/s instead of 350. It lies at column 10 of the street, seen on the first screen, 32 px from the counter and clear of the cellar doorway; if it is carried out of the street (or the player leaves with it), another stands there 30 s later. It stays in hand through a switch, a door and the cantina. One weapon in hand, beside one power.
- **To change it:** numbers and the tile in `content/weapons/sword.json` (`hit`, `sources`); the hand points in `content/grips.json`; the pick-up reach is `weaponPickupReach` in `content/tuning.json`; the words in `content/prompts.json`. Another button for picking up is one Use entry removed (`src/sim/use/weapon.ts`) and a branch in the grab.
- **Where:** `docs/plan/step-23.md`; `docs/mechanisms/weapons.md` (by the last push); `src/sim/weapons.ts`.

### 2026-11-24 · After a deploy, a phone that is trying to come back is given 10 seconds per try instead of 3
- **Decided by:** Step 5 flakes builder (brief `step-5-e2e-flakes.md`), `session_017WiGzJ2rqEpKFJmGDriwjQ`
- **Instead of asking:** "How long should a page wait on one try to reconnect before it gives up and tries again?"
- **Why this way:** "coming back after a sleep or a network change" (your words, for phones). After a minute of failed tries during a deploy, Chrome holds each new try back by up to about 5 seconds before it even dials; at 3 seconds the page gave up on every try while Chrome held it, and could stay "Reconnecting…" with the game back up. 10 seconds outlasts that hold with room. A phone whose network changed or that wakes up still retries at once (it did before; unchanged). The cost: a try that truly hangs is waited on 10 seconds, not 3.
- **To change it:** `CONNECT_MS` in `src/net/client.ts` (it belongs in `content/net.json` as `connectMs` when that file is next touched).
- **Where:** `docs/mechanisms/network.md`, "Coming back"; `docs/plan/step-5.md`, "Builder notes > Flakes".


### 2026-11-24 · Step 21: the grappler and the brawler have five hearts; a hero with none is out and you carry on as the next one
- **Decided by:** hearts builder, push 2, `session_017WiGzG7mhviEaxroo5GvBv`
- **Instead of asking:** "Should the sturdy heroes have more hearts? And when a hero runs out, who do you become, and where?"
- **Why this way:** the owner: "Once all heros in the party are out of hearts, that's a game over", so a hero with none is out until then, and you are not. Five for the grappler and the brawler because they are the sturdy ones (push 1's measurement: a grappler who fights badly in the camp's third wave goes down about seven times in 90 s, the light heroes as often in half the time), and it keeps the camp scenarios of other steps exactly as they were (their grappler falls four times). When yours is out you become the next hero in the party with hearts that nobody else is playing, right where you got up; if that hero would not fit there (a crawlspace), at the room's way in. Nobody can switch to an out hero, and a friend joining is never given one.
- **To change it:** `heroes` in `content/hearts.json`; the way in is the room's first spawn (`src/sim/systems/heart-out.ts`, `spotFor`).
- **Where:** `docs/mechanisms/defeat.md`, "Hearts". `DRAFT:`
### 2026-11-24 · Step 23: a hard hit knocks a weapon out of anyone's hand; Grab throws it; a camp fighter starts with a sword you can steal; each hero keeps their own
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzF7puSFWh2BBeii8WZ`
- **Instead of asking:** what loses you a weapon, how you throw one, which bad guy carries one, and whose it is after a switch.
- **Why this way:** D-081 and Step 9's own threshold, for anyone (a bad guy too, which is how you steal: D-009); no second threshold. The owner: "No inventory. Only one weapon at a time", read by the orchestrator as one weapon per hero, not per party: switch away and the next member's hands are empty; switch back and it is in hand. Grab is the hands button: with a weapon in hand it throws it (stick down: sets it at your feet) and lifts nobody. A thrown sword sends what it meets flying like a swing and lies where it stops. `camp-fighter-2` carries a sword: measured, with `camp-fighter-1` (the first choice) a Step 21 scenario's throw moved by 2 ticks, so the second fighter; with him every other step's scenario stays green (310 of 310 besides my own). Beaten in the camp, the first fall knocks it out of your hand and it lies inside. A loose weapon never fades.
- **To change it:** `weaponStaysWithHero` 0 in `content/tuning.json` (the weapon follows the player through a switch); `carriers` and `thrown` in `content/weapons/sword.json`; the threshold is Step 9's `powerHardHitSpeed`. Hit to throw instead of Grab is a branch in `src/sim/systems/weapon-throw.ts` and the attack verb.
- **Where:** `docs/mechanisms/weapons.md`; `docs/plan/step-23.md`, "Builder notes".
### 2026-11-24 · The phone's buttons are now one family from the approved UI sheet, show a press at once, and grey out when a press would do nothing
- **Decided by:** builder, brief owner-better-buttons, `session_017WiGzJ23ionY6B1PB5Nmme`
- **Instead of asking:** "What is wrong with the buttons: the look, the size, the place, or how they answer a press?" (asked; no answer yet)
- **Why this way:** you asked "Can we get better player buttons? Do we need new assets for those or do we have them already somewhere unused?" They were mostly there, unused: the P07 UI sheet's round buttons (boot, sword, star) and d-pad. Grab and Use keep their hands on the same round plate, since no approved sheet draws a grab or Use glyph; those are on the missing list. Use and Switch go grey when pressing them would do nothing, so a press that does nothing is never a surprise. Sizes and places did not move, because every picture reads at its size.
- **To change it:** delete `assets/ui/touch/p07/` (today's buttons come back), or re-cut with `tools/art/touch/cut.py` (the arrow-key stick is one word: `keys`); the grey-out rule is `src/client/button-idle.ts`.
- **Where:** `docs/plan/step-5.md`, "Buttons"; `docs/mechanisms/phone-shell-look.md`.
### 2026-11-24 · Alarms from the sides: a horn's wave can walk in at both edges of the screen, a stronger one each time, each named by a banner
- **Decided by:** owner-enemies-chase-alarms builder, `session_017WiGzF31gfYgeWNMA7rnEL`
- **Instead of asking:** "Where exactly do the enemies an alarm calls come in, and how is a stronger one shown?"
- **Why this way:** the owner: "Alarms should spawn more enemies of increasing strength that come in from the sides." A wave is split between the left and the right of where the hero was last seen (never where the hero is now: the bandits only know what they saw), each half at the nearest way in at least about half a screen away, so they arrive at both edges of the phone's screen; each row is named by a banner ("Two more!", "Here comes a heavy!") and sounds the alarm. Only a finished call brings anyone, as before.
- **To change it:** `entries`, `entryAway` and `announce` in each place's `content/outposts/` file; leave `entries` out and the place behaves as before. Built and proven in a check room; switching it on in the Bandit Camp waits on seven scenarios being re-timed, and the quarry's entry points are Step 22's.
- **Where:** `docs/mechanisms/outposts.md`, "From the sides, stronger each time". `DRAFT:`
### 2026-11-24 · Step 22 push 3: reach the far end of the depot and the quarry is cleared, with up to three stars; your best shows on the quarry's sign
- **Decided by:** Step 22 builder, push 3, `session_017WiGzJb4az7buiHeYEH77B`, on the lead's brief (`handoff-prompts/step-22-stage.md`)
- **Instead of asking:** "What earns each star, what counts as 'unseen', and may the best time be written on the sign by the door?"
- **Why this way:** the owner: "Stage cleared, with a star rating and some stats". Stars, from the step's decided reading: one for finishing; two for a time at or under the stage's `good` time, or at most one start-over; three for two and any of: nobody saw you, no alarm finished, or a time at or under the `best` time (so the fastest clears also earn three; the brief had `best` only as a target). "Unseen" is the heist's own test made the stage's: no bad guy of the quarry ever had a hero in sight, the same sight the band draws (a toll-keeper counts: he is a bad guy). "Enemies defeated" counts bad guys a hero knocked flat, as the Hall does, until "beaten for good" lands. The hoard counts when carried out, or still in a hero's hands at the end (the end is inside the depot). The sign by the door shows the best as stars only, because the game picture never carries a digit (Step 2's "no numbers", the sign's own rule); the menu row shows the stars and the time. Standing in the end does not start a new run; walking back in later starts a fresh one over the quarry as it was left (only being beaten puts it back). The star times are still placeholders (10 min and 5 min) until the hero runs measure them.
- **To change it:** the numbers are `stars` in `content/stages/iron-quarry.json` (`good`, `best`, optional `tries`); the star rule is `stageStars` in `src/sim/stage.ts`; what counts is `src/sim/systems/stage-run.ts`; the sign's stars `drawBest` in `src/client/draw/levels.ts`.
- **Where:** `docs/mechanisms/stages.md`; `docs/plan/step-22.md`, "Builder notes". `DRAFT:`

### 2026-11-24 · Step 23: a hammer in the Bandit Camp swings slow, launches far and breaks a cracked wall; a spear reaches furthest; your weapon shows on the plate
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzF7puSFWh2BBeii8WZ`
- **Instead of asking:** how the hammer and spear should differ from the sword, where the hammer lies, what it breaks, and how a held weapon shows.
- **Why this way:** the step file: "A hammer found in the Bandit Camp swings slow and sends a fighter across the room and through a cracked wall"; doc 08, "hammer slams". The hammer adds a third of a second to the wind-up and more than doubles the launch; its swing breaks a cracked wall, a fence or a stall it reaches, not the camp's barricade (the wagon's). It lies just past the camp's entrance block. The spear has the longest reach and was added as one data file with no code, the owner's "content is data". The plate shows the one weapon in hand in its own slot (no inventory).
- **To change it:** `content/weapons/hammer.json` and `spear.json` (`hit`, `breaks`, `sources`); the slot is one entry in `src/client/draw/hud.ts`.
- **Where:** `docs/mechanisms/weapons.md`.



### 2026-11-24 · Step 21: GAME OVER: a second's pause on the last fall, then everyone is in the cantina with every heart; walking into the cantina also gives every heart back
- **Decided by:** hearts builder, push 3, `session_017WiGzG7mhviEaxroo5GvBv`
- **Instead of asking:** "What exactly happens at a game over, how long does it take, and is the cantina where hearts come back?"
- **Why this way:** your words: "Once all heros in the party are out of hearts, that's a game over (back to cantina)", and "never a reload, never held" (D-019, "there is always a way out"). The last fall is seen for a second, then everyone playing is on the cantina's pads, on their feet at once; GAME OVER, "Back to the cantina", "Every heart back" across the middle of the screen for about three seconds, gone at any touch, and the controls work through it. A prize you were carrying goes back on its stand; a power or a weapon you held lies where you stood; alarms end and waves walk off; nothing you found is lost. In the quarry the game over is its own start (the road), as you asked for the stage, until you say otherwise. Walking into the cantina at any time also gives the party every heart back (the brief's open question; the other answer is a heart for an out hero only).
- **To change it:** `gameOver` in `content/hearts.json` (where, `beat`), `gameOver` in `content/defeat/<place>.json` (per place); the refill is one block in `src/sim/systems/heart-game-over.ts`; the words at the top of `src/client/draw/game-over.ts`.
- **Where:** `docs/mechanisms/defeat.md`, "Hearts". `DRAFT:`


### 2026-11-23 · Step 4: pips — the street's alert follows you into every room, under your party's faces, with a banner when it rises
- **Decided by:** town-tiers builder, `session_017WiGzFxZZnM2VcdqhXnrNu`
- **Instead of asking:** "Where do the alert marks sit now the party plate is in that corner, and do they follow you out of the street?"
- **Why this way:** D-067/D-077 (pursuit is hard to reverse; a level transition never resets it), doc 26's "cross-zone wanted carryover" (left open there, so `DRAFT:`). The pips show the highest alert of any area wherever the party is, just under the party plate so the two never overlap. Only the picture travels: guards elsewhere still know nothing. Each new pip shows a two-second banner with words from the dispatch file ("The watch is called", "More of the watch", "The whole watch is out"; no digits). Also: **the guard who rang the bell himself whistles too.** Traced on a phone: the usual fight (punch him until he is furious) makes him the caller, never a responder, so the whistle would never have come; a furious guard while his street's alert is up now counts as after you.
- **To change it:** the pips' place is `PX`/`PY` in `src/client/draw/alert.ts`; the words are `banners` in `content/dispatch/castle-street.json`; the furious guard is the `raging` line in `src/sim/systems/alert-whistle.ts`.
- **Where:** `docs/mechanisms/npc-response.md`, "The town's tiers".
### 2026-11-24 · Step 22: "enemies defeated" counts only bandits beaten for good; being beaten in the quarry brings them all back
- **Decided by:** Step 22 builder, `session_017WiGzJb4az7buiHeYEH77B`, on the lead's follow-up (owed item a)
- **Instead of asking:** "Does a mere knock-down count as defeated?"
- **Why this way:** the owner: "Enemies can't be fully defeated"; beaten-for-good is his rule now, so the victory screen's "enemies defeated" counts bandits beaten for good (three knock-outs or one big slam), not knock-downs. Being beaten puts every one of them back (the stage's start-over). While a run is on, the whole quarry holds them gone, even in rooms nobody is in (the lead's ruling), so the 90 s return never undoes your work mid-run; once you clear it or leave, they come back as anywhere else.
- **To change it:** the count is the `defeated` branch in `src/sim/systems/stage-run.ts`; the hold is its `holdReturns` line.
- **Where:** `docs/mechanisms/stages.md`; `scenarios/step22-beaten-stay-beaten-in-a-run.json`. `DRAFT:`

### 2026-11-24 · Step 21: hearts on the party plate: a row under each face, a pop and a sound when one is lost, an out hero's face greyed
- **Decided by:** hearts builder, push 4, `session_017WiGzG7mhviEaxroo5GvBv`
- **Instead of asking:** "Where and how should the hearts show on a phone?"
- **Why this way:** "Heros should have hearts which can be lost": you have to see them go. Your own hero's hearts are the pink hearts the props builder cut from the approved UI atlas, under your face; each friend's (or free hero's) hearts are tiny ones in the same colours under their face; a lost heart swells and fades with a low "hurt" sound everyone hears; a hero with none left has a greyed face. The GAME OVER card has a slowed warble. No numbers anywhere.
- **To change it:** sizes and colours at the top of `src/client/draw/hearts.ts`; the sounds in `content/sounds/heart-lost.json` and `game-over.json`.
- **Where:** `docs/mechanisms/rendering-world.md`, "The party plate". `DRAFT:`

### 2026-11-24 · A second power replaces the first: the old one pops out of you as an orb
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzJahGCHPU26omeZQNq`
- **Instead of asking:** what happens when a hero holding a power walks into another one (before: they walked through it).
- **Why this way:** the owner, 2026-11-24: "Similar to kirby - cant have multiple powers at once". Touching a second power's orb, or a lit pedestal, takes it; the one you held pops out where you stand, as a knocked-loose one does, and lies there for anyone (or fades). You do not take it back while still standing on it, so standing still never swaps back and forth; step off and walk back over it to swap again. A power you already hold is walked through. A weapon and a power together still stay (asked of the owner in the inbox).
- **To change it:** `swapOut` in `src/sim/power-orbs.ts`, called from the two places a power is taken; removing the two calls and the two `h.c.power?.id === ...` tests brings back walking through.
- **Where:** `docs/mechanisms/powers.md`, "Carriers and orbs".

### 2026-11-24 · A beaten bad guy who comes back carries his sword again only if his old one is gone
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzJahGCHPU26omeZQNq`
- **Instead of asking:** when a camp fighter who carried a sword is beaten for good and walks back in 90 s later, does he have a sword again?
- **Why this way:** the brief: "Swords must not pile up". He comes back with empty hands while the sword he was handed is still somewhere in the world (lying in the camp, in your hand, or carried by another party member). Once it has left the world (its holder left the game), he comes back armed.
- **To change it:** `weapon-carriers` (`src/sim/systems/weapon-carriers.ts`): drop the `out` test and he is armed every time, as before.
- **Where:** `docs/mechanisms/weapons.md`, "Carriers".

### 2026-11-24 · Step 21: in the castle street, being beaten no longer throws you into the courtyard: hearts and the game over are what losing is
- **Decided by:** hearts builder, push 5, `session_017WiGzG7mhviEaxroo5GvBv`, on the orchestrator's brief
- **Instead of asking:** "Should the old 'beaten twice, thrown out' rule stay alongside hearts?"
- **Why this way:** your rule replaces it: "Heros should have hearts which can be lost. Once all heros in the party are out of hearts, that's a game over". Switched off by data, nothing deleted. The Bandit Camp and the quarry keep their throw a little longer, until two other builders' checks no longer lean on it.
- **To change it:** `"on": true` in `content/defeat/castle-street.json` brings the throw back.
- **Where:** `docs/mechanisms/defeat.md`, "Hearts". `DRAFT:`

### 2026-11-24 · At a game over, the weapon you had goes back where you found it
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzJahGCHPU26omeZQNq`
- **Instead of asking:** when the whole party is out of hearts and everyone is back in the cantina, what happens to the sword or hammer you were holding?
- **Why this way:** the brief: "a carried weapon at a game over goes back where it was found". The camp's hammer is back on its spot at once, and a sword you stole from a camp fighter is back in his hand, so the place is as you first found it. A weapon you lost earlier in the fight and left lying stays where it lies.
- **To change it:** delete `src/sim/systems/weapon-game-over.ts` and the weapon lies where you fell, as before.
- **Where:** `docs/mechanisms/weapons.md`, "Carriers"; `docs/mechanisms/defeat.md`, game over.

### 2026-11-24 · Step 22: in the quarry's depot, a called wave now walks in on your own stretch of the yard and comes for you, with a banner ("Here they come!")
- **Decided by:** Step 22 builder, `session_017WiGzEsUx1mHyijtCDT1gt`
- **Instead of asking:** where in the depot a wave should walk in, so that the owner's "Alarms don't seem to do anything yet" stops being true there
- **Why this way:** the owner, playing: "Alarms should spawn more enemies of increasing strength that come in from the sides". Before, every wave walked in at the far east end and dropped into the pocket under the floor's dip, so it never reached anyone west of it. Now each stretch of the yard has entry tiles, and a wave comes in at the nearest one at least six tiles from where the lookout saw you (`entryAway` 6), on both sides when there is room. None by the west door (a wave walked straight out of it); the kerb over the dip is not placed (not needed). The banner words are a `DRAFT:` ("Here they come!", "More of them!", "Here comes a heavy!").
- **To change it:** `entries`, `entryAway` and `announce` in `content/outposts/quarry-depot.json`; taking `entries` out puts every wave back at the far east end.
- **Where:** `docs/mechanisms/outposts.md`, "The depot"; `docs/plan/step-22.md`, Builder notes. `step16-caught-fight` was re-routed (the grappler waits out the wave on the high ledge), every claim kept.

### 2026-11-24 · The camp's alarm brings bandits in from both sides, a bigger and tougher group each time, and says so in a banner
- **Decided by:** chase-and-alarms builder (`owner-enemies-chase-alarms.md`), `session_017WiGzHgbh9PtsdzXnTDvqz`
- **Instead of asking:** where in the Bandit Camp the "sides" are, and what each row brings.
- **Why this way:** the owner, playing: "Alarms should spawn more enemies of increasing strength that come in from the sides". Each finished horn call now splits its row between the nearest way in at least 12 tiles (about half a phone screen) to the left and right of where the caller saw you, so they walk in at both edges of the screen. The rows grow: one fighter; two; a fighter and a heavy; two fighters and a heavy; then a heavy and the brute, which comes again for every later call (never a last wave). A banner names each row ("Here comes the brute!"). The ways in are the five the previous builder measured, all in the camp's first two screens; the west one is on the step beside the door, so on later rows a bandit can come in between you and the way out. Getting out past them was not measured cleanly (my steering probe failed even with the old far-off entry); being thrown out after four falls still always gets you out.
- **To change it:** `content/outposts/outpost.json`: `entries` (where they walk in), `entryAway` (how far off), `waves` (who comes, row by row), `announce` (the banners). Taking out the `[6, 7]` entry keeps the door side clear (then they all come from the east in the first screen). The camp's east half (Step 20's run) has no entries yet: adding `[58,10]` and `[70,10]` turns a Step 23 check red.
- **Where:** `docs/mechanisms/outposts.md`, "From the sides"; `docs/plan/step-4.md`, "Alarms and the chase, as played", push 4.

### 2026-11-24 · Step 22: reach the quarry's far end and STAGE CLEARED fills the screen: stars light one by one with a chime, then your time, enemies defeated, alarms and game overs count up; Continue under your right thumb
- **Decided by:** Step 22 builder, push 4, `session_017WiGzEsUx1mHyijtCDT1gt`
- **Instead of asking:** how the victory screen should look and behave, and who sees it with friends
- **Why this way:** the owner: "Needs a satisfying victory screen at the end. Stage cleared, with a star rating and some stats (time to clear, enemies defeated, etc)". In the game's own pixel letters on its dark plate with the gold edge (the banners' look), the star the Hall's picture frame already uses (a real star is still a missing-list item), the secret-found chime for each star. Your stick rests while it is up so you can read it; Continue (or Enter/Space/Escape) gives it back at once; the world never pauses; a friend's screen is their own. It shows to anyone whose hero is in the quarry when it is cleared, not to a friend elsewhere. "Tries" reads "Game overs" (hearts are how you lose now). Hearts left is not shown yet.
- **To change it:** words, times and sizes at the top of `src/client/draw/stage.ts`; the sound is `STAR_SOUND` there; the button's place in `src/client/index.html` (`#stage-continue`).
- **Where:** `docs/mechanisms/stages.md`, "The victory screen"; `docs/plan/step-22-shots/push4-*`.

### 2026-11-24 · A bomb: Hit throws it, it bursts on what it meets or after a moment, and everything near flies, you too
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzJahGCHPU26omeZQNq`
- **Instead of asking:** how the bomb is used, when it goes off, and whether it hurts the one who threw it.
- **Why this way:** the step file: "a bomb is thrown and everything near where it bursts flies"; doc 08: "recklessly, carelessly destructive action including self-destructive stunts". Hit throws it (Grab does too; stick down sets it down unlit). It goes off on the first body it meets, or 1.2 s after it lands, launching everything within about two and a half tiles (you as well) and breaking a cracked wall near it. A lit bomb blinks and can't be picked up. It is gone after it bursts, and its spot has another 20 s later. For now it lies only in the test room; its place in the quarry comes with Step 22's lead.
- **To change it:** `content/weapons/bomb.json` (`burst`, `thrown`, `use`); the burst look's time is `weaponBurstShow` in `content/tuning.json`.
- **Where:** `docs/mechanisms/weapons.md`.

### 2026-11-24 · In the cantina, a tap on a regular counts where your own screen showed them, within a little over a body's width
- **Decided by:** cantina tap builder (brief `cantina-tap-a-walking-regular.md`), `session_017WiGzJ2rqEpKFJmGDriwjQ`
- **Instead of asking:** "How far from where the server has a walking regular may a tap land and still pick them?"
- **Why this way:** D-083/D-084 ("tap one, the party shows across the screen") and touch first (D-093). Your phone draws other people a little behind the game's truth, so a tap on a regular who was walking missed about half the time. Your phone now says which regular it showed under your finger, and that one is taken if the tap is within 40 pixels more than the old reach: how far the fastest regular walks in about a third of a second. A tap that far from anyone still opens nothing, and a finger is not made wider for regulars standing side by side.
- **To change it:** `pick.lag` in `content/cantina/cantina.json` (0 puts back the old rule).
- **Where:** `docs/mechanisms/cantina.md`, "A tap on a walking regular".


### 2026-11-24 · Step 21: in the Bandit Camp too, being beaten costs hearts and no longer throws you out; stand there long enough and it is GAME OVER
- **Decided by:** hearts builder, push 5b, `session_017WiGzG7mhviEaxroo5GvBv`, with the orchestrator's go
- **Instead of asking:** "Should the camp still throw a beaten hero into the courtyard now that there are hearts?"
- **Why this way:** your rule replaces it (hearts, then game over in the cantina). A hero who just stands among the camp's fighters loses the whole party's hearts in about a minute and a half and is back in the cantina. Only the Iron Quarry still throws you back to its start, until its stage builder has moved to the game over.
- **To change it:** `"on": true` in `content/defeat/outpost.json` brings the camp's throw back.
- **Where:** `docs/mechanisms/defeat.md`, "Hearts". `DRAFT:`


### 2026-11-24 · Step 4: rows from the sides: the town's help walks in at both edges of your screen, not at the far street doors
- **Decided by:** town tiers builder, `session_017WiGzFCmKRjkeGNrUSbDvu`
- **Instead of asking:** "In the castle street, where should the guards a whistle or a bell brings walk in?"
- **Why this way:** the owner, 2026-11-24: "Alarms should spawn more enemies of increasing strength that come in from the sides." A row now walks in on the street floor on both sides of where they were told you are (never where you actually are: escalation is not omniscient), about half a phone screen off, so they appear at the edges of the view and close in; one each side, alternating. The words "The watch closes in from both sides!" and "The whole watch is upon you!" are shown as rows walk in. When it is over they leave by the nearer street door. Measured: every hero still gets out of the street at the top level, running west past the arrivals (one scenario per hero); for the brawler it takes about 1.3 s longer than before.
- **To change it:** `entries` and `entryAway` in `content/dispatch/castle-street.json` (left out: back to the doors); `announce` for the words.
- **Where:** `docs/mechanisms/npc-response.md`, "The dispatch"; `src/sim/systems/alert-dispatch.ts`. `DRAFT:`


### 2026-11-24 · Step 23: the spear and the bomb lie on the quarry road, and come back each time the stage starts over
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzGmHC7ngNDZecPb15v`; the tiles proposed to Step 22's lead (`session_017WiGzF7NsB3KTwXkWUXE63`) by message; they agreed (05:54 UTC).
- **Instead of asking:** where in the game a player first finds the spear and the bomb, and what happens to them when the quarry starts over.
- **Why this way:** the step file: "a spear and a bomb in the quarry (Step 22's stage), each seen on screen before it is reached". The spear lies two steps from where you come in from the courtyard, so it is the first thing you see; the bomb lies on the ledge just before the toll-keeper and his watcher, so the first thing you can do with it is throw it into them. When the stage starts over (you lost), both lie where they began again at once, as the stage puts its people back. A weapon in your own hand is kept through the start-over.
- **To change it:** the `sources` rows in `content/weapons/spear.json` and `content/weapons/bomb.json` (room and tile); for a start-over that also takes the weapon out of your hand, `restoreRoomWeapons` in `src/sim/weapons.ts`.
- **Where:** `docs/mechanisms/weapons.md`, "A stage starting over".

### 2026-11-24 · Step 24: the first enemy who throws things stands on the balcony of the Hall of Legends
- **Decided by:** orchestrator `session_017WiGzHhT2apmWHT61rQ65G`, from a subagent's draft
- **Instead of asking:** "Where should the first ranged enemy stand, and may it be in your Hall?"
- **Why this way:** your gaps list's top unowned row is enemy variety (no enemy fights from range; the castle's rooms have nobody hostile). The Hall's balcony is the one room nobody is building in tonight, he guards the climb out and a hidden piece there, and you wrote "Do not ... protect the Hall of Legends from gameplay". He is scripted: a fixed arc, shown as dots before every throw, never aimed; a hit launches you, never a number; what he throws stays to be thrown back.
- **To change it:** his place is one line in `content/placements/hall-gallery.json`; everything about how he throws is data in his own file (`DRAFT:` throughout, `docs/plan/step-24.md`).

### 2026-11-24 · The wings now wait in the hidden place under the depot's strongroom, not on the main way through it
- **Decided by:** Step 22 builder (the fourth), on the Step 16 lead's tile and the orchestrator's ask, `session_017WiGzEWjmrpsPDvpwxZXir`
- **Instead of asking:** "Where in the depot should the wings stand, now that every hero crossing the strongroom picks them up?"
- **Why this way:** the Step 16 lead's answer: the wings are the pay-off of a hidden place, at [38, 18] on the floor under the strongroom. You get there by throwing the cellar's heavy rock through the cracked wall; climbing the shaft's ledges is the way back up. Nothing else about the wings changed: same flaps, same fade, same pedestal that lights again once they are lost, and the place it stands is still remembered as found.
- **To change it:** the tile is one entry in `content/powers/flight.json` (`sources`); the Step 16 lead said to move it east within columns 38-43 if a route breaks. Two Step 9 scenarios walk the cellar route to it (`step9-fades-then-source`, `step9-second-power-replaces` and its control).
- **Where:** `docs/mechanisms/powers.md`, "Sources"; `docs/plan/step-22.md`, "Builder notes".

### 2026-11-24 · In the quarry you are no longer thrown out: running out of hearts is how you lose, and it starts the stage over
- **Decided by:** Step 22 builder (the fourth), on the lead's order (e), `session_017WiGzEWjmrpsPDvpwxZXir`
- **Instead of asking:** "Now that hearts are the way to lose, should the quarry still throw a beaten hero back to its start on top of that?"
- **Why this way:** your rule: "Once all heros in the party are out of hearts, that's a game over". The camp and the street already dropped the throw. In the quarry the game over lands where the throw did, at the road just inside the doorway, and the stage starts over then. One consequence: with a friend, one of you losing a hero no longer sends anyone back. You play on as the next hero, and the stage starts over only when the whole party is out, which sends everyone back together.
- **To change it:** `"on": true` in `content/defeat/quarry.json` brings the throw back. Its fields are kept, and the stage still listens for it.
- **Where:** `docs/mechanisms/defeat.md`; `docs/mechanisms/stages.md`, "The rule"; `docs/plan/step-22.md`, "Builder notes".

### 2026-11-24 · Step 23: a weapon can wear out (none you find does yet); a bad guy picks up a spear he stands on
- **Decided by:** Step 23 builder (`handoff-prompts/weapons-pick-up-and-swing.md`), `session_017WiGzGmHC7ngNDZecPb15v`
- **Instead of asking:** whether weapons break with use, and whether bad guys grab weapons lying around.
- **Why this way:** the step file decided the sword, hammer and spear never wear out and the bomb is spent by its one burst; the game can now also wear a weapon out after some swings (it breaks in your hand with its broken picture), shown only on a test weapon until you want one that does ("Should a weapon wear out?" is still yours, by playing). A bad guy with empty hands who is standing on a dropped spear picks it up, so a spear knocked out of your hand into a fight can end up swinging back at you. He never walks over to fetch one (NPCs stay scripted). For now only the spear: with the hammer on too, the bandits who pour into the camp at an alarm pick up the camp's hammer and the camp's fights play out differently (other parts of the game's checks broke); with the sword on, the camp fighter grabs his sword straight back when you knock it out of his hand, which spoils stealing it. The bomb is left alone (a bandit throwing it on every swing would be chaos).
- **To change it:** `uses` in a weapon's file (a number of swings; take it out and it never wears out); `takenByBadGuys` in a weapon's file (true or false).
- **Where:** `docs/mechanisms/weapons.md`, "Wearing out" and "Bad guys take one by touch".

### 2026-11-24 · Step 20: the wave's wagon: the fourth horn call brings a bandit driving a ram wagon at you, slow enough to walk away from
- **Decided by:** vehicles builder B, push 3 (brief `loop-vehicles-b.md`), session_017WiGzJfeRQoKZSky3npQv6
- **Instead of asking:** "Which wave brings the second wagon, and how does it come in?" (O-008, O-009 are OPEN)
- **Why this way:** the owner: "no vehicle hijacking", and "Alarms should spawn more enemies of increasing strength that come in from the sides". D-023 says the machine sent to stop you can be turned on the pursuers. The fourth row ("Here comes a wagon!") is two fighters and a heavy, and the first fighter now rides in at the reins of a ram wagon, from a side like the rest. The wagon is driven at the place the lookout saw you, at the wagon's bandit speed (60; the slowest hero, the brawler, runs at 76), so you can walk away, Grab him out of the seat and drive it into the wave. It's the fourth row because it comes once: the last row repeats forever, and since wagons don't count toward the camp's cap on people they would pile up. And as measured, a wagon in the third row breaks two of the camp's wave scenarios.
- **To change it:** move `"rides": "ram-wagon"` to another person in `waves` in `content/outposts/outpost.json` (any row), or take it out. The rule is `rides` in `src/content/kinds/outposts.ts` and a few lines in `src/sim/systems/outpost-wave.ts`. Undo: revert the commit.
- **Where:** `docs/mechanisms/machines.md`, "Getting a person's machine into a room" and "The wave's wagon in the Bandit Camp"; `docs/plan/step-20.md`, "Builder notes". `DRAFT:`

### 2026-11-24 · The quarry's star times: under 45 s for the fast star, under 60 s for the good one
- **Decided by:** Step 22 builder (the fourth), 3b, `session_017WiGzEWjmrpsPDvpwxZXir`
- **Instead of asking:** "How fast should you have to clear the quarry for each star?"
- **Why this way:** the brief: set the times from scripted clears (a slow, a good and a best run). Ten scripted clears were run, each of the five heroes alone, fighting and sneaking. The fastest took 38.6 s, a good one 51.6 s and a slow one 62.0 s, and the two times sit between them. The times only matter after a game over: a clear on your first try is two stars whatever the time, and three if no alarm was raised. A script never hesitates, so on a phone these will feel tight.
- **To change it:** `stars.good` and `stars.best` in `content/stages/iron-quarry.json` (seconds). The five `step22-stars-edges-*` scenarios move with them (their seeded `started`).
- **Where:** `docs/mechanisms/stages.md`, "Checking it"; `docs/plan/step-22.md`, "Builder notes".

### 2026-11-24 · "Sneaking through" the quarry means no punch and no alarm, not unseen
- **Decided by:** Step 22 builder (the fourth), 3b, `session_017WiGzEWjmrpsPDvpwxZXir`
- **Instead of asking:** "What must a sneaking run through the quarry achieve, when the main way walks past the toll-keeper and the road's fighters in plain view?"
- **Why this way:** the lead's ruling allowed leaving the toll-keeper out of "unseen" if no route passes him. But the road's fighters see you on the main way too, so for now a sneak is getting from the entrance to the end without a punch and without a horn call completed. The victory screen's "unseen" still means what it says, and none of the ten scripted clears earns it.
- **To change it:** the claims in `scenarios/step22-each-hero-sneaks-*.json`. A quiet route for the whole stage is placement work (Step 22 push 5).
- **Where:** `docs/mechanisms/stages.md`, "Checking it".

### 2026-11-24 · Step 24: the thrower sees a little farther than he throws, never leaves his spot, and his fourth shot makes his oldest vanish
- **Decided by:** Step 24 slice 1 builder (`handoff-prompts/ranged-enemy.md`), `session_017WiGzEb3ESHBHGr3vhpB3k`
- **Instead of asking:** "When you come into a thrower's view, should he throw at once, or let you see him first? Does he ever step after you? When are his old shots cleaned up?"
- **Why this way:** "readable enemies" (`docs/vision.md:74`) and D-055's fixed behaviour. His sight band reaches 13 tiles and his throw 11, so his band touches you a step before he can throw at you: you see him look your way, then raise the shot with its arc drawn for 0.6 s, then it flies where it was aimed (you can step or jump out of it). He never walks, not after a hero and not after a guard; he still turns and swings weakly at anyone right up against him. Knocked hard while aiming, his shot drops for anyone and that throw is lost; a light tap only interrupts the aim. At most three of his shots lie about (the one in the air counts); a fourth makes the oldest vanish in a poof. A shot in anyone's hand never vanishes.
- **To change it:** `sight` and `ranged` in `content/npcs/ranged-fighter.json` (`range`, `aim`, `every`, `speed`, `lift`, `out`); never walking is one rule in `src/sim/systems/ranged-throw.ts` (the input it keeps).
- **Where:** `docs/plan/step-24.md`, "Builder notes"; `src/sim/systems/ranged-throw.ts`.

### 2026-11-24 · The town's alarm check accepts a guard calling by bell or by whistle
- **Decided by:** orchestrator `session_017WiGzHhT2apmWHT61rQ65G`
- **Instead of asking:** "When you hit a furious guard, should he always blow his whistle, or may he run back to ring the bell?"
- **Why this way:** four builders lost most of their time to one test that insisted on the whistle. Measured with the server's own log: on a real connection the guard often rings the bell again instead, and the bell's bar is drawn and brings the row just the same. What you need on your phone is to see a call filling and the row arriving, whichever he uses, so the test now checks that. The game's rule for which he picks is unchanged.
- **To change it:** say the guard should always whistle when struck; that is a rule in the guard's call logic, and the test tightens back in one line.

### 2026-11-24 · The phone's screen furniture made readable: 44 px controls, words on a lit button, bigger friends' hearts, the pips on their own strip, filled and empty stars
- **Decided by:** the phone-HUD builder, brief `handoff-prompts/phone-hud-legibility.md`, `session_017WiGzHxAKbURW5YnQt6bDN`
- **Instead of asking:** "How should the hearts, pips, button words, signs, stars, title and menu button look on a phone so nothing is unreadable or mistaken for something else?"
- **Why this way:** the owner's "iPhone first" (D-093: legible pixels) and "Can we get better player buttons?"; a look pass found each piece fine alone but not together. All of it is a stand-in to judge by playing: (1) every control is at least 44 px to a thumb (the sound button and the upright hint's ×, drawn the same size, now take a 44 px touch); (2) when Use says what it will do (Take, Get in, Go in…) its picture stays lit and the word sits on a gold-rimmed pill across its foot, instead of over a greyed hand; the "^" over the stick shows only while you push up; (3) a friend's hearts are 5-pixel hearts, not 3-pixel "vvv"; the town's alarm pips sit on their own small strip led by a warning sign, so they don't read as hearts; (4) a level sign's few pieces sit on the name's line instead of a near-empty second line; (5) a star is filled when earned and empty when not, never dimmed, and a star lighting flashes instead of growing over its neighbour; (6) upright, the title's choices sit below the picture; the menu button has a dark disc like the sound button. Use and Switch still dim when they would do nothing (hiding Switch was allowed by the orchestrator but taken back: a tap of Switch with a full party must still say why, Step 21's `switch-refused`). Nothing that does something was removed.
- **To change it:** each place carries a `DRAFT:` naming this brief: `src/client/index.html` (the Use word, the chevron, the hint's ×), `src/client/audio/index.ts` (sound), `src/client/draw/hearts.ts` (`SMALL`), `src/client/draw/alert.ts` (`drawPipStrip`), `src/client/draw/levels.ts` (`INLINE_PIECES_W`), `src/client/draw/stars.ts`, `src/client/start.ts` (`clear`, `#menu-btn`). Revert the commits named in `docs/plan/step-8.md`, "Phone HUD", to undo any one.
- **Where:** `docs/plan/step-8.md`, "Phone HUD".

### 2026-11-24 · The quarry has a quiet way: a small hero can clear it with nobody ever seeing them
- **Decided by:** Step 22 builder (the fifth), push 5, `session_017WiGzGTsScxtYSPbqs97N3`
- **Instead of asking:** which way through the quarry should be the unseen one, and for whom?
- **Why this way:** the owner's standard, "the satisfaction of a zero-alarm infiltration", and the lead's ruling that an unseen clear must exist. The way goes around the guards rather than making them blind: a timber scaffold up over the road's toll, a wait for the road's heavy to turn and look up the road, down the ridge's chasm into the pit (its two guards now stand west of where you land, facing each other), through the depot's cellar and up the one-tile hole on a new step under it, up two steps and a plank onto the strongroom's roof, and along a gantry over the far yard that drops you into the end. The hole is one tile wide, so it is the infiltrator's, the flyer's and the skirmisher's way, not the grappler's or the brawler's; nobody has to take it, and every hero still clears by the main way. The toll-keeper is left in "unseen": the scaffold passes over him.
- **To change it:** tiles in `content/rooms/quarry-road.json` (rows 8, 9, 11) and `quarry-depot.json` (rows 8, 9, 11, 15, 17); the road heavy's turn and the pit fighter's tile in `content/placements/`. Re-record `step22-unseen-clear` with `scripts/stage-quiet.ts`.
- **Where:** `docs/plan/step-22.md`, "Builder notes", push 5; `docs/mechanisms/stages.md`, "Checking it".

### 2026-11-24 · Step 24: the balcony thrower lobs over the floor near him onto the steps; climbing out means timing the jumps between his throws
- **Decided by:** Step 24 slice 1 builder, `session_017WiGzEb3ESHBHGr3vhpB3k`
- **Instead of asking:** "How far should the gallery's thrower lob, and should standing on the floor right below him be safe?"
- **Why this way:** the brief's first numbers (200 px/s, lift 0.6, range 11 tiles, sight 13) traced well in the real room, so they stay: his arc sails over the floor just in front of him, comes down on the middle step near its east end and bounces onto the floor past it. So the climb out (the steps' INTENT: "the gallery's way out") is under fire, but each hero alone gets out by jumping up just after a shot passes and waiting where the dots pass overhead; all three were measured doing it in under 14 s. Standing behind him, or under the near floor, is safe: you learn where it lands.
- **To change it:** `speed`, `lift`, `range` and `sight` in `content/npcs/ranged-fighter.json` (the step24-gallery scenarios then need re-timing); his place is the one line in `content/placements/hall-gallery.json`.
- **Where:** `docs/mechanisms/ranged.md`, "Where one stands".

### 2026-11-24 · The quarry's sign shows three empty stars before anyone has cleared it
- **Decided by:** Step 22 builder (the fifth), push 5, `session_017WiGzGTsScxtYSPbqs97N3`
- **Instead of asking:** how does the entrance sign say "this is a stage" before there is a best?
- **Why this way:** the step's "found without being told: the entrance sign says it is a stage". Three empty stars under the name read as a rating to earn, with no word or digit added to the picture (no pixel font for new words, no digits on signs). A clear fills them as before.
- **To change it:** one line in `src/client/draw/levels.ts` (the `stage` row); a word such as "STAGE" could be added once there is lettering for it.
- **Where:** `docs/mechanisms/stages.md`, "Shown"; `docs/plan/step-22-shots/push5-sign-stage-*.png`.

### 2026-11-24 · The Bramble Forest: a flat road from a new doorway in the courtyard, then a trail you climb into, with a deep way back under it
- **Decided by:** Step 15 builder (brief `step-15-forest.md`), `session_017WiGzJeF58oqWdt3WEH722`
- **Instead of asking:** "How should the forest be laid out, and how do you get in and out?"
- **Why this way:** your rule that the world between places is walked (D-003) and that a chase follows you through doors (D-077). The new doorway is in the courtyard, just west of the quarry's. The road is flat on purpose, so a guard chasing you on foot can follow you all the way. The climbing starts in the forest: you come in at the bottom and jump up a stack of boughs onto the trail. The trail shows you a low gap, a high bough and a hatch in the floor on your first walk. At its far end you drop down a shaft and walk back west under it to the deepest spot, which is right behind where you came in. The road has one bush to hide in. Walking there and back with each hero takes one to one and a half minutes.
- **To change it:** the rooms are `content/rooms/forest-road.json` and `forest-trail.json`: any layout change is editing their rows. Hills on the road would stop guards following, which is a single row.
- **Where:** `docs/plan/step-15.md`, "Builder notes"; the rooms' own notes. `DRAFT:`

### 2026-11-24 · The forest's short way back is a cracked wall you break from inside with a crate
- **Decided by:** Step 15 builder, `session_017WiGzJeF58oqWdt3WEH722`
- **Instead of asking:** "What opens the short way back from the deepest spot, and does it stay open?"
- **Why this way:** the library's forest example (G-03): reaching the deep spot "opens a shortcut". Between the deepest pocket and the trail's start there is a cracked wall. Throw the crate lying in the pocket at it and it breaks for good. After that, coming in from the road you walk straight into the deep. From the start side nothing lying about breaks it, so the first time you have to go the long way round. A friend thrown hard at it from outside also breaks it, which is the game working.
- **To change it:** move or remove the crate in `content/placements/forest-trail.json`, or give the wall a different `breakSpeed` in the trail's room file.
- **Where:** `content/rooms/forest-trail.json` (`shortcut-wall`). `DRAFT:`

### 2026-11-24 · The forest uses stand-in pictures: the quarry's grassy ground and a still forest view behind
- **Decided by:** Step 15 builder, `session_017WiGzJeF58oqWdt3WEH722`
- **Instead of asking:** "Which pictures should the forest use before forest tiles exist?"
- **Why this way:** the brief allowed no new art tonight. The ground first borrowed the quarry's grass-capped earth; since push 2b it is cut from your TRN-01 grass and dirt, and the ledges you jump up are TRN-10's red mushroom caps. Behind it is the start view of your forest-and-waterfall panorama (BKG-01), held still on the screen and never repeated sideways (its edges don't join), with the courtyard's tree crowns along the top and its bushes along the bottom.
- **To change it:** one line in `content/atlases/forest-*.json` (the tile sheet) and `content/backdrops/forest-*.json` (the back). The full 1024-wide panorama has been asked for.
- **Where:** those files. `DRAFT:`

### 2026-11-24 · Step 15: the second place is a forest, walked to from the courtyard, played as a second stage
- **Decided by:** Step 15's lead, `session_017WiGzHD8gtSGTegd3n8W4G`
- **Instead of asking:** "Which place should the second level be, and how do you get there?"
- **Why this way:** the owner has not named a place (`docs/plan-archive.md`, Step 16: "Which level the owner wants is still undecided"); every candidate in the library is a proposal (docs 15, 25, 28). The forest is doc 04's own illustration of coming back later and golden scenario G-03's setup, and it is the one place with owner-supplied art that is not already used: the BKG-01 `forest_waterfall` panorama ("Claude can use immediately") and P10's grass/dirt and mushroom-hollow terrain rows, tagged forest. Grassy ruins, the other good fit, already dresses the courtyard, the camp and the quarry, so a forest gives a second look (gap 7). You walk there through a door in the courtyard (D-003: "not a static selector hub"), and it is a stage like the quarry (the owner's "stage cleared, with a star rating"), so a game over there sends you to its entrance, as in the quarry. Its name, "Bramble Forest", is shown data only, borrowed from doc 15's Bramblewake Woods; no id uses it.
- **To change it:** the place is the `forest-*` rooms and `content/{levels,stages,defeat,completion}/bramble-forest.json` / `forest.json`; the door is three tiles of `content/rooms/courtyard.json`. A different place is new rooms, not a rewrite of the engine. Undo: revert Step 15's commits.
- **Where:** `docs/plan/step-15.md`, "Measure"; `handoff-prompts/step-15-forest.md`. `DRAFT:`
### 2026-11-24 · The camp's door is kept clear: near the doorway, a hero gets every new row from the camp's side, never between them and the way out
- **Decided by:** camp-entries builder (`handoff-prompts/camp-entries.md`), `session_017WiGzGkuNQcsBDa2oWh23s`
- **Instead of asking:** "Your rows come in from both sides of you. When you stand near the Bandit Camp's only doorway, should the half that comes from the doorway's side still walk in there, between you and the way out, or wait, or come from the other side?"
- **Why this way:** "There is always a way out" (yours, in `CLAUDE.md`), against your "come in from the sides". Measured in the sim (five heroes, columns 8-20, every row, running for the door): with the old rule 6 runs in 100 never got out, every one with a heavy or the brute walking in on the step beside the door. With this rule, 2 in 100, both starting 13 or more tiles from the door. They come from the other side rather than waiting, so the row is just as strong and nothing is held back. More than 12 tiles from the door, rows still come from both sides as before.
- **To change it:** `doorClear` in `content/outposts/outpost.json` (left out, it is the old rule); how far counts as near is the outpost's `entryAway` (12 tiles, about half a phone screen). To have that half wait instead is a small change in `doorSafe` in `src/sim/systems/outpost-wave.ts`.
- **Where:** `docs/mechanisms/outposts.md`, "From the sides"; `docs/plan/step-4.md`, "Camp entries".
### 2026-11-24 · The phone's screen furniture, second pass: hearts under their own face, an alarm meter, bigger buttons sideways, the game's lettering on the hint and Use's word
- **Decided by:** the second phone-HUD builder, brief `handoff-prompts/phone-hud-legibility.md` ("Landed so far" list), `session_017WiGzJNmuKNGA2yndGCP34`
- **Instead of asking:** "How should what is still unclear on the phone's screen look after the second look?"
- **Why this way:** the owner's "iPhone first" (D-093: legible pixels) and "Can we get better player buttons?". All stand-ins to judge by playing: (1) a friend's hearts wrap three to a line under that friend's face, with a faint divider between friends, so a 5-heart friend's row no longer runs under the next face; (2) the town's alarm level is a rising meter of three bars, amber to red, instead of round red "!" marks that read as balloons or hearts; (3) a lost heart's pop grows to half again its size, not four times, and stays on the plate (GAME OVER comes with the last heart, and the pop covered the portrait); (4) sideways the action pictures are 40 px instead of 32 on their 52 px targets, the stick's arrows stay as they were, which keeps the controls under the 3% of the view they may paint; (5) the "Plays either way up" line and Use's word (Take, Get in, Go in) are in the game's pixel lettering, Go in with a small pixel door; (6) the hint rests under STAGE CLEARED, the throne room's caption rests under it too, a captive's "Psst!" from off screen waits while a place's name is showing, the title's picture upright is a little narrower so New game clears it, the ground under the choices is the game's dotted night, and the sound button sits above the title and the menu (it sat under their shade and could not be tapped there). Nothing that does something was removed.
- **To change it:** each place carries a `DRAFT:` naming this brief's second pass: `src/client/draw/hud.ts` (`FRIEND_LINE`, `FRIEND_GAP`), `src/client/draw/hearts.ts` (the pop), `src/client/draw/alert.ts` (`PIP_LOOKS`: true puts the round pips back), `src/client/shell.ts` (`OVER_AIM`, `OVER_PAD_AIM`), `src/client/pixel-words.ts`, `src/client/render.ts` (the audience caption), `src/client/draw/recruits.ts` (the edge call), `src/client/start.ts`, `src/client/audio/index.ts` (`z-index`). Revert the commit to undo all of it.
- **Where:** `docs/plan/step-8.md`, "Phone HUD".
### 2026-11-24 · The forest's thing nobody can reach yet: a boulder only a stolen boost can lift
- **Decided by:** Step 15 builder, `session_017WiGzJeF58oqWdt3WEH722`
- **Instead of asking:** "What in the forest should stay out of reach until you come back with something new?"
- **Why this way:** the lead's default from the brief, and your library's "certain characters arrive well after a player has passed features where they'd have helped" (doc 04). A stone slab in the trail's floor opens only while something heavy sits on the plate six tiles before it. Beside the plate lies a boulder too heavy for any hero, and no hero with the heaviest crate is heavy enough. Knock the boost out of the villain in the street, carry it the whole way (a held power does not fade; that was checked), lift the boulder, set it on the plate and drop into the hollow. Three friends standing on the plate together with the crate would also do it, which is the game working. The boulder is a plain grey block until it has a picture.
- **To change it:** the plate's `needs` (260) in `content/rooms/forest-trail.json`, the boulder's `weight` (300) in `content/tuning.json`, or swap the boulder for something a future hero or power moves.
- **Where:** `docs/plan/step-15.md`, "Builder notes"; `content/placements/forest-trail.json`. `DRAFT:`

### 2026-11-24 · The road and the ridge have callers, each with a way over him; the depot's waves grow; the tower gets a heavy and a fighter
- **Decided by:** Step 22 builder (the sixth), push 5 part 2, `session_017WiGzFCTDPbq1AGbnZ5Gqx`, on the lead's rulings of 09:35 UTC
- **Instead of asking:** where do the quarry's extra bad guys and its second caller go, without breaking "every hero can sneak through with no alarm"?
- **Why this way:** the step asks for more bad guys, a second caller, and a first screen that shows a bad guy and a signal post. The road now opens on a lookout with his horn on the first ledge: you see him from the doorway, he can't see you there, and if he sees you the road fills up. The ridge has one too, whose waves come from the tower side. Nobody can sneak past a lookout who turns, on his own level, so each gets a way over him: on the road, a high walk you climb while he looks away; on the ridge, a step and a walk up under the ceiling that lead along the shelf and through the tower's top opening. The tower climb now has a heavy halfway up and a fighter lower down. The depot keeps its four and calls harder instead: a brute walks in with the second wave. The pit's brute was tried and left out: he caught the grappler's fight with the pit's heavy (`step16-mood-heavy-hit`), as the lead said to do if he broke it. The three small heroes' sneaking runs now take the quiet way and clear unseen; the grappler and the brawler sneak the main way, up the depot's ledge over its lookout. The good star time moves from 60 s to 56 s, re-measured the same way as before (between a good scripted clear and the slowest). **A doubt for the owner by playing:** the quiet way's pass over the road's heavy, for the infiltrator, is a window of a few ticks: he sees the scaffold at exactly the edge of his sight band.
- **To change it:** `content/placements/quarry-{road,ridge,tower}.json` (the new ids: `road-lookout`, `road-horn-post`, `ridge-lookout`, `ridge-horn-post`, `tower-heavy`, `tower-fighter-3`), `content/outposts/quarry-{road,ridge}.json` (delete a file to take a caller's horn away), the second row in `content/outposts/quarry-depot.json`, the one-way tiles in `content/rooms/quarry-road.json` (rows 11, 13) and `quarry-ridge.json` (rows 3, 5), and `stars.good` in `content/stages/iron-quarry.json`. Re-record the ten `step22-each-hero-*` and `step22-unseen-clear` with the commands in their `//`.
- **Where:** `docs/plan/step-22.md`, "Builder notes", push 5 part 2; `docs/mechanisms/outposts.md` (the quarry's rooms); `docs/mechanisms/stages.md`, "Checking it".



### 2026-11-24 · Sideways, the camera looks up at what is aimed at you, and up when you climb or hold the stick up
- **Decided by:** Step 5 camera builder (brief camera-looks-at-what-matters), `session_017WiGzGHrgYYzH2iGQXcGaG`
- **Instead of asking:** "When a thrower above you winds up, or you are climbing in a tall room, how should a sideways phone's picture move to show it?"
- **Why this way:** the brief decided that a warning aimed at a hero is in the picture sideways; your rules are iPhone first (D-093) and readable enemies. On a sideways iPhone in the Hall gallery the picture kept the floor, so the thrower on the balcony, his raised shot and most of his arc were off the top: you saw only where it would land. Now, while he aims (and for 2.5 s after, so it does not bob between his throws), the picture eases up until he and the top of his arc are in it; your hero's feet may then sit at the very bottom of the picture, but only where no touch button is beside them. Where the party plate would cover him (top-left), the picture also slides a little sideways as far as the room's edge allows. Climbing (rising) or holding the stick up while standing (after a quarter second, so a tap up at a door does not move it) leans the picture up so your hero stands just above the buttons and the rest is what is above: from the depot's yard the roof route and its chimney come into view. It eases over about a third of a second, never jumps, and stays on whole pixels. Upright, nothing changes (the picture is tall enough).
- **To change it:** the numbers in `content/camera.json` (how far above him, how long it holds, how fast it eases, how long the stick is held); the rule itself is `src/client/camera.ts`. Turning it off is deleting the one `lean` call in `src/client/render.ts`.
- **Where:** `docs/mechanisms/rendering-world.md`, "The camera leans up"; `docs/plan/step-5.md`, "Camera".

### 2026-11-24 · The forest's guarded spot: a lookout with a horn at the trail's far end, a thrower on the root mound, a spear by the way in
- **Decided by:** Step 15's second builder (brief `handoff-prompts/step-15-forest.md`, push 3), `session_017WiGzG4nNVPXPAo2ztGmx3`
- **Instead of asking:** "Where in the forest should getting caught happen, and what comes when it does?"
- **Why this way:** your standard for it working is "a botched stealth attempt that becomes an even better fight or escape", and "Alarms should spawn more enemies of increasing strength that come in from the sides". The guarded spot is the last stretch of the upper trail, right before the shaft down to the deep pocket, so every run meets it. A lookout looks west for 4 s, then east for 3 s, with its horn behind it: slip past while it looks away, fly over it (the flyer), or get seen. Seen, the first fighter comes from the east, between you and the way on; the next call brings two, one from each side; then a fighter and a heavy, for ever. Break the horn (punch the lookout into it) and no more come. The thrower stands on the root mound, the one high spot every hero but the small one climbs over, and lobs at you as you climb. A spear lies on the trail's floor by the way in from the road.
- **To change it:** the lookout, horn and thrower are three lines in `content/placements/forest-trail.json`; the waves, the sides they come from and how many at once are `content/outposts/forest-trail.json`; the spear is one `sources` entry in `content/weapons/spear.json`.
- **Where:** `docs/plan/step-15.md`, "Builder notes"; `scenarios/step15-caught-fight.json`, `step15-caught-both-sides.json`. `DRAFT:`

### 2026-11-24 · The forest's star times: three stars under 40 s, two under 52 s
- **Decided by:** Step 15's second builder (push 3), `session_017WiGzG4nNVPXPAo2ztGmx3`
- **Instead of asking:** "How fast should a forest run be for two or three stars?"
- **Why this way:** set the way the quarry's were, from scripted clears with every bad guy placed: the best run 29.5 s (the small hero, fighting through, one alarm), a good one 47.0 s (the strong hero, fighting, no alarm), a slow one 56.1 s (the strong hero, only walking, one alarm). Three stars is at or under 40 s (between the best and the good run), or no alarm, or not seen; two is at or under 52 s or not having started over. A person on a phone is slower than a script: tune by playing.
- **To change it:** `stars` in `content/stages/bramble-forest.json`.
- **Where:** `scenarios/step15-cleared.json`, `step15-clear-best.json`, `step15-clear-slow.json`. `DRAFT:`

### 2026-11-24 · The scaffold has a top plank over the road heavy, so slipping past him is a moment you can hit, not a single frame
- **Decided by:** Step 22 builder (the seventh), `session_017WiGzJudo6Zjh95Uh99rkH`, on the lead's ruling to raise the scaffold
- **Instead of asking:** how wide should the gap be for a small hero to slip over the road's heavy unseen?
- **Why this way:** the lead's review: "A person on a phone won't hit that", a window of a few frames. The lead ruled the scaffold's walk up a row. Raised all along, the walk would run under the flyer's secret ledge with too little headroom for any hero but the infiltrator, and the others would only get by on the secret ledge. So the walk stays, and a short plank one row higher sits east of the ledge, over the heavy. The hero waits at the toll end of the walk, goes the moment he turns to look up the road, and steps up onto the plank: about 1.4 s to do it in. Up there no hero is in his sight.
- **To change it:** row 7 of `content/rooms/quarry-road.json` (columns 56-62); then re-record `step22-unseen-clear` with `scripts/stage-quiet.ts`.
- **Where:** `docs/plan/step-22.md`, "Builder notes", the seventh builder; `docs/mechanisms/stages.md`, "Checking it".

### 2026-11-24 · The phone's screen furniture, third pass: a door that cannot be read as a letter, a full title upright, dimmed buttons that stay visible
- **Decided by:** builder, Step 8 (brief `handoff-prompts/phone-hud-legibility.md`, third pass), `session_017WiGzEcwbDzMUBQQyjcRgE`
- **Instead of asking:** "What should the doorway mark, the upright title and a dimmed button look like?"
- **Why this way:** "iPhone first" (D-093: legible pixels); the third look found "nGO IN", a bare bottom third on the upright title, and a dimmed Switch lost against a red roof. Each choice adds and keeps the earlier rule (Switch still dims, never hides; the code field still in the upper half).
- **What changed:** Go in's mark is a solid amber door; a friend's hearts stay on one line up to five; an out hero's face goes grey but stays readable (GAME OVER); the level's sign sits beside the plate on the top row where it fits; dimmed buttons go grey and darker on a dark disc instead of see-through; the alarm meter's unlit bars have a pale rim; the upright title shows the wordmark at the top, the choices on the night ground and the picture's scene filling the foot; the sound button has a rim; sideways the Use word's pill keeps 2 px above the safe area's bottom edge.
- **To change it:** each is one constant or rule: `DOOR` in `src/client/pixel-words.ts`, `FRIEND_LINE` in `draw/hud.ts`, `RIGHT_KEEP` in `draw/banner.ts`, the `.idle` rules in `src/client/index.html`, `SOCKET_RIM` in `draw/alert.ts`, the upright branch of `titlePicture` in `src/client/start.ts`. All `DRAFT:`.
- **Where:** `docs/plan/step-8.md`, "Phone HUD", "Third pass"; shots in `docs/plan/step-8-shots/hud/after3/`.

### 2026-11-24 · The forest's own ground: dark loam under the grass, dark earth behind its hollows, one forest picture behind it all
- **Decided by:** Step 15's third builder (brief `handoff-prompts/step-15-forest.md`, push 4a)
- **Instead of asking:** "What should the forest's earth look like, and what shows through its hollows and tunnels?"
- **Why this way:** the orchestrator's look at the first shots found the forest wearing the quarry's orange cobble, a hard seam in the picture behind it, and the sky showing through every tunnel. Nothing new was drawn: the same approved P10 cobbles are taken two tones darker toward a damp loam with a fleck of moss, so the two places stop looking alike; every pocket underground gets that loam darker still behind it, so a hollow reads as a hollow; and the picture behind is the forest preview's first view beside its own mirror, so there is no seam where its second view used to start (a sideways phone sees mostly the first view anyway).
- **To change it:** the colours are `LOAM`, `MOSS` and `CAVE` in `tools/art/tiles/forest.py` (re-run it; dropping `forest_earth()` brings back the orange); the hollows are the rectangles in `tools/art/tiles/forest_decor.py` (or delete `content/decor/forest-trail.json`); the picture is the first layer's `image` in `content/backdrops/forest-{road,trail}.json` (`backdrops/forest-waterfall.png` is the old one, kept).
- **Where:** `tools/art/tiles/README.md`, "Step 15 forest sheet"; shots in `docs/plan/step-15-shots/`. `DRAFT:`

### 2026-11-24 · Step 24: the thrower wears the bandits' red, and his throw flies spinning, red-hot, with a trail
- **Decided by:** Step 24 slice 1b builder (`handoff-prompts/ranged-enemy-2.md`), `session_017WiGzJR2qgU7SXbKtxZpYP`
- **Instead of asking:** "What tells a player the thrower is a bad guy, and how does his throw look different from the same thing lying on the floor?"
- **Why this way:** your "readable enemies" (`docs/vision.md:74`). Nothing in the code marks a bad guy: the camp's people are told from townsfolk by their pictures alone, and what they share is the bandits' red (the fighter's red hood, the lookout's red scarf). So the thrower's stand-in (the toll keeper's purple-hooded sheet) has its purple swapped for exactly the fighter's red: no new drawing. A boomerang lying still is drawn as it was; one in the air now spins three turns a second, is painted red-hot and leaves four fading copies behind it, so a throw coming at you cannot be taken for loot. A real thrower sheet is asked for (Vision Partner, asset desk).
- **To change it:** the colour swap is `tools/art/cast/ranged-fighter-recolor.py` (or point `content/sprites/ranged-fighter.json` at any other sheet); the flight look is the `flight` line in `content/weapons/thrown-shot.json` (spin, trail, tint; remove it to draw it as it lies), and any thrown weapon (the bomb, the spear) can say the same.
- **Where:** `docs/mechanisms/weapons.md`, "What a player sees"; `docs/plan/step-24.md`, "Builder notes"; shots in `docs/plan/step-24-shots/1b/`. `DRAFT:`

### 2026-11-24 · Step 15: the forest's quiet way is a high line of boughs over the guards, the small hero's way
- **Decided by:** Step 15's lead, `session_017WiGzHD8gtSGTegd3n8W4G`
- **Instead of asking:** "How do you get through the forest without being seen, when every guard on the trail faces the way you came?"
- **Why this way:** the owner's standard for the game includes "the satisfaction of a zero-alarm infiltration", and today no route through the forest is unseen: every guard on the upper trail faces west for good and the only way to the end runs east past them (the third builder's measure, `docs/plan/step-15.md`). Of the three ways measured, a line of one-way boughs at row 5 from the root tunnel's hatch to the shaft (with a root stump at column 39 hiding the climb) adds one route and changes no guard; passing under the canopy's slab there leaves room only for the infiltrator, so the quiet way is the small one's, as the crawl and the quarry's quiet way are. Turning guards (option b) would change how the fight half reads; giving up on stealth here (option c) leaves the forest without the owner's second loop.
- **To change it:** the bough tiles and the stump in `content/rooms/forest-trail.json`; the recorded crossings, `step15-cleared` and the star times move with it. Undo: revert the push.
- **Where:** `docs/plan/step-15.md`, "Handoff (third builder …)"; `handoff-prompts/step-15-forest.md`. `DRAFT:`

### 2026-11-24 · The camp's rows break through: alarm bandits also walk in on the camp's east side, never right beside you, and smash the fence and the stalls to get at you
- **Decided by:** camp-entries builder (`handoff-prompts/camp-entries.md`, the orchestrator's ruling of 08:45 UTC), `session_017WiGzJpgPTTMymzeBeX6qW`
- **Instead of asking:** "The Bandit Camp's east half is cut into pockets by a fence, two market stalls and a barricade the camp's bandits cannot climb. When the horn brings a row and you are over there, where should they walk in, and what happens when a stall is between you and them?"
- **Why this way:** yours, 2026-11-24: "Alarms should spawn more enemies of increasing strength that come in from the sides"; the orchestrator's ruling: a row must not appear in plain view a few tiles from a hero, and a bandit blocked by a breakable piece breaks it (impact over numbers: the piece's own break, no health bar). Three new places a row walks in at, one per pocket (columns 50, 62, 74). No row walks in within 8 tiles of any hero (about a third of a phone screen; 9 or more also moved the rows near the doorway, which other scenes are timed on). A bandit stopped by the fence or a stall winds up for half a second and smashes it; the barricade before the cache is too strong and stays cover (the wagon's job). Measured in the sim: a hero standing anywhere from column 44 to 74 is reached in 3 to 11 seconds; before, rows never got east of column 47.
- **To change it:** `entries`, `sendNoneNearer` (8) and `breakThrough` (`time` 0.5 s, `upTo` 200 px/s: which pieces break) in `content/outposts/outpost.json`; left out, each is the old behaviour. A hero in the cache behind the barricade gets rows from the west only: an entry on the cache's step would walk in right beside them.
- **Where:** `docs/mechanisms/outposts.md`, "From the sides"; `src/sim/systems/outpost-break-through.ts`, `outpost-wave.ts` (`clearOfHeroes`); `docs/plan/step-4.md`, "Camp entries".

### 2026-11-24 · Step 24: a thrower guards the stone plate under the castle
- **Decided by:** Step 24 slice 2 builder (`handoff-prompts/ranged-enemy-2.md`), `session_017WiGzJR2qgU7SXbKtxZpYP`
- **Instead of asking:** "Where in the undercroft should the thrower stand, and which way should he look?"
- **Why this way:** the step's plan, "a thrower above the stone plate makes the weight puzzle a fight", and your "Varied enemies to fight and sneak past, scattered through every level". He stands on the middle step of the stair beside the plate, looking west over it. Coming down from the street you arrive behind him; whoever stands on the plate is under his arc, not in it; his lobs come down by the grate, so dropping into the pocket is done under fire. The steps lead up to him, so anyone can climb and knock him off. Measured: one player alone (with the heavy crate thrown down onto the plate) still gets in, struck at the grate and dropping in all the same, and no earlier check changed.
- **To change it:** one line in `content/placements/undercroft.json` (his tile and `face`); remove it to take him out.
- **Where:** `docs/plan/step-24.md`, "Builder notes"; `scenarios/step24-undercroft-under-fire.json`. `DRAFT:`

### 2026-11-24 · Step 4: the armoured guard: the street's last row brings a slower, much tougher guard
- **Decided by:** town tiers builder (fifth), `session_017WiGzFsP2hhQR5q7wSEpiB`, applying the third builder's built patch
- **Instead of asking:** "When the whole watch turns out in the castle street, should anyone in it be different from the guards you have already fought?"
- **Why this way:** the library's "each response wave should add a new toy" (doc 07) and your "more enemies of increasing strength". The top row's middle guard is now in armour: he walks slower than a guard (no hero is slower than him), a punch moves him about half as far, he takes nearly twice the beating (the grappler drops him in about 6 punches, the skirmisher in 13), and his swing is slower but harder. So at the top of the alarm, running is the better answer than fighting him. He looks like a plain guard for now: his own picture is waiting on the cast's artwork.
- **To change it:** the `armoured-guard` numbers in the tuning file; which row he is in, in the castle street's dispatch file; his picture, by replacing his sprite file once his sheet is cut.
- **Where:** `docs/mechanisms/npc-response.md`, "The castle street's table"; `content/characters/armoured-guard.json`. `DRAFT:`

### 2026-11-24 · Step 22 closes: the stage's phone checks run in the full e2e, not against the live address
- **Decided by:** Step 22's lead, `session_017WiGzF7NsB3KTwXkWUXE63`
- **Instead of asking:** "Is the stage done if its phone checks pass locally on the commit that's live, but not against the live address itself?"
- **Why this way:** every stage phone check (beaten at the entrance, a walked clear, STAGE CLEARED at three phone sizes, Continue, two friends) passes in the full `npm run e2e` on the same commit the live address runs (`check:deployed` ok), and `check:live` passes. Adding a stage check to `check:live` would put a private game over into the live server's runs for one fact; not worth holding the step open.
- **To change it:** add a call to `scripts/e2e/stage.ts`'s `walkedClear` in the live check (`scripts/check-live.ts`), in a private world.
- **Where:** `docs/plan-archive.md`, "Step 22", the last lead review. `DRAFT:`

### 2026-11-24 · Step 25: the suplex is Use while carrying a body, and every hero has one
- **Decided by:** orchestrator, `session_017WiGzHY5UZsWTLCH8cLm8M` (drafted by its agent from the code)
- **Instead of asking:** "You named suplexes first when you described spectacular impact, and the game has none. How should one be done on a phone, and by whom?"
- **Why this way:** D-020 ("Spectacular IMPACT is a top priority: suplexes, launches, ...") is confirmed; the library's suplex details are proposals. While you carry a body (anyone who can be knocked out, never a crate) the Use button reads SUPLEX: up, over, slammed head-first behind you, and whatever is near the landing is knocked away. Use, because every stick-plus-Hit while carrying is already a throw and Grab already sets the body down, so nothing a player has now is taken away. All five heroes can; the grappler and brawler slam hard enough to finish a bad guy at once, the three light heroes floor him without finishing him. A carried friend can still jump free mid-heave.
- **To change it:** the `suplex` numbers in the tuning file; who has it, by the `suplex` entry in each hero's verb list (three edits to take it from the light heroes); the button, by the Use entry's order or by moving it to another input.
- **Where:** `docs/plan/step-25.md`, "`DRAFT:` choices"; `handoff-prompts/suplex.md`. `DRAFT:`

### 2026-11-24 · Step 15: the quiet way's boughs run under a long limb that roofs the trail, and the climb onto them is beside the mound
- **Decided by:** Step 15's fourth builder (brief `handoff-prompts/step-15-forest.md`, push 5), `session_017WiGzHUtUjXLziDxPA9ST8`
- **Instead of asking:** "The lead's line of boughs at row 5 also lets a hero jump from it onto the canopy, and lets anyone who hops the stump reach it. Keep the canopy the flyer's, or let the quiet way lead there too?"
- **Why this way:** measured, a hero's jump rises about 55 px (3.4 tiles), so from a bough at row 5 the canopy's top, two tiles up, is an easy hop, and so is the bough from the stump's top: the grappler would walk onto the flyer's secret, and "secrets that each need a different hero" would break. The smallest change that keeps both: the canopy's slab becomes the middle of one long limb (row 3, columns 32-98) one tile over the boughs, so only a body at most a tile tall stands on them (the infiltrator), nobody can jump from them, and the only way onto the canopy is the open sky over the root mound and a flight along the limb's top (the flyer). The 2-tile stump at column 39 is kept, but it only hides the floor: a hero climbing beside it is seen by the second fighter mid-jump (measured), and a 3-tile stump under the limb shuts the grappler out of the trail (the way-out check refuses it). So the infiltrator walks west from the hatch behind the stump and climbs at column 33, past the light fighters' 112 px of sight, by a perch beside the mound. The quiet clear takes 32.0 s; the re-recorded slow clear now takes 49.2 s, so the good star time moves from 52 s to 48 s (between the good run, 46.9 s, and the slow one, as before).
- **To change it:** the limb (row 3), its west end (row 4, column 32), the boughs (row 5), the perch (row 7, column 33) and the stump (rows 7-8, column 39) in `content/rooms/forest-trail.json`; re-record with `tools/scenario-bots/mk_cross.py`, `mk_insides.py 'step15-canopy'`, `mk_clears.py`, and `scripts/stage-quiet-forest.ts scripts/stage-routes/forest-quiet-infiltrator.json`; the star times in `content/stages/bramble-forest.json`. Undo: revert the push.
- **Where:** `docs/plan/step-15.md`, "Builder notes", push 5; `scenarios/step15-unseen-clear.json`. `DRAFT:`

### 2026-11-24 · The owner's new biome backgrounds go behind the places they fit: the market behind the street, ruins behind the courtyard, the moonlit dungeon under the castle, forest ruins behind the camp, the waterfall forest behind the forest, the evening quarry behind the quarry
- **Decided by:** biome-backgrounds builder (Step 8 look), `session_017WiGzGQptGtgXJLtKXBbKC`
- **Instead of asking:** "Which of the fourteen panoramas goes behind which place, and what happens where one fits nowhere yet?"
- **Why this way:** the owner: "Some new biome backgrounds getting added to the drive. You can make use of those"; new art is for immediate use (D-096). Each place got the panorama whose own subject it is: castle-street the newer market town (BKG-02), the courtyard the sunlit ruins with a castle on the hill (BKG-01), the undercroft the moonlit arcade with barred cells and chains (BKG-01), the Bandit Camp the forest ruins (BKG-02), the forest the whole waterfall forest it already showed a slice of (BKG-01), the Iron Quarry's open-sky rooms the evening quarry (BKG-01). Rooms with their own walls (throne room, gallery, cantina, the quarry's cave, pit and tower) keep them: a sky behind them would put them outdoors. Ice caverns, sky islands, the volcanic forges and the moonlit stronghold wait for a place that is theirs, not forced in. Each scrolls slowly behind the room and never repeats (the packs' own rule); above it, in a tall upright view, is its sky colour. The quarry's is softened a third of the way toward its sky, because its painted scaffolds are the same wood as the thin planks of the quiet way and must not be mistaken for them.
- **To change it:** swapping a background is one line, the first layer's `image` in `content/backdrops/<room>.json` (all 14 are cut in `assets/backdrops/bkg0N-*.png`); the old drawn layers are still in `assets/backdrops/` and the file's note names them.
- **Where:** `docs/plan/step-8.md`, "Biome backgrounds"; `tools/art/backgrounds/`.
### 2026-11-24 · A friend you throw into a crate bounces off it on their own phone too, and the crate is knocked on every screen
- **Decided by:** thrown-friend builder (`handoff-prompts/thrown-friend-through-a-crate.md`), `session_017WiGzGN2CWKhMJmqAAKFXy`
- **Instead of asking:** "When your friend's body flies, should their own phone work out what it hits (at once, from what that phone shows), or should the server work it out and their phone follow it (a round trip late)?"
- **Why this way:** your first decision on the network, "your own character moves instantly on your own phone", and the "OHHHHH" of impact. The thrower's phone already bounced the friend off the crate it shows; now the friend's own phone does the same from the bodies it shows, and tells the server the speed it met the crate at, so the server knocks the crate as well and every screen shows the crate hit. Measured with the throne room's heavy crate (`docs/plan/step-5.md`, "Thrown friend"). The other way (the server flies a thrown friend until they land) would have drawn your friend's own flight from snapshots, later and jerkier on their own phone.
- **To change it:** `meetDrawn` in `src/net/flight.ts` and its two lines in `src/net/client.ts` (`content/net.json` `predictHitMs` 0 turns it off with the rest of the page's prediction); revert the commit to undo it.
- **Where:** `docs/mechanisms/network.md`, "A flying own character"; `docs/plan/step-5.md`, "Thrown friend". `DRAFT:`


### 2026-11-24 · The backgrounds sit further back: softened, no hard line above them, and the cellar under the castle keeps its own wall
- **Decided by:** biome-backgrounds builder (Step 8 look), `session_017WiGzGQptGtgXJLtKXBbKC`, on the orchestrator's three rulings after looking at the shots (~16:50 UTC)
- **Instead of asking:** "On a phone held upright the background ends in a hard line with flat colour above it; some painted ledges, a painted mushroom and the quarry's painted scaffolds look like things to stand on; the cellar showed a moon: how far should the owner's pictures be changed to fix that?"
- **Why this way:** the owner's words stay "make use of those", and the phone's legible pixels come first. So the pictures are used whole and only pushed back: each is softened toward its own sky (the quarry by half, the forest a little under half, the street, courtyard and camp by under a third: lighter and plainer with distance, as the art contract asks), and above it its own top edge carries on upward, fading softly into its sky, so a tall view never shows a line. Real platforms are bright and outlined; painted ones are pale. The undercroft is underground and none of the unplaced backgrounds is an underground room without a sky (the ice caverns and forges all open onto mountains, a volcano or the moon), so it has its drawn cellar wall back.
- **To change it:** the softening per background is one number in `FAR` in `tools/art/backgrounds/import_panoramas.py`, then re-run it; the fade's height is `FADE`. A room draws the original unsoftened picture by dropping `-far` from its first layer's image.
- **Where:** `docs/plan/step-8.md`, "Biome backgrounds"; `content/backdrops/*.json`.

### 2026-11-24 · Step 24: the thrower's shot in the air is bigger and has a dark rim
- **Decided by:** Step 24 slice 1b builder, `session_017WiGzJR2qgU7SXbKtxZpYP`, after the orchestrator's look at the shots
- **Instead of asking:** "Is the thrown shot easy enough to see coming?"
- **Why this way:** the look found it "a small orange crescent with a faint trail, low in contrast on the gallery's tan wall"; your "readable enemies" and "legible pixels" (D-093). In the air it is now half as big again, redder, with a one-pixel dark rim and a brighter trail, so it stands out on any wall. Lying on the floor it is unchanged, because a landed shot is meant to be picked up and thrown back.
- **To change it:** `outline`, `scale`, `tintAmount` in the `flight` line of `content/weapons/thrown-shot.json`.
- **Where:** `docs/mechanisms/weapons.md`, "What a player sees"; shots in `docs/plan/step-24-shots/1b/`. `DRAFT:`
