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

**Rooms and doors** (`docs/mechanisms/rooms-and-doors.md`)
- `content/rooms/*.json` doors, areas and parts + `src/sim/systems/room-doors.ts` — rooms joined by walk and enter doors that carry any body, tiles that change while the game runs (`src/sim/room-state.ts`), working-part kinds declared by their system, and the checks and controls (`controls/rooms/`) that refuse a broken map (Step 3).

**Combat and impact** (`docs/mechanisms/combat-and-impact.md`)
- `src/sim/body-state.ts` + verbs `attack`, `grab`, `body` + systems `combat-*`, `carry-*`, `impact-*` — hitting, picking up, carrying and throwing any body; flying bodies record wall and body impacts with a held beat; hidden toughness, flattened and back; a body that cannot act runs no verb (Step 2).
- `content/placements/<room id>.json` + `populateRoom` — who and what stands in a room, as bodies nobody plays; scenarios get them with `"placements": true` or their own `entities` (Step 2; Step 4 owns the kind from here).

**The Hall of Legends** (`docs/mechanisms/hall-of-legends.md`)
- `src/client/draw/hall.ts` — each pedestal's record redrawn as a small framed picture, a card with no button when a player stands at it, and a three-second banner for a newly hung one (Step 7).

**Lasting records** (`docs/architecture.md`, "Lasting records: the store")
- `src/server/store.ts` — named collections of JSON records on the owner's storage volume, in memory where there is none; never throws, sets unreadable files aside, proven by `node scripts/check-store.ts` (Step 7).
