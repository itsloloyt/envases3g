"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { whatsapp } from "@/lib/catalog";
export function ContactForm() {
  const params = useSearchParams();
  const [type, setType] = useState(params.get("tipo") || "consulta");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "fallback"
  >("idle");
  const [fallback, setFallback] = useState("");
  const [mail, setMail] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const text = `${type === "arrepentimiento" ? "Solicitud de arrepentimiento" : type === "mayorista" ? "Solicitud mayorista" : "Consulta"}\nNombre: ${body.name}\nEmail: ${body.email}\nTeléfono: ${body.phone || "No indicado"}\n${body.order ? "Orden: " + body.order + "\n" : ""}${body.message}`;
    setFallback(whatsapp + "?text=" + encodeURIComponent(text));
    setMail(
      "mailto:envases3g@gmail.com?subject=" +
        encodeURIComponent(
          type === "arrepentimiento"
            ? "Solicitud de arrepentimiento"
            : "Consulta Envases 3G",
        ) +
        "&body=" +
        encodeURIComponent(text),
    );
    try {
      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("fallback");
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Contanos tu idea.</h2>
      <p>Completá tus datos y el detalle de tu consulta.</p>
      <label>
        Tipo de consulta
        <select
          name="type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setStatus("idle");
          }}
        >
          <option value="consulta">Consulta general</option>
          <option value="mayorista">Cuenta mayorista</option>
          <option value="arrepentimiento">Arrepentimiento de compra</option>
        </select>
      </label>
      {type === "mayorista" && (
        <p className="form-note">
          La solicitud de cuenta mayorista será revisada por el equipo. La
          aprobación y el acceso a la lista mayorista se coordinan por email.
        </p>
      )}
      {type === "arrepentimiento" && (
        <p className="form-note">
          Indicá el número de orden sin # y el detalle de la compra que querés
          cancelar. El equipo revisará tu solicitud.
        </p>
      )}
      <div className="form-two">
        <label>
          Nombre completo
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            placeholder="Tu nombre"
          />
        </label>
        <label>
          Email
          <input
            name="email"
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            placeholder="nombre@email.com"
          />
        </label>
      </div>
      <label>
        Teléfono {type === "consulta" && "(opcional)"}
        <input
          name="phone"
          type="tel"
          required={type !== "consulta"}
          maxLength={40}
          autoComplete="tel"
          placeholder="Código de área y número"
        />
      </label>
      {type === "arrepentimiento" && (
        <label>
          Número de orden
          <input
            name="order"
            required
            maxLength={80}
            placeholder="Sin el símbolo #"
          />
        </label>
      )}
      <label>
        Mensaje
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          placeholder="Qué producto buscás, cantidad, presentación…"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required /> Acepto que Envases 3G
        use estos datos para responder mi consulta.
      </label>
      {status === "success" ? (
        <div className="form-success" role="status">
          <Check size={22} />
          <span>
            Recibimos tu consulta. El equipo podrá contactarte con los datos que
            dejaste.
          </span>
        </div>
      ) : (
        <button className="button primary" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar consulta"}
          <ArrowUpRight size={18} />
        </button>
      )}
      {status === "fallback" && (
        <div className="form-note" role="alert">
          <strong>No pudimos guardar tu consulta.</strong>
          <p>
            Tu mensaje está preparado. Podés enviarlo directamente al equipo:
          </p>
          <a
            className="text-link"
            href={fallback}
            target="_blank"
            rel="noreferrer"
          >
            Continuar por WhatsApp <ArrowUpRight size={16} />
          </a>
          <a className="text-link" href={mail}>
            Enviar por email <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </form>
  );
}
