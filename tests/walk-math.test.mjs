import test from 'node:test';
import assert from 'node:assert/strict';
import {places} from '../lib/campus/data.ts';
import {buildObstacles,isFree,moveStudent,entrances,SPAWN,shotAt,createShot,shotScores,HOOP,nearestEntrance} from '../lib/campus/walk-math.mjs';
const obstacles=buildObstacles(places);
test('spawn and every entrance can be reached without a building overlap',()=>{
 assert.ok(isFree(SPAWN,obstacles));
 for(const e of entrances)assert.ok(isFree(e,obstacles),e.id);
 // Flood fill the outdoor campus; every interaction point must connect to the gate.
 const seen=new Set(),queue=[{x:37,z:73}];
 for(let i=0;i<queue.length;i++){const p=queue[i],key=p.x+','+p.z;if(seen.has(key))continue;seen.add(key);
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,z:p.z+dz};if(!seen.has(n.x+','+n.z)&&isFree(n,obstacles))queue.push(n);}
 }
 for(const e of entrances)assert.ok([...seen].some(k=>{const [x,z]=k.split(',').map(Number);return Math.hypot(x-e.x,z-e.z)<2;}),e.id+' reachable');
});
test('movement normalizes diagonal input and cannot tunnel through walls',()=>{
 const p={x:37,z:73},straight=moveStudent(p,0,1,0,1,obstacles),diagonal=moveStudent(p,1,1,0,1,obstacles);
 assert.ok(Math.abs(Math.hypot(straight.x-p.x,straight.z-p.z)-Math.hypot(diagonal.x-p.x,diagonal.z-p.z))<1e-6);
 const blocked=moveStudent({x:9,z:68},0,1,0,20,obstacles);assert.ok(isFree(blocked,obstacles));assert.ok(blocked.z>61);
});
test('camera heading rotates forward movement consistently',()=>{
 const p={x:37,z:73};const n=moveStudent(p,0,1,Math.PI/2,1,obstacles);assert.ok(n.x<p.x);assert.ok(Math.abs(n.z-p.z)<1e-6);
});
test('interactions only activate near an entrance',()=>{
 assert.equal(nearestEntrance({x:37,z:69})?.id,'gate');assert.equal(nearestEntrance({x:-90,z:-80}),null);
});
test('basketball requires correct aim and power on descending hoop crossing',()=>{
 const origin={x:HOOP.x,y:1.8,z:24};const good=createShot(origin,0,.65);
 assert.equal(shotScores(good),true);assert.equal(shotScores(createShot(origin,.3,.65)),false);assert.equal(shotScores(createShot(origin,0,.15)),false);
 assert.deepEqual(shotAt(good,0),origin);assert.ok(shotAt(good,4).y<0);
});
