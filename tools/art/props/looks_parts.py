"""Group "parts": doorways and working parts, the bell, the shop's things.
Each function returns one picture (or a strip of frames side by side)."""
from px import *

ST = [col('stone', i) for i in range(4)]
NI = [col('night', i) for i in range(4)]
WD = [col('wood', i) for i in range(4)]
GD = [col('gold', i) for i in range(4)]
RD = [col('red', i) for i in range(4)]
MT = [col('metal', i) for i in range(4)]


# ---------------------------------------------------------------- doorway
def door_enter(w, h):
    """An open dark arch in a stone frame, w x h tiles. Drawn over the door's rectangle."""
    W, H = w * 16, h * 16
    im = new(W, H)
    r = (W - 8) / 2.0  # the opening's half width
    cx = W / 2.0
    top = 3  # the frame's crown
    spring = top + 3 + int(r)  # where the arch meets the jambs

    def opening(x, y):
        if y >= spring:
            return 4 <= x < W - 4
        dy = spring - (y + 0.5)
        if dy > r:
            return False
        half = (r * r - dy * dy) ** 0.5
        return abs(x + 0.5 - cx) <= half

    def frame(x, y):
        # the opening grown by 3 px, flattened at the sides
        for dx in (-3, -2, -1, 0, 1, 2, 3):
            for dy in (-3, -2, -1, 0):
                if abs(dx) + abs(dy) <= 4 and opening(x + dx, y - dy if False else y + (-dy)):
                    return True
        return False

    for y in range(H):
        for x in range(W):
            if opening(x, y):
                put(im, x, y, NI[0])
            elif frame(x, y) and 1 <= x < W - 1:
                put(im, x, y, ST[2])
    # depth inside the opening: the right inner wall catches the light, and the floor shows
    for y in range(H):
        for x in range(W):
            if get(im, x, y) != NI[0]:
                continue
            if not opening(x + 2, y) and opening(x + 1, y) is not None and y > spring - 2:
                put(im, x, y, NI[1])
    for x in range(4, W - 4):
        put(im, x, H - 1, NI[2]); put(im, x, H - 2, NI[1])
    put(im, 4, H - 1, NI[1]); put(im, W - 5, H - 1, NI[1])
    # the stones: light on the outer top-left, shade towards the opening and bottom-right
    src = im.copy()
    for y in range(H):
        for x in range(W):
            if src.getpixel((x, y)) != ST[2]:
                continue
            up = get(src, x, y - 1); left = get(src, x - 1, y); right = get(src, x + 1, y)
            if up[3] == 0 or (left[3] == 0 and x < cx):
                put(im, x, y, ST[3])
            elif right in (NI[0],) and x < cx:
                put(im, x, y, ST[1])
            elif get(src, x, y + 1) == NI[0]:
                put(im, x, y, ST[1])
            elif right[3] == 0 and x > cx:
                put(im, x, y, ST[1])
            elif left == NI[0] and x > cx:
                put(im, x, y, ST[3])
    # joints between the stones on the jambs, and the keystone
    for y in range(spring + 2, H - 2, 6):
        for x in (1, 2, 3):
            put(im, x, y, ST[0])
        for x in (W - 4, W - 3, W - 2):
            put(im, x, y + 3 if y + 3 < H - 2 else y, ST[0])
    kx = int(cx) - 1
    for x in (kx, kx + 1):
        put(im, x, top, ST[3]); put(im, x, top + 1, ST[3]); put(im, x, top + 2, ST[2])
    put(im, kx - 1, top + 1, ST[0]); put(im, kx + 2, top + 1, ST[0])
    put(im, kx - 1, top + 2, ST[0]); put(im, kx + 2, top + 2, ST[0])
    # arch joints
    put(im, 3, spring - 2, ST[0]); put(im, W - 4, spring - 2, ST[0])
    put(im, 2, spring - 1, ST[0]); put(im, W - 3, spring - 1, ST[0])
    # ink edge all round, soft where the stone meets the dark
    out = im.copy()
    for y in range(H):
        for x in range(W):
            if im.getpixel((x, y))[3]:
                continue
            near = any(get(im, x + dx, y + dy)[3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if near:
                out.putpixel((x, y), INK)
    return out


# ---------------------------------------------------------------- plates
def plate(down):
    """A floor plate: a stone cap standing proud of its rim (up, an orange stud showing), or sunk flush
    with the rim and lit teal (down)."""
    im = new(16, 16)
    L = leg(abcd='stone', o=col('orange', 2), O=col('orange', 1), t=col('teal', 2), T=col('teal', 3))
    if not down:
        art(im, 0, 9, [
            '....kkkkkkkk....',
            '...kddddddddk...',
            '...kcOooooOck...',
            '...kccccccbbk...',
            '.kkkbbbbbbbakkk.',
            'kdccccccccccccbk',
            'kcbbbbbbbbbbbbak',
        ], L)
    else:
        art(im, 0, 13, [
            '.kkkkkkkkkkkkkk.',
            'kdcctTTTTTTtcbbk',
            'kcbbbbbbbbbbbbak',
        ], L)
    return im


# ---------------------------------------------------------------- gate
def gate(open_):
    im = new(16, 16)
    bars = (2, 7, 12)

    def bar(y0, y1):
        for bx in bars:
            for y in range(y0, y1):
                put(im, bx - 1, y, INK); put(im, bx, y, MT[2]); put(im, bx + 1, y, MT[1]); put(im, bx + 2, y, INK)

    if not open_:
        bar(0, 16)
        # the crossbar, riveted where it meets a bar
        for x in range(16):
            put(im, x, 5, INK); put(im, x, 6, MT[2]); put(im, x, 7, MT[1]); put(im, x, 8, MT[0]); put(im, x, 9, INK)
        for bx in bars:
            put(im, bx, 6, MT[3]); put(im, bx + 1, 7, MT[3]); put(im, bx, 7, MT[2])
            put(im, bx, 10, MT[1]); put(im, bx + 1, 10, MT[0])  # the crossbar's shadow on the bar
        for bx in bars:
            for y in (1, 13):
                put(im, bx, y, MT[3])
    else:
        bar(0, 4)
        for x in range(16):
            put(im, x, 0, MT[1]); put(im, x, 1, MT[0]); put(im, x, 2, INK)
        for bx in bars:
            put(im, bx, 0, MT[3]); put(im, bx + 1, 0, MT[2])
            put(im, bx, 2, MT[2]); put(im, bx + 1, 2, MT[1])
            # the spike
            put(im, bx - 1, 4, INK); put(im, bx, 4, MT[2]); put(im, bx + 1, 4, MT[0]); put(im, bx + 2, 4, INK)
            put(im, bx - 1, 5, INK); put(im, bx, 5, MT[1]); put(im, bx + 1, 5, INK)
            put(im, bx, 6, INK)
    return im


# ---------------------------------------------------------------- breakable walls
def crack(n):
    """A quiet crack: thin, dark, no glow. Both variants enter and leave at x = 7 so stacked tiles join."""
    im = new(16, 16)
    path = [[7, 7, 8, 8, 9, 8, 8, 7, 6, 6, 7, 7, 8, 8, 7, 7], [7, 6, 6, 7, 7, 8, 9, 9, 8, 7, 7, 6, 6, 7, 7, 7]][n]
    for y, x in enumerate(path):
        put(im, x, y, INK)
    if n == 0:
        pts(im, INK, (10, 5), (11, 6))
        pts(im, SOFT, (9, 5), (7, 7), (8, 11), (12, 7))
    else:
        pts(im, INK, (5, 12), (4, 13))
        pts(im, SOFT, (6, 11), (8, 5), (8, 9), (3, 14))
    # round 2: a light edge beside the dark core, so a crack shows on a dark wall too
    lit = col('stone', 3)
    src = im.copy()
    for y in range(16):
        for x in range(16):
            if src.getpixel((x, y)) == INK and src.getpixel((min(15, x + 1), y))[3] == 0:
                put(im, x + 1, y, lit)
    return im


def rubble():
    im = new(16, 16)
    L = leg(abcd='stone')
    art(im, 0, 8, [
        '.......kk.......',
        '......kddk......',
        '..kk.kdccbk.kk..',
        '.kdckkcbbak.kdck',
        'kdcbkdkbaakkdcbk',
        'kcbakccbkkdckbak',
        'kbaakcbakdcbakak',
        'kkkkkkkkkkkkkkkk',
    ], L)
    # no ink along the floor: the bottom row is stone shadow, not a line
    for x in range(16):
        c = get(im, x, 14)
        put(im, x, 15, ST[0] if c[3] else CLEAR)
    return im


# ---------------------------------------------------------------- windows
def _lancet(W, H):
    """Masks for a pointed window filling W x H: returns (glass(x,y), frame(x,y)) tests."""
    cx = W / 2.0
    rise = W // 2 + 1  # rows the point takes

    def glass(x, y):
        if not (3 <= x < W - 3 and 3 <= y < H - 5):
            return False
        d = abs(x + 0.5 - cx)
        return (y - 3) >= d - 0.5 + (d > 3) * 1 if y - 3 < rise else True

    def frame(x, y):
        if glass(x, y):
            return False
        if H - 4 <= y < H - 1:  # the sill, full width
            return True
        if y >= H - 1:
            return False
        return any(glass(x + dx, y + dy) for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2) if abs(dx) + abs(dy) <= 3)

    return glass, frame


def _frame_paint(im, glass, frame, ramp):
    W, H = im.size
    R = [col(ramp, i) for i in range(4)]
    for y in range(H):
        for x in range(W):
            if frame(x, y):
                put(im, x, y, R[2])
    src = im.copy()
    for y in range(H):
        for x in range(W):
            if src.getpixel((x, y)) != R[2]:
                continue
            if y >= H - 4:  # sill: light top, dark underside
                put(im, x, y, R[3] if y == H - 4 else R[2] if y == H - 3 else R[1])
                continue
            if get(src, x, y - 1)[3] == 0 or get(src, x - 1, y)[3] == 0:
                put(im, x, y, R[3])
            elif glass(x + 1, y) or glass(x, y + 1):
                put(im, x, y, R[1])
    # ink outside
    out = im.copy()
    for y in range(H):
        for x in range(W):
            if not im.getpixel((x, y))[3] and not glass(x, y):
                if any(get(im, x + dx, y + dy)[3] and not glass(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    out.putpixel((x, y), INK)
    return out


def window(w, h, broken=False):
    """A plain leaded window, pale blue glass in a stone frame."""
    W, H = w * 16, h * 16
    im = new(W, H)
    glass, frame = _lancet(W, H)
    S = [col('sky', i) for i in range(4)]
    cxl = W // 2 - 1
    for y in range(H):
        for x in range(W):
            if not glass(x, y):
                continue
            if broken:
                put(im, x, y, NI[0]); continue
            c = S[1]
            if (x + y) % 11 in (0, 1):
                c = S[2]  # a streak of light across the glass
            if (x + y) % 11 == 5 and (x * 7 + y) % 3 == 0:
                c = S[3]
            put(im, x, y, c)
    if not broken:
        # lead: one upright, bars across
        for y in range(H):
            for x in (cxl, cxl + 1):
                if glass(x, y):
                    put(im, x, y, ST[0] if x == cxl else SOFT)
        for y in range(11, H - 6, 9):
            for x in range(W):
                if glass(x, y):
                    put(im, x, y, SOFT)
        for y in range(H):
            for x in range(W):
                if glass(x, y) and not glass(x - 1, y) and get(im, x, y) in (S[1], S[2]):
                    put(im, x, y, S[0])  # the frame's shadow on the glass
    else:
        _shards(im, glass, [S[1], S[2], S[3], S[0]])
    return _frame_paint(im, glass, frame, 'stone')


def _shards(im, glass, colours):
    """Jagged glass left standing in the frame: teeth along every edge, longest in the corners."""
    W, H = im.size
    k = 0
    for y in range(H):
        for x in range(W):
            if not glass(x, y):
                continue
            # distance to the frame on each side
            dl = next((d for d in range(1, 8) if not glass(x - d, y)), 9)
            dr = next((d for d in range(1, 8) if not glass(x + d, y)), 9)
            du = next((d for d in range(1, 8) if not glass(x, y - d)), 9)
            dd = next((d for d in range(1, 8) if not glass(x, y + d)), 9)
            tooth_l = 1 + hsh(y // 6, 1) % 4 - abs(y % 6 - 2)
            tooth_r = 1 + hsh(y // 7, 2) % 4 - abs(y % 7 - 3)
            tooth_d = 3 + hsh(x // 4, 3) % 5 - abs(x % 4 - 1) * 2
            tooth_u = 2 + hsh(x // 3, 4) % 3 - abs(x % 3 - 1) * 2
            keep = dl <= tooth_l or dr <= tooth_r or dd <= tooth_d or du <= tooth_u
            if keep:
                which = colours[hsh(x // 3, y // 5) % len(colours)]
                put(im, x, y, which)
    # a bright edge on each shard where it meets the dark
    src = im.copy()
    for y in range(H):
        for x in range(W):
            if glass(x, y) and src.getpixel((x, y)) != NI[0]:
                if get(src, x + 1, y) == NI[0] and get(src, x, y - 1) == NI[0]:
                    put(im, x, y, (255, 255, 255, 255))


def stained(w, h, broken=False):
    """The throne room's window: coloured glass, a gold sun at its heart."""
    W, H = w * 16, h * 16
    im = new(W, H)
    glass, frame = _lancet(W, H)
    hues = ['red', 'blue', 'gold', 'teal', 'purple']
    cx = W // 2
    for y in range(H):
        for x in range(W):
            if not glass(x, y):
                continue
            if broken:
                put(im, x, y, NI[0]); continue
            u, v = (x - cx + y), (x - cx - y)
            if u % 8 == 0 or v % 8 == 0:
                put(im, x, y, INK); continue
            cell = hsh(u // 8, v // 8)
            hue = hues[(u // 8 * 2 + v // 8 * 3) % len(hues)]
            tone = 2
            if (u % 8 == 1 and v % 8 <= 4) or (v % 8 == 7 and u % 8 <= 4):
                tone = 3
            if (u % 8 == 7) or (v % 8 == 1):
                tone = 1
            put(im, x, y, col(hue, tone))
    if not broken:
        # the sun medallion
        my = H // 2 - 4
        m = ellipse_mask(8, 8)
        for (i, j) in ellipse_mask(10, 10):
            if glass(cx - 5 + i, my - 1 + j):
                put(im, cx - 5 + i, my - 1 + j, INK)
        for (i, j) in m:
            c = GD[3] if (i + j) < 6 else GD[2] if (i + j) < 10 else GD[1]
            put(im, cx - 4 + i, my + j, c)
        pts(im, (255, 255, 255, 255), (cx - 2, my + 2))
        pts(im, RD[2], (cx - 1, my + 4), (cx, my + 4), (cx - 1, my + 3), (cx, my + 3))
        pts(im, RD[3], (cx - 1, my + 3))
        # a small rose at the top of the point
        ty = 6
        for (dx, dy, c) in ((0, 0, GD[2]), (-1, 0, GD[3]), (0, 1, GD[1]), (-1, 1, GD[2])):
            if glass(cx + dx, ty + dy):
                put(im, cx + dx, ty + dy, c)
    else:
        _shards(im, glass, [col('red', 2), col('blue', 2), col('gold', 2), col('teal', 2), col('purple', 2)])
    out = _frame_paint(im, glass, frame, 'castle')
    # a thin gold line inside the frame (whole window only reads richer; kept when broken too)
    return out


# ---------------------------------------------------------------- hiding places
def curtain(w, h):
    """A heavy red curtain on a gold rod, w x h tiles."""
    W, H = w * 16, h * 16
    im = new(W, H)
    # the folds: tone per column, repeating; a parting line in the middle of a wide one
    pat = [1, 2, 3, 2, 1, 1, 2, 3, 3, 2, 1, 2, 3, 2]
    for x in range(1, W - 1):
        i = x - 1
        tone = pat[i % len(pat)]
        drop = [0, 1, 2, 1, 0, 0, 1, 2, 2, 1, 0, 1, 2, 1][i % 14]  # scalloped hem
        for y in range(4, H - 3 + drop):
            c = RD[tone]
            if tone == 3:
                c = RD[2]
            elif tone == 2:
                c = RD[1]
            else:
                c = RD[0]
            put(im, x, y, c)
        # a lit ridge on the fullest folds
        if tone == 3:
            for y in range(5, H - 6 + drop):
                if (y // 5) % 3 != 2:
                    put(im, x, y, RD[2])
            if pat[(i - 1) % 14] != 3:
                for y in range(6, H - 9):
                    put(im, x, y, RD[3] if y % 9 < 6 else RD[2])
        # gold hem
        yb = H - 3 + drop
        put(im, x, yb - 2, GD[2]); put(im, x, yb - 1, GD[1])
        if tone == 3:
            put(im, x, yb - 2, GD[3])
    if w > 1:
        mid = W // 2
        for y in range(4, H):
            put(im, mid, y, CLEAR if y > H - 4 else RD[0])
            if y < H - 3:
                put(im, mid - 1, y, RD[0])
    # gathered at the top under the rod
    for x in range(1, W - 1):
        put(im, x, 4, RD[0])
    im = outline(im)
    # the rod and its rings
    for x in range(0, W):
        put(im, x, 1, GD[3] if x % 16 not in (0, 15) else GD[2]); put(im, x, 2, GD[1]); put(im, x, 0, INK); put(im, x, 3, INK)
    for x in (0, W - 1):
        put(im, x, 0, CLEAR); put(im, x, 3, CLEAR); put(im, x, 1, INK); put(im, x, 2, INK)
    put(im, 1, 1, GD[3]); put(im, W - 2, 1, GD[2]); put(im, 1, 2, GD[2]); put(im, W - 2, 2, GD[0])
    for x in range(3, W - 2, 4):
        put(im, x, 2, GD[0]); put(im, x, 3, GD[0])
    return im


# ---------------------------------------------------------------- the alarm bell
def _post(im, broken=False):
    L = leg(abcd='wood', g=GD[1])
    # upright (x 3..5), from y 3 to the ground
    for y in range(4, 32):
        put(im, 2, y, INK); put(im, 3, y, WD[3] if y % 7 else WD[2]); put(im, 4, y, WD[2]); put(im, 5, y, WD[1]); put(im, 6, y, INK)
    for y in (9, 16, 23):
        put(im, 4, y, WD[1]); put(im, 4, y + 1, WD[1])
    # cap
    art(im, 1, 1, ['.kkkkk.', 'kdddcbk', 'kkkkkkk'], L)
    # foot
    art(im, 0, 28, ['.kk...kk.', 'kdckkkcbk', 'kcbbbbbak', 'kkkkkkkkk'], L)
    for x in (3, 4, 5):
        put(im, x, 28, [WD[3], WD[2], WD[1]][x - 3])
    put(im, 3, 29, WD[3]); put(im, 4, 29, WD[2]); put(im, 5, 29, WD[1])
    # the arm
    if not broken:
        art(im, 6, 5, ['kkkkkkkk.', 'ddddcccbk', 'cbbbbbbak', 'kkkkkkkk.'], L)
        art(im, 6, 9, ['bk..', 'kbk.', '.kbk', '..kk'], L)  # brace
        put(im, 6, 9, WD[1]); put(im, 6, 10, INK)
    else:
        art(im, 6, 5, ['kkkk.', 'ddcbk', 'cbak.', 'kkk..'], L)
        pts(im, WD[3], (10, 5), (11, 4))  # splinters
        pts(im, INK, (11, 5), (12, 4), (11, 3), (10, 4))
    return im


def _bell(tilt=0):
    """The bell alone, 11 x 13, hanging point at (5, 0). tilt -1, 0, 1 swings its mouth."""
    im = new(13, 15)
    L = leg(abcd='gold')
    rows = [
        '....kk....',
        '...kddk...',
        '..kdccbk..',
        '.kdDccbbk.',
        '.kdDccbbk.',
        '.kdcccbak.',
        '.kdcccbak.',
        'kddccbbaak',
        'kdcccbbaak',
        'kkkkkkkkkk',
        '...kbak...',
        '....kk....',
    ]
    L['D'] = col('gold', 3); L['d'] = col('gold', 3); L['c'] = col('gold', 2); L['b'] = col('gold', 1); L['a'] = col('gold', 0)
    L['D'] = (255, 255, 255, 255)
    for j, row in enumerate(rows):
        shift = 0 if tilt == 0 else int(round(tilt * (j / 4.0)))
        if j >= 10:
            shift = int(round(tilt * 3.4))  # the clapper swings furthest
        for i, ch in enumerate(row):
            if ch != '.':
                put(im, 1 + i + shift + (1 if tilt < 0 else 0) * 0, j, L[ch])
    return im


def bell(state='still', frame=0):
    im = new(16, 32)
    _post(im, broken=(state == 'broken'))
    if state == 'broken':
        # what is left of the bell, on its side at the foot of the post, cracked
        L = leg(abcd='gold')
        art(im, 7, 24, [
            '..kkkkk..',
            '.kddccbk.',
            'kdWccbbak',
            'kdccKbaak',
            'kccbKKaak',
            '.kbbaKak.',
            '..kkkkk..',
        ], L)
        pts(im, INK, (8, 31), (9, 31), (10, 31), (11, 31), (12, 31), (13, 31), (14, 31))
        # a length of frayed rope on the arm stub
        pts(im, WD[2], (9, 8), (9, 9)); pts(im, WD[3], (9, 10))
        return im
    tilt = 0
    if state == 'ringing':
        tilt = [-0.9, 0, 0.9, 0][frame]
    b = _bell(tilt)
    # rope from the arm to the bell
    pts(im, WD[1], (11, 9))
    paste(im, b, 5 + (0 if tilt >= 0 else 0), 10)
    put(im, 11, 9, WD[3]); put(im, 10, 9, INK); put(im, 12, 9, INK)
    if state == 'ringing' and tilt != 0:
        # ring marks on the side the mouth swings to
        sx = 15 if tilt > 0 else 7
        c = col('gold', 3)
        if tilt > 0:
            pts(im, c, (15, 12), (15, 16), (14, 23)); pts(im, (255, 255, 255, 255), (15, 14), (15, 15))
        else:
            pts(im, c, (7, 13), (7, 17), (8, 23)); pts(im, (255, 255, 255, 255), (7, 15), (7, 16))
    return im


def bell_ringing():
    strip = new(64, 32)
    for f in range(4):
        paste(strip, bell('ringing', f), f * 16, 0)
    return strip


# ---------------------------------------------------------------- the shop
def shop_counter():
    im = new(16, 16)
    L = leg(abcd='wood', r=col('red', 1), R=col('red', 2), c2=None) if False else leg(abcd='wood', r=col('red', 1), R=col('red', 2), w=col('skin', 2), g=col('gold', 2))
    art(im, 0, 3, [
        'kkkkkkkkkkkkkkkk',
        'kddddddddddddcbk',
        'kcccccccccccbbak',
        '.kkkkkkkkkkkkkk.',
        '.kRwRwRwRwRwRwk.',
        '.kRwRwRwRwRwrwk.',
        '.krkrkrkrkrkrkk.',
        '.kckcbkcbbkcbak.',
        '.kckcbkcbbkcbak.',
        '.kckcbkcbbkbbak.',
        '.kbkbbkbbbkbaak.',
        '.kbkbbkbbbkbaak.',
        '.kkkkkkkkkkkkkk.',
    ], L)
    return im


def shop_goods():
    """One of the goods: a round flask of something teal, corked."""
    im = new(8, 8)
    L = leg(abcd='teal', w=col('wood', 3), v=col('wood', 1))
    art(im, 0, 0, [
        '..kkkk..',
        '..kwvk..',
        '..kdck..',
        '.kkdckk.',
        'kdWccbak',
        'kdccbbak',
        'kcbbbaak',
        '.kkkkkk.',
    ], L)
    return im
