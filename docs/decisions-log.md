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
