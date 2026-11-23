"""Contact sheets and a mock scene for a person to look at.

    python3 -I tools/art/cast/preview.py

Reads the sheets and content files make.py wrote and writes 4x (nearest)
pictures into tools/art/cast/preview/, which is git-ignored:
  sheet-<id>.png   every state of one sheet, one labelled strip per state
  moods.png        the three moods of each person side by side
  scene.png        a 320x180 mock throne room: the king by his throne, a
                   guard, the villain, the shopkeeper, crates and dummies
"""
import json
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
OUT = os.path.join(HERE, 'preview')
IDS = ['king', 'guard', 'shopkeeper', 'villain', 'crate', 'crate-heavy', 'dummy', 'dummy-heavy', 'throne',
       'brawler', 'skirmisher', 'outpost-fighter', 'outpost-lookout', 'signal-post']
PEOPLE = IDS[:4]
BG = (129, 121, 184, 255)       # the castle ramp, where most of them stand
S = 4


def load(cid):
    d = json.load(open(os.path.join(ROOT, 'content', 'sprites', cid + '.json')))
    im = Image.open(os.path.join(ROOT, 'assets', d['image'])).convert('RGBA')
    box = json.load(open(os.path.join(ROOT, 'content', 'characters', cid + '.json')))['box']
    return d, im, box


def cell(d, im, f):
    w, h = d['cell']['w'], d['cell']['h']
    cols = im.width // w
    return im.crop(((f % cols) * w, (f // cols) * h, (f % cols) * w + w, (f // cols) * h + h))


def up(im):
    return im.resize((im.width * S, im.height * S), Image.NEAREST)


def sheet(cid):
    d, im, box = load(cid)
    w, h = d['cell']['w'], d['cell']['h']
    rows = list(d['frames'].items())
    for m, st in d.get('moods', {}).items():
        rows += [('mood %s %s' % (m, k), v) for k, v in st.items()]
    n = max(len(v) for _, v in rows)
    out = Image.new('RGBA', (n * w, len(rows) * h), BG)
    for ri, (_, fr) in enumerate(rows):
        for ci, f in enumerate(fr):
            out.alpha_composite(cell(d, im, f), (ci * w, ri * h))
    out = up(out)
    dr = ImageDraw.Draw(out)
    for ri, (name, fr) in enumerate(rows):
        dr.text((3, ri * h * S + 2), '%s %s' % (name, fr), fill=(255, 255, 255, 255))
        # the collision box of the first frame, so feet and centring can be judged
        ax, ay = d['anchor']['x'], d['anchor']['y']
        dr.rectangle([ax * S, (ri * h + ay) * S, (ax + box['w']) * S - 1, (ri * h + ay + box['h']) * S - 1], outline=(255, 255, 255, 90))
    out.save(os.path.join(OUT, 'sheet-%s.png' % cid))


def moods():
    w = 48
    out = Image.new('RGBA', (3 * 4 * w, 2 * w), BG)
    for pi, cid in enumerate(PEOPLE):
        d, im, _ = load(cid)
        off = (w - d['cell']['w']) // 2
        for mi, m in enumerate(('1', '2', '3')):
            for si, st in enumerate(('idle', 'run')):
                fr = d['frames'][st] if m == '1' else d['moods'][m][st]
                out.alpha_composite(cell(d, im, fr[0]), ((pi * 3 + mi) * w + off, si * w + (w - d['cell']['h'])))
    up(out).save(os.path.join(OUT, 'moods.png'))


def scene():
    W, H, T = 320, 180, 16
    C = [(0x3f, 0x3a, 0x66), (0x5c, 0x56, 0x90), (0x81, 0x79, 0xb8), (0xaa, 0xa3, 0xd8)]
    out = Image.new('RGBA', (W, H), C[1] + (255,))
    dr = ImageDraw.Draw(out)
    for y in range(0, H, 8):                       # a quiet back wall
        for x in range(-8, W, 16):
            xx = x + (8 if (y // 8) % 2 else 0)
            dr.rectangle([xx, y, xx + 15, y + 7], outline=(0x55, 0x4f, 0x88, 255))
    floor = H - 20
    dr.rectangle([0, floor, W, H], fill=C[2] + (255,))
    dr.rectangle([0, floor, W, floor + 1], fill=C[3] + (255,))
    dr.rectangle([0, floor - T, 5 * T, floor], fill=C[2] + (255,))      # the dais
    dr.rectangle([0, floor - T, 5 * T, floor - T + 1], fill=C[3] + (255,))
    for x in range(0, W, T):
        dr.line([x, floor + 2, x, H], fill=C[1] + (255,))

    def put(cid, state, i, x, ground, mood=None, flip=False):
        d, im, box = load(cid)
        fr = d['frames'][state] if mood is None else d['moods'][mood][state]
        c = cell(d, im, fr[i % len(fr)])
        if flip:
            c = c.transpose(Image.FLIP_LEFT_RIGHT)
            ax = d['cell']['w'] - d['anchor']['x'] - box['w']
        else:
            ax = d['anchor']['x']
        out.alpha_composite(c, (x - ax, ground - box['h'] - d['anchor']['y']))

    put('throne', 'idle', 0, 20, floor - T)
    put('king', 'talk', 3, 50, floor - T)
    put('guard', 'idle', 0, 96, floor)
    put('shopkeeper', 'idle', 0, 122, floor, mood='2')
    put('crate', 'idle', 0, 146, floor)
    put('crate-heavy', 'idle', 0, 164, floor)
    put('crate', 'idle', 0, 168, floor - 24)
    put('dummy', 'idle', 0, 198, floor)
    put('dummy-heavy', 'idle', 0, 216, floor)
    put('villain', 'talk', 4, 250, floor, flip=True)
    put('guard', 'run', 1, 286, floor, mood='3', flip=True)
    out.save(os.path.join(OUT, 'scene-1x.png'))
    up(out).save(os.path.join(OUT, 'scene.png'))


def main():
    os.makedirs(OUT, exist_ok=True)
    for cid in IDS:
        sheet(cid)
    moods()
    scene()
    print('wrote previews to', OUT)


if __name__ == '__main__':
    main()
