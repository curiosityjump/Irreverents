# For the lead

**Standing.** Run per `docs/sop.md`. Written by executing sessions, read
and cleared by the lead; questions for the owner go to
`docs/questions-inbox.md`, not here. Empty between rounds is the healthy
steady state — same convention as `handoff-prompts/`.

---

## Why this file exists

The rule, as the original owner of the project this system was derived
from put it (paraphrased): reports, flags and things worth noting don't
belong in a chat with the owner. They belong with the lead, in the
codebase, so the lead can update the relevant documentation, processes
and later briefs from what the executing sessions did and flagged. And
questions for the owner that arise during the work, but don't prevent
it, should reach the owner through the lead — not through a chat the
owner deletes the moment a brief completes.

An executing session's chat may be deleted, archived or simply never
read again the moment its brief ships. Anything that exists only in that
chat — a flag, a "worth noting," a question that didn't block the work —
is gone then. This file is where it goes instead, so it survives to the
one session that reads across rounds.

## What goes here, and what doesn't

**Write here:** anything you'd otherwise have put in your final message,
*except* a genuine blocking question (below). A flag ("this looks off,
might be intentional, didn't chase it"), a "worth noting" that doesn't
yet have an obvious home in `docs/sop.md` phase 6's routing table. A
question for the owner, blocking or not, goes to
`docs/questions-inbox.md` instead (its header says how).

**Don't write here:**

- **Routine verification detail** — what you ran, what passed, what you
  didn't verify. That's the commit message's job (`docs/sop.md` phase 7).
- **Anything with an obvious permanent home already** — a new mechanism,
  a confirmed-deliberate design, a decision the owner already made, a new
  working rule. Phase 6's table routes those directly; don't detour
  through here first.
- **A genuinely blocking question** — one where you cannot finish the
  brief without an answer. That still goes to whoever launched you
  directly, in the moment, per `docs/sop.md` phase 4. This file is for
  everything that *doesn't* stop you.

## Entries

*(Append below.)*


## Format

One entry per item, appended, never edited or deleted by the session that
wrote it:

```markdown
### <brief file name>, <date>

**Flag:** <what you noticed, in plain terms, and why you didn't chase it>

**Note:** <anything else worth the lead's attention before it's triaged>
```

Use whichever of the two fit; skip the rest. Keep it short — this is raw
material for the lead to triage, not the final wording anything ships
with.

---

## The lead's obligation

**Read this file at the start of every round, before writing the next
brief — not only when reviewing the slice that produced an entry.** An
entry left here across rounds is exactly the failure this file exists to
prevent, just moved from a deleted chat to a file nobody re-reads.

For each entry:

- **A flag or note with an obvious permanent home** → move it there
  (`docs/sop.md` phase 6's table), then delete the entry.
- **A non-blocking question** → it belongs in `docs/questions-inbox.md`,
  not here: move it there (its header says how) and delete the entry.
  Check `docs/questions-for-the-owner.md` and `docs/answers-outbox.md`
  for your step every round instead of carrying questions in your own
  report — the bar `docs/sop.md` phase 4 and `docs/lead-session.md`'s Ask
  section already set. Once the owner has answered, record the answer
  where it belongs (phase 6, same as any decision).
- **An entry that is really about the process** — the brief was missing
  something, instructions conflicted, work was redone. Also append it to
  `docs/process-observations.md` before you delete it here. This file
  gets cleared, and that one keeps the evidence.
- **A finding that reaches beyond your element** → one line in
  `docs/for-the-orchestrator.md`, so it can be fixed once for every lead.
- **Anything you're unsure how to route** — the uncertainty itself is
  worth a line in your next report, not a reason to leave the entry
  sitting unread until the next round.

**You are the only one who reports upward about anything beyond a live
blocking question.** The orchestrator (and through it, the owner) reads
your reports, not an executing session's chat. So the bar
`docs/lead-session.md`'s Ask section sets — plain language, a
recommendation attached, nothing the reader has to open a file to act
on — covers everything that used to arrive through a session's own final
message: findings and flags alike, folded into the one report that is
actually read (questions for the owner go through
`docs/questions-inbox.md`).


### step-2-hit.md, 2026-11-23

**Flag:** the live page still seats the player as `hero` (`src/client/main.ts` passes `content.game.playerCharacter`, which is `hero`), and `hero` has no `attack`, `grab` or `body` verb (the brief says not to add any). So on the live address tonight a player can be hit and thrown but cannot hit or lift until Step 1's Gate 2 seats players from the party. Both files are another step's; I left them. The fight screenshot was taken by switching the local player to `grappler` inside the page.

**Flag:** the line under the game on the page says only "Arrow keys or A / D to run, Space to jump". Hit is X or J, grab is C or K (throw is hit while carrying; set down is grab again). `src/client/index.html` is Step 1's.

**Flag:** `src/sim/systems/physics.ts` (shared with Step 3) gained one import and one line: it skips a body that is carried or in a held beat (`takesNoPhysics`). The brief asked for impacts without editing physics, and they are done that way (a system before, a system after); the skip was needed because restoring a frozen body's position after physics would have emitted a false `landed` for it on some ticks.

**Flag:** `canAct` is enforced in one place, `src/sim/systems/verbs.ts` (no verb runs for a body that is flying, held, in a beat or flattened), rather than by an early return in `move.ts` and `jump.ts` as the brief suggested; `switch.ts` and `flap.ts` now ask `canAct` too (`step2-hit-held-cannot-switch`). A carrier who switches drops what they carry, whoever they become (`step2-hit-switch-drops-carried`). Side effect: a verb's "was the button down last tick" memory goes stale while a body cannot act, so a button still held when control comes back counts as a fresh press (breaking free with jump also jumps).

**Flag:** effects (your 04:42 message, read late: after my first hit push, c05f6a5; the follow-up commit routes everything through `emitEffect`). Two additive changes to Step 1's `src/sim/effects.ts`, for you to pass on: `push` takes an optional `fly: { by, met }` and then also sets `entity.c.flying`; a new kind `flatten { ticks, by }` sets `entity.c.flattened`. Why `fly`: a plain `push` reaches a player's device as a velocity only, and that device's own `move` verb would pull it back to the stick within a few ticks; "cannot steer until at rest" has to travel with the push. What effects still do not carry to a player's device: the held beat's own freeze (it is a zero push, then the real push), `c.worn`, `c.impact` (drawing), and the end of a flight if the device and the server disagree about when the body came to rest. Untested across two devices: there is no `e2e` yet.

**Note:** scenario format grew beyond the brief, all additive: an input span may name `"entity"` (written to that body's `c.input`), the `event` fact takes `"where"`, and there is a `body-state` fact. Step 4's workers can test NPC input with the first.

**Note:** placements files need `"id"` equal to `"room"`: the content loader requires every item of a directory kind to carry its file name as `id`.

**Note:** taste, for the owner's list: whether a throw makes them say "OHH"; how long the freeze on impact should be (`beatTime`, `hitBeatTime`); how far things fly (`maxLaunchSpeed` 520, the strengths); whether friends should be able to hurt each other; whether three seconds flattened is right; carrying overhead.

**Flag:** the brief asked for ground friction on every body with no `move` verb. Built narrower: friction and drag apply only to a body that is flying or flattened, and a body that cannot run is stopped when its flight ends. The broader rule broke Step 3's `step3-guard-follows` (a guard given a starting `vx` of 60 is expected to keep it through a door), and that scenario is its owner's. Seen from play the two rules are the same: nothing in the game moves a crate or a dummy except a hit, a throw or a shove.


### step-4-slice-1-moods.md, 2026-11-23

**Flag:** `interact` ("Use", key E) has no touch control. It is one more file in `content/actions/`, so whoever builds the touch layout from that list (Step 1 Gate 2 / Step 5) should pick it up, but nobody has checked that on a phone, and buying and taking are impossible on an iPhone until it does. Not mine to build (`src/client/**`).

**Flag:** `npc-interact` keeps `c.interact` on the player's own entity and changes a thing's `takenBy`. If Step 1's netcode has each phone simulate only its own character, the server must still run this system for every player or a take never reaches the other phone. Not checked: the netcode is not on main.

**Flag:** the brief said `entity.c.drive` and a rule of mine in `systems/verbs.ts`; Step 2 had landed `entity.c.input` and the rule, so people write `c.input` (one helper, `drive()` in `src/sim/npc/state.ts`). `docs/plan/step-4.md` still says `c.drive` (yours to edit).

**Flag:** a blow that knocks a person out is not perceived by them. Step 2's hits landed while I worked, so `step4-hero-hits-shopkeeper` uses a real one: the first hit distresses the shopkeeper through the `events` table. A second hit knocked the shopkeeper out (a body with no toughness number gets the world default), and because someone out cold sees nothing, that hit had no witness but the villain and never became rage; the shopkeeper wakes still only distressed, clocks frozen meanwhile. Left as it is: knocked-out people are slice 2's, and the shopkeeper's toughness is Step 2's number. `grab` and `throw` rows were exercised only with made-up events in a scratch script.

**Flag:** Step 2's `event` fact gained a `where` filter while I was writing `event-where`, so there are now two ways to say nearly the same thing. Mine compares whole values (`"witnesses": []`); I did not check whether theirs does. Worth folding into one later; not touched, the fact is theirs.

**Note:** `deed.witnesses` lists everyone who perceived the deed, whether or not they care: the villain is in the list for a hero's take and stays in mood 1. Slice 2 should decide who reports from mood, not from the list alone.

**Note:** my scenarios play `"character": "hero"` and pin exact ticks (the villain robs at 168 and buys at 2962; rage cools at 1150). They move if the `hero` tuning set, the three people's walk numbers or the test-shop routines change. `node scripts/trace.ts <id>` prints only bodies; moods are easiest read from the failure message of a `mood` fact, which lists every mood change in the run.

**Note:** rung 5 was looked at in a desktop-sized headless page (960 px wide, canvas scaled 3x), not at phone size. The marks read clearly; the 8 px bark text is soft but legible there.

### step-7-a-store-and-pedestal.md, 2026-11-23 (part 2, the pedestal)

**Flag:** "Not saved" needs a signal the page can read. `draw/hall.ts` shows the line when a pedestal carries `c.hall.lasting === false`. Owed at wiring: the server sets it on every pedestal when `store.lasting` is false, and slice B's `Components.hall` gains `lasting?: boolean` (one optional field). Until then the line never shows.

**Flag:** `content.hall` and the `pedestal` character kind were not on `main` when I finished, so the card's words were only seen through their fallbacks (ids as words), and the pedestal body in my screenshots was a stand-in kind added inside the page. `hall.ts` reads `content.hall.kinds[id].name` and `content.hall.stats[id].label` loosely; if slice B named them otherwise, the ids show instead. Worth one look at the real page once slice B's content lands.

**Flag:** `render()` is not given the local player, so any player's character at a pedestal opens the card on every screen showing that room (`DRAFT:` at the site).

**Flag:** the banner's "new" means "not in the first frame that had a world in it". If Step 1's network layer delivers the world over several frames, or re-delivers it after a reconnect, check that old records are not announced (several arriving in one frame are already ignored).

**Flag:** rung 5 was by eye, on hand-made records pushed into the page's world; nothing scripted covers the drawing, and the real path (detector → pedestal → page, two devices) has not been seen. Text follows `draw/npcs.ts` (`fillText`, 8 px): readable, soft on a phone; a shared pixel font would be Step 5's or 8's call.

### step-3-b-kingdom-and-parts.md, 2026-11-23 (pushes 1 and 2 of 4; pushes 3 and 4 not started)

**Done:** push 1 (`cb297c0`): the five part kinds, drawn, in `test-parts`. Push 2: behind the throne (false wall, hidden door `behind-the-throne`, the window, a small `undercroft`, the cellar doorway up into the street). Gate B gains `step3-behind-the-throne` (signal 2). **Not done, for the next session:** push 3 (courtyard, plate gate, gallery, roofs: signal 5 and `step3-over-the-roofs`), push 4 (the secret, signal 3; placing `hide` parts in the street and the throne room; the undercroft's vault). The `hide` kind itself is on `main`.

**For Step 6:** the window is part `window` in `throne-room`; its event is `part-broken: { room: "throne-room", part: "window", by, player, speed, look: "window" }`.

**Stand-ins:** `step3-through-the-window` and `step3-wall-breaks` use a crate given a starting speed, not a real grab-and-throw. No scenario yet throws a real body (or the king) through the window from the dais; whether Step 2's throw reaches 200 px/s sideways at window height from where a carrier can stand is unmeasured.

**Flag (network):** each page steps its own world with only its own character in it. So between the server's snapshots a page's local `room-plate` sees nobody on a plate another player is standing on, sets it up and emits `plate-up`, until the next snapshot sets it down again. The gate itself is safe (its countdown is refreshed by every snapshot while the server sees the plates held), but another player's plate may flicker on screen and local `plate-up`/`plate-down` events are noise. Not seen on a real pair of devices; look at it when push 3 puts plates in the courtyard. A page-side rule "parts are the server's while online" would fix it, in Step 1's layer.

**Flag:** a body thrown through the window keeps its full speed into the undercroft and slides the length of the passage (a plain crate with a starting speed has no friction; a really thrown body is slowed by Step 2's drag). Looks right for a throw; untested with one.

**Flag:** the brief asked for one more control "a room whose hidden connection is an enter doorway": slice A's `hidden-doorway-has-a-sign` is exactly that, so none was added. Added instead: `gate-names-no-plates`, `breakable-unknown-look` (the kinds' own parameter checks).

**Flag:** `drawRoom` draws from a tile atlas when a room has one (`content/atlases/`); `draw/room-parts.ts` paints false walls, hidden doors and cracked walls with the graybox wall colour. The day a room with a false wall gets an atlas, the false wall will stand out: the part drawing must use the atlas's solid cell then.

**Flag:** the king's speech bubble covers most of the window from the spawn side (screenshot by eye). Step 6's to place.

**Not verified:** no real iPhone; the hiding place and the false wall in `test-parts` were never seen drawn there (the false wall was seen in the throne room).
