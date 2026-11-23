# Rendering actors: how bodies, people, marks and effects are drawn

**Reference.** Open before touching `src/client/draw/sprites.ts`,
`entities.ts`, `npcs.ts`, `impact.ts`, `away.ts`, `audience.ts` or `fx.ts`.

`DRAFT:` the notes file of Step 8's look lane "actors"
(`handoff-prompts/look-actors.md`), written 2026-11-23. The contract it
implements is `docs/mechanisms/art-pipeline.md`; the orchestrator moves
the items below to their homes.

## What exists

- **`sprites.ts`: the state machine.** `stateOf()` picks one of the
  contract's sixteen states from what the world says about a body (table
  below); `framesFor()` applies the person's mood (`moods`), then the
  contract's fallbacks (`jump`/`fall`/`flap` → `air`; `carryRun` → `carry`
  → `run`/`idle`; `throw` → `attack` → `idle`; `down` → `hurt` → `idle`;
  `held` → `hurt` → `air`; `hide`/`talk`/`grab` → `idle`). `fpsBy`
  overrides `fps` per state. `attack`, `grab`, `throw`, `hurt` play once
  from the world tick they began and hold their last frame; the rest loop
  on the world tick. A kind with no sprite file returns null and is drawn
  as today's rectangle, unchanged.
- **Juice that never moves a body.** Squash for 6 ticks after landing and
  stretch for 6 after leaving the ground, scaled about the middle of the
  box's bottom edge; a white flash for 3 ticks after a hit
  (`impact.tick`); a red tint of the sprite's own pixels while enraged; a
  dimmed sprite while away. Tinted frames are cached offscreen canvases.
  `PlayerView.drawn` is recorded exactly as before, from the simulation's
  position, never the drawn picture.
- **`entities.ts`**: shadows first under every body (`shadow-s/m/l` by box
  width ≤12 / ≤20 / more), found by scanning down for the first solid or
  one-way tile, shrinking and gone 72 px up; then bodies; then `fx-land`
  at the feet on landing; then the `player-mark`, tinted with the player's
  colour (multiply, so a white mark keeps its shading), bobbing one pixel
  every 24 ticks out of step per body, raised over anything carried.
  `fx-slash` for a swing: placed from the body's middle forward, mirrored
  by facing, scaled in quarter steps by `attackReach + box.w / 2`.
- **`impact.ts`**: `fx-dust` puffs (three, or two for a soft impact) and an
  `fx-hit` star at the point of impact; the shake is unchanged.
- **`npcs.ts`**: `mood-2` / `mood-3` marks; a bark in the `bark` nine-slice
  with `bark-tail` under it at the speaker; `shop-counter` / `shop-goods`;
  the red veil only for a person with no sprite sheet.
- **`away.ts`**: a sprite body is dimmed by `entities.ts` and gets
  `away-dots`; a rectangle body keeps the veil.
- **`audience.ts`**: the king's line in the `ribbon` nine-slice.
- **`fx.ts`**: a thin layer over the foundation lane's `draw/looks.ts`
  that remembers the frame's content (`useContent`), so `look(id)` works
  in files whose entry points get no content; plus `drawFrame` and
  `edgedText` (text on whole pixels with a 1 px dark edge).
- Every look falls back to what was drawn before when its id is missing.

### Which fact selects which state (first match wins)

| State | When | Timed from |
|---|---|---|
| `down` | `c.flattened` | loops |
| `held` | `c.effect.heldBy` | loops |
| `hurt` | `c.flying` or `c.beat` | `c.impact.tick` (else when first seen) |
| `throw` | a swing made while carrying, or the carried body flying off with `flying.by` = this body | that tick |
| `attack` | `world.tick − c.attack.swung` < the strip's length (7 ticks with no frames) | `attack.swung` |
| `grab` | carrying, for the strip's length after it started | first tick seen carrying |
| `carryRun` / `carry` | carrying, moving on the ground / otherwise | loops |
| `flap` | in the air, rising, `c.flap.used` > 0, a flap seen in the last 30 ticks | loops |
| `jump` / `fall` | in the air, `vy` < 0 / otherwise | loops |
| `run` | on the ground, `|vx|` > 1 | loops |
| `hide` | `c.roomHide` | loops |
| `talk` | `c.npc.bark` or `c.audience` | loops |
| `idle` | otherwise | loops |

"Carrying" is `c.carrying`, or else another body whose `c.effect.heldBy`
is this one (see the flag below).

## Deviations from the contract

- None in the shapes. The first push (8934a58) read `content.looks`
  itself because the foundation lane was late; the second goes through
  its helper.
- `draw/impact.ts` gets no content in its signature; it reads looks
  through the content `drawEntities` last set (`useContent`).

## Decisions

### 2026-11-23 · A throw by your own hero is drawn as a throw, not a swing
- **Decided by:** Step 8 look lane "actors"
- **Instead of asking:** "your phone thinks your hero swung when you threw: show what?"
- **Why this way:** your phone runs your hero itself and never learns it is carrying (the server does the lifting), so it predicts an ordinary swing on the throw press. A swing made while something is over your head is drawn as the throw, with no slash.
- **To change it:** one line in `src/client/draw/sprites.ts` (`swingThrew`).
- **Where:** `src/client/draw/sprites.ts`, `remember()`.

### 2026-11-23 · Juice is small and short
- **Decided by:** Step 8 look lane "actors"
- **Instead of asking:** "how much squash, stretch and flash?"
- **Why this way:** "OHHHHH" impact without blurring a 320×180 picture: squash 14 % and stretch 12 % of the cell for 6 ticks, a white flash for 3 ticks, shadows up to 72 px above the floor. All `DRAFT:` constants at the top of the files.
- **To change it:** numbers at the top of `sprites.ts` and `entities.ts`.
- **Where:** those files.

### 2026-11-23 · Bark text is pale with a dark edge
- **Decided by:** Step 8 look lane "actors"
- **Instead of asking:** "dark text on the bubble, or light text with an edge?"
- **Why this way:** the brief asks for text with a 1 px dark edge, which reads on any bubble colour the props lane picks.
- **To change it:** the colours passed to `edgedText` in `npcs.ts`.
- **Where:** `src/client/draw/npcs.ts`, `bubble()`.

## Flags for the lead

- **States the renderer cannot read from the world, and times itself on
  the page** (so two screens agree only to within network delay):
  the tick of a landing and of leaving the ground (squash, stretch,
  `fx-land`); the tick a grab started; the tick of a throw (attack.ts
  stamps `swung` for a swing but nothing for a throw); the tick of a flap;
  the attack's phase (wind-up / strike / recovery: only `swung` exists, so
  the strip is simply played from it); whether a body is stunned as one
  fact (read as `flying || beat`). Exposing each, additively on
  components, would let `stateOf()` read them instead of `remember()`.
- **A player's own character never carries on its own page.** The grab
  runs on the server; the page's copy of the hero has no `c.carrying`.
  The renderer works around it by looking for a body held by this one.
  The same is why the page predicts a plain swing on a throw press.
- **The brief's "mood check" in `npm run e2e`** (three moods differ on
  screen by a stated number of pixels, with a control) does not exist in
  `scripts/e2e.ts` or `scripts/e2e/` at e7fffe7. Nothing was weakened; the
  check is still owed by whoever owns e2e.
- The carried body lags its carrier by the smoothing delay on the
  carrier's own screen (net layer, not drawing).

## Not verified

- Verified with throwaway numbered test art through the foundation lane's
  real kinds (61f7676): every state above, moods 2 and 3, a bark, the
  king's ribbon, held, hit flash, slash, hit star, dust, landing dust,
  the player mark over a carried crate; at 844×390 and upright on an
  iPhone 14 (390×844 @3×).

- With the real art of the heroes, cast and props lanes (not on `main`
  while this was written): verified only with throwaway numbered test art.
- `down` for a sprite body was not looked at in a live room.
- 60 fps on a real iPhone: only reasoned (no per-frame allocation beyond
  small arrays; tinted frames cached).
