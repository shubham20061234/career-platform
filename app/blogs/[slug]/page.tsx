
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

type BlogPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPage({
  params,
}: BlogPageProps) {
  const { slug } = await params;

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !blog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111]">
      <article className="mx-auto max-w-4xl px-6 py-16 md:py-24">

        <Link
          href="/blogs"
          className="inline-flex items-center text-sm font-semibold text-black/60 transition hover:text-blue-600"
        >
          ← Back to Blogs
        </Link>

        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            {blog.category || "Career"}
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {blog.title}
          </h1>

          {blog.description && (
            <p className="mt-6 text-lg leading-8 text-black/55 md:text-xl">
              {blog.description}
            </p>
          )}
        </div>

        {blog.cover_image_url && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="max-h-[550px] w-full object-cover"
            />
          </div>
        )}

        <div className="mt-12 rounded-3xl border border-black/10 bg-white p-7 shadow-sm md:p-10">
          <div className="whitespace-pre-wrap text-base leading-8 text-black/75 md:text-lg">
            {blog.content || "This article does not have any content yet."}
          </div>
        </div>

        <div className="mt-10 border-t border-black/10 pt-8">
          <Link
            href="/blogs"
            className="inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            ← Browse all blogs
          </Link>
        </div>

      </article>
    </main>
  );
}