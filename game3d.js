import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
const game=window.frontline, {map,N,mobile}=game;
const canvas=document.querySelector('#world3d');
const renderer=new T.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.1:1.5));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const scene=new T.Scene();scene.background=new T.Color(0xa6b5bc);scene.fog=new T.FogExp2(0xa6b5bc,.016);
const cam=new T.PerspectiveCamera(65,1,.035,115);scene.add(cam);
scene.add(new T.HemisphereLight(0xdce9f3,0x77705e,2.1));
const sun=new T.DirectionalLight(0xffe3bf,2.5);sun.position.set(-10,30,-10);sun.target.position.set(28,0,28);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:1,far:100});sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;scene.add(sun,sun.target);
function texture(base,brick=false){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),im=x.createImageData(256,256);let seed=5;for(let i=0;i<im.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;let n=((seed>>>24)-128)*.22;for(let j=0;j<3;j++)im.data[i+j]=base[j]+n;im.data[i+3]=255}x.putImageData(im,0,0);if(brick){x.strokeStyle='rgba(40,35,28,.22)';x.lineWidth=2;for(let y=0;y<256;y+=64){x.beginPath();x.moveTo(0,y);x.lineTo(256,y);x.stroke();for(let a=(y/64%2)*64;a<256;a+=128){x.beginPath();x.moveTo(a,y);x.lineTo(a,y+64);x.stroke()}}}let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t}
const M=(color,r=.85,metalness=0,map=null)=>new T.MeshStandardMaterial({color,roughness:r,metalness,map});
const concrete=M(0xffffff,.95,0,texture([151,143,128],true)),grey=M(0xffffff,.97,0,texture([122,133,137],true)),crate=M(0xffffff,.98,0,texture([113,92,65],true)),asphaltTex=texture([83,85,81]);asphaltTex.repeat.set(28,28);const asphalt=M(0xffffff,.96,0,asphaltTex),glass=M(0x34434a,.25,.45),trim=M(0x666b63,.8),dark=M(0x222a2c,.63,.35),steel=M(0x58605c,.58,.5),sand=M(0x8b856f),cloth=M(0x414b3b),vest=M(0x343a31),skin=M(0x9b785e),rubber=M(0x202524),paint=M(0xb9b299);
const cube=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,16,12),caps=new T.CapsuleGeometry(.5,1,4,10);
function part(parent,geo,mat,x,y,z,sx,sy,sz,shadow=true){const a=new T.Mesh(geo,mat);a.position.set(x,y,z);a.scale.set(sx,sy,sz);a.castShadow=shadow;a.receiveShadow=true;parent.add(a);return a}
const box=(p,m,x,y,z,a,b,c,shadow=true)=>part(p,cube,m,x,y,z,a,b,c,shadow);
box(scene,asphalt,N, -.12,N,N*2,.22,N*2,false);
const used=map.map(r=>r.map(()=>false));
for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=map[y][x];if(!t||used[y][x])continue;let a=1,b=1;while(x+a<N&&map[y][x+a]===t&&!used[y][x+a])a++;outer:while(y+b<N){for(let k=0;k<a;k++)if(map[y+b][x+k]!==t||used[y+b][x+k])break outer;b++}for(let j=0;j<b;j++)for(let i=0;i<a;i++)used[y+j][x+i]=true;const X=x*2+a,Z=y*2+b,A=a*2,B=b*2,edge=x===0||y===0||x+a===N||y+b===N,H=edge?3.3:t===3?2:5.3+(x%3)*.55;
box(scene,t===1?concrete:t===2?grey:crate,X,H/2,Z,A,H,B);
box(scene,trim,X,H+.06,Z,A+.07,.12,B+.07);
if(edge)continue;
if(t===3){for(let i=0;i<a;i++){box(scene,steel,x*2+i*2+1,.18,Z-B/2-.016,1.92,.15,.03);box(scene,steel,x*2+i*2+1,H-.17,Z+B/2+.016,1.92,.15,.03)}continue}
for(let level=1.8;level<H-.7;level+=2.2){for(let i=0;i<a;i++){for(const sign of [-1,1]){const z=Z+sign*(B/2+.019);box(scene,glass,x*2+i*2+1,level,z,1.08,.86,.04,false);box(scene,trim,x*2+i*2+1,level-.47,z+sign*.025,1.2,.10,.09,false)}}for(let j=0;j<b;j++){for(const sign of [-1,1]){const xx=X+sign*(A/2+.019);box(scene,glass,xx,level,y*2+j*2+1,.04,.86,1.08,false)}}}
box(scene,dark,X,1,Z-B/2-.028,1.06,2,.06,false);
}
for(let i=3;i<N-3;i+=2){if(!map[10][i])box(scene,paint,i*2+1,.004,21,1,.009,.07,false);if(!map[i][18])box(scene,paint,37,.004,i*2+1,.07,.009,1,false)}
function gun(parent,m=dark){const g=new T.Group();parent.add(g);box(g,m,0,0,-.12,.105,.125,.38);box(g,steel,0,.018,-.34,.082,.07,.24);box(g,dark,0,.015,-.51,.038,.041,.20);box(g,rubber,0,-.07,.1,.10,.12,.17);box(g,dark,0,-.145,-.08,.075,.20,.08).rotation.x=-.16;box(g,rubber,0,-.105,.055,.065,.15,.07).rotation.x=.22;box(g,dark,0,.086,-.18,.045,.045,.05);box(g,steel,0,.086,-.37,.032,.055,.035);return g}
const fp=new T.Group();cam.add(fp);const rifle=gun(fp),pistol=new T.Group();fp.add(pistol);box(pistol,dark,0,0,-.08,.075,.085,.22);box(pistol,rubber,0,-.09,-.015,.06,.16,.075).rotation.x=.17;box(pistol,steel,0,.04,-.13,.074,.035,.18);
part(fp,caps,cloth,-.105,-.09,.07,.075,.18,.075).rotation.z=-.65;part(fp,caps,cloth,.09,-.10,.12,.075,.20,.075).rotation.z=.3;part(fp,ball,vest,-.055,-.045,-.13,.06,.065,.07);part(fp,ball,vest,.045,-.055,.03,.055,.07,.06);
const light=new T.PointLight(0xffbb5b,0,4);light.position.set(0,.03,-.65);fp.add(light);
const muzzle=part(fp,ball,new T.MeshBasicMaterial({color:0xffc46c}),0,.02,-.65,.075,.075,.16,false);muzzle.visible=false;
let model=null;const units=new Map();
function fallback(){const root=new T.Group(),body=new T.Group();root.add(body);part(body,caps,cloth,0,1.19,0,.23,.25,.145);box(body,vest,0,1.23,.09,.36,.38,.22);for(let i=-1;i<=1;i++)box(body,sand,i*.11,1.16,.22,.085,.16,.07);part(body,ball,skin,0,1.62,0,.105,.14,.105);part(body,ball,cloth,0,1.69,-.015,.128,.105,.13);box(body,vest,0,1.64,.09,.19,.05,.07);const legs=[];for(const side of [-1,1]){let l=new T.Group();l.position.set(side*.115,.88,0);body.add(l);part(l,caps,cloth,0,-.2,0,.1,.21,.095);part(l,caps,cloth,0,-.55,0,.085,.18,.085);box(l,rubber,0,-.78,.045,.17,.14,.26);legs.push(l);let arm=part(body,caps,cloth,side*.24,1.22,.10,.085,.19,.085);arm.rotation.x=-.95;arm.rotation.z=side*.25;part(body,ball,vest,side*.15,1.13,.31,.062,.065,.065)}const weapon=gun(body);weapon.rotation.y=Math.PI;weapon.position.set(.15,1.22,.36);return{root,legs}}
const status=document.querySelector('#graphics-status');
new GLTFLoader().load('https://threejs.org/examples/models/gltf/Soldier.glb',g=>{model=g;for(const u of units.values())scene.remove(u.root);units.clear();status.textContent='3D • Skeletli askar modeli';},undefined,()=>{status.textContent='3D • Zaxira askar modeli'});
function make(){if(!model){const u=fallback();scene.add(u.root);return u}const root=new T.Group(),actor=clone(model.scene);root.add(actor);actor.updateMatrixWorld(true);let bounds=new T.Box3().setFromObject(actor),height=bounds.max.y-bounds.min.y;if(height>0){actor.scale.setScalar(1.8/height);actor.position.y=-bounds.min.y*1.8/height}actor.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});const mixer=new T.AnimationMixer(actor),actions={};for(const clip of model.animations){const n=clip.name.toLowerCase();if(n.includes('idle'))actions.idle=mixer.clipAction(clip);if(n.includes('walk'))actions.walk=mixer.clipAction(clip);if(n.includes('run'))actions.run=mixer.clipAction(clip)}const current=actions.idle||actions.walk;if(current)current.play();scene.add(root);return{root,mixer,actions,current}}
function resize(){const W=innerWidth,H=innerHeight;renderer.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
let prev=performance.now(),phase=0,px=0,py=0;
game.render=state=>{const {p,bots,w,aim,flash,load,dead,playing}=state,now=performance.now(),dt=Math.min(.05,(now-prev)/1000);prev=now;
const horizontal=aim?.77:1.12;const vertical=2*Math.atan(Math.tan(horizontal/2)/cam.aspect);cam.fov=T.MathUtils.radToDeg(vertical);cam.updateProjectionMatrix();
const pitch=Math.atan(2*p.pitch*Math.tan(vertical/2)),walk=Math.hypot(p.x-px,p.y-py)>.001;px=p.x;py=p.y;if(walk&&playing)phase+=dt*11;cam.position.set(p.x*2,1.57+(walk?Math.sin(phase)*.025:0),p.y*2);cam.lookAt(cam.position.x+Math.cos(p.a)*Math.cos(pitch),cam.position.y+Math.sin(pitch),cam.position.z+Math.sin(p.a)*Math.cos(pitch));
fp.position.set(aim?0:.24+(walk?Math.sin(phase*.5)*.012:0),aim?-.18:-.28+(load?-.16:0),-.36+flash*.65);fp.rotation.x=load?-.35:flash*.5;fp.visible=!dead;rifle.visible=w===0;pistol.visible=w===1;light.intensity=flash?2.5:0;muzzle.visible=!!flash;muzzle.position.z=w===0?-.65:-.22;
const live=new Set(bots);for(const [b,u] of units)if(!live.has(b)){scene.remove(u.root);u.mixer?.stopAllAction();units.delete(b)}
for(const b of bots){let u=units.get(b);if(!u){u=make();units.set(b,u)}let moving=Number.isFinite(u.x)&&Math.hypot(b.x-u.x,b.y-u.y)>.0004;u.x=b.x;u.y=b.y;u.root.position.set(b.x*2,0,b.y*2);u.root.rotation.y=Math.PI/2-b.dir;if(u.mixer){const next=moving?(u.actions.walk||u.actions.run||u.actions.idle):(u.actions.idle||u.actions.walk);if(next&&next!==u.current){next.reset().fadeIn(.18).play();u.current?.fadeOut(.18);u.current=next}u.mixer.update(playing?dt:0)}else{for(let i=0;i<2;i++)u.legs[i].rotation.x=moving?Math.sin(now*.008+i*Math.PI)*.5:0}}
renderer.render(scene,cam);
};
document.body.classList.add('webgl-ready');status.textContent='3D • Model yuklanmoqda';
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();game.render=null;document.body.classList.remove('webgl-ready');status.textContent='Moslik rejimi'});
