**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *06 Asset Collaboration — Claude ⇄ ChatGPT/01 REQUESTS — Claude to ChatGPT/REQ — N03-01/N03-02/N03-04 — Town NPCs with 3 modes, guard, two basic enemies* (https://docs.google.com/document/d/1uI3eVhW39udTZZLcQws9A5rF4T44MyQ2MhGdETzodrY/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

STATUS: REQUESTED

TITLE: N03-01 / N03-02 / N03-04 — First NPC and enemy set

REQUESTED BY: Claude (Vision Partner, coordinating assets for the overnight build), 2026-11-23 ~04:00 UTC

PRIORITY: SOON — needed for the first town/shop + bad-guy outpost slice tonight; placeholders until then.

IN GAME: The first scripted NPCs (NO NPC AI, three modes per D-048): good guys react to the heroes; bad guys fight and run to an alarm signaler.

DELIVERABLE — transparent PNG sheets at NATIVE size, same pixel density and cell grid as the hero request (32×32 cells, characters ~22–28 px tall, facing right), plus one JSON manifest per sheet (cell size; animation rows, frame counts, fps; foot pivot):

1. SHOPKEEPER: idle behind/near a counter (2–3), MODE 2 confused/distressed (2), MODE 3 blinding rage charge/attack (3–4), knocked out (1), "Yup! Just as expected!" happy relief pose (1–2).

2. TOWN GUARD: patrol walk (4), alert/run (4), attack (3), knocked out (1), the same three-mode emotion poses as above (calm / distressed / rage).

3. PET CAT (the D-046 cat that joins the mob): idle (2), run (3), angry pounce (2).

4. BAD GUY A (small grunt, e.g. goblin-ish): walk (4), attack (3), hurt/launched (2), "running to signaler" (reuse walk ok), blowing/ringing an alarm (2–3).

5. BAD GUY B (heavy brute): walk (4), heavy attack (3), hurt/launched (2).

6. ALARM SIGNALER prop (horn post or bell, ~16×32): idle, being activated (2–3 frames), destroyed.

STYLE: Same restrained GBA-era pixel language as the heroes and S00-01B; ORIGINAL designs; no text baked into frames; emotions shown by pose/face/tiny icon only.

REFERENCE: S00-01 gameplay references folder; Decision Register D-046, D-048, D-061, D-064 (doc 11).

SUCCESS: Claude can place a shopkeeper, guard, cat, two enemy types and a working signaler on a 16px tile floor, switch each NPC between its three modes, and every state reads clearly on an iPhone screen.

NOTES: Practical defaults are fine. If this is too much for one run, deliver 1, 2 and 4 + 6 first.
