"""DRAFT: a tiny deterministic pixel-puppet rasteriser for the heroes lane.

A figure is a list of parts (ellipses and capsules) with a depth, a colour
ramp and a shading normal. One frame is drawn in four passes, the order the
brief asks for: masks (parts painted back to front into a label map), a
clean-up of one-pixel spurs, an inner-line and shading pass (cel bands from
a light at the top-left, ramp chosen per part), hand-placed pixels (eyes,
mouths, highlights), then a 1 px ink outline around the whole silhouette.

Whole pixels only: alpha is 0 or 255, no blur, no gradients. No clock, no
randomness: the same input gives the same bytes.
"""
import math

import numpy as np

INK = (0x2B, 0x21, 0x40)
INK_SOFT = (0x4A, 0x3A, 0x5E)

# Light from the top-left, a little in front (art-pipeline.md, "Ground rules").
_L = (-0.55, -0.7, 0.45)
_n = math.sqrt(sum(c * c for c in _L))
LIGHT = tuple(c / _n for c in _L)


def hex3(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def ramp(*hexes):
    """A colour ramp, dark -> light. Always four tones (the last repeats if three are given)."""
    cols = [hex3(h) for h in hexes]
    while len(cols) < 4:
        cols.append(cols[-1])
    return cols


class Part:
    __slots__ = ('z', 'ramp', 'kind', 'g', 'back', 'flat', 'noline', 'bias')

    def __init__(self, z, rmp, kind, g, back=0, flat=None, noline=False, bias=0.0):
        self.z = z
        self.ramp = rmp
        self.kind = kind
        self.g = g
        self.back = back  # tones darker than lit (parts behind the body)
        self.flat = flat  # a fixed tone index instead of shading
        self.noline = noline  # no inner line where this part overlaps another
        self.bias = bias  # shifts the light term (+ brighter)


class Figure:
    def __init__(self, w, h):
        self.w = w
        self.h = h
        self.parts = []
        self.pixels = []  # (x, y, rgb) placed after shading, before the outline
        self.post = []  # (x, y, rgb) placed after the outline (may sit on it)

    def ell(self, z, rmp, cx, cy, rx, ry, **kw):
        self.parts.append(Part(z, rmp, 'ell', (cx, cy, max(rx, 0.5), max(ry, 0.5)), **kw))

    def cap(self, z, rmp, x0, y0, x1, y1, r, **kw):
        self.parts.append(Part(z, rmp, 'cap', (x0, y0, x1, y1, max(r, 0.5)), **kw))

    def px(self, x, y, rgb):
        self.pixels.append((int(round(x)), int(round(y)), rgb))

    def transform(self, f, swap):
        """Moves every part through f(x, y) -> (x, y); swap exchanges ellipse radii (a 90 degree turn)."""
        for p in self.parts:
            if p.kind == 'ell':
                cx, cy, rx, ry = p.g
                cx, cy = f(cx, cy)
                p.g = (cx, cy, ry, rx) if swap else (cx, cy, rx, ry)
            else:
                x0, y0, x1, y1, r = p.g
                x0, y0 = f(x0, y0)
                x1, y1 = f(x1, y1)
                p.g = (x0, y0, x1, y1, r)

    # ------------------------------------------------------------------
    def render(self, outline=INK):
        w, h = self.w, self.h
        X, Y = np.meshgrid(np.arange(w) + 0.5, np.arange(h) + 0.5)
        label = np.full((h, w), -1, dtype=np.int32)
        nx = np.zeros((h, w))
        ny = np.zeros((h, w))
        order = sorted(range(len(self.parts)), key=lambda i: (self.parts[i].z, i))
        for i in order:
            p = self.parts[i]
            if p.kind == 'ell':
                cx, cy, rx, ry = p.g
                ux = (X - cx) / rx
                uy = (Y - cy) / ry
                m = ux * ux + uy * uy <= 1.0
                ax, ay = ux, uy
            else:
                x0, y0, x1, y1, r = p.g
                dx, dy = x1 - x0, y1 - y0
                ll = dx * dx + dy * dy
                t = np.zeros_like(X) if ll == 0 else np.clip(((X - x0) * dx + (Y - y0) * dy) / ll, 0, 1)
                qx = X - (x0 + t * dx)
                qy = Y - (y0 + t * dy)
                m = qx * qx + qy * qy <= r * r
                ax, ay = qx / r, qy / r
            label[m] = i
            nx[m] = ax[m]
            ny[m] = ay[m]

        # Clean-up: a pixel hanging on by one side is a jaggy, not a shape.
        for _ in range(2):
            filled = label >= 0
            cnt = np.zeros((h, w), dtype=np.int32)
            cnt[1:, :] += filled[:-1, :]
            cnt[:-1, :] += filled[1:, :]
            cnt[:, 1:] += filled[:, :-1]
            cnt[:, :-1] += filled[:, 1:]
            label[filled & (cnt <= 1)] = -1

        out = np.zeros((h, w, 4), dtype=np.uint8)
        for y in range(h):
            for x in range(w):
                i = label[y, x]
                if i < 0:
                    continue
                p = self.parts[i]
                if p.flat is not None:
                    tone = p.flat
                else:
                    a, b = nx[y, x], ny[y, x]
                    zz = math.sqrt(max(0.0, 1 - a * a - b * b))
                    d = a * LIGHT[0] + b * LIGHT[1] + zz * LIGHT[2] + p.bias
                    tone = 3 if d >= 0.72 else 2 if d >= -0.02 else 1 if d >= -0.5 else 0
                tone -= p.back
                # Inner line: where a part in front of this one begins.
                if not p.noline:
                    for ddx, ddy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        xx, yy = x + ddx, y + ddy
                        if 0 <= xx < w and 0 <= yy < h:
                            j = label[yy, xx]
                            if j >= 0 and j != i:
                                q = self.parts[j]
                                if (q.z, j) > (p.z, i) and not q.noline and q.ramp is not p.ramp:
                                    tone = min(tone, 0)
                tone = max(0, min(3, tone))
                out[y, x, :3] = p.ramp[tone]
                out[y, x, 3] = 255

        for x, y, rgb in self.pixels:
            if 0 <= x < w and 0 <= y < h:
                out[y, x, :3] = rgb
                out[y, x, 3] = 255

        if outline is not None:
            filled = out[:, :, 3] > 0
            ring = np.zeros((h, w), dtype=bool)
            ring[1:, :] |= filled[:-1, :]
            ring[:-1, :] |= filled[1:, :]
            ring[:, 1:] |= filled[:, :-1]
            ring[:, :-1] |= filled[:, 1:]
            ring &= ~filled
            out[ring, :3] = outline
            out[ring, 3] = 255

        for x, y, rgb in self.post:
            if 0 <= x < w and 0 <= y < h:
                out[y, x, :3] = rgb
                out[y, x, 3] = 255
        return out


def settle(img, floor):
    """Moves a frame down (or up) so its lowest opaque row is `floor` (lying bodies rest on the ground)."""
    rows = np.where(img[:, :, 3].any(axis=1))[0]
    if len(rows) == 0:
        return img
    shift = floor - rows[-1]
    out = np.zeros_like(img)
    if shift >= 0:
        out[shift:] = img[:img.shape[0] - shift]
    else:
        out[:shift] = img[-shift:]
    return out
