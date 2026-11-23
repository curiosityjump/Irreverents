"""Draws the party's stand-in sprite sheets and writes the content files that wire them in.

    python3 -I tools/art/heroes/make.py

Rewrites assets/sprites/heroes/<id>.png and content/sprites/<id>.json for the
grappler, the infiltrator, the flyer and the plain hero. Deterministic: the
same code gives the same bytes. The contract is docs/mechanisms/art-pipeline.md.

DRAFT: every sheet is a stand-in drawn by this program; a delivered sheet from
the asset desk replaces one by editing its content/sprites/<id>.json.
"""

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)  # python3 -I does not add the script's folder
sys.dont_write_bytecode = True  # leave no __pycache__ in the repository
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))

import build  # noqa: E402


def main():
    out_dir = os.path.join(ROOT, 'assets', 'sprites', 'heroes')
    json_dir = os.path.join(ROOT, 'content', 'sprites')
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)
    bad = []
    for hero in build.HEROES:
        mod = build.module(hero)
        fr = build.frames(mod)
        bad += build.problems(mod, fr)
        build.sheet(mod, fr).save(os.path.join(out_dir, hero + '.png'), optimize=False)
        doc = {
            '//': 'DRAFT: stand-in drawn by tools/art/heroes/make.py (which also wrote this file; change the numbers there). A delivered sheet replaces it by editing this file.',
            'id': hero,
            'image': 'sprites/heroes/%s.png' % hero,
            'cell': {'w': mod.CELL[0], 'h': mod.CELL[1]},
            'anchor': {'x': mod.ANCHOR[0], 'y': mod.ANCHOR[1]},
            'fps': mod.FPS,
            'frames': build.frame_numbers(mod),
            'fpsBy': mod.FPS_BY,
        }
        with open(os.path.join(json_dir, hero + '.json'), 'w', newline='\n') as f:
            f.write(_dump(doc))
        print('wrote %s: %dx%d cells, %d states' % (hero, mod.CELL[0], mod.CELL[1], len(fr)))
    for b in bad:
        print('PROBLEM: ' + b)
    return 1 if bad else 0


def _dump(doc):
    """JSON with one frame list per line, like the hand-written content files."""
    lines = ['{']
    keys = list(doc.keys())
    for k in keys:
        v = doc[k]
        end = '' if k == keys[-1] else ','
        if k == 'frames':
            lines.append('  "frames": {')
            names = list(v.keys())
            for n in names:
                lines.append('    %s: %s%s' % (json.dumps(n), json.dumps(v[n]), '' if n == names[-1] else ','))
            lines.append('  }' + end)
        else:
            lines.append('  %s: %s%s' % (json.dumps(k), json.dumps(v), end))
    lines.append('}')
    return '\n'.join(lines) + '\n'


if __name__ == '__main__':
    sys.exit(main())
