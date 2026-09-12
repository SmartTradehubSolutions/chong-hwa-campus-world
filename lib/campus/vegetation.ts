import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {surfaceMaterial,metricUV} from './materials';
const cache=new Map<string,{wood:T.BufferGeometry;leaves:T.BufferGeometry}>();
export const foliageMaterial=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.86,metalness:0});
foliageMaterial.name='individual tree leaves';
export function treeGeometry(seed=1,count=650){
 const key=seed+':'+count;if(cache.has(key))return cache.get(key)!;
 let state=(seed+1)*937;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const branches:T.BufferGeometry[]=[],tips:T.Vector3[]=[];
 function branch(a:T.Vector3,b:T.Vector3,r:number){
  const delta=b.clone().sub(a),g=new T.CylinderGeometry(r*.48,r,delta.length(),6,1);
  g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize()));
  g.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);metricUV(g);branches.push(g);
 }
 branch(new T.Vector3(),new T.Vector3(.025,.75,-.015),.038);
 for(let i=0;i<11;i++){
  const angle=i*2.399+random()*.6,y=.38+random()*.38,r=.18+random()*.16;
  const start=new T.Vector3(.015,y*.64,0),tip=new T.Vector3(Math.cos(angle)*r,y+.12,Math.sin(angle)*r);
  branch(start,tip,.016*(1-y*.5));tips.push(tip);
  for(let j=0;j<2;j++){const end=tip.clone().add(new T.Vector3((random()-.5)*.2,.04+random()*.09,(random()-.5)*.2));branch(tip,end,.005);tips.push(end);}
 }
 tips.push(new T.Vector3(0,.95,0));
 const positions:number[]=[],colors:number[]=[],indices:number[]=[];
 const palette=['#355d2a','#487332','#5b863c','#7c9a4d'].map(c=>new T.Color(c));
 for(let i=0;i<count;i++){
  const centre=tips[i%tips.length].clone(),angle=random()*Math.PI*2,spread=Math.sqrt(random())*.16;
  centre.add(new T.Vector3(Math.cos(angle)*spread,(random()-.5)*.18,Math.sin(angle)*spread));
  const length=.035+random()*.025,width=length*.34,q=new T.Quaternion().setFromEuler(new T.Euler((random()-.5)*2,random()*Math.PI*2,(random()-.5)*2));
  const verts=[new T.Vector3(0,0,-length),new T.Vector3(-width,0,0),new T.Vector3(0,length*.12,0),new T.Vector3(width,0,0),new T.Vector3(0,0,length)];
  const offset=positions.length/3,c=palette[Math.floor(random()*palette.length)];
  verts.forEach(v=>{v.applyQuaternion(q).add(centre);positions.push(v.x,v.y,v.z);colors.push(c.r,c.g,c.b);});
  indices.push(offset,offset+2,offset+1,offset,offset+3,offset+2,offset+1,offset+2,offset+4,offset+2,offset+3,offset+4);
 }
 const leaves=new T.BufferGeometry();leaves.setAttribute('position',new T.Float32BufferAttribute(positions,3));leaves.setAttribute('color',new T.Float32BufferAttribute(colors,3));leaves.setIndex(indices);leaves.computeVertexNormals();leaves.computeBoundingSphere();
 const wood=mergeGeometries(branches)!;branches.forEach(g=>g.dispose());
 const result={wood,leaves};cache.set(key,result);return result;
}
export function naturalTree(seed=1){
 const g=new T.Group(),geometry=treeGeometry(Math.abs(seed)%5),h=5.3+(Math.sin(seed*73.1)+1)*1.3;
 const trunk=new T.Mesh(geometry.wood,surfaceMaterial('#8c7960')),leaves=new T.Mesh(geometry.leaves,foliageMaterial);
 trunk.castShadow=trunk.receiveShadow=leaves.castShadow=leaves.receiveShadow=true;g.add(trunk,leaves);g.scale.set(h,h,h);g.rotation.y=seed*1.7;
 g.userData.leafCount=650;return g;
}
