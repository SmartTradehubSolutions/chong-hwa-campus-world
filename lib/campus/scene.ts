import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mapPoint, surfaceNormal } from '../world-math.mjs';
import { places, featuredIds, type ViewMode } from './data';
import { building, box, tree, court, material } from './primitives';
import {createWorldLayout,resolvePose,type WorldPose} from './world-layout.mjs';
import {createWorldContext} from './world-context';
import {createWalk,type WalkState} from './walk-controller';
import {addBuildingSigns} from './signage';
import {batchMeshes} from './batch-meshes';

type Options={onSelect:(id:string)=>void;onReady:()=>void;onError:(message:string)=>void;onWalkState:(state:WalkState)=>void;onWalkInteract:(id:string)=>void};
type Anchor={root:T.Group;x:number;z:number;yaw:number};
export function createCampus(host:HTMLDivElement,options:Options){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 renderer.domElement.setAttribute('aria-label','Interactive Chong Hwa campus. Drag to orbit, scroll to zoom. Use the place directory to select a building.');
 renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;host.appendChild(renderer.domElement);
 const scene=new T.Scene();
 const camera=new T.OrthographicCamera(-150,150,150,-150,.1,1400);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.075;controls.minZoom=.55;controls.maxZoom=3.5;controls.maxPolarAngle=Math.PI-.01;controls.minPolarAngle=.01;controls.screenSpacePanning=true;controls.rotateSpeed=.6;controls.autoRotateSpeed=.35;controls.zoomSpeed=.75;
 controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN};
 const hemi=new T.HemisphereLight('#f1faff','#8d9478',2.5);scene.add(hemi);
 const sun=new T.DirectionalLight('#fff0da',3.3);sun.position.set(-100,190,100);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-160,right:160,top:160,bottom:-160,near:10,far:500});sun.shadow.bias=-.0006;sun.shadow.normalBias=.45;scene.add(sun);
 const fill=new T.DirectionalLight('#d5e7ec',1);fill.position.set(100,30,-80);scene.add(fill);
 const globe=new T.Mesh(new T.SphereGeometry(109.6,72,48),material('#99b88b'));globe.position.y=-110;globe.material.transparent=true;globe.receiveShadow=true;scene.add(globe);
 const worldLayout=createWorldLayout(places),worldContext=createWorldContext(worldLayout,places);scene.add(worldContext.group);
 scene.add(new T.AmbientLight('#f4f1de',.65));
 const walk=createWalk(scene,renderer.domElement,{onState:options.onWalkState,onInteract:options.onWalkInteract});
 const signTextures:T.Texture[]=[];const schoolCrest=new T.TextureLoader().load('/branding/chkl-official-crest.png');schoolCrest.colorSpace=T.SRGBColorSpace;
 const anchors:Anchor[]=[]; const pickables:T.Object3D[]=[];
 const campusMaterials:T.MeshStandardMaterial[]=[];
 const add=(root:T.Group,x:number,z:number,yaw=0)=>{anchors.push({root,x,z,yaw});scene.add(root);return root;};
 const morphSurfaces:{mesh:T.Mesh;original:Float32Array}[]=[];
 function surface(w:number,d:number,x:number,z:number,color:string,raise=.04){
  const geom=new T.PlaneGeometry(w,d,Math.max(1,Math.ceil(w/3)),Math.max(1,Math.ceil(d/3)));geom.rotateX(-Math.PI/2);geom.translate(x,raise,z);
  const groundMaterial=material(color).clone();groundMaterial.transparent=true;campusMaterials.push(groundMaterial);
  const mesh=new T.Mesh(geom,groundMaterial);mesh.receiveShadow=true;scene.add(mesh);morphSurfaces.push({mesh,original:new Float32Array(geom.attributes.position.array as Float32Array)});return mesh;
 }
 surface(190,172,0,0,'#bac7a8',.01);
 surface(174,150,0,0,'#d8d4bf',.07);
 surface(188,9,0,79,'#8f9c96',.12);surface(9,157,-87,-3,'#8f9c96',.12);surface(9,149,88,0,'#8f9c96',.12);surface(181,7,0,-79,'#8f9c96',.12);
 surface(154,3,0,70,'#f0e8d6',.15);surface(4,125,-77,2,'#eee5d0',.15);surface(126,4,-8,-34,'#eee5d0',.15);
 for(let x=-85;x<=83;x+=10)surface(4,.32,x,79,'#e8e9d9',.18);
 for(let z=-70;z<=65;z+=10){surface(.32,4,-87,z,'#e8e9d9',.18);surface(.32,4,88,z,'#e8e9d9',.18);}
 surface(42,53,3,18,'#dedac9',.16);
 surface(26,36,-58,22,'#e7e0c9',.15);
 add(court(),-58,24);
 for(let i=0;i<7;i++)surface(1,6,32+i*1.7,78,'#f3ead8',.22);
 const plaza=new T.Group();
 for(let i=0;i<3;i++)box(plaza,0,.2+i*.24,0,18-i*1.5,.3,10-i*1.2,'#cfc2a8');
 add(plaza,6,32);
 for(const p of places){const root=add(building(p),p.x,p.z);batchMeshes(root);pickables.push(root);signTextures.push(...addBuildingSigns(root,p,schoolCrest));}
 // Trees follow the same ground mapping as the buildings.
 const treeCoords:[number,number][]=[];
 for(let x=-79;x<86;x+=10){treeCoords.push([x,87],[x,-87]);}
 for(let z=-68;z<=58;z+=12){treeCoords.push([-94,z],[96,z]);}
 treeCoords.push([-69,-20],[-69,-8],[-17,2],[-17,12],[-17,23],[-16,36],[23,8],[24,27],[18,33],[-50,47],[-49,-38],[-73,-52],[67,54],[69,63],[50,63],[-4,37],[-65,65]);
 treeCoords.forEach(([x,z],i)=>add(tree(i),x,z));
 // Low contextual blocks stay outside the school boundary.
 for(const [i,x,z,w,d] of [[0,-65,103,19,10],[1,-34,108,17,12],[2,64,104,20,11],[3,104,48,14,19],[4,-106,-15,12,20]]){
  const g=new T.Group();box(g,0,2.4,0,w,4.8,d,'#b1b8a5');box(g,0,5,0,w+1,.6,d+1,'#a6b29e');add(g,x,z);
 }
 const campusClones=new Map<T.Material,T.MeshStandardMaterial>();
 for(const a of anchors)if(!a.root.userData.placeId)a.root.traverse(o=>{if(o instanceof T.Mesh){const original=o.material as T.MeshStandardMaterial;if(!campusClones.has(original)){const clone=original.clone();clone.transparent=true;campusClones.set(original,clone);campusMaterials.push(clone);}o.material=campusClones.get(original)!;}});
 const labels=document.createElement('div');labels.className='map-label-layer';host.appendChild(labels);
 const markerEntries=places.map(p=>{const b=document.createElement('button');b.type='button';b.className='map-marker';b.setAttribute('aria-label','Explore '+p.name);b.innerHTML='<span>'+p.id.toUpperCase()+'</span><b>'+p.name+'</b>';b.addEventListener('click',()=>options.onSelect(p.id));labels.appendChild(b);return{p,element:b};});
 const highlight=new T.Mesh(new T.RingGeometry(1,1.06,64),new T.MeshBasicMaterial({color:'#a44938',side:T.DoubleSide,transparent:true,opacity:.9,depthTest:false}));
 highlight.rotation.x=-Math.PI/2;highlight.visible=false;highlight.renderOrder=2;scene.add(highlight);
 let curve=1,mode:ViewMode='world',selected:string|null=null,showLabels=true,disposed=false,raf=0,last=0,auto=false;
 let transition:null|{start:number;from:number;to:number;fromPos:T.Vector3;toPos:T.Vector3;fromTarget:T.Vector3;toTarget:T.Vector3;fromZoom:number;toZoom:number}=null;
 let focusTransition:null|{start:number;from:T.Vector3;rotation:T.Quaternion;target:T.Vector3;fromTarget:T.Vector3;distance:number}=null;
 let pendingFocus:string|null=null;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cameraToPoint=new T.Vector3();
 const pose:WorldPose={position:new T.Vector3(),rotation:new T.Quaternion(),normal:new T.Vector3()};
 const focusRotation=new T.Quaternion(),focusDirection=new T.Vector3();
 const up=new T.Vector3(0,1,0),normal=new T.Vector3(),pos=new T.Vector3(),q=new T.Quaternion(),yawQ=new T.Quaternion(),projected=new T.Vector3();
 function morph(value:number){
  curve=value;walk.setCurve(value);
  const campusOpacity=1-T.MathUtils.smoothstep(curve,.2,.85);
  campusMaterials.forEach(m=>{m.opacity=campusOpacity;m.depthWrite=campusOpacity>.9;});
  for(const a of anchors){
   const worldAnchor=worldLayout.get(a.root.userData.placeId);
   if(worldAnchor){resolvePose(worldAnchor,curve,pose);a.root.position.copy(pose.position);a.root.quaternion.copy(pose.rotation);}
   else{a.root.visible=campusOpacity>.005;const p=mapPoint(a.x,a.z,curve),n=surfaceNormal(a.x,a.z,curve);a.root.position.set(p.x,p.y,p.z);normal.set(n.x,n.y,n.z);q.setFromUnitVectors(up,normal);yawQ.setFromAxisAngle(up,a.yaw);a.root.quaternion.copy(q).multiply(yawQ);}
  }
  for(const {mesh,original}of morphSurfaces){mesh.visible=campusOpacity>.005;const geom=mesh.geometry,attr=geom.attributes.position;
   for(let i=0;i<attr.count;i++){const x=original[i*3],y=original[i*3+1],z=original[i*3+2],p=mapPoint(x,z,curve),n=surfaceNormal(x,z,curve);attr.setXYZ(i,p.x+n.x*y,p.y+n.y*y,p.z+n.z*y);}
   attr.needsUpdate=true;geom.computeVertexNormals();geom.computeBoundingSphere();
  }
  const bodyScale=curve**3;globe.visible=curve>.025;globe.material.opacity=T.MathUtils.smoothstep(curve,.15,.7);globe.scale.setScalar(bodyScale);globe.position.y=-110*bodyScale;worldContext.setCurve(curve);
  if(selected)updateHighlight();if(mode==='walk')highlight.visible=false;
 }
 function updateHighlight(){
  if(mode==='walk'){highlight.visible=false;return;}
  const p=places.find(p=>p.id===selected);if(!p){highlight.visible=false;return;}
  resolvePose(worldLayout.get(p.id)!,curve,pose);highlight.position.copy(pose.position).addScaledVector(pose.normal,.5);normal.copy(pose.normal);q.setFromUnitVectors(new T.Vector3(0,0,1),normal);highlight.quaternion.copy(q);highlight.scale.set(Math.max(p.w,p.d)*.65,Math.max(p.w,p.d)*.65,1);highlight.visible=true;
 }
 function targetFor(m:ViewMode){return new T.Vector3(0,m==='world'?-110:0,0);}
 function positionFor(m:ViewMode,target:T.Vector3){return m==='plan'?target.clone().add(new T.Vector3(0,330,3.301)):target.clone().add(m==='world'?new T.Vector3(150,220,270):new T.Vector3(145,175,230));}
 function resize(){
  const w=host.clientWidth,h=host.clientHeight,aspect=w/h,extent=210+115*curve;
  const view=Math.max(extent,(215+90*curve)/aspect);
  camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;
  camera.setViewOffset(w,h,w>900?-95:0,0,w,h);camera.updateProjectionMatrix();walk.camera.aspect=aspect;walk.camera.updateProjectionMatrix();if(renderer.domElement.clientWidth!==w||renderer.domElement.clientHeight!==h)renderer.setSize(w,h);
 }
 const observer=new ResizeObserver(resize);observer.observe(host);
 camera.position.copy(positionFor('world',targetFor('world')));controls.target.copy(targetFor('world'));controls.update();morph(1);resize();
 function setMode(next:ViewMode){
  walk.setActive(false);mode=next;focusTransition=null;pendingFocus=null;controls.autoRotate=false;controls.enabled=false;auto=false;
  controls.maxPolarAngle=next==='world'?Math.PI-.01:Math.PI*.48;
  const target=targetFor(next);
  transition={start:performance.now(),from:curve,to:next==='world'?1:0,fromPos:camera.position.clone(),toPos:positionFor(next,target),fromTarget:controls.target.clone(),toTarget:target,fromZoom:camera.zoom,toZoom:1};
  resize();
 }
 function focusPlace(id:string){
  if(mode!=='world')return;
  if(transition){pendingFocus=id;return;}
  const anchor=worldLayout.get(id);if(!anchor)return;
  const target=targetFor('world'),from=camera.position.clone().sub(controls.target).normalize();
  const direction=anchor.normal.clone().add(new T.Vector3(0,.11,0)).normalize();
  focusTransition=null;
  focusTransition={start:performance.now(),from,rotation:new T.Quaternion().setFromUnitVectors(from,direction),target,fromTarget:controls.target.clone(),distance:camera.position.distanceTo(controls.target)};
  controls.enabled=false;controls.autoRotate=false;
 }
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down={x:0,y:0},dragged=false;
 function hit(e:PointerEvent){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);scene.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects([...pickables,...morphSurfaces.filter(s=>s.mesh.visible).map(s=>s.mesh),...(globe.visible?[globe]:[])],true);if(!hits.length)return null;let o:T.Object3D|null=hits[0].object;while(o&&!o.userData.placeId)o=o.parent;return o?.userData.placeId as string||null;}
 function onDown(e:PointerEvent){down={x:e.clientX,y:e.clientY};dragged=false;}
 function onMove(e:PointerEvent){if(mode==='walk')return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)dragged=true;if(!e.buttons)renderer.domElement.style.cursor=hit(e)?'pointer':mode==='plan'?'grab':'grab';}
 function onUp(e:PointerEvent){if(mode!=='walk'&&!dragged&&!transition&&!focusTransition){const id=hit(e);if(id)options.onSelect(id);}}
 function onKey(e:KeyboardEvent){if(mode==='walk')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-','Home'].includes(e.key))e.preventDefault();const v=new T.Vector3();if(e.key==='ArrowUp')v.z=-5;if(e.key==='ArrowDown')v.z=5;if(e.key==='ArrowLeft')v.x=-5;if(e.key==='ArrowRight')v.x=5;camera.position.add(v);controls.target.add(v);if(e.key==='+')zoom(1.2);if(e.key==='-')zoom(1/1.2);if(e.key==='Home')setMode(mode);}
 renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerup',onUp);renderer.domElement.addEventListener('keydown',onKey);
 function zoom(factor:number){if(mode==='walk'){walk.zoom(factor);return;}camera.zoom=T.MathUtils.clamp(camera.zoom*factor,.55,3.5);camera.updateProjectionMatrix();}
 const viewDir=new T.Vector3();
 function animate(now:number){if(disposed)return;raf=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;
  if(transition){const t=reduced?1:Math.min((now-transition.start)/1100,1),e=t*t*(3-2*t);morph(T.MathUtils.lerp(transition.from,transition.to,e));camera.position.lerpVectors(transition.fromPos,transition.toPos,e);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,e);camera.zoom=T.MathUtils.lerp(transition.fromZoom,transition.toZoom,e);resize();camera.lookAt(controls.target);if(t===1){transition=null;controls.enabled=mode!=='walk';if(mode==='walk')walk.setActive(true);controls.enableRotate=mode!=='plan';controls.mouseButtons.LEFT=mode==='plan'?T.MOUSE.PAN:T.MOUSE.ROTATE;controls.update();if(pendingFocus){const id=pendingFocus;pendingFocus=null;focusPlace(id);}}}
  else if(focusTransition){
   const t=reduced?1:Math.min((now-focusTransition.start)/850,1),e=t*t*(3-2*t);
   focusRotation.identity().slerp(focusTransition.rotation,e);
   focusDirection.copy(focusTransition.from).applyQuaternion(focusRotation);
   controls.target.lerpVectors(focusTransition.fromTarget,focusTransition.target,e);camera.position.copy(controls.target).addScaledVector(focusDirection,focusTransition.distance);camera.lookAt(controls.target);
   if(t===1){focusTransition=null;controls.enabled=true;controls.autoRotate=auto&&!reduced;controls.update();}
  }else if(mode!=='walk')controls.update(dt);
  walk.update(dt);
  camera.getWorldDirection(viewDir);
  for(const {p,element} of markerEntries){
   resolvePose(worldLayout.get(p.id)!,curve,pose);const height=p.h+3;
   pos.copy(pose.position).addScaledVector(pose.normal,height);projected.copy(pos).project(camera);
   const relevant=selected===p.id||mode==='world'||mode==='plan'||featuredIds.includes(p.id);
   const facing=normal.copy(pose.normal).dot(cameraToPoint.copy(camera.position).sub(pos).normalize())>.04;
   const visible=mode!=='walk'&&showLabels&&relevant&&facing&&projected.z<1&&Math.abs(projected.x)<.96&&Math.abs(projected.y)<.88;
   element.hidden=!visible;if(visible){element.style.transform='translate('+((projected.x*.5+.5)*host.clientWidth)+'px,'+((-projected.y*.5+.5)*host.clientHeight)+'px) translate(-50%,-100%)';element.classList.toggle('selected',selected===p.id);element.classList.toggle('compact',mode==='plan');}
  }
  renderer.render(scene,mode==='walk'&&!transition?walk.camera:camera);
 }
 raf=requestAnimationFrame(animate);options.onReady();
 return{walk,setMode,setSelected(id:string|null){selected=id;updateHighlight();if(id)focusPlace(id);markerEntries.forEach(({p,element})=>element.setAttribute('aria-pressed',String(id===p.id)));},setLabels(value:boolean){showLabels=value;},zoom,reset(){if(mode==='walk')walk.reset();else setMode(mode);},setOrbit(value:boolean){auto=value;controls.autoRotate=value&&!reduced&&mode!=='plan'&&mode!=='walk';},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();walk.dispose();schoolCrest.dispose();signTextures.forEach(t=>t.dispose());worldContext.dispose();campusMaterials.forEach(m=>m.dispose());highlight.material.dispose();scene.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose();if(o instanceof T.Mesh){o.geometry.dispose();if(o.material instanceof T.MeshBasicMaterial)o.material.dispose();}});renderer.dispose();renderer.domElement.remove();labels.remove();}};
}
