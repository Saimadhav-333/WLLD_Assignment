
import mongoose from "mongoose";
import Submission from "../models/Submission";
import Campaign from "../models/Campaign";
import { ApiError } from "../utils/ApiError";

// Import used by the TESTING / REUSABLE CALCULATION approach
import { calculatePayout } from "../utils/payout.utils";

interface UpdateViewsInput {
  submissionId: string;
  views: number;
}

export async function updateSubmissionViews({
  submissionId,
  views,
}: UpdateViewsInput) {
  if (!mongoose.isValidObjectId(submissionId)) {
    throw new ApiError(400, "Invalid submission ID");
  }

  if (!Number.isSafeInteger(views) || views < 0) {
    throw new ApiError(400, "Views must be a non-negative safe integer");
  }

  const session = await mongoose.startSession();

  try {
    let result: Record<string, unknown> | undefined;

    await session.withTransaction(async () => {
      const submission = await Submission.findById(submissionId).session(
        session
      );

      if (!submission) {
        throw new ApiError(404, "Submission not found");
      }

      if (views < submission.views) {
        throw new ApiError(400, "Views cannot decrease");
      }

      const campaign = await Campaign.findById(
        submission.campaignId
      ).session(session);

      if (!campaign) {
        throw new ApiError(404, "Campaign not found");
      }

      const remainingBudget = Math.max(
        0,
        campaign.totalBudget - campaign.spentBudget
      );

      // =========================================================
      // API LOGIC - OPTION 1: ORIGINAL PAYOUT CALCULATION
      // Keep this block enabled OR use Option 2 below, not both.
      // =========================================================

      /*
      const reachedMilestones = campaign.milestones.filter(
        (milestone) => views >= milestone.views
      );

      const targetPayout =
        reachedMilestones.length > 0
          ? reachedMilestones[reachedMilestones.length - 1].payout
          : 0;

      const additionalPayout = Math.min(
        Math.max(0, targetPayout - submission.payout),
        remainingBudget
      );

      const newPayout = submission.payout + additionalPayout;

      let payoutStatus: "pending" | "paid" | "unfunded";

      if (targetPayout === 0) {
        payoutStatus = "pending";
      } else if (newPayout >= targetPayout) {
        payoutStatus = "paid";
      } else {
        payoutStatus = "unfunded";
      }
      */

      // =========================================================
      // TESTING / REUSABLE CALCULATION - OPTION 2
      // Uses payout.utils.ts, which Jest tests independently.
      // Keep this block enabled OR use Option 1 above, not both.
      // =========================================================

      const payoutCalculation = calculatePayout(
        views,
        campaign.milestones,
        submission.payout,
        remainingBudget
      );

      const {
        targetPayout,
        additionalPayout,
        newPayout,
        payoutStatus,
      } = payoutCalculation;

      // =========================================================
      // API LOGIC - BUDGET UPDATE
      // Keep this section enabled for BOTH options.
      // =========================================================

      if (additionalPayout > 0) {
        const budgetUpdate = await Campaign.updateOne(
          {
            _id: campaign._id,
            $expr: {
              $lte: [
                { $add: ["$spentBudget", additionalPayout] },
                "$totalBudget",
              ],
            },
          },
          {
            $inc: { spentBudget: additionalPayout },
          },
          { session }
        );

        if (budgetUpdate.modifiedCount !== 1) {
          throw new ApiError(
            409,
            "Campaign budget changed. Please retry the request."
          );
        }
      }

      // =========================================================
      // API LOGIC - SAVE SUBMISSION
      // Keep this section enabled for BOTH options.
      // =========================================================

      submission.views = views;
      submission.payout = newPayout;
      submission.payoutStatus = payoutStatus;
      submission.lastUpdatedAt = new Date();

      await submission.save({ session });

      // =========================================================
      // API RESPONSE DATA
      // Keep this section enabled for BOTH options.
      // =========================================================

      result = {
        submissionId: String(submission._id),
        campaignId: String(campaign._id),
        views: submission.views,
        targetPayout,
        payout: submission.payout,
        payoutStatus: submission.payoutStatus,
        campaignSpentBudget: campaign.spentBudget + additionalPayout,
        campaignRemainingBudget:
          campaign.totalBudget -
          campaign.spentBudget -
          additionalPayout,
        additionalPayout,
      };
    });

    if (!result) {
      throw new ApiError(500, "Could not update submission");
    }

    return result;
  } finally {
    await session.endSession();
  }
}
