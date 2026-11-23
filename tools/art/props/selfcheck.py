"""This lane's own check of what make.py wrote (the real one is `npm run check`).

    python3 -I tools/art/props/selfcheck.py

Every image exists; every `src` rectangle and every frame of a strip fits inside its image; required keys are
present; every "//" starts DRAFT:; look ids are unique across groups; every id the contract lists exists; alpha is
0 or 255 outside the shadows and the Use button (which matches the delivered buttons' own soft alpha);
decoration on the back and front layers stays off doorways, parts, spawn points, things and people's tiles;
whatever stands on a floor has ground under it and whatever hangs has ground over it."""
import glob, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from sizes import ROOT, rooms, rect, sizes
from place import place_all, Room
import make

bad = []


def fail(msg):
    bad.append(msg)


def img(rel):
    path = os.path.join(ROOT, 'assets', rel)
    if not os.path.exists(path):
        fail('missing image assets/' + rel)
        return None
    return Image.open(path).convert('RGBA')


def main():
    seen = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'looks', '*.json'))):
        j = json.load(open(f)); name = os.path.basename(f)
        for k in ('//', 'id', 'image', 'looks'):
            if k not in j:
                fail('%s: no "%s"' % (name, k))
        if not str(j.get('//', '')).startswith('DRAFT:'):
            fail('%s: "//" does not start DRAFT:' % name)
        if j.get('id') + '.json' != name:
            fail('%s: id does not match the file name' % name)
        im = img(j['image'])
        for lid, look in j['looks'].items():
            if lid in seen:
                fail('look id %s is in both %s and %s' % (lid, seen[lid], name))
            seen[lid] = name
            x, y, w, h = look['src']; n = look.get('frames', 1)
            if n > 1 and not look.get('fps'):
                fail('%s: strip without fps' % lid)
            if im and not (x >= 0 and y >= 0 and w > 0 and h > 0 and x + w * n <= im.width and y + h <= im.height):
                fail('%s: src %s x %d frames does not fit %s' % (lid, look['src'], n, im.size))
            if im and j['id'] != 'ui' and not lid.startswith('shadow-'):
                for a in set(im.crop((x, y, x + w * n, y + h)).getchannel('A').tobytes()):
                    if a not in (0, 255):
                        fail('%s: alpha %d' % (lid, a))
    sz = sizes()
    want = ['plate-up', 'plate-down', 'gate-closed', 'gate-open', 'crack-1', 'crack-2', 'rubble', 'bell', 'bell-ringing',
            'bell-broken', 'shop-counter', 'shop-goods', 'alert-pip', 'alert-pip-off', 'mood-2', 'mood-3', 'bark',
            'bark-tail', 'ribbon', 'away-dots', 'player-mark', 'shadow-s', 'shadow-m', 'shadow-l', 'fx-slash', 'fx-hit',
            'fx-dust', 'fx-land', 'ui-use', 'part:throne-room:window', 'part:throne-room:window:broken',
            'fx-swing-grappler', 'font-dark', 'font-light']  # round 2 adds the last three (and hide-front-*)
    want += ['hide-front-%dx%d' % s for s in sz['hide']]
    want += ['door-enter-%dx%d' % s for s in sz['door-enter']] + ['hide-%dx%d' % s for s in sz['hide']]
    want += ['window-%dx%d' % s for s in sz['window']] + ['window-broken-%dx%d' % s for s in sz['window']]
    for w in want:
        if w not in seen:
            fail('no look "%s"' % w)
    sizes_px = {'plate-up': (16, 16), 'plate-down': (16, 16), 'gate-closed': (16, 16), 'gate-open': (16, 16), 'crack-1': (16, 16),
                'crack-2': (16, 16), 'rubble': (16, 16), 'bell': (16, 32), 'bell-ringing': (16, 32), 'bell-broken': (16, 32),
                'shop-counter': (16, 16), 'shop-goods': (8, 8), 'alert-pip': (10, 10), 'alert-pip-off': (10, 10), 'mood-2': (12, 12),
                'mood-3': (12, 12), 'bark': (12, 12), 'bark-tail': (6, 4), 'ribbon': (12, 12), 'away-dots': (12, 6), 'player-mark': (8, 8),
                'shadow-s': (12, 4), 'shadow-m': (18, 5), 'shadow-l': (26, 6), 'fx-slash': (32, 32), 'fx-hit': (32, 32), 'fx-dust': (24, 24), 'fx-swing-grappler': (32, 32),
                'font-dark': (6, 10), 'font-light': (6, 10),
                'fx-land': (24, 8), 'ui-use': (48, 24), 'part:throne-room:window': (16, 48), 'part:throne-room:window:broken': (16, 48)}
    for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'looks', '*.json'))):
        for lid, look in json.load(open(f))['looks'].items():
            if lid in sizes_px and tuple(look['src'][2:]) != sizes_px[lid]:
                fail('%s is %s, the contract says %s' % (lid, look['src'][2:], sizes_px[lid]))
    # the Use button is wired, and is the size the delivered buttons are
    act = json.load(open(os.path.join(ROOT, 'content', 'actions', 'interact.json')))
    if act.get('icon') != 'ui/use.png':
        fail('content/actions/interact.json: icon is not ui/use.png')
    u = img('ui/use.png')
    if u and u.size != (48, 24):
        fail('ui/use.png is %s' % (u.size,))

    all_rooms = rooms()
    placed = place_all()
    for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'decor', '*.json'))):
        j = json.load(open(f)); name = os.path.basename(f)
        if not str(j.get('//', '')).startswith('DRAFT:'):
            fail('%s: "//" does not start DRAFT:' % name)
        if j.get('id') not in all_rooms or j['id'] + '.json' != name:
            fail('%s: not named after a room' % name)
            continue
        r = all_rooms[j['id']]; R = Room(r)
        keep = []  # (x0, y0, x1, y1, what) in pixels: back and front decoration may not overlap these
        for d in r.get('doors') or []:
            if d.get('use') == 'enter':  # a walk door is on the room's rim, where nothing is placed anyway
                tx, ty, w, h = rect(r, 'door', d['id']); keep.append((tx * 16, ty * 16, (tx + w) * 16, (ty + h) * 16, 'door ' + d['id']))
        for p in r.get('parts') or []:
            tx, ty, w, h = rect(r, 'part', p['id']); keep.append((tx * 16, ty * 16, (tx + w) * 16, (ty + h) * 16, 'part ' + p['id']))
        for ty, row in enumerate(r['rows']):
            for tx, ch in enumerate(row):
                if r['legend'][ch] == 'spawn':
                    keep.append((tx * 16 + 2, ty * 16 - 14, tx * 16 + 16, (ty + 1) * 16 - 4, 'spawn at %d,%d' % (tx, ty)))
        pl = os.path.join(ROOT, 'content', 'placements', j['id'] + '.json')
        if os.path.exists(pl):
            for t in json.load(open(pl)).get('things') or []:
                if t.get('look') == 'bell':
                    tx, ty = t['tile']; keep.append((tx * 16, (ty - 1) * 16, (tx + 1) * 16, (ty + 1) * 16, 'the bell'))
        src_items = placed[j['id']].items
        if 'outside' not in json.load(open(os.path.join(ROOT, 'content', 'backdrops', 'courtyard.json'))):
            src_items = [it for it in src_items if not it.get('blend')]
        if len(src_items) != len(j['items']):
            fail('%s: not what place.py makes now (run make.py)' % name)
        for i, it in enumerate(j['items']):
            for k in ('image', 'src', 'tx', 'ty', 'dx', 'dy', 'layer', 'flip'):
                if k not in it:
                    fail('%s item %d: no "%s"' % (name, i, k))
            im = img(it['image'])
            x, y, w, h = it['src']
            if im and not (x >= 0 and y >= 0 and x + w <= im.width and y + h <= im.height):
                fail('%s item %d: src does not fit' % (name, i))
            if it['layer'] not in ('far', 'back', 'front'):
                fail('%s item %d: layer %s' % (name, i, it['layer']))
            x0 = it['tx'] * 16 + it['dx']; y1 = (it['ty'] + 1) * 16 + it['dy']; x1 = x0 + w; y0 = y1 - h
            if it.get('blend') == 'lighter':
                # round 2: a glow is light, not a thing: it may reach the rim and fall over a door. It must be
                # stepped rings (at most three alpha levels) and sit on a torch or a lantern post.
                levels = set(im.crop((x, y, x + w, y + h)).getchannel('A').tobytes()) - {0} if im else set()
                if len(levels) > 3:
                    fail('%s item %d: a glow with %d alpha levels' % (name, i, len(levels)))
                if src_items[i]['support'] != 'glow':
                    fail('%s item %d: blend on something that is not a glow' % (name, i))
                continue
            if x0 < 16 or x1 > (R.w - 1) * 16 or y0 < 0 or y1 > R.h * 16:
                fail('%s item %d (%s): reaches the room\'s rim' % (name, i, src_items[i]['name']))
            what = src_items[i]['name'] if i < len(src_items) else '?'
            sup = src_items[i]['support'] if i < len(src_items) else 'wall'
            if it['layer'] != 'far' and what not in ('cloth', 'carpet-mid', 'carpet-end', 'carpet-drop'):
                for (a, b, c, d, label) in keep:
                    if x0 < c and x1 > a and y0 < d and y1 > b:
                        fail('%s: %s at tile %d,%d covers %s' % (name, what, it['tx'], it['ty'], label))
            if sup == 'floor':
                if y1 % 16 != 0:
                    fail('%s: %s at %d,%d does not stand on a tile edge' % (name, what, it['tx'], it['ty']))
                for xx in (x0 + 2, x1 - 3):
                    if R.kind(xx // 16, y1 // 16) != 'solid':
                        fail('%s: %s at %d,%d has no ground under x=%d' % (name, what, it['tx'], it['ty'], xx))
            if sup == 'ceiling':
                top_cell = y0 // 16
                # hangs from the ground above it (directly, or through the piece above: a chain's end)
                if R.kind((x0 + w // 2) // 16, top_cell - 1) != 'solid' and what != 'chain-end':
                    fail('%s: %s at %d,%d hangs from nothing' % (name, what, it['tx'], it['ty']))
    for m in bad:
        print('FAIL', m)
    print('selfcheck: %d problem(s); %d looks, %d rooms decorated' % (len(bad), len(seen), len(placed)))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
