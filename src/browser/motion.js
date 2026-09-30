import {t} from './site.js';
import {clamp,letters,onceGate,readPreference,writePreference} from './motion-core.mjs';

// Every enhancement is optional; content, navigation, forms and auth stay native.
function initMotion(){
 const root=document.documentElement,media=matchMedia('(prefers-reduced-motion: reduce)');
 let storage;try{storage=localStorage;}catch{}
 let paused=readPreference(storage,'moosetvs_motion')==='off',hidden=readPreference(storage,'moosetvs_pet')==='hidden';
 let companion,typingToken=0,chartFrame=0,heroStarted=false;const boot=performance.now();
 const canMove=()=>!paused&&!media.matches;
 const motionButton=document.querySelector('[data-motion-toggle]'),petButton=document.querySelector('[data-pet-toggle]'),replay=document.querySelector('[data-intro-replay]');
 document.querySelector('[data-motion-tools]').hidden=false;
 const stages=[...document.querySelectorAll('[data-valid-stage]')];
 petButton.hidden=!stages.length;
 function sync(){
  root.dataset.motion=canMove()?'on':'off';
  motionButton.textContent=t(canMove()?'Pause motion':'Resume motion');motionButton.setAttribute('aria-pressed',String(!canMove()));motionButton.disabled=media.matches;
  petButton.textContent=t(hidden?'Show Valid':'Hide Valid');petButton.setAttribute('aria-pressed',String(!hidden));
  companion?.sync();
 }
 const lines=[...document.querySelectorAll('.hero-type-line')].map(line=>({line,ink:line.querySelector('.type-ink'),text:line.querySelector('.type-layout').textContent}));
 const dashboard=document.querySelector('[data-hero-dashboard]'),chart=dashboard?.querySelector('.chart-line'),area=dashboard?.querySelector('.chart-area');
 const counters=[...(dashboard?.querySelectorAll('.workspace-metrics b')||[])].map(b=>({node:b.firstChild,text:b.firstChild.textContent,value:Number(b.firstChild.textContent)}));
 function finishHero(){typingToken++;cancelAnimationFrame(chartFrame);lines.forEach(({line,ink,text})=>{ink.textContent=text;line.classList.remove('is-typing');});counters.forEach(c=>c.node.textContent=c.text);if(chart){chart.style.strokeDasharray='';chart.style.strokeDashoffset='';}if(area)area.style.opacity='';}
 async function hero(force=false){
  if(heroStarted&&!force)return;heroStarted=true;
  finishHero();if(!canMove()||scrollY>80||!lines.length)return;
  const token=typingToken,start=performance.now(),length=chart?.getTotalLength()||0;
  if(chart)chart.style.strokeDasharray=String(length);
  function grow(now){if(token!==typingToken||!canMove())return;const p=1-(1-clamp((now-start)/1600,0,1))**3;counters.forEach(c=>c.node.textContent=String(Math.round(c.value*p)).padStart(c.text.length,'0'));if(chart)chart.style.strokeDashoffset=String(length*(1-p));if(area)area.style.opacity=String(p);if(p<1)chartFrame=requestAnimationFrame(grow);}
  chartFrame=requestAnimationFrame(grow);lines.forEach(({ink})=>ink.textContent='');
  for(const {line,ink,text} of lines){line.classList.add('is-typing');let value='';for(const letter of letters(text,root.lang)){if(token!==typingToken||!canMove())return;value+=letter;ink.textContent=value;await new Promise(r=>setTimeout(r,28));}line.classList.remove('is-typing');}
 }
 const gate=onceGate(),scenes=[...document.querySelectorAll('[data-motion-scene]')];
 const reveal=scene=>{if(gate.take(scene)){scene.dataset.played='true';scene.classList.add(canMove()?'scene-play':'scene-complete');}};
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){reveal(e.target);observer.unobserve(e.target);}}),{threshold:.35}):null;
 if(observer)scenes.forEach(s=>observer.observe(s));else scenes.forEach(reveal);
 motionButton.addEventListener('click',()=>{paused=!paused;writePreference(storage,'moosetvs_motion',paused?'off':'on');if(paused){finishHero();scenes.filter(s=>gate.has(s)).forEach(s=>s.classList.add('scene-complete'));}sync();});
 petButton.addEventListener('click',()=>{hidden=!hidden;writePreference(storage,'moosetvs_pet',hidden?'hidden':'visible');sync();});
 media.addEventListener('change',()=>{finishHero();sync();});
 window.addEventListener('pagehide',finishHero);
 sync();
 if(!stages.length){hero();return;}
 root.dataset.validSupport='loading';
 // Three.js is split out of the main/auth bundle and is never loaded on forms.
 import('./valid.js').then(async({initValid})=>{
  companion=await initValid({canMove,isHidden:()=>hidden});
  root.dataset.validSupport='ready';sync();
  replay.hidden=document.body.dataset.route!=='';
  replay.addEventListener('click',async()=>{finishHero();window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await companion.welcome(true);hero(true);});
  if(performance.now()-boot<1800)await companion.welcome();hero();
 }).catch(()=>{root.dataset.validSupport='unavailable';petButton.hidden=true;document.querySelector('[data-valid]').hidden=true;document.querySelector('[data-valid-welcome]').hidden=true;hero();});
 setTimeout(()=>{if(root.dataset.validSupport==='loading')hero();},1800);
}
try{initMotion();}catch{document.querySelector('[data-valid-welcome]')?.setAttribute('hidden','');}
