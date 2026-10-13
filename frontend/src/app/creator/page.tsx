
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
  status: string;
};

type CampaignResponse = {
  success: boolean;
  count: number;
  campaigns: Campaign[];
};

type Submission = {
  _id?: string;
  id?: string;
  campaignId: string | { _id?: string; name?: string };
  campaign?: {
    _id?: string;
    name?: string;
    platform?: string;
    totalBudget?: number;
    spentBudget?: number;
    milestones?: Milestone[];
    status?: string;
  } | null;
  postUrl: string;
  views: number;
  payout: number;
  payoutStatus: "pending" | "paid" | "unfunded";
  createdAt?: string;
};

type SubmissionResponse = {
  success: boolean;
  count: number;
  submissions: Submission[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCampaignId(campaign: Campaign) {
  return campaign._id ?? campaign.id ?? "";
}

function getSubmissionId(submission: Submission) {
  return submission._id ?? submission.id ?? "";
}

function getCampaignName(submission: Submission) {
  if (submission.campaign?.name) {
    return submission.campaign.name;
  }

  if (
    typeof submission.campaignId === "object" &&
    submission.campaignId.name
  ) {
    return submission.campaignId.name;
  }

  return "Campaign";
}

export default function CreatorDashboard() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [postUrls, setPostUrls] = useState<Record<string, string>>({});
  const [viewInputs, setViewInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingCampaign, setSubmittingCampaign] = useState("");
  const [updatingSubmission, setUpdatingSubmission] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [campaignResult, submissionResult] = await Promise.all([
        apiRequest<CampaignResponse>("/api/campaigns", { token }),
        apiRequest<SubmissionResponse>("/api/submissions/mine", { token }),
      ]);

      setCampaigns(campaignResult.campaigns);
      setSubmissions(submissionResult.submissions);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load dashboard";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleSubmitPost(
    event: FormEvent<HTMLFormElement>,
    campaign: Campaign
  ) {
    event.preventDefault();
    setError("");
    setNotice("");

    const campaignId = getCampaignId(campaign);
    const postUrl = postUrls[campaignId]?.trim();

    if (!campaignId || !postUrl) {
      setError("Enter a post URL before submitting.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSubmittingCampaign(campaignId);

    try {
      await apiRequest("/api/submissions", {
        method: "POST",
        token,
        body: JSON.stringify({ campaignId, postUrl }),
      });

      setPostUrls((current) => ({
        ...current,
        [campaignId]: "",
      }));

      setNotice(`Your post was submitted to ${campaign.name}.`);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit post"
      );
    } finally {
      setSubmittingCampaign("");
    }
  }

  async function handleUpdateViews(submission: Submission) {
    const submissionId = getSubmissionId(submission);
    const rawViews = viewInputs[submissionId];

    if (!submissionId || rawViews === undefined || rawViews.trim() === "") {
      setError("Enter a view count first.");
      return;
    }

    const views = Number(rawViews);

    if (!Number.isSafeInteger(views) || views < 0) {
      setError("Views must be a non-negative whole number.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setNotice("");
    setUpdatingSubmission(submissionId);

    try {
      await apiRequest(`/api/submissions/${submissionId}/views`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ views }),
      });

      setNotice("Views and payout information updated.");
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update views"
      );
    } finally {
      setUpdatingSubmission("");
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  const totalEarnings = submissions.reduce(
    (sum, submission) => sum + submission.payout,
    0
  );

  const totalViews = submissions.reduce(
    (sum, submission) => sum + submission.views,
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading creator dashboard...
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
              Creator workspace
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
        <p className="text-sm font-medium text-violet-400">
          CREATOR WORKSPACE
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Your creator dashboard
        </h1>
        <p className="mt-3 text-slate-400">
          Discover campaigns, submit content, and track your performance.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Your submissions",
              value: String(submissions.length),
            },
            {
              label: "Total views",
              value: totalViews.toLocaleString("en-IN"),
            },
            {
              label: "Allocated earnings",
              value: formatCurrency(totalEarnings),
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

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-emerald-900 bg-emerald-950 p-4 text-sm text-emerald-200"
          >
            {notice}
          </p>
        )}

        <section className="mt-10">
          <div>
            <h2 className="text-xl font-semibold">Live campaigns</h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose a campaign and submit your content link.
            </p>
          </div>

          {campaigns.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No live campaigns are available right now.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {campaigns.map((campaign) => {
                const campaignId = getCampaignId(campaign);
                const alreadySubmitted = submissions.some((submission) => {
                  const id =
                    typeof submission.campaignId === "string"
                      ? submission.campaignId
                      : submission.campaignId?._id ??
                        submission.campaign?._id;

                  return id === campaignId;
                });

                const remaining =
                  campaign.remainingBudget ??
                  campaign.totalBudget - campaign.spentBudget;

                return (
                  <article
                    key={campaignId}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {campaign.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {campaign.platform}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        Live
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Campaign budget
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatCurrency(campaign.totalBudget)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">
                          Budget remaining
                        </p>
                        <p className="mt-1 font-semibold text-emerald-300">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-800 pt-4">
                      <p className="text-sm font-medium">
                        Payout milestones
                      </p>
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

                    <form
                      onSubmit={(event) =>
                        handleSubmitPost(event, campaign)
                      }
                      className="mt-5 border-t border-slate-800 pt-4"
                    >
                      {alreadySubmitted ? (
                        <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
                          You have already submitted to this campaign.
                        </p>
                      ) : remaining <= 0 ? (
                        <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
                          This campaign has no budget remaining.
                        </p>
                      ) : (
                        <>
                          <label
                            htmlFor={`post-${campaignId}`}
                            className="mb-2 block text-sm font-medium"
                          >
                            Your {campaign.platform} post URL
                          </label>
                          <input
                            id={`post-${campaignId}`}
                            type="url"
                            required
                            value={postUrls[campaignId] ?? ""}
                            onChange={(event) =>
                              setPostUrls((current) => ({
                                ...current,
                                [campaignId]: event.target.value,
                              }))
                            }
                            placeholder={
                              campaign.platform === "Instagram"
                                ? "https://www.instagram.com/p/..."
                                : "https://www.youtube.com/watch?v=..."
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-violet-500"
                          />

                          <button
                            type="submit"
                            disabled={submittingCampaign === campaignId}
                            className="mt-3 w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500 disabled:opacity-60"
                          >
                            {submittingCampaign === campaignId
                              ? "Submitting..."
                              : "Submit post"}
                          </button>
                        </>
                      )}
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Your submissions</h2>
          <p className="mt-1 text-sm text-slate-400">
            Monitor views and allocated milestone earnings.
          </p>

          {submissions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              Your submissions will appear here after you submit a post.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {submissions.map((submission) => {
                const submissionId = getSubmissionId(submission);

                return (
                  <article
                    key={submissionId}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {getCampaignName(submission)}
                        </h3>
                        <a
                          href={submission.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block max-w-full break-all text-sm text-violet-400 hover:text-violet-300"
                        >
                          {submission.postUrl}
                        </a>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          submission.payoutStatus === "paid"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : submission.payoutStatus === "unfunded"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {submission.payoutStatus}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-400">Views</p>
                        <p className="mt-1 font-semibold">
                          {submission.views.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">
                          Allocated earnings
                        </p>
                        <p className="mt-1 font-semibold text-emerald-300">
                          {formatCurrency(submission.payout)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Submitted</p>
                        <p className="mt-1 text-sm">
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-800 pt-4">
                      <label
                        htmlFor={`views-${submissionId}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Simulate a view update
                      </label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          id={`views-${submissionId}`}
                          type="number"
                          min={submission.views}
                          step="1"
                          value={viewInputs[submissionId] ?? ""}
                          onChange={(event) =>
                            setViewInputs((current) => ({
                              ...current,
                              [submissionId]: event.target.value,
                            }))
                          }
                          placeholder="Enter updated view count"
                          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-violet-500"
                        />

                        <button
                          type="button"
                          onClick={() => void handleUpdateViews(submission)}
                          disabled={updatingSubmission === submissionId}
                          className="rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                        >
                          {updatingSubmission === submissionId
                            ? "Updating..."
                            : "Update views"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        This is a simulated update for the assignment, not
                        automatic social-platform analytics.
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
