import { ImageResponse } from "next/og";

export const alt =
  "Beltowski® — web design, SEO marketing and AI solutions for businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -120,
            width: 760,
            height: 700,
            borderRadius: 760,
            background: "rgba(215,251,68,0.15)",
            filter: "blur(140px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              background: "#d7fb44",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#8d8d86",
              display: "flex",
            }}
          >
            Websites · SEO · AI Solutions
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 84,
            lineHeight: 1.06,
            fontWeight: 700,
            color: "#f2efe8",
            letterSpacing: -3,
          }}
        >
          <div style={{ display: "flex" }}>Designing digital</div>
          <div style={{ display: "flex" }}>experiences with code,</div>
          <div style={{ display: "flex", color: "#d7fb44" }}>search &amp; AI.</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(242,239,232,0.14)",
            paddingTop: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              color: "#f2efe8",
              letterSpacing: -0.5,
            }}
          >
            beltowski
            <span style={{ color: "#d7fb44" }}>®</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#8d8d86",
            }}
          >
            Free 15-point website audit
          </div>
        </div>
      </div>
    ),
    size
  );
}
