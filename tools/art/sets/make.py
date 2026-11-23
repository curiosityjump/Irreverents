"""Step 14 slice B push 3: the bodies the sets of pieces build, one sheet each.

Run: python3 -I tools/art/sets/make.py   (deterministic: the same bytes every run)

Each picture is one srcimport.grab() of an approved sheet (P04's Hall of
Legends atlas, P05's rare-powers sheet), boxes given by the props builder
(tools/art/props/README.md, 'Core loops'), the same cells as three of its
existing looks. INTENT: nothing here names what the pictures are. Pasted
bottom-centre on 48x48 cells: idle [0], air [1, 2] (leaning 1 px), hurt
[3, 4] (shifted 1 px). Writes assets/sprites/cast/set-<level>.png and
content/sprites/set-<level>.json.
INTENT: ids say which level's set, never what the thing is (D-078).
DRAFT: boxes, sizes and frames are first passes.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art', 'props'))
from PIL import Image  # noqa: E402
from srcimport import grab  # noqa: E402
import loops  # noqa: E402

CELL = 48
# id: (sheet, box, grab options, the body's collision box (w, h))
SETS = {
    'set-castle-town': ('hall', (210, 885, 325, 1062), dict(pal=loops.HALLR, key=(247, 247, 247), grid=True, size=(24, 32), scale=None), (24, 32)),
    'set-iron-quarry': ('powers', (181, 8, 286, 134), dict(pal=loops.POWER, key=(247, 245, 243), scale=0.25), (22, 26)),
    'set-bandit-camp': ('hall', (326, 925, 420, 1062), dict(pal=loops.HALLR, key=(247, 247, 247), grid=True, size=(16, 20), scale=None), (16, 20)),
}


def build(sid, sheet, box, opts, body):
    pic = grab(sheet, box, opts.pop('scale'), opts.pop('pal'), **opts)
    bw, bh = body
    ax, ay = (CELL - bw) // 2, CELL - bh
    frames = [(0, 0), (-1, 0), (1, 0), (-1, 0), (1, 0)]
    img = Image.new('RGBA', (CELL * len(frames), CELL), (0, 0, 0, 0))
    for i, (dx, dy) in enumerate(frames):
        x = i * CELL + (CELL - pic.width) // 2 + dx
        y = CELL - pic.height + dy
        if pic.width > CELL or pic.height > CELL:
            raise SystemExit(f'{sid}: {pic.size} does not fit a {CELL} cell')
        img.alpha_composite(pic, (x, max(0, y)))
    out = os.path.join(ROOT, 'assets', 'sprites', 'cast', f'{sid}.png')
    img.save(out, optimize=True)
    doc = {
        '//': 'DRAFT: cut by tools/art/sets/make.py from an approved sheet (Step 14 slice B push 3); the body a level\'s set of pieces builds.',
        'id': sid,
        'image': f'sprites/cast/{sid}.png',
        'cell': {'w': CELL, 'h': CELL},
        'anchor': {'x': ax, 'y': ay},
        'fps': 8,
        'frames': {'idle': [0], 'run': [0], 'air': [1, 2], 'hurt': [3, 4]},
        'fpsBy': {'hurt': 10, 'air': 8},
    }
    with open(os.path.join(ROOT, 'content', 'sprites', f'{sid}.json'), 'w') as f:
        f.write(json.dumps(doc, indent=2) + '\n')
    print(sid, pic.size, 'body', body)


for sid, (sheet, box, opts, body) in SETS.items():
    build(sid, sheet, box, dict(opts), body)
