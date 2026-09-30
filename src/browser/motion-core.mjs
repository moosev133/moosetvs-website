export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export function shouldWelcome({home,seen,reduced,paused,scrollY=0}){return home&&!seen&&!reduced&&!paused&&scrollY<80;}
export function letters(text,locale='en'){
 return typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(locale,{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text);
}
export function onceGate(){const seen=new WeakSet();return {take(node){if(seen.has(node))return false;seen.add(node);return true;},has:node=>seen.has(node),reset:node=>seen.delete(node)};}
export function readPreference(storage,key,fallback=null){try{return storage?.getItem(key)??fallback;}catch{return fallback;}}
export function writePreference(storage,key,value){try{storage?.setItem(key,value);}catch{/* Private browsing must not break the page. */}}
