import * as THREE from 'three';

// The eyes are pigment on the existing skinned face, not floating eyeball meshes.
// Rest-space coordinates follow the head through every skeletal animation.
export function paintEyes(material){
 const blink={value:0};
 material.onBeforeCompile=shader=>{
  shader.uniforms.validBlink=blink;
  shader.uniforms.validIris={value:new THREE.Color('#377d8f')};
  shader.uniforms.validLid={value:new THREE.Color('#92613e')};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 validRest; varying float validFront;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvalidRest=position; validFront=normal.z;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 validRest; varying float validFront; uniform float validBlink; uniform vec3 validIris; uniform vec3 validLid;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 eyeUV=vec2((abs(validRest.x)-.153)/.037,(validRest.y-1.258)/.046);
   float eyeRadius=length(eyeUV);
   float eyeMask=(1.-smoothstep(.91,1.,eyeRadius))*smoothstep(.16,.23,validRest.z)*smoothstep(.02,.35,validFront);
   vec3 eyeInk=vec3(.006,.012,.013);
   vec3 eyePaint=mix(eyeInk,validIris,1.-smoothstep(.67,.76,eyeRadius));
   eyePaint=mix(eyePaint,eyeInk,1.-smoothstep(.35,.43,eyeRadius));
   vec2 glint=eyeUV-vec2(-.25*sign(validRest.x),.29);
   eyePaint=mix(eyePaint,vec3(1.,.97,.88),1.-smoothstep(.08,.17,length(glint)));
   float lidLine=1.-smoothstep(.04,.11,abs(eyeUV.y+.12+eyeUV.x*eyeUV.x*.22));
   eyePaint=mix(eyePaint,mix(validLid,eyeInk,lidLine),validBlink);
   diffuseColor.rgb=mix(diffuseColor.rgb,eyePaint,eyeMask);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.32,eyeMask*(1.-validBlink));');
 };
 material.customProgramCacheKey=()=> 'valid-surface-eyes-v1';
 material.needsUpdate=true;
 return {setBlink(value){blink.value=THREE.MathUtils.clamp(value,0,1);}};
}
