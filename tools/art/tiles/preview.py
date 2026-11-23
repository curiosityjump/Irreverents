"""A small, faithful reference renderer for the tiles lane, and its contact sheets.

    python3 -I tools/art/tiles/preview.py

Writes tools/art/tiles/preview/ (git-ignored): each tile image at 4x with a grid, the seam
tests, and 320x180 views of every map room at several camera positions (4x, NEAREST).
It reads the real room files and the real atlas and backdrop files, and applies the
contract's rules the way the notes file (README.md, "How the contract was read") says.
"""
import json
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw  # noqa: E402

from common import ASSETS, CONTENT, HERE, T, rgb, sky_bands, tile_hash  # noqa: E402

OUT = os.path.join(HERE, 'preview')
_images = {}


def image(rel):
    if rel not in _images:
        _images[rel] = Image.open(os.path.join(ASSETS, rel)).convert('RGBA')
    return _images[rel]


def load(kind, room):
    with open(os.path.join(CONTENT, kind, room + '.json')) as f:
        return json.load(f)


class Room:
    def __init__(self, data):
        self.rows = data['rows']
        self.h = len(self.rows)
        self.w = len(self.rows[0])
        legend = data['legend']
        parts = {p['id']: p for p in data.get('parts', [])}
        doors = {d['id']: d for d in data.get('doors', [])}
        self.kind = {}
        self.looks = set()
        for ty, row in enumerate(self.rows):
            for tx, ch in enumerate(row):
                m = legend[ch]
                k = m if isinstance(m, str) else 'empty'
                self.kind[(tx, ty)] = k
                wall = k == 'solid'
                if isinstance(m, dict) and 'part' in m:
                    p = parts[m['part']]
                    wall = p['kind'] == 'false-wall' or (p['kind'] == 'breakable' and p.get('params', {}).get('look') != 'window')
                if isinstance(m, dict) and 'door' in m:
                    d = doors[m['door']]
                    wall = bool(d.get('hidden')) and d.get('use') == 'walk'
                if wall:
                    self.looks.add((tx, ty))

    def inside(self, tx, ty):
        return 0 <= tx < self.w and 0 <= ty < self.h

    def solid(self, tx, ty):
        """Looks solid: outside the room counts."""
        return not self.inside(tx, ty) or (tx, ty) in self.looks

    def oneway(self, tx, ty):
        return self.kind.get((tx, ty)) == 'oneway'


def cell(sheet, c):
    return sheet.crop((c[0] * T, c[1] * T, c[0] * T + T, c[1] * T + T))


def region_of(a, tx, ty):
    for r in a.get('regions', []):
        x, y, w, h = r['tiles']
        if x <= tx < x + w and y <= ty < y + h:
            return r
    return None


def draw_ground(view, room, atlas, ox, oy, outside=None):
    """Ground, top and under pieces, one-way runs. (ox, oy) is where the room's top-left is on the view.
    outside: the backdrop's `outside` ({above: fill|sky, below: fill|deep})."""
    sheet = image(atlas['image'])
    a = atlas['autotile']
    outside = outside or {}
    tx0, ty0 = (-ox) // T - 1, (-oy) // T - 1
    for ty in range(ty0, ty0 + view.height // T + 3):
        for tx in range(tx0, tx0 + view.width // T + 3):
            x, y = ox + tx * T, oy + ty * T
            if ty < 0 and outside.get('above') == 'sky':
                continue
            if ty >= room.h and outside.get('below') == 'deep' and a.get('deep'):
                paste_clipped(view, cell(sheet, a['deep'][tile_hash(tx, ty, 4) % len(a['deep'])]), x, y)
                continue
            if room.solid(tx, ty):
                reg = region_of(a, tx, ty) or a
                idx = room.solid(tx, ty - 1) * 1 + room.solid(tx + 1, ty) * 2 + room.solid(tx, ty + 1) * 4 + room.solid(tx - 1, ty) * 8
                if idx == 15:
                    fills = reg.get('fill') or a['fill']
                    c = fills[tile_hash(tx, ty, 0) % len(fills)]
                else:
                    c = [reg['origin'][0] + idx % 4, reg['origin'][1] + idx // 4]
                paste_clipped(view, cell(sheet, c), x, y)
                if idx == 15:
                    for name, (dx, dy) in (('nw', (-1, -1)), ('ne', (1, -1)), ('sw', (-1, 1)), ('se', (1, 1))):
                        if not room.solid(tx + dx, ty + dy):
                            paste_clipped(view, cell(sheet, a['innerCorners'][name]), x, y)
                # pieces in the plain empty tile above a top surface / below an underside
                for dy, key, salt in ((-1, 'top', 1), (1, 'under', 2)):
                    lst = reg.get(key, a[key]) if reg is not a else a[key]
                    if room.inside(tx, ty + dy) and not room.solid(tx, ty + dy) and not room.oneway(tx, ty + dy) and lst:
                        c = lst[tile_hash(tx, ty, salt) % len(lst)]
                        if c[0] >= 0:
                            paste_clipped(view, cell(sheet, c), x, y + dy * T)
            elif room.oneway(tx, ty):
                joins = lambda qx: room.oneway(qx, ty) or (room.solid(qx, ty))
                l, r = joins(tx - 1), joins(tx + 1)
                name = 'mid' if l and r else 'left' if r else 'right' if l else 'single'
                paste_clipped(view, cell(sheet, a['oneway'][name]), x, y)


def paste_clipped(view, img, x, y):
    layer = Image.new('RGBA', view.size, (0, 0, 0, 0))
    layer.paste(img, (x, y))
    view.alpha_composite(layer)


def draw_layer(view, layer, room, ox, oy):
    vw, vh = view.size
    cam_x, cam_y = max(0, -ox), max(0, -oy)
    img = image(layer['image'])
    left = int(round(-cam_x * layer['parallax']))
    if layer.get('pin') == 'room':
        base = oy if layer['y'] == 'top' else oy + room.h * T - img.height
        top = base + layer.get('offsetY', 0)
    else:
        base = 0 if layer['y'] == 'top' else vh - img.height
        top = base + layer.get('offsetY', 0) - int(round(cam_y * layer.get('parallaxY', 0)))
    if layer.get('repeatX'):
        left = left % img.width - img.width
        while left < vw:
            paste_clipped(view, img, left, top)
            left += img.width
    else:
        paste_clipped(view, img, left, top)


def draw_backdrop(view, room, back, ox, oy):
    vw, vh = view.size
    rows = sky_bands(back['sky'][0], back['sky'][1], vh)
    px = view.load()
    for y in range(vh):
        for x in range(vw):
            px[x, y] = rows[y]
    for layer in back.get('layers', []):
        if not layer.get('front'):
            draw_layer(view, layer, room, ox, oy)
    wall = back.get('wall')
    if wall:
        sheet = image(wall['image'])
        for ty in range(room.h):
            for tx in range(room.w):
                if not room.solid(tx, ty):
                    c = wall['cells'][tile_hash(tx, ty, 3) % len(wall['cells'])]
                    paste_clipped(view, cell(sheet, c), ox + tx * T, oy + ty * T)


def origin(room, vw, vh, fx, fy):
    def along(size, view, at):
        if size <= view:
            return (view - size) // 2
        return -max(0, min(size - view, int(round(at - view / 2))))
    return along(room.w * T, vw, fx), along(room.h * T, vh, fy)


def render(room_id, fx, fy, vw=320, vh=180):
    room = Room(load('rooms', room_id))
    view = Image.new('RGBA', (vw, vh), (0, 0, 0, 255))
    ox, oy = origin(room, vw, vh, fx, fy)
    back = load('backdrops', room_id)
    draw_backdrop(view, room, back, ox, oy)
    draw_ground(view, room, load('atlases', room_id), ox, oy, back.get('outside'))
    for layer in back.get('layers', []):
        if layer.get('front'):
            draw_layer(view, layer, room, ox, oy)
    return view


def big(img, k=4):
    return img.resize((img.width * k, img.height * k), Image.NEAREST)


def sheet_preview(name):
    img = image('tiles/%s.png' % name)
    bg = Image.new('RGBA', img.size, rgb('#8fd0fa'))
    bg.alpha_composite(img)
    out = big(bg)
    d = ImageDraw.Draw(out)
    for i in range(0, out.width + 1, T * 4):
        d.line([(i, 0), (i, out.height)], fill=(0, 0, 0, 90))
        d.line([(0, i), (out.width, i)], fill=(0, 0, 0, 90))
    out.save(os.path.join(OUT, 'sheet-%s.png' % name))


SEAM_ROWS = [
    '......................',
    '.####..#..###...#.#...',
    '.####.....#.#..###....',
    '.####..#..###...#..##.',
    '.####..#.......##..##.',
    '.......#..####........',
    '.##.#......#...######.',
    '.#..##..#.###..######.',
    '.##.#..........######.',
    '..........====.######.',
    '.=..==..#==#...######.',
    '......................',
]


def seam_test(room_id, name):
    atlas = load('atlases', room_id)
    data = {'rows': SEAM_ROWS, 'legend': {'#': 'solid', '.': 'empty', '=': 'oneway'}}
    room = Room(data)
    room.solid = lambda tx, ty, r=room: (tx, ty) in r.looks  # here the outside is open, so every case shows
    view = Image.new('RGBA', (room.w * T, room.h * T), rgb('#8fd0fa') if name in ('grass-ruins', 'town') else rgb('#2a2752'))
    draw_ground(view, room, atlas, 0, 0)
    big(view, 3).save(os.path.join(OUT, 'seams-%s.png' % name))


def main():
    os.makedirs(OUT, exist_ok=True)
    themes = {'courtyard': 'grass-ruins', 'castle-street': 'town', 'throne-room': 'castle', 'undercroft': 'cellar', 'cantina': 'town', 'outpost': 'grass-ruins'}
    for room_id, name in themes.items():
        sheet_preview(name)
        seam_test(room_id, name)
    views = {
        'courtyard': [(0, 0), (240, 0), (480, 0)],
        'castle-street': [(0, 999), (300, 999), (480, 0), (768, 999), (768, 0)],
        'throne-room': [(0, 999), (0, 0)],
        'hall-gallery': [(0, 999), (384, 0)],
        'undercroft': [(0, 999), (160, 0), (544, 999), (272, 110)],
        'graybox-hall': [(0, 0)],
    }
    bar_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), 'docs', 'design-library',
                           '03-visual-direction-and-assets', 'current-pixel-art-explorations')
    s00 = os.path.join(bar_dir, 's00-01-gameplay-references-use-now-revise-later', 's00-01a-grass-ruins-upper-ledge-phone-320x180-preview.png')
    board = Image.open(os.path.join(bar_dir, 'pixel-aesthetic-reference-approved-direction.png')).convert('RGBA')
    bars = {
        'outdoor': Image.open(s00).convert('RGBA').resize((320, 180), Image.NEAREST),
        'castle': board.crop((527, 378, 686, 476)).resize((320, 180), Image.NEAREST),
        'cellar': board.crop((190, 378, 350, 476)).resize((320, 180), Image.NEAREST),
    }
    bar_of = {'courtyard': 'outdoor', 'castle-street': 'outdoor', 'undercroft': 'cellar'}
    for room_id, cams in views.items():
        for i, (fx, fy) in enumerate(cams):
            v = render(room_id, fx, fy)
            big(v).save(os.path.join(OUT, 'room-%s-%d.png' % (room_id, i)))
            if i == 0:
                pair = Image.new('RGBA', (648, 180), (20, 20, 30, 255))
                pair.alpha_composite(v, (0, 0))
                pair.alpha_composite(bars[bar_of.get(room_id, 'castle')], (328, 0))
                big(pair, 3).save(os.path.join(OUT, 'beside-%s.png' % room_id))
        # upright: the brief's 234 x 256 view
        big(render(room_id, cams[0][0] + 90, 999, 234, 256), 2).save(os.path.join(OUT, 'upright-%s.png' % room_id))
    for rel in ('backdrops/sky-clouds.png', 'backdrops/far-hills.png', 'backdrops/far-castle.png', 'backdrops/castle-mid.png',
                'backdrops/town-mid.png', 'backdrops/castle-hall.png', 'backdrops/cellar-vault.png',
                'backdrops/front-foliage.png'):
        img = image(rel)
        wide = Image.new('RGBA', (img.width * 2, img.height), rgb('#8fd0fa'))
        wide.alpha_composite(img, (0, 0))
        wide.alpha_composite(img, (img.width, 0))
        big(wide, 2).save(os.path.join(OUT, 'layer-' + os.path.basename(rel)))
    print('previews written to', OUT)


if __name__ == '__main__':
    main()
