import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// A separate articulated character, not a metallic material on the clothed mesh.
// Each mechanical component follows one existing joint so both forms can blend.
export function makeRobot(bones){
 const materials=[],groups=[];
 const mat=(color,metalness=.65,roughness=.28,emissive)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness,transparent:true,opacity:0,...(emissive?{emissive,emissiveIntensity:1.2}:{})});materials.push(m);return m;};
 const shell=mat('#467c80'),silver=mat('#cfddd8',.82),joint=mat('#24343a',.7),brass=mat('#c2a665',.74),visor=mat('#152b32',.4,.16),light=mat('#bdfff0',.1,.25,'#51cdb9');
 const group=name=>{const g=new THREE.Group();g.name='Robot-'+name;bones[name].add(g);groups.push(g);return g;};
 const add=(g,geo,m,p=[0,0,0],s=[1,1,1])=>{const part=new THREE.Mesh(geo,m);part.position.set(...p);part.scale.set(...s);g.add(part);return part;};
 const rounded=new RoundedBoxGeometry(1,1,1,2,.11);
 const box=(g,m,p,s)=>add(g,rounded,m,p,s);
 const ball=(g,m,p,r)=>add(g,new THREE.SphereGeometry(r,16,12),m,p);
 const rod=(g,m,a,b,r=.025)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const p=add(g,new THREE.CylinderGeometry(r,r,d.length(),10),m,av.add(bv).multiplyScalar(.5).toArray());p.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return p;};
 const head=group('Head');
 // Squared visor, projecting snout, vented cheeks and branching circuit antlers.
 const cranium=box(head,silver,[0,.285,.015],[.49,.40,.37]);cranium.rotation.x=-.06;
 box(head,shell,[0,.49,-.025],[.44,.075,.34]);
 box(head,visor,[0,.305,.218],[.455,.18,.045]);
 for(const side of [-1,1]){
  box(head,light,[side*.115,.322,.247],[.087,.048,.012]);
  ball(head,brass,[side*.27,.27,0],.066);
  box(head,shell,[side*.31,.30,-.025],[.11,.16,.10]).rotation.z=side*.35;
  for(let i=0;i<3;i++)box(head,joint,[side*.207,.18-i*.025,.213],[.04,.009,.012]);
  rod(head,brass,[side*.18,.48,-.035],[side*.29,.64,-.035],.033);
  rod(head,silver,[side*.29,.64,-.035],[side*.48,.68,-.035],.037);
  rod(head,silver,[side*.48,.68,-.035],[side*.52,.83,-.035],.027);
  rod(head,silver,[side*.37,.66,-.035],[side*.38,.84,-.035],.027);
  rod(head,silver,[side*.28,.62,-.035],[side*.23,.78,-.035],.027);
  for(const [x,y] of [[.52,.83],[.38,.84],[.23,.78]])ball(head,light,[side*x,y,-.035],.03);
 }
 box(head,shell,[0,.09,.245],[.38,.19,.22]);
 box(head,silver,[0,.02,.25],[.32,.045,.22]);
 for(const side of [-1,1])box(head,joint,[side*.105,.115,.363],[.055,.036,.01]);
 box(head,light,[0,.025,.367],[.105,.009,.008]);
 const chest=group('Chest');
 box(chest,shell,[0,-.035,0],[.39,.31,.26]);
 box(chest,silver,[0,.015,.155],[.30,.22,.07]);
 const core=add(chest,new THREE.TorusGeometry(.06,.012,8,24),brass,[0,.005,.196]);ball(chest,light,[0,.005,.195],.04);
 for(const s of [-1,1])for(const y of [-.095,.10])ball(chest,joint,[s*.125,y,.2],.011);
 const hips=group('Hips');box(hips,joint,[0,.07,0],[.27,.12,.22]);box(hips,brass,[0,.105,.125],[.28,.045,.035]);
 for(const side of ['L','R']){
  const sign=side==='L'?-1:1;
  const arm=group('Arm'+side);ball(arm,joint,[0,0,0],.083);ball(arm,silver,[sign*.015,.005,.005],.068);
  rod(arm,shell,[sign*.015,-.035,0],[sign*.145,-.125,.012],.061);
  const fore=group('Forearm'+side);ball(fore,brass,[0,0,0],.054);rod(fore,silver,[0,0,0],[sign*.105,-.07,.01],.041);
  box(fore,shell,[sign*.118,-.09,.015],[.11,.10,.11]);
  for(const z of [-.027,.035])box(fore,joint,[sign*.155,-.115,z],[.055,.055,.024]);
  const thigh=group('Thigh'+side);ball(thigh,joint,[0,0,0],.064);rod(thigh,shell,[0,-.03,0],[sign*.015,-.21,.009],.062);
  const shin=group('Shin'+side);ball(shin,brass,[0,0,0],.065);rod(shin,silver,[0,-.015,0],[sign*.009,-.17,.02],.051);box(shin,shell,[0,-.08,.057],[.10,.125,.032]);
  const foot=group('Foot'+side);ball(foot,joint,[0,0,0],.047);box(foot,shell,[0,-.025,.07],[.14,.10,.21]);box(foot,joint,[0,-.08,.075],[.15,.028,.22]);
  box(foot,light,[0,-.02,.18],[.06,.012,.008]);
 }
 return {groups,materials,setBlend(value){for(const g of groups)g.visible=value>.001;for(const m of materials)m.opacity=value;core.rotation.z=value*.7;}};
}
