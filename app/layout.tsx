import "@/lib/dns-init";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "@/lib/env-validation"; // Validate environment variables at startup
import ClientLayout from "./ClientLayout";
import { RoomProvider } from "@/contexts/RoomContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { WatchHistoryProvider } from "@/contexts/WatchHistoryContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ProfileLoadingProvider } from "@/contexts/ProfileLoadingContext";
import ProfileLoadingBlocker from "@/components/ProfileLoadingBlocker";
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
