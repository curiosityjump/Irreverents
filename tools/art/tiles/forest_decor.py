"""The forest trail's pocket backs (Step 15 push 4): content/decor/forest-trail.json.

    python3 -I tools/art/tiles/forest_decor.py

Every empty or one-way tile of each pocket underground gets a `far` decor item (drawn into the
room's cached picture, behind the ground) cut from tiles/forest.png's cave-back cells [0..3, 6]
(tools/art/tiles/forest.py, cave_back), so a hollow shows dark earth instead of the sky backdrop.
Same bytes every run.

DRAFT: the pockets are rectangles read off content/rooms/forest-trail.json by hand (its `areas`,
plus the crawl, the drops into the tunnel and the chamber, the east shaft and the deep level). The
open-air parts (the west ravine with the entrance, the canopy, the trail above row 9) keep the sky.
If the room's rows change, re-run this. To undo: delete content/decor/forest-trail.json.
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ROOM = os.path.join(ROOT, 'content', 'rooms', 'forest-trail.json')
OUT = os.path.join(ROOT, 'content', 'decor', 'forest-trail.json')

# (first column, last column, first row, last row), inclusive.
POCKETS = [
    (24, 29, 8, 8),     # the crawl under the low roof
    (28, 29, 9, 9),     # its drop into the root tunnel
    (26, 38, 9, 12),    # root-tunnel (and its hatch up at 36-37)
    (62, 73, 9, 12),    # gate-chamber (and the hatch over it)
    (80, 89, 9, 12),    # stone-hollow (and its stone door)
    (94, 98, 9, 14),    # the east shaft down to the deep level
    (15, 98, 15, 18),   # the deep level (deep-pocket and the way back west)
]


def main():
    room = json.load(open(ROOM))
    rows = room['rows']
    seen, items = set(), []
    for c0, c1, r0, r1 in POCKETS:
        for ty in range(r0, r1 + 1):
            for tx in range(c0, c1 + 1):
                if (tx, ty) in seen or rows[ty][tx] == '#':
                    continue
                seen.add((tx, ty))
                v = (tx * 7 + ty * 13) % 4
                items.append({'image': 'tiles/forest.png', 'src': [v * 16, 96, 16, 16], 'tx': tx, 'ty': ty,
                              'dx': 0, 'dy': 0, 'layer': 'far', 'flip': False})
    items.sort(key=lambda it: (it['ty'], it['tx']))
    lines = ['{',
             '  "//": "DRAFT: written by tools/art/tiles/forest_decor.py (Step 15 push 4): the dark earth behind each pocket underground, so a hollow does not show the sky backdrop; cut from tiles/forest.png row 6 (tools/art/tiles/forest.py, cave_back).",',
             '  "id": "forest-trail",',
             '  "items": [']
    lines += ['    ' + json.dumps(it, separators=(', ', ': ')) + (',' if i < len(items) - 1 else '') for i, it in enumerate(items)]
    lines += ['  ]', '}', '']
    open(OUT, 'w').write('\n'.join(lines))
    print('forest_decor.py: %d items' % len(items))


if __name__ == '__main__':
    main()
