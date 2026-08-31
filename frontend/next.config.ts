import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const apiHost = new URL(apiUrl);

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: apiHost.protocol.replace(":", "") as "http" | "https",
        hostname: apiHost.hostname,
        port: apiHost.port,
        pathname: "/storage/**",
      },
    ],
    // The dev backend runs on localhost, which Next's SSRF guard blocks by default.
    // Only relaxed outside production, where the API host is never loopback.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  async headers() {
    // Defense-in-depth against the Hostinger CDN caching auth HTML: `dynamic`
    // already opts these routes out of static generation; this makes the
    // no-store intent explicit for any proxy in front that reads the header.
    const noStore = [{ key: "Cache-Control", value: "no-store, must-revalidate" }];
    return [
      { source: "/login", headers: noStore },
      { source: "/forgot-password", headers: noStore },
      { source: "/reset-password", headers: noStore },
    ];
  },
};

export default nextConfig;
