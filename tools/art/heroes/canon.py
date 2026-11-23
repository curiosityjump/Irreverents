"""DRAFT: the party's sheets (grappler, infiltrator, flyer) from the owner's P03 canon.

    python3 -I tools/art/heroes/canon.py      (make.py runs it too)

Round 3 (handoff-prompts/look3-heroes.md). Every frame is a canon pose from
the P03 sheet (doc 36), imported at native size by p03.py, then put to work
for one game state by small native-size edits: a 1 px bob, a breath, a blink,
the top of one pose over the legs of another, a lean. No new designs: if a
frame drifts from its canon crop, it goes back to the crop.

Canon columns (left to right on the sheet): 0 idle, 1 walk A, 2 walk B,
3 crouch/sneak, 4 jump, 5 ready, 6 alert, 7 strike, 8 brace, 9 lift (the
grappler's rock, the infiltrator's chest, the flyer's coin), 10 hurt,
11 dizzy-down, 12 cheer.

Cells 48x48 for all three. INTENT: one convention: the box's bottom edge is
cell row 46 (feet on row 45) and the box is centred on x = 24, so the anchor
is (24 - w/2, 46 - h). Sprites face right; the renderer mirrors them.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import p03  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
CELL = 48
FOOT = 46  # the box's bottom edge, in cell rows
COLS = 8
PARTY = ['grappler', 'infiltrator', 'flyer']
# DRAFT (brief section 2, "Heights"): native idle heights over boxes 18x30,
# 10x12 and 14x20. The canon draws all three the same size; see README.md.
HEIGHT = {'grappler': 31, 'infiltrator': 23, 'flyer': 26}
INK = np.array(p03.INK, np.uint8)

ROWS = ['idle', 'run', 'air', 'attack', 'grab', 'carry', 'carryRun', 'throw',
        'hurt', 'down', 'held', 'hide', 'talk', 'flap', 'tumble']


def box(hero):
    with open(os.path.join(ROOT, 'content', 'characters', f'{hero}.json')) as fh:
        b = json.load(fh)['box']
    return b['w'], b['h']


# ---------------------------------------------------------------- native edits
_cache = {}


def P(hero, col):
    k = (hero, col)
    if k not in _cache:
        _cache[k] = p03.pose(hero, col, HEIGHT[hero])
    return _cache[k].copy()


def head_cx(a):
    """x centre of the head: the widest part of the top 45% of rows."""
    h = a.shape[0]
    top = a[:max(1, int(h * 0.45)), :, 3] > 0
    xs = np.nonzero(top.any(0))[0]
    return (xs.min() + xs.max() + 1) / 2


def place(a, cx=None, dx=0, dy=0):
    """A 48x48 cell with `a` standing on the box's bottom edge, its head centred."""
    out = np.zeros((CELL, CELL, 4), np.uint8)
    h, w = a.shape[:2]
    if cx is None:
        cx = head_cx(a)
    x0 = int(round(CELL / 2 - cx)) + dx
    y0 = FOOT - h + dy
    for y in range(h):
        for x in range(w):
            if a[y, x, 3] and 0 <= y0 + y < CELL and 0 <= x0 + x < CELL:
                out[y0 + y, x0 + x] = a[y, x]
    return out


# INTENT (docs/mechanisms/art-pipeline.md, "Overhang"): a body under 16 px tall may be
# drawn 12 px above its box and 6 px past each side, never more. A pose wider than
# that is moved inside, then its trailing edge (scarf tip, satchel) is clipped.
def fit(hero, c):
    w, h = box(hero)
    if h >= 16:
        return c
    lo = CELL // 2 - w // 2 - 6
    hi = CELL // 2 - w // 2 + w + 6
    xs = np.nonzero(c[:, :, 3].any(0))[0]
    if xs.min() < lo:
        c = np.roll(c, min(lo - xs.min(), max(0, hi - 1 - xs.max())), axis=1)
    elif xs.max() >= hi:
        c = np.roll(c, -min(xs.max() + 1 - hi, max(0, xs.min() - lo)), axis=1)
    out = c.copy()
    out[:, :lo] = 0
    out[:, hi:] = 0
    out[:FOOT - h - 12] = 0
    return reink(out) if (out != c).any() else out


def shift_top(c, row, dx=0, dy=0):
    """Move everything above cell row `row` by (dx, dy): a bob, a lean, a breath."""
    out = c.copy()
    out[:row] = 0
    part = c[:row]
    ys, xs = np.nonzero(part[:, :, 3])
    for y, x in zip(ys, xs):
        yy, xx = y + dy, x + dx
        if 0 <= yy < CELL and 0 <= xx < CELL and (yy < row or not out[yy, xx, 3]):
            out[yy, xx] = part[y, x]
    if dy > 0:
        # a squash: the row the top lands on keeps the top
        pass
    return out


def bob(c, dy):
    """The whole figure moved up (dy < 0) or down."""
    out = np.zeros_like(c)
    if dy < 0:
        out[:dy] = c[-dy:]
    elif dy > 0:
        out[dy:] = c[:-dy]
    else:
        out = c.copy()
    return out


def breathe(c):
    """Idle breath: the head and shoulders sink 1 px over the legs."""
    ys = np.nonzero(c[:, :, 3].any(1))[0]
    top, bot = ys.min(), ys.max()
    waist = top + int((bot - top) * 0.62)
    out = c.copy()
    out[top:waist + 1] = 0
    out[top + 1:waist + 1] = c[top:waist]
    return out


def stretch(c):
    """Fall: one row doubled at the waist (taller by 1)."""
    ys = np.nonzero(c[:, :, 3].any(1))[0]
    top, bot = ys.min(), ys.max()
    waist = top + int((bot - top) * 0.6)
    out = c.copy()
    out[top - 1:waist] = c[top:waist + 1]
    return out


def over(top_cell, legs_cell, cut):
    """The rows above `cut` from one cell over the rows from `cut` down of another."""
    out = legs_cell.copy()
    out[:cut] = top_cell[:cut]
    # seam: where the top's last row is opaque and legs' row is empty, keep the top's pixels
    row = top_cell[cut - 1:cut + 1]
    for x in range(CELL):
        if not out[cut, x, 3] and row[1, x, 3]:
            out[cut, x] = row[1, x]
    return reink(out)


def reink(c):
    """Outline again after an edit: opaque pixels touching transparency become ink."""
    m = c[:, :, 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    out = c.copy()
    out[edge, :3] = INK
    return out


def mirror_x(c):
    return c[:, ::-1].copy()


def blink(c, hero):
    """Close the eyes: each dark eye blob inside the face becomes a 1-px line at its bottom."""
    face = {tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for v in p03.R['face']}
    out = c.copy()
    h = c.shape[0]
    for y in range(1, h - 1):
        for x in range(1, CELL - 1):
            if tuple(c[y, x, :3]) == tuple(INK) and c[y, x, 3]:
                l, r = tuple(c[y, x - 1, :3]), tuple(c[y, x + 1, :3])
                below = tuple(c[y + 1, x, :3])
                above = tuple(c[y - 1, x, :3])
                # an eye pixel: face on both sides; its lower end has face or ink below
                if l in face and r in face and above in face | {tuple(INK)}:
                    if below in face:
                        continue  # bottom of the eye: keep as the closed line
                    out[y, x, :3] = c[y, x - 1, :3]
    return out


def rot90(c, k):
    """Spin about the figure's centre, k quarter turns (tumble only: a ball spinning)."""
    ys, xs = np.nonzero(c[:, :, 3])
    a = c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    a = np.rot90(a, k).copy()
    out = np.zeros_like(c)
    h, w = a.shape[:2]
    y0 = FOOT - h
    x0 = CELL // 2 - w // 2
    out[y0:y0 + h, x0:x0 + w] = a
    return out


# ---------------------------------------------------------------- the states
def frames(hero):
    """Every state's frames, as 48x48 cells, in the order of ROWS."""
    # every pose is placed by its head; one per-hero nudge puts the idle feet on the box's middle
    idle = P(hero, 0)
    feet = np.nonzero(idle[-3:, :, 3].any(0))[0]
    nudge = int(round(head_cx(idle) - (feet.min() + feet.max() + 1) / 2))
    c = {k: fit(hero, place(P(hero, k), dx=nudge)) for k in range(13)}
    g = hero == 'grappler'
    lift = 9 if g else 12          # the grappler's own rock-lift; the others' arms-up cheer
    ys = np.nonzero(c[0][:, :, 3].any(1))[0]
    top0 = ys.min()
    waist = top0 + int((FOOT - top0) * 0.62)
    run = [c[1], bob(c[1], -1), bob(c[5], -1), c[2], bob(c[2], -1), bob(c[5], -1)]
    if hero == 'flyer':
        run = [c[1], bob(c[1], -1), bob(c[2], -1), c[2], bob(c[2], -1), bob(c[1], -1)]
    # carrying: the lift's arms over walking legs
    lift_c = c[lift]
    carry_run = []
    for i, k in enumerate([1, 1, 5, 2, 2, 5]):
        f = over(lift_c, c[k], waist)
        carry_run.append(bob(f, -1) if i in (1, 4) else f)
    out = {
        'idle': [c[0], breathe(c[0]), c[0], blink(c[0], hero)],
        'run': run,
        # jump (rising, eyes wide in the canon) and fall (stretched)
        'air': [c[4], reink(stretch(c[4]))],
        # wind-up (brace, squint), strike, follow-through, recover
        'attack': [c[8], c[7], shift_top(c[7], FOOT, dx=1), c[5]],
        # crouch with hands low, then heave up
        'grab': [c[3], lift_c],
        'carry': [lift_c, breathe(lift_c)],
        'carryRun': carry_run,
        # wind-up: the lift leaning back twice, release (the strike's forward push), held
        'throw': [lift_c, reink(shift_top(lift_c, waist, dx=-1)), c[7], shift_top(c[7], FOOT, dx=1)],
        'hurt': [c[10], reink(shift_top(c[10], waist, dx=-1))],
        'down': [c[11], breathe(c[11])],
        # held: curled and kicking: the jump's tucked knees, then the crouch
        'held': [c[4], bob(c[3], -2)],
        'hide': [c[3]],
        'talk': [c[0], c[12]],
        'flap': [c[4], bob(c[1], -2)] if hero == 'flyer' else [c[4], bob(c[4], -1)],
        'tumble': [rot90(c[3], k) for k in (0, 3, 2, 1)],
    }
    return out


def sheet(hero):
    fr = frames(hero)
    img = np.zeros((len(ROWS) * CELL, COLS * CELL, 4), np.uint8)
    index = {}
    for r, st in enumerate(ROWS):
        index[st] = []
        for i, f in enumerate(fr[st]):
            img[r * CELL:(r + 1) * CELL, i * CELL:(i + 1) * CELL] = fit(hero, f)
            index[st].append(r * COLS + i)
    return img, index


def lift_hands(img, index, state):
    """The top of the fists in a state's first frame: (x, y) in the cell."""
    f = index[state][0]
    r, c = divmod(f, COLS)
    a = img[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL, 3] > 0
    ys = np.nonzero(a.any(1))[0]
    # INTENT: the load is centred over the head (x = 24), as the canon's rock is, not on one fist
    return CELL // 2, int(ys.min())


def validator_knows(field):
    p = os.path.join(ROOT, 'src', 'content', 'kinds', 'sprites.ts')
    return os.path.exists(p) and field in open(p).read()


def content_json(hero, img, index):
    w, h = box(hero)
    frames_ = {
        'idle': index['idle'], 'run': index['run'], 'air': index['air'],
        'jump': index['air'][:1], 'fall': index['air'][1:],
        'attack': index['attack'], 'grab': index['grab'], 'carry': index['carry'],
        'carryRun': index['carryRun'], 'throw': index['throw'], 'hurt': index['hurt'],
        'down': index['down'], 'held': index['held'], 'hide': index['hide'],
        'talk': index['talk'], 'flap': index['flap'],
    }
    if validator_knows('tumble'):
        frames_['tumble'] = index['tumble']
    out = {
        '//': ('DRAFT: the owner\'s canon hero (P03 sheet, doc 36) imported at native size by '
               'tools/art/heroes/canon.py and p03.py (a program, 2026-11-23); a delivered sheet replaces it '
               'by editing this file. Notes: tools/art/heroes/README.md.'),
        'id': hero,
        'image': f'sprites/heroes/{hero}.png',
        'cell': {'w': CELL, 'h': CELL},
        'anchor': {'x': CELL // 2 - w // 2, 'y': FOOT - h},
        'fps': 8,
        'frames': frames_,
        'fpsBy': {'run': 12, 'carryRun': 12, 'attack': 16, 'throw': 12, 'grab': 10, 'flap': 10, 'hurt': 8,
                  **({'tumble': 16} if 'tumble' in frames_ else {})},
    }
    if validator_knows('carryAt'):
        x, y = lift_hands(img, index, 'carry')
        # INTENT: the load's bottom sits 2 px into the fists, so their lower part shows under it
        out['carryAt'] = {'x': x, 'y': y + 2}
    if validator_knows('carryAtBy'):
        # one point per state (src/content/kinds/sprites.ts): its first frame's fist tops,
        # centred over the head as carryAt; the throw's is the wind-up's (the load is still held)
        out['carryAtBy'] = {}
        for st in ('carry', 'carryRun', 'throw'):
            x, y = lift_hands(img, index, st)
            out['carryAtBy'][st] = {'x': x, 'y': y + 2}
    return out


def main():
    img_dir = os.path.join(ROOT, 'assets', 'sprites', 'heroes')
    json_dir = os.path.join(ROOT, 'content', 'sprites')
    for hero in PARTY:
        img, index = sheet(hero)
        Image.fromarray(img, 'RGBA').save(os.path.join(img_dir, f'{hero}.png'), optimize=True)
        with open(os.path.join(json_dir, f'{hero}.json'), 'w') as fh:
            fh.write(json.dumps(content_json(hero, img, index), indent=2) + '\n')
        print(f'wrote assets/sprites/heroes/{hero}.png and content/sprites/{hero}.json')


if __name__ == '__main__':
    main()
