
"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setMessage("Please accept the terms and conditions.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name.trim(),
        email: email.trim(),
      });

      if (profileError) {
        console.warn("Profile creation failed:", profileError.message);
      }
    }

    if (data.session) {
      router.replace("/profile");
      router.refresh();
      return;
    }

    setMessage("Account created. Check your email to verify your account, then log in.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5f2] text-[#111]">

      {/* BACKGROUND GRID */}

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* NAVY GLOW */}

      <div className="pointer-events-none fixed left-1/2 top-[15%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      {/* MAIN */}

      <section className="relative flex min-h-screen items-center justify-center px-6 py-16">

        <div className="w-full max-w-md">

          {/* TOP LABEL */}

          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#163A5F]" />

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#163A5F]">
              Career Platform
            </span>

            <span className="h-px w-10 bg-[#163A5F]" />
          </div>

          {/* CARD */}

          <div className="rounded-[2rem] border border-black/10 bg-white/90 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.10)] backdrop-blur-xl md:p-9">

            {/* HEADING */}

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
                Get started
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Create your
                <br />

                <span className="text-black/25">
                  account.
                </span>
              </h1>

              <p className="mt-4 text-sm leading-6 text-black/45">
                Join the platform and start exploring careers,
                skills, education and opportunities.
              </p>
            </div>

            {/* FORM */}

            <form className="space-y-5" onSubmit={handleSignup}>

              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-black/25 focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-black/25 focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 pr-20 text-sm outline-none transition-all duration-300 placeholder:text-black/25 focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#163A5F] transition-colors hover:bg-[#163A5F]/10"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* TERMS */}

              <label className="flex cursor-pointer items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#163A5F]"
                />

                <span className="text-xs leading-5 text-black/45">
                  I agree to the terms and conditions and understand
                  how my account information will be used.
                </span>
              </label>

              {/* SIGN UP BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#163A5F] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(22,58,95,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B2742] hover:shadow-[0_18px_40px_rgba(22,58,95,0.28)]"
              >
                {loading ? "Creating account..." : "Create account"}

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/20">
                  →
                </span>
              </button>

              {message && (
                <div className="rounded-xl border border-black/10 bg-[#f7f7f4] p-4 text-sm font-semibold text-black/65">
                  {message}
                </div>
              )}
            </form>

            {/* LOGIN */}

            <div className="mt-7 border-t border-black/10 pt-6 text-center">
              <p className="text-sm text-black/40">
                Already have an account?
              </p>

              <Link
                href="/login"
                className="mt-2 inline-block text-sm font-bold text-[#163A5F] transition-colors hover:text-[#0B2742]"
              >
                Log in
              </Link>
            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-7 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-black/25">
            <span>
              Knowledge • Experience • Growth
            </span>

            <span>
              © Career Platform
            </span>
          </div>

        </div>
      </section>
    </main>
  );
}

