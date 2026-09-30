export const serviceLooks={'ai-automation':'robot','web-development':'web','custom-software':'binary','digital-products':'package'};
export const clamp01=n=>Math.max(0,Math.min(1,n));
export const ease=n=>{const t=clamp01(n);return t*t*(3-2*t);};
export function serviceLook(path){return serviceLooks[path.replace(/\/$/,'').split('/').at(-1)]||null;}
export function slidePoint(t){const p=clamp01(t),q=1-p;return {x:q*q*q*50+3*q*q*p*180+3*q*p*p*260+p*p*p*550,y:q*q*q*35+3*q*q*p*35+3*q*p*p*205+p*p*p*205};}
export function canAnimateLink(event,link,origin){return !!link&&!event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&!link.hasAttribute('download')&&(!link.target||link.target==='_self')&&new URL(link.href).origin===origin;}
