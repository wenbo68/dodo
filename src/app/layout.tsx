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
