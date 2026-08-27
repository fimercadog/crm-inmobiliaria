import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/constants/site";

// Default share-card image (image + title + description) for any public
// page that doesn't set its own — property/blog pages override this with
// a real photo via their own `openGraph.images`.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "#22c55e", marginBottom: 40 }} />
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{SITE_CONFIG.name}</div>
        <div style={{ fontSize: 32, color: "#a1a1aa", marginTop: 20, maxWidth: 900 }}>
          Encuentra el espacio que estás buscando
        </div>
      </div>
    ),
    size,
  );
}
