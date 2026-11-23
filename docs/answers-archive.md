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

- Vision · The long-term direction (deploy target) → `docs/vision.md` "The long-term direction", faf2a3f; acted on by orchestrator 2026-11-23: the deploy target is filled as Railway in every doc that named the placeholder; the address is recorded in `CLAUDE.md`, `docs/git-workflow.md` and `docs/verifying-and-finishing.md`; checked that sessions can load it.
- Q-001 · Can the Drive library's "CONFIRMED" lines count as your own words? → `docs/vision.md` "Where the detail lives", 2dd135e; acted on by orchestrator 2026-11-23: `CLAUDE.md` "What Irreverents is" and `docs/working-on-the-project.md` §1 now say the library is the owner speaking and its PROPOSED / EXAMPLE / OPEN labels are literal.
- Q-002 · Who is Irreverents for, and what is it for you? → `docs/vision.md` "Who this is for, and why", 2dd135e; acted on by orchestrator 2026-11-23: "for friends, not strangers" is a tie-breaker in `CLAUDE.md`; `docs/understanding-the-project.md` §1 written from it.
- Q-004 · What does it run on, and how is it played? → `docs/vision.md` "Who this is for, and why", 2dd135e; acted on by orchestrator 2026-11-23: plan Step 1 requires touch on a phone and keyboard on a computer, in a browser; the engine choice (a plain TypeScript simulation and canvas, no off-the-shelf engine) is recorded in `docs/plan/step-1.md` as the orchestrator's provisional call.
- Vision · "Where the detail lives", "Who this is for, and why", "What “working” looks like", "The long-term direction", "The measure", "Principles that decide most questions", "Frontiers", "Still open" → `docs/vision.md`, 2dd135e; acted on by orchestrator 2026-11-23: filled the placeholders in `CLAUDE.md`, `docs/git-workflow.md`, `docs/sop.md`, `docs/verifying-and-finishing.md`, `docs/understanding-the-project.md`, `docs/working-on-the-project.md`, `docs/plan.md` and `docs/measures.md`; plan drafted in this first run.
- Vision · The measure (first deadline) → `docs/vision.md` "The measure", 93e2989; acted on by orchestrator 2026-11-23: `docs/current-directive.md` written around the owner's morning, with a working deadline of 11:00 UTC and `main` taking only finished work from 10:00 UTC.
- Q-009 · Is the Railway service connected to this repo, so a push to `main` goes live? → `docs/vision.md` "The measure", a496e91; acted on by orchestrator 2026-11-23: measured it (a probe pushed at 03:55:37 UTC was live at 03:56:14 UTC; `docs/plan/step-1.md` "Measure"); `CLAUDE.md`, `docs/git-workflow.md`, `docs/sop.md` and `docs/verifying-and-finishing.md` now say a push to `main` is the deploy, with a pre-push gate.
- Q-007 · Which first slice? → `docs/vision.md` "The measure", a496e91; acted on by orchestrator 2026-11-23: chose it; the order is in `docs/current-directive.md` and the steps in `docs/plan.md`.
- Q-003 · How should we measure that the game is moving the right way? → `docs/vision.md` "The measure", a496e91; acted on by orchestrator 2026-11-23: `docs/plan.md`'s measure table and `docs/measures.md` M1–M3 (live, together, vision playable); two-player online play is plan Step 1, not a later step.
- Vision · Asset requests through Drive (ChatGPT makes assets) → `docs/mechanisms/asset-requests.md` "What it is", 312d81a; acted on by orchestrator 2026-11-23: plan Step 1 builds at the resolution and grid the ordered art assumes (320×180, 16 px) and so that sprite sheets and tile atlases drop in as data; the step files and `docs/current-directive.md` send asset needs to Vision Partner as coordinator; D-093 (iPhone first) and D-096 (use by default) are tie-breakers in `CLAUDE.md`.
- Vision · Music and sound (new frontier) → `docs/audio-design.md` "Where this comes from", 2a2bd84; acted on by orchestrator 2026-11-23: plan Step 8 ("What you see and hear") owns sound, cites `docs/audio-design.md` as its direction, and starts from browser-synthesised placeholders until the ordered sound packs land.
