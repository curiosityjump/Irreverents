# Two players can never be the same hero (the switch gap)

Brief for the doorways builder (`session_017WiGzJujVWWDboh12zWhNR`), who knows
`src/client/main.ts`'s `play()` and the e2e. Written 2026-11-23 17:55 UTC by
the orchestrator (`session_017WiGzHhke4tkAThPgw6EXs`). Read
`docs/mechanisms/party-and-switching.md` and `docs/mechanisms/network.md`
("Who owns which part of a player's entity") first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after the push, with the commit. Notes:
`docs/plan/step-5.md`, a new last handoff entry.

**One push, fully checked.** A push to `main` is the deploy.

## The task, and why

Two friends can end up playing the same hero. The rule is one player per party
member ("no member played twice", `t-switch-free`, a known todo in every e2e
run since the morning), and the simulation enforces it:
`memberTaken(world, member, exceptEntity)` (`src/sim/party.ts:34`) is asked by
the switch verb (`src/sim/verbs/switch.ts:61`) and the cantina's swap
(`src/sim/systems/cantina-swap.ts:99`). **But a page steps a local world that
holds only its own character** (`docs/mechanisms/network.md`), so on the page
`memberTaken` never sees a friend, and **the page owns its own `kind`**
(`adopt` in `src/server/game.ts:207-217`: the page's top-level fields win). So
the page switches into a hero a friend is playing and the server accepts it.

Seen today on a live-shaped run (the Step 11 lead, cantina phone e2e, 09d98a1):
a page's switch went grappler → infiltrator → brawler while the other player
was playing the infiltrator. It moves M2's meaning (two people play together)
and closes the e2e's one standing todo.

## What to build (`DRAFT:`; pick the smaller that is correct, say which)

- **The page knows who is taken.** The page already holds the other players'
  bodies for drawing (`net.others()`, `main.ts` ~236). Give the local step
  what it needs so `memberTaken` answers the same on the page as on the
  server: either the others' entities present in the local world in a form
  the local step never moves or hits (the server stays their owner), or a
  small additive hook the two callers consult (a `taken` list on the local
  world). Whichever you choose, the switch verb and the cantina swap must
  both get it right, and no local system may start simulating the others.
- **The server refuses what slips through** (two presses in the same
  instant on two phones): in `adopt`, a reported `kind` that another player
  of that world holds is not taken; the page is put back by an effect the
  page already understands (Step 11 added `become {kind}`: read
  `docs/mechanisms/cantina.md`), keeping the kind it had.
- Joining: `firstFreeMember` already seats a new player on a free member on
  the server; check a reconnect keeps its kind unless a friend took it
  meanwhile.

## Signal

- `npm run e2e`: `t-switch-free` becomes a plain counted fact (its own text
  says so: "this was a known gap: make it a plain fact now"), and holds on
  both pages. Add: with all three members taken by three pages, a switch
  press does nothing and says so (`switch-refused`), as headless
  `step2-body-switch-two-players` already proves in one world.
- A check in `scripts/checks/` on a real server: two connections report the
  same `kind` in the same tick; exactly one keeps it. **Control watched to
  fail:** with the server's refusal removed, both keep it.
- `step2-body-*` and `step11-swap-*` scenarios stay green unchanged.

## Traps

- **Don't make the page simulate other players.** The whole design is that
  each phone simulates only its own character; other bodies are drawn from
  snapshots. A local world that steps them would fight the server.
- `adopt`'s `INTENT:` (who owns which part of a player's entity) stays:
  the refusal is the one exception, written as such.
- Solo is never locked out: one player alone must still cycle all members.
- The cantina's swap changes who is in the party (`world.party`): use
  `world.party ?? content.party.members` as the code does.
- Step 17's builder is in `src/server/game.ts` (saves) and `start.ts`; the
  Step 18 builder is in `src/sim/npc/`; pull before you push. Stop any test
  server by its PID, never with `pkill` by name.
- Read new component fields with a default (older kept games).

- **Your doorway e2e writes into the repository**: every `npm run e2e`
  rewrites `docs/plan/step-5-shots/doors/doorway-*.png`, which leaves every
  session's tree dirty and blocked a pull here. Make the run write under
  `e2e-out/` (git-ignored) like the others, and keep the committed shots as
  they are. Fix this in the same push.

## Out of scope

The thrower's predicted swing (the note above yours in `step-5.md`); the
party's order; any hero's numbers.

## Done

`npm run build`, `npm run check`, `npm run e2e` (twice) green; pushed;
`check:deployed` current (wait, don't revert, if live is healthy on an older
commit: `docs/verifying-and-finishing.md`), `check:live` passing;
`docs/mechanisms/party-and-switching.md` and `network.md` updated.
