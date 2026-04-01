import { Metadata } from "next";
import ActorsPage from "@/components/actors/ActorsPage";

export const metadata: Metadata = {
  title: "Great Actors Collection | Cineworld",
  description: "Explore the most talented and influential actors who have shaped cinema history. From legendary performances to modern icons.",
  openGraph: {
    title: "Great Actors Collection | Cineworld",
    description: "Discover the faces that bring stories to life in our premium actors collection.",
    type: "website",
  },
};

export default function ActorsPageRoute() {
  return <ActorsPage />;
}
