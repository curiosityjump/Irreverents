"""Round 2 themes: what each of the four tile images is made of. Used by make.py.

DRAFT: stand-ins drawn by a program; every choice here is provisional (notes: README.md).
"""
from common import C, CLEAR, T, mix, rgb
from tiles_draw import (INK, INK2, Ramp, block, circle, get, lip_ends, new_tile, open_edges, plank_ledge, put,
                        rnd, stamp, stone_shelf, wall_fill)

G, F, ST, EA = C['grass'], C['foliage'], C['stone'], C['earth']
CA, NI, WD, GO = C['castle'], C['night'], C['wood'], C['gold']
CR, RD, BL = C['cream'], C['red'], C['blue']


def ramp_of(R, lift=0.0):
    """A 4-colour ramp -> block tones: mortar R0, shade R1, body R2, light, highlight R3."""
    return Ramp(R[0], R[1], R[2], mix(R[2], R[3], 0.5), R[3])


class Theme:
    indoor = False
    lip_depth = 6
    regions = []

    def ramps(self):
        raise NotImplementedError

    def fill(self, v):
        return wall_fill(self.ramps(), v, seed=self.seed)

    def mark(self, img, v):
        """Per-variant marks on a fill (moss, chips, a sconce stone, a hairline crack)."""

    def fills(self):
        out = []
        for v in range(9):
            img = self.fill(v)
            self.mark(img, v)
            out.append(img)
        return out

    def tile(self, idx):
        img = self.fill(0)
        r = self.ramps()[0]
        open_edges(img, idx, INK, r.l, r.s)
        if not idx & 1:
            self.lip(img, idx)
        return img

    def inner(self, corner):
        img = new_tile()
        k = {'#': INK, 's': self.ramps()[0].s}
        if corner == 'nw':
            stamp(img, 0, 0, ['#s', 's.'], k)
        elif corner == 'ne':
            stamp(img, 14, 0, ['s#', '.s'], k)
        elif corner == 'sw':
            stamp(img, 0, 14, ['s.', '#s'], k)
        else:
            stamp(img, 14, 14, ['.s', 's#'], k)
        return img

    def deep(self):
        return []

    def walls(self):
        return []


def chip(img, x, y, r):
    """A chipped corner: a bite out of a block, shaded inside."""
    stamp(img, x, y, ['mm', 'ms'], {'m': r.m, 's': r.s})


def hairline(img, x, y, r):
    """A tiny, short crack: two or three pixels, nothing like the crack overlays."""
    put(img, x, y, r.m)
    put(img, x + 1, y + 1, r.m)


# ---------------------------------------------------------------- grass and old stone (courtyard)

GRASS_DRIP = [6, 7, 9, 7, 6, 6, 7, 8, 10, 8, 7, 6, 6, 8, 9, 7]


class Ruins(Theme):
    name = 'grass-ruins'
    seed = 3

    def ramps(self):
        base = Ramp(mix(ST[0], INK, 0.25), ST[1], ST[2], mix(ST[2], ST[3], 0.5), ST[3])
        dark = Ramp(base.m, mix(ST[0], ST[1], 0.6), mix(ST[1], ST[2], 0.55), ST[2], mix(ST[2], ST[3], 0.6))
        light = Ramp(base.m, mix(ST[1], ST[2], 0.4), mix(ST[2], ST[3], 0.3), mix(ST[2], ST[3], 0.7), ST[3])
        return [base, dark, light]

    def mark(self, img, v):
        r = self.ramps()[0]
        moss = {'a': G[1], 'b': G[2], 'c': G[3], 'd': F[0]}
        if v == 2:
            stamp(img, 1, 5, ['.cb..', 'bbabd', 'a..a.'], moss)
        if v == 4:
            stamp(img, 9, 12, ['.cb', 'bba', 'd.a'], moss)
        if v == 5:
            chip(img, 6, 0, r)
            chip(img, 14, 8, r)
        if v == 6:
            hairline(img, 3, 3, r)
        if v == 7:
            stamp(img, 2, 0, ['.c..', 'bbb.', 'abd.', '.a..', '.d..'], moss)

    def lip(self, img, idx):
        """A thick grass lip: dark outline, bright highlight row, body, drips that hang on the stone."""
        for x in range(T):
            d = GRASS_DRIP[x]
            put(img, x, 0, G[0])
            put(img, x, 1, G[3])
            put(img, x, 2, G[3] if x % 5 in (1, 2) else G[2])
            for y in range(3, d):
                put(img, x, y, G[2] if y < 4 else G[1])
            put(img, x, d, G[0])
            put(img, x, d + 1, INK)  # round 3: a 1 px ink line under the walk edge
        for x in (2, 9, 14):
            put(img, x, 3, G[3])
        lip_ends(img, idx, 6, G[0])
        if not idx & 8:
            for y in range(1, 6):
                put(img, 1, y, G[2] if y > 1 else G[0])
        if not idx & 2:
            for y in range(1, 6):
                put(img, 14, y, G[1] if y > 1 else G[0])

    def inner(self, corner):
        img = new_tile()
        k = {'o': G[0], 'a': G[1], 'b': G[2], 'c': G[3]}
        if corner == 'nw':
            stamp(img, 0, 0, ['bo', 'ao', 'o.'], k)
        elif corner == 'ne':
            stamp(img, 14, 0, ['ob', 'oa', '.o'], k)
        elif corner == 'sw':
            stamp(img, 0, 14, ['s.', '#s'], {'#': INK, 's': ST[1]})
        else:
            stamp(img, 14, 14, ['.s', 's#'], {'#': INK, 's': ST[1]})
        return img

    def tops(self):
        k = {'o': G[0], 'a': G[1], 'b': G[2], 'c': G[3], 'w': rgb('#ffffff'), 'y': GO[2], 'p': C['pink'][2], 'q': C['pink'][1]}
        a = new_tile()
        stamp(a, 2, 10, ['.c...c..', '.bc.cb..', 'obbobba.', 'abbabbao'], k)
        b = new_tile()
        stamp(b, 6, 9, ['..c..', 'c.bc.', 'bcbbo', 'abbab', 'oabao'], k)
        c = new_tile()
        stamp(c, 4, 7, ['.w.', 'wyw', '.w.', '.b..', 'cb.c', 'abba', 'oabo'], k)
        d = new_tile()
        stamp(d, 1, 11, ['c......c..', 'bc.c..cb.c', 'bbobb.bbcb', 'abaabobaab'], k)
        return [a, b, c, d]

    top_list = [0, 1, 3, 0, 1, 2, None, None, None, None]

    def unders(self):
        k = {'o': G[0], 'a': G[1], 'b': G[2], 'd': F[0], 'e': F[1]}
        a = new_tile()
        stamp(a, 4, 0, ['ab.', 'ab.', '.bd', '.ad', 'ea.', 'ed.', '.d.', '.o.'], k)
        b = new_tile()
        stamp(b, 9, 0, ['ba.a', 'ab.d', 'd..e', 'e..d', 'd...'], k)
        return [a, b]

    under_list = [0, 1, None, None, None, None]

    def oneway(self, kind):
        return plank_ledge(kind, WD)

    def deep(self):
        """Foundation under the floor: big dark blocks, plainer than the wall, damp moss."""
        R = Ramp(mix(ST[0], INK, 0.65), mix(ST[0], INK, 0.35), mix(ST[0], ST[1], 0.25), mix(ST[0], ST[1], 0.55), mix(ST[1], ST[2], 0.2))
        out = []
        for v in range(4):
            img = new_tile()
            block(img, 0, 0, 16 if v % 2 else 10, 10, R, seed=v, specks=1)
            if v % 2 == 0:
                block(img, 10, 0, 16, 10, R, seed=v + 5, specks=0)
            block(img, -6, 10, 6, 20, R, seed=11, specks=0)
            block(img, 6, 10, 22, 20, R, seed=12 + v, specks=1)
            if v == 3:
                stamp(img, 3, 9, ['.e', 'de', 'd.'], {'d': mix(F[0], INK, 0.3), 'e': F[0]})
            out.append(img)
        return out

    def canopy_regions(self):
        return [canopy_region()]


# ---------------------------------------------------------------- leaf canopy (the courtyard's top row)

def canopy_tile(idx, v=0):
    """Leaves along the room's top row. The upper edge is a row of round clumps against the sky;
    the clumps crossing the tile's sides are the same in every variant."""
    img = new_tile()
    s_open = not idx & 4
    dark, body, lit, hi = F[0], F[1], F[2], F[3]
    edge = mix(F[0], INK, 0.45)
    clumps = [(0, 6, 4), (16, 6, 4)]  # crossing: fixed
    inner = [[(5, 4, 4), (11, 3, 5)], [(6, 3, 5), (12, 6, 3)], [(7, 5, 5)], [(4, 5, 3), (10, 2, 5)]][v % 4]
    allc = clumps + inner
    # outline pass, body pass, light pass
    for cx, cy, r in allc:
        circle(img, cx, cy, r + 1, edge)
    for y in range(6, T):
        for x in range(T):
            put(img, x, y, body)
    for cx, cy, r in allc:
        circle(img, cx, cy, r, body)
    for cx, cy, r in allc:
        circle(img, cx - 1, cy - 1, r - 2, lit)
        put(img, cx - 2, cy - 2, hi)
        put(img, cx - 1, cy - 3, hi)
    # inner leaves: a few dark notches so it reads as foliage, not a cloud
    for i, (x, y) in enumerate(((3, 10), (10, 9), (6, 13), (13, 12), (1, 12))):
        put(img, x, y, dark)
        put(img, x + 1, y, lit if i % 2 else body)
    if s_open:
        drip = [12, 13, 14, 13, 12, 12, 14, 15, 14, 12, 12, 13, 15, 14, 12, 12]
        for x in range(T):
            for y in range(drip[x], T):
                put(img, x, y, CLEAR)
            put(img, x, drip[x] - 1, edge)
            put(img, x, drip[x] - 2, dark)
    return img


def canopy_region():
    fills = [canopy_tile(15, v) for v in range(6)]
    blocks = [canopy_tile(i, 0) for i in range(16)]

    def hang(v):
        img = new_tile()
        k = {'d': F[0], 'e': F[1], 'f': F[2], 'o': mix(F[0], INK, 0.45)}
        if v == 0:
            stamp(img, 3, 0, ['ef', 'ed', '.e', '.d', 'fe', 'do', 'o.'], k)
        else:
            stamp(img, 10, 0, ['fe', 'de', 'e.', 'do'], k)
        return img
    return {'name': 'canopy', 'block': blocks, 'fill': fills, 'top': [], 'top_list': [],
            'under': [hang(0), hang(1)], 'under_list': [0, 1, None, None, None]}


# ---------------------------------------------------------------- town: plaster and timber, cobbles, tile roofs

class Town(Theme):
    name = 'town'
    seed = 5

    def ramps(self):
        # only used for the open-edge shading of plaster
        return [Ramp(WD[0], CR[1], CR[2], CR[2], CR[2])] * 3

    def fill(self, v):
        """Plaster between timbers: a post on the tile's left edge, a beam at its foot."""
        img = new_tile()
        pl, pl2, pl3 = CR[2], mix(CR[1], CR[2], 0.55), CR[1]
        for y in range(T):
            for x in range(T):
                put(img, x, y, pl)
        for y in range(T):
            put(img, 0, y, WD[1])
            put(img, 1, y, WD[2])
            put(img, 2, y, pl2)  # the plaster's shadow beside the post
        for x in range(T):
            put(img, x, 13, WD[2])
            put(img, x, 14, WD[1])
            put(img, x, 15, WD[0])
            put(img, x, 12, pl2)
        put(img, 0, 13, WD[1])
        put(img, 1, 13, WD[2])
        # texture: worn plaster spots
        for i in range(3):
            put(img, 4 + rnd(v + 40, i) % 10, 2 + rnd(v + 41, i) % 8, pl2)
        if v in (1, 5):  # a diagonal brace
            for i in range(10):
                put(img, 3 + i, 11 - i, WD[1])
                put(img, 4 + i, 11 - i, WD[2])
        if v in (2, 6):  # plaster fallen away: bricks show
            stamp(img, 7, 4, ['.ooo.', 'orrrro', 'orror.', '.oo..'], {'o': pl3, 'r': EA[2]})
        if v == 3:  # a cross-brace
            for i in range(8):
                put(img, 4 + i, 3 + i, WD[1])
                put(img, 11 - i, 3 + i, WD[1])
        return img

    def mark(self, img, v):
        pass

    def tile(self, idx):
        img = self.fill(0)
        n, e, s, w = idx & 1, idx & 2, idx & 4, idx & 8
        if not w:
            for y in range(T):
                put(img, 0, y, INK)
                put(img, 1, y, WD[2])
                put(img, 2, y, WD[3])
                put(img, 3, y, WD[2])
                put(img, 4, y, WD[1])
        if not e:
            for y in range(T):
                put(img, 15, y, INK)
                put(img, 14, y, WD[1])
                put(img, 13, y, WD[2])
                put(img, 12, y, WD[1])
        if not s:
            for x in range(T):
                put(img, x, 12, WD[2])
                put(img, x, 13, WD[2])
                put(img, x, 14, WD[1])
                put(img, x, 15, INK)
        if not n:  # a floor of boards (the inside of a house)
            for x in range(T):
                put(img, x, 0, INK)
                put(img, x, 1, WD[3])
                put(img, x, 2, WD[2])
                put(img, x, 3, WD[2])
                put(img, x, 4, WD[1])
                put(img, x, 5, INK)
            for y in range(1, 5):
                put(img, 9, y, WD[0])
            lip_ends(img, idx, 6)
        elif not w:
            put(img, 0, 0, INK)
        return img

    def inner(self, corner):
        img = new_tile()
        sh = mix(CR[1], CR[2], 0.55)
        x = 0 if corner in ('nw', 'sw') else 15
        y = 0 if corner in ('nw', 'ne') else 15
        put(img, x, y, sh)
        return img

    def tops(self):
        return []

    top_list = []

    def unders(self):
        a = new_tile()
        stamp(a, 2, 0, ['#ss#', '#sd#', '.##.'], {'#': INK, 's': WD[2], 'd': WD[1]})
        b = new_tile()
        stamp(b, 10, 0, ['#ss#', '#sd#', '.##.'], {'#': INK, 's': WD[2], 'd': WD[1]})
        return [a, b]

    under_list = [0, 1, None]

    def oneway(self, kind):
        return plank_ledge(kind, WD)

    # round 3: the grate (cell 3) about one deep tile in ten
    deep_list = [0, 1, 2, 0, 1, 2, 0, 1, 2, 3]

    def deep(self):
        """Round 3: foundation stone under the street (it was packed earth): big dark dressed stones,
        now and then a cellar grate with the dark behind its bars."""
        R = Ramp(mix(ST[0], INK, 0.6), mix(ST[0], INK, 0.3), mix(ST[0], EA[0], 0.35), mix(ST[0], ST[1], 0.45), mix(ST[1], EA[1], 0.3))
        out = []
        for v in range(4):
            img = new_tile()
            block(img, 0, 0, 16 if v % 2 else 9, 8, R, seed=v + 70, specks=1)
            if v % 2 == 0:
                block(img, 9, 0, 16, 8, R, seed=v + 75, specks=0)
            block(img, -6, 8, 10, 16, R, seed=81, specks=0)
            block(img, 10, 8, 26, 16, R, seed=82 + v, specks=1)
            if v == 3:  # a cellar grate: iron bars over the dark
                for y in range(2, 13):
                    for x in range(3, 13):
                        put(img, x, y, INK if (x - 3) % 3 else mix(C['metal'][0], INK, 0.3))
                for x in range(2, 14):
                    put(img, x, 1, mix(C['metal'][1], INK, 0.2))
                    put(img, x, 13, mix(C['metal'][0], INK, 0.4))
            out.append(img)
        return out

    def street_region(self):
        return street_region()

    def roof_region(self, R):
        return roof_region(R)

    def eave_region(self):
        return eave_region()


COB_ROWS = [(6, 11, 0), (11, 16, 3)]  # (y0, y1, x offset) cobble courses under the curb


def cobbles(img, y0, y1, off, seed):
    tones = [Ramp(mix(ST[0], INK, 0.3), ST[1], ST[2], mix(ST[2], ST[3], 0.5), ST[3]),
             Ramp(mix(ST[0], INK, 0.3), mix(ST[1], EA[1], 0.3), mix(ST[2], EA[2], 0.3), mix(ST[2], EA[3], 0.4), mix(ST[3], EA[3], 0.3)),
             Ramp(mix(ST[0], INK, 0.3), mix(ST[0], ST[1], 0.5), mix(ST[1], ST[2], 0.6), ST[2], mix(ST[2], ST[3], 0.5))]
    x = off - 6
    i = 0
    widths = [6, 5, 6, 5, 6]
    while x < 16:
        w = widths[i % len(widths)]
        # the crossing cobbles (at x<0 and their twin at x+16) use a fixed tone so tiles join
        t = tones[0] if x < 0 or x + w > 16 else tones[rnd(seed, i) % 3]
        block(img, x, y0, x + w, y1, t, seed=seed + i, specks=0)
        if x < 0:
            block(img, x + 16, y0, x + 16 + w, y1, t, seed=seed + i, specks=0)
        x += w
        i += 1


def street_tile(idx, v=0):
    img = new_tile()
    gap = mix(EA[0], INK, 0.4)
    for y in range(T):
        for x in range(T):
            put(img, x, y, gap)
    n = idx & 1
    top = 0 if n else 6
    rows = [(0, 5, 2), (5, 11, 0), (11, 16, 3)] if n else COB_ROWS
    for y0, y1, off in rows:
        cobbles(img, y0, y1, off, seed=v * 17 + y0)
    if not n:
        # the curb: a long dressed kerbstone with a bright edge you walk on
        R = Ramp(INK, ST[1], ST[2], mix(ST[2], ST[3], 0.6), ST[3])
        block(img, -8, 0, 8, 6, R, seed=1, specks=1)
        block(img, 8, 0, 24, 6, R, seed=1, specks=1)
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, 1, ST[3])
        put(img, 7, 1, INK)
    return img


def street_region():
    blocks = [street_tile(i) for i in range(16)]
    fills = [street_tile(15, v) for v in range(6)]
    return {'name': 'street', 'block': blocks, 'fill': fills, 'top': [], 'top_list': [], 'under': [], 'under_list': []}


SCALE = ['bhhhbbbs', 'bhbbbbss', 'bbbbbbss', 'ebbbbbse', 'Deeeeeee']


def shingles(img, y0, y1, R, phase, tone=0):
    """Courses of round-bottomed tiles, 8 wide and 5 tall, each course offset by half a tile, the
    course below peeking out between the rounded ends. tone 0: lit (upper slope), 1: shaded."""
    edge = mix(R[0], INK, 0.35)
    hi, body, sh = (R[3], R[2], R[1]) if tone == 0 else (mix(R[2], R[3], 0.4), mix(R[1], R[2], 0.5), mix(R[0], R[1], 0.5))
    key = {'h': hi, 'b': body, 's': sh, 'e': edge, 'D': R[0]}
    for ci, cy in enumerate(range(y0, y1, 5)):
        off = 4 * ((ci + phase) % 2)
        for x in range(T):
            k = (x + off) % 8
            for dy in range(5):
                if y0 <= cy + dy < y1:
                    put(img, x, cy + dy, key[SCALE[dy][k]])


def roof_tile(idx, R, v=0):
    """Tile roof. Upper tile (nothing above): a ridge you stand on, lit courses. Lower tile (roof
    above): shaded courses. Nothing below: a wooden eave board."""
    img = new_tile()
    n, e, s, w = idx & 1, idx & 2, idx & 4, idx & 8
    if not n:
        shingles(img, 4, T, R, 0, 0)
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, 1, R[3])
            put(img, x, 2, R[2])
            put(img, x, 3, R[0])
        for x in range(2, T, 4):
            put(img, x, 2, R[3])
            put(img, x + 1, 3, mix(R[0], INK, 0.4))
    else:
        shingles(img, -1, T, R, 1, 1)
    if v:
        put(img, (3 + v * 5) % 14 + 1, 9, R[3])
    if not s:
        for x in range(T):
            put(img, x, 12, mix(R[0], INK, 0.35))
            put(img, x, 13, WD[2])
            put(img, x, 14, WD[1])
            put(img, x, 15, INK)
        for x in (3, 11):
            put(img, x, 14, WD[0])
    if not w:
        for y in range(T):
            put(img, 0, y, INK)
        for x, y in ((0, 0), (1, 0), (0, 1)):
            put(img, x, y, CLEAR)
        put(img, 1, 1, INK)
    if not e:
        for y in range(T):
            put(img, 15, y, INK)
        for x, y in ((15, 0), (14, 0), (15, 1)):
            put(img, x, y, CLEAR)
        put(img, 14, 1, INK)
    return img


def roof_region(R):
    blocks = [roof_tile(i, R) for i in range(16)]
    fills = [roof_tile(15, R, v) for v in range(6)]
    return {'name': 'roof', 'block': blocks, 'fill': fills, 'top': [], 'top_list': [], 'under': [], 'under_list': []}


def eave_tile(idx, v=0):
    """The street's top row: the eaves of the roofs over the street, seen from the street. Its upper
    edge is a row of round ridge caps against the sky (and now and then a chimney pot); under the
    shingles a fascia board and rafter ends."""
    img = new_tile()
    s_open = not idx & 4
    R = RD
    edge = mix(R[0], INK, 0.35)
    shingles(img, 3, 11, R, 0, 1)
    # ridge caps: half-rounds 6 wide, one per 8 px, the top edge breaks against the sky
    for cx in (3, 11):
        stamp(img, cx - 3, 0, ['.oooo.', 'ohhbbo', 'obbbso'], {'o': edge, 'h': R[3], 'b': R[2], 's': R[1]})
    for x in (7, 8, 15, 0):
        put(img, x, 2, edge)
    if v >= 2:  # a tile a shade off
        put(img, (v * 5) % 14 + 1, 6, R[3])
        put(img, (v * 5) % 14 + 2, 7, R[1])
    if v == 1:  # a chimney pot
        for x in range(9, 14):
            for y in range(0, 5):
                put(img, x, y, EA[2] if x < 12 else EA[1])
        for x in range(9, 14):
            put(img, x, 0, INK)
        put(img, 9, 1, EA[3])
    for x in range(T):
        put(img, x, 11, WD[3])
        put(img, x, 12, WD[2])
        put(img, x, 13, WD[1])
    if s_open:
        for x in range(T):
            put(img, x, 14, INK)
        for x in (2, 3, 10, 11):
            put(img, x, 14, WD[1])
            put(img, x, 15, INK)
    else:
        for x in range(T):
            put(img, x, 14, WD[0])
            put(img, x, 15, WD[0])
    return img


def eave_region():
    blocks = [eave_tile(i) for i in range(16)]
    fills = [eave_tile(15, v) for v in (0, 2, 1, 3, 4, 5)]
    return {'name': 'eave', 'block': blocks, 'fill': fills, 'top': [], 'top_list': [], 'under': [], 'under_list': []}


# ---------------------------------------------------------------- castle (throne room, gallery, graybox)

class Castle(Theme):
    name = 'castle'
    indoor = True
    seed = 11

    def ramps(self):
        base = Ramp(CA[0], CA[1], CA[2], mix(CA[2], CA[3], 0.5), CA[3])
        dark = Ramp(CA[0], mix(CA[0], CA[1], 0.6), mix(CA[1], CA[2], 0.55), CA[2], mix(CA[2], CA[3], 0.6))
        light = Ramp(CA[0], mix(CA[1], CA[2], 0.4), mix(CA[2], CA[3], 0.3), mix(CA[2], CA[3], 0.75), CA[3])
        return [base, dark, light]

    # the back wall: calmer and darker than anything you touch (round 2: "calm the back wall")
    wall_body = mix(CA[0], ST[0], 0.45)
    wall_dark = mix(CA[0], NI[1], 0.55)
    wall_line = mix(CA[0], NI[1], 0.3)

    def mark(self, img, v):
        r = self.ramps()[0]
        if v == 2:  # a sconce stone: an iron ring
            stamp(img, 5, 1, ['.##.', '#..#', '.##.'], {'#': INK2})
        if v == 5:
            chip(img, 6, 0, r)
        if v == 6:
            hairline(img, 11, 10, r)
        if v == 7:  # a banner hook
            stamp(img, 7, 2, ['###', '.#.'], {'#': INK2})

    def lip(self, img, idx):
        """The floor cap: a warm gold-tan dressed stone with an ink line under it."""
        hi, body, sh = mix(GO[3], CR[2], 0.5), mix(GO[2], EA[3], 0.55), mix(EA[2], GO[1], 0.4)
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, 1, hi)
            put(img, x, 2, body)
            put(img, x, 3, body)
            put(img, x, 4, sh)
            put(img, x, 5, INK)
        for x, y in ((4, 2), (12, 3), (13, 2)):
            put(img, x, y, hi if y == 2 else sh)
        for y in range(1, 5):
            put(img, 7, y, sh)
        put(img, 7, 1, INK2)
        # round 3: a floor-face course under the cap: warm grey flagstone ends, then ink, so the floor
        # mass is a different stone from the lilac wall
        R = Ramp(INK, ST[0], ST[1], mix(ST[1], ST[2], 0.5), ST[2])
        block(img, -5, 6, 11, 11, R, seed=2, specks=1, rounded=False)
        block(img, 11, 6, 27, 11, R, seed=3, specks=1, rounded=False)
        for x in range(T):
            put(img, x, 11, INK)
            put(img, x, 12, mix(CA[0], INK, 0.3))
        lip_ends(img, idx, 11)

    def tops(self):
        return []

    top_list = []

    def unders(self):
        """Dentils under a ceiling: small blocks in a row, their shadow."""
        a = new_tile()
        r = self.ramps()[1]
        for x0 in (1, 9):
            stamp(a, x0, 0, ['#####', '#lbs#', '#bss#', '#####'], {'#': INK, 'l': r.l, 'b': r.b, 's': r.s})
        return [a]

    under_list = [0]

    def oneway(self, kind):
        # paler and cooler than the warm floor cap, so a ledge never reads as floor trim
        r = Ramp(CA[1], CA[2], mix(CA[2], CA[3], 0.6), CA[3], mix(CA[3], C['metal'][3], 0.45))
        return stone_shelf(kind, r)

    def deep(self):
        """Round 3: the foundation under a castle floor: big warm-grey footing stones two steps below
        the wall, nearly ink, so the floor mass differs from the lilac wall."""
        R = Ramp(mix(ST[0], INK, 0.7), mix(ST[0], INK, 0.45), mix(ST[0], CA[0], 0.5), mix(ST[0], ST[1], 0.4), mix(ST[1], CA[1], 0.4))
        out = []
        for v in range(4):
            img = new_tile()
            block(img, -4 if v % 2 else 0, 0, 12 if v % 2 else 16, 8, R, seed=v + 50, specks=1)
            if v % 2:
                block(img, 12, 0, 28, 8, R, seed=v + 55, specks=0)
            block(img, -8, 8, 8, 16, R, seed=61, specks=0)
            block(img, 8, 8, 24, 16, R, seed=62 + v, specks=1)
            out.append(img)
        return out

    def walls(self):
        """Back-wall cells (graybox-hall's `wall`): big flat blocks, faint joints, no bevel."""
        out = []
        for v in range(4):
            img = new_tile()
            for y in range(T):
                for x in range(T):
                    put(img, x, y, self.wall_body)
            for x in range(T):
                put(img, x, 7, self.wall_line)
                put(img, x, 15, self.wall_line)
            for y in range(0, 7):
                put(img, 15 if v % 2 else 9, y, self.wall_line)
            for y in range(8, 15):
                put(img, 4, y, self.wall_line)
            if v == 3:
                put(img, 11, 11, self.wall_dark)
                put(img, 12, 11, self.wall_dark)
            out.append(img)
        return out


# ---------------------------------------------------------------- cellar (undercroft)

class Cellar(Theme):
    name = 'cellar'
    indoor = True
    seed = 19
    wall_body = mix(NI[0], NI[1], 0.6)

    def ramps(self):
        base = Ramp(NI[0], NI[1], NI[2], mix(NI[2], NI[3], 0.5), NI[3])
        dark = Ramp(NI[0], mix(NI[0], NI[1], 0.6), mix(NI[1], NI[2], 0.6), NI[2], mix(NI[2], NI[3], 0.6))
        light = Ramp(NI[0], mix(NI[1], NI[2], 0.4), mix(NI[2], NI[3], 0.35), NI[3], mix(NI[3], CA[2], 0.4))
        return [base, dark, light]

    def mark(self, img, v):
        r = self.ramps()[0]
        if v == 2:
            stamp(img, 3, 4, ['.a', 'ab'], {'a': mix(F[0], NI[1], 0.4), 'b': mix(F[1], NI[2], 0.5)})
        if v == 5:
            chip(img, 6, 0, r)
        if v == 6:
            hairline(img, 9, 10, r)
        if v == 7:  # a sconce ring
            stamp(img, 5, 1, ['.##.', '#..#', '.##.'], {'#': INK})

    def lip(self, img, idx):
        """A worn flagstone lip, lit from the rooms above: pale lilac top, dark under."""
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, 1, CA[3])
            put(img, x, 2, CA[2])
            put(img, x, 3, mix(CA[1], CA[2], 0.4))
            put(img, x, 4, INK)
        for y in range(1, 4):
            put(img, 10, y, CA[1])
        put(img, 3, 2, CA[3])
        lip_ends(img, idx, 5)

    def tops(self):
        k = {'a': NI[2], 'b': NI[3], '#': INK}
        a = new_tile()
        stamp(a, 4, 13, ['.bb..', '#aab#'], k)
        return [a]

    top_list = [0, None, None, None, None]

    def unders(self):
        k = {'a': NI[2], 'b': NI[3], 'w': C['teal'][3]}
        a = new_tile()
        stamp(a, 5, 0, ['aa', 'a.', 'b.', '.', 'w.'], k)
        b = new_tile()
        stamp(b, 11, 0, ['aaa', '.a.', '.b.'], k)
        return [a, b]

    under_list = [0, 1, None, None]

    def oneway(self, kind):
        return plank_ledge(kind, [mix(WD[0], INK, 0.3), WD[0], WD[1], WD[2]])

    def deep(self):
        """Round 3: bedrock under a cellar floor (the quarry's cave and pit): big blocks two steps
        darker than the wall, nearly ink, almost no marks."""
        R = Ramp(mix(NI[0], INK, 0.6), mix(NI[0], INK, 0.2), mix(NI[0], NI[1], 0.45), mix(NI[1], NI[2], 0.2), mix(NI[1], NI[2], 0.5))
        out = []
        for v in range(4):
            img = new_tile()
            block(img, 0, 0, 16 if v % 2 else 9, 9, R, seed=v + 30, specks=1)
            if v % 2 == 0:
                block(img, 9, 0, 16, 9, R, seed=v + 35, specks=0)
            block(img, -7, 9, 7, 18, R, seed=41, specks=0)
            block(img, 7, 9, 23, 18, R, seed=42 + v, specks=1)
            out.append(img)
        return out

    def walls(self):
        out = []
        line = mix(NI[0], INK, 0.2)
        for v in range(4):
            img = new_tile()
            for y in range(T):
                for x in range(T):
                    put(img, x, y, self.wall_body)
            for x in range(T):
                put(img, x, 7, line)
                put(img, x, 15, line)
            for y in range(0, 7):
                put(img, 12 if v % 2 else 6, y, line)
            for y in range(8, 15):
                put(img, 2, y, line)
            out.append(img)
        return out


THEMES = [Ruins(), Town(), Castle(), Cellar()]


# ---------------------------------------------------------------- quarry (round 3): re-authored from the P03 plate

from PIL import Image as _Image  # noqa: E402

import plates as PL  # noqa: E402

E = C['earth']


def _flip(img, h=True):
    return img.transpose(_Image.FLIP_LEFT_RIGHT if h else _Image.FLIP_TOP_BOTTOM)


def recolour(img, table):
    """A copy with colours swapped by `table` (rgb tuple -> rgb tuple); others kept."""
    out = img.copy()
    for y in range(out.height):
        for x in range(out.width):
            c = out.getpixel((x, y))
            if c[3] and c[:3] in table:
                out.putpixel((x, y), table[c[:3]] + (255,))
    return out


def _t(c):
    return c[:3]


INK_DEEP = mix(INK, NI[0], 0.5)
# Two steps darker: the earth seen deeper down (the brief's "deep falling off toward near-ink").
EARTH_DOWN1 = {_t(E[3]): _t(E[2]), _t(E[2]): _t(E[1]), _t(E[1]): _t(E[0]), _t(E[0]): _t(mix(E[0], INK, 0.5))}
EARTH_DOWN2 = {_t(E[3]): _t(E[1]), _t(E[2]): _t(E[0]), _t(E[1]): _t(mix(E[0], INK, 0.45)), _t(E[0]): _t(mix(E[0], INK, 0.75))}
# The cave's body: the earth one step down and cooled toward night.
EARTH_CAVE = {_t(E[3]): _t(mix(E[2], NI[3], 0.35)), _t(E[2]): _t(mix(E[1], NI[2], 0.35)), _t(E[1]): _t(mix(E[0], NI[1], 0.4)),
              _t(E[0]): _t(mix(E[0], INK, 0.6))}


def _q(col, row, span=(1, 1)):
    return PL.grid_cell('ruins', col, row, PL.ruins_map, span=span)


def _qbox(x0, y0, x1, y1, w=16, h=16):
    return PL.cell('ruins', x0, y0, x1, y1, PL.ruins_map, w, h)


def _shift_up(img, n):
    out = new_tile(img.width, img.height)
    out.paste(img.crop((0, n, img.width, img.height)), (0, 0))
    return out


class Quarry(Theme):
    """Round 3: the quarry's own sheet, re-authored from the P03 grassy-ruins plate: orange-brown
    cobbled earth (4 tones) under a lime grass cap with a 1 px ink edge; scaffold planks on posts;
    rubble and bushes on top; regions for the cave (cooler, darker earth under a cut-stone floor)
    and cut stone (the depot's strongroom, the tower)."""
    name = 'quarry'
    seed = 23

    def ramps(self):
        r = Ramp(INK, E[1], E[2], E[3], E[3])
        return [r, r, r]

    def _bodies(self):
        if not hasattr(self, '_b'):
            a, b = _q(0, 1), _q(1, 1)
            self._b = [a, b, _flip(a), _flip(b), _flip(a, False), _flip(b, False)]
        return self._b

    def fills(self):
        out = [im.copy() for im in self._bodies()]
        # three more: a buried cut stone, a pebble cluster, a root (marks drawn over the plate's earth)
        st = {'#': INK, 'h': ST[3], 'b': ST[2], 's': ST[1]}
        a = out[0].copy()
        stamp(a, 4, 5, ['.####.', '#hhbb#', '#hbbs#', '#bbss#', '.####.'], st)
        b = out[1].copy()
        stamp(b, 9, 9, ['.##..', '#hb#.', '#bs##', '.##hs#', '...##.'], st)
        c = out[3].copy()
        stamp(c, 2, 3, ['r...', '.r..', '.rr.', '...r'], {'r': mix(WD[0], INK, 0.3)})
        return out + [a, b, c]

    def mark(self, img, v):
        pass

    def lip_pixels(self):
        """The plate's grass cap (row 0, column 0), as (x, y, colour) for every grass or ink pixel in
        its top rows; the top row becomes a 1 px ink edge."""
        if not hasattr(self, '_lip'):
            src = _q(0, 0)
            grass = {_t(g) for g in G} | {_t(INK)}
            px = []
            for x in range(T):
                col = [(y, src.getpixel((x, y))) for y in range(10)]
                ys = [y for y, c in col if c[3] and _t(c) in grass]
                if not ys:
                    continue
                bottom = max(ys)
                for y in range(0, bottom + 1):
                    c = src.getpixel((x, y))
                    if not c[3] or _t(c) not in grass:
                        c = G[1]
                    px.append((x, y, c))
            self._lip = px
        return self._lip

    def lip(self, img, idx):
        tops = {}
        for x, y, c in self.lip_pixels():
            put(img, x, y, c)
            tops[x] = max(tops.get(x, 0), y)
        for x in range(T):
            put(img, x, 0, INK)
            if x in tops:
                put(img, x, tops[x] + 1, mix(E[0], INK, 0.3))  # the grass's shadow on the earth
        lip_ends(img, idx, 6, INK)

    def tile(self, idx):
        img = self._bodies()[0].copy()
        open_edges(img, idx, INK, E[3], E[1])
        if not idx & 1:
            self.lip(img, idx)
        return img

    def inner(self, corner):
        img = new_tile()
        k = {'#': INK, 's': E[1], 'g': G[2], 'o': G[0]}
        if corner == 'nw':
            stamp(img, 0, 0, ['go', 'o.'], k)
        elif corner == 'ne':
            stamp(img, 14, 0, ['og', '.o'], k)
        elif corner == 'sw':
            stamp(img, 0, 14, ['s.', '#s'], k)
        else:
            stamp(img, 14, 14, ['.s', 's#'], k)
        return img

    def tops(self):
        gx = PL.GRID['ruins']['x']

        def r5(i):
            return _qbox(gx[i] + 2, 632 - 90, gx[i + 1] - 2, 632 - 2)
        return [r5(9), r5(10), r5(8), r5(7)]  # small bush, bush, low rubble, rubble heap

    top_list = [0, 1, 2, 0, 3, 2, None, None, None, None, None]

    def unders(self):
        return Ruins().unders()

    under_list = [0, 1, None, None, None, None, None]

    def oneway(self, kind):
        """Scaffold planks from the plate's bridge: posts and braces under each end."""
        if not hasattr(self, '_br'):
            gx = PL.GRID['ruins']['x']
            br = _qbox(gx[0] + 2, 632 - 90, gx[2] - 2, 632 - 2, 32, 16)
            # the plank's top edge to the tile's top (the standing surface)
            # (the posts' caps stand above the plank in the plate; the plank's top is the surface)
            top = min(y for y in range(16) if all(br.getpixel((x, y))[3] for x in range(8, 24)))
            self._br = _shift_up(br, top)
        br = self._br
        left, right = br.crop((0, 0, 16, 16)), br.crop((16, 0, 32, 16))
        if kind == 'left':
            return left
        if kind == 'right':
            return right
        # the middle: the plank band only (its rows above the first clear row under the plank)
        band = 0
        while band < 16 and all(br.getpixel((x, band))[3] for x in range(8, 24)):
            band += 1
        band = max(band, 4)
        mid = new_tile()
        piece = br.crop((10, 0, 22, band))
        for x0 in (0, 12):
            mid.paste(piece, (x0, 0))
        mid.paste(br.crop((10, 0, 14, band)), (12, 0))
        if kind == 'mid':
            return mid
        single = left.copy()
        single.paste(right.crop((8, 0, 16, 16)), (8, 0))
        return single

    def deep(self):
        return [recolour(im, EARTH_DOWN2) for im in self._bodies()[:4]]


def _cave_tile(q, idx, v=0):
    """The cave's ground: the earth cooled and darkened, a pale cut-stone floor cap."""
    img = recolour(q._bodies()[v % 6], EARTH_CAVE)
    open_edges(img, idx, INK, mix(E[2], NI[3], 0.35), mix(E[0], NI[1], 0.4))
    if not idx & 1:
        R = Ramp(INK, ST[1], ST[2], mix(ST[2], ST[3], 0.5), ST[3])
        block(img, -6, 0, 10, 6, R, seed=3, specks=1)
        block(img, 10, 0, 26, 6, R, seed=4, specks=1)
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, 6, mix(E[0], INK, 0.6))
        lip_ends(img, idx, 6)
    return img


def cave_region(q):
    blocks = [_cave_tile(q, i) for i in range(16)]
    fills = [_cave_tile(q, 15, v) for v in range(6)]
    k = {'a': NI[2], 'b': NI[3], '#': INK, 's': ST[1], 'h': ST[2]}
    t1 = new_tile()
    stamp(t1, 3, 12, ['.hh..', '#hss#', '#####'], k)
    t2 = new_tile()
    stamp(t2, 9, 13, ['.h.', '#s#'], k)
    return {'name': 'cave', 'block': blocks, 'fill': fills, 'top': [t1, t2], 'top_list': [0, 1, None, None, None],
            'under': Cellar().unders(), 'under_list': [0, 1, None, None, None]}


def _cut_tile(idx, v=0):
    """Cut stone (the plate's dressed wall), a lit cap where it is open above."""
    gx, gy = PL.GRID['ruins']['x'], PL.GRID['ruins']['y']
    col = [0, 1, 2, 0, 1, 2][v % 6]
    img = _qbox(gx[col] + 2, 512 - 90, gx[col + 1] - 2, 512 - 2)
    if v >= 3:
        img = _flip(img)
    open_edges(img, idx, INK, ST[3], ST[1])
    if not idx & 1:
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, 1, ST[3])
            put(img, x, 2, mix(ST[2], ST[3], 0.5))
            put(img, x, 3, ST[1])
            put(img, x, 4, INK)
        lip_ends(img, idx, 5)
    return img


def cutstone_region():
    return {'name': 'cutstone', 'block': [_cut_tile(i) for i in range(16)], 'fill': [_cut_tile(15, v) for v in range(6)],
            'top': [], 'top_list': [], 'under': [], 'under_list': []}


THEMES.append(Quarry())


# ---------------------------------------------------------------- cantina (round 3): re-authored from the P04 tavern plate

def _tv(col, row):
    return PL.grid_cell('tavern', col, row, PL.tavern_map)


# The plate's lilac stone one step darker: the floor's body sits under the boards, darker than them.
CASTLE_DOWN1 = {_t(CA[3]): _t(CA[2]), _t(CA[2]): _t(CA[1]), _t(CA[1]): _t(CA[0]), _t(CA[0]): _t(mix(CA[0], INK, 0.5))}
CASTLE_DOWN2 = {_t(CA[3]): _t(CA[1]), _t(CA[2]): _t(CA[0]), _t(CA[1]): _t(mix(CA[0], INK, 0.45)), _t(CA[0]): _t(mix(CA[0], INK, 0.75))}


class Cantina(Theme):
    """Round 3: the tavern's inside, re-authored from the P04 cantina tileset plate: a floor of long
    warm planks (the plate's counter top) with an ink cap, over the plate's stone one step darker;
    the top row is rafters (a region). Its back wall is a backdrop layer (backdrops.make_cantina_wall)."""
    name = 'cantina'
    indoor = True
    seed = 29

    def ramps(self):
        r = Ramp(INK, CA[0], CA[1], CA[2], CA[2])
        return [r, r, r]

    def _bodies(self):
        if not hasattr(self, '_b'):
            st = [recolour(_tv(c, 2), CASTLE_DOWN1) for c in (0, 1, 2)]
            self._b = [st[0], st[1], st[2], _flip(st[0]), _flip(st[1]), _flip(st[0], False)]
        return self._b

    def fills(self):
        out = [im.copy() for im in self._bodies()]
        return out + [out[0].copy(), out[1].copy(), out[3].copy()]

    def mark(self, img, v):
        pass

    def board(self):
        """The floor's walking boards: the top rows of the plate's counter top (row 4, column 9)."""
        if not hasattr(self, '_board'):
            src = _tv(9, 4)
            top = min(y for y in range(16) if all(src.getpixel((x, y))[3] for x in range(3, 13)))
            self._board = _shift_up(src, top)
        return self._board

    def lip(self, img, idx):
        b = self.board()
        depth = 0
        while depth < 9 and b.getpixel((8, depth))[3]:
            depth += 1
        depth = min(depth, 8)
        for y in range(depth):
            for x in range(T):
                c = b.getpixel((x, y))
                put(img, x, y, c if c[3] else WD[1])
        for x in range(T):
            put(img, x, 0, INK)
            put(img, x, depth, INK)
            put(img, x, depth + 1, mix(CA[0], INK, 0.5))
        # a board joint every 16 px, offset so boards read long
        for y in range(1, depth):
            put(img, 11, y, WD[0])
        lip_ends(img, idx, depth)

    def tile(self, idx):
        img = self._bodies()[0].copy()
        open_edges(img, idx, INK, CA[1], mix(CA[0], INK, 0.4))
        if not idx & 1:
            self.lip(img, idx)
        return img

    def inner(self, corner):
        img = new_tile()
        k = {'#': INK, 's': mix(CA[0], INK, 0.4)}
        if corner == 'nw':
            stamp(img, 0, 0, ['#s', 's.'], k)
        elif corner == 'ne':
            stamp(img, 14, 0, ['s#', '.s'], k)
        elif corner == 'sw':
            stamp(img, 0, 14, ['s.', '#s'], k)
        else:
            stamp(img, 14, 14, ['.s', 's#'], k)
        return img

    def tops(self):
        return []

    top_list = []

    def unders(self):
        return []

    under_list = []

    def oneway(self, kind):
        return plank_ledge(kind, WD)

    def deep(self):
        return [recolour(im, CASTLE_DOWN2) for im in self._bodies()[:4]]


def _rafter_tile(v=0):
    """The cantina's top row: a heavy beam along the top, the dark of the roof under it, and a
    tie-beam's end with its brace now and then (from the plate's beam cells, row 0 columns 9 and 13)."""
    src = _tv(13 if v in (1, 4) else 9, 0)
    img = src.copy()
    for y in range(T):
        for x in range(T):
            if not img.getpixel((x, y))[3]:
                put(img, x, y, NI[1])
    for x in range(T):
        put(img, x, 15, INK)
    return img


def rafters_region():
    blocks = [_rafter_tile(0) for _ in range(16)]
    fills = [_rafter_tile(v) for v in range(6)]
    return {'name': 'rafters', 'block': blocks, 'fill': fills, 'top': [], 'top_list': [], 'under': [], 'under_list': []}


THEMES.append(Cantina())
