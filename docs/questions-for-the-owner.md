# Questions for the owner

**Standing.** The one list of questions waiting on the owner. New
questions go to `docs/questions-inbox.md`; Vision Partner
(`docs/vision-partner-role.md`) curates **Open** and **Parked** and reads
them to the owner. The governing document holds each answer; this file
holds what is open. Once an answer is acted on, the orchestrator deletes
its outbox entry and the commit message names what was done (git log is
the record; `docs/answers-archive.md` holds receipts up to 2026-11-23).

## Current sessions

- **Vision Partner:** session_017WiGzGHxdLq71CDUoQZz9Z (second; handing off 2026-11-24 ~14:35 UTC at ~680k context; successor to be started by the orchestrator, which writes its id here)
- **Orchestrator:** session_017WiGzHY5UZsWTLCH8cLm8M (picked up 2026-11-24 ~14:35 UTC from session_017WiGzHhT2apmWHT61rQ65G, whose handoff commit is 451cc2a)
  This line is the one address every session uses to reach the current
  orchestrator; Vision Partner's doorbell goes only here.
- **Questions per message the owner wants:** 3 (the default; record the
  owner's own number here, quoted, if they set one).
- **Next id:** Q-017

## How to feed this file

**Don't append here — only Vision Partner writes this file** (except the
header's **Orchestrator** line, which each orchestrator sets at pickup and
handoff, `docs/roles/orchestrator-card.md`). New
questions go to `docs/questions-inbox.md` (its
header says how, and holds the entry format). Vision Partner moves each
one into **Open** below. Answers leave through `docs/answers-outbox.md`;
the orchestrator deletes each entry once acted on and names what was done
in the commit message. All of this
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
  closes with a commit message naming them.

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

## Open (2)

### Q-014 · In the outpost stage, where does a game over send you?
- **Asked by:** orchestrator, `session_017WiGzHhT2apmWHT61rQ65G`, 2026-11-24 UTC (first asked in chat by `session_017WiGzJzo6aZqH4kYxxJsiV`, unanswered)
- **Question:** You said two things. For hearts: "Once all heros in the party are out of hearts, that's a game over (back to cantina)". For the outpost stage: "a real way to lose/die, which pushes you back to the entrance to start over". Inside the stage, when the whole party is out of hearts, do you restart at the stage's entrance (quick retry, the stage resets) or go back to the cantina (a longer walk back)? Built now: the stage's entrance inside the stage, the cantina everywhere else.
- **Unblocks:** Steps 21 and 22; nothing waits, the other answer is one setting.
- **Recommendation:** keep it as built: the entrance inside the stage, the cantina elsewhere.
- **Answer goes to:** `docs/plan/step-22.md` and `docs/plan/step-21.md`, "Hearts"
- **Source:** this entry
- **Blocking:** no

### Q-015 · One weapon and one power together, or one thing in all?
- **Asked by:** orchestrator, `session_017WiGzHhT2apmWHT61rQ65G`, 2026-11-24 UTC (first asked in chat by `session_017WiGzJzo6aZqH4kYxxJsiV`, unanswered)
- **Question:** You said: "No inventory. Only one weapon at a time. Similar to kirby - cant have multiple powers at once". May a hero hold one weapon (the sword) and one stolen power (the strength boost, the wings) at the same time, or does picking up either one drop the other, so a hero only ever has one thing? Built now: one weapon and one power together; a new weapon replaces the old weapon, a new power replaces the old power.
- **Unblocks:** Step 23 and Step 9; nothing waits.
- **Recommendation:** keep one weapon plus one power.
- **Answer goes to:** `docs/plan/step-23.md`
- **Source:** this entry
- **Blocking:** no

## Parked by you (0)

Asked again only when the owner raises the thing; each headline quotes
their parking.

*(empty)*
