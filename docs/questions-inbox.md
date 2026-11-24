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

*(empty)*
