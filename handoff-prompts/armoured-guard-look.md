# The armoured guard looks like an armoured guard: his own cut from the owner's enemy sheet, and a first look at him on a phone

**Landed so far:** 3d4ff70 (the cut, the `armoured-look` fact, the shots; live). The "Also" is written up, not fixed (netcode): `docs/plan/step-8.md`, "The armoured guard's look", last bullet.

Brief for one builder, one push (a second only for the shots listed
under "Also"). Written 2026-11-24 19:00 UTC by the orchestrator
(`session_017WiGzHY5UZsWTLCH8cLm8M`). Read first:
`docs/mechanisms/art-pipeline.md` (all: how a sheet is cut and what
`tools/art/` regenerates; a hand edit to a generated sprite file is
wiped), `docs/mechanisms/asset-requests.md` ("Listed, not mirrored"),
`docs/git-workflow.md` ("Files git hides": the source sheet is over
150 KB and hidden in your clone; fetch it as that section says, and
never commit a hidden file as deleted), `docs/plan/step-4.md` (grep
"armoured": lines near 560 and 733, what he is and why he has no
picture), `docs/plan/step-8.md` ("Round 3", the cast lane's rules: the
heroes' round, big-faced family; legible at phone size).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after the push, with shot paths.
**Notes:** `docs/plan/step-8.md`, a section "The armoured guard's look".

## The task, and the measure

The owner, ~01:05 UTC 2026-11-24, first-hand: "Alarms should spawn more
enemies of increasing strength that come in from the sides". The castle
street's top alarm row now brings an armoured guard (178e243:
`content/characters/armoured-guard.json`, `content/npcs/armoured-guard.json`,
`content/dispatch/castle-street.json`): slower, heavier, nearly twice the
beating, a harder swing. But `content/sprites/armoured-guard.json` draws
him with the plain guard's sheet, so on a phone a player cannot tell the
strongest man in the row from the rest, and nobody has ever taken a shot
of him. Moves no row of the plan's table; `docs/vision-gaps.md` rows 7
and 9 name it.

## Decided

- **The source is approved art, not a new request** (Vision Partner,
  18:50 UTC): the owner's P08 sheet,
  `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p08-additional-townsfolk-enemies-building-blocks-biomes-source/chibi-enemy-animation-sprite-atlas.png`,
  row 4. Cut him the way the other P08 enemies were cut (find the
  cut list that made `content/sprites/heavy-fighter.json` or
  `outpost-fighter.json` and add his rows to it; do not hand-edit the
  generated file).
- New art is used at once and marked `DRAFT:` (D-096). His id
  `armoured-guard` does not change. If row 4 lacks a pose the game draws
  (walk, the swing's wind-up and hit, knocked flat, getting up, carried),
  reuse his nearest frame for it and list what is missing in your notes;
  do not borrow the plain guard's frame for a pose, or he flickers
  between two men.
- He must read at 390x664 and 750x340 as bigger and heavier than the
  guards beside him without any text. If the sheet's man is the same
  size as a guard, say so in the notes; do not scale pixels unevenly.

## Do

1. Cut him; build; `npm run check`. Before-and-after shots of the
   street's top row arriving (the row with him in the middle), at
   844x390, 750x340 and 390x664, in `docs/plan/step-8-shots/armoured-guard/`
   (`E2E_SHOTS=1` only for your own shots, or the shot tool the cast lane
   used; a plain e2e writes nothing under `docs/`). The town's rows were
   never shot upright at all: your 390x664 shots are the first.
2. One e2e fact or scenario-side check that the page draws him with his
   own look and not the guard's (a control: point his sprite back at the
   guard's and watch it fail).

**Also, only if budget remains, as a second push:** a struck HERO shows
nothing (`docs/plan/step-24.md`, "Look at slice 1b's retaken shots":
`hero-struck-*` look exactly like standing still). Say in your notes
what the page draws today when a hero takes a hit (a flash? a recoil
frame? nothing?) with the file and line; if it is a missing frame choice
in the heroes' cut lists or a one-line draw hook, fix it and shoot it;
if it needs sim or netcode, write it up and stop.

## Yours and not yours

Yours: `tools/art/**` cut lists for `armoured-guard`,
`content/sprites/armoured-guard.json` and its generated image, a new
file under `scripts/e2e/` plus its one call line in `scripts/e2e.ts`
(the e2e-reds brief owns fixes there: add only your line, rebase before
you push). Not yours: every other character's sprites, `content/dispatch/**`,
`content/tuning.json`, `src/sim/**`, `src/client/draw/hud.ts`
(`plate-clear-of-bodies.md`), backdrops (`biome-backgrounds.md`),
`content/placements/**`.

## Done

Build and check green; your fact green and its control red; one full
`npm run e2e` (the suite has an intermittent red in about half of
today's full runs: `hearts-game-over`, `start-link-back`,
`plates-friend-held`, `door-use`, `outpost-break`, `start-continue-gone`,
`quarry-depot-in` have each gone red once and pass alone; one of those
red once is not yours: re-run it alone and say so; rebase once before
the push and do not re-run the full e2e after every rebase); pushed to
`main`, live (`npm run check:deployed`, `npm run check:live`; read
`/debug/errors` and `/healthz` first). A deploy that seems stuck with
`/healthz` healthy on an older commit: never revert, wait up to fifteen
minutes pushing nothing (`docs/verifying-and-finishing.md`, "The
pre-push gate"). The orchestrator reviews by having the shots looked at.
Stop at about 300k tokens with "Landed so far" filled in.
