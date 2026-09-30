"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setLoading(false);
        if (!data.session) {
          setMessage("This reset link is invalid or has expired.");
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully. Redirecting...");
    setTimeout(() => router.replace("/login"), 1200);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-6 py-16 text-[#111]">
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_30px_100px_rgba(0,0,0,0.10)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
            Account recovery
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            Choose a new password.
          </h1>

          {loading && !message ? (
            <p className="mt-6 text-sm text-black/50">Checking reset session...</p>
          ) : message && !password ? (
            <p className="mt-6 rounded-xl border border-black/10 bg-[#f7f7f4] p-4 text-sm font-semibold text-black/65">
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm outline-none focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm outline-none focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#163A5F] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0B2742] disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
              {message && (
                <p className="rounded-xl border border-black/10 bg-[#f7f7f4] p-4 text-sm font-semibold text-black/65">
                  {message}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
