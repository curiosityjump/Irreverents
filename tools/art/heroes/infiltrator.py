"""DRAFT: the infiltrator, round 2 (handoff-prompts/look2-heroes.md, section 3.2).

A dedicated puppet drawn with pix.Figure, after the owner's liked concept
(docs/art-reference/heroes-v2-chatgpt-concept.png, bottom row): upright and
big-headed, two leaf ears raised up and back in a V, goggles pushed up on the
brow, a tan face with big eyes, one orange scarf streamer. Redrawn natively
at 1x; nothing traced.

Body box 10x12 (content/characters/infiltrator.json) in a 32x32 cell, anchor
(11, 20): the feet stand on row 31, centred on x = 16. The contract's round-2
overhang lets the picture rise up to 12 px above the box (row 8) and reach
6 px past each side (x 5..26).
"""
import math

from pix import Figure, INK, hex3, ramp, settle

CW, CH = 32, 32
FX, FY = 16, 31
BOX = (10, 12)

# DRAFT: the darkest green is an in-between of the foliage dark and ink, off the castle backdrop's hedges.
LEAF = ramp('#1a5a44', '#2a9a5c', '#58c96a', '#9be37a')
LEAF2 = list(LEAF)        # same colours; a separate ramp so the two ears get a line between them
EARIN = ramp('#2a9a5c', '#58c96a', '#9be37a', '#a8f070')
TUNIC = ramp('#1a5a44', '#1f7a3d', '#2a9a5c', '#58c96a')
SKIN = ramp('#c88a5a', '#d9a070', '#f0c090', '#ffe2c0')
SKIN2 = list(SKIN)
ORANGE = ramp('#b0481a', '#e8742a', '#ffa048', '#ffd090')
STRAP = ramp('#5a3420', '#6b3f2a', '#8a5230', '#8a5230')
LENS = ramp('#a8651a', '#e09a1e', '#ffd23f', '#fff1a0')
BOOT = ramp('#5a3420', '#6b3f2a', '#94583a', '#c07a4a')

C_INK = INK
C_WHITE = hex3('#ffffff')
C_MOUTH = hex3('#8a1c3a')
C_GLASS = hex3('#a0f0e0')
C_BLUSH = hex3('#ff98c0')


def P(**kw):
    base = dict(by=0.0, sx=1.0, sy=1.0, lean=0.0, hy=0.0, ff=(0, 0), bf=(0, 0), fh=(0, 0), bh=(0, 0),
                eyes='open', mouth='smile', ears=0.0, tail=200, wave=0.0, look=0)
    base.update(kw)
    return base


def eye(fig, x, y, mode, side=1):
    x, y = int(round(x)), int(round(y))
    if mode in ('open', 'wide', 'focus'):
        top = y + (1 if mode == 'focus' else 0)
        for yy in range(top, y + 3):
            fig.px(x, yy, C_INK)
            fig.px(x + 1, yy, C_INK)
        fig.px(x, top, C_WHITE)
        if mode == 'wide':
            fig.px(x, y - 1, C_INK); fig.px(x + 1, y - 1, C_INK)
        if mode == 'focus':
            fig.px(x + (1 if side > 0 else 0), y, C_INK)
    elif mode in ('blink', 'shut'):
        fig.px(x, y + 2, C_INK); fig.px(x + 1, y + 2, C_INK)
    elif mode == 'half':
        fig.px(x, y + 2, C_INK); fig.px(x + 1, y + 2, C_INK)
        fig.px(x, y + 1, C_INK); fig.px(x + 1, y + 1, C_INK)
        fig.px(x, y + 1, C_WHITE)
    elif mode == 'hurt':
        if side > 0:
            fig.px(x, y, C_INK); fig.px(x + 1, y + 1, C_INK); fig.px(x, y + 2, C_INK)
        else:
            fig.px(x + 1, y, C_INK); fig.px(x, y + 1, C_INK); fig.px(x + 1, y + 2, C_INK)


def mouth(fig, x, y, mode):
    x, y = int(round(x)), int(round(y))
    if mode == 'smile':
        fig.px(x, y, C_INK); fig.px(x + 1, y + 1, C_INK) if False else fig.px(x + 1, y, C_INK)
    elif mode == 'open':
        fig.px(x, y, C_MOUTH); fig.px(x + 1, y, C_MOUTH); fig.px(x, y + 1, C_MOUTH); fig.px(x + 1, y + 1, C_MOUTH)
    elif mode == 'o':
        fig.px(x, y, C_MOUTH); fig.px(x, y + 1, C_MOUTH)
    elif mode == 'grit':
        fig.px(x - 1, y, C_INK); fig.px(x, y, C_WHITE); fig.px(x + 1, y, C_WHITE); fig.px(x + 2, y, C_INK)


def ear(fig, z, rmp, x0, y0, ang, ln, r0=1.9):
    a = math.radians(ang)
    xm, ym = x0 + 0.5 * ln * math.cos(a), y0 + 0.5 * ln * math.sin(a)
    x1, y1 = x0 + ln * math.cos(a), y0 + ln * math.sin(a)
    fig.cap(z, rmp, x0, y0, xm, ym, r0, bias=0.2)
    fig.cap(z, rmp, xm, ym, x1, y1, r0 * 0.55, bias=0.2)


def head(fig, hx, hy, p, face=True):
    """The big head with ears, goggles, face and scarf. (hx, hy) is the head centre."""
    e = p['ears']
    fig.ell(8, LEAF, hx, hy, 6.2, 5.6, bias=0.25)
    # leaf ears raised up and back in a clear V above the head
    ear(fig, 7.0, LEAF, hx - 0.6, hy - 2.6, 232 - e * 22, 6.6, r0=2.3)
    ear(fig, 6.9, LEAF2, hx - 3.4, hy - 1.6, 200 - e * 14, 6.2, r0=2.2)
    # a light vein down each leaf
    for (x0, y0, ang, ln) in ((hx - 0.6, hy - 2.6, 232 - e * 22, 4.6), (hx - 3.4, hy - 1.6, 200 - e * 14, 4.8)):
        a = math.radians(ang)
        for t in (2.0, 3.0, 4.0):
            if t <= ln:
                fig.px(x0 + t * math.cos(a), y0 + t * math.sin(a), EARIN[2])
    if face:
        fig.ell(8.5, SKIN, hx + 1.9, hy + 1.6, 4.5, 3.7, bias=0.35)
    # goggles pushed up on the brow
    fig.cap(9.0, STRAP, hx - 5.6, hy - 2.2, hx + 5.6, hy - 3.4, 0.7, flat=1)
    fig.ell(9.5, LENS, hx + 1.0, hy - 3.8, 1.7, 1.5, bias=0.2)
    fig.ell(9.6, LENS, hx + 4.4, hy - 3.6, 1.7, 1.5, bias=0.2)
    fig.px(hx + 1.0, hy - 4.2, C_GLASS)
    fig.px(hx + 4.4, hy - 4.0, C_GLASS)
    # the scarf, one streamer
    fig.cap(9.2, ORANGE, hx - 3.4, hy + 5.4, hx + 3.6, hy + 5.8, 1.2, bias=0.15)
    a = math.radians(p['tail'])
    x, y = hx - 3.6, hy + 5.6
    for s in range(3):
        wv = 0.5 * math.sin(p['wave'] + s * 1.5)
        nx_, ny_ = x + 2.0 * math.cos(a + wv), y + 2.0 * math.sin(a + wv)
        fig.cap(3.0, ORANGE, x, y, nx_, ny_, 1.1 if s < 2 else 0.8, noline=True, bias=0.2)
        x, y = nx_, ny_
    if face:
        hxi, hyi = int(round(hx)), int(round(hy))
        lk = p['look']
        eye(fig, hxi + lk, hyi - 1, p['eyes'], side=1)
        eye(fig, hxi + 4 + lk, hyi - 1, p['eyes'], side=-1)
        if p['eyes'] not in ('hurt',):
            fig.px(hxi + 6 + lk, hyi + 2, C_BLUSH)
        if p['mouth'] != 'none':
            mouth(fig, hxi + 2 + lk, hyi + 3, p['mouth'])


def side(p, state):
    fig = Figure(CW, CH)
    by = p['by']
    # feet and legs
    for sd, off, z, back in ((1, p['ff'], 7, 0), (-1, p['bf'], 2, 1)):
        foot = (FX + sd * 1.9 + off[0], FY - 1.3 + off[1])
        fig.ell(z, BOOT, foot[0] + 0.5, foot[1], 1.9, 1.3, back=back, bias=0.2)
    # body
    bcx, bcy = FX + p['lean'] * 0.3, FY - 4.6 + by
    fig.ell(5, TUNIC, bcx, bcy, 3.8 * p['sx'], 3.2 * p['sy'], bias=0.15)
    fig.cap(5.5, STRAP, bcx - 3.4, bcy + 1.2, bcx + 3.4, bcy + 1.2, 0.6, flat=1)
    # arms
    shy = bcy - 1.8
    for sd, off, z, back, sk in ((1, p['fh'], 12, 0, SKIN2), (-1, p['bh'], 2.5, 1, SKIN)):
        sh = (bcx + sd * 2.2, shy)
        hand = (bcx + sd * 3.6 + off[0], shy + 2.6 + off[1])
        fig.cap(z, TUNIC, sh[0], sh[1], hand[0], hand[1], 0.9, back=back)
        fig.ell(z + 0.2, sk, hand[0], hand[1], 1.3, 1.3, back=back, bias=0.25)
    hx = FX + 0.6 + p['lean']
    hy = FY - 12.6 + by + p['hy']
    head(fig, hx, hy, p)
    return fig


def down(p, i):
    """Flat on its back, eyes shut; hand-drawn."""
    fig = Figure(CW, CH)
    g = FY - 1
    br = 0.4 if i == 1 else 0.0
    # body lying to the right, boots up
    fig.ell(5, TUNIC, FX + 3.6, g - 2.6, 4.0, 2.6 + br, bias=0.15)
    fig.ell(7, BOOT, FX + 8.0, g - 4.6, 1.3, 1.9, bias=0.2)
    fig.ell(2, BOOT, FX + 7.0, g - 3.0, 1.3, 1.8, back=1, bias=0.2)
    fig.ell(12, SKIN, FX + 3.0, g - 5.4, 1.2, 1.2, bias=0.25)
    # head on the left, face turned up
    hx, hy = FX - 3.0, g - 5.0
    fig.ell(8, LEAF, hx, hy, 5.6, 5.0, bias=0.25)
    fig.ell(8.5, SKIN, hx + 1.0, hy - 1.6, 4.2, 3.2, bias=0.35)
    # ears flopped on the floor behind
    ear(fig, 7.0, LEAF, hx - 3.5, hy + 0.5, 195, 4.2, r0=1.6)
    ear(fig, 6.9, LEAF2, hx - 3.0, hy + 2.5, 175, 4.0, r0=1.5)
    fig.cap(9.0, STRAP, hx - 4.0, hy - 3.4, hx + 1.0, hy - 5.2, 0.7, flat=1)
    fig.ell(9.5, LENS, hx - 2.0, hy - 4.8, 1.6, 1.4, bias=0.2)
    fig.cap(9.2, ORANGE, hx + 4.6, hy - 2.6, hx + 5.2, hy + 2.4, 1.2, bias=0.15)
    hxi, hyi = int(round(hx)), int(round(hy))
    for ex in (hxi - 1, hxi + 3):
        fig.px(ex, hyi - 2, C_INK); fig.px(ex + 1, hyi - 2, C_INK)
    fig.px(hxi + 2, hyi + 0, C_MOUTH)
    return settle(fig.render(), CH - 1)


def poses():
    out = {}
    out['idle'] = [
        P(),
        P(by=0, hy=0.5, fh=(0, 0.5), bh=(0, 0.5), wave=0.8, ears=0.05),
        P(by=0.5, hy=0.5, sy=0.95, fh=(0, 1), bh=(0, 1), wave=1.6, ears=0.1),
        P(eyes='blink', wave=2.4, ears=0.05),
    ]
    bob = [0, 0.5, -1, 0, 0.5, -1]
    out['run'] = []
    for i in range(6):
        ph = 2 * math.pi * i / 6
        f = (2.4 * math.cos(ph), -1.6 * max(0.0, -math.sin(ph)))
        b = (2.4 * math.cos(ph + math.pi), -1.6 * max(0.0, math.sin(ph)))
        out['run'].append(P(by=bob[i], lean=0.8, ff=f, bf=b, fh=(-2.0 * math.cos(ph), -0.5), bh=(2.0 * math.cos(ph), -0.5),
                            ears=0.35, tail=185, wave=ph, mouth='smile' if i % 3 else 'o'))
    out['air'] = [
        P(by=-0.5, ff=(1, -1.5), bf=(-0.5, -1), fh=(1, -4), bh=(-1, -4), ears=-0.2, tail=130, mouth='o', eyes='wide'),
        P(by=0, ff=(1.5, -0.5), bf=(-1.5, -1), fh=(2, -2), bh=(-2, -2), ears=0.4, tail=240, mouth='open', eyes='wide', wave=2),
    ]
    out['attack'] = [
        P(by=0.5, lean=-0.2, ff=(1, 0), bf=(-1, 0), fh=(-3, -1), bh=(1, 0), eyes='focus', mouth='grit', ears=0.2, tail=170),
        P(by=0, lean=1.4, ff=(2, 0), bf=(-1.5, 0), fh=(5, -1), bh=(-2, 0), eyes='focus', mouth='open', ears=0.45, tail=195),
        P(by=0, lean=1.2, ff=(2, 0), bf=(-1.5, 0), fh=(4.5, 0), bh=(-1.5, 0), eyes='focus', mouth='open', ears=0.45, tail=200),
        P(by=0, lean=0.4, fh=(2, 0), eyes='open', mouth='smile', ears=0.2, tail=190),
    ]
    out['grab'] = [
        P(by=0.5, lean=1.2, ff=(1.5, 0), fh=(4, 1), bh=(5, 0.5), eyes='wide', mouth='o', ears=0.3),
        P(by=0.5, lean=0.8, fh=(3, -1), bh=(4, -1), eyes='focus', mouth='grit', ears=0.2),
    ]
    out['carry'] = [
        P(fh=(1, -6), bh=(-1, -6), eyes='focus', mouth='grit', ears=0.5),
        P(by=0.5, fh=(1, -5.5), bh=(-1, -5.5), eyes='focus', mouth='open', ears=0.5, wave=1.5),
    ]
    out['carryRun'] = []
    for i in range(6):
        ph = 2 * math.pi * i / 6
        f = (2.0 * math.cos(ph), -1.4 * max(0.0, -math.sin(ph)))
        b = (2.0 * math.cos(ph + math.pi), -1.4 * max(0.0, math.sin(ph)))
        out['carryRun'].append(P(by=bob[i], lean=0.5, ff=f, bf=b, fh=(1, -6 + bob[i]), bh=(-1, -6 + bob[i]),
                                 eyes='focus', mouth='grit', ears=0.5, tail=185, wave=ph))
    out['throw'] = [
        P(lean=-0.2, fh=(-1, -6), bh=(-2, -6), eyes='focus', mouth='grit', ears=0.3, tail=170),
        P(lean=1.2, ff=(1.5, 0), fh=(4, -4), bh=(3, -3), eyes='wide', mouth='open', ears=0.5, tail=200),
        P(lean=1.0, ff=(1.5, 0), fh=(4, 1), bh=(3, 1), eyes='open', mouth='smile', ears=0.4, tail=190),
    ]
    out['hurt'] = [
        P(lean=-0.2, hy=-0.5, ff=(-0.5, 0), bf=(-1.5, -0.5), fh=(-2, -3), bh=(-2, -2), eyes='hurt', mouth='open', ears=0.6, tail=230),
        P(by=0.5, lean=-0.4, bf=(-1.5, 0), fh=(-3, -2), bh=(-2, -1), eyes='hurt', mouth='o', ears=0.7, tail=220),
    ]
    out['down'] = [P(), P()]
    out['held'] = [
        P(by=0, ff=(1.5, -2), bf=(-1.5, -0.5), fh=(2, -4), bh=(-2, -3), eyes='wide', mouth='open', ears=-0.3, tail=110),
        P(by=0, ff=(0.5, -0.5), bf=(-2, -2), fh=(3, -2), bh=(-1, -4), eyes='hurt', mouth='o', ears=-0.1, tail=100, wave=2),
    ]
    # crouched low (the actors lane draws the curtain's front fold over it)
    out['hide'] = [P(by=2.0, sy=0.85, sx=1.1, hy=1.5, fh=(1, -2), bh=(0, -2), eyes='half', mouth='none', ears=0.8, tail=180, look=1)]
    out['talk'] = [
        P(fh=(2, -3), mouth='open'),
        P(fh=(1.5, -1.5), mouth='smile', hy=0.5),
    ]
    out['flap'] = [
        P(by=-0.5, fh=(2, -5), bh=(-2, -5), ears=-0.3, mouth='o', eyes='wide', tail=130),
        P(by=0, fh=(3, 1), bh=(-3, 1), ears=0.3, mouth='grit', eyes='focus', tail=160),
    ]
    return out


POSES = poses()


def frame(state, i):
    p = POSES[state][i]
    if state == 'down':
        return down(p, i)
    return side(p, state).render()
