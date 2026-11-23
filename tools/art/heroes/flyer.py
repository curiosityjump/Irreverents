"""The flyer: light, with real wings (box 14x20).

DRAFT: an original stand-in. One silhouette idea: a plump little bird, a
swept-back crest on top and two white-tipped wings that rise and fall.
Colour family: sky blue (the kind's colour is #4cc9f0).
"""

from rig import Xf, Ell, Cap, Poly, polar, darker, stride, INK
from palette import SKYBLUE, CREAM, WHITE, ORANGE, GOLD, W, RED

CELL = (32, 32)
BOX = (14, 20)
ANCHOR = (9, 12)
FPS = 8
FPS_BY = {'run': 12, 'carryRun': 12, 'attack': 14, 'throw': 10, 'grab': 10, 'hurt': 8, 'down': 2, 'held': 8, 'flap': 12, 'talk': 6}

BASE = dict(
    bob=0, lean=0, shift=0, sx=1.0, sy=1.0, rot=0, pivot=(0, -10), move=(0, 0),
    # wings: (angle, length). 0 hangs down, 90 forward, 180 up, -90 behind.
    wingN=(-24, 6.6), wingF=(-8, 4.0),
    legN=(0, 0, 0), legF=(0, 0, 0),
    eyes='open', beak='shut', crest=0, look=0, tail=0,
)

EYES = {
    'open': (['WK', 'KK', 'KK', 'KK'], ['WK', 'KK', 'KK', 'KK']),
    'half': (['..', 'KK', 'WK', 'KK'], ['..', 'KK', 'WK', 'KK']),
    'shut': (['..', '..', 'KK', '..'], ['..', '..', 'KK', '..']),
    'angry': (['K.', 'WK', 'KK', 'KK'], ['.K', 'WK', 'KK', 'KK']),
    'wide': (['WK', 'KK', 'KK', 'KK', 'KK'], ['WK', 'KK', 'KK', 'KK', 'KK']),
    'ouch': (['K.', '.K', 'K.', '..'], ['.K', 'K.', '.K', '..']),
}


def pose(**kw):
    p = dict(BASE)
    p.update(kw)
    return p


def _wing(cv, name, sx, sy, a, ln, tones, tip, xf, line):
    """A wing as a fan of three feathers from the shoulder: blue near the body,
    white at the ends. It opens as it lifts away from the body."""
    spread = min(1.0, max(0.0, (abs(a) - 30) / 70.0))
    sign = 1 if a < 0 else -1
    lobes = [(a, ln, 1.25), (a + sign * (10 + 16 * spread), ln * 0.84, 1.3), (a + sign * (20 + 32 * spread), ln * 0.62, 1.3)]
    outer, inner = [], []
    for (ang, length, r) in lobes:
        ex, ey = polar(sx, sy, ang, length)
        mx, my = polar(sx, sy, ang, length * 0.5)
        outer.append(Cap(mx, my, r + 0.5, ex, ey, r, xf))
        inner.append(Cap(sx, sy, 2.5, mx, my, r + 0.6, xf))
    cv.part(name + 'tip', outer, tip, line=line, hl=None, sh=0.45, dk=2)
    cv.part(name, inner, tones, line='soft', hl=(-0.3, -0.4, 0.5), sh=0.35, dk=2)


def draw(cv, P):
    R = Xf(pivot=P['pivot'], rot=P['rot'], move=P['move'])
    Wd = Xf(parent=R, scale=(P['sx'], P['sy']))
    UB = Xf(parent=Wd, pivot=(0, -4), rot=P['lean'], move=(P['shift'], P['bob']))
    far = darker(SKYBLUE)
    wing = [SKYBLUE[1], SKYBLUE[2], SKYBLUE[3], SKYBLUE[3]]
    white = [WHITE[1], WHITE[2], WHITE[3], WHITE[3]]

    a, ln = P['wingF']
    _wing(cv, 'wingF', 4.0, -10.0, a, ln, [SKYBLUE[0], SKYBLUE[1], SKYBLUE[2], SKYBLUE[2]], [WHITE[1], WHITE[2], WHITE[2], WHITE[3]], UB, 'ink')

    # tail feathers
    t = P['tail']
    cv.part('tail', [Poly([(-5.0, -7.5), (-9.6, -5.6 - t), (-9.2, -3.2 - t), (-4.0, -3.4)], UB)], far, hl=None, sh=0.2, dk=2)

    # feet
    for name, footx, tones in (('legF', 2.6, darker(ORANGE)), ('legN', -2.2, ORANGE)):
        dx, dy, toe = P[name]
        cv.part(name, [Ell(footx + dx + 0.4, -2.1 + dy, 2.3, 1.2, toe, Wd)], tones, hl=(-0.3, -0.6, 0.6), sh=0.4, dk=2)

    # crest, swept back
    c = P['crest']
    cv.part('crest', [
        Cap(-1.0, -18.0, 1.4, -5.4 - c, -21.4 + abs(c) * 0.4, 0.7, UB),
        Cap(0.6, -18.4, 1.4, -1.8 - c * 0.7, -23.2 + abs(c) * 0.3, 0.7, UB),
    ], SKYBLUE, hl=None, sh=0.3, dk=2)

    # body: one plump egg, cream belly
    cv.part('body', [Ell(0, -10.5, 6.7, 8.3, 0, UB)], SKYBLUE, line='ink', hl=(-0.42, -0.52, 0.34), sh=0.34, dk=0.86)
    cv.part('belly', [Ell(2.8, -6.2, 4.6, 4.6, 0, UB)], CREAM, line=None, clip='body', ref='body', hl=None, sh=0.42, dk=2)

    # beak
    if P['beak'] == 'shut':
        cv.part('beak', [Poly([(5.0, -12.6), (10.2, -10.8), (5.0, -8.8)], UB)], GOLD, hl=(-0.3, -0.5, 0.6), sh=0.25, dk=2)
    else:
        cv.part('beak', [Poly([(5.0, -13.6), (10.2, -13.0), (5.4, -10.8)], UB)], GOLD, hl=(-0.3, -0.5, 0.6), sh=0.4, dk=2)
        cv.part('beakL', [Poly([(4.8, -10.2), (9.2, -8.2), (4.6, -7.6)], UB)], [GOLD[0], GOLD[0], GOLD[1], GOLD[2]], hl=None, sh=0.4, dk=2)
        cv.stamp(5, -10.8, ['r'], {'r': RED[0]}, UB)

    pal = {'K': INK, 'W': W}
    le, re = EYES[P['eyes']]
    ey = -17 if P['eyes'] != 'wide' else -18
    cv.stamp(-2 + P['look'], ey, le, pal, UB, clip='body')
    cv.stamp(2 + P['look'], ey, re, pal, UB, clip='body')

    a, ln = P['wingN']
    _wing(cv, 'wingN', -3.8, -8.4, a, ln, wing, white, UB, 'ink')
    cv.lit_outline()


def _run(i, **kw):
    n, f, bob, sw = stride(i)
    S, H = 3.6, 3.0
    p = dict(
        legN=(n[0] * S, -n[1] * H, n[2]), legF=(f[0] * S, -f[1] * H, f[2]),
        bob=bob, lean=10, shift=1,
        wingN=(-58 - 14 * sw, 8.0), wingF=(-40 + 12 * sw, 6.5),
        crest=1.5 if bob <= 0 else 0.5, tail=1 if bob < 0 else 0,
    )
    p.update(kw)
    return pose(**p)


CARRY = dict(wingN=(-172, 9.5), wingF=(172, 9.5), eyes='angry')
# INTENT: a body this round does not read lying on its side; knocked flat it is a pancake, wings out, eyes shut.
LIE = dict(sx=1.22, sy=0.64, eyes='shut', beak='open', wingN=(-84, 7), wingF=(84, 6), crest=3, tail=1, legN=(-2, 0, 0), legF=(2, 0, 0))

ANIMS = {
    'idle': [
        pose(),
        pose(bob=-1, wingN=(-30, 6.6), crest=0.5),
        pose(sx=1.05, sy=0.95, wingN=(-18, 6.6), crest=-0.5, tail=-0.5),
        pose(eyes='shut'),
    ],
    'run': [_run(i) for i in range(6)],
    'air': [
        pose(wingN=(-100, 9), wingF=(100, 8), legN=(-1, -1, 20), legF=(1, -2, 10), crest=1),
        pose(wingN=(-88, 9), wingF=(88, 8), legN=(-1, -1, 24), legF=(1, -2, 14), crest=1.5, tail=1),
    ],
    'jump': [
        pose(sx=0.9, sy=1.1, wingN=(-36, 9), wingF=(36, 8), legN=(-1, -0.5, 40), legF=(1, -1, 30), crest=-2, tail=-1.5, eyes='angry', move=(0, -1)),
        pose(sx=0.93, sy=1.07, wingN=(-44, 9), wingF=(44, 8), legN=(-1, -1, 34), legF=(1, -1.5, 24), crest=-1.5, tail=-1, eyes='angry', move=(0, -1)),
    ],
    'fall': [
        pose(sx=1.06, sy=0.95, wingN=(-138, 10), wingF=(138, 9), legN=(-2, -1.5, 0), legF=(2, -2, -20), crest=3, tail=2, eyes='wide', beak='open', move=(0, -1)),
        pose(sx=1.06, sy=0.95, wingN=(-150, 10), wingF=(128, 9), legN=(-2, -2, 6), legF=(2, -1.5, -14), crest=3.5, tail=2.5, eyes='wide', beak='open', move=(0, -1)),
    ],
    'attack': [
        # the wing cocks back over the head
        pose(lean=-14, bob=1, wingN=(-150, 10), wingF=(60, 6), eyes='angry', crest=-1.5, legN=(-1, 0, 0), legF=(0, 0, 0)),
        # and sweeps across in front
        pose(lean=18, shift=2, sx=1.06, sy=0.96, wingN=(108, 12.5), wingF=(-60, 7), eyes='angry', beak='open', crest=3, tail=2, legN=(-2, 0, 20), legF=(2, 0, -8)),
        pose(lean=20, shift=2, bob=1, wingN=(54, 11), wingF=(-80, 7), eyes='angry', beak='open', crest=2, tail=1, legN=(-2, 0, 20), legF=(2, 0, 0)),
        pose(lean=8, shift=1, wingN=(10, 8.5), wingF=(-20, 6), crest=-1, legN=(-1, 0, 0), legF=(1, 0, 0)),
    ],
    'grab': [
        pose(lean=16, shift=1, wingN=(96, 10), wingF=(84, 7), eyes='angry', beak='open', legN=(-2, 0, 16), legF=(1, 0, 0), crest=2),
        pose(lean=-6, bob=1, wingN=(128, 7), wingF=(112, 7), eyes='angry', crest=-1),
    ],
    'carry': [pose(**CARRY), pose(**dict(CARRY, sx=1.05, sy=0.95, wingN=(-166, 9.5), wingF=(166, 9.5)))],
    'carryRun': [_run(i, **dict(CARRY, lean=6, wingN=(-172 + 5 * (i % 3 - 1), 9.5), wingF=(172 - 5 * (i % 3 - 1), 9.5))) for i in range(6)],
    'throw': [
        pose(lean=-18, bob=1, wingN=(-150, 9.5), wingF=(-164, 9.5), eyes='angry', crest=-2),
        pose(lean=18, shift=1, sx=1.05, sy=0.96, wingN=(104, 9), wingF=(92, 6), eyes='angry', beak='open', crest=3, tail=2, legN=(-2, 0, 20), legF=(2, 0, -8)),
        pose(lean=12, shift=1, bob=1, wingN=(58, 9.5), wingF=(40, 8), crest=1.5, legN=(-1, 0, 8), legF=(1, 0, 0)),
    ],
    'hurt': [
        pose(lean=-24, move=(-1, -2), sx=0.94, sy=1.06, wingN=(-150, 8), wingF=(120, 9), eyes='ouch', beak='open', legN=(2, -1, -30), legF=(4, -2, -40), crest=-3, tail=-2),
        pose(lean=-14, move=(0, 0), wingN=(-130, 8), wingF=(100, 8), eyes='ouch', beak='open', legN=(1, 0, -12), legF=(3, -1, -24), crest=-2),
    ],
    'down': [pose(**LIE), pose(**dict(LIE, sx=1.18, sy=0.69, beak='shut'))],
    'held': [
        pose(move=(0, -2), wingN=(-128, 9), wingF=(110, 9), legN=(-2, 0.5, 40), legF=(2, -1.5, -20), eyes='wide', beak='open', lean=-8, crest=2),
        pose(move=(0, -2), wingN=(-84, 9), wingF=(140, 9), legN=(-1, -1.5, 10), legF=(1, 0.5, 20), eyes='wide', beak='open', lean=8, crest=-1.5),
    ],
    'hide': [pose(sx=1.1, sy=0.84, wingN=(60, 8.5), wingF=(40, 6), eyes='half', look=1, crest=-2.5, tail=-1)],
    'talk': [pose(beak='open', wingF=(70, 7)), pose(wingF=(50, 7))],
    'flap': [
        # up-stroke: wings high, the body dips; down-stroke: wings slam down, the body lifts
        pose(wingN=(-150, 13), wingF=(150, 12.5), legN=(-1, -1, 30), legF=(1, -1.5, 20), bob=1, crest=-1, tail=-1, eyes='angry'),
        pose(wingN=(-56, 10.8), wingF=(56, 10.8), legN=(-1, -2, 10), legF=(1, -2.5, 0), move=(0, -2), sx=0.96, sy=1.04, crest=3, tail=2, eyes='angry'),
    ],
}
