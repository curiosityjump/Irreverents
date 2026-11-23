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
if bad:
    print('\n'.join(bad))
    sys.exit(1)
print(f'ok: {len(HEROES)} sheets')
