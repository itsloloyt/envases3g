"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Send } from "lucide-react";
import { ease } from "./Reveal";

type Status = "idle" | "sending" | "ok" | "error";
type Type = "consulta" | "mayorista" | "arrepentimiento";
type Errors = Partial<Record<"name" | "email" | "phone" | "order" | "message" | "consent", string>>;

const TYPES: { value: Type; label: string }[] = [
  { value: "consulta", label: "Consulta" },
  { value: "mayorista", label: "Cotización mayorista" },
  { value: "arrepentimiento", label: "Botón de arrepentimiento" },
];

export function ContactForm({ initialType = "consulta" }: { initialType?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [type, setType] = useState<Type>(TYPES.some((t) => t.value === initialType) ? (initialType as Type) : "consulta");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errs: Errors = {};
    if ((data.name?.trim().length ?? 0) < 2) errs.name = "Contanos tu nombre.";
    if (!/^\S+@\S+\.\S+$/.test(data.email?.trim() ?? "")) errs.email = "Ingresá un email válido.";
    if (type !== "consulta" && !data.phone?.trim()) errs.phone = "Necesitamos un teléfono para responderte.";
    if (type === "arrepentimiento" && !data.order?.trim()) errs.order = "Indicá el número de pedido.";
    if ((data.message?.trim().length ?? 0) < 10) errs.message = "El mensaje es muy corto (mínimo 10 caracteres).";
    if (data.consent !== "on") errs.consent = "Necesitamos tu autorización para responderte.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/consultas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, type }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No pudimos enviar el mensaje.");
      setStatus("ok");
      form.reset();
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "No pudimos enviar el mensaje.");
      setStatus("error");
    }
  }

  return (
    <div className="glass relative overflow-hidden rounded-[32px] p-6 sm:p-10">
      <AnimatePresence mode="wait">
        {status === "ok" ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }} className="grid min-h-[480px] place-items-center text-center">
            <div>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }} className="mx-auto grid size-20 place-items-center rounded-full bg-teal text-night">
                <Check className="size-9" />
              </motion.span>
              <p className="mt-6 font-display text-4xl font-extrabold">¡Mensaje enviado!</p>
              <p className="mt-2 text-muted">Te respondemos lo antes posible.</p>
              <button onClick={() => setStatus("idle")} className="mt-8 rounded-full border border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white">
                Enviar otro mensaje
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <fieldset>
              <legend className="mb-2.5 text-sm font-semibold">Motivo</legend>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setType(t.value)}
                    aria-pressed={type === t.value}
                    className={`min-h-10 rounded-full border px-4 text-sm transition-colors duration-200 ${type === t.value ? "border-ink bg-ink text-white" : "border-line bg-white/60 hover:border-ink/40"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {type === "arrepentimiento" && (
                <p className="mt-3 rounded-2xl bg-teal/10 px-4 py-3 text-sm text-ink-2">
                  Podés revocar tu compra dentro de los 10 días corridos desde que la recibiste. Completá el formulario y te respondemos con los pasos a seguir.
                </p>
              )}
            </fieldset>
            <Input label="Nombre" name="name" autoComplete="name" error={errors.name} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
              <Input label={type === "consulta" ? "Teléfono (opcional)" : "Teléfono"} name="phone" type="tel" autoComplete="tel" inputMode="tel" error={errors.phone} />
            </div>
            {type === "arrepentimiento" && <Input label="Número de pedido" name="order" placeholder="Ej.: 3G-000123" error={errors.order} />}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Mensaje</span>
              <textarea
                name="message"
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "err-message" : undefined}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:border-teal-deep ${errors.message ? "border-red-600" : "border-line"}`}
                placeholder={type === "mayorista" ? "Ej.: Necesito 300 goteros ámbar de 30 cc con pipeta…" : "Escribí tu consulta…"}
              />
              {errors.message && (
                <span id="err-message" className="mt-1.5 block text-sm text-red-700">
                  {errors.message}
                </span>
              )}
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-[var(--teal-deep)]" aria-invalid={!!errors.consent} />
              <span>
                Acepto que Envases 3G use estos datos para responder mi consulta.
                {errors.consent && <span className="mt-1 block text-red-700">{errors.consent}</span>}
              </span>
            </label>
            <div hidden aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            {status === "error" && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorText} Probá de nuevo o escribinos por WhatsApp.
              </p>
            )}
            <button
              disabled={status === "sending"}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-deep disabled:opacity-60 sm:w-auto sm:px-10"
            >
              {status === "sending" ? "Enviando…" : "Enviar mensaje"}
              <Send className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = `f-${props.name}`;
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        id={id}
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:border-teal-deep ${error ? "border-red-600" : "border-line"}`}
      />
      {error && (
        <span id={`${id}-err`} className="mt-1.5 block text-sm text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
