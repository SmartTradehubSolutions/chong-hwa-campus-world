import test from 'node:test';
import assert from 'node:assert/strict';
import { mapPoint, surfaceNormal } from '../lib/world-math.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8);
test('flat mode preserves every anchor',()=>{ for(const [x,z] of [[0,0],[52,-34],[-78,69]]) { const p=mapPoint(x,z,0); near(p.x,x); near(p.y,0); near(p.z,z); }});
test('world surface lies on its sphere',()=>{ for(const [x,z] of [[0,0],[52,-34],[-78,69]]) { const p=mapPoint(x,z,1); near(Math.hypot(p.x,p.y+110,p.z),110); }});
test('center and transition normals remain finite and unit length',()=>{ for(const t of [0,.2,.5,.8,1]) for(const [x,z] of [[0,0],[.00001,0],[60,-50]]) { const p=mapPoint(x,z,t),n=surfaceNormal(x,z,t); assert.ok(Object.values(p).every(Number.isFinite)); near(Math.hypot(n.x,n.y,n.z),1); assert.ok(n.y>0); }});
test('normals are perpendicular to surface tangents',()=>{ const e=.0001; for(const t of [.2,.5,.8,1]) { const p=mapPoint(35,42,t),px=mapPoint(35+e,42,t),pz=mapPoint(35,42+e,t),n=surfaceNormal(35,42,t); for(const q of [px,pz]) assert.ok(Math.abs(((q.x-p.x)*n.x+(q.y-p.y)*n.y+(q.z-p.z)*n.z)/e)<1e-5); }});
