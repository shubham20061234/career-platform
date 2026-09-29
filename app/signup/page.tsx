"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup() {
    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/";
      return;
    }

    setMessage(
      "Account created! Please check your email to verify your account."
    );

    setLoading(false);
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f8f6] px-6 py-16">
      <div className="w-full max-w-md">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Get started
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-3 text-black/60">
            Join the career platform and start exploring.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-7 shadow-sm">

          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full name
              </label>

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password
              </label>

              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={signup}
              disabled={loading}
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            {message && (
              <div className="rounded-lg bg-black/5 p-3 text-sm">
                {message}
              </div>
            )}

          </div>

          <div className="mt-6 border-t pt-6 text-center text-sm text-black/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}