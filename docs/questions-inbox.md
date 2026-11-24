# Questions inbox

**Standing.** Where any session puts a new question for the owner. Keep
it lean: Vision Partner (`docs/vision-partner-role.md`) cuts every entry
out of here into **Open** in `docs/questions-for-the-owner.md`, so between
the owner's conversations with Vision Partner this file is usually empty.

## How to add a question

The moment any session has a question only the owner can answer:

1. Decide blocking or not, as `docs/sop.md` phase 4 says. Blocking: ask
   the owner in your message, first or alone, and still do steps 2-4, so
   a message they miss is not a question lost.
2. Grep `docs/deliberate-designs.md`, `docs/questions-for-the-owner.md`
   (Open, Parked), `docs/answers-outbox.md`, `docs/answers-archive.md`
   (receipts up to 2026-11-23; since then `git log --grep`, as the
   orchestrator names what it did with each answer in the commit message)
   and the governing step's quoted rulings. If it is answered, use the answer
   and write nothing.
3. Append one entry under **Entries** below, in the format below, phrased
   to the bar: the owner's terms (they do not know the codebase; quote the
   thing itself), what it unblocks, one recommendation, where the answer
   goes. Leave the id as `Q-?`. Never edit another entry. Commit with your
   work and push; on a rejected push, `git pull --rebase` and push again,
   up to three times.
4. Gate: your entry is on the remote. No message to Vision Partner: the
   push is the feed, and Vision Partner reads this file every time the
   owner talks to it.

If the owner answers you first-hand somewhere else, write the answer where
it governs yourself (`docs/sop.md` phase 6) and add it to
`docs/answers-outbox.md` in its format.

### Entry format

```markdown
### Q-? · <title in the owner's terms>
- **Asked by:** <role, step or brief>, `<session id>`, <date UTC>, parent `<session id>`
- **Question:** <one paragraph in the owner's terms: what the thing is, what is stuck on it, the options and how each would feel to use>
- **Unblocks:** <Step N, a brief, or what happens the day it is answered>
- **Recommendation:** <one line; "yes" takes it>
- **Answer goes to:** <file> "<section>"
- **Source:** <file:line, or "this entry">
- **Blocking:** yes | no
```

Vision Partner assigns the id and adds **As asked:** with the original
wording when it rewrites an entry.

## Entries

### Q-? · In the outpost stage, where does a game over send you?
- **Asked by:** orchestrator, `session_017WiGzHhT2apmWHT61rQ65G`, 2026-11-24 UTC (first asked in chat by `session_017WiGzJzo6aZqH4kYxxJsiV`, unanswered)
- **Question:** You said two things. For hearts: "Once all heros in the party are out of hearts, that's a game over (back to cantina)". For the outpost stage: "a real way to lose/die, which pushes you back to the entrance to start over". Inside the stage, when the whole party is out of hearts, do you restart at the stage's entrance (quick retry, the stage resets) or go back to the cantina (a longer walk back)? Built now: the stage's entrance inside the stage, the cantina everywhere else.
- **Unblocks:** Steps 21 and 22; nothing waits, the other answer is one setting.
- **Recommendation:** keep it as built: the entrance inside the stage, the cantina elsewhere.
- **Answer goes to:** `docs/plan/step-22.md` and `docs/plan/step-21.md`, "Hearts"
- **Source:** this entry
- **Blocking:** no

### Q-? · One weapon and one power together, or one thing in all?
- **Asked by:** orchestrator, `session_017WiGzHhT2apmWHT61rQ65G`, 2026-11-24 UTC (first asked in chat by `session_017WiGzJzo6aZqH4kYxxJsiV`, unanswered)
- **Question:** You said: "No inventory. Only one weapon at a time. Similar to kirby - cant have multiple powers at once". May a hero hold one weapon (the sword) and one stolen power (the strength boost, the wings) at the same time, or does picking up either one drop the other, so a hero only ever has one thing? Built now: one weapon and one power together; a new weapon replaces the old weapon, a new power replaces the old power.
- **Unblocks:** Step 23 and Step 9; nothing waits.
- **Recommendation:** keep one weapon plus one power.
- **Answer goes to:** `docs/plan/step-23.md`
- **Source:** this entry
- **Blocking:** no

### Q-? · Should raw music stems and unused source packs stay out of the game's repository?
- **Asked by:** orchestrator, `session_017WiGzHhT2apmWHT61rQ65G`, 2026-11-24 UTC (first raised by `session_017WiGzJzo6aZqH4kYxxJsiV`)
- **Question:** The copy of your Drive design library inside the project grew to 334 MB (raw `.wav` music stems and source packs the game does not load). Every new helper session downloads the project and every deploy uploads it. Nothing would be deleted from your Drive; those big files would simply be listed by name in the project instead of copied in, and fetched when something needs them.
- **Unblocks:** faster session starts and deploys; nothing waits.
- **Recommendation:** yes, list them instead of copying them.
- **Answer goes to:** `docs/mechanisms/asset-requests.md` and `tools/drive_sync.py`'s skip list
- **Source:** this entry
- **Blocking:** no
