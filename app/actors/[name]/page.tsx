import { Metadata } from "next";
import ActorDetailPage from "@/features/movie/components/actors/ActorDetailPage";

interface ActorPageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: ActorPageProps): Promise<Metadata> {
  const { name } = await params;

  return {
    title: `${name} - Actor Details | MovieFlix`,
    description: `Explore complete filmography and career details of ${name}. View movies, biography, and personal information.`,
    openGraph: {
      title: `${name} - Actor Details | MovieFlix`,
      description: `Complete filmography and career details of ${name}. View movies, biography, and personal information.`,
      type: "website",
    },
  };
}

export default async function ActorPage({ params }: ActorPageProps) {
  const { name } = await params;
  return <ActorDetailPage actorName={name} />;
}
