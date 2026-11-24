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

**Landed so far (2026-11-24 10:55 UTC), second builder `session_017WiGzJNmuKNGA2yndGCP34`: the second pass, all seven items in one push (cc06a73; shots in `docs/plan/step-8-shots/hud/after2/`; notes in `docs/plan/step-8.md`, "Second pass").** A third look by a subagent (after against after2): pips fixed (a three-bar meter), the GAME OVER blob gone, the hint and GET IN in pixel lettering, no hint under STAGE CLEARED, no clipped sign, "Psst!" waits, hearts under each face with a divider. Verdict: "mostly readable without being told". **You are the third builder, a short pass; the two lists below are done except this, one push, before and after shots (`scripts/hud-shots.ts`, into `after3/`):**
1. The doorway glyph still reads as a letter: "nGO IN" (`after2/courtyard-go-in-750x340`, `after2/camp-doorway-390x664`). Use a glyph that cannot be read as text, or none.
2. GAME OVER: five hearts wrap 3+2 and look lumpy, and the faces on the plate are almost invisible under the card (`after2/hearts-game-over-750x340`). Shoot it at 844x390 and upright too.
3. Regressions of the second pass: the "Bandit Camp" sign moved down into the play area's sky (`after2/camp-doorway-844x390`): put it back where it does not cover play; the star (Switch) button is faint against the street's red roof (`after2/street-fight-844x390`): give it the backing the others have; the pips' unlit sockets are nearly invisible.
4. The title upright: the bottom third is still empty and the sound button sits half over the picture's corner (`after2/title-390x664`); sideways it is a bare glyph with no disc.
5. The sideways pill sits 2 to 6 CSS px off the bottom edge: show it clear of `env(safe-area-inset-bottom)` with a shot that simulates an inset.
6. The shots nobody has: a held hammer and spear on the plate, the town's whistle gauge or bell bar, a dimmed Switch with a full party, a lost heart in play, `defeat-hurt` (missing from `after2/`).
**Decided by the orchestrator:** the sideways action pictures stay at 40 px; `scripts/e2e/phone.ts`'s 3% paint pin is not raised (it protects the play area; the look measured the controls at about 4% of the sideways play area and about 9% with the plate). Stop at about 250k tokens with notes.

**Landed so far (2026-11-24 09:10 UTC), by `session_017WiGzHxAKbURW5YnQt6bDN`, which stopped at about 385k tokens:** push 0 (27 before shots, ce73c7d), items 1-4 and 6 with the e2e fact `hud-targets-*` and `scripts/hud-shots.ts` (8a9c8b6), item 5 the stars (d2cb96c). Read `docs/plan/step-8.md`, "Phone HUD". **A second look, by a subagent of the orchestrator over all 26 before and after pairs, found items 2, 5 and the GAME OVER lettering fixed and the rest partly. You are a fresh builder; what is left, one push each, a before and after shot each, re-shooting with `scripts/hud-shots.ts`:**
1. **Whose hearts are whose.** Friends' hearts are real hearts now, but only the street shots show a gap between friends; in the camp, the courtyard, stage-done, defeat-hurt and game-over they run as one unbroken row (`after/camp-wagon-get-in-390x664`). Each face's hearts must sit under that face in every room and size.
2. **The pips still read as balloons**: red round "!" drops behind a warning sign (`after/street-fight-partial-844x390`). Make an alert level look like an alert level, not a count of things you own (shape and colour unlike a heart; `DRAFT:`).
3. **GAME OVER:** a large pink heart blob covers the player's portrait and pokes past the plate's left edge (`after/hearts-game-over-844x390`). Find what it is (a heart-loss pop caught mid-play, or a draw fault) and fix it if it is a fault. That file and `defeat-hurt-844x390` are really 750x340 captures in both folders: shoot the real 844x390 and upright ones.
4. **Sideways the buttons look small**: drawn at about 30 CSS px on 52 px targets (`after/street-plain-750x340`, `after/courtyard-go-in-844x390`). Draw the art nearer its target's size where the play area allows; say what you measured about how much of the play area the controls then cover.
5. **Words in the game's lettering:** the "PLAYS EITHER WAY UP" hint and the "GET IN" pill are smooth sans text; the doorway glyph on "GO IN" reads as an "n". Sideways the pill nearly touches the bottom edge where an iPhone's home bar sits: keep it inside the safe area (`env(safe-area-inset-bottom)`).
6. **Leftovers:** the hint and its close button still show under STAGE CLEARED upright; the room's sign pokes out clipped beside the STAGE CLEARED card ("Our astrono…"); "Bandit Camp" plus the "Psst!" box still cover much of the play area together; the title upright leaves its bottom third empty and "New game" overlaps the art's bottom edge by a few pixels, and its sound button is nearly invisible sideways (`after/title-750x340`).
7. **Shots nobody has:** a held hammer and a held spear on the plate, the town's whistle gauge, a dimmed Switch with a full party, a row arriving with its banner, a lost heart in play.
Switch stays dimmed, not hidden (`switch-refused` needs the tap; `docs/plan/step-5.md`). A real star sprite is on Vision Partner's missing list: keep the stand-in.

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
