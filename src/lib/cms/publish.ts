import "server-only";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { buildCmsSnapshot } from "@/src/lib/cms/snapshot";
import type { Tables } from "@/src/types/database.types";

export class PublishPrerequisiteError extends Error {}

export type PublishResult = {
  release: Tables<"releases">;
  publishedSectionCount: number;
  publishedProjectCount: number;
  revalidateSlugs: string[];
};

function buildDefaultReleaseLabel() {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
  return `Publicación ${timestamp}`;
}

async function validateMinimumPublishableContent() {
  const admin = createSupabaseAdminClient();

  const [{ data: heroRows, error: heroError }, { data: projects, error: projectsError }] =
    await Promise.all([
      admin
        .from("site_sections")
        .select("id,status")
        .eq("page_key", "home")
        .eq("section_key", "hero")
        .eq("enabled", true)
        .in("status", ["draft", "published"]),
      admin
        .from("projects")
        .select("id")
        .in("status", ["draft", "published"])
        .limit(1),
    ]);

  if (heroError) {
    throw new Error(`Publish validation failed for hero section: ${heroError.message}`);
  }

  if (!heroRows || heroRows.length === 0) {
    throw new PublishPrerequisiteError("Debes tener una sección Hero activa en borrador o publicada.");
  }

  if (projectsError) {
    throw new Error(`Publish validation failed for projects: ${projectsError.message}`);
  }

  if (!projects || projects.length === 0) {
    throw new PublishPrerequisiteError(
      "Debes tener al menos un proyecto en estado borrador o publicado.",
    );
  }
}

export async function publishSnapshotAndContent(params: {
  actorId: string;
  label?: string;
  notes?: string;
}): Promise<PublishResult> {
  await validateMinimumPublishableContent();

  const admin = createSupabaseAdminClient();
  const snapshot = await buildCmsSnapshot(admin);

  const { data: draftSections, error: draftSectionsError } = await admin
    .from("site_sections")
    .select("*")
    .eq("status", "draft");

  if (draftSectionsError) {
    throw new Error(`Failed loading draft sections: ${draftSectionsError.message}`);
  }

  const publishedSectionsPayload =
    draftSections?.map((section) => ({
      page_key: section.page_key,
      section_key: section.section_key,
      position: section.position,
      enabled: section.enabled,
      status: "published" as const,
      data_json: section.data_json,
      updated_by: params.actorId,
    })) ?? [];

  if (publishedSectionsPayload.length > 0) {
    const { error: sectionPublishError } = await admin
      .from("site_sections")
      .upsert(publishedSectionsPayload, {
        onConflict: "page_key,section_key,status",
      });

    if (sectionPublishError) {
      throw new Error(`Failed publishing sections: ${sectionPublishError.message}`);
    }
  }

  const { data: promotedProjects, error: projectPublishError } = await admin
    .from("projects")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_by: params.actorId,
    })
    .eq("status", "draft")
    .select("id");

  if (projectPublishError) {
    throw new Error(`Failed publishing projects: ${projectPublishError.message}`);
  }

  const { data: publishedProjects, error: publishedProjectsError } = await admin
    .from("projects")
    .select("slug")
    .eq("status", "published");

  if (publishedProjectsError) {
    throw new Error(`Failed loading published slugs: ${publishedProjectsError.message}`);
  }

  const releaseLabel = params.label?.trim() || buildDefaultReleaseLabel();
  const releasePayload = {
    label: releaseLabel,
    notes: params.notes?.trim() || null,
    snapshot_json: snapshot,
    published_by: params.actorId,
  };

  const { data: insertedRelease, error: releaseError } = await admin
    .from("releases")
    .insert(releasePayload)
    .select("*")
    .single();

  if (releaseError) {
    throw new Error(`Failed creating release: ${releaseError.message}`);
  }

  return {
    release: insertedRelease,
    publishedSectionCount: publishedSectionsPayload.length,
    publishedProjectCount: promotedProjects?.length ?? 0,
    revalidateSlugs: (publishedProjects ?? []).map((project) => project.slug),
  };
}
