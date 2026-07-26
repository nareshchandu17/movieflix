import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import Comment from "@/features/social/models/Comment";
import { csrfProtection } from "@/lib/csrf";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing comment id" }, { status: 400 });
    }

    const { type } = await req.json(); // 'like' | 'dislike'

    if (!['like', 'dislike'].includes(type)) {
      return NextResponse.json({ message: "Invalid reaction type" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    let updateOp = {};

    if (type === 'like') {
      const hasLiked = comment.likedBy.some((uid: any) => uid.toString() === userId.toString());
      if (hasLiked) {
        updateOp = { $pull: { likedBy: userId } };
      } else {
        updateOp = { 
          $addToSet: { likedBy: userId },
          $pull: { dislikedBy: userId }
        };
      }
    } else if (type === 'dislike') {
      const hasDisliked = comment.dislikedBy.some((uid: any) => uid.toString() === userId.toString());
      if (hasDisliked) {
        updateOp = { $pull: { dislikedBy: userId } };
      } else {
        updateOp = { 
          $addToSet: { dislikedBy: userId },
          $pull: { likedBy: userId }
        };
      }
    }

    await Comment.findByIdAndUpdate(id, updateOp);

    return NextResponse.json({ message: "Reaction updated" }, { status: 200 });
  } catch (error) {
    console.error("Comments REACTION error:", error);
    return NextResponse.json({ message: "Failed to update reaction" }, { status: 500 });
  }
}
