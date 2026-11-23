"""DRAFT: imports the owner's canon heroes (P03) to native-size sprite frames.

    python3 -I tools/art/heroes/p03.py      (normally run by make.py)

Source: the owner-locked P03 hero sheet, doc 36
(docs/design-library/03-visual-direction-and-assets/36-canon-playable-...md),
`pixel-heroes-action-sprite-sheet.png`: three rows (grappler, infiltrator,
flyer) of 13 poses. The partial 18-pose extraction beside it is the first six
columns of the same sheet at 0.39x; we cut every pose from the sheet itself
so that all 13 columns pass through one and the same downscale (see
README.md, "Decisions", round 3).

For each pose: take the connected figure (fx marks, "!!" and swirls are
separate pieces and drop out), cut away the burst/slash/rock where it touches,
drop the ground shadow, then downscale to the hero's native height by a
weighted vote per target pixel over the source pixels it covers, already
quantised to the master palette (in-between shades of its hues only),
harden alpha to 0/255 and re-ink a 1 px outline in `ink`. Same bytes every
run: no randomness, no clock.

`pose(hero, col)` returns a native RGBA numpy array, feet on its last row.
"""
import os
from collections import deque

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
SHEET = os.path.join(
    ROOT, 'docs', 'design-library', '03-visual-direction-and-assets', 'current-pixel-art-explorations',
    'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets', 'pixel-heroes-action-sprite-sheet.png')


def hx(s):
    s = s.lstrip('#')
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


INK = hx('#2b2140')
INK_SOFT = hx('#4a3a5e')

# ---------------------------------------------------------------- palettes
# Master-palette ramps (docs/mechanisms/art-pipeline.md). Lists are dark -> light.
R = {
    'ink': ['#2b2140', '#4a3a5e'],
    # DRAFT: the canon faces are yellow-tan, between the cream/skin and gold
    # ramps; two in-between shades of those hues, no new hue.
    'face': ['#c88a5a', '#e8a860', '#f8cc78', '#ffe4a0'],
    'gold': ['#a8651a', '#e09a1e', '#ffd23f', '#fff1a0'],
    'orange': ['#b0481a', '#e8742a', '#ffa048', '#ffd090'],
    'earth': ['#6b3f2a', '#94583a', '#c07a4a', '#e3a56b'],
    'wood': ['#5a3420', '#8a5230', '#b97a40', '#e0a860'],
    'red': ['#8a1c3a', '#c8324a', '#f0596a', '#ff9aa0'],
    'pink': ['#b03a78', '#e860a0', '#ff98c0', '#ffd0e0'],
    'blue': ['#263a8c', '#3c62d0', '#5c92f5', '#a0c8ff'],
    'teal': ['#16607a', '#1e98a8', '#40d0c8', '#a0f0e0'],
    'grass': ['#1f7a3d', '#2fa84a', '#5fd35a', '#a8f070'],
    'metal': ['#6a7890', '#9aa8c0', '#d0dcec', '#ffffff'],
}

PAL = {
    'grappler': ['ink', 'face', 'gold', 'orange', 'earth', 'red', 'blue', 'teal', 'metal'],
    'infiltrator': ['ink', 'face', 'grass', 'red', 'pink', 'earth', 'wood', 'teal', 'metal', 'gold'],
    'flyer': ['ink', 'face', 'pink', 'red', 'gold', 'orange', 'earth', 'teal', 'metal'],
}


def palette(hero):
    out = []
    for r in PAL[hero]:
        for c in R[r]:
            if hx(c) not in out:
                out.append(hx(c))
    return np.array(out, dtype=np.int32)


# ---------------------------------------------------------------- source poses
# Rows of the sheet (y range) and, per column, a seed point inside the figure.
ROW_Y = {'grappler': 340, 'infiltrator': 600, 'flyer': 860}
COL_X = [68, 184, 290, 392, 487, 582, 684, 790, 914, 1005, 1118, 1240, 1362]
# Per (hero, col): rectangles (absolute sheet coords) cleared before the
# figure is taken: the strike burst, the slash, the rock, the chest, the coin.
CUT = {
    ('grappler', 7): [(832, 280, 870, 395)],
    ('grappler', 9): [(950, 230, 1070, 301)],  # the rock, down to the top of the fists

    ('infiltrator', 9): [(1015, 560, 1080, 650)],
    ('flyer', 9): [(1018, 790, 1070, 850)],
}
# Per (hero, col): the blue swing fx are cleared by colour (nothing of the hero is blue-white).
BLUE_FX = {('infiltrator', 7), ('flyer', 7)}
# Per (hero, col): a seed x where COL_X falls on a cut-away piece.
SEED_X = {('infiltrator', 7): 772, ('flyer', 7): 780}  # rows above this in col 9 that are rock grey are cleared

_sheet = None
METHOD = 'box'
INK_AT = 0.4  # DRAFT: share of a target pixel's footprint that must be line work to draw ink
SMOOTH = 5  # DRAFT: 0 turns the mode filter off


def sheet():
    global _sheet
    if _sheet is None:
        _sheet = np.array(Image.open(SHEET).convert('RGBA')).astype(np.int32)
    return _sheet


def _component(mask, seed):
    """The 4-connected piece of `mask` holding `seed` (y, x) (or the nearest set pixel)."""
    H, W = mask.shape
    sy, sx = seed
    if not mask[sy, sx]:
        ys, xs = np.nonzero(mask)
        k = int(np.argmin((ys - sy) ** 2 + (xs - sx) ** 2))
        sy, sx = int(ys[k]), int(xs[k])
    out = np.zeros_like(mask)
    out[sy, sx] = True
    q = deque([(sy, sx)])
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not out[yy, xx]:
                out[yy, xx] = True
                q.append((yy, xx))
    return out


def source(hero, col):
    """The pose cut from the sheet: RGBA int array, transparent outside the figure."""
    s = sheet()
    y0 = ROW_Y[hero] - 130
    y1 = ROW_Y[hero] + 75
    x0 = max(0, COL_X[col] - 75)
    x1 = min(s.shape[1], COL_X[col] + 75)
    a = s[y0:y1, x0:x1].copy()
    for (cx0, cy0, cx1, cy1) in CUT.get((hero, col), []):
        a[max(0, cy0 - y0):max(0, cy1 - y0), max(0, cx0 - x0):max(0, cx1 - x0), 3] = 0
    rgb = a[:, :, :3]
    if (hero, col) in BLUE_FX:
        r_, g_, b_ = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
        fx = ((b_ > r_ + 50) & (b_ > 140)) | ((r_ > 200) & (g_ > 215) & (b_ > 235))
        a[fx, 3] = 0
    mask = a[:, :, 3] > 128
    # the ground shadow: blue-grey pixels in the bottom rows
    ys = np.nonzero(mask.any(1))[0]
    bottom = ys.max()
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    shadowy = (b > r + 12) & (b > g + 8) & (b < 170) & (r < 110)
    rows = np.zeros(mask.shape, bool)
    rows[bottom - 9:] = True
    mask &= ~(shadowy & rows)
    # low-alpha fringe under the feet (the shadow's soft edge)
    fig = _component(mask, (ROW_Y[hero] - y0, SEED_X.get((hero, col), COL_X[col]) - x0))
    a[~fig, 3] = 0
    a[fig, 3] = 255
    ys, xs = np.nonzero(fig)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


# Height of the idle figure on the sheet, per hero: the scale reference.
def ref_height(hero):
    return source(hero, 0).shape[0]


# ---------------------------------------------------------------- downscale
def _nearest(pal, rgb):
    """Index of the nearest palette colour per pixel (redmean distance)."""
    flat = rgb.reshape(-1, 3)[:, None, :]
    p = pal[None, :, :]
    rm = (flat[:, :, 0] + p[:, :, 0]) / 2
    d = (flat - p)
    dist = (2 + rm / 256) * d[:, :, 0] ** 2 + 4 * d[:, :, 1] ** 2 + (2 + (255 - rm) / 256) * d[:, :, 2] ** 2
    return np.argmin(dist, axis=1).reshape(rgb.shape[:2])


def native(src, scale, hero, ink_weight=1.7, cover=0.42):
    """Downscale `src` (RGBA) by `scale`, feet on the last row, centred on the figure."""
    pal = palette(hero)
    idx = _nearest(pal, src[:, :, :3])
    mask = src[:, :, 3] > 0
    H, W = mask.shape
    h = max(1, int(round(H * scale)))
    w = max(1, int(round(W * scale)))
    sy = H / h
    sx = W / w
    out = np.zeros((h, w, 4), np.uint8)
    ink_i = [i for i, c in enumerate(pal.tolist()) if tuple(c) in (INK, INK_SOFT)]
    for oy in range(h):
        for ox in range(w):
            ya, yb = int(oy * sy), max(int(oy * sy) + 1, int(round((oy + 1) * sy)))
            xa, xb = int(ox * sx), max(int(ox * sx) + 1, int(round((ox + 1) * sx)))
            m = mask[ya:yb, xa:xb]
            if m.mean() < cover:
                continue
            ids = idx[ya:yb, xa:xb][m]
            # darkness counts for more: thin outlines and eyes survive the vote
            cnt = np.bincount(ids, minlength=len(pal)).astype(float)
            lum = pal.sum(1)
            cnt *= np.where(lum < 200, ink_weight, 1.0)
            k = int(np.argmax(cnt))
            out[oy, ox, :3] = pal[k]
            out[oy, ox, 3] = 255
    return out


def native_box(src, scale, hero, cover=0.42, ink_at=None):
    """Area-average the source, lines and fills apart: a target pixel is ink when
    enough of its footprint is the source's dark line work (`ink_at`), else the
    average of its non-line pixels snapped to the palette. Keeping the lines out
    of the fills' average is what keeps the fills clean at native size."""
    if ink_at is None:
        ink_at = INK_AT
    pal = palette(hero)
    H, W = src.shape[:2]
    h = max(1, int(round(H * scale)))
    w = max(1, int(round(W * scale)))
    m = (src[:, :, 3] > 0)
    dark = m & (src[:, :, :3].sum(2) < 170)
    fill = (m & ~dark).astype(np.float64)

    def box(x):
        im = Image.fromarray(x.astype(np.float32), mode='F')
        return np.array(im.resize((w, h), Image.BOX), dtype=np.float64)
    cov = box(m.astype(np.float64))
    cink = box(dark.astype(np.float64))
    cfill = box(fill)
    rgb = src[:, :, :3].astype(np.float64) * fill[:, :, None]
    acc = np.stack([box(rgb[:, :, i]) for i in range(3)], 2)
    col = acc / np.maximum(cfill, 1e-6)[:, :, None]
    idx = _nearest(pal, col)
    out = np.zeros((h, w, 4), np.uint8)
    on = cov >= cover
    out[on, :3] = pal[idx[on]]
    out[on, 3] = 255
    inky = on & ((cink >= ink_at * cov) | (cfill < 0.15 * cov))
    out[inky, :3] = INK
    return out


def despeckle(a, passes=1):
    """A lone pixel unlike all four neighbours takes their commonest colour (ink is kept)."""
    a = a.copy()
    for _ in range(passes):
        h, w = a.shape[:2]
        b = a.copy()
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if a[y, x, 3] == 0 or tuple(a[y, x, :3]) == INK:
                    continue
                nb = [tuple(a[y + dy, x + dx]) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))]
                if any(n[3] == 0 for n in nb):
                    continue
                me = tuple(a[y, x])
                if me in nb:
                    continue
                from collections import Counter
                c = Counter(n for n in nb if n[:3] != INK).most_common(1)
                if c and c[0][1] >= 2:
                    b[y, x] = c[0][0]
        a = b
    return a


def smooth(a, need=5):
    """Mode filter for the inside: a non-ink pixel whose 8 neighbours hold `need`
    or more of one other non-ink colour takes it (flattens the source's noise
    into readable masses; outlines and eyes are ink and stay)."""
    from collections import Counter
    h, w = a.shape[:2]
    b = a.copy()
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if a[y, x, 3] == 0 or tuple(a[y, x, :3]) == INK:
                continue
            nb = [tuple(a[y + dy, x + dx]) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]
            c = Counter(n for n in nb if n[3] and n[:3] != INK).most_common(1)
            if c and c[0][1] >= need and c[0][0] != tuple(a[y, x]):
                b[y, x] = c[0][0]
    return b


def outline(a, color=INK):
    """Opaque pixels next to transparency (4-way) or the edge become ink."""
    m = a[:, :, 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    a = a.copy()
    a[edge, :3] = color
    return a


def darks_to_ink(a):
    """Near-black interior pixels become the one ink colour."""
    a = a.copy()
    rgb = a[:, :, :3].astype(int)
    dark = (rgb.sum(2) < 200) & (a[:, :, 3] > 0)
    a[dark, :3] = INK
    return a


def pose(hero, col, height):
    """The canon pose at native size: the idle figure is `height` px tall."""
    src = source(hero, col)
    scale = height / ref_height(hero)
    a = native_box(src, scale, hero) if METHOD == 'box' else native(src, scale, hero)
    a = darks_to_ink(a)
    a = despeckle(a)
    if SMOOTH:
        a = smooth(a, SMOOTH)
    a = outline(a)
    # trim
    ys, xs = np.nonzero(a[:, :, 3])
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/p03.png'
    H = {'grappler': 31, 'infiltrator': 23, 'flyer': 26}
    cell = 48
    img = Image.new('RGBA', (cell * 13, cell * 3), (92, 86, 144, 255))
    for r, hero in enumerate(['grappler', 'infiltrator', 'flyer']):
        for c in range(13):
            p = pose(hero, c, H[hero])
            im = Image.fromarray(p)
            img.alpha_composite(im, (c * cell + (cell - im.width) // 2, r * cell + cell - 2 - im.height))
    img.resize((img.width * 4, img.height * 4), Image.NEAREST).save(out)
