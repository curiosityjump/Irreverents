"""The core loops' looks, cut from the approved Drive plates (handoff-prompts/loop-art-cutouts.md; the owner's
rule, docs/mechanisms/art-pipeline.md, "Approved Drive assets first"). Each function names its plate and box;
srcimport.grab() does the cut. DRAFT: boxes, sizes, materials and ids' frame splits are first passes.

Groups (content/looks/<group>.json):
- rides: P04 chibi-vehicle-and-mount-sprite-sheet ('vehicle'), four machines/mounts, five cells a row.
- powers: P05 rare-powers-pickups ('powers'): power orbs, loose pieces, fixtures, the pickup glow and get, the
  "lost" pop, a cloud poof.
- treasure: chests, doors (shut, open, locked, barred), a key, gold, gems, the hoard, the vault cave.
- hall: P04 hall-of-legends-tile-atlas ('hall'): plinths, niches, plaques, banners, lights, doors, statues, frames.
"""
from PIL import Image

from px import new, paste
from srcimport import grab, ramps

RIDE = ramps('stone', 'castle', 'gold', 'wood', 'metal', 'red', 'orange', 'blue', 'teal', 'night', 'skin', 'cloud')

# ---- rides: P04 vehicle sheet. Columns and rows are the plate's own cells (alpha projection of the sheet).
# Each row is one machine; its five cells: idle, moving, moving (a second step), a crash/charge, wrecked.
# Every cell shows the same goggled rider: the plate has no empty machine (README, "No approved source found").
_COLS = [(49, 257), (299, 542), (565, 824), (856, 1133), (1154, 1404)]
_ROWS = {'plane': (36, 234), 'cart': (309, 493), 'wagon': (566, 744), 'mount': (816, 1036)}
RIDES = ('plane', 'cart', 'wagon', 'mount')
RIDE_SCALE = 0.2  # DRAFT: the rider's head then matches a hero's (about 14 px), the machine 33-48 px wide
RIDE_W, RIDE_H = 48, 44  # every frame of every ride: bottom on the canvas's foot, the rider's head at x 24


def _cell(which, i):
    y0, y1 = _ROWS[which]
    x0, x1 = _COLS[i]
    return grab('vehicle', (x0 - 10, y0 - 10, x1 + 10, y1 + 10), RIDE_SCALE, RIDE)


def _head_x(im):
    """The centre of the top 5 opaque rows: the rider's head, the one thing that holds still between frames."""
    xs = []
    top = None
    for y in range(im.height):
        row = [x for x in range(im.width) if im.getpixel((x, y))[3]]
        if row and top is None:
            top = y
        if top is not None and y < top + 5:
            xs += row
    return (min(xs) + max(xs)) // 2


def _frame(piece):
    """INTENT: anchored by the rider's head, not the bounding box, so the dust, flame or plough a frame adds
    on one side does not make the machine jump sideways as the strip plays."""
    im = new(RIDE_W, RIDE_H)
    x = RIDE_W // 2 - _head_x(piece)
    x = max(0, min(RIDE_W - piece.width, x))
    paste(im, piece, x, RIDE_H - piece.height)
    return im


def _strip(frames):
    out = new(RIDE_W * len(frames), RIDE_H)
    for i, f in enumerate(frames):
        out.paste(f, (i * RIDE_W, 0))
    return out


def ride(which, state):
    """state: idle (cell 1), moving (cells 2-3, two frames), crash (cell 4: hit for the machines, a charge for the
    mount), wrecked (cell 5: the plastered X and the smoke curl; the mount sits down, spent)."""
    cells = {'idle': [0], 'moving': [1, 2], 'crash': [3], 'wrecked': [4]}[state]
    return _strip([_frame(_cell(which, i)) for i in cells])


# ---- rare powers and pickups: P05 rare-powers-pickups ('powers'), painted on an opaque pale ground (key=)
P05KEY = (247, 245, 243)
POWER = ramps('gold', 'orange', 'red', 'blue', 'sky', 'purple', 'teal', 'metal', 'cloud', 'wood', 'night', 'pink',
              'foliage', 'grass', 'stone')
GLOW = ramps('gold', 'orange', 'purple', 'sky', 'cloud')
# row 2: nine power orbs, named by what the plate paints in them (a shown name is data: these are pictures)
ORBS = {'fire': (48, 122), 'ice': (135, 208), 'bolt': (220, 294), 'moon': (305, 378), 'wing': (388, 457),
        'gear': (465, 534), 'bomb': (542, 608), 'star': (615, 681), 'swirl': (688, 754)}
# row 4: nine loose pieces
ITEMS = {'gear': (45, 123), 'lens': (130, 206), 'pipe': (217, 299), 'crystal': (310, 366), 'spring': (380, 426),
         'book': (440, 523), 'hook': (532, 584), 'ring': (607, 658), 'feather': (675, 749)}
# row 1: six fixtures a power comes from
FIXTURES = {'crystal': (47, 176), 'orrery': (184, 283), 'tree': (290, 408), 'shrine': (414, 531),
            'brazier': (539, 626), 'portal': (632, 762)}
# row 5: the pickup sequence (ring, sparkles, column, burst, flash) and a cloud poof; the plate cuts them at y 512
SEQ = [(45, 151), (165, 260), (276, 371), (385, 487), (505, 593)]
POOF = (602, 742)


def orb(which):
    x0, x1 = ORBS[which]
    # DRAFT: 20 px: at 16 the plate's glyph (flame, flake, bolt...) turned to mush
    return grab('powers', (x0 - 3, 140, x1 + 3, 219), 0, POWER, key=P05KEY, size=(20, 20))


def item(which):
    x0, x1 = ITEMS[which]
    return grab('powers', (x0 - 3, 338, x1 + 3, 426), 0.2, POWER, key=P05KEY)


def fit_item(piece):
    """every loose piece on an 18 x 16 cell, bottom-centred (it lies on the floor)"""
    out = new(18, 16)
    paste(out, piece, (18 - piece.width) // 2, 16 - piece.height)
    return out


def fixture(which):
    x0, x1 = FIXTURES[which]
    g = grab('powers', (x0 - 3, 8, x1 + 3, 134), 0.25, POWER, key=P05KEY)
    out = new(32, 32)
    paste(out, g, (32 - g.width) // 2, 32 - g.height)
    return out


def _fx(box, size, pal=GLOW):
    return grab('powers', box, 0, pal, key=P05KEY, largest=False, edge=None, dark_ink=40, size=size)


def _row(frames, w, h, align='bottom'):
    out = new(w * len(frames), h)
    for i, f in enumerate(frames):
        y = h - f.height if align == 'bottom' else (h - f.height) // 2
        paste(out, f, i * w + (w - f.width) // 2, y)
    return out


def pickup_glow():
    """3 frames, looping under a pickup lying on the floor: the plate's ring, then the ring with sparkles rising."""
    return _row([_fx((x0, 430, x1, 512), (22, 16)) for x0, x1 in SEQ[:3]], 24, 16)


def pickup_get():
    """3 frames, once, when a pickup is taken: the column of light, the burst, the star flash."""
    return _row([_fx((x0, 426, x1, 512), (22, 22)) for x0, x1 in SEQ[2:]], 24, 24)


def power_lost():
    """INTENT: the "lost" pop as the plate draws it (row 3): the hit spark, the stars over the knocked head, the
    orb flying off on its swoosh. 3 frames, once, at the hero who lost the power; the orb then lies as pickup-*."""
    spark = _fx((146, 225, 192, 290), (14, 16))
    stars = _fx((196, 224, 296, 262), (22, 10))
    fly = grab('powers', (353, 223, 452, 326), 0, POWER, key=P05KEY, largest=False, edge=None, dark_ink=40, size=(22, 22))
    return _row([spark, stars, fly], 24, 24, align='middle')


def poof():
    """3 frames: the plate's cloud poof, then the same cut smaller twice (the cloud shrinking away)."""
    cut = lambda w, h: _fx((POOF[0], 430, POOF[1], 512), (w, h), ramps('cloud', 'purple', 'sky'))
    return _row([cut(24, 14), cut(18, 10), cut(12, 7)], 24, 14)


# ---- treasure: P07 vibrant-platformer-interactables ('vibrant') chests, doors, keys, gold; P05 secrets ('secrets')
# the vault cave; P04 interactables ('interact') the gem; P04 tavern ('tavern') the coin heap. All transparent but P05 (key=).
P05PALE = (247, 247, 247)
LOOT = ramps('wood', 'gold', 'orange', 'metal', 'stone', 'castle', 'red', 'night', 'teal', 'blue', 'purple', 'pink',
             'foliage', 'grass', 'cloud', 'earth')
CHESTS = {  # P07 row 1: wooden then iron-bound; closed, open and full (the shine rays are their own blob, dropped)
    'chest-closed': (195, 95, 330, 215), 'chest-open': (370, 70, 505, 215), 'chest-empty': (545, 95, 670, 215),
    'chest-iron-closed': (800, 95, 935, 215), 'chest-iron-open': (975, 70, 1110, 215),
    'chest-iron-empty': (1150, 95, 1290, 215)}
DOORS = {  # P07 row 2: the ring-handled door shut and open, the portcullis down and raised
    'door-wood-shut': (35, 240, 212, 415), 'door-wood-open': (212, 240, 390, 415),
    'door-barred': (410, 240, 595, 415), 'door-barred-raised': (600, 240, 785, 415)}
P05DOORS = {  # P05 secrets row 1: the padlocked door and the barred door (no plants on them)
    'door-locked': (102, 68, 200, 172), 'door-bars': (424, 68, 524, 172)}


def chest(which):
    g = grab('vibrant', CHESTS[which], 0.17, LOOT)  # DRAFT: about 22 px wide: a chest you can stand behind
    out = new(24, 26)
    paste(out, g, (24 - g.width) // 2, 26 - g.height)
    return out


def door(which):
    """32 x 32: a doorway two tiles tall, two wide (the arch included)."""
    if which in P05DOORS:
        g = grab('secrets', P05DOORS[which], 0, LOOT, key=P05PALE, size=(28, 30))
    else:
        g = grab('vibrant', DOORS[which], 0, LOOT, size=(30, 30))
    out = new(32, 32)
    paste(out, g, (32 - g.width) // 2, 32 - g.height)
    return out


def key():
    return grab('vibrant', (30, 980, 130, 1065), 0, LOOT, size=(14, 12))


def coin():
    """2 frames: the coin, then the same with its shine (the plate's glinting coin, rays dropped)"""
    a = grab('vibrant', (1005, 985, 1080, 1065), 0, LOOT, size=(10, 10))
    b = grab('vibrant', (1085, 985, 1165, 1065), 0, LOOT, size=(10, 10))
    return _row([a, b], 12, 12, align='middle')


def gold_sack():
    return grab('vibrant', (780, 960, 875, 1075), 0, LOOT, size=(14, 16))


def gold_pile():
    """P04 cantina-tavern-hub, the coin heap (P05's vault heap sits on the cave floor and does not cut clean)"""
    return grab('tavern', (566, 1040, 643, 1075), 0, LOOT, size=(22, 10))


def gem():
    """P04 interactables row 2: the blue crystal (its pedestal and halo left on the plate)"""
    return grab('interact', (240, 380, 320, 470), 0, LOOT, size=(10, 14))


def gem_pedestal():
    """P07 row 5: the violet gem on its stone post"""
    return grab('vibrant', (610, 795, 745, 935), 0, LOOT, size=(20, 22))


def vault_cave():
    """P05 secrets bottom right: the vault cave, lantern, crystals and gold, whole (a back-layer picture, 64 x 32)"""
    return grab('secrets', (526, 372, 758, 482), 0, LOOT, key=P05PALE, size=(64, 30))


def hoard(taken):
    """The depot's hoard (Step 16 slice 3's depot-hoard): the sack on the P05 gold heap; taken, the heap's last
    coins only. DRAFT: 32 x 16, bottom-centred on its tile."""
    out = new(32, 16)
    pile = gold_pile()
    if taken:
        bit = pile.crop((0, 4, pile.width, pile.height))
        paste(out, bit.crop((0, 0, 10, bit.height)), 4, 16 - bit.height)
        return out
    paste(out, pile, 1, 16 - pile.height)
    sack = gold_sack()
    paste(out, sack, 23 - sack.width // 2, 16 - sack.height)
    return out


# ---- Hall of Legends: P04 hall-of-legends-tile-atlas ('hall'), painted on an opaque pale ground with drawn cell
# lines (grid=True), like P03 grassy ruins. Boxes are the plate's cells; scale 0.2 (a statue about a hero's height
# plus its plinth). DRAFT: the hall's walls, floors and arches are the ground lane's tiles (asset-coverage
# tiles:castle); these are the things that stand in it.
HALLKEY = (247, 247, 247)
HALLR = ramps('stone', 'castle', 'gold', 'wood', 'red', 'blue', 'sky', 'purple', 'metal', 'foliage', 'grass',
              'orange', 'night', 'cloud')
HALL = {
    # plinths and niches (row y 395-495)
    'hall-plinth': (38, 398, 112, 495), 'hall-plinth-tall': (118, 398, 192, 495),
    'hall-plinth-star': (198, 398, 272, 495),
    'hall-niche': (610, 395, 690, 497), 'hall-niche-lit': (692, 395, 772, 497),
    'hall-niche-statue': (775, 395, 855, 497), 'hall-niche-laurel': (1015, 395, 1095, 497),
    # plaques, shield and banners (row y 512-608)
    'hall-plaque': (38, 512, 125, 580), 'hall-plaque-lines': (140, 512, 255, 580),
    'hall-plaque-laurel': (270, 510, 360, 580), 'hall-plaque-wide': (375, 510, 500, 582),
    'hall-shield': (700, 510, 770, 580), 'hall-banner-tower': (782, 510, 880, 608),
    'hall-banner': (892, 510, 980, 604), 'hall-banner-laurel': (986, 510, 1070, 604),
    'hall-drape': (1176, 510, 1320, 604),
    # lights (row y 600-684)
    'hall-lantern': (40, 598, 105, 684), 'hall-torch': (205, 600, 265, 684), 'hall-brazier': (365, 600, 435, 684),
    'hall-brazier-blue': (535, 600, 610, 684),
    # doors and windows (row y 692-808)
    'hall-door': (30, 692, 130, 808), 'hall-door-double': (336, 692, 440, 808),
    'hall-window': (446, 692, 526, 808), 'hall-portal-gold': (876, 692, 1000, 808),
    'hall-portal-blue': (1005, 692, 1125, 808),
    # statues and keepsakes (row y 885-1062)
    'hall-statue-robed': (35, 885, 112, 1062), 'hall-statue-knight': (114, 885, 205, 1062),
    'hall-statue-griffin': (210, 885, 325, 1062), 'hall-trophy': (326, 925, 420, 1062),
    'hall-tablet': (425, 885, 612, 1062), 'hall-case-sword': (628, 900, 728, 1062),
    'hall-case-crown': (740, 925, 845, 1062), 'hall-shrine-banner': (855, 885, 1025, 1062),
    'hall-bust': (1030, 925, 1140, 1062), 'hall-column-broken': (1220, 915, 1315, 1062),
    'hall-urn': (1320, 925, 1420, 1062),
    # the gold-edged panels (row y 115-190): a frame for a hall picture (the picture inside stays drawn from data)
    'hall-frame': (362, 114, 430, 192), 'hall-frame-star': (445, 114, 517, 192),
}


# the plate's banner cloth is a mauve that snaps to grey stone without the pink ramp; on stone, pink speckles
CLOTH = ('hall-banner-tower', 'hall-banner', 'hall-banner-laurel', 'hall-drape', 'hall-shrine-banner', 'hall-case-crown')


def hall(which):
    pal = HALLR + ramps('pink') if which in CLOTH else HALLR
    return grab('hall', HALL[which], 0.2, pal, key=HALLKEY, grid=True)
