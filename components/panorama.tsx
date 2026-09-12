'use client';
import{useEffect,useRef,useState}from'react';
import{Move,LoaderCircle}from'lucide-react';
export default function Panorama({image,name}:{image:string;name:string}){
 const host=useRef<HTMLDivElement>(null);const[status,setStatus]=useState('loading');
 useEffect(()=>{let cancelled=false,cleanup=()=>{};setStatus('loading');
 import('three').then(T=>{if(cancelled||!host.current)return;const el=host.current;
 let renderer:import('three').WebGLRenderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch{setStatus('error');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));el.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(72,1,.1,100),geometry=new T.SphereGeometry(20,64,40);geometry.scale(-1,1,1);
 const material=new T.MeshBasicMaterial({color:'#ffffff'}),mesh=new T.Mesh(geometry,material);scene.add(mesh);
 let texture:import('three').Texture|undefined,raf=0,yaw=0,pitch=0,drag=false,last={x:0,y:0};
 new T.TextureLoader().load('/media/'+image,t=>{if(cancelled){t.dispose();return;}texture=t;t.colorSpace=T.SRGBColorSpace;material.map=t;material.needsUpdate=true;setStatus('ready');},undefined,()=>!cancelled&&setStatus('error'));
 const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(el);resize();
 const down=(e:PointerEvent)=>{drag=true;last={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent)=>{if(!drag)return;yaw-=(e.clientX-last.x)*.004;pitch=Math.max(-1.35,Math.min(1.35,pitch+(e.clientY-last.y)*.004));last={x:e.clientX,y:e.clientY};};
 const up=()=>{drag=false;};const wheel=(e:WheelEvent)=>{e.preventDefault();camera.fov=Math.max(35,Math.min(95,camera.fov+e.deltaY*.035));camera.updateProjectionMatrix();};
 const key=(e:KeyboardEvent)=>{if(e.key.startsWith('Arrow'))e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=Math.min(1.35,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-1.35,pitch-.1);};
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label',name+' panorama. Drag or use arrow keys to look around.');
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('wheel',wheel,{passive:false});renderer.domElement.addEventListener('keydown',key);
 const render=()=>{raf=requestAnimationFrame(render);camera.lookAt(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));renderer.render(scene,camera);};render();
 cleanup=()=>{cancelAnimationFrame(raf);observer.disconnect();texture?.dispose();geometry.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 }).catch(()=>!cancelled&&setStatus('error'));return()=>{cancelled=true;cleanup();};
 },[image,name]);
 return <div className="panorama-wrap"><div ref={host} className="panorama-canvas"/>{status==='loading'&&<div className="panorama-status"><LoaderCircle className="loading-spin"/> Opening your view…</div>}{status==='error'&&<div className="panorama-status">This panorama couldn’t load. <a href={'/media/'+image} target="_blank" rel="noreferrer">Open the photo</a></div>}<p className="panorama-hint"><Move size={16}/> Drag to look around · Scroll to zoom</p></div>;
}
