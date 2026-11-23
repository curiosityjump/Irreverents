"""The grappler: the biggest, broadest body in the party (box 18x30).

DRAFT: an original stand-in. One silhouette idea: a heavy barrel of a body
sunk between two huge wrapped fists, a little flame of a top-knot on top.
Colour family: warm orange-red (the kind's colour is #d95d39).
"""

from rig import Xf, Ell, Cap, Poly, limb, darker, stride, INK
from palette import ORANGE, RED, CREAM, GOLD, WOOD, DARK, W

CELL = (48, 48)
BOX = (18, 30)
ANCHOR = (15, 18)
FPS = 8
FPS_BY = {'run': 10, 'carryRun': 10, 'attack': 12, 'throw': 10, 'grab': 10, 'hurt': 8, 'down': 2, 'held': 6, 'flap': 8, 'talk': 6}

BASE = dict(
    bob=0, lean=0, shift=0, sx=1.0, sy=1.0, rot=0, pivot=(0, -13), move=(0, 0),
    head=(0, 0), headrot=0,
    # arms: (angle, length, bend, fist size). near = the arm on the viewer's side.
    armN=(-8, 10, 0, 1.0), armF=(8, 10, 0, 1.0),
    # legs: (foot dx, foot dy, toe angle)
    legN=(0, 0, 0), legF=(0, 0, 0),
    eyes='open', mouth='shut', tuft=0, look=0,
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


def draw(cv, P):
    R = Xf(pivot=P['pivot'], rot=P['rot'], move=P['move'])
    Wd = Xf(parent=R, scale=(P['sx'], P['sy']))
    UB = Xf(parent=Wd, pivot=(0, -7), rot=P['lean'], move=(P['shift'], P['bob']))
    HD = Xf(parent=UB, pivot=(1, -17), rot=P['headrot'], move=P['head'])
    far_o, far_c = darker(ORANGE), [CREAM[0], CREAM[0], CREAM[1], CREAM[2]]

    # far arm (behind the body)
    a, ln, bend, fs = P['armF']
    shapes, (hx, hy) = limb(7, -18, 3.0, a, ln, 2.8, bend, UB)
    cv.part('armF', shapes, far_o)
    cv.part('fistF', [Ell(hx, hy, 3.6 * fs, 3.6 * fs, 0, UB)], far_c)

    # legs and boots
    for name, hipx, footx, tones, boot in (('legF', 3.5, 4.5, far_o, darker(WOOD)), ('legN', -3.5, -4.5, ORANGE, WOOD)):
        dx, dy, toe = P[name]
        fx, fy = footx + dx, -3.4 + dy
        hpx, hpy = Wd.pt(hipx + P['shift'] * 0.5, -8 + P['bob'])
        ax, ay = Wd.pt(fx - 0.5, fy - 1)
        cv.part(name, [Cap(hpx, hpy, 3.0, ax, ay, 2.6)], tones)
        cv.part(name + 'boot', [Ell(fx + 0.6, fy, 3.9, 2.3, toe, Wd)], boot, hl=(-0.3, -0.5, 0.5))

    # torso (broad at the shoulder), trunks, belt
    cv.part('torso', [Ell(0, -15.5, 9.6, 6.6, 0, UB), Ell(0, -11.5, 8.7, 8.2, 0, UB)], ORANGE, line='ink')
    cv.part('trunks', [Poly([(-12, -9.6), (12, -9.6), (12, 0), (-12, 0)], UB)], RED, line=None, clip='torso', ref='torso', hl=None)
    cv.part('belt', [Poly([(-12, -12.2), (12, -12.2), (12, -9.6), (-12, -9.6)], UB)], DARK, line=None, clip='torso', flat=2)
    cv.part('buckle', [Poly([(1.6, -12.9), (5.4, -12.9), (5.4, -8.9), (1.6, -8.9)], UB)], GOLD, line=None, clip='torso', hl=(-0.3, -0.3, 0.8), sh=0.5)

    # head, sunk into the shoulders
    cv.part('tuft', [Ell(-0.5, -29.6, 2.6, 2.4, 0, HD), Poly([(-2.6, -30.5), (-5.2 - P['tuft'], -34.2 + abs(P['tuft']) * 0.3), (-0.2, -32.4), (1.6, -30.5)], HD)], RED)
    cv.part('head', [Ell(1.5, -22.4, 7.2, 6.9, 0, HD)], ORANGE, line='soft', hl=(-0.45, -0.5, 0.34))
    cv.part('muzzle', [Ell(4.2, -19.4, 4.6, 3.0, 0, HD)], CREAM, line=None, clip='head', hl=None, sh=0.45, dk=2)
    pal = {'K': INK, 'W': W}
    le, re = EYES[P['eyes']]
    ey = -26 if P['eyes'] != 'wide' else -27
    cv.stamp(1 + P['look'], ey, le, pal, HD, clip='head')
    cv.stamp(5 + P['look'], ey, re, pal, HD, clip='head')
    m = P['mouth']
    mp = {'d': CREAM[0], 'K': INK, 'W': W, 'r': RED[0], 'R': RED[1]}
    if m == 'shut':
        cv.stamp(2, -20, ['.dddd', 'W....'], mp, HD, clip='head')
    elif m == 'open':
        cv.stamp(3, -21, ['rrrr', 'rRRr', '.rr.'], mp, HD, clip='head')
    elif m == 'grit':
        cv.stamp(3, -21, ['dddd', 'WWWW', 'dddd'], mp, HD, clip='head')
    elif m == 'o':
        cv.stamp(4, -20, ['rr', 'rr'], mp, HD, clip='head')

    # near arm (in front of the body)
    a, ln, bend, fs = P['armN']
    shapes, (hx, hy) = limb(-7, -18, 3.2, a, ln, 3.0, bend, UB)
    cv.part('armN', shapes, ORANGE, line='soft')
    cv.part('fistN', [Ell(hx, hy, 4.0 * fs, 4.0 * fs, 0, UB)], CREAM, line='ink')
    cv.lit_outline()


def _run(i, **kw):
    n, f, bob, sw = stride(i)
    S, H = 5.0, 4.0
    p = dict(
        legN=(n[0] * S, -n[1] * H, n[2]), legF=(f[0] * S, -f[1] * H, f[2]),
        bob=bob + 1 if bob > 0 else bob, lean=9 + (2 if bob > 0 else 0), shift=1,
        armN=(-42 * sw, 10, 2 if sw < 0 else 0, 1.0), armF=(42 * sw, 10, 2 if sw > 0 else 0, 1.0),
        tuft=1.5 if bob < 0 else (0 if bob == 0 else -1), eyes='angry',
    )
    p.update(kw)
    return pose(**p)


def _carry(**kw):
    p = dict(armN=(176, 12, -1.5, 1.0), armF=(184, 12, 1.5, 1.0), head=(0, 1), eyes='angry')
    p.update(kw)
    return p


LIE = dict(rot=-90, pivot=(2.5, -12.5), eyes='shut', armN=(24, 9, 0, 1.0), armF=(14, 9, 0, 1.0), legN=(0, 0, -12), legF=(1, 0, -24), mouth='o')

ANIMS = {
    'idle': [
        pose(),
        pose(bob=-1, armN=(-12, 10, 0, 1.0), armF=(12, 10, 0, 1.0), tuft=0.5),
        pose(bob=1, armN=(-5, 10, 0, 1.0), armF=(5, 10, 0, 1.0), tuft=-0.5),
        pose(eyes='shut'),
    ],
    'run': [_run(i) for i in range(6)],
    'air': [
        pose(armN=(-60, 9, 0, 1.0), armF=(60, 9, 0, 1.0), legN=(-1, -2, 20), legF=(2, -3, -5), bob=-1),
        pose(armN=(-66, 9, 0, 1.0), armF=(66, 9, 0, 1.0), legN=(-1, -2, 24), legF=(2, -3, -9), bob=-1, tuft=1),
    ],
    'jump': [
        pose(sx=0.93, sy=1.07, armN=(-158, 11, 0, 1.0), armF=(150, 10, 0, 1.0), legN=(-2, -1, 38), legF=(1, -3, 20), lean=4, tuft=-1.5, eyes='angry'),
        pose(sx=0.95, sy=1.05, armN=(-150, 11, 0, 1.0), armF=(142, 10, 0, 1.0), legN=(-2, -2, 30), legF=(1, -4, 14), lean=4, tuft=-1),
    ],
    'fall': [
        pose(sx=1.05, sy=0.96, armN=(-128, 10, 0, 1.0), armF=(128, 10, 0, 1.0), legN=(-3, -2, 10), legF=(4, -3, -22), eyes='wide', mouth='o', tuft=2.5, head=(0, -1)),
        pose(sx=1.05, sy=0.96, armN=(-140, 10, 0, 1.0), armF=(118, 10, 0, 1.0), legN=(-3, -3, 4), legF=(4, -2, -16), eyes='wide', mouth='o', tuft=3.5, head=(0, -1)),
    ],
    'attack': [
        # wind-up: the fist goes up and back, the body coils
        pose(lean=-14, bob=2, armN=(205, 11, -2, 1.25), armF=(70, 8, 0, 1.0), eyes='angry', mouth='grit', legN=(-2, 0, 0), legF=(1, 0, 0), tuft=-1),
        # strike: the whole body follows the fist over and down
        pose(lean=20, bob=1, shift=3, armN=(74, 18, 0, 1.6), armF=(-70, 9, 0, 1.0), eyes='angry', mouth='open', legN=(-4, 0, 30), legF=(4, 0, -6), tuft=3),
        # follow-through: the fist carries on into the ground
        pose(lean=26, bob=3, shift=3, armN=(58, 13, 0, 1.3), armF=(-88, 9, 0, 1.0), eyes='angry', mouth='grit', legN=(-4, 0, 30), legF=(4, 0, 0), tuft=2),
        # recover
        pose(lean=10, bob=1, shift=1, armN=(14, 11, 0, 1.05), armF=(-20, 10, 0, 1.0), legN=(-2, 0, 0), legF=(2, 0, 0), tuft=-1),
    ],
    'grab': [
        pose(lean=16, shift=2, armN=(80, 14, 0, 1.15), armF=(58, 7, 0, 1.0), legN=(-3, 0, 20), legF=(3, 0, 0), eyes='angry', mouth='open'),
        pose(lean=-6, bob=2, armN=(70, 11, 3, 1.15), armF=(84, 7, 0, 1.1), legN=(-2, 0, 0), legF=(2, 0, 0), eyes='angry', mouth='grit'),
    ],
    'carry': [
        pose(**_carry()),
        pose(**_carry(bob=1, armN=(172, 12, -2.5, 1.0), armF=(188, 12, 2.5, 1.0), mouth='grit')),
    ],
    'carryRun': [_run(i, **_carry(lean=5, armN=(176 + 3 * (i % 3 - 1), 12, -1.5, 1.0), armF=(184 + 3 * (i % 3 - 1), 12, 1.5, 1.0))) for i in range(6)],
    'throw': [
        pose(lean=-16, bob=2, armN=(206, 12, -2, 1.1), armF=(214, 12, 2, 1.1), eyes='angry', mouth='grit', legN=(-2, 0, 0), legF=(2, 0, 0), head=(0, 1)),
        pose(lean=22, bob=1, shift=3, sx=0.97, sy=1.03, armN=(78, 16, 0, 1.3), armF=(56, 7, 0, 1.0), eyes='angry', mouth='open', legN=(-4, 0, 30), legF=(4, 0, -6), tuft=3),
        pose(lean=14, bob=2, shift=2, armN=(52, 12, 0, 1.1), armF=(60, 8, 0, 1.1), eyes='angry', mouth='grit', legN=(-3, 0, 12), legF=(3, 0, 0), tuft=1),
    ],
    'hurt': [
        pose(lean=-22, move=(-1, -2), armN=(-96, 8, 0, 1.0), armF=(118, 10, 0, 1.0), eyes='ouch', mouth='open', legN=(2, -1, -30), legF=(5, -3, -40), tuft=4, sx=0.95, sy=1.05),
        pose(lean=-14, move=(0, 0), armN=(-70, 9, 0, 1.0), armF=(96, 10, 0, 1.0), eyes='ouch', mouth='grit', legN=(1, 0, -12), legF=(4, -1, -24), tuft=2, bob=1),
    ],
    'down': [pose(**LIE), pose(**dict(LIE, sx=1.05, armN=(30, 9, 0, 1.0), mouth='shut'))],
    'held': [
        pose(move=(0, -2), armN=(-150, 10, 0, 1.0), armF=(112, 10, 0, 1.0), legN=(-3, 1, 40), legF=(4, -2, -30), eyes='wide', mouth='o', tuft=2, lean=-6),
        pose(move=(0, -2), armN=(-108, 10, 0, 1.0), armF=(150, 10, 0, 1.0), legN=(-1, -2, 10), legF=(2, 1, 10), eyes='wide', mouth='open', tuft=-1, lean=6),
    ],
    'hide': [pose(bob=3, sy=0.94, sx=1.04, armN=(150, 9, -3, 1.0), armF=(208, 9, 3, 1.0), eyes='half', look=1, lean=6, head=(0, 2), tuft=-2)],
    'talk': [pose(mouth='open', armF=(60, 9, 2, 1.0)), pose(bob=1, armF=(40, 9, 2, 1.0))],
    'flap': [
        pose(armN=(-128, 11, 0, 1.0), armF=(128, 11, 0, 1.0), eyes='ouch', mouth='grit', legN=(-1, -2, 20), legF=(2, -3, 0), bob=-1, tuft=-2),
        pose(armN=(-52, 11, 0, 1.0), armF=(52, 11, 0, 1.0), eyes='ouch', mouth='grit', legN=(-2, -1, 30), legF=(2, -1, 10), bob=1, tuft=3),
    ],
}
