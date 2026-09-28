import fs from 'node:fs';
const products = JSON.parse(fs.readFileSync('src/data/products.json','utf8'));
const source = JSON.parse(fs.readFileSync('src/data/source-variant-photography.json','utf8'));
const urls = [...new Set(products.flatMap(p=>[...p.images,...Object.values(source[p.slug]||{}).map(x=>x.src)]))];
let cursor=0, checked=0; const failures=[];
await Promise.all(Array.from({length:8},async()=>{while(cursor<urls.length){const url=urls[cursor++];try{const r=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(20000)});if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))failures.push({url,status:r.status,type:r.headers.get('content-type')});}catch(e){failures.push({url,error:e.message});}checked++;if(checked%200===0)console.log(`${checked}/${urls.length}`);}}));
const result={checkedAt:new Date().toISOString(),products:products.length,uniqueImages:urls.length,failures};fs.writeFileSync('reports/catalog-image-health.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
