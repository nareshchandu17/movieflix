import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: String, required: true }, // ID of Movie or Series
    text: { type: String, required: true, maxlength: 1000 },
    likes: { type: Number, default: 0 },
    replies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ contentId: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
