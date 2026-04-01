import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import type { Session } from "next-auth";

// GET comments for a specific content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json({ message: "Missing contentId" }, { status: 400 });
    }

    await connectDB();

    const comments = await Comment.find({ contentId })
      .populate("userId", "name avatar")
      .populate("replies.userId", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST a new comment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { contentId, text } = await req.json();

    if (!contentId || !text) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const newComment = await Comment.create({
      userId: session.user.id,
      contentId,
      text,
    });

    const populatedComment = await newComment.populate("userId", "name avatar");

    return NextResponse.json({ message: "Comment added", comment: populatedComment }, { status: 201 });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ message: "Failed to add comment" }, { status: 500 });
  }
}
