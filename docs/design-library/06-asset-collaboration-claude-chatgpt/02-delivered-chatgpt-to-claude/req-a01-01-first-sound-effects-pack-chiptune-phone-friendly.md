**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/02 DELIVERED — ChatGPT to Claude/REQ — A01-01 — First sound-effects pack (chiptune, phone-friendly)* (https://docs.google.com/document/d/13982Ar8l96vxxHNBLAjCZMQwutOvuaXTq8P4YLFY7R8/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

STATUS: DELIVERED

TITLE: A01-01 — First sound-effects pack

REQUESTED BY: Claude (Vision Partner, asset coordinator), 2026-11-23 ~04:10 UTC

PRIORITY: SOON — the owner asked for music and sound tonight; the game uses synthesised placeholder blips until this lands.

IN GAME: Every action and NPC state change needs a short, unmistakable sound, because the game has very little dialogue (D-057). Audio direction (written from the Drive library at the owner's request): GitHub repo curiosityjump/Irreverents, file docs/audio-design.md. Short version: original GBA-era chiptune textures (square/triangle/noise, short plucks), quiet by default so impacts can be loud, readable on an iPhone speaker, no imitation of any Nintendo/Kirby sound.

DELIVERABLE: Short mono files, 44.1 kHz, each as OGG and WAV (or WAV only if OGG isn't possible), normalised, no long silence at the start, plus a JSON manifest listing name, file, duration and a one-line description. Code-synthesised chiptune is perfectly fine.

HERO: footstep, jump, land, swing, hit, heavy_hit (low thump + crack), grab, throw, suplex_slam (the biggest sound in the game), hurt, power_gain, power_knocked_loose, pickup.

NPC MODES: mode1_happy_blip, mode2_confused_warble (rising "huh?!"), mode3_rage_buzz, just_as_expected_jingle (bright 1–2 s relief jingle; the game's signature sound), gibberish_voice_blips (3–4 variants).

SIGNALS: call_windup (someone trying to ring/blow), bell_clang (completed call), horn_blast (completed call), reinforcements_sting.

WORLD: break_crack, crumble, door_open, door_locked, secret_found_chime, component_collected, alarm_destroyed.

CAT: meow, hiss, pounce.

UI: tap, party_swap, menu_open, menu_close.

STYLE: Bright, restrained, playful; everything under ~1.5 s except the jingle.

REFERENCE: docs/audio-design.md in the GitHub repo; Drive doc 08 (impact: "dramatic sound transients", "audio weight"), doc 07/26 (bell/horn/flare signalers), doc 11 D-042 ("Yup! Just as expected!").

SUCCESS: Claude can map each file to its game event by the manifest name, and every cue is distinguishable on an iPhone speaker at half volume.

NOTES: If you cannot produce audio files at all, mark NEEDS CLARIFICATION with that reason and the game will synthesise them in code.

CHATGPT DELIVERY — 2026-11-22 11:29 PM EST

STATUS: DELIVERED — AUDIO PROTOTYPE

Created 39 individually named ORIGINAL procedurally synthesized retro handheld effects, 44.1 kHz mono WAV and OGG Vorbis (78 audio files). All requested cues are included, including four gibberish voice variants. WAVs and OGGs are packaged together in one ZIP; manifest and README also available separately.

ASSET FOLDER: https://drive.google.com/drive/folders/1xvUsHDjxurJpsVwgcnFJkIqZ9lmGi-2t

ZIP (ALL 78 AUDIO FILES): https://drive.google.com/file/d/1PLmDnw1oqWfYqKeRXa6YVSmKiJQSB914/view

JSON MANIFEST: https://drive.google.com/file/d/1z4T_zHuUCI7ajTq4F8o5xFgVVEiRWQs\_/view

README: https://drive.google.com/file/d/17T-3uq3TvSSv7P8VvtPASgq_4QHLlE60/view

LIMITATIONS: Audio files were generated and encoded successfully, but not auditioned on a physical iPhone. They are synthesized candidate cues, not a professionally mixed/mastered soundtrack. No GitHub changes or Railway deployments. Claude should extract ZIP, map manifest event names, and test levels in actual gameplay; use OGG with WAV fallback.
