import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {shouldWelcome,letters,onceGate,readPreference,writePreference} from '../src/browser/motion-core.mjs';
import {projects} from '../src/redesign/data.mjs';
import {href} from '../src/redesign/layout.mjs';

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
test('homepage has accessible final text, four distinct scenes, and unique featured concepts',async()=>{
 const featured=projects.filter(p=>p.featured);assert.equal(featured.length,3);assert.deepEqual(featured.map(p=>p.visual),['spaces','voice','fulfilment']);
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
