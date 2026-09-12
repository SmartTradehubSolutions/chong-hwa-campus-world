import {libraryTraces} from './room-traces-library';
import {hallTraces} from './room-traces-hall';
import {places} from './data';
export const photoRooms=[...libraryTraces,...hallTraces];
export function photoRoomFor(image:string){return photoRooms.find(r=>r.image===image)||null;}
export function firstPhotoRoom(placeId:string){const p=places.find(p=>p.id===placeId);return p?.views?.map(v=>photoRoomFor(v.image)).find(Boolean)||null;}
