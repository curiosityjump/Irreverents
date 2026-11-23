"""The core loops' looks, cut from the approved Drive plates (handoff-prompts/loop-art-cutouts.md; the owner's
rule, docs/mechanisms/art-pipeline.md, "Approved Drive assets first"). Each function names its plate and box;
srcimport.grab() does the cut. DRAFT: boxes, sizes, materials and ids' frame splits are first passes.

Groups (content/looks/<group>.json):
- rides: P04 chibi-vehicle-and-mount-sprite-sheet ('vehicle'), four machines/mounts, five cells a row.
"""
from PIL import Image

from px import new, paste
from srcimport import grab, ramps

RIDE = ramps('stone', 'castle', 'gold', 'wood', 'metal', 'red', 'orange', 'blue', 'teal', 'night', 'skin', 'cloud')

# ---- rides: P04 vehicle sheet. Columns and rows are the plate's own cells (alpha projection of the sheet).
# Each row is one machine; its five cells: idle, moving, moving (a second step), a crash/charge, wrecked.
# Every cell shows the same goggled rider: the plate has no empty machine (README, "No approved source found").
_COLS = [(49, 257), (299, 542), (565, 824), (856, 1133), (1154, 1404)]
_ROWS = {'plane': (36, 234), 'cart': (309, 493), 'wagon': (566, 744), 'mount': (816, 1036)}
RIDES = ('plane', 'cart', 'wagon', 'mount')
RIDE_SCALE = 0.2  # DRAFT: the rider's head then matches a hero's (about 14 px), the machine 33-48 px wide
RIDE_W, RIDE_H = 48, 44  # every frame of every ride: bottom on the canvas's foot, the rider's head at x 24


def _cell(which, i):
    y0, y1 = _ROWS[which]
    x0, x1 = _COLS[i]
    return grab('vehicle', (x0 - 10, y0 - 10, x1 + 10, y1 + 10), RIDE_SCALE, RIDE)


def _head_x(im):
    """The centre of the top 5 opaque rows: the rider's head, the one thing that holds still between frames."""
    xs = []
    top = None
    for y in range(im.height):
        row = [x for x in range(im.width) if im.getpixel((x, y))[3]]
        if row and top is None:
            top = y
        if top is not None and y < top + 5:
            xs += row
    return (min(xs) + max(xs)) // 2


def _frame(piece):
    """INTENT: anchored by the rider's head, not the bounding box, so the dust, flame or plough a frame adds
    on one side does not make the machine jump sideways as the strip plays."""
    im = new(RIDE_W, RIDE_H)
    x = RIDE_W // 2 - _head_x(piece)
    x = max(0, min(RIDE_W - piece.width, x))
    paste(im, piece, x, RIDE_H - piece.height)
    return im


def _strip(frames):
    out = new(RIDE_W * len(frames), RIDE_H)
    for i, f in enumerate(frames):
        out.paste(f, (i * RIDE_W, 0))
    return out


def ride(which, state):
    """state: idle (cell 1), moving (cells 2-3, two frames), crash (cell 4: hit for the machines, a charge for the
    mount), wrecked (cell 5: the plastered X and the smoke curl; the mount sits down, spent)."""
    cells = {'idle': [0], 'moving': [1, 2], 'crash': [3], 'wrecked': [4]}[state]
    return _strip([_frame(_cell(which, i)) for i in cells])
