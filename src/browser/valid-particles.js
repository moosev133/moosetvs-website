import * as THREE from 'three';

// Glyphs are sampled from the *skinned body*, including antlers, arms and feet.
// No rectangle of text and no unrelated particle silhouette.
export function makeBodyDigits(mesh,count=1800){
 const c=document.createElement('canvas');c.width=128;c.height=64;
 const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.font='bold 54px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('0',32,34);ctx.fillText('1',96,34);
 const geometry=new THREE.BufferGeometry(),positions=new Float32Array(count*3),seeds=new Float32Array(count),digits=new Float32Array(count),indices=[];
 const vertexCount=mesh.geometry.attributes.position.count;
 for(let i=0;i<count;i++){indices.push(Math.floor((i*.61803398875%1)*vertexCount));seeds[i]=(i*.754877666%1);digits[i]=i%2;}
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('digit',new THREE.BufferAttribute(digits,1));geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{atlas:{value:new THREE.CanvasTexture(c)},opacity:{value:0},pointScale:{value:500}},vertexShader:`attribute float digit; attribute float seed; varying float vDigit; varying float vSeed; uniform float pointScale;
 void main(){vDigit=digit;vSeed=seed;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(pointScale*(.045+seed*.019)/-mv.z,3.,23.);}`,fragmentShader:`uniform sampler2D atlas; uniform float opacity; varying float vDigit; varying float vSeed;
 void main(){vec2 uv=vec2((gl_PointCoord.x+vDigit)*.5,1.-gl_PointCoord.y);float a=texture2D(atlas,uv).a;if(a<.05)discard;vec3 color=mix(vec3(.14,.37,.31),vec3(.65,.52,.27),vSeed);gl_FragColor=vec4(color,a*opacity);}`});
 const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.visible=false;mesh.parent.add(points);
 const v=new THREE.Vector3();
 return {points,update({opacity,spread=0,time=0,height=800,pixelRatio=1}){
  points.visible=opacity>.005;if(!points.visible)return;
  mesh.updateMatrixWorld(true);mesh.skeleton.update();
  for(let i=0;i<count;i++){
   mesh.getVertexPosition(indices[i],v);v.applyMatrix4(mesh.matrix);
   const seed=seeds[i],angle=seed*Math.PI*16;
   v.x+=spread*(Math.cos(angle)*(1.2+seed*2.2)+Math.sin(time*1.7+angle)*.25);
   v.y+=spread*((seed-.45)*3+Math.sin(angle)*.6);
   v.z+=spread*(Math.sin(angle)*1.8+seed);
   v.toArray(positions,i*3);
  }
  geometry.attributes.position.needsUpdate=true;material.uniforms.opacity.value=opacity;material.uniforms.pointScale.value=height*pixelRatio*3.4;
 },dispose(){geometry.dispose();material.uniforms.atlas.value.dispose();material.dispose();}};
}
