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


### step-7-a-store-and-pedestal.md, 2026-11-23 (part 2, the pedestal)

**Flag:** "Not saved" needs a signal the page can read. `draw/hall.ts` shows the line when a pedestal carries `c.hall.lasting === false`. Owed at wiring: the server sets it on every pedestal when `store.lasting` is false, and slice B's `Components.hall` gains `lasting?: boolean` (one optional field). Until then the line never shows.

**Flag:** `content.hall` and the `pedestal` character kind were not on `main` when I finished, so the card's words were only seen through their fallbacks (ids as words), and the pedestal body in my screenshots was a stand-in kind added inside the page. `hall.ts` reads `content.hall.kinds[id].name` and `content.hall.stats[id].label` loosely; if slice B named them otherwise, the ids show instead. Worth one look at the real page once slice B's content lands.

**Flag:** `render()` is not given the local player, so any player's character at a pedestal opens the card on every screen showing that room (`DRAFT:` at the site).

**Flag:** the banner's "new" means "not in the first frame that had a world in it". If Step 1's network layer delivers the world over several frames, or re-delivers it after a reconnect, check that old records are not announced (several arriving in one frame are already ignored).

**Flag:** rung 5 was by eye, on hand-made records pushed into the page's world; nothing scripted covers the drawing, and the real path (detector → pedestal → page, two devices) has not been seen. Text follows `draw/npcs.ts` (`fillText`, 8 px): readable, soft on a phone; a shared pixel font would be Step 5's or 8's call.


### step-12-a-outpost.md, 2026-11-23

**Flag:** a doorway needs two tiles of height and a free tile beside it for the way-out check to find it (a one-tile `o` at the wall's edge was refused as "no way out"). The courtyard's `o` is one tile (row 7, column 23, the brief's "that one character"), and the check passes it; the outpost's is two (rows 9-10, column 2).

**Flag:** `scripts/lib/room-controls.ts` (not this step's) needed one word: a room control with its own `game` drops `content/outposts/` with the real rooms, as it drops placements, or every such control failed on the outpost's missing room. Additive.

**Flag:** Step 4's `charge` holds `attack` continuously, and Step 2's attack starts a swing only on a fresh press, so a charging person with `attack` swings once. The outpost's fighters pulse it (every other tick); Step 4's behaviour is untouched.

## `handoff-prompts/step-11-a-brawl.md` (slice A, done)

- **The brief changed under me at 14:45** (the bell); I read it at the
  start and saw the change only at the decisions log, after the calm-time
  version had shipped (fb619f5). The bell is in the following push;
  calmTime is 0 and the calm scenarios became the bell's.
- **Two lines in `render.ts`, not one:** the bell is drawn behind the
  bodies (beside `drawBells`), the counter on top.
- **One edit in Step 3/scripts:** `scripts/lib/room-controls.ts` drops
  `content/cantina/` with the real rooms (a map-of-its-own control would
  otherwise fail on "no room cantina"). One token in a regex.
- **Not mine, seen while building:** on a page, a player's own world
  wears its character on landing with the full share (the attacker is
  not in that world, so `friendly()` says no). The server's wear is the
  truth and the page takes it with a flatten or move, but a page can
  believe for a moment it is worn. Step 2's, if it matters.
- **Not verified:** a real iPhone; two real phones in a brawl (the
  real-server check uses two headless clients; `npm run e2e` was green,
  and a phone-sized Playwright page started a brawl by touch and showed
  the counter).
