# Questions for the owner

**Standing.** The one list of questions waiting on the owner. New
questions go to `docs/questions-inbox.md`; Vision Partner
(`docs/vision-partner-role.md`) curates **Open** and **Parked** and reads
them to the owner. The governing document holds each answer; this file
holds what is open, and `docs/answers-archive.md` holds one receipt line
per answer saying where it went.

## Current sessions

- **Vision Partner:** session_017WiGzGHxdLq71CDUoQZz9Z (second; started by the orchestrator 2026-11-23 13:29 UTC, succeeding genesis session_017WiGzHC3CvjTNZqCuxa8Ex, which handed off ~13:30 UTC, context long)
- **Orchestrator:** session_017WiGzGp8auJceLEAAh9Aqx (handed off 2026-11-23 at 058772f; the owner starts the next)
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

## Open (0)

*(empty)*

## Parked by you (0)

Asked again only when the owner raises the thing; each headline quotes
their parking.

*(empty)*
