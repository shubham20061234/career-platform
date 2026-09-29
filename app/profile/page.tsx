
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

type Profile = {
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  college: string;
  degree: string;
  graduation_year: string;
  career_goal: string;
  current_status: string;
  skills: string;
  experience: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  role: string;
};

const emptyProfile: Profile = {
  full_name: "",
  avatar_url: "",
  bio: "",
  location: "",
  college: "",
  degree: "",
  graduation_year: "",
  career_goal: "",
  current_status: "",
  skills: "",
  experience: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  role: "user",
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          full_name,
          avatar_url,
          bio,
          location,
          college,
          degree,
          graduation_year,
          career_goal,
          current_status,
          skills,
          experience,
          linkedin_url,
          github_url,
          portfolio_url,
          role
        `)
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({
          ...emptyProfile,
          ...data,
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const completion = useMemo(() => {
    const fields = [
      profile.full_name,
      profile.avatar_url,
      profile.bio,
      profile.location,
      profile.college,
      profile.degree,
      profile.graduation_year,
      profile.career_goal,
      profile.current_status,
      profile.skills,
      profile.experience,
      profile.linkedin_url,
      profile.github_url,
      profile.portfolio_url,
    ];

    const completed = fields.filter(
      (field) => field && field.trim() !== ""
    ).length;

    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  function updateField(field: keyof Profile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadAvatar(file: File) {
    if (!user) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (updateError) {
      setMessage(updateError.message);
      setUploading(false);
      return;
    }

    setProfile((current) => ({
      ...current,
      avatar_url: avatarUrl,
    }));

    setMessage("Profile photo updated successfully.");
    setUploading(false);

    window.dispatchEvent(new Event("profile-updated"));
  }

  async function saveProfile() {
    if (!user) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        location: profile.location,
        college: profile.college,
        degree: profile.degree,
        graduation_year: profile.graduation_year,
        career_goal: profile.career_goal,
        current_status: profile.current_status,
        skills: profile.skills,
        experience: profile.experience,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        profile_completed: completion,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile saved successfully.");
    setSaving(false);

    window.dispatchEvent(new Event("profile-updated"));
  }

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f8f6]">
        <p className="text-black/50">
          Loading your profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12 text-[#111] md:py-16">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Your Profile
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Complete your profile
            </h1>

            <p className="mt-3 max-w-2xl text-black/55">
              Tell us a little about yourself so your career profile
              feels complete.
            </p>
          </div>

          <button
            onClick={logout}
            className="w-fit rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-red-600 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Completion */}

        <section className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-black/50">
                Profile completion
              </p>

              <p className="mt-1 text-3xl font-bold">
                {completion}%
              </p>
            </div>

            <p className="text-sm text-black/50">
              {completion === 100
                ? "Profile complete 🎉"
                : "Keep going — you're doing great."}
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </section>

        {/* Basic Information */}

        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            01
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Basic information
          </h2>

          {/* Profile Photo */}

          <div className="mt-7 flex flex-col items-center gap-5 rounded-2xl border border-black/10 bg-[#f8f8f6] p-6 sm:flex-row">

            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl font-bold text-white ring-4 ring-white shadow-sm">
                {(profile.full_name || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="font-bold">
                Profile photo
              </h3>

              <p className="mt-1 text-sm text-black/50">
                Upload a JPG, PNG or other image up to 5MB.
              </p>

              <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600">
                {uploading ? "Uploading..." : "Choose image"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      uploadAvatar(file);
                    }

                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full name
              </label>

              <input
                value={profile.full_name}
                onChange={(e) =>
                  updateField("full_name", e.target.value)
                }
                placeholder="Your full name"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Location
              </label>

              <input
                value={profile.location}
                onChange={(e) =>
                  updateField("location", e.target.value)
                }
                placeholder="City, Country"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                About you
              </label>

              <textarea
                value={profile.bio}
                onChange={(e) =>
                  updateField("bio", e.target.value)
                }
                placeholder="Tell us a little about yourself..."
                rows={5}
                className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* Education */}

        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            02
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Education
          </h2>

          <div className="mt-7 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                College / School
              </label>

              <input
                value={profile.college}
                onChange={(e) =>
                  updateField("college", e.target.value)
                }
                placeholder="Your college or school"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Degree / Course
              </label>

              <input
                value={profile.degree}
                onChange={(e) =>
                  updateField("degree", e.target.value)
                }
                placeholder="e.g. B.Tech Computer Science"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Graduation year
              </label>

              <input
                value={profile.graduation_year}
                onChange={(e) =>
                  updateField("graduation_year", e.target.value)
                }
                placeholder="e.g. 2030"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* Career */}

        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            03
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Career
          </h2>

          <div className="mt-7 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Career goal
              </label>

              <input
                value={profile.career_goal}
                onChange={(e) =>
                  updateField("career_goal", e.target.value)
                }
                placeholder="What do you want to become?"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Current status
              </label>

              <select
                value={profile.current_status}
                onChange={(e) =>
                  updateField("current_status", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select your status</option>
                <option value="Student">Student</option>
                <option value="Looking for opportunities">
                  Looking for opportunities
                </option>
                <option value="Working">Working</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Entrepreneur">Entrepreneur</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Skills
              </label>

              <input
                value={profile.skills}
                onChange={(e) =>
                  updateField("skills", e.target.value)
                }
                placeholder="e.g. JavaScript, Python, UI Design"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Experience
              </label>

              <textarea
                value={profile.experience}
                onChange={(e) =>
                  updateField("experience", e.target.value)
                }
                placeholder="Projects, internships, work experience..."
                rows={4}
                className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* Links */}

        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            04
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Links
          </h2>

          <div className="mt-7 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                LinkedIn
              </label>

              <input
                value={profile.linkedin_url}
                onChange={(e) =>
                  updateField("linkedin_url", e.target.value)
                }
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                GitHub
              </label>

              <input
                value={profile.github_url}
                onChange={(e) =>
                  updateField("github_url", e.target.value)
                }
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Portfolio
              </label>

              <input
                value={profile.portfolio_url}
                onChange={(e) =>
                  updateField("portfolio_url", e.target.value)
                }
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* Account */}

        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Account
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div>
              <p className="text-sm font-semibold text-black/40">
                Email
              </p>

              <p className="mt-1 font-medium">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black/40">
                Account type
              </p>

              <p className="mt-1 font-medium capitalize">
                {profile.role || "user"}
              </p>
            </div>

          </div>
        </section>

        {/* Save */}

        <div className="sticky bottom-5 mt-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">

            <div>
              {message ? (
                <p className="text-sm font-medium">
                  {message}
                </p>
              ) : (
                <p className="text-sm text-black/50">
                  Save your profile to keep your information updated.
                </p>
              )}
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}

