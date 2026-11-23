"""Contact sheets and mock scenes for a person to look at (4x nearest). Never shipped.

    python3 -I tools/art/props/preview.py

Writes tools/art/props/preview/ (git-ignored): every look and decor sheet with a grid and id labels, the effect
strips frame by frame, and each map room with plain grey ground from its room file plus this lane's doors,
parts and decoration in place: the whole room at 2x and 320x180 camera views at 4x."""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
from px import *
import make
from place import place_all
from sizes import ROOT, rect

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'preview')
THEME = {  # (backdrop, back wall or None, ground body, ground lip): plain stand-ins for the tiles lane's work
    'castle-street': ('#8fd0fa', None, '#807b96', '#d2cfe0'),
    'courtyard': ('#8fd0fa', None, '#807b96', '#5fd35a'),
    'throne-room': ('#221f44', '#3f3a66', '#8179b8', '#d0aaff'),
    'hall-gallery': ('#221f44', '#3f3a66', '#8179b8', '#d0aaff'),
    'undercroft': ('#141228', '#221f44', '#343066', '#4c4890'),
    'graybox-hall': ('#221f44', '#3f3a66', '#8179b8', '#d0aaff'),
}


def sheet_contact(s, path, k=4, bg='#807b96'):
    """Every picture of a Sheet on a row of its own grid cell, labelled."""
    names = list(s.rects.keys())
    im = s.image()
    pad = 3
    cells = []
    for n in names:
        x, y, w, h = s.rects[n]
        frames = s.meta[n][0]
        cells.append((n, im.crop((x, y, x + w * frames, y + h)), w))
    W = 360
    x = y = 0; rowh = 0; pos = []
    for n, c, fw in cells:
        if x + c.width + pad > W:
            x = 0; y += rowh + 12; rowh = 0
        pos.append((x, y)); x += max(c.width, 30) + pad; rowh = max(rowh, c.height)
    H = y + rowh + 12
    out = Image.new('RGBA', (W * k, H * k), rgb(bg))
    d = ImageDraw.Draw(out)
    for (n, c, fw), (x, y) in zip(cells, pos):
        # checker under each cell so transparency shows
        for j in range(c.height):
            for i in range(c.width):
                if (i // 4 + j // 4) % 2:
                    d.rectangle([(x + i) * k, (y + j) * k, (x + i + 1) * k - 1, (y + j + 1) * k - 1], fill=mix(rgb(bg), (0, 0, 0, 255), 0.08))
        out.alpha_composite(scale(c, k), (x * k, y * k))
        for f in range(1, c.width // fw):
            d.line([(x + f * fw) * k, y * k, (x + f * fw) * k, (y + c.height) * k], fill=(255, 0, 255, 255))
        d.text((x * k, (y + c.height) * k + 2), n, fill=(255, 255, 255, 255))
    out.convert('RGB').save(path)


def room_scene(rid, R, sheets, looks, all_rooms):
    r = all_rooms[rid]
    rows = r['rows']; W, H = len(rows[0]) * 16, len(rows) * 16
    sky, wall, body, lip = THEME[rid]
    im = Image.new('RGBA', (W, H), rgb(sky))
    legend = r['legend']
    parts = {p['id']: p for p in (r.get('parts') or [])}
    doors = {d['id']: d for d in (r.get('doors') or [])}

    def cell(tx, ty):
        if not (0 <= tx < len(rows[0]) and 0 <= ty < len(rows)):
            return 'solid'
        v = legend[rows[ty][tx]]
        if v == 'solid':
            return 'solid'
        if v == 'oneway':
            return 'oneway'
        if isinstance(v, dict) and 'part' in v:
            p = parts[v['part']]
            if p['kind'] == 'false-wall' or (p['kind'] == 'breakable' and (p.get('params') or {}).get('look') != 'window'):
                return 'solid'
        if isinstance(v, dict) and 'door' in v and doors[v['door']].get('hidden'):
            return 'solid'  # the renderer paints a hidden walk door as wall
        return 'open'

    d = ImageDraw.Draw(im)
    if wall:
        for ty in range(len(rows)):
            for tx in range(len(rows[0])):
                if cell(tx, ty) != 'solid':
                    d.rectangle([tx * 16, ty * 16, tx * 16 + 15, ty * 16 + 15], fill=rgb(wall))

    def draw_items(layer):
        for it in R.items:
            if it['layer'] != layer:
                continue
            s = sheets[it['sheet']]
            x, y, w, h = s.rects[it['name']]
            pic = s.image().crop((x, y, x + w, y + h))
            if it['flip']:
                pic = flip(pic)
            im.alpha_composite(pic, (it['tx'] * 16 + it['dx'], (it['ty'] + 1) * 16 + it['dy'] - h)) if 0 <= it['tx'] * 16 + it['dx'] and it['tx'] * 16 + it['dx'] + w <= W and (it['ty'] + 1) * 16 + it['dy'] - h >= 0 else paste(im, pic, it['tx'] * 16 + it['dx'], (it['ty'] + 1) * 16 + it['dy'] - h)

    draw_items('far')
    for ty in range(len(rows)):
        for tx in range(len(rows[0])):
            c = cell(tx, ty)
            if c == 'solid':
                d.rectangle([tx * 16, ty * 16, tx * 16 + 15, ty * 16 + 15], fill=rgb(body))
                if cell(tx, ty - 1) != 'solid':
                    d.rectangle([tx * 16, ty * 16, tx * 16 + 15, ty * 16 + 2], fill=rgb(lip))
            elif c == 'oneway':
                d.rectangle([tx * 16, ty * 16, tx * 16 + 15, ty * 16 + 4], fill=rgb(lip))
                d.rectangle([tx * 16, ty * 16 + 3, tx * 16 + 15, ty * 16 + 4], fill=rgb(body))

    def look(name):
        for gid, rel, s in looks:
            if name in s.rects:
                x, y, w, h = s.rects[name]
                return s.image().crop((x, y, x + w, y + h))
        return None

    for dd_ in r.get('doors') or []:
        if dd_.get('use') == 'enter':
            tx, ty, w, h = rect(r, 'door', dd_['id'])
            im.alpha_composite(look('door-enter-%dx%d' % (w, h)), (tx * 16, ty * 16))
    for p in r.get('parts') or []:
        tx, ty, w, h = rect(r, 'part', p['id'])
        own = look('part:%s:%s' % (rid, p['id']))
        if p['kind'] == 'plate':
            im.alpha_composite(look('plate-up'), (tx * 16, ty * 16))
        elif p['kind'] == 'gate':
            for j in range(h):
                im.alpha_composite(look('gate-closed'), (tx * 16, (ty + j) * 16))
        elif p['kind'] == 'hide':
            im.alpha_composite(own or look('hide-%dx%d' % (w, h)), (tx * 16, ty * 16))
        elif p['kind'] == 'breakable':
            if (p.get('params') or {}).get('look') == 'window':
                im.alpha_composite(own or look('window-%dx%d' % (w, h)), (tx * 16, ty * 16))
            else:
                for j in range(h):
                    im.alpha_composite(look('crack-%d' % (1 + j % 2)), (tx * 16, (ty + j) * 16))
    draw_items('back')
    # the room's things and people, as the actors lane will draw them: looks for things, plain boxes for bodies
    pl = os.path.join(ROOT, 'content', 'placements', rid + '.json')
    chars = {}
    for f in os.listdir(os.path.join(ROOT, 'content', 'characters')):
        c = json.load(open(os.path.join(ROOT, 'content', 'characters', f)))
        chars[c['id']] = c
    if os.path.exists(pl):
        pj = json.load(open(pl))
        for t in pj.get('things') or []:
            nm = {'bell': 'bell', 'counter': 'shop-counter', 'goods': 'shop-goods'}[t.get('look', 'goods')]
            pic = look(nm)
            tx, ty = t['tile']
            im.alpha_composite(pic, (tx * 16 + (16 - pic.width) // 2, (ty + 1) * 16 - pic.height))
        for b in pj.get('place') or []:
            box = chars[b['character']]['box']
            tx, ty = b['tile']
            x0, y0 = tx * 16, (ty + 1) * 16 - box['h']
            d.rectangle([x0, y0, x0 + box['w'] - 1, y0 + box['h'] - 1], outline=(255, 255, 255, 255))
    # spawn points: a dotted grappler-sized box
    for ty, row in enumerate(rows):
        for tx, ch in enumerate(row):
            if legend[ch] == 'spawn':
                d.rectangle([tx * 16, (ty + 1) * 16 - 30, tx * 16 + 17, (ty + 1) * 16 - 1], outline=(255, 210, 63, 255))
    draw_items('front')
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    looks = make.looks_sheets()
    for gid, rel, s in looks:
        sheet_contact(s, os.path.join(OUT, 'looks-%s.png' % gid), k=4, bg='#807b96' if gid != 'fx' else '#5c5690')
    sheets = make.decor_sheets()
    for name, s in sheets.items():
        sheet_contact(s, os.path.join(OUT, 'decor-%s.png' % name), k=3, bg={'town': '#8fd0fa', 'courtyard': '#8fd0fa', 'castle': '#3f3a66', 'undercroft': '#221f44'}[name])
    from sizes import rooms
    all_rooms = rooms()
    for rid, R in place_all().items():
        im = room_scene(rid, R, sheets, looks, all_rooms)
        scale(im, 2).convert('RGB').save(os.path.join(OUT, 'room-%s-whole-2x.png' % rid))
        W, H = im.size
        # camera views: 320 x 180, along the floor (bottom of the room) and, in tall rooms, the top
        xs = sorted(set([0] + list(range(0, max(1, W - 320), 224)) + [max(0, W - 320)]))
        ys = sorted(set([max(0, H - 180), 0])) if H > 180 else [0]
        n = 0
        for y in ys:
            for x in xs:
                view = Image.new('RGBA', (320, 180), (0, 0, 0, 255))
                view.paste(im.crop((x, y, x + 320, y + 180)), (0, 0))
                scale(view, 4).convert('RGB').save(os.path.join(OUT, 'room-%s-view%d.png' % (rid, n)))
                n += 1
    print('previews written to', OUT)


if __name__ == '__main__':
    main()
