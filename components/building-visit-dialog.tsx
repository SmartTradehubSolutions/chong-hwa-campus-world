'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import Panorama from './panorama';
import {photoSources} from '@/lib/campus/photo-sources';
import {SOURCE,type Place} from '@/lib/campus/data';

export default function BuildingVisitDialog({place,onClose}:{place:Place;onClose:()=>void}){
 const [image,setImage]=useState(place.views?.[0]?.image||'');
 const real=place.views?.find(v=>v.image===image);
 const hasView=!!real||place.id==='L';
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}>
  <DialogContent className={'visit-dialog '+(hasView?'visit-viewer-dialog':'visit-choice-dialog')}>
   <div className="visit-heading"><DialogTitle>{real?.name||place.name}</DialogTitle><DialogDescription>{place.name}{real?' · Original school 360° photograph':place.id==='L'?' · Official photograph':' · Interior reference unavailable'}</DialogDescription></div>
   {real?<>
    <Panorama key={real.image} image={real.image} name={real.name}/>
    <div className="visit-photo-picker"><label htmlFor="visit-photo-select">Photographed location</label><select id="visit-photo-select" aria-label="Choose a real school panorama" value={image} onChange={e=>setImage(e.target.value)}>{place.views?.map(v=><option key={v.image} value={v.image}>{v.name}</option>)}</select></div>
   </>:place.id==='L'?<><div className="visit-photo"><img src="/media/arena-photo.jpg" alt="Official photograph of the Chong Hwa arena courts"/></div><p className="visit-photo-note">This is a regular photograph from the school.</p></>:<div className="visit-unavailable"><p>No verified interior panorama is mapped to this building yet.</p><p>{place.description}</p></div>}
   <div className="visit-footer"><button onClick={onClose}><ArrowLeft size={16}/> Back to campus</button><a href={photoSources[image]||place.source||SOURCE} target="_blank" rel="noreferrer">School source <ArrowUpRight size={14}/></a></div>
  </DialogContent>
 </Dialog>;
}
