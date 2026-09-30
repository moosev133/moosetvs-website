import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {serviceLook,slidePoint,canAnimateLink} from '../src/browser/valid-core.mjs';
import {plans} from '../src/redesign/data.mjs';

test('all languages map to the same four Valid transformations',()=>{
 for(const lang of ['','he/','ar/'])for(const [slug,look] of Object.entries({'ai-automation':'robot','web-development':'web','custom-software':'binary','digital-products':'package'}))assert.equal(serviceLook('/'+lang+'services/'+slug+'/'),look);
 assert.equal(serviceLook('/sign-in/'),null);
});
test('the slide follows the exact drawn cubic curve and is bounded',()=>{
 assert.deepEqual(slidePoint(-1),{x:50,y:35});assert.deepEqual(slidePoint(2),{x:550,y:205});
 let prev=slidePoint(0);for(let n=1;n<=100;n++){const p=slidePoint(n/100);assert(p.x>=prev.x&&p.y>=prev.y);prev=p;}
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
 const js=await readFile('src/browser/valid.js','utf8');assert(js.includes('document.hidden'));assert(js.includes('webglcontextlost'));assert(js.includes('location.assign(url)'));assert(js.includes('duration:540'));
});
