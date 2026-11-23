# The feel dials (`?tune`)

**Reference.** Open before touching `src/client/tune.ts`,
`src/sim/tuning-rules.ts`, the `tune` / `tuning` messages in
`src/net/protocol.ts`, their handling in `src/server/game.ts` (`tune`,
`GameWorld.content`) or `src/net/client.ts` (`tune`, `shippedTuning`), or
`scripts/e2e/tune.ts` and `scripts/checks/tune-server.ts`.
Written by Step 2's dials brief (2026-11-23).

## Why it exists

The owner wants the game to feel as good as a careful platformer and is
the only judge of whether it does (`docs/plan-archive.md` ("Step 2"), "Feel, from
2026-11-23"). So every feel number is put in their hands, on the phone,
while playing: open the game with `?tune` in the address, change any
number, feel it at once, and copy the changed numbers out so a session
can make them the default in `content/tuning.json`.

## How to use it (for the owner)

- Open `https://irreverents-production.up.railway.app/?tune` (or add
  `&room=<name>` for a private world). A small **Tune** button sits at the
  top left of the view; tap it.
- The character you are playing is first and open; the other party
  members, then **World (everyone)**, then the people and objects follow.
  In each, the numbers felt most come first: top run speed (`runSpeed`),
  jump (`jumpSpeed`), wind-up (`attackWindup`), fall speed (`fallSpeed`,
  the world's `maxFallSpeed`), then the rest alphabetically.
  Each number has its plain description, the shipped value and its
  allowed range, a slider, and − / +. Tap the number box to type one.
  A changed number is yellow.
- **Everyone in the same world feels the change** at once, and it lasts
  until the game restarts (every code push restarts it).
- **Copy** puts only the changed numbers on the clipboard, shaped like
  `content/tuning.json`, and shows them in a box too (select it by hand if
  the phone refused the clipboard). Paste that to any session: "make
  these the defaults".
- **Reset** puts every number back for everyone in the world. **Done** or
  **×** closes the panel (`INTENT:` the way out).

## How it works

- **The list is never written by hand.** `tuningRules(content)`
  (`src/sim/tuning-rules.ts`) collects every number the systems declare
  (the world's) and, per character tuning set, every number its
  characters' verbs declare, with each `{ min, max, what }`. A number a
  later change declares appears in the panel by itself. Ranges are
  narrowed where `src/sim/check-content.ts` narrows them (no speed may
  cross a tile in one tick), so a dial cannot set what a build would
  refuse.
- **A change must reach the server**, because the server runs hits,
  throws and impacts (`docs/mechanisms/network.md`, "Who owns which
  part"); a panel that only changed the page would move running and
  jumping and silently nothing else. The page sends `{ t: 'tune',
  changes, reset? }` (each change `{ set, name, v }`, `set` being
  `world` or a character tuning set, `v: null` meaning "the shipped
  number"), applying it to itself at once so play follows the thumb;
  while a slider moves it sends at most every 80 ms.
- **The server refuses before it applies** (`INTENT:` at `tune` in
  `src/server/game.ts`): anything but a list, an unknown set or name, a
  non-number or a number outside its range refuses the whole message,
  answered to the sender alone with the world's numbers (which puts its
  page back). A good message is applied to **that world's own copy** of
  the tuning (`GameWorld.content`, made on the first change; until then
  the shared content) and the world's numbers are sent to every page in
  it as `{ t: 'tuning', diff }`: what differs from the shipped file.
- **Every page plays by its world's numbers**, with or without `?tune`:
  the net client lays each `tuning` over the shipped numbers **in place**
  in the page's `content.tuning`, which its own step and its drawing read
  (`INTENT:` in `src/net/client.ts`). On each `welcome` it first goes
  back to shipped (a restarted server has forgotten every dial); a world
  that is still tuned sends `tuning` right after `welcome`, so someone
  joining later plays by the dials, not the shipped numbers.
- **Without `?tune` nothing is added**: no element, no style, no message
  sent; snapshots are unchanged, and a world nobody tuned sends no
  `tuning` message at all.
- **Touch** (`INTENT:` in `tune.ts`): the page stops every `touchmove`
  and a quick second tap at the document, and reads keys on the window;
  the panel stops each of those on itself first, which is what lets it
  scroll on a phone and keeps its touches off the game. Sliders take
  sideways drags and let vertical swipes scroll the list. A row's words
  stand 8 px clear of its slider (`INTENT:` in `tune.ts`): closer, a
  scroll started on a one-line description was taken by the slider below
  and changed its number.
- **Where it sits**: over the left half of the view, the full height of
  the column the view stands in, cut short above any game control it
  would cover, so the game can be played with the panel open; upright,
  in the space between the view and the controls when there is 160 px
  of it. Groups other than your own fill their rows when first opened.

`DRAFT:` (`docs/decisions-log.md`, the `?tune` entry): a change applies
to the whole world, for everyone, until the server restarts; nothing is
saved. The slider spans the minimum to three times the shipped number
(some declared maxima are a million); − / + and typing reach the whole
range. The order is one list, `FIRST` in `tune.ts` (a name a set lacks
is skipped). A slider's step, which − / + also move by, is about a
hundredth of its span, except where the declared range is 20 times the
shipped number or more (strengths up to 1,000,000, times up to 1 s):
there it is never more than 2% of the shipped number (`stepFor`).
Measured 2026-11-23 on the five widest rows: the two 26000
`throwStrength`s went from 1000 (3.8%) to 500 (1.9%), the brawler's and
grappler's `attackStrength` from 500 (3.1%, 3.6%) to 200; the flyer's
`throwStrength` stayed 200 (2.0%). A 0.033 s wind-up went from 0.01
(30%) to 0.0005. 97 of 240 rows got finer; none got coarser. The look is plain DOM; Step 8 may restyle it.

## How it is checked

- `scripts/checks/tune-server.ts` (`npm run check`): raw sockets, two
  worlds. Eight bad messages are each refused (applied nowhere, answered
  to the sender only); a good one reaches both pages of its world, not
  the other world, and not the shared content; a page joining later gets
  it; reset and `null` put shipped numbers back. Control watched to fail:
  the server never applying (three failures).
- `scripts/e2e/tune.ts` (`npm run e2e`, facts `tune-*`): three iPhone-14
  sideways pages by touch. `tune-off`: a page without `?tune` has no
  panel and sends and receives nothing. `tune-open`: the panel opens,
  lists its own character first, scrolls by a thumb swipe, covers no
  control. `tune-move`: A drags the infiltrator's `runSpeed` to the
  end; B (no `?tune`) covers 60 px in about half the time on its own
  page and on A's. `tune-hit`: A's hit sends a crate ~97 px on both
  pages; after dragging the grappler's `attackStrength` to 0 the same
  hit moves it 0 px on both (the server runs hits). `tune-join`: a page
  joining afterwards has the world's numbers. `tune-copy`: the copy box
  holds exactly the changed numbers; Reset reaches B; × closes. Control
  watched to fail (2026-11-23): the server never applying failed
  `tune-move`, `tune-hit`, `tune-join` and `tune-copy`. It also writes
  `e2e-out/tune-sideways.png` and `tune-upright.png` (iPhone 14 size, one
  device pixel per CSS pixel).

## Traps

- **Never mutate the content passed to `attachGame`**: it is shared by
  every world (and, in the in-process checks, by the test clients). Tune
  a world's own copy.
- A tuning number used by drawing (`attackReach` in
  `src/client/draw/entities.ts`) follows the dial too, because drawing
  reads the same `content` the net client updates in place.
- Nobody has run this in Safari on a real iPhone; `GET /debug/errors` is
  where its failures would show.
