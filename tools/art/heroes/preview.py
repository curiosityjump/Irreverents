"""Pictures for a PERSON to look at, never for the game (nothing here goes under assets/).

    python3 -I tools/art/heroes/preview.py [output folder]

Writes, at 4x nearest-neighbour:
  contact-<hero>.png   every state of one hero, labelled, with its collision box
  strips/<hero>-<state>.png   each animation as one strip
  silhouettes.png      all four in flat black, at 1x and 4x: they must differ by shape alone
  scene.png, scene-1x.png   a 320x180 mock (flat sky, a strip of ground) with all four
                       standing, running, attacking and in the air, to judge size and read
Default output folder: <system temp>/irreverents-art-previews/heroes.
"""

import os
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)  # python3 -I does not add the script's folder

from PIL import Image, ImageDraw, ImageFont  # noqa: E402

import build  # noqa: E402

SKY = (0x8F, 0xD0, 0xFA, 255)
SKY2 = (0x84, 0xC6, 0xF2, 255)
INK = (0x2B, 0x21, 0x40, 255)
Z = 4


def up(im, z=Z):
    return im.resize((im.width * z, im.height * z), Image.NEAREST)


def contact(mod, fr):
    cw, ch = mod.CELL
    states = sorted(fr.keys(), key=lambda s: (build.PLACE[s][0], build.PLACE[s][1]))
    label_w = 64
    width = label_w + 6 * cw * Z
    im = Image.new('RGBA', (width, len(states) * ch * Z), SKY)
    d = ImageDraw.Draw(im)
    font = ImageFont.load_default()
    for j, st in enumerate(states):
        for i, f in enumerate(fr[st]):
            cell = Image.new('RGBA', (cw, ch), SKY if (i + j) % 2 == 0 else SKY2)
            cd = ImageDraw.Draw(cell)
            # the collision box (the truth), drawn faintly behind the picture
            ax, ay = mod.ANCHOR
            cd.rectangle([ax, ay, ax + mod.BOX[0] - 1, ay + mod.BOX[1] - 1], outline=(0x6F, 0xB8, 0xEA, 255))
            cell.alpha_composite(f)
            im.paste(up(cell), (label_w + i * cw * Z, j * ch * Z))
        d.text((4, j * ch * Z + 4), '%s\n%d' % (st, len(fr[st])), fill=INK, font=font)
    return im


def strip(mod, imgs):
    cw, ch = mod.CELL
    im = Image.new('RGBA', (len(imgs) * cw, ch), SKY)
    for i, f in enumerate(imgs):
        im.alpha_composite(f, (i * cw, 0))
    return up(im)


def black(f):
    out = Image.new('RGBA', f.size, (0, 0, 0, 0))
    out.paste((0, 0, 0, 255), mask=f.getchannel('A'))
    return out


def silhouettes(all_fr):
    picks = [('idle', 0), ('run', 0), ('attack', 1), ('flap', 0)]
    w = sum(build.module(h).CELL[0] for h in build.HEROES)
    h = 48
    one = Image.new('RGBA', (w, h * len(picks)), (255, 255, 255, 255))
    for j, (st, k) in enumerate(picks):
        x = 0
        for hero in build.HEROES:
            mod = build.module(hero)
            f = black(all_fr[hero][st][k])
            one.alpha_composite(f, (x, j * h + h - mod.CELL[1]))
            x += mod.CELL[0]
    im = Image.new('RGBA', (w + 8 + w * Z, h * len(picks) * Z), (255, 255, 255, 255))
    im.paste(one, (0, 0))
    im.paste(up(one), (w + 8, 0))
    return im


def put(scene, mod, f, x, ground, flip=False):
    """Draw frame f with its collision box's bottom-left at (x, ground)."""
    if flip:
        f = f.transpose(Image.FLIP_LEFT_RIGHT)
        ax = mod.CELL[0] - mod.ANCHOR[0] - mod.BOX[0]
    else:
        ax = mod.ANCHOR[0]
    scene.alpha_composite(f, (x - ax, ground - mod.BOX[1] - mod.ANCHOR[1]))


def ground(scene, x0, x1, y, depth):
    d = ImageDraw.Draw(scene)
    d.rectangle([x0, y, x1, y + depth], fill=(0x94, 0x58, 0x3A, 255))
    d.rectangle([x0, y, x1, y + 1], fill=(0xA8, 0xF0, 0x70, 255))
    d.rectangle([x0, y + 2, x1, y + 4], fill=(0x5F, 0xD3, 0x5A, 255))
    d.rectangle([x0, y + 5, x1, y + 5], fill=(0x2F, 0xA8, 0x4A, 255))
    d.rectangle([x0, y + 6, x1, y + 6], fill=(0x6B, 0x3F, 0x2A, 255))


def scene(all_fr):
    im = Image.new('RGBA', (320, 180), SKY)
    g = 150
    ground(im, 0, 319, g, 30)
    ground(im, 168, 319, 80, 12)
    mods = {h: build.module(h) for h in build.HEROES}
    # standing, in the order the party is given
    for hero, x in (('grappler', 12), ('infiltrator', 42), ('flyer', 60), ('hero', 84)):
        put(im, mods[hero], all_fr[hero]['idle'][0], x, g)
    # running (two different beats each, so the cycle can be judged)
    for hero, x, k in (('grappler', 118, 0), ('infiltrator', 150, 3), ('flyer', 170, 1), ('hero', 194, 2)):
        put(im, mods[hero], all_fr[hero]['run'][k], x, g)
    # carrying and facing left
    for hero, x, st, k in (('grappler', 232, 'carry', 0), ('infiltrator', 262, 'run', 0), ('flyer', 280, 'idle', 0), ('hero', 302, 'idle', 0)):
        put(im, mods[hero], all_fr[hero][st][k], x, g, flip=True)
    # attacking, on the ledge
    for hero, x in (('grappler', 180), ('infiltrator', 226), ('flyer', 252), ('hero', 286)):
        put(im, mods[hero], all_fr[hero]['attack'][1], x, 80)
    # in the air
    put(im, mods['grappler'], all_fr['grappler']['jump'][0], 20, 86)
    put(im, mods['infiltrator'], all_fr['infiltrator']['fall'][0], 56, 70)
    put(im, mods['flyer'], all_fr['flyer']['flap'][0], 84, 60)
    put(im, mods['flyer'], all_fr['flyer']['flap'][1], 112, 52)
    put(im, mods['hero'], all_fr['hero']['jump'][0], 140, 90)
    return im


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'irreverents-art-previews', 'heroes')
    os.makedirs(os.path.join(out, 'strips'), exist_ok=True)
    all_fr = {}
    for hero in build.HEROES:
        mod = build.module(hero)
        fr = build.frames(mod)
        all_fr[hero] = fr
        contact(mod, fr).save(os.path.join(out, 'contact-%s.png' % hero))
        for st, imgs in fr.items():
            strip(mod, imgs).save(os.path.join(out, 'strips', '%s-%s.png' % (hero, st)))
        for b in build.problems(mod, fr):
            print('PROBLEM: ' + b)
    silhouettes(all_fr).save(os.path.join(out, 'silhouettes.png'))
    sc = scene(all_fr)
    sc.save(os.path.join(out, 'scene-1x.png'))
    up(sc).save(os.path.join(out, 'scene.png'))
    print('wrote previews to ' + out)


if __name__ == '__main__':
    main()
