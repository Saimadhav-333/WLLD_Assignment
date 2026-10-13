import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import Submission from "../models/Submission";
import Campaign from "../models/Campaign";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { updateSubmissionViews } from "../services/payout.service";

const createSubmissionSchema = z.object({
  campaignId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid campaign ID"),
  postUrl: z.string().trim().url("Provide a valid post URL"),
});

export async function createSubmission(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createSubmissionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { campaignId, postUrl } = parsed.data;
    const creatorId = req.user!.id;

    // Find a campaign that is currently accepting submissions.
    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: "live",
    });

    if (!campaign) {
      throw new ApiError(404, "Live campaign not found");
    }

    if (campaign.spentBudget >= campaign.totalBudget) {
      throw new ApiError(400, "Campaign budget has been exhausted");
    }

    // Prevent the same creator from submitting twice to one campaign.
    const existingSubmission = await Submission.findOne({
      campaignId,
      creatorId,
    });

    if (existingSubmission) {
      throw new ApiError(
        409,
        "You have already submitted a post for this campaign"
      );
    }

    const submission = await Submission.create({
      campaignId: new Types.ObjectId(campaignId),
      creatorId: new Types.ObjectId(creatorId),
      postUrl,
      views: 0,
      payout: 0,
      payoutStatus: "pending",
      lastUpdatedAt: null,
    });

    res.status(201).json({
      success: true,
      message: "Post submitted successfully",
      submission: {
        id: submission._id,
        campaignId: submission.campaignId,
        creatorId: submission.creatorId,
        postUrl: submission.postUrl,
        views: submission.views,
        payout: submission.payout,
        payoutStatus: submission.payoutStatus,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}


export async function getMySubmissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const creatorId = req.user!.id;

    const submissions = await Submission.find({ creatorId })
      .populate({
        path: "campaignId",
        select: "name platform totalBudget spentBudget milestones status",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedSubmissions = submissions.map((submission) => {
      const campaign = submission.campaignId;

      // A campaign might have been deleted after submission.
      if (!campaign || !("totalBudget" in campaign)) {
        return {
          ...submission,
          campaign: null,
          remainingBudget: null,
        };
      }

      // Convert the populated reference into a plain object
      // so TypeScript can safely access its fields.
      const campaignData = campaign as unknown as {
        _id: unknown;
        name: string;
        platform: string;
        totalBudget: number;
        spentBudget: number;
        milestones: Array<{ views: number; payout: number }>;
        status: string;
      };

      return {
        ...submission,
        campaign: campaignData,
        remainingBudget:
          campaignData.totalBudget - campaignData.spentBudget,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedSubmissions.length,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    next(error);
  }
}



export async function updateSubmissionViewsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = z
      .object({
        views: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const submissionId = req.params.id;

    if (typeof submissionId !== "string") {
    throw new ApiError(400, "Invalid submission ID");
    }

    const result = await updateSubmissionViews({
    submissionId,
    views: parsed.data.views,
    });

    res.status(200).json({
      success: true,
      message: "Submission views updated successfully",
      submission: result,
    });
  } catch (error) {
    next(error);
  }
}

