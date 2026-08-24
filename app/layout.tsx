import "@/lib/dns-init";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "@/lib/env-validation"; // Validate environment variables at startup
import ClientLayout from "./ClientLayout";
import { RoomProvider } from "@/features/watch-party/components/RoomContext";
import { SearchProvider } from "@/features/search/components/SearchContext";
import { WatchHistoryProvider } from "@/features/history/components/WatchHistoryContext";
import { ProfileProvider } from "@/features/profile/components/ProfileContext";
import { ProfileLoadingProvider } from "@/features/profile/components/ProfileLoadingContext";
import ProfileLoadingBlocker from "@/features/profile/components/ProfileLoadingBlocker";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://movieflix-nareshchandu.vercel.app'),
  title: {
    default: "MovieFlix | Premium Streaming",
    template: "%s | MovieFlix",
  },
  description: "Your ultimate movie and series destination. Watch parties, AI insights, and personalized recommendations.",
  openGraph: {
    title: "MovieFlix | Premium Streaming",
    description: "Your ultimate movie and series destination. Watch parties, AI insights, and personalized recommendations.",
    url: "/",
    siteName: "MovieFlix",
    images: [
      {
        url: "/og-image.jpg", // Placeholder for a real OG image you can add later
        width: 1200,
        height: 630,
        alt: "MovieFlix Premium Streaming Experience",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieFlix | Premium Streaming",
    description: "Your ultimate movie and series destination. Watch parties, AI insights, and personalized recommendations.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="app-bg-enhanced">
        <Providers>
          <ProfileLoadingProvider>
            <ProfileProvider>
              <ProfileLoadingBlocker />
              <RoomProvider>
                <SearchProvider>
                  <WatchHistoryProvider>
                    <ClientLayout>{children}</ClientLayout>
                  </WatchHistoryProvider>
                </SearchProvider>
              </RoomProvider>
            </ProfileProvider>
          </ProfileLoadingProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
