export function initProcess(stages,{canMove,isHidden}){
 const entries=stages.filter(n=>n.dataset.validStage==='process').map(stage=>({stage,section:stage.closest('[data-process]'),steps:[...stage.querySelectorAll('[data-valid-step]')],progress:-1})).filter(e=>e.section);
 function draw(entry){
  const r=entry.stage.getBoundingClientRect(),svg=entry.stage.querySelector('[data-process-links]');
  svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);
  const rects=entry.steps.map(s=>s.getBoundingClientRect());
  [...svg.children].forEach((path,i)=>{const a=rects[i],b=rects[i+1],x=a.left+a.width/2-r.left,y=a.top-r.top+48,tx=b.left+b.width/2-r.left,ty=b.top-r.top+48;path.setAttribute('d',`M${x} ${y} C${(x+tx)/2} ${y} ${(x+tx)/2} ${ty} ${tx} ${ty}`);});
 }
 function reveal(stage,index){
  const entry=entries.find(e=>e.stage===stage);if(!entry||index<=entry.progress)return;
  entry.progress=Math.min(4,index);entry.section.dataset.processProgress=String(entry.progress+1);
  entry.steps.forEach((s,i)=>{if(i<=entry.progress)s.dataset.landed='true';});
  entry.section.querySelectorAll('[data-process-detail]').forEach((s,i)=>{if(i<=entry.progress)s.dataset.revealed='true';});
  entry.stage.querySelectorAll('[data-process-links] path').forEach((p,i)=>{if(i<entry.progress)p.dataset.connected='true';});
 }
 function finishAll(){for(const entry of entries){reveal(entry.stage,4);delete entry.section.dataset.processAnimated;}}
 function sync(){if(!canMove()||isHidden())finishAll();}
 for(const entry of entries){
  if(canMove()&&!isHidden()&&entry.stage.getBoundingClientRect().bottom>100)entry.section.dataset.processAnimated='true';else reveal(entry.stage,4);
  draw(entry);
 }
 return {reveal,finishAll,sync,resize(){entries.forEach(draw);}};
}
