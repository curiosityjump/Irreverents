"""DRAFT: crops the heroes' shots (shots.mjs) into the committed review set.

    python3 -I tools/art/heroes/shotsheet.py

Reads tools/art/heroes/preview/shots/{before,after}-*.png and writes, under
docs/plan/step-8-shots/round3/heroes/:
  canon-vs-frames.png   every frame of each hero beside its canon crop, same display size
  <scene>-<up|side>.png  before above after, the whole phone screen at half size
  throw-<up|side>.png    the throw filmstrip, a crop round the grappler, before above after
"""
import json
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SHOTS = os.path.join(HERE, 'preview', 'shots')
OUT = os.path.join(ROOT, 'docs', 'plan', 'step-8-shots', 'round3', 'heroes')
sys.path.insert(0, HERE)
import p03  # noqa: E402
import canon  # noqa: E402

os.makedirs(OUT, exist_ok=True)
BG = (92, 86, 144, 255)


def pair(scene, ph):
    ims = [Image.open(os.path.join(SHOTS, f'{t}-{scene}-{ph}.png')).convert('RGB') for t in ('before', 'after')]
    ims = [im.resize((im.width // 2, im.height // 2), Image.LANCZOS) for im in ims]
    if ph == 'up':
        out = Image.new('RGB', (ims[0].width * 2 + 8, ims[0].height), (20, 20, 30))
        out.paste(ims[0], (0, 0)); out.paste(ims[1], (ims[0].width + 8, 0))
    else:
        out = Image.new('RGB', (ims[0].width, ims[0].height * 2 + 8), (20, 20, 30))
        out.paste(ims[0], (0, 0)); out.paste(ims[1], (0, ims[0].height + 8))
    out.save(os.path.join(OUT, f'{scene}-{ph}.png'), optimize=True)


def canon_vs_frames():
    # each hero: the 13 canon crops (sheet, scaled to the same height as the frames' 4x) over the sheet's frames
    rows = []
    k = 4
    for hero in canon.PARTY:
        srcs = [Image.fromarray(p03.source(hero, c).astype('uint8')) for c in range(13)]
        s = canon.HEIGHT[hero] * k / p03.ref_height(hero)
        srcs = [im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS) for im in srcs]
        top = Image.new('RGBA', (13 * 48 * k, 48 * k), BG)
        for i, im in enumerate(srcs):
            top.alpha_composite(im, (i * 48 * k + (48 * k - im.width) // 2, 46 * k - im.height))
        nat = Image.new('RGBA', (13 * 48, 48), BG)
        for i in range(13):
            im = Image.fromarray(canon.P(hero, i))
            nat.alpha_composite(im, (i * 48 + (48 - im.width) // 2, 46 - im.height))
        rows += [top, nat.resize((nat.width * k, nat.height * k), Image.NEAREST)]
        meta = json.load(open(os.path.join(ROOT, 'content', 'sprites', f'{hero}.json')))
        sheet = Image.open(os.path.join(ROOT, 'assets', meta['image'])).convert('RGBA')
        bg = Image.new('RGBA', sheet.size, BG)
        bg.alpha_composite(sheet)
        d = ImageDraw.Draw(bg)
        for r, st in enumerate(canon.ROWS):
            d.text((8 * 48 - 46, r * 48 + 2), '', fill=(255, 255, 255))
        rows.append(bg.resize((bg.width * 2, bg.height * 2), Image.NEAREST))
    W = max(r.width for r in rows)
    out = Image.new('RGBA', (W, sum(r.height + 8 for r in rows)), (20, 20, 30, 255))
    y = 0
    for r in rows:
        out.alpha_composite(r, (0, y)); y += r.height + 8
    out.convert('RGB').save(os.path.join(OUT, 'canon-vs-frames.png'), optimize=True)


def throw(ph):
    rows = []
    for t in ('before', 'after'):
        ims = [Image.open(os.path.join(SHOTS, f'{t}-throw-{i}-{ph}.png')).convert('RGB') for i in range(6)]
        w, h = ims[0].size
        box = (int(w * 0.3), int(h * 0.35), int(w * 0.7), int(h * 0.75)) if ph == 'side' else (int(w * 0.25), int(h * 0.38), int(w * 0.75), int(h * 0.62))
        crops = [im.crop(box) for im in ims]
        crops = [c.resize((c.width // 2, c.height // 2), Image.LANCZOS) for c in crops]
        row = Image.new('RGB', (sum(c.width + 4 for c in crops), crops[0].height), (20, 20, 30))
        x = 0
        for c in crops:
            row.paste(c, (x, 0)); x += c.width + 4
        rows.append(row)
    out = Image.new('RGB', (rows[0].width, rows[0].height * 2 + 8), (20, 20, 30))
    out.paste(rows[0], (0, 0)); out.paste(rows[1], (0, rows[0].height + 8))
    out.save(os.path.join(OUT, f'throw-{ph}.png'), optimize=True)


if __name__ == '__main__':
    canon_vs_frames()
    for ph in ('up', 'side'):
        for scene in ('together-castle-street', 'together-throne-room', 'together-cantina', 'together-undercroft',
                      'punch', 'carry-friend', 'carry-crate'):
            pair(scene, ph)
        throw(ph)
    print('wrote', OUT)
