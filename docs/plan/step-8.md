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

## Look pass, 2026-11-24 07:45 UTC (a subagent of the orchestrator, 25 screenshots; nobody but builders had looked before)

Read from the shots under `docs/plan/*-shots/` on `origin/main`, not from the live game. **A shot may predate a later push** (the Step 21 defeat shots predate hearts on the plate, 002607b; the Step 23 shots were taken on scratch builds before the buttons push, 1809a34): re-shoot before fixing anything a later push may have fixed. The translucent orange bands are Step 19's sight bands, drawn on purpose: not a fault, though the pass could not tell what they meant.

Findings, worst first, as the pass gave them:
1. `step-20-shots/bandit-upright.png`: a grey-box room (flat slabs, a black void). Likely the test room `test-machine`; check that no player reaches it.
2. Two control looks in the shots: round blue buttons (star, sword, boot) in `step-23-shots/*`, teal octagons (compass, burst, arrow) in Steps 20 and 21. Probably old against new; confirm on live that one set shows.
3. Button labels: "TAKE" and "GET IN" sit over a greyed hand that reads as disabled; "GO IN" floats with no button outline; a bare "^" above the arrows means nothing untold (`step-5` buttons `upright-390x664`, `step-20-shots/camp-wagon-get-in-390x664`).
4. Seven to eight touch buttons upright (`step-21-shots/defeat-courtyard-390x664`); sideways the icons are about 20 px at 750x340 (`step-22` `push3-sign-best-sideways`): too small for thumbs.
5. Friends' hearts ("vvv" under the other faces) unreadable at phone size (`step-23-shots/held-sideways`, `step-22` `push4-stage-cleared-upright`).
6. The town's pips under the plate read as hearts or balloons, unlabeled (`step-4` `tiers-street`).
7. Overlays stack over half the play area: legend banner, portrait card and the place label together; a stray up-arrow overlaps the label's frame; the label has an empty second line with a lone gem (`step-21-shots/defeat-landed-844x390`).
8. The bomb's burst is about a hero's size, no screen effect (`step-23-shots/bomb-burst-*`): short of "OHHHHH".
9. STAGE CLEARED's stars are chest icons, the third only dimmed; mid-count one scales over its neighbours; a dialog box behind the card is clipped (`step-22` `push4-*`).
10. Title, upright: buttons cover the art, the bottom half is empty dark, "Join a friend" is a loose label, mute nearly invisible sideways (`step-17` `title/start-upright-390x664`).
11. The menu icon has no backing and blends into the scene (`step-3` `stone-plate-part-sunk-upright`).
12. The wagon and the hero merge into one blob; "Psst!" covers the ground; no barricade visible in `camp-wagon-through-the-barricade-844x390`.

Right: pixel scaling crisp in every shot; the title art; the town, castle and undercroft clean and GBA-like; no damage number anywhere; the STAGE CLEARED card and the places menu read; the guard-vehicle sheet on style; a held sword reads. No screenshot exists of: the GAME OVER card, a held hammer or spear in play, the camp's alarm banners, the town's whistle gauge.

## Phone HUD (brief `handoff-prompts/phone-hud-legibility.md`)

Builder `session_017WiGzHxAKbURW5YnQt6bDN`, 2026-11-24. **Push 0: today's `main` shot on a local build** (at 3680029, by touch, Chromium's iPhone 14 emulation resized to upright 390×664 and sideways 844×390 and 750×340), in `step-8-shots/hud/before/`, with every control's box in `controls.json`. The tool is `scripts/hud-shots.ts` (lands with push 1) (`node scripts/hud-shots.ts <dir> [title,street,camp,defeat,stage]`; it builds and serves its own copy). Shot: the title; the castle street plain and after punching the guard (pips up; no heart was lost there in 60 s, so `street-fight-partial`); the courtyard at the camp's doorway (Go in); the camp's doorway and beside the wagon (Get in); the camp's horn banner and GAME OVER (844×390 only, from `scripts/e2e/defeat.ts`'s walk); STAGE CLEARED mid-count and done (put up page-side, as `stage.ts` does). **Not shot:** a held hammer or spear (the walk east passed the camp's hammer without Use offering it), a row arriving with its own banner, the town's whistle gauge.

**The pass's list against today's game** (numbers are the pass's):
- ~~2. Two button looks~~: one set shows everywhere (P07's round plates); the octagons were old shots. **Struck.**
- ~~4. icons about 20 px sideways~~: at 750×340 the pictures are 32 CSS px and every game button's touch area is 52 (upright 64), the stick 136×52. **Struck as stated; what holds:** the sound button's touch area is 32 px and the upright hint's × is 28. **Buttons at once:** 9 upright (the stick, Jump, Hit, Grab, Use, Switch, the hint's ×, sound, menu), 8 sideways (no ×); on STAGE CLEARED 3–4 (Continue, sound, menu, ×); the title 4. Use is dimmed whenever it would do nothing; Switch never dimmed in these shots (one player, free members).
- 3. Holds: "GET IN" over a greyed hand (`camp-wagon-get-in-*`), "GO IN" with no button (`courtyard-go-in-390x664`), a bare "^" above the stick upright.
- 5. Holds: a friend's hearts are 3-pixel "vvv" (every in-play shot).
- 6. Holds: the pips under the plate read as hearts or balloons (`street-fight-partial-*`).
- 7. Partly: one banner at a time already (the shared queue); what holds is the level sign's near-empty second line holding one grey piece (`camp-wagon-*`, the courtyard). New: **GAME OVER's words are the browser's monospace, smoothed** (`hearts-game-over-844x390`), not the pixel font.
- 9. Holds: STAGE CLEARED's stars read as chests; unearned is the same look dimmed (`stage-mid-count-*`). The clipped box behind the card is the room's own sign under the shade.
- 10. Holds: upright, the title's choices cover the art and the bottom half is empty (`title-390x664`).
- 11. Holds: the menu icon has no backing (`street-plain-844x390`).
- 1, 8, 12: not this brief's (a room, the bomb's feel, the wagon's look).

**What changed** (all `DRAFT:`, one decisions-log entry, "The phone's screen furniture made readable"; after shots in `step-8-shots/hud/after/`, same names as `before/`):
1. Thumbs: the sound button and the upright hint's × take a 44 px touch (same painted disc); the new fact `hud-targets-*` (`scripts/e2e/hud.ts`) checks every control at least 44 px at the three sizes, on the start screen and in play. Control watched: on 3680029 it fails six of six (sound 32, × 28). Hiding Switch when nobody is free (the orchestrator allowed it) was built and taken back: e2e `switch-refused` (Step 21) taps Switch with a full party and the page must say why, so Switch stays and dims; still 9 at once upright, 8 sideways. **Could also be absent without leaving a hole** (asked, not changed): the hint's × goes once dismissed already (remembered per browser); none of the other seven: the stick, Jump, Hit and Grab always act, Use's place anchors the arc, and sound and menu are ways out.
2. Words: Take, Get in, Go in sit on a gold-rimmed pill across the foot of a lit Use picture (`camp-wagon-get-in-*`, `courtyard-go-in-*`); the "^" over the stick shows only while pushed.
3. A friend's hearts are 5 px hearts with a gap between friends (`street-plain-390x664`); the pips sit on their own strip led by a brass warning sign (`street-fight-partial-*`).
4. A sign's pieces (three or fewer) sit on the name's line (`courtyard-go-in-*`); GAME OVER's words are the pixel font at a whole scale (`hearts-game-over-844x390`). Banners were already one at a time.
5. STAGE CLEARED: filled and empty stars (`draw/stars.ts`, a stand-in), a lighting star flashes and never grows; the sign's best row the same. Agreed with Step 22's lead first. **For Vision Partner's missing list:** a real star sprite in an approved style, earned and unearned (`hall-frame-star` reads as a framed tile; Step 22's lead agrees).
6. The title upright puts the choices under the picture, as low as keeps the code field in the upper half (Step 17's `start-shown`: the keyboard covers the lower half; at 390×664 the field starts at 322 px, the picture's last strip of ground under New game) (`title-390x664`); the menu button has a dark disc.

**Not verified:** on a real iPhone; a held hammer or spear on the plate (not reached by the shot walk); the dimmed Switch with a full party (`switch-refused` drives the refusal, not the look).

### Second look, 2026-11-24 09:05 UTC (a subagent of the orchestrator; all 26 before and after pairs under `docs/plan/step-8-shots/hud/`)

Fixed: button words on a pressable pill and no bare "^"; STAGE CLEARED's filled and hollow stars; GAME OVER in the pixel lettering; the menu disc; one banner at a time. Partly: thumb-sized upright, small-looking sideways (about 30 px drawn on 52 px targets); friends' hearts are hearts but run as one row outside the street; pips still balloon-like; the title upright. New or still wrong: a pink heart blob over the portrait on GAME OVER; two shots mislabelled 844x390 that are 750x340; the hint under STAGE CLEARED; the room's sign clipped beside the card; sans text on the hint and the GET IN pill. What is left is in `handoff-prompts/phone-hud-legibility.md`, "Landed so far".

### Second pass, 2026-11-24 (builder `session_017WiGzJNmuKNGA2yndGCP34`, the brief's "Landed so far" list)

Before is `step-8-shots/hud/after/` (the first pass); after is `step-8-shots/hud/after2/`, same names, shot with `scripts/hud-shots.ts` on this commit's build (iPhone 14 emulation; headless reports no safe-area insets). One push for all seven, not one each: every item touched the same few draw files, and each code push takes the live game down for a minute (logged here as a deviation from the brief).
1. **Whose hearts are whose:** a friend's hearts wrap three to a line, centred under that friend's face, a faint gold divider between friends (`hud.ts` `FRIEND_LINE`, `FRIEND_GAP`); the plate grows to the taller of the viewer's row and the friends' lines (`camp-wagon-get-in-390x664`, `street-fight-844x390`).
2. **Pips:** a rising meter of three bars, amber to red when lit, dark sockets when not, the newest flashing as it lights, on the same strip behind the warning sign (`street-fight-*`). The round `alert-pip` looks are one constant away (`alert.ts` `PIP_LOOKS`).
3. **GAME OVER's pink blob** was the last heart's pop: GAME OVER comes with the last heart (`game-over-coming`), and the pop swelled to 4x over the portrait and past the plate. It is a draw fault, fixed: half again its size at most, clipped to the plate (`after2/hearts-game-over-750x340`, from this commit's `npm run e2e`: `defeat.ts` shoots at the 'iPhone 14 landscape' viewport, 750x340, under an 844x390 name). **Not shot:** GAME OVER at 844x390 and upright: a wrapper making `hud-shots.ts defeat` resize at each of `defeat.ts`'s shots never got through the walk in two 25-minute tries (the same walk passed inside e2e), so it was taken back; `defeat.ts` is not this brief's file to change.
4. **Buttons sideways:** the action pictures aim for 40 CSS px over the view (32 before at 3x; 36 at 2x unchanged), the stick's arrows stay at 32 (`shell.ts` `OVER_AIM`, `OVER_PAD_AIM`). Paint over the view, from `scripts/e2e/phone.ts`'s own measure: 2.54% at 667x375, 2.28% at 736x414, 2.71% at 750x340, 2.41% at 844x340, under its 3% pin; 40 px on the stick too was 3.06% at 750x340, so the pin, not the play area, is what stops bigger art. **For the orchestrator:** the pictures could reach 48 px on the 52 px targets only by raising that pin (about 4.7%); not done (a builder never weakens a check).
5. **Lettering:** the hint and the Use pill's word are the pixel font (`src/client/pixel-words.ts`), Go in with a 5x8 pixel door (a `DRAFT:` stand-in for a cut glyph); `drawn.hint` reads the words from `data-word`. The pill sits inside the button, which already sits above `env(safe-area-inset-bottom)` sideways (21 px on an iPhone 14, as `phone.ts` sets it); in headless shots the inset is 0, which is why it looked near the edge.
6. **Leftovers:** the hint rests under STAGE CLEARED (`stage-done-390x664`); the clipped box beside the card was the throne room's audience caption, which now rests while the card is up; a captive's call from off screen waits while a banner is up (the next comes `callEvery` later); the title's picture upright is narrowed so New game clears it with the code field still in the upper half, and the ground under the choices is the dotted night; the sound button sat under the start screen's shade (z-index 5 under 20) and could not be tapped there: it is above it now (`title-*`).
7. **Shots nobody has, still not had:** the camp walk stood stuck on the wagon's ledge (no hammer, no banner, no lost heart in that walk); a spear, the whistle gauge, a dimmed Switch with a full party and a row arriving with its banner need a scripted world this tool does not build. A lost heart in play is in `street-fight-*` (one grey heart).

**Weakest:** the title upright still leaves its bottom third as empty dotted ground (the code field rule keeps the choices up); the sound button now sits over the title picture's top-right corner.

### Third look, 2026-11-24 10:55 UTC (a subagent of the orchestrator; `hud/after/` against `hud/after2/`, cc06a73)

Fixed: the pips (a three-bar meter), the GAME OVER blob, pixel lettering on the hint and GET IN, the hint under STAGE CLEARED, the clipped sign, "Psst!" waiting its turn. Partly: hearts sit under each face with a divider but GAME OVER's five wrap 3+2; sideways discs about 35 px drawn on 52 px targets (kept: the 3% paint pin stands); the doorway glyph still reads "nGO IN"; the title upright. Regressions: the camp's sign moved into the play area's sky; the star button faint on the red roof; faces nearly invisible on GAME OVER. Verdict: "mostly readable without being told". What is left is in `handoff-prompts/phone-hud-legibility.md`.

### Third pass, 2026-11-24 (builder `session_017WiGzEcwbDzMUBQQyjcRgE`, the brief's short list)

Before is `step-8-shots/hud/after2/`; after is `step-8-shots/hud/after3/`, shot with `scripts/hud-shots.ts` on this commit's build (iPhone 14 emulation). One push for all six (they touch the same few files, and each code push takes the live game down for a minute).
1. **The doorway glyph:** a solid amber door in a dark frame with a cream knob (7×8 font px, `pixel-words.ts` `DOOR`), not a cream outline, so it cannot be read as a letter (`after3/courtyard-go-in-*`, `camp-doorway-*`).
2. **GAME OVER:** a friend's hearts wrap at five, not three (every hero tonight has 3 or 5: one line each, the column as wide as its line); an out face is drawn at least 0.8 strong and greyed by taking its colour out, under a light shade, instead of half strength under a dark one (`after3/hearts-game-over-*`, now at all three sizes: `hud-shots.ts defeat` re-shoots only `defeat.ts`'s GAME OVER and hurt shots at each size and puts its viewport back, so the walk is untouched).
3. **Regressions:** the level sign moves beside the plate on the top row when it overlaps the plate and still ends short of the view's last 16% (Switch and sound), else below as before (`after3/camp-doorway-844x390`); a dimmed button dims by colour (grey, darker) over a dark disc, not by 40% transparency, so the star stays visible on the red roof and still reads as off (`after3/street-fight-*`, `switch-full-party-*`); the meter's unlit bars have a pale rim.
4. **The title upright:** the wordmark alone at the top between 48 px margins (the sound button sits in the margin, not over the picture), the choices on the night ground under it (the code field still in the upper half: `npm run e2e` `start-shown`), the picture's scene under the wordmark filling the foot below the last choice, cropped at the sides, its top fading into the night (`after3/title-390x664`). Sideways the sound button is a dark disc with a pale rim (`after3/title-750x340`).
5. **The pill and the home bar:** sideways the pill keeps 2 px above its button's foot, which `shell.ts` puts on the safe area's bottom edge. Shot with an iPhone 14's insets simulated (left and right 47, bottom 21, as `scripts/e2e/phone.ts`): the pill's bottom at 365 of 390 and 315 of 340, 25 px over the screen's foot (`after3/go-in-inset-*`).
6. **Shots nobody had:** a held sword on the plate (`after3/held-sword-*`); Switch dimmed with the whole party taken, three pages in one game (`after3/switch-full-party-*`); a lost heart in play and the alarm meter (`after3/street-fight-partial-*`); `defeat-hurt-*` at three sizes.
**Not shot:** a held hammer or spear (the hammer's walk in the camp stalls on the wagon's ledge as before; the spear lies only in the iron quarry and the test room, not reached by touch here); the town's whistle gauge or bell bar (needs a guard to perceive a blow and whistle: `scripts/e2e/tiers.ts`'s walk, not wrapped here).

### Fourth look, 2026-11-24 13:35 UTC (a subagent of the orchestrator; `hud/after2/` against `hud/after3/`, 36d070e): the HUD brief is closed

"Mostly yes" to whether a friend could read the screen untold; nothing made worse, nothing blurred. Fixed: the door glyph (a solid amber door, no longer a letter), the pill clear of a simulated home bar, GAME OVER's hearts on one line with out faces greyed but visible (844 and upright), the camp's sign back on the top row, the meter's unlit sockets, a dimmed Switch reading as off. **Left, small, for whoever next touches the HUD (not briefed):** the glyphs are tiny (the door on the pill at 844, the held-item icon on the plate): "the single thing most in the way"; the upright title's wordmark is a hard-edged rectangle cut from the painting and reads as a cut-out, not a logo (a taste call for the owner; a real logo cut is an asset ask); no shot shows a lost heart (`defeat-hurt` shows five full) or the out-face look at 750x340, a held hammer or spear, or the whistle gauge; the speech bubble touches the right edge at 750 (`after3/defeat-hurt-750x340`); Switch still dims and nine buttons show upright (`switch-refused` needs the tap: a design choice left open).

## Biome backgrounds (brief `handoff-prompts/biome-backgrounds.md`)

The owner, 2026-11-24 ~14:50 UTC: "Some new biome backgrounds getting added to the drive." Builder `session_017WiGzGQptGtgXJLtKXBbKC`.

**What arrived:** BKG-02, six 1024x180 panoramas (forest ruins day, ice cavern ruins, market town day, moonlit stronghold, sky isles day, volcanic forge sunset), synced to `docs/design-library/03-visual-direction-and-assets/bkg-02-six-runtime-biome-panoramas-1024x180/` (642b89a; full sync ~8 min). BKG-01's eight were already mirrored, but a sparse clone (`blob_limit_kb`) leaves those PNGs off disk under skip-worktree, so they looked missing (`git show HEAD:<path>` reads them; `tools/art/backgrounds/import_panoramas.py` does).

**How they go in:** `tools/art/backgrounds/import_panoramas.py` cuts all 14 to the centre 960x180 (whole pixels; a layer must be a multiple of 320 wide, `scripts/lib/art-images.ts`) as `assets/backdrops/bkg0N-<biome>.png` (lazy-loaded: an unused one costs nothing). Each placed one is the room's first layer: screen-pinned, `y: "bottom"`, parallax 0.35, `repeatX: false`; the sky is the panorama's top-row colour. Pinned to the screen's bottom (the room's, when the room is shorter than the view), so a lean of the camera never shows its bottom edge; parallax 0.35 never runs off its right edge for any room up to ~1940 px wide at a 430-wide view (forest-trail, the widest, is 1600).

| Room | Before | Now (`DRAFT:`) |
|---|---|---|
| castle-street | drawn sky, far castle, town band | BKG-02 market town day (street-upper and front strip kept) |
| courtyard | drawn sky, hills, castle wall | BKG-01 ruins day (tree crowns, front strip kept) |
| undercroft | drawn cellar vault | BKG-01 moonlit castle (its barred cells and chains are a dungeon) |
| outpost (Bandit Camp) | drawn sky, hills, castle wall | BKG-02 forest ruins day |
| forest-road, forest-trail | a 320-wide cut of BKG-01 forest waterfall, fixed | the whole BKG-01 forest waterfall, scrolling (crowns, front strip kept) |
| quarry-road, -ridge, -depot | drawn sky, cliffs, quarry band | BKG-01 iron quarry evening, hazed 35% toward its sky (cave strip, front strip kept) |
| quarry-cave, -pit, -tower | drawn rock / cut-stone back wall | unchanged: underground, no panorama fits |
| throne-room, hall-gallery, cantina | drawn back walls | unchanged: indoor walls; a panorama would read as outdoors |

**Not placed, for Step 15's lead and the next region:** BKG-01 ice cavern, sky islands sunset, volcanic forge, market town day (the street took BKG-02's); BKG-02 ice cavern ruins, moonlit stronghold (a night castle exterior: a night heist), sky isles day, volcanic forge sunset. Each is already cut in `assets/backdrops/`; placing one is one layer line.

**The quarry's planks (Step 22 lead's check):** at full colour the panorama's painted scaffolds and crane beams are the same wood as the quiet way's thin one-way planks (road rows 7-11, ridge rows 3-5, the depot's gantries), so its cut is hazed 35% toward its sky (`HAZE` in the tool); against it the planks read as things to stand on (`planks-*-844x390.png`). The other places are not hazed.

**Weakest (looked at, not fixed):** upright, in a room taller than the panorama's 180 px (forest-trail, the quarry's open rooms, the camp), a flat band of sky colour sits above the panorama with a visible line where its painted top starts (`*-390x664` shots); the forest's is a flat green, since its top row is canopy. The panoramas are full-saturation paintings with painted ground at their foot; they read behind the real floor in every shot, but nothing dims them (the engine has no layer tint), and the market street is busy behind its own foreground houses. The old drawn layers (`sky-tall`, `far-hills`, `castle-mid`, `far-castle`, `town-mid`, `far-cliffs`, `quarry-mid`, `cellar-vault`, `forest-glade`) are no longer drawn anywhere and are kept for a revert.

**Sync flag (not mine to change, `tools/drive_sync.py`):** BKG-02's complete-package ZIP was unpacked (21 MB) because 15 left/right previews exist only in it, so its every other file is now mirrored twice; and the six 1.7-2.5 MB `source/` originals are mirrored, since the 1 MB rule covers ZIP contents only. 33 MB in history nothing loads.

Shots: `docs/plan/step-8-shots/backgrounds/<room>-1-<before|after>-<size>.png` at 390x664, 844x390, 750x340, and `<room>-2-...-844x390.png` at the room's other end (256-colour, taken with `tools/art/backgrounds/shots.mjs`; the before shots are today's `main` without this change).
