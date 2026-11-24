"""Cuts the phone's touch buttons from the approved P07 UI atlas (brief: owner-better-buttons).

DRAFT: every choice here (sizes, the pressed look, which glyph goes on which
plate) is a first pass, revisable without touching the game: the game reads
assets/ui/touch/p07/<name>.png when it exists and today's U08 picture
(assets/ui/touch/<name>.png) when it does not (src/client/touch.ts).

Run from the repository root:  python3 -I tools/art/touch/cut.py [outdir] [stick] [swap]
  outdir  default assets/ui/touch/p07
  stick   'keys' (P07 arrow keys) or 'dpad' (P07 d-pad keys); default dpad
  swap    also write swap.png (P05's swap arrows; for the contact sheet only)

Sources (docs/mechanisms/asset-coverage.md, "UI and HUD"):
  P07 irreverents-pixel-ui-atlas.png: round buttons boot (jump), sword
    (attack), star; d-pad (24..260, 855..1062); arrow keys (770..1138, 915..1008).
  The clean round plate is re-authored from the three round buttons: per
    pixel, the mean of the samples no glyph covers; where all three are
    covered, the median of that ring.
  Glyphs with no P07 source: grab = U08's hand (assets/ui/touch/grab.png),
    use = today's DRAFT Use hand (assets/ui/use.png; MA-01), switch = P05's
    swap arrows (p05-ui-hero-party-hud-source.png (353,284,431,344)).
Deterministic: two runs give the same bytes.
"""
import math
import os
import sys

import numpy as np
from PIL import Image

ROOT = 'docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/'
P07 = ROOT + 'p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/irreverents-pixel-ui-atlas.png'
P05 = ROOT + 'p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-ui-hero-party-hud-source.png'

N = 24          # the frame, art pixels (shell.ts draws 24x24 at whole device pixels)
D = 22          # the plate's diameter in the frame
R_SRC = 80      # the round buttons' radius in the atlas, measured
CENTRES = {'boot': (352, 965), 'sword': (510, 963), 'star': (666, 963)}
OUTLINE = (24, 26, 52, 255)
PRESS = 0.7     # DRAFT: how much a pressed plate darkens


def load(path):
    return np.array(Image.open(path).convert('RGBA')).astype(np.float64)


def crop_round(atlas, c):
    cx, cy = c
    return atlas[cy - R_SRC:cy + R_SRC, cx - R_SRC:cx + R_SRC].copy()


def polar(n):
    y, x = np.mgrid[0:n, 0:n] + 0.5
    return np.hypot(x - n / 2, y - n / 2)


def clean_plate(crops):
    """The plate with no glyph: per pixel, the mean of the crops whose pixel is plate-coloured."""
    n = crops[0].shape[0]
    rad = polar(n)
    ring = np.round(rad).astype(int)
    stack = np.stack(crops)                          # 3 x n x n x 4
    # Ring median over all three: mostly plate, since glyphs cover a minority of each ring.
    med = np.zeros((n, n, 4))
    for r in range(ring.max() + 1):
        m = ring == r
        if m.any():
            med[m] = np.median(stack[:, m].reshape(-1, 4), axis=0)
    dist = np.abs(stack[..., :3] - med[None, ..., :3]).sum(-1)
    ok = dist < 60
    cnt = ok.sum(0)
    out = med.copy()
    s = (stack * ok[..., None]).sum(0)
    have = cnt > 0
    out[have] = s[have] / cnt[have][:, None]
    return out


def shrink(src, size):
    """Area-average a premultiplied source down to size x size."""
    a = src[..., 3:4] / 255.0
    pre = np.concatenate([src[..., :3] * a, a * 255.0], -1)
    im = Image.fromarray(np.clip(pre, 0, 255).astype(np.uint8), 'RGBA')
    small = np.array(im.resize((size, size), Image.Resampling.BOX)).astype(np.float64)
    al = small[..., 3:4] / 255.0
    rgb = np.where(al > 0, small[..., :3] / np.maximum(al, 1e-6), 0)
    return np.concatenate([rgb, small[..., 3:4]], -1)


def disc_mask(n, d, oy=0.0):
    y, x = np.mgrid[0:n, 0:n] + 0.5
    return np.hypot(x - n / 2, y - (n / 2 + oy)) <= d / 2


def finish(px, mask):
    """Hard alpha inside the disc, a 1-px dark outline on its edge, few colours."""
    out = np.zeros((N, N, 4))
    out[mask] = px[mask]
    out[mask, 3] = 255
    edge = mask & ~(np.roll(mask, 1, 0) & np.roll(mask, -1, 0) & np.roll(mask, 1, 1) & np.roll(mask, -1, 1))
    out[edge] = OUTLINE
    return out


def plate_glyph(plate_src, glyph_rgba, glyph_box, pressed):
    """A frame: the shrunken plate with a glyph (N x N RGBA, transparent where absent) over it."""
    oy = 1.0 if pressed else 0.0
    mask = disc_mask(N, D, oy)
    p = shrink(plate_src, D)
    if pressed:
        # DRAFT: the pressed look: the plate darkens and sinks a pixel, as if pushed in.
        p[..., :3] = p[..., :3] * PRESS
    full = np.zeros((N, N, 4))
    o = (N - D) // 2
    full[o + int(oy):o + int(oy) + D, o:o + D] = p
    if glyph_rgba is not None:
        g = np.roll(glyph_rgba, int(oy), 0)
        a = g[..., 3:4] / 255.0
        full[..., :3] = full[..., :3] * (1 - a) + g[..., :3] * a
    return finish(full, mask)


def whole_button(atlas_crop, pressed):
    """A P07 round button as it is (plate and glyph), shrunk."""
    oy = 1.0 if pressed else 0.0
    mask = disc_mask(N, D, oy)
    p = shrink(atlas_crop, D)
    full = np.zeros((N, N, 4))
    o = (N - D) // 2
    full[o + int(oy):o + int(oy) + D, o:o + D] = p
    if pressed:
        plate = whole_button.plate_small
        # The glyph keeps its colours: only the blue-lilac plate darkens.
        glyphy = (np.abs(p[..., :3] - plate[..., :3]).sum(-1) > 40) | (p[..., 2] - p[..., 0] < 20)
        lit = p.copy()
        lit[..., :3] = p[..., :3] * PRESS
        lit[glyphy] = p[glyphy]
        full[o + 1:o + 1 + D, o:o + D] = lit
    return finish(full, mask)


U08_PLATE = {(28, 51, 71), (207, 232, 216), (240, 248, 230), (255, 255, 255)}


def u08_glyph(path):
    """The glyph of a U08-style 24x24 button: every pixel that is not its plate."""
    im = np.array(Image.open(path).convert('RGBA').crop((0, 0, 24, 24))).astype(np.float64)
    g = np.zeros_like(im)
    keep = np.zeros((24, 24), bool)
    for y in range(24):
        for x in range(24):
            r, gg, b, a = im[y, x]
            if a == 0 or (int(r), int(gg), int(b)) in U08_PLATE:
                continue
            keep[y, x] = True
    # The plate's own dark ring pixels (37,48,74) count only next to a glyph colour.
    dark = (im[..., 0] == 37) & (im[..., 1] == 48) & (im[..., 2] == 74)
    core = keep & ~dark
    near = np.zeros_like(core)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            near |= np.roll(np.roll(core, dy, 0), dx, 1)
    keep = core | (dark & near)
    g[keep] = im[keep]
    g[keep, 3] = 255
    return g


def p05_swap():
    """P05's two curved swap arrows, keyed off the pale ground, shrunk to about 14 px."""
    src = load(P05)[284:344, 353:431]
    # Key the pale, low-saturation ground.
    mx = src[..., :3].max(-1)
    mn = src[..., :3].min(-1)
    ground = (mn > 200) & (mx - mn < 40)
    src[ground] = 0
    h, w = src.shape[:2]
    side = max(h, w)
    pad = np.zeros((side, side, 4))
    pad[(side - h) // 2:(side - h) // 2 + h, (side - w) // 2:(side - w) // 2 + w] = src
    g = shrink(pad, 14)
    g[..., 3] = np.where(g[..., 3] > 110, 255, 0)
    full = np.zeros((N, N, 4))
    full[5:19, 5:19] = g
    return full


def key_cut(atlas, box, pressed, size=22):
    """A P07 square key (arrow key or d-pad key): its opaque body, shrunk to fit size x size."""
    x0, y0, x1, y1 = box
    src = atlas[y0:y1, x0:x1].copy()
    # The atlas's halo is blue/red fringe outside the key's dark outline: keep only the
    # connected body (alpha and not fringe-saturated) by a flood from the centre.
    h, w = src.shape[:2]
    a = src[..., 3] > 160
    seen = np.zeros_like(a)
    stack = [(h // 2, w // 2)]
    while stack:
        y, x = stack.pop()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or not a[y, x]:
            continue
        seen[y, x] = True
        stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    src[~seen] = 0
    ys, xs = np.nonzero(seen)
    src = src[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = src.shape[:2]
    side = max(h, w)
    pad = np.zeros((side, side, 4))
    pad[(side - h) // 2:(side - h) // 2 + h, (side - w) // 2:(side - w) // 2 + w] = src
    p = shrink(pad, size)
    mask = p[..., 3] > 120
    full = np.zeros((N, N, 4))
    fm = np.zeros((N, N), bool)
    o = (N - size) // 2
    oy = 1 if pressed else 0
    if pressed:
        lum = p[..., :3].sum(-1)
        body = (lum > 360) & (lum < 640)   # the lilac body, not the white arrow or the outline
        p[body, :3] = p[body, :3] * PRESS
    full[o + oy:o + oy + size, o:o + size] = p
    fm[o + oy:o + oy + size, o:o + size] = mask
    out = np.zeros((N, N, 4))
    out[fm] = full[fm]
    out[fm, 3] = 255
    edge = fm & ~(np.roll(fm, 1, 0) & np.roll(fm, -1, 0) & np.roll(fm, 1, 1) & np.roll(fm, -1, 1))
    out[edge] = OUTLINE
    return out


# Measured boxes (x0, y0, x1, y1) in the P07 atlas.
DPAD = {'left': (24, 918, 104, 1002), 'right': (180, 918, 260, 1002)}
KEYS = {'left': (956, 915, 1045, 1008), 'right': (1049, 915, 1138, 1008)}


def strip(normal, pressed):
    s = np.concatenate([normal, pressed], 1)
    return Image.fromarray(np.clip(np.round(s), 0, 255).astype(np.uint8), 'RGBA')


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'assets/ui/touch/p07'
    stick = sys.argv[2] if len(sys.argv) > 2 else 'dpad'
    os.makedirs(out, exist_ok=True)
    atlas = load(P07)
    crops = {k: crop_round(atlas, c) for k, c in CENTRES.items()}
    plate = clean_plate(list(crops.values()))
    whole_button.plate_small = shrink(plate, D)
    files = {
        'jump': [whole_button(crops['boot'], f) for f in (False, True)],
        'attack': [whole_button(crops['sword'], f) for f in (False, True)],
        'grab': [plate_glyph(plate, u08_glyph('assets/ui/touch/grab.png'), None, f) for f in (False, True)],
        'use': [plate_glyph(plate, u08_glyph('assets/ui/use.png'), None, f) for f in (False, True)],
        # DRAFT: Switch keeps a star, as today (U08's special); P05's swap arrows were cut
        # too (`swap`) but read as a gold blob at 24 px (contact sheet, step-5-shots/buttons/).
        'special': [whole_button(crops['star'], f) for f in (False, True)],
    }
    if 'swap' in sys.argv[3:]:
        files['swap'] = [plate_glyph(plate, p05_swap(), None, f) for f in (False, True)]
    boxes = DPAD if stick == 'dpad' else KEYS
    for side in ('left', 'right'):
        files[side] = [key_cut(atlas, boxes[side], f) for f in (False, True)]
    for name, (n, p) in files.items():
        strip(n, p).save(os.path.join(out, f'{name}.png'), optimize=False)
    print(f'wrote {len(files)} strips to {out} (stick: {stick})')


if __name__ == '__main__':
    main()
