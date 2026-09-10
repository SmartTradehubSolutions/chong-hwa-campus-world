import {places,type Place} from './data';
export type CampusTour={name:string;image:string;placeId:string};
export type Visit=
 |{kind:'panorama';place:Place;view:CampusTour}
 |{kind:'photo';place:Place;image:string}
 |{kind:'information';place:Place};
export function resolveVisit(id:string):Visit|null{
 const place=places.find(p=>p.id===id);if(!place)return null;
 const first=place.views?.[0];
 if(first)return{kind:'panorama',place,view:{...first,placeId:place.id}};
 if(place.id==='L')return{kind:'photo',place,image:'arena-photo.jpg'};
 return{kind:'information',place};
}
