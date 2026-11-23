"""DRAFT: the grappler, round 2 (handoff-prompts/look2-heroes.md, section 3.1).

A dedicated puppet for the grappler, drawn with pix.Figure: masks, clean-up,
inner lines and cel shading, hand-placed face pixels, a 1 px ink outline.
It follows the owner's liked concept (docs/art-reference/heroes-v2-chatgpt-concept.png,
top row): a navy-slate bruiser with a big head pushed forward of the
shoulders, a tan muzzle about half the head, a heavy brow, big eyes, a
swept-back orange crest, an orange scarf, green shorts, a brown backpack and
big tan fists. Redrawn natively at 1x from round parts; nothing traced.

Body box 18x30 (content/characters/grappler.json) in a 56x44 cell, anchor
(19, 14): the feet stand on row 43, centred on x = 28.
"""
import math

from pix import Figure, INK, hex3, ramp, settle

CW, CH = 56, 44
FX, FY = 28, 43           # feet centre x; the ground row (the outline sits on it)
BOX = (18, 30)

# INTENT: carry, carryRun and throw[0] hold both fists together above the
# head at this one cell pixel; the actors lane draws the carried body's
# bottom-centre here (contract, "Round 2 additions", carryAt).
CARRY_AT = (28, 2)

# ---------------------------------------------------------------- colours
# DRAFT: a darker, bluer slate than the castle's lilac: the blue ramp's darks
# greyed toward ink, with in-between shades (no new hue). None of these is
# among the top five colours of any atlas or backdrop (selfcheck.py checks).
NAVY = ramp('#1d2048', '#2a3264', '#3a4884', '#4f63aa')
NAVY_RIM = hex3('#5c92f5')
SKIN = ramp('#c88a5a', '#d9a070', '#f0c090', '#ffe2c0')
SKIN_D = ramp('#94583a', '#c07a4a', '#c88a5a', '#e3a56b')
ORANGE = ramp('#b0481a', '#e8742a', '#ffa048', '#ffd090')
CREST = ramp('#b0481a', '#e8742a', '#ffa048', '#ffa048')
CREST2 = list(CREST)  # same colours; a separate ramp so neighbouring spikes get an inner line
SKIN2 = list(SKIN)
SHORTS = ramp('#1c6b4a', '#2a9a5c', '#58c96a', '#9be37a')
PACK = ramp('#6b3f2a', '#94583a', '#c07a4a', '#e3a56b')
PACK_ROLL = ramp('#a8651a', '#c88a3a', '#e09a1e', '#ffd23f')
BELT = ramp('#5a3420', '#5a3420', '#6b3f2a', '#6b3f2a')

C_INK = INK
C_WHITE = hex3('#ffffff')
C_MOUTH = hex3('#8a1c3a')
C_TONGUE = hex3('#f0596a')
C_TEETH = hex3('#ffffff')
C_BROW = hex3('#1c2150')
C_BLUSH = hex3('#f0596a')


def P(**kw):
    base = dict(by=0.0, sx=1.0, sy=1.0, lean=0.0, hy=0.0, tilt=0.0,
                ff=(0, 0), bf=(0, 0), fh=(0, 0), bh=(0, 0), fist=1.0, bfist=1.0,
                eyes='open', mouth='grit', brow='mad', crest=0.0, tail=190, wave=0.0,
                front=False, hands=None)
    base.update(kw)
    return base


# ---------------------------------------------------------------- face pixels

def eye(fig, x, y, mode, side=1):
    """A 2x3 eye with its top-left pixel at (x, y) and a light pixel."""
    x, y = int(round(x)), int(round(y))
    if mode in ('open', 'wide', 'focus'):
        for yy in range(y, y + 3):
            fig.px(x, yy, C_INK)
            fig.px(x + 1, yy, C_INK)
        fig.px(x, y, C_WHITE)
        if mode == 'wide':
            fig.px(x, y - 1, C_INK)
            fig.px(x + 1, y - 1, C_INK)
            fig.px(x + 1, y, C_WHITE)
    elif mode in ('blink', 'shut'):
        fig.px(x, y + 2, C_INK)
        fig.px(x + 1, y + 2, C_INK)
        fig.px(x - (1 if side > 0 else -2), y + 1, C_INK)
    elif mode == 'half':
        fig.px(x, y + 1, C_INK); fig.px(x + 1, y + 1, C_INK)
        fig.px(x, y + 2, C_INK); fig.px(x + 1, y + 2, C_INK)
        fig.px(x, y + 1, C_WHITE)
    elif mode == 'hurt':
        # > < squeezed shut
        if side > 0:
            fig.px(x, y, C_INK); fig.px(x + 1, y + 1, C_INK); fig.px(x, y + 2, C_INK)
        else:
            fig.px(x + 1, y, C_INK); fig.px(x, y + 1, C_INK); fig.px(x + 1, y + 2, C_INK)


def brow(fig, x0, x1, y, mode, nose_side=1):
    """A 2 px heavy brow from x0 to x1 (x1 is toward the nose)."""
    x0, x1, y = int(round(x0)), int(round(x1)), int(round(y))
    n = max(1, x1 - x0)
    for i, x in enumerate(range(x0, x1 + 1)):
        t = i / n
        if mode == 'mad':
            dy = int(round(t * 1.4))          # presses down toward the nose
        elif mode == 'up':
            dy = -int(round(t * 1.0))          # lifts in surprise
        else:
            dy = 0
        if nose_side < 0:
            dy = int(round((1 - t) * 1.4)) if mode == 'mad' else (-int(round((1 - t) * 1.0)) if mode == 'up' else 0)
        fig.px(x, y + dy, C_BROW)
        fig.px(x, y + dy + 1, C_BROW)


def mouth(fig, x, y, mode, w=4):
    """Mouth with its top-left at (x, y)."""
    x, y = int(round(x)), int(round(y))
    if mode == 'grit':
        for i in range(w):
            fig.px(x + i, y, C_INK)
            fig.px(x + i, y + 1, C_TEETH)
            fig.px(x + i, y + 2, C_INK)
        fig.px(x + w // 2, y + 1, C_INK)
    elif mode == 'shout':
        # a big open shouting mouth: dark, a tongue, teeth on top
        for yy in range(y, y + 4):
            for i in range(w):
                fig.px(x + i, yy, C_MOUTH)
        for i in range(w):
            fig.px(x + i, y, C_TEETH)
        fig.px(x + 1, y + 3, C_TONGUE); fig.px(x + 2, y + 3, C_TONGUE)
        fig.px(x + 1, y + 2, C_TONGUE)
        for i in range(-1, w + 1):
            fig.px(x + i, y - 1, C_INK) if i in (-1, w) else None
        for yy in range(y, y + 4):
            fig.px(x - 1, yy, C_INK)
            fig.px(x + w, yy, C_INK)
        for i in range(w):
            fig.px(x + i, y + 4, C_INK)
    elif mode == 'grin':
        for i in range(w):
            fig.px(x + i, y + 1, C_INK)
        fig.px(x - 1, y, C_INK)
        fig.px(x + w, y, C_INK)
        fig.px(x + 1, y + 2, C_INK); fig.px(x + 2, y + 2, C_INK)
    elif mode == 'o':
        fig.px(x + 1, y, C_INK); fig.px(x + 2, y, C_INK)
        fig.px(x, y + 1, C_INK); fig.px(x + 1, y + 1, C_MOUTH); fig.px(x + 2, y + 1, C_MOUTH); fig.px(x + 3, y + 1, C_INK)
        fig.px(x + 1, y + 2, C_INK); fig.px(x + 2, y + 2, C_INK)
    elif mode == 'flat':
        for i in range(w - 1):
            fig.px(x + i, y + 1, C_INK)


# ---------------------------------------------------------------- parts

def crest(fig, hx, hy, p):
    """Orange spikes swept back from the top of the head; never an upright crown."""
    fl = p['crest']
    tl = (p['tail'] - 190) * 0.25
    spikes = (  # root dx, root dy (from head centre), angle (deg, 180 = straight back), length
        (3.5, -7.4, 200, 8.0),
        (-0.5, -8.0, 190, 9.0),
        (-4.5, -6.6, 178, 7.5),
        (-7.2, -3.6, 160, 5.5),
    )
    for i, (dx, dy, ang, ln) in enumerate(spikes):
        a = math.radians(ang + tl - fl * (ang - 176) * 0.9 + (0.8 * math.sin(p['wave'] + i) if fl < 0.5 else 0))
        ln = ln * (1 - 0.15 * fl)
        x0, y0 = hx + dx, hy + dy + fl * 1.5
        xm, ym = x0 + 0.55 * ln * math.cos(a), y0 + 0.55 * ln * math.sin(a)
        x1, y1 = x0 + ln * math.cos(a), y0 + ln * math.sin(a)
        rmp = CREST if i % 2 == 0 else CREST2
        fig.cap(9.6 + i * 0.01, rmp, x0, y0, xm, ym, 1.7, bias=0.25)
        fig.cap(9.6 + i * 0.01, rmp, xm, ym, x1, y1, 0.8, bias=0.25)


def scarf(fig, x0, y0, x1, y1, p, tail=True):
    fig.cap(9.2, ORANGE, x0, y0, x1, y1, 1.9, bias=0.15)
    if tail:
        a = math.radians(p['tail'])
        x, y = x0 - 0.5, y0 + 0.5
        for s in range(3):
            wv = 0.45 * math.sin(p['wave'] + s * 1.4)
            nx_, ny_ = x + 2.6 * math.cos(a + wv), y + 2.6 * math.sin(a + wv)
            fig.cap(3.2, ORANGE, x, y, nx_, ny_, 1.5 if s < 2 else 1.1, noline=True, bias=0.2)
            x, y = nx_, ny_


def arm(fig, sh, hand, z, back, fist=1.0, wrap=True, skin=None):
    fig.ell(z, NAVY, sh[0], sh[1], 3.6, 3.4, back=back, bias=0.1)
    fig.cap(z + 0.1, NAVY, sh[0], sh[1], hand[0], hand[1], 2.7, back=back)
    if wrap:
        t0, t1 = 0.62, 0.78
        wx0 = sh[0] + (hand[0] - sh[0]) * t0
        wy0 = sh[1] + (hand[1] - sh[1]) * t0
        wx1 = sh[0] + (hand[0] - sh[0]) * t1
        wy1 = sh[1] + (hand[1] - sh[1]) * t1
        fig.cap(z + 0.2, SKIN_D, wx0, wy0, wx1, wy1, 3.0, back=back, noline=True)
    fig.ell(z + 0.3, skin or SKIN, hand[0], hand[1], 4.0 * fist, 3.8 * fist, back=back, bias=0.25)


def legs(fig, p, by, hipx=3.6):
    for side, off, z, back in ((1, p['ff'], 7, 0), (-1, p['bf'], 2.5, 1)):
        hip = (FX + side * hipx, FY - 8 + by)
        foot = (FX + side * 4.6 + off[0], FY - 2.3 + off[1])
        fig.cap(z, NAVY, hip[0], hip[1], foot[0], foot[1] - 1.2, 2.9, back=back)
        fig.ell(z + 0.1, SKIN, foot[0] + 1.0, foot[1], 3.7, 2.3, back=back, bias=0.2)


# ---------------------------------------------------------------- side view

def side(p, state):
    fig = Figure(CW, CH)
    by = p['by']
    sx, sy = p['sx'], p['sy']
    lean = p['lean']

    # torso: a broad barrel
    tcx, tcy = FX - 0.5 + lean * 0.3, FY - 15.2 + by
    trx, try_ = 9.6 * sx, 7.4 * sy
    top = tcy - try_

    legs(fig, p, by)

    # shorts and belt
    fig.ell(6, SHORTS, FX + 0.3 + lean * 0.15, FY - 8.6 + by, 8.0 * sx, 3.6, bias=0.1)
    fig.cap(6.5, BELT, FX - 7.2 * sx + lean * 0.2, FY - 11.4 + by, FX + 7.6 * sx + lean * 0.2, FY - 11.2 + by, 0.9, flat=2)
    fig.ell(6.6, PACK_ROLL, FX + 4.0 + lean * 0.2, FY - 11.3 + by, 1.5, 1.3, flat=2, noline=True)

    # backpack behind the shoulders: the silhouette's hump
    fig.ell(3, PACK, tcx - 9.4, tcy - 3.5, 5.6, 6.8, bias=0.15)
    fig.cap(3.1, BELT, tcx - 13.0, tcy - 3.0, tcx - 6.0, tcy - 3.6, 0.6, flat=2)

    fig.ell(5, NAVY, tcx, tcy, trx, try_, bias=0.05)
    # a strap across the chest
    fig.cap(5.5, BELT, tcx - 5.0, top + 2.0, tcx + 3.5, tcy + 4.5, 0.8, flat=2)

    # head: raised, pushed forward of the shoulders, a neck dip behind it
    hx = FX + 3.2 + lean
    hy = FY - 29.6 + by * 0.8 + p['hy']
    fig.ell(8, NAVY, hx, hy, 8.8, 8.4, bias=0.25)
    # a pointed ear at the back of the head
    fig.cap(7.9, NAVY, hx - 6.2, hy - 1.0, hx - 8.6, hy - 4.6, 1.6, bias=0.2)
    # the tan muzzle: about half the head, pushed a little past its front
    fig.ell(8.5, SKIN, hx + 3.8, hy + 2.8, 6.6, 5.2, bias=0.35)
    crest(fig, hx, hy, p)
    scarf(fig, hx - 6.6, hy + 7.0, hx + 4.4, hy + 8.0, p)

    # arms: big round shoulders, wrapped wrists, huge tan fists
    shf = (tcx + 5.6, top + 4.2)
    shb = (tcx - 4.6, top + 3.6)
    restf = (FX + 10.6, FY - 12.0 + by)
    restb = (FX - 7.0, FY - 13.0 + by)
    if p['hands'] is not None:
        hf, hb = p['hands']
    else:
        hf = (restf[0] + p['fh'][0], restf[1] + p['fh'][1])
        hb = (restb[0] + p['bh'][0], restb[1] + p['bh'][1])
    arm(fig, shb, hb, 4.0, 1, p['bfist'])
    arm(fig, shf, hf, 12.0, 0, p['fist'])

    # face
    hxi, hyi = int(round(hx)), int(round(hy))
    if p['eyes'] not in ('none',):
        eye(fig, hxi + 1, hyi - 1, p['eyes'], side=1)
        eye(fig, hxi + 5, hyi - 1, p['eyes'], side=-1)
    if p['brow'] != 'none':
        bm = p['brow']
        yb = hyi - 4 + (1 if p['eyes'] == 'wide' and bm != 'up' else 0)
        if p['eyes'] == 'wide':
            yb -= 1
        brow(fig, hxi - 1, hxi + 7, yb, bm)
    if p['mouth'] != 'none':
        if p['mouth'] == 'shout':
            mouth(fig, hxi + 4, hyi + 3, 'shout', w=4)
        else:
            mouth(fig, hxi + 3, hyi + 3, p['mouth'], w=4)
    # a rim of light on the lit back edge of the head and shoulder
    return fig


# ---------------------------------------------------------------- front view (the hoist)

def front(p, state):
    """Turned to face us, both fists together above the head (the concept's 5th pose)."""
    fig = Figure(CW, CH)
    by = p['by']
    tcx, tcy = FX, FY - 14.8 + by
    trx, try_ = 10.0 * p['sx'], 7.2 * p['sy']
    top = tcy - try_

    # legs apart, braced
    for side_, off, z in ((1, p['ff'], 7), (-1, p['bf'], 7)):
        hip = (FX + side_ * 4.4, FY - 8 + by)
        foot = (FX + side_ * 6.0 + off[0], FY - 2.3 + off[1])
        fig.cap(z, NAVY, hip[0], hip[1], foot[0], foot[1] - 1.2, 2.9)
        fig.ell(z + 0.1, SKIN, foot[0] + side_ * 0.8, foot[1], 3.4, 2.3, bias=0.2)
    fig.ell(6, SHORTS, FX, FY - 8.8 + by, 8.6, 3.6, bias=0.1)
    fig.cap(6.5, BELT, FX - 8.2, FY - 11.5 + by, FX + 8.2, FY - 11.5 + by, 0.9, flat=2)
    fig.ell(6.6, PACK_ROLL, FX, FY - 11.5 + by, 1.5, 1.3, flat=2, noline=True)
    # the backpack's straps over both shoulders, the pack peeking at the sides
    fig.ell(3, PACK, FX - 9.5, tcy - 1, 3.5, 5.5)
    fig.ell(3, PACK, FX + 9.5, tcy - 1, 3.5, 5.5)
    fig.ell(5, NAVY, tcx, tcy, trx, try_, bias=0.05)
    fig.cap(5.5, BELT, FX - 5.5, top + 1.5, FX - 5.0, tcy + 4.5, 0.8, flat=2)
    fig.cap(5.5, BELT, FX + 5.5, top + 1.5, FX + 5.0, tcy + 4.5, 0.8, flat=2)

    # head: lowered under the load, crest flattened
    hx = FX + 0.5
    hy = FY - 26.6 + by * 0.8 + p['hy']
    fig.ell(8, NAVY, hx, hy, 7.6, 7.8, bias=0.25)
    fig.ell(8.5, SKIN, hx, hy + 2.6, 6.4, 4.8, bias=0.35)
    # crest flattened sideways under the load
    for i, (dx, ang, ln) in enumerate(((-3.0, 195, 5.0), (3.0, -15, 5.0), (-6.0, 170, 3.5), (6.0, 10, 3.5))):
        a = math.radians(ang)
        x0, y0 = hx + dx, hy - 6.6
        x1, y1 = x0 + ln * math.cos(a), y0 + ln * math.sin(a)
        rmp = CREST if i % 2 == 0 else CREST2
        fig.cap(9.6, rmp, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2, 1.6, bias=0.25)
        fig.cap(9.6, rmp, (x0 + x1) / 2, (y0 + y1) / 2, x1, y1, 0.8, bias=0.25)
    # scarf
    fig.cap(9.2, ORANGE, hx - 6.0, hy + 7.6, hx + 6.0, hy + 7.6, 1.5, bias=0.15)
    a = math.radians(p['tail'])
    x, y = hx - 7.0, hy + 8.0
    for s in range(2):
        wv = 0.4 * math.sin(p['wave'] + s * 1.4)
        nx_, ny_ = x + 2.6 * math.cos(a + wv), y + 2.6 * math.sin(a + wv)
        fig.cap(3.2, ORANGE, x, y, nx_, ny_, 1.4, noline=True, bias=0.2)
        x, y = nx_, ny_

    # arms straight up beside the head, fists together at the hands point
    hp = p['hands'] if p['hands'] is not None else (CARRY_AT[0] + 0.5, CARRY_AT[1] + 3.8)
    # INTENT: the arms pass behind the head (z under it) so the face stays clear
    fl = (hp[0] - 6.6, hp[1] + 0.6)
    fr = (hp[0] + 6.6, hp[1] + 0.6)
    arm(fig, (FX - 10.4, top + 3.0), fl, 7.4, 0, 0.9)
    arm(fig, (FX + 10.4, top + 3.0), fr, 7.6, 0, 0.9, skin=SKIN2)

    hxi, hyi = int(round(hx)), int(round(hy))
    eye(fig, hxi - 4, hyi - 1, p['eyes'], side=1)
    eye(fig, hxi + 2, hyi - 1, p['eyes'], side=-1)
    brow(fig, hxi - 5, hxi - 1, hyi - 4, p['brow'], nose_side=1)
    brow(fig, hxi + 1, hxi + 5, hyi - 4, p['brow'], nose_side=-1)
    if p['mouth'] == 'shout':
        mouth(fig, hxi - 2, hyi + 3, 'shout', w=4)
    else:
        mouth(fig, hxi - 2, hyi + 3, p['mouth'], w=4)
    return fig


# ---------------------------------------------------------------- lying down

def down(p, i):
    """Flat on his back, eyes shut, fists flopped; hand-drawn, not a rotated idle."""
    fig = Figure(CW, CH)
    br = 0.5 if i == 1 else 0.0
    g = FY - 1  # lowest mask row
    # backpack squashed underneath
    fig.ell(3, PACK, FX - 1.0, g - 2.0, 7.0, 2.4)
    # torso on its back
    fig.ell(5, NAVY, FX + 1.0, g - 5.6 - br * 0.5, 9.6, 5.2 + br, bias=0.05)
    fig.cap(5.5, BELT, FX - 4.0, g - 9.8, FX + 4.0, g - 6.0, 0.8, flat=2)
    # shorts and legs raised a little, feet up
    fig.ell(6, SHORTS, FX + 9.6, g - 4.6, 3.8, 4.4, bias=0.1)
    for dx, z in ((0.0, 7), (-2.0, 2.5)):
        fig.cap(z, NAVY, FX + 11.0 + dx, g - 5.0, FX + 15.0 + dx, g - 7.5 + dx * 0.5, 2.7)
        fig.ell(z + 0.1, SKIN, FX + 16.6 + dx, g - 8.6 + dx * 0.5, 2.3, 3.4, bias=0.2)
    # head toward the back, face up
    hx, hy = FX - 13.0, g - 7.2
    fig.ell(8, NAVY, hx, hy, 7.8, 7.0, bias=0.25)
    fig.ell(8.5, SKIN, hx + 1.0, hy - 2.6, 5.2, 4.6, bias=0.35)
    # crest spread out on the floor behind the head
    for j, (ang, ln) in enumerate(((150, 6.0), (172, 7.0), (194, 6.0))):
        a = math.radians(ang)
        x0, y0 = hx - 6.0, hy + 1.0
        x1, y1 = x0 + ln * math.cos(a), y0 + ln * math.sin(a)
        fig.cap(7.5, CREST, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2, 1.8, noline=True, bias=0.25)
        fig.cap(7.5, CREST, (x0 + x1) / 2, (y0 + y1) / 2, x1, y1, 1.0, noline=True, bias=0.25)
    # scarf at the neck
    fig.cap(9.2, ORANGE, hx + 6.0, hy - 4.0, hx + 7.4, hy + 4.4, 1.9, bias=0.15)
    # fists flopped on the floor either side
    fig.cap(10, NAVY, FX - 4.0, g - 8.0, FX - 6.0, g - 1.5, 2.6)
    fig.ell(10.3, SKIN, FX - 6.5, g - 2.8, 3.6, 2.8, bias=0.25)
    fig.cap(2.0, NAVY, FX + 3.0, g - 9.0, FX + 5.0, g - 12.0, 2.4, back=1)
    fig.ell(2.3, SKIN, FX + 5.5, g - 13.0, 3.0, 3.0, back=1, bias=0.25)
    hxi, hyi = int(round(hx)), int(round(hy))
    # eyes shut: two short curves; a little "o" of a mouth
    for ex in (hxi - 2, hxi + 2):
        fig.px(ex, hyi - 4, C_INK); fig.px(ex + 1, hyi - 4, C_INK)
        fig.px(ex - 1, hyi - 5, C_INK)
    fig.px(hxi - 6, hyi - 2, C_BROW); fig.px(hxi - 5, hyi - 3, C_BROW)
    mouth(fig, hxi + 4, hyi - 4, 'o')
    img = fig.render()
    return settle(img, CH - 1)


# ---------------------------------------------------------------- poses

def run_legs(i, S=5.0, L=3.2):
    ph = 2 * math.pi * i / 6
    def leg(ps):
        return (S * math.cos(ps), -L * max(0.0, -math.sin(ps)))
    return leg(ph), leg(ph + math.pi), ph


def poses():
    out = {}
    out['idle'] = [
        P(),
        P(by=0.5, sy=0.98, fh=(0, 0.5), bh=(0, 0.5), wave=0.7),
        P(by=1.0, sy=0.96, hy=0.4, fh=(0, 1), bh=(0, 1), wave=1.4),
        P(by=0.5, eyes='blink', fh=(0, 0.5), bh=(0, 0.5), wave=2.1),
    ]
    bob = [0, 1, -1, 0, 1, -1]
    out['run'] = []
    for i in range(6):
        a, b, ph = run_legs(i)
        out['run'].append(P(by=bob[i], lean=1.6, ff=a, bf=b, fh=(-5.0 * math.cos(ph) + 1, -2 + bob[i] * 0.5),
                            bh=(5.0 * math.cos(ph), -2), tail=176, wave=ph,
                            mouth='grin' if i % 3 == 2 else 'grit'))
    out['air'] = [
        P(by=-1, sy=1.05, sx=0.96, ff=(2, -3), bf=(-1, -2), fh=(-2, -12), bh=(4, -10), mouth='shout', brow='up', eyes='wide', tail=140, wave=0.5),
        P(by=0, sy=0.97, sx=1.03, ff=(3, -1), bf=(-3, -2), fh=(3, -6), bh=(-4, -6), mouth='o', eyes='wide', brow='up', tail=235, wave=2.0, crest=-0.3),
    ]
    out['attack'] = [
        P(by=1, lean=-1.2, ff=(2, 0), bf=(-2, 0), fh=(-7, -2), bh=(3, -1), mouth='grit', tail=170, sx=1.03, sy=0.97),
        P(by=0, lean=2.6, ff=(5, 0), bf=(-3, 0), fh=(11, -3), bh=(-3, 0), mouth='shout', fist=1.2, tail=200),
        P(by=0, lean=2.4, ff=(5, 0), bf=(-3, -0.5), fh=(10, -2), bh=(-2, 0.5), mouth='shout', fist=1.1, tail=205),
        P(by=0, lean=1.0, ff=(2, 0), bf=(-2, 0), fh=(3, 0), bh=(-1, 0), mouth='grin', tail=185),
    ]
    out['grab'] = [
        P(by=1.5, lean=2.5, ff=(4, 0), bf=(-2, 0), fh=(6, 4), bh=(12, 3), eyes='wide', brow='up', mouth='o', tail=180, sx=1.03, sy=0.95),
        P(by=1.0, lean=1.5, ff=(3, 0), bf=(-2, 0), fh=(4, -2), bh=(10, -2), mouth='grit', tail=180),
    ]
    hp = (CARRY_AT[0] + 0.5, CARRY_AT[1] + 3.8)
    out['carry'] = [
        P(front=True, hands=hp, eyes='focus', mouth='grit', ff=(0, 0), bf=(0, 0), crest=1.0, tail=160),
        P(front=True, hands=hp, by=1, sy=0.96, eyes='focus', mouth='shout', ff=(0.5, 0), bf=(-0.5, 0), crest=1.0, tail=165, wave=1.5),
    ]
    out['carryRun'] = []
    for i in range(6):
        ph = 2 * math.pi * i / 6
        lift_f = -2.6 * max(0.0, -math.sin(ph))
        lift_b = -2.6 * max(0.0, math.sin(ph))
        out['carryRun'].append(P(front=True, hands=hp, by=[0, 1, 0, 0, 1, 0][i], ff=(1.5 * math.cos(ph), lift_f),
                                 bf=(-1.5 * math.cos(ph), lift_b), eyes='focus', mouth='grit' if i % 3 else 'shout',
                                 crest=1.0, tail=175, wave=ph))
    out['throw'] = [
        P(front=True, hands=hp, eyes='focus', mouth='grit', crest=1.0, tail=160),
        P(by=0, lean=2.6, ff=(5, 0), bf=(-3, -1), hands=((FX + 14, FY - 33), (FX + 9, FY - 34)), eyes='wide', mouth='shout', brow='mad', tail=200),
        P(by=1, lean=2.0, ff=(5, 0), bf=(-3, 0), fh=(8, 1), bh=(12, 2), mouth='shout', sx=1.03, sy=0.97, tail=190),
    ]
    out['hurt'] = [
        P(by=0, lean=-2.5, hy=-1, ff=(-1, 0), bf=(-3, -1), fh=(-4, -8), bh=(-3, -7), eyes='hurt', brow='none', mouth='o', tail=235, sx=0.97, sy=1.03),
        P(by=1, lean=-3.0, ff=(0, 0), bf=(-3, 0), fh=(-6, -5), bh=(-2, -5), eyes='hurt', brow='none', mouth='o', tail=220, sx=1.03, sy=0.97),
    ]
    out['down'] = [P(), P()]
    out['held'] = [
        P(by=-1, ff=(3, -3), bf=(-2, -1), fh=(2, -10), bh=(-2, -6), eyes='wide', brow='up', mouth='shout', tail=110),
        P(by=-1, ff=(1, -1), bf=(-3, -3), fh=(4, -6), bh=(0, -10), eyes='hurt', brow='none', mouth='o', tail=100, wave=2),
    ]
    out['hide'] = [P(by=5, sy=0.85, sx=1.06, hy=1.5, lean=0.5, ff=(2, 0), bf=(-2, 0), fh=(-2, -6), bh=(1, -5), eyes='half', brow='flat', mouth='none', tail=180)]
    out['talk'] = [
        P(fh=(3, -7), mouth='shout', brow='flat'),
        P(fh=(2, -4), mouth='grin', brow='flat', by=0.5),
    ]
    out['flap'] = [
        P(by=-1, ff=(1, -1), bf=(-1, -2), fh=(3, -14), bh=(-3, -13), eyes='wide', brow='up', mouth='shout', tail=130),
        P(by=0, ff=(1, 0), bf=(-1, -1), fh=(5, 2), bh=(-4, 2), mouth='grit', tail=160),
    ]
    return out


POSES = poses()


def frame(state, i):
    p = POSES[state][i]
    if state == 'down':
        return down(p, i)
    fig = front(p, state) if p['front'] else side(p, state)
    return fig.render()
