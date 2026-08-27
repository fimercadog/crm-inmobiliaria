import type { MetadataRoute } from "next";
import { fetchPublicBlogPosts, fetchPublicProperties } from "@/lib/api/public";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Needs a live backend at request time — don't prerender at build time.
export const dynamic = "force-dynamic";

async function collectAllPropertySlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;

  for (;;) {
    const { items, meta } = await fetchPublicProperties(page);
    slugs.push(...items.map((item) => item.slug));
    if (page >= meta.last_page) break;
    page += 1;
  }

  return slugs;
}

async function collectAllBlogSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;

  for (;;) {
    const { items, meta } = await fetchPublicBlogPosts(page);
    slugs.push(...items.map((item) => item.slug));
    if (page >= meta.last_page) break;
    page += 1;
  }

  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [propertySlugs, blogSlugs] = await Promise.all([collectAllPropertySlugs(), collectAllBlogSlugs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/propiedades`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/comprar`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/arrendar`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/vender-mi-propiedad`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = propertySlugs.map((slug) => ({
    url: `${SITE_URL}/propiedades/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
