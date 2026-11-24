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
    'bkg01-forest-waterfall': 0.45,
    'bkg01-iron-quarry-evening': 0.5,
    'bkg01-ruins-day': 0.3,
    'bkg02-forest-ruins-day': 0.3,
    'bkg02-market-town-day': 0.3,
}
FADE = 180
STEP = 4


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


if __name__ == '__main__':
    main()
