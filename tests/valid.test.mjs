import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {serviceLook,slidePoint,canAnimateLink,glidePoint,wanderPoint,readArrival,journeyDuration,nextTickle,escapePoint,processFrame,PROCESS_DURATION} from '../src/browser/valid-core.mjs';
import * as THREE from 'three';
import {makeRobot} from '../src/browser/valid-robot.js';
import {paintEyes} from '../src/browser/valid-eyes.mjs';
import {initProcess} from '../src/browser/valid-process.mjs';
import {makeWeb} from '../src/browser/valid-web.mjs';
import {webEnvelope,webDeparture} from '../src/browser/valid-web-core.mjs';
import {plans} from '../src/redesign/data.mjs';

test('all languages map to the same four Valid transformations',()=>{
 for(const lang of ['','he/','ar/'])for(const [slug,look] of Object.entries({'ai-automation':'robot','web-development':'web','custom-software':'binary','digital-products':'package'}))assert.equal(serviceLook('/'+lang+'services/'+slug+'/'),look);
 assert.equal(serviceLook('/sign-in/'),null);
});
test('the slide follows the exact drawn cubic curve and is bounded',()=>{
 assert.deepEqual(slidePoint(-1),{x:550,y:35});assert.deepEqual(slidePoint(2),{x:50,y:205});
 let prev=slidePoint(0);for(let n=1;n<=100;n++){const p=slidePoint(n/100);assert(p.x<=prev.x&&p.y>=prev.y);prev=p;}
});
test('continuous journeys retain endpoints and use depth and curved travel',()=>{
 const a={x:100,y:120,z:0},b={x:700,y:500,z:0};
 assert.deepEqual(glidePoint(a,b,0),a);
 const end=glidePoint(a,b,1);for(const k of ['x','y','z'])assert(Math.abs(end[k]-b[k])<1e-8);
 const middle=glidePoint(a,b,.5,80,50);assert.equal(middle.x,450);assert.equal(middle.y,230);assert(middle.z>0);
 let prev=a;for(let i=1;i<=100;i++){const p=glidePoint(a,b,i/100,80,50);assert(Math.hypot(p.x-prev.x,p.y-prev.y)<16);prev=p;}
});
test('wander destinations vary in x, y and depth, without per-frame jitter',()=>{
 const r={left:100,top:200,width:900,height:200},points=Array.from({length:20},(_,i)=>wanderPoint(r,i));
 assert.deepEqual(wanderPoint(r,7),wanderPoint(r,7));
 for(const p of points){assert(p.x>=r.left&&p.x<=r.left+r.width);assert(p.y>=r.top&&p.y<=r.top+r.height);assert(p.z>=-1.2&&p.z<=.8);}
 for(const key of ['x','y','z'])assert(new Set(points.map(p=>p[key])).size>15);
});
test('cross-page handoff is short-lived, route-bound and rejects malformed data',()=>{
 const data={path:'/services/web-development/',look:'web',at:1000},raw=JSON.stringify(data);
 assert.deepEqual(readArrival(raw,data.path,2000),data);
 for(const raw of ['no',null,'{}','[]'])assert.equal(readArrival(raw,data.path,2000),null);
 assert.equal(readArrival(raw,'/sign-in/',2000),null);assert.equal(readArrival(raw,data.path,20000),null);assert.equal(readArrival(raw,data.path,0),null);
 assert.equal(readArrival(JSON.stringify({...data,look:'unknown'}),data.path,2000),null);
 for(const duration of Object.values(journeyDuration))assert(duration>0&&duration<=2000);
});
test('robot has independent mechanical geometry on articulated joints',()=>{
 const names=['Head','Chest','Hips','ArmL','ArmR','ForearmL','ForearmR','ThighL','ThighR','ShinL','ShinR','FootL','FootR'];
 const bones=Object.fromEntries(names.map(n=>[n,new THREE.Bone()])),robot=makeRobot(bones);let parts=0;
 for(const g of robot.groups){assert(g.parent?.isBone);g.traverse(n=>{if(n.isMesh){parts++;assert(!n.isSkinnedMesh);assert(n.geometry.attributes.position.count>0);}});}
 assert(parts>70);robot.setBlend(1);assert(robot.groups.every(g=>g.visible));assert(robot.materials.every(m=>m.opacity===1));robot.setBlend(0);assert(robot.groups.every(g=>!g.visible));
});
test('navigation enhancement preserves modified clicks, external links and downloads',()=>{
 const link={href:'https://moosetvs.com/services/web-development/',target:'',hasAttribute:()=>false};
 const click={button:0,defaultPrevented:false};assert(canAnimateLink(click,link,'https://moosetvs.com'));
 for(const key of ['metaKey','ctrlKey','shiftKey','altKey','defaultPrevented'])assert(!canAnimateLink({...click,[key]:true},link,'https://moosetvs.com'));
 assert(!canAnimateLink({...click,button:1},link,'https://moosetvs.com'));
 assert(!canAnimateLink(click,{...link,target:'_blank'},'https://moosetvs.com'));
 assert(!canAnimateLink(click,{...link,hasAttribute:()=>true},'https://moosetvs.com'));
 assert(!canAnimateLink(click,link,'https://other.test'));
});
test('the production character is the actual compact skinned model with walking clips',async()=>{
 const bytes=await readFile('public/valid/valid.glb');assert(bytes.length<1500000);assert.equal(bytes.toString('utf8',0,4),'glTF');
 const length=bytes.readUInt32LE(12),data=JSON.parse(bytes.toString('utf8',20,20+length));
 assert.equal(data.skins[0].joints.length,14);assert.deepEqual(data.animations.map(a=>a.name).sort(),['idle','walk','wave']);
 const attrs=data.meshes[0].primitives[0].attributes;for(const key of ['POSITION','NORMAL','COLOR_0','JOINTS_0','WEIGHTS_0'])assert(Object.hasOwn(attrs,key));
});
test('home has in-content stages and pricing has lower clear USD starting prices',async()=>{
 const home=await readFile('dist/index.html','utf8'),pricing=await readFile('dist/pricing/index.html','utf8');
 for(const kind of ['hello','expertise','strong','process','slide'])assert(home.includes(`data-valid-stage="${kind}"`));
 assert(!home.includes('class="pricing-card'));assert(!home.includes('moose-companion'));assert(home.includes('href="/pricing/"'));assert(home.includes('A scope illustration, not a price scale.'));
 assert.deepEqual(plans.map(p=>p.price),[269,549,319]);for(const n of [269,549,319])assert(pricing.includes('$'+n));
 for(const name of ['sign-in','sign-up','contact','quote'])assert(!(await readFile(`dist/${name}/index.html`,'utf8')).includes('data-valid-stage'));
 assert(home.includes('M50 205C220 205 410 35 550 35'));assert(home.includes('data-valid-web'));assert(!home.includes('valid-binary'));
 const js=await readFile('src/browser/valid.js','utf8');assert(js.includes('document.hidden'));assert(js.includes('webglcontextlost'));assert(js.includes('location.assign(url)'));assert(js.includes('setTimeout(navigate,journeyDuration[next]+450)'));assert(js.includes('PerspectiveCamera'));
 const particles=await readFile('src/browser/valid-particles.js','utf8');assert(particles.includes('mesh.getVertexPosition'));assert(particles.includes('mesh.skeleton.update()'));
});
test('every fifth tickle escapes and the next click begins a fresh cycle',()=>{
 let count=0;for(let i=1;i<=20;i++){const next=nextTickle(count);assert.equal(next.reaction,i%5===0?'run':'giggle');assert.equal(next.count,i%5);count=next.count;}
 for(const bad of [-1,NaN,undefined,9,1.5])assert.deepEqual(nextTickle(bad),{count:1,reaction:'giggle'});
});
test('escape goes away from the tap and stays inside desktop and mobile viewports',()=>{
 assert(escapePoint({x:500,y:450},{x:470,y:400},{width:1200,height:800}).x>500);
 assert(escapePoint({x:500,y:450},{x:530,y:400},{width:1200,height:800}).x<500);
 for(const width of [320,390,768,1440])for(const x of [50,width/2,width-50]){
  const p=escapePoint({x,y:550},{x,y:500},{width,height:650});assert(p.x>=65&&p.x<=width-65);assert(p.y>=180&&p.y<=615);assert(Math.abs(p.x-x)>70);assert(p.z<0);
 }
});
test('process names reveal at landing, with a pause before each next jump',()=>{
 assert.equal(processFrame(0).landed,0);assert.equal(processFrame(.5).u,0);
 for(let hop=0;hop<4;hop++){
  const start=.5+hop*1.1;assert.equal(processFrame(start+.4).landed,hop);
  assert.equal(processFrame(start+.761).landed,hop+1);assert.equal(processFrame(start+1).u,1);
 }
 assert.equal(processFrame(PROCESS_DURATION).landed,4);assert(processFrame(PROCESS_DURATION).done);
});
test('process progress stays revealed and all content is restored when motion is off',()=>{
 const steps=Array.from({length:5},()=>({dataset:{},getBoundingClientRect:()=>({left:0,top:200,width:100})}));
 const details=Array.from({length:5},()=>({dataset:{}})),paths=Array.from({length:4},()=>({dataset:{},setAttribute(){}}));
 const svg={children:paths,setAttribute(){}},section={dataset:{},querySelectorAll:()=>details};
 const stage={dataset:{validStage:'process'},closest:()=>section,querySelectorAll:s=>s==='[data-valid-step]'?steps:paths,querySelector:()=>svg,getBoundingClientRect:()=>({left:0,top:100,width:600,height:300,bottom:400})};
 let moving=true;const process=initProcess([stage],{canMove:()=>moving,isHidden:()=>false});
 assert.equal(section.dataset.processAnimated,'true');process.reveal(stage,0);assert.equal(steps.filter(s=>s.dataset.landed).length,1);assert.equal(paths.filter(p=>p.dataset.connected).length,0);
 process.reveal(stage,2);process.reveal(stage,1);assert.equal(section.dataset.processProgress,'3');assert.equal(paths.filter(p=>p.dataset.connected).length,2);
 moving=false;process.sync();assert.equal(section.dataset.processAnimated,undefined);assert.equal(details.filter(d=>d.dataset.revealed).length,5);assert.equal(paths.filter(p=>p.dataset.connected).length,4);
});
test('eyes are shaded on the existing skinned face, with clamped eyelid control',()=>{
 const material=new THREE.MeshStandardMaterial(),eyes=paintEyes(material),shader={vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader,uniforms:{}};
 material.onBeforeCompile(shader);assert(shader.vertexShader.includes('validRest=position'));assert(shader.fragmentShader.includes('eyeMask'));assert(shader.fragmentShader.includes('diffuseColor.rgb=mix'));
 assert(shader.fragmentShader.indexOf('float eyeMask')<shader.fragmentShader.indexOf('roughnessFactor=mix'));
 eyes.setBlink(2);assert.equal(shader.uniforms.validBlink.value,1);eyes.setBlink(-1);assert.equal(shader.uniforms.validBlink.value,0);
});
test('localized process enhancement preserves readable semantic fallback and tap control',async()=>{
 for(const lang of ['','he/','ar/']){
  const page=await readFile(`dist/${lang}index.html`,'utf8');assert.equal((page.match(/data-process-detail=/g)||[]).length,5);assert.equal((page.match(/class="valid-step-name"/g)||[]).length,5);assert(page.includes('data-process-links'));assert(page.includes('data-valid-touch hidden aria-label='));assert(page.includes('data-valid-status role="status"'));assert(!page.includes('data-process-animated="true"'));
 }
 const props=await readFile('src/browser/valid-props.js','utf8');assert(!props.includes('props.face'));assert(!props.includes('const face='));
});
test('3D web uses reusable lit tubular geometry, depth and bounded mobile detail',()=>{
 let desktopVertices;
 for(const mobile of [false,true]){
  const web=makeWeb({mobile}),position=web.geometry.attributes.position.array,normal=web.geometry.attributes.normal.array;
  assert.equal(web.group.visible,false);assert.equal(web.stats.drawCalls,2);assert(web.stats.triangles<16000);
  assert(web.group.children[0].material.isMeshPhysicalMaterial);assert(web.group.children[0].material.depthTest);
  if(!mobile)desktopVertices=web.stats.vertices;else assert(web.stats.vertices<desktopVertices);
  const params={origin:new THREE.Vector3(6,5,2),center:new THREE.Vector3(0,0,0),unit:.016,pixelRadius:mobile?170:280,direction:1};
  for(const progress of [.05,.32,.52,.7,.95]){
   web.update({...params,progress,clock:progress*2});assert(web.group.visible);
   assert.equal(web.geometry.attributes.position.array,position);assert(position.every(Number.isFinite));assert(normal.every(Number.isFinite));
   const z=position.filter((_,i)=>i%3===2);assert(Math.max(...z)-Math.min(...z)>.5);
   const ids=web.geometry.index.array,a=new THREE.Vector3().fromArray(position,ids[0]*3),b=new THREE.Vector3().fromArray(position,ids[1]*3),c=new THREE.Vector3().fromArray(position,ids[2]*3),n=new THREE.Vector3().fromArray(normal,ids[0]*3);
   assert(b.sub(a).cross(c.sub(a)).dot(n)>0,'tube triangles must face outward for correct silk lighting');
  }
  web.update({...params,progress:1});assert(!web.group.visible);
  web.update({...params,progress:.2,arriving:true});assert(web.group.visible);
  web.update({...params,progress:.98,arriving:true});assert(!web.group.visible);
  web.hide();assert(!web.group.visible);web.dispose();
 }
});
test('web cast, cupping catch and sling are continuous and mirrored for RTL',()=>{
 const from={x:450,y:500,z:.2},width=1200;
 assert.deepEqual(webDeparture(from,0,{width}).point,from);
 let prior=from;
 for(let i=0;i<=1000;i++){
  const u=i/1000,m=webDeparture(from,u,{width}),rtl=webDeparture({...from,x:width-from.x},u,{width,rtl:true}),env=webEnvelope(u);
  assert(Math.hypot(m.point.x-prior.x,m.point.y-prior.y)<12);prior=m.point;
  assert(Math.abs(rtl.point.x-(width-m.point.x))<1e-8);assert(Math.abs(rtl.point.y-m.point.y)<1e-8);
  for(const key of ['open','cinch','alpha','tension'])assert(env[key]>=0&&env[key]<=1);
 }
 assert(webDeparture(from,1,{width}).point.x>width);assert.equal(webEnvelope(.2).phase,'cast');assert.equal(webEnvelope(.5).phase,'capture');assert.equal(webEnvelope(.8).phase,'release');
 assert.equal(webEnvelope(0).alpha,0);assert.equal(webEnvelope(1).alpha,0);assert.equal(webEnvelope(0,true).cinch,1);assert.equal(webEnvelope(1,true).alpha,0);
});
test('the flat SVG web is replaced by the existing 3D scene without external assets',async()=>{
 const home=await readFile('dist/index.html','utf8'),js=await readFile('src/browser/valid.js','utf8'),css=await readFile('public/valid.css','utf8');
 assert(home.includes('data-valid-canvas data-valid-web="3d"'));assert(!home.includes('valid-web-cast'));assert(!css.includes('valid-web-cast'));
 assert(js.includes('scene.add(web.group)'));assert(js.includes('web.hide()'));assert(!js.includes('webFX'));
});
