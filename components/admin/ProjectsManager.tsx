"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Tables } from "@/src/types/database.types";

type ProjectRow = Tables<"projects">;
type ProjectStatus = "draft" | "published" | "archived";

function statusLabel(status: ProjectStatus) {
  if (status === "draft") return "Borrador";
  if (status === "published") return "Publicado";
  return "Archivado";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function ProjectsManager({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("draft");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesTerm = !term || [project.title, project.slug, project.category ?? ""].join(" ").toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [projects, search, statusFilter]);

  const statusCounters = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc.total += 1;
        acc[project.status] += 1;
        return acc;
      },
      { total: 0, draft: 0, published: 0, archived: 0 },
    );
  }, [projects]);

  async function refreshProjects() {
    const response = await fetch("/api/admin/projects", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "No se pudieron recargar los proyectos.");
    }
    setProjects(payload.data ?? []);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const finalSlug = slug || slugify(title);
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: finalSlug, title, category: category || null, status, featured: false, seoJson: {} }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo crear el proyecto.");
      }

      setMessage("Proyecto creado. Abriendo editor.");
      setTitle("");
      setSlug("");
      setCategory("");
      await refreshProjects();
      router.push(`/admin/projects/${payload.data.id}`);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Error inesperado al crear el proyecto.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Quieres eliminar este proyecto?")) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo eliminar el proyecto.");
      }

      setMessage("Proyecto eliminado.");
      await refreshProjects();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Error inesperado al eliminar.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-wide">Proyectos</h1>
        <p className="text-sm text-neutral-400">Crea proyectos nuevos, filtra rápido y entra al editor con un clic.</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-neutral-300">Total: {statusCounters.total}</span>
          <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-neutral-300">Borrador: {statusCounters.draft}</span>
          <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-neutral-300">Publicado: {statusCounters.published}</span>
          <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-neutral-300">Archivado: {statusCounters.archived}</span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5">
        <h2 className="font-display text-2xl tracking-wide">Nuevo proyecto</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Título</span>
            <input required value={title} onChange={(event) => { const next = event.target.value; setTitle(next); if (!slug) setSlug(slugify(next)); }} placeholder="Título" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Identificador URL</span>
            <input required value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="proyecto-ejemplo" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Categoría</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Categoría" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Estado inicial</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={isLoading} className="rounded-md border border-white/25 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed">Crear proyecto</button>
          <button type="button" onClick={() => void refreshProjects()} className="rounded-md border border-white/15 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5">Recargar</button>
          {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
          {error ? <span className="text-sm text-red-300">{error}</span> : null}
        </div>
      </form>

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="w-full space-y-1 text-sm md:max-w-md">
            <span className="text-neutral-300">Buscar proyecto</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título, identificador o categoría" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Filtrar por estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ProjectStatus)} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"><option value="all">Todos los estados</option><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select>
          </label>
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">{filtered.length} resultado(s)</p>
        </div>

        {filtered.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <article key={project.id} className="space-y-3 rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-white">{project.title}</h3>
                  <p className="text-xs text-neutral-400">/{project.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                  <span className="rounded-full border border-white/20 px-2 py-1">{statusLabel(project.status)}</span>
                  <span className="rounded-full border border-white/20 px-2 py-1">{project.category || "Sin categoría"}</span>
                  <span className="rounded-full border border-white/20 px-2 py-1">{project.featured ? "Destacado" : "Normal"}</span>
                </div>
                <p className="text-xs text-neutral-500">Actualizado: {new Date(project.updated_at).toLocaleString("es-ES")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/projects/${project.id}`} className="rounded-md border border-white/25 px-3 py-1 text-xs text-neutral-200 transition-colors hover:bg-white/10">Abrir editor</Link>
                  <button type="button" onClick={() => void handleDelete(project.id)} className="rounded-md border border-red-400/30 px-3 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/10">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/25 p-6 text-sm text-neutral-400">
            {projects.length ? "No hay resultados para el filtro actual." : "Aún no hay proyectos creados."}
          </div>
        )}
      </section>
    </section>
  );
}
