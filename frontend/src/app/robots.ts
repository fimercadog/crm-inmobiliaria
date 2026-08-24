import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const ADMIN_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/properties",
  "/clients",
  "/leads",
  "/owners",
  "/activities",
  "/visits",
  "/opportunities",
  "/closings",
  "/reports",
  "/settings",
  "/team",
  "/blog-posts",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ADMIN_ROUTES }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
