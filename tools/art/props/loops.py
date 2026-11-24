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
import os

from PIL import Image

from sizes import ROOT

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



def ride_empty(which):
    """DRAFT (props-asks-2, ask 3): the machine with nobody aboard, an EDIT of an approved cell, not a cut. Every
    P04 vehicle cell has the goggled rider baked in and no plate shows an empty one (on the Drive's missing list).
    From the idle cell: everything above the body's top edge right of the flag pole is cleared (the rider's head),
    and the body's right half, where the rider's arm and hand cover it, is the left half mirrored about the
    crest's middle (x 25). Replace it with a cut the day an empty wagon is delivered."""
    c = ride(which, 'idle')
    out = c.copy()
    top, mid2 = 22, 50
    for y in range(c.height):
        for x in range(c.width):
            p = c.getpixel((x, y))
            if y < top and x >= 23:
                p = (0, 0, 0, 0)
            elif y >= top and 2 * x > mid2:
                xm = mid2 - x
                p = c.getpixel((xm, y)) if 0 <= xm < c.width else (0, 0, 0, 0)
            out.putpixel((x, y), p)
    return out


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


# ---- asks from the core-loop builders (brief item 5)
def puzzle_piece(gold):
    """The glints builder's found row (Step 14 slice B): P05 HUD sheet's bottom row, the grey and the gold jigsaw
    piece. The plate's edge cuts each piece off below its side knobs, so the visible top is mirrored about the
    knob row (y 498) to close it: a piece with knobs above and below is still a jigsaw piece.
    DRAFT: 12 x 12, not the 8 x 8 asked: at 8 the knobs go and it is a blob (tried fill 0.2-0.5)."""
    from PIL import Image, ImageOps
    from srcimport import _cache, sheet
    x0, x1 = (505, 572) if gold else (436, 504)
    top = sheet('hud').crop((x0, 455, x1, 498))
    im = Image.new('RGBA', (x1 - x0, 86), (245, 245, 244, 255))
    im.paste(top, (0, 0))
    im.paste(ImageOps.flip(top), (0, 43))
    _cache['hud-piece'] = im
    pal = ramps('gold', 'orange') if gold else ramps('stone', 'castle', 'metal')
    return grab('hud-piece', (0, 0, x1 - x0, 86), 0, pal, key=(245, 245, 244), size=(12, 12), fill=0.3,
                majority=False)


def goods_special():
    """The glints builder's once-only shop good: the Hall atlas's crown on a cushion in its glass case."""
    g = grab('hall', HALL['hall-case-crown'], 0, HALLR + ramps('pink'), key=HALLKEY, grid=True, size=(14, 16))
    out = new(16, 16)
    paste(out, g, 1, 0)
    return out


def unseen():
    """The heists builder's `unseen` (a take went unnoticed): P07 has no closed eye; its nearest is the stealth
    power's purple hood with two glowing eyes in the dark (P07 UI atlas, row 2, last but one), cut off its slot.
    DRAFT: 14 x 12."""
    return grab('ui', (1218, 280, 1306, 364), 0, ramps('purple', 'night', 'gold', 'pink'), key=(190, 200, 248),
                size=(14, 12))


def seen_mark():
    """The heists builder's `seen-mark`: P07 UI atlas bottom right, the yellow '!' speech bubble (alert-pip is its
    red neighbour), its shine rays left on the plate. 12 x 12."""
    return grab('ui', (1252, 928, 1330, 1000), 0, ramps('gold', 'orange', 'metal', 'night'), size=(12, 12))


def cage(open_):
    """The rescue builder's cage (Step 13, camp-captive): P04 interactables row 1, the barred gate shut and its open
    frame, 32 x 28, standing on the floor. INTENT: the shut gate's gaps between the bars are opaque dark fill on the
    plate, which would hide the captive; they are cleared (alpha repair, not a redraw) so the hero shows through
    three bars. DRAFT: the gap box (x 7-24, y 9-20) is read off this cut at this size."""
    from drive import PARTS
    from px import INK
    if open_:
        return grab('interact', (1265, 175, 1432, 318), 0, PARTS, size=(32, 28))
    im = grab('interact', (1072, 172, 1236, 318), 0, PARTS, size=(32, 28))
    for y in range(9, 21):
        for x in range(7, 25):
            c = im.getpixel((x, y))
            if c[3] and (c[:3] == INK[:3] or 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 78):
                im.putpixel((x, y), (0, 0, 0, 0))
    return im


CONDITION = {'fine': (482, 370, 558, 442), 'hurt': (568, 365, 648, 442), 'down': (662, 365, 748, 442)}


def condition(which):
    """The risk builder's condition marks (Step 21, the HUD plate's condition slot): P05 HUD sheet's shield badges,
    which the plate itself escalates grey, gold, red-with-alarm-rays (rays left on the plate). No digits, hearts or
    bars. fine = grey, hurt = gold, down (at the edge: about to be knocked flat) = red. 11 x 12."""
    return grab('hud', CONDITION[which], 0, ramps('gold', 'orange', 'red', 'pink', 'metal', 'stone', 'castle'),
                key=(245, 245, 244), size=(11, 12))


# ---- weapons: P12 standalone weapon families (owner-weapons-art.md). Three 1448x1086 sheets, four weapons a sheet,
# one per row, every row the same nine states: 0 ground (with a shadow), 1 pickup (rays, floating), 2 lying right,
# 3 lying left, 4 raised/ready, 5 swing start, 6 full swing (both with a blue arc baked on), 7 impact (a starburst
# baked on), 8 broken/spent (debris). INTENT: no bearer is drawn into any weapon (the owner's P12 decision): a held
# weapon is the `ready` look on the holder's hand, never a hero holding it.
import srcimport as _si
_P12 = 'p12-standalone-weapons-and-configurations-source/originals/'
_si.SHEETS.update({'wpn-a': _P12 + 'kirby-style-weapon-atlas-sprite-sheet.png',
                   'wpn-b': _P12 + 'colorful-pixel-weapon-sprite-sheet.png',
                   'wpn-c': _P12 + 'arcane-weapon-sprite-atlas.png'})
WEAPONS = {  # id: (sheet, row); ids say what the thing is
    'sword': ('wpn-a', 0), 'hammer': ('wpn-a', 1), 'spear': ('wpn-a', 2), 'shield': ('wpn-a', 3),
    'bomb': ('wpn-b', 0), 'boomerang': ('wpn-b', 1), 'hook': ('wpn-b', 2), 'cannon': ('wpn-b', 3),
    'star-wand': ('wpn-c', 0), 'torch': ('wpn-c', 1), 'parasol': ('wpn-c', 2), 'orb-wand': ('wpn-c', 3)}
_WROWS = [(40, 280), (300, 530), (545, 785), (785, 1030)]  # the pack's own tag_index source_crop rows
_WCOLS = [15, 170, 305, 455, 610, 760, 915, 1090, 1265, 1440]  # cell edges, from the sheets' alpha
WPN = ramps('metal', 'stone', 'castle', 'gold', 'orange', 'wood', 'red', 'purple', 'blue', 'sky', 'pink', 'night',
            'cloud')
WPN_SCALE = 0.15  # DRAFT: a sword about 18 px long beside an 18 x 28 hero
WPN_CELL = 28


def weapon_cut(which, state, largest=True, edge=True):
    sh, row = WEAPONS[which]
    y0, y1 = _WROWS[row]
    from px import INK
    return grab(sh, (_WCOLS[state], y0, _WCOLS[state + 1], y1), WPN_SCALE, WPN, largest=largest,
                edge=INK if edge else None)


def weapon(which, states, align='middle', cell=WPN_CELL):
    frames = [weapon_cut(which, s) for s in states]
    return _row(frames, cell, cell, align=align)


def weapon_looks(which):
    """[(id suffix, strip, frames)]: ground = lying flat (state 2: the shadowless one, as the P12 contract asks),
    held = raised/ready (4), swing = 5-6 with the plate's own arc, impact = 7, broken = 8 (every piece, not the
    largest: a snapped blade is two)."""
    c = WPN_CELL
    broken = weapon_cut(which, 8, largest=False)
    return [('ground', _row([weapon_cut(which, 2)], c, c), 1),
            ('held', weapon(which, [4]), 1),
            ('swing', weapon(which, [5, 6]), 2),
            ('impact', weapon(which, [7]), 1),
            ('broken', _row([broken], c, c), 1)]


def weapon_effect(which):
    """The two effects the sheets draw apart from a swing: the bomb's explosion (B row 1, state 7, every blob) and
    the cannon's muzzle blast (B row 4, state 6, the barrel with its flame)."""
    if which == 'explosion':
        return _row([weapon_cut('bomb', 7, largest=False)], 32, 32)
    return _row([weapon_cut('cannon', 6)], 40, 28)


# ---- GV-01 guard response vehicles (props-asks-2, "the owner's guard vehicles"). The pack's own labels: PROTOTYPE-
# USABLE STATIC SPRITES, candidate vehicle types, empty (no crew drawn in). Each state is its own transparent PNG on a
# per-vehicle canvas, already aligned on the vehicle's pivot; every state is shrunk by the same GV_SCALE and put back
# at its shrunk offset, so the states of one vehicle line up and the four keep their sizes to each other.
# DRAFT: GV_SCALE 0.5 (a trike about 42x33, the wagon about 60x41: beside the P04 rides' 48x44 and a ~30 px hero).
# Right-facing states only (the plate's _left cells are its mirrors; the renderer flips).
GV_DIR = os.path.join(ROOT, 'docs', 'design-library', '03-visual-direction-and-assets',
                      'gv-01-guard-response-vehicles-runtime-prototype', 'runtime', 'vehicles')
GV_SCALE = 0.5
GVPAL = ramps('blue', 'gold', 'metal', 'night', 'red', 'orange', 'wood', 'stone', 'castle', 'cloud', 'earth', 'sky')
# look id -> source file stem; canvases (w, h) per vehicle
GUARD = {
    'guard-trike-parked': 'patrol-trike-parked-right-112x80', 'guard-trike-moving': 'patrol-trike-moving-right-112x80',
    'guard-trike-damaged': 'patrol-trike-damaged-112x80',
    'guard-wagon-closed': 'transport-wagon-closed-right-144x96',
    'guard-wagon-door-open': 'transport-wagon-door-open-right-144x96',
    'guard-wagon-moving': 'transport-wagon-moving-right-144x96',
    'guard-wagon-damaged': 'transport-wagon-damaged-right-144x96',
    'guard-roller-ready': 'siege-roller-ready-right-160x96', 'guard-roller-rolling': 'siege-roller-rolling-right-160x96',
    'guard-roller-damaged': 'siege-roller-damaged-right-160x96',
    'guard-rotorcraft-idle': 'guard-rotorcraft-idle-right-128x96',
    'guard-rotorcraft-flying': 'guard-rotorcraft-flying-right-128x96',
    'guard-rotorcraft-damaged': 'guard-rotorcraft-damaged-right-128x96',
}


def guard_vehicle(look_id):
    import srcimport
    stem = GUARD[look_id]
    src = Image.open(os.path.join(GV_DIR, stem + '.png')).convert('RGBA')
    W, H = src.size
    srcimport._cache['_gv-' + stem] = src
    x0, y0, x1, y1 = src.getchannel('A').point(lambda a: 255 if a >= 150 else 0).getbbox()
    size = (max(1, round((x1 - x0) * GV_SCALE)), max(1, round((y1 - y0) * GV_SCALE)))
    piece = grab('_gv-' + stem, (0, 0, W, H), 0, GVPAL, largest=False, size=size)
    out = new(round(W * GV_SCALE), round(H * GV_SCALE))
    paste(out, piece, round(x0 * GV_SCALE), round(H * GV_SCALE) - size[1] - round((H - y1) * GV_SCALE))
    return out
