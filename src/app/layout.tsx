import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Source_Sans_3 } from "next/font/google";

import { siteDetails } from "@/data/siteDetails";

import "@/styles/globals.css";
import { DragDropTouchProvider } from "@/components/context/dnd-touch-provider";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui"],
});

export const metadata: Metadata = {
  title: siteDetails.metadata.title,
  description: siteDetails.metadata.description,
  metadataBase: new URL(process.env.METADATABASE ?? "http://localhost:3000"),
  openGraph: {
    title: siteDetails.metadata.title,
    description: siteDetails.metadata.description,
    url: siteDetails.siteUrl,
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 675,
        alt: siteDetails.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteDetails.metadata.title,
    description: siteDetails.metadata.description,
    images: ["/images/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico", // Automatically found in app/favicon.ico
    apple: "/apple-icon.png", // Relative to public/
    other: [
      {
        rel: "icon",
        type: "image/svg+xml", // Adjust type if needed based on the SVG content
        url: "/icon0.svg", // Relative to public/
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "any", // Or the specific size of icon1.png if known (e.g., '32x32')
        url: "/icon1.png", // Relative to public/
      },
      // The web-app-manifest icons are usually referenced *inside* manifest.json,
      // but if you also want them as standalone links, you can add them.
      // However, usually, the manifest handles these.
      // Example if you *did* want to link them explicitly:
      // {
      //   rel: 'icon',
      //   type: 'image/png',
      //   sizes: '192x192',
      //   url: '/web-app-manifest-192x192.png',
      // },
      // {
      //   rel: 'icon',
      //   type: 'image/png',
      //   sizes: '512x512',
      //   url: '/web-app-manifest-512x512.png',
      // },
    ],
  },
  manifest: "/manifest.json", // Reference to the manifest file in public/

  appleWebApp: {
    title: siteDetails.siteName, // Use your siteName as the title on iOS home screen
    // statusBarStyle and startupImage can also be defined here if needed
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.className} bg-white text-neutral-800 antialiased dark:bg-neutral-800 dark:text-neutral-100`}
      >
        {siteDetails.googleAnalyticsId && (
          <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />
        )}
        <DragDropTouchProvider>{children}</DragDropTouchProvider>
      </body>
    </html>
  );
}
