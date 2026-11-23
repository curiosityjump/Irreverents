"""Cuts the cast's people out of the art desk's source sheets (P03, P04, P07, P08).

DRAFT: round 3 of the look (handoff-prompts/look3-cast.md). The sheets are
1448x1086 AI-illustrated plates: uneven alpha, irregular cells, a soft
purple ground shadow under every figure, effects (stars, swirls, sweat
drops, swooshes) floating around them. Nothing goes in raw. One cut:

  1. crop the cell's rectangle from the plate;
  2. keep pixels with alpha >= 128; drop the ground shadow (its own flat
     blue-purple, in the bottom fifth) and every island that does not
     touch the largest one (the effects), unless asked to keep them;
  3. downscale by a vote: each output pixel takes the commonest
     master-palette colour among the source pixels it covers (ink votes
     a little louder, so the outline survives), transparent when most of
     them are;
  4. re-ink: every opaque pixel on the silhouette's edge becomes ink;
     lone specks are removed.

The result is a small RGBA image with alpha 0 or 255 and its foot point
(the bottom-centre of the figure's feet). Deterministic: no clock, no
random numbers.
"""
import os

from PIL import Image

from px import RAMP, INK, SOFT, hexc

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
LIB = os.path.join(ROOT, 'docs', 'design-library', '03-visual-direction-and-assets', 'current-pixel-art-explorations')

SHEETS = {
    'cantina': 'p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-npc-sprite-sheet.png',
    'villains': 'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/pixel-villain-sprite-sheet.png',
    'town': 'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/retro-town-npc-sprite-sheet.png',
    'p07enemy': 'p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/chibi-enemy-animation-sprite-sheet.png',
    'p07npc': 'p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/colorful-chibi-npc-sprite-sheet.png',
    'p08enemy': 'p08-additional-townsfolk-enemies-building-blocks-biomes-source/chibi-enemy-animation-sprite-atlas.png',
    'p08town': 'p08-additional-townsfolk-enemies-building-blocks-biomes-source/vibrant-chibi-townsfolk-sprite-atlas.png',
}

# The colours a cut may use: the contract's ramps that people are made of.
# (sky, grass, foliage, far and castle are the world's, not a person's.)
_USE = ['ink', 'soft', 'skin', 'earth', 'wood', 'gold', 'red', 'blue', 'purple', 'teal', 'orange', 'pink',
        'metal', 'stone', 'grass', 'night']
PALETTE = []
for _k in _USE:
    if _k == 'ink':
        PALETTE.append(INK)
    elif _k == 'soft':
        PALETTE.append(SOFT)
    else:
        PALETTE.extend(RAMP[_k])
# skin's darkest tone is used for shade; one warm in-between keeps tan faces tan, not orange
PALETTE.append(hexc('e0a878'))
PALETTE = list(dict.fromkeys(PALETTE))

_cache = {}
_near = {}


def plate(key):
    if key not in _cache:
        im = Image.open(os.path.join(LIB, SHEETS[key])).convert('RGBA')
        _cache[key] = (im.width, im.height, im.load())
    return _cache[key]


def nearest(c, drop=()):
    """The palette colour nearest c; `drop` names ramps this cut may not use (the guard's
    periwinkle helmet is blue, not purple)."""
    k = (c[0] >> 2, c[1] >> 2, c[2] >> 2, drop)
    if k in _near:
        return _near[k]
    r, g, b = (k[0] << 2) + 2, (k[1] << 2) + 2, (k[2] << 2) + 2
    best, bd = None, None
    banned = {q for name in drop for q in RAMP[name]}
    for p in PALETTE:
        if p in banned:
            continue
        rm = (r + p[0]) / 2
        d = (2 + rm / 256) * (r - p[0]) ** 2 + 4 * (g - p[1]) ** 2 + (2 + (255 - rm) / 256) * (b - p[2]) ** 2
        if bd is None or d < bd:
            best, bd = p, d
    _near[k] = best
    return best


def _shadowish(c):
    r, g, b = c
    # the plates' ground shadow: a flat, mid-dark blue-purple
    return 40 <= r <= 95 and 40 <= g <= 85 and 85 <= b <= 140 and b - r >= 25 and b - g >= 30


def cut(key, rect, scale, keep_islands=False, erase=(), shadow=True, minisle=0, drop=()):
    """-> (image, (footx, footy)) for the plate `key`'s rectangle (x0, y0, x1, y1).

    erase: rectangles in plate coordinates whose pixels are dropped first
    (an effect touching the body, a horn to be drawn by another lane).
    """
    W, H, px = plate(key)
    x0, y0, x1, y1 = rect
    w, h = x1 - x0, y1 - y0
    solid = [[False] * w for _ in range(h)]
    col = [[None] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            sx, sy = x0 + x, y0 + y
            if not (0 <= sx < W and 0 <= sy < H):
                continue
            r, g, b, a = px[sx, sy]
            if a < 128:
                continue
            if any(ex0 <= sx < ex1 and ey0 <= sy < ey1 for ex0, ey0, ex1, ey1 in erase):
                continue
            if shadow and y > h * 0.72 and _shadowish((r, g, b)):
                continue
            solid[y][x] = True
            col[y][x] = (r, g, b)
    # islands: keep the largest (the body) unless asked to keep them all
    lab = [[0] * w for _ in range(h)]
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            if solid[y][x] and not lab[y][x]:
                n += 1
                stack = [(x, y)]
                lab[y][x] = n
                cnt = 0
                while stack:
                    cx, cy = stack.pop()
                    cnt += 1
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and solid[ny][nx] and not lab[ny][nx]:
                            lab[ny][nx] = n
                            stack.append((nx, ny))
                sizes[n] = cnt
    if not sizes:
        raise SystemExit('nothing in %s %r' % (key, rect))
    big = max(sizes, key=lambda k: (sizes[k], -k))
    keep = {k for k, s in sizes.items() if k == big or (keep_islands and s >= max(minisle, 40))}
    for y in range(h):
        for x in range(w):
            if solid[y][x] and lab[y][x] not in keep:
                solid[y][x] = False
    ys = [y for y in range(h) for x in range(w) if solid[y][x]]
    xs = [x for y in range(h) for x in range(w) if solid[y][x]]
    bx0, bx1, by0, by1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    ow = max(1, int(round((bx1 - bx0) * scale)))
    oh = max(1, int(round((by1 - by0) * scale)))
    out = Image.new('RGBA', (ow, oh), (0, 0, 0, 0))
    op = out.load()
    for oy in range(oh):
        sy0 = by0 + int(oy / scale)
        sy1 = max(sy0 + 1, by0 + int((oy + 1) / scale))
        for ox in range(ow):
            sx0 = bx0 + int(ox / scale)
            sx1 = max(sx0 + 1, bx0 + int((ox + 1) / scale))
            votes = {}
            empty = 0
            tot = 0
            for sy in range(sy0, min(sy1, by1)):
                for sx in range(sx0, min(sx1, bx1)):
                    tot += 1
                    if not solid[sy][sx]:
                        empty += 1
                        continue
                    p = nearest(col[sy][sx], drop)
                    votes[p] = votes.get(p, 0) + (1.45 if p == INK else 1.0)
            if not votes or empty > tot * 0.55:
                continue
            best = max(votes, key=lambda p: (votes[p], p))
            op[ox, oy] = best + (255,)
    _clean(out)
    _ink(out)
    # the foot point: the middle of the legs (the bottom fifth's opaque span), on the bottom row
    fy = oh
    low = [x for y in range(max(0, oh - max(2, oh // 5)), oh) for x in range(ow) if op[x, y][3]]
    fx = (min(low) + max(low) + 1) / 2 if low else ow / 2
    return out, (fx, fy)


def _clean(im):
    p = im.load()
    for _ in range(2):
        drop = []
        for y in range(im.height):
            for x in range(im.width):
                if not p[x, y][3]:
                    continue
                nb = sum(1 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                         if 0 <= x + dx < im.width and 0 <= y + dy < im.height and p[x + dx, y + dy][3])
                if nb <= 1:
                    drop.append((x, y))
        for x, y in drop:
            p[x, y] = (0, 0, 0, 0)


def _ink(im):
    p = im.load()
    edge = []
    for y in range(im.height):
        for x in range(im.width):
            if not p[x, y][3]:
                continue
            if any(not (0 <= x + dx < im.width and 0 <= y + dy < im.height) or not p[x + dx, y + dy][3]
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                edge.append((x, y))
    for x, y in edge:
        p[x, y] = INK + (255,)
