import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {shouldWelcome,letters,onceGate,readPreference,writePreference} from '../src/browser/motion-core.mjs';
import {projects} from '../src/redesign/data.mjs';
import {href} from '../src/redesign/layout.mjs';
import {reelIndex,reelCanPlay,advanceReel,REEL_DURATION} from '../src/browser/project-reel-core.mjs';
import {agentRoles} from '../src/redesign/project-scenes.mjs';

test('welcome never traps returning, scrolled or reduced-motion visitors',()=>{
 const fresh={home:true,seen:false,reduced:false,paused:false,scrollY:0};
 assert.equal(shouldWelcome(fresh),true);
 for(const override of [{home:false},{seen:true},{reduced:true},{paused:true},{scrollY:100}])assert.equal(shouldWelcome({...fresh,...override}),false);
});
test('service scenes can only be triggered once per page mount',()=>{
 const gate=onceGate(),a={},b={};assert.equal(gate.take(a),true);assert.equal(gate.take(a),false);assert.equal(gate.take(b),true);assert.equal(gate.has(a),true);
});
test('typing preserves whole Unicode graphemes and RTL strings',()=>{
 for(const [text,lang] of [['Build smarter.','en'],['בונים חכם יותר.','he'],['نبني بذكاء.','ar'],['👨‍👩‍👧‍👦 é','en']])assert.equal(letters(text,lang).join(''),text);
 assert.equal(letters('é').length,1);assert.equal(letters('👨‍👩‍👧‍👦').length,1);
});
test('unavailable browser storage is non-fatal',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.equal(readPreference(blocked,'key','fallback'),'fallback');assert.doesNotThrow(()=>writePreference(blocked,'key','yes'));
});
test('project reel loops in both directions without skipping after a suspended tab',()=>{
 assert.equal(reelIndex(4,4),0);assert.equal(reelIndex(-1,4),3);assert.equal(reelIndex(9,4),1);assert.equal(reelIndex(1,0),0);
 assert.deepEqual(advanceReel(REEL_DURATION-10,20),{elapsed:0,advance:true});
 assert.deepEqual(advanceReel(0,90000),{elapsed:100,advance:false});
 assert.deepEqual(advanceReel(0,-5),{elapsed:0,advance:false});
});
test('showcase rotation respects visibility, reading pauses, and motion preferences',()=>{
 const active={visible:true,hidden:false,reduced:false,globalPaused:false,paused:false,hovered:false};
 assert.equal(reelCanPlay(active),true);
 for(const condition of [{visible:false},{hidden:true},{reduced:true},{globalPaused:true},{paused:true},{hovered:true}])assert.equal(reelCanPlay({...active,...condition}),false);
});
test('home has one banner, four manual destinations, and an all-projects button below it',async()=>{
 for(const lang of ['en','he','ar']){
  const html=(await readFile(`dist${href('',lang)}index.html`,'utf8')).replace(/<script[\s\S]*?<\/script>/g,'');
  assert.equal((html.match(/data-project-reel\b/g)||[]).length,1);
  assert.equal((html.match(/data-reel-slide\b/g)||[]).length,4);
  assert.equal((html.match(/data-reel-select="/g)||[]).length,4);
  assert(!html.includes('portfolio-grid'));
  assert(html.indexOf('class="reel-footer"')>html.indexOf('data-reel-controls'));
  assert(html.slice(html.indexOf('class="reel-footer"')).includes(`href="${href('work',lang)}"`));
  assert(html.includes('data-reel-pause'));assert(html.includes('data-reel-next'));assert(html.includes('aria-live="polite"'));
 }
});
test('four animated covers preserve genuine galleries and exactly twelve distinct agent roles',async()=>{
 assert.equal(agentRoles.length,12);assert.equal(new Set(agentRoles).size,12);
 for(const lang of ['en','he','ar']){
  const home=await readFile(`dist${href('',lang)}index.html`,'utf8');
  const work=await readFile(`dist${href('work',lang)}index.html`,'utf8');
  for(const html of [home,work]){
   for(const scene of ['engine','aurum','reemove','solar'])assert.equal((html.match(new RegExp(`data-project-scene="${scene}"`,'g'))||[]).length,1);
   assert.equal((html.match(/data-agent-role="/g)||[]).length,12);
   assert(html.includes('class="engine-bot"'));assert(html.includes('class="sport-runner"'));assert(html.includes('class="solar-energy"'));
  }
 }
 const css=await readFile('public/project-showcase.css','utf8');
 assert(css.includes('prefers-reduced-motion'));assert(css.includes('animation-play-state:paused'));assert(css.includes('data-motion=off'));
 const runtime=await readFile('src/browser/project-reel.js','utf8');
 assert(runtime.includes('slide.inert=i!==index'));assert(runtime.includes('visibilitychange'));assert(runtime.includes('IntersectionObserver'));
 assert(runtime.includes("addEventListener('focusin'"));assert(runtime.includes("addEventListener('pointerup'"));
});
test('homepage has accessible final text, four distinct scenes, and four real featured projects',async()=>{
 const featured=projects.filter(p=>p.featured);assert.equal(featured.length,4);assert.deepEqual(featured.map(p=>p.visual),['engine','aurum','reemove','solar']);
 assert(!featured.some(p=>['dashboard','automation','restaurant'].includes(p.visual)));
 for(const lang of ['en','he','ar']){
  const html=await readFile(`dist${href('',lang)}index.html`,'utf8');
  assert.match(html,/<h1 data-type-heading aria-label="[^"]+">/);
  assert.equal((html.match(/class="type-ink"/g)||[]).length,3);
  for(const scene of ['robot','website','software','products'])assert(html.includes(`data-motion-scene="${scene}"`));
  assert(html.includes('data-moose-mood="happy"'));assert(html.includes('data-moose-mood="amazed"'));
  assert(html.includes('hidden data-valid'));assert(html.includes('hidden data-valid-welcome'));
  assert(html.includes('data-pet-toggle'));assert(html.includes('data-motion-toggle'));assert(html.includes('data-skip-welcome'));
  assert(!html.includes('style="--wave-height'));
 }
 const css=await readFile('public/motion.css','utf8');assert(!css.includes('infinite'));assert(css.includes('prefers-reduced-motion'));assert(css.includes('.scene-complete'));
});
