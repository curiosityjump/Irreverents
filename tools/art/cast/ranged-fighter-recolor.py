"""DRAFT (Step 24 slice 1b): the thrower's stand-in sheet, made from the toll
keeper's cut sheet by swapping its purple ramp for the bandits' red (the
outpost fighter's hood ramp), so he carries the camp's colour, the bad guys'
mark, with no new drawing. Deterministic; re-run after the toll keeper's
sheet changes:  python3 tools/art/cast/ranged-fighter-recolor.py
When the art desk cuts P08's ranged poses, content/sprites/ranged-fighter.json
points at them and this script and its output can go (D-097)."""
from PIL import Image

SRC = 'assets/sprites/cast/toll-keeper.png'
OUT = 'assets/sprites/cast/ranged-fighter.png'
# toll keeper's purple ramp -> outpost fighter's red ramp (both from the cast's one palette)
SWAP = {
    (0xa0, 0x70, 0xe8): (0xf0, 0x59, 0x6a),
    (0x74, 0x44, 0xb8): (0xc8, 0x32, 0x4a),
    (0x4a, 0x2a, 0x7a): (0x8a, 0x1c, 0x3a),
}

im = Image.open(SRC).convert('RGBA')
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a and (r, g, b) in SWAP:
            px[x, y] = SWAP[(r, g, b)] + (a,)
im.save(OUT, optimize=True)
