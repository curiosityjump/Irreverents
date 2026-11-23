"""Shared by make.py, preview.py and selfcheck.py (tiles lane).

DRAFT: everything this lane draws is a stand-in (docs/mechanisms/art-pipeline.md).
Deterministic: no clock, no random module, whole pixels, alpha 0 or 255.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
ASSETS = os.path.join(ROOT, 'assets')
CONTENT = os.path.join(ROOT, 'content')

T = 16
CLEAR = (0, 0, 0, 0)


def rgb(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def mix(a, b, t):
    """An in-between shade of two palette colours (the contract allows those; never a new hue)."""
    a, b = (rgb(a) if isinstance(a, str) else a), (rgb(b) if isinstance(b, str) else b)
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3)) + (255,)


# The contract's master palette (dark -> light).
P = {
    'ink': ['#2b2140', '#4a3a5e'],
    'sky': ['#5fb4f0', '#8fd0fa', '#c4e9ff', '#eef9ff'],
    'cloud': ['#d6ecfb', '#ffffff'],
    'far': ['#9fc7e8', '#b5d6ee', '#cfe6f6'],
    'grass': ['#1f7a3d', '#2fa84a', '#5fd35a', '#a8f070'],
    'foliage': ['#1c6b4a', '#2a9a5c', '#58c96a', '#9be37a'],
    'earth': ['#6b3f2a', '#94583a', '#c07a4a', '#e3a56b'],
    'stone': ['#5b5670', '#807b96', '#a9a5bd', '#d2cfe0'],
    'castle': ['#3f3a66', '#5c5690', '#8179b8', '#aaa3d8'],
    'wood': ['#5a3420', '#8a5230', '#b97a40', '#e0a860'],
    'gold': ['#a8651a', '#e09a1e', '#ffd23f', '#fff1a0'],
    'red': ['#8a1c3a', '#c8324a', '#f0596a', '#ff9aa0'],
    'blue': ['#263a8c', '#3c62d0', '#5c92f5', '#a0c8ff'],
    'purple': ['#4a2a7a', '#7444b8', '#a070e8', '#d0aaff'],
    'teal': ['#16607a', '#1e98a8', '#40d0c8', '#a0f0e0'],
    'orange': ['#b0481a', '#e8742a', '#ffa048', '#ffd090'],
    'pink': ['#b03a78', '#e860a0', '#ff98c0', '#ffd0e0'],
    'cream': ['#c88a5a', '#f0c090', '#ffe2c0'],
    'metal': ['#6a7890', '#9aa8c0', '#d0dcec', '#ffffff'],
    'night': ['#141228', '#221f44', '#343066', '#4c4890'],
}
C = {k: [rgb(c) for c in v] for k, v in P.items()}

# Where things sit in every tile image (cells of 16 px, [column, row]). 8 x 8 cells = 128 x 128.
ORIGIN = [0, 0]
INNER = {'nw': [4, 0], 'ne': [5, 0], 'sw': [4, 1], 'se': [5, 1]}
FILL = [[3, 3], [6, 0], [7, 0], [6, 1], [7, 1]]
TOP_CELLS = [[4, 2], [5, 2], [6, 2], [7, 2]]
UNDER_CELLS = [[4, 3], [5, 3]]
ONEWAY = {'left': [0, 5], 'mid': [1, 5], 'right': [2, 5], 'single': [3, 5]}
WALL_CELLS = [[0, 6], [1, 6], [2, 6], [3, 6]]
SHEET = 128


def tile_hash(tx, ty, salt):
    """The fixed hash that picks a variant from a tile's position.
    salt: 0 fill, 1 top piece, 2 under piece, 3 back wall. Pure 32-bit integer maths, so the
    same in Python and in the game."""
    n = (tx * 0x9E3779B1 + ty * 0x85EBCA77 + salt * 0xC2B2AE3D) & 0xFFFFFFFF
    n ^= n >> 15
    n = (n * 0x2C1B3C6D) & 0xFFFFFFFF
    n ^= n >> 12
    n = (n * 0x297A2D39) & 0xFFFFFFFF
    n ^= n >> 15
    return n


def sky_bands(top, bottom, height, bands=8):
    """Rows of the sky: `bands` equal flat bands from top colour to bottom colour."""
    rows = []
    for y in range(height):
        i = min(bands - 1, y * bands // height)
        rows.append(mix(top, bottom, i / (bands - 1)))
    return rows
