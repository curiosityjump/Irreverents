# Questions for the owner

**Standing.** The one list of questions waiting on the owner. New
questions go to `docs/questions-inbox.md`; Vision Partner
(`docs/vision-partner-role.md`) curates **Open** and **Parked** and reads
them to the owner. The governing document holds each answer; this file
holds what is open, and `docs/answers-archive.md` holds one receipt line
per answer saying where it went.

## Current sessions

- **Vision Partner:** session_017WiGzHC3CvjTNZqCuxa8Ex (genesis, started 2026-11-23)
- **Orchestrator:** session_017WiGzGp8auJceLEAAh9Aqx (fourth; Opus; started by the owner 11:15 UTC as backup, took over 2026-11-23 12:01 UTC from session_017WiGzHX8g2sXimNRnqp2oZ, which stopped at 11:58 UTC on its Fable usage limit)
  This line is the one address every session uses to reach the current
  orchestrator; Vision Partner's doorbell goes only here.
- **Questions per message the owner wants:** 3 (the default; record the
  owner's own number here, quoted, if they set one).
- **Next id:** Q-012

## How to feed this file

**Don't append here — only Vision Partner writes this file.** New
questions go to `docs/questions-inbox.md` (its
header says how, and holds the entry format). Vision Partner moves each
one into **Open** below. Answers leave through `docs/answers-outbox.md`
and are filed in `docs/answers-archive.md` once acted on. All of this
happens in the repository, not in chat: a question that exists only in a
chat message is a question that will be lost. (Exception: at genesis,
Vision Partner writes the first questions straight into Open;
`docs/vision-partner-role.md`, "Genesis".)

## Ids

- Format `Q-NNN`, three digits, zero-padded (`Q-001`); past `Q-999`, just
  keep counting (`Q-1000`).
- **Only Vision Partner assigns ids**, when it moves an entry out of the
  inbox. Askers write `Q-?`.
- The next id is the **Next id** line above. Vision Partner bumps it in
  the same commit that uses it, and checks it against the highest id that
  appears anywhere (`grep -rhoE 'Q-[0-9]+' docs | sort -t- -k2 -n | tail -1`).
- **Never reuse or renumber an id**, even for a dropped question: plan
  steps, receipts and code comments cite questions by id.
- A question split into several gets new ids for the parts; the original
  closes with a receipt naming them.

## Entry format

The inbox format (`docs/questions-inbox.md`) plus what Vision Partner
adds:

```markdown
### Q-NNN · <title in the owner's terms>
- **Asked by:** <role, step or brief>, `<session id>`, <date UTC>, parent `<session id>`
- **Question:** <one paragraph in the owner's terms: what the thing is (quoted, not referred to), what is stuck on it, the options and how each would feel to use>
- **Unblocks:** <Step N, a brief, or what happens the day it is answered>
- **Recommendation:** <one line; "yes" takes it; Vision Partner's own is labelled "(Vision Partner's)">
- **Answer goes to:** <file> "<section>"
- **Source:** <file:line, or "this entry">
- **Blocking:** yes | no
- **As asked:** <the asker's original words, if rewritten>
```

Optional lines: **Note (Vision Partner, <date>):** for context added since
asking; **Needs trying first:** when the owner has to try something before
answering; **Parked by you:** the owner's quoted words, in Parked.

**Ordering Open:** blocking first; then by how much work waits on the
answer; then questions that need the owner to try something, grouped under
one bold headline per thing to try; then the rest. Bold headlines between
entries group them; they are not entries.

---

## Open (4)

**After you've played the morning build**

### Q-010 · Is this the right order for what we build first?
- **Asked by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`, 2026-11-23 UTC, parent none
- **Question:** You gave the orchestrator free rein tonight, so the team is building in this order, protecting the top of the list if time runs short: (1) you and a friend in the same world at the live address, moving; (2) comfortable on a phone, easy to join and rejoin; (3) moving, hitting, grabbing and throwing things and each other, with three kinds of character; (4) a small kingdom of connected rooms with hidden routes; (5) people who react (three moods, witnesses, calls for help, sneaking or catastrophe); (6) the king who never stops talking; (7) a Hall of Legends pedestal and a machine to steal. After you've played the morning build: keep this order for what comes next, or move something up?
- **Unblocks:** `docs/current-directive.md` moving from draft to approved; what the next night's leads pick up first.
- **Recommendation:** yes, keep the order; tell us the one thing you most missed while playing and it moves to the top.
- **Answer goes to:** `docs/current-directive.md` "Current directive"
- **Source:** `docs/current-directive.md`
- **Blocking:** no

**Fixes for the Drive library (non-blocking; the newer rule wins until you say otherwise)**

### Q-005 · Several Drive docs still state rules your later decisions replaced. OK to treat the newer rule as the one in force?
- **Asked by:** Vision Partner, genesis, `session_017WiGzHC3CvjTNZqCuxa8Ex`, 2026-11-23 UTC, parent none
- **Question:** Some docs weren't updated after a later correction: (a) doc 24 says "Both distress and rage can rapidly reset to business as usual on reliable expected action", but D-073 says rage "is NOT instantly reversible"; (b) docs 22 and 24 still call villain signalling OPEN, resolved by D-070; (c) docs 02, 21 and 22 say pursuit can be escaped by acting normal in view, replaced by D-067 / doc 27 ("cannot be used as a trivial magical reset"); (d) doc 06 says "no NPC AI restriction remains in force for scripted brawlers", which literally means brawlers may have AI, against D-086; (e) doc 05 says you decided how tapping a cantina character differs from attacking it, doc 31 says you haven't. Also the register skips from D-090 to D-092 (no D-091).
- **Unblocks:** nothing now; it stops a future session building the stale rule.
- **Recommendation:** (Vision Partner's) yes: the newer, owner-labelled rule wins everywhere; (d) is a typo for "no NPC AI applies to brawlers too"; (e) is open. Whoever next edits Drive fixes the stale lines and logs it in the changelog.
- **Answer goes to:** `docs/vision.md` "Principles that decide most questions"
- **Source:** `docs/design-library/02-gameplay-systems/24-feasible-game-architecture-making-irreverents-playable.md`, 22, 21, 06, 05, 31
- **Blocking:** no

### Q-006 · Four of the five "current" pixel-art boards fail your own art gate. Move them out of "current"?
- **Asked by:** Vision Partner, genesis, `session_017WiGzHC3CvjTNZqCuxa8Ex`, 2026-11-23 UTC, parent none
- **Question:** Doc 32 says to exclude "large labeled poster/collage… graphics… direct Kirby-like final character designs". Four images in "Current Pixel-Art Explorations" are exactly that: "Character roster" (named cards, a Kirby clone called "Pupu"), "Cooperative adventure" and "World and ability asset studies" (Kirby himself with Kirby's copy abilities), and "Gameplay showcase" (a poster titled "Starvale Quest"). The fifth, "Pixel aesthetic reference — approved direction", is also a labelled collage with Kirby, but it is your chosen *look*. Options: (1) move the four to "Superseded" in Drive and keep only the reference as current; (2) keep them as current explorations; (3) move all five, keeping the reference only as a look reference.
- **Unblocks:** nothing now; prevents a session copying Kirby designs as a starting point.
- **Recommendation:** (Vision Partner's) 1.
- **Answer goes to:** `docs/vision.md` "Frontiers" (visual direction)
- **Source:** `docs/design-library/04-decisions-and-prototyping/32-verified-drive-audit-and-art-curation-gate.md`; `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`
- **Blocking:** no
- **Note (Vision Partner, 2026-11-23):** the E01 tilekit also has small defects (3 duplicate tiles per atlas, e.g. "wall_torch" draws as plain wall; its 384×224 screen size is neither of doc 14's options, 240×160 or 320×180). It is labelled experimental, so this only matters if someone builds on it.

### Q-008 · How does someone leave the endless cantina brawl?
- **Asked by:** Vision Partner, genesis, `session_017WiGzHC3CvjTNZqCuxa8Ex`, 2026-11-23 UTC, parent none
- **Question:** The project rule is "There is always a way out." Doc 31 says: "Owner has not specified a stop/exit/reset method" for the endless Smash-style bar fight. Options: (1) walk out a door; the fight stops behind you; (2) stop attacking for a few seconds and everyone calms; (3) both.
- **Unblocks:** the cantina whenever it's built (not soon).
- **Recommendation:** (Vision Partner's) 3.
- **Answer goes to:** `docs/vision.md` "Frontiers"
- **Source:** `docs/design-library/02-gameplay-systems/31-cantina-party-roster-hub-and-endless-brawl.md`
- **Blocking:** no

## Parked by you (0)

Asked again only when the owner raises the thing; each headline quotes
their parking.

*(empty)*
