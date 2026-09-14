import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
await mkdir('cloud-dist/grey-heron-api',{recursive:true});
await build({entryPoints:['cloud/index.ts'],outfile:'cloud-dist/grey-heron-api/index.js',bundle:true,platform:'node',target:'node18',format:'cjs',packages:'external'});
const pkg=JSON.parse(await readFile('package.json','utf8'));
await writeFile('cloud-dist/grey-heron-api/package.json',JSON.stringify({name:'grey-heron-api',version:pkg.version,main:'index.js',dependencies:{'@cloudbase/node-sdk':pkg.dependencies['@cloudbase/node-sdk']}},null,2));
console.log('Cloud function bundle ready.');
