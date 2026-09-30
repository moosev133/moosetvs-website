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
