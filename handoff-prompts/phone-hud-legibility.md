# What a phone shows over the game: make it readable by thumb and eye (Step 8 / Step 5)

Brief for one builder, small pushes. Written 2026-11-24 07:50 UTC by the
orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`) from a look pass over 25
of tonight's screenshots: `docs/plan/step-8.md`, "Look pass, 2026-11-24".
Read that section, `docs/plan/step-5.md` "Buttons", and
`docs/mechanisms/README.md`'s lines on the touch controls and the party
plate, first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the before and
after screenshot paths. **Notes:** `docs/plan/step-8.md`, "Phone HUD".

## The task, and the measure

The owner: "iPhone first" (D-093: a few context-sensitive controls, legible
pixels); ~00:20 UTC on 2026-11-24, "Can we get better player buttons?"; the
look is first (`docs/plan/step-8.md`). Tonight hearts, pips, banners, a
weapon slot, labels and a results card all landed on the same small screen,
each from a different builder, and nobody looked at them together. Moves no
row of the plan's table; whether it looks right is the owner's to judge, and
your job is that nothing is unreadable, clipped or mistaken for something
else.

## First: look at live, not at old shots

The pass read stored screenshots; some predate later pushes. **Push 0 (no
code): take your own, on a build of today's `main`**, phone-sized, upright
390x664 and sideways 844x390 and 750x340, by touch: the castle street in a
fight with hearts lost and pips up; the Bandit Camp with a row arriving and
its banner, beside the wagon with GET IN showing; the GAME OVER card; a
held hammer and spear; STAGE CLEARED mid-count and done; the title. Put
them in `docs/plan/step-8-shots/hud/before/` and strike from the pass's
list whatever today's game no longer shows (two button looks at once is
probably old shots). Report the list that remains before fixing anything.

## Then fix, in this order, one push each, a before and after shot each

1. **Thumbs:** no touch target under 44 CSS px on any of the three sizes;
   sideways at 750x340 the icons were about 20 px. Count the buttons shown
   at once in each state and say the number; hide what cannot act now
   rather than greying it where the layout allows (the buttons push greys
   Use and Switch: keep that rule's intent, an `INTENT:`-marked choice in
   `docs/plan/step-5.md`, and ask the orchestrator before reversing it).
2. **Words on buttons:** "TAKE", "GET IN", "GO IN" on a button that looks
   pressable, never over a greyed hand; no bare "^".
3. **Hearts and pips:** a friend's hearts readable at phone size (not
   "vvv"); the town's pips not mistakable for hearts (shape or place, your
   choice, `DRAFT:`).
4. **Overlays:** at most one banner over the play area at a time (queue
   them); the place label without its empty second line; nothing clipped.
5. **STAGE CLEARED:** the rating reads as earned and unearned at a glance
   (a filled and an empty shape, not a dimmed one), nothing scaling over
   its neighbour; agree with Step 22's lead
   (`session_017WiGzF7NsB3KTwXkWUXE63`) by message before touching its files.
6. **The title upright and the menu icon's backing.**
The bomb's burst (size, a shake) is not in this brief: it is feel, noted
for Step 23.

## Paths, traps, scope

Yours: `src/client/` drawing and layout of the touch controls, the party
plate, banners and labels; `public/` only for an approved-sheet glyph
already cut; the e2e facts that measure sizes (add one: every touch target
at least 44 px on the three sizes). Not yours: `src/sim/`, `content/`
beyond tuning for HUD sizes, any builder's scenario. Use only art already
cut from the owner's approved sheets (`docs/plan/step-5.md`, "Buttons");
a missing glyph goes to Vision Partner (`docs/mechanisms/asset-requests.md`),
and you ship a `DRAFT:` stand-in meanwhile. Never a rejected style; never
blur: integer pixel scaling only. Every action still works by touch with no
hover. Stop at about 300k tokens with notes.

## Decided vs. open

Decided: above. Open: nothing for the owner; each choice `DRAFT:` with one
`docs/decisions-log.md` entry for the lot.

## Verify

Build, check, `npm run e2e` (the new size fact with a control), pushed to
`main`, `npm run check:deployed`; before and after shots in the repo.
