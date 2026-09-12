import test from 'node:test';
import assert from 'node:assert/strict';
import {photoUV,photoPositionFree,moveInPhotoRoom} from '../lib/campus/photo-room-math.ts';
const room={cameraHeight:1.65,walkRadius:2,bounds:{minX:-5,maxX:5,minZ:-8,maxZ:3,height:3},objects:[{label:'Observed counter',x:1.2,y:.5,z:-1,w:.7,h:1,d:1,solid:true}]};
test('photo projection preserves the source panorama directions',()=>{
 assert.deepEqual(photoUV({x:0,y:0,z:-1}),{u:.5,v:.5});
 assert.deepEqual(photoUV({x:1,y:0,z:0}),{u:.75,v:.5});
 assert.deepEqual(photoUV({x:-1,y:0,z:0}),{u:.25,v:.5});
 assert.equal(photoUV({x:0,y:1,z:0}).v,1);
});
test('walking stays near the photographed viewpoint and cannot cross observed furniture',()=>{
 assert.ok(photoPositionFree(room,{x:0,z:0}));
 let p=moveInPhotoRoom(room,{x:0,z:0},100,0);assert.ok(Math.hypot(p.x,p.z)<=2);assert.ok(photoPositionFree(room,p));
 p=moveInPhotoRoom(room,{x:0,z:-1},100,0);assert.ok(p.x<.7,'counter must stop movement before its surface');
 p=moveInPhotoRoom(room,{x:0,z:0},0,-100);assert.ok(p.z>=-2);
});

import fs from 'node:fs';
import {photoRooms,firstPhotoRoom} from '../lib/campus/photo-rooms.ts';
const manifest=JSON.parse(fs.readFileSync(new URL('../docs/media-manifest.json',import.meta.url),'utf8'));
test('every walkable model is tied to its real photograph and has a clear camera origin',()=>{
 assert.equal(photoRooms.length,5);
 for(const model of photoRooms){
  const source=manifest.find(p=>p.file===model.image);assert.ok(source,model.image);assert.equal(model.source,source.source);
  assert.ok(photoPositionFree(model,{x:0,z:0}),model.image+' camera must be clear');
  assert.ok(model.objects.length>0);assert.ok(model.bounds.height>model.cameraHeight);
  for(const obj of model.objects)for(const v of [obj.x,obj.y,obj.z,obj.w,obj.h,obj.d])assert.ok(Number.isFinite(v));
  assert.ok(model.objects.every(o=>o.w>0&&o.h>0&&o.d>0));
 }
 assert.equal(firstPhotoRoom('K').image,'pusatsumber-1.jpg');
 assert.equal(firstPhotoRoom('I'),null);assert.equal(firstPhotoRoom('J'),null);assert.equal(firstPhotoRoom('L'),null);
});

import {photoDepthGeometry} from '../lib/campus/photo-depth-geometry.ts';
test('depth surface uses the nearest photographed object and remains finite for every trace',()=>{
 const fixture={...room,image:'test',objects:[{label:'Foreground surface',x:0,y:1.65,z:-2,w:2,h:2,d:1}]};
 const g=photoDepthGeometry(fixture),a=g.attributes.position,i=128*513+256;
 assert.ok(Math.abs(a.getZ(i)+1.5)<1e-5,'foreground must replace hidden rear-wall projection');
 assert.ok(Math.abs(a.getY(i)-1.65)<1e-5);g.dispose();
 for(const r of photoRooms){const geometry=photoDepthGeometry(r);assert.equal(geometry.userData.sourceImage,r.image);assert.ok(geometry.index.count>0);for(const n of geometry.attributes.position.array)assert.ok(Number.isFinite(n));geometry.dispose();}
});
