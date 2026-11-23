"""A small check of the cast's files, for use before the real validators
(npm run check) know the contract's new fields.

    python3 -I tools/art/cast/selfcheck.py

Every image exists; every cell and frame number fits inside its image; the
required keys are present; every "//" starts DRAFT:; the anchor puts the
collision box inside the cell with its bottom on the cell's bottom; alpha is
0 or 255; no frame named by a state is empty.
"""
import json
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
IDS = ['king', 'guard', 'shopkeeper', 'villain', 'crate', 'crate-heavy', 'dummy', 'dummy-heavy', 'throne']
PEOPLE = ['king', 'guard', 'shopkeeper', 'villain']
bad = []


def fail(cid, msg):
    bad.append('%s: %s' % (cid, msg))


for cid in IDS:
    path = os.path.join(ROOT, 'content', 'sprites', cid + '.json')
    if not os.path.exists(path):
        fail(cid, 'no content file')
        continue
    d = json.load(open(path))
    for k in ('//', 'id', 'image', 'cell', 'anchor', 'fps', 'frames'):
        if k not in d:
            fail(cid, 'missing key ' + k)
    if not str(d.get('//', '')).startswith('DRAFT:') or 'tools/art/cast' not in d.get('//', ''):
        fail(cid, '"//" must start DRAFT: and say where the picture came from')
    if d.get('id') != cid:
        fail(cid, 'id does not match the file name')
    ch = json.load(open(os.path.join(ROOT, 'content', 'characters', cid + '.json')))
    ip = os.path.join(ROOT, 'assets', d['image'])
    if not os.path.exists(ip):
        fail(cid, 'image missing: ' + d['image'])
        continue
    im = Image.open(ip).convert('RGBA')
    cw, chh = d['cell']['w'], d['cell']['h']
    if im.width % cw or im.height % chh:
        fail(cid, 'image is not a whole number of cells')
    cols, n = im.width // cw, (im.width // cw) * (im.height // chh)
    ax, ay = d['anchor']['x'], d['anchor']['y']
    if ax < 0 or ay < 0 or ax + ch['box']['w'] > cw or ay + ch['box']['h'] != chh:
        fail(cid, 'the box does not sit on the bottom of the cell')
    if abs((ax + ch['box']['w'] / 2) - cw / 2) > 0.5:
        fail(cid, 'the box is not centred in the cell')
    if any(a not in (0, 255) for a in im.getchannel('A').getdata()):
        fail(cid, 'alpha other than 0 or 255')
    lists = dict(d['frames'])
    for mood, states in d.get('moods', {}).items():
        if mood not in ('2', '3'):
            fail(cid, 'unknown mood ' + mood)
        for k, v in states.items():
            lists['mood %s %s' % (mood, k)] = v
    for k in ('idle', 'run', 'air', 'hurt'):
        if k not in d['frames']:
            fail(cid, 'missing state ' + k)
    if cid in PEOPLE:
        for k in ('down', 'held', 'talk'):
            if k not in d['frames']:
                fail(cid, 'missing state ' + k)
        if len(d['frames']['idle']) < 4 or len(d['frames']['run']) < 6:
            fail(cid, 'idle needs 4 frames and run 6')
        for m in ('2', '3'):
            for k in ('idle', 'run'):
                if k not in d.get('moods', {}).get(m, {}):
                    fail(cid, 'mood %s needs %s' % (m, k))
    for k in d.get('fpsBy', {}):
        if k not in d['frames']:
            fail(cid, 'fpsBy names an unknown state ' + k)
    for k, v in lists.items():
        if not v:
            fail(cid, 'empty state ' + k)
        for f in v:
            if not (isinstance(f, int) and 0 <= f < n):
                fail(cid, 'frame %r of %s is outside the sheet' % (f, k))
                continue
            x, y = (f % cols) * cw, (f // cols) * chh
            if im.crop((x, y, x + cw, y + chh)).getbbox() is None:
                fail(cid, 'frame %d of %s is empty' % (f, k))

for b in bad:
    print('FAIL', b)
print('cast selfcheck: %d files, %d problems' % (len(IDS), len(bad)))
sys.exit(1 if bad else 0)
