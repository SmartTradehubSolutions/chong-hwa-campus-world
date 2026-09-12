'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import PhotoRoomView from './photo-room-view';
import Panorama from './panorama';
import {photoRoomFor,firstPhotoRoom} from '@/lib/campus/photo-rooms';
import {photoSources} from '@/lib/campus/photo-sources';
import {SOURCE,type Place} from '@/lib/campus/data';

export default function BuildingVisitDialog({place,onClose}:{place:Place;onClose:()=>void}){
 const first=firstPhotoRoom(place.id);
 const [image,setImage]=useState(first?.image||place.views?.[0]?.image||'');
 const [walk,setWalk]=useState(!!first);
 const real=place.views?.find(v=>v.image===image),room=photoRoomFor(image),is3D=walk&&!!room;
 const hasView=!!real||place.id==='L';
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}>
  <DialogContent className={'visit-dialog '+(hasView?'visit-viewer-dialog':'visit-choice-dialog')}>
   <div className="visit-heading"><DialogTitle>{real?.name||place.name}</DialogTitle><DialogDescription>{place.name}{real?(is3D?' · 3D model built from this school photograph':' · Original school 360° photograph'):place.id==='L'?' · Official photograph':' · Interior reference unavailable'}</DialogDescription></div>
   {real?<>
    <nav className="visit-switcher" aria-label="Explore mode">
     <button disabled={!room} aria-pressed={is3D} onClick={()=>setWalk(true)}>{room?'Photo-matched 3D':'3D model not yet traced'}</button>
     <button aria-pressed={!is3D} onClick={()=>setWalk(false)}>Original 360° photo</button>
    </nav>
    {is3D&&room?<PhotoRoomView key={room.image} room={room}/>:<Panorama key={real.image} image={real.image} name={real.name}/>}
    <div className="visit-photo-picker"><label htmlFor="visit-photo-select">Photographed location</label><select id="visit-photo-select" aria-label="Choose a real school panorama" value={image} onChange={e=>{setImage(e.target.value);setWalk(!!photoRoomFor(e.target.value));}}>{place.views?.map(v=><option key={v.image} value={v.image}>{v.name}{photoRoomFor(v.image)?' · 3D + 360°':' · 360°'}</option>)}</select></div>
    <p className="photo-model-note">{is3D?'Walls and visible furniture are traced from this panorama. Depth is estimated; movement stays near the photo position to limit distortion.':'Look around from the original camera position. Choose another photographed location to move between views.'}</p>
   </>:place.id==='L'?<><div className="visit-photo"><img src="/media/arena-photo.jpg" alt="Official photograph of the Chong Hwa arena courts"/></div><p className="photo-model-note">The school source provides this regular photograph. A panorama-based walkable model is not available here.</p></>:<div className="visit-unavailable"><p>No verified interior panorama is mapped to this building yet.</p><p>{place.description}</p></div>}
   <div className="visit-footer"><button onClick={onClose}><ArrowLeft size={16}/> Back to campus</button><a href={photoSources[image]||place.source||SOURCE} target="_blank" rel="noreferrer">School source <ArrowUpRight size={14}/></a></div>
  </DialogContent>
 </Dialog>;
}
