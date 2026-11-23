"""Brings the chosen pieces of the art desk's P01 Ruins Starter Kit into the master palette.

    python3 -I tools/art/props/import_p01.py      (writes before/after pairs to preview/p01-*.png)

make.py calls `piece(name)` and puts the result into the fx and decor sheets (assets/fx/fx.png,
assets/decor/*.png). Nothing from P01 goes in raw (docs/decisions-log.md, 2026-11-23, "From the art
desk's ruins kit"): each piece is (1) optionally scaled down (box filter, then hard alpha at 50%),
(2) every colour snapped to the nearest colour of the master palette, no dithering, (3) the light
fringe on its edge stripped, (4) an outline re-applied (ink, or for a far-layer piece a soft
in-between shade, since far things carry no dark outline). Deterministic.

DRAFT: the scales and the far-layer greying are first choices (notes: README.md, "Decisions").
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402

from px import CLEAR, INK, P, col, mix, new  # noqa: E402
from sizes import ROOT  # noqa: E402

KIT = os.path.join(ROOT, 'docs', 'design-library', '03-visual-direction-and-assets', 'current-pixel-art-explorations',
                   'p01-ruins-starter-kit-playable-prototype', 'p01-complete', 'sprites')

# The pieces, decided in the brief (handoff-prompts/look2-props.md, section 2): file, scale, layer.
PIECES = {
    'impact_star': ('vfx/impact_star.png', 0.94, 'fx'),
    'spark_slash': ('vfx/spark_slash.png', 30 / 42, 'fx'),
    'big_barrel': ('props/big_barrel.png', 0.5, 'back'),
    'small_barrel': ('props/small_barrel.png', 0.5, 'back'),
    'lantern_post': ('props/lantern_post.png', 0.75, 'back'),
    'ruin_arch': ('props/ruin_arch.png', 1.0, 'far'),
    'broken_column': ('props/broken_column.png', 0.8, 'far'),
}

# every colour of the master palette (sky and cloud excepted: no piece is sky)
PALETTE = [col(name, i) for name in P if name not in ('sky', 'cloud') for i in range(len(P[name]))]


# DRAFT (round 3): the courtyard's arches are raised toward the near layer's ramp (less greyed), so they read as
# clean stone beside the ground lane's art rather than a blotchy wash. Undo: delete the entry.
FAR_GREY = {'ruin_arch': 0.18, 'broken_column': 0.25}
CLEAN = True

RAMP_OF = {col(name, i)[:3]: name for name in P for i in range(len(P[name]))}


def clean(im):
    from collections import Counter
    from srcimport import majority_pass
    used = Counter(im.getpixel((x, y)) for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3])
    keep = {}
    for c, n in used.most_common():
        r = RAMP_OF.get(c[:3], 'other')
        keep.setdefault(r, [])
        if len(keep[r]) < 3:
            keep[r].append(c)
    remap = {}
    for c in used:
        r = RAMP_OF.get(c[:3], 'other')
        if c not in keep[r]:
            remap[c] = min(keep[r], key=lambda k: sum((k[i] - c[i]) ** 2 for i in range(3)))
    for y in range(im.height):
        for x in range(im.width):
            c = im.getpixel((x, y))
            if c in remap:
                im.putpixel((x, y), remap[c])
    for _ in range(2):
        im = majority_pass(im)
    return im


def lum(c):
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def nearest(c):
    best, bd = None, None
    for p in PALETTE:
        # weighted RGB distance (green counts most, as the eye does)
        d = 2 * (c[0] - p[0]) ** 2 + 4 * (c[1] - p[1]) ** 2 + 3 * (c[2] - p[2]) ** 2
        if bd is None or d < bd:
            best, bd = p, d
    return best


def raw(name):
    return Image.open(os.path.join(KIT, PIECES[name][0])).convert('RGBA')


def piece(name, far_to=None):
    src = raw(name)
    _, k, layer = PIECES[name]
    if k != 1.0:
        w, h = max(1, round(src.width * k)), max(1, round(src.height * k))
        # premultiply so transparent pixels do not bleed their colour into the edge
        src = src.resize((w, h), Image.BOX)
    im = new(src.width, src.height)
    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = src.getpixel((x, y))
            if a >= 128:
                im.putpixel((x, y), nearest((r, g, b)))
    # strip the light fringe: a light pixel touching the outside is the painting's halo
    edge = lambda x, y: any(im.getpixel((x + dx, y + dy))[3] == 0 if 0 <= x + dx < im.width and 0 <= y + dy < im.height else True
                            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    for _ in range(2):
        drop = [(x, y) for y in range(im.height) for x in range(im.width)
                if im.getpixel((x, y))[3] and edge(x, y) and lum(im.getpixel((x, y))) > 185 and layer != 'fx']
        for x, y in drop:
            im.putpixel((x, y), CLEAR)
    # round 3 (handoff-prompts/look3-props.md, 7): the painted speckle goes. Each material keeps at most its three
    # most-used tones (the rest go to the nearest kept one), then a pixel no neighbour shares takes the
    # neighbours' most common colour, twice. Effects keep every stroke.
    if layer != 'fx' and CLEAN:
        im = clean(im)
    # far-layer pieces are greyed toward the far colours and lose the dark outline
    if layer == 'far':
        to = far_to or col('far', 2)
        for y in range(im.height):
            for x in range(im.width):
                c = im.getpixel((x, y))
                if c[3]:
                    im.putpixel((x, y), mix(c, to, FAR_GREY.get(name, 0.35)))
    # the outline, re-applied on the silhouette's own edge
    line = INK if layer != 'far' else mix(col('stone', 1), col('far', 1), 0.3)
    if layer == 'fx':
        # thin effect strokes keep every painted pixel; the ink goes round the outside (1 px margin)
        big = new(im.width + 2, im.height + 2)
        big.paste(im, (1, 1))
        ring = [(x, y) for y in range(big.height) for x in range(big.width) if big.getpixel((x, y))[3] == 0 and any(
            0 <= x + dx < big.width and 0 <= y + dy < big.height and big.getpixel((x + dx, y + dy))[3]
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for x, y in ring:
            big.putpixel((x, y), line)
        return big
    pts = [(x, y) for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3] and edge(x, y)]
    for x, y in pts:
        im.putpixel((x, y), line)
    return im


def main():
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'preview')
    os.makedirs(out, exist_ok=True)
    for name in PIECES:
        a, b = raw(name), piece(name)
        k = 4
        pair = Image.new('RGBA', ((a.width + b.width + 6) * k, max(a.height, b.height) * k), (120, 170, 220, 255))
        pair.alpha_composite(a.resize((a.width * k, a.height * k), Image.NEAREST), (0, 0))
        pair.alpha_composite(b.resize((b.width * k, b.height * k), Image.NEAREST), ((a.width + 6) * k, 0))
        pair.save(os.path.join(out, 'p01-%s.png' % name))
        bb = b.tobytes()
        colours = len({bb[i:i + 4] for i in range(0, len(bb), 4) if bb[i + 3]})
        print('%-14s %dx%d -> %dx%d, %d colours' % (name, a.width, a.height, b.width, b.height, colours))


if __name__ == '__main__':
    main()
