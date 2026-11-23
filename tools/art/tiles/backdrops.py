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
        rect(img, x, ttop, w, h - ttop, body)
        rect(img, x, ttop, 2, h - ttop, lit)
        rect(img, x + w - 4, ttop, 4, h - ttop, shade)
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
    wall, wall2 = mix(CR[1], ST[3], 0.45), mix(CR[1], ST[2], 0.55)
    frame = mix(WD[1], ST[1], 0.35)
    pane, pane2 = mix(C['blue'][2], ST[2], 0.45), mix(C['blue'][3], ST[3], 0.5)
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
