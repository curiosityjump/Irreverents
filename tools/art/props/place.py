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

# round 3: where the light is on each lit piece, from its bottom-left: (glow radius, x, y up from the bottom)
GLOW3 = {'chandelier-hung': (22, 13, 8), 'lantern-hung': (14, 5, 6), 'fire': (20, 9, 13)}


class Room:
    def __init__(self, r):
        self.r = r; self.id = r['id']
        self.rows = r['rows']; self.w = len(self.rows[0]); self.h = len(self.rows)
        self.legend = r['legend']
        self.items = []
        # round 3: the tiles people and things are placed on (content/placements/), so scattered pieces keep off
        pl = os.path.join(ROOT, 'content', 'placements', self.id + '.json')
        self.occupied = set()
        if os.path.exists(pl):
            j = json.load(open(pl))
            for p in (j.get('place') or []) + (j.get('things') or []):
                self.occupied.add(tuple(p['tile']))

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

    def add(self, sheet, name, tx, ty, dx=0, dy=0, layer='back', flip=False, support='floor', blend=None):
        it = {'sheet': sheet, 'name': name, 'tx': tx, 'ty': ty, 'dx': dx, 'dy': dy, 'layer': layer, 'flip': flip, 'support': support}
        if blend:
            it['blend'] = blend
        self.items.append(it)

    def glow(self, sheet, name, r, cx, cy, layer):
        """A glow (blend: lighter) centred on the room pixel (cx, cy): round 2, on a light that is already
        there (INTENT: placed by the same rule as the light it sits on, never as a hint)."""
        tx, ty = cx // T, cy // T
        self.add(sheet, name, tx, ty, dx=cx - r - tx * T, dy=cy + r - (ty + 1) * T, layer=layer, support='glow', blend='lighter')

    def glows(self):
        """A glow on every torch and lantern post this room already has."""
        for it in list(self.items):
            left = it['tx'] * T + it['dx']
            bottom = (it['ty'] + 1) * T + it['dy']
            if it['name'] == 'torch':
                dark = it['sheet'] == 'undercroft'
                self.glow(it['sheet'], 'glow-torch', 18, left + 5, bottom - 22 + (7 if dark else 6), it['layer'])
            elif it['name'] == 'lantern-post' and self.id != 'castle-street':
                # DRAFT: no glow on a lantern in daylight: added light on a bright sky only bleaches it
                cx = left + (29 - 24 if it['flip'] else 24)
                self.glow(it['sheet'], 'glow-lantern', 16, cx, bottom - 49 + 31, it['layer'])

    def glows3(self):
        """Round 3: a glow on every hung light (chandelier, lantern, mine lantern) and the camp's fire."""
        for it in list(self.items):
            left = it['tx'] * T + it['dx']
            bottom = (it['ty'] + 1) * T + it['dy']
            spot = GLOW3.get(it['name'])
            if spot:
                r, ox, oy = spot
                self.glow(it['sheet'], 'glow-%d' % r, r, left + ox, bottom - oy, it['layer'])

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
    # round 2: every other one is the art desk's lantern post (imported), with a glow
    for i, tx in enumerate(range(6, R.w - 1, 13)):
        if R.floor(tx, 10):
            if i % 2 and R.floor(tx + 1, 10):
                R.add('town', 'lantern-post', tx, 10, dx=-2)
            else:
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
    # DRAFT (round 3): the quarry doorway (columns 17-19), the plates (16, 22), the outpost doorway (23) and the
    # gate (25) came after round 2 and the old tree, grass, bush and a flower stood on them. Moved: the tree east
    # of the gate, the broken column back among the far-off ruins, the small things into the gaps; the bush gone.
    R.add('courtyard', 'column-broken', 11, 7, dx=4, layer='far', support='wall')
    R.add('courtyard', 'tree', 26, 7, dx=1)
    R.add('courtyard', 'grass', 21, 7, dx=4)
    R.add('courtyard', 'flower-pink', 21, 7, dx=2)
    R.add('courtyard', 'flower-white', 27, 7, dx=4)
    R.add('courtyard', 'column-stump', 28, 7, dx=-3)
    R.add('courtyard', 'flower-gold', 24, 7, dx=2)


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


def undercroft_posts(R):
    # round 2: lantern posts on the lower floor, one rule: every 10th column from 9, wherever three
    # open cells above the floor and the next column give them room
    for tx in range(9, R.w - 2, 10):
        if R.floor(tx, 12) and R.floor(tx + 1, 12) and all(R.plain(tx + k, 12 - j) for j in range(3) for k in (0, 1)):
            R.add('undercroft', 'lantern-post', tx, 12, dx=0)


def graybox_hall(R):
    for tx in range(3, R.w - 1, 6):
        if R.plain(tx, 7) and R.plain(tx, 6):
            R.add('castle', 'torch', tx, 7, dx=2, layer='far', support='wall')
    for tx in range(6, R.w - 1, 6):
        R.add('castle', 'banner-blue', tx, 3, dy=-4, layer='far', support='wall')


# ---------------------------------------------------------------- round 3 (handoff-prompts/look3-props.md)

def cantina(R):
    """The tavern (DRAFT: first pass). Floor row 10 (top at y 160), doorway column 3, pads at columns 8, 12, 16
    and 20 and the bell at 13 (content/cantina/cantina.json): furniture stands only between them, so nothing
    covers a pad's floor line, the bell or the doorway. The stage is marked by red swags across its top and
    bunting between them; the light is a chandelier over the middle and two lanterns, each with a glow."""
    # the bar by the doorway: counter, and on the wall over it two bottle shelves either side of a mirror
    R.add('tavern', 'bar', 4, 9, dx=4)
    R.add('tavern', 'shelf-bottles', 4, 7, dx=3, dy=-6, support='wall')
    R.add('tavern', 'mirror', 5, 7, dx=8, dy=-5, support='wall')
    R.add('tavern', 'shelf-plates', 6, 7, dx=9, dy=-6, support='wall')
    # tables with stools in the gaps between the pads
    for tx, dx in ((9, 1), (17, 1)):
        R.add('tavern', 'stool', tx, 9, dx=dx)
        R.add('tavern', 'table', tx, 9, dx=dx + 11)
        R.add('tavern', 'stool', tx, 9, dx=dx + 31, flip=True)
    R.add('tavern', 'table-mug', 14, 9, dx=2)
    R.add('tavern', 'barrel', 15, 9, dx=1)
    # kegs past the last pad, under the raised side platform
    R.add('tavern', 'kegs', 21, 9, dx=2)
    # banners on the wall, one rule: every 5th column from 10
    for tx in range(10, R.w - 4, 5):
        R.add('tavern', 'banner', tx, 4, dy=0, support='wall')
    # the stage: a red swag every 4 columns across the top, from 7 to 21, bunting strung between
    for tx in range(7, 22, 4):
        R.add('tavern', 'swag', tx, 1, dx=-2, dy=2, support='ceiling')
    for tx in range(9, 20, 4):
        R.add('tavern', 'bunting', tx, 1, dx=-6, dy=-2, support='ceiling')
    # light: a chandelier over the middle, a lantern over the bar and one over the kegs
    R.add('tavern', 'chandelier-hung', 12, 3, dx=3, support='ceiling')
    R.add('tavern', 'lantern-hung', 6, 3, dx=3, support='ceiling')
    R.add('tavern', 'lantern-hung', 22, 3, dx=3, support='ceiling')


def outpost(R):
    """The Bandit Camp (DRAFT: first pass). Floor row 11 (top at y 176), the ledge at row 6, the step at
    columns 5-7, the lookout at 18, the horn post at 20, fighters at 25 and 28, waves walking in at 41
    (content/placements/outpost.json, content/outposts/outpost.json): tents, the fire and the rack stand
    between them, the palisade runs behind the whole camp on the far layer."""
    for tx in range(9, R.w - 2):
        R.add('camp', 'palisade', tx, 10, layer='far', support='wall')
    R.add('camp', 'tent', 10, 10, dx=4)
    R.add('camp', 'flag', 14, 10, dx=-6)
    R.add('camp', 'rack', 15, 10, dx=6)
    R.add('camp', 'fire', 22, 10, dx=4)
    R.add('camp', 'crate', 30, 10)
    R.add('camp', 'tent-blue', 32, 10, dx=2)
    R.add('camp', 'tent', 35, 10, dx=2, flip=True)
    R.add('camp', 'crate', 38, 10, dx=4)
    # DRAFT (props-asks-2, ask 2): the run east of the old camp (columns 44-87, Step 20 builder B): tents, a flag
    # and the rack between the breakables (the fence at 47, stalls at 55-56 and 64-65, the barricade at 75), the
    # cache (79) and the step (84-86) left clear. No decor crates out here: loose crates on that floor are things
    # you throw. Only where it fits (a part's tiles stay clear: selfcheck), so a later layout change drops, not clashes.
    for name, tx, dx, flip in (('tent-blue', 50, 2, False), ('flag', 59, -2, False), ('rack', 61, 4, False),
                               ('tent', 69, 2, True), ('flag', 73, 0, False)):
        if R.w > tx + 2 and R.plain(tx, 10) and R.floor(tx, 10):
            R.add('camp', name, tx, 10, dx=dx, flip=flip)


def quarry(R):
    """The six quarry rooms (DRAFT: first pass). One rule each, never reading a door's or a room's hidden flag:
    a scaffold on the far layer every 12th column wherever four open cells stand on a floor; a rock pile by a
    fixed hash on floor cells; a lantern hung from the ceiling every 9th column in the cave and the pit
    (rooms with no daylight), with a glow."""
    for ty in range(2, R.h - 1):
        for tx in range(3, R.w - 3, 12):
            if R.floor(tx, ty) and R.floor(tx + 1, ty) and all(R.plain(tx + k, ty - j) for j in range(3) for k in (0, 1)):
                R.add('quarry', 'scaffold', tx, ty, layer='far', support='wall')
    for ty in range(1, R.h - 1):
        for tx in range(1, R.w - 1):
            near = any((tx + k, ty) in R.occupied for k in (-1, 0, 1, 2))
            if R.floor(tx, ty) and R.floor(tx + 1, ty) and R.plain(tx, ty - 1) and R.plain(tx + 1, ty - 1) and not near:
                pick = hsh(tx, ty, 61) % 9
                if pick == 0:
                    R.add('quarry', 'rocks', tx, ty, dx=2)
                elif pick == 1:
                    R.add('quarry', 'rocks-small', tx, ty, dx=1)
    if R.id in ('quarry-cave', 'quarry-pit'):
        for tx in range(4, R.w - 2, 9):
            if R.plain(tx, 1) and R.plain(tx, 2) and R.kind(tx, 0) == 'solid':
                R.add('quarry', 'lantern-hung', tx, 2, dx=2, support='ceiling')


PLACERS = {
    'castle-street': castle_street, 'courtyard': courtyard, 'throne-room': throne_room,
    'hall-gallery': hall_gallery, 'undercroft': undercroft, 'graybox-hall': graybox_hall,
    'cantina': cantina, 'outpost': outpost,
    'quarry-road': quarry, 'quarry-ridge': quarry, 'quarry-tower': quarry, 'quarry-depot': quarry,
    'quarry-pit': quarry, 'quarry-cave': quarry,
}


# round 2: rooms whose torches and lantern posts get a glow (the brief's list, plus the street's posts and
# its one torch in the upper room)
GLOW_ROOMS = ('throne-room', 'hall-gallery', 'undercroft', 'graybox-hall', 'castle-street')


def place_all():
    out = {}
    all_rooms = load_rooms()
    for rid, fn in PLACERS.items():
        R = Room(all_rooms[rid])
        fn(R)
        if rid == 'undercroft':
            undercroft_posts(R)
        if rid in GLOW_ROOMS:
            R.glows()
        R.glows3()
        out[rid] = R
    return out
