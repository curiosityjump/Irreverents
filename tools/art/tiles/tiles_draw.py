"""Round 2 ground: bevelled blocks, chunky walkable edges, thick ledges, regions and deep ground.

Used by make.py. DRAFT: every picture is a stand-in drawn by a program
(docs/mechanisms/art-pipeline.md); deterministic, whole pixels, alpha 0 or 255.

How a wall joins up: a 16 x 16 fill is two courses of 8 px. Course 0 (rows 0-7) has its joint on
the tile's right edge, so its blocks sit whole inside the tile and a variant may split, re-tone,
chip or mark them freely. Course 1 (rows 8-15) is one 16-wide block crossing the tile's side
edges (x 8..23, i.e. 8..15 here and 0..7 in the next tile), the same in every variant. So every variant joins every other.
"""
from PIL import Image

from common import C, CLEAR, T, mix

INK = C['ink'][0]
INK2 = C['ink'][1]


def new_tile(w=T, h=T):
    return Image.new('RGBA', (w, h), CLEAR)


def put(img, x, y, c):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), c)


def get(img, x, y):
    if 0 <= x < img.width and 0 <= y < img.height:
        return img.getpixel((x, y))
    return CLEAR


def rnd(seed, i):
    """A small fixed hash -> 0..999 (no random module, same every run)."""
    n = (seed * 2654435761 + i * 40503 + 12345) & 0xFFFFFFFF
    n ^= n >> 13
    n = (n * 0x5BD1E995) & 0xFFFFFFFF
    n ^= n >> 15
    return n % 1000


class Ramp:
    """m mortar (darkest), s shade, b body, l light (left bevel), h highlight (top bevel)."""

    def __init__(self, m, s, b, l, h):
        self.m, self.s, self.b, self.l, self.h = m, s, b, l, h

    def shifted(self, t, toward):
        """A re-toned copy (a darker or lighter block) — in-between shades of the same ramp."""
        return Ramp(self.m, mix(self.s, toward.s, t), mix(self.b, toward.b, t), mix(self.l, toward.l, t), mix(self.h, toward.h, t))


def block(img, x0, y0, x1, y1, r, seed=0, specks=2, rounded=True):
    """One bevelled block in [x0, x1) x [y0, y1); its last column and row are the mortar joint.
    Top row highlight, left column light, bottom row and right column shade, corners rounded."""
    ix1, iy1 = x1 - 2, y1 - 2
    for y in range(y0, y1):
        for x in range(x0, x1):
            if x == x1 - 1 or y == y1 - 1:
                c = r.m
            elif rounded and x in (x0, ix1) and y in (y0, iy1):
                c = r.m
            elif y == y0:
                c = r.h
            elif y == iy1 or x == ix1:
                c = r.s
            elif x == x0:
                c = r.l
            else:
                c = r.b
            put(img, x, y, c)
    # a few pits and glints so a block is stone, not plastic
    w, h = ix1 - x0 - 1, iy1 - y0 - 1
    for i in range(specks):
        if w < 3 or h < 2:
            break
        sx = x0 + 1 + rnd(seed, i * 2) % w
        sy = y0 + 1 + rnd(seed, i * 2 + 1) % h
        if sx < x0 + 2 and sy < y0 + 2:
            continue
        put(img, sx, sy, r.s if i % 2 == 0 else r.l)
    # a second highlight pixel next to the top-left corner: a rounder stone
    put(img, x0 + 1, y0 + 1, r.h)


# ---------------------------------------------------------------- a wall of blocks

# Course 0 splits (x ranges inside the tile) per variant; course 1's interior block per variant.
C0 = {
    0: [(0, 16)], 1: [(0, 8), (8, 16)], 2: [(0, 16)], 3: [(0, 10), (10, 16)],
    4: [(0, 16)], 5: [(0, 16)], 6: [(0, 6), (6, 16)], 7: [(0, 16)], 8: [(0, 12), (12, 16)],
}


def wall_fill(ramps, variant, seed=0):
    """ramps: [normal, darker, lighter]. Course 1's crossing block is always ramps[0], seed 7."""
    img = new_tile()
    base, dark, light = ramps
    tones = [base, base, dark, light]
    for i, (a, b) in enumerate(C0[variant]):
        t = tones[rnd(seed * 31 + variant, i) % 4]
        block(img, a, 0, b, 8, t, seed=seed * 97 + variant * 7 + i)
    # course 1: one 16-wide block crossing the tile's sides at x 8, drawn on both sides so its
    # bevel is right; the same in every variant
    block(img, 8, 8, 24, 16, base, seed=7)
    block(img, -8, 8, 8, 16, base, seed=7)
    return img


def open_edges(img, idx, ink=INK, lit=None, shade=None):
    """Open sides get an ink line, a lit or shaded line inside it, rounded outer corners and a
    notch at each joint, so the silhouette reads as separate blocks."""
    n, e, s, w = idx & 1, idx & 2, idx & 4, idx & 8
    if not w:
        for y in range(T):
            put(img, 0, y, ink)
            if lit and get(img, 1, y)[:3] != ink[:3]:
                put(img, 1, y, lit)
        for y in (7, 15):
            if y == 15 and not s:
                continue
            put(img, 0, y, CLEAR)
            put(img, 1, y, ink)
    if not e:
        for y in range(T):
            put(img, 15, y, ink)
            if shade:
                put(img, 14, y, shade)
        for y in (7, 15):
            if y == 15 and not s:
                continue
            put(img, 15, y, CLEAR)
            put(img, 14, y, ink)
    if not s:
        for x in range(T):
            put(img, x, 15, ink)
            if shade and (w or x > 1) and (e or x < 14):
                put(img, x, 14, shade)
        for x in (7,):
            put(img, x, 15, CLEAR)
            put(img, x, 14, ink)
        if not w:
            put(img, 0, 15, CLEAR)
            put(img, 0, 14, CLEAR)
            put(img, 1, 15, CLEAR)
            put(img, 1, 14, ink)
            put(img, 1, 13, ink)
            put(img, 2, 14, ink)
        if not e:
            put(img, 15, 15, CLEAR)
            put(img, 15, 14, CLEAR)
            put(img, 14, 15, CLEAR)
            put(img, 14, 14, ink)
            put(img, 14, 13, ink)
            put(img, 13, 14, ink)
    if not n:
        # the top is painted by the theme's lip; round the outer top corners of the body
        if not w:
            put(img, 0, 0, CLEAR)
        if not e:
            put(img, 15, 0, CLEAR)


def lip_ends(img, idx, depth, ink=INK):
    """Round the lip's outer corners where a side is open."""
    e, w = idx & 2, idx & 8
    if not w:
        put(img, 0, 0, CLEAR)
        put(img, 1, 0, CLEAR)
        put(img, 0, 1, CLEAR)
        put(img, 1, 1, ink)
        for y in range(2, depth):
            put(img, 0, y, ink)
    if not e:
        put(img, 15, 0, CLEAR)
        put(img, 14, 0, CLEAR)
        put(img, 15, 1, CLEAR)
        put(img, 14, 1, ink)
        for y in range(2, depth):
            put(img, 15, y, ink)


def stamp(img, x0, y0, rows, key):
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch != '.':
                put(img, x0 + dx, y0 + dy, key[ch])


def circle(img, cx, cy, r, c, wrap=False):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.6:
                if wrap:
                    put(img, x % T, y, c)
                else:
                    put(img, x, y, c)


# ---------------------------------------------------------------- ledges you jump up through

def plank_ledge(kind, W, ink=INK):
    """A wooden ledge, 7 px of plank and a one-row shadow; end caps carry a post and a brace.
    The standing surface is the tile's top edge (collision is the tile)."""
    img = new_tile()
    left = kind in ('left', 'single')
    right = kind in ('right', 'single')
    for x in range(T):
        put(img, x, 0, ink)
        put(img, x, 1, W[3])
        for y in (2, 3, 4):
            put(img, x, y, W[2])
        put(img, x, 5, W[1])
        put(img, x, 6, ink)
        if 1 <= x <= 14:
            put(img, x, 7, INK2)
    # grain and a plank joint with nails
    for x, y in ((3, 3), (4, 3), (12, 2), (13, 2), (10, 4)):
        put(img, x, y, mix(W[1], W[2], 0.5))
    for y in range(1, 6):
        put(img, 7, y, W[0])
    put(img, 8, 1, W[3])
    for nx in (5, 9):
        put(img, nx, 2, INK2)
        put(img, nx, 4, INK2)
    if left:
        for y in range(0, 7):
            put(img, 0, y, ink)
        put(img, 0, 0, CLEAR)
        put(img, 1, 0, ink)
        put(img, 0, 6, CLEAR)
        put(img, 1, 6, ink)
        put(img, 1, 1, W[3])
        # post and brace under the end
        for y in range(7, 15):
            put(img, 2, y, ink)
            put(img, 3, y, W[2])
            put(img, 4, y, W[1])
            put(img, 5, y, ink)
        for x in range(2, 6):
            put(img, x, 15, ink)
        for i in range(6):
            bx, by = 5 + i, 12 - i
            put(img, bx, by, W[1])
            put(img, bx + 1, by, W[2])
            put(img, bx, by + 1, ink)
            put(img, bx + 2, by, ink)
    if right:
        for y in range(0, 7):
            put(img, 15, y, ink)
        put(img, 15, 0, CLEAR)
        put(img, 14, 0, ink)
        put(img, 15, 6, CLEAR)
        put(img, 14, 6, ink)
        for y in range(7, 15):
            put(img, 13, y, ink)
            put(img, 12, y, W[2])
            put(img, 11, y, W[1])
            put(img, 10, y, ink)
        for x in range(10, 14):
            put(img, x, 15, ink)
        for i in range(6):
            bx, by = 10 - i, 12 - i
            put(img, bx, by, W[1])
            put(img, bx - 1, by, W[2])
            put(img, bx, by + 1, ink)
            put(img, bx - 2, by, ink)
    if left or right:
        for x in range(T):
            if get(img, x, 7) == INK2 and ((left and x < 2) or (right and x > 13)):
                put(img, x, 7, CLEAR)
    return img


def stone_shelf(kind, r, ink=INK):
    """A stone shelf: lit top, dressed slabs, shaded underside, a corbel bracket under each end."""
    img = new_tile()
    left = kind in ('left', 'single')
    right = kind in ('right', 'single')
    for x in range(T):
        put(img, x, 0, ink)
        put(img, x, 1, r.h)
        put(img, x, 2, r.l)
        for y in (3, 4):
            put(img, x, y, r.b)
        put(img, x, 5, r.s)
        put(img, x, 6, ink)
        if 1 <= x <= 14:
            put(img, x, 7, INK2)
    for jx in (7, 15):
        for y in range(1, 6):
            put(img, jx, y, r.m)
    put(img, 0, 1, r.h)
    for x, y in ((3, 3), (11, 4), (12, 3)):
        put(img, x, y, r.l)

    def corbel(xs, flip):
        rows = ['#########.', '#hlbbbs#..', '#lbbs##...', '#bbs#.....', '#bs#......', '#s#.......', '##........']
        key = {'#': ink, 'h': r.h, 'l': r.l, 'b': r.b, 's': r.s}
        for dy, row in enumerate(rows):
            for dx, ch in enumerate(row):
                if ch != '.':
                    x = xs + (len(row) - 1 - dx if flip else dx)
                    put(img, x, 7 + dy, key[ch])
    if left:
        for y in range(0, 7):
            put(img, 0, y, ink)
        put(img, 0, 0, CLEAR)
        put(img, 1, 1, r.h)
        corbel(1, False)
    if right:
        for y in range(0, 7):
            put(img, 15, y, ink)
        put(img, 15, 0, CLEAR)
        corbel(5, True)
    return img
