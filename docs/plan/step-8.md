# Step 8 — What you see and hear

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23, to Vision Partner, first-hand** (`docs/mechanisms/asset-requests.md`):
> Ok, chatgpt is setting up the google drive so you can request assets, it will see those requests and put the requested assets into the drive, and so on. I want yoy to take advantage of this.

**Owner (Drive, doc 00), via `docs/vision.md`:**
> Visual priority per owner: achieve Kirby & the Amazing Mirror's restraint and legibility, not merely its colorfulness.

**Owner (Drive, doc 11, D-096):**
> All new creative assets, design proposals and prototype implementation decisions are APPROVED FOR IMMEDIATE USE BY DEFAULT. Claude and other builders should implement first and refine/replace later.

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
- **Sound stays silent until the first tap** (iPhone), has a mute, and
  never blocks play if it fails to load.
- **Mood without words:** each of the three NPC moods has a mark a
  player reads at phone size (Step 4 owns the moods; this step owns how
  they look and sound).

## What's open (the lead's to measure and decide)

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
2. `npm run e2e` at iPhone size, screenshots read back: each kind of
   character and person in a test room is told apart; one person shown in
   each of the three moods looks different each time; nothing important
   is under the touch controls.
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

## Measure

## Briefs

## Open with the owner

- Q-006 (the four "current" art boards that fail the art gate).

## Handoff notes
