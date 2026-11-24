**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/HANDOFF — GV-01 Guard Response Vehicles — 16 Native Transparent Sprite States* (https://docs.google.com/document/d/1VZq34tYYGYbd7VAUR9pYJuNttPQximxuGEYQ_2Un3ko/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

GV-01 — ROYAL GUARD RESPONSE VEHICLES — CLAUDE HANDOFF

2026-11-23, America/New_York

STATUS: PROTOTYPE-USABLE STATIC SPRITES. Art files validated; not a finished driving/rotor animation and not integrated in GitHub.

REAL FILE LOCATIONS

Primary folder https://drive.google.com/drive/folders/1Wt5I3wI-Za8refkFvsfCd_YH4BQMOczU

Complete import ZIP https://drive.google.com/file/d/1zKzcGsm3fkEuvwKAQ7rEZFeFJd-BfDt1/view

16-sprite native atlas (4×4, 160×96 cell) https://drive.google.com/file/d/1PgJmmQO93v4GwOhZv9Bt_f433MjEHPGv/view

JSON manifest (every state, dimensions, pivot, collision and driver anchors) https://drive.google.com/file/d/1C1sQy2cXHD9MQvNokWXz18JkV7HXslk8/view

Searchable CSV tag index https://drive.google.com/file/d/1jFkECw9Bw_AFZDEuqpyBT7JYlwsBL6hn/view

Contact with all 16 images https://drive.google.com/file/d/1J9SBmmvZaKK6cHNkKCElaQ63iuCqAkOO/view

320×180 gameplay scale preview https://drive.google.com/file/d/1EhAFZzNfJV1BNP6xoC6dB2TauhEr3OEW/view

4× nearest-neighbor comparison https://drive.google.com/file/d/1zXrJOSTcWXlJ-M4uFN5AqIM3tmoN8PjE/view

Original high-resolution source https://drive.google.com/file/d/1ENW1Hs3P1Nb3vh0rvJyYXDK6l9bg662T/view

Producer README https://drive.google.com/file/d/1YE-aP7QXMgpWYieh9dvesMvf1yZbZk8w/view

WHAT EXISTS NOW

Each vehicle is independent, EMPTY OF ALL GUARD/DRIVER CHARACTER ART, and works as its own sprite in the world. All actual individual PNGs are under /runtime/vehicles. Use the JSON manifest for exact files and pivots.

1. Patrol trike: 112×80 native pixels. parked_right, moving_right, parked_left, damaged.

2. Guard transport wagon: 144×96. closed_right, door_open_right, moving_right, damaged_right. Cargo/paddy wagon doors allow scripted interactions.

3. Siege roller: 160×96. ready_right, rolling_right, ready_left, damaged_right. Heavy scripted pursuit/hijack/knockback candidate.

4. Guard rotorcraft: 128×96. idle_right, flying_right, idle_left, damaged_right. Air response candidate, hover or simple authored route.

VISUAL + TECHNICAL QA

16 PNGs checked independent, actual RGBA alpha 0/255 and sizes multiples of 16; contact and native 320×180 gameplay scale previews rendered. The art source is an illustrated 1536×1024 PNG. Converting to smaller native dimensions preserved original shapes/colors, but it is NOT hand-pixel-repainted at native resolution. Baked dust/smoke remnants may appear in some states, and true animated wheels/rotor are NOT supplied. These are four distinct key states per vehicle (not 4-frame actual travel cycles), as exact file names reflect. Driver attachment/collision suggestions are in manifest; tune them in actual browser build. No live iPhone test was claimed. Keep "Prototype usable" on the Board until tested.

IMPLEMENTATION GUIDANCE

Guard pursuit only dispatches when an explicit eligible witness/guard signaling/reporting path completes. Do not auto-spawn patrol vehicles because a guard merely saw something. Vehicle behavior should use scripted movement/limited collision rules (NO NPC AI). Preserve actual connected-level pursuit where geometry permits. If players can hijack a vehicle, do so via same independent entity. Guard occupants are separate rigs using the manifest driver_anchor values; avoid drawing specific characters into the vehicle sprite. Enemy-vs-guard collisions and player throws can use current faction/hitbox rules.

Simplest first demo: test patrol trike and transport wagon on town street at 320×180, plus door-open and damaged. Check player/guard mount offsets, then test siege roller and rotorcraft after geometry supports them.

These are candidate vehicle types, not compulsory owner-confirmed gameplay roster; use by default and iterate.

ROUTING

Source pack GV-01 is physically in Drive; asset catalog and Master Production Board record it as VEH-001. The existing broader INT-014 vehicle prototype row links to GV-01 too. Claude should only write GitHub paths after committing actual integration, then update the master changelog. This handoff does not mark any repo or Railway deployment complete.
