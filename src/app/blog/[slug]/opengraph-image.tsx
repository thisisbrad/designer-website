import { ImageResponse } from "next/og";
import { getPost, posts } from "@/data/posts";
import { SITE_NAME } from "@/lib/site";

export const alt = "Beltowski Studio article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  const category = post?.category ?? "Insights";
  const title = post?.title ?? SITE_NAME;
  const readTime = post?.readTime ?? "";

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
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 66 : 78,
            lineHeight: 1.1,
            fontWeight: 700,
            color: "#f2efe8",
            letterSpacing: -2,
            maxWidth: 960,
          }}
        >
          {title}
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
            {readTime ? `${readTime} · ` : ""}Web · SEO · AI
          </div>
        </div>
      </div>
    ),
    size
  );
}
