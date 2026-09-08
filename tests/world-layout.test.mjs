import {createWorldContext} from '../lib/campus/world-context.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {places} from '../lib/campus/data.ts';
import {createWorldLayout, resolvePose, makeAnchor, WORLD_RADIUS} from '../lib/campus/world-layout.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7, `${a} != ${b}`);
const layout=createWorldLayout(places);
test('school buildings cover all eight octants with separated footprints',()=>{
 const octants=new Set();let spacing=Infinity;
 for(const a of layout.values()){const n=a.normal;octants.add([n.x>0,n.y>0,n.z>0].join(','));for(const b of layout.values())if(a!==b)spacing=Math.min(spacing,a.world.distanceTo(b.world));}
 assert.equal(octants.size,8);assert.ok(spacing>75,`spacing ${spacing}`);assert.equal(layout.size,places.length);
});
test('every landmark returns to its exact campus position in flat views',()=>{
 for(const p of places){const pose=resolvePose(layout.get(p.id),0);near(pose.position.x,p.x);near(pose.position.y,0);near(pose.position.z,p.z);near(pose.normal.x,0);near(pose.normal.y,1);near(pose.normal.z,0);}
});
test('world anchors sit on the sphere and face radially out',()=>{
 for(const a of layout.values()){const pose=resolvePose(a,1);const radial=pose.position.clone().sub(new T.Vector3(0,-WORLD_RADIUS,0));near(radial.length(),WORLD_RADIUS);near(radial.normalize().dot(pose.normal),1);}
});
test('south-pole rotations remain stable throughout flattening',()=>{
 const a=makeAnchor(0,0,new T.Vector3(0,-1,0));for(const t of [0,.1,.499999,.5,.500001,.9,1]){const p=resolvePose(a,t);assert.ok([...p.position.toArray(),...p.rotation.toArray(),...p.normal.toArray()].every(Number.isFinite));near(p.rotation.length(),1);near(p.normal.length(),1);}
});

test('world roads and plazas face outward and scenery covers the planet',()=>{
 const context=createWorldContext(layout,places);
 assert.ok(context.group.userData.treeCount>180);
 assert.ok(context.group.userData.houseCount>10);
 const octants=new Set();
 context.group.traverse(o=>{
  if(o instanceof T.InstancedMesh){const m=new T.Matrix4(),p=new T.Vector3();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);p.setFromMatrixPosition(m);octants.add([p.x>0,p.y>0,p.z>0].join(','));}}
  else if(o instanceof T.Mesh){const g=o.geometry,a=g.attributes.position,idx=g.index;for(let i=0;i<idx.count;i+=3){const p0=new T.Vector3().fromBufferAttribute(a,idx.getX(i)),p1=new T.Vector3().fromBufferAttribute(a,idx.getX(i+1)),p2=new T.Vector3().fromBufferAttribute(a,idx.getX(i+2));const normal=p1.sub(p0).cross(p2.sub(p0));assert.ok(normal.dot(p0)>=-1e-6,'Ground triangles must face outward');}}
 });
 assert.equal(octants.size,8);
 const trunks=context.group.getObjectByName('world-tree-trunks'),matrix=new T.Matrix4(),point=new T.Vector3();
 let north=0,south=0;
 for(let i=0;i<trunks.count;i++){trunks.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix).normalize();if(point.y>.65)north++;if(point.y<-.65)south++;}
 assert.ok(north>15,`north trees ${north}`);assert.ok(south>15,`south trees ${south}`);
 context.setCurve(0);assert.equal(context.group.visible,false);
 context.setCurve(1);assert.equal(context.group.visible,true);near(context.group.position.y,-WORLD_RADIUS);
 context.dispose();
});


test('landmarks stay outside the shrinking globe while flattening',()=>{
 for(const anchor of layout.values())for(let step=0;step<=200;step++){
  const curve=step/200,radius=WORLD_RADIUS*curve**3;
  const pose=resolvePose(anchor,curve),centre=new T.Vector3(0,-radius,0);
  assert.ok(pose.position.distanceTo(centre)>=radius-1e-7);
 }
});
