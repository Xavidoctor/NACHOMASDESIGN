import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { contactSchema } from "@/lib/contact-schema";
import {
  DEFAULT_CONTACT_NOTIFICATION_EMAIL,
  getAdminPanelSettings,
} from "@/src/lib/cms/admin-panel-settings";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;
const ipRateMap = new Map<string, number[]>();

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function clean(value: string | undefined | null) {
  return (value ?? "").trim();
}

function hashIp(value: string) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function canProceedByRateLimit(ip: string) {
  const now = Date.now();
  const entries = ipRateMap.get(ip) ?? [];
  const fresh = entries.filter((value) => now - value <= RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX) {
    ipRateMap.set(ip, fresh);
    return false;
  }
  fresh.push(now);
  ipRateMap.set(ip, fresh);
  return true;
}

async function sendLeadNotificationEmail(params: {
  resendApiKey: string;
  toEmail: string;
  replyTo: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  pageUrl: string;
}) {
  const resend = new Resend(params.resendApiKey);
  const html = `
    <div style="font-family:Arial,sans-serif;color:#161514;line-height:1.6;max-width:680px;">
      <h2>Nuevo mensaje desde nachomasdesign.com</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(params.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(params.phone || "No indicado")}</p>
      <p><strong>Empresa:</strong> ${escapeHtml(params.company || "No indicada")}</p>
      <p><strong>Servicio:</strong> ${escapeHtml(params.service)}</p>
      <p><strong>Página:</strong> ${escapeHtml(params.pageUrl || "No indicada")}</p>
      <p><strong>Mensaje:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(params.message)}</p>
    </div>
  `;

  return resend.emails.send({
    from: "Nacho Mas Design <onboarding@resend.dev>",
    to: [params.toEmail],
    replyTo: params.replyTo,
    subject: `Nuevo lead web: ${params.service}`,
    html,
    text: [
      "Nuevo mensaje desde nachomasdesign.com",
      `Nombre: ${params.name}`,
      `Email: ${params.email}`,
      `Teléfono: ${params.phone || "No indicado"}`,
      `Empresa: ${params.company || "No indicada"}`,
      `Servicio: ${params.service}`,
      `Página: ${params.pageUrl || "No indicada"}`,
      "Mensaje:",
      params.message,
    ].join("\n"),
  });
}

async function sendAutoReplyEmail(params: {
  resendApiKey: string;
  toEmail: string;
  subject: string;
  body: string;
}) {
  const resend = new Resend(params.resendApiKey);
  return resend.emails.send({
    from: "Nacho Mas Design <onboarding@resend.dev>",
    to: [params.toEmail],
    subject: params.subject,
    text: params.body,
    html: `<p style="font-family:Arial,sans-serif;white-space:pre-wrap;">${escapeHtml(params.body)}</p>`,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos de formulario inválidos." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const website = clean(data.website);
    if (website.length > 0) {
      return NextResponse.json({ success: true });
    }

    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown";
    if (!canProceedByRateLimit(ip)) {
      return NextResponse.json(
        { error: "Has enviado demasiadas solicitudes en poco tiempo. Inténtalo en 1 minuto." },
        { status: 429 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const adminSettings = await getAdminPanelSettings(supabaseAdmin);

    const toEmail =
      clean(adminSettings.contact_notification_email) || DEFAULT_CONTACT_NOTIFICATION_EMAIL;
    const source = clean(data.source) || "web_contact_form";
    const pageUrl = clean(data.pageUrl);
    const referrer = clean(data.referrer);
    const utmSource = clean(data.utmSource);
    const utmMedium = clean(data.utmMedium);
    const utmCampaign = clean(data.utmCampaign);
    const userAgent = request.headers.get("user-agent") ?? null;

    const { data: insertedLead, error: leadError } = await supabaseAdmin
      .from("contact_leads")
      .insert({
        name: clean(data.name),
        email: clean(data.email),
        phone: clean(data.phone) || null,
        company: clean(data.company) || null,
        subject: clean(data.service),
        message: clean(data.message),
        page_url: pageUrl || null,
        source,
        referrer: referrer || null,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        status: "nuevo",
        is_read: false,
        sent_to_email: toEmail,
        email_notification_status: "pendiente",
        ip_hash: hashIp(ip),
        user_agent: userAgent,
      })
      .select("*")
      .single();

    if (leadError || !insertedLead) {
      return NextResponse.json(
        { error: "No se pudo guardar tu mensaje. Inténtalo de nuevo." },
        { status: 500 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    let emailStatus: "enviado" | "error" | "omitido" = "omitido";
    let emailProviderId: string | null = null;
    let responseWarning = "";

    if (adminSettings.contact_notifications_enabled) {
      if (!resendApiKey) {
        emailStatus = "error";
        responseWarning =
          "El mensaje se guardó, pero no se pudo enviar la notificación por email.";
      } else {
        try {
          const emailResponse = await sendLeadNotificationEmail({
            resendApiKey,
            toEmail,
            replyTo: clean(data.email),
            name: clean(data.name),
            email: clean(data.email),
            phone: clean(data.phone),
            company: clean(data.company),
            service: clean(data.service),
            message: clean(data.message),
            pageUrl,
          });
          emailStatus = "enviado";
          emailProviderId = emailResponse.data?.id ?? null;

          if (adminSettings.contact_auto_reply_enabled) {
            await sendAutoReplyEmail({
              resendApiKey,
              toEmail: clean(data.email),
              subject: adminSettings.contact_auto_reply_subject,
              body: adminSettings.contact_auto_reply_body,
            }).catch(() => null);
          }
        } catch {
          emailStatus = "error";
          responseWarning =
            "El mensaje se guardó, pero hubo un error al enviar la notificación.";
        }
      }
    }

    await supabaseAdmin
      .from("contact_leads")
      .update({
        sent_to_email: toEmail,
        email_notification_status: emailStatus,
        email_notification_provider_id: emailProviderId,
      })
      .eq("id", insertedLead.id);

    await supabaseAdmin.from("analytics_events").insert({
      session_id: `contact-${insertedLead.id}`,
      visitor_id: hashIp(ip) ?? insertedLead.id,
      event_type: "contact_form_submit",
      path: pageUrl || "/",
      page_title: null,
      referrer: referrer || null,
      device_type: null,
      country: request.headers.get("x-vercel-ip-country") ?? null,
      browser: null,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      value_json: {
        lead_id: insertedLead.id,
        email_status: emailStatus,
      },
    });

    return NextResponse.json({
      success: true,
      warning: responseWarning || undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud." },
      { status: 500 },
    );
  }
}
