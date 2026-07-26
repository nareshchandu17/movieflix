import { Metadata } from "next";
import ActressDetailPage from "@/features/movie/components/actresses/ActressDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Actress Details | MovieFlix",
  description: "Explore detailed information about your favorite actresses, including their filmography, biography, and career highlights.",
  openGraph: {
    title: "Actress Details | MovieFlix",
    description: "Discover comprehensive details about talented actresses from around the world.",
    type: "website",
  },
};

export default async function ActressDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  // In a real app, you'd fetch the actress name by ID
  // For now, we'll pass the ID as the name
  return <ActressDetailPage actressName={id} />;
}
