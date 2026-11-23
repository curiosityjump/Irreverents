"""The owner's rule (2026-11-23, docs/mechanisms/art-pipeline.md, "Approved Drive assets first"): every picture is
re-authored from an approved Drive source plate where one exists. This file cuts this lane's looks from those
plates with srcimport.grab() (crop, hard alpha, largest blob, snap to the master palette by material, majority
shrink, re-ink). Each function names its plate and box. DRAFT: boxes, sizes and materials are first passes.

Plates: P04 chibi-pixel-interactables ('interact'), P07 vibrant-platformer-interactables ('vibrant'),
P04 cantina-tavern-hub ('tavern'), P03 pixel-art-vfx-and-pickup-atlas ('vfx')."""
from PIL import Image

from px import INK, new, paste
from srcimport import grab, ramps

PARTS = ramps('stone', 'castle', 'gold', 'wood', 'metal', 'red', 'orange', 'blue', 'teal', 'night')


def fit(piece, w, h, align='bottom'):
    """Put a cut piece on a w x h canvas, bottom-centred (or centred)."""
    im = new(w, h)
    x = (w - piece.width) // 2
    y = h - piece.height if align == 'bottom' else (h - piece.height) // 2
    paste(im, piece, x, y)
    return im


# ---- the alarm bell on its post: P04 interactables, row 3 (idle, ringing) and row 4 (broken)
def bell():
    return fit(grab('interact', (1090, 595, 1250, 780), 0, PARTS, size=(16, 19)), 16, 32)


def bell_ringing():
    """4 frames: the P04 ringing post, alternated with the idle one shifted a pixel, so it swings."""
    ring = grab('interact', (1268, 585, 1440, 780), 0, PARTS, size=(17, 19))
    idle = grab('interact', (1090, 595, 1250, 780), 0, PARTS, size=(16, 19))
    frames = [fit(ring.crop((0, 0, 16, 19)), 16, 32), fit(idle, 16, 32), fit(ring.crop((1, 0, 17, 19)), 16, 32), fit(idle, 16, 32)]
    out = new(64, 32)
    for i, f in enumerate(frames):
        out.paste(f, (i * 16, 0))
    return out


def bell_broken():
    return fit(grab('interact', (98, 850, 240, 1015), 0, PARTS, size=(16, 18)), 16, 32)


# ---- floor plates: P04 interactables, row 1 (up; pressed and lit)
def plate(down):
    if down:
        return fit(grab('interact', (210, 235, 358, 322), 0, PARTS, size=(16, 7)), 16, 16)
    return fit(grab('interact', (28, 230, 172, 322), 0, PARTS, size=(16, 8)), 16, 16)


# ---- the gate: P04 interactables, row 1 (closed bars; open frame)
def gate(open_):
    if open_:
        # the raised gate's foot: the open frame's lintel and post tops, as the top tile under the lintel
        g = grab('interact', (1265, 175, 1432, 318), 0, PARTS, size=(16, 14))
        return fit(g.crop((0, 0, 16, 8)), 16, 16, align='top')
    # one tile of the closed gate, stacking: the bars from the middle of the closed gate
    g = grab('interact', (1072, 172, 1236, 318), 0, PARTS, size=(18, 24), edge=None)
    return g.crop((1, 5, 17, 21))


# ---- a doorway you go in by: P07 vibrant interactables, row 2 (a stone arch, its door swung open)
def door_enter(w, h):
    d = grab('vibrant', (212, 242, 388, 412), 0, PARTS + ramps('foliage', 'grass'), size=(16 * w + 2, 16 * h - 6))
    return fit(d, 16 * w, 16 * h)


# ---- the shop: P04 tavern counter panel; a bottle from the tavern's row 8
def shop_counter():
    return fit(grab('tavern', (98, 305, 178, 372), 0, ramps('wood', 'gold', 'earth'), size=(16, 14)), 16, 16)


def shop_goods():
    return fit(grab('tavern', (1208, 535, 1258, 602), 0, ramps('foliage', 'grass', 'metal', 'gold', 'wood'), size=(6, 8)), 8, 8)


# ---- what a broken wall leaves: P07 vibrant, row 4 (stones and dust, the dust left out by the materials)
def rubble():
    return fit(grab('vibrant', (1222, 650, 1395, 760), 0, ramps('stone', 'castle'), size=(16, 10)), 16, 16)


# ---- the quarry's one-tile hide: the same P07 rock heap; its fold is the heap's lower half
def hide_1x1():
    return fit(grab('vibrant', (1222, 650, 1395, 760), 0, ramps('stone', 'castle'), size=(16, 11)), 16, 16)


def hide_front_1x1():
    im = hide_1x1()
    out = new(16, 16)
    out.paste(im.crop((0, 10, 16, 16)), (0, 10))
    return out


# ---- the camp's horn: P07 vibrant, row 3 (a brass horn on a bracket, idle and blasting)
def horn_idle():
    return grab('vibrant', (318, 462, 445, 595), 0, ramps('gold', 'orange', 'wood', 'red'), size=(14, 14))


def horn_blast():
    return grab('vibrant', (448, 450, 605, 595), 0, ramps('gold', 'orange', 'wood', 'red'), size=(17, 15))


# ---- HUD faces: each one's own head, cut from its sprite's first idle frame (the heroes lane's canon sheet
# cut from P03/doc 36; the cast lane's regulars cut from P04's cantina NPCs), shrunk by majority to 16 x 16.
# DRAFT: 12 x 12 lost the eyes of all three heroes; 16 x 16 keeps them (the renderer reads the size).
import json
import os
from collections import Counter

from sizes import ROOT
from srcimport import reink

HEAD = {'grappler': (13, 14, 38, 34), 'infiltrator': (19, 22, 35, 38), 'flyer': (15, 19, 37, 37),
        'brawler': (16, 15, 37, 34), 'skirmisher': (16, 19, 38, 37)}


def _shrink(im, w, h):
    out = new(w, h)
    sw, sh = im.size
    for oy in range(h):
        for ox in range(w):
            cnt, e = Counter(), 0
            for y in range(oy * sh // h, max(oy * sh // h + 1, (oy + 1) * sh // h)):
                for x in range(ox * sw // w, max(ox * sw // w + 1, (ox + 1) * sw // w)):
                    p = im.getpixel((x, y))
                    if p[3]:
                        cnt[p] += 1
                    else:
                        e += 1
            if cnt and sum(cnt.values()) >= e:
                out.putpixel((ox, oy), cnt.most_common(1)[0][0])
    return out


def hud_face(who):
    spr = json.load(open(os.path.join(ROOT, 'content', 'sprites', who + '.json')))
    cw, ch = spr['cell']['w'], spr['cell']['h']
    sheet_im = Image.open(os.path.join(ROOT, 'assets', spr['image'])).convert('RGBA')
    f = spr['frames']['idle'][0]
    cols = sheet_im.width // cw
    fx, fy = (f % cols) * cw, (f // cols) * ch
    x0, y0, x1, y1 = HEAD[who]
    head = sheet_im.crop((fx + x0, fy + y0, fx + x1, fy + y1))
    for y in range(head.height):
        for x in range(head.width):
            if head.getpixel((x, y))[3] and head.getpixel((x, y))[3] < 255:
                head.putpixel((x, y), head.getpixel((x, y))[:3] + (255,))
    return reink(_shrink(head, 16, 16))


# ---- effects and icons from P05 brawl-hit-ko-respawn (a plate on an opaque pale ground: keyed out)
P05KEY = (247, 245, 243)
FXR = ramps('gold', 'orange', 'blue', 'sky', 'metal', 'red', 'purple')


def _strip(frames, w, h, align='center'):
    out = new(w * len(frames), h)
    for i, f in enumerate(frames):
        out.paste(fit(f, w, h, align), (i * w, 0))
    return out


def fx_dizzy():
    """P05 row 3: three dizzy-star frames (stars on a swirl), 24 x 12 each; the fourth repeats the second."""
    boxes = [(8, 268, 92, 340), (112, 262, 218, 340), (222, 266, 328, 342)]
    fr = [grab('brawl', b, 0, FXR, key=P05KEY, largest=False, size=(22, 12), edge=None, dark_ink=40) for b in boxes]
    return _strip(fr + [fr[1]], 24, 12)


def fx_speed():
    """P05 row 6: the blue swoosh streaks behind a flying body, 24 x 24 each (three frames)."""
    boxes = [(78, 436, 155, 488), (160, 430, 250, 490), (256, 425, 350, 492)]
    fr = [grab('brawl', b, 0, FXR, key=P05KEY, largest=False, size=(22, 12), edge=None, dark_ink=40) for b in boxes]
    return _strip(fr, 24, 24)


def hud_ko():
    return grab('brawl', (4, 356, 64, 414), 0, ramps('red', 'metal', 'pink', 'night'), key=P05KEY, size=(10, 10))


def hud_fall():
    return grab('brawl', (176, 356, 238, 414), 0, ramps('blue', 'metal', 'sky', 'night'), key=P05KEY, size=(10, 10))


# ---- alert pips: P07 irreverents-pixel-ui-atlas, the red '!' speech badge; off is the same cut, dimmed
def alert_pip(on):
    im = grab('ui', (1158, 915, 1245, 1005), 0, ramps('red', 'metal', 'gold', 'pink'), size=(10, 10))
    if on:
        return im
    from px import col, mix
    out = new(10, 10)
    for y in range(10):
        for x in range(10):
            c = im.getpixel((x, y))
            if c[3]:
                out.putpixel((x, y), c if c[:3] == INK[:3] else mix(c, col('night', 2), 0.65))
    return out
