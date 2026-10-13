export interface PayoutMilestone {
  views: number;
  payout: number;
}

export interface PayoutCalculation {
  targetPayout: number;
  additionalPayout: number;
  newPayout: number;
  payoutStatus: "pending" | "paid" | "unfunded";
}

export function calculatePayout(
  views: number,
  milestones: PayoutMilestone[],
  currentPayout: number,
  remainingBudget: number
): PayoutCalculation {
  const reachedMilestones = milestones.filter(
    (milestone) => views >= milestone.views
  );

  const targetPayout =
    reachedMilestones.length > 0
      ? reachedMilestones[reachedMilestones.length - 1].payout
      : 0;

  const additionalPayout = Math.min(
    Math.max(0, targetPayout - currentPayout),
    Math.max(0, remainingBudget)
  );

  const newPayout = currentPayout + additionalPayout;

  let payoutStatus: "pending" | "paid" | "unfunded";

  if (targetPayout === 0) {
    payoutStatus = "pending";
  } else if (newPayout >= targetPayout) {
    payoutStatus = "paid";
  } else {
    payoutStatus = "unfunded";
  }

  return {
    targetPayout,
    additionalPayout,
    newPayout,
    payoutStatus,
  };
}
