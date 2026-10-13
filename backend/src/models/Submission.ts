
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISubmission extends Document {
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
  postUrl: string;
  views: number;
  payout: number;
  payoutStatus: "paid" | "unfunded" | "pending";
  lastUpdatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    postUrl: {
      type: String,
      required: [true, "Post URL is required"],
      trim: true,
      validate: {
        validator: (value: string) => {
          try {
            const url = new URL(value);

            return (
              url.protocol === "https:" &&
              (
                url.hostname === "instagram.com" ||
                url.hostname.endsWith(".instagram.com") ||
                url.hostname === "youtube.com" ||
                url.hostname.endsWith(".youtube.com") ||
                url.hostname === "youtu.be"
              )
            );
          } catch {
            return false;
          }
        },
        message: "Provide a valid HTTPS Instagram or YouTube URL",
      },
    },

    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
      validate: {
        validator: Number.isSafeInteger,
        message: "Views must be a safe integer",
      },
    },

    payout: {
      type: Number,
      default: 0,
      min: [0, "Payout cannot be negative"],
    },

    payoutStatus: {
      type: String,
      enum: ["paid", "unfunded","pending"],
      default: "pending",
      required: true,
    },

    lastUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ creatorId: 1, createdAt: -1 });
submissionSchema.index({ campaignId: 1, creatorId: 1 });

const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);

export default Submission;
