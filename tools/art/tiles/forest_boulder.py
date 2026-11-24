"""The forest's boulder (Step 15 push 4c): assets/sprites/cast/forest-boulder.png.

    python3 -I tools/art/tiles/forest_boulder.py

DRAFT: cut from the owner's approved P10 TRN-02 row (stone walls, rocks, stairs): its large round
rock (source x 1295-1358, y 39-91 of row-crops/trn-02-stone-walls-rocks-stairs.png, read from git's
object store when the blob-limited checkout leaves it out), downsampled at ~2.45 source px per art
pixel to 26 x 22 by the median of each block (forest.py's resample), mapped to the master palette's
stone ramp, with a cap of moss (foliage) over its top three rows so it reads as a forest stone.
Same layout as the crates' sheets (8 x 3 cells of 32 px): idle 0; air 8-11 (the stone turned a
quarter each frame); hurt 16-17 (the same stone). Same bytes every run.
"""
import os
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

import plates as PL  # noqa: E402
from common import ASSETS, C, CLEAR, ROOT  # noqa: E402
from forest import resample  # noqa: E402

REPO = ('docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/'
        'p10-owner-selected-tagged-terrain-and-interactables/row-crops/trn-02-stone-walls-rocks-stairs.png')
SRC = os.path.join(ROOT, REPO)
if not os.path.exists(SRC):
    blob = subprocess.run(['git', '-C', ROOT, 'show', 'HEAD:' + REPO], capture_output=True).stdout
    SRC = os.path.join(tempfile.mkdtemp(), 'trn-02.png')
    open(SRC, 'wb').write(blob)

ST, INK, MOSS = C['stone'], C['ink'], C['foliage']
# DRAFT: measured TRN-02 rock tones (light face, body, shade, outline) and the master colour each becomes.
PAIRS = [((236, 232, 246), ST[3]), ((205, 199, 236), ST[3]), ((176, 169, 219), ST[2]), ((150, 142, 205), ST[1]),
         ((122, 115, 192), ST[1]), ((95, 86, 160), ST[0]), ((70, 60, 120), INK[1]), ((45, 35, 85), INK[0])]
rock_map = PL.pairs_map(PAIRS)
BOX = (1295, 39, 1359, 92)
SIZE = (26, 22)


def stone():
    img = resample(Image.open(SRC).convert('RGBA'), *BOX, *SIZE, rock_map)
    # The rock's brightest highlights read as the plate's white matte: fill each row's holes
    # between its outline with the lightest stone (as forest.py fills the mushroom cap's spots).
    for y in range(img.height):
        xs = [x for x in range(img.width) if img.getpixel((x, y))[3]]
        for x in range(xs[0], xs[-1] + 1) if xs else ():
            if not img.getpixel((x, y))[3]:
                img.putpixel((x, y), ST[3])
    # Moss: a cap over the top of the stone. In each column the first opaque pixel stays outline
    # (ink), the next three to four (fewer toward the sides, none below 40% of the height) become
    # foliage, light at the top; a position hash leaves a ragged lower edge.
    for x in range(img.width):
        ys = [y for y in range(img.height) if img.getpixel((x, y))[3]]
        if not ys:
            continue
        top = ys[0]
        img.putpixel((x, top), INK[0])
        edge = min(x, img.width - 1 - x)
        depth = (1 if edge < 3 else 3 if edge < 7 else 4) + (x * 7 + 1) % 3 // 2
        for k in range(1, depth + 1):
            y = top + k
            if y >= img.height * 0.45 or not img.getpixel((x, y))[3]:
                break
            img.putpixel((x, y), MOSS[3] if k == 1 else MOSS[2] if k < depth else MOSS[1])
    return img


def main():
    rock = stone()
    sheet = Image.new('RGBA', (256, 96), CLEAR)
    # The body box is 24 x 22 (content/characters/forest-boulder.json) at anchor (4, 10) of a 32 cell.
    def put(img, cell):
        cx, cy = (cell % 8) * 32, (cell // 8) * 32
        sheet.paste(img, (cx + 16 - img.width // 2, cy + 32 - img.height), img)
    put(rock, 0)
    for i, deg in enumerate((0, 90, 180, 270)):
        put(rock.rotate(-deg, expand=True), 8 + i)
    put(rock, 16)
    put(rock, 17)
    path = os.path.join(ASSETS, 'sprites', 'cast', 'forest-boulder.png')
    sheet.save(path, optimize=False)
    print('forest_boulder.py: wrote', path)


if __name__ == '__main__':
    main()
