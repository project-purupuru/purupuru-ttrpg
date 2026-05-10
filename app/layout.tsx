import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PURU_ICON =
  "https://thj-assets.s3.us-west-2.amazonaws.com/Purupuru/brand/project-purupuru-logo.png";
const SITE_NAME = "purupuru";
const TITLE = "Tsuheji · purupuru";
const DESCRIPTION = "the world, breathing — every puruhani in tsuheji, live";

export const viewport: Viewport = {
  themeColor: "#d4a80a",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: PURU_ICON,
    apple: PURU_ICON,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: PURU_ICON, width: 512, height: 512, alt: "purupuru" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [PURU_ICON],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
};

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
        {children}
      </body>
    </html>
  );
}
