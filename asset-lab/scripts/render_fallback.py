#!/usr/bin/env python3
"""Dependency-free fallback renderer for MAP.R6.3P.

This is used only if the local Blender binary crashes before Python execution.
It keeps the same manifest contract as the Blender generator and produces
project-owned transparent PNG sprites with a coherent top-down visual language.
"""
import json, math, struct, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_OUT = ROOT / 'src' / 'assets' / 'beach-generated'
LAB_OUT = ROOT / 'asset-lab' / 'output'
LAB_MANIFEST = ROOT / 'asset-lab' / 'manifests' / 'generated-assets.json'

ASSETS = [
    dict(id='umbrella_classic_top', family='umbrella', label='Ombrellone classico', file='umbrellas/umbrella_classic_top.png', preview='previews/umbrellas/umbrella_classic_top.png', width=1.4, height=1.4, collision='circle'),
    dict(id='umbrella_striped_top', family='umbrella', label='Ombrellone rigato', file='umbrellas/umbrella_striped_top.png', preview='previews/umbrellas/umbrella_striped_top.png', width=1.4, height=1.4, collision='circle'),
    dict(id='umbrella_premium_top', family='umbrella', label='Ombrellone premium', file='umbrellas/umbrella_premium_top.png', preview='previews/umbrellas/umbrella_premium_top.png', width=1.6, height=1.6, collision='circle'),
    dict(id='palm_large_top', family='palm', label='Palma grande', file='palms/palm_large_top.png', preview='previews/palms/palm_large_top.png', width=1.35, height=1.35, collision='circle', palmScaleGroup='large'),
    dict(id='palm_medium_top', family='palm', label='Palma media', file='palms/palm_medium_top.png', preview='previews/palms/palm_medium_top.png', width=1.15, height=1.15, collision='circle', palmScaleGroup='medium'),
    dict(id='palm_small_top', family='palm', label='Palma piccola / palmetta', file='palms/palm_small_top.png', preview='previews/palms/palm_small_top.png', width=0.9, height=0.9, collision='circle', palmScaleGroup='small'),
    dict(id='sunbed_top', family='furniture', label='Lettino top-down', file='furniture/sunbed_top.png', preview='previews/furniture/sunbed_top.png', width=0.8, height=1.9, collision='rect'),
    dict(id='deck_chair_top', family='furniture', label='Sdraio top-down', file='furniture/deck_chair_top.png', preview='previews/furniture/deck_chair_top.png', width=0.7, height=1.5, collision='rect'),
    dict(id='chair_top', family='furniture', label='Sedia top-down', file='furniture/chair_top.png', preview='previews/furniture/chair_top.png', width=0.55, height=0.55, collision='rect'),
    dict(id='table_top', family='furniture', label='Tavolino top-down', file='furniture/table_top.png', preview='previews/furniture/table_top.png', width=0.7, height=0.7, collision='circle'),
    dict(id='walkway_wood_tile', family='walkway', label='Passerella legno', file='walkways/walkway_wood_tile.png', preview='previews/walkways/walkway_wood_tile.png', width=1.2, height=2.0, collision='rect', moduleLengthM=2.0),
    dict(id='walkway_bamboo_tile', family='walkway', label='Passerella bamboo', file='walkways/walkway_bamboo_tile.png', preview='previews/walkways/walkway_bamboo_tile.png', width=1.1, height=1.8, collision='rect', moduleLengthM=1.8),
    dict(id='walkway_modular_tile', family='walkway', label='Pedana modulare', file='walkways/walkway_modular_tile.png', preview='previews/walkways/walkway_modular_tile.png', width=1.2, height=1.2, collision='rect', moduleLengthM=1.2),
]

PAL = {
    'shadow': (48, 38, 28, 45), 'cream': (235, 226, 202, 255), 'coral': (210, 88, 74, 255),
    'coral_dark': (145, 55, 50, 255), 'blue': (72, 128, 150, 255), 'leaf': (34, 112, 77, 255),
    'leaf_light': (60, 154, 100, 255), 'leaf_dark': (18, 76, 58, 255), 'wood': (154, 102, 55, 255),
    'wood_light': (194, 146, 82, 255), 'bamboo': (193, 169, 92, 255), 'fabric': (219, 205, 174, 255),
    'fabric_shadow': (158, 145, 123, 255), 'metal': (154, 168, 166, 255), 'groove': (82, 55, 34, 255)
}

class Canvas:
    def __init__(self, n):
        self.n=n; self.p=[0]*(n*n*4)
    def blend(self,x,y,c):
        if x<0 or y<0 or x>=self.n or y>=self.n: return
        i=(y*self.n+x)*4; a=c[3]/255; ia=1-a
        self.p[i]=int(c[0]*a+self.p[i]*ia); self.p[i+1]=int(c[1]*a+self.p[i+1]*ia); self.p[i+2]=int(c[2]*a+self.p[i+2]*ia); self.p[i+3]=min(255,int(c[3]+self.p[i+3]*ia))
    def ellipse(self,cx,cy,rx,ry,c,rot=0):
        co,si=math.cos(rot),math.sin(rot)
        for y in range(int(cy-ry-3),int(cy+ry+4)):
            for x in range(int(cx-rx-3),int(cx+rx+4)):
                dx=x+0.5-cx; dy=y+0.5-cy
                u=(dx*co+dy*si)/rx; v=(-dx*si+dy*co)/ry
                d=u*u+v*v
                if d<=1: self.blend(x,y,c)
    def rect(self,cx,cy,w,h,c,rot=0):
        co,si=math.cos(rot),math.sin(rot); hw,hh=w/2,h/2
        for y in range(int(cy-h-w),int(cy+h+w)):
            for x in range(int(cx-h-w),int(cx+h+w)):
                dx=x+0.5-cx; dy=y+0.5-cy
                u=dx*co+dy*si; v=-dx*si+dy*co
                if abs(u)<=hw and abs(v)<=hh: self.blend(x,y,c)
    def poly(self,pts,c):
        ys=[p[1] for p in pts]; xs=[p[0] for p in pts]
        for y in range(int(min(ys)),int(max(ys))+1):
            nodes=[]; j=len(pts)-1
            for i in range(len(pts)):
                yi,yj=pts[i][1],pts[j][1]; xi,xj=pts[i][0],pts[j][0]
                if (yi<y and yj>=y) or (yj<y and yi>=y): nodes.append(int(xi+(y-yi)/(yj-yi)*(xj-xi)))
                j=i
            nodes.sort()
            for a,b in zip(nodes[0::2],nodes[1::2]):
                for x in range(a,b): self.blend(x,y,c)
    def circle(self,cx,cy,r,c): self.ellipse(cx,cy,r,r,c)
    def save(self,path):
        path.parent.mkdir(parents=True,exist_ok=True)
        raw=b''.join(b'\x00'+bytes(self.p[y*self.n*4:(y+1)*self.n*4]) for y in range(self.n))
        def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
        data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',self.n,self.n,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
        path.write_bytes(data)

def draw_umbrella(c,kind):
    n=c.n; cx=cy=n/2; r=n*.31 if kind!='premium' else n*.35
    c.ellipse(cx+12,cy+12,r*.92,r*.82,PAL['shadow'])
    if kind=='striped':
        for i in range(12):
            a1=i*math.tau/12; a2=(i+1)*math.tau/12
            col=PAL['cream'] if i%2 else PAL['blue']
            c.poly([(cx,cy),(cx+math.cos(a1)*r,cy+math.sin(a1)*r),(cx+math.cos(a2)*r,cy+math.sin(a2)*r)],col)
    else:
        c.circle(cx,cy,r,PAL['cream'] if kind=='classic' else PAL['coral'])
        if kind=='premium': c.circle(cx,cy,r*.58,PAL['coral_dark'])
    for i in range(12): c.rect(cx+math.cos(i*math.tau/12)*r*.25,cy+math.sin(i*math.tau/12)*r*.25,4,r*1.15,(190,176,151,120),i*math.tau/12)
    c.circle(cx,cy,r*.08,PAL['metal'])

def draw_palm(c,size):
    # Beach-plan palm/thatch marker: octagonal straw canopy, readable top-down,
    # intentionally low-shadow so the operational Canvas shadow can do the depth work.
    n=c.n; cx=cy=n/2
    scale={'large':1.04,'medium':.9,'small':.68}[size]
    radius=n*.255*scale
    darken={'large':0,'medium':8,'small':28}[size]
    straw=(214-darken, 180-darken, 105-darken, 255)
    straw_light=(238-darken, 216-darken, 156-darken, 255)
    straw_dark=(160-darken, 118-darken, 62-darken, 255)
    rim=(126-darken, 88-darken, 46-darken, 255)
    core=(118-darken, 82-darken, 46-darken, 255)

    # Very soft contact only; avoids the old double-shadow/cactus look.
    c.ellipse(cx+radius*.12, cy+radius*.16, radius*.58, radius*.34, (48, 38, 28, 18))

    octagon=[]
    for i in range(8):
        a=math.pi/8+i*math.tau/8
        octagon.append((cx+math.cos(a)*radius, cy+math.sin(a)*radius))
    c.poly(octagon, straw)

    # Alternating subtle straw facets.
    for i in range(8):
        a1=math.pi/8+i*math.tau/8
        a2=math.pi/8+(i+1)*math.tau/8
        col=straw_light if i%2==0 else straw
        c.poly([(cx,cy),(cx+math.cos(a1)*radius*.96,cy+math.sin(a1)*radius*.96),(cx+math.cos(a2)*radius*.96,cy+math.sin(a2)*radius*.96)], col)

    # Inner octagonal ring and thatch strokes.
    inner=[]
    for i in range(8):
        a=math.pi/8+i*math.tau/8
        inner.append((cx+math.cos(a)*radius*.72, cy+math.sin(a)*radius*.72))
    c.poly(inner, (225-darken, 196-darken, 125-darken, 145))

    for i in range(16):
        a=i*math.tau/16
        length=radius*(.76 if i%2 else .92)
        c.rect(cx+math.cos(a)*length*.43, cy+math.sin(a)*length*.43, max(2,n*.006*scale), length, (118-darken, 86-darken, 48-darken, 82), a)

    # Thin octagonal outer definition made from small edge-aligned bars.
    for i in range(8):
        p1=octagon[i]; p2=octagon[(i+1)%8]
        mx=(p1[0]+p2[0])/2; my=(p1[1]+p2[1])/2
        edge=math.hypot(p2[0]-p1[0],p2[1]-p1[1])
        angle=math.atan2(p2[1]-p1[1],p2[0]-p1[0])+math.pi/2
        c.rect(mx,my,max(2,n*.007*scale),edge,rim,angle)

    c.circle(cx,cy,radius*.13,core)
    c.circle(cx,cy,radius*.075,(199-darken, 128-darken, 54-darken,255))

def draw_furniture(c,kind):
    n=c.n; cx=cy=n/2; c.ellipse(cx+10,cy+12,n*.22,n*.32,PAL['shadow'])
    if kind=='sunbed':
        c.rect(cx,cy,n*.28,n*.58,PAL['wood']); c.rect(cx,cy-8,n*.22,n*.48,PAL['fabric']); c.rect(cx,cy-n*.18,n*.22,n*.15,PAL['fabric_shadow'])
    elif kind=='deck':
        c.rect(cx,cy,n*.26,n*.48,PAL['wood'],.08); c.rect(cx,cy+20,n*.2,n*.3,PAL['fabric'],.08); c.rect(cx,cy-42,n*.2,n*.18,PAL['fabric_shadow'],.08)
    elif kind=='chair':
        c.rect(cx,cy+8,n*.24,n*.2,PAL['fabric']); c.rect(cx,cy-42,n*.25,n*.07,PAL['wood']);
        for x in (-45,45):
            for y in (-22,42): c.circle(cx+x,cy+y,8,PAL['wood'])
    else:
        c.circle(cx,cy,n*.16,PAL['wood_light']); c.circle(cx,cy,n*.04,PAL['wood'])

def draw_walkway(c,kind):
    n=c.n; cx=cy=n/2; c.ellipse(cx+8,cy+14,n*.23,n*.34,PAL['shadow'])
    if kind=='wood':
        for i,x in enumerate([-76,-38,0,38,76]): c.rect(cx+x,cy,28,n*.58,PAL['wood_light'] if i%2 else PAL['wood'])
    elif kind=='bamboo':
        for x in [-82,-50,-18,18,50,82]:
            c.rect(cx+x,cy,22,n*.52,PAL['bamboo'])
            for y in (-70,70): c.rect(cx+x,cy+y,23,5,PAL['groove'])
    else:
        for x in (-54,54):
            for y in (-54,54): c.rect(cx+x,cy+y,96,96,PAL['wood_light'])
        c.rect(cx,cy,n*.45,8,PAL['groove']); c.rect(cx,cy,8,n*.45,PAL['groove'])

def render(asset, n):
    c=Canvas(n); fid=asset['id']
    if fid.startswith('umbrella'): draw_umbrella(c, 'striped' if 'striped' in fid else 'premium' if 'premium' in fid else 'classic')
    elif fid.startswith('palm'): draw_palm(c, 'large' if 'large' in fid else 'medium' if 'medium' in fid else 'small')
    elif fid=='sunbed_top': draw_furniture(c,'sunbed')
    elif fid=='deck_chair_top': draw_furniture(c,'deck')
    elif fid=='chair_top': draw_furniture(c,'chair')
    elif fid=='table_top': draw_furniture(c,'table')
    elif 'wood' in fid: draw_walkway(c,'wood')
    elif 'bamboo' in fid: draw_walkway(c,'bamboo')
    else: draw_walkway(c,'modular')
    return c

def main():
    manifest=[]
    for a in ASSETS:
        render(a,512).save(APP_OUT/a['file']); render(a,256).save(APP_OUT/a['preview'])
        (LAB_OUT).mkdir(parents=True,exist_ok=True); (LAB_OUT/Path(a['file']).name).write_bytes((APP_OUT/a['file']).read_bytes())
        item={'id':a['id'],'family':a['family'],'label':a['label'],'projection':'top_down','file':a['file'],'previewFile':a['preview'],'defaultWidthM':a['width'],'defaultHeightM':a['height'],'collisionShape':a['collision'],'source':'self_generated_codex_fallback_after_blender_crash','license':'project_owned','requiresAttribution':False,'qualityStatus':'approved','visualStyle':'top_down','approvedForCanvas':False,'approvedForLibraryPreview':True}
        if 'moduleLengthM' in a: item['moduleLengthM']=a['moduleLengthM']
        if 'palmScaleGroup' in a: item['palmScaleGroup']=a['palmScaleGroup']
        manifest.append(item)
    APP_OUT.mkdir(parents=True,exist_ok=True); (APP_OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    LAB_MANIFEST.parent.mkdir(parents=True,exist_ok=True); LAB_MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(f'Generated {len(manifest)} fallback project-owned assets into {APP_OUT}')
if __name__=='__main__': main()
