"""Round 2 backdrops: far silhouettes with depth, mid layers with a dark base, a dark foreground
strip, and lit interiors. Used by make.py.

DRAFT: stand-ins drawn by a program (notes: README.md). Flat colours only: no gradients, no blur.
Every outdoor layer is 320 px wide and wraps sideways (all x arithmetic is mod 320).
"""
import math

from PIL import Image

from common import C, CLEAR, T, mix, rgb, tile_hash

W = 320
INK = C['ink'][0]
F, FAR, ST, FO, G = C['foliage'], C['far'], C['stone'], C['foliage'], C['grass']
CA, NI, WD, GO, CR = C['castle'], C['night'], C['wood'], C['gold'], C['cream']
SKY = C['sky']


def canvas(h, fill=CLEAR):
    return Image.new('RGBA', (W, h), fill)


def px(img, x, y, c):
    if 0 <= y < img.height:
        img.putpixel((x % W, y), c)


def rect(img, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            px(img, xx, yy, c)


def disc(img, cx, cy, r, c):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.5:
                px(img, x, y, c)


def mask_discs(h, discs):
    m = set()
    for cx, cy, r in discs:
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if 0 <= y < h and (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.5:
                    m.add((x % W, y))
    return m


def paint_mask(img, m, body, lit=None, shade=None, rim=None):
    """A flat shape with a lit top-left rim and a shaded bottom-right, from its own outline."""
    for (x, y) in m:
        c = body
        if rim is not None and ((x, y - 1) not in m):
            c = rim
        elif lit is not None and ((x - 2) % W, y - 2) not in m:
            c = lit
        elif shade is not None and (((x + 2) % W, y + 2) not in m and y + 2 < img.height):
            c = shade
        px(img, x, y, c)


def hills(h, base, items):
    top = [base] * W
    for cx, hw, hh in items:
        for dx in range(-hw, hw + 1):
            y = base - int(round(hh * math.sqrt(max(0.0, 1 - (dx / hw) ** 2))))
            x = (cx + dx) % W
            top[x] = min(top[x], y)
    return top


def fill_below(img, top, c, rim=None):
    for x in range(W):
        for y in range(max(0, top[x]), img.height):
            px(img, x, y, rim if rim is not None and y == top[x] else c)


# ---------------------------------------------------------------- sky

def make_clouds():
    h = 72
    img = canvas(h)
    clouds = [
        (14, 30, [(8, 7), (20, 11), (34, 8), (44, 5)]),
        (96, 52, [(6, 5), (15, 8), (26, 6)]),
        (150, 22, [(7, 6), (18, 9), (30, 12), (46, 8), (57, 5)]),
        (232, 46, [(8, 6), (19, 9), (31, 6)]),
        (276, 18, [(5, 4), (13, 6), (22, 4)]),
        (60, 14, [(4, 3), (10, 5), (17, 3)]),
    ]
    white, shade, under = C['cloud'][1], C['cloud'][0], mix(C['cloud'][0], SKY[1], 0.45)
    for x0, base, puffs in clouds:
        m = mask_discs(h, [(x0 + dx, base - r + 2, r) for dx, r in puffs])
        m = {(x, y) for (x, y) in m if y <= base}
        for (x, y) in m:
            c = white
            if y >= base - 1:
                c = under
            elif ((x + 2) % W, y + 3) not in m:
                c = shade
            px(img, x, y, c)
    return img


# ---------------------------------------------------------------- far layers

def make_far_hills():
    """Courtyard, far: hills, an aqueduct on arches, ruined towers and a tree line, in far blue."""
    h = 112
    img = canvas(h)
    back, front = mix(FAR[0], C['blue'][2], 0.12), mix(FAR[0], FO[1], 0.25)
    line = mix(front, SKY[0], 0.3)
    # back hills
    fill_below(img, hills(h, 84, [(40, 80, 30), (160, 90, 40), (270, 70, 28)]), FAR[1])
    # ruined towers on the hills
    for x, top, w, broken in ((30, 26, 14, 1), (150, 14, 16, 0), (176, 34, 10, 1), (262, 30, 12, 0)):
        rect(img, x, top, w, 80 - top, back)
        for xx in range(x, x + w, 4):
            if not broken or xx % 8:
                rect(img, xx, top - 3, 2, 3, back)
        rect(img, x + w // 2 - 1, top + 8, 2, 5, FAR[1])
    # the aqueduct: a long deck on round arches
    deck = 46
    rect(img, 60, deck, 90, 6, back)
    rect(img, 196, deck + 4, 70, 5, back)
    for x0, x1, top in ((60, 150, deck + 6), (196, 266, deck + 9)):
        for ax in range(x0, x1, 15):
            for y in range(top, 90):
                for x in range(ax, ax + 15):
                    dx = x - ax - 7
                    inside = 3 <= x - ax <= 11 and (y >= top + 6 or dx * dx + (y - top - 6) ** 2 <= 16)
                    if not inside:
                        px(img, x, y, back)
    # a nearer range in front, then a tree line of round crowns
    fill_below(img, hills(h, 98, [(0, 70, 22), (110, 90, 26), (220, 80, 24), (300, 40, 14)]), front)
    crowns = []
    for i in range(0, W, 9):
        crowns.append((i + (tile_hash(i, 1, 7) % 5), 96 - (tile_hash(i, 2, 7) % 9), 6 + tile_hash(i, 3, 7) % 4))
    m = mask_discs(h, crowns)
    for (x, y) in m:
        px(img, x, y, line if ((x + 1) % W, y + 2) in m else front)
    rect(img, 0, 100, W, h - 100, line)
    return img


def make_far_castle():
    """Street, far: the castle on its hill above the town, clear silhouettes in far blue."""
    h = 128
    img = canvas(h)
    body, lit, deep = FAR[0], FAR[1], mix(FAR[0], SKY[0], 0.3)
    roof = mix(FAR[0], C['blue'][2], 0.35)
    fill_below(img, hills(h, 112, [(160, 150, 52), (20, 70, 24), (300, 70, 24)]), deep)
    rect(img, 100, 46, 120, 34, body)
    for xx in range(100, 220, 8):
        rect(img, xx, 42, 4, 4, body)

    def tower(x, top, w, bottom):
        rect(img, x, top, w, bottom - top, body)
        rect(img, x, top, 2, bottom - top, lit)
        for i in range(w // 2 + 3):
            half = (w + 4) * (i + 1) // (2 * (w // 2 + 3))
            cx = x + w // 2
            for xx in range(cx - half, cx + half):
                px(img, xx, top - (w // 2 + 3) + i, roof)
        rect(img, x + w // 2 - 1, top + 8, 2, 4, deep)
    tower(92, 34, 16, 80)
    tower(212, 34, 16, 80)
    tower(138, 18, 14, 60)
    tower(170, 24, 12, 60)
    tower(152, 6, 18, 60)
    rect(img, 154, 62, 12, 18, deep)
    disc(img, 160, 62, 6, deep)
    # trees on the castle hill
    crowns = [(x, 100 - (tile_hash(x, 0, 9) % 6), 6) for x in range(4, W, 11)]
    m = mask_discs(h, crowns)
    for (x, y) in m:
        px(img, x, y, mix(deep, SKY[0], 0.3))
    rect(img, 0, 104, W, h - 104, mix(deep, SKY[0], 0.3))
    return img


# ---------------------------------------------------------------- mid layers (a step more saturated, darker base)

def tree_row(img, h, base_y, items, ramp, trunk):
    """Round foliage trees: items (cx, cy, r)."""
    for cx, cy, r in items:
        rect(img, cx - 1, cy + r - 3, 3, base_y - (cy + r - 3), trunk)
    for cx, cy, r in items:
        m = mask_discs(h, [(cx, cy, r), (cx - r // 2 - 1, cy + r // 3, r * 2 // 3), (cx + r // 2 + 1, cy + r // 3, r * 2 // 3)])
        for (x, y) in m:
            c = ramp[1]
            if ((x - 2) % W, y - 2) not in m:
                c = ramp[3]
            elif ((x + 2) % W, y + 3) not in m or y > cy + r // 2:
                c = ramp[0]
            elif ((x - 3) % W, y - 4) not in m:
                c = ramp[2]
            px(img, x, y, c)


def make_castle_mid():
    """Courtyard, mid: an old wall with arches and broken battlements, trees, and a dark hedge
    along its foot so the layer has a dark bottom edge against the ground."""
    h = 120
    img = canvas(h)
    body, lit, shade, dark = ST[2], ST[3], ST[1], mix(ST[0], ST[1], 0.5)
    top = 64
    rect(img, 0, top, W, h - top, body)
    for i, xx in enumerate(range(0, W, 14)):
        if i % 9 in (4, 5):
            continue
        rect(img, xx + 2, top - 6, 8, 6, body)
        rect(img, xx + 2, top - 6, 8, 1, lit)
        rect(img, xx + 9, top - 5, 1, 5, shade)
    rect(img, 0, top, W, 1, lit)
    # block courses: flat lines, offset, no outline
    for row, yy in enumerate(range(top + 7, h, 7)):
        rect(img, 0, yy, W, 1, shade)
        for xx in range((row % 2) * 9, W, 18):
            rect(img, xx, yy - 6, 1, 6, shade)
    # two towers
    for x, ttop, w in ((30, 16, 36), (214, 24, 30)):
        # round 3: a round tower, lit on its left third and shaded on its right third, with courses
        lit_w, sh_w = w * 3 // 10, w * 3 // 10
        rect(img, x, ttop, w, h - ttop, body)
        rect(img, x, ttop, lit_w, h - ttop, mix(ST[2], ST[3], 0.55))
        rect(img, x, ttop, 1, h - ttop, lit)
        rect(img, x + w - sh_w, ttop, sh_w, h - ttop, shade)
        rect(img, x + w - 2, ttop, 2, h - ttop, dark)
        for row, yy in enumerate(range(ttop + 6, h, 6)):
            rect(img, x, yy, w, 1, mix(body, shade, 0.6))
            rect(img, x + w - sh_w, yy, sh_w, 1, dark)
            for xx in range(x + 3 + (row % 2) * 5, x + w - 2, 10):
                rect(img, xx, yy - 5, 1, 5, mix(body, shade, 0.6))
        for xx in range(x, x + w - 3, 8):
            rect(img, xx, ttop - 5, 5, 5, body)
            rect(img, xx, ttop - 5, 5, 1, lit)
        rect(img, x + w // 2 - 2, ttop + 10, 4, 10, dark)
        disc(img, x + w // 2 - 1, ttop + 10, 2, dark)
    # arches through the wall: the sky shows through
    for ax in (100, 150, 284):
        for yy in range(66, h):
            for xx in range(ax, ax + 24):
                dx = xx - ax - 11.5
                if yy >= 78 or dx * dx + (yy - 78) ** 2 <= 12.2 ** 2:
                    px(img, xx, yy, CLEAR)
                elif (yy < 78 and dx * dx + (yy - 78) ** 2 <= 14.2 ** 2) or (xx - ax) in (-1, 24):
                    px(img, xx, yy, shade)
    # ivy on the wall
    for vx in (70, 132, 196, 262):
        for i in range(18):
            px(img, vx + (i // 3) % 2, top + 2 + i, FO[1] if i % 3 else FO[2])
            if i % 4 == 1:
                px(img, vx - 1, top + 2 + i, FO[2])
    ramp = [FO[0], FO[1], FO[2], FO[3]]
    tree_row(img, h, h, [(14, 68, 16), (176, 74, 15), (300, 70, 17), (80, 86, 12), (246, 88, 11)], ramp, WD[1])
    # the dark hedge along the foot
    crowns = [(x + tile_hash(x, 5, 4) % 4, 108 - tile_hash(x, 6, 4) % 4, 6) for x in range(0, W, 10)]
    m = mask_discs(h, crowns)
    for (x, y) in m:
        c = FO[2] if ((x - 2) % W, y - 2) not in m else FO[1] if ((x - 1) % W, y - 4) not in m else FO[0]
        px(img, x, y, c)
    rect(img, 0, 112, W, h - 112, FO[0])
    return img


def make_town_mid():
    """Street, mid: houses behind the street, in plaster and coloured roofs a step greyer than the
    street, with a dark fence and hedge at their foot."""
    h = 124
    img = canvas(h)
    # round 3: hazed toward the far blue, so the houses read as a plane behind the street
    wall, wall2 = mix(mix(CR[1], ST[3], 0.45), FAR[2], 0.4), mix(mix(CR[1], ST[2], 0.55), FAR[1], 0.4)
    frame = mix(mix(WD[1], ST[1], 0.35), FAR[0], 0.35)
    pane, pane2 = mix(C['blue'][2], FAR[0], 0.5), mix(C['blue'][3], FAR[2], 0.5)
    roofs = [(C['red'][2], C['red'][1]), (C['blue'][2], C['blue'][1]), (C['orange'][1], C['red'][0]), (C['teal'][1], C['teal'][0])]
    roofs = [(mix(a, ST[2], 0.3), mix(b, ST[1], 0.3)) for a, b in roofs]
    houses = [(0, 44, 64, 20, 0, 2), (44, 36, 48, 16, 1, 3), (80, 52, 72, 22, 2, 2), (132, 34, 42, 15, 3, 3),
              (166, 48, 62, 20, 1, 2), (214, 40, 52, 18, 0, 3), (254, 66, 68, 24, 2, 2)]
    for x, w, top, rh, ci, rows in houses:
        rect(img, x, top, w, h - top, wall)
        rect(img, x + w - 4, top, 4, h - top, wall2)
        rect(img, x, top, 2, h - top, frame)
        rect(img, x, top + 15, w, 2, frame)
        lightc, darkc = roofs[ci]
        for i in range(rh):
            half = (w // 2 + 3) * (i + 1) // rh
            cx = x + w // 2
            for xx in range(cx - half, cx + half):
                c = darkc if xx >= cx else lightc
                if (top - rh + i) % 4 == 3:
                    c = darkc
                px(img, xx, top - rh + i, c)
        rect(img, x - 3, top - 1, w + 6, 2, darkc)
        rect(img, x + w // 2 + w // 5, top - rh + 2, 5, rh // 2, wall2)
        for r in range(rows):
            wy = top + 5 + r * 20
            for wx in range(x + 7, x + w - 9, 14):
                rect(img, wx, wy, 7, 8, pane)
                rect(img, wx, wy, 3, 3, pane2)
                rect(img, wx - 1, wy + 8, 9, 1, frame)
    # dark foot: a hedge and a fence, so the layer stands on the street with weight
    crowns = [(x + tile_hash(x, 8, 4) % 5, 110 - tile_hash(x, 9, 4) % 3, 6) for x in range(0, W, 12)]
    m = mask_discs(h, crowns)
    for (x, y) in m:
        px(img, x, y, FO[1] if ((x - 2) % W, y - 2) not in m else FO[0])
    for x in range(0, W, 6):
        rect(img, x, 104, 2, h - 104, mix(WD[1], INK, 0.2))
    rect(img, 0, 107, W, 2, mix(WD[1], INK, 0.2))
    rect(img, 0, 114, W, h - 114, mix(FO[0], INK, 0.35))
    return img


# ---------------------------------------------------------------- the foreground strip

def make_front_foliage():
    """320 x 24, in front of everything, below the floor line: dark bushes and hanging vines.
    It may have a dark outline (the contract's one exception for a front layer)."""
    h = 24
    img = canvas(h)
    edge = mix(FO[0], INK, 0.55)
    body, lit, hi = mix(FO[0], INK, 0.15), FO[0], FO[1]
    bushes = []
    x = 0
    i = 0
    while x < W:
        w = 26 + tile_hash(i, 0, 21) % 30
        if tile_hash(i, 1, 21) % 2 == 0:  # gaps let the ground show through
            for j in range(0, w, 8):
                bushes.append((x + j + 4, 11 + tile_hash(i, j, 22) % 5, 5 + tile_hash(i, j, 23) % 3))
        x += w
        i += 1
    m = mask_discs(h + 8, bushes)
    m = {(x, y) for (x, y) in m if y < h}
    for (x, y) in m:
        y_up = ((x, y - 1) not in m)
        c = body
        if y_up or ((x - 1) % W, y) not in m or ((x + 1) % W, y) not in m:
            c = edge
        elif ((x - 2) % W, y - 2) not in m:
            c = hi if y < 12 else lit
        elif ((x - 1) % W, y - 3) not in m:
            c = lit
        px(img, x, y, c)
    # leaf notches
    for (x, y) in list(m):
        if tile_hash(x, y, 24) % 23 == 0 and y > 4:
            px(img, x, y, edge)
            px(img, x + 1, y, hi)
    return img


# ---------------------------------------------------------------- interiors

def make_castle_hall(theme):
    """Indoors, royal: a calm, darker back wall in flat bands (darkest at the top), tall stained-
    glass windows with bright flat shafts of light, and muted pillars. Opaque, 320 x 352."""
    h = 352
    body = theme.wall_body
    top_band = mix(body, NI[1], 0.55)
    mid_band = mix(body, NI[1], 0.25)
    line = mix(body, NI[1], 0.4)
    img = canvas(h, body)
    for y in range(h):
        c = top_band if y < 40 else mid_band if y < 96 else body
        for x in range(W):
            img.putpixel((x, y), c)
    # faint block joints, no bevel
    for row, yy in enumerate(range(7, h, 8)):
        for x in range(W):
            img.putpixel((x, yy), mix(img.getpixel((x, yy)), line, 0.6))
        for xx in range((row % 2) * 12, W, 24):
            for y in range(yy - 7, yy):
                img.putpixel((xx % W, y), mix(img.getpixel((xx % W, y)), line, 0.6))
    shaft = mix(body, CR[2], 0.16)
    shaft2 = mix(body, GO[3], 0.26)
    pil, pil_lit, pil_sh = mix(CA[0], ST[1], 0.4), mix(CA[1], ST[1], 0.5), mix(CA[0], NI[1], 0.4)
    panes = [mix(C['blue'][1], CA[1], 0.25), mix(C['teal'][1], CA[1], 0.25), mix(GO[1], CA[2], 0.2), mix(C['red'][1], CA[1], 0.25)]
    for base in (0, 160):
        wx, ww, wtop, wbot = base + 92, 30, 52, 148
        # light falling from the window: two flat bands, the inner one brighter
        for y in range(wbot, h):
            off = (y - wbot) // 3
            for x in range(wx + off - 2, wx + off + ww + 2):
                cur = img.getpixel((x % W, y))
                inner = wx + off + 4 <= x < wx + off + ww - 4
                img.putpixel((x % W, y), shaft2 if inner and y < wbot + 90 else shaft if y < wbot + 150 else cur)
        # window: round-headed frame, stained panes
        for y in range(wtop, wbot):
            for x in range(wx - 4, wx + ww + 4):
                dx = x - (wx + ww / 2 - 0.5)
                ry = y - wtop - 16
                frame = y >= wtop + 16 or dx * dx + ry * ry <= 19.2 ** 2
                glass = wx <= x < wx + ww and y < wbot - 4 and (y >= wtop + 16 or dx * dx + ry * ry <= 15.2 ** 2)
                if glass:
                    gx, gy = (x - wx) // 6, (y - wtop) // 10
                    c = panes[0] if gx in (0, 4) else panes[1] if gy % 3 else panes[2]
                    if gy == 1 and gx == 2:
                        c = panes[3]
                    if (x - wx) % 6 == 5 or (y - wtop) % 10 == 9:
                        c = INK
                    elif (x - wx) % 6 == 0 and (y - wtop) % 10 < 3:
                        c = mix(c, C['metal'][3], 0.45)
                    img.putpixel((x % W, y), c)
                elif frame:
                    img.putpixel((x % W, y), pil_lit if x < wx else pil)
        rect(img, wx - 6, wbot, ww + 12, 4, pil_lit)
        rect(img, wx - 6, wbot + 3, ww + 12, 1, pil_sh)
        # a pillar between windows
        px0 = base + 22
        rect(img, px0, 0, 18, h, pil)
        rect(img, px0, 0, 3, h, pil_lit)
        rect(img, px0 + 14, 0, 4, h, pil_sh)
        for yy in (30, 200, 334):
            rect(img, px0 - 4, yy, 26, 6, pil_lit)
            rect(img, px0 - 4, yy + 5, 26, 1, pil_sh)
    return img


def make_cellar_vault(theme):
    """Indoors, cellar: near-black wall, vaults with lit ribs between squat piers, and a few lit
    niches (a candle's warm light in a recess) to break the void. Opaque, 320 x 352."""
    h = 352
    body = theme.wall_body
    img = canvas(h, body)
    deep = mix(NI[0], INK, 0.3)
    rib, rib_lit = NI[2], NI[3]
    pier, pier_lit, pier_sh = mix(NI[1], NI[2], 0.3), mix(NI[2], NI[3], 0.3), NI[0]
    line = mix(NI[0], NI[1], 0.4)
    for row, yy in enumerate(range(9, h, 10)):
        rect(img, 0, yy, W, 1, line)
        for xx in range((row % 2) * 10, W, 20):
            rect(img, xx, yy - 9, 1, 9, line)
    for base in range(0, W, 80):
        cx = base + 40
        # the vault's dark, its ribs
        for y in range(40, 220):
            for x in range(base + 12, base + 68):
                dx = x - cx + 0.5
                r2 = dx * dx + (y - 84) ** 2
                if y >= 84 or r2 <= 28 ** 2:
                    px(img, x, y, deep)
                if y < 84 and 28 ** 2 < r2 <= 31 ** 2:
                    px(img, x, y, rib_lit if dx < 0 else rib)
        rect(img, base + 12, 84, 3, 136, rib)
        rect(img, base + 65, 84, 3, 136, rib)
        rect(img, base + 12, 84, 1, 136, rib_lit)
        # piers
        rect(img, base, 40, 12, h - 40, pier)
        rect(img, base, 40, 2, h - 40, pier_lit)
        rect(img, base + 10, 40, 2, h - 40, pier_sh)
        for yy in (40, 220):
            rect(img, base - 2, yy, 16, 4, pier_lit)
            rect(img, base - 2, yy + 3, 16, 1, pier_sh)
    # lit niches, evenly spaced (decoration never marks anything)
    for nx in (28, 188):
        ny = 120
        glow, flame, warm = mix(GO[0], NI[2], 0.5), GO[2], mix(C['orange'][1], NI[2], 0.4)
        for y in range(ny - 14, ny + 14):
            for x in range(nx, nx + 24):
                dx = x - nx - 11.5
                if y >= ny or dx * dx + (y - ny) ** 2 <= 12 ** 2:
                    px(img, x, y, warm if abs(dx) < 8 and y > ny - 8 else glow)
        rect(img, nx - 2, ny + 14, 28, 3, rib_lit)
        rect(img, nx + 10, ny + 4, 4, 9, C['cream'][2])
        rect(img, nx + 11, ny, 2, 4, flame)
        px(img, nx + 11, ny - 1, GO[3])
    return img


# ---------------------------------------------------------------- round 3: the tall sky, the quarry

EA, SKYC = C['earth'], C['sky']


def make_sky_tall():
    """Round 3: the sky as one picture, 320 x 264, pinned to the screen's top: a multi-step
    gradient whose steps meet in a 2-row checker dither (no flat bands with hard edges), with two
    rows of small far clouds low down. Opaque, so the backdrop's 8 flat bands never show."""
    h = 264
    img = canvas(h, SKYC[0])
    # DRAFT: six master sky shades from the top down; between each pair, a 4x4 ordered dither whose
    # share of the lower shade grows row by row, so no row is one flat colour and no band edge shows.
    stops = [(0, SKYC[0]), (60, mix(SKYC[0], SKYC[1], 0.5)), (120, SKYC[1]), (176, mix(SKYC[1], SKYC[2], 0.5)),
             (224, SKYC[2]), (264, mix(SKYC[2], SKYC[3], 0.6))]
    # every row holds all 16 thresholds (the 4x4 Bayer order, run along the row and shifted per row)
    perm = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
    for (y0, c0), (y1, c1) in zip(stops, stops[1:]):
        for y in range(y0, y1):
            t = (y - y0 + 0.5) / (y1 - y0)
            for x in range(W):
                img.putpixel((x, y), c1 if perm[(x + 6 * y) % 16] < t * 16 else c0)
    # far clouds: low, flat, pale, two rows (they are far: no shade side)
    pale, base = mix(C['cloud'][0], SKYC[2], 0.35), mix(C['cloud'][1], SKYC[3], 0.5)
    for row, (y, n, seed) in enumerate(((176, 7, 3), (214, 9, 5))):
        for i in range(n):
            cx = (i * (W // n) + tile_hash(i, row, seed) % 30) % W
            w = 18 + tile_hash(i, row, seed + 1) % 22
            for k in range(3):
                dx = (k - 1) * w // 3
                r = 4 + (tile_hash(i, k, seed + 2) % 4) + (2 if k == 1 else 0)
                for yy in range(y - r, y + 1):
                    for xx in range(cx + dx - r - 3, cx + dx + r + 4):
                        if ((xx - cx - dx) / (r + 3)) ** 2 + ((yy - y) / r) ** 2 <= 1:
                            px(img, xx, yy, base if yy < y - 1 else pale)
    return img


def make_far_cliffs():
    """Quarry, far: pale cut cliffs in layered strata, terraces stepped into them, dust haze at the
    foot. Lighter and greyer than anything near; no outline. 320 x 128."""
    h = 128
    img = canvas(h)
    back = mix(FAR[1], EA[2], 0.42)
    face = mix(FAR[2], EA[3], 0.55)
    strata = mix(FAR[1], EA[2], 0.55)
    shadow = mix(FAR[0], EA[1], 0.4)
    haze = mix(FAR[2], C['cream'][2], 0.4)
    # the back range
    fill_below(img, hills(h, 96, [(30, 60, 30), (130, 70, 40), (240, 80, 34)]), mix(FAR[1], EA[2], 0.25))
    # cut cliffs: flat-topped mesas with stepped terraces (a quarry's cut faces)
    for x0, w, top in ((0, 70, 66), (96, 90, 52), (206, 74, 70), (290, 50, 60)):
        for x in range(x0, x0 + w):
            # the face steps in at two terraces
            for y in range(top, h):
                step = 0 if y < top + 22 else 4 if y < top + 44 else 8
                if x0 + step <= x < x0 + w - step // 2:
                    lit = x < x0 + step + 3
                    c = face if lit else back
                    if (y - top) % 22 in (0, 1):
                        c = face
                    elif (y - top) % 7 == 3 and not lit:
                        c = strata
                    elif x >= x0 + w - step // 2 - 4:
                        c = shadow
                    px(img, x, y, c)
    # haze at the foot
    for y in range(112, h):
        for x in range(W):
            if y >= 120 or (x + y) % 2 == 0:
                px(img, x, y, haze)
    return img


def make_quarry_mid():
    """Quarry, middle: scaffolds and a crane against the cliffs, in muted wood, with a dusty spoil
    heap at the foot. Muted (no dark outline), 320 x 120."""
    h = 120
    img = canvas(h)
    wood = mix(WD[1], FAR[1], 0.45)
    wood_l = mix(WD[2], FAR[2], 0.45)
    rope = mix(WD[0], FAR[0], 0.45)
    heap, heap_l = mix(EA[1], FAR[1], 0.5), mix(EA[2], FAR[2], 0.5)
    # spoil heaps along the foot
    fill_below(img, hills(h, 120, [(40, 50, 26), (150, 40, 18), (250, 60, 30)]), heap)
    for x in range(W):
        for y in range(h):
            if img.getpixel((x, y))[3] and not img.getpixel((x, max(0, y - 3)))[3]:
                px(img, x, y, heap_l)
    # scaffolds: posts, cross braces and plank decks
    for x0, w, top in ((12, 48, 70), (204, 48, 62)):
        for px0 in range(x0, x0 + w + 1, 16):
            rect(img, px0, top, 3, h - top, wood)
            rect(img, px0, top, 1, h - top, wood_l)
        for dy in range(top, h - 10, 22):
            rect(img, x0 - 2, dy, w + 7, 3, wood_l)
            rect(img, x0 - 2, dy + 3, w + 7, 1, wood)
            for i in range(16):
                for px0 in range(x0, x0 + w, 16):
                    px(img, px0 + 2 + i, dy + 4 + i, wood)
    # a crane: mast, jib, rope and a hanging stone
    mx, my = 128, 36
    rect(img, mx, my, 4, h - my, wood)
    rect(img, mx, my, 1, h - my, wood_l)
    rect(img, mx - 30, my, 70, 3, wood_l)
    for i in range(16):
        px(img, mx + 4 + i, my + 3 + i, wood)
        px(img, mx - 1 - i, my + 3 + i, wood)
    rect(img, mx + 34, my + 3, 1, 30, rope)
    rect(img, mx + 30, my + 33, 9, 7, mix(ST[1], FAR[1], 0.4))
    rect(img, mx + 30, my + 33, 9, 1, mix(ST[2], FAR[2], 0.4))
    return img


def make_cave_wall():
    """Quarry cave: the dark rock back wall, irregular lumps a step lighter than the gaps, timber
    props every 160 px. Opaque, 320 x 352, dimmer and flatter than the ground."""
    h = 352
    body = mix(EA[0], NI[1], 0.55)
    gap = mix(EA[0], INK, 0.55)
    lump = mix(EA[0], NI[2], 0.45)
    lump_l = mix(EA[1], NI[2], 0.45)
    img = canvas(h, gap)
    # rock lumps on a rough grid, offset per row
    for row, y0 in enumerate(range(-6, h, 18)):
        for i, x0 in enumerate(range((row % 2) * 13, W + 26, 26)):
            r = 9 + tile_hash(i, row, 41) % 4
            cx, cy = x0 + tile_hash(i, row, 42) % 5, y0 + 9
            for y in range(cy - r, cy + r):
                for x in range(cx - r - 2, cx + r + 2):
                    if ((x - cx) / (r + 2)) ** 2 + ((y - cy) / r) ** 2 <= 1:
                        lit = ((x - cx + 3) / (r + 2)) ** 2 + ((y - cy + 3) / r) ** 2 > 1
                        px(img, x, y, lump_l if lit else lump)
    # timber props: posts and a cap beam, evenly every 160 px (they mark nothing)
    tw, tw_l, tw_s = mix(WD[0], NI[1], 0.35), mix(WD[1], NI[2], 0.35), mix(WD[0], INK, 0.5)
    for x0 in (60, 220):
        for dx in (0, 46):
            rect(img, x0 + dx, 0, 7, h, tw)
            rect(img, x0 + dx, 0, 2, h, tw_l)
            rect(img, x0 + dx + 6, 0, 1, h, tw_s)
        for yy in (70, 230):
            rect(img, x0 - 4, yy, 61, 7, tw_l)
            rect(img, x0 - 4, yy + 6, 61, 2, tw_s)
    return img


def make_tower_wall():
    """Quarry tower: a warm cut-stone wall in dim earth tones, tall slit windows with the sky
    showing, every 160 px. Opaque, 320 x 352, dimmer than the ground."""
    h = 352
    body = mix(EA[1], NI[1], 0.55)
    line = mix(EA[0], NI[1], 0.55)
    light = mix(EA[2], NI[2], 0.55)
    img = canvas(h, body)
    for row, yy in enumerate(range(9, h, 10)):
        rect(img, 0, yy, W, 1, line)
        rect(img, 0, yy - 9, W, 1, light)
        for xx in range((row % 2) * 12, W, 24):
            rect(img, xx, yy - 9, 1, 9, line)
    sky1, sky2 = mix(SKYC[1], body, 0.25), mix(SKYC[2], body, 0.2)
    for x0 in (52, 212):
        for wy in (40, 200):
            for y in range(wy, wy + 64):
                for x in range(x0, x0 + 14):
                    dx = x - x0 - 6.5
                    if y >= wy + 7 or dx * dx + (y - wy - 7) ** 2 <= 49:
                        px(img, x, y, sky2 if y > wy + 40 else sky1)
            rect(img, x0 - 3, wy + 64, 20, 3, light)
            rect(img, x0 - 3, wy + 67, 20, 1, line)
            # light falling from it, one flat step
            for y in range(wy + 68, wy + 140):
                off = (y - wy - 68) // 4
                for x in range(x0 + off, x0 + off + 14):
                    c = img.getpixel((x % W, y))
                    if c[:3] == body[:3]:
                        px(img, x, y, mix(body, C['cream'][2], 0.12))
    return img


def make_cave_strip():
    """Round 3: the cave's back wall as a 128 px strip, pinned to an outdoor room's bottom, so a
    cellar or crawl under its floor shows rock instead of sky (the depot's cellar, the ridge's
    pocket). Opaque."""
    return make_cave_wall().crop((0, 0, W, 128))


# ---------------------------------------------------------------- round 3: what hangs above a short room, and the cantina's wall

def _dim(img, toward, t):
    out = img.copy()
    for y in range(out.height):
        for x in range(out.width):
            c = out.getpixel((x, y))
            if c[3]:
                out.putpixel((x, y), mix(c, toward, t))
    return out


def _tile_row(img, tile, y, step=16, x0=0):
    for x in range(x0, W, step):
        img.paste(tile, (x, y), tile)


def make_cantina_wall():
    """The cantina's back wall, 320 x 192, pinned to the room's top: dark planks above, wood
    wainscot to waist height (its top rail under the plate's trim) down to the floor line (y 160),
    a post every 160 px. From the P04 plate's plank cells, dimmed toward night so it sits behind
    the floor. Opaque."""
    import plates as PL
    h = 192
    img = canvas(h, mix(WD[0], NI[1], 0.5))
    dark = _dim(PL.grid_cell('tavern', 5, 0, PL.tavern_map), NI[1], 0.45)
    dark2 = _dim(PL.grid_cell('tavern', 0, 0, PL.tavern_map), NI[1], 0.55)
    wains = _dim(PL.grid_cell('tavern', 0, 1, PL.tavern_map), NI[1], 0.3)
    wains2 = _dim(PL.grid_cell('tavern', 1, 1, PL.tavern_map), NI[1], 0.3)
    post = _dim(PL.grid_cell('tavern', 15, 1, PL.tavern_map), NI[1], 0.25)
    # dark planks: courses 8 px tall, long boards with staggered joints, in the plate's tones dimmed
    b_hi, b_body, b_sh = mix(WD[2], NI[1], 0.5), mix(WD[1], NI[1], 0.5), mix(WD[0], NI[1], 0.45)
    for row, y in enumerate(range(0, 126, 8)):
        rect(img, 0, y, W, 8, b_body)
        rect(img, 0, y, W, 1, b_hi)
        rect(img, 0, y + 7, W, 1, b_sh)
        for j in range(0, W, 64):
            jx = (j + row * 24 + tile_hash(row, j, 52) % 9) % W
            rect(img, jx, y, 1, 8, mix(WD[0], INK, 0.4))
            px(img, jx + 2, y + 3, b_sh)
        for j in range(4):
            gx = tile_hash(row, j, 53) % W
            rect(img, gx, y + 3, 5, 1, b_sh)
    for i, x in enumerate(range(0, W, 16)):
        for y in (128, 144):
            t = wains if (i + y // 16) % 2 else wains2
            img.paste(t, (x, y), t)
    # the rail along the wainscot's top, lit
    rect(img, 0, 126, W, 2, mix(WD[3], NI[2], 0.3))
    rect(img, 0, 128, W, 1, mix(WD[0], INK, 0.3))
    p_body, p_lit, p_sh = mix(WD[1], NI[1], 0.35), mix(WD[2], NI[1], 0.35), mix(WD[0], INK, 0.4)
    for x0 in (72, 232):
        rect(img, x0, 0, 10, 160, p_body)
        rect(img, x0, 0, 2, 160, p_lit)
        rect(img, x0 + 9, 0, 1, 160, p_sh)
        rect(img, x0 - 3, 120, 16, 6, p_lit)
        rect(img, x0 - 3, 125, 16, 1, p_sh)
    rect(img, 0, 160, W, 32, mix(CA[0], INK, 0.4))
    return img


def make_cantina_roof():
    """Above the cantina's top row, for a view taller than the room: the dark underside of the roof,
    common rafters sloping up to a ridge beam, purlins across. 320 x 80, opaque, pinned above the room."""
    h = 80
    img = canvas(h, mix(NI[0], INK, 0.3))
    beam, beam_l, beam_s = mix(WD[0], NI[1], 0.4), mix(WD[1], NI[2], 0.4), mix(WD[0], INK, 0.5)
    for x0 in range(0, W, 64):
        for i in range(h):
            for dx in range(4):
                px(img, x0 + i // 2 + dx, h - 1 - i, beam if dx else beam_l)
                px(img, x0 + 64 - i // 2 - dx, h - 1 - i, beam if dx else beam_l)
    for y in (22, 60):
        rect(img, 0, y, W, 5, beam)
        rect(img, 0, y, W, 1, beam_l)
        rect(img, 0, y + 5, W, 1, beam_s)
    return img


def make_hall_vault():
    """Above the hall gallery's top row: stone vaults springing from the wall, lilac and dim, so a
    tall view shows a ceiling rather than solid block. 320 x 80, opaque, pinned above the room."""
    h = 80
    body = mix(CA[0], NI[1], 0.5)
    rib, rib_l = mix(CA[1], NI[2], 0.3), mix(CA[2], NI[2], 0.3)
    deep = mix(CA[0], INK, 0.55)
    img = canvas(h, body)
    for x0 in range(0, W, 80):
        cx = x0 + 40
        for y in range(h):
            for x in range(x0, x0 + 80):
                dx = x - cx + 0.5
                r2 = dx * dx + (y - h) ** 2 * 1.6
                if r2 <= 34 ** 2:
                    px(img, x, y, deep)
                elif r2 <= 38 ** 2:
                    px(img, x, y, rib_l if dx < 0 else rib)
        rect(img, x0, 0, 6, h, rib)
        rect(img, x0, 0, 2, h, rib_l)
    rect(img, 0, h - 3, W, 3, rib)
    return img


def make_tree_crowns():
    """Above the courtyard's leaf canopy: the crowns the canopy hangs from. Round masses in the
    foliage ramp, each lit top-left with a highlight and shaded under, overlapping back to front;
    sky between them at the top. 320 x 112, pinned above the room."""
    h = 112
    img = canvas(h)
    edge = mix(F[0], INK, 0.45)
    discs = []
    for i in range(0, W, 26):
        r = 17 + tile_hash(i, 0, 61) % 9
        discs.append((i + tile_hash(i, 1, 61) % 9, 28 + r // 2 + tile_hash(i, 2, 61) % 12, r))
    for i in range(13, W, 30):
        discs.append((i, 74 + tile_hash(i, 3, 61) % 10, 20 + tile_hash(i, 4, 61) % 6))
    discs.sort(key=lambda d: d[1])

    def circle(cx, cy, r, c):
        for y in range(cy - r - 1, cy + r + 2):
            for x in range(cx - r - 1, cx + r + 2):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.5:
                    px(img, x, y, c)
    # the dark mass behind the crowns, so no sky shows between the two rows of them
    for x in range(W):
        top = 54 + (tile_hash(x // 6, 0, 65) % 7)
        for y in range(top, h):
            px(img, x, y, edge if y == top else F[0])
    for n, (cx, cy, r) in enumerate(discs):
        # a crown is a cluster of leafy lumps: outline pass, shade, body, lit, so it reads as one mass
        lumps = [(cx, cy, r * 6 // 10)]
        for k in range(8):
            ang = k * 0.785 + (tile_hash(n, k, 63) % 40) / 100
            d = r * 55 // 100
            lumps.append((cx + int(d * math.cos(ang)), cy + int(d * 0.8 * math.sin(ang)), r * 4 // 10 + tile_hash(n, k, 64) % 3))
        for lx, ly, lr in lumps:
            circle(lx, ly, lr + 1, edge)
        for lx, ly, lr in lumps:
            circle(lx, ly, lr, F[0])
        for lx, ly, lr in lumps:
            circle(lx - 1, ly - 2, lr - 2, F[1])
        for lx, ly, lr in lumps:
            if ly <= cy + 2:
                circle(lx - lr // 3, ly - lr // 3, lr // 2, F[2])
                px(img, lx - lr // 2, ly - lr // 2, F[3])
                px(img, lx - lr // 2 + 1, ly - lr // 2, F[3])
    for y in range(h - 8, h):
        for x in range(W):
            px(img, x, y, F[0] if y < h - 4 or (x + y) % 2 else edge)
    return img


def make_street_upper():
    """Above the castle street's eave: the upper storeys of the houses over the street, plaster
    between timbers with small windows, under tile roofs against the sky. 320 x 104, pinned above
    the room; the eave (the room's top row) hangs from it."""
    h = 104
    img = canvas(h)
    RD, BL = C['red'], C['blue']
    pl, pl_s, tm, tm_l = mix(CR[2], FAR[2], 0.15), mix(CR[1], FAR[1], 0.2), mix(WD[1], FAR[0], 0.15), mix(WD[2], FAR[1], 0.15)
    houses = [(0, 64, 30, RD), (64, 58, 18, BL), (122, 70, 26, RD), (192, 52, 12, RD), (244, 76, 22, BL)]
    for x0, w, top, R in houses:
        roof_h = 24
        # roof: a steep gable, shingle courses
        for y in range(top, top + roof_h):
            inset = (top + roof_h - y) * w // (2 * roof_h)
            for x in range(x0 + inset - 2 + 2 * ((top + roof_h - y) == roof_h), x0 + w - inset + 2):
                course = (y - top) % 5
                c = R[2] if course < 3 else R[1]
                if (x + (y - top) // 5 * 4) % 8 == 0 and course < 4:
                    c = R[0]
                if y == top or x in (x0 + inset - 2, x0 + w - inset + 1):
                    c = mix(R[0], INK, 0.35)
                px(img, x, y, c)
        # storey: plaster, timbers, windows
        y0 = top + roof_h
        rect(img, x0, y0, w, h - y0, pl)
        rect(img, x0, y0, w, 2, pl_s)
        for tx in range(x0, x0 + w, 16):
            rect(img, tx, y0, 2, h - y0, tm)
            rect(img, tx, y0, 1, h - y0, tm_l)
        rect(img, x0, y0 + 26, w, 3, tm)
        for wx in range(x0 + 6, x0 + w - 8, 16):
            for wy in (y0 + 8,):
                rect(img, wx, wy, 7, 10, mix(BL[0], NI[1], 0.3))
                rect(img, wx, wy, 7, 1, tm)
                rect(img, wx + 3, wy, 1, 10, tm)
                rect(img, wx, wy + 5, 7, 1, tm)
                rect(img, wx - 1, wy + 10, 9, 2, tm_l)
                px(img, wx + 1, wy + 2, mix(BL[3], CR[2], 0.4))
        # a chimney
        cx = x0 + w - 16
        rect(img, cx, top - 8, 6, roof_h // 2 + 8, mix(C['earth'][1], FAR[0], 0.2))
        rect(img, cx - 1, top - 9, 8, 2, mix(C['earth'][0], INK, 0.2))
    return img
