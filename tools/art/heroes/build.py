"""Shared by make.py and preview.py: pose every frame of a hero and lay the
frames out on a sheet the way docs/mechanisms/art-pipeline.md says (one state
per row, 8 columns, frames numbered row by row from the top-left)."""

import importlib

from PIL import Image

from rig import Canvas

HEROES = ['grappler', 'infiltrator', 'flyer', 'hero']
COLS = 8

# state -> (row, first column). jump, fall and air share the "air" row.
PLACE = {
    'idle': (0, 0), 'run': (1, 0),
    'air': (2, 0), 'jump': (2, 2), 'fall': (2, 4),
    'attack': (3, 0), 'grab': (4, 0), 'carry': (5, 0), 'carryRun': (6, 0), 'throw': (7, 0),
    'hurt': (8, 0), 'down': (9, 0), 'held': (10, 0), 'hide': (11, 0), 'talk': (12, 0), 'flap': (13, 0),
}
ROWS = 14

# The order frames are SHOWN in, where it is not simply "each frame once".
# idle: a slow breath (rest, up, rest, down) with one blink every three seconds.
IDLE_ORDER = [0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 2, 2, 0, 3, 0, 1, 1, 1, 0, 0, 0, 2, 2, 2]


def module(hero):
    return importlib.import_module(hero)


def frames(mod):
    """state -> list of RGBA images, one per pose."""
    cw, ch = mod.CELL
    ox, oy = mod.ANCHOR[0] + mod.BOX[0] / 2.0, mod.ANCHOR[1] + mod.BOX[1]
    out = {}
    for state, poses in mod.ANIMS.items():
        out[state] = []
        for P in poses:
            cv = Canvas(cw, ch, ox, oy)
            mod.draw(cv, P)
            out[state].append(cv.image())
    return out


def frame_numbers(mod):
    """state -> the frame numbers on the sheet, in the order they are shown."""
    nums = {}
    for state, poses in mod.ANIMS.items():
        row, col = PLACE[state]
        base = [row * COLS + col + i for i in range(len(poses))]
        nums[state] = [base[i] for i in IDLE_ORDER] if state == 'idle' else base
    return nums


def sheet(mod, fr=None):
    fr = fr or frames(mod)
    cw, ch = mod.CELL
    im = Image.new('RGBA', (COLS * cw, ROWS * ch), (0, 0, 0, 0))
    for state, imgs in fr.items():
        row, col = PLACE[state]
        for i, f in enumerate(imgs):
            im.paste(f, ((col + i) * cw, row * ch))
    return im


def problems(mod, fr=None):
    """Frames whose picture touches the left, right or top edge of its cell
    (it was probably cut off), or leaves nothing on screen."""
    fr = fr or frames(mod)
    cw, ch = mod.CELL
    bad = []
    for state, imgs in fr.items():
        for i, f in enumerate(imgs):
            a = f.getchannel('A')
            box = a.getbbox()
            if box is None:
                bad.append('%s %s[%d]: empty' % (mod.__name__, state, i))
            elif box[0] == 0 or box[1] == 0 or box[2] == cw:
                bad.append('%s %s[%d]: touches the cell edge %s' % (mod.__name__, state, i, box))
    return bad
