import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: String, required: true }, // ID of Movie or Series
    text: { type: String, required: true, maxlength: 1000 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ contentId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
