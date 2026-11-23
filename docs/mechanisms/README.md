# Mechanism index

**Standing.** Run per `docs/sop.md`.

Every mechanism in Irreverents gets exactly one line here, plus a full
writeup in a linked `docs/mechanisms/<topic>.md` file. **Read the linked file
before touching the mechanism it covers** — the one-liner tells you a thing
exists; the linked file tells you why it exists, what it interacts with, and
what broke last time.

This is the hub `CLAUDE.md` points at. It lives here rather than in
`CLAUDE.md` because it is *reference* — you need it when you are touching a
specific mechanism, not on every decision. `CLAUDE.md`'s budget is spent on
things that shape every decision instead.

## Adding to this file

One line per mechanism, in the group it belongs to (or a new group, if none
fit). The full writeup goes in that group's `docs/mechanisms/<topic>.md` —
never here. If you are tempted to write more than one line here, that prose
belongs in the doc file.

Skip routine additions that follow an existing pattern exactly, and anything
already self-evident from reading the code.

**What counts as a mechanism:** a field, flag, rule, convention or piece of
machinery whose *why* can't be recovered from the code — something a future
session could misread, break, or reinvent. If a deliberate design looks odd,
it also gets a line in `docs/deliberate-designs.md` and an `INTENT:` comment
at its code site.

**The format.** A group is a bold name followed by its writeup's path in
backticks; each line under it names the mechanism (in backticks, as it
appears in code), then a dash and what it does, in one sentence. A line may
end with where it was first used or which step added it.

```markdown
**<Group name>** (`docs/mechanisms/<topic>.md`)
- `someField` — what it does, in one sentence; first used by <where>.
- A convention with no single name — what it is, in one sentence (Step N).
```

**Keep the count honest.** If `CLAUDE.md` quotes how many mechanisms are
indexed, re-count from this file (a grep for lines starting `- ` under the
groups) whenever you add one — never update the number from memory.

---

## Index

**Design library** (`docs/mechanisms/design-library-sync.md`)
- `tools/drive_sync.py` — mirrors the owner's Google Drive design library into `docs/design-library/` and reports what changed by hash (first import 2026-11-23).
