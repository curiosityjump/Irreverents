"""Mock scenes for the core loops' looks (handoff-prompts/loop-art-cutouts.md): each group on plain stand-in
ground in a 320x180 view, saved at 4x nearest into docs/plan/step-8-shots/round3/props/loops-<group>-4x.png.
Never shipped. Run after make.py:

    python3 -I tools/art/props/loopshots.py [group ...]

DRAFT: a look check, not the game: the game's renderer decides where a look stands."""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from px import rgb, scale
from sizes import ROOT

OUT = os.path.join(ROOT, 'docs', 'plan', 'step-8-shots', 'round3', 'props')
SKY, BODY, LIP = '#8fd0fa', '#807b96', '#d2cfe0'
NIGHT, NBODY, NLIP = '#221f44', '#8179b8', '#d0aaff'


def looks(group):
    with open(os.path.join(ROOT, 'content', 'looks', group + '.json')) as f:
        d = json.load(f)
    return Image.open(os.path.join(ROOT, 'assets', d['image'])).convert('RGBA'), d['looks']


def frame(img, lk, n=0):
    x, y, w, h = lk['src']
    return img.crop((x + n * w, y, x + (n + 1) * w, y + h))


def ground(floor, sky=SKY, body=BODY, lip=LIP):
    im = Image.new('RGBA', (320, 180), rgb(sky))
    for y in range(floor, 180):
        for x in range(320):
            im.putpixel((x, y), rgb(lip) if y < floor + 2 else rgb(body))
    return im


def place(scene, pic, cx, floor):
    """bottom-centred on (cx, floor)"""
    scene.alpha_composite(pic, (cx - pic.width // 2, floor - pic.height))


def shelves(n, sky=SKY):
    """n ledges, evenly down the view; returns their floor ys"""
    im = Image.new('RGBA', (320, 180), rgb(sky))
    floors = [(k + 1) * 180 // n - 3 for k in range(n)]
    for f in floors:
        for y in range(f, f + 3):
            for x in range(320):
                im.putpixel((x, y), rgb(LIP) if y < f + 2 else rgb(BODY))
    return im, floors


def rides():
    """one row per state (idle, moving 2nd frame, crash, wrecked), one column per ride"""
    img, L = looks('rides')
    scene, floors = shelves(4)
    for r, (state, n) in enumerate((('idle', 0), ('moving', 1), ('crash', 0), ('wrecked', 0))):
        for i, which in enumerate(('plane', 'cart', 'wagon', 'mount')):
            place(scene, frame(img, L['ride-%s-%s' % (which, state)], n), 40 + i * 80, floors[r])
    return scene


SCENES = {'rides': rides}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for g in (sys.argv[1:] or list(SCENES)):
        scale(SCENES[g](), 4).convert('RGB').save(os.path.join(OUT, 'loops-%s-4x.png' % g))
        print('wrote loops-%s-4x.png' % g)
