# Mechanism index

**Standing.** Run per `docs/sop.md`.

Every mechanism in Irreverents gets exactly one line here, plus a full
writeup in a linked `docs/mechanisms/<topic>.md` file. **Read the linked file
before touching the mechanism it covers** — the one-liner tells you a thing
exists; the linked file tells you why it exists, what it interacts with, and
what broke last time.

This is the hub `CLAUDE.md` points at. It lives here rather than in
`CLAUDE.md` because it is *reference* — you need it when you are touching a
specific mechanism, not on every decision. `CLAUDE.md`'s budget is spent on
things that shape every decision instead.

## Adding to this file

One line per mechanism, in the group it belongs to (or a new group, if none
fit). The full writeup goes in that group's `docs/mechanisms/<topic>.md` —
never here. If you are tempted to write more than one line here, that prose
belongs in the doc file.

Skip routine additions that follow an existing pattern exactly, and anything
already self-evident from reading the code.

**What counts as a mechanism:** a field, flag, rule, convention or piece of
machinery whose *why* can't be recovered from the code — something a future
session could misread, break, or reinvent. If a deliberate design looks odd,
it also gets a line in `docs/deliberate-designs.md` and an `INTENT:` comment
at its code site.

**The format.** A group is a bold name followed by its writeup's path in
backticks; each line under it names the mechanism (in backticks, as it
appears in code), then a dash and what it does, in one sentence. A line may
end with where it was first used or which step added it.

```markdown
**<Group name>** (`docs/mechanisms/<topic>.md`)
- `someField` — what it does, in one sentence; first used by <where>.
- A convention with no single name — what it is, in one sentence (Step N).
```

**Keep the count honest.** If `CLAUDE.md` quotes how many mechanisms are
indexed, re-count from this file (a grep for lines starting `- ` under the
groups) whenever you add one — never update the number from memory.

---

## Index

**Design library** (`docs/mechanisms/design-library-sync.md`)
- **[Art pipeline](art-pipeline.md)**: how every picture gets into the game as data (sprites, joined-up ground, backdrops, decoration, looks), the palette and style lock for the stand-in art drawn by `tools/art/`, the draw order, and the rule that nothing drawn may point at a secret.
- **[Art foundation](art-foundation.md)**: the art content kinds (sprites, atlases, backdrops, decor, looks), the check that every art file's cells fit inside its image, and the `look`/`drawLook`/`drawNine` helper (Step 8).
- **[Rendering the world](rendering-world.md)**: backdrops and parallax, joined-up ground, room parts, decoration, and a view of any size (Step 8).
- **[Rendering actors](rendering-actors.md)**: how bodies, people, moods, marks, effects and speech are drawn from the simulation's state (Step 8).
- **[The page around the game](phone-shell-look.md)**: the shell, upright and sideways, the controls and how the view's size is chosen (Step 8).
- **[Sound](sound.md)**: sound effects and music as data, wired to moments of play; silent until the first tap (Step 8; direction in `docs/audio-design.md`).
- **[Orchestrator workflows](orchestrator-workflows.md)**: the look-review and vision-gap-audit scripts for the Workflow tool, kept verbatim so they are re-run, not re-derived.
- `tools/drive_sync.py` — mirrors the owner's Google Drive design library into `docs/design-library/` and reports what changed by hash (first import 2026-11-23).

**Asset requests** (`docs/mechanisms/asset-requests.md`)
- Drive folder "01 REQUESTS" — Claude asks ChatGPT for art by creating a `REQ — …` Google Doc there; ChatGPT checks hourly and delivers into Drive; needs the Google Drive connector to write (2026-11-23).

**Scenario harness** (`docs/mechanisms/scenarios.md`)
- `scenarios/*.json` + `src/scenarios/` — scripted play-throughs as data (room, players, timed inputs, expected facts) run headlessly by `npm run check`; `npm run gates` reports build gates A–F from their `gate` tags (Step 1).

**Content** (`docs/mechanisms/content-validation.md`)
- `src/content/kinds/` + `src/sim/check-content.ts` — every `content/` file is validated at check and build time, naming the exact file and field; tuning numbers are declared by the verb or system that reads them (Step 1).

**Deploy** (`docs/mechanisms/deploy.md`)
- `railway.json` + `scripts/lib/deploy-paths.ts` — only pushes that change the listed code paths redeploy, so documents-only pushes do not restart the live game; `/healthz` reports the running commit and whether a storage volume is mounted; `npm run check:deployed` is M1 (Step 1).

**The party** (`docs/mechanisms/party-and-switching.md`)
- `content/party.json` + `src/sim/party.ts` + verbs `switch`, `flap` — the shared party's members, who a new player becomes, switching in place to a member nobody is playing (refused when the body would not fit), and the flyer's limited flaps (Step 2).

**NPC response logic** (`docs/mechanisms/npc-response.md`)
- `entity.c.npc` + `content/npcs/`, `content/rules/` + the `npc-*` systems — scripted people with exactly three moods who witness deeds and react by role/deed tables in data; never AI (Step 4).
- `entity.c.alert` / `c.call` / `c.respond` + `src/sim/npc/alert.ts` + the `npc-call`, `alert-respond`, `alert-cool` systems — an upset witness rings a bell, only a completed call raises the area alert (one line raises it), guards come to the place reported, and the alert cools only by hiding and waiting (Step 4, slice 2).

**Hostile outposts** (`docs/mechanisms/outposts.md`)
- `content/outposts/` + `src/sim/outpost/state.ts` + the `outpost-*` systems + `src/client/draw/outpost.ts` — a camp's lookout who sees a hero runs to a horn post and sounds it; each finished call brings a wave (rows of a table, the last repeating for ever, capped by a bound on bodies); stopped by staying unseen, knocking out or grabbing the caller, breaking the post with hits or a throw, or walking out (Step 12, slice A).
- `chase-cap` + `content/hostility.json` + `clash-fight` — a chase follows a hero into the camp, the nearest two at most; guards and bad-side people fight on sight, moods unchanged (Step 12, slice B; "Chase and clash").

**Rooms and doors** (`docs/mechanisms/rooms-and-doors.md`)
- `content/rooms/*.json` doors, areas and parts + `src/sim/systems/room-doors.ts` — rooms joined by walk and enter doors that carry any body, tiles that change while the game runs (`src/sim/room-state.ts`), working-part kinds declared by their system (`plate`, `gate`, `breakable`, `false-wall`, `hide`: `src/sim/systems/room-<kind>.ts`, shared helpers in `src/sim/room-parts.ts`, drawn by `src/client/draw/room-parts.ts`), and the checks and controls (`controls/rooms/`) that refuse a broken map (Step 3).

**Levels** (`docs/mechanisms/levels.md`)
- `content/levels/<id>.json` + `world.levels` + system `level-explore` — a level's rooms, its doorways in and their entrance art; which levels a hero someone plays has been inside and which rooms and areas (hidden ones counted from the start), shown at the doorway and in the menu as a name and a completion pie, never which or where (Step 14 slice A).

**The feel dials** (`docs/mechanisms/tuning-panel.md`)
- `?tune` + `src/client/tune.ts` + `src/sim/tuning-rules.ts` + messages `tune` / `tuning` — a panel listing every declared tuning number (per character, and the world's) with sliders, reset and copy-out as tuning-file JSON; a change is checked by the server and applied to that whole world, every page included, until it restarts (Step 2).

**Combat and impact** (`docs/mechanisms/combat-and-impact.md`)
- `src/sim/body-state.ts` + verbs `attack`, `grab`, `body` + systems `combat-*`, `carry-*`, `impact-*` — hitting, picking up, carrying and throwing any body; flying bodies record wall and body impacts with a held beat; hidden toughness, flattened and back; a body that cannot act runs no verb (Step 2).
- `verbs/jump.ts` (declares) + `systems/physics.ts` (reads), the attack's phases, `beatTicks`, the floor bounce, `systems/body-stun.ts` — game feel: each character's own arc (apex hang, fall gravity, fall cap), a wind-up / strike / recovery swing, a held beat scaled by impact speed, bodies bouncing off floors, and the states drawing reads (`c.landing`, `c.airborne`, `c.stunned`…) (Step 2, 2026-11-23).
- `content/placements/<room id>.json` + `populateRoom` — who and what stands in a room, as bodies nobody plays; scenarios get them with `"placements": true` or their own `entities` (Step 2; Step 4 owns the kind from here).

**The cantina** (`docs/mechanisms/cantina.md`)
- `content/roster.json` + `content/cantina/<room>.json` + systems `cantina-*` + `~cantina:<room>` — the endless brawl: one scripted regular per roster character nobody plays, a player's hit on one starts a free-for-all (`c.brawl`), past the edge or flattened is back on a pad at once with a knock-out/fall count, the owner's bell or the last player leaving ends it; nothing runs in a page's own world (Step 11).

**The Hall of Legends** (`docs/mechanisms/hall-of-legends.md`)
- `src/client/draw/hall.ts` — each pedestal's record redrawn as a small framed picture, a card with no button when a player stands at it, and a three-second banner for a newly hung one (Step 7).

**Lasting records** (`docs/architecture.md`, "Lasting records: the store")
- `src/server/store.ts` — named collections of JSON records on the owner's storage volume, in memory where there is none; never throws, sets unreadable files aside, proven by `node scripts/check-store.ts` (Step 7).
- `src/server/saves.ts` — a kept game: the world `game-<CODE>`, saved to the store every 30 s, on the last leave and on SIGTERM, rebuilt from it on the next join, dropping what no longer fits; a world that throws is set aside and never takes the server down; `GET /game/<CODE>` says whether one exists; `src/client/start.ts` the start screen (new, continue, join a friend, everyone's kingdom), the one-tap `?game=` link and the in-play menu's way back; `?room=` skips it (Step 17; `docs/mechanisms/saves.md`).

**The royal audience** (`docs/mechanisms/royal-audience.md`)
- `content/audience/*.json` + `src/content/speech.ts` + system `audience-speech` — a speech that belongs to a placed body: a count on the body advanced every tick whatever happens to him, words as a pure function of the line number, a ribbon over his head, and a check that refuses any line repeating within three hours (Step 6).

**Network layer** (`docs/mechanisms/network.md`)
- `src/net/` + `src/server/game.ts` + `content/net.json` — each page simulates its own character and reports it; the server holds each world (`?room=`), steps everything else, sends whole-world snapshots, and delivers effects on a player's character (acknowledged, resent); generic over entity kinds (Step 1).
- `window.irreverents.drawn` + `scripts/e2e.ts` — the page records what it drew each frame; `npm run e2e` and `npm run check:live` drive two real pages (keys, and a touch phone) and assert only on that (Step 1).
- `scripts/checks/<id>.ts` — scripted checks that need a real server, run by `npm run check` and counted by `npm run gates`; `together` is gate F, `built-server` starts `dist/server.cjs` (Step 1).
- `GET /debug/errors` + `src/server/errors.ts` + the first script in `src/client/index.html` — the page reports its own errors, failed loads and a socket that will not open; the server keeps the newest 200 in memory. **Read this address first when the game misbehaves on a real iPhone** (Step 5).
