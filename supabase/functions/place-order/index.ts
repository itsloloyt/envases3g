import { createClient } from "npm:@supabase/supabase-js@2.116.0";
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {auth:{persistSession:false,autoRefreshToken:false}});
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async req=>{
  if(req.method!=="POST") return reply({error:"Método no permitido"},405);
  try {
    const text=await req.text();
    if(text.length>24000) return reply({error:"Pedido demasiado grande"},413);
    const body=JSON.parse(text);
    if(body.website || body.consent!==true || typeof body.name!=="string" || typeof body.phone!=="string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)) return reply({error:"Revisá los datos del pedido"},400);
    const phone=body.phone.replace(/[^0-9+]/g,"");
    if(phone.length<8 || phone.length>20) return reply({error:"Ingresá un teléfono válido"},400);
    const {data,error}=await admin.rpc("create_order",{p_request_id:body.requestId,p_name:body.name.trim(),p_phone:phone,p_lines:body.lines});
    if(error) return reply({error:error.code==="P0001"?error.message:"No pudimos registrar el pedido. Revisá los productos e intentá nuevamente."},400);
    return reply(data,201);
  } catch { return reply({error:"No pudimos procesar el pedido. Intentá nuevamente."},400); }
});
