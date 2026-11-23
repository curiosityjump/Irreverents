"""Round 3 pictures for the props lane (handoff-prompts/look3-props.md): the cantina, the Bandit Camp, the
quarry, the horn on the camp's post, the 1x1 hiding place; push 2 adds the effects, the HUD and the moods.

Used by make.py. DRAFT: stand-ins; most pieces are cut from the art desk's source plates by srcimport.grab()
(isolated, hard alpha, snapped to the master palette by material, speckle removed, re-inked), the rest are drawn
here in the same style. Deterministic, whole pixels, alpha 0 or 255 except glows (three levels).
"""
import math

from PIL import Image

from px import CLEAR, INK, SOFT, art, ball, col, ellipse_mask, flip, hline, line, mix, new, outline, paste, put, rect, vline
from srcimport import grab, majority_pass, ramps, reink

WOOD = [col('wood', i) for i in range(4)]
GOLD = [col('gold', i) for i in range(4)]
RED = [col('red', i) for i in range(4)]
STONE = [col('stone', i) for i in range(4)]
EARTH = [col('earth', i) for i in range(4)]
METAL = [col('metal', i) for i in range(4)]
WHITE = col('metal', 3)

# the materials each kind of piece may use (srcimport snaps to these only: 3-4 tones per material)
TAVERN = ramps('wood', 'gold', 'metal', 'earth')
BOTTLES = ramps('wood', 'gold', 'foliage', 'teal', 'red', 'pink', 'blue', 'metal')
DRAPE = ramps('red', 'gold', 'wood')
LIGHT = ramps('wood', 'gold', 'metal', 'orange', 'night')


def strip(frames):
    w, h = frames[0].size
    im = new(w * len(frames), h)
    for i, f in enumerate(frames):
        im.paste(f, (i * w, 0))
    return im


def stack(*parts, gap=0):
    """Side by side, bottoms aligned."""
    w = sum(p.width for p in parts) + gap * (len(parts) - 1)
    h = max(p.height for p in parts)
    im = new(w, h)
    x = 0
    for p in parts:
        paste(im, p, x, h - p.height)
        x += p.width + gap
    return im


def hang(piece, chain):
    """A chain of `chain` px from the ceiling down to the piece's top middle."""
    im = new(piece.width, piece.height + chain)
    cx = piece.width // 2
    for y in range(chain + 1):
        put(im, cx, y, METAL[1] if y % 3 else INK)
        put(im, cx - 1, y, INK if y % 3 == 0 else CLEAR)
    paste(im, piece, 0, chain)
    return im


# =============================================================== the cantina (P04 tavern hub, P08 furniture)

def cantina_pieces():
    p = {}
    p['bar'] = grab('fantasy', (8, 710, 224, 808), 0.26, TAVERN + ramps('cloud'))
    p['bar-bottles'] = grab('fantasy', (238, 710, 412, 808), 0.26, BOTTLES)
    p['kegs'] = grab('fantasy', (423, 710, 588, 808), 0.25, TAVERN)
    p['shelf-bottles'] = grab('tavern', (190, 380, 280, 455), 0.27, BOTTLES)
    p['shelf-plates'] = grab('tavern', (475, 380, 565, 455), 0.27, TAVERN + ramps('cloud'))
    p['keg'] = grab('tavern', (730, 380, 810, 455), 0.27, TAVERN)
    p['barrel'] = grab('tavern', (655, 380, 725, 455), 0.25, TAVERN)
    p['table'] = grab('tavern', (190, 455, 280, 530), 0.25, TAVERN + ramps('skin', 'cloud'))
    p['table-mug'] = grab('tavern', (375, 455, 465, 530), 0.22, TAVERN + ramps('cloud'))
    p['stool'] = grab('tavern', (1055, 455, 1115, 530), 0.22, TAVERN)
    p['chandelier'] = grab('fantasy', (12, 895, 122, 985), 0.27, LIGHT)
    p['lantern'] = grab('tavern', (195, 530, 255, 605), 0.3, LIGHT)
    p['swag'] = grab('tavern', (460, 600, 585, 670), 0.3, DRAPE)
    p['curtain'] = grab('tavern', (795, 600, 870, 670), 0.3, DRAPE)
    p['banner'] = grab('tavern', (280, 600, 355, 670), 0.24, DRAPE)
    p['bunting'] = grab('tavern', (1160, 600, 1275, 670), 0.3, DRAPE)
    p['mirror'] = mirror()
    return p


def mirror():
    """A small oval mirror in a gold frame, a pale sheen top-left (drawn: no source has one)."""
    im = new(14, 18)
    for (x, y) in ellipse_mask(14, 18):
        put(im, x, y, GOLD[1])
    for (x, y) in ellipse_mask(10, 14):
        put(im, x + 2, y + 2, col('sky', 1))
    for (x, y) in ellipse_mask(10, 14):
        if x + y < 7:
            put(im, x + 2, y + 2, col('sky', 3))
        elif x + y > 15:
            put(im, x + 2, y + 2, col('sky', 0))
    for (x, y) in ellipse_mask(14, 18):
        if (x + y) < 8 and get_a(im, x, y) == GOLD[1]:
            put(im, x, y, GOLD[2])
    big = new(16, 20)
    paste(big, im, 1, 1)
    return outline(big)


def get_a(im, x, y):
    return im.getpixel((x, y)) if 0 <= x < im.width and 0 <= y < im.height else CLEAR


# =============================================================== the Bandit Camp (drawn)

def tent(w=40, h=34, cloth='red', seed=0):
    """A ridge tent seen from the front: two sloped canvas sides, a dark open flap, a pole on top, pegs."""
    im = new(w + 2, h + 2)
    C = [col(cloth, i) for i in range(4)]
    cx = w // 2 + 1
    for y in range(4, h):
        half = int((y - 3) * (w / 2 - 1) / (h - 4)) + 1
        for x in range(cx - half, cx + half + 1):
            # stripes on the canvas, lighter on the left (the light is top-left)
            stripe = ((x - cx) // 5) % 2 == 0
            c = C[2] if x < cx else C[1]
            if stripe:
                c = col('skin', 2) if x < cx else col('skin', 1)
            put(im, x, y, c)
    # the open flap: a dark triangle
    for y in range(h - 16, h):
        half = (y - (h - 16)) // 2
        for x in range(cx - half, cx + half + 1):
            put(im, x, y, col('night', 1) if abs(x - cx) < half else C[0])
    # seam down the middle
    for y in range(4, h - 16):
        put(im, cx, y, C[0])
    # pole and pennant
    vline(im, cx, 0, 5, WOOD[1])
    art(im, cx + 1, 0, ['rrr', 'rr.'], {'r': RED[2]})
    im = outline(im)
    return im


def palisade():
    """A run of pointed stakes 16 px wide, 40 tall, for the far layer (greyed, soft edge, no ink)."""
    im = new(16, 40)
    for i, x0 in enumerate((0, 5, 10)):
        top = 2 + (i * 3) % 5
        for y in range(top, 40):
            for x in range(x0, x0 + 5):
                tip = y - top < 3 and abs(x - (x0 + 2)) > (y - top)
                if tip:
                    continue
                c = WOOD[2] if x == x0 + 1 else WOOD[1] if x < x0 + 4 else WOOD[0]
                put(im, x, y, c)
        hline(im, x0, 12, 5, mix(WOOD[0], INK, 0.3))
        hline(im, x0, 30, 5, mix(WOOD[0], INK, 0.3))
    # rope lashing
    for x in range(16):
        put(im, x, 13, EARTH[3] if x % 2 else EARTH[2])
        put(im, x, 31, EARTH[3] if x % 2 else EARTH[2])
    # far layer: a step toward the distance, a soft edge instead of ink
    out = new(16, 40)
    for y in range(40):
        for x in range(16):
            c = im.getpixel((x, y))
            if c[3]:
                out.putpixel((x, y), mix(c, col('far', 1), 0.3))
    return out


def campfire():
    """Logs crossed under a three-tongue flame. 20 x 18."""
    im = new(22, 20)
    F = {'k': INK, 'r': col('red', 1), 'o': col('orange', 1), 'O': col('orange', 2), 'y': GOLD[2], 'Y': GOLD[3], 'W': WHITE}
    art(im, 3, 0, [
        '.......r........',
        '......rr........',
        '.....rOr...r....',
        '..r..rOOr..rr...',
        '..rr.rOyOr.rOr..',
        '..rOrOyYOr.rOr..',
        '..rOOOyYyOrOOr..',
        '..rOyyYWYyOyOr..',
        '...rOyYWYyyOr...',
        '....rOyYYyOr....',
        '.....rrOOrr.....',
    ], F)
    W = {'a': WOOD[0], 'b': WOOD[1], 'c': WOOD[2], 'd': WOOD[3], 'k': INK, 's': STONE[1], 'S': STONE[2], 't': STONE[3]}
    art(im, 1, 11, [
        '..dc...........cd...',
        '...bcc.......ccb....',
        '.....bcc...ccb......',
        '.......bccccb.......',
        '.....ccbbaabcc......',
        '...ccba.....abcc....',
        '.tSs..tSs.tSs..tSs..',
        'tSSs.tSSsSSss.tSSs..',
    ], W)
    return outline(im)


def weapon_rack():
    """A wooden A-frame rack holding two spears and an axe. 24 x 30."""
    im = new(26, 32)
    # spears
    for x in (6, 12):
        vline(im, x, 3, 26, WOOD[2])
        vline(im, x + 1, 3, 26, WOOD[1])
        art(im, x - 1, 0, ['.m.', 'mMm', 'mMm', '.k.'], {'m': METAL[1], 'M': METAL[3], 'k': INK})
    # axe
    vline(im, 18, 6, 23, WOOD[2]); vline(im, 19, 6, 23, WOOD[1])
    art(im, 15, 4, ['.mmm..', 'mMMm..', 'mMMmk.', 'mMmm..', '.mm...'], {'m': METAL[1], 'M': METAL[2], 'k': INK})
    # rack frame: two rails and feet
    rect(im, 2, 12, 22, 2, WOOD[2]); hline(im, 2, 13, 22, WOOD[1])
    rect(im, 2, 24, 22, 2, WOOD[2]); hline(im, 2, 25, 22, WOOD[1])
    for x in (2, 22):
        vline(im, x, 10, 21, WOOD[1]); vline(im, x + 1, 10, 21, WOOD[0])
    return outline(im)


def crate():
    im = new(16, 15)
    rect(im, 1, 1, 14, 13, WOOD[2])
    for y in (1, 13):
        hline(im, 1, y, 14, WOOD[1])
    for x in (1, 14):
        vline(im, x, 1, 13, WOOD[1])
    line(im, 2, 12, 13, 2, WOOD[1]); line(im, 2, 11, 12, 2, WOOD[3])
    hline(im, 1, 1, 13, WOOD[3])
    return outline(im)


def flagpole():
    """The camp's own flag on a pole: a ragged black-and-red pennant. 18 x 44."""
    im = new(20, 46)
    vline(im, 2, 2, 43, WOOD[2]); vline(im, 3, 2, 43, WOOD[1])
    put(im, 2, 1, GOLD[2]); put(im, 3, 1, GOLD[1])
    for y in range(3, 15):
        w = 14 - abs(y - 9) // 2
        for x in range(4, 4 + w):
            if y in (13, 14) and x % 3 == 0:
                continue
            put(im, x, y, RED[1] if y > 9 else RED[2])
    art(im, 8, 6, ['.kk.', 'kkkk', 'k..k', '.kk.'], {'k': col('night', 1)})
    rect(im, 0, 43, 6, 2, STONE[1]); hline(im, 0, 43, 6, STONE[2])
    return outline(im)


# =============================================================== the quarry (drawn)

def rock_pile(w=20, h=12, seed=0, ramp='stone'):
    """Boulders heaped up: round masses in flat bands, one ink outline."""
    im = new(w + 2, h + 2)
    rs = [(1, h // 3, w // 2, h - h // 3), (w // 3, 1, w // 2, h - 2), (w // 2, h // 3 + 1, w // 2, h - h // 3 - 1)]
    if seed % 2:
        rs = rs[::-1]
    for (x, y, bw, bh) in rs:
        ball(im, x + 1, y + 1, bw, bh, ramp)
    return outline(im)


def timber_post(h=48):
    """A squared mine timber: post, cap beam and a diagonal brace. For the far layer: soft edge."""
    im = new(20, h)
    vline(im, 3, 4, h - 4, WOOD[2]); vline(im, 4, 4, h - 4, WOOD[1]); vline(im, 5, 4, h - 4, WOOD[1]); vline(im, 6, 4, h - 4, WOOD[0])
    rect(im, 0, 0, 20, 4, WOOD[1]); hline(im, 0, 0, 20, WOOD[3]); hline(im, 0, 3, 20, WOOD[0])
    for i in range(10):
        put(im, 7 + i, 4 + i, WOOD[2]); put(im, 7 + i, 5 + i, WOOD[1])
    for y in range(8, h, 11):
        put(im, 4, y, WOOD[0])
    out = new(20, h)
    for y in range(h):
        for x in range(20):
            c = im.getpixel((x, y))
            if c[3]:
                out.putpixel((x, y), mix(c, col('stone', 1), 0.25))
    return out


def scaffold(w=32, h=48):
    """Two posts, two cross-boards and planks: a builder's scaffold against the rock (far layer)."""
    im = new(w, h)
    for x in (2, w - 5):
        rect(im, x, 0, 3, h, WOOD[1]); vline(im, x, 0, h, WOOD[2])
    for y in (6, h // 2 + 2):
        rect(im, 0, y, w, 3, WOOD[2]); hline(im, 0, y + 2, w, WOOD[0]); hline(im, 0, y, w, WOOD[3])
    line(im, 5, 9, w - 6, h // 2 + 1, WOOD[1])
    out = new(w, h)
    for y in range(h):
        for x in range(w):
            c = im.getpixel((x, y))
            if c[3]:
                out.putpixel((x, y), mix(c, col('stone', 1), 0.3))
    return out


def mine_lantern():
    """A lantern hanging from a hook on a short chain (the lights the cave and the pit already need)."""
    return grab('fantasy', (228, 905, 298, 995), 0.3, LIGHT)


def _heap(im, stones):
    for (x0, y0, w, h) in stones:
        sub = new(w, h)
        ball(sub, 0, 0, w, h, 'stone')
        paste(im, sub, x0, y0)


def hide_1x1():
    """The quarry's hiding place one tile big: two boulders and a capstone leaning together over a dark
    crevice at the foot, wide enough for someone small to tuck into. 16 x 16."""
    im = new(16, 16)
    _heap(im, ((0, 5, 9, 11), (7, 4, 9, 12), (3, 0, 10, 7)))
    # the crevice: a dark wedge from the foot up between the two boulders
    for y in range(7, 16):
        half = (y - 7) // 2
        for x in range(8 - half - 1, 8 + half + 1):
            put(im, x, y, col('night', 1) if abs(x - 7.5) < half else col('night', 2))
    return reink(im)


def hide_front_1x1(back=None):
    """The front fold: the foot of the two boulders, drawn over a hidden body (its head shows above)."""
    im = new(16, 16)
    _heap(im, ((0, 9, 7, 7), (9, 9, 7, 7), (4, 12, 8, 4)))
    return reink(im)


# =============================================================== the horn on the camp's post

HORN_BOX = (226, 846, 282, 916)  # the right-hand horn of the villain sheet's horn post (idle), mouth right


def horn():
    return grab('villain', HORN_BOX, 0.24, ramps('gold', 'orange', 'wood'))


def signaler_frames():
    """Each look is 32 x 48, bottom-centre on the post (its box is 10 x 32: x 11..20, y 16..47)."""
    h = horn()  # about 18 x 16, mouth right
    # working: hung on a peg on the post's right side, a strap over the top
    work = new(32, 48)
    rect(work, 19, 21, 3, 2, WOOD[0])  # the peg
    paste(work, h, 18, 18)
    line(work, 16, 17, 21, 19, EARTH[1])
    # sounding: raised to the sky (mouth up), shaking, with sound lines; three frames
    up = h.transpose(Image.ROTATE_90)  # mouth up
    frames = []
    for i, shake in enumerate((-1, 1, 0)):
        f = new(32, 48)
        paste(f, up, 16 - up.width // 2 + shake, 17 - up.height)
        # sound lines either side of the mouth, alternating length
        for side in (-1, 1):
            for k, (dx, dy, n) in enumerate(((7, 1, 3), (10, 5, 4), (7, 9, 3))):
                ln = n + (1 if (i + k) % 2 else 0)
                x0 = 16 + side * dx + shake
                for t in range(ln):
                    y = dy + (-t if k == 0 else t if k == 2 else 0)
                    put(f, x0 + side * t, y, WHITE if t < ln - 1 else GOLD[3])
                    put(f, x0 + side * t, y + 1, INK)
        frames.append(f)
    # broken: a splintered top over the post, the horn lying dented at the foot
    br = new(32, 48)
    art(br, 10, 12, [
        '..k...k..k..',
        '.kck.kdk.kk.',
        '.kcbkcdbkck.',
        'kcbbbcbbbcbk',
        'kbbbbbbbbbak',
    ], {'k': INK, 'a': WOOD[0], 'b': WOOD[1], 'c': WOOD[2], 'd': WOOD[3]})
    lying = h.transpose(Image.ROTATE_270 if False else Image.FLIP_TOP_BOTTOM).rotate(0)
    lying = lying.crop((0, 0, lying.width, lying.height))
    paste(br, lying, 32 - lying.width, 48 - lying.height)
    # a dent: two ink pixels in the bell
    put(br, 32 - 4, 48 - lying.height + 4, INK)
    put(br, 32 - 5, 48 - lying.height + 5, INK)
    return work, strip(frames), br


def reink_lines(f):
    """Sound lines get a 1 px ink edge so they read on sky and on canvas alike; the horn keeps its own."""
    return outline(f)


# =============================================================== glows (round 2's rings, used here too)

def glow(r_outer, alphas=(28, 52, 92)):
    size = r_outer * 2
    im = new(size, size)
    cols = [col('orange', 1), col('orange', 2), GOLD[3]]
    for ring, (r, a) in enumerate(zip((r_outer, r_outer * 0.66, r_outer * 0.36), alphas)):
        c = cols[ring][:3] + (a,)
        for y in range(size):
            for x in range(size):
                if (x + 0.5 - r_outer) ** 2 + (y + 0.5 - r_outer) ** 2 <= r * r:
                    put(im, x, y, c)
    return im
