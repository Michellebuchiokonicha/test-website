import type { MetadataRoute } from "next";
import { listPublishedPosts } from "./lib/store";
import { site } from "./content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const posts = await listPublishedPosts();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/gallery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/press`, changeFrequency: "monthly", priority: 0.5 },
    ...posts.map((p) => ({
      url: `${base}/writing/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
