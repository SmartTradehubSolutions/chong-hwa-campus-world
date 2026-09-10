import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {box,building} from '../lib/campus/primitives.ts';
import {places} from '../lib/campus/data.ts';
import {batchMeshes} from '../lib/campus/batch-meshes.ts';
import {resolveVisit} from '../lib/campus/visits.ts';

test('architectural surfaces carry photographic maps with metric rather than stretched UVs',()=>{
 const g=new T.Group();
 const a=box(g,0,0,0,3,2,1,'#a9705a'),b=box(g,0,0,0,12,2,1,'#a9705a');
 assert.ok(a.material.map);assert.ok(a.material.normalMap);assert.ok(a.material.roughnessMap);
 const span=m=>{const uv=m.geometry.attributes.uv;let min=Infinity,max=-Infinity;for(let i=0;i<uv.count;i++){min=Math.min(min,uv.getX(i));max=Math.max(max,uv.getX(i));}return max-min;};
 assert.ok(span(b)>span(a)*2,'brick size must remain consistent on wider walls');
 const maps=a.material.map;batchMeshes(g);assert.ok(g.children.some(m=>m.material.map===maps));
 for(const p of places){let textured=0;building(p).traverse(o=>{if(o instanceof T.Mesh&&o.material.map)textured++;});assert.ok(textured>0,p.id+' must contain a textured surface');}
});
test('an entrance resolves to a verified panorama, with safe photo and information fallbacks',()=>{
 const entrance=resolveVisit('gate');assert.equal(entrance.kind,'panorama');assert.equal(entrance.view.image,'xuexiaodamenkou-1.jpg');
 assert.equal(resolveVisit('K').kind,'panorama');
 const arena=resolveVisit('L');assert.equal(arena.kind,'photo');assert.equal(arena.image,'arena-photo.jpg');
 assert.equal(resolveVisit('I').kind,'information');assert.equal(resolveVisit('unknown'),null);
 for(const place of places){for(const v of place.views||[]){assert.ok(fs.existsSync(new URL('../public/media/'+v.image,import.meta.url)));assert.notEqual(v.image,'arena-photo.jpg');}}
});
