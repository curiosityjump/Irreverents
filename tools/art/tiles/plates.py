"""Re-authoring cells from the design library's source plates (round 3).

The plates (docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/)
are painted at about 5.6 screen pixels per art pixel, on a grid of about 90 px cells, with soft
edges. A cell is re-authored as a true 16 x 16 tile: each art pixel is the median of the middle
of its source block, then mapped to the nearest colour of a palette made of the contract's master
ramps (docs/mechanisms/art-pipeline.md, "Approved Drive assets first": a plate is re-authored,
never redrawn from words when it already shows the thing). Alpha is 0 or 255.

DRAFT: the grid numbers were measured by hand from each plate's dark cell lines; a cell whose
picture sits off its grid comes out a pixel shifted and is touched up in themes (README.md).
"""
import os

from PIL import Image

from common import C, CLEAR, ROOT

LIB = os.path.join(ROOT, 'docs', 'design-library', '03-visual-direction-and-assets', 'current-pixel-art-explorations')
PLATES = {
    'ruins': 'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/grassy-ruins-pixel-art-tileset-atlas.png',
    'tavern': 'p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-tavern-hub-tileset.png',
}
# Measured cell edges (x and y in plate pixels).
GRID = {
    'ruins': {
        'x': [183, 272, 362, 452, 543, 633, 724, 813, 905, 996, 1085, 1176, 1266],
        'y': [30, 121, 210, 300, 393, 512, 632, 723, 814, 965, 1056],
    },
    # cells sit between transparent gaps; each edge is a cell's first and (last + 1) pixel
    'tavern': {
        'x': [104, 183, 261, 338, 416, 494, 573, 651, 729, 806, 885, 964, 1041, 1119, 1196, 1274, 1345],
        'y': [15, 92, 170, 243, 311, 377],
    },
}
_cache = {}


def plate(name):
    if name not in _cache:
        _cache[name] = Image.open(os.path.join(LIB, PLATES[name])).convert('RGBA')
    return _cache[name]


def palette(*ramps):
    out = []
    for r in ramps:
        out.extend(C[r] if isinstance(r, str) else [r])
    return out


def pairs_map(pairs):
    """A colour map given as (plate colour, master colour) pairs: a plate pixel takes the master
    colour of the nearest plate colour listed. Keeps a cell's tone structure (its 3-4 tones) while
    every colour that comes out is the contract's."""
    def f(c):
        best, bd = None, 1 << 30
        for s, d in pairs:
            dd = (c[0] - s[0]) ** 2 * 3 + (c[1] - s[1]) ** 2 * 4 + (c[2] - s[2]) ** 2 * 2
            if dd < bd:
                best, bd = d, dd
        return best
    return f


def nearest(c, pal):
    best, bd = None, 1 << 30
    for p in pal:
        d = (c[0] - p[0]) ** 2 * 3 + (c[1] - p[1]) ** 2 * 4 + (c[2] - p[2]) ** 2 * 2
        if d < bd:
            best, bd = p, d
    return best


def is_bg(c):
    """The plate's pale grey-white backing and its grid (not part of any tile)."""
    r, g, b = c[:3]
    return c[3] < 128 or (min(r, g, b) > 196 and max(r, g, b) - min(r, g, b) < 28)


def cell(name, x0, y0, x1, y1, pal, w=16, h=16, keep_bg=False):
    """The plate rectangle [x0, x1) x [y0, y1) as a w x h tile mapped to `pal`."""
    src = plate(name)
    out = Image.new('RGBA', (w, h), CLEAR)
    sx, sy = (x1 - x0) / w, (y1 - y0) / h
    for ty in range(h):
        for tx in range(w):
            a, b = x0 + (tx + 0.25) * sx, y0 + (ty + 0.25) * sy
            pts = []
            for k in range(3):
                for m in range(3):
                    pts.append(src.getpixel((int(a + k * sx * 0.25), int(b + m * sy * 0.25))))
            bg = sum(1 for p in pts if is_bg(p))
            if bg >= 5 and not keep_bg:
                continue
            pts = [p for p in pts if not is_bg(p)] or pts
            pts.sort(key=lambda p: p[0] * 3 + p[1] * 4 + p[2] * 2)
            med = pts[len(pts) // 2]
            out.putpixel((tx, ty), pal(med) if callable(pal) else nearest(med, pal))
    return out


def grid_cell(name, col, row, pal, inset=2, span=(1, 1)):
    g = GRID[name]
    x0, x1 = g['x'][col] + inset, g['x'][col + span[0]] - inset
    y0, y1 = g['y'][row] + inset, g['y'][row + span[1]] - inset
    if name == 'tavern':  # a 6 px transparent gap follows every cell
        x1, y1 = x1 - 5, y1 - 5
    return cell(name, x0, y0, x1, y1, pal, 16 * span[0], 16 * span[1])


def _m(a, b, t):
    from common import mix
    return mix(a, b, t)


E, G, ST, WD, NI, INKS = C['earth'], C['grass'], C['stone'], C['wood'], C['night'], C['ink']
# DRAFT: the P03 grassy-ruins plate's colours, measured (k-means on its earth, grass, stone, wood
# and cave cells), and the master colour each becomes.
RUINS_PAIRS = [
    # earth: highlight, light, body, shade, mortar
    ((252, 179, 104), E[3]), ((238, 153, 92), E[3]), ((221, 135, 93), E[2]), ((200, 119, 99), E[2]),
    ((190, 111, 99), E[1]), ((165, 101, 107), E[1]), ((130, 80, 95), E[0]),
    # grass
    ((221, 248, 62), G[3]), ((171, 228, 13), G[2]), ((127, 212, 11), G[2]), ((80, 170, 40), G[1]),
    ((50, 137, 59), G[1]), ((25, 95, 60), G[0]),
    # stone
    ((236, 231, 240), ST[3]), ((189, 187, 220), ST[3]), ((163, 163, 213), ST[2]), ((132, 132, 194), ST[1]),
    ((95, 92, 150), ST[0]),
    # wood
    ((240, 165, 99), WD[3]), ((201, 126, 95), WD[2]), ((150, 90, 70), WD[1]), ((110, 65, 60), WD[0]),
    # dark: cave mouth and outline ink
    ((52, 43, 100), NI[1]), ((44, 39, 89), INKS[0]), ((57, 56, 118), INKS[0]), ((83, 59, 88), INKS[0]),
    ((30, 25, 50), INKS[0]),
]
ruins_map = pairs_map(RUINS_PAIRS)

CA_ = C['castle']
# DRAFT: the P04 tavern plate's colours, measured, and the master colour each becomes (wood ramp for
# boards, castle ramp for its lilac stone, night for the dark between beams).
TAVERN_PAIRS = [
    ((232, 158, 97), WD[3]), ((225, 162, 102), WD[3]), ((218, 138, 93), WD[2]), ((209, 126, 88), WD[2]),
    ((197, 120, 88), WD[2]), ((189, 111, 88), WD[1]), ((179, 105, 88), WD[1]), ((163, 92, 85), WD[1]),
    ((149, 88, 91), WD[0]), ((120, 69, 86), WD[0]), ((118, 79, 99), _m(WD[0], NI[2], 0.5)),
    ((90, 73, 114), NI[2]), ((88, 62, 97), NI[1]), ((67, 42, 61), INKS[0]), ((50, 33, 57), INKS[0]),
    ((31, 22, 54), INKS[0]), ((39, 36, 89), INKS[0]),
    ((189, 184, 223), CA_[3]), ((153, 147, 208), CA_[2]), ((142, 135, 201), CA_[2]), ((113, 105, 174), CA_[1]),
    ((255, 220, 120), C['gold'][2]), ((250, 200, 90), C['gold'][2]),
]
tavern_map = pairs_map(TAVERN_PAIRS)
