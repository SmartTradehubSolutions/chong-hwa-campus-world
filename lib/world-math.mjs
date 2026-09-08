export const RADIUS = 110;
export function mapPoint(x,z,curve,radius=RADIUS) { const r=Math.hypot(x,z); if(r<1e-9)return{x:0,y:0,z:0}; const a=r/radius,k=1-curve+curve*Math.sin(a)/a; return{x:x*k,y:curve*radius*(Math.cos(a)-1),z:z*k}; }
export function surfaceNormal(x,z,curve,radius=RADIUS) { const r=Math.hypot(x,z); if(r<1e-9)return{x:0,y:1,z:0}; const a=r/radius,s=curve*Math.sin(a),y=1-curve+curve*Math.cos(a),l=Math.hypot(s,y); return{x:s*x/r/l,y:y/l,z:s*z/r/l}; }
