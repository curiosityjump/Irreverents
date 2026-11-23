"""Lists every enter door's size and every working part's kind, look and tile
rectangle, from content/rooms/*.json. `python3 -I tools/art/props/sizes.py`.
make.py imports rooms() and sizes() from here so the looks it draws always
match the rooms that exist (map rooms and test rooms alike)."""
import glob, json, os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))


def rooms():
    out = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'rooms', '*.json'))):
        r = json.load(open(f))
        out[r['id']] = r
    return out


def rect(room, key, ident):
    """Bounding tile rectangle (tx, ty, w, h) of the legend entries naming this door/part."""
    chars = [c for c, v in room['legend'].items() if isinstance(v, dict) and v.get(key) == ident]
    pts = [(x, y) for y, row in enumerate(room['rows']) for x, ch in enumerate(row) if ch in chars]
    if not pts:
        return None
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return (min(xs), min(ys), max(xs) - min(xs) + 1, max(ys) - min(ys) + 1)


def listing():
    rows = []
    for rid, r in rooms().items():
        for d in r.get('doors') or []:
            rc = rect(r, 'door', d['id'])
            rows.append((rid, 'door', d['id'], d.get('use'), '', rc))
        for p in r.get('parts') or []:
            rc = rect(r, 'part', p['id'])
            rows.append((rid, 'part', p['id'], p['kind'], (p.get('params') or {}).get('look', ''), rc))
    return rows


def sizes():
    """{'door-enter': {(w,h)}, 'window': {(w,h)}, 'hide': {(w,h)}} over every room."""
    out = {'door-enter': set(), 'window': set(), 'hide': set()}
    for rid, what, ident, kind, look, rc in listing():
        if rc is None:
            continue
        if what == 'door' and kind == 'enter':
            out['door-enter'].add((rc[2], rc[3]))
        if what == 'part' and kind == 'breakable' and look == 'window':
            out['window'].add((rc[2], rc[3]))
        if what == 'part' and kind == 'hide':
            out['hide'].add((rc[2], rc[3]))
    return out


if __name__ == '__main__':
    for row in listing():
        print('%-14s %-5s %-18s %-10s %-7s %s' % row)
    for k, v in sizes().items():
        print(k, sorted(v))
