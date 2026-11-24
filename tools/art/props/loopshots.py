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


def cage():
    """the rescue builder's cage: shut with a 12x18 captive inside (the grappler shrunk, a stand-in), then open, by
    night and by day; the captive stands on the floor and again on the cage's 7 px rail"""
    ou, OL = looks('outpost')
    hero = Image.open(os.path.join(ROOT, 'assets', 'sprites', 'heroes', 'grappler.png')).convert('RGBA').crop((0, 0, 48, 48))
    hero = hero.crop(hero.getbbox())
    hero = hero.resize((hero.width * 18 // hero.height, 18), Image.NEAREST)
    scene = ground(90, sky=NIGHT, body=NBODY, lip=NLIP)
    scene.alpha_composite(ground(180).crop((0, 92, 320, 180)), (0, 92))
    for floor in (90, 176):
        for cx, lift in ((60, 0), (140, 7)):
            place(scene, hero, cx, floor - lift)
            place(scene, frame(ou, OL['cage-shut']), cx, floor)
        place(scene, frame(ou, OL['cage-open']), 240, floor)
    return scene


def weapons():
    """every weapon lying on the bottom floor; held beside the grappler on the middle one (at about hand height:
    a stand-in for the grip anchor); swing frame 2, impact and broken on the top one; the bomb's explosion and
    the cannon's blast"""
    img, L = looks('weapons')
    hero = Image.open(os.path.join(ROOT, 'assets', 'sprites', 'heroes', 'grappler.png')).convert('RGBA').crop((0, 0, 48, 48))
    scene, floors = shelves(3, sky=NIGHT)
    ids = ['sword', 'hammer', 'spear', 'shield', 'bomb', 'boomerang', 'hook', 'cannon', 'star-wand', 'torch',
           'parasol', 'orb-wand']
    for i, w in enumerate(ids):
        place(scene, frame(img, L['weapon-%s-ground' % w]), 14 + i * 26, floors[2])
    for i, w in enumerate(('sword', 'hammer', 'spear', 'torch')):
        cx = 30 + i * 58
        place(scene, hero, cx, floors[1])
        scene.alpha_composite(frame(img, L['weapon-%s-held' % w]), (cx + 2, floors[1] - 30))
    for i, w in enumerate(('sword', 'hammer', 'shield', 'boomerang')):
        cx = 18 + i * 66
        place(scene, frame(img, L['weapon-%s-swing' % w], 1), cx, floors[0])
        place(scene, frame(img, L['weapon-%s-impact' % w]), cx + 22, floors[0])
        place(scene, frame(img, L['weapon-%s-broken' % w]), cx + 44, floors[0])
    place(scene, frame(img, L['weapon-bomb-explosion']), 290, floors[0])
    place(scene, frame(img, L['weapon-cannon-blast']), 284, floors[1])
    return scene



def undercroft():
    """props-asks-2, ask 1: the undercroft's passage as a 320x180 camera (columns 4-23, the room's last 180 px,
    the pocket under the floor included) with the room's own decor, plate up and grate shut; below it the same
    view with the plate down (sunk 4 px, as room-parts.ts draws it) and the grate open. Ground is preview.py's
    plain stand-in, not the ground lane's tiles."""
    import make, preview
    from place import place_all
    from sizes import rooms
    lk, sh, rs = make.looks_sheets(), make.decor_sheets(), rooms()
    R = place_all()['undercroft']
    out = Image.new('RGBA', (320, 360))
    for i, pressed in enumerate((False, True)):
        im = preview.room_scene('undercroft', R, sh, lk, rs, pressed=pressed)
        out.paste(im.crop((64, im.height - 180, 384, im.height)), (0, i * 180))
    return out




def camp():
    """props-asks-2, ask 2: the Bandit Camp's run east (columns 44-64 and 64-84 as two 320x180 cameras, the room's
    last 180 px) with its decor; the left pair whole, the right pair broken. Plain stand-in ground."""
    import make, preview
    from place import place_all
    from sizes import rooms
    lk, sh, rs = make.looks_sheets(), make.decor_sheets(), rooms()
    R = place_all()['outpost']
    out = Image.new('RGBA', (640, 360))
    for i, pressed in enumerate((False, True)):
        im = preview.room_scene('outpost', R, sh, lk, rs, pressed=pressed)
        for j, x0 in enumerate((44 * 16, 64 * 16)):
            out.paste(im.crop((x0, im.height - 180, x0 + 320, im.height)), (j * 320, i * 180))
    return out


def wagon():
    """props-asks-2, ask 3: the wagon idle (its baked rider), then empty, then empty with the grappler standing by
    it, by day and by night"""
    img, L = looks('rides')
    hero = Image.open(os.path.join(ROOT, 'assets', 'sprites', 'heroes', 'grappler.png')).convert('RGBA').crop((0, 0, 48, 48))
    scene = ground(90, sky=NIGHT, body=NBODY, lip=NLIP)
    scene.alpha_composite(ground(180).crop((0, 92, 320, 180)), (0, 92))
    for floor in (90, 176):
        place(scene, frame(img, L['ride-wagon-idle']), 60, floor)
        place(scene, frame(img, L['ride-wagon-empty']), 150, floor)
        place(scene, frame(img, L['ride-wagon-empty']), 240, floor)
        place(scene, hero, 280, floor)
    return scene


def guard():
    """props-asks-2, GV-01: every guard vehicle state on 320x180, the grappler beside each first state for scale;
    the trike and the wagon on the top shelf, the roller and the rotorcraft (raised: it flies) on the bottom"""
    img, L = looks('guard-vehicles')
    hero = Image.open(os.path.join(ROOT, 'assets', 'sprites', 'heroes', 'grappler.png')).convert('RGBA').crop((0, 0, 48, 48))
    hero = hero.crop(hero.getbbox())
    scene, floors = shelves(2)
    x = 4
    for lid in ('guard-trike-parked', 'guard-trike-moving', 'guard-trike-damaged'):
        place(scene, frame(img, L[lid]), x + 28, floors[0]); x += 50
    place(scene, hero, x + 6, floors[0]); x += 16
    for lid in ('guard-wagon-closed', 'guard-wagon-door-open'):
        place(scene, frame(img, L[lid]), x + 36, floors[0]); x += 64
    x = 4
    for lid in ('guard-roller-ready', 'guard-roller-damaged'):
        place(scene, frame(img, L[lid]), x + 36, floors[1]); x += 72
    place(scene, hero, x + 4, floors[1]); x += 14
    for lid in ('guard-rotorcraft-idle', 'guard-rotorcraft-flying'):
        place(scene, frame(img, L[lid]), x + 32, floors[1] - (20 if lid.endswith('flying') else 0)); x += 60
    return scene


SCENES = {'weapons': weapons, 'rides': rides, 'powers': powers, 'treasure': treasure, 'hall': hall, 'asks': asks, 'heist': heist,
          'cage': cage, 'undercroft': undercroft, 'camp': camp, 'wagon': wagon, 'guard': guard}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for g in (sys.argv[1:] or list(SCENES)):
        scale(SCENES[g](), 4).convert('RGB').save(os.path.join(OUT, 'loops-%s-4x.png' % g))
        print('wrote loops-%s-4x.png' % g)
