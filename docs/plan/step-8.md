# Step 8 — What you see and hear

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23, to Vision Partner, first-hand** (`docs/mechanisms/asset-requests.md`):
> Ok, chatgpt is setting up the google drive so you can request assets, it will see those requests and put the requested assets into the drive, and so on. I want yoy to take advantage of this.

**Owner (Drive, doc 00), via `docs/vision.md`:**
> Visual priority per owner: achieve Kirby & the Amazing Mirror's restraint and legibility, not merely its colorfulness.

**Owner (Drive, doc 11, D-096):**
> All new creative assets, design proposals and prototype implementation decisions are APPROVED FOR IMMEDIATE USE BY DEFAULT. Claude and other builders should implement first and refine/replace later.

**Owner, 2026-11-23 ~11:11 UTC (06:11 Eastern), to the orchestrator, first-hand, with a screenshot of the castle street on their iPhone held upright (plain rectangles for every character, flat grey platforms, the game a small strip at the top of the screen):**
> It all looks looks like absolute blocky shit.
> Compare to kirby and the amazing mirror and don't stop working on it until it looks similar to that. There are assets provided and you have the ability to get more.

**Owner, 2026-11-23 ~11:30 UTC, to the orchestrator, first-hand:**
> It should play well in portrait too, not just landscape. Looks awful in both right now
> Ignore the usage limits. Use opus instead of fable if needed. We have quite a bit left before we run out of opus

So the phone held upright is a first-class way to play, not a fallback
with a hint to turn it.

This reorders the step: the look comes first, now, ahead of everything
else in the plan. See "The look, from 2026-11-23 11:11 UTC" below.

Art and sound are being made through the night and land in the library a
batch at a time. The other steps build with plain shapes and never wait;
somebody has to put the real pictures and sounds in as they arrive, and
make sure the game reads clearly on a phone either way.

## Goal

The game looks and sounds like something, and is easy to read on an
iPhone: each kind of character and person is recognisable at a glance,
a person's mood shows without words, hits land with a sound, and when a
sprite sheet, tile atlas or sound pack arrives it is in the live game
within the hour.

## What's decided

- **Assets are data.** A picture or sound is wired in by an entry in the
  game's own asset list (what it is for, which file, frames, sizes), not
  by code. Until an asset exists, the plain shape stays; nothing breaks
  when one is missing.
- **The game keeps its own copy** of what it uses, in its own assets
  folder. `docs/design-library/` is the reference mirror, never the
  runtime (`docs/mechanisms/asset-requests.md`, "Collect").
- **Get deliveries by syncing, ask through Vision Partner.** Any session
  may run `python3 -I tools/drive_sync.py` to fetch what has landed. A
  new need goes to Vision Partner (same doc, "Who files them"), never
  straight to Drive. Six requests are already in flight there: read the
  table before asking for anything.
- **Use by default, but not everything delivered is game-ready** (D-096:
  "'Ready to try' does not certify a file as a production-grade tile,
  sprite"). A flattened concept image is a look reference, not an atlas.
  Use what fits the 320×180, 16 px grid, 32×32-cell contract; send back
  what does not as a revision request.
- **Restraint and legibility over colour** (the owner's visual priority;
  the style lock, doc 14). Quiet backgrounds, clear platform edges,
  characters that stand out.
- **Nothing copied from Kirby or any other game's characters** (doc 32's
  art gate; Q-006).
- **Sound is in scope tonight** (the owner, 2026-11-23: "I think you
  can figure out what the music and sound effects should be like from
  what's in there though. Do it."). `docs/audio-design.md` is the
  direction: Vision Partner's reading of the library, which the owner
  delegated and will judge by ear. Start with sounds synthesised in the
  browser as placeholders and swap in the ordered sound packs (A01-01
  effects, A02-01 layered music) when they land.
- **Sound stays silent until the first tap** (iPhone), comes back after
  the phone has slept, has a mute, and never blocks play if it fails to
  load.
- **Mood without words:** each of the three NPC moods has a mark a
  player reads at phone size (Step 4 owns the moods; this step owns how
  they look and sound).

## What's open (the lead's to measure and decide)

- Read `docs/audio-design.md` before making any sound.
- Read the style lock and art plan first:
  `docs/design-library/03-visual-direction-and-assets/00-asset-production-plan-and-style-lock/`
  (docs 13 and 14), doc 10 in the folder above it, and the asset protocol
  `docs/design-library/06-asset-collaboration-claude-chatgpt/00-start-here-claude-chatgpt-asset-request-protocol.md`.
- What to ask for next, once the first deliveries show what ChatGPT can
  actually produce at this pixel scale.

## Feedback signal

1. `npm run check` validates the asset list: every entry's file exists,
   sizes and frame counts match the file, every entry is marked
   provisional with where it came from (control: an entry pointing at a
   missing file fails).
2. `npm run e2e` at iPhone size: one person drawn in each of the three
   moods differs from the other two by at least a stated number of
   pixels (control: with the mood marks switched off, it fails); nothing
   the game marks as important is under a touch control. (Whether each
   kind of character can be told apart at a glance is read off the
   screenshots by you, rung 5, and judged by the owner; it is not this
   signal.)
3. A delivered sprite sheet replaces a plain shape by a data change only
   (`git show --stat` on that commit lists the asset files and the asset
   list, no code).
4. Sound: after one tap the page reports its sounds loaded and playing;
   with sound files missing the game still runs.

## Stopping condition

This step does not close on a finish line; it closes at the 10:00 UTC
cut-off in `docs/current-directive.md` with whatever has arrived wired in
and verified, and a list of what is still plain shapes.

## Owns

The game's asset list and assets folder, how things are drawn beyond
plain shapes, mood marks, sound; exact paths as `docs/architecture.md`
assigns them. Opens when Step 1 closes.

## Taste, for the owner in the morning

All of it: whether each asset is good enough to stay, the look at phone
size, the sounds. List what was used and what was sent back.

## The look, from 2026-11-23 11:11 UTC

Read with the owner's words at the top of this file.

- **The bar** is the owner's approved direction
  (`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/pixel-aesthetic-reference-approved-direction.png`)
  and, at the size the game is really drawn, the two S00-01 phone
  previews in `s00-01-gameplay-references-use-now-revise-later/`
  (320×180): textured ground with grass on top, a sky with depth behind
  it, round expressive characters with dark outlines and shading, props
  that read as things. Plain rectangles anywhere a player looks are a
  failure of this step.
- **Similar to, not copied from.** The owner's own art gate (doc 32) and
  this step's "What's decided" stand: no character, sprite, tile or
  screen of Kirby's or any other game's is copied or traced. The likeness
  is in the craft (palette, outlines, shading, roundness, readable
  silhouettes, lively animation), on original designs.
- `DRAFT:` **Art is drawn here, in code, until the asset desk delivers.**
  ChatGPT's desk has delivered nothing since about 04:15 UTC and the
  heroes it did deliver were rejected by the owner as "crude near-identical
  geometric box figures". So the pictures are made by small drawing
  programs kept in the repository (`tools/art/`), which write the image
  files the game uses. Every one is a stand-in wired in as data: a
  delivered sheet replaces it by changing a file, not code. The desk's
  requests stay open and Vision Partner is asked for more
  (`docs/questions-inbox.md`, "Asset need").
- `DRAFT:` **Who runs it.** The orchestrator leads this step itself:
  `session_017WiGzHX8g2sXimNRnqp2oZ` until its Fable limit stopped it at 11:58 UTC, then
  `session_017WiGzGp8auJceLEAAh9Aqx` (pickup at be15324). Round 1 is nine lanes building to one contract
  (`docs/mechanisms/art-pipeline.md`) at the same time, each with its own
  paths: foundation and heroes as agents on the orchestrator's machine
  (it runs only two at once: 4 processors), and cast, tiles, props, world,
  actors, shell and sound as worker sessions, one brief each
  (`handoff-prompts/look-<lane>.md`). Each lane pushes itself to `main`
  when green, so the look arrives piece by piece. Art lanes run on the
  session's own model; the four code lanes on Opus, to spare the nearly
  spent weekly allowance (the owner's words above). Each lane leaves a
  notes file (named in its brief) that the orchestrator reads and files.
- **P01 Ruins Starter Kit (delivered 2026-11-23 ~13:25 UTC by the asset
  desk, synced at 2882af1):** `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p01-ruins-starter-kit-playable-prototype/p01-complete/`.
  Two original 48×48 hero strips (scout, rogue; seven poses, no polished
  run loop), 12 props, 8 terrain prefabs (not a 16 px autotile set), 4
  effects, an atlas with a manifest of exact source rectangles and foot
  pivots, and 320×180 previews. It is bright, outlined, shaded and round:
  closer to the bar than anything drawn in code so far. It arrived after
  round 1's lanes started, so they were not redirected to it mid-flight
  (a brief changed under a running worker costs a second pass,
  `docs/process-observations.md`). `DRAFT:` **Round 2 starts here:** where
  a P01 prop, terrain piece or effect beats the code-drawn stand-in, it
  replaces it as data (the manifest gives the rectangles). The 48 px heroes
  are a scale question against the 32 px cells and 18×30 boxes, the round-2
  reviewer's to weigh. Its readme asks for a 1–5 rating per category; the
  round-2 review answers that back to the desk through Vision Partner.
- **Feedback signal for the look:** screenshots of the real game at
  iPhone size (sideways and upright), put beside the references and read
  by a fresh reviewer each round who lists the largest remaining gaps;
  the round after fixes those. `npm run build`, `npm run check` and
  `npm run e2e` stay green on every push. Whether it finally looks right
  is the owner's, by looking.
- **Stopping condition:** the owner says it looks right, or a round's
  fresh reviewer finds no rectangle or flat fill left where a player
  looks and no gap it would call large. Not a clock.

### Round 2 (2026-11-23)

**The review.** Three fresh reviewers looked at the live game after round
1 (all nine lanes on `main`, last cae8f46), each through one lens
(craft against the bar, the phone in the hand, the cast), from
screenshots of the six map rooms at 750×340, 844×390 with notch insets,
667×375 and 390×664 (upright), plus staged moments (a punch, a throw, a carry, a
hide, a rage). The screenshots are in the orchestrator's scratch space,
not the repository; the briefs describe each one in words. Merged and
ranked by the orchestrator (size first, then how many lenses saw it,
then whether a player meets it in the first ten seconds); the top gaps
were spot-checked by eye on the cited screenshots and by measuring the
files (the grappler's main fill `#8179b8` is `castle.png`'s commonest
colour; the infiltrator's idle is drawn 21×20; `castle-mid.png` and
`town-mid.png` are 71% and 77% near-white).

**Ranked gaps** (lenses that saw it; lane that closes it):

1. Sideways the game is a box between two navy bars (66% of the width
   captured, about 58% calculated for a real iPhone 14 in Safari), and it
   frames 13–14 tiles tall against the bar's 11.25, so everyone is small
   (phone; frame).
2. Outdoor rooms are padded with flat wall above and below the room:
   48–56% of the courtyard picture, 20–31% of the castle street's (craft,
   phone; frame and ground).
3. The grappler, every player's first hero, is painted in the castle
   wall's own lilac, has a 5 px face, no neck, and a crest that reads as a
   second crown beside the king (all three; heroes).
4. Ground and walls are flat two-tone wallpaper (18–25 colours a sheet, no
   bevel, light or ink edge); the street and the roofs are one grey course
   (craft; ground).
5. The infiltrator is a 20-px horizontal green smear that vanishes beside
   a crate; its `down` is a rotated lump (all three; heroes).
6. Hits do not look like hits: a pale sword arc over a punch, cream puffs,
   no star seen in six frames; the wind-up draws as standing still
   (all three, and Step 2's flag; props and actors).
7. Speech is the browser's monospace smeared by scaling (Courier on an
   iPhone); the king's ribbon cuts off his crown (all three; props and
   actors).
8. Backdrops are bleached and nothing is ever in front of the action: no
   depth (craft; ground and frame).
9. Interiors are one evenly lit lilac; torches have no glow; the
   undercroft is a near-black void (craft; ground, props, frame).
10. Carrying does not read as a hoist: the load sits on the grappler's
    head behind his crest, fists spread wide (cast; heroes and actors).
11. Where the controls already sit over the picture they cover people's
    feet, doors and props on the floor line (phone; frame; the condition
    for fixing 1).
12. Ledges are 2–4 px lines that read like underlines or sticks (craft;
    ground).
13. Enraged people are washed pink over their own red-faced mood-3 frames
    (craft, cast; actors).
14. A hidden infiltrator is drawn whole in front of the curtain (craft,
    cast; actors and props).
15. The villain is small and dark, no taller than a guard (cast; heroes,
    second priority).

Round 1's own flags, checked: the bars, the cobbles-and-roofs course, the
ribbon on the crown and the infiltrator's `down` are confirmed. Refuted:
upright, the far and mid layers *do* show; the fill crowds them. Partly
refuted: the villain reads as a dark silhouette on the pale street (the
risk is dark rooms and his small face); "the punch reaches 12 px past
its box" split the reviewers (one saw the arc on the forearm, one on the
fist): the fault is a blade arc on a punch. Not checked by anyone: crack
overlays on dark walls (handed to props to look at). The states round 1
never saw (held, carry, hide, down, rage) have now been seen and read
wrong; mood 2 reads fine. **No scripted check proves the three moods
differ on screen** (`grep -i mood scripts/e2e.ts scripts/e2e/` finds
nothing), although "Checks" in `docs/mechanisms/art-pipeline.md` says
`npm run e2e` does: owed by whoever owns e2e.

**Hero set, `DRAFT:`** (`docs/decisions-log.md`, 2026-11-23, "The heroes
you liked stay"): keep main's set (59de45d), which follows the owner's
liked concept; redraw the grappler and the infiltrator with the
proportions of the alternative set on `claude/gallant-keller-1gpm2y`
(c7c9555): its faces, not its characters. All three reviewers reached the
same verdict independently. The grappler moves off the castle ramp to a
darker, bluer slate and his crest becomes swept-back orange spikes; the
infiltrator stands upright at about 22 px over its unchanged 10×12 box.

**P01 Ruins Starter Kit, `DRAFT:`** (`docs/decisions-log.md`, 2026-11-23,
"From the art desk's ruins kit"): nothing goes in raw (each piece has 363
to 2,975 colours and a light edge fringe; alpha is already hard). One
import, `tools/art/props/import_p01.py`, re-colours to the master palette
and re-inks the outline. In: `impact_star` (base of `fx-hit`, the biggest
single gain), `spark_slash` (`fx-slash`), `big_barrel`, `small_barrel`,
`lantern_post` (with a glow), `ruin_arch` and `broken_column` (courtyard,
far layer only). Out: `arrow_sign`, `wooden_ladder`, `red_banner`,
`stone_pillar`, `treasure_chest`, `wooden_crate`. Reference only: the
terrain prefabs (not on the 16 px grid; `stone_wall`, `stone_grass_wall`,
`grass_full` and `wooden_bridge` are the model for the ground lane's
redraw) and the scout and rogue (not our party; a size and face
proportion target: about 36 px, head about 60%). **Ratings back to the
desk** (its readme asks for 1–5; the orchestrator hands these to Vision
Partner): hero look 3, animation 2, props 4, terrain readability 3 (the
right look, not on the 16 px grid), effects 4, overall match to the
reference 4. What would make the next kit drop in: a fixed palette with
hard edges instead of painted colour, and ground as a 16 px autotile set.

**Lanes** (five; paths in `docs/mechanisms/art-pipeline.md`, "Who is
building round 2", where the contract's round-2 fields are also defined):

| Lane | Brief | Closes |
|---|---|---|
| heroes (art) | `handoff-prompts/look2-heroes.md` | 3, 5, 10 (frames and `carryAt`), 15 |
| ground (art) | `handoff-prompts/look2-ground.md` | 2 (pictures and data), 4, 8, 9 (walls), 12 |
| props (art) | `handoff-prompts/look2-props.md` | 6 (pictures), 7 (font), 9 (glows), 14 (folds), the P01 import |
| frame (code) | `handoff-prompts/look2-frame.md` | 1, 2 (painting and camera), 8 and 9 (front layer, glow pass), 11 |
| actors (code) | `handoff-prompts/look2-actors.md` | 6, 7, 10 (drawing), 13, 14 |

The two code lanes push their validators first, because the art lanes
write fields the check rejects until then. Each lane pushes at most twice
and reports "look2 lane <lane> done at <commit>" to the orchestrator.
When frame lands, the orchestrator updates `docs/plan/step-5.md`'s
"Controls never hide the game" to the decided layout, and folds each
lane's notes as in round 1. Round 3 starts with a fresh review of the
live game in the same way.

### Round 3 (2026-11-23)

**The review.** Four fresh lenses (craft against the bar, the phone in
the hand, the cast, closure of round 2) looked at the live game after
round 2 (all five lanes on `main`, last ea44201), plus a code review of
the actors lane's diff. Screenshots: every map room and the new places
(the cantina, the Bandit Camp, the six quarry rooms) at 750×340 sideways,
667×375 and 390×664 upright, and staged moments (a punch, a grab, a
throw of a crate and of a friend, a carry, a hide, the three moods, the
alarm, the brawl), as stills and as filmstrips of every drawn frame. They
are in the orchestrator's scratch space, not the repository; the briefs
describe each in words. Every gap below survived at least one of two
adversarial skeptics; the top five were spot-checked by eye on the cited
screenshots. Two Drive syncs landed mid-round (1019aab: P03, P04, P05 and
doc 36; 0372804: P07, P08 and the P03 canon hero extraction) and are
folded in: **the three heroes are owner-locked to the P03 sheet** (doc 36,
*"We already have the playable characters. Remember these."*), so the
heroes are now judged against it, not against `heroes-v2`.

**Round 2's gaps, closed or not:**

1. Sideways bars: **closed** (fills the width; 7.5 pt bands left at 667×375, gap 12).
2. Flat padding above and below: **partly** (closed sideways; upright 22–41% flat sky, gap 6).
3. The grappler: **partly** (round 2's terms met, but off the canon and 1.75× his friends, gap 1).
4. Flat ground: **partly** (map rooms bevelled; quarry graybox, castle floor mass, cantina panels: gaps 2, 7, 10).
5. The infiltrator: **partly** (upright and readable, but spiky-haired, off the canon, gap 1).
6. Hits: **partly** (every frame reads; in motion the star lands about 0.4 s late, gap 4).
7. Text and the ribbon: **closed** (an off-screen speaker's bark points at the wrong body, gap 11).
8. Bleached backdrops, no depth: **partly** (closed sideways; upright sky and the quarry void remain, gaps 2, 6).
9. Even lilac interiors: **partly** (torches and the undercroft lit; throne room and gallery one ramp, gap 10).
10. The hoist: **partly** (fists up; the load floats, the throw flickers, gap 5).
11. Controls over feet: **closed**.
12. Underline ledges: **partly** (closed in the map rooms; back in the quarry, gap 2).
13. Pink rage wash: **closed** (no scripted mood check yet, gap 8).
14. Hiding: **partly** (the fold covers the body; the player-mark sits on the curtain, gap 9).
15. The villain's size: **closed** (44 px, top hat, cape).

**Ranked gaps** (size first, then lenses, then first-ten-seconds; lane
that closes it):

1. The three heroes are off the owner-locked P03 canon, and the grappler is 1.75× his friends (32×42 drawn over an 18×30 box) and taller than the street's arches (5; heroes).
2. The six quarry rooms are untouched graybox, walkable from the courtyard since 78c4959; their 1×1 hides have no look; the camp (ab0b34b) has the courtyard's ground but no camp (5; ground, props).
3. Five kinds of people are flat rectangles: brawler, skirmisher (the cantina's regulars), outpost fighter, lookout, horn post (5; cast, props for the horn).
4. On the hitter's own page the star lands about 0.4 s after the swing (burst 155–320 ms, nothing to 520 ms, star at 555 ms), and the grappler's art hides the body he hits (5; actors, with hurt frames from heroes and cast).
5. Grab, carry and throw stutter: no hoist, the load floats 2–4 px over the fists, the pose flips between carry, throw and punch for 0.44 s, the thrown friend teleports about 70 px and flies upright (4; actors, heroes).
6. Upright, short rooms sit under flat stepped sky with their top row (canopy, eave, the cantina's floor tiles) floating in it (4; ground).
7. The cantina reads as a storeroom of crates or a corridor, not a tavern (4; ground, props).
8. The town cast (guard, king, shopkeeper, villain) is a different, thin, small-faced family from the canon; knocked-out is a rotated plank; mood 3 lacks attack/hurt/air/held frames; no scripted mood check (4; cast, props for marks, actors for the check).
9. A hidden player's mark is drawn on the curtain on every page (3; actors).
10. Large flat masses: one-tone ground under the walk line, the castle halls' single lilac, flat mid layers, mottled P01 imports (3; ground, props).
11. Overlays read as debug boxes: the brawl strip, the alert circles, the bell bar, off-screen barks pointing at the wrong body (2; props, actors).
12. Phone frame leftovers: 7.5 pt bands at 667×375, navy columns at the notch insets, controls over lower floors, the orientation hint back on every load (2; actors, after Step 17's `shell.ts` edit).
13. Code: on the own page, a throw while carrying plays the punch wind-up and drops the load on the crest (`sprites.ts:197` before `:200`) (3; actors).
14. Code: a carried body is drawn 12 px above its simulation spot but the mark, ribbon, bark and away dots use the simulation's y (2; actors).
15. Code: the Hall card's `·` and `…` draw as `?` in the pixel font (1; actors).
16. Code: the king's ribbon side fallback can clamp over him (1; actors).

**Dropped:** none (no gap was refuted by both skeptics).

**Contract additions, round 3** (`DRAFT:`; additive and optional; the
actors lane validates them in `src/content/kinds/sprites.ts` in its first
push, and the art lanes write them only once that is on `main`; the
orchestrator folds them into `docs/mechanisms/art-pipeline.md`):

- sprite state **`tumble`**: a launched or thrown body flying fast. Falls
  back to `held` → `hurt` → `air`; with no `tumble` frames the renderer
  turns the `hurt` frame in 90° steps.
- **`carryAtBy`**: `{ "<state>": { "x", "y" } }` for `carry`, `carryRun`,
  `throw`: that state's carry point, else `carryAt`.

**Lanes** (five; no two edit one file):

| Lane | Brief | Paths it alone may touch | Closes |
|---|---|---|---|
| heroes (art) | `handoff-prompts/look3-heroes.md` | `tools/art/heroes/`, `assets/sprites/heroes/`, `content/sprites/{grappler,infiltrator,flyer,hero}.json` | 1; 5 and 4 (frames, `carryAt`) |
| cast (art) | `handoff-prompts/look3-cast.md` | `tools/art/cast/`, `assets/sprites/cast/`, `content/sprites/` for every other character id | 3 (people), 8 (art); 4 and 5 (hurt, held, tumble, down) |
| ground (art) | `handoff-prompts/look3-ground.md` | `tools/art/tiles/`, `assets/tiles/`, `assets/backdrops/`, `content/atlases/`, `content/backdrops/` | 2 (ground), 6, 7 (ground), 10 (ground) |
| props (art) | `handoff-prompts/look3-props.md` | `tools/art/props/`, `assets/props/`, `assets/decor/`, `assets/fx/`, `assets/ui/` except `assets/ui/touch/`, `content/looks/`, `content/decor/` | 2 and 7 (decor, 1×1 hides), 3 (the horn), 5 (fx), 8 (marks), 10 (P01 import), 11 (HUD pictures) |
| actors (code) | `handoff-prompts/look3-actors.md` | `src/client/draw/{sprites,entities,npcs,impact,away,audience,fx,hall,alert,room}.ts`, `src/content/kinds/sprites.ts`, `scripts/e2e/look.ts` (new) and its one call in `scripts/e2e.ts`; `src/client/shell.ts` and `scripts/e2e/phone.ts` only after Step 17's shell edit is on `main` | 4, 5 (drawing), 9, 11 (drawing), 12, 13–16, the mood check |

Not any lane's: `src/client/main.ts`, `start.ts`, `index.html`,
`src/server/` (Step 17); `src/client/draw/cantina.ts` (Step 11) and
`outpost.ts` (Step 12); `content/rooms/`, `content/characters/`,
`content/outposts/`; `src/sim/`, `src/net/`. The art lanes start at once;
the actors lane's first push (the two validators) unblocks `tumble` and
`carryAtBy`. Each lane reports "look3 lane <lane> done at <commit>" and
commits its before/after shots under `docs/plan/step-8-shots/round3/<lane>/`.
Round 4 starts with a fresh review of the live game in the same way.

## Measure

## Briefs

Round 1 of the look (2026-11-23): `handoff-prompts/look-foundation.md`, `look-heroes.md`, `look-cast.md`, `look-tiles.md`, `look-props.md`, `look-world.md`, `look-actors.md`, `look-shell.md`, `look-sound.md`. Delete each when its lane is reviewed. Reviewed by re-running build and check, and deleted 13:35 UTC: foundation (61f7676), heroes (59de45d), world (82fe89b), actors (f92a447), shell (ac6509b), sound (fdcfec9). Then tiles (ebcf79e) and props (a4040f4), deleted 13:41 UTC, and cast (cae8f46), deleted 13:44 UTC. Round 1 is complete.

Round 2 of the look (2026-11-23, "Round 2" above): `handoff-prompts/look2-heroes.md`, `look2-ground.md`, `look2-props.md`, `look2-frame.md`, `look2-actors.md`. Delete each when its lane is reviewed. Workers: frame then actors `session_017WiGzGaGuR297NUCFSpVDU`; heroes `session_017WiGzFWVvNJrmXZ81rABuv`; ground then props `session_017WiGzHanC1tecHKJbjuyCf`. Reviewed (build and check re-run) and deleted: ground (ec49eb5), 15:01 UTC. Frame (06180df), props (992647b), heroes (d426771) and the villain (ea28af4) reviewed by build and check re-run (forwarder session_017WiGzGp8auJceLEAAh9Aqx, handoff addendum 501c223); briefs deleted 15:55 UTC by orchestrator session_017WiGzHhke4tkAThPgw6EXs. Actors (646f83d, ea44201) reviewed 16:20 UTC by orchestrator session_017WiGzHhke4tkAThPgw6EXs: build, check and e2e re-run green (197 ok, the known `t-switch-free` todo); diff read by an independent code reviewer against the brief: carryAt, rage, the no-render-freeze and fallback traps met; four bugs found (overlays of a carried body drawn at the simulation's y, 12 px off; a throw on the own page draws the punch wind-up; the Hall card's `·`/`…` drawn as `?`; the ribbon's side fallback can clamp over the king) and the hidden player's mark confirmed on every page: all carried into round 3's lanes. Brief deleted; builder archived (390k). **Round 2 is complete.**

Round 3 of the look (2026-11-23, "Round 3" above): `handoff-prompts/look3-heroes.md`, `look3-cast.md`, `look3-ground.md`, `look3-props.md`, `look3-actors.md`. Delete each when its lane is reviewed.

Round 3 builders (sent 17:06 UTC by orchestrator session_017WiGzHhke4tkAThPgw6EXs): heroes `session_017WiGzEv3ESfjNHm7u3Tk8v` (fresh, 17:10 UTC; round 2's heroes builder declined at 317k and was archived), cast `session_017WiGzFHN8SWsy5GnNkweMt`, ground `session_017WiGzHwFkUGGSmDqqnoSDY`, props `session_017WiGzJxBqVvizcghgHk5NG`, actors `session_017WiGzFsVDWWZc7nVHbv82A`.

Round 3 reviews (orchestrator session_017WiGzHhke4tkAThPgw6EXs): **heroes push 1 (1b2c1c6, the canon P03 three)** reviewed 17:58 UTC by re-running build, check and e2e at 904c3e9 on a quiet machine (261 ok, e2e ok) and by looking at its before/after shots; the same run covers actors push 1 (a59a302) and cast push 1 (d80a79d) for green, their looks not yet reviewed. Two earlier e2e runs failed only because a review workflow's `pkill` stopped the local server (`docs/mechanisms/orchestrator-workflows.md`, "Trap"). Props pushes 1-2 (040bc8f, notes b152a90) live 17:55 UTC, not yet re-run.

## Open with the owner

- Q-006 answered (2026-11-23, via Vision Partner): *"Many of the visuals are there to establish direction. Chat has been organizing the drive to be usable. Just review it's documentation."* The boards stay as direction. Judge what is usable from ChatGPT's own asset-library docs (`docs/design-library/asset-library-start-here-claude.md` and `06-asset-collaboration-claude-chatgpt/`), not from the boards. Later decisions trump earlier ones (Q-005).

## Handoff notes

## Carried here by the orchestrator, 2026-11-24 (from the Step 16 lead)

- A jump cue at the quarry tower's climb (phone walk at b0a7d5e).
- The depot's hoard seen from the yard: `depot-hoard` at [45,13] is out of view until you are inside the strongroom, and moving it broke all three take routes; a glint, a window or a look over the strongroom's front would do.
- Stale pointers to the archived `docs/plan/step-16.md` remain in `scripts/e2e.ts:383`, `scripts/e2e/quarry.ts:4,186` and `docs/plan/step-18.md:153`; fix with the next code push that touches those files (`docs/plan-archive.md`, "Step 16" has the text).
