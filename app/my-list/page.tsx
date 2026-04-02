import { Metadata } from "next";
import MyListClient from "@/components/my-list/MyListClient";

export const metadata: Metadata = {
  title: "My List - Movieflix",
  description: "Your personal watchlist with AI-powered recommendations and smart collections",
};

export default function MyListPage() {
  return <MyListClient />;
}
