"""DRAFT: draws the party's stand-in sprite sheets and writes their content files.

    python3 -I tools/art/heroes/make.py

Writes assets/sprites/heroes/{grappler,infiltrator,flyer,hero}.png and
content/sprites/{grappler,infiltrator,flyer,hero}.json, to the contract in
docs/mechanisms/art-pipeline.md ("Characters and things"). Deterministic:
no clock, no randomness; the same bytes every run. Notes: README.md here.

Every hero is a puppet of round parts posed by one shared table of poses
(POSES below), scaled to its body, then dressed in its own silhouette idea:
  grappler    - a broad barrel with huge wrapped fists and a topknot
  infiltrator - a tiny hooded bean with a headband whose two tails stream behind
  flyer       - a round bird-kid whose arms are wings, with a three-feather crest
  hero        - the plain one: big head, a mop of hair, a tunic and a belt
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pix import Figure, INK, hex3, ramp, settle  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))

# ---------------------------------------------------------------- palette
# Only ramps from the master palette (art-pipeline.md); hue-shifted mixes of
# two of its ramps where a shape needs it.
SKIN = ramp('#c88a5a', '#c88a5a', '#f0c090', '#ffe2c0')
SKIN_D = ramp('#94583a', '#c88a5a', '#f0c090', '#ffe2c0')
ORANGE = ramp('#b0481a', '#e8742a', '#ffa048', '#ffd090')
REDOR = ramp('#8a1c3a', '#c8324a', '#e8742a', '#ffa048')
RED = ramp('#8a1c3a', '#c8324a', '#f0596a', '#ff9aa0')
GOLD = ramp('#a8651a', '#e09a1e', '#ffd23f', '#fff1a0')
WOOD = ramp('#5a3420', '#8a5230', '#b97a40', '#e0a860')
HAIR_RED = ramp('#5a3420', '#8a1c3a', '#c8324a', '#f0596a')
GRASS = ramp('#1f7a3d', '#2fa84a', '#5fd35a', '#a8f070')
FOLIAGE = ramp('#1c6b4a', '#2a9a5c', '#58c96a', '#9be37a')
PURPLE = ramp('#4a2a7a', '#7444b8', '#a070e8', '#d0aaff')
SLATE = ramp('#3f3a66', '#5c5690', '#8179b8', '#aaa3d8')
NIGHT = ramp('#221f44', '#343066', '#4c4890', '#7444b8')
SKYB = ramp('#263a8c', '#3c62d0', '#5fb4f0', '#8fd0fa')
WHITE = ramp('#9aa8c0', '#d0dcec', '#ffffff', '#ffffff')
PALE = ramp('#5fb4f0', '#8fd0fa', '#c4e9ff', '#eef9ff')
CREAM = ramp('#f0c090', '#ffe2c0', '#fff1a0', '#ffffff')

C_INK = INK
C_WHITE = hex3('#ffffff')
C_MOUTH = hex3('#8a1c3a')
C_TONGUE = hex3('#f0596a')
C_BLUSH = hex3('#ff98c0')
C_IRIS = hex3('#3c62d0')

# ---------------------------------------------------------------- sheet layout
COLS = 8
# INTENT (the contract's convention): one state per row, 8 columns; the frame
# numbers below are the ones the contract's example uses.
ROWS = [
    ('idle', 4), ('run', 6), ('air', 2), ('attack', 4), ('grab', 2), ('carry', 2), ('carryRun', 6),
    ('throw', 3), ('hurt', 2), ('down', 2), ('held', 2), ('hide', 1), ('talk', 2), ('flap', 2),
]


def frames_json():
    f = {}
    for r, (name, n) in enumerate(ROWS):
        f[name] = [r * COLS + i for i in range(n)]
    air = f.pop('air')
    f['air'] = air
    f['jump'] = [air[0]]
    f['fall'] = [air[1]]
    order = ['idle', 'run', 'air', 'jump', 'fall', 'attack', 'grab', 'carry', 'carryRun', 'throw',
             'hurt', 'down', 'held', 'hide', 'talk', 'flap']
    return {k: f[k] for k in order}


# ---------------------------------------------------------------- poses
# One table for every hero, in "hero pixels" (the plain hero's scale); each
# hero multiplies the offsets by its own k. Keys:
#   by  body drop (+ is down)        hx/hy  head lean (+x forward) / lift
#   sx/sy  body squash               fl/bl  front/back foot offset (dx, dy)
#   fa/ba  front/back hand offset    eyes / mouth  face states
#   tail   streaming direction for trailing things (deg; 180 = straight back)
#   fist   hand size factor          wing   flyer's explicit wing angles

def P(**kw):
    base = dict(by=0, hx=0, hy=0, sx=1.0, sy=1.0, fl=(0, 0), bl=(0, 0), fa=(0, 0), ba=(0, 0),
                eyes='open', mouth='smile', tail=165, wave=0.0, fist=1.0, wing=None, look=0)
    base.update(kw)
    return base


def run_legs(i, S=4.0, L=3.0):
    ph = 2 * math.pi * i / 6
    def leg(ps):
        return (S * math.cos(ps), -L * max(0.0, -math.sin(ps)))
    return leg(ph), leg(ph + math.pi), ph


def poses():
    out = {}
    # idle: breathe (the body sinks a pixel and comes back) and blink once.
    out['idle'] = [
        P(),
        P(by=0, hy=1, fa=(0, 1), ba=(0, 1), sy=0.96, wave=0.6),
        P(by=1, hy=0, fa=(0, 1), ba=(0, 1), sy=0.94, wave=1.2),
        P(by=0, hy=0, eyes='blink', wave=1.8),
    ]
    # run: contact, down, up, contact, down, up; arms swing against the legs.
    out['run'] = []
    bob = [0, 1, -1, 0, 1, -1]
    for i in range(6):
        a, b, ph = run_legs(i)
        out['run'].append(P(by=bob[i], hx=1, fl=a, bl=b, fa=(-3.5 * math.cos(ph), -1 + bob[i] * 0.5),
                            ba=(3.5 * math.cos(ph), -1), tail=185, wave=ph, mouth='open' if i % 3 == 2 else 'smile',
                            sy=1.0 + (0.04 if bob[i] < 0 else -0.04 if bob[i] > 0 else 0)))
    # air: jump (stretch up, legs tucked, arms up) and fall (spread, arms out).
    out['air'] = [
        P(sy=1.08, sx=0.94, by=-1, fl=(1.5, -2.5), bl=(-1, -1.5), fa=(2, -7), ba=(-1, -7), mouth='o', tail=115, wave=0.5),
        P(sy=0.96, sx=1.05, fl=(2.5, -0.5), bl=(-2.5, -1.5), fa=(4, -5), ba=(-4, -5), eyes='wide', mouth='o', tail=240, wave=2.0),
    ]
    # attack: wind-up, strike, follow-through, recover.
    out['attack'] = [
        P(by=1, hx=-1, fl=(2, 0), bl=(-2, 0), fa=(-5, -2), ba=(3, -1), eyes='focus', mouth='grit', tail=150, sx=1.04, sy=0.96),
        P(by=0, hx=2, fl=(4, 0), bl=(-3, 0), fa=(10, -3), ba=(-4, 0), eyes='focus', mouth='yell', fist=1.25, tail=190, sx=0.98, sy=1.03),
        P(by=0, hx=2, fl=(4, 0), bl=(-3, -0.5), fa=(9, -1), ba=(-3, 1), eyes='focus', mouth='yell', fist=1.15, tail=200),
        P(by=0, hx=1, fl=(2, 0), bl=(-2, 0), fa=(4, 0), ba=(-1, 0), eyes='open', mouth='smile', tail=175),
    ]
    # grab: lunge and reach low with both hands, then clamp and lift.
    out['grab'] = [
        P(by=1, hx=2, fl=(3, 0), bl=(-2, 0), fa=(7, 2), ba=(6, 1), eyes='wide', mouth='o', tail=185, sx=1.03, sy=0.96),
        P(by=1, hx=1, fl=(2, 0), bl=(-2, 0), fa=(5, -3), ba=(4, -3), eyes='focus', mouth='grit', tail=175),
    ]
    # carry: both arms up over the head holding the load; a strained bob.
    lift = (5, -13)
    out['carry'] = [
        P(fa=lift, ba=(lift[0] - 7, lift[1]), eyes='focus', mouth='grin', fl=(1, 0), bl=(-1, 0)),
        P(by=1, sy=0.95, fa=(lift[0], lift[1] + 1), ba=(lift[0] - 7, lift[1] + 1), eyes='focus', mouth='grit', fl=(1.5, 0), bl=(-1.5, 0), wave=1.5),
    ]
    out['carryRun'] = []
    for i in range(6):
        a, b, ph = run_legs(i)
        out['carryRun'].append(P(by=bob[i], hx=1, fl=a, bl=b, fa=(lift[0], lift[1] + bob[i]), ba=(lift[0] - 7, lift[1] + bob[i]),
                                 eyes='focus', mouth='grin', tail=185, wave=ph))
    # throw: heave back over the head, release forward and up, follow through.
    out['throw'] = [
        P(by=0, hx=-2, fl=(2, 0), bl=(-3, 0), fa=(-3, -13), ba=(-6, -12), eyes='focus', mouth='grit', sy=1.04, tail=150),
        P(by=0, hx=2, fl=(4, 0), bl=(-3, -1), fa=(8, -9), ba=(6, -8), eyes='wide', mouth='yell', tail=195),
        P(by=1, hx=2, fl=(4, 0), bl=(-3, 0), fa=(8, 1), ba=(6, 2), eyes='open', mouth='grin', sx=1.03, sy=0.96, tail=185),
    ]
    # hurt: recoil back, arms flung, eyes squeezed.
    out['hurt'] = [
        P(by=0, hx=-2, hy=-1, fl=(-1, 0), bl=(-3, -1), fa=(-3, -7), ba=(-5, -5), eyes='hurt', mouth='open', tail=230, sx=0.96, sy=1.04),
        P(by=1, hx=-3, fl=(0, 0), bl=(-3, 0), fa=(-5, -4), ba=(-6, -2), eyes='hurt', mouth='open', tail=215, sx=1.04, sy=0.96),
    ]
    # down: lying flat on its back, eyes shut (the second frame breathes).
    out['down'] = [
        P(eyes='shut', mouth='o', fa=(1, 0), ba=(-1, 0), fl=(1, 0), bl=(-1, 0)),
        P(eyes='shut', mouth='o', fa=(1, -1), ba=(-1, 0), fl=(1, -1), bl=(-1, 0), sy=1.02),
    ]
    # held: lifted, flailing.
    out['held'] = [
        P(fa=(3, -8), ba=(-3, -4), fl=(2, -2), bl=(-2, 0), eyes='hurt', mouth='open', tail=110, wave=0),
        P(fa=(4, -4), ba=(-2, -8), fl=(1, 0), bl=(-2, -2), eyes='wide', mouth='o', tail=100, wave=2),
    ]
    # hide: crouched small, hands up by the face, peeking.
    out['hide'] = [P(by=3, sy=0.86, sx=1.08, hy=1, fl=(2, 0), bl=(-2, 0), fa=(2, -5), ba=(1, -5), eyes='half', mouth='none', tail=170, look=1)]
    # talk: a gesture and an open mouth.
    out['talk'] = [
        P(fa=(3, -4), mouth='open'),
        P(fa=(2, -2), mouth='smile'),
    ]
    # flap: arms beat (the flyer's are wings).
    out['flap'] = [
        P(by=-1, fa=(4, -9), ba=(-3, -9), fl=(1, -1), bl=(-1, -2), mouth='o', tail=120, wing=('up',)),
        P(by=0, fa=(5, 3), ba=(-4, 3), fl=(1, 0), bl=(-1, -1), eyes='focus', mouth='grit', tail=150, wing=('down',)),
    ]
    return out


POSES = poses()


# ---------------------------------------------------------------- faces

def eye(fig, x, y, mode, h=4, side=1):
    """One eye, its top-left pixel at (x, y): 2 wide, h tall."""
    x, y = int(round(x)), int(round(y))
    if mode in ('open', 'wide', 'focus'):
        top = y + (1 if mode == 'focus' else 0)
        for yy in range(top, y + h):
            fig.px(x, yy, C_INK)
            fig.px(x + 1, yy, C_INK)
        fig.px(x, top, C_WHITE)
        if mode == 'wide':
            fig.px(x + 1, top, C_WHITE)
        if h >= 4:
            fig.px(x + 1, y + h - 1, C_IRIS)
        if mode == 'focus':
            # a brow pressing down toward the nose
            fig.px(x, top - 1, C_INK) if side < 0 else fig.px(x + 1, top - 1, C_INK)
    elif mode == 'blink':
        fig.px(x, y + h - 2, C_INK)
        fig.px(x + 1, y + h - 2, C_INK)
    elif mode == 'half':
        for yy in range(y + h - 2, y + h):
            fig.px(x, yy, C_INK)
            fig.px(x + 1, yy, C_INK)
        fig.px(x, y + h - 2, C_WHITE)
    elif mode == 'shut':
        fig.px(x, y + h - 2, C_INK)
        fig.px(x + 1, y + h - 2, C_INK)
    elif mode == 'hurt':
        # > <
        m = y + h // 2
        if side > 0:
            fig.px(x, m - 1, C_INK); fig.px(x + 1, m, C_INK); fig.px(x, m + 1, C_INK)
        else:
            fig.px(x + 1, m - 1, C_INK); fig.px(x, m, C_INK); fig.px(x + 1, m + 1, C_INK)


def mouth(fig, x, y, mode, wide=2):
    x, y = int(round(x)), int(round(y))
    if mode == 'smile':
        fig.px(x, y, C_INK)
        if wide >= 2:
            fig.px(x + 1, y, C_INK)
    elif mode == 'grin':
        for i in range(wide + 1):
            fig.px(x + i, y, C_INK)
        fig.px(x, y - 1, C_INK) if wide >= 2 else None
    elif mode == 'open':
        fig.px(x, y, C_MOUTH); fig.px(x + 1, y, C_MOUTH)
        fig.px(x, y + 1, C_TONGUE); fig.px(x + 1, y + 1, C_MOUTH)
    elif mode == 'o':
        fig.px(x, y, C_MOUTH); fig.px(x, y + 1, C_MOUTH)
    elif mode == 'yell':
        for i in range(wide + 1):
            fig.px(x + i, y, C_MOUTH)
            fig.px(x + i, y + 1, C_TONGUE if i == 1 else C_MOUTH)
    elif mode == 'grit':
        for i in range(wide + 1):
            fig.px(x + i, y, C_WHITE)
        fig.px(x + wide // 2, y, C_INK)


# ---------------------------------------------------------------- the biped

class Spec:
    """One hero's body plan, in cell pixels. fx: feet centre x; fy: the ground row (the outline sits on it)."""

    def __init__(self, **kw):
        self.__dict__.update(kw)


def lerp(a, b, t):
    return a + (b - a) * t


def build(S, p, state):
    fig = Figure(S.cw, S.ch)
    k = S.k
    fx, fy = S.fx, S.fy
    by = p['by'] * max(1, round(k))
    if k < 0.75:
        by = p['by'] if abs(p['by']) <= 1 else math.copysign(2, p['by'])
    hx = p['hx'] * k
    sx, sy = p['sx'], p['sy']

    # body
    bot = fy - S.body_bot + by
    brx, bry = S.body_rx * sx, S.body_ry * sy
    bcy = bot - bry
    bcx = fx + hx * 0.35
    top_shift = (S.body_ry - bry) * 2  # how far the shoulders dropped
    # head
    hcx = fx + hx + S.head_dx
    hcy = fy - S.head_up + by + top_shift + p['hy'] * (1 if k >= 0.75 else 0.5) * -1 + (p['hy'] if p['hy'] > 0 else 0) * 0
    hcy = fy - S.head_up + by + top_shift - (p['hy'] if p['hy'] < 0 else 0) * k + (p['hy'] if p['hy'] > 0 else 0)
    shy = fy - S.sh_up + by + top_shift

    info = dict(hcx=hcx, hcy=hcy, bcx=bcx, bcy=bcy, bot=bot)

    # legs and feet
    for side, off, z, back in ((1, p['fl'], 7, 0), (-1, p['bl'], 2, 1)):
        hip = (fx + side * S.hip_x + hx * 0.2, fy - S.hip_up + by)
        foot = (fx + side * S.foot_x + off[0] * k, fy - S.foot_ry + off[1] * k)
        if S.leg_r > 0:
            fig.cap(z, S.leg_ramp, hip[0], hip[1], foot[0], foot[1] - 0.5, S.leg_r, back=back)
        fig.ell(z, S.foot_ramp, foot[0] + S.foot_fwd, foot[1], S.foot_rx, S.foot_ry, back=back)

    # body and its dressing
    fig.ell(4, S.body_ramp, bcx, bcy, brx, bry)
    S.dress_body(fig, S, p, info)

    # head and its dressing
    # INTENT-ish: the face side is lifted a little so eyes read against it
    fig.ell(8, S.head_ramp, hcx, hcy, S.head_rx, S.head_ry, bias=0.3)
    S.dress_head(fig, S, p, info, state)

    # arms
    S.arms(fig, S, p, info, shy)
    return fig, info


def plain_arms(fig, S, p, info, shy):
    k = S.k
    for side, off, z, back in ((1, p['fa'], 12, 0), (-1, p['ba'], 1, 1)):
        sh = (info['bcx'] + side * S.sh_x, shy)
        rest = (info['bcx'] + side * S.hand_x, shy + S.hand_down)
        hand = (rest[0] + off[0] * k, rest[1] + off[1] * k)
        fig.cap(z, S.arm_ramp, sh[0], sh[1], hand[0], hand[1], S.arm_r, back=back)
        r = S.hand_r * (p['fist'] if side > 0 else 1.0)
        fig.ell(z + 0.5, S.hand_ramp, hand[0], hand[1], r, r, back=back)
        if getattr(S, 'wrap', None) is not None:
            # a wrist wrap between arm and fist
            t = 0.72
            wx, wy = lerp(sh[0], hand[0], t), lerp(sh[1], hand[1], t)
            fig.cap(z + 0.25, S.wrap, wx, wy, lerp(sh[0], hand[0], 0.8), lerp(sh[1], hand[1], 0.8), S.arm_r + 0.3, back=back)


def standard_face(fig, S, p, info, state, eh=4, ex=(0.6, 4.2), ey=-1.2, my=3.2, mx=2.4, blush=True):
    hcx, hcy = info['hcx'], info['hcy']
    e = p['eyes']
    look = p.get('look', 0)
    eye(fig, hcx + ex[0] + look, hcy + ey, e, h=eh, side=1)
    eye(fig, hcx + ex[1] + look, hcy + ey, e, h=eh, side=-1)
    if blush and e not in ('hurt',):
        fig.px(hcx + ex[1] + 2 + look, hcy + ey + eh, C_BLUSH)
        fig.px(hcx + ex[0] - 2 + look, hcy + ey + eh, C_BLUSH)
    if p['mouth'] != 'none':
        mouth(fig, hcx + mx + look, hcy + my, p['mouth'])


# ---------------------------------------------------------------- the four heroes

def hero_spec():
    def dress_body(fig, S, p, info):
        # belt and buckle
        y = info['bot'] - 3.2
        fig.cap(5, GOLD, info['bcx'] - S.body_rx * p['sx'] + 0.8, y, info['bcx'] + S.body_rx * p['sx'] - 0.8, y, 0.8, flat=1)
        fig.px(info['bcx'] + 2, y, hex3('#fff1a0'))
        # a cream collar
        fig.ell(5, CREAM, info['bcx'] + 0.5, info['bcy'] - S.body_ry * p['sy'] + 1.2, 3.0, 1.2, flat=1)

    def dress_head(fig, S, p, info, state):
        hcx, hcy = info['hcx'], info['hcy']
        # a mop of hair: crown, a fringe swept forward, a cowlick
        fig.ell(9, WOOD, hcx - 1.6, hcy - 3.4, S.head_rx + 0.2, 3.8)
        fig.ell(9, WOOD, hcx - 4.6, hcy + 0.2, 2.4, 3.6)
        fig.ell(9, WOOD, hcx + 2.6, hcy - 4.4, 3.0, 1.6)
        fig.cap(9.5, WOOD, hcx - 2.4, hcy - 6.4, hcx - 4.6, hcy - 9.0 + (p['wave'] > 1.0), 0.9)
        if state != 'down':
            standard_face(fig, S, p, info, state, eh=4, ex=(0.3, 3.9), ey=-1.0, my=3.4, mx=2.2)

    return Spec(
        id='hero', cw=32, ch=32, fx=16, fy=31, k=1.0, box=(12, 26),
        body_bot=4.0, body_rx=4.6, body_ry=5.0, body_ramp=RED,
        head_up=19.6, head_rx=6.8, head_ry=6.2, head_dx=0.4, head_ramp=SKIN,
        hip_x=2.0, hip_up=5.0, leg_r=1.5, leg_ramp=WOOD,
        foot_x=2.4, foot_rx=2.4, foot_ry=1.6, foot_fwd=0.8, foot_ramp=WOOD,
        sh_x=3.4, sh_up=13.0, hand_x=5.6, hand_down=5.0, arm_r=1.3, arm_ramp=RED, hand_r=1.6, hand_ramp=SKIN,
        dress_body=dress_body, dress_head=dress_head, arms=plain_arms,
    )


def grappler_spec():
    def dress_body(fig, S, p, info):
        # a barrel chest over the belly: the broad silhouette
        bcx = info['bcx']
        chest_cy = info['bcy'] - S.body_ry * p['sy'] * 0.75
        fig.ell(4.5, SLATE, bcx + 0.4, chest_cy, S.chest_rx * p['sx'], S.chest_ry * p['sy'])
        # a pale chest patch on the lit front
        fig.ell(5, SKIN, bcx + 3.0, chest_cy + 1.0, 3.2, 3.0, bias=0.2)
        # a belt over green trousers, a tan buckle
        y = info['bot'] - 5.4
        fig.cap(6, WOOD, bcx - S.body_rx * p['sx'] + 0.6, y, bcx + S.body_rx * p['sx'] - 0.6, y, 1.0, flat=1)
        fig.ell(6.5, GOLD, bcx + 2.2, y, 1.6, 1.4, bias=0.3)

    def dress_head(fig, S, p, info, state):
        hcx, hcy = info['hcx'], info['hcy']
        # a cream muzzle on the face side
        fig.ell(8.5, SKIN, hcx + 2.4, hcy + 1.4, 3.8, 3.2, bias=0.2)
        # an orange crest of spikes swept back
        w = 0.7 if p['wave'] > 1.0 else 0.0
        for i, (dx, ang, ln) in enumerate(((1.6, 280, 4.2), (-0.8, 250, 5.6), (-3.4, 222, 5.0), (-5.0, 196, 3.6))):
            a = math.radians(ang + (p['tail'] - 165) * 0.2)
            x0, y0 = hcx + dx, hcy - S.head_ry + 1.6
            fig.cap(9.5, ORANGE if i % 2 == 0 else GOLD, x0, y0, x0 + ln * math.cos(a) - w, y0 + ln * math.sin(a), 1.4 - 0.15 * i, noline=True, bias=0.2)
        # an orange scarf round the neck, its end trailing back
        fig.cap(7.6, ORANGE, hcx - 4.5, hcy + S.head_ry - 0.6, hcx + 4.5, hcy + S.head_ry - 0.2, 1.6, bias=0.1)
        tails(fig, S, p, hcx - 5.0, hcy + S.head_ry - 0.4, n=1, seg=2.0, segs=3, r=1.3, rmp=ORANGE, z=3.5, droop=1)
        if state != 'down':
            hc = info['hcx']
            e = p['eyes']
            # eyes under a heavy brow that only shows when it means it
            eye(fig, hc + 0.4, hcy - 1.6, e, h=4, side=1)
            eye(fig, hc + 3.8, hcy - 1.6, e, h=4, side=-1)
            if e in ('open', 'focus', 'wide'):
                lift = 1 if e == 'wide' else 0
                fig.px(hc - 0.4, hcy - 2.6 - lift, C_INK); fig.px(hc + 0.6, hcy - 2.6 - lift, C_INK)
                fig.px(hc + 4.0, hcy - 2.6 - lift, C_INK); fig.px(hc + 5.0, hcy - 2.6 - lift, C_INK)
            fig.px(hc + 6.6, hcy + 2.0, C_BLUSH)
            fig.px(hc - 1.4, hcy + 2.0, C_BLUSH)
            if p['mouth'] != 'none':
                mouth(fig, hc + 1.6, hcy + 2.8, p['mouth'], wide=3 if p['mouth'] in ('grin', 'grit', 'yell') else 2)

    return Spec(
        id='grappler', cw=56, ch=44, fx=28, fy=43, k=1.3, box=(18, 30),
        body_bot=5.0, body_rx=8.0, body_ry=6.4, body_ramp=FOLIAGE, chest_rx=10.4, chest_ry=6.6,
        head_up=26.4, head_rx=6.6, head_ry=5.6, head_dx=0.8, head_ramp=SLATE,
        hip_x=3.6, hip_up=6.0, leg_r=2.6, leg_ramp=SLATE,
        foot_x=4.6, foot_rx=3.5, foot_ry=2.2, foot_fwd=1.0, foot_ramp=SKIN,
        sh_x=8.4, sh_up=21.0, hand_x=11.2, hand_down=9.0, arm_r=2.6, arm_ramp=SLATE, hand_r=3.6, hand_ramp=SKIN,
        wrap=SKIN_D,
        dress_body=dress_body, dress_head=dress_head, arms=plain_arms,
    )


def tails(fig, S, p, x0, y0, n=2, seg=1.7, segs=5, r=0.75, rmp=NIGHT, z=3, droop=0):
    """Two ribbon tails from a knot at (x0, y0), streaming toward p['tail'] degrees with a wave."""
    for t in range(n):
        a = math.radians(p['tail'] + (t * 26 - 13))
        x, y = x0, y0 + t * 0.8
        for s in range(segs):
            wv = 0.6 * math.sin(p['wave'] + s * 1.3 + t * 1.4) - droop * 0.12 * s * (1 if 150 < p['tail'] < 210 else 0)
            nxp = x + seg * math.cos(a + wv)
            nyp = y + seg * math.sin(a + wv)
            fig.cap(z, rmp, x, y, nxp, nyp, r * (1.0 if s < segs - 1 else 0.85), noline=True, bias=0.25)
            x, y = nxp, nyp


def infiltrator_spec():
    def dress_body(fig, S, p, info):
        # a cream tummy
        fig.ell(5, SKIN, info['bcx'] + 1.0, info['bcy'] + 0.6, 1.8, 1.6, bias=0.2)

    def dress_head(fig, S, p, info, state):
        hcx, hcy = info['hcx'], info['hcy']
        # the face, turned toward where it looks
        fig.ell(9, SKIN, hcx + 1.6, hcy + 1.0, 4.0, 3.1)
        # two long leaf ears swept back: the silhouette idea
        flop = 0.8 if p['wave'] > 1.0 else 0.0
        lean = (p['tail'] - 165) * 0.05
        fig.cap(3.6, FOLIAGE, hcx - 2.0, hcy - 2.6, hcx - 8.0 - lean, hcy - 6.8 + flop + lean * 0.5, 1.5, bias=0.2)
        fig.cap(3.5, GRASS, hcx - 3.4, hcy - 1.0, hcx - 9.0 - lean, hcy - 2.6 + flop + lean, 1.3, bias=0.2)
        # goggles pushed up on the brow
        fig.cap(10, WOOD, hcx - 4.6, hcy - 2.4, hcx + 4.8, hcy - 2.6, 0.7, flat=1)
        fig.ell(10.5, GOLD, hcx + 1.0, hcy - 3.0, 1.5, 1.4, flat=2)
        fig.ell(10.5, GOLD, hcx + 4.0, hcy - 3.0, 1.5, 1.4, flat=2)
        fig.px(hcx + 1.0, hcy - 3.4, hex3('#a0f0e0'))
        fig.px(hcx + 4.0, hcy - 3.4, hex3('#a0f0e0'))
        # a long orange scarf whose two ends stream behind
        fig.cap(7.6, ORANGE, hcx - 3.6, hcy + 3.8, hcx + 3.2, hcy + 4.2, 1.1, bias=0.1)
        tails(fig, S, p, hcx - 3.8, hcy + 3.8, seg=1.8, segs=6, z=3, rmp=ORANGE, droop=-1)
        if state != 'down':
            e = p['eyes']
            look = p.get('look', 0)
            eye(fig, hcx + 0.6 + look, hcy - 1.0, e, h=4, side=1)
            eye(fig, hcx + 3.6 + look, hcy - 1.0, e, h=4, side=-1)
            if p['mouth'] in ('open', 'yell', 'o'):
                fig.px(hcx + 2.4 + look, hcy + 2.6, C_MOUTH)

    def arms(fig, S, p, info, shy):
        k = S.k
        for side, off, z, back in ((1, p['fa'], 12, 0), (-1, p['ba'], 1, 1)):
            rest = (info['bcx'] + side * S.hand_x, shy + S.hand_down)
            hand = (rest[0] + off[0] * k, rest[1] + off[1] * k)
            sh = (info['bcx'] + side * S.sh_x, shy)
            fig.cap(z, GRASS, sh[0], sh[1], hand[0], hand[1], 0.8, back=back)
            fig.ell(z + 0.5, SKIN, hand[0], hand[1], 1.1 * (p['fist'] if side > 0 else 1), 1.1 * (p['fist'] if side > 0 else 1), back=back)

    return Spec(
        id='infiltrator', cw=32, ch=32, fx=16, fy=31, k=0.55, box=(10, 12),
        body_bot=1.6, body_rx=3.8, body_ry=3.0, body_ramp=FOLIAGE,
        head_up=9.6, head_rx=5.4, head_ry=4.6, head_dx=0.4, head_ramp=GRASS,
        hip_x=1.4, hip_up=2.4, leg_r=0, leg_ramp=NIGHT,
        foot_x=1.8, foot_rx=1.8, foot_ry=1.2, foot_fwd=0.6, foot_ramp=NIGHT,
        sh_x=2.6, sh_up=5.6, hand_x=4.0, hand_down=2.0, arm_r=0.8, hand_r=1.1,
        dress_body=dress_body, dress_head=dress_head, arms=arms,
    )


def wing(fig, root, ang, length, z, back, scale=1.0):
    """A fan of three feathers from root, the first along ang (degrees), fanning backward."""
    a0 = ang % 360
    d = 24 if math.sin(math.radians(a0)) >= -0.2 else -24
    if 60 < a0 < 120:
        d = 24
    for i, (ln, r) in enumerate(((1.0, 1.7), (0.86, 1.6), (0.68, 1.45))):
        a = math.radians(a0 + d * i)
        L = length * ln * scale
        x1, y1 = root[0] + L * math.cos(a), root[1] + L * math.sin(a)
        fig.cap(z - i * 0.01, WHITE if i % 2 == 0 else PALE, root[0], root[1], x1, y1, r * scale, back=back)


def flyer_spec():
    def dress_body(fig, S, p, info):
        # a cream belly
        fig.ell(5, CREAM, info['bcx'] + 1.2, info['bcy'] + 0.8, 2.6 * p['sx'], 2.8 * p['sy'], bias=0.2)

    def dress_head(fig, S, p, info, state):
        hcx, hcy = info['hcx'], info['hcy']
        # a three-feather crest sweeping back
        sway = 0.5 * math.sin(p['wave'])
        for i, (dx, ang, ln) in enumerate(((0.8, 250, 4.6), (-0.8, 225, 5.2), (-2.4, 200, 4.4))):
            a = math.radians(ang + sway * 12 + (p['tail'] - 165) * 0.15)
            x0, y0 = hcx + dx, hcy - S.head_ry + 1.4
            fig.cap(7, GOLD if i == 1 else ORANGE, x0, y0, x0 + ln * math.cos(a), y0 + ln * math.sin(a), 0.85, noline=True, bias=0.2)
        # a small beak
        fig.ell(10, GOLD, hcx + S.head_rx - 0.2, hcy + 1.4, 1.9, 1.1, bias=0.2)
        if state != 'down':
            standard_face(fig, S, p, info, state, eh=4, ex=(-1.4, 2.0), ey=-1.6, my=3.4, mx=4.4, blush=True)  # round 2: both eyes clear of the outline

    def arms(fig, S, p, info, shy):
        k = S.k
        L = 8.2
        for side, off, z, back in ((1, p['fa'], 11, 0), (-1, p['ba'], 0.5, 0)):
            root = (info['bcx'] + side * S.sh_x - 0.5, shy + 0.5)
            if p['wing']:
                which = p['wing'][0]
                ang = {'up': 255, 'down': 150, 'mid': 205}[which] + (8 if side > 0 else 0)
                if side > 0:
                    ang = {'up': 280, 'down': 120, 'mid': 200}[which]
            else:
                rest = (info['bcx'] + side * S.hand_x, shy + S.hand_down)
                tx, ty = rest[0] + off[0] * k, rest[1] + off[1] * k
                ang = math.degrees(math.atan2(ty - root[1], tx - root[0]))
                if side < 0:
                    # the back wing rests folded behind and opens with the pose
                    ang = ang if abs(off[0]) + abs(off[1]) > 2 else 215 + 10 * math.sin(p['wave'])
                else:
                    ang = ang if abs(off[0]) + abs(off[1]) > 2 else 200 + 10 * math.sin(p['wave'])
            spread = p['wing'] or abs(off[0]) + abs(off[1]) > 2
            fig_scale = 1.1 if side < 0 else (0.72 if spread else 0.45)
            wing(fig, root, ang, L, z, back, scale=fig_scale)

    return Spec(
        id='flyer', cw=32, ch=32, fx=16, fy=31, k=0.8, box=(14, 20),
        body_bot=2.6, body_rx=4.4, body_ry=4.0, body_ramp=SKYB,
        head_up=14.6, head_rx=6.0, head_ry=5.4, head_dx=0.2, head_ramp=SKYB,
        hip_x=1.6, hip_up=3.4, leg_r=0.8, leg_ramp=GOLD,
        foot_x=2.2, foot_rx=2.0, foot_ry=1.2, foot_fwd=0.8, foot_ramp=GOLD,
        sh_x=2.4, sh_up=8.6, hand_x=4.6, hand_down=4.0, arm_r=0.9, hand_r=1.0,
        dress_body=dress_body, dress_head=dress_head, arms=arms,
    )


SPECS = [grappler_spec(), infiltrator_spec(), flyer_spec(), hero_spec()]


# ---------------------------------------------------------------- frames

# Round 2: the grappler and the infiltrator have their own puppets
# (grappler.py, infiltrator.py); their specs above still give the cell, the
# feet and the box.
import grappler as _grappler  # noqa: E402
import infiltrator as _infiltrator  # noqa: E402
MODS = {'grappler': _grappler, 'infiltrator': _infiltrator}


def draw_frame(S, state, i):
    if S.id in MODS:
        return MODS[S.id].frame(state, i)
    p = POSES[state][i]
    if state == 'down':
        return draw_down(S, p, i)
    fig, info = build(S, p, state)
    return fig.render()


def draw_down(S, p, i):
    """Lying flat on its back, head toward its back, face up, eyes shut."""
    fig, info = build(S, p, 'down')
    pivot_x = S.fx
    pivot_y = S.fy - S.box[1] / 2
    def f(x, y):
        dx, dy = x - pivot_x, y - pivot_y
        return pivot_x + dy, pivot_y - dx
    fig.transform(f, swap=True)
    hx, hy = f(info['hcx'], info['hcy'])
    # the face looks up: eyes shut (two short lines), a little "o" of a mouth
    e = 2 if S.k >= 0.75 else 1
    if S.id == 'grappler':
        e = 2
    ex = int(round(hx - 1 - S.k))
    eyy = int(round(hy - S.head_rx * 0.55))
    for xx in (ex, ex + 3 + (1 if S.k > 1 else 0)):
        for j in range(e):
            fig.px(xx + j, eyy, C_INK)
    # the mouth on the side of the head that now faces up and forward
    if S.k >= 0.75:
        fig.px(int(round(hx + S.head_ry * 0.55)), eyy, C_MOUTH)
    img = fig.render()
    img = settle(img, S.ch - 1)
    if i == 1:
        # a dizzy pixel blinks over the body on the second frame
        pass
    return img


def sheet(S):
    rows = len(ROWS)
    out = np.zeros((rows * S.ch, COLS * S.cw, 4), dtype=np.uint8)
    for r, (state, n) in enumerate(ROWS):
        for i in range(n):
            img = draw_frame(S, state, i)
            out[r * S.ch:(r + 1) * S.ch, i * S.cw:(i + 1) * S.cw] = img
    return out


def content_json(S):
    anchor = {'x': S.fx - S.box[0] // 2, 'y': S.ch - S.box[1]}
    out = {
        '//': f'DRAFT: stand-in drawn by tools/art/heroes/make.py (a program, 2026-11-23); a delivered sheet replaces it by editing this file. Notes: tools/art/heroes/README.md.',
        'id': S.id,
        'image': f'sprites/heroes/{S.id}.png',
        'cell': {'w': S.cw, 'h': S.ch},
        'anchor': anchor,
        'fps': 8,
        'frames': frames_json(),
        'fpsBy': {'run': 12, 'carryRun': 12, 'attack': 16, 'throw': 12, 'grab': 12, 'flap': 10, 'hurt': 8},
    }
    if S.id == 'grappler' and carry_at_known():
        out['carryAt'] = {'x': _grappler.CARRY_AT[0], 'y': _grappler.CARRY_AT[1]}
    return out


def carry_at_known():
    """DRAFT: carryAt is written only once the actors lane's validator knows it
    (handoff-prompts/look2-heroes.md, section 4); until then npm run check rejects it."""
    p = os.path.join(ROOT, 'src', 'content', 'kinds', 'sprites.ts')
    return os.path.exists(p) and 'carryAt' in open(p).read()


def main():
    img_dir = os.path.join(ROOT, 'assets', 'sprites', 'heroes')
    json_dir = os.path.join(ROOT, 'content', 'sprites')
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)
    for S in SPECS:
        arr = sheet(S)
        Image.fromarray(arr, 'RGBA').save(os.path.join(img_dir, f'{S.id}.png'), optimize=True)
        with open(os.path.join(json_dir, f'{S.id}.json'), 'w') as fh:
            fh.write(json.dumps(content_json(S), indent=2) + '\n')
        print(f'wrote assets/sprites/heroes/{S.id}.png and content/sprites/{S.id}.json')


if __name__ == '__main__':
    main()
