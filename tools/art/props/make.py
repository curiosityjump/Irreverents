"""Props lane: draws every look and decoration sheet and writes their content files.

    python3 -I tools/art/props/make.py

Rewrites assets/props/, assets/fx/, assets/decor/, assets/ui/use.png, content/looks/ and content/decor/.
Deterministic: the same bytes every run (no clock, no unseeded randomness).
The contract is docs/mechanisms/art-pipeline.md; this lane's notes are tools/art/props/README.md."""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from px import Sheet, flip
import looks_parts as lp
import looks_people as lq
import decor_draw as dd
import import_p01
import round2 as r2
from px import mix, new, col, paste
from sizes import ROOT, sizes
from place import place_all

ROUND2 = '--no-round2-fields' not in sys.argv
# DRAFT: --no-font leaves content/looks/font.json and assets/ui/font.png out while the looks validator caps
# a strip at 64 frames (the contract's font is 95); see README.md, "Flags for the lead".
NO_FONT = '--no-font' in sys.argv
NOTE = 'DRAFT: stand-in drawn by tools/art/props/make.py; a delivered sheet replaces it by editing this file.'
NOTE_DECOR = 'DRAFT: stand-in drawn and placed by tools/art/props/make.py (the placing rules are tools/art/props/place.py).'


def save(im, rel):
    path = os.path.join(ROOT, 'assets', rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, optimize=False)


def write_json(rel, obj):
    path = os.path.join(ROOT, 'content', rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(dumps(obj) + '\n')


def dumps(obj):
    """JSON with one look / one item per line, so a diff reads."""
    lines = ['{']
    keys = list(obj.keys())
    for i, k in enumerate(keys):
        v = obj[k]
        end = ',' if i < len(keys) - 1 else ''
        if k == 'looks':
            lines.append('  "looks": {')
            names = list(v.keys())
            for j, n in enumerate(names):
                lines.append('    %s: %s%s' % (json.dumps(n), json.dumps(v[n]), ',' if j < len(names) - 1 else ''))
            lines.append('  }' + end)
        elif k == 'items':
            lines.append('  "items": [')
            for j, it in enumerate(v):
                lines.append('    %s%s' % (json.dumps(it), ',' if j < len(v) - 1 else ''))
            lines.append('  ]' + end)
        else:
            lines.append('  %s: %s%s' % (json.dumps(k), json.dumps(v), end))
    lines.append('}')
    return '\n'.join(lines)


def looks_sheets():
    sz = sizes()
    # ---- parts
    s = Sheet(160)
    for (w, h) in sorted(sz['door-enter']):
        s.add('door-enter-%dx%d' % (w, h), lp.door_enter(w, h))
    for (w, h) in sorted(sz['window']):
        s.add('window-%dx%d' % (w, h), lp.window(w, h))
        s.add('window-broken-%dx%d' % (w, h), lp.window(w, h, True))
    # the throne room's own window (its part id is "window"): stained glass
    s.add('part:throne-room:window', lp.stained(1, 3))
    s.add('part:throne-room:window:broken', lp.stained(1, 3, True))
    for (w, h) in sorted(sz['hide']):
        s.add('hide-%dx%d' % (w, h), lp.curtain(w, h))
    for (w, h) in sorted(sz['hide']):
        s.add('hide-front-%dx%d' % (w, h), r2.hide_front(w, h, lp.curtain(w, h)))
    s.newrow()
    s.add('bell', lp.bell())
    s.add('bell-ringing', lp.bell_ringing(), frames=4, fps=10)
    s.add('bell-broken', lp.bell('broken'))
    s.newrow()
    s.add('plate-up', lp.plate(False)); s.add('plate-down', lp.plate(True))
    s.add('gate-closed', lp.gate(False)); s.add('gate-open', lp.gate(True))
    s.add('crack-1', lp.crack(0)); s.add('crack-2', lp.crack(1)); s.add('rubble', lp.rubble())
    s.add('shop-counter', lp.shop_counter()); s.add('shop-goods', lp.shop_goods())
    out = [('parts', 'props/parts.png', s)]
    # ---- people
    s = Sheet(96)
    s.add('mood-2', lq.mood2(), frames=2, fps=3); s.add('mood-3', lq.mood3(), frames=2, fps=6)
    s.add('away-dots', lq.away_dots(), frames=4, fps=4)
    s.newrow()
    s.add('bark', lq.bark()); s.add('ribbon', lq.ribbon()); s.add('bark-tail', lq.bark_tail())
    s.add('alert-pip', lq.alert_pip(True)); s.add('alert-pip-off', lq.alert_pip(False)); s.add('player-mark', lq.player_mark())
    s.newrow()
    s.add('shadow-s', lq.shadow(12, 4)); s.add('shadow-m', lq.shadow(18, 5)); s.add('shadow-l', lq.shadow(26, 6))
    out.append(('people', 'props/people.png', s))
    # ---- fx
    # round 2: hits you feel (handoff-prompts/look2-props.md, section 3.1)
    s = Sheet(160)
    s.add('fx-hit', r2.fx_hit(), frames=5, fps=18)
    s.newrow()
    s.add('fx-slash', r2.fx_slash(), frames=5, fps=20)
    s.newrow()
    s.add('fx-swing-grappler', r2.fx_swing_grappler(), frames=3, fps=16)
    s.add('fx-land', lq.fx_land(), frames=4, fps=15)
    s.newrow()
    s.add('fx-dust', r2.fx_dust(), frames=5, fps=15)
    out.append(('fx', 'fx/fx.png', s))
    # round 2: the game's own pixel font, dark on paper and light with a shadow on the ribbon
    s = Sheet(570)
    s.add('font-dark', r2.font_strip(True), frames=95)
    s.newrow()
    s.add('font-light', r2.font_strip(False), frames=95)
    out.append(('font', 'ui/font.png', s))
    # ---- ui: the whole 48 x 24 picture is the look (normal, then pressed), as assets/ui/touch/ are
    s = Sheet(48)
    s.add('ui-use', lq.ui_use())
    out.append(('ui', 'ui/use.png', s))
    return out


P01 = {name: import_p01.piece(name) for name in ('big_barrel', 'small_barrel', 'lantern_post', 'ruin_arch', 'broken_column')}


def p01_pair():
    big, small = P01['big_barrel'], P01['small_barrel']
    im = new(big.width + small.width - 1, big.height)
    paste(im, big, 0, 0)
    paste(im, small, big.width - 1, big.height - small.height)
    return im


def dim_p01(im, t=0.3):
    """The undercroft's copies: the same piece a step toward night, outline kept."""
    out = im.copy()
    night = col('night', 1)
    for y in range(out.height):
        for x in range(out.width):
            c = out.getpixel((x, y))
            if c[3] and c[:3] != col('ink', 0)[:3]:
                out.putpixel((x, y), mix(c, night, t))
    return out


def decor_sheets():
    sheets = {}
    s = Sheet(256)
    s.add('front-10x3', dd.front(10, 3, 1)); s.add('front-3x2', dd.front(3, 2, 2, posts=False))
    s.add('front-8x4', dd.front(8, 4, 3)); s.add('interior-8x3', dd.interior(8, 3))
    s.newrow()
    s.add('stall', dd.stall(5)); s.add('bunting', dd.bunting(96)); s.add('cloth', dd.display_cloth(3))
    s.newrow()
    s.add('lamp', dd.lamp()); s.add('barrel', P01['small_barrel']); s.add('barrels', p01_pair())
    s.add('lantern-post', P01['lantern_post']); s.add('glow-lantern', r2.glow(16))
    s.add('window', dd.shutter_window()); s.add('door-painted', dd.painted_door())
    s.add('sign-mug', dd.hang_sign(0)); s.add('sign-key', dd.hang_sign(1)); s.add('chimney', dd.chimney())
    s.add('planter-a', dd.planter(0)); s.add('planter-b', dd.planter(1))
    sheets['town'] = s
    s = Sheet(256)
    s.add('tree', dd.tree()); s.add('ruin-arch', P01['ruin_arch']); s.add('column-broken', P01['broken_column'])
    s.add('ivy-long', dd.ivy(16, 28, 1)); s.add('ivy-long-b', dd.ivy(16, 24, 5)); s.add('ivy-short', dd.ivy(16, 14, 2))
    s.add('bush', dd.bush()); s.add('bush-small', dd.bush_small())
    s.newrow()
    s.add('column-stump', dd.broken_column(False))
    s.add('flower-pink', dd.flower(0)); s.add('flower-gold', dd.flower(1)); s.add('flower-white', dd.flower(2)); s.add('grass', dd.grass_tuft())
    sheets['courtyard'] = s
    s = Sheet(256)
    s.add('banner-red', dd.banner('red', 'crown')); s.add('banner-blue', dd.banner('blue', 'diamond'))
    s.add('armour', dd.armour()); s.add('torch', dd.torch()); s.add('glow-torch', r2.glow(18))
    s.add('portrait-a', dd.portrait(0)); s.add('portrait-b', dd.portrait(1))
    s.add('column-cap', dd.column_piece('cap')); s.add('column-shaft', dd.column_piece('shaft')); s.add('column-base', dd.column_piece('base'))
    s.add('carpet-drop', dd.carpet_drop(20)); s.add('carpet-mid', dd.carpet('mid')); s.add('carpet-end', dd.carpet('end'))
    sheets['castle'] = s
    s = Sheet(160)
    s.add('barrel-stack', dim_p01(P01['big_barrel'])); s.add('barrel', dim_p01(P01['small_barrel'])); s.add('torch', dd.torch(dark=True))
    s.add('lantern-post', dim_p01(P01['lantern_post'], 0.2)); s.add('glow-torch', r2.glow(18)); s.add('glow-lantern', r2.glow(16))
    s.add('cobweb', dd.cobweb()); s.add('chain', dd.chain()); s.add('chain-end', dd.chain(True))
    sheets['undercroft'] = s
    return sheets


def main():
    for gid, rel, s in looks_sheets():
        if gid == 'font' and NO_FONT:
            continue
        save(s.image(), rel)
        write_json('looks/%s.json' % gid, {'//': NOTE, 'id': gid, 'image': rel, 'looks': s.looks()})
    sheets = decor_sheets()
    for name, s in sheets.items():
        save(s.image(), 'decor/%s.png' % name)
    for rid, R in place_all().items():
        items = []
        for it in R.items:
            x, y, w, h = sheets[it['sheet']].rects[it['name']]
            item = {'image': 'decor/%s.png' % it['sheet'], 'src': [x, y, w, h], 'tx': it['tx'], 'ty': it['ty'],
                    'dx': it['dx'], 'dy': it['dy'], 'layer': it['layer'], 'flip': it['flip']}
            if it.get('blend') and ROUND2:
                item['blend'] = it['blend']
            elif it.get('blend'):
                continue
            items.append(item)
        write_json('decor/%s.json' % rid, {'//': NOTE_DECOR, 'id': rid, 'items': items})
    return sheets


if __name__ == '__main__':
    main()
    print('props: looks and decor written')
