import config from "@/data/supabase-config.json";
// Legacy public anon JWT required by the Edge Function JWT gateway. Not an admin key.
const gatewayToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcW5jZnhwZG5seG14bXlsa3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjI4OTksImV4cCI6MjEwNDk5ODg5OX0.vd4K0cYhdO6lk6cO628qJ5eQN4xfOmrcUglG5kP9SOE";
export async function POST(req:Request) {
  if(req.headers.get("origin") && req.headers.get("origin")!==new URL(req.url).origin) return Response.json({error:"Solicitud no permitida"},{status:403});
  try {
    const body=await req.text();
    if(body.length>24000) return Response.json({error:"Pedido demasiado grande"},{status:413});
    const response=await fetch(config.url+"/functions/v1/place-order",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+gatewayToken},body,signal:AbortSignal.timeout(20000),cache:"no-store"});
    const result=await response.json();
    return Response.json(result,{status:response.status,headers:{"Cache-Control":"no-store"}});
  } catch { return Response.json({error:"No pudimos conectar. Tu carrito sigue guardado; intentá nuevamente."},{status:503}); }
}
