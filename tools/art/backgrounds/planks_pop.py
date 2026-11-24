"""Draw the quarry's real one-way planks so they stand out against the painted panorama.

    python3 -I tools/art/backgrounds/planks_pop.py

Reads the four plank cells (left, mid, right, single) at row 5 of assets/tiles/quarry.png and
writes a recoloured copy of each into row 6 of the same sheet (empty until now): a bright
cream top edge, deeper and warmer wood, and a second dark row under the deck. Every quarry room
with planks (content/atlases/quarry-road.json, -ridge, -depot, -cave, -tower) points its `oneway`
cells at row 6, so a plank looks the same throughout the quarry; no other room uses this sheet.

DRAFT (the orchestrator's third-pass ruling 2 on the biome backgrounds, 2026-11-24 17:21 UTC;
docs/decisions-log.md, "Painted ledges moved off the play rows..."): the owner's iron-quarry
panorama paints crane beams and scaffold boards in the same tan wood, with the same dark outline,
as the real planks a player stands on, so the short ones read as painted. Haze on the panorama
did not help at play height; this makes the real thing pop instead. To undo: point the five
atlases' `oneway` cells back at row 5. tools/art/tiles/make.py rebuilds quarry.png without row 6
AND rewrites the atlases to row 5, so re-running it undoes this consistently; re-run this after it.
"""
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SHEET = os.path.join(ROOT, 'assets', 'tiles', 'quarry.png')
T = 16
SRC_ROW, DST_ROW = 5, 6

# Source colour -> the plank's own colour. The outline inks and the grey iron stay as they are.
RECOLOUR = {
    (0xd2, 0xcf, 0xe0): (0xff, 0xef, 0xb0),  # the deck's pale top highlight -> bright cream edge
    (0xe3, 0xa5, 0x6b): (0xf2, 0x9a, 0x3c),  # wood, light
    (0xe0, 0xa8, 0x60): (0xf6, 0xb4, 0x4c),  # wood, grain light
    (0xc0, 0x7a, 0x4a): (0xc9, 0x5f, 0x24),  # wood, mid
    (0xb9, 0x7a, 0x40): (0xb5, 0x55, 0x1e),  # wood, grain mid
    (0x94, 0x58, 0x3a): (0x86, 0x36, 0x1a),  # wood, shade
    (0x8a, 0x52, 0x30): (0x74, 0x2e, 0x14),  # wood, deep shade
    (0x6b, 0x3f, 0x2a): (0x4a, 0x1e, 0x10),  # wood, darkest
}
INK = (0x22, 0x1f, 0x44, 255)
DECK_ROWS = 6  # the deck is rows 0-5 of the cell (5 = its bottom outline); the posts hang below


def pop(cell):
    out = cell.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and (r, g, b) in RECOLOUR:
                px[x, y] = RECOLOUR[(r, g, b)] + (a,)
    # The top edge: the deck's row 1 is cream all the way across, wherever it is wood.
    for x in range(w):
        r, g, b, a = px[x, 1]
        if a and (r, g, b, a) != INK and (r, g, b) not in ((0x2b, 0x21, 0x40),):
            px[x, 1] = (0xff, 0xef, 0xb0, 255)
    # A dark underside: one more ink row under the deck wherever nothing hangs below it.
    for x in range(w):
        if px[x, DECK_ROWS - 1][3] and not px[x, DECK_ROWS][3]:
            px[x, DECK_ROWS] = INK
    return out


def main():
    sheet = Image.open(SHEET).convert('RGBA')
    for c in range(4):
        src = sheet.crop((c * T, SRC_ROW * T, (c + 1) * T, (SRC_ROW + 1) * T))
        # Row 6 was empty in make.py's sheet; re-running overwrites only this tool's own output.
        sheet.paste(pop(src), (c * T, DST_ROW * T))
    sheet.save(SHEET, optimize=True)
    print(f'{SHEET}: row {DST_ROW} cols 0-3 written from row {SRC_ROW}')


if __name__ == '__main__':
    main()
