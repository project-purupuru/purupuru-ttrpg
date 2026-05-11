// SEO + OG metadata · single source of truth (BEACON R5 spec).
// Per-page copy from ALEXANDER R5 audit · cold-audience register canon
// from `grimoires/vocabulary/lexicon.yaml` · em-dash banned · middle-dot
// (·) used as separator throughout (matches world-purupuru convention).
//
// Usage:
//   app/layout.tsx → `export const metadata = rootMetadata`
//   app/<route>/page.tsx → `export const metadata = pageMetadata("<slug>")`
// Next.js shallow-merges per-route over root.

import type { Metadata } from "next"

export const SITE = {
  url: "https://purupuru.world",
  name: "purupuru",
  handle: "@puruworld",
  // Canonical OG card from the world-purupuru brand surface (1200×630).
  // Single S3 asset shared across both apps so brand surface stays unified.
  ogImage: "https://thj-assets.s3.us-west-2.amazonaws.com/Purupuru/og/og-default.png",
  ogWidth: 1200,
  ogHeight: 630,
  ogAlt: "purupuru · five elements, five guardians",
  themeColor: "#d4a80a",
  twitterCard: "summary_large_image" as const,
} as const

// Per-page copy (ALEXANDER R5). Title is rendered through the template
// `%s · purupuru` defined in rootMetadata, EXCEPT when title.absolute is
// supplied (used by /, /quiz, /today where the slug isn't the brand name).
type PageSlug = "home" | "demo" | "preview" | "quiz" | "today"

const PAGE_COPY: Record<
  PageSlug,
  {
    title: string
    titleAbsolute?: boolean // bypass the "%s · purupuru" template
    description: string
    path: string
    noindex?: boolean
  }
> = {
  home: {
    title: "purupuru · the awareness layer",
    titleAbsolute: true,
    description:
      "a live canvas of the five-element world · who's joining, what leads today, how the weather turns",
    path: "/",
  },
  demo: {
    title: "demo · Blink in feed render",
    description:
      "internal recording surface · the wuxing quiz Blink shown inside a faithful X feed context",
    path: "/demo",
  },
  preview: {
    title: "preview · Blink dev surface",
    description:
      "Dialect render of the wuxing quiz Blink without feed surround · for debugging and ops",
    path: "/preview",
    noindex: true,
  },
  quiz: {
    title: "what element are you?",
    titleAbsolute: true,
    description:
      "an 8-question read of your wuxing element · wood, fire, earth, metal, water · mint your Genesis Stone",
    path: "/quiz",
  },
  today: {
    title: "what leads today",
    titleAbsolute: true,
    description:
      "the five-element pulse of the purupuru world · a daily read that reads you back",
    path: "/today",
  },
}

// Root defaults · consumed by app/layout.tsx.
// All per-page values shallow-merge over these via Next.js' Metadata
// resolution. Per-page generally only overrides title + description +
// alternates.canonical; ogImage stays unified for brand consistency.
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    template: "%s · purupuru",
    default: "purupuru · the world, breathing",
  },
  description:
    "a warm world of five elements and five guardians · collect, craft, discover",
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/art/jani/jani-wood.png",
    apple: SITE.ogImage,
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    locale: "en_US",
    title: "purupuru · the world, breathing",
    description:
      "a warm world of five elements and five guardians · collect, craft, discover",
    images: [
      {
        url: SITE.ogImage,
        width: SITE.ogWidth,
        height: SITE.ogHeight,
        alt: SITE.ogAlt,
      },
    ],
  },
  twitter: {
    card: SITE.twitterCard,
    site: SITE.handle,
    creator: SITE.handle,
    title: "purupuru · the world, breathing",
    description:
      "a warm world of five elements and five guardians · collect, craft, discover",
    images: [SITE.ogImage],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "black-translucent",
  },
}

// Per-page override factory · keeps slug → metadata mapping single-line.
// Next.js Metadata merging REPLACES the openGraph/twitter object rather than
// shallow-merging individual fields · so we explicitly include `images` in
// every per-page output to guarantee a single unified OG card across the
// entire surface (operator R5 directive 2026-05-10).
export function pageMetadata(slug: PageSlug): Metadata {
  const page = PAGE_COPY[slug]
  const title = page.titleAbsolute ? { absolute: page.title } : page.title
  const flatTitle = typeof title === "string" ? title : title.absolute

  const ogImage = {
    url: SITE.ogImage,
    width: SITE.ogWidth,
    height: SITE.ogHeight,
    alt: SITE.ogAlt,
  }

  return {
    title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: flatTitle,
      description: page.description,
      url: `${SITE.url}${page.path}`,
      locale: "en_US",
      images: [ogImage],
    },
    twitter: {
      card: SITE.twitterCard,
      site: SITE.handle,
      creator: SITE.handle,
      title: flatTitle,
      description: page.description,
      images: [SITE.ogImage],
    },
    ...(page.noindex
      ? { robots: { index: false, follow: false } }
      : undefined),
  }
}

// JSON-LD payload helper (consumed via <script type="application/ld+json">
// in the root layout). Provides WebSite + Organization shape for AI agents
// and search crawlers · sameAs ties our X presence to the canonical site.
export const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description:
        "a warm world of five elements and five guardians · collect, craft, discover",
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      url: SITE.url,
      name: SITE.name,
      logo: SITE.ogImage,
      sameAs: ["https://twitter.com/puruworld", "https://x.com/puruworld"],
    },
  ],
} as const
