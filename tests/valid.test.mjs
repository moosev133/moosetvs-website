import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {serviceLook,slidePoint,canAnimateLink,glidePoint,wanderPoint,readArrival,journeyDuration} from '../src/browser/valid-core.mjs';
import * as THREE from 'three';
import {makeRobot} from '../src/browser/valid-robot.js';
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
