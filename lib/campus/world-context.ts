import * as T from 'three';
import {WORLD_RADIUS,sphereNormal,type WorldAnchor} from './world-layout.mjs';
import type {Place} from './data';

type MeshData={positions:number[];normals:number[];indices:number[]};
type Instance={normal:T.Vector3;scale:T.Vector3;height:number;yaw?:number};
const UP=new T.Vector3(0,1,0),R=WORLD_RADIUS;
function empty():MeshData{return{positions:[],normals:[],indices:[]};}
function vertex(data:MeshData,p:T.Vector3){data.positions.push(p.x,p.y,p.z);const n=p.clone().normalize();data.normals.push(n.x,n.y,n.z);}
function geometry(data:MeshData){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(data.normals,3));g.setIndex(data.indices);g.computeBoundingSphere();return g;}
function ribbon(data:MeshData,path:T.Vector3[],width:number,radius:number){
 const start=data.positions.length/3;
 path.forEach((n,i)=>{const tangent=path[Math.min(i+1,path.length-1)].clone().sub(path[Math.max(0,i-1)]);const side=tangent.cross(n).normalize().multiplyScalar(width/2);const centre=n.clone().multiplyScalar(radius);vertex(data,centre.clone().add(side).normalize().multiplyScalar(radius));vertex(data,centre.clone().sub(side).normalize().multiplyScalar(radius));if(i){const k=start+i*2;data.indices.push(k-2,k,k-1,k-1,k,k+1);}});
}
function disc(data:MeshData,normal:T.Vector3,rx:number,rz:number,radius:number){
 const q=new T.Quaternion().setFromUnitVectors(UP,normal),start=data.positions.length/3;
 vertex(data,normal.clone().multiplyScalar(radius));
 for(let i=0;i<=36;i++){const angle=i/36*Math.PI*2;const p=new T.Vector3(Math.cos(angle)*rx,R,Math.sin(angle)*rz).applyQuaternion(q).normalize().multiplyScalar(radius);vertex(data,p);if(i)data.indices.push(start,start+i+1,start+i);}
}
export function createWorldContext(layout:Map<string,WorldAnchor>,places:Place[]){
 const group=new T.Group(),materials:T.MeshStandardMaterial[]=[];
 const mat=(color:string)=>{const m=new T.MeshStandardMaterial({color,roughness:.92,transparent:true,side:T.DoubleSide});materials.push(m);return m;};
 function mesh(data:MeshData,color:string){const object=new T.Mesh(geometry(data),mat(color));object.receiveShadow=true;group.add(object);return object;}
 const pads=empty(),roadBorder=empty(),roads=empty(),lines=empty();
 const nodes=places.map(p=>({p,normal:layout.get(p.id)!.normal,clearance:Math.hypot(p.w,p.d)*.55+6}));
 for(const n of nodes)disc(pads,n.normal,n.p.w*.68+4,n.p.d*.68+4,R+.13);
 const edges=new Set<string>(),roadSamples:T.Vector3[]=[];
 nodes.forEach((node,i)=>{
  const neighbors=nodes.map((n,j)=>({j,d:node.normal.distanceTo(n.normal)})).filter(a=>a.j!==i).sort((a,b)=>a.d-b.d).slice(0,3);
  for(const {j}of neighbors){const key=[i,j].sort((a,b)=>a-b).join('-');if(edges.has(key))continue;edges.add(key);
   const a=node.normal,b=nodes[j].normal,path=Array.from({length:25},(_,k)=>a.clone().lerp(b,k/24).normalize());
   roadSamples.push(...path);ribbon(roadBorder,path,6.8,R+.23);ribbon(roads,path,4.5,R+.28);
   for(let k=1;k<23;k+=4)ribbon(lines,path.slice(k,k+2),.16,R+.34);
  }
 });
 mesh(pads,'#d5d5b4');mesh(roadBorder,'#d7dcc0');mesh(roads,'#889e91');mesh(lines,'#f4e9cc');
 const trunks:Instance[]=[],crowns:Instance[][]=[[],[],[]],houses:Instance[]=[],roofs:Instance[]=[],windows:Instance[]=[];
 const lanterns:Instance[]=[],lampHeads:Instance[]=[];
 const placedHomes:T.Vector3[]=[];
 for(let i=0;i<950;i++){
  const sampleIndex=(i*373)%950; const n=sphereNormal(sampleIndex,950,1.7);
  if(nodes.some(node=>n.distanceTo(node.normal)*R<node.clearance+4))continue;
  if(roadSamples.some(s=>n.distanceTo(s)*R<4.3))continue;
  const seed=(Math.sin(i*18.173)*43758.5453)%1,h=3.3+Math.abs(seed)*3.4;
  if(i%17===0&&houses.length<34&&placedHomes.every(p=>p.distanceTo(n)*R>18)){
   const w=7+(i%3)*1.7,d=6+(i%4)*1.2,height=4.5+(i%3)*1.5,yaw=i*.83;
   houses.push({normal:n,scale:new T.Vector3(w,height,d),height:height/2,yaw});
   roofs.push({normal:n,scale:new T.Vector3(w*.8,2.5,d*.8),height:height+1.2,yaw});
   windows.push({normal:n,scale:new T.Vector3(w*.8,.65,d+.12),height:height*.65,yaw});
   placedHomes.push(n);
  }else if(trunks.length<390){
   trunks.push({normal:n,scale:new T.Vector3(.42,h*.74,.42),height:h*.36});
   crowns[i%3].push({normal:n,scale:new T.Vector3(h*.48,h*.58,h*.48),height:h*.87,yaw:i*.4});
  }
 }
 roadSamples.filter((_,i)=>i%38===0).forEach((n,i)=>{if(nodes.some(node=>n.distanceTo(node.normal)*R<node.clearance))return;
  const offset=n.clone().add(new T.Vector3(.045,0,.02)).normalize();
  lanterns.push({normal:offset,scale:new T.Vector3(.2,4.2,.2),height:2.1});
  lampHeads.push({normal:offset,scale:new T.Vector3(1.1,.3,1.1),height:4.3,yaw:i});
 });
 function instances(items:Instance[],geom:T.BufferGeometry,color:string){
  if(!items.length)return;
  const m=new T.InstancedMesh(geom,mat(color),items.length),matrix=new T.Matrix4(),q=new T.Quaternion(),yawQ=new T.Quaternion(),p=new T.Vector3();
  items.forEach((a,i)=>{q.setFromUnitVectors(UP,a.normal);yawQ.setFromAxisAngle(UP,a.yaw||0);q.multiply(yawQ);p.copy(a.normal).multiplyScalar(R+a.height+.4);matrix.compose(p,q,a.scale);m.setMatrixAt(i,matrix);});
  m.instanceMatrix.needsUpdate=true;m.castShadow=true;m.receiveShadow=true;m.computeBoundingSphere();group.add(m);return m;
 }
 const cube=new T.BoxGeometry(1,1,1),crown=new T.IcosahedronGeometry(1,1),roof=new T.ConeGeometry(1,1,4);roof.rotateY(Math.PI/4);
 const treeTrunks=instances(trunks,cube,'#847359');if(treeTrunks)treeTrunks.name='world-tree-trunks';
 ['#4c8058','#689668','#80a471'].forEach((color,i)=>instances(crowns[i],crown,color));
 instances(houses,cube,'#e9ddbd');instances(roofs,roof,'#b96950');instances(windows,cube,'#68948f');
 instances(lanterns,cube,'#798378');instances(lampHeads,cube,'#f0d9a4');
 group.userData.treeCount=trunks.length;group.userData.houseCount=houses.length;group.userData.roadCount=edges.size;
 return{group,setCurve(curve:number){const scale=curve**3;group.visible=curve>.025;group.scale.setScalar(scale);group.position.y=-R*scale;const opacity=T.MathUtils.smoothstep(curve,.15,.7);materials.forEach(m=>{m.opacity=opacity;m.depthWrite=opacity>.85;});},dispose(){materials.forEach(m=>m.dispose());}};
}
