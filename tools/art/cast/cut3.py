"""Round 3: people cut from the art desk's source sheets (source.py), posed into sheets.

DRAFT: round 3 of the look (handoff-prompts/look3-cast.md). Each person
is a few source poses (`POSES`, rectangles on a plate, all cut at one
scale so they stay the same size) and a table of states, each a list of
frames made from those poses by small, deterministic edits:

  lift(p, n)   the whole figure n px up (a run's passing pose, a hop)
  breathe(p)   one row taken out of the torso: an idle's in-breath
  lean(p, k)   a shear, the head k px ahead of the feet (back when < 0)
  flush(p)     mood 3: the skin of the head goes red (the bar's "red
               face, costume unchanged"; never a wash over the costume)
  sweat(p)     mood 2: a sweat drop beside the head
  isl(name)    the same pose cut with its floating islands kept (the
               knocked-out swirl, a mood-2 sweat drop the plate drew)

A pose a plate lacks is made from one it has (a carry from the arms-up
pose; a hurt from a recoil). Where a plate has the mood's own face (the
brawler's yell, the patron's side-eye), that pose is used; elsewhere the
face is edited. Every frame is placed by its foot point on the bottom
centre of the cell, where the collision box's feet are.
"""
from PIL import Image

from px import INK, RAMP, hexc
from source import cut

SKIN = {hexc('c88a5a'): RAMP['red'][0], hexc('f0c090'): RAMP['red'][2], hexc('ffe2c0'): RAMP['red'][3],
        hexc('e0a878'): RAMP['red'][1], hexc('e3a56b'): RAMP['red'][1], hexc('ffd090'): RAMP['red'][2],
        hexc('ffa048'): RAMP['red'][2], hexc('e0a860'): RAMP['red'][1]}


class Pose:
    def __init__(self, im, foot, dy=0, dx=0):
        self.im, self.foot, self.dy, self.dx = im, foot, dy, dx

    def copy(self, **kw):
        p = Pose(self.im.copy(), self.foot, self.dy, self.dx)
        for k, v in kw.items():
            setattr(p, k, v)
        return p


def lift(p, n=1):
    return p.copy(dy=p.dy - n)


def shove(p, n=1):
    return p.copy(dx=p.dx + n)


def breathe(p, at=0.55):
    im = p.im
    r = int(im.height * at)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.paste(im.crop((0, 0, im.width, r)), (0, 1))
    out.paste(im.crop((0, r + 1, im.width, im.height)), (0, r + 1))
    return p.copy(im=out)


def lean(p, k):
    """Shear: the top row moves k px (forward when k > 0), the bottom row stays."""
    im = p.im
    pad = abs(k)
    out = Image.new('RGBA', (im.width + 2 * pad, im.height), (0, 0, 0, 0))
    for y in range(im.height):
        off = int(round(k * (1 - (y + 0.5) / im.height)))
        out.paste(im.crop((0, y, im.width, y + 1)), (pad + off, y))
    return p.copy(im=out, foot=(p.foot[0] + pad, p.foot[1]))


def flush(p, frac=0.62):
    im = p.im.copy()
    px = im.load()
    lim = int(im.height * frac)
    for y in range(lim):
        for x in range(im.width):
            c = px[x, y]
            if c[3] and c[:3] in SKIN:
                px[x, y] = SKIN[c[:3]] + (255,)
    return p.copy(im=im)


def sweat(p, at=(0.82, 0.12)):
    """A drop beside the head (light blue, inked), outside the figure on the right."""
    im = p.im
    pad = 4
    out = Image.new('RGBA', (im.width + pad, im.height), (0, 0, 0, 0))
    out.paste(im, (0, 0))
    o = out.load()
    x0 = int(im.width * at[0]) + 1
    y0 = int(im.height * at[1])
    drop = {(1, 0): 'i', (0, 1): 'i', (1, 1): 'l', (2, 1): 'i', (0, 2): 'i', (1, 2): 'm', (2, 2): 'i', (1, 3): 'i'}
    for (dx, dy), t in drop.items():
        x, y = x0 + dx, y0 + dy
        if 0 <= x < out.width and 0 <= y < out.height and (t != 'i' or not o[x, y][3]):
            o[x, y] = {'i': INK, 'l': RAMP['blue'][3], 'm': RAMP['blue'][2]}[t] + (255,)
    return p.copy(im=out)


def place(p, cw, ch):
    """The pose in a cw x ch cell, its foot on the bottom centre (moved by dx, dy)."""
    cell = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    bb = p.im.getbbox()
    im = p.im.crop(bb)
    x = int(round(cw / 2 - p.foot[0])) + p.dx + bb[0]
    y = ch - p.im.height + p.dy + bb[1]
    if x < 0 or y < 0 or x + im.width > cw or y + im.height > ch:
        raise SystemExit('a %dx%d pose does not fit its %dx%d cell at (%d, %d)' % (im.width, im.height, cw, ch, x, y))
    cell.alpha_composite(im, (x, y))
    return cell


# ----------------------------------------------------------------- the five

def _poses(key, scale, table, **common):
    out = {}
    for name, spec in table.items():
        rect = spec[0]
        kw = dict(common, **(spec[1] if len(spec) > 1 else {}))
        im, foot = cut(key, rect, scale, **kw)
        out[name] = Pose(im, foot)
    return out


def brawler():
    # P04 cantina sheet, row 3: the bald strongman.
    P = _poses('cantina', 0.175, {
        'arms': ((48, 593, 216, 790),),
        'walk1': ((244, 599, 400, 790),),
        'walk2': ((427, 597, 565, 790),),
        'guard': ((583, 605, 777, 790),),
        'guards': ((583, 560, 774, 790), {'keep_islands': True, 'minisle': 200}),
        'punch': ((776, 606, 980, 790), {'erase': ((935, 600, 990, 790),)}),
        'yell': ((1022, 614, 1209, 790),),
        'ko': ((1206, 687, 1411, 790),),
    })
    a, w1, w2, g, p, y, k = P['arms'], P['walk1'], P['walk2'], P['guard'], P['punch'], P['yell'], P['ko']
    run = [w1, lift(w1), w2, w2, lift(w2), w1]
    S = {
        'idle': [a, a, breathe(a), breathe(a)],
        'run': run,
        'air': [lift(g, 0), lean(y, -1)],
        'attack': [lean(g, -2), p, p, g],
        'hurt': [lean(g, -3), lean(g, -4), lean(g, -4)],
        'down': [k, breathe(k, 0.4)],
        'held': [lean(g, -2), lean(g, 2), lean(g, -2), lean(g, 2)],
        'talk': [a, breathe(a)],
        'grab': [lean(p, 1)],
        'carry': [y, breathe(y)],
        'carryRun': [lean(y, 1), lift(lean(y, 1)), lean(y, 1), lift(lean(y, 1))],
        'throw': [lean(g, -2), p, p],
    }
    M2 = {
        'idle': [P['guards'], P['guards'], breathe(P['guards']), breathe(P['guards'])],
        'talk': [P['guards'], breathe(P['guards'])],
    }
    M3 = {
        'idle': [flush(y, 0.45), flush(y, 0.45), breathe(flush(y, 0.45)), breathe(flush(y, 0.45))],
        'talk': [flush(y, 0.45), breathe(flush(y, 0.45))],
    }
    return dict(cell=(56, 48), box=(18, 28), S=S, M2=M2, M3=M3, carryAt=(28, 13), head=0.45)


def skirmisher():
    # P04 cantina sheet, row 2: the feathered-hat patron.
    P = _poses('cantina', 0.15, {
        'idle': ((66, 349, 229, 545), {'erase': ((190, 470, 240, 545),)}),
        'cheer': ((268, 360, 447, 545),),
        'side': ((499, 359, 645, 545),),
        'punch': ((692, 356, 922, 545), {'erase': ((850, 356, 930, 545),)}),
        'fly': ((932, 353, 1142, 520),),
        'ko': ((1161, 420, 1388, 545),),
        'kos': ((1161, 360, 1388, 545), {'keep_islands': True, 'minisle': 200}),
    })
    i, c, s, p, f, k = P['idle'], P['cheer'], P['side'], P['punch'], P['fly'], P['ko']
    run = [lean(i, 2), lift(lean(i, 2)), lean(s, 2), lean(s, 2), lift(lean(s, 2)), lean(i, 2)]
    S = {
        'idle': [i, i, breathe(i), breathe(i)],
        'run': run,
        'air': [lift(c, 0), f],
        'attack': [lean(s, -1), p, p, s],
        'hurt': [lean(f, -1), f, f],
        'down': [k, P['kos']],
        'held': [f, lean(f, 2), f, lean(f, -2)],
        'talk': [i, c],
        'grab': [lean(p, 1)],
        'carry': [c, breathe(c)],
        'carryRun': [lean(c, 1), lift(lean(c, 1)), lean(c, 1), lift(lean(c, 1))],
        'throw': [lean(s, -1), p, p],
    }
    M2 = {'idle': [s, s, breathe(s), breathe(s)], 'talk': [s, breathe(s)]}
    M3 = {'idle': [flush(p), flush(p), breathe(flush(p)), breathe(flush(p))], 'talk': [flush(s), flush(c)]}
    return dict(cell=(56, 48), box=(12, 18), S=S, M2=M2, M3=M3, carryAt=(28, 22))


def outpost_fighter():
    # P07 enemy sheet, row 1: the red-hooded bandit with a dagger.
    P = _poses('p07enemy', 0.32, {
        'i0': ((34, 78, 123, 176),),
        'i1': ((150, 80, 235, 176),),
        'w2': ((259, 82, 343, 176),),
        'w3': ((367, 79, 448, 176), {'erase': ((367, 150, 395, 176),)}),
        'alert': ((462, 80, 556, 176),),
        'ready': ((570, 82, 671, 176),),
        'raise': ((688, 73, 795, 176),),
        'slash': ((819, 79, 937, 176), {'erase': ((880, 79, 940, 176),)}),
        'recover': ((952, 81, 1048, 176),),
        'hit': ((1067, 92, 1160, 176),),
        'dizzy': ((1182, 103, 1268, 176),),
        'ko': ((1291, 112, 1412, 176),),
    })
    i0, i1, w2, w3 = P['i0'], P['i1'], P['w2'], P['w3']
    S = {
        'idle': [i0, i0, i1, i1],
        'run': [w2, lift(w2), w3, w3, lift(w3), w2],
        'air': [lift(P['alert'], 0), lean(P['alert'], -1)],
        'attack': [P['raise'], P['slash'], P['slash'], P['recover']],
        'hurt': [lean(P['hit'], -2), P['hit'], P['dizzy']],
        'down': [P['dizzy'], P['ko']],
        'held': [P['hit'], lean(P['hit'], 2), P['hit'], lean(P['hit'], -2)],
        'talk': [i0, P['alert']],
    }
    M2 = {'idle': [P['alert'], P['alert'], breathe(P['alert']), breathe(P['alert'])], 'talk': [P['alert'], i0]}
    M3 = {'idle': [flush(P['ready']), flush(P['ready']), breathe(flush(P['ready'])), breathe(flush(P['ready']))],
          'talk': [flush(P['ready']), flush(P['raise'])]}
    return dict(cell=(56, 48), box=(14, 28), S=S, M2=M2, M3=M3)


def outpost_lookout():
    # P07 enemy sheet, row 2: the purple-hooded signaller with a horn.
    P = _poses('p07enemy', 0.285, {
        'i0': ((28, 237, 122, 352),),
        'i1': ((138, 245, 226, 352),),
        'i2': ((247, 246, 330, 352),),
        'w3': ((353, 247, 438, 352), {'erase': ((353, 320, 378, 352),)}),
        'alert': ((466, 250, 547, 352),),
        'lift': ((563, 250, 660, 352),),
        'horn': ((679, 236, 790, 352),),
        'blow': ((807, 249, 907, 352), {'erase': ((880, 230, 920, 352),)}),
        'hit': ((1063, 258, 1149, 352),),
        'dizzy': ((1171, 287, 1268, 352),),
        'ko': ((1290, 291, 1413, 352),),
    })
    i0, i1, i2, w3 = P['i0'], P['i1'], P['i2'], P['w3']
    S = {
        'idle': [i0, i0, breathe(i0), breathe(i0)],
        'run': [w3, lift(w3), i2, i2, lift(i2), w3],
        'air': [lift(P['alert'], 0), lean(P['alert'], -1)],
        'attack': [P['lift'], P['horn'], P['blow'], P['blow']],
        'hurt': [lean(P['hit'], -2), P['hit'], P['hit']],
        'down': [P['dizzy'], P['ko']],
        'held': [P['hit'], lean(P['hit'], 2), P['hit'], lean(P['hit'], -2)],
        'talk': [i0, i1],
    }
    M2 = {'idle': [P['alert'], P['alert'], breathe(P['alert']), breathe(P['alert'])], 'talk': [P['alert'], i1]}
    M3 = {'idle': [flush(P['lift']), flush(P['lift']), breathe(flush(P['lift'])), breathe(flush(P['lift']))],
          'talk': [flush(P['lift']), flush(P['horn'])]}
    return dict(cell=(56, 48), box=(12, 26), S=S, M2=M2, M3=M3)


def signal_post():
    # P03 villain sheet, row 4: the horn post, its horns taken off (the props lane hangs the horn).
    im, foot = cut('villains', (100, 812, 300, 1032), 0.16,
                   erase=((100, 848, 162, 916), (100, 862, 180, 916), (236, 848, 300, 916), (220, 862, 300, 916)))
    p = Pose(im, foot)
    return dict(cell=(32, 48), box=(10, 32), S={'idle': [p], 'run': [p], 'air': [p], 'hurt': [lean(p, 2), lean(p, -1), p]}, M2={}, M3={}, thing=True)


ROUND3 = {
    'brawler': brawler,
    'skirmisher': skirmisher,
    'outpost-fighter': outpost_fighter,
    'outpost-lookout': outpost_lookout,
    'signal-post': signal_post,
}


# ----------------------------------------------------------------- the town's four (round 3, push 2)

def hat_image():
    """The villain's tall top hat (round 2's silhouette): purple, a red band, lit from the top-left."""
    pu, re_ = RAMP['purple'], RAMP['red']
    rows = [  # one string per row; . clear, k ink, 0-3 purple tones, r/R red band, w highlight
        '...kkkkkkkkkkk...',
        '...k3322221110k..',
        '...k3222221110k..',
        '...kw222221110k..',
        '...kw222221100k..',
        '...k3222221100k..',
        '...k3222211100k..',
        '...k3222211100k..',
        '...kRRRRRrrrrrk..',
        '...krrrrrrrrrrk..',
        '.kkkkkkkkkkkkkkk.',
        'k332222222111100k',
        'kkkkkkkkkkkkkkkkk',
    ]
    w = max(len(r) for r in rows)
    im = Image.new('RGBA', (w, len(rows)), (0, 0, 0, 0))
    o = im.load()
    pal = {'k': INK, '0': pu[0], '1': pu[1], '2': pu[2], '3': pu[3], 'w': pu[3], 'r': re_[1], 'R': re_[2]}
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in pal:
                o[x, y] = pal[ch] + (255,)
    return im


def tophat(p, sink=3):
    """The top hat set on the head, centred on the head's top."""
    im = p.im
    top = min(y for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3])
    row = [x for y in range(top, top + 6) for x in range(im.width) if im.getpixel((x, y))[3]]
    cx = (min(row) + max(row) + 1) // 2
    hat = hat_image()
    pad = hat.height - sink
    oy = max(0, pad - top)
    hx = cx - hat.width // 2
    ox = max(0, -hx)
    out = Image.new('RGBA', (max(im.width, hx + hat.width) + ox, im.height + oy), (0, 0, 0, 0))
    out.paste(im, (ox, oy))
    out.alpha_composite(hat, (hx + ox, top + oy + sink - hat.height))
    return Pose(out, (p.foot[0] + ox, p.foot[1] + oy), p.dy, p.dx)


def dehorn(p, frac=0.4):
    """Takes the hood's gold horns off (the top hat sits where they were)."""
    from source import _ink
    im = p.im.copy()
    px = im.load()
    gold = set(RAMP['gold']) | set(RAMP['orange']) | {hexc('e0a860'), hexc('b97a40')}
    lim = int(im.height * frac)
    gone = set()
    for y in range(lim):
        for x in range(im.width):
            c = px[x, y]
            if c[3] and c[:3] in gold:
                px[x, y] = (0, 0, 0, 0)
                gone.add((x, y))
    for x, y in gone:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                q = (x + dx, y + dy)
                if 0 <= q[0] < im.width and 0 <= q[1] < im.height and px[q][3] and px[q][:3] == INK:
                    px[q] = (0, 0, 0, 0)
    # ink left floating where a horn was: drop ink with no coloured neighbour
    for _ in range(2):
        drop = [(x, y) for y in range(lim) for x in range(im.width) if px[x, y][3] and px[x, y][:3] == INK and not any(
            0 <= x + dx < im.width and 0 <= y + dy < im.height and px[x + dx, y + dy][3] and px[x + dx, y + dy][:3] != INK
            for dx in (-1, 0, 1) for dy in (-1, 0, 1))]
        for x, y in drop:
            px[x, y] = (0, 0, 0, 0)
    from source import _clean
    _clean(im)
    _clean(im)
    _ink(im)
    return p.copy(im=im)


def guard():
    # P03 town sheet, row 2: helmet, plume, shield and spear.
    P = _poses('town', 0.22, {
        'i0': ((33, 353, 147, 512),),
        'i1': ((172, 355, 285, 512),),
        'alert': ((306, 368, 425, 512),),
        'run': ((426, 368, 566, 512), {'erase': ((426, 470, 470, 512),)}),
        'thrust': ((589, 368, 729, 512),),
        'swing': ((725, 370, 875, 512), {'erase': ((830, 370, 880, 512),)}),
        'calm': ((887, 356, 992, 512),),
        'worry': ((1026, 368, 1125, 512),),
        'worrys': ((990, 330, 1125, 512), {'keep_islands': True, 'minisle': 150}),
        'angry': ((1158, 370, 1258, 512),),
        'ko': ((1278, 425, 1432, 512),),
        'kos': ((1278, 360, 1432, 512), {'keep_islands': True, 'minisle': 150}),
    }, drop=('purple', 'stone', 'night'))
    i0, i1, r = P['i0'], P['i1'], P['run']
    S = {
        'idle': [i0, i0, i1, i1, i0, breathe(i0), breathe(i0), i0],
        'run': [r, lift(r), lean(i1, 2), lean(i1, 2), lift(r), r],
        'air': [lift(P['alert'], 0), lean(P['alert'], -1)],
        'attack': [lean(i1, -2), P['thrust'], P['swing'], P['swing']],
        'hurt': [lean(P['worry'], -3), lean(P['worry'], -4), lean(P['worry'], -4)],
        'down': [P['ko'], P['kos']],
        'held': [lean(P['worry'], -2), lean(P['worry'], 2), lean(P['worry'], -2), lean(P['worry'], 2)],
        'talk': [i0, P['calm'], i0, P['calm']],
    }
    M2 = {'idle': [P['worrys'], P['worrys'], breathe(P['worrys']), breathe(P['worrys'])],
          'talk': [P['worrys'], P['alert']]}
    M3 = {'idle': [flush(P['angry']), flush(P['angry']), breathe(flush(P['angry'])), breathe(flush(P['angry']))],
          'talk': [flush(P['angry']), breathe(flush(P['angry']))]}
    return dict(cell=(56, 48), box=(14, 28), S=S, M2=M2, M3=M3, head=0.75)


def king():
    # P03 town sheet, row 3: crown, white beard, ermine; knocked out from P07's king row.
    P = _poses('town', 0.215, {
        'idle': ((35, 580, 189, 765),),
        'laugh': ((218, 598, 382, 765),),
        'talk': ((406, 590, 564, 765),),
        'thumb': ((572, 593, 715, 765), {'erase': ((690, 593, 720, 660),)}),
        'side': ((744, 595, 888, 765),),
        'walk': ((908, 595, 1039, 765),),
        'worry': ((1059, 599, 1208, 765),),
        'angry': ((1237, 601, 1402, 765),),
    })
    ko, f = cut('p07npc', (1279, 795, 1412, 870), 0.29)
    P['ko'] = Pose(ko, f)
    i, w, s = P['idle'], P['walk'], P['side']
    S = {
        'idle': [i, i, breathe(i), breathe(i)],
        'run': [w, lift(w), s, s, lift(s), w],
        'air': [lift(P['laugh'], 0), lean(P['worry'], -1)],
        'attack': [lean(s, -2), lean(P['angry'], 2), lean(P['angry'], 2), s],
        'hurt': [lean(P['worry'], -3), lean(P['worry'], -4), lean(P['worry'], -4)],
        'down': [P['ko'], breathe(P['ko'], 0.4)],
        'held': [lean(P['worry'], -2), lean(P['worry'], 2), lean(P['worry'], -2), lean(P['worry'], 2)],
        'talk': [i, P['talk'], P['thumb'], P['talk'], i, P['laugh'], P['talk'], P['thumb']],
    }
    M2 = {'idle': [P['worry'], P['worry'], breathe(P['worry']), breathe(P['worry'])], 'talk': [P['worry'], breathe(P['worry'])]}
    M3 = {'idle': [flush(P['angry']), flush(P['angry']), breathe(flush(P['angry'])), breathe(flush(P['angry']))],
          'talk': [flush(P['angry']), breathe(flush(P['angry']))]}
    return dict(cell=(56, 48), box=(20, 30), S=S, M2=M2, M3=M3, head=0.7)


def shopkeeper():
    # P03 town sheet, row 1: the headscarf townswoman.
    P = _poses('town', 0.16, {
        'idle': ((115, 98, 286, 280),),
        'cheer': ((349, 110, 525, 280),),
        'worry': ((602, 107, 773, 280),),
        'worrys': ((590, 60, 773, 280), {'keep_islands': True, 'minisle': 150}),
        'angry': ((880, 107, 1055, 280), {'erase': ((820, 200, 905, 280),)}),
        'ko': ((1110, 172, 1318, 280),),
        'kos': ((1110, 90, 1318, 280), {'keep_islands': True, 'minisle': 150}),
    })
    i, c, a = P['idle'], P['cheer'], P['angry']
    S = {
        'idle': [i, i, breathe(i), breathe(i)],
        'run': [lean(i, 2), lift(lean(i, 2)), lean(c, 2), lean(c, 2), lift(lean(c, 2)), lean(i, 2)],
        'air': [lift(c, 0), lean(P['worry'], -1)],
        'attack': [lean(i, -2), a, a, i],
        'hurt': [lean(P['worry'], -3), lean(P['worry'], -4), lean(P['worry'], -4)],
        'down': [P['ko'], P['kos']],
        'held': [lean(P['worry'], -2), lean(P['worry'], 2), lean(P['worry'], -2), lean(P['worry'], 2)],
        'talk': [i, c, i, c],
    }
    M2 = {'idle': [P['worrys'], P['worrys'], breathe(P['worrys']), breathe(P['worrys'])], 'talk': [P['worrys'], breathe(P['worrys'])]}
    M3 = {'idle': [flush(a), flush(a), breathe(flush(a)), breathe(flush(a))],
          'run': [a, lift(a), lean(a, 1), lean(a, 1), lift(lean(a, 1)), a],
          'talk': [flush(a), breathe(flush(a))]}
    return dict(cell=(56, 48), box=(12, 24), S=S, M2=M2, M3=M3, head=0.75)


def villain():
    # DRAFT: P03 villain sheet, row 1 (the purple horned-hood villain: cape, colours, glowing eyes),
    # horns taken off and round 2's tall top hat put on, so he keeps the silhouette that made him
    # the tallest person in a room. The plain horned hood is the alternative: drop the tophat() and
    # dehorn() calls in vil() below (docs/decisions-log.md).
    raw = _poses('villains', 0.24, {
        'i0': ((22, 151, 152, 290),),
        'i1': ((189, 154, 303, 290),),
        'w0': ((341, 155, 457, 290),),
        'w1': ((478, 152, 631, 290),),
        'cast': ((638, 155, 809, 290), {'erase': ((760, 155, 815, 290),)}),
        'alert': ((818, 154, 950, 290),),
        'hit': ((966, 167, 1116, 290), {'erase': ((1060, 167, 1120, 240),)}),
        'worry': ((1131, 165, 1240, 290),),
    })

    def vil(p):
        return tophat(dehorn(p))
    P = {k: vil(v) for k, v in raw.items()}
    i0, i1, w0, w1 = P['i0'], P['i1'], P['w0'], P['w1']
    # knocked out: P07's robed caster lying flat (the nearest purple-robed KO on the plates), hat beside him
    ko, f = cut('p07enemy', (1296, 965, 1429, 1040), 0.3)
    ko = dehorn(Pose(ko, f), 0.7).im
    hat = hat_image().transpose(Image.ROTATE_270)
    base = Image.new('RGBA', (ko.width + hat.width + 1, max(ko.height, hat.height)), (0, 0, 0, 0))
    base.alpha_composite(ko, (0, base.height - ko.height))
    base.alpha_composite(hat, (ko.width + 1, base.height - hat.height))
    down = Pose(base, (base.width / 2, base.height))
    S = {
        'idle': [i0, i0, i1, i1, i0, breathe(i0), breathe(i0), i0],
        'run': [w0, lift(w0), w1, w1, lift(w1), w0],
        'air': [lift(P['alert'], 0), lean(P['alert'], -1)],
        'attack': [lean(w1, -2), P['cast'], P['cast'], i0],
        'hurt': [lean(P['hit'], -2), P['hit'], P['hit']],
        'down': [down, breathe(down, 0.4)],
        'held': [P['hit'], lean(P['hit'], 2), P['hit'], lean(P['hit'], -2)],
        'talk': [i0, P['cast'], i0, P['alert']],
    }
    M2 = {'idle': [P['worry'], P['worry'], breathe(P['worry']), breathe(P['worry'])], 'talk': [P['worry'], P['alert']]}
    M3 = {}
    return dict(cell=(56, 56), box=(14, 28), S=S, M2=M2, M3=M3, head=0.7)


ROUND3.update({
    'guard': guard,
    'king': king,
    'shopkeeper': shopkeeper,
    'villain': villain,
})

PERSON_STATES = ['idle', 'run', 'air', 'attack', 'hurt', 'down', 'held', 'talk', 'grab', 'carry', 'carryRun', 'throw']
MOOD_STATES = ['idle', 'run', 'air', 'attack', 'hurt', 'held', 'talk']


def rows(spec):
    """-> [(row name, [Pose])]: the normal states, then each mood's own rows.

    A mood state the person has no own pose for is the normal frames with
    the face edited: mood 2 a sweat drop, mood 3 a red face.
    """
    S = spec['S']
    out = [(s, S[s]) for s in PERSON_STATES if s in S]
    if spec.get('thing'):
        return out
    head = spec.get('head', 0.62)
    for m, own, edit in (('2', spec['M2'], sweat), ('3', spec['M3'], lambda p: flush(p, head))):
        for s in MOOD_STATES:
            if s not in S:
                continue
            fr = own.get(s) or [edit(p) for p in S[s]]
            out.append((s + m, fr))
    return out
