"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

      setFullName(data?.full_name || "");
      setAvatarUrl(data?.avatar_url || "");
      setIsAdmin(data?.role === "admin");
    } else {
      setFullName("");
      setAvatarUrl("");
      setIsAdmin(false);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    function handleProfileUpdate() {
      loadProfile();
    }

    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(
        "profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6">

        {/* BRAND */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          {/* LOGO */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-black tracking-tight text-white shadow-md shadow-blue-600/20 transition group-hover:scale-105 group-hover:bg-blue-700">
            CP
          </div>

          {/* NAME */}
          <div className="leading-none">
            <div className="text-[17px] font-extrabold tracking-tight text-[#111827]">
              Career
              <span className="text-blue-600">Platform</span>
            </div>

            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
              Build Your Future
            </div>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-2 sm:gap-4">

          <Link
            href="/"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475569] transition hover:bg-blue-50 hover:text-blue-600 sm:block"
          >
            Home
          </Link>

          <Link
            href="/blogs"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475569] transition hover:bg-blue-50 hover:text-blue-600 sm:block"
          >
            Blogs
          </Link>

          <Link
            href="/resources"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475569] transition hover:bg-blue-50 hover:text-blue-600 sm:block"
          >
            Resources
          </Link>

          <Link
            href="/videos"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475569] transition hover:bg-blue-50 hover:text-blue-600 sm:block"
          >
            Videos
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  {/* ADMIN */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="hidden rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-md hover:shadow-blue-600/20 sm:block"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* PROFILE */}
                  <Link
                    href="/profile"
                    title={fullName || user.email || "Profile"}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-600 text-sm font-bold text-white shadow-md ring-1 ring-[#dbe3ee] transition hover:ring-2 hover:ring-blue-500 hover:ring-offset-2"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (
                        fullName ||
                        user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </Link>
                </>
              ) : (
                <>
                  {/* LOGIN */}
                  <Link
                    href="/login"
                    className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475569] transition hover:bg-blue-50 hover:text-blue-600 sm:block"
                  >
                    Login
                  </Link>

                  {/* SIGN UP */}
                  <Link
                    href="/signup"
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}