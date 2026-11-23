# Step 11 — The cantina: an endless brawl and the place you change your party

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-083 to D-086):**
> D-083 The connected BETWEEN-LEVEL WORLD contains a CANTINA in which ALL UNLOCKED playable characters hang out and WANDER physically. …
>
> D-084 Exact roster-swap interaction: TAP the desired roaming cantina character; the CURRENT ACTIVE PARTY is shown ACROSS THE SCREEN; TAP the currently active member to REPLACE …
>
> D-085 Players may ATTACK those unlocked characters to launch a huge Super Smash Bros.-like BAR FIGHT, including blasting fighters OFFSCREEN, KOs and endless RESPAWNS for game-controlled roster fighters AND human players. …
>
> D-086 A RUNNING K/D COUNTER gives players scores/high-score opportunities during cantina fights. The entire cantina brawl is EXPLICITLY OUTSIDE ORDINARY NPC SYSTEMS …

No build gate or golden scenario covers the cantina; doc 31's own
acceptance tests are the yardstick.

## Goal

Off the castle street is a tavern where the heroes nobody is playing
wander about. Hit one and a bar fight breaks out: anyone, friends
included, can be launched out of the room, everyone is back at once, and
a small counter keeps score. Stop fighting or walk out and it settles.
When it is calm, tap a wandering hero, then the party member to replace.

## What's decided

- **A real room, not a menu** (D-083; doc 31). `DRAFT:` one room off the
  castle street in doc 31's cheap layout, entered by pushing up in a
  doorway, so no thrown body leaves by accident. Shortcut doors (D-087)
  come later.
- **Every unlocked character nobody is playing wanders there**, party
  members included (D-083). `DRAFT:` the whole roster starts unlocked:
  nothing in the world unlocks anyone yet.
- **Regulars are scripted, and outside every ordinary rule** (D-055,
  D-086; doc 31): a walking loop and a fight pattern, authored as data,
  played through the input any body takes. No moods, witnesses, calls or
  alert; nothing carried is lost.
- **Attack starts the brawl; a tap never does** (D-085; doc 33: "Normal
  ATTACK action is distinct from tap/recruit"). No new button.
- **Knocked flat or launched past the edge, you are back at once**,
  players and regulars alike, without end (D-085). `DRAFT:` the edge is
  an authored line, never a door.
- **In the brawl friends hurt and launch each other, and everyone in the
  room is in it.** `DRAFT:` our reading of "free-for-all" (doc 05); the
  library never says it outright. Elsewhere Step 2's rule stands.
- **A running counter** (D-086): each player's knock-outs and falls,
  readable on a phone; still no number over a hit. `DRAFT:` your best
  brawl is kept in Step 7's store, in a collection of its own.
- **There is always a way out** (`INTENT:`). `DRAFT:` Q-008's
  recommendation, logged in `docs/decisions-log.md`: the brawl ends when
  nobody has attacked for a few seconds, and when the last player walks
  out. Regulars never follow; leaving is never locked.
- **Chased by good guys, you cannot get in** (D-088). `DRAFT:` only an
  active chase locks the door (a raised alert alone is open in D-088).
  Guards following you in (D-089, D-090) is not this step.
- **The swap is two taps** (D-084): a regular, then the member to
  replace, in a row across the screen. The row closes on a tap elsewhere,
  on moving, or by itself, and no tap takes a friend's character (both
  `INTENT:`; doc 06: "avoid silently stealing a teammate's avatar").
  `DRAFT:` you may replace a member nobody is playing, or your own; not
  during a brawl.
- **Tonight all three heroes are in the party: with two players one
  hero is left to wander, and nobody is outside the party to swap in.**
  `DRAFT:` add two roster characters as data, using moves that exist
  (D-008). They are the brawl's regulars too, so land them with it.
  Without them the hub shows the wandering, the tap and the row but no
  real swap: say so.

## How to cut it (a suggestion, not a rule)

**The brawl first.** To start it needs only Step 2's hit on `main`
(attack, grab, throw, flying bodies, their events): build it in a room
with no door, two players in one simulation. Then, side by side: **the
door** (Step 3's doors; signal 6 needs Step 4's alert and chase) and
**the hub**. Two real phones, and signal 8, wait for Step 1's second
gate. Drop first: the best score, then the hub. Never cut: both ways
out, coming back at once, a brawl that raises no alert.

## What's open (the lead's to measure and decide)

Read in full, in `docs/design-library/02-gameplay-systems/`:
`31-cantina-party-roster-hub-and-endless-brawl.md`,
`05-characters-roster-parties-and-acquired-powers.md`,
`06-online-co-op-and-creative-combination-rules.md`,
`33-iphone-browser-platform-and-github-to-railway-delivery.md`,
`08-combat-impact-destruction-and-vehicles.md`; then D-007 to D-015 and
D-083 to D-090 in
`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`.
Where the library leaves something open (the room's size and edge, who
is credited with a knock-out, how many regulars fight at once), pick the
simplest, `DRAFT:`, log it in `docs/decisions-log.md`.

Agree each of these with its lead before code; never edit their files:

- Step 2: a party the world can change (today a fixed file), a
  knocked-flat body up at once, its three friend numbers set per brawl,
  the two character files.
- Step 3: the cantina's room file, the street's door to it, a door that
  can refuse.
- Step 4: "is being chased", read only; time inside is not hiding.
- Step 5 (Step 1 until it closes): a touch on the game view, sent like a
  button press. Until then the scripted checks supply the tap.
- Step 7: its way of getting a record from the game into the store.
- Step 9, if on `main`: no power is knocked loose in a brawl.
- Step 13 (heroes you find and keep), once claimed: one roster list
  between you, never two.

A doorway takes any body that pushes up in it, and up with attack is the
launcher: keep the doorway off the fighting floor, and regulars from
pushing up in it.

## Feedback signal

Scenarios in `npm run check`, named `step11-*.json`, each with a control
watched to fail.

1. Each unlocked character has one body in the cantina while nobody is
   playing it, walking its loop, never leaving (control: one marked
   locked is absent).
2. An attack on a regular starts the brawl and a regular hits back
   (control: a tap starts none).
3. Launched past the edge: a knock-out for whoever did it, a fall for
   the body, back within a second; a player, three times running
   (control: edge off, none).
4. In the brawl A's attack launches B (control: before it, B does not
   move).
5. No attack for the calm time ends it; so does the last player leaving,
   unhurt and unfollowed (control: one attack keeps it going).
6. After a brawl: no call, no mood changed, the alert as it was
   (control: the same hit on a person in the street upsets them).
   Chased, the door refuses; the chase over, it opens.
7. Tap a regular, then a member nobody is playing: the party holds the
   newcomer, `switch` reaches them, and the one replaced still wanders.
   Your own: you become the newcomer. A friend's: refused (control).
   Move with the row open: closed, nothing changed.
8. `npm run e2e`, phone-sized, by touch: a regular, a member, elsewhere;
   attack starts a brawl; each page's record of what it drew has the row
   and the same counter inside the view, and no number over a hit.

## Stopping condition

The eight signals pass on `main` and live (`npm run check:deployed` exits
0), and "how to add a roster character or a fight pattern" is in
`docs/architecture.md`. **Budget:** two hours from claiming, the brawl
inside the first. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer than that, land the brawl and its
door (signals 1 to 5, and 6 if Step 4 is on `main`), leave the hub out,
and say so.

## Owns

New paths only, agreed in `docs/architecture.md` when claimed:
`content/cantina/**` (edge, pads, patterns) and `content/roster.json`,
each with its kind file; systems named `cantina-*`; a new
`src/client/draw/cantina.ts` (counter and row). It builds on Step 2's
bodies, hit, party and switch, Step 3's rooms and doors, Step 4's alert,
the page's input and Step 7's store, and edits none of them. In the four
shared files (`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`): additive edits only,
`git pull --rebase` right before pushing, then `npm run check` again.

## Taste, for the owner in the morning

Whether the bar fight makes two people laugh; whether being launched by a
friend is fun or annoying; the regulars' patterns; how quickly it calms;
the counter's look and wording; the two extra characters; whether two
taps feel direct on a real iPhone.

## Measure

Taken 2026-11-23 by the lead at 17d8c1b (`npm run check` green): friends hit but do not launch or wear each other (three tuning numbers at 0, read at `attack.ts:139-146` and `friendly()` in impact-walls/bodies); nothing removes or respawns a body; nothing can leave a room's bounds (outside reads solid); unplayed party members are not in the world; no roster exists; no tap on the game view; the `move` effect exists but has never run across two pages. Step 12's door goes in the courtyard (column 9), so there is no clash.

## Briefs

- **Slice B, the hub** (`handoff-prompts/step-11-b-hub.md`, briefed ~16:15 UTC to the same worker): the cantina's tiles and backdrop; tap a regular → party row → tap the member to replace (new `Input.tap`, `World.party`, effect `become`); the street door refusing a player a good guard is chasing (`World.chased`, door `refuse`); the phone e2e (signal 8). Edits agreed or announced in Steps 2, 3, 5 and 8's files, additive.
- **Slice A, the brawl** (`handoff-prompts/step-11-a-brawl.md`, briefed 2026-11-23 by lead `session_017WiGzFy3MD6ecvM7QMvQGd`): roster, two new characters, the cantina room and its street door (castle street column 20), regulars, the brawl, out-and-back with a counter. Signals 1-5, half of 6, plus a real-server check that `move` brings a player back. Slice B (the tap, the row, the swap, the chase lock, signal 8, and the cantina's look: a `ROOM_THEME` entry in `tools/art/tiles/make.py` with its atlas and backdrop data, per `tools/art/tiles/README.md`, flagged by Step 8's ground lane at ec49eb5) waits for it.

## Open with the owner

## Handoff notes

**Closed 18:05 UTC by the lead.** Slice B push 5 (f230c2b) reviewed: lead's control (`"refuse"` on the cantina's own door) now fails `npm run check` by name; `step11-chase-blink` covers the guard's sight flicker with a 1 s `chaseHold`. `npm run check` re-run green. All eight signals pass; the stopping condition's docs are in `docs/architecture.md` and `docs/mechanisms/cantina.md`. **Owed, for whoever reopens it:** a real iPhone (two phones in one brawl); a self-swap where the newcomer would not fit (no such spot in the cantina today); the best brawl kept in Step 7's store (dropped tonight); shortcut doors (D-087) and guards following in (D-089, D-090); the owner's taste list above. Not Step 11's: the switch gap (`handoff-prompts/step-5-switch-gap.md`), the cantina's own tiles, props and sprites (Step 8 round 3).

**Slice B push 4 (the phone check, 09d98a1) reviewed ~17:58 UTC by the lead:** `npm run e2e` re-run in full by the lead, green: by touch alone two phones walk into the cantina, a tap opens the row, a tap elsewhere closes it, a swap shows on both pages, switch reaches the newcomer, a brawl draws the same counter on both (signal 8). The builder's flag that a page's switch can land on a friend's member (the page's world has no friends in it) is the known switch gap, passed to the orchestrator as Step 2's holder. Owed in push 5: the way-out check and the sight-flicker hold.

**Slice B push 3 (the chase lock, 433275e) reviewed ~17:40 UTC by the lead:** the `room-doors.ts` edit is additive and refuses only a door carrying `"refuse": "chased"` (only `to-cantina` does); `cantina-chase` runs only in a world with `~cantina` and reads saved state with `?.`; good-side `c.respond` chasers only. Lead's control: `"refuse"` on the cantina's own `to-street` door makes nothing fail, so the way out was protected by a comment alone. A content check for it, and a short hold over the guard's two-tick sight flicker, were sent to the builder for push 4.

**The cantina's art is Step 8's from 17:07 UTC** (orchestrator): round 3's lanes draw its own tiles and backdrop (replacing slice B's borrowed `town` theme), tavern props, and the brawler's and skirmisher's sprites. Step 11 draws no cantina art; `content/rooms/cantina.json` stays Step 11's.

**Slice B pushes 1-2 reviewed ~17:00 UTC by the lead** (365a40d the look: only `content/atlases|backdrops/cantina.json` and the art tool's lists changed, no existing image; 49a5e53 the swap): read the shared edits (`cleanInput` carries `tap` with numbers checked; `World.party` read at exactly `firstFreeMember` and `switch`; effect `become` sent only to the tapping player's own entity); `npm run check` re-run green (18 step11 scenarios and the extended real-server check). Lead's control: a tap counted on every tick instead of once by its `n` fails `step11-row-closes`, `-row-not-in-brawl` and `-swap-unplayed`. Not verified: a real iPhone; the no-fit refusal (no spot in the cantina where a body would not fit).

**Slice A reviewed 2026-11-23 ~16:05 UTC by the lead** (fb619f5, 0043f36; live): `npm run check` re-run green (12 step11 scenarios and checks, Step 2's friend scenarios unchanged); a page-like world in the cantina grows no regulars (lead's probe); lead's control: making the respawn write a player's position instead of sending `move` fails `step11-cantina` (4 problems) while `step11-ring-out` still passes, so the real-server check is what guards it. Signals 1-5 and 6's first half pass; the bell (owner's answer to Q-008) ends a brawl. Not verified: a real iPhone, two real phones in one brawl. Worker's flag on a page briefly wearing its own body on landing passed to Step 2's lead.
