"""Draws the tiles lane's pictures and writes its content files.

    python3 -I tools/art/tiles/make.py

Rewrites assets/tiles/*.png, assets/backdrops/*.png, content/atlases/*.json and
content/backdrops/*.json. Same bytes every run.

DRAFT: every picture here is a stand-in drawn by this program; a delivered sheet from the
asset desk replaces one by editing the content file (docs/mechanisms/art-pipeline.md).
"""
import json
import math
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

from common import (ASSETS, C, CLEAR, CONTENT, FILL, INNER, ONEWAY, ORIGIN, SHEET, T,  # noqa: E402
                    TOP_CELLS, UNDER_CELLS, WALL_CELLS, mix, rgb)


def new_tile():
    return Image.new('RGBA', (T, T), CLEAR)


def put(img, x, y, c):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), c)


def stamp(img, x0, y0, rows, key):
    """Hand-placed pixels: `rows` of characters, `key` maps a character to a colour ('.' skips)."""
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch != '.':
                put(img, x0 + dx, y0 + dy, key[ch])


# ---------------------------------------------------------------- stone blocks

def blocks(body, hi, mortar, variant=0, alt_dark=None, alt_light=None, rounded=False, extra=None, split4=True):
    """A 16 x 16 fill of dressed blocks, two courses of 8 px. Course 0 has its joint on the
    tile's right edge (a block that sits whole inside the tile, so a variant may re-tone or
    split it); course 1's block crosses the tile edge and is the same in every variant, which
    is what lets every variant join every other."""
    img = new_tile()
    tone0 = body
    split = False
    if variant == 1:
        split = True
    elif variant == 2 and alt_dark:
        tone0 = alt_dark
    elif variant == 3 and alt_light:
        tone0 = alt_light
    elif variant == 4:
        split = split4
        tone0 = alt_light or body
    for y in range(T):
        for x in range(T):
            c = body
            if y < 8:
                c = tone0
                if y == 7 or x == 15 or (split and x == 7):
                    c = mortar
                elif y == 0:
                    c = mix(tone0, hi, 0.75) if tone0 != body else hi
            else:
                if y == 15 or x == 7:
                    c = mortar
                elif y == 8:
                    c = hi
            put(img, x, y, c)
    if rounded:
        ends0 = [(0, 14)] if not split else [(0, 6), (8, 14)]
        for a, b in ends0:
            for x, y in ((a, 0), (b, 0), (a, 6), (b, 6)):
                put(img, x, y, mortar)
        for x, y in ((8, 8), (6, 8), (8, 14), (6, 14)):
            put(img, x, y, mortar)
    if extra:
        extra(img, variant)
    return img


def stone_edges(img, idx, outline, lit, shade, notch=False):
    """The open sides of a block tile: a dark line outside, a lit line on the left, shade on
    the right and underneath (light from the top-left). The top lip is painted afterwards."""
    n, e, s, w = idx & 1, idx & 2, idx & 4, idx & 8
    if not w:
        for y in range(T):
            put(img, 0, y, outline)
            put(img, 1, y, lit)
    if not e:
        for y in range(T):
            put(img, 15, y, outline)
            put(img, 14, y, shade)
    if not s:
        for x in range(T):
            put(img, x, 15, outline)
            if (w or x > 0) and (e or x < 15):
                put(img, x, 14, shade)
    if notch:
        # A worn joint: the silhouette steps in one pixel at the course line.
        if not w:
            put(img, 0, 7, CLEAR)
            put(img, 1, 7, outline)
        if not e:
            put(img, 15, 7, CLEAR)
            put(img, 14, 7, outline)
        if not s:
            put(img, 7, 15, CLEAR)
            put(img, 7, 14, outline)
    if not s and not w:
        put(img, 0, 15, CLEAR)
        put(img, 1, 14, outline)
    if not s and not e:
        put(img, 15, 15, CLEAR)
        put(img, 14, 14, outline)


def flat_lip(img, idx, rows, left, right):
    """A straight trim along a walkable top: `rows` top to bottom; the end pixels take `left`
    (lit) or `right` (shade) where that side is open, and the corner is rounded off."""
    n, e, w = idx & 1, idx & 2, idx & 8
    if n:
        return
    for y, c in enumerate(rows):
        for x in range(T):
            put(img, x, y, c)
    last = len(rows) - 1
    if not w:
        for y in range(1, last):
            put(img, 0, y, left)
        put(img, 0, 0, CLEAR)
    if not e:
        for y in range(1, last):
            put(img, 15, y, right)
        put(img, 15, 0, CLEAR)


# ---------------------------------------------------------------- theme: grass and old stone

G = C['grass']
ST = C['stone']
GRASS_DEPTH = [5, 6, 6, 5, 4, 5, 6, 7, 7, 6, 5, 4, 5, 6, 6, 5]
GRASS_LIGHT_ROW1 = {1, 2, 6, 9, 10, 13}


class Ruins:
    name = 'grass-ruins'
    indoor = False
    body = ST[2]
    hi = mix(ST[2], ST[3], 0.55)
    mortar = mix(ST[1], ST[2], 0.35)
    dark = mix(ST[1], ST[2], 0.7)
    light = mix(ST[2], ST[3], 0.3)
    outline = ST[0]
    lit = ST[3]
    shade = ST[1]

    def fill(self, v):
        def extra(img, variant):
            F = C['foliage']
            k = {'m': mix(F[1], self.body, 0.45), 'M': mix(F[2], self.body, 0.4)}
            if variant == 2:
                stamp(img, 2, 6, ['.M..', 'mMMm'], k)
            if variant == 4:
                stamp(img, 10, 14, ['.M.', 'mMm'], k)
        return blocks(self.body, self.hi, self.mortar, v, self.dark, self.light, extra=extra)

    def lip(self, img, idx):
        n, e, w = idx & 1, idx & 2, idx & 8
        if n:
            return
        for x in range(T):
            d = GRASS_DEPTH[x]
            for y in range(0, d + 1):
                if y == 0:
                    c = G[3]
                elif y == 1:
                    c = G[3] if x in GRASS_LIGHT_ROW1 else G[2]
                elif y == 2:
                    c = G[2]
                elif y < d:
                    c = G[1]
                else:
                    c = G[0]
                put(img, x, y, c)
            if idx & 4 or d + 1 < 14:
                put(img, x, d + 1, self.shade)
        if not w:
            put(img, 0, 0, CLEAR)
            put(img, 0, 1, G[3])
        if not e:
            put(img, 15, 0, CLEAR)
            for y in range(1, GRASS_DEPTH[15]):
                put(img, 15, y, G[1])
            put(img, 14, 1, G[2])

    def tile(self, idx, v=0):
        img = self.fill(v)
        stone_edges(img, idx, self.outline, self.lit, self.shade, notch=True)
        self.lip(img, idx)
        return img

    lip_depth = 7

    def inner(self, corner):
        img = new_tile()
        if corner == 'ne':
            for y in range(self.lip_depth):
                put(img, 15, y, self.outline)
                put(img, 14, y, self.shade)
        elif corner == 'nw':
            for y in range(self.lip_depth):
                put(img, 0, y, self.outline)
                put(img, 1, y, self.lit)
        elif corner == 'se':
            stamp(img, 13, 13, ['..s', '.ss', 'sso'], {'s': self.shade, 'o': self.outline})
        else:
            stamp(img, 0, 13, ['s..', 'sl.', 'ols'], {'s': self.shade, 'o': self.outline, 'l': self.lit})
        return img

    def tops(self):
        k = {'a': G[3], 'b': G[2], 'c': G[1], 'd': G[0], 'w': C['cloud'][1], 'y': C['gold'][2], 'p': C['cloud'][0]}
        a = new_tile()
        stamp(a, 3, 12, ['a...a.', 'b.a.b.', 'bab.ba', 'cbbcbb'], k)
        b = new_tile()
        stamp(b, 9, 13, ['.a..', 'ab.a', 'bbcb'], k)
        stamp(b, 2, 14, ['a.', 'ba'], k)
        c = new_tile()
        stamp(c, 5, 10, ['.w.', 'wyw', '.w.', '.b.', '.c.', 'acb'], k)
        stamp(c, 11, 14, ['.a', 'ab'], k)
        d = new_tile()
        stamp(d, 6, 11, ['..a..', 'a.b..', 'b.b.a', 'bab.b', 'cbbcb'], k)
        return [a, b, c, d]

    top_list = [0, 1, 0, 1, 2, 3, None, None, None, None]

    def unders(self):
        F = C['foliage']
        k = {'a': F[3], 'b': F[2], 'c': F[1], 'd': F[0]}
        a = new_tile()
        stamp(a, 3, 0, ['cbc.', 'cbb.', '.bc.', '.ab.', '.cb.', '..b.', '..a.'], k)
        stamp(a, 10, 0, ['bc', 'cb', '.b', '.a'], k)
        b = new_tile()
        stamp(b, 6, 0, ['.cbc', '.bbc', 'cb..', 'ba..', 'a...'], k)
        stamp(b, 12, 0, ['cb', 'b.', 'a.'], k)
        return [a, b]

    under_list = [0, 1, None, None, None]

    def oneway(self, kind):
        return plank(kind, C['wood'])

    def walls(self):
        return []


def plank(kind, W, joint=7):
    """A thin wooden ledge: bright on top, nothing underneath, so it reads as a thing to jump
    up through. `kind` is its place in a run."""
    img = new_tile()
    rows = [W[3], W[2], W[2], W[1], W[0]]
    for y, c in enumerate(rows):
        for x in range(T):
            put(img, x, y, c)
    for y in (1, 2, 3):
        put(img, joint, y, W[1] if y < 3 else W[0])
        put(img, 15, y, W[1] if y < 3 else W[0])
    put(img, 3, 2, W[1])
    put(img, 11, 2, W[1])
    left = kind in ('left', 'single')
    right = kind in ('right', 'single')
    if left:
        for y in range(5):
            put(img, 0, y, W[0])
        put(img, 0, 0, CLEAR)
        put(img, 0, 4, CLEAR)
        put(img, 1, 0, W[3])
        # a short tie under the end, so an end looks finished
        stamp(img, 1, 5, ['oo', '.o'], {'o': W[0]})
        put(img, 2, 5, W[1])
    if right:
        for y in range(5):
            put(img, 15, y, W[0])
        put(img, 15, 0, CLEAR)
        put(img, 15, 4, CLEAR)
        stamp(img, 13, 5, ['oo', 'o.'], {'o': W[0]})
        put(img, 13, 5, W[1])
    return img


# ---------------------------------------------------------------- theme: royal castle interior

CA = C['castle']
CR = C['cream']


class Castle:
    name = 'castle'
    indoor = True
    body = CA[2]
    hi = mix(CA[2], CA[3], 0.45)
    mortar = mix(CA[1], CA[2], 0.4)
    dark = mix(CA[1], CA[2], 0.78)
    light = mix(CA[2], CA[3], 0.22)
    outline = CA[0]
    lit = CA[3]
    shade = CA[1]
    lip_rows = [rgb('#ffffff'), CR[2], CR[2], CR[1], CA[0]]
    lip_depth = 5

    def fill(self, v):
        def extra(img, variant):
            pass
        return blocks(self.body, self.hi, self.mortar, v, self.dark, self.light, extra=extra)

    def tile(self, idx, v=0):
        img = self.fill(v)
        stone_edges(img, idx, self.outline, self.lit, self.shade)
        flat_lip(img, idx, self.lip_rows, CR[2], CR[0])
        return img

    def inner(self, corner):
        img = new_tile()
        if corner == 'ne':
            for y in range(self.lip_depth):
                put(img, 15, y, self.outline)
                put(img, 14, y, self.shade)
        elif corner == 'nw':
            for y in range(self.lip_depth):
                put(img, 0, y, self.outline)
                put(img, 1, y, self.lit)
        elif corner == 'se':
            stamp(img, 13, 13, ['..s', '.ss', 'sso'], {'s': self.shade, 'o': self.outline})
        else:
            stamp(img, 0, 13, ['s..', 'sl.', 'ols'], {'s': self.shade, 'o': self.outline, 'l': self.lit})
        return img

    def tops(self):
        # Indoors nothing grows: a little grit on the trim, rarely.
        k = {'a': CA[3], 'b': CA[1], 'c': CA[1]}
        a = new_tile()
        stamp(a, 4, 15, ['ab'], k)
        b = new_tile()
        stamp(b, 10, 14, ['.a.', 'abc'], k)
        return [a, b]

    top_list = [0, 1, None, None, None, None, None, None, None, None, None, None]

    def unders(self):
        # A row of small teeth under a ledge (dentils), dim so it stays behind the trim.
        k = {'a': CA[1], 'b': CA[0]}
        a = new_tile()
        for x in (1, 5, 9, 13):
            stamp(a, x, 0, ['aa', 'ab'], k)
        return [a]

    under_list = [0]

    def oneway(self, kind):
        img = new_tile()
        rows = [rgb('#ffffff'), CR[2], CR[1], CA[3], CA[1]]
        for y, c in enumerate(rows):
            for x in range(T):
                put(img, x, y, c)
        for x in range(T):
            if x % 4 in (1, 2):
                put(img, x, 5, CA[1])
        left = kind in ('left', 'single')
        right = kind in ('right', 'single')
        if left:
            put(img, 0, 0, CLEAR)
            put(img, 0, 4, CLEAR)
            put(img, 0, 5, CLEAR)
            put(img, 1, 5, CLEAR)
            for y in (1, 2, 3):
                put(img, 0, y, CR[2])
        if right:
            put(img, 15, 0, CLEAR)
            put(img, 15, 4, CLEAR)
            put(img, 14, 5, CLEAR)
            for y in (1, 2, 3):
                put(img, 15, y, CR[0])
        return img

    wall_body = mix(CA[0], CA[1], 0.4)
    wall_hi = mix(CA[0], CA[1], 0.55)
    wall_mortar = CA[0]
    wall_dark = mix(CA[0], CA[1], 0.28)

    def walls(self):
        return [blocks(self.wall_body, self.wall_hi, self.wall_mortar, v, self.wall_dark, self.wall_body) for v in (0, 1, 2, 0)]


# ---------------------------------------------------------------- theme: dark cellar

NI = C['night']


class Cellar:
    name = 'cellar'
    indoor = True
    body = NI[2]
    hi = mix(NI[2], NI[3], 0.7)
    mortar = NI[1]
    dark = mix(NI[1], NI[2], 0.6)
    light = mix(NI[2], NI[3], 0.35)
    outline = NI[0]
    lit = NI[3]
    shade = NI[1]
    lip_rows = [CA[3], CA[2], CA[1], NI[0]]
    lip_depth = 4

    def fill(self, v):
        def extra(img, variant):
            F = C['foliage']
            if variant == 2:
                stamp(img, 3, 10, ['mm.', 'mMm'], {'m': mix(F[0], self.body, 0.45), 'M': mix(F[1], self.body, 0.45)})
        return blocks(self.body, self.hi, self.mortar, v, self.dark, self.light, rounded=True, extra=extra, split4=False)

    def tile(self, idx, v=0):
        img = self.fill(v)
        stone_edges(img, idx, self.outline, self.lit, self.shade, notch=True)
        flat_lip(img, idx, self.lip_rows, CA[3], CA[1])
        if not idx & 1:
            # worn: the second row of the lip is uneven
            for x in (2, 3, 8, 12, 13):
                put(img, x, 2, CA[2] if x in (3, 12) else NI[3])
        return img

    inner = Castle.inner

    def tops(self):
        k = {'a': CA[2], 'b': CA[1], 'c': NI[3], 'm': mix(C['foliage'][1], NI[2], 0.3), 'M': mix(C['foliage'][2], NI[2], 0.3)}
        a = new_tile()
        stamp(a, 4, 14, ['.a.', 'bbc'], k)
        b = new_tile()
        stamp(b, 9, 14, ['.mM.', 'mMMm'], k)
        c = new_tile()
        stamp(c, 11, 15, ['bc'], k)
        stamp(c, 3, 15, ['a'], k)
        return [a, b, c]

    top_list = [0, 1, 2, None, None, None, None, None]

    def unders(self):
        k = {'a': NI[3], 'b': NI[2], 'c': NI[1], }
        a = new_tile()
        stamp(a, 4, 0, ['bbb', 'bab', '.b.', '.b.', '.a.'], k)
        stamp(a, 11, 0, ['bb', '.b'], k)
        b = new_tile()
        stamp(b, 7, 0, ['bab', '.b.', '.a.'], k)
        return [a, b]

    under_list = [0, 1, None, None, None]

    def oneway(self, kind):
        W = C['wood']
        return plank(kind, [mix(W[0], NI[0], 0.3), W[0], W[1], W[2]], joint=9)

    wall_body = mix(NI[0], NI[1], 0.55)
    wall_hi = mix(NI[0], NI[1], 0.85)
    wall_mortar = NI[0]
    wall_dark = mix(NI[0], NI[1], 0.35)

    def walls(self):
        return [blocks(self.wall_body, self.wall_hi, self.wall_mortar, v, self.wall_dark, self.wall_body, rounded=True) for v in (0, 1, 2, 0)]


# ---------------------------------------------------------------- theme: town street

WD = C['wood']
COB = ['DLLLLLDD', 'LBBBBBSD', 'DSSSSSDD', 'DDDDDDDD']


class Town:
    """One material cannot be cobbles here and roof tiles there (an atlas has one 4 x 4
    block), so the walkable top of everything is the same course of rounded slates: on the
    street it reads as cobbles, on a building as its tiled roof. Under a roof the building is
    cream plaster in a timber frame: posts on open sides, a beam along an open underside."""
    name = 'town'
    indoor = False
    plaster = CR[2]
    plaster_shade = mix(CR[1], CR[2], 0.45)
    speck = mix(CR[1], CR[2], 0.7)
    outline = WD[0]
    ridge = [mix(ST[3], rgb('#ffffff'), 0.6), ST[3], ST[2], ST[0]]
    lip_depth = 4
    cob = {'D': mix(ST[1], ST[2], 0.25), 'L': ST[3], 'B': ST[2], 'S': mix(ST[1], ST[2], 0.6)}

    def scales(self, img, y0, y1):
        for y in range(y0, y1):
            r = (y - 4) // 4
            o = 4 if r % 2 else 0
            for x in range(T):
                put(img, x, y, self.cob[COB[(y - 4) % 4][(x - o) % 8]])

    def fill(self, v):
        img = new_tile()
        for y in range(T):
            for x in range(T):
                put(img, x, y, self.plaster_shade if y == 0 else self.plaster)
        for x, y in ((3, 4), (11, 7), (6, 12), (13, 13), (2, 9)):
            put(img, x, y, self.speck)
        if v == 1:
            stamp(img, 3, 6, ['.ss.', 'ssss', '.sss'], {'s': self.speck})
        elif v == 2:
            stamp(img, 9, 3, ['ll.', 'lll'], {'l': mix(self.plaster, rgb('#ffffff'), 0.35)})
        elif v == 3:
            stamp(img, 8, 9, ['sss.', '.sss'], {'s': self.speck})
        elif v == 4:
            stamp(img, 4, 10, ['ll', 'll'], {'l': mix(self.plaster, rgb('#ffffff'), 0.35)})
        return img

    def tile(self, idx, v=0):
        n, e, s, w = idx & 1, idx & 2, idx & 4, idx & 8
        img = self.fill(v)
        if not n:
            # roof / cobbles
            for y, c in enumerate(self.ridge):
                for x in range(T):
                    put(img, x, y, c)
            for x in (7, 15):
                put(img, x, 1, ST[2])
                put(img, x, 2, ST[1])
            if s:
                self.scales(img, 4, 16)
            else:
                self.scales(img, 4, 12)
                for x in range(T):
                    put(img, x, 12, ST[0])
                    put(img, x, 13, WD[2])
                    put(img, x, 14, WD[1])
                    put(img, x, 15, WD[0])
            lo = 15 if s else 12
            if not w:
                for y in range(1, lo + 1):
                    put(img, 0, y, ST[0])
                put(img, 0, 0, CLEAR)
                put(img, 1, 0, self.ridge[0])
                if not s:
                    put(img, 0, 15, CLEAR)
                    put(img, 0, 13, WD[0])
                    put(img, 0, 14, WD[0])
            if not e:
                for y in range(1, lo + 1):
                    put(img, 15, y, ST[0])
                put(img, 15, 0, CLEAR)
                if not s:
                    put(img, 15, 15, CLEAR)
                    put(img, 15, 13, WD[0])
                    put(img, 15, 14, WD[0])
            return img
        # plaster in a timber frame
        if not w:
            for y in range(T):
                stamp(img, 0, y, ['oabb'], {'o': WD[0], 'a': WD[3], 'b': WD[2]})
                put(img, 4, y, self.plaster_shade)
        if not e:
            for y in range(T):
                stamp(img, 12, y, ['abbo'], {'o': WD[0], 'a': WD[2], 'b': WD[1]})
        if not s:
            for x in range(T):
                put(img, x, 11, self.plaster_shade)
                put(img, x, 12, WD[2])
                put(img, x, 13, WD[1])
                put(img, x, 14, WD[1])
                put(img, x, 15, WD[0])
            for x in (3, 11):
                put(img, x, 13, WD[0])
            if not w:
                put(img, 0, 15, CLEAR)
                for y in (12, 13, 14):
                    put(img, 0, y, WD[0])
            if not e:
                put(img, 15, 15, CLEAR)
                for y in (12, 13, 14):
                    put(img, 15, y, WD[0])
        return img

    def inner(self, corner):
        img = new_tile()
        if corner == 'ne':
            for y in range(self.lip_depth):
                stamp(img, 12, y, ['abbo'], {'o': WD[0], 'a': WD[2], 'b': WD[1]})
        elif corner == 'nw':
            for y in range(self.lip_depth):
                stamp(img, 0, y, ['oabb'], {'o': WD[0], 'a': WD[3], 'b': WD[2]})
        elif corner == 'se':
            stamp(img, 12, 12, ['abbb', 'bbbb', 'bbbb', 'bbbo'], {'o': WD[0], 'a': WD[2], 'b': WD[1]})
        else:
            stamp(img, 0, 12, ['aaab', 'abbb', 'abbb', 'obbb'], {'o': WD[0], 'a': WD[2], 'b': WD[1]})
        return img

    def tops(self):
        F = C['foliage']
        k = {'a': F[3], 'b': F[2], 'c': F[1], 's': ST[3], 't': ST[1]}
        a = new_tile()
        stamp(a, 5, 14, ['a.a', 'bcb'], k)
        b = new_tile()
        stamp(b, 10, 15, ['st'], k)
        return [a, b]

    top_list = [0, 1, None, None, None, None, None, None]

    def unders(self):
        k = {'a': WD[1], 'o': WD[0]}
        a = new_tile()
        stamp(a, 2, 0, ['aao', '.ao'], k)
        stamp(a, 11, 0, ['aao', '.ao'], k)
        return [a]

    under_list = [0]

    def oneway(self, kind):
        return plank(kind, C['wood'])

    def walls(self):
        return []


THEMES = [Ruins(), Town(), Castle(), Cellar()]


def build_sheet(theme):
    sheet = Image.new('RGBA', (SHEET, SHEET), CLEAR)

    def place(img, cell):
        sheet.paste(img, (cell[0] * T, cell[1] * T))

    for idx in range(16):
        place(theme.tile(idx, 0), [ORIGIN[0] + idx % 4, ORIGIN[1] + idx // 4])
    for v, cell in enumerate(FILL):
        if v:
            place(theme.tile(15, v), cell)
    for corner, cell in INNER.items():
        place(theme.inner(corner), cell)
    for img, cell in zip(theme.tops(), TOP_CELLS):
        place(img, cell)
    for img, cell in zip(theme.unders(), UNDER_CELLS):
        place(img, cell)
    for kind, cell in ONEWAY.items():
        place(theme.oneway(kind), cell)
    for img, cell in zip(theme.walls(), WALL_CELLS):
        place(img, cell)
    return sheet


# ---------------------------------------------------------------- backdrops

W = 320


def canvas(h):
    return Image.new('RGBA', (W, h), CLEAR)


def discs_mask(h, discs, flat=None):
    """A wrap-around mask from a union of discs (cx, cy, r); `flat` cuts everything below a row."""
    m = [[False] * W for _ in range(h)]
    for cx, cy, r in discs:
        for y in range(max(0, cy - r), min(h, cy + r + 1)):
            if flat is not None and y > flat(cx):
                continue
            for dx in range(-r, r + 1):
                if dx * dx + (y - cy) * (y - cy) <= r * r + r // 2:
                    m[y][(cx + dx) % W] = True
    return m


def make_clouds():
    h = 72
    img = canvas(h)
    clouds = [  # (x of left end, row of flat bottom, puffs as (dx, r))
        (14, 30, [(8, 7), (20, 11), (34, 8), (44, 5)]),
        (96, 52, [(6, 5), (15, 8), (26, 6)]),
        (150, 22, [(7, 6), (18, 9), (30, 12), (46, 8), (57, 5)]),
        (232, 46, [(8, 6), (19, 9), (31, 6)]),
        (276, 18, [(5, 4), (13, 6), (22, 4)]),
        (60, 14, [(4, 3), (10, 5), (17, 3)]),
    ]
    white, shade = C['cloud'][1], C['cloud'][0]
    for x0, base, puffs in clouds:
        discs = [(x0 + dx, base - r + 2, r) for dx, r in puffs]
        m = discs_mask(h, discs)
        lo = x0 + puffs[0][0] - puffs[0][1]
        hi = x0 + puffs[-1][0] + puffs[-1][1]
        for y in range(h):
            for x in range(lo, hi + 1):
                xx = x % W
                if y <= base and m[y][xx]:
                    under = y >= base - 1 or not (m[min(h - 1, y + 3)][(xx + 2) % W] and y + 3 <= base)
                    img.putpixel((xx, y), shade if under else white)
    return img


def domes(h, base, items):
    """Rounded hills: row of the hill top for every x (wraps)."""
    top = [base] * W
    for cx, hw, hh in items:
        for dx in range(-hw, hw + 1):
            y = base - int(round(hh * math.sqrt(max(0.0, 1 - (dx / hw) ** 2))))
            x = (cx + dx) % W
            top[x] = min(top[x], y)
    return top


def fill_below(img, top, colour, rim=None):
    for x in range(W):
        for y in range(max(0, top[x]), img.height):
            img.putpixel((x, y), rim if rim and y == top[x] else colour)


def rect(img, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            if 0 <= yy < img.height:
                img.putpixel((xx % W, yy), c)


def cone(img, x, y, w, h, c, c2=None):
    """A pointed roof: apex at the top centre of the box."""
    for i in range(h):
        half = (w * (i + 1)) // (2 * h)
        cx = x + w // 2
        for xx in range(cx - half, cx + half + (w % 2)):
            if 0 <= y + i < img.height:
                img.putpixel((xx % W, y + i), c2 if c2 and xx >= cx + 1 else c)


def tower(img, x, top, w, bottom, body, lit, roof=None, roof2=None, crenel=True):
    rect(img, x, top, w, bottom - top, body)
    rect(img, x, top, 2, bottom - top, lit)
    if roof:
        cone(img, x - 2, top - w, w + 4, w, roof, roof2)
    elif crenel:
        for xx in range(x, x + w, 6):
            rect(img, xx, top - 3, 3, 3, body)


def make_far_hills():
    h = 96
    img = canvas(h)
    F = C['far']
    back = domes(h, 70, [(40, 70, 34), (150, 90, 44), (262, 64, 30), (318, 50, 22)])
    fill_below(img, back, F[1])
    # a distant castle on the highest hill, same tone: only its shape shows
    for x, top, w in ((132, 16, 8), (150, 8, 10), (170, 18, 8)):
        tower(img, x, top, w, 40, F[1], mix(F[1], F[2], 0.6), roof=F[1])
    rect(img, 136, 24, 40, 16, F[1])
    front = domes(h, 86, [(0, 60, 26), (96, 76, 34), (214, 84, 38), (290, 40, 18)])
    fill_below(img, front, F[0], rim=mix(F[0], F[1], 0.5))
    return img


def make_far_castle():
    """The castle over the town: big, pale, far away."""
    h = 128
    img = canvas(h)
    F = C['far']
    hill = domes(h, 112, [(160, 150, 58), (20, 70, 26), (300, 70, 26)])
    fill_below(img, hill, F[0], rim=mix(F[0], F[1], 0.5))
    body, lit = F[1], F[2]
    roof, roof2 = mix(F[0], C['blue'][3], 0.35), mix(F[0], C['blue'][2], 0.2)
    rect(img, 104, 44, 112, 30, body)  # curtain wall
    for xx in range(104, 216, 8):
        rect(img, xx, 40, 4, 4, body)
    tower(img, 96, 34, 16, 76, body, lit, roof, roof2)
    tower(img, 208, 34, 16, 76, body, lit, roof, roof2)
    tower(img, 140, 16, 14, 60, body, lit, roof, roof2)
    tower(img, 170, 22, 12, 60, body, lit, roof, roof2)
    tower(img, 152, 4, 18, 60, body, lit, roof, roof2)  # the keep
    arch = mix(F[0], F[1], 0.4)
    rect(img, 154, 58, 12, 16, arch)
    for xx, yy in ((158, 30), (146, 36), (174, 40), (102, 50), (214, 50)):
        rect(img, xx, yy, 2, 4, arch)
    # two small flags
    rect(img, 161, 0, 1, 4, body)
    rect(img, 162, 0, 4, 2, mix(F[0], C['red'][3], 0.45))
    return img


def make_castle_mid():
    """Courtyard: an old wall with broken crenellations and round trees, pale."""
    h = 112
    img = canvas(h)
    far = C['far'][2]
    body = mix(ST[3], far, 0.45)
    lit = mix(ST[3], rgb('#ffffff'), 0.4)
    shade = mix(ST[2], far, 0.45)
    wall_top = 52
    rect(img, 0, wall_top, W, h - wall_top, body)
    for i, xx in enumerate(range(0, W, 16)):
        if i % 7 in (3, 4):
            continue  # a gap where the wall has crumbled
        rect(img, xx + 2, wall_top - 6, 9, 6, body)
        rect(img, xx + 2, wall_top - 6, 9, 1, lit)
    rect(img, 0, wall_top, W, 1, lit)
    for x, top, w in ((36, 20, 34), (212, 30, 28)):
        rect(img, x, top, w, h - top, body)
        rect(img, x, top, w, 1, lit)
        rect(img, x + w - 4, top + 1, 4, h - top, shade)
        for xx in range(x, x + w - 3, 8):
            rect(img, xx, top - 5, 5, 5, body)
            rect(img, xx, top - 5, 5, 1, lit)
        rect(img, x + w // 2 - 2, top + 12, 4, 9, shade)  # a slit window
    # block hints, sparse and regular
    for yy in range(wall_top + 8, h, 12):
        for xx in range(((yy // 12) % 2) * 12, W, 24):
            rect(img, xx, yy, 7, 1, shade)
    # open arches through the wall
    for ax in (104, 152, 280):
        for yy in range(70, h):
            for xx in range(ax, ax + 22):
                dx = xx - ax - 10.5
                if yy >= 81 or dx * dx + (yy - 81) ** 2 <= 11.2 ** 2:
                    img.putpixel((xx % W, yy), CLEAR)
    # trees in front of the wall
    FO = C['foliage']
    leaf = mix(FO[3], far, 0.5)
    leaf2 = mix(FO[2], far, 0.55)
    trees = ((14, 74, 17), (0, 86, 14), (186, 80, 15), (200, 92, 12), (300, 78, 16), (318, 92, 13), (84, 96, 11), (252, 98, 10))
    for cx, cy, r in trees:
        rect(img, cx - 1, cy + r - 2, 3, h, mix(C['wood'][2], far, 0.55))
    for cx, cy, r in trees:
        m = discs_mask(h, [(cx, cy, r), (cx - r // 2, cy + r // 2, r * 2 // 3), (cx + r // 2, cy + r // 3, r * 2 // 3)])
        for y in range(h):
            for x in range(W):
                if m[y][x]:
                    low = y > cy + r // 2 or not m[min(h - 1, y + 5)][(x + 4) % W]
                    img.putpixel((x, y), leaf2 if low else leaf)
    return img


def make_town_mid():
    """Castle street: a row of houses with gables, pale and plain."""
    h = 120
    img = canvas(h)
    far = C['far'][2]
    wall = mix(CR[2], far, 0.5)
    wall2 = mix(CR[1], far, 0.6)
    frame = mix(C['wood'][2], far, 0.62)
    pane = mix(C['blue'][3], far, 0.55)
    roofs = [mix(C['red'][3], far, 0.45), mix(C['blue'][3], far, 0.3), mix(C['orange'][3], far, 0.45)]
    roofs2 = [mix(C['red'][2], far, 0.55), mix(C['blue'][2], far, 0.5), mix(C['gold'][1], far, 0.6)]
    houses = [  # x, width, top of wall, roof height, colour, windows as rows
        (0, 44, 62, 20, 0, 2), (44, 36, 46, 16, 1, 3), (80, 52, 70, 22, 2, 2), (132, 34, 40, 15, 0, 3),
        (166, 48, 60, 20, 1, 2), (214, 40, 50, 18, 2, 3), (254, 66, 66, 24, 0, 2),
    ]
    for x, w, top, rh, ci, rows in houses:
        rect(img, x, top, w, h - top, wall)
        rect(img, x + w - 3, top, 3, h - top, wall2)
        rect(img, x, top, 1, h - top, frame)
        rect(img, x, top + 14, w, 1, frame)
        # gable
        for i in range(rh):
            half = (w // 2 + 2) * (i + 1) // rh
            cx = x + w // 2
            for xx in range(cx - half, cx + half):
                img.putpixel((xx % W, top - rh + i), roofs2[ci] if xx > cx + half - 4 - i // 3 else roofs[ci])
        rect(img, x - 2, top - 1, w + 4, 2, roofs2[ci])
        rect(img, x + w // 2 + w // 5, top - rh + 2, 5, rh // 2, wall2)  # chimney
        for r in range(rows):
            wy = top + 5 + r * 20
            for wx in range(x + 7, x + w - 9, 14):
                rect(img, wx, wy, 6, 7, pane)
                rect(img, wx, wy + 7, 6, 1, frame)
                rect(img, wx + 3, wy, 1, 7, wall)
    return img


def tile_wall(img, cell_imgs, y0=0):
    from common import tile_hash
    for ty in range(img.height // T + 1):
        for tx in range(W // T):
            img.paste(cell_imgs[tile_hash(tx, ty, 3) % len(cell_imgs)], (tx * T, y0 + ty * T))


def make_castle_hall(theme):
    """Indoors, royal: the back wall with tall windows letting in pale light, and pillars.
    Opaque, one picture; it moves slower than the room (see the notes file, "Deviations")."""
    h = 352  # tall enough for an upright view
    img = canvas(h)
    tile_wall(img, theme.walls())
    wb = theme.wall_body
    pil = mix(CA[0], CA[1], 0.8)
    pil_lit = mix(CA[1], CA[2], 0.25)
    pil_shade = mix(CA[0], CA[1], 0.5)
    glass = mix(CA[1], CA[2], 0.55)
    glass2 = mix(CA[2], CA[3], 0.35)
    beam = mix(wb, CA[1], 0.45)
    for base in (0, 160):
        # the shaft of pale light falling from the window, down and to the right
        wx = base + 96
        for y in range(70, h):
            off = (y - 70) // 3
            for x in range(wx + off, wx + off + 30):
                if img.getpixel((x % W, y)) == wb:
                    img.putpixel((x % W, y), beam)
        # window: tall, round-headed
        ww, top, bot = 30, 46, 150
        frame = pil
        for y in range(top, bot):
            for x in range(wx - 3, wx + ww + 3):
                dx = x - (wx + ww / 2 - 0.5)
                inside_frame = y >= top + 18 or dx * dx + (y - top - 18) ** 2 <= 18.2 ** 2
                inside_glass = wx <= x < wx + ww and (y >= top + 18 or dx * dx + (y - top - 18) ** 2 <= 15.2 ** 2) and y < bot - 3
                if inside_glass:
                    mull = (x - wx) % 10 == 9 or (y - top) % 16 == 15
                    img.putpixel((x % W, y), frame if mull else (glass2 if (x - wx) % 10 < 4 and (y - top) % 16 < 9 else glass))
                elif inside_frame:
                    img.putpixel((x % W, y), frame)
        rect(img, wx - 5, bot, ww + 10, 3, pil_lit)  # sill
        # pillar
        px = base + 24
        rect(img, px, 0, 16, h, pil)
        rect(img, px, 0, 3, h, pil_lit)
        rect(img, px + 12, 0, 4, h, pil_shade)
        for yy in (28, 196, 330):
            rect(img, px - 3, yy, 22, 6, pil)
            rect(img, px - 3, yy, 22, 1, pil_lit)
            rect(img, px - 3, yy + 5, 22, 1, pil_shade)
    return img


def make_cellar_vault(theme):
    """Indoors, cellar: the back wall with a row of low vaults between squat piers. Opaque."""
    h = 352  # tall enough for an upright view
    img = canvas(h)
    tile_wall(img, theme.walls())
    pier = mix(NI[1], NI[2], 0.12)
    pier_lit = mix(NI[1], NI[2], 0.4)
    deep = mix(NI[0], NI[1], 0.2)
    for base in range(0, W, 80):
        # the dark of a vault
        for y in range(60, 200):
            for x in range(base + 14, base + 66):
                dx = x - (base + 39.5)
                if y >= 86 or dx * dx + (y - 86) ** 2 <= 26.2 ** 2:
                    img.putpixel((x % W, y), deep)
        rect(img, base, 52, 14, 148, pier)
        rect(img, base + 66, 52, 14, 148, pier)
        rect(img, base, 52, 2, 148, pier_lit)
        rect(img, base + 66, 52, 2, 148, pier_lit)
    rect(img, 0, 48, W, 4, pier)
    rect(img, 0, 48, W, 1, pier_lit)
    rect(img, 0, 200, W, 4, pier)
    rect(img, 0, 200, W, 1, pier_lit)
    for base in range(0, W, 80):
        rect(img, base, 204, 14, h - 204, pier)
        rect(img, base + 66, 204, 14, h - 204, pier)
    return img


# ---------------------------------------------------------------- content files

ROOM_THEME = {
    'courtyard': 'grass-ruins',
    'castle-street': 'town',
    'throne-room': 'castle',
    'hall-gallery': 'castle',
    'graybox-hall': 'castle',
    'undercroft': 'cellar',
}


def cells_of(theme, which):
    listing = theme.top_list if which == 'top' else theme.under_list
    src = TOP_CELLS if which == 'top' else UNDER_CELLS
    return [[-1, -1] if i is None else src[i] for i in listing]


def atlas_json(room, theme):
    return {
        '//': 'DRAFT: stand-in drawn by tools/art/tiles/make.py (theme "%s"); a delivered tile sheet replaces it by editing this file. Notes: tools/art/tiles/README.md.' % theme.name,
        'id': room,
        'image': 'tiles/%s.png' % theme.name,
        'tile': T,
        'cells': {'solid': FILL[0], 'solidTop': [ORIGIN[0] + 14 % 4, ORIGIN[1] + 14 // 4], 'oneway': ONEWAY['mid']},
        'autotile': {
            'origin': ORIGIN,
            'innerCorners': INNER,
            'fill': FILL,
            'top': cells_of(theme, 'top'),
            'under': cells_of(theme, 'under'),
            'oneway': ONEWAY,
        },
    }


def hexs(c):
    return '#%02x%02x%02x' % c[:3]


def backdrop_json(room):
    note = 'DRAFT: stand-in drawn by tools/art/tiles/make.py; offsets are set for the 320x180 view. Notes: tools/art/tiles/README.md.'
    sky = [P_SKY[0], P_SKY[2]]
    if room == 'courtyard':
        return {'//': note, 'id': room, 'sky': sky, 'layers': [
            {'image': 'backdrops/sky-clouds.png', 'parallax': 0.1, 'y': 'top', 'offsetY': 22, 'repeatX': True},
            {'image': 'backdrops/far-hills.png', 'parallax': 0.25, 'y': 'bottom', 'offsetY': -34, 'repeatX': True},
            {'image': 'backdrops/castle-mid.png', 'parallax': 0.5, 'y': 'bottom', 'offsetY': -30, 'repeatX': True},
        ]}
    if room == 'castle-street':
        return {'//': note, 'id': room, 'sky': sky, 'layers': [
            {'image': 'backdrops/sky-clouds.png', 'parallax': 0.1, 'y': 'top', 'offsetY': 10, 'repeatX': True},
            {'image': 'backdrops/far-castle.png', 'parallax': 0.2, 'y': 'bottom', 'offsetY': -30, 'repeatX': True},
            {'image': 'backdrops/town-mid.png', 'parallax': 0.5, 'y': 'bottom', 'offsetY': 0, 'repeatX': True},
        ]}
    castle, cellar = THEMES[2], THEMES[3]
    if room in ('throne-room', 'hall-gallery'):
        c = hexs(castle.wall_body)
        return {'//': note + ' DRAFT: no "wall" here on purpose: the one layer is the back wall itself, with windows and pillars, moving slower than the room; add "wall" (cells [0,6]..[3,6] of tiles/castle.png) to go back to a flat wall that moves with the room.',
                'id': room, 'sky': [c, c], 'layers': [
            {'image': 'backdrops/castle-hall.png', 'parallax': 0.75, 'y': 'top', 'offsetY': 0 if room == 'throne-room' else -24, 'repeatX': True, 'parallaxY': 0.75},
        ]}
    if room == 'undercroft':
        c = hexs(cellar.wall_body)
        return {'//': note + ' DRAFT: no "wall" here on purpose: the one layer is the back wall itself, with vaults and piers, moving slower than the room; add "wall" (cells [0,6]..[3,6] of tiles/cellar.png) to go back to a flat wall that moves with the room.',
                'id': room, 'sky': [c, c], 'layers': [
            {'image': 'backdrops/cellar-vault.png', 'parallax': 0.75, 'y': 'top', 'offsetY': -12, 'repeatX': True, 'parallaxY': 0.75},
        ]}
    c = hexs(castle.wall_body)
    return {'//': note, 'id': room, 'sky': [c, c], 'layers': [],
            'wall': {'image': 'tiles/castle.png', 'tile': T, 'cells': WALL_CELLS}}


P_SKY = ['#5fb4f0', '#8fd0fa', '#c4e9ff']


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def save(img, rel):
    path = os.path.join(ASSETS, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=False)


def main():
    by_name = {}
    for theme in THEMES:
        by_name[theme.name] = theme
        save(build_sheet(theme), 'tiles/%s.png' % theme.name)
    save(make_clouds(), 'backdrops/sky-clouds.png')
    save(make_far_hills(), 'backdrops/far-hills.png')
    save(make_far_castle(), 'backdrops/far-castle.png')
    save(make_castle_mid(), 'backdrops/castle-mid.png')
    save(make_town_mid(), 'backdrops/town-mid.png')
    save(make_castle_hall(by_name['castle']), 'backdrops/castle-hall.png')
    save(make_cellar_vault(by_name['cellar']), 'backdrops/cellar-vault.png')
    for room, name in ROOM_THEME.items():
        write_json(os.path.join(CONTENT, 'atlases', room + '.json'), atlas_json(room, by_name[name]))
        write_json(os.path.join(CONTENT, 'backdrops', room + '.json'), backdrop_json(room))
    print('tiles lane: wrote 4 tile images, 7 backdrop images, 6 atlas files, 6 backdrop files')


if __name__ == '__main__':
    main()
