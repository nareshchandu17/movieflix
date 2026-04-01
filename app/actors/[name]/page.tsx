import { Metadata } from "next";
import ActorDetailPage from "@/components/actors/ActorDetailPage";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  return {
    title: `${params.name} - Actor Details | Cineworld`,
    description: `Explore complete filmography and career details of ${params.name}. View movies, biography, and personal information.`,
    openGraph: {
      title: `${params.name} - Actor Details | Cineworld`,
      description: `Complete filmography and career details of ${params.name}. View movies, biography, and personal information.`,
      type: "website",
    },
  };
}

export default function ActorPage({ params }: { params: { name: string } }) {
  return <ActorDetailPage actorName={params.name} />;
}
