import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
/** Bake static meshes by material; root identity and animated child groups remain intact. */
export function batchMeshes(root:T.Group,recursive=true){
 root.updateMatrixWorld(true);
 const inverse=root.matrixWorld.clone().invert(),batches=new Map<T.Material,{parts:T.BufferGeometry[];objects:T.Mesh[]}>();
 const collect=(o:T.Object3D)=>{if(!(o instanceof T.Mesh)||o instanceof T.InstancedMesh||Array.isArray(o.material))return;
  const geometry=o.geometry.clone();geometry.applyMatrix4(inverse.clone().multiply(o.matrixWorld));
  // Non-indexed geometry accepts roofs, boxes and circular details in one batch.
  const part=geometry.index?geometry.toNonIndexed():geometry;if(part!==geometry)geometry.dispose();
  part.deleteAttribute('uv1');part.deleteAttribute('tangent');
  if(!part.attributes.uv)part.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(part.attributes.position.count*2),2));
  const entry=batches.get(o.material)||{parts:[],objects:[]};entry.parts.push(part);entry.objects.push(o);batches.set(o.material,entry);
 };
 if(recursive)root.traverse(collect);else root.children.forEach(collect);
 for(const[mat,batch]of batches){if(batch.parts.length<2){batch.parts.forEach(g=>g.dispose());continue;}const geometry=mergeGeometries(batch.parts);batch.parts.forEach(g=>g.dispose());if(!geometry)continue;batch.objects.forEach(o=>o.removeFromParent());const mesh=new T.Mesh(geometry,mat);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}
}
