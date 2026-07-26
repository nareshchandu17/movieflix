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

export const metadata = {
  title: "MovieFlix",
  description: "Your ultimate movie and series destination",
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
