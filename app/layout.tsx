import type { Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Agentation } from "agentation";
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { rootMetadata, jsonLdWebSite, SITE } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
};

// SEO + OG metadata single-source · `lib/seo/metadata.ts`.
// Per-page overrides via `export const metadata = pageMetadata("<slug>")`
// shallow-merge over these defaults.
export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-puru-body text-puru-ink-base">
        {/* WebSite + Organization JSON-LD · helps AI agents + search
            crawlers map the surface · ties @puruworld X handle to the
            canonical site. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
        <AnimatedFavicon />
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
