"""Draws the ground lane's pictures and writes its content files.

    python3 -I tools/art/tiles/make.py [--no-round2-fields]

Rewrites assets/tiles/*.png, assets/backdrops/*.png, content/atlases/*.json and
content/backdrops/*.json. Same bytes every run. `--no-round2-fields` leaves out the round-2
fields (`deep`, `regions`, `outside`, `pin`, `front`) for a check that does not know them yet.

DRAFT: every picture here is a stand-in drawn by this program; a delivered sheet from the
asset desk replaces one by editing the content file (docs/mechanisms/art-pipeline.md).
Round 2 (handoff-prompts/look2-ground.md): bevelled blocks, chunky lips, thick ledges, regions,
ground under the floor, deeper backdrops, a foreground strip, lit interiors.
"""
import json
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

import backdrops as B  # noqa: E402
from common import (ASSETS, C, CLEAR, CONTENT, DEEP_CELLS, FILL, INNER, ONEWAY, ORIGIN, T,  # noqa: E402
                    TOP_CELLS, UNDER_CELLS, WALL_CELLS, region_cells)
from themes import THEMES, canopy_region, eave_region, roof_region, street_region  # noqa: E402

ROUND2 = '--no-round2-fields' not in sys.argv

# Which regions each theme carries, in sheet order (region i -> rows 8+4i .. 11+4i).
REGIONS = {
    'grass-ruins': [('canopy', canopy_region)],
    'town': [('street', street_region), ('roof-red', lambda: roof_region(C['red'])),
             ('roof-blue', lambda: roof_region(C['blue'])), ('eave', eave_region)],
}

# DRAFT: the rectangles, chosen from each room's layout (rows, buildings), never from where its
# secrets are (handoff-prompts/look2-ground.md, "Traps"). [x, y, w, h] in room tiles.
ROOM_REGIONS = {
    'courtyard': [('canopy', [0, 0, 30, 1])],
    'castle-street': [('eave', [0, 0, 48, 1]), ('roof-red', [24, 3, 10, 1]), ('roof-blue', [10, 5, 8, 2]),
                      ('street', [0, 11, 48, 1])],
}

ROOM_THEME = {
    'courtyard': 'grass-ruins',
    'castle-street': 'town',
    'throne-room': 'castle',
    'hall-gallery': 'castle',
    'graybox-hall': 'castle',
    'undercroft': 'cellar',
    # DRAFT (Step 11 slice B): the cantina borrows the town's plaster, timbers and board floor, which
    # read as a tavern's inside; `castle` is the other candidate (one word here).
    'cantina': 'town',
}

# How often each fill is picked (cells may repeat to weight them): plain blocks most often.
FILL_WEIGHTS = [0, 0, 1, 3, 1, 2, 4, 5, 6, 7, 8, 0, 3]


def build_sheet(theme):
    regions = REGIONS.get(theme.name, [])
    h = (8 + 4 * len(regions)) * T if regions else 8 * T
    sheet = Image.new('RGBA', (8 * T, h), CLEAR)

    def place(img, cell):
        sheet.paste(img, (cell[0] * T, cell[1] * T))

    for idx in range(16):
        place(theme.tile(idx), [ORIGIN[0] + idx % 4, ORIGIN[1] + idx // 4])
    fills = theme.fills()
    for v, cell in enumerate(FILL):
        if v:  # FILL[0] is the block's own index-15 cell; make it the plain fill too
            place(fills[v], cell)
    place(fills[0], FILL[0])
    for corner, cell in INNER.items():
        place(theme.inner(corner), cell)
    for img, cell in zip(theme.tops(), TOP_CELLS):
        place(img, cell)
    for img, cell in zip(theme.unders(), UNDER_CELLS):
        place(img, cell)
    for kind, cell in ONEWAY.items():
        place(theme.oneway(kind), cell)
    for img, cell in zip(theme.walls(), WALL_CELLS):
        place(img, cell)
    for img, cell in zip(theme.deep(), DEEP_CELLS):
        place(img, cell)
    meta = {}
    for i, (name, make) in enumerate(regions):
        r = make()
        cells = region_cells(i)
        for idx in range(16):
            place(r['block'][idx], [cells['origin'][0] + idx % 4, cells['origin'][1] + idx // 4])
        for img, cell in zip(r['fill'], cells['fill']):
            place(img, cell)
        for img, cell in zip(r['top'], cells['top']):
            place(img, cell)
        for img, cell in zip(r['under'], cells['under']):
            place(img, cell)
        meta[name] = (r, cells)
    return sheet, meta


def listing(src, order):
    return [[-1, -1] if i is None else src[i] for i in order]


def atlas_json(room, theme, meta):
    auto = {
        'origin': ORIGIN,
        'innerCorners': INNER,
        'fill': [FILL[i] for i in FILL_WEIGHTS],
        'top': listing(TOP_CELLS, theme.top_list) if theme.top_list else [[-1, -1]],
        'under': listing(UNDER_CELLS, theme.under_list) if theme.under_list else [[-1, -1]],
        'oneway': ONEWAY,
    }
    if not ROUND2 and room == 'castle-street':
        # DRAFT: until regions are accepted, the street draws everything in its cobble stone (round 1
        # did the same with one stone course), never plaster with a board floor for a street.
        r, cells = meta['street']
        auto['origin'] = cells['origin']
        auto['fill'] = cells['fill']
    if ROUND2 and theme.deep():
        auto['deep'] = DEEP_CELLS[:len(theme.deep())]
    if ROUND2 and room in ROOM_REGIONS:
        regs = []
        for name, rect in ROOM_REGIONS[room]:
            r, cells = meta[name]
            reg = {'tiles': rect, 'origin': cells['origin'], 'fill': cells['fill'][:len(r['fill'])]}
            if r['top_list']:
                reg['top'] = listing(cells['top'], r['top_list'])
            if r['under_list']:
                reg['under'] = listing(cells['under'], r['under_list'])
            regs.append(reg)
        auto['regions'] = regs
    return {
        '//': 'DRAFT: stand-in drawn by tools/art/tiles/make.py (theme "%s", round 2); a delivered tile sheet replaces it by editing this file. Notes: tools/art/tiles/README.md.' % theme.name,
        'id': room,
        'image': 'tiles/%s.png' % theme.name,
        'tile': T,
        'cells': {'solid': FILL[0], 'solidTop': [ORIGIN[0] + 14 % 4, ORIGIN[1] + 14 // 4], 'oneway': ONEWAY['mid']},
        'autotile': auto,
    }


def hexs(c):
    return '#%02x%02x%02x' % c[:3]


P_SKY = ['#5fb4f0', '#8fd0fa', '#c4e9ff']


def layer(image, parallax, y, offset, pin=None, front=False, **extra):
    d = {'image': image, 'parallax': parallax, 'y': y, 'offsetY': offset, 'repeatX': True}
    if ROUND2 and pin:
        d['pin'] = pin
    if ROUND2 and front:
        d['front'] = True
    d.update(extra)
    return d


def backdrop_json(room, by_name):
    note = 'DRAFT: stand-in drawn by tools/art/tiles/make.py (round 2). Notes: tools/art/tiles/README.md.'
    sky = [P_SKY[0], P_SKY[2]]
    outdoor = {'above': 'sky', 'below': 'deep'}
    if room == 'courtyard':
        d = {'//': note + ' Layers below the clouds are pinned to the room so they stay behind it in a tall view; the front strip sits in the ground under the floor line.',
             'id': room, 'sky': sky, 'layers': [
                 layer('backdrops/sky-clouds.png', 0.1, 'top', 4),
                 layer('backdrops/far-hills.png', 0.25, 'bottom', -40, 'room'),
                 layer('backdrops/castle-mid.png', 0.5, 'bottom', -8, 'room'),
             ]}
        if ROUND2:
            d['layers'].append(layer('backdrops/front-foliage.png', 1, 'bottom', 16, 'room', True))
            d['outside'] = outdoor
        return d
    if room == 'castle-street':
        d = {'//': note + ' Layers below the clouds are pinned to the room so they stay behind it in a tall view; the front strip sits in the ground under the floor line.',
             'id': room, 'sky': sky, 'layers': [
                 layer('backdrops/sky-clouds.png', 0.1, 'top', 4),
                 layer('backdrops/far-castle.png', 0.2, 'bottom', -52, 'room'),
                 layer('backdrops/town-mid.png', 0.5, 'bottom', -8, 'room'),
             ]}
        if ROUND2:
            d['layers'].append(layer('backdrops/front-foliage.png', 1, 'bottom', 16, 'room', True))
            d['outside'] = outdoor
        return d
    castle, cellar = by_name['castle'], by_name['cellar']
    if room in ('throne-room', 'hall-gallery'):
        c = hexs(castle.wall_body)
        return {'//': note + ' DRAFT: no "wall" here on purpose: the one layer is the back wall itself, with windows and pillars, moving slower than the room; add "wall" (cells [0,6]..[3,6] of tiles/castle.png) to go back to a flat wall that moves with the room.',
                'id': room, 'sky': [c, c], 'layers': [
                    layer('backdrops/castle-hall.png', 0.75, 'top', 0 if room == 'throne-room' else -24, parallaxY=0.75),
                ]}
    if room == 'undercroft':
        c = hexs(cellar.wall_body)
        return {'//': note + ' DRAFT: no "wall" here on purpose: the one layer is the back wall itself, with vaults and piers, moving slower than the room; add "wall" (cells [0,6]..[3,6] of tiles/cellar.png) to go back to a flat wall that moves with the room.',
                'id': room, 'sky': [c, c], 'layers': [
                    layer('backdrops/cellar-vault.png', 0.75, 'top', -12, parallaxY=0.75),
                ]}
    c = hexs(castle.wall_body)
    return {'//': note, 'id': room, 'sky': [c, c], 'layers': [],
            'wall': {'image': 'tiles/castle.png', 'tile': T, 'cells': WALL_CELLS}}


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def save(img, rel):
    path = os.path.join(ASSETS, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=False)


def main():
    by_name, metas = {}, {}
    for theme in THEMES:
        by_name[theme.name] = theme
        sheet, meta = build_sheet(theme)
        metas[theme.name] = meta
        save(sheet, 'tiles/%s.png' % theme.name)
    save(B.make_clouds(), 'backdrops/sky-clouds.png')
    save(B.make_far_hills(), 'backdrops/far-hills.png')
    save(B.make_far_castle(), 'backdrops/far-castle.png')
    save(B.make_castle_mid(), 'backdrops/castle-mid.png')
    save(B.make_town_mid(), 'backdrops/town-mid.png')
    save(B.make_front_foliage(), 'backdrops/front-foliage.png')
    save(B.make_castle_hall(by_name['castle']), 'backdrops/castle-hall.png')
    save(B.make_cellar_vault(by_name['cellar']), 'backdrops/cellar-vault.png')
    for room, name in ROOM_THEME.items():
        write_json(os.path.join(CONTENT, 'atlases', room + '.json'), atlas_json(room, by_name[name], metas[name]))
        write_json(os.path.join(CONTENT, 'backdrops', room + '.json'), backdrop_json(room, by_name))
    print('ground lane: wrote 4 tile images, 8 backdrop images, %d atlas files, %d backdrop files%s'
          % (len(ROOM_THEME), len(ROOM_THEME), '' if ROUND2 else ' (without round-2 fields)'))


if __name__ == '__main__':
    main()
