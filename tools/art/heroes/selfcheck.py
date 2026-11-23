"""DRAFT: the heroes lane's own check of its files, until the real validators land.

    python3 -I tools/art/heroes/selfcheck.py

Every image exists; every frame number fits inside its image; required keys
are present; the "//" starts DRAFT:; alpha is only 0 or 255; the anchor puts
the box inside the cell; the picture covers the box's feet line in idle.
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
HEROES = ['grappler', 'infiltrator', 'flyer', 'hero']
REQ = ['idle', 'run', 'air', 'jump', 'fall', 'attack', 'grab', 'carry', 'carryRun', 'throw', 'hurt', 'down', 'held', 'hide', 'flap']
bad = []
for h in HEROES:
    p = os.path.join(ROOT, 'content', 'sprites', f'{h}.json')
    s = json.load(open(p))
    where = f'content/sprites/{h}.json'
    for k in ('//', 'id', 'image', 'cell', 'anchor', 'fps', 'frames'):
        if k not in s:
            bad.append(f'{where}: missing {k}')
    if not s.get('//', '').startswith('DRAFT:'):
        bad.append(f'{where}: "//" must start DRAFT:')
    if s['id'] != h:
        bad.append(f'{where}: id {s["id"]}')
    img_path = os.path.join(ROOT, 'assets', s['image'])
    if not os.path.exists(img_path):
        bad.append(f'{where}: no image {s["image"]}')
        continue
    im = Image.open(img_path).convert('RGBA')
    cw, ch = s['cell']['w'], s['cell']['h']
    if im.width % cw or im.height % ch:
        bad.append(f'{where}: image {im.size} not a whole number of {cw}x{ch} cells')
    n = (im.width // cw) * (im.height // ch)
    for st in REQ:
        if not s['frames'].get(st):
            bad.append(f'{where}: no frames for {st}')
    for st, fr in s['frames'].items():
        for f in fr:
            if not (isinstance(f, int) and 0 <= f < n):
                bad.append(f'{where}: frames.{st} has {f}, the sheet has {n}')
            else:
                c = im.crop(((f % (im.width // cw)) * cw, (f // (im.width // cw)) * ch, (f % (im.width // cw)) * cw + cw, (f // (im.width // cw)) * ch + ch))
                if c.getbbox() is None:
                    bad.append(f'{where}: frame {f} ({st}) is empty')
    for st, v in s.get('fpsBy', {}).items():
        if st not in s['frames'] or not (0 < v <= 60):
            bad.append(f'{where}: fpsBy.{st}')
    import numpy as np
    alphas = set(np.unique(np.asarray(im)[:, :, 3]).tolist())
    if not alphas <= {0, 255}:
        bad.append(f'{where}: alpha values {sorted(alphas - {0, 255})[:5]} (only 0 or 255)')
    box = json.load(open(os.path.join(ROOT, 'content', 'characters', f'{h}.json')))['box']
    ax, ay = s['anchor']['x'], s['anchor']['y']
    if ax + box['w'] > cw or ay + box['h'] > ch:
        bad.append(f'{where}: the box does not fit in the cell at the anchor')
    # feet: in idle frame 0 the lowest opaque row is the box's bottom row
    f0 = s['frames']['idle'][0]
    c = im.crop(((f0 % (im.width // cw)) * cw, (f0 // (im.width // cw)) * ch, (f0 % (im.width // cw)) * cw + cw, (f0 // (im.width // cw)) * ch + ch))
    bb = c.getbbox()
    if bb[3] != ay + box['h']:
        bad.append(f'{where}: idle feet end at row {bb[3]}, the box ends at {ay + box["h"]}')
    # centring is judged at the feet (trailing tails and wings overhang behind)
    x0 = max(0, ax - 3)
    feet = c.crop((x0, bb[3] - 3, min(cw, ax + box['w'] + 3), bb[3])).getbbox()
    mid = x0 + (feet[0] + feet[2]) / 2
    if abs(mid - (ax + box['w'] / 2)) > 2.5:
        bad.append(f'{where}: idle feet centred at {mid}, the box at {ax + box["w"] / 2}')

# Round 2 (handoff-prompts/look2-heroes.md, section 4): a hero must stand off
# the room behind it. Its main fill colour (the commonest non-outline colour of
# idle frame 0) may not be among the top five colours of any atlas or backdrop
# image, so the grappler cannot drift back into a wall's colours.
from collections import Counter
import glob
PARTY = ['grappler', 'infiltrator', 'flyer']
INKS = {(0x2b, 0x21, 0x40), (0x4a, 0x3a, 0x5e)}
top5 = {}
for p in sorted(glob.glob(os.path.join(ROOT, 'assets', 'tiles', '*.png')) + glob.glob(os.path.join(ROOT, 'assets', 'backdrops', '*.png'))):
    a = np.asarray(Image.open(p).convert('RGBA')).reshape(-1, 4)
    c = Counter(map(tuple, a[a[:, 3] > 0][:, :3].tolist()))
    for col, _ in c.most_common(5):
        top5.setdefault(col, os.path.relpath(p, ROOT))
# DRAFT: only the party (content/party.json); the plain hero is not played and the brief leaves it as it is.
for h in PARTY:
    s = json.load(open(os.path.join(ROOT, 'content', 'sprites', f'{h}.json')))
    im = np.asarray(Image.open(os.path.join(ROOT, 'assets', s['image'])).convert('RGBA'))
    cw, ch = s['cell']['w'], s['cell']['h']
    c0 = im[:ch, :cw].reshape(-1, 4)
    c = Counter(map(tuple, c0[c0[:, 3] > 0][:, :3].tolist()))
    main = next(col for col, _ in c.most_common() if col not in INKS)
    if main in top5:
        bad.append(f'{h}: main fill #%02x%02x%02x is a top-5 colour of {top5[main]}' % main)
# The grappler's body may use none of the castle, stone or night ramps, nor a top-5 colour.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import canon as _canon  # noqa: E402
WALLS = {(0x3f, 0x3a, 0x66), (0x5c, 0x56, 0x90), (0x81, 0x79, 0xb8), (0xaa, 0xa3, 0xd8),
         (0x5b, 0x56, 0x70), (0x80, 0x7b, 0x96), (0xa9, 0xa5, 0xbd), (0xd2, 0xcf, 0xe0),
         (0x14, 0x12, 0x28), (0x22, 0x1f, 0x44), (0x34, 0x30, 0x66), (0x4c, 0x48, 0x90)}
# Round 3: every colour of every party sheet: none is a wall colour.
for h in PARTY:
    a = np.asarray(Image.open(os.path.join(ROOT, 'assets', 'sprites', 'heroes', f'{h}.png')).convert('RGBA')).reshape(-1, 4)
    for col in sorted(set(map(tuple, a[a[:, 3] > 0][:, :3].tolist()))):
        if col in WALLS:
            bad.append(f'{h}: colour #%02x%02x%02x is a wall colour' % col)
# The infiltrator's overhang: up to 12 px above its box and 6 px past each side, every frame.
s = json.load(open(os.path.join(ROOT, 'content', 'sprites', 'infiltrator.json')))
box = json.load(open(os.path.join(ROOT, 'content', 'characters', 'infiltrator.json')))['box']
im = Image.open(os.path.join(ROOT, 'assets', s['image'])).convert('RGBA')
cw, ch = s['cell']['w'], s['cell']['h']
ax, ay = s['anchor']['x'], s['anchor']['y']
for st, fr in s['frames'].items():
    for f in fr:
        b = im.crop(((f % 8) * cw, (f // 8) * ch, (f % 8) * cw + cw, (f // 8) * ch + ch)).getbbox()
        if b[1] < ay - 12 or b[0] < ax - 6 or b[2] > ax + box['w'] + 6 or b[3] > ay + box['h']:
            bad.append(f'infiltrator: frame {f} ({st}) at {b} is outside the overhang')
if bad:
    print('\n'.join(bad))
    sys.exit(1)
print(f'ok: {len(HEROES)} sheets')
