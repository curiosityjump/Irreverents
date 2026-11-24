"""The forest's tile sheet (Step 15), cut from the owner's approved P10 terrain rows.

    python3 -I tools/art/tiles/forest.py

Writes assets/tiles/forest.png (128 x 256), byte-identical every run. Same layout as
assets/tiles/quarry.png (README.md, "Sheet layout"), so content/atlases/forest-road.json and
forest-trail.json index it with the quarry's cell coordinates.

Sources:
- TRN-01 (grass-capped cobbled earth): the native-density prefab ground_wide.png from
  docs/design-library/03-visual-direction-and-assets/p10-trn01-grass-prefab-conversion-prototype/.
  Its cobbles are about 10 x 8 art pixels; each is cut and resampled to 8 x 8 so four make one
  seamless 16 x 16 earth cell (mortar on each cobble's left and top). The grass cap is a 16-wide
  window of its lip (the one whose two edges match best, measured below).
- TRN-10 (mushroom hollows): the first, long mushroom cap of the P10 TRN-10 row, a crop of the
  plate (in the repository, hidden from a blob-limited checkout; MUSHROOM below says
  where it is looked for). Its art density was measured at about 2.6 source px per art pixel
  (cap 175 x 30 source px -> 67 x 12), downsampled by the median of the middle of each block.
  If the crop is missing, quarry.png's one-way cells are kept (the program says so).

Everything is mapped to the contract's master palette (common.C) through measured
(plate colour, master colour) pairs; alpha is 0 or 255; no anti-aliasing.

DRAFT: a stand-in cut by a program (docs/mechanisms/art-pipeline.md). Kept from quarry.png / the
Quarry theme: the inner corners, the tops (P03 bushes and rubble), the unders, the marks on the
last three fills (a buried stone, pebbles, a root, drawn by Quarry.fills over the TRN-01 earth),
and rows 8-15 (the quarry's cave and cut-stone regions, which the forest atlases do not use). The
P03 plate those came from is not in the mirror, so they are copied from quarry.png's pixels.
"""
import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

import make as M  # noqa: E402
import plates as PL  # noqa: E402
from common import ASSETS, C, CLEAR, ROOT, T  # noqa: E402
from themes import Quarry  # noqa: E402
from tiles_draw import INK, lip_ends, new_tile, open_edges, put  # noqa: E402

PREFAB = os.path.join(ROOT, 'docs', 'design-library', '03-visual-direction-and-assets',
                      'p10-trn01-grass-prefab-conversion-prototype', 'p10-trn01-prefab-conversion', 'sprites',
                      'ground_wide.png')
# The TRN-10 crop is in the repository but a clone with blob_limit_kb leaves it out of the working
# tree (skip-worktree); read it from git's object store (git fetches it on demand), or FOREST_TRN10.
MUSHROOM_REPO = ('docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/'
                 'p10-owner-selected-tagged-terrain-and-interactables/row-crops/'
                 'trn-10-mushroom-hollows-bounce-platforms.png')
MUSHROOM = os.environ.get('FOREST_TRN10', os.path.join(ROOT, MUSHROOM_REPO))
if not os.path.exists(MUSHROOM):
    import subprocess, tempfile  # noqa: E401
    _blob = subprocess.run(['git', '-C', ROOT, 'show', 'HEAD:' + MUSHROOM_REPO], capture_output=True).stdout
    if _blob:
        MUSHROOM = os.path.join(tempfile.mkdtemp(), 'trn-10.png')
        open(MUSHROOM, 'wb').write(_blob)

E, G, RD, CR = C['earth'], C['grass'], C['red'], C['cream']

# DRAFT: measured colour clusters of TRN-01 (luminance bands of its earth and grass) and the master
# colour each becomes: four earth tones, the darkest bands to ink; grass to the grass ramp.
TRN01_PAIRS = [
    ((240, 184, 107), E[3]), ((236, 163, 90), E[3]), ((220, 143, 92), E[2]), ((194, 123, 102), E[1]),
    ((165, 107, 110), E[1]), ((147, 92, 106), E[0]), ((117, 79, 100), E[0]), ((88, 71, 96), INK),
    ((63, 62, 88), INK), ((42, 47, 85), INK),
    ((213, 245, 26), G[3]), ((185, 231, 35), G[3]), ((156, 216, 41), G[2]), ((128, 205, 37), G[2]),
    ((98, 188, 49), G[2]), ((82, 162, 61), G[1]), ((59, 144, 62), G[1]), ((49, 113, 73), G[0]),
    ((35, 89, 70), G[0]), ((19, 87, 41), G[0]), ((10, 81, 20), G[0]),
]
trn01_map = PL.pairs_map(TRN01_PAIRS)
# DRAFT: TRN-10's cap colours, measured (column samples through the cap and a spot), and the master
# colour each becomes: the red ramp for the cap, cream for the spots, ink for the outline.
TRN10_PAIRS = [
    ((250, 157, 152), RD[3]), ((255, 136, 130), RD[3]), ((247, 96, 105), RD[2]), ((249, 84, 98), RD[2]),
    ((237, 64, 84), RD[2]), ((221, 42, 74), RD[1]), ((196, 29, 73), RD[1]), ((170, 40, 88), RD[0]),
    ((130, 82, 108), RD[0]), ((112, 27, 46), INK), ((98, 17, 58), INK), ((45, 10, 40), INK), ((100, 68, 91), INK),
    ((253, 226, 173), CR[2]), ((246, 205, 159), CR[1]), ((216, 168, 132), CR[0]), ((174, 122, 134), CR[0]),
]
trn10_map = PL.pairs_map(TRN10_PAIRS)


def _bg(c):
    """Transparent, or the plates' pale white matte and its grey halo (near-neutral and light; the
    cap's cream spots are light too, but warm)."""
    return c[3] < 128 or (min(c[:3]) > 185 and max(c[:3]) - min(c[:3]) < 36)


def mapped(img, pal):
    out = Image.new('RGBA', img.size, CLEAR)
    for y in range(img.height):
        for x in range(img.width):
            c = img.getpixel((x, y))
            if not _bg(c):
                out.putpixel((x, y), pal(c))
    return out


def resample(src, x0, y0, x1, y1, w, h, pal):
    """src's rectangle [x0, x1) x [y0, y1) as w x h: each pixel the median (by brightness) of the
    middle of its block, mapped with `pal`; mostly-background blocks stay clear."""
    out = Image.new('RGBA', (w, h), CLEAR)
    sx, sy = (x1 - x0) / w, (y1 - y0) / h
    for ty in range(h):
        for tx in range(w):
            pts = []
            for k in range(3):
                for m in range(3):
                    px = min(src.width - 1, int(x0 + (tx + 0.25 + 0.25 * k) * sx))
                    py = min(src.height - 1, int(y0 + (ty + 0.25 + 0.25 * m) * sy))
                    pts.append(src.getpixel((px, py)))
            if sum(1 for p in pts if _bg(p)) >= 5:
                continue
            pts = [p for p in pts if not _bg(p)]
            pts.sort(key=lambda p: p[0] * 3 + p[1] * 4 + p[2] * 2)
            out.putpixel((tx, ty), pal(pts[len(pts) // 2]))
    return out


# ---------------------------------------------------------------- TRN-01: cobbles and the grass cap

_prefab = Image.open(PREFAB).convert('RGBA')
GW = mapped(_prefab, trn01_map)
# DRAFT: measured from ground_wide's darkness profile: mortar columns at x 14/24/34/44/54/64 and
# mortar rows at y 21 and 29 (the band at 13 is the grass's ink underside).
COB_X = [14, 24, 34, 44, 54]
COB_ROWS = {'upper': 14, 'lower': 21}


def cobble(i, row):
    """Cobble i (0-4) of a row as 8 x 8, its mortar on its left column and top row."""
    x0 = COB_X[i]
    if row == 'lower':
        out = resample(_prefab, x0, 21, x0 + 10, 29, 8, 8, trn01_map)
    else:
        # the upper row starts under the grass's ink band (rows 13-14): its mortar is row 21, rolled
        # to the top, over the body (rows 15-20)
        out = new_tile(8, 8)
        out.paste(resample(_prefab, x0, 21, x0 + 10, 22, 8, 1, trn01_map), (0, 0))
        out.paste(resample(_prefab, x0, 15, x0 + 10, 21, 8, 7, trn01_map), (0, 1))
    # DRAFT: the prefab's mortar is only a little darker than a cobble's shade (both map to E[1]);
    # one step darker on the mortar line keeps the cobbles apart at 16 px.
    down = {E[1][:3]: E[0], E[2][:3]: E[1], E[3][:3]: E[2]}
    for k in range(8):
        for x, y in ((0, k), (k, 0)):
            c = out.getpixel((x, y))
            if c[3] and c[:3] in down:
                out.putpixel((x, y), down[c[:3]])
    return out


def earth(picks):
    """A 16 x 16 earth cell from four cobbles: picks = ((i, row), ...) for NW NE SW SE."""
    img = new_tile()
    for (i, row), (x, y) in zip(picks, [(0, 0), (8, 0), (0, 8), (8, 8)]):
        img.paste(cobble(i, row), (x, y))
    return img


def best_lip_x():
    """The 16-wide window of the grass cap whose left and right edges join best when repeated."""
    def col(x):
        return [GW.getpixel((x, y)) for y in range(LIP_Y0, LIP_Y1)]

    best, bd = None, None
    for x0 in range(8, 80 - 8 - 16):
        a, b = col(x0), col(x0 + 16)
        d = sum(1 for p, q in zip(a, b) if p != q)
        if bd is None or d < bd:
            best, bd = x0, d
    return best


# DRAFT: the cap's rows in ground_wide: its dark top outline is row 3, the drips end on row 13.
LIP_Y0, LIP_Y1 = 3, 14
GRASS = {g[:3] for g in G} | {INK[:3]}


class Forest(Quarry):
    """The quarry's sheet with TRN-01's cobbles and grass cap and TRN-10's mushroom ledges."""
    name = 'forest'
    seed = 31

    def _bodies(self):
        if not hasattr(self, '_b'):
            a = earth([(0, 'lower'), (1, 'lower'), (2, 'upper'), (3, 'upper')])
            b = earth([(4, 'lower'), (2, 'lower'), (1, 'upper'), (0, 'upper')])
            c = earth([(3, 'lower'), (0, 'lower'), (4, 'upper'), (2, 'upper')])
            # DRAFT: no flips (a flipped cell would move its mortar to the right and bottom
            # and draw a double mortar line against its neighbour); three more cobble mixes instead
            d = earth([(2, 'lower'), (4, 'lower'), (0, 'upper'), (1, 'upper')])
            e = earth([(1, 'lower'), (3, 'lower'), (3, 'upper'), (4, 'upper')])
            f = earth([(4, 'upper'), (1, 'upper'), (2, 'lower'), (3, 'lower')])
            self._b = [a, b, c, d, e, f]
        return self._b

    def lip_pixels(self):
        if not hasattr(self, '_lip'):
            x0 = best_lip_x()
            px = []
            for y in range(LIP_Y0, LIP_Y1):
                for x in range(T):
                    c = GW.getpixel((x0 + x, y))
                    if y < 9 and (not c[3] or c[:3] not in GRASS):
                        c = G[3]  # the cap's solid middle (a halo pixel in the prefab)
                    if c[3] and c[:3] in GRASS:
                        px.append((x, y - LIP_Y0, c))
            self._lip = px
        return self._lip

    def lip(self, img, idx):
        for x, y, c in self.lip_pixels():
            put(img, x, y, c)
        lip_ends(img, idx, LIP_Y1 - LIP_Y0 - 3, INK)

    def tile(self, idx):
        img = self._bodies()[0].copy()
        open_edges(img, idx, INK, E[3], E[1])
        if not idx & 1:
            self.lip(img, idx)
        return img

    def oneway(self, kind):
        cap = mushroom_cap()
        if cap is None:
            return QUARRY_SHEET.crop(tuple(v * T for v in M.ONEWAY[kind]) + tuple((v + 1) * T for v in M.ONEWAY[kind]))
        w = cap.width
        if kind == 'left':
            return _pad(cap.crop((0, 0, 16, cap.height)))
        if kind == 'right':
            return _pad(cap.crop((w - 16, 0, w, cap.height)))
        if kind == 'mid':
            x0 = mid_x(cap)
            return _pad(cap.crop((x0, 0, x0 + 16, cap.height)))
        img = new_tile(16, cap.height)
        img.paste(cap.crop((0, 0, 8, cap.height)), (0, 0))
        img.paste(cap.crop((w - 8, 0, w, cap.height)), (8, 0))
        return _pad(img)


def _pad(img):
    out = new_tile()
    out.paste(img, (0, 0))
    return out


# DRAFT: the first (long) mushroom of TRN-10: its cap spans x 9-184 and y 0-30 of the crop (measured);
# 67 x 12 art pixels at the measured ~2.6 source px per art pixel.
CAP_BOX = (9, 0, 184, 30)
CAP_SIZE = (67, 12)
_cap = []


def mid_x(cap):
    """The 16-wide middle window whose two edges join best when it repeats."""
    def col(x):
        return [cap.getpixel((x, y)) for y in range(cap.height)]
    best, bd = None, None
    for x0 in range(16, cap.width - 32):
        d = sum(1 for p, q in zip(col(x0), col(x0 + 16)) if p != q)
        if bd is None or d < bd:
            best, bd = x0, d
    return best


def mushroom_cap():
    if not _cap:
        if not os.path.exists(MUSHROOM):
            print('forest.py: TRN-10 crop not found (%s); keeping quarry.png one-way cells' % MUSHROOM)
            _cap.append(None)
        else:
            src = Image.open(MUSHROOM).convert('RGBA')
            cap = resample(src, *CAP_BOX, *CAP_SIZE, trn10_map)
            top = min(y for y in range(cap.height) if any(cap.getpixel((x, y))[3] for x in range(cap.width)))
            cap = cap.crop((0, top, cap.width, cap.height))
            # the brightest middles of the cream spots read as matte: fill a row's holes with cream
            for y in range(cap.height):
                xs = [x for x in range(cap.width) if cap.getpixel((x, y))[3]]
                for x in range(xs[0], xs[-1] + 1) if xs else ():
                    if not cap.getpixel((x, y))[3]:
                        cap.putpixel((x, y), CR[2])
            _cap.append(cap)
    return _cap[0]


QUARRY_SHEET = Image.open(os.path.join(ASSETS, 'tiles', 'quarry.png')).convert('RGBA')


# DRAFT: (Step 15 push 4, the lead's look pass of 12:20 UTC) the forest's own earth: TRN-01's cobbles
# were mapped to the quarry's orange earth ramp; the forest takes the same cobbles two tones down, a
# dark loam (earth's lit tones become wood's and earth's shadows, the shadows go to ink), so the trail
# no longer reads as the quarry's ground. Applied to every ground cell (rows 0-4: the block, inner
# corners, fills, unders, deep), never to grass, rubble or ink. To undo: drop forest_earth() from main.
# Push 4c (the orchestrator's look at the shots: "still reads as a warm mid-brown cobble"): one more
# step down and cooler: the lit face is earth's darkest, the body wood's darkest, the shadows the
# cool ink ramp.
LOAM = {E[3][:3]: E[0], E[2][:3]: C['wood'][0], E[1][:3]: C['ink'][1], E[0][:3]: C['ink'][0]}
# DRAFT: a little moss in the loam (one fleck in about 40 earth pixels, by a position hash): the
# forest floor is damp. Foliage's darkest, so it sits back.
MOSS = C['foliage'][0]


def forest_earth(sheet):
    for y in range(0, 5 * T):
        for x in range(sheet.width):
            c = sheet.getpixel((x, y))
            if c[3] and c[:3] in LOAM:
                n = LOAM[c[:3]]
                if c[:3] in (E[3][:3], E[2][:3]) and (x * 7919 + y * 104729) % 41 == 0:
                    n = MOSS
                sheet.putpixel((x, y), n)


# DRAFT: the back of a pocket underground (crawl, tunnel, chamber, hollow, the deep level): the deep
# cells' loam two more steps down, toward night, so a hollow reads as dark earth behind, not as the
# sky. Placed as `far` decor over each pocket (content/decor/forest-trail.json, written by
# tools/art/tiles/forest_decor.py), in the indoor back-wall slots [0..3, 6] the forest does not use.
CAVE = {E[0][:3]: C['night'][3], C['wood'][0][:3]: C['night'][2], C['ink'][1][:3]: C['night'][1],
        C['ink'][0][:3]: C['night'][0], MOSS[:3]: C['night'][2]}


def cave_back(sheet):
    out = []
    for cx, cy in M.DEEP_CELLS:
        img = sheet.crop((cx * T, cy * T, (cx + 1) * T, (cy + 1) * T)).convert('RGBA')
        for y in range(T):
            for x in range(T):
                c = img.getpixel((x, y))
                img.putpixel((x, y), CAVE.get(c[:3], C['night'][1]) if c[3] else C['night'][1])
        out.append(img)
    return out


# DRAFT: the backdrop without its seam. forest-waterfall.png is the BKG-01 preview's two 320-wide
# views side by side, with a hard step at x 320 (the panorama's middle is missing). The glade is its
# first view and that view mirrored, so x 320 joins pixel for pixel; a sideways phone shows about
# 375 px of it, so the mirrored half is mostly off screen. Swap back to forest-waterfall.png (or to
# the full panorama, asked of Vision Partner) in content/backdrops/forest-*.json.
def glade_backdrop():
    src = Image.open(os.path.join(ASSETS, 'backdrops', 'forest-waterfall.png')).convert('RGBA')
    left = src.crop((0, 0, 320, src.height))
    out = Image.new('RGBA', (640, src.height), CLEAR)
    out.paste(left, (0, 0))
    out.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (320, 0))
    return out


def main():
    """quarry.png, with the cells the forest re-cuts pasted over it (in build_sheet's order)."""
    f = Forest()
    sheet = QUARRY_SHEET.copy()

    def place(img, cell):
        sheet.paste(img, (cell[0] * T, cell[1] * T))

    for idx in range(16):
        place(f.tile(idx), [M.ORIGIN[0] + idx % 4, M.ORIGIN[1] + idx // 4])
    fills = f.fills()
    for v, cell in enumerate(M.FILL):
        place(fills[v], cell)
    for kind, cell in M.ONEWAY.items():
        place(f.oneway(kind), cell)
    for img, cell in zip(f.deep(), M.DEEP_CELLS):
        place(img, cell)
    forest_earth(sheet)
    for i, img in enumerate(cave_back(sheet)):
        place(img, [i, 6])
    M.save(sheet, 'tiles/forest.png')
    M.save(glade_backdrop(), 'backdrops/forest-glade.png')


if __name__ == '__main__':
    main()
