# A scenario can start an area's alarm at a level; then the checks and shots the escalating guard response left unmade

**Brief.** Written 2026-11-25 by orchestrator
`session_017WiGzGgiMLCwNj9zptZqBz` for one builder. Step 4
(`docs/plan/step-4.md`, "The escalating guard response" and "Second
blind look"); `docs/vision-gaps.md` row 9. Start-up read:
`docs/roles/builder-card.md`. Mechanism, read before touching:
`docs/mechanisms/npc-response.md`, "The town's tiers" (lines 440-622),
and `docs/mechanisms/scenarios.md`.

## The task, and what it moves

The five-level guard response is live, but four of its promises have no
scripted check and its ending has no phone shot, all for one reason: a
scenario can only reach level 4 or 5 by fighting for 68 to 110 seconds
first. Build the missing primitive, then use it. It moves no row of the
measure table (gate D already passes); it makes gate D's level 4 and 5
honest, and proves "solo is never locked out" at the top of the alarm
for every hero.

In order, each its own small push:

1. **The primitive:** a scenario field that starts an area's alarm at a
   level.
2. **The courtyard's level-4 row** (the guard on the trike) reached by a
   scenario again.
3. **A way out at level 5 for each of the five heroes who have none.**
4. **The ending's shots** at 844x390 and 390x664, and **level 4
   re-taken** with the trike and its driver in frame.
5. **A report made in the undercroft**, if the primitive makes it cheap;
   if it does not, say why in the notes and stop.

## What was measured (2026-11-25, at a2e7f86; re-check a line before you lean on it)

**Seeding today.** `src/scenarios/run.ts:24` lists the allowed top-level
fields (13: id, gate, proves, room, players, entities, placements,
placedRooms, tiles, world, inputs, ticks, expect). `world`
(`run.ts:116-129`, applied at `:280` before anyone spawns) copies
top-level World fields; `tick`, `entities` and `rooms` are refused
(`:124`). `entities[]` (`:70-106`) spawns character bodies only: there
is no way to give an entity components. No scenario seeds an alarm (0 of
487 files).

**Where an alarm lives** (`src/sim/npc/alert.ts`). One bodiless entity
per area, id `~alert:<room>` (`:143`), with `c.alert { level, quiet }`
(`:28-33`), its own `x`/`y` (the place reported, `:211-213`) and
`c.dispatch { queue, sent, seen? }` (`src/sim/systems/alert-dispatch.ts:16-21`).
`world.alerts` (`alert.ts:19`) is display only: the pips and bells read
it, but `alertLevel`, `townLevel` (`:136-140`) and dispatch read the
entity. Setting `world.alerts` alone changes nothing a guard does.

**Raising.** Only a completed call raises (`completeCall`, `:207-215`;
the one raising line is `:182`, one above the town's highest). The
`INTENT:` at `:159-166` says: do not add a second raise anywhere;
`step4-rage-without-a-call` checks it.

**What a world started at level N needs to be coherent:**
- the `~alert:<area>` entity with `c.alert { level: N, quiet: 0 }`
  (a `quiet` not at 0 cools it early; cooling is 20 s unseen,
  `content/tuning.json:22`);
- its `x`/`y`: entries split around `alert.x`
  (`alert-dispatch.ts:278`) and arrivals head to it (`:309`); at the
  default 0 every row comes from one side and walks to the west edge;
- `c.dispatch { queue: [], sent, seen: 0 }`: without it the area's
  table loop skips the area (`:225`) until a call creates it (`:204`);
- `world.alerts[area] = N` for the pips and the bells
  (`src/client/draw/alert.ts:75`, `:142`).
- **Nobody is on call from a seed.** `c.respond` is handed out only on a
  `call-completed` event (`alert-respond.ts:90-104`), so no row walks in,
  nobody searches, and the level-5 `keepComing` timer never fires (it
  needs a responder's sight, `alert-dispatch.ts:234-244`). The next
  completed call raises the town to N+1 and queues row N (`alert.ts:182`):
  "start at N-1, one call" is how a scenario gets a real level N with
  its row.

**Precedent, in the e2e only:** `scripts/e2e/escalation.ts:69-76` pushes
the entity by hand onto a saved world and sets `world.alerts`.

**The checks that exist.** 19 `scenarios/step4-tier-*.json`. Level 4 is
first reached at tick 4101 in `step4-tier-level4-elite-row` (5000
ticks), level 5 at 5131 in `step4-tier-level5-keeps-coming` (7600);
`step4-tier-away-at-five-grappler` runs 12000. The grappler's way out at
5: he leaves by the courtyard door at 4562 and is never struck after;
its control (no dash) is struck from 4346. Five heroes have none:
flyer, infiltrator, brawler, skirmisher, hauler (`step-4.md:904`: on the
grappler's inputs three of them reach only level 0 or 1). The level-3
way out (`step4-tier-away-at-the-most-<hero>`) exists for 5 heroes; the
hauler has none though `npc-response.md:608` says "once per roster hero".

**The courtyard's level-4 row** is a guard riding `guard-trike` plus an
armoured guard (`content/dispatch/courtyard.json:51-61`). No scenario
reaches it (`step-4.md:874-875`): `step4-tier-town-courtyard` takes the
courtyard from 0 straight to 5. The only trike fact is the street's
(`step4-tier-level4-elite-row.json:276`).

**The undercroft.** `content/dispatch/undercroft.json` has 5 rows and no
trike; no scenario has an `alert` fact for it. Four tries to report
there failed (`step-4.md:878-884`): the crowd shoves the hero back, or
he gets through the secret unseen and nobody follows. A whistle needs a
guard with `c.respond`, or a raging guard with the alarm above 0
(`alert-whistle.ts:99`). `scenarios/step4-guard-follows-seen.json:18-20`
already has the street guard follow a hero into the undercroft at about
tick 2880.

**The shots.** `scripts/e2e/escalation.ts` (`escalationFacts`, `:158`;
`LEVELS`, `:35-46`; alone: `node scripts/e2e/escalation.ts [out-dir]`),
into `docs/plan/step-4-shots/escalation/`: `level4-*` and `level5-*` at
both phone sizes (`:222-229`), `calm-750x340.png` once at the context's
default size (`:206`; no `setViewportSize`). The look
(`step-4.md:937-938`): no shot shows a bar blinking, "The watch gives up
the search" or the bells, none of the ending is at a phone size, and in
level 4 "the trike is a fragment at the left edge and no driver can be
seen".

## Decided

- **The field is a seed, not a raise.** A new top-level scenario field
  (`DRAFT:` name `alerts`: a list of `{ area, level, at }`, `at` a tile)
  builds the whole coherent state above before anyone spawns, and emits
  no `alert-changed` and no `call-completed`. The one function that
  builds it lives beside the alarm (`src/sim/npc/alert.ts`), is named
  and commented as world construction, and is what
  `scripts/e2e/escalation.ts` uses too, in place of its hand-pushed
  entity. `completeCall` stays the only raise: `step4-rage-without-a-call`
  and the `INTENT:` at `alert.ts:159-166` stay as they are.
- **A level must be within the area's table** (1 to its row count); the
  runner refuses anything else with a message naming the file.
- **Every hero has a way out at level 5** (`CLAUDE.md`: solo is never
  locked out; getting caught opens play). One scenario per hero, each
  with a control that is caught. If a hero truly has none in the street
  as built, do not invent a route in content: write what you measured
  under your notes and tell the orchestrator; that is a design finding.
- **Level 4's shot shows the trike whole and its driver**, and the
  ending is shot at 844x390 and 390x664: a bar mid-blink, the last
  banner, the bells.

## Open

Nothing for the owner.

## Traps

- **Seeding `world.alerts` alone passes an `alert` fact with
  `"shown": true` and proves nothing**: guards read the entity.
- **A seeded level has no pursuers.** A way-out scenario that starts at
  5 with nobody on call is a walk down an empty street. Start one below
  and make one real call, or the scenario lies.
- **The seed must not make existing scenarios move**: all 19
  `step4-tier-*` and the 487 in all must pass untouched. Do not re-time
  one to fit.
- **`world.entities` is kept sorted by id** (`src/sim/world.ts:22-29`);
  add the entity the way the sim does.
- **The undercroft is a secret working as a way out** when nobody
  follows (`step-4.md:907`): that is intended. Do not make guards
  follow through the false wall to get a report.
- Strangeness is usually intent: `docs/deliberate-designs.md` first.

## Yours and not yours

Yours: `src/scenarios/run.ts` and `src/scenarios/types.ts` (the one new
field, additive; an agreed edit for this brief), the one construction
function in `src/sim/npc/alert.ts`, `scenarios/step4-*.json` (new files
only), `scripts/e2e/escalation.ts`, `docs/plan/step-4-shots/escalation/`,
`docs/mechanisms/scenarios.md` and `npc-response.md`. Not yours:
`content/dispatch/**` rows, caps and words, `content/tuning.json`,
`alert-dispatch.ts`, `alert-respond.ts`, `alert-whistle.ts` and
`alert-cool.ts` (no behaviour change), `src/client/draw/**`, and
`docs/plan/step-4-patches/heroes-over-crowd.patch` (telling the hero in
a pile is a later brief: leave it).

## How it is verified

`npm run build`, `npm run check` (every scenario), `npm run gates`
(6 of 6), the full `npm run e2e` once per code push (nothing else
running on the machine: a shared run gave a false red on 2026-11-25),
`node scripts/e2e/escalation.ts` for the shots, each looked at by you.
Each new scenario has a control you watched fail. Known intermittent
red, not yours: `beaten-gone`.

## Done

Pushes 1 to 4 on `main`, each green and live (read `/debug/errors` and
`/healthz`'s `players` before a code push; push nothing while anyone
plays; `npm run check:deployed` returned FAILED at once on 2026-11-25
without waiting for the deploy: poll `/healthz`'s `commit` if it does).
Notes, doubts and skipped checks under "Alert starts at a level:
builder notes" at the end of `docs/plan/step-4.md`. Your budget is 280k
tokens: stop there with a "Landed so far" block in this file.

## Where questions and reports go

By `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. Never stall on the owner: decide from
his words, mark `DRAFT:`, log it in `docs/decisions-log.md`, carry on.
