export const serviceLooks={'ai-automation':'robot','web-development':'web','custom-software':'binary','digital-products':'package'};
export const clamp01=n=>Math.max(0,Math.min(1,n));
export const ease=n=>{const t=clamp01(n);return t*t*(3-2*t);};
export function serviceLook(path){return serviceLooks[path.replace(/\/$/,'').split('/').at(-1)]||null;}
// Rail grows left-to-right (0 -> X); the rider travels right-to-left (X -> 0).
export function slidePoint(t){const p=clamp01(t),q=1-p;return {x:q*q*q*550+3*q*q*p*410+3*q*p*p*220+p*p*p*50,y:q*q*q*35+3*q*q*p*35+3*q*p*p*205+p*p*p*205};}
export function glidePoint(from,to,t,lift=0,bend=0){const u=ease(t),arc=Math.sin(Math.PI*clamp01(t));return {x:from.x+(to.x-from.x)*u+arc*bend,y:from.y+(to.y-from.y)*u-arc*lift,z:(from.z||0)+((to.z||0)-(from.z||0))*u+arc*.6};}
export const journeyDuration={web:1700,binary:1950,robot:1250,package:1200,natural:750};
export function readArrival(raw,path,now){try{const value=JSON.parse(raw);return value&&value.path===path&&now-value.at>=0&&now-value.at<15000&&Object.hasOwn(journeyDuration,value.look)?value:null;}catch{return null;}}
// Deterministic per seed: varied curves without sudden per-frame random jitter.
export function wanderPoint(rect,seed){const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};return {x:rect.left+rect.width*(.19+.62*noise(seed)),y:rect.top+rect.height*(.69+.25*noise(seed+4)),z:-1.2+2*noise(seed+9)};}
export function canAnimateLink(event,link,origin){return !!link&&!event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&!link.hasAttribute('download')&&(!link.target||link.target==='_self')&&new URL(link.href).origin===origin;}

export function nextTickle(count){const next=(Number.isInteger(count)&&count>=0&&count<5?count:0)+1;return next===5?{count:0,reaction:'run'}:{count:next,reaction:'giggle'};}
export function escapePoint(point,tap,{width,height,margin=65}){
 const available=point.x<width/2?1:-1,dx=point.x-tap.x,direction=Math.abs(dx)>12?Math.sign(dx):available;
 let x=Math.max(margin,Math.min(width-margin,point.x+direction*Math.min(300,width*.55)));
 if(Math.abs(x-point.x)<80)x=Math.max(margin,Math.min(width-margin,point.x-direction*Math.min(300,width*.55)));
 return {x,y:Math.max(180,Math.min(height-35,point.y+(tap.y<point.y-50?25:-35))),z:-.6};
}
export const PROCESS_DURATION=5.2;
export function processFrame(time){
 const elapsed=Math.max(0,time-.5),index=Math.min(3,Math.floor(elapsed/1.1)),u=clamp01((elapsed-index*1.1)/.76);
 return {from:index,to:index+1,u,landed:time<.5?0:index+(u>=1?1:0),done:time>=PROCESS_DURATION};
}
