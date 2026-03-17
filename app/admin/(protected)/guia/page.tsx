import { requireAdminPage } from "@/src/lib/auth/require-page-role";

const glossaryItems = [
  {
    term: "Visitantes únicos",
    definition:
      "Número de personas distintas que han visitado la web en el periodo seleccionado.",
  },
  {
    term: "Sesiones",
    definition:
      "Cantidad de visitas iniciadas. Una persona puede generar varias sesiones en distintos momentos.",
  },
  {
    term: "Conversión",
    definition:
      "Porcentaje de visitantes que han enviado el formulario de contacto.",
  },
  {
    term: "Snapshot de consumo",
    definition:
      "Foto puntual del uso de una plataforma (Vercel, Supabase, R2 o email) en un momento concreto.",
  },
  {
    term: "Alerta amarilla / naranja / roja",
    definition:
      "Aviso de proximidad a límite de consumo. Amarilla indica vigilancia; naranja/roja requiere acción.",
  },
  {
    term: "Modo básico",
    definition:
      "Vista simplificada para lectura rápida, con menos datos técnicos y más explicación.",
  },
  {
    term: "Modo avanzado",
    definition:
      "Vista con más detalle técnico y desglose de métricas para análisis profundo.",
  },
];

export default async function AdminGuidePage() {
  await requireAdminPage();

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-wide">Guía del panel</h1>
        <p className="text-sm text-neutral-400">
          Glosario rápido para entender métricas, alertas y acciones recomendadas.
        </p>
      </div>

      <div className="grid gap-3">
        {glossaryItems.map((item) => (
          <article
            key={item.term}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-200">
              {item.term}
            </h2>
            <p className="mt-2 text-sm text-neutral-300">{item.definition}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
