"""The tiles lane's own check of its files (the real one is `npm run check`).

    python3 -I tools/art/tiles/selfcheck.py

Every image exists; every cell fits inside its image; required keys are present; every "//"
starts DRAFT:; alpha is 0 or 255; all 16 autotile cells are drawn; layers are 320 px wide or a
multiple and wrap sideways without a seam (checked by comparing the first and last columns'
neighbours is not possible in general, so it checks width and reports); and make.py is
deterministic (two runs, same bytes).
"""
import hashlib
import json
import os
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

from common import ASSETS, CONTENT, HERE  # noqa: E402

ROOMS = ['courtyard', 'castle-street', 'throne-room', 'hall-gallery', 'graybox-hall', 'undercroft', 'cantina']
errors = []


def fail(where, what):
    errors.append('%s: %s' % (where, what))


def img(rel, where):
    path = os.path.join(ASSETS, rel)
    if not os.path.isfile(path):
        fail(where, 'image missing: ' + rel)
        return None
    im = Image.open(path).convert('RGBA')
    if any(a not in (0, 255) for a in im.getchannel('A').tobytes()):
        fail(where, 'alpha other than 0 or 255 in ' + rel)
    return im


def cell_ok(im, c, t, where, allow_none=False, must_draw=False):
    if allow_none and c == [-1, -1]:
        return
    if not (isinstance(c, list) and len(c) == 2 and all(isinstance(n, int) and n >= 0 for n in c)):
        fail(where, 'not a [column, row]: %r' % (c,))
        return
    if (c[0] + 1) * t > im.width or (c[1] + 1) * t > im.height:
        fail(where, 'cell %r is outside the image' % (c,))
        return
    if must_draw:
        box = im.crop((c[0] * t, c[1] * t, (c[0] + 1) * t, (c[1] + 1) * t))
        if not any(box.getchannel('A').tobytes()):
            fail(where, 'cell %r is empty' % (c,))


def digest():
    h = hashlib.sha256()
    for base, sub in ((ASSETS, 'tiles'), (ASSETS, 'backdrops'), (CONTENT, 'atlases'), (CONTENT, 'backdrops')):
        d = os.path.join(base, sub)
        for name in sorted(os.listdir(d)):
            with open(os.path.join(d, name), 'rb') as f:
                h.update(name.encode() + f.read())
    return h.hexdigest()


def main():
    for room in ROOMS:
        if not os.path.isfile(os.path.join(CONTENT, 'rooms', room + '.json')):
            fail(room, 'no such room')
        where = 'content/atlases/%s.json' % room
        a = json.load(open(os.path.join(CONTENT, 'atlases', room + '.json')))
        for key in ('//', 'id', 'image', 'tile', 'cells', 'autotile'):
            if key not in a:
                fail(where, 'missing ' + key)
        if not a['//'].startswith('DRAFT:') or 'tools/art/tiles' not in a['//']:
            fail(where, '"//" must start DRAFT: and say where the picture came from')
        if a['id'] != room:
            fail(where, 'id')
        im = img(a['image'], where)
        if im:
            t = a['tile']
            for k in ('solid', 'solidTop', 'oneway'):
                cell_ok(im, a['cells'][k], t, where + ' cells.' + k, must_draw=True)
            at = a['autotile']
            for i in range(16):
                cell_ok(im, [at['origin'][0] + i % 4, at['origin'][1] + i // 4], t, where + ' autotile index %d' % i, must_draw=True)
            for k in ('nw', 'ne', 'sw', 'se'):
                cell_ok(im, at['innerCorners'][k], t, where + ' innerCorners.' + k, must_draw=True)
            if len({tuple(c) for c in at['fill']}) < 6:
                fail(where, 'fewer than six different fill variants (round 2)')
            for c in at.get('deep', []):
                cell_ok(im, c, t, where + ' deep', must_draw=True)
            for i, r in enumerate(at.get('regions', [])):
                x, y, w, h = r['tiles']
                rows = json.load(open(os.path.join(CONTENT, 'rooms', room + '.json')))['rows']
                if x < 0 or y < 0 or x + w > len(rows[0]) or y + h > len(rows):
                    fail(where, 'region %d is outside the room' % i)
                for j in range(16):
                    cell_ok(im, [r['origin'][0] + j % 4, r['origin'][1] + j // 4], t, where + ' region %d index %d' % (i, j), must_draw=True)
                for k in ('fill', 'top', 'under'):
                    for c in r.get(k, []):
                        cell_ok(im, c, t, where + ' region %d %s' % (i, k), allow_none=True, must_draw=True)
            for c in at['fill']:
                cell_ok(im, c, t, where + ' fill', must_draw=True)
            for k in ('top', 'under'):
                if [-1, -1] not in at[k]:
                    if k == 'top':
                        fail(where, 'top has no [-1, -1]: the edge would be a fringe everywhere')
                for c in at[k]:
                    cell_ok(im, c, t, where + ' ' + k, allow_none=True, must_draw=True)
            for k in ('left', 'mid', 'right', 'single'):
                cell_ok(im, at['oneway'][k], t, where + ' oneway.' + k, must_draw=True)
        where = 'content/backdrops/%s.json' % room
        b = json.load(open(os.path.join(CONTENT, 'backdrops', room + '.json')))
        for key in ('//', 'id', 'sky', 'layers'):
            if key not in b:
                fail(where, 'missing ' + key)
        if not b['//'].startswith('DRAFT:') or 'tools/art/tiles' not in b['//']:
            fail(where, '"//" must start DRAFT: and say where the picture came from')
        if b['id'] != room or len(b['sky']) != 2:
            fail(where, 'id or sky')
        for layer in b['layers']:
            for key in ('image', 'parallax', 'y', 'offsetY', 'repeatX'):
                if key not in layer:
                    fail(where, 'layer missing ' + key)
            im = img(layer['image'], where)
            if im and im.width % 320:
                fail(where, layer['image'] + ' is not 320 px wide or a multiple')
            if layer['y'] not in ('top', 'bottom'):
                fail(where, 'layer y')
        if 'wall' in b:
            im = img(b['wall']['image'], where)
            if im:
                for c in b['wall']['cells']:
                    cell_ok(im, c, b['wall']['tile'], where + ' wall', must_draw=True)
    # round 2's measure: a mid layer is not fog (under 30% of opaque pixels at luminance >= 215)
    for rel in ('backdrops/castle-mid.png', 'backdrops/town-mid.png'):
        im = img(rel, rel)
        if im:
            b = im.tobytes()
            px = [tuple(b[i:i + 4]) for i in range(0, len(b), 4) if b[i + 3]]
            bright = sum(1 for p in px if 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2] >= 215)
            share = bright / max(1, len(px))
            print('%s: %.1f%% of opaque pixels at luminance >= 215, darkest %d' % (
                rel, 100 * share, min(int(0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) for p in px)))
            if share >= 0.30:
                fail(rel, 'still fog: %.0f%% bright' % (100 * share))
    flags = [] if 'outside' in json.load(open(os.path.join(CONTENT, 'backdrops', 'courtyard.json'))) else ['--no-round2-fields']
    before = digest()
    subprocess.run([sys.executable, '-I', os.path.join(HERE, 'make.py')] + flags, check=True, stdout=subprocess.DEVNULL)
    if digest() != before:
        fail('make.py', 'not deterministic: a second run changed the files')
    if errors:
        print('\n'.join(errors))
        sys.exit(1)
    print('tiles selfcheck: ok (%d rooms)' % len(ROOMS))


if __name__ == '__main__':
    main()
