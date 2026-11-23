"""Each round-3 sprite beside the source pose it was cut from, at the same display size.

    python3 -I tools/art/cast/compare.py <out dir>

DRAFT: a lane tool for judging the look (handoff-prompts/look3-cast.md, "Done").
Left: the plate's rectangle shrunk to the sprite's height (smooth), right: the
sprite (nearest), both then shown at 4x on the castle lilac.
"""
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

import source  # noqa: E402

PAIRS = [  # id, plate, rectangle, scale
    ('brawler', 'cantina', (48, 593, 216, 790), 0.175),
    ('brawler-punch', 'cantina', (776, 606, 935, 790), 0.175),
    ('skirmisher', 'cantina', (66, 349, 190, 545), 0.15),
    ('outpost-fighter', 'p07enemy', (819, 79, 880, 176), 0.32),
    ('outpost-fighter-idle', 'p07enemy', (34, 78, 123, 176), 0.32),
    ('outpost-lookout', 'p07enemy', (679, 236, 790, 352), 0.285),
    ('signal-post', 'villains', (100, 812, 300, 1032), 0.16),
]
PAIRS2 = [  # push 2: the town's four (the villain's top hat is added after the cut: see cut3.villain)
    ('guard', 'town', (33, 353, 147, 512), 0.22, ('purple', 'stone', 'night')),
    ('guard-thrust', 'town', (589, 368, 729, 512), 0.22, ('purple', 'stone', 'night')),
    ('king', 'town', (35, 580, 189, 765), 0.215),
    ('king-ko (P07)', 'p07npc', (1279, 795, 1412, 870), 0.29),
    ('shopkeeper', 'town', (115, 98, 286, 280), 0.16),
    ('shopkeeper-ko', 'town', (1110, 172, 1318, 280), 0.16),
    ('villain', 'villains', (22, 151, 152, 290), 0.24),
]
BG = (129, 121, 184, 255)


def main(out):
    os.makedirs(out, exist_ok=True)
    one(out, PAIRS, 'source-vs-sprite-push1.png')
    one(out, PAIRS2, 'source-vs-sprite-push2.png')


def one(out, pairs, fname):
    tiles = []
    for name, key, rect, k, *drop in pairs:
        W, H, px = source.plate(key)
        src = Image.open(os.path.join(source.LIB, source.SHEETS[key])).convert('RGBA').crop(rect)
        cutim, _ = source.cut(key, rect, k, drop=drop[0] if drop else ())
        small = src.resize((max(1, round(src.width * k)), max(1, round(src.height * k))), Image.LANCZOS)
        h = max(small.height, cutim.height) + 4
        t = Image.new('RGBA', (small.width + cutim.width + 12, h), BG)
        t.alpha_composite(small, (2, h - 2 - small.height))
        t.alpha_composite(cutim, (small.width + 10, h - 2 - cutim.height))
        tiles.append(t)
    W = max(t.width for t in tiles)
    H = sum(t.height for t in tiles)
    sheet = Image.new('RGBA', (W, H), BG)
    y = 0
    for t in tiles:
        sheet.alpha_composite(t, (0, y))
        y += t.height
    sheet.resize((W * 4, H * 4), Image.NEAREST).save(os.path.join(out, fname))


if __name__ == '__main__':
    main(sys.argv[1])
