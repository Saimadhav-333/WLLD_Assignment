
import mongoose, { Document, Schema, Types } from "mongoose";

export type CampaignPlatform = "Instagram" | "YouTube";

export type CampaignStatus = "live" | "paused" | "completed";

export interface IMilestone {
  views: number;
  payout: number;
}

export interface ICampaign extends Document {
  name: string;
  platform: CampaignPlatform;
  totalBudget: number;
  spentBudget: number;
  milestones: IMilestone[];
  status: CampaignStatus;
  brandId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    views: {
      type: Number,
      required: true,
      min: [1, "View threshold must be positive"],
    },
    payout: {
      type: Number,
      required: true,
      min: [0, "Payout cannot be negative"],
    },
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    platform: {
      type: String,
      enum: ["Instagram", "YouTube"],
      required: true,
    },

    totalBudget: {
      type: Number,
      required: true,
      min: [1, "Budget must be positive"],
    },

    spentBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    milestones: {
      type: [milestoneSchema],
      required: true,
      validate: {
        validator: (milestones: IMilestone[]) => {
          if (milestones.length === 0) return false;

          for (let i = 0; i < milestones.length; i++) {
            const current = milestones[i];

            if (
              i > 0 &&
              current.views <= milestones[i - 1].views
            ) {
              return false;
            }

            if (
              i > 0 &&
              current.payout < milestones[i - 1].payout
            ) {
              return false;
            }
          }

          return true;
        },
        message:
          "Milestones must have strictly increasing view thresholds and non-decreasing payouts",
      },
    },

    status: {
      type: String,
      enum: ["live", "paused", "completed"],
      default: "live",
      required: true,
    },

    brandId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.index({ status: 1, createdAt: -1 });

const Campaign = mongoose.model<ICampaign>(
  "Campaign",
  campaignSchema
);

export default Campaign;
