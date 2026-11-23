"""Round 2 pictures for the props lane: impact effects, the pixel font, glows, hide folds.

Used by make.py. DRAFT: stand-ins drawn by a program (handoff-prompts/look2-props.md).
Deterministic, whole pixels, the master palette; alpha 0 or 255 except glows (three levels).
"""
import math

from PIL import Image

import font
import import_p01
from px import CLEAR, INK, SOFT, col, mix, new, outline, paste, put

GOLD = [col('gold', i) for i in range(4)]
ORANGE = [col('orange', i) for i in range(4)]
WHITE = col('metal', 3)
CREAM = [col('skin', i) for i in range(3)]
STONE = [col('stone', i) for i in range(4)]


def strip(frames):
    w, h = frames[0].size
    im = new(w * len(frames), h)
    for i, f in enumerate(frames):
        im.paste(f, (i * w, 0))
    return im


def star_mask(cx, cy, r_out, r_in, points=8, turn=0.0):
    """Pixels inside an n-point star (pixel-centre test)."""
    poly = []
    for i in range(points * 2):
        a = math.pi * i / points + turn - math.pi / 2
        r = r_out if i % 2 == 0 else r_in
        poly.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    out = set()
    for y in range(int(cy - r_out) - 1, int(cy + r_out) + 2):
        for x in range(int(cx - r_out) - 1, int(cx + r_out) + 2):
            px, py = x + 0.5, y + 0.5
            inside = False
            j = len(poly) - 1
            for i in range(len(poly)):
                xi, yi = poly[i]
                xj, yj = poly[j]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi:
                    inside = not inside
                j = i
            if inside:
                out.add((x, y))
    return out


def disc(cx, cy, r):
    return {(x, y) for y in range(int(cy - r) - 1, int(cy + r) + 2) for x in range(int(cx - r) - 1, int(cx + r) + 2)
            if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r}


def paint_star(im, cx, cy, r_out, r_in, turn=0.0):
    """A bold star: gold rim, bright gold body, pale gold inner star, white core, ink outline."""
    outer = star_mask(cx, cy, r_out, r_in, 8, turn)
    mid = star_mask(cx, cy, r_out * 0.72, r_in * 0.72, 8, turn)
    inner = star_mask(cx, cy, r_out * 0.42, r_in * 0.5, 8, turn)
    core = disc(cx, cy, max(1.5, r_in * 0.45))
    for p in outer:
        put(im, p[0], p[1], GOLD[1])
    for p in mid:
        put(im, p[0], p[1], GOLD[2])
    for p in inner:
        put(im, p[0], p[1], GOLD[3])
    for p in core:
        put(im, p[0], p[1], WHITE)
    return im


def sparks(im, cx, cy, dist, size=2, n=8, turn=0.0):
    for i in range(n):
        a = 2 * math.pi * i / n + turn
        x, y = int(round(cx + dist * math.cos(a))), int(round(cy + dist * math.sin(a)))
        for dy in range(size):
            for dx in range(size):
                put(im, x + dx, y + dy, GOLD[3] if (dx + dy) == 0 else GOLD[2])


def inked(im):
    return outline(im)


# ---------------------------------------------------------------- impact

def fx_hit():
    """32 x 32, 5 frames: pops in oversized (the imported P01 star, filled and cored), holds, shrinks,
    scatters sparks."""
    frames = []
    imported = import_p01.piece('impact_star')  # 32 x 25 including its ink ring
    f0 = new(32, 32)
    paint_star(f0, 16, 16, 14.5, 7)
    f0 = inked(f0)
    ox, oy = (32 - imported.width) // 2, (32 - imported.height) // 2
    for y in range(imported.height):  # the imported star's painted strokes, without its own ink ring
        for x in range(imported.width):
            c = imported.getpixel((x, y))
            if c[3] and c[:3] != INK[:3] and f0.getpixel((ox + x, oy + y))[3] and f0.getpixel((ox + x, oy + y))[:3] != INK[:3]:
                put(f0, ox + x, oy + y, c)
    for p in disc(16, 16, 3.5):
        put(f0, p[0], p[1], WHITE)
    frames.append(f0)
    f1 = new(32, 32)
    paint_star(f1, 16, 16, 14, 6.8, turn=math.pi / 8)
    frames.append(inked(f1))
    f2 = new(32, 32)
    paint_star(f2, 16, 16, 10.5, 5, turn=0)
    f2 = inked(f2)
    sparks(f2, 15, 15, 13, 2, 4, math.pi / 4)
    frames.append(f2)
    f3 = new(32, 32)
    paint_star(f3, 16, 16, 6.5, 3.2, turn=math.pi / 8)
    sparks(f3, 15, 15, 12, 2, 8, math.pi / 8)
    frames.append(inked(f3))
    f4 = new(32, 32)
    sparks(f4, 15, 15, 14, 2, 8, math.pi / 8)
    for p in disc(16, 16, 1.5):
        put(f4, p[0], p[1], GOLD[3])
    frames.append(inked(f4))
    return strip(frames)


def fx_swing_grappler():
    """32 x 32, 3 frames, centred on the fist: a chunky punch burst, not a blade."""
    frames = []
    for i, (r, rays, ray_len) in enumerate(((6, 4, 4), (9, 6, 6), (11, 6, 3))):
        im = new(32, 32)
        cx, cy = 16, 16
        # thick rays first
        for k in range(rays):
            a = 2 * math.pi * k / rays + (math.pi / rays if i == 1 else 0)
            for t in range(r - 1, r + ray_len):
                for w in (-1, 0, 1):
                    x = cx + t * math.cos(a) - w * math.sin(a)
                    y = cy + t * math.sin(a) + w * math.cos(a)
                    put(im, int(round(x)), int(round(y)), GOLD[2] if t < r + ray_len - 1 else GOLD[3])
        ring = disc(cx, cy, r)
        hole = disc(cx, cy, r - 2) if i == 2 else set()
        for p in ring - hole:
            put(im, p[0], p[1], ORANGE[3] if (p[0] - cx) + (p[1] - cy) < 0 else GOLD[2])
        if i < 2:
            for p in disc(cx, cy, 3.5 + 2 * i):
                put(im, p[0], p[1], WHITE)
        if i == 2:  # breaking up: knock gaps into the ring
            for k in range(6):
                a = 2 * math.pi * k / 6 + math.pi / 6
                for t in range(r - 3, r + 1):
                    put(im, int(round(cx + t * math.cos(a))), int(round(cy + t * math.sin(a))), CLEAR)
        frames.append(inked(im))
    return strip(frames)


def fx_slash():
    """32 x 32, 5 frames, from the imported P01 spark slash: sweeps in, full, thins, breaks, sparkles."""
    sl = import_p01.piece('spark_slash')  # 32 x 22 with its ink ring
    w, h = sl.size
    oy = (32 - h) // 2
    frames = []
    f = new(32, 32)
    half = sl.crop((0, 0, w, h // 2 + 2))
    paste(f, half, 0, oy)
    frames.append(f)
    f = new(32, 32)
    paste(f, sl, 0, oy)
    frames.append(f)
    f = new(32, 32)
    paste(f, sl, 0, oy)
    for y in range(32):
        for x in range(32):
            c = f.getpixel((x, y))
            if c[3] and c[:3] != INK[:3] and x < 10:
                put(f, x, y, CLEAR)
    frames.append(inked(f) if False else f)
    f = new(32, 32)
    small = sl.resize((w * 2 // 3, h * 2 // 3), Image.NEAREST)
    paste(f, small, 10, oy + 4)
    frames.append(f)
    f = new(32, 32)
    for x, y in ((24, 9), (27, 16), (22, 23), (13, 26)):
        for dx, dy in ((0, 0), (1, 0), (0, 1), (-1, 0), (0, -1)):
            put(f, x + dx, y + dy, col('blue', 3) if (dx, dy) != (0, 0) else WHITE)
    frames.append(inked(f))
    return strip(frames)


def fx_dust():
    """24 x 24, 5 frames: outlined puffs with a darker shade tone; grow, then thin out."""
    frames = []
    sets = [
        [(12, 16, 3.5), (8, 17, 2.5)],
        [(11, 14, 5), (6, 16, 3.5), (16, 16, 3.5)],
        [(11, 12, 6), (5, 15, 4), (17, 14, 4.5), (12, 18, 3.5)],
        [(8, 10, 4), (17, 11, 4), (12, 17, 3)],
        [(7, 8, 2.5), (17, 9, 2.5), (12, 16, 2)],
    ]
    light, body, shade = CREAM[2], mix(CREAM[2], STONE[3], 0.5), STONE[2]
    for puffs in sets:
        im = new(24, 24)
        for cx, cy, r in puffs:
            for p in disc(cx, cy, r):
                d = (p[0] + 0.5 - cx) * 0.6 + (p[1] + 0.5 - cy) * 0.8
                put(im, p[0], p[1], light if d < -r * 0.35 else body if d < r * 0.3 else shade)
        frames.append(outline(im, SOFT))
    return strip(frames)


# ---------------------------------------------------------------- the font

def font_strip(dark=True):
    """95 cells of 6 x 10: dark ink letters (for paper), or cream letters with a 1 px ink shadow."""
    im = new(95 * 6, 10)
    for i in range(95):
        rows = font.glyph(chr(32 + i))
        x0 = i * 6
        if not dark:
            for y, row in enumerate(rows):
                for x, ch in enumerate(row):
                    if ch == '#':
                        put(im, x0 + x + 1, y + 1, INK)
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch == '#':
                    put(im, x0 + x, y, INK if dark else CREAM[2])
    return im


# ---------------------------------------------------------------- glows (blend: "lighter")

def glow(r_outer, warm=True, alphas=(28, 52, 92)):
    """Stepped rings, at most three alpha levels, no gradient. Square, the light at the centre."""
    size = r_outer * 2
    im = new(size, size)
    cols = [ORANGE[1], ORANGE[2], GOLD[3]] if warm else [col('blue', 1), col('blue', 3), col('metal', 3)]
    for ring, (r, a) in enumerate(zip((r_outer, r_outer * 0.66, r_outer * 0.36), alphas)):
        c = cols[ring][:3] + (a,)
        for p in disc(r_outer, r_outer, r):
            put(im, p[0], p[1], c)
    return im


# ---------------------------------------------------------------- hide folds

def hide_front(w, h, curtain):
    """The curtain's front fold: the curtain itself with its outer edges cleared (2 px each side on a
    one-tile curtain, 4 on a wider one) so a body hidden behind it shows only at the edges."""
    im = curtain.copy()
    edge = 2 if w == 1 else 4
    for y in range(im.height):
        for x in range(im.width):
            if x < edge or x >= im.width - edge:
                if y > 3:  # the rod stays whole
                    put(im, x, y, CLEAR)
    return im
