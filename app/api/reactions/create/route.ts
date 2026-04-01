import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ReactionClip from "@/models/ReactionClip";
import { uploadReactionVideo } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const videoFile = formData.get("video") as File;
    const movieId = formData.get("movieId") as string;
    const movieTimestamp = parseFloat(formData.get("movieTimestamp") as string);
    const moodEmoji = formData.get("moodEmoji") as string;
    const visibility = formData.get("visibility") as "public" | "private";

    if (!videoFile || !movieId || isNaN(movieTimestamp) || !moodEmoji) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Connect to DB
    await connectDB();

    // 2. Convert File to Buffer for Cloudinary
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to Cloudinary
    const cloudinaryResponse = await uploadReactionVideo(buffer);

    // 4. Save to MongoDB
    const reaction = await ReactionClip.create({
      userId: (session.user as any).id,
      movieId: movieId,
      videoUrl: cloudinaryResponse.videoUrl,
      thumbnailUrl: cloudinaryResponse.thumbnailUrl,
      movieTimestamp: Math.round(movieTimestamp),
      moodEmoji: moodEmoji,
      visibility: visibility || "public",
      duration: cloudinaryResponse.duration || 0,
      likesCount: 0,
      sharesCount: 0,
    });

    return NextResponse.json({ 
      success: true, 
      reaction 
    }, { status: 201 });

  } catch (error) {
    console.error("Reaction creation error:", error);
    return NextResponse.json({ 
      message: "Failed to create reaction", 
      error: (error as any).message 
    }, { status: 500 });
  }
}
