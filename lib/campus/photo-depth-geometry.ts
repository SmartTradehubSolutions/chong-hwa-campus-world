import * as T from 'three';
import type {PhotoRoom} from './photo-room-layout';

const EPS = 1e-8;
const COLUMNS = 512;
const ROWS = 256;

/** Distance to the first positive intersection with a box, from the capture point. */
function boxHit(dx:number,dy:number,dz:number,boxes:Float64Array,offset:number){
  let near=-Infinity,far=Infinity;
  for(let axis=0;axis<3;axis++){
    const direction=axis===0?dx:axis===1?dy:dz;
    const low=boxes[offset+axis*2],high=boxes[offset+axis*2+1];
    if(Math.abs(direction)<EPS){
      if(low>0||high<0)return Infinity;
      continue;
    }
    let a=low/direction,b=high/direction;
    if(a>b){const swap=a;a=b;b=swap;}
    if(a>near)near=a;
    if(b<far)far=b;
    if(near>far||far<=EPS)return Infinity;
  }
  return near>EPS?near:far>EPS?far:Infinity;
}

/**
 * Intersect the closed traced shell. The gable consists of two roof planes;
 * wall hits are clipped against that roof profile, including the end triangles.
 */
function gableHit(dx:number,dy:number,dz:number,room:PhotoRoom){
  const b=room.bounds,roof=room.ceiling!;
  const ridge=Math.max(b.height,roof.ridgeHeight);
  const acrossX=roof.axis==='z';
  const low=acrossX?b.minX:b.minZ,high=acrossX?b.maxX:b.maxZ;
  const mid=(low+high)*.5,half=(high-low)*.5;
  const rise=ridge-b.height,slope=rise/half;
  const cameraY=room.cameraHeight;
  let nearest=Infinity;

  // Four vertical wall planes. Roof height varies only across the ridge.
  for(let side=0;side<4;side++){
    const xWall=side<2;
    const direction=xWall?dx:dz;
    if(Math.abs(direction)<EPS)continue;
    const boundary=side===0?b.minX:side===1?b.maxX:side===2?b.minZ:b.maxZ;
    const t=boundary/direction;
    if(t<=EPS||t>=nearest)continue;
    const x=dx*t,z=dz*t,y=cameraY+dy*t;
    if(x<b.minX-EPS||x>b.maxX+EPS||z<b.minZ-EPS||z>b.maxZ+EPS)continue;
    const cross=acrossX?x:z;
    const top=b.height+rise*(1-Math.abs(cross-mid)/half);
    if(y>=-EPS&&y<=top+EPS)nearest=t;
  }

  // Floor.
  if(dy<-EPS){
    const t=-cameraY/dy,x=dx*t,z=dz*t;
    if(t>EPS&&t<nearest&&x>=b.minX-EPS&&x<=b.maxX+EPS&&z>=b.minZ-EPS&&z<=b.maxZ+EPS)nearest=t;
  }

  // Each half of the gable is y = intercept + gradient * cross.
  for(let side=0;side<2;side++){
    const gradient=side===0?slope:-slope;
    const intercept=side===0?b.height-slope*low:b.height+slope*high;
    const denominator=dy-gradient*(acrossX?dx:dz);
    if(Math.abs(denominator)<EPS)continue;
    const t=(intercept-cameraY)/denominator;
    if(t<=EPS||t>=nearest)continue;
    const x=dx*t,z=dz*t,cross=acrossX?x:z;
    if(x<b.minX-EPS||x>b.maxX+EPS||z<b.minZ-EPS||z>b.maxZ+EPS)continue;
    if(side===0?cross<=mid+EPS:cross>=mid-EPS)nearest=t;
  }
  return nearest;
}

/**
 * A single surface containing only geometry visible from the source camera.
 *
 * Every equirectangular sample is placed at the nearest intersection with the
 * actual trace. Neighbours remain connected at depth discontinuities: unseen
 * areas stretch slightly as the viewer moves, instead of revealing a second
 * copy of photographed furniture on a wall or floor behind it.
 *
 * Returned positions are WORLD SPACE. room.yaw is already included by inverse
 * rotating each ray for local trace intersection. Add to an unrotated parent.
 */
export function photoDepthGeometry(room:PhotoRoom):T.BufferGeometry{
  const b=room.bounds;
  const objects=room.objects;
  // Box coordinates are relative to (0, cameraHeight, 0), avoiding allocations.
  const boxes=new Float64Array((objects.length+1)*6);
  boxes.set([b.minX,b.maxX,-room.cameraHeight,b.height-room.cameraHeight,b.minZ,b.maxZ]);
  for(let i=0;i<objects.length;i++){
    const o=objects[i],offset=(i+1)*6;
    boxes.set([
      o.x-o.w*.5,o.x+o.w*.5,
      o.y-o.h*.5-room.cameraHeight,o.y+o.h*.5-room.cameraHeight,
      o.z-o.d*.5,o.z+o.d*.5
    ],offset);
  }

  const stride=COLUMNS+1,count=stride*(ROWS+1);
  const positions=new Float32Array(count*3);
  const uvs=new Float32Array(count*2);
  const yaw=room.yaw||0,cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw);
  const sinLongitude=new Float64Array(stride),cosLongitude=new Float64Array(stride);
  for(let x=0;x<=COLUMNS;x++){
    const longitude=(x/COLUMNS-.5)*Math.PI*2;
    sinLongitude[x]=x===0||x===COLUMNS?0:Math.sin(longitude);
    cosLongitude[x]=Math.cos(longitude);
  }

  for(let y=0;y<=ROWS;y++){
    const polar=y/ROWS*Math.PI;
    const horizontal=y===0||y===ROWS?0:Math.sin(polar);
    const dy=Math.cos(polar);
    for(let x=0;x<=COLUMNS;x++){
      const dx=sinLongitude[x]*horizontal,dz=-cosLongitude[x]*horizontal;
      const localX=dx*cosYaw-dz*sinYaw,localZ=dx*sinYaw+dz*cosYaw;
      let distance=room.ceiling
        ?gableHit(localX,dy,localZ,room)
        :boxHit(localX,dy,localZ,boxes,0);
      for(let i=1;i<=objects.length;i++){
        const hit=boxHit(localX,dy,localZ,boxes,i*6);
        if(hit<distance)distance=hit;
      }
      // An invalid shell is a trace error, never a reason to invent a depth.
      if(!Number.isFinite(distance)||distance<=EPS){
        throw new Error('No visible traced surface for panorama '+room.image+' at sample '+x+','+y);
      }
      const vertex=y*stride+x,at=vertex*3;
      positions[at]=dx*distance;
      positions[at+1]=room.cameraHeight+dy*distance;
      positions[at+2]=dz*distance;
      uvs[vertex*2]=x/COLUMNS;
      uvs[vertex*2+1]=1-y/ROWS;
    }
  }

  // As with a sphere, omit one degenerate triangle in each polar grid cell.
  const indices=new Uint32Array(COLUMNS*(ROWS-1)*6);
  let at=0;
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLUMNS;x++){
      const a=y*stride+x,b=a+1,c=a+stride,d=c+1;
      if(y>0){indices[at++]=a;indices[at++]=c;indices[at++]=b;}
      if(y<ROWS-1){indices[at++]=b;indices[at++]=c;indices[at++]=d;}
    }
  }

  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.BufferAttribute(uvs,2));
  geometry.setIndex(new T.BufferAttribute(indices,1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData={
    sourceImage:room.image,
    projection:'capture-visible-depth',
    sampleColumns:COLUMNS,
    sampleRows:ROWS,
    cameraHeight:room.cameraHeight,
    worldSpace:true
  };
  return geometry;
}
