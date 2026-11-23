# Audio design: music and sound effects

**Reference.** Open it before making, requesting or wiring any sound.
Vision-level design doc kept by Vision Partner, linked from
`docs/vision.md` "Frontiers".

## Where this comes from

**Owner, 2026-11-23 ~04:05 UTC, to Vision Partner, first-hand:**
> Something that was not in any of the google drive stuff was music. I think you can figure out what the music and sound effects should be like from what's in there though. Do it.

*(Framing.)* So everything below is **Vision Partner's reading** of the Drive
library, which the owner has delegated, not the owner's own words. Each rule
names the library line it comes from (`docs/design-library/`, doc number). It
is a first pass the owner can overrule by ear in the morning; nothing here is
a decision until they react to it.

## The five rules

1. **Sound like a GBA-era game, not like Kirby.** The look is "Kirby & the
   Amazing Mirror's colorful, expressive, lush GBA pixel-art grammar while
   creating legally distinct original characters and assets" (doc 00). Audio
   follows: bright chiptune / GBA-soundfont textures (square and triangle
   waves, short plucky instruments, light drums), **original melodies only**.
   Never quote or imitate a Nintendo melody.
2. **Quiet by default, so impact can be loud.** "Achieve Kirby & the Amazing
   Mirror's restraint and legibility" (doc 00); "Build the experience of
   IMPACT via contrast with calm normal gameplay, rather than continuous
   spectacle" (doc 10). Exploration music is light, sparse and mid-low
   volume; it leaves room for footsteps and secrets. Big sound is saved for
   hits, alarms and escapes.
3. **Sound tells the story instead of dialogue.** "NO NPC AI and little
   dialogue: scripted routes, alarms, waves, sounds and sprite actions tell
   the story" (doc 00); the three NPC modes are conveyed "with animation,
   behavior, sound, simple icons and occasional brief lines" (D-057). So every
   NPC state change and every alarm has a short, unmistakable sound, and
   "barks" are wordless gibberish voice blips, not speech.
4. **The "OHHHH!" lives in the hit.** "Impact can use key-frame exaggeration,
   brief hit-stop, pixel debris… dramatic sound transients" (doc 08); "audio
   weight" on contact. A heavy hit is a low thump plus a crack, timed with the
   hit-stop; a suplex/slam gets the biggest sound in the game.
5. **Phones first.** iPhone browser is the main target (doc 33), which means
   audio starts only after the first tap (browser rule), resumes after the
   tab is suspended ("audio resume", doc 33), stays readable on a phone
   speaker (no sub-bass-only cues), and has music and effects volume plus
   mute. Never block play on audio loading.

## The owner's influences, and the idea that ties them together

**Owner, 2026-11-23 ~04:15 UTC, to Vision Partner, first-hand:**
> I'd like the other game influences to come through in the music as well: need for speed, gta, farcry, super smash bros, etc. the music with be GBA kirbyesque, but with very different influences in many cases.

So: **every track is GBA-era chiptune; what changes per situation is the
genre and energy borrowed from one of the reference games** (doc 01's
"Reference DNA"), re-voiced for the GBA.

| Situation | Borrowed from | Sounds like (as GBA chiptune) |
|---|---|---|
| Exploring | Kirby & the Amazing Mirror | light, curious, bouncy, singable |
| Sneaking | Splinter Cell (doc 26's unconscious-NPC reference) | low pulse bass, ticking hats, melody only hinted |
| Alarm / wanted pursuit | Need for Speed Most Wanted, GTA police chases | driving chiptune rock / breakbeat, one more layer per heat level |
| Villain outpost | Far Cry 5 | tense drone while scouting, then a proud hymn-like villain anthem once the alarm rings |
| Cantina brawl | Super Smash Bros. | high-energy fighting theme, KO and home-run stings |
| Hijacked vehicle | GTA radio | short "radio station" loops in different genres (funk, hip-hop beat, synth-pop) |
| Mobbed by a whole town | The Matrix Reloaded, Neo vs the Smiths | relentless industrial/techno |
| Hall of Legends | "Valhalla-like memorial" (D-024) | reverent hall, chanting fanfare when a legend is recorded |

**Vision Partner's proposal (not the owner's words; owner to judge):** the
music is the world's voice, so it is **sincere**, not wacky, and it reacts
like an NPC: plays the theme confidently in business as usual; *stumbles*
(sour note, tempo wobble) when the heroes go off-script; *snaps back* with a
resolving flourish on "Yup! Just as expected!"; turns the same melody into
the frantic chase version in rage and pursuit. One melody per area, many
moods, built from the same stems.

## Music, by situation

| Situation | Feel | Source rule |
|---|---|---|
| Exploring a level / overworld | light, curious, bouncy chiptune; loops of 60–90 s so the loop isn't obvious | rules 1–2 |
| Sneaking (no alarm) | the same theme thinned out: drums drop, bass only, soft | doc 07 "zero-alarm" satisfaction; rule 2 |
| Alarm / pursuit | the same theme with drums and a faster bass layer added, then a higher layer per wanted level, so escalation is audible | doc 26 "GTA/NFS-style escalating wanted"; doc 01 Need for Speed pursuit |
| Cooldown (hiding, heat falling) | layers fall away one by one back to the exploring mix | D-073, D-076 wait-it-out |
| King's endless speech (opening) | a stately royal march under a gibberish king voice; **must not be an obvious short loop**: long cue, varied phrases | doc 03 "Avoid an obvious short looping audio sample" |
| Cantina | upbeat tavern band; the brawl switches to a frantic version | doc 31 Smash-style brawl |
| Hall of Legends | grand fanfare when a legend is recorded; quiet museum hum otherwise | doc 09 |
| Secret credits after ~3 hours | a full, earnest credits theme | D-033 |

**Build trick:** compose each area as one theme with separable layers
(stems: melody, bass, drums, high counter-line). Escalation and sneaking are
then mixes of the same loop, which is cheap and always in time.

## Sound effects, the first set

- **Hero:** footstep (soft), jump, land, attack swing, hit, heavy hit, grab,
  throw, suplex slam, hurt, power gained, power knocked loose (D-081), pickup.
- **NPCs, one cue per mode (D-048):** mode 1 business as usual: a happy little
  blip; mode 2 confusion / distress: a rising "huh?!" warble; mode 3 rage: a
  harsh angry buzz. Plus a bright "Yup! Just as expected!" relief jingle when a
  distressed good guy calms (D-042), which should become the game's signature
  sound.
- **Signals (D-061, D-063):** bell clang and horn blast for a *completed*
  call, distinct from a softer wind-up sound while someone is *trying* to call
  (so players learn to interrupt it); reinforcements-arriving sting.
- **World:** breakable crack and crumble, door open/locked, secret found
  chime (doc 04), mystery component collected (D-078), cantina door locked
  thunk (D-088), alarm destroyed.
- **Cat:** meow, angry hiss, pounce (D-046).
- **UI:** tap, swap party member (D-084), menu open/close.

## How we get it made tonight

- **Effects:** generated in the browser with Web Audio (synthesised chiptune
  blips need no files at all) *or* as small WAV/OGG files requested from
  ChatGPT via Drive. Builders should start with synthesised placeholders and
  swap in files when they land (`docs/mechanisms/asset-requests.md`).
- **Music:** requested from ChatGPT as short layered loops (OGG + WAV), each
  layer its own file. If ChatGPT can't make audio, it marks the request
  "NEEDS CLARIFICATION", and builders fall back to a small procedural
  chiptune sequencer in code.
- Free libraries with clear CC0 licences (e.g. kenney.nl audio packs, which
  the environment can reach) are acceptable placeholders; record the licence
  next to the file. Nothing with an unclear licence.
