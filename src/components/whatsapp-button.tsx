import { whatsapp } from "@/lib/catalog";
export function WhatsappButton() {
  return <a className="whatsapp-float" href={whatsapp + "?text=" + encodeURIComponent("Hola Envases 3G, quisiera hacer una consulta.")} target="_blank" rel="noreferrer" aria-label="Hablar con Envases 3G por WhatsApp (abre otra pestaña)">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.5 11.7a8.6 8.6 0 0 1-12.8 7.5L3 20.5l1.3-4.6A8.6 8.6 0 1 1 20.5 11.7Z"/><path d="M8.1 7.4c-.9.6-.6 2.7 1.3 4.8s4.4 3.2 5.5 2.4l1-1.2-2.5-1.3-.9.8c-1.1-.5-2-1.3-2.7-2.5l.7-1-1.2-2.3Z"/></svg>
    <span>¿Te ayudamos?<strong>WhatsApp</strong></span>
  </a>;
}
