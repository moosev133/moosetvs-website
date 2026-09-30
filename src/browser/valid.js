import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {t} from './site.js';
import {shouldWelcome,readPreference,writePreference,clamp} from './motion-core.mjs';
import {serviceLook,slidePoint,canAnimateLink,ease} from './valid-core.mjs';

export async function initValid({canMove,isHidden}){
 const actor=document.querySelector('[data-valid]'),canvas=actor.querySelector('canvas'),bubble=actor.querySelector('.valid-bubble');
 const overlay=document.querySelector('[data-valid-welcome]'),skip=overlay.querySelector('button');
 const stages=[...document.querySelectorAll('[data-valid-stage]')],route=document.body.dataset.route;
 const cardStages=[...document.querySelectorAll('.service-card')].map(card=>{
  const node=card.querySelector('.service-scene');node.dataset.validStage='card-'+serviceLook(card.querySelector('a').pathname);return node;
 });
 const rtl=document.documentElement.dir==='rtl',baseLook=serviceLook(route)||'natural';
 let session;try{session=sessionStorage;}catch{}
 let width=180,height=198,frame=0,last=0,clock=0,active=null,entered=0,look='',action='',until=0,hover=null,intro=false,introResolve,introStart=0,transit=null,bubbleTimer;
 let x=0,y=0,positioned=false,sceneTime=0,lastRender=0,disposed=false,preferredCard=null;
 const visited=new WeakSet(),progress=new WeakMap();
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.5:2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.2,1.2,1.32,-1.32,.05,30);
 camera.position.set(0,1.04,6);camera.lookAt(0,1.04,0);
 scene.add(new THREE.HemisphereLight('#fff5e4','#9ca98b',1.8));
 for(const [color,intensity,position] of [['#fff7ed',2.2,[-3,5,5]],['#bcdde8',1.4,[3,2,-3]],['#ffffff',.6,[2,1,5]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);}
 let gltf;
 try{gltf=await new GLTFLoader().loadAsync('/valid/valid.glb');}catch(error){renderer.dispose();throw error;}
 const character=gltf.scene;scene.add(character);let mesh;character.traverse(n=>{if(n.isSkinnedMesh){mesh=n;n.frustumCulled=false;}});
 if(!mesh){renderer.dispose();throw Error('Missing character rig');}
 mesh.material=mesh.material.clone();mesh.material.transparent=true;
 const bones=Object.fromEntries(mesh.skeleton.bones.map(b=>[b.name,b])),mixer=new THREE.AnimationMixer(character);
 const actions=Object.fromEntries(gltf.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
 const accessories=makeAccessories(bones,character),shadow=makeShadow();scene.add(shadow);
 function size(){const style=getComputedStyle(actor);width=parseFloat(style.width)||180;height=parseFloat(style.height)||198;camera.left=-1.32*width/height;camera.right=1.32*width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);positioned=false;wake();}
 function play(name){if(action===name)return;action=name;for(const [key,a] of Object.entries(actions)){if(key===name)a.reset().setEffectiveWeight(1).play().fadeIn(.18);else a.fadeOut(.18);}}
 function setLook(next){
  if(look===next)return;look=next;actor.dataset.look=next;
  const robot=next==='robot';mesh.material.vertexColors=!robot;mesh.material.color.set(robot?'#a6c3ca':'#ffffff');mesh.material.metalness=robot?.83:0;mesh.material.roughness=robot?.26:.82;mesh.material.needsUpdate=true;
  for(const [key,obj] of Object.entries(accessories))obj.visible=key===next;
  mesh.visible=next!=='package';
 }
 function say(key){clearTimeout(bubbleTimer);bubble.textContent=t(key);bubble.classList.add('visible');bubbleTimer=setTimeout(()=>bubble.classList.remove('visible'),2300);}
 function eligible(){return !isHidden()&&!document.hidden&&document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')!=='true';}
 function wake(){if(!frame&&!disposed)frame=requestAnimationFrame(tick);}
 function chooseStage(){
  const candidates=stages.map(node=>({node,r:node.getBoundingClientRect()})).filter(({r})=>r.height>0&&r.bottom>100&&r.top<innerHeight-25);
  const pool=candidates.length?candidates:cardStages.map(node=>({node,r:node.getBoundingClientRect()})).filter(({r})=>r.top>85&&r.bottom<innerHeight);
  const next=(!candidates.length&&pool.find(c=>c.node===preferredCard)?.node)||pool.sort((a,b)=>Math.abs(a.r.top+a.r.height/2-innerHeight*.62)-Math.abs(b.r.top+b.r.height/2-innerHeight*.62))[0]?.node||null;
  if(next===active)return;
  if(active)delete active.dataset.validActive;
  active=next;entered=clock;sceneTime=progress.get(next)||0;hover=null;
  actor.classList.toggle('valid-in-card',!!next?.dataset.validStage.startsWith('card-'));size();
  if(next){next.dataset.validActive='true';if(!visited.has(next)){visited.add(next);if(next.dataset.validStage==='strong')say('Small moose. Big possibilities.');}positioned=false;until=clock+6;}
 }
 function coordinates(stage,time){
  const r=stage.getBoundingClientRect(),kind=stage.dataset.validStage,pad=Math.min(width*.44,r.width*.22),span=Math.max(0,r.width-2*pad);
  let fraction=rtl?.76:.24,foot=r.bottom-27,tilt=0,jump=0,walking=false;
  if(kind.startsWith('card-'))return {x:r.left+r.width/2,y:r.bottom-2,tilt:0,walking:time<1.1,kind};
  if(kind==='process'){
   const platforms=[...stage.querySelectorAll('[data-valid-step]')].map(n=>n.getBoundingClientRect());
   const travel=clamp(time/.95,0,4),i=Math.min(3,Math.floor(travel)),u=travel>=4?1:travel-i,a=platforms[i],b=platforms[i+1];
   return {x:(a.left+a.width/2)*(1-u)+(b.left+b.width/2)*u,y:a.top*(1-u)+b.top*u-Math.sin(u*Math.PI)*52,tilt:Math.sin(u*Math.PI)*(rtl?.1:-.1),walking:time<3.8,kind};
  }
  if(kind==='slide'){
   const svg=stage.querySelector('svg').getBoundingClientRect(),p=slidePoint(ease((time-.4)/2.3));
   return {x:svg.left+p.x/600*svg.width,y:svg.top+p.y/240*svg.height,tilt:time<2.7?-.24:0,walking:false,kind};
  }
  if(kind==='strong'){fraction=.5;jump=time<.9?Math.sin(time/.9*Math.PI)*13:0;}
  else if(hover&&kind==='expertise'){fraction=hover.fraction;walking=clock-hover.time<.8;}
  else {const travel=ease(time/3.2);fraction=rtl?.78-travel*.47:.22+travel*.47;walking=time<3.2;}
  return {x:r.left+pad+span*fraction,y:foot-jump,tilt,walking,kind};
 }
 function place(px,py,snap=false){
  // Foot point is at ~89% of the orthographic frame. Document coordinates mean
  // scrolling moves Valid with the page, never along a fixed viewport edge.
  const targetX=clamp(px-width/2,0,Math.max(0,document.documentElement.clientWidth-width)),targetY=py+scrollY-height*.895;
  if(!positioned||snap||!canMove()){x=targetX;y=targetY;positioned=true;}else{x+=(targetX-x)*.16;y+=(targetY-y)*.2;}
  actor.style.transform=`translate3d(${x}px,${y}px,0)`;
 }
 function poseDetails(kind,time){
  bones.ArmL.scale.set(1,1,1);bones.ArmR.scale.set(1,1,1);bones.Chest.scale.set(1,1,1);character.scale.setScalar(1);mesh.material.opacity=1;
  if(kind==='strong'){
   const strength=ease(time/.8);bones.ArmL.rotation.z=-.78*strength;bones.ArmR.rotation.z=.78*strength;bones.ForearmL.rotation.z=-1.1*strength;bones.ForearmR.rotation.z=1.1*strength;
   bones.ArmL.scale.set(1.42,1.13,1.42);bones.ArmR.scale.set(1.42,1.13,1.42);bones.Chest.scale.set(1.12,1,1.08);
  }
  if(kind==='slide'){bones.ThighL.rotation.x=-.7;bones.ThighR.rotation.x=-.7;bones.ShinL.rotation.x=.55;bones.ShinR.rotation.x=.55;bones.ArmL.rotation.z=-.3;bones.ArmR.rotation.z=.3;}
  if(look==='binary')mesh.material.opacity=.7;
 }
 function tick(now){
  frame=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(document.hidden)return;if(canMove())clock+=dt;
  if(!eligible()){actor.hidden=true;document.documentElement.dataset.validVisible='false';return;}
  document.documentElement.dataset.validVisible='true';
  actor.hidden=false;
  if(intro){
   const elapsed=(now-introStart)/1000;
   if(!canMove()||elapsed>2.8){finishIntro();return;}
   setLook('natural');play('wave');mixer.update(dt);
   const mobile=innerWidth<760,arrive=ease(elapsed/.6),leave=ease((elapsed-2.15)/.65);
   actor.style.transform='translate3d(0,0,0)';shadow.visible=false;
   const peek=1-ease((elapsed-.3)/.85);
   character.scale.setScalar((mobile?.85:.97)+peek*(mobile?.8:.63));character.rotation.set(0,-.18,-.13+arrive*.09);
   character.position.set(camera.right*(mobile?.15:.52),(mobile?-.22:-.13)-peek*(mobile?1.43:1.07)-(1-arrive)*1.3-leave*4,0);
   overlay.style.opacity=String(1-leave);renderer.render(scene,camera);wake();return;
  }
  chooseStage();
  if(!active&&!transit){actor.hidden=true;return;}
  const activeBounds=active?.getBoundingClientRect();
  const sceneReady=activeBounds&&activeBounds.bottom<innerHeight+20;
  if(canMove()&&sceneReady)sceneTime+=dt;
  if(active)progress.set(active,sceneTime);
  const kind=active?.dataset.validStage||'hello',p=active?coordinates(active,canMove()?sceneTime:10):null;
  let next=hover?.look||(kind==='expertise'?'glasses':['robot','web','binary','package'].includes(kind)?kind:baseLook);
  if(kind.startsWith('card-'))next=kind.slice(5);
  if(kind==='strong')next='strong';
  if(kind==='package'&&sceneTime>2.2)next='natural';
  actor.dataset.travelling=String(kind==='web'&&sceneTime<1.1||transit?.look==='web');
  setLook(next);play(p?.walking?'walk':'idle');
  if(canMove())mixer.update(dt);else mixer.update(.001);
  poseDetails(kind,canMove()?sceneTime:10);
  character.rotation.x=0;character.rotation.z=p?.tilt||0;character.position.set(0,0,0);
  const yaw=p?.walking?(rtl?-.7:.7):0;character.rotation.y=THREE.MathUtils.damp(character.rotation.y,yaw,7,dt||.016);
  if(p)place(p.x,p.y);
  if(transit){
   const u=clamp((now-transit.start)/transit.duration,0,1);setLook(transit.look);play('walk');
   const end=transit.target.getBoundingClientRect();const ex=end.left+end.width/2,ey=end.top+Math.min(12,end.height/2);
   place(transit.x+(ex-transit.x)*ease(u),transit.y+(ey-transit.y)*ease(u)-Math.sin(u*Math.PI)*60,true);
   if(look==='web'){character.rotation.z=-.4*Math.sin(u*Math.PI);character.position.y=Math.sin(u*Math.PI)*.25;}
   if(look==='binary'){mesh.material.opacity=1-u;actor.querySelector('.valid-binary').style.transform=`translateY(${-u*50}px) scale(${1+u*.5})`;}
   if(look==='package')character.rotation.z=u*Math.PI*.2;
   if(u>=1){const url=transit.url;transit=null;location.assign(url);return;}
  }
  shadow.visible=look!=='package';shadow.scale.setScalar(kind==='strong'?1.15:1);
  if(now-lastRender>30||!canMove()){renderer.render(scene,camera);lastRender=now;}
  // Motion completes and rests. No never-ending entrance, idle or service loops.
  if(canMove()&&(sceneReady&&sceneTime<5||clock<until||transit||hover&&clock-hover.time<2))wake();
 }
 function finishIntro(){
  if(!intro)return;intro=false;overlay.hidden=true;overlay.style.opacity='';actor.classList.remove('valid-intro');character.scale.setScalar(1);character.position.set(0,0,0);character.rotation.set(0,0,0);positioned=false;size();
  const resolve=introResolve;introResolve=null;resolve?.();wake();
 }
 async function welcome(force=false){
  if(intro)finishIntro();
  const allowed=force?canMove()&&!isHidden():eligible()&&shouldWelcome({home:route==='',seen:readPreference(session,'moosetvs_valid_welcome')==='yes',reduced:!canMove(),paused:isHidden(),scrollY});
  if(!allowed||route!=='')return;
  writePreference(session,'moosetvs_valid_welcome','yes');intro=true;overlay.hidden=false;actor.hidden=false;actor.classList.add('valid-intro');introStart=performance.now();size();wake();
  return new Promise(resolve=>{introResolve=resolve;});
 }
 function sync(){if((!canMove()||isHidden())&&intro)finishIntro();actor.hidden=!eligible();document.documentElement.dataset.validVisible=String(eligible());last=0;wake();}
 function onScroll(){if(intro)finishIntro();until=clock+.7;wake();}
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('wheel',()=>{if(intro)finishIntro();},{passive:true});
 window.addEventListener('touchstart',event=>{if(intro&&event.target!==skip)finishIntro();},{passive:true});
 window.addEventListener('resize',()=>{finishIntro();size();},{passive:true});
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)finishIntro();else wake();});
 skip.addEventListener('click',()=>{finishIntro();document.querySelector('.hero .button')?.focus({preventScroll:true});});
 document.addEventListener('keydown',event=>{if(event.key==='Tab'&&intro)finishIntro();if(event.key==='Escape'){finishIntro();if(transit){transit=null;positioned=false;wake();}}});
 document.querySelectorAll('.site-header a,.skip').forEach(a=>a.addEventListener('click',finishIntro));
 const menu=document.querySelector('.menu-toggle');if(menu)new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
 for(const card of document.querySelectorAll('.service-card')){
  const link=card.querySelector('a'),next=serviceLook(link?.pathname||'');
  const activate=()=>{
   preferredCard=card.querySelector('.service-scene');
   if(!active||active.dataset.validStage!=='expertise'){until=clock+1.6;wake();return;}
   const cards=[...card.parentNode.children],i=cards.indexOf(card);hover={look:next,fraction:rtl?1-(i+.5)/cards.length:(i+.5)/cards.length,time:clock};until=clock+1.6;wake();
  };
  card.addEventListener('pointerenter',activate);card.addEventListener('focusin',activate);card.addEventListener('pointerdown',activate,{passive:true});
  const reset=()=>{preferredCard=null;hover=null;until=clock+.5;wake();};card.addEventListener('pointerleave',reset);card.addEventListener('focusout',reset);
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!canAnimateLink(event,link,location.origin)||!canMove()||!eligible()||intro||actor.hidden)return;
  const next=serviceLook(link.pathname)||(link.pathname.replace(/\/$/,'').endsWith('/pricing')?'natural':null);
  if(!next)return;
  const bounds=link.getBoundingClientRect();if(bounds.bottom<0||bounds.top>innerHeight)return;
  event.preventDefault();const r=actor.getBoundingClientRect();
  transit={url:link.href,target:link,look:next,start:performance.now(),duration:540,x:r.left+r.width/2,y:r.top+r.height*.895};until=clock+1;wake();
 });
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;cancelAnimationFrame(frame);finishIntro();actor.hidden=true;document.documentElement.dataset.validSupport='unavailable';});
 window.addEventListener('pagehide',()=>{finishIntro();cancelAnimationFrame(frame);frame=0;});
 window.addEventListener('pageshow',()=>{last=0;positioned=false;wake();});
 new ResizeObserver(()=>{positioned=false;wake();}).observe(document.querySelector('main'));
 setLook(baseLook);play('idle');mixer.update(.001);size();wake();
 return {sync,welcome};
}

function makeShadow(){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(35,44,28,.3)');g.addColorStop(1,'rgba(35,44,28,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,.35),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.015;return shadow;}

function makeAccessories(bones,character){
 const mat=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:.45,metalness});
 const gold=mat('#bda76b',.55),teal=mat('#235966'),brown=mat('#97613c'),silver=mat('#91b8c6',.8);
 const add=(group,geometry,material,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m;};
 const line=(group,points,material,r=.008)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return add(group,new THREE.TubeGeometry(curve,12,r,6,false),material,0,0,0);};
 const glasses=new THREE.Group();glasses.position.set(0,.265,.40);bones.Head.add(glasses);
 for(const side of [-1,1]){add(glasses,new THREE.TorusGeometry(.11,.014,8,32),gold,side*.15,0,0,1,.88,1);line(glasses,[[side*.26,0,0],[side*.29,.008,-.12],[side*.29,0,-.32]],gold);}
 line(glasses,[[-.045,0,0],[0,.022,.012],[.045,0,0]],gold);
 const robot=new THREE.Group();bones.Head.add(robot);
 const glow=new THREE.MeshStandardMaterial({color:'#9fe9e4',emissive:'#59bdc5',emissiveIntensity:1.1,roughness:.3});
 for(const side of [-1,1]){add(robot,new THREE.SphereGeometry(.047,16,10),glow,side*.16,.263,.355,1,1.1,.25);add(robot,new THREE.SphereGeometry(.057,12,8),silver,side*.31,.24,.04);}
 const antenna=add(robot,new THREE.CylinderGeometry(.008,.008,.18,8),silver,0,.69,-.03);add(robot,new THREE.SphereGeometry(.032,12,8),glow,0,.79,-.03);
 const web=new THREE.Group();bones.Chest.add(web);web.position.set(0,-.055,.222);
 add(web,new THREE.CircleGeometry(.077,24),mat('#984f40'),0,0,0);
 const ink=mat('#202f2d');add(web,new THREE.SphereGeometry(.025,12,8),ink,0,-.008,.012,.6,1.2,.25);add(web,new THREE.SphereGeometry(.016,12,8),ink,0,.022,.012,1,1,.25);
 for(const side of [-1,1])for(let i=0;i<4;i++)line(web,[[side*.008,.015-i*.01,.016],[side*.039,.04-i*.021,.016],[side*.055,.06-i*.038,.016]],ink,.0035);
 const strong=new THREE.Group();bones.Chest.add(strong);
 // Small warm shoulder volumes complement the flexed/skinned arms, not a new mascot.
 for(const side of [-1,1])add(strong,new THREE.SphereGeometry(.11,16,12),brown,side*.275,.005,.015,1.13,.95,1);
 const parcel=new THREE.Group();character.add(parcel);
 add(parcel,new THREE.BoxGeometry(.72,.66,.5),mat('#bd9d64'),0,.42,0);
 add(parcel,new THREE.BoxGeometry(.11,.665,.508),mat('#e2cf9f'),0,.42,0);
 add(parcel,new THREE.BoxGeometry(.728,.06,.51),mat('#cbae78'),0,.72,0);
 const label=add(parcel,new THREE.PlaneGeometry(.23,.14),mat('#f1ecd8'),.16,.48,.257);
 for(let i=0;i<5;i++)add(parcel,new THREE.BoxGeometry(.008+(i%2)*.004,.065,.004),teal,.08+i*.024,.48,.264);
 const twig=(side)=>line(parcel,[[side*.18,.75,0],[side*.22,.88,0],[side*.34,.90,0],[side*.38,1.02,0]],gold,.023);
 twig(-1);twig(1);for(const s of [-1,1])line(parcel,[[s*.26,.9,0],[s*.28,1.04,0]],gold,.019);
 const binary=new THREE.Group();character.add(binary);
 for(let i=0;i<8;i++){const m=add(binary,new THREE.BoxGeometry(.025,.025,.025),i%2?teal:gold,Math.cos(i*Math.PI/4)*.55,.3+i*.17,.12);m.rotation.z=i*.3;}
 return {glasses,robot,web,strong,package:parcel,binary};
}
