"""A small parametric pixel rig for the party's stand-in sprites.

DRAFT: every picture this draws is a stand-in (docs/mechanisms/art-pipeline.md).
A character is a list of body parts; a frame is a POSE of those parts, not a
redraw. Each part is a few round shapes, filled in 3-4 flat tones lit from the
top-left, with a 1 px dark outline. No anti-aliasing: a pixel is in a shape or
it is not. Deterministic: no clock, no random numbers.

Coordinates: "figure space" has its origin where the feet meet the ground, in
the middle of the body; x grows towards the way the character faces (right),
y grows DOWN (so up is negative). One unit is one pixel at 1x.
"""

import math

INK = (0x2B, 0x21, 0x40)
INK_SOFT = (0x4A, 0x3A, 0x5E)


def rgb(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def ramp(*hexes):
    """Four tones, dark to light. Three given: the darkest is repeated."""
    c = [rgb(h) for h in hexes]
    while len(c) < 4:
        c.insert(0, c[0])
    return c


def mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def darker(r):
    """The same ramp one step into shade: for the limb on the far side."""
    return [mix(r[0], INK, 0.35), r[0], r[1], r[2]]


# ---------------------------------------------------------------- transforms

class Xf:
    """Scale, then turn about a pivot, then move; optionally inside a parent."""

    def __init__(self, parent=None, pivot=(0.0, 0.0), rot=0.0, scale=(1.0, 1.0), move=(0.0, 0.0)):
        self.parent, self.pivot, self.rot, self.scale, self.move = parent, pivot, rot, scale, move

    def pt(self, x, y):
        px, py = self.pivot
        dx, dy = (x - px) * self.scale[0], (y - py) * self.scale[1]
        a = math.radians(self.rot)
        c, s = math.cos(a), math.sin(a)
        x2, y2 = px + dx * c - dy * s + self.move[0], py + dx * s + dy * c + self.move[1]
        return self.parent.pt(x2, y2) if self.parent else (x2, y2)

    def angle(self):
        return self.rot + (self.parent.angle() if self.parent else 0.0)

    def sc(self):
        p = self.parent.sc() if self.parent else (1.0, 1.0)
        return (self.scale[0] * p[0], self.scale[1] * p[1])


IDENT = Xf()


# -------------------------------------------------------------------- shapes

class Ell:
    def __init__(self, cx, cy, rx, ry, rot=0.0, xf=IDENT):
        self.cx, self.cy = xf.pt(cx, cy)
        sx, sy = xf.sc()
        self.rx, self.ry = max(0.3, rx * sx), max(0.3, ry * sy)
        a = math.radians(rot + xf.angle())
        self.c, self.s = math.cos(a), math.sin(a)
        r = max(self.rx, self.ry) + 1
        self.box = (self.cx - r, self.cy - r, self.cx + r, self.cy + r)

    def has(self, x, y):
        dx, dy = x - self.cx, y - self.cy
        u = (dx * self.c + dy * self.s) / self.rx
        v = (-dx * self.s + dy * self.c) / self.ry
        return u * u + v * v <= 1.0


class Cap:
    """A limb: a line with a round end at each side, of two radii."""

    def __init__(self, x0, y0, r0, x1, y1, r1, xf=IDENT):
        self.x0, self.y0 = xf.pt(x0, y0)
        self.x1, self.y1 = xf.pt(x1, y1)
        self.r0, self.r1 = r0, r1
        r = max(r0, r1) + 1
        self.box = (min(self.x0, self.x1) - r, min(self.y0, self.y1) - r, max(self.x0, self.x1) + r, max(self.y0, self.y1) + r)

    def has(self, x, y):
        vx, vy = self.x1 - self.x0, self.y1 - self.y0
        ll = vx * vx + vy * vy
        t = 0.0 if ll < 1e-9 else max(0.0, min(1.0, ((x - self.x0) * vx + (y - self.y0) * vy) / ll))
        dx, dy = x - (self.x0 + vx * t), y - (self.y0 + vy * t)
        r = self.r0 + (self.r1 - self.r0) * t
        return dx * dx + dy * dy <= r * r


class Poly:
    def __init__(self, pts, xf=IDENT):
        self.pts = [xf.pt(x, y) for x, y in pts]
        xs, ys = [p[0] for p in self.pts], [p[1] for p in self.pts]
        self.box = (min(xs) - 1, min(ys) - 1, max(xs) + 1, max(ys) + 1)

    def has(self, x, y):
        inside = False
        n = len(self.pts)
        for i in range(n):
            x0, y0 = self.pts[i]
            x1, y1 = self.pts[(i + 1) % n]
            if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0:
                inside = not inside
        return inside


class Cut:
    """A shape with another taken away (a mouth out of a face, a half moon)."""

    def __init__(self, a, b):
        self.a, self.b, self.box = a, b, a.box

    def has(self, x, y):
        return self.a.has(x, y) and not self.b.has(x, y)


# -------------------------------------------------------------------- canvas

class Canvas:
    """One frame. ox, oy: the cell pixel where figure (0, 0) sits."""

    def __init__(self, w, h, ox, oy):
        self.w, self.h, self.ox, self.oy = w, h, ox, oy
        self.px = [[None] * w for _ in range(h)]
        self.own = [[None] * w for _ in range(h)]  # the part (name, ramp) that owns a pixel
        self.edge = [[False] * w for _ in range(h)]  # an outline pixel drawn on empty space
        self.masks = {}
        self.boxes = {}

    def _mask(self, shapes):
        m = set()
        for sh in shapes:
            x0 = max(0, int(math.floor(sh.box[0] + self.ox)))
            y0 = max(0, int(math.floor(sh.box[1] + self.oy)))
            x1 = min(self.w - 1, int(math.ceil(sh.box[2] + self.ox)))
            y1 = min(self.h - 1, int(math.ceil(sh.box[3] + self.oy)))
            for y in range(y0, y1 + 1):
                for x in range(x0, x1 + 1):
                    if sh.has(x + 0.5 - self.ox, y + 0.5 - self.oy):
                        m.add((x, y))
        return m

    def part(self, name, shapes, tones, line='ink', clip=None, ref=None, hl=(-0.40, -0.45, 0.42), sh=0.30, dk=0.82, flat=None):
        """Draw one body part.

        line: 'ink' a dark line all round; 'soft' ink outside, the darkest
              tone of whatever it overlaps inside; 'self' its own darkest tone
              inside; None no line (a patch on its parent).
        clip: only inside this earlier part. ref: light it as part of this
              earlier part (so a patch shades with the mass it sits on).
        hl:   where the highlight sits on the mass, and how big. sh, dk: how
              far round to the bottom-right the shade and the deep shade start.
        flat: draw in this one tone (0-3) with no shading.
        """
        m = self._mask(shapes)
        if clip is not None:
            m &= self.masks.get(clip, set())
        if not m:
            self.masks[name] = m
            return
        if line is not None:
            for (x, y) in m:
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if (nx, ny) in m or not (0 <= nx < self.w and 0 <= ny < self.h):
                        continue
                    under = self.own[ny][nx]
                    if self.px[ny][nx] is None:
                        self.px[ny][nx] = INK
                        self.edge[ny][nx] = True
                    elif self.edge[ny][nx]:
                        pass
                    elif line == 'ink':
                        self.px[ny][nx] = INK
                    elif line == 'soft' and under is not None:
                        self.px[ny][nx] = under[1][0]
                    elif line == 'self':
                        self.px[ny][nx] = tones[0]
        xs, ys = [p[0] for p in m], [p[1] for p in m]
        box = self.boxes[ref] if ref is not None and ref in self.boxes else (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
        cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
        rx, ry = max(1.0, (box[2] - box[0]) / 2), max(1.0, (box[3] - box[1]) / 2)
        for (x, y) in m:
            if flat is not None:
                t = flat
            else:
                nx, ny = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                v = nx * 0.6 + ny * 0.8
                t = 2
                if hl is not None and (nx - hl[0]) ** 2 + (ny - hl[1]) ** 2 <= hl[2] ** 2:
                    t = 3
                if v > sh:
                    t = 1
                if v > dk:
                    t = 0
            self.px[y][x] = tones[t]
            self.own[y][x] = (name, tones)
            self.edge[y][x] = False
        self.masks[name] = m
        self.boxes[name] = box if ref is not None else (min(xs), min(ys), max(xs) + 1, max(ys) + 1)

    def stamp(self, fx, fy, rows, pal, xf=IDENT, turn=None, clip=None):
        """Hand-placed pixels (a face). rows: strings, '.' is nothing; fx, fy
        is the figure point the pattern's top-left sits on. Turned with the
        figure in quarter turns, so a lying face lies too."""
        x, y = xf.pt(fx, fy)
        k = (int(round(xf.angle() / 90.0)) if turn is None else turn) % 4
        grid = [list(r) for r in rows]
        h, w = len(grid), max(len(r) for r in grid)
        grid = [r + ['.'] * (w - len(r)) for r in grid]
        # the pattern's own corners, turned, so it stays put on the face
        pts = []
        for j in range(h):
            for i in range(w):
                ch = grid[j][i]
                if ch == '.':
                    continue
                a = math.radians(90 * k)
                c, s = round(math.cos(a)), round(math.sin(a))
                dx, dy = i + 0.5, j + 0.5
                pts.append((x + dx * c - dy * s, y + dx * s + dy * c, ch))
        allowed = self.masks.get(clip) if clip is not None else None
        for (qx, qy, ch) in pts:
            ix, iy = int(math.floor(qx + self.ox)), int(math.floor(qy + self.oy))
            if 0 <= ix < self.w and 0 <= iy < self.h:
                if allowed is not None and (ix, iy) not in allowed:
                    continue
                if allowed is None and self.px[iy][ix] is None:
                    self.edge[iy][ix] = True
                self.px[iy][ix] = pal[ch]

    def dot(self, x, y, color):
        """One pixel, in CELL pixels: the last hand-tuning."""
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = color

    def lit_outline(self, amount=0.45):
        """Soften the outline on the lit (top-left) side towards the fill's own
        dark tone: the 'dark coloured outline' of the style lock."""
        out = {}
        for y in range(self.h):
            for x in range(self.w):
                if not self.edge[y][x]:
                    continue
                # an outline pixel is lit when the body it bounds lies below or right of it
                for nx, ny in ((x + 1, y), (x, y + 1)):
                    if 0 <= nx < self.w and 0 <= ny < self.h and self.own[ny][nx] is not None and not self.edge[ny][nx]:
                        out[(x, y)] = mix(INK, self.own[ny][nx][1][0], amount)
                        break
        for (x, y), c in out.items():
            self.px[y][x] = c

    def image(self):
        from PIL import Image
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        for y in range(self.h):
            for x in range(self.w):
                c = self.px[y][x]
                if c is not None:
                    im.putpixel((x, y), (c[0], c[1], c[2], 255))
        return im


# --------------------------------------------------------------- pose helpers

def polar(x, y, deg, length):
    """A point `length` from (x, y): 0 hangs straight down, 90 points forward
    (the way the character faces), 180 straight up, -90 behind."""
    a = math.radians(deg)
    return (x + math.sin(a) * length, y + math.cos(a) * length)


def lerp(a, b, t):
    return a + (b - a) * t


def limb(x0, y0, r0, deg, length, r1, bend=0.0, xf=IDENT):
    """An arm or leg from a joint: two capsules through an elbow pushed `bend`
    px sideways. Returns (shapes, end point in figure space before xf)."""
    ex, ey = polar(x0, y0, deg, length)
    if abs(bend) < 0.01:
        return [Cap(x0, y0, r0, ex, ey, r1, xf)], (ex, ey)
    mx, my = (x0 + ex) / 2, (y0 + ey) / 2
    a = math.radians(deg)
    mx, my = mx + math.cos(a) * bend, my - math.sin(a) * bend
    rm = (r0 + r1) / 2
    return [Cap(x0, y0, r0, mx, my, rm, xf), Cap(mx, my, rm, ex, ey, r1, xf)], (ex, ey)


# One run cycle is two steps of three beats each: contact, down, pass.
# (foot forward as a share of the stride, foot lift as a share of the lift, toe angle)
_LEAD = [(1.0, 0.0, -18), (0.5, 0.0, 0), (-0.3, 0.0, 6)]
_TRAIL = [(-1.0, 0.2, 32), (-0.85, 0.75, 55), (0.35, 1.0, 12)]
_BOB = [0, 1, -1]      # + is down: the body sinks after contact and rises at the pass
_SWING = [1.0, 0.55, -0.35]


def stride(i):
    """Beat i (0-5) of a run. Returns (near leg, far leg, bob, swing): each leg
    is (forward share, lift share, toe angle); swing is +1 when the near leg
    is furthest forward (so the near ARM is furthest back) and -1 for the far."""
    k = i % 3
    if i % 6 < 3:
        return _LEAD[k], _TRAIL[k], _BOB[k], _SWING[k]
    return _TRAIL[k], _LEAD[k], _BOB[k], -_SWING[k]
