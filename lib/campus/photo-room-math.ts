import type {PhotoRoom} from './photo-room-layout';
export function photoUV(d:{x:number;y:number;z:number}){
 const len=Math.hypot(d.x,d.y,d.z)||1;
 return {u:((Math.atan2(d.x,-d.z)/(Math.PI*2)+.5)%1+1)%1,v:Math.asin(Math.max(-1,Math.min(1,d.y/len)))/Math.PI+.5};
}
export function photoPositionFree(room:PhotoRoom,p:{x:number;z:number},radius=.2){
 if(Math.hypot(p.x,p.z)>room.walkRadius)return false;
 const yaw=room.yaw||0,x=p.x*Math.cos(yaw)-p.z*Math.sin(yaw),z=p.x*Math.sin(yaw)+p.z*Math.cos(yaw),b=room.bounds;
 if(x<b.minX+radius||x>b.maxX-radius||z<b.minZ+radius||z>b.maxZ-radius)return false;
 return !room.objects.some(o=>o.solid!==false&&o.y-o.h/2<1.8&&o.y+o.h/2>.2&&Math.abs(x-o.x)<o.w/2+radius&&Math.abs(z-o.z)<o.d/2+radius);
}
export function moveInPhotoRoom(room:PhotoRoom,start:{x:number;z:number},dx:number,dz:number){
 const p={...start},steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.05));
 for(let i=0;i<steps;i++){const a={x:p.x+dx/steps,z:p.z};if(photoPositionFree(room,a))p.x=a.x;const b={x:p.x,z:p.z+dz/steps};if(photoPositionFree(room,b))p.z=b.z;}
 return p;
}
