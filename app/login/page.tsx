"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    setMessage("Login successful!");

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f8f6] px-6 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Welcome back
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Login to your account
          </h1>

          <p className="mt-3 text-black/60">
            Access your career platform account.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 rounded-2xl border bg-white p-7 shadow-sm">

          <div className="space-y-5">

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    login();
                  }
                }}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Login Button */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Message */}
            {message && (
              <div className="rounded-lg bg-black/5 p-3 text-sm">
                {message}
              </div>
            )}

          </div>

          {/* Signup */}
          <div className="mt-6 border-t pt-6 text-center text-sm text-black/60">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Create one
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}