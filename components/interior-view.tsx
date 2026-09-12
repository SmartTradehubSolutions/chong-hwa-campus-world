'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,ArrowLeft,ArrowRight,RotateCcw} from 'lucide-react';
import type {createInterior} from '@/lib/campus/interior-scene';
export default function InteriorView({placeId}:{placeId:string}){
 const host=useRef<HTMLDivElement>(null),api=useRef<ReturnType<typeof createInterior>|null>(null);
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 useEffect(()=>{let cancelled=false;import('@/lib/campus/interior-scene').then(({createInterior})=>{
  if(cancelled||!host.current)return;try{api.current=createInterior(host.current,placeId,()=>setStatus('ready'));}catch{setStatus('error');}
 }).catch(()=>{if(!cancelled)setStatus('error');});return()=>{cancelled=true;api.current?.dispose();api.current=null;};},[placeId]);
 const stop=()=>api.current?.input(0,0);
 return <div className="interior-wrap"><div ref={host} className="interior-canvas"/>
  {status!=='ready'&&<div className="interior-status" role="status">{status==='error'?'The 3D room could not start on this device. Try a real panorama instead.':'Opening the reconstructed room…'}</div>}
  {status==='ready'&&<><div className="interior-help">WASD / arrows to walk · Drag to look</div><button className="interior-reset" onClick={()=>api.current?.reset()}><RotateCcw size={15}/> Return to doorway</button><div className="interior-dpad" aria-label="Interior touch controls">
   {[{label:'forward',x:0,z:-1,Icon:ArrowUp},{label:'left',x:-1,z:0,Icon:ArrowLeft},{label:'back',x:0,z:1,Icon:ArrowDown},{label:'right',x:1,z:0,Icon:ArrowRight}].map(({label,x,z,Icon})=><button key={label} aria-label={'Walk '+label+' inside'} className={'interior-'+label} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);api.current?.input(x,z);}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><Icon size={20}/></button>)}
  </div></>}
 </div>;
}
