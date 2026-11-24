#!/usr/bin/env python3
"""Records Step 15 push 2 scenarios with walkbot.ts. Usage: mk_insides.py [name-regex]"""
import json, re, subprocess, sys
S = __import__('os').environ.get('SCRATCH', '/tmp')
R = __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', '..'))
pick = re.compile(sys.argv[1] if len(sys.argv) > 1 else '.')
FT = 'forest-trail'
CRATE = {"id": "crate", "character": "crate-heavy", "room": FT, "tile": [55, 8]}
BOULDER = {"id": "boulder", "character": "forest-boulder", "room": FT, "tile": [74, 8]}
UPPER_Y = 9 * 16  # feet on the upper trail


def bot(plan):
    open(f'{S}/plan.json', 'w').write(json.dumps(plan))
    out = subprocess.run(['node', f'{R}/tools/scenario-bots/walkbot.ts', f'{S}/plan.json'], cwd=R, capture_output=True, text=True)
    sys.stderr.write(out.stderr)
    return json.loads(out.stdout)


def write(sc):
    if not pick.search(sc['id']):
        return
    open(f"{R}/scenarios/{sc['id']}.json", 'w').write(json.dumps(sc, indent=1) + '\n')
    print('wrote', sc['id'], sc['ticks'])


def ents(es):
    return [{k: v for k, v in e.items() if k != 'room'} for e in es]


def scenario(id_, proves, hero, spawn, legs, expect_fn, entities=(), power=None, extra_ticks=0, max_=4000):
    if not pick.search(id_):
        return
    plan = {"hero": hero, "room": FT, "spawn": spawn, "legs": legs, "max": max_, "entities": list(entities)}
    if power:
        plan["power"] = power
    r = bot(plan)
    m = r['marks']
    ticks = r['ticks'] + extra_ticks
    p = {"id": "a", "character": hero, "spawn": spawn}
    if power:
        p["power"] = power
    sc = {"id": id_, "proves": proves, "room": FT, "players": [p]}
    if entities:
        sc["entities"] = ents(entities)
    sc.update({"inputs": r['inputs'], "ticks": ticks, "expect": expect_fn(m, r, ticks)})
    print(id_, {k: (v['tick'], v['tile'], v['ground']) for k, v in m.items()}, 'end', r['end'])
    write(sc)


# ---- the gap (root tunnel): the infiltrator walks in; the others walk up and do not
for hero in ('infiltrator', 'grappler', 'flyer'):
    fits = hero == 'infiltrator'
    scenario(
        f'step15-gap-{hero}',
        (f"Step 15 signal 3, the gap (size): from the trail by the hatch's spawn... " if False else
         f"Step 15 signal 3, the gap: the {hero}, from the trail's west end, walks east into the root mound's foot without jumping. "
         + ("The crawl is exactly one tile high and the infiltrator (12 px) fits: it runs through and drops into the root tunnel under the trail (area root-tunnel). Control (watched to fail): the crawl made solid (row 8, columns 24-29), and it never gets in"
            if fits else f"The crawl is one tile high and the {hero} does not fit: it stops at the mound's face and never gets under the trail")),
        hero, 0, [{"hold": 1, "n": 240}, {"mark": "end"}],
        (lambda m, r, t: [{"fact": "position", "player": "a", "at": t, "x": [26 * 16, 39 * 16], "y": [13 * 16, 13 * 16]}]) if fits else
        (lambda m, r, t: [{"fact": "position", "player": "a", "at": t, "x": [0, 24 * 16], "y": [UPPER_Y, UPPER_Y]},
                          {"fact": "event", "event": "place-found", "player": "a", "between": [0, t], "count": [0, 0]}]),
    )

# ---- the canopy: the flyer flaps up; the others with the same presses do not
# DRAFT (push 5): the canopy's limb now roofs the trail from column 32 east (the quiet way's boughs run under it),
# so the way up is the open sky over the root mound: from the mound's top (column 29) a jump and three flaps east,
# onto the limb's top, then a walk east along it onto the canopy. CANOPY_WALK is the walk's length in ticks.
canopy_legs = [{"room": FT, "toCol": 29}, {"face": 1}, {"wait": 10}, {"mark": "start"}]
CANOPY_WALK = int(__import__('os').environ.get('CANOPY_WALK', '190'))


def canopy(hero):
    if not pick.search(f'step15-canopy-{hero}'):
        return
    r = bot({"hero": 'flyer', "room": FT, "spawn": 1, "legs": canopy_legs, "max": 2000})
    t0 = r['ticks']
    ins = r['inputs'] + [
        {"player": "a", "from": t0, "to": t0 + 16, "hold": ["jump"]},
        {"player": "a", "from": t0 + 22, "to": t0 + 30, "hold": ["jump"]},
        {"player": "a", "from": t0 + 38, "to": t0 + 46, "hold": ["jump"]},
        {"player": "a", "from": t0 + 54, "to": t0 + 62, "hold": ["jump"]},
        {"player": "a", "from": t0 + 20, "to": t0 + 60, "x": 1},
        {"player": "a", "from": t0 + 80, "to": t0 + 80 + CANOPY_WALK, "x": 1},
    ]
    t = t0 + 120 + CANOPY_WALK
    fits = hero == 'flyer'
    sc = {"id": f'step15-canopy-{hero}',
          "proves": f"Step 15 signal 3, the canopy (height): from the top of the root mound (column 29, nothing higher to climb), a jump and three flaps while moving east, then a walk east: the canopy (columns 46-52, six tiles over the trail) is the top of a long limb that roofs the trail from column 32 east, and the only way onto it is the open sky over the mound. " + (
              "The flyer lands on the limb, walks along it and stands on the canopy. Control (watched to fail): the grappler and the infiltrator with the same presses (step15-canopy-grappler, -infiltrator)" if fits else
              f"The {hero} cannot flap and never lands up there (the flyer with the same presses does: step15-canopy-flyer); the infiltrator may land on the quiet way's boughs under the limb (row 5), never on it"),
          "room": FT, "players": [{"id": "a", "character": hero, "spawn": 1}], "inputs": ins, "ticks": t,
          "expect": ([{"fact": "position", "player": "a", "at": t, "x": [46 * 16, 53 * 16], "y": [3 * 16, 3 * 16]},
                      {"fact": "found", "level": "bramble-forest", "at": t, "pieces": ["forest-2"]}] if fits else
                     [{"fact": "event", "event": "landed", "player": "a", "between": [0, t], "count": [0, 0], "where": {"ty": 3}},
                      {"fact": "position", "player": "a", "at": t, "y": [5 * 16, UPPER_Y]}])}
    write(sc)


for h in ('flyer', 'grappler', 'infiltrator'):
    canopy(h)

# ---- the hatch: the grappler with the heavy crate; the light heroes cannot lift it, and alone on the plate do not get in
scenario(
    'step15-hatch-grappler',
    "Step 15 signal 3, the hatch (weight): the grappler lifts the heavy crate beside the plate (120 against 150), sets it down on the plate (columns 57-58), and the hatch eight tiles east opens and stays open while it rests there; the grappler walks on and drops through into the chamber under the trail. Control (watched to fail): the same run without the crate (the plate comes up as he steps off, stayOpen 0, and the hatch is shut when he reaches it)",
    'grappler', 1,
    [{"room": FT, "toCol": 54}, {"face": 1}, {"grab": True}, {"wait": 10}, {"room": FT, "toCol": 56}, {"grab": True}, {"wait": 20}, {"mark": "set"},
     {"room": FT, "toCol": 66}, {"wait": 60}, {"mark": "in"}],
    lambda m, r, t: [
        {"fact": "event-where", "event": "grabbed", "where": {"target": "crate"}, "between": [0, m['set']['tick']], "count": [1, 1]},
        {"fact": "part", "room": FT, "part": "hatch", "at": m['set']['tick'], "is": {"open": True}},
        {"fact": "position", "player": "a", "at": t, "x": [62 * 16, 74 * 16], "y": [13 * 16, 13 * 16]},
    ],
    entities=[CRATE],
)
for hero in ('infiltrator', 'flyer'):
    scenario(
        f'step15-hatch-{hero}',
        f"Step 15 signal 3, the hatch: the {hero} tries to lift the heavy crate (nothing: it lifts 60), stands on the plate (the hatch opens), then walks east to the hatch: with nobody on the plate it shut the tick it came up (stayOpen 0), so the {hero} walks over it and never gets into the chamber",
        hero, 1,
        [{"room": FT, "toCol": 54}, {"face": 1}, {"grab": True}, {"wait": 10}, {"room": FT, "toCol": 58}, {"wait": 30}, {"mark": "plate"},
         {"room": FT, "toCol": 70}, {"wait": 30}, {"mark": "past"}],
        lambda m, r, t: [
            {"fact": "event", "event": "grabbed", "player": "a", "between": [0, t], "count": [0, 0]},
            {"fact": "part", "room": FT, "part": "hatch", "at": m['plate']['tick'], "is": {"open": True}},
            {"fact": "position", "player": "a", "at": t, "x": [68 * 16, 72 * 16], "y": [UPPER_Y, UPPER_Y]},
        ],
        entities=[CRATE],
    )

# ---- the later thing: each hero alone fails; the boost lifts the boulder
for hero in ('grappler', 'infiltrator', 'flyer'):
    scenario(
        f'step15-later-{hero}',
        f"Step 15 signal 4, the later thing: the {hero} alone tries to lift the boulder (300: nobody lifts it without a power; the grappler lifts 150), stands on the heavy plate (needs 260; it reads only the {hero}'s own weight) and walks on over the stone slab: it stays shut and the {hero} never gets into the hollow",
        hero, 1,
        [{"room": FT, "toCol": 72}, {"face": 1}, {"grab": True}, {"wait": 10}, {"room": FT, "toCol": 77}, {"wait": 30}, {"mark": "plate"},
         {"room": FT, "toCol": 86}, {"wait": 30}, {"mark": "past"}],
        lambda m, r, t: [
            {"fact": "event", "event": "grabbed", "player": "a", "between": [0, t], "count": [0, 0]},
            {"fact": "part", "room": FT, "part": "stone-door", "at": m['plate']['tick'], "is": {"open": False}},
            {"fact": "position", "player": "a", "at": t, "x": [84 * 16, 88 * 16], "y": [UPPER_Y, UPPER_Y]},
        ],
        entities=[BOULDER],
    )
scenario(
    'step15-later-boost',
    "Step 15 signal 4, the later thing opened by a power: the grappler holding the boost (Step 9; lifts 420) lifts the boulder (300), sets it down on the heavy plate (needs 260) and the stone slab six tiles east opens and stays open; he walks on and drops into the hollow (found: forest-trail/stone-hollow). Control (watched to fail): the same presses without the power (step15-later-grappler is that run's shape: no grab, the slab shut)",
    'grappler', 1,
    [{"room": FT, "toCol": 72}, {"face": 1}, {"grab": True}, {"wait": 10}, {"room": FT, "toCol": 76}, {"grab": True}, {"wait": 20}, {"mark": "set"},
     {"room": FT, "toCol": 84}, {"wait": 60}, {"mark": "in"}],
    lambda m, r, t: [
        {"fact": "event-where", "event": "grabbed", "where": {"target": "boulder"}, "between": [0, m['set']['tick']], "count": [1, 1]},
        {"fact": "part", "room": FT, "part": "stone-door", "at": m['set']['tick'], "is": {"open": True}},
        {"fact": "position", "player": "a", "at": t, "x": [80 * 16, 90 * 16], "y": [13 * 16, 13 * 16]},
        {"fact": "event-where", "event": "place-found", "where": {"place": "forest-trail/stone-hollow"}, "between": [0, t], "count": [1, 1]},
    ],
    entities=[BOULDER], power='boost',
)

# ---- way out of each pocket: the biggest hero started inside gets out by its own moves
for name, spawn, col in (('tunnel', 2, 36), ('chamber', 3, 71), ('hollow', 4, 88)):
    scenario(
        f'step15-way-out-{name}-grappler',
        f"Step 15 signal 5, always a way out: the grappler (the biggest hero, 18 by 30) started inside the {name} under the trail walks to its one-way bough (columns {col}-{col+1}) and jumps up twice on the spot, through the bough and through the one-way patch of the trail's floor above it, and stands on the trail. Control (watched to fail): that patch of floor made solid (row 9, columns {col}-{col+1}), and the same presses leave him inside",
        'grappler', spawn,
        [{"room": FT, "toCol": col}, {"x": 0, "climb": 2}, {"wait": 20}, {"mark": "out"}],
        lambda m, r, t: [{"fact": "position", "player": "a", "at": t, "y": [UPPER_Y, UPPER_Y]}],
    )

# ---- the shortcut: shut from the start before; a crate thrown from the pocket breaks it; then the start walks straight in
scenario(
    'step15-shortcut-shut',
    "Step 15 signal 5, the shortcut before it is used: the grappler walks east from the trail's start along the bottom: the cracked wall (column 14) stops him (a run at 96 px/s is under its break speed of 200) and he never gets into the deepest pocket behind it",
    'grappler', 5, [{"hold": 1, "n": 240}, {"mark": "end"}],
    lambda m, r, t: [
        {"fact": "position", "player": "a", "at": t, "x": [0, 14 * 16], "y": [19 * 16, 19 * 16]},
        {"fact": "event", "event": "part-broken", "between": [0, t], "count": [0, 0]},
    ],
)
scenario(
    'step15-shortcut-opened',
    "Step 15 signal 5, the shortcut used: the infiltrator in the deepest pocket picks up the crate lying there and throws it west into the cracked wall (column 14); it breaks for good; the infiltrator walks west through it to the trail's start, and then back east from the start straight into the pocket. Control (watched to fail): the same presses with no crate in the pocket, and the wall stands",
    'infiltrator', 6,
    [{"room": FT, "toCol": 23}, {"face": -1}, {"grab": True}, {"wait": 10}, {"attack": True}, {"wait": 60}, {"mark": "thrown"},
     {"room": FT, "toCol": 5}, {"mark": "start"}, {"room": FT, "toCol": 20}, {"wait": 10}, {"mark": "back"}],
    lambda m, r, t: [
        {"fact": "event-where", "event": "part-broken", "where": {"room": FT, "part": "shortcut-wall"}, "between": [0, m['thrown']['tick']], "count": [1, 1]},
        {"fact": "position", "player": "a", "at": m['start']['tick'], "x": [0, 8 * 16], "y": [19 * 16, 19 * 16]},
        {"fact": "position", "player": "a", "at": t, "x": [19 * 16, 22 * 16], "y": [19 * 16, 19 * 16]},
    ],
    entities=[{"id": "crate", "character": "crate", "room": FT, "tile": [22, 18]}],
)
