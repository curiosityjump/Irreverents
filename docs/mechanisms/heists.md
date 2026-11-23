# Heists, stealth you can read, and the Use arbiter

**Reference.** Open it when touching what Use does, the Use button's word,
a watcher's drawn sight, a prize, cargo or a clean getaway (Step 19,
`docs/plan/step-19.md`). Everything here is `DRAFT:` (decisions-log
"Step 19").

## The Use arbiter (push 1)

`useHere(world, content, e)` in `src/sim/use.ts` says what a fresh press of
Use by this body would do here and now, or `undefined` for nothing. It is
the one answer every system that reads Use acts on, and (from push 2) the
one the page shows on the button.

- **Entries are one file each** in `src/sim/use/`, default-exporting a
  `UseEntry` (`id`, `order`, `find`); the directory is a registry
  (`scripts/lib/registries.ts`). The first entry, by `(order, id)`, with an
  answer takes the press. Tonight:

  | order | entry | answer when | the system that acts |
  |---|---|---|---|
  | 0 | `door` (`use/door.ts`) | the body's middle is in an enter doorway (`enterDoorwayAt`) | `room-doors` (600) takes it through |
  | 100 | `thing` (`use/thing.ts`) | the nearest untaken thing in the room within `npcInteractReach`, its keeper attending it; never while the body is out cold. Word: the thing's deed | `npc-interact` (60) does the deed |
  | 200 | `bell` (`use/bell.ts`) | the body is by a cantina's bell (`byBell`) | `cantina-brawl` (640) rings it, ending a brawl |

- **An answer** is `{ entry, word, target?, at }`: `word` keys the button's
  words, `target` is the thing's entity id, `at` the pixel spot a mark
  bobs over.
- `INTENT:` **the door wins** (order 0), as it did before the arbiter
  (decisions-log 2026-11-23 "Doorways by Use").
- `INTENT:` **the nearest thing decides.** An unattended counter answers
  nothing; it does not pass the press to the next thing (Step 4's rule,
  moved unchanged).
- **Each system keeps its own fresh-press memory** (`c.roomDoors.use`,
  `c.interact`, `c.cantinaUse`) and its own effect; only the selection
  moved. They ask the arbiter at the moment they always decided (order
  60, 600, 640), so a press that takes a body through a doorway is still
  the door's when `cantina-brawl` asks after it, standing in the far
  doorway. Behaviour was unchanged: every scenario green with no
  re-timing, and blanking the arbiter fails 32 of them (the control).
- **No thing and bell overlap today**: the cantina's room has no
  placements file, so the order between `thing` and `bell` has never
  decided a press. Before the arbiter a press could have done both.
- **To add something Use does** (rescue's `free`, vehicles' `get-in`): one
  file in `src/sim/use/` with an order between the others, the system that
  acts asks `useHere(...)?.entry === '<id>'`, and (push 2) one row of words.

## The word on the button and the mark (push 2)

- **The words are data**: `content/prompts.json`, `words.<entry>.<word
  key>` (kind `src/content/kinds/prompts.ts`): door `go-in` "Go in",
  thing `take`/`buy`/`break`, bell `ring`. At most eight letters, no
  digits. `npm run check` refuses a placed thing whose deed has no word.
- **The page asks the arbiter** each frame with the composed world (its
  own character plus everyone received: the room's things, keepers and
  doorways): `usePrompt(content, world, me)` in `src/client/use-prompt.ts`,
  then `showUsePrompt` → `showUseWord` (`src/client/touch.ts`). The
  button keeps its element and `data-action`; `data-state` is the word
  key (`go-in`, `take`, `buy`, `break`, `ring`), absent for nothing.
  `go-in` keeps Step 5's door look (`.go-in`); the others dim the hand and
  set the word over it (`.says`, `src/client/index.html`).
- **The mark**: a small bobbing chevron over `answer.at`
  (`src/client/draw/use-hint.ts`); a doorway keeps its own up-arrow
  (`draw/door-hint.ts`).
- **What the page shows is its prediction**: the page's world holds the
  room's things and people as received, so for a frame or two around a
  take by a friend the button can name a good already gone. The server's
  arbiter decides; a press on a stale word does nothing.
- e2e facts `heist-word` (take at the goods, buy at the counter) and
  `heist-plate` (`scripts/e2e/heist.ts`).
