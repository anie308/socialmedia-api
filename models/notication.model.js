const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["friendRequest", "postLike", "postComment", "postShare", "post"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sourceUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Reference to the Post model
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
