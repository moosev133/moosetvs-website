export const REEL_DURATION=8000;
export const reelIndex=(index,count)=>count>0?((index%count)+count)%count:0;
export const reelCanPlay=({visible,hidden,reduced,globalPaused,paused,hovered})=>visible&&!hidden&&!reduced&&!globalPaused&&!paused&&!hovered;
export function advanceReel(elapsed,delta,duration=REEL_DURATION){
 // A resumed/background tab must not skip projects after a long frame gap.
 const next=elapsed+Math.max(0,Math.min(delta,100));
 return {elapsed:next>=duration?0:next,advance:next>=duration};
}
