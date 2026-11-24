"""The start screen's title picture, re-authored from the owner's Drive asset.

Run from the repository root:  python3 -I tools/art/title/make.py

Reads the design-library mirror's copy of the owner's title screen
(Drive: /03 Visual Direction and Assets/Current Pixel-Art Explorations/
Irreverents_Title_Screen_Concept_2026-11-23.png, 1672 x 941), and writes:

  assets/ui/title-screen.png   the picture on the native 320 x 180 grid
  content/looks/title.json     two looks cut from it: the whole picture,
                               and the wordmark's box (the start screen
                               keeps its buttons below that box)

Re-authoring, not redrawing (docs/mechanisms/art-pipeline.md): each
320 x 180 cell is the average of the source pixels it covers (the source's
own "pixels" are about 5.2 of its pixels wide, so the average lands on
one), then the whole picture is cut to 64 colours with no dithering, so
every pixel is a hard flat colour. Opaque throughout (a full-screen
picture has no transparency). Deterministic: two runs give the same bytes.

DRAFT: 64 colours and the averaging were chosen by eye against a
nearest-neighbour pick (speckled lettering); the wordmark box was read off
the result. The owner's file is labelled a concept; in use is not canon
(D-096).
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SOURCE = os.path.join(
    ROOT, 'docs', 'design-library', '03-visual-direction-and-assets', 'current-pixel-art-explorations',
    'irreverents-title-screen-concept-2026-11-23.png')
OUT_IMAGE = 'ui/title-screen.png'
OUT_CONTENT = os.path.join(ROOT, 'content', 'looks', 'title.json')
W, H = 320, 180
COLOURS = 64
# [x, y, w, h] on the 320 x 180 grid: the plaque with its lettering, the
# compass star's points and the ribbons. Nothing the start screen shows may
# cover it.
WORDMARK = [52, 4, 212, 68]


def main():
    if not os.path.exists(SOURCE):
        sys.exit(f'missing {SOURCE}: run python3 -I tools/drive_sync.py first')
    src = Image.open(SOURCE).convert('RGB')
    small = src.resize((W, H), Image.BOX)
    # Kept as a 64-colour palette image: the same pixels in a third of the bytes.
    flat = small.quantize(colors=COLOURS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = os.path.join(ROOT, 'assets', OUT_IMAGE)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    flat.save(out, optimize=True)
    group = {
        '//': ('DRAFT: the owner\'s title screen (Drive: Current Pixel-Art Explorations/'
               'Irreverents_Title_Screen_Concept_2026-11-23.png, a concept), re-authored to 320x180 by '
               'tools/art/title/make.py. start-title-screen is the whole picture; start-title-wordmark is the box '
               'the start screen keeps clear. With this file gone the start screen draws its old pixel-font title.'),
        'id': 'title',
        'image': OUT_IMAGE,
        'looks': {
            'start-title-screen': {'src': [0, 0, W, H]},
            'start-title-wordmark': {'src': WORDMARK},
        },
    }
    with open(OUT_CONTENT, 'w') as f:
        json.dump(group, f, indent=2)
        f.write('\n')
    print(f'wrote assets/{OUT_IMAGE} ({W}x{H}, {COLOURS} colours) and content/looks/title.json')


if __name__ == '__main__':
    main()
