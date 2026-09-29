
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

    window.addEventListener(
      "profile-updated",
      handleProfileUpdate
    );

    return () => {
      subscription.unsubscribe();

      window.removeEventListener(
        "profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          Career<span className="text-blue-600">Platform</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">

          <Link
            href="/"
            className="hidden text-sm font-medium text-black/70 hover:text-blue-600 sm:block"
          >
            Home
          </Link>

          <Link
            href="/blogs"
            className="hidden text-sm font-medium text-black/70 hover:text-blue-600 sm:block"
          >
            Blogs
          </Link>

          <Link
            href="/resources"
            className="hidden text-sm font-medium text-black/70 hover:text-blue-600 sm:block"
          >
            Resources
          </Link>

          <Link
            href="/videos"
            className="hidden text-sm font-medium text-black/70 hover:text-blue-600 sm:block"
          >
            Videos
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="hidden rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 sm:block"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    title={fullName || user.email || "Profile"}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black text-sm font-bold text-white transition hover:ring-2 hover:ring-blue-500 hover:ring-offset-2"
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
                  <Link
                    href="/login"
                    className="text-sm font-medium text-black/70 hover:text-blue-600"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
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
