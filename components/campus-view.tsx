'use client';
import {useEffect,useRef} from 'react';
import type{ViewMode}from '@/lib/campus/data';
import type{createCampus}from '@/lib/campus/scene';
import type{WalkState}from '@/lib/campus/walk-controller';
export type CampusApi=ReturnType<typeof createCampus>;
type Props={mode:ViewMode;selected:string|null;labels:boolean;orbit:boolean;avatar:'boy'|'girl';paused:boolean;onSelect:(id:string)=>void;onWalkState:(state:WalkState)=>void;onWalkInteract:(id:string)=>void;onReady:()=>void;onError:(message:string)=>void;apiRef:React.RefObject<CampusApi|null>};
export default function CampusView(props:Props){
 const{mode,selected,labels,orbit,avatar,paused,apiRef}=props;
 const host=useRef<HTMLDivElement>(null),latest=useRef(props);latest.current=props;
 useEffect(()=>{let cancelled=false;import('@/lib/campus/scene').then(({createCampus})=>{if(cancelled||!host.current)return;try{
  const scene=createCampus(host.current,{onSelect:id=>latest.current.onSelect(id),onWalkState:s=>latest.current.onWalkState(s),onWalkInteract:id=>latest.current.onWalkInteract(id),onReady:()=>latest.current.onReady(),onError:m=>latest.current.onError(m)});apiRef.current=scene;
  const p=latest.current;if(p.mode!=='world')scene.setMode(p.mode);scene.setSelected(p.selected);scene.setLabels(p.labels);scene.setOrbit(p.orbit);scene.walk.setAvatar(p.avatar);scene.walk.setPaused(p.paused);
 }catch{latest.current.onError('The 3D view could not start on this device. You can still explore every place and its photos below.');}}).catch(()=>latest.current.onError('The campus could not load. Refresh the page to try again.'));
 return()=>{cancelled=true;apiRef.current?.dispose();apiRef.current=null;};},[apiRef]);
 useEffect(()=>apiRef.current?.setMode(mode),[mode,apiRef]);
 useEffect(()=>apiRef.current?.setSelected(selected),[selected,apiRef]);
 useEffect(()=>apiRef.current?.setLabels(labels),[labels,apiRef]);
 useEffect(()=>apiRef.current?.setOrbit(orbit),[orbit,apiRef]);
 useEffect(()=>apiRef.current?.walk.setAvatar(avatar),[avatar,apiRef]);
 useEffect(()=>apiRef.current?.walk.setPaused(paused),[paused,apiRef]);
 return <div ref={host} className="campus-canvas" data-testid="campus-canvas"/>;
}
