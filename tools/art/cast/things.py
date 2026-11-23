"""The things with a body: two crates, two dummies and the throne.

DRAFT: stand-in designs (docs/mechanisms/art-pipeline.md). Same space as
people.py: x = 0 is the middle of the collision box, the floor is y = 0 and
fills stop at y = -2. Each thing returns its sheet rows; `alias` names states
that reuse another state's frames.
"""
from px import (Frame, RAMP, INK, SOFT, WHITE, hexc, mix, ell, rect, poly, capsule, line, clip, bbox)

W, M, G, R = RAMP['wood'], RAMP['metal'], RAMP['gold'], RAMP['red']


def settle(F, cx=True):
    pts = set()
    for p in F.parts:
        pts |= p.mask | set(p.pix.keys())
    x0, y0, x1, y1 = bbox(pts)
    F.move(-int(round((x0 + x1) / 2)) if cx else 0, -1 - y1)
    return F


# ---------------------------------------------------------------- crates

def crate(n, heavy):
    """A crate whose fill is n x n (the outline brings it to the box's size)."""
    F = Frame()
    x0, y0 = -n // 2, -1 - n
    p = F.add(rect(x0, y0, x0 + n, y0 + n), 'wood', shade='flat', base=1)
    for j in range(n):
        for i in range(n):
            d = min(i, j, n - 1 - i, n - 1 - j)
            tl = (i == d or j == d) and not (n - 1 - i == d and j > i) and not (n - 1 - j == d and i > j)
            if heavy:
                if d == 0:
                    c = M[2] if tl else M[0]
                elif d == 1:
                    c = M[3] if (tl and (i + j) % 7 == 3) else M[1]
                elif d == 2:
                    c = W[0]
                else:
                    k = (i - 3) % 4
                    c = W[0] if k == 3 else (W[3] if k == 0 and j < n // 2 - 2 else (W[2] if k < 2 else W[1]))
                    if j in (n // 2 - 1, n // 2):          # the iron band
                        c = M[2] if j == n // 2 - 1 else M[0]
                        if i % 5 == 4 and j == n // 2 - 1:
                            c = M[3]
                    elif j == n // 2 + 1:
                        c = W[0]
            else:
                if d == 0:
                    c = W[3] if tl else W[1]
                elif d == 1:
                    c = W[2] if tl else W[1]
                elif d == 2:
                    c = W[0]
                else:
                    c = W[1]
                    k = (i - 3) - (j - 3)                  # the brace, top-left to bottom-right
                    if k == 0:
                        c = W[3]
                    elif k == 1:
                        c = W[2]
                    elif k == -1:
                        c = W[0]
            p.dot(x0 + i, y0 + j, c)
    if heavy:
        for (i, j) in ((1, 1), (n - 2, 1), (1, n - 2), (n - 2, n - 2)):
            p.dot(x0 + i, y0 + j, WHITE)
    else:
        for (i, j) in ((1, 1), (n - 2, n - 2), (n - 2, 1), (1, n - 2)):
            p.dot(x0 + i, y0 + j, W[0])
    return F


def crate_rows(n, heavy):
    def rows():
        idle = [crate(n, heavy)]
        air = []
        for t in range(4):
            f = crate(n, heavy)
            f.rot90(t, 0, -1 - n / 2)
            air.append(f)
        h1 = settle(crate(n, heavy).scale(1.17, 0.84, 0, -1))
        h2 = settle(crate(n, heavy).scale(0.9, 1.1, 0, -1))
        return [('idle', idle), ('air', air), ('hurt', [h1, h2])]
    return rows


# --------------------------------------------------------------- dummies

def straw(F, pts):
    S = RAMP['straw']
    F.px({p: (S[2] if i % 2 == 0 else S[1]) for i, p in enumerate(pts)}, S[2], outline=mix(S[0], INK, 0.5))


def dummy(lean=0, bits=0, face='calm'):
    """The straw dummy: box 12 x 26. A sack on a post with a painted face."""
    F = Frame()
    F.add(rect(-5, -4, 5, -1), 'wood', base=1, shade='edge', depth=1)
    F.add(rect(-1, -9, 1, -4), 'wood', base=2, shade='edge', depth=1)
    up = len(F.parts)
    bar = F.add(rect(-6, -16, 6, -14), 'wood', base=2, shade='edge', depth=1)
    F.add(ell(-5, -15, 2.2, 2.4), 'sack', base=2)
    F.add(ell(5, -15, 2.2, 2.4), 'sack', base=2)
    straw(F, [(-7, -16), (-8, -15), (-7, -14), (6, -16), (7, -15), (6, -14)])
    body = F.add(ell(0, -12, 5, 5.6), 'sack', base=2)
    for x in range(-5, 5):
        if (x, -10) in body.mask:
            body.dot(x, -10, W[1] if x % 2 else W[0])
    body.dots([(1, -14), (2, -14), (1, -13), (2, -13)], RAMP['sack'][1]).dots([(0, -15), (3, -12)], RAMP['sack'][0])
    straw(F, [(-2, -17), (2, -17), (-3, -7), (3, -7), (0, -6)])
    head = F.add(ell(0, -21, 4.7, 4.6), 'sack', base=2)
    head.dots([(-3, -23), (-3, -21), (-3, -19)], RAMP['sack'][0])
    # painted face
    c = INK
    for ex in (-1, 3):                                  # stitched crosses for eyes
        head.dots([(ex - 1, -23), (ex + 1, -23), (ex, -22), (ex - 1, -21), (ex + 1, -21)], c if face == 'calm' else R[0])
    head.dots([(0, -19), (1, -18), (2, -19), (3, -18)], R[1])
    
    straw(F, [(-1, -26), (0, -27), (1, -26), (2, -27), (-2, -25)])
    if lean:
        F.lean(lean, 20, parts=F.parts[up:])
    if bits:
        straw(F, [(-8 * (1 if lean > 0 else -1) + 1, -24), (-9 * (1 if lean > 0 else -1), -19), (-7 * (1 if lean > 0 else -1), -27)][:bits])
    return F


def dummy_heavy(lean=0, bits=0, face='calm'):
    """The padded dummy: box 20 x 30. A quilted barrel with a painted target."""
    F = Frame()
    T = RAMP['teal']
    F.add(rect(-8, -4, 8, -1), 'wood', base=1, shade='edge', depth=1)
    F.add(rect(-2, -8, 2, -4), 'wood', base=2, shade='edge', depth=1)
    up = len(F.parts)
    F.add(ell(-8.5, -17, 2.6, 3.2), 'sack', base=2)
    F.add(ell(8.5, -17, 2.6, 3.2), 'sack', base=2)
    straw(F, [(-11, -18), (-12, -17), (-11, -16), (10, -18), (11, -17), (10, -16)])
    body = F.add(ell(0, -14, 8.6, 8.4), 'teal', base=2, ball=(0, -14, 9.5, 9.5))
    for (x, y) in sorted(body.mask):
        if (x + y) % 6 == 0 or (x - y) % 6 == 0:
            if ((x + y) % 6 == 0 and (x - y) % 6 == 0):
                body.dot(x, y, T[3])
            elif (x + 0.5) * 0.6 + (y + 14) * 0.8 > -3:
                body.dot(x, y, T[1])
    tg = F.add(ell(1.5, -13.5, 4.6, 4.6), 'white', base=3, shade='flat', sep=T[0])
    for (x, y) in ell(1.5, -13.5, 3.4, 3.4) - ell(1.5, -13.5, 2.0, 2.0):
        tg.dot(x, y, R[1] if (x + y) > -11 else R[2])
    tg.dot(1, -14, R[2]).dot(1, -13, R[1]).dot(0, -14, WHITE).dot(0, -13, WHITE)
    F.px([(x, -22) for x in range(-5, 6)], W[1])
    head = F.add(ell(0, -25.5, 5.6, 4.6), 'sack', base=2)
    c = INK
    head.dots([(-1, -26), (0, -26), (-1, -25), (0, -25), (3, -26), (4, -26), (3, -25), (4, -25)], c)
    if face == 'calm':
        head.dots([(-2, -28), (-1, -28), (0, -27), (5, -28), (4, -28), (3, -27)], c)   # painted scowl
    else:
        head.dots([(-2, -27), (5, -27)], c)
    head.dots([(0, -23), (1, -22), (2, -23), (3, -22), (4, -23)], R[1])
    head.dots([(-3, -24), (-3, -23)], RAMP['sack'][0])
    straw(F, [(-1, -31), (0, -32), (1, -31), (2, -32), (-3, -30), (4, -30)])
    if lean:
        F.lean(lean, 24, parts=F.parts[up:])
    if bits:
        s = 1 if lean > 0 else -1
        straw(F, [(-13 * s, -27), (-14 * s, -21), (-11 * s, -31)][:bits])
    return F


def dummy_rows(build):
    def rows():
        idle = [build()]
        hurt = [build(lean=-4, bits=3, face='hit'), build(lean=3, bits=2, face='hit'), build(lean=-1, bits=0)]
        air = [build(lean=-3, bits=1, face='hit'), build(lean=3, bits=1, face='hit')]
        d = build(face='hit')
        d.rot90(3)
        down = [settle(d)]
        return [('idle', idle), ('air', air), ('hurt', hurt), ('down', down)]
    return rows


# ---------------------------------------------------------------- throne

def throne(lean=0):
    """Box 24 x 32. Gilded, with a red cushion and a padded back."""
    F = Frame()
    F.add(rect(-10, -6, -6, -1), 'gold', base=1, shade='edge', depth=1)
    F.add(rect(6, -6, 10, -1), 'gold', base=1, shade='edge', depth=1)
    up = len(F.parts)
    back = rect(-9, -27, 9, -10) | clip(ell(0, -27, 9, 4.6), y1=-27)
    F.add(back, 'gold', base=2, shade='edge', depth=2)
    pad = rect(-6, -26, 6, -14) | clip(ell(0, -26, 6, 3), y1=-26)
    pd = F.add(pad, 'red', base=2, shade='edge', depth=2, sep=G[0])
    for (x, y) in ((-3, -24), (3, -24), (0, -21), (-3, -18), (3, -18)):
        pd.dot(x, y, R[0]).dot(x - 1, y - 1, R[3])
    F.add(ell(-9, -29, 2.3, 2.3), 'gold', base=2)
    F.add(ell(9, -29, 2.3, 2.3), 'gold', base=2)
    top = F.add(ell(0, -31.5, 2.6, 2.6), 'gold', base=2)
    top.dot(-1, -32, R[3]).dot(0, -32, R[2]).dot(-1, -31, R[2]).dot(0, -31, R[1])
    seat = F.add(rect(-11, -11, 11, -5), 'gold', base=2, shade='edge', depth=2)
    for x in range(-9, 10, 3):
        seat.dot(x, -7, G[1])
    seat.dot(-1, -8, R[3]).dot(0, -8, R[2]).dot(-1, -7, R[2]).dot(0, -7, R[1])
    F.add(clip(ell(0, -11, 9.5, 3), y1=-10), 'red', base=2, shade='ball', ball=(0, -11, 10, 4))
    for sx in (-1, 1):
        F.add(rect(min(sx * 8, sx * 12), -17, max(sx * 8, sx * 12), -9), 'gold', base=2, shade='edge', depth=1)
        F.add(ell(sx * 10, -18, 2.8, 2.4), 'gold', base=3)
    if lean:
        F.lean(lean, 30, parts=F.parts[up:])
    return F


def throne_rows():
    return [('idle', [throne()]), ('air', [throne(-2), throne(2)]), ('hurt', [throne(-2), throne(1)])]


THINGS = {
    'crate': dict(rows=crate_rows(12, False), cell=32, box=(14, 14), alias={'run': 'idle'}),
    'crate-heavy': dict(rows=crate_rows(22, True), cell=32, box=(24, 24), alias={'run': 'idle'}),
    'dummy': dict(rows=dummy_rows(dummy), cell=32, box=(12, 26), alias={'run': 'idle'}),
    'dummy-heavy': dict(rows=dummy_rows(dummy_heavy), cell=48, box=(20, 30), alias={'run': 'idle'}),
    'throne': dict(rows=throne_rows, cell=48, box=(24, 32), alias={'run': 'idle'}),
}
