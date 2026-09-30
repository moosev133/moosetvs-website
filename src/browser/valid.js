import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {t} from './site.js';
import {shouldWelcome,readPreference,writePreference,clamp} from './motion-core.mjs';
import {serviceLook,slidePoint,canAnimateLink,ease,glidePoint,wanderPoint,journeyDuration,readArrival} from './valid-core.mjs';
import {makeRobot} from './valid-robot.js';
import {makeBodyDigits} from './valid-particles.js';
import {makeProps,makeShadow} from './valid-props.js';

export async function initValid({canMove,isHidden}){
 const actor=document.querySelector('[data-valid]'),canvas=actor.querySelector('canvas'),bubble=actor.querySelector('.valid-bubble');
 const overlay=document.querySelector('[data-valid-welcome]'),skip=overlay.querySelector('button'),webFX=document.querySelector('[data-valid-web]');
 const stages=[...document.querySelectorAll('[data-valid-stage]')],route=document.body.dataset.route,rtl=document.documentElement.dir==='rtl';
 const baseLook=serviceLook(route)||'natural';
 let storage;try{storage=sessionStorage;}catch{}
 const handoff=readArrival(readPreference(storage,'moosetvs_valid_journey'),location.pathname,Date.now());
 try{storage?.removeItem('moosetvs_valid_journey');}catch{}
 let width=innerWidth,height=innerHeight,frame=0,last=0,clock=0,active=null,look=baseLook,action='',hover=null;
 let intro=null,introResolve,transit=null,arrival=null,travel=null,roam=null,disposed=false,robotBlend=baseLook==='robot'?1:0,digitBlend=baseLook==='binary'?1:0;
 let until=7,seed=Math.random()*1000,restUntil=0,landedAt=0,bubbleTimer,navTimer;
 let point={x:width*.72,y:height*.72,z:0},pose={yaw:0,roll:0,height:160,air:0,sit:0},lastRender=0;
 const times=new WeakMap(),seen=new WeakSet();
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.5:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,width/height,.1,60);camera.position.z=18;
 scene.add(new THREE.HemisphereLight('#fff5e4','#7c927c',2));
 for(const [color,intensity,position] of [['#fff7ed',2.6,[-4,6,9]],['#bcdde8',2,[4,3,-4]],['#ffffff',.8,[2,1,8]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);}
 let gltf;try{gltf=await new GLTFLoader().loadAsync('/valid/valid.glb');}catch(error){renderer.dispose();throw error;}
 const character=gltf.scene,world=new THREE.Group();world.add(character);scene.add(world);
 let mesh;character.traverse(n=>{if(n.isSkinnedMesh){mesh=n;n.frustumCulled=false;}});
 if(!mesh){renderer.dispose();throw Error('Missing character rig');}
 mesh.material=mesh.material.clone();mesh.material.transparent=true;mesh.material.depthWrite=true;
 const bones=Object.fromEntries(mesh.skeleton.bones.map(b=>[b.name,b])),mixer=new THREE.AnimationMixer(character);
 const actions=Object.fromEntries(gltf.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
 const baseline=mesh.skeleton.bones.map(bone=>({bone,q:bone.quaternion.clone(),p:bone.position.clone()}));
 const props=makeProps(bones,character),robot=makeRobot(bones),digits=makeBodyDigits(mesh,innerWidth<760?700:1100),shadow=makeShadow();scene.add(shadow);
 const naturalHeight=()=>innerWidth<760?128:167;
 const unit=()=>2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z/height;
 function project(px,py,z=0){const k=unit()*(1-z/camera.position.z);return new THREE.Vector3((px-width/2)*k,(height/2-py)*k,z);}
 function play(name){if(action===name)return;action=name;for(const [key,a] of Object.entries(actions)){if(key===name)a.reset().setEffectiveWeight(1).play().fadeIn(.22);else a.fadeOut(.22);}}
 function advancePose(dt){
  // Mixer caches constant tracks. Restore its last unmodified pose before adding
  // procedural sitting/flying/flexing so those offsets never accumulate or stick.
  for(const {bone,q,p} of baseline){bone.quaternion.copy(q);bone.position.copy(p);}
  mixer.update(dt);
  for(const saved of baseline){saved.q.copy(saved.bone.quaternion);saved.p.copy(saved.bone.position);}
 }
 function say(key){clearTimeout(bubbleTimer);bubble.textContent=t(key);bubble.classList.add('visible');bubbleTimer=setTimeout(()=>bubble.classList.remove('visible'),2400);}
 function eligible(){return !isHidden()&&!document.hidden&&document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')!=='true';}
 function wake(){if(!frame&&!disposed)frame=requestAnimationFrame(tick);}
 function size(){width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);until=clock+2;wake();}
 function stageRect(node){const r=node.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,bottom:r.bottom};}
 function safePoint(p){
  const h=naturalHeight(),bound=q=>({...q,x:clamp(q.x,h*.43,width-h*.43),y:clamp(q.y,Math.min(height*.55,h+100),height-28)}),start=bound(p);
  const obstacles=[...document.querySelectorAll('.button,h1,h2,h3,.hero-description,.hero-footnote,.service-card p,form')].map(n=>n.getBoundingClientRect()).filter(r=>r.bottom>85&&r.top<height);
  const score=q=>obstacles.reduce((sum,r)=>sum+Math.max(0,Math.min(q.x+h*.36,r.right+8)-Math.max(q.x-h*.36,r.left-8))*Math.max(0,Math.min(q.y,r.bottom+6)-Math.max(q.y-h,r.top-6)),0)+Math.hypot(q.x-start.x,q.y-start.y)*3;
  let best=start,value=score(start);if(value===0)return best;
  for(const dx of [0,-h,h,-2*h,2*h,-3*h,3*h])for(const dy of [0,-h*.6,h*.6]){const q=bound({...p,x:start.x+dx,y:start.y+dy}),cost=score(q);if(cost<value){best=q;value=cost;}}
  return best;
 }
 function stageTarget(node){
  const r=stageRect(node),kind=node.dataset.validStage;
  if(kind==='slide'){const s=node.querySelector('svg').getBoundingClientRect(),p=slidePoint(0);return {x:s.left+p.x/600*s.width,y:s.top+p.y/240*s.height,z:0};}
  if(kind==='process'){const r=node.querySelector('[data-valid-step]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top,z:0};}
  return wanderPoint(r,++seed);
 }
 function chooseStage(){
  const candidates=stages.map(node=>({node,r:stageRect(node)})).filter(({r})=>r.height&&r.bottom>120&&r.top<height-65);
  const target=candidates.sort((a,b)=>Math.abs(a.r.top+a.r.height*.7-height*.63)-Math.abs(b.r.top+b.r.height*.7-height*.63))[0]?.node;
  if(!target||target===active)return;
  if(active)delete active.dataset.validActive;
  active=target;active.dataset.validActive='true';roam=null;
  // Section changes only change the destination, never the character or position.
  const to=safePoint(stageTarget(target));travel={from:{...point},to,start:clock,duration:clamp(Math.hypot(to.x-point.x,to.y-point.y)/420,.85,1.65)};
  until=clock+7;
 }
 function poseBody(kind,sit,air){
  bones.ArmL.scale.set(1,1,1);bones.ArmR.scale.set(1,1,1);bones.Chest.scale.set(1,1,1);character.position.set(0,0,0);
  if(kind==='strong'){
   const amount=ease((clock-landedAt)/.8);bones.ArmL.rotation.z=-.78*amount;bones.ArmR.rotation.z=.78*amount;bones.ForearmL.rotation.z=-1.1*amount;bones.ForearmR.rotation.z=1.1*amount;
   bones.ArmL.scale.set(1.42,1.13,1.42);bones.ArmR.scale.set(1.42,1.13,1.42);bones.Chest.scale.set(1.12,1,1.08);
  }
  if(sit>0){
   // Seat/hip is the contact point; feet extend forward, off the rail.
   bones.ThighL.rotation.x=THREE.MathUtils.lerp(bones.ThighL.rotation.x,-1.42,sit);bones.ThighR.rotation.x=THREE.MathUtils.lerp(bones.ThighR.rotation.x,-1.42,sit);
   bones.ShinL.rotation.x=THREE.MathUtils.lerp(bones.ShinL.rotation.x,.3,sit);bones.ShinR.rotation.x=THREE.MathUtils.lerp(bones.ShinR.rotation.x,.3,sit);
   bones.ThighL.rotation.z=.14*sit;bones.ThighR.rotation.z=-.14*sit;bones.Chest.rotation.x=-.13*sit;
   bones.ArmL.rotation.z=-.3*sit;bones.ArmR.rotation.z=.3*sit;character.position.y=-.53*sit;
  }
  if(air>.05&&sit<.2){bones.ArmL.rotation.z-=air*.75;bones.ArmR.rotation.z+=air*.75;bones.ShinL.rotation.x+=air*.65;bones.ShinR.rotation.x+=air*.45;}
 }
 function render(dt,{binary=0,spread=0,robotAmount,opacity=1}={}){
  const desiredRobot=robotAmount??(look==='robot'?1:0);robotBlend=THREE.MathUtils.damp(robotBlend,desiredRobot,7,dt||.05);
  digitBlend=THREE.MathUtils.damp(digitBlend,binary,14,dt||.05);
  robot.setBlend(robotBlend*opacity);mesh.material.opacity=look==='package'?0:(1-robotBlend)*(1-digitBlend)*opacity;
  // The skeleton and robot are children of this mesh: hiding the mesh would
  // also hide every mechanical component. Fade its material, not its subtree.
  mesh.visible=true;mesh.material.depthWrite=mesh.material.opacity>.95;
  for(const [name,obj] of Object.entries(props))obj.visible=(name===look||name==='face'&&look!=='package')&&digitBlend<.1&&robotBlend<.1;
  world.position.copy(project(point.x,point.y,point.z));world.scale.setScalar(unit()*pose.height/1.9);world.rotation.set(pose.air*.10,pose.yaw,pose.roll);
  world.updateMatrixWorld(true);digits.update({opacity:digitBlend*opacity,spread,time:clock,height,pixelRatio:renderer.getPixelRatio()});
  const s=pose.height*unit()*(1+pose.air*.1);shadow.position.copy(project(point.x,point.y+pose.air*45,-.05));shadow.scale.set(s*.78,s*.17,1);shadow.material.opacity=(1-pose.air*.7)*opacity;shadow.visible=!intro&&spread<.4&&point.y>0;
  actor.dataset.look=look;actor.dataset.validState=intro?'welcome':transit?'departing':arrival?'arriving':travel?'following':pose.sit>.8?'sliding':roam?'wandering':'resting';
  actor.dataset.characterX=String(Math.round(point.x));actor.dataset.characterY=String(Math.round(point.y));actor.dataset.characterHeight=String(Math.round(pose.height));
  bubble.style.left=clamp(point.x,95,width-95)+'px';bubble.style.top=Math.max(80,point.y-pose.height-35)+'px';renderer.render(scene,camera);
 }
 function drawWeb(center,growth=1,opacity=1){
  webFX.removeAttribute('hidden');webFX.style.opacity=String(opacity);webFX.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const origin={x:rtl?0:width,y:0},radius=Math.min(width*.43,310)*growth,cy=center.y-pose.height*.44,lines=[];
  for(let i=0;i<12;i++){const a=i*Math.PI/6,ex=center.x+Math.cos(a)*radius,ey=cy+Math.sin(a)*radius*.72;lines.push(`M${origin.x} 0 Q${(origin.x+ex)/2} ${ey*.08} ${ex} ${ey} L${center.x} ${cy}`);}
  for(let ring=1;ring<=5;ring++){const r=radius*ring/5,points=Array.from({length:13},(_,i)=>{const a=i*Math.PI/6;return [center.x+Math.cos(a)*r,cy+Math.sin(a)*r*.72];});lines.push(points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(''));}
  webFX.querySelector('path').setAttribute('d',lines.join(' '));
 }
 function hideWeb(){webFX.setAttribute('hidden','');}
 function endIntro(){if(!intro)return;intro=null;delete actor.dataset.welcomePhase;document.documentElement.dataset.validWelcoming='false';overlay.hidden=true;overlay.style.opacity='';actor.classList.remove('valid-intro');pose.height=naturalHeight();pose.roll=0;pose.air=0;introResolve?.();introResolve=null;until=clock+4;wake();}
 function welcome(force=false){
  const allowed=force?canMove()&&!isHidden():eligible()&&shouldWelcome({home:route==='',seen:readPreference(storage,'moosetvs_valid_welcome')==='yes',reduced:!canMove(),paused:isHidden(),scrollY});
  if(!allowed||route!=='')return Promise.resolve();
  endIntro();writePreference(storage,'moosetvs_valid_welcome','yes');chooseStage();const landing=safePoint(active?stageTarget(active):{x:width*.65,y:height*.75,z:0});
  intro={start:clock,landing};travel=null;roam=null;overlay.hidden=false;actor.hidden=false;document.documentElement.dataset.validWelcoming='true';actor.classList.add('valid-intro');wake();return new Promise(resolve=>{introResolve=resolve;});
 }
 function introFrame(dt){
  const time=clock-intro.start,mobile=width<760,nearHeight=Math.min(mobile?400:540,height*.68),side=rtl?-1:1;
  actor.dataset.welcomePhase=time<1.15?'peek':time<2.9?'wave':'jump';
  const peek={x:rtl?-nearHeight*.75:width+nearHeight*.75,y:height+nearHeight*.72,z:4},hello={x:rtl?nearHeight*.52:width-nearHeight*.52,y:height+nearHeight*.1,z:3.4};
  look='natural';play(time<1.05?'idle':'wave');advancePose(dt);pose.height=nearHeight;pose.sit=0;pose.air=0;
  if(time<2.9){point=glidePoint(peek,hello,time/1.15);pose.roll=side*.17*(1-ease(time/1.15));pose.yaw=-side*.22;}
  else{const u=clamp((time-2.9)/1.35,0,1);point=glidePoint(hello,intro.landing,u,Math.min(height*.32,230),-side*width*.10);pose.height=THREE.MathUtils.lerp(nearHeight,naturalHeight(),ease(u));pose.yaw=-side*.22+side*Math.sin(u*Math.PI)*.65;pose.roll=side*Math.sin(u*Math.PI)*.2;pose.air=Math.sin(u*Math.PI);overlay.style.opacity=String(1-ease(u));if(u>.12)document.documentElement.dataset.validWelcoming='false';play('idle');if(u>=1){endIntro();landedAt=clock;restUntil=clock+1;}}
  poseBody('hello',0,pose.air);render(dt);
 }
 function stageTargetStable(node,fallback){
  const r=stageRect(node),kind=node.dataset.validStage,time=times.get(node)||0;
  if(kind==='slide'){const s=node.querySelector('svg').getBoundingClientRect(),p=slidePoint(ease((time-.6)/3.5));return {x:s.left+p.x/600*s.width,y:s.top+p.y/240*s.height,z:0};}
  if(kind==='process'&&time<5.2){const steps=[...node.querySelectorAll('[data-valid-step]')],r=steps[Math.min(4,Math.floor(Math.max(0,time-.35)/1.1))].getBoundingClientRect();return {x:r.left+r.width/2,y:r.top,z:0};}
  return {...fallback,y:clamp(r.bottom-25,pose.height+100,height-28)};
 }
 function routine(dt){
  chooseStage();const bounds=active&&stageRect(active),onStage=bounds&&bounds.bottom>150&&bounds.top<height-90,kind=onStage?active.dataset.validStage:'hello';let walking=false,air=0,sit=0;
  look=hover?.look||(kind==='expertise'?'glasses':kind==='strong'?'strong':['robot','web','binary','package'].includes(kind)?kind:baseLook);
  if(travel){
   const u=clamp((clock-travel.start)/travel.duration,0,1),target=active?safePoint(stageTargetStable(active,travel.to)):travel.to;
   point=glidePoint(travel.from,target,u,Math.min(110,Math.abs(target.y-travel.from.y)*.28+35),Math.sin(seed)*40);air=Math.sin(u*Math.PI);
   pose.roll=THREE.MathUtils.damp(pose.roll,(target.x<travel.from.x?1:-1)*air*.17,8,dt);pose.yaw=THREE.MathUtils.damp(pose.yaw,(target.x<travel.from.x?-1:1)*.6,5,dt);
   if(u>=1){travel=null;landedAt=clock;restUntil=clock+.5;if(active&&!seen.has(active)){seen.add(active);if(kind==='strong')say('Small moose. Big possibilities.');}}
  }else{
   const time=(times.get(active)||0)+dt;if(active&&onStage)times.set(active,time);
   if(kind==='slide'){
    const r=active.querySelector('svg').getBoundingClientRect(),u=ease((time-.6)/3.5),p=slidePoint(u),next=slidePoint(Math.min(1,u+.01));sit=ease(time/.5)*(1-ease((time-4.4)/.7));point={x:r.left+p.x/600*r.width,y:r.top+p.y/240*r.height,z:0};pose.yaw=THREE.MathUtils.damp(pose.yaw,-.85,8,dt);pose.roll=THREE.MathUtils.damp(pose.roll,time<4.1?Math.atan2(next.y-p.y,Math.abs(next.x-p.x))*.2:0,7,dt);actor.dataset.slidePhase=u<.3?'top':u<.8?'middle':'bottom';
   }else if(kind==='process'&&time<5.2){
    const platforms=[...active.querySelectorAll('[data-valid-step]')].map(n=>n.getBoundingClientRect()),phase=clamp((time-.35)/1.1,0,4),i=Math.min(3,Math.floor(phase)),u=phase>=4?1:phase-i,a=platforms[i],b=platforms[i+1];point=glidePoint({x:a.left+a.width/2,y:a.top},{x:b.left+b.width/2,y:b.top},u,56);air=Math.sin(u*Math.PI);pose.yaw=rtl?-.6:.6;
   }else if(kind==='strong'&&time<3.5){pose.yaw=THREE.MathUtils.damp(pose.yaw,0,7,dt);pose.roll=0;}
   else if(clock<until&&clock>restUntil){
    if(!roam){const rect=active?stageRect(active):{left:width*.15,top:height*.52,width:width*.7,height:height*.35};roam={from:{...point},to:safePoint(wanderPoint(rect,++seed)),start:clock,duration:2.6+Math.random()*.7,scroll:scrollY};}
    const u=clamp((clock-roam.start)/roam.duration,0,1),target={...roam.to,y:roam.to.y-(scrollY-roam.scroll)*.45},previous={...point};point=glidePoint(roam.from,safePoint(target),u,18,Math.sin(seed)*48);walking=u<.99;pose.yaw=THREE.MathUtils.damp(pose.yaw,Math.sign(point.x-previous.x)*.8+Math.sin(u*Math.PI)*.3,5,dt);pose.roll=THREE.MathUtils.damp(pose.roll,0,7,dt);if(u>=1){roam=null;restUntil=clock+1.2;}
   }else{pose.yaw=THREE.MathUtils.damp(pose.yaw,hover?-.15:0,4,dt);pose.roll=THREE.MathUtils.damp(pose.roll,0,8,dt);}
  }
  if(kind==='package'&&(times.get(active)||0)>2.5)look='natural';
  pose.height=THREE.MathUtils.damp(pose.height,naturalHeight(),7,dt);pose.sit=THREE.MathUtils.damp(pose.sit,sit,10,dt);pose.air=air;play(walking?'walk':'idle');advancePose(dt);poseBody(kind,pose.sit,air);render(dt,{binary:hover?.look==='binary'?.8:0,spread:0});
 }
 function arrive(dt){
  const u=clamp((clock-arrival.start)/arrival.duration,0,1);look=arrival.look;actor.dataset.journeyPhase=look+'-assemble';play('idle');advancePose(dt);const landing=safePoint(active?stageTargetStable(active,arrival.to):arrival.to);pose.height=naturalHeight();pose.sit=0;let binary=0,spread=0;
  if(look==='binary'){point=landing;binary=1-ease((u-.75)/.25);spread=(1-ease(u/.62))*2.3;pose.yaw=Math.sin(u*Math.PI)*.4;pose.air=0;}
  else{point=glidePoint(arrival.from,landing,u,80);pose.air=Math.sin(u*Math.PI);pose.roll=(rtl?-1:1)*Math.sin(u*Math.PI)*.6;pose.yaw=Math.sin(u*Math.PI)*1.2;}
  if(look==='web'&&u<.5)drawWeb(point,1-u,.65*(1-u*2));else hideWeb();poseBody('hello',0,pose.air);render(dt,{binary,spread});
  if(u>=1){arrival=null;delete actor.dataset.journeyPhase;pose.roll=0;pose.air=0;restUntil=clock+.7;landedAt=clock;until=clock+6;}
 }
 function depart(dt){
  const u=clamp((clock-transit.start)/transit.duration,0,1),from=transit.from;look=transit.look;play('idle');advancePose(dt);pose.sit=0;pose.air=0;let binary=0,spread=0;
  actor.dataset.journeyPhase=look+'-'+(u<.35?'cast':u<.65?'capture':'release');
  if(look==='web'){
   const caught={x:from.x+(rtl?-1:1)*55,y:from.y-75,z:1};if(u<.6){point=glidePoint(from,caught,u/.6,20);drawWeb(point,ease(u/.3),ease(u/.16));pose.roll=(rtl?-1:1)*Math.sin(u/.6*Math.PI)*.3;}
   else{const v=(u-.6)/.4;point=glidePoint(caught,{x:rtl?-160:width+160,y:-200,z:-2},v,100);drawWeb(point,1-v*.8,1-v);pose.roll=(rtl?-1:1)*v*1.5;pose.air=1;}
  }else if(look==='binary'){point={...from};pose.height=naturalHeight()*(1+.32*Math.sin(u*Math.PI));binary=ease(u/.3);spread=ease((u-.52)/.48)*2.7;pose.yaw=THREE.MathUtils.damp(pose.yaw,0,5,dt);}
  else{const box=transit.target.getBoundingClientRect(),to={x:box.left+box.width/2,y:box.top+box.height/2,z:-2};point=glidePoint(from,to,u,85);pose.air=Math.sin(u*Math.PI);pose.height=naturalHeight()*(1-ease((u-.55)/.45)*.72);pose.roll=look==='package'?u*.55:0;}
  poseBody('hello',0,pose.air);render(dt,{binary,spread,robotAmount:look==='robot'?ease(u/.5):undefined,opacity:look==='binary'?1-ease((u-.8)/.2):1});if(u>=1)navigate();
 }
 function navigate(){if(!transit)return;const url=transit.url;writePreference(storage,'moosetvs_valid_journey',JSON.stringify({look:transit.look,path:new URL(url).pathname,at:Date.now()}));clearTimeout(navTimer);location.assign(url);}
 function cancelTransit(){clearTimeout(navTimer);transit=null;delete actor.dataset.journeyPhase;hideWeb();pose.height=naturalHeight();pose.roll=0;until=clock+2;wake();}
 function tick(now){
  frame=0;if(disposed||document.hidden)return;
  if(now-lastRender<1000/40){wake();return;}
  const dt=last?Math.min((now-last)/1000,.08):.016;last=now;lastRender=now;
  if(!eligible()){actor.hidden=true;return;}actor.hidden=false;
  if(!canMove()){endIntro();cancelTransit();arrival=null;travel=null;roam=null;hideWeb();look=baseLook;digitBlend=0;robotBlend=baseLook==='robot'?1:0;pose.height=naturalHeight();pose.air=0;pose.sit=0;pose.roll=0;chooseStage();if(active)point=safePoint(stageTarget(active));play('idle');advancePose(.001);poseBody('hello',0,0);render(.1);cancelAnimationFrame(frame);frame=0;return;}
  clock+=dt;
  if(intro)introFrame(dt);else if(transit)depart(dt);else if(arrival)arrive(dt);else routine(dt);
  const time=times.get(active)||0,kind=active?.dataset.validStage,r=active&&stageRect(active),visible=r&&r.bottom>150&&r.top<height-90;if(intro||transit||arrival||travel||roam||clock<until||visible&&(kind==='slide'||kind==='process')&&time<5.8)wake();else last=0;
 }
 function sync(){if(!canMove()||isHidden()){endIntro();cancelTransit();}actor.hidden=!eligible();document.documentElement.dataset.validVisible=String(eligible());last=0;wake();}
 function onScroll(){
  if(intro)endIntro();if(transit||arrival)return;
  // Retarget the current flight; do not restart its clock on every wheel event.
  until=clock+5;roam=null;chooseStage();
  if(!travel){const target=active?safePoint(stageTarget(active)):safePoint({...point,y:height*.69});travel={from:{...point},to:target,start:clock,duration:1.05};}wake();
 }
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',()=>{size();if(intro)intro.landing=safePoint(active?stageTarget(active):point);},{passive:true});
 document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)wake();});skip.addEventListener('click',()=>{endIntro();document.querySelector('.hero .button')?.focus({preventScroll:true});});
 document.addEventListener('keydown',event=>{if(event.key==='Tab')endIntro();if(event.key==='Escape'){endIntro();cancelTransit();}});document.querySelectorAll('.site-header a,.skip').forEach(a=>a.addEventListener('click',endIntro));
 const menu=document.querySelector('.menu-toggle');if(menu)new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
 const prefetched=new Set();
 for(const card of document.querySelectorAll('.service-card')){
  const link=card.querySelector('a'),next=serviceLook(link?.pathname||'');
  const activate=()=>{if(!prefetched.has(link.href)){const hint=document.createElement('link');hint.rel='prefetch';hint.href=link.href;document.head.append(hint);prefetched.add(link.href);}hover={look:next};until=clock+3;roam=null;wake();};
  card.addEventListener('pointerenter',activate);card.addEventListener('focusin',activate);card.addEventListener('pointerdown',activate,{passive:true});const reset=()=>{hover=null;until=clock+1;wake();};card.addEventListener('pointerleave',reset);card.addEventListener('focusout',reset);
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!canAnimateLink(event,link,location.origin)||!canMove()||!eligible()||intro||actor.hidden)return;
  const next=serviceLook(link.pathname)||(link.pathname.replace(/\/$/,'').endsWith('/pricing')?'natural':null);if(!next||link.pathname===location.pathname)return;
  event.preventDefault();cancelTransit();arrival=null;roam=null;travel=null;transit={url:link.href,target:link,look:next,start:clock,duration:journeyDuration[next]/1000,from:{...point}};
  // A real navigation cannot be held hostage by a stalled render loop.
  navTimer=setTimeout(navigate,journeyDuration[next]+450);wake();
 });
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;cancelAnimationFrame(frame);endIntro();if(transit)navigate();actor.hidden=true;hideWeb();document.documentElement.dataset.validSupport='unavailable';});
 window.addEventListener('pagehide',()=>{clearTimeout(navTimer);cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',event=>{if(event.persisted){cancelTransit();endIntro();arrival=null;last=0;wake();}});
 new ResizeObserver(()=>{until=clock+1;wake();}).observe(document.querySelector('main'));
 play('idle');advancePose(.001);size();chooseStage();if(active)point=safePoint(stageTarget(active));travel=null;pose.height=naturalHeight();
 if(canMove()&&(handoff||baseLook==='binary')){arrival={look:handoff?.look||baseLook,start:clock,duration:handoff?.look==='web'?1.4:1.8,from:{x:rtl?-120:width+120,y:-130,z:0},to:{...point}};document.documentElement.dataset.validArrival='true';}
 wake();return {sync,welcome};
}
