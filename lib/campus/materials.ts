import * as T from 'three';

type Family = 'brick'|'concrete'|'asphalt'|'grass'|'roof'|'bark'|'pavers';
const tileMetres:Record<Family,number>={brick:2.4,concrete:3,asphalt:3,grass:4,roof:2.5,bark:1.8,pavers:3};
const families:Record<string,Family>={};
function assign(kind:Family,colors:string[]){colors.forEach(color=>families[color]=kind);}
assign('brick',['#a9705a','#a46c54','#a66d53','#ad7968','#b96950','#a87a61']);
assign('roof',['#787d79','#7b8178','#a6b29e']);
assign('asphalt',['#8f9c96','#889a8b','#81917e','#889e91']);
assign('grass',['#99b88b','#bac7a8','#7caa79','#487958','#5b8c62','#72996a','#4c8058','#689668','#80a471','#91af82']);
assign('bark',['#8c7960','#847359']);
assign('pavers',['#d8d4bf','#f0e8d6','#eee5d0','#dedac9','#e7e0c9','#cfc2a8','#c8c9ba','#dbc66a','#c7b79b','#cbb690','#d7d0b9','#d9d5bf','#d5d5b4','#d7dcc0']);
assign('concrete',['#e1e3df','#e9eae5','#e7e8e1','#ecece6','#dddcd2','#deddd1','#d1d5d0','#e2e4dd','#e6ddc9','#e5dcc4','#deded6','#e5e2d5','#d0d3c7','#dedfd8','#b1b8a5','#e9ddbd','#719c8f','#559ebc','#ce8b60','#b55e4f','#347c5a']);
const glass=new Set(['#354f50','#536963','#40514d','#739293','#68948f']);
const recess=new Set(['#435552','#4c605e']);
const metals=new Set(['#303a38','#798378','#3d6174','#2c5784']);
const textures=new Map<string,T.Texture>(),materials=new Map<string,T.MeshStandardMaterial>();
let anisotropy=4;
export function configureTextures(value:number){anisotropy=Math.min(8,value);textures.forEach(t=>{t.anisotropy=anisotropy;t.needsUpdate=true;});}
function texture(family:Family,map:string){
 const key=family+'/'+map;
 if(!textures.has(key)){
  const src='/textures/'+family+'/'+map+'.jpg';
  // Placeholder textures keep geometry tests independent of a browser.
  const t=typeof document!=='undefined'&&typeof document.createElementNS==='function'?new T.TextureLoader().load(src):new T.Texture();
  t.name=src;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.setScalar(1/tileMetres[family]);t.anisotropy=anisotropy;
  if(map==='Diffuse')t.colorSpace=T.SRGBColorSpace;
  textures.set(key,t);
 }
 return textures.get(key)!;
}
export function surfaceMaterial(color:string,override?:Family){
 const family=override||families[color],key=color+':'+(family||'plain');
 if(materials.has(key))return materials.get(key)!;
 let m:T.MeshStandardMaterial;
 if(glass.has(color)&&!override){
  m=new T.MeshPhysicalMaterial({color:'#536b70',roughness:.19,metalness:.25,clearcoat:.9,clearcoatRoughness:.16,envMapIntensity:1.4});
 }else if(color==='#79a697'){
  m=new T.MeshPhysicalMaterial({color:'#497d70',roughness:.16,metalness:.3,clearcoat:1,envMapIntensity:1.5,normalMap:texture('asphalt','nor_gl'),normalScale:new T.Vector2(.09,.09)});
 }else{
  m=new T.MeshStandardMaterial({color,roughness:metals.has(color)?.46:.88,metalness:metals.has(color)?.55:0});
  if(family){
   m.map=texture(family,'Diffuse');m.normalMap=texture(family,'nor_gl');m.roughnessMap=texture(family,'Rough');
   m.normalScale.setScalar(family==='concrete'?.28:family==='grass'?.4:.6);
   if(['brick','roof','bark','asphalt','pavers'].includes(family))m.color.set(family==='brick'?'#e7dbd1':family==='roof'?'#929b9a':'#ebe9e3');
   if(family==='grass')m.color.set(['#487958','#5b8c62','#72996a','#4c8058','#689668','#80a471'].includes(color)?'#78aa68':'#a9ca93');
  }
  if(recess.has(color)){m.color.set('#303b3a');m.roughness=1;}
 }
 m.name=family?'campus-'+family:'campus-finish';m.userData.surfaceFamily=family||'finish';materials.set(key,m);return m;
}
/** Project physical dimensions onto each face before geometry is batched. */
export function metricUV(geometry:T.BufferGeometry,scale=new T.Vector3(1,1,1)){
 const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal'),uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i)*scale.x,y=p.getY(i)*scale.y,z=p.getZ(i)*scale.z;
  const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  if(ny>=nx&&ny>=nz){uv[i*2]=x;uv[i*2+1]=-z;}
  else if(nx>nz){uv[i*2]=z;uv[i*2+1]=y;}
  else{uv[i*2]=x;uv[i*2+1]=y;}
 }
 geometry.setAttribute('uv',new T.BufferAttribute(uv,2));return geometry;
}
export function disposeMaterials(){materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());materials.clear();textures.clear();}
