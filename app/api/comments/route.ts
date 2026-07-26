import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import Comment from "@/features/social/models/Comment";
import mongoose from "mongoose";
import { csrfProtection } from "@/lib/csrf";
import { formatDistanceToNowStrict } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");
    const parentId = searchParams.get("parentId") || null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sort = searchParams.get("sort") || "newest";

    if (!contentId) {
      return NextResponse.json({ message: "Missing contentId" }, { status: 400 });
    }

    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const matchStage: any = { contentId };
    if (parentId) {
      matchStage.parentId = new mongoose.Types.ObjectId(parentId);
    } else {
      matchStage.parentId = null;
    }

    const pipeline: any[] = [{ $match: matchStage }];

    // Add fields for sorting and mapping
    pipeline.push({
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likedBy", []] } },
        dislikesCount: { $size: { $ifNull: ["$dislikedBy", []] } },
      }
    });

    if (sort === "top") {
      pipeline.push({ $sort: { likesCount: -1, createdAt: -1 } });
    } else if (sort === "oldest") {
      pipeline.push({ $sort: { createdAt: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Lookup user
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "authorDetails"
      }
    });
    pipeline.push({ $unwind: "$authorDetails" });

    // Lookup reply count
    pipeline.push({
      $lookup: {
        from: "comments",
        let: { commentId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$parentId", "$$commentId"] }, isDeleted: false } }
        ],
        as: "repliesData"
      }
    });
    pipeline.push({
      $addFields: {
        replyCount: { $size: "$repliesData" }
      }
    });

    const comments = await Comment.aggregate(pipeline);

    // Map to UI-friendly DTO
    const dtos = comments.map(c => {
      const isLiked = currentUserId ? (c.likedBy || []).some((id: any) => id.toString() === currentUserId.toString()) : false;
      const isDisliked = currentUserId ? (c.dislikedBy || []).some((id: any) => id.toString() === currentUserId.toString()) : false;
      
      let text = c.text;
      if (c.isDeleted) {
        text = "[This comment was deleted]";
      }

      return {
        id: c._id.toString(),
        movieId: c.contentId,
        parentId: c.parentId ? c.parentId.toString() : null,
        author: c.authorDetails?.name || "Anonymous",
        avatar: c.authorDetails?.avatar?.[0] || "A", // Assuming avatar is array or string
        verified: false, // Future feature
        text,
        likes: c.likesCount,
        dislikes: c.dislikesCount,
        isLiked,
        isDisliked,
        replyCount: c.replyCount,
        isDeleted: c.isDeleted,
        createdAt: c.createdAt,
        createdAtRelative: formatDistanceToNowStrict(new Date(c.createdAt), { addSuffix: true }),
        isOwnComment: currentUserId === c.userId.toString()
      };
    });

    return NextResponse.json({ comments: dtos }, { status: 200 });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { contentId, text, parentId } = await req.json();

    if (!contentId || !text) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const newComment = await Comment.create({
      userId: session.user.id,
      contentId,
      text,
      parentId: parentId || null
    });

    await newComment.populate("userId", "name avatar");
    
    // Return a DTO for the new comment
    const dto = {
      id: newComment._id.toString(),
      movieId: newComment.contentId,
      parentId: newComment.parentId ? newComment.parentId.toString() : null,
      author: newComment.userId?.name || "Anonymous",
      avatar: newComment.userId?.avatar?.[0] || "A",
      verified: false,
      text: newComment.text,
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replyCount: 0,
      isDeleted: false,
      createdAt: newComment.createdAt,
      createdAtRelative: "Just now",
      isOwnComment: true
    };

    return NextResponse.json({ message: "Comment added", comment: dto }, { status: 201 });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ message: "Failed to add comment" }, { status: 500 });
  }
}
