**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/P12 — Standalone Weapon Families: Direct File Index and Integration Contract* (https://docs.google.com/document/d/1sS6Dhg80ZlRDxeM7n1iJs7w1kdjKo7afYAy1iuvIA3A/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

P12 — STANDALONE WEAPON FAMILIES: DIRECT FILE INDEX & INTEGRATION CONTRACT

Irreverents • 2026-11-23 6:51 PM EST • For Claude and every art-production session

STATUS: SOURCE ART UPLOADED / NATIVE PER-STATE EXTRACTION NOT YET COMPLETE

THE CONTROLLING OWNER DECISION

Weapons must appear in ALL gameplay-relevant configurations without ANY hero, enemy, hand, or other bearer baked into the artwork. A sword must be usable by the grappler, rogue, flyer, NPCs and later recruitable characters from ONE reusable weapon library. All equipment is attached by grip anchors in-engine, using separately animated character hand/body poses. Source drawings showing a weapon held by a sample character are reference only; never an acceptable final all-purpose weapon sprite.

P12 SOURCE FOLDER — verified uploaded

https://drive.google.com/drive/folders/1nJzv1gR9853Fj6GB8yOkqXaTYx-Iim83

ORIGINAL SOURCE SHEETS (PNG, RGBA, 1448×1086, standalone weapon objects)

A — Sword / hammer / spear / shield:

https://drive.google.com/file/d/1n3C3EFjxeubTsl-NjLjJXT6X205poe_p/view

B — Bomb / boomerang / grapple hook / cannon:

https://drive.google.com/file/d/1oSrFmF8aIo5jWGcSmf58ERmc8sasMunj/view

C — Star wand / torch / parasol / arcane wand:

https://drive.google.com/file/d/17Yy74EJAa8qfYQGQI83-\_KjZ58cPjHXE/view

SEARCHABLE PER-FAMILY ROW CROPS

Folder: https://drive.google.com/drive/folders/1OeWaZFkr9ZaC4PLsJtvkckgyc_HEMr0B

P12-A-01 Sword: https://drive.google.com/file/d/1ZAgkN_bs2qwweP1fIkSE0U3SP_G-1y5x/view

P12-A-02 Hammer: https://drive.google.com/file/d/1Xw6AlLu6JaiKxEcuUN85-W_g4gRI3kU5/view

P12-A-03 Spear: https://drive.google.com/file/d/1WJr7oSmSwu3F24N784MWY6c7f9Rr5yuk/view

P12-A-04 Shield: https://drive.google.com/file/d/1WlfrEgpK-1iu1fCsxzgGIh1dsiR07WWP/view

P12-B-01 Bomb: https://drive.google.com/file/d/1mUIZRwW4RJMFNiWFJu5Gh7KDgOkfU04v/view

P12-B-02 Boomerang: https://drive.google.com/file/d/1PokmNWMuDS-\_xSxezEB2KnAUzO3nnDnS/view

P12-B-03 Hook/grappler: https://drive.google.com/file/d/1dUL4HrUw_Lkgy3-7wDloXfLjNj6WJUdL/view

P12-B-04 Cannon: https://drive.google.com/file/d/1SH6wUaqCAjknqzUdHUuvzJ-0Ki3VJ5iN/view

P12-C-01 Star wand: https://drive.google.com/file/d/1k78RWO70FH4q0r5Fer1GMbUfDkW1iZ_C/view

P12-C-02 Torch: https://drive.google.com/file/d/1AzRXizeVn865aydaIea-8A2kcpldiRHu/view

P12-C-03 Parasol: https://drive.google.com/file/d/1C-ls-j9X63JeZjDgeYxsksgNQgoijRqO/view

P12-C-04 Arcane wand: https://drive.google.com/file/d/1vzUemUA9IJmO8-nUXkYoQWoIGCc5d1ss/view

INDEX, SPEC AND COMPLETE PACKAGE

tag_index.csv, per-weapon category and searchable tag list: https://drive.google.com/file/d/1FB2aXV0lV6G_wmusNgtl5g4HcRniVlRf/view

manifest.json, source/image dimensions + state/anchor policy: https://drive.google.com/file/d/1Hd3H5-t5e5gFPkU96nlQUT3YyVai6pm-/view

README_FOR_CLAUDE.md: https://drive.google.com/file/d/1aw0RaWtOjecTKlDog_waKP2VKw8JKo-q/view

All twelve family review contact preview: https://drive.google.com/file/d/1TBGqQQhTY17uiZm2bOdvPmAoo5OUdj58/view

Full source ZIP: https://drive.google.com/file/d/1-WokzduDHyu9j_5KzWxbOJIidFV7aDJS/view

HOW TO FIND A WEAPON

Search Asset Library for P12 or WPN-001; search the P12 tag_index.csv by 'hammer', 'grapple', 'projectile', 'utility', 'torch' etc.; open the corresponding family row rather than scanning a 3-sheet poster. For original-pixel provenance use the corresponding original source in originals/. P12 is the preferred current weapon reference over P11 carrier-embedded combat illustrations; P11 remains background/visual research only.

CRITICAL STATUS DISCLOSURE

The 3 original image-generated RGBA sheets contain varying semi-transparent pixel-edge halos, illustrative rather than guaranteed native-grid alignment, and mixed embedded swing/impact FX. The 12 row crops are grouped VISUAL SOURCE ONLY, not individual cleaned native 32px/64px weapon frames. An illustrated raised sword does not by itself prove a validated throw animation, inventory icon or human-hand pivot. Do not mark WPN-001 production-ready solely from this upload. No GitHub integration or Railway deployment was carried out here.

PER-WEAPON ACTUAL ENGINE-ASSET CONTRACT (deliver in a future native conversion)

Each family produces independent transparent sprites for applicable states:

- World: ground / dropped / landing or bounce / highlighted pickup.

- Held: right-ready / left-ready / raised / ready-to-swing or aim. The carrier is never in the sprite.

- Use: wind-up / active stroke, shot, spell, explosion or shield block / recoil / impact, depending on behavior.

- Projectile: thrown/flight/rotation/return or impact only where physically appropriate.

- Icons: small inventory icon, equipped/unavailable highlight if needed.

Store grip_anchor, pivot, hitbox and optional projectile anchor in a JSON manifest. Character-specific animation lives in the three locked H01/H02/H03 Bible folders; weapons attach by hand_anchor and draw order, not by duplication. Never invent an animation state that the game has no corresponding mechanic for.

Required QA: native alpha repaired and clean at 1×, consistent sprite footprint and pivot, test three canonical heroes holding/using one object, and compare on 320×180 actual mobile game viewport. Keep each final generated runtime file under a future "Weapons — Native Runtime" sibling with direct catalog pointers; preserve P12 immutable sources.

ROUTING

WPN-001 backlog row in Master Production Board: https://docs.google.com/spreadsheets/d/1rzixv5r4QWs7PKLYJ0e_sreLy0LjTdgua8uXKeTJpSE/edit

Canon heroes (do not redesign): https://drive.google.com/drive/folders/1rb8Oqfi-9HGI4Lwc_vIUBmAhaghkp6Zy

Asset Library: https://docs.google.com/document/d/1bnr7GUgrYBVVY0BMkwx4qRPvW45Nk4grn-Tk6THcoY8/edit

Root changelog: https://docs.google.com/document/d/17R7aKkqDxQwRk-cmywQbvQ_CcEzz4UqHz37YYYRnADs/edit
