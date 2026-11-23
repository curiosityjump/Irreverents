# Answers archive

**Archive.** Every owner answer, once acted on: one receipt line each,
newest at the bottom. The governing document holds the owner's quote; this
is only where it went. Read for history, never act on it.

Vision Partner and the orchestrator grep this file before asking anything
(`docs/questions-inbox.md`, step 2), so a question answered once is never
asked again.

## Format

One line per answer, appended by the orchestrator when it cuts the entry
from `docs/answers-outbox.md`:

```markdown
- Q-NNN · <title> → <file> "<section>", <commit>; acted on by orchestrator <date>: <what it did, or "none">.
```

A question found already answered elsewhere (never asked) gets the same
line, with "answered at <file:line>; not asked" in place of the action.

## Receipts
