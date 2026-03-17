"use client";

import Link from "next/link";
import { useState } from "react";

import { ProjectMediaManager } from "@/components/admin/ProjectMediaManager";
import type { Tables } from "@/src/types/database.types";

type ProjectRow = Tables<"projects">;
type ProjectMediaRow = Tables<"project_media">;

type ProjectEditorProps = {
  projectId: string;
  initialProject: ProjectRow;
  initialMedia: ProjectMediaRow[];
};

type ProjectStatus = "draft" | "published" | "archived";

type ProjectFormState = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  bodyMarkdown: string;
  year: string;
  clientName: string;
  category: string;
  featured: boolean;
  status: ProjectStatus;
  seoTitle: string;
  seoDescription: string;
  seoOgImage: string;
};

function statusLabel(status: ProjectStatus) {
  if (status === "draft") return "Borrador";
  if (status === "published") return "Publicado";
  return "Archivado";
}

function toFormState(project: ProjectRow): ProjectFormState {
  const seo = (project.seo_json ?? {}) as {
    title?: string;
    description?: string;
    ogImage?: string;
  };

  return {
    title: project.title,
    slug: project.slug,
    subtitle: project.subtitle ?? "",
    excerpt: project.excerpt ?? "",
    bodyMarkdown: project.body_markdown ?? "",
    year: project.year ? String(project.year) : "",
    clientName: project.client_name ?? "",
    category: project.category ?? "",
    featured: project.featured,
    status: project.status,
    seoTitle: seo.title ?? "",
    seoDescription: seo.description ?? "",
    seoOgImage: seo.ogImage ?? "",
  };
}

export function ProjectEditor({ projectId, initialProject, initialMedia }: ProjectEditorProps) {
  const [project, setProject] = useState(initialProject);
  const [form, setForm] = useState<ProjectFormState>(() => toFormState(initialProject));
  const [mediaRows, setMediaRows] = useState(initialMedia);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshProject() {
    const response = await fetch(`/api/admin/projects?id=${projectId}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "No se pudo recargar el proyecto.");
    }

    setProject(payload.data);
    setForm(toFormState(payload.data));
    setMediaRows(payload.media ?? []);
  }

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          slug: form.slug,
          title: form.title,
          subtitle: form.subtitle || null,
          excerpt: form.excerpt || null,
          bodyMarkdown: form.bodyMarkdown || null,
          year: form.year ? Number(form.year) : null,
          clientName: form.clientName || null,
          category: form.category || null,
          featured: form.featured,
          status: form.status,
          seoJson: {
            title: form.seoTitle || undefined,
            description: form.seoDescription || undefined,
            ogImage: form.seoOgImage || undefined,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar el proyecto.");
      }

      setProject(payload.data);
      setForm(toFormState(payload.data));
      setMessage("Proyecto guardado correctamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error inesperado al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-4xl tracking-wide">{project.title}</h1>
          <p className="text-sm text-neutral-400">
            {project.slug} · {statusLabel(project.status)}
          </p>
        </div>
        <Link href="/admin/projects" className="rounded-md border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.12em] text-neutral-200 transition-colors hover:bg-white/10">
          Volver a proyectos
        </Link>
      </div>

      <form onSubmit={saveProject} className="space-y-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">General</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Título</span>
              <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Título del proyecto" required className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Identificador URL</span>
              <input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="proyecto-ejemplo" required className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Subtítulo</span>
              <input value={form.subtitle} onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))} placeholder="Subtítulo" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Categoría</span>
              <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Categoría" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Cliente</span>
              <input value={form.clientName} onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))} placeholder="Cliente" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Año</span>
              <input type="number" min={1900} max={2100} value={form.year} onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))} placeholder="Año" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Estado</span>
              <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ProjectStatus }))} className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select>
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm text-neutral-300"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} />Mostrar como destacado</label>
          </div>
        </section>

        <section className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="font-display text-2xl tracking-wide">Contenido</h2>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Resumen</span>
            <textarea rows={3} value={form.excerpt} onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))} placeholder="Resumen del proyecto" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Descripción larga</span>
            <textarea rows={8} value={form.bodyMarkdown} onChange={(event) => setForm((prev) => ({ ...prev, bodyMarkdown: event.target.value }))} placeholder="Descripción larga del proyecto" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 font-mono text-xs" />
          </label>
        </section>

        <section className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="font-display text-2xl tracking-wide">SEO</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Título SEO</span>
              <input value={form.seoTitle} onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))} placeholder="Título SEO" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Descripción SEO</span>
              <input value={form.seoDescription} onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))} placeholder="Descripción SEO" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Imagen OG</span>
              <input value={form.seoOgImage} onChange={(event) => setForm((prev) => ({ ...prev, seoOgImage: event.target.value }))} placeholder="https://..." className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
          <button type="submit" disabled={isSaving} className="rounded-md border border-white/25 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed">{isSaving ? "Guardando..." : "Guardar proyecto"}</button>
          {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
          {error ? <span className="text-sm text-red-300">{error}</span> : null}
        </div>
      </form>

      <ProjectMediaManager projectId={projectId} initialMedia={mediaRows} onRefreshProject={refreshProject} />
    </section>
  );
}
