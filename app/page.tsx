import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Movieflix - Watch Movies & TV Shows Online",
  description:
    "Browse all movies and tv shows currently available on Movieflix. Find trending, top-rated, and new releases.",
};

export default function HomePage() {
  return <HomeClient />;
}