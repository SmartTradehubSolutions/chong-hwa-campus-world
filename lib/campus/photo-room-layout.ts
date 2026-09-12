export type PhotoObject={label:string;x:number;y:number;z:number;w:number;h:number;d:number;solid?:boolean};
export type PhotoRoom={
 image:string;title:string;source:string;cameraHeight:number;yaw?:number;
 bounds:{minX:number;maxX:number;minZ:number;maxZ:number;height:number};
 ceiling?:{ridgeHeight:number;axis:'x'|'z'};
 objects:PhotoObject[];notes:string[];walkRadius:number;
};
