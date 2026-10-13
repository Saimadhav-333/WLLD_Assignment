
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5 md:px-12">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Meme<span className="text-violet-400">&apos;d</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          Creator campaigns. Measurable results.
        </div>

        <h1 className="mt-8 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Turn attention into{" "}
          <span className="text-violet-400">measurable impact.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Launch creator campaigns, track content performance, and
          calculate milestone-based payouts with transparent budgets.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
          >
            Start a campaign
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-900"
          >
            Access dashboard
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
          {[
            {
              title: "Launch",
              description:
                "Create campaigns with budgets and view-based milestones.",
            },
            {
              title: "Track",
              description:
                "Manage submissions and monitor content performance.",
            },
            {
              title: "Reward",
              description:
                "Allocate payouts according to milestones and available budget.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-5 text-center text-sm text-slate-500">
        Meme&apos;d Campaign Payout Tracker
      </footer>
    </main>
  );
}
