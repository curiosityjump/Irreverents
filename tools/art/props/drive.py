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
        'brawler': (16, 15, 37, 34), 'skirmisher': (16, 19, 38, 37),
        # DRAFT: the hidden recruit's head-cloth and face (her idle frame; 20 x 16 keeps both eyes at 16 x 16)
        'hauler': (15, 24, 35, 40)}


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


# ---- P03 pixel-art-vfx-and-pickup-atlas ('vfx'): hits, dust, alert rays, the '!' and '?' bubbles
VFXR = ramps('gold', 'orange', 'red', 'metal', 'skin', 'stone', 'earth', 'purple')


def _cuts(boxes, w, h, pal=VFXR, align='center', **kw):
    return _strip([grab('vfx', b, 0, pal, size=(w, h), **kw) for b in boxes], w, h, align)


def fx_hit():
    """32 x 32 x 5: the P03 starburst growing to full, then breaking into sparks (row 1)."""
    boxes = [(440, 50, 528, 132), (520, 42, 625, 138), (618, 42, 722, 140), (618, 42, 722, 140), (40, 70, 100, 130)]
    sizes = [(20, 20), (28, 28), (30, 30), (20, 20), (12, 12)]
    return _strip([grab('vfx', b, 0, VFXR, size=s) for b, s in zip(boxes, sizes)], 32, 32)


def fx_dust():
    """24 x 24 x 5: the P03 dust puffs (row 4), growing then thinning."""
    boxes = [(28, 535, 92, 590), (95, 515, 172, 592), (168, 500, 272, 594), (268, 508, 362, 592), (268, 508, 362, 592)]
    sizes = [(10, 9), (16, 15), (22, 18), (20, 16), (14, 11)]
    return _strip([grab('vfx', b, 0, VFXR, size=s, largest=False) for b, s in zip(boxes, sizes)], 24, 24, 'bottom')


def fx_clang():
    """32 x 20 x 3: the P03 alert ray fans (row 5), gold, gold, red: rays fanning up over the ringing bell."""
    boxes = [(52, 638, 152, 722), (182, 632, 282, 722), (328, 628, 432, 722)]
    return _cuts(boxes, 26, 18, align='bottom')


def mood(which):
    """12 x 12 x 2: the P03 '?' (mood 2) or '!' (mood 3) bubble, a white bubble so no hat or plume swallows it;
    the second frame is the same bubble a pixel higher (a bob)."""
    box = (768, 642, 858, 724) if which == 2 else (636, 642, 728, 724)
    b = grab('vfx', box, 0, ramps('metal', 'red', 'purple', 'blue', 'cloud'), size=(11, 11))
    a = new(12, 12)
    paste(a, b, 0, 1)
    c = new(12, 12)
    paste(c, b, 0, 0)
    out = new(24, 12)
    out.paste(a, (0, 0))
    out.paste(c, (12, 0))
    return out


# ---- the camp and the quarry: what the plates do show
def camp_fire():
    """P08 chibi biome atlas, the lava band: a fire in an iron brazier (no plate has a campfire)."""
    return grab('biome', (850, 555, 935, 635), 0.26, ramps('orange', 'gold', 'red', 'night', 'stone'))


def camp_flag():
    """P07 platformer tileset: the star banner on its pole."""
    return grab('platformer', (722, 852, 798, 962), 0.4, ramps('wood', 'gold', 'red', 'stone'))


def rocks(big=True):
    """P07 platformer tileset: the grey boulder heap, and the small stones beside it."""
    return grab('platformer', (875, 168, 1002, 265), 0.17 if big else 0.12, ramps('stone', 'castle'))


# ---- Step 14 slice A's level entrances (asked by the orchestrator for the owner's "level entries"):
# P05 secrets-doors-breakables, top row; the completion rings from P05 ui-hero-party-hud's bottom row;
# the sign is P07 platformer's wooden signpost. Both P05 plates sit on an opaque pale ground (keyed out).
P05PALE = (247, 247, 247)
ENTRY = ramps('stone', 'castle', 'wood', 'gold', 'blue', 'purple', 'foliage', 'grass', 'night', 'red', 'pink', 'teal')
ENTRIES = {'arch': (203, 68, 308, 172), 'gem-door': (313, 66, 418, 172), 'portal': (528, 68, 632, 172),
           'mine': (638, 72, 756, 172)}


def level_entry(which):
    return fit(grab('secrets', ENTRIES[which], 0, ENTRY, key=P05PALE, size=(30, 30)), 32, 32)


PIES = [(138, 455, 208, 512), (208, 455, 273, 512), (273, 455, 338, 512), (338, 455, 412, 512)]
PIER = ramps('gold', 'purple', 'castle', 'stone', 'metal', 'orange')


def level_pie(n):
    """0 empty .. 4 full; the plate shows empty, a quarter, three quarters and full; half is made from the
    empty and the full ring (right half from the full one)."""
    if n == 2:
        a, b = level_pie(0), level_pie(4)
        out = a.copy()
        out.paste(b.crop((6, 0, 12, 12)), (6, 0))
        return out
    box = PIES[{0: 0, 1: 1, 3: 2, 4: 3}[n]]
    return fit(grab('hud', box, 0, PIER, key=(245, 245, 244), size=(12, 11)), 12, 12)


def level_sign():
    return fit(grab('platformer', (815, 860, 895, 958), 0, ramps('wood', 'stone', 'gold', 'earth'), size=(15, 16)), 16, 16)


def level_pie(n):  # noqa: F811 (replaces the cut above: the plate's rings run off its bottom edge)
    """12 x 12, n quarters filled clockwise from the top. DRAFT: drawn in the P05 HUD rings' own colours (a
    purple ring, gold fill, ink edge) because the plate's rings are cut off by its bottom edge."""
    import math
    from px import col, put
    im = new(12, 12)
    for y in range(12):
        for x in range(12):
            dx, dy = x + 0.5 - 6, y + 0.5 - 6
            r = math.hypot(dx, dy)
            if r > 6:
                continue
            ang = (math.degrees(math.atan2(dx, -dy)) + 360) % 360
            if r > 5:
                c = INK
            elif r > 3.6:
                c = col('purple', 2) if dx + dy < 0 else col('purple', 1)
                if ang < n * 90:
                    c = col('gold', 3) if dx + dy < 0 else col('gold', 2)
            else:
                c = col('night', 2)
                if ang < n * 90:
                    c = col('gold', 2) if dx + dy < 0 else col('gold', 1)
            put(im, x, y, c)
    return im


# ---- Step 3's undercroft plate and grate (handoff-prompts/props-asks-2.md, ask 1). DRAFT: boxes and sizes are
# first passes. src/client/draw/room-parts.ts draws `part:undercroft:stone-plate` (and `:down`) bottom-centred on
# the plate's 4x1 tiles, translated down by how far the load has sunk it and clipped to those tiles; so `:down` is
# the same slab, shaded, not drawn pre-lowered. The grate fills its 2x1 floor tiles.
STONEPAL = ramps('stone', 'castle', 'night')
GRATEPAL = ramps('stone', 'castle', 'metal', 'gold', 'night', 'purple')


def stone_plate(down=False):
    """P05 secrets-doors-breakables, bottom row, the plain stone slab (the plate cuts it off at its left edge).
    Its right end is mirrored to close the left, and a 2 px column of its middle is repeated between, at the
    plate's own resolution, so the 64 x 7 shrink is a majority over real source pixels, not a stretch of a tiny
    cut. Down: the slab's lit top faces one ramp step darker, the weight pressing it into shadow."""
    import srcimport
    from PIL import ImageOps
    from srcimport import sheet
    src = sheet('secrets').crop((0, 424, 56, 474))
    right, mid = src.crop((22, 0, 56, 50)), src.crop((20, 0, 22, 50))
    W = 64 * 46 // 7
    comp = Image.new('RGBA', (W, 50), P05PALE + (255,))
    comp.paste(ImageOps.mirror(right), (0, 0))
    for x in range(34, W - 34, 2):
        comp.paste(mid, (x, 0))
    comp.paste(right, (W - 34, 0))
    srcimport._cache['_stone-plate'] = comp
    slab = grab('_stone-plate', (0, 0, W, 50), 0, STONEPAL, key=P05PALE, size=(64, 7))
    if down:
        from px import col
        darker = {}
        for ramp in ('stone', 'castle'):
            for i in range(1, 4):
                darker[col(ramp, i)] = col(ramp, i - 1)
        for y in range(slab.height):
            for x in range(slab.width):
                c = slab.getpixel((x, y))
                if c in darker:
                    slab.putpixel((x, y), darker[c])
    return fit(slab, 64, 16)


def floor_grate(open_=False):
    """Shut: P07 pixel-art-platformer, bottom row's small barred grate (upright bars in a stone frame; first cut
    from P04's riveted vent, which had to be squashed 2.4x). Open: P04 interactables row 3's riveted hatch round a
    dark shaft, squashed to the two floor tiles (32 x 16): no plate shows the barred grate open."""
    if open_:
        return grab('interact', (20, 640, 190, 770), 0, GRATEPAL, size=(32, 16))
    return grab('platformer', (100, 878, 175, 935), 0, GRATEPAL, size=(32, 16))


# ---- Step 20's camp run (props-asks-2, ask 2): breakable parts, drawn whole and bottom-centred over their tiles by
# room-parts.ts (`<look>-<w>x<h>`, `<look>-broken-<w>x<h>`). DRAFT: boxes, sizes and the stacking are first passes.
CAMPPAL = ramps('wood', 'earth', 'stone', 'castle', 'red', 'pink', 'orange', 'gold', 'foliage', 'night')


def _stack(name, box, cap, n, foot=0):
    """A tall piece from a short one at the plate's own resolution: the piece's top `cap` rows, then its body
    (between the cap and the bottom `foot` rows) repeated n times, then the foot once, for a majority shrink over
    real source pixels."""
    import srcimport
    from srcimport import sheet
    src = sheet(name).crop(box)
    src = src.crop(src.getchannel('A').point(lambda a: 255 if a >= 150 else 0).getbbox())  # no gap between copies
    w, h = src.size
    body = src.crop((0, cap, w, h - foot))
    out = Image.new('RGBA', (w, cap + body.height * n + foot), (0, 0, 0, 0))
    out.paste(src.crop((0, 0, w, cap)), (0, 0))
    for i in range(n):
        out.paste(body, (0, cap + i * body.height))
    if foot:
        out.paste(src.crop((0, h - foot, w, h)), (0, cap + body.height * n))
    tag = '_%s-%d-%d-%d' % (name, box[0], box[1], n)
    srcimport._cache[tag] = out
    return tag, (0, 0) + out.size


def splinters(w, h):
    """P07 vibrant interactables row 3, the smashed crate's plank pile (puffs dropped by the largest-blob cut)."""
    return grab('vibrant', (865, 490, 1005, 600), 0, CAMPPAL, size=(w, h))


def fence(broken=False):
    """1x2, a light timber barrier: P08 colorful-retro-fantasy row 1's diagonal-braced timber frame, drawn two tiles
    tall (stacked twice it read as a pile of crates, and crates are things you lift). Broken: the plank pile."""
    if broken:
        return fit(splinters(16, 9), 16, 32)
    return grab('fantasy', (1092, 15, 1178, 110), 0, CAMPPAL, size=(16, 32))


def stall(broken=False):
    """2x2: P08 colorful-retro-fantasy row 5's red-striped market stall (fruit in a crate, a barrel). Broken: the
    plank pile at stall width."""
    if broken:
        return fit(splinters(30, 13), 32, 32)
    return fit(grab('fantasy', (340, 405, 470, 515), 0, CAMPPAL, size=(32, 27)), 32, 32)


def barricade(broken=False):
    """1x4, the timber barricade only the wagon breaks: P08 colorful-retro-fantasy row 1's plank wall (vertical
    planks under a capping board), its planks run on (no seam) to four tiles. Broken: two plank piles, one on the
    other."""
    if broken:
        im = new(16, 64)
        paste(im, splinters(16, 9), 0, 55)
        paste(im, splinters(14, 8), 1, 48)
        return im
    tag, box = _stack('fantasy', (245, 15, 335, 110), 22, 3, foot=8)
    return grab(tag, box, 0, CAMPPAL, size=(16, 64))


# ---- the hearts builder's ask (Step 21 push 4): a HUD heart, full and empty, for the party plate
HEARTPAL = ramps('pink', 'red', 'castle', 'stone', 'night', 'cloud')
HEARTS = {True: (895, 110, 986, 190), False: (1075, 110, 1166, 190)}


def hud_heart(full):
    """P07 irreverents-pixel-ui-atlas, top row: the pink heart (full) and the grey heart (empty). 9 x 8, the smallest
    that keeps the heart's notch and point (7 x 6 lost the notch); the plate's renderer fits it into its box."""
    return grab('ui', HEARTS[full], 0, HEARTPAL, size=(9, 8))
