(()=>{
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=320,H=180,assets={},prefix='../sprites/';
const names=['grass_full','floating_island','ruin_arch','wooden_crate','wooden_bridge','stone_pillar','treasure_chest','lantern_post','red_banner','impact_star'];
const paths={grass_full:'terrain',floating_island:'terrain',ruin_arch:'props',wooden_crate:'props',wooden_bridge:'props',stone_pillar:'props',treasure_chest:'props',lantern_post:'props',red_banner:'props',impact_star:'vfx'};
const inputs={left:false,right:false,jump:false,attack:false};let pressedJump=false,pressAttack=false,swapQueued=false,ready=0;
function load(name,path){const im=new Image();im.src=path;assets[name]=im;im.onload=()=>ready++;}
for(const n of names)load(n,prefix+paths[n]+'/'+n+'.png');
load('scout',prefix+'heroes/scout_7states_48px.png');load('rogue',prefix+'heroes/rogue_7states_48px.png');
const player={x:58,y:92,vy:0,dir:1,which:'rogue',grounded:true,attackUntil:0},floorY=140;
function trigger(act,on){if(act==='switch'){if(on)swapQueued=true;return}if(act==='jump'&&on)pressedJump=true;if(act==='attack'&&on)pressAttack=true;inputs[act]=on;}
for(const b of document.querySelectorAll('.btn')){const a=b.dataset.input;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('active');trigger(a,true)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{e.preventDefault();b.classList.remove('active');trigger(a,false)})}
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyJ:'attack',KeyK:'attack',KeyQ:'switch'};
window.addEventListener('keydown',e=>{const a=keys[e.code];if(a){e.preventDefault();if(!e.repeat)trigger(a,true);else if(a!=='switch')inputs[a]=true}});
window.addEventListener('keyup',e=>{const a=keys[e.code];if(a){e.preventDefault();trigger(a,false)}});
function sprite(name,x,y,w,h){const im=assets[name];if(!im||!im.complete||!im.naturalWidth)return;ctx.drawImage(im,Math.round(x),Math.round(y),w||im.width,h||im.height)}
let last=performance.now(),elapsed=0,camera=0,attackFX=0;
function update(now){const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
if(swapQueued){player.which=player.which==='scout'?'rogue':'scout';swapQueued=false}
let dx=0;if(inputs.left)dx-=1;if(inputs.right)dx+=1;if(dx!==0)player.dir=dx>0?1:-1;
player.x=Math.max(5,Math.min(650,player.x+dx*82*dt));
if(pressedJump&&player.grounded){player.vy=-153;player.grounded=false}pressedJump=false;
player.vy+=360*dt;player.y+=player.vy*dt;
if(player.y+45>floorY){player.y=floorY-45;player.vy=0;player.grounded=true}
if(pressAttack){player.attackUntil=elapsed+.22;attackFX=elapsed+.14}pressAttack=false;
camera=Math.max(0,Math.min(400,player.x-135));
}
function scene(){ctx.clearRect(0,0,W,H);
const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#81c9fa');sky.addColorStop(.9,'#ccf2fd');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
ctx.fillStyle='#fff3ab';ctx.beginPath();ctx.arc(264-camera*.09,28,16,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#9acbca';for(let i=0;i<8;i++){const x=i*75-camera*.15;ctx.beginPath();ctx.moveTo(x,140);ctx.lineTo(x+40,83);ctx.lineTo(x+90,140);ctx.fill()}
ctx.fillStyle='#72aaad';for(let i=0;i<12;i++){let x=i*49-camera*.3;ctx.fillRect(x,132,45,7)}
const c=camera;for(let x=-50;x<800;x+=50)sprite('grass_full',x-c,139,50,53);
sprite('ruin_arch',90-c,79);sprite('wooden_bridge',188-c,104);sprite('wooden_crate',240-c,108);
sprite('stone_pillar',350-c,80);sprite('treasure_chest',443-c,109);sprite('lantern_post',495-c,76);sprite('floating_island',280-c,67);sprite('red_banner',129-c,91);
const moving=inputs.left||inputs.right;
const frame=elapsed<player.attackUntil?4:!player.grounded?5:moving?1+Math.floor(elapsed*10)%3:0;
const im=assets[player.which];if(im?.complete&&im.naturalWidth){const x=Math.round(player.x-c),y=Math.round(player.y);
ctx.save();if(player.dir<0){ctx.translate(x+48,0);ctx.scale(-1,1);ctx.drawImage(im,frame*48,0,48,48,0,y,48,48)}else ctx.drawImage(im,frame*48,0,48,48,x,y,48,48);ctx.restore();
if(elapsed<attackFX)sprite('impact_star',x+(player.dir>0?32:-8),y+10,20,20)}
ctx.font='bold 9px monospace';ctx.fillStyle='#183952';ctx.fillText('P01 - '+player.which.toUpperCase(),8,11);
ctx.fillStyle='rgba(24,40,59,.7)';ctx.fillRect(0,167,320,13);ctx.fillStyle='#f3e2a7';ctx.font='8px monospace';ctx.fillText('separate PNGs  |  nearest-neighbor  |  320x180',9,176);
}
function loop(now){update(now);scene();requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.addEventListener('blur',()=>{for(const k in inputs)inputs[k]=false;pressedJump=false;pressAttack=false});
})();
