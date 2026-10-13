import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import Campaign from "../models/Campaign";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";

const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(150),
  platform: z.enum(["Instagram", "YouTube"]),
  totalBudget: z.number().finite().positive(),
  milestones: z
    .array(
      z.object({
        views: z.number().int().positive(),
        payout: z.number().finite().nonnegative(),
      })
    )
    .min(1),
});

export async function createCampaign(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;

    const parsed = createCampaignSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { name, platform, totalBudget, milestones } = parsed.data;

    // Validate the milestone ladder before saving.
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].payout > totalBudget) {
        throw new ApiError(
          400,
          "A milestone payout cannot exceed the campaign budget"
        );
      }

      if (
        i > 0 &&
        milestones[i].views <= milestones[i - 1].views
      ) {
        throw new ApiError(
          400,
          "Milestone view thresholds must be strictly increasing"
        );
      }

      if (
        i > 0 &&
        milestones[i].payout < milestones[i - 1].payout
      ) {
        throw new ApiError(
          400,
          "Milestone payouts must be non-decreasing"
        );
      }
    }

    const campaign = await Campaign.create({
      name,
      platform,
      totalBudget,
      spentBudget: 0,
      milestones,
      brandId: new Types.ObjectId(authReq.user!.id),
    });

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign: {
        id: campaign._id,
        name: campaign.name,
        platform: campaign.platform,
        totalBudget: campaign.totalBudget,
        spentBudget: campaign.spentBudget,
        remainingBudget:
          campaign.totalBudget - campaign.spentBudget,
        milestones: campaign.milestones,
        status: campaign.status,
        brandId: campaign.brandId,
        createdAt: campaign.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLiveCampaigns(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const campaigns = await Campaign.find({ status: "live" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map((campaign) => ({
        ...campaign,
        remainingBudget:
          campaign.totalBudget - campaign.spentBudget,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyCampaigns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;

    const campaigns = await Campaign.find({
      brandId: authReq.user!.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map((campaign) => ({
        ...campaign,
        remainingBudget:
          campaign.totalBudget - campaign.spentBudget,
      })),
    });
  } catch (error) {
    next(error);
  }
}
