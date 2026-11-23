"""The plain hero: the stand-in adventurer used where no party member is (box 12x26).

DRAFT: an original stand-in. One silhouette idea: a small traveller under a
long floppy cap whose tail and bobble trail behind. Colour family: coral (the
kind's colour is #e07a5f).
"""

from rig import Xf, Ell, Cap, Poly, Cut, polar, darker, stride, INK
from palette import CORAL, CREAM, WOOD, WHITE, NIGHT, GOLD, W, RED

CELL = (32, 32)
BOX = (12, 26)
ANCHOR = (10, 6)
FPS = 8
FPS_BY = {'run': 12, 'carryRun': 12, 'attack': 14, 'throw': 10, 'grab': 10, 'hurt': 8, 'down': 2, 'held': 8, 'flap': 10, 'talk': 6}

BASE = dict(
    bob=0, lean=0, shift=0, sx=1.0, sy=1.0, rot=0, pivot=(0, -12), move=(0, 0),
    head=(0, 0),
    armN=(-8, 4.6), armF=(10, 4.6),
    legN=(0, 0, 0), legF=(0, 0, 0),
    cap=(-52, -18), eyes='open', mouth='smile', look=0,
)

EYES = {
    'open': (['WK', 'KK', 'KK'], ['WK', 'KK', 'KK']),
    'half': (['..', 'KK', 'KK'], ['..', 'KK', 'KK']),
    'shut': (['..', 'KK', '..'], ['..', 'KK', '..']),
    'angry': (['K.', 'WK', 'KK'], ['.K', 'WK', 'KK']),
    'wide': (['WK', 'KK', 'KK', 'KK'], ['WK', 'KK', 'KK', 'KK']),
    'ouch': (['K.', '.K', 'K.'], ['.K', 'K.', '.K']),
}


def pose(**kw):
    p = dict(BASE)
    p.update(kw)
    return p


def draw(cv, P):
    R = Xf(pivot=P['pivot'], rot=P['rot'], move=P['move'])
    Wd = Xf(parent=R, scale=(P['sx'], P['sy']))
    UB = Xf(parent=Wd, pivot=(0, -5), rot=P['lean'], move=(P['shift'], P['bob']))
    HD = Xf(parent=UB, pivot=(0, -12), move=P['head'])
    tunic = darker(CORAL)
    far_t = darker(tunic)
    legs = [NIGHT[1], NIGHT[2], NIGHT[3], NIGHT[3]]

    # the cap's tail and bobble, behind everything
    c1, c2 = P['cap']
    kx, ky = -3.8, -22.8
    mx, my = polar(kx, ky, c1, 4.4)
    ex, ey = polar(mx, my, c2, 4.0)
    cv.part('captail', [Cap(kx, ky, 2.3, mx, my, 1.6, HD), Cap(mx, my, 1.6, ex, ey, 1.0, HD)], CORAL, hl=None, sh=0.2, dk=0.8)
    cv.part('bobble', [Ell(ex, ey, 1.9, 1.9, 0, HD)], [WHITE[1], WHITE[2], WHITE[3], WHITE[3]], sh=0.3, dk=2)

    # far arm
    a, ln = P['armF']
    hx, hy = polar(3.4, -11.4, a, ln)
    cv.part('armF', [Cap(3.4, -11.4, 1.6, hx, hy, 1.5, UB)], far_t, hl=None)
    cv.part('handF', [Ell(hx, hy, 1.7, 1.7, 0, UB)], [CREAM[0], CREAM[0], CREAM[1], CREAM[2]])

    # legs and boots
    for name, hipx, footx, tones, boot in (('legF', 1.8, 2.6, darker(legs), darker(WOOD)), ('legN', -1.8, -2.4, legs, WOOD)):
        dx, dy, toe = P[name]
        fx, fy = footx + dx, -2.2 + dy
        hpx, hpy = Wd.pt(hipx + P['shift'] * 0.5, -5.5 + P['bob'])
        ax, ay = Wd.pt(fx - 0.3, fy - 1)
        cv.part(name, [Cap(hpx, hpy, 1.7, ax, ay, 1.5)], tones, hl=None)
        cv.part(name + 'boot', [Ell(fx + 0.5, fy, 2.5, 1.3, toe, Wd)], boot, hl=(-0.3, -0.6, 0.6), sh=0.4, dk=2)

    # tunic and sash
    cv.part('body', [Ell(0, -8.4, 4.6, 4.3, 0, UB)], tunic, line='ink', sh=0.3, dk=0.9)
    cv.part('sash', [Poly([(-8, -8.2), (8, -8.8), (8, -7.4), (-8, -6.8)], UB)], GOLD, line=None, clip='body', ref='body', hl=None, sh=0.3, dk=2)

    # head, the cap pulled down to the brow
    cv.part('head', [Ell(0.4, -17.4, 6.0, 5.8, 0, HD)], CREAM, line='ink', hl=None, sh=0.5, dk=2)
    below = Poly([(-9, -19.4), (9, -21.4), (9, -8), (-9, -8)], HD)
    cv.part('cap', [Cut(Ell(-0.2, -21.2, 6.5, 4.9, 0, HD), below)], CORAL, line='self', hl=(-0.4, -0.3, 0.4), sh=0.4, dk=2)
    cv.part('brim', [Poly([(-9, -20.9), (9, -22.9), (9, -21.4), (-9, -19.4)], HD)], CORAL, line=None, clip='cap', flat=3)
    pal = {'K': INK, 'W': W}
    le, re = EYES[P['eyes']]
    ey = -17 if P['eyes'] != 'wide' else -17.6
    cv.stamp(-0.5 + P['look'], ey, le, pal, HD, clip='head')
    cv.stamp(3.5 + P['look'], ey, re, pal, HD, clip='head')
    mp = {'d': CREAM[0], 'r': RED[0], 'p': (0xFF, 0x9A, 0xA0)}
    if P['mouth'] == 'smile':
        cv.stamp(1.5, -12.8, ['dd'], mp, HD, clip='head')
    elif P['mouth'] == 'open':
        cv.stamp(1.5, -13.4, ['rr', 'rr'], mp, HD, clip='head')
    cv.stamp(-3, -14.4, ['pp'], mp, HD, clip='head')

    # near arm
    a, ln = P['armN']
    hx, hy = polar(-3.4, -11.2, a, ln)
    cv.part('armN', [Cap(-3.4, -11.2, 1.7, hx, hy, 1.6, UB)], tunic, line='soft', hl=None)
    cv.part('handN', [Ell(hx, hy, 1.8, 1.8, 0, UB)], CREAM, line='soft')
    cv.lit_outline()


def _run(i, **kw):
    n, f, bob, sw = stride(i)
    S, H = 3.6, 3.0
    p = dict(
        legN=(n[0] * S, -n[1] * H, n[2]), legF=(f[0] * S, -f[1] * H, f[2]),
        bob=bob, lean=10, shift=1,
        armN=(-50 * sw, 5.2), armF=(50 * sw, 5.2),
        cap=(-84, -70) if bob <= 0 else (-76, -96),
    )
    p.update(kw)
    return pose(**p)


CARRY = dict(armN=(-176, 7.5), armF=(176, 7.5), eyes='angry', mouth=None)
LIE = dict(rot=-90, pivot=(3.5, -10.0), eyes='shut', armN=(30, 5), armF=(50, 5), legN=(0, 0, -20), legF=(0, -1, -30), cap=(100, 30), mouth='open')

ANIMS = {
    'idle': [
        pose(),
        pose(bob=-1, cap=(-54, -22)),
        pose(bob=1, cap=(-48, -12), armN=(-14, 5.2), armF=(16, 5.2)),
        pose(eyes='shut'),
    ],
    'run': [_run(i) for i in range(6)],
    'air': [
        pose(armN=(-70, 5), armF=(70, 5), legN=(-1, -1, 20), legF=(1, -2, 0), cap=(-70, -50)),
        pose(armN=(-78, 5), armF=(78, 5), legN=(-1, -1, 24), legF=(1, -2, -4), cap=(-78, -62)),
    ],
    'jump': [
        pose(sx=0.92, sy=1.07, armN=(-150, 5.5), armF=(150, 5.5), legN=(-1, -0.5, 40), legF=(1, -2, 20), cap=(-14, 0), move=(0, -1)),
        pose(sx=0.95, sy=1.05, armN=(-140, 5.5), armF=(140, 5.5), legN=(-1, -1, 34), legF=(1, -2.5, 14), cap=(-22, -6), move=(0, -1)),
    ],
    'fall': [
        pose(sx=1.05, sy=0.96, armN=(-128, 5.5), armF=(128, 5.5), legN=(-2, -1.5, 0), legF=(2, -2, -20), cap=(-112, -128), eyes='wide', mouth='open', move=(0, -1)),
        pose(sx=1.05, sy=0.96, armN=(-140, 5.5), armF=(118, 5.5), legN=(-2, -2, 6), legF=(2, -1.5, -14), cap=(-106, -120), eyes='wide', mouth='open', move=(0, -1)),
    ],
    'attack': [
        pose(lean=-12, bob=1, armN=(-110, 5.5), armF=(60, 4), eyes='angry', cap=(-40, -10), mouth=None),
        pose(lean=18, shift=2, armN=(92, 9), armF=(-60, 5), eyes='angry', mouth='open', cap=(-92, -80), legN=(-2, 0, 20), legF=(2, 0, -8)),
        pose(lean=20, shift=2, bob=1, armN=(60, 7.5), armF=(-80, 5), eyes='angry', mouth=None, cap=(-100, -110), legN=(-2, 0, 20), legF=(2, 0, 0)),
        pose(lean=8, shift=1, armN=(20, 5.5), armF=(-20, 5), cap=(-60, -30), legN=(-1, 0, 0), legF=(1, 0, 0)),
    ],
    'grab': [
        pose(lean=16, shift=2, armN=(92, 7.5), armF=(82, 5.5), eyes='angry', mouth='open', cap=(-88, -76), legN=(-2, 0, 16), legF=(1, 0, 0)),
        pose(lean=-6, bob=1, armN=(84, 4.5), armF=(70, 4), eyes='angry', mouth=None, cap=(-40, -10)),
    ],
    'carry': [pose(**CARRY), pose(**dict(CARRY, bob=1, armN=(-170, 7.5), armF=(170, 7.5)))],
    'carryRun': [_run(i, **dict(CARRY, lean=5, armN=(-176 + 5 * (i % 3 - 1), 7.5), armF=(176 + 5 * (i % 3 - 1), 7.5))) for i in range(6)],
    'throw': [
        pose(lean=-16, bob=1, armN=(208, 7.5), armF=(216, 7.5), eyes='angry', mouth=None, cap=(-30, -6)),
        pose(lean=20, shift=2, sx=0.97, sy=1.03, armN=(98, 8.5), armF=(88, 5.5), eyes='angry', mouth='open', cap=(-92, -80), legN=(-2, 0, 20), legF=(2, 0, -8)),
        pose(lean=12, shift=1, bob=1, armN=(58, 7), armF=(44, 7), mouth=None, cap=(-100, -112), legN=(-1, 0, 8), legF=(1, 0, 0)),
    ],
    'hurt': [
        pose(lean=-22, move=(-2, -2), sx=0.95, sy=1.05, armN=(-120, 5.5), armF=(120, 5.5), eyes='ouch', mouth='open', legN=(2, -1, -30), legF=(4, -2, -40), cap=(60, 80)),
        pose(lean=-14, move=(-1, 0), armN=(-96, 5.5), armF=(100, 5.5), eyes='ouch', mouth='open', legN=(1, 0, -12), legF=(3, -1, -24), cap=(20, 50)),
    ],
    'down': [pose(**LIE), pose(**dict(LIE, sx=1.06, armN=(38, 5), mouth='smile'))],
    'held': [
        pose(move=(0, -2), armN=(-140, 5.5), armF=(120, 5.5), legN=(-2, 0.5, 40), legF=(2, -1.5, -20), eyes='wide', mouth='open', lean=-8, cap=(-20, 0)),
        pose(move=(0, -2), armN=(-104, 5.5), armF=(146, 5.5), legN=(-1, -1.5, 10), legF=(1, 0.5, 20), eyes='wide', mouth='open', lean=8, cap=(-36, -14)),
    ],
    'hide': [pose(bob=4, sy=0.9, sx=1.04, armN=(-165, 5.5), armF=(165, 5.5), eyes='half', look=1, lean=6, head=(0, 1), cap=(-30, -6), mouth=None)],
    'talk': [pose(mouth='open', armF=(70, 5)), pose(bob=1, armF=(50, 5))],
    'flap': [
        pose(armN=(-130, 6), armF=(130, 6), eyes='ouch', mouth=None, legN=(-1, -1, 20), legF=(1, -2, 0), move=(0, -1), cap=(-20, 0)),
        pose(armN=(-50, 6), armF=(50, 6), eyes='ouch', mouth=None, legN=(-1, -0.5, 30), legF=(1, -0.5, 10), move=(0, -1), cap=(-108, -122)),
    ],
}
