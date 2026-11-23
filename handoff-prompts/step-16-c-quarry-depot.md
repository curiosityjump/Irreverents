# Step 16, slice 3: the depot — a guarded hoard, taken quietly or loudly

Brief for a fresh builder. Written 2026-11-23 17:30 UTC by the Step 16 lead
(`session_017WiGzHt9iJy3caBLkT1Ef4`). The step is `docs/plan/step-16.md`:
read "What's decided", bullets from "Seeing is not calling" to "Solo is
never locked out". Read `docs/mechanisms/outposts.md` and
`docs/mechanisms/npc-response.md` in full before writing anything. **Start
only once slice 2 (`handoff-prompts/step-16-b-quarry-enemies.md`) is on
`main`**: you replace the plain fighters it put in the depot's yard.

**Hard stop: 90 minutes after you start, with whatever is green. Nothing
half-working on `main`.** Two pushes; after each, `send_message` to the
lead with the commit.

## The task, and what it moves

In the middle of the quarry is the bad guys' depot. Slice 1 built its
shape: a yard, a strongroom, and besides the front three ways in (under,
over, through). Now give it its guards: a lookout and a horn, two patrols
walking the yard, and a hoard in the strongroom that a hero takes with
Use. You can take it and leave without anyone starting a call; if you are
seen, the horn brings growing waves and you fight, or you run for the pit
and the cave. Nothing starts a "heist": however you walk in, you are in
one. The owner's standard: "the profound satisfaction of an impossible
zero-alarm infiltration", and "A disastrous stealth attempt should often
become an even more memorable battle or escape." Signals 5 and 6 of the
step. Moves no M-row; `npm run gates` must still print 5 of 6.

## Measured for you (at fd3f4d5; `npm run check` green, 41 s; `npm run build` 5 s)

- **The depot, `content/rooms/quarry-depot.json`, 64 × 20** (its `//`
  says what is where). Floor of the yard is row 13 (standing tiles), row
  14 solid. The heroes come in from the tower at **column 0, rows 11–13**
  (walk door `to-tower`) and leave east past columns 48–62. The
  strongroom is columns 36–47, rows 9–13, front at column 36, back at
  column 47. Ways in: **under**, a one-tile crawl (row 15, columns 45–50)
  from the dip at columns 51–52 up the shaft at columns 42–44; **over**,
  the roof (row 8, five tiles over the yard floor) and its hole at columns
  41–42; **through**, the cellar from the pit (column 0, rows 16–18, walk
  door `to-pit`) and its `cellar-wall` breakable at column 35, broken by
  the grappler throwing `cellar-rock`. Hides: `yard-stack` (column 20),
  `roof-chimney` (column 38), `cellar-alcove` (column 8). Areas:
  `strongroom`, `cellar` (hidden), `under-the-strongroom` (hidden).
- **Sight** (Step 4, `canSee`): 112 px (7 tiles) across, 40 px (2.5
  tiles) up and down, in front, no solid tile between, not hiding. So the
  roof (5 tiles above the yard floor) and the cellar (under solid row 14)
  are out of sight of anyone on the yard floor.
- **An outpost is data**: `content/outposts/<id>.json` with `room`,
  `signaler`, `callers`, `entry`, `bound`, `callTime`, `callAgain`,
  `breakHits`, `breakSpeed`, `waves`. Copy `content/outposts/outpost.json`
  (Step 12's camp: 3 s call, 6 s again, 3 hits or 300 px/s to break,
  waves 1/2/3 fighters, bound 8). The post is a placed `signal-post`; the
  lookout an `outpost-lookout` (its body has toughness 30, so one blow
  stops a call). With no hero in the room a call stops (`no-hero`) and
  queued waves are dropped: that is "escape the zone".
- **Patrols** are Step 4 routines on the placement entry: `{ "walk-to":
  column }`, `{ "face": "left"|"right" }`, `{ "wait": s }`, looping
  (npc-response.md, "routine"). Copy the camp's
  `content/placements/outpost.json`.
- **The hoard** is a Step 4 `things[]` entry in the depot's placements:
  `deed: "take"`, `once: true`, `look: "goods"`, inside the strongroom. A
  hero's Use on it emits `did` with deed `take` (no new button, D-093).
- **Step 12's camp room has only `enter` doorways** so nobody of the camp
  can leave (outposts.md, rule 4). **The depot has two walk doors on its
  west edge** (`to-tower`, `to-pit`). Outpost-fight walks a fighter to
  where it last saw a hero: if that is in a door's tiles, the fighter is
  carried through. **Measure it** (a hero seen near column 1 who steps
  through `to-tower`). If fighters follow, that is D-077's chase, which is
  allowed; say so in the handoff, keep `entry` at the east end (about
  column 61, row 13) and the patrols' routes off columns 0–2, and tell the
  lead. Do not edit `outpost-fight.ts` (Step 12's).

## What to build (all `DRAFT:`; log the picks in `docs/decisions-log.md`)

Owned paths: `content/outposts/quarry-depot.json`; people and things in
`content/placements/quarry-depot.json` (keep `cellar-rock` and its
`//`); `scenarios/step16-*.json`.

1. **The outpost file** `content/outposts/quarry-depot.json`: room
   `quarry-depot`, the post and the lookout as signaler and caller (the
   patrols may be callers too: your pick), `entry` at the east end,
   waves of fighters growing row by row (slice 2's `heavy-fighter` in the
   later rows if it landed), bound 8 (people per room).
2. **People** (at most 8 placed, `MAX_NPCS_PER_ROOM`; leave room under
   `bound` for a first wave): the lookout and the post in the yard where
   the lookout sees the way in from the tower; two patrols walking fixed
   routes across the yard, timed so the quiet way across the yard needs
   timing and exists (tight enough that a hero walking in at the wrong
   moment is seen); one guard by the strongroom's front. Replace slice 2's
   yard fighters.
3. **The hoard** inside the strongroom, columns 37–46, on its floor.

## The two pushes

1. **Quiet** (signal 5): items 1–3, the two zero-alarm scenarios, and
   **the touch crossing of the road** (signal 7, measured by the lead
   at 727dec7): in `scripts/e2e/quarry.ts`, `walkInto`'s hop adds the
   jump finger with a `touchMove`, so the page never sees it touch down.
   Replace the hop with: `touchStart` [stick id 1, jump id 2]; sleep 300;
   `touchEnd` []; `touchStart` [stick id 1] (as `scripts/e2e.ts`'s
   two-finger fact starts both in one `touchStart`). Then after the road
   screenshot, `walkInto(ph, 1, 'quarry-ridge', 45000, 700)` as a fact
   `quarry-road-cross`; drop the DRAFT comment there. With that change the
   lead's local `npm run e2e` crossed into `quarry-ridge` as the grappler.
2. **Loud** (signal 6): the caught scenarios, and the doc rows.

## Scenarios (`step16-*`, no `gate` tag, one player, each with a control watched to fail)

5. **Zero alarm**, two routes, each through a different way in. Each
   takes the hoard (`did` take) and leaves the depot (`in-room` not
   `quarry-depot` at the end), with no `outpost-call-started` at any tick
   and every person in the depot at mood 1 throughout. Suggested: the
   flyer over the roof, timed past the patrols; the grappler through the
   cellar (pit, rock, wall, shaft). Control for each: the same inputs with
   one patrol a second later in its routine (or the hero a second
   earlier) is seen and a call starts.
6. **Caught, then play.** The hero is seen; a call completes and a wave
   walks in (`outpost-wave`). Then:
   - (a) the hero beats or grabs everyone who may call, and no new call
     starts in the next 20 s;
   - (b) another run: the hero takes the hoard and leaves by the cellar,
     the pit and the cave; no wave person exists outside the depot, and
     no `outpost-wave` after the hero left. Control: with the cellar door
     made solid by a scenario `tiles` override, (b) fails.

   Nothing reloads and no room restarts.

Trace before pinning (`node scripts/trace.ts`). The traps in
outposts.md's "Checking it" apply: an event at tick N shows in a fact from
N+1; nobody has `c.npc` at tick 0; a lookout placed facing right turns on
its first tick.

## Traps

- **Slice 1's and 2's scenarios must pass unchanged.** Every across and
  back scenario walks through the yard. With patrols and a lookout there,
  a hero crossing is seen, a call starts and fighters fight. If one fails,
  first try to keep the crossing out of the patrols' way (the scenarios
  are routes, not stealth tests); if it can't, give that scenario a
  `tiles`/placements override or ask the lead. Do not weaken a scenario's
  facts.
- **Solo is never locked out** (D-015): one hero alone gets in and out
  quietly by at least one route. The cellar needs the grappler; a solo
  player can switch to it, so that counts.
- **Determinism**, **shared files** (none expected), **nothing under
  `src/`** in a commit that adds the level's content.

## Out of scope — leave alone

Step 12's systems and its camp; guards from the kingdom following you here
and fighting the bad guys (Step 12's slice B, D-069); saving the hoard
(nothing is saved); the refuge's rules beyond "waves don't follow"; the
look of the hoard and horn (Step 8). If something nearby looks wrong, read
`docs/deliberate-designs.md`, then note it in `docs/for-the-lead.md`.

## Verified when

Scenarios with watched controls; `npm run build`; `npm run check` (say
its time); `npm run e2e` still green; after the deploy
`npm run check:deployed` exits 0; read `/debug/errors` live before each
push.

## Done, and where things go

Done: both pushes on `main` and live. Phase 6: a line in
`docs/mechanisms/outposts.md`'s "The rooms" for the depot; decisions in
`docs/decisions-log.md`; a handoff note at the end of
`docs/plan/step-16.md`. Blocking question: message the lead at once.
Flags: `docs/for-the-lead.md`. Final message: done or blocked, the
commit. Taste for the owner's list (don't ask): whether the quiet way in
makes you proud, whether getting caught is a better time than not, what
the hoard should look like.
