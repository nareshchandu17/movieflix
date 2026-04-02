import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { PlayerRoot } from "@/components/player/PlayerRoot";

// Mock movie data - replace with actual data fetching
async function getMovieData(id: string) {
  try {
    // In a real app, you'd fetch from your database or API
    // const response = await fetch(`${process.env.NEXTAUTH_URL}/api/movies/${id}`);
    // return await response.json();
    
    // For now, return mock data
    return {
      id,
      title: `Movie ${id}`,
      description: "A great movie to watch",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: "/ancient-secrets.jpg"
    };
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  // Allow guest access - no mandatory redirection to /login

  // Unwrap params Promise in Next.js 15+
  const { id } = await params;
  const movieData = await getMovieData(id);
  
  // Return 404 if movie not found
  if (!movieData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <PlayerRoot 
        contentId={id}
        url={movieData.videoUrl}
        title={movieData.title}
        type="movie"
      />
    </div>
  );
}
