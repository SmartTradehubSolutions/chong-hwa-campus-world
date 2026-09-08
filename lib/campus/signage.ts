import * as T from 'three';
import type {Place} from './data';
export function addBuildingSigns(root:T.Group,p:Place,crest:T.Texture){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;
 const c=canvas.getContext('2d');if(!c)return[];
 c.fillStyle='#e8e7dc';c.fillRect(0,0,1024,160);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#863f35';c.font='600 56px "Microsoft YaHei", sans-serif';c.fillText(p.zh.split(' · ')[0],512,53,980);c.font='27px sans-serif';c.fillStyle='#354640';c.fillText(p.name,512,115,980);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const width=p.id==='gate'?3:p.id==='pond'?4:Math.min(p.w*.6,16),height=width*160/1024;
 const sign=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:texture}));
 sign.position.set(p.id==='gate'?8.4:0,p.id==='gate'?2.72:p.id==='pond'?1.7:Math.min(p.h-1,4.3),p.id==='gate'?1.12:p.d/2+1.95);root.add(sign);
 if(p.id==='K'||p.id==='gate'){
  const size=p.id==='K'?5.4:1.2;const badge=new T.Mesh(new T.PlaneGeometry(size,size),new T.MeshBasicMaterial({map:crest,transparent:true,depthWrite:false}));
  badge.position.set(p.id==='K'?p.w/2-4:8.4,p.id==='K'?p.h-4:2,p.id==='K'?p.d/2+.68:1.15);root.add(badge);
 }
 return[texture];
}
