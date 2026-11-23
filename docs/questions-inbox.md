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
   (Open, Parked), `docs/answers-outbox.md`, `docs/answers-archive.md` and
   the governing step's quoted rulings. If it is answered, use the answer
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

### Q-? · Is this the right order for what we build first?
- **Asked by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`, 2026-11-23 UTC, parent none
- **Question:** You gave the orchestrator free rein tonight, so the team is building in this order, protecting the top of the list if time runs short: (1) you and a friend in the same world at the live address, moving; (2) comfortable on a phone, easy to join and rejoin; (3) moving, hitting, grabbing and throwing things and each other, with three kinds of character; (4) a small kingdom of connected rooms with hidden routes; (5) people who react (three moods, witnesses, calls for help, sneaking or catastrophe); (6) the king who never stops talking; (7) a Hall of Legends pedestal and a machine to steal. After you've played the morning build: keep this order for what comes next, or move something up?
- **Unblocks:** `docs/current-directive.md` moving from draft to approved; what the next night's leads pick up first.
- **Recommendation:** yes, keep the order; tell us the one thing you most missed while playing and it moves to the top.
- **Answer goes to:** `docs/current-directive.md` "Current directive"
- **Source:** `docs/current-directive.md`
- **Blocking:** no

### Q-? · Should the game remember things after it restarts? That needs storage only you can add on Railway
- **Asked by:** orchestrator, first run, `session_017WiGzFWfLir1ATiSP7c5E5`, 2026-11-23 UTC, parent none
- **Question:** Tonight's game keeps the world in the server's memory. Every time new code goes live the server restarts, so the world resets and anything "permanent" (Hall of Legends records, unlocked characters, what you've explored) is gone, apart from what each phone remembers for itself. Your library says saves are still open (D-095: "save backend … OPEN"). To keep things across restarts the Railway service needs somewhere to store them (a Railway "volume", or a Postgres database), and only you can add that in Railway. Options: (1) not yet: fine for now, we say plainly in the game what is and isn't kept; (2) add a volume to the `irreverents-production` service and tell us where it is mounted, and we save a small file there; (3) add Postgres and we use that.
- **Unblocks:** lasting Hall of Legends records (plan Step 7) and any unlock that should survive a restart.
- **Recommendation:** 1 for this morning; 2 the first time you wish something had been kept (it is one setting in Railway and no code on your side).
- **Answer goes to:** `docs/plan/step-7.md` "Open with the owner"
- **Source:** `docs/plan/step-7.md`, "What's decided"
- **Blocking:** no
- **Note (orchestrator, 2026-11-23 ~04:16 UTC):** the owner then asked the orchestrator, first-hand, "Tell me how to add the railway volume", and was given the steps (create a volume in the Railway project, attach it to the Irreverents service, mount path `/data`). That is not yet an answer to this question; once a volume exists the live `/healthz` will say so (`docs/plan/step-1.md`), and the orchestrator opens the saving work then.

