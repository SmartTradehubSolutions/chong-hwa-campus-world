import * as T from 'three';
import {box} from './primitives';
import {batchMeshes} from './batch-meshes';
import {interiorFor,moveInside} from './interior-layout';

export function createInterior(host:HTMLDivElement,id:string,onReady:()=>void){
 const room=interiorFor(id);if(!room)throw new Error('No enclosed room for this place');
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;host.appendChild(renderer.domElement);
 const ownedMaterials:T.Material[]=[];
 const scene=new T.Scene();scene.background=new T.Color('#d5e0df');
 const camera=new T.PerspectiveCamera(68,1,.08,120),root=new T.Group();scene.add(root);
 const {width:w,depth:d,height:h}=room;
 box(root,0,-.13,0,w,.25,d,room.kind==='arena'?'#cbb690':'#e6ddc9');
 box(root,0,h,0,w,.16,d,'#e9eae5');
 for(const x of [-w/2,w/2]){
  box(root,x,h/2,0,.2,h,d,'#e1e3df');
  for(let z=-d/2+2;z<d/2-1;z+=3){
   box(root,x-Math.sign(x)*.13,2.1,z,.06,1.6,2.4,'#bdd3d9');
   box(root,x-Math.sign(x)*.18,2.1,z,.08,1.65,.06,'#798378');
   box(root,x-Math.sign(x)*.18,1.3,z,.2,.13,2.6,'#dedfd8');
  }
  box(root,x-Math.sign(x)*.12,.16,0,.15,.3,d,'#798378');
 }
 for(const z of [-d/2,d/2])box(root,0,h/2,z,w,h,.2,'#e1e3df');
 // Entry doors stay visible behind the visitor.
 box(root,0,1.15,d/2-.15,2.4,2.3,.1,'#354f50');box(root,0,1.15,d/2-.22,.06,2.3,.1,'#798378');
 for(const x of [-w/2+2,w/2-2])for(let z=-d/2+3;z<d/2;z+=4)box(root,x,h-.18,z,1.5,.12,.3,'#fafaf3');
 function table(x:number,z:number,width:number,depth:number,height=.78){
  box(root,x,height,z,width,.12,depth,'#ad8b60');
  for(const dx of [-width*.4,width*.4])for(const dz of [-depth*.36,depth*.36])box(root,x+dx,height/2,z+dz,.065,height,.065,'#454a4d');
 }
 for(const [index,f]of room.furniture.entries()){
  if(f.kind==='shelf'){
   box(root,f.x,1.1,f.z,f.w,2.2,f.d,'#ad8b60');
   for(let level=0;level<4;level++){
    for(let row=0;row<13;row++){
     const z=f.z-f.d*.43+row*f.d/15,height=.27+((row+index)%3)*.06;
     for(const side of [-1,1])box(root,f.x+side*(f.w/2+.04),.25+level*.48+height/2,z,.11,height,.12,['#7c483d','#536b58','#b6a270','#5c7288'][row%4]);
    }
   }
  }else if(f.kind==='bed'){
   box(root,f.x,.38,f.z,f.w,.25,f.d,'#798378');box(root,f.x,.58,f.z,f.w-.1,.25,f.d-.1,'#ecece6');box(root,f.x,.76,f.z-f.d*.3,f.w*.75,.18,.5,'#fafaf3');
   box(root,f.x,.73,f.z+.4,f.w-.13,.08,f.d*.52,'#5c7288');
  }else if(f.kind==='stage'){
   box(root,f.x,.45,f.z,f.w,.9,f.d,'#ad8b60');box(root,0,h*.52,-d/2+.2,w*.7,h*.65,.12,'#763d39');
   for(const x of [-f.w/2,f.w/2])box(root,x,1.2,f.z+1,.7,1.5,.6,'#303a38');
  }else if(f.kind==='bench'){
   table(f.x,f.z,f.w,f.d,.45);box(root,f.x,.85,f.z-f.d*.42,f.w,.6,.1,'#6c8373');
  }else{
   table(f.x,f.z,f.w,f.d);
   // Chairs remain within the declared collision footprint.
   for(const side of [-1,1]){const x=f.x+side*f.w*.32;box(root,x,.4,f.z+.24,.45,.1,.4,'#6c8373');box(root,x,.65,f.z+.43,.45,.5,.08,'#6c8373');}
  }
 }
 if(room.kind==='classroom'||room.kind==='office'){
  box(root,0,1.8,-d/2+.17,4,1.5,.12,'#314e40');box(root,0,1,-d/2+.27,4.2,.08,.25,'#dedfd8');
 }
 if(room.kind==='arena'){
  const courtW=12,courtD=20;
  for(const x of [-courtW/2,courtW/2])box(root,x,.015,0,.05,.015,courtD,'#fafaf3');
  for(const z of [-courtD/2,0,courtD/2])box(root,0,.015,z,courtW,.015,.05,'#fafaf3');
  for(const z of [-9,9]){box(root,0,3,z,1.8,1,.12,'#fafaf3');const rimMaterial=new T.MeshStandardMaterial({color:'#b65632'});ownedMaterials.push(rimMaterial);const hoop=new T.Mesh(new T.TorusGeometry(.45,.025,6,24),rimMaterial);hoop.rotation.x=Math.PI/2;hoop.position.set(0,2.8,z-Math.sign(z)*.5);root.add(hoop);}
 }
 batchMeshes(root);
 scene.add(new T.HemisphereLight('#f3f4eb','#8b8273',2.2));
 const sun=new T.DirectionalLight('#fff1d9',2.1);sun.position.set(-w*.28,h-.3,d*.35);sun.target.position.set(0,0,-d*.2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-w,right:w,top:d,bottom:-d,near:.1,far:60});sun.shadow.normalBias=.03;scene.add(sun,sun.target);
 let position={...room.spawn},yaw=0,pitch=0,raf=0,last=0,drag=false,pointer={x:0,y:0},disposed=false;
 const keys=new Set<string>(),touch={x:0,z:0};
 const clear=()=>{keys.clear();touch.x=touch.z=0;drag=false;};
 const editable=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('input,select,textarea');
 const keydown=(e:KeyboardEvent)=>{if(editable(e))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}};
 const keyup=(e:KeyboardEvent)=>keys.delete(e.code);
 const down=(e:PointerEvent)=>{drag=true;pointer={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent)=>{if(!drag)return;yaw-=(e.clientX-pointer.x)*.004;pitch=T.MathUtils.clamp(pitch-(e.clientY-pointer.y)*.003,-1.15,1.15);pointer={x:e.clientX,y:e.clientY};};
 const up=()=>{drag=false;};
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Walkable reconstructed interior. WASD or arrow keys to walk, drag to look.');
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
 const resize=()=>{const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function render(now:number){
  if(disposed)return;raf=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;
  let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touch.x;
  let z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touch.z;
  const len=Math.hypot(x,z);if(len){x/=len;z/=len;position=moveInside(room!,position,(x*Math.cos(yaw)+z*Math.sin(yaw))*dt*3.2,(-x*Math.sin(yaw)+z*Math.cos(yaw))*dt*3.2);}
  camera.position.set(position.x,1.65,position.z);camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);renderer.render(scene,camera);
  host.dataset.position=position.x.toFixed(2)+','+position.z.toFixed(2);
 }
 raf=requestAnimationFrame(render);onReady();
 return{input(x:number,z:number){touch.x=x;touch.z=z;},reset(){position={...room.spawn};yaw=pitch=0;clear();},dispose(){
  disposed=true;cancelAnimationFrame(raf);observer.disconnect();clear();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);
  root.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});ownedMaterials.forEach(m=>m.dispose());sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 }};
}
