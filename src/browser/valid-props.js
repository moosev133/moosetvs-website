import * as THREE from 'three';
export function makeProps(bones,character){
 const mat=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:.45,metalness});
 const gold=mat('#bda76b',.55),teal=mat('#235966'),brown=mat('#97613c');
 const add=(g,geometry,material,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m;};
 const line=(g,points,m,r=.008)=>add(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,r,6,false),m,0,0,0);
 // Glossy eyes stay readable when the mesh approaches the camera for its hello.
 const face=new THREE.Group();bones.Head.add(face);
 const eye=mat('#171b18'),iris=mat('#3a8194'),spark=new THREE.MeshBasicMaterial({color:'#fff6dd'});
 for(const side of [-1,1]){
  add(face,new THREE.SphereGeometry(.049,20,14),eye,side*.153,.268,.34,.83,1.08,.43);
  add(face,new THREE.SphereGeometry(.034,20,14),iris,side*.153,.264,.360,.86,1.02,.25);
  add(face,new THREE.SphereGeometry(.023,18,12),eye,side*.153,.267,.37,.87,1,.22);
  add(face,new THREE.SphereGeometry(.009,12,8),spark,side*.153-.009,.279,.376,1,1,.4);
 }
 const glasses=new THREE.Group();glasses.position.set(0,.265,.40);bones.Head.add(glasses);
 for(const side of [-1,1]){add(glasses,new THREE.TorusGeometry(.11,.014,8,32),gold,side*.15,0,0,1,.88,1);line(glasses,[[side*.26,0,0],[side*.29,.008,-.12],[side*.29,0,-.32]],gold);}
 line(glasses,[[-.045,0,0],[0,.022,.012],[.045,0,0]],gold);
 const web=new THREE.Group();bones.Chest.add(web);web.position.set(0,-.055,.222);
 add(web,new THREE.CircleGeometry(.077,24),mat('#984f40'),0,0,0);
 const ink=mat('#202f2d');add(web,new THREE.SphereGeometry(.025,12,8),ink,0,-.008,.012,.6,1.2,.25);add(web,new THREE.SphereGeometry(.016,12,8),ink,0,.022,.012,1,1,.25);
 for(const side of [-1,1])for(let i=0;i<4;i++)line(web,[[side*.008,.015-i*.01,.016],[side*.039,.04-i*.021,.016],[side*.055,.06-i*.038,.016]],ink,.0035);
 const strong=new THREE.Group();bones.Chest.add(strong);
 for(const side of [-1,1])add(strong,new THREE.SphereGeometry(.11,16,12),brown,side*.275,.005,.015,1.13,.95,1);
 const parcel=new THREE.Group();character.add(parcel);
 add(parcel,new THREE.BoxGeometry(.72,.66,.5),mat('#bd9d64'),0,.42,0);add(parcel,new THREE.BoxGeometry(.11,.665,.508),mat('#e2cf9f'),0,.42,0);add(parcel,new THREE.BoxGeometry(.728,.06,.51),mat('#cbae78'),0,.72,0);
 add(parcel,new THREE.PlaneGeometry(.23,.14),mat('#f1ecd8'),.16,.48,.257);
 for(let i=0;i<5;i++)add(parcel,new THREE.BoxGeometry(.008+(i%2)*.004,.065,.004),teal,.08+i*.024,.48,.264);
 for(const s of [-1,1]){line(parcel,[[s*.18,.75,0],[s*.22,.88,0],[s*.34,.90,0],[s*.38,1.02,0]],gold,.023);line(parcel,[[s*.26,.9,0],[s*.28,1.04,0]],gold,.019);}
 return {face,glasses,web,strong,package:parcel};
}
export function makeShadow(){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(35,44,28,.27)');g.addColorStop(1,'rgba(35,44,28,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));}
