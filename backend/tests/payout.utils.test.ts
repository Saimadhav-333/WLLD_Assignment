
import { calculatePayout } from "../src/utils/payout.utils";

const milestones = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 5000 },
];

describe("calculatePayout", () => {
  test("returns pending when no milestone is reached", () => {
    const result = calculatePayout(5000, milestones, 0, 10000);

    expect(result).toEqual({
      targetPayout: 0,
      additionalPayout: 0,
      newPayout: 0,
      payoutStatus: "pending",
    });
  });

  test("calculates the first milestone payout", () => {
    const result = calculatePayout(10000, milestones, 0, 10000);

    expect(result.targetPayout).toBe(500);
    expect(result.additionalPayout).toBe(500);
    expect(result.newPayout).toBe(500);
    expect(result.payoutStatus).toBe("paid");
  });

  test("selects the highest milestone reached", () => {
    const result = calculatePayout(70000, milestones, 500, 10000);

    expect(result.targetPayout).toBe(2000);
    expect(result.additionalPayout).toBe(1500);
    expect(result.newPayout).toBe(2000);
    expect(result.payoutStatus).toBe("paid");
  });

  test("does not pay twice for an already-funded milestone", () => {
    const result = calculatePayout(70000, milestones, 2000, 8000);

    expect(result.additionalPayout).toBe(0);
    expect(result.newPayout).toBe(2000);
    expect(result.payoutStatus).toBe("paid");
  });

  test("allocates only the remaining campaign budget", () => {
    const result = calculatePayout(100000, milestones, 0, 500);

    expect(result.targetPayout).toBe(5000);
    expect(result.additionalPayout).toBe(500);
    expect(result.newPayout).toBe(500);
    expect(result.payoutStatus).toBe("unfunded");
  });

  test("does not allocate a negative additional payout", () => {
    const result = calculatePayout(10000, milestones, 1000, 5000);

    expect(result.additionalPayout).toBe(0);
    expect(result.newPayout).toBe(1000);
  });

  test("does not allocate more than the remaining budget", () => {
    const result = calculatePayout(100000, milestones, 2000, 3000);

    expect(result.additionalPayout).toBe(3000);
    expect(result.newPayout).toBe(5000);
    expect(result.payoutStatus).toBe("paid");
  });
});
