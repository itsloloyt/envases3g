import fs from 'node:fs';
import path from 'node:path';
// Public design assets; downloading at build time keeps repository and deployments small.
const assets=[
 ['public/images/hero-envases.jpg','https://cdn.faire.com/fastly/b82abce062ea60e11df4bedfadfcf8bb2b6ae2b8134d25504395dcbb2588b76d.jpeg?bg-color=FFFFFF&dpr=1&fit=crop&format=jpg&height=1200&width=1200'],
 ['public/fonts/dm-sans.woff2','https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2'],
 ['public/fonts/manrope.woff2','https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2']
];
for(const [file,url] of assets){
 if(fs.existsSync(file))continue;
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`Asset download failed: ${file} (${response.status})`);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));
 console.log(`Prepared ${file}`);
}
