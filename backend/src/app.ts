import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { authenticate } from "./middleware/auth.middleware";
import { AuthenticatedRequest } from "./middleware/auth.middleware";
import campaignRoutes from "./routes/campaign.routes";
import submissionRoutes from "./routes/submission.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Meme'd Payout Tracker API is running",
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);

app.get("/api/auth/me", authenticate, (req, res) => {
  const authReq = req as AuthenticatedRequest;

  res.status(200).json({
    success: true,
    user: authReq.user,
  });
});

app.use(errorHandler);


export default app;
