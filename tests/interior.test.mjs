import test from 'node:test';
import assert from 'node:assert/strict';
import {places} from '../lib/campus/data.ts';
import {interiorFor,moveInside,insideFree} from '../lib/campus/interior-layout.ts';
test('all enclosed buildings have an explorable reconstruction with a clear central aisle',()=>{
 for(const p of places){const room=interiorFor(p.id);if(['gate','pond'].includes(p.id)){assert.equal(room,null);continue;}
 assert.ok(room,p.id);assert.ok(insideFree(room,room.spawn),p.id+' spawn');
 let position={...room.spawn};for(let i=0;i<200;i++)position=moveInside(room,position,0,-.1);
 assert.ok(position.z<=0,p.id+' central aisle');assert.ok(insideFree(room,position));
 }
});
test('indoor movement is bounded and cannot tunnel into furniture',()=>{
 const room=interiorFor('K');let p={...room.spawn};
 p=moveInside(room,p,1000,0);assert.ok(insideFree(room,p));assert.ok(p.x<room.width/2);
 const obstacle=room.furniture.find(f=>f.solid);
 const before={x:obstacle.x,z:obstacle.z+obstacle.d/2+.7};
 assert.ok(insideFree(room,before));const after=moveInside(room,before,0,-100);assert.ok(after.z>=obstacle.z+obstacle.d/2+.25);
 assert.equal(interiorFor('nonexistent'),null);
});
