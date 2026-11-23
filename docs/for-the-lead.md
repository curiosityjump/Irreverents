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

*(Empty. Append below.)*

### step-2-body.md, 2026-11-23

**Flag:** `npm run gates` reads gate A as passing on the twelve `body-*` scenarios alone. It will say so before the hit's scenarios land, so the count in `docs/plan.md` can read true early. Not chased: the gates script is Step 1's.

**Flag:** no `src/sim/body-state.ts` (or any "may this player act" helper) was on `main` when I finished, so `switch` and `flap` ask only Step 1's `heldBy` (`src/sim/effects.ts`): a held player's press is ignored, checked by a one-off script and not by a scenario (nothing can hold a player in a scenario yet). A flattened player can still switch and flap. Both verbs need the hit's helper in place of `heldBy` when it exists (`docs/mechanisms/party-and-switching.md`, "known gaps"). Carrying something while switching to a member too weak to hold it is also unhandled, and is the hit's to decide.

**Flag:** switching can strand someone in a room that needs the infiltrator. A crawls into a chamber as the infiltrator and switches to the flyer; B then switches to the infiltrator; A cannot become the infiltrator again until B lets go of it. With three players every member is taken and nobody can switch at all. Nothing in the simulation is stuck inside a wall, but "there is always a way out" for the room is Step 3's way-out check to cover (it runs per member, not per who is free). Not chased: the fix is a design choice (swap with a friend is "not approved" in the library).

**Note:** the live page still passes `content.game.playerCharacter` (`hero`), which has no `switch` verb, so Q does nothing live until Step 1 stops passing a character. `spawnPlayer` without one is on `main` since 792b0aa.

**Note:** in `graybox-hall` the first platform is 3 tiles up. The grappler (peak about 52 px) and infiltrator (about 51 px) clear it with 3 to 4 px to spare; the flyer's ground jump (about 47 px) does not, by design, and needs one flap. If Step 3's rooms use 3-tile steps, that margin is thin: `jumpSpeed` in `content/tuning.json`.

**Note:** a third scenario beyond the brief's list, `body-switch-midair-no-flaps`, and a fourth, `body-flyer-coyote-jump-not-flap`, cover two rules I added (both in the decisions log or the mechanism writeup).

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
