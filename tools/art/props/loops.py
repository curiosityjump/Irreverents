"""The core loops' looks, cut from the approved Drive plates (handoff-prompts/loop-art-cutouts.md; the owner's
rule, docs/mechanisms/art-pipeline.md, "Approved Drive assets first"). Each function names its plate and box;
srcimport.grab() does the cut. DRAFT: boxes, sizes, materials and ids' frame splits are first passes.

Groups (content/looks/<group>.json):
- rides: P04 chibi-vehicle-and-mount-sprite-sheet ('vehicle'), four machines/mounts, five cells a row.
- powers: P05 rare-powers-pickups ('powers'): power orbs, loose pieces, fixtures, the pickup glow and get, the
  "lost" pop, a cloud poof.
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


# ---- rare powers and pickups: P05 rare-powers-pickups ('powers'), painted on an opaque pale ground (key=)
P05KEY = (247, 245, 243)
POWER = ramps('gold', 'orange', 'red', 'blue', 'sky', 'purple', 'teal', 'metal', 'cloud', 'wood', 'night', 'pink',
              'foliage', 'grass', 'stone')
GLOW = ramps('gold', 'orange', 'purple', 'sky', 'cloud')
# row 2: nine power orbs, named by what the plate paints in them (a shown name is data: these are pictures)
ORBS = {'fire': (48, 122), 'ice': (135, 208), 'bolt': (220, 294), 'moon': (305, 378), 'wing': (388, 457),
        'gear': (465, 534), 'bomb': (542, 608), 'star': (615, 681), 'swirl': (688, 754)}
# row 4: nine loose pieces
ITEMS = {'gear': (45, 123), 'lens': (130, 206), 'pipe': (217, 299), 'crystal': (310, 366), 'spring': (380, 426),
         'book': (440, 523), 'hook': (532, 584), 'ring': (607, 658), 'feather': (675, 749)}
# row 1: six fixtures a power comes from
FIXTURES = {'crystal': (47, 176), 'orrery': (184, 283), 'tree': (290, 408), 'shrine': (414, 531),
            'brazier': (539, 626), 'portal': (632, 762)}
# row 5: the pickup sequence (ring, sparkles, column, burst, flash) and a cloud poof; the plate cuts them at y 512
SEQ = [(45, 151), (165, 260), (276, 371), (385, 487), (505, 593)]
POOF = (602, 742)


def orb(which):
    x0, x1 = ORBS[which]
    # DRAFT: 20 px: at 16 the plate's glyph (flame, flake, bolt...) turned to mush
    return grab('powers', (x0 - 3, 140, x1 + 3, 219), 0, POWER, key=P05KEY, size=(20, 20))


def item(which):
    x0, x1 = ITEMS[which]
    return grab('powers', (x0 - 3, 338, x1 + 3, 426), 0.2, POWER, key=P05KEY)


def fit_item(piece):
    """every loose piece on an 18 x 16 cell, bottom-centred (it lies on the floor)"""
    out = new(18, 16)
    paste(out, piece, (18 - piece.width) // 2, 16 - piece.height)
    return out


def fixture(which):
    x0, x1 = FIXTURES[which]
    g = grab('powers', (x0 - 3, 8, x1 + 3, 134), 0.25, POWER, key=P05KEY)
    out = new(32, 32)
    paste(out, g, (32 - g.width) // 2, 32 - g.height)
    return out


def _fx(box, size, pal=GLOW):
    return grab('powers', box, 0, pal, key=P05KEY, largest=False, edge=None, dark_ink=40, size=size)


def _row(frames, w, h, align='bottom'):
    out = new(w * len(frames), h)
    for i, f in enumerate(frames):
        y = h - f.height if align == 'bottom' else (h - f.height) // 2
        paste(out, f, i * w + (w - f.width) // 2, y)
    return out


def pickup_glow():
    """3 frames, looping under a pickup lying on the floor: the plate's ring, then the ring with sparkles rising."""
    return _row([_fx((x0, 430, x1, 512), (22, 16)) for x0, x1 in SEQ[:3]], 24, 16)


def pickup_get():
    """3 frames, once, when a pickup is taken: the column of light, the burst, the star flash."""
    return _row([_fx((x0, 426, x1, 512), (22, 22)) for x0, x1 in SEQ[2:]], 24, 24)


def power_lost():
    """INTENT: the "lost" pop as the plate draws it (row 3): the hit spark, the stars over the knocked head, the
    orb flying off on its swoosh. 3 frames, once, at the hero who lost the power; the orb then lies as pickup-*."""
    spark = _fx((146, 225, 192, 290), (14, 16))
    stars = _fx((196, 224, 296, 262), (22, 10))
    fly = grab('powers', (353, 223, 452, 326), 0, POWER, key=P05KEY, largest=False, edge=None, dark_ink=40, size=(22, 22))
    return _row([spark, stars, fly], 24, 24, align='middle')


def poof():
    """3 frames: the plate's cloud poof, then the same cut smaller twice (the cloud shrinking away)."""
    cut = lambda w, h: _fx((POOF[0], 430, POOF[1], 512), (w, h), ramps('cloud', 'purple', 'sky'))
    return _row([cut(24, 14), cut(18, 10), cut(12, 7)], 24, 14)

