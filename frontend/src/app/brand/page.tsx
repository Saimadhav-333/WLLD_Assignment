
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, clearAuth, getAuthToken } from "@/lib/api";

type Milestone = {
  views: number;
  payout: number;
};

type Campaign = {
  _id?: string;
  id?: string;
  name: string;
  platform: "Instagram" | "YouTube";
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestones: Milestone[];
  status: "live" | "paused" | "completed";
  createdAt?: string;
};

type CampaignResponse = {
  success: boolean;
  count: number;
  campaigns: Campaign[];
};

type CreateCampaignResponse = {
  success: boolean;
  message: string;
  campaign: Campaign;
};

const initialMilestones: Milestone[] = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 5000 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BrandDashboard() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] =
    useState<"Instagram" | "YouTube">("Instagram");
  const [totalBudget, setTotalBudget] = useState("10000");
  const [milestones, setMilestones] =
    useState<Milestone[]>(initialMilestones);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCampaigns = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const result = await apiRequest<CampaignResponse>(
        "/api/campaigns/mine",
        { token }
      );

      setCampaigns(result.campaigns);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load campaigns";

      if (
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("authentication")
      ) {
        clearAuth();
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  function updateMilestone(
    index: number,
    field: keyof Milestone,
    value: string
  ) {
    setMilestones((current) =>
      current.map((milestone, i) =>
        i === index
          ? { ...milestone, [field]: value === "" ? 0 : Number(value) }
          : milestone
      )
    );
  }

  function addMilestone() {
    setMilestones((current) => [
      ...current,
      {
        views:
          (current[current.length - 1]?.views ?? 0) + 10000,
        payout: current[current.length - 1]?.payout ?? 0,
      },
    ]);
  }

  function removeMilestone(index: number) {
    setMilestones((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleCreateCampaign(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setNotice("");

    const budget = Number(totalBudget);

    if (!Number.isFinite(budget) || budget <= 0) {
      setError("Enter a valid positive campaign budget.");
      return;
    }

    if (
      milestones.length === 0 ||
      milestones.some(
        (m) =>
          !Number.isSafeInteger(m.views) ||
          m.views <= 0 ||
          !Number.isFinite(m.payout) ||
          m.payout < 0
      )
    ) {
      setError("Enter valid positive view thresholds and non-negative payouts.");
      return;
    }

    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].payout > budget) {
        setError("A milestone payout cannot exceed the campaign budget.");
        return;
      }

      if (
        i > 0 &&
        milestones[i].views <= milestones[i - 1].views
      ) {
        setError("View thresholds must be strictly increasing.");
        return;
      }

      if (
        i > 0 &&
        milestones[i].payout < milestones[i - 1].payout
      ) {
        setError("Milestone payouts must be non-decreasing.");
        return;
      }
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setCreating(true);

    try {
      const result = await apiRequest<CreateCampaignResponse>(
        "/api/campaigns",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            name: name.trim(),
            platform,
            totalBudget: budget,
            milestones,
          }),
        }
      );

      setCampaigns((current) => [
        result.campaign,
        ...current,
      ]);

      setName("");
      setPlatform("Instagram");
      setTotalBudget("10000");
      setMilestones(initialMilestones.map((m) => ({ ...m })));
      setNotice("Campaign created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create campaign"
      );
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  const totalBudgetValue = campaigns.reduce(
    (sum, campaign) => sum + campaign.totalBudget,
    0
  );

  const totalSpent = campaigns.reduce(
    (sum, campaign) => sum + campaign.spentBudget,
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading brand dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-xl font-bold">
            Meme<span className="text-violet-400">&apos;d</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:inline">
              Brand workspace
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div>
          <p className="text-sm font-medium text-violet-400">
            BRAND WORKSPACE
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Campaign dashboard
          </h1>
          <p className="mt-3 text-slate-400">
            Launch creator campaigns and monitor your budget.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total campaigns",
              value: String(campaigns.length),
            },
            {
              label: "Total budget",
              value: formatCurrency(totalBudgetValue),
            },
            {
              label: "Budget spent",
              value: formatCurrency(totalSpent),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl font-semibold">Your campaigns</h2>
            <p className="mt-1 text-sm text-slate-400">
              Campaign spending and milestone configuration.
            </p>

            {campaigns.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                <p className="font-medium">No campaigns yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Create your first campaign using the form.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {campaigns.map((campaign) => {
                  const budget = campaign.totalBudget;
                  const spent = campaign.spentBudget;
                  const remaining =
                    campaign.remainingBudget ?? budget - spent;
                  const percentage =
                    budget > 0
                      ? Math.min(100, (spent / budget) * 100)
                      : 0;

                  return (
                    <article
                      key={campaign._id ?? campaign.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {campaign.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {campaign.platform} · {campaign.milestones.length} milestones
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium capitalize text-emerald-300">
                          {campaign.status}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">
                            Total budget
                          </p>
                          <p className="mt-1 font-semibold">
                            {formatCurrency(budget)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Remaining
                          </p>
                          <p className="mt-1 font-semibold text-emerald-300">
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatCurrency(spent)} spent ·{" "}
                        {percentage.toFixed(1)}% of budget
                      </p>

                      <div className="mt-5 border-t border-slate-800 pt-4">
                        <p className="text-sm font-medium">Milestones</p>
                        <div className="mt-3 space-y-2">
                          {campaign.milestones.map((milestone) => (
                            <div
                              key={`${milestone.views}-${milestone.payout}`}
                              className="flex justify-between gap-3 text-sm"
                            >
                              <span className="text-slate-400">
                                {milestone.views.toLocaleString("en-IN")} views
                              </span>
                              <span className="font-medium">
                                {formatCurrency(milestone.payout)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Create a campaign</h2>
            <p className="mt-1 text-sm text-slate-400">
              Set your budget and define payout milestones.
            </p>

            <form onSubmit={handleCreateCampaign} className="mt-6 space-y-5">
              <div>
                <label htmlFor="campaign-name" className="mb-2 block text-sm font-medium">
                  Campaign name
                </label>
                <input
                  id="campaign-name"
                  required
                  minLength={2}
                  maxLength={150}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Summer Meme Campaign"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="platform" className="mb-2 block text-sm font-medium">
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(event) =>
                    setPlatform(event.target.value as "Instagram" | "YouTube")
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-violet-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="mb-2 block text-sm font-medium">
                  Total budget (INR)
                </label>
                <input
                  id="budget"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={totalBudget}
                  onChange={(event) => setTotalBudget(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">
                    Payout milestones
                  </label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="text-sm font-medium text-violet-400 hover:text-violet-300"
                  >
                    + Add milestone
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Each payout is the target total for that view threshold.
                </p>

                <div className="mt-3 space-y-3">
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-800 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">
                          Milestone {index + 1}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor={`views-${index}`}
                            className="mb-1 block text-xs text-slate-400"
                          >
                            View threshold
                          </label>
                          <input
                            id={`views-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            required
                            value={milestone.views}
                            onChange={(event) =>
                              updateMilestone(index, "views", event.target.value)
                            }
                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`payout-${index}`}
                            className="mb-1 block text-xs text-slate-400"
                          >
                            Target payout (₹)
                          </label>
                          <input
                            id={`payout-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={milestone.payout}
                            onChange={(event) =>
                              updateMilestone(index, "payout", event.target.value)
                            }
                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              {notice && (
                <p role="status" className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-300">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating campaign..." : "Create campaign"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
