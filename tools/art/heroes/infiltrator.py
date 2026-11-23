"""The infiltrator: tiny and quick (box 10x12; it runs through a one-tile gap).

DRAFT: an original stand-in. One silhouette idea: a little hooded sprout, the
hood ending in a point that flicks, a dark headband whose two tails stream out
behind. Colour family: green (the kind's colour is #8ac926).
INTENT: standing and running, the picture stays under 16 px tall, so it never
looks too big for the one-tile gap it fits through (content/characters/infiltrator.json).
"""

from rig import Xf, Ell, Cap, Poly, polar, darker, stride, INK
from palette import GRASS, CREAM, PURPLE, WOOD, W, RED

CELL = (32, 32)
BOX = (10, 12)
ANCHOR = (11, 20)
FPS = 8
FPS_BY = {'run': 14, 'carryRun': 14, 'attack': 18, 'throw': 12, 'grab': 12, 'hurt': 8, 'down': 2, 'held': 8, 'flap': 10, 'talk': 6}

BASE = dict(
    bob=0, lean=0, shift=0, sx=1.0, sy=1.0, rot=0, pivot=(0, -7), move=(0, 0),
    armN=(-10, 2.6), armF=(14, 2.6),
    legN=(0, 0), legF=(0, 0),
    tails=(-32, -12, -40, -18), tip=0, eyes='open', mouth=None, look=0,
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
    UB = Xf(parent=Wd, pivot=(0, -3), rot=P['lean'], move=(P['shift'], P['bob']))
    far_g = darker(GRASS)

    # headband tails, streaming from the knot at the back of the hood
    kx, ky = -4.6, -9.6
    a1, a2, b1, b2 = P['tails']
    for (t1, t2, ln, name) in ((b1, b2, 3.6, 'tailB'), (a1, a2, 4.2, 'tailA')):
        mx, my = polar(kx, ky, t1, ln)
        ex, ey = polar(mx, my, t2, ln)
        cv.part(name, [Cap(kx, ky, 0.8, mx, my, 0.7, UB), Cap(mx, my, 0.7, ex, ey, 0.55, UB)], PURPLE, hl=None, sh=0.1, dk=2)

    # far hand
    a, ln = P['armF']
    hx, hy = polar(3.6, -5.2, a, ln)
    if ln > 3.2:
        cv.part('armF', [Cap(3.6, -5.2, 1.0, hx, hy, 0.9, UB)], far_g, hl=None)
    cv.part('handF', [Ell(hx, hy, 1.5, 1.5, 0, UB)], [CREAM[0], CREAM[0], CREAM[1], CREAM[2]])

    # feet
    for name, footx, boot in (('legF', 2.6, darker(WOOD)), ('legN', -2.4, WOOD)):
        dx, dy = P[name]
        cv.part(name, [Ell(footx + dx, -2.1 + dy, 2.1, 1.2, 0, Wd)], boot, hl=(-0.3, -0.6, 0.6), sh=0.4, dk=2)

    # the hood is the whole body
    cv.part('tip', [Poly([(-3.6, -10.4), (-6.6 - P['tip'], -14.6 + abs(P['tip']) * 0.5), (-0.2, -12.4), (1.2, -11.2)], UB)], GRASS, hl=None)
    cv.part('body', [Ell(0, -7.5, 5.6, 4.9, 0, UB)], GRASS, line='ink', hl=(-0.45, -0.5, 0.4), sh=0.35, dk=0.9)
    cv.part('band', [Poly([(-8, -11.2), (8, -10.6), (8, -9.4), (-8, -10.0)], UB)], PURPLE, line=None, clip='body', ref='body', hl=None, sh=0.2, dk=2)
    cv.part('knot', [Ell(kx - 0.4, ky - 0.2, 1.5, 1.5, 0, UB)], PURPLE, hl=None, sh=0.1, dk=2)
    cv.part('face', [Ell(1.9, -6.6, 3.9, 2.9, 0, UB)], CREAM, line=None, clip='body', hl=None, sh=0.55, dk=2)
    cv.part('band2', [Poly([(-8, -11.2), (8, -10.6), (8, -9.4), (-8, -10.0)], UB)], PURPLE, line=None, clip='body', ref='body', hl=None, sh=0.2, dk=2)
    pal = {'K': INK, 'W': W}
    le, re = EYES[P['eyes']]
    ey = -9 if P['eyes'] != 'wide' else -9.6
    cv.stamp(0 + P['look'], ey, le, pal, UB, clip='body')
    cv.stamp(3 + P['look'], ey, re, pal, UB, clip='body')
    if P['mouth'] == 'open':
        cv.stamp(2, -5.4, ['r'], {'r': RED[0]}, UB, clip='face')

    # near hand
    a, ln = P['armN']
    hx, hy = polar(-3.4, -5.0, a, ln)
    if ln > 3.2:
        cv.part('armN', [Cap(-3.4, -5.0, 1.1, hx, hy, 1.0, UB)], GRASS, line='soft', hl=None)
    cv.part('handN', [Ell(hx, hy, 1.6, 1.6, 0, UB)], CREAM, line='soft')
    cv.lit_outline()


BACK = (-96, -84, -100, -72)     # tails streaming straight back
BACK2 = (-90, -104, -92, -110)


def _run(i, **kw):
    n, f, bob, sw = stride(i)
    S, H = 3.0, 2.0
    p = dict(
        legN=(n[0] * S, -n[1] * H), legF=(f[0] * S, -f[1] * H),
        bob=1 if bob > 0 else (-1 if bob < 0 else 0), lean=16, shift=1,
        armN=(-78 - 10 * sw, 3.4), armF=(-64 + 10 * sw, 4.4),
        tails=BACK if i % 2 == 0 else BACK2, tip=2 if bob <= 0 else 1, eyes='angry',
    )
    p.update(kw)
    return pose(**p)


CARRY = dict(armN=(180, 6.6), armF=(180, 6.6), eyes='angry')
# INTENT: a body this round does not read lying on its side; knocked flat it is a pancake, eyes shut.
LIE = dict(sx=1.24, sy=0.7, eyes='shut', armN=(-90, 4.6), armF=(90, 4.6), tails=(-84, -10, -88, -24), tip=3)

ANIMS = {
    'idle': [
        pose(),
        pose(bob=-1, tails=(-36, -16, -44, -22), tip=0.5),
        pose(bob=0, sx=1.06, sy=0.94, tails=(-28, -8, -36, -14), armN=(-18, 2.6), armF=(22, 2.6)),
        pose(eyes='shut'),
    ],
    'run': [_run(i) for i in range(6)],
    'air': [
        pose(armN=(-70, 3), armF=(70, 3), legN=(-1, -1), legF=(1, -1.5), tails=(-70, -50, -80, -60), bob=-1),
        pose(armN=(-76, 3), armF=(76, 3), legN=(-1, -1), legF=(1, -1.5), tails=(-78, -60, -70, -48), bob=-1, tip=1),
    ],
    'jump': [
        pose(sx=0.88, sy=1.14, armN=(-30, 3.4), armF=(30, 3.4), legN=(-1, -0.5), legF=(1, -1), tails=(-8, 4, -14, -2), tip=-2, eyes='angry', move=(0, -1)),
        pose(sx=0.92, sy=1.1, armN=(-36, 3.4), armF=(36, 3.4), legN=(-1, -1), legF=(1, -1.5), tails=(-14, -2, -8, 6), tip=-1.5, eyes='angry', move=(0, -1)),
    ],
    'fall': [
        pose(sx=1.1, sy=0.92, armN=(-125, 4), armF=(125, 4), legN=(-2, -1.5), legF=(2, -2), tails=(-168, -176, -150, -160), tip=3, eyes='wide', move=(0, -1)),
        pose(sx=1.1, sy=0.92, armN=(-135, 4), armF=(118, 4), legN=(-2, -2), legF=(2, -1.5), tails=(-158, -168, -172, -180), tip=4, eyes='wide', move=(0, -1)),
    ],
    'attack': [
        # coil back for an instant
        pose(lean=-10, shift=-1, sx=0.9, sy=1.1, armN=(-80, 3.6), armF=(40, 3), tails=(-60, -40, -70, -50), eyes='angry'),
        # the jab: the whole body darts out long and low behind the hand
        pose(lean=6, shift=4, sx=1.28, sy=0.84, armN=(88, 8.5), armF=(-80, 4), tails=BACK, tip=3, eyes='angry', legN=(3, 0), legF=(4.5, -0.5)),
        pose(lean=4, shift=3, sx=1.14, sy=0.92, armN=(84, 7), armF=(-60, 4), tails=BACK2, tip=2, eyes='angry', legN=(2, 0), legF=(3.5, 0)),
        pose(lean=6, shift=1, armN=(40, 3.4), armF=(-20, 3), tails=(-60, -40, -70, -50), tip=-1, legN=(0, 0), legF=(1, 0)),
    ],
    'grab': [
        pose(lean=8, shift=2, sx=1.1, sy=0.94, armN=(90, 6), armF=(84, 4.5), tails=BACK, eyes='angry', legN=(1, 0), legF=(2.5, 0)),
        pose(lean=-8, sx=0.94, sy=1.06, armN=(120, 4), armF=(100, 4), tails=(-40, -20, -50, -30), eyes='angry'),
    ],
    'carry': [pose(**CARRY), pose(**dict(CARRY, sx=1.06, sy=0.94, tails=(-28, -8, -36, -14)))],
    'carryRun': [_run(i, **dict(CARRY, lean=8, armN=(180 + 6 * (i % 3 - 1), 6.6), armF=(180 + 6 * (i % 3 - 1), 6.6))) for i in range(6)],
    'throw': [
        pose(lean=-14, sx=0.94, sy=1.06, armN=(-162, 6.6), armF=(-172, 6.6), eyes='angry', tails=(-30, -10, -40, -20)),
        pose(lean=8, shift=2, sx=1.14, sy=0.9, armN=(96, 6), armF=(90, 4.5), eyes='angry', tails=BACK, tip=3, legN=(1, 0), legF=(2.5, 0)),
        pose(lean=6, shift=2, armN=(60, 5), armF=(48, 4), tails=BACK2, tip=1, legN=(1, 0), legF=(2, 0)),
    ],
    'hurt': [
        pose(lean=-28, move=(-2, -2), sx=0.92, sy=1.08, armN=(-130, 4), armF=(120, 4), eyes='ouch', legN=(2, -1), legF=(4, -2), tails=(60, 80, 50, 70), tip=-3),
        pose(lean=-16, move=(-1, 0), armN=(-100, 4), armF=(100, 4), eyes='ouch', legN=(1, 0), legF=(3, -1), tails=(20, 40, 30, 50), tip=-2),
    ],
    'down': [pose(**LIE), pose(**dict(LIE, sx=1.2, sy=0.76, tails=(-80, -6, -84, -18)))],
    'held': [
        pose(move=(0, -2), armN=(-140, 4), armF=(130, 4), legN=(-2, 0.5), legF=(2, -1.5), eyes='wide', tails=(-20, 0, -30, -10), lean=-8, tip=1),
        pose(move=(0, -2), armN=(-110, 4), armF=(150, 4), legN=(-1, -1.5), legF=(1, 0.5), eyes='wide', tails=(-36, -16, -16, 4), lean=8, tip=-1),
    ],
    'hide': [pose(sx=1.12, sy=0.8, armN=(150, 4), armF=(190, 4), eyes='half', look=1, tails=(-20, 0, -26, -6), tip=-2)],
    'talk': [pose(mouth='open', armF=(70, 4)), pose(bob=0, armF=(50, 4))],
    'flap': [
        pose(armN=(-130, 5), armF=(130, 5), eyes='ouch', legN=(-1, -1), legF=(1, -1.5), move=(0, -1), tails=(-30, -10, -40, -20), tip=-2),
        pose(armN=(-50, 5), armF=(50, 5), eyes='ouch', legN=(-1, -0.5), legF=(1, -0.5), move=(0, -1), tails=(-140, -160, -150, -170), tip=3),
    ],
}
