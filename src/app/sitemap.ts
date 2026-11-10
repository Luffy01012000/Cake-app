import { MetadataRoute } from "next";
import { getAllCakes, getSiteSettings, getAllPagesSeo, getCustomSitemapEntries } from "@/lib/data-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cakes, settings, pages, customEntries] = await Promise.all([
    getAllCakes(),
    getSiteSettings(),
    getAllPagesSeo(),
    getCustomSitemapEntries(),
  ]);

  const baseUrl = settings.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const noIndexedPaths = new Set(
    pages
      .filter((p) => p.noIndex)
      .map((p) => (p.path.startsWith("/") ? p.path : `/${p.path}`))
  );

  const occasions = [
    "weddings",
    "birthdays",
    "anniversaries",
    "baby-showers",
    "galas",
  ];

  const staticCandidates: { path: string; priority: number; changeFrequency: "daily" | "weekly" }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/cakes", priority: 0.9, changeFrequency: "daily" },
    ...occasions.map((occ) => ({
      path: `/occasions/${occ}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticCandidates
    .filter((candidate) => !noIndexedPaths.has(candidate.path))
    .map((candidate) => ({
      url: candidate.path === "/" ? baseUrl : `${baseUrl}${candidate.path}`,
      lastModified: now,
      changeFrequency: candidate.changeFrequency,
      priority: candidate.priority,
    }));

  const cakeEntries: MetadataRoute.Sitemap = cakes.map((cake) => ({
    url: `${baseUrl}/cakes/${cake.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const customSitemapItems: MetadataRoute.Sitemap = (customEntries || [])
    .filter((entry) => entry.enabled && entry.path)
    .map((entry) => {
      const normalizedPath = entry.path.startsWith("/") ? entry.path : `/${entry.path}`;
      return {
        url: `${baseUrl}${normalizedPath}`,
        lastModified: now,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
      };
    });

  return [...staticEntries, ...cakeEntries, ...customSitemapItems];
}
