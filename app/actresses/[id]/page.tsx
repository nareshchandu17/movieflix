import { Metadata } from "next";
import ActressDetailPage from "@/components/actresses/ActressDetailPage";

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Actress Details | Cineworld",
  description: "Explore detailed information about your favorite actresses, including their filmography, biography, and career highlights.",
  openGraph: {
    title: "Actress Details | Cineworld",
    description: "Discover comprehensive details about talented actresses from around the world.",
    type: "website",
  },
};

export default function ActressDetailPageRoute({ params }: PageProps) {
  // In a real app, you'd fetch the actress name by ID
  // For now, we'll pass the ID as the name
  return <ActressDetailPage actressName={params.id} />;
}
