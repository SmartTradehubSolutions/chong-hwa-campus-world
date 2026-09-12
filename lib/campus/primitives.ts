import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {Place} from './data';
import {surfaceMaterial,metricUV,disposeMaterials} from './materials';
export const material=surfaceMaterial;
const boxGeometries=new Map<string,T.BufferGeometry>();
const cube=new T.BoxGeometry(1,1,1),roundedCube=new RoundedBoxGeometry(1,1,1,1,.1);
export function box(g:T.Group,x:number,y:number,z:number,w:number,h:number,d:number,color:string){const key=[w,h,d].join(':');if(!boxGeometries.has(key))boxGeometries.set(key,metricUV((Math.max(w,h,d)<1.8&&Math.min(w,h,d)>.08?roundedCube:cube).clone(),new T.Vector3(w,h,d)));const m=new T.Mesh(boxGeometries.get(key)!,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function windows(g:T.Group,w:number,d:number,h:number,floors:number){
 const points:{p:T.Vector3;s:T.Vector3}[]=[]; const cols=Math.max(2,Math.floor(w/3.7)),rows=floors;
 for(let f=0;f<rows;f++){const y=1.5+f*(h-1.6)/rows;
 for(let c=0;c<cols;c++){const x=-w/2+(c+.5)*w/cols;
 for(const sign of [-1,1])points.push({p:new T.Vector3(x,y,sign*(d/2+.04)),s:new T.Vector3(w/cols*.53,(h/rows)*.42,.1)});}
 const sideCols=Math.max(2,Math.floor(d/3.7));
 for(let c=0;c<sideCols;c++){const z=-d/2+(c+.5)*d/sideCols;for(const sign of [-1,1])points.push({p:new T.Vector3(sign*(w/2+.04),y,z),s:new T.Vector3(.1,(h/rows)*.42,d/sideCols*.55)});}}
 const mesh=new T.InstancedMesh(cube,material('#354f50'),points.length),m=new T.Matrix4(),q=new T.Quaternion();points.forEach((a,i)=>{m.compose(a.p,q,a.s);mesh.setMatrixAt(i,m);});g.add(mesh);
}
function block(g:T.Group,w:number,d:number,h:number,floors:number,roof=true){
 box(g,0,h/2,0,w,h,d,'#e1e3df');
 windows(g,w,d,h,floors);
 for(const side of [-1,1]){
  for(let f=0;f<floors;f++){const y=(f+.52)*h/floors;box(g,0,y,side*(d/2+.09),w-1.4,h/floors*.4,.12,'#435552');box(g,0,y-h/floors*.29,side*(d/2+.15),w,.55,.16,'#e9eae5');}
  for(let x=-w/2+1;x<w/2;x+=4.5)box(g,x,h/2,side*(d/2+.2),.42,h,.35,'#e7e8e1');
  for(const x of [-w/2+2,w/2-2])box(g,x,h/2,side*(d/2+.24),2.2,h-.9,.3,'#a9705a');
 }
 for(let f=1;f<=floors;f++)box(g,0,f*h/floors-.2,0,w+.25,.35,d+.25,'#ecece6');
 box(g,0,.5,0,w+1,1,d+1,'#c8c9ba');
 if(roof){const roofShape=new T.Shape();roofShape.moveTo(-d/2-1,0);roofShape.lineTo(0,3);roofShape.lineTo(d/2+1,0);roofShape.closePath();
 const geom=new T.ExtrudeGeometry(roofShape,{depth:w+2,bevelEnabled:false});geom.rotateY(-Math.PI/2);geom.translate((w+2)/2,h,0);metricUV(geom);const m=new T.Mesh(geom,material('#787d79'));m.castShadow=true;g.add(m);}
 // Recessed glazing, narrow mullions, sills and downpipes add storey depth.
 for(const side of [-1,1]){
  const cols=Math.max(2,Math.floor(w/4.5));
  for(let f=0;f<floors;f++){
   const y=(f+.55)*h/floors,wh=h/floors*.34;
   for(let c=0;c<cols;c++){
    const x=-w/2+(c+.5)*w/cols,ww=w/cols*.55;
    box(g,x,y,side*(d/2+.19),ww,wh,.035,'#354f50');
    box(g,x,y,side*(d/2+.23),.055,wh,.065,'#798378');
    box(g,x,y-wh/2-.08,side*(d/2+.28),ww+.24,.12,.36,'#dedfd8');
   }
  }
  for(const x of [-w/2+.7,w/2-.7])box(g,x,h*.48,side*(d/2+.4),.11,h*.95,.13,'#798378');
  box(g,0,h+.05,side*(d/2+.4),w+.9,.18,.22,'#798378');
 }

}
function oval(rx:number,rz:number,y:number,color:string,inner=0){
 const shape=new T.Shape();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,x=Math.cos(a)*rx,z=Math.sin(a)*rz;i===0?shape.moveTo(x,z):shape.lineTo(x,z);}
 if(inner){const hole=new T.Path();for(let i=64;i>=0;i--){const a=i/64*Math.PI*2,x=Math.cos(a)*(rx-inner),z=Math.sin(a)*(rz-inner);i===64?hole.moveTo(x,z):hole.lineTo(x,z);}shape.holes.push(hole);}
 const geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);metricUV(geo);const mesh=new T.Mesh(geo,material(color));mesh.receiveShadow=true;return mesh;
}
export function building(p:Place){
 const g=new T.Group();g.userData.placeId=p.id;
 if(p.shape==='pond'){g.add(oval(8,5.5,.35,'#dbc66a'));g.add(oval(6.8,4.3,.48,'#79a697'));box(g,0,.8,0,1,.4,12,'#cbb690');return g;}
 if(p.shape==='gate'){
  for(const x of [-6,6]){box(g,x,1.8,0,1.1,3.6,1.5,'#a46c54');box(g,x,3.65,0,1.4,.22,1.8,'#dddcd2');}
  // Retracted folding gates leave the centre open to walking students.
  for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(4.2+i*.32);for(const r of [-.36,.36]){const rail=box(g,x,1.12,0,.065,2.05,.09,'#303a38');rail.rotation.z=r;}box(g,x,2.12,0,.08,.12,.13,'#303a38');}
  box(g,0,.09,0,13,.12,2,'#ad7968');
  box(g,8.4,1.4,-.5,3,2.8,3,'#deddd1');box(g,8.4,2.9,-.5,3.4,.3,3.4,'#7b8178');box(g,8.4,1.8,1.03,2,.8,.08,'#536963');
  return g;
 } if(p.shape==='arena'){
 block(g,p.w,p.d,p.h,5,false);
 for(const side of [-1,1]){
  box(g,0,p.h*.31,side*(p.d/2+.4),p.w-2,p.h*.48,.3,'#4c605e');
  for(let x=-p.w/2+1.5;x<p.w/2;x+=9)box(g,x,p.h*.43,side*(p.d/2+.65),1.8,p.h*.85,1,'#d1d5d0');
  for(const y of [p.h*.2,p.h*.55])box(g,0,y,side*(p.d/2+.8),p.w,.48,.65,'#e2e4dd');
 }
 box(g,0,p.h+.2,0,p.w+1,.6,p.d+1,'#e6ddc9');
 g.add(oval(p.w/2-2,p.d/2-1,p.h+.56,'#b55e4f'));
 g.add(oval(p.w/2-9,p.d/2-7,p.h+.61,'#7caa79'));
 for(let n=0;n<5;n++)g.add(oval(p.w/2-3-n*1.1,p.d/2-2-n*1.0,p.h+.65,'#eee2cb',.13));
 box(g,0,p.h+.8,0,.17,.1,24,'#e9e7d8');
 return g;
 }
 if(p.shape==='courtyard'){
 const wing=6;
 for(const z of [-p.d/2+wing/2,p.d/2-wing/2]){const b=new T.Group();block(b,p.w,wing,p.h,4);b.position.z=z;g.add(b);}
 for(const x of [-p.w/2+wing/2,p.w/2-wing/2]){const b=new T.Group();block(b,wing,p.d-wing*2,p.h,4);b.position.x=x;g.add(b);}
 g.add(oval(4,4,.35,'#c7b79b'));g.add(oval(3.4,3.4,.6,'#347c5a'));for(let i=0;i<16;i++){const a=i*Math.PI/8;box(g,Math.cos(a)*3.75,.48,Math.sin(a)*3.75,.55,.2,.55,['#b9bb82','#b67865','#6c9caa'][i%3]);}return g;
 }
 if(p.shape==='tower'){
 block(g,p.w,p.d,p.h,14,false);
 for(let i=-2;i<=2;i++)box(g,i*6.2,p.h/2,p.d/2+.35,.8,p.h,.75,'#e5dcc4');
 box(g,p.w/2-4,p.h/2,0,9,p.h+1,p.d+1.2,'#deded6');box(g,-7,p.h/2,p.d/2+.65,5,p.h,.8,'#a66d53');
 box(g,0,p.h+1,0,p.w+1,1,p.d+1,'#e5e2d5');
 box(g,0,p.h+1.7,0,10,1,8,'#739293');
 box(g,-10,p.h+1.5,0,5,1,6,'#d0d3c7');
 return g;
 }
 block(g,p.w,p.d,p.h,p.floors||5);
 if(p.shape==='hall'){
 box(g,0,3.5,p.d/2+.7,p.w-3,5,1.1,'#40514d');
 for(let i=-4;i<=4;i++)box(g,i*4.5,3,p.d/2+1.3,.42,6,.5,'#dedfd8');
 }
 return g;
}
export {naturalTree as tree} from './vegetation';
export function court(){
 const g=new T.Group();box(g,0,.12,0,17,.2,28,'#719c8f');
 box(g,0,.24,0,13,.04,24,'#559ebc');
 for(const z of [-9,9])box(g,0,.26,z,5,.03,6,'#ce8b60');
 for(const x of [-6.5,6.5])box(g,x,.28,0,.16,.04,24,'#f5e9d5');
 for(const z of [-12,0,12])box(g,0,.28,z,13,.04,.16,'#f5e9d5');
 g.add(oval(2.5,2.5,.29,'#f5e9d5',.15));
  for(const z of [-11,11]){
  box(g,0,1.8,z,.24,3.6,.24,'#3d6174');box(g,0,.9,z,.5,1.8,.5,'#2c5784');box(g,0,3.5,z,2.2,1.1,.18,'#f1f2e9');
  const rimZ=z-Math.sign(z),rim=new T.Mesh(new T.TorusGeometry(.55,.055,8,32),material('#c26135'));rim.rotation.x=Math.PI/2;rim.position.set(0,3.05,rimZ);g.add(rim);
  const net=new T.Mesh(new T.CylinderGeometry(.52,.3,.7,12,3,true),new T.MeshBasicMaterial({color:'#ece9dd',wireframe:true}));net.position.set(0,2.7,rimZ);g.add(net);
  box(g,0,3.18,z-Math.sign(z)*.12,.8,.04,.06,'#9e5145');
 }
 return g;
}
export function disposeShared(){boxGeometries.forEach(g=>g.dispose());boxGeometries.clear();disposeMaterials();}
