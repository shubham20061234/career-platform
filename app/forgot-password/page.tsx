"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    setMessage(
      error
        ? error.message
        : "If an account exists for that email, a password-reset link has been sent."
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-6 py-16 text-[#111]">
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_30px_100px_rgba(0,0,0,0.10)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
            Account recovery
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            Reset your password.
          </h1>
          <p className="mt-4 text-sm leading-6 text-black/50">
            Enter your account email and we&apos;ll send you a secure reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm outline-none focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#163A5F] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0B2742] disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            {message && (
              <p className="rounded-xl border border-black/10 bg-[#f7f7f4] p-4 text-sm font-semibold text-black/65">
                {message}
              </p>
            )}
          </form>

          <Link href="/login" className="mt-6 inline-block text-sm font-bold text-[#163A5F]">
            ← Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
