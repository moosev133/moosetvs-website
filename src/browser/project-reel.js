import {t} from './site.js';
import {REEL_DURATION,reelIndex,reelCanPlay,advanceReel} from './project-reel-core.mjs';

const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[...document.querySelectorAll('[data-project-scene]')];
const visibleScenes=new Set();
const reel=document.querySelector('[data-project-reel]');
let syncReel=()=>{};
function syncScenes(){
 const allowed=!reduced.matches&&root.dataset.motion!=='off'&&!document.hidden;
 scenes.forEach(scene=>{
  const slide=scene.closest('[data-reel-slide]');
  scene.dataset.scenePlaying=String(allowed&&visibleScenes.has(scene)&&(!slide||(!slide.inert&&reel?.dataset.reelSceneRunning==='true')));
 });
}

if(reel){
 const slides=[...reel.querySelectorAll('[data-reel-slide]')],selectors=[...reel.querySelectorAll('[data-reel-select]')];
 const track=reel.querySelector('.reel-track'),viewport=reel.querySelector('.reel-viewport');
 const pause=reel.querySelector('[data-reel-pause]'),announcement=reel.querySelector('[data-reel-announcement]');
 const rtl=root.dir==='rtl';
 let index=0,elapsed=0,previousTime=0,frame=0,visible=false,paused=false,effectsPaused=false,hovered=false,touchStart=null,suppressClickUntil=0;
 const canPlay=()=>reelCanPlay({visible,hidden:document.hidden,reduced:reduced.matches,globalPaused:root.dataset.motion==='off',paused,hovered});
 function show(next,manual=false){
  const target=reelIndex(next,slides.length),jump=Math.abs(target-index)>1;
  index=target;elapsed=0;
  track.classList.remove('reel-jump');
  if(jump){void track.offsetWidth;track.classList.add('reel-jump');}
  track.style.transform=`translate3d(${(rtl?1:-1)*index*100}%,0,0)`;
  slides.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
  selectors.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===index));button.style.setProperty('--progress','0');});
  reel.dataset.reelIndex=String(index);
  if(manual)announcement.textContent=slides[index].getAttribute('aria-label');
  syncScenes();
 }
 function tick(now){
  frame=0;if(!canPlay())return;
  const result=advanceReel(elapsed,previousTime?now-previousTime:0);previousTime=now;elapsed=result.elapsed;
  if(result.advance)show(index+1);
  selectors[index].style.setProperty('--progress',String(elapsed/REEL_DURATION));
  frame=requestAnimationFrame(tick);
 }
 syncReel=()=>{
  const running=canPlay();reel.dataset.reelRunning=String(running);
  reel.dataset.reelSceneRunning=String(visible&&!effectsPaused);
  const stopped=paused||reduced.matches||root.dataset.motion==='off';
  pause.setAttribute('aria-pressed',String(stopped));pause.setAttribute('aria-label',t(stopped?'Play showcase':'Pause showcase'));
  // Manual browsing remains available when a visitor disables animation.
  pause.disabled=reduced.matches||root.dataset.motion==='off';
  if(running&&!frame){previousTime=0;frame=requestAnimationFrame(tick);}
  if(!running&&frame){cancelAnimationFrame(frame);frame=0;previousTime=0;}
  syncScenes();
 };
 function select(next){paused=true;effectsPaused=false;show(next,true);syncReel();}
 selectors.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
 reel.querySelector('[data-reel-previous]').addEventListener('click',()=>select(index-1));
 reel.querySelector('[data-reel-next]').addEventListener('click',()=>select(index+1));
 pause.addEventListener('click',()=>{paused=!paused;effectsPaused=paused;syncReel();});
 reel.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;syncReel();}});
 reel.addEventListener('pointerleave',()=>{hovered=false;syncReel();});
 // Keyboard focus stops rotation until the visitor explicitly starts it again.
 reel.addEventListener('focusin',event=>{if(event.target!==pause){paused=true;syncReel();}});
 viewport.addEventListener('pointerdown',event=>{suppressClickUntil=0;if(event.pointerType!=='mouse'){touchStart={x:event.clientX,y:event.clientY};paused=true;syncReel();}});
 viewport.addEventListener('pointercancel',()=>{touchStart=null;});
 viewport.addEventListener('pointerup',event=>{
  if(!touchStart)return;const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;touchStart=null;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){select(index+(dx<0?1:-1)*(rtl?-1:1));
   // Do not follow the project link at the end of a swipe.
   suppressClickUntil=performance.now()+500;
  }
 });
 viewport.addEventListener('click',event=>{if(performance.now()<suppressClickUntil)event.preventDefault();},{capture:true});
 reel.dataset.reelEnhanced='true';reel.querySelector('[data-reel-controls]').hidden=false;show(0);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncReel();},{threshold:.18}).observe(reel);
 else{visible=true;syncReel();}
}

if('IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visibleScenes.add(e.target):visibleScenes.delete(e.target));syncScenes();},{threshold:.12});
 scenes.forEach(scene=>observer.observe(scene));
}else scenes.forEach(scene=>visibleScenes.add(scene));
const sync=()=>{syncReel();syncScenes();};
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-motion']});
reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
window.addEventListener('pagehide',()=>{if(reel)reel.dataset.reelRunning='false';scenes.forEach(scene=>scene.dataset.scenePlaying='false');});
sync();
