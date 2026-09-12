'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,ArrowLeft,ArrowRight,RotateCcw} from 'lucide-react';
import type {createPhotoRoom} from '@/lib/campus/photo-room-scene';
import type {PhotoRoom} from '@/lib/campus/photo-room-layout';
export default function PhotoRoomView({room}:{room:PhotoRoom}){
 const host=useRef<HTMLDivElement>(null),api=useRef<ReturnType<typeof createPhotoRoom>|null>(null);
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 useEffect(()=>{let cancelled=false;import('@/lib/campus/photo-room-scene').then(({createPhotoRoom})=>{
  if(cancelled||!host.current)return;try{api.current=createPhotoRoom(host.current,room,()=>setStatus('ready'),()=>setStatus('error'));}catch{setStatus('error');}
 }).catch(()=>{if(!cancelled)setStatus('error');});return()=>{cancelled=true;api.current?.dispose();api.current=null;};},[room]);
 const stop=()=>api.current?.input(0,0);
 return <div className="interior-wrap"><div ref={host} className="interior-canvas"/>
  {status!=='ready'&&<div className="interior-status" role="status">{status==='error'?'The photo-matched model could not load. Use the original 360° photo.':'Opening the photo-matched model…'}</div>}
  {status==='ready'&&<><div className="interior-help">WASD / arrows · Drag to look</div><button className="interior-reset" onClick={()=>api.current?.reset()}><RotateCcw size={15}/> Return to photo position</button><div className="interior-dpad" aria-label="Interior touch controls">
   {[{label:'forward',x:0,z:-1,Icon:ArrowUp},{label:'left',x:-1,z:0,Icon:ArrowLeft},{label:'back',x:0,z:1,Icon:ArrowDown},{label:'right',x:1,z:0,Icon:ArrowRight}].map(({label,x,z,Icon})=><button key={label} aria-label={'Walk '+label+' inside'} className={'interior-'+label} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);api.current?.input(x,z);}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><Icon size={20}/></button>)}
  </div></>}
 </div>;
}
