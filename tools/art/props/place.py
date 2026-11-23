"""Where decoration goes in each map room. `python3 -I tools/art/props/make.py` runs this.

INTENT ("nothing points", docs/plan/step-3.md "Unadvertised"): this file never reads a door's, an area's or a
room's `hidden` flag, and never treats a false wall or a breakable wall differently from the wall around it.
Repeating things (columns, banners, torches, lamps, ivy) are put down by one rule across the whole room;
scattered things (barrels, cobwebs, chains) by a fixed hash over every floor or ceiling cell that fits.
What it does read: which cells are open, where the doors' and parts' tiles are (ALL of them, alike), the spawn
points and the things and people placed in the room, so decoration stays off them."""
import json, os
from px import hsh
from sizes import ROOT, rooms as load_rooms, rect

T = 16


class Room:
    def __init__(self, r):
        self.r = r; self.id = r['id']
        self.rows = r['rows']; self.w = len(self.rows[0]); self.h = len(self.rows)
        self.legend = r['legend']
        self.items = []

    def kind(self, tx, ty):
        """'solid', 'oneway', 'open' (spawn, door and part cells are 'open' here: they hold no ground)."""
        if not (0 <= tx < self.w and 0 <= ty < self.h):
            return 'solid'
        v = self.legend[self.rows[ty][tx]]
        if v in ('solid', 'oneway'):
            return v
        return 'open'

    def plain(self, tx, ty):
        """An ordinary empty cell: not ground, not a spawn, not any door's or part's tile, not the room's rim."""
        if not (1 <= tx < self.w - 1 and 1 <= ty < self.h - 1):
            return False
        return self.legend[self.rows[ty][tx]] == 'empty'

    def spawnless(self, tx, ty):
        return self.plain(tx, ty)

    def floor(self, tx, ty):
        """A plain cell with ground right under it."""
        return self.plain(tx, ty) and self.kind(tx, ty + 1) == 'solid'

    def add(self, sheet, name, tx, ty, dx=0, dy=0, layer='back', flip=False, support='floor'):
        self.items.append({'sheet': sheet, 'name': name, 'tx': tx, 'ty': ty, 'dx': dx, 'dy': dy, 'layer': layer, 'flip': flip, 'support': support})

    def column(self, tx, top, bottom):
        """A far-layer column from row `top` down to stand on row `bottom`."""
        self.add('castle', 'column-base', tx, bottom, layer='far', support='wall')
        for ty in range(top + 1, bottom):
            self.add('castle', 'column-shaft', tx, ty, layer='far', support='wall')
        self.add('castle', 'column-cap', tx, top, layer='far', support='wall')


def castle_street(R):
    # --- house fronts behind the street (far): one under each building, so the slabs read as houses
    R.add('town', 'front-3x2', 7, 10, layer='far', support='wall')
    R.add('town', 'front-8x4', 10, 10, layer='far', support='wall')
    R.add('town', 'front-10x3', 24, 10, layer='far', support='wall')
    R.add('town', 'interior-8x3', 25, 6, layer='far', support='wall')
    R.add('town', 'window', 25, 9, dx=3, dy=-3, layer='far', support='wall')
    R.add('town', 'sign-key', 29, 8, dx=0, dy=6, layer='far', support='wall')
    R.add('town', 'door-painted', 30, 10, dx=5, layer='far', support='wall')
    R.add('castle', 'torch', 29, 5, dx=2, dy=-2, layer='far', support='wall')
    # --- flags between the two buildings
    R.add('town', 'bunting', 18, 7, dy=3, layer='far', support='wall')
    # --- the shop: a stall round the shopkeeper, a cloth under the goods
    R.add('town', 'stall', 11, 10, dx=-2)
    R.add('town', 'cloth', 13, 10)
    # --- street lamps, one rule: every 13th column from 6
    for tx in range(6, R.w - 1, 13):
        if R.floor(tx, 10):
            R.add('town', 'lamp', tx, 10)
    # --- things standing about
    R.add('town', 'barrels', 22, 10, dx=-2)
    R.add('town', 'barrel', 1, 10, dx=1)
    R.add('town', 'barrel', 43, 10, dx=1)
    R.add('town', 'planter-a', 34, 10, dx=-1)
    R.add('town', 'planter-b', 36, 10, dx=-2)
    R.add('undercroft', 'barrel', 31, 6, dx=1)
    # --- one chimney on each building, a tile in from its west end
    R.add('town', 'chimney', 11, 4, dx=2)
    R.add('town', 'chimney', 25, 2, dx=2)


def courtyard(R):
    # columns 1-13 are kept clear for Step 7's machine (the room file says so): nothing stands there.
    R.add('courtyard', 'ruin-arch', 3, 7, layer='far', support='wall')
    R.add('courtyard', 'ruin-arch', 9, 7, dx=8, layer='far', flip=True, support='wall')
    # ivy hanging from the top edge, one rule: every 5th column from 3
    for i, tx in enumerate(range(3, R.w - 1, 5)):
        if R.plain(tx, 1) and R.kind(tx, 0) == 'solid':
            name = ['ivy-long', 'ivy-short', 'ivy-long-b'][i % 3]
            R.add('courtyard', name, tx, 1, dy={'ivy-long': 12, 'ivy-short': -2, 'ivy-long-b': 8}[name], support='ceiling')
    R.add('courtyard', 'tree', 17, 7, dx=4)
    R.add('courtyard', 'grass', 17, 7, dx=2)
    R.add('courtyard', 'flower-pink', 21, 7, dx=2)
    R.add('courtyard', 'bush', 23, 7, dx=1)
    R.add('courtyard', 'column-broken', 26, 7, dx=0)
    R.add('courtyard', 'flower-white', 27, 7, dx=4)
    R.add('courtyard', 'column-stump', 28, 7, dx=-3)
    R.add('courtyard', 'flower-gold', 19, 7, dx=6)


def throne_room(R):
    # one rule for the back wall: a column every 4th column from 4, a banner halfway between each pair,
    # a torch on every column at two heights. It runs the whole width of the room.
    for tx in range(4, R.w - 1, 4):
        bottom = max(ty for ty in range(R.h) if R.kind(tx, ty) != 'solid')
        R.column(tx, 1, bottom)
        R.add('castle', 'torch', tx, 10, dx=2, layer='far', support='wall')
    for i, tx in enumerate(range(6, R.w - 1, 4)):
        R.add('castle', 'banner-red', tx, 11, dy=-4, layer='far', support='wall')
        R.add('castle', 'banner-blue', tx, 3, dy=-4, layer='far', support='wall')
    R.add('castle', 'portrait-a', 10, 7, dy=-2, layer='far', support='wall')
    R.add('castle', 'portrait-b', 14, 7, dy=-2, layer='far', support='wall')
    R.add('castle', 'armour', 17, 14, dx=-1, layer='far', support='wall')
    # the red carpet: from the east door's side up to the throne (the throne stands on tiles 4-5 of the dais)
    for tx in range(8, 17):
        R.add('castle', 'carpet-mid', tx, 14)
    R.add('castle', 'carpet-end', 17, 14)
    for tx in range(5, 8):
        R.add('castle', 'carpet-mid', tx, 13)
    R.add('castle', 'carpet-end', 4, 13, flip=True)
    R.add('castle', 'carpet-drop', 8, 14, support='wall')


def hall_gallery(R):
    # the ground floor is kept clear for Step 7's pedestals (the room file says so): wall decoration only.
    for tx in range(3, R.w - 1, 5):
        R.column(tx, 1, 10)
        R.add('castle', 'torch', tx, 8, dx=2, layer='far', support='wall')
    for i, tx in enumerate(range(5, R.w - 1, 5)):
        if i % 2 == 0:
            R.add('castle', 'banner-blue', tx, 7, dx=8, dy=-4, layer='far', support='wall')
        else:
            R.add('castle', 'portrait-' + 'ab'[(i // 2) % 2], tx, 7, dx=8, dy=-6, layer='far', support='wall')


def undercroft(R):
    # dim torches: every 6th column from 1, on two levels, wherever two open cells give them room
    for ty in (4, 11):
        for tx in range(1, R.w - 1, 6):
            if R.plain(tx, ty) and R.plain(tx, ty - 1):
                R.add('undercroft', 'torch', tx, ty, dx=2, dy=-2, layer='far', support='wall')
    used = set()
    for ty in range(1, R.h - 1):
        for tx in range(1, R.w - 1):
            if not R.plain(tx, ty):
                continue
            above = R.kind(tx, ty - 1) == 'solid'
            # cobwebs in top corners
            if above and R.kind(tx - 1, ty) == 'solid' and hsh(tx, ty, 21) % 10 < 7:
                R.add('undercroft', 'cobweb', tx, ty, support='ceiling')
            elif above and R.kind(tx + 1, ty) == 'solid' and hsh(tx, ty, 22) % 10 < 7:
                R.add('undercroft', 'cobweb', tx, ty, flip=True, support='ceiling')
            # chains from the roof, where there is room to hang
            elif above and R.plain(tx, ty + 1) and R.plain(tx, ty + 2) and tx % 6 != 1 and hsh(tx, ty, 23) % 8 == 0:  # not in front of a torch
                R.add('undercroft', 'chain', tx, ty, dx=5, support='ceiling')
                R.add('undercroft', 'chain-end', tx, ty + 1, dx=5, support='ceiling')
            # barrels on floors with headroom
            if R.floor(tx, ty) and R.plain(tx, ty - 1) and (tx, ty) not in used:
                pick = hsh(tx, ty, 34) % 11
                if pick == 0 and R.floor(tx + 1, ty) and R.plain(tx + 1, ty - 1):
                    R.add('undercroft', 'barrel-stack', tx, ty, dx=1)
                    used.add((tx + 1, ty))
                elif pick in (1, 2):
                    R.add('undercroft', 'barrel', tx, ty, dx=1)


def graybox_hall(R):
    for tx in range(3, R.w - 1, 6):
        if R.plain(tx, 7) and R.plain(tx, 6):
            R.add('castle', 'torch', tx, 7, dx=2, layer='far', support='wall')
    for tx in range(6, R.w - 1, 6):
        R.add('castle', 'banner-blue', tx, 3, dy=-4, layer='far', support='wall')


PLACERS = {
    'castle-street': castle_street, 'courtyard': courtyard, 'throne-room': throne_room,
    'hall-gallery': hall_gallery, 'undercroft': undercroft, 'graybox-hall': graybox_hall,
}


def place_all():
    out = {}
    all_rooms = load_rooms()
    for rid, fn in PLACERS.items():
        R = Room(all_rooms[rid])
        fn(R)
        out[rid] = R
    return out
