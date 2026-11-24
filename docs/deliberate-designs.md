# Deliberate designs that look like bugs

**Standing.** Run per `docs/sop.md`.

**Read this before "fixing" anything that looks wrong.**

Strangeness in a project with an active owner is usually intent. In the
project this operating system was derived from, one review round called a
deliberate design a defect **eleven times**; every one would have been
avoided by reading a page like this first. This page starts empty and earns
its value one entry at a time.

Format: *what it looks like* → **what it actually is.**

**What an entry — and every `INTENT:` comment — is.** A best-effort reading
of something the owner said, true to the vision at the time; never "this
must stay forever" and never "this is the best possible implementation." The
originating owner put it this way, and the rule carries over: an entry may be
just the relevant words of the owner's quote and nothing else; entries will
inevitably contradict one another at some point, as the vision evolves and as
both the owner's phrasing and Claude's reading of it prove imperfect; and
**a contradiction, when it arises, is a signal of an opportunity for greater
clarity, not licence to overwrite one entry in favour of the other.** It is a
question for the owner (filed in `docs/questions-inbox.md`).

---

## The comment convention

Two greppable markers, defined in `CLAUDE.md`:

```
// INTENT: <what was chosen, and why it must stay>
// DRAFT:  <what is provisional here, and what to reconsider>
```

- **`INTENT:`** — a deliberate choice that looks odd. *Do not "fix" this*;
  ask first if you disagree. Every entry on this page should have one at its
  code site, so a session reading the file trips over it without having come
  here first.
- **`DRAFT:`** — a first pass good enough to ship, meant to be revisited.
  *Improving it is welcome.* A `DRAFT:` is not an entry here.
- **Unmarked and it looks odd → ask.** Absence of a marker is not permission.

Every entry needs a marker; not every marker needs an entry — `INTENT:` is
also used for local contracts (e.g. a compare-and-swap rule) that never
looked like a bug to anyone.

---

## Entries

Group entries under `##` headings by area of the system as they accumulate
(one heading per area, not per date). Write each as one bold "looks like"
sentence, an arrow, and what it actually is — with the owner's words quoted
where they exist, the date, and the code site.

### Decisions made on the owner's behalf

Calls a lead or the orchestrator made from recommendations while the owner
was unavailable go in their own section, each marked **"the owner may
overrule"** and reversible. Until the owner does, don't "fix" them back.
Once the owner confirms one, move it into its area's section with their
words.

**Pressing switch in a tight space sometimes does nothing, or skips a member.**
→ Intended. A member whose body would stand inside solid tiles where you are (the grappler or the flyer inside a one-tile-high crawlspace) is never switched to; the next member is tried, and if none fits the switch is refused with a `switch-refused` event and nothing changes. This is the project's "there is always a way out" principle (`CLAUDE.md`): a player is never left inside a wall. Decided by the Step 2 lead, 2026-11-23 (`docs/plan-archive.md` ("Step 2")); the owner may overrule. `INTENT:` at `src/sim/verbs/switch.ts`. Proven by `scenarios/step2-body-switch-refused-in-gap.json`.

**The store swallows every error: a damaged or unwritable records file never stops the server, it just starts that collection empty.**
→ Intended. With the storage volume attached, a server that fails to start leaves the owner and their friends with no game at all, which is worse than a Hall that is empty for one evening. So `src/server/store.ts` never throws: a file that does not parse, or is a newer version than the code knows, is renamed aside whole (`<name>.unreadable-<n>.json`, recoverable by hand, never deleted or written over), a failed write leaves the records in memory, and each is listed in `store.problems`. Do not turn a `try`/`catch` there into a throw. Decided by the Step 7 lead, 2026-11-23 (`handoff-prompts/step-7-a-store-and-pedestal.md`); the owner may overrule. `INTENT:` at `openStore` in `src/server/store.ts`. Proven by `node scripts/check-store.ts`.

**A Hall pedestal's card has no button to open or close it, and no way to keep it open.**
→ Intended. Standing at a pedestal shows its card; walking away hides it. On an iPhone that costs no extra control (iPhone first, D-093), and it is the "always a way out" principle: the card takes no input, holds nobody and covers only the top half of the screen. The new-legend banner is the same: it goes by itself after three seconds and stops nothing. Decided by the Step 7 lead, 2026-11-23 (`docs/decisions-log.md`, "You read a pedestal by walking up to it"); the owner may overrule. `INTENT:` at `drawHall` in `src/client/draw/hall.ts`.

**The start script says `exec node dist/server.cjs`, and the server prints how many games it saved as it stops.**
→ Intended (Step 17, 2026-11-23). Railway stops the old server with SIGTERM at every deploy, and the server saves every game being played when it gets it. Railway starts `npm start`; without `exec` the shell between npm and node kept the signal and nothing was saved. The line it prints is what `scripts/checks/step17-stop-save.ts` reads. `INTENT:` in `src/server/main.ts`. Don't drop the `exec`.

**When one world throws, the server sets it aside and tells its players to go back to the start screen, and refuses that saved game until the next restart.**
→ Intended (Step 17, 2026-11-23). A save from an older build crashed the whole server, `main` included, again on every reconnect. One world's trouble must never take the others down, and a game that cannot run must never be written over its own save. `INTENT:` at `setAside` in `src/server/game.ts`.

**People can be outrun and jumped over.**
→ Intended. There is always a way out (`CLAUDE.md`): now that guards and shopkeepers swing at heroes (Step 18), no person's body lists `jump`, and every person walks slower than the slowest hero runs (people 40–56 px/s; the brawler, the slowest hero, runs at 76). A hero who jumps over a swinging person and runs gets away. A person who runs or jumps needs another way out first. Decided by the Step 18 builder for the orchestrator, 2026-11-23 (`docs/plan/step-18.md`, "`DRAFT:` choices"); the owner may overrule. `INTENT:` at `charge()` in `src/sim/npc/behaviours.ts` and in the people's `"//"` in `content/tuning.json`. Proven by `scenarios/step18-jump-over-is-a-way-out.json`.

**Beaten in the Bandit Camp or the alerted street, you are thrown bodily out into the courtyard, and anything you carried is taken back.**
→ Intended, and it is the way out, not a trap. "There is always a way out" (`CLAUDE.md`) and D-019 ("battles, last stands and narrow escapes, NOT an automatic-reload punishment loop"): the throw is the exit. You are free the moment you get up (never held longer than the beat plus `flattenTime`), the place keeps its state, and you can walk straight back in. A place with no landing spot throws nobody. (Since hearts, 2026-11-24, the throw is off in the camp and the street by data: losing there is hearts and the game over; it is still on in the quarry.) Step 21 builder, 2026-11-23, `DRAFT:` numbers; `INTENT:` in `src/sim/systems/defeat-throw.ts`; `docs/mechanisms/defeat.md`.

**Beaten in the Iron Quarry stage, the whole quarry is put back as it began: its people at their posts, the horn whole, broken things mended.**
→ Intended, and only there. The owner (2026-11-24 ~00:30 UTC) asked for "one level ... a real way to lose/die, which pushes you back to the entrance to start over": his own exception, for a stage he asked for by name, to D-077 (a room's state is never reset when it empties) and D-019. Everywhere outside a stage (`content/stages/`) nothing is put back; inside one, only being beaten starts it over, and only once no friend is still inside. What you found for good (the level's pieces, a power source, a recruit) stays found.
**STAGE CLEARED stays up until you tap Continue, and while it is up your stick does nothing; the world goes on underneath, and your friend's screen is theirs.**
→ Intended (Step 22 push 4, 2026-11-24). The owner asked for "a satisfying victory screen at the end. Stage cleared, with a star rating and some stats". It is a moment to look at, so it waits for you. "There is always a way out" (`CLAUDE.md`): Continue is on it from its first frame, under the right thumb (also Enter, Space or Escape), and nothing else holds you. It never pauses the world, and each page dismisses only its own. The only numbers in the game picture are here (D-020: a result screen, never over anyone's head). `INTENT:` in `src/client/draw/stage.ts` and at the Continue wiring in `src/client/main.ts`; `docs/mechanisms/stages.md`, "The victory screen".

**A weapon lying on the ground is not a body: a swing passes through it, Grab will not lift it, a flying body does not hit it, and a person does not notice it struck.**
→ Intended (Step 23, 2026-11-24), for the same reasons as a power's orb (above in `src/sim/powers.ts`, `ORB_KIND`): as a body, a power's orb was struck by a shopkeeper's swing, raised the street's alert and wore down the villain it hit. A loose weapon is the kind `~weapon` and moves by the orb's own small fall (`src/sim/loose-fall.ts`). Use picks it up. `INTENT:` at `WEAPON_KIND` in `src/sim/weapons.ts`; `docs/mechanisms/weapons.md`.

**Weapons stand, are picked up and fall only on the server (and in a scenario), never in the page's own world.**
→ Intended (Step 23, 2026-11-24). A page's own world holds only its own character (`src/net/client.ts`); the hero's page learns the weapon in hand by the `weapon` effect and everyone else's by the snapshot. A page whose world stood its own sword would hold a second one nobody else sees. `INTENT:` at `weaponWorld` users in `src/sim/systems/weapon-*.ts`.

**A bad guy takes a weapon only when he is already standing on it: he never walks to one lying nearby.**
→ Intended (Step 23, 2026-11-24). The owner: NPCs are scripted, never AI (`CLAUDE.md`); the step file: "he does not go looking for one" (bad guys fetching a weapon is in its "Open", for the owner by playing). The rule is by touch only, writes no input and moves nobody. `INTENT:` at the top of `src/sim/systems/weapon-npc-take.ts`; `docs/mechanisms/weapons.md`.

---

## Where these live in the code

Each entry above should also carry an `INTENT:` comment at its code site.
**When the whole party is out of hearts it is GAME OVER, and you are simply back in the cantina, at once, with every heart.**
→ Intended: the owner, 2026-11-24, "Once all heros in the party are out of hearts, that's a game over (back to cantina)". It is never a reload and never holds anyone: the beat before it (1 s) is shorter than the fall it shows, everyone is free the tick they arrive, and the page's GAME OVER card takes no input and goes at any touch. Nothing found for good is lost. Hearts builder, 2026-11-24, `DRAFT:` numbers and words; `INTENT:` in `src/sim/systems/heart-game-over.ts` and `src/client/draw/game-over.ts`; `docs/mechanisms/defeat.md`, "Hearts".

Keep this table in step with the entries:

| Entry | Site |
|---|---|
| Switch refused or skips a member in a tight space | `src/sim/verbs/switch.ts` |
| The store never throws; an unreadable file is set aside | `src/server/store.ts` (`openStore`, `load`) |
| The pedestal's card has no button | `src/client/draw/hall.ts` (`drawHall`) |
| Beaten, you are thrown out (the throw is the way out) | `src/sim/systems/defeat-throw.ts` |
| Game over is the cantina at once, never a reload, the card holds nobody | `src/sim/systems/heart-game-over.ts`; `src/client/draw/game-over.ts` |
| Beaten in a stage, the stage is put back as it began | `src/sim/stage.ts` (`restoreStage`) |
| STAGE CLEARED waits for Continue; the stick rests; each page its own | `src/client/draw/stage.ts`; `src/client/main.ts` (`#stage-continue`) |
| People can be outrun and jumped over | `src/sim/npc/behaviours.ts` (`charge`); `content/tuning.json` (`characters.guard`, `.shopkeeper`, `.toll-keeper` `"//"`) |

**Still unmarked:** list entries that have no `INTENT:` at their site yet.
Add the marker when you next touch one.

`grep -rn "INTENT:" .` (narrowed to the source and content directories)
returns more than this table, by design — see "Every entry needs a marker;
not every marker needs an entry" above.

Corrections to an entry (it said X, the code now does Y) are made in place,
with a one-line italic note saying what changed and when — never a second,
contradicting entry.

## How to use this page

If something here looks wrong to you anyway, that's fine — but it is a
**question for the owner**, not a defect to file and not a fix to ship. The
cost of asking is one sentence. The cost of "fixing" a deliberate design is
removing working behaviour that someone chose on purpose.

**An entry covers exactly what it names.** Don't cite it for a neighbouring
behaviour it doesn't mention — a marker's scope creeps in the reader's
memory, not on the page. If the behaviour in front of you isn't named, it's
still a question.

**When the owner confirms something is intended, add it here and add the
`INTENT:` at the code site — both, same day** (`docs/sop.md` phase 6). That
is what keeps this page worth reading, and it is cheaper than the next
session rediscovering it the expensive way.

---

- *A friend carrying you loses you the instant you press jump, and drops
  you after a couple of seconds even if you press nothing; and a body
  knocked flying gets its controls back after a few seconds whatever
  happens* → **there is always a way out.** A held player is never stuck
  in someone's hands and a launched player is never a passenger for
  ever (`INTENT:` in `src/sim/systems/carry-hold.ts` and
  `src/sim/systems/combat-clock.ts`). Do not remove the break-free, the
  `holdPlayerTime` release or the `flyMaxTime` limit to make carrying a
  friend "reliable". This is the lead's reading of the owner's design
  principle (`CLAUDE.md`, "There is always a way out";
  `docs/plan-archive.md` ("Step 2")), not yet the owner's own word on carrying.
