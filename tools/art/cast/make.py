"""Draws the cast's sprite sheets and writes their content files.

    python3 -I tools/art/cast/make.py

DRAFT: every picture here is a stand-in (docs/mechanisms/art-pipeline.md).
Rewrites assets/sprites/cast/*.png and content/sprites/<id>.json for the
king, guard, shopkeeper, villain, crate, crate-heavy, dummy, dummy-heavy and
throne. Deterministic: the same bytes every run.
"""
import json
import os
import sys

sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))

from PIL import Image  # noqa: E402
from px import render, extent  # noqa: E402
from people import PEOPLE  # noqa: E402
from things import THINGS  # noqa: E402

COLS = 8
# Sheet rows, in order. A name ending in 2 or 3 is that state in mood 2 or 3.
PEOPLE_ROWS = ['idle', 'run', 'air', 'hurt', 'down', 'held', 'talk', 'attack',
               'idle2', 'run2', 'talk2', 'idle3', 'run3', 'talk3']
FPS_BY = {'idle': 6, 'run': 12, 'attack': 14, 'hurt': 10, 'down': 2, 'held': 10, 'talk': 9, 'air': 8}


def build_all():
    """-> {id: dict(cell, box, rows=[(name, [Frame])], fps_by)}"""
    out = {}
    for cid, spec in PEOPLE.items():
        A = spec['anims']()
        rows = [(name, [spec['build'](p) for p in A[name]]) for name in PEOPLE_ROWS if name in A]
        out[cid] = dict(cell=spec['cell'], box=spec['box'], rows=rows, person=True)
    for cid, spec in THINGS.items():
        out[cid] = dict(cell=spec['cell'], box=spec['box'], rows=spec['rows'](), person=False, alias=spec.get('alias', {}))
    return out


def sheet(spec):
    c = spec['cell']
    img = Image.new('RGBA', (COLS * c, len(spec['rows']) * c), (0, 0, 0, 0))
    ox, oy = c // 2, c
    for ri, (_, frames) in enumerate(spec['rows']):
        for ci, f in enumerate(frames):
            x0, y0, x1, y1 = extent(f)
            if x0 < -ox or x1 > c - ox or y0 < -oy or y1 > 0:
                raise SystemExit('a frame of row %d does not fit its %d px cell: %r' % (ri, c, (x0, y0, x1, y1)))
            cellimg = render(f, c, c, ox, oy)
            img.paste(cellimg, (ci * c, ri * c))
    return img


def content(cid, spec):
    c = spec['cell']
    bw, bh = spec['box']
    frames, moods = {}, {}
    for ri, (name, fr) in enumerate(spec['rows']):
        nums = [ri * COLS + i for i in range(len(fr))]
        if name[-1] in '23':
            moods.setdefault(name[-1], {})[name[:-1]] = nums
        else:
            frames[name] = nums
    for k, v in spec.get('alias', {}).items():
        frames[k] = frames[v]
    frames = {k: frames[k] for k in ['idle', 'run', 'air'] + [k for k in frames if k not in ('idle', 'run', 'air')]}
    if spec['person'] and len(frames['air']) == 2:
        frames['jump'] = [frames['air'][0]]
        frames['fall'] = [frames['air'][1]]
    doc = {
        '//': 'DRAFT: stand-in drawn by tools/art/cast/make.py; a delivered sheet replaces it by editing this file.',
        'id': cid,
        'image': 'sprites/cast/%s.png' % cid,
        'cell': {'w': c, 'h': c},
        'anchor': {'x': (c - bw) // 2, 'y': c - bh},
        'fps': 8,
        'frames': frames,
        'fpsBy': {k: v for k, v in FPS_BY.items() if k in frames and len(frames[k]) > 1},
    }
    if moods:
        doc['moods'] = moods
    return doc


def dump(doc):
    # one state per line, so a diff reads
    lines = ['{']
    keys = list(doc.keys())
    for k in keys:
        v = doc[k]
        if k in ('frames',) or k == 'moods':
            if k == 'frames':
                inner = ',\n'.join('    %s: %s' % (json.dumps(n), json.dumps(f)) for n, f in v.items())
            else:
                inner = ',\n'.join('    %s: %s' % (json.dumps(n), json.dumps(f)) for n, f in v.items())
            s = '  %s: {\n%s\n  }' % (json.dumps(k), inner)
        else:
            s = '  %s: %s' % (json.dumps(k), json.dumps(v))
        lines.append(s + (',' if k != keys[-1] else ''))
    lines.append('}')
    return '\n'.join(lines) + '\n'


def main():
    os.makedirs(os.path.join(ROOT, 'assets', 'sprites', 'cast'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'content', 'sprites'), exist_ok=True)
    for cid, spec in build_all().items():
        sheet(spec).save(os.path.join(ROOT, 'assets', 'sprites', 'cast', cid + '.png'), optimize=False)
        with open(os.path.join(ROOT, 'content', 'sprites', cid + '.json'), 'w') as fh:
            fh.write(dump(content(cid, spec)))
        print('wrote', cid, len(spec['rows']), 'rows')


if __name__ == '__main__':
    main()
