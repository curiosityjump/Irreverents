"""The four people of the cast: king, guard, shopkeeper, villain.

DRAFT: stand-in designs, original to this project (docs/mechanisms/
art-pipeline.md, "Similar to, never copied from"). Each person is a builder
that turns a Pose into a Frame; the animations are lists of Poses.

Local space: x = 0 is the middle of the collision box, the floor is y = 0,
fills stop at y = -2 (the outline's bottom row is y = -1). Everyone faces
right; the light comes from the top-left.
"""
from px import (Frame, RAMP, INK, SOFT, WHITE, hexc, mix, ell, rect, poly, capsule, line, clip, shift, bbox)

DRED = hexc('8a1c3a')
TONGUE = hexc('f0596a')
BLUSH = hexc('ff9aa0')


class Pose:
    def __init__(self, **kw):
        self.bob = 0          # whole upper body lower (+) or higher (-)
        self.sq = 0           # squash (+) or stretch (-), in pixels of height
        self.lean = 0         # pixels the head leads (+) or trails (-) the feet
        self.head = (0, 0)
        self.hf = (0, 0)      # front hand, offset from its rest place
        self.hb = (0, 0)      # back hand
        self.ff = (0, 0)      # front foot (dy < 0 is lifted)
        self.fb = (0, 0)
        self.eyes = 'open'    # open half blink happy wide hurt angry
        self.look = 0         # -1 glances back, +1 ahead
        self.brow = None      # worry angry
        self.mouth = 'shut'   # shut smile open wide o rage grit
        self.flush = False
        self.sweat = None     # 0..3: a drop sliding down beside the head
        self.hat = (0, 0, 0)  # dx, dy, tilt of the crown / helmet / hair
        self.cape = 0
        self.prop = 'rest'    # the guard's spear: rest fwd level back drop none
        self.rot = 0          # quarter turns clockwise (3 = flat on the back)
        self.hatoff = False
        self.__dict__.update(kw)

    def but(self, **kw):
        p = Pose(**self.__dict__)
        p.__dict__.update(kw)
        return p


def r(v):
    return int(round(v))


# ------------------------------------------------------------ shared face

def eyes(F, ex, ey, P, gap=4, eh=3, skin=None):
    """Two eyes; (ex, ey) is the top-left pixel of the rear eye."""
    ex += {-1: -2, 0: 0, 1: 1}[P.look]
    f = F.px([], INK)
    skin = skin or RAMP['skin']
    for front in (0, 1):
        x = ex + gap * front
        e = P.eyes
        if e == 'open':
            for yy in range(eh):
                f.dot(x, ey + yy, INK).dot(x + 1, ey + yy, INK)
            f.dot(x, ey, WHITE)
        elif e == 'half':
            for yy in range(1, eh):
                f.dot(x, ey + yy, INK).dot(x + 1, ey + yy, INK)
            f.dot(x, ey, skin[0]).dot(x + 1, ey, skin[0])
        elif e == 'blink':
            f.dot(x, ey + eh - 1, INK).dot(x + 1, ey + eh - 1, INK)
        elif e == 'happy':
            f.dot(x, ey + 1, INK).dot(x + 1, ey + 1, INK)
            f.dot(x - 1 + 3 * front, ey + 2, INK)
        elif e == 'wide':
            for yy in range(eh):
                f.dot(x, ey + yy, WHITE).dot(x + 1, ey + yy, WHITE)
            px_ = x + (1 if P.look >= 0 else 0)
            f.dot(px_, ey + eh - 2, INK).dot(px_, ey + eh - 1, INK)
            f.dot(x, ey - 1, INK).dot(x + 1, ey - 1, INK)
        elif e == 'hurt':
            if front:
                f.dots([(x + 1, ey), (x, ey + 1), (x + 1, ey + 2)], INK)
            else:
                f.dots([(x, ey), (x + 1, ey + 1), (x, ey + 2)], INK)
        elif e == 'angry':
            for yy in range(eh):
                f.dot(x, ey + yy, INK).dot(x + 1, ey + yy, INK)
            if front:
                f.dot(x + 1, ey, WHITE).dots([(x + 2, ey - 2), (x + 1, ey - 1), (x + 2, ey - 1)], INK)
            else:
                f.dot(x, ey, WHITE).dots([(x - 1, ey - 2), (x, ey - 1), (x - 1, ey - 1)], INK)
        if P.brow == 'worry':
            c = mix(skin[0], INK, 0.45)
            if front:
                f.dots([(x, ey - 3), (x + 1, ey - 2), (x + 2, ey - 2)], c)
            else:
                f.dots([(x + 1, ey - 3), (x, ey - 2), (x - 1, ey - 2)], c)
    return ex


def mouth(F, mx, my, P, w=3):
    """(mx, my) is the top-left of the mouth's place."""
    f = F.px([], INK)
    m = P.mouth
    if m == 'smile':
        for i in range(w):
            f.dot(mx + i, my, INK)
        f.dot(mx + w, my - 1, INK)
    elif m == 'line':
        for i in range(w):
            f.dot(mx + i, my, INK)
    elif m == 'open':
        for i in range(2):
            f.dot(mx + i, my, DRED).dot(mx + i, my + 1, DRED)
    elif m == 'o':
        f.dot(mx, my, INK).dot(mx + 1, my, INK).dot(mx, my + 1, DRED).dot(mx + 1, my + 1, DRED)
    elif m == 'wide':
        for i in range(w):
            f.dot(mx + i, my - 1, DRED).dot(mx + i, my, DRED).dot(mx + i, my + 1, TONGUE)
        f.dot(mx, my + 1, DRED)
    elif m == 'rage':
        for i in range(w + 1):
            f.dot(mx + i, my - 1, WHITE).dot(mx + i, my, DRED).dot(mx + i, my + 1, DRED)
    elif m == 'grit':
        for i in range(w + 1):
            f.dot(mx + i, my - 1, WHITE).dot(mx + i, my, WHITE if i % 2 == 0 else hexc('9aa8c0'))
    return f


def sweat(F, x, y, stage):
    if stage is None:
        return
    y += stage * 2
    c, d = hexc('a0c8ff'), hexc('3c62d0')
    F.px({(x + 1, y): c, (x, y + 1): WHITE, (x + 1, y + 1): c, (x, y + 2): c, (x + 1, y + 2): hexc('5c92f5')}, c, outline=d)


def finish(F, P, keep_x=True):
    """Lay a figure flat when the pose says so, then stand it on the floor."""
    if P.rot:
        F.rot90(P.rot)
    pts = set()
    for p in F.parts:
        pts |= p.mask
        pts |= set(p.pix.keys())
    x0, y0, x1, y1 = bbox(pts)
    dy = -1 - y1 if P.rot else 0
    dx = -r((x0 + x1) / 2) if P.rot else 0
    if dx or dy:
        F.move(dx, dy)
    return F


def skin_of(P):
    return RAMP['flush'] if P.flush else RAMP['skin']


# ------------------------------------------------------------------ KING
# Box 20 x 30. Round and pompous: a pear of red robe, ermine hem and collar,
# a white beard and moustache, and a crown a size too big that lags behind
# everything he does.

def crown(F, kx, ky, tilt=0):
    """A crown whose band's bottom-centre sits at (kx, ky)."""
    band = rect(kx - 6, ky - 3, kx + 7, ky)
    flare = rect(kx - 7, ky - 6, kx + 8, ky - 3)
    pts = set()
    for cx in (kx - 6, kx, kx + 6):
        pts |= poly([(cx - 2.5, ky - 6), (cx + 0.5, ky - 10), (cx + 3.5, ky - 6)])
    cap = clip(ell(kx + 0.5, ky - 6, 6, 3.5), y1=ky - 6)
    n = len(F.parts)
    F.add(cap, 'red', base=1, shade='ball')
    g = F.add(band | flare | pts, 'gold', shade='edge', depth=2)
    for cx in (kx - 6, kx, kx + 6):
        g.dot(cx, ky - 10, RAMP['gold'][3]).dot(cx, ky - 11, RAMP['gold'][2]).dot(cx + 1, ky - 11, RAMP['gold'][1]).dot(cx + 1, ky - 10, RAMP['gold'][2])
    # jewels on the band, and a darker under-rim
    for x in range(kx - 6, kx + 7):
        g.dot(x, ky - 1, RAMP['gold'][1])
    g.dot(kx, ky - 3, RAMP['red'][3]).dot(kx + 1, ky - 3, RAMP['red'][2]).dot(kx, ky - 2, RAMP['red'][2]).dot(kx + 1, ky - 2, RAMP['red'][1])
    g.dot(kx - 4, ky - 3, RAMP['blue'][3]).dot(kx - 4, ky - 2, RAMP['blue'][2])
    g.dot(kx + 5, ky - 3, RAMP['blue'][3]).dot(kx + 5, ky - 2, RAMP['blue'][2])
    if tilt:
        F.shear(tilt, 10, parts=F.parts[n:], y0=ky)
    return F.parts[n:]


def king(P):
    F = Frame()
    b, s = P.bob, P.sq
    hx, hy = P.head
    upper = []
    # the cloak behind
    c = P.cape
    cloak = clip(ell(-3 - c, -11.5 + b + s / 2, 10.5 + c * 0.6, 10 - s / 2), y1=-3)
    upper.append(F.add(cloak, 'red', base=1, shade='edge', depth=3, hl=False))
    upper.append(F.add(clip(cloak, y0=-6), 'white', base=2, shade='edge', depth=1, hl=False))
    # feet
    for (fx, fy) in (P.fb, P.ff):
        pass
    F.add(ell(-5 + P.fb[0], -3.4 + P.fb[1], 3.4, 2.4), 'gold', base=1)
    F.add(ell(4 + P.ff[0], -3.4 + P.ff[1], 3.4, 2.4), 'gold', base=1)
    # the robe
    by = -12 + b + s / 2
    body = ell(0, by, 10.6 + s * 0.4, 10 - s / 2) | ell(0, -8.5 + b + s / 4, 11.2 + s * 0.4, 6.5)
    body = clip(body, y1=-3)
    upper.append(F.add(clip(body, y1=-6), 'red', ball=(0, by, 11.5, 11)))
    hem = F.add(clip(body, y0=-6), 'white', base=3, shade='edge', depth=1, hl=False, sep=None)
    for x in range(-9, 10, 4):
        hem.dot(x + 1, -5, INK)
        if abs(x) < 9:
            hem.dot(x + 3, -4, SOFT)
    upper.append(hem)
    # gold front band and medallion
    band = F.add(clip(body, x0=2, x1=5, y1=-6), 'gold', base=2, shade='edge', depth=1, sep=None)
    upper.append(band)
    md = F.add(ell(3.5, -12.5 + b, 2.6, 2.6), 'gold', base=2)
    md.dot(3, -13 + b, RAMP['red'][2]).dot(3, -14 + b, RAMP['red'][3]).dot(4, -13 + b, RAMP['red'][1]).dot(4, -14 + b, RAMP['red'][2])
    upper.append(md)
    # collar
    col = F.add(ell(0.5 + hx * 0.5, -18 + b + s, 9, 2.8), 'white', base=3, shade='edge', depth=1, hl=False)
    for x in (-6, -2, 6):
        col.dot(x, -18 + b + s, INK)
    upper.append(col)
    # back arm (behind the head, in front of the robe)
    hbx, hby = -10 + P.hb[0], -10 + b + P.hb[1]
    upper.append(F.add(capsule(-8, -15 + b + s, hbx, hby - 1, 2.6), 'red', base=1))
    upper.append(F.add(ell(hbx, hby + 0.5, 2.4, 2.4), skin_of(P)))
    # head
    hcx, hcy = 1 + hx, -24 + b + s + hy
    sk = skin_of(P)
    h0 = len(F.parts)
    head = ell(hcx, hcy, 8, 6.6)
    upper.append(F.add(head, sk))
    # beard and moustache
    beard = clip(ell(hcx + 1.5, hcy + 3.5, 6.6, 4.6), y0=r(hcy + 2))
    upper.append(F.add(beard, 'white', base=3, shade='ball', sep=None))
    ex = eyes(F, r(hcx) - 1, r(hcy) - 4, P, gap=4, skin=sk)
    upper.append(F.parts[-1])
    fx0 = ex
    mo = F.px([], WHITE)
    w3, w2 = RAMP['white'][3], RAMP['white'][2]
    for x in range(fx0 - 4, fx0 + 8):
        mo.dot(x, r(hcy) + 1, w3)
    for x in range(fx0 - 3, fx0 + 7):
        mo.dot(x, r(hcy) + 2, w2 if x in (fx0 + 1, fx0 + 2) else w3)
    mo.dot(fx0 - 5, r(hcy), w3).dot(fx0 + 8, r(hcy), w3)      # curled tips
    mo.dot(fx0 + 1, r(hcy) + 1, w2)
    # nose
    mo.dot(fx0 + 2, r(hcy) - 1, BLUSH).dot(fx0 + 3, r(hcy) - 1, hexc('f0596a'))
    mo.dot(fx0 + 2, r(hcy), hexc('f0596a')).dot(fx0 + 3, r(hcy), hexc('c8324a'))
    # bushy brows (white) unless the pose paints its own
    if P.brow is None and P.eyes not in ('angry', 'wide'):
        for dx in (-1, 0, 1):
            mo.dot(fx0 - 1 + dx, r(hcy) - 5, w3)
            mo.dot(fx0 + 4 + dx, r(hcy) - 5, w3)
    upper.append(mo)
    m = mouth(F, fx0 + 1, r(hcy) + 4, P, w=3)
    upper.append(m)
    # crown
    kdx, kdy, kt = P.hat
    if not P.hatoff:
        upper += crown(F, r(hcx) + kdx, r(hcy) - 4 + kdy, kt)
    for p in F.parts[h0:]:
        p.ly = hcy
    a0 = len(F.parts)
    # front arm
    hfx, hfy = 9 + P.hf[0], -11 + b + P.hf[1]
    upper.append(F.add(capsule(7, -15 + b + s, hfx - 0.5, hfy - 1, 2.6), 'red', base=2))
    upper.append(F.add(ell(hfx, hfy + 0.5, 2.5, 2.5), sk))
    for p in F.parts[a0:]:
        p.ly = -15
    if P.lean:
        F.lean(P.lean, 26, parts=upper)
    sweat(F, r(hcx) - 11 + r(P.lean), r(hcy) - 6, P.sweat)
    if P.hatoff:
        # knocked flat: the crown comes to rest on his belly
        F.rot90(3)
        P = P.but(rot=0)
        pts = set()
        for p in F.parts:
            pts |= p.mask | set(p.pix.keys())
        x0, y0, x1, y1 = bbox(pts)
        F.move(-r((x0 + x1) / 2), -1 - y1)
        crown(F, 4, y0 - 1 - y1 + 2, 2)
        return F
    return finish(F, P)


# ----------------------------------------------------------------- GUARD
# Box 14 x 28. Upright: a kettle helmet with a red crest, a blue tabard with
# a gold diamond, and a spear taller than he is.

def spear(F, hx, hy, mode):
    wood, tipc = RAMP['wood'], RAMP['metal']
    if mode == 'none':
        return
    if mode == 'rest':
        a, b_ = (hx, -2), (hx, -31)
    elif mode == 'fwd':
        a, b_ = (hx - 4, hy + 9), (hx + 7, hy - 19)
    elif mode == 'back':
        a, b_ = (hx - 16, hy + 3), (hx + 6, hy - 2)
    elif mode == 'level':
        a, b_ = (hx - 20, hy + 1), (hx + 0, hy + 1)
    elif mode == 'drop':
        a, b_ = (hx - 14, -4), (hx + 10, -4)
    sh = F.add(line(a[0], a[1], b_[0], b_[1]), wood, base=2, shade='flat', sep=None)
    dx, dy = b_[0] - a[0], b_[1] - a[1]
    L = (dx * dx + dy * dy) ** 0.5
    ux, uy = dx / L, dy / L
    nx, ny = -uy, ux
    bx, by = b_[0] + 0.5, b_[1] + 0.5
    tip = poly([(bx - nx * 2.2, by - ny * 2.2), (bx + ux * 7, by + uy * 7), (bx + nx * 2.2, by + ny * 2.2), (bx - ux * 1.5, by - uy * 1.5)])
    tip |= {(r(b_[0] + ux * k), r(b_[1] + uy * k)) for k in range(0, 6)}
    F.add(tip, tipc, base=2, shade='edge', depth=1)
    # a red binding under the head
    F.px([(r(b_[0] - ux * 2), r(b_[1] - uy * 2)), (r(b_[0] - ux * 3), r(b_[1] - uy * 3))], RAMP['red'][2])


def guard(P):
    F = Frame()
    b, s = P.bob, P.sq
    hx, hy = P.head
    upper = []
    # feet
    F.add(ell(-3 + P.fb[0], -3.2 + P.fb[1], 3, 2.2), 'metal', base=1)
    F.add(ell(3 + P.ff[0], -3.2 + P.ff[1], 3, 2.2), 'metal', base=1)
    # back arm
    hbx, hby = -7 + P.hb[0], -9 + b + P.hb[1]
    upper.append(F.add(capsule(-5, -15 + b + s, hbx, hby - 1, 2), 'blue', base=1))
    upper.append(F.add(ell(hbx, hby + 0.5, 2.2, 2.2), 'wood', base=2))
    # tabard
    by = -11 + b + s / 2
    body = clip(ell(0, by, 6.6 + s * 0.4, 7.4 - s / 2) | rect(-6, r(by), 6, -4), y1=-4)
    upper.append(F.add(body, 'blue', ball=(0, by + 1, 7, 8.5)))
    tr = F.px([], INK)
    for x in range(-6, 6):
        if (x, -5) in body:
            tr.dot(x, -5, RAMP['gold'][2 if x < 2 else 1])
    for x in range(-6, 6):
        if (x, r(by) + 2) in body:
            tr.dot(x, r(by) + 2, RAMP['wood'][1 if x < 3 else 0])
    tr.dot(1, r(by) + 2, RAMP['gold'][3]).dot(2, r(by) + 2, RAMP['gold'][2])
    cyy = r(by) - 2
    tr.dots([(1, cyy - 2), (0, cyy - 1), (2, cyy - 1), (1, cyy)], RAMP['gold'][2])
    tr.dot(1, cyy - 1, RAMP['gold'][3])
    upper.append(tr)
    # pauldrons
    upper.append(F.add(ell(-5, -16.5 + b + s, 2.6, 2.2), 'metal', base=2))
    # head
    hcx, hcy = 0.5 + hx, -21.5 + b + s + hy
    sk = skin_of(P)
    h0 = len(F.parts)
    upper.append(F.add(ell(hcx, hcy, 6.5, 6), sk))
    ex = eyes(F, r(hcx - 0.5), r(hcy), P, gap=4, skin=sk)
    upper.append(F.parts[-1])
    ch = F.px([(ex + 6, r(hcy) + 3)], BLUSH if not P.flush else hexc('c8324a'))
    upper.append(ch)
    upper.append(mouth(F, ex + 2, r(hcy) + 4, P, w=2))
    # helmet
    kdx, kdy, kt = P.hat
    n = len(F.parts)
    ky = r(hcy) - 1 + kdy
    kx = r(hcx - 0.5) + kdx
    dome = clip(ell(kx + 0.5, ky - 0.5, 7, 6.5), y1=ky)
    hm = F.add(dome, 'metal', base=2, shade='ball', ball=(kx + 0.5, ky - 1, 7.5, 7.5))
    brim = F.add(rect(kx - 8, ky - 1, kx + 10, ky + 1), 'metal', base=2, shade='edge', depth=1)
    for x in range(kx - 5, kx + 6, 3):
        brim.dot(x, ky - 2, RAMP['metal'][0])
    crest = F.add(ell(kx - 1, ky - 8, 3.2, 2.2) | ell(kx - 3.5, ky - 6.5, 2, 1.6), 'red', base=2)
    if kt:
        F.shear(kt, 8, parts=F.parts[n:], y0=ky)
    upper += F.parts[n:]
    for p in F.parts[h0:]:
        p.ly = hcy
    # spear, then the front arm that holds it
    hfx, hfy = 8 + P.hf[0], -11 + b + P.hf[1]
    n = len(F.parts)
    spear(F, hfx, hfy, 'none' if P.rot else P.prop)
    if P.prop not in ('rest', 'drop'):
        upper += F.parts[n:]
    for p in F.parts[n:]:
        p.ly = -11
    a0 = len(F.parts)
    upper.append(F.add(capsule(5, -15 + b + s, hfx - 0.5, hfy - 0.5, 2), 'blue', base=2))
    upper.append(F.add(ell(5, -16.5 + b + s, 2.6, 2.2), 'metal', base=2))
    upper.append(F.add(ell(hfx, hfy + 0.5, 2.3, 2.3), 'wood', base=2))
    for p in F.parts[a0:]:
        p.ly = -11
    if P.lean:
        F.lean(P.lean, 22, parts=upper)
    sweat(F, r(hcx) - 10 + r(P.lean), r(hcy) - 3, P.sweat)
    finish(F, P)
    if P.rot:
        spear(F, 2, 0, 'drop')
        F.move(0, 0)
    return F


# ------------------------------------------------------------ SHOPKEEPER
# Box 12 x 24. Small and round: a teal smock under a pale apron, orange hair
# in a bun, rosy cheeks.

def shopkeeper(P):
    F = Frame()
    b, s = P.bob, P.sq
    hx, hy = P.head
    upper = []
    F.add(ell(-3 + P.fb[0], -3.2 + P.fb[1], 2.8, 2.2), 'wood', base=1)
    F.add(ell(3 + P.ff[0], -3.2 + P.ff[1], 2.8, 2.2), 'wood', base=1)
    hbx, hby = -7 + P.hb[0], -8 + b + P.hb[1]
    upper.append(F.add(capsule(-5, -12 + b + s, hbx, hby - 1, 2), 'teal', base=1))
    upper.append(F.add(ell(hbx, hby + 0.5, 2.1, 2.1), skin_of(P)))
    by = -9.5 + b + s / 2
    body = clip(ell(0, by, 6.6 + s * 0.4, 6.5 - s / 2) | ell(0, -7 + b, 6.9 + s * 0.4, 4), y1=-4)
    upper.append(F.add(body, 'teal', ball=(0, by + 1, 7, 7.5)))
    apron = clip(body, x0=-2, x1=6, y0=r(by) - 3) | clip(body, x0=-3, x1=7, y0=r(by) + 1)
    ap = F.add(apron, 'white', base=3, shade='edge', depth=1, hl=False)
    for x in range(1, 5):
        ap.dot(x, r(by) + 2, RAMP['white'][1])
    ap.dot(1, r(by) + 3, RAMP['white'][1]).dot(4, r(by) + 3, RAMP['white'][1])
    upper.append(ap)
    # head
    hcx, hcy = 0.5 + hx, -17.5 + b + s + hy
    sk = skin_of(P)
    h0 = len(F.parts)
    upper.append(F.add(ell(hcx, hcy, 6.5, 6), sk))
    ex = eyes(F, r(hcx - 0.5), r(hcy) - 1, P, gap=4, skin=sk)
    upper.append(F.parts[-1])
    ch = F.px([(ex - 1, r(hcy) + 2), (ex + 6, r(hcy) + 2), (ex + 5, r(hcy) + 2)], BLUSH if not P.flush else hexc('c8324a'))
    upper.append(ch)
    upper.append(mouth(F, ex + 2, r(hcy) + 3, P, w=2))
    # hair: a cap, a fringe and a bun that bounces behind everything else
    kdx, kdy, kt = P.hat
    n = len(F.parts)
    top = r(hcy) - 2
    hair = clip(ell(hcx, hcy - 1.5, 7.2, 5.6), y1=top) | rect(r(hcx) - 7, top, r(hcx) - 4, top + 3)
    hr = F.add(hair, 'orange', base=2, shade='ball', ball=(hcx, hcy - 2, 7.5, 6.5))
    hr.dot(r(hcx) + 2, top, RAMP['orange'][2]).dot(r(hcx) + 5, top, RAMP['orange'][1])
    bun = F.add(ell(hcx - 3 + kdx, hcy - 8 + kdy, 3.2, 2.8), 'orange', base=2)
    F.px([(r(hcx) - 3 + kdx, r(hcy) - 6 + kdy), (r(hcx) - 2 + kdx, r(hcy) - 6 + kdy)], RAMP['teal'][2])
    upper += F.parts[n:]
    for p in F.parts[h0:]:
        p.ly = hcy
    hfx, hfy = 7 + P.hf[0], -8 + b + P.hf[1]
    upper.append(F.add(capsule(5, -12 + b + s, hfx - 0.5, hfy - 1, 2), 'teal', base=2))
    upper.append(F.add(ell(hfx, hfy + 0.5, 2.2, 2.2), sk))
    if P.lean:
        F.lean(P.lean, 18, parts=upper)
    sweat(F, r(hcx) - 10 + r(P.lean), r(hcy) - 4, P.sweat)
    return finish(F, P)


# --------------------------------------------------------------- VILLAIN
# Box 14 x 28. Tall and theatrical: a purple cape with a high collar and a
# red lining, swept-up dark hair, a pointed beard, white gloves.

def villain(P):
    F = Frame()
    b, s = P.bob, P.sq
    hx, hy = P.head
    c = P.cape
    upper = []
    hcx, hcy = 0.5 + hx, -22 + b + s + hy
    # cape: lining first (it shows at the trailing edge), then the outside
    out = poly([(-6, -19 + b), (6, -19 + b), (7, -2), (-9 - c * 2, -2 - max(0, c - 1)), (-9 - c, -10 + b)])
    lining = poly([(-6, -16 + b), (-11 - c * 2.4, -2 - max(0, c)), (-4, -2)])
    upper.append(F.add(lining, 'red', base=1, shade='edge', depth=2, hl=False))
    upper.append(F.add(out, 'purple', base=2, shade='edge', depth=3))
    # high collar
    colL = poly([(-8, -17 + b + s), (-9, -27 + b + s), (-3, -19 + b + s)])
    colR = poly([(8, -17 + b + s), (10, -26 + b + s), (4, -19 + b + s)])
    upper.append(F.add(colL | colR, 'purple', base=3, shade='edge', depth=1))
    # legs and feet
    F.add(capsule(-2, -8, -2.5 + P.fb[0], -4 + P.fb[1], 1.6) | ell(-2 + P.fb[0], -2.9 + P.fb[1], 3.2, 1.9), 'dark', base=2)
    F.add(capsule(2, -8, 2.5 + P.ff[0], -4 + P.ff[1], 1.6) | ell(3 + P.ff[0], -2.9 + P.ff[1], 3.2, 1.9), 'dark', base=2)
    # back arm
    hbx, hby = -7 + P.hb[0], -10 + b + P.hb[1]
    upper.append(F.add(capsule(-4, -16 + b + s, hbx, hby - 1, 1.7), 'dark', base=2))
    upper.append(F.add(ell(hbx, hby + 0.5, 2.1, 2.1), 'white', base=3))
    # body
    by = -12 + b + s / 2
    body = ell(0, by, 4.8 + s * 0.4, 7.4 - s / 2)
    bd = F.add(body, 'dark', base=3, ball=(0, by, 5.5, 8))
    for x in range(-5, 5):
        if (x, r(by) + 3) in body:
            bd.dot(x, r(by) + 3, RAMP['gold'][2 if x < 2 else 1])
    bd.dot(0, r(by) - 5, RAMP['gold'][3]).dot(1, r(by) - 5, RAMP['gold'][2]).dot(0, r(by) - 4, RAMP['red'][2]).dot(1, r(by) - 4, RAMP['red'][1])
    upper.append(bd)
    # head
    sk = skin_of(P)
    h0 = len(F.parts)
    upper.append(F.add(ell(hcx, hcy, 6, 5.6), sk))
    ex = eyes(F, r(hcx - 0.5), r(hcy) - 1, P, gap=4, skin=sk)
    upper.append(F.parts[-1])
    fc = F.px([], INK)
    if P.eyes not in ('angry',) and P.brow is None:
        fc.dots([(ex - 1, r(hcy) - 3), (ex, r(hcy) - 2), (ex + 6, r(hcy) - 3), (ex + 5, r(hcy) - 2)], INK)
    # moustache with curled tips, and the pointed beard
    my = r(hcy) + 3
    fc.dots([(ex + 1, my), (ex + 2, my), (ex + 4, my), (ex + 5, my), (ex, my - 1), (ex + 6, my - 1)], INK)
    fc.dots([(ex + 3, my + 2), (ex + 3, my + 3), (ex + 2, my + 2), (ex + 4, my + 2), (ex + 3, my + 4)], INK)
    upper.append(fc)
    upper.append(mouth(F, ex + 2, my + 1, P, w=2))
    # hair
    kdx, kdy, kt = P.hat
    n = len(F.parts)
    top = r(hcy) - 2
    hair = clip(ell(hcx, hcy - 1, 6.6, 5.4), y1=top)
    hair |= poly([(hcx - 3, top - 2), (hcx - 6 + kdx, top - 10 + kdy), (hcx + 1, top - 7), (hcx + 5, top - 3)])
    hair |= poly([(hcx - 7, top + 2), (hcx - 11 + kdx, top - 5 + kdy), (hcx - 3, top - 3)])
    hr = F.add(hair, 'dark', base=2, shade='edge', depth=1)
    hr.dot(r(hcx) + 2, top, RAMP['dark'][2]).dot(r(hcx) + 3, top, RAMP['dark'][2]).dot(r(hcx) + 2, top + 1, RAMP['dark'][2])
    hr.dot(r(hcx) - 2, top - 3, RAMP['purple'][2]).dot(r(hcx) - 1, top - 3, RAMP['purple'][2]).dot(r(hcx) - 3, top - 2, RAMP['purple'][1])
    upper += F.parts[n:]
    for p in F.parts[h0:]:
        p.ly = hcy
    # front arm
    hfx, hfy = 7 + P.hf[0], -12 + b + P.hf[1]
    upper.append(F.add(capsule(4, -16 + b + s, hfx - 0.5, hfy - 0.5, 1.7), 'dark', base=3))
    upper.append(F.add(ell(hfx, hfy + 0.5, 2.2, 2.2), 'white', base=3))
    if P.lean:
        F.lean(P.lean, 22, parts=upper)
    sweat(F, r(hcx) - 9 + r(P.lean), r(hcy) - 4, P.sweat)
    return finish(F, P)


# ------------------------------------------------------------ animations

def cycle(S):
    return [(S, 0), (r(S * 0.3), 0), (-r(S * 0.6), 0), (-S, -2), (0, -3), (r(S * 0.8), -1)]


def anims(S=4, arm=3, talkers=True, hatlag=1):
    """Pose lists for every state; a person's own touches are applied after."""
    A = {}
    br = [0, 0, 1, 1, 0, 0, 1, 1]
    # at ease
    A['idle'] = [Pose(sq=br[i], hf=(0, br[i]), hb=(0, br[i]), eyes='blink' if i == 5 else 'open',
                      hat=(0, 0, 0), mouth='smile') for i in range(8)]
    cyc = cycle(S)
    bob = [0, 1, -1, 0, 1, -1]

    def run(i, **kw):
        a = cyc[i]
        bq = cyc[(i + 3) % 6]
        sw = r(a[0] * arm / S)
        return Pose(bob=bob[i], ff=a, fb=bq, hf=(-sw, -abs(sw) // 2), hb=(sw, -abs(sw) // 2), lean=1,
                    hat=(0, -hatlag if bob[i] == 1 else 0, 0), cape=1 + (i % 2), **kw)
    A['run'] = [run(i, mouth='line') for i in range(6)]
    A['air'] = [
        Pose(sq=-2, ff=(-1, 0), fb=(1, 0), hf=(1, -6), hb=(-1, -5), eyes='open', mouth='o', hat=(0, 0, 0), cape=0, lean=1),
        Pose(sq=0, bob=-1, ff=(3, -2), fb=(-3, -1), hf=(3, -8), hb=(-3, -8), eyes='wide', mouth='open', hat=(0, -2, 0), cape=3),
    ]
    A['hurt'] = [
        Pose(lean=-4, sq=1, eyes='hurt', mouth='wide', hf=(3, -6), hb=(2, -4), ff=(3, -2), fb=(-1, 0), hat=(2, -2, 2), cape=0),
        Pose(lean=-2, sq=2, eyes='hurt', mouth='open', hf=(1, -3), hb=(1, -2), ff=(1, 0), fb=(-1, 0), hat=(1, 0, 1), cape=0),
    ]
    A['down'] = [
        Pose(rot=3, eyes='blink', mouth='open', hf=(2, -3), hb=(-2, -3), ff=(1, 0), fb=(-1, 0), prop='drop', hatoff=True),
        Pose(rot=3, sq=1, eyes='blink', mouth='o', hf=(2, -2), hb=(-2, -2), ff=(1, 0), fb=(-1, 0), prop='drop', hatoff=True),
    ]
    fl = [(-7, 0), (-9, 1), (-7, -1), (-9, 0)]
    A['held'] = [Pose(eyes='hurt' if i % 2 == 0 else 'wide', mouth='wide', brow='worry' if i % 2 else None,
                      hf=(2 + i % 2, fl[i][0]), hb=(-2 - (i + 1) % 2, fl[(i + 2) % 4][0]),
                      ff=(2 if i % 2 == 0 else -1, -1 - (i % 2) * 2), fb=(-2 if i % 2 == 0 else 1, -3 + (i % 2) * 2),
                      hat=(-2 + (i % 2), -1, -3 + (i % 2) * 2), cape=2 * (i % 2), lean=[-1, 0, 1, 0][i],
                      look=-1 if i == 3 else 0, prop='none') for i in range(4)]
    # a body in flight is drawn as hurt and holds the last frame: end on a flail
    A['hurt'].append(A['held'][1].but(lean=-2, prop='fwd'))
    mt = ['open', 'shut', 'wide', 'open', 'shut', 'open', 'wide', 'shut']
    sweep = [(1, -3), (3, -6), (5, -9), (6, -11), (6, -12), (5, -10), (3, -7), (1, -4)]
    A['talk'] = [Pose(sq=br[(i + 1) % 8], mouth=mt[i], hf=sweep[i], hb=(1, -1), eyes='happy' if i in (3, 4, 5) else 'open',
                      head=(0, -1 if i in (3, 4, 5) else 0), cape=1 if i in (3, 4, 5) else 0) for i in range(8)]
    A['attack'] = [
        Pose(lean=-2, hf=(-5, -2), hb=(-1, -2), ff=(-1, 0), fb=(-2, 0), eyes='angry', mouth='line', prop='back', cape=0),
        Pose(lean=3, hf=(5, 3), hb=(-3, 1), ff=(4, 0), fb=(-3, 0), eyes='angry', mouth='rage', prop='level', cape=3, sq=1),
        Pose(lean=2, hf=(4, 3), hb=(-3, 1), ff=(4, 0), fb=(-3, 0), eyes='angry', mouth='rage', prop='level', cape=2),
        Pose(lean=1, hf=(1, -1), hb=(-1, 0), ff=(1, 0), fb=(-1, 0), eyes='open', mouth='line', prop='fwd', cape=1),
    ]
    # unsettled: looking about, wringing hands, a sweat drop
    lk = [-1, -1, -1, 1, 1, 1, -1, 1]
    A['idle2'] = [Pose(sq=br[i], lean=-1, eyes='wide', look=lk[i], brow='worry', mouth='o' if i % 4 < 2 else 'line',
                       sweat=i % 4, hf=(-3, -3 - i % 2), hb=(3, -3 - (i + 1) % 2), head=(-1 if lk[i] < 0 else 0, 0),
                       hat=(0, 0, -1 if lk[i] < 0 else 1)) for i in range(8)]
    A['run2'] = [run(i, eyes='wide', look=-1 if i in (0, 1, 2) else 1, brow='worry', mouth='open', sweat=i % 4).but(
        lean=-1, hf=(-1 + i % 2, -8 - i % 2), hb=(1 - i % 2, -8 - (i + 1) % 2)) for i in range(6)]
    A['talk2'] = [A['talk'][i].but(eyes='wide', look=lk[i], brow='worry', sweat=i % 4, lean=-1, hf=(-2, -3 - i % 2),
                                   hb=(3, -3 - (i + 1) % 2), head=(0, 0)) for i in range(8)]
    # enraged: brows down, leaning in, red-faced
    A['idle3'] = [Pose(flush=True, eyes='angry', mouth='rage' if i % 4 < 2 else 'grit', lean=3, sq=-1 if i % 2 else 0,
                       hf=(1, -6 - i % 2), hb=(-1, -5 - (i + 1) % 2), ff=(1, -3 if i in (2, 6) else 0), fb=(-1, 0),
                       hat=(0, -1 if i % 2 else 0, 1), cape=1 + i % 2) for i in range(8)]
    A['run3'] = [run(i, flush=True, eyes='angry', mouth='rage').but(lean=5, hf=(2, -4 - i % 2), hb=(-4, 0 + i % 2), cape=3 + i % 2)
                 for i in range(6)]
    A['talk3'] = [Pose(flush=True, eyes='angry', mouth=['rage', 'grit', 'rage', 'wide', 'rage', 'grit', 'wide', 'rage'][i], lean=3,
                       sq=-1 if i % 2 else 0, hf=(3 + i % 2, -9 - (i % 2) * 2), hb=(-1, -4 - (i + 1) % 2),
                       hat=(0, -1 if i % 2 else 0, 1), cape=2) for i in range(8)]
    return A


def king_anims():
    A = anims(S=4, arm=3, hatlag=2)
    # at ease the king is haughty: lids low, chin up
    for i, p in enumerate(A['idle']):
        p.eyes = 'blink' if i == 5 else 'half'
        p.mouth = 'shut'
        p.hat = (0, 0, 1 if i in (2, 3) else 0)
        p.hf = (-3, -1 + (1 if i in (2, 3, 6, 7) else 0))
    for i, p in enumerate(A['run']):
        p.lean = [1, 2, 1, 1, 0, 1][i]
        p.eyes = 'open'
    # he talks for ever: a flapping mouth, a sweeping arm, eyes shut in self-regard
    for i, p in enumerate(A['talk']):
        p.hat = (0, 0, [0, 1, 1, 2, 2, 1, 0, 0][i])
        p.hb = (2, -3)
    for i, p in enumerate(A['held']):
        p.hat = (-3 + 2 * (i % 2), -1, -4 + 3 * (i % 2))
    for k in ('idle2', 'run2', 'talk2', 'idle3', 'run3', 'talk3', 'hurt', 'air'):
        for p in A[k]:
            if p.mouth == 'line':
                p.mouth = 'shut'
    del A['attack']
    return A


def guard_anims():
    A = anims(S=4, arm=2, hatlag=1)
    for k, v in A.items():
        for i, p in enumerate(v):
            if k in ('idle', 'talk', 'idle2', 'talk2', 'air', 'hurt'):
                p.hf = (0, 0) if k != 'air' else (0, -3)
                p.prop = 'rest' if k in ('idle', 'talk', 'idle2', 'talk2') else 'fwd'
            if k == 'run':
                p.hf = (0, -1)
                p.prop = 'fwd'
            if k == 'run2':
                p.hf = (0, -3 - i % 2)
                p.prop = 'fwd'
            if k in ('idle3',):
                p.hf = (-2, -1 - i % 2)
                p.prop = 'fwd'
            if k in ('run3', 'talk3'):
                p.hf = (2, 3)
                p.hb = (-3, 1)
                p.prop = 'level'
    for i, p in enumerate(A['idle']):
        p.mouth = 'line'
    for i, p in enumerate(A['talk']):
        p.hb = sweep_small(i)
        p.eyes = 'open'
        p.head = (0, 0)
    for i, p in enumerate(A['idle2']):
        p.hb = (3, -5 - i % 2)
    return A


def sweep_small(i):
    return [(0, -2), (-1, -4), (-2, -6), (-2, -7), (-2, -6), (-1, -4), (0, -2), (0, -1)][i]


def shopkeeper_anims():
    A = anims(S=3, arm=2, hatlag=1)
    for i, p in enumerate(A['talk']):
        p.hf = [(1, -2), (2, -4), (3, -6), (3, -7), (3, -6), (2, -4), (1, -2), (0, -1)][i]
        p.hb = [(-1, -1), (-2, -3), (-3, -5), (-3, -6), (-3, -5), (-2, -3), (-1, -1), (0, 0)][i]
        p.mouth = ['open', 'smile', 'wide', 'smile', 'open', 'smile', 'wide', 'smile'][i]
    for i, p in enumerate(A['idle']):
        p.hat = (0, 1 if i in (3, 7) else 0, 0)
        p.hf = (-4, -1 - (1 if i in (2, 3, 6, 7) else 0))
        p.hb = (4, -1 - (1 if i in (2, 3, 6, 7) else 0))
    for k in ('run', 'run2', 'run3'):
        for i, p in enumerate(A[k]):
            p.hat = (-1, [0, 1, -1, 0, 1, -1][(i + 1) % 6], 0)
    for p in A['air']:
        p.hat = (0, -1, 0)
    A['air'][0].sq = -1
    del A['attack']
    return A


def villain_anims():
    A = anims(S=5, arm=2, hatlag=1)
    # at ease he preens: one hand at his moustache, the other holding the cape
    for i, p in enumerate(A['idle']):
        p.hf = (-3, -5 - (1 if i in (2, 3) else 0))
        p.hb = (0, 0)
        p.mouth = 'smile'
        p.cape = 1 if i in (2, 3, 6, 7) else 0
    # he declaims: the arm goes up and out, the cape with it, and he laughs
    hi = [(0, -5), (2, -9), (4, -12), (5, -14), (5, -15), (5, -14), (3, -10), (1, -6)]
    for i, p in enumerate(A['talk']):
        p.hf = hi[i]
        p.hb = (-2, -1 - (1 if i in (3, 4, 5) else 0))
        p.cape = [0, 1, 2, 3, 3, 2, 1, 0][i]
        p.mouth = ['smile', 'open', 'wide', 'wide', 'open', 'wide', 'open', 'smile'][i]
        p.head = (-1 if i in (3, 4, 5) else 0, -1 if i in (3, 4, 5) else 0)
    # his strike is a sweep of the gloved hand, cape flying
    for i, p in enumerate(A['attack']):
        p.hf = [(-6, -6), (7, -3), (6, -1), (1, -2)][i]
        p.cape = [0, 5, 4, 2][i]
    for k in ('run', 'run3'):
        for i, p in enumerate(A[k]):
            p.cape = 3 + i % 2
            p.hb = (-3, -2)
    for i, p in enumerate(A['idle3']):
        p.hf = (4, -10 - (i % 2) * 2)
        p.cape = 2 + i % 2
    return A


PEOPLE = {
    'king': dict(build=king, anims=king_anims, cell=48, box=(20, 30)),
    'guard': dict(build=guard, anims=guard_anims, cell=48, box=(14, 28)),
    'shopkeeper': dict(build=shopkeeper, anims=shopkeeper_anims, cell=48, box=(12, 24)),
    'villain': dict(build=villain, anims=villain_anims, cell=48, box=(14, 28)),
}
