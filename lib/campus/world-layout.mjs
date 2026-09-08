import {Quaternion,Vector3} from 'three';
export const WORLD_RADIUS=110;
const UP=new Vector3(0,1,0),IDENTITY=new Quaternion(),RADIAL=new Vector3();
export function sphereNormal(index,count,phase=.5){
 const y=1-2*(index+.5)/count,angle=index*Math.PI*(3-Math.sqrt(5))+phase,r=Math.sqrt(1-y*y);
 return new Vector3(r*Math.cos(angle),y,r*Math.sin(angle));
}
export function makeAnchor(x,z,normal){
 const n=normal.clone().normalize();
 return{flat:new Vector3(x,0,z),world:n.clone().multiplyScalar(WORLD_RADIUS).add(new Vector3(0,-WORLD_RADIUS,0)),normal:n,rotation:new Quaternion().setFromUnitVectors(UP,n)};
}
export function createWorldLayout(places){
 const order=['K','D','A','L','F','J','I','B','E','C','H','G','pond','gate'];
 return new Map(places.map((p,i)=>[p.id,makeAnchor(p.x,p.z,sphereNormal(order.indexOf(p.id)<0?i:order.indexOf(p.id),places.length))]));
}
export function resolvePose(anchor,curve,out){
 const pose=out||{position:new Vector3(),rotation:new Quaternion(),normal:new Vector3()};
 pose.position.lerpVectors(anchor.flat,anchor.world,curve);
 // Keep landmarks above the shrinking planet throughout the transition.
 const bodyRadius=WORLD_RADIUS*curve**3;
 RADIAL.copy(pose.position);RADIAL.y+=bodyRadius;
 const distance=RADIAL.length();
 if(distance<bodyRadius){if(distance<1e-9)RADIAL.copy(UP);else RADIAL.divideScalar(distance);pose.position.copy(RADIAL).multiplyScalar(bodyRadius);pose.position.y-=bodyRadius;}
 pose.rotation.copy(IDENTITY).slerp(anchor.rotation,curve);
 pose.normal.copy(UP).applyQuaternion(pose.rotation);
 return pose;
}
