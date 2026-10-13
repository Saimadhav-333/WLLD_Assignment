import { Router } from "express";

import {
  createCampaign,
  getLiveCampaigns,
  getMyCampaigns,
  updateCampaignStatus,
} from "../controllers/campaign.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

// Specific routes must be registered before any "/:id" route.
router.get(
  "/mine",
  authenticate,
  authorize("brand"),
  getMyCampaigns
);

router.get(
  "/",
  authenticate,
  getLiveCampaigns
);

router.post(
  "/",
  authenticate,
  authorize("brand"),
  createCampaign
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("brand"),
  updateCampaignStatus
);

export default router;
