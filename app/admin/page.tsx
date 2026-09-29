import Link from "next/link";

import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: blogCount },
    { count: resourceCount },
    { count: videoCount },
    { data: careerCards },
  ] = await Promise.all([
    supabase
      .from("blogs")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("resources")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("videos")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("career_cards")
      .select("id, title, category, published")
      .order("id", { ascending: true })
      .limit(6),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111]">
      {/* HEADER */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-black/55">
            Manage your platform content, homepage career cards and
            published resources from one place.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <p className="text-sm font-medium text-black/50">Blogs</p>

            <p className="mt-2 text-4xl font-bold">
              {blogCount ?? 0}
            </p>

            <Link
              href="/admin/blogs"
              className="mt-5 inline-block text-sm font-semibold text-blue-600"
            >
              Manage Blogs →
            </Link>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <p className="text-sm font-medium text-black/50">
              Resources
            </p>

            <p className="mt-2 text-4xl font-bold">
              {resourceCount ?? 0}
            </p>

            <Link
              href="/admin/resources"
              className="mt-5 inline-block text-sm font-semibold text-blue-600"
            >
              Manage Resources →
            </Link>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <p className="text-sm font-medium text-black/50">
              Videos
            </p>

            <p className="mt-2 text-4xl font-bold">
              {videoCount ?? 0}
            </p>

            <Link
              href="/admin/videos"
              className="mt-5 inline-block text-sm font-semibold text-blue-600"
            >
              Manage Videos →
            </Link>
          </div>
        </div>
      </section>

      {/* CAREER CARDS MANAGER */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Homepage
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Career Cards Manager
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                Manage the six existing career cards shown on the
                homepage. You can edit their content or hide/show them.
              </p>
            </div>

            <Link
              href="/admin/career-cards"
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Manage All 6 Cards →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {careerCards?.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-black/10 bg-[#f8f8f6] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {card.category || "Career"}
                    </p>

                    <h3 className="mt-2 font-bold leading-snug">
                      {card.title}
                    </h3>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      card.published
                        ? "bg-green-100 text-green-700"
                        : "bg-black/10 text-black/50"
                    }`}
                  >
                    {card.published ? "Live" : "Hidden"}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <Link
                    href={`/admin/career-cards?edit=${card.id}`}
                    className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                  >
                    ✏️ Edit
                  </Link>

                  <Link
                    href="/admin/career-cards"
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold hover:bg-black hover:text-white"
                  >
                    ⚙️ Settings
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-6">
            <Link
              href="/admin/contact-links"
              className="group block max-w-md rounded-2xl border border-black/10 p-6 transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-600 group-hover:text-white">
                  📞
                </div>

                <div>
                  <p className="font-bold">
                    Contact Info
                  </p>

                  <p className="mt-1 text-sm text-black/50">
                    Edit the social media, email and contact links
                    shown on the homepage.
                  </p>
                </div>
              </div>

              <div className="mt-5 text-sm font-semibold text-blue-600">
                Manage Contact Info →
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}