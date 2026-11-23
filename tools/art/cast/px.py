"""Pixel toolkit for the cast lane (docs/mechanisms/art-pipeline.md).

DRAFT: a small mask-and-shade drawing kit. A picture is a Frame: an ordered
list of Parts (back to front). A Part is a set of whole pixels plus a colour
ramp; shading and outlines are computed when the frame is rendered, AFTER any
rotation or lean, so the light always comes from the top-left.

Deterministic: no clock, no random numbers. Alpha is 0 or 255.
Coordinates: x right (the way the sprite faces), y down; a pixel (x, y)
covers [x, x+1) x [y, y+1). Characters are built around x = 0 (the middle of
the collision box) with the floor at y = 0: the outline's lowest row is
y = -1 and fills stop at y = -2.
"""
import math
from PIL import Image


def hexc(s):
    s = s.lstrip('#')
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


INK = hexc('2b2140')
SOFT = hexc('4a3a5e')
WHITE = hexc('ffffff')

# The contract's master palette, dark -> light.
RAMP = {k: [hexc(c) for c in v.split()] for k, v in {
    'sky': '5fb4f0 8fd0fa c4e9ff eef9ff',
    'grass': '1f7a3d 2fa84a 5fd35a a8f070',
    'earth': '6b3f2a 94583a c07a4a e3a56b',
    'stone': '5b5670 807b96 a9a5bd d2cfe0',
    'castle': '3f3a66 5c5690 8179b8 aaa3d8',
    'wood': '5a3420 8a5230 b97a40 e0a860',
    'gold': 'a8651a e09a1e ffd23f fff1a0',
    'red': '8a1c3a c8324a f0596a ff9aa0',
    'blue': '263a8c 3c62d0 5c92f5 a0c8ff',
    'purple': '4a2a7a 7444b8 a070e8 d0aaff',
    'teal': '16607a 1e98a8 40d0c8 a0f0e0',
    'orange': 'b0481a e8742a ffa048 ffd090',
    'pink': 'b03a78 e860a0 ff98c0 ffd0e0',
    'metal': '6a7890 9aa8c0 d0dcec ffffff',
    'night': '141228 221f44 343066 4c4890',
}.items()}
# cream / skin has three tones in the contract; the fourth is an in-between
# shade toward white (allowed: "an in-between shade ... a new hue is not").
RAMP['skin'] = [hexc('c88a5a'), hexc('f0c090'), hexc('ffe2c0'), mix(hexc('ffe2c0'), WHITE, 0.5)]
# A flushed face (mood 3) is the red ramp's light end.
RAMP['flush'] = [hexc('8a1c3a'), hexc('c8324a'), hexc('f0596a'), hexc('ff9aa0')]
# Fur / cloth white: the metal ramp without its darkest tone.
RAMP['white'] = [hexc('6a7890'), hexc('9aa8c0'), hexc('d0dcec'), WHITE]
# Straw and burlap: gold's dark end is too orange, so the pale end of wood+gold.
RAMP['straw'] = [hexc('b97a40'), hexc('e0a860'), hexc('ffd23f'), hexc('fff1a0')]
RAMP['sack'] = [hexc('94583a'), hexc('c07a4a'), hexc('e3a56b'), hexc('ffe2c0')]
RAMP['dark'] = [hexc('141228'), hexc('221f44'), hexc('343066'), hexc('4c4890')]


# ---------------------------------------------------------------- shapes

def ell(cx, cy, rx, ry):
    out = set()
    for y in range(int(math.floor(cy - ry)) - 1, int(math.ceil(cy + ry)) + 1):
        for x in range(int(math.floor(cx - rx)) - 1, int(math.ceil(cx + rx)) + 1):
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1.0:
                out.add((x, y))
    return out


def rect(x0, y0, x1, y1):
    """Pixels x0 <= x < x1, y0 <= y < y1."""
    return {(x, y) for x in range(int(x0), int(x1)) for y in range(int(y0), int(y1))}


def poly(pts):
    """Even-odd fill of a polygon, sampled at pixel centres."""
    out = set()
    ys = [p[1] for p in pts]
    xs = [p[0] for p in pts]
    n = len(pts)
    for y in range(int(math.floor(min(ys))) - 1, int(math.ceil(max(ys))) + 1):
        cy = y + 0.5
        cross = []
        for i in range(n):
            (xa, ya), (xb, yb) = pts[i], pts[(i + 1) % n]
            if (ya <= cy < yb) or (yb <= cy < ya):
                cross.append(xa + (cy - ya) * (xb - xa) / (yb - ya))
        cross.sort()
        for i in range(0, len(cross) - 1, 2):
            for x in range(int(math.floor(min(xs))) - 1, int(math.ceil(max(xs))) + 1):
                if cross[i] <= x + 0.5 < cross[i + 1]:
                    out.add((x, y))
    return out


def capsule(x0, y0, x1, y1, r):
    out = set()
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy
    for y in range(int(math.floor(min(y0, y1) - r)) - 1, int(math.ceil(max(y0, y1) + r)) + 1):
        for x in range(int(math.floor(min(x0, x1) - r)) - 1, int(math.ceil(max(x0, x1) + r)) + 1):
            px, py = x + 0.5, y + 0.5
            t = 0 if L2 == 0 else max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / L2))
            if (px - x0 - t * dx) ** 2 + (py - y0 - t * dy) ** 2 <= r * r:
                out.add((x, y))
    return out


def line(x0, y0, x1, y1):
    x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
    out = set()
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        out.add((x0, y0))
        if x0 == x1 and y0 == y1:
            return out
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x0 += sx
        if e2 <= dx:
            err += dx
            y0 += sy


def shift(mask, dx, dy):
    return {(x + dx, y + dy) for (x, y) in mask}


def clip(mask, x0=-999, y0=-999, x1=999, y1=999):
    return {(x, y) for (x, y) in mask if x0 <= x < x1 and y0 <= y < y1}


def bbox(mask):
    xs = [p[0] for p in mask]
    ys = [p[1] for p in mask]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


# ---------------------------------------------------------------- frame

class Part:
    def __init__(self, mask, ramp, shade='ball', base=2, depth=2, hl=True, sep='auto', outline=None, ball=None):
        self.mask = set(mask)
        self.ramp = ramp
        self.shade = shade      # 'ball' | 'edge' | 'flat'
        self.base = base        # tone index used for the lit body
        self.depth = depth      # 'edge': width of the shaded rim
        self.hl = hl
        self.sep = sep          # line drawn where this part overlaps what is under it
        self.outline = outline  # colour of the outer outline next to this part
        self.ball = ball        # (cx, cy, rx, ry) for 'ball' when the mask is clipped
        self.pix = {}           # hand-placed pixels, same space
        self.ly = None          # the height this part leans from (default: its middle)

    def dot(self, x, y, c):
        self.pix[(int(x), int(y))] = c
        return self

    def dots(self, pts, c):
        for (x, y) in pts:
            self.pix[(int(x), int(y))] = c
        return self

    def tones(self):
        m = self.mask
        r = self.ramp
        out = {}
        if not m:
            return out
        b = self.base
        lo1 = r[max(0, b - 1)]
        lo2 = r[max(0, b - 2)]
        hi = r[min(len(r) - 1, b + 1)]
        if self.shade == 'flat':
            return {p: r[b] for p in m}
        if self.shade == 'ball':
            if self.ball:
                cx, cy, rx, ry = self.ball
            else:
                x0, y0, x1, y1 = bbox(m)
                cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, max(1, (x1 - x0) / 2), max(1, (y1 - y0) / 2)
            for (x, y) in m:
                u, v = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                t = u * 0.6 + v * 0.8
                edge_br = (x + 1, y + 1) not in m or (x + 1, y) not in m or (x, y + 1) not in m
                inner = (x - 1, y) in m and (x, y - 1) in m
                if t > 0.72 and (edge_br or t > 0.86):
                    c = lo2
                elif t > 0.34:
                    c = lo1
                elif self.hl and t < -0.5 and inner and (u * u + v * v) < 0.74:
                    c = hi
                else:
                    c = r[b]
                out[(x, y)] = c
            return out
        # 'edge': a bevel. Shade toward the bottom-right, light on the top-left.
        for (x, y) in m:
            sh = any((x + k, y + k) not in m for k in range(1, self.depth + 1))
            sh1 = (x + 1, y + 1) not in m
            lit = (x - 1, y - 1) not in m
            if sh and not lit:
                c = lo1
            elif lit and self.hl and not sh1:
                c = hi
            else:
                c = r[b]
            out[(x, y)] = c
        return out


class Frame:
    def __init__(self):
        self.parts = []

    def add(self, mask, ramp, **kw):
        if isinstance(ramp, str):
            ramp = RAMP[ramp]
        p = Part(mask, ramp, **kw)
        self.parts.append(p)
        return p

    def px(self, pts, c, outline=None):
        """Hand-placed pixels as their own layer (drawn over everything before it)."""
        p = Part(set(), [c, c, c, c], shade='flat', sep=None, outline=outline)
        if isinstance(pts, dict):
            for k, v in pts.items():
                p.pix[(int(k[0]), int(k[1]))] = v
        else:
            for (x, y) in pts:
                p.pix[(int(x), int(y))] = c
        self.parts.append(p)
        return p

    def extend(self, other):
        self.parts.extend(other.parts)
        return self

    def map(self, fn, parts=None):
        for p in (self.parts if parts is None else parts):
            p.mask = {fn(x, y) for (x, y) in p.mask}
            p.pix = {fn(x, y): c for (x, y), c in p.pix.items()}
            if p.ball:
                cx, cy, rx, ry = p.ball
                nx, ny = fn(cx, cy)
                p.ball = (nx, ny, rx, ry)
        return self

    def move(self, dx, dy, parts=None):
        return self.map(lambda x, y: (x + dx, y + dy), parts)

    def shear(self, amount, height, parts=None, y0=0):
        """Shear: a row `height` above y0 moves `amount` px; rows at y0 stay."""
        def fn(x, y):
            return (x + int(round(amount * (y0 - y) / height)), y)
        return self.map(fn, parts)

    def lean(self, amount, height, parts=None, y0=0):
        """Lean without bending shapes: each part slides sideways as a whole,
        by how high it sits (its `ly`, or its middle)."""
        for p in (self.parts if parts is None else parts):
            if p.ly is not None:
                cy = p.ly
            else:
                pts = p.mask | set(p.pix.keys())
                if not pts:
                    continue
                b = bbox(pts)
                cy = (b[1] + b[3]) / 2
            dx = int(round(amount * (y0 - cy) / height))
            if dx:
                self.move(dx, 0, [p])
        return self

    def rot90(self, turns, px=0, py=0):
        """Rotate clockwise by turns*90 degrees about the point (px, py)."""
        turns %= 4
        for p in self.parts:
            p.ball = None

        def fn(x, y):
            cx, cy = x + 0.5 - px, y + 0.5 - py
            for _ in range(turns):
                cx, cy = -cy, cx
            return (int(math.floor(cx + px)), int(math.floor(cy + py)))
        return self.map(fn)

    def flip(self, px=0):
        for p in self.parts:
            p.ball = None
        return self.map(lambda x, y: (int(2 * px - x - 1), y))

    def scale(self, sx, sy, px=0, py=0):
        """Nearest-neighbour squash/stretch of the masks about (px, py)."""
        for p in self.parts:
            p.ball = None
            for attr in ('mask', 'pix'):
                src = getattr(p, attr)
                if not src:
                    continue
                keys = src if attr == 'mask' else src.keys()
                x0, y0, x1, y1 = bbox(keys)
                tx0, tx1 = sorted((int(math.floor(px + (x0 - px) * sx)) - 1, int(math.ceil(px + (x1 - px) * sx)) + 1))
                ty0, ty1 = sorted((int(math.floor(py + (y0 - py) * sy)) - 1, int(math.ceil(py + (y1 - py) * sy)) + 1))
                new = set() if attr == 'mask' else {}
                for ty in range(ty0, ty1):
                    for tx in range(tx0, tx1):
                        s = (int(math.floor(px + (tx + 0.5 - px) / sx)), int(math.floor(py + (ty + 0.5 - py) / sy)))
                        if s in src:
                            if attr == 'mask':
                                new.add((tx, ty))
                            else:
                                new[(tx, ty)] = src[s]
                setattr(p, attr, new)
        return self


N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def render(frame, w, h, ox, oy, outline=True):
    """Paint a frame into a w x h RGBA image; local (0, 0) lands on (ox, oy)."""
    col = {}
    own = {}
    for part in frame.parts:
        tones = part.tones()
        if part.sep is not None and part.mask:
            for (x, y) in part.mask:
                for dx, dy in N4:
                    q = (x + dx, y + dy)
                    if q not in part.mask and q in col and own.get(q) is not part:
                        o = own[q]
                        if part.sep == 'auto':
                            col[q] = mix(o.ramp[0], INK, 0.35) if o.mask else col[q]
                        else:
                            col[q] = part.sep
        for p, c in tones.items():
            col[p] = c
            own[p] = part
        for p, c in part.pix.items():
            col[p] = c
            own[p] = part
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    put = img.putpixel
    if outline:
        edge = {}
        for (x, y) in col:
            for dx, dy in N4:
                q = (x + dx, y + dy)
                if q not in col:
                    o = own[(x, y)]
                    c = o.outline if o.outline is not None else INK
                    # keep the darkest claim
                    if q not in edge or sum(c) < sum(edge[q]):
                        edge[q] = c
        for (x, y), c in edge.items():
            X, Y = x + ox, y + oy
            if 0 <= X < w and 0 <= Y < h:
                put((X, Y), c + (255,))
    for (x, y), c in col.items():
        X, Y = x + ox, y + oy
        if 0 <= X < w and 0 <= Y < h:
            put((X, Y), c + (255,))
    return img


def extent(frame):
    """Bounding box of everything in a frame, outline included."""
    pts = set()
    for p in frame.parts:
        pts |= p.mask
        pts |= set(p.pix.keys())
    x0, y0, x1, y1 = bbox(pts)
    return x0 - 1, y0 - 1, x1 + 1, y1 + 1
