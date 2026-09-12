'use client';
import {useState} from 'react';
import {DoorOpen,Camera,ArrowLeft,ArrowUpRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import InteriorView from './interior-view';
import Panorama from './panorama';
import {interiorFor} from '@/lib/campus/interior-layout';
import {SOURCE,type Place} from '@/lib/campus/data';

export default function BuildingVisitDialog({place,onClose}:{place:Place;onClose:()=>void}){
 const [view,setView]=useState<'choice'|'3d'|'panorama'|'photo'>('choice');
 const [image,setImage]=useState(place.views?.[0]?.image||'');
 const room=interiorFor(place.id),real=place.views?.find(v=>v.image===image);
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}>
  <DialogContent className={'visit-dialog '+(view==='choice'?'visit-choice-dialog':'visit-viewer-dialog')}>
   <div className="visit-heading"><DialogTitle>{place.name}</DialogTitle><DialogDescription>{view==='3d'?'Walkable 3D reconstruction · Approximate room and furniture':view==='panorama'?'Actual school 360° photograph':view==='photo'?'Actual school photograph · Not a 360° view':'Choose how you would like to explore.'}</DialogDescription></div>
   {view==='choice'?<div className="visit-options">
    <button onClick={()=>room?setView('3d'):onClose()}><DoorOpen size={26}/><span><strong>{room?'Explore in 3D':'Explore the outdoor 3D view'}</strong><span>{room?'Enter a reconstructed room. Walk around and look freely.':'Continue exploring this outdoor landmark in the campus model.'}</span></span></button>
    <button disabled={!place.views?.length} onClick={()=>setView('panorama')}><Camera size={26}/><span><strong>Real school panorama</strong><span>{place.views?.length?place.views.length+' actual 360° '+(place.views.length===1?'photograph':'photographs')+' published by the school.':'No verified 360° photograph is mapped to this building yet.'}</span></span></button>
    {place.id==='L'&&<button onClick={()=>setView('photo')}><Camera size={24}/><span><strong>View the arena photograph</strong><span>The official source provides a regular photo of the courts.</span></span></button>}
    <p>3D rooms are illustrative reconstructions, not scans or verified floor plans. Real panoramas show the school as photographed.</p>
   </div>:<>
    <nav className="visit-switcher" aria-label="Explore mode">
     {room&&<button aria-pressed={view==='3d'} onClick={()=>setView('3d')}>Explore in 3D</button>}
     {!!place.views?.length&&<button aria-pressed={view==='panorama'} onClick={()=>setView('panorama')}>Real school panorama</button>}
     <button onClick={()=>setView('choice')}>Visit options</button>
    </nav>
    {view==='3d'&&<InteriorView key={place.id} placeId={place.id}/>}
    {view==='panorama'&&real&&<Panorama key={real.image} image={real.image} name={real.name}/>}
    {view==='photo'&&<div className="visit-photo"><img src="/media/arena-photo.jpg" alt="Official photograph of the Chong Hwa arena courts"/></div>}
    {view==='panorama'&&!!place.views?.length&&<label className="visit-photo-picker">View<select aria-label="Choose a real school panorama" value={image} onChange={e=>setImage(e.target.value)}>{place.views.map(v=><option key={v.image} value={v.image}>{v.name}</option>)}</select></label>}
   </>}
   <div className="visit-footer"><button onClick={onClose}><ArrowLeft size={16}/> Back to campus</button><a href={place.source||SOURCE} target="_blank" rel="noreferrer">School source <ArrowUpRight size={14}/></a></div>
  </DialogContent>
 </Dialog>;
}
