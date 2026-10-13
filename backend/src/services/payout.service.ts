import mongoose from "mongoose";
import Submission from "../models/Submission";
import Campaign from "../models/Campaign";
import { ApiError } from "../utils/ApiError";

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

      // Determine the highest milestone reached.
      const reachedMilestones = campaign.milestones.filter(
        (milestone) => views >= milestone.views
      );

      const targetPayout =
        reachedMilestones.length > 0
          ? reachedMilestones[reachedMilestones.length - 1].payout
          : 0;

      // Do not allocate the same payout twice.
      const remainingBudget = Math.max(
        0,
        campaign.totalBudget - campaign.spentBudget
      );

      const additionalPayout = Math.min(
        Math.max(0, targetPayout - submission.payout),
        remainingBudget
      );

      const newPayout = submission.payout + additionalPayout;

      // The campaign budget can only increase by the newly allocated amount.
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
          // Abort the transaction rather than risk exceeding the budget.
          throw new ApiError(
            409,
            "Campaign budget changed. Please retry the request."
          );
        }
      }

      submission.views = views;
      submission.payout = newPayout;
      submission.lastUpdatedAt = new Date();

      if (targetPayout === 0) {
        submission.payoutStatus = "pending";
      } else if (newPayout >= targetPayout) {
        submission.payoutStatus = "paid";
      } else {
        submission.payoutStatus = "unfunded";
      }

      await submission.save({ session });

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
