
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, saveAuth } from "@/lib/api";

type AuthResponse = {
  success: boolean;
  token: string;
  user: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: "brand" | "creator";
  };
};

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"brand" | "creator">("creator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!result.token || !result.user) {
        throw new Error("Invalid signup response from server");
      }

      saveAuth(result.token);

      router.replace(
        result.user.role === "brand" ? "/brand" : "/creator"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <Link
          href="/"
          className="text-sm font-medium text-violet-400 hover:text-violet-300"
        >
          ← Meme&apos;d
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">
          Join Meme&apos;d to launch campaigns or earn through content.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="At least 8 characters"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              I want to join as
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("creator")}
                aria-pressed={role === "creator"}
                className={`rounded-lg border p-3 text-sm font-medium ${
                  role === "creator"
                    ? "border-violet-500 bg-violet-950 text-violet-200"
                    : "border-slate-700 bg-slate-950 text-slate-300"
                }`}
              >
                Creator
              </button>

              <button
                type="button"
                onClick={() => setRole("brand")}
                aria-pressed={role === "brand"}
                className={`rounded-lg border p-3 text-sm font-medium ${
                  role === "brand"
                    ? "border-violet-500 bg-violet-950 text-violet-200"
                    : "border-slate-700 bg-slate-950 text-slate-300"
                }`}
              >
                Brand
              </button>
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-950 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
