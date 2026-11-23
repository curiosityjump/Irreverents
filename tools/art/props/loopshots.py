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


def powers():
    """a room's floor: the six fixtures on the back ledge; on the floor, each orb over its glow, the loose pieces,
    and the get, lost and poof strips frame by frame"""
    img, L = looks('powers')
    scene, floors = shelves(3, sky=NIGHT)
    for i, k in enumerate(('crystal', 'orrery', 'tree', 'shrine', 'brazier', 'portal')):
        place(scene, frame(img, L['power-fixture-' + k]), 28 + i * 52, floors[0])
    for i, k in enumerate(('fire', 'ice', 'bolt', 'moon', 'wing', 'gear', 'bomb', 'star', 'swirl')):
        cx = 18 + i * 35
        place(scene, frame(img, L['fx-pickup-glow'], i % 3), cx, floors[1])
        place(scene, frame(img, L['pickup-' + k]), cx, floors[1] - 3)
    for i, k in enumerate(('gear', 'lens', 'pipe', 'crystal', 'spring', 'book', 'hook', 'ring', 'feather')):
        place(scene, frame(img, L['item-' + k]), 12 + i * 20, floors[2])
    for n in range(3):
        place(scene, frame(img, L['fx-pickup-get'], n), 196 + n * 24, floors[2])
        place(scene, frame(img, L['fx-power-lost'], n), 196 + n * 24, floors[2] - 26)
        place(scene, frame(img, L['fx-poof'], n), 270 + n * 22, floors[2])
    return scene


def treasure():
    """a vault: the doors along the top ledge, chests and gold on the middle one, the cave and hoard below"""
    img, L = looks('treasure')
    scene, floors = shelves(3, sky=NIGHT)
    for i, k in enumerate(('door-wood-shut', 'door-wood-open', 'door-barred', 'door-barred-raised', 'door-locked',
                           'door-bars')):
        place(scene, frame(img, L[k]), 26 + i * 54, floors[0])
    for i, k in enumerate(('chest-closed', 'chest-open', 'chest-empty', 'chest-iron-closed', 'chest-iron-open',
                           'chest-iron-empty', 'gold-sack', 'gold-pile', 'gem', 'gem-pedestal', 'key')):
        place(scene, frame(img, L[k]), 14 + i * 28, floors[1])
    place(scene, frame(img, L['vault-cave']), 40, floors[2])
    place(scene, frame(img, L['hoard']), 120, floors[2])
    place(scene, frame(img, L['hoard-taken']), 160, floors[2])
    for n in range(2):
        place(scene, frame(img, L['gold-coin'], n), 200 + n * 16, floors[2])
    return scene


def hall():
    """the hall: banners, plaques and frames hung on the back wall, lights between; statues and keepsakes on the
    floor, the doors and portals on the ledge above"""
    img, L = looks('hall')
    scene, floors = shelves(3, sky=NIGHT)
    x = 4
    for k in ('hall-door', 'hall-door-double', 'hall-window', 'hall-portal-gold', 'hall-portal-blue', 'hall-niche',
              'hall-niche-lit', 'hall-niche-statue', 'hall-niche-laurel', 'hall-lantern'):
        pic = frame(img, L[k]); place(scene, pic, x + pic.width // 2, floors[0]); x += pic.width + 6
    x = 4
    for k in ('hall-banner-tower', 'hall-banner', 'hall-banner-laurel', 'hall-drape', 'hall-shield', 'hall-plaque',
              'hall-plaque-lines', 'hall-plaque-laurel', 'hall-plaque-wide', 'hall-frame', 'hall-frame-star'):
        pic = frame(img, L[k]); scene.alpha_composite(pic, (x, floors[0] + 6)); x += pic.width + 4
    x = 4
    for k in ('hall-torch', 'hall-brazier', 'hall-brazier-blue', 'hall-plinth', 'hall-plinth-tall', 'hall-plinth-star'):
        pic = frame(img, L[k]); place(scene, pic, x + pic.width // 2, floors[1]); x += pic.width + 8
    for k in ('hall-urn', 'hall-column-broken'):
        pic = frame(img, L[k]); place(scene, pic, x + pic.width // 2, floors[1]); x += pic.width + 8
    x = 4
    for k in ('hall-statue-robed', 'hall-statue-knight', 'hall-statue-griffin', 'hall-trophy', 'hall-tablet',
              'hall-case-sword', 'hall-case-crown', 'hall-shrine-banner', 'hall-bust'):
        pic = frame(img, L[k]); place(scene, pic, x + pic.width // 2, floors[2]); x += pic.width + 4
    return scene


def asks():
    """the glints builder's asks in place: an entrance with its sign, pie and found pieces; the shop's goods with the
    special one among them"""
    lv, LL = looks('levels')
    tr, TL = looks('treasure')
    pr, PL = looks('parts')
    scene = ground(140)
    place(scene, frame(lv, LL['level-entry-arch']), 70, 140)
    place(scene, frame(lv, LL['level-sign']), 100, 140)
    for i, k in enumerate(('level-pie-2', 'piece-gold', 'piece-grey', 'piece-grey')):
        scene.alpha_composite(frame(lv, LL[k]), (60 + i * 14, 94))
    for i, k in enumerate(('shop-goods', 'goods-special', 'shop-goods')):
        img, L = (tr, TL) if k == 'goods-special' else (pr, PL)
        place(scene, frame(img, L[k]), 196 + i * 22, 140)
    return scene


def heist():
    """the heists builder's marks over a hero (the grappler's first cell): unseen on the left, seen on the right,
    by night and by day"""
    ui, UL = looks('ui')
    hero = Image.open(os.path.join(ROOT, 'assets', 'sprites', 'heroes', 'grappler.png')).convert('RGBA').crop((0, 0, 48, 48))
    scene = ground(90, sky=NIGHT, body=NBODY, lip=NLIP)
    day = ground(180)
    scene.alpha_composite(day.crop((0, 92, 320, 180)), (0, 92))
    for floor in (90, 176):
        for cx, mark in ((100, 'unseen'), (220, 'seen-mark')):
            place(scene, hero, cx, floor)
            place(scene, frame(ui, UL[mark]), cx, floor - 34)
    return scene


SCENES = {'rides': rides, 'powers': powers, 'treasure': treasure, 'hall': hall, 'asks': asks, 'heist': heist}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for g in (sys.argv[1:] or list(SCENES)):
        scale(SCENES[g](), 4).convert('RGB').save(os.path.join(OUT, 'loops-%s-4x.png' % g))
        print('wrote loops-%s-4x.png' % g)
