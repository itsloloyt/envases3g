import { NextResponse } from "next/server";
import { database } from "@/lib/supabase";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 16000)
    return NextResponse.json(
      { error: "Mensaje demasiado largo" },
      { status: 413 },
    );
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || Array.isArray(body)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (body.website)
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const get = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string).trim() : "";
  const name = get("name"),
    email = get("email"),
    phone = get("phone"),
    message = get("message"),
    type = get("type"),
    order = get("order");
  if (
    name.length < 2 ||
    name.length > 120 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 254 ||
    phone.length > 40 ||
    message.length < 10 ||
    message.length > 5000 ||
    !["consulta", "mayorista", "arrepentimiento"].includes(type) ||
    body.consent !== "on" ||
    (type !== "consulta" && !phone) ||
    (type === "arrepentimiento" && (!order || order.length > 80))
  )
    return NextResponse.json({ error: "Revisá los campos" }, { status: 400 });
  const db = database();
  if (!db)
    return NextResponse.json(
      { error: "Usá nuestros canales de contacto directo" },
      { status: 503 },
    );
  const { error } = await db
    .from("inquiries")
    .insert({
      name,
      email,
      phone: phone || null,
      message,
      type,
      order_number: order || null,
      consent: true,
    });
  if (error)
    return NextResponse.json(
      { error: "No se pudo registrar. Contactanos directamente." },
      { status: 503 },
    );
  return NextResponse.json({ ok: true }, { status: 201 });
}
