import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import ClientLayout from "./ClientLayout";
import { RoomProvider } from "@/contexts/RoomContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { WatchHistoryProvider } from "@/contexts/WatchHistoryContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ProfileLoadingProvider } from "@/contexts/ProfileLoadingContext";
import ProfileLoadingBlocker from "@/components/ProfileLoadingBlocker";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className + " app-bg-enhanced"}>
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
      </body>
    </html>
  );
}
