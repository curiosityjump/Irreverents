# Step 12 — The outpost and the chase

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11;
`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`):**
> D-061 Hostile outposts contain visible CALL-REINFORCEMENTS SIGNALERS. An enemy that DETECTS a player, RECOGNIZES them as a threat, and REACHES/ACTIVATES a signaler can call a reinforcement wave. Players can preemptively destroy/disable the signaler, interrupt the caller, clear the enemies without allowing further signaling, or ESCAPE THE ZONE. …
>
> D-069 Guards can chase into physically interconnected other game levels, where they may engage the bad guys already present. …

Step 4 builds the good guys' half and left the villain's signaler and
waves for later; this is that half. No build gate A–F is this step's;
golden scenario G-09 (doc 12) applies only if Step 7's machine exists.

## Goal

At the edge of the small kingdom is a bandit outpost. Its bandits are
glad to fight heroes; but if one spots you, runs to the signaler (a horn
on a post) and finishes sounding it, more arrive, and again after every
finished call. You can sneak past, stop the runner, break the signaler,
beat everyone, or leave. Guards chasing you now follow you through
doors, and where they meet bandits the two fight each other.

## What's decided

- **Bandits are Step 4's people:** three moods exactly (D-048), and
  fighting heroes is their business as usual (D-060). Scripted, never AI
  (D-055); a mark and a sound, not speech (D-057). Being spotted never
  reloads anything (D-062).
- **Seeing is not calling** (D-063, D-070). A bandit who sees a hero, in
  any mood, and whom the data lets call, walks a fixed route to the
  signaler and uses it; that takes time and shows. Only a finished call
  brings a wave. `DRAFT:` one wave per call (doc 07's "suggested
  default"); only a hero is worth a call, a guard is just fought.
- **One player can stop it every way D-061 lists** (D-015, D-066): stay
  unseen, knock out or grab the caller, break the signaler, beat
  everyone who may call, leave.
- **No new button** (D-093): the signaler breaks when hit or when
  something is thrown into it; bandits already called stay (doc 24).
  `DRAFT:` how much it takes, its look, and that it stays broken until
  the world restarts.
- **No cap on waves, a cap on bodies** (doc 24: "the system must never
  impose an arbitrary maximum wave count"). Waves are rows of a table in
  the outpost's data, harder row by row (D-061), and walk in at a spot
  the data marks. `DRAFT:` the last row repeats; a wave waits while the
  room is at its bound on people (Step 4 has one: measure it).
- **When no hero is left in it, it ends, and no fight shuts a door**
  (D-061; `INTENT:` at the door). `DRAFT:` the zone is the outpost's
  room; bandits stay in it.
- **A chase crosses doors** (D-077), by the door the pursuer saw a hero
  use, never another (D-065). `DRAFT:` only a few cross. The alert they
  left is no lower for it.
- **Sides that meet fight** (D-069), by a table of pairs in data:
  tonight guards and the outpost's bandits, not Step 4's street villain.
  `DRAFT:` each goes for the nearest enemy it sees; nobody's mood
  changes; each signaler brings only its own side. A wanted hero who
  joins in is not cooling off (D-074; doc 27: "do not attack anyone even
  in self-defense").
- **Nothing is saved tonight** (`DRAFT:`). Later, in Step 7's store: per
  outpost, signaler broken or not, and the most waves held off.

## How to cut it (a suggestion, not a rule)

**On `main` before claiming:** Step 2's attack, grab and throw; Step 4's
first slice (people, moods, sight). The chase also needs Step 3's doors
and Step 4's second slice (calls, the alert, responders); the touch
check needs Step 1's `npm run e2e`.

Two slices at once. **The outpost:** build it in a doorless test room of
your own, as Step 4 did, landing "no finished call, no wave" first.
**The chase:** who follows, and sides that meet. The real room and its
door go in last, once the scenarios pass. Drop first: G-09, then varied
waves, then the three-sided fight. Never cut: a finished call before any
wave, a way to stop it, the open door, the bound on bodies, three moods.

## What's open (the lead's to measure and decide)

- Read in full, in `docs/design-library/02-gameplay-systems/`:
  `27-persistent-wanted-pursuits-and-three-sided-battles.md`,
  `26-witnesses-reporting-and-wanted-levels.md`,
  `07-stealth-heists-npc-reactions-and-pursuit.md`,
  `24-feasible-game-architecture-making-irreverents-playable.md`; then
  the register's D-059–D-077 (path above).
- **Seams, written into `docs/architecture.md` before the code.** Step
  4: how a person's routine yields to a task of yours; whether its third
  slice already sends a guard through a door (then build on it); how a
  follower seeing a hero in another room, or a wanted hero hitting a
  bandit, restarts the alert's wait without your editing its files. Step
  3: the room's id and where it joins; its lead adds the door on the
  existing room's side. Step 2: how long a beaten bandit stays down, so
  "beat everyone" is real.
- Open in the library: whether pursuers wait outside a refuge, how a
  follower gets home, whether a stopped caller tries again, the wave
  rows. Pick the simplest, `DRAFT:`, log it in `docs/decisions-log.md`.

## Feedback signal

Scenarios in `npm run check`, named `step12-*.json`, no `gate` tag, each
with a control watched to fail; 1–4 with one player.
1. A bandit runs for the signaler and is knocked out mid-call: no wave.
   Control: left alone, one wave walks in after the call finishes, not
   before.
2. The signaler broken unseen: no call, no wave. Broken after a wave:
   those bandits stay, and no more come.
3. More finished calls than the table has rows: a wave each time, and
   the room never passes its bound (control: bound off).
4. A scripted route crosses the outpost and no call starts. The hero
   walks out after a wave and no new call starts (control: a door shut
   during a fight).
5. A guard follows through the door the hero used, and the alert is no
   lower; no more guards cross than the bound allows. Control: a hero
   who left unseen another way is not followed.
6. A chased hero runs into the outpost: a guard and a bandit hit each
   other, neither's mood changes, the alert rises only by a finished
   call. Out of reach, the hero waits and the alert falls (control:
   hitting a bandit restarts the wait).
7. `npm run e2e`, phone-sized page, by touch: break the signaler, stop a
   caller mid-call, walk out during a wave; the page's own record of
   what it drew shows the signaler working, in use and broken.
8. G-09, only if Step 7's machine and roadblock are on `main`: a late
   wave row sends the machine; a scripted player takes it and rams the
   wave. Build no machine here.

## Stopping condition

Signals 1–7 pass on `main` and live (`npm run check:deployed` exits 0),
and "how to add an outpost" is in `docs/architecture.md`. **Budget:**
120 minutes from claiming. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer, land the outpost alone (signals
1–4 and 7), its door added last, and say the chase was left out: an
outpost nobody can reach beats one half-working.

## Owns

New paths only, exact names agreed in `docs/architecture.md` when
claimed: `content/outposts/**` and its kind file (room, signalers, who
may call, routes, wave table, bound); `content/hostility.json` and its
kind file (which pairs fight); systems named `outpost-*`, `chase-*`,
`clash-*`; `src/client/draw/outpost.ts`. As data, new files in other
steps' directories, each agreed with its lead: the outpost's room (Step
3's format; this step adds the room file itself), its people (Step 4's),
their bodies (Step 2's). Ids name the job, never "bandit". It builds on
Steps 2, 3, 4 and 7 and edits none of their files. Four files are shared
between steps (`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`): additive edits only,
small, `git pull --rebase` before pushing, `npm run check` again after.

## Taste, for the owner in the morning

Whether a fight that will not stop is a thrill or a chore; whether the
run for the signaler makes you lunge; whether guards and bandits
brawling is funny; how fast waves grow; the signaler's look and sound.
List these; don't grade them.

## Measure

## Briefs

## Open with the owner

## Handoff notes
