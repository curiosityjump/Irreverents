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

def _poses(key, scale, table):
    out = {}
    for name, spec in table.items():
        rect = spec[0]
        kw = spec[1] if len(spec) > 1 else {}
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
