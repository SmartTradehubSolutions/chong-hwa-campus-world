import * as T from 'three';
import {places} from './data';
import {createPerson,type PersonKind} from './characters';
import {buildObstacles,entrances,SPAWN,HOOP,moveStudent,nearestEntrance,isFree,createShot,shotAt,shotScores,type Shot} from './walk-math.mjs';
import {createWorldLayout,makeAnchor,resolvePose} from './world-layout.mjs';
export type BasketballState={phase:'off'|'aim'|'flight'|'results';score:number;attempts:number;power:number;aim:number;charging:boolean;message:string};
export type WalkState={active:boolean;nearby:string|null;visited:string[];x:number;z:number;yaw:number;game:BasketballState};
export const initialWalkState:WalkState={active:false,nearby:null,visited:[],x:37,z:73,yaw:0,game:{phase:'off',score:0,attempts:0,power:0,aim:0,charging:false,message:''}};
export function createWalk(scene:T.Scene,canvas:HTMLCanvasElement,callbacks:{onState:(state:WalkState)=>void;onInteract:(id:string)=>void}){
 const obstacles=buildObstacles(places),group=new T.Group();scene.add(group);
 const camera=new T.PerspectiveCamera(53,1,.15,650),worldLayout=createWorldLayout(places);
 const crest=new T.TextureLoader().load('/branding/chkl-official-crest.png');crest.colorSpace=T.SRGBColorSpace;
 let person=createPerson('boy',0,crest);person.root.position.set(SPAWN.x,.2,SPAWN.z);group.add(person.root);
 let position={...SPAWN},yaw=0,pitch=.32,cameraDistance=12,active=false,paused=false,curve=1,time=0,tick=0,walkTime=0;
 const keys=new Set<string>(),touch={x:0,y:0},visited=new Set<string>();
 let game:BasketballState={...initialWalkState.game},shot:Shot|null=null,shotTime=0,scored=false;
 const ball=new T.Mesh(new T.SphereGeometry(.25,16,12),new T.MeshStandardMaterial({color:'#d56d27',roughness:.88}));ball.visible=false;ball.castShadow=true;group.add(ball);
 for(const r of [0,Math.PI/2]){const seam=new T.Mesh(new T.TorusGeometry(.252,.012,4,32),new T.MeshBasicMaterial({color:'#653c28'}));seam.rotation.y=r;ball.add(seam);}
 const markerGroup=new T.Group();group.add(markerGroup);
 const markerMats:T.MeshBasicMaterial[]=[];
 const markers=entrances.map(e=>{const m=new T.MeshBasicMaterial({color:e.id==='court'?'#d57632':'#c38a3e',transparent:true,opacity:.85,side:T.DoubleSide});markerMats.push(m);const ring=new T.Mesh(new T.RingGeometry(.7,1.05,32),m);ring.rotation.x=-Math.PI/2;ring.position.set(e.x,.31,e.z);markerGroup.add(ring);return{ring,e};});
 const npcs=Array.from({length:30},(_,i)=>{
  let p={x:36,z:73};for(let n=0;n<100;n++){const x=-90+((i*47+n*29)%179),z=-83+((i*31+n*37)%164);if(isFree({x,z},obstacles)){p={x,z};break;}}
  const actor=createPerson(i%8===0?'teacher':i%2?'girl':'boy',i%8===0?Math.floor(i/8):i,crest),wrapper=new T.Group();wrapper.add(actor.root);group.add(wrapper);
  const landmark=places[i%places.length],a=worldLayout.get(landmark.id)!;
  const local=new T.Vector3((i%3-1)*6,110,landmark.d/2+6).applyQuaternion(a.rotation).normalize();
  const anchor=makeAnchor(p.x,p.z,local);
  return{actor,wrapper,p,heading:i*2.399,turn:0,anchor};
 });
 const cameraTarget=new T.Vector3(),cameraDesired=new T.Vector3(),cameraDelta=new T.Vector3(),normal=new T.Vector3();
 const pose={position:new T.Vector3(),rotation:new T.Quaternion(),normal:new T.Vector3()};
 const emit=()=>callbacks.onState({active,nearby:active&&game.phase==='off'?nearestEntrance(position)?.id||null:null,visited:[...visited],x:position.x,z:position.z,yaw,game:{...game}});
 const clearInput=()=>{pointer=null;keys.clear();touch.x=0;touch.y=0;game.charging=false;};
 function mark(id:string){visited.add(id);markers.forEach(m=>{if(m.e.id===id)(m.ring.material as T.MeshBasicMaterial).color.set('#3e9068');});}
 function interact(){if(!active||paused||game.phase!=='off')return;const near=nearestEntrance(position);if(!near)return;mark(near.id);if(near.id==='court')startBasketball();else callbacks.onInteract(near.id);emit();}
 function startBasketball(){if(active)canvas.focus({preventScroll:true});position={x:-58,z:24};yaw=0;pitch=.28;clearInput();game={phase:'aim',score:0,attempts:0,power:0,aim:0,charging:false,message:'Aim for the hoop. Release in the green zone.'};ball.visible=true;emit();}
 function charge(down:boolean){if(!active||paused||game.phase!=='aim')return;if(down){if(!game.charging){game.power=0;game.charging=true;}}else if(game.charging){game.charging=false;shot=createShot({x:HOOP.x,y:1.8,z:24},game.aim,game.power);shotTime=0;scored=false;game.phase='flight';game.attempts++;game.message='';}emit();}
 function leaveBasketball(){clearInput();if(active&&!paused)canvas.focus({preventScroll:true});game={...initialWalkState.game};shot=null;ball.visible=false;emit();}
 function keyDown(e:KeyboardEvent){if(!active||paused||e.ctrlKey||e.metaKey||e.altKey)return;
  const tag=(e.target as HTMLElement)?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag)||(e.target as HTMLElement)?.isContentEditable)return;
  if(tag==='BUTTON'&&(e.code==='Space'||e.code==='Enter'))return;
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE','ShiftLeft','ShiftRight','Escape'].includes(e.code))e.preventDefault();
  if(e.code==='KeyE'&&!e.repeat)interact();else if(e.code==='Space'&&!e.repeat)charge(true);else if(e.code==='Escape'&&game.phase!=='off')leaveBasketball();else keys.add(e.code);
 }
 function keyUp(e:KeyboardEvent){keys.delete(e.code);if(e.code==='Space')charge(false);}
 let pointer:{id:number;x:number;y:number}|null=null;
 function pointerDown(e:PointerEvent){if(!active||paused||game.phase!=='off')return;canvas.focus();pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}
 function pointerMove(e:PointerEvent){if(!active||paused||!pointer||pointer.id!==e.pointerId)return;yaw-=(e.clientX-pointer.x)*.006;pitch=T.MathUtils.clamp(pitch+(e.clientY-pointer.y)*.004,.1,1);pointer.x=e.clientX;pointer.y=e.clientY;}
 function pointerUp(){pointer=null;}
 function onWheel(e:WheelEvent){if(active){cameraDistance=T.MathUtils.clamp(cameraDistance+e.deltaY*.008,5,22);}}
 function visibility(){if(document.hidden)clearInput();}
 window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',visibility);
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',onWheel,{passive:true});
 function setCurve(value:number){curve=value;person.root.visible=value<.02;markerGroup.visible=active;
  for(const npc of npcs){npc.anchor.flat.set(npc.p.x,0,npc.p.z);resolvePose(npc.anchor,value,pose);npc.wrapper.position.copy(pose.position);npc.wrapper.quaternion.copy(pose.rotation);}
 }
 function updateCamera(dt:number,snap=false){
  if(game.phase!=='off'){cameraTarget.set(-58,2.6,17);cameraDesired.set(-58,6.2,31.5);}
  else{cameraTarget.set(position.x,1.65,position.z);cameraDesired.set(position.x+Math.sin(yaw)*cameraDistance,1.65+Math.sin(pitch)*cameraDistance,position.z+Math.cos(yaw)*cameraDistance);
   // Shorten the chase camera before it enters a building.
   cameraDelta.copy(cameraDesired).sub(cameraTarget);
   for(let t=.05;t<=1;t+=.025){normal.copy(cameraTarget).addScaledVector(cameraDelta,t);if(obstacles.some(o=>normal.y<o.h&&Math.abs(normal.x-o.x)<o.w/2+.3&&Math.abs(normal.z-o.z)<o.d/2+.3)){cameraDesired.copy(cameraTarget).addScaledVector(cameraDelta,Math.max(.08,t-.035));break;}}
  }
  if(snap)camera.position.copy(cameraDesired);else camera.position.lerp(cameraDesired,1-Math.exp(-dt*8));camera.lookAt(cameraTarget);
 }
 function update(dt:number){
  time+=dt;markerGroup.visible=active;person.root.visible=curve<.02;
  if(curve<.02&&!paused){for(const [i,npc]of npcs.entries()){
   npc.turn-=dt;if(npc.turn<0){npc.turn=3+i%4;npc.heading+=Math.sin(time+i)*1.4;}
   const next=moveStudent(npc.p,0,1,npc.heading,dt*(i%8===0?1.1:1.65),obstacles),moved=Math.hypot(next.x-npc.p.x,next.z-npc.p.z)>.005;
   if(!moved)npc.heading+=dt*3;npc.p=next;npc.wrapper.position.set(next.x,.2,next.z);npc.wrapper.quaternion.identity();npc.actor.root.rotation.y=npc.heading;npc.actor.animate(time+i,moved);
  }}
  if(!active)return;
  if(!paused){
   if(game.phase==='off'){
    const x=touch.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
    const forward=touch.y+Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
    const next=moveStudent(position,x,forward,yaw,dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?9:5.2),obstacles),moved=Math.hypot(next.x-position.x,next.z-position.z)>.001;
    if(moved){person.root.rotation.y=Math.atan2(-(next.x-position.x),-(next.z-position.z));walkTime+=dt;}position=next;person.animate(walkTime,moved);
   }else if(game.phase==='aim'){
    const aimInput=touch.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
    game.aim=T.MathUtils.clamp(game.aim+aimInput*dt*.35,-.32,.32);
    if(game.charging)game.power=Math.min(1,game.power+dt*.55);
    person.animate(time,false);person.poseShot(game.power);ball.position.set(position.x+.15,1.8,position.z-.4);person.root.rotation.y=-game.aim;
   }else if(game.phase==='flight'&&shot){person.poseShot(1);shotTime+=dt;const p=shotAt(shot,shotTime);ball.position.set(p.x,Math.max(.25,p.y),p.z);ball.rotation.x+=dt*5;
    if(!scored&&shotTime>=1.15){scored=true;if(shotScores(shot)){game.score++;game.message='Basket!';}else game.message='Missed — adjust your aim and power.';}
    if(shotTime>2.1){game.phase=game.attempts>=5?'results':'aim';game.power=0;shot=null;if(game.phase==='results')game.message=game.score===5?'Perfect round!':game.score+' of 5 baskets. Play again to beat your score.';}
   }
  }
  person.root.position.set(position.x,.2,position.z);updateCamera(dt);tick+=dt;if(tick>.1){tick=0;emit();}
 }
 return{camera,update,setCurve,interact,charge,leaveBasketball,startBasketball,
  setActive(value:boolean){active=value;clearInput();if(!value)leaveBasketball();markerGroup.visible=value;if(value){updateCamera(0,true);canvas.focus({preventScroll:true});}emit();},
  setPaused(value:boolean){paused=value;if(value)clearInput();else if(active)canvas.focus({preventScroll:true});},
  setAvatar(kind:'boy'|'girl'){const next=createPerson(kind,kind==='girl'?1:0,crest);next.root.position.copy(person.root.position);next.root.rotation.copy(person.root.rotation);group.remove(person.root);person.root.traverse(o=>{if(o instanceof T.Mesh){if(o.geometry.type!=='BoxGeometry')o.geometry.dispose();if((o.material as T.Material).type==='MeshBasicMaterial')(o.material as T.Material).dispose();}});person=next;group.add(person.root);if(active&&!paused)canvas.focus({preventScroll:true});},
  input(x:number,y:number){touch.x=x;touch.y=y;},aim(delta:number){game.aim=T.MathUtils.clamp(game.aim+delta,-.32,.32);if(active&&!paused)canvas.focus({preventScroll:true});emit();},
  zoom(factor:number){cameraDistance=T.MathUtils.clamp(cameraDistance/factor,5,22);},
  reset(){position={...SPAWN};yaw=0;pitch=.32;leaveBasketball();updateCamera(0,true);},
  goTo(id:string){const e=entrances.find(e=>e.id===id);if(e){position={x:e.x,z:e.z+1};if(!isFree(position,obstacles))position={x:e.x,z:e.z};yaw=0;leaveBasketball();updateCamera(0,true);emit();}},
  dispose(){window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',onWheel);crest.dispose();markerMats.forEach(m=>m.dispose());group.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshBasicMaterial){o.material.dispose();}});}
 };
}
