"""Cut the owner's biome panoramas (BKG-01, BKG-02) into game backdrops.

    python3 -I tools/art/backgrounds/import_panoramas.py

Reads each 1024x180 panorama from the design-library mirror and writes
assets/backdrops/<pack>-<biome>.png (and a -haze copy where HAZE names one), the centre 960x180 (whole pixels, no
resampling), and prints the average colour of its top two rows: the sky colour
a backdrop file puts above it for a view taller than 180.

DRAFT (biome-backgrounds brief, docs/plan/step-8.md "Biome backgrounds"):
960, not 1024, because a backdrop layer is 320 px wide or a multiple
(scripts/lib/art-images.ts, INTENT: the contract); 32 px off each side is
painted edge the camera rarely reached. Cut from the mirror, never hand-copied,
so a re-delivered panorama is one re-run. A panorama the mirror holds but the
sparse clone left off disk is read from git (`git show HEAD:<path>`).
"""
import io
import os
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
LIB = 'docs/design-library/03-visual-direction-and-assets'
BKG01 = LIB + '/bkg-01-runtime-biome-panoramas-1024x180/backgrounds/'
BKG02 = LIB + '/bkg-02-six-runtime-biome-panoramas-1024x180/backgrounds/'

# (asset name, mirror path). Every panorama of both packs is cut, used or not, so placing
# one later is a content edit only.
PANORAMAS = [
    ('bkg01-forest-waterfall', BKG01 + 'forest-waterfall-1024x180.png'),
    ('bkg01-ice-cavern', BKG01 + 'ice-cavern-1024x180.png'),
    ('bkg01-iron-quarry-evening', BKG01 + 'iron-quarry-evening-1024x180.png'),
    ('bkg01-market-town-day', BKG01 + 'market-town-day-1024x180.png'),
    ('bkg01-moonlit-castle', BKG01 + 'moonlit-castle-1024x180.png'),
    ('bkg01-ruins-day', BKG01 + 'ruins-day-1024x180.png'),
    ('bkg01-sky-islands-sunset', BKG01 + 'sky-islands-sunset-1024x180.png'),
    ('bkg01-volcanic-forge', BKG01 + 'volcanic-forge-1024x180.png'),
    ('bkg02-forest-ruins-day', BKG02 + 'forest-ruins-day-1024x180.png'),
    ('bkg02-ice-cavern-ruins', BKG02 + 'ice-cavern-ruins-1024x180.png'),
    ('bkg02-market-town-day', BKG02 + 'market-town-day-1024x180.png'),
    ('bkg02-moonlit-stronghold', BKG02 + 'moonlit-stronghold-1024x180.png'),
    ('bkg02-sky-isles-day', BKG02 + 'sky-isles-day-1024x180.png'),
    ('bkg02-volcanic-forge-sunset', BKG02 + 'volcanic-forge-sunset-1024x180.png'),
]
WIDTH = 960

# DRAFT (the Step 22 lead's ask, 2026-11-24): a hazed copy, every pixel mixed this share of the
# way toward the panorama's own top-row colour, for a place whose real thin planks must not be
# mistaken for the painted scaffolds behind them (the quarry's quiet way). Raise or drop the share
# here; the room file names which cut it draws.
HAZE = {'bkg01-iron-quarry-evening': 0.35}

# DRAFT (the orchestrator's rulings after the look, 2026-11-24 ~16:50 UTC): what a room draws is the
# "-far" cut: hazed this share toward its sky (painted ledges, mushrooms and scaffolds must not read
# as things to stand on beside real ones: lighter and plainer with distance, the contract), and with
# FADE px added on top that carry its own top rows up into the sky colour, softening in 4-px steps,
# so a view taller than 180 never shows a flat band with a hard line. Raising a share here and
# re-running is the whole change; a panorama not named here gets no -far cut.
FAR = {
    'bkg01-forest-waterfall': 0.0,  # third pass: 45% went muddy; forest-trail's caps are hazed locally (LOCAL)
    'bkg01-iron-quarry-evening': 0.5,
    'bkg01-ruins-day': 0.3,
    'bkg02-forest-ruins-day': 0.3,
    'bkg02-market-town-day': 0.3,
}
FADE = 180
STEP = 4

# DRAFT (the orchestrator's third-pass rulings, 2026-11-24 17:21 UTC): a copy of a "-far" cut for one
# room, hazed toward its sky only inside soft ellipses (centre x, centre y, radius x, radius y in the
# 960x180 cut; full strength inside half the radius, easing to none at the edge, so no box shows), so
# one painted thing that sits beside a real one of the same shape reads as background while the rest
# keeps full colour. Forest-trail's real mushroom caps stand beside the panorama's two painted mushroom
# groups; forest-road, which has no caps to confuse, keeps them red. The room file names the cut;
# dropping an ellipse here and re-running is the undo.
LOCAL = {
    'bkg01-forest-waterfall-far-caps-hazed': ('bkg01-forest-waterfall', 0.45, [(156, 96, 70, 66), (904, 112, 84, 80)]),
    # DRAFT (brief phone-legibility-pass, item 4): quarry-road's left painted decks (the scaffold's railed deck at
    # x 0-90, y 55-85, and the lower deck at x 80-170, y 110-145) sat at chest height level with a real plank;
    # shifting the whole panorama made it worse (the third pass), so here they are washed nearly into the sky
    # (85%): mist over the scaffold, not a ledge. Only quarry-road draws this cut; ridge and depot keep '-far'.
    'bkg01-iron-quarry-evening-far-decks-hazed': ('bkg01-iron-quarry-evening', 0.85, [(40, 70, 130, 46), (125, 128, 110, 36)]),
}


# DRAFT (brief phone-legibility-pass, the third look: forest-trail's top was "a smeared, blocky
# green-yellow glow where the first generation showed painted canopy"; the street's strip under the
# eave "blocky, upscaled"; the camp's "a blurry dark tree blob"): a "-mirror" cut that carries the
# painting's own top rows upward unblurred, reflected (row 0 meets row 0, so there is no seam), as
# many times as it takes, mixed toward `toward` (None: the panorama's sky colour) up to `strength`
# at its top, eased. `height` px are added on top. The room file names the cut; its own `sky`
# should be the colour the cut ends in (printed), so nothing above it changes colour. The forest
# darkens into deeper leaves (so the trail is under a canopy); the street and the camp fade into
# their sky. `ramp`: px over which the mix reaches `strength` (0: the whole height); `shift`: how far each further reflection slides sideways (tried on the forest: it cut hard seams between bands, so 0). `clone`: spans of the reflected rows replaced by another span (x0, x1, from x). `rows`: how many of the painting's top rows are reflected (the canopy's, not the
# trunks under it). `caps` (optional): LOCAL's ellipses, hazed the same way.
MIRROR = {
    'bkg01-forest-waterfall-mirror-caps-hazed': dict(src='bkg01-forest-waterfall', rows=56, height=320, toward=(24, 52, 38), strength=0.85, ramp=120, clone=[(470, 700, 240)], caps=(0.45, [(156, 96, 70, 66), (904, 112, 84, 80)])),
    'bkg02-market-town-day-mirror': dict(src='bkg02-market-town-day', rows=8, height=180, toward=None, strength=1.0, haze=0.3, ramp=40),
    'bkg02-forest-ruins-day-mirror': dict(src='bkg02-forest-ruins-day', rows=16, height=180, toward=None, strength=1.0, haze=0.3, ramp=72),
}


def mirror_cut(cut, sky, rows, height, toward, strength, haze=0.0, shift=0, ramp=0, clone=()):
    w, h = cut.size
    painted = Image.blend(cut, Image.new('RGB', cut.size, sky), haze) if haze else cut.copy()
    # What is reflected: the painting's top rows, with each (x0, x1, from) span replaced by the span starting at `from` (the light ray would zigzag).
    # Feathered over FEATHER px at each side; in the painting itself it also eases out downward over `rows`, so the ray seems to start under the leaves.
    FEATHER = 40
    source = painted.copy()
    if clone:
        sp, pp, orig = source.load(), painted.load(), painted.copy().load()
        for (x0, x1, fx) in clone:
            for y in range(rows):
                down = 1 - y / rows
                down = down * down * (3 - 2 * down)
                for x in range(x0, x1):
                    edge = min(1.0, (x - x0 + 1) / FEATHER, (x1 - x) / FEATHER)
                    a, b = orig[x, y], orig[fx + x - x0, y]
                    sp[x, y] = tuple(round(a[i] + (b[i] - a[i]) * edge) for i in range(3))
                    pp[x, y] = tuple(round(a[i] + (b[i] - a[i]) * edge * down) for i in range(3))
    end = toward if toward is not None else sky
    out = Image.new('RGB', (w, h + height), end)
    out.paste(painted, (0, height))
    src = source.load()
    dst = out.load()
    period = 2 * rows
    for k in range(height):
        # k = 0 is the row just over the painting: reflect, then run back down, and so on.
        m = k % period
        r = m if m < rows else period - 1 - m
        # Each further reflection is slid sideways by `shift` px (wrapping), so trunks and the light ray do not stack into a pattern.
        dx = (k // rows) * shift
        # Eased over `ramp` px (the whole height when 0), then held.
        t = min(1.0, (k + 1) / (ramp or height))
        t = t * t * (3 - 2 * t) * strength
        y = height - 1 - k
        for x in range(w):
            c = src[(x + dx) % w, r]
            dst[x, y] = tuple(round(c[i] + (end[i] - c[i]) * t) for i in range(3))
    return out


def blur_row(row, r):
    """A horizontal box blur of one row of (r, g, b), edges clamped."""
    n = len(row)
    pre = [(0, 0, 0)]
    for p in row:
        q = pre[-1]
        pre.append((q[0] + p[0], q[1] + p[1], q[2] + p[2]))
    out = []
    for x in range(n):
        a, b = max(0, x - r), min(n, x + r + 1)
        t = pre[b]; f = pre[a]; c = b - a
        out.append(((t[0] - f[0]) / c, (t[1] - f[1]) / c, (t[2] - f[2]) / c))
    return out


def far_cut(cut, sky, haze):
    w, h = cut.size
    hazed = Image.blend(cut, Image.new('RGB', cut.size, sky), haze)
    out = Image.new('RGB', (w, h + FADE), sky)
    out.paste(hazed, (0, FADE))
    # The top 4 rows of the hazed panorama, averaged into one row, then carried upward.
    top = [tuple(sum(hazed.getpixel((x, y))[i] for y in range(4)) / 4 for i in range(3)) for x in range(w)]
    steps = FADE // STEP
    for k in range(steps):
        t = (k + 1) / steps
        t = t * t * (3 - 2 * t)  # eased, so the first steps stay close to the painting
        row = blur_row(top, 2 + 6 * k)
        y0 = FADE - (k + 1) * STEP
        for x in range(w):
            c = tuple(round(row[x][i] + (sky[i] - row[x][i]) * t) for i in range(3))
            for y in range(y0, y0 + STEP):
                out.putpixel((x, y), c)
    return out

def local_haze(far, sky, haze, ellipses, top=None):
    top = FADE if top is None else top
    out = far.copy()
    hazed = Image.blend(far, Image.new('RGB', far.size, sky), haze)
    px, hz = out.load(), hazed.load()
    for (cx, cy, rx, ry) in ellipses:
        for y in range(max(0, cy - ry), min(180, cy + ry + 1)):
            for x in range(max(0, cx - rx), min(far.width, cx + rx + 1)):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d >= 1:
                    continue
                t = min(1.0, max(0.0, (1 - d ** 0.5) / 0.5))
                k = t * t * (3 - 2 * t)
                a, b = px[x, y + top], hz[x, y + top]
                px[x, y + top] = tuple(round(a[i] + (b[i] - a[i]) * k) for i in range(3))
    return out


def load(rel):
    path = os.path.join(ROOT, rel)
    if os.path.exists(path):
        return Image.open(path)
    data = subprocess.run(['git', '-C', ROOT, 'show', 'HEAD:' + rel], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(data))


def main():
    out_dir = os.path.join(ROOT, 'assets', 'backdrops')
    for name, rel in PANORAMAS:
        im = load(rel).convert('RGB')
        if im.size != (1024, 180):
            sys.exit(f'{rel}: expected 1024x180, found {im.size[0]}x{im.size[1]}')
        x0 = (im.width - WIDTH) // 2
        cut = im.crop((x0, 0, x0 + WIDTH, im.height))
        cut.save(os.path.join(out_dir, name + '.png'), optimize=True)
        px = [cut.getpixel((x, y)) for y in range(2) for x in range(WIDTH)]
        avg = tuple(round(sum(p[i] for p in px) / len(px)) for i in range(3))
        print(f'{name}.png  sky {"#%02x%02x%02x" % avg}')
        if name in HAZE:
            k = HAZE[name]
            hazed = Image.blend(cut, Image.new('RGB', cut.size, avg), k)
            hazed.save(os.path.join(out_dir, name + '-haze.png'), optimize=True)
            print(f'{name}-haze.png  ({round(k * 100)}% toward the sky)')
        if name in FAR:
            far_cut(cut, avg, FAR[name]).save(os.path.join(out_dir, name + '-far.png'), optimize=True)
            print(f'{name}-far.png  ({round(FAR[name] * 100)}% haze, {FADE} px fade on top)')
            for out_name, (src, k, boxes) in LOCAL.items():
                if src == name:
                    local_haze(far_cut(cut, avg, FAR[name]), avg, k, boxes).save(os.path.join(out_dir, out_name + '.png'), optimize=True)
                    print(f'{out_name}.png  ({round(k * 100)}% haze in {len(boxes)} soft ellipses)')
        for out_name, m in MIRROR.items():
            if m['src'] != name:
                continue
            im2 = mirror_cut(cut, avg, m['rows'], m['height'], m['toward'], m['strength'], m.get('haze', 0.0), m.get('shift', 0), m.get('ramp', 0), m.get('clone', ()))
            if m.get('caps'):
                k, boxes = m['caps']
                im2 = local_haze(im2, avg, k, boxes, m['height'])
            im2.save(os.path.join(out_dir, out_name + '.png'), optimize=True)
            top = [im2.getpixel((x, 0)) for x in range(WIDTH)]
            end = tuple(round(sum(p[i] for p in top) / len(top)) for i in range(3))
            print(f'{out_name}.png  ({m["rows"]} top rows carried up {m["height"]} px; its top row averages {"#%02x%02x%02x" % end}: the room\'s sky)')


if __name__ == '__main__':
    main()
