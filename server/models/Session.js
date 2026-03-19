const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Responder is required"],
    },
    skillRequested: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Requested skill is required"],
    },
    skillOffered: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Offered skill is required"],
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration in hours is required"],
      min: [0.5, "Minimum session duration is 0.5 hours"],
      max: [8, "Maximum session duration is 8 hours"],
    },
    format: {
      type: String,
      required: [true, "Session format is required"],
      enum: {
        values: ["In-Person", "Video", "Async"],
        message: "{VALUE} is not a valid format",
      },
    },
    status: {
      type: String,
      default: "Pending",
      enum: {
        values: ["Pending", "Accepted", "Declined", "Cancelled", "Completed"],
        message: "{VALUE} is not a valid status",
      },
    },
    feedback: {
      requesterFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 },
      },
      responderFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent requester from swapping with themselves
sessionSchema.pre("validate", function (next) {
  if (this.requester && this.responder && this.requester.equals(this.responder)) {
    return next(new Error("You cannot create a session with yourself"));
  }
  next();
});

module.exports = mongoose.model("Session", sessionSchema);
