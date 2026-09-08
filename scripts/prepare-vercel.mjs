import {cp,mkdir,writeFile,access} from 'node:fs/promises';
const source=new URL('../dist/client/',import.meta.url),output=new URL('../.vercel/output/',import.meta.url);
await access(new URL('index.html',source));
await mkdir(new URL('static/',output),{recursive:true});
await cp(source,new URL('static/',output),{recursive:true});
await writeFile(new URL('config.json',output),JSON.stringify({version:3})+'\n');
console.log('Prepared verified static assets for Vercel.');
