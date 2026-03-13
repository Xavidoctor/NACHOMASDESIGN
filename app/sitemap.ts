import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nachomasdesign.com";

  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1
    },
    {
      url: `${siteUrl}/works`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    }
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/works/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8
  }));

  return [...baseRoutes, ...projectRoutes];
}
