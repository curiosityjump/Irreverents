"""The owner's rule (2026-11-23, docs/mechanisms/art-pipeline.md, "Approved Drive assets first"): every picture is
re-authored from an approved Drive source plate where one exists. This file cuts this lane's looks from those
plates with srcimport.grab() (crop, hard alpha, largest blob, snap to the master palette by material, majority
shrink, re-ink). Each function names its plate and box. DRAFT: boxes, sizes and materials are first passes.

Plates: P04 chibi-pixel-interactables ('interact'), P07 vibrant-platformer-interactables ('vibrant'),
P04 cantina-tavern-hub ('tavern'), P03 pixel-art-vfx-and-pickup-atlas ('vfx')."""
from PIL import Image

from px import INK, new, paste
from srcimport import grab, ramps

PARTS = ramps('stone', 'castle', 'gold', 'wood', 'metal', 'red', 'orange', 'blue', 'teal', 'night')


def fit(piece, w, h, align='bottom'):
    """Put a cut piece on a w x h canvas, bottom-centred (or centred)."""
    im = new(w, h)
    x = (w - piece.width) // 2
    y = h - piece.height if align == 'bottom' else (h - piece.height) // 2
    paste(im, piece, x, y)
    return im


# ---- the alarm bell on its post: P04 interactables, row 3 (idle, ringing) and row 4 (broken)
def bell():
    return fit(grab('interact', (1090, 595, 1250, 780), 0, PARTS, size=(16, 19)), 16, 32)


def bell_ringing():
    """4 frames: the P04 ringing post, alternated with the idle one shifted a pixel, so it swings."""
    ring = grab('interact', (1268, 585, 1440, 780), 0, PARTS, size=(17, 19))
    idle = grab('interact', (1090, 595, 1250, 780), 0, PARTS, size=(16, 19))
    frames = [fit(ring.crop((0, 0, 16, 19)), 16, 32), fit(idle, 16, 32), fit(ring.crop((1, 0, 17, 19)), 16, 32), fit(idle, 16, 32)]
    out = new(64, 32)
    for i, f in enumerate(frames):
        out.paste(f, (i * 16, 0))
    return out


def bell_broken():
    return fit(grab('interact', (98, 850, 240, 1015), 0, PARTS, size=(16, 18)), 16, 32)


# ---- floor plates: P04 interactables, row 1 (up; pressed and lit)
def plate(down):
    if down:
        return fit(grab('interact', (210, 235, 358, 322), 0, PARTS, size=(16, 7)), 16, 16)
    return fit(grab('interact', (28, 230, 172, 322), 0, PARTS, size=(16, 8)), 16, 16)


# ---- the gate: P04 interactables, row 1 (closed bars; open frame)
def gate(open_):
    if open_:
        # the raised gate's foot: the open frame's lintel and post tops, as the top tile under the lintel
        g = grab('interact', (1265, 175, 1432, 318), 0, PARTS, size=(16, 14))
        return fit(g.crop((0, 0, 16, 8)), 16, 16, align='top')
    # one tile of the closed gate, stacking: the bars from the middle of the closed gate
    g = grab('interact', (1072, 172, 1236, 318), 0, PARTS, size=(18, 24), edge=None)
    return g.crop((1, 5, 17, 21))


# ---- a doorway you go in by: P07 vibrant interactables, row 2 (a stone arch, its door swung open)
def door_enter(w, h):
    d = grab('vibrant', (212, 242, 388, 412), 0, PARTS + ramps('foliage', 'grass'), size=(16 * w + 2, 16 * h - 6))
    return fit(d, 16 * w, 16 * h)


# ---- the shop: P04 tavern counter panel; a bottle from the tavern's row 8
def shop_counter():
    return fit(grab('tavern', (98, 305, 178, 372), 0, ramps('wood', 'gold', 'earth'), size=(16, 14)), 16, 16)


def shop_goods():
    return fit(grab('tavern', (1208, 535, 1258, 602), 0, ramps('foliage', 'grass', 'metal', 'gold', 'wood'), size=(6, 8)), 8, 8)


# ---- what a broken wall leaves: P07 vibrant, row 4 (stones and dust, the dust left out by the materials)
def rubble():
    return fit(grab('vibrant', (1222, 650, 1395, 760), 0, ramps('stone', 'castle'), size=(16, 10)), 16, 16)


# ---- the quarry's one-tile hide: the same P07 rock heap; its fold is the heap's lower half
def hide_1x1():
    return fit(grab('vibrant', (1222, 650, 1395, 760), 0, ramps('stone', 'castle'), size=(16, 11)), 16, 16)


def hide_front_1x1():
    im = hide_1x1()
    out = new(16, 16)
    out.paste(im.crop((0, 10, 16, 16)), (0, 10))
    return out


# ---- the camp's horn: P07 vibrant, row 3 (a brass horn on a bracket, idle and blasting)
def horn_idle():
    return grab('vibrant', (318, 462, 445, 595), 0, ramps('gold', 'orange', 'wood', 'red'), size=(14, 14))


def horn_blast():
    return grab('vibrant', (448, 450, 605, 595), 0, ramps('gold', 'orange', 'wood', 'red'), size=(17, 15))
