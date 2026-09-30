import * as THREE from 'three';
import {webEnvelope} from './valid-web-core.mjs';

// Real lit, round silk in the same perspective/depth buffer as Valid. Geometry
// is allocated once, then deformed in-place; no SVG, texture or external asset.
export function makeWeb({mobile=false}={}){
 const spokes=mobile?10:12,rings=mobile?6:8,sides=mobile?5:6;
 const threads=[...Array.from({length:spokes},(_,i)=>({kind:'spoke',i,segments:24})),...Array.from({length:rings},(_,i)=>({kind:'ring',i,segments:spokes*8})),...Array.from({length:4},(_,i)=>({kind:'tether',i,segments:36}))];
 let count=0,indices=[];
 for(const thread of threads){thread.offset=count;for(let j=0;j<thread.segments;j++)for(let k=0;k<sides;k++){const a=count+j*sides+k,b=count+j*sides+(k+1)%sides,c=a+sides,d=b+sides;indices.push(a,b,c,b,d,c);}count+=(thread.segments+1)*sides;}
 const geometry=new THREE.BufferGeometry(),positions=new Float32Array(count*3),normals=new Float32Array(count*3),colors=new Float32Array(count*3);
 const white=new THREE.Color('#dae7df'),warm=new THREE.Color('#c6b788'),cool=new THREE.Color('#89a6a9'),color=new THREE.Color();
 for(const thread of threads)for(let j=0;j<=thread.segments;j++){
  color.copy(thread.kind==='tether'?white:cool).lerp(white,.6+.22*Math.sin(j/thread.segments*Math.PI));
  if(thread.kind==='ring'&&thread.i===rings-1)color.lerp(warm,.28);
  for(let k=0;k<sides;k++)color.toArray(colors,(thread.offset+j*sides+k)*3);
 }
 geometry.setIndex(indices);geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const material=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,metalness:.24,roughness:.27,clearcoat:.8,clearcoatRoughness:.2,emissive:'#9cae9f',emissiveIntensity:.045,transparent:true,opacity:0,depthWrite:false});
 const silk=new THREE.Mesh(geometry,material);silk.frustumCulled=false;silk.renderOrder=2;
 const beadMaterial=new THREE.MeshStandardMaterial({color:'#eff8ef',metalness:.3,roughness:.2,transparent:true,opacity:0,depthWrite:false});
 const beads=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),beadMaterial,spokes*3);beads.frustumCulled=false;beads.renderOrder=3;beads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 const group=new THREE.Group();group.name='Valid 3D silk web';group.visible=false;group.add(silk,beads);
 const maxSegments=Math.max(...threads.map(t=>t.segments)),samples=Array.from({length:maxSegments+1},()=>new THREE.Vector3());
 const tangent=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3(),reference=new THREE.Vector3(),scratch=new THREE.Vector3(),rim=new THREE.Vector3(),control=new THREE.Vector3(),hub=new THREE.Vector3(),rotation=new THREE.Quaternion(),euler=new THREE.Euler(),matrix=new THREE.Matrix4(),scale=new THREE.Vector3(),identity=new THREE.Quaternion();
 let radius=1,frame,side=1,time=0;
 function netPoint(r,a,out){
  const ripple=Math.sin(a*3-time*8+r*5)*Math.sin(Math.PI*r)*.021*(1-frame.tension*.7);
  // A deep cupped net: central threads pass behind his body, the rim folds in
  // front. Tilt and changing depth produce real parallax and occlusion.
  const depth=((r*r-.45)*(.55+frame.cinch*.8)+ripple)*radius;
  out.set(Math.cos(a)*r*radius,Math.sin(a)*r*radius*(.78+frame.cinch*.34),depth).applyQuaternion(rotation).add(hub);return out;
 }
 function fillTube(thread,thickness){
  for(let j=0;j<=thread.segments;j++){
   tangent.subVectors(samples[Math.min(thread.segments,j+1)],samples[Math.max(0,j-1)]).normalize();
   reference.set(0,0,1);if(Math.abs(tangent.z)>.9)reference.set(0,1,0);
   normal.crossVectors(tangent,reference).normalize();binormal.crossVectors(tangent,normal).normalize();
   const taper=thread.kind==='ring'?1:.72+.28*Math.sin(j/thread.segments*Math.PI);
   for(let k=0;k<sides;k++){
    const a=k/sides*Math.PI*2,c=Math.cos(a),s=Math.sin(a),index=(thread.offset+j*sides+k)*3;
    scratch.copy(normal).multiplyScalar(c).addScaledVector(binormal,s);scratch.toArray(normals,index);
    scratch.multiplyScalar(thickness*taper).add(samples[j]).toArray(positions,index);
   }
  }
 }
 function update({origin,center,unit,pixelRadius,progress,arriving=false,direction=1,clock=0}){
  frame=webEnvelope(progress,arriving);side=direction;time=clock;group.visible=frame.alpha>.002;
  if(!group.visible){material.opacity=0;beadMaterial.opacity=0;return;}
  const targetRadius=pixelRadius*unit,rimSize=arriving?1:(.15+.85*frame.open);
  radius=targetRadius*rimSize*(1-frame.cinch*.55);
  hub.copy(origin).lerp(center,arriving?1:frame.open);
  euler.set(-.25-frame.cinch*.16,side*(.53+frame.cinch*.18),side*frame.spin);rotation.setFromEuler(euler);
  material.opacity=frame.alpha*.96;beadMaterial.opacity=frame.alpha*.72;
  for(const thread of threads){
   if(thread.kind==='tether'){
    netPoint(.98,Math.PI*(.12+thread.i*.25),rim);
    control.copy(origin).lerp(rim,.55);control.y+=targetRadius*.38*(1-frame.tension*.8);control.z+=targetRadius*(.28+thread.i*.07)*(1-frame.tension*.65);
   }
   for(let j=0;j<=thread.segments;j++){
    const t=j/thread.segments,out=samples[j];
    if(thread.kind==='spoke'){const r=.055+.945*t,a=thread.i/spokes*Math.PI*2+side*.045*Math.sin(t*Math.PI)*(1-frame.tension);netPoint(r,a,out);}
    else if(thread.kind==='ring'){
     const a=t*Math.PI*2,r=(.12+.88*thread.i/(rings-1))*(1-.035*Math.sin(t*spokes*Math.PI)**2);netPoint(r,a,out);
    }else{const q=1-t;out.copy(origin).multiplyScalar(q*q).addScaledVector(control,2*q*t).addScaledVector(rim,t*t);}
   }
   // Main load-bearing threads are thicker than the delicate cross-weave.
   const pixels=thread.kind==='tether'?1.45:thread.kind==='spoke'?1.15:.82;
   fillTube(thread,unit*pixels*(.65+.35*frame.open)*(arriving?1-frame.cinch*.1:1));
  }
  geometry.attributes.position.needsUpdate=true;geometry.attributes.normal.needsUpdate=true;
  for(let i=0;i<spokes*3;i++){
   const r=.29+Math.floor(i/spokes)*.31,a=(i%spokes)/spokes*Math.PI*2;netPoint(r,a,scratch);
   const glimmer=.85+.3*Math.sin(clock*4+i*.9);scale.setScalar(unit*1.65*glimmer);matrix.compose(scratch,identity,scale);beads.setMatrixAt(i,matrix);
  }
  beads.instanceMatrix.needsUpdate=true;
 }
 function hide(){group.visible=false;material.opacity=0;beadMaterial.opacity=0;}
 function dispose(){geometry.dispose();material.dispose();beads.geometry.dispose();beadMaterial.dispose();group.removeFromParent();}
 return {group,update,hide,dispose,geometry,stats:{spokes,rings,vertices:count,triangles:indices.length/3,drawCalls:2}};
}
