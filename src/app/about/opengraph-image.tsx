import { ImageResponse } from "next/og";

export const alt = "Beltowski Studio — About";
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
            top: -220,
            left: 240,
            width: 720,
            height: 620,
            borderRadius: 720,
            background: "rgba(215,251,68,0.16)",
            filter: "blur(130px)",
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
            About
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
            <div style={{ display: "flex" }}>Design-minded developer.</div>
            <div style={{ display: "flex", color: "#d7fb44" }}>Growth-minded partner.</div>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#8d8d86" }}>
            Nine years of design, code and search — one person, no hand-off loss.
          </div>
        </div>

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
      </div>
    ),
    size
  );
}
