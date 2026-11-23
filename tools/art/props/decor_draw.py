"""Decoration pictures: town, courtyard, castle interior (throne room, hall), undercroft.
Things on the `back` layer (in front of the ground, behind bodies) get the full palette and an ink outline.
Things on the `far` layer (on the back wall, behind the ground) are greyed, flatter and have no dark outline,
so nobody mistakes them for something to stand on."""
import math
from px import *

WHITE = (255, 255, 255, 255)


def ramp(name):
    return [col(name, i) for i in range(len(P[name]))]


def grey(c, t=0.4, to='far', i=2):
    """Push a palette colour towards the distance (far layer): lighter and greyer."""
    return mix(c if isinstance(c, tuple) else col(c), col(to, i), t)


def dim(c, t=0.4):
    """Push a palette colour into the undercroft's dark."""
    return mix(c if isinstance(c, tuple) else col(c), col('night', 1), t)


def cluster(w, h, balls, name, margin=1):
    """A leafy mass: overlapping round masses in one ramp, then one ink outline round the lot.
    balls: (x, y, w, h) drawn in order (back to front)."""
    im = new(w, h)
    for (x, y, bw, bh) in balls:
        ball(im, x, y, bw, bh, name)
    return im


# =============================================================== TOWN
def barrel(wd=None, hoop=None, w=14, h=16):
    wd = wd or ramp('wood'); hoop = hoop or ramp('metal')
    im = new(w, h)
    for y in range(1, h - 1):
        # the bulge: narrow at the ends, full in the middle
        t = abs((y - (h - 1) / 2.0) / ((h - 1) / 2.0))
        inset = 1 + (2 if t > 0.85 else 1 if t > 0.55 else 0)
        for x in range(inset, w - inset):
            u = (x - inset) / float(w - 2 * inset - 1)
            c = wd[3] if 0.12 < u < 0.3 else wd[2] if u < 0.62 else wd[1] if u < 0.85 else wd[0]
            if u <= 0.12:
                c = wd[2]
            if (x - inset) % 3 == 2 and 0 < u < 0.9:
                c = wd[1] if c != wd[0] else wd[0]  # the gaps between staves
            put(im, x, y, c)
    for hy in (3, h - 5):
        for x in range(w):
            if get(im, x, hy)[3]:
                u = x / float(w - 1)
                put(im, x, hy, hoop[2] if u < 0.4 else hoop[1] if u < 0.75 else hoop[0])
                put(im, x, hy + 1, hoop[1] if u < 0.4 else hoop[0])
    # the lid's rim
    for x in range(w):
        if get(im, x, 1)[3]:
            put(im, x, 1, wd[3] if x < w * 0.6 else wd[2])
    return outline(im)


def lamp():
    """A street lamp: iron post, a little lantern of gold glass. 16 x 46."""
    im = new(16, 46)
    M = ramp('metal'); G = ramp('gold')
    iron = [mix(M[0], INK, 0.55), mix(M[0], INK, 0.2), M[1]]
    L = {'k': INK, 'a': iron[0], 'b': iron[1], 'c': iron[2], 'y': G[2], 'Y': G[3], 'g': G[1], 'W': WHITE}
    art(im, 1, 0, [
        '......cb......',
        '.....cbbb.....',
        '...cbbbbbba...',
        '..cbbbbbbbbba.',
        '...aYYyyyga...',
        '...aYWyyyga...',
        '...aYyyyyga...',
        '...ayyyygga...',
        '...ayyyggga...',
        '....abbbba....',
        '.....cbba.....',
    ], L)
    for y in range(11, 42):
        put(im, 7, y, iron[2] if y % 9 < 6 else iron[1]); put(im, 8, y, iron[1]); put(im, 9, y, iron[0])
    # a collar and the foot
    art(im, 5, 16, ['.cbba.', 'cbbbba', '.cbba.'], L)
    art(im, 3, 40, ['...cbba...', '..cbbbba..', '.cbbbbbba.', 'cbbbbbbbba', 'bbbbbbbbba', 'aaaaaaaaaa'], L)
    return outline(im)


def stall(tiles=5):
    """A market stall: two posts and a striped awning with a scalloped edge, a picture sign, a display cloth
    on the ground. Stands tiles*16 wide (+2 each side) and 64 tall (floor to the overhang above)."""
    W, H = tiles * 16 + 4, 64
    im = new(W, H)
    wd = ramp('wood'); R = ramp('red'); C = [col('cloud', 0), WHITE]
    # posts
    for px0 in (2, W - 6):
        for y in range(12, H):
            put(im, px0, y, wd[3]); put(im, px0 + 1, y, wd[2]); put(im, px0 + 2, y, wd[1]); put(im, px0 + 3, y, wd[0])
        for y in range(18, H, 11):
            put(im, px0 + 1, y, wd[1]); put(im, px0 + 2, y, wd[0])
    # crossbar under the awning
    for x in range(2, W - 2):
        put(im, x, 17, wd[2]); put(im, x, 18, wd[0])
    # the awning: stripes run down the slope, each 6 px; a lit top band, a shaded skirt with scallops
    for x in range(1, W - 1):
        s = ((x - 1) // 6) % 2
        for y in range(1, 15):
            if y < 3:
                c = R[3] if s == 0 else WHITE
            elif y < 10:
                c = R[2] if s == 0 else WHITE
            else:
                c = R[1] if s == 0 else C[0]
            put(im, x, y, c)
        # scallop: each stripe ends in a rounded tongue
        k = (x - 1) % 6
        drop = [1, 2, 3, 3, 2, 1][k]
        for y in range(15, 15 + drop):
            put(im, x, y, R[1] if s == 0 else C[0])
        if k in (0, 5):
            put(im, x, 14, R[0] if s == 0 else mix(C[0], col('stone', 2), 0.5))
    # the skirt's fold line
    for x in range(1, W - 1):
        s = ((x - 1) // 6) % 2
        put(im, x, 10, R[0] if s == 0 else mix(C[0], col('stone', 2), 0.6))
    im = outline(im)
    # the picture sign hanging from the right post: a bottle on a board
    L = leg(abcd='wood', t=col('teal', 2), T=col('teal', 3), u=col('teal', 1))
    sign = from_art([
        '....kk...kk.',
        '....kk...kk.',
        '.kkkkkkkkkkk',
        'kddddddddddk',
        'kdccckkccbbk',
        'kdcckTtkcbbk',
        'kdckTttukbbk',
        'kdckttuukbak',
        'kdcckuukbbak',
        'kcbbbkkbbaak',
        '.kkkkkkkkkk.',
    ], L)
    paste(im, sign, W - 21, 19)
    return im


def display_cloth(tiles=3):
    """The cloth the shop's goods sit on, flat on the ground: tiles*16 x 3."""
    W = tiles * 16
    im = new(W, 4)
    B = ramp('blue'); G = ramp('gold')
    for x in range(1, W - 1):
        put(im, x, 1, B[2] if (x // 4) % 2 == 0 else G[2])
        put(im, x, 2, B[1] if (x // 4) % 2 == 0 else G[1])
        put(im, x, 3, B[0] if (x // 4) % 2 == 0 else G[0])
    for x in range(1, W - 1):
        put(im, x, 0, INK)
    put(im, 0, 1, INK); put(im, 0, 2, INK); put(im, 0, 3, INK); put(im, W - 1, 1, INK); put(im, W - 1, 2, INK); put(im, W - 1, 3, INK)
    return im


def bunting(W=96, sag=7):
    """A line of little flags between two roofs. Far layer: light colours, no dark outline."""
    H = sag + 12
    im = new(W, H)
    hues = ['red', 'gold', 'blue', 'teal', 'pink']
    line_c = grey(col('wood', 1), 0.3)

    def ly(x):
        t = x / float(W - 1)
        return int(round(1 + sag * 4 * t * (1 - t)))

    n = 0
    x = 4
    while x + 7 < W - 3:
        hue = hues[n % len(hues)]
        a, b = grey(col(hue, 2), 0.22), grey(col(hue, 1), 0.22)
        y0 = max(ly(x), ly(x + 6)) + 1
        for j in range(7):
            half = 3 - (j + 1) // 2
            for i in range(-half, half + 1):
                put(im, x + 3 + i, y0 + j, a if i <= 0 else b)
        n += 1
        x += 10
    for x in range(W):
        put(im, x, ly(x), line_c)
    return im


def front(wt, ht, seed=1, posts=True):
    """A house front, wt x ht tiles: pale plaster between timbers on a stone footing. Far layer."""
    W, H = wt * 16, ht * 16
    im = new(W, H)
    pl = [grey(col('skin', 2), 0.5), grey(col('skin', 2), 0.3), grey(col('skin', 2), 0.12)]
    tb = [grey(col('wood', 0), 0.35), grey(col('wood', 1), 0.35), grey(col('wood', 2), 0.4)]
    st = [grey(col('stone', 1), 0.35), grey(col('stone', 2), 0.35), grey(col('stone', 3), 0.3)]
    for y in range(H):
        for x in range(W):
            c = pl[1]
            # quiet blotches so the plaster is not a flat sheet
            if hsh(x // 6, y // 3, seed) % 13 == 0:
                c = pl[0]
            if hsh(x // 7, y // 2, seed + 7) % 29 == 0:
                c = pl[2]
            put(im, x, y, c)
    # footing
    for y in range(H - 7, H):
        for x in range(W):
            row = (y - (H - 7))
            c = st[2] if row == 0 else st[1]
            if row in (3,) or (row < 3 and (x + 5) % 12 == 0) or (row > 3 and x % 12 == 0):
                c = st[0]
            put(im, x, y, c)
    # timbers: a beam along the top, a rail, uprights
    for x in range(W):
        for y in range(0, 4):
            put(im, x, y, tb[2] if y == 0 else tb[1] if y < 3 else tb[0])
    ups = [0, W - 4]
    if posts:
        n = max(1, wt // 3)
        for i in range(1, n):
            ups.append(int(round(i * W / float(n))) - 2)
    for ux in ups:
        for y in range(4, H - 7):
            put(im, ux, y, tb[2]); put(im, ux + 1, y, tb[1]); put(im, ux + 2, y, tb[1]); put(im, ux + 3, y, tb[0])
    return im


def interior(wt, ht, seed=3):
    """The inside wall of a room up in a building: dim boards. Far layer."""
    W, H = wt * 16, ht * 16
    im = new(W, H)
    a = [mix(col('wood', 0), col('ink', 0), 0.35), mix(col('wood', 0), col('ink', 1), 0.15), mix(col('wood', 1), col('ink', 1), 0.35)]
    for y in range(H):
        for x in range(W):
            c = a[1]
            if x % 8 == 7:
                c = a[0]
            elif x % 8 == 0:
                c = a[2]
            if hsh(x // 8, y // 13, seed) % 5 == 0 and y % 13 == 12:
                c = a[0]
            put(im, x, y, c)
    for x in range(W):
        put(im, x, H - 1, a[0]); put(im, x, H - 2, a[0]); put(im, x, H - 3, a[2])
    return im


def shutter_window(box=True):
    """A shuttered window with a flower box. Far layer: 22 x 26."""
    im = new(22, 26)
    fr = [grey(col('wood', 0), 0.25), grey(col('wood', 1), 0.25), grey(col('wood', 2), 0.3)]
    sh = [grey(col('teal', 0), 0.3), grey(col('teal', 1), 0.3), grey(col('teal', 2), 0.35)]
    gl = [grey(col('blue', 0), 0.35), grey(col('blue', 1), 0.4), grey(col('sky', 2), 0.2)]
    # shutters
    for (x0, lit) in ((0, True), (17, False)):
        for y in range(2, 19):
            for x in range(x0, x0 + 5):
                c = sh[1]
                if x == x0:
                    c = sh[2]
                if x == x0 + 4:
                    c = sh[0]
                if y % 4 == 1:
                    c = sh[0]
                put(im, x, y, c)
    # frame and glass
    for y in range(1, 20):
        for x in range(5, 17):
            edge = x in (5, 16) or y in (1, 19)
            if edge:
                put(im, x, y, fr[2] if (x == 5 or y == 1) else fr[0])
            else:
                c = gl[0]
                if (x + y) % 9 in (0, 1) and x < 13:
                    c = gl[1]
                put(im, x, y, c)
    for y in range(2, 19):
        put(im, 10, y, fr[1]); put(im, 11, y, fr[0])
    for x in range(6, 16):
        put(im, x, 10, fr[1])
    # sill
    for x in range(4, 18):
        put(im, x, 20, fr[2]); put(im, x, 21, fr[0])
    if box:
        ea = [grey(col('earth', 0), 0.25), grey(col('earth', 1), 0.25), grey(col('earth', 2), 0.3)]
        for x in range(4, 18):
            put(im, x, 22, ea[2]); put(im, x, 23, ea[1]); put(im, x, 24, ea[1]); put(im, x, 25, ea[0])
        fo = [grey(col('foliage', 1), 0.2), grey(col('foliage', 2), 0.2)]
        fl = [grey(col('pink', 2), 0.12), grey(col('red', 2), 0.12), grey(col('gold', 2), 0.12)]
        for i, x in enumerate(range(4, 18)):
            put(im, x, 21, fo[i % 2]); put(im, x, 20, fo[(i + 1) % 2] if i % 3 else None)
        for i, x in enumerate((5, 8, 11, 14, 16)):
            put(im, x, 19, fl[i % 3]); put(im, x, 20, fl[i % 3]); put(im, x + (1 if i % 2 else -1), 20, fl[i % 3])
    return im


def painted_door():
    """A shut, painted plank door on a house front (not a doorway: no dark opening). Far layer: 16 x 28."""
    im = new(16, 28)
    fr = [grey(col('stone', 1), 0.3), grey(col('stone', 2), 0.3), grey(col('stone', 3), 0.25)]
    dr = [grey(col('foliage', 0), 0.3), grey(col('foliage', 1), 0.35), grey(col('foliage', 2), 0.4)]
    g = grey(col('gold', 2), 0.15)
    ir = grey(col('ink', 1), 0.25)
    for y in range(28):
        inset = [5, 3, 2, 1, 1][y] if y < 5 else 0
        for x in range(inset, 16 - inset):
            edge = x < inset + 2 or x >= 16 - inset - 2 or y < 2 or (y < 5 and (x < inset + 3 or x >= 16 - inset - 3))
            if edge:
                put(im, x, y, fr[2] if x < 8 else fr[0] if x >= 14 - inset else fr[1])
            else:
                c = dr[1]
                if x % 3 == 1:
                    c = dr[0]
                if x == inset + 2 or y == 2:
                    c = dr[2]
                put(im, x, y, c)
    for x in range(2, 7):
        put(im, x, 8, ir); put(im, x, 21, ir)
    put(im, 11, 15, g); put(im, 11, 16, g); put(im, 12, 15, WHITE); put(im, 12, 16, g)
    for x in range(16):
        put(im, x, 27, fr[1]); put(im, x, 26, fr[2])
    return im


def hang_sign(kind=0):
    """A picture sign on an iron bracket (no letters). Far layer: 18 x 16."""
    im = new(18, 16)
    ir = grey(col('ink', 1), 0.2)
    wd = [grey(col('wood', 0), 0.2), grey(col('wood', 1), 0.2), grey(col('wood', 2), 0.25), grey(col('wood', 3), 0.25)]
    for x in range(0, 16):
        put(im, x, 1, ir)
    put(im, 0, 0, ir); put(im, 0, 2, ir); put(im, 1, 2, ir); put(im, 2, 3, ir)
    put(im, 5, 2, ir); put(im, 5, 3, ir); put(im, 14, 2, ir); put(im, 14, 3, ir)
    for y in range(4, 15):
        for x in range(3, 17):
            c = wd[2]
            if y == 4 or x == 3:
                c = wd[3]
            if y == 14 or x == 16:
                c = wd[0]
            put(im, x, y, c)
    if kind == 0:  # a mug
        m = grey(col('gold', 2), 0.1); f = WHITE
        for y in range(7, 13):
            for x in range(7, 12):
                put(im, x, y, m if y > 7 else f)
        pts(im, f, (6, 7), (12, 7), (8, 6), (10, 6))
        pts(im, m, (12, 9), (13, 9), (13, 10), (12, 11), (13, 11))
        pts(im, grey(col('gold', 0), 0.1), (11, 9), (11, 10), (11, 11), (11, 12))
    else:  # a key
        k = grey(col('gold', 2), 0.1)
        pts(im, k, (6, 8), (7, 7), (8, 8), (7, 9), (6, 9), (8, 9), (6, 7), (8, 7))
        for x in range(9, 15):
            put(im, x, 8, k)
        pts(im, k, (12, 9), (14, 9), (14, 10))
    return im


def chimney():
    """A brick chimney for a roof. Back layer (it stands on the roof): 12 x 18."""
    im = new(12, 18)
    R = [col('earth', 0), col('earth', 1), col('earth', 2), col('earth', 3)]
    S = ramp('stone')
    for y in range(5, 18):
        for x in range(2, 10):
            c = R[2] if x < 5 else R[1]
            if x >= 8:
                c = R[0]
            if (y % 4 == 0) or ((x + (2 if (y // 4) % 2 else 0)) % 4 == 0 and y % 4):
                c = R[0] if x >= 5 else R[1]
            put(im, x, y, c)
    for x in range(1, 11):
        put(im, x, 3, S[3] if x < 7 else S[2]); put(im, x, 4, S[1])
    for x in range(3, 9):
        put(im, x, 1, S[2]); put(im, x, 2, S[0])
    return outline(im)


def planter(seed=0):
    """A stone trough of flowers on the street. Back layer: 18 x 16."""
    im = new(18, 16)
    S = ramp('stone')
    for y in range(9, 15):
        for x in range(1 + (y > 12), 17 - (y > 12)):
            c = S[2]
            if y == 9:
                c = S[3]
            if x > 12 or y > 12:
                c = S[1]
            put(im, x, y, c)
    F = ramp('foliage')
    for x in range(2, 16):
        hgt = 2 + hsh(x, seed) % 3
        for j in range(hgt):
            put(im, x, 8 - j, F[2] if (x + j) % 3 else F[1])
        if hsh(x, seed, 5) % 3 == 0:
            put(im, x, 8 - hgt, F[3])
    hues = ['pink', 'gold', 'red']
    for i, x in enumerate((3, 7, 11, 14)):
        hue = hues[(i + seed) % 3]
        y = 3 + hsh(i, seed, 9) % 2
        pts(im, col(hue, 2), (x, y), (x - 1, y + 1), (x + 1, y + 1), (x, y + 2))
        pts(im, col(hue, 3), (x - 1, y)), pts(im, col('gold', 3), (x, y + 1))
    return outline(im)


# =============================================================== COURTYARD
def bush(w=26, h=16):
    balls = [(0, h - 11, 12, 11), (w - 13, h - 12, 13, 12), (6, 1, 14, 14), (3, h - 8, 20, 8)]
    im = new(w + 2, h + 1)
    c = cluster(w, h, balls, 'foliage')
    paste(im, c, 1, 1)
    F = ramp('foliage')
    # leaf flecks so the mass is not a balloon
    for (x, y) in ((6, 9), (9, 5), (14, 4), (12, 8), (18, 9), (21, 7), (16, 12), (8, 13), (4, 12)):
        if get(im, x + 1, y + 1)[3]:
            put(im, x, y, F[3]); put(im, x + 1, y + 1, F[1])
    return outline(im)


def bush_small():
    im = new(16, 11)
    c = cluster(14, 9, [(0, 2, 8, 7), (6, 3, 8, 6), (3, 0, 9, 9)], 'foliage')
    paste(im, c, 1, 1)
    F = ramp('foliage')
    pts(im, F[3], (5, 3), (8, 2), (10, 5)); pts(im, F[1], (6, 6), (9, 7), (11, 8))
    return outline(im)


def flower(kind=0):
    """Three little flowers on stems. Back layer: 12 x 12."""
    im = new(12, 12)
    F = ramp('foliage')
    hue = ['pink', 'gold', '#ffffff'][kind % 3]
    pet = [col(hue, 2), col(hue, 3)] if hue != '#ffffff' else [col('cloud', 0), WHITE]
    heart = col('gold', 2) if hue != 'gold' else col('orange', 1)
    for (x, top) in ((2, 5), (6, 2), (9, 6)):
        for y in range(top + 3, 12):
            put(im, x, y, F[1])
        put(im, x + 1, min(11, top + 6), F[2])
        pts(im, pet[1], (x, top), (x - 1, top + 1))
        pts(im, pet[0], (x + 1, top + 1), (x, top + 2))
        put(im, x, top + 1, heart)
    return outline(im, SOFT)


def grass_tuft():
    im = new(10, 7)
    G = ramp('grass')
    art(im, 0, 0, [
        '..d....c..',
        '..c.d..c.d',
        '.dc.c.dc.c',
        '.cb.cbcb.c',
        'dcb.cbcbdc',
        'cbbdcbbbcb',
        'bbbcbbabbb',
    ], {'a': G[0], 'b': G[1], 'c': G[2], 'd': G[3]})
    return im


def tree():
    """A small round tree. Back layer: 44 x 60."""
    im = new(44, 60)
    W = ramp('wood')
    # trunk: a slight lean, flared root
    for y in range(26, 59):
        cx = 21 + (1 if y < 36 else 0)
        half = 3 if y < 52 else 4 if y < 56 else 5
        for x in range(cx - half, cx + half + 1):
            u = (x - (cx - half)) / float(2 * half)
            put(im, x, y, W[3] if u < 0.2 else W[2] if u < 0.55 else W[1] if u < 0.85 else W[0])
    pts(im, W[0], (20, 40), (21, 41), (21, 42), (23, 47), (22, 48), (19, 33), (20, 34))
    # a branch stub
    pts(im, W[2], (26, 30), (27, 29), (28, 28)); pts(im, W[1], (26, 31), (27, 30), (28, 29), (29, 28))
    balls = [(2, 12, 18, 16), (24, 11, 18, 17), (9, 18, 26, 14), (6, 3, 18, 17), (19, 1, 18, 18), (12, 7, 20, 18)]
    c = cluster(44, 36, balls, 'foliage')
    paste(im, c, 0, 0)
    F = ramp('foliage')
    for i in range(40):
        x = 4 + hsh(i, 11) % 36; y = 3 + hsh(i, 12) % 26
        if get(im, x, y) in (F[2], F[1]) and get(im, x + 1, y + 1)[3] and get(im, x - 1, y - 1)[3]:
            put(im, x, y, F[3] if get(im, x, y) == F[2] else F[2])
            put(im, x + 1, y, F[3] if get(im, x, y) == F[3] else get(im, x + 1, y))
    # shade where the crown overhangs the trunk
    for y in range(28, 33):
        for x in range(16, 28):
            if get(im, x, y) in (W[3], W[2]):
                put(im, x, y, W[1])
    return outline(im)


def broken_column(tall=True):
    """An old column, snapped. Back layer: 18 x 34 (tall) or 18 x 15 (a stump)."""
    H = 34 if tall else 15
    im = new(18, H)
    S = ramp('stone')
    top = 2
    for y in range(top, H - 6):
        for x in range(4, 14):
            u = (x - 4) / 9.0
            c = S[3] if u < 0.25 else S[2] if u < 0.6 else S[1]
            if x in (7, 10):
                c = S[1] if u < 0.6 else S[0]  # flutes
            put(im, x, y, c)
    # the jagged break
    jag = [3, 1, 0, 2, 4, 3, 1, 2, 5, 4]
    for i, x in enumerate(range(4, 14)):
        for y in range(top, top + jag[i]):
            put(im, x, y, CLEAR)
        put(im, x, top + jag[i], S[3])
    # drum joints
    for y in range(top + 12, H - 6, 11):
        for x in range(4, 14):
            put(im, x, y, S[0] if x > 9 else S[1])
    # base: two steps
    for x in range(2, 16):
        put(im, x, H - 6, S[3]); put(im, x, H - 5, S[2] if x < 11 else S[1]); put(im, x, H - 4, S[1])
    for x in range(1, 17):
        put(im, x, H - 3, S[3] if x < 12 else S[2]); put(im, x, H - 2, S[2] if x < 12 else S[1]); put(im, x, H - 1, S[1] if x < 12 else S[0])
    # moss
    F = ramp('foliage')
    for (x, y) in ((4, H - 9), (5, H - 8), (4, H - 8), (12, H - 7), (13, H - 7), (2, H - 4), (3, H - 4), (3, H - 5)):
        put(im, x, y, F[2])
    pts(im, F[3], (4, H - 10)); pts(im, F[1], (5, H - 7), (13, H - 6))
    return outline(im)


def ivy(w=16, h=28, seed=1):
    """Ivy hanging down from an edge. Back layer; soft dark-green edge, no ink (it lies on stone)."""
    im = new(w, h)
    F = ramp('foliage')
    for s in range(0, w // 4):
        x = 2 + s * 4 + hsh(s, seed) % 2
        length = int(h * (0.45 + (hsh(s, seed, 3) % 55) / 100.0))
        for y in range(0, length):
            sway = [0, 0, 1, 1, 0, 0, -1, -1][(y + hsh(s, seed, 4)) % 8] if y > 2 else 0
            put(im, x + sway, y, F[0])
            if y % 3 == (s % 3):
                side = 1 if (y // 3 + s) % 2 else -1
                lx = x + sway + side
                pts(im, F[2], (lx, y), (lx + side, y), (lx, y + 1))
                put(im, lx + side, y - 1, F[3]) if side < 0 else put(im, lx, y - 1, F[2])
                put(im, lx + side, y + 1, F[1])
        # the tip
        put(im, x, length, F[2]); put(im, x, length + 1, F[3])
    # the mat along the top edge
    for x in range(w):
        t = hsh(x // 2, seed, 8) % 3
        for y in range(0, 2 + t):
            put(im, x, y, F[2] if (x + y) % 3 else F[1])
        put(im, x, 0, F[3] if hsh(x, seed, 9) % 3 == 0 else F[2])
    return im


def ruin_arch():
    """Far-off ruin: two piers and what is left of an arch. Far layer, pale, no outline: 56 x 60."""
    im = new(56, 60)
    A = [grey(col('stone', 1), 0.55), grey(col('stone', 2), 0.55), grey(col('stone', 3), 0.5)]
    for (x0, x1, top) in ((2, 14, 14), (40, 52, 22)):
        for y in range(top, 60):
            for x in range(x0, x1):
                c = A[1]
                if x < x0 + 3:
                    c = A[2]
                if x >= x1 - 3:
                    c = A[0]
                if (y % 8 == 0) or ((x + (4 if (y // 8) % 2 else 0)) % 8 == 0 and x not in (x0, x1 - 1)):
                    c = A[0] if c != A[0] else A[1]
                put(im, x, y, c)
    # the arch springing from the left pier, broken before it lands
    cx, cy, R = 27.0, 22.0, 19.0
    for y in range(0, 24):
        for x in range(8, 44):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            ang = math.degrees(math.atan2(-(y + 0.5 - cy), x + 0.5 - cx))
            if 13 <= d <= R and 55 <= ang <= 180:
                c = A[2] if d > R - 2 else A[1] if d > 15 else A[0]
                if int(ang) % 16 == 0:
                    c = A[0]
                put(im, x, y, c)
    # leaves on the top
    F = [grey(col('foliage', 1), 0.45), grey(col('foliage', 2), 0.45)]
    for x in range(2, 14):
        if hsh(x, 3) % 3:
            put(im, x, 13, F[1]); put(im, x, 14, F[0])
    for (x, y) in ((20, 3), (21, 3), (22, 2), (23, 2), (24, 3), (40, 21), (41, 21), (43, 21), (44, 20)):
        put(im, x, y, F[1])
    return im


# =============================================================== CASTLE (throne room, hall)
def _cas():
    C = ramp('castle')
    # far-layer stone: between the wall's dark and the ground's light
    return [mix(C[0], C[1], 0.5), C[1], mix(C[1], C[2], 0.55), C[2]]


def column_piece(part):
    """A stone column in three stackable 16 x 16 pieces: 'cap', 'shaft', 'base'. Far layer, no outline."""
    im = new(16, 16)
    A = _cas()

    def shaft_row(y):
        for x in range(3, 13):
            u = (x - 3) / 9.0
            c = A[3] if u < 0.22 else A[2] if u < 0.55 else A[1] if u < 0.85 else A[0]
            if x in (6, 9):
                c = A[1] if u < 0.55 else A[0]
            put(im, x, y, c)

    if part == 'shaft':
        for y in range(16):
            shaft_row(y)
    elif part == 'cap':
        for y in range(7, 16):
            shaft_row(y)
        for x in range(0, 16):
            put(im, x, 0, A[3]); put(im, x, 1, A[2] if x < 11 else A[1]); put(im, x, 2, A[1] if x < 11 else A[0])
        for x in range(1, 15):
            put(im, x, 3, A[2] if x < 10 else A[1]); put(im, x, 4, A[0])
        for x in range(2, 14):
            put(im, x, 5, A[3] if x < 6 else A[2] if x < 10 else A[1]); put(im, x, 6, A[1] if x < 10 else A[0])
    else:
        for y in range(0, 9):
            shaft_row(y)
        for x in range(2, 14):
            put(im, x, 9, A[3] if x < 6 else A[2] if x < 10 else A[1]); put(im, x, 10, A[1] if x < 10 else A[0])
        for x in range(1, 15):
            put(im, x, 11, A[3] if x < 9 else A[2]); put(im, x, 12, A[1] if x < 11 else A[0])
        for x in range(0, 16):
            put(im, x, 13, A[3] if x < 9 else A[2]); put(im, x, 14, A[2] if x < 11 else A[1]); put(im, x, 15, A[1] if x < 11 else A[0])
    return im


def banner(hue='red', emblem='crown'):
    """A tall hanging banner with a forked tail and a gold emblem. Far layer: 16 x 44."""
    im = new(16, 44)
    R = ramp(hue); G = ramp('gold')
    for y in range(3, 44):
        fork = max(0, y - 36)  # the tail splits
        for x in range(2, 14):
            if y >= 37 and abs(x - 7.5) < fork * 0.8:
                continue
            c = R[1]
            if x in (2, 3):
                c = R[2]
            if x in (5,) and y % 13 < 9:
                c = R[2]
            if x >= 11:
                c = R[0]
            put(im, x, y, c)
    # gold border lines and hem
    for y in range(4, 37):
        put(im, 3, y, G[2]); put(im, 12, y, G[1])
    for x in range(3, 13):
        put(im, x, 5, G[2] if x < 9 else G[1])
    if emblem == 'crown':
        L = {'g': G[2], 'G': G[3], 'd': G[1], 'r': col('red', 3) if hue != 'red' else col('blue', 3)}
        art(im, 4, 12, [
            'G..GG..g',
            'Gg.Gg.gd',
            'GGgGGggd',
            'GGGGgggd',
            'GrGggrgd',
            'dddddddd',
        ], L)
    else:
        L = {'g': G[2], 'G': G[3], 'd': G[1]}
        art(im, 4, 11, [
            '...Gg...',
            '..GGgg..',
            '.GGGggg.',
            'GGGggggd',
            '.GGgggd.',
            '..Ggdd..',
            '...gd...',
        ], L)
    # the rod
    for x in range(0, 16):
        put(im, x, 1, G[3] if x < 10 else G[2]); put(im, x, 2, G[1])
    put(im, 0, 0, G[2]); put(im, 15, 0, G[1]); put(im, 0, 3, G[1]); put(im, 15, 3, G[0])
    # a soft dark edge in the banner's own colour (far layer: no ink)
    return outline(im, mix(R[0], INK, 0.35))


def torch(lit=1.0, dark=False):
    """A wall torch in an iron sconce. Far layer: 12 x 22. `dark`: the undercroft's dimmer one."""
    im = new(12, 22)
    M = ramp('metal'); O = ramp('orange'); G = ramp('gold'); W = ramp('wood')
    iron = [mix(M[0], INK, 0.5), mix(M[0], INK, 0.15), M[1]]
    if dark:
        fl = [O[0], O[1], O[2], G[2]]
    else:
        fl = [O[1], O[2], G[2], G[3]]
    flame = [
        '.....a......',
        '....aa......',
        '....aba.....',
        '...abba.....',
        '...abcba....',
        '..abccba....',
        '..abcdcba...',
        '..abcddba...',
        '..abcdcba...',
        '...abcba....',
        '....aaa.....',
    ] if not dark else [
        '............',
        '............',
        '.....a......',
        '....aa......',
        '....aba.....',
        '...abba.....',
        '...abcba....',
        '..abccba....',
        '..abcdba....',
        '...abba.....',
        '....aa......',
    ]
    art(im, 0, 0, flame, {'a': fl[0], 'b': fl[1], 'c': fl[2], 'd': fl[3]})
    L = {'a': iron[0], 'b': iron[1], 'c': iron[2], 'w': W[1], 'v': W[0]}
    art(im, 0, 11, [
        '.cbbbbbba...',
        '..cbbbba....',
        '..cwwvva....',
        '...wwvv.....',
        '...cwva.....',
        '...cbba.....',
        '....cba.....',
        '....cbaa....',
        '.....cbba...',
        '......cba...',
        '.......ca...',
    ], L)
    return im


def carpet(part):
    """A red carpet seen from the side, lying on the floor: 16 x 4 pieces ('mid', 'end')."""
    im = new(16, 4)
    R = ramp('red'); G = ramp('gold')
    if part == 'mid':
        for x in range(16):
            put(im, x, 0, INK); put(im, x, 1, R[2]); put(im, x, 2, R[1]); put(im, x, 3, R[0])
            if x % 8 == 3:
                put(im, x, 1, G[2]); put(im, x, 2, G[1])
    else:  # the right-hand end, with a gold fringe; flip for the left
        for x in range(0, 12):
            put(im, x, 0, INK); put(im, x, 1, R[2]); put(im, x, 2, R[1]); put(im, x, 3, R[0])
        for x in (9, 10, 11):
            put(im, x, 1, G[3]); put(im, x, 2, G[2]); put(im, x, 3, G[1])
        put(im, 12, 1, INK); put(im, 12, 2, INK); put(im, 12, 3, G[1]); put(im, 13, 3, G[2]); put(im, 14, 3, INK); put(im, 13, 2, INK); put(im, 12, 0, CLEAR)
        put(im, 3, 1, G[2]); put(im, 3, 2, G[1])
    return im


def carpet_drop(h=20):
    """The carpet running down the face of a step: 4 x h."""
    im = new(4, h)
    R = ramp('red')
    for y in range(h):
        put(im, 0, y, R[2]); put(im, 1, y, R[1]); put(im, 2, y, R[0]); put(im, 3, y, INK)
    put(im, 0, 0, INK); put(im, 1, 0, INK); put(im, 2, 0, INK); put(im, 3, 0, CLEAR)
    return im


def portrait(kind=0):
    """A small portrait in a gold frame. Far layer: 16 x 20."""
    im = new(16, 20)
    G = [grey(col('gold', 0), 0.1, 'castle', 1), grey(col('gold', 1), 0.12, 'castle', 2), grey(col('gold', 2), 0.12, 'castle', 3), col('gold', 3)]
    bg = [mix(col('teal', 0), col('ink', 0), 0.45), mix(col('teal', 0), col('ink', 0), 0.2)]
    for y in range(20):
        for x in range(16):
            edge = x < 2 or x > 13 or y < 2 or y > 17
            if edge:
                c = G[2]
                if x == 0 or y == 0:
                    c = G[3]
                if x == 15 or y == 19:
                    c = G[0]
                if (x == 1 and y > 0) or (y == 1 and x > 0):
                    c = G[1] if (x > 13 or y > 17) else G[2]
                if x == 14 or y == 18:
                    c = G[1]
                put(im, x, y, c)
            else:
                put(im, x, y, bg[0] if (x + y) > 14 else bg[1])
    sk = [col('skin', 0), col('skin', 1), col('skin', 2)]
    coat = [['purple', 'red'][kind % 2]]
    C = ramp(coat[0])
    hair = [col('wood', 1), col('metal', 2)][kind % 2]
    # bust
    art(im, 4, 4, [
        '..hhhh..',
        '.hhhhhh.',
        '.hssssh.',
        '.hsksks.',
        '..ssss..',
        '..sSSs..' if kind == 0 else '..shhs..',
        '...ss...',
        '.cCCCCc.',
        'cCCgCCCd',
        'cCCCgCCd',
        'cCCCCCdd',
        'cCCCCCdd',
        'cCCCCCdd',
    ], {'h': hair, 's': sk[1], 'S': sk[0], 'k': INK, 'c': C[2], 'C': C[1], 'd': C[0], 'g': col('gold', 2)})
    return im


def armour():
    """A suit of armour on a plinth: a statue, not a guard. Far layer, greyed: 18 x 40."""
    im = new(18, 40)
    C = ramp('castle')
    M = [mix(col('metal', 0), C[0], 0.6), mix(col('metal', 0), C[1], 0.55), mix(col('metal', 1), C[2], 0.6), mix(col('metal', 2), C[3], 0.6)]
    R = [mix(col('red', 0), C[0], 0.5), mix(col('red', 1), C[1], 0.5)]
    L = {'a': M[0], 'b': M[1], 'c': M[2], 'd': M[3], 'r': R[1], 'R': R[0], 'k': mix(C[0], INK, 0.5)}
    art(im, 1, 0, [
        '.......rr.......',
        '......rrrR......',
        '.....rrrRR......',
        '......cccb......',
        '.....dcccba.....',
        '.....dckkka.....',
        '.....dccbba.....',
        '......cbba......',
        '...dccccccbba...',
        '..dcccdccbbbba..',
        '..dcb.dccbb.ba..',
        '..dcb.cccba.ba..',
        '..cb..cccba.ba..',
        '..cb.dcccbbaba..',
        '..cb.dccbbbaba..',
        '..ba..cbbba.aa..',
        '..kk..ccbba.....',
        '......cb.ba.....',
        '.....dcb.bba....',
        '.....dcb.bba....',
        '.....dcb.bba....',
        '.....ccb.bba....',
        '.....ccb.bba....',
        '.....cbb.baa....',
        '....dcbb.bbaa...',
        '....cbba.bbaa...',
    ], L)
    # the shield on the arm (his left, our right)
    S = [mix(col('blue', 0), C[0], 0.5), mix(col('blue', 1), C[1], 0.55), mix(col('gold', 1), C[2], 0.5)]
    art(im, 10, 11, ['bbbbbb', 'bcgccb', 'bcgccb', 'bgggab', 'bcgaab', '.bgab.', '..bb..'], {'b': S[0], 'c': S[1], 'g': S[2], 'a': S[0]})
    # plinth
    A = _cas()
    for x in range(2, 16):
        put(im, x, 26, A[3]); put(im, x, 27, A[2] if x < 11 else A[1])
    for y in range(28, 37):
        for x in range(3, 15):
            put(im, x, y, A[3] if x == 3 else A[2] if x < 10 else A[1] if x < 14 else A[0])
    for x in range(1, 17):
        put(im, x, 37, A[3] if x < 10 else A[2]); put(im, x, 38, A[2] if x < 11 else A[1]); put(im, x, 39, A[1] if x < 11 else A[0])
    return im


# =============================================================== UNDERCROFT
def dark_barrel():
    wd = [dim(col('wood', i), 0.38) for i in range(4)]
    hp = [dim(col('metal', i), 0.45) for i in range(4)]
    return barrel(wd, hp)


def barrel_stack():
    """Two barrels and one on top. Back layer: 30 x 30."""
    im = new(30, 30)
    b = dark_barrel()
    paste(im, b, 0, 14); paste(im, b, 14, 14); paste(im, b, 7, 0)
    return im


def town_barrels():
    im = new(26, 18)
    b = barrel()
    small = barrel(w=12, h=13)
    paste(im, b, 0, 2); paste(im, small, 13, 5)
    return im


def cobweb():
    """A web in a top-left corner (flip for the right). Back layer; thin pale threads: 16 x 16."""
    im = new(16, 16)
    c = mix(col('stone', 3), col('night', 3), 0.35)
    c2 = mix(col('stone', 2), col('night', 2), 0.5)
    # spokes from the corner
    for (ex, ey) in ((15, 0), (14, 6), (10, 11), (5, 14), (0, 15)):
        line(im, 0, 0, ex, ey, c)
    # rings between the spokes, sagging
    for r in (5, 9, 13):
        prev = None
        for a in range(0, 91, 6):
            x = int(round(r * math.cos(math.radians(a)) * (1 - 0.08 * math.sin(math.radians(a * 2)))))
            y = int(round(r * math.sin(math.radians(a)) * (1 - 0.08 * math.sin(math.radians(a * 2)))))
            if prev and get(im, x, y)[3] == 0:
                put(im, x, y, c2)
            prev = (x, y)
    return im


def chain(end=False):
    """A hanging chain: a 6 x 16 length that stacks, and an end with a ring. Back layer."""
    im = new(6, 16)
    M = [dim(col('metal', 0), 0.25), dim(col('metal', 1), 0.2), dim(col('metal', 2), 0.2)]
    for y in range(16):
        k = y % 8
        if end and y > 11:
            break
        if k < 5:  # a link seen face-on
            if k in (0, 4):
                put(im, 2, y, M[1]); put(im, 3, y, M[0])
            else:
                put(im, 1, y, M[2]); put(im, 4, y, M[0])
        else:  # a link seen edge-on
            put(im, 2, y, M[1]); put(im, 3, y, M[0])
    if end:
        art(im, 0, 11, ['.bbbb.', 'b....a', 'b....a', '.baaa.'], {'b': M[1], 'a': M[0]})
    return outline(im, mix(col('night', 0), INK, 0.5)) if False else im
