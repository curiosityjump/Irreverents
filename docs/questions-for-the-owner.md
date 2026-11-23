# Questions for the owner

**Standing.** The one list of questions waiting on the owner. New
questions go to `docs/questions-inbox.md`; Vision Partner
(`docs/vision-partner-role.md`) curates **Open** and **Parked** and reads
them to the owner. The governing document holds each answer; this file
holds what is open, and `docs/answers-archive.md` holds one receipt line
per answer saying where it went.

## Current sessions

- **Vision Partner:** session_017WiGzGHxdLq71CDUoQZz9Z (second; started by the orchestrator 2026-11-23 13:29 UTC, succeeding genesis session_017WiGzHC3CvjTNZqCuxa8Ex, which handed off ~13:30 UTC, context long)
- **Orchestrator:** session_017WiGzGp8auJceLEAAh9Aqx (fourth; Opus; started by the owner 11:15 UTC as backup, took over 2026-11-23 12:01 UTC from session_017WiGzHX8g2sXimNRnqp2oZ, which stopped at 11:58 UTC on its Fable usage limit)
  This line is the one address every session uses to reach the current
  orchestrator; Vision Partner's doorbell goes only here.
- **Questions per message the owner wants:** 3 (the default; record the
  owner's own number here, quoted, if they set one).
- **Next id:** Q-014

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

## Open (6)

**After you've played the morning build**

### Q-010 · Is this the right order for what we build first?
- **Asked by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`, 2026-11-23 UTC, parent none
- **Question:** You gave the orchestrator free rein tonight, so the team is building in this order, protecting the top of the list if time runs short: (1) you and a friend in the same world at the live address, moving; (2) comfortable on a phone, easy to join and rejoin; (3) moving, hitting, grabbing and throwing things and each other, with three kinds of character; (4) a small kingdom of connected rooms with hidden routes; (5) people who react (three moods, witnesses, calls for help, sneaking or catastrophe); (6) the king who never stops talking; (7) a Hall of Legends pedestal and a machine to steal. After you've played the morning build: keep this order for what comes next, or move something up?
- **Unblocks:** `docs/current-directive.md` moving from draft to approved; what the next night's leads pick up first.
- **Recommendation:** yes, keep the order; tell us the one thing you most missed while playing and it moves to the top.
- **Answer goes to:** `docs/current-directive.md` "Current directive"
- **Source:** `docs/current-directive.md`
- **Blocking:** no

### Q-013 · When a friend takes the hero you need to get back out
- **Asked by:** lead, Step 2, `session_017WiGzGRnRoAeW5Ep5iSycV`, 2026-11-23 04:45 UTC, parent `session_017WiGzFWfLir1ATiSP7c5E5`
- **Question:** Your rule is that one person plays a hero at a time, so the switch button only offers heroes nobody is playing. That allows this: you crawl through a tiny gap as the small hero, switch to the flyer inside, then your friend switches to the small hero. You can't crawl back out until they switch off it, and with three players every hero is taken, so nobody can switch at all. Nobody is ever stuck in a wall, and your friend can free you with one press. Options: (a) leave it as it is and let friends sort it out by talking; (b) let a press ask your friend to swap (your library calls a consent swap "a sensible proposal but not approved"); (c) let the party have more heroes than players, so one is always free.
- **Unblocks:** nothing tonight; decides how switching feels with two or three players.
- **Recommendation:** (a) for now, then (c) once there are more heroes.
- **Answer goes to:** `docs/plan/step-2.md` "What's decided"
- **Source:** `docs/mechanisms/party-and-switching.md`, "known gaps"; `docs/plan/step-2.md`
- **Blocking:** no
- **Needs trying first:** best judged after playing with a friend.
- **As asked:** "When a friend takes the hero you need to get back out" (wording tightened; options and recommendation unchanged)

**One setting to change in Railway, when convenient (before 1 December)**

### Q-012 · Set Railway's "Watch Paths" so that our document pushes never restart your game
- **Asked by:** orchestrator, from Step 1's lead `session_017WiGzEwLs3ng2ZPpRZgctn`, `session_017WiGzFWfLir1ATiSP7c5E5`, 2026-11-23 UTC, parent none
- **Question:** The team pushes documents to GitHub every few minutes. Each push used to restart the live game and kick out whoever was playing. A small settings file in the repository (`railway.json`) now stops that, so only changes to the game itself restart it, and we've seen it work. But a web search (we couldn't open Railway's own docs, so this is unverified) says Railway stops reading that file for existing services on 2026-12-01. If so, document pushes would start restarting the game again from that date. Setting the rule by hand in Railway doesn't expire: open the Irreverents service, go to Settings, "Watch Paths", and enter `src/**`, `content/**`, `scripts/**`, `assets/**`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.pure.json`, `railway.json`. Options: (1) set it by hand before December; (2) leave it, and we watch for restarts after 1 December; (3) check Railway's own notice about the date and tell us what it says.
- **Unblocks:** nothing tonight; it keeps games from being cut off by our pushes after 1 December.
- **Recommendation:** 1. It's one field, and then the protection lives in Railway, not in a file that might stop working.
- **Answer goes to:** `docs/mechanisms/deploy.md` "Traps"
- **Source:** `docs/mechanisms/deploy.md`, "Traps"
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
