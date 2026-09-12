import * as T from 'three';
import type {PhotoRoom} from './photo-room-layout';
import {moveInPhotoRoom} from './photo-room-math';
import {photoDepthGeometry} from './photo-depth-geometry';

/** Project the source panorama in world space, from its original optical centre. */
export function createPhotoRoom(host:HTMLDivElement,room:PhotoRoom,onReady:()=>void,onError:()=>void){
 const renderer=new T.WebGLRenderer({antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
 host.appendChild(renderer.domElement);
 const scene=new T.Scene(),root=new T.Group();scene.background=new T.Color('#252822');scene.add(root);
 const camera=new T.PerspectiveCamera(70,1,.04,180);
 const material=new T.ShaderMaterial({
  side:T.DoubleSide,uniforms:{photo:{value:null},capture:{value:new T.Vector3(0,room.cameraHeight,0)}},
  vertexShader:'varying vec3 worldPoint; void main(){ vec4 p=modelMatrix*vec4(position,1.0); worldPoint=p.xyz; gl_Position=projectionMatrix*viewMatrix*p; }',
  fragmentShader:`uniform sampler2D photo; uniform vec3 capture; varying vec3 worldPoint;
   void main(){vec3 d=normalize(worldPoint-capture);vec2 uv=vec2(fract(atan(d.x,-d.z)/6.28318530718+0.5),asin(clamp(d.y,-1.0,1.0))/3.14159265359+0.5);
   gl_FragColor=texture2D(photo,uv);
   #include <colorspace_fragment>
  }`
 });
 // Keep only the surface visible along each source-photo ray, preventing duplicate projections behind furniture.
 root.add(new T.Mesh(photoDepthGeometry(room),material));
 let texture:T.Texture|undefined,disposed=false,raf=0,last=0,position={x:0,z:0},yaw=0,pitch=0,drag=false,pointer={x:0,y:0};
 const keys=new Set<string>(),touch={x:0,z:0};
 const clear=()=>{keys.clear();touch.x=touch.z=0;drag=false;};
 const keydown=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('input,select,textarea'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}};
 const keyup=(e:KeyboardEvent)=>keys.delete(e.code);
 const down=(e:PointerEvent)=>{drag=true;pointer={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent)=>{if(!drag)return;yaw-=(e.clientX-pointer.x)*.004;pitch=T.MathUtils.clamp(pitch-(e.clientY-pointer.y)*.003,-1.35,1.35);pointer={x:e.clientX,y:e.clientY};};
 const up=()=>{drag=false;};
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label',room.title+'. Photo-matched walkable model. WASD or arrows to move, drag to look.');
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
 const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 new T.TextureLoader().load('/media/'+room.image,t=>{if(disposed){t.dispose();return;}texture=t;t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());material.uniforms.photo.value=t;onReady();},undefined,()=>{if(!disposed)onError();});
 function render(now:number){
  if(disposed)return;raf=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;if(!texture)return;
  let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touch.x;
  let z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touch.z;
  const len=Math.hypot(x,z);let bounded=false;
  if(len){x/=len;z/=len;const before=position;position=moveInPhotoRoom(room,position,(x*Math.cos(yaw)+z*Math.sin(yaw))*dt*1.2,(-x*Math.sin(yaw)+z*Math.cos(yaw))*dt*1.2);bounded=Math.hypot(position.x-before.x,position.z-before.z)<dt*.2;}
  host.dataset.position=position.x.toFixed(2)+','+position.z.toFixed(2);host.dataset.boundary=String(bounded);
  camera.position.set(position.x,room.cameraHeight,position.z);camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);if(texture)renderer.render(scene,camera);
 }
 raf=requestAnimationFrame(render);
 return{input(x:number,z:number){touch.x=x;touch.z=z;},reset(){position={x:0,z:0};yaw=pitch=0;clear();},dispose(){
  disposed=true;cancelAnimationFrame(raf);observer.disconnect();clear();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);
  root.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});texture?.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 }};
}
