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
- `DRAFT:` **Who runs it.** The orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ` leads this step
  itself. Round 1 is nine lanes building to one contract
  (`docs/mechanisms/art-pipeline.md`) at the same time, each with its own
  paths: foundation and heroes as agents on the orchestrator's machine
  (it runs only two at once: 4 processors), and cast, tiles, props, world,
  actors, shell and sound as worker sessions, one brief each
  (`handoff-prompts/look-<lane>.md`). Each lane pushes itself to `main`
  when green, so the look arrives piece by piece. Art lanes run on the
  session's own model; the four code lanes on Opus, to spare the nearly
  spent weekly allowance (the owner's words above). Each lane leaves a
  notes file (named in its brief) that the orchestrator reads and files.
- **Feedback signal for the look:** screenshots of the real game at
  iPhone size (sideways and upright), put beside the references and read
  by a fresh reviewer each round who lists the largest remaining gaps;
  the round after fixes those. `npm run build`, `npm run check` and
  `npm run e2e` stay green on every push. Whether it finally looks right
  is the owner's, by looking.
- **Stopping condition:** the owner says it looks right, or a round's
  fresh reviewer finds no rectangle or flat fill left where a player
  looks and no gap it would call large. Not a clock.

## Measure

## Briefs

Round 1 of the look (2026-11-23): `handoff-prompts/look-foundation.md`, `look-heroes.md`, `look-cast.md`, `look-tiles.md`, `look-props.md`, `look-world.md`, `look-actors.md`, `look-shell.md`, `look-sound.md`. Delete each when its lane is reviewed.

## Open with the owner

- Q-006 (the four "current" art boards that fail the art gate).

## Handoff notes
