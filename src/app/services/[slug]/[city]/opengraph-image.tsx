import { ImageResponse } from "next/og";
import { getLocation, getLocationService, locationServices } from "@/data/locations";
import { getService } from "@/data/services";
import { SITE_NAME } from "@/lib/site";

export const alt = "Beltowski Studio local service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locationServices.map((item) => ({
    slug: item.service,
    city: item.location,
  }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const page = getLocationService(slug, city);
  const location = getLocation(city);
  const service = getService(slug);

  const eyebrow =
    location && service
      ? `${location.city}, ${location.regionCode} — ${service.title}`
      : "Services";
  const headline = page?.headline ?? SITE_NAME;

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
        {/* accent bloom */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "rgba(215,251,68,0.14)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: "#d7fb44",
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
              color: "#d7fb44",
              display: "flex",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: headline.length > 54 ? 62 : 74,
            lineHeight: 1.1,
            fontWeight: 700,
            color: "#f2efe8",
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          {headline}
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
            Central Florida · Web · SEO · AI
          </div>
        </div>
      </div>
    ),
    size
  );
}
