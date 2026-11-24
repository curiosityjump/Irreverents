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

### Q-? · Asset need: the grappler's suplex frames
- **Asked by:** Step 25's suplex builder (brief `handoff-prompts/suplex.md`), 2026-11-24, parent `session_017WiGzHY5UZsWTLCH8cLm8M`
- **Question:** The suplex is in the game (carry someone, tap Use, which now says SUPLEX). Today the hero holds the body overhead in the carry pose while the game turns the carried body up and over, then slams it behind. Art would make it land: for the grappler (`content/sprites/grappler.json`), a suplex strip on the same cell as the others: wind-up (the body hoisted, knees bent), arch back (the body over the head, going behind), the slam (bridged back, the body head-down at the floor behind), recoil. Four frames, about 0.3 s for the whole heave, faced right (the game mirrors). The art plan already lists it (C02-05: "carry, grab, pivot, suplex wind-up, slam, recoil").
- **Unblocks:** Step 25's look; no work waits on it (it plays now with the frames there are).
- **Recommendation:** File it with the grappler's next frames request, SOON, not BLOCKING.
- **Answer goes to:** `docs/mechanisms/asset-requests.md` "Requests in flight"
- **Source:** `docs/plan/step-25.md`, "Do" push 2; the art plan's C02-05 line (`docs/design-library/03-visual-direction-and-assets/00-asset-production-plan-and-style-lock/13-art-asset-production-plan-ordered-generation-backlog.md:109`)
- **Blocking:** no
