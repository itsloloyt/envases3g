import assert from 'node:assert/strict';
import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('src/data/supabase-config.json','utf8'));
const requestId=crypto.randomUUID();
const body={requestId,name:'QA WEBSITE DELETE',phone:'000000009915',consent:true,website:'',lines:[{slug:'body-125-cc-ambar',variantId:'11254733',quantity:2},{slug:'frasco-vidrio-amanecer-250-cc',variantId:'12761676',quantity:3}]};
async function submit(data){const r=await fetch('http://localhost:3000/api/pedidos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};}
const first=await submit(body);assert.equal(first.status,201,JSON.stringify(first));assert.equal(Number(first.data.total),4951);assert.equal(first.data.items.length,2);
const duplicate=await submit(body);assert.equal(duplicate.data.number,first.data.number);
const tampered=await submit({...body,requestId:crypto.randomUUID(),lines:body.lines.map(l=>({...l,price:1,subtotal:1})),total:1});assert.equal(Number(tampered.data.total),4951);
const changed=await submit({...body,lines:[{...body.lines[0],quantity:8}]});assert.equal(changed.status,400);
for(const lines of [[{...body.lines[0],quantity:-1}],[{...body.lines[0],quantity:0}],[{...body.lines[0],quantity:1.2}],[{...body.lines[0],variantId:'17487673'}],[{...body.lines[0],slug:'not-a-product'}]]){const r=await submit({...body,requestId:crypto.randomUUID(),lines});assert.equal(r.status,400,JSON.stringify(r));}
const read=await fetch(config.url+'/rest/v1/orders?select=*',{headers:{apikey:config.publishableKey}});assert.ok(read.status===401||read.status===403);
const rpc=await fetch(config.url+'/rest/v1/rpc/create_order',{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({p_request_id:crypto.randomUUID(),p_name:'Forbidden',p_phone:'000000009915',p_lines:body.lines})});assert.ok(rpc.status===401||rpc.status===403||rpc.status===404);
console.log(JSON.stringify({passed:true,order:first.data.number,total:first.data.total,secondTestOrder:tampered.data.number,testCustomer:body.name,testPhone:body.phone}));
