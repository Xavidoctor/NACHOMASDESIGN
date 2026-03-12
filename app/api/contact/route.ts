import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Datos de formulario invalidos."
        },
        { status: 400 }
      );
    }

    const { website, name, email, company, service, message } = parsed.data;

    // Honeypot: si se completa, devolvemos exito silencioso para no dar feedback a bots.
    if (website && website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!apiKey || !toEmail) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno para envio de correo."
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company || "No indicada");
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message);

    const html = `
      <div style="font-family:Arial,sans-serif;color:#161514;line-height:1.6;max-width:680px;">
        <h2>Nuevo mensaje desde nachomasdesign.com</h2>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Empresa:</strong> ${safeCompany}</p>
        <p><strong>Servicio de interes:</strong> ${safeService}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="white-space:pre-wrap;">${safeMessage}</p>
      </div>
    `;

    await resend.emails.send({
      from: "Nacho Mas Design <onboarding@resend.dev>",
      to: [toEmail],
      replyTo: email,
      subject: `Nuevo lead web: ${service}`,
      html,
      text: [
        "Nuevo mensaje desde nachomasdesign.com",
        `Nombre: ${name}`,
        `Email: ${email}`,
        `Empresa: ${company || "No indicada"}`,
        `Servicio: ${service}`,
        "Mensaje:",
        message
      ].join("\n")
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la solicitud." }, { status: 500 });
  }
}
