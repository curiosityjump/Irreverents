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
from sizes import ROOT, sizes
from place import place_all

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
    s = Sheet(120)
    s.add('fx-slash', lq.fx_slash(), frames=5, fps=20)
    s.add('fx-hit', lq.fx_hit(), frames=5, fps=20)
    s.add('fx-dust', lq.fx_dust(), frames=5, fps=15)
    s.add('fx-land', lq.fx_land(), frames=4, fps=15)
    out.append(('fx', 'fx/fx.png', s))
    # ---- ui: the whole 48 x 24 picture is the look (normal, then pressed), as assets/ui/touch/ are
    s = Sheet(48)
    s.add('ui-use', lq.ui_use())
    out.append(('ui', 'ui/use.png', s))
    return out


def decor_sheets():
    sheets = {}
    s = Sheet(256)
    s.add('front-10x3', dd.front(10, 3, 1)); s.add('front-3x2', dd.front(3, 2, 2, posts=False))
    s.add('front-8x4', dd.front(8, 4, 3)); s.add('interior-8x3', dd.interior(8, 3))
    s.newrow()
    s.add('stall', dd.stall(5)); s.add('bunting', dd.bunting(96)); s.add('cloth', dd.display_cloth(3))
    s.newrow()
    s.add('lamp', dd.lamp()); s.add('barrel', dd.barrel()); s.add('barrels', dd.town_barrels())
    s.add('window', dd.shutter_window()); s.add('door-painted', dd.painted_door())
    s.add('sign-mug', dd.hang_sign(0)); s.add('sign-key', dd.hang_sign(1)); s.add('chimney', dd.chimney())
    s.add('planter-a', dd.planter(0)); s.add('planter-b', dd.planter(1))
    sheets['town'] = s
    s = Sheet(256)
    s.add('tree', dd.tree()); s.add('ruin-arch', dd.ruin_arch()); s.add('column-broken', dd.broken_column(True))
    s.add('ivy-long', dd.ivy(16, 28, 1)); s.add('ivy-long-b', dd.ivy(16, 24, 5)); s.add('ivy-short', dd.ivy(16, 14, 2))
    s.add('bush', dd.bush()); s.add('bush-small', dd.bush_small())
    s.newrow()
    s.add('column-stump', dd.broken_column(False))
    s.add('flower-pink', dd.flower(0)); s.add('flower-gold', dd.flower(1)); s.add('flower-white', dd.flower(2)); s.add('grass', dd.grass_tuft())
    sheets['courtyard'] = s
    s = Sheet(256)
    s.add('banner-red', dd.banner('red', 'crown')); s.add('banner-blue', dd.banner('blue', 'diamond'))
    s.add('armour', dd.armour()); s.add('torch', dd.torch())
    s.add('portrait-a', dd.portrait(0)); s.add('portrait-b', dd.portrait(1))
    s.add('column-cap', dd.column_piece('cap')); s.add('column-shaft', dd.column_piece('shaft')); s.add('column-base', dd.column_piece('base'))
    s.add('carpet-drop', dd.carpet_drop(20)); s.add('carpet-mid', dd.carpet('mid')); s.add('carpet-end', dd.carpet('end'))
    sheets['castle'] = s
    s = Sheet(128)
    s.add('barrel-stack', dd.barrel_stack()); s.add('barrel', dd.dark_barrel()); s.add('torch', dd.torch(dark=True))
    s.add('cobweb', dd.cobweb()); s.add('chain', dd.chain()); s.add('chain-end', dd.chain(True))
    sheets['undercroft'] = s
    return sheets


def main():
    for gid, rel, s in looks_sheets():
        save(s.image(), rel)
        write_json('looks/%s.json' % gid, {'//': NOTE, 'id': gid, 'image': rel, 'looks': s.looks()})
    sheets = decor_sheets()
    for name, s in sheets.items():
        save(s.image(), 'decor/%s.png' % name)
    for rid, R in place_all().items():
        items = []
        for it in R.items:
            x, y, w, h = sheets[it['sheet']].rects[it['name']]
            items.append({'image': 'decor/%s.png' % it['sheet'], 'src': [x, y, w, h], 'tx': it['tx'], 'ty': it['ty'],
                          'dx': it['dx'], 'dy': it['dy'], 'layer': it['layer'], 'flip': it['flip']})
        write_json('decor/%s.json' % rid, {'//': NOTE_DECOR, 'id': rid, 'items': items})
    return sheets


if __name__ == '__main__':
    main()
    print('props: looks and decor written')
