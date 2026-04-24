import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ReactionClip from "@/models/ReactionClip";
import { uploadReactionVideo } from "@/lib/cloudinary";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("[Reaction] POST request received");
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.error("[Reaction] Unauthorized: No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    if (!currentUserId) {
      console.error("[Reaction] Unauthorized: No user ID in session");
      return NextResponse.json({ message: "User profile not found" }, { status: 401 });
    }

    const formData = await req.formData();
    const reactionVideoFile = formData.get("video") as File;
    const movieId = formData.get("movieId") as string;
    const movieTimestampStr = formData.get("movieTimestamp") as string;
    const moodEmoji = formData.get("moodEmoji") as string;
    const visibility = (formData.get("visibility") as string) || "public";

    const movieTimestamp = parseFloat(movieTimestampStr);

    console.log(`[Reaction] Metadata: user=${currentUserId}, movie=${movieId}, time=${movieTimestamp}, mood=${moodEmoji}`);
    console.log(`[Reaction] Video file present: ${!!reactionVideoFile}, size: ${reactionVideoFile?.size} bytes`);

    if (!reactionVideoFile || reactionVideoFile.size === 0 || !movieId || isNaN(movieTimestamp) || !moodEmoji) {
      console.error("[Reaction] Missing or invalid fields", { 
        hasVideo: !!reactionVideoFile,
        videoSize: reactionVideoFile?.size,
        movieId, 
        movieTimestamp, 
        moodEmoji 
      });
      return NextResponse.json({ message: "Invalid or missing required fields" }, { status: 400 });
    }

    // 1. Connect to DB
    await connectDB();

    // 2. Convert File to Buffer
    const arrayBuffer = await reactionVideoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      console.error("[Reaction] Received empty video file");
      return NextResponse.json({ message: "Video file is empty" }, { status: 400 });
    }

    // 3. Convert to CLEAN Data URI (no complex mime metadata) 
    const base64String = buffer.toString("base64");
    const cleanDataUri = `data:video/webm;base64,${base64String}`;

    console.log(`[Reaction] Uploading to Cloudinary (${buffer.length} bytes)...`);
    const cloudinaryResponse = await uploadReactionVideo(cleanDataUri);

    // 4. Save to MongoDB
    console.log("[Reaction] Saving to MongoDB...");
    try {
      const reaction = await ReactionClip.create({
        userId: currentUserId,
        movieId,
        videoUrl: cloudinaryResponse.videoUrl,
        thumbnailUrl: cloudinaryResponse.thumbnailUrl,
        movieTimestamp: Math.round(movieTimestamp),
        moodEmoji,
        visibility,
        duration: cloudinaryResponse.duration || 0,
        likesCount: 0,
        sharesCount: 0,
      });

      console.log("[Reaction] Successfully created:", reaction._id);

      return NextResponse.json({ 
        success: true, 
        reaction 
      }, { status: 201 });
    } catch (dbError: any) {
      console.error("[Reaction] MongoDB Save Error:", dbError);
      return NextResponse.json({ 
        message: "Database save failed", 
        error: dbError.message || "Unknown database error"
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[Reaction] Global Error:", error);
    return NextResponse.json({ 
      message: "An unexpected error occurred", 
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}
