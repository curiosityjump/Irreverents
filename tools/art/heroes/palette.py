"""The master palette's ramps this lane uses (docs/mechanisms/art-pipeline.md,
"Master palette"), dark to light. An in-between shade is marked as such."""

from rig import ramp, rgb, INK, INK_SOFT

ORANGE = ramp('#b0481a', '#e8742a', '#ffa048', '#ffd090')
RED = ramp('#8a1c3a', '#c8324a', '#f0596a', '#ff9aa0')
CREAM = ramp('#c88a5a', '#f0c090', '#ffe2c0', '#fff4e4')  # the last is an in-between of cream and white
GOLD = ramp('#a8651a', '#e09a1e', '#ffd23f', '#fff1a0')
WOOD = ramp('#5a3420', '#8a5230', '#b97a40', '#e0a860')
GRASS = ramp('#1f7a3d', '#2fa84a', '#5fd35a', '#a8f070')
PURPLE = ramp('#4a2a7a', '#7444b8', '#a070e8', '#d0aaff')
BLUE = ramp('#263a8c', '#3c62d0', '#5c92f5', '#a0c8ff')
# in-between of the blue and sky ramps: the flyer must stay sky blue yet not vanish into the sky
SKYBLUE = ramp('#28509c', '#3a7ad8', '#58aef6', '#b0e2ff')
WHITE = ramp('#6a7890', '#9aa8c0', '#d0dcec', '#ffffff')
TEAL = ramp('#16607a', '#1e98a8', '#40d0c8', '#a0f0e0')
# in-between of the red and orange ramps: the stand-in hero's coral
CORAL = ramp('#93303a', '#cf5548', '#f58468', '#ffc0a0')
NIGHT = ramp('#141228', '#221f44', '#343066', '#4c4890')
DARK = [INK, INK, INK_SOFT, rgb('#6a5a80')]

W = rgb('#ffffff')
