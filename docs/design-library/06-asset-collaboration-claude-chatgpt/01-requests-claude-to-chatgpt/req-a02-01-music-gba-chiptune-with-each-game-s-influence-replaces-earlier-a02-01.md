**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — A02-01 — Music: GBA chiptune with each game's influence (replaces earlier A02-01)* (https://docs.google.com/document/d/1cvf_rCrdY7rSDc78_tA75-ZL-Xm9QlVRPWmNiLSKrLY/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

2026-11-23 4:23 PM EST — MA-07 CASTLE INTERIOR THEME — NEW AUDIO TECHNICAL PROTOTYPE (NOT DELIVERED)

Created original 64-second, 120 BPM ceremonial/clockwork castle theme with 4 synchronized stems (melody, bass, organ, percussion), full mix, WAV+OGG, manifest. All WAV files verified 44.1kHz stereo, exactly 2,822,400 samples (64s), with zero endpoint discontinuity in PCM; ZIP created and uploaded. Auditory quality, OGG browser seamlessness and real iPhone integration UNTESTED; this is NOT owner-approved or production-ready. No GitHub/Railway integration. ZIP https://drive.google.com/file/d/1A6BMPW_QTwI2PSJR9MVlo9ZJ11mdB5UM/view ; folder https://drive.google.com/drive/folders/1nASUXxOYM0RK0vz17lRoMbElC415Ev_1. MA-01 through MA-06 remain unchanged; MA-08+ still pending. Request stays OPEN.

2026-11-23 2:51 PM EST — MA-06 / A02-01 ITEM 1 OUTDOORS THEME — AUDIO TECHNICAL PROTOTYPE

Original 126 BPM, 32-bar (~60.952 s), 44.1kHz stereo WAV+OGG chiptune, 4 synchronized stems (melody/bass/drums/high_counter_line), plus stumble and snap_back short stings. Source-generated and ZIP integrity produced; NOT owner-approved, not phone auditioned, OGG browser loop-gap and musical quality unverified. STATUS: PROTOTYPE USABLE FOR CLAUDE INTEGRATION TEST — REQUESTED/NOT DELIVERED. ZIP https://drive.google.com/file/d/10HjntGcgYRRY201BggQ3pfZDxrSO82JA/view ; folder https://drive.google.com/drive/folders/1FqXjgUONOEoOW2d_GQUGk742U4RqcUnC ; manifest https://drive.google.com/file/d/1czmNFx_lYr1kA1H8MAAlNjx-Xd15CC5h/view . No GitHub commit. Next: listen to loop and variants on iPhone, check stem sync, adjust composition before promotion. MA-07+ untouched; MA-02 to MA-05 not duplicated.

STATUS: REQUESTED

TITLE: A02-01 — First music set (this replaces the earlier A02-01 request, which was trashed before processing)

REQUESTED BY: Claude (Vision Partner, asset coordinator), 2026-11-23 ~04:20 UTC

PRIORITY: SOON (after touch buttons and heroes).

OWNER DIRECTION (owner's own words, 2026-11-23): "I'd like the other game influences to come through in the music as well: need for speed, gta, farcry, super smash bros, etc. the music with be GBA kirbyesque, but with very different influences in many cases."

THE SOUND: everything is GBA-era chiptune (square/triangle/noise, short plucks, warm, original melodies — never imitate Kirby, Zelda or any existing theme). What changes per situation is the GENRE and ENERGY borrowed from each influence, re-voiced as GBA chiptune.

THE IDEA THAT TIES IT TOGETHER: the music is the world's voice and is completely SINCERE (the world takes its sacred story seriously; the heroes don't). One area theme, played in different moods: normal = bright and confident; when heroes do something off-script the music "stumbles" (sour note, tempo wobble); when they behave again it snaps back with a resolving flourish ("Yup! Just as expected!"); rage/pursuit = the same melody turned frantic.

DELIVERABLE: seamless loops, 44.1 kHz stereo, OGG (and WAV if possible), JSON manifest (file, bpm, loop length, layer/variant). Layers of one theme must share length and tempo so the game can mix them in sync.

1. AREA THEME (grassy ruins / town) — GBA Kirby-esque, light, curious, singable; 60–90 s loop, as separate stems: melody, bass, drums, high_counter_line. Plus two short one-shots: "stumble" (1–2 s off-key falter) and "snap_back" (1–2 s resolving flourish).

2. STEALTH VARIANT of the area theme — Splinter Cell / Metal Gear-style tension: low pulsing bass, ticking hi-hat, melody only hinted. Same tempo as 1 so it can crossfade.

3. PURSUIT / WANTED — NEED FOR SPEED Most Wanted + GTA police chase: driving chiptune rock / breakbeat with a heavy riff built from the area theme's melody, in 3 intensity layers (heat 1, 2, 3+) stacked on top of each other.

4. VILLAIN OUTPOST — FAR CRY 5: tense scouting drone before the alarm; once the alarm is rung, a proud, theatrical villain anthem (hymn-like / Americana-flavoured march re-imagined for fantasy villains who LOVE being villains).

5. CANTINA — rowdy, slightly out-of-tune tavern band loop; plus a BRAWL variant in SUPER SMASH BROS. style: high-energy rock-orchestral fighting theme at the same tempo, with a short "KO" sting and a "home-run" sting.

6. HIJACKED VEHICLE "RADIO" — GTA radio stations: three short contrasting chiptune loops (funk, hip-hop beat, synth-pop), ~30–45 s each, playing while the party drives a stolen machine.

7. SWARMED BY THE MOB — Matrix Reloaded "Burly Brawl": relentless industrial/techno chiptune for when a whole town (cats included) piles on.

8. ROYAL AUDIENCE — the most pompous royal march in the game under the king's endless speech; must not sound like an obvious short loop (doc 03): 2–3 minutes of varied phrases.

9. HALL OF LEGENDS — reverent, echoing museum ambience, and a Valhalla-style chanting "legend recorded" fanfare (3–5 s).

10. Two stingers: escape_success (2–3 s), zero_alarm_success (2–3 s, quiet and smug).

PRIORITY ORDER if not everything fits one run: 1, 3, 5, 2, then the rest.

REFERENCE: GitHub repo curiosityjump/Irreverents, docs/audio-design.md; Drive docs 01 (reference DNA list), 03 (royal audience), 07/26/27 (escalation, signals, pursuit), 09 (Hall), 31 (cantina).

SUCCESS: on an iPhone, the owner hears the town theme turn into a Need-for-Speed-style chase when the alarm goes off, calm down when the heat fades, and a Smash-style fight theme when the cantina brawl starts — and every piece still sounds like the same GBA game.

NOTES: Code-generated chiptune (e.g. a small Python synth) is fine. If audio can't be produced at all, mark NEEDS CLARIFICATION and the game will use a procedural sequencer.
