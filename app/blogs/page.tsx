import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export default async function BlogsPage() {
  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111]">
      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Knowledge • Experience • Growth
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Ideas that help you
          <br />
          <span className="text-blue-600">move forward.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-black/55">
          Explore career advice, education, skills, jobs and practical
          resources from the creator.
        </p>
      </section>

      {/* BLOGS */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-bold text-red-700">
                Unable to load blogs right now.
              </h2>

              <p className="mt-2 text-sm text-red-600">
                {error.message}
              </p>
            </div>
          ) : !blogs || blogs.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-[#f8f8f6] p-10 text-center">
              <h2 className="text-2xl font-bold">
                No published blogs yet
              </h2>

              <p className="mt-2 text-black/50">
                Published articles will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, index) => (
                <article
                  key={blog.id}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-[#f8f8f6] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {blog.cover_image_url ? (
                    <img
                      src={blog.cover_image_url}
                      alt={blog.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-56 ${
                        index % 3 === 0
                          ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                          : index % 3 === 1
                            ? "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600"
                            : "bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500"
                      }`}
                    />
                  )}

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {blog.category || "Career"}
                    </p>

                    <h2 className="mt-3 text-xl font-bold leading-snug">
                      {blog.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-black/50">
                      {blog.description ||
                        "Read this article to learn more."}
                    </p>

                    {blog.slug && (
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="mt-6 inline-block text-sm font-semibold hover:text-blue-600"
                      >
                        Read article →
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}