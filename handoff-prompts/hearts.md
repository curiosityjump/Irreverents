# Hearts: heroes lose them, a hero with none is out, all out is game over in the cantina (Step 21)

Brief for one builder. Written 2026-11-24 02:30 UTC by the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`). **The owner's words, first-hand to the
orchestrator, ~01:20 UTC, playing the live game on a phone:**

> Heros should have hearts which can be lost. Once all heros in the party are out of hearts, that's a game over (back to cantina)

and an hour before: *"i seem to be invincible as hero"*, *"Enemies can't be
fully defeated, neither can heros"*.

**The whole decision is the last section of `docs/plan/step-21.md`, "Hearts
(the owner, 2026-11-24 ~01:20 UTC)": read it first, then the rest of that
file (its "Push 1" measured table and "Push 2" notes), then
`handoff-prompts/loop-risk.md` for the traps it found (a thrown-out hero
banking a prize; `returnPrize` emits nothing; the cross-room `move`).** Read
also `docs/mechanisms/README.md`'s entries for the party and switching, the
cantina, the HUD plate (`docs/mechanisms/rendering-world.md`), saves and the
network (`docs/mechanisms/network.md`, "Traps").

**Landed so far, by the risk builder (`session_017WiGzJWYyVWtYnjFXHko1S`),
which is past its context limit and stops after its current push:** the
measurement (f89b51c); the throw-out rule switched off (12094ba) then on
(ebfd824: `content/defeat/castle-street.json` downs 2 and `outpost.json`
downs 4, window 60 s; the fall detection, the seize beat, `returnPrize`, the
cross-room `move`, the `thrown-out` event); and whatever it lands last (read
`git log --oneline -8 -- src/sim/systems/ content/defeat docs/plan/step-21.md`
and its notes before you write a line). Step 22's builder
(`session_017WiGzHD6TvY2XxEG4B3rJU`, lead `session_017WiGzFrf7N7ZgaqUyjs4Sz`)
is adding a defeat file for the quarry's six rooms in the old shape: agree
with it by message how the quarry moves to hearts; do not break its push.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push. Notes:
`docs/plan/step-21.md`, "Builder notes", a "Hearts" part.

## Pushes, in order (each small, green and live)

1. **Hearts in the sim, and they are lost.** Hearts per hero as party state
   that everyone playing shares (data per hero kind, `DRAFT:` 3); a fall to an
   enemy costs one (reuse the fall detection that is there; keep the `DRAFT:`
   data switch for "a heart per blow"); a friend's hit, a wall, a fall, the
   cantina's brawl cost none. Scenarios `step21-heart-*`, each with a control.
   Kept with a kept game (an additive top-level world field; `docs/mechanisms/saves.md`).
2. **Out, and the next member.** A hero with no hearts cannot be played or
   switched to; their player is moved to the next party member with hearts
   (the existing switch, forced), at a spot that never traps them (measure:
   where they stand, else the room's way in). With two players: each on their
   own hero; one out leaves that player on the next free member.
3. **Game over.** When no party member has a heart: a `game-over` event, the
   page's GAME OVER moment (the banner queue; a held beat that one tap skips,
   `INTENT:` it never holds a player), then every player of that game is in
   the cantina with every heart back; a carried prize back on its stand
   (`returnPrize`, and emit `prize-returned`), a held power and a held weapon
   (Step 23, `session_017WiGzF7puSFWh2BBeii8WZ`: tell it) left where they
   fell, alerts and waves ended, what was found for good kept. Where a game
   over sends you is data per place, the cantina by default; export the hook
   Step 22 needs to set its stage's own (its entrance, the stage started
   over). A two-connection real-server check: both pages draw the same hearts
   and both arrive in the cantina, in charge of their bodies.
4. **Seen on a phone.** Hearts beside each face on the party plate
   (`fillHudSlot`; the cut `hud-condition-*` marks until a heart is cut from
   an approved sheet: ask the props builder `session_017WiGzHr5CCwAod6mkVF139`
   for a heart, full and empty; a stand-in is `DRAFT:` and a missing-list
   item), a heart visibly lost at the moment of the fall (a pop and a sound),
   the out hero's face greyed. Phone e2e by touch: hearts inside the safe
   area, one lost, then game over and the stick moves the hero in the
   cantina. The buttons builder (`session_017WiGzJ23ionY6B1PB5Nmme`) is
   re-skinning the touch controls: do not move them.
5. **Retire the old rule cleanly.** The seize-and-throw to a doorway is no
   longer what losing is: turn it off by data, leave shipped fields read but
   unused (never remove one), keep its code where pushes 1-3 use it, and say
   in the notes what was kept and what is dormant. Re-time no other step's
   scenario without its owner: count reds first and send me the list.

## Decided

Everything in the step file's "Hearts" section. In short: the fall is the
unit; the party owns the hearts; game over is the cantina with hearts full;
nothing found for good is lost; no number over anyone's head.

## Open (yours; `DRAFT:`, `docs/decisions-log.md`)

- Hearts per hero kind (start at 3 each; the brawler and the grappler may
  take more: measure how long each lasts in the camp at wave 3 and the street
  at alert 3 from the "Push 1" table's method).
- Whether a hero who is out comes back with one heart when the party next
  enters the cantina without a game over (`DRAFT:` walking into the cantina
  refills all).

## Paths

Owns: `src/sim/systems/defeat-*.ts` and new `heart-*`/`party-hearts` files,
`content/defeat/**`, `src/client/draw/condition.ts` (or the file the risk
builder made for the HUD slot), `scenarios/step21-*`, one e2e file. Shared
files by additive edits, telling the owner: the party and switch code, the
cantina's entry, `src/client/draw/hud.ts`, `src/client/main.ts`, the store.
Must not touch: the quarry's rooms (Step 22), `outpost-*` and `alert-*`
(the chase and alarms builder `session_017WiGzF31gfYgeWNMA7rnEL`, the
town-tiers builder), `beaten-*` (enemies staying beaten,
`session_017WiGzEhbdYJQcUhtD2bSLL`), `machine-*`, weapons.

## Done

`npm run build`, `npm run check`, `npm run e2e` green (the reconnect facts
`h1`/`h2`, `cantina-row`, the friend-throw and `start-*` facts fail some runs
on `main` and are being fixed under `handoff-prompts/step-5-e2e-flakes.md`:
re-run and report, never loosen); pushed; live (`npm run check:deployed`,
`npm run check:live`); one line for the owner after each push saying what he
will see.
