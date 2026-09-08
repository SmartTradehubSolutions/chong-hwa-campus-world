import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createWalk} from '../lib/campus/walk-controller.ts';
import {createPerson} from '../lib/campus/characters.ts';
const windowTarget=new EventTarget(),documentTarget=new EventTarget();
globalThis.window=windowTarget;globalThis.document=documentTarget;document.hidden=false;
T.TextureLoader.prototype.load=function(){return new T.Texture();};
function setup(){const canvas=new EventTarget();canvas.focus=()=>{};canvas.setPointerCapture=()=>{};let state;const interactions=[];const scene=new T.Scene();const walk=createWalk(scene,canvas,{onState:s=>state=s,onInteract:id=>interactions.push(id)});walk.setCurve(0);walk.setActive(true);return{walk,scene,canvas,get state(){return state;},interactions};}
const key=(type,code)=>{const e=new Event(type,{cancelable:true});e.code=code;window.dispatchEvent(e);};
test('walking input pauses for overlays and clears on blur',()=>{
 const c=setup();key('keydown','KeyW');c.walk.update(.5);assert.ok(c.state.z<73);c.walk.setPaused(true);const z=c.state.z;c.walk.update(.5);assert.equal(c.state.z,z);c.walk.setPaused(false);c.walk.update(.5);assert.equal(c.state.z,z);
 key('keydown','KeyW');window.dispatchEvent(new Event('blur'));c.walk.update(.5);assert.equal(c.state.z,z);c.walk.dispose();
});
test('entrance interaction collects each stamp once and preserves progress between modes',()=>{
 const c=setup();c.walk.goTo('gate');c.walk.interact();c.walk.interact();assert.deepEqual(c.state.visited,['gate']);assert.deepEqual(c.interactions,['gate','gate']);c.walk.setActive(false);c.walk.setActive(true);assert.deepEqual(c.state.visited,['gate']);c.walk.dispose();
});
test('court plays five scored shots, supports replay, and exits cleanly',()=>{
 const c=setup();c.walk.goTo('court');c.walk.interact();assert.equal(c.state.game.phase,'aim');assert.ok(c.state.visited.includes('court'));
 for(let i=0;i<5;i++){c.walk.charge(true);c.walk.update(.65/.55);c.walk.charge(false);c.walk.update(1.2);c.walk.update(1);}
 assert.equal(c.state.game.phase,'results');assert.equal(c.state.game.attempts,5);assert.equal(c.state.game.score,5);
 c.walk.startBasketball();assert.equal(c.state.game.score,0);assert.equal(c.state.game.attempts,0);c.walk.setActive(false);assert.equal(c.state.game.phase,'off');c.walk.charge(true);c.walk.update(1);assert.equal(c.state.game.phase,'off');c.walk.dispose();
});
test('uniformed students and teachers have finite animated geometry',()=>{
 for(const kind of ['boy','girl','teacher']){const p=createPerson(kind,1,new T.Texture());const before=new T.Box3().setFromObject(p.root);p.animate(1,true);p.root.updateMatrixWorld(true);const after=new T.Box3().setFromObject(p.root);assert.ok(after.max.y>2);assert.ok(after.max.y<3);assert.ok([after.min.x,after.min.y,after.min.z,after.max.x,after.max.y,after.max.z].every(Number.isFinite));assert.ok(before.max.y>0);}
});
