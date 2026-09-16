"use client";
import { FormEvent, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { currency, whatsapp } from "@/lib/catalog";
type Item={name:string;variant:string;quantity:number;unitPrice:number;subtotal:number};
type Receipt={number:string;items:Item[];total:number};
export function CheckoutForm({lines}:{lines:{slug:string;variantId:string;quantity:number}[]}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[receipt,setReceipt]=useState<Receipt|null>(null),[url,setUrl]=useState("");
  const lock=useRef(false);
  const pending=useRef<{signature:string;id:string}|null>(null);
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if(lock.current)return;
    lock.current=true;setBusy(true);setError("");setReceipt(null);
    const form=new FormData(e.currentTarget);
    const body={name:String(form.get("name")||"").trim(),phone:String(form.get("phone")||"").trim(),consent:form.get("consent")==="on",website:String(form.get("website")||""),lines:lines.map(({slug,variantId,quantity})=>({slug,variantId,quantity}))};
    const signature=JSON.stringify(body);
    try {
      if(!pending.current) {try{pending.current=JSON.parse(sessionStorage.getItem("envases3g-checkout")||"null");}catch{}}
      if(pending.current?.signature!==signature) pending.current={signature,id:crypto.randomUUID()};
      try{sessionStorage.setItem("envases3g-checkout",JSON.stringify(pending.current));}catch{}
      const response=await fetch("/api/pedidos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,requestId:pending.current.id})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"No pudimos guardar el pedido.");
      const saved=result as Receipt;
      const message=`Hola Envases 3G, soy ${body.name}. Mi pedido es ${saved.number}.\n\n`+saved.items.map(i=>`${i.quantity} × ${i.name} (${i.variant})\n${currency(i.unitPrice)} c/u — ${currency(i.subtotal)}`).join("\n\n")+`\n\nTotal de productos: ${currency(saved.total)}.\nTeléfono: ${body.phone}\nQuisiera coordinar el pago y la entrega, y confirmar si corresponde algún descuento.`;
      const target=whatsapp+"?text="+encodeURIComponent(message);
      setReceipt(saved);setUrl(target);
      try{localStorage.setItem("envases3g-ultimo-pedido",JSON.stringify(saved));}catch{}
      window.location.assign(target);
    } catch(err) {setError(err instanceof Error?err.message:"No pudimos guardar el pedido. Intentá nuevamente.");}
    finally{lock.current=false;setBusy(false);}
  }
  return <div className="checkout-form">
    {receipt ? <div className="order-success" role="status"><CheckCircle2/><h3>Pedido {receipt.number} registrado</h3><p>Total de productos: <strong>{currency(receipt.total)}</strong></p><p>Ya podemos verlo en nuestro panel. Completá el envío del mensaje en WhatsApp para coordinar tu compra.</p><a className="button primary full" href={url}>Continuar en WhatsApp <ArrowUpRight size={18}/></a><button className="text-link" onClick={()=>setReceipt(null)}>Volver al pedido</button></div> : <form onSubmit={submit}>
      <h3>¿A nombre de quién lo guardamos?</h3>
      <label>Nombre y apellido<input name="name" autoComplete="name" minLength={2} maxLength={120} required placeholder="Tu nombre" disabled={busy}/></label>
      <label>Teléfono de contacto<input name="phone" type="tel" autoComplete="tel" minLength={8} maxLength={30} required placeholder="Ej.: 223 123 4567" disabled={busy}/></label>
      <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off"/></div>
      <label className="checkout-consent"><input type="checkbox" name="consent" required disabled={busy}/>Acepto que Envases 3G guarde mis datos para gestionar este pedido.</label>
      <p className="fine">Se guardará una orden con el detalle y el total de productos. El pago, los descuentos y la entrega se coordinan por WhatsApp.</p>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <button className="button primary full" type="submit" disabled={busy}>{busy?"Guardando tu pedido…":"Confirmar pedido e ir a WhatsApp"}<ArrowUpRight size={18}/></button>
    </form>}
  </div>;
}
