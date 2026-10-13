
import { Router } from "express";

import {
  createSubmission,
  getMySubmissions,
  updateSubmissionViewsController,
} from "../controllers/submission.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";


const router = Router();

router.get(
  "/mine",
  authenticate,
  authorize("creator"),
  getMySubmissions
);

router.post(
  "/",
  authenticate,
  authorize("creator"),
  createSubmission
);
router.patch(
  "/:id/views",
  authenticate,
  updateSubmissionViewsController
);

export default router;
