**Reference.** Open it before touching the game's sound: `src/client/audio/`, `assets/audio/`, `content/sounds/`, `src/content/kinds/sounds.ts`, `scripts/checks/sound.ts`. It is the Step 8 sound lane's notes file (brief `handoff-prompts/look-sound.md`). The direction is `docs/audio-design.md`.

# Sound

## What exists

- **Data: `content/sounds/`** (kind: `src/content/kinds/sounds.ts`). Two shapes share the folder:
  - **An effect** is a file named after a *moment* (the `MOMENTS` list in the kind file: `jump`, `footstep`, `slam`, `bell`, `mood-rage`, `voice`, …). It holds `files` (paths under `assets/`; one is picked per play by a hash of tick and who, never at random), `volume`, `rate` (base playback speed), `pitch` (a ±fraction, picked by the same hash), `gapMs` (that moment never starts again sooner than this), `distance` + `range` (it fades with distance and is silent past `range` px), `otherRooms` (heard from another room at half volume), and `minSpeed` (the impact moments only: `impact`, `heavy-hit` ≥ 260 px/s, `slam` ≥ 420 px/s; the hardest that fits plays). A moment with no file is silent. To change how something sounds, edit its file. A new moment needs code in `moments.ts` and a line in `MOMENTS`.
  - **A tune** is a file named `tune-<name>`: `rooms`, `bpm`, `stepsPerBeat`, `volume`, and `tracks` (`wave`: square, triangle or noise; `volume`; `notes`: one token per step: `C4`, `F#5`, `Bb3`, `-` hold, `.` silence, on noise `x`/`o`; `|` bar lines are ignored). Every track has the same number of steps. A room is in one tune at most; a room in none is quiet (the `test-*` rooms).
  - `tune-outdoors` (castle street, courtyard: C major, 126 bpm, a bouncy square lead over a triangle bass) and `tune-castle` (throne room, gallery, undercroft, graybox hall: F major, 92 bpm, a triangle lead over a soft square bass). Both are original 8-bar loops, played quietly under the effects, with a 0.8 s fade when you walk into a room with another tune.
- **Files: `assets/audio/`**, 31 of the 39 WAVs of the delivered pack A01-01, trimmed, mono, 16-bit, 44.1 kHz, about 990 KB together. Made by `python3 -I src/client/audio/prepare-pack.py`, which copies only the files a `content/sounds/` entry names. Re-run it after naming a new pack file.
- **Page code: `src/client/audio/`**
  - `engine.ts`: one AudioContext, made at the first touch, key or click (the bytes download at page load; decoding waits for the context). Effects and music buses go through a mute gain and a limiter (the pack's README asks for one). It suspends when the page is hidden and resumes when it returns; if iOS will not resume without a touch, the next touch does it. A missing or undecodable file is recorded and skipped; no audio at all leaves the game silent and otherwise unchanged. At most 20 effects at once.
  - `moments.ts`: which moments happened this frame. **Your own deeds** come from the page's own simulation events. **Everyone else's** come from the server's events (`snap.ev`, through `net.latest()`); server events about your own character are dropped only for the event types your page's own simulation also produces (`LOCAL_TYPES`), because your page's world holds only you, so a hit you land, a grab or a throw is heard from the server's copy. Room parts (plates, gates, breaking) are heard once even if both copies report them. From the received world: **footsteps** (every player or person walking on the ground in your room, one per 17 px), **the king's gibberish** (a burst of syllables each time a new line of his speech goes up, roughly one per three letters) and **a person's bark** (a few syllables when new words appear over their head).
  - `music.ts`: the synth. Notes are scheduled 0.25 s ahead on the audio clock, so a hidden page stops at once.
  - `index.ts`: ties it together, the distance and left-right placement relative to your character, the gaps, and the **sound button** (`#sound`, top-right, `data-sound="on|off"`; a dark disc with a pale rim, so it reads on the night surround too). `INTENT:` it is a way out and stays. The choice is kept in `localStorage` (`irreverents.muted`) inside try/catch.
- **`src/client/main.ts`**: four lines marked `// audio hook (Step 8)`.
- **The page's record: `window.irreverents.sound`**: `unlocked`, `state`, `muted`, `files`/`loaded`/`failed`, `played`, `skipped`, `log` (the newest 60: moment, file, tick, mine, volume), `tune`, `notes`. `drawn` is untouched.
- **The check: `scripts/checks/sound.ts`** (in `npm run check`, about 5 s of browser). Nothing plays before a tap (the control); after a touch press on jump, all files have loaded, the jump is heard and the room's tune is playing; the button mutes, and the choice survives a reload; with every `assets/audio/` request refused, the game still draws and still moves. It also checks every named file and tune room exists. Both controls were watched failing: starting sound without a tap, and removing the frame hook.

### Moments wired, and what they sound like

jump, flap (jump, higher), land, footstep, swing, hit, hurt (a hit on you), impact / heavy-hit / slam (by speed), grab (a person or the king) / pickup (a crate or the throne: a body less than 1.4× as tall as wide), grab-refused, throw, door (heard on both sides), call-windup (also a camp horn being blown, `outpost-call-started`, 2026-11-24), bell, alarm-rising (horn, heard in other rooms too; also a camp horn finishing, `outpost-call-completed`), mood-calm / mood-confused / mood-rage, calmed (2→1 on an expected deed: the "Just as expected!" jingle, in place of the calm blip), voice (the king), bark, break-wall (crumble), break-window (crack), plate-down/up, gate-open/close, switch, switch-refused, ui-tap, secret-found (the pack's chime: a hidden place entered the first time, or a piece found; from the server's `place-found` / `piece-found` only, heard in every room; Step 14 slice B), recruited (the same chime: a captive freed anywhere in this world, on every page, Step 13), heart-lost (a party heart lost, `heart-lost`, on every page: the hurt sound slowed, `DRAFT:`) and game-over (`game-over-coming`, on every page: the confused warble slowed, `DRAFT:`; Step 21, hearts). These were checked by replaying real scenarios through `moments.ts` (street call, king through the window, plates and gate, throws, switching, the king's speech) and in two live pages: page A heard its own steps and jump once, page B heard A's.

### Moments the world cannot tell a page yet

- **Walking through the false wall** has no event and no sound of its own (`docs/mechanisms/rooms-and-doors.md`: whether it sounds different is the owner's call after playing). The hidden place behind it does chime the first time it is entered (`secret-found`, above).
- **Power gained / knocked loose, component collected, alarm destroyed, cat sounds, menus**: no such things in the game yet. Their files are in the mirror and were not copied.
- **Reinforcements arriving**: no event for it. `alert-changed` going up plays the horn.
- **Sneaking and pursuit layers** (`docs/audio-design.md`): the tunes do not yet thin out or gain layers with the alert. The data has the tracks to do it.
- **Knocked out** (`flattened`) and **released** have no sound of their own; the impact that caused them does.

## Deviations from the contract

- The brief said other players' sounds come "from changes in the received world". Most come from the server's events (`snap.ev`), which the page already receives and nothing read (`docs/mechanisms/network.md`, "nothing reads them yet" is now false). Footsteps, the king's voice and barks do come from world changes. Reading events is the only way to hear a swing, a landing or a mood change exactly once. A snapshot that arrives in the same frame as another loses the first one's events (`net.latest()` keeps only the newest); in practice that is rare.
- The preparation script lives at `src/client/audio/prepare-pack.py`: no `tools/` path was given to this lane.
- The check that a tune's rooms exist is in `scripts/checks/sound.ts`, not in the kind's own `check`: the room checks' controls assemble maps without the real rooms, and refusing there broke them.

## Decisions

- **2026-11-23: WAV, not OGG.** iPhone Safari does not reliably decode OGG Vorbis, so the game uses the pack's WAVs, trimmed (906 KB). How to undo: point `files` at `.ogg` copies. DRAFT.
- **2026-11-23: two tunes, outdoors and castle, written here** without hearing them: consonant, in key, sparse, quiet, original. The owner judges by ear. How to undo: edit or delete `content/sounds/tune-*.json`. DRAFT.
- **2026-11-23: the sound button is in the top-right corner, sound on by default**, starting at the first tap. How to undo: `makeButton` in `index.ts`. DRAFT.
- **2026-11-23: other players' and people's footsteps are heard**, fading over 180 px, so a guard walking nearby is heard while sneaking. DRAFT.
- **2026-11-23: the king's voice is a burst of syllables when each line goes up**, not continuous chatter, so his endless speech does not drone. DRAFT.
- Every volume, gap, range and the music level (`MUSIC_LEVEL` 0.3) is a first guess made without ears. DRAFT.

## Flags for the lead

- `docs/mechanisms/network.md`, "Known limits": "The server's events … forwarded in `snap.ev`; nothing reads them yet" is no longer true. The sound reads them.
- The iPhone's **ringer switch** silences Web Audio by default. A friend who hears nothing should check it. Making the game play through silent mode (`navigator.audioSession.type = 'playback'`) is a one-line change, but it is the owner's taste.
- Files are served `no-store` (`src/server/main.ts`), so every page load downloads the 906 KB of sound again. Worth caching when assets get heavy (the DRAFT there already says so).
- In portrait the sound button sits over the top-right corner of the view. It will want re-placing with the shell lane's layout.

## Not verified

- **Nothing has been heard by anyone.** The check proves files load and play on the audio clock in headless Chromium, not how anything sounds.
- Not run on a real iPhone: unlocking at the first touch, resuming after a lock or a call, and Safari decoding these WAVs are from Web Audio's documented behaviour.
- `hurt`, `heavy-hit` and `slam` were not seen in a live page (they need a guard hitting you or a hard throw); their mapping was read and replayed only.
