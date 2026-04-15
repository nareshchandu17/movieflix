import { Metadata } from "next";
import { redirect } from "next/navigation";
import HomePage from "@/components/HomeClient";
import { getServerSideProfileState } from "@/lib/server-side-profile";

export const metadata: Metadata = {
  title: "Movieflix - Watch Movies & TV Shows Online",
  description:
    "Browse all movies and tv shows currently available on Movieflix. Find trending, top-rated, and new releases.",
};

export default async function Page() {
  // Server-side profile check to prevent flicker
  const profileState = await getServerSideProfileState();
  
  // If authenticated but needs profile selection, redirect immediately
  if (profileState.isAuthenticated && profileState.needsProfileSelection) {
    redirect('/profiles/select');
  }
  
  // If not authenticated, let the client handle login flow
  return <HomePage serverProfileState={profileState} />;
}
