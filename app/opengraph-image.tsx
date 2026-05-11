// Dynamic OG card · 1200×630 · generated server-side via Next.js next/og.
// Next.js auto-routes this at /opengraph-image and auto-populates the OG
// metadata for the root + all child routes (unless they ship their own
// opengraph-image file). No external asset hosting required.
//
// Replaces the dead S3 URL (thj-assets/Purupuru/og/og-default.png → 403)
// that Discord + X couldn't render.

import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "purupuru · five elements, five guardians"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Wuxing palette · hex values · Satori in next/og does NOT support oklch().
// Hand-tuned to roughly match our oklch tokens at the same lightness/chroma.
const WUXING = [
  { name: "wood", color: "#7BB07A" }, // mid-green
  { name: "fire", color: "#E07642" }, // warm orange-red
  { name: "earth", color: "#C7A766" }, // honey-tan
  { name: "metal", color: "#B4C2D2" }, // cool blue-grey
  { name: "water", color: "#3D6FAF" }, // deep slate-blue
]

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          // Cream surface · matches the world's puru-cloud-bright token
          background:
            "linear-gradient(135deg, #FEFBF3 0%, #F9F3E2 60%, #F4EAC9 100%)",
          fontFamily:
            "ui-serif, 'Iowan Old Style', 'Apple Garamond', Georgia, serif",
        }}
      >
        {/* Honey accent stripe at top · brand cue · 5-element rainbow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 12,
            background:
              "linear-gradient(90deg, #7BB07A, #E07642, #C7A766, #B4C2D2, #3D6FAF)",
          }}
        />

        {/* Top-left · brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: "#1B1408",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              letterSpacing: "0.04em",
              opacity: 0.55,
            }}
          >
            purupuru.world
          </div>
        </div>

        {/* Center · the wordmark + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            color: "#1B1408",
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
          >
            purupuru
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 400,
              letterSpacing: "0.005em",
              opacity: 0.72,
              fontStyle: "italic",
            }}
          >
            the world, breathing
          </div>
        </div>

        {/* Bottom · 5-element row + cold-audience hook */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#1B1408",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 24, opacity: 0.6, fontWeight: 400 }}>
              eight questions to read you back
            </div>
            <div
              style={{
                fontSize: 18,
                opacity: 0.4,
                letterSpacing: "0.08em",
                fontWeight: 400,
              }}
            >
              wood   fire   earth   metal   water
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {WUXING.map((w) => (
              <div
                key={w.name}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: w.color,
                  boxShadow: "0 4px 14px -2px rgba(0,0,0,0.18)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
