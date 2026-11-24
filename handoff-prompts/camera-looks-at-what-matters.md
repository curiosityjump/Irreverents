# Sideways on a phone, the camera shows what is about to hit you (Step 5 / Step 24)

Brief for one builder, small. Written 2026-11-24 09:20 UTC by the
orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:** `docs/plan/step-5.md`, a
"Camera" section.

## The task, and the measure

Two builders flagged the same thing. The Step 16 lead's phone walk
(b0a7d5e; `docs/plan/step-5.md`, "Carried here"): "the camera should look up
in tall rooms, so a ledge and a roof show on a sideways phone". The Step 24
builder at 27490b6: "Sideways, the camera keeps the floor, so from the
gallery floor you see only the landing cross, not him or the arc". The
thrower on the Hall gallery's balcony warns before every throw with a
raised arm and a dotted arc (`docs/plan/step-24.md`, an `INTENT:`), and on a
sideways iPhone, the owner's first screen (D-093), the warning is off the
top of the picture. Moves no row of the plan's table; it makes a telegraph
visible where the owner plays.

## Measured

Not measured by the orchestrator beyond the two quotes: your first job.
`grep -n camera src/client/render.ts` is where the picture's window is
chosen. Sideways sizes to use: 844x390 and 750x340; upright 390x664.

## Do

1. **Measure:** in the Hall gallery, sideways at both sizes, a hero on the
   floor inside the thrower's sight band: is the thrower drawn? The arc?
   The landing mark? The same for the quarry's tower climb and the depot's
   roof route (a ledge above a hero on the floor). Shots into
   `docs/plan/step-5-shots/camera/before/`.
2. **Decide and build** (`DRAFT:`, one `docs/decisions-log.md` entry, the
   rule as data in `content/tuning.json` or the room where it can be): the
   camera's window shifts to keep in view a thing that is aimed at the
   hero (a `ranged` wind-up and its arc first), and in a room taller than
   the screen it leads upward when the hero is climbing or looking up
   (stick up while standing, if that is free), easing, never snapping, and
   never moving the hero off-screen or under the touch controls. Whole
   pixels only: no blur.
3. **Prove:** an e2e fact by touch, sideways, that while the thrower winds
   up the page draws him and his arc inside the picture, with a control
   (the old camera) failing; after shots beside the before ones.

## Paths, traps, scope

Yours: the camera in `src/client/render.ts` and a new file beside it if it
grows; tuning; `scripts/e2e/` for the fact; the shots. Not yours:
`src/sim/` (the camera is the page's, never the simulation's: two players
must still share one world, each with their own view), any room's tiles,
the HUD (`session_017WiGzJNmuKNGA2yndGCP34` is changing the phone's
controls and plate tonight: message before touching layout), the forest
(Step 15) and the quarry (Step 22) beyond reading them. Trap: every e2e
fact that taps a drawn thing by its screen position moves when the camera
does; run the full `npm run e2e` and count reds before re-timing any, and a
red in another builder's fact goes to its owner with the list. Stop at
about 300k tokens with notes.

## Decided vs. open

Decided: a warning aimed at a hero is in the picture sideways. Open, yours:
the exact rule (`DRAFT:`). Nothing for the owner.

## Verify

Build, check, full `npm run e2e`, pushed to `main`,
`npm run check:deployed` and `npm run check:live`; before and after shots.
