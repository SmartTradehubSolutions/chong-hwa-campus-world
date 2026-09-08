import type{Vector3,Quaternion}from'three';
export const WORLD_RADIUS:number;
export type WorldAnchor={flat:Vector3;world:Vector3;normal:Vector3;rotation:Quaternion};
export type WorldPose={position:Vector3;rotation:Quaternion;normal:Vector3};
export function sphereNormal(index:number,count:number,phase?:number):Vector3;
export function makeAnchor(x:number,z:number,normal:Vector3):WorldAnchor;
export function createWorldLayout(places:{id:string;x:number;z:number}[]):Map<string,WorldAnchor>;
export function resolvePose(anchor:WorldAnchor,curve:number,out?:WorldPose):WorldPose;
