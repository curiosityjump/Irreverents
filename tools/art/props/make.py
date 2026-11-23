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
import round3 as r3
import drive as dv
import loops as lo
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
        s.add('door-enter-%dx%d' % (w, h), dv.door_enter(w, h))  # P07 vibrant
    for (w, h) in sorted(sz['window']):
        s.add('window-%dx%d' % (w, h), lp.window(w, h))
        s.add('window-broken-%dx%d' % (w, h), lp.window(w, h, True))
    # the throne room's own window (its part id is "window"): stained glass
    s.add('part:throne-room:window', lp.stained(1, 3))
    s.add('part:throne-room:window:broken', lp.stained(1, 3, True))
    # round 3: the one-tile hiding places are all in the quarry: rubble over a crevice, not a curtain
    hide = lambda w, h: dv.hide_1x1() if (w, h) == (1, 1) else lp.curtain(w, h)
    front = lambda w, h: dv.hide_front_1x1() if (w, h) == (1, 1) else r2.hide_front(w, h, lp.curtain(w, h))
    for (w, h) in sorted(sz['hide']):
        s.add('hide-%dx%d' % (w, h), hide(w, h))
    for (w, h) in sorted(sz['hide']):
        s.add('hide-front-%dx%d' % (w, h), front(w, h))
    s.newrow()
    # Drive-first (owner, 2026-11-23): the bell, plates, gate, counter, goods and rubble are cut from P04/P07
    s.add('bell', dv.bell())
    s.add('bell-ringing', dv.bell_ringing(), frames=4, fps=10)
    s.add('bell-broken', dv.bell_broken())
    s.newrow()
    s.add('plate-up', dv.plate(False)); s.add('plate-down', dv.plate(True))
    s.add('gate-closed', dv.gate(False)); s.add('gate-open', dv.gate(True))
    s.add('crack-1', lp.crack(0)); s.add('crack-2', lp.crack(1)); s.add('rubble', dv.rubble())
    s.add('shop-counter', dv.shop_counter()); s.add('shop-goods', dv.shop_goods())
    out = [('parts', 'props/parts.png', s)]
    # ---- round 3: the horn on the camp's post (src/client/draw/outpost.ts draws it bottom-centre over 2x3 tiles)
    s = Sheet(160)
    work, sound, broken = r3.signaler_frames()
    s.add('signaler', work); s.add('signaler-sounding', sound, frames=3, fps=12); s.add('signaler-broken', broken)
    out.append(('outpost', 'props/outpost.png', s))
    # ---- Step 14 slice A's level entrances (drive.py: P05 secrets row 1, P05 HUD rings' colours, P07 sign)
    s = Sheet(160)
    for which in dv.ENTRIES:
        s.add('level-entry-' + which, dv.level_entry(which))
    s.newrow()
    for n in range(5):
        s.add('level-pie-%d' % n, dv.level_pie(n))
    s.add('level-sign', dv.level_sign())
    out.append(('levels', 'props/levels.png', s))
    # ---- the core loops' rides (loops.py: P04 vehicle-and-mount sheet; handoff-prompts/loop-art-cutouts.md)
    s = Sheet(192)
    for which in lo.RIDES:
        s.add('ride-%s-idle' % which, lo.ride(which, 'idle'))
        s.add('ride-%s-moving' % which, lo.ride(which, 'moving'), frames=2, fps=8)
        s.add('ride-%s-crash' % which, lo.ride(which, 'crash'))
        s.newrow()
        s.add('ride-%s-wrecked' % which, lo.ride(which, 'wrecked'))
        s.newrow()
    out.append(('rides', 'props/rides.png', s))
    # ---- the core loops' powers and pickups (loops.py: P05 rare-powers-pickups)
    s = Sheet(216)
    for which in lo.ORBS:
        s.add('pickup-' + which, lo.orb(which))
    s.newrow()
    for which in lo.ITEMS:
        s.add('item-' + which, lo.fit_item(lo.item(which)))
    s.newrow()
    for which in lo.FIXTURES:
        s.add('power-fixture-' + which, lo.fixture(which))
    s.newrow()
    s.add('fx-pickup-glow', lo.pickup_glow(), frames=3, fps=6)
    s.add('fx-pickup-get', lo.pickup_get(), frames=3, fps=12)
    s.add('fx-power-lost', lo.power_lost(), frames=3, fps=10)
    s.newrow()
    s.add('fx-poof', lo.poof(), frames=3, fps=12)
    out.append(('powers', 'props/powers.png', s))
    # ---- the core loops' treasure (loops.py: P07 vibrant chests, doors, key, gold; P04 coin heap, gem; P05 doors, cave)
    s = Sheet(192)
    for which in lo.CHESTS:
        s.add(which, lo.chest(which))
    s.newrow()
    for which in list(lo.DOORS) + list(lo.P05DOORS):
        s.add(which, lo.door(which))
    s.newrow()
    s.add('key', lo.key()); s.add('gold-coin', lo.coin(), frames=2, fps=4); s.add('gold-sack', lo.gold_sack())
    s.add('gold-pile', lo.gold_pile()); s.add('gem', lo.gem()); s.add('gem-pedestal', lo.gem_pedestal())
    s.newrow()
    s.add('hoard', lo.hoard(False)); s.add('hoard-taken', lo.hoard(True)); s.add('vault-cave', lo.vault_cave())
    out.append(('treasure', 'props/treasure.png', s))
    # ---- people
    s = Sheet(96)
    # round 3: moods bold enough for any hat or plume (a white '?' and a sweat drop; a red mark rimmed white)
    s.add('mood-2', r3.mood2(), frames=2, fps=3); s.add('mood-3', r3.mood3(), frames=2, fps=6)
    s.add('away-dots', lq.away_dots(), frames=4, fps=4)
    s.newrow()
    s.add('bark', lq.bark()); s.add('ribbon', lq.ribbon()); s.add('bark-tail', lq.bark_tail())
    s.add('player-mark', lq.player_mark())  # round 3: the alert pips moved to the HUD sheet (ui)
    s.newrow()
    s.add('shadow-s', lq.shadow(12, 4)); s.add('shadow-m', lq.shadow(18, 5)); s.add('shadow-l', lq.shadow(26, 6))
    out.append(('people', 'props/people.png', s))
    # ---- fx
    # round 2: hits you feel (handoff-prompts/look2-props.md, section 3.1)
    s = Sheet(160)
    s.add('fx-hit', dv.fx_hit(), frames=5, fps=18)  # P03 vfx atlas
    s.newrow()
    s.add('fx-slash', r2.fx_slash(), frames=5, fps=20)
    s.newrow()
    s.add('fx-swing-grappler', r2.fx_swing_grappler(), frames=3, fps=16)
    s.add('fx-land', lq.fx_land(), frames=4, fps=15)
    s.newrow()
    s.add('fx-dust', dv.fx_dust(), frames=5, fps=15)  # P03 vfx atlas
    s.newrow()
    # round 3: a tumble, a dizzy landing, a ringing bell
    s.add('fx-speed', dv.fx_speed(), frames=3, fps=15); s.add('fx-dizzy', dv.fx_dizzy(), frames=4, fps=8)  # P05 brawl
    s.newrow()
    s.add('fx-clang', r3.fx_clang(), frames=3, fps=12)
    out.append(('fx', 'fx/fx.png', s))
    # round 2: the game's own pixel font, dark on paper and light with a shadow on the ribbon
    s = Sheet(570)
    s.add('font-dark', r2.font_strip(True), frames=95)
    s.newrow()
    s.add('font-light', r2.font_strip(False), frames=95)
    out.append(('font', 'ui/font.png', s))
    # ---- ui: the whole 48 x 24 picture is the look (normal, then pressed), as assets/ui/touch/ are.
    # Round 3: the HUD sheet (assets/ui/hud.png) holds it too, with the faces, plate, icons, pips, gauge and chip;
    # assets/ui/use.png is still written, as content/actions/interact.json's icon.
    s = Sheet(96)
    s.add('ui-use', lq.ui_use())
    s.add('hud-plate', r3.hud_plate(40, 20))
    s.newrow()
    for who in r3.FACES:  # Drive-first: each face cut from its own sprite (drive.hud_face)
        s.add('hud-face-' + who, dv.hud_face(who))
    s.newrow()
    s.add('hud-ko', dv.hud_ko()); s.add('hud-fall', dv.hud_fall())  # P05 brawl skull badges
    s.add('alert-pip', dv.alert_pip(True)); s.add('alert-pip-off', dv.alert_pip(False))  # P07 UI atlas
    s.add('bell-gauge', r3.bell_gauge()); s.add('bark-edge', r3.bark_edge())
    out.append(('ui', 'ui/hud.png', s))
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
    s.add('tree', dd.tree()); s.add('ruin-arch', r3.ruin_arch()); s.add('column-broken', r3.ruin_column())  # round 3: re-cut from P03
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
    # round 3 (handoff-prompts/look3-props.md): the cantina, the camp, the quarry
    c = r3.cantina_pieces()
    s = Sheet(256)
    for name in ('bar', 'bar-bottles', 'kegs', 'shelf-bottles', 'shelf-plates', 'keg', 'barrel', 'table', 'table-mug',
                 'stool', 'swag', 'curtain', 'banner', 'bunting', 'mirror'):
        s.add(name, c[name])
    s.newrow()
    s.add('chandelier-hung', r3.hang(c['chandelier'], 48 - c['chandelier'].height))
    s.add('lantern-hung', r3.hang(c['lantern'], 48 - c['lantern'].height))
    s.add('glow-22', r3.glow(22)); s.add('glow-14', r3.glow(14))
    sheets['tavern'] = s
    s = Sheet(256)
    s.add('tent', r3.tent()); s.add('tent-blue', r3.tent(30, 26, 'blue')); s.add('flag', dv.camp_flag())  # flag: P07
    s.add('rack', r3.weapon_rack()); s.add('fire', dv.camp_fire()); s.add('crate', r3.crate())  # fire: P08 biome brazier
    s.add('palisade', r3.palisade()); s.add('glow-20', r3.glow(20))
    sheets['camp'] = s
    s = Sheet(160)
    s.add('rocks', dv.rocks()); s.add('rocks-small', dv.rocks(False)); s.add('scaffold', r3.scaffold())  # rocks: P07 platformer boulders
    s.add('lantern-hung', r3.hang(c['lantern'], 32 - c['lantern'].height)); s.add('glow-14', r3.glow(14))
    sheets['quarry'] = s
    return sheets


def main():
    use = new(48, 24)
    paste(use, lq.ui_use(), 0, 0)
    save(use, 'ui/use.png')
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
