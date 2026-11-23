"""Small pixel-drawing kit for the props lane (Python 3 + Pillow).

Everything is whole pixels at 1x, alpha 0 or 255 (ground shadows excepted),
colours from the contract's master palette (docs/mechanisms/art-pipeline.md).
Deterministic: no clock, no unseeded randomness. Light comes from the top-left.
"""
from PIL import Image

# ---- the master palette (dark -> light), exactly as in the contract ----
P = {
    'ink': ['#2b2140', '#4a3a5e'],
    'sky': ['#5fb4f0', '#8fd0fa', '#c4e9ff', '#eef9ff'],
    'cloud': ['#d6ecfb', '#ffffff'],
    'far': ['#9fc7e8', '#b5d6ee', '#cfe6f6'],
    'grass': ['#1f7a3d', '#2fa84a', '#5fd35a', '#a8f070'],
    'foliage': ['#1c6b4a', '#2a9a5c', '#58c96a', '#9be37a'],
    'earth': ['#6b3f2a', '#94583a', '#c07a4a', '#e3a56b'],
    'stone': ['#5b5670', '#807b96', '#a9a5bd', '#d2cfe0'],
    'castle': ['#3f3a66', '#5c5690', '#8179b8', '#aaa3d8'],
    'wood': ['#5a3420', '#8a5230', '#b97a40', '#e0a860'],
    'gold': ['#a8651a', '#e09a1e', '#ffd23f', '#fff1a0'],
    'red': ['#8a1c3a', '#c8324a', '#f0596a', '#ff9aa0'],
    'blue': ['#263a8c', '#3c62d0', '#5c92f5', '#a0c8ff'],
    'purple': ['#4a2a7a', '#7444b8', '#a070e8', '#d0aaff'],
    'teal': ['#16607a', '#1e98a8', '#40d0c8', '#a0f0e0'],
    'orange': ['#b0481a', '#e8742a', '#ffa048', '#ffd090'],
    'pink': ['#b03a78', '#e860a0', '#ff98c0', '#ffd0e0'],
    'skin': ['#c88a5a', '#f0c090', '#ffe2c0'],
    'metal': ['#6a7890', '#9aa8c0', '#d0dcec', '#ffffff'],
    'night': ['#141228', '#221f44', '#343066', '#4c4890'],
}


def rgb(h, a=255):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def col(name, i=None, a=255):
    """col('red', 2) -> RGBA of the ramp's third tone; col('#aabbcc') passes through."""
    if isinstance(name, tuple):
        return name
    if name.startswith('#'):
        return rgb(name, a)
    return rgb(P[name][i], a)


def mix(a, b, t=0.5):
    """An in-between shade of two palette colours (allowed by the contract; never a new hue)."""
    a, b = col(a) if not isinstance(a, tuple) else a, col(b) if not isinstance(b, tuple) else b
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3)) + (255,)


INK = col('ink', 0)
SOFT = col('ink', 1)
CLEAR = (0, 0, 0, 0)


def new(w, h):
    return Image.new('RGBA', (w, h), CLEAR)


def put(im, x, y, c):
    if 0 <= x < im.width and 0 <= y < im.height and c is not None:
        im.putpixel((x, y), c)


def get(im, x, y):
    if 0 <= x < im.width and 0 <= y < im.height:
        return im.getpixel((x, y))
    return CLEAR


def rect(im, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            put(im, xx, yy, c)


def hline(im, x, y, w, c):
    rect(im, x, y, w, 1, c)


def vline(im, x, y, h, c):
    rect(im, x, y, 1, h, c)


def pts(im, c, *xy):
    """pts(im, colour, (x, y), (x, y), ...) or a flat list: hand-placed pixels."""
    for p in xy:
        put(im, p[0], p[1], c)


def line(im, x0, y0, x1, y1, c):
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        put(im, x0, y0, c)
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy; x0 += sx
        if e2 <= dx:
            err += dx; y0 += sy


def art(im, x, y, rows, legend):
    """Hand-placed pixels from text. '.' and ' ' are clear; any other char is looked up in legend."""
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch in '. ':
                continue
            put(im, x + i, y + j, legend[ch])


def from_art(rows, legend):
    im = new(max(len(r) for r in rows), len(rows))
    art(im, 0, 0, rows, legend)
    return im


def paste(dst, src, x, y):
    """Alpha-keyed paste (source pixels with alpha 0 leave the destination alone)."""
    dst.alpha_composite(src, (x, y)) if _fits(dst, src, x, y) else _slow_paste(dst, src, x, y)


def _fits(dst, src, x, y):
    return x >= 0 and y >= 0 and x + src.width <= dst.width and y + src.height <= dst.height


def _slow_paste(dst, src, x, y):
    for j in range(src.height):
        for i in range(src.width):
            p = src.getpixel((i, j))
            if p[3]:
                put(dst, x + i, y + j, p)


def flip(im):
    return im.transpose(Image.FLIP_LEFT_RIGHT)


def opaque(im, x, y):
    return get(im, x, y)[3] != 0


def outline(im, c=INK, diag=False, lit=None):
    """1 px outline drawn OUTSIDE the opaque shape (the image must have a 1 px margin).
    `lit`: a softer colour used where the outline pixel sits on the top-left of the shape."""
    src = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if opaque(src, x, y):
                continue
            n4 = opaque(src, x - 1, y) or opaque(src, x + 1, y) or opaque(src, x, y - 1) or opaque(src, x, y + 1)
            nd = diag and (opaque(src, x - 1, y - 1) or opaque(src, x + 1, y - 1) or opaque(src, x - 1, y + 1) or opaque(src, x + 1, y + 1))
            if n4 or nd:
                c2 = c
                if lit is not None and (opaque(src, x + 1, y) or opaque(src, x, y + 1)) and not (opaque(src, x - 1, y) or opaque(src, x, y - 1)):
                    c2 = lit
                im.putpixel((x, y), c2)
    return im


def inline(im, c, match=None):
    """Recolour the shape's own edge pixels (an outline INSIDE the shape). `match`: only pixels of that colour."""
    src = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if not opaque(src, x, y):
                continue
            if match is not None and src.getpixel((x, y)) != match:
                continue
            if not (opaque(src, x - 1, y) and opaque(src, x + 1, y) and opaque(src, x, y - 1) and opaque(src, x, y + 1)):
                im.putpixel((x, y), c)
    return im


def ellipse_mask(w, h):
    """Set of (x, y) inside an ellipse filling a w x h box (pixel-centre test: clean round shapes)."""
    out = set()
    rx, ry = w / 2.0, h / 2.0
    for y in range(h):
        for x in range(w):
            dx, dy = (x + 0.5 - rx) / rx, (y + 0.5 - ry) / ry
            if dx * dx + dy * dy <= 1.0:
                out.add((x, y))
    return out


def ball(im, x, y, w, h, ramp, bands=(-0.45, 0.05, 0.62), spec=True):
    """A round mass in flat bands of a ramp (light top-left), no gradient, no dither.
    ramp: 4 colours dark -> light (3 works too)."""
    cols = [col(ramp, i) for i in range(len(P[ramp]))] if isinstance(ramp, str) else list(ramp)
    rx, ry = w / 2.0, h / 2.0
    for (i, j) in ellipse_mask(w, h):
        dx, dy = (i + 0.5 - rx) / rx, (j + 0.5 - ry) / ry
        d = dx * 0.62 + dy * 0.78  # 1 = far bottom-right (shade), -1 = top-left (light)
        if d < bands[0]:
            t = len(cols) - 1
        elif d < bands[1]:
            t = len(cols) - 2
        elif d < bands[2]:
            t = max(0, len(cols) - 3)
        else:
            t = 0
        put(im, x + i, y + j, cols[t])
    return im


def bevel(im, match, light, dark):
    """Shade a flat shape: pixels of colour `match` on the shape's top/left edge become `light`,
    on its bottom/right edge `dark` (an edge is where the neighbour is not `match`)."""
    src = im.copy()

    def same(xx, yy):
        return get(src, xx, yy) == match

    for yy in range(im.height):
        for xx in range(im.width):
            if not same(xx, yy):
                continue
            if not same(xx, yy - 1) or not same(xx - 1, yy):
                put(im, xx, yy, light)
            elif not same(xx, yy + 1) or not same(xx + 1, yy):
                put(im, xx, yy, dark)
    return im


def leg(**ramps):
    """Legend for art(): leg(s='stone', w='wood') maps s1..s4 -> 'a'.. no: maps the letters given.
    leg(abcd='stone', efgh='wood', k=INK): each letter of the key is one tone of the ramp, dark -> light;
    a single-letter key maps straight to a colour."""
    out = {'k': INK, 'K': SOFT, 'W': (255, 255, 255, 255)}
    for letters, v in ramps.items():
        if isinstance(v, str) and v in P:
            for i, ch in enumerate(letters):
                out[ch] = col(v, i)
        else:
            out[letters] = col(v) if isinstance(v, str) else v
    return out


def hsh(*n):
    """A fixed integer hash (placement and texture choices; never Python's salted hash())."""
    h = 2166136261
    for v in n:
        h ^= (int(v) & 0xffffffff)
        h = (h * 16777619) & 0xffffffff
        h ^= h >> 13
    return h & 0x7fffffff


def scale(im, k=4):
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


class Sheet:
    """Packs named pictures onto one image, left to right in rows, and remembers each rectangle."""

    def __init__(self, width):
        self.width = width
        self.items = []  # (name, image, frames, fps)
        self.x = 0; self.y = 0; self.rowh = 0
        self.rects = {}
        self.meta = {}

    def add(self, name, im, frames=1, fps=None):
        """`im` is the whole strip (frames side by side)."""
        if self.x + im.width > self.width:
            self.x = 0; self.y += self.rowh; self.rowh = 0
        assert im.width <= self.width, name
        assert im.width % frames == 0, name
        self.rects[name] = (self.x, self.y, im.width // frames, im.height)
        self.meta[name] = (frames, fps)
        self.items.append((name, im, self.x, self.y))
        self.x += im.width
        self.rowh = max(self.rowh, im.height)
        return self.rects[name]

    def newrow(self):
        if self.x:
            self.x = 0; self.y += self.rowh; self.rowh = 0

    def image(self):
        out = new(self.width, self.y + self.rowh)
        for name, im, x, y in self.items:
            out.paste(im, (x, y))
        return out

    def looks(self):
        d = {}
        for name, (x, y, w, h) in self.rects.items():
            frames, fps = self.meta[name]
            e = {'src': [x, y, w, h]}
            if frames > 1:
                e['frames'] = frames
                e['fps'] = fps or 10
            d[name] = e
        return d
