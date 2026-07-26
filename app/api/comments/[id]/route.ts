import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import Comment from "@/features/social/models/Comment";

export async function DELETE(
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

    await connectDB();

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    // Verify ownership
    if (comment.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You can only delete your own comments" }, { status: 403 });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Comments DELETE error:", error);
    return NextResponse.json({ message: "Failed to delete comment" }, { status: 500 });
  }
}
