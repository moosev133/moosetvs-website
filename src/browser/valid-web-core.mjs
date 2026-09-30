import {clamp01,ease,glidePoint} from './valid-core.mjs';

// One continuous cast -> cupping catch -> elastic sling. No repeated motion.
export function webEnvelope(progress,arriving=false){
 const u=clamp01(progress);
 if(arriving)return {open:1,cinch:1-ease((u-.42)/.46),alpha:1-ease((u-.54)/.42),tension:1-ease((u-.35)/.55),spin:-.18+ease(u/.9)*.38,phase:u<.55?'carry':u<.96?'unfurl':'settle'};
 const cinch=ease((u-.33)/.31),release=ease((u-.66)/.34);
 return {open:ease(u/.32),cinch,alpha:ease(u/.075)*(1-ease((u-.88)/.12)),tension:cinch*(1-release*.75),spin:.22*Math.sin(u*Math.PI)-release*.22,phase:u<.33?'cast':u<.56?'capture':u<.66?'tension':'release'};
}

export function webDeparture(from,progress,{width,rtl=false}){
 const u=clamp01(progress),side=rtl?-1:1;
 const margin=Math.min(width*.34,190),caught={x:Math.max(margin,Math.min(width-margin,from.x+side*Math.min(width*.1,75))),y:from.y-65,z:(from.z||0)+1.2};
 const pull=clamp01((u-.27)/.39),release=clamp01((u-.66)/.34);
 const point=u<=.66?glidePoint(from,caught,pull,12,-side*10):glidePoint(caught,{x:rtl?-180:width+180,y:-210,z:3.2},release,80,side*28);
 return {point,air:ease(pull)*.65+Math.sin(release*Math.PI)*.35,yaw:side*(.22*ease(pull)+Math.sin(release*Math.PI)*.9),roll:side*(.12*Math.sin(pull*Math.PI)+.52*ease(release))};
}
