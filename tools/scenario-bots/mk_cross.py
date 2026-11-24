#!/usr/bin/env python3
"""Records step15-each-hero-crosses-<hero> with walkbot.ts and writes the scenario."""
import json, subprocess, sys
S = __import__('os').environ.get('SCRATCH', '/tmp')
R = __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', '..'))


def bot(plan):
    open(f'{S}/plan.json', 'w').write(json.dumps(plan))
    out = subprocess.run(['node', f'{R}/tools/scenario-bots/walkbot.ts', f'{S}/plan.json'], cwd=R, capture_output=True, text=True)
    sys.stderr.write(out.stderr)
    return json.loads(out.stdout)


def cross(hero):
    legs = [
        {"room": "courtyard", "toCol": 9}, {"up": True},
        {"room": "forest-trail", "toCol": 3, "dir": 1}, {"mark": "trail"},
        {"room": "forest-trail", "toCol": 11}, {"climb": 5},
        {"room": "forest-trail", "toCol": 22}, {"hold": 1, "n": 30, "jump": True},
        {"room": "forest-trail", "toCol": 97}, {"room": "forest-trail", "toCol": 20}, {"wait": 10}, {"mark": "pocket"},
        {"room": "forest-trail", "toCol": 95}, {"climb": 5},
        {"room": "forest-road", "toCol": 3, "dir": -1}, {"wait": 10}, {"up": True}, {"wait": 30}, {"mark": "home"},
    ]
    r = bot({"hero": hero, "room": "courtyard", "spawn": 2, "legs": legs, "max": 6000})
    m = r['marks']
    assert set(m) == {'trail', 'pocket', 'home'}, m
    assert m['pocket']['room'] == 'forest-trail' and m['pocket']['tile'] == [20, 19] and m['pocket']['ground'], m['pocket']
    assert m['home']['room'] == 'courtyard', m['home']
    sc = {
        "id": f"step15-each-hero-crosses-{hero}",
        "proves": f"Step 15 signal 2: the {hero} alone goes from the courtyard through its new doorway (columns 8-10), along the forest road, up the boughs at the trail's start, east along the trail past the gap, the canopy, the hatch and the stone slab, down the shaft at its east end and west along the deep level to the deepest pocket; then back up the shaft's boughs, west along the trail, down off its west end, out along the road and through the doorway into the courtyard. Recorded by a scripted walker (run right or left, jump at a wall or a gap, jump on the spot under the boughs). Control (watched to fail): a one-tile step made two tiles higher on the road (column 30, row 7 solid), and the walker's same inputs never reach the trail",
        "room": "courtyard",
        "players": [{"id": "a", "character": hero, "spawn": 2}],
        "inputs": r['inputs'],
        "ticks": m['home']['tick'],
        "expect": [
            {"fact": "in-room", "player": "a", "at": m['trail']['tick'], "room": "forest-trail"},
            {"fact": "in-room", "player": "a", "at": m['pocket']['tick'], "room": "forest-trail"},
            {"fact": "standing-on-tile", "player": "a", "at": m['pocket']['tick'], "tile": [20, 19]},
            {"fact": "in-room", "player": "a", "at": m['home']['tick'], "room": "courtyard"},
        ],
    }
    open(f"{R}/scenarios/{sc['id']}.json", 'w').write(json.dumps(sc, indent=1) + '\n')
    print(hero, {k: (v['tick'], v['room'], v['tile']) for k, v in m.items()})


for h in sys.argv[1:]:
    cross(h)
