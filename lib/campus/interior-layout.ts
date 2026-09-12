import {places} from './data';
export type Furniture={kind:'desk'|'shelf'|'table'|'bed'|'stage'|'bench';x:number;z:number;w:number;d:number;solid:boolean};
export type Interior={id:string;name:string;kind:string;width:number;depth:number;height:number;spawn:{x:number;z:number};furniture:Furniture[]};
export function interiorFor(id:string):Interior|null{
 const place=places.find(p=>p.id===id);if(!place||['gate','pond'].includes(id))return null;
 const kind=id==='K'?'library':id==='A'?'hall':id==='L'?'arena':['B'].includes(id)?'canteen':['G','H'].includes(id)?'hostel':id==='F'?'office':'classroom';
 const width=kind==='arena'?22:kind==='hall'?18:16,depth=['hall','arena'].includes(kind)?26:20,height=['hall','arena'].includes(kind)?7:3.8;
 const furniture:Furniture[]=[];
 const add=(kind:Furniture['kind'],x:number,z:number,w:number,d:number)=>furniture.push({kind,x,z,w,d,solid:true});
 if(kind==='library'){
  for(const x of [-6,6])for(const z of [-6,0,5])add('shelf',x,z,1.1,3);
  for(const x of [-3.2,3.2])for(const z of [-5,1])add('table',x,z,2.2,1.4);
 }else if(kind==='hall'){
  add('stage',0,-10,14,4);
  for(const x of [-5,-3,3,5])for(let z=-5;z<7;z+=2) add('bench',x,z,1.35,.65);
 }else if(kind==='arena'){
  for(const x of [-9.4,9.4])for(const z of [-6,0,6])add('bench',x,z,.8,4);
 }else if(kind==='hostel'){
  for(const x of [-5.3,5.3])for(const z of [-5,0,5])add('bed',x,z,2.2,3.3);
 }else{
  for(const x of [-4.7,-2.5,2.5,4.7])for(const z of [-5,-1,3])add(kind==='canteen'?'table':'desk',x,z,kind==='canteen'?1.7:1.4,1);
 }
 return{id,name:kind==='library'?'Library reconstruction':kind.charAt(0).toUpperCase()+kind.slice(1)+' reconstruction',kind,width,depth,height,spawn:{x:0,z:depth/2-1.6},furniture};
}
export function insideFree(room:Interior,p:{x:number;z:number},radius=.28){
 if(Math.abs(p.x)>room.width/2-radius-.15||Math.abs(p.z)>room.depth/2-radius-.15)return false;
 return !room.furniture.some(f=>f.solid&&Math.abs(p.x-f.x)<f.w/2+radius&&Math.abs(p.z-f.z)<f.d/2+radius);
}
export function moveInside(room:Interior,start:{x:number;z:number},dx:number,dz:number){
 const p={...start},steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
 for(let i=0;i<steps;i++){const x={x:p.x+dx/steps,z:p.z};if(insideFree(room,x))p.x=x.x;const z={x:p.x,z:p.z+dz/steps};if(insideFree(room,z))p.z=z.z;}
 return p;
}
