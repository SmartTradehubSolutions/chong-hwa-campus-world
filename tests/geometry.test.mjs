import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {building} from '../lib/campus/primitives.ts';
import {places} from '../lib/campus/data.ts';
test('every landmark has finite, visible geometry and a pickable identity',()=>{
 for(const p of places){const root=building(p);root.updateMatrixWorld(true);let meshes=0;root.traverse(o=>{if(o instanceof T.Mesh){meshes++;const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){assert.ok(Number.isFinite(a.getX(i)));assert.ok(Number.isFinite(a.getY(i)));assert.ok(Number.isFinite(a.getZ(i)));}}});assert.ok(meshes>0,p.id);assert.equal(root.userData.placeId,p.id);const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3());assert.ok(size.y>0&&size.x>0&&size.z>0,p.id);assert.ok(size.y<70,p.id+' height');}
});
test('tower and rooftop arena retain their distinct silhouettes',()=>{
 const k=building(places.find(p=>p.id==='K'));const l=building(places.find(p=>p.id==='L'));const kb=new T.Box3().setFromObject(k),lb=new T.Box3().setFromObject(l);assert.ok(kb.max.y>lb.max.y*1.8);assert.ok(lb.getSize(new T.Vector3()).x>60);assert.ok(lb.max.y>20);
});
test('building surface can be selected by a world-space ray',()=>{
 const p=places.find(p=>p.id==='K'),root=building(p);root.position.set(p.x,0,p.z);root.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(p.x,100,p.z),new T.Vector3(0,-1,0));assert.ok(ray.intersectObject(root,true).length>0);
});


import {batchMeshes} from '../lib/campus/batch-meshes.ts';
test('static facade batching keeps landmark bounds and picking intact',()=>{
 const root=building(places.find(p=>p.id==='K'));root.updateMatrixWorld(true);const before=new T.Box3().setFromObject(root);let oldCount=0;root.traverse(o=>{if(o instanceof T.Mesh)oldCount++;});batchMeshes(root);root.updateMatrixWorld(true);const after=new T.Box3().setFromObject(root);let count=0;root.traverse(o=>{if(o instanceof T.Mesh)count++;});assert.ok(count<oldCount/2);assert.ok(before.min.distanceTo(after.min)<1e-4);assert.ok(before.max.distanceTo(after.max)<1e-4);const ray=new T.Raycaster(new T.Vector3(0,100,0),new T.Vector3(0,-1,0));assert.ok(ray.intersectObject(root,true).length>0);
});
