"""Round 3: bring a piece of an art-desk source plate into the game's pixels.

The source plates (docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p03..p08)
are painted at about 5x a game pixel, with uneven alpha, a coloured fringe and irregular cells. The asset desk's
rule is to use a strong source rather than draw a generic one, after "isolate, harden alpha, map to the master
palette, re-ink, test at 320x180". `grab()` does exactly that, deterministically:

1. crop the box given (sheet pixels) and keep pixels with alpha >= 150 (hard alpha); with `largest`, only the
   biggest 8-connected blob (the piece itself, not its neighbour's fringe);
2. snap every kept pixel to the nearest colour of the ramps given (by material: wood, gold, red ...), at full size;
3. shrink by the scale given, each game pixel taking the most common snapped colour of the source pixels under
   it (a mode, never an average: no mud between materials), empty where most of it was empty;
4. a majority pass: a pixel whose colour none of its 8 neighbours shares takes the most common neighbour colour
   (the painted speckle goes);
5. re-ink: every opaque pixel on the silhouette's edge becomes ink (or `edge`), as the clean art beside it.

DRAFT: scales, boxes and ramps are first choices (README.md, "Round 3").
"""
import os
from collections import Counter

from PIL import Image

from px import INK, P, col, new
from sizes import ROOT

LIB = os.path.join(ROOT, 'docs', 'design-library', '03-visual-direction-and-assets', 'current-pixel-art-explorations')
SHEETS = {
    'tavern': 'p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-tavern-hub-tileset.png',
    'interact': 'p04-cantina-props-vehicles-hall-visual-source-sheets/chibi-pixel-interactables-sprite-sheet.png',
    'vehicle': 'p04-cantina-props-vehicles-hall-visual-source-sheets/chibi-vehicle-and-mount-sprite-sheet.png',
    'villain': 'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/pixel-villain-sprite-sheet.png',
    'vfx': 'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/pixel-art-vfx-and-pickup-atlas.png',
    'ruins': 'p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/grassy-ruins-pixel-art-tileset-atlas.png',
    'secrets': 'p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-secrets-doors-breakables-source.png',
    'hud': 'p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-ui-hero-party-hud-source.png',
    'brawl': 'p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-brawl-hit-ko-respawn-source.png',
    'ui': 'p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/irreverents-pixel-ui-atlas.png',
    'vibrant': 'p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/vibrant-platformer-interactables-sprite-sheet.png',
    'biome': 'p08-additional-townsfolk-enemies-building-blocks-biomes-source/chibi-pixel-biome-tileset-atlas.png',
    'platformer': 'p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/pixel-art-platformer-tileset-atlas.png',
    'powers': 'p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-rare-powers-pickups-source.png',
    'hall': 'p04-cantina-props-vehicles-hall-visual-source-sheets/hall-of-legends-tile-atlas.png',
    'fantasy': 'p08-additional-townsfolk-enemies-building-blocks-biomes-source/colorful-retro-fantasy-tileset-atlas.png',
}
_cache = {}


def sheet(name):
    if name not in _cache:
        _cache[name] = Image.open(os.path.join(LIB, SHEETS[name])).convert('RGBA')
    return _cache[name]


def ramps(*names):
    out = []
    for n in names:
        if n in P:
            out += [col(n, i) for i in range(len(P[n]))]
        else:
            out.append(col(n) if isinstance(n, str) else n)
    return out


def nearest(c, pal):
    best, bd = None, None
    for p in pal:
        d = 2 * (c[0] - p[0]) ** 2 + 4 * (c[1] - p[1]) ** 2 + 3 * (c[2] - p[2]) ** 2
        if bd is None or d < bd:
            best, bd = p, d
    return best


def _largest(mask, w, h):
    seen = [False] * (w * h)
    best = []
    for start in range(w * h):
        if not mask[start] or seen[start]:
            continue
        comp, stack = [], [start]
        seen[start] = True
        while stack:
            i = stack.pop()
            comp.append(i)
            x, y = i % w, i // w
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < w and 0 <= yy < h:
                        j = yy * w + xx
                        if mask[j] and not seen[j]:
                            seen[j] = True
                            stack.append(j)
        if len(comp) > len(best):
            best = comp
    keep = [False] * (w * h)
    for i in best:
        keep[i] = True
    return keep


def grab(name, box, scale, pal, largest=True, dark_ink=60, edge=INK, majority=True, fill=0.5, size=None, key=None, grid=False):
    """box: (x0, y0, x1, y1) on the sheet; scale: game px per sheet px (e.g. 0.25), or size=(w, h) exactly.
    pal: the colours allowed (ramps(...)); a source pixel darker than `dark_ink` (luminance) becomes ink."""
    src = sheet(name).crop(box)
    w, h = src.size
    px = src.load()
    mask = [px[i % w, i // w][3] >= 150 for i in range(w * h)]
    if key:
        # a plate painted on an opaque pale ground (P03 grassy ruins): pixels near that ground are empty
        # only ground connected to the crop's edge goes, so a white inside the piece (a skull) stays
        kr, kg, kb = key
        near = [abs(px[i % w, i // w][0] - kr) + abs(px[i % w, i // w][1] - kg) + abs(px[i % w, i // w][2] - kb) < 60
                for i in range(w * h)]
        stack = [i for i in range(w * h) if near[i] and (i % w in (0, w - 1) or i // w in (0, h - 1))]
        gone = set(stack)
        while stack:
            i = stack.pop()
            mask[i] = False
            x, y = i % w, i // w
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h:
                    j = yy * w + xx
                    if near[j] and j not in gone:
                        gone.add(j)
                        stack.append(j)
    if grid:
        # the plate's own cell grid: a dark line running most of the crop's height or width. Its pixels go
        # wherever the line crosses empty ground (beside it, 3 px out, is empty), so the piece keeps its outline.
        lum = lambda i: 0.2126 * px[i % w, i // w][0] + 0.7152 * px[i % w, i // w][1] + 0.0722 * px[i % w, i // w][2]
        dark = [mask[i] and lum(i) < 110 for i in range(w * h)]
        cols = [x for x in range(w) if sum(dark[y * w + x] for y in range(h)) > 0.5 * h]
        rows = [y for y in range(h) if sum(dark[y * w + x] for x in range(w)) > 0.5 * w]
        drop = []
        for x in cols:
            for y in range(h):
                l, r = x - 3, x + 3
                if (l < 0 or not mask[y * w + l]) or (r >= w or not mask[y * w + r]):
                    drop.append(y * w + x)
        for y in rows:
            for x in range(w):
                u, d = y - 3, y + 3
                if (u < 0 or not mask[u * w + x]) or (d >= h or not mask[d * w + x]):
                    drop.append(y * w + x)
        for i in drop:
            if dark[i]:
                mask[i] = False
        for x in cols:  # the line's 1-2 px neighbours too
            for dx in (-1, 1):
                if 0 <= x + dx < w:
                    for y in range(h):
                        i = y * w + x + dx
                        if dark[i] and (x + 2 * dx < 0 or x + 2 * dx >= w or not mask[y * w + x + 2 * dx]):
                            mask[i] = False
    if largest:
        mask = _largest(mask, w, h)
    snap = {}
    full = [None] * (w * h)
    for i in range(w * h):
        if not mask[i]:
            continue
        r, g, b, _ = px[i % w, i // w]
        if 0.2126 * r + 0.7152 * g + 0.0722 * b < dark_ink:
            full[i] = INK
            continue
        k = (r >> 2, g >> 2, b >> 2)
        if k not in snap:
            snap[k] = nearest((r, g, b), pal)
        full[i] = snap[k]
    # trim to the piece
    xs = [i % w for i in range(w * h) if full[i]]
    ys = [i // w for i in range(w * h) if full[i]]
    x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    sw, sh = x1 - x0, y1 - y0
    if size:
        ow, oh = size
    else:
        ow, oh = max(1, round(sw * scale)), max(1, round(sh * scale))
    out = new(ow, oh)
    for oy in range(oh):
        for ox in range(ow):
            ax, bx = x0 + ox * sw // ow, x0 + max(ox * sw // ow + 1, (ox + 1) * sw // ow)
            ay, by = y0 + oy * sh // oh, y0 + max(oy * sh // oh + 1, (oy + 1) * sh // oh)
            cnt = Counter()
            empty = 0
            for yy in range(ay, by):
                for xx in range(ax, bx):
                    c = full[yy * w + xx]
                    if c is None:
                        empty += 1
                    else:
                        cnt[c] += 1
            tot = empty + sum(cnt.values())
            if not cnt or sum(cnt.values()) < tot * fill:
                continue
            # ink only wins a cell when it is most of it: thick painted outlines thin to the 1 px re-ink
            best = cnt.most_common()
            c = best[0][0]
            if c == INK and len(best) > 1 and best[0][1] < 0.6 * sum(cnt.values()):
                c = best[1][0]
            out.putpixel((ox, oy), c)
    if majority:
        out = majority_pass(out)
    return reink(out, edge)


def majority_pass(im, keep=(INK,)):
    src = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            c = src.getpixel((x, y))
            if not c[3]:
                continue
            nb = Counter()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx or dy:
                        xx, yy = x + dx, y + dy
                        if 0 <= xx < im.width and 0 <= yy < im.height:
                            n = src.getpixel((xx, yy))
                            if n[3]:
                                nb[n] += 1
            if nb and nb[c] == 0 and c not in keep:
                im.putpixel((x, y), nb.most_common(1)[0][0])
    return im


def reink(im, edge=INK):
    """Opaque pixels on the silhouette's edge become `edge` (None: leave them)."""
    if edge is None:
        return im
    src = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if not src.getpixel((x, y))[3]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if not (0 <= xx < im.width and 0 <= yy < im.height) or not src.getpixel((xx, yy))[3]:
                    im.putpixel((x, y), edge)
                    break
    return im
