from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json, random, math
OUT=Path('/mnt/data/irreverents_kit');OUT.mkdir(exist_ok=True)
T=16; COLS=8
C={'outline':'#29315d','earth':'#c28c71','earth_light':'#e1b18a','earth_dark':'#986f68',
   'grass':'#64c942','grass_light':'#a3e85a','grass_shadow':'#318b68','stone':'#a4a2c5','stone_light':'#d2c7d8','stone_dark':'#6c749f',
   'wood':'#ab714d','wood_light':'#e6aa67','wood_dark':'#684d5d', 'water':'#3898c4','water_light':'#9de2ec','deep':'#33759d',
   'gold':'#f8c566','gold_dark':'#b98b5d','banner':'#9d425c','banner_light':'#c65b72','blue':'#497cba',
   'white':'#fff3ce','sky':'#d0e9ee'}

def tile(): return Image.new('RGBA',(T,T),(0,0,0,0))
def draw_base_dirt(d, top=False, left=False,right=False):
    d.rectangle((0,0,15,15),fill=C['earth'])
    # Restrained and tile-safe block texture
    for y in (3,10):
      for x in (2,9):
        d.rectangle((x,y,x+3,y+2),fill=C['earth_light'])
        d.point((x+5,y+4),fill=C['earth_dark'])
    if left:d.line((0,0,0,15),fill=C['outline'])
    if right:d.line((15,0,15,15),fill=C['outline'])
    if top:
      d.rectangle((0,0,15,2),fill=C['grass_shadow'])
      d.rectangle((0,0,15,0),fill=C['grass_light'])
      d.line((0,2,15,2),fill=C['grass'])
      for x in (1,5,10,14):d.line((x,3,x,3+(x%3)),fill=C['grass_shadow'])

def draw_stone(d,edge=None):
    d.rectangle((0,0,15,15),fill=C['stone'])
    d.line((0,7,15,7),fill=C['stone_dark'],width=1)
    d.line((7,0,7,7),fill=C['stone_dark'])
    d.line((3,8,3,15),fill=C['stone_dark'])
    for pos in ((1,1,5,1),(9,1,13,1),(5,10,12,10)):d.line(pos,fill=C['stone_light'])
    if edge=='top':d.rectangle((0,0,15,2),fill=C['stone_light']);d.line((0,3,15,3),fill=C['stone_dark'])
    if edge=='left':d.line((0,0,0,15),fill=C['outline'])
    if edge=='right':d.line((15,0,15,15),fill=C['outline'])
    if edge=='bottom':d.line((0,15,15,15),fill=C['outline'])

def terrain(n):
    im=tile();d=ImageDraw.Draw(im)
    if n.startswith('grass') or n.startswith('dirt'):
      draw_base_dirt(d,top=n.startswith('grass'),left='left' in n,right='right' in n)
      if 'corner' in n:
        if 'left' in n: d.polygon([(0,0),(4,0),(0,5)],fill=C['grass_light'])
        else:d.polygon([(15,0),(11,0),(15,5)],fill=C['grass_light'])
    elif n.startswith('stone'):
      draw_stone(d,edge={'stone_top':'top','stone_left':'left','stone_right':'right','stone_bottom':'bottom'}.get(n))
      if n=='stone_crack': d.line((5,1,9,5,7,9,11,15),fill=C['outline'],width=1)
      if n=='stone_rubble':
        d.rectangle((0,0,15,15),fill=(0,0,0,0)); d.polygon([(0,15),(0,10),(4,8),(7,11),(9,7),(13,9),(15,15)],fill=C['stone'])
        d.line((2,14,5,11,9,13,12,10),fill=C['stone_dark'])
    elif n=='slope_up' or n=='slope_down':
      pts=[(0,15),(15,15),(15,0)] if n=='slope_up' else [(0,0),(0,15),(15,15)]
      d.polygon(pts,fill=C['earth']);d.line(((0,15),(15,0)) if n=='slope_up' else ((0,0),(15,15)), fill=C['grass_light'],width=3)
      d.line(((1,15),(15,1)) if n=='slope_up' else ((1,1),(15,15)), fill=C['grass_shadow'],width=1)
    elif n=='wood_bridge':
      d.rectangle((0,4,15,11),fill=C['wood_dark']);d.rectangle((0,3,15,8),fill=C['wood_light'])
      for x in (0,8,15):d.line((x,4,x,8),fill=C['wood_dark'])
      d.line((0,12,15,12),fill=C['wood'])
    elif n=='wood_support':
      d.rectangle((6,0,10,15),fill=C['wood']);d.line((6,0,6,15),fill=C['wood_dark']);d.line((8,0,8,15),fill=C['wood_light'])
    elif n.startswith('ladder'):
      d.line((3,0,3,15),fill=C['wood_dark'],width=3);d.line((12,0,12,15),fill=C['wood_dark'],width=3)
      for y in (2,7,12): d.line((4,y,11,y),fill=C['wood_light'],width=2)
    elif n.startswith('water'):
      d.rectangle((0,0,15,15),fill=C['water'] if n=='water_top' else C['deep'])
      if n=='water_top':d.line((0,0,4,0,7,2,11,0,15,0),fill=C['water_light']);d.line((3,6,7,6),fill=C['water_light'])
      else:d.line((2,5,5,5),fill=C['water']);d.line((10,12,14,12),fill=C['water_light'])
    elif n=='rock':
      d.polygon([(1,15),(0,9),(4,3),(12,3),(15,10),(15,15)],fill=C['stone_dark']);d.polygon([(3,10),(5,4),(11,5),(13,10)],fill=C['stone_light']);d.line((4,12,12,12),fill=C['stone'])
    elif n=='bush':
      d.ellipse((1,6,13,15),fill=C['grass_shadow']);d.ellipse((0,5,9,12),fill=C['grass']);d.ellipse((7,2,15,13),fill=C['grass']);d.ellipse((5,4,12,10),fill=C['grass_light'])
    elif n=='flowers':
      d.line((7,15,7,8),fill=C['grass_shadow']);d.line((11,15,11,8),fill=C['grass_shadow'])
      for x,y in [(7,7),(11,9)]:
        for ox,oy in [(-2,0),(2,0),(0,-2),(0,2)]:d.ellipse((x+ox-1,y+oy-1,x+ox+1,y+oy+1),fill='#f3aec9')
        d.point((x,y),fill=C['gold'])
    elif n=='vine':
      d.line((6,0,6,15),fill=C['grass_shadow'],width=2)
      for y in (1,6,11):d.ellipse((2,y,8,y+4),fill=C['grass']);d.ellipse((7,y+2,12,y+6),fill=C['grass_light'])
    elif n=='grass_tuft':
      for x in (3,6,9,12):d.line((x,15,x+(x%3)-1,8+(x%4)),fill=C['grass_shadow'],width=2)
    elif n=='crate':
      d.rectangle((1,1,14,14),fill=C['wood_dark']);d.rectangle((3,3,12,12),fill=C['wood']);d.line((3,3,12,12),fill=C['wood_light']);d.line((12,3,3,12),fill=C['wood_light'])
    elif n=='door':
      d.rounded_rectangle((2,0,13,15),radius=5,fill=C['stone_dark'],outline=C['outline'],width=2);d.rectangle((4,6,11,15),fill=C['wood_dark']);d.point((10,9),fill=C['gold'])
    elif n=='cave_dark':
      draw_base_dirt(d,top=True);d.ellipse((2,7,13,23),fill=C['outline'])
    elif n=='switch':
      d.polygon([(3,14),(12,14),(10,11),(5,11)],fill=C['stone_dark']);d.line((7,11,11,3),fill=C['wood_dark'],width=2);d.ellipse((9,1,13,5),fill=C['gold'])
    elif n=='plate':
      d.polygon([(0,12),(15,12),(12,15),(3,15)],fill=C['stone_dark']);d.line((2,12,13,12),fill=C['gold'])
    elif n=='chest':
      d.rectangle((1,6,14,14),fill=C['wood_dark']);d.rectangle((2,7,13,11),fill=C['wood']);d.arc((1,0,14,13),180,360,fill=C['gold'],width=2);d.rectangle((6,7,9,13),fill=C['gold'])
    elif n=='barrel':
      d.ellipse((3,1,12,6),fill=C['wood_light']);d.rectangle((2,4,13,12),fill=C['wood']);d.ellipse((2,9,13,15),fill=C['wood_dark']);d.line((2,5,13,5),fill=C['stone_dark']);d.line((2,11,13,11),fill=C['stone_dark'])
    elif n=='torch':
      d.rectangle((7,9,9,15),fill=C['wood_dark']);d.ellipse((5,3,11,10),fill='#f1924f');d.ellipse((7,4,10,8),fill=C['gold'])
    elif n=='empty':pass
    return im

terr_names=['grass_top','grass_left','grass_right','grass_left_corner','grass_right_corner','dirt_fill','dirt_left','dirt_right',
            'dirt_bottom','stone_fill','stone_top','stone_left','stone_right','stone_bottom','stone_crack','stone_rubble',
            'slope_up','slope_down','wood_bridge','wood_support','ladder','ladder_top','water_top','water_deep',
            'rock','bush','flowers','vine','grass_tuft','crate','door','cave_dark',
            'switch','plate','chest','barrel','torch','empty']

def castle(n):
    im=tile();d=ImageDraw.Draw(im)
    if n.startswith('wall') or n.startswith('floor'):
      draw_stone(d, edge=('top' if n=='floor_top' else None))
      if n=='wall_dark':d.rectangle((0,0,15,15),fill=C['stone_dark']);d.line((0,8,15,8),fill=C['outline']);d.line((8,0,8,8),fill=C['outline'])
      if n=='wall_crack':d.line((4,1,8,5,6,9,12,14),fill=C['outline'])
      if n=='wall_secret':d.line((1,2,2,14),fill=C['stone_dark']);d.line((14,2,13,14),fill=C['stone_dark'])
      if n=='floor_gold':d.rectangle((0,0,15,3),fill=C['gold']);d.line((0,4,15,4),fill=C['gold_dark'])
    elif n=='pillar_top':d.rectangle((2,0,13,4),fill=C['stone_light'],outline=C['stone_dark']);d.rectangle((5,5,10,15),fill=C['stone'])
    elif n=='pillar_mid':d.rectangle((5,0,10,15),fill=C['stone']);d.line((5,0,5,15),fill=C['stone_light']);d.line((10,0,10,15),fill=C['stone_dark'])
    elif n=='pillar_base':d.rectangle((5,0,10,11),fill=C['stone']);d.rectangle((2,11,13,15),fill=C['stone_light'],outline=C['stone_dark'])
    elif n in ('rail_left','rail_mid','rail_right'):
      d.line((0,2,15,2),fill=C['stone_light'],width=3);d.line((0,14,15,14),fill=C['stone_dark'],width=2)
      for x in (3,11):d.rectangle((x,4,x+2,13),fill=C['stone'])
    elif n=='steps':
      d.polygon([(0,15),(0,12),(4,12),(4,8),(8,8),(8,4),(12,4),(12,0),(15,0),(15,15)],fill=C['stone'])
      for p in [(0,12,4,12),(4,8,8,8),(8,4,12,4),(12,0,15,0)]:d.line(p,fill=C['stone_light'])
    elif n=='arch_left':
      draw_stone(d);d.pieslice((6,0,25,26),180,270,fill=C['outline'])
    elif n=='arch_right':
      draw_stone(d);d.pieslice((-10,0,9,26),270,360,fill=C['outline'])
    elif n=='arch_top':
      draw_stone(d);d.ellipse((2,6,13,20),fill=C['outline'])
    elif n=='door_closed' or n=='door_open' or n=='door_locked':
      d.rounded_rectangle((1,0,14,15),radius=5,fill=C['stone_dark'],outline=C['stone_light'],width=2)
      if n!='door_open':d.rounded_rectangle((3,3,12,15),radius=3,fill=C['wood_dark'],outline=C['wood_light']);d.point((10,10),fill=C['gold'])
      else:d.rounded_rectangle((3,3,12,15),radius=3,fill=C['outline'])
      if n=='door_locked':d.rectangle((6,10,9,13),fill=C['gold']);d.arc((6,6,9,11),180,360,fill=C['gold'])
    elif n=='window':
      d.rounded_rectangle((2,0,13,15),radius=5,fill=C['outline'],outline=C['stone_light'],width=2);d.rectangle((5,3,10,13),fill=C['blue']);d.line((7,3,7,13),fill=C['gold'])
    elif n=='stained_glass':
      d.rectangle((1,0,14,15),fill=C['outline']);d.polygon([(4,2),(11,2),(8,8)],fill='#d391ca');d.polygon([(3,9),(12,9),(8,14)],fill='#6fc6d9');d.line((8,1,8,15),fill=C['gold'])
    elif n=='banner':
      d.rectangle((3,0,12,12),fill=C['banner']);d.polygon([(3,12),(8,15),(12,12)],fill=C['banner']);d.line((4,0,4,13),fill=C['banner_light']);d.polygon([(8,4),(9,7),(12,8),(9,9),(8,12),(7,9),(4,8),(7,7)],fill=C['gold'])
    elif n=='torch':return terrain('torch')
    elif n=='chest':return terrain('chest')
    elif n=='crate':return terrain('crate')
    elif n=='barrel':return terrain('barrel')
    elif n=='ladder':return terrain('ladder')
    elif n=='lever':return terrain('switch')
    elif n=='plate':return terrain('plate')
    elif n=='grate':
      d.rectangle((1,0,14,15),fill=C['outline']);d.rectangle((2,2,13,13),fill=C['stone_dark']);
      for x in (4,7,10):d.line((x,2,x,13),fill=C['stone_light'],width=1)
    elif n=='royal_throne':
      d.rounded_rectangle((2,0,13,13),radius=3,fill=C['gold_dark'],outline=C['gold']);d.rounded_rectangle((4,3,11,12),radius=2,fill=C['banner']);d.rectangle((1,12,14,15),fill=C['wood_dark']);d.point((8,1),fill=C['white'])
    elif n=='crown':
      d.polygon([(1,10),(1,5),(5,8),(8,2),(11,8),(15,5),(14,12),(2,12)],fill=C['gold'],outline=C['gold_dark']);d.rectangle((3,10,13,13),fill=C['gold']);d.point((8,10),fill='#db4c76')
    elif n=='red_curtain':
      d.rectangle((0,0,15,15),fill=C['banner']);d.line((4,0,4,14),fill=C['banner_light'],width=2);d.line((11,0,11,15),fill=C['wood_dark'])
    elif n=='crystal':
      d.polygon([(8,0),(14,6),(11,15),(5,15),(2,6)],fill='#65c9e5',outline=C['blue']);d.polygon([(8,0),(8,15),(5,15),(2,6)],fill='#a0e5ef')
    elif n=='gate':
      d.rectangle((0,0,15,15),fill=C['outline']);
      for x in (2,6,10,14):d.line((x,0,x,15),fill=C['stone_light'],width=2)
    elif n=='chain':
      for y in (1,6,11):d.ellipse((6,y,10,y+4),outline=C['stone_dark'],width=2)
    elif n=='rubble':return terrain('stone_rubble')
    elif n=='vines':return terrain('vine')
    elif n=='plant':return terrain('bush')
    elif n=='wall_torch':return terrain('torch')
    elif n=='magic_orb':
      d.ellipse((2,2,13,13),fill='#5f97df',outline=C['outline']);d.ellipse((4,4,8,8),fill='#a2eaf2')
    elif n=='treasure':
      d.ellipse((0,9,15,15),fill=C['gold_dark']);d.polygon([(4,12),(6,3),(12,3),(14,12)],fill=C['gold']);d.ellipse((5,4,9,8),fill=C['white'])
    return im
castle_names=['wall_fill','wall_dark','wall_crack','wall_secret','floor_top','floor_gold','pillar_top','pillar_mid',
              'pillar_base','rail_left','rail_mid','rail_right','steps','arch_left','arch_right','arch_top',
              'door_closed','door_open','door_locked','window','stained_glass','banner','torch','chest',
              'crate','barrel','ladder','lever','plate','grate','royal_throne','crown',
              'red_curtain','crystal','gate','chain','rubble','vines','plant','wall_torch',
              'magic_orb','treasure']

def make_atlas(names,func,prefix):
    rows=math.ceil(len(names)/COLS); im=Image.new('RGBA',(COLS*T,rows*T),(0,0,0,0));mapping=[]
    for i,n in enumerate(names):
      x=(i%COLS)*T;y=(i//COLS)*T; im.alpha_composite(func(n),(x,y))
      mapping.append({'id':i,'name':n,'x':x,'y':y,'w':T,'h':T})
    native=OUT/f'{prefix}_tiles_16px.png';im.save(native)
    # Developer guide preview with separate cells, rendered nearest-neighbor.
    cw,ch=153,176; preview=Image.new('RGB',(COLS*cw,rows*ch),(249,246,238));pd=ImageDraw.Draw(preview)
    font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
    for i,n in enumerate(names):
      cx=(i%COLS)*cw;cy=(i//COLS)*ch;pic=func(n).resize((T*7,T*7),Image.Resampling.NEAREST)
      pd.rectangle((cx+8,cy+8,cx+cw-8,cy+132),fill=(239,239,237),outline=(210,210,205))
      preview.paste(pic,(cx+(cw-112)//2,cy+13),pic)
      pd.text((cx+9,cy+143),f'{i:02d}  {n}',font=font,fill=(36,46,70))
    preview.save(OUT/f'{prefix}_tiles_contact_preview.png')
    return native,mapping

a,am=make_atlas(terr_names,terrain,'grass_ruins')
b,bm=make_atlas(castle_names,castle,'royal_castle')
manifest={'project':'Irreverents','version':'0.1_prototype','status':'procedural early game-dev test assets, NOT canonical approved art','tile_size_px':16,'columns':COLS,'atlases':{'grass_ruins':{'file':a.name,'tiles':am},'royal_castle':{'file':b.name,'tiles':bm}},'notes':['Native PNG atlases are transparent, aligned to 16x16 cells and readable by a tilemap editor.','Concept geometry and colors are provisional; consistent native pixel art, but not the final approved art direction.','Contact preview images add labels and enlarged nearest-neighbor rendering for human review.','Concept painterly image is kept separately; it is not source tile data.']}
(OUT/'tile_manifest.json').write_text(json.dumps(manifest,indent=2))

# Demo: actual 16px tiles on a low-noise parallax, no text or UI.
W,H=384,224; scene=Image.new('RGBA',(W,H),'#b2dbef');sd=ImageDraw.Draw(scene)
for y in range(H):
  k=y/H
  if y<96: sd.line((0,y,W,y),fill=(int(166+24*k),int(216+12*k),int(243-2*k),255))
  elif y<144:sd.line((0,y,W,y),fill=(142,196,214,255))
  else:sd.line((0,y,W,y),fill=(115,176,181,255))
# simplified distant elements
for x in (8,122,262,326):
 sd.ellipse((x,30+(x%15),x+48,51+(x%17)),fill=(224,237,232,255))
for bx in (34,120,228,302):
 sd.polygon([(bx-28,151),(bx+11,110+(bx%13)),(bx+66,151)],fill=(117,168,189,255))
sd.rectangle((0,146,W,H),fill=(105,160,167,255))
for x in range(0,W,22):sd.ellipse((x,137+(x%5),x+37,165),fill=(88,155,153,255))
# terrain tiles
TD={n:terrain(n) for n in terr_names};CD={n:castle(n) for n in castle_names}
def stamp(im, x,y): scene.alpha_composite(im,(x,y))
def grass(x,y):stamp(TD['grass_top'],x,y);stamp(TD['dirt_fill'],x,y+16);stamp(TD['dirt_fill'],x,y+32)
for x in range(0,144,16):grass(x,160)
for x in range(192,384,16):grass(x,160)
for x in range(96,144,16):grass(x,128)
for x in range(240,288,16):grass(x,112)
for x in range(304,352,16):grass(x,96)
for x in range(144,192,16):stamp(TD['wood_bridge'],x,160)
stamp(TD['rock'],112,145);stamp(TD['bush'],64,145);stamp(TD['flowers'],32,144)
for y in (112,128,144):stamp(TD['ladder'],312,y)
# castle wall right half
for y in (128,144):
  for x in (336,352,368):stamp(CD['wall_fill'],x,y)
stamp(CD['door_closed'],352,144);stamp(CD['banner'],368,128)
stamp(TD['cave_dark'],16,144);stamp(TD['stone_crack'],272,144)
stamp(TD['switch'],320,144)
# tiny original round but not Kirby (hooded traveler sprite)
hero=Image.new('RGBA',(16,16),(0,0,0,0));hd=ImageDraw.Draw(hero)
hd.polygon([(2,8),(4,4),(9,2),(14,6),(13,13),(3,13)],fill='#387e67',outline=C['outline'])
hd.rectangle((5,7,12,10),fill='#f5c58d');hd.point((8,8),fill=C['outline']);hd.point((11,8),fill=C['outline']);hd.line((2,13,14,13),fill=C['outline'],width=2);hd.line((8,3,14,5),fill='#8acc75',width=2)
stamp(hero,56,144)
scene_rgb=Image.new('RGB',scene.size,'#b2dbef');scene_rgb.paste(scene,(0,0),scene)
scene_rgb.save(OUT/'assembled_scene_native_384x224.png')
scene_rgb.resize((1536,896),Image.Resampling.NEAREST).save(OUT/'assembled_scene_preview_4x.png')
print(json.dumps({'files':[x.name for x in OUT.iterdir()],'size':[W,H],'terrain_count':len(am),'castle_count':len(bm)}))
