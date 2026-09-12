'use client';
import {Camera,ArrowUpRight,ArrowLeft} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import Panorama from '@/components/panorama';
import {places,SOURCE} from '@/lib/campus/data';
import {photoSources} from '@/lib/campus/photo-sources';
import type {CampusTour} from '@/lib/campus/visits';
export default function CampusTourDialog({tour,onChange}:{tour:CampusTour|null;onChange:(tour:CampusTour|null)=>void}){
 const place=places.find(p=>p.id===tour?.placeId);
 return <Dialog open={!!tour} onOpenChange={open=>{if(!open)onChange(null);}}>
  <DialogContent className="panorama-dialog">
   <div className="panorama-heading"><Camera size={19}/><div><DialogTitle>{tour?.name}</DialogTitle><DialogDescription>{place?.name} · Actual school 360° photograph</DialogDescription></div></div>
   {tour&&<Panorama key={tour.image} image={tour.image} name={tour.name}/>}
   <div className="tour-navigation">
    {(place?.views?.length||0)>1&&<label>Look around this building<select aria-label="Choose a 360 degree view" value={tour?.image||''} onChange={e=>{const view=place?.views?.find(v=>v.image===e.target.value);if(view&&place)onChange({...view,placeId:place.id});}}>{place?.views?.map(v=><option key={v.image} value={v.image}>{v.name}</option>)}</select></label>}
    <div className="tour-actions"><button onClick={()=>onChange(null)}><ArrowLeft size={16}/> Back to campus</button><a href={(tour&&photoSources[tour.image])||place?.source||SOURCE} target="_blank" rel="noreferrer">Official school source <ArrowUpRight size={14}/></a></div>
    <p>Real photography published by the school. Views may predate the current campus. Drag to look around; press Esc to return.</p>
   </div>
  </DialogContent>
 </Dialog>;
}
