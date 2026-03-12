"use client";

import { useState } from "react";
import { CONTACT_FORM_MIN_MESSAGE } from "@/lib/constants";
import type { ContactFormValues } from "@/lib/contact-schema";

const initialValues: ContactFormValues = {
  name: "",
  email: "",
  company: "",
  service: "",
  message: "",
  website: ""
};

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const update = (field: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!values.name.trim() || !values.email.trim() || !values.service.trim()) {
      setStatus("error");
      setError("Completa nombre, email y servicio.");
      return;
    }

    if (values.message.trim().length < CONTACT_FORM_MIN_MESSAGE) {
      setStatus("error");
      setError(`El mensaje debe tener al menos ${CONTACT_FORM_MIN_MESSAGE} caracteres.`);
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const payload = await response.json();
      if (!response.ok) {
        setStatus("error");
        setError(payload.error ?? "No se pudo enviar el mensaje.");
        return;
      }

      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
      setError("Error de red. Intentalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 border-t border-border/70 pt-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Nombre</span>
          <input
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className="focus-ring w-full border-b border-border/70 bg-transparent pb-3 text-sm text-foreground"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Email</span>
          <input
            type="email"
            required
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            className="focus-ring w-full border-b border-border/70 bg-transparent pb-3 text-sm text-foreground"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Empresa</span>
          <input
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
            className="focus-ring w-full border-b border-border/70 bg-transparent pb-3 text-sm text-foreground"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Servicio</span>
          <input
            required
            value={values.service}
            onChange={(event) => update("service", event.target.value)}
            className="focus-ring w-full border-b border-border/70 bg-transparent pb-3 text-sm text-foreground"
          />
        </label>
      </div>

      <label className="hidden" aria-hidden="true">
        <span>Website</span>
        <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
      </label>

      <label className="mt-8 block space-y-2">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">Mensaje</span>
        <textarea
          rows={5}
          required
          minLength={CONTACT_FORM_MIN_MESSAGE}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          className="focus-ring w-full border-b border-border/70 bg-transparent pb-3 text-sm text-foreground"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="focus-ring mt-8 text-xs uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-60 disabled:opacity-40"
      >
        {status === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>

      {status === "success" ? <p className="mt-5 text-sm text-foreground">Mensaje enviado correctamente.</p> : null}
      {status === "error" && error ? <p className="mt-5 text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
