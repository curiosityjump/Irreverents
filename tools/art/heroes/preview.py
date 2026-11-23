"""DRAFT: previews of the heroes lane's sheets, for a person to look at (never shipped).

    python3 -I tools/art/heroes/preview.py

Reads assets/sprites/heroes/*.png and content/sprites/<hero>.json and writes,
under tools/art/heroes/preview/ (git-ignored):
  <hero>-sheet.png    the whole sheet at 4x with each row's state name
  <hero>-strips.png   every animation as a strip at 4x
  silhouettes.png     all four in flat black, idle/run/attack, at 1x and 4x
  scene.png           a 320x180 mock scene at 4x: the four standing, running and attacking
  scene-1x.png        the same at 1x
Upscaling is NEAREST only.
"""
import json
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(HERE, 'preview')
HEROES = ['grappler', 'infiltrator', 'flyer', 'hero']
BG = (0xC4, 0xE9, 0xFF, 255)


def load(h):
    with open(os.path.join(ROOT, 'content', 'sprites', f'{h}.json')) as fh:
        meta = json.load(fh)
    img = Image.open(os.path.join(ROOT, 'assets', meta['image'])).convert('RGBA')
    return meta, img


def cell(meta, img, f):
    cw, ch = meta['cell']['w'], meta['cell']['h']
    cols = img.width // cw
    x, y = (f % cols) * cw, (f // cols) * ch
    return img.crop((x, y, x + cw, y + ch))


def up(im, s=4):
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def box_of(h):
    with open(os.path.join(ROOT, 'content', 'characters', f'{h}.json')) as fh:
        return json.load(fh)['box']


def sheet_preview(h, meta, img):
    s = 4
    names = list(meta['frames'].keys())
    rows = []
    for name in names:
        fr = meta['frames'][name]
        rows.append((name, fr))
    cw, ch = meta['cell']['w'], meta['cell']['h']
    W = 90 + 8 * (cw * s + 4)
    H = len(rows) * (ch * s + 6)
    out = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(out)
    box = box_of(h)
    for r, (name, fr) in enumerate(rows):
        y = r * (ch * s + 6)
        d.text((4, y + 4), name, fill=(43, 33, 64, 255))
        for i, f in enumerate(fr):
            x = 90 + i * (cw * s + 4)
            c = up(cell(meta, img, f), s)
            # the collision box, faint, so feet and centring can be judged
            ax, ay = meta['anchor']['x'], meta['anchor']['y']
            d.rectangle((x + ax * s, y + ay * s, x + (ax + box['w']) * s - 1, y + (ay + box['h']) * s - 1), outline=(240, 89, 106, 255))
            out.alpha_composite(c, (x, y))
    out.save(os.path.join(OUT, f'{h}-sheet.png'))


def strips(h, meta, img):
    s = 4
    names = list(meta['frames'].keys())
    cw, ch = meta['cell']['w'], meta['cell']['h']
    W = 8 * cw * s
    out = Image.new('RGBA', (W, len(names) * ch * s), (238, 249, 255, 255))
    for r, name in enumerate(names):
        for i, f in enumerate(meta['frames'][name]):
            out.alpha_composite(up(cell(meta, img, f), s), (i * cw * s, r * ch * s))
    out.save(os.path.join(OUT, f'{h}-strips.png'))


def black(im):
    px = im.load()
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    po = out.load()
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y][3] > 0:
                po[x, y] = (0, 0, 0, 255)
    return out


def silhouettes(all_):
    W, H = 4 * 3 * 52, 48
    one = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    x = 2
    for h in HEROES:
        meta, img = all_[h]
        for state in ('idle', 'run', 'attack'):
            fr = meta['frames'][state]
            c = black(cell(meta, img, fr[min(1, len(fr) - 1)]))
            one.alpha_composite(c, (x, H - c.height))
            x += c.width + 4
    one = one.crop((0, 0, x, H))
    big = up(one, 4)
    out = Image.new('RGBA', (big.width, big.height + H + 8), (255, 255, 255, 255))
    out.alpha_composite(one, (0, 0))
    out.alpha_composite(big, (0, H + 8))
    out.save(os.path.join(OUT, 'silhouettes.png'))


def scene(all_):
    W, H = 320, 180
    sc = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(sc)
    # a quiet sky and a grass-topped ground, only to judge the heroes against
    bands = ['#5fb4f0', '#74c0f4', '#8fd0fa', '#a8dcfc', '#c4e9ff']
    for i, b in enumerate(bands):
        d.rectangle((0, i * 26, W, (i + 1) * 26), fill=b)
    d.rectangle((0, 130, W, 180), fill='#c4e9ff')
    for x in range(0, W, 64):
        d.ellipse((x - 20, 100, x + 50, 150), fill='#b5d6ee')
    floor = 148
    d.rectangle((0, floor, W, H), fill='#94583a')
    d.rectangle((0, floor, W, floor + 3), fill='#5fd35a')
    d.rectangle((0, floor + 3, W, floor + 4), fill='#2fa84a')
    for x in range(0, W, 16):
        d.line((x, floor + 4, x, H), fill='#6b3f2a')
    # a ledge
    d.rectangle((200, 100, 272, 116), fill='#94583a')
    d.rectangle((200, 100, 272, 103), fill='#5fd35a')
    x = 14
    for h in HEROES:
        meta, img = all_[h]
        box = box_of(h)
        for state, fi in (('idle', 0), ('run', 2), ('attack', 1)):
            f = meta['frames'][state][fi]
            c = cell(meta, img, f)
            ax, ay = meta['anchor']['x'], meta['anchor']['y']
            bx = x
            by = floor - box['h']
            sc.alpha_composite(c, (bx - ax, by - ay))
            x += box['w'] + 12
        x += 6
    # one of each mirrored (facing left) on the ledge
    lx = 206
    for h in HEROES:
        meta, img = all_[h]
        box = box_of(h)
        c = cell(meta, img, meta['frames']['idle'][0]).transpose(Image.FLIP_LEFT_RIGHT)
        ax, ay = meta['anchor']['x'], meta['anchor']['y']
        cw = meta['cell']['w']
        bx, by = lx, 100 - box['h']
        # mirrored: the box keeps its place, the picture flips about the box centre
        left = bx + box['w'] / 2 - (cw - (ax + box['w'] / 2))
        sc.alpha_composite(c, (int(round(left)), by - ay))
        lx += box['w'] + 4
    sc.save(os.path.join(OUT, 'scene-1x.png'))
    up(sc, 4).save(os.path.join(OUT, 'scene.png'))


def main():
    os.makedirs(OUT, exist_ok=True)
    all_ = {h: load(h) for h in HEROES}
    for h in HEROES:
        meta, img = all_[h]
        sheet_preview(h, meta, img)
        strips(h, meta, img)
    silhouettes(all_)
    scene(all_)
    print('wrote', ', '.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
