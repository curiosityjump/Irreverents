#!/usr/bin/env python3
"""Records the forest's scripted clears and its game over (Step 15 push 3, re-recorded in push 5 when the
quiet way's stump and limb changed the trail) with walkbot.ts, then replays each with events.ts and writes its
claims from what the run did. Usage: SCRATCH=<dir> mk_clears.py [name-regex]. DRAFT.
The quiet clear (step15-unseen-clear) is recorded by scripts/stage-quiet-forest.ts, not here."""
import json, re, subprocess, sys, os
S = os.environ.get('SCRATCH', '/tmp')
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
pick = re.compile(sys.argv[1] if len(sys.argv) > 1 else '.')
FT = 'forest-trail'
WALK = [{"room": FT, "toCol": 3, "dir": 1}, {"room": FT, "toCol": 11}, {"climb": 5},
        {"room": FT, "toCol": 22}, {"hold": 1, "n": 30, "jump": True},
        {"room": FT, "toCol": 97}, {"room": FT, "toCol": 20}, {"wait": 10}, {"mark": "end"}]


def bot(plan):
    open(f'{S}/plan.json', 'w').write(json.dumps(plan))
    out = subprocess.run(['node', f'{R}/tools/scenario-bots/walkbot.ts', f'{S}/plan.json'], cwd=R, capture_output=True, text=True)
    sys.stderr.write(out.stderr[-400:])
    return json.loads(out.stdout)


def events(id_, types):
    out = subprocess.run(['node', f'{R}/tools/scenario-bots/events.ts', id_, types], cwd=R, capture_output=True, text=True, check=True)
    return [json.loads(l) for l in out.stdout.splitlines() if l.strip()]


def path(id_):
    return f"{R}/scenarios/{id_}.json"


def clear(id_, hero, fight, claims):
    if not pick.search(id_):
        return
    old = json.load(open(path(id_)))
    r = bot({"hero": hero, "room": "forest-road", "spawn": 1, "placements": True, "placedRooms": [FT], "fight": fight, "legs": WALK, "max": 6000})
    t = r['marks']['end']['tick'] + 40
    sc = {k: old[k] for k in ('id', 'proves', 'room', 'placements', 'placedRooms', 'players')}
    sc.update({"inputs": r["inputs"], "ticks": t, "expect": [{"fact": "event", "event": "stage-cleared", "between": [0, t], "count": [0, 99]}]})
    open(path(id_), 'w').write(json.dumps(sc, indent=1) + '\n')
    evs = events(id_, 'stage-cleared,outpost-wave,game-over,defeated')
    c = [e for e in evs if e['type'] == 'stage-cleared']
    assert len(c) == 1, (id_, c)
    sc['expect'] = claims(c[0], evs, t)
    open(path(id_), 'w').write(json.dumps(sc, indent=1) + '\n')
    print(id_, {k: c[0][k] for k in ('ticks', 'defeated', 'alarms', 'unseen', 'stars', 'best')}, 'waves', sum(e['type'] == 'outpost-wave' for e in evs))


def where(c, keys):
    return {k: c[k] for k in keys}


clear('step15-cleared', 'grappler', True, lambda c, evs, t: [
    {"fact": "event-where", "event": "stage-cleared", "where": where(c, ('stage', 'player', 'ticks', 'defeated', 'alarms', 'tries', 'unseen', 'hoard', 'stars', 'best')), "between": [c['tick'] - 10, c['tick'] + 10], "count": [1, 1]},
    {"fact": "event", "event": "stage-cleared", "between": [0, t], "count": [1, 1]},
    {"fact": "event-where", "event": "game-over", "where": {}, "between": [0, t], "count": [0, 0]},
    {"fact": "stage", "stage": "bramble-forest", "at": c['tick'] - 20, "state": "running", "best": None},
    {"fact": "stage", "stage": "bramble-forest", "at": t, "state": "cleared", "tries": 0, "best": {"stars": c['stars'], "ticks": c['ticks']}},
    {"fact": "in-room", "player": "a", "at": t, "room": FT},
])
clear('step15-clear-best', 'infiltrator', True, lambda c, evs, t: [
    {"fact": "event-where", "event": "stage-cleared", "where": where(c, ('stage', 'player', 'ticks', 'alarms', 'tries', 'stars')), "between": [c['tick'] - 10, c['tick'] + 10], "count": [1, 1]},
    {"fact": "event-where", "event": "game-over", "where": {}, "between": [0, t], "count": [0, 0]},
    {"fact": "event-where", "event": "outpost-wave", "where": {"outpost": "forest-trail"}, "between": [0, c['tick']], "count": [n := sum(e['type'] == 'outpost-wave' for e in evs if e['tick'] <= c['tick']), n]},
])
clear('step15-clear-slow', 'grappler', False, lambda c, evs, t: [
    {"fact": "event-where", "event": "stage-cleared", "where": where(c, ('stage', 'player', 'ticks', 'alarms', 'tries', 'defeated', 'stars')), "between": [c['tick'] - 10, c['tick'] + 10], "count": [1, 1]},
    {"fact": "event-where", "event": "game-over", "where": {}, "between": [0, t], "count": [0, 0]},
])
