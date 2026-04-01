import { Metadata } from "next";
import ActressesPage from "@/components/actresses/ActressesPage";

export const metadata: Metadata = {
  title: "Great Actresses Collection | MovieFlix",
  description: "Explore the most talented and influential actresses who have shaped cinema history. From legendary performances to modern icons.",
  openGraph: {
    title: "Great Actresses Collection | MovieFlix",
    description: "Discover the faces that bring stories to life in our premium actresses collection.",
    type: "website",
  },
};

export default function ActressesPageRoute() {
  return <ActressesPage />;
}
