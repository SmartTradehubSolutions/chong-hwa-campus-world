import * as T from 'three';
import {box,material} from './primitives';
import {batchMeshes} from './batch-meshes';
export type PersonKind='boy'|'girl'|'teacher';
export function createPerson(kind:PersonKind,seed=0,crest?:T.Texture){
 const root=new T.Group(),body=new T.Group();root.add(body);root.userData.personKind=kind;
 const skin=['#d9aa83','#b47d58','#edc4a0','#956447'][seed%4],hair=['#302925','#251f1c','#44352a'][seed%3];
 const female=kind==='girl'||kind==='teacher'&&seed%2===1,teacher=kind==='teacher';
 const shirt=teacher?(seed%2?'#e9d4ca':'#d5e0e7'):'#fafaf3',blue='#2083bf';
 box(body,0,1.48,0,.68,.72,.36,shirt);
 box(body,0,1.04,0,.65,.16,.36,teacher?'#454a4d':female?blue:'#20282c');
 if(female){
  const skirt=new T.Mesh(new T.CylinderGeometry(.31,.51,.83,8),material(teacher?'#49525a':blue));skirt.position.y=.75;skirt.scale.z=.75;body.add(skirt);
  if(!teacher){box(body,0,1.37,-.193,.53,.45,.05,blue);for(const x of [-.23,.23])box(body,x,1.67,-.198,.11,.35,.05,blue);}
 }else{
  for(const x of [-.18,.18])box(body,x,.91,0,.29,.35,.35,teacher?'#49525a':'#fcfcf3');
  if(!teacher){box(body,0,1.095,-.205,.67,.07,.025,'#24292c');box(body,0,1.095,-.225,.09,.07,.025,'#b3b3a9');}
 }
 // Pointed shirt collars and the school's original crest on the left breast.
 for(const x of [-.095,.095]){const collar=box(body,x,1.79,-.208,.15,.19,.04,'#fffef7');collar.rotation.z=x<0?-.32:.32;}
 if(!teacher&&crest){const badge=new T.Mesh(new T.PlaneGeometry(.14,.14),new T.MeshBasicMaterial({map:crest,transparent:true,side:T.DoubleSide,depthWrite:false}));badge.rotation.y=Math.PI;badge.position.set(.15,1.58,-.229);body.add(badge);}
 if(teacher){box(body,0,1.51,-.22,.04,.4,.02,'#526d88');box(body,0,1.32,-.24,.15,.19,.035,'#faf5e7');}
 const head=new T.Mesh(new T.SphereGeometry(.285,12,9),material(skin));head.scale.set(.88,1.1,.9);head.position.y=2.04;body.add(head);
 const top=new T.Mesh(new T.SphereGeometry(.287,12,8,0,Math.PI*2,0,Math.PI*.6),material(hair));top.position.y=2.085;top.scale.set(.92,1,.98);body.add(top);
 if(female){box(body,-.23,1.97,.03,.105,.41,.37,hair);box(body,.23,1.97,.03,.105,.41,.37,hair);box(body,0,2.02,.22,.42,.38,.11,hair);}
 for(const x of [-.085,.085])box(body,x,2.06,-.25,.035,.035,.02,'#342d29');
 box(body,0,1.985,-.263,.07,.018,.018,'#a96f56');
 const arms:T.Group[]=[],legs:T.Group[]=[];
 for(const sign of [-1,1]){
  const arm=new T.Group();arm.position.set(sign*.45,1.74,0);box(arm,0,-.16,0,.22,.33,.28,shirt);box(arm,0,-.44,0,.15,.29,.17,skin);body.add(arm);arms.push(arm);
  const leg=new T.Group();leg.position.set(sign*.175,.78,0);
  box(leg,0,-.22,0,.17,.4,.18,teacher?'#49525a':skin);
  box(leg,0,-.48,0,.18,.22,.2,teacher?'#49525a':'#f4f4ec');
  box(leg,0,-.63,-.06,.24,.16,.4,teacher?'#202727':'#f5f5ee');
  if(!teacher){box(leg,0,-.41,-.105,.13,.025,.012,'#2477aa');box(leg,0,-.445,-.106,.13,.018,.012,'#b6504c');}
  body.add(leg);legs.push(leg);
 }
 batchMeshes(body,false);arms.forEach(a=>batchMeshes(a,false));legs.forEach(a=>batchMeshes(a,false));
 if(teacher)root.scale.setScalar(1.12);
 root.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});
 return{root,poseShot(power:number){arms.forEach(a=>a.rotation.x=1.15+power*.65);},animate(time:number,moving:boolean){const stride=moving?Math.sin(time*9)*.52:0;arms[0].rotation.x=stride;arms[1].rotation.x=-stride;legs[0].rotation.x=-stride;legs[1].rotation.x=stride;body.position.y=moving?Math.abs(Math.sin(time*9))*.045:0;}};
}
