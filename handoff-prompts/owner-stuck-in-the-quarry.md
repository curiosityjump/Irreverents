# The owner got stuck in the quarry after his hero died, and the menu button did nothing: every place has a way out, and the way out works

**Landed so far** (builder `session_017WiGzJ3bzMxXHEzb35AHfR`, stopped at its budget):
- **70b2361, push 1, the menu.** Measured by touch at 844x390, 750x340, 390x664 (headless Chromium): the button opened the menu in every state reached (walking, the GAME OVER card, STAGE CLEARED, sleep and wake, the server killed under the page and back). **No dead tap reproduced; a real iPhone was not tried.** What failed was the menu's only choice, "Back to the start screen", whose Continue puts you back where you were stuck. Now the menu offers **"Back to the entrance"** inside a stage (the quarry, the forest: your hero alone to the stage's start, holding nothing; it counts as a start-over) and **"Back to the cantina"** anywhere else; not in the cantina, not over STAGE CLEARED or the GAME OVER card. Sideways the menu is two columns (with the new row, Close had fallen off a 340 px screen). Scenarios `menu-back-*`, e2e `menu-opens-*`, `menu-way-back-*`.
- **a1f6101, push 2, the traps.** The way-out check (`src/sim/check-rooms.ts`, already in `npm run check`, all rooms) played only the party's three heroes; it now plays every roster hero (`wayOutCharacters`), and `scripts/way-out-audit.ts` prints every (room, hero, tile). **The one trap found: the Bandit Camp's cache (`outpost.json`, columns 76-83, floor row 10), the brawler only** (jump 47.5 px, the cache's step 48): fixed by a one-way tile at column 83, row 9 (`way-out-camp-cache-brawler`). **No trap in the six quarry rooms for any hero**, so the owner's quarry trap is not a fixed-tile one in an empty room (`docs/plan/step-3.md`, "The owner stuck in the quarry").
- **Not live at 21:35 UTC:** pushed ~21:19, `/healthz` healthy on ce3f8bf; not reverted (the brief's rule); `check:live` not run.
- **Not done:** push 3 (a place reached only with a power that faded); the menu button's look (weak on dark or busy backdrops) and the plate touching it by 6 px upright (the orchestrator's look at 3dc7ef7); the hauler (sixth roster hero, landed during this work) is played by the widened check, but my last full `npm run check` with it in was cut off before its end (402 ok, no FAIL so far); the full e2e was run once before the rebases (154 ok; `level-menu` fixed since, `level-full` passed alone), not after them.

Brief for one builder, two or three small pushes, most urgent first.
Written 2026-11-24 19:35 UTC by the orchestrator
(`session_017WiGzHY5UZsWTLCH8cLm8M`). **This is the owner's own report
from playing on his phone, minutes ago: it goes ahead of everything.**

**The owner, 2026-11-24 ~19:30 UTC, first-hand to the orchestrator:**
> My little guy died and then i got stuck in the quarry. There are
> platforms you can jump up through, but not back down through, which
> can close paths. Not a bad thing l, just needs accounted for. The menu
> in the too left corner didn't seem to be working either

Read first: `CLAUDE.md`, "There is always a way out" (**Waiting may be a
cost; being stuck may not**); `docs/deliberate-designs.md` (grep "way
out": lines 82-96, the exits already defended, each with its `INTENT:`;
and "one-way": some one-way pieces are deliberate valves, e.g. the
camp's tile at (8,9) and the forest's boughs: do not open those);
`docs/plan-archive.md`, "Step 22" (the quarry as a stage: hearts, a hero
out, start over at the entrance, GAME OVER back to the cantina; which of
these happened to him depends on how many heroes he had left: read what
"died" can mean for one hero of a party, and where the next hero or the
restarted party is put); `docs/mechanisms/rendering-world.md` (the menu
button `#menu-btn`, "the way out", line 170; the party plate beside it);
`src/client/start.ts` (the button, line 681, and the game menu it
opens); `docs/mechanisms/saves.md` and the start screen's doc for what
the menu's choices do; `docs/mechanisms/scenarios.md`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after EACH push, in plain words the
owner could read (what a player can now do). **Notes:**
`docs/plan/step-3.md`, a section "The owner stuck in the quarry".

## The task, and the measure

Two faults a friend would hit, both against the project's first design
principle. Moves no row of the plan's table. The measure: no standable
place in any room a player can reach holds any hero with no way to an
exit; and the menu button opens the menu on a phone in every state a
player can be in.

## Not known (measure it; do not guess)

- **Which room and which spot.** He said "the quarry": six rooms
  (`content/rooms/quarry-road.json`, `-ridge`, `-depot`, `-pit`,
  `-cave`, `-tower`), plus where a beaten hero or a restarted party is
  placed. The live error log was emptied by a deploy at 19:21 UTC, so
  there is no trace of his session.
- **Which hero**, and how many he had left. Heroes differ in jump height
  and size, so a spot can trap one and not another; and the one who is
  out changes who is left to play.
- **What "the menu didn't seem to be working" was**: the button drew and
  did not respond to a tap; or the menu opened and a choice did nothing;
  or it was not drawn. The party plate also sits top-left and "moves
  right of the menu button"; the plate's fade is being built right now
  in `src/client/draw/hud.ts` by another builder (not pushed at 19:30),
  so what he played had the plate as it was at 778ab9d.

## Do

**Push 1, the menu (the way out must work first).** On a phone-sized
page by touch (390x664, 844x390, 750x340), tap `#menu-btn` in each
state a player can be in in the quarry: walking; carrying; with a hero
out and the next one played; while a banner, the alert strip, the
stage's cards (GAME OVER, STAGE CLEARED), a speech box or a pedestal
card is up; after the page slept and came back; after the server
restarted under the page (a deploy happened at 19:21 UTC, about when he
was playing: reproduce a restart under a page mid-stage and see what the
button, the menu and the game do). Find the state where a tap does
nothing or a choice does nothing: what element takes the touch
(`document.elementFromPoint` at the button's centre), what the menu
offers, and whether one of its choices gets a stuck player out (to the
stage's entrance, to the cantina, to the start screen). Fix it; an e2e
fact per state that failed, each with a control. If the menu has no
choice that moves a stuck hero somewhere safe WITHOUT losing the game
(roster, pieces, the stage's progress as a start-over already treats
them), add one, as the smallest thing: the orchestrator's ruling,
`DRAFT:`, one `docs/decisions-log.md` entry: **the menu offers "Back to
the entrance" inside a stage (the party at the stage's entrance, hearts
as a start-over leaves them) and "Back to the cantina" elsewhere; never
during a brawl's ring-out or a card that already has its own way on.**
Mark it `INTENT:` at the code site, quoting the owner's words above.

**Push 2, the traps.** Write a reachability audit as a script in
`tools/` or a scenario kind (your call; it must be re-runnable and
listed in `docs/mechanisms/`): for every room a player can enter, for
each of the five roster heroes (and with no powers), from every place
that hero can be PUT or can REACH (door arrivals, spawns, the stage's
entrance, where a beaten hero's successor appears, and every standable
tile reachable from those with that hero's own jump, one-way platforms
passable upward only), can they reach at least one exit door of the
room? Use the sim's own movement numbers (`content/tuning.json`, the
hero's character file), not a guess of jump height. Print every (room,
hero, tile) with no way to an exit. Start with the six quarry rooms and
show the owner's trap in its output; then all rooms. For each trap:
fix it in CONTENT with the smallest change that keeps the room's design
(a step, a ladder-like stack of one-ways the other way, a gap in the
one-way, a drop beside it), never by removing a secret, a quiet way or a
deliberate valve (if a trap IS a deliberate valve, the way out is
elsewhere: add that instead). The owner: "Not a bad thing, just needs
accounted for": one-way platforms stay; dead ends go. A scenario per
fixed trap (that hero, put there, walks out), with a control (the old
room fails it). `INTENT:` in each room file's `"//"` at the fix. Add the
audit to `npm run check` if it runs in a few seconds, so a new room
cannot ship a trap; else document the command.

**Push 3, only if budget remains:** the same audit for a hero carrying
nothing versus one who dropped in holding a power that has since faded
(wings, the boost): a place reachable only with a power must have a way
out without it.

## Yours and not yours

Yours: `src/client/start.ts` (the menu), the smallest server or sim
change the menu's new choice needs (additive only; ids never renamed),
`content/rooms/quarry-*.json` and any other room with a proven trap, a
new audit script, scenarios, a new file under `scripts/e2e/` plus its
one call line in `scripts/e2e.ts` (the e2e-reds brief owns fixes there:
add only your line, rebase before you push). **Shared, so pull and
rebase before every push and touch only your lines:**
`src/client/draw/hud.ts` (`plate-clear-of-bodies.md` is in it now: if
the menu's fault is there, say so to the orchestrator before editing),
`content/rooms/undercroft.json` and `quarry-cave.json`
(`hidden-recruit.md`), `content/rooms/courtyard.json` and its
placements (`guard-vehicle-courtyard.md`, `ranged-enemy-2.md`),
backdrop fields in any room (`biome-backgrounds.md`).

## Done

Each push: build and check green; your facts and scenarios green and
their controls red; one full `npm run e2e` (the suite has an
intermittent red in about half of today's full runs:
`hearts-game-over`, `start-link-back`, `plates-friend-held`, `door-use`,
`outpost-break`, `start-continue-gone`, `quarry-depot-in`,
`row-both-sides` have each gone red once and pass alone; one of those
red once is not yours: re-run it alone and say so; rebase once before
the push, do not re-run the full e2e after every rebase); read
`/debug/errors` and `/healthz` first (**if `players` is above 0 the
owner may be playing: push anyway, he has said pushes are free, but say
in your report that a restart landed on a player**); pushed to `main`,
live (`npm run check:deployed`, `npm run check:live`). A deploy that
seems stuck with `/healthz` healthy on an older commit: never revert,
wait up to fifteen minutes pushing nothing
(`docs/verifying-and-finishing.md`, "The pre-push gate"). Stop at about
300k tokens with "Landed so far" filled in. Nobody but the owner has
tried this on a real iPhone: say what you could not reproduce.
