export const SPAWN={x:37,z:73};
export const HOOP={x:-58,y:3.05,z:14};
export const entrances=[
 {id:'gate',x:37,z:69},{id:'K',x:9,z:64},{id:'A',x:55,z:42},{id:'L',x:-24,z:-33},
 {id:'D',x:50,z:-10},{id:'I',x:-84,z:35},{id:'J',x:-31,z:47},{id:'G',x:-50,z:-10},
 {id:'H',x:-21,z:17},{id:'F',x:-3,z:-5},{id:'E',x:22,z:-5},{id:'B',x:67,z:0},
 {id:'C',x:80,z:-35},{id:'pond',x:6,z:26},{id:'court',x:-56,z:26}
];
export function buildObstacles(places){return places.flatMap(p=>p.id==='gate'?[...[-6,6].map(dx=>({x:p.x+dx,z:p.z,w:1.4,d:2,h:4})),{x:p.x+8.4,z:p.z-.5,w:3.4,d:3.4,h:3.1}]:p.id==='pond'?[{x:p.x,z:p.z,w:17,d:12,h:1}]:[{x:p.x,z:p.z,w:p.w+1,d:p.d+1,h:p.h+3}]);}
export function isFree(p,obstacles,radius=.48){
 if(p.x < -95+radius||p.x>95-radius||p.z < -86+radius||p.z>86-radius)return false;
 return !obstacles.some(o=>Math.abs(p.x-o.x)<o.w/2+radius&&Math.abs(p.z-o.z)<o.d/2+radius);
}
export function moveStudent(position,x,forward,yaw,distance,obstacles){
 const magnitude=Math.hypot(x,forward);if(!magnitude)return {...position};
 const scale=Math.min(magnitude,1)/magnitude;
 const dx=(Math.cos(yaw)*x-Math.sin(yaw)*forward)*scale*distance;
 const dz=(-Math.sin(yaw)*x-Math.cos(yaw)*forward)*scale*distance;
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.2)),p={...position};
 for(let i=0;i<count;i++){const nx={x:p.x+dx/count,z:p.z};if(isFree(nx,obstacles))p.x=nx.x;const nz={x:p.x,z:p.z+dz/count};if(isFree(nz,obstacles))p.z=nz.z;}
 return p;
}
export function nearestEntrance(position,radius=5){let best=null,distance=radius;for(const e of entrances){const d=Math.hypot(e.x-position.x,e.z-position.z);if(d<distance){best=e;distance=d;}}return best;}
export function createShot(origin,aim,power){
 const time=1.15,gravity=18,distance=origin.z-HOOP.z;
 return{origin:{...origin},velocity:{x:Math.sin(aim)*distance/time,y:(HOOP.y-origin.y+.5*gravity*time*time)/time,z:-distance/time*(.62+power*.5846153846153846)},gravity};
}
export function shotAt(shot,t){return{x:shot.origin.x+shot.velocity.x*t,y:shot.origin.y+shot.velocity.y*t-shot.gravity*t*t/2,z:shot.origin.z+shot.velocity.z*t};}
export function shotScores(shot){
 const disc=shot.velocity.y**2-2*shot.gravity*(HOOP.y-shot.origin.y);if(disc<0)return false;
 const time=(shot.velocity.y+Math.sqrt(disc))/shot.gravity,p=shotAt(shot,time);
 return Math.hypot(p.x-HOOP.x,p.z-HOOP.z)<.43;
}
