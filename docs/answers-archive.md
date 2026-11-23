# Answers archive

**Archive.** Every owner answer, once acted on: one receipt line each,
newest at the bottom. The governing document holds the owner's quote; this
is only where it went. Read for history, never act on it.

**Receipts are retired from 2026-11-23** (the owner, ~15:20 UTC:
*"Implement the structural changes you recommended for efficiency"*). Git
log is the record: the orchestrator deletes an outbox entry once acted on,
and that commit's message names what was done. Nothing is appended here
any more; the lines below stay as history, still worth grepping. `DRAFT:`

Vision Partner and the orchestrator grep this file before asking anything
(`docs/questions-inbox.md`, step 2). It covers answers up to 2026-11-23
~15:20 UTC; for later ones, grep `git log` for the outbox commits (and the
governing documents, which hold every answer).

## Format (historical)

Until 2026-11-23, one line per answer, appended by the orchestrator when
it cut the entry from `docs/answers-outbox.md`:

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
- Q-011 · Should the game remember things after it restarts? → Answered elsewhere, 2026-11-23, by `session_017WiGzFWfLir1ATiSP7c5E5`, written to `docs/plan/step-7.md` "What's decided": the owner added a Railway volume at `/data` (~04:19 UTC; live `/healthz` reported it mounted and writable at 04:24:17 UTC), i.e. option 2.
- Vision · The measure (second deadline: Amazing Mirror quality by tomorrow) → `docs/vision.md` "The measure", 8e984a3; acted on by orchestrator session_017WiGzHX8g2sXimNRnqp2oZ 2026-11-23: Step 8 ("What you see and hear") put first and running as nine lanes (`docs/plan/step-8.md`, "The look"), art drawn in the repository rather than waited for; game feel named second in `docs/current-directive.md`, ahead of new systems.
- Vision · Deploys while the owner isn't playing → this outbox entry (process), 98431b0; acted on by orchestrator session_017WiGzGp8auJceLEAAh9Aqx 2026-11-23 12:20 UTC: `docs/current-directive.md`'s hold on code pushes while players are in the world is lifted until the owner says they are playing again.
- Vision · Visual direction (the owner's 11:11 UTC "blocky" verdict) → `docs/vision.md` "Visual direction", 0fe93cf; acted on by orchestrator session_017WiGzGp8auJceLEAAh9Aqx 2026-11-23 13:38 UTC: nothing new, since `docs/plan/step-8.md` "The look" already carries the words and the original-designs rule, and round 2 starts from the P01 kit (128c239).
- Owner feedback · "a bunch of stuff I haven't seen yet" (levels, enemies, the cantina) → `docs/current-directive.md`, 944265f; acted on by orchestrator session_017WiGzGp8auJceLEAAh9Aqx 2026-11-23 14:25 UTC: Steps 11 (cantina) and 12 (outpost and chase) opened beside Step 8's look, one worker at a time each; Steps 3/14/15 (more rooms) after those show; logged in `docs/decisions-log.md`.
- Vision · Principles: "as much as possible into actually building the game" → `docs/vision.md` "Principles", 87f53c0; acted on by orchestrator session_017WiGzGp8auJceLEAAh9Aqx 2026-11-23 14:35 UTC: `docs/lead-session.md` now defaults to one reused worker per step and minimal paperwork (decisions-log entry); Steps 11–12 leads told; Step 8 round 2 runs on few workers.
- Vision · Principles: "looking at the game, looking at the vision, seeing the gaps, and closing them" → `docs/vision.md` "Principles", 0632292; acted on by orchestrator session_017WiGzGp8auJceLEAAh9Aqx 2026-11-23 14:45 UTC: first vision-gap audit written to `docs/vision-gaps.md` (7454fd9); `docs/current-directive.md` makes refreshing it routine (whenever a step closes or a round lands) and opens steps from its top rows.
- Q-008 · How do you leave the endless cantina brawl? → `docs/vision.md`, ba928f5; acted on by orchestrator 2026-11-23 14:45 UTC: routed to Step 11's lead `session_017WiGzFy3MD6ecvM7QMvQGd` (the bell in the middle of the cantina stops fights).
- Q-013 · A friend takes the hero you need to get back out → `docs/plan-archive.md` ("Step 2") "What's decided", ba928f5; acted on by orchestrator 2026-11-23 14:45 UTC: recorded where it governs; Step 2's lead gets it with its next brief.
- Q-012 · Railway "Watch Paths" → `docs/mechanisms/deploy.md` "Traps", ba928f5; no action.
- Q-010 · Is this the right build order? → `docs/current-directive.md`, ba928f5; acted on by orchestrator 2026-11-23 14:45 UTC: directive marked approved in that form; order kept by `docs/vision-gaps.md`.
- Q-005 · Stale rules in Drive docs → `docs/vision.md` "Principles", ba928f5; no action (later decisions trump earlier ones).
- Q-006 · "Current" art boards that fail the art gate → `docs/vision.md` "Visual direction", ba928f5; acted on by orchestrator 2026-11-23 14:45 UTC: `docs/plan/step-8.md` "Open with the owner" now carries the answer (judge usability from ChatGPT's asset-library docs).
