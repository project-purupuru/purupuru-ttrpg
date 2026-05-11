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

// Wuxing palette · resolves at render time (Satori supports oklch).
const WUXING = [
  { name: "wood", color: "oklch(0.72 0.140 145)" },
  { name: "fire", color: "oklch(0.68 0.180 30)" },
  { name: "earth", color: "oklch(0.76 0.110 80)" },
  { name: "metal", color: "oklch(0.78 0.020 250)" },
  { name: "water", color: "oklch(0.55 0.130 240)" },
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
        {/* Honey accent stripe at top · brand cue */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 12,
            background:
              "linear-gradient(90deg, oklch(0.72 0.140 145), oklch(0.68 0.180 30), oklch(0.76 0.110 80), oklch(0.78 0.020 250), oklch(0.55 0.130 240))",
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
