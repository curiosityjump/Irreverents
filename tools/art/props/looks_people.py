"""Groups "people" (marks over heads, speech, shadows, the alert display), "fx" and "ui"."""
from px import *

WHITE = (255, 255, 255, 255)
GD = [col('gold', i) for i in range(4)]
RD = [col('red', i) for i in range(4)]


def strip(frames):
    w, h = frames[0].size
    out = new(w * len(frames), h)
    for i, f in enumerate(frames):
        paste(out, f, i * w, 0)
    return out


# ---------------------------------------------------------------- moods
def mood2():
    """Unsettled: a question mark in a soft yellow bubble. Two frames: it bobs."""
    L = leg(abcd='gold', y=col('gold', 3), Y=mix('gold', '#ffffff', 0.0) if False else col('gold', 2))
    rows = [
        '...kkkkkk...',
        '..kyyyyyyk..',
        '.kyykkkyyYk.',
        '.kykyyykyYk.',
        '.kyyyykyyYk.',
        '.kyyykyyyYk.',
        '.kyyykyyYYk.',
        '.kyyyyyyYYk.',
        '.kyYykyYYYk.',
        '..kYYYYYYk..',
        '...kkkYkk...',
        '......kk....',
    ]
    a = from_art(rows, L)
    b = new(12, 12)
    paste(b, a.crop((0, 1, 12, 12)), 0, 0)  # one pixel up, tail shortened
    return strip([a, b])


def mood3():
    """Enraged: a red burst with a white bang in it. Two frames: it throbs."""
    L = leg(abcd='red', r=col('red', 1), R=col('red', 2), o=col('red', 3))
    big = [
        '.k...kk...k.',
        'kRk.kRRk.kRk',
        'kRRkRRRRkRRk',
        '.kRRRWWRRRk.',
        '.kRRRWWRRrk.',
        'kRRRRWWRRrrk',
        'kRRRRWWRrrrk',
        '.kRRRRRrrrk.',
        '.kRRRWWrrrk.',
        'kRRkRrrrkrrk',
        'krk.krrk.krk',
        '.k...kk...k.',
    ]
    small = [
        '............',
        '..k..kk..k..',
        '.kRkkRRkkRk.',
        '.kRRRWWRRRk.',
        '..kRRWWRrk..',
        '.kRRRWWRrrk.',
        '.kRRRWWrrrk.',
        '..kRRRrrrk..',
        '.kRRRWWrrrk.',
        '.kRkkrrkkrk.',
        '..k..kk..k..',
        '............',
    ]
    return strip([from_art(big, L), from_art(small, L)])


# ---------------------------------------------------------------- speech
def bark():
    """Nine-slice paper bubble: 3 x 3 cells of 4 x 4."""
    L = leg(p=col('#ffffff'), s=col('cloud', 0))
    return from_art([
        '.kkkkkkkkkk.',
        'kppppppppppk',
        'kppppppppppk',
        'kppppppppppk',
        'kppppppppppk',
        'kppppppppppk',
        'kppppppppppk',
        'kppppppppppk',
        'kpppppppppsk',
        'kppppppppssk',
        'kssssssssssk',
        '.kkkkkkkkkk.',
    ], L)


def bark_tail():
    L = leg(p=col('#ffffff'), s=col('cloud', 0))
    return from_art([
        'pppps.',
        'kppsk.',
        '.kpk..',
        '..k...',
    ], L)


def ribbon():
    """Nine-slice for the king's speech: deep purple with a gold edge."""
    L = leg(g=col('gold', 2), G=col('gold', 3), d=col('gold', 1), u=col('purple', 0), v=mix('purple', 'ink', 0.5) if False else col('ink', 0))
    L['u'] = mix(col('purple', 0), col('ink', 0), 0.45)
    L['v'] = mix(col('purple', 0), col('ink', 0), 0.75)
    return from_art([
        '.kkkkkkkkkk.',
        'kGGgggggggdk',
        'kGuuuuuuuudk',
        'kguuuuuuuudk',
        'kguuuuuuuudk',
        'kguuuuuuuudk',
        'kguuuuuuuudk',
        'kguuuuuuuudk',
        'kguuuuuuuvdk',
        'kguuuuuuvvdk',
        'kddddddddddk',
        '.kkkkkkkkkk.',
    ], L)


def away_dots():
    """Three dots over an absent friend's head; each rises in turn (4 frames, the last at rest)."""
    frames = []
    for f in range(4):
        im = new(12, 6)
        for i in range(3):
            x = 1 + i * 4
            y = 2 - (1 if f == i else 0)
            art(im, x - 1, y, ['.kk.', 'kWWk', 'kWsk', '.kk.'], leg(s=col('cloud', 0)))
        frames.append(im)
    return strip(frames)


def player_mark():
    """White (the renderer tints it per player), a small marker pointing down at its owner."""
    return from_art([
        'kkkkkkkk',
        'kWWWWWWk',
        'kWWWWWWk',
        '.kWWWWk.',
        '.kWWWWk.',
        '..kWWk..',
        '..kWWk..',
        '...kk...',
    ], leg())


def shadow(w, h):
    """The one soft thing allowed: a ground shadow at a single alpha."""
    im = new(w, h)
    c = col('ink', 0, a=96)
    for (x, y) in ellipse_mask(w, h):
        put(im, x, y, c)
    return im


# ---------------------------------------------------------------- alert display
def alert_pip(on=True):
    if on:
        L = leg(r=col('red', 1), R=col('red', 2), o=col('red', 3), d=col('red', 0))
        return from_art([
            '..kkkkkk..',
            '.kooRRRRk.',
            'koRRWWRRrk',
            'kRRRWWRRrk',
            'kRRRWWRRrk',
            'kRRRWWRrrk',
            'kRRRRRRrrk',
            'kRRrWWrrdk',
            '.krrrrrdk.',
            '..kkkkkk..',
        ], L)
    L = leg(a=mix(col('ink', 1), col('stone', 1), 0.35), b=col('ink', 1))
    return from_art([
        '..kkkkkk..',
        '.kaabbbbk.',
        'kabbbbbbbk',
        'kbbbbbbbbk',
        'kbbbbbbbbk',
        'kbbbbbbbbk',
        'kbbbbbbbbk',
        'kbbbbbbbbk',
        '.kbbbbbbk.',
        '..kkkkkk..',
    ], L)


# ---------------------------------------------------------------- effects
def fx_slash():
    """The swing: a bright crescent sweeping from over the shoulder down in front (facing right). 5 frames."""
    import math
    Y = col('gold', 3); C = col('sky', 2); B = col('sky', 1)
    frames = []
    px0, py0, R = 7.0, 12.0, 12.0
    # each frame: which way the crescent bulges (degrees, 0 = right, negative = up), how fat it is, how far round it reaches
    spec = [(-62, 3.0, 40), (-28, 6.0, 62), (8, 7.5, 70), (38, 4.5, 55), (60, 2.2, 38)]
    for f, (deg, fat, reach) in enumerate(spec):
        im = new(24, 24)
        ux, uy = math.cos(math.radians(deg)), math.sin(math.radians(deg))
        for y in range(24):
            for x in range(24):
                dx, dy = x + 0.5 - px0, y + 0.5 - py0
                d = math.hypot(dx, dy)
                if d > R or d < 2:
                    continue
                ang = math.degrees(math.atan2(dy, dx)) - deg
                ang = (ang + 180) % 360 - 180
                if abs(ang) > reach:
                    continue
                # inside the outer circle, outside one pulled back towards the swinger: a crescent
                d2 = math.hypot(dx + ux * fat, dy + uy * fat)
                if d2 < R:
                    continue
                depth = R - d  # 0 at the outer edge
                lead = ang > reach * 0.25  # the leading end stays hottest
                if depth < 1.6:
                    c = WHITE
                elif depth < 3.2:
                    c = Y if f < 3 else C
                else:
                    c = C if f < 3 else B
                if f == 4 and (x + y * 3) % 4 == 0:
                    continue  # the last frame breaks up
                put(im, x, y, c)
        # a trailing wisp behind the blade on the fat frames
        if f in (1, 2):
            for y in range(24):
                for x in range(24):
                    if im.getpixel((x, y))[3]:
                        continue
                    dx, dy = x + 0.5 - px0, y + 0.5 - py0
                    d = math.hypot(dx, dy)
                    ang = (math.degrees(math.atan2(dy, dx)) - deg + 180) % 360 - 180
                    if R - 1.2 < d <= R and -reach - 22 < ang < -reach and (x + y) % 2 == 0:
                        put(im, x, y, C)
        frames.append(im)
    return strip(frames)


def _star(im, cx, cy, long, short, c, c2=None):
    """A four-pointed star with short diagonals."""
    for i in range(-long, long + 1):
        put(im, cx + i, cy, c); put(im, cx, cy + i, c)
    for i in range(-short, short + 1):
        put(im, cx + i, cy + i, c2 or c); put(im, cx + i, cy - i, c2 or c)


def fx_hit():
    """The star at the point of impact: flash, burst, burst, ring of sparks, embers. 5 frames."""
    Y = col('gold', 2); L = col('gold', 3); O = col('orange', 2)
    frames = []
    # 0: small hot core
    im = new(16, 16)
    _star(im, 8, 8, 3, 1, L)
    rect(im, 7, 7, 3, 3, WHITE)
    frames.append(im)
    # 1: full starburst
    im = new(16, 16)
    _star(im, 8, 8, 7, 4, Y, O)
    _star(im, 8, 8, 6, 3, L, Y)
    for dx in (-1, 0, 1):
        for i in range(-4, 5):
            put(im, 8 + dx, 8 + i, L if dx else WHITE); put(im, 8 + i, 8 + dx, L if dx else WHITE)
    rect(im, 6, 6, 5, 5, WHITE)
    for p in ((5, 5), (11, 5), (5, 11), (11, 11)):
        put(im, p[0], p[1], L)
    frames.append(im)
    # 2: the star opens: hollow middle
    im = new(16, 16)
    _star(im, 8, 8, 7, 5, Y, O)
    _star(im, 8, 8, 7, 4, L, Y)
    rect(im, 7, 7, 3, 3, WHITE)
    for p in ((8, 8),):
        put(im, p[0], p[1], CLEAR)
    for i in (1, 2):
        for s in (-1, 1):
            put(im, 8 + s * i, 8 + s * i, WHITE); put(im, 8 + s * i, 8 - s * i, WHITE)
    frames.append(im)
    # 3: sparks flying outward
    im = new(16, 16)
    for (x, y) in ((8, 1), (8, 2), (8, 14), (8, 13), (1, 8), (2, 8), (14, 8), (13, 8)):
        put(im, x, y, L)
    for (x, y) in ((3, 3), (12, 3), (3, 12), (12, 12), (4, 4), (11, 4), (4, 11), (11, 11)):
        put(im, x, y, Y)
    for (x, y) in ((8, 4), (8, 11), (4, 8), (11, 8)):
        put(im, x, y, O)
    frames.append(im)
    # 4: last embers
    im = new(16, 16)
    for (x, y) in ((8, 0), (15, 8), (0, 8), (8, 15), (2, 2), (13, 2), (2, 13), (13, 13)):
        put(im, x, y, O if (x + y) % 2 else Y)
    frames.append(im)
    return strip(frames)


def _puff(im, cx, cy, r, shade=True):
    """One round dust puff: cream body, a paler top-left, a soft underside. No outline: dust is light."""
    A = col('skin', 2); Bc = mix(col('skin', 2), col('#ffffff'), 0.55); D = mix(col('skin', 0), col('stone', 2), 0.45)
    w = int(r * 2)
    if w < 1:
        return
    m = ellipse_mask(w, w)
    x0, y0 = int(round(cx - r)), int(round(cy - r))
    for (i, j) in m:
        dx, dy = (i + 0.5 - r) / r, (j + 0.5 - r) / r
        d = dx * 0.6 + dy * 0.8
        c = Bc if d < -0.25 else A if d < 0.5 else D
        if not shade:
            c = A
        put(im, x0 + i, y0 + j, c)


def fx_dust():
    """A dust puff: bursts small, swells, breaks into three, thins, last specks. 5 frames."""
    frames = []
    im = new(16, 16); _puff(im, 8, 11, 3); _puff(im, 5, 12, 2); _puff(im, 11, 12, 2); frames.append(im)
    im = new(16, 16); _puff(im, 8, 9, 4.5); _puff(im, 4, 11, 3); _puff(im, 12, 11, 3); _puff(im, 8, 12, 3); frames.append(im)
    im = new(16, 16); _puff(im, 8, 6, 3.5); _puff(im, 3, 9, 3); _puff(im, 13, 9, 3); _puff(im, 8, 11, 2); frames.append(im)
    im = new(16, 16); _puff(im, 8, 4, 2.5); _puff(im, 2, 7, 2); _puff(im, 14, 7, 2); _puff(im, 6, 9, 1); _puff(im, 11, 10, 1); frames.append(im)
    im = new(16, 16); _puff(im, 8, 2, 1.5, False); _puff(im, 1, 5, 1, False); _puff(im, 15, 5, 1, False); frames.append(im)
    return strip(frames)


def fx_land():
    """Landing dust: two low puffs that run out sideways along the floor and fade. 4 frames."""
    frames = []
    im = new(24, 8); _puff(im, 9, 5, 3); _puff(im, 15, 5, 3); _puff(im, 12, 6, 2); frames.append(im)
    im = new(24, 8); _puff(im, 6, 4, 3.5); _puff(im, 18, 4, 3.5); _puff(im, 10, 6, 2); _puff(im, 14, 6, 2); frames.append(im)
    im = new(24, 8); _puff(im, 4, 3, 3); _puff(im, 20, 3, 3); _puff(im, 8, 6, 1.5); _puff(im, 16, 6, 1.5); frames.append(im)
    im = new(24, 8); _puff(im, 2, 2, 1.5, False); _puff(im, 22, 2, 1.5, False); _puff(im, 6, 5, 1, False); _puff(im, 18, 5, 1, False); frames.append(im)
    return strip(frames)


# ---------------------------------------------------------------- the Use button
BTN = [
    '........................',
    '......bbbbbbbbbbbb......',
    '.....bbbbbbbbbbbbbb.....',
    '....bbbccccccccccbbb....',
    '...bbbceeeeeeeeeecbbb...',
    '..bbbccggggggggggccbbb..',
    '.bbbccggggggggggggccbbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbccggggggggggggggccbb.',
    '.bbbccggggggggggggccbbb.',
    '..bbbccggggggggggccbbb..',
    '...bbbccccccccccccbbb...',
    '....bbbccccccccccbbb....',
    '.....bbbbbbbbbbbbbb.....',
    '......bbbbbbbbbbbb......',
    '........................',
]

HAND = [
    '.....h.h....',
    '....hShShh..',
    '..h.hShShSh.',
    '.hShhShShSh.',
    '.hShhSSSSSh.',
    '.hShSSSSSSh.',
    'hhhSSSSSSSh.',
    'hSShSSSSSSh.',
    'hSSSSSSSSsh.',
    '.hSSSSSSssh.',
    '..hSSSSssh..',
    '...hhhhhh...',
]


def ui_use():
    """The "Use" touch button: the delivered buttons' own stone octagon (assets/ui/touch/), an open hand, no letters."""
    out = new(48, 24)
    normal = {'b': (28, 51, 71, 235), 'c': (240, 248, 230, 202), 'e': (255, 255, 255, 140), 'g': (207, 232, 216, 240)}
    pressed = {'b': (28, 51, 71, 235), 'c': (123, 183, 162, 235), 'e': (56, 94, 104, 130), 'g': (171, 219, 182, 240)}
    hand = {'h': (37, 48, 74, 255), 'S': col('skin', 2), 's': col('skin', 1)}
    for i, pal in enumerate((normal, pressed)):
        art(out, i * 24, 0, BTN, pal)
        art(out, i * 24 + 6, 6 + i, HAND, hand)
    return out
